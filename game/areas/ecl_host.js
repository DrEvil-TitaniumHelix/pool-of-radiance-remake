// game/areas/ecl_host.js — binds the ECL VM (engine/ecl.js) to the engine modules and the other areas.
// Owner: por-build-ecl.
//
// - `eclG`: the VM's view of the DS globals. Names the engine keeps elsewhere are redirected (text cursor in text.js,
//   data set / data path in pictures.js, merged names in state.js G); every other name lives in G under the VM's name.
// - `eclHost`: every method of HOST_METHODS. Engine-module routines are bound here with their Pascal argument order;
//   area routines come from the areas' exported host objects (combatHost, magicHost, partyHost, viewHost) when those
//   modules exist; anything still missing is a logged no-op returning 0 (TODO until the owning lane lands it).
// - `EclGameLoop()`: ENGINE MainProgram 0000:013D `ecl_GameLoop` (2F00:32F8).

import { EclVM, HOST_METHODS, newChar, newItem } from '../engine/ecl.js';
import { G } from '../engine/state.js';
import { state as pic } from '../engine/pictures.js';
import * as T from '../engine/text.js';
import { LoadDaxRecord } from '../engine/dax.js';
import { Delay } from '../engine/timer.js';
import { Random } from '../engine/tp.js';
import { HorizontalMenu, VerticalListMenu, NewMenuList, menu } from '../engine/menus.js';
import * as V from './view.js';
import * as V14 from './view_ov14.js';
import * as V28 from './view_ov28.js';
import * as V32 from './view_ov32.js';

// ---- globals facade -----------------------------------------------------------------------------------------
const REDIRECT = {
  text_Col: [T.text, 'col'], text_Row: [T.text, 'row'],                 // DS:5E24 / 5E25
  g_4A00: [T.text, 'TextOutputActive'],                                 // DS:4A00 typewriter / "printing" flag
  DataSet: [pic, 'DataSet'], g_547C: [pic, 'DataPath'],                 // DS:5376 / 547C
  g_49F3: [G, 'game_Mode'], g_557D: [G, 'GameSaved'], g_49F6: [G, 'opt_MonsterPics'],
};
const INIT = { ecl_Stop: 0, ecl_Restart: 0, PartyDead: 0, ecl_Block: 0, MonsterCount: 0, enc_NextIconSlot: 8,
  enc_SpriteId: 0, enc_PicId: 0, party_Ahead: 0, party_CellAttr: 0, view_AreaMap: 0, g_49F9: 0, g_49F8: 0,
  g_49FD: 0, g_49FE: 0, g_4430: 0, g_4431: 0, g_4432: 0, g_4433: 0, g_4434: 0, g_4436: null,
  TreasureMoney: [0, 0, 0, 0, 0, 0, 0], TreasureItems: null };
for (const [k, v] of Object.entries(INIT)) if (!(k in G)) G[k] = v;

export const eclG = new Proxy(G, {
  get(t, k) { const r = REDIRECT[k]; if (r) return r[0][r[1]]; return k in t ? t[k] : 0; },
  set(t, k, v) { const r = REDIRECT[k]; if (r) r[0][r[1]] = v; else t[k] = v; return true; },
});

// ---- engine-module bindings (Pascal argument order as in ecl.js) --------------------------------------------
const warned = new Set();
const todo = (name) => () => { if (!warned.has(name)) { warned.add(name); console.warn('ECL host: ' + name + ' not bound yet'); } return 0; };

