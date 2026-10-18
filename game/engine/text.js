// text.js — text cells, the game font, prompts (ENGINE res_0709) and frames / rectangles (ENGINE res_03F1).
//
// Screen = 40x25 cells of 8x8 glyphs from 8X8D1.DAX record C9h (LoadTextFont 0709:017C, 177 glyphs x 8 bytes, bit 7 = left
// pixel). Glyphs are drawn opaque (background 0). With textMap the glyph index is UpCase(ch) mod 64, so all text shows in the
// font's upper-case 64-glyph set (ENGINE-15).

import { LoadDaxRecord } from './dax.js';
import { state as pic, Put8x8Symbol } from './pictures.js';
import { Delay } from './timer.js';
import { ReadGameKey } from './input.js';
import { UpCase } from './tp.js';
import { clearPointerRegions } from './input.js';

export const text = {
  font: null,                 // FontPtr g_5E20
  col: 0, row: 0,             // text_Col g_5E24 / text_Row g_5E25
  TextOutputActive: 1,        // g_4A00 (typewriter effect while set)
  GameSpeed: 1,               // g_49E2
};

// 0709:017C LoadTextFont
export async function LoadTextFont() {
  const p = await LoadDaxRecord('8X8d1', '.dax', 0xC9);                 // 0709:0182
  if (p) text.font = p;                                                 // 0709:01ba
}

// 0709:01DF DrawRepeatedGlyph(col, row, colour, count, ch, textMap) — EGA path (0709:0377): every pixel of the cell is
// either the colour (glyph bit set) or 0
export function DrawRepeatedGlyph(col, row, colour, count, ch, textMap) {
  if (col > 39 || row > 24 || !text.font) return;                       // 0709:01e5
  const g = textMap ? UpCase(ch).charCodeAt(0) % 64 : ch.charCodeAt(0); // 0709:01fd
  const d = pic.display;
  for (let i = 0; i < count; i++) {                                     // 0709:0220
    if (col <= 39) {
      for (let fl = 0; fl < 8; fl++) {
        const bits = text.font[g * 8 + fl] ?? 0;
        const o = (row * 8 + fl) * 320 + col * 8;
        for (let b = 0; b < 8; b++) d.pix[o + b] = (bits & (0x80 >> b)) ? (colour & 15) : 0;
      }
    }
    col++;                                                              // 0709:05d7
  }
  d.touch();
}

// 0709:05EB ClearGlyphRun(col, row, colour, count)
export function ClearGlyphRun(col, row, colour, count) {
  if (col <= 39 && row <= 24) DrawRepeatedGlyph(col, row, colour, count, ' ', true);   // 0709:0608
}

// 0709:0626 DrawText(col, row, colour, s)
export function DrawText(col, row, colour, s) {
  if (col > 39 || row > 39) return;                                     // 0709:0641  quirk: row tested against 39
  for (let k = 0; k < s.length; k++) { DrawRepeatedGlyph(col, row, colour, 1, s[k], true); col++; }   // 0709:0671
}

// 0709:0DD3 ClearTextRectangle / 03F1:0137 ClearRectangle (EGA: both pages; one visible page here)
export function ClearTextRectangle(x1, y1, x2, y2) {
  const d = pic.display;
  for (let y = y1 * 8; y <= y2 * 8 + 7; y++) {
    if (y < 0 || y >= 200) continue;
    for (let x = x1 * 8; x <= x2 * 8 + 7; x++) if (x >= 0 && x < 320) d.pix[y * 320 + x] = 0;
  }
  d.touch();
}
export const ClearRectangle = ClearTextRectangle;                      // 03F1:0137 (same EGA effect: FillEgaTextRectangle colour 0)

// 0709:0CAB ClearScreen
export function ClearScreen() { pic.display.pix.fill(0); pic.display.touch(); clearPointerRegions(['hmenu']); }   // + stale pointer regions (input.js)

// 9D00:06FB ClearMenuLine (VIEW ov25)
export function ClearMenuLine() { ClearGlyphRun(0, 24, 0, 40); }

// 0709:0DBE MessageDelay
export async function MessageDelay() { await Delay(text.GameSpeed * 225); }

// 0709:0BF5 ShowBottomPromptAndReadKey(colour, s)
export async function ShowBottomPromptAndReadKey(colour, s) {
  ClearGlyphRun(0, 24, 0, 40);                                          // 0709:0c0e
  DrawText(0, 24, colour, s.slice(0, 40));                              // 0709:0c1e
  await ReadGameKey();                                                  // 0709:0c31  the prompt stays on screen
}

// 0709:0D68 ShowTimedBottomPrompt(s, colour)
export async function ShowTimedBottomPrompt(s, colour) {
  ClearGlyphRun(0, 24, 0, 40);                                          // 0709:0d81
  DrawText(0, 24, colour, s.slice(0, 40));                              // 0709:0d91
  await MessageDelay();                                                 // 0709:0da4
  ClearGlyphRun(0, 24, 0, 40);                                          // 0709:0da8
}

// 00BA:1693 ShowTimedBottomMessage(s): colour 0Ah (ENGINE-37)
export async function ShowTimedBottomMessage(s) { await ShowTimedBottomPrompt(s, 0x0A); }

