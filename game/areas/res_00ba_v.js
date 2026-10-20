// game/areas/res_00ba_v.js — resident unit 00BA part V (00BA:1509 .. 00BA:30A2): items, character messages, combat
// por-only: Pool translated resident helpers/control flow, DS offsets and record fields (whole module) (profile: engine.areaModules / engine.state / recordSizes; game/profiles/PORONLY.md)
// animation, damage, side counts, status line, frames per mode, party picker. Lane por-build-res00ba.
// Source: decode/pseudo/ENGINE.pas.md "## res_00BA (00BA) part V"; evidence decode/listings/res_00BA.lst.
// Conventions: res_00ba_core.js header (records, g, X, ds). Local representation choices:
// - Combat record c.combat = { b: Uint8Array(0x16) } (TChar +108h far pointer).
// - VIEW tables: g.tg_List[i] = { who, dist, dir } (DS:6718 + 3i, i = 1..g.tg_Count), g.cb_Char[i] (DS:65B9 + 4i),
//   g.cb_ScrCol[i] / g.cb_ScrRow[i] (DS:604A / 6092), g.foe_List[i] (DS:6DE4 + i), g.cm_Map = { b } (+2/+3 window origin,
//   +6 scan flag). TLine = the magic_spells.js object { x0, y0, x1, y1, ..., dir } (FillChar(L, 1Ah, 0)).
// - Side counts DS:6814/6815 = g.side_ActiveCount[0..1] (combat lane shape); g.g_6815 is mirrored as a scalar for
//   magic_ov08.js, which reads g.g_6814/g.g_6815 as scalars (cross-lane naming conflict, see report).
// - ECL memory: g.ecl_Mem4900 / g.ecl_Mem6B00 = the VM's Uint16Array regions (word index = byte offset >> 1).
// - Pictures (pictures.js shape { height, width8, count, frameSize, px, mask }): g_4A20 = g.g_4A20 ?? pictures
//   state.viewPic, g_4A24 = g.PicSaveBuffer ?? state.saveBuf, g_6E36 = g.g_6E36 (4-frame animation picture),
//   CombatIcons g_5E5A = combatIconTable()[icon][part] (far pointer pairs, icon*8 + part*4).

import { X, g, env, ds, dsS8, dsPstr, byte, word, shortint, integer, pstr, chain } from './res_00ba_core.js';
import { ByteToStr, WordToStr, DrawPartyRoster } from './res_00ba_u.js';
import { state as picState } from '../engine/pictures.js';

const screenPic = () => g.g_4A20 ?? picState.viewPic;          // g_4A20 view picture
const saveBuf = () => g.PicSaveBuffer ?? picState.saveBuf;     // g_4A24
const ITEM = (t, j) => ds(0x5582 + t * 16 + j);                 // ITEMS[t] byte j (SAVES.md §6): j12 range, j14 wflags2
const ecl4900W = (o) => (g.ecl_Mem4900 ? g.ecl_Mem4900[o >> 1] : 0) & 0xFFFF;   // ecl_Mem4900^ word at byte offset o
const ecl6B00W = (o) => (g.ecl_Mem6B00 ? g.ecl_Mem6B00[o >> 1] : 0) & 0xFFFF;
const newLine = () => ({ x0: 0, y0: 0, x1: 0, y1: 0, err: 0, adx: 0, ady: 0, incDiag: 0, incStraight: 0, sx: 0, sy: 0,
  x: 0, y: 0, dist: 0, dir: 0 });
const sideCounts = () => { if (!Array.isArray(g.side_ActiveCount)) g.side_ActiveCount = [0, 0]; return g.side_ActiveCount; };
const tgList = () => { if (!g.tg_List) g.tg_List = []; return g.tg_List; };
const b01 = (v) => (v ? 1 : 0);

// 00BA:1509 LoseItem(c, item): unlink item from c's item list and free it
export async function LoseItem(c, item) {
  if (item === null || item === undefined) {                                     // { 00ba:150f }
    await X.ShowBottomPromptAndReadKey(0x0E, 'Nil Item pointer...');            // { 00ba:1529 }
    return;                                                                      // { 00ba:152e }
  }
  let p = c.items;                                                               // { 00ba:1531 }
  if (p === item) {                                                              // { 00ba:1544 }
    c.items = item.next;                                                         // { 00ba:1554 }
    // quirk: the head case falls into 15BF with p = item: item^.next := item^.next (no effect)
    p.next = item.next;                                                          // { 00ba:15bf }
  } else {
    while (p !== null && p.next !== item) p = p.next;                            // { 00ba:156e }
    if (p === null) {                                                            // { 00ba:159e }
      await X.ShowBottomPromptAndReadKey(0x0E, "Tried to Lose item & couldn't find it!");   // { 00ba:15b8 }
      return;
    }
    p.next = item.next;                                                          // { 00ba:15bf }
  }
  item.next = null;                                                              // { 00ba:15d5 }
  // FreeMem(item, $3F) { 00ba:15ec } — garbage collected
}

// 00BA:15F7 AppendItemCopy(c, item): append a copy (3Fh bytes) of item at the end of c's item list
export function AppendItemCopy(c, item) {
  const n = { b: new Uint8Array(0x3F), next: null };                             // { 00ba:1601 } GetMem(n, $3F)
  n.b.set(item.b.subarray(0, 0x3F));                                             // { 00ba:161a } Move(item^, n^, $3F)
  n.next = null;                                                                 // { 00ba:161f }
  let p = c.items;                                                               // { 00ba:162c }
  if (p === null) c.items = n;                                                   // { 00ba:163f }
  else {
    while (p.next !== null) p = p.next;                                          // { 00ba:165c }
    p.next = n;                                                                  // { 00ba:167c }
  }
}

