// input.js — keyboard as the original sees it: the BIOS key buffer of (ASCII, scan code) words read through Crt.ReadKey
// por-only: Pool BIOS reader semantics, STING controls and pointer menu mappings (whole module) (profile: engine.id (decoded adapter); game/profiles/PORONLY.md)
// (0A40:030F: an extended key returns #0 first and its scan code on the next call) and Crt.KeyPressed (0A40:02FD), plus the
// game's own reader ReadGameKey 0899:0059. Gamepad and mouse are an added layer that injects ordinary keys (BUILD_PLAN §2).

import { sleep } from './timer.js';

let inputPauseGate = () => false;
export function setInputPauseGate(gate) { inputPauseGate = typeof gate === 'function' ? gate : () => false; }
const inputPaused = () => !!inputPauseGate();

const buffer = [];            // BIOS type-ahead buffer: {ascii, scan}
let pendingScan = null;       // Crt: scan code of an extended key still to be returned
const waiters = [];

export const keyState = {
  sting: false,               // ParamStr(1) = 'STING' (?sting=1)
  onSoundToggle: null,        // ReadGameKey ^S hook (audio.js)
  onDebugToggle: null,        // ^D in STING mode
  onTerminate: null,          // ^C in STING mode
};

// last keys typed (for the error report, errors.js)
const keyRing = [];
export const recentKeys = () => keyRing.slice();

export function pushKey(ascii, scan) {
  if (inputPaused()) return;
  keyRing.push(ascii ? (ascii >= 32 && ascii < 127 ? String.fromCharCode(ascii) : '#' + ascii) : 'ext' + scan.toString(16));
  if (keyRing.length > 20) keyRing.shift();
  if (buffer.length >= 15) return;      // BIOS buffer holds 15 keys
  buffer.push({ ascii: ascii & 0xFF, scan: scan & 0xFF });
  while (waiters.length) waiters.shift()();
}

// convenience for scripts / tests: pushKeys('A'), pushKeys('\r'), pushExt(0x48)
export function pushChar(ch) {
  const c = ch.charCodeAt(0);
  const up = ch.toUpperCase();
  pushKey(c, SCAN_OF[up] ?? 0);
}
export function pushExt(scan) { pushKey(0, scan); }

// dev key script (dev.js ?keys=): when the game polls / waits with an empty buffer for IDLE_MS, the next script key is
// typed; when the script is done and ?screen=idle, the idle screen is signalled for the screenshot script.
export const script = { keys: [], idleSince: 0, readyWhenIdle: false };
const IDLE_MS = 250;
function idleTick() {
  if (inputPaused()) { script.idleSince = 0; return; }
  if (buffer.length || pendingScan !== null) { script.idleSince = 0; return; }
  const now = performance.now();
  if (!script.idleSince) { script.idleSince = now; return; }
  if (now - script.idleSince < IDLE_MS) return;
  script.idleSince = 0;
  if (script.keys.length) { const k = script.keys.shift(); if (k) pushKey(k[0], k[1]); }
  else if (script.readyWhenIdle && typeof window !== 'undefined') { window.__screenReady = true; }
}

// 0A40:02FD Crt.KeyPressed
export function KeyPressed() { if (inputPaused()) return false; idleTick(); return pendingScan !== null || buffer.length > 0; }

function waitForKey() { return new Promise((r) => waiters.push(r)); }

// 0A40:030F Crt.ReadKey: waits; extended keys deliver #0 then the scan code
export async function ReadKey() {
  while (inputPaused()) await sleep(IDLE_MS / 2);
  if (pendingScan !== null) { const s = pendingScan; pendingScan = null; return String.fromCharCode(s); }
  while (inputPaused() || buffer.length === 0) { if (inputPaused()) { await sleep(IDLE_MS / 2); continue; } idleTick(); await Promise.race([waitForKey(), sleep(IDLE_MS / 2)]); }
  const k = buffer.shift();
  if (k.ascii === 0) { pendingScan = k.scan; return '\0'; }
  return String.fromCharCode(k.ascii);
}

// 0899:0059 ReadGameKey
export async function ReadGameKey() {
  let ch = await ReadKey();                                              // 0899:0060
  if (ch === '\x13' && keyState.onSoundToggle) keyState.onSoundToggle(); // 0899:0068  ^S sound on/off
  if (keyState.sting) {                                                  // 0899:00ba
    if (ch === '\x04' && keyState.onDebugToggle) keyState.onDebugToggle();   // ^D DebugFlag
    if (ch === '\x03' && keyState.onTerminate) keyState.onTerminate();       // ^C TerminateGame
  }
  if (ch !== '\0') while (KeyPressed()) ch = await ReadKey();            // 0899:00e4  quirk: the last key pressed wins
  return ch;
}

