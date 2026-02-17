#!/usr/bin/env node
/**
 * Domain availability checker with multi-TLD support.
 * Uses DNS resolution (fast) with RDAP fallback (accurate) to catch parked domains.
 * Fully self-contained — no npm packages required. Uses Node.js built-in DNS and fetch.
 *
 * Usage: node check-domain.mjs --domain DOMAIN
 *
 * Accepts a full domain (name.tld) or just a name (no dot).
 * If a TLD is included, checks that TLD plus .com, .net, .io, .ai, .co.
 * If no TLD, checks .com, .net, .io, .ai, .co.
 * Output: one line per domain with status (REGISTERED, AVAILABLE, UNKNOWN).
 *
 * Exit codes:
 *   0 - Check completed (see output for per-domain status)
 *   1 - Invalid usage
 */

import { promises as dns } from 'node:dns';
import { parseArgs } from 'node:util';

const ADDITIONAL_TLDS = ['.com', '.net', '.io', '.ai', '.co'];

const RDAP_SERVERS = {
  '.com': 'https://rdap.verisign.com/com/v1',
  '.net': 'https://rdap.verisign.com/net/v1',
  '.io': 'https://rdap.identitydigital.services/rdap',
  '.ai': 'https://rdap.identitydigital.services/rdap',
  '.co': 'https://rdap.identitydigital.services/rdap',
};

const { values } = parseArgs({
  options: {
    domain: { type: 'string' },
  },
});

if (!values.domain) {
  console.error('Usage: node check-domain.mjs --domain DOMAIN');
  process.exit(1);
}

const input = values.domain;
const dotIndex = input.lastIndexOf('.');
const hasTLD = dotIndex > 0;

const baseName = hasTLD ? input.substring(0, dotIndex) : input;
const targetTLD = hasTLD ? input.substring(dotIndex) : null;
const uniqueTLDs = targetTLD ? [...new Set([targetTLD, ...ADDITIONAL_TLDS])] : ADDITIONAL_TLDS;

async function checkRDAP(domain, tld) {
  const server = RDAP_SERVERS[tld];
  if (!server) return 'UNKNOWN - no RDAP server';

  const response = await fetch(`${server}/domain/${domain}`, {
    signal: AbortSignal.timeout(5000),
  });

  if (response.status === 404) return 'AVAILABLE';
  if (!response.ok) return `UNKNOWN - RDAP HTTP ${response.status}`;

  const data = await response.json();
  const hasStatus = data.status?.length > 0;
  const hasEvents = data.events?.length > 0;
  const hasEntities = data.entities?.length > 0;
  if (hasStatus || hasEvents || hasEntities) {
    return 'REGISTERED (inactive)';
  }
  return 'AVAILABLE';
}

async function checkDomain(domain, tld) {
  // Tier 1: DNS resolution (fast, definitive for active domains)
  try {
    await dns.resolve(domain);
    return 'REGISTERED';
  } catch (error) {
    if (error.code !== 'ENOTFOUND' && error.code !== 'ENODATA' && error.code !== 'ESERVFAIL') {
      return `UNKNOWN - DNS error: ${error.code}`;
    }
  }

  // Tier 2: RDAP lookup (catches registered-but-parked domains)
  try {
    return await checkRDAP(domain, tld);
  } catch {
    return 'AVAILABLE';
  }
}

const results = [];
for (const tld of uniqueTLDs) {
  const domain = baseName + tld;
  const status = await checkDomain(domain, tld);
  results.push({ domain, status });
}

const maxLen = Math.max(...results.map((r) => r.domain.length));
for (const { domain, status } of results) {
  console.log(`${domain.padEnd(maxLen + 2)} ${status}`);
}