// 00BA:1693 ShowTimedBottomMessage(s: string[40])
export async function ShowTimedBottomMessage(s) {
  s = s.slice(0, 40);
  await X.ClearRectangle(0, 0x18, 0x27, 0x18);                                   // { 00ba:16b8 } menu line, row 24
  await X.DrawText(0, 0x18, 0x0A, s);                                            // { 00ba:16cb }
  await X.MessageDelay();                                                        // { 00ba:16d0 }
  await X.ClearRectangle(0, 0x18, 0x27, 0x18);                                   // { 00ba:16e1 }
}

// 00BA:16EC ShowCharacterMessage(c, s, combatRow, wait)
export async function ShowCharacterMessage(c, s, combatRow, wait) {
  const t = s.slice(0, 255);                                                     // { 00ba:1702 }
  if (g.game_Mode === 5) {                                                       // { 00ba:1707 } combat
    await X.ClearRectangle(0x17, combatRow, 0x26, 0x15);                         // { 00ba:171b }
    await DrawCharacterName(c, 0x17, combatRow, false);                          // { 00ba:1731 }
    await X.DrawWrappedText(0x17, byte(combatRow + 1), 0x26, 0x15, 0x0A, 1, t);  // { 00ba:1750 }
  } else {
    let row;
    if (g.RestActive !== 0 && g.RestActive !== undefined) row = 0x12;            // { 00ba:1757 } g_6DDA
    else {
      row = 0x11;                                                                // { 00ba:1765 }
      await X.DrawFrame(1, row, 0x26, 0x16, 0);                                  // { 00ba:177b }
    }
    await X.ClearRectangle(1, row, 0x26, 0x16);                                  // { 00ba:178e }
    await DrawCharacterName(c, 1, row + 1, false);                               // { 00ba:17a8 }
    await X.DrawWrappedText(1, row + 2, 0x26, 0x16, 0x0A, 1, t);                 // { 00ba:17c9 }
  }
  if (wait) {                                                                    // { 00ba:17ce }
    await X.MessageDelay();                                                      // { 00ba:17d4 }
    await ClearCharacterMessage();                                               // { 00ba:17da }
  }
}

// 00BA:17E3 ClearCharacterMessage
export async function ClearCharacterMessage() {
  if (g.game_Mode === 5) await X.ClearRectangle(0x17, 0x0A, 0x26, 0x15);         // { 00ba:17e6 }
  else await X.ClearRectangle(1, 0x12, 0x26, 0x16);                              // { 00ba:180c }
}

// 00BA:1816 DrawCharacterName(c, col, row, possessive) — #verify-3 colour rule
export function DrawCharacterName(c, col, row, possessive) {   // sync: called from part U's sync drawing code
  let colour;
  if (c.b[0x10D] /* active */ === 0) colour = 0x0C;                              // { 00ba:181c } light red
  else if (c.b[0x10E] /* side */ === 1) colour = 0x0E;                           // { 00ba:182d } yellow
  else colour = 0x0B;                                                            // { 00ba:183e } light cyan
  const name = pstr(c.b, 0);
  X.DrawText(col, row, colour, name);                                            // { 00ba:1853 }
  if (possessive) X.DrawText(byte(col + name.length), row, colour, "'s");        // { 00ba:1887 } literal at 00BA:1813
}

// g.CombatIcons (DS:5E5A) is built by VIEW ov32 combatIcons() with its own slot shape: use it, never a plain array.
const combatIconTable = () => (typeof env.ext.combatIcons === 'function' ? env.ext.combatIcons() : g.CombatIcons);

// 00BA:1892 CopyCombatAnimationFrame(icon, part, frame, mirror): CombatIcons[icon, part] -> frame of g_6E36
// JS pictures keep one byte per pixel (px) + a mask plane: the EGA data move (size = header +11h, frame*size) and the
// plane-2 move (size2 = size shr 2 in VideoMode 1) are both the copy of one frame of pixels / mask here.
export async function CopyCombatAnimationFrame(icon, part, frame, mirror) {
  const dst = g.g_6E36;
  const n = dst.height * dst.width8 * 8;                                         // { 00ba:1898 / 18a9 } size / size2
  let src = combatIconTable()[icon][part];
  let tmp = null;
  if (mirror) {                                                                  // { 00ba:18ba }
    tmp = await X.AllocPicture(0x18, 3, 1, 1);                                   // { 00ba:18d6 }
    await X.MirrorPicture(src, tmp);                                             // { 00ba:1901 }
    src = tmp;
  }
  dst.px.set(src.px.subarray(0, n), frame * n);                                  // { 00ba:1926 / 1995 }
  if (dst.mask && src.mask) dst.mask.set(src.mask.subarray(0, n), frame * n);    // { 00ba:194b / 19d3 } plane2 (+13h)
  if (mirror) await X.FreePicture(tmp);                                          // { 00ba:1955 }
}

// 00BA:19DE BuildFourAnimationFrames(icon)
export async function BuildFourAnimationFrames(icon) {
  await CopyCombatAnimationFrame(icon, 0, 0, false);                             // { 00ba:19ef }
  await CopyCombatAnimationFrame(icon, 0, 1, true);                              // { 00ba:1a00 }
  await CopyCombatAnimationFrame(icon, 1, 2, true);                              // { 00ba:1a11 }
  await CopyCombatAnimationFrame(icon, 1, 3, false);                             // { 00ba:1a22 }
}

