// game/areas/view_ov28.js — VIEW ov28 (AC00): encounter pictures, animations, portraits, 3D sprites.
// Owner: por-build-ecl. Source: decode/pseudo/VIEW.pas.md ov28 (verified) + the bytes ac00:0000..07bd for every call's
// arguments (LoadAnimation's AllocPicture/ConvertPicturePixels/RecolorPicture, Show3DSprite's DrawPicture, DrawPortrait).
// TAnim (g_6ABE enc_Anim): { count, cur, delay[1..n], pic[1..n] } — engine LoadAnimationRecord shape (1-based).

import { view } from './view.js';
import { state as pic, LoadPicture, LoadAnimationRecord, DrawPicture, PutPicture, FlushViewDirtyLines,
  RecolorPicture } from '../engine/pictures.js';
import { DrawTitledFrame } from '../engine/text.js';
import { TimeInHundredths } from '../engine/timer.js';
import { menu } from '../engine/menus.js';
import { fatal } from '../engine/errors.js';

const G = () => view.g;
const C0C6C = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];   // g_0C6C identity
const C0C7C = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 14, 15];    // g_0C7C 13 -> 0
const HEAD_IDS = [31, 0, 8, 9, 13, 16, 18, 22, 34, 45, 51, 53, 57, 67];  // g_286F (image)
const BODY_IDS = [68, 1, 2, 3, 4, 7, 8, 18, 24, 26, 33, 35, 37, 0];      // g_287D (image)

export const emptyAnim = () => ({ count: 0, cur: 0, delay: [0], pic: [null] });
let animName = '', animId = 0xFF;           // g_6B0A / g_6B1C (loaded name / id)

// AC00:0000 DrawPictureScreenOrView(col, row, toView, pic)
export function DrawPictureScreenOrView(col, row, toView, p) {
  if (!p) return;                                                        // ac00:0009
  if (toView) { DrawPicture(col - 1, row - 1, 0, 1, p, pic.viewPic); FlushViewDirtyLines(); }   // ac00:002f / 0034
  else PutPicture(col, row, p);                                          // ac00:0047
}
// AC00:0050 / 0070
export function DrawHead(col, row, p) { DrawPictureScreenOrView(col, row, false, p); }
export function DrawBody(col, row, p) { DrawPictureScreenOrView(col, row + 5, false, p); }

// AC00:048F FreeAnimation(var anim)
export function FreeAnimation(anim = view.anim) {
  anim.count = 0; anim.cur = 0; anim.delay = [0]; anim.pic = [null];    // ac00:04e3 FillChar($42)
  animName = ''; animId = 0xFF;                                          // ac00:04e8 / 04ed
}

// AC00:00A2 LoadAnimation(name, id, flags, var anim)
export async function LoadAnimation(name, id, flags, anim = view.anim) {
  if (name === animName && id === animId) return;                        // ac00:00c6 / 00d0
  FreeAnimation(anim); animName = name; animId = id;                     // ac00:00df..00f8
  const isPic = name === 'PIC' || name === 'FINAL';                      // ac00:0105 / 0116 XOR-coded frames
  const a = await LoadAnimationRecord(name + pic.DataSet, id, isPic);    // ac00:0178 (XOR delta + conversion in the engine)
  if (!a) return;                                                        // size 0
  let n = a.count;
  if (name === 'PIC' && id === 1 && n > 4) n = 4;                        // ac00:01b3 / 01c3 record PIC?/1 capped
  anim.count = n; anim.cur = 1;
  for (let k = 1; k <= n; k++) {
    const p = a.pic[k];
    if (flags & 1) {                                                     // AllocPicture(.., flags) + ConvertPicturePixels(.., flags, transp 0, ..)
      p.mask = new Uint8Array(p.px.length);
      for (let i = 0; i < p.px.length; i++) if (p.px[i] === 0) p.mask[i] = 1;   // colour 0 transparent (pixels already 0)
      RecolorPicture(C0C6C, C0C7C, 0, 0, p);                             // ac00:043a (EGA): 13 -> 0
    }
    anim.delay[k] = a.delay[k]; anim.pic[k] = p;
  }
}

// AC00:05D9 LoadPortrait(head, body): FFh = keep
export async function LoadPortrait(head, body) {
  const g = G();
  if ((head & 0xFF) !== 0xFF && head !== g.g_6B00) {                     // ac00:05fa / 0600
    view.headPic = await LoadPicture('HEAD' + pic.DataSet, head, 0, 0); g.g_6B00 = head & 0xFF;   // ac00:0638 / 0640
  }
  if ((body & 0xFF) !== 0xFF && body !== g.g_6B05) {                     // ac00:0643 / 0649
    view.bodyPic = await LoadPicture('BODY' + pic.DataSet, body, 0, 0); g.g_6B05 = body & 0xFF;   // ac00:0681 / 0689
  }
}

// AC00:0697 DrawPortrait(col, row, both)
export function DrawPortrait(col, row, both) {
  if (both) { DrawHead(col, row, view.headPic); DrawBody(col, row, view.bodyPic); }   // ac00:06b1 / 06c5
  else DrawPictureScreenOrView(col, row, false, view.headPic);           // ac00:06e2
}

// AC00:04F9 ShowPortrait
export async function ShowPortrait() {
  const c = G().SelectedChar;
  if (!c || c.b[0xBB] === 0 || c.b[0xBC] === 0) return;                  // ac00:0503 / 050f head_pic / body_pic
  DrawTitledFrame(0x1C, 1, 0x26, 0x0B, 0, 0, '');                        // ac00:053b
  await LoadPortrait(HEAD_IDS[c.b[0xBB]] ?? 0, BODY_IDS[c.b[0xBC]] ?? 0); // ac00:05bb
  DrawPortrait(0x1C, 1, true);                                           // ac00:05c8
}

// AC00:0708 Show3DSprite(k, anim)
export function Show3DSprite(k, anim = view.anim) {
  if (k < 1 || k > 3) throw fatal('Illegal range in Show3DSprite.', false); // ac00:072d..0749 (TerminateGame)
  const p = anim.pic[k];
  if (p) { DrawPicture(p.x + 2, p.y + 2, 0, 1, p, pic.viewPic); FlushViewDirtyLines(); }   // ac00:07ac / 07b5
}

// 9D00:04A3..052D: one animation step of HorizontalMenu (menus.js calls menu.animHook while it waits)
let tAnim = TimeInHundredths();
export async function MenuAnimStep(animate) {
  const a = view.anim;
  if (a.cur === 0) return;                                               // 9d00:04a3
  DrawPictureScreenOrView(3, 3, animate, a.pic[a.cur]);                  // 9d00:04cc (animate doubles as toView)
  const now = TimeInHundredths();
  if (now - tAnim >= (a.delay[a.cur] || 0) * 10 || menu.forceAnim()) {   // 9d00:04e9..0511
    a.cur++; if (a.cur > a.count) a.cur = 1;                             // 9d00:0513..0520
    tAnim = now;                                                         // 9d00:0525 TODO(engine): the original shares [BP-57h] with the menu start time
  }
}
menu.animHook = MenuAnimStep;
