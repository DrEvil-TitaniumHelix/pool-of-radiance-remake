// game/areas/party_ov20.js — PARTY ov20 (seg 8400): game clock, rest clock, resting (healing, memorising, scribing,
// rest encounters). Source: decode/pseudo/party_parts/ov20.pas.md (= PARTY.pas.md ## ov20), asm decode/listings/ov20.lst.
// Screens: PARTY-ov20-01..06 (SCREENS_INDEX CM-* rest rows). Conventions: party_core.js.
//
// Globals (party_names.json): ClockLimits DS:363A (constant words 10,10,6,24,30,12,256 read from the DS image),
// EffectsPending DS:471E (72 bytes; the code uses [1..8] at DS:471D+i -> g.EffectsPending[i - 1]),
// RestClock DS:6DC2 (7 words, a JS array shared with MAGIC ov15), StudyTimer DS:6DCF (byte [i] at DS:6DCF+i, i = 1..8 ->
// g.StudyTimer[i]), HealCounter DS:6DD8, RestActive DS:6DDA, RestEncCounter DS:49FB.
// ECL memory: game clock = ecl_Mem4900 words 0C6h..0CCh (VM 49C6..49CC); party member count = ecl_Mem6B00^.w[$67C]
// (byte offset 67Ch -> word index 33Eh, VM 6E3E); rest encounter interval / chance = w[$5A4] / w[$5A6] (VM 6DD2 / 6DD3).
// Effects: e.b[0] type, word e.b[1..2] duration, e.next (+5 far pointer).

import { X, g, ds, dsW, rdW, wrW, byte, word, shortint } from './party_core.js';
import { dev } from '../engine/dev.js';

const clockLimit = (i) => dsW(0x363A + 2 * i);                   // ClockLimits{g_363A}[i]
const mem49 = () => g.ecl_Mem4900;
const eclW6B = (byteOfs) => (g.ecl_Mem6B00 ? g.ecl_Mem6B00[byteOfs >> 1] : 0);
const dur = (e) => rdW(e.b, 1);                                  // effect +1 duration (word)

function ensureState() {
  // the shared state may still hold the plain DS word: create the arrays once, never replace another area's array
  if (!(g.EffectsPending instanceof Uint8Array)) g.EffectsPending = new Uint8Array(0x48);
  if (!Array.isArray(g.RestClock)) g.RestClock = [0, 0, 0, 0, 0, 0, 0];      // same rule as magic.js / magic_ov15.js
  if (!(g.StudyTimer instanceof Uint8Array)) g.StudyTimer = new Uint8Array(9);
  if (typeof g.HealCounter !== 'number') g.HealCounter = 0;
  if (typeof g.RestEncCounter !== 'number') g.RestEncCounter = 0;
}

// 8400:0000 TickEffects(count, unit: Byte)
export async function TickEffects(count, unit) {
  ensureState();
  const pend = g.EffectsPending;
  if (g.game_Mode === 2) {                                       // 8400:0006
    let any = false, i = 1;                                      // 8400:0020
    do {
      if (pend[i - 1] !== 0) any = true;                         // 8400:002f  byte DS:471D+i
      i = byte(i + 1);                                           // 8400:003a
    } while (!any && !(i > eclW6B(0x67C)));                      // 8400:003d / 0048  party member count (JBE loop)
    if (!any) return;                                            // 8400:0053
  } else pend.fill(1);                                           // 8400:0019  FillChar(EffectsPending, $48, 1)
  let minutes = count & 0xFF;                                    // 8400:005c  word
  let u = shortint(unit);                                        // 8400:0064  ShortInt
  while (u > 1) {                                                // 8400:006a  JLE = signed
    minutes = word(clockLimit(u - 1) * minutes);                 // 8400:007a  16-bit MUL
    u = shortint(u - 1);                                         // 8400:0084
  }
  while (minutes > 0) {                                          // 8400:008e
    const chunk = minutes > 10 ? 10 : minutes & 0xFF;            // 8400:0097
    let i = 1, c = g.PartyHead;                                  // 8400:00a9
    while (c !== null && c !== undefined) {                      // 8400:00ba
      if (pend[i - 1] !== 0) {                                   // 8400:00cc
        pend[i - 1] = 0;                                         // 8400:00dd
        let e = c.effects, last = c.effects, prev = c.effects;   // 8400:00e2 / 00f4 / 0106
        // 8400:0118 saved := prev^.next — quirk: read even when the list is nil (value unused before it is rewritten)
        if (c.effects !== null)                                  // 8400:0129
          while (last.next !== null) last = last.next;           // 8400:0137  last element at entry
        let done = false;                                        // 8400:0157
        while (e !== null && !done) {                            // 8400:015b / 0166
          if (e === last) done = true;                           // 8400:016f
          if (dur(e) === 0) e = e.next;                          // 8400:0183 / 018d  permanent effect
          else if (chunk < dur(e)) {                             // 8400:01a1  JAE = unsigned
            wrW(e.b, 1, dur(e) - chunk);                         // 8400:01af
            pend[i - 1] = 1;                                     // 8400:01bb
            e = e.next;                                          // 8400:01c7
          } else {
            const saved = e.next;                                // 8400:01da
            await X.RemoveEffect(c, e.b[0], e);                  // 8400:01fe  pushes c, type, e
            if (prev === c.effects) e = c.effects;               // 8400:0203  quirk: restart at the head
            else e = saved;                                      // 8400:022d
          }
          prev = c.effects;                                      // 8400:0239
          while (prev !== null && prev !== e && prev.next !== e) // 8400:024b / 0253 / 0263
            prev = prev.next;                                    // 8400:0278
        }
        while (e !== null) {                                     // 8400:028e  rest of the list
          if (dur(e) > 0) pend[i - 1] = 1;                       // 8400:0296
          e = e.next;                                            // 8400:02ac
        }
      }
      i = byte(i + 1);                                           // 8400:02bf
      c = c.next;                                                // 8400:02c2  +104h
    }
    if (minutes > 10) minutes -= 10; else minutes = 0;           // 8400:02d8
  }
}

