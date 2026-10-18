// acceptance/integration/run3.mjs (por-build-qa) — RUN-3 whole-game sweep: one locked run.mjs run per ECL block.
// Per area (acceptance/integration/RUN-3/areas.json, saves from mkareasaves.py): boot, write the area save (slot C) into
// the game's file store, reload, Load C (LoadGame resumes the block: init vector, entry event), then the seeded auto walk
// (run.mjs autoWalk: ~40 moves, every encounter fought on Quick, Encamp once). Writes out/RUN-3/<area>/report.json and
// regenerates acceptance/integration/RUN-3.md from every report present.
// Usage: node acceptance/integration/run3.mjs [ECL1_18 ECL1_24 ...]   (no names: all areas)   |   --md (table only)
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { report as reportPath } from '../paths.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const areas = JSON.parse(readFileSync(join(HERE, 'RUN-3', 'areas.json'), 'utf8'));
const args = process.argv.slice(2).filter((x) => !x.startsWith('--'));
const want = args.length ? areas.filter((a) => args.includes(a.name)) : areas;

if (!process.argv.includes('--md')) {
  for (const a of want) {
    const seed = a.dataSet * 100 + a.block;
    const run = {
      name: `RUN-3/${a.name}`, query: `sting=1&seed=${seed}&fast=4`,
      steps: [
        { name: 'boot', keys: '' },
        { name: 'load-menu', inject: `acceptance/integration/saves/${a.name}`, keys: '' },
        { name: 'load-C', keys: 'LC', ms: 90000 },
        { name: 'walk', keys: '', ms: 90000, auto: { seed, moves: 40, campAt: 20, max: 400 } },
      ],
    };
    mkdirSync(join(HERE, 'RUN-3'), { recursive: true });
    const f = join(HERE, 'RUN-3', `${a.name}.json`);
    writeFileSync(f, JSON.stringify(run, null, 1));
    console.log(`== ${a.name} (${a.title})`);
    spawnSync(process.execPath, [join(HERE, 'run.mjs'), f], { stdio: 'inherit' });
  }
}

// RUN-3.md table
const esc = (s) => String(s).replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const rows = [];
for (const a of areas) {
  // BYOC step 7: run.mjs writes the committed report acceptance/reports/integration/RUN-3_<area>.json (steps = report.json);
  // older runs only have out/RUN-3/<area>/report.json
  const rc = reportPath('integration', `RUN-3/${a.name}`), rp = join(HERE, 'out', 'RUN-3', a.name, 'report.json');
  if (!existsSync(rc) && !existsSync(rp)) { rows.push(`| ${a.name} | ${esc(a.title)} | — | not run | | | | |`); continue; }
  const rep = existsSync(rc) ? JSON.parse(readFileSync(rc, 'utf8')).steps : JSON.parse(readFileSync(rp, 'utf8'));
  const load = rep.find((r) => r.name === 'load-C');
  const walk = rep.find((r) => r.name === 'walk');
  const au = walk?.auto;
  const errs = rep.flatMap((r) => r.errors).filter((e) => /ENGINE ERROR|Error|exception/i.test(e));
  const crash = errs.length ? esc(errs[0].split('\n').slice(0, 3).join(' ')).slice(0, 300) : '—';
  const start = au?.start;
  const reached = start && start.ds === a.dataSet && start.blk === a.block && start.mode !== undefined ? 'Y' : (load ? 'N' : '—');
  const texts = au ? [...new Set(au.texts)] : [];
  const ev = texts.length ? `${texts.length}: ` + texts.slice(0, 3).map((t) => `"${esc(t).slice(0, 60)}"`).join('; ') + (texts.length > 3 ? ' …' : '') : '0';
  const fights = au ? `${au.fights}` : '—';
  const walkc = au ? `${au.moves} moves / ${au.iterations} it${au.camped ? ', camped' : ''}${au.timeouts ? `, ${au.timeouts} timeout` : ''}${au.log.length ? ', ' + esc(au.log.join('; ')).slice(0, 80) : ''}` : (walk ? 'not started' : '—');
  const blocks = au ? [...new Set(au.blocks)].join(' → ') : '';
  rows.push(`| ${a.name} | ${esc(a.title)} | ${reached} | ${ev} | ${fights} | ${walkc} | ${blocks} | ${crash} |`);
}
const md = `# RUN-3 — whole-game sweep with the test party (por-build-qa)

One locked headless run per ECL block (\`node acceptance/integration/run3.mjs [area ...]\`). Each area is reached by a copy of
the test-party save placed in the block (\`acceptance/integration/mkareasaves.py\` → \`acceptance/integration/saves/<area>/\`,
git-ignored; fields in its header: data set, Mem[49F2] block, map, ECL code buffer, start square, travel mode, game_Mode 2),
written into the game's file store and loaded with L C. Then a seeded walk (\`run.mjs\` autoWalk, seed = 100·dataset + block):
~40 moves (forward / turns / Search / Look), every encounter fought on Quick, Encamp once after 20 moves. Quest flags are
zero (fresh party), so story-gated events may not fire. Screenshots / reports: \`acceptance/integration/out/RUN-3/<area>/\`.

Columns: **reached** = the game resumed in that data set + block after Load; **events** = distinct ECL PRINT texts seen
(first three); **fights** = combats entered; **walk** = moves / driver iterations; **blocks** = ECL blocks visited
(data set_block); **crash** = first ENGINE ERROR / exception (full stack in report.json).

| area | title | reached | events | fights | walk | blocks | crash |
|---|---|---|---|---|---|---|---|
${rows.join('\n')}
`;
const notes = join(HERE, 'RUN-3', 'NOTES.md');               // findings / fix requests, kept across regenerations
writeFileSync(join(HERE, 'RUN-3.md'), md + (existsSync(notes) ? '\n' + readFileSync(notes, 'utf8') : ''));
console.log(md);
