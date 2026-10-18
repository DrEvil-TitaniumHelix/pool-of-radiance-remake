// game/test/combat/ov18.test.mjs — COMBAT ov18 (7A00): DragonFinale text pages / pictures / animations in order,
// PlayFinaleAnimation timing ((GameSpeed + 3) x frame delay, TimeInHundredths), RecolourOverlandTiles tables.
// Run: node --test game/test/combat/ov18.test.mjs   (all X routines are stubbed; no browser needed)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const AREAS = path.join(ROOT, 'game/areas');
const core = await import(pathToFileURL(path.join(AREAS, 'combat_core.js')).href);
const ov18 = await import(pathToFileURL(path.join(AREAS, 'combat_ov18.js')).href);

function dsImage() {
  const exe = readFileSync(path.join(ROOT, 'decode/bin/START.unpacked.exe'));
  const header = exe.readUInt16LE(8) * 16;                               // DS 0C7C = header + 0xC7C0
  const ds = new Uint8Array(0x8760);
  ds.set(exe.subarray(header + 0xC7C0, header + 0xC7C0 + 0x8760));
  return ds;
}

// Stub environment: records every call as [name, ...args]; TimeInHundredths advances `step` per call.
function setup({ gameSpeed = 9, partyCount = 3, step = 50, delays = [0, 1, 1] } = {}) {
  const calls = [];
  let clock = 0;
  const rec = (name, ret) => (...a) => { calls.push([name, ...a]); return typeof ret === 'function' ? ret(...a) : ret; };
  const ext = {
    ClearTextRectangle: rec('ClearTextRectangle'), DrawText: rec('DrawText'), RedrawCurrentMode: rec('RedrawCurrentMode'),
    LoadPicture: rec('LoadPicture', (name, id) => ({ pic: `${name}:${id}` })),
    DrawPicture: rec('DrawPicture'), FlushViewDirtyLines: rec('FlushViewDirtyLines'),
    LoadAnimation: rec('LoadAnimation', (name, id, flags, anim) => {
      anim.count = delays.length - 1; anim.cur = 1;
      anim.delay = delays.slice(); anim.pic = delays.map((_, k) => `anim${id}.${k}`);
    }),
    DrawPictureScreenOrView: rec('DrawPictureScreenOrView'), FreeAnimation: rec('FreeAnimation'),
    MessageDelay: rec('MessageDelay'), RecolorPicture: rec('RecolorPicture'), DrawOverlandWindow: rec('DrawOverlandWindow'),
    TimeInHundredths: () => (clock += step), yieldShort: () => {},
  };
  const ecl6B00 = new Uint16Array(0x400);
  ecl6B00[0x67C >> 1] = partyCount;                                      // ECL 6E3Eh party member count
  const g = { ds: dsImage(), GameSpeed: gameSpeed, DataSet: 1, game_Mode: 4, ecl_Mem6B00: ecl6B00,
    g_4A20: 'SCREEN', TileSetLo: 'LO', TileSetHi: 'HI' };
  core.bindCombat({ g, ext });
  return { calls, g };
}

test('DragonFinale: three text pages in order, pictures and animations, mode 7 restored', async () => {
  const { calls, g } = setup();
  await ov18.DragonFinale();
  // text pages: split DrawText calls at each ClearTextRectangle(1,17,38,22)
  const pages = [];
  for (const c of calls) {
    if (c[0] === 'ClearTextRectangle') { assert.deepEqual(c.slice(1), [1, 17, 38, 22]); pages.push([]); }
    if (c[0] === 'DrawText') { assert.equal(c[1], 1); assert.equal(c[3], 10); pages.at(-1).push([c[2], c[4]]); }
  }
  assert.deepEqual(pages, [
    [[17, 'Mortally wounded, the dragon roars!'], [18, 'The spirit of Tyranthraxus flares up'], [19, 'from the dragon\'s body.']],
    [[17, '"Fools, you have but slain the body'], [18, 'I possessed.  I cannot be defeated!"'],
      [19, 'With the power of the pool of radiance'], [20, 'which I moved here, to my lair,'],
      [21, 'I will still rule, by possessing one'], [22, 'of you!"']],
    [[17, '"No Lord Bane!  I can still rule here!'], [18, 'I have not failed.  Do not call me back'],
      [19, 'through the pool!"'], [20, 'Noooo...']],
  ]);
  // order of the big steps
  const seq = calls.filter((c) => ['ClearTextRectangle', 'LoadPicture', 'LoadAnimation', 'MessageDelay', 'RedrawCurrentMode'].includes(c[0]))
    .map((c) => c[0] === 'LoadPicture' ? `pic${c[2]}` : c[0] === 'LoadAnimation' ? `anim${c[2]}` : c[0]);
  assert.deepEqual(seq, ['ClearTextRectangle', 'RedrawCurrentMode', 'pic1', 'anim2', 'pic3', 'pic4', 'pic5',
    'ClearTextRectangle', 'anim7', 'ClearTextRectangle', 'anim8', 'MessageDelay', 'MessageDelay', 'MessageDelay',
    'RedrawCurrentMode']);
  assert.ok(calls.filter((c) => c[0] === 'LoadPicture').every((c) => c[1] === 'FINAL1'));
  assert.ok(calls.filter((c) => c[0] === 'LoadAnimation').every((c) => c[1] === 'FINAL' && c[3] === 2));
  const pics = calls.filter((c) => c[0] === 'DrawPicture' && typeof c[5] === 'object').map((c) => [c[5].pic, c[1], c[2], c[6]]);
  assert.deepEqual(pics, [['FINAL1:1', 0, 0, 'SCREEN'], ['FINAL1:3', 0, 0, 'SCREEN'], ['FINAL1:4', 0, 11, 'SCREEN'],
    ['FINAL1:5', 13, 9, 'SCREEN']]);                                     // 3 members: record 6 not drawn
  assert.equal(g.game_Mode, 4);
  assert.equal(g.SavedMode, 4);
});

