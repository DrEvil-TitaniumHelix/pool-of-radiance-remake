// game/areas/view.js — VIEW area (ov14 movement/explore, ov25 menus, ov26..ov34 3D view, area map, pictures).
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md (verified by por-verify2, VIEW_VERIFY.md, #verify-15..24 applied)
// + decode/data/GEO.md, WALLDEF.md. Every routine keeps its `seg:off`; statements keep their address where it matters.
// Parts: M3a ov29 map access + 3D renderer + wall sets, ov26 RefreshView, ov27 DrawExploreFrames (this file);
// ov14 movement / ExploreCommand, ov28 pictures, ov32 tiles/icons, ov25 lists follow (view_*.js).
// ov34 (Load8x8Set / Put8x8Symbol) lives in engine/pictures.js (build-engine).
// Image tables below were read from START.unpacked.exe's DS and match VIEW.pas.md (dx/dy, piece and placement tables).

import { LoadDaxRecord } from '../engine/dax.js';
import { state as pic, Put8x8Symbol, Load8x8Set, FillPictureRect, FlushViewDirtyLines } from '../engine/pictures.js';
import { DrawTitledFrame } from '../engine/text.js';
import { fatal } from '../engine/errors.js';

export const view = {
  map: new Uint8Array(0x400),     // g_6A5C^: 4 planes of 16x16 (walls N/E, walls S/W, cell attribute, passages)
  wallBuf: new Uint8Array(0x924), // g_6A58^ WallBuf: 3 slots x 30Ch (5 wall types x 156 bytes)
  wallSlotId: [0, 0xFFFF, 0xFFFF, 0xFFFF],   // g_6AAE + slot*4 (g_6AB2/6AB6/6ABA): wall-set id per slot
  wallSlotNo: [0, 0xFFFF, 0xFFFF, 0xFFFF],   // g_6AB0 + slot*4 (g_6AB4/6AB8/6ABC)
  backdrop: [0, 0, 0, 0],         // g_6A60..g_6A63 (SetBackdropColours B100:0155)
  g: null,                        // the shared globals (ecl_host.js eclG)
  m0: (a) => 0,                   // ecl_Mem4900^ word at ECL address a (bound by ecl_host.js)
  setM0: (a, v) => {},
  m1: (a) => 0,                   // ecl_Mem6B00^ word (array, no char-field overlay)
  setM1: (a, v) => {},
  setEclPC: (pc) => {},           // ecl_PC (DS:49ED)
  vecB: () => 0,                  // ecl_VecB (DS:49E5)
  anim: { count: 0, cur: 0, delay: [0], pic: [null] },   // g_6ABE enc_Anim (ov28 TAnim)
  headPic: null, bodyPic: null,   // g_6B01 / g_6B06 loaded portrait pictures (ov28)
};

const DX = [0, 1, 1, 1, 0, -1, -1, -1, 0];               // g_2736
const DY = [-1, -1, 0, 1, 1, 1, 0, -1, 0];               // g_273F
const PIECE_START = [0, 2, 6, 10, 22, 38, 54, 110, 132, 154];   // g_0C8C
const PIECE_W = [1, 1, 1, 3, 2, 2, 7, 2, 2, 1];          // g_0C96
const PIECE_H = [2, 4, 4, 4, 8, 8, 8, 11, 11, 2];        // g_0CA0
const COL = [5, 4, 6, 4, 2, 7, 2, 0, 9, 5];              // g_0CAA[piece] (g_0CAA..g_0CBC)
const ROW = [4, 3, 3, 3, 1, 1, 1, 0, 0, 4];              // g_0CBE[piece] (g_0CBE..g_0CD0)
const SYM_BASE = [1, 46, 116, 186, 256];                 // g_2722
const REBASE_MIN = 45;                                   // g_272C
const C0C26 = [0, 15, 12, 11, 13, 10, 9, 14, 0, 15, 12, 11, 13, 10, 9, 14];   // g_0C26 EGA colour list (16 entries in the image)
const PATTERN_260A = null;                               // @g_260A (CGA pattern table; the EGA fill ignores it)

const sx8 = (v) => ((v & 0xFF) ^ 0x80) - 0x80;

// ======================================================================================================
// ov29 (B100) — map access
// ======================================================================================================

// B100:031F
export function InMap(x, y) { return y < 16 && y >= 0 && x < 16 && x >= 0; }

// b100:035f / 048a / 0589 bounds rule shared by the three readers: null = outside a bounded map
function cell(x, y) {
  x = sx8(x); y = sx8(y);
  const blk = view.g ? view.g.ecl_Block : 0;                             // g_84DC
  if (!InMap(x, y) && (blk === 0 || blk === 10)) return null;
  if (x > 15) x = 0; if (x < 0) x = 15;                                  // b100:037b wrap
  if (y > 15) y = 0; if (y < 0) y = 15;
  return y * 16 + x;
}

// B100:047B GetWallType(x, y, dir)
export function GetWallType(x, y, dir) {
  const c = cell(x, y);
  if (c === null) return 0;
  switch (dir) {                                                         // b100:04d1
    case 0: return view.map[c] >> 4;
    case 2: return view.map[c] & 0x0F;
    case 4: return view.map[0x100 + c] >> 4;
    case 6: return view.map[0x100 + c] & 0x0F;
  }
  return 0;                                                              // TODO(decode): garbage for odd dir
}

// B100:0350 GetPassage(x, y, dir)
export function GetPassage(x, y, dir) {
  const c = cell(x, y);
  if (c === null) return 0;
  let r = 1;
  if (GetWallType(x, y, dir) !== 0) {                                    // b100:03b4
    const p = view.map[0x300 + c];
    switch (dir) {
      case 6: r = p >> 6; break;
      case 4: r = (p & 0x30) >> 4; break;
      case 2: r = (p & 0x0C) >> 2; break;
      case 0: r = p & 3; break;
    }
  }
  return r;
}

// B100:057A GetCellAttr(x, y)
export function GetCellAttr(x, y) {
  const c = cell(x, y);
  return c === null ? 0 : view.map[0x200 + c];
}

// B100:10C7 Load3DMap(id)
export async function Load3DMap(id) {
  const rec = await LoadDaxRecord(pic.DataPath + 'GEO' + pic.DataSet, '.dax', id);   // b100:1120
  if (!rec || rec.length !== 0x402) throw fatal('Unable to load geo in Load3DMap.', true);   // b100:112b (fatal, TerminateGame)
  view.map.set(rec.subarray(2, 0x402));                                  // b100:1179..11df four Move($100)
  view.setM0(0x49C5, id);                                                // b100:11fb ecl_Mem4900^.w[$18A] := id
}

// ======================================================================================================
// ov29 (B100) — wall sets and the 3D renderer
// ======================================================================================================

// B100:0E08 LoadWallSet(id, slot) — from the bytes b100:0e0f..109a (WALLDEF.md loader, Pascal order (id, slot))
export async function LoadWallSet(id, slot) {
  if (slot < 1 || slot > 3) return;                                      // b100:0e0f
  const rec = await LoadDaxRecord(pic.DataPath + 'WALLDEF' + pic.DataSet, '.dax', id);   // b100:0e70
  const size = rec ? rec.length : 0;
  if (size === 0 || Math.floor(size / 0x30C) + slot > 4)                 // b100:0e75 / 0e8e
    throw fatal('Unable to load wallset in LoadWallSet.', true);           // b100:0e93..0ebc (TerminateGame)
  const delta = (SYM_BASE[slot] - SYM_BASE[1]) & 0xFF;                   // b100:0eca byte added below
  let n = 0, f = 1;
  do {                                                                   // b100:0edf
    const dst = (slot + f - 2) * 0x30C, src = rec.subarray(n, n + 0x30C);
    view.wallBuf.fill(0, dst, dst + 0x30C); view.wallBuf.set(src, dst);  // Move($30C) (a short last block copies heap bytes, TODO(decode))
    n += 0x30C; f++;
  } while (n < size);                                                    // b100:0f1a
  const blocks = (f - 1) & 0xFF;                                         // b100:0f2e
  for (f = 1; f <= blocks; f++) {                                        // b100:0f44
    const s = slot + f - 1;
    if (s >= 1 && s <= 3) {                                              // b100:0f5b set CS:0DE8 = [1..3]
      view.wallSlotId[s] = 0xFFFF; view.wallSlotNo[s] = 0xFFFF;          // b100:0f74 / 0f89
      for (let t = 1; t <= 5; t++)                                       // b100:0f95
        for (let k = 0; k <= 0x9B; k++) {
          const o = s * 0x30C + t * 0x9C + k - 0x3A8;                    // = (s-1)*30Ch + (t-1)*9Ch + k
          if (view.wallBuf[o] >= REBASE_MIN) view.wallBuf[o] = (view.wallBuf[o] + delta) & 0xFF;   // b100:0fd0 quirk: 45 shifts too
        }
      if (blocks > 1) {                                                  // b100:1014
        if (id === 0) id = 10;                                           // b100:1020
        await Load8x8Set(id * 10 + f, s);                                // b100:103c
      } else await Load8x8Set(id, s);                                    // b100:1051
    }
  }
  if (id === 10) id = 0;                                                 // b100:1061
  view.wallSlotId[slot] = id; view.wallSlotNo[slot] = slot;              // b100:107d / 1093
}

// LOAD_PIECES with FFh (2F00:0D97): slot emptied
export function ClearWallSlot(slot) { view.wallSlotId[slot] = 0xFFFF; view.wallSlotNo[slot] = 0xFFFF; }

// B100:0155
export function SetBackdropColours(c0, c1, c2, c3) { view.backdrop = [c0, c1, c2, c3]; }

// B100:0174
function DrawBackdrop() {
  const b = view.backdrop, vp = pic.viewPic;
  FillPictureRect(2, 0x10, 0x0B, 0x2B, b[0], PATTERN_260A, vp);         // b100:0198 sky / ceiling
  FillPictureRect(2, 0x3B, 0x0B, 0x01, b[1], PATTERN_260A, vp);         // b100:01be
  FillPictureRect(2, 0x3C, 0x0B, 0x02, b[2], PATTERN_260A, vp);         // b100:01e4
  FillPictureRect(2, 0x3E, 0x0B, 0x2A, b[3], PATTERN_260A, vp);         // b100:020a ground
}

// B100:0211 DrawWallPiece(col, row, wallType, piece)
function DrawWallPiece(col, row, wallType, piece) {
  col = sx8(col); row = sx8(row);
  let k = PIECE_START[piece];
  const lastCol = col + PIECE_W[piece] - 1, lastRow = row + PIECE_H[piece] - 1;
  for (let r = row; r <= lastRow; r++)
    for (let c = col; c <= lastCol; c++) {
      if (r >= 0 && r < 11 && c >= 0 && c < 11) {
        const s = view.wallBuf[(wallType - 1) * 0x9C + k];
        if (s !== 0) Put8x8Symbol(c + 2, r + 2, s, 1, 1);
      }
      k++;                                                               // advances even for clipped cells
    }
}

// B100:05F3
export function FlushView() { FlushViewDirtyLines(); }

// B100:0000 DrawAreaMap(x, y, dir)
export function DrawAreaMap(x, y, dir) {
  x = sx8(x); y = sx8(y);
  let x0 = x - 5; if (x0 < 0) x0 = 0; if (x0 > 5) x0 = 5;               // b100:0007
  let y0 = y - 5; if (y0 < 0) y0 = 0; if (y0 > 5) y0 = 5;               // b100:0034
  for (let r = 0; r <= 10; r++)
    for (let c = 0; c <= 10; c++) {
      let sym = 0x104;                                                   // b100:0082
      if (GetWallType(x0 + c, y0 + r, 0) !== 0) sym = 0x105;
      if (GetWallType(x0 + c, y0 + r, 2) !== 0) sym += 2;
      if (GetWallType(x0 + c, y0 + r, 4) !== 0) sym += 4;
      if (GetWallType(x0 + c, y0 + r, 6) !== 0) sym += 8;
      Put8x8Symbol(c + 2, r + 2, sym, 1, 0);                             // b100:010c
    }
  Put8x8Symbol(x - x0 + 2, y - y0 + 2, (dir >> 1) + 0x100, 1, 0);        // b100:0146 party arrow
  FlushView();
}

// B100:05FD Draw3DView(x, y, dir) — right-hand passes and locals checked on the bytes (b100:0621..0dab)
export function Draw3DView(x, y, dir) {
  if (view.g.view_AreaMap !== 0) { DrawAreaMap(x, y, dir); return; }   // b100:0603
  DrawBackdrop();                                                        // b100:061e
  const left = (dir + 6) % 8, back = (dir + 4) % 8, right = (dir + 2) % 8;   // [BP-1], [BP-3], [BP-2]
  let cx = sx8(x) + 2 * DX[dir], cy = sx8(y) + 2 * DY[dir];             // b100:066b
  const GW = (sx, sy, d) => GetWallType(sx, sy, d);
  for (let dist = 2; dist >= 0; dist--) {
    if (dist === 2) {
      // front walls: pass 1 centre -> left, pass 2 centre -> right (b100:06a6 / 07c7)
      for (const [side, other, step] of [[left, right, -2], [right, left, 2]]) {
        let sx = cx, sy = cy, off = 0, edge = 0;
        for (let i = 0; i < 4; i++) {
          const w = GW(sx, sy, dir);                                     // b100:06d5
          if (!InMap(sx8(sx), sy8(sy)) && GW(sx, sy, other) === 0) edge = 0;   // b100:06e4
          const corner = step < 0 ? COL[9] + off + 1 : COL[9] + off - 1;
          if (w === 0) {
            if (edge > 0 && GW(sx - DX[side], sy - DY[side], side) !== 0) DrawWallPiece(corner, ROW[9], edge, 9);
            edge = 0;
          } else {
            if (edge > 0) DrawWallPiece(corner, ROW[9], edge, 9);
            edge = w;
            DrawWallPiece(COL[0] + off, ROW[0], w, 0);                   // far front wall 1x2
          }
          off += step; sx += DX[side]; sy += DY[side];
        }
      }
      // far side walls (b100:08e8 left, piece 1; b100:097f right, piece 2)
      for (const [side, piece, step] of [[left, 1, -2], [right, 2, 2]]) {
        let sx = cx, sy = cy, off = 0;
        for (let i = 0; i < 3; i++) {
          const w = GW(sx, sy, side);
          if (w !== 0) DrawWallPiece(COL[piece] + off + (i === 0 ? 0 : (step < 0 ? -1 : 1)), ROW[piece], w, piece);
          off += step; sx += DX[side]; sy += DY[side];
        }
      }
    } else if (dist === 1) {
      // b100:0a20: from cx + 2*left going right (front piece 3, left side piece 4); b100:0b06 mirror (piece 3, right side 5)
      for (const [from, to, sidePiece, start, step, side] of [[left, right, 4, -6, 3, left], [right, left, 5, 6, -3, right]]) {
        let sx = cx + 2 * DX[from], sy = cy + 2 * DY[from], off = start;
        for (let i = 0; i < 3; i++) {
          let w = GW(sx, sy, dir); if (w !== 0) DrawWallPiece(COL[3] + off, ROW[3], w, 3);
          w = GW(sx, sy, side); if (w !== 0) DrawWallPiece(COL[sidePiece] + off, ROW[sidePiece], w, sidePiece);
          off += step; sx += DX[to]; sy += DY[to];
        }
      }
    } else {
      // b100:0bf6: from cx + left going right (front piece 6, left side 7); b100:0cb8 mirror (piece 6, right side 8)
      for (const [from, to, sidePiece, start, step, side] of [[left, right, 7, -7, 7, left], [right, left, 8, 7, -7, right]]) {
        let sx = cx + DX[from], sy = cy + DY[from], off = start;
        for (let i = 0; i < 2; i++) {
          let w = GW(sx, sy, dir); if (w !== 0) DrawWallPiece(COL[6] + off, ROW[6], w, 6);
          w = GW(sx, sy, side); if (w !== 0) DrawWallPiece(COL[sidePiece] + off, ROW[sidePiece], w, sidePiece);
          off += step; sx += DX[to]; sy += DY[to];
        }
      }
    }
    cx += DX[back]; cy += DY[back];                                      // b100:0d7a
  }
  FlushView();                                                           // b100:0dab
}
const sy8 = sx8;

// ======================================================================================================
// ov26 (A200) — view refresh
// ======================================================================================================

// A200:00C7 / 00FB / 012F (nested in RefreshView; from the bytes)
function BackdropColour1(k) { return k === 0x08 ? 0 : k === 0x41 ? 0 : 0x0F; }
function BackdropColour2(k) { return k === 0x08 ? 8 : 7; }
function BackdropColour3(k) { return k === 0x0B ? 8 : k === 0x09 ? 6 : k === 0xDB ? 6 : k === 0x06 ? 1 : 6; }

// A200:016D RefreshView
export async function RefreshView() {
  const g = view.g;
  let mode = g.travel_Mode;
  if (view.m0(0x49E6) !== 0) mode = 1;                                    // a200:017d ecl_Mem4900^.w[$1CC]
  if (mode === 1) {
    g.party_CellAttr = GetCellAttr(g.party_MapX, g.party_MapY);           // a200:019b
    const k = view.m0(g.party_CellAttr > 0x7F ? 0x49FE : 0x49FD);         // ecl_Mem4900^.w[$1FC] / [$1FA]
    view.backdrop[0] = k < C0C26.length ? C0C26[k] : 0;                   // TODO(decode): index > 15 reads the landmark table g_0C30
    if (g.g_84E5 !== 0) {                                                 // a200:01d9
      view.backdrop[1] = BackdropColour1(g.g_6F69); view.backdrop[2] = BackdropColour2(g.g_6F69);
      view.backdrop[3] = BackdropColour3(g.g_6F68);
    }
    SetBackdropColours(...view.backdrop);                                 // a200:0207
    if (view.m0(0x49FB) !== 0) g.view_AreaMap = 0;                        // a200:0210 ecl_Mem4900^.w[$1F6]
    Draw3DView(g.party_MapX, g.party_MapY, g.party_Dir);                  // a200:0229
  } else if (mode >= 2 && mode <= 4) {                                   // a200:0230
    let wx = sx8(g.ds[0x3C76 + mode] + view.m0(0x49C3) - 2);              // g_3C76[mode] + ecl w[$186] - 2 (byte)
    if (wx < 0) wx = 0; if (wx > 0x27) wx = 0x27;
    let wy = sx8(view.m0(0x49C4) - 2);                                     // ecl w[$188] - 2
    if (wy < 0) wy = 0; if (wy > 0x1F) wy = 0x1F;
    await DrawOverlandWindow(wx, wy);                                      // a200:0293
    await DrawOverlandParty();                                             // a200:0299
  }
}

// A200:0000 DrawOverlandParty — from the bytes a200:0006..00be
export async function DrawOverlandParty() {
  const g = view.g;
  let col = sx8(g.ds[0x3C76 + g.travel_Mode] + view.m0(0x49C3));          // a200:001c
  if (col >= 2) col = col < 0x2A ? 2 : col < 0x2B ? 3 : 4;                // a200:001f..003f (col < 2 kept)
  const y = view.m0(0x49C4);
  const row = y < 2 ? y & 0xFF : y < 0x22 ? 2 : y < 0x23 ? 3 : 4;         // a200:0047..0081 (unsigned word compares)
  const { DrawIconAt } = await import('./view_ov32.js');
  DrawIconAt(col, row, g.party_Dir, (g.g_6DDC & 0xFF) % 2, ((g.g_6DDC & 0xFF) >> 1) + 9);   // a200:00a9 icons 9..11, 2 poses
  g.g_6DDC = ((g.g_6DDC & 0xFF) + 1) % 6;                                 // a200:00bb
  FlushView();                                                           // a200:00be
}

// A700:0000 DrawOverlandWindow(wx, wy): 5x5 squares of 24x24 tiles from the overland map g_3648 (36 x 44)
export async function DrawOverlandWindow(wx, wy) {
  const g = view.g, ds = g.ds;
  const lm = (k, o) => { const v = ds[0x0C30 + 6 * k + o] | (ds[0x0C31 + 6 * k + o] << 8); return v > 0x7FFF ? v - 0x10000 : v; };
  const { DrawTile24 } = await import('./view_ov32.js');
  for (let r = 0; r <= 4; r++)
    for (let c = 0; c <= 4; c++) {
      let t = (ds[0x3648 + (wy + r) * 44 + (wx + c)] - 1) & 0xFF;        // a700:0049
      for (let k = 1; k <= 9; k++)                                       // landmark overrides g_0C30[1..9] (x, y, tile)
        if (wx + c === lm(k, 0) && wy + r === lm(k, 2)) {                // a700:006a / 0095
          const tile = (lm(k, 4) - 1) & 0xFF;
          switch (k) {
            case 3: if (view.m0(0x4A8C) !== 0xFF) t = tile; break;                                  // w[$318]
            case 4: if (view.m0(0x4AD2) !== 0 || (view.m0(0x4A7C) & 8) !== 0 || view.m0(0x4A9F) === 0) t = tile; break;   // w[$3A4], w[$2F8], w[$33E]
            case 5: if ((view.m0(0x4AA0) & 2) === 0) t = tile; break;                               // w[$340]
            case 6: t = tile; break;
            case 7: if ((view.m0(0x4AA0) & 1) === 0) t = tile; break;
            case 8: case 9: if (view.m0(0x4AB3) > 0xFD) t = tile; break;                            // w[$366]
          }
        }
      DrawTile24(c * 3, r * 3, t, 1);                                    // a700:01e1
    }
}

// ======================================================================================================
// ov27 (A700)
// ======================================================================================================

// A700:0207 DrawExploreFrames — from the bytes a700:0207..027a
export function DrawExploreFrames() {
  DrawTitledFrame(1, 1, 0x0F, 0x0F, 0, 0, '');                            // a700:022e picture / view box
  DrawTitledFrame(0x11, 1, 0x26, 0x0F, 0, 0, '');                         // a700:0254 roster box
  DrawTitledFrame(1, 0x11, 0x26, 0x16, 0, 0, '');                         // a700:027a text window
}

// ======================================================================================================
// ov33 (C500)
// ======================================================================================================

// C500:0004 DebugPrint(msg, a, b, c): only with DebugFlag (g_49F7, STING ^D); from the bytes c500:001e..00ec
export async function DebugPrint(msg, a, b, c) {
  if (!view.g.DebugFlag) return;                                         // c500:001e
  const T = await import('../engine/text.js');
  T.ClearTextRectangle(0, 0, 0x27, 0);                                   // c500:0085
  T.DrawText(0, 0, 0x0E, String(a) + ' , ' + String(b) + ' , ' + String(c));   // c500:00ce (separator cs:0000)
  await T.ShowBottomPromptAndReadKey(0x0E, msg);                         // c500:00db
  T.ClearTextRectangle(0, 0, 0x27, 0);                                   // c500:00ec
}

// The rest of VIEW, re-exported so that other areas binding './view.js' by published name see every routine
// (the parts import `view` from here; none of them touches it at module top level, so the cycle is safe).
export * from './view_ov10.js';
export * from './view_ov14.js';
export * from './view_ov23.js';
export * from './view_ov28.js';
export * from './view_ov30.js';
export * from './view_ov31.js';
export * from './view_ov32.js';
