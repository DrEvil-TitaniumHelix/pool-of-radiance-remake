// game/test/magic/ov04.test.mjs — node test of game/areas/magic_ov04.js (temple). Run: node game/test/magic/ov04.test.mjs
// Expected values are derived from decode/listings/ov04.lst (addresses cited per case).
import { bindMagic, env } from '../../areas/magic_core.js';
import { newChar } from '../../engine/ecl.js';
import * as T from '../../areas/magic_ov04.js';

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

let calls, answers, gold, pool, effects, rolls;
function setup() {
  calls = []; answers = []; gold = 0; pool = 0; effects = new Set(); rolls = [];
  const c = newChar();
  c.b[0] = 4; c.b.set([..."Eric"].map((x) => x.charCodeAt(0)), 1);
  const ds = new Uint8Array(0x8760);
  ds.set([0x1F, 0x22, 0x2B, 0x2C, 0x32, 0x39], 0x114);   // disease types DS:0114..0119 (image)
  const g = { SelectedChar: c, TreasureMoney: new Array(7).fill(0), SpellTargets: [], ds, cure_InProgress: 0 };
  const rec = (name, ret) => (...a) => { calls.push([name, ...a.map((x) => (x && x.b ? 'char' : x))]); return typeof ret === 'function' ? ret(...a) : ret; };
  bindMagic({
    g, ext: {
      ShowCharacterMessage: rec('ShowCharacterMessage'), ClearCharacterMessage: rec('ClearCharacterMessage'),
      AskYesNo: rec('AskYesNo', () => answers.shift()), DrawWrappedText: rec('DrawWrappedText'),
      WordToStr: (v) => String(v), MoneyInGold: rec('MoneyInGold', () => gold),
      SetCharMoneyGold: rec('SetCharMoneyGold'), MoneyValueInGold: rec('MoneyValueInGold', () => pool),
      SetPoolMoneyGold: rec('SetPoolMoneyGold'), ShowTimedBottomMessage: rec('ShowTimedBottomMessage'),
      HasEffect: (ch, t, e) => effects.has(t), RemoveEffect: rec('RemoveEffect'),
      Roll: rec('Roll', () => rolls.shift()), HealCharacter: rec('HealCharacter', () => 1),
    },
  });
  return c;
}
const named = (n) => calls.filter((x) => x[0] === n);

// 1. PayForCure, enough gold: 3400:017e JA not taken -> SetCharMoneyGold(gold - price) (3400:018f)
setup(); answers = ['Y']; gold = 1500;
eq('pay: answer', await T.PayForCure('Cure Blindness', 1000), 'Y');
eq('pay: text', named('DrawWrappedText')[0], ['DrawWrappedText', 1, 0x11, 0x26, 0x16, 0x0A, 1, 'Cure Blindness will only cost 1000 gold pieces.']);
eq('pay: prompt', named('AskYesNo')[0], ['AskYesNo', 'pay for cure ', 0x0D, 0x0F, 0x0A]);
eq('pay: set gold', named('SetCharMoneyGold'), [['SetCharMoneyGold', 500]]);
eq('pay: cured msg', named('ShowCharacterMessage'), [['ShowCharacterMessage', 'char', 'is cured.', 0, 1]]);

// 2. quirk: MoneyInGold LongInt truncated to its low word (3400:0177): 70000 -> 4464
setup(); answers = ['Y']; gold = 70000;
await T.PayForCure('Raise Dead', 1000);
eq('pay: low word', named('SetCharMoneyGold'), [['SetCharMoneyGold', 3464]]);

// 3. gold short, pool >= 10000h: enough (high word > 0, 3400:01b1), SetPoolMoneyGold low word only (3400:01cc)
setup(); answers = ['Y']; gold = 500; pool = 0x10000 + 200;
eq('pool: answer', await T.PayForCure('Cure Disease', 1000), 'Y');
eq('pool: set', named('SetPoolMoneyGold'), [['SetPoolMoneyGold', (0x10000 + 200 - 1000) & 0xFFFF]]);