test('DragonFinale: cycle count (5*(10-GameSpeed)) shr 1 per animation (2, 7), 1 for animation 8', async () => {
  const { calls } = setup({ gameSpeed: 9, delays: [0, 1] });            // one frame per loop
  await ov18.DragonFinale();
  // with 1 frame, each completed loop frees nothing; count FreeAnimation and frame draws per animation
  const frees = calls.filter((c) => c[0] === 'FreeAnimation').length;
  assert.equal(frees, 3);
  // GameSpeed 9 -> (5*1) shr 1 = 2 loops; each loop needs one elapsed check over (9+3)*1 = 12 hundredths;
  // clock step 50 -> every iteration advances: 2 + 2 + 1 = 5 frame draws
  assert.equal(calls.filter((c) => c[0] === 'DrawPictureScreenOrView').length, 5);
});

test('PlayFinaleAnimation: a frame advances only when elapsed > (GameSpeed + 3) x delay', async () => {
  const { calls } = setup({ gameSpeed: 1, step: 3, delays: [0, 2, 2] });   // threshold 8, clock +3 per call
  await ov18.PlayFinaleAnimation(3, 5, 2, 1);
  const draws = calls.filter((c) => c[0] === 'DrawPictureScreenOrView');
  // t0 = 3; frame 1 advances at t = 12 (9 > 8): 3 draws; frame 2 at t = 21: 3 draws
  assert.deepEqual(draws.map((c) => c[4]), ['anim2.1', 'anim2.1', 'anim2.1', 'anim2.2', 'anim2.2', 'anim2.2']);
  assert.deepEqual(draws[0].slice(1, 4), [3, 5, 1]);
  const first = calls.find((c) => c[0] === 'DrawPicture');
  assert.deepEqual(first.slice(1, 5), [2, 4, 0, 0]);                    // (col-1, row-1, 0, 0)
  assert.equal(first[5], 'anim2.1');
});

test('RecolourOverlandTiles: 11 + 18 tiles, colour tables from DS, Hi/Lo set by bit 7', async () => {
  const { calls } = setup();
  await ov18.RecolourOverlandTiles(0);
  const rc = calls.filter((c) => c[0] === 'RecolorPicture');
  assert.equal(rc.length, 29);
  assert.deepEqual(rc[0][1], [...Array(16).keys()]);                     // g_091D identity "from"
  assert.equal(rc[0][2][0], 1); assert.equal(rc[0][2][7], 2);            // g_092D: 0->1, 7->2
  assert.equal(rc[11][2][0], 0); assert.equal(rc[11][2][7], 2);          // g_093D: 7->2
  assert.deepEqual(rc[0].slice(3), [0x65, 0, 'LO']);
  assert.deepEqual(rc[8].slice(3), [0x60, 0, 'HI']);                     // E0h -> tile 60h of TileSetHi
  assert.ok(!calls.some((c) => c[0] === 'DrawOverlandWindow'));

  const a = setup();
  await ov18.RecolourOverlandTiles(1);
  const win = a.calls.filter((c) => c[0] === 'DrawOverlandWindow').map((c) => [c[1], c[2]]);
  assert.deepEqual(win, [[0x11, 0x0F], [0x11, 0x0F], [0x11, 0x0F], [0x11, 0x0F], [0x13, 0x14], [0x13, 0x14],
    [0x13, 0x14], [0x17, 0x19], [0x17, 0x19], [0x17, 0x19], [0x17, 0x19]]);
  assert.equal(a.calls.filter((c) => c[0] === 'RecolorPicture').length, 29 * 10);
  assert.equal(a.calls.filter((c) => c[0] === 'RecolorPicture' && c[4] === 1).length, 29 * 9);
  assert.equal(a.calls.filter((c) => c[0] === 'MessageDelay').length, 2);
});
