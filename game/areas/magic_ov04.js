// game/areas/magic_ov04.js — MAGIC ov04 (seg 3400): temple services. Lane por-build-magic.
// Source: decode/pseudo/MAGIC.pas.md "## ov04 (3400)" (verified, MAGIC_VERIFY.md; fix #verify-1 PayForCure(service, price)),
// MAGIC_SCREENS.md MAGIC-01..05; every call below re-read against decode/listings/ov04.lst (push order = Pascal order).
// Conventions: magic_core.js header, plus (as the COMBAT build):
// - Pascal `var` parameters = ref objects `{ v }`.
// - HorizontalMenu = engine menus.js shape: X.HorizontalMenu(prompt, options, c1, c2, c3, allowExt, animate) -> { key, ext }.
// - TreasureMoney = g.TreasureMoney[0..6] (LongInts, DS:67F4).
// - Strings: the CS literals of ov04 (address cited).
// - TMenuItem (ov25 NewMenuList node, 2Eh bytes) = { text: string[40] (+0), isHeader (+29h), next (+2Ah) }.

import { g, X, ds, dsPstr, byte, word, shortint } from './magic_core.js';

// TChar fields (SAVES.md §3)
const CON = 0x14, HP_MAX = 0x32, LEVEL = 0x96, HP_ROLLED = 0xB1, ITEMS_PTR = 0xC8, STATUS = 0x10C, ACTIVE = 0x10D, HP = 0x11B;
// Item fields (SAVES.md §4)
const I_CURSED = 0x36;

// 3400:0013 ConfirmNeedless — shown when the target does not have the condition; returns the Yes/No answer.
export async function ConfirmNeedless(msg) {
  await X.ShowCharacterMessage(g.SelectedChar, msg, 0, 0);                    // 3400:0042 (c, s, combatRow 0, wait 0)
  const answer = await X.AskYesNo('cast cure anyway: ', 0x0D, 0x0A, 0x0F);     // 3400:0060  string CS:0000
  await X.ClearCharacterMessage();                                             // 3400:0068
  return answer;
}

// 3400:00BF PayForCure(service, price): 'Y' when paid.
export async function PayForCure(service, price) {
  price = word(price);
  const msg = (service + ' will only cost ' + (await X.WordToStr(price)) + ' gold pieces.').slice(0, 255);   // 3400:00e6..011c  CS:0076 / CS:0087
  await X.DrawWrappedText(1, 0x11, 0x26, 0x16, 0x0A, 1, msg);                  // 3400:0139
  let answer = await X.AskYesNo('pay for cure ', 0x0D, 0x0F, 0x0A);            // 3400:0157  CS:0095
  if (answer === 'Y') {
    // quirk: MoneyInGold returns a LongInt, only its low word is kept (AX at 3400:0177)
    let gold = word(await X.MoneyInGold(g.SelectedChar));                      // 3400:0172
    if (!(price > gold)) {                                                     // 3400:017e  CMP price,gold / JA
      gold = word(gold - price);                                               // 3400:0187
      await X.SetCharMoneyGold(gold);                                          // 3400:018f
    } else {
      let pool = (await X.MoneyValueInGold(g.TreasureMoney)) | 0;              // 3400:019b  LongInt (DS:67F4)
      // 3400:01ab..01b9: enough when pool >= price (pool high word compared signed, low word unsigned)
      const enough = (pool >> 16) > 0 || ((pool >> 16) === 0 && !(price > (pool & 0xFFFF)));
      if (enough) {
        pool = (pool - price) | 0;                                             // 3400:01bb  32-bit SUB/SBB
        await X.SetPoolMoneyGold(word(pool));                                  // 3400:01cc  quirk: only the low word is passed
      } else {
        await X.ShowTimedBottomMessage('Not enough money.');                   // 3400:01e3  CS:00A3
        answer = 'N';                                                          // 3400:01e8
      }
    }
  }
  if (answer === 'Y') {
    await X.ClearCharacterMessage();                                           // 3400:01f4
    await X.ShowCharacterMessage(g.SelectedChar, 'is cured.', 0, 1);           // 3400:0217  CS:00B5
  }
  return answer;
}

// 3400:0249 CureBlindness
export async function CureBlindness() {
  let ok = 'Y';
  const e = { v: null };
  if (!(await X.HasEffect(g.SelectedChar, 0x21, e)))                          // 3400:026a  effect 21h = blindness
    ok = await ConfirmNeedless('is not blind.');                               // 3400:0284  CS:022C
  if (ok === 'Y') {
    ok = await PayForCure('Cure Blindness', 1000);                             // 3400:02a7  CS:023A
    if (ok === 'Y') await X.RemoveEffect(g.SelectedChar, 0x21, null);          // 3400:02c6
  }
}

