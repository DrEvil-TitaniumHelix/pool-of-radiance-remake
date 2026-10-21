// game/test/party/ov20.test.mjs — node test of game/areas/party_ov20.js (PARTY ov20, seg 8400: clock, rest).
// Run: node game/test/party/ov20.test.mjs
// Expected values are derived from decode/listings/ov20.lst / party_parts/ov20.pas.md (addresses per case) and the DS image
// (ClockLimits DS:363A = 10,10,6,24,30,12,256; SpellTable level byte DS:31FB + id*16), not from the JS.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { bindParty } from '../../areas/party_core.js';
import { newChar, newEffect, wrW, rdW, setPstr } from '../../engine/state.js';
import * as T from '../../areas/party_ov20.js';

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};

const exe = readFileSync(fileURLToPath(new URL('../../../decode/bin/START.unpacked.exe', import.meta.url)));
const ds = new Uint8Array(0x8760);
ds.set(exe.subarray(0x8E0 + 0xC7C0, Math.min(exe.length, 0x8E0 + 0xC7C0 + 0x8760)));

let calls, menuKeys, rolls, keyPressed, yesNo;
const g = {};
const rec = (name, ret) => (...a) => { calls.push([name, ...a.map((x) => (x && x.b ? 'rec' : x))]); return typeof ret === 'function' ? ret(...a) : ret; };
function reset() {
  calls = []; menuKeys = []; rolls = []; keyPressed = []; yesNo = [];
  for (const k of Object.keys(g)) delete g[k];
  Object.assign(g, { ds, game_Mode: 0, PartyHead: null, SelectedChar: null,
    ecl_Mem4900: new Uint16Array(0x400), ecl_Mem6B00: new Uint16Array(0x400) });
}
// RemoveEffect(c, type, e): unlink e from c's list (combat_ov24 behaviour, only the list effect matters here)
const removeEffect = (c, type, e) => {
  calls.push(['RemoveEffect', type]);
  if (c.effects === e) c.effects = e.next;
  else for (let p = c.effects; p; p = p.next) if (p.next === e) { p.next = e.next; break; }
};
bindParty({
  g, ext: {
    RemoveEffect: removeEffect,
    ByteToStr: (v) => String(v & 0xFF),
    DrawText: rec('DrawText'), ClearTextRectangle: rec('ClearTextRectangle'), ClearMenuLine: rec('ClearMenuLine'),
    HorizontalMenu: async (...a) => { calls.push(['HorizontalMenu', a[1], a[2], a[3], a[4], a[5]]); return menuKeys.shift(); },
    HealCharacter: async (c, n, f) => { calls.push(['HealCharacter', 'rec', n, f]); return true; },
    DrawPartyRoster: rec('DrawPartyRoster'), MessageDelay: async () => calls.push(['MessageDelay']),
    ClearCharacterMessage: async () => calls.push(['ClearCharacterMessage']),
    ShowCasts: async (c, s, sp) => calls.push(['ShowCasts', s, sp]),
    IsScroll: () => false, UseScrollSpell: rec('UseScrollSpell'),
    KeyPressed: () => (keyPressed.length ? keyPressed.shift() : false),
    AskYesNo: async (...a) => { calls.push(['AskYesNo', ...a]); return yesNo.shift(); },
    Roll: (n, s) => { calls.push(['Roll', n, s]); return rolls.shift(); },
    yieldShort: async () => {},
  },
});
const eff = (type, d) => { const e = newEffect(); e.b[0] = type; wrW(e.b, 1, d); return e; };
const chainOf = (...es) => { for (let i = 0; i + 1 < es.length; i++) es[i].next = es[i + 1]; return es[0] ?? null; };
const durs = (c) => { const r = []; for (let e = c.effects; e; e = e.next) r.push([e.b[0], rdW(e.b, 1)]); return r; };
const mkChar = (name) => { const c = newChar(); setPstr(c.b, 0, name, 15); return c; };
const clock = () => Array.from(g.ecl_Mem4900.subarray(0xC6, 0xC6 + 7));