// 8400:02F2 CarryClock(var clk: array[0..6] of Word) — one carry pass; years never wrap (the party ages)
export function CarryClock(clk) {
  for (let i = 0; i <= 6; i++)                                   // 8400:02f8
    if (word(clk[i]) >= clockLimit(i)) {                         // 8400:0309 / 031b  JB = unsigned
      if (i === 6) {                                             // 8400:031f
        for (let c = g.PartyHead; c; c = c.next) wrW(c.b, 0x30, rdW(c.b, 0x30) + 1);   // 8400:0363 / 037b  age +30h (word)
      } else {
        clk[i + 1] = word(clk[i + 1] + 1);                       // 8400:0332
        clk[i] = word(clk[i] - clockLimit(i));                   // 8400:033d .. 035e
      }
    }
}

// 8400:03A3 NormalizeRestClock
export function NormalizeRestClock() {
  ensureState();
  const rc = g.RestClock;
  CarryClock(rc);                                                // 8400:03ac
  if (rc[5] > 0) {                                               // 8400:03af  months
    rc[4] = word(rc[4] + word(clockLimit(4) * rc[5]));           // 8400:03b6  days += 30 * months
    rc[5] = 0;                                                   // 8400:03c1
    if (rc[4] > 99) rc[4] = 99;                                  // 8400:03c6  JBE = unsigned
  }
}

// 8400:03D5 AdvanceClock(count, unit: Byte) — stub ov20 e1
export async function AdvanceClock(count, unit) {
  count &= 0xFF; unit &= 0xFF;
  const m = mem49();
  const clk = [];
  for (let i = 0; i <= 6; i++) clk[i] = m ? m[0xC6 + i] : 0;     // 8400:03db .. 0407  game clock VM 49C6..49CC
  for (let k = 1; k <= count; k++) {                             // 8400:0409 / 0411  skipped when count = 0
    clk[unit] = word(clk[unit] + 1);                             // 8400:0426
    CarryClock(clk);                                             // 8400:042f
  }
  if (m) for (let i = 0; i <= 6; i++) m[0xC6 + i] = clk[i];      // 8400:043a .. 0466
  await TickEffects(count, unit);                                // 8400:0471
}