// 0709:0768 DrawWrappedText(x1, y1, x2, y2, colour, clear, s)
const PUNCT = new Set(['!', ',', '-', '.', ':', ';', '?']);             // DS:0D16
export async function DrawWrappedText(x1, y1, x2, y2, colour, clear, s) {
  const t = ' ' + s;                                                    // 1-based indexing like the Pascal string
  if (x1 > 39 || y1 > 24 || x2 > 39 || y2 > 39) return;                 // 0709:0783
  if (text.col < x1 || text.col > x2 || text.row < y1 || text.row > y2) { text.col = x1; text.row = y1; }   // 0709:079e
  if (clear) { ClearTextRectangle(x1, y1, x2, y2); text.col = x1; text.row = y1; }                         // 0709:07ca
  let i = 1, j;
  const len = s.length;
  if (len === 0) return;                                                // 0709:07fd
  const run = async () => {                                             // 0709:06A7 RenderWrappedRun
    while (i <= j) {
      DrawRepeatedGlyph(text.col, text.row, colour, 1, t[i], true);
      if (text.TextOutputActive) await Delay(text.GameSpeed * 10);      // 0709:06eb typewriter
      i++; text.col++;
    }
  };
  const skipSpaces = () => { while (i < len && t[i] === ' ') i++; };    // 0709:0714
  do {
    j = i;                                                              // 0709:081a
    while (j < len && PUNCT.has(t[j])) j++;                             // 0709:0822
    while (j < len && !PUNCT.has(t[j]) && t[j] !== ' ') j++;            // 0709:085a
    if (t[j] !== ' ') while (j + 1 < len && PUNCT.has(t[j + 1])) j++;   // 0709:08b0
    if ((j - i) + text.col > x2) {                                      // 0709:08f2
      if ((j - i) + text.col === x2 && t[j] === ' ') { j--; await run(); }   // dead test (kept)
      text.col = x1; text.row++;                                        // 0709:0955
      skipSpaces();
      if (text.row > y2 && i < len) {                                   // 0709:0964
        text.col = x1; text.row = y1;
        await ShowBottomPromptAndReadKey(0x0D, 'Press any key to continue');   // 0709:0982
        ClearTextRectangle(x1, y1, x2, y2);                             // 0709:099e
        await run();                                                    // 0709:09b2  quirk: printed without re-checking its width
      }
    } else await run();                                                 // 0709:09b9
  } while (i <= len);
  if (text.col > x2) { text.col = x1; text.row++; }                     // 0709:09cb
}

// 0709:09E3 ReadBottomLine(prompt, colour, maxLen): String
export async function ReadBottomLine(prompt, colour, maxLen) {
  ClearGlyphRun(0, 24, 0, 40);                                          // 0709:09fd
  DrawText(0, 24, colour, prompt);                                      // 0709:0a0d
  let x = prompt.length, s = '', k;
  do {
    k = await ReadGameKey();                                            // 0709:0a2b
    if (k >= ' ' && k <= 'z') {                                         // 0709:0a38
      if (s.length < maxLen) { s += k; x++; DrawText(x, 24, 0x0F, k); } // 0709:0a49 .. 0a81
    } else if (k === '\b' && s.length > 0) {                            // 0709:0aa1
      s = s.slice(0, -1); ClearGlyphRun(x, 24, 0, 1); x--;              // 0709:0aac .. 0ae9
    }
  } while (k !== '\r' && k !== '\x1b');                                 // 0709:0aec  quirk: Esc also returns the text
  ClearGlyphRun(0, 24, 0, 40);                                          // 0709:0afd
  return s.split('').map(UpCase).join('');                              // 0709:0b0d
}

// 0709:0B66 ReadWordNumber(prompt, colour)
export async function ReadWordNumber(prompt, colour) {
  for (;;) {
    const s = await ReadBottomLine(prompt, colour, 6);                  // 0709:0b80
    if (/^[+-]?\d+$/.test(s.trim()) && s.trim() === s) {                // Val: code = 0 (no blanks allowed)
      const n = parseInt(s, 10);
      if (n >= 0 && n <= 65536) return n & 0xFFFF;                      // 0709:0bb9  quirk: 65536 -> 0
    }
  }
}

// 03F1:0000 DrawFrame(x1, y1, x2, y2, style): border of symbols 114h + 3*style one cell outside the rectangle
export function DrawFrame(x1, y1, x2, y2, style) {
  x1--; y1--; x2++; y2++;                                               // 03f1:0006
  const base = style * 3 + 0x114;                                       // 03f1:0012
  Put8x8Symbol(x1, y1, base, 0, 0); Put8x8Symbol(x2, y1, base, 0, 0);   // 03f1:0038 / 0052
  Put8x8Symbol(x1, y2, base, 0, 0); Put8x8Symbol(x2, y2, base, 0, 0);   // 03f1:006c / 0086
  for (let c = x1 + 1; c <= x2 - 1; c++) { Put8x8Symbol(c, y1, base + 2, 0, 0); Put8x8Symbol(c, y2, base + 2, 0, 0); }   // 03f1:00b9 / 00d2
  for (let r = y1 + 1; r <= y2 - 1; r++) { Put8x8Symbol(x1, r, base + 1, 0, 0); Put8x8Symbol(x2, r, base + 1, 0, 0); }   // 03f1:010c / 0124
}

// 03F1:02E8 DrawTitledFrame(x1, y1, x2, y2, style, colour, title)
export function DrawTitledFrame(x1, y1, x2, y2, style, colour, title) {
  const t = title.slice(0, 40);                                         // 03f1:02fc
  ClearRectangle(x1, y1, x2, y2);                                       // 03f1:0312
  DrawFrame(x1, y1, x2, y2, style);                                     // 03f1:032a
  if (t.length !== 0) DrawText(Math.trunc((x1 + x2 - t.length) / 2), y1, colour, t);   // 03f1:035c
}
