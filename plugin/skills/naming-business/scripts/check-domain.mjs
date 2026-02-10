#!/usr/bin/env node
/**
 * Cross-platform domain availability checking utility
 * Works on macOS and Windows using Node.js built-in DNS
 *
 * Usage: node check-domain.mjs --domain DOMAIN
 *
 * Exit codes:
 *   0 - Domain check completed (see output for status)
 *   1 - Invalid usage or error
 */

import { promises as dns } from 'node:dns';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    domain: { type: 'string' },
  },
});

if (!values.domain) {
  console.error('Usage: node check-domain.mjs --domain DOMAIN');
  process.exit(1);
}

try {
  await dns.resolve(values.domain);
  console.log(`${values.domain}: REGISTERED`);
} catch (error) {
  if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
    console.log(`${values.domain}: AVAILABLE`);
  } else {
    console.log(`${values.domain}: ERROR - ${error.message}`);
  }
}
