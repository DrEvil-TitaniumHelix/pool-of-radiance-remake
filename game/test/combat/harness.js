// game/test/combat/harness.js — acceptance harness for COMBAT screens (lane por-build-combat; test code, not game code).
// Boots the engine as main.js does (Display, InitGameState), loads a shipped save party, binds the combat area to every
// routine the engine and the other areas already export (by published name), then runs one COMBAT screen.
// Until state.js provides g.ds (engine request #1) the DS image comes from a JS port of decode/tools/unexepack.py
// applied to /data/START.EXE (EXEPACK, see decode/LAYOUT.md "EXEPACK"); build-engine may adopt unexepack() below.

import { Display } from '../../engine/display.js';
import { state as pic } from '../../engine/pictures.js';
import { attachKeyboard, pushChar } from '../../engine/input.js';
import { fetchFile } from '../../engine/dax.js';
import { setRandSeed } from '../../engine/tp.js';
import { setSpeedFactor } from '../../engine/timer.js';
import { G } from '../../engine/state.js';
import * as menus from '../../engine/menus.js';
import { InitGameState } from '../../areas/startup.js';
import { newChar, newItem, newEffect } from '../../engine/ecl.js';
import * as combat from '../../areas/combat.js';
import * as res00ba from '../../areas/res_00ba.js';

// ---- EXEPACK unpack (decode/tools/unexepack.py) -> load module image ----------------------------------------
export function unexepack(raw) {
  const u16 = (b, o) => b[o] | (b[o + 1] << 8);
  const hdr = u16(raw, 8) * 16;
  const cblp = u16(raw, 2), cp = u16(raw, 4);
  const size = cblp ? (cp - 1) * 512 + cblp : cp * 512;
  const lm = raw.subarray(hdr, size);
  const cs = u16(raw, 0x16), eh = cs * 16;
  const destLen = u16(lm, eh + 12), skipLen = lm[eh + 16] === 0x52 ? u16(lm, eh + 14) : 1;   // 'RB' at +10h (18-byte header)
  const srcEnd = cs * 16 - (skipLen - 1) * 16;
  const buf = new Uint8Array(Math.max(destLen * 16, srcEnd));
  buf.set(lm.subarray(0, srcEnd));
  let s = srcEnd - 1, pad = 0;
  while (buf[s] === 0xFF && pad < 16) { s--; pad++; }
  let d = destLen * 16 - 1;
  for (;;) {
    const cmd = buf[s--];
    const len = (buf[s] << 8) | buf[s - 1]; s -= 2;
    if ((cmd & 0xFE) === 0xB0) { const f = buf[s--]; for (let i = 0; i < len; i++) buf[d--] = f; }
    else if ((cmd & 0xFE) === 0xB2) { for (let i = 0; i < len; i++) buf[d--] = buf[s--]; }
    else throw new Error('EXEPACK: bad command ' + cmd.toString(16));
    if (cmd & 1) break;
  }
  return buf.subarray(0, destLen * 16);
}

export async function loadDsImage() {
  const exe = await fetchFile('START.EXE');
  if (!exe) throw new Error('START.EXE not served under /data/');
  const img = unexepack(exe);
  const ds = new Uint8Array(0x8760);                       // DS 0C7C .. SS 14F2 (initialised part + zero BSS)
  ds.set(img.subarray(0xC7C0, Math.min(img.length, 0xC7C0 + 0x8760)));
  return ds;
}

