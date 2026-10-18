// game/areas/combat_ov18.js — COMBAT ov18 (seg 7A00): the dragon finale (ECL PROGRAM 8) and the overland tile
// recolouring (ecl_RunAfterNewBlock / LoadGame). Lane por-build-combat.
// Source: decode/pseudo/COMBAT.pas.md "## ov18 (seg 7A00)" (FINAL), combat_parts/ov18_notes.md,
// COMBAT_SCREENS.md COMBAT-42..45; evidence decode/listings/ov18.lst. Conventions: combat_core.js header.
// VM host mapping (combat.js combatHost): dragonFinale() -> DragonFinale, recolourOverlandTiles(animate) ->
// RecolourOverlandTiles(animate).
//
// Local conventions:
// - TAnim (66 bytes in the original) = { count, cur, delay: [], pic: [] } with 1-based frames (the shape of
//   pictures.js LoadAnimationRecord); VIEW LoadAnimation(name, id, flags, var anim) fills it in place.
// - LoadPicture's `var pic` (5th Pascal parameter): the engine export returns the picture; a ref box is also
//   passed so either form works.
// - g_4A20 (off-screen screen picture) = g.g_4A20, falling back to pictures.js state.viewPic.
// - ecl_Mem6B00^ = g.ecl_Mem6B00 (the VM's Uint16Array region 6B00h); byte offset o = word index o >> 1.

import { X, g, ds, dsW, byte, word } from './combat_core.js';
import { state as picState } from '../engine/pictures.js';

const screenPic = () => g.g_4A20 ?? picState.viewPic;                   // g_4A20
const eclMem6B00W = (o) => g.ecl_Mem6B00[o >> 1];
const dsBytes = (off, n) => Array.from({ length: n }, (_, i) => ds(off + i));

async function loadPic(name, id) {                                       // LoadPicture(name, id, 0, 0, var pic)
  const box = { v: g.FinalePic };
  const r = await X.LoadPicture(name, id, 0, 0, box);
  return r !== undefined ? r : box.v;
}

// 7A00:0006 PlayFinaleAnimation
export async function PlayFinaleAnimation(col, row, animId, cycles) {
  let done = 0;                                                          // 7a00:000c
  let t0 = await X.TimeInHundredths();                                   // 7a00:0010
  const anim = { count: 0, cur: 0, delay: [], pic: [] };                 // 7a00:001b  FillChar(anim, $42, 0)
  const r = await X.LoadAnimation('FINAL', animId, 2, anim);             // 7a00:002c  file FINAL<DataSet>.dax
  if (r && r !== anim) Object.assign(anim, r);
  await X.DrawPicture(col - 1, row - 1, 0, 0, anim.pic[1], screenPic()); // 7a00:004c
  await X.FlushViewDirtyLines();                                         // 7a00:006f
  do {
    await X.DrawPictureScreenOrView(col, row, 1, anim.pic[anim.cur]);    // 7a00:0074
    const t = await X.TimeInHundredths();                                // 7a00:0093
    // 7a00:009e  signed 32-bit: (t - t0) > LongInt(GameSpeed + 3) * frame.delay
    // quirk: TimeInHundredths wraps at midnight -> t - t0 < 0 holds the frame until t0 catches up
    if (((t - t0) | 0) > Math.imul(g.GameSpeed + 3, anim.delay[anim.cur] | 0)) {
      anim.cur = byte(anim.cur + 1);                                     // 7a00:00db
      if (anim.cur > anim.count) {                                       // 7a00:00de
        anim.cur = 1;                                                    // 7a00:00e6
        done = byte(done + 1);                                           // 7a00:00ea
      }
      t0 = t;                                                            // 7a00:00ed
    }
    await X.yieldShort();                                                // (browser) the original busy-loops here
  } while (done !== cycles);                                             // 7a00:00f9  quirk: cycles = 0 -> 256 loops
  await X.FreeAnimation(anim);                                           // 7a00:0104
}

// (5 * (10 - GameSpeed)) shr 1 in 16 bits, low byte pushed (7a00:0393 / 05d8)
const finaleCycles = () => byte(word(5 * (10 - g.GameSpeed)) >> 1);