// 8400:047A DecRestClock(amount, unit: Byte)
export function DecRestClock(amount, unit) {
  ensureState();
  const rc = g.RestClock;
  amount &= 0xFF; unit &= 0xFF;
  if (rc[4] === 0 && rc[3] === 0 && rc[2] === 0 && rc[1] === 0) return;   // 8400:0480 .. 049c
  while (amount > rc[unit]) {                                    // 8400:049f / 04b0  JA = unsigned
    let k = unit + 1;                                            // 8400:04b7
    while (rc[k] === 0 && k < 5) k++;                            // 8400:04bf / 04ce  JGE = signed
    if (k === 5) {                                               // 8400:04de
      rc.fill(0);                                                // 8400:04f0  FillChar(RestClock, $0E, 0)
      amount = 0;                                                // 8400:04f5
    } else if (k >= unit + 1) {                                  // 8400:04fb  JL = signed
      for (let j = k; j >= unit + 1; j--) {                      // 8400:050b
        rc[j] = word(rc[j] - 1);                                 // 8400:051b
        rc[j - 1] = word(rc[j - 1] + clockLimit(j - 1));         // 8400:0529 / 0537
      }
    }
  }
  rc[unit] = word(rc[unit] - amount);                            // 8400:0546
  NormalizeRestClock();                                          // 8400:055a
}

// 8400:0565 TwoDigits(v: Byte): String
export function TwoDigits(v) {
  v &= 0xFF;
  let s = X.ByteToStr(v);                                        // 8400:0576
  if (v < 10) s = '0' + s;                                       // 8400:0589 / 059a  CS:0563 '0'
  return s.substr(0, 2);                                         // 8400:05ca  Copy(s, 1, 2)
}

// 8400:05F0 DrawRestTime(sel: ShortInt) — row 17 "Rest Time: DD:HH:MM", the edited field white
export function DrawRestTime(sel) {
  ensureState();
  const rc = g.RestClock;
  const colour = [10, 10, 10, 10, 10, 10, 10];                   // 8400:05f7 .. 0611
  colour[shortint(sel)] = 15;                                    // 8400:061b
  X.DrawText(1, 17, 10, 'Rest Time:');                           // 8400:0638
  let col = 11;                                                  // 8400:063d
  for (let i = 4; i >= 3; i--) {                                 // 8400:0641
    X.DrawText(col + 1, 17, colour[i], TwoDigits(rc[i] & 0xFF)); // 8400:0677  Lo(RestClock[i])
    X.DrawText(col + 3, 17, 10, ':');                            // 8400:069a  CS:05EE
    col += 3;                                                    // 8400:069f
  }
  X.DrawText(col + 1, 17, colour[2], TwoDigits(byte(10 * rc[2] + rc[1])));   // 8400:06cd
}

// 8400:0721 RestMenu: Boolean — the rest-time editor; true = start resting
export async function RestMenu() {
  ensureState();
  const rc = g.RestClock;
  let start = false;                                             // 8400:0727
  let sel = 2;                                                   // 8400:072b  minutes
  let key;
  do {
    DrawRestTime(sel);                                           // 8400:0734
    dev.screenSoon('CM-11');
    const r = await X.HorizontalMenu('', 'Rest   daYs Hours Mins   Inc Dec   Exit', 0x0D, 0x0A, 0x0F, true, false);   // 8400:0769
    key = r.key;
    if (r.ext) {                                                 // 8400:0771
      if (key === 'H') key = 'I';                                // 8400:077e  cursor up = Inc
      else if (key === 'P') key = 'D';                           // 8400:0788  cursor down = Dec
      else if (key === 'K') { sel++; if (sel > 4) sel = 2; key = 'X'; }   // 8400:0792  cursor left
      else if (key === 'M') { sel--; if (sel < 2) sel = 4; key = 'X'; }   // 8400:07a9  cursor right
      else key = 'X';                                            // 8400:07bc
    }
    if (key === '\r') key = 'R';                                 // 8400:07c0  quirk: Enter = Rest whatever is highlighted
    switch (key) {
      case 'R': start = true; break;                             // 8400:07d1
      case 'Y': sel = 4; break;                                  // 8400:07db
      case 'H': sel = 3; break;                                  // 8400:07e5
      case 'M': sel = 2; break;                                  // 8400:07ef
      case 'I':                                                  // 8400:07f5
        if (sel === 2) rc[1] = word(rc[1] + 5);                  // 8400:07ff
        else rc[sel] = word(rc[sel] + 1);                        // 8400:080e
        NormalizeRestClock();                                    // 8400:0813
        break;
      case 'D':                                                  // 8400:0818
        if (sel === 2) DecRestClock(5, 1);                       // 8400:0829
        else DecRestClock(1, sel);                               // 8400:0836
        NormalizeRestClock();                                    // 8400:083a
        break;
    }
  } while (!(key === '\0' || key === 'E' || key === 'R'));       // 8400:0846  set CS:0701 = [#0,'E','R']
  return start;                                                  // 8400:0850
}

