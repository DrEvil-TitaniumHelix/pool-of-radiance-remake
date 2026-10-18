// game/areas/view_ov32.js — VIEW ov32 (C000): 24x24 tile sets and combat icons.
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov32 (verified); RecolorPicture calls checked on the pushes
// (c000:0460..0483: RecolorPicture(@g_0CD2, @g_0CE2, 0, 0, pic)).
// Storage: tile sets g.TileSetLo (g_5E52, tiles 0..127) / g.TileSetHi (g_5E56, 128..255); combat icons
// g.CombatIcons[slot] = [pose0, pose1] (g_5E5A + slot*8 + pose*4) with .pose0/.pose1 accessors (both shapes are used by
// party_ov17.js and res_00ba_v.js).

import { view } from './view.js';
import { state as pic, LoadPicture, AllocPicture, DrawPictureInto, DrawPicture, MirrorPicture, RecolorPicture, FreePicture } from '../engine/pictures.js';
import { UpCase } from '../engine/tp.js';
import { fatal } from '../engine/errors.js';

const G = () => view.g;
const C0CD2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];   // g_0CD2 identity
const C0CE2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 8, 14, 15];    // g_0CE2 13 -> 8 (monster icons)
const C0CF2 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 14, 15];    // g_0CF2 13 -> 0 (ICON)

function iconSlot() {
  const s = [null, null];
  Object.defineProperty(s, 'pose0', { get() { return s[0]; }, set(v) { s[0] = v; } });
  Object.defineProperty(s, 'pose1', { get() { return s[1]; }, set(v) { s[1] = v; } });
  return s;
}
export function combatIcons() {
  const g = G();
  if (!Array.isArray(g.CombatIcons) || g.CombatIcons.length < 26) {
    const old = Array.isArray(g.CombatIcons) ? g.CombatIcons : [];
    g.CombatIcons = Array.from({ length: 32 }, (_, i) => {
      const s = iconSlot(); const o = old[i];
      if (o) { s[0] = o[0] ?? o.pose0 ?? null; s[1] = o[1] ?? o.pose1 ?? null; }
      return s;
    });
  }
  return g.CombatIcons;
}

// C000:0022 Load24x24Set(name, start, unused)
export async function Load24x24Set(name, start, unused) {
  if (start > 0x7F) throw fatal('Start range error in Load24x24Set', false);   // c000:003d..005f (TerminateGame)
  const tmp = await LoadPicture(name, 1, 0, 0);                          // c000:0083 record 1, no data-set suffix
  const g = G(), set = g.TileSetLo;
  if (set && tmp) {                                                      // c000:00d6 Move(tmp.pixels, set.pixels[start*frame], count*frame)
    const fpx = set.height * set.width8 * 8;
    const n = Math.min(tmp.px.length, set.px.length - start * fpx);
    set.px.set(tmp.px.subarray(0, n), start * fpx);
    if (set.mask && tmp.mask) set.mask.set(tmp.mask.subarray(0, n), start * fpx);
  }
  FreePicture(tmp);                                                      // c000:00e1
}

// C000:00F1 DrawTile24(col, row, tile, unused): opaque into the view picture
export function DrawTile24(col, row, tile, unused) {
  const g = G();
  if (tile < 0x80) DrawPictureInto(col, row, tile, 0, g.TileSetLo, pic.viewPic);   // c000:011d
  else DrawPictureInto(col, row, tile & 0x7F, 0, g.TileSetHi, pic.viewPic);        // c000:0145
}

// C000:014E FreeCombatIcon(slot)
export function FreeCombatIcon(slot) {
  const s = combatIcons()[slot];
  s[0] = FreePicture(s[0]); s[1] = FreePicture(s[1]);                    // c000:017a / 01a5
}

// C000:01C8 LoadCombatIcon(name, id, slot): poses id and id+80h
export async function LoadCombatIcon(name, id, slot) {
  const s = combatIcons()[slot];
  const head5 = name.substring(0, 5);
  if (head5 === 'CHEAD' || head5 === 'CBODY') {                          // c000:0201 / 0226
    if (UpCase(name[name.length - 1]) === 'T') id = (id + 0x40) & 0xFF;  // c000:023d
    name = name.substring(0, name.length - 1);                           // c000:0262
    s[0] = await LoadPicture(name, id, 1, 0);                            // c000:02b2
    s[1] = await LoadPicture(name, (id + 0x80) & 0xFF, 1, 0);            // c000:02f3
  } else if (name === 'COMSPR' || name === 'ICON') {                     // c000:0306 / 0318
    s[0] = await LoadPicture(name, id, 1, 0);                            // c000:035e
    s[1] = await LoadPicture(name, (id + 0x80) & 0xFF, 1, 0);            // c000:039f
    if (name === 'ICON') { RecolorPicture(C0CD2, C0CF2, 0, 0, s[0]); RecolorPicture(C0CD2, C0CF2, 0, 0, s[1]); }   // c000:03d9 / 0401
  } else {                                                               // monster icons: name + data set
    s[0] = await LoadPicture(name + pic.DataSet, id, 1, 0); RecolorPicture(C0CD2, C0CE2, 0, 0, s[0]);   // c000:045b / 0483
    s[1] = await LoadPicture(name + pic.DataSet, (id + 0x80) & 0xFF, 1, 0); RecolorPicture(C0CD2, C0CE2, 0, 0, s[1]);   // c000:04c4 / 04ec
  }
}

// C000:04FC DrawIconAt(col, row, dir, pose, slot): mirrored for dir >= 4; into the view at (col*3, row*3)
export function DrawIconAt(col, row, dir, pose, slot) {
  const src = combatIcons()[slot][pose];
  if (!src) return;
  const tmp = AllocPicture(src.height, src.width8, 1, 1);               // c000:0561
  if (dir < 4) { tmp.px.set(src.px.subarray(0, tmp.px.length)); if (src.mask) tmp.mask.set(src.mask.subarray(0, tmp.mask.length)); }   // c000:05b2..05fc
  else MirrorPicture(src, tmp);                                          // c000:0592
  DrawPicture(col * 3, row * 3, 0, 1, tmp, pic.viewPic);                 // c000:062b
}