// 00BA:1A29 AnimateAlongPath(x0, y0, x1, y1: ShortInt; frames, delay: Byte) — re-read against the listing (H rule 4)
export async function AnimateAlongPath(x0, y0, x1, y1, frames, delay) {
  x0 = shortint(x0); y0 = shortint(y0); x1 = shortint(x1); y1 = shortint(y1);
  const map = () => g.cm_Map.b;
  const mx = () => shortint(map()[2]), my = () => shortint(map()[3]);
  let sx0 = x0, sy0 = y0;                                                        // { 00ba:1a30 } [bp-B9h/-BAh]
  // path[0..93h] filled with 8 (no step); quirk: reads past 93h hit other locals — the JS array is padded with 8
  const path = new Uint8Array(0x100).fill(8);                                    // { 00ba:1a4b }
  const L = newLine();                                                           // { 00ba:1a5d } FillChar(L, $1A, 0)
  let n = 0, frame = 0;                                                          // { 00ba:1a62 / 1a67 }
  L.x0 = integer(x0 * 3); L.y0 = integer(y0 * 3);                                // { 00ba:1a6c .. 1aa0 } thirds of a square
  L.x1 = integer(x1 * 3); L.y1 = integer(y1 * 3);
  await X.LineInit(L);                                                           // { 00ba:1aaa }
  let done;
  do {
    done = !(await X.LineStep(L));                                               // { 00ba:1ab5 }
    path[n] = byte(L.dir);  n = byte(n + 1);                                     // { 00ba:1ac5 } L +19h
  } while (!done);                                                               // { 00ba:1ad9 }
  const count = n;                                                               // { 00ba:1ae0 }
  if (count < 2) return;                                                         // { 00ba:1ae8 }
  let dx = shortint(x1 - x0), dy = shortint(y1 - y0);                            // { 00ba:1af2 / 1afe }
  let stay, cx, cy;
  if ((await X.InWindow(x0 - mx(), y0 - my())) && (await X.InWindow(x1 - mx(), y1 - my()))) {   // { 00ba:1b36 / 1b63 }
    stay = true;  cx = byte(mx() + 3);  cy = byte(my() + 3);                     // { 00ba:1be6 } both ends visible
  } else if (Math.abs(dx) <= 6 && Math.abs(dy) <= 6) {                           // { 00ba:1b6c / 1b7b }
    stay = true;                                                                 // { 00ba:1b8a }
    cx = byte(x0 + Math.trunc(dx / 2));  cy = byte(y0 + Math.trunc(dy / 2));     // IDIV: truncates toward zero
  } else {
    stay = false;  cx = byte(mx() + 3);  cy = byte(my() + 3);                    // { 00ba:1bbf }
  }
  await X.FocusSquare(cx, cy, 0xFF, 8);                                          // { 00ba:1c1b }
  let i = 0, fx = 0, fy = 0;                                                     // { 00ba:1c20 } i reuses n's byte
  let px, py;
  do {
    px = shortint((x0 - mx()) * 3 + fx);                                         // { 00ba:1c2f } byte, used signed
    py = shortint((y0 - my()) * 3 + fy);                                         // { 00ba:1c53 }
    sx0 = x0;  sy0 = y0;                                                         // { 00ba:1c77 / 1c7e }
    let off = false;                                                             // { 00ba:1c85 }
    do {
      if (delay > 0 || px % 3 === 0 || py % 3 === 0) {                           // { 00ba:1c8a } signed IDIV remainder
        await X.DrawPicture(px, py, frame, 5, g.g_6E36, screenPic());            // { 00ba:1cd4 }
        await X.FlushViewDirtyLines();                                           // { 00ba:1cd9 }
        await X.Delay(delay);                                                    // { 00ba:1ce4 } Crt.Delay
        await X.DrawPicture(px, py, 0, 0, saveBuf(), screenPic());               // { 00ba:1d0b } restore background
        frame = byte(frame + 1);  if (frame >= frames) frame = 0;                // { 00ba:1d10 }
      }
      i = byte(i + 1);                                                           // { 00ba:1d22 }
      const ddx = dsS8(0x2736 + path[i]), ddy = dsS8(0x273F + path[i]);          // { 00ba:1d26 / 1d3e } g_2736 / g_273F
      px = shortint(px + ddx);  py = shortint(py + ddy);                         // { 00ba:1d56 / 1d5e }
      if (px < 0 || px > 0x12 || py < 0 || py > 0x12) off = true;                // { 00ba:1d66 .. 1d82 } left the 7x7 window
      if (!off && i < count) {                                                   // { 00ba:1d87 / 1d8e }
        fx = shortint(fx + ddx);  fy = shortint(fy + ddy);                       // { 00ba:1d98 / 1da0 }
        if (Math.abs(fx) === 3) {                                                // { 00ba:1da8 }
          x0 = shortint(x0 + await X.Sign(fx));  cx = byte(cx + await X.Sign(fx));  fx = 0;   // { 00ba:1db2 .. 1dd4 }
        }
        if (Math.abs(fy) === 3) {                                                // { 00ba:1dd9 }
          y0 = shortint(y0 + await X.Sign(fy));  cy = byte(cy + await X.Sign(fy));  fy = 0;   // { 00ba:1de3 .. 1e05 }
        }
      }
    } while (i < count && !off);                                                 // { 00ba:1e0a }
    if (i < count) {                                                             // { 00ba:1e1e } scrolled off: re-centre
      dx = shortint(await X.Sign(sx0 - x0));                                     // { 00ba:1e39 }
      dy = shortint(await X.Sign(sy0 - y0));                                     // { 00ba:1e50 }
      if (dx !== 0) {                                                            // { 00ba:1e59 }
        if (x0 >= mx() + 6) cx = byte(x0 + 3);                                   // { 00ba:1e60 .. 1e7d }
        else if (x0 <= mx()) cx = byte(x0 - 3);                                  // { 00ba:1e83 .. 1e97 } signed compare
      }
      if (dy !== 0) {                                                            // { 00ba:1e9b }
        if (y0 >= my() + 6) cy = byte(y0 + 3);                                   // { 00ba:1ea2 .. 1ebf }
        else if (y0 <= my()) cy = byte(y0 - 3);                                  // { 00ba:1ec5 .. 1ed9 }
      }
      await X.FocusSquare(cx, cy, 0xFF, 8);                                      // { 00ba:1eed }
    } else {                                                                     // { 00ba:1ef5 } arrived
      stay = true;
      if (!(await X.InWindow(x1 - mx(), y1 - my())))                             // { 00ba:1f1e }
        await X.FocusSquare(byte(x1), byte(y1), 3, 8);                           // { 00ba:1f35 }
      px = shortint((x1 - mx()) * 3);  py = shortint((y1 - my()) * 3);           // { 00ba:1f3a / 1f5e }
      await X.DrawPicture(px, py, frame, 5, g.g_6E36, screenPic());              // { 00ba:1f94 }
      if (delay > 0) {                                                           // { 00ba:1f99 }
        await X.FlushViewDirtyLines();                                           // { 00ba:1f9f }
        await X.Delay(delay);                                                    // { 00ba:1faa }
        await X.DrawPicture(px, py, 0, 0, saveBuf(), screenPic());               // { 00ba:1fd1 }
      }
    }
  } while (!stay);                                                               // { 00ba:1fd6 }
  await X.FlushViewDirtyLines();                                                 // { 00ba:1fe0 }
  // quirk: when `stay` was already true at the start and the animation leaves the window, the loop ends at once —
  // the rest of the path is not shown. With delay = 0 the final frame stays drawn (no restore).
}

