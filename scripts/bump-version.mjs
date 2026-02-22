#!/usr/bin/env node
/**
 * Pre-push version bump script.
 * - Bumps the patch version in package.json (root)
 * - Collects commit messages since the last version-bump commit (or last 20)
 * - Groups commits by Conventional Commits type (feat/fix/perf/refactor/docs/chore/…)
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

// Maps Conventional Commits type → changelog section heading
const TYPE_MAP = {
  feat:     '### Added',
  fix:      '### Fixed',
  perf:     '### Performance',
  refactor: '### Changed',
  style:    '### Changed',
  docs:     '### Documentation',
  test:     '### Tests',
  build:    '### Build',
  ci:       '### CI',
  chore:    '### Chore',
  revert:   '### Reverted',
};

// Regex: "feat(scope): message (abc1234)" or "feat: message (abc1234)"
const CONVENTIONAL_RE = /^-\s+([\w]+)(?:\([^)]*\))?!?:\s+(.+?)(\s+\([a-f0-9]+\))?$/;

/**
 * Parses raw git log lines and returns a markdown string grouped by type.
 * Lines that don't follow Conventional Commits fall into a generic "Other" bucket.
 */
function groupByType(rawLines) {
  // buckets: { sectionHeading -> [message (hash), ...] }
  const buckets = new Map();

  for (const line of rawLines) {
    const m = line.match(CONVENTIONAL_RE);
    if (m) {
      const type = m[1].toLowerCase();
      const msg  = m[2].trim();
      const hash = m[3] ? m[3].trim() : '';
      const heading = TYPE_MAP[type] ?? '### Other';
      if (!buckets.has(heading)) buckets.set(heading, []);
      buckets.get(heading).push(`- ${msg}${hash ? ' ' + hash : ''}`);
    } else {
      // Non-conventional line: strip leading "- " if present, put in Other
      const clean = line.replace(/^-\s+/, '');
      if (!buckets.has('### Other')) buckets.set('### Other', []);
      buckets.get('### Other').push(`- ${clean}`);
    }
  }

  if (buckets.size === 0) return '- minor improvements';

  // Preferred display order
  const order = [
    '### Added', '### Fixed', '### Performance', '### Changed',
    '### Reverted', '### Documentation', '### Tests',
    '### Build', '### CI', '### Chore', '### Other',
  ];

  const sections = [];
  for (const heading of order) {
    if (buckets.has(heading)) {
      sections.push(`${heading}\n${buckets.get(heading).join('\n')}`);
      buckets.delete(heading);
    }
  }
  // Any remaining types not in the order list
  for (const [heading, lines] of buckets) {
    sections.push(`${heading}\n${lines.join('\n')}`);
  }

  return sections.join('\n\n');
}

// ── Read current version ────────────────────────────────────────────────────

const pkgPath = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;
const newVersion = bumpPatch(oldVersion);

// ── Collect commits since last version bump ────────────────────────────────

let sinceRef = '';
try {
  sinceRef = run('git log --oneline --all --grep="chore: bump version" -1 --format=%H');
} catch {
  // default value '' already set above
}

let rawLog = '';
try {
  if (sinceRef) {
    rawLog = run(`git log ${sinceRef}..HEAD --format="- %s (%h)" --no-merges`);
  } else {
    rawLog = run('git log @{u}..HEAD --format="- %s (%h)" --no-merges');
  }
} catch {
  try {
    rawLog = run('git log HEAD~20..HEAD --format="- %s (%h)" --no-merges');
  } catch {
    // default value '' already set above
  }
}

const commitLines = rawLog
  .split('\n')
  .map(l => l.trim())
  .filter(l => l && !l.match(/chore.*bump version/i));

const grouped = groupByType(commitLines);

// ── Build changelog entry ──────────────────────────────────────────────────

const changelogPath = resolve(ROOT, 'CHANGELOG.md');
let existingChangelog = '';
try {
  existingChangelog = readFileSync(changelogPath, 'utf8');
} catch {
  // default value '' already set above
}

const entry = `## [${newVersion}] - ${today()}\n\n${grouped}\n\n`;

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