// 1. CarryClock (8400:02F2): one pass, every digit carries once; digit 6 >= 256 ages the party (+30h word), no wrap
reset();
{ const a = mkChar('A'), b = mkChar('B'); a.next = b; g.PartyHead = a; wrW(a.b, 0x30, 20); wrW(b.b, 0x30, 30);
  const clk = [10, 9, 5, 23, 29, 11, 255];
  T.CarryClock(clk);
  eq('CarryClock full carry', clk, [0, 0, 0, 0, 0, 0, 256]);
  eq('CarryClock ages the party (8400:0378)', [rdW(a.b, 0x30), rdW(b.b, 0x30)], [21, 31]); }

// 2. AdvanceClock(5, 1) (8400:03D5): per unit +1 then carry; game clock = ecl_Mem4900 w[$C6+i]; TickEffects(5, 1)
reset();
{ const c = mkChar('A'); g.PartyHead = c; c.effects = chainOf(eff(0x10, 7));
  g.ecl_Mem4900[0xC6 + 1] = 7; g.ecl_Mem4900[0xC6 + 3] = 9;
  await T.AdvanceClock(5, 1);
  eq('AdvanceClock minutes carry', clock(), [0, 2, 1, 9, 0, 0, 0]);
  eq('AdvanceClock -> TickEffects 5 minutes (chunk 5 < 7)', durs(c), [[0x10, 2]]); }

// 3. AdvanceClock(1, 3) = 1 hour: TickEffects minutes = 1 * CL[2] * CL[1] = 60 (8400:006a..0084), chunks of 10;
//    duration 25 -> 15 -> 5 -> removed in the third chunk (chunk 10 >= 5, 8400:01a1 JAE)
reset();
{ const c = mkChar('A'); g.PartyHead = c; c.effects = chainOf(eff(0x21, 25));
  await T.AdvanceClock(1, 3);
  eq('AdvanceClock hour', clock(), [0, 0, 0, 1, 0, 0, 0]);
  eq('hour: effect removed', durs(c), []);
  eq('hour: one RemoveEffect', calls.filter((x) => x[0] === 'RemoveEffect'), [['RemoveEffect', 0x21]]); }

// 4. TickEffects quirk (8400:0203): A(20), B(5), C(30), one 10-minute chunk: B expires with prev = head -> restart at
//    the head, A is counted down a second time (20 -> 10 -> removed), C -> 20
reset();
{ const c = mkChar('A'); g.PartyHead = c;
  const A = eff(1, 20), B = eff(2, 5), C = eff(3, 30); c.effects = chainOf(A, B, C);
  await T.TickEffects(10, 1);
  eq('quirk: removal order B then A', calls.filter((x) => x[0] === 'RemoveEffect').map((x) => x[1]), [2, 1]);
  eq('quirk: only C left, 20', durs(c), [[3, 20]]); }

// 5. TickEffects in camp (game_Mode 2): no member pending -> nothing changes (8400:0053); member count = 6B00 +67Ch
reset();
{ const c = mkChar('A'); g.PartyHead = c; c.effects = chainOf(eff(1, 20)); g.game_Mode = 2;
  g.ecl_Mem6B00[0x67C >> 1] = 1; g.EffectsPending = new Uint8Array(0x48);
  await T.TickEffects(10, 1);
  eq('camp, nothing pending: unchanged', durs(c), [[1, 20]]);
  g.EffectsPending[0] = 1;
  await T.TickEffects(10, 1);
  eq('camp, member 1 pending: counted', durs(c), [[1, 10]]);
  eq('camp: pending stays 1 (8400:01bb)', g.EffectsPending[0], 1); }

