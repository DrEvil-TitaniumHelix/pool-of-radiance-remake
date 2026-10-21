// VIEW ov30 / ov23 unit checks (por-build-ecl): node game/test/view/ov30_ov23.mjs
// DS tables from decode/bin/START.unpacked.exe (paragraph 0C7C).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const exe = readFileSync(join(ROOT, 'decode', 'bin', 'START.unpacked.exe'));
const hdr = exe.readUInt16LE(8) * 16;
const ds = new Uint8Array(exe.subarray(hdr + 0xC7C0, hdr + 0xC7C0 + 0x8760));

const { view } = await import('../../areas/view.js');
const V30 = await import('../../areas/view_ov30.js');
const V23 = await import('../../areas/view_ov23.js');
const g = { ds, cb_Col: [], cb_Row: [], cb_Size: [0], tg_List: [], tg_Count: 0 };
view.g = g;

let bad = 0;
const eq = (name, got, exp) => {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (!ok) bad++;
  console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `: ${JSON.stringify(got)} != ${JSON.stringify(exp)}`));
};

// Sign
eq('Sign', [V30.Sign(-5), V30.Sign(0), V30.Sign(7), V30.Sign(0xFFFF)], [-1, 0, 1, -1]);

// combat map: floor everywhere (tile 17h = floor 16h + 1, as BuildWildernessField fills it)
const FLOOR = 0x17;
const map = { b: new Uint8Array(0x4E9) };
map.b.fill(FLOOR, 7, 7 + 25 * 50);
const set = (x, y, t) => { map.b[7 + y * 50 + x] = t; };
eq('floor tile has no obstacle', ds[0x2744 + FLOOR * 4 + 2], 0);

const trace = (x0, y0, x1, y1, r) => {
  const X = { v: x1 }, Y = { v: y1 }, R = { v: r };
  const ok = V30.TraceLine(x0, y0, X, Y, R, map);
  return [ok, X.v, Y.v, R.v];
};
eq('TraceLine straight 4 squares: reached, dist 8 (2 per step)', trace(10, 10, 14, 10, 10), [true, 14, 10, 8]);
eq('TraceLine diagonal 3 squares: reached, dist 9 (3 per step)', trace(10, 10, 13, 13, 10), [true, 13, 13, 9]);
eq('TraceLine out of range (range 1 -> 3 half-steps)', trace(10, 10, 14, 10, 1), [false, 12, 10, 4]);
// a wall tile in the way (tile with obstacle height 2)
let WALL = 0; for (let t = 1; t < 64; t++) if (ds[0x2744 + t * 4 + 2] === 2) { WALL = t; break; }
set(12, 10, WALL);
eq(`TraceLine blocked by wall tile ${WALL} at (12,10)`, trace(10, 10, 14, 10, 10), [false, 12, 10, 4]);
set(12, 10, FLOOR);

// LineInit / LineStep directions (g_25C0)
const L = V30.newLine(); L.x0 = 0; L.y0 = 0; L.x1 = 2; L.y1 = -1; V30.LineInit(L);
const dirs = []; while (V30.LineStep(L)) dirs.push(L.dir);
eq('LineStep (0,0)->(2,-1) directions', dirs, [1, 2]);

// InFrontArc
eq('InFrontArc dir 0 (north): target north / south', [V30.InFrontArc(10, 10, 10, 5, 0), V30.InFrontArc(10, 10, 10, 15, 0)], [true, false]);
eq('InFrontArc dir 2 (east): target east / west', [V30.InFrontArc(10, 10, 15, 10, 2), V30.InFrontArc(10, 10, 5, 10, 2)], [true, false]);
eq('InFrontArc dir FFh = all, off map = false', [V30.InFrontArc(10, 10, 3, 20, 0xFF), V30.InFrontArc(10, 10, 60, 10, 0xFF)], [true, false]);

// BuildTargetList: combatant 1 at (10,10), 2 at (13,10), 3 at (10,13); all size 1
g.cb_Size = [3, 1, 1, 1]; g.cb_Col = [0, 10, 13, 10]; g.cb_Row = [0, 10, 10, 13];
V30.BuildTargetList(10, 10, 10, 0xFF, 1, map);
eq('BuildTargetList count / order (dist asc)', [g.tg_Count, g.tg_List.slice(1, g.tg_Count + 1).map((e) => [e.who, e.dist, e.dir])],
  [3, [[1, 0, 0], [2, 6, 2], [3, 6, 4]]]);   // self, east (dir 2), south (dir 4)

// ov23 on a level-1 fighter (class 2): base THAC0 g_3C7C[2*11+1], saves g_426E[2*45 + 1*5 + k], 2 attacks
const c = { b: new Uint8Array(0x11D), next: null, items: null, effects: null };
c.b[0x96 + 2] = 1;
V23.UpdateLevelStats(c);
eq('fighter L1 base_thac0 +2Dh', c.b[0x2D], ds[0x3C7C + 2 * 11 + 1]);
eq('fighter L1 saves +6Dh..+71h', [...c.b.subarray(0x6D, 0x72)], [...ds.subarray(0x426E + 2 * 45 + 5, 0x426E + 2 * 45 + 10)]);
eq('fighter L1 attacks +A1h / +73h', [c.b[0xA1], c.b[0x73]], [2, 1]);
// fighter level 7: 3 attacks
c.b[0x96 + 2] = 7; V23.UpdateLevelStats(c);
eq('fighter L7 attacks', c.b[0xA1], 3);
// WisdomBonusSpells: WIS 17, slots 1/1/1 -> 3/3/2
const w = { b: new Uint8Array(0x11D) }; w.b[0x12] = 17; w.b[0xB2] = 1; w.b[0xB3] = 1; w.b[0xB4] = 1;
V23.WisdomBonusSpells(w);
eq('WisdomBonusSpells WIS 17', [w.b[0xB2], w.b[0xB3], w.b[0xB4]], [3, 3, 2]);
// thief level 1 human (race 7), DEX 10: skills = base + race adj (+ dex adj for 1..5), from the tables
const t = { b: new Uint8Array(0x11D) }; t.b[0x2E] = 7; t.b[0x9C] = 1; t.b[0x13] = 10;
V23.UpdateThiefSkills(t);
const s8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
const exp = []; for (let k = 1; k <= 8; k++) {
  const ra = s8(ds[0x3D3B + 7 * 8 + k]), base = ds[0x3CF3 + 8 + k];
  let v = ra < 0 && -ra > base ? 0 : (base + ra) & 0xFF;
  if (!(ra < 0 && -ra > base) && k < 6) v = (v + s8(ds[0x3D4E + 10 * 5 + k])) & 0xFF;
  exp.push(v);
}
eq('UpdateThiefSkills human thief L1 DEX 10', [...t.b.subarray(0x77, 0x7F)], exp);

console.log(bad ? `RESULT: ${bad} failure(s)` : 'RESULT: PASS');
process.exit(bad ? 1 : 0);