// 00BA:1FEB ShowCombatMessageAnimation(c, spell, s: string[40]) — #verify-4: final MessageDelay only when reps = 0
export async function ShowCombatMessageAnimation(c, spell, s) {
  const t = s.slice(0, 40);                                                      // { 00ba:1fff }
  if (g.game_Mode === 5) {                                                       // { 00ba:2004 }
    await X.SetSoundTimerMode(0);                                                // { 00ba:2011 }
    const icon = spell ? 0x16 : 0x17;                                            // { 00ba:2016 }
    await BuildFourAnimationFrames(icon);                                        // { 00ba:202b }
    if (!(await X.IsVisible(c, true)))                                           // { 00ba:2037 }
      await X.FocusSquare(await X.CombatantCol(c), await X.CombatantRow(c), 3, 8);   // { 00ba:205e }
    if (spell) await X.PlayOrStopSound(g.g_261C);                                // { 00ba:206d }
    else await X.PlayOrStopSound(g.g_261A);                                      // { 00ba:2078 }
    await ShowCharacterMessage(c, t, 0x0A, false);                               // { 00ba:208f }
    const reps = spell ? byte(g.GameSpeed) : 0;                                  // { 00ba:2092 } g_49E2
    const k = await X.CombatantIndex(c);                                         // { 00ba:20aa }
    const px = shortint(g.cb_ScrCol[k] * 3);                                     // { 00ba:20b3 }
    const py = shortint(g.cb_ScrRow[k] * 3);                                     // { 00ba:20d0 }
    for (let r = 0; r <= reps; r++)                                              // { 00ba:20e4 }
      for (let f = 0; f <= 3; f++) {                                             // { 00ba:20f3 }
        await X.DrawPicture(px, py, f, 5, g.g_6E36, screenPic());                // { 00ba:211d }
        await X.FlushViewDirtyLines();                                           // { 00ba:2122 }
        await X.Delay(70);                                                       // { 00ba:212b }
        await X.DrawPicture(px, py, 0, 0, saveBuf(), screenPic());               // { 00ba:2150 }
      }
    await X.SetSoundTimerMode(10);                                               // { 00ba:2167 }
    await X.FlushViewDirtyLines();                                               // { 00ba:216c }
    if (reps === 0) await X.MessageDelay();                                      // { 00ba:2171 }
  } else
    await ShowCharacterMessage(c, t, 0x0A, true);                                // { 00ba:2190 }
}

// 00BA:2199 HasEffect(c, id, var e): Boolean — e receives the effect node when found (else nil)
export function HasEffect(c, id, e) {
  const ref = e ?? { v: null };
  let found = false;                                                             // { 00ba:219f }
  ref.v = c.effects;                                                             // { 00ba:21a3 } +7Fh
  while (ref.v !== null && ref.v !== undefined && !found) {                      // { 00ba:21b9 }
    if (ref.v.b[0] /* type */ === id) found = true;                              // { 00ba:21cb }
    else ref.v = ref.v.next;                                                     // { 00ba:21df } effect +5
  }
  if (ref.v === undefined) ref.v = null;
  return found;                                                                  // { 00ba:21f9 }
}

