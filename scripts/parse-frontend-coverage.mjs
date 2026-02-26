import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const p = path.resolve(__dirname, '../coverage/frontend/lcov.info');
if (!fs.existsSync(p)) { console.error('lcov not found at', p); process.exit(2); }
const data = fs.readFileSync(p, 'utf8');
const blocks = data.split(/end_of_record\n/).filter(Boolean);
const results = [];
for (const block of blocks) {
  const sfMatch = block.match(/^SF:(.*)$/m);
  if (!sfMatch) continue;
  const file = sfMatch[1].trim();
  const lfMatch = block.match(/^LF:(\d+)$/m);
  const lhMatch = block.match(/^LH:(\d+)$/m);
  const lf = lfMatch ? parseInt(lfMatch[1], 10) : 0;
  const lh = lhMatch ? parseInt(lhMatch[1], 10) : 0;
  const pct = lf === 0 ? (lh === 0 ? 100 : 0) : Math.round((lh / lf) * 10000) / 100;
  results.push({ file, lf, lh, pct });
}
results.sort((a,b) => a.pct - b.pct || a.file.localeCompare(b.file));
console.log('Lowest 15 files by statement coverage:\n');
results.slice(0,15).forEach(r => console.log(`${r.pct.toFixed(2)}% — ${r.file} (LH ${r.lh}/${r.lf})`));
console.log('\nTotal files:', results.length);