// 8400:0871 DailyHealing — every 288 steps (24 h) each member regains 1 HP
export async function DailyHealing() {
  ensureState();
  g.HealCounter = word(g.HealCounter + 1);                       // 8400:0877
  if (g.HealCounter >= 0x120) {                                  // 8400:087b
    let any = false;                                             // 8400:0886
    for (let c = g.PartyHead; c; c = c.next)                     // 8400:0897 / 08b8
      if (await X.HealCharacter(c, 1, false)) any = true;        // 8400:08ab  pushes c, 1, 0
    DrawRestTime(0);                                             // 8400:08d1
    X.DrawText(1, 19, 10, 'The Whole Party Is Healed');          // 8400:08ec
    if (any) await X.DrawPartyRoster(g.SelectedChar);            // 8400:08ff
    await X.MessageDelay();                                      // 8400:0904
    await X.ClearCharacterMessage();                             // 8400:0909
    g.HealCounter = 0;                                           // 8400:090e
  }
}

// 8400:0925 FinishMemorize(c; var learnt): Byte
export async function FinishMemorize(c, learnt) {
  let result = 0, k = 0;                                         // 8400:092b / 092f
  while (k <= 20 && result === 0) {                              // 8400:0933 / 093c
    const m = c.b[0x17 + k];                                     // mem_spell[k] +17h
    if (m > 0x7F) {                                              // 8400:094f
      if (learnt.v) result = ds(0x31FB + (m & 0x7F) * 16);       // 8400:0977  SpellTable[id].level
      else {
        c.b[0x17 + k] = byte(m - 0x80);                          // 8400:098a
        DrawRestTime(0);                                         // 8400:0993
        await X.ShowCasts(c, 'has memorized', c.b[0x17 + k]);    // 8400:09ba  pushes c, s, spell
        learnt.v = true;                                         // 8400:09c2
      }
    }
    k++;                                                         // 8400:09c6
  }
  return result;                                                 // 8400:09cc
}

// 8400:09E7 FinishScribe(c; var learnt): Byte
export async function FinishScribe(c, learnt) {
  let result = 0;                                                // 8400:09ed
  let item = c.items;                                            // 8400:09f1  +C8h
  while (item !== null && result === 0) {                        // 8400:0a04 / 0a0f
    let k = 1;                                                   // 8400:0a18
    if (await X.IsScroll(item))                                  // 8400:0a22
      while (k <= 3 && result === 0) {                           // 8400:0a2e / 0a37
        const p = item.b[0x3B + k];                              // power[k] +3Bh+k
        if (p > 0x80) {                                          // 8400:0a4a  quirk: 80h itself (spell 0) is skipped
          if (learnt.v) result = ds(0x31FB + (p & 0x7F) * 16);   // 8400:0a75
          else {
            const s = p & 0x7F;                                  // 8400:0a7e
            c.b[0x32 + s] = 1;                                   // 8400:0a9b  known_spell[s] +32h+s
            await X.UseScrollSpell(c, item, s);                  // 8400:0ab0  pushes c, item, s
            DrawRestTime(0);                                     // 8400:0ab9
            await X.ShowCasts(c, 'has scribed', s);              // 8400:0ad5
            learnt.v = true;                                     // 8400:0add
          }
        }
        k++;                                                     // 8400:0ae1
      }
    item = item.next;                                            // 8400:0ae7  quirk: read after UseScrollSpell may have freed it
  }
  return result;                                                 // 8400:0afb
}

// 8400:0B0A StudyTick — every 5-minute step; one spell at most per member
export async function StudyTick() {
  ensureState();
  const st = g.StudyTimer;
  let i = 1;                                                     // 8400:0b10
  for (let c = g.PartyHead; c; c = c.next) {                     // 8400:0b21 / 0b95
    st[i] = byte(st[i] - 1);                                     // 8400:0b33  quirk: 0 wraps to 255
    if (st[i] === 0 && c.b[0x2C] /* rest_need */ === 0) {        // 8400:0b3e / 0b48
      const learnt = { v: false };                               // 8400:0b4f
      let lvl = await FinishScribe(c, learnt);                   // 8400:0b5f  scrolls first
      if (lvl === 0) lvl = await FinishMemorize(c, learnt);      // 8400:0b77
      st[i] = byte(lvl * 3);                                     // 8400:0b7d
    }
    i = byte(i + 1);                                             // 8400:0ba8
  }
}