// 7A00:02A4 DragonFinale
export async function DragonFinale() {
  g.DataSetStr = String(g.DataSet).slice(0, 1);                          // 7a00:02ab  Str(DataSet:0, string[1])
  g.SavedMode = g.game_Mode;                                             // 7a00:02c5
  g.game_Mode = 7;                                                       // 7a00:02cb
  g.FinalePic = null;                                                    // 7a00:02d0
  await X.ClearTextRectangle(1, 17, 38, 22);                             // 7a00:02d8
  await X.DrawText(1, 17, 10, 'Mortally wounded, the dragon roars!');    // 7a00:02e9
  await X.DrawText(1, 18, 10, 'The spirit of Tyranthraxus flares up');   // 7a00:0306
  await X.DrawText(1, 19, 10, 'from the dragon\'s body.');               // 7a00:0323
  await X.RedrawCurrentMode();                                           // 7a00:0340  mode 7: draws nothing
  g.FinalePic = await loadPic('FINAL' + g.DataSetStr, 1);                // 7a00:0345
  await X.DrawPicture(0, 0, 0, 0, g.FinalePic, screenPic());             // 7a00:0372
  await PlayFinaleAnimation(3, 5, 2, finaleCycles());                    // 7a00:0393
  g.FinalePic = await loadPic('FINAL' + g.DataSetStr, 3);                // 7a00:03b9
  await X.DrawPicture(0, 0, 0, 0, g.FinalePic, screenPic());             // 7a00:03e6
  if (eclMem6B00W(0x67C) > 1) {                                          // 7a00:0407  party member count (ECL 6E3Eh)
    g.FinalePic = await loadPic('FINAL' + g.DataSetStr, 4);              // 7a00:0413
    await X.DrawPicture(0, 11, 0, 0, g.FinalePic, screenPic());          // 7a00:0440
  }
  if (eclMem6B00W(0x67C) > 2) {                                          // 7a00:0462
    g.FinalePic = await loadPic('FINAL' + g.DataSetStr, 5);              // 7a00:046e
    await X.DrawPicture(13, 9, 0, 0, g.FinalePic, screenPic());          // 7a00:049b
  }
  if (eclMem6B00W(0x67C) > 3) {                                          // 7a00:04be
    g.FinalePic = await loadPic('FINAL' + g.DataSetStr, 6);              // 7a00:04ca
    await X.DrawPicture(0, 9, 0, 0, g.FinalePic, screenPic());           // 7a00:04f7
  }
  await X.ClearTextRectangle(1, 17, 38, 22);                             // 7a00:0519
  await X.DrawText(1, 17, 10, '"Fools, you have but slain the body');    // 7a00:052a
  await X.DrawText(1, 18, 10, 'I possessed.  I cannot be defeated!"');   // 7a00:0547
  await X.DrawText(1, 19, 10, 'With the power of the pool of radiance'); // 7a00:0564
  await X.DrawText(1, 20, 10, 'which I moved here, to my lair,');        // 7a00:0581
  await X.DrawText(1, 21, 10, 'I will still rule, by possessing one');   // 7a00:059e
  await X.DrawText(1, 22, 10, 'of you!"');                               // 7a00:05bb
  await PlayFinaleAnimation(3, 1, 7, finaleCycles());                    // 7a00:05d8
  await X.ClearTextRectangle(1, 17, 38, 22);                             // 7a00:05fe
  await X.DrawText(1, 17, 10, '"No Lord Bane!  I can still rule here!'); // 7a00:060f
  await X.DrawText(1, 18, 10, 'I have not failed.  Do not call me back');   // 7a00:062c
  await X.DrawText(1, 19, 10, 'through the pool!"');                     // 7a00:0649
  await X.DrawText(1, 20, 10, 'Noooo...');                               // 7a00:0666
  await PlayFinaleAnimation(3, 1, 8, 1);                                 // 7a00:0683
  await X.MessageDelay();                                                // 7a00:0695
  await X.MessageDelay();                                                // 7a00:069a
  await X.MessageDelay();                                                // 7a00:069f
  g.game_Mode = g.SavedMode;                                             // 7a00:06a4
  await X.RedrawCurrentMode();                                           // 7a00:06aa
  // quirk: FinalePic is never freed (heap leak in the original)
}

// 7A00:06B3 RecolourOverlandTiles
export async function RecolourOverlandTiles(animate) {
  const TileListA = (i) => ds(0x0900 + i);                               // g_0900 (11 B)
  const TileListB = (i) => ds(0x090B + i);                               // g_090B (18 B)
  const from = dsBytes(0x091D, 16), toA = dsBytes(0x092D, 16), toB = dsBytes(0x093D, 16);
  const pass = async (dither) => {
    for (let i = 0; i <= 10; i++)                                        // 7a00:06dd / 07ec
      if (TileListA(i) > 0x7F) await X.RecolorPicture(from, toA, TileListA(i) & 0x7F, dither, g.TileSetHi);   // 7a00:06f4 / 0803
      else await X.RecolorPicture(from, toA, TileListA(i), dither, g.TileSetLo);   // 7a00:0720 / 082f
    for (let i = 0; i <= 17; i++)                                        // 7a00:074e / 085d
      if (TileListB(i) > 0x7F) await X.RecolorPicture(from, toB, TileListB(i) & 0x7F, dither, g.TileSetHi);   // 7a00:0765 / 0874
      else await X.RecolorPicture(from, toB, TileListB(i), dither, g.TileSetLo);   // 7a00:0791 / 08a0
  };
  if (animate) {                                                         // 7a00:06b9
    await X.DrawOverlandWindow(0x11, 0x0F);                              // 7a00:06c2
    await X.FlushViewDirtyLines();                                       // 7a00:06cf
    for (let step = 0; step <= 8; step++) {                              // 7a00:06d4
      await pass(1);                                                     // 7a00:06dd..07bc  1/4 random dither
      await X.DrawOverlandWindow(dsW(0x094D + step * 2), dsW(0x095F + step * 2));   // 7a00:07bf
      await X.FlushViewDirtyLines();                                     // 7a00:07de
    }
  }
  await pass(0);                                                         // 7a00:07ec  final, complete pass
  if (animate) {                                                         // 7a00:08ce
    await X.DrawOverlandWindow(0x17, 0x19);                              // 7a00:08d4
    await X.FlushViewDirtyLines();                                       // 7a00:08e1
    await X.MessageDelay();                                              // 7a00:08e6
    await X.MessageDelay();                                              // 7a00:08eb
  }
}

// 7A00:08F6 ov18_init — empty unit initialiser
export function ov18_init() {}                                           // 7a00:08f6