// 3400:02ED CureDisease — disease types DS:0114..0119 (1Fh, 22h, 2Bh, 2Ch, 32h, 39h).
export async function CureDisease() {
  let diseased = false, ok = 'Y';
  const e = { v: null };
  for (let i = 1; i <= 6; i++)                                                 // 3400:0303
    if (await X.HasEffect(g.SelectedChar, ds(0x0113 + i), e)) diseased = true; // 3400:0328
  if (!diseased) ok = await ConfirmNeedless('is not Diseased.');               // 3400:0355  CS:02CF
  if (ok === 'Y') {
    ok = await PayForCure('Cure Disease', 1000);                               // 3400:0378  CS:02E0
    if (ok === 'Y') {
      g.cure_InProgress = 1;                                                   // 3400:0386  g_681F
      for (let i = 1; i <= 6; i++) await X.RemoveEffect(g.SelectedChar, ds(0x0113 + i), null);   // 3400:03b1
      g.cure_InProgress = 0;                                                   // 3400:03bd
    }
  }
}

// 3400:0401 CureWounds(kind): 1 light, 2 serious, 3 critical
export async function CureWounds(kind) {
  let amount, ok;
  if (kind === 1) {
    ok = await PayForCure('Cure Light Wounds', 100);                           // 3400:0422  CS:03C6
    if (ok === 'Y') {
      amount = byte(await X.Roll(1, 8));                                       // 3400:0434
      await X.HealCharacter(g.SelectedChar, amount, 0);                        // 3400:044b
    }
  } else if (kind === 2) {
    ok = await PayForCure('Cure Serious Wounds', 350);                         // 3400:046e  CS:03D8
    if (ok === 'Y') {
      amount = byte((await X.Roll(2, 8)) + 1);                                 // 3400:0480
      await X.HealCharacter(g.SelectedChar, amount, 0);                        // 3400:049a
    }
  } else if (kind === 3) {
    ok = await PayForCure('Cure Critical Wounds', 600);                        // 3400:04bc  CS:03EC
    if (ok === 'Y') {
      amount = byte((await X.Roll(3, 8)) + 3);                                 // 3400:04ce
      await X.HealCharacter(g.SelectedChar, amount, 0);                        // 3400:04ea
    }
  }
}

// 3400:0510 RaiseDead
export async function RaiseDead() {
  const c = g.SelectedChar;                                                    // 3400:0517
  let dead = false, ok = 'Y';
  if (c.b[STATUS] === 6 || c.b[STATUS] === 1) dead = true;                     // 3400:0539  Dead / Animated
  if (!dead) ok = await ConfirmNeedless('is not dead.');                       // 3400:056a  CS:04F8
  if (ok !== 'Y') return;
  ok = await PayForCure('Raise Dead', 5500);                                   // 3400:0590  CS:0505
  if (ok !== 'Y' || !dead) return;
  g.cure_InProgress = 1;                                                       // 3400:05ab
  await X.RemoveEffect(c, 0x20, null);                                         // 3400:05c1
  await X.RemoveEffect(c, 0x37, null);                                         // 3400:05d7
  g.cure_InProgress = 0;                                                       // 3400:05dc
  c.b[HP] = 1; c.b[STATUS] = 0; c.b[ACTIVE] = 1;                               // 3400:05e1..05f9
  if (c.b[CON] > 0) c.b[CON] = byte(c.b[CON] - 1);                             // 3400:0603  (con already lowered below)
  // 3400:0612..0726: take back the CON hit-point bonus for the lost CON point.
  let bonus = c.b[HP_MAX] > c.b[HP_ROLLED] ? byte(c.b[HP_MAX] - c.b[HP_ROLLED]) : 0;   // 3400:0616 / 0644
  let sum = 0;                                                                 // 3400:0649
  if (c.b[CON] < 14) return;                                                   // 3400:0652  JAE: only CON 14+ carries a bonus
  for (let i = 0; i <= 7; i++) {                                               // 3400:065c
    const lv = shortint(c.b[LEVEL + i]);
    if (lv > 0) {                                                              // 3400:0678  JLE (signed)
      if (i === 2) sum = byte(sum + word(lv * (c.b[CON] - 14)));               // 3400:06a1  fighter: (CON-14) per level
      else if (c.b[CON] > 15) sum = byte(sum + byte(lv << 1));                 // 3400:06c5  2 per level
      else sum = byte(sum + lv);                                               // 3400:06dd  1 per level
    }
  }
  if (sum > 0) bonus = byte(Math.trunc(bonus / sum));                          // 3400:0701  IDIV (both non-negative)
  if (c.b[CON] < 17 || shortint(c.b[LEVEL + 2]) > 0)                           // 3400:070b  JB / JLE
    c.b[HP_MAX] = byte(c.b[HP_MAX] - bonus);                                   // 3400:0726
}