// 00BA:2228 ApplyDamage(c, dmg) — re-read against the listing (H rule 4); set CS:2208 = [0, 1]
export function ApplyDamage(c, dmg) {
  dmg = byte(dmg);
  let over = 0, left = 0;                                                        // { 00ba:222e / 2232 }
  const hp = c.b[0x11B];                                                         // hp
  if (hp >= dmg) left = byte(hp - dmg);                                          // { 00ba:2236 }
  else over = byte(dmg - hp);                                                    // { 00ba:225b }
  if (over > 9 || (left === 0 && c.b[0x10C] /* status */ === 1))                 // { 00ba:2271 }
    c.b[0x10C] = 6;                                                              // { 00ba:2288 } Dead
  else if (over > 0) {                                                           // { 00ba:2293 }
    c.b[0x10C] = 5;                                                              // { 00ba:2299 } Dying
    if (g.game_Mode === 5) c.combat.b[0x0E] = over;                              // { 00ba:22a2 } bleeding counter (M)
  } else if (left === 0)                                                         // { 00ba:22ba }
    c.b[0x10C] = 4;                                                              // { 00ba:22c0 } Unconscious
  if (c.b[0x10C] === 0 || c.b[0x10C] === 1)                                      // { 00ba:22d7 } status in [0, 1]
    c.b[0x11B] = left;                                                           // { 00ba:2315 }
  else {
    c.b[0x10D] = 0;                                                              // { 00ba:22de } active
    c.b[0x11B] = 0;                                                              // { 00ba:22e7 }
    if (g.game_Mode === 5) {                                                     // { 00ba:22f0 }
      const sc = sideCounts(), s = shortint(c.b[0x10E]);                         // side, CBW
      sc[s] = byte(sc[s] - 1);                                                   // { 00ba:2302 } Dec(g_6814[side])
      if (s === 1) g.g_6815 = sc[1];
      c.combat.b[3] = 0;                                                         // { 00ba:2309 }
    }
  }
  // quirk: a status other than 0..1 that was already set before (e.g. 7 Stoned) and is not changed above also
  // clears hp and active.
}

// 00BA:234A ShowHealingResult(c)
export async function ShowHealingResult(c) {
  let s;
  if (c.b[0x11B] === c.b[0x32]) s = 'is fully healed';                           // { 00ba:2350 } hp = hp_max
  else s = 'is partially healed';                                                // { 00ba:2376 }
  await ShowCharacterMessage(c, s, 0x0A, true);                                  // { 00ba:239b }
  if (g.game_Mode !== 5) await DrawPartyRoster(g.SelectedChar);                  // { 00ba:239e }
}

// 00BA:23B7 IsSideZero(c): Boolean
export function IsSideZero(c) {
  return c.b[0x10E] === 0;                                                       // { 00ba:23bd }
}

// 00BA:23DB CountActiveSides
export function CountActiveSides() {
  const sc = sideCounts();
  sc[0] = 0;  sc[1] = 0;                                                         // { 00ba:23e1 / 23e6 }
  for (const c of chain(g.PartyHead))                                            // { 00ba:23eb / 23f8 / 241a }
    if (c.b[0x10D] !== 0) { const s = shortint(c.b[0x10E]); sc[s] = byte((sc[s] ?? 0) + 1); }   // { 00ba:2400 }
  g.g_6815 = sc[1];
}

// 00BA:2433 CollectOppositeSideTargets(c, range): Byte
export async function CollectOppositeSideTargets(c, range) {
  await X.BuildTargetList(await X.CombatantCol(c), await X.CombatantRow(c), range, 0xFF,
    await X.CombatantSize(c), g.cm_Map);                                         // { 00ba:246e }
  const T = tgList();
  let n = byte(g.tg_Count);                                                      // { 00ba:2473 }
  let kept = 0;                                                                  // { 00ba:2479 }
  if (n > 0) {                                                                   // { 00ba:247d }
    for (let i = 1; i <= n; i++)                                                 // { 00ba:248c }
      if (g.cb_Char[T[i].who].b[0x10E] === b01(IsSideZero(c))) {                 // { 00ba:24a2 / 24c9 }
        kept = byte(kept + 1);                                                   // { 00ba:24cd }
        T[kept] = { ...T[i] };                                                   // { 00ba:24fa } Move(.., 3)
      }
    n = kept;  g.tg_Count = kept;                                                // { 00ba:2507 / 250d }
  }
  if (!g.foe_List) g.foe_List = [];
  for (let i = 1; i <= n; i++) g.foe_List[i] = T[i].who;                         // { 00ba:251f / 2546 } g_6DE4
  return n;                                                                      // { 00ba:2552 }
}

// 00BA:255B TargetDistance(c, target): Byte
export async function TargetDistance(c, target) {
  const T = tgList();
  const save = [];                                                               // { 00ba:2571 } Move(g_671B, save, $D8)
  for (let i = 1; i <= 72; i++) save[i] = T[i] ? { ...T[i] } : undefined;        // 72 entries; tg_Count not saved
  g.cm_Map.b[6] = 1;                                                             // { 00ba:2576 } flag for BuildTargetList (M)
  await X.BuildTargetList(await X.CombatantCol(c), await X.CombatantRow(c), 0xFF, 0xFF,
    await X.CombatantSize(c), g.cm_Map);                                         // { 00ba:25b2 }
  g.cm_Map.b[6] = 0;                                                             // { 00ba:25b7 }
  let i = 1;                                                                     // { 00ba:25c0 }
  while (g.cb_Char[T[i]?.who] !== target && i < g.tg_Count) i = byte(i + 1);    // { 00ba:25c5 .. 25ff }
  const d = byte(T[i]?.dist ?? 0) >> 1;                                          // { 00ba:2601 } entry byte 1
  for (let k = 1; k <= 72; k++) T[k] = save[k];                                  // { 00ba:2629 }
  return d;
  // quirk: target not found -> the last entry's distance
}

