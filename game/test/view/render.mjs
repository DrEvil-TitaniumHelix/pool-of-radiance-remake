// VIEW/ECL render regression (por-build-ecl): node game/test/view/render.mjs
// Runs the engine + VM + view.js headless (fake display) from the shipped save and compares regions with the
// DOSBox references: VIEW-01 (resume, 15,4 W) and ECL-02 (walk off the east edge -> block 0 gateway text).
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { refPng } from '../../../acceptance/paths.mjs';   // BYOC step 7: acceptance/local/ref first, legacy acceptance/ref second
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DATA = (process.env.POR_DATA || '../re-targets/goldbox/por/POOLRAD') + '/';
globalThis.fetch = async (u) => {
  const n = decodeURIComponent(String(u).replace('/data/', ''));
  try { const b = readFileSync(DATA + n); return { ok: true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }; }
  catch { return { ok: false }; }
};
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
console.warn = () => {};
const P = await import('../../engine/pictures.js');
P.state.display = { pix: new Uint8Array(64000), touch() {} };
const T = await import('../../engine/text.js');
await (await import('../../areas/startup.js')).InitGameState();
T.text.GameSpeed = 0; T.text.TextOutputActive = 0;
const H = await import('../../areas/ecl_host.js');
const { newChar } = await import('../../engine/ecl.js');
const save = readFileSync(DATA + 'SAVE/SAVGAMA.DAT');

const I = await import('../../engine/input.js');
// keys: real ExploreCommand/MoveParty with the DOSBox key script (Down = turn around, Up = forward); stop at the next prompt
async function sceneKeys(keys) {
  P.state.display.pix.fill(0);
  const vm = await H.bindEclHost();
  const g = H.eclG; const c = newChar(); c.b[0x10D] = 1; g.PartyHead = g.SelectedChar = c;
  H.resumeSaveIntoVM(save);
  I.script.keys = keys.map((k) => [0, k]);                 // typed one at a time when the game waits (0899:00E4 flushes type-ahead)
  const real = H.eclHost.exploreCommand;
  let n = 0;
  H.eclHost.exploreCommand = async () => { if (n++ === 0) return real(); throw new Error('STOP'); };
  try { await H.EclGameLoop(); } catch (e) { if (e.message !== 'STOP') throw e; }
  H.eclHost.exploreCommand = real;
  const f = join(tmpdir(), 'por_view_keys.idx');
  writeFileSync(f, P.state.display.pix);
  return { f, pos: [g.party_MapX, g.party_MapY, g.party_Dir, g.ecl_Block] };
}

async function scene(walkEast) {
  P.state.display.pix.fill(0);
  const vm = await H.bindEclHost();
  const g = H.eclG; const c = newChar(); c.b[0x10D] = 1; g.PartyHead = g.SelectedChar = c;
  H.resumeSaveIntoVM(save);
  let n = 0;
  H.eclHost.exploreCommand = async () => {
    if (walkEast && n++ === 0) { g.party_Dir = 2; vm.setM1(0x6DD5, 1); return 0x48; }   // turn + forward at the edge (ov14 M3b)
    throw new Error('STOP');
  };
  H.eclHost.moveParty = async () => {};
  try { await H.EclGameLoop(); } catch (e) { if (e.message !== 'STOP') throw e; }
  const f = join(tmpdir(), 'por_view_' + (walkEast ? 'ecl02' : 'view01') + '.idx');
  writeFileSync(f, P.state.display.pix);
  return f;
}
const cmp = (ref, idx, c1, r1, c2, r2) => {
  const py = `
import sys
from PIL import Image
C=[(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),(85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]
i=open(sys.argv[2],'rb').read(); r=Image.open(sys.argv[1]).convert('RGB').load()
c1,r1,c2,r2=map(int,sys.argv[3:7])
print(sum(1 for y in range(r1*8,r2*8+8) for x in range(c1*8,c2*8+8) if C[i[y*320+x]]!=r[x,y]))`;
  return +execFileSync('python', ['-I', '-c', py, ref, idx, c1, r1, c2, r2].map(String)).toString().trim();
};
let bad = 0;
const check = (name, n, total) => { console.log(`${n === 0 ? 'ok  ' : 'FAIL'} ${name}: ${n} / ${total} pixels differ`); if (n) bad++; };
const v01 = await scene(false);
check('VIEW-01 3D view cells (3,3)-(13,13)', cmp(refPng('VIEW-01.native.png'), v01, 3, 3, 13, 13), 7744);
const e02 = await scene(true);
check('ECL-02 3D view cells (3,3)-(13,13)', cmp(refPng('ECL-02.native.png'), e02, 3, 3, 13, 13), 7744);
check('ECL-02 text window cells (1,17)-(38,22)', cmp(refPng('ECL-02.native.png'), e02, 1, 17, 38, 22), 14592);
const k = await sceneKeys([0x50, 0x48]);
check('ECL-02 via ExploreCommand keys Down,Up: 3D view', cmp(refPng('ECL-02.native.png'), k.f, 3, 3, 13, 13), 7744);
check('ECL-02 via ExploreCommand keys Down,Up: text window', cmp(refPng('ECL-02.native.png'), k.f, 1, 17, 38, 22), 14592);
console.log('  position after the keys: x,y,dir,block = ' + k.pos.join(','));
console.log(bad ? `RESULT: ${bad} failure(s)` : 'RESULT: PASS');
process.exit(bad ? 1 : 0);