const engineHost = {
  clearMenuLine: () => T.ClearMenuLine(),                                          // 9D00:06FB
  drawText: (col, row, colour, s) => T.DrawText(col, row, colour, s),               // 0709:0626
  loadDaxRecord: (name, ext, id) => LoadDaxRecord(pic.DataPath + name, ext, id),   // 0802:0716
  checkEclDisk: () => 0,                                                           // ov17_22D5: one "disk" in the browser
  setDataSet: (n) => { G.PrevDataSet = pic.DataSet; pic.DataSet = n & 0xFF; },     // 0802:094A (engine request #e1: export it from dax.js)
  drawWrappedText: (x1, y1, x2, y2, colour, clear, s) => T.DrawWrappedText(x1, y1, x2, y2, colour, clear, s),   // 0709:0768
  clearTextRectangle: (x1, y1, x2, y2) => T.ClearTextRectangle(x1, y1, x2, y2),    // 0709:0DD3
  drawTitledFrame: (x1, y1, x2, y2, style, colour, title) => T.DrawTitledFrame(x1, y1, x2, y2, style, colour, title),   // 03F1:02E8
  drawRepeatedGlyph: (col, row, colour, count, glyph, textMap) =>                   // 0709:01DF (glyph = VM byte + 1, no text map)
    T.DrawRepeatedGlyph(col, row, colour, count, String.fromCharCode(glyph), textMap),
  showBottomPromptAndReadKey: (colour, s) => T.ShowBottomPromptAndReadKey(colour, s),   // 0709:0BF5
  messageDelay: () => T.MessageDelay(),                                             // 0709:0DBE
  delay: (ms) => Delay(ms),                                                         // Crt.Delay
  readWordNumber: (prompt, colour) => T.ReadWordNumber(prompt, colour),             // 0709:0B66
  readBottomLine: (prompt, colour, maxLen) => T.ReadBottomLine(prompt, colour, maxLen),   // 0709:09E3
  random: (n) => Random(n),                                                         // System RandomWord
  verticalListMenu: async (o) => {                                                  // 4300:1788 EclVerticalListMenu -> 9D00:0D9A
    const list = NewMenuList(o.items.length, { v: null });
    let p = list; for (const t of o.items) { p.text = t; p.isHeader = 0; p = p.next; }   // 2f00:0fb9 node text, +29h := 0
    const index = { v: 0 }, cur = { v: list };
    await VerticalListMenu(o.title, o.keys, o.c24, o.c22, o.c20, o.x1, o.y1, o.x2, o.y2, list, o.b12, { v: 1 }, index, cur);
    return index.v;
  },
  horizontalMenu: async (title, items, c0E, c0C, c0A, allowExt, animate) => {       // 9D00:03BD -> { key: code, special }
    const r = await HorizontalMenu(title, items, c0E, c0C, c0A, allowExt, animate);
    return { key: r.key.charCodeAt(0), special: r.ext ? 1 : 0 };
  },
  // VIEW ov29 map access (game/areas/view.js)
  load3DMap: (id) => V.Load3DMap(id),                                               // B100:10C7
  getWallType: (x, y, dir) => V.GetWallType(x, y, dir),                             // B100:047B
  getCellAttr: (x, y) => V.GetCellAttr(x, y),                                       // B100:057A
  refreshView: () => V.RefreshView(),                                              // A200:016D
  loadWallSet: (id, slot) => V.LoadWallSet(id, slot),                              // B100:0E08
  clearWallSlot: (slot) => V.ClearWallSlot(slot),                                  // 2F00:0D97
  exploreCommand: () => V14.ExploreCommand(),                                      // 6600:0989
  loadAnimation: (name, id, flags) => V28.LoadAnimation(name, id, flags),          // AC00:00A2 into g_6ABE
  show3DSprite: (k) => V28.Show3DSprite(k),                                        // AC00:0708 (k, g_6ABE)
  drawPictureScreenOrView: (col, row, toView) => V28.DrawPictureScreenOrView(col, row, toView, V.view.anim.pic[1]),   // AC00:0000 (.., g_6AC4)
  loadPortrait: (head, body) => V28.LoadPortrait(head, body),                      // AC00:05D9
  drawPortrait: (col, row, both) => V28.DrawPortrait(col, row, both),              // AC00:0697
  loadCombatIcon: (name, id, slot) => V32.LoadCombatIcon(name, id, slot),          // C000:01C8
  load24x24Set: (name, start, n) => V32.Load24x24Set(name, start, n),              // C000:0022
  moveParty: () => V14.MoveParty(),                                                // 6600:0D6D
};

export const eclHost = {};
export let vm = null;

// Host methods implemented by other areas' routines under their published names (decode/names/*.json); var
// parameters are { v } objects as in those areas. Bound after the <area>Host objects, only where a routine exists.
const BY_NAME = {
  redrawCurrentMode: (X) => () => X.RedrawCurrentMode(),                                         // 00BA:27D9
  drawPartyRoster: (X) => (c) => X.DrawPartyRoster(c),                                           // 00BA:0767
  drawLocationTimeStatus: (X) => () => X.DrawLocationTimeStatus(),                               // 00BA:290B
  recalcCharacter: (X) => (c) => X.RecalcCharacter(c),                                           // 00BA:0BB8
  selectPartyCharacter: (X) => async (prompt, allowExit, cur) => { const s = { v: cur }; await X.SelectPartyCharacter(prompt, allowExit, s); return s.v; },   // 00BA:2C48
  hasEffect: (X) => (c, id) => X.HasEffect(c, id),                                                // 00BA:2199
  applyDamage: (X) => (c, dmg) => X.ApplyDamage(c, dmg),                                          // ECL 4300:21E2
  loseItem: (X) => (c, it) => X.LoseItem(c, it),                                                  // 00BA:1509
  buildItemName: (X) => (c, it, a, b, d, e) => X.BuildItemName(c, it, a, b, d, e),                // 00BA:0442
  cycleSelectedChar: (X) => (key) => X.CycleSelectedChar(String.fromCharCode(key)),              // ov19 (scan char)
  playOrStopSound: (X) => (snd) => X.PlayOrStopSound(snd),                                        // 08AE:00DC
  shop: (X) => () => X.Shop(),                                                                    // ov06_053E
  temple: (X) => () => X.Temple(),                                                                // ov04_0D09
  combatMain: (X) => () => X.CombatMain(),                                                        // ov08_007A
  camp: (X) => async () => { const r = { v: 0 }; await X.Camp(r); return r.v; },                  // ov15_1E6F (var rested)
  advanceClock: (X) => (count, unit) => X.AdvanceClock(count, unit),                              // ov20_03D5
  loadMonster: (X) => async (id) => { const c = newChar(); await X.LoadMonster(id, c); return c; },   // ov17_0EC4
  addNpcToParty: (X) => (id) => X.AddNpcToParty(id),                                              // ov17_1262
  makeTreasureItem: (X) => (typ) => { const it = newItem(); X.MakeTreasureItem(typ, it); return it; },   // ov21_1010
  removeFromParty: (X) => (a, b) => X.RemoveFromParty(a, b),                                      // ov16_3291
  partyCreationMenu: (X) => () => X.PartyCreationMenu(),                                          // ov16_0161
  dragonFinale: (X) => () => X.DragonFinale(),                                                    // ov18_02A4
  recolourOverlandTiles: (X) => (a) => X.RecolourOverlandTiles(a),                                // ov18_06B3
};

