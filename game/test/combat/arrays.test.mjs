// arrays.test.mjs — combat fix request #p1-2: every array-valued global that combat_*.js / res_00ba*.js index (g.X[...])
// must be an array as soon as the modules are loaded (the shared state may still hold the plain DS word).
// The list is taken from the sources, so a new indexed global is checked automatically.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { G } from '../../engine/state.js';
import '../../areas/combat.js';
import { setEclHostModule, ensureSharedArrays } from '../../areas/res_00ba.js';

const AREAS = join(dirname(fileURLToPath(import.meta.url)), '../../areas');
const files = readdirSync(AREAS).filter((f) => /^(combat_|res_00ba).*\.js$/.test(f));
const used = new Map();
for (const f of files) {
  const src = readFileSync(join(AREAS, f), 'utf8').replace(/\/\/.*$/gm, '');   // code only, no comments
  for (const m of src.matchAll(/\bg\.([A-Za-z_][A-Za-z0-9_]*)(?:\?\.)?\[/g)) {
    if (!used.has(m[1])) used.set(m[1], new Set());
    used.get(m[1]).add(f);
  }
}
// g.ds: the DS image is loaded asynchronously (ensureDsImage; engine request #1), checked in res00ba tests.
const EXCLUDED = new Set(['ds']);

test('every indexed global of combat_*.js / res_00ba*.js is an array after module load', () => {
  assert.ok(used.size >= 15, `found ${used.size} indexed globals`);
  const bad = [];
  for (const [name, where] of used) {
    if (EXCLUDED.has(name)) continue;
    const v = G[name];
    if (!(Array.isArray(v) || v instanceof Uint16Array || v instanceof Uint8Array)) bad.push(`${name} = ${v} (${[...where].join(', ')})`);
  }
  assert.deepEqual(bad, []);
});

test('MeleeAttack-style writes work on the fresh state (crash 4 of RUN P1-f)', () => {
  G.SlotHits[1] = 0; G.SlotHits[2] = 0; G.SlotSwings[1] = 0; G.SlotSwings[2] = 0;
  G.SlotSwings[1] = G.SlotSwings[1] + 1;
  assert.equal(G.SlotSwings[1], 1);
  assert.equal(G.BodyList.length, 9);
  assert.equal(G.BodyList[8].char, null);
  assert.equal(G.tg_List[72].who, 0);
  assert.equal(G.cb_Char[72], null);
  assert.deepEqual(G.side_ActiveCount, [0, 0]);
});

test('ECL memory regions are the live VM arrays (no copies)', () => {
  const vm = { mem4900: new Uint16Array(0x400), mem6B00: new Uint16Array(0x400), mem9700: new Uint16Array(0x200) };
  setEclHostModule({ vm });
  assert.equal(G.ecl_Mem6B00, vm.mem6B00);
  assert.equal(G.ecl_Mem4900, vm.mem4900);
  G.ecl_Mem6B00[0x5CC >> 1] = 7;
  assert.equal(vm.mem6B00[0x5CC >> 1], 7);
});

test('an array another area already made is never replaced', () => {
  const g = { BodyList: ['keep'], SlotHits: 0 };
  ensureSharedArrays(g);
  assert.deepEqual(g.BodyList, ['keep']);
  assert.ok(Array.isArray(g.SlotHits));
});

test('CombatIcons is only reached through VIEW combatIcons() (its slot shape), never as a plain g.CombatIcons[ index', () => {
  const where = used.get('CombatIcons');
  assert.equal(where, undefined, `direct g.CombatIcons[ in ${where && [...where]}`);
});