// 6. DecRestClock (8400:047A): borrow from the next non-zero digit up to days
reset();
g.RestClock = [0, 0, 0, 2, 0, 0, 0];
T.DecRestClock(5, 1);
eq('DecRestClock borrow from hours', g.RestClock, [0, 5, 5, 1, 0, 0, 0]);
g.RestClock = [0, 0, 0, 0, 0, 0, 0];
T.DecRestClock(5, 1);
eq('DecRestClock all zero: no change (8400:0480)', g.RestClock, [0, 0, 0, 0, 0, 0, 0]);
g.RestClock = [0, 3, 0, 0, 0, 0, 0];
T.DecRestClock(5, 1);
eq('DecRestClock nothing to borrow -> 0 (8400:04f0)', g.RestClock, [0, 0, 0, 0, 0, 0, 0]);

// 7. NormalizeRestClock (8400:03A3): months fold into days, capped at 99
g.RestClock = [0, 0, 0, 0, 80, 1, 0];
T.NormalizeRestClock();
eq('NormalizeRestClock 80 days + 1 month -> 99', g.RestClock, [0, 0, 0, 0, 99, 0, 0]);

// 8. TwoDigits (8400:0565)
eq('TwoDigits 7', T.TwoDigits(7), '07');
eq('TwoDigits 123 -> Copy(s,1,2)', T.TwoDigits(123), '12');

// 9. DrawRestTime(3) (8400:05F0): hours white (15), the rest 10; minutes = 10*rc[2] + rc[1]
reset();
g.RestClock = [0, 5, 4, 7, 2, 0, 0];
T.DrawRestTime(3);
eq('DrawRestTime cells', calls.filter((x) => x[0] === 'DrawText'),
  [['DrawText', 1, 17, 10, 'Rest Time:'], ['DrawText', 12, 17, 10, '02'], ['DrawText', 14, 17, 10, ':'],
   ['DrawText', 15, 17, 15, '07'], ['DrawText', 17, 17, 10, ':'], ['DrawText', 18, 17, 10, '45']]);

// 10. RestMenu (8400:0721): ext 'H' (cursor up) = Inc minutes by 5; Enter = Rest (quirk); menu colours 0D/0A/0F
reset();
g.RestClock = [0, 0, 0, 0, 0, 0, 0];
menuKeys = [{ key: 'H', ext: true }, { key: '\r', ext: false }];
eq('RestMenu Up then Enter -> true', await T.RestMenu(), true);
eq('RestMenu Inc minutes +5', g.RestClock, [0, 5, 0, 0, 0, 0, 0]);
eq('RestMenu menu call', calls.find((x) => x[0] === 'HorizontalMenu'),
  ['HorizontalMenu', 'Rest   daYs Hours Mins   Inc Dec   Exit', 0x0D, 0x0A, 0x0F, true]);
reset();
g.RestClock = [0, 0, 0, 0, 0, 0, 0];
menuKeys = [{ key: 'Y', ext: false }, { key: 'I', ext: false }, { key: 'E', ext: false }];
eq('RestMenu daYs, Inc, Exit -> false', await T.RestMenu(), false);
eq('RestMenu days +1', g.RestClock, [0, 0, 0, 0, 1, 0, 0]);
reset();
g.RestClock = [0, 0, 0, 3, 0, 0, 0];
menuKeys = [{ key: 'H', ext: false }, { key: 'P', ext: true }, { key: '\0', ext: false }];   // Hours, cursor down = Dec, Esc
eq('RestMenu Hours, Down, Esc -> false', await T.RestMenu(), false);
eq('RestMenu hours -1', g.RestClock, [0, 0, 0, 2, 0, 0, 0]);

// 11. StudyTick (8400:0B0A): never-armed timer wraps 0 -> 255 (quirk); timer 1 -> learn one memorisation, arm level*3
reset();
{ const c = mkChar('A'); g.PartyHead = c; g.StudyTimer = new Uint8Array(9);
  await T.StudyTick();
  eq('StudyTick wrap 0 -> 255', g.StudyTimer[1], 255);
  g.StudyTimer[1] = 1;
  c.b[0x17] = 0x80 | 22; c.b[0x18] = 0x80 | 36;            // pending spell 22 (level 2), then 36 (level 3)
  await T.StudyTick();
  eq('StudyTick memorises the first', [c.b[0x17], c.b[0x18]], [22, 0x80 | 36]);
  eq('StudyTick message (8400:09ba)', calls.filter((x) => x[0] === 'ShowCasts'), [['ShowCasts', 'has memorized', 22]]);
  eq('StudyTick timer = level(36)*3 = 9', g.StudyTimer[1], 9); }