// 0899:0122 PollOneKey
export async function PollOneKey() { if (KeyPressed()) await ReadGameKey(); }

// wait until a key is in the buffer or `ms` elapsed (used by busy-wait loops of the original)
export async function waitKeyOrTimeout(ms) {
  while (inputPaused()) await sleep(IDLE_MS / 2);
  if (KeyPressed()) return;
  await Promise.race([waitForKey(), sleep(ms)]);
}

// ---------------------------------------------------------------------------------------------------------------------
// PC scan codes (set 1) for the keys the game reads
export const SCAN_OF = {
  ESC: 0x01, '1': 0x02, '2': 0x03, '3': 0x04, '4': 0x05, '5': 0x06, '6': 0x07, '7': 0x08, '8': 0x09, '9': 0x0A, '0': 0x0B,
  '-': 0x0C, '=': 0x0D, BS: 0x0E, TAB: 0x0F, Q: 0x10, W: 0x11, E: 0x12, R: 0x13, T: 0x14, Y: 0x15, U: 0x16, I: 0x17, O: 0x18,
  P: 0x19, '[': 0x1A, ']': 0x1B, ENTER: 0x1C, A: 0x1E, S: 0x1F, D: 0x20, F: 0x21, G: 0x22, H: 0x23, J: 0x24, K: 0x25, L: 0x26,
  ';': 0x27, "'": 0x28, '`': 0x29, '\\': 0x2B, Z: 0x2C, X: 0x2D, C: 0x2E, V: 0x2F, B: 0x30, N: 0x31, M: 0x32, ',': 0x33,
  '.': 0x34, '/': 0x35, ' ': 0x39,
};
const EXT = { ArrowUp: 0x48, ArrowDown: 0x50, ArrowLeft: 0x4B, ArrowRight: 0x4D, Home: 0x47, End: 0x4F, PageUp: 0x49,
  PageDown: 0x51, Insert: 0x52, Delete: 0x53, F1: 0x3B, F2: 0x3C, F3: 0x3D, F4: 0x3E, F5: 0x3F, F6: 0x40, F7: 0x41, F8: 0x42,
  F9: 0x43, F10: 0x44 };

export function translateKeyEvent(e) {
  if (e.key in EXT && !(e.code.startsWith('Numpad') && e.getModifierState && e.getModifierState('NumLock'))) return { ascii: 0, scan: EXT[e.key] };
  if (e.key === 'Enter') return { ascii: 13, scan: 0x1C };
  if (e.key === 'Escape') return { ascii: 27, scan: 0x01 };
  if (e.key === 'Backspace') return { ascii: 8, scan: 0x0E };
  if (e.key === 'Tab') return { ascii: 9, scan: 0x0F };
  if (e.key.length !== 1) return null;
  const up = e.key.toUpperCase();
  const scan = SCAN_OF[up] ?? 0;
  if (e.altKey && /^[A-Z0-9]$/.test(up)) return { ascii: 0, scan };       // Alt-letter: extended (Alt-M = 32h, Alt-X = 2Dh)
  if (e.ctrlKey && /^[A-Z]$/.test(up)) return { ascii: up.charCodeAt(0) - 64, scan };
  return { ascii: e.key.charCodeAt(0) & 0xFF, scan };
}

export function attachKeyboard(target) {
  target.addEventListener('keydown', (e) => {
    const k = translateKeyEvent(e);
    if (!k) return;
    e.preventDefault();
    pushKey(k.ascii, k.scan);
  });
}

