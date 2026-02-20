#!/usr/bin/env node
/**
 * Pre-push version bump script.
 * - Bumps the patch version in package.json (root)
 * - Collects commit messages since the last version-bump commit (or last 20)
 * - Prepends a new entry to CHANGELOG.md
 * - Stages both files and creates a "chore: bump version" commit
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Helpers ────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', ...opts }).trim();
}

function bumpPatch(version) {
  const parts = version.split('.').map(Number);
  parts[2] += 1;
  return parts.join('.');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// ── Read current version ────────────────────────────────────────────────────

const pkgPath = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;
const newVersion = bumpPatch(oldVersion);

// ── Collect commits since last version bump ────────────────────────────────

let sinceRef = '';
try {
  // Find the most recent "chore: bump version" commit
  sinceRef = run('git log --oneline --all --grep="chore: bump version" -1 --format=%H');
} catch {
  sinceRef = '';
}

let rawLog = '';
try {
  if (sinceRef) {
    rawLog = run(`git log ${sinceRef}..HEAD --format="- %s (%h)" --no-merges`);
  } else {
    // Fallback: commits not yet on the remote branch, or last 20
    rawLog = run('git log @{u}..HEAD --format="- %s (%h)" --no-merges');
  }
} catch {
  // @{u} fails when there is no upstream yet; fall back to last 20
  try {
    rawLog = run('git log HEAD~20..HEAD --format="- %s (%h)" --no-merges');
  } catch {
    rawLog = '- initial release';
  }
}

const commitLines = rawLog
  .split('\n')
  .map(l => l.trim())
  // Skip version bump commits themselves so the changelog stays clean
  .filter(l => l && !l.toLowerCase().includes('chore: bump version'))
  .join('\n');

// ── Build changelog entry ──────────────────────────────────────────────────

const changelogPath = resolve(ROOT, 'CHANGELOG.md');
let existingChangelog = '';
try {
  existingChangelog = readFileSync(changelogPath, 'utf8');
} catch {
  existingChangelog = '';
}

const entry = `## [${newVersion}] - ${today()}\n\n${commitLines || '- minor improvements'}\n\n`;

// Strip any existing "# Changelog" header so we can prepend cleanly
let body = existingChangelog.replace(/\r\n/g, '\n');
if (body.startsWith('# Changelog')) {
  const firstBlank = body.indexOf('\n\n');
  body = firstBlank !== -1 ? body.slice(firstBlank + 2) : body;
}

writeFileSync(changelogPath, `# Changelog\n\n${entry}${body}`.trimEnd() + '\n', 'utf8');

// ── Update package.json version ───────────────────────────────────────────

pkg.version = newVersion;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');

// ── Stage + commit ────────────────────────────────────────────────────────

run('git add package.json CHANGELOG.md');
run(`git commit --no-verify -m "chore: bump version ${oldVersion} -> ${newVersion}"`);

console.log(`\n  Version bumped ${oldVersion} -> ${newVersion} and committed.\n`);
