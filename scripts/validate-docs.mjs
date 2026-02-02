#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

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

function getMarkdownFiles() {
  const files = [];

  // Add README.md
  const readmePath = join(rootDir, 'README.md');
  if (existsSync(readmePath)) {
    files.push(readmePath);
  }

  // Add all .md files from docs/
  const docsDir = join(rootDir, 'docs');
  if (existsSync(docsDir)) {
    const docsFiles = readdirSync(docsDir).filter((f) => f.endsWith('.md'));
    files.push(...docsFiles.map((f) => join(docsDir, f)));
  }

  return files;
}

async function main() {
  const files = getMarkdownFiles();

  if (files.length === 0) {
    console.log('No markdown files found');
    process.exit(0);
  }

  const allUrls = new Map(); // url -> [files where it appears]

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    const urls = extractUrls(content);
    const fileName = file.replace(rootDir + '/', '');

    for (const url of urls) {
      if (!allUrls.has(url)) {
        allUrls.set(url, []);
      }
      allUrls.get(url).push(fileName);
    }
  }

  if (allUrls.size === 0) {
    console.log('No URLs found in documentation');
    process.exit(0);
  }

  console.log(`Found ${allUrls.size} unique URL(s) across ${files.length} file(s):\n`);

  const results = await Promise.all([...allUrls.keys()].map(checkUrl));

  let hasErrors = false;

  for (const result of results) {
    const filesWithUrl = allUrls.get(result.url).join(', ');
    if (result.ok) {
      console.log(`✓ ${result.url} - Status: ${result.status} (${filesWithUrl})`);
    } else {
      console.error(`✗ ${result.url} - Status: ${result.status}${result.error ? ` - ${result.error}` : ''} (${filesWithUrl})`);
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