// 8400:0BB2 StudyHourTick(var tick: Byte) — every 12 steps the rest_need hours count down
export async function StudyHourTick(tick) {
  ensureState();
  const st = g.StudyTimer;
  tick.v = byte(tick.v + 1);                                     // 8400:0bbb
  if (tick.v >= 12) {                                            // 8400:0bc1
    tick.v = 0;                                                  // 8400:0bcd
    let i = 1;                                                   // 8400:0bd1
    for (let c = g.PartyHead; c; c = c.next) {                   // 8400:0be2 / 0c4b
      if (shortint(c.b[0x2C]) > 0) {                             // 8400:0bed  signed
        c.b[0x2C] = byte(c.b[0x2C] - 1);                         // 8400:0bf7
        if (c.b[0x2C] === 0) {                                   // 8400:0bfe
          const learnt = { v: true };                            // 8400:0c05
          let lvl = await FinishScribe(c, learnt);               // 8400:0c15
          if (lvl === 0) lvl = await FinishMemorize(c, learnt);  // 8400:0c2d
          st[i] = byte(lvl * 3);                                 // 8400:0c33
        }
      }
      i = byte(i + 1);                                           // 8400:0c5e
    }
  }
}

// 8400:0C9A RestLoop: Boolean — stub ov20 e2; true = interrupted by a rest encounter
export async function RestLoop() {
  ensureState();
  const rc = g.RestClock;
  let interrupted = false;                                       // 8400:0ca0
  let i = 1;                                                     // 8400:0ca8
  for (let c = g.PartyHead; c; c = c.next) { g.StudyTimer[i] = 0; i = byte(i + 1); }   // 8400:0cc8
  g.EffectsPending.fill(1);                                      // 8400:0cf1
  const hourTick = { v: 0 }; let redrawTick = 0;                 // 8400:0cf6 / 0cfa
  X.ClearTextRectangle(1, 17, 38, 22);                           // 8400:0d0a
  DrawRestTime(0);                                               // 8400:0d13
  g.RestActive = 1;                                              // 8400:0d16
  let stop = !(await RestMenu());                                // 8400:0d1c
  while (!stop && (rc[4] > 0 || rc[3] > 0 || rc[2] > 0 || rc[1] > 0)) {   // 8400:0d29 .. 0d4c
    dev.screenSoon('CM-11a');
    if (X.KeyPressed()) {                                        // 8400:0d51  the key is not consumed here
      DrawRestTime(0);                                           // 8400:0d5e
      if (await X.AskYesNo('Stop Resting? ', 0x0D, 0x0A, 0x0F) === 'Y') stop = true;   // 8400:0d79
      else X.ClearMenuLine();                                    // 8400:0d88
    }
    if (!stop) {                                                 // 8400:0d8d
      DecRestClock(5, 1);                                        // 8400:0d9d
      redrawTick = byte(redrawTick + 1);                         // 8400:0da0
      if (redrawTick >= 5) { DrawRestTime(0); redrawTick = 0; }  // 8400:0da3 / 0dad
      await AdvanceClock(5, 1);                                  // 8400:0dbb
      await DailyHealing();                                      // 8400:0dbf
      await StudyTick();                                         // 8400:0dc3
      await StudyHourTick(hourTick);                             // 8400:0dcc
      if (eclW6B(0x5A4) > 0) {                                   // 8400:0dd3  VM 6DD2 encounter interval (steps)
        g.RestEncCounter = word(g.RestEncCounter + 1);           // 8400:0ddb
        if (g.RestEncCounter >= eclW6B(0x5A4)) {                 // 8400:0de6
          g.RestEncCounter = 0;                                  // 8400:0def
          if ((await X.Roll(1, 100)) <= eclW6B(0x5A6)) {         // 8400:0df8 / 0e03  VM 6DD3 chance %
            await X.ClearCharacterMessage();                     // 8400:0e0a
            DrawRestTime(0);                                     // 8400:0e13
            X.DrawText(1, 19, 15, 'The Party is rudely interrupted!');   // 8400:0e2e
            stop = true; interrupted = true;                     // 8400:0e33 / 0e37
            await X.MessageDelay();                              // 8400:0e3b
          }
        }
      }
    }
    if (!stop) await X.yieldShort();                             // browser: let the page breathe between 5-minute steps
  }
  X.ClearTextRectangle(1, 17, 38, 22);                           // 8400:0e4f
  g.RestActive = 0;                                              // 8400:0e54
  return interrupted;                                            // 8400:0e59
}

// 8400:0E60 ov20_init — empty unit initialiser (main init chain, stub ov20 e0)
export function ov20_init() {}
