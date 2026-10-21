// game/test/magic/ov22.test.mjs — node:test for game/areas/magic_ov22.js (MAGIC ov22, seg 8E00, lists/casting part).
// Run: node --test game/test/magic/ov22.test.mjs
// The DS image (constant tables SpellTable DS:31FA, SpellNames DS:28E9, level headings DS:0A79) comes from
// decode/bin/START.unpacked.exe: DS 0C7C = image paragraph 0C7C -> file offset = header size + C7C0h.
// magic_spells.js (other worker of this lane) may not exist yet: a resolve hook stubs it so ov22 loads alone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { register } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
if (!existsSync(join(ROOT, 'game', 'areas', 'magic_spells.js'))) {
  const stub = 'export const SpellHandlers = []; export function BreathWeapon() {}';
  const hook = `export async function resolve(s, c, n) {
    if (s.endsWith('/magic_spells.js') || s === './magic_spells.js') return { url: 'data:text/javascript,' + encodeURIComponent(${JSON.stringify(stub)}), shortCircuit: true };
    return n(s, c); }`;
  register('data:text/javascript,' + encodeURIComponent(hook), pathToFileURL(HERE + '/'));
}
const { newChar, newItem, pstr } = await import('../../engine/ecl.js');
const { bindMagic } = await import('../../areas/magic_core.js');
const ov22 = await import('../../areas/magic_ov22.js');

// DS image
const exe = readFileSync(join(ROOT, 'decode', 'bin', 'START.unpacked.exe'));
const hdr = exe.readUInt16LE(8) * 16;
const ds = new Uint8Array(0x8760);
ds.set(exe.subarray(hdr + 0xC7C0, Math.min(exe.length, hdr + 0xC7C0 + 0x4430)));
const tbl = (id, k) => ds[0x31FA + id * 16 + k];
const dsPstr = (o) => String.fromCharCode(...ds.subarray(o + 1, o + 1 + ds[o]));

function setup(ext = {}) {
  const g = { ds, game_Mode: 2, ItemCast: 0, SelectedChar: newChar(), PartyHead: null, sl_List: null };
  g.SelectedChar.b[0] = 4; g.SelectedChar.b.set([0x41, 0x4C, 0x4D, 0x41], 1);   // 'ALMA'
  bindMagic({ g, ext: { SpellCasterLevel: () => 3, Roll: (n, s) => n * s, HasEffect: async () => false, ...ext } });
  return g;
}
const lines = (g) => { const out = []; for (let p = g.sl_List; p; p = p.next) out.push([pstr(p.b, 0), p.b[0x29]]); return out; };

test('DS image: spell names and level headings decode (sanity of the test fixture)', () => {
  assert.equal(dsPstr(0x28E9 + 1 * 0x29).length > 0, true);
  assert.match(dsPstr(0x0A79 + 1 * 0x29), /1st/i);
});

test('BuildSpellList mode 0: memorised spells (0 < id < 80h), heading per level, sl_Ids in order', async () => {
  const g = setup();
  const c = g.SelectedChar;
  // pick two level-1 ids and one level-2 id from the table
  const byLvl = (l) => [...Array(0x38).keys()].slice(1).filter((id) => tbl(id, 1) === l);
  const [a, b] = byLvl(1), [d] = byLvl(2);
  c.b[0x17] = a; c.b[0x18] = 0x80 | b; c.b[0x19] = b; c.b[0x1A] = d;
  assert.equal(await ov22.BuildSpellList(0), 1);
  const L = lines(g);
  assert.deepEqual(L.map((x) => x[1]), [1, 0, 0, 1, 0]);
  assert.match(L[0][0], /1st/i);
  assert.equal(L[1][0], '  ' + dsPstr(0x28E9 + a * 0x29));
  assert.equal(L[2][0], '  ' + dsPstr(0x28E9 + b * 0x29));
  assert.deepEqual(g.sl_Ids.slice(0, 3), [a, b, d]);
});

test('BuildSpellList mode 5: chosen-not-memorised (>= 80h) get " *" and the id without bit 7', async () => {
  const g = setup();
  const c = g.SelectedChar;
  c.b[0x17] = 0x81; c.b[0x18] = 1;
  await ov22.BuildSpellList(5);
  const L = lines(g);
  assert.equal(L.length, 2);
  assert.equal(L[1][0], ' *' + dsPstr(0x28E9 + 1 * 0x29));
  assert.equal(g.sl_Ids[0], 1);
});

test('BuildSpellList mode 1: spell book ids 1..37h with known_spell (+32h+id) <> 0; empty -> false', async () => {
  const g = setup();
  assert.equal(await ov22.BuildSpellList(1), 0);
  g.SelectedChar.b[0x32 + 3] = 1; g.SelectedChar.b[0x32 + 0x37] = 1; g.SelectedChar.b[0x32 + 0x38] = 1;   // 38h not in mode 1
  assert.equal(await ov22.BuildSpellList(1), 1);
  assert.deepEqual(g.sl_Ids.slice(0, 2), [3, 0x37]);
  assert.equal(g.sl_Ids[2], 0);
});

