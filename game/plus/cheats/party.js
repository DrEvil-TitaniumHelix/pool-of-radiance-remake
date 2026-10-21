// Party spec -> TChar records (W11, gbp-cheat), made the way the player makes them: the steps of areas/testparty.js
// (CreateCharacter 7000:056C, ModifyCharacter 7000:209F within RaceAbilityLimits/ClassAbilityMin, XP + TrainCharacter
// 7000:29AE per level with the race level limits, Phlan shop gear via AddItemToChar 3E00:0239, Memorize, RecalcCharacter
// 00BA:0BB8). Anything outside the game's limits throws, unless the member (or the scenario) says "cheat": true — then
// the out-of-limit values are written over the legal character afterwards (UpdateLevelStats + RecalcCharacter re-run).
// Inputs as testparty.js: ds = DS image (G.ds), items = ITEMS, shop = ITEM3.DAX record 53; names come from the DS image.
import { testPartyRules, PARTY, F } from '../../areas/testparty.js';
import { wrW } from '../../engine/ecl.js';
import { setRandSeed } from '../../engine/tp.js';

const ABIL = ['str', 'int', 'wis', 'dex', 'con', 'cha'];
// base classes of each class id (CreateCharacter 7000:0baa; as testparty.js create())
export const BASES = { 8: [0, 2], 9: [0, 2, 5], 10: [0, 4], 11: [0, 5], 12: [0, 6], 13: [2, 5], 14: [2, 6], 15: [2, 5, 6], 16: [5, 6] };
export const basesOf = (cls) => BASES[cls] || [cls];
const sb = (v) => (v << 24) >> 24;

function lookup(kind, value, count, nameOf) {
  if (typeof value === 'number') return value;
  const want = String(value ?? '').trim().toUpperCase().replace(/\s*\/\s*/g, '/');
  for (let i = 0; i < count; i++) if (nameOf(i).trim().toUpperCase().replace(/\s*\/\s*/g, '/') === want) return i;
  throw new Error(`unknown ${kind} "${value}"`);
}

// one member spec -> the record testparty.js's create/modify take (+ targets)
export function normalizeMember(m, rules, index = 0) {
  const T = rules.tables;
  if (!m || typeof m.name !== 'string' || !m.name.trim()) throw new Error(`party[${index}]: name required`);
  const race = lookup('race', m.race, 8, T.RaceName);
  const clsName = Array.isArray(m.classes) ? m.classes.join('/') : m.class ?? m.classes;
  const cls = lookup('class', clsName, 17, T.ClassName);
  const gender = m.gender == null ? 0 : typeof m.gender === 'number' ? m.gender : /^f/i.test(m.gender) ? 1 : 0;
  const align = m.alignment == null ? T.ClassAligns(cls)[0] : lookup('alignment', m.alignment, 9, T.AlignmentName);
  const bases = basesOf(cls);
  const levels = Array.isArray(m.levels) ? m.levels : bases.map(() => m.level ?? 1);
  if (levels.length !== bases.length) throw new Error(`${m.name}: ${bases.length} levels needed for ${T.ClassName(cls)}`);
  const target = new Array(8).fill(0); bases.forEach((k, i) => { target[k] = levels[i]; });
  const like = PARTY.find((p) => p.cls === cls) || PARTY.find((p) => p.race === race) || PARTY[0];
  const stats = m.stats || {};
  const spec = { name: m.name.trim().toUpperCase().slice(0, 15), race, gender, cls, align, pic: m.pic || like.pic,
    exc: stats.exc ?? 'max', learn: m.learn || [], spells: m.spells || [] };
  for (const a of ABIL) spec[a] = stats[a] ?? 'max';
  const items = m.items ?? (PARTY.find((p) => p.cls === cls)?.gear || []).map(([type, readied]) => ({ type, readied: !!readied }));
  return { spec, target, levels, bases, items: items.map((it) => (typeof it === 'number' ? { type: it, readied: false } : it)),
    gold: m.gold ?? 0, hp: m.hp, cheat: !!m.cheat };
}

// Build every member; returns { rules, chars: [{ spec, c, history }] } (the shape testparty.js files() writes).
export function buildParty(party, { ds, items, shop, cheat = false, seed = 0x19881988 } = {}) {
  if (!Array.isArray(party) || party.length < 1 || party.length > 6) throw new Error('party: 1..6 members');
  const rules = testPartyRules({ ds, items, shop });
  setRandSeed(seed);                                                          // as testparty build(): reproducible unk_AB
  const chars = party.map((m, i) => {
    const n = normalizeMember(m, rules, i), allow = cheat || n.cheat;
    const legal = { ...n.spec };
    if (allow) { ABIL.forEach((a) => { legal[a] = 'max'; }); legal.exc = 'max'; }   // a legal character first, overwritten after
    const c = rules.create(legal);
    rules.modify(c, legal);
    const history = [];
    const learn = [...legal.learn.map(rules.SPELL), ...Array.from({ length: 0x38 }, (_, j) => j + 1)];
    const thresholds = [];
    n.bases.forEach((k, j) => { for (let l = 2; l <= n.levels[j]; l++) { const x = rules.tables.XpForLevel(k, l); if (x > 0) thresholds.push(x); } });
    thresholds.sort((a, b) => a - b);
    for (const x of thresholds) {
      if (x > rules.xpOf(c)) rules.setXp(c, x);
      let bits;
      while ((bits = rules.canTrain(c, n.target))) history.push(`xp ${rules.xpOf(c)}: ` + rules.trainOnce(c, bits, learn));
    }
    rules.UpdateLevelStats(c);
    n.bases.forEach((k, j) => {
      const got = sb(c.b[F.level + k]);
      if (got !== n.levels[j]) {
        if (!allow) throw new Error(`${legal.name}: ${rules.tables.ClassName(k)} level ${n.levels[j]} not reachable (race level limit 7000:2a78); use "cheat": true`);
        c.b[F.level + k] = n.levels[j];
      }
    });
    for (const it of n.items) rules.buy(c, it.type, !!it.readied);
    wrW(c.b, F.money + 8, Math.trunc(n.gold / 5)); wrW(c.b, F.money + 6, n.gold % 5);   // SetCharMoneyGold 8900:0130
    for (let k = 0; k < 3; k++) wrW(c.b, F.money + k * 2, 0);
    if (allow) {                                                              // cheat: requested abilities over the legal ones
      for (const a of ABIL) if (typeof n.spec[a] === 'number') c.b[F[a]] = n.spec[a];
      if (typeof n.spec.exc === 'number') c.b[F.str_exc] = n.spec.exc;
      rules.UpdateLevelStats(c);
    }
    if (n.spec.spells.length) rules.memorize(c, n.spec.spells.map(rules.SPELL));
    if (n.hp != null) {
      if (n.hp > c.b[F.hp_max]) { if (!allow) throw new Error(`${legal.name}: hp ${n.hp} > max ${c.b[F.hp_max]}; use "cheat": true`); c.b[F.hp_max] = Math.min(255, n.hp); }
      c.b[F.hp] = Math.max(0, Math.min(255, n.hp));
    }
    rules.RecalcCharacter(c);
    return { spec: legal, c, history };
  });
  return { rules, chars };
}
