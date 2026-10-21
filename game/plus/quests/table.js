// Pool of Radiance quest table (W5, gbp-flags). Evidence for every cell, value and text address: decode/ecl/QUESTS.md.
// Keyed by the quest's main ECL memory cell. No game text here: texts are [dataSet, block, ECL address] of the printing
// instruction, decoded at run time from the player's imported ECLn.DAX (quests/text.js).
//   rules: [cell, op, value, status] — the highest-ranked matching rule gives the flag status (ops: eq, ge, range, bits).
//   marks: [text, status] — a textPrinted event in that block with exactly that text sets a sticky status (Plus state).
//   title: text(s) shown as the quest's name; reward: the clerk's reward text.
export const PROFILE = 'por';
export const STATUS_RANK = Object.freeze({ unknown: 0, offered: 1, accepted: 2, progress: 3, done: 4, closed: 5, rewarded: 6, failed: 6 });
const clerk = (at) => [3, 8, at];
const ORDER_IDS = ['slums', 'sokal', 'books', 'podal', 'kovel', 'nomads', 'kobolds', 'river', 'lizardmen', 'bivant', 'graveyard',
  'cadorna-treasure', 'textile', 'bane-temple', 'zhentil', 'stojanow-gate', 'council-assault',
  'norris', 'temple-area', 'library', 'podal-plaza', 'cadorna-traitor'];

