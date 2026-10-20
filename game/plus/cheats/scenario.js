// Scenario = state injection as a genuine saved game (W11, gbp-cheat). The party is built by cheats/party.js, written
// by testparty.js files() (WriteCharacter 7500:069E / SaveGame 7500:1D58 layout), then SAVGAM is placed in the scenario's
// block the way the RUN-3 area saves are (acceptance/integration/mkareasaves.py; decode/data/SAVES.md §2) and loaded by
// the game's own LoadGame (7500:1602): data set, Mem[49F2] block, Mem[49C5] map, the block's ECL code from the player's
// ECLn.DAX, x/y/facing/cell attribute, travel mode, game_Mode 2 (back into the game), flags, clock.
// Schema: game/scenarios/schema.json. Nothing of the original data is stored: ECL/GEO/ITEMS/START.EXE are read at run time.
import { buildParty } from './party.js';

export const FACING = { N: 0, E: 1, S: 2, W: 3 };
const O = { mem4900: 1, mem6B00: 1 + 0x800, mem9700: 1 + 0x1000, code: 1 + 0x1400, pos: 12801, travel: 12806, mode: 12807 };
export const CLOCK = ['round', 'minute1', 'minute10', 'hour', 'day', 'month', 'year'];   // VM 49C6..49CC (hooks.state.clock)

// flag address -> SAVGAM byte offset of its word (regions 0..2 are saved, SAVES.md §2; ECL_VM.md §3)
export function flagOffset(addr) {
  if (addr >= 0x4900 && addr < 0x4D00) return O.mem4900 + 2 * (addr - 0x4900);
  if (addr >= 0x6B00 && addr < 0x6F00) return O.mem6B00 + 2 * (addr - 0x6B00);
  if (addr >= 0x9700 && addr < 0x9900) return O.mem9700 + 2 * (addr - 0x9700);
  throw new Error(`flag ${addr.toString(16)}: not in a saved ECL region (4900..4CFF, 6B00..6EFF, 9700..98FF)`);
}
// flag keys are hex addresses ("4AA7" or "0x4AA7"); values numbers or "0xFE"
const addrOf = (k) => { if (!/^(0x)?[0-9a-f]{4}$/i.test(k)) throw new Error(`flag "${k}": hex address expected`); return parseInt(k.replace(/^0x/i, ''), 16); };
const valueOf = (v, k) => { const n = typeof v === 'string' ? Number(v) : v; if (!Number.isInteger(n) || n < 0 || n > 0xFFFF) throw new Error(`flag ${k}: word value expected`); return n; };

export function validateScenario(s) {
  if (!s || typeof s !== 'object') throw new Error('scenario: object expected');
  for (const k of ['dataset', 'block', 'x', 'y']) if (!Number.isInteger(s[k])) throw new Error(`scenario.${k}: integer required`);
  if (s.dataset < 1 || s.dataset > 8) throw new Error('scenario.dataset: 1..8');
  if (s.x < 0 || s.x > 15 || s.y < 0 || s.y > 15) throw new Error('scenario.x/y: 0..15');
  if (!(String(s.facing ?? 'N').toUpperCase() in FACING)) throw new Error('scenario.facing: N, E, S or W');
  if (s.slot != null && !/^[A-J]$/i.test(s.slot)) throw new Error('scenario.slot: A..J');
  for (const [a, v] of Object.entries(s.flags || {})) { flagOffset(addrOf(a)); valueOf(v, a); }
  return s;
}

