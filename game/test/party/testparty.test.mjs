// testparty.test.mjs (por-accept, BYOC step 6) — the in-browser test-party generator (game/areas/testparty.js), fed from
// the local originals exactly as the browser feeds it (START.EXE unpacked in memory -> DS image, ITEMS, ITEM3.DAX record
// 53), must reproduce the 16 save files byte for byte: their SHA-256 are recorded in testparty.golden.json, so the files
// themselves need not be committed. Originals: env POR_DATA (default ../re-targets/goldbox/por/POOLRAD), never modified.
//   node game/test/party/testparty.test.mjs
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { unexepack } from '../../engine/state.js';
import { readDir, DaxRleDecode } from '../../engine/dax.js';
import { buildTestParty, readParty } from '../../areas/testparty.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const POR = process.env.POR_DATA || path.resolve(ROOT, '../re-targets/goldbox/por/POOLRAD');

// the browser's inputs (state.js initState, dax.js LoadDaxRecord)
export function originals(dir = POR) {
  const img = unexepack(new Uint8Array(readFileSync(path.join(dir, 'START.EXE'))));
  const ds = new Uint8Array(0x8760); ds.set(img.subarray(0xC7C0, Math.min(img.length, 0xC7C0 + 0x8760)));
  const items = new Uint8Array(readFileSync(path.join(dir, 'ITEMS')));
  const dax = new Uint8Array(readFileSync(path.join(dir, 'ITEM3.DAX')));
  const { dataStart, entries } = readDir(dax);
  const e = entries.find((x) => x.id === 53);
  const shop = DaxRleDecode(dax.subarray(dataStart + e.ofs, dataStart + e.ofs + e.comp), e.comp, e.raw);
  return { ds, items, shop };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const golden = JSON.parse(readFileSync(path.join(HERE, 'testparty.golden.json'), 'utf8')).files;
  const { files } = buildTestParty({ ...originals(), level: 4, gold: 300, slot: 'C' });
  let fail = 0;
  const names = files.map(([n]) => n).sort(), want = Object.keys(golden).sort();
  if (JSON.stringify(names) !== JSON.stringify(want)) { fail++; console.log('FAIL file list', names, 'want', want); }
  for (const [n, b] of files) {
    const g = golden[n]; if (!g) continue;
    const h = createHash('sha256').update(b).digest('hex');
    if (h !== g.sha256 || b.length !== g.bytes) { fail++; console.log(`FAIL ${n}: ${b.length} B ${h} want ${g.bytes} B ${g.sha256}`); }
  }
  // determinism: a second build gives identical bytes
  const again = buildTestParty({ ...originals(), level: 4, gold: 300, slot: 'C' }).files;
  for (let i = 0; i < files.length; i++) if (Buffer.compare(Buffer.from(files[i][1]), Buffer.from(again[i][1])) !== 0) { fail++; console.log('FAIL not deterministic', files[i][0]); }
  // the written set reads back as six members (ReadCharacter layout)
  const m = new Map(files); const { chars } = readParty((n) => m.get(n) || null, 'C');
  if (chars.length !== 6) { fail++; console.log('FAIL read-back members', chars.length); }
  console.log(fail ? `testparty: ${fail} FAIL` : `testparty: PASS (${files.length} files = golden SHA-256, deterministic, 6 members read back)`);
  process.exit(fail ? 1 : 0);
}
