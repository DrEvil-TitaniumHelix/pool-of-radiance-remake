// game/test/res00ba/u.test.mjs — node:test for game/areas/res_00ba_u.js (resident 00BA part U, 00BA:0000..148B).
// Real data: DS image from decode/bin/START.unpacked.exe, ITEMS table (POOLRAD/ITEMS, Seek(2), 2048 bytes -> DS:5582),
// shipped party CHRDATA<n>.SAV/.ITM/.SPC. Key acceptance: Thrender Grone = acceptance/ref/REF-CHARACTER.png
// (AC 1, THAC0 19, HP 11, Damage 1d6+2, Encumbrance 538, Movement 9).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { newChar, newItem, newEffect, rdW, pstr } from '../../engine/ecl.js';
import { text } from '../../engine/text.js';
import { state as pic } from '../../engine/pictures.js';
import { bindRes00ba } from '../../areas/res_00ba_core.js';
import * as U from '../../areas/res_00ba_u.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const POR = process.env.POR_DATA ?? path.resolve(ROOT, '../re-targets/goldbox/por/POOLRAD');

function loadDs() {
  const exe = fs.readFileSync(path.join(ROOT, 'decode/bin/START.unpacked.exe'));
  const hdr = exe.readUInt16LE(8) * 16;
  const ds = new Uint8Array(0x8760);
  ds.set(exe.subarray(hdr + 0xC7C0, Math.min(exe.length, hdr + 0xC7C0 + 0x8760)));
  const items = fs.readFileSync(path.join(POR, 'ITEMS'));
  ds.set(items.subarray(2, 2 + 2048), 0x5582);                      // ov11_002D: Seek(2), BlockRead(DS:5582, 810h)
  return ds;
}
const DS = loadDs();

function loadChar(name) {                                           // ReadCharacter ov17_0AEC (SAVES.md §1)
  const base = path.join(POR, 'SAVE', name);
  const c = newChar();
  c.b.set(fs.readFileSync(base + '.SAV').subarray(0, 0x11D));
  const link = (file, size, mk) => {
    if (!fs.existsSync(file)) return null;
    const d = fs.readFileSync(file); let head = null, tail = null;
    for (let o = 0; o + size <= d.length; o += size) {
      const r = mk(); r.b.set(d.subarray(o, o + size));
      if (tail) tail.next = r; else head = r; tail = r;
    }
    return head;
  };
  c.items = link(base + '.ITM', 0x3F, newItem);
  c.effects = link(base + '.SPC', 9, newEffect);
  return c;
}

function setup(gx = {}) {
  const g = { ds: DS, PartyHead: null, SelectedChar: null, game_Mode: 0, ReadiedWeight: 0, ...gx };
  bindRes00ba({ g });
  return g;
}

const mkItem = (type, f = {}) => { const it = newItem(); it.b[0x2E] = type; for (const [o, v] of Object.entries(f)) it.b[Number(o)] = v; return it; };
const chainOf = (list) => { for (let i = 0; i < list.length; i++) list[i].next = list[i + 1] ?? null; return list[0] ?? null; };
const effect = (id) => { const e = newEffect(); e.b[0] = id; return e; };

test('RecalcCharacter: Thrender Grone = REF-CHARACTER (AC 1, THAC0 19, HP 11, 1d6+2, Enc 538, Move 9)', () => {
  const c = loadChar('CHRDATA1');
  assert.equal(pstr(c.b, 0), 'THRENDER GRONE');
  setup({ PartyHead: c, SelectedChar: c });
  // wipe every derived field first so the values must come from RecalcCharacter
  for (const o of [0x6B, 0xC7, 0x100, 0x101, 0x102, 0x103, 0x110, 0x111, 0x112, 0x115, 0x116, 0x117, 0x118, 0x119, 0x11A, 0x11C]) c.b[o] = 0xEE;
  U.RecalcCharacter(c);
  assert.equal(60 - c.b[0x111], 1, 'AC');
  assert.equal(60 - c.b[0x110], 19, 'THAC0');
  assert.equal(c.b[0x11B], 11, 'HP');
  assert.equal(`${c.b[0x115]}d${c.b[0x117]}+${c.b[0x119]}`, '1d6+2', 'Damage');
  assert.equal(rdW(c.b, 0x102), 538, 'Encumbrance');
  assert.equal(c.b[0x11C], 9, 'Movement');
  assert.equal(c.b[0xC7], 2); assert.equal(c.b[0x100], 1); assert.equal(c.b[0x6B], 1);
  assert.equal(c.readied[0], c.items); assert.equal(c.readied[2], c.items.next);
  assert.equal(c.b[0x112], 56 - 2, 'ac_rear = armour only - 2');
});

