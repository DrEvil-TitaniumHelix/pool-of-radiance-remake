// Live cheats (W11, gbp-cheat): edits of the running game while the Plus panel holds the game (input suspended, the
// engine waits for a key). Writes go to the engine's own records: TChar bytes of G.PartyHead members (then
// UpdateLevelStats 9300:0000 / RecalcCharacter 00BA:0BB8 as the game runs them), party_MapX/Y/Dir, and ECL memory
// through vm.setMem (4300:0C77 ecl_SetMem, so flagSet is reported like a script write). Developer use only.
import { F, testPartyRules } from '../../areas/testparty.js';
import { pstr, rdW, wrW } from '../../engine/ecl.js';

const sb = (v) => (v << 24) >> 24;
let host;
async function engine() {
  if (!host) {
    const m = await import('../../areas/ecl_host.js');                     // namespace: `vm` is a live binding
    host = { G: m.eclG, vm: () => m.vm };
  }
  const vm = host.vm(); if (!vm) throw new Error('the game is not running yet');
  return { G: host.G, vm };
}
let rules;
async function gameRules(G) {
  if (!rules) {
    const { fetchFile, LoadDaxRecord } = await import('../../engine/dax.js');
    rules = testPartyRules({ ds: G.ds, items: await fetchFile('ITEMS'), shop: await LoadDaxRecord('ITEM3', '.DAX', 53) });
  }
  return rules;
}
function members(G) { const out = []; for (let c = G.PartyHead; c && out.length < 8; c = c.next) out.push(c); return out; }
function member(G, i) { const c = members(G)[i]; if (!c) throw new Error(`no party member ${i + 1}`); return c; }

export async function liveParty() {
  const { G } = await engine();
  return members(G).map((c, i) => ({ index: i, name: pstr(c.b, 0), levels: Array.from({ length: 8 }, (_, k) => sb(c.b[F.level + k])),
    hp: c.b[F.hp], hpMax: c.b[F.hp_max], gold: rdW(c.b, F.money + 6), platinum: rdW(c.b, F.money + 8) }));
}
export async function setHp(i, hp, { cheat = false } = {}) {
  const { G } = await engine(), c = member(G, i);
  if (!Number.isInteger(hp) || hp < 0 || hp > 255) throw new Error('HP: 0..255');
  if (hp > c.b[F.hp_max]) { if (!cheat) throw new Error(`HP above the maximum ${c.b[F.hp_max]} needs cheat`); c.b[F.hp_max] = hp; }
  c.b[F.hp] = hp;
}
export async function setGold(i, gold) {
  const { G } = await engine(), c = member(G, i);
  if (!Number.isInteger(gold) || gold < 0 || gold > 0xFFFF) throw new Error('gold: 0..65535');
  wrW(c.b, F.money + 6, gold);
}
// class level by class id (0 cleric .. 7); the class must be one of the character's
export async function setLevel(i, cls, level) {
  const { G } = await engine(), c = member(G, i);
  if (sb(c.b[F.level + cls]) <= 0) throw new Error('not one of this character\'s classes');
  if (!Number.isInteger(level) || level < 1 || level > 127) throw new Error('level: 1..127');
  const r = await gameRules(G);
  c.b[F.level + cls] = level;
  r.UpdateLevelStats(c); r.RecalcCharacter(c);
}
export async function teleport(x, y, facing) {
  const { G } = await engine();
  if (![x, y].every((v) => Number.isInteger(v) && v >= 0 && v <= 15)) throw new Error('x, y: 0..15');
  if (!Number.isInteger(facing) || facing < 0 || facing > 3) throw new Error('facing: N E S W');
  G.party_MapX = x; G.party_MapY = y; G.party_Dir = facing * 2;
}
export async function getFlag(addr) { const { vm } = await engine(); return vm.getMem(addr); }
export async function setFlag(addr, value) {
  const { vm } = await engine();
  if (!Number.isInteger(addr) || addr < 0 || addr > 0xFFFF) throw new Error('address: hex word');
  if (!Number.isInteger(value) || value < 0 || value > 0xFFFF) throw new Error('value: 0..FFFF');
  await vm.setMem(addr, value);
  return vm.getMem(addr);
}
