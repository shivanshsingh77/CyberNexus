import dns from 'node:dns/promises';
import { URL } from 'node:url';
import net from 'node:net';

/**
 * Checks if an IPv4 address belongs to a private, loopback, link-local, or reserved range.
 */
export const isPrivateOrReservedIPv4 = (ip) => {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [b0, b1, b2, b3] = parts;

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;

  // 10.0.0.0/8 (Private)
  if (b0 === 10) return true;

  // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (b0 === 192 && b1 === 168) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Metadata 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (TEST-NET)
  if (b0 === 192 && b1 === 0 && b2 === 2) return true;
  if (b0 === 198 && b1 === 51 && b2 === 100) return true;
  if (b0 === 203 && b1 === 0 && b2 === 113) return true;

  // 224.0.0.0/4 (Multicast: 224-239)
  if (b0 >= 224 && b0 <= 239) return true;

  // 240.0.0.0/4 (Reserved / Future use: 240-255)
  if (b0 >= 240) return true;

  return false;
};

/**
 * Checks if an IPv6 address belongs to a private, loopback, or reserved range.
 */
export const isPrivateOrReservedIPv6 = (ip) => {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // Unspecified ::
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
  if (normalized.startsWith('::ffff:')) {
    const ipv4Part = normalized.substring(7);
    if (net.isIPv4(ipv4Part)) {
      return isPrivateOrReservedIPv4(ipv4Part);
    }
  }

  // Unique Local Address (ULA) fc00::/7 (fc.. or fd..)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // Link-Local fe80::/10 (fe8, fe9, fea, feb)
  if (/^fe[89ab]/i.test(normalized)) return true;

  // Multicast ff00::/8
  if (normalized.startsWith('ff')) return true;

  return false;
};

/**
 * Validates a target URL against Server-Side Request Forgery (SSRF).
 * Returns { valid: true, parsedUrl } or { valid: false, reason: string }.
 */
export const validateUrlForSSRF = async (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { valid: false, reason: 'URL string is required.' };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(inputUrl);
  } catch (err) {
    return { valid: false, reason: 'Invalid URL format.' };
  }

  // Enforce HTTP / HTTPS protocols only
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return {
      valid: false,
      reason: `Unsupported protocol "${parsedUrl.protocol}". Only http: and https: are permitted.`,
    };
  }

  // Disallow user credentials in URL (e.g. http://user:pass@host)
  if (parsedUrl.username || parsedUrl.password) {
    return {
      valid: false,
      reason: 'URLs containing embedded credentials are not permitted.',
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Block explicit localhost names and local suffixes
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.arpa')
  ) {
    return {
      valid: false,
      reason: 'Access to loopback, local, and internal domains is strictly blocked for security.',
    };
  }

  // If hostname is directly an IP literal
  if (net.isIPv4(hostname)) {
    if (isPrivateOrReservedIPv4(hostname)) {
      return {
        valid: false,
        reason: `Direct connection to private/reserved IP address (${hostname}) is blocked.`,
      };
    }
  } else if (net.isIPv6(hostname)) {
    if (isPrivateOrReservedIPv6(hostname)) {
      return {
        valid: false,
        reason: `Direct connection to private/reserved IPv6 address (${hostname}) is blocked.`,
      };
    }
  } else {
    // Resolve DNS and inspect resolved IP addresses to prevent DNS rebinding to internal networks
    try {
      const records = await dns.lookup(hostname, { all: true });

      if (!records || records.length === 0) {
        return { valid: false, reason: `Could not resolve hostname "${hostname}".` };
      }

      for (const record of records) {
        if (record.family === 4 && isPrivateOrReservedIPv4(record.address)) {
          return {
            valid: false,
            reason: `Hostname "${hostname}" resolves to private/internal IP (${record.address}). Request blocked by SSRF defense.`,
          };
        }
        if (record.family === 6 && isPrivateOrReservedIPv6(record.address)) {
          return {
            valid: false,
            reason: `Hostname "${hostname}" resolves to private/internal IPv6 (${record.address}). Request blocked by SSRF defense.`,
          };
        }
      }
    } catch (dnsErr) {
      return {
        valid: false,
        reason: `DNS resolution failed for "${hostname}": ${dnsErr.message}`,
      };
    }
  }

  return { valid: true, parsedUrl };
};

/**
 * Safely fetches headers for a target URL following up to 3 redirects,
 * validating each redirect hop against SSRF filters.
 */
export const safeFetchHeaders = async (targetUrl, maxRedirects = 3) => {
  let currentUrl = targetUrl;
  let redirectsCount = 0;

  while (redirectsCount <= maxRedirects) {
    const ssrfCheck = await validateUrlForSSRF(currentUrl);
    if (!ssrfCheck.valid) {
      throw new Error(`SSRF Validation Failed: ${ssrfCheck.reason}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout

    let response;
    try {
      // Clean fetch: NEVER attach local auth cookies or credentials!
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'CyberNexus-SecurityScanner/1.0 (+WebSecurityProject; +academic)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual', // Handle redirects manually to inspect and re-validate each hop
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Request timed out after 6 seconds.');
      }
      throw new Error(`Network request failed: ${err.message}`);
    } finally {
      clearTimeout(timeout);
    }

    // Check for HTTP Redirect (301, 302, 303, 307, 308)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        return { response, finalUrl: currentUrl };
      }

      // Resolve relative redirect against current URL
      const nextUrl = new URL(location, currentUrl).toString();
      redirectsCount++;

      if (redirectsCount > maxRedirects) {
        throw new Error(`Exceeded maximum redirect limit (${maxRedirects}).`);
      }

      currentUrl = nextUrl;
      continue;
    }

    return { response, finalUrl: currentUrl };
  }

  throw new Error('Too many redirects.');
};
