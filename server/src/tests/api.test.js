import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

let server;
let baseUrl;
const TEST_PORT = 5088;

describe('CyberNexus Application Security Platform - API Test Suite', () => {
  before(async () => {
    // Ensure DB connection
    await connectDB();
    // Clean up test user collection if exists
    await User.deleteMany({ email: { $regex: /testuser.*@example\.com/ } });

    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        baseUrl = `http://localhost:${TEST_PORT}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up
    await User.deleteMany({ email: { $regex: /testuser.*@example\.com/ } });
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  });

  // 1. Health check & DB connection
  test('1. Health check returns 200 and confirms database connection', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.database, 'connected');
  });

  // 2. Security Headers (Helmet)
  test('2. Helmet security headers are enforced and X-Powered-By is suppressed', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.ok(res.headers.has('content-security-policy'));
    assert.equal(res.headers.get('x-powered-by'), null); // Framework hiding
  });

  // 3. Server-side Input Validation
  test('3. Rejects invalid registration inputs with HTTP 400 (short password, bad email)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ab', // too short (<3)
        email: 'not-an-email',
        password: 'weak', // too short (<8)
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.ok(Array.isArray(data.errors));
    assert.ok(data.errors.length >= 3);
  });

  // 4. Successful Registration
  let testUserToken = '';
  let testUserCookie = '';
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123!#';

  test('4. Successful user registration returns 201, safe user object, and sets HTTP-only cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `secuser_${Date.now()}`,
        email: testEmail,
        password: testPassword,
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.user.email, testEmail);
    assert.equal(data.user.password, undefined); // Password never leaked
    assert.ok(data.token);
    testUserToken = data.token;

    // Check Set-Cookie header contains token with HttpOnly
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    assert.ok(setCookie.includes('token='));
    assert.ok(setCookie.toLowerCase().includes('httponly'));
    assert.ok(setCookie.toLowerCase().includes('samesite=lax'));
    testUserCookie = setCookie.split(';')[0];
  });

  // 5. Password Hash Storage in MongoDB
  test('5. Passwords are saved strictly as bcrypt hashes in MongoDB (never plaintext)', async () => {
    const userDoc = await User.findOne({ email: testEmail }).select('+password');
    assert.ok(userDoc);
    assert.notEqual(userDoc.password, testPassword);
    // Bcrypt signature: $2a$ or $2b$ followed by cost factor (12)
    assert.match(userDoc.password, /^\$2[ab]\$12\$/);
  });

  // 6. Duplicate Registration Rejection
  test('6. Rejects duplicate registration with identical email with HTTP 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `diffname_${Date.now()}`,
        email: testEmail, // same email
        password: testPassword,
      }),
    });

    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /already exists/i);
  });

  // 7. Incorrect Password Rejection
  test('7. Rejects login with incorrect password with HTTP 401 (generic message)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword999!',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /invalid email or password/i);
  });

  // 8. Successful Login
  test('8. Successful login verifies hash, returns 200, updates lastLogin, and issues session cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.user.lastLogin);
    assert.ok(data.token);
  });

  // 9. Protected Route Rejection without Auth
  test('9. Accessing protected profile route without credentials returns HTTP 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/users/profile`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // 10. Protected Route Access with Auth (Cookie & Bearer Header)
  test('10. Accessing protected profile route with valid auth cookie returns HTTP 200', async () => {
    const res = await fetch(`${baseUrl}/api/users/profile`, {
      headers: {
        Cookie: testUserCookie,
      },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.email, testEmail);
  });

  test('10b. Accessing protected profile route with Bearer token header returns HTTP 200', async () => {
    const res = await fetch(`${baseUrl}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.email, testEmail);
  });

  // 11. Logout and Session Invalidation
  test('11. Logout endpoint clears authentication cookie and returns 200', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
    });
    assert.equal(res.status, 200);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie);
    // Cookie should be expired or empty
    assert.ok(
      setCookie.includes('token=;') ||
      setCookie.includes('Expires=Thu, 01 Jan 1970') ||
      setCookie.includes('Max-Age=0')
    );
  });

  // 12. Security Audit Probe Endpoint
  test('12. Real-time Security Audit endpoint runs live checks and returns scorecard', async () => {
    const res = await fetch(`${baseUrl}/api/audit/run`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.overallScore >= 90);
    assert.ok(Array.isArray(data.tests));
    assert.ok(data.tests.length >= 8);
    // Verify each test has required college report fields
    for (const item of data.tests) {
      assert.ok(item.testName);
      assert.ok(item.expected);
      assert.ok(item.actual);
      assert.ok(item.status);
      assert.ok(item.fix);
    }
  });

  // 13. Malformed JSON handling
  test('13. Malformed JSON payload safely returns HTTP 400 without crashing server', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid_json": true,', // Broken JSON
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /malformed json/i);
  });

  // 14. 404 Route handling
  test('14. Undefined API route returns structured HTTP 404 message', async () => {
    const res = await fetch(`${baseUrl}/api/non_existent_route`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
  });
});