test('BuildSpellList mode 4 (Learn): byte +B1h + class*3 + level <> 0 and not known (fix #fable-4)', async () => {
  const g = setup();
  const c = g.SelectedChar;
  const id = [...Array(0x39).keys()].slice(1).find((i) => tbl(i, 0) === 1 && tbl(i, 1) === 1);   // MU level 1
  c.b[0xB1 + 1 * 3 + 1] = 1;                                                                        // = spell_slots[1*3 + 1 - 1] at +B5h
  await ov22.BuildSpellList(4);
  assert.ok(g.sl_Ids.slice(0, 21).includes(id));
  const muL1 = [...Array(0x39).keys()].slice(1).filter((i) => tbl(i, 0) === 1 && tbl(i, 1) === 1);
  assert.deepEqual(g.sl_Ids.slice(0, muL1.length), muL1);
  c.b[0x32 + id] = 1;                                                                               // known -> excluded
  await ov22.BuildSpellList(4);
  assert.ok(!g.sl_Ids.slice(0, muL1.length).includes(id));
});

test('SpellRange: range + perLvl*level, item cast uses level 6, 0 with area -> 1, FFh -> 1', async () => {
  const g = setup({ SpellCasterLevel: () => 5 });
  for (let id = 1; id <= 0x43; id++) {
    let r = (tbl(id, 2) + tbl(id, 3) * 5) & 0xFF;
    if (r === 0 && tbl(id, 6) !== 0) r = 1;
    if (r === 0xFF) r = 1;
    assert.equal(await ov22.SpellRange(id), r, 'id ' + id);
  }
  g.ItemCast = 1;
  const id = [...Array(0x38).keys()].slice(1).find((i) => tbl(i, 3) !== 0 && tbl(i, 2) !== 0xFF);
  if (id) assert.equal(await ov22.SpellRange(id), (() => { let r = (tbl(id, 2) + tbl(id, 3) * 6) & 0xFF; return r === 0xFF ? 1 : r; })());
});

test('SpellDuration: table formula, special ids 28h/39h/3Bh/3Fh/43h (Roll stubbed n*s)', async () => {
  const g = setup({ SpellCasterLevel: () => 4 });
  assert.equal(await ov22.SpellDuration(0x28), 60);          // Roll(1,6)*10
  assert.equal(await ov22.SpellDuration(0x39), 20);          // Roll(5,4)
  assert.equal(await ov22.SpellDuration(0x3D), 20);
  assert.equal(await ov22.SpellDuration(0x3B), 80);          // Roll(1,4)*10 + 40
  g.game_Mode = 5; assert.equal(await ov22.SpellDuration(0x3F), 200);   // Roll(2,10)*10 in combat
  g.game_Mode = 2; assert.equal(await ov22.SpellDuration(0x3F), 200);   // (Roll(1,10)+10)*10
  assert.equal(await ov22.SpellDuration(0x43), 1440);
  for (const id of [1, 5, 0x10, 0x20]) assert.equal(await ov22.SpellDuration(id), (tbl(id, 4) + tbl(id, 5) * 4) & 0xFFFF);
});

test('ChooseSpell: exit set [#0,#13,C,E,L,M,S]; result 0 for #0/E, else sl_Ids of the highlighted line', async () => {
  const keys = ['X', 'M'];
  const g = setup({ DrawTitledFrame: () => {}, FreeMenuList: async () => null,
    VerticalListMenu: async (...a) => { a[13].v = g.sl_List.next.next; return keys.shift(); } });
  const c = g.SelectedChar;
  const lvl1 = [...Array(0x38).keys()].slice(1).filter((id) => tbl(id, 1) === 1);
  c.b[0x17] = lvl1[0]; c.b[0x18] = lvl1[1];
  await ov22.BuildSpellList(0);
  assert.equal(await ov22.ChooseSpell(1, { v: -1 }), lvl1[1]);   // 'X' loops, 'M' picks line 2 (2nd spell)
  assert.equal(g.sl_List, null);
  await ov22.BuildSpellList(0);
  keys.push('E');
  assert.equal(await ov22.ChooseSpell(1, { v: 0 }), 0);
});

test('SelectTargetsCamp: mode 4 = whole party, mode 0 = not ok, mode 1 = caster', async () => {
  const g = setup();
  const a = newChar(), b = newChar(), d = newChar(); a.next = b; b.next = d; g.PartyHead = a; g.SelectedChar = b;
  const mode = (m) => [...Array(0x44).keys()].slice(1).find((id) => tbl(id, 7) === m);
  const ok = { v: 0 };
  await ov22.SelectTargetsCamp(mode(4), 0, ok);
  assert.equal(ok.v, 1); assert.equal(g.SpellTargetCount, 3); assert.deepEqual(g.SpellTargets.slice(1, 4), [a, b, d]);
  await ov22.SelectTargetsCamp(mode(1), 0, ok);
  assert.equal(ok.v, 1); assert.equal(g.SpellTargetCount, 1); assert.equal(g.SpellTargets[1], b);
  await ov22.SelectTargetsCamp(mode(0), 0, ok);
  assert.equal(ok.v, 0);
});

test('IsScroll: ITEMS class 0Bh..0Dh; UseScrollSpell clears the last matching power, Dec +30h, LoseItem < D2h', async () => {
  const lost = [];
  const g = setup({ LoseItem: async (o, it) => lost.push(it) });
  const t = [...Array(128).keys()].find((i) => ds[0x5582 + i * 16] === 0x0B);
  const it = newItem(); it.b[0x2E] = t ?? 0;
  if (t !== undefined) assert.equal(ov22.IsScroll(it), 1);
  assert.equal(ov22.IsScroll(null), 0);
  it.b[0x3C] = 5; it.b[0x3D] = 0x85; it.b[0x3E] = 7; it.b[0x30] = 0xD2;
  await ov22.UseScrollSpell(g.SelectedChar, it, 5);
  assert.deepEqual([it.b[0x3C], it.b[0x3D], it.b[0x30]], [5, 0, 0xD1]);
  assert.equal(lost.length, 1);
});