test('RecalcCharacter reproduces the derived fields stored in every shipped CHRDAT save', () => {
  const dir = path.join(POR, 'SAVE');
  const names = fs.readdirSync(dir).filter((f) => /^CHRDAT[A-J]\d\.SAV$/i.test(f)).map((f) => f.slice(0, -4));
  assert.ok(names.length >= 6);
  for (const n of names) {
    const c = loadChar(n);
    const want = Uint8Array.from(c.b);
    setup({ PartyHead: c, SelectedChar: c });
    U.RecalcCharacter(c);
    for (const o of [0x6B, 0xC7, 0x100, 0x101, 0x102, 0x103, 0x110, 0x111, 0x112, 0x115, 0x116, 0x117, 0x118, 0x119, 0x11A, 0x11C])
      assert.equal(c.b[o], want[o], `${n} +${o.toString(16)}`);
  }
});

test('BuildItemName: Thrender items, Yes/No column, count prefix, Detect Magic star, plurals', () => {
  const c = loadChar('CHRDATA1');
  const g = setup({ PartyHead: c });
  const flail = c.items, mail = c.items.next;
  U.BuildItemName(c, flail, 0, 0, false, false);
  assert.equal(pstr(flail.b, 0), 'Flail ');
  U.BuildItemName(c, mail, 0, 0, 1, 0);
  assert.equal(pstr(mail.b, 0), ' Yes  Banded Mail ');
  mail.b[0x34] = 0; U.BuildItemName(c, mail, 0, 0, true, false);
  assert.equal(pstr(mail.b, 0), ' No   Banded Mail ');
  // Long Sword +1: words shown in the order word[3], word[2], word[1]; hidden bit (3-k) hides word k
  const ls = mkItem(0x31, { 0x2F: 0x2F, 0x30: 0x30, 0x31: 0x31, 0x32: 1 });
  U.BuildItemName(c, ls, 0, 0, false, false);
  const wordStr = (w) => { let s = ''; for (let i = 1; i <= DS[0x10A7 + w * 21]; i++) s += String.fromCharCode(DS[0x10A7 + w * 21 + i]); return s; };
  assert.equal(pstr(ls.b, 0), `${wordStr(0x31)} ${wordStr(0x30)} ${wordStr(0x2F)} `);
  ls.b[0x35] = 4;                                                   // hide word 1 (bit 3-1 = 2 -> value 4)
  U.BuildItemName(c, ls, 0, 0, false, false);
  assert.equal(pstr(ls.b, 0), `${wordStr(0x31)} ${wordStr(0x30)} `);
  // Detect Magic (effect 5) on any party member: '* ' prefix for plus > 0
  const other = newChar(); other.effects = effect(5); c.next = other;
  ls.b[0x35] = 0; U.BuildItemName(c, ls, 0, 0, false, false);
  assert.ok(pstr(ls.b, 0).startsWith('* '));
  c.next = null; g.PartyHead = c;
  // stack of 20 arrows (type 49h, word[3] = arrow word): count prefix, plural on the first eligible word
  const arrows = mkItem(0x49, { 0x31: 0x10, 0x39: 20 });
  U.BuildItemName(c, arrows, 0, 0, false, false);
  assert.equal(pstr(arrows.b, 0), `20 ${wordStr(0x10)}s `);
  // name truncated to string[40]
  const long = mkItem(0x31, { 0x2F: 0x2F, 0x30: 0x30, 0x31: 0x31, 0x39: 200 });
  U.BuildItemName(c, long, 0, 0, true, false);
  assert.ok(pstr(long.b, 0).length <= 40);
});

test('ByteToStr / WordToStr / LongToStr', () => {
  assert.equal(U.ByteToStr(0), '0'); assert.equal(U.ByteToStr(255), '255'); assert.equal(U.ByteToStr(256 + 7), '7');
  assert.equal(U.WordToStr(65535), '65535'); assert.equal(U.WordToStr(70000), String(70000 & 0xFFFF));
  assert.equal(U.LongToStr(-5), '-5'); assert.equal(U.LongToStr(123456789), '123456789');
});