// 00BA:2637 ClearCombatantActionFlags(c): Boolean
export function ClearCombatantActionFlags(c) {
  const b = c.combat.b;
  b[3] = 0;  b[0] = 0;                                                           // { 00ba:263d / 2649 }
  b[7] = 0;  b[6] = 0;                                                           // { 00ba:2656 / 2663 }
  return true;                                                                   // { 00ba:2670 }
}

// 00BA:2686 SetGuarding(c): Boolean
export async function SetGuarding(c) {
  const r = ClearCombatantActionFlags(c);                                        // { 00ba:2693 }
  c.combat.b[7] = 1;                                                             // { 00ba:2699 } guarding
  await ShowTimedBottomMessage('Guarding');                                      // { 00ba:26b6 }
  return r;
}

// 00BA:26C2 SpellCasterLevel(spell): Byte — SpellTable DS:31FA byte 0 = caster class
export function SpellCasterLevel(spell) {
  let lvl = 0;                // TODO(decode): garbage — other classes leave the result uninitialised
  const cls = ds(0x31FA + spell * 16);
  if (cls === 0) lvl = g.SelectedChar.b[0x96];                                   // { 00ba:26db } cleric level
  else if (cls === 1) lvl = g.SelectedChar.b[0x9B];                              // { 00ba:26ed } magic-user level
  else if (cls === 2) lvl = 0x0C;                                                // { 00ba:26ff } item/innate
  if (g.ItemCast !== 0 && g.ItemCast !== undefined && cls !== 2) lvl = 6;        // { 00ba:2703 } g_6DBF
  return lvl;
}

// 00BA:272A DrawStandardFrames(inner) — #verify-5
export async function DrawStandardFrames(inner) {
  await X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0x0F, '');                        // { 00ba:2751 } whole screen
  await X.DrawTitledFrame(1, 0x11, 0x26, 0x16, 0, 0x0F, '');                     // { 00ba:2777 } text window
  await X.DrawTitledFrame(1, 1, 0x0F, 0x0F, 0, 0x0F, '');                        // { 00ba:279d } picture box
  if (inner) await X.DrawTitledFrame(3, 3, 0x0D, 0x0D, 0, 0x0F, '');             // { 00ba:27c9 } view inner frame
}

// DS:6ABE enc_Anim is VIEW's TAnim record (view.anim, ov28 {count, cur, delay[], pic[]}), passed `var` to LoadAnimation.
// The shared state may still hold the plain DS word there (fix request #qa-4): pass the record only when it is one,
// else undefined so VIEW's LoadAnimation uses its own default record view.anim (the same DS:6ABE storage).
const encAnim = () => (g.enc_Anim && typeof g.enc_Anim === 'object' ? g.enc_Anim : undefined);

// 00BA:27D9 RedrawCurrentMode — #verify-5: cases 0,1,2,3,4,6; 5 (combat) and 7 draw nothing (H rule 4 re-read)
export async function RedrawCurrentMode() {
  switch (g.game_Mode) {                                                         // { 00ba:27df }
    case 0:
      await X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0x0F, '');                    // { 00ba:2807 }
      break;
    case 1:
      await DrawStandardFrames(true);                                            // { 00ba:2817 }
      await X.LoadPortrait(g.pic_HeadId, g.pic_BodyId);                          // { 00ba:2822 }
      await X.DrawPortrait(3, 3, true);                                          // { 00ba:2830 }
      break;
    case 2:
      await DrawStandardFrames(true);                                            // { 00ba:2840 } camping
      await X.LoadAnimation('PIC', 0x1D, 0, encAnim());                          // { 00ba:285d } var g_6ABE (TAnim record, #qa-4)
      await DrawPartyRoster(g.SelectedChar);                                     // { 00ba:286b }
      await DrawLocationTimeStatus();                                            // { 00ba:286f }
      break;
    case 4:
      await DrawStandardFrames(true);                                            // { 00ba:287c }
      await X.RefreshView();                                                     // { 00ba:287f }
      await DrawPartyRoster(g.SelectedChar);                                     // { 00ba:288d }
      await DrawLocationTimeStatus();                                            // { 00ba:2891 }
      break;
    case 3:
      await DrawStandardFrames(false);                                           // { 00ba:289e }
      await X.RefreshView();                                                     // { 00ba:28a1 }
      await DrawPartyRoster(g.SelectedChar);                                     // { 00ba:28af }
      await DrawLocationTimeStatus();                                            // { 00ba:28b3 }
      break;
    case 6:
      await DrawStandardFrames(true);                                            // { 00ba:28c0 }
      await X.LoadAnimation('PIC', 1, 0, encAnim());                             // { 00ba:28dd } var g_6ABE (TAnim record, #qa-4)
      await DrawPartyRoster(g.SelectedChar);                                     // { 00ba:28eb }
      break;
    default: break;                                                              // 5 (combat), 7 and others: nothing
  }
}