// Merge: engine bindings, then every area host object that exists (later areas may override engine stubs).
export async function bindEclHost() {
  Object.assign(eclHost, engineHost);
  for (const [mod, name] of [['./combat.js', 'combatHost'], ['./magic.js', 'magicHost'], ['./party.js', 'partyHost'], ['./view.js', 'viewHost']]) {
    try { const m = await import(mod); if (m[name]) Object.assign(eclHost, m[name]); }
    catch (e) { if (!/Failed to fetch|Cannot find|not found|404/i.test(String(e && e.message))) console.warn('ECL host: ' + mod + ': ' + e.message); }
  }
  const pub = {};
  for (const mod of ['./res_00ba.js', './combat.js', './magic.js', './party.js', './party_ov17.js', './party_ov20.js', './party_ov21.js', '../engine/audio.js']) {   // audio: PlayOrStopSound 08AE:00DC (#qa-5)
    try {
      const m = await import(mod);
      if (typeof m.initRes00ba === 'function') await m.initRes00ba();               // res00ba self-binding + DS image + unit init
      for (const [k, v] of Object.entries(m)) if (typeof v === 'function' && !(k in pub)) pub[k] = v;
    }
    catch { /* area not built yet */ }
  }
  for (const [k, mk] of Object.entries(BY_NAME)) {
    const X = new Proxy({}, { get: (_, n) => pub[n] });
    const probe = mk.toString().match(/X\.(\w+)/);
    if (probe && typeof pub[probe[1]] === 'function' && typeof eclHost[k] !== 'function') eclHost[k] = mk(X);
  }
  for (const k of HOST_METHODS) if (typeof eclHost[k] !== 'function') eclHost[k] = todo(k);
  vm = new EclVM(eclHost, eclG);
  V.view.g = eclG; V.view.m0 = (a) => vm.m0(a); V.view.setM0 = (a, v) => vm.setM0(a, v);
  V.view.m1 = (a) => vm.m1(a); V.view.setM1 = (a, v) => vm.setM1(a, v);
  V.view.setEclPC = (pc) => { vm.pc = pc; }; V.view.vecB = () => vm.vecB;
  menu.forceAnim = () => vm.m0(0x4AFF) !== 0;                                       // ecl_Mem4900^.w[$3FE] (VIEW 9D00:04CC)
  menu.clearForceAnim = () => vm.setM0(0x4AFF, 0);
  return vm;
}

// 0000:013D -> 2F00:32F8
export async function EclGameLoop() {
  if (!vm) await bindEclHost();
  await vm.gameLoop();
}

// Temporary resume of SAVGAM<x>.DAT into the VM (SAVES.md §2 blocks 1..4 + position) until build-party's LoadGame
// (ov17_1602) lands; the characters are loaded by PARTY. Returns the parsed header fields.
export function resumeSaveIntoVM(bytes) {
  const rd = (o) => bytes[o] | (bytes[o + 1] << 8);
  eclG.DataSet = bytes[0];
  for (let i = 0; i < 0x400; i++) vm.mem4900[i] = rd(1 + 2 * i);
  for (let i = 0; i < 0x400; i++) vm.mem6B00[i] = rd(2049 + 2 * i);
  for (let i = 0; i < 0x200; i++) vm.mem9700[i] = rd(4097 + 2 * i);
  vm.code.set(bytes.subarray(5121, 5121 + 0x1E00));
  eclG.party_MapX = bytes[12801]; eclG.party_MapY = bytes[12802]; eclG.party_Dir = bytes[12803];
  eclG.travel_Mode = bytes[12806]; eclG.g_49F3 = bytes[12807];
  eclG.g_49F8 = 1;                                                                  // ResumingSave: keep the saved script
  return { members: bytes[12808] };
}
