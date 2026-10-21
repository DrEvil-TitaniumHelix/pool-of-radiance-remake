# ov20 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 8400:0000 | TickEffects | M | converts count×radix to minutes (8400:006a..008c), walks every member's effect list (+7Fh) decrementing `duration` (+1) by ≤10-minute chunks, RemoveEffect (ov24 e2) on expiry |
| 8400:02F2 | CarryClock | H | radix table DS:363A, digit 6 overflow increments `age` (+30h) of every member |
| 8400:03A3 | NormalizeRestClock | H | CarryClock(DS:6DC2), months×30 into days, days ≤ 99 |
| 8400:03D5 | AdvanceClock | H | (other lanes' name) reads/writes VM 49C6..49CC, loop `[BP+8]` times inc digit `[BP+6]`, then TickEffects |
| 8400:047A | DecRestClock | H | borrow loop over DS:6DC2 digits, FillChar on underflow |
| 8400:0565 | TwoDigits | H | ByteToStr + leading '0' (CS:0563) + Copy(s,1,2) |
| 8400:05F0 | DrawRestTime | H | string "Rest Time:" CS:05E3, ':' CS:05EE, colours 10/15 |
| 8400:0721 | RestMenu | H | menu "Rest   daYs Hours Mins   Inc Dec   Exit" CS:06D9, exit set CS:0701 = [#0,'E','R'] |
| 8400:0871 | DailyHealing | H | counter DS:6DD8 ≥ 120h, HealCharacter(c,1,false), "The Whole Party Is Healed" |
| 8400:0925 | FinishMemorize | H | mem_spell (+17h) bit 7 cleared, "has memorized" |
| 8400:09E7 | FinishScribe | H | scroll power bytes (+3Ch..+3Eh) > 80h, known_spell (+32h+s) := 1, "has scribed" |
| 8400:0B0A | StudyTick | H | per-member byte timer DS:6DCF+i, armed with level*3 |
| 8400:0BB2 | StudyHourTick | H | every 12 steps rest_need (+2Ch) −1, arms the timer when it hits 0 |
| 8400:0C9A | RestLoop | H | "Stop Resting? ", "The Party is rudely interrupted!", caller ov15 Rest (MAGIC.pas.md name RestLoop) |
| 8400:0E60 | ov20_init | H | empty |

Counts: 15/15 routines; H 13, M 1 (TickEffects), plus ov20_init.

## (b) Globals named (globals request for por-tooling)

| DS | name | conf | evidence |
|---|---|---|---|
| 363A | ClockLimits | H | `array[0..6] of Word` = 10,10,6,24,30,12,256 (image bytes); radix in CarryClock/DecRestClock/TickEffects; GLOBALS `g_3642` = element 4 (30) |
| 471E | EffectsPending | M | byte per party member (`DS:471D+i`, i = 1..8; FillChar 48h bytes = 72), set when a member still has a timed effect (TickEffects 8400:01c2 / 02a7) |
| 49FB | RestEncCounter | M | steps since the last rest-encounter check (RestLoop 8400:0ddb..0def), also reset by ov11 init |
| 6DC2 | RestClock | H | `array[0..6] of Word` displayed as "Rest Time:" DD:HH:MM; FillChar 0Eh in ov15 Camp/Rest |
| 6DCF | StudyTimer | M | `array[1..8] of Byte` at DS:6DCF+i (element 0 would overlap RestClock[6] high byte; never used) |
| 6DD8 | HealCounter | H | 5-minute rest steps since the last daily healing (≥ 288 = 24 h); reset by ov15 Camp |
| 6DDA | RestActive | M | 1 during RestLoop; ShowCharacterMessage (00BA:16EC) then uses row 12h (ENGINE.pas.md line 557) |

Not named (ECL VM words, block 2): `ecl_Mem6B00^.w[$5A4]` = VM 6DD2 rest-encounter interval in steps (0 = no rest encounters), `w[$5A6]` = VM 6DD3 encounter chance (%), `w[$67C]` = VM 6E3E party member count (ECL_VM.md).

## (c) Unknowns
- Clock digit 0 (radix 10) meaning (L: sub-minute unit); no caller with unit 0 seen.
- Unit of the effect `duration` field: minutes (M, from TickEffects' conversion; combat rounds call AdvanceClock(1,1) = 1 minute per round).
- ShowCasts / IsScroll / UseScrollSpell names belong to the MAGIC lane (draft names ReportSpellCast / ItemContainsSpell / ConsumeScrollSpell; MAGIC.pas.md calls 323D IsScroll).
- Whether the 256-year age overflow (CarryClock digit 6) is ever reached (practically not).

## (d) Self-check
Sample: 27 of ~190 statements (14 %), each re-read against ov20.lst:
8400:0006, 003d/0048, 007a, 0097, 0118, 0183, 01a1, 01fe, 0203, 024b, 02d8, 031b, 0363, 03c6, 0409, 0426, 0471, 04ce, 0529, 0589, 0638, 0677, 06cd, 07c0, 0846, 0b33, 0bed, 0d79, 0df8, 0e03.
Results:
- Push orders: 01fe RemoveEffect pushes c (hi,lo), `e^.type`, e (hi,lo) = (c, type, e) per ov24 signature ✓; 0471 pushes `[BP+8]`, `[BP+6]` → TickEffects(count, unit) ✓; 0638 pushes 1, 11h, 0Ah, s → DrawText(1,17,10,s) ✓; 0769 pushes '', options, 0Dh, 0Ah, 0Fh, 1, 0, @ext → HorizontalMenu ✓; 0829 pushes 5, 1 → DecRestClock(5, 1) ✓, 0836 pushes 1, sel → DecRestClock(1, sel) ✓; 08ab pushes c, 1, 0 → HealCharacter(c, 1, false) ✓; 0ab0 pushes c, item, s → UseScrollSpell(c, item, s) ✓; 0d0a pushes 1, 11h, 26h, 16h → ClearTextRectangle(1,17,38,22) ✓; 0d79 pushes s, 0Dh, 0Ah, 0Fh → AskYesNo ✓; 0df8 pushes 1, 64h → Roll(1, 100) ✓.
- Conditions: 01ad `JNC` after `CMP chunk, duration` → removal when chunk ≥ duration ✓; 031d `JC` → carry only when ≥ radix ✓; 04b2 `JA` → loop while amount > digit ✓; 0846 SetIn with set {#0,'E','R'} then `JNZ` exit ✓ (set bytes decoded from ov20.bin); 0b43 `JNZ` after timer test ✓; 0bf2 `JLE` signed rest_need ✓; 0de6 `JC` skip while counter < interval ✓; 0e08 `JA` skip when roll > chance ✓.
- Corrections made during the check: StudyTick note (one spell per step, scroll first) rewritten after re-reading 0b4f..0b7d; AdvanceClock argument roles fixed as (count [BP+8], unit [BP+6]) — consistent with ECL (`AdvanceClock(v, 1)`) and VIEW (`AdvanceClock(1, 2)`) usage.
- argcheck.py: not run by this fork (the tool accepts only ECL/VIEW areas); the parent runs it on the merged PARTY.pas.md.
