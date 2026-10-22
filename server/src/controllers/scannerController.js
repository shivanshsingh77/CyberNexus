import { safeFetchHeaders, validateUrlForSSRF } from '../utils/ssrfValidator.js';

/**
 * Controller to scan a public URL for HTTP Security Headers.
 */
export const scanWebsiteHeaders = async (req, res) => {
  let { url } = req.body;

  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid website URL to scan.',
    });
  }

  url = url.trim();

  // If user omitted protocol, default to https://
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Pre-validate SSRF
  const preCheck = await validateUrlForSSRF(url);
  if (!preCheck.valid) {
    return res.status(400).json({
      success: false,
      message: `Invalid or Restricted Target: ${preCheck.reason}`,
      isSSRFBlocked: true,
    });
  }

  try {
    const { response, finalUrl } = await safeFetchHeaders(url);
    const headers = response.headers;

    const rawHeaders = {};
    for (const [key, value] of headers.entries()) {
      rawHeaders[key.toLowerCase()] = value;
    }

    const checks = [];
    let score = 100;

    // 1. Content-Security-Policy (CSP)
    const csp = rawHeaders['content-security-policy'];
    if (csp) {
      checks.push({
        name: 'Content-Security-Policy (CSP)',
        header: 'Content-Security-Policy',
        status: 'PASS',
        weight: 25,
        value: csp.length > 120 ? `${csp.substring(0, 120)}...` : csp,
        explanation: 'CSP is present. Restricts untrusted script execution and mitigates Cross-Site Scripting (XSS).',
        recommendation: 'Periodically review script-src directives and eliminate unsafe-inline where possible.',
      });
    } else {
      score -= 25;
      checks.push({
        name: 'Content-Security-Policy (CSP)',
        header: 'Content-Security-Policy',
        status: 'WARNING',
        weight: 25,
        value: 'Not Set',
        explanation: 'No Content-Security-Policy header detected. Browsers may execute injected scripts if an XSS flaw exists.',
        recommendation: 'Define a strict CSP with default-src "self" and explicit trusted script origins.',
      });
    }

    // 2. Strict-Transport-Security (HSTS)
    const hsts = rawHeaders['strict-transport-security'];
    if (hsts) {
      const maxAgeMatch = hsts.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
      const isAdequate = maxAge >= 10368000; // at least ~120 days

      if (isAdequate) {
        checks.push({
          name: 'Strict-Transport-Security (HSTS)',
          header: 'Strict-Transport-Security',
          status: 'PASS',
          weight: 20,
          value: hsts,
          explanation: `HSTS enforces encrypted HTTPS connections for ${Math.round(maxAge / 86400)} days. Mitigates SSL-stripping man-in-the-middle attacks.`,
          recommendation: 'Ensure includeSubDomains and preload flags are present for maximum coverage.',
        });
      } else {
        score -= 10;
        checks.push({
          name: 'Strict-Transport-Security (HSTS)',
          header: 'Strict-Transport-Security',
          status: 'WARNING',
          weight: 20,
          value: hsts,
          explanation: `HSTS is present but has a short duration (${Math.round(maxAge / 86400)} days). Recommended minimum is at least 6 months to 1 year.`,
          recommendation: 'Increase max-age to 31536000 (1 year).',
        });
      }
    } else {
      score -= 20;
      checks.push({
        name: 'Strict-Transport-Security (HSTS)',
        header: 'Strict-Transport-Security',
        status: 'FAIL',
        weight: 20,
        value: 'Not Set',
        explanation: 'HSTS is missing. Users connecting via HTTP could be vulnerable to SSL-stripping and protocol downgrade attacks.',
        recommendation: 'Configure Strict-Transport-Security: max-age=31536000; includeSubDomains.',
      });
    }

    // 3. X-Frame-Options
    const xfo = rawHeaders['x-frame-options'];
    if (xfo) {
      const upper = xfo.toUpperCase();
      if (upper.includes('DENY') || upper.includes('SAMEORIGIN')) {
        checks.push({
          name: 'X-Frame-Options',
          header: 'X-Frame-Options',
          status: 'PASS',
          weight: 15,
          value: xfo,
          explanation: `Configured to "${xfo}". Blocks unauthorized iframe embedding, preventing Clickjacking.`,
          recommendation: 'Keep setting DENY or SAMEORIGIN.',
        });
      } else {
        score -= 5;
        checks.push({
          name: 'X-Frame-Options',
          header: 'X-Frame-Options',
          status: 'WARNING',
          weight: 15,
          value: xfo,
          explanation: `Permissive or non-standard value "${xfo}" detected.`,
          recommendation: 'Use DENY or SAMEORIGIN, or CSP frame-ancestors.',
        });
      }
    } else if (csp && csp.includes('frame-ancestors')) {
      checks.push({
        name: 'X-Frame-Options (via CSP)',
        header: 'Content-Security-Policy (frame-ancestors)',
        status: 'PASS',
        weight: 15,
        value: 'Handled by CSP frame-ancestors',
        explanation: 'Clickjacking is mitigated modernly via CSP frame-ancestors directive.',
        recommendation: 'Consider adding X-Frame-Options: SAMEORIGIN for legacy browser support.',
      });
    } else {
      score -= 15;
      checks.push({
        name: 'X-Frame-Options',
        header: 'X-Frame-Options',
        status: 'WARNING',
        weight: 15,
        value: 'Not Set',
        explanation: 'Missing framing protections. Page can be embedded in malicious iframes to perform Clickjacking.',
        recommendation: 'Add X-Frame-Options: SAMEORIGIN or CSP frame-ancestors directive.',
      });
    }

    // 4. X-Content-Type-Options
    const xcto = rawHeaders['x-content-type-options'];
    if (xcto && xcto.toLowerCase().includes('nosniff')) {
      checks.push({
        name: 'X-Content-Type-Options',
        header: 'X-Content-Type-Options',
        status: 'PASS',
        weight: 15,
        value: xcto,
        explanation: 'Set to "nosniff". Prevents browsers from guessing MIME types, mitigating drive-by script execution.',
        recommendation: 'Keep X-Content-Type-Options: nosniff enforced across all static and dynamic responses.',
      });
    } else {
      score -= 15;
      checks.push({
        name: 'X-Content-Type-Options',
        header: 'X-Content-Type-Options',
        status: 'WARNING',
        weight: 15,
        value: 'Not Set',
        explanation: 'Missing nosniff header. Browsers may execute user-uploaded files if MIME types are sniffed.',
        recommendation: 'Set X-Content-Type-Options: nosniff.',
      });
    }

    // 5. Referrer-Policy
    const refPol = rawHeaders['referrer-policy'];
    if (refPol) {
      checks.push({
        name: 'Referrer-Policy',
        header: 'Referrer-Policy',
        status: 'PASS',
        weight: 10,
        value: refPol,
        explanation: `Set to "${refPol}". Controls how much referrer metadata is leaked to third-party links.`,
        recommendation: 'strict-origin-when-cross-origin or no-referrer is recommended.',
      });
    } else {
      score -= 10;
      checks.push({
        name: 'Referrer-Policy',
        header: 'Referrer-Policy',
        status: 'WARNING',
        weight: 10,
        value: 'Not Set',
        explanation: 'No explicit Referrer-Policy header found. URL query parameters might leak in referrers.',
        recommendation: 'Set Referrer-Policy: strict-origin-when-cross-origin.',
      });
    }

    // 6. Permissions-Policy (Feature-Policy)
    const permPol = rawHeaders['permissions-policy'] || rawHeaders['feature-policy'];
    if (permPol) {
      checks.push({
        name: 'Permissions-Policy',
        header: 'Permissions-Policy',
        status: 'PASS',
        weight: 10,
        value: permPol.length > 80 ? `${permPol.substring(0, 80)}...` : permPol,
        explanation: 'Permissions-Policy is declared to restrict hardware APIs (camera, microphone, geolocation).',
        recommendation: 'Ensure unused sensors are explicitly disabled.',
      });
    } else {
      score -= 5;
      checks.push({
        name: 'Permissions-Policy',
        header: 'Permissions-Policy',
        status: 'INFO',
        weight: 10,
        value: 'Not Set',
        explanation: 'Permissions-Policy not explicitly declared (modern best practice).',
        recommendation: 'Consider adding Permissions-Policy: camera=(), microphone=(), geolocation=().',
      });
    }

    // 7. Information Disclosure (Server & X-Powered-By)
    const serverHeader = rawHeaders['server'];
    const poweredBy = rawHeaders['x-powered-by'];
    if (poweredBy || (serverHeader && /\d/.test(serverHeader))) {
      score -= 5;
      checks.push({
        name: 'Server Fingerprinting & Information Disclosure',
        header: 'Server / X-Powered-By',
        status: 'WARNING',
        weight: 5,
        value: `Server: ${serverHeader || 'None'} | X-Powered-By: ${poweredBy || 'None'}`,
        explanation: 'Server version signatures are exposed in HTTP headers, assisting automated reconnaissance by attackers.',
        recommendation: 'Suppress detailed version strings in web server configuration (e.g. ServerTokens Prod).',
      });
    } else {
      checks.push({
        name: 'Server Fingerprinting & Information Disclosure',
        header: 'Server / X-Powered-By',
        status: 'PASS',
        weight: 5,
        value: serverHeader ? `Generic (${serverHeader})` : 'Suppressed',
        explanation: 'Detailed version signatures are hidden from response headers.',
        recommendation: 'Keep framework fingerprint headers disabled.',
      });
    }

    score = Math.max(0, Math.min(100, score));

    // Calculate Grade
    let grade = 'F';
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 70) grade = 'B';
    else if (score >= 55) grade = 'C';
    else if (score >= 40) grade = 'D';

    return res.status(200).json({
      success: true,
      scannedUrl: url,
      finalUrl,
      httpStatus: response.status,
      statusText: response.statusText,
      overallScore: score,
      grade,
      checks,
      disclaimer:
        'Academic Evaluation Note: This score evaluates HTTP defensive headers only. It is a defense-in-depth indicator and does not replace a full dynamic application security test (DAST).',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: `Scanner Error: ${error.message}`,
    });
  }
};
