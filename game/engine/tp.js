// tp.js — Turbo Pascal 6.0 runtime semantics the game depends on (decode/rt/RT_LEDGER.md).
//
// Random: System.@NextRandom 0AF8:120F  RandSeed := RandSeed * 134775813 (08088405h) + 1  (RandSeed = DS:4428/442A)
//         System.RandomWord  0AF8:11C0  Random(N) = HiWord(RandSeed) mod N   (N = 0 -> 0)
//         System.Randomize   0AF8:1247  RandSeed := DOS time (INT 21h AH=2Ch: CX:DX)
// Strings: Pascal strings are JS strings here; callers truncate with pstr(s, max) where a string[n] is assigned.

export const tp = {
  randSeed: 0,
};

// 0AF8:120F @NextRandom
function nextRandom() {
  tp.randSeed = (Math.imul(tp.randSeed, 0x08088405) + 1) >>> 0;
}

// 0AF8:11C0 RandomWord: Random(N) for a Word range
export function Random(n) {
  nextRandom();
  n &= 0xFFFF;
  if (n === 0) return 0;
  return (tp.randSeed >>> 16) % n;
}

// 0AF8:1247 Randomize: CX = hours*256 + minutes, DX = seconds*256 + hundredths (DOS GetTime registers);
// RandSeed low word = CX (DS:4428), high word = DX (DS:442A).
export function Randomize() {
  const d = new Date();
  const cx = (d.getHours() << 8) | d.getMinutes();
  const dx = (d.getSeconds() << 8) | Math.floor(d.getMilliseconds() / 10);
  tp.randSeed = ((dx << 16) | cx) >>> 0;
}

// Seedable for acceptance runs (?seed=n): replaces the Randomize value, documented as a test hook.
export function setRandSeed(v) { tp.randSeed = v >>> 0; }

// Byte / Word / ShortInt truncation helpers (TP integer wrap).
export const byte = (v) => v & 0xFF;
export const word = (v) => v & 0xFFFF;
export const shortint = (v) => ((v & 0xFF) ^ 0x80) - 0x80;
export const integer = (v) => ((v & 0xFFFF) ^ 0x8000) - 0x8000;

// string[n] assignment
export const pstr = (s, max = 255) => (s.length > max ? s.slice(0, max) : s);

// System.UpCase (ASCII only, as TP)
export function UpCase(ch) {
  return ch >= 'a' && ch <= 'z' ? String.fromCharCode(ch.charCodeAt(0) - 32) : ch;
}

// Str(n) without width
export const Str = (n) => String(n);

// System.ParamStr 0AF8:16BC — the browser build has one possible parameter: 'STING' (?sting=1, engine request #2)
export const params = { sting: false };
export function ParamStr(n) { return n === 1 && params.sting ? 'STING' : ''; }