// 12. DailyHealing (8400:0871): at 120h steps every member HealCharacter(c, 1, false), message, counter 0
reset();
{ const a = mkChar('A'), b = mkChar('B'); a.next = b; g.PartyHead = a; g.SelectedChar = a; g.HealCounter = 0x11F;
  g.RestClock = [0, 0, 0, 0, 0, 0, 0];
  await T.DailyHealing();
  eq('DailyHealing heals both', calls.filter((x) => x[0] === 'HealCharacter').length, 2);
  eq('DailyHealing text (8400:08ec)', calls.find((x) => x[0] === 'DrawText' && x[2] === 19), ['DrawText', 1, 19, 10, 'The Whole Party Is Healed']);
  eq('DailyHealing counter reset', g.HealCounter, 0);
  g.HealCounter = 5; await T.DailyHealing();
  eq('DailyHealing below 120h: +1 only', g.HealCounter, 6); }

// 13. RestLoop (8400:0C9A): 5 minutes, menu R; one step; no encounter interval -> not interrupted
reset();
{ const c = mkChar('A'); g.PartyHead = c; g.RestClock = [0, 5, 0, 0, 0, 0, 0];
  menuKeys = [{ key: 'R', ext: false }];
  eq('RestLoop not interrupted', await T.RestLoop(), false);
  eq('RestLoop rest clock 0', g.RestClock, [0, 0, 0, 0, 0, 0, 0]);
  eq('RestLoop game clock +5 min', clock(), [0, 5, 0, 0, 0, 0, 0]);
  eq('RestLoop RestActive 0 at end', g.RestActive, 0); }
// encounter: interval 6B00 +5A4h = 1 step, chance +5A6h = 50 %, Roll(1, 100) = 30 -> interrupted
reset();
{ const c = mkChar('A'); g.PartyHead = c; g.RestClock = [0, 0, 0, 1, 0, 0, 0];
  g.ecl_Mem6B00[0x5A4 >> 1] = 1; g.ecl_Mem6B00[0x5A6 >> 1] = 50; g.RestEncCounter = 0;
  menuKeys = [{ key: 'R', ext: false }]; rolls = [30];
  eq('RestLoop interrupted', await T.RestLoop(), true);
  eq('RestLoop Roll(1, 100)', calls.filter((x) => x[0] === 'Roll'), [['Roll', 1, 100]]);
  eq('RestLoop message (8400:0e2e)', calls.find((x) => x[0] === 'DrawText' && x[2] === 19), ['DrawText', 1, 19, 15, 'The Party is rudely interrupted!']);
  eq('RestLoop one step taken', g.RestClock, [0, 5, 5, 0, 0, 0, 0]); }
// key pressed -> Stop Resting? Yes
reset();
{ const c = mkChar('A'); g.PartyHead = c; g.RestClock = [0, 0, 0, 1, 0, 0, 0];
  menuKeys = [{ key: 'R', ext: false }]; keyPressed = [true]; yesNo = ['Y'];
  eq('RestLoop stopped by the player', await T.RestLoop(), false);
  eq('RestLoop AskYesNo (8400:0d79)', calls.find((x) => x[0] === 'AskYesNo'), ['AskYesNo', 'Stop Resting? ', 0x0D, 0x0A, 0x0F]);
  eq('RestLoop no step after Yes', g.RestClock, [0, 0, 0, 1, 0, 0, 0]); }

if (fails) { console.log(`${fails} FAILED`); process.exit(1); }
console.log('all ov20 tests passed');
