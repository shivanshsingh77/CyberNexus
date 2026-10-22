import test, { describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { validateUrlForSSRF } from '../utils/ssrfValidator.js';

let server;
let baseUrl;
const TEST_PORT = 5089;

describe('CyberNexus Website Security Scanner & SSRF Defense Suite', () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(TEST_PORT, () => {
        baseUrl = `http://localhost:${TEST_PORT}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // Test 1: SSRF Blocks Loopback 127.0.0.1
  test('1. SSRF Validator blocks loopback IP 127.0.0.1', async () => {
    const result = await validateUrlForSSRF('http://127.0.0.1:8080');
    assert.equal(result.valid, false);
    assert.match(result.reason, /blocked/i);
  });

  // Test 2: SSRF Blocks Localhost hostname
  test('2. SSRF Validator blocks localhost domain', async () => {
    const result = await validateUrlForSSRF('http://localhost:5000/api/users');
    assert.equal(result.valid, false);
    assert.match(result.reason, /loopback|blocked/i);
  });

  // Test 3: SSRF Blocks Cloud Metadata IP (169.254.169.254)
  test('3. SSRF Validator blocks AWS/GCP/Azure cloud metadata endpoint (169.254.169.254)', async () => {
    const result = await validateUrlForSSRF('http://169.254.169.254/latest/meta-data/');
    assert.equal(result.valid, false);
    assert.match(result.reason, /private|reserved|blocked/i);
  });

  // Test 4: SSRF Blocks Private Subnets (192.168.x.x, 10.x.x.x)
  test('4. SSRF Validator blocks private internal LAN subnets', async () => {
    const result192 = await validateUrlForSSRF('http://192.168.1.1/admin');
    assert.equal(result192.valid, false);

    const result10 = await validateUrlForSSRF('http://10.0.0.5:8000');
    assert.equal(result10.valid, false);

    const result172 = await validateUrlForSSRF('http://172.16.50.1');
    assert.equal(result172.valid, false);
  });

  // Test 5: Rejects Invalid Protocols (file://, ftp://)
  test('5. SSRF Validator rejects non-HTTP/HTTPS protocols', async () => {
    const fileResult = await validateUrlForSSRF('file:///etc/passwd');
    assert.equal(fileResult.valid, false);
    assert.match(fileResult.reason, /unsupported protocol/i);

    const ftpResult = await validateUrlForSSRF('ftp://files.example.com');
    assert.equal(ftpResult.valid, false);
  });

  // Test 6: API Endpoint Rejection of Blocked Target
  test('6. POST /api/scanner/scan returns HTTP 400 when SSRF target is provided', async () => {
    const res = await fetch(`${baseUrl}/api/scanner/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1:5000' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.isSSRFBlocked, true);
  });

  // Test 7: API Endpoint Rejection of Empty URL
  test('7. POST /api/scanner/scan rejects missing or empty URL', async () => {
    const res = await fetch(`${baseUrl}/api/scanner/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  // Test 8: Live Header Scanning on a Public URL (example.com)
  test('8. POST /api/scanner/scan inspects a public URL and returns headers scorecard', async () => {
    const res = await fetch(`${baseUrl}/api/scanner/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.scannedUrl);
    assert.ok(typeof data.overallScore === 'number');
    assert.ok(['A+', 'A', 'B', 'C', 'D', 'F'].includes(data.grade));
    assert.ok(Array.isArray(data.checks));
    assert.ok(data.checks.length >= 5);
    assert.ok(data.disclaimer);
  });
});