// 00BA:290B DrawLocationTimeStatus — re-read against the listing (H rule 4)
export async function DrawLocationTimeStatus() {
  let s = '';                                                                    // { 00ba:2912 } string[40]
  let x = g.party_MapX, y = g.party_MapY;                                        // { 00ba:2916 / 291c }
  if (g.travel_Mode > 1) {                                                       // { 00ba:2922 } overland modes
    x = ecl4900W(0x186) & 0xFF;  y = ecl4900W(0x188) & 0xFF;                     // { 00ba:2929 / 2935 } ECL 49C3 / 49C4
    if (g.travel_Mode === 3) x = byte(x + 0x0D);                                 // { 00ba:2941 }
    if (g.travel_Mode === 4) x = byte(x + 0x1A);                                 // { 00ba:294c }
  }
  let hh = (await WordToStr(ecl4900W(0x192))).slice(0, 2);                       // { 00ba:2967 } ECL 49C9 hours, string[2]
  if (hh.length < 2) hh = ('0' + hh).slice(0, 2);                                // { 00ba:2978 }
  let mm = (await WordToStr(word(10 * ecl4900W(0x190) + ecl4900W(0x18E)))).slice(0, 2);   // { 00ba:29c3 } 49C8*10 + 49C7
  if (mm.length < 2) mm = ('0' + mm).slice(0, 2);                                // { 00ba:29d4 }
  if (ecl4900W(0x1F6) === 0)                                                     // { 00ba:2a02 } ECL 49FB
    s = ((await ByteToStr(x)) + ',' + (await ByteToStr(y)) + ' ').slice(0, 40);  // { 00ba:2a19 .. 2a4c }
  s = (s + dsPstr(0x25A8 + 3 * g.party_Dir) + ' ').slice(0, 40);                 // { 00ba:2a74 } g_25A8 string[2] per facing
  s = (s + hh + ':' + mm).slice(0, 40);                                          // { 00ba:2a9c .. 2ac8 }
  if (g.game_Mode === 2) s = (s + ' camping').slice(0, 40);                      // { 00ba:2acd }
  else if ((ecl6B00W(0x594) & 1) > 0) s = (s + ' search').slice(0, 40);          // { 00ba:2afe } ECL 6DCA
  await X.ClearRectangle(0x11, 0x0F, 0x26, 0x0F);                                // { 00ba:2b42 } row 15, cols 17..38
  await X.DrawText(0x11, 0x0F, 0x0A, s);                                         // { 00ba:2b55 }
}

// 00BA:2B5E SwitchToExploreMode
export async function SwitchToExploreMode() {
  g.game_Mode = 3;                                                               // { 00ba:2b61 }
  await X.DrawExploreFrames();                                                   // { 00ba:2b66 } ov27
  await X.RefreshView();                                                         // { 00ba:2b6b }
  await X.DrawOverlandParty();                                                   // { 00ba:2b70 }
  await DrawLocationTimeStatus();                                                // { 00ba:2b76 }
  await DrawPartyRoster(g.SelectedChar);                                         // { 00ba:2b82 }
}

// 00BA:2B88 DrawCombatLayout
export async function DrawCombatLayout() {
  await X.PaletteFlashOn();                                                      // { 00ba:2b8e }
  await X.DrawTitledFrame(1, 1, 0x15, 0x15, 0, 0, '');                           // { 00ba:2bb4 } map window
  await X.DrawTitledFrame(0x17, 1, 0x26, 0x15, 0, 0, '');                        // { 00ba:2bda } side panel
  await X.ClearRectangle(0, 0x17, 0x27, 0x18);                                   // { 00ba:2beb } rows 23..24
  await X.FocusSquare(byte(shortint(g.cm_Map.b[2]) + 3), byte(shortint(g.cm_Map.b[3]) + 3), 0xFF, 8);   // { 00ba:2c10 }
}

// 00BA:2C48 SelectPartyCharacter(prompt: string[40], allowExit, var sel) — bytes re-read (caution rules 2 and 4):
// extended keys only test scan 4Fh ('O', End = next) and 47h ('G', Home = previous); plain 'E' or #0 (Esc) = nil.
export async function SelectPartyCharacter(prompt, allowExit, sel) {
  const p = prompt.slice(0, 40);                                                 // { 00ba:2c5d }
  let key = ' ';                                                                 // { 00ba:2c62 }
  let exitItem = '';                                                             // { 00ba:2c66 }
  if (allowExit) exitItem = ' Exit';                                             // { 00ba:2c6a } CS:2C19
  while (!['\r', '\x1b', 'E', 'S'].includes(key)) {                              // { 00ba:2c83 } set CS:2C1F
    await DrawPartyRoster(sel.v);                                                // { 00ba:2ca1 } highlights sel
    const anim = g.game_Mode === 2 || g.game_Mode === 6;                         // { 00ba:2ca4 }
    const r = await X.HorizontalMenu(p + ' ', 'Select' + exitItem, 0x0D, 0x0A, 0x0F, true, anim);   // { 00ba:2d05 }
    key = r.key;                                                                 // { 00ba:2d0a }
    let c = sel.v;                                                               // { 00ba:2d0d }
    if (r.ext) {                                                                 // { 00ba:2d1d } extended key
      if (key === 'O') {                                                         // { 00ba:2d26 } scan 4Fh: next
        c = c.next;  if (c === null) c = g.PartyHead;                            // { 00ba:2d2d / 2d48 }
      } else if (key === 'G') {                                                  // { 00ba:2d57 } scan 47h: previous
        c = g.PartyHead;                                                         // { 00ba:2d5b }
        if (sel.v === g.PartyHead) { while (c.next !== null) c = c.next; }       // { 00ba:2db0 } wrap to the last
        else { while (c.next !== sel.v) c = c.next; }                            // { 00ba:2d7e }
      }
    } else if (key === 'E' || key === '\0') c = null;                            // { 00ba:2dd6 / 2de2 } Exit
    sel.v = c;                                                                   // { 00ba:2dea }
  }
  // quirk: key #0 sets sel := nil but does not end the loop (not in the set)
}