// 3400:0751 NeutralizePoison
export async function NeutralizePoison() {
  let poisoned = false, ok = 'Y';
  const e = { v: null };
  if (await X.HasEffect(g.SelectedChar, 0x37, e)) poisoned = true;             // 3400:0777
  if (!poisoned) ok = await ConfirmNeedless('is not poisoned.');               // 3400:079d  CS:072E
  if (ok !== 'Y') return;
  ok = await PayForCure('Neutralize Poison', 1000);                            // 3400:07c0  CS:073F
  if (ok !== 'Y') return;
  g.cure_InProgress = 1;                                                       // 3400:07ce
  await X.RemoveEffect(g.SelectedChar, 0x37, null);                            // 3400:07e4
  await X.RemoveEffect(g.SelectedChar, 0x16, null);                            // 3400:07fa
  await X.RemoveEffect(g.SelectedChar, 0x0F, null);                            // 3400:0810
  g.cure_InProgress = 0;                                                       // 3400:0815
}

// 3400:083A RemoveCurseService
export async function RemoveCurseService() {
  let ok = 'Y', cursed = false;
  for (let it = g.SelectedChar.items; it && !cursed; it = it.next)             // 3400:084f  items list (+C8h)
    if (it.b[I_CURSED] !== 0) cursed = true;                                   // 3400:0874
  if (!cursed) {
    const e = { v: null };
    if (!(await X.HasEffect(g.SelectedChar, 0x24, e)))                        // 3400:08a8
      ok = await ConfirmNeedless('is not cursed.');                            // 3400:08c2  CS:081E
  }
  if (ok !== 'Y') return;
  ok = await PayForCure('Remove Curse', 3500);                                 // 3400:08e5  CS:082D
  if (ok !== 'Y') return;
  g.SpellTargets[1] = g.SelectedChar;                                          // 3400:08fa  SpellTargets{g_6C95}[1]
  await X.Spell_RemoveCurse();                                                 // 3400:0901  stub ov22 e9 (8E00:2540)
}

// 3400:0928 StoneToFlesh
export async function StoneToFlesh() {
  let ok = 'Y';
  if (g.SelectedChar.b[STATUS] !== 7) ok = await ConfirmNeedless('is not stoned.');   // 3400:093d / 0956  CS:090A
  if (ok !== 'Y') return;
  ok = await PayForCure('Stone to Flesh', 2000);                               // 3400:0979  CS:0919
  if (ok !== 'Y') return;
  const c = g.SelectedChar;
  if (c.b[STATUS] === 7) { c.b[STATUS] = 0; c.b[ACTIVE] = 1; c.b[HP] = 1; }    // 3400:098b..09ab
}

// 3400:09D7 HealMenu — list of the ten services (DS:00F1 + k*29h, k = 1..10).
export async function HealMenu() {
  let done = false;
  const list = { v: null };
  await X.NewMenuList(10, list);                                               // 3400:09fb
  let k = 1;
  for (let p = list.v; p; p = p.next) {                                        // 3400:0a10
    p.text = dsPstr(0x00F1 + k * 0x29).slice(0, 40);                           // 3400:0a33  string[40]
    p.isHeader = 0;                                                            // 3400:0a3b  +29h
    k++;
  }
  await X.ClearTextRectangle(0, 0x18, 0x27, 0x18);                             // 3400:0a6e
  const redraw = { v: 1 };                                                     // 3400:0a73
  await X.DrawTitledFrame(1, 1, 0x26, 0x16, 0, 0x0F, '');                      // 3400:0a98  CS:09B5
  await X.DrawTitledFrame(1, 1, 0x26, 1, 0, 0x0F, '');                         // 3400:0abe
  const idx = { v: 0 }, item = { v: null };
  do {
    const head = (X_name(g.SelectedChar) + ', how can we help you?').slice(0, 40);   // 3400:0acf..0ae7  CS:09B6, string[40]
    await X.DrawText(1, 1, 0x0F, head);                                        // 3400:0afa
    await X.DrawTitledFrame(1, 0x11, 0x26, 0x16, 0, 0x0F, '');                 // 3400:0b20
    const key = await X.VerticalListMenu('', 'Heal Exit', 0x0D, 0x0A, 0x0F, 2, 4, 0x26, 0x0F,
      list.v, 0, redraw, idx, item);                                           // 3400:0b70  CS:09CD
    if (key === 'H' || key === '\r') {                                         // 3400:0b7b
      switch (idx.v) {
        case 0: await CureBlindness(); break;                                  // 3400:0b8c
        case 1: await CureDisease(); break;                                    // 3400:0b97
        case 2: await CureWounds(1); break;                                    // 3400:0ba5
        case 3: await CureWounds(2); break;                                    // 3400:0bb3
        case 4: await CureWounds(3); break;                                    // 3400:0bc1
        case 5: await NeutralizePoison(); break;                               // 3400:0bcc
        case 6: await RaiseDead(); break;                                      // 3400:0bd7
        case 7: await RemoveCurseService(); break;                             // 3400:0be2
        case 8: await StoneToFlesh(); break;                                   // 3400:0bed
        case 9: done = true; break;                                            // 3400:0bf7  Exit
      }
    } else if (key === '\0') done = true;                                      // 3400:0bfd
  } while (!done);
  await X.FreeMenuList(list);                                                  // 3400:0c13
  await X.ClearTextRectangle(0, 0, 0x27, 0x18);                                // 3400:0c24  whole screen
  await X.RedrawCurrentMode();                                                 // 3400:0c29
  await X.DrawPartyRoster(g.SelectedChar);                                     // 3400:0c36
}