test('DEX tables, STR index / to-hit / damage / weight allowance', () => {
  const c = newChar(); c.b[0xAA] = 1;
  const dex = (d) => { c.b[0x13] = d; return [U.DexDefenseAdj(c), U.DexMissileAdj(c)]; };
  assert.deepEqual(dex(0), [0, -4]); assert.deepEqual(dex(3), [-4, -3]); assert.deepEqual(dex(6), [-1, 0]);
  assert.deepEqual(dex(10), [0, 0]); assert.deepEqual(dex(15), [1, 0]); assert.deepEqual(dex(16), [2, 1]);
  assert.deepEqual(dex(17), [3, 2]); assert.deepEqual(dex(18), [4, 3]); assert.deepEqual(dex(20), [4, 3]);
  assert.deepEqual(dex(22), [5, 4]); assert.deepEqual(dex(25), [6, 5]); assert.deepEqual(dex(26), [0, 0]);
  const st = (s, e = 0) => { c.b[0x10] = s; c.b[0x16] = e; return [U.StrengthIndex(c), U.StrToHitAdj(c), U.StrDamageAdj(c), U.StrWeightAllowance(c)]; };
  assert.deepEqual(st(3), [3, -3, -1, -350]);
  assert.deepEqual(st(5), [5, -2, -1, -250]);
  assert.deepEqual(st(7), [7, -1, 0, -150]);
  assert.deepEqual(st(10), [10, 0, 0, 0]);
  assert.deepEqual(st(13), [13, 0, 0, 100]);
  assert.deepEqual(st(16), [16, 0, 1, 350]);
  assert.deepEqual(st(17), [17, 1, 1, 500]);                         // Thrender
  assert.deepEqual(st(18), [18, 1, 2, 750]);
  assert.deepEqual(st(18, 50), [19, 1, 3, 1000]);
  assert.deepEqual(st(18, 75), [20, 2, 3, 1250]);
  assert.deepEqual(st(18, 90), [21, 2, 4, 1500]);
  assert.deepEqual(st(18, 99), [22, 2, 5, 2000]);
  assert.deepEqual(st(18, 100), [23, 3, 6, 3000]);
  assert.deepEqual(st(19), [24, 3, 7, 4000]);
  assert.deepEqual(st(22), [27, 4, 10, 7500]);
  assert.deepEqual(st(25), [30, 7, 14, 15000]);
  c.b[0xAA] = 0; assert.deepEqual(st(18, 100), [23, 0, 0, 3000]);   // unk_AA = 0: no STR combat bonuses
});

test('RecalcWeaponStats / AddItemAC / ArmourMoveLimit / EncumbranceMoveLimit details', () => {
  setup();
  const c = newChar();
  c.b[0x10] = 10; c.b[0x13] = 10; c.b[0xAA] = 1; c.b[0x2D] = 40; c.b[0xA9] = 50; c.b[0x72] = 12; c.b[0x2E] = 7;
  // no weapon: STR on the natural attack only, base damage copied
  c.b[0x10] = 18; c.b[0x16] = 100; c.b[0xA3] = 1; c.b[0xA5] = 2;
  U.RecalcCharacter(c);
  assert.equal(c.b[0x110], 43); assert.equal(c.b[0x119], 6); assert.equal(c.b[0x115], 1); assert.equal(c.b[0x117], 2);
  assert.equal(c.b[0x111], 50); assert.equal(c.b[0x11C], 12);
  // magic plate (+1, weight 450): limit 6 -> 9; magic armour cancels the ring of protection part
  const plate = mkItem(0x3A, { 0x34: 1, 0x32: 1 }); plate.b[0x37] = 450 & 0xFF; plate.b[0x38] = 450 >> 8;
  const isArmour = DS[0x5582 + 0x3A * 16] === 2 && DS[0x5582 + 0x3A * 16 + 6] > 0x80;
  assert.ok(isArmour, 'ITEMS 3Ah is body armour');
  c.items = chainOf([plate]); c.b[0x10] = 10;
  U.RecalcCharacter(c);
  assert.equal(c.b[0x11C], 9);
  assert.equal(c.b[0x111], (DS[0x5582 + 0x3A * 16 + 6] & 0x7F) + 1);
  // AddItemAC directly: ring best-of, protection sum + plus2, shield
  const part = [0, 0, 0, 0, 0], mag = { v: false };
  const ringT = [...Array(128).keys()].find((t) => DS[0x5582 + t * 16] === 9 && DS[0x5582 + t * 16 + 6] === 0x80);
  if (ringT !== undefined) {
    U.AddItemAC(c, mkItem(ringT, { 0x32: 1 }), part, mag); U.AddItemAC(c, mkItem(ringT, { 0x32: 2 }), part, mag);
    U.AddItemAC(c, mkItem(ringT, { 0x32: 1 }), part, mag);
    assert.equal(part[3], 2);
  }
  // EncumbranceMoveLimit bands (STR 10 allowance 0)
  const mv = (enc, move = 12) => { c.b[0x102] = enc & 0xFF; c.b[0x103] = enc >> 8; c.b[0x11C] = move; U.EncumbranceMoveLimit(c); return c.b[0x11C]; };
  assert.equal(mv(512), 12); assert.equal(mv(513), 9); assert.equal(mv(768), 9); assert.equal(mv(1024), 6); assert.equal(mv(1025), 3);
  assert.equal(mv(600, 6), 6);
  assert.equal(mv(40000), 12, 'quirk: low word of the difference negative -> 0 -> no limit');
});