// The save files of a scenario: [[name, bytes], ...]. inputs: { ds, items, shop, ecl (ECL<ds>.DAX record), geo (GEO<ds>.DAX record or null) }
export function scenarioFiles(s, { ds, items, shop, ecl, geo }) {
  validateScenario(s);
  const slot = String(s.slot || 'J').toUpperCase();
  const { rules, chars } = buildParty(s.party, { ds, items, shop, cheat: !!s.cheat });
  for (const it of s.items || []) {                                          // shared extras: { to: member index, type, readied }
    const m = chars[it.to ?? 0]; if (!m) throw new Error(`items: no member ${it.to}`);
    rules.buy(m.c, it.type, !!it.readied); rules.RecalcCharacter(m.c);
  }
  const files = rules.files(chars, slot);
  const g = files.find(([n]) => n.startsWith('SAVGAM'))[1], gv = new DataView(g.buffer, g.byteOffset);
  const w = (off, v) => gv.setUint16(off, v & 0xFFFF, true);
  const mapId = s.map ?? s.block;
  g[0] = s.dataset;                                                          // DataSet
  w(flagOffset(0x49F2), s.block);                                            // ECL block resumed by ecl_GameLoop 2F00:32F8
  w(flagOffset(0x49C5), mapId);                                              // Load3DMap in LoadGame
  g[O.mem6B00 + 0x624] = s.dataset;                                          // LoadGame 7500:1bc1 takes the data set from here
  for (let k = 0; k < 3; k++) w(O.mem4900 + 0x3F4 + 2 * k, 0xFFFF);          // wall sets: the block's LOAD_PIECES loads its own
  if (s.dataset === 5 && [3, 4, 5].includes(s.block)) { w(flagOffset(0x49E7), 1); w(flagOffset(0x49E8), 1); }   // castle LOAD_PIECES
  if (!ecl || ecl.length < 3) throw new Error(`ECL${s.dataset}.DAX record ${s.block} missing`);
  g.fill(0, O.code, O.code + 0x1E00); g.set(ecl.subarray(2, 2 + 0x1E00), O.code);   // LoadEclBlock skips the 2-byte header
  const attr = geo && geo.length >= 2 + 0x300 ? geo[2 + 0x200 + s.y * 16 + s.x] : 0;
  g.set([s.x, s.y, FACING[String(s.facing ?? 'N').toUpperCase()] * 2, 0, attr], O.pos);
  g[O.travel] = s.travelMode ?? ({ 0x19: 2, 0x1A: 3, 0x1B: 4 }[s.block] || 1);   // ecl_RunAfterNewBlock table
  g[O.mode] = 2;                                                             // LoadGame returns into the game
  for (const [a, v] of Object.entries(s.flags || {})) w(flagOffset(addrOf(a)), valueOf(v, a));
  if (s.clock) {
    const c = s.clock, m = c.minute ?? 0;
    const words = { round: c.round ?? 0, minute1: m % 10, minute10: Math.trunc(m / 10), hour: c.hour ?? 0, day: c.day ?? 0, month: c.month ?? 0, year: c.year ?? 0 };
    CLOCK.forEach((k, i) => w(flagOffset(0x49C6 + i), words[k]));
  }
  return { slot, files, chars, rules };
}

// browser inputs through the engine's own readers (works with /data/ and BYOC)
export async function scenarioInputs(s) {
  const { G, initState } = await import('../../engine/state.js');
  const { fetchFile, LoadDaxRecord } = await import('../../engine/dax.js');
  if (!G.ds) await initState();
  return { ds: G.ds, items: await fetchFile('ITEMS'), shop: await LoadDaxRecord('ITEM3', '.DAX', 53),
    ecl: await LoadDaxRecord(`ECL${s.dataset}`, '.DAX', s.block), geo: await LoadDaxRecord(`GEO${s.dataset}`, '.DAX', s.map ?? s.block) };
}
export async function fetchScenario(name) {
  if (!/^[a-z0-9-]+$/i.test(name)) throw new Error('scenario name: letters, digits, -');
  const r = await fetch(new URL(`../../scenarios/${name}.json`, import.meta.url));
  if (!r.ok) throw new Error(`scenario ${name} not found`);
  return r.json();
}
// write the scenario's save into the game's save store (other CHRDAT<slot>* erased, as installTestParty)
export async function installScenario(s, { inputs } = {}) {
  if (typeof s === 'string') s = await fetchScenario(s);
  const built = scenarioFiles(s, inputs || await scenarioInputs(s));
  const { writeFile, eraseFile } = await import('../../engine/files.js');
  const written = new Set(built.files.map(([n]) => n));
  for (const [n, b] of built.files) await writeFile(n, b);
  for (let i = 1; i <= 8; i++) for (const e of ['SAV', 'ITM', 'SPC']) { const n = `CHRDAT${built.slot}${i}.${e}`; if (!written.has(n)) await eraseFile(n); }
  return built;
}
// ?scenario=<name> at boot (hooks request #12: called by engine/main.js after initState): install, then type L <slot>
// at the party menu through the engine's key script, i.e. the player's own "Load Saved Game".
export async function bootScenario(name) {
  const built = await installScenario(name);
  const { script } = await import('../../engine/input.js');
  script.keys = [[0x4C, 0], [built.slot.charCodeAt(0), 0], ...(script.keys || [])];
  return built;
}

// party summary for the tab / tests
export const summary = (built) => built.chars.map(({ c }) => built.rules.describe(c));