const X_name = (c) => { let s = ''; for (let i = 1; i <= c.b[0]; i++) s += String.fromCharCode(c.b[i]); return s; };   // TChar +00h string[15]

// 3400:0D09 Temple — ECL COMBAT opcode with the temple flag Mem[6DE2] (ECL_VM.md).
export async function Temple() {
  g.game_Mode = 1;                                                             // 3400:0d0f  g_49F3
  await X.RedrawCurrentMode();                                                 // 3400:0d14
  await X.DrawPartyRoster(g.SelectedChar);                                     // 3400:0d21
  g.TreasureMoney.fill(0);                                                     // 3400:0d32  FillChar(DS:67F4, 1Ch, 0)
  g.PoolHasMoney = 0;                                                          // 3400:0d37  g_6DC0
  let done = false;                                                            // 3400:0d3c
  do {
    const hasMoney = { v: 0 }, hasItems = { v: 0 }, changed = { v: 0 }, view = { v: 0 };
    await X.TreasurePoolStatus(hasMoney, hasItems);                            // 3400:0d4a
    const opts = hasMoney.v ? 'Heal View Take Pool Share Appraise Exit'       // 3400:0d63  CS:0C3F
                            : 'Heal View Pool Appraise Exit';                  // 3400:0d78  CS:0C67
    const r = await X.HorizontalMenu('', opts, 0x0D, 0x0A, 0x0F, 1, 0);        // 3400:0da5  var ext [BP-3]
    const key = r.key, ext = r.ext;
    switch (key) {
      case 'H': if (!ext) await HealMenu(); break;                             // 3400:0dbb
      case 'V': view.v = ext; await X.ViewMenu(view); break;                   // 3400:0dca  ViewMenu(var [BP-3]) — the ext byte is passed
      case 'T': await X.TakeMoney(); break;                                    // 3400:0dd6
      case 'P': if (!ext) await X.PoolMoney(); break;                          // 3400:0de8
      case 'S': await X.ShareMoney(); break;                                   // 3400:0df4
      case 'A': await X.AppraiseGems(changed); break;                          // 3400:0e05  var [BP-30h]
      case 'E': {
        await X.TreasurePoolStatus(hasMoney, hasItems);                        // 3400:0e1e
        if (!hasMoney.v) done = true;                                          // 3400:0ed5
        else {
          await X.DrawWrappedText(1, 0x11, 0x26, 0x16, 0x0A, 1,
            'As you leave a priest says, "Excuse me but you have left some money here" ');   // 3400:0e60  CS:0C8E
          await X.DrawWrappedText(1, 0x11, 0x26, 0x16, 0x0A, 1,
            'Do you want to go back and retrieve your money?');                // 3400:0e86  CS:0CD9
          const sel = await X.MenuSelect('', '~Yes ~No', 0x0D, 0x0A, 0x0F, 0, 0);   // 3400:0eae  CS:0C85
          if (sel === 1) done = true;                                          // 3400:0eb6  1 = "No": leave the money
          else await X.ClearTextRectangle(1, 0x11, 0x26, 0x16);                // 3400:0ece
        }
        break;
      }
      case 'G': await X.CycleSelectedChar(key); break;                         // 3400:0ee3  Home
      case 'O': await X.CycleSelectedChar(key); break;                         // 3400:0ef2  End
    }
    if (key === 'B' || key === 'T') await X.RedrawCurrentMode();               // 3400:0efa / 0f02
    else if (key === 'A' && changed.v) await X.RedrawCurrentMode();            // 3400:0f09 / 0f13
    await X.DrawPartyRoster(g.SelectedChar);                                   // 3400:0f20
  } while (!done);                                                             // 3400:0f25
}

// 3400:0F32 ov04_init — empty.
export function ov04_init() {}