// ---- save-game party (SAVES.md §1: .SAV raw 285 B, .ITM n x 63 B, .SPC n x 9 B, list order) -------------------
export async function loadSaveParty(letter = 'A') {
  let head = null, tail = null;
  for (let n = 1; n <= 8; n++) {
    const base = `SAVE/CHRDAT${letter}${n}`;
    const sav = await fetchFile(base + '.SAV');
    if (!sav) continue;
    const c = newChar(); c.b.set(sav.subarray(0, 0x11D));
    const itm = await fetchFile(base + '.ITM');
    let last = null;
    if (itm) for (let o = 0; o + 0x3F <= itm.length; o += 0x3F) {
      const it = newItem(); it.b.set(itm.subarray(o, o + 0x3F));
      if (last) last.next = it; else c.items = it; last = it;
    }
    const spc = await fetchFile(base + '.SPC');
    let le = null;
    if (spc) for (let o = 0; o + 9 <= spc.length; o += 9) {
      const e = newEffect(); e.b.set(spc.subarray(o, o + 9));
      if (le) le.next = e; else c.effects = e; le = e;
    }
    c.combat = { b: new Uint8Array(0x16) };
    c.readied = new Array(13).fill(null);                 // engine request #3 (readied slots) — filled by RecalcCharacter
    if (tail) tail.next = c; else head = c; tail = c;
  }
  return head;
}

// ---- bindings: every exported function of the engine menus and the other areas, by name -----------------------
export async function bindEverything(extra = {}) {
  const ext = { ...menus };
  for (const m of ['res_00ba.js', 'startup.js', 'view.js', 'ecl_host.js', 'magic.js', 'party.js', 'engine.js']) {
    try { Object.assign(ext, await import('../../areas/' + m)); } catch { /* area not built yet */ }
  }
  combat.bindCombat({ g: G, ext: { ...ext, ...extra } });
}

// ---- screens --------------------------------------------------------------------------------------------------
const ready = (id) => { window.__screenReady = true; window.__screenId = id; };

export const SCREENS = {
  // CH-01/CH-02 = COMBAT-46/47: character sheet + View menu of party member 1 (DOSBox REF-CHARACTER: STING, Load, A, V)
  'CH-02': async () => {
    G.game_Mode = 3;                                       // adventure (the reference opens View from the party screen)
    G.SelectedChar = G.PartyHead; G.ViewChar = G.PartyHead;
    // DOSBox REF-CHARACTER pressed V on the adventure menu "Area Cast View Encamp Search Look": V = option 3, and the
    // menu selection menu_Sel (DS:6B2B) carries over into the View menu (9D00:03BD keeps it) -> same state here.
    menus.menu.sel = 3;
    await bindEverything({
      HorizontalMenu: async (...a) => { const p = menus.HorizontalMenu(...a); setTimeout(() => ready('CH-02'), 200); return p; },
    });
    await combat.ViewMenu({ v: false });
  },
  // CH-03 Items screen (V, I), CH-07 Trade coins (V, T), CH-08 Drop coins (V, D): the View menu gets the key, the
  // screen is complete when the list menu of that screen starts waiting.
  'CH-03': () => viaViewKey('I', 'CH-03'),
  'CH-07': () => viaViewKey('T', 'CH-07'),
  'CH-08': () => viaViewKey('D', 'CH-08'),
};

async function viaViewKey(key, id) {
  G.game_Mode = 3;
  G.SelectedChar = G.PartyHead; G.ViewChar = G.PartyHead;
  let first = true;
  await bindEverything({
    HorizontalMenu: async (...a) => { if (first) { first = false; pushChar(key); } return menus.HorizontalMenu(...a); },
    VerticalListMenu: async (...a) => { setTimeout(() => ready(id), 200); return (await import('../../areas/view.js')).VerticalListMenu?.(...a) ?? new Promise(() => {}); },
  });
  await combat.ViewMenu({ v: false });
}

export async function run(canvas) {
  const q = new URLSearchParams(location.search);
  pic.display = new Display(canvas);
  attachKeyboard(window);
  setSpeedFactor(Number(q.get('fast') || 1));
  await InitGameState();
  if (q.has('seed')) setRandSeed(Number(q.get('seed')));
  await res00ba.ensureRes00baBound();
  await res00ba.ensureDsImage();                                          // DS image + ITEMS at DS:5582
  G.PartyHead = await loadSaveParty(q.get('save') || 'A');
  for (let c = G.PartyHead; c; c = c.next) res00ba.RecalcCharacter(c);   // derived values + readied slots (00BA:0BB8)
  const id = q.get('screen');
  if (!SCREENS[id]) throw new Error('unknown COMBAT screen ' + id);
  await SCREENS[id]();
}
