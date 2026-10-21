// W11 cheats (gbp-cheat): party builder + scenario save writer. node --test game/test/plus/cheats.test.mjs
// Needs the local originals (env POR_DATA, as game/test/party/testparty.test.mjs); nothing of them is stored.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDir, DaxRleDecode } from '../../engine/dax.js';
import { F, readParty } from '../../areas/testparty.js';
import { originals } from '../party/testparty.test.mjs';
import { buildParty } from '../../plus/cheats/party.js';
import { scenarioFiles, validateScenario, flagOffset, summary } from '../../plus/cheats/scenario.js';

const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../../..');
const POR = process.env.POR_DATA || path.resolve(ROOT, '../re-targets/goldbox/por/POOLRAD');
const skip = !existsSync(path.join(POR, 'START.EXE')) && 'originals not present (POR_DATA)';
const rec = (file, id) => {
  const d = new Uint8Array(readFileSync(path.join(POR, file))), { dataStart, entries } = readDir(d), e = entries.find((x) => x.id === id);
  return e ? DaxRleDecode(d.subarray(dataStart + e.ofs, dataStart + e.ofs + e.comp), e.comp, e.raw) : null;
};
const sokal = () => JSON.parse(readFileSync(path.join(ROOT, 'game/scenarios/sokal-gate.json'), 'utf8'));
const inputs = (s) => ({ ...originals(POR), ecl: rec(`ECL${s.dataset}.DAX`, s.block), geo: rec(`GEO${s.dataset}.DAX`, s.map ?? s.block) });
const word = (g, addr) => g[flagOffset(addr)] | (g[flagOffset(addr) + 1] << 8);

test('sokal-gate: six level-5 characters, placed in data set 4 block 21 at (8,14) N, clock 09:00', { skip }, () => {
  const s = sokal(), b = scenarioFiles(s, inputs(s));
  assert.equal(b.slot, 'J');
  const d = summary(b);
  assert.deepEqual(d.map((c) => c.level), ['5', '5', '5', '5', '5', '5/5']);
  for (const c of d) { const [hp, max] = c.hp.split('/').map(Number); assert.equal(hp, max); assert.ok(max > 0); }
  const files = new Map(b.files), g = files.get('SAVGAMJ.DAT');
  assert.equal(g.length, 13137);
  assert.equal(g[0], 4); assert.equal(word(g, 0x49F2), 21); assert.equal(word(g, 0x49C5), 21); assert.equal(g[1 + 0x800 + 0x624], 4);
  assert.deepEqual([...g.subarray(12801, 12804)], [8, 14, 0]);
  assert.equal(g[12805], rec('GEO4.DAX', 21)[2 + 0x200 + 14 * 16 + 8]);       // cell attribute of (8,14)
  assert.equal(g[12806], 1); assert.equal(g[12807], 2);                      // 3D, back into the game
  assert.equal(word(g, 0x49C9), 9); assert.equal(word(g, 0x49CA), 1);         // hour 9, day 1
  const ecl = rec('ECL4.DAX', 21);
  assert.deepEqual(g.subarray(5121, 5121 + 64), ecl.subarray(2, 66));        // the block's code from the player's ECL4.DAX
  const back = readParty((n) => files.get(n) || null, 'J');
  assert.equal(back.chars.length, 6); assert.equal(word(back.g, 0x49F2), 21);
  const again = scenarioFiles(s, inputs(s));                                  // deterministic
  for (const [n, bytes] of again.files) assert.deepEqual(bytes, files.get(n), n);
});

test('the game\'s limits hold unless "cheat": true', { skip }, () => {
  const base = { name: 'X', race: 'Human', class: 'Fighter', level: 5 };
  const o = originals(POR);
  assert.throws(() => buildParty([{ ...base, stats: { str: 19 } }], o), /outside/);
  assert.throws(() => buildParty([{ ...base, race: 'Elf', level: 9 }], o), /not reachable/);
  assert.throws(() => buildParty([{ ...base, race: 'Elf', class: 'Cleric' }], o), /not offered/);
  assert.throws(() => buildParty([{ ...base, hp: 250 }], o), /cheat/);
  assert.throws(() => buildParty([{ ...base, class: 'Paladinish' }], o), /unknown class/);
  const { chars } = buildParty([{ ...base, race: 'Elf', level: 9, stats: { str: 19 }, hp: 250, cheat: true }], o);
  const c = chars[0].c;
  assert.equal(c.b[F.str], 19); assert.equal(c.b[F.level + 2], 9); assert.equal(c.b[F.hp], 250); assert.equal(c.b[F.hp_max], 250);
  const multi = buildParty([{ name: 'Y', race: 'Elf', classes: ['Fighter', 'Magic-User'], levels: [3, 4] }], o).chars[0].c;
  assert.deepEqual([multi.b[F.level + 2], multi.b[F.level + 5]], [3, 4]);
  assert.throws(() => buildParty([{ name: 'Z', race: 'Elf', class: 'Fighter/Magic-User', levels: [3] }], o), /2 levels/);
});

test('flags and validation', { skip }, () => {
  const s = { ...sokal(), flags: { '4AA7': 254, '0x4A97': '0xFF' }, slot: 'c' };
  const b = scenarioFiles(s, inputs(s)), g = new Map(b.files).get('SAVGAMC.DAT');
  assert.equal(word(g, 0x4AA7), 0xFE); assert.equal(word(g, 0x4A97), 0xFF);
  assert.throws(() => validateScenario({ ...sokal(), flags: { C04B: 1 } }), /saved ECL region/);
  assert.throws(() => validateScenario({ ...sokal(), flags: { '4AA7': 70000 } }), /word value/);
  assert.throws(() => validateScenario({ ...sokal(), x: 16 }), /0\.\.15/);
  assert.throws(() => validateScenario({ ...sokal(), facing: 'Q' }), /facing/);
  assert.throws(() => validateScenario({ ...sokal(), slot: 'K' }), /slot/);
  assert.throws(() => scenarioFiles({ ...sokal(), party: [] }, inputs(sokal())), /1\.\.6/);
});

test('flag offsets follow the saved regions (SAVES.md §2)', () => {
  assert.equal(flagOffset(0x4900), 1); assert.equal(flagOffset(0x49F2), 1 + 0xF2 * 2);
  assert.equal(flagOffset(0x6B00), 1 + 0x800); assert.equal(flagOffset(0x9700), 1 + 0x1000);
  assert.throws(() => flagOffset(0x4D00)); assert.throws(() => flagOffset(0x9900));
});
