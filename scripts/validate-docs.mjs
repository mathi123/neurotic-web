#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URL regex pattern - matches http://, https://, and git URLs
const URL_REGEX = /(https?:\/\/[^\s\)]+|git@[^\s\)]+|https?:\/\/[^\s\)]+)/g;

// URLs to skip (e.g., git URLs that might not be publicly accessible)
const SKIP_PATTERNS = [
  /^git@/, // Skip SSH git URLs
  /\.git$/, // Skip .git URLs (they're usually not directly accessible)
];

function extractUrls(content) {
  const matches = content.matchAll(URL_REGEX);
  const urls = [];

  for (const match of matches) {
    let url = match[0];
    // Remove trailing punctuation that might be part of markdown
    url = url.replace(/[.,;:!?\)]+$/, '');

    // Skip if matches skip patterns
    if (SKIP_PATTERNS.some((pattern) => pattern.test(url))) {
      continue;
    }

    // Normalize git URLs to https
    if (url.startsWith('git@')) {
      url = url.replace('git@', 'https://').replace(':', '/');
    }

    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Docs Validator',
      },
    });

    clearTimeout(timeoutId);

    return {
      url,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return {
        url,
        status: 'TIMEOUT',
        ok: false,
        error: 'Request timed out after 10 seconds',
      };
    }

    return {
      url,
      status: 'ERROR',
      ok: false,
      error: error.message,
    };
  }
}

async function main() {
  const readmePath = join(__dirname, '..', 'README.md');
  const readmeContent = readFileSync(readmePath, 'utf-8');

  const urls = extractUrls(readmeContent);

  if (urls.length === 0) {
    console.log('No URLs found in README.md');
    process.exit(0);
  }

  console.log(`Found ${urls.length} URL(s) in README.md:\n`);

  const results = await Promise.all(urls.map(checkUrl));

  let hasErrors = false;

  for (const result of results) {
    if (result.ok) {
      console.log(`✓ ${result.url} - Status: ${result.status}`);
    } else {
      console.error(`✗ ${result.url} - Status: ${result.status}${result.error ? ` - ${result.error}` : ''}`);
      hasErrors = true;
    }
  }

  console.log('');

  if (hasErrors) {
    console.error('❌ Some URLs are broken or inaccessible. CI/CD cannot continue!');
    process.exit(1);
  } else {
    console.log('✅ All URLs are accessible!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