test('IsHelpless (DS:286C..286F), ForgetMemorizedSpell', () => {
  const g = setup();
  assert.deepEqual([...DS.subarray(0x286C, 0x2870)], [0x33, 0x34, 0x35, 0x1F]);
  const c = newChar();
  assert.equal(U.IsHelpless(c), false);
  c.effects = chainOf([effect(0x10), effect(0x1F)]);
  assert.equal(U.IsHelpless(c), true);
  g.SelectedChar = c; c.b[0x17 + 2] = 5; c.b[0x17 + 7] = 5; c.b[0x17 + 20] = 9;
  U.ForgetMemorizedSpell(5);
  assert.equal(c.b[0x19], 0); assert.equal(c.b[0x17 + 7], 5);
  U.ForgetMemorizedSpell(9); assert.equal(c.b[0x17 + 20], 0);
});

// ---- drawing: solid 8x8 font, cell colour = top-left pixel of the cell ----
function screen() {
  text.font = new Uint8Array(256 * 8).fill(0xFF); text.TextOutputActive = 0;
  pic.display = { pix: new Uint8Array(320 * 200), touch() {} };
  return (col, row) => pic.display.pix[row * 8 * 320 + col * 8];
}

test('DrawAC / DrawHP colours and widths', () => {
  setup();
  const cell = screen();
  const c = newChar(); c.b[0x111] = 59; c.b[0x11B] = 5; c.b[0x32] = 11;
  U.DrawAC(c, 10, 3);
  assert.equal(cell(10, 3), 0x0A); assert.equal(cell(11, 3), 0);
  c.b[0x111] = 62; U.DrawAC(c, 10, 4);                                // AC -2: "-2"
  assert.equal(cell(10, 4), 0x0A); assert.equal(cell(11, 4), 0x0A); assert.equal(cell(12, 4), 0);
  U.DrawHP(c, 5, 6, false); assert.equal(cell(5, 6), 0x0E);           // hurt: yellow
  c.b[0x11B] = 11; U.DrawHP(c, 5, 7, 0); assert.equal(cell(5, 7), 0x0A); assert.equal(cell(6, 7), 0x0A); assert.equal(cell(7, 7), 0);
  U.DrawHP(c, 5, 8, true); assert.equal(cell(5, 8), 0x0D);
});

test('DrawPartyRoster: header, selected name in white, AC/HP right-aligned, line after cleared', () => {
  const c = loadChar('CHRDATA1');
  setup({ PartyHead: c, game_Mode: 0 });
  U.RecalcCharacter(c);
  const cell = screen();
  pic.display.pix.fill(7);
  U.DrawPartyRoster(c);
  assert.equal(cell(1, 2), 0x0F); assert.equal(cell(0x21, 2), 0x0F);
  assert.equal(cell(1, 4), 0x0F);                                     // selected: DrawText white
  assert.equal(cell(0x20 + 2, 4), 0x0A); assert.equal(cell(0x21, 4), 0); // AC 1: dx 2
  assert.equal(cell(0x24 + 1, 4), 0x0A); assert.equal(cell(0x24, 4), 0); // HP 11: dx 1
  assert.equal(cell(1, 5), 0); assert.equal(cell(0x26, 5), 0);         // line after the last member cleared
});

test('DrawCharacterSummary: Hitpoints row 3, AC row 5, weapon rows 7.., status line', async () => {
  const c = loadChar('CHRDATA1');
  setup({ PartyHead: c, game_Mode: 5 });
  U.RecalcCharacter(c);
  const cell = screen();
  await U.DrawCharacterSummary(c);
  assert.equal(cell(0x17, 3), 0x0A); assert.equal(cell(0x21, 3), 0x0A);
  assert.equal(cell(0x17, 5), 0x0A); assert.equal(cell(0x1A, 5), 0x0A);
  assert.equal(pstr(c.items.b, 0), 'Flail ');
  assert.equal(cell(0x17, 7), 0x0A);
  c.b[0x10D] = 0; c.b[0x10C] = 6;                                     // inactive: StatusName[status] in white
  await U.DrawCharacterSummary(c);
  assert.equal(cell(0x17, text.row + 2), 0x0F);                       // y := text_Row + 1; drawn at y + 1
});