// Gamepad layer (BUILD_PLAN §2): d-pad = cursor keys, A = Enter, B = Esc, X / Y = the next / previous menu option letter
// (the current bottom menu publishes its hotkeys in gamepad.menuLetters). Polled; injects keys only.
export const gamepad = { menuLetters: [], letterIndex: 0, suspended: false };   // suspended: an overlay (BY-5) reads the pad itself
export function startGamepadPolling() {
  const prev = {};
  const map = { 12: [0, 0x48], 13: [0, 0x50], 14: [0, 0x4B], 15: [0, 0x4D], 0: [13, 0x1C], 1: [27, 0x01] };
  const poll = () => {
    for (const pad of (navigator.getGamepads ? navigator.getGamepads() : [])) {
      if (!pad) continue;
      if (gamepad.suspended || inputPaused()) { pad.buttons.forEach((b, i) => { prev[pad.index + ':' + i] = b.pressed; }); continue; }
      pad.buttons.forEach((b, i) => {
        const id = pad.index + ':' + i;
        if (b.pressed && !prev[id]) {
          if (map[i]) pushKey(map[i][0], map[i][1]);
          else if ((i === 2 || i === 3) && gamepad.menuLetters.length) {
            const n = gamepad.menuLetters.length;
            gamepad.letterIndex = (gamepad.letterIndex + (i === 2 ? 1 : n - 1)) % n;
            pushChar(i === 2 ? '.' : ',');                                // move the menu highlight (ov25 ',' / '.')
          }
        }
        prev[id] = b.pressed;
      });
    }
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
}

// Pointer layer (BUILD_PLAN §2; FOREMAN product form: keyboard + gamepad + mouse). The original has no mouse: this layer
// only injects the keys a player would type, never changes game logic (docs/DEVIATIONS.md §7). Screen routines register
// hit regions while they wait for input (menus.js HorizontalMenu / VerticalListMenu, 00BA DrawPartyRoster, VIEW
// ExploreCommand); a region maps a 320x200 point to a key list [[ascii, scan], ...]. One key goes straight into the BIOS
// buffer; a sequence is fed one key per idle wait (as the key script), because ReadGameKey flushes type-ahead (0899:00E4).
export const pointer = { regions: new Map(), menuExt: false, listWheel: null };
// region = { x1, y1, x2, y2 (pixels, inclusive), prio (higher wins), keysAt(x, y) -> key list | null }
export function setPointerRegion(name, region) { pointer.regions.set(name, region); }
export function clearPointerRegion(name) { pointer.regions.delete(name); }
export function clearPointerRegions(keep = []) { for (const k of [...pointer.regions.keys()]) if (!keep.includes(k)) pointer.regions.delete(k); }
export const KEY = { enter: [13, 0x1C], esc: [27, 0x01], up: [0, 0x48], down: [0, 0x50], left: [0, 0x4B], right: [0, 0x4D],
  home: [0, 0x47], end: [0, 0x4F] };

function injectKeys(keys) {
  if (!keys || !keys.length) return;
  if (keys.length === 1 && !buffer.length && !script.keys.length) pushKey(keys[0][0], keys[0][1]);
  else script.keys.push(...keys);
}
export function pointerHit(x, y) {
  const hits = [...pointer.regions.values()].filter((r) => x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2).sort((a, b) => b.prio - a.prio);
  for (const r of hits) { const k = r.keysAt(x, y); if (k) return k; }
  return null;
}
// screen point (client coordinates) -> 320x200 game pixel; works with any CSS scaling of the canvas
export function toGamePoint(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  return { x: Math.floor((clientX - r.left) * 320 / r.width), y: Math.floor((clientY - r.top) * 200 / r.height) };
}
export function attachPointer(canvas) {
  canvas.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const p = toGamePoint(canvas, e.clientX, e.clientY);
    injectKeys(pointerHit(p.x, p.y));
  });
  canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); injectKeys([KEY.esc]); });   // right-click = Esc
  canvas.addEventListener('wheel', (e) => {                       // wheel = up/down in a list (the list's own Home/End)
    if (!pointer.listWheel) return;
    e.preventDefault();
    injectKeys([e.deltaY > 0 ? pointer.listWheel.down : pointer.listWheel.up]);
  }, { passive: false });
}

// 0899:0104 — disabled key flush (the loop is jumped over in the shipped game): a no-op (engine request #2)
export function FUN_0899_0104() {}

// 0899:0000 TerminateGame (engine request #qa-1): restore the sound device, stop all sound, restore the BIOS video mode, Halt(0).
// Browser: sound stopped, screen cleared to text-mode black with a line, then the program body is ended by throwing
// 'TerminateGame' (index.html treats it as a normal exit).
export async function TerminateGame() {
  const { G } = await import('./state.js');
  const audio = await import('./audio.js');
  const { state: pic } = await import('./pictures.js');
  const { DrawText } = await import('./text.js');
  if (G.g_5373 !== undefined) G.SoundDevice = G.g_5373;                  // 0899:0003
  await audio.PlayOrStopSound(0xFF);                                      // 0899:000d  g_2612 = 00FFh: stop
  pic.display.resetPalette(); pic.display.clear();                        // 0899:0012  INT 10h: previous video mode
  DrawText(0, 0, 7, 'Program terminated.');
  throw new Error('TerminateGame');                                       // 0899:002c  Halt(0)
}