// 4. gold and pool short: "Not enough money." (3400:01e3), answer 'N' (3400:01e8), no cured message
setup(); answers = ['Y']; gold = 500; pool = 800;
eq('short: answer', await T.PayForCure('Cure Disease', 1000), 'N');
eq('short: msg', named('ShowTimedBottomMessage'), [['ShowTimedBottomMessage', 'Not enough money.']]);
eq('short: no cure msg', named('ShowCharacterMessage'), []);

// 5. answer No: no money routine called
setup(); answers = ['N']; gold = 5000;
eq('no: answer', await T.PayForCure('Cure Disease', 1000), 'N');
eq('no: money untouched', named('MoneyInGold').length + named('SetCharMoneyGold').length, 0);

// 6. CureWounds(2): Roll(2,8)+1 (3400:0480), HealCharacter(c, amount, 0) (3400:049a), price 350
setup(); answers = ['Y']; gold = 400; rolls = [7];
await T.CureWounds(2);
eq('wounds: roll', named('Roll'), [['Roll', 2, 8]]);
eq('wounds: heal', named('HealCharacter'), [['HealCharacter', 'char', 8, 0]]);
eq('wounds: paid', named('SetCharMoneyGold'), [['SetCharMoneyGold', 50]]);

// 7. CureBlindness when not blind and the player declines: ConfirmNeedless, no price shown
setup(); answers = ['N'];
await T.CureBlindness();
eq('blind: needless msg', named('ShowCharacterMessage'), [['ShowCharacterMessage', 'char', 'is not blind.', 0, 0]]);
eq('blind: needless prompt', named('AskYesNo'), [['AskYesNo', 'cast cure anyway: ', 0x0D, 0x0A, 0x0F]]);
eq('blind: no price', named('DrawWrappedText').length, 0);

// 8. CureDisease with disease 2Bh: pays, removes all six types (3400:03b1) with cure_InProgress around
setup(); answers = ['Y']; gold = 2000; effects.add(0x2B);
await T.CureDisease();
eq('disease: removed', named('RemoveEffect').map((x) => x[2]), [0x1F, 0x22, 0x2B, 0x2C, 0x32, 0x39]);
eq('disease: flag reset', env.g.cure_InProgress, 0);

// 9. RaiseDead: dead fighter L3, CON 16 -> 15, hp_max 30, hp_rolled 20 (3400:05e1..0726):
//    bonus = 30-20 = 10; CON 15 >= 14; sum = level[2]*(15-14) = 3; bonus = 10 div 3 = 3; CON < 17 -> hp_max 27
{
  const c = setup(); answers = ['Y']; gold = 6000;
  c.b[0x10C] = 6; c.b[0x14] = 16; c.b[0x32] = 30; c.b[0xB1] = 20; c.b[0x96 + 2] = 3; c.b[0x11B] = 0;
  await T.RaiseDead();
  eq('raise: removed', named('RemoveEffect').map((x) => x[2]), [0x20, 0x37]);
  eq('raise: fields', [c.b[0x11B], c.b[0x10C], c.b[0x10D], c.b[0x14], c.b[0x32]], [1, 0, 1, 15, 27]);
  eq('raise: price', named('SetCharMoneyGold'), [['SetCharMoneyGold', 500]]);
}
// 10. RaiseDead: CON 14 -> 13 returns before the hp_max rebuild (3400:0652 JAE)
{
  const c = setup(); answers = ['Y']; gold = 6000;
  c.b[0x10C] = 6; c.b[0x14] = 14; c.b[0x32] = 30; c.b[0xB1] = 20; c.b[0x96 + 2] = 3;
  await T.RaiseDead();
  eq('raise: low con keeps hp_max', [c.b[0x14], c.b[0x32]], [13, 30]);
}

console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