// 00BA:2E03 WeaponIsRanged(c): Boolean
export function WeaponIsRanged(c) {
  const w = c.readied?.[0] ?? null;                                              // { 00ba:2e09 } +CCh
  return w !== null && ITEM(w.b[0x2E], 12) > 1;                                  // { 00ba:2e2c } ITEMS range (g_558E)
}

// 00BA:2E46 FUN_00BA_2E46(c): Boolean — ranged weapon with wflags2 bits 2 and 4 (meaning L)
export function FUN_00BA_2E46(c) {
  return WeaponIsRanged(c) && (ITEM(c.readied[0].b[0x2E], 14) & 0x14) === 0x14;  // { 00ba:2e53 / 2e6e } g_5590
}
export const FUN_00ba_2e46 = FUN_00BA_2E46;                                      // spelling used by magic_ov08 / combat

// 00BA:2E8B GetMissileAmmo(c, var ammo): Boolean
export function GetMissileAmmo(c, ammo) {
  const ref = ammo ?? { v: null };
  let ok = false;                                                                // { 00ba:2e91 }
  const w = c.readied?.[0] ?? null;                                              // { 00ba:2e95 } weapon slot +CCh
  ref.v = null;  let f = 0;                                                      // { 00ba:2ea8 / 2eb4 }
  if (w !== null) {                                                              // { 00ba:2eb8 }
    f = ITEM(w.b[0x2E], 14);                                                     // { 00ba:2ec0 } wflags2
    if ((f & 0x10) !== 0) ref.v = w;                                             // { 00ba:2ed6 } thrown weapon
    if ((f & 0x08) !== 0) {                                                      // { 00ba:2eef } needs ammunition
      if ((f & 0x01) !== 0) ref.v = c.readied[11] ?? null;                       // { 00ba:2ef8 } arrows +F8h
      if ((f & 0x80) !== 0) ref.v = c.readied[12] ?? null;                       // { 00ba:2f18 } quarrels +FCh
    }
  }
  if (ref.v !== null || f === 0x0A) ok = true;                                   // { 00ba:2f38 } f = 0Ah (L)
  return ok;
}

// 00BA:2F57 RacialLevelLimitReached(c, cls: ShortInt): Boolean
export function RacialLevelLimitReached(c, cls) {
  let r = false;                                                                 // { 00ba:2f5d }
  // quirk: 00ba:2f6a adds AX with only AL = cls loaded (AH not cleared); taken as the class byte here
  const lvl = shortint(c.b[0x96 + byte(cls)]);                                   // { 00ba:2f6a } level[cls]
  const str = c.b[0x10];                                                         // STR
  if (lvl > 0)                                                                   // { 00ba:2f7b } signed
    switch (c.b[0x2E] /* race */) {                                              // { 00ba:2f84 }
      case 1: if (cls === 2) r = (lvl === 8 && str === 17) || (lvl === 7 && str < 17); break;   // { 00ba:2f8f } Dwarf
      case 2: if (cls === 2) r = lvl === 7 || (lvl === 6 && str === 17) || (lvl === 5 && str < 17); break;   // { 00ba:2fc0 } Elf
      case 3: if (cls === 2) r = lvl === 6 || (lvl === 5 && str < 18); break;    // { 00ba:2ff7 } Gnome
      case 4:                                                                    // Half-Elf
        if (cls === 0 && lvl === 5) r = true;                                    // { 00ba:301d }
        else if (cls === 2) r = lvl === 8 || (lvl === 7 && str === 17) || (lvl === 6 && str < 17);   // { 00ba:302f }
        break;
      case 5: if (cls === 2) r = lvl === 6 || (lvl === 5 && str === 17) || (lvl === 4 && str < 17); break;   // { 00ba:3065 } Halfling
      default: break;
    }
  return r;
  // quirk: Dwarf with STR 18 never limited; only fighter (and half-elf cleric) limits are coded
}

// 00BA:309E UnitInit_00BA — empty unit initialiser (push bp / mov bp,sp / pop bp / retf)
export function UnitInit_00BA() {}

// Published-name table for bindRes00ba / other areas' ext maps.
export const res00baV = {
  LoseItem, AppendItemCopy, ShowTimedBottomMessage, ShowCharacterMessage, ClearCharacterMessage, DrawCharacterName,
  CopyCombatAnimationFrame, BuildFourAnimationFrames, AnimateAlongPath, ShowCombatMessageAnimation, HasEffect,
  ApplyDamage, ShowHealingResult, IsSideZero, CountActiveSides, CollectOppositeSideTargets, TargetDistance,
  ClearCombatantActionFlags, SetGuarding, SpellCasterLevel, DrawStandardFrames, RedrawCurrentMode,
  DrawLocationTimeStatus, SwitchToExploreMode, DrawCombatLayout, SelectPartyCharacter, WeaponIsRanged, FUN_00BA_2E46,
  FUN_00ba_2e46, GetMissileAmmo, RacialLevelLimitReached, UnitInit_00BA,
};