export const QUESTS = Object.freeze({
  // §2.1 City Clerk commissions
  0x4ABB: { id: 'slums', group: 'clerk', conf: 'H', offer: clerk(0xA8B6), reward: clerk(0xA4A6),
    rules: [[0x4ABB, 'range', [1, 0xFD], 'progress'], [0x4ABB, 'eq', 0xFE, 'done'], [0x4ABB, 'eq', 0xFF, 'rewarded']],
    progress: { cell: 0x4ABB, of: 0x19 } },
  0x4AA7: { id: 'sokal', group: 'clerk', conf: 'H', offer: clerk(0xA8F7), reward: clerk(0x9FB8),
    rules: [[0x4AA7, 'eq', 0xFE, 'done'], [0x4AA7, 'eq', 0xFF, 'rewarded']] },
  0x4AAA: { id: 'books', group: 'clerk', conf: 'H', offer: clerk(0xA927),
    rules: [0x4AAA, 0x4AAB, 0x4AAC, 0x4AAD, 0x4AAE, 0x4AAF].flatMap((c) => [[c, 'eq', 0xFF, 'progress'], [c, 'eq', 0xFE, 'done']]) },
  0x4AB0: { id: 'podal', group: 'clerk', conf: 'H', offer: clerk(0xA9BB), reward: clerk(0xA15A),
    rules: [[0x4AB0, 'eq', 1, 'offered'], [0x4AB0, 'eq', 0xFE, 'done'], [0x4AB0, 'eq', 0xFF, 'rewarded']] },
  0x4AB2: { id: 'kovel', group: 'clerk', conf: 'H', offer: clerk(0xAB26), reward: clerk(0xA1C5),
    rules: [[0x4AB2, 'eq', 0xFE, 'done'], [0x4AB2, 'eq', 0xFF, 'rewarded']] },
  0x4AB7: { id: 'nomads', group: 'clerk', conf: 'H', offer: clerk(0xAB89), reward: clerk(0xA34C),
    rules: [[0x4AB7, 'eq', 0xFE, 'done'], [0x4AB7, 'eq', 0xFF, 'rewarded']] },
  0x4AB6: { id: 'kobolds', group: 'clerk', conf: 'H', offer: clerk(0xABCB), reward: clerk(0xA30E),
    rules: [[0x4AB6, 'eq', 0xFE, 'done'], [0x4AB6, 'eq', 0xFF, 'rewarded']] },
  0x4AB3: { id: 'river', group: 'clerk', conf: 'H', offer: clerk(0xAC2C), reward: clerk(0xA20B),
    rules: [[0x4AB3, 'eq', 0xFE, 'done'], [0x4AB3, 'eq', 0xFF, 'rewarded']] },
  0x4AB5: { id: 'lizardmen', group: 'clerk', conf: 'H', offer: clerk(0xAC63), reward: clerk(0xA2C1),
    rules: [[0x4AB5, 'eq', 0xFE, 'done'], [0x4AB5, 'eq', 0xFF, 'rewarded']] },
  0x4AA9: { id: 'bivant', group: 'clerk', conf: 'H', offer: clerk(0xACB0), reward: clerk(0xA027),
    rules: [[0x4A8C, 'eq', 0xFF, 'offered'], [0x4AA9, 'eq', 1, 'progress'], [0x4AA9, 'eq', 0xFE, 'done'],
      [0x4AA9, 'eq', 0x80, 'failed'], [0x4AA9, 'eq', 0xFF, 'closed']],
    marks: [[clerk(0xA027), 'rewarded'], [clerk(0x9E88), 'failed']] },
  0x4AB1: { id: 'graveyard', group: 'clerk', conf: 'H', offer: clerk(0xA5C2), reward: clerk(0xA183),
    rules: [[0x4A96, 'eq', 0xFF, 'accepted'], [0x4AB1, 'eq', 0xFE, 'done'], [0x4AB1, 'eq', 0xFF, 'rewarded']] },
  // §2.2 councillor commissions
  0x4AB8: { id: 'cadorna-treasure', group: 'council', conf: 'H', offer: clerk(0xAA52), reward: clerk(0xA389),
    rules: [[0x4A97, 'eq', 0xFE, 'offered'], [0x4A97, 'eq', 0xFF, 'accepted'], [0x4AC8, 'eq', 1, 'progress'],
      [0x4AC8, 'eq', 0x80, 'progress'], [0x4AB8, 'eq', 0xFE, 'done'], [0x4AB8, 'eq', 0xFF, 'closed']],
    marks: [[clerk(0xA389), 'rewarded'], [clerk(0x9ADA), 'failed']] },
  0x4AE6: { id: 'textile', group: 'council', conf: 'H', title: [clerk(0x9E4A), clerk(0x9E2C)],
    rules: [[0x4AE6, 'eq', 0xFE, 'done'], [0x4AE6, 'eq', 0xFF, 'rewarded']] },
  0x4AB4: { id: 'zhentil', group: 'council', conf: 'M', offer: clerk(0xAD2D), reward: clerk(0xA256),
    rules: [[0x4A98, 'eq', 0xFE, 'offered'], [0x4A98, 'eq', 0xFF, 'accepted'], [0x4AB4, 'eq', 1, 'progress'],
      [0x4AB4, 'eq', 0xFD, 'progress'], [0x4AB4, 'eq', 0xFE, 'done'], [0x4AB4, 'eq', 0xFF, 'rewarded']],
    marks: [[clerk(0xADA6), 'offered']] },
  0x4AB9: { id: 'stojanow-gate', group: 'council', conf: 'H', offer: clerk(0xAE3B), reward: clerk(0xA3CB),
    rules: [[0x4A99, 'eq', 0xFE, 'offered'], [0x4A99, 'eq', 0xFF, 'accepted'], [0x4AB9, 'eq', 0xFE, 'done'], [0x4AB9, 'eq', 0xFF, 'rewarded']] },
  0x4ABA: { id: 'council-assault', group: 'council', conf: 'M', offer: clerk(0xAEC6), reward: clerk(0xA421),
    // 4A9A is also written by ECL7_26 (QUESTS.md §2.2): its FEh/FFh only count together with the summons text.
    rules: [[0x4A9A, 'eq', 0xFE, 'offered'], [0x4ABA, 'eq', 0xFE, 'done'], [0x4ABA, 'eq', 0xFF, 'rewarded']],
    marks: [[clerk(0xB2AA), 'accepted']] },
  0x4ABD: { id: 'bane-temple', group: 'council', conf: 'M', offer: clerk(0xAAC9), reward: clerk(0xA4DC),
    rules: [[0x4A9B, 'eq', 0xFE, 'offered'], [0x4ABD, 'eq', 0xFE, 'done'], [0x4ABD, 'eq', 0xFF, 'rewarded']] },
  // §2.3 other storylines the clerk pays for
  0x4AA6: { id: 'norris', group: 'other', conf: 'H', title: clerk(0x9F77),
    rules: [[0x4AA6, 'eq', 0xFE, 'done'], [0x4AA6, 'eq', 0xFF, 'rewarded']] },
  0x4AA8: { id: 'temple-area', group: 'other', conf: 'H', title: clerk(0x9FFD),
    rules: [[0x4AA8, 'eq', 0xFE, 'done'], [0x4AA8, 'eq', 0xFF, 'rewarded']] },
  0x4AC2: { id: 'library', group: 'other', conf: 'M', title: [clerk(0x9E4A), clerk(0x9DE5)],
    rules: [[0x4A31, 'bits', 0x20, 'progress'], [0x4A31, 'bits', 0x40, 'progress'], [0x4A31, 'bits', 0x60, 'done'], [0x4AC2, 'eq', 0xFF, 'rewarded']] },
  0x4AE7: { id: 'podal-plaza', group: 'other', conf: 'M', title: [clerk(0x9E4A), clerk(0x9E07)],
    rules: [[0x4AE7, 'eq', 0xFE, 'done'], [0x4AE7, 'eq', 0xFF, 'rewarded']] },
  0x4ABF: { id: 'cadorna-traitor', group: 'other', conf: 'M', title: clerk(0xA520), reward: clerk(0xA55E),
    rules: [[0x4ABE, 'ge', 0xFE, 'progress'], [0x4ABF, 'eq', 0xFE, 'done'], [0x4ABF, 'eq', 0xFF, 'rewarded']] },
});

// display order (the clerk's list order, then the summons, then the rest; QUESTS.md §1.1 step 7) — numeric object keys
// iterate by address, so the order is kept here
export const ORDER = Object.freeze(Object.values(QUESTS).map((q) => q.id).sort((a, b) => ORDER_IDS.indexOf(a) - ORDER_IDS.indexOf(b)));
export const GROUPS = Object.freeze({ clerk: 'City Clerk commissions', council: 'Council summons', other: 'Other deeds the council rewards' });

// every cell a rule reads -> the quest keys that use it
export function cellIndex(table = QUESTS) {
  const out = new Map();
  for (const [key, q] of Object.entries(table)) for (const [cell] of q.rules) {
    if (!out.has(cell)) out.set(cell, new Set());
    out.get(cell).add(Number(key));
  }
  return out;
}
// every text address the table refers to (offer, title, reward, marks)
export function textRefs(table = QUESTS) {
  const refs = [];
  const add = (r) => { if (!r) return; if (Array.isArray(r[0])) r.forEach(add); else refs.push(r); };
  for (const q of Object.values(table)) { add(q.offer); add(q.title); add(q.reward); for (const [r] of q.marks || []) add(r); }
  return refs;
}
export const refKey = ([ds, block, at]) => `${ds}:${block}:${at.toString(16).toUpperCase()}`;
