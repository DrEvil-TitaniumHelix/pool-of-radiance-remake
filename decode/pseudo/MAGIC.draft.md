# MAGIC — first draft

Scope: ov04, ov08, ov15, ov22, as assigned in por-areas.md. 131 exported entry/block candidates (12/14/23/82), including four unit initializers. This is a first draft with explicit unknowns, not a decode-gate claim.

Inputs: FOREMAN.md, LAYOUT.md, listings/INDEX.md, paired `.lst`/`.c`, functions.tsv, verified RT_LEDGER.md, ECL_VM.md, names maps, original-derived GAME.OVR/START.unpacked.exe copies. Only this draft and the required STATUS handoff are written in the repository.

**Conventions.** Procedure names H/M/L grade the evidence for the name; body/ABI confidence is independent. Generic decompile bodies use ascending BP stack-slot parameters and call-slot argument order, with split far-pointer words retained where exported. Original TP Pascal declaration order is reversed. A reconstructed source-level body explicitly states its argument convention. `P_T` is a typed pointer cast; `PackedAlias(g_xxxx)` preserves an overlapping decompiler symbol whose width/segment must be checked. `FarBits(hi,lo)` packs words. `SliceN(x,b)` is an assignable N-bit slice at byte b. `MemRef(offset,segment)` denotes a referent. `and then`/`or else` short-circuit; `Sequence` evaluates left-to-right and yields the last expression. Byte/word assignments wrap.

**Offsets.** CALL-derived lines cite the machine call; matched BP/DS stores cite the write (occurrence matching). Lines that cannot yet be tied to a specific source statement explicitly say `routine anchor; statement location unresolved`, followed by the routine entry. These are **coverage anchors, not exact source-line addresses**; structural begin/end and compiler register temporaries also retain entry anchors. Repeated calls/stores can be reordered by the decompiler and need verifier review.

**Reviewed helper conventions.** `RollDice(count,sides)` denotes source-order ov24:0DE3; generic exported `Roll(...)` calls retain their original stack-slot order (sides,count). `SelectedActor := FarPtr(g_5D94,SelectedChar)` is the far actor referent; SelectedChar alone remains the exported offset word. Named game-helper arguments are semantic pseudocode, not a recovered external ABI.

**Runtime.** String copying/append/assignment are expressed as assignment, concatenation and Copy; current-overlay CS literals are recovered from the argument pushes, not stale callee CS. String temporary lifetime across helper calls remains provisional. `Flags.ZF := not (x in set)` renders SetIn; subsequent decompiler Boolean variables can be stale and are not reliable source conditions. UNKNOWN_in/extraout/unaff values are unresolved register/flag dataflow. `*FromRegisters` arithmetic retains implicit operands as unknown. Known runtime operations are never treated as game subroutines; unknown runtime names remain RT_segment_offset.

**Area correction.** ov08 is the main tactical-combat loop and action menus. ov15 contains camp/party-order/options/quit UI alongside memorization/scribing. ov04 is paid temple healing. ov22 is spell selection, target/application helpers, handlers and callback initialization. The assignment owns whole units, so all are retained. ECL_VM.md provides VM semantics; these units do not implement the ECL dispatcher.

**Static-data evidence.** Spell names1..56 are Pascal strings at DS:28E9 + id*$29. Spell metadata uses DS:31FA + id*$10. Callback initializer 8E00:3413 writes 68 far entries at DS:6B84 + id*4; stubs resolve through the FBOV entry list. Full table and exact spell labels follow in Screens/Globals. Blank/unnamed item/monster slots57..67 do not inherit guessed rulebook names.

### ov04:0013 ConfirmCureAnyway (conf M)

Params (BP stack slots): param_1: LongWord [BP+$06].  
Locals: puVar1: P_Byte [compiler temporary; no proven BP slot]; local_116: array[0..18] of Byte [BP-$114]; local_103: array[0..255] of Byte [BP-$101]; local_3: Byte [BP-$1].  
Callers (export): FUN_3400_0249,FUN_3400_02ed,FUN_3400_0510,FUN_3400_0751,FUN_3400_083a,FUN_3400_0928.  
Callees (export): FUN_00ba_16ec, FUN_00ba_17e3, System.@StrAssign, System.@StrCopy, ov25_10D1.

Message copy plus selected-actor report, then yes/no prompt `cast cure anyway: `; result is the actual choice byte, not a Boolean.

```pascal
function ConfirmCureAnyway(param_1: LongWord): Byte; { 3400:0013 }
begin { routine anchor; statement location unresolved } { 3400:0013 }
  PString(local_103, SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $FF); { 3400:0029 }
  FUN_00ba_16ec((Word(UNKNOWN_extraout_AH) shl 8), (Word(UNKNOWN_extraout_AH) shl 8), local_103, SS, SelectedChar, g_5D94); { 3400:0042 }
  puVar1 := local_116; { routine anchor; statement location unresolved } { 3400:0013 }
  PString(local_116, SS) := 'cast cure anyway: '; { 3400:0052 }
  local_3 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), puVar1, SS); { 3400:0060 }
  FUN_00ba_17e3(); { 3400:0068 }
  Exit(local_3); { 3400:0073 }
end; { routine anchor; statement location unresolved } { 3400:0013 }
```

### ov04:00BF ChargeTempleCure (conf M)

Params (BP stack slots): param_1: Word [BP+$06]; param_2: LongWord [BP+$08].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_30a: array[0..255] of Byte [BP-$308]; local_20a: array[0..237] of Byte [BP-$208]; local_11c: array[0..3] of Byte [BP-$11A]; local_118: array[0..3] of Byte [BP-$116]; local_114: array[0..9] of Byte [BP-$112]; local_10a: LongWord [BP-$108]; local_106: Word [BP-$104]; local_104: ShortInt [BP-$102]; local_103: array[0..256] of Byte [BP-$101].  
Callers (export): FUN_3400_0249,FUN_3400_02ed,FUN_3400_0401,FUN_3400_0510,FUN_3400_0751,FUN_3400_083a,FUN_3400_0928.  
Callees (export): FUN_00ba_1073, FUN_00ba_1693, FUN_00ba_16ec, FUN_00ba_17e3, FUN_0709_0768, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov19_28BE, ov21_00A8, ov21_0130, ov21_0185, ov25_10D1.

Temple payment: confirm Y, prefer the selected actor if their money valuation covers the **entire** fee, otherwise try pooled money for the **entire** fee. Does not combine a partial actor balance with a partial pool. Reports `Not enough money.` or `is cured.`. Effect application is done by the caller.

```pascal
function ChargeTempleCure(param_1: Word; param_2: LongWord): Word; { 3400:00BF }
begin { routine anchor; statement location unresolved } { 3400:00BF }
  PString(local_103, SS) := Copy(PString(Integer(param_2), Integer((LongWord(param_2) shr $10))), 1, $FF); { 3400:00D5 }
  puVar6 := local_20a; { routine anchor; statement location unresolved } { 3400:00BF }
  uVar7 := SS; { routine anchor; statement location unresolved } { 3400:00BF }
  PString(local_20a, SS) := PString(local_103, SS); { 3400:00E6 }
  PString(local_20a, SS) := Copy(PString(local_20a, SS) + ' will only cost ', 1, 255); { 3400:00F0 }
  puVar5 := local_30a; { routine anchor; statement location unresolved } { 3400:00BF }
  uVar2 := SS; { routine anchor; statement location unresolved } { 3400:00BF }
  FUN_00ba_1073(param_1); { 3400:00FE }
  PString(local_20a, SS) := Copy(PString(local_20a, SS) + PString(puVar5, uVar2), 1, 255); { 3400:0103 }
  PString(local_20a, SS) := Copy(PString(local_20a, SS) + ' gold pieces.', 1, 255); { 3400:010D }
  PString(local_103, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 3400:011C }
  FUN_0709_0768(local_103, SS, Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $16), Pack16(UNKNOWN_extraout_AH, $26), Pack16(UNKNOWN_extraout_AH, $11), Pack16(UNKNOWN_extraout_AH, 1)); { 3400:0139 }
  puVar6 := local_118; { routine anchor; statement location unresolved } { 3400:00BF }
  uVar2 := SS; { routine anchor; statement location unresolved } { 3400:00BF }
  PString(local_118, SS) := 'pay for cure '; { 3400:0149 }
  uVar2 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, $D), puVar6, uVar2); { 3400:0157 }
  local_104 := ShortInt(uVar2); { routine anchor; statement location unresolved } { 3400:00BF }
  if (local_104 = 89) then { routine anchor; statement location unresolved } { 3400:00BF }
    begin { routine anchor; statement location unresolved } { 3400:00BF }
      local_106 := ov19_28BE(SelectedChar, g_5D94); { 3400:0172 }
      if (local_106 < param_1) then { routine anchor; statement location unresolved } { 3400:00BF }
        begin { routine anchor; statement location unresolved } { 3400:00BF }
          local_10a := ov21_00A8(P_Word(@(TreasureMoney)), $C7C); { 3400:019B }
          uVar1 := (local_10a shr $10); { routine anchor; statement location unresolved } { 3400:00BF }
          uVar3 := Word(local_10a); { routine anchor; statement location unresolved } { 3400:00BF }
          if ((LongInt(local_10a) < $10000) and then (($7FFFFFFF < local_10a) or else (uVar3 < param_1))) then { routine anchor; statement location unresolved } { 3400:00BF }
            begin { routine anchor; statement location unresolved } { 3400:00BF }
              puVar6 := local_11c; { routine anchor; statement location unresolved } { 3400:00BF }
              uVar2 := SS; { routine anchor; statement location unresolved } { 3400:00BF }
              PString(local_11c, SS) := 'Not enough money.'; { 3400:01DE }
              uVar2 := FUN_00ba_1693(puVar6, uVar2); { 3400:01E3 }
              local_104 := 78; { routine anchor; statement location unresolved } { 3400:00BF }
            end; { routine anchor; statement location unresolved } { 3400:00BF }
          else { routine anchor; statement location unresolved } { 3400:00BF }
            begin { routine anchor; statement location unresolved } { 3400:00BF }
              Slice16(local_10a, 0) := (uVar3 - param_1); { routine anchor; statement location unresolved } { 3400:00BF }
              Slice16(local_10a, 2) := (Integer(uVar1) - Word((uVar3 < param_1))); { routine anchor; statement location unresolved } { 3400:00BF }
              uVar2 := ov21_0185(Integer(local_10a)); { 3400:01CC }
            end; { routine anchor; statement location unresolved } { 3400:00BF }
        end; { routine anchor; statement location unresolved } { 3400:00BF }
      else { routine anchor; statement location unresolved } { 3400:00BF }
        begin { routine anchor; statement location unresolved } { 3400:00BF }
          local_106 := (local_106 - param_1); { routine anchor; statement location unresolved } { 3400:00BF }
          uVar2 := ov21_0130(local_106); { 3400:018F }
        end; { routine anchor; statement location unresolved } { 3400:00BF }
    end; { routine anchor; statement location unresolved } { 3400:00BF }
  uVar4 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 3400:00BF }
  if (local_104 = 89) then { routine anchor; statement location unresolved } { 3400:00BF }
    begin { routine anchor; statement location unresolved } { 3400:00BF }
      FUN_00ba_17e3(); { 3400:01F4 }
      puVar6 := local_114; { routine anchor; statement location unresolved } { 3400:00BF }
      uVar2 := SelectedChar; { routine anchor; statement location unresolved } { 3400:00BF }
      uVar7 := g_5D94; { routine anchor; statement location unresolved } { 3400:00BF }
      PString(local_114, SS) := 'is cured.'; { 3400:020C }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_01, 1), (Word(UNKNOWN_extraout_AH_01) shl 8), puVar6, SS, uVar2, uVar7); { 3400:0217 }
      uVar4 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 3400:00BF }
    end; { routine anchor; statement location unresolved } { 3400:00BF }
  Exit(Pack16(uVar4, local_104)); { 3400:0229 }
end; { routine anchor; statement location unresolved } { 3400:00BF }
```

### ov04:0249 TempleCureBlindness (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_116: Byte [BP-$114]; local_115: array[0..13] of Byte [BP-$113]; local_107: ShortInt [BP-$105]; local_106: Byte [BP-$104]; local_6: array[0..3] of Byte [BP-$4].  
Callers (export): FUN_3400_09d7.  
Callees (export): FUN_00ba_2199, ConfirmCureAnyway, ChargeTempleCure, System.@StrCopy, ov24_0026.

Effect id $21 blindness; service cost 1000. If absent, asks cast-cure-anyway before charging and attempting removal.

```pascal
procedure TempleCureBlindness(); { 3400:0249 }
begin { routine anchor; statement location unresolved } { 3400:0249 }
  local_106 := 0; { routine anchor; statement location unresolved } { 3400:0249 }
  local_107 := 89; { routine anchor; statement location unresolved } { 3400:0249 }
  uVar2 := $BA; { routine anchor; statement location unresolved } { 3400:0249 }
  cVar1 := FUN_00ba_2199(local_6, SS, $21, SelectedChar, g_5D94); { 3400:026A }
  if (cVar1 = 0) then { routine anchor; statement location unresolved } { 3400:0249 }
    begin { routine anchor; statement location unresolved } { 3400:0249 }
      puVar3 := local_115; { routine anchor; statement location unresolved } { 3400:0249 }
      uVar2 := $AF8; { routine anchor; statement location unresolved } { 3400:0249 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 3400:0249 }
      PString(local_115, SS) := 'is not blind.'; { 3400:027E }
      local_107 := ConfirmCureAnyway(puVar3, uVar4); { 3400:0284 }
    end; { routine anchor; statement location unresolved } { 3400:0249 }
  if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:0249 }
    begin { routine anchor; statement location unresolved } { 3400:0249 }
      puVar3 := @(local_116); { routine anchor; statement location unresolved } { 3400:0249 }
      PString(local_116, SS) := 'Cure Blindness'; { 3400:029D }
      local_107 := ChargeTempleCure(1000, puVar3, SS); { 3400:02A7 }
      if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:0249 }
        begin { routine anchor; statement location unresolved } { 3400:0249 }
          ov24_0026(0, 0, $21, SelectedChar, g_5D94); { 3400:02C6 }
        end; { routine anchor; statement location unresolved } { 3400:0249 }
    end; { routine anchor; statement location unresolved } { 3400:0249 }
  Exit; { 3400:02CE }
end; { routine anchor; statement location unresolved } { 3400:0249 }
```

### ov04:02ED TempleCureDisease (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_11a: array[0..3] of Byte [BP-$118]; local_116: array[0..12] of Byte [BP-$114]; local_109: ShortInt [BP-$107]; local_108: Byte [BP-$106]; local_107: ShortInt [BP-$105]; local_106: Byte [BP-$104]; local_6: array[0..3] of Byte [BP-$4].  
Callers (export): FUN_3400_09d7.  
Callees (export): FUN_00ba_2199, ConfirmCureAnyway, ChargeTempleCure, System.@StrCopy, ov24_0026.

Six disease ids are read from DS:0114..0119; cost 1000. Sets g_681F around effect removals; exact flag role remains provisional.

```pascal
procedure TempleCureDisease(); { 3400:02ED }
begin { routine anchor; statement location unresolved } { 3400:02ED }
  local_109 := 0; { routine anchor; statement location unresolved } { 3400:02ED }
  local_106 := 0; { routine anchor; statement location unresolved } { 3400:02ED }
  local_107 := 89; { routine anchor; statement location unresolved } { 3400:02ED }
  local_108 := 1; { routine anchor; statement location unresolved } { 3400:02ED }
  while true do { routine anchor; statement location unresolved } { 3400:02ED }
    begin { routine anchor; statement location unresolved } { 3400:02ED }
      uVar2 := $BA; { routine anchor; statement location unresolved } { 3400:02ED }
      cVar1 := FUN_00ba_2199(local_6, SS, (P_Byte((local_108 + $113)))^, SelectedChar, g_5D94); { 3400:0328 }
      if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 3400:02ED }
        begin { routine anchor; statement location unresolved } { 3400:02ED }
          local_109 := 1; { routine anchor; statement location unresolved } { 3400:02ED }
        end; { routine anchor; statement location unresolved } { 3400:02ED }
      if (local_108 = 6) then { routine anchor; statement location unresolved } { 3400:02ED }
        Break; { routine anchor; statement location unresolved } { 3400:02ED }
      local_108 := (local_108 + 1); { routine anchor; statement location unresolved } { 3400:02ED }
    end; { routine anchor; statement location unresolved } { 3400:02ED }
  if (local_109 = 0) then { routine anchor; statement location unresolved } { 3400:02ED }
    begin { routine anchor; statement location unresolved } { 3400:02ED }
      puVar3 := local_11a; { routine anchor; statement location unresolved } { 3400:02ED }
      uVar2 := $AF8; { routine anchor; statement location unresolved } { 3400:02ED }
      uVar4 := SS; { routine anchor; statement location unresolved } { 3400:02ED }
      PString(local_11a, SS) := 'is not Diseased.'; { 3400:034F }
      local_107 := ConfirmCureAnyway(puVar3, uVar4); { 3400:0355 }
    end; { routine anchor; statement location unresolved } { 3400:02ED }
  if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:02ED }
    begin { routine anchor; statement location unresolved } { 3400:02ED }
      puVar3 := local_116; { routine anchor; statement location unresolved } { 3400:02ED }
      PString(local_116, SS) := 'Cure Disease'; { 3400:036E }
      cVar1 := ChargeTempleCure(1000, puVar3, SS); { 3400:0378 }
      if (cVar1 = 89) then { routine anchor; statement location unresolved } { 3400:02ED }
        begin { routine anchor; statement location unresolved } { 3400:02ED }
          g_681F := 1; { 3400:0386 }
          local_108 := 1; { routine anchor; statement location unresolved } { 3400:02ED }
          local_107 := $59; { routine anchor; statement location unresolved } { 3400:02ED }
          while true do { routine anchor; statement location unresolved } { 3400:02ED }
            begin { routine anchor; statement location unresolved } { 3400:02ED }
              ov24_0026(0, 0, (P_Byte((local_108 + $113)))^, SelectedChar, g_5D94); { 3400:03B1 }
              if (local_108 = 6) then { routine anchor; statement location unresolved } { 3400:02ED }
                Break; { routine anchor; statement location unresolved } { 3400:02ED }
              local_108 := (local_108 + 1); { routine anchor; statement location unresolved } { 3400:02ED }
            end; { routine anchor; statement location unresolved } { 3400:02ED }
          g_681F := 0; { 3400:03BD }
        end; { routine anchor; statement location unresolved } { 3400:02ED }
    end; { routine anchor; statement location unresolved } { 3400:02ED }
  Exit; { 3400:03C5 }
end; { routine anchor; statement location unresolved } { 3400:02ED }
```

### ov04:0401 TempleCureWounds (conf M)

Params: kind: Byte [BP+6].  
Locals: choice: Byte [BP-2]; rolled HP: Byte [BP-1]; temporary service strings in BP-18..-3.  
Callers (export): FUN_3400_09d7.  
Callees (export): ChargeTempleCure, Roll, System.@StrCopy, ov24_175D.

Fees and actual dice from code: light 100 => 1d8; serious 350 => 2d8+1; critical 600 => 3d8+3. Calls ov24:175D; no modern-edition rule substitution.

**Assembly review:** Each cure branch is independently traced through fee confirmation, Roll at0434/0480/04CE, bonus and heal at044B/049A/04EA. Named helper arguments are semantic pseudocode for ov24:175D, not a recovered Pascal prototype. RollDice(count,sides) denotes source-order ov24:0DE3.

```pascal
procedure TempleCureWounds(kind: Byte); { 3400:0401 }
begin { 3400:0401 }
  case kind of { 3400:040A }
    1: if ChargeTempleCure(100,'Cure Light Wounds') = 'Y' then { 3400:0422 }
      ov24_175D(actor:=FarPtr(g_5D94,SelectedChar), amount:=RollDice(1,8), flag:=0); { 3400:044B }
    2: if ChargeTempleCure(350,'Cure Serious Wounds') = 'Y' then { 3400:046E }
      ov24_175D(actor:=FarPtr(g_5D94,SelectedChar), amount:=RollDice(2,8)+1, flag:=0); { 3400:049A }
    3: if ChargeTempleCure(600,'Cure Critical Wounds') = 'Y' then { 3400:04BC }
      ov24_175D(actor:=FarPtr(g_5D94,SelectedChar), amount:=RollDice(3,8)+3, flag:=0); { 3400:04EA }
  end; { 3400:04F2 }
end; { 3400:04F5 }
```

### ov04:0510 TempleRaiseDead (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_11c: array[0..1] of Byte [BP-$11A]; local_11a: array[0..10] of Byte [BP-$118]; local_10f: Integer [BP-$10D]; uStack_10d: Word [BP-$10B]; local_10b: ShortInt [BP-$109]; local_10a: Byte [BP-$108]; local_109: Byte [BP-$107]; local_108: ShortInt [BP-$106]; local_107: ShortInt [BP-$105]; local_106: Byte [BP-$104].  
Callers (export): FUN_3400_09d7.  
Callees (export): ConfirmCureAnyway, ChargeTempleCure, System.@StrCopy, ov24_0026.

Raise Dead costs 5500; eligible status values are 6 or 1. On paid eligible cure: remove effects $20/$37, HP=1, status=0, active=1; decrement nonzero constitution +14, then recompute max HP using class levels. Numeric arithmetic and byte wrapping are preserved below.

```pascal
procedure TempleRaiseDead(); { 3400:0510 }
begin { routine anchor; statement location unresolved } { 3400:0510 }
  uVar1 := $3400; { routine anchor; statement location unresolved } { 3400:0510 }
  local_10f := SelectedChar; { routine anchor; statement location unresolved } { 3400:0510 }
  uStack_10d := g_5D94; { routine anchor; statement location unresolved } { 3400:0510 }
  local_108 := 0; { routine anchor; statement location unresolved } { 3400:0510 }
  local_106 := 0; { routine anchor; statement location unresolved } { 3400:0510 }
  local_107 := 89; { routine anchor; statement location unresolved } { 3400:0510 }
  if (((P_ShortInt((SelectedChar + $10C)))^ = 6) or else ((P_ShortInt((SelectedChar + $10C)))^ = 1)) then { routine anchor; statement location unresolved } { 3400:0510 }
    begin { routine anchor; statement location unresolved } { 3400:0510 }
      local_108 := 1; { routine anchor; statement location unresolved } { 3400:0510 }
    end; { routine anchor; statement location unresolved } { 3400:0510 }
  if (local_108 = 0) then { routine anchor; statement location unresolved } { 3400:0510 }
    begin { routine anchor; statement location unresolved } { 3400:0510 }
      puVar2 := local_11c; { routine anchor; statement location unresolved } { 3400:0510 }
      uVar1 := $AF8; { routine anchor; statement location unresolved } { 3400:0510 }
      uVar3 := SS; { routine anchor; statement location unresolved } { 3400:0510 }
      PString(local_11c, SS) := 'is not dead.'; { 3400:0564 }
      local_107 := ConfirmCureAnyway(puVar2, uVar3); { 3400:056A }
    end; { routine anchor; statement location unresolved } { 3400:0510 }
  if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:0510 }
    begin { routine anchor; statement location unresolved } { 3400:0510 }
      puVar2 := local_11a; { routine anchor; statement location unresolved } { 3400:0510 }
      PString(local_11a, SS) := 'Raise Dead'; { 3400:0586 }
      local_107 := ChargeTempleCure($157C, puVar2, SS); { 3400:0590 }
      if ((local_107 = 89) and then (local_108 <> 0)) then { routine anchor; statement location unresolved } { 3400:0510 }
        begin { routine anchor; statement location unresolved } { 3400:0510 }
          g_681F := 1; { 3400:05AB }
          ov24_0026(0, 0, $20, local_10f, uStack_10d); { 3400:05C1 }
          ov24_0026(0, 0, Pack16(UNKNOWN_extraout_AH, $37), local_10f, uStack_10d); { 3400:05D7 }
          g_681F := 0; { 3400:05DC }
          (P_Byte((local_10f + $11B)))^ := 1; { routine anchor; statement location unresolved } { 3400:0510 }
          (P_Byte((local_10f + $10C)))^ := 0; { routine anchor; statement location unresolved } { 3400:0510 }
          (P_Byte((local_10f + $10D)))^ := 1; { routine anchor; statement location unresolved } { 3400:0510 }
          if ((P_ShortInt((local_10f + $14)))^ <> 0) then { routine anchor; statement location unresolved } { 3400:0510 }
            begin { routine anchor; statement location unresolved } { 3400:0510 }
              (P_ShortInt((local_10f + $14)))^ := ((P_ShortInt((local_10f + $14)))^ + -(1)); { routine anchor; statement location unresolved } { 3400:0510 }
            end; { routine anchor; statement location unresolved } { 3400:0510 }
          if ((P_Byte((local_10f + $B1)))^ < (P_Byte((local_10f + $32)))^) then { routine anchor; statement location unresolved } { 3400:0510 }
            begin { routine anchor; statement location unresolved } { 3400:0510 }
              local_109 := ((P_ShortInt((local_10f + $32)))^ - (P_ShortInt((local_10f + $B1)))^); { routine anchor; statement location unresolved } { 3400:0510 }
            end; { routine anchor; statement location unresolved } { 3400:0510 }
          else { routine anchor; statement location unresolved } { 3400:0510 }
            begin { routine anchor; statement location unresolved } { 3400:0510 }
              local_109 := 0; { routine anchor; statement location unresolved } { 3400:0510 }
            end; { routine anchor; statement location unresolved } { 3400:0510 }
          local_10a := 0; { routine anchor; statement location unresolved } { 3400:0510 }
          if ($D < (P_Byte((local_10f + $14)))^) then { routine anchor; statement location unresolved } { 3400:0510 }
            begin { routine anchor; statement location unresolved } { 3400:0510 }
              local_10b := 0; { routine anchor; statement location unresolved } { 3400:0510 }
              while true do { routine anchor; statement location unresolved } { 3400:0510 }
                begin { routine anchor; statement location unresolved } { 3400:0510 }
                  if (0 < (P_ShortInt(((local_10f + local_10b) + $96)))^) then { routine anchor; statement location unresolved } { 3400:0510 }
                    begin { routine anchor; statement location unresolved } { 3400:0510 }
                      if (local_10b = 2) then { routine anchor; statement location unresolved } { 3400:0510 }
                        begin { routine anchor; statement location unresolved } { 3400:0510 }
                          local_10a := (local_10a + (((P_ShortInt((local_10f + $14)))^ + -($E)) * (P_ShortInt((local_10f + $98)))^)); { routine anchor; statement location unresolved } { 3400:0510 }
                        end; { routine anchor; statement location unresolved } { 3400:0510 }
                      else { routine anchor; statement location unresolved } { 3400:0510 }
                        if ((P_Byte((local_10f + $14)))^ < $10) then { routine anchor; statement location unresolved } { 3400:0510 }
                          begin { routine anchor; statement location unresolved } { 3400:0510 }
                            local_10a := (local_10a + (P_ShortInt(((local_10f + local_10b) + $96)))^); { routine anchor; statement location unresolved } { 3400:0510 }
                          end; { routine anchor; statement location unresolved } { 3400:0510 }
                        else { routine anchor; statement location unresolved } { 3400:0510 }
                          begin { routine anchor; statement location unresolved } { 3400:0510 }
                            local_10a := (local_10a + ((P_ShortInt(((local_10f + local_10b) + $96)))^ * 2)); { routine anchor; statement location unresolved } { 3400:0510 }
                          end; { routine anchor; statement location unresolved } { 3400:0510 }
                    end; { routine anchor; statement location unresolved } { 3400:0510 }
                  if (local_10b = 7) then { routine anchor; statement location unresolved } { 3400:0510 }
                    Break; { routine anchor; statement location unresolved } { 3400:0510 }
                  local_10b := (local_10b + 1); { routine anchor; statement location unresolved } { 3400:0510 }
                end; { routine anchor; statement location unresolved } { 3400:0510 }
              if (local_10a <> 0) then { routine anchor; statement location unresolved } { 3400:0510 }
                begin { routine anchor; statement location unresolved } { 3400:0510 }
                  local_109 := (local_109 div local_10a); { routine anchor; statement location unresolved } { 3400:0510 }
                end; { routine anchor; statement location unresolved } { 3400:0510 }
              if (((P_Byte((local_10f + $14)))^ < $11) or else (0 < (P_ShortInt((local_10f + $98)))^)) then { routine anchor; statement location unresolved } { 3400:0510 }
                begin { routine anchor; statement location unresolved } { 3400:0510 }
                  (P_ShortInt((local_10f + $32)))^ := ((P_ShortInt((local_10f + $32)))^ - local_109); { routine anchor; statement location unresolved } { 3400:0510 }
                end; { routine anchor; statement location unresolved } { 3400:0510 }
            end; { routine anchor; statement location unresolved } { 3400:0510 }
        end; { routine anchor; statement location unresolved } { 3400:0510 }
    end; { routine anchor; statement location unresolved } { 3400:0510 }
  Exit; { 3400:072D }
end; { routine anchor; statement location unresolved } { 3400:0510 }
```

### ov04:0751 TempleNeutralizePoison (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_11a: Byte [BP-$118]; local_119: array[0..16] of Byte [BP-$117]; local_108: ShortInt [BP-$106]; local_107: ShortInt [BP-$105]; local_106: Byte [BP-$104]; local_6: array[0..3] of Byte [BP-$4].  
Callers (export): FUN_3400_09d7.  
Callees (export): FUN_00ba_2199, ConfirmCureAnyway, ChargeTempleCure, System.@StrCopy, ov24_0026.

Neutralize Poison costs 1000; checks effect $37 and removes $37/$16/$0F under g_681F.

```pascal
procedure TempleNeutralizePoison(); { 3400:0751 }
begin { routine anchor; statement location unresolved } { 3400:0751 }
  local_108 := 0; { routine anchor; statement location unresolved } { 3400:0751 }
  local_106 := 0; { routine anchor; statement location unresolved } { 3400:0751 }
  local_107 := 89; { routine anchor; statement location unresolved } { 3400:0751 }
  uVar2 := $BA; { routine anchor; statement location unresolved } { 3400:0751 }
  cVar1 := FUN_00ba_2199(local_6, SS, $37, SelectedChar, g_5D94); { 3400:0777 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 3400:0751 }
    begin { routine anchor; statement location unresolved } { 3400:0751 }
      local_108 := 1; { routine anchor; statement location unresolved } { 3400:0751 }
    end; { routine anchor; statement location unresolved } { 3400:0751 }
  if (local_108 = 0) then { routine anchor; statement location unresolved } { 3400:0751 }
    begin { routine anchor; statement location unresolved } { 3400:0751 }
      puVar3 := local_119; { routine anchor; statement location unresolved } { 3400:0751 }
      uVar2 := $AF8; { routine anchor; statement location unresolved } { 3400:0751 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 3400:0751 }
      PString(local_119, SS) := 'is not poisoned.'; { 3400:0797 }
      local_107 := ConfirmCureAnyway(puVar3, uVar4); { 3400:079D }
    end; { routine anchor; statement location unresolved } { 3400:0751 }
  if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:0751 }
    begin { routine anchor; statement location unresolved } { 3400:0751 }
      puVar3 := @(local_11a); { routine anchor; statement location unresolved } { 3400:0751 }
      PString(local_11a, SS) := 'Neutralize Poison'; { 3400:07B6 }
      local_107 := ChargeTempleCure(1000, puVar3, SS); { 3400:07C0 }
      if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:0751 }
        begin { routine anchor; statement location unresolved } { 3400:0751 }
          g_681F := 1; { 3400:07CE }
          ov24_0026(0, 0, $37, SelectedChar, g_5D94); { 3400:07E4 }
          ov24_0026(0, 0, Pack16(UNKNOWN_extraout_AH, $16), SelectedChar, g_5D94); { 3400:07FA }
          ov24_0026(0, 0, Pack16(UNKNOWN_extraout_AH_00, $F), SelectedChar, g_5D94); { 3400:0810 }
          g_681F := 0; { 3400:0815 }
        end; { routine anchor; statement location unresolved } { 3400:0751 }
    end; { routine anchor; statement location unresolved } { 3400:0751 }
  Exit; { 3400:081D }
end; { routine anchor; statement location unresolved } { 3400:0751 }
```

### ov04:083A TempleRemoveCurse (conf M)

Params (BP stack slots): none.  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; local_11b: array[0..1] of Byte [BP-$119]; local_119: array[0..12] of Byte [BP-$117]; local_10c: ShortInt [BP-$10A]; local_10b: Byte [BP-$109]; local_b: array[0..3] of Byte [BP-$9]; local_7: Word [BP-$5]; uStack_5: Word [BP-$3]; local_3: ShortInt [BP-$1].  
Callers (export): FUN_3400_09d7.  
Callees (export): FUN_00ba_2199, ConfirmCureAnyway, ChargeTempleCure, System.@StrCopy, RemoveCurseEffect.

Remove Curse costs 3500; scans item +36 or effect $24; assigns current target from selected actor then invokes ov22 entry 9 (Remove Curse).

```pascal
procedure TempleRemoveCurse(); { 3400:083A }
begin { routine anchor; statement location unresolved } { 3400:083A }
  uVar5 := $3400; { routine anchor; statement location unresolved } { 3400:083A }
  local_10b := 0; { routine anchor; statement location unresolved } { 3400:083A }
  local_10c := 89; { routine anchor; statement location unresolved } { 3400:083A }
  local_3 := 0; { 3400:084B }
  uVar4 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 3400:083A }
  iVar3 := Integer(_SelectedChar); { routine anchor; statement location unresolved } { 3400:083A }
  uStack_5 := (P_Word((iVar3 + $CA)))^; { 3400:0860 }
  local_7 := (P_Word((iVar3 + 200)))^; { 3400:085D }
  while (((local_7 or uStack_5) <> 0) and then (local_3 = 0)) do { routine anchor; statement location unresolved } { 3400:083A }
    begin { routine anchor; statement location unresolved } { 3400:083A }
      if ((P_ShortInt((local_7 + $36)))^ <> 0) then { routine anchor; statement location unresolved } { 3400:083A }
        begin { routine anchor; statement location unresolved } { 3400:083A }
          local_3 := 1; { 3400:087B }
        end; { routine anchor; statement location unresolved } { 3400:083A }
      puVar1 := P_Word((local_7 + $2A)); { routine anchor; statement location unresolved } { 3400:083A }
      uStack_5 := (P_Word((local_7 + $2C)))^; { 3400:088D }
      local_7 := (puVar1)^; { 3400:088A }
    end; { routine anchor; statement location unresolved } { 3400:083A }
  if (local_3 = 0) then { routine anchor; statement location unresolved } { 3400:083A }
    begin { routine anchor; statement location unresolved } { 3400:083A }
      uVar5 := $BA; { routine anchor; statement location unresolved } { 3400:083A }
      cVar2 := FUN_00ba_2199(local_b, SS, Pack16(ShortInt(((local_7 or uStack_5) shr 8)), $24), iVar3, uVar4); { 3400:08A8 }
      if (cVar2 = 0) then { routine anchor; statement location unresolved } { 3400:083A }
        begin { routine anchor; statement location unresolved } { 3400:083A }
          puVar6 := local_11b; { routine anchor; statement location unresolved } { 3400:083A }
          uVar5 := $AF8; { routine anchor; statement location unresolved } { 3400:083A }
          uVar4 := SS; { routine anchor; statement location unresolved } { 3400:083A }
          PString(local_11b, SS) := 'is not cursed.'; { 3400:08BC }
          local_10c := ConfirmCureAnyway(puVar6, uVar4); { 3400:08C2 }
        end; { routine anchor; statement location unresolved } { 3400:083A }
    end; { routine anchor; statement location unresolved } { 3400:083A }
  if (local_10c = 89) then { routine anchor; statement location unresolved } { 3400:083A }
    begin { routine anchor; statement location unresolved } { 3400:083A }
      puVar6 := local_119; { routine anchor; statement location unresolved } { 3400:083A }
      PString(local_119, SS) := 'Remove Curse'; { 3400:08DB }
      local_10c := ChargeTempleCure($DAC, puVar6, SS); { 3400:08E5 }
      if (local_10c = 89) then { routine anchor; statement location unresolved } { 3400:083A }
        begin { routine anchor; statement location unresolved } { 3400:083A }
          g_6C95 := SelectedChar; { 3400:08FA }
          g_6C97 := g_5D94; { 3400:08FD }
          RemoveCurseEffect(); { 3400:0901 }
        end; { routine anchor; statement location unresolved } { 3400:083A }
    end; { routine anchor; statement location unresolved } { 3400:083A }
  Exit; { 3400:0909 }
end; { routine anchor; statement location unresolved } { 3400:083A }
```

### ov04:0928 TempleStoneToFlesh (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_116: array[0..14] of Byte [BP-$114]; local_107: ShortInt [BP-$105]; local_106: Byte [BP-$104].  
Callers (export): FUN_3400_09d7.  
Callees (export): ConfirmCureAnyway, ChargeTempleCure, System.@StrCopy.

Stone to Flesh costs 2000. Status 7 becomes 0, active=1, HP=1 only if actually stoned; cast-anyway can still charge without changing a healthy actor.

```pascal
procedure TempleStoneToFlesh(); { 3400:0928 }
begin { routine anchor; statement location unresolved } { 3400:0928 }
  uVar2 := $3400; { routine anchor; statement location unresolved } { 3400:0928 }
  local_106 := 0; { routine anchor; statement location unresolved } { 3400:0928 }
  local_107 := 89; { routine anchor; statement location unresolved } { 3400:0928 }
  if ((P_ShortInt((Integer(_SelectedChar) + $10C)))^ <> 7) then { routine anchor; statement location unresolved } { 3400:0928 }
    begin { routine anchor; statement location unresolved } { 3400:0928 }
      puVar3 := local_116; { routine anchor; statement location unresolved } { 3400:0928 }
      uVar2 := $AF8; { routine anchor; statement location unresolved } { 3400:0928 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 3400:0928 }
      PString(local_116, SS) := 'is not stoned.'; { 3400:0950 }
      local_107 := ConfirmCureAnyway(puVar3, uVar4); { 3400:0956 }
    end; { routine anchor; statement location unresolved } { 3400:0928 }
  if (local_107 = 89) then { routine anchor; statement location unresolved } { 3400:0928 }
    begin { routine anchor; statement location unresolved } { 3400:0928 }
      puVar3 := local_116; { routine anchor; statement location unresolved } { 3400:0928 }
      PString(local_116, SS) := 'Stone to Flesh'; { 3400:096F }
      cVar1 := ChargeTempleCure(2000, puVar3, SS); { 3400:0979 }
      if ((cVar1 = 89) and then Sequence((uVar2 := Word((LongWord(_SelectedChar) shr $10))); ((P_ShortInt((Integer(_SelectedChar) + $10C)))^ = 7))) then { routine anchor; statement location unresolved } { 3400:0928 }
        begin { routine anchor; statement location unresolved } { 3400:0928 }
          (P_Byte((Integer(_SelectedChar) + $10C)))^ := 0; { routine anchor; statement location unresolved } { 3400:0928 }
          (P_Byte((Integer(_SelectedChar) + $10D)))^ := 1; { routine anchor; statement location unresolved } { 3400:0928 }
          (P_Byte((Integer(_SelectedChar) + $11B)))^ := 1; { routine anchor; statement location unresolved } { 3400:0928 }
        end; { routine anchor; statement location unresolved } { 3400:0928 }
    end; { routine anchor; statement location unresolved } { 3400:0928 }
  Exit; { 3400:09B4 }
end; { routine anchor; statement location unresolved } { 3400:0928 }
```

### ov04:09D7 TempleHealingMenu (conf M)

Params (BP stack slots): none.  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; local_139: array[0..244] of Byte [BP-$137]; local_44: array[0..9] of Byte [BP-$42]; local_3a: Byte [BP-$38]; local_39: ShortInt [BP-$37]; local_38: array[0..40] of Byte [BP-$36]; local_f: ShortInt [BP-$D]; local_e: Integer [BP-$C]; local_c: Byte [BP-$A]; local_b: Byte [BP-$9]; local_a: Word [BP-$8]; local_8: Integer [BP-$6]; local_6: Word [BP-$4]; iStack_4: Integer [BP-$2].  
Callers (export): ov04_0D09.  
Callees (export): FUN_00ba_0767, FUN_00ba_27d9, FUN_03f1_02e8, FUN_0709_0626, FUN_0709_0dd3, TempleCureBlindness, TempleCureDisease, TempleCureWounds, TempleRaiseDead, TempleNeutralizePoison, TempleRemoveCurse, TempleStoneToFlesh, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov25_0D9A, ov25_1140, ov25_11F3.

```pascal
procedure TempleHealingMenu(); { 3400:09D7 }
begin { routine anchor; statement location unresolved } { 3400:09D7 }
  local_f := 0; { 3400:09DE }
  local_6 := 0; { 3400:09E4 }
  iStack_4 := 0; { 3400:09E7 }
  local_a := 0; { 3400:09EC }
  local_8 := 0; { 3400:09EF }
  ov25_1140(@(local_6), SS, 10); { 3400:09FB }
  local_a := local_6; { 3400:0A06 }
  local_8 := iStack_4; { 3400:0A09 }
  local_c := 1; { 3400:0A0C }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3400:09D7 }
    begin { routine anchor; statement location unresolved } { 3400:09D7 }
      PString(local_6, iStack_4) := Copy(PString(((Word(local_c) * $29) + $F1), $C7C), 1, $28); { 3400:0A33 }
      (P_Byte((local_6 + $29)))^ := 0; { routine anchor; statement location unresolved } { 3400:09D7 }
      puVar1 := P_Word((local_6 + $2A)); { routine anchor; statement location unresolved } { 3400:09D7 }
      iStack_4 := (P_Integer((local_6 + $2C)))^; { 3400:0A4E }
      local_c := (local_c + 1); { 3400:0A51 }
      local_6 := (puVar1)^; { 3400:0A4B }
    end; { routine anchor; statement location unresolved } { 3400:09D7 }
  _local_6 := FarBits(local_8, local_a); { routine anchor; statement location unresolved } { 3400:09D7 }
  FUN_0709_0dd3($18, $27, $18, (local_a and $FF00)); { 3400:0A6E }
  local_b := 1; { 3400:0A73 }
  uVar2 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar3 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar4 := Pack16(UNKNOWN_extraout_AH, $26); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar5 := Pack16(UNKNOWN_extraout_AH, $16); { routine anchor; statement location unresolved } { 3400:09D7 }
  iVar6 := (Word(UNKNOWN_extraout_AH) shl 8); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar7 := Pack16(UNKNOWN_extraout_AH, $F); { routine anchor; statement location unresolved } { 3400:09D7 }
  puVar8 := @(local_3a); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar9 := SS; { routine anchor; statement location unresolved } { 3400:09D7 }
  PString(local_3a, SS) := ''; { 3400:0A93 }
  FUN_03f1_02e8(puVar8, uVar9, uVar7, iVar6, uVar5, uVar4, uVar3, uVar2); { 3400:0A98 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar4 := Pack16(UNKNOWN_extraout_AH_00, $26); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar5 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 3400:09D7 }
  iVar6 := (Word(UNKNOWN_extraout_AH_00) shl 8); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar7 := Pack16(UNKNOWN_extraout_AH_00, $F); { routine anchor; statement location unresolved } { 3400:09D7 }
  puVar8 := @(local_3a); { routine anchor; statement location unresolved } { 3400:09D7 }
  uVar9 := SS; { routine anchor; statement location unresolved } { 3400:09D7 }
  PString(local_3a, SS) := ''; { 3400:0AB9 }
  FUN_03f1_02e8(puVar8, uVar9, uVar7, iVar6, uVar5, uVar4, uVar3, uVar2); { 3400:0ABE }
  repeat { routine anchor; statement location unresolved } { 3400:09D7 }
    begin { routine anchor; statement location unresolved } { 3400:09D7 }
      puVar8 := local_139; { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar9 := SS; { routine anchor; statement location unresolved } { 3400:09D7 }
      PString(local_139, SS) := PString(Integer(_SelectedChar), Integer((LongWord(_SelectedChar) shr $10))); { 3400:0ACF }
      PString(local_139, SS) := Copy(PString(local_139, SS) + ', how can we help you?', 1, 255); { 3400:0AD9 }
      PString(local_38, SS) := Copy(PString(puVar8, uVar9), 1, $28); { 3400:0AE7 }
      FUN_0709_0626(local_38, SS, Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 1), Pack16(UNKNOWN_extraout_AH_01, 1)); { 3400:0AFA }
      uVar2 := Pack16(UNKNOWN_extraout_AH_02, 1); { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar3 := Pack16(UNKNOWN_extraout_AH_02, $11); { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar4 := Pack16(UNKNOWN_extraout_AH_02, $26); { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar5 := Pack16(UNKNOWN_extraout_AH_02, $16); { routine anchor; statement location unresolved } { 3400:09D7 }
      iVar6 := (Word(UNKNOWN_extraout_AH_02) shl 8); { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar7 := Pack16(UNKNOWN_extraout_AH_02, $F); { routine anchor; statement location unresolved } { 3400:09D7 }
      puVar8 := @(local_3a); { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar9 := SS; { routine anchor; statement location unresolved } { 3400:09D7 }
      PString(local_3a, SS) := ''; { 3400:0B1B }
      FUN_03f1_02e8(puVar8, uVar9, uVar7, iVar6, uVar5, uVar4, uVar3, uVar2); { 3400:0B20 }
      puVar8 := @(local_3a); { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar2 := SS; { routine anchor; statement location unresolved } { 3400:09D7 }
      PString(local_3a, SS) := ''; { 3400:0B2F }
      puVar10 := local_44; { routine anchor; statement location unresolved } { 3400:09D7 }
      uVar9 := SS; { routine anchor; statement location unresolved } { 3400:09D7 }
      PString(local_44, SS) := 'Heal Exit'; { 3400:0B3E }
      local_39 := ov25_0D9A(@(local_a), SS, @(local_e), SS, @(local_b), SS, (Word(UNKNOWN_extraout_AH_03) shl 8), local_6, iStack_4, Pack16(UNKNOWN_extraout_AH_03, $F), Pack16(UNKNOWN_extraout_AH_03, $26), Pack16(UNKNOWN_extraout_AH_03, 4), Pack16(UNKNOWN_extraout_AH_03, 2), Pack16(UNKNOWN_extraout_AH_03, $F), Pack16(UNKNOWN_extraout_AH_03, 10), Pack16(UNKNOWN_extraout_AH_03, $D), puVar10, uVar9, puVar8, uVar2); { 3400:0B70 }
      if ((local_39 = 72) or else (local_39 = 13)) then { routine anchor; statement location unresolved } { 3400:09D7 }
        begin { routine anchor; statement location unresolved } { 3400:09D7 }
          if (local_e = 0) then { routine anchor; statement location unresolved } { 3400:09D7 }
            begin { routine anchor; statement location unresolved } { 3400:09D7 }
              TempleCureBlindness(); { 3400:0B8C }
            end; { routine anchor; statement location unresolved } { 3400:09D7 }
          else { routine anchor; statement location unresolved } { 3400:09D7 }
            if (local_e = 1) then { routine anchor; statement location unresolved } { 3400:09D7 }
              begin { routine anchor; statement location unresolved } { 3400:09D7 }
                TempleCureDisease(); { 3400:0B97 }
              end; { routine anchor; statement location unresolved } { 3400:09D7 }
            else { routine anchor; statement location unresolved } { 3400:09D7 }
              if (local_e = 2) then { routine anchor; statement location unresolved } { 3400:09D7 }
                begin { routine anchor; statement location unresolved } { 3400:09D7 }
                  TempleCureWounds(1); { 3400:0BA5 }
                end; { routine anchor; statement location unresolved } { 3400:09D7 }
              else { routine anchor; statement location unresolved } { 3400:09D7 }
                if (local_e = 3) then { routine anchor; statement location unresolved } { 3400:09D7 }
                  begin { routine anchor; statement location unresolved } { 3400:09D7 }
                    TempleCureWounds(2); { 3400:0BB3 }
                  end; { routine anchor; statement location unresolved } { 3400:09D7 }
                else { routine anchor; statement location unresolved } { 3400:09D7 }
                  if (local_e = 4) then { routine anchor; statement location unresolved } { 3400:09D7 }
                    begin { routine anchor; statement location unresolved } { 3400:09D7 }
                      TempleCureWounds(3); { 3400:0BC1 }
                    end; { routine anchor; statement location unresolved } { 3400:09D7 }
                  else { routine anchor; statement location unresolved } { 3400:09D7 }
                    if (local_e = 5) then { routine anchor; statement location unresolved } { 3400:09D7 }
                      begin { routine anchor; statement location unresolved } { 3400:09D7 }
                        TempleNeutralizePoison(); { 3400:0BCC }
                      end; { routine anchor; statement location unresolved } { 3400:09D7 }
                    else { routine anchor; statement location unresolved } { 3400:09D7 }
                      if (local_e = 6) then { routine anchor; statement location unresolved } { 3400:09D7 }
                        begin { routine anchor; statement location unresolved } { 3400:09D7 }
                          TempleRaiseDead(); { 3400:0BD7 }
                        end; { routine anchor; statement location unresolved } { 3400:09D7 }
                      else { routine anchor; statement location unresolved } { 3400:09D7 }
                        if (local_e = 7) then { routine anchor; statement location unresolved } { 3400:09D7 }
                          begin { routine anchor; statement location unresolved } { 3400:09D7 }
                            TempleRemoveCurse(); { 3400:0BE2 }
                          end; { routine anchor; statement location unresolved } { 3400:09D7 }
                        else { routine anchor; statement location unresolved } { 3400:09D7 }
                          if (local_e = 8) then { routine anchor; statement location unresolved } { 3400:09D7 }
                            begin { routine anchor; statement location unresolved } { 3400:09D7 }
                              TempleStoneToFlesh(); { 3400:0BED }
                            end; { routine anchor; statement location unresolved } { 3400:09D7 }
                          else { routine anchor; statement location unresolved } { 3400:09D7 }
                            if (local_e = 9) then { routine anchor; statement location unresolved } { 3400:09D7 }
                              begin { routine anchor; statement location unresolved } { 3400:09D7 }
                                local_f := 1; { 3400:0BF7 }
                              end; { routine anchor; statement location unresolved } { 3400:09D7 }
        end; { routine anchor; statement location unresolved } { 3400:09D7 }
      else { routine anchor; statement location unresolved } { 3400:09D7 }
        if (local_39 = 0) then { routine anchor; statement location unresolved } { 3400:09D7 }
          begin { routine anchor; statement location unresolved } { 3400:09D7 }
            local_f := 1; { 3400:0C01 }
          end; { routine anchor; statement location unresolved } { 3400:09D7 }
    end; { routine anchor; statement location unresolved } { 3400:09D7 }
  until not ((local_f = 0)); { routine anchor; statement location unresolved } { 3400:09D7 }
  ov25_11F3(@(local_6), SS); { 3400:0C13 }
  FUN_0709_0dd3(Pack16(UNKNOWN_extraout_AH_04, $18), Pack16(UNKNOWN_extraout_AH_04, $27), (Word(UNKNOWN_extraout_AH_04) shl 8), (Word(UNKNOWN_extraout_AH_04) shl 8)); { 3400:0C24 }
  FUN_00ba_27d9(); { 3400:0C29 }
  FUN_00ba_0767(SelectedChar, g_5D94); { 3400:0C36 }
  Exit; { 3400:0C3E }
end; { routine anchor; statement location unresolved } { 3400:09D7 }
```

### ov04:0D09 TempleMenu (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_7d: array[0..26] of Byte [BP-$7B]; local_62: array[0..46] of Byte [BP-$60]; local_33: Byte [BP-$31]; local_32: ShortInt [BP-$30]; local_31: ShortInt [BP-$2F]; local_30: Byte [BP-$2E]; local_2f: ShortInt [BP-$2D]; local_2e: array[0..40] of Byte [BP-$2C]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_0767, FUN_00ba_27d9, FUN_0709_0768, FUN_0709_0dd3, TempleHealingMenu, MenuSelect, System.@StrAssign, System.@StrCopy, System.FillChar, ov19_0AB3, ov19_27DF, ov21_0508, ov21_063A, ov21_0CEB, ov21_0F7E, ov21_19B2, ov25_03BD.

```pascal
procedure TempleMenu(); { 3400:0D09 }
begin { routine anchor; statement location unresolved } { 3400:0D09 }
  g_49F3 := 1; { 3400:0D0F }
  FUN_00ba_27d9(); { 3400:0D14 }
  FUN_00ba_0767(SelectedChar, g_5D94); { 3400:0D21 }
  FillChar(MemRef(P_Word(@(TreasureMoney)), $C7C), $1C, 0); { 3400:0D32 }
  g_6DC0 := 0; { 3400:0D37 }
  local_4 := 0; { 3400:0D3C }
  repeat { routine anchor; statement location unresolved } { 3400:0D09 }
    begin { routine anchor; statement location unresolved } { 3400:0D09 }
      ov21_0F7E(@(local_30), SS, @(local_2f), SS); { 3400:0D4A }
      if (local_2f = 0) then { routine anchor; statement location unresolved } { 3400:0D09 }
        begin { routine anchor; statement location unresolved } { 3400:0D09 }
          PString(local_2e, SS) := Copy('Heal View Pool Appraise Exit', 1, $28); { 3400:0D63 }
        end; { routine anchor; statement location unresolved } { 3400:0D09 }
      else { routine anchor; statement location unresolved } { 3400:0D09 }
        begin { routine anchor; statement location unresolved } { 3400:0D09 }
          PString(local_2e, SS) := Copy('Heal View Take Pool Share Appraise Exit', 1, $28); { 3400:0D78 }
        end; { routine anchor; statement location unresolved } { 3400:0D09 }
      puVar8 := @(local_33); { routine anchor; statement location unresolved } { 3400:0D09 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 3400:0D09 }
      PString(local_33, SS) := ''; { 3400:0D87 }
      uVar1 := ov25_03BD(@(local_5), SS, (Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), local_2e, SS, puVar8, uVar1); { 3400:0DA5 }
      local_3 := ShortInt(uVar1); { 3400:0DAA }
      if (local_3 = 72) then { routine anchor; statement location unresolved } { 3400:0D09 }
        begin { routine anchor; statement location unresolved } { 3400:0D09 }
          if (local_5 = 0) then { routine anchor; statement location unresolved } { 3400:0D09 }
            begin { routine anchor; statement location unresolved } { 3400:0D09 }
              TempleHealingMenu(); { 3400:0DBB }
            end; { routine anchor; statement location unresolved } { 3400:0D09 }
        end; { routine anchor; statement location unresolved } { 3400:0D09 }
      else { routine anchor; statement location unresolved } { 3400:0D09 }
        if (local_3 = 86) then { routine anchor; statement location unresolved } { 3400:0D09 }
          begin { routine anchor; statement location unresolved } { 3400:0D09 }
            ov19_0AB3(@(local_5), SS); { 3400:0DCA }
          end; { routine anchor; statement location unresolved } { 3400:0D09 }
        else { routine anchor; statement location unresolved } { 3400:0D09 }
          if (local_3 = 84) then { routine anchor; statement location unresolved } { 3400:0D09 }
            begin { routine anchor; statement location unresolved } { 3400:0D09 }
              ov21_0CEB(); { 3400:0DD6 }
            end; { routine anchor; statement location unresolved } { 3400:0D09 }
          else { routine anchor; statement location unresolved } { 3400:0D09 }
            if (local_3 = 80) then { routine anchor; statement location unresolved } { 3400:0D09 }
              begin { routine anchor; statement location unresolved } { 3400:0D09 }
                if (local_5 = 0) then { routine anchor; statement location unresolved } { 3400:0D09 }
                  begin { routine anchor; statement location unresolved } { 3400:0D09 }
                    ov21_0508(); { 3400:0DE8 }
                  end; { routine anchor; statement location unresolved } { 3400:0D09 }
              end; { routine anchor; statement location unresolved } { 3400:0D09 }
            else { routine anchor; statement location unresolved } { 3400:0D09 }
              if (local_3 = 83) then { routine anchor; statement location unresolved } { 3400:0D09 }
                begin { routine anchor; statement location unresolved } { 3400:0D09 }
                  ov21_063A(); { 3400:0DF4 }
                end; { routine anchor; statement location unresolved } { 3400:0D09 }
              else { routine anchor; statement location unresolved } { 3400:0D09 }
                if (local_3 = 65) then { routine anchor; statement location unresolved } { 3400:0D09 }
                  begin { routine anchor; statement location unresolved } { 3400:0D09 }
                    ov21_19B2(@(local_32), SS); { 3400:0E05 }
                  end; { routine anchor; statement location unresolved } { 3400:0D09 }
                else { routine anchor; statement location unresolved } { 3400:0D09 }
                  if (local_3 = 69) then { routine anchor; statement location unresolved } { 3400:0D09 }
                    begin { routine anchor; statement location unresolved } { 3400:0D09 }
                      ov21_0F7E(@(local_30), SS, @(local_2f), SS); { 3400:0E1E }
                      if (local_2f = 0) then { routine anchor; statement location unresolved } { 3400:0D09 }
                        begin { routine anchor; statement location unresolved } { 3400:0D09 }
                          local_4 := 1; { 3400:0EBC }
                        end; { routine anchor; statement location unresolved } { 3400:0D09 }
                      else { routine anchor; statement location unresolved } { 3400:0D09 }
                        begin { routine anchor; statement location unresolved } { 3400:0D09 }
                          PString(local_2e, SS) := Copy('~Yes ~No', 1, $28); { 3400:0E3A }
                          uVar2 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar3 := Pack16(UNKNOWN_extraout_AH_00, $11); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar4 := Pack16(UNKNOWN_extraout_AH_00, $26); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar5 := Pack16(UNKNOWN_extraout_AH_00, $16); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar6 := Pack16(UNKNOWN_extraout_AH_00, 10); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar7 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 3400:0D09 }
                          puVar8 := local_7d; { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar1 := SS; { routine anchor; statement location unresolved } { 3400:0D09 }
                          PString(local_7d, SS) := 'As you leave a priest says, "Excuse me but you have left some money here" '; { 3400:0E5B }
                          FUN_0709_0768(puVar8, uVar1, uVar7, uVar6, uVar5, uVar4, uVar3, uVar2); { 3400:0E60 }
                          uVar2 := Pack16(UNKNOWN_extraout_AH_01, 1); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar3 := Pack16(UNKNOWN_extraout_AH_01, $11); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar4 := Pack16(UNKNOWN_extraout_AH_01, $26); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar5 := Pack16(UNKNOWN_extraout_AH_01, $16); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar6 := Pack16(UNKNOWN_extraout_AH_01, 10); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar7 := Pack16(UNKNOWN_extraout_AH_01, 1); { routine anchor; statement location unresolved } { 3400:0D09 }
                          puVar8 := local_62; { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar1 := SS; { routine anchor; statement location unresolved } { 3400:0D09 }
                          PString(local_62, SS) := 'Do you want to go back and retrieve your money?'; { 3400:0E81 }
                          FUN_0709_0768(puVar8, uVar1, uVar7, uVar6, uVar5, uVar4, uVar3, uVar2); { 3400:0E86 }
                          puVar8 := @(local_33); { routine anchor; statement location unresolved } { 3400:0D09 }
                          uVar1 := SS; { routine anchor; statement location unresolved } { 3400:0D09 }
                          PString(local_33, SS) := ''; { 3400:0E95 }
                          local_31 := MenuSelect((Word(UNKNOWN_extraout_AH_02) shl 8), (Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, $F), Pack16(UNKNOWN_extraout_AH_02, 10), Pack16(UNKNOWN_extraout_AH_02, $D), local_2e, SS, puVar8, uVar1); { 3400:0EAE }
                          if (local_31 = 1) then { routine anchor; statement location unresolved } { 3400:0D09 }
                            begin { routine anchor; statement location unresolved } { 3400:0D09 }
                              local_4 := 1; { 3400:0ED5 }
                            end; { routine anchor; statement location unresolved } { 3400:0D09 }
                          else { routine anchor; statement location unresolved } { 3400:0D09 }
                            begin { routine anchor; statement location unresolved } { 3400:0D09 }
                              FUN_0709_0dd3($16, $26, $11, 1); { 3400:0ECE }
                            end; { routine anchor; statement location unresolved } { 3400:0D09 }
                        end; { routine anchor; statement location unresolved } { 3400:0D09 }
                    end; { routine anchor; statement location unresolved } { 3400:0D09 }
                  else { routine anchor; statement location unresolved } { 3400:0D09 }
                    if (local_3 = 71) then { routine anchor; statement location unresolved } { 3400:0D09 }
                      begin { routine anchor; statement location unresolved } { 3400:0D09 }
                        ov19_27DF(uVar1); { 3400:0EE3 }
                      end; { routine anchor; statement location unresolved } { 3400:0D09 }
                    else { routine anchor; statement location unresolved } { 3400:0D09 }
                      if (local_3 = 79) then { routine anchor; statement location unresolved } { 3400:0D09 }
                        begin { routine anchor; statement location unresolved } { 3400:0D09 }
                          ov19_27DF(uVar1); { 3400:0EF2 }
                        end; { routine anchor; statement location unresolved } { 3400:0D09 }
      if ((local_3 = 66) or else (local_3 = 84)) then { routine anchor; statement location unresolved } { 3400:0D09 }
        begin { routine anchor; statement location unresolved } { 3400:0D09 }
          FUN_00ba_27d9(); { 3400:0F02 }
        end; { routine anchor; statement location unresolved } { 3400:0D09 }
      else { routine anchor; statement location unresolved } { 3400:0D09 }
        if ((local_3 = 65) and then (local_32 <> 0)) then { routine anchor; statement location unresolved } { 3400:0D09 }
          begin { routine anchor; statement location unresolved } { 3400:0D09 }
            FUN_00ba_27d9(); { 3400:0F13 }
          end; { routine anchor; statement location unresolved } { 3400:0D09 }
      FUN_00ba_0767(SelectedChar, g_5D94); { 3400:0F20 }
    end; { routine anchor; statement location unresolved } { 3400:0D09 }
  until not ((local_4 = 0)); { routine anchor; statement location unresolved } { 3400:0D09 }
  Exit; { 3400:0F31 }
end; { routine anchor; statement location unresolved } { 3400:0D09 }
```

### ov04:0F32 ov04_init (conf H)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

```pascal
procedure ov04_init(); { 3400:0F32 }
begin { routine anchor; statement location unresolved } { 3400:0F32 }
  Exit; { 3400:0F36 }
end; { routine anchor; statement location unresolved } { 3400:0F32 }
```

### ov08:0000 FreeCombatState (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot].  
Callers (export): ov08_007A.  
Callees (export): FUN_0464_2595, System.FreeMem, ov31_0105.

```pascal
procedure FreeCombatState(); { 4800:0000 }
begin { routine anchor; statement location unresolved } { 4800:0000 }
  while ((g_6DBB <> 0) or else (PackedAlias(g_6DBD) <> 0)) do { routine anchor; statement location unresolved } { 4800:0000 }
    begin { routine anchor; statement location unresolved } { 4800:0000 }
      uVar1 := (P_Word((g_6DBB + 4)))^; { routine anchor; statement location unresolved } { 4800:0000 }
      uVar2 := (P_Word((g_6DBB + 6)))^; { routine anchor; statement location unresolved } { 4800:0000 }
      FreeMem(FarPtr(PackedAlias(g_6DBD), g_6DBB), $13); { 4800:002D }
      PackedAlias(g_6DBB) := FarBits(uVar2, uVar1); { routine anchor; statement location unresolved } { 4800:0000 }
    end; { routine anchor; statement location unresolved } { 4800:0000 }
  FreeMem(FarPtr(Slice16(g_6716, 2), Word(g_6716)), $4E9); { 4800:004D }
  Slice16(g_6716, 0) := 0; { routine anchor; statement location unresolved } { 4800:0000 }
  Slice16(g_6716, 2) := 0; { routine anchor; statement location unresolved } { 4800:0000 }
  FUN_0464_2595(P_LongWord(@(g_6E36)), $C7C); { 4800:005F }
  ov31_0105(); { 4800:0064 }
  g_6B84 := $34; { 4800:006F }
  g_6B86 := $96; { 4800:0072 }
  Exit; { 4800:0079 }
end; { routine anchor; statement location unresolved } { 4800:0000 }
```

### ov08:007A CombatLoop (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; local_7: Integer [BP-$5]; iStack_5: Integer [BP-$3]; local_3: ShortInt [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_23db, FreeCombatState, ChooseNextCombatant, TakeCombatTurn, EndCombatRound, ov10_1E31, ov13_0000.

Area correction: this unit is the main combat loop. Sets mode g_49F3=5, initializes through ov10, repeatedly initializes each actor and chooses next turn; end-round cleanup follows and FreeCombatState runs on exit.

```pascal
procedure CombatLoop(); { 4800:007A }
begin { routine anchor; statement location unresolved } { 4800:007A }
  g_49F3 := 5; { 4800:0080 }
  g_6B84 := $66; { 4800:008B }
  g_6B86 := $68; { 4800:008E }
  ov10_1E31(); { 4800:0092 }
  local_3 := 0; { 4800:0097 }
  if ((g_6814 = 0) or else (g_6815 = 0)) then { routine anchor; statement location unresolved } { 4800:007A }
    begin { routine anchor; statement location unresolved } { 4800:007A }
      local_3 := 1; { 4800:00A9 }
    end; { routine anchor; statement location unresolved } { 4800:007A }
  while (local_3 = 0) do { routine anchor; statement location unresolved } { 4800:007A }
    begin { routine anchor; statement location unresolved } { 4800:007A }
      FUN_00ba_23db(); { 4800:00B3 }
      _local_7 := FarBits(g_5D98, PartyHead); { routine anchor; statement location unresolved } { 4800:007A }
      while ((local_7 <> 0) or else (iStack_5 <> 0)) do { routine anchor; statement location unresolved } { 4800:007A }
      begin { routine anchor; statement location unresolved } { 4800:007A }
        begin { routine anchor; statement location unresolved } { 4800:007A }
          ov13_0000(local_7, iStack_5); { 4800:00D3 }
          uVar1 := Word((LongWord(_local_7) shr $10)); { routine anchor; statement location unresolved } { 4800:007A }
        end; { routine anchor; statement location unresolved } { 4800:007A }
        _local_7 := FarBits((P_Word((Integer(_local_7) + $106)))^, (P_Word((Integer(_local_7) + $104)))^); { routine anchor; statement location unresolved } { 4800:007A }
      end; { routine anchor; statement location unresolved } { 4800:007A }
      (P_Word((Integer(ecl_Mem6B00) + $596)))^ := 0; { routine anchor; statement location unresolved } { 4800:007A }
      ChooseNextCombatant(@(local_7), SS); { 4800:00FE }
      while ((local_7 <> 0) or else (iStack_5 <> 0)) do { routine anchor; statement location unresolved } { 4800:007A }
        begin { routine anchor; statement location unresolved } { 4800:007A }
          TakeCombatTurn(local_7, iStack_5); { 4800:0110 }
          ChooseNextCombatant(@(local_7), SS); { 4800:0119 }
        end; { routine anchor; statement location unresolved } { 4800:007A }
      EndCombatRound(@(local_3), SS); { 4800:0124 }
    end; { routine anchor; statement location unresolved } { 4800:007A }
  FreeCombatState(); { 4800:012A }
  Exit; { 4800:0130 }
end; { routine anchor; statement location unresolved } { 4800:007A }
```

### ov08:0131 ChooseNextCombatant (conf M)

Params (BP stack slots): param_1: P_Word [BP+$06].  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_9: Word [BP-$7]; uStack_7: Word [BP-$5]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): ov08_007A.  
Callees (export): Roll.

Chooses actor with greatest current initiative (combat-record +3); tied candidates compare independent d100 rolls. If best initiative stays zero, output pointer becomes nil. Name M; signedness and tie details need exact branch review.

```pascal
procedure ChooseNextCombatant(param_1: P_Word); { 4800:0131 }
begin { routine anchor; statement location unresolved } { 4800:0131 }
  local_3 := 0; { 4800:0137 }
  local_4 := 0; { 4800:013B }
  uStack_7 := g_5D98; { 4800:0149 }
  local_9 := PartyHead; { 4800:0146 }
  while Sequence((uVar4 := Word((LongWord(param_1) shr $10))); ((local_9 or uStack_7) <> 0)) do { routine anchor; statement location unresolved } { 4800:0131 }
    begin { routine anchor; statement location unresolved } { 4800:0131 }
      uVar3 := Byte(((local_9 or uStack_7) shr 8)); { routine anchor; statement location unresolved } { 4800:0131 }
      bVar2 := Roll(Pack16(uVar3, 100), Pack16(uVar3, 1)); { 4800:015D }
      if (Integer(Word(local_3)) < Integer((P_ShortInt((Integer((P_LongWord((local_9 + $108)))^) + 3)))^)) then { routine anchor; statement location unresolved } { 4800:0131 }
        begin { routine anchor; statement location unresolved } { 4800:0131 }
          local_4 := bVar2; { 4800:0180 }
        end; { routine anchor; statement location unresolved } { 4800:0131 }
      if ((Integer(Word(local_3)) <= Integer((P_ShortInt((Integer((P_LongWord((local_9 + $108)))^) + 3)))^)) and then (local_4 <= bVar2)) then { routine anchor; statement location unresolved } { 4800:0131 }
        begin { routine anchor; statement location unresolved } { 4800:0131 }
          local_3 := (P_Byte((Integer((P_LongWord((local_9 + $108)))^) + 3)))^; { 4800:01B5 }
          (param_1)^ := local_9; { routine anchor; statement location unresolved } { 4800:0131 }
          P_Word(param_1)[1] := uStack_7; { routine anchor; statement location unresolved } { 4800:0131 }
          local_4 := bVar2; { 4800:01A6 }
        end; { routine anchor; statement location unresolved } { 4800:0131 }
      puVar1 := P_Word((local_9 + $104)); { routine anchor; statement location unresolved } { 4800:0131 }
      uStack_7 := (P_Word((local_9 + $106)))^; { 4800:01D8 }
      local_9 := (puVar1)^; { 4800:01D5 }
    end; { routine anchor; statement location unresolved } { 4800:0131 }
  if (local_3 = 0) then { routine anchor; statement location unresolved } { 4800:0131 }
    begin { routine anchor; statement location unresolved } { 4800:0131 }
      (param_1)^ := 0; { routine anchor; statement location unresolved } { 4800:0131 }
      P_Word(param_1)[1] := 0; { routine anchor; statement location unresolved } { 4800:0131 }
    end; { routine anchor; statement location unresolved } { 4800:0131 }
  Exit; { 4800:01F3 }
end; { routine anchor; statement location unresolved } { 4800:0131 }
```

### ov08:01F6 TakeCombatTurn (conf M)

Params (BP stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers (export): ov08_007A.  
Callees (export): FUN_00ba_09e3, FUN_00ba_0bb8, PlayerCombatCommands, ov09_000F, ov24_02FA, ov31_02D5, ov31_0BE7, ov31_0C0F, ov31_1298.

```pascal
procedure TakeCombatTurn(param_1: LongWord); { 4800:01F6 }
begin { routine anchor; statement location unresolved } { 4800:01F6 }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4800:01F6 }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 4800:01F6 }
  (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + $F)))^ := 0; { routine anchor; statement location unresolved } { 4800:01F6 }
  (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + $12)))^ := 0; { routine anchor; statement location unresolved } { 4800:01F6 }
  (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + 7)))^ := 0; { routine anchor; statement location unresolved } { 4800:01F6 }
  ov24_02FA(iVar2, uVar3, 7); { 4800:022C }
  if (0 < (P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + 3)))^) then { routine anchor; statement location unresolved } { 4800:01F6 }
    begin { routine anchor; statement location unresolved } { 4800:01F6 }
      if ((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + 3)))^ = 20) then { routine anchor; statement location unresolved } { 4800:01F6 }
        begin { routine anchor; statement location unresolved } { 4800:01F6 }
          (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + 3)))^ := $13; { routine anchor; statement location unresolved } { 4800:01F6 }
        end; { routine anchor; statement location unresolved } { 4800:01F6 }
      SelectedChar := iVar2; { routine anchor; statement location unresolved } { 4800:01F6 }
      g_5D94 := uVar3; { 4800:0268 }
      ov31_1298(1, 2, iVar2, uVar3); { 4800:0278 }
      FUN_00ba_0bb8(iVar2, uVar3); { 4800:0283 }
      FUN_00ba_09e3(iVar2, uVar3); { 4800:028E }
      ov24_02FA(iVar2, uVar3, Pack16(UNKNOWN_extraout_AH, $F)); { 4800:029C }
      if (0 < (P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + 3)))^) then { routine anchor; statement location unresolved } { 4800:01F6 }
        begin { routine anchor; statement location unresolved } { 4800:01F6 }
          if ((P_ShortInt((iVar2 + $10F)))^ = 0) then { routine anchor; statement location unresolved } { 4800:01F6 }
            begin { routine anchor; statement location unresolved } { 4800:01F6 }
              PlayerCombatCommands(iVar2, uVar3); { 4800:02CF }
            end; { routine anchor; statement location unresolved } { 4800:01F6 }
          else { routine anchor; statement location unresolved } { 4800:01F6 }
            begin { routine anchor; statement location unresolved } { 4800:01F6 }
              ov09_000F(iVar2, uVar3); { 4800:02C1 }
            end; { routine anchor; statement location unresolved } { 4800:01F6 }
        end; { routine anchor; statement location unresolved } { 4800:01F6 }
      uVar1 := ov31_0BE7(iVar2, uVar3); { 4800:02D8 }
      uVar3 := ov31_0C0F(iVar2, uVar3); { 4800:02E4 }
      ov31_02D5(uVar3, uVar1); { 4800:02EA }
    end; { routine anchor; statement location unresolved } { 4800:01F6 }
  Exit; { 4800:02F2 }
end; { routine anchor; statement location unresolved } { 4800:01F6 }
```

### ov08:031A PlayerCombatCommands (conf M)

Params (BP stack slots): param_1: LongWord [BP+$06].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_22: array[0..7] of Byte [BP-$20]; local_1a: Byte [BP-$18]; local_19: array[0..8] of Byte [BP-$17]; local_10: Byte [BP-$E]; local_f: array[0..6] of Byte [BP-$D]; local_8: Integer [BP-$6]; iStack_6: Integer [BP-$4]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): FUN_4800_01f6.  
Callees (export): Crt.Delay, FUN_00ba_09e3, FUN_00ba_1693, FUN_00ba_2637, FUN_00ba_2b88, FUN_0899_0104, CombatActionMenu, CombatMoveAttack, CombatDoneMenu, FUN_4800_122b, System.@StrCopy, ov09_000F, ov13_0D23, ov13_116A, ov13_2414, ov13_3558, ov13_3B93, ov19_0AB3, ov19_0EF8, CastSpellOrUseItem, ov25_06FB, ov31_1298.

```pascal
procedure PlayerCombatCommands(param_1: LongWord); { 4800:031A }
begin { routine anchor; statement location unresolved } { 4800:031A }
  uVar4 := $4800; { routine anchor; statement location unresolved } { 4800:031A }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4800:031A }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 4800:031A }
  if ((P_ShortInt((iVar2 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4800:031A }
    begin { routine anchor; statement location unresolved } { 4800:031A }
      FUN_00ba_2637(iVar2, uVar3); { 4800:0370 }
    end; { routine anchor; statement location unresolved } { 4800:031A }
  else { routine anchor; statement location unresolved } { 4800:031A }
    if ((P_ShortInt((P_LongWord((iVar2 + $108)))^))^ = 0) then { routine anchor; statement location unresolved } { 4800:031A }
      begin { routine anchor; statement location unresolved } { 4800:031A }
        local_4 := 0; { 4800:0375 }
        while (local_4 = 0) do { routine anchor; statement location unresolved } { 4800:031A }
          begin { routine anchor; statement location unresolved } { 4800:031A }
            CombatActionMenu(@(local_3), SS, iVar2, uVar3); { 4800:0394 }
            if (local_3 = 77) then { routine anchor; statement location unresolved } { 4800:031A }
              begin { routine anchor; statement location unresolved } { 4800:031A }
                CombatMoveAttack(@(local_4), SS, iVar2, uVar3); { 4800:03AA }
                bVar1 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 4800:031A }
              end; { routine anchor; statement location unresolved } { 4800:031A }
            else { routine anchor; statement location unresolved } { 4800:031A }
              if (local_3 = 86) then { routine anchor; statement location unresolved } { 4800:031A }
                begin { routine anchor; statement location unresolved } { 4800:031A }
                  ov19_0AB3(@(local_4), SS); { 4800:03B9 }
                  uVar4 := $68; { routine anchor; statement location unresolved } { 4800:031A }
                  ov13_0D23(iVar2, uVar3); { 4800:03C4 }
                  bVar1 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 4800:031A }
                  if (local_4 = 0) then { routine anchor; statement location unresolved } { 4800:031A }
                    begin { routine anchor; statement location unresolved } { 4800:031A }
                      uVar4 := $BA; { routine anchor; statement location unresolved } { 4800:031A }
                      FUN_00ba_2b88(); { 4800:03CF }
                      bVar1 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 4800:031A }
                    end; { routine anchor; statement location unresolved } { 4800:031A }
                end; { routine anchor; statement location unresolved } { 4800:031A }
              else { routine anchor; statement location unresolved } { 4800:031A }
                if (local_3 = 65) then { routine anchor; statement location unresolved } { 4800:031A }
                  begin { routine anchor; statement location unresolved } { 4800:031A }
                    uVar4 := $68; { routine anchor; statement location unresolved } { 4800:031A }
                    ov13_3558(local_f, SS, @(local_4), SS, (Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $FF), iVar2, uVar3); { 4800:03F4 }
                    bVar1 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 4800:031A }
                  end; { routine anchor; statement location unresolved } { 4800:031A }
                else { routine anchor; statement location unresolved } { 4800:031A }
                  if (local_3 = 85) then { routine anchor; statement location unresolved } { 4800:031A }
                    begin { routine anchor; statement location unresolved } { 4800:031A }
                      ov19_0EF8(@(local_4)); { 4800:0405 }
                      uVar4 := $68; { routine anchor; statement location unresolved } { 4800:031A }
                      ov13_0D23(iVar2, uVar3); { 4800:0410 }
                      bVar1 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 4800:031A }
                      if (local_4 = 0) then { routine anchor; statement location unresolved } { 4800:031A }
                        begin { routine anchor; statement location unresolved } { 4800:031A }
                          uVar4 := $BA; { routine anchor; statement location unresolved } { 4800:031A }
                          FUN_00ba_2b88(); { 4800:041B }
                          bVar1 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 4800:031A }
                        end; { routine anchor; statement location unresolved } { 4800:031A }
                    end; { routine anchor; statement location unresolved } { 4800:031A }
                  else { routine anchor; statement location unresolved } { 4800:031A }
                    if (local_3 = 67) then { routine anchor; statement location unresolved } { 4800:031A }
                      begin { routine anchor; statement location unresolved } { 4800:031A }
                        uVar4 := $68; { routine anchor; statement location unresolved } { 4800:031A }
                        ov13_2414(@(local_4), SS, (Word(UNKNOWN_extraout_AH) shl 8), (Word(UNKNOWN_extraout_AH) shl 8)); { 4800:0432 }
                        bVar1 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 4800:031A }
                      end; { routine anchor; statement location unresolved } { 4800:031A }
                    else { routine anchor; statement location unresolved } { 4800:031A }
                      if (local_3 = 84) then { routine anchor; statement location unresolved } { 4800:031A }
                        begin { routine anchor; statement location unresolved } { 4800:031A }
                          ov13_116A(iVar2, uVar3); { 4800:0444 }
                          uVar4 := $BA; { routine anchor; statement location unresolved } { 4800:031A }
                          FUN_00ba_2637(iVar2, uVar3); { 4800:044F }
                          local_4 := UNKNOWN_extraout_AL; { 4800:037B }
                          bVar1 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 4800:031A }
                        end; { routine anchor; statement location unresolved } { 4800:031A }
                      else { routine anchor; statement location unresolved } { 4800:031A }
                        if (local_3 = 81) then { routine anchor; statement location unresolved } { 4800:031A }
                          begin { routine anchor; statement location unresolved } { 4800:031A }
                            FUN_4800_122b(iVar2, uVar3); { 4800:0465 }
                            ov25_06FB(); { 4800:0468 }
                            FUN_0899_0104(); { 4800:046D }
                            Delay(200); { 4800:0476 }
                            local_4 := 1; { 4800:0454 }
                            uVar4 := $38; { routine anchor; statement location unresolved } { 4800:031A }
                            ov09_000F(iVar2, uVar3); { 4800:0485 }
                            bVar1 := UNKNOWN_extraout_AH_08; { routine anchor; statement location unresolved } { 4800:031A }
                          end; { routine anchor; statement location unresolved } { 4800:031A }
                        else { routine anchor; statement location unresolved } { 4800:031A }
                          if (local_3 = 68) then { routine anchor; statement location unresolved } { 4800:031A }
                            begin { routine anchor; statement location unresolved } { 4800:031A }
                              CombatDoneMenu(@(local_4), SS, iVar2, uVar3); { 4800:049D }
                              bVar1 := UNKNOWN_extraout_AH_09; { routine anchor; statement location unresolved } { 4800:031A }
                            end; { routine anchor; statement location unresolved } { 4800:031A }
                          else { routine anchor; statement location unresolved } { 4800:031A }
                            if (local_3 = 50) then { routine anchor; statement location unresolved } { 4800:031A }
                              begin { routine anchor; statement location unresolved } { 4800:031A }
                                g_6E30 := (g_6E30 = 0); { 4800:04B1 }
                                if Boolean(g_6E30) then { routine anchor; statement location unresolved } { 4800:031A }
                                  begin { routine anchor; statement location unresolved } { 4800:031A }
                                    puVar5 := local_19; { routine anchor; statement location unresolved } { 4800:031A }
                                    uVar6 := SS; { routine anchor; statement location unresolved } { 4800:031A }
                                    PString(local_19, SS) := 'Magic On'; { 4800:04C5 }
                                    FUN_00ba_1693(puVar5, uVar6); { 4800:04CA }
                                    bVar1 := UNKNOWN_extraout_AH_10; { routine anchor; statement location unresolved } { 4800:031A }
                                  end; { routine anchor; statement location unresolved } { 4800:031A }
                                else { routine anchor; statement location unresolved } { 4800:031A }
                                  begin { routine anchor; statement location unresolved } { 4800:031A }
                                    puVar5 := @(local_1a); { routine anchor; statement location unresolved } { 4800:031A }
                                    uVar6 := SS; { routine anchor; statement location unresolved } { 4800:031A }
                                    PString(local_1a, SS) := 'Magic Off'; { 4800:04DB }
                                    FUN_00ba_1693(puVar5, uVar6); { 4800:04E0 }
                                    bVar1 := UNKNOWN_extraout_AH_11; { routine anchor; statement location unresolved } { 4800:031A }
                                  end; { routine anchor; statement location unresolved } { 4800:031A }
                                uVar4 := $BA; { routine anchor; statement location unresolved } { 4800:031A }
                              end; { routine anchor; statement location unresolved } { 4800:031A }
                            else { routine anchor; statement location unresolved } { 4800:031A }
                              if (local_3 = 32) then { routine anchor; statement location unresolved } { 4800:031A }
                                begin { routine anchor; statement location unresolved } { 4800:031A }
                                  _local_8 := FarBits(g_5D98, PartyHead); { routine anchor; statement location unresolved } { 4800:031A }
                                  while true do { routine anchor; statement location unresolved } { 4800:031A }
                                    begin { routine anchor; statement location unresolved } { 4800:031A }
                                      if ((local_8 = 0) and then (iStack_6 = 0)) then { routine anchor; statement location unresolved } { 4800:031A }
                                        Break; { routine anchor; statement location unresolved } { 4800:031A }
                                      if ((P_Byte((local_8 + $84)))^ < $80) then { routine anchor; statement location unresolved } { 4800:031A }
                                        begin { routine anchor; statement location unresolved } { 4800:031A }
                                          (P_Byte((local_8 + $10F)))^ := 0; { routine anchor; statement location unresolved } { 4800:031A }
                                        end; { routine anchor; statement location unresolved } { 4800:031A }
                                      _local_8 := FarBits((P_Word((local_8 + $106)))^, (P_Word((local_8 + $104)))^); { routine anchor; statement location unresolved } { 4800:031A }
                                    end; { routine anchor; statement location unresolved } { 4800:031A }
                                  bVar1 := 0; { routine anchor; statement location unresolved } { 4800:031A }
                                end; { routine anchor; statement location unresolved } { 4800:031A }
                              else { routine anchor; statement location unresolved } { 4800:031A }
                                if (local_3 = 16) then { routine anchor; statement location unresolved } { 4800:031A }
                                  begin { routine anchor; statement location unresolved } { 4800:031A }
                                    (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + 3)))^ := $14; { routine anchor; statement location unresolved } { 4800:031A }
                                    _local_8 := FarBits(g_5D98, PartyHead); { routine anchor; statement location unresolved } { 4800:031A }
                                    while true do { routine anchor; statement location unresolved } { 4800:031A }
                                      begin { routine anchor; statement location unresolved } { 4800:031A }
                                        if ((local_8 = 0) and then (iStack_6 = 0)) then { routine anchor; statement location unresolved } { 4800:031A }
                                          Break; { routine anchor; statement location unresolved } { 4800:031A }
                                        FUN_4800_122b(local_8, iStack_6); { 4800:055A }
                                        uVar4 := Word((LongWord(_local_8) shr $10)); { routine anchor; statement location unresolved } { 4800:031A }
                                        _local_8 := FarBits((P_Word((Integer(_local_8) + $106)))^, (P_Word((Integer(_local_8) + $104)))^); { routine anchor; statement location unresolved } { 4800:031A }
                                      end; { routine anchor; statement location unresolved } { 4800:031A }
                                    ov25_06FB(); { 4800:0572 }
                                    uVar4 := $A40; { routine anchor; statement location unresolved } { 4800:031A }
                                    Delay(200); { 4800:057B }
                                    local_4 := 1; { 4800:047B }
                                    bVar1 := UNKNOWN_extraout_AH_12; { routine anchor; statement location unresolved } { 4800:031A }
                                  end; { routine anchor; statement location unresolved } { 4800:031A }
                                else { routine anchor; statement location unresolved } { 4800:031A }
                                  begin { routine anchor; statement location unresolved } { 4800:031A }
                                    bVar1 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4800:031A }
                                    if (local_3 = 45) then { routine anchor; statement location unresolved } { 4800:031A }
                                      begin { routine anchor; statement location unresolved } { 4800:031A }
                                        uVar4 := ov13_3B93(); { 4800:058A }
                                        bVar1 := Byte((Word(uVar4) shr 8)); { routine anchor; statement location unresolved } { 4800:031A }
                                        if (ShortInt(uVar4) = 0) then { routine anchor; statement location unresolved } { 4800:031A }
                                          begin { routine anchor; statement location unresolved } { 4800:031A }
                                            puVar5 := local_22; { routine anchor; statement location unresolved } { 4800:031A }
                                            uVar6 := SS; { routine anchor; statement location unresolved } { 4800:031A }
                                            PString(local_22, SS) := 'That doesn''t work'; { 4800:05B4 }
                                            uVar4 := $BA; { routine anchor; statement location unresolved } { 4800:031A }
                                            FUN_00ba_1693(puVar5, uVar6); { 4800:05B9 }
                                            bVar1 := UNKNOWN_extraout_AH_14; { routine anchor; statement location unresolved } { 4800:031A }
                                          end; { routine anchor; statement location unresolved } { 4800:031A }
                                        else { routine anchor; statement location unresolved } { 4800:031A }
                                          begin { routine anchor; statement location unresolved } { 4800:031A }
                                            uVar4 := $3E0; { routine anchor; statement location unresolved } { 4800:031A }
                                            ov31_1298((Word(bVar1) shl 8), Pack16(bVar1, 3), iVar2, uVar3); { 4800:059F }
                                            local_4 := 1; { 4800:0580 }
                                            bVar1 := UNKNOWN_extraout_AH_13; { routine anchor; statement location unresolved } { 4800:031A }
                                          end; { routine anchor; statement location unresolved } { 4800:031A }
                                      end; { routine anchor; statement location unresolved } { 4800:031A }
                                  end; { routine anchor; statement location unresolved } { 4800:031A }
            if (local_4 = 0) then { routine anchor; statement location unresolved } { 4800:031A }
              begin { routine anchor; statement location unresolved } { 4800:031A }
                ov31_1298(Pack16(bVar1, 1), Pack16(bVar1, 2), iVar2, uVar3); { 4800:05D0 }
                uVar4 := $BA; { routine anchor; statement location unresolved } { 4800:031A }
                FUN_00ba_09e3(iVar2, uVar3); { 4800:05DB }
              end; { routine anchor; statement location unresolved } { 4800:031A }
          end; { routine anchor; statement location unresolved } { 4800:031A }
      end; { routine anchor; statement location unresolved } { 4800:031A }
    else { routine anchor; statement location unresolved } { 4800:031A }
      begin { routine anchor; statement location unresolved } { 4800:031A }
        local_10 := (P_Byte((P_LongWord((iVar2 + $108)))^))^; { 4800:0347 }
        bVar1 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 4800:031A }
        (P_Byte((P_LongWord((iVar2 + $108)))^))^ := 0; { routine anchor; statement location unresolved } { 4800:031A }
        CastSpellOrUseItem(@(local_4), SS, Pack16(bVar1, 1), (Word(bVar1) shl 8), Pack16(bVar1, local_10)); { 4800:0365 }
        FUN_00ba_2637(iVar2, uVar3); { 4800:05EB }
      end; { routine anchor; statement location unresolved } { 4800:031A }
  Exit; { 4800:05F6 }
end; { routine anchor; statement location unresolved } { 4800:031A }
```

### ov08:0666 CombatActionMenu (conf M)

Params (BP stack slots): param_1: P_Byte [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_12d: array[0..254] of Byte [BP-$12B]; local_2e: Byte [BP-$2C]; local_2d: ShortInt [BP-$2B]; local_2c: Byte [BP-$2A]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): FUN_4800_031a.  
Callees (export): System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov24_02FA, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure CombatActionMenu(param_1: P_Byte; param_2: LongWord); { 4800:0666 }
begin { routine anchor; statement location unresolved } { 4800:0666 }
  ov24_02FA(Integer(param_2), Slice16(param_2, 2), $F); { 4800:0676 }
  local_2b[0] := 0; { routine anchor; statement location unresolved } { 4800:0666 }
  if ((P_ShortInt((Integer((P_LongWord((Integer(param_2) + $108)))^) + 6)))^ <> 0) then { routine anchor; statement location unresolved } { 4800:0666 }
    begin { routine anchor; statement location unresolved } { 4800:0666 }
      puVar3 := local_12d; { routine anchor; statement location unresolved } { 4800:0666 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
      PString(local_12d, SS) := PString(local_2b, SS); { 4800:0699 }
      PString(local_12d, SS) := Copy(PString(local_12d, SS) + 'Move ', 1, 255); { 4800:06A3 }
      PString(local_2b, SS) := Copy(PString(puVar3, uVar4), 1, $28); { 4800:06B1 }
    end; { routine anchor; statement location unresolved } { 4800:0666 }
  puVar3 := local_12d; { routine anchor; statement location unresolved } { 4800:0666 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
  PString(local_12d, SS) := PString(local_2b, SS); { 4800:06C1 }
  PString(local_12d, SS) := Copy(PString(local_12d, SS) + 'View Aim ', 1, 255); { 4800:06CB }
  PString(local_2b, SS) := Copy(PString(puVar3, uVar4), 1, $28); { 4800:06D9 }
  if ((P_ShortInt((Integer(param_2) + 199)))^ <> 0) then { routine anchor; statement location unresolved } { 4800:0666 }
    begin { routine anchor; statement location unresolved } { 4800:0666 }
      puVar3 := local_12d; { routine anchor; statement location unresolved } { 4800:0666 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
      PString(local_12d, SS) := PString(local_2b, SS); { 4800:06F4 }
      PString(local_12d, SS) := Copy(PString(local_12d, SS) + 'Use ', 1, 255); { 4800:06FE }
      PString(local_2b, SS) := Copy(PString(puVar3, uVar4), 1, $28); { 4800:070C }
    end; { routine anchor; statement location unresolved } { 4800:0666 }
  local_2d := 0; { 4800:0711 }
  local_2c := 0; { 4800:0715 }
  while true do { routine anchor; statement location unresolved } { 4800:0666 }
    begin { routine anchor; statement location unresolved } { 4800:0666 }
      if ((P_ShortInt(((Integer(param_2) + Word(local_2c)) + $17)))^ <> 0) then { routine anchor; statement location unresolved } { 4800:0666 }
        begin { routine anchor; statement location unresolved } { 4800:0666 }
          local_2d := 1; { 4800:072F }
        end; { routine anchor; statement location unresolved } { 4800:0666 }
      if (local_2c = $14) then { routine anchor; statement location unresolved } { 4800:0666 }
        Break; { routine anchor; statement location unresolved } { 4800:0666 }
      local_2c := (local_2c + 1); { 4800:071B }
    end; { routine anchor; statement location unresolved } { 4800:0666 }
  if (((local_2d <> 0) and then ((P_ShortInt((Integer((P_LongWord((Integer(param_2) + $108)))^) + 1)))^ <> 0)) and then ((P_Integer((Integer(ecl_Mem4900) + $1CA)))^ = 0)) then { routine anchor; statement location unresolved } { 4800:0666 }
    begin { routine anchor; statement location unresolved } { 4800:0666 }
      puVar3 := local_12d; { routine anchor; statement location unresolved } { 4800:0666 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
      PString(local_12d, SS) := PString(local_2b, SS); { 4800:0765 }
      PString(local_12d, SS) := Copy(PString(local_12d, SS) + 'Cast ', 1, 255); { 4800:076F }
      PString(local_2b, SS) := Copy(PString(puVar3, uVar4), 1, $28); { 4800:077D }
    end; { routine anchor; statement location unresolved } { 4800:0666 }
  if ((0 < (P_ShortInt((Integer(param_2) + $96)))^) and then ((P_ShortInt((Integer((P_LongWord((Integer(param_2) + $108)))^) + $11)))^ = 0)) then { routine anchor; statement location unresolved } { 4800:0666 }
    begin { routine anchor; statement location unresolved } { 4800:0666 }
      puVar3 := local_12d; { routine anchor; statement location unresolved } { 4800:0666 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
      PString(local_12d, SS) := PString(local_2b, SS); { 4800:07A7 }
      PString(local_12d, SS) := Copy(PString(local_12d, SS) + 'Turn ', 1, 255); { 4800:07B1 }
      PString(local_2b, SS) := Copy(PString(puVar3, uVar4), 1, $28); { 4800:07BF }
    end; { routine anchor; statement location unresolved } { 4800:0666 }
  puVar3 := local_12d; { routine anchor; statement location unresolved } { 4800:0666 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
  PString(local_12d, SS) := PString(local_2b, SS); { 4800:07CF }
  PString(local_12d, SS) := Copy(PString(local_12d, SS) + 'Quick Done', 1, 255); { 4800:07D9 }
  PString(local_2b, SS) := Copy(PString(puVar3, uVar4), 1, $28); { 4800:07E7 }
  repeat { routine anchor; statement location unresolved } { 4800:0666 }
    begin { routine anchor; statement location unresolved } { 4800:0666 }
      puVar3 := @(local_2e); { routine anchor; statement location unresolved } { 4800:0666 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0666 }
      PString(local_2e, SS) := ''; { 4800:07F6 }
      uVar2 := $3C5; { routine anchor; statement location unresolved } { 4800:0666 }
      uVar1 := ov25_03BD(@(local_2d), SS, (Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), local_2b, SS, puVar3, uVar4); { 4800:0814 }
      (param_1)^ := uVar1; { routine anchor; statement location unresolved } { 4800:0666 }
      uVar1 := (local_2d = 0); { routine anchor; statement location unresolved } { 4800:0666 }
      if not (Boolean(uVar1)) then { routine anchor; statement location unresolved } { 4800:0666 }
        begin { routine anchor; statement location unresolved } { 4800:0666 }
          uVar2 := $AF8; { routine anchor; statement location unresolved } { 4800:0666 }
          Flags.ZF := not (LoByte((param_1)^) in [16, 19, 45, 50]); { 4800:0831 }
          if Boolean(uVar1) then { routine anchor; statement location unresolved } { 4800:0666 }
            begin { routine anchor; statement location unresolved } { 4800:0666 }
              (param_1)^ := 0; { routine anchor; statement location unresolved } { 4800:0666 }
            end; { routine anchor; statement location unresolved } { 4800:0666 }
        end; { routine anchor; statement location unresolved } { 4800:0666 }
      Flags.ZF := not (LoByte((param_1)^) in [16, 19, 32, 45, 50, 65, 67, 68, 77, 81, 84, 85, 86]); { 4800:084B }
    end; { routine anchor; statement location unresolved } { 4800:0666 }
  until not (Boolean(uVar1)); { routine anchor; statement location unresolved } { 4800:0666 }
  Exit; { 4800:0855 }
end; { routine anchor; statement location unresolved } { 4800:0666 }
```

### ov08:0880 EndCombatRound (conf M)

Params (BP stack slots): param_1: P_Byte [BP+$06].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; puVar2: P_Word [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_1f: array[0..5] of Byte [BP-$1D]; local_19: array[0..16] of Byte [BP-$17]; local_8: ShortInt [BP-$6]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): ov08_007A.  
Callees (export): AdvanceClock, FUN_00ba_1693, FUN_00ba_23db, BandageDyingCharacter, System.@StrCopy, ov13_2879, ov24_02FA, ov24_0AE7, ov25_10D1, ov31_0996.

Advances combat clock and effect hooks; a dying counter >9 sets actor status 6. Prompts `Continue Battle:` after one side is gone under a mode guard. Boolean membership/side identities remain numeric.

```pascal
procedure EndCombatRound(param_1: P_Byte); { 4800:0880 }
begin { routine anchor; statement location unresolved } { 4800:0880 }
  AdvanceClock(1, 1); { 4800:088C }
  g_6DE3 := (g_6DE3 + 1); { 4800:0891 }
  uVar6 := $68; { routine anchor; statement location unresolved } { 4800:0880 }
  ov13_2879(); { 4800:0895 }
  uStack_4 := g_5D98; { 4800:08A4 }
  local_8 := 1; { 4800:08A7 }
  local_6 := PartyHead; { 4800:08A1 }
  while ((local_6 or uStack_4) <> 0) do { routine anchor; statement location unresolved } { 4800:0880 }
    begin { routine anchor; statement location unresolved } { 4800:0880 }
      ov24_02FA(local_6, uStack_4, Pack16(ShortInt(((local_6 or uStack_4) shr 8)), $13)); { 4800:08BC }
      uVar6 := $B0; { routine anchor; statement location unresolved } { 4800:0880 }
      ov24_0AE7(local_6, uStack_4); { 4800:08C7 }
      if (((P_ShortInt((local_6 + $10C)))^ = 5) and then Sequence((pcVar1 := P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $E))); ((pcVar1)^ := ((pcVar1)^ + 1)); (9 < (P_Byte((Integer((P_LongWord((local_6 + $108)))^) + $E)))^))) then { routine anchor; statement location unresolved } { 4800:0880 }
        begin { routine anchor; statement location unresolved } { 4800:0880 }
          (P_Byte((local_6 + $10C)))^ := 6; { routine anchor; statement location unresolved } { 4800:0880 }
        end; { routine anchor; statement location unresolved } { 4800:0880 }
      local_8 := (local_8 + 1); { 4800:08FB }
      puVar2 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 4800:0880 }
      uStack_4 := (P_Word((local_6 + $106)))^; { 4800:090E }
      local_6 := (puVar2)^; { 4800:090B }
    end; { routine anchor; statement location unresolved } { 4800:0880 }
  cVar3 := BandageDyingCharacter(0); { 4800:0917 }
  if (cVar3 <> 0) then { routine anchor; statement location unresolved } { 4800:0880 }
    begin { routine anchor; statement location unresolved } { 4800:0880 }
      puVar7 := local_1f; { routine anchor; statement location unresolved } { 4800:0880 }
      uVar8 := SS; { routine anchor; statement location unresolved } { 4800:0880 }
      PString(local_1f, SS) := 'Your Teammate is Dying'; { 4800:0928 }
      FUN_00ba_1693(puVar7, uVar8); { 4800:092D }
    end; { routine anchor; statement location unresolved } { 4800:0880 }
  FUN_00ba_23db(); { 4800:0932 }
  uVar6 := Word((LongWord(g_6716) shr $10)); { routine anchor; statement location unresolved } { 4800:0880 }
  iVar4 := ((P_ShortInt((Integer(g_6716) + 3)))^ + 3); { routine anchor; statement location unresolved } { 4800:0880 }
  uVar5 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 4800:0880 }
  ov31_0996(Pack16(uVar5, 8), Pack16(uVar5, $FF), iVar4, ((P_ShortInt((Integer(g_6716) + 2)))^ + 3)); { 4800:0957 }
  if ((g_6814 = 0) or else (g_6815 = 0)) then { routine anchor; statement location unresolved } { 4800:0880 }
    begin { routine anchor; statement location unresolved } { 4800:0880 }
      (param_1)^ := 1; { routine anchor; statement location unresolved } { 4800:0880 }
    end; { routine anchor; statement location unresolved } { 4800:0880 }
  if (((g_6814 <> 0) and then (g_6815 = 0)) and then (g_49F4 = 0)) then { routine anchor; statement location unresolved } { 4800:0880 }
    begin { routine anchor; statement location unresolved } { 4800:0880 }
      puVar7 := local_19; { routine anchor; statement location unresolved } { 4800:0880 }
      PString(local_19, SS) := 'Continue Battle:'; { 4800:0990 }
      cVar3 := ov25_10D1(Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), puVar7, SS); { 4800:099E }
      if (cVar3 = 89) then { routine anchor; statement location unresolved } { 4800:0880 }
        begin { routine anchor; statement location unresolved } { 4800:0880 }
          (param_1)^ := 0; { routine anchor; statement location unresolved } { 4800:0880 }
        end; { routine anchor; statement location unresolved } { 4800:0880 }
    end; { routine anchor; statement location unresolved } { 4800:0880 }
  Exit; { 4800:09B1 }
end; { routine anchor; statement location unresolved } { 4800:0880 }
```

### ov08:09DF CombatMoveAttack (conf M)

Params (BP stack slots): param_1: P_Byte [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar7: Byte [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; uVar12: Word [compiler temporary; no proven BP slot]; local_20d: Byte [BP-$20B]; local_20c: array[0..255] of Byte [BP-$20A]; local_10c: array[0..247] of Byte [BP-$10A]; local_14: array[0..1] of Byte [BP-$12]; local_12: array[0..5] of Byte [BP-$10]; local_c: ShortInt [BP-$A]; local_b: Byte [BP-$9]; local_a: Byte [BP-$8]; local_9: Byte [BP-$7]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): FUN_4800_031a.  
Callees (export): FUN_00ba_0b73, FUN_00ba_1037, FUN_00ba_1693, FUN_00ba_2637, FUN_03f1_0137, CheckWeaponCanGuard, System.@StrAppend, System.@StrCopy, ov13_0712, ov13_08B2, ov13_0C6A, ov24_0AE7, ov25_03BD, ov25_10D1, ov31_052B, ov31_0996, ov31_0AF8, ov31_0BE7, ov31_0C0F, ov31_0C5F, ov31_0CB9, ov31_10A7.

```pascal
procedure CombatMoveAttack(param_1: P_Byte; param_2: LongWord); { 4800:09DF }
begin { routine anchor; statement location unresolved } { 4800:09DF }
  uVar9 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 4800:09DF }
  iVar8 := Integer(param_2); { routine anchor; statement location unresolved } { 4800:09DF }
  local_3 := (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^; { 4800:09F2 }
  local_4 := (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 9)))^; { 4800:0A01 }
  local_5 := ov31_0BE7(iVar8, uVar9); { 4800:0A0A }
  ov31_0C0F(iVar8, uVar9); { 4800:0A18 }
  local_c := 32; { 4800:0A20 }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 4800:09DF }
  local_9 := 8; { 4800:0A2B }
  bVar7 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4800:09DF }
  local_6 := UNKNOWN_extraout_AL; { 4800:0A1D }
  while (((1 < (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^) and then (local_c <> 0)) and then (local_c <> 13)) do { routine anchor; statement location unresolved } { 4800:09DF }
    begin { routine anchor; statement location unresolved } { 4800:09DF }
      FUN_03f1_0137(Pack16(bVar7, $18), Pack16(bVar7, $27), Pack16(bVar7, $18), Pack16(bVar7, $18)); { 4800:0A5F }
      puVar11 := local_20c; { routine anchor; statement location unresolved } { 4800:09DF }
      uVar12 := SS; { routine anchor; statement location unresolved } { 4800:09DF }
      PString(local_20c, SS) := 'Move/Attack, Move Left = '; { 4800:0A6F }
      puVar10 := local_10c; { routine anchor; statement location unresolved } { 4800:09DF }
      uVar3 := SS; { routine anchor; statement location unresolved } { 4800:09DF }
      FUN_00ba_1037(((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ shr 1)); { 4800:0A8B }
      PString(local_20c, SS) := Copy(PString(local_20c, SS) + PString(puVar10, uVar3), 1, 255); { 4800:0A90 }
      PString(local_20c, SS) := Copy(PString(local_20c, SS) + ' ', 1, 255); { 4800:0A9A }
      puVar10 := @(local_20d); { routine anchor; statement location unresolved } { 4800:09DF }
      uVar3 := SS; { routine anchor; statement location unresolved } { 4800:09DF }
      PString(local_20d, SS) := ''; { 4800:0AAA }
      uVar3 := ov25_03BD(P_Byte(@(g_6E31)), $C7C, (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, 10), puVar10, uVar3, puVar11, uVar12); { 4800:0AC3 }
      local_c := ShortInt(uVar3); { 4800:0AC8 }
      bVar7 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 4800:09DF }
      if (local_c = 0) then { routine anchor; statement location unresolved } { 4800:09DF }
        begin { routine anchor; statement location unresolved } { 4800:09DF }
          (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ := local_3; { routine anchor; statement location unresolved } { 4800:09DF }
          iVar4 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 4800:09DF }
          iVar5 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 4800:09DF }
          uVar3 := ov31_0C5F(iVar8, uVar9); { 4800:0AF0 }
          ov31_052B(uVar3, iVar5, iVar4); { 4800:0AF6 }
          cVar1 := ov31_10A7((Word(UNKNOWN_extraout_AH_01) shl 8), Pack16(UNKNOWN_extraout_AH_01, local_6), Pack16(UNKNOWN_extraout_AH_01, local_5), iVar8, uVar9); { 4800:0B0C }
          (param_1)^ := (cVar1 = 0); { routine anchor; statement location unresolved } { 4800:09DF }
          uVar3 := ov31_0BE7(iVar8, uVar9); { 4800:0B24 }
          uVar6 := ov31_0C0F(iVar8, uVar9); { 4800:0B30 }
          ov31_0996(8, (uVar6 and $FF00), uVar6, uVar3); { 4800:0B3C }
          (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 9)))^ := local_4; { routine anchor; statement location unresolved } { 4800:09DF }
          local_9 := 8; { 4800:0B50 }
          bVar7 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 4800:09DF }
        end; { routine anchor; statement location unresolved } { 4800:09DF }
      else { routine anchor; statement location unresolved } { 4800:09DF }
        if (local_c = 72) then { routine anchor; statement location unresolved } { 4800:09DF }
          begin { routine anchor; statement location unresolved } { 4800:09DF }
            local_9 := 0; { 4800:0B5A }
          end; { routine anchor; statement location unresolved } { 4800:09DF }
        else { routine anchor; statement location unresolved } { 4800:09DF }
          if (local_c = 73) then { routine anchor; statement location unresolved } { 4800:09DF }
            begin { routine anchor; statement location unresolved } { 4800:09DF }
              local_9 := 1; { 4800:0B64 }
            end; { routine anchor; statement location unresolved } { 4800:09DF }
          else { routine anchor; statement location unresolved } { 4800:09DF }
            if (local_c = 77) then { routine anchor; statement location unresolved } { 4800:09DF }
              begin { routine anchor; statement location unresolved } { 4800:09DF }
                local_9 := 2; { 4800:0B6E }
              end; { routine anchor; statement location unresolved } { 4800:09DF }
            else { routine anchor; statement location unresolved } { 4800:09DF }
              if (local_c = 81) then { routine anchor; statement location unresolved } { 4800:09DF }
                begin { routine anchor; statement location unresolved } { 4800:09DF }
                  local_9 := 3; { 4800:0B78 }
                end; { routine anchor; statement location unresolved } { 4800:09DF }
              else { routine anchor; statement location unresolved } { 4800:09DF }
                if (local_c = 80) then { routine anchor; statement location unresolved } { 4800:09DF }
                  begin { routine anchor; statement location unresolved } { 4800:09DF }
                    local_9 := 4; { 4800:0B82 }
                  end; { routine anchor; statement location unresolved } { 4800:09DF }
                else { routine anchor; statement location unresolved } { 4800:09DF }
                  if (local_c = 79) then { routine anchor; statement location unresolved } { 4800:09DF }
                    begin { routine anchor; statement location unresolved } { 4800:09DF }
                      local_9 := 5; { 4800:0B8C }
                    end; { routine anchor; statement location unresolved } { 4800:09DF }
                  else { routine anchor; statement location unresolved } { 4800:09DF }
                    if (local_c = 75) then { routine anchor; statement location unresolved } { 4800:09DF }
                      begin { routine anchor; statement location unresolved } { 4800:09DF }
                        local_9 := 6; { 4800:0B96 }
                      end; { routine anchor; statement location unresolved } { 4800:09DF }
                    else { routine anchor; statement location unresolved } { 4800:09DF }
                      if (local_c = 71) then { routine anchor; statement location unresolved } { 4800:09DF }
                        begin { routine anchor; statement location unresolved } { 4800:09DF }
                          local_9 := 7; { 4800:0BA0 }
                        end; { routine anchor; statement location unresolved } { 4800:09DF }
                      else { routine anchor; statement location unresolved } { 4800:09DF }
                        begin { routine anchor; statement location unresolved } { 4800:09DF }
                          local_9 := 8; { 4800:0BA6 }
                        end; { routine anchor; statement location unresolved } { 4800:09DF }
      if (local_9 < 8) then { routine anchor; statement location unresolved } { 4800:09DF }
        begin { routine anchor; statement location unresolved } { 4800:09DF }
          ov31_0AF8((Word(bVar7) shl 8), (Word(bVar7) shl 8), Pack16(bVar7, local_9), iVar8, uVar9); { 4800:0BC3 }
          ov31_0CB9(@(local_b), SS, @(local_a), SS, Pack16(UNKNOWN_extraout_AH_03, local_9), iVar8, uVar9); { 4800:0BDC }
          if (local_a = 0) then { routine anchor; statement location unresolved } { 4800:09DF }
            begin { routine anchor; statement location unresolved } { 4800:09DF }
              if (local_b = 0) then { routine anchor; statement location unresolved } { 4800:09DF }
                begin { routine anchor; statement location unresolved } { 4800:09DF }
                  puVar11 := local_12; { routine anchor; statement location unresolved } { 4800:09DF }
                  uVar3 := SS; { routine anchor; statement location unresolved } { 4800:09DF }
                  PString(local_12, SS) := 'Flee:'; { 4800:0C1C }
                  ov25_10D1(Pack16(UNKNOWN_extraout_AH_05, $F), Pack16(UNKNOWN_extraout_AH_05, 10), Pack16(UNKNOWN_extraout_AH_05, $D), puVar11, uVar3); { 4800:0C2A }
                  if (UNKNOWN_extraout_AL_00 = 89) then { routine anchor; statement location unresolved } { 4800:09DF }
                    begin { routine anchor; statement location unresolved } { 4800:09DF }
                      ov13_0C6A(iVar8, uVar9); { 4800:0C39 }
                      (param_1)^ := UNKNOWN_extraout_AL_01; { routine anchor; statement location unresolved } { 4800:09DF }
                      bVar7 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 4800:09DF }
                    end; { routine anchor; statement location unresolved } { 4800:09DF }
                  else { routine anchor; statement location unresolved } { 4800:09DF }
                    begin { routine anchor; statement location unresolved } { 4800:09DF }
                      bVar7 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 4800:09DF }
                      if (UNKNOWN_extraout_AL_00 = 78) then { routine anchor; statement location unresolved } { 4800:09DF }
                        begin { routine anchor; statement location unresolved } { 4800:09DF }
                          (param_1)^ := 0; { routine anchor; statement location unresolved } { 4800:09DF }
                        end; { routine anchor; statement location unresolved } { 4800:09DF }
                    end; { routine anchor; statement location unresolved } { 4800:09DF }
                end; { routine anchor; statement location unresolved } { 4800:09DF }
              else { routine anchor; statement location unresolved } { 4800:09DF }
                if ((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ < Byte(P_Byte(@(g_2744))[(Word(local_b) * 4)])) then { routine anchor; statement location unresolved } { 4800:09DF }
                  begin { routine anchor; statement location unresolved } { 4800:09DF }
                    puVar11 := local_14; { routine anchor; statement location unresolved } { 4800:09DF }
                    uVar3 := SS; { routine anchor; statement location unresolved } { 4800:09DF }
                    PString(local_14, SS) := 'Blocked'; { 4800:0C7B }
                    FUN_00ba_1693(puVar11, uVar3); { 4800:0C80 }
                    bVar7 := UNKNOWN_extraout_AH_08; { routine anchor; statement location unresolved } { 4800:09DF }
                  end; { routine anchor; statement location unresolved } { 4800:09DF }
                else { routine anchor; statement location unresolved } { 4800:09DF }
                  begin { routine anchor; statement location unresolved } { 4800:09DF }
                    ov13_08B2(local_9, iVar8, uVar9); { 4800:0C92 }
                    if ((P_ShortInt((iVar8 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4800:09DF }
                      begin { routine anchor; statement location unresolved } { 4800:09DF }
                        FUN_00ba_2637(iVar8, uVar9); { 4800:0CA8 }
                        (param_1)^ := UNKNOWN_extraout_AL_02; { routine anchor; statement location unresolved } { 4800:09DF }
                        bVar7 := UNKNOWN_extraout_AH_10; { routine anchor; statement location unresolved } { 4800:09DF }
                      end; { routine anchor; statement location unresolved } { 4800:09DF }
                    else { routine anchor; statement location unresolved } { 4800:09DF }
                      begin { routine anchor; statement location unresolved } { 4800:09DF }
                        ov13_0712(Pack16(UNKNOWN_extraout_AH_09, local_9), iVar8, uVar9); { 4800:0CBF }
                        if ((P_ShortInt((iVar8 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4800:09DF }
                          begin { routine anchor; statement location unresolved } { 4800:09DF }
                            uVar2 := FUN_00ba_2637(iVar8, uVar9); { 4800:0CD5 }
                            (param_1)^ := uVar2; { routine anchor; statement location unresolved } { 4800:09DF }
                          end; { routine anchor; statement location unresolved } { 4800:09DF }
                        ov24_0AE7(iVar8, uVar9); { 4800:0CE6 }
                        uVar3 := FUN_00ba_0b73(iVar8, uVar9); { 4800:0CF1 }
                        bVar7 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 4800:09DF }
                        if (ShortInt(uVar3) <> 0) then { routine anchor; statement location unresolved } { 4800:09DF }
                          begin { routine anchor; statement location unresolved } { 4800:09DF }
                            FUN_00ba_2637(iVar8, uVar9); { 4800:0D00 }
                            (param_1)^ := UNKNOWN_extraout_AL_03; { routine anchor; statement location unresolved } { 4800:09DF }
                            bVar7 := UNKNOWN_extraout_AH_11; { routine anchor; statement location unresolved } { 4800:09DF }
                          end; { routine anchor; statement location unresolved } { 4800:09DF }
                      end; { routine anchor; statement location unresolved } { 4800:09DF }
                  end; { routine anchor; statement location unresolved } { 4800:09DF }
            end; { routine anchor; statement location unresolved } { 4800:09DF }
          else { routine anchor; statement location unresolved } { 4800:09DF }
            begin { routine anchor; statement location unresolved } { 4800:09DF }
              CheckWeaponCanGuard(P_Byte(param_1), Integer((LongWord(param_1) shr $10)), (P_Word((P_Byte(@(g_65B9)) + (Word(local_a) * 4))))^, (P_Word((P_Byte(@(g_65BB)) + (Word(local_a) * 4))))^, iVar8, uVar9); { 4800:0C06 }
              bVar7 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 4800:09DF }
            end; { routine anchor; statement location unresolved } { 4800:09DF }
        end; { routine anchor; statement location unresolved } { 4800:09DF }
    end; { routine anchor; statement location unresolved } { 4800:09DF }
  if ((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ < 2) then { routine anchor; statement location unresolved } { 4800:09DF }
    begin { routine anchor; statement location unresolved } { 4800:09DF }
      (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ := 0; { routine anchor; statement location unresolved } { 4800:09DF }
    end; { routine anchor; statement location unresolved } { 4800:09DF }
  Exit; { 4800:0D2D }
end; { routine anchor; statement location unresolved } { 4800:09DF }
```

### ov08:0D45 CheckWeaponCanGuard (conf M)

Params (BP stack slots): param_1: P_Byte [BP+$06]; param_2: Word [BP+$0A]; param_3: Word [BP+$0C]; param_4: LongWord [BP+$0E].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; local_17: array[0..20] of Byte [BP-$15].  
Callers (export): FUN_4800_09df.  
Callees (export): FUN_00ba_1693, FUN_00ba_2e03, FUN_00ba_2e46, System.@StrCopy, ov13_0E82, ov13_17F6, ov13_1884, ov13_2998.

```pascal
procedure CheckWeaponCanGuard(param_1: P_Byte; param_2: Word; param_3: Word; param_4: LongWord); { 4800:0D45 }
begin { routine anchor; statement location unresolved } { 4800:0D45 }
  cVar1 := FUN_00ba_2e03(Integer(param_4), Slice16(param_4, 2)); { 4800:0D51 }
  if ((cVar1 <> 0) and then Sequence((cVar1 := FUN_00ba_2e46(Integer(param_4), Slice16(param_4, 2))); (cVar1 = 0))) then { 4800:0D60 }
    begin { routine anchor; statement location unresolved } { 4800:0D45 }
      puVar4 := local_17; { routine anchor; statement location unresolved } { 4800:0D45 }
      PString(local_17, SS) := 'Not with that weapon'; { 4800:0D73 }
      FUN_00ba_1693(puVar4, SS); { 4800:0D78 }
      Exit; { 4800:0DFB }
    end; { routine anchor; statement location unresolved } { 4800:0D45 }
  cVar1 := ov13_2998(param_2, param_3, Integer(param_4), Slice16(param_4, 2)); { 4800:0D8B }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 4800:0D45 }
    begin { routine anchor; statement location unresolved } { 4800:0D45 }
      uVar3 := Word((LongWord((P_LongWord((Integer(param_4) + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 4800:0D45 }
      iVar2 := Integer((P_LongWord((Integer(param_4) + $108)))^); { routine anchor; statement location unresolved } { 4800:0D45 }
      (P_Word((iVar2 + 10)))^ := param_2; { routine anchor; statement location unresolved } { 4800:0D45 }
      (P_Word((iVar2 + $C)))^ := param_3; { routine anchor; statement location unresolved } { 4800:0D45 }
      cVar1 := ov13_0E82(param_2, param_3, Integer(param_4), Slice16(param_4, 2)); { 4800:0DB6 }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4800:0D45 }
        begin { routine anchor; statement location unresolved } { 4800:0D45 }
          ov13_17F6(param_2, param_3, Integer(param_4), Slice16(param_4, 2)); { 4800:0DD4 }
          ov13_1884(P_Byte(param_1), Integer((LongWord(param_1) shr $10)), 0, 0, (Word(UNKNOWN_extraout_AH) shl 8), param_2, param_3, Integer(param_4), Slice16(param_4, 2)); { 4800:0DF3 }
        end; { routine anchor; statement location unresolved } { 4800:0D45 }
      else { routine anchor; statement location unresolved } { 4800:0D45 }
        begin { routine anchor; statement location unresolved } { 4800:0D45 }
          (param_1)^ := 1; { routine anchor; statement location unresolved } { 4800:0D45 }
        end; { routine anchor; statement location unresolved } { 4800:0D45 }
    end; { routine anchor; statement location unresolved } { 4800:0D45 }
  Exit; { 4800:0DFB }
end; { routine anchor; statement location unresolved } { 4800:0D45 }
```

### ov08:0E45 CombatDoneMenu (conf M)

Params (BP stack slots): param_1: P_ShortInt [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_12c: array[0..254] of Byte [BP-$12A]; local_2d: Byte [BP-$2B]; local_2c: ShortInt [BP-$2A]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): FUN_4800_031a.  
Callees (export): FUN_00ba_2637, FUN_00ba_2686, FUN_00ba_2e03, FUN_00ba_2e46, BandageDyingCharacter, CombatSpeedMenu, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure CombatDoneMenu(param_1: P_ShortInt; param_2: LongWord); { 4800:0E45 }
begin { routine anchor; statement location unresolved } { 4800:0E45 }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 4800:0E45 }
  local_2b[0] := 0; { routine anchor; statement location unresolved } { 4800:0E45 }
  cVar1 := FUN_00ba_2e03(Integer(param_2), Slice16(param_2, 2)); { 4800:0E5D }
  if ((cVar1 = 0) or else Sequence((cVar1 := FUN_00ba_2e46(Integer(param_2), Slice16(param_2, 2))); (cVar1 <> 0))) then { 4800:0E6C }
    begin { routine anchor; statement location unresolved } { 4800:0E45 }
      puVar4 := local_12c; { routine anchor; statement location unresolved } { 4800:0E45 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 4800:0E45 }
      PString(local_12c, SS) := PString(local_2b, SS); { 4800:0E80 }
      PString(local_12c, SS) := Copy(PString(local_12c, SS) + 'Guard ', 1, 255); { 4800:0E8A }
      PString(local_2b, SS) := Copy(PString(puVar4, uVar5), 1, $28); { 4800:0E98 }
    end; { routine anchor; statement location unresolved } { 4800:0E45 }
  puVar4 := local_12c; { routine anchor; statement location unresolved } { 4800:0E45 }
  uVar5 := SS; { routine anchor; statement location unresolved } { 4800:0E45 }
  PString(local_12c, SS) := PString(local_2b, SS); { 4800:0EA8 }
  PString(local_12c, SS) := Copy(PString(local_12c, SS) + 'Delay Quit ', 1, 255); { 4800:0EB2 }
  PString(local_2b, SS) := Copy(PString(puVar4, uVar5), 1, $28); { 4800:0EC0 }
  cVar1 := BandageDyingCharacter((Word(UNKNOWN_extraout_AH) shl 8)); { 4800:0EC9 }
  uVar3 := (cVar1 = 0); { routine anchor; statement location unresolved } { 4800:0E45 }
  if not (Boolean(uVar3)) then { routine anchor; statement location unresolved } { 4800:0E45 }
    begin { routine anchor; statement location unresolved } { 4800:0E45 }
      puVar4 := local_12c; { routine anchor; statement location unresolved } { 4800:0E45 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 4800:0E45 }
      PString(local_12c, SS) := PString(local_2b, SS); { 4800:0EDB }
      PString(local_12c, SS) := Copy(PString(local_12c, SS) + 'Bandage ', 1, 255); { 4800:0EE5 }
      PString(local_2b, SS) := Copy(PString(puVar4, uVar5), 1, $28); { 4800:0EF3 }
    end; { routine anchor; statement location unresolved } { 4800:0E45 }
  puVar4 := local_12c; { routine anchor; statement location unresolved } { 4800:0E45 }
  uVar5 := SS; { routine anchor; statement location unresolved } { 4800:0E45 }
  PString(local_12c, SS) := PString(local_2b, SS); { 4800:0F03 }
  PString(local_12c, SS) := Copy(PString(local_12c, SS) + 'Speed Exit', 1, 255); { 4800:0F0D }
  uVar2 := $AF8; { routine anchor; statement location unresolved } { 4800:0E45 }
  PString(local_2b, SS) := Copy(PString(puVar4, uVar5), 1, $28); { 4800:0F1B }
  local_2c := 32; { 4800:0F20 }
  while Sequence(Flags.ZF := not (LoByte(local_2c) in [0, 69]); (Boolean(uVar3) and then ((param_1)^ = 0))) do { 4800:0F2D }
    begin { routine anchor; statement location unresolved } { 4800:0E45 }
      puVar4 := @(local_2d); { routine anchor; statement location unresolved } { 4800:0E45 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 4800:0E45 }
      PString(local_2d, SS) := ''; { 4800:0F4D }
      uVar2 := $3C5; { routine anchor; statement location unresolved } { 4800:0E45 }
      local_2c := ov25_03BD(P_Byte(@(g_6E31)), $C7C, (Word(UNKNOWN_extraout_AH_00) shl 8), (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), local_2b, SS, puVar4, uVar5); { 4800:0F6B }
      uVar3 := (local_2c = 71); { routine anchor; statement location unresolved } { 4800:0E45 }
      if Boolean(uVar3) then { routine anchor; statement location unresolved } { 4800:0E45 }
        begin { routine anchor; statement location unresolved } { 4800:0E45 }
          uVar2 := $BA; { routine anchor; statement location unresolved } { 4800:0E45 }
          cVar1 := FUN_00ba_2686(Integer(param_2), Slice16(param_2, 2)); { 4800:0F80 }
          (param_1)^ := cVar1; { routine anchor; statement location unresolved } { 4800:0E45 }
        end; { routine anchor; statement location unresolved } { 4800:0E45 }
      else { routine anchor; statement location unresolved } { 4800:0E45 }
        if (local_2c = 68) then { routine anchor; statement location unresolved } { 4800:0E45 }
          begin { routine anchor; statement location unresolved } { 4800:0E45 }
            (P_Byte((Integer((P_LongWord((Integer(param_2) + $108)))^) + 3)))^ := 1; { routine anchor; statement location unresolved } { 4800:0E45 }
            (param_1)^ := 1; { routine anchor; statement location unresolved } { 4800:0E45 }
            uVar3 := 1; { routine anchor; statement location unresolved } { 4800:0E45 }
          end; { routine anchor; statement location unresolved } { 4800:0E45 }
        else { routine anchor; statement location unresolved } { 4800:0E45 }
          begin { routine anchor; statement location unresolved } { 4800:0E45 }
            uVar3 := (local_2c = 81); { routine anchor; statement location unresolved } { 4800:0E45 }
            if Boolean(uVar3) then { routine anchor; statement location unresolved } { 4800:0E45 }
              begin { routine anchor; statement location unresolved } { 4800:0E45 }
                uVar2 := $BA; { routine anchor; statement location unresolved } { 4800:0E45 }
                cVar1 := FUN_00ba_2637(Integer(param_2), Slice16(param_2, 2)); { 4800:0FB1 }
                (param_1)^ := cVar1; { routine anchor; statement location unresolved } { 4800:0E45 }
              end; { routine anchor; statement location unresolved } { 4800:0E45 }
            else { routine anchor; statement location unresolved } { 4800:0E45 }
              begin { routine anchor; statement location unresolved } { 4800:0E45 }
                uVar3 := (local_2c = 66); { routine anchor; statement location unresolved } { 4800:0E45 }
                if Boolean(uVar3) then { routine anchor; statement location unresolved } { 4800:0E45 }
                  begin { routine anchor; statement location unresolved } { 4800:0E45 }
                    cVar1 := BandageDyingCharacter(1); { 4800:0FC6 }
                    (param_1)^ := cVar1; { routine anchor; statement location unresolved } { 4800:0E45 }
                    uVar2 := $BA; { routine anchor; statement location unresolved } { 4800:0E45 }
                    cVar1 := FUN_00ba_2637(Integer(param_2), Slice16(param_2, 2)); { 4800:0FD5 }
                    (param_1)^ := cVar1; { routine anchor; statement location unresolved } { 4800:0E45 }
                  end; { routine anchor; statement location unresolved } { 4800:0E45 }
                else { routine anchor; statement location unresolved } { 4800:0E45 }
                  begin { routine anchor; statement location unresolved } { 4800:0E45 }
                    uVar3 := (local_2c = 83); { routine anchor; statement location unresolved } { 4800:0E45 }
                    if Boolean(uVar3) then { routine anchor; statement location unresolved } { 4800:0E45 }
                      begin { routine anchor; statement location unresolved } { 4800:0E45 }
                        CombatSpeedMenu(); { 4800:0FE7 }
                      end; { routine anchor; statement location unresolved } { 4800:0E45 }
                  end; { routine anchor; statement location unresolved } { 4800:0E45 }
              end; { routine anchor; statement location unresolved } { 4800:0E45 }
          end; { routine anchor; statement location unresolved } { 4800:0E45 }
    end; { routine anchor; statement location unresolved } { 4800:0E45 }
  Exit; { 4800:0FF0 }
end; { routine anchor; statement location unresolved } { 4800:0E45 }
```

### ov08:0FFF BandageDyingCharacter (conf M)

Params (BP stack slots): param_1: ShortInt [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; local_14: array[0..11] of Byte [BP-$12]; local_8: Byte [BP-$6]; local_7: Integer [BP-$5]; iStack_5: Integer [BP-$3].  
Callers (export): FUN_4800_0880,FUN_4800_0e45.  
Callees (export): FUN_00ba_16ec, System.@StrCopy.

Bandages dying teammate(s) or checks whether any need bandaging depending on argument; changes dying status and reports `is bandaged`. See numeric status tests rather than inferring from message alone.

```pascal
function BandageDyingCharacter(param_1: ShortInt): Byte; { 4800:0FFF }
begin { routine anchor; statement location unresolved } { 4800:0FFF }
  uVar2 := $4800; { routine anchor; statement location unresolved } { 4800:0FFF }
  local_8 := 0; { 4800:1005 }
  iStack_5 := g_5D98; { 4800:1013 }
  local_7 := PartyHead; { 4800:1010 }
  while ((local_7 <> 0) or else (iStack_5 <> 0)) do { routine anchor; statement location unresolved } { 4800:0FFF }
    begin { routine anchor; statement location unresolved } { 4800:0FFF }
      if (((((P_ShortInt((Integer((P_LongWord((local_7 + $108)))^) + $13)))^ = 0) and then ((P_ShortInt((local_7 + $10E)))^ = 0)) and then ((P_ShortInt((local_7 + $10C)))^ = 5)) and then Sequence((local_8 := 1); (param_1 <> 0))) then { routine anchor; statement location unresolved } { 4800:0FFF }
        begin { routine anchor; statement location unresolved } { 4800:0FFF }
          (P_Byte((local_7 + $10C)))^ := 4; { routine anchor; statement location unresolved } { 4800:0FFF }
          (P_Byte((Integer((P_LongWord((local_7 + $108)))^) + $E)))^ := 0; { routine anchor; statement location unresolved } { 4800:0FFF }
          puVar3 := local_14; { routine anchor; statement location unresolved } { 4800:0FFF }
          uVar4 := SS; { routine anchor; statement location unresolved } { 4800:0FFF }
          iVar5 := local_7; { routine anchor; statement location unresolved } { 4800:0FFF }
          iVar6 := iStack_5; { routine anchor; statement location unresolved } { 4800:0FFF }
          PString(local_14, SS) := 'is bandaged'; { 4800:1076 }
          uVar2 := $BA; { routine anchor; statement location unresolved } { 4800:0FFF }
          FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar3, uVar4, iVar5, iVar6); { 4800:1081 }
          param_1 := 0; { routine anchor; statement location unresolved } { 4800:0FFF }
        end; { routine anchor; statement location unresolved } { 4800:0FFF }
      piVar1 := P_Integer((local_7 + $104)); { routine anchor; statement location unresolved } { 4800:0FFF }
      iStack_5 := (P_Integer((local_7 + $106)))^; { 4800:109A }
      local_7 := (piVar1)^; { 4800:1097 }
    end; { routine anchor; statement location unresolved } { 4800:0FFF }
  Exit(local_8); { 4800:10AC }
end; { routine anchor; statement location unresolved } { 4800:0FFF }
```

### ov08:10F6 CombatSpeedMenu (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; bVar2: Boolean [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_255: array[0..255] of Byte [BP-$253]; local_155: array[0..255] of Byte [BP-$153]; local_55: ShortInt [BP-$53]; local_54: array[0..40] of Byte [BP-$52]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): FUN_4800_0e45.  
Callees (export): FUN_00ba_1037, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure CombatSpeedMenu(); { 4800:10F6 }
begin { routine anchor; statement location unresolved } { 4800:10F6 }
  uVar1 := $4800; { routine anchor; statement location unresolved } { 4800:10F6 }
  bVar2 := (@(stack0x0000) = P_Byte($256)); { routine anchor; statement location unresolved } { 4800:10F6 }
  local_55 := 32; { 4800:10FD }
  while Sequence(Flags.ZF := not (LoByte(local_55) in [0, 69]); bVar2) do { 4800:110A }
    begin { routine anchor; statement location unresolved } { 4800:10F6 }
      puVar4 := local_255; { routine anchor; statement location unresolved } { 4800:10F6 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 4800:10F6 }
      PString(local_255, SS) := 'GameSpeed ('; { 4800:111F }
      puVar3 := local_155; { routine anchor; statement location unresolved } { 4800:10F6 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 4800:10F6 }
      FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH, g_49E2)); { 4800:112E }
      PString(local_255, SS) := Copy(PString(local_255, SS) + PString(puVar3, uVar1), 1, 255); { 4800:1133 }
      PString(local_255, SS) := Copy(PString(local_255, SS) + ') :', 1, 255); { 4800:113D }
      PString(local_54, SS) := Copy(PString(puVar4, uVar5), 1, $28); { 4800:114B }
      PString(local_2b, SS) := Copy(' ', 1, $28); { 4800:115E }
      if (g_49E2 < 9) then { routine anchor; statement location unresolved } { 4800:10F6 }
        begin { routine anchor; statement location unresolved } { 4800:10F6 }
          puVar4 := local_155; { routine anchor; statement location unresolved } { 4800:10F6 }
          uVar1 := SS; { routine anchor; statement location unresolved } { 4800:10F6 }
          PString(local_155, SS) := PString(local_2b, SS); { 4800:1175 }
          PString(local_155, SS) := Copy(PString(local_155, SS) + 'Slower ', 1, 255); { 4800:117F }
          PString(local_2b, SS) := Copy(PString(puVar4, uVar1), 1, $28); { 4800:118D }
        end; { routine anchor; statement location unresolved } { 4800:10F6 }
      if (g_49E2 <> 0) then { routine anchor; statement location unresolved } { 4800:10F6 }
        begin { routine anchor; statement location unresolved } { 4800:10F6 }
          puVar4 := local_155; { routine anchor; statement location unresolved } { 4800:10F6 }
          uVar1 := SS; { routine anchor; statement location unresolved } { 4800:10F6 }
          PString(local_155, SS) := PString(local_2b, SS); { 4800:11A4 }
          PString(local_155, SS) := Copy(PString(local_155, SS) + 'Faster ', 1, 255); { 4800:11AE }
          PString(local_2b, SS) := Copy(PString(puVar4, uVar1), 1, $28); { 4800:11BC }
        end; { routine anchor; statement location unresolved } { 4800:10F6 }
      puVar4 := local_155; { routine anchor; statement location unresolved } { 4800:10F6 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 4800:10F6 }
      PString(local_155, SS) := PString(local_2b, SS); { 4800:11CC }
      PString(local_155, SS) := Copy(PString(local_155, SS) + 'Exit', 1, 255); { 4800:11D6 }
      PString(local_2b, SS) := Copy(PString(puVar4, uVar1), 1, $28); { 4800:11E4 }
      uVar1 := $3C5; { routine anchor; statement location unresolved } { 4800:10F6 }
      local_55 := ov25_03BD(P_Byte(@(g_6E31)), $C7C, (Word(UNKNOWN_extraout_AH_00) shl 8), (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), local_2b, SS, local_54, SS); { 4800:1207 }
      if (local_55 = 83) then { routine anchor; statement location unresolved } { 4800:10F6 }
        begin { routine anchor; statement location unresolved } { 4800:10F6 }
          g_49E2 := (g_49E2 + 1); { 4800:1216 }
          bVar2 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 4800:10F6 }
        end; { routine anchor; statement location unresolved } { 4800:10F6 }
      else { routine anchor; statement location unresolved } { 4800:10F6 }
        begin { routine anchor; statement location unresolved } { 4800:10F6 }
          bVar2 := false; { routine anchor; statement location unresolved } { 4800:10F6 }
          if (local_55 = 70) then { routine anchor; statement location unresolved } { 4800:10F6 }
            begin { routine anchor; statement location unresolved } { 4800:10F6 }
              g_49E2 := (g_49E2 - 1); { 4800:1220 }
              bVar2 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 4800:10F6 }
            end; { routine anchor; statement location unresolved } { 4800:10F6 }
        end; { routine anchor; statement location unresolved } { 4800:10F6 }
    end; { routine anchor; statement location unresolved } { 4800:10F6 }
  Exit; { 4800:122A }
end; { routine anchor; statement location unresolved } { 4800:10F6 }
```

### ov08:122B FUN_4800_122b (conf L)

Params (BP stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot].  
Callers (export): FUN_4800_031a.  
Callees (export): none recorded.

```pascal
procedure FUN_4800_122b(param_1: LongWord); { 4800:122B }
begin { routine anchor; statement location unresolved } { 4800:122B }
  uVar4 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4800:122B }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 4800:122B }
  (P_Byte((iVar2 + $10F)))^ := 1; { routine anchor; statement location unresolved } { 4800:122B }
  uVar5 := Word((LongWord((P_LongWord((iVar2 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 4800:122B }
  iVar3 := Integer((P_LongWord((iVar2 + $108)))^); { routine anchor; statement location unresolved } { 4800:122B }
  if ((((P_Integer((iVar3 + 10)))^ <> 0) or else ((P_Integer((iVar3 + $C)))^ <> 0)) and then Sequence((uVar1 := (P_LongWord((Integer((P_LongWord((iVar2 + $108)))^) + 10)))^); ((P_ShortInt((Integer(uVar1) + $10E)))^ = (P_ShortInt((iVar2 + $10E)))^))) then { routine anchor; statement location unresolved } { 4800:122B }
    begin { routine anchor; statement location unresolved } { 4800:122B }
      uVar5 := Word((LongWord((P_LongWord((iVar2 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 4800:122B }
      iVar2 := Integer((P_LongWord((iVar2 + $108)))^); { routine anchor; statement location unresolved } { 4800:122B }
      (P_Word((iVar2 + 10)))^ := 0; { routine anchor; statement location unresolved } { 4800:122B }
      (P_Word((iVar2 + $C)))^ := 0; { routine anchor; statement location unresolved } { 4800:122B }
    end; { routine anchor; statement location unresolved } { 4800:122B }
  Exit; { 4800:1277 }
end; { routine anchor; statement location unresolved } { 4800:122B }
```

### ov08:127A ov08_init (conf H)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

```pascal
procedure ov08_init(); { 4800:127A }
begin { routine anchor; statement location unresolved } { 4800:127A }
  Exit; { 4800:127E }
end; { routine anchor; statement location unresolved } { 4800:127A }
```

### ov15:0000 CalculateStudyTime (conf M)

Params (BP stack slots): param_1: LongWord [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_f: Byte [BP-$D]; local_d: Byte [BP-$B]; local_c: Integer [BP-$A]; iStack_a: Integer [BP-$8]; local_8: Byte [BP-$6]; local_7: Byte [BP-$5]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3].  
Callers (export): FUN_6b00_077a.  
Callees (export): ItemContainsSpell.

Study-time computation: selected memorization bytes are actor +17..+2B with bit 7 set. Adds maximum-level setup 4h, or 6h if any selected spell/scroll level >2, plus 15 minutes per summed spell level. Stores setup hours at actor +2C; scans scroll bytes +3C..+3E. Byte sums wrap.

```pascal
function CalculateStudyTime(param_1: LongWord): Integer; { 6B00:0000 }
begin { routine anchor; statement location unresolved } { 6B00:0000 }
  local_5 := 0; { 6B00:0006 }
  local_6 := 0; { 6B00:000A }
  local_7 := 0; { 6B00:000E }
  local_8 := 0; { 6B00:0012 }
  local_d := 0; { 6B00:0016 }
  while true do { routine anchor; statement location unresolved } { 6B00:0000 }
    begin { routine anchor; statement location unresolved } { 6B00:0000 }
      uVar5 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6B00:0000 }
      iVar4 := Integer(param_1); { routine anchor; statement location unresolved } { 6B00:0000 }
      if ($7F < (P_Byte(((iVar4 + Word(local_d)) + $17)))^) then { routine anchor; statement location unresolved } { 6B00:0000 }
        begin { routine anchor; statement location unresolved } { 6B00:0000 }
          bVar2 := P_Byte(@(g_31FB))[(Word(((P_Byte(((iVar4 + Word(local_d)) + $17)))^ and $7F)) * $10)]; { routine anchor; statement location unresolved } { 6B00:0000 }
          if (local_5 < bVar2) then { routine anchor; statement location unresolved } { 6B00:0000 }
            begin { routine anchor; statement location unresolved } { 6B00:0000 }
              local_5 := bVar2; { 6B00:005A }
            end; { routine anchor; statement location unresolved } { 6B00:0000 }
          local_7 := (local_7 + bVar2); { 6B00:0060 }
        end; { routine anchor; statement location unresolved } { 6B00:0000 }
      if (local_d = $14) then { routine anchor; statement location unresolved } { 6B00:0000 }
        Break; { routine anchor; statement location unresolved } { 6B00:0000 }
      local_d := (local_d + 1); { 6B00:001C }
    end; { routine anchor; statement location unresolved } { 6B00:0000 }
  iStack_a := (P_Integer((iVar4 + $CA)))^; { 6B00:0079 }
  local_c := (P_Integer((iVar4 + 200)))^; { 6B00:0076 }
  while ((local_c <> 0) or else (iStack_a <> 0)) do { routine anchor; statement location unresolved } { 6B00:0000 }
    begin { routine anchor; statement location unresolved } { 6B00:0000 }
      cVar3 := ItemContainsSpell(local_c, iStack_a); { 6B00:008A }
      if (cVar3 <> 0) then { routine anchor; statement location unresolved } { 6B00:0000 }
        begin { routine anchor; statement location unresolved } { 6B00:0000 }
          local_d := 1; { 6B00:0093 }
          while true do { routine anchor; statement location unresolved } { 6B00:0000 }
            begin { routine anchor; statement location unresolved } { 6B00:0000 }
              if ($7F < (P_Byte(((local_c + Word(local_d)) + $3B)))^) then { routine anchor; statement location unresolved } { 6B00:0000 }
                begin { routine anchor; statement location unresolved } { 6B00:0000 }
                  bVar2 := P_Byte(@(g_31FB))[(Word(((P_Byte(((local_c + Word(local_d)) + $3B)))^ and $7F)) * $10)]; { routine anchor; statement location unresolved } { 6B00:0000 }
                  if (local_6 < bVar2) then { routine anchor; statement location unresolved } { 6B00:0000 }
                    begin { routine anchor; statement location unresolved } { 6B00:0000 }
                      local_6 := bVar2; { 6B00:00D7 }
                    end; { routine anchor; statement location unresolved } { 6B00:0000 }
                  local_8 := (local_8 + bVar2); { 6B00:00DD }
                end; { routine anchor; statement location unresolved } { 6B00:0000 }
              if (local_d = 3) then { routine anchor; statement location unresolved } { 6B00:0000 }
                Break; { routine anchor; statement location unresolved } { 6B00:0000 }
              local_d := (local_d + 1); { 6B00:0099 }
            end; { routine anchor; statement location unresolved } { 6B00:0000 }
        end; { routine anchor; statement location unresolved } { 6B00:0000 }
      piVar1 := P_Integer((local_c + $2A)); { routine anchor; statement location unresolved } { 6B00:0000 }
      iStack_a := (P_Integer((local_c + $2C)))^; { 6B00:00F4 }
      local_c := (piVar1)^; { 6B00:00F1 }
    end; { routine anchor; statement location unresolved } { 6B00:0000 }
  local_f := 0; { 6B00:00F9 }
  if ((local_7 <> 0) or else (local_8 <> 0)) then { routine anchor; statement location unresolved } { 6B00:0000 }
    begin { routine anchor; statement location unresolved } { 6B00:0000 }
      local_f := 4; { 6B00:0109 }
    end; { routine anchor; statement location unresolved } { 6B00:0000 }
  if ((2 < local_5) or else (2 < local_6)) then { routine anchor; statement location unresolved } { 6B00:0000 }
    begin { routine anchor; statement location unresolved } { 6B00:0000 }
      local_f := 6; { 6B00:0119 }
    end; { routine anchor; statement location unresolved } { 6B00:0000 }
  (P_Byte((iVar4 + $2C)))^ := local_f; { routine anchor; statement location unresolved } { 6B00:0000 }
  Exit((((Word(local_f) * $3C) + (Word(local_7) * $F)) + (Word(local_8) * $F))); { 6B00:0156 }
end; { routine anchor; statement location unresolved } { 6B00:0000 }
```

### ov15:0159 ClearMemorizeSelections (conf M)

Params: actor: far pointer [BP+6,+8].  
Locals: i: Byte [BP-1].  
Callers (export): FUN_6b00_0214,FUN_6b00_090a.  
Callees (export): none recorded.

Clears only bit-7-marked memorization slots in +17..+2B (sets to 0), then actor +2C=0; unmarked memorized spells remain.

**Assembly review:** Keeps unmarked memorized spells. The 21-entry upper bound20 is inclusive.

```pascal
procedure ClearMemorizeSelections(actor: FarPtr); { 6B00:0159 }
begin { 6B00:0159 }
  for i := 0 to 20 do { 6B00:015F }
    if ByteAt(actor,$17+i) > $7F then { 6B00:0172 }
      ByteAt(actor,$17+i) := 0; { 6B00:0183 }
  ByteAt(actor,$2C) := 0; { 6B00:0191 }
end; { 6B00:0199 }
```

### ov15:019C ClearScribeSelections (conf M)

Params: actor: far pointer [BP+6,+8].  
Locals: item: far pointer [BP-5,-3]; i: Byte [BP-1].  
Callers (export): FUN_6b00_0214,FUN_6b00_0b5b.  
Callees (export): ItemContainsSpell.

For scroll items recognized by ov22 entry 6, clears bit 7 of each +3C..+3E spell byte. Does not delete unselected spell ids.

**Assembly review:** Calls overlay22 entry6 (8E00:323D); each of the three scroll spell bytes loses only its plan bit. No scroll deletion.

```pascal
procedure ClearScribeSelections(actor: FarPtr); { 6B00:019C }
begin { 6B00:019C }
  item := FarPtrAt(actor,$C8); { 6B00:01AF }
  while item <> nil do begin { 6B00:01B8 }
    if ItemContainsSpell(item) then { 6B00:01C3 }
      for i := 1 to 3 do { 6B00:01CC }
        ByteAt(item,$3B+i) := ByteAt(item,$3B+i) and $7F; { 6B00:01F1 }
    item := FarPtrAt(item,$2A); { 6B00:0206 }
  end; { 6B00:020C }
end; { 6B00:0211 }
```

### ov15:0214 ClearPartyStudySelections (conf M)

Params (BP stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): ov15_1E6F.  
Callees (export): ClearMemorizeSelections, ClearScribeSelections.

```pascal
procedure ClearPartyStudySelections(); { 6B00:0214 }
begin { routine anchor; statement location unresolved } { 6B00:0214 }
  uStack_4 := g_5D98; { 6B00:0224 }
  local_6 := PartyHead; { 6B00:0221 }
  while ((local_6 <> 0) or else (uStack_4 <> 0)) do { routine anchor; statement location unresolved } { 6B00:0214 }
    begin { routine anchor; statement location unresolved } { 6B00:0214 }
      ClearMemorizeSelections(local_6, uStack_4); { 6B00:0236 }
      ClearScribeSelections(local_6, uStack_4); { 6B00:0240 }
      piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 6B00:0214 }
      uStack_4 := (P_Integer((local_6 + $106)))^; { 6B00:0253 }
      local_6 := (piVar1)^; { 6B00:0250 }
    end; { routine anchor; statement location unresolved } { 6B00:0214 }
  Exit; { 6B00:025B }
end; { routine anchor; statement location unresolved } { 6B00:0214 }
```

### ov15:025C RemainingMemorizeSlots (conf M)

Params: school: Byte [BP+6]; level: Byte [BP+8] (stack order school,level; declaration here uses that order).  
Locals: used: Byte [BP-2]; i: Byte [BP-3].  
Callers (export): FUN_6b00_05a4,FUN_6b00_090a.  
Callees (export): none recorded.

Remaining capacity = actor capacity byte at +B1 + 3*school + level minus count of nonzero memorization bytes with matching metadata at DS:31FA/31FB + id*16. No clamp to zero is visible in the return expression.

**Assembly review:** Signature here keeps stack-slot order school,level (original Pascal order level,school). SUB computes a word but the saved result is AL-only at02F6: expose a byte result, with no clamp. AH left in the machine is not a second meaningful result.

```pascal
function RemainingMemorizeSlots(school,level: Byte): Byte; { 6B00:025C }
begin { 6B00:025C }
  used := 0; { 6B00:0262 }
  for i := 0 to 20 do { 6B00:0266 }
    if ByteAt(SelectedActor,$17+i) <> 0 then begin { 6B00:027A }
      id := ByteAt(SelectedActor,$17+i) and $7F; { 6B00:0290 }
      if (ByteAtDS($31FB+16*id) = level) and then (ByteAtDS($31FA+16*id) = school) then { 6B00:029E }
        used := Byte(used+1); { 6B00:02C5 }
    end; { 6B00:02C8 }
  RemainingMemorizeSlots := Byte(ByteAt(SelectedActor,$B1+3*school+level)-used); { 6B00:02F6 }
end; { 6B00:02FF }
```

### ov15:036C CanPerformSpellActivity (conf M)

Params: activity: Byte [BP+6].  
Locals: message: string[40] [BP-2A]; result: Byte [BP-1]; concat scratch [BP-12A].  
Callers (export): FUN_6b00_090a,FUN_6b00_0b5b,ov15_04A1.  
Callees (export): FUN_00ba_16ec, System.@StrAppend, System.@StrAssign, System.@StrCopy.

Activity 1=cast,2=memorize,3=scribe. Casting blocked by word +1CA in g_49D2; status 1 or inactive actor blocks all activities. Builds the exact action-specific condition message and returns success only when no message was generated.

**Assembly review:** The area restriction is checked before actor condition, so it controls which error text is shown. Message string is capacity40; generic C register artifacts removed.

```pascal
function CanPerformSpellActivity(activity: Byte): Boolean; { 6B00:036C }
begin { 6B00:036C }
  message := ''; { 6B00:0373 }
  if (activity = 1) and then (WordAt(ecl_Mem4900,$1CA) <> 0) then { 6B00:0377 }
    message := Copy('cannot cast spells in this area',1,40) { 6B00:0397 }
  else if (ByteAt(SelectedActor,$10C) = 1) or else (ByteAt(SelectedActor,$10D) = 0) then begin { 6B00:03A3 }
    message := 'is in no condition to '; { 6B00:03C8 }
    case activity of { 6B00:03D0 }
      1: message := Copy(message+'cast any spells',1,40); { 6B00:03F7 }
      2: message := Copy(message+'memorize spells',1,40); { 6B00:0425 }
      3: message := Copy(message+'scribe any scrolls',1,40); { 6B00:0453 }
    end; { 6B00:0458 }
  end; { 6B00:0458 }
  CanPerformSpellActivity := Length(message)=0; { 6B00:0458 }
  if message <> '' then { 6B00:0458 }
    FUN_00ba_16ec(1,10,message,actor:=SelectedActor); { 6B00:047B }
end; { 6B00:0486 }
```

### ov15:04A1 CampCastMenu (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_20: array[0..23] of Byte [BP-$1E]; local_8: ShortInt [BP-$6]; local_7: Byte [BP-$5]; local_6: ShortInt [BP-$4]; local_5: ShortInt [BP-$3]; local_4: Word [BP-$2].  
Callers (export): FUN_6b00_13f1.  
Callees (export): FUN_00ba_16ec, FUN_00ba_27d9, FUN_03f1_0000, FUN_03f1_0137, CanPerformSpellActivity, System.@StrCopy, ov19_299C, CastSpellOrUseItem.

```pascal
procedure CampCastMenu(); { 6B00:04A1 }
begin { routine anchor; statement location unresolved } { 6B00:04A1 }
  local_6 := 0; { 6B00:04A7 }
  local_4 := $FFFF; { 6B00:04AB }
  g_6DB5 := 0; { 6B00:04B2 }
  g_6DB7 := 0; { 6B00:04B5 }
  uVar2 := CanPerformSpellActivity(1); { 6B00:04BC }
  cVar1 := ShortInt(uVar2); { routine anchor; statement location unresolved } { 6B00:04A1 }
  while (cVar1 <> 0) do { routine anchor; statement location unresolved } { 6B00:04A1 }
    begin { routine anchor; statement location unresolved } { 6B00:04A1 }
      uVar2 := ov19_299C(@(local_5), SS, @(local_4), SS, 1, (uVar2 and $FF00)); { 6B00:04D6 }
      local_8 := ShortInt(uVar2); { 6B00:04DB }
      if (local_8 = 0) then { routine anchor; statement location unresolved } { 6B00:04A1 }
        begin { routine anchor; statement location unresolved } { 6B00:04A1 }
          if (local_5 = 0) then { routine anchor; statement location unresolved } { 6B00:04A1 }
            begin { routine anchor; statement location unresolved } { 6B00:04A1 }
              puVar4 := local_20; { routine anchor; statement location unresolved } { 6B00:04A1 }
              uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:04A1 }
              uVar6 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:04A1 }
              uVar7 := g_5D94; { routine anchor; statement location unresolved } { 6B00:04A1 }
              PString(local_20, SS) := 'has no spells memorized'; { 6B00:0546 }
              uVar2 := FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_01, 1), Pack16(UNKNOWN_extraout_AH_01, 10), puVar4, uVar5, uVar6, uVar7); { 6B00:0551 }
              cVar1 := local_8; { routine anchor; statement location unresolved } { 6B00:04A1 }
            end; { routine anchor; statement location unresolved } { 6B00:04A1 }
          else { routine anchor; statement location unresolved } { 6B00:04A1 }
            begin { routine anchor; statement location unresolved } { 6B00:04A1 }
              local_6 := 1; { 6B00:04E4 }
              cVar1 := local_8; { routine anchor; statement location unresolved } { 6B00:04A1 }
            end; { routine anchor; statement location unresolved } { 6B00:04A1 }
        end; { routine anchor; statement location unresolved } { 6B00:04A1 }
      else { routine anchor; statement location unresolved } { 6B00:04A1 }
        begin { routine anchor; statement location unresolved } { 6B00:04A1 }
          local_6 := 1; { 6B00:052E }
          bVar3 := Byte((uVar2 shr 8)); { routine anchor; statement location unresolved } { 6B00:04A1 }
          FUN_03f1_0000((Word(bVar3) shl 8), Pack16(bVar3, $16), Pack16(bVar3, $26), Pack16(bVar3, $11), Pack16(bVar3, 1)); { 6B00:04F7 }
          FUN_03f1_0137(Pack16(UNKNOWN_extraout_AH, $16), Pack16(UNKNOWN_extraout_AH, $26), Pack16(UNKNOWN_extraout_AH, $11), Pack16(UNKNOWN_extraout_AH, 1)); { 6B00:0508 }
          uVar2 := CastSpellOrUseItem(@(local_7), SS, Pack16(UNKNOWN_extraout_AH_00, 1), (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, local_8)); { 6B00:051C }
          local_4 := $FFFF; { 6B00:0521 }
          cVar1 := local_8; { routine anchor; statement location unresolved } { 6B00:04A1 }
        end; { routine anchor; statement location unresolved } { 6B00:04A1 }
    end; { routine anchor; statement location unresolved } { 6B00:04A1 }
  if (local_6 <> 0) then { routine anchor; statement location unresolved } { 6B00:04A1 }
    begin { routine anchor; statement location unresolved } { 6B00:04A1 }
      FUN_00ba_27d9(); { 6B00:0565 }
    end; { routine anchor; statement location unresolved } { 6B00:04A1 }
  Exit; { 6B00:056D }
end; { routine anchor; statement location unresolved } { 6B00:04A1 }
```

### ov15:05A4 ShowMemorizeCapacity (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; cVar4: ShortInt [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_145: array[0..241] of Byte [BP-$143]; local_53: array[0..13] of Byte [BP-$51]; local_45: ShortInt [BP-$43]; local_44: array[0..23] of Byte [BP-$42]; local_2c: array[0..41] of Byte [BP-$2A].  
Callers (export): FUN_6b00_090a.  
Callees (export): FUN_00ba_1037, FUN_00ba_16ec, FUN_0709_0626, RemainingMemorizeSlots, System.@StrAssign, System.@StrCopy.

```pascal
function ShowMemorizeCapacity(): Word; { 6B00:05A4 }
begin { routine anchor; statement location unresolved } { 6B00:05A4 }
  local_45 := 0; { 6B00:05AB }
  local_44[3] := 0; { routine anchor; statement location unresolved } { 6B00:05A4 }
  while true do { routine anchor; statement location unresolved } { 6B00:05A4 }
    begin { routine anchor; statement location unresolved } { 6B00:05A4 }
      local_44[(ShortInt(local_44[3]) + 4)] := 0; { routine anchor; statement location unresolved } { 6B00:05A4 }
      local_44[2] := 1; { routine anchor; statement location unresolved } { 6B00:05A4 }
      while true do { routine anchor; statement location unresolved } { 6B00:05A4 }
        begin { routine anchor; statement location unresolved } { 6B00:05A4 }
          puVar6 := local_145; { routine anchor; statement location unresolved } { 6B00:05A4 }
          uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:05A4 }
          uVar1 := RemainingMemorizeSlots(local_44[3], local_44[2]); { 6B00:05DA }
          FUN_00ba_1037(uVar1); { 6B00:05DE }
          PString(((local_44 + (ShortInt(local_44[2]) * 6)) + (ShortInt(local_44[3]) * 3)), SS) := Copy(PString(puVar6, uVar7), 1, 2); { 6B00:0608 }
          if ((P_ShortInt((((Integer(_SelectedChar) + (ShortInt(local_44[3]) * 3)) + Integer(ShortInt(local_44[2]))) + $B1)))^ = 0) then { routine anchor; statement location unresolved } { 6B00:05A4 }
            begin { routine anchor; statement location unresolved } { 6B00:05A4 }
              PString(((local_44 + (ShortInt(local_44[2]) * 6)) + (ShortInt(local_44[3]) * 3)), SS) := Copy(PString($56E, $AF8), 1, 2); { 6B00:0657 }
              iVar2 := UNKNOWN_AXAfterHelper; { 6B00:0657 }
            end; { routine anchor; statement location unresolved } { 6B00:05A4 }
          else { routine anchor; statement location unresolved } { 6B00:05A4 }
            begin { routine anchor; statement location unresolved } { 6B00:05A4 }
              iVar2 := Integer(ShortInt(local_44[3])); { routine anchor; statement location unresolved } { 6B00:05A4 }
              local_44[(iVar2 + 4)] := 1; { routine anchor; statement location unresolved } { 6B00:05A4 }
              local_45 := 1; { 6B00:0668 }
            end; { routine anchor; statement location unresolved } { 6B00:05A4 }
          uVar3 := Byte((Word(iVar2) shr 8)); { routine anchor; statement location unresolved } { 6B00:05A4 }
          if (local_44[2] = 3) then { routine anchor; statement location unresolved } { 6B00:05A4 }
            Break; { routine anchor; statement location unresolved } { 6B00:05A4 }
          local_44[2] := (local_44[2] + 1); { routine anchor; statement location unresolved } { 6B00:05A4 }
        end; { routine anchor; statement location unresolved } { 6B00:05A4 }
      if (local_44[3] = 1) then { routine anchor; statement location unresolved } { 6B00:05A4 }
        Break; { routine anchor; statement location unresolved } { 6B00:05A4 }
      local_44[3] := (local_44[3] + 1); { routine anchor; statement location unresolved } { 6B00:05A4 }
    end; { routine anchor; statement location unresolved } { 6B00:05A4 }
  if (local_45 <> 0) then { routine anchor; statement location unresolved } { 6B00:05A4 }
    begin { routine anchor; statement location unresolved } { 6B00:05A4 }
      puVar6 := local_53; { routine anchor; statement location unresolved } { 6B00:05A4 }
      uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:05A4 }
      uVar1 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:05A4 }
      uVar8 := g_5D94; { routine anchor; statement location unresolved } { 6B00:05A4 }
      PString(local_53, SS) := 'can memorize:'; { 6B00:0699 }
      uVar5 := $BA; { routine anchor; statement location unresolved } { 6B00:05A4 }
      FUN_00ba_16ec((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 10), puVar6, uVar7, uVar1, uVar8); { 6B00:06A4 }
      local_44[0] := 3; { routine anchor; statement location unresolved } { 6B00:05A4 }
      local_44[3] := 0; { routine anchor; statement location unresolved } { 6B00:05A4 }
      while true do { routine anchor; statement location unresolved } { 6B00:05A4 }
        begin { routine anchor; statement location unresolved } { 6B00:05A4 }
          iVar2 := Integer(ShortInt(local_44[3])); { routine anchor; statement location unresolved } { 6B00:05A4 }
          if (local_44[(iVar2 + 4)] <> 0) then { routine anchor; statement location unresolved } { 6B00:05A4 }
            begin { routine anchor; statement location unresolved } { 6B00:05A4 }
              cVar4 := (ShortInt(local_44[3]) shr 7); { routine anchor; statement location unresolved } { 6B00:05A4 }
              if (local_44[3] = 0) then { routine anchor; statement location unresolved } { 6B00:05A4 }
                begin { routine anchor; statement location unresolved } { 6B00:05A4 }
                  PString(local_2c, SS) := Copy('    Cleric Spells:', 1, $28); { 6B00:06DA }
                  cVar4 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 6B00:05A4 }
                end; { routine anchor; statement location unresolved } { 6B00:05A4 }
              else { routine anchor; statement location unresolved } { 6B00:05A4 }
                if (local_44[3] = 1) then { routine anchor; statement location unresolved } { 6B00:05A4 }
                  begin { routine anchor; statement location unresolved } { 6B00:05A4 }
                    PString(local_2c, SS) := Copy('Magic-User Spells:', 1, $28); { 6B00:06F3 }
                    cVar4 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 6B00:05A4 }
                  end; { routine anchor; statement location unresolved } { 6B00:05A4 }
              FUN_0709_0626(local_2c, SS, Pack16(ShortInt(((local_44[0] + $11) shr 8)), 10), (local_44[0] + $11), Pack16(cVar4, 1)); { 6B00:070C }
              local_44[1] := $13; { routine anchor; statement location unresolved } { 6B00:05A4 }
              local_44[2] := 1; { routine anchor; statement location unresolved } { 6B00:05A4 }
              while true do { routine anchor; statement location unresolved } { 6B00:05A4 }
                begin { routine anchor; statement location unresolved } { 6B00:05A4 }
                  uVar5 := $709; { routine anchor; statement location unresolved } { 6B00:05A4 }
                  iVar2 := FUN_0709_0626(((local_44 + (ShortInt(local_44[2]) * 6)) + (ShortInt(local_44[3]) * 3)), SS, Pack16(ShortInt(((local_44[0] + $11) shr 8)), 10), (local_44[0] + $11), (local_44[1] + 1)); { 6B00:0752 }
                  local_44[1] := (local_44[1] + 3); { routine anchor; statement location unresolved } { 6B00:05A4 }
                  if (local_44[2] = 3) then { routine anchor; statement location unresolved } { 6B00:05A4 }
                    Break; { routine anchor; statement location unresolved } { 6B00:05A4 }
                  local_44[2] := (local_44[2] + 1); { routine anchor; statement location unresolved } { 6B00:05A4 }
                end; { routine anchor; statement location unresolved } { 6B00:05A4 }
              local_44[0] := (local_44[0] + 1); { routine anchor; statement location unresolved } { 6B00:05A4 }
            end; { routine anchor; statement location unresolved } { 6B00:05A4 }
          uVar3 := Byte((Word(iVar2) shr 8)); { routine anchor; statement location unresolved } { 6B00:05A4 }
          if (local_44[3] = 1) then { routine anchor; statement location unresolved } { 6B00:05A4 }
            Break; { routine anchor; statement location unresolved } { 6B00:05A4 }
          local_44[3] := (local_44[3] + 1); { routine anchor; statement location unresolved } { 6B00:05A4 }
        end; { routine anchor; statement location unresolved } { 6B00:05A4 }
    end; { routine anchor; statement location unresolved } { 6B00:05A4 }
  Exit(Pack16(uVar3, local_45)); { 6B00:0779 }
end; { routine anchor; statement location unresolved } { 6B00:05A4 }
```

### ov15:077A RestWithStudyPlan (conf M)

Params: rested: Byte via far pointer [BP+6,+8].  
Locals: maximum minutes: Word [BP-6]; candidate minutes: Word [BP-8]; actor: far pointer [BP-4,-2].  
Callers (export): FUN_6b00_13f1,ov15_1E6F.  
Callees (export): FUN_00ba_290b, CalculateStudyTime, System.FillChar, ov20_0C9A.

**Assembly review:** Takes the maximum study time across actors, not the sum. Splits into hours/tens-of-minutes/minutes for the rest menu. Rest helper return written through caller pointer.

```pascal
procedure RestWithStudyPlan(var rested: Byte); { 6B00:077A }
begin { 6B00:077A }
  minutes := 0; { 6B00:0780 }
  actor := FarPtr(g_5D98,PartyHead); { 6B00:078C }
  while actor <> nil do begin { 6B00:0795 }
    candidate := CalculateStudyTime(actor); { 6B00:07A1 }
    if candidate > minutes then minutes := candidate; { 6B00:07AA }
    actor := FarPtrAt(actor,$104); { 6B00:07C2 }
  end; { 6B00:07C8 }
  g_6DC8 := minutes div 60; { 6B00:07D4 }
  g_6DC6 := (minutes mod 60) div 10; { 6B00:07EC }
  g_6DC4 := minutes mod 10; { 6B00:07FA }
  rested := ov20_0C9A; { 6B00:07FD }
  FillChar(MemRef($6DC2,DS),14,0); { 6B00:0814 }
  FUN_00ba_290b; { 6B00:0819 }
end; { 6B00:0821 }
```

### ov15:0824 SortMemorizedSpells (conf M)

Params: none.  
Locals: i: Byte [BP-1]; j: Byte [BP-2]; temp: register byte.  
Callers (export): FUN_6b00_090a.  
Callees (export): none recorded.

**Assembly review:** Sorts by masked spell id while swapping the complete byte, retaining plan bit7. Zeros sort before nonzero ids.

```pascal
procedure SortMemorizedSpells; { 6B00:0824 }
begin { 6B00:0824 }
  for i := 0 to 19 do { 6B00:082A }
    for j := i to 20 do { 6B00:0836 }
      if (ByteAt(SelectedActor,$17+j) and $7F) < (ByteAt(SelectedActor,$17+i) and $7F) then begin { 6B00:0866 }
        temp := ByteAt(SelectedActor,$17+i); { 6B00:086D }
        ByteAt(SelectedActor,$17+i) := ByteAt(SelectedActor,$17+j); { 6B00:0896 }
        ByteAt(SelectedActor,$17+j) := temp; { 6B00:08A8 }
      end; { 6B00:08AC }
end; { 6B00:08BE }
```

### ov15:090A MemorizeMenu (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar5: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar6: Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; local_24: array[0..2] of Byte [BP-$22]; local_21: array[0..23] of Byte [BP-$1F]; local_9: Integer [BP-$7]; local_7: Byte [BP-$5]; local_6: ShortInt [BP-$4]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): FUN_6b00_13f1.  
Callees (export): FUN_00ba_16ec, FUN_00ba_27d9, ClearMemorizeSelections, RemainingMemorizeSlots, CanPerformSpellActivity, ShowMemorizeCapacity, SortMemorizedSpells, System.@StrCopy, ov19_299C, ov25_10D1.

```pascal
procedure MemorizeMenu(); { 6B00:090A }
begin { routine anchor; statement location unresolved } { 6B00:090A }
  uVar2 := CanPerformSpellActivity(2); { 6B00:0914 }
  bVar5 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 6B00:090A }
  if (ShortInt(uVar2) <> 0) then { routine anchor; statement location unresolved } { 6B00:090A }
    begin { routine anchor; statement location unresolved } { 6B00:090A }
      local_3 := 0; { 6B00:091E }
      local_9 := -(1); { 6B00:0922 }
      uVar2 := $85; { routine anchor; statement location unresolved } { 6B00:090A }
      uVar3 := ov19_299C(@(local_4), SS, @(local_9), SS, (Word(bVar5) shl 8), Pack16(bVar5, 5)); { 6B00:0937 }
      local_6 := ShortInt(uVar3); { 6B00:093C }
      local_5 := 1; { 6B00:093F }
      if (local_4 = 0) then { routine anchor; statement location unresolved } { 6B00:090A }
        begin { routine anchor; statement location unresolved } { 6B00:090A }
          local_5 := 0; { 6B00:097E }
        end; { routine anchor; statement location unresolved } { 6B00:090A }
      else { routine anchor; statement location unresolved } { 6B00:090A }
        begin { routine anchor; statement location unresolved } { 6B00:090A }
          puVar8 := local_21; { routine anchor; statement location unresolved } { 6B00:090A }
          uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:090A }
          PString(local_21, SS) := 'Memorize These Spells? '; { 6B00:0953 }
          uVar2 := $3C5; { routine anchor; statement location unresolved } { 6B00:090A }
          uVar3 := ov25_10D1(Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $E), puVar8, uVar7); { 6B00:0961 }
          if (ShortInt(uVar3) = 78) then { routine anchor; statement location unresolved } { 6B00:090A }
            begin { routine anchor; statement location unresolved } { 6B00:090A }
              uVar3 := ClearMemorizeSelections(SelectedChar, g_5D94); { 6B00:0973 }
            end; { routine anchor; statement location unresolved } { 6B00:090A }
          else { routine anchor; statement location unresolved } { 6B00:090A }
            begin { routine anchor; statement location unresolved } { 6B00:090A }
              local_3 := 1; { 6B00:0978 }
            end; { routine anchor; statement location unresolved } { 6B00:090A }
        end; { routine anchor; statement location unresolved } { 6B00:090A }
      local_9 := -(1); { 6B00:0982 }
      while (local_3 = 0) do { routine anchor; statement location unresolved } { 6B00:090A }
        begin { routine anchor; statement location unresolved } { 6B00:090A }
          uVar3 := ShowMemorizeCapacity(); { 6B00:0991 }
          uVar4 := (uVar3 and $FF00); { routine anchor; statement location unresolved } { 6B00:090A }
          if (ShortInt(uVar3) = 0) then { routine anchor; statement location unresolved } { 6B00:090A }
            begin { routine anchor; statement location unresolved } { 6B00:090A }
              uVar4 := (uVar4 + 1); { routine anchor; statement location unresolved } { 6B00:090A }
            end; { routine anchor; statement location unresolved } { 6B00:090A }
          local_3 := ShortInt(uVar4); { 6B00:099B }
          if (local_3 = 0) then { routine anchor; statement location unresolved } { 6B00:090A }
            begin { routine anchor; statement location unresolved } { 6B00:090A }
              uVar6 := Byte((uVar4 shr 8)); { routine anchor; statement location unresolved } { 6B00:090A }
              uVar2 := $85; { routine anchor; statement location unresolved } { 6B00:090A }
              uVar3 := ov19_299C(@(local_4), SS, @(local_9), SS, Pack16(uVar6, 2), Pack16(uVar6, 1)); { 6B00:09D9 }
              local_6 := ShortInt(uVar3); { 6B00:09DE }
              local_5 := 1; { 6B00:09E1 }
              if (local_6 = 0) then { routine anchor; statement location unresolved } { 6B00:090A }
                begin { routine anchor; statement location unresolved } { 6B00:090A }
                  local_3 := 1; { 6B00:09EB }
                end; { routine anchor; statement location unresolved } { 6B00:090A }
              else { routine anchor; statement location unresolved } { 6B00:090A }
                begin { routine anchor; statement location unresolved } { 6B00:090A }
                  uVar3 := RemainingMemorizeSlots(P_Byte(@(g_31FA))[((uVar3 and $FF) * $10)], P_Byte(@(g_31FB))[((uVar3 and $FF) * $10)]); { 6B00:0A12 }
                  if (ShortInt(uVar3) <> 0) then { routine anchor; statement location unresolved } { 6B00:090A }
                    begin { routine anchor; statement location unresolved } { 6B00:090A }
                      local_7 := 0; { 6B00:0A19 }
                      while true do { routine anchor; statement location unresolved } { 6B00:090A }
                        begin { routine anchor; statement location unresolved } { 6B00:090A }
                          uVar7 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 6B00:090A }
                          if ((P_ShortInt(((Integer(_SelectedChar) + Word(local_7)) + $17)))^ = 0) then { routine anchor; statement location unresolved } { 6B00:090A }
                            Break; { routine anchor; statement location unresolved } { 6B00:090A }
                          local_7 := (local_7 + 1); { 6B00:0A2F }
                        end; { routine anchor; statement location unresolved } { 6B00:090A }
                      (P_ShortInt(((Integer(_SelectedChar) + Word(local_7)) + $17)))^ := (local_6 + -($80)); { routine anchor; statement location unresolved } { 6B00:090A }
                      uVar3 := SortMemorizedSpells(); { 6B00:0A4E }
                    end; { routine anchor; statement location unresolved } { 6B00:090A }
                end; { routine anchor; statement location unresolved } { 6B00:090A }
            end; { routine anchor; statement location unresolved } { 6B00:090A }
          else { routine anchor; statement location unresolved } { 6B00:090A }
            begin { routine anchor; statement location unresolved } { 6B00:090A }
              puVar8 := local_24; { routine anchor; statement location unresolved } { 6B00:090A }
              uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:090A }
              uVar9 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:090A }
              uVar10 := g_5D94; { routine anchor; statement location unresolved } { 6B00:090A }
              PString(local_24, SS) := 'cannot memorize any spells'; { 6B00:09B6 }
              uVar2 := $BA; { routine anchor; statement location unresolved } { 6B00:090A }
              uVar3 := FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 10), puVar8, uVar7, uVar9, uVar10); { 6B00:09C1 }
            end; { routine anchor; statement location unresolved } { 6B00:090A }
        end; { routine anchor; statement location unresolved } { 6B00:090A }
      if (local_9 <> -(1)) then { routine anchor; statement location unresolved } { 6B00:090A }
        begin { routine anchor; statement location unresolved } { 6B00:090A }
          local_9 := -(1); { 6B00:0A5A }
          bVar5 := Byte((uVar3 shr 8)); { routine anchor; statement location unresolved } { 6B00:090A }
          local_6 := ov19_299C(@(local_4), SS, @(local_9), SS, (Word(bVar5) shl 8), Pack16(bVar5, 5)); { 6B00:0A6F }
          if (local_4 <> 0) then { routine anchor; statement location unresolved } { 6B00:090A }
            begin { routine anchor; statement location unresolved } { 6B00:090A }
              puVar8 := local_21; { routine anchor; statement location unresolved } { 6B00:090A }
              PString(local_21, SS) := 'Memorize these spells? '; { 6B00:0A87 }
              cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 10), Pack16(UNKNOWN_extraout_AH_01, $E), puVar8, SS); { 6B00:0A95 }
              if (cVar1 = 78) then { routine anchor; statement location unresolved } { 6B00:090A }
                begin { routine anchor; statement location unresolved } { 6B00:090A }
                  ClearMemorizeSelections(SelectedChar, g_5D94); { 6B00:0AA7 }
                end; { routine anchor; statement location unresolved } { 6B00:090A }
            end; { routine anchor; statement location unresolved } { 6B00:090A }
        end; { routine anchor; statement location unresolved } { 6B00:090A }
      if (local_5 <> 0) then { routine anchor; statement location unresolved } { 6B00:090A }
        begin { routine anchor; statement location unresolved } { 6B00:090A }
          FUN_00ba_27d9(); { 6B00:0AB0 }
        end; { routine anchor; statement location unresolved } { 6B00:090A }
    end; { routine anchor; statement location unresolved } { 6B00:090A }
  Exit; { 6B00:0AB8 }
end; { routine anchor; statement location unresolved } { 6B00:090A }
```

### ov15:0B5B ScribeMenu (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_32: array[0..3] of Byte [BP-$30]; local_2e: array[0..2] of Byte [BP-$2C]; local_2b: array[0..3] of Byte [BP-$29]; local_27: array[0..1] of Byte [BP-$25]; local_25: array[0..21] of Byte [BP-$23]; local_f: ShortInt [BP-$D]; local_e: Word [BP-$C]; uStack_c: Word [BP-$A]; local_a: Integer [BP-$8]; local_8: Byte [BP-$6]; local_6: Byte [BP-$4]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): FUN_6b00_13f1.  
Callees (export): FUN_00ba_1693, FUN_00ba_16ec, FUN_00ba_27d9, ClearScribeSelections, CanPerformSpellActivity, System.@StrCopy, ov19_299C, ItemContainsSpell, ov25_10D1.

Exact typo `You are already scibing that spell` is in the image. Preserve existing-known, already-marked, incompatible-spell and no-scroll branches separately.

```pascal
procedure ScribeMenu(); { 6B00:0B5B }
begin { routine anchor; statement location unresolved } { 6B00:0B5B }
  uVar2 := CanPerformSpellActivity(3); { 6B00:0B65 }
  bVar4 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 6B00:0B5B }
  if (ShortInt(uVar2) <> 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
    begin { routine anchor; statement location unresolved } { 6B00:0B5B }
      local_3 := 0; { 6B00:0B6F }
      local_a := -(1); { 6B00:0B73 }
      uVar3 := ov19_299C(@(local_4), SS, @(local_a), SS, (Word(bVar4) shl 8), Pack16(bVar4, 6)); { 6B00:0B88 }
      local_6 := Byte(uVar3); { 6B00:0B8D }
      local_5 := 1; { 6B00:0B90 }
      if (local_4 = 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
          local_5 := 0; { 6B00:0BCF }
        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
      else { routine anchor; statement location unresolved } { 6B00:0B5B }
        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
          puVar7 := local_25; { routine anchor; statement location unresolved } { 6B00:0B5B }
          uVar2 := SS; { routine anchor; statement location unresolved } { 6B00:0B5B }
          PString(local_25, SS) := 'Scribe These Spells? '; { 6B00:0BA4 }
          uVar3 := ov25_10D1(Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $E), puVar7, uVar2); { 6B00:0BB2 }
          if (ShortInt(uVar3) = 78) then { routine anchor; statement location unresolved } { 6B00:0B5B }
            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
              uVar3 := ClearScribeSelections(SelectedChar, g_5D94); { 6B00:0BC4 }
            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
          else { routine anchor; statement location unresolved } { 6B00:0B5B }
            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
              local_3 := 1; { 6B00:0BC9 }
            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
      local_a := -(1); { 6B00:0BD3 }
      while Sequence((bVar4 := Byte((uVar3 shr 8))); (local_3 = 0)) do { routine anchor; statement location unresolved } { 6B00:0B5B }
        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
          uVar2 := $85; { routine anchor; statement location unresolved } { 6B00:0B5B }
          uVar3 := ov19_299C(@(local_4), SS, @(local_a), SS, Pack16(bVar4, 3), Pack16(bVar4, 3)); { 6B00:0BF1 }
          local_6 := Byte(uVar3); { 6B00:0BF6 }
          if (local_6 = 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
              local_3 := 1; { 6B00:0BFF }
              if (local_4 = 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                  puVar7 := local_27; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  uVar2 := SS; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  iVar5 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  uVar6 := g_5D94; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  PString(local_27, SS) := 'has no copyable scrolls'; { 6B00:0C1B }
                  uVar3 := FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 10), puVar7, uVar2, iVar5, uVar6); { 6B00:0C26 }
                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
              else { routine anchor; statement location unresolved } { 6B00:0B5B }
                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                  local_5 := 1; { 6B00:0C2D }
                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
          else { routine anchor; statement location unresolved } { 6B00:0B5B }
            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
              local_5 := 1; { 6B00:0C34 }
              if ((P_ShortInt(((SelectedChar + (uVar3 and $FF)) + $32)))^ = 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                  _local_e := FarBits((P_Word((SelectedChar + $CA)))^, (P_Word((SelectedChar + 200)))^); { routine anchor; statement location unresolved } { 6B00:0B5B }
                  local_f := 0; { 6B00:0C75 }
                  while true do { routine anchor; statement location unresolved } { 6B00:0B5B }
                    begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                      uVar3 := (local_e or uStack_c); { routine anchor; statement location unresolved } { 6B00:0B5B }
                      if ((uVar3 = 0) or else (local_f <> 0)) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                        Break; { routine anchor; statement location unresolved } { 6B00:0B5B }
                      uVar2 := $96; { routine anchor; statement location unresolved } { 6B00:0B5B }
                      cVar1 := ItemContainsSpell(local_e, uStack_c); { 6B00:0C8D }
                      if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                          local_8 := 1; { 6B00:0C96 }
                          while true do { routine anchor; statement location unresolved } { 6B00:0B5B }
                            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                              uVar6 := Word((LongWord(_local_e) shr $10)); { routine anchor; statement location unresolved } { 6B00:0B5B }
                              if (($7F < (P_Byte(((Integer(_local_e) + Word(local_8)) + $3B)))^) and then (((P_Byte(((Integer(_local_e) + Word(local_8)) + $3B)))^ and $7F) = local_6)) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                                  puVar7 := local_32; { routine anchor; statement location unresolved } { 6B00:0B5B }
                                  uVar6 := SS; { routine anchor; statement location unresolved } { 6B00:0B5B }
                                  PString(local_2b, SS) := 'You are already scibing that spell'; { 6B00:0C54 }
                                  uVar2 := $BA; { routine anchor; statement location unresolved } { 6B00:0B5B }
                                  FUN_00ba_1693(puVar7, uVar6); { 6B00:0C59 }
                                  local_f := 1; { 6B00:0CD9 }
                                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                              if (local_8 = 3) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                                Break; { routine anchor; statement location unresolved } { 6B00:0B5B }
                              local_8 := (local_8 + 1); { 6B00:0C9C }
                            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                      uVar6 := Word((LongWord(_local_e) shr $10)); { routine anchor; statement location unresolved } { 6B00:0B5B }
                      _local_e := FarBits((P_Word((Integer(_local_e) + $2C)))^, (P_Word((Integer(_local_e) + $2A)))^); { routine anchor; statement location unresolved } { 6B00:0B5B }
                    end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  if (local_f = 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                    begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                      uVar6 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 6B00:0B5B }
                      iVar5 := Integer(_SelectedChar); { routine anchor; statement location unresolved } { 6B00:0B5B }
                      if ((P_ShortInt((((iVar5 + (ShortInt(P_Byte(@(g_31FA))[(Word(local_6) * $10)]) * 3)) + Integer(ShortInt(P_Byte(@(g_31FB))[(Word(local_6) * $10)]))) + $B1)))^ = 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                          puVar7 := local_2e; { routine anchor; statement location unresolved } { 6B00:0B5B }
                          uVar6 := SS; { routine anchor; statement location unresolved } { 6B00:0B5B }
                          PString(local_32, SS) := 'You can not scribe that spell.'; { 6B00:0CCF }
                          uVar3 := FUN_00ba_1693(puVar7, uVar6); { 6B00:0CD4 }
                        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                      else { routine anchor; statement location unresolved } { 6B00:0B5B }
                        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                          _local_e := FarBits((P_Word((iVar5 + $CA)))^, (P_Word((iVar5 + 200)))^); { routine anchor; statement location unresolved } { 6B00:0B5B }
                          while true do { routine anchor; statement location unresolved } { 6B00:0B5B }
                            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                              uVar3 := (local_e or uStack_c); { routine anchor; statement location unresolved } { 6B00:0B5B }
                              if ((uVar3 = 0) or else (local_f <> 0)) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                                Break; { routine anchor; statement location unresolved } { 6B00:0B5B }
                              local_8 := 1; { 6B00:0D5C }
                              repeat { routine anchor; statement location unresolved } { 6B00:0B5B }
                                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                                  if ((P_Byte(((local_e + local_8) + $3B)))^ = local_6) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                                    begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                                      (P_Byte(((local_e + local_8) + $3B)))^ := ((P_Byte(((local_e + local_8) + $3B)))^ or $80); { routine anchor; statement location unresolved } { 6B00:0B5B }
                                      local_f := 1; { 6B00:0D93 }
                                    end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                                  local_8 := (local_8 + 1); { 6B00:0D97 }
                                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                              until not (((local_8 < 4) and then (local_f = 0))); { routine anchor; statement location unresolved } { 6B00:0B5B }
                              _local_e := FarBits((P_Word((local_e + $2C)))^, (P_Word((local_e + $2A)))^); { routine anchor; statement location unresolved } { 6B00:0B5B }
                            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                    end; { routine anchor; statement location unresolved } { 6B00:0B5B }
                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
              else { routine anchor; statement location unresolved } { 6B00:0B5B }
                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                  puVar7 := local_2b; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  uVar2 := SS; { routine anchor; statement location unresolved } { 6B00:0B5B }
                  PString(local_2e, SS) := 'You already know that spell'; { 6B00:0DC5 }
                  uVar3 := FUN_00ba_1693(puVar7, uVar2); { 6B00:0DCA }
                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
      if (local_a <> -(1)) then { routine anchor; statement location unresolved } { 6B00:0B5B }
        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
          local_a := -(1); { 6B00:0DD8 }
          local_6 := ov19_299C(@(local_4), SS, @(local_a), SS, (Word(bVar4) shl 8), Pack16(bVar4, 6)); { 6B00:0DED }
          if (local_4 <> 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
            begin { routine anchor; statement location unresolved } { 6B00:0B5B }
              puVar7 := local_25; { routine anchor; statement location unresolved } { 6B00:0B5B }
              PString(local_25, SS) := 'Scribe these spells? '; { 6B00:0E05 }
              cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 10), Pack16(UNKNOWN_extraout_AH_01, $E), puVar7, SS); { 6B00:0E13 }
              if (cVar1 = 78) then { routine anchor; statement location unresolved } { 6B00:0B5B }
                begin { routine anchor; statement location unresolved } { 6B00:0B5B }
                  ClearScribeSelections(SelectedChar, g_5D94); { 6B00:0E25 }
                end; { routine anchor; statement location unresolved } { 6B00:0B5B }
            end; { routine anchor; statement location unresolved } { 6B00:0B5B }
        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
      if (local_5 <> 0) then { routine anchor; statement location unresolved } { 6B00:0B5B }
        begin { routine anchor; statement location unresolved } { 6B00:0B5B }
          FUN_00ba_27d9(); { 6B00:0E2E }
        end; { routine anchor; statement location unresolved } { 6B00:0B5B }
    end; { routine anchor; statement location unresolved } { 6B00:0B5B }
  Exit; { 6B00:0E36 }
end; { routine anchor; statement location unresolved } { 6B00:0B5B }
```

### ov15:0E37 LearnSpellMenu (conf M)

Params (BP stack slots): param_1: Integer [BP+$06]; param_2: LongWord [BP+$08]; param_3: Byte [BP+$0C].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: LongWord [compiler temporary; no proven BP slot]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): FUN_6b00_0fbc.  
Callees (export): System.@StrAssign, System.GetMem.

```pascal
procedure LearnSpellMenu(param_1: Integer; param_2: LongWord; param_3: Byte); { 6B00:0E37 }
begin { routine anchor; statement location unresolved } { 6B00:0E37 }
  PString(local_2b, SS) := Copy(PString(Integer(param_2), Integer((LongWord(param_2) shr $10))), 1, $28); { 6B00:0E4B }
  uVar4 := Allocate($2E); { 6B00:0E54 }
  uVar2 := Word((LongWord((P_LongWord((param_1 + -($C))))^) shr $10)); { routine anchor; statement location unresolved } { 6B00:0E37 }
  iVar1 := Integer((P_LongWord((param_1 + -($C))))^); { routine anchor; statement location unresolved } { 6B00:0E37 }
  (P_Word((iVar1 + $2A)))^ := Integer(uVar4); { routine anchor; statement location unresolved } { 6B00:0E37 }
  (P_Word((iVar1 + $2C)))^ := Integer((LongWord(uVar4) shr $10)); { routine anchor; statement location unresolved } { 6B00:0E37 }
  uVar3 := Word((LongWord((P_LongWord((param_1 + -($C))))^) shr $10)); { routine anchor; statement location unresolved } { 6B00:0E37 }
  iVar1 := Integer((P_LongWord((param_1 + -($C))))^); { routine anchor; statement location unresolved } { 6B00:0E37 }
  uVar2 := (P_Word((iVar1 + $2C)))^; { routine anchor; statement location unresolved } { 6B00:0E37 }
  (P_Word((param_1 + -($C))))^ := (P_Word((iVar1 + $2A)))^; { routine anchor; statement location unresolved } { 6B00:0E37 }
  (P_Word((param_1 + -(10))))^ := uVar2; { routine anchor; statement location unresolved } { 6B00:0E37 }
  uVar2 := Word((LongWord((P_LongWord((param_1 + -($C))))^) shr $10)); { routine anchor; statement location unresolved } { 6B00:0E37 }
  iVar1 := Integer((P_LongWord((param_1 + -($C))))^); { routine anchor; statement location unresolved } { 6B00:0E37 }
  (P_Word((iVar1 + $2A)))^ := 0; { routine anchor; statement location unresolved } { 6B00:0E37 }
  (P_Word((iVar1 + $2C)))^ := 0; { routine anchor; statement location unresolved } { 6B00:0E37 }
  PString(Integer((P_LongWord((param_1 + -($C))))^), Integer((LongWord((P_LongWord((param_1 + -($C))))^) shr $10))) := Copy(PString(local_2b, SS), 1, $28); { 6B00:0EA5 }
  (P_Byte((Integer((P_LongWord((param_1 + -($C))))^) + $29)))^ := param_3; { routine anchor; statement location unresolved } { 6B00:0E37 }
  Exit; { 6B00:0EBB }
end; { routine anchor; statement location unresolved } { 6B00:0E37 }
```

### ov15:0FBC DisplaySpellEffects (conf M)

Params (BP stack slots): none.  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; puVar9: P_Byte [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; uVar12: Word [compiler temporary; no proven BP slot]; uVar13: Word [compiler temporary; no proven BP slot]; local_245: array[0..255] of Byte [BP-$243]; local_145: array[0..235] of Byte [BP-$143]; local_59: array[0..11] of Byte [BP-$57]; local_4d: array[0..5] of Byte [BP-$4B]; local_47: Byte [BP-$45]; local_46: Byte [BP-$44]; local_45: Byte [BP-$43]; local_44: Word [BP-$42]; local_42: array[0..40] of Byte [BP-$40]; local_19: Byte [BP-$17]; local_18: ShortInt [BP-$16]; local_17: ShortInt [BP-$15]; local_15: ShortInt [BP-$13]; local_14: Byte [BP-$12]; local_13: Byte [BP-$11]; local_12: Word [BP-$10]; uStack_10: Word [BP-$E]; local_e: LongWord [BP-$C]; local_a: LongWord [BP-$8]; local_6: LongWord [BP-$4].  
Callers (export): FUN_6b00_13f1.  
Callees (export): FUN_00ba_1037, FUN_00ba_27d9, FUN_03f1_02e8, LearnSpellMenu, System.@StrAppend, System.@StrAssign, System.@StrCopy, System.GetMem, ov25_0D9A, ov25_11F3.

Displays active linked effect records, with special names/table lookups and the explicit no-effects string. This is UI evidence, not an exhaustive effect-id definition.

```pascal
procedure DisplaySpellEffects(); { 6B00:0FBC }
begin { routine anchor; statement location unresolved } { 6B00:0FBC }
  local_a := Allocate($2E); { 6B00:0FC7 }
  (P_Byte((Integer(local_a) + $29)))^ := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
  local_e := local_a; { 6B00:0FD8 }
  PString(WordAtSS(BP-$C),WordAtSS(BP-$A)) := Copy('',1,40); { 6B00:0FF4 }
  (P_Word((Integer(local_e) + $2A)))^ := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
  (P_Word((Integer(local_e) + $2C)))^ := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uStack_10 := g_5D98; { 6B00:1010 }
  local_12 := PartyHead; { 6B00:100D }
  while ((local_12 or uStack_10) <> 0) do { routine anchor; statement location unresolved } { 6B00:0FBC }
    begin { routine anchor; statement location unresolved } { 6B00:0FBC }
      local_15 := 0; { 6B00:101E }
      LearnSpellMenu(@(stack0xfffe), local_12, uStack_10, Pack16(ShortInt(((local_12 or uStack_10) shr 8)), 1)); { 6B00:102C }
      local_6 := P_Byte(FarBits((P_Word((local_12 + $81)))^, P_Byte((P_Word((local_12 + $7F)))^))); { 6B00:103B }
      while true do { routine anchor; statement location unresolved } { 6B00:0FBC }
        begin { routine anchor; statement location unresolved } { 6B00:0FBC }
          bVar4 := Byte(((Word(P_Byte(local_6)) or Slice16(local_6, 2)) shr 8)); { routine anchor; statement location unresolved } { 6B00:0FBC }
          if ((Word(P_Byte(local_6)) or Slice16(local_6, 2)) = 0) then { routine anchor; statement location unresolved } { 6B00:0FBC }
            Break; { routine anchor; statement location unresolved } { 6B00:0FBC }
          local_18 := 1; { 6B00:104C }
          local_13 := (local_6)^; { 6B00:1056 }
          if (((((((local_13 = 1) or else (local_13 = 2)) or else (local_13 = 5)) or else ((7 < local_13) and then (local_13 < $F))) or else ((local_13 = $10) or else (local_13 = $11))) or else (((($12 < local_13) and then (local_13 < $1A)) or else (local_13 = $1C)) or else ((local_13 = $1D) or else (($1F < local_13) and then (local_13 < $23))))) or else ((($23 < local_13) and then (local_13 < $28)) or else (((((local_13 = $29) or else (local_13 = $2A)) or else (local_13 = $2D)) or else ((local_13 = $2E) or else (local_13 = $31))) or else (($32 < local_13) and then (local_13 < $36))))) then { routine anchor; statement location unresolved } { 6B00:0FBC }
            begin { routine anchor; statement location unresolved } { 6B00:0FBC }
              local_14 := 1; { 6B00:10BA }
              local_17 := 0; { 6B00:10BE }
              while ((local_14 < $39) and then (local_17 = 0)) do { routine anchor; statement location unresolved } { 6B00:0FBC }
                begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                  bVar4 := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  if (P_Byte(@(g_3204))[(Word(local_14) * $10)] = local_13) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                    begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                      PString(local_42, SS) := Copy(PString(((Word(local_14) * $29) + $28E9), $C7C), 1, $28); { 6B00:10FD }
                      local_17 := 1; { 6B00:1102 }
                      bVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 6B00:0FBC }
                    end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  else { routine anchor; statement location unresolved } { 6B00:0FBC }
                    begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                      local_14 := (local_14 + 1); { 6B00:1108 }
                    end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                end; { routine anchor; statement location unresolved } { 6B00:0FBC }
              if (local_17 = 0) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                  puVar6 := local_245; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  PString(local_245, SS) := 'Funky--'; { 6B00:111E }
                  puVar9 := local_145; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH_00, local_13)); { 6B00:112D }
                  PString(local_245, SS) := Copy(PString(local_245, SS) + PString(puVar9, uVar5), 1, 255); { 6B00:1132 }
                  PString(local_42, SS) := Copy(PString(puVar6, uVar7), 1, $28); { 6B00:1140 }
                  bVar4 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 6B00:0FBC }
                end; { routine anchor; statement location unresolved } { 6B00:0FBC }
            end; { routine anchor; statement location unresolved } { 6B00:0FBC }
          else { routine anchor; statement location unresolved } { 6B00:0FBC }
            if (local_13 = 4) then { routine anchor; statement location unresolved } { 6B00:0FBC }
              begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                PString(local_42, SS) := Copy('Studying Manual of Bodily Health', 1, $28); { 6B00:115A }
                bVar4 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 6B00:0FBC }
              end; { routine anchor; statement location unresolved } { 6B00:0FBC }
            else { routine anchor; statement location unresolved } { 6B00:0FBC }
              if (local_13 = 7) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                  PString(local_42, SS) := Copy('Training with Manual of Bodily Health', 1, $28); { 6B00:1174 }
                  bVar4 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 6B00:0FBC }
                end; { routine anchor; statement location unresolved } { 6B00:0FBC }
              else { routine anchor; statement location unresolved } { 6B00:0FBC }
                if (local_13 = $1B) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                  begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                    PString(local_42, SS) := Copy('Feather Fall', 1, $28); { 6B00:118E }
                    bVar4 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                else { routine anchor; statement location unresolved } { 6B00:0FBC }
                  if (local_13 = $1F) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                    begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                      PString(local_42, SS) := Copy('Helpless', 1, $28); { 6B00:11A8 }
                      bVar4 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 6B00:0FBC }
                    end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                  else { routine anchor; statement location unresolved } { 6B00:0FBC }
                    if (local_13 = $23) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                      begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                        PString(local_42, SS) := Copy('Prayer', 1, $28); { 6B00:11C2 }
                        bVar4 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 6B00:0FBC }
                      end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                    else { routine anchor; statement location unresolved } { 6B00:0FBC }
                      if (local_13 = $2C) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                        begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                          PString(local_42, SS) := Copy('Cause Disease', 1, $28); { 6B00:11DC }
                          bVar4 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 6B00:0FBC }
                        end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                      else { routine anchor; statement location unresolved } { 6B00:0FBC }
                        if (local_13 = $32) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                          begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                            PString(local_42, SS) := Copy('Dreaded Mummy Disease', 1, $28); { 6B00:11F6 }
                            bVar4 := UNKNOWN_extraout_AH_08; { routine anchor; statement location unresolved } { 6B00:0FBC }
                          end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                        else { routine anchor; statement location unresolved } { 6B00:0FBC }
                          if (local_13 = $36) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                            begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                              PString(local_42, SS) := Copy('Repulsed', 1, $28); { 6B00:1210 }
                              bVar4 := UNKNOWN_extraout_AH_09; { routine anchor; statement location unresolved } { 6B00:0FBC }
                            end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                          else { routine anchor; statement location unresolved } { 6B00:0FBC }
                            if (local_13 = $37) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                              begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                PString(local_42, SS) := Copy('Poisoned', 1, $28); { 6B00:122A }
                                bVar4 := UNKNOWN_extraout_AH_10; { routine anchor; statement location unresolved } { 6B00:0FBC }
                              end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                            else { routine anchor; statement location unresolved } { 6B00:0FBC }
                              if (local_13 = $3B) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                                begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                  PString(local_42, SS) := Copy('Regenerating', 1, $28); { 6B00:1244 }
                                  bVar4 := UNKNOWN_extraout_AH_11; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                              else { routine anchor; statement location unresolved } { 6B00:0FBC }
                                if (local_13 = $3D) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                                  begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                    PString(local_42, SS) := Copy('Fire Resistance', 1, $28); { 6B00:125D }
                                    bVar4 := UNKNOWN_extraout_AH_12; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                  end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                else { routine anchor; statement location unresolved } { 6B00:0FBC }
                                  if (local_13 = $47) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                                    begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                      PString(local_42, SS) := Copy('Invisible', 1, $28); { 6B00:1276 }
                                      bVar4 := UNKNOWN_extraout_AH_13; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                    end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                  else { routine anchor; statement location unresolved } { 6B00:0FBC }
                                    if (local_13 = $48) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                                      begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                        PString(local_42, SS) := Copy('Camouflaged', 1, $28); { 6B00:128F }
                                        bVar4 := UNKNOWN_extraout_AH_14; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                      end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                    else { routine anchor; statement location unresolved } { 6B00:0FBC }
                                      if (local_13 = $59) then { routine anchor; statement location unresolved } { 6B00:0FBC }
                                        begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                          PString(local_42, SS) := Copy('Displaced', 1, $28); { 6B00:12A8 }
                                          bVar4 := UNKNOWN_extraout_AH_15; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                        end; { routine anchor; statement location unresolved } { 6B00:0FBC }
                                      else { routine anchor; statement location unresolved } { 6B00:0FBC }
                                        begin { routine anchor; statement location unresolved } { 6B00:0FBC }
                                          local_18 := 0; { 6B00:12AF }
                                        end; { routine anchor; statement location unresolved } { 6B00:0FBC }
          if (local_18 <> 0) then { routine anchor; statement location unresolved } { 6B00:0FBC }
            begin { routine anchor; statement location unresolved } { 6B00:0FBC }
              local_15 := (local_15 + 1); { 6B00:12B9 }
              iVar2 := (Word(bVar4) shl 8); { routine anchor; statement location unresolved } { 6B00:0FBC }
              puVar6 := local_145; { routine anchor; statement location unresolved } { 6B00:0FBC }
              uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
              PString(local_145, SS) := ' '; { 6B00:12CA }
              PString(local_145, SS) := Copy(PString(local_145, SS) + PString(local_42, SS), 1, 255); { 6B00:12D4 }
              LearnSpellMenu(@(stack0xfffe), puVar6, uVar5, iVar2); { 6B00:12DB }
            end; { routine anchor; statement location unresolved } { 6B00:0FBC }
          uVar5 := Word((LongWord(local_6) shr $10)); { routine anchor; statement location unresolved } { 6B00:0FBC }
          local_6 := P_Byte(FarBits((P_Word((P_Byte(local_6) + 7)))^, (P_P_Byte((P_Byte(local_6) + 5)))^)); { 6B00:12E9 }
        end; { routine anchor; statement location unresolved } { 6B00:0FBC }
      uVar3 := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
      if (local_15 = 0) then { routine anchor; statement location unresolved } { 6B00:0FBC }
        begin { routine anchor; statement location unresolved } { 6B00:0FBC }
          uVar7 := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
          puVar6 := local_59; { routine anchor; statement location unresolved } { 6B00:0FBC }
          uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
          PString(local_59, SS) := ' <No Spell Effects>'; { 6B00:1305 }
          uVar3 := LearnSpellMenu(@(stack0xfffe), puVar6, uVar5, uVar7); { 6B00:130C }
        end; { routine anchor; statement location unresolved } { 6B00:0FBC }
      uVar3 := (uVar3 and $FF00); { routine anchor; statement location unresolved } { 6B00:0FBC }
      puVar6 := @(local_47); { routine anchor; statement location unresolved } { 6B00:0FBC }
      uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
      PString(local_47, SS) := ' '; { 6B00:131C }
      LearnSpellMenu(@(stack0xfffe), puVar6, uVar5, uVar3); { 6B00:1323 }
      puVar1 := P_Word((local_12 + $104)); { routine anchor; statement location unresolved } { 6B00:0FBC }
      uStack_10 := (P_Word((local_12 + $106)))^; { 6B00:1336 }
      local_12 := (puVar1)^; { 6B00:1333 }
    end; { routine anchor; statement location unresolved } { 6B00:0FBC }
  local_19 := 1; { 6B00:133C }
  local_44 := 0; { 6B00:1342 }
  uVar13 := 1; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar12 := 1; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar11 := $26; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar10 := $16; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar8 := 0; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar7 := $F; { routine anchor; statement location unresolved } { 6B00:0FBC }
  puVar6 := local_4d; { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
  PString(local_4d, SS) := 'Display'; { 6B00:1361 }
  FUN_03f1_02e8(puVar6, uVar5, uVar7, uVar8, uVar10, uVar11, uVar12, uVar13); { 6B00:1366 }
  puVar6 := @(local_46); { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
  PString(local_46, SS) := ''; { 6B00:1375 }
  puVar9 := @(local_47); { routine anchor; statement location unresolved } { 6B00:0FBC }
  uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:0FBC }
  PString(local_47, SS) := ''; { 6B00:1384 }
  local_45 := ov25_0D9A(@(local_e), SS, @(local_44), SS, @(local_19), SS, Pack16(UNKNOWN_extraout_AH_16, 1), local_a, Pack16(UNKNOWN_extraout_AH_16, $16), Pack16(UNKNOWN_extraout_AH_16, $26), Pack16(UNKNOWN_extraout_AH_16, 4), Pack16(UNKNOWN_extraout_AH_16, 1), Pack16(UNKNOWN_extraout_AH_16, $F), Pack16(UNKNOWN_extraout_AH_16, 10), Pack16(UNKNOWN_extraout_AH_16, $B), puVar9, uVar5, puVar6, uVar7); { 6B00:13B6 }
  ov25_11F3(@(local_a), SS); { 6B00:13C3 }
  FUN_00ba_27d9(); { 6B00:13C8 }
  Exit; { 6B00:13D0 }
end; { routine anchor; statement location unresolved } { 6B00:0FBC }
```

### ov15:13F1 SpellActivityMenu (conf M)

Params (BP stack slots): param_1: P_ShortInt [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; bVar3: Boolean [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; local_5: Byte [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): ov15_1E6F.  
Callees (export): FUN_00ba_0767, RestWithStudyPlan, MemorizeMenu, ScribeMenu, DisplaySpellEffects, System.@SetIn, System.@StrCopy, CampCastMenu, ov19_27DF, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure SpellActivityMenu(param_1: P_ShortInt); { 6B00:13F1 }
begin { routine anchor; statement location unresolved } { 6B00:13F1 }
  puVar2 := P_Byte(@(g_6B00)); { routine anchor; statement location unresolved } { 6B00:13F1 }
  local_3 := 32; { 6B00:13F7 }
  while Sequence((bVar3 := ((param_1)^ = 0)); (bVar3 and then Sequence(Flags.ZF := not (LoByte(local_3) in [0, 69]); bVar3))) do { 6B00:1410 }
    begin { routine anchor; statement location unresolved } { 6B00:13F1 }
      puVar4 := @(local_5); { routine anchor; statement location unresolved } { 6B00:13F1 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:13F1 }
      PString(local_5, SS) := ''; { 6B00:1424 }
      puVar2 := P_Byte($3C5); { routine anchor; statement location unresolved } { 6B00:13F1 }
      uVar1 := ov25_03BD(@(local_4), SS, Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), $531, $C7C, puVar4, uVar1); { 6B00:1442 }
      local_3 := ShortInt(uVar1); { 6B00:1447 }
      if (local_4 = 0) then { routine anchor; statement location unresolved } { 6B00:13F1 }
        begin { routine anchor; statement location unresolved } { 6B00:13F1 }
          if (local_3 = 67) then { routine anchor; statement location unresolved } { 6B00:13F1 }
            begin { routine anchor; statement location unresolved } { 6B00:13F1 }
              CampCastMenu(); { 6B00:1470 }
            end; { routine anchor; statement location unresolved } { 6B00:13F1 }
          else { routine anchor; statement location unresolved } { 6B00:13F1 }
            if (local_3 = 77) then { routine anchor; statement location unresolved } { 6B00:13F1 }
              begin { routine anchor; statement location unresolved } { 6B00:13F1 }
                MemorizeMenu(); { 6B00:147A }
              end; { routine anchor; statement location unresolved } { 6B00:13F1 }
            else { routine anchor; statement location unresolved } { 6B00:13F1 }
              if (local_3 = 83) then { routine anchor; statement location unresolved } { 6B00:13F1 }
                begin { routine anchor; statement location unresolved } { 6B00:13F1 }
                  ScribeMenu(); { 6B00:1484 }
                end; { routine anchor; statement location unresolved } { 6B00:13F1 }
              else { routine anchor; statement location unresolved } { 6B00:13F1 }
                if (local_3 = 68) then { routine anchor; statement location unresolved } { 6B00:13F1 }
                  begin { routine anchor; statement location unresolved } { 6B00:13F1 }
                    DisplaySpellEffects(); { 6B00:148E }
                  end; { routine anchor; statement location unresolved } { 6B00:13F1 }
                else { routine anchor; statement location unresolved } { 6B00:13F1 }
                  if (local_3 = 82) then { routine anchor; statement location unresolved } { 6B00:13F1 }
                    begin { routine anchor; statement location unresolved } { 6B00:13F1 }
                      RestWithStudyPlan(P_ShortInt(param_1), Integer((LongWord(param_1) shr $10))); { 6B00:149D }
                    end; { routine anchor; statement location unresolved } { 6B00:13F1 }
        end; { routine anchor; statement location unresolved } { 6B00:13F1 }
      else { routine anchor; statement location unresolved } { 6B00:13F1 }
        begin { routine anchor; statement location unresolved } { 6B00:13F1 }
          ov19_27DF(uVar1); { 6B00:1454 }
          puVar2 := P_Byte($BA); { routine anchor; statement location unresolved } { 6B00:13F1 }
          FUN_00ba_0767(SelectedChar, g_5D94); { 6B00:1461 }
        end; { routine anchor; statement location unresolved } { 6B00:13F1 }
    end; { routine anchor; statement location unresolved } { 6B00:13F1 }
  Exit; { 6B00:14A6 }
end; { routine anchor; statement location unresolved } { 6B00:13F1 }
```

### ov15:14A9 MoveSelectedEarlier (conf M)

Params (BP stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_a: Integer [BP-$8]; iStack_8: Integer [BP-$6]; local_6: LongWord [BP-$4].  
Callers (export): FUN_6b00_1780.  
Callees (export): none recorded.

```pascal
procedure MoveSelectedEarlier(); { 6B00:14A9 }
begin { routine anchor; statement location unresolved } { 6B00:14A9 }
  local_a := PartyHead; { 6B00:14B6 }
  iStack_8 := g_5D98; { 6B00:14B9 }
  local_6 := 0; { 6B00:14BE }
  iVar4 := g_5D94; { routine anchor; statement location unresolved } { 6B00:14A9 }
  if ((g_5D98 = g_5D94) and then (PartyHead = SelectedChar)) then { routine anchor; statement location unresolved } { 6B00:14A9 }
    begin { routine anchor; statement location unresolved } { 6B00:14A9 }
      while (((P_Integer((local_a + $104)))^ <> 0) or else ((P_Integer((local_a + $106)))^ <> 0)) do { routine anchor; statement location unresolved } { 6B00:14A9 }
        begin { routine anchor; statement location unresolved } { 6B00:14A9 }
          piVar1 := P_Integer((local_a + $104)); { routine anchor; statement location unresolved } { 6B00:14A9 }
          iStack_8 := (P_Integer((local_a + $106)))^; { 6B00:14F5 }
          local_a := (piVar1)^; { 6B00:14F2 }
        end; { routine anchor; statement location unresolved } { 6B00:14A9 }
    end; { routine anchor; statement location unresolved } { 6B00:14A9 }
  else { routine anchor; statement location unresolved } { 6B00:14A9 }
    begin { routine anchor; statement location unresolved } { 6B00:14A9 }
      while (((P_Integer((local_a + $106)))^ <> g_5D94) or else ((P_Integer((local_a + $104)))^ <> SelectedChar)) do { routine anchor; statement location unresolved } { 6B00:14A9 }
        begin { routine anchor; statement location unresolved } { 6B00:14A9 }
          local_6 := FarBits(iStack_8, local_a); { 6B00:151B }
          piVar1 := P_Integer((local_a + $104)); { routine anchor; statement location unresolved } { 6B00:14A9 }
          iStack_8 := (P_Integer((local_a + $106)))^; { 6B00:1531 }
          local_a := (piVar1)^; { 6B00:152E }
        end; { routine anchor; statement location unresolved } { 6B00:14A9 }
    end; { routine anchor; statement location unresolved } { 6B00:14A9 }
  iVar2 := (P_Integer((SelectedChar + $104)))^; { routine anchor; statement location unresolved } { 6B00:14A9 }
  iVar3 := (P_Integer((SelectedChar + $106)))^; { routine anchor; statement location unresolved } { 6B00:14A9 }
  if ((g_5D98 = g_5D94) and then (PartyHead = SelectedChar)) then { routine anchor; statement location unresolved } { 6B00:14A9 }
    begin { routine anchor; statement location unresolved } { 6B00:14A9 }
      if ((iVar2 <> 0) or else (iVar3 <> 0)) then { routine anchor; statement location unresolved } { 6B00:14A9 }
        begin { routine anchor; statement location unresolved } { 6B00:14A9 }
          PartyHead := iVar2; { routine anchor; statement location unresolved } { 6B00:14A9 }
          g_5D98 := iVar3; { 6B00:156E }
        end; { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Integer((local_a + $104)))^ := SelectedChar; { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Integer((local_a + $106)))^ := iVar4; { routine anchor; statement location unresolved } { 6B00:14A9 }
      uVar5 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 6B00:14A9 }
      iVar4 := Integer(_SelectedChar); { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Word((iVar4 + $104)))^ := 0; { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Word((iVar4 + $106)))^ := 0; { routine anchor; statement location unresolved } { 6B00:14A9 }
    end; { routine anchor; statement location unresolved } { 6B00:14A9 }
  else { routine anchor; statement location unresolved } { 6B00:14A9 }
    begin { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Integer((local_a + $104)))^ := iVar2; { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Integer((local_a + $106)))^ := iVar3; { routine anchor; statement location unresolved } { 6B00:14A9 }
      uVar5 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 6B00:14A9 }
      iVar4 := Integer(_SelectedChar); { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Integer((iVar4 + $104)))^ := local_a; { routine anchor; statement location unresolved } { 6B00:14A9 }
      (P_Integer((iVar4 + $106)))^ := iStack_8; { routine anchor; statement location unresolved } { 6B00:14A9 }
      iVar4 := g_5D94; { routine anchor; statement location unresolved } { 6B00:14A9 }
      if ((iStack_8 <> g_5D98) or else (local_a <> PartyHead)) then { routine anchor; statement location unresolved } { 6B00:14A9 }
        begin { routine anchor; statement location unresolved } { 6B00:14A9 }
          if ((Integer(local_6) <> 0) or else (Slice16(local_6, 2) <> 0)) then { routine anchor; statement location unresolved } { 6B00:14A9 }
            begin { routine anchor; statement location unresolved } { 6B00:14A9 }
              (P_Integer((Integer(local_6) + $104)))^ := SelectedChar; { routine anchor; statement location unresolved } { 6B00:14A9 }
              (P_Integer((Integer(local_6) + $106)))^ := iVar4; { routine anchor; statement location unresolved } { 6B00:14A9 }
              Exit; { 6B00:1600 }
            end; { routine anchor; statement location unresolved } { 6B00:14A9 }
        end; { routine anchor; statement location unresolved } { 6B00:14A9 }
      PartyHead := SelectedChar; { routine anchor; statement location unresolved } { 6B00:14A9 }
      g_5D98 := g_5D94; { 6B00:15E3 }
    end; { routine anchor; statement location unresolved } { 6B00:14A9 }
  Exit; { 6B00:1600 }
end; { routine anchor; statement location unresolved } { 6B00:14A9 }
```

### ov15:1601 MoveSelectedLater (conf M)

Params (BP stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): FUN_6b00_1780.  
Callees (export): none recorded.

```pascal
procedure MoveSelectedLater(); { 6B00:1601 }
begin { routine anchor; statement location unresolved } { 6B00:1601 }
  local_6 := PartyHead; { 6B00:160E }
  local_6 := PartyHead; { 6B00:164C }
  uStack_4 := g_5D98; { 6B00:1611 }
  iVar6 := g_5D94; { routine anchor; statement location unresolved } { 6B00:1601 }
  iVar5 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:1601 }
  if ((g_5D98 <> g_5D94) or else (PartyHead <> SelectedChar)) then { routine anchor; statement location unresolved } { 6B00:1601 }
    begin { routine anchor; statement location unresolved } { 6B00:1601 }
      while (((P_Integer((local_6 + $106)))^ <> g_5D94) or else ((P_Integer((local_6 + $104)))^ <> SelectedChar)) do { routine anchor; statement location unresolved } { 6B00:1601 }
        begin { routine anchor; statement location unresolved } { 6B00:1601 }
          piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 6B00:1601 }
          uStack_4 := (P_Integer((local_6 + $106)))^; { 6B00:164F }
          local_6 := (piVar1)^; { routine anchor; statement location unresolved } { 6B00:1601 }
        end; { routine anchor; statement location unresolved } { 6B00:1601 }
    end; { routine anchor; statement location unresolved } { 6B00:1601 }
  iVar2 := (P_Integer((SelectedChar + $104)))^; { routine anchor; statement location unresolved } { 6B00:1601 }
  iVar3 := (P_Integer((SelectedChar + $106)))^; { routine anchor; statement location unresolved } { 6B00:1601 }
  if ((iVar2 = 0) and then (iVar3 = 0)) then { routine anchor; statement location unresolved } { 6B00:1601 }
    begin { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Integer((SelectedChar + $104)))^ := PartyHead; { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Integer((iVar5 + $106)))^ := g_5D98; { routine anchor; statement location unresolved } { 6B00:1601 }
      PartyHead := SelectedChar; { routine anchor; statement location unresolved } { 6B00:1601 }
      g_5D98 := g_5D94; { 6B00:168F }
      (P_Integer((local_6 + $104)))^ := iVar2; { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Integer((local_6 + $106)))^ := iVar3; { routine anchor; statement location unresolved } { 6B00:1601 }
    end; { routine anchor; statement location unresolved } { 6B00:1601 }
  else { routine anchor; statement location unresolved } { 6B00:1601 }
    begin { routine anchor; statement location unresolved } { 6B00:1601 }
      uVar4 := (P_Word((iVar2 + $106)))^; { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Word((SelectedChar + $104)))^ := (P_Word((iVar2 + $104)))^; { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Word((iVar5 + $106)))^ := uVar4; { routine anchor; statement location unresolved } { 6B00:1601 }
      if ((g_5D98 = g_5D94) and then (PartyHead = SelectedChar)) then { routine anchor; statement location unresolved } { 6B00:1601 }
        begin { routine anchor; statement location unresolved } { 6B00:1601 }
          PartyHead := iVar2; { routine anchor; statement location unresolved } { 6B00:1601 }
          g_5D98 := iVar3; { 6B00:16DF }
        end; { routine anchor; statement location unresolved } { 6B00:1601 }
      if ((uStack_4 <> g_5D94) or else (local_6 <> SelectedChar)) then { routine anchor; statement location unresolved } { 6B00:1601 }
        begin { routine anchor; statement location unresolved } { 6B00:1601 }
          (P_Integer((local_6 + $104)))^ := iVar2; { routine anchor; statement location unresolved } { 6B00:1601 }
          (P_Integer((local_6 + $106)))^ := iVar3; { routine anchor; statement location unresolved } { 6B00:1601 }
        end; { routine anchor; statement location unresolved } { 6B00:1601 }
      uVar4 := g_5D94; { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Word((iVar2 + $104)))^ := SelectedChar; { routine anchor; statement location unresolved } { 6B00:1601 }
      (P_Word((iVar2 + $106)))^ := uVar4; { routine anchor; statement location unresolved } { 6B00:1601 }
    end; { routine anchor; statement location unresolved } { 6B00:1601 }
  Exit; { 6B00:171F }
end; { routine anchor; statement location unresolved } { 6B00:1601 }
```

### ov15:1780 PartyOrderMenu (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_17: array[0..3] of Byte [BP-$15]; local_13: array[0..13] of Byte [BP-$11]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): FUN_6b00_1c59.  
Callees (export): FUN_00ba_0767, FUN_00ba_16ec, FUN_00ba_17e3, MoveSelectedEarlier, MoveSelectedLater, System.@SetIn, System.@StrCopy, ov19_27DF, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure PartyOrderMenu(); { 6B00:1780 }
begin { routine anchor; statement location unresolved } { 6B00:1780 }
  puVar2 := P_Byte(@(g_6B00)); { routine anchor; statement location unresolved } { 6B00:1780 }
  uVar3 := (@(stack0x0000) = P_Byte(@(g_0018))); { routine anchor; statement location unresolved } { 6B00:1780 }
  local_3 := 0; { 6B00:1786 }
  local_5 := 32; { 6B00:178A }
  while Sequence(Flags.ZF := not (LoByte(local_5) in [0, 69]); Boolean(uVar3)) do { 6B00:1797 }
    begin { routine anchor; statement location unresolved } { 6B00:1780 }
      puVar2 := local_13; { routine anchor; statement location unresolved } { 6B00:1780 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1780 }
      PString(local_13, SS) := 'Party Order: '; { 6B00:17AB }
      uVar3 := Byte((Word((local_3 * $29)) shr 8)); { routine anchor; statement location unresolved } { 6B00:1780 }
      uVar1 := ov25_03BD(@(local_4), SS, Pack16(uVar3, 1), Pack16(uVar3, 1), Pack16(uVar3, $F), Pack16(uVar3, 10), Pack16(uVar3, $D), ((local_3 * $29) + $584), $C7C, puVar2, uVar1); { 6B00:17D5 }
      local_5 := ShortInt(uVar1); { 6B00:17DA }
      uVar3 := (local_4 = 0); { routine anchor; statement location unresolved } { 6B00:1780 }
      if Boolean(uVar3) then { routine anchor; statement location unresolved } { 6B00:1780 }
        begin { routine anchor; statement location unresolved } { 6B00:1780 }
          puVar2 := P_Byte($AF8); { routine anchor; statement location unresolved } { 6B00:1780 }
          Flags.ZF := not (LoByte(uVar1) in [13, 80, 83]); { 6B00:182E }
          if not (Boolean(uVar3)) then { routine anchor; statement location unresolved } { 6B00:1780 }
            begin { routine anchor; statement location unresolved } { 6B00:1780 }
              local_3 := (local_3 = 0); { 6B00:183E }
              uVar3 := not (Boolean(local_3)); { routine anchor; statement location unresolved } { 6B00:1780 }
              if Boolean(uVar3) then { routine anchor; statement location unresolved } { 6B00:1780 }
                begin { routine anchor; statement location unresolved } { 6B00:1780 }
                  puVar2 := P_Byte($BA); { routine anchor; statement location unresolved } { 6B00:1780 }
                  FUN_00ba_17e3(); { 6B00:186B }
                end; { routine anchor; statement location unresolved } { 6B00:1780 }
              else { routine anchor; statement location unresolved } { 6B00:1780 }
                begin { routine anchor; statement location unresolved } { 6B00:1780 }
                  puVar4 := local_17; { routine anchor; statement location unresolved } { 6B00:1780 }
                  uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1780 }
                  uVar5 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:1780 }
                  uVar6 := g_5D94; { routine anchor; statement location unresolved } { 6B00:1780 }
                  PString(local_17, SS) := 'has been selected'; { 6B00:1859 }
                  puVar2 := P_Byte($BA); { routine anchor; statement location unresolved } { 6B00:1780 }
                  FUN_00ba_16ec((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 10), puVar4, uVar1, uVar5, uVar6); { 6B00:1864 }
                end; { routine anchor; statement location unresolved } { 6B00:1780 }
            end; { routine anchor; statement location unresolved } { 6B00:1780 }
        end; { routine anchor; statement location unresolved } { 6B00:1780 }
      else { routine anchor; statement location unresolved } { 6B00:1780 }
        begin { routine anchor; statement location unresolved } { 6B00:1780 }
          uVar3 := (local_3 = 0); { routine anchor; statement location unresolved } { 6B00:1780 }
          if Boolean(uVar3) then { routine anchor; statement location unresolved } { 6B00:1780 }
            begin { routine anchor; statement location unresolved } { 6B00:1780 }
              ov19_27DF(uVar1); { 6B00:17ED }
              FUN_00ba_0767(SelectedChar, g_5D94); { 6B00:17FA }
            end; { routine anchor; statement location unresolved } { 6B00:1780 }
          else { routine anchor; statement location unresolved } { 6B00:1780 }
            begin { routine anchor; statement location unresolved } { 6B00:1780 }
              uVar3 := (local_5 = 71); { routine anchor; statement location unresolved } { 6B00:1780 }
              if Boolean(uVar3) then { routine anchor; statement location unresolved } { 6B00:1780 }
                begin { routine anchor; statement location unresolved } { 6B00:1780 }
                  MoveSelectedEarlier(); { 6B00:1809 }
                end; { routine anchor; statement location unresolved } { 6B00:1780 }
              else { routine anchor; statement location unresolved } { 6B00:1780 }
                begin { routine anchor; statement location unresolved } { 6B00:1780 }
                  uVar3 := (local_5 = 79); { routine anchor; statement location unresolved } { 6B00:1780 }
                  if Boolean(uVar3) then { routine anchor; statement location unresolved } { 6B00:1780 }
                    begin { routine anchor; statement location unresolved } { 6B00:1780 }
                      MoveSelectedLater(); { 6B00:1813 }
                    end; { routine anchor; statement location unresolved } { 6B00:1780 }
                end; { routine anchor; statement location unresolved } { 6B00:1780 }
              FUN_00ba_0767(SelectedChar, g_5D94); { 6B00:181E }
            end; { routine anchor; statement location unresolved } { 6B00:1780 }
          puVar2 := P_Byte($BA); { routine anchor; statement location unresolved } { 6B00:1780 }
        end; { routine anchor; statement location unresolved } { 6B00:1780 }
    end; { routine anchor; statement location unresolved } { 6B00:1780 }
  Exit; { 6B00:1876 }
end; { routine anchor; statement location unresolved } { 6B00:1780 }
```

### ov15:18E5 CampQuitOrDrop (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_2e: array[0..4] of Byte [BP-$2C]; local_29: array[0..2] of Byte [BP-$27]; local_26: array[0..17] of Byte [BP-$24]; local_14: array[0..3] of Byte [BP-$12]; local_10: Byte [BP-$E]; local_f: array[0..12] of Byte [BP-$D].  
Callers (export): FUN_6b00_1c59.  
Callees (export): FUN_00ba_0767, FUN_00ba_16ec, FUN_03f1_0137, FUN_0899_0000, System.@StrCopy, ov16_3291, ov25_10D1.

```pascal
procedure CampQuitOrDrop(); { 6B00:18E5 }
begin { routine anchor; statement location unresolved } { 6B00:18E5 }
  iVar5 := Integer((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 6B00:18E5 }
  iVar4 := Integer(_SelectedChar); { routine anchor; statement location unresolved } { 6B00:18E5 }
  if (((((P_Integer((iVar4 + $104)))^ = 0) and then ((P_Integer((iVar4 + $106)))^ = 0)) and then (iVar5 = g_5D98)) and then (iVar4 = PartyHead)) then { routine anchor; statement location unresolved } { 6B00:18E5 }
    begin { routine anchor; statement location unresolved } { 6B00:18E5 }
      puVar6 := @(local_10); { routine anchor; statement location unresolved } { 6B00:18E5 }
      PString(local_10, SS) := 'quit TO DOS: '; { 6B00:1918 }
      uVar2 := ov25_10D1(Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $E), puVar6, SS); { 6B00:1926 }
      if (ShortInt(uVar2) = 89) then { routine anchor; statement location unresolved } { 6B00:18E5 }
        begin { routine anchor; statement location unresolved } { 6B00:18E5 }
          ov16_3291(1, (uVar2 and $FF00)); { 6B00:1935 }
          FUN_0899_0000(); { 6B00:193A }
        end; { routine anchor; statement location unresolved } { 6B00:18E5 }
    end; { routine anchor; statement location unresolved } { 6B00:18E5 }
  else { routine anchor; statement location unresolved } { 6B00:18E5 }
    begin { routine anchor; statement location unresolved } { 6B00:18E5 }
      puVar6 := local_f; { routine anchor; statement location unresolved } { 6B00:18E5 }
      uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:18E5 }
      PString(local_f, SS) := 'will be gone'; { 6B00:1959 }
      FUN_00ba_16ec((Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, 10), puVar6, uVar7, iVar4, iVar5); { 6B00:1964 }
      puVar6 := local_14; { routine anchor; statement location unresolved } { 6B00:18E5 }
      uVar7 := SS; { routine anchor; statement location unresolved } { 6B00:18E5 }
      PString(local_14, SS) := 'Drop from party? '; { 6B00:1973 }
      cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 10), Pack16(UNKNOWN_extraout_AH_01, $E), puVar6, uVar7); { 6B00:1981 }
      if (cVar1 = 89) then { routine anchor; statement location unresolved } { 6B00:18E5 }
        begin { routine anchor; statement location unresolved } { 6B00:18E5 }
          if ((P_ShortInt((SelectedChar + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 6B00:18E5 }
            begin { routine anchor; statement location unresolved } { 6B00:18E5 }
              puVar6 := local_29; { routine anchor; statement location unresolved } { 6B00:18E5 }
              iVar4 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:18E5 }
              uVar7 := g_5D94; { routine anchor; statement location unresolved } { 6B00:18E5 }
              PString(local_26, SS) := 'is dumped in a ditch'; { 6B00:19AB }
              FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_04, 1), Pack16(UNKNOWN_extraout_AH_04, 10), puVar6, SS, iVar4, uVar7); { 6B00:19B6 }
              bVar3 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 6B00:18E5 }
            end; { routine anchor; statement location unresolved } { 6B00:18E5 }
          else { routine anchor; statement location unresolved } { 6B00:18E5 }
            begin { routine anchor; statement location unresolved } { 6B00:18E5 }
              puVar6 := local_26; { routine anchor; statement location unresolved } { 6B00:18E5 }
              iVar4 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:18E5 }
              uVar7 := g_5D94; { routine anchor; statement location unresolved } { 6B00:18E5 }
              PString(local_29, SS) := 'bids you farewell'; { 6B00:19CF }
              FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_02, 1), Pack16(UNKNOWN_extraout_AH_02, 10), puVar6, SS, iVar4, uVar7); { 6B00:19DA }
              bVar3 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 6B00:18E5 }
            end; { routine anchor; statement location unresolved } { 6B00:18E5 }
          ov16_3291(Pack16(bVar3, 1), (Word(bVar3) shl 8)); { 6B00:19E5 }
          FUN_03f1_0137(Pack16(UNKNOWN_extraout_AH_06, $B), Pack16(UNKNOWN_extraout_AH_06, $26), Pack16(UNKNOWN_extraout_AH_06, 1), Pack16(UNKNOWN_extraout_AH_06, $11)); { 6B00:19F6 }
          FUN_00ba_0767(SelectedChar, g_5D94); { 6B00:1A03 }
        end; { routine anchor; statement location unresolved } { 6B00:18E5 }
      else { routine anchor; statement location unresolved } { 6B00:18E5 }
        begin { routine anchor; statement location unresolved } { 6B00:18E5 }
          puVar6 := local_2e; { routine anchor; statement location unresolved } { 6B00:18E5 }
          iVar4 := SelectedChar; { routine anchor; statement location unresolved } { 6B00:18E5 }
          uVar7 := g_5D94; { routine anchor; statement location unresolved } { 6B00:18E5 }
          PString(local_2e, SS) := 'Breathes A sigh of relief'; { 6B00:1A1C }
          FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_07, 1), Pack16(UNKNOWN_extraout_AH_07, 10), puVar6, SS, iVar4, uVar7); { 6B00:1A27 }
        end; { routine anchor; statement location unresolved } { 6B00:18E5 }
    end; { routine anchor; statement location unresolved } { 6B00:18E5 }
  Exit; { 6B00:1A2F }
end; { routine anchor; statement location unresolved } { 6B00:18E5 }
```

### ov15:1A97 CampSpeedMenu (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; bVar6: Boolean [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_22d: array[0..255] of Byte [BP-$22B]; local_12d: array[0..243] of Byte [BP-$12B]; local_39: array[0..11] of Byte [BP-$37]; local_2d: array[0..40] of Byte [BP-$2B]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): FUN_6b00_1c59.  
Callees (export): FUN_00ba_1037, FUN_00ba_17e3, FUN_0709_0626, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure CampSpeedMenu(); { 6B00:1A97 }
begin { routine anchor; statement location unresolved } { 6B00:1A97 }
  puVar5 := P_Byte(@(g_6B00)); { routine anchor; statement location unresolved } { 6B00:1A97 }
  repeat { routine anchor; statement location unresolved } { 6B00:1A97 }
    begin { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar1 := 1; { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar2 := $12; { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar3 := 10; { routine anchor; statement location unresolved } { 6B00:1A97 }
      puVar7 := local_22d; { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar8 := SS; { routine anchor; statement location unresolved } { 6B00:1A97 }
      PString(local_22d, SS) := 'Game Speed = '; { 6B00:1AB2 }
      puVar5 := local_12d; { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 6B00:1A97 }
      FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH, g_49E2)); { 6B00:1AC1 }
      PString(local_22d, SS) := Copy(PString(local_22d, SS) + PString(puVar5, uVar4), 1, 255); { 6B00:1AC6 }
      PString(local_22d, SS) := Copy(PString(local_22d, SS) + ' (0=fastest 9=slowest)', 1, 255); { 6B00:1AD0 }
      FUN_0709_0626(puVar7, uVar8, uVar3, uVar2, uVar1); { 6B00:1AD5 }
      local_2d[0] := 0; { routine anchor; statement location unresolved } { 6B00:1A97 }
      if (g_49E2 <> 0) then { routine anchor; statement location unresolved } { 6B00:1A97 }
        begin { routine anchor; statement location unresolved } { 6B00:1A97 }
          puVar5 := local_12d; { routine anchor; statement location unresolved } { 6B00:1A97 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 6B00:1A97 }
          PString(local_12d, SS) := PString(local_2d, SS); { 6B00:1AF0 }
          PString(local_12d, SS) := Copy(PString(local_12d, SS) + ' Faster', 1, 255); { 6B00:1AFA }
          PString(local_2d, SS) := Copy(PString(puVar5, uVar4), 1, $28); { 6B00:1B08 }
        end; { routine anchor; statement location unresolved } { 6B00:1A97 }
      if (g_49E2 < 9) then { routine anchor; statement location unresolved } { 6B00:1A97 }
        begin { routine anchor; statement location unresolved } { 6B00:1A97 }
          puVar5 := local_12d; { routine anchor; statement location unresolved } { 6B00:1A97 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 6B00:1A97 }
          PString(local_12d, SS) := PString(local_2d, SS); { 6B00:1B1F }
          PString(local_12d, SS) := Copy(PString(local_12d, SS) + ' Slower', 1, 255); { 6B00:1B29 }
          PString(local_2d, SS) := Copy(PString(puVar5, uVar4), 1, $28); { 6B00:1B37 }
        end; { routine anchor; statement location unresolved } { 6B00:1A97 }
      puVar5 := local_12d; { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 6B00:1A97 }
      PString(local_12d, SS) := PString(local_2d, SS); { 6B00:1B47 }
      PString(local_12d, SS) := Copy(PString(local_12d, SS) + ' Exit', 1, 255); { 6B00:1B51 }
      PString(local_2d, SS) := Copy(PString(puVar5, uVar4), 1, $28); { 6B00:1B5F }
      puVar5 := local_39; { routine anchor; statement location unresolved } { 6B00:1A97 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 6B00:1A97 }
      PString(local_39, SS) := 'Game Speed:'; { 6B00:1B6E }
      uVar4 := ov25_03BD(@(local_4), SS, Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), local_2d, SS, puVar5, uVar4); { 6B00:1B8C }
      local_3 := ShortInt(uVar4); { 6B00:1B91 }
      if (local_4 = 0) then { routine anchor; statement location unresolved } { 6B00:1A97 }
        begin { routine anchor; statement location unresolved } { 6B00:1A97 }
          if (local_3 = 70) then { routine anchor; statement location unresolved } { 6B00:1A97 }
            begin { routine anchor; statement location unresolved } { 6B00:1A97 }
              g_49E2 := (g_49E2 - 1); { 6B00:1BA8 }
              bVar6 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 6B00:1A97 }
            end; { routine anchor; statement location unresolved } { 6B00:1A97 }
          else { routine anchor; statement location unresolved } { 6B00:1A97 }
            begin { routine anchor; statement location unresolved } { 6B00:1A97 }
              bVar6 := false; { routine anchor; statement location unresolved } { 6B00:1A97 }
              if (local_3 = 83) then { routine anchor; statement location unresolved } { 6B00:1A97 }
                begin { routine anchor; statement location unresolved } { 6B00:1A97 }
                  g_49E2 := (g_49E2 + 1); { 6B00:1BB9 }
                  bVar6 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 6B00:1A97 }
                end; { routine anchor; statement location unresolved } { 6B00:1A97 }
            end; { routine anchor; statement location unresolved } { 6B00:1A97 }
        end; { routine anchor; statement location unresolved } { 6B00:1A97 }
      else { routine anchor; statement location unresolved } { 6B00:1A97 }
        if (local_3 = 80) then { routine anchor; statement location unresolved } { 6B00:1A97 }
          begin { routine anchor; statement location unresolved } { 6B00:1A97 }
            bVar6 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 6B00:1A97 }
            if not (bVar6) then { routine anchor; statement location unresolved } { 6B00:1A97 }
              begin { routine anchor; statement location unresolved } { 6B00:1A97 }
                g_49E2 := (g_49E2 - 1); { 6B00:1BC6 }
                bVar6 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 6B00:1A97 }
              end; { routine anchor; statement location unresolved } { 6B00:1A97 }
          end; { routine anchor; statement location unresolved } { 6B00:1A97 }
        else { routine anchor; statement location unresolved } { 6B00:1A97 }
          begin { routine anchor; statement location unresolved } { 6B00:1A97 }
            bVar6 := false; { routine anchor; statement location unresolved } { 6B00:1A97 }
            if ((local_3 = 72) and then Sequence((bVar6 := (g_49E2 = 9)); (g_49E2 < 9))) then { routine anchor; statement location unresolved } { 6B00:1A97 }
              begin { routine anchor; statement location unresolved } { 6B00:1A97 }
                g_49E2 := (g_49E2 + 1); { 6B00:1BD0 }
                bVar6 := (g_49E2 = 0); { routine anchor; statement location unresolved } { 6B00:1A97 }
              end; { routine anchor; statement location unresolved } { 6B00:1A97 }
          end; { routine anchor; statement location unresolved } { 6B00:1A97 }
      puVar5 := P_Byte($AF8); { routine anchor; statement location unresolved } { 6B00:1A97 }
      Flags.ZF := not (LoByte(uVar4) in [0, 69]); { 6B00:1BDD }
    end; { routine anchor; statement location unresolved } { 6B00:1A97 }
  until not (bVar6); { routine anchor; statement location unresolved } { 6B00:1A97 }
  FUN_00ba_17e3(); { 6B00:1BE7 }
  Exit; { 6B00:1BEF }
end; { routine anchor; statement location unresolved } { 6B00:1A97 }
```

### ov15:1C59 AlterOptionsMenu (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Byte [compiler temporary; no proven BP slot]; bVar7: Boolean [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_12e: array[0..247] of Byte [BP-$12C]; local_36: array[0..6] of Byte [BP-$34]; local_2f: Byte [BP-$2D]; local_2e: array[0..40] of Byte [BP-$2C]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): ov15_1E6F.  
Callees (export): FUN_00ba_0767, FUN_00ba_27d9, PartyOrderMenu, CampQuitOrDrop, CampSpeedMenu, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov16_382D, ov19_27DF, ov25_03BD.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure AlterOptionsMenu(); { 6B00:1C59 }
begin { routine anchor; statement location unresolved } { 6B00:1C59 }
  puVar5 := P_Byte(@(g_6B00)); { routine anchor; statement location unresolved } { 6B00:1C59 }
  uVar6 := (@(stack0x0000) = P_Byte($12E)); { routine anchor; statement location unresolved } { 6B00:1C59 }
  local_3 := 32; { 6B00:1C60 }
  while Sequence(Flags.ZF := not (LoByte(local_3) in [0, 69]); Boolean(uVar6)) do { 6B00:1C6D }
    begin { routine anchor; statement location unresolved } { 6B00:1C59 }
      puVar8 := local_36; { routine anchor; statement location unresolved } { 6B00:1C59 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1C59 }
      PString(local_36, SS) := 'Alter: '; { 6B00:1C81 }
      puVar5 := P_Byte($3C5); { routine anchor; statement location unresolved } { 6B00:1C59 }
      uVar1 := ov25_03BD(@(local_5), SS, Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), $55A, $C7C, puVar8, uVar1); { 6B00:1C9F }
      local_3 := ShortInt(uVar1); { 6B00:1CA4 }
      uVar6 := (local_5 = 0); { routine anchor; statement location unresolved } { 6B00:1C59 }
      if Boolean(uVar6) then { routine anchor; statement location unresolved } { 6B00:1C59 }
        begin { routine anchor; statement location unresolved } { 6B00:1C59 }
          uVar6 := (local_3 = 79); { routine anchor; statement location unresolved } { 6B00:1C59 }
          if Boolean(uVar6) then { routine anchor; statement location unresolved } { 6B00:1C59 }
            begin { routine anchor; statement location unresolved } { 6B00:1C59 }
              PartyOrderMenu(); { 6B00:1CCE }
            end; { routine anchor; statement location unresolved } { 6B00:1C59 }
          else { routine anchor; statement location unresolved } { 6B00:1C59 }
            begin { routine anchor; statement location unresolved } { 6B00:1C59 }
              uVar6 := (local_3 = 68); { routine anchor; statement location unresolved } { 6B00:1C59 }
              if Boolean(uVar6) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                  CampQuitOrDrop(); { 6B00:1CD9 }
                end; { routine anchor; statement location unresolved } { 6B00:1C59 }
              else { routine anchor; statement location unresolved } { 6B00:1C59 }
                begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                  uVar6 := (local_3 = 83); { routine anchor; statement location unresolved } { 6B00:1C59 }
                  if Boolean(uVar6) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                    begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                      CampSpeedMenu(); { 6B00:1CE4 }
                    end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                  else { routine anchor; statement location unresolved } { 6B00:1C59 }
                    begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                      uVar6 := (local_3 = 73); { routine anchor; statement location unresolved } { 6B00:1C59 }
                      if Boolean(uVar6) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                        begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                          ov16_382D(); { 6B00:1CEE }
                          puVar5 := P_Byte($BA); { routine anchor; statement location unresolved } { 6B00:1C59 }
                          FUN_00ba_27d9(); { 6B00:1CF3 }
                        end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                      else { routine anchor; statement location unresolved } { 6B00:1C59 }
                        if (local_3 = 80) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                          begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                            repeat { routine anchor; statement location unresolved } { 6B00:1C59 }
                              begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                if (g_49F6 = 0) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    PString(local_2e, SS) := Copy('Monsters off  ', 1, $28); { 6B00:1D17 }
                                  end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                else { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    PString(local_2e, SS) := Copy('Monsters on  ', 1, $28); { 6B00:1D2C }
                                  end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                if (g_49F5 = 0) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    puVar5 := local_12e; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    PString(local_12e, SS) := PString(local_2e, SS); { 6B00:1D43 }
                                    PString(local_12e, SS) := Copy(PString(local_12e, SS) + 'Portraits off  ', 1, 255); { 6B00:1D4D }
                                    PString(local_2e, SS) := Copy(PString(puVar5, uVar1), 1, $28); { 6B00:1D5B }
                                  end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                else { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    puVar5 := local_12e; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    PString(local_12e, SS) := PString(local_2e, SS); { 6B00:1D6D }
                                    PString(local_12e, SS) := Copy(PString(local_12e, SS) + 'Portraits on  ', 1, 255); { 6B00:1D77 }
                                    PString(local_2e, SS) := Copy(PString(puVar5, uVar1), 1, $28); { 6B00:1D85 }
                                  end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                puVar5 := local_12e; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                PString(local_12e, SS) := PString(local_2e, SS); { 6B00:1D95 }
                                PString(local_12e, SS) := Copy(PString(local_12e, SS) + 'Exit', 1, 255); { 6B00:1D9F }
                                PString(local_2e, SS) := Copy(PString(puVar5, uVar1), 1, $28); { 6B00:1DAD }
                                puVar5 := @(local_2f); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                uVar1 := SS; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                PString(local_2f, SS) := ''; { 6B00:1DBC }
                                uVar2 := ov25_03BD(@(local_5), SS, Pack16(UNKNOWN_extraout_AH_00, 1), (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), local_2e, SS, puVar5, uVar1); { 6B00:1DDA }
                                local_4 := ShortInt(uVar2); { 6B00:1DDF }
                                bVar4 := Byte((uVar2 shr 8)); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                if (local_4 = 77) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    iVar3 := (Word(bVar4) * $100); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    bVar7 := false; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    if (g_49F6 = 0) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                                      begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                        iVar3 := (iVar3 + 1); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                        bVar7 := (iVar3 = 0); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                      end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    g_49F6 := ShortInt(iVar3); { 6B00:1DF3 }
                                  end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                else { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    bVar7 := false; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                    if (local_4 = 80) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                                      begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                        iVar3 := (Word(bVar4) * $100); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                        bVar7 := false; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                        if (g_49F5 = 0) then { routine anchor; statement location unresolved } { 6B00:1C59 }
                                          begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                                            iVar3 := (iVar3 + 1); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                            bVar7 := (iVar3 = 0); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                          end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                        g_49F5 := ShortInt(iVar3); { 6B00:1E06 }
                                      end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                  end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                                puVar5 := P_Byte($AF8); { routine anchor; statement location unresolved } { 6B00:1C59 }
                                Flags.ZF := not (LoByte((uVar2 and $FF)) in [0, 69]); { 6B00:1E12 }
                                uVar6 := 0; { routine anchor; statement location unresolved } { 6B00:1C59 }
                              end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                            until not (bVar7); { routine anchor; statement location unresolved } { 6B00:1C59 }
                          end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                        else { routine anchor; statement location unresolved } { 6B00:1C59 }
                          begin { routine anchor; statement location unresolved } { 6B00:1C59 }
                            uVar6 := 0; { routine anchor; statement location unresolved } { 6B00:1C59 }
                          end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                    end; { routine anchor; statement location unresolved } { 6B00:1C59 }
                end; { routine anchor; statement location unresolved } { 6B00:1C59 }
            end; { routine anchor; statement location unresolved } { 6B00:1C59 }
        end; { routine anchor; statement location unresolved } { 6B00:1C59 }
      else { routine anchor; statement location unresolved } { 6B00:1C59 }
        begin { routine anchor; statement location unresolved } { 6B00:1C59 }
          ov19_27DF(uVar1); { 6B00:1CB1 }
          puVar5 := P_Byte($BA); { routine anchor; statement location unresolved } { 6B00:1C59 }
          FUN_00ba_0767(SelectedChar, g_5D94); { 6B00:1CBE }
        end; { routine anchor; statement location unresolved } { 6B00:1C59 }
    end; { routine anchor; statement location unresolved } { 6B00:1C59 }
  Exit; { 6B00:1E22 }
end; { routine anchor; statement location unresolved } { 6B00:1C59 }
```

### ov15:1E6F CampMenu (conf M)

Params (BP stack slots): param_1: P_ShortInt [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; bVar7: Boolean [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_1e: array[0..10] of Byte [BP-$1C]; local_13: array[0..5] of Byte [BP-$11]; local_d: array[0..6] of Byte [BP-$B]; local_6: ShortInt [BP-$4]; local_5: Byte [BP-$3]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_0767, FUN_00ba_17e3, FUN_00ba_27d9, FUN_00ba_290b, FUN_03f1_0137, FUN_0709_0626, FUN_0899_0000, ClearPartyStudySelections, RestWithStudyPlan, SpellActivityMenu, AlterOptionsMenu, System.@SetIn, System.@StrCopy, System.FillChar, ov17_1D58, ov19_0AB3, ov19_27DF, ov25_03BD, ov25_06FB, ov25_10D1.

Camp owner also handles party order, quit/drop, speed and options. Its spell activity callers enter the ov22 chooser/caster; this is not an ECL opcode implementation.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
procedure CampMenu(param_1: P_ShortInt); { 6B00:1E6F }
begin { routine anchor; statement location unresolved } { 6B00:1E6F }
  local_3 := g_49F3; { 6B00:1E78 }
  g_49F3 := 2; { 6B00:1E7B }
  g_6DD8 := 0; { 6B00:1E82 }
  FillChar(MemRef(P_Byte(@(g_6DC2)), $C7C), $E, 0); { 6B00:1E91 }
  FUN_00ba_27d9(); { 6B00:1E96 }
  FUN_03f1_0137(Pack16(UNKNOWN_extraout_AH, $16), Pack16(UNKNOWN_extraout_AH, $26), Pack16(UNKNOWN_extraout_AH, $11), Pack16(UNKNOWN_extraout_AH, 1)); { 6B00:1EA7 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 6B00:1E6F }
  uVar3 := Pack16(UNKNOWN_extraout_AH_00, $12); { routine anchor; statement location unresolved } { 6B00:1E6F }
  uVar4 := Pack16(UNKNOWN_extraout_AH_00, 10); { routine anchor; statement location unresolved } { 6B00:1E6F }
  puVar8 := local_1e; { routine anchor; statement location unresolved } { 6B00:1E6F }
  uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:1E6F }
  PString(local_1e, SS) := 'The party makes camp...'; { 6B00:1EBF }
  uVar6 := $709; { routine anchor; statement location unresolved } { 6B00:1E6F }
  FUN_0709_0626(puVar8, uVar5, uVar4, uVar3, uVar2); { 6B00:1EC4 }
  ClearPartyStudySelections(); { 6B00:1ECA }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 6B00:1E6F }
  local_4 := 32; { 6B00:1ED4 }
  while Sequence((bVar7 := ((param_1)^ = 0)); (bVar7 and then Sequence(Flags.ZF := not (LoByte(local_4) in [0, 69]); bVar7))) do { 6B00:1EED }
    begin { routine anchor; statement location unresolved } { 6B00:1E6F }
      puVar8 := local_d; { routine anchor; statement location unresolved } { 6B00:1E6F }
      uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:1E6F }
      PString(local_d, SS) := 'Camp: '; { 6B00:1F01 }
      uVar6 := $3C5; { routine anchor; statement location unresolved } { 6B00:1E6F }
      uVar5 := ov25_03BD(@(local_6), SS, Pack16(UNKNOWN_extraout_AH_01, 1), Pack16(UNKNOWN_extraout_AH_01, 1), Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 10), Pack16(UNKNOWN_extraout_AH_01, $D), $508, $C7C, puVar8, uVar5); { 6B00:1F1F }
      local_4 := ShortInt(uVar5); { 6B00:1F24 }
      if (local_6 = 0) then { routine anchor; statement location unresolved } { 6B00:1E6F }
        begin { routine anchor; statement location unresolved } { 6B00:1E6F }
          if (local_4 = 83) then { routine anchor; statement location unresolved } { 6B00:1E6F }
            begin { routine anchor; statement location unresolved } { 6B00:1E6F }
              ov17_1D58(); { 6B00:1F4C }
              puVar8 := local_13; { routine anchor; statement location unresolved } { 6B00:1E6F }
              uVar5 := SS; { routine anchor; statement location unresolved } { 6B00:1E6F }
              PString(local_13, SS) := 'Quit TO DOS '; { 6B00:1F5B }
              uVar6 := $3C5; { routine anchor; statement location unresolved } { 6B00:1E6F }
              cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_02, $F), Pack16(UNKNOWN_extraout_AH_02, 10), Pack16(UNKNOWN_extraout_AH_02, $E), puVar8, uVar5); { 6B00:1F69 }
              if (cVar1 = 89) then { routine anchor; statement location unresolved } { 6B00:1E6F }
                begin { routine anchor; statement location unresolved } { 6B00:1E6F }
                  uVar6 := $899; { routine anchor; statement location unresolved } { 6B00:1E6F }
                  FUN_0899_0000(); { 6B00:1F72 }
                end; { routine anchor; statement location unresolved } { 6B00:1E6F }
            end; { routine anchor; statement location unresolved } { 6B00:1E6F }
          else { routine anchor; statement location unresolved } { 6B00:1E6F }
            if (local_4 = 86) then { routine anchor; statement location unresolved } { 6B00:1E6F }
              begin { routine anchor; statement location unresolved } { 6B00:1E6F }
                uVar6 := $85; { routine anchor; statement location unresolved } { 6B00:1E6F }
                ov19_0AB3(@(local_5), SS); { 6B00:1F82 }
              end; { routine anchor; statement location unresolved } { 6B00:1E6F }
            else { routine anchor; statement location unresolved } { 6B00:1E6F }
              begin { routine anchor; statement location unresolved } { 6B00:1E6F }
                uVar5 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6B00:1E6F }
                if (local_4 = 77) then { routine anchor; statement location unresolved } { 6B00:1E6F }
                  begin { routine anchor; statement location unresolved } { 6B00:1E6F }
                    SpellActivityMenu(P_ShortInt(param_1), uVar5); { 6B00:1F93 }
                  end; { routine anchor; statement location unresolved } { 6B00:1E6F }
                else { routine anchor; statement location unresolved } { 6B00:1E6F }
                  if (local_4 = 82) then { routine anchor; statement location unresolved } { 6B00:1E6F }
                    begin { routine anchor; statement location unresolved } { 6B00:1E6F }
                      RestWithStudyPlan(P_ShortInt(param_1), uVar5); { 6B00:1FA2 }
                    end; { routine anchor; statement location unresolved } { 6B00:1E6F }
                  else { routine anchor; statement location unresolved } { 6B00:1E6F }
                    if (local_4 = 65) then { routine anchor; statement location unresolved } { 6B00:1E6F }
                      begin { routine anchor; statement location unresolved } { 6B00:1E6F }
                        AlterOptionsMenu(); { 6B00:1FAC }
                      end; { routine anchor; statement location unresolved } { 6B00:1E6F }
              end; { routine anchor; statement location unresolved } { 6B00:1E6F }
        end; { routine anchor; statement location unresolved } { 6B00:1E6F }
      else { routine anchor; statement location unresolved } { 6B00:1E6F }
        begin { routine anchor; statement location unresolved } { 6B00:1E6F }
          ov19_27DF(uVar5); { 6B00:1F31 }
          uVar6 := $BA; { routine anchor; statement location unresolved } { 6B00:1E6F }
          FUN_00ba_0767(SelectedChar, g_5D94); { 6B00:1F3E }
        end; { routine anchor; statement location unresolved } { 6B00:1E6F }
    end; { routine anchor; statement location unresolved } { 6B00:1E6F }
  ClearPartyStudySelections(); { 6B00:1FB3 }
  g_6DB5 := 0; { 6B00:1FB8 }
  g_6DB7 := 0; { 6B00:1FBB }
  g_49F3 := local_3; { 6B00:1FC1 }
  FUN_00ba_290b(); { 6B00:1FC4 }
  FUN_00ba_17e3(); { 6B00:1FC9 }
  ov25_06FB(); { 6B00:1FCE }
  Exit; { 6B00:1FD6 }
end; { routine anchor; statement location unresolved } { 6B00:1E6F }
```

### ov15:1FD9 ov15_init (conf H)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

```pascal
procedure ov15_init(); { 6B00:1FD9 }
begin { routine anchor; statement location unresolved } { 6B00:1FD9 }
  Exit; { 6B00:1FDD }
end; { routine anchor; statement location unresolved } { 6B00:1FD9 }
```

### ov22:008A ChooseSpell (conf M)

Params (BP stack slots): param_1: P_Integer [BP+$06]; param_2: ShortInt [BP+$0A].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar9: Byte [compiler temporary; no proven BP slot]; bVar10: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; uVar12: Byte [compiler temporary; no proven BP slot]; bVar13: Boolean [compiler temporary; no proven BP slot]; puVar14: P_Byte [compiler temporary; no proven BP slot]; local_64: Byte [BP-$62]; local_63: Boolean [BP-$61]; local_62: Byte [BP-$60]; local_61: Byte [BP-$5F]; local_60: Byte [BP-$5E]; local_5f: Byte [BP-$5D]; local_5d: array[0..40] of Byte [BP-$5B]; local_34: array[0..40] of Byte [BP-$32]; local_b: Integer [BP-$9]; iStack_9: Integer [BP-$7]; local_7: Integer [BP-$5]; local_5: Integer [BP-$3]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_03f1_02e8, System.@SetIn, System.@StrAssign, System.@StrCopy, ov25_0D9A, ov25_11F3.

Chooser mode: 1 Cast,2 Memorize,3 Scribe,4 Learn. Reads selection and builds headings; membership flags in the decompile need branch verification.

Flag-consumer warning: this routine uses SetIn. Conditions that retain earlier Boolean/register variables are unresolved until the JZ/JNZ consumer is checked against the membership call.

```pascal
function ChooseSpell(param_1: P_Integer; param_2: ShortInt): Byte; { 8E00:008A }
begin { routine anchor; statement location unresolved } { 8E00:008A }
  uVar11 := $8E00; { routine anchor; statement location unresolved } { 8E00:008A }
  uVar9 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:008A }
  uVar12 := (param_2 = 1); { routine anchor; statement location unresolved } { 8E00:008A }
  if Boolean(uVar12) then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      uVar11 := $AF8; { routine anchor; statement location unresolved } { 8E00:008A }
      PString(local_5d, SS) := Copy('Cast', 1, $28); { 8E00:00A5 }
      uVar9 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 8E00:008A }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  else { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      uVar12 := (param_2 = 2); { routine anchor; statement location unresolved } { 8E00:008A }
      if Boolean(uVar12) then { routine anchor; statement location unresolved } { 8E00:008A }
        begin { routine anchor; statement location unresolved } { 8E00:008A }
          uVar11 := $AF8; { routine anchor; statement location unresolved } { 8E00:008A }
          PString(local_5d, SS) := Copy('Memorize', 1, $28); { 8E00:00BE }
          uVar9 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 8E00:008A }
        end; { routine anchor; statement location unresolved } { 8E00:008A }
      else { routine anchor; statement location unresolved } { 8E00:008A }
        begin { routine anchor; statement location unresolved } { 8E00:008A }
          uVar12 := (param_2 = 3); { routine anchor; statement location unresolved } { 8E00:008A }
          if Boolean(uVar12) then { routine anchor; statement location unresolved } { 8E00:008A }
            begin { routine anchor; statement location unresolved } { 8E00:008A }
              uVar11 := $AF8; { routine anchor; statement location unresolved } { 8E00:008A }
              PString(local_5d, SS) := Copy('Scribe', 1, $28); { 8E00:00D7 }
              uVar9 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 8E00:008A }
            end; { routine anchor; statement location unresolved } { 8E00:008A }
          else { routine anchor; statement location unresolved } { 8E00:008A }
            begin { routine anchor; statement location unresolved } { 8E00:008A }
              uVar12 := (param_2 = 4); { routine anchor; statement location unresolved } { 8E00:008A }
              if Boolean(uVar12) then { routine anchor; statement location unresolved } { 8E00:008A }
                begin { routine anchor; statement location unresolved } { 8E00:008A }
                  uVar11 := $AF8; { routine anchor; statement location unresolved } { 8E00:008A }
                  PString(local_5d, SS) := Copy('Learn', 1, $28); { 8E00:00F0 }
                  uVar9 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 8E00:008A }
                end; { routine anchor; statement location unresolved } { 8E00:008A }
              else { routine anchor; statement location unresolved } { 8E00:008A }
                begin { routine anchor; statement location unresolved } { 8E00:008A }
                  local_5d[0] := 0; { routine anchor; statement location unresolved } { 8E00:008A }
                end; { routine anchor; statement location unresolved } { 8E00:008A }
            end; { routine anchor; statement location unresolved } { 8E00:008A }
        end; { routine anchor; statement location unresolved } { 8E00:008A }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  Flags.ZF := not (LoByte(Pack16(uVar9, param_2)) in [1, 2, 3, 4]); { 8E00:0104 }
  if Boolean(uVar12) then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      local_34[0] := 0; { routine anchor; statement location unresolved } { 8E00:008A }
      bVar10 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 8E00:008A }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  else { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      PString(local_34, SS) := Copy('Choose Spell: ', 1, $28); { 8E00:0119 }
      bVar10 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 8E00:008A }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  if (param_2 = 2) then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      local_60 := $F; { 8E00:012A }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  else { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      local_60 := $16; { 8E00:0130 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  local_62 := (param_2 <> 4); { 8E00:013A }
  local_63 := false; { 8E00:0144 }
  iVar2 := (param_1)^; { routine anchor; statement location unresolved } { 8E00:008A }
  if (iVar2 < 0) then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      uVar3 := Pack16(bVar10, 1); { routine anchor; statement location unresolved } { 8E00:008A }
      uVar4 := Pack16(bVar10, 3); { routine anchor; statement location unresolved } { 8E00:008A }
      uVar5 := Pack16(bVar10, $26); { routine anchor; statement location unresolved } { 8E00:008A }
      uVar6 := Pack16(bVar10, local_60); { routine anchor; statement location unresolved } { 8E00:008A }
      iVar7 := (Word(bVar10) shl 8); { routine anchor; statement location unresolved } { 8E00:008A }
      iVar8 := (Word(bVar10) shl 8); { routine anchor; statement location unresolved } { 8E00:008A }
      puVar14 := @(local_64); { routine anchor; statement location unresolved } { 8E00:008A }
      uVar11 := SS; { routine anchor; statement location unresolved } { 8E00:008A }
      PString(local_64, SS) := ''; { 8E00:016E }
      FUN_03f1_02e8(puVar14, uVar11, iVar8, iVar7, uVar6, uVar5, uVar4, uVar3); { 8E00:0173 }
      (param_1)^ := 0; { routine anchor; statement location unresolved } { 8E00:008A }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  if ((param_2 = 4) or else Sequence((local_63 := (iVar2 < 0)); (param_2 = 1))) then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      local_63 := true; { 8E00:0178 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  local_7 := 0; { 8E00:0196 }
  local_5 := 0; { 8E00:0199 }
  repeat { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      uVar9 := 1; { routine anchor; statement location unresolved } { 8E00:008A }
      uVar11 := ov25_0D9A(@(local_7), SS, P_Integer(param_1), Integer((LongWord(param_1) shr $10)), @(local_63), SS, local_62, g_4766, g_4768, local_60, $26, 5, 1, $F, 10, $D, local_5d, SS, local_34, SS); { 8E00:01D7 }
      local_61 := Byte(uVar11); { 8E00:01DC }
      Flags.ZF := not (LoByte(uVar11) in [0, 13, 67, 69, 76, 77, 83]); { 8E00:01E8 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  until not (Boolean(uVar9)); { routine anchor; statement location unresolved } { 8E00:008A }
  iStack_9 := g_4768; { 8E00:01F9 }
  local_5f := 0; { 8E00:01FC }
  local_b := g_4766; { 8E00:01F6 }
  while ((iStack_9 <> local_5) or else Sequence((bVar13 := (local_b = local_7)); not (bVar13))) do { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      if ((P_ShortInt((local_b + $29)))^ = 0) then { routine anchor; statement location unresolved } { 8E00:008A }
        begin { routine anchor; statement location unresolved } { 8E00:008A }
          local_5f := (local_5f + 1); { 8E00:021A }
        end; { routine anchor; statement location unresolved } { 8E00:008A }
      piVar1 := P_Integer((local_b + $2A)); { routine anchor; statement location unresolved } { 8E00:008A }
      iStack_9 := (P_Integer((local_b + $2C)))^; { 8E00:022B }
      local_b := (piVar1)^; { 8E00:0228 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  Flags.ZF := not (LoByte(local_61) in [0, 69]); { 8E00:0239 }
  if bVar13 then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      local_3 := P_Byte(@(g_476A))[local_5f]; { 8E00:0240 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  else { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      local_3 := 0; { 8E00:0251 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  if (param_2 = 3) then { routine anchor; statement location unresolved } { 8E00:008A }
    begin { routine anchor; statement location unresolved } { 8E00:008A }
      g_6B80 := (P_Word((P_Byte(@(g_477F)) + (Word(local_5f) * 4))))^; { 8E00:026D }
      g_6B82 := (P_Word((P_Byte(@(g_4781)) + (Word(local_5f) * 4))))^; { 8E00:0270 }
    end; { routine anchor; statement location unresolved } { 8E00:008A }
  ov25_11F3(P_Word(@(g_4766)), $C7C); { 8E00:0279 }
  Exit(local_3); { 8E00:0284 }
end; { routine anchor; statement location unresolved } { 8E00:008A }
```

### ov22:028D AppendSpellChoice (conf M)

Params (BP stack slots): param_1: Byte [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: LongWord [compiler temporary; no proven BP slot]; uVar4: LongWord [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; local_108: array[0..255] of Byte [BP-$106]; local_8: ShortInt [BP-$6]; local_7: ShortInt [BP-$5]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers (export): FUN_8e00_044e,ov22_059C.  
Callees (export): System.@StrAppend, System.@StrAssign, System.@StrCopy, System.GetMem.

```pascal
procedure AppendSpellChoice(param_1: Byte); { 8E00:028D }
begin { routine anchor; statement location unresolved } { 8E00:028D }
  local_6 := g_4766; { 8E00:029B }
  iStack_4 := g_4768; { 8E00:029E }
  if ((g_4766 = 0) and then (g_4768 = 0)) then { routine anchor; statement location unresolved } { 8E00:028D }
    begin { routine anchor; statement location unresolved } { 8E00:028D }
      uVar4 := Allocate($2E); { 8E00:02AE }
      local_8 := 0; { 8E00:02C6 }
      local_7 := 0; { 8E00:02CA }
      uVar3 := uVar4; { routine anchor; statement location unresolved } { 8E00:028D }
    end; { routine anchor; statement location unresolved } { 8E00:028D }
  else { routine anchor; statement location unresolved } { 8E00:028D }
    begin { routine anchor; statement location unresolved } { 8E00:028D }
      local_7 := 1; { 8E00:02D0 }
      local_6 := local_6; { 8E00:02B3 }
      while (((P_Integer((local_6 + $2A)))^ <> 0) or else ((P_Integer((local_6 + $2C)))^ <> 0)) do { routine anchor; statement location unresolved } { 8E00:028D }
        begin { routine anchor; statement location unresolved } { 8E00:028D }
          if ((P_ShortInt((local_6 + $29)))^ = 0) then { routine anchor; statement location unresolved } { 8E00:028D }
            begin { routine anchor; statement location unresolved } { 8E00:028D }
              local_7 := (local_7 + 1); { 8E00:02EB }
            end; { routine anchor; statement location unresolved } { 8E00:028D }
          piVar1 := P_Integer((local_6 + $2A)); { routine anchor; statement location unresolved } { 8E00:028D }
          iStack_4 := (P_Integer((local_6 + $2C)))^; { 8E00:02B6 }
          local_6 := (piVar1)^; { 8E00:02F9 }
        end; { routine anchor; statement location unresolved } { 8E00:028D }
      local_8 := P_Byte(@(g_31FB))[(Word((P_Byte(((Integer(P_Word(@(g_4768))) + local_7) + 1)))^) * $10)]; { 8E00:0318 }
      uVar4 := Allocate($2E); { 8E00:031F }
      (P_Word((local_6 + $2A)))^ := Integer(uVar4); { routine anchor; statement location unresolved } { 8E00:028D }
      (P_Word((local_6 + $2C)))^ := Integer((LongWord(uVar4) shr $10)); { routine anchor; statement location unresolved } { 8E00:028D }
      uVar3 := FarBits(g_4768, (P_Word((local_6 + $2A)))^); { routine anchor; statement location unresolved } { 8E00:028D }
      uVar4 := FarBits((P_Word((local_6 + $2C)))^, g_4766); { routine anchor; statement location unresolved } { 8E00:028D }
    end; { routine anchor; statement location unresolved } { 8E00:028D }
  g_4768 := Integer((LongWord(uVar3) shr $10)); { 8E00:02C2 }
  local_6 := Integer(uVar3); { 8E00:033A }
  iStack_4 := Integer((LongWord(uVar4) shr $10)); { 8E00:02FC }
  g_4766 := Integer(uVar4); { 8E00:02BF }
  (P_Word((local_6 + $2A)))^ := 0; { routine anchor; statement location unresolved } { 8E00:028D }
  (P_Word((local_6 + $2C)))^ := 0; { routine anchor; statement location unresolved } { 8E00:028D }
  if (P_Byte(@(g_31FB))[(Word((param_1 and $7F)) * $10)] <> local_8) then { routine anchor; statement location unresolved } { 8E00:028D }
    begin { routine anchor; statement location unresolved } { 8E00:028D }
      PString(local_6, iStack_4) := Copy(PString(((ShortInt(P_Byte(@(g_31FB))[(Word((param_1 and $7F)) * $10)]) * $29) + $A79), $C7C), 1, $28); { 8E00:038B }
      (P_Byte((local_6 + $29)))^ := 1; { routine anchor; statement location unresolved } { 8E00:028D }
      uVar4 := Allocate($2E); { 8E00:039C }
      (P_Word((local_6 + $2A)))^ := Integer(uVar4); { routine anchor; statement location unresolved } { 8E00:028D }
      (P_Word((local_6 + $2C)))^ := Integer((LongWord(uVar4) shr $10)); { routine anchor; statement location unresolved } { 8E00:028D }
      iVar2 := (P_Integer((local_6 + $2A)))^; { routine anchor; statement location unresolved } { 8E00:028D }
      iStack_4 := (P_Word((local_6 + $2C)))^; { 8E00:033D }
      (P_Word((iVar2 + $2A)))^ := 0; { routine anchor; statement location unresolved } { 8E00:028D }
      (P_Word((iVar2 + $2C)))^ := 0; { routine anchor; statement location unresolved } { 8E00:028D }
      local_6 := iVar2; { 8E00:03B7 }
    end; { routine anchor; statement location unresolved } { 8E00:028D }
  if (param_1 < $80) then { routine anchor; statement location unresolved } { 8E00:028D }
    begin { routine anchor; statement location unresolved } { 8E00:028D }
      PString(local_6, iStack_4) := Copy('  ', 1, $28); { 8E00:03DE }
    end; { routine anchor; statement location unresolved } { 8E00:028D }
  else { routine anchor; statement location unresolved } { 8E00:028D }
    begin { routine anchor; statement location unresolved } { 8E00:028D }
      PString(local_6, iStack_4) := Copy(' *', 1, $28); { 8E00:03F3 }
    end; { routine anchor; statement location unresolved } { 8E00:028D }
  puVar5 := local_108; { routine anchor; statement location unresolved } { 8E00:028D }
  PString(local_108, SS) := PString(local_6, iStack_4); { 8E00:0403 }
  PString(local_108, SS) := Copy(PString(local_108, SS) + PString(((Word((param_1 and $7F)) * $29) + $28E9), $C7C), 1, 255); { 8E00:041C }
  PString(local_6, iStack_4) := Copy(PString(puVar5, SS), 1, $28); { 8E00:042A }
  (P_Byte((local_6 + $29)))^ := 0; { routine anchor; statement location unresolved } { 8E00:028D }
  P_Byte(@(g_476A))[local_7] := (param_1 and $7F); { routine anchor; statement location unresolved } { 8E00:028D }
  Exit; { 8E00:044B }
end; { routine anchor; statement location unresolved } { 8E00:028D }
```

### ov22:044E AppendScrollSpells (conf M)

Params (BP stack slots): param_1: ShortInt [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_7: array[0..3] of Byte [BP-$5]; local_3: Byte [BP-$1].  
Callers (export): FUN_8e00_051c,ov22_059C.  
Callees (export): FUN_00ba_2199, AppendSpellChoice.

```pascal
procedure AppendScrollSpells(param_1: ShortInt); { 8E00:044E }
begin { routine anchor; statement location unresolved } { 8E00:044E }
  cVar1 := FUN_00ba_2199(local_7, SS, $10, SelectedChar, g_5D94); { 8E00:0464 }
  uVar4 := Word((LongWord(PackedAlias(g_6B80)) shr $10)); { routine anchor; statement location unresolved } { 8E00:044E }
  if ((cVar1 <> 0) or else ((0 < (P_ShortInt((Integer(_SelectedChar) + $96)))^) and then (P_Byte(@(g_5582))[(Word((P_Byte((Integer(PackedAlias(g_6B80)) + $2E)))^) * $10)] = 12))) then { routine anchor; statement location unresolved } { 8E00:044E }
    begin { routine anchor; statement location unresolved } { 8E00:044E }
      (P_Byte((Integer(PackedAlias(g_6B80)) + $35)))^ := 0; { routine anchor; statement location unresolved } { 8E00:044E }
    end; { routine anchor; statement location unresolved } { 8E00:044E }
  if ((P_ShortInt((Integer(PackedAlias(g_6B80)) + $35)))^ = 0) then { routine anchor; statement location unresolved } { 8E00:044E }
    begin { routine anchor; statement location unresolved } { 8E00:044E }
      local_3 := 1; { 8E00:04A4 }
      while true do { routine anchor; statement location unresolved } { 8E00:044E }
        begin { routine anchor; statement location unresolved } { 8E00:044E }
          iVar3 := Integer(PackedAlias(g_6B80)); { routine anchor; statement location unresolved } { 8E00:044E }
          uVar4 := Word((LongWord(PackedAlias(g_6B80)) shr $10)); { routine anchor; statement location unresolved } { 8E00:044E }
          if (((param_1 <> 0) and then ($80 < (P_Byte(((iVar3 + Word(local_3)) + $3B)))^)) or else ((param_1 = 0) and then ((P_ShortInt(((iVar3 + Word(local_3)) + $3B)))^ <> 0))) then { routine anchor; statement location unresolved } { 8E00:044E }
            begin { routine anchor; statement location unresolved } { 8E00:044E }
              AppendSpellChoice((P_Byte(((iVar3 + Word(local_3)) + $3B)))^); { 8E00:04EE }
              uVar4 := g_6B82; { routine anchor; statement location unresolved } { 8E00:044E }
              uVar2 := Word(g_4843); { routine anchor; statement location unresolved } { 8E00:044E }
              (P_Word((P_Byte(@(g_477F)) + (uVar2 * 4))))^ := g_6B80; { routine anchor; statement location unresolved } { 8E00:044E }
              (P_Word((P_Byte(@(g_4781)) + (uVar2 * 4))))^ := uVar4; { routine anchor; statement location unresolved } { 8E00:044E }
              g_4843 := (g_4843 + 1); { 8E00:050C }
            end; { routine anchor; statement location unresolved } { 8E00:044E }
          if (local_3 = 3) then { routine anchor; statement location unresolved } { 8E00:044E }
            Break; { routine anchor; statement location unresolved } { 8E00:044E }
          local_3 := (local_3 + 1); { 8E00:04AA }
        end; { routine anchor; statement location unresolved } { 8E00:044E }
    end; { routine anchor; statement location unresolved } { 8E00:044E }
  Exit; { 8E00:0519 }
end; { routine anchor; statement location unresolved } { 8E00:044E }
```

### ov22:051C BuildScrollChoices (conf M)

Params (BP stack slots): param_1: Byte [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers (export): ov22_059C.  
Callees (export): AppendScrollSpells, ItemContainsSpell.

```pascal
procedure BuildScrollChoices(param_1: Byte); { 8E00:051C }
begin { routine anchor; statement location unresolved } { 8E00:051C }
  local_3 := 0; { 8E00:0522 }
  while true do { routine anchor; statement location unresolved } { 8E00:051C }
    begin { routine anchor; statement location unresolved } { 8E00:051C }
      (P_Word((P_Byte(@(g_477F)) + (Word(local_3) * 4))))^ := 0; { routine anchor; statement location unresolved } { 8E00:051C }
      (P_Word((P_Byte(@(g_4781)) + (Word(local_3) * 4))))^ := 0; { routine anchor; statement location unresolved } { 8E00:051C }
      if (local_3 = $30) then { routine anchor; statement location unresolved } { 8E00:051C }
        Break; { routine anchor; statement location unresolved } { 8E00:051C }
      local_3 := (local_3 + 1); { 8E00:0528 }
    end; { routine anchor; statement location unresolved } { 8E00:051C }
  g_4843 := 0; { 8E00:0546 }
  uVar3 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 8E00:051C }
  g_6B82 := (P_Integer((Integer(_SelectedChar) + $CA)))^; { 8E00:055C }
  g_6B80 := (P_Integer((Integer(_SelectedChar) + 200)))^; { 8E00:0559 }
  while ((g_6B80 <> 0) or else (g_6B82 <> 0)) do { routine anchor; statement location unresolved } { 8E00:051C }
    begin { routine anchor; statement location unresolved } { 8E00:051C }
      cVar2 := ItemContainsSpell(g_6B80, g_6B82); { 8E00:0572 }
      if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 8E00:051C }
        begin { routine anchor; statement location unresolved } { 8E00:051C }
          AppendScrollSpells(param_1); { 8E00:057E }
        end; { routine anchor; statement location unresolved } { 8E00:051C }
      piVar1 := P_Integer((g_6B80 + $2A)); { routine anchor; statement location unresolved } { 8E00:051C }
      g_6B82 := (P_Integer((g_6B80 + $2C)))^; { 8E00:0590 }
      g_6B80 := (piVar1)^; { 8E00:058D }
    end; { routine anchor; statement location unresolved } { 8E00:051C }
  Exit; { 8E00:0599 }
end; { routine anchor; statement location unresolved } { 8E00:051C }
```

### ov22:059C BuildSpellChoices (conf M)

Params (BP stack slots): param_1: ShortInt [BP+$06].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; local_4: Byte [BP-$2].  
Callers (export): none recorded.  
Callees (export): AppendSpellChoice, AppendScrollSpells, BuildScrollChoices.

Choice modes: 0 unmarked memorized spells,5 bit-7-marked memorization plans,1 known spellbook ids1..55,2 current scroll,3 all scrolls,6 marked scrolls,4 learnable unknown ids1..56. Clears choice list and 21-byte scratch before populating.

```pascal
function BuildSpellChoices(param_1: ShortInt): Word; { 8E00:059C }
begin { routine anchor; statement location unresolved } { 8E00:059C }
  g_4766 := 0; { 8E00:05A8 }
  g_4768 := 0; { 8E00:05AB }
  local_4 := 0; { 8E00:05AE }
  while Sequence((P_Byte(@(g_476A))[local_4] := 0); (local_4 <> $14)) do { routine anchor; statement location unresolved } { 8E00:059C }
  begin { routine anchor; statement location unresolved } { 8E00:059C }
    begin { routine anchor; statement location unresolved } { 8E00:059C }
    end; { routine anchor; statement location unresolved } { 8E00:059C }
    local_4 := (local_4 + 1); { 8E00:05B4 }
  end; { routine anchor; statement location unresolved } { 8E00:059C }
  if (param_1 = 0) then { routine anchor; statement location unresolved } { 8E00:059C }
    begin { routine anchor; statement location unresolved } { 8E00:059C }
      local_4 := 0; { 8E00:05D0 }
      while true do { routine anchor; statement location unresolved } { 8E00:059C }
        begin { routine anchor; statement location unresolved } { 8E00:059C }
          uVar2 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 8E00:059C }
          iVar1 := Integer(_SelectedChar); { routine anchor; statement location unresolved } { 8E00:059C }
          if (((P_ShortInt(((iVar1 + Word(local_4)) + $17)))^ <> 0) and then ((P_Byte(((iVar1 + Word(local_4)) + $17)))^ < $80)) then { routine anchor; statement location unresolved } { 8E00:059C }
            begin { routine anchor; statement location unresolved } { 8E00:059C }
              AppendSpellChoice((P_Byte(((iVar1 + Word(local_4)) + $17)))^); { 8E00:060E }
            end; { routine anchor; statement location unresolved } { 8E00:059C }
          if (local_4 = $14) then { routine anchor; statement location unresolved } { 8E00:059C }
            Break; { routine anchor; statement location unresolved } { 8E00:059C }
          local_4 := (local_4 + 1); { 8E00:05D6 }
        end; { routine anchor; statement location unresolved } { 8E00:059C }
    end; { routine anchor; statement location unresolved } { 8E00:059C }
  else { routine anchor; statement location unresolved } { 8E00:059C }
    if (param_1 = 5) then { routine anchor; statement location unresolved } { 8E00:059C }
      begin { routine anchor; statement location unresolved } { 8E00:059C }
        local_4 := 0; { 8E00:061E }
        while true do { routine anchor; statement location unresolved } { 8E00:059C }
          begin { routine anchor; statement location unresolved } { 8E00:059C }
            uVar2 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 8E00:059C }
            if ($7F < (P_Byte(((Integer(_SelectedChar) + Word(local_4)) + $17)))^) then { routine anchor; statement location unresolved } { 8E00:059C }
              begin { routine anchor; statement location unresolved } { 8E00:059C }
                AppendSpellChoice((P_Byte(((Integer(_SelectedChar) + Word(local_4)) + $17)))^); { 8E00:064A }
              end; { routine anchor; statement location unresolved } { 8E00:059C }
            if (local_4 = $14) then { routine anchor; statement location unresolved } { 8E00:059C }
              Break; { routine anchor; statement location unresolved } { 8E00:059C }
            local_4 := (local_4 + 1); { 8E00:0624 }
          end; { routine anchor; statement location unresolved } { 8E00:059C }
      end; { routine anchor; statement location unresolved } { 8E00:059C }
    else { routine anchor; statement location unresolved } { 8E00:059C }
      if (param_1 = 1) then { routine anchor; statement location unresolved } { 8E00:059C }
        begin { routine anchor; statement location unresolved } { 8E00:059C }
          local_4 := 1; { 8E00:065A }
          while true do { routine anchor; statement location unresolved } { 8E00:059C }
            begin { routine anchor; statement location unresolved } { 8E00:059C }
              if ((P_ShortInt(((Integer(_SelectedChar) + Word(local_4)) + $32)))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:059C }
                begin { routine anchor; statement location unresolved } { 8E00:059C }
                  AppendSpellChoice(local_4); { 8E00:067A }
                end; { routine anchor; statement location unresolved } { 8E00:059C }
              if (local_4 = $37) then { routine anchor; statement location unresolved } { 8E00:059C }
                Break; { routine anchor; statement location unresolved } { 8E00:059C }
              local_4 := (local_4 + 1); { 8E00:0660 }
            end; { routine anchor; statement location unresolved } { 8E00:059C }
        end; { routine anchor; statement location unresolved } { 8E00:059C }
      else { routine anchor; statement location unresolved } { 8E00:059C }
        if (param_1 = 2) then { routine anchor; statement location unresolved } { 8E00:059C }
          begin { routine anchor; statement location unresolved } { 8E00:059C }
            AppendScrollSpells(0); { 8E00:068E }
          end; { routine anchor; statement location unresolved } { 8E00:059C }
        else { routine anchor; statement location unresolved } { 8E00:059C }
          if (param_1 = 3) then { routine anchor; statement location unresolved } { 8E00:059C }
            begin { routine anchor; statement location unresolved } { 8E00:059C }
              BuildScrollChoices(0); { 8E00:069C }
            end; { routine anchor; statement location unresolved } { 8E00:059C }
          else { routine anchor; statement location unresolved } { 8E00:059C }
            if (param_1 = 6) then { routine anchor; statement location unresolved } { 8E00:059C }
              begin { routine anchor; statement location unresolved } { 8E00:059C }
                BuildScrollChoices(1); { 8E00:06A9 }
              end; { routine anchor; statement location unresolved } { 8E00:059C }
            else { routine anchor; statement location unresolved } { 8E00:059C }
              if (param_1 = 4) then { routine anchor; statement location unresolved } { 8E00:059C }
                begin { routine anchor; statement location unresolved } { 8E00:059C }
                  local_4 := 1; { 8E00:06B2 }
                  while true do { routine anchor; statement location unresolved } { 8E00:059C }
                    begin { routine anchor; statement location unresolved } { 8E00:059C }
                      uVar2 := Word((LongWord(_SelectedChar) shr $10)); { routine anchor; statement location unresolved } { 8E00:059C }
                      if (((P_ShortInt((((Integer(_SelectedChar) + (ShortInt(P_Byte(@(g_31FA))[(Word(local_4) * $10)]) * 3)) + Integer(ShortInt(P_Byte(@(g_31FB))[(Word(local_4) * $10)]))) + $B1)))^ <> 0) and then ((P_ShortInt(((Integer(_SelectedChar) + Word(local_4)) + $32)))^ = 0)) then { routine anchor; statement location unresolved } { 8E00:059C }
                        begin { routine anchor; statement location unresolved } { 8E00:059C }
                          AppendSpellChoice(local_4); { 8E00:070A }
                        end; { routine anchor; statement location unresolved } { 8E00:059C }
                      if (local_4 = $38) then { routine anchor; statement location unresolved } { 8E00:059C }
                        Break; { routine anchor; statement location unresolved } { 8E00:059C }
                      local_4 := (local_4 + 1); { 8E00:06B8 }
                    end; { routine anchor; statement location unresolved } { 8E00:059C }
                end; { routine anchor; statement location unresolved } { 8E00:059C }
  Exit(Pack16(ShortInt(((g_4766 or g_4768) shr 8)), ((g_4766 or g_4768) <> 0))); { 8E00:0726 }
end; { routine anchor; statement location unresolved } { 8E00:059C }
```

### ov22:0729 SpellBaseMagnitude (conf M)

Params: spellId: Byte [BP+6].  
Locals: magnitude: Byte [BP-2]; result: Byte [BP-1]; level: AX temporary.  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2.

Magnitude = metadata base + per-level * effective caster level; item-cast flag g_6DBF substitutes level 6. A computed zero becomes 1 when metadata +6 is nonzero; $FF sentinel also becomes 1. Character/byte return artifacts must be interpreted against AL.

**Assembly review:** All arithmetic inputs zero-extend bytes, then magnitude truncates to byte before sentinel checks. Default level helper identity remains numeric; its ABI uses spellId. Result is meaningful in AL; AH is not a second semantic result.

```pascal
function SpellBaseMagnitude(spellId: Byte): Byte; { 8E00:0729 }
begin { 8E00:0729 }
  if g_6DBF = 0 then begin { 8E00:072F }
    level := LoByte(FUN_00ba_26c2(spellId)); { 8E00:073A }
    magnitude := Byte(ByteAtDS($31FC+16*spellId) + ByteAtDS($31FD+16*spellId)*level); { 8E00:076B }
  end else { 8E00:0770 }
    magnitude := Byte(ByteAtDS($31FC+16*spellId) + ByteAtDS($31FD+16*spellId)*6); { 8E00:079E }
  if (magnitude = 0) and then (ByteAtDS($3200+16*spellId) <> 0) then { 8E00:07A1 }
    magnitude := 1; { 8E00:07B9 }
  if magnitude = $FF then magnitude := 1; { 8E00:07C3 }
  SpellBaseMagnitude := magnitude; { 8E00:07CA }
end; { 8E00:07D3 }
```

### ov22:07D6 SpellDuration (conf M)

Params: spellId: Byte [BP+6].  
Locals: duration: Word [BP-4]; result: Word [BP-2]; level: register temporary.  
Callers (export): FUN_8e00_08c3,ov22_12A5,ov22_1658,ov22_1F41,ov22_2EE5.  
Callees (export): FUN_00ba_26c2, Roll.

Duration special cases are numeric spell ids: $28 => d6*10; $39/$3D => 5d4; $3B => d4*10+40; $3F => combat 2d10*10, outside combat (d10+10)*10; $43 =>1440; otherwise base + per-level*caster level. Do not replace unknown monster/item spell ids with guessed names.

**Assembly review:** Numeric cases are exact. No direct item-level override is present in this routine; default uses FUN_00ba_26c2. RollDice(count,sides) uses source-order arguments and byte result as documented for ov24:0DE3. Time unit remains caller-dependent.

```pascal
function SpellDuration(spellId: Byte): Word; { 8E00:07D6 }
begin { 8E00:07D6 }
  case spellId of { 8E00:07DF }
    $28: duration := RollDice(1,6)*10; { 8E00:07E9 }
    $39,$3D: duration := RollDice(5,4); { 8E00:0809 }
    $3B: duration := RollDice(1,4)*10+40; { 8E00:0820 }
    $3F: if g_49F3 = 5 then { 8E00:0839 }
           duration := RollDice(2,10)*10 { 8E00:0846 }
         else duration := (RollDice(1,10)+10)*10; { 8E00:085D }
    $43: duration := 1440; { 8E00:0875 }
  else begin { 8E00:087C }
    level := LoByte(FUN_00ba_26c2(spellId)); { 8E00:0880 }
    duration := Word(ByteAtDS($31FE+16*spellId) + ByteAtDS($31FF+16*spellId)*level); { 8E00:08B1 }
  end; { 8E00:08B4 }
  SpellDuration := duration; { 8E00:08B7 }
end; { 8E00:08C0 }
```

### ov22:08C3 ApplySpellToTargets (conf M)

Params: message: far string [BP+6,+8]; damageType: Byte [BP+A]; damage: Byte [BP+C]; active: Byte [BP+E]; magnitude: Byte [BP+10]; spellId: Byte [BP+12].  
Locals: messageCopy: string[40] [BP-29]; saved: Byte [BP-30]; magnitude: Byte [BP-2A]; limit: Byte [BP-31]; i: Byte [BP-2B].  
Callers (export): FUN_8e00_0f4f,FUN_8e00_2764,ov22_10A7,ov22_10E9,ov22_1123,ov22_1162,ov22_1190,ov22_11DD,ov22_13D8,ov22_1439,ov22_1499,ov22_14C7,ov22_151B,ov22_17E9,ov22_1822,ov22_185B,ov22_190F,ov22_19C3,ov22_1A16,ov22_1A4F,ov22_1A8A,ov22_1ACC,ov22_225D,ov22_234C,ov22_24D6,ov22_2604,ov22_263D,ov22_266B,ov22_2E02,ov22_2F99,ov22_302A,ov22_3058,ov22_30A2.  
Callees (export): FUN_00ba_0bb8, FUN_00ba_26c2, SpellDuration, System.@StrAssign, ov24_02FA, ov24_0CB7, ov24_0D63, ov24_1344, ov24_1656.

Shared application loop over target count at actual DS:6C94. The source decompiler alias g_6C91_3 is canonicalized to g_6C94. Saves/type/effect metadata are at DS:3202/3203/3204 + id*16. Calls combat damage/effect helpers; resets damage-type scratch on normal nonempty-target exit.

**Assembly review:** Normalized **stack-slot** helper order: message,damageType,damage,active,magnitude,spellId. Message is the far-string value at BP+6. Named ov24 arguments express observed call semantics without asserting a complete source prototype. Target count is snapshotted. Damage is mutable across targets: a failed sentinel check zeroes it for later targets too. When target count is zero, the final g_6819 reset is skipped, matching the branches.

```pascal
procedure ApplySpellToTargets(message: String; damageType,damage,active,magnitude,spellId: Byte); { 8E00:08C3 }
begin { 8E00:08C3 }
  message := Copy(message,1,40); { 8E00:08D7 }
  if damage = 0 then g_6819 := 0 else g_6819 := damageType; { 8E00:08DC }
  if g_6C94 <> 0 then begin { 8E00:08EF }
    if magnitude = 0 then { 8E00:08F9 }
      magnitude := LoByte(FUN_00ba_26c2(spellId)); { 8E00:0903 }
    limit := g_6C94; { 8E00:0913 }
    for i := 1 to limit do begin { 8E00:091B }
      actor := FarPtrAtDS($6C91+4*i); { 8E00:0936 }
      if actor <> nil then begin { 8E00:093A }
        saveMode := ByteAtDS($3202+16*spellId); { 8E00:0967 }
        if saveMode = 0 then saved := 0 { 8E00:096E }
        else saved := ov24_0D63(modifier:=0,kind:=ByteAtDS($3203+16*spellId),actor:=actor); { 8E00:098D }
        if ByteAtDS($31FC+16*g_681B) = $FF then begin { 8E00:09A0 }
          FUN_00ba_0bb8(Offset(actor),Segment(actor)); { 8E00:09AD }
          ov24_02FA(Offset(actor),Segment(actor),11); { 8E00:09BB }
          if ov24_0CB7(caster:=SelectedActor,actor:=actor,value:=ByteAt(actor,$111)) = 0 then begin { 8E00:09D7 }
            damage := 0; { 8E00:09E0 }
            saved := 1; { 8E00:09E4 }
          end; { 8E00:09E8 }
        end; { 8E00:09E8 }
        if damage <> 0 then { 8E00:09E8 }
          ov24_1344(actor:=actor,damage:=damage,saveMode:=saveMode,saveResult:=saved); { 8E00:0A0C }
        effectId := ByteAtDS($3204+16*spellId); { 8E00:0A1C }
        if effectId <> 0 then begin { 8E00:0A1C }
          duration := SpellDuration(spellId); { 8E00:0A3E }
          ov24_1656(actor:=actor,effectId:=effectId,duration:=duration,magnitude:=magnitude,active:=active,saveMode:=saveMode,saveResult:=saved,message:=message); { 8E00:0A63 }
        end; { 8E00:0A68 }
      end; { 8E00:0A68 }
    end; { 8E00:0A6B }
    g_6819 := 0; { 8E00:0A73 }
  end; { 8E00:0A78 }
end; { 8E00:0A7B }
```

### ov22:0A91 ChooseSpellTargets (conf M)

Params (BP stack slots): param_1: P_Byte [BP+$06]; param_2: Word [BP+$0A]; param_3: Byte [BP+$0C].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: LongWord [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_19: array[0..22] of Byte [BP-$17].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_27d9, FUN_00ba_2c48, System.@StrCopy.

```pascal
procedure ChooseSpellTargets(param_1: P_Byte; param_2: Word; param_3: Byte); { 8E00:0A91 }
begin { routine anchor; statement location unresolved } { 8E00:0A91 }
  if ((g_6DB5 = 0) and then (g_6DB7 = 0)) then { routine anchor; statement location unresolved } { 8E00:0A91 }
    begin { routine anchor; statement location unresolved } { 8E00:0A91 }
      g_6DB5 := SelectedChar; { 8E00:0AA7 }
      g_6DB7 := g_5D94; { 8E00:0AAA }
    end; { routine anchor; statement location unresolved } { 8E00:0A91 }
  g_6C95 := SelectedChar; { 8E00:0AB5 }
  g_6C97 := g_5D94; { 8E00:0AB8 }
  g_6C94 := 1; { 8E00:0ABC }
  (param_1)^ := 1; { routine anchor; statement location unresolved } { 8E00:0A91 }
  uVar6 := g_5D98; { routine anchor; statement location unresolved } { 8E00:0A91 }
  cVar1 := P_Byte(@(g_3201))[(Word(param_3) * $10)]; { routine anchor; statement location unresolved } { 8E00:0A91 }
  if (cVar1 <> 1) then { routine anchor; statement location unresolved } { 8E00:0A91 }
    begin { routine anchor; statement location unresolved } { 8E00:0A91 }
      if (cVar1 = 2) then { routine anchor; statement location unresolved } { 8E00:0A91 }
        begin { routine anchor; statement location unresolved } { 8E00:0A91 }
          FUN_00ba_27d9(); { 8E00:0AE2 }
          puVar8 := local_19; { routine anchor; statement location unresolved } { 8E00:0A91 }
          PString(local_19, SS) := 'Cast Spell on whom'; { 8E00:0AF1 }
          FUN_00ba_2c48(P_Word(@(g_6DB5)), $C7C, Pack16(UNKNOWN_extraout_AH, 1), puVar8, SS); { 8E00:0AFE }
          if ((g_6DB5 = 0) and then (g_6DB7 = 0)) then { routine anchor; statement location unresolved } { 8E00:0A91 }
            begin { routine anchor; statement location unresolved } { 8E00:0A91 }
              g_6C95 := 0; { 8E00:0B0E }
              g_6C97 := 0; { 8E00:0B11 }
              g_6C94 := 0; { 8E00:0B14 }
              (param_1)^ := 0; { routine anchor; statement location unresolved } { 8E00:0A91 }
            end; { routine anchor; statement location unresolved } { 8E00:0A91 }
          else { routine anchor; statement location unresolved } { 8E00:0A91 }
            begin { routine anchor; statement location unresolved } { 8E00:0A91 }
              g_6C95 := g_6DB5; { 8E00:0B29 }
              g_6C97 := g_6DB7; { 8E00:0B2C }
            end; { routine anchor; statement location unresolved } { 8E00:0A91 }
        end; { routine anchor; statement location unresolved } { 8E00:0A91 }
      else { routine anchor; statement location unresolved } { 8E00:0A91 }
        if (cVar1 = 4) then { routine anchor; statement location unresolved } { 8E00:0A91 }
          begin { routine anchor; statement location unresolved } { 8E00:0A91 }
            uVar3 := Word(g_6C94); { routine anchor; statement location unresolved } { 8E00:0A91 }
            (P_Word(((Integer(P_Word(@(g_6C90))) + (uVar3 * 4)) + 1)))^ := PartyHead; { routine anchor; statement location unresolved } { 8E00:0A91 }
            (P_Word(((Integer(P_Word(@(g_6C92))) + (uVar3 * 4)) + 1)))^ := uVar6; { routine anchor; statement location unresolved } { 8E00:0A91 }
            while Sequence((uVar2 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(g_6C94) * 4)) + 1)))^); (uVar6 := Word((LongWord(uVar2) shr $10))); (iVar4 := Integer(uVar2)); (((P_Integer((iVar4 + $104)))^ <> 0) or else ((P_Integer((iVar4 + $106)))^ <> 0))) do { routine anchor; statement location unresolved } { 8E00:0A91 }
              begin { routine anchor; statement location unresolved } { 8E00:0A91 }
                uVar2 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(g_6C94) * 4)) + 1)))^; { routine anchor; statement location unresolved } { 8E00:0A91 }
                uVar7 := Word((LongWord(uVar2) shr $10)); { routine anchor; statement location unresolved } { 8E00:0A91 }
                iVar4 := Integer(uVar2); { routine anchor; statement location unresolved } { 8E00:0A91 }
                uVar6 := (P_Word((iVar4 + $106)))^; { routine anchor; statement location unresolved } { 8E00:0A91 }
                iVar5 := ((g_6C94 + 1) * 4); { routine anchor; statement location unresolved } { 8E00:0A91 }
                (P_Word(((Integer(P_Word(@(g_6C90))) + iVar5) + 1)))^ := (P_Word((iVar4 + $104)))^; { routine anchor; statement location unresolved } { 8E00:0A91 }
                (P_Word(((Integer(P_Word(@(g_6C92))) + iVar5) + 1)))^ := uVar6; { routine anchor; statement location unresolved } { 8E00:0A91 }
                g_6C94 := (g_6C94 + 1); { 8E00:0B99 }
              end; { routine anchor; statement location unresolved } { 8E00:0A91 }
          end; { routine anchor; statement location unresolved } { 8E00:0A91 }
        else { routine anchor; statement location unresolved } { 8E00:0A91 }
          begin { routine anchor; statement location unresolved } { 8E00:0A91 }
            (param_1)^ := 0; { routine anchor; statement location unresolved } { 8E00:0A91 }
          end; { routine anchor; statement location unresolved } { 8E00:0A91 }
    end; { routine anchor; statement location unresolved } { 8E00:0A91 }
  Exit; { 8E00:0BAB }
end; { routine anchor; statement location unresolved } { 8E00:0A91 }
```

### ov22:0C20 CastSpellOrUseItem (conf M)

Params (BP stack slots): param_1: P_ShortInt [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: ShortInt [BP+$0C]; param_4: Byte [BP+$0E].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; local_27: array[0..1] of Byte [BP-$25]; local_25: Byte [BP-$23]; local_24: array[0..10] of Byte [BP-$22]; local_19: array[0..3] of Byte [BP-$17]; local_15: Byte [BP-$13]; local_14: array[0..2] of Byte [BP-$12]; local_11: array[0..5] of Byte [BP-$F]; local_b: Integer [BP-$9]; uStack_9: Word [BP-$7]; local_7: ShortInt [BP-$5]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3]; local_3: ShortInt [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_148b, FUN_00ba_1693, FUN_00ba_17e3, FUN_00ba_19de, FUN_00ba_1a29, FUN_03f1_0137, FUN_0709_0626, FUN_08ae_00dc, FUN_08ae_01a5, System.@StrCopy, ReportSpellCast, ov24_0FD2, ov25_10D1, ov30_057B, ov31_071A, ov31_0AF8, ov31_0BE7, ov31_0C0F.

Checks combat-only spell/item use outside combat; may confirm losing a spell, using an item, or aborting. Sets current spell id g_681B around indirect callback table call and clears it afterwards. Dispatch slot 0 selects targets; slots1..67 perform spell effects.

```pascal
procedure CastSpellOrUseItem(param_1: P_ShortInt; param_2: ShortInt; param_3: ShortInt; param_4: Byte); { 8E00:0C20 }
begin { routine anchor; statement location unresolved } { 8E00:0C20 }
  uVar2 := $8E00; { routine anchor; statement location unresolved } { 8E00:0C20 }
  local_b := SelectedChar; { 8E00:0C2D }
  uStack_9 := g_5D94; { 8E00:0C30 }
  local_3 := 1; { 8E00:0C33 }
  if ((g_49F3 <> 5) and then (P_Byte(@(g_3201))[(Word(param_4) * $10)] = 0)) then { routine anchor; statement location unresolved } { 8E00:0C20 }
    begin { routine anchor; statement location unresolved } { 8E00:0C20 }
      if (g_6DBF = 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
        begin { routine anchor; statement location unresolved } { 8E00:0C20 }
          FUN_0709_0626(((Word(param_4) * $29) + $28E9), $C7C, 10, $13, 1); { 8E00:0C78 }
          uVar5 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar7 := Pack16(UNKNOWN_extraout_AH, $14); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar9 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 8E00:0C20 }
          puVar6 := @(local_25); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
          PString(local_25, SS) := 'is a combat-only spell...'; { 8E00:0C90 }
          FUN_0709_0626(puVar6, uVar2, uVar9, uVar7, uVar5); { 8E00:0C95 }
          puVar6 := @(local_15); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar5 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
          PString(local_15, SS) := 'Lose it? '; { 8E00:0CA4 }
          uVar2 := $3C5; { routine anchor; statement location unresolved } { 8E00:0C20 }
          cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, $D), puVar6, uVar5); { 8E00:0CB2 }
          if (cVar1 = 89) then { routine anchor; statement location unresolved } { 8E00:0C20 }
            begin { routine anchor; statement location unresolved } { 8E00:0C20 }
              uVar2 := $BA; { routine anchor; statement location unresolved } { 8E00:0C20 }
              FUN_00ba_148b(param_4); { 8E00:0CBF }
            end; { routine anchor; statement location unresolved } { 8E00:0C20 }
        end; { routine anchor; statement location unresolved } { 8E00:0C20 }
      else { routine anchor; statement location unresolved } { 8E00:0C20 }
        begin { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar9 := 1; { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar7 := $13; { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar5 := 10; { routine anchor; statement location unresolved } { 8E00:0C20 }
          puVar6 := @(local_15); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
          PString(local_15, SS) := 'That Item'; { 8E00:0CD9 }
          FUN_0709_0626(puVar6, uVar2, uVar5, uVar7, uVar9); { 8E00:0CDE }
          uVar5 := Pack16(UNKNOWN_extraout_AH_01, 1); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar7 := Pack16(UNKNOWN_extraout_AH_01, $14); { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar9 := Pack16(UNKNOWN_extraout_AH_01, 10); { routine anchor; statement location unresolved } { 8E00:0C20 }
          puVar6 := local_24; { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
          PString(local_24, SS) := 'is a combat-only item...'; { 8E00:0CF6 }
          FUN_0709_0626(puVar6, uVar2, uVar9, uVar7, uVar5); { 8E00:0CFB }
          puVar6 := local_14; { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar5 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
          PString(local_14, SS) := 'Use it? '; { 8E00:0D0A }
          uVar2 := $3C5; { routine anchor; statement location unresolved } { 8E00:0C20 }
          cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_02, 10), Pack16(UNKNOWN_extraout_AH_02, $F), Pack16(UNKNOWN_extraout_AH_02, $D), puVar6, uVar5); { 8E00:0D18 }
          if (cVar1 = 89) then { routine anchor; statement location unresolved } { 8E00:0C20 }
            begin { routine anchor; statement location unresolved } { 8E00:0C20 }
              (param_1)^ := 1; { routine anchor; statement location unresolved } { 8E00:0C20 }
            end; { routine anchor; statement location unresolved } { 8E00:0C20 }
        end; { routine anchor; statement location unresolved } { 8E00:0C20 }
      param_2 := 0; { routine anchor; statement location unresolved } { 8E00:0C20 }
      local_3 := 0; { 8E00:0D2C }
    end; { routine anchor; statement location unresolved } { 8E00:0C20 }
  uVar5 := uVar2; { routine anchor; statement location unresolved } { 8E00:0C20 }
  if ((param_2 <> 0) and then (g_6DBF = 0)) then { routine anchor; statement location unresolved } { 8E00:0C20 }
    begin { routine anchor; statement location unresolved } { 8E00:0C20 }
      puVar6 := local_11; { routine anchor; statement location unresolved } { 8E00:0C20 }
      uVar5 := $AF8; { routine anchor; statement location unresolved } { 8E00:0C20 }
      uVar7 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
      iVar8 := local_b; { routine anchor; statement location unresolved } { 8E00:0C20 }
      uVar9 := uStack_9; { routine anchor; statement location unresolved } { 8E00:0C20 }
      PString(local_11, SS) := 'casts'; { 8E00:0D4D }
      ReportSpellCast(Pack16(UNKNOWN_extraout_AH_03, param_4), puVar6, uVar7, iVar8, uVar9); { 8E00:0D57 }
    end; { routine anchor; statement location unresolved } { 8E00:0C20 }
  LAB_8e00_0d5a: { routine anchor; statement location unresolved } { 8E00:0C20 }
  while true do { routine anchor; statement location unresolved } { 8E00:0C20 }
    begin { routine anchor; statement location unresolved } { 8E00:0C20 }
      while true do { routine anchor; statement location unresolved } { 8E00:0C20 }
        begin { routine anchor; statement location unresolved } { 8E00:0C20 }
          if (local_3 = 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
            begin { routine anchor; statement location unresolved } { 8E00:0C20 }
              FUN_00ba_17e3(); { 8E00:0F2C }
              if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 8E00:0C20 }
                begin { routine anchor; statement location unresolved } { 8E00:0C20 }
                  FUN_03f1_0137(Pack16(UNKNOWN_extraout_AH_12, $17), Pack16(UNKNOWN_extraout_AH_12, $27), Pack16(UNKNOWN_extraout_AH_12, $17), (Word(UNKNOWN_extraout_AH_12) shl 8)); { 8E00:0F44 }
                end; { routine anchor; statement location unresolved } { 8E00:0C20 }
              Exit; { 8E00:0F4C }
            end; { routine anchor; statement location unresolved } { 8E00:0C20 }
          CallIndirect((g_6B84)^)(uVar5, P_ShortInt(param_1), Integer((LongWord(param_1) shr $10)), param_3, param_4); { routine anchor; statement location unresolved } { 8E00:0C20 }
          if ((param_1)^ = 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
            Break; { routine anchor; statement location unresolved } { 8E00:0C20 }
          local_3 := 0; { 8E00:0D80 }
          if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 8E00:0C20 }
            begin { routine anchor; statement location unresolved } { 8E00:0C20 }
              FUN_00ba_19de($12); { 8E00:0D91 }
              local_5 := ov31_0BE7(local_b, uStack_9); { 8E00:0D9C }
              ov31_0C0F(local_b, uStack_9); { 8E00:0DAA }
              local_7 := 0; { 8E00:0DB2 }
              bVar3 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 8E00:0C20 }
              local_6 := UNKNOWN_extraout_AL; { 8E00:0DAF }
              while true do { routine anchor; statement location unresolved } { 8E00:0C20 }
                begin { routine anchor; statement location unresolved } { 8E00:0C20 }
                  uVar2 := ov30_057B(Pack16(bVar3, local_7), Pack16(bVar3, g_6DBA), Pack16(bVar3, g_6DB9), Pack16(bVar3, local_6), Pack16(bVar3, local_5)); { 8E00:0DCA }
                  bVar3 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 8E00:0C20 }
                  if (ShortInt(uVar2) <> 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
                    Break; { routine anchor; statement location unresolved } { 8E00:0C20 }
                  local_7 := (local_7 + 1); { 8E00:0DD3 }
                end; { routine anchor; statement location unresolved } { 8E00:0C20 }
              ov31_0AF8((Word(bVar3) shl 8), Pack16(bVar3, 1), Pack16(bVar3, local_7), local_b, uStack_9); { 8E00:0DE8 }
              FUN_08ae_01a5(0); { 8E00:0DF0 }
              if (param_4 = $2F) then { routine anchor; statement location unresolved } { 8E00:0C20 }
                begin { routine anchor; statement location unresolved } { 8E00:0C20 }
                  FUN_08ae_00dc(g_262A); { 8E00:0E00 }
                  uVar4 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 8E00:0C20 }
                end; { routine anchor; statement location unresolved } { 8E00:0C20 }
              else { routine anchor; statement location unresolved } { 8E00:0C20 }
                if (param_4 = $33) then { routine anchor; statement location unresolved } { 8E00:0C20 }
                  begin { routine anchor; statement location unresolved } { 8E00:0C20 }
                    FUN_08ae_00dc(g_2624); { 8E00:0E0F }
                    uVar4 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 8E00:0C20 }
                  end; { routine anchor; statement location unresolved } { 8E00:0C20 }
                else { routine anchor; statement location unresolved } { 8E00:0C20 }
                  begin { routine anchor; statement location unresolved } { 8E00:0C20 }
                    FUN_08ae_00dc(g_2618); { 8E00:0E1A }
                    uVar4 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 8E00:0C20 }
                  end; { routine anchor; statement location unresolved } { 8E00:0C20 }
              FUN_00ba_1a29(Pack16(uVar4, $1E), Pack16(uVar4, 4), Pack16(uVar4, g_6DBA), Pack16(uVar4, g_6DB9), Pack16(uVar4, local_6), Pack16(uVar4, local_5)); { 8E00:0E35 }
              FUN_08ae_01a5(10); { 8E00:0E3E }
              cVar1 := ov31_071A((Word(UNKNOWN_extraout_AH_08) shl 8), local_b, uStack_9); { 8E00:0E4C }
              if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
                begin { routine anchor; statement location unresolved } { 8E00:0C20 }
                  ov31_0AF8(1, 1, (P_Byte((Integer((P_LongWord((local_b + $108)))^) + 9)))^, local_b, uStack_9); { 8E00:0E6E }
                  ov31_0AF8((Word(UNKNOWN_extraout_AH_09) shl 8), (Word(UNKNOWN_extraout_AH_09) shl 8), Pack16(UNKNOWN_extraout_AH_09, (P_Byte((Integer((P_LongWord((local_b + $108)))^) + 9)))^), local_b, uStack_9); { 8E00:0E8C }
                end; { routine anchor; statement location unresolved } { 8E00:0C20 }
            end; { routine anchor; statement location unresolved } { 8E00:0C20 }
          uVar5 := $B0; { routine anchor; statement location unresolved } { 8E00:0C20 }
          ov24_0FD2(local_b, uStack_9); { 8E00:0E97 }
          if (g_6DBF = 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
            begin { routine anchor; statement location unresolved } { 8E00:0C20 }
              uVar5 := $BA; { routine anchor; statement location unresolved } { 8E00:0C20 }
              FUN_00ba_148b(Pack16(UNKNOWN_extraout_AH_10, param_4)); { 8E00:0EA7 }
            end; { routine anchor; statement location unresolved } { 8E00:0C20 }
          g_681B := param_4; { 8E00:0EAF }
          CallIndirect((P_ProcedurePointer(P_Word(@(g_6B84))[(Word(param_4) * 2)]))^)(uVar5); { routine anchor; statement location unresolved } { 8E00:0C20 }
          g_681B := 0; { 8E00:0EC1 }
          g_6820 := 0; { 8E00:0EC6 }
        end; { routine anchor; statement location unresolved } { 8E00:0C20 }
      if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 8E00:0C20 }
        Break; { routine anchor; statement location unresolved } { 8E00:0C20 }
      local_3 := 0; { 8E00:0ED4 }
    end; { routine anchor; statement location unresolved } { 8E00:0C20 }
  if (param_3 = 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
    goto code_r0x0008eee0; { routine anchor; statement location unresolved } { 8E00:0C20 }
  goto LAB_8e00_0f01; { routine anchor; statement location unresolved } { 8E00:0C20 }
  code_r0x0008eee0: { routine anchor; statement location unresolved } { 8E00:0C20 }
  puVar6 := local_19; { routine anchor; statement location unresolved } { 8E00:0C20 }
  uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
  PString(local_19, SS) := 'Abort Spell? '; { 8E00:0EEA }
  uVar5 := $3C5; { routine anchor; statement location unresolved } { 8E00:0C20 }
  cVar1 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_11, $F), Pack16(UNKNOWN_extraout_AH_11, 10), Pack16(UNKNOWN_extraout_AH_11, $E), puVar6, uVar2); { 8E00:0EF8 }
  if (cVar1 = 89) then { routine anchor; statement location unresolved } { 8E00:0C20 }
    begin { routine anchor; statement location unresolved } { 8E00:0C20 }
      LAB_8e00_0f01: { routine anchor; statement location unresolved } { 8E00:0C20 }
      puVar6 := local_27; { routine anchor; statement location unresolved } { 8E00:0C20 }
      uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:0C20 }
      PString(local_27, SS) := 'Spell Aborted'; { 8E00:0F0B }
      FUN_00ba_1693(puVar6, uVar2); { 8E00:0F10 }
      if (g_6DBF = 0) then { routine anchor; statement location unresolved } { 8E00:0C20 }
        begin { routine anchor; statement location unresolved } { 8E00:0C20 }
          FUN_00ba_148b(param_4); { 8E00:0F20 }
        end; { routine anchor; statement location unresolved } { 8E00:0C20 }
      uVar5 := $BA; { routine anchor; statement location unresolved } { 8E00:0C20 }
      local_3 := 0; { 8E00:0F25 }
    end; { routine anchor; statement location unresolved } { 8E00:0C20 }
  goto LAB_8e00_0d5a; { routine anchor; statement location unresolved } { 8E00:0C20 }
end; { routine anchor; statement location unresolved } { 8E00:0C20 }
```

### ov22:0F4F ApplyAreaBlessOrCurse (conf M)

Params (BP stack slots): param_1: LongWord [BP+$06]; param_2: ShortInt [BP+$0A].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; local_2c: Byte [BP-$2A]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): FUN_8e00_104a,ov22_100F.  
Callees (export): FUN_00ba_2433, ApplySpellToTargets, System.@StrAssign.

```pascal
procedure ApplyAreaBlessOrCurse(param_1: LongWord; param_2: ShortInt); { 8E00:0F4F }
begin { routine anchor; statement location unresolved } { 8E00:0F4F }
  PString(local_2b, SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $28); { 8E00:0F63 }
  bVar2 := g_6C94; { routine anchor; statement location unresolved } { 8E00:0F4F }
  g_6820 := 1; { 8E00:0F68 }
  bVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 8E00:0F4F }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:0F4F }
    begin { routine anchor; statement location unresolved } { 8E00:0F4F }
      local_2c := 1; { 8E00:0F7A }
      repeat { routine anchor; statement location unresolved } { 8E00:0F4F }
        begin { routine anchor; statement location unresolved } { 8E00:0F4F }
          uVar1 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(local_2c) * 4)) + 1)))^; { routine anchor; statement location unresolved } { 8E00:0F4F }
          uVar3 := 0; { routine anchor; statement location unresolved } { 8E00:0F4F }
          if ((P_ShortInt((Integer(uVar1) + $10E)))^ = param_2) then { routine anchor; statement location unresolved } { 8E00:0F4F }
            begin { routine anchor; statement location unresolved } { 8E00:0F4F }
              if ((g_681B = 1) and then (g_49F3 = 5)) then { routine anchor; statement location unresolved } { 8E00:0F4F }
                begin { routine anchor; statement location unresolved } { 8E00:0F4F }
                  uVar3 := FUN_00ba_2433(1, (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2c) * 4)) + 1)))^, (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2c) * 4)) + 1)))^); { 8E00:0FBF }
                  if (ShortInt(uVar3) <> 0) then { routine anchor; statement location unresolved } { 8E00:0F4F }
                    goto LAB_8e00_0fc8; { routine anchor; statement location unresolved } { 8E00:0F4F }
                end; { routine anchor; statement location unresolved } { 8E00:0F4F }
            end; { routine anchor; statement location unresolved } { 8E00:0F4F }
          else { routine anchor; statement location unresolved } { 8E00:0F4F }
            begin { routine anchor; statement location unresolved } { 8E00:0F4F }
              LAB_8e00_0fc8: { routine anchor; statement location unresolved } { 8E00:0F4F }
              uVar3 := 0; { routine anchor; statement location unresolved } { 8E00:0F4F }
              (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2c) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:0F4F }
              (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2c) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:0F4F }
            end; { routine anchor; statement location unresolved } { 8E00:0F4F }
          bVar4 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:0F4F }
          if (local_2c = bVar2) then { routine anchor; statement location unresolved } { 8E00:0F4F }
            Break; { routine anchor; statement location unresolved } { 8E00:0F4F }
          local_2c := (local_2c + 1); { 8E00:0F7F }
        end; { routine anchor; statement location unresolved } { 8E00:0F4F }
      until not (true); { routine anchor; statement location unresolved } { 8E00:0F4F }
    end; { routine anchor; statement location unresolved } { 8E00:0F4F }
  ApplySpellToTargets(local_2b, SS, (Word(bVar4) shl 8), (Word(bVar4) shl 8), (Word(bVar4) shl 8), (Word(bVar4) shl 8), Pack16(bVar4, g_681B)); { 8E00:0FFB }
  Exit; { 8E00:1001 }
end; { routine anchor; statement location unresolved } { 8E00:0F4F }
```

### ov22:100F BlessEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; local_d: array[0..10] of Byte [BP-$B].  
Callers (export): none recorded.  
Callees (export): ApplyAreaBlessOrCurse, System.@StrCopy.

Bless: dispatch table slot1 and name-table label establish name H. Shared area application filters by caster side.

```pascal
procedure BlessEffect(); { 8E00:100F }
begin { routine anchor; statement location unresolved } { 8E00:100F }
  uVar1 := Word((P_Byte((Integer(_SelectedChar) + $10E)))^); { routine anchor; statement location unresolved } { 8E00:100F }
  puVar2 := local_d; { routine anchor; statement location unresolved } { 8E00:100F }
  PString(local_d, SS) := 'is Blessed'; { 8E00:1029 }
  ApplyAreaBlessOrCurse(puVar2, SS, uVar1); { 8E00:102F }
  Exit; { 8E00:1035 }
end; { routine anchor; statement location unresolved } { 8E00:100F }
```

### ov22:1040 CurseEffect (conf H)

Params: none.  
Locals: temporary message: string[9] [BP-A]; side: AL temporary.  
Callers (export): none recorded.  
Callees (export): none recorded.

Curse entry has prologue at 1040, then falls through into the separately exported fragment104A. Those are one native routine, not two independent procedures.

Unmatched call-location evidence: FUN_00ba_23b7, FUN_8e00_0f4f, System__StrCopy. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

**Assembly review:** Raw prologue1040 and shared-fragment104A provide one complete routine; no standalone call into104A is proven. Side helper left numeric rather than assuming its inversion rule.

```pascal
procedure CurseEffect; { 8E00:1040 }
begin { 8E00:1040 }
  CurseEffect_104E: { 8E00:104E }
  side := LoByte(FUN_00ba_23b7(SelectedChar,g_5D94)); { 8E00:104E }
  ApplyAreaBlessOrCurse('is Cursed',side); { 8E00:1064 }
end; { 8E00:106A }
```

### ov22:104A Fragment_104A (conf H)

Params: inherits CurseEffect frame and argument stack.  
Locals: inherits BP-A message buffer.  
Callers (export): none recorded.  
Callees (export): FUN_00ba_23b7, ApplyAreaBlessOrCurse, System.@StrCopy.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

**Assembly review:** Bookkeeping section only; semantics are reconstructed in parent1040. The raw first instruction PUSH [5D92] completes the far-pointer argument whose segment was pushed at1046. Not a second game routine.

```pascal
Fragment_104A: { 8E00:104A }
begin { 8E00:104A }
  UNKNOWN_InheritedArgumentPushAndCurseBody; { 8E00:104A }
  goto CurseEffect_104E; { 8E00:104E }
end; { 8E00:106A }
```

### ov22:106B CureLightWoundsEffect (conf H)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_234a, Roll, ov24_175D.

```pascal
procedure CureLightWoundsEffect(); { 8E00:106B }
begin { routine anchor; statement location unresolved } { 8E00:106B }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:106B }
    begin { routine anchor; statement location unresolved } { 8E00:106B }
      uVar3 := g_6C95; { routine anchor; statement location unresolved } { 8E00:106B }
      uVar4 := g_6C97; { routine anchor; statement location unresolved } { 8E00:106B }
      uVar2 := Roll(8, 1); { 8E00:1085 }
      cVar1 := ov24_175D((uVar2 and $FF00), uVar2, uVar3, uVar4); { 8E00:108E }
      if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:106B }
        begin { routine anchor; statement location unresolved } { 8E00:106B }
          FUN_00ba_234a(g_6C95, g_6C97); { 8E00:109F }
        end; { routine anchor; statement location unresolved } { 8E00:106B }
    end; { routine anchor; statement location unresolved } { 8E00:106B }
  Exit; { 8E00:10A5 }
end; { routine anchor; statement location unresolved } { 8E00:106B }
```

### ov22:10A7 CauseLightWoundsEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1]; bVar6: Byte [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy, ov24_0E2E.

```pascal
procedure CauseLightWoundsEffect(); { 8E00:10A7 }
begin { routine anchor; statement location unresolved } { 8E00:10A7 }
  bVar6 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:10A7 }
  uVar1 := Pack16(bVar6, g_681B); { routine anchor; statement location unresolved } { 8E00:10A7 }
  iVar2 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:10A7 }
  iVar3 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:10A7 }
  uVar4 := ov24_0E2E(Pack16(bVar6, 8), Pack16(bVar6, 1)); { 8E00:10BD }
  uVar5 := 8; { routine anchor; statement location unresolved } { 8E00:10A7 }
  puVar7 := @(local_3); { routine anchor; statement location unresolved } { 8E00:10A7 }
  PString(local_3, SS) := ''; { 8E00:10D0 }
  ApplySpellToTargets(puVar7, SS, uVar5, uVar4, iVar3, iVar2, uVar1); { 8E00:10D6 }
  Exit; { 8E00:10DC }
end; { routine anchor; statement location unresolved } { 8E00:10A7 }
```

### ov22:10E9 GenericAffectedEffect (conf M)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure GenericAffectedEffect; { 8E00:10E9 }
begin { 8E00:10E9 }
  ApplySpellToTargets('is affected', 0, 0, 0, 0, g_681B); { 8E00:110F }
end; { 8E00:1115 }
```

### ov22:1123 ProtectionEffect (conf M)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure ProtectionEffect; { 8E00:1123 }
begin { 8E00:1123 }
  ApplySpellToTargets('is protected', 0, 0, 0, 0, g_681B); { 8E00:1149 }
end; { 8E00:114F }
```

### ov22:1162 ResistColdEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure ResistColdEffect; { 8E00:1162 }
begin { 8E00:1162 }
  ApplySpellToTargets('is cold-resistant', 0, 0, 0, 0, g_681B); { 8E00:1188 }
end; { 8E00:118E }
```

### ov22:1190 BurningHandsEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1]; bVar6: Byte [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, ApplySpellToTargets, System.@StrCopy.

```pascal
procedure BurningHandsEffect(); { 8E00:1190 }
begin { routine anchor; statement location unresolved } { 8E00:1190 }
  bVar6 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:1190 }
  uVar1 := Pack16(bVar6, g_681B); { routine anchor; statement location unresolved } { 8E00:1190 }
  iVar2 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:1190 }
  iVar3 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:1190 }
  uVar4 := FUN_00ba_26c2(Pack16(bVar6, g_681B)); { 8E00:11A4 }
  uVar5 := 9; { routine anchor; statement location unresolved } { 8E00:1190 }
  puVar7 := @(local_3); { routine anchor; statement location unresolved } { 8E00:1190 }
  PString(local_3, SS) := ''; { 8E00:11B7 }
  ApplySpellToTargets(puVar7, SS, uVar5, uVar4, iVar3, iVar2, uVar1); { 8E00:11BD }
  Exit; { 8E00:11C3 }
end; { routine anchor; statement location unresolved } { 8E00:1190 }
```

### ov22:11DD CharmPersonEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; local_18: array[0..2] of Byte [BP-$16]; local_15: array[0..10] of Byte [BP-$13]; local_a: Integer [BP-$8]; uStack_8: Word [BP-$6]; local_6: Word [BP-$4]; local_4: Word [BP-$2]; uVar8: Byte [compiler temporary; no proven BP slot]; bVar9: Byte [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, FUN_00ba_2199, FUN_00ba_26c2, ApplySpellToTargets, System.@StrCopy, ov24_0000.

```pascal
procedure CharmPersonEffect(); { 8E00:11DD }
begin { routine anchor; statement location unresolved } { 8E00:11DD }
  local_a := g_6C95; { 8E00:11EA }
  uStack_8 := g_6C97; { 8E00:11ED }
  if (((P_Byte((g_6C95 + $9F)))^ < 2) and then ((P_Byte((g_6C95 + $6C)))^ < 2)) then { routine anchor; statement location unresolved } { 8E00:11DD }
    begin { routine anchor; statement location unresolved } { 8E00:11DD }
      uVar8 := Byte((Word(g_6C95) shr 8)); { routine anchor; statement location unresolved } { 8E00:11DD }
      uVar1 := Pack16(uVar8, g_681B); { routine anchor; statement location unresolved } { 8E00:11DD }
      uVar2 := FUN_00ba_26c2(Pack16(uVar8, g_681B)); { 8E00:122F }
      iVar3 := (((P_ShortInt((Integer(_SelectedChar) + $10E)))^ * $80) + (uVar2 and $FF)); { routine anchor; statement location unresolved } { 8E00:11DD }
      bVar9 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:11DD }
      uVar4 := Pack16(bVar9, 1); { routine anchor; statement location unresolved } { 8E00:11DD }
      iVar5 := (Word(bVar9) shl 8); { routine anchor; statement location unresolved } { 8E00:11DD }
      iVar6 := (Word(bVar9) shl 8); { routine anchor; statement location unresolved } { 8E00:11DD }
      puVar10 := local_15; { routine anchor; statement location unresolved } { 8E00:11DD }
      uVar7 := SS; { routine anchor; statement location unresolved } { 8E00:11DD }
      PString(local_18, SS) := 'is charmed'; { 8E00:1215 }
      ApplySpellToTargets(puVar10, uVar7, iVar6, iVar5, uVar4, iVar3, uVar1); { 8E00:1262 }
      uVar7 := FUN_00ba_2199(@(local_6), SS, Pack16(UNKNOWN_extraout_AH_00, $B), local_a, uStack_8); { 8E00:1273 }
      bVar9 := Byte((Word(uVar7) shr 8)); { routine anchor; statement location unresolved } { 8E00:11DD }
      if (ShortInt(uVar7) <> 0) then { routine anchor; statement location unresolved } { 8E00:11DD }
        begin { routine anchor; statement location unresolved } { 8E00:11DD }
          ov24_0000((Word(bVar9) shl 8), local_6, local_4, g_6C95, g_6C97, Pack16(bVar9, $B)); { 8E00:1290 }
        end; { routine anchor; statement location unresolved } { 8E00:11DD }
    end; { routine anchor; statement location unresolved } { 8E00:11DD }
  else { routine anchor; statement location unresolved } { 8E00:11DD }
    begin { routine anchor; statement location unresolved } { 8E00:11DD }
      puVar10 := local_18; { routine anchor; statement location unresolved } { 8E00:11DD }
      iVar3 := g_6C95; { routine anchor; statement location unresolved } { 8E00:11DD }
      uVar7 := g_6C97; { routine anchor; statement location unresolved } { 8E00:11DD }
      PString(local_15, SS) := 'is unaffected'; { 8E00:125C }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar10, SS, iVar3, uVar7); { 8E00:1220 }
    end; { routine anchor; statement location unresolved } { 8E00:11DD }
  Exit; { 8E00:1298 }
end; { routine anchor; statement location unresolved } { 8E00:11DD }
```

### ov22:12A5 EnlargeEffect (conf H)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_f: array[0..11] of Byte [BP-$D]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, FUN_00ba_26c2, SpellDuration, System.@StrCopy, ov24_0E52, ov24_115C.

```pascal
procedure EnlargeEffect(); { 8E00:12A5 }
begin { routine anchor; statement location unresolved } { 8E00:12A5 }
  g_4844 := $12; { 8E00:12AB }
  cVar1 := FUN_00ba_26c2(g_681B); { 8E00:12B4 }
  if (cVar1 = 1) then { routine anchor; statement location unresolved } { 8E00:12A5 }
    begin { routine anchor; statement location unresolved } { 8E00:12A5 }
      g_4845 := 0; { 8E00:12BD }
    end; { routine anchor; statement location unresolved } { 8E00:12A5 }
  else { routine anchor; statement location unresolved } { 8E00:12A5 }
    if (cVar1 = 2) then { routine anchor; statement location unresolved } { 8E00:12A5 }
      begin { routine anchor; statement location unresolved } { 8E00:12A5 }
        g_4845 := 1; { 8E00:12C8 }
      end; { routine anchor; statement location unresolved } { 8E00:12A5 }
    else { routine anchor; statement location unresolved } { 8E00:12A5 }
      if (cVar1 = 3) then { routine anchor; statement location unresolved } { 8E00:12A5 }
        begin { routine anchor; statement location unresolved } { 8E00:12A5 }
          g_4845 := $33; { 8E00:12D3 }
        end; { routine anchor; statement location unresolved } { 8E00:12A5 }
      else { routine anchor; statement location unresolved } { 8E00:12A5 }
        if (cVar1 = 4) then { routine anchor; statement location unresolved } { 8E00:12A5 }
          begin { routine anchor; statement location unresolved } { 8E00:12A5 }
            g_4845 := $4C; { 8E00:12DE }
          end; { routine anchor; statement location unresolved } { 8E00:12A5 }
        else { routine anchor; statement location unresolved } { 8E00:12A5 }
          if (cVar1 = 5) then { routine anchor; statement location unresolved } { 8E00:12A5 }
            begin { routine anchor; statement location unresolved } { 8E00:12A5 }
              g_4845 := $5B; { 8E00:12E9 }
            end; { routine anchor; statement location unresolved } { 8E00:12A5 }
          else { routine anchor; statement location unresolved } { 8E00:12A5 }
            if (cVar1 = 6) then { routine anchor; statement location unresolved } { 8E00:12A5 }
              begin { routine anchor; statement location unresolved } { 8E00:12A5 }
                g_4845 := 100; { 8E00:12F4 }
              end; { routine anchor; statement location unresolved } { 8E00:12A5 }
  cVar1 := ov24_115C(@(local_3), SS, g_4845, g_4844, g_6C95, g_6C97); { 8E00:130E }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:12A5 }
    begin { routine anchor; statement location unresolved } { 8E00:12A5 }
      puVar4 := local_f; { routine anchor; statement location unresolved } { 8E00:12A5 }
      uVar5 := g_6C95; { routine anchor; statement location unresolved } { 8E00:12A5 }
      uVar6 := g_6C97; { routine anchor; statement location unresolved } { 8E00:12A5 }
      PString(local_f, SS) := 'is stronger'; { 8E00:1329 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar4, SS, uVar5, uVar6); { 8E00:1334 }
    end; { routine anchor; statement location unresolved } { 8E00:12A5 }
  uVar2 := $C; { routine anchor; statement location unresolved } { 8E00:12A5 }
  uVar5 := g_6C95; { routine anchor; statement location unresolved } { 8E00:12A5 }
  uVar6 := g_6C97; { routine anchor; statement location unresolved } { 8E00:12A5 }
  uVar3 := SpellDuration(g_681B); { 8E00:1349 }
  ov24_0E52(1, local_3, uVar3, uVar2, uVar5, uVar6); { 8E00:1354 }
  Exit; { 8E00:135C }
end; { routine anchor; statement location unresolved } { 8E00:12A5 }
```

### ov22:136E ReduceEffect (conf H)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_13: array[0..16] of Byte [BP-$11].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, System.@StrCopy, ov24_0D63, ov24_1081.

```pascal
procedure ReduceEffect(); { 8E00:136E }
begin { routine anchor; statement location unresolved } { 8E00:136E }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:136E }
    begin { routine anchor; statement location unresolved } { 8E00:136E }
      bVar2 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:136E }
      cVar1 := ov24_0D63((Word(bVar2) shl 8), Pack16(bVar2, 4), g_6C95, g_6C97); { 8E00:1389 }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 8E00:136E }
        begin { routine anchor; statement location unresolved } { 8E00:136E }
          cVar1 := ov24_1081($C, g_6C95, g_6C97); { 8E00:139D }
          if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:136E }
            begin { routine anchor; statement location unresolved } { 8E00:136E }
              puVar3 := local_13; { routine anchor; statement location unresolved } { 8E00:136E }
              uVar4 := g_6C95; { routine anchor; statement location unresolved } { 8E00:136E }
              uVar5 := g_6C97; { routine anchor; statement location unresolved } { 8E00:136E }
              PString(local_13, SS) := 'has been reduced'; { 8E00:13B8 }
              FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar3, SS, uVar4, uVar5); { 8E00:13C3 }
            end; { routine anchor; statement location unresolved } { 8E00:136E }
        end; { routine anchor; statement location unresolved } { 8E00:136E }
    end; { routine anchor; statement location unresolved } { 8E00:136E }
  Exit; { 8E00:13CB }
end; { routine anchor; statement location unresolved } { 8E00:136E }
```

### ov22:13D8 FriendsEffect (conf H)

Params (BP stack slots): none.  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_f: array[0..11] of Byte [BP-$D]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, Roll, System.@StrCopy.

```pascal
procedure FriendsEffect(); { 8E00:13D8 }
begin { routine anchor; statement location unresolved } { 8E00:13D8 }
  local_3 := (P_Byte((Integer(PackedAlias(g_6C95)) + $15)))^; { 8E00:13E6 }
  uVar2 := Roll(4, 2); { 8E00:13EF }
  pcVar1 := P_ShortInt((Integer(PackedAlias(g_6C95)) + $15)); { routine anchor; statement location unresolved } { 8E00:13D8 }
  (pcVar1)^ := ((pcVar1)^ + ShortInt(uVar2)); { routine anchor; statement location unresolved } { 8E00:13D8 }
  uVar7 := Word((LongWord(PackedAlias(g_6C95)) shr $10)); { routine anchor; statement location unresolved } { 8E00:13D8 }
  if ($19 < (P_Byte((Integer(PackedAlias(g_6C95)) + $15)))^) then { routine anchor; statement location unresolved } { 8E00:13D8 }
    begin { routine anchor; statement location unresolved } { 8E00:13D8 }
      (P_Byte((Integer(PackedAlias(g_6C95)) + $15)))^ := $19; { routine anchor; statement location unresolved } { 8E00:13D8 }
    end; { routine anchor; statement location unresolved } { 8E00:13D8 }
  bVar6 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 8E00:13D8 }
  uVar2 := Pack16(bVar6, g_681B); { routine anchor; statement location unresolved } { 8E00:13D8 }
  uVar7 := Pack16(bVar6, local_3); { routine anchor; statement location unresolved } { 8E00:13D8 }
  uVar3 := Pack16(bVar6, 1); { routine anchor; statement location unresolved } { 8E00:13D8 }
  iVar4 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:13D8 }
  iVar5 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:13D8 }
  puVar8 := local_f; { routine anchor; statement location unresolved } { 8E00:13D8 }
  PString(local_f, SS) := 'is friendly'; { 8E00:142B }
  ApplySpellToTargets(puVar8, SS, iVar5, iVar4, uVar3, uVar7, uVar2); { 8E00:1431 }
  Exit; { 8E00:1437 }
end; { routine anchor; statement location unresolved } { 8E00:13D8 }
```

### ov22:1439 MagicMissileEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; bVar7: Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, ApplySpellToTargets, System.@StrCopy, ov24_0E2E.

```pascal
procedure MagicMissileEffect(); { 8E00:1439 }
begin { routine anchor; statement location unresolved } { 8E00:1439 }
  uVar1 := FUN_00ba_26c2(g_681B); { 8E00:1443 }
  local_3 := Byte(uVar1); { 8E00:1448 }
  bVar7 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 8E00:1439 }
  uVar1 := Pack16(bVar7, g_681B); { routine anchor; statement location unresolved } { 8E00:1439 }
  iVar2 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 8E00:1439 }
  iVar3 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 8E00:1439 }
  uVar4 := ov24_0E2E(4, (local_3 shr 1)); { 8E00:1460 }
  iVar5 := (Word((local_3 shr 1)) + (uVar4 and $FF)); { routine anchor; statement location unresolved } { 8E00:1439 }
  uVar6 := Pack16(ShortInt((Word(iVar5) shr 8)), 8); { routine anchor; statement location unresolved } { 8E00:1439 }
  puVar8 := @(local_4); { routine anchor; statement location unresolved } { 8E00:1439 }
  PString(local_4, SS) := ''; { 8E00:1480 }
  ApplySpellToTargets(puVar8, SS, uVar6, iVar5, iVar3, iVar2, uVar1); { 8E00:1486 }
  Exit; { 8E00:148C }
end; { routine anchor; statement location unresolved } { 8E00:1439 }
```

### ov22:1499 ShieldEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure ShieldEffect; { 8E00:1499 }
begin { 8E00:1499 }
  ApplySpellToTargets('is shielded', 0, 0, 0, 0, g_681B); { 8E00:14BF }
end; { 8E00:14C5 }
```

### ov22:14C7 ShockingGraspEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; puVar9: P_Byte [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1]; bVar8: Byte [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, ApplySpellToTargets, System.@StrCopy, ov24_0E2E.

```pascal
procedure ShockingGraspEffect(); { 8E00:14C7 }
begin { routine anchor; statement location unresolved } { 8E00:14C7 }
  bVar8 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:14C7 }
  uVar1 := Pack16(bVar8, g_681B); { routine anchor; statement location unresolved } { 8E00:14C7 }
  iVar2 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 8E00:14C7 }
  iVar3 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 8E00:14C7 }
  uVar4 := FUN_00ba_26c2(Pack16(bVar8, g_681B)); { 8E00:14DB }
  uVar4 := (uVar4 and $FF); { routine anchor; statement location unresolved } { 8E00:14C7 }
  uVar5 := ov24_0E2E(8, 1); { 8E00:14E9 }
  iVar6 := ((uVar5 and $FF) + uVar4); { routine anchor; statement location unresolved } { 8E00:14C7 }
  uVar7 := Pack16(ShortInt((Word(iVar6) shr 8)), $C); { routine anchor; statement location unresolved } { 8E00:14C7 }
  puVar9 := @(local_3); { routine anchor; statement location unresolved } { 8E00:14C7 }
  PString(local_3, SS) := ''; { 8E00:1501 }
  ApplySpellToTargets(puVar9, SS, uVar7, iVar6, iVar3, iVar2, uVar1); { 8E00:1507 }
  Exit; { routine anchor; statement location unresolved } { 8E00:14C7 }
end; { routine anchor; statement location unresolved } { 8E00:14C7 }
```

### ov22:150D Fragment_150D (conf H)

Params (BP stack slots): inherits owning routine BP frame; no independently proven Pascal arguments.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

```pascal
Fragment_150D: { 8E00:150D }
begin { routine anchor; statement location unresolved } { 8E00:150D }
  UNKNOWN_AnalysisBlockExit; { 8E00:150D }
end; { routine anchor; statement location unresolved } { 8E00:150D }
```

### ov22:151B SleepEffect (conf H)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: LongWord [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar8: Byte [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; local_14: array[0..11] of Byte [BP-$12]; local_8: Byte [BP-$6]; local_7: array[0..3] of Byte [BP-$5]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_2199, ApplySpellToTargets, Roll, System.@StrCopy.

Sleep rolls 4d4 budget; filters target status/immunity effect $35 and consumes budget using target hit-die/category weights. Failed/over-budget targets are nulled in the target pointer array before the shared application call.

```pascal
procedure SleepEffect(); { 8E00:151B }
begin { routine anchor; statement location unresolved } { 8E00:151B }
  g_6820 := 1; { 8E00:1521 }
  uVar9 := $B0; { routine anchor; statement location unresolved } { 8E00:151B }
  uVar3 := Roll(4, 4); { 8E00:152C }
  g_4844 := Byte(uVar3); { 8E00:1531 }
  bVar8 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:151B }
  local_8 := g_6C94; { 8E00:1537 }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:151B }
    begin { routine anchor; statement location unresolved } { 8E00:151B }
      local_3 := 1; { 8E00:1544 }
      repeat { routine anchor; statement location unresolved } { 8E00:151B }
        begin { routine anchor; statement location unresolved } { 8E00:151B }
          uVar2 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(local_3) * 4)) + 1)))^; { routine anchor; statement location unresolved } { 8E00:151B }
          cVar1 := (P_ShortInt((Integer(uVar2) + $73)))^; { routine anchor; statement location unresolved } { 8E00:151B }
          if ((cVar1 < 0) or else (1 < cVar1)) then { routine anchor; statement location unresolved } { 8E00:151B }
            begin { routine anchor; statement location unresolved } { 8E00:151B }
              if (cVar1 = 2) then { routine anchor; statement location unresolved } { 8E00:151B }
                begin { routine anchor; statement location unresolved } { 8E00:151B }
                  g_4845 := 2; { 8E00:1567 }
                end; { routine anchor; statement location unresolved } { 8E00:151B }
              else { routine anchor; statement location unresolved } { 8E00:151B }
                if (cVar1 = 3) then { routine anchor; statement location unresolved } { 8E00:151B }
                  begin { routine anchor; statement location unresolved } { 8E00:151B }
                    g_4845 := 4; { 8E00:1572 }
                  end; { routine anchor; statement location unresolved } { 8E00:151B }
                else { routine anchor; statement location unresolved } { 8E00:151B }
                  if (cVar1 = 4) then { routine anchor; statement location unresolved } { 8E00:151B }
                    begin { routine anchor; statement location unresolved } { 8E00:151B }
                      g_4845 := 6; { 8E00:157D }
                    end; { routine anchor; statement location unresolved } { 8E00:151B }
                  else { routine anchor; statement location unresolved } { 8E00:151B }
                    if (cVar1 = 5) then { routine anchor; statement location unresolved } { 8E00:151B }
                      begin { routine anchor; statement location unresolved } { 8E00:151B }
                        uVar2 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(local_3) * 4)) + 1)))^; { routine anchor; statement location unresolved } { 8E00:151B }
                        if ((P_ShortInt((Integer(uVar2) + $2E)))^ = 0) then { routine anchor; statement location unresolved } { 8E00:151B }
                          begin { routine anchor; statement location unresolved } { 8E00:151B }
                            g_4845 := 10; { 8E00:1588 }
                          end; { routine anchor; statement location unresolved } { 8E00:151B }
                        else { routine anchor; statement location unresolved } { 8E00:151B }
                          begin { routine anchor; statement location unresolved } { 8E00:151B }
                            g_4845 := $14; { 8E00:15A9 }
                          end; { routine anchor; statement location unresolved } { 8E00:151B }
                      end; { routine anchor; statement location unresolved } { 8E00:151B }
                    else { routine anchor; statement location unresolved } { 8E00:151B }
                      begin { routine anchor; statement location unresolved } { 8E00:151B }
                        g_4845 := $14; { 8E00:15B0 }
                      end; { routine anchor; statement location unresolved } { 8E00:151B }
            end; { routine anchor; statement location unresolved } { 8E00:151B }
          else { routine anchor; statement location unresolved } { 8E00:151B }
            begin { routine anchor; statement location unresolved } { 8E00:151B }
              g_4845 := 1; { 8E00:15B7 }
            end; { routine anchor; statement location unresolved } { 8E00:151B }
          uVar2 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(local_3) * 4)) + 1)))^; { routine anchor; statement location unresolved } { 8E00:151B }
          if ((P_ShortInt((Integer(uVar2) + $10C)))^ = 1) then { routine anchor; statement location unresolved } { 8E00:151B }
            begin { routine anchor; statement location unresolved } { 8E00:151B }
              LAB_8e00_1609: { routine anchor; statement location unresolved } { 8E00:151B }
              bVar8 := 0; { routine anchor; statement location unresolved } { 8E00:151B }
              (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_3) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:151B }
              (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_3) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:151B }
            end; { routine anchor; statement location unresolved } { 8E00:151B }
          else { routine anchor; statement location unresolved } { 8E00:151B }
            begin { routine anchor; statement location unresolved } { 8E00:151B }
              uVar9 := $BA; { routine anchor; statement location unresolved } { 8E00:151B }
              uVar3 := FUN_00ba_2199(local_7, SS, $35, (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_3) * 4)) + 1)))^, (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_3) * 4)) + 1)))^); { 8E00:15EE }
              bVar8 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:151B }
              if ((ShortInt(uVar3) <> 0) or else (g_4844 < g_4845)) then { routine anchor; statement location unresolved } { 8E00:151B }
                goto LAB_8e00_1609; { routine anchor; statement location unresolved } { 8E00:151B }
              g_4844 := (g_4844 - g_4845); { 8E00:1603 }
            end; { routine anchor; statement location unresolved } { 8E00:151B }
          if (local_3 = local_8) then { routine anchor; statement location unresolved } { 8E00:151B }
            Break; { routine anchor; statement location unresolved } { 8E00:151B }
          local_3 := (local_3 + 1); { 8E00:1549 }
        end; { routine anchor; statement location unresolved } { 8E00:151B }
      until not (true); { routine anchor; statement location unresolved } { 8E00:151B }
    end; { routine anchor; statement location unresolved } { 8E00:151B }
  uVar3 := Pack16(bVar8, g_681B); { routine anchor; statement location unresolved } { 8E00:151B }
  iVar4 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 8E00:151B }
  iVar5 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 8E00:151B }
  iVar6 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 8E00:151B }
  iVar7 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 8E00:151B }
  puVar10 := local_14; { routine anchor; statement location unresolved } { 8E00:151B }
  PString(local_14, SS) := 'falls asleep'; { 8E00:1643 }
  ApplySpellToTargets(puVar10, SS, iVar7, iVar6, iVar5, iVar4, uVar3); { 8E00:1649 }
  Exit; { 8E00:164F }
end; { routine anchor; statement location unresolved } { 8E00:151B }
```

### ov22:1658 HoldPersonEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; iVar11: Integer [compiler temporary; no proven BP slot]; local_11: array[0..7] of Byte [BP-$F]; local_9: Byte [BP-$7]; local_8: Byte [BP-$6]; local_7: Byte [BP-$5]; local_6: Integer [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_19de, FUN_00ba_1a29, FUN_00ba_26c2, FUN_08ae_00dc, FUN_08ae_01a5, SpellDuration, System.@StrCopy, ov24_0D63, ov24_1656, ov31_0BE7, ov31_0C0F.

Hold Person handler: target-count based save modifiers (-2/-3 for one target depending on spell id, -1 for two, 0 for three/four), plus creature-category immunity. Iterates selected targets backwards and applies effect metadata.

```pascal
procedure HoldPersonEffect(); { 8E00:1658 }
begin { routine anchor; statement location unresolved } { 8E00:1658 }
  if (g_6C94 = 1) then { routine anchor; statement location unresolved } { 8E00:1658 }
    begin { routine anchor; statement location unresolved } { 8E00:1658 }
      if (g_681B = $17) then { routine anchor; statement location unresolved } { 8E00:1658 }
        begin { routine anchor; statement location unresolved } { 8E00:1658 }
          local_9 := $FE; { 8E00:166C }
        end; { routine anchor; statement location unresolved } { 8E00:1658 }
      else { routine anchor; statement location unresolved } { 8E00:1658 }
        begin { routine anchor; statement location unresolved } { 8E00:1658 }
          local_9 := $FD; { 8E00:1672 }
        end; { routine anchor; statement location unresolved } { 8E00:1658 }
    end; { routine anchor; statement location unresolved } { 8E00:1658 }
  else { routine anchor; statement location unresolved } { 8E00:1658 }
    if (g_6C94 = 2) then { routine anchor; statement location unresolved } { 8E00:1658 }
      begin { routine anchor; statement location unresolved } { 8E00:1658 }
        local_9 := $FF; { 8E00:167C }
      end; { routine anchor; statement location unresolved } { 8E00:1658 }
    else { routine anchor; statement location unresolved } { 8E00:1658 }
      if ((g_6C94 = 3) or else (g_6C94 = 4)) then { routine anchor; statement location unresolved } { 8E00:1658 }
        begin { routine anchor; statement location unresolved } { 8E00:1658 }
          local_9 := 0; { 8E00:168A }
        end; { routine anchor; statement location unresolved } { 8E00:1658 }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:1658 }
    begin { routine anchor; statement location unresolved } { 8E00:1658 }
      local_8 := g_6C94; { 8E00:1698 }
      while true do { routine anchor; statement location unresolved } { 8E00:1658 }
        begin { routine anchor; statement location unresolved } { 8E00:1658 }
          if (((P_Integer(((Integer(P_Word(@(g_6C90))) + (Word(local_8) * 4)) + 1)))^ <> 0) or else ((P_Integer(((Integer(P_Word(@(g_6C92))) + (Word(local_8) * 4)) + 1)))^ <> 0)) then { routine anchor; statement location unresolved } { 8E00:1658 }
            begin { routine anchor; statement location unresolved } { 8E00:1658 }
              local_6 := (P_Integer(((Integer(P_Word(@(g_6C90))) + (Word(local_8) * 4)) + 1)))^; { 8E00:16CB }
              uStack_4 := (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_8) * 4)) + 1)))^; { 8E00:16CE }
              if (local_8 < g_6C94) then { routine anchor; statement location unresolved } { 8E00:1658 }
                begin { routine anchor; statement location unresolved } { 8E00:1658 }
                  FUN_08ae_01a5(0); { 8E00:16DD }
                  FUN_08ae_00dc(g_2618); { 8E00:16E6 }
                  FUN_00ba_19de(Pack16(UNKNOWN_extraout_AH, $12)); { 8E00:16EE }
                  uVar1 := ov31_0BE7(SelectedChar, g_5D94); { 8E00:16FB }
                  uVar2 := ov31_0C0F(SelectedChar, g_5D94); { 8E00:1709 }
                  uVar3 := ov31_0BE7(local_6, uStack_4); { 8E00:1715 }
                  uVar4 := ov31_0C0F(local_6, uStack_4); { 8E00:1721 }
                  FUN_00ba_1a29($1E, 4, uVar4, uVar3, uVar2, uVar1); { 8E00:172D }
                  FUN_08ae_01a5(10); { 8E00:1736 }
                end; { routine anchor; statement location unresolved } { 8E00:1658 }
              local_7 := ov24_0D63(local_9, P_Byte(@(g_3203))[(Word(g_681B) * $10)], local_6, uStack_4); { 8E00:1755 }
              if ((1 < (P_Byte((local_6 + $9F)))^) or else (1 < (P_Byte((local_6 + $6C)))^)) then { routine anchor; statement location unresolved } { 8E00:1658 }
                begin { routine anchor; statement location unresolved } { 8E00:1658 }
                  local_7 := 1; { 8E00:1772 }
                end; { routine anchor; statement location unresolved } { 8E00:1658 }
              uVar5 := Word(Byte(P_Byte(@(g_3204))[(Word(g_681B) * $10)])); { routine anchor; statement location unresolved } { 8E00:1658 }
              iVar11 := local_6; { routine anchor; statement location unresolved } { 8E00:1658 }
              uVar2 := uStack_4; { routine anchor; statement location unresolved } { 8E00:1658 }
              uVar3 := SpellDuration(g_681B); { 8E00:1791 }
              uVar6 := FUN_00ba_26c2(g_681B); { 8E00:1799 }
              uVar7 := (uVar6 and $FF00); { routine anchor; statement location unresolved } { 8E00:1658 }
              uVar8 := Word(Byte(P_Byte(@(g_3202))[(Word(g_681B) * $10)])); { routine anchor; statement location unresolved } { 8E00:1658 }
              uVar9 := Word(local_7); { routine anchor; statement location unresolved } { 8E00:1658 }
              puVar10 := local_11; { routine anchor; statement location unresolved } { 8E00:1658 }
              uVar1 := SS; { routine anchor; statement location unresolved } { 8E00:1658 }
              PString(local_11, SS) := 'is held'; { 8E00:17C0 }
              ov24_1656(puVar10, uVar1, uVar9, uVar8, uVar7, uVar6, uVar3, uVar5, iVar11, uVar2); { 8E00:17C5 }
            end; { routine anchor; statement location unresolved } { 8E00:1658 }
          if (local_8 = 1) then { routine anchor; statement location unresolved } { 8E00:1658 }
            Break; { routine anchor; statement location unresolved } { 8E00:1658 }
          local_8 := (local_8 - 1); { 8E00:169D }
        end; { routine anchor; statement location unresolved } { 8E00:1658 }
    end; { routine anchor; statement location unresolved } { 8E00:1658 }
  Exit; { 8E00:17D6 }
end; { routine anchor; statement location unresolved } { 8E00:1658 }
```

### ov22:17E9 ResistFireEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure ResistFireEffect; { 8E00:17E9 }
begin { 8E00:17E9 }
  ApplySpellToTargets('is fire resistant', 0, 0, 0, 0, g_681B); { 8E00:180F }
end; { 8E00:1815 }
```

### ov22:1822 Silence15RadiusEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure Silence15RadiusEffect; { 8E00:1822 }
begin { 8E00:1822 }
  ApplySpellToTargets('is silenced', 0, 0, 0, 0, g_681B); { 8E00:1848 }
end; { 8E00:184E }
```

### ov22:185B SlowPoisonEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_16: array[0..11] of Byte [BP-$14]; local_a: Integer [BP-$8]; uStack_8: Word [BP-$6]; local_6: array[0..3] of Byte [BP-$4].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_2199, ApplySpellToTargets, System.@StrCopy, ov24_0000, ov24_0E52.

```pascal
procedure SlowPoisonEffect(); { 8E00:185B }
begin { routine anchor; statement location unresolved } { 8E00:185B }
  local_a := g_6C95; { 8E00:1868 }
  uStack_8 := g_6C97; { 8E00:186B }
  if ((P_ShortInt((g_6C95 + $10C)))^ = 1) then { routine anchor; statement location unresolved } { 8E00:185B }
    begin { routine anchor; statement location unresolved } { 8E00:185B }
      g_6C95 := 0; { 8E00:187B }
      g_6C97 := 0; { 8E00:187E }
    end; { routine anchor; statement location unresolved } { 8E00:185B }
  else { routine anchor; statement location unresolved } { 8E00:185B }
    begin { routine anchor; statement location unresolved } { 8E00:185B }
      uVar1 := FUN_00ba_2199(local_6, SS, Pack16(ShortInt((Word(g_6C95) shr 8)), $37), g_6C95, g_6C97); { 8E00:1891 }
      bVar6 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 8E00:185B }
      if (ShortInt(uVar1) <> 0) then { routine anchor; statement location unresolved } { 8E00:185B }
        begin { routine anchor; statement location unresolved } { 8E00:185B }
          if ((P_ShortInt((local_a + $11B)))^ = 0) then { routine anchor; statement location unresolved } { 8E00:185B }
            begin { routine anchor; statement location unresolved } { 8E00:185B }
              (P_Byte((local_a + $11B)))^ := 1; { routine anchor; statement location unresolved } { 8E00:185B }
            end; { routine anchor; statement location unresolved } { 8E00:185B }
          uVar1 := Pack16(bVar6, g_681B); { routine anchor; statement location unresolved } { 8E00:185B }
          uVar2 := Pack16(bVar6, $FF); { routine anchor; statement location unresolved } { 8E00:185B }
          uVar3 := Pack16(bVar6, 1); { routine anchor; statement location unresolved } { 8E00:185B }
          iVar4 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:185B }
          iVar5 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:185B }
          puVar7 := local_16; { routine anchor; statement location unresolved } { 8E00:185B }
          PString(local_16, SS) := 'is affected'; { 8E00:18C8 }
          ApplySpellToTargets(puVar7, SS, iVar5, iVar4, uVar3, uVar2, uVar1); { 8E00:18CE }
          ov24_0000(1, 0, 0, local_a, uStack_8, Pack16(UNKNOWN_extraout_AH, $4E)); { 8E00:18E3 }
          ov24_0E52(1, $FF, 10, Pack16(UNKNOWN_extraout_AH_00, $F), local_a, uStack_8); { 8E00:18FB }
        end; { routine anchor; statement location unresolved } { 8E00:185B }
    end; { routine anchor; statement location unresolved } { 8E00:185B }
  Exit; { 8E00:1903 }
end; { routine anchor; statement location unresolved } { 8E00:185B }
```

### ov22:190F SnakeCharmEffect (conf H)

Params (BP stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_11: array[0..10] of Byte [BP-$F]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

```pascal
procedure SnakeCharmEffect(); { 8E00:190F }
begin { routine anchor; statement location unresolved } { 8E00:190F }
  g_4844 := (P_Byte((Integer(_SelectedChar) + $11B)))^; { 8E00:191E }
  g_6C94 := 0; { 8E00:1921 }
  iStack_4 := g_5D98; { 8E00:1930 }
  local_6 := PartyHead; { 8E00:192D }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do { routine anchor; statement location unresolved } { 8E00:190F }
    begin { routine anchor; statement location unresolved } { 8E00:190F }
      if (((P_ShortInt((local_6 + $9F)))^ = 14) and then ((P_Byte((local_6 + $11B)))^ <= g_4844)) then { routine anchor; statement location unresolved } { 8E00:190F }
        begin { routine anchor; statement location unresolved } { 8E00:190F }
          g_4844 := (g_4844 - (P_ShortInt((local_6 + $11B)))^); { 8E00:1966 }
          g_6C94 := (g_6C94 + 1); { 8E00:1969 }
          uVar2 := Word(g_6C94); { routine anchor; statement location unresolved } { 8E00:190F }
          (P_Integer(((Integer(P_Word(@(g_6C90))) + (uVar2 * 4)) + 1)))^ := local_6; { routine anchor; statement location unresolved } { 8E00:190F }
          (P_Integer(((Integer(P_Word(@(g_6C92))) + (uVar2 * 4)) + 1)))^ := iStack_4; { routine anchor; statement location unresolved } { 8E00:190F }
        end; { routine anchor; statement location unresolved } { 8E00:190F }
      piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 8E00:190F }
      iStack_4 := (P_Integer((local_6 + $106)))^; { 8E00:1996 }
      local_6 := (piVar1)^; { 8E00:1993 }
    end; { routine anchor; statement location unresolved } { 8E00:190F }
  uVar2 := Word(g_681B); { routine anchor; statement location unresolved } { 8E00:190F }
  uVar3 := 0; { routine anchor; statement location unresolved } { 8E00:190F }
  uVar4 := 0; { routine anchor; statement location unresolved } { 8E00:190F }
  uVar5 := 0; { routine anchor; statement location unresolved } { 8E00:190F }
  uVar6 := 0; { routine anchor; statement location unresolved } { 8E00:190F }
  puVar7 := local_11; { routine anchor; statement location unresolved } { 8E00:190F }
  PString(local_11, SS) := 'is charmed'; { 8E00:19B5 }
  ApplySpellToTargets(puVar7, SS, uVar6, uVar5, uVar4, uVar3, uVar2); { 8E00:19BB }
  Exit; { 8E00:19C1 }
end; { routine anchor; statement location unresolved } { 8E00:190F }
```

### ov22:19C3 SpiritualHammerEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1]; bVar6: Byte [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy, ov24_0000.

```pascal
procedure SpiritualHammerEffect(); { 8E00:19C3 }
begin { routine anchor; statement location unresolved } { 8E00:19C3 }
  bVar6 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:19C3 }
  uVar1 := Pack16(bVar6, g_681B); { routine anchor; statement location unresolved } { 8E00:19C3 }
  iVar2 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:19C3 }
  uVar3 := Pack16(bVar6, 1); { routine anchor; statement location unresolved } { 8E00:19C3 }
  iVar4 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:19C3 }
  iVar5 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:19C3 }
  puVar7 := @(local_3); { routine anchor; statement location unresolved } { 8E00:19C3 }
  PString(local_3, SS) := ''; { 8E00:19E3 }
  ApplySpellToTargets(puVar7, SS, iVar5, iVar4, uVar3, iVar2, uVar1); { 8E00:19E9 }
  ov24_0000(0, 0, 0, g_6C95, g_6C97, Pack16(UNKNOWN_extraout_AH, $17)); { 8E00:1A00 }
  Exit; { 8E00:1A08 }
end; { routine anchor; statement location unresolved } { 8E00:19C3 }
```

### ov22:1A16 InvisibilityEffect (conf M)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure InvisibilityEffect; { 8E00:1A16 }
begin { 8E00:1A16 }
  ApplySpellToTargets('is invisible', 0, 0, 0, 0, g_681B); { 8E00:1A3C }
end; { 8E00:1A42 }
```

### ov22:1A4F KnockEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure KnockEffect; { 8E00:1A4F }
begin { 8E00:1A4F }
  ApplySpellToTargets('Knock-Knock', 0, 0, 0, 0, g_681B); { 8E00:1A75 }
end; { 8E00:1A7B }
```

### ov22:1A8A MirrorImageEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_10: array[0..13] of Byte [BP-$E].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, Roll, System.@StrCopy.

```pascal
procedure MirrorImageEffect(); { 8E00:1A8A }
begin { routine anchor; statement location unresolved } { 8E00:1A8A }
  uVar2 := Word(g_681B); { routine anchor; statement location unresolved } { 8E00:1A8A }
  uVar3 := Roll(4, 1); { 8E00:1A9A }
  uVar1 := (uVar3 shr 8); { routine anchor; statement location unresolved } { 8E00:1A8A }
  iVar4 := (uVar1 shl 8); { routine anchor; statement location unresolved } { 8E00:1A8A }
  iVar5 := (uVar1 shl 8); { routine anchor; statement location unresolved } { 8E00:1A8A }
  iVar6 := (uVar1 shl 8); { routine anchor; statement location unresolved } { 8E00:1A8A }
  puVar7 := local_10; { routine anchor; statement location unresolved } { 8E00:1A8A }
  PString(local_10, SS) := 'is duplicated'; { 8E00:1AB3 }
  ApplySpellToTargets(puVar7, SS, iVar6, iVar5, iVar4, uVar3, uVar2); { 8E00:1AB9 }
  Exit; { 8E00:1ABF }
end; { routine anchor; statement location unresolved } { 8E00:1A8A }
```

### ov22:1ACC RayofEnfeeblementEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure RayofEnfeeblementEffect; { 8E00:1ACC }
begin { 8E00:1ACC }
  ApplySpellToTargets('is weakened', 0, 0, 0, 0, g_681B); { 8E00:1AF2 }
end; { 8E00:1AF8 }
```

### ov22:1B11 StinkingCloudEffect (conf H)

Params (BP stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; piVar4: P_Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: LongWord [compiler temporary; no proven BP slot]; bStack_11: Byte [BP-$F]; local_10: Byte [BP-$E]; uStack_f: Byte [BP-$D]; auStack_e: array[0..3] of Byte [BP-$C]; local_a: LongWord [BP-$8]; piStack_6: P_Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, System.FillChar, System.GetMem, ov24_0E52.

Stinking Cloud (table slot34) owns the frame used by 1C31,1CF4,1DAA,1DBE,1DC1. Creates 19-byte cloud nodes: caster far pointer+0, next+4, four underlying tiles+8..11, four active flags+12..15, centerX+16,centerY+17, caster-cloud ordinal+18. The split decompiler fragments require CFG stitching; JMP edges must not become recursive Pascal calls.

Unmatched call-location evidence: FUN_8e00_1cf4, FUN_8e00_1daa, FUN_8e00_1dbe, FUN_8e00_1dc1, stub_ov31_e6. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
procedure StinkingCloudEffect(); { 8E00:1B11 }
begin { routine anchor; statement location unresolved } { 8E00:1B11 }
  g_6820 := 1; { 8E00:1B17 }
  bVar2 := FUN_00ba_26c2(g_681B); { 8E00:1B20 }
  local_10 := 0; { 8E00:1B28 }
  local_a := P_Integer(FarBits(PackedAlias(g_6DBD), g_6DBB)); { 8E00:1B33 }
  if ((g_6DBB = P_Integer($0)) and then (PackedAlias(g_6DBD) = 0)) then { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      local_a := P_Integer(Allocate($13)); { 8E00:1B46 }
      piVar1 := local_a; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  else { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      while true do { routine anchor; statement location unresolved } { 8E00:1B11 }
        begin { routine anchor; statement location unresolved } { 8E00:1B11 }
          uVar5 := Word((LongWord(local_a) shr $10)); { routine anchor; statement location unresolved } { 8E00:1B11 }
          piVar4 := P_Integer(local_a); { routine anchor; statement location unresolved } { 8E00:1B11 }
          if ((piVar4[2] = 0) and then (piVar4[3] = 0)) then { routine anchor; statement location unresolved } { 8E00:1B11 }
            Break; { routine anchor; statement location unresolved } { 8E00:1B11 }
          if ((piVar4[1] = g_5D94) and then ((local_a)^ = SelectedChar)) then { routine anchor; statement location unresolved } { 8E00:1B11 }
            begin { routine anchor; statement location unresolved } { 8E00:1B11 }
              local_10 := (local_10 + 1); { 8E00:1B84 }
            end; { routine anchor; statement location unresolved } { 8E00:1B11 }
          local_a := P_Integer(FarBits(piVar4[3], P_Integer(piVar4[2]))); { 8E00:1B92 }
        end; { routine anchor; statement location unresolved } { 8E00:1B11 }
      uVar6 := Allocate($13); { 8E00:1B9E }
      uVar5 := Word((LongWord(local_a) shr $10)); { routine anchor; statement location unresolved } { 8E00:1B11 }
      piVar4 := P_Integer(local_a); { routine anchor; statement location unresolved } { 8E00:1B11 }
      piVar4[2] := Integer(uVar6); { routine anchor; statement location unresolved } { 8E00:1B11 }
      piVar4[3] := Integer((LongWord(uVar6) shr $10)); { routine anchor; statement location unresolved } { 8E00:1B11 }
      piVar1 := P_Integer(FarBits(PackedAlias(g_6DBD), g_6DBB)); { routine anchor; statement location unresolved } { 8E00:1B11 }
      local_a := P_Integer(FarBits(piVar4[3], P_Integer(piVar4[2]))); { 8E00:1BB9 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  PackedAlias(g_6DBD) := Integer((LongWord(piVar1) shr $10)); { routine anchor; statement location unresolved } { 8E00:1B11 }
  g_6DBB := P_Integer(piVar1); { 8E00:1B4B }
  FillChar(MemRef(P_Integer(local_a), Integer((LongWord(local_a) shr $10))), $13, 0); { 8E00:1BCB }
  iVar3 := (Word(bVar2) + (Word(local_10) * $10)); { routine anchor; statement location unresolved } { 8E00:1B11 }
  ov24_0E52(Pack16(ShortInt((Word(iVar3) shr 8)), 1), iVar3, bVar2, Pack16(UNKNOWN_extraout_AH, $28), SelectedChar, g_5D94); { 8E00:1BF7 }
  iVar3 := g_5D94; { routine anchor; statement location unresolved } { 8E00:1B11 }
  uVar5 := Word((LongWord(local_a) shr $10)); { routine anchor; statement location unresolved } { 8E00:1B11 }
  piVar4 := P_Integer(local_a); { routine anchor; statement location unresolved } { 8E00:1B11 }
  (local_a)^ := SelectedChar; { routine anchor; statement location unresolved } { 8E00:1B11 }
  piVar4[1] := iVar3; { routine anchor; statement location unresolved } { 8E00:1B11 }
  (P_Byte((piVar4 + 9)))^ := local_10; { routine anchor; statement location unresolved } { 8E00:1B11 }
  (P_ShortInt((piVar4 + 8)))^ := g_6DB9; { routine anchor; statement location unresolved } { 8E00:1B11 }
  (P_ShortInt((Integer(piVar4) + $11)))^ := g_6DBA; { routine anchor; statement location unresolved } { 8E00:1B11 }
  bVar2 := g_290E; { routine anchor; statement location unresolved } { 8E00:1B11 }
  ov31_04BE(@(bStack_11), SS, auStack_e, SS, (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[g_290E]))), (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[g_290E])))); { routine anchor; statement location unresolved } { 8E00:1B11 }
  if ((bStack_11 = 0) or else (P_Byte(@(g_2744))[(Word(bStack_11) * 4)] = -(1))) then { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      (P_Byte((P_Integer(local_a) + 6)))^ := 0; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  else { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      (P_Byte((P_Integer(local_a) + 6)))^ := 1; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  if (bStack_11 <> $1E) then { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      goto Fragment_1DC1; { routine anchor; statement location unresolved } { 8E00:1B11 }
      Exit; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  iStack_4 := PackedAlias(g_6DBD); { routine anchor; statement location unresolved } { 8E00:1B11 }
  piStack_6 := g_6DBB; { routine anchor; statement location unresolved } { 8E00:1B11 }
  if ((g_6DBB = P_Integer($0)) and then (PackedAlias(g_6DBD) = 0)) then { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      goto Fragment_1DBE; { routine anchor; statement location unresolved } { 8E00:1B11 }
      Exit; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  if ((PackedAlias(g_6DBD) = Slice16(local_a, 2)) and then (g_6DBB = P_Integer(local_a))) then { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      goto Fragment_1DAA; { routine anchor; statement location unresolved } { 8E00:1B11 }
      Exit; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  uStack_f := 1; { routine anchor; statement location unresolved } { 8E00:1B11 }
  if ((((ShortInt(g_6DBB[6]) <> 0) and then ((Integer(ShortInt(g_6DBB[8])) + Integer(ShortInt(P_Byte(@(g_2736))[g_290E]))) = (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[bVar2]))))) and then ((Integer((P_ShortInt((Integer(g_6DBB) + $11)))^) + Integer(ShortInt(P_Byte(@(g_273F))[g_290E]))) = (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[bVar2]))))) and then (ShortInt(g_6DBB[4]) <> 30)) then { routine anchor; statement location unresolved } { 8E00:1B11 }
    begin { routine anchor; statement location unresolved } { 8E00:1B11 }
      bStack_11 := (P_Byte((g_6DBB + 4)))^; { routine anchor; statement location unresolved } { 8E00:1B11 }
    end; { routine anchor; statement location unresolved } { 8E00:1B11 }
  goto Fragment_1CF4; { routine anchor; statement location unresolved } { 8E00:1B11 }
  Exit; { routine anchor; statement location unresolved } { 8E00:1B11 }
end; { routine anchor; statement location unresolved } { 8E00:1B11 }
```

### ov22:1C31 Fragment_1C31 (conf H)

Params (BP stack slots): inherits owning routine BP frame; no independently proven Pascal arguments.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers (export): FUN_8e00_1dc1.  
Callees (export): Fragment_1DAA, Fragment_1DBE, Fragment_1DC1, ov31_04BE.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

Unmatched call-location evidence: FUN_8e00_1cf4, FUN_8e00_1daa, FUN_8e00_1dbe, FUN_8e00_1dc1. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
Fragment_1C31: { 8E00:1C31 }
begin { routine anchor; statement location unresolved } { 8E00:1C31 }
  (P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ := ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ + 1); { routine anchor; statement location unresolved } { 8E00:1C31 }
  (P_Byte((UNKNOWN_unaff_BP + -($12))))^ := P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($11))))^]; { routine anchor; statement location unresolved } { 8E00:1C31 }
  ov31_04BE((UNKNOWN_unaff_BP + -($F)), SS, ((UNKNOWN_unaff_BP + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + -($D)), SS, (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))), (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^])))); { 8E00:1C7D }
  if (((P_ShortInt((UNKNOWN_unaff_BP + -($F))))^ = 0) or else (P_Byte(@(g_2744))[(Word((P_Byte((UNKNOWN_unaff_BP + -($F))))^) * 4)] = -(1))) then { routine anchor; statement location unresolved } { 8E00:1C31 }
    begin { routine anchor; statement location unresolved } { 8E00:1C31 }
      (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(8))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + $B)))^ := 0; { routine anchor; statement location unresolved } { 8E00:1C31 }
    end; { routine anchor; statement location unresolved } { 8E00:1C31 }
  else { routine anchor; statement location unresolved } { 8E00:1C31 }
    begin { routine anchor; statement location unresolved } { 8E00:1C31 }
      (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(8))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + $B)))^ := 1; { routine anchor; statement location unresolved } { 8E00:1C31 }
    end; { routine anchor; statement location unresolved } { 8E00:1C31 }
  uVar1 := PackedAlias(g_6DBD); { routine anchor; statement location unresolved } { 8E00:1C31 }
  if ((P_ShortInt((UNKNOWN_unaff_BP + -($F))))^ <> 30) then { routine anchor; statement location unresolved } { 8E00:1C31 }
    begin { routine anchor; statement location unresolved } { 8E00:1C31 }
      goto Fragment_1DC1; { routine anchor; statement location unresolved } { 8E00:1C31 }
      UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1C31 }
    end; { routine anchor; statement location unresolved } { 8E00:1C31 }
  (P_Word((UNKNOWN_unaff_BP + -(4))))^ := g_6DBB; { routine anchor; statement location unresolved } { 8E00:1C31 }
  (P_Word((UNKNOWN_unaff_BP + -(2))))^ := uVar1; { routine anchor; statement location unresolved } { 8E00:1C31 }
  while true do { routine anchor; statement location unresolved } { 8E00:1C31 }
    begin { routine anchor; statement location unresolved } { 8E00:1C31 }
      if (((P_Integer((UNKNOWN_unaff_BP + -(4))))^ = 0) and then ((P_Integer((UNKNOWN_unaff_BP + -(2))))^ = 0)) then { routine anchor; statement location unresolved } { 8E00:1C31 }
        begin { routine anchor; statement location unresolved } { 8E00:1C31 }
          goto Fragment_1DBE; { routine anchor; statement location unresolved } { 8E00:1C31 }
          UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1C31 }
        end; { routine anchor; statement location unresolved } { 8E00:1C31 }
      if (((P_Integer((UNKNOWN_unaff_BP + -(2))))^ = (P_Integer((UNKNOWN_unaff_BP + -(6))))^) and then ((P_Integer((UNKNOWN_unaff_BP + -(4))))^ = (P_Integer((UNKNOWN_unaff_BP + -(8))))^)) then { routine anchor; statement location unresolved } { 8E00:1C31 }
        Break; { routine anchor; statement location unresolved } { 8E00:1C31 }
      (P_Byte((UNKNOWN_unaff_BP + -($D))))^ := 1; { routine anchor; statement location unresolved } { 8E00:1C31 }
      if (((((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + $B)))^ <> 0) and then ((Integer((P_ShortInt((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + $10)))^) + Integer(ShortInt(P_Byte(@(g_2736))[Byte(P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($D))))^])]))) = (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) and then ((Integer((P_ShortInt((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + $11)))^) + Integer(ShortInt(P_Byte(@(g_273F))[Byte(P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($D))))^])]))) = (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) and then ((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + 7)))^ <> 30)) then { routine anchor; statement location unresolved } { 8E00:1C31 }
        begin { routine anchor; statement location unresolved } { 8E00:1C31 }
          (P_Byte((UNKNOWN_unaff_BP + -($F))))^ := (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + 7)))^; { routine anchor; statement location unresolved } { 8E00:1C31 }
        end; { routine anchor; statement location unresolved } { 8E00:1C31 }
      if ((P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ <> 4) then { routine anchor; statement location unresolved } { 8E00:1C31 }
        begin { routine anchor; statement location unresolved } { 8E00:1C31 }
          goto Fragment_1CF4; { routine anchor; statement location unresolved } { 8E00:1C31 }
          UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1C31 }
        end; { routine anchor; statement location unresolved } { 8E00:1C31 }
      uVar3 := Word((LongWord((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) shr $10)); { routine anchor; statement location unresolved } { 8E00:1C31 }
      iVar2 := Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^); { routine anchor; statement location unresolved } { 8E00:1C31 }
      uVar1 := (P_Word((iVar2 + 6)))^; { routine anchor; statement location unresolved } { 8E00:1C31 }
      (P_Word((UNKNOWN_unaff_BP + -(4))))^ := (P_Word((iVar2 + 4)))^; { routine anchor; statement location unresolved } { 8E00:1C31 }
      (P_Word((UNKNOWN_unaff_BP + -(2))))^ := uVar1; { routine anchor; statement location unresolved } { 8E00:1C31 }
    end; { routine anchor; statement location unresolved } { 8E00:1C31 }
  goto Fragment_1DAA; { routine anchor; statement location unresolved } { 8E00:1C31 }
  UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1C31 }
end; { routine anchor; statement location unresolved } { 8E00:1C31 }
```

### ov22:1CF4 Fragment_1CF4 (conf H)

Params (BP stack slots): inherits owning routine BP frame; no independently proven Pascal arguments.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers (export): FUN_8e00_1d70.  
Callees (export): none recorded.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

Unmatched call-location evidence: FUN_8e00_1cf4, FUN_8e00_1daa, FUN_8e00_1dbe. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
Fragment_1CF4: { 8E00:1CF4 }
begin { routine anchor; statement location unresolved } { 8E00:1CF4 }
  (P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ := ((P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ + 1); { routine anchor; statement location unresolved } { 8E00:1CF4 }
  while true do { routine anchor; statement location unresolved } { 8E00:1CF4 }
    begin { routine anchor; statement location unresolved } { 8E00:1CF4 }
      if (((((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + $B)))^ <> 0) and then ((Integer((P_ShortInt((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + $10)))^) + Integer(ShortInt(P_Byte(@(g_2736))[Byte(P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($D))))^])]))) = (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) and then ((Integer((P_ShortInt((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + $11)))^) + Integer(ShortInt(P_Byte(@(g_273F))[Byte(P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($D))))^])]))) = (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) and then ((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + 7)))^ <> 30)) then { routine anchor; statement location unresolved } { 8E00:1CF4 }
        begin { routine anchor; statement location unresolved } { 8E00:1CF4 }
          (P_Byte((UNKNOWN_unaff_BP + -($F))))^ := (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + 7)))^; { routine anchor; statement location unresolved } { 8E00:1CF4 }
        end; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      if ((P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ <> 4) then { routine anchor; statement location unresolved } { 8E00:1CF4 }
        begin { routine anchor; statement location unresolved } { 8E00:1CF4 }
          goto Fragment_1CF4; { routine anchor; statement location unresolved } { 8E00:1CF4 }
          UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1CF4 }
        end; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      uVar3 := Word((LongWord((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) shr $10)); { routine anchor; statement location unresolved } { 8E00:1CF4 }
      iVar2 := Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^); { routine anchor; statement location unresolved } { 8E00:1CF4 }
      uVar1 := (P_Word((iVar2 + 6)))^; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      (P_Word((UNKNOWN_unaff_BP + -(4))))^ := (P_Word((iVar2 + 4)))^; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      (P_Word((UNKNOWN_unaff_BP + -(2))))^ := uVar1; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      if (((P_Integer((UNKNOWN_unaff_BP + -(4))))^ = 0) and then ((P_Integer((UNKNOWN_unaff_BP + -(2))))^ = 0)) then { routine anchor; statement location unresolved } { 8E00:1CF4 }
        begin { routine anchor; statement location unresolved } { 8E00:1CF4 }
          goto Fragment_1DBE; { routine anchor; statement location unresolved } { 8E00:1CF4 }
          UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1CF4 }
        end; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      if (((P_Integer((UNKNOWN_unaff_BP + -(2))))^ = (P_Integer((UNKNOWN_unaff_BP + -(6))))^) and then ((P_Integer((UNKNOWN_unaff_BP + -(4))))^ = (P_Integer((UNKNOWN_unaff_BP + -(8))))^)) then { routine anchor; statement location unresolved } { 8E00:1CF4 }
        Break; { routine anchor; statement location unresolved } { 8E00:1CF4 }
      (P_Byte((UNKNOWN_unaff_BP + -($D))))^ := 1; { routine anchor; statement location unresolved } { 8E00:1CF4 }
    end; { routine anchor; statement location unresolved } { 8E00:1CF4 }
  goto Fragment_1DAA; { routine anchor; statement location unresolved } { 8E00:1CF4 }
  UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1CF4 }
end; { routine anchor; statement location unresolved } { 8E00:1CF4 }
```

### ov22:1D70 InvalidCandidate_1D70 (conf H)

Params (BP stack slots): none proven.  
Locals: none; rejected overlapping decode.  
Callers (export): none recorded.  
Callees (export): Fragment_1CF4.

Invalid export candidate: D0 is the second byte of MOV DX,AX (8B D0) at 1D6F. Its decoded ROL/dataflow is rejected as game logic; real control continues at 1D71.

Unmatched call-location evidence: FUN_8e00_1cf4, FUN_8e00_1daa, FUN_8e00_1dbe. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
label InvalidCandidate_1D70; { 8E00:1D70 }
begin { 8E00:1D70 }
  UNKNOWN_EntryInsideMOV_1D6F; { 8E00:1D70 }
end; { 8E00:1D70 }
```

### ov22:1DAA Fragment_1DAA (conf H)

Params (BP stack slots): inherits owning routine BP frame; no independently proven Pascal arguments.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers (export): FUN_8e00_1c31.  
Callees (export): none recorded.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

Unmatched call-location evidence: FUN_8e00_1cf4, FUN_8e00_1daa, FUN_8e00_1dbe. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
Fragment_1DAA: { 8E00:1DAA }
begin { routine anchor; statement location unresolved } { 8E00:1DAA }
  while true do { routine anchor; statement location unresolved } { 8E00:1DAA }
    begin { routine anchor; statement location unresolved } { 8E00:1DAA }
      uVar3 := Word((LongWord((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) shr $10)); { routine anchor; statement location unresolved } { 8E00:1DAA }
      iVar2 := Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^); { routine anchor; statement location unresolved } { 8E00:1DAA }
      uVar1 := (P_Word((iVar2 + 6)))^; { routine anchor; statement location unresolved } { 8E00:1DAA }
      (P_Word((UNKNOWN_unaff_BP + -(4))))^ := (P_Word((iVar2 + 4)))^; { routine anchor; statement location unresolved } { 8E00:1DAA }
      (P_Word((UNKNOWN_unaff_BP + -(2))))^ := uVar1; { routine anchor; statement location unresolved } { 8E00:1DAA }
      if (((P_Integer((UNKNOWN_unaff_BP + -(4))))^ = 0) and then ((P_Integer((UNKNOWN_unaff_BP + -(2))))^ = 0)) then { routine anchor; statement location unresolved } { 8E00:1DAA }
        begin { routine anchor; statement location unresolved } { 8E00:1DAA }
          goto Fragment_1DBE; { routine anchor; statement location unresolved } { 8E00:1DAA }
          UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DAA }
        end; { routine anchor; statement location unresolved } { 8E00:1DAA }
      if (((P_Integer((UNKNOWN_unaff_BP + -(2))))^ = (P_Integer((UNKNOWN_unaff_BP + -(6))))^) and then ((P_Integer((UNKNOWN_unaff_BP + -(4))))^ = (P_Integer((UNKNOWN_unaff_BP + -(8))))^)) then { routine anchor; statement location unresolved } { 8E00:1DAA }
        Break; { routine anchor; statement location unresolved } { 8E00:1DAA }
      (P_Byte((UNKNOWN_unaff_BP + -($D))))^ := 1; { routine anchor; statement location unresolved } { 8E00:1DAA }
      if (((((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + $B)))^ <> 0) and then ((Integer((P_ShortInt((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + $10)))^) + Integer(ShortInt(P_Byte(@(g_2736))[Byte(P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($D))))^])]))) = (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) and then ((Integer((P_ShortInt((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + $11)))^) + Integer(ShortInt(P_Byte(@(g_273F))[Byte(P_Byte(@(g_290D))[(P_Byte((UNKNOWN_unaff_BP + -($D))))^])]))) = (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) and then ((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + 7)))^ <> 30)) then { routine anchor; statement location unresolved } { 8E00:1DAA }
        begin { routine anchor; statement location unresolved } { 8E00:1DAA }
          (P_Byte((UNKNOWN_unaff_BP + -($F))))^ := (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(4))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^)) + 7)))^; { routine anchor; statement location unresolved } { 8E00:1DAA }
        end; { routine anchor; statement location unresolved } { 8E00:1DAA }
      if ((P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ <> 4) then { routine anchor; statement location unresolved } { 8E00:1DAA }
        begin { routine anchor; statement location unresolved } { 8E00:1DAA }
          goto Fragment_1CF4; { routine anchor; statement location unresolved } { 8E00:1DAA }
          UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DAA }
        end; { routine anchor; statement location unresolved } { 8E00:1DAA }
    end; { routine anchor; statement location unresolved } { 8E00:1DAA }
  goto Fragment_1DAA; { routine anchor; statement location unresolved } { 8E00:1DAA }
  UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DAA }
end; { routine anchor; statement location unresolved } { 8E00:1DAA }
```

### ov22:1DBE Fragment_1DBE (conf H)

Params (BP stack slots): inherits owning routine BP frame; no independently proven Pascal arguments.  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot].  
Callers (export): FUN_8e00_1c31.  
Callees (export): none recorded.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

Unmatched call-location evidence: FUN_00ba_16ec, FUN_00ba_17e3, FUN_0709_0dbe, FUN_8e00_1c31, System__StrCopy, stub_ov24_e4, stub_ov31_e10. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
Fragment_1DBE: { 8E00:1DBE }
begin { routine anchor; statement location unresolved } { 8E00:1DBE }
  (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(8))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + 7)))^ := (P_Byte((UNKNOWN_unaff_BP + -($F))))^; { routine anchor; statement location unresolved } { 8E00:1DBE }
  if ((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(8))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + $B)))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:1DBE }
    begin { routine anchor; statement location unresolved } { 8E00:1DBE }
      (P_Byte(((((Integer(g_6716) + ((Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))) * $32)) + Integer(g_6DB9)) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))) + 7)))^ := $1E; { routine anchor; statement location unresolved } { 8E00:1DBE }
    end; { routine anchor; statement location unresolved } { 8E00:1DBE }
  if ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ <> 4) then { routine anchor; statement location unresolved } { 8E00:1DBE }
    begin { routine anchor; statement location unresolved } { 8E00:1DBE }
      goto Fragment_1C31; { routine anchor; statement location unresolved } { 8E00:1DBE }
      UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DBE }
    end; { routine anchor; statement location unresolved } { 8E00:1DBE }
  iVar1 := (UNKNOWN_unaff_BP + -($2A)); { routine anchor; statement location unresolved } { 8E00:1DBE }
  uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:1DBE }
  uVar3 := SelectedChar; { routine anchor; statement location unresolved } { 8E00:1DBE }
  uVar4 := g_5D94; { routine anchor; statement location unresolved } { 8E00:1DBE }
  UNKNOWN_StringDestination := PString($1AF9, $8E00); { routine anchor; statement location unresolved } { 8E00:1DBE }
  FUN_00ba_16ec((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 10), iVar1, uVar2, uVar3, uVar4); { routine anchor; statement location unresolved } { 8E00:1DBE }
  ov31_0996(Pack16(UNKNOWN_extraout_AH_00, 8), Pack16(UNKNOWN_extraout_AH_00, $FF), Pack16(UNKNOWN_extraout_AH_00, g_6DBA), Pack16(UNKNOWN_extraout_AH_00, g_6DB9)); { routine anchor; statement location unresolved } { 8E00:1DBE }
  FUN_0709_0dbe(); { routine anchor; statement location unresolved } { 8E00:1DBE }
  FUN_00ba_17e3(); { routine anchor; statement location unresolved } { 8E00:1DBE }
  (P_Byte((UNKNOWN_unaff_BP + -($11))))^ := 1; { routine anchor; statement location unresolved } { 8E00:1DBE }
  while true do { routine anchor; statement location unresolved } { 8E00:1DBE }
    begin { routine anchor; statement location unresolved } { 8E00:1DBE }
      if ((P_ShortInt(((UNKNOWN_unaff_BP + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + -($D))))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:1DBE }
        begin { routine anchor; statement location unresolved } { 8E00:1DBE }
          iVar1 := (Word((P_Byte(((UNKNOWN_unaff_BP + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + -($D))))^) * 4); { routine anchor; statement location unresolved } { 8E00:1DBE }
          ov24_0AE7((P_Word((P_Byte(@(g_65B9)) + iVar1)))^, (P_Word((P_Byte(@(g_65BB)) + iVar1)))^); { routine anchor; statement location unresolved } { 8E00:1DBE }
        end; { routine anchor; statement location unresolved } { 8E00:1DBE }
      if ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ = 4) then { routine anchor; statement location unresolved } { 8E00:1DBE }
        Break; { routine anchor; statement location unresolved } { 8E00:1DBE }
      (P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ := ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ + 1); { routine anchor; statement location unresolved } { 8E00:1DBE }
    end; { routine anchor; statement location unresolved } { 8E00:1DBE }
  UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DBE }
end; { routine anchor; statement location unresolved } { 8E00:1DBE }
```

### ov22:1DC1 Fragment_1DC1 (conf H)

Params (BP stack slots): inherits owning routine BP frame; no independently proven Pascal arguments.  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot].  
Callers (export): FUN_8e00_1c31.  
Callees (export): FUN_00ba_16ec, FUN_00ba_17e3, FUN_0709_0dbe, Fragment_1C31, System.@StrCopy, ov24_0AE7, ov31_0996.

Frameless exported block in a larger source routine; code below uses the inherited BP frame. Ghidra calls/returns across these blocks are analysis artifacts; resolve the actual JMP/fallthrough edges before translation.

Unmatched call-location evidence: FUN_8e00_1c31. These retain routine anchors; branch-only/shared-block edges are not assumed to be native calls.

```pascal
Fragment_1DC1: { 8E00:1DC1 }
begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
  if (((P_ShortInt((UNKNOWN_unaff_BP + -($F))))^ = 31) and then Sequence(((P_Byte((UNKNOWN_unaff_BP + -($13))))^ := g_6715); ((P_ShortInt((UNKNOWN_unaff_BP + -($13))))^ <> 0))) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
    begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
      (P_Byte((UNKNOWN_unaff_BP + -($D))))^ := 1; { routine anchor; statement location unresolved } { 8E00:1DC1 }
      while true do { routine anchor; statement location unresolved } { 8E00:1DC1 }
        begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
          if ((Integer(ShortInt(P_Byte(@(g_66DA))[(Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^) * 7)])) = (Integer(g_6DB9) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^])))) and then (Integer(ShortInt(P_Byte(@(g_66DB))[(Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^) * 7)])) = (Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))))) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
            begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
              (P_Byte((UNKNOWN_unaff_BP + -($F))))^ := P_Byte(@(g_66DC))[(Word((P_Byte((UNKNOWN_unaff_BP + -($D))))^) * 7)]; { routine anchor; statement location unresolved } { 8E00:1DC1 }
            end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
          if ((P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ = (P_ShortInt((UNKNOWN_unaff_BP + -($13))))^) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
            Break; { routine anchor; statement location unresolved } { 8E00:1DC1 }
          (P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ := ((P_ShortInt((UNKNOWN_unaff_BP + -($D))))^ + 1); { routine anchor; statement location unresolved } { 8E00:1DC1 }
        end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
    end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
  (P_Byte(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(8))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + 7)))^ := (P_Byte((UNKNOWN_unaff_BP + -($F))))^; { routine anchor; statement location unresolved } { 8E00:1DC1 }
  if ((P_ShortInt(((Integer((P_LongWord((UNKNOWN_unaff_BP + -(8))))^) + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + $B)))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
    begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
      (P_Byte(((((Integer(g_6716) + ((Integer(g_6DBA) + Integer(ShortInt(P_Byte(@(g_273F))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))) * $32)) + Integer(g_6DB9)) + Integer(ShortInt(P_Byte(@(g_2736))[(P_Byte((UNKNOWN_unaff_BP + -($12))))^]))) + 7)))^ := $1E; { routine anchor; statement location unresolved } { 8E00:1DC1 }
    end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
  if ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ = 4) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
    begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
      iVar1 := (UNKNOWN_unaff_BP + -($2A)); { routine anchor; statement location unresolved } { 8E00:1DC1 }
      uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:1DC1 }
      uVar3 := SelectedChar; { routine anchor; statement location unresolved } { 8E00:1DC1 }
      uVar4 := g_5D94; { routine anchor; statement location unresolved } { 8E00:1DC1 }
      PString(BP-42, SS) := 'Creates a noxious cloud'; { 8E00:1EC9 }
      FUN_00ba_16ec((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 10), iVar1, uVar2, uVar3, uVar4); { 8E00:1ED4 }
      ov31_0996(Pack16(UNKNOWN_extraout_AH_00, 8), Pack16(UNKNOWN_extraout_AH_00, $FF), Pack16(UNKNOWN_extraout_AH_00, g_6DBA), Pack16(UNKNOWN_extraout_AH_00, g_6DB9)); { 8E00:1EE7 }
      FUN_0709_0dbe(); { 8E00:1EEC }
      FUN_00ba_17e3(); { 8E00:1EF1 }
      (P_Byte((UNKNOWN_unaff_BP + -($11))))^ := 1; { routine anchor; statement location unresolved } { 8E00:1DC1 }
      while true do { routine anchor; statement location unresolved } { 8E00:1DC1 }
        begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
          if ((P_ShortInt(((UNKNOWN_unaff_BP + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + -($D))))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
            begin { routine anchor; statement location unresolved } { 8E00:1DC1 }
              iVar1 := (Word((P_Byte(((UNKNOWN_unaff_BP + Word((P_Byte((UNKNOWN_unaff_BP + -($11))))^)) + -($D))))^) * 4); { routine anchor; statement location unresolved } { 8E00:1DC1 }
              ov24_0AE7((P_Word((P_Byte(@(g_65B9)) + iVar1)))^, (P_Word((P_Byte(@(g_65BB)) + iVar1)))^); { 8E00:1F26 }
            end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
          if ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ = 4) then { routine anchor; statement location unresolved } { 8E00:1DC1 }
            Break; { routine anchor; statement location unresolved } { 8E00:1DC1 }
          (P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ := ((P_ShortInt((UNKNOWN_unaff_BP + -($11))))^ + 1); { routine anchor; statement location unresolved } { 8E00:1DC1 }
        end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
      UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DC1 }
    end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
  goto Fragment_1C31; { routine anchor; statement location unresolved } { 8E00:1DC1 }
  UNKNOWN_AnalysisBlockExit; { routine anchor; statement location unresolved } { 8E00:1DC1 }
end; { routine anchor; statement location unresolved } { 8E00:1DC1 }
```

### ov22:1F41 StrengthEffect (conf H)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_16: array[0..11] of Byte [BP-$14]; local_a: Byte [BP-$8]; local_9: Byte [BP-$7]; local_8: Byte [BP-$6]; local_7: Byte [BP-$5]; local_6: Integer [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, SpellDuration, Roll, System.@StrCopy, ov24_0E52, ov24_115C.

```pascal
procedure StrengthEffect(); { 8E00:1F41 }
begin { routine anchor; statement location unresolved } { 8E00:1F41 }
  local_7 := 0; { 8E00:1F47 }
  local_6 := g_6C95; { 8E00:1F52 }
  local_6 := g_6C95; { routine anchor; statement location unresolved } { 8E00:1F41 }
  uStack_4 := g_6C97; { 8E00:1F55 }
  if (0 < (P_ShortInt((g_6C95 + $9B)))^) then { routine anchor; statement location unresolved } { 8E00:1F41 }
    begin { routine anchor; statement location unresolved } { 8E00:1F41 }
      uVar5 := Byte((Word(g_6C95) shr 8)); { routine anchor; statement location unresolved } { 8E00:1F41 }
      local_8 := Roll(Pack16(uVar5, 4), Pack16(uVar5, 1)); { 8E00:1F69 }
    end; { routine anchor; statement location unresolved } { 8E00:1F41 }
  if ((0 < (P_ShortInt((local_6 + $96)))^) or else (0 < (P_ShortInt((local_6 + $9C)))^)) then { routine anchor; statement location unresolved } { 8E00:1F41 }
    begin { routine anchor; statement location unresolved } { 8E00:1F41 }
      local_8 := Roll(6, 1); { 8E00:1F8D }
    end; { routine anchor; statement location unresolved } { 8E00:1F41 }
  if (0 < (P_ShortInt((local_6 + $98)))^) then { routine anchor; statement location unresolved } { 8E00:1F41 }
    begin { routine anchor; statement location unresolved } { 8E00:1F41 }
      local_8 := Roll(8, 1); { 8E00:1FA6 }
    end; { routine anchor; statement location unresolved } { 8E00:1F41 }
  uVar2 := (Word((P_Byte((local_6 + $10)))^) + Word(local_8)); { routine anchor; statement location unresolved } { 8E00:1F41 }
  local_9 := Byte(uVar2); { 8E00:1FC0 }
  if ($12 < local_9) then { routine anchor; statement location unresolved } { 8E00:1F41 }
    begin { routine anchor; statement location unresolved } { 8E00:1F41 }
      if ((P_ShortInt((local_6 + $98)))^ < 1) then { routine anchor; statement location unresolved } { 8E00:1F41 }
        begin { routine anchor; statement location unresolved } { 8E00:1F41 }
          local_9 := $12; { 8E00:1FFB }
        end; { routine anchor; statement location unresolved } { 8E00:1F41 }
      else { routine anchor; statement location unresolved } { 8E00:1F41 }
        begin { routine anchor; statement location unresolved } { 8E00:1F41 }
          uVar2 := (Word((P_Byte((local_6 + $16)))^) + (((uVar2 and $FF) - $12) * 10)); { routine anchor; statement location unresolved } { 8E00:1F41 }
          local_7 := Byte(uVar2); { 8E00:1FEE }
          if (100 < local_7) then { routine anchor; statement location unresolved } { 8E00:1F41 }
            begin { routine anchor; statement location unresolved } { 8E00:1F41 }
              local_7 := 100; { 8E00:1FF7 }
            end; { routine anchor; statement location unresolved } { 8E00:1F41 }
          local_9 := $12; { 8E00:2001 }
        end; { routine anchor; statement location unresolved } { 8E00:1F41 }
    end; { routine anchor; statement location unresolved } { 8E00:1F41 }
  uVar5 := Byte((uVar2 shr 8)); { routine anchor; statement location unresolved } { 8E00:1F41 }
  cVar1 := ov24_115C(@(local_a), SS, Pack16(uVar5, local_7), Pack16(uVar5, local_9), local_6, uStack_4); { 8E00:2018 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:1F41 }
    begin { routine anchor; statement location unresolved } { 8E00:1F41 }
      puVar6 := local_16; { routine anchor; statement location unresolved } { 8E00:1F41 }
      iVar7 := local_6; { routine anchor; statement location unresolved } { 8E00:1F41 }
      uVar8 := uStack_4; { routine anchor; statement location unresolved } { 8E00:1F41 }
      PString(local_16, SS) := 'is stronger'; { 8E00:2031 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar6, SS, iVar7, uVar8); { 8E00:203C }
    end; { routine anchor; statement location unresolved } { 8E00:1F41 }
  uVar3 := $26; { routine anchor; statement location unresolved } { 8E00:1F41 }
  iVar7 := local_6; { routine anchor; statement location unresolved } { 8E00:1F41 }
  uVar8 := uStack_4; { routine anchor; statement location unresolved } { 8E00:1F41 }
  uVar4 := SpellDuration(g_681B); { 8E00:204F }
  ov24_0E52(1, local_a, uVar4, uVar3, iVar7, uVar8); { 8E00:205A }
  Exit; { 8E00:2062 }
end; { routine anchor; statement location unresolved } { 8E00:1F41 }
```

### ov22:206F AnimateDeadEffect (conf H)

Params (BP stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; iVar12: Integer [compiler temporary; no proven BP slot]; local_15: array[0..11] of Byte [BP-$13]; local_9: Integer [BP-$7]; iStack_7: Integer [BP-$5]; local_5: ShortInt [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, System.@StrCopy, ov24_1656, ov24_1869, ov31_0BE7, ov31_0C0F, ov31_10A7.

```pascal
procedure AnimateDeadEffect(); { 8E00:206F }
begin { routine anchor; statement location unresolved } { 8E00:206F }
  g_6820 := 1; { 8E00:2075 }
  local_5 := FUN_00ba_26c2(g_681B); { 8E00:207E }
  g_6C94 := 0; { 8E00:2086 }
  local_9 := PartyHead; { 8E00:2092 }
  iStack_7 := g_5D98; { 8E00:2095 }
  while ((local_9 <> 0) or else ((iStack_7 <> 0) and then (local_5 <> 0))) do { routine anchor; statement location unresolved } { 8E00:206F }
    begin { routine anchor; statement location unresolved } { 8E00:206F }
      if (((P_ShortInt((local_9 + $10C)))^ = 6) and then ((P_ShortInt((local_9 + $9F)))^ = 0)) then { routine anchor; statement location unresolved } { 8E00:206F }
        begin { routine anchor; statement location unresolved } { 8E00:206F }
          iVar6 := local_9; { routine anchor; statement location unresolved } { 8E00:206F }
          iVar12 := iStack_7; { routine anchor; statement location unresolved } { 8E00:206F }
          uVar3 := ov31_0BE7(local_9, iStack_7); { 8E00:20D4 }
          uVar4 := ov31_0C0F(local_9, iStack_7); { 8E00:20E0 }
          cVar2 := ov31_10A7(1, uVar4, uVar3, iVar6, iVar12); { 8E00:20E9 }
          if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 8E00:206F }
            begin { routine anchor; statement location unresolved } { 8E00:206F }
              cVar2 := FUN_00ba_26c2(g_681B); { 8E00:20F9 }
              local_4 := (((P_ShortInt((local_9 + $10E)))^ * 16) + cVar2); { 8E00:2111 }
              (P_Byte((local_9 + $10E)))^ := (P_Byte((Integer(_SelectedChar) + $10E)))^; { routine anchor; statement location unresolved } { 8E00:206F }
              (P_Byte((local_9 + $10F)))^ := 1; { routine anchor; statement location unresolved } { 8E00:206F }
              (P_Byte((local_9 + $76)))^ := 2; { routine anchor; statement location unresolved } { 8E00:206F }
              (P_Byte((local_9 + $6B)))^ := 0; { routine anchor; statement location unresolved } { 8E00:206F }
              (P_Byte((local_9 + $72)))^ := 6; { routine anchor; statement location unresolved } { 8E00:206F }
              local_3 := 0; { 8E00:2146 }
              while Sequence(((P_Byte(((local_9 + Word(local_3)) + $17)))^ := 0); (local_3 <> $14)) do { routine anchor; statement location unresolved } { 8E00:206F }
              begin { routine anchor; statement location unresolved } { 8E00:206F }
                begin { routine anchor; statement location unresolved } { 8E00:206F }
                end; { routine anchor; statement location unresolved } { 8E00:206F }
                local_3 := (local_3 + 1); { 8E00:214C }
              end; { routine anchor; statement location unresolved } { 8E00:206F }
              if ((P_Byte((local_9 + $84)))^ < $80) then { routine anchor; statement location unresolved } { 8E00:206F }
                begin { routine anchor; statement location unresolved } { 8E00:206F }
                  (P_Byte((local_9 + $84)))^ := $B3; { routine anchor; statement location unresolved } { 8E00:206F }
                end; { routine anchor; statement location unresolved } { 8E00:206F }
              else { routine anchor; statement location unresolved } { 8E00:206F }
                begin { routine anchor; statement location unresolved } { 8E00:206F }
                  (P_Byte((local_9 + $84)))^ := $B2; { routine anchor; statement location unresolved } { 8E00:206F }
                end; { routine anchor; statement location unresolved } { 8E00:206F }
              (P_Byte((local_9 + $9F)))^ := 4; { routine anchor; statement location unresolved } { 8E00:206F }
              if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 8E00:206F }
                begin { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar3 := Word((LongWord((P_LongWord((local_9 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 8E00:206F }
                  iVar6 := Integer((P_LongWord((local_9 + $108)))^); { routine anchor; statement location unresolved } { 8E00:206F }
                  (P_Word((iVar6 + 10)))^ := 0; { routine anchor; statement location unresolved } { 8E00:206F }
                  (P_Word((iVar6 + $C)))^ := 0; { routine anchor; statement location unresolved } { 8E00:206F }
                end; { routine anchor; statement location unresolved } { 8E00:206F }
              local_5 := (local_5 + -(1)); { 8E00:21A5 }
              cVar2 := ov24_1869((P_Byte((local_9 + $32)))^, local_9, iStack_7); { 8E00:21B6 }
              if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 8E00:206F }
                begin { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar4 := $20; { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar11 := 0; { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar5 := Word(local_4); { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar10 := 1; { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar9 := 0; { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar8 := 0; { routine anchor; statement location unresolved } { 8E00:206F }
                  puVar7 := local_15; { routine anchor; statement location unresolved } { 8E00:206F }
                  uVar3 := SS; { routine anchor; statement location unresolved } { 8E00:206F }
                  iVar6 := local_9; { routine anchor; statement location unresolved } { 8E00:206F }
                  iVar12 := iStack_7; { routine anchor; statement location unresolved } { 8E00:206F }
                  PString(local_15, SS) := 'is animated'; { 8E00:21E2 }
                  ov24_1656(puVar7, uVar3, uVar8, uVar9, uVar10, uVar5, uVar11, uVar4, iVar6, iVar12); { 8E00:21E7 }
                  (P_Byte((local_9 + $10C)))^ := 1; { routine anchor; statement location unresolved } { 8E00:206F }
                end; { routine anchor; statement location unresolved } { 8E00:206F }
            end; { routine anchor; statement location unresolved } { 8E00:206F }
        end; { routine anchor; statement location unresolved } { 8E00:206F }
      piVar1 := P_Integer((local_9 + $104)); { routine anchor; statement location unresolved } { 8E00:206F }
      iStack_7 := (P_Integer((local_9 + $106)))^; { 8E00:2205 }
      local_9 := (piVar1)^; { 8E00:2202 }
    end; { routine anchor; statement location unresolved } { 8E00:206F }
  Exit; { 8E00:220E }
end; { routine anchor; statement location unresolved } { 8E00:206F }
```

### ov22:2217 CureBlindnessEffect (conf H)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_a: array[0..7] of Byte [BP-$8].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_1feb, System.@StrCopy, ov24_1081.

```pascal
procedure CureBlindnessEffect(); { 8E00:2217 }
begin { routine anchor; statement location unresolved } { 8E00:2217 }
  cVar1 := ov24_1081($21, g_6C95, g_6C97); { 8E00:2228 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:2217 }
    begin { routine anchor; statement location unresolved } { 8E00:2217 }
      uVar2 := 1; { routine anchor; statement location unresolved } { 8E00:2217 }
      puVar3 := local_a; { routine anchor; statement location unresolved } { 8E00:2217 }
      uVar4 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2217 }
      uVar5 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2217 }
      PString(local_a, SS) := 'can see'; { 8E00:2246 }
      FUN_00ba_1feb(puVar3, SS, uVar2, uVar4, uVar5); { 8E00:224B }
    end; { routine anchor; statement location unresolved } { 8E00:2217 }
  Exit; { 8E00:2253 }
end; { routine anchor; statement location unresolved } { 8E00:2217 }
```

### ov22:225D CauseBlindnessEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure CauseBlindnessEffect; { 8E00:225D }
begin { 8E00:225D }
  ApplySpellToTargets('is blind', 0, 0, 0, 0, g_681B); { 8E00:2283 }
end; { 8E00:2289 }
```

### ov22:228A FUN_8e00_228a (conf L)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; local_3: Boolean [BP-$1].  
Callers (export): ov22_232F,ov22_2E4D.  
Callees (export): ov24_0026, ov24_1081.

```pascal
function FUN_8e00_228a(): Boolean; { 8E00:228A }
begin { routine anchor; statement location unresolved } { 8E00:228A }
  g_681F := 1; { 8E00:2294 }
  cVar1 := ov24_1081($22, g_6C95, g_6C97); { 8E00:22A4 }
  cVar2 := ov24_1081($2B, g_6C95, g_6C97); { 8E00:22BC }
  if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 8E00:228A }
    begin { routine anchor; statement location unresolved } { 8E00:228A }
      ov24_0026(0, 0, $2C, g_6C95, g_6C97); { 8E00:22DA }
      ov24_0026(0, 0, Pack16(UNKNOWN_extraout_AH, $1F), g_6C95, g_6C97); { 8E00:22F0 }
    end; { routine anchor; statement location unresolved } { 8E00:228A }
  local_3 := ((cVar2 <> 0) or else (cVar1 <> 0)); { 8E00:2290 }
  cVar1 := ov24_1081($32, g_6C95, g_6C97); { 8E00:2300 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:228A }
    begin { routine anchor; statement location unresolved } { 8E00:228A }
      local_3 := true; { 8E00:22AD }
      ov24_0026(0, 0, $39, g_6C95, g_6C97); { 8E00:231E }
    end; { routine anchor; statement location unresolved } { 8E00:228A }
  g_681F := 0; { 8E00:2323 }
  Exit(local_3); { 8E00:232E }
end; { routine anchor; statement location unresolved } { 8E00:228A }
```

### ov22:232F CureDiseaseEffect (conf H)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): FUN_8e00_228a.

```pascal
procedure CureDiseaseEffect(); { 8E00:232F }
begin { routine anchor; statement location unresolved } { 8E00:232F }
  FUN_8e00_228a(); { 8E00:2336 }
  Exit; { 8E00:233F }
end; { routine anchor; statement location unresolved } { 8E00:232F }
```

### ov22:234C CauseDiseaseEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure CauseDiseaseEffect; { 8E00:234C }
begin { 8E00:234C }
  ApplySpellToTargets('is diseased', 0, 0, 1, 0, g_681B); { 8E00:2372 }
end; { 8E00:2378 }
```

### ov22:2385 DispelMagicEffect (conf H)

Params (BP stack slots): none.  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; local_1e: array[0..11] of Byte [BP-$1C]; local_12: ShortInt [BP-$10]; local_11: P_Byte [BP-$F]; local_f: Word [BP-$D]; local_d: LongWord [BP-$B]; local_9: ShortInt [BP-$7]; local_8: Integer [BP-$6]; uStack_6: Word [BP-$4]; local_4: Byte [BP-$2]; local_3: ShortInt [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_1feb, FUN_00ba_26c2, Roll, System.@StrCopy, ov24_0026.

```pascal
procedure DispelMagicEffect(); { 8E00:2385 }
begin { routine anchor; statement location unresolved } { 8E00:2385 }
  g_6820 := 1; { 8E00:238B }
  uVar5 := $BA; { routine anchor; statement location unresolved } { 8E00:2385 }
  local_4 := FUN_00ba_26c2(g_681B); { 8E00:2394 }
  local_12 := g_6C94; { 8E00:239F }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:2385 }
    begin { routine anchor; statement location unresolved } { 8E00:2385 }
      local_3 := 1; { 8E00:23AC }
      while true do { routine anchor; statement location unresolved } { 8E00:2385 }
        begin { routine anchor; statement location unresolved } { 8E00:2385 }
          local_9 := 0; { 8E00:23B4 }
          local_8 := g_6C95; { 8E00:23BF }
          uStack_6 := g_6C97; { 8E00:23C2 }
          local_d := P_Byte(FarBits((P_Word((g_6C95 + $81)))^, P_Byte((P_Word((g_6C95 + $7F)))^))); { 8E00:23D1 }
          while true do { routine anchor; statement location unresolved } { 8E00:2385 }
            begin { routine anchor; statement location unresolved } { 8E00:2385 }
              if ((P_Byte(local_d) = P_Byte($0)) and then (Slice16(local_d, 2) = 0)) then { routine anchor; statement location unresolved } { 8E00:2385 }
                Break; { routine anchor; statement location unresolved } { 8E00:2385 }
              local_11 := (P_P_Byte((P_Byte(local_d) + 5)))^; { 8E00:23ED }
              local_f := (P_Word((P_Byte(local_d) + 7)))^; { 8E00:23F0 }
              if (P_Byte(local_d)[3] <> -(1)) then { routine anchor; statement location unresolved } { 8E00:2385 }
                begin { routine anchor; statement location unresolved } { 8E00:2385 }
                  bVar1 := P_Byte(local_d)[3]; { routine anchor; statement location unresolved } { 8E00:2385 }
                  uVar2 := (Pack16(ShortInt((Word(local_11) shr 8)), bVar1) and $FF0F); { routine anchor; statement location unresolved } { 8E00:2385 }
                  g_4845 := Byte(uVar2); { 8E00:2409 }
                  if (g_4845 < local_4) then { routine anchor; statement location unresolved } { 8E00:2385 }
                    begin { routine anchor; statement location unresolved } { 8E00:2385 }
                      iVar3 := (((Word(local_4) - (bVar1 and $F)) * 5) + $32); { routine anchor; statement location unresolved } { 8E00:2385 }
                      g_4844 := Byte(iVar3); { 8E00:242E }
                    end; { routine anchor; statement location unresolved } { 8E00:2385 }
                  else { routine anchor; statement location unresolved } { 8E00:2385 }
                    begin { routine anchor; statement location unresolved } { 8E00:2385 }
                      iVar3 := Pack16(ShortInt((uVar2 shr 8)), local_4); { routine anchor; statement location unresolved } { 8E00:2385 }
                      if (local_4 < g_4845) then { routine anchor; statement location unresolved } { 8E00:2385 }
                        begin { routine anchor; statement location unresolved } { 8E00:2385 }
                          iVar3 := ((((bVar1 and $F) - Word(local_4)) * -(2)) + $32); { routine anchor; statement location unresolved } { 8E00:2385 }
                          g_4844 := Byte(iVar3); { 8E00:2453 }
                        end; { routine anchor; statement location unresolved } { 8E00:2385 }
                      else { routine anchor; statement location unresolved } { 8E00:2385 }
                        begin { routine anchor; statement location unresolved } { 8E00:2385 }
                          g_4844 := $32; { 8E00:2458 }
                        end; { routine anchor; statement location unresolved } { 8E00:2385 }
                    end; { routine anchor; statement location unresolved } { 8E00:2385 }
                  uVar4 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:2385 }
                  uVar5 := $B0; { routine anchor; statement location unresolved } { 8E00:2385 }
                  bVar1 := Roll(Pack16(uVar4, 100), Pack16(uVar4, 1)); { 8E00:2463 }
                  if (bVar1 <= g_4844) then { routine anchor; statement location unresolved } { 8E00:2385 }
                    begin { routine anchor; statement location unresolved } { 8E00:2385 }
                      uVar5 := $B0; { routine anchor; statement location unresolved } { 8E00:2385 }
                      ov24_0026(P_Byte(local_d), Slice16(local_d, 2), (local_d)^, local_8, uStack_6); { 8E00:2481 }
                      local_9 := 1; { 8E00:2486 }
                    end; { routine anchor; statement location unresolved } { 8E00:2385 }
                end; { routine anchor; statement location unresolved } { 8E00:2385 }
              local_d := P_Byte(FarBits(local_f, local_11)); { 8E00:2490 }
            end; { routine anchor; statement location unresolved } { 8E00:2385 }
          if (local_9 <> 0) then { routine anchor; statement location unresolved } { 8E00:2385 }
            begin { routine anchor; statement location unresolved } { 8E00:2385 }
              uVar8 := 1; { routine anchor; statement location unresolved } { 8E00:2385 }
              puVar6 := local_1e; { routine anchor; statement location unresolved } { 8E00:2385 }
              uVar7 := SS; { routine anchor; statement location unresolved } { 8E00:2385 }
              iVar3 := local_8; { routine anchor; statement location unresolved } { 8E00:2385 }
              uVar9 := uStack_6; { routine anchor; statement location unresolved } { 8E00:2385 }
              PString(local_1e, SS) := 'is affected'; { 8E00:24B2 }
              uVar5 := $BA; { routine anchor; statement location unresolved } { 8E00:2385 }
              FUN_00ba_1feb(puVar6, uVar7, uVar8, iVar3, uVar9); { 8E00:24B7 }
            end; { routine anchor; statement location unresolved } { 8E00:2385 }
          if (local_3 = local_12) then { routine anchor; statement location unresolved } { 8E00:2385 }
            Break; { routine anchor; statement location unresolved } { 8E00:2385 }
          local_3 := (local_3 + 1); { 8E00:23B1 }
        end; { routine anchor; statement location unresolved } { 8E00:2385 }
    end; { routine anchor; statement location unresolved } { 8E00:2385 }
  Exit; { 8E00:24CA }
end; { routine anchor; statement location unresolved } { 8E00:2385 }
```

### ov22:24D6 PrayerEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_d: array[0..10] of Byte [BP-$B].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, ApplySpellToTargets, System.@StrCopy.

```pascal
procedure PrayerEffect(); { 8E00:24D6 }
begin { routine anchor; statement location unresolved } { 8E00:24D6 }
  uVar1 := Word(g_681B); { routine anchor; statement location unresolved } { 8E00:24D6 }
  uVar2 := FUN_00ba_26c2(g_681B); { 8E00:24E4 }
  uVar3 := (((P_ShortInt((Integer(_SelectedChar) + $10E)))^ * $10) + (uVar2 and $FF)); { routine anchor; statement location unresolved } { 8E00:24D6 }
  uVar2 := (uVar3 shr 8); { routine anchor; statement location unresolved } { 8E00:24D6 }
  iVar4 := (uVar2 shl 8); { routine anchor; statement location unresolved } { 8E00:24D6 }
  iVar5 := (uVar2 shl 8); { routine anchor; statement location unresolved } { 8E00:24D6 }
  iVar6 := (uVar2 shl 8); { routine anchor; statement location unresolved } { 8E00:24D6 }
  puVar7 := local_d; { routine anchor; statement location unresolved } { 8E00:24D6 }
  PString(local_d, SS) := 'is praying'; { 8E00:2511 }
  ApplySpellToTargets(puVar7, SS, iVar6, iVar5, iVar4, uVar3, uVar1); { 8E00:2517 }
  Exit; { 8E00:251D }
end; { routine anchor; statement location unresolved } { 8E00:24D6 }
```

### ov22:2540 RemoveCurseEffect (conf H)

Params (BP stack slots): none.  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_1c: array[0..7] of Byte [BP-$1A]; local_14: array[0..12] of Byte [BP-$12]; local_7: ShortInt [BP-$5]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_1feb, System.@StrCopy, ov24_1081.

```pascal
procedure RemoveCurseEffect(); { 8E00:2540 }
begin { routine anchor; statement location unresolved } { 8E00:2540 }
  cVar2 := ov24_1081($24, g_6C95, g_6C97); { 8E00:2551 }
  if (cVar2 = 0) then { routine anchor; statement location unresolved } { 8E00:2540 }
    begin { routine anchor; statement location unresolved } { 8E00:2540 }
      local_7 := 0; { 8E00:257B }
      uStack_4 := (P_Word((g_6C95 + $CA)))^; { 8E00:2590 }
      local_6 := (P_Word((g_6C95 + 200)))^; { 8E00:258D }
      while (((local_6 or uStack_4) <> 0) and then (local_7 = 0)) do { routine anchor; statement location unresolved } { 8E00:2540 }
        begin { routine anchor; statement location unresolved } { 8E00:2540 }
          if ((P_ShortInt((local_6 + $36)))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:2540 }
            begin { routine anchor; statement location unresolved } { 8E00:2540 }
              local_7 := 1; { 8E00:25AB }
              (P_Byte((local_6 + $36)))^ := 0; { routine anchor; statement location unresolved } { 8E00:2540 }
            end; { routine anchor; statement location unresolved } { 8E00:2540 }
          puVar1 := P_Word((local_6 + $2A)); { routine anchor; statement location unresolved } { 8E00:2540 }
          uStack_4 := (P_Word((local_6 + $2C)))^; { 8E00:25C5 }
          local_6 := (puVar1)^; { 8E00:25C2 }
        end; { routine anchor; statement location unresolved } { 8E00:2540 }
      if (local_7 <> 0) then { routine anchor; statement location unresolved } { 8E00:2540 }
        begin { routine anchor; statement location unresolved } { 8E00:2540 }
          uVar4 := Pack16(ShortInt(((local_6 or uStack_4) shr 8)), 1); { routine anchor; statement location unresolved } { 8E00:2540 }
          puVar5 := local_1c; { routine anchor; statement location unresolved } { 8E00:2540 }
          uVar7 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2540 }
          uVar3 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2540 }
          PString(local_14, SS) := '''s item is un-cursed'; { 8E00:256F }
          FUN_00ba_1feb(puVar5, SS, uVar4, uVar7, uVar3); { 8E00:2574 }
        end; { routine anchor; statement location unresolved } { 8E00:2540 }
    end; { routine anchor; statement location unresolved } { 8E00:2540 }
  else { routine anchor; statement location unresolved } { 8E00:2540 }
    begin { routine anchor; statement location unresolved } { 8E00:2540 }
      uVar3 := 1; { routine anchor; statement location unresolved } { 8E00:2540 }
      puVar5 := local_14; { routine anchor; statement location unresolved } { 8E00:2540 }
      iVar6 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2540 }
      uVar7 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2540 }
      PString(local_1c, SS) := 'is un-cursed'; { 8E00:25E5 }
      FUN_00ba_1feb(puVar5, SS, uVar3, iVar6, uVar7); { 8E00:25EA }
    end; { routine anchor; statement location unresolved } { 8E00:2540 }
  Exit; { 8E00:25F2 }
end; { routine anchor; statement location unresolved } { 8E00:2540 }
```

### ov22:2604 BestowCurseEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure BestowCurseEffect; { 8E00:2604 }
begin { 8E00:2604 }
  ApplySpellToTargets('has been cursed!', 0, 0, 0, 0, g_681B); { 8E00:262A }
end; { 8E00:2630 }
```

### ov22:263D BlinkEffect (conf H)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure BlinkEffect; { 8E00:263D }
begin { 8E00:263D }
  ApplySpellToTargets('is blinking', 0, 0, 0, 0, g_681B); { 8E00:2663 }
end; { 8E00:2669 }
```

### ov22:266B FireballEffect (conf H)

Params (BP stack slots): none.  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; bVar8: Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; pbVar9: P_Byte [compiler temporary; no proven BP slot]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, ApplySpellToTargets, Roll, System.@StrCopy, ov24_0E2E, ov30_0909, ov31_0996.

```pascal
procedure FireballEffect(); { 8E00:266B }
begin { routine anchor; statement location unresolved } { 8E00:266B }
  g_6820 := 1; { 8E00:2671 }
  if (g_681B = 64) then { routine anchor; statement location unresolved } { 8E00:266B }
    begin { routine anchor; statement location unresolved } { 8E00:266B }
      uVar2 := Roll(3, 1); { 8E00:2683 }
      iVar3 := (((uVar2 and $FF) * 2) + 1); { routine anchor; statement location unresolved } { 8E00:266B }
      local_3 := Byte(iVar3); { 8E00:268D }
    end; { routine anchor; statement location unresolved } { 8E00:266B }
  else { routine anchor; statement location unresolved } { 8E00:266B }
    begin { routine anchor; statement location unresolved } { 8E00:266B }
      iVar3 := FUN_00ba_26c2(g_681B); { 8E00:2696 }
      local_3 := Byte(iVar3); { 8E00:269B }
    end; { routine anchor; statement location unresolved } { 8E00:266B }
  bVar8 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:266B }
  if ((P_Integer((Integer(ecl_Mem4900) + $1CC)))^ = 0) then { routine anchor; statement location unresolved } { 8E00:266B }
    begin { routine anchor; statement location unresolved } { 8E00:266B }
      ov30_0909(Word(g_6716), Slice16(g_6716, 2), 1, $FF, 2, Pack16(bVar8, g_6DBA), Pack16(bVar8, g_6DB9)); { 8E00:26C4 }
      bVar1 := g_671A; { routine anchor; statement location unresolved } { 8E00:266B }
      local_5 := g_671A; { 8E00:26CC }
      bVar8 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 8E00:266B }
      if (g_671A <> 0) then { routine anchor; statement location unresolved } { 8E00:266B }
        begin { routine anchor; statement location unresolved } { 8E00:266B }
          local_4 := 1; { 8E00:26D6 }
          while true do { routine anchor; statement location unresolved } { 8E00:266B }
            begin { routine anchor; statement location unresolved } { 8E00:266B }
              iVar3 := (Word((P_Byte(((Integer(P_LongWord(@(g_6716))) + (Word(local_4) * 3)) + 2)))^) * 4); { routine anchor; statement location unresolved } { 8E00:266B }
              uVar4 := (P_Word((P_Byte(@(g_65BB)) + iVar3)))^; { routine anchor; statement location unresolved } { 8E00:266B }
              (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_4) * 4)) + 1)))^ := (P_Word((P_Byte(@(g_65B9)) + iVar3)))^; { routine anchor; statement location unresolved } { 8E00:266B }
              (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_4) * 4)) + 1)))^ := uVar4; { routine anchor; statement location unresolved } { 8E00:266B }
              bVar8 := 0; { routine anchor; statement location unresolved } { 8E00:266B }
              if (local_4 = bVar1) then { routine anchor; statement location unresolved } { 8E00:266B }
                Break; { routine anchor; statement location unresolved } { 8E00:266B }
              local_4 := (local_4 + 1); { 8E00:26DB }
            end; { routine anchor; statement location unresolved } { 8E00:266B }
        end; { routine anchor; statement location unresolved } { 8E00:266B }
      g_6C94 := g_671A; { 8E00:271D }
    end; { routine anchor; statement location unresolved } { 8E00:266B }
  ov31_0996(Pack16(bVar8, 8), (Word(bVar8) shl 8), Pack16(bVar8, g_6DBA), Pack16(bVar8, g_6DB9)); { 8E00:272E }
  uVar4 := Pack16(UNKNOWN_extraout_AH_00, g_681B); { routine anchor; statement location unresolved } { 8E00:266B }
  iVar3 := (Word(UNKNOWN_extraout_AH_00) shl 8); { routine anchor; statement location unresolved } { 8E00:266B }
  iVar5 := (Word(UNKNOWN_extraout_AH_00) shl 8); { routine anchor; statement location unresolved } { 8E00:266B }
  uVar6 := ov24_0E2E(Pack16(UNKNOWN_extraout_AH_00, 6), Pack16(UNKNOWN_extraout_AH_00, local_3)); { 8E00:2744 }
  uVar7 := 9; { routine anchor; statement location unresolved } { 8E00:266B }
  pbVar9 := @(local_5); { routine anchor; statement location unresolved } { 8E00:266B }
  PString(local_5, SS) := ''; { 8E00:2757 }
  ApplySpellToTargets(pbVar9, SS, uVar7, uVar6, iVar5, iVar3, uVar4); { 8E00:275D }
  Exit; { 8E00:2763 }
end; { routine anchor; statement location unresolved } { 8E00:266B }
```

### ov22:2764 FUN_8e00_2764 (conf L)

Params (BP stack slots): param_1: LongWord [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: Byte [BP+$0C].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar5: Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_2d: Byte [BP-$2B]; local_2c: ShortInt [BP-$2A]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): ov22_2892,ov22_2C09.  
Callees (export): FUN_00ba_26c2, ApplySpellToTargets, System.@StrAssign, ov24_02FA, ov24_1081.

```pascal
procedure FUN_8e00_2764(param_1: LongWord; param_2: ShortInt; param_3: Byte); { 8E00:2764 }
begin { routine anchor; statement location unresolved } { 8E00:2764 }
  PString(local_2b, SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $28); { 8E00:2778 }
  g_6820 := 1; { 8E00:277D }
  uVar3 := FUN_00ba_26c2(Pack16(UNKNOWN_extraout_AH, g_681B)); { 8E00:2786 }
  bVar2 := g_6C94; { routine anchor; statement location unresolved } { 8E00:2764 }
  local_2c := ShortInt(uVar3); { 8E00:278B }
  bVar5 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:2764 }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:2764 }
    begin { routine anchor; statement location unresolved } { 8E00:2764 }
      local_2d := 1; { 8E00:279E }
      while true do { routine anchor; statement location unresolved } { 8E00:2764 }
        begin { routine anchor; statement location unresolved } { 8E00:2764 }
          uVar1 := (P_LongWord(((Integer(P_Word(@(g_6C90))) + (Word(local_2d) * 4)) + 1)))^; { routine anchor; statement location unresolved } { 8E00:2764 }
          if (((P_ShortInt((Integer(uVar1) + $10E)))^ = param_2) and then (local_2c <> 0)) then { routine anchor; statement location unresolved } { 8E00:2764 }
            begin { routine anchor; statement location unresolved } { 8E00:2764 }
              local_2c := (local_2c + -(1)); { 8E00:27C5 }
              uVar3 := ov24_1081(param_3, (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2d) * 4)) + 1)))^, (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2d) * 4)) + 1)))^); { 8E00:27DF }
              if (ShortInt(uVar3) <> 0) then { routine anchor; statement location unresolved } { 8E00:2764 }
                begin { routine anchor; statement location unresolved } { 8E00:2764 }
                  uVar3 := 0; { routine anchor; statement location unresolved } { 8E00:2764 }
                  (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2d) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:2764 }
                  (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2d) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:2764 }
                end; { routine anchor; statement location unresolved } { 8E00:2764 }
              bVar5 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 8E00:2764 }
            end; { routine anchor; statement location unresolved } { 8E00:2764 }
          else { routine anchor; statement location unresolved } { 8E00:2764 }
            begin { routine anchor; statement location unresolved } { 8E00:2764 }
              bVar5 := 0; { routine anchor; statement location unresolved } { 8E00:2764 }
              (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2d) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:2764 }
              (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2d) * 4)) + 1)))^ := 0; { routine anchor; statement location unresolved } { 8E00:2764 }
            end; { routine anchor; statement location unresolved } { 8E00:2764 }
          if (local_2d = bVar2) then { routine anchor; statement location unresolved } { 8E00:2764 }
            Break; { routine anchor; statement location unresolved } { 8E00:2764 }
          local_2d := (local_2d + 1); { 8E00:27A3 }
        end; { routine anchor; statement location unresolved } { 8E00:2764 }
    end; { routine anchor; statement location unresolved } { 8E00:2764 }
  ApplySpellToTargets(local_2b, SS, (Word(bVar5) shl 8), (Word(bVar5) shl 8), (Word(bVar5) shl 8), (Word(bVar5) shl 8), Pack16(bVar5, g_681B)); { 8E00:2832 }
  bVar2 := g_6C94; { routine anchor; statement location unresolved } { 8E00:2764 }
  if (g_6C94 <> 0) then { routine anchor; statement location unresolved } { 8E00:2764 }
    begin { routine anchor; statement location unresolved } { 8E00:2764 }
      local_2d := 1; { 8E00:2842 }
      while true do { routine anchor; statement location unresolved } { 8E00:2764 }
        begin { routine anchor; statement location unresolved } { 8E00:2764 }
          uVar4 := ((P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2d) * 4)) + 1)))^ or (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2d) * 4)) + 1)))^); { routine anchor; statement location unresolved } { 8E00:2764 }
          if (uVar4 <> 0) then { routine anchor; statement location unresolved } { 8E00:2764 }
            begin { routine anchor; statement location unresolved } { 8E00:2764 }
              ov24_02FA((P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_2d) * 4)) + 1)))^, (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_2d) * 4)) + 1)))^, Pack16(ShortInt((uVar4 shr 8)), $12)); { 8E00:2875 }
            end; { routine anchor; statement location unresolved } { 8E00:2764 }
          if (local_2d = bVar2) then { routine anchor; statement location unresolved } { 8E00:2764 }
            Break; { routine anchor; statement location unresolved } { 8E00:2764 }
          local_2d := (local_2d + 1); { 8E00:2847 }
        end; { routine anchor; statement location unresolved } { 8E00:2764 }
    end; { routine anchor; statement location unresolved } { 8E00:2764 }
  Exit; { 8E00:2885 }
end; { routine anchor; statement location unresolved } { 8E00:2764 }
```

### ov22:2892 HasteEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; local_c: array[0..9] of Byte [BP-$A].  
Callers (export): none recorded.  
Callees (export): FUN_8e00_2764, System.@StrCopy.

```pascal
procedure HasteEffect(); { 8E00:2892 }
begin { routine anchor; statement location unresolved } { 8E00:2892 }
  uVar1 := $2A; { routine anchor; statement location unresolved } { 8E00:2892 }
  uVar2 := Word((P_Byte((Integer(_SelectedChar) + $10E)))^); { routine anchor; statement location unresolved } { 8E00:2892 }
  puVar3 := local_c; { routine anchor; statement location unresolved } { 8E00:2892 }
  PString(local_c, SS) := 'is Hasted'; { 8E00:28AF }
  FUN_8e00_2764(puVar3, SS, uVar2, uVar1); { 8E00:28B5 }
  Exit; { 8E00:28BB }
end; { routine anchor; statement location unresolved } { 8E00:2892 }
```

### ov22:28BC FUN_8e00_28bc (conf L)

Params (BP stack slots): param_1: P_Byte [BP+$06]; param_2: Byte [BP+$0A]; param_3: Byte [BP+$0C]; param_4: Byte [BP+$0E]; param_5: Byte [BP+$10].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_8: Byte [BP-$6]; local_7: Byte [BP-$5]; local_6: Word [BP-$4]; local_4: Word [BP-$2]; bVar4: Byte [compiler temporary; no proven BP slot].  
Callers (export): FUN_8e00_295b,ov22_2BB7,ov22_2F4D,ov22_30D9.  
Callees (export): FUN_00ba_19de, ov24_0D63, ov24_1344, ov31_04BE.

```pascal
procedure FUN_8e00_28bc(param_1: P_Byte; param_2: Byte; param_3: Byte; param_4: Byte; param_5: Byte); { 8E00:28BC }
begin { routine anchor; statement location unresolved } { 8E00:28BC }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 8E00:28BC }
  ov31_04BE(@(local_8), SS, @(local_7), SS, param_4, param_5); { 8E00:28DB }
  if ((local_8 <> 0) and then (P_Byte(@(g_2744))[(Word(local_8) * 4)] = -(1))) then { routine anchor; statement location unresolved } { 8E00:28BC }
    begin { routine anchor; statement location unresolved } { 8E00:28BC }
      (param_1)^ := 1; { routine anchor; statement location unresolved } { 8E00:28BC }
    end; { routine anchor; statement location unresolved } { 8E00:28BC }
  if (local_7 <> 0) then { routine anchor; statement location unresolved } { 8E00:28BC }
    begin { routine anchor; statement location unresolved } { 8E00:28BC }
      uVar5 := (P_Word((P_Byte(@(g_65B9)) + (Word(local_7) * 4))))^; { routine anchor; statement location unresolved } { 8E00:28BC }
      uVar6 := (P_Word((P_Byte(@(g_65BB)) + (Word(local_7) * 4))))^; { routine anchor; statement location unresolved } { 8E00:28BC }
      g_6819 := $C; { 8E00:291E }
      bVar4 := Byte((Word(uVar5) shr 8)); { routine anchor; statement location unresolved } { 8E00:28BC }
      uVar1 := Pack16(bVar4, param_3); { routine anchor; statement location unresolved } { 8E00:28BC }
      uVar2 := Pack16(bVar4, 2); { routine anchor; statement location unresolved } { 8E00:28BC }
      local_6 := uVar5; { 8E00:2918 }
      local_4 := uVar6; { 8E00:291B }
      uVar3 := ov24_0D63((Word(bVar4) shl 8), Pack16(bVar4, param_2), uVar5, uVar6); { 8E00:293D }
      ov24_1344(uVar3, uVar2, uVar1, uVar5, uVar6); { 8E00:2943 }
      FUN_00ba_19de(Pack16(UNKNOWN_extraout_AH, $13)); { 8E00:294B }
      g_6819 := 0; { 8E00:2950 }
    end; { routine anchor; statement location unresolved } { 8E00:28BC }
  Exit; { 8E00:2958 }
end; { routine anchor; statement location unresolved } { 8E00:28BC }
```

### ov22:295B FUN_8e00_295b (conf L)

Params (BP stack slots): param_1: ShortInt [BP+$06]; param_2: Byte [BP+$08]; param_3: Byte [BP+$0A]; param_4: ShortInt [BP+$0C].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; local_42: Byte [BP-$40]; local_41: Byte [BP-$3F]; local_40: ShortInt [BP-$3E]; local_3f: ShortInt [BP-$3D]; local_3e: ShortInt [BP-$3C]; local_3d: ShortInt [BP-$3B]; local_3c: ShortInt [BP-$3A]; local_3b: ShortInt [BP-$39]; local_3a: ShortInt [BP-$38]; local_39: ShortInt [BP-$37]; local_38: ShortInt [BP-$36]; local_37: ShortInt [BP-$35]; local_36: Integer [BP-$34]; local_34: Integer [BP-$32]; local_32: Integer [BP-$30]; local_30: Integer [BP-$2E]; local_1e: Byte [BP-$1C]; local_1c: Integer [BP-$1A]; local_1a: Integer [BP-$18]; local_18: Integer [BP-$16]; local_16: Integer [BP-$14]; local_8: ShortInt [BP-$6]; local_6: ShortInt [BP-$4]; local_4: Byte [BP-$2].  
Callers (export): ov22_2BB7,ov22_2F4D,ov22_30D9.  
Callees (export): FUN_00ba_19de, FUN_00ba_1a29, FUN_8e00_28bc, System.FillChar, ov30_01A0, ov30_02CC, ov31_04BE, ov31_0BE7, ov31_0C0F.

```pascal
procedure FUN_8e00_295b(param_1: ShortInt; param_2: Byte; param_3: Byte; param_4: ShortInt); { 8E00:295B }
begin { routine anchor; statement location unresolved } { 8E00:295B }
  FUN_00ba_19de($13); { 8E00:2964 }
  ov31_04BE(@(local_41), SS, @(local_3f), SS, Pack16(UNKNOWN_extraout_AH, g_6DBA), Pack16(UNKNOWN_extraout_AH, g_6DB9)); { 8E00:297B }
  local_3b := 1; { 8E00:2980 }
  local_37 := ov31_0BE7(SelectedChar, g_5D94); { 8E00:298C }
  local_38 := ov31_0C0F(SelectedChar, g_5D94); { 8E00:299C }
  local_3e := param_1; { 8E00:29A7 }
  if ((local_37 <> g_6DB9) or else (local_38 <> g_6DBA)) then { routine anchor; statement location unresolved } { 8E00:295B }
    begin { routine anchor; statement location unresolved } { 8E00:295B }
      local_42 := (param_4 shl 1); { 8E00:29C6 }
      g_6820 := 1; { 8E00:29C9 }
      while (local_42 <> 0) do { routine anchor; statement location unresolved } { 8E00:295B }
        begin { routine anchor; statement location unresolved } { 8E00:295B }
          FillChar(MemRef(@(local_1c), SS), $1A, 0); { 8E00:29E3 }
          local_1c := Integer(g_6DB9); { 8E00:29EC }
          local_1a := Integer(g_6DBA); { 8E00:29F3 }
          local_18 := (Integer(g_6DB9) + (((Integer(g_6DB9) - Integer(local_37)) * Integer(local_3b)) * Word(local_42))); { 8E00:2A1B }
          local_16 := (Integer(g_6DBA) + (((Integer(g_6DBA) - Integer(local_38)) * Integer(local_3b)) * Word(local_42))); { 8E00:2A43 }
          ov30_01A0(@(local_1c), SS); { 8E00:2A4B }
          repeat { routine anchor; statement location unresolved } { 8E00:295B }
            begin { routine anchor; statement location unresolved } { 8E00:295B }
              local_39 := local_8; { 8E00:2A53 }
              local_3a := local_6; { 8E00:2A59 }
              if ((local_1c <> local_18) or else (local_1a <> local_16)) then { routine anchor; statement location unresolved } { 8E00:295B }
                begin { routine anchor; statement location unresolved } { 8E00:295B }
                  while true do { routine anchor; statement location unresolved } { 8E00:295B }
                    begin { routine anchor; statement location unresolved } { 8E00:295B }
                      local_3d := ov30_02CC(@(local_1c), SS); { 8E00:2A71 }
                      ov31_04BE(@(local_41), SS, @(local_40), SS, local_6, local_8); { 8E00:2A8B }
                      if (local_3d = 0) then { routine anchor; statement location unresolved } { 8E00:295B }
                        Break; { routine anchor; statement location unresolved } { 8E00:295B }
                      if ((((local_40 <> 0) and then (local_40 <> local_3f)) or else (local_41 = 0)) or else ((1 < Byte(P_Byte(@(g_2744))[(Word(local_41) * 4)])) or else (local_42 <= local_4))) then { routine anchor; statement location unresolved } { 8E00:295B }
                        Break; { routine anchor; statement location unresolved } { 8E00:295B }
                    end; { routine anchor; statement location unresolved } { 8E00:295B }
                end; { routine anchor; statement location unresolved } { 8E00:295B }
              local_3f := local_40; { 8E00:2AC7 }
              if (local_41 = 0) then { routine anchor; statement location unresolved } { 8E00:295B }
                begin { routine anchor; statement location unresolved } { 8E00:295B }
                  local_42 := 0; { 8E00:2AD0 }
                end; { routine anchor; statement location unresolved } { 8E00:295B }
              FUN_00ba_1a29($32, 4, local_6, local_8, local_3a, local_39); { 8E00:2AEA }
              FUN_8e00_28bc(@(local_3c), SS, Pack16(UNKNOWN_extraout_AH_00, param_2), Pack16(UNKNOWN_extraout_AH_00, param_3), Pack16(UNKNOWN_extraout_AH_00, local_6), Pack16(UNKNOWN_extraout_AH_00, local_8)); { 8E00:2B05 }
              if (local_3c <> 0) then { routine anchor; statement location unresolved } { 8E00:295B }
                begin { routine anchor; statement location unresolved } { 8E00:295B }
                  g_6DB9 := local_8; { 8E00:2B11 }
                  g_6DBA := local_6; { 8E00:2B17 }
                  FillChar(MemRef(@(local_36), SS), $1A, 0); { 8E00:2B26 }
                  local_36 := Integer(g_6DB9); { 8E00:2B2F }
                  local_34 := Integer(g_6DBA); { 8E00:2B36 }
                  local_32 := Integer(local_37); { 8E00:2B3D }
                  local_30 := Integer(local_38); { 8E00:2B44 }
                  ov30_01A0(@(local_36), SS); { 8E00:2B4C }
                  repeat { routine anchor; statement location unresolved } { 8E00:295B }
                    begin { routine anchor; statement location unresolved } { 8E00:295B }
                      cVar1 := ov30_02CC(@(local_36), SS); { 8E00:2B56 }
                    end; { routine anchor; statement location unresolved } { 8E00:295B }
                  until not ((cVar1 <> 0)); { routine anchor; statement location unresolved } { 8E00:295B }
                  if ((local_3e <> 0) and then (local_1e < 9)) then { routine anchor; statement location unresolved } { 8E00:295B }
                    begin { routine anchor; statement location unresolved } { 8E00:295B }
                      local_4 := (local_4 + 8); { 8E00:2B6D }
                    end; { routine anchor; statement location unresolved } { 8E00:295B }
                  local_3b := -(local_3b); { 8E00:2B7B }
                  local_3e := 0; { 8E00:2B7E }
                  local_3f := 0; { 8E00:2B82 }
                end; { routine anchor; statement location unresolved } { 8E00:295B }
              if (local_4 < local_42) then { routine anchor; statement location unresolved } { 8E00:295B }
                begin { routine anchor; statement location unresolved } { 8E00:295B }
                  local_42 := (local_42 - local_4); { 8E00:2B91 }
                end; { routine anchor; statement location unresolved } { 8E00:295B }
              else { routine anchor; statement location unresolved } { 8E00:295B }
                begin { routine anchor; statement location unresolved } { 8E00:295B }
                  local_42 := 0; { 8E00:2B96 }
                end; { routine anchor; statement location unresolved } { 8E00:295B }
            end; { routine anchor; statement location unresolved } { 8E00:295B }
          until not (((local_3c = 0) and then (local_42 <> 0))); { routine anchor; statement location unresolved } { 8E00:295B }
        end; { routine anchor; statement location unresolved } { 8E00:295B }
      g_6820 := 0; { 8E00:2BAC }
    end; { routine anchor; statement location unresolved } { 8E00:295B }
  Exit; { 8E00:2BB4 }
end; { routine anchor; statement location unresolved } { 8E00:295B }
```

### ov22:2BB7 LightningBoltEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_26c2, FUN_8e00_28bc, FUN_8e00_295b, Roll.

```pascal
procedure LightningBoltEffect(); { 8E00:2BB7 }
begin { routine anchor; statement location unresolved } { 8E00:2BB7 }
  uVar1 := FUN_00ba_26c2(g_681B); { 8E00:2BC1 }
  uVar1 := Roll(6, uVar1); { 8E00:2BCA }
  local_3 := Byte(uVar1); { 8E00:2BCF }
  FUN_8e00_28bc(@(local_4), SS, 4, uVar1, g_6DBA, g_6DB9); { 8E00:2BE7 }
  FUN_8e00_295b(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 4), Pack16(UNKNOWN_extraout_AH, local_3), Pack16(UNKNOWN_extraout_AH, 8)); { 8E00:2BF8 }
  Exit; { 8E00:2BFE }
end; { routine anchor; statement location unresolved } { 8E00:2BB7 }
```

### ov22:2C09 SlowEffect (conf H)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; local_c: array[0..9] of Byte [BP-$A].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_23b7, FUN_8e00_2764, System.@StrCopy.

```pascal
procedure SlowEffect(); { 8E00:2C09 }
begin { routine anchor; statement location unresolved } { 8E00:2C09 }
  uVar1 := $27; { routine anchor; statement location unresolved } { 8E00:2C09 }
  uVar2 := FUN_00ba_23b7(SelectedChar, g_5D94); { 8E00:2C1A }
  puVar3 := local_c; { routine anchor; statement location unresolved } { 8E00:2C09 }
  PString(local_c, SS) := 'is Slowed'; { 8E00:2C2A }
  FUN_8e00_2764(puVar3, SS, uVar2, uVar1); { 8E00:2C30 }
  Exit; { 8E00:2C36 }
end; { routine anchor; statement location unresolved } { 8E00:2C09 }
```

### ov22:2C43 RestorationEffect (conf H)

Params (BP stack slots): none.  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_1b: array[0..11] of Byte [BP-$19]; local_f: ShortInt [BP-$D]; local_e: ShortInt [BP-$C]; local_d: Word [BP-$B]; local_b: Integer [BP-$9]; local_9: ShortInt [BP-$7]; local_8: ShortInt [BP-$6]; local_7: Byte [BP-$5]; local_6: Integer [BP-$4]; uStack_4: Word [BP-$2].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, FUN_00ba_2f57, System.@StrCopy, ov23_0000.

```pascal
procedure RestorationEffect(); { 8E00:2C43 }
begin { routine anchor; statement location unresolved } { 8E00:2C43 }
  uVar5 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2C43 }
  iVar3 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2C43 }
  local_6 := g_6C95; { 8E00:2C50 }
  uStack_4 := g_6C97; { 8E00:2C53 }
  if ((P_ShortInt((g_6C95 + $74)))^ <> 0) then { routine anchor; statement location unresolved } { 8E00:2C43 }
    begin { routine anchor; statement location unresolved } { 8E00:2C43 }
      local_7 := ((P_Byte((g_6C95 + $75)))^ div (P_Byte((g_6C95 + $74)))^); { 8E00:2C7A }
      (P_ShortInt((g_6C95 + $32)))^ := ((P_ShortInt((g_6C95 + $32)))^ + local_7); { routine anchor; statement location unresolved } { 8E00:2C43 }
      (P_ShortInt((iVar3 + $11B)))^ := ((P_ShortInt((iVar3 + $11B)))^ + local_7); { routine anchor; statement location unresolved } { 8E00:2C43 }
      (P_ShortInt((iVar3 + $B1)))^ := ((P_ShortInt((iVar3 + $B1)))^ + local_7); { routine anchor; statement location unresolved } { 8E00:2C43 }
      (P_ShortInt((iVar3 + $75)))^ := ((P_ShortInt((iVar3 + $75)))^ - local_7); { routine anchor; statement location unresolved } { 8E00:2C43 }
      (P_ShortInt((iVar3 + $74)))^ := ((P_ShortInt((iVar3 + $74)))^ + -(1)); { routine anchor; statement location unresolved } { 8E00:2C43 }
      local_8 := 13; { 8E00:2CAE }
      local_d := $9680; { 8E00:2CB2 }
      local_b := $98; { 8E00:2CB7 }
      local_f := 0; { 8E00:2CBC }
      while true do { routine anchor; statement location unresolved } { 8E00:2C43 }
        begin { routine anchor; statement location unresolved } { 8E00:2C43 }
          local_9 := (P_ShortInt(((local_6 + local_f) + $96)))^; { 8E00:2CD3 }
          if ((0 < local_9) and then (local_9 <= local_8)) then { routine anchor; statement location unresolved } { 8E00:2C43 }
            begin { routine anchor; statement location unresolved } { 8E00:2C43 }
              iVar3 := ((local_f * $38) + (ShortInt((local_9 + 1)) * 4)); { routine anchor; statement location unresolved } { 8E00:2C43 }
              if ((0 < (P_Integer((P_Byte(@(g_409D)) + iVar3)))^) or else ((-(1) < (P_Integer((P_Byte(@(g_409D)) + iVar3)))^) and then ((P_Integer((P_Byte(@(g_409B)) + iVar3)))^ <> 0))) then { routine anchor; statement location unresolved } { 8E00:2C43 }
                begin { routine anchor; statement location unresolved } { 8E00:2C43 }
                  iVar3 := ((local_f * $38) + (ShortInt((local_9 + 1)) * 4)); { routine anchor; statement location unresolved } { 8E00:2C43 }
                  if ((((P_Integer((P_Byte(@(g_409D)) + iVar3)))^ < local_b) or else (((P_Integer((P_Byte(@(g_409D)) + iVar3)))^ <= local_b) and then ((P_Word((P_Byte(@(g_409B)) + iVar3)))^ < local_d))) and then Sequence((cVar2 := FUN_00ba_2f57(Pack16(ShortInt(((P_Word((P_Byte(@(g_409B)) + iVar3)))^ shr 8)), local_f), local_6, uStack_4)); (cVar2 = 0))) then { 8E00:2D4A }
                    begin { routine anchor; statement location unresolved } { 8E00:2C43 }
                      local_8 := local_9; { 8E00:2D56 }
                      local_e := local_f; { 8E00:2D5C }
                      iVar3 := ((local_f * $38) + (ShortInt((local_9 + 1)) * 4)); { routine anchor; statement location unresolved } { 8E00:2C43 }
                      local_d := (P_Word((P_Byte(@(g_409B)) + iVar3)))^; { 8E00:2D80 }
                      local_b := (P_Integer((P_Byte(@(g_409D)) + iVar3)))^; { 8E00:2D83 }
                    end; { routine anchor; statement location unresolved } { 8E00:2C43 }
                end; { routine anchor; statement location unresolved } { 8E00:2C43 }
            end; { routine anchor; statement location unresolved } { 8E00:2C43 }
          if (local_f = 7) then { routine anchor; statement location unresolved } { 8E00:2C43 }
            Break; { routine anchor; statement location unresolved } { 8E00:2C43 }
          local_f := (local_f + 1); { 8E00:2CC2 }
        end; { routine anchor; statement location unresolved } { 8E00:2C43 }
      pcVar1 := P_ShortInt(((local_6 + local_e) + $96)); { routine anchor; statement location unresolved } { 8E00:2C43 }
      (pcVar1)^ := ((pcVar1)^ + 1); { routine anchor; statement location unresolved } { 8E00:2C43 }
      if (((P_Integer((local_6 + $AE)))^ < local_b) or else (((P_Integer((local_6 + $AE)))^ <= local_b) and then ((P_Word((local_6 + $AC)))^ < local_d))) then { routine anchor; statement location unresolved } { 8E00:2C43 }
        begin { routine anchor; statement location unresolved } { 8E00:2C43 }
          (P_Word((local_6 + $AC)))^ := local_d; { routine anchor; statement location unresolved } { 8E00:2C43 }
          (P_Integer((local_6 + $AE)))^ := local_b; { routine anchor; statement location unresolved } { 8E00:2C43 }
        end; { routine anchor; statement location unresolved } { 8E00:2C43 }
      ov23_0000(local_6, uStack_4); { 8E00:2DCF }
      puVar4 := local_1b; { routine anchor; statement location unresolved } { 8E00:2C43 }
      iVar3 := local_6; { routine anchor; statement location unresolved } { 8E00:2C43 }
      uVar5 := uStack_4; { routine anchor; statement location unresolved } { 8E00:2C43 }
      PString(local_1b, SS) := 'is restored'; { 8E00:2DE4 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar4, SS, iVar3, uVar5); { 8E00:2DEF }
    end; { routine anchor; statement location unresolved } { 8E00:2C43 }
  Exit; { 8E00:2DF7 }
end; { routine anchor; statement location unresolved } { 8E00:2C43 }
```

### ov22:2E02 SpeedEffect (conf M)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_c: array[0..9] of Byte [BP-$A].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy, ov24_1081.

```pascal
procedure SpeedEffect(); { 8E00:2E02 }
begin { routine anchor; statement location unresolved } { 8E00:2E02 }
  uVar1 := ov24_1081($2A, g_6C95, g_6C97); { 8E00:2E13 }
  bVar6 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 8E00:2E02 }
  if (ShortInt(uVar1) = 0) then { routine anchor; statement location unresolved } { 8E00:2E02 }
    begin { routine anchor; statement location unresolved } { 8E00:2E02 }
      uVar1 := Pack16(bVar6, g_681B); { routine anchor; statement location unresolved } { 8E00:2E02 }
      iVar2 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:2E02 }
      iVar3 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:2E02 }
      iVar4 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:2E02 }
      iVar5 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 8E00:2E02 }
      puVar7 := local_c; { routine anchor; statement location unresolved } { 8E00:2E02 }
      PString(local_c, SS) := 'is Speedy'; { 8E00:2E36 }
      ApplySpellToTargets(puVar7, SS, iVar5, iVar4, iVar3, iVar2, uVar1); { 8E00:2E3C }
    end; { routine anchor; statement location unresolved } { 8E00:2E02 }
  Exit; { 8E00:2E42 }
end; { routine anchor; statement location unresolved } { 8E00:2E02 }
```

### ov22:2E4D HealEffect (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_d: array[0..10] of Byte [BP-$B].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_1feb, FUN_8e00_228a, Roll, System.@StrCopy, ov24_0026, ov24_1081, ov24_175D.

```pascal
procedure HealEffect(); { 8E00:2E4D }
begin { routine anchor; statement location unresolved } { 8E00:2E4D }
  cVar1 := ov24_1081($37, g_6C95, g_6C97); { 8E00:2E5E }
  if (cVar1 = 0) then { routine anchor; statement location unresolved } { 8E00:2E4D }
    begin { routine anchor; statement location unresolved } { 8E00:2E4D }
      cVar1 := FUN_8e00_228a(); { 8E00:2E8A }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 8E00:2E4D }
        begin { routine anchor; statement location unresolved } { 8E00:2E4D }
          uVar5 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2E4D }
          uVar6 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2E4D }
          uVar2 := Roll(4, 1); { 8E00:2E9F }
          uVar2 := ((uVar2 and $FF) + 8); { routine anchor; statement location unresolved } { 8E00:2E4D }
          cVar1 := ov24_175D((uVar2 and $FF00), uVar2, uVar5, uVar6); { 8E00:2EAD }
          if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:2E4D }
            begin { routine anchor; statement location unresolved } { 8E00:2E4D }
              uVar3 := 1; { routine anchor; statement location unresolved } { 8E00:2E4D }
              puVar4 := local_d; { routine anchor; statement location unresolved } { 8E00:2E4D }
              uVar5 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2E4D }
              uVar6 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2E4D }
              PString(local_d, SS) := 'is Healed'; { 8E00:2ECB }
              FUN_00ba_1feb(puVar4, SS, uVar3, uVar5, uVar6); { 8E00:2ED0 }
            end; { routine anchor; statement location unresolved } { 8E00:2E4D }
        end; { routine anchor; statement location unresolved } { 8E00:2E4D }
    end; { routine anchor; statement location unresolved } { 8E00:2E4D }
  else { routine anchor; statement location unresolved } { 8E00:2E4D }
    begin { routine anchor; statement location unresolved } { 8E00:2E4D }
      g_681F := 1; { 8E00:2E67 }
      ov24_0026(0, 0, $16, g_6C95, g_6C97); { 8E00:2E7D }
      g_681F := 0; { 8E00:2E82 }
    end; { routine anchor; statement location unresolved } { 8E00:2E4D }
  Exit; { 8E00:2ED8 }
end; { routine anchor; statement location unresolved } { 8E00:2E4D }
```

### ov22:2EE5 ov22_2EE5 (conf L)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_f: array[0..11] of Byte [BP-$D]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, SpellDuration, System.@StrCopy, ov24_0E52, ov24_115C.

```pascal
procedure ov22_2EE5(); { 8E00:2EE5 }
begin { routine anchor; statement location unresolved } { 8E00:2EE5 }
  bVar4 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:2EE5 }
  cVar1 := ov24_115C(@(local_3), SS, (Word(bVar4) shl 8), Pack16(bVar4, $15), g_6C95, g_6C97); { 8E00:2EFE }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:2EE5 }
    begin { routine anchor; statement location unresolved } { 8E00:2EE5 }
      puVar5 := local_f; { routine anchor; statement location unresolved } { 8E00:2EE5 }
      uVar6 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2EE5 }
      uVar7 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2EE5 }
      PString(local_f, SS) := 'is stronger'; { 8E00:2F19 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar5, SS, uVar6, uVar7); { 8E00:2F24 }
    end; { routine anchor; statement location unresolved } { 8E00:2EE5 }
  uVar2 := $26; { routine anchor; statement location unresolved } { 8E00:2EE5 }
  uVar6 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2EE5 }
  uVar7 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2EE5 }
  uVar3 := SpellDuration(g_681B); { 8E00:2F39 }
  ov24_0E52(1, local_3, uVar3, uVar2, uVar6, uVar7); { 8E00:2F44 }
  Exit; { 8E00:2F4C }
end; { routine anchor; statement location unresolved } { 8E00:2EE5 }
```

### ov22:2F4D ov22_2F4D (conf L)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_8e00_28bc, FUN_8e00_295b, Roll.

```pascal
procedure ov22_2F4D(); { 8E00:2F4D }
begin { routine anchor; statement location unresolved } { 8E00:2F4D }
  uVar1 := Word(g_6DB9); { routine anchor; statement location unresolved } { 8E00:2F4D }
  uVar2 := Word(g_6DBA); { routine anchor; statement location unresolved } { 8E00:2F4D }
  uVar3 := Roll(6, 1); { 8E00:2F61 }
  iVar4 := ((uVar3 and $FF) + $14); { routine anchor; statement location unresolved } { 8E00:2F4D }
  FUN_8e00_28bc(@(local_3), SS, Pack16(ShortInt((Word(iVar4) shr 8)), 4), iVar4, uVar2, uVar1); { 8E00:2F75 }
  FUN_8e00_295b((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 4), Pack16(UNKNOWN_extraout_AH, $14), Pack16(UNKNOWN_extraout_AH, 3)); { 8E00:2F85 }
  Exit; { 8E00:2F8B }
end; { routine anchor; statement location unresolved } { 8E00:2F4D }
```

### ov22:2F99 ParalysisEffect (conf M)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure ParalysisEffect; { 8E00:2F99 }
begin { 8E00:2F99 }
  ApplySpellToTargets('is paralyzed', 0, 0, 0, 0, g_681B); { 8E00:2FBF }
end; { 8E00:2FC5 }
```

### ov22:2FD0 HealOtherEffect (conf M)

Params (BP stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_c: array[0..9] of Byte [BP-$A].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_1feb, Roll, System.@StrCopy, ov24_175D.

```pascal
procedure HealOtherEffect(); { 8E00:2FD0 }
begin { routine anchor; statement location unresolved } { 8E00:2FD0 }
  uVar5 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2FD0 }
  uVar6 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2FD0 }
  uVar2 := Roll(4, 2); { 8E00:2FE4 }
  uVar2 := ((uVar2 and $FF) + 2); { routine anchor; statement location unresolved } { 8E00:2FD0 }
  cVar1 := ov24_175D((uVar2 and $FF00), uVar2, uVar5, uVar6); { 8E00:2FF1 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 8E00:2FD0 }
    begin { routine anchor; statement location unresolved } { 8E00:2FD0 }
      uVar3 := 1; { routine anchor; statement location unresolved } { 8E00:2FD0 }
      puVar4 := local_c; { routine anchor; statement location unresolved } { 8E00:2FD0 }
      uVar5 := g_6C95; { routine anchor; statement location unresolved } { 8E00:2FD0 }
      uVar6 := g_6C97; { routine anchor; statement location unresolved } { 8E00:2FD0 }
      PString(local_c, SS) := 'is Healed'; { 8E00:300F }
      FUN_00ba_1feb(puVar4, SS, uVar3, uVar5, uVar6); { 8E00:3014 }
    end; { routine anchor; statement location unresolved } { 8E00:2FD0 }
  Exit; { 8E00:301C }
end; { routine anchor; statement location unresolved } { 8E00:2FD0 }
```

### ov22:302A OtherInvisibilityEffect (conf M)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure OtherInvisibilityEffect; { 8E00:302A }
begin { 8E00:302A }
  ApplySpellToTargets('is invisible', 0, 0, 0, 0, g_681B); { 8E00:3050 }
end; { 8E00:3056 }
```

### ov22:3058 ov22_3058 (conf L)

Params (BP stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1]; bVar7: Byte [compiler temporary; no proven BP slot].  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy, ov24_0E2E.

```pascal
procedure ov22_3058(); { 8E00:3058 }
begin { routine anchor; statement location unresolved } { 8E00:3058 }
  bVar7 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 8E00:3058 }
  uVar1 := Pack16(bVar7, g_681B); { routine anchor; statement location unresolved } { 8E00:3058 }
  iVar2 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 8E00:3058 }
  iVar3 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 8E00:3058 }
  uVar4 := ov24_0E2E(Pack16(bVar7, 4), Pack16(bVar7, 2)); { 8E00:306E }
  iVar5 := ((uVar4 and $FF) + 2); { routine anchor; statement location unresolved } { 8E00:3058 }
  uVar6 := Pack16(ShortInt((Word(iVar5) shr 8)), 8); { routine anchor; statement location unresolved } { 8E00:3058 }
  puVar8 := @(local_3); { routine anchor; statement location unresolved } { 8E00:3058 }
  PString(local_3, SS) := ''; { 8E00:3085 }
  ApplySpellToTargets(puVar8, SS, uVar6, iVar5, iVar3, iVar2, uVar1); { 8E00:308B }
  Exit; { 8E00:3091 }
end; { routine anchor; statement location unresolved } { 8E00:3058 }
```

### ov22:3092 ov22_3092 (conf L)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

```pascal
procedure ov22_3092(); { 8E00:3092 }
begin { routine anchor; statement location unresolved } { 8E00:3092 }
  Exit; { 8E00:3096 }
end; { routine anchor; statement location unresolved } { 8E00:3092 }
```

### ov22:30A2 ReadingEffect (conf M)

Params: none.  
Locals: only compiler string buffer; source-level temporary omitted.  
Callers (export): none recorded.  
Callees (export): ApplySpellToTargets, System.@StrCopy.

**Assembly review:** No-branch wrapper checked against actual PUSH/MOV bytes; byte arguments discard uninitialized AH. Uses the normalized stack-slot order of the shared helper. All message bytes read from current CS.

```pascal
procedure ReadingEffect; { 8E00:30A2 }
begin { 8E00:30A2 }
  ApplySpellToTargets('is Reading', 0, 0, 1, 255, g_681B); { 8E00:30C8 }
end; { 8E00:30CE }
```

### ov22:30D9 BreathEffect (conf M)

Params (BP stack slots): param_1: Word [BP+$06]; param_2: LongWord [BP+$08]; param_3: LongWord [BP+$0C].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_f: array[0..9] of Byte [BP-$D]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_16ec, FUN_00ba_19de, FUN_00ba_1a29, FUN_00ba_2637, FUN_8e00_28bc, FUN_8e00_295b, Roll, System.@StrCopy, ov24_0026, ov24_0FD2, ov30_0000, ov31_0BE7, ov31_0C0F.

```pascal
procedure BreathEffect(param_1: Word; param_2: LongWord; param_3: LongWord); { 8E00:30D9 }
begin { routine anchor; statement location unresolved } { 8E00:30D9 }
  if ((g_6DE3 = 0) or else Sequence((bVar1 := Roll(100, 1)); ($32 < bVar1))) then { 8E00:30EC }
    begin { routine anchor; statement location unresolved } { 8E00:30D9 }
      local_4 := ov31_0BE7(Integer(param_3), Slice16(param_3, 2)); { 8E00:30FE }
      local_5 := ov31_0C0F(Integer(param_3), Slice16(param_3, 2)); { 8E00:310C }
      puVar5 := local_f; { routine anchor; statement location unresolved } { 8E00:30D9 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 8E00:30D9 }
      iVar3 := Integer(param_3); { routine anchor; statement location unresolved } { 8E00:30D9 }
      uVar6 := Slice16(param_3, 2); { routine anchor; statement location unresolved } { 8E00:30D9 }
      PString(local_f, SS) := 'Breathes!'; { 8E00:3124 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar5, uVar4, iVar3, uVar6); { 8E00:312F }
      CallIndirect((g_6B84)^)($BA, P_Byte(@(g_70C6)), $C7C, Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, $33)); { routine anchor; statement location unresolved } { 8E00:30D9 }
      cVar2 := ov30_0000((Integer(g_6DB9) - Integer(local_4))); { 8E00:3150 }
      g_6DB9 := (local_4 + cVar2); { 8E00:315D }
      cVar2 := ov30_0000((Integer(g_6DBA) - Integer(local_5))); { 8E00:316D }
      g_6DBA := (local_5 + cVar2); { 8E00:317A }
      if (Integer(g_6DB9) = (local_4 + 1)) then { routine anchor; statement location unresolved } { 8E00:30D9 }
        begin { routine anchor; statement location unresolved } { 8E00:30D9 }
          g_6DB9 := (g_6DB9 + 1); { 8E00:318C }
        end; { routine anchor; statement location unresolved } { 8E00:30D9 }
      if (Integer(g_6DBA) = (local_5 + 1)) then { routine anchor; statement location unresolved } { 8E00:30D9 }
        begin { routine anchor; statement location unresolved } { 8E00:30D9 }
          g_6DBA := (g_6DBA + 1); { 8E00:319F }
        end; { routine anchor; statement location unresolved } { 8E00:30D9 }
      ov24_0FD2(Integer(param_3), Slice16(param_3, 2)); { 8E00:31A9 }
      FUN_00ba_19de(Pack16(UNKNOWN_extraout_AH_01, $13)); { 8E00:31B1 }
      FUN_00ba_1a29(Pack16(UNKNOWN_extraout_AH_02, $32), Pack16(UNKNOWN_extraout_AH_02, 4), Pack16(UNKNOWN_extraout_AH_02, g_6DBA), Pack16(UNKNOWN_extraout_AH_02, g_6DB9), Pack16(UNKNOWN_extraout_AH_02, local_5), Pack16(UNKNOWN_extraout_AH_02, local_4)); { 8E00:31CC }
      FUN_8e00_28bc(@(local_3), SS, Pack16(UNKNOWN_extraout_AH_03, 3), Pack16(UNKNOWN_extraout_AH_03, (P_Byte((Integer(param_3) + $32)))^), Pack16(UNKNOWN_extraout_AH_03, g_6DBA), Pack16(UNKNOWN_extraout_AH_03, g_6DB9)); { 8E00:31EA }
      FUN_8e00_295b((Word(UNKNOWN_extraout_AH_04) shl 8), Pack16(UNKNOWN_extraout_AH_04, 3), Pack16(UNKNOWN_extraout_AH_04, (P_Byte((Integer(param_3) + $32)))^), Pack16(UNKNOWN_extraout_AH_04, 10)); { 8E00:31FF }
      uVar4 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 8E00:30D9 }
      iVar3 := Integer(param_2); { routine anchor; statement location unresolved } { 8E00:30D9 }
      if ((P_Byte((iVar3 + 3)))^ < $FE) then { routine anchor; statement location unresolved } { 8E00:30D9 }
        begin { routine anchor; statement location unresolved } { 8E00:30D9 }
          ov24_0026(iVar3, uVar4, Pack16(UNKNOWN_extraout_AH_05, $58), Integer(param_3), Slice16(param_3, 2)); { 8E00:3224 }
        end; { routine anchor; statement location unresolved } { 8E00:30D9 }
      else { routine anchor; statement location unresolved } { 8E00:30D9 }
        begin { routine anchor; statement location unresolved } { 8E00:30D9 }
          (P_ShortInt((iVar3 + 3)))^ := ((P_ShortInt((iVar3 + 3)))^ + -(1)); { routine anchor; statement location unresolved } { 8E00:30D9 }
        end; { routine anchor; statement location unresolved } { 8E00:30D9 }
      FUN_00ba_2637(Integer(param_3), Slice16(param_3, 2)); { 8E00:322F }
    end; { routine anchor; statement location unresolved } { 8E00:30D9 }
  Exit; { 8E00:323A }
end; { routine anchor; statement location unresolved } { 8E00:30D9 }
```

### ov22:323D ItemContainsSpell (conf M)

Params (BP stack slots): param_1: LongWord [BP+$06].  
Locals: local_3: Byte [BP-$1].  
Callers (export): FUN_8e00_051c.  
Callees (export): none recorded.

```pascal
function ItemContainsSpell(param_1: LongWord): Byte; { 8E00:323D }
begin { routine anchor; statement location unresolved } { 8E00:323D }
  if ((((Integer(param_1) = 0) and then (Slice16(param_1, 2) = 0)) or else (Byte(P_Byte(@(g_5582))[(Word((P_Byte((Integer(param_1) + $2E)))^) * $10)]) < $B)) or else ($D < Byte(P_Byte(@(g_5582))[(Word((P_Byte((Integer(param_1) + $2E)))^) * $10)]))) then { routine anchor; statement location unresolved } { 8E00:323D }
    begin { routine anchor; statement location unresolved } { 8E00:323D }
      local_3 := 0; { 8E00:3277 }
    end; { routine anchor; statement location unresolved } { 8E00:323D }
  else { routine anchor; statement location unresolved } { 8E00:323D }
    begin { routine anchor; statement location unresolved } { 8E00:323D }
      local_3 := 1; { 8E00:327D }
    end; { routine anchor; statement location unresolved } { 8E00:323D }
  Exit(local_3); { 8E00:3287 }
end; { routine anchor; statement location unresolved } { 8E00:323D }
```

### ov22:328A ConsumeScrollSpell (conf M)

Params (BP stack slots): param_1: Byte [BP+$06]; param_2: LongWord [BP+$08]; param_3: Word [BP+$0C]; param_4: Word [BP+$0E].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2].  
Callers (export): none recorded.  
Callees (export): FUN_00ba_1509.

```pascal
procedure ConsumeScrollSpell(param_1: Byte; param_2: LongWord; param_3: Word; param_4: Word); { 8E00:328A }
begin { routine anchor; statement location unresolved } { 8E00:328A }
  local_5 := 0; { 8E00:3298 }
  local_4 := 1; { 8E00:329C }
  while true do { routine anchor; statement location unresolved } { 8E00:328A }
    begin { routine anchor; statement location unresolved } { 8E00:328A }
      uVar2 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 8E00:328A }
      iVar1 := Integer(param_2); { routine anchor; statement location unresolved } { 8E00:328A }
      if (((P_Byte(((iVar1 + Word(local_4)) + $3B)))^ and $7F) = (param_1 and $7F)) then { routine anchor; statement location unresolved } { 8E00:328A }
        begin { routine anchor; statement location unresolved } { 8E00:328A }
          local_5 := local_4; { 8E00:32BD }
        end; { routine anchor; statement location unresolved } { 8E00:328A }
      if (local_4 = 3) then { routine anchor; statement location unresolved } { 8E00:328A }
        Break; { routine anchor; statement location unresolved } { 8E00:328A }
      local_4 := (local_4 + 1); { 8E00:32A2 }
    end; { routine anchor; statement location unresolved } { 8E00:328A }
  if (local_5 <> 0) then { routine anchor; statement location unresolved } { 8E00:328A }
    begin { routine anchor; statement location unresolved } { 8E00:328A }
      (P_Byte(((iVar1 + Word(local_5)) + $3B)))^ := 0; { routine anchor; statement location unresolved } { 8E00:328A }
      (P_ShortInt((iVar1 + $30)))^ := ((P_ShortInt((iVar1 + $30)))^ + -(1)); { routine anchor; statement location unresolved } { 8E00:328A }
      if ((P_Byte((iVar1 + $30)))^ < $D2) then { routine anchor; statement location unresolved } { 8E00:328A }
        begin { routine anchor; statement location unresolved } { 8E00:328A }
          FUN_00ba_1509(iVar1, uVar2, param_3, param_4); { 8E00:32FA }
        end; { routine anchor; statement location unresolved } { 8E00:328A }
    end; { routine anchor; statement location unresolved } { 8E00:328A }
  Exit; { 8E00:3302 }
end; { routine anchor; statement location unresolved } { 8E00:328A }
```

### ov22:331A ReportSpellCast (conf M)

Params (BP stack slots): param_1: Byte [BP+$06]; param_2: LongWord [BP+$08]; param_3: P_Byte [BP+$0C].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; local_12b: array[0..241] of Byte [BP-$129]; local_39: array[0..13] of Byte [BP-$37]; local_2b: array[0..40] of Byte [BP-$29].  
Callers (export): ov22_0C20.  
Callees (export): FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_1816, FUN_03f1_0137, FUN_0709_0626, FUN_0709_0dbe, System.@StrAppend, System.@StrAssign, System.@StrCopy.

```pascal
procedure ReportSpellCast(param_1: Byte; param_2: LongWord; param_3: P_Byte); { 8E00:331A }
begin { routine anchor; statement location unresolved } { 8E00:331A }
  PString(local_2b, SS) := Copy(PString(Integer(param_2), Integer((LongWord(param_2) shr $10))), 1, $28); { 8E00:332F }
  if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 8E00:331A }
    begin { routine anchor; statement location unresolved } { 8E00:331A }
      puVar5 := local_39; { routine anchor; statement location unresolved } { 8E00:331A }
      uVar2 := SS; { routine anchor; statement location unresolved } { 8E00:331A }
      PString(local_39, SS) := 'Casts a Spell'; { 8E00:334B }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 10), puVar5, uVar2, P_Byte(param_3), Slice16(param_3, 2)); { 8E00:3356 }
      FUN_03f1_0137(Pack16(UNKNOWN_extraout_AH_01, $17), Pack16(UNKNOWN_extraout_AH_01, $27), Pack16(UNKNOWN_extraout_AH_01, $17), (Word(UNKNOWN_extraout_AH_01) shl 8)); { 8E00:3367 }
      iVar1 := (Word(UNKNOWN_extraout_AH_02) shl 8); { routine anchor; statement location unresolved } { 8E00:331A }
      uVar2 := Pack16(UNKNOWN_extraout_AH_02, $17); { routine anchor; statement location unresolved } { 8E00:331A }
      uVar3 := Pack16(UNKNOWN_extraout_AH_02, 10); { routine anchor; statement location unresolved } { 8E00:331A }
      puVar5 := local_12b; { routine anchor; statement location unresolved } { 8E00:331A }
      PString(local_12b, SS) := 'Spell:'; { 8E00:3380 }
      PString(local_12b, SS) := Copy(PString(local_12b, SS) + PString(((Word(param_1) * $29) + $28E9), $C7C), 1, 255); { 8E00:3397 }
      FUN_0709_0626(puVar5, SS, uVar3, uVar2, iVar1); { 8E00:339C }
    end; { routine anchor; statement location unresolved } { 8E00:331A }
  else { routine anchor; statement location unresolved } { 8E00:331A }
    begin { routine anchor; statement location unresolved } { 8E00:331A }
      FUN_03f1_0137(Pack16(UNKNOWN_extraout_AH, $16), Pack16(UNKNOWN_extraout_AH, $26), Pack16(UNKNOWN_extraout_AH, $12), Pack16(UNKNOWN_extraout_AH, 1)); { 8E00:33AF }
      FUN_00ba_1816((Word(UNKNOWN_extraout_AH_03) shl 8), Pack16(UNKNOWN_extraout_AH_03, $13), Pack16(UNKNOWN_extraout_AH_03, 1), P_Byte(param_3), Slice16(param_3, 2)); { 8E00:33C3 }
      uVar4 := Byte((((param_3)^ + 2) shr 8)); { routine anchor; statement location unresolved } { 8E00:331A }
      FUN_0709_0626(local_2b, SS, Pack16(uVar4, 10), Pack16(uVar4, $13), ((param_3)^ + 2)); { 8E00:33DE }
      FUN_0709_0626(((Word(param_1) * $29) + $28E9), $C7C, Pack16(UNKNOWN_extraout_AH_04, 10), Pack16(UNKNOWN_extraout_AH_04, $14), Pack16(UNKNOWN_extraout_AH_04, 1)); { 8E00:33FE }
      FUN_0709_0dbe(); { 8E00:3403 }
      FUN_00ba_17e3(); { 8E00:3408 }
    end; { routine anchor; statement location unresolved } { 8E00:331A }
  Exit; { 8E00:3410 }
end; { routine anchor; statement location unresolved } { 8E00:331A }
```

### ov22:3413 InitializeSpellDispatch (conf M)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

Byte-proved callback-table initializer, expanded and resolved in Globals. Segment $0096 is overlay22 stub segment, not a loaded overlay-code address. Table slots0..67 store far pointers. Additional DS:6988 callback points at stub offset015B; role not inferred.

```pascal
procedure InitializeSpellDispatch(); { 8E00:3413 }
begin { routine anchor; statement location unresolved } { 8E00:3413 }
  g_6B84 := $34; { 8E00:341C }
  g_6B86 := $96; { 8E00:341F }
  g_681F := 0; { 8E00:3423 }
  g_6DBF := 0; { 8E00:3428 }
  g_6DB5 := 0; { 8E00:342F }
  g_6DB7 := 0; { 8E00:3432 }
  g_6821 := 1; { 8E00:3435 }
  g_6B88 := $57; { 8E00:3440 }
  g_6B8A := $96; { 8E00:3443 }
  g_6B8C := $5C; { 8E00:344D }
  g_6B8E := $96; { 8E00:3450 }
  g_6B90 := $61; { 8E00:345A }
  g_6B92 := $96; { 8E00:345D }
  g_6B94 := $66; { 8E00:3467 }
  g_6B96 := $96; { 8E00:346A }
  g_6B98 := $6B; { 8E00:3474 }
  g_6B9A := $96; { 8E00:3477 }
  g_6B9C := $70; { 8E00:3481 }
  g_6B9E := $96; { 8E00:3484 }
  g_6BA0 := $70; { 8E00:348E }
  g_6BA2 := $96; { 8E00:3491 }
  g_6BA4 := $75; { 8E00:349B }
  g_6BA6 := $96; { 8E00:349E }
  g_6BA8 := $7A; { 8E00:34A8 }
  g_6BAA := $96; { 8E00:34AB }
  g_6BAC := $7F; { 8E00:34B5 }
  g_6BAE := $96; { 8E00:34B8 }
  g_6BB0 := $6B; { 8E00:34C2 }
  g_6BB2 := $96; { 8E00:34C5 }
  g_6BB4 := $84; { 8E00:34CF }
  g_6BB6 := $96; { 8E00:34D2 }
  g_6BB8 := $89; { 8E00:34DC }
  g_6BBA := $96; { 8E00:34DF }
  g_6BBC := $8E; { 8E00:34E9 }
  g_6BBE := $96; { 8E00:34EC }
  g_6BC0 := $93; { 8E00:34F6 }
  g_6BC2 := $96; { 8E00:34F9 }
  g_6BC4 := $70; { 8E00:3503 }
  g_6BC6 := $96; { 8E00:3506 }
  g_6BC8 := $70; { 8E00:3510 }
  g_6BCA := $96; { 8E00:3513 }
  g_6BCC := $6B; { 8E00:351D }
  g_6BCE := $96; { 8E00:3520 }
  g_6BD0 := $98; { 8E00:352A }
  g_6BD2 := $96; { 8E00:352D }
  g_6BD4 := $9D; { 8E00:3537 }
  g_6BD6 := $96; { 8E00:353A }
  g_6BD8 := $A2; { 8E00:3544 }
  g_6BDA := $96; { 8E00:3547 }
  g_6BDC := $6B; { 8E00:3551 }
  g_6BDE := $96; { 8E00:3554 }
  g_6BE0 := $A7; { 8E00:355E }
  g_6BE2 := $96; { 8E00:3561 }
  g_6BE4 := $AC; { 8E00:356B }
  g_6BE6 := $96; { 8E00:356E }
  g_6BE8 := $B1; { 8E00:3578 }
  g_6BEA := $96; { 8E00:357B }
  g_6BEC := $B6; { 8E00:3585 }
  g_6BEE := $96; { 8E00:3588 }
  g_6BF0 := $BB; { 8E00:3592 }
  g_6BF2 := $96; { 8E00:3595 }
  g_6BF4 := $C0; { 8E00:359F }
  g_6BF6 := $96; { 8E00:35A2 }
  g_6BF8 := $6B; { 8E00:35AC }
  g_6BFA := $96; { 8E00:35AF }
  g_6BFC := $C5; { 8E00:35B9 }
  g_6BFE := $96; { 8E00:35BC }
  g_6C00 := $CA; { 8E00:35C6 }
  g_6C02 := $96; { 8E00:35C9 }
  g_6C04 := $CF; { 8E00:35D3 }
  g_6C06 := $96; { 8E00:35D6 }
  g_6C08 := $D4; { 8E00:35E0 }
  g_6C0A := $96; { 8E00:35E3 }
  g_6C0C := $D9; { 8E00:35ED }
  g_6C0E := $96; { 8E00:35F0 }
  g_6C10 := $DE; { 8E00:35FA }
  g_6C12 := $96; { 8E00:35FD }
  g_6C14 := $E3; { 8E00:3607 }
  g_6C16 := $96; { 8E00:360A }
  g_6C18 := $E8; { 8E00:3614 }
  g_6C1A := $96; { 8E00:3617 }
  g_6C1C := $ED; { 8E00:3621 }
  g_6C1E := $96; { 8E00:3624 }
  g_6C20 := $F2; { 8E00:362E }
  g_6C22 := $96; { 8E00:3631 }
  g_6C24 := $F7; { 8E00:363B }
  g_6C26 := $96; { 8E00:363E }
  g_6C28 := $FC; { 8E00:3648 }
  g_6C2A := $96; { 8E00:364B }
  g_6C2C := $101; { 8E00:3655 }
  g_6C2E := $96; { 8E00:3658 }
  g_6C30 := $4D; { 8E00:3662 }
  g_6C32 := $96; { 8E00:3665 }
  g_6C34 := $106; { 8E00:366F }
  g_6C36 := $96; { 8E00:3672 }
  g_6C38 := $10B; { 8E00:367C }
  g_6C3A := $96; { 8E00:367F }
  g_6C3C := $FC; { 8E00:3689 }
  g_6C3E := $96; { 8E00:368C }
  g_6C40 := $110; { 8E00:3696 }
  g_6C42 := $96; { 8E00:3699 }
  g_6C44 := $115; { 8E00:36A3 }
  g_6C46 := $96; { 8E00:36A6 }
  g_6C48 := $A7; { 8E00:36B0 }
  g_6C4A := $96; { 8E00:36B3 }
  g_6C4C := $C5; { 8E00:36BD }
  g_6C4E := $96; { 8E00:36C0 }
  g_6C50 := $11A; { 8E00:36CA }
  g_6C52 := $96; { 8E00:36CD }
  g_6C54 := $70; { 8E00:36D7 }
  g_6C56 := $96; { 8E00:36DA }
  g_6C58 := $70; { 8E00:36E4 }
  g_6C5A := $96; { 8E00:36E7 }
  g_6C5C := $70; { 8E00:36F1 }
  g_6C5E := $96; { 8E00:36F4 }
  g_6C60 := $11F; { 8E00:36FE }
  g_6C62 := $96; { 8E00:3701 }
  g_6C64 := $124; { 8E00:370B }
  g_6C66 := $96; { 8E00:370E }
  g_6C68 := $129; { 8E00:3718 }
  g_6C6A := $96; { 8E00:371B }
  g_6C6C := $12E; { 8E00:3725 }
  g_6C6E := $96; { 8E00:3728 }
  g_6C70 := $133; { 8E00:3732 }
  g_6C72 := $96; { 8E00:3735 }
  g_6C74 := $138; { 8E00:373F }
  g_6C76 := $96; { 8E00:3742 }
  g_6C78 := $13D; { 8E00:374C }
  g_6C7A := $96; { 8E00:374F }
  g_6C7C := $142; { 8E00:3759 }
  g_6C7E := $96; { 8E00:375C }
  g_6C80 := $147; { 8E00:3766 }
  g_6C82 := $96; { 8E00:3769 }
  g_6C84 := $110; { 8E00:3773 }
  g_6C86 := $96; { 8E00:3776 }
  g_6C88 := $14C; { 8E00:3780 }
  g_6C8A := $96; { 8E00:3783 }
  g_6C8C := $151; { 8E00:378D }
  g_6C8E := $96; { 8E00:3790 }
  g_6C90 := $156; { 8E00:379A }
  g_6C92 := $96; { 8E00:379D }
  g_6988 := $15B; { 8E00:37A7 }
  g_698A := $96; { 8E00:37AA }
  Exit; { 8E00:37AF }
end; { routine anchor; statement location unresolved } { 8E00:3413 }
```

### ov22:37B0 ov22_init (conf H)

Params (BP stack slots): none.  
Locals: none.  
Callers (export): none recorded.  
Callees (export): none recorded.

```pascal
procedure ov22_init(); { 8E00:37B0 }
begin { routine anchor; statement location unresolved } { 8E00:37B0 }
  Exit; { 8E00:37B4 }
end; { routine anchor; statement location unresolved } { 8E00:37B0 }
```

## Screens

Text coordinates are original character-cell arguments, not canvas pixels. Input letters below are actual C/assembly comparisons where stated; general cursor, Escape, lower-case normalization and joystick behavior remain owned by resident/VIEW input helpers. Text fragment occurrence does not imply an independent prompt.

| Flow | Text / position evidence | Accepted input |
| --- | --- | --- |
| Temple outer menu (ov04:0D09) | Heal/View/Take/Pool/Share/Appraise/Exit; mode1. Money-left warning on exit. | H,V,T,P,S,A and exit result; helper may return zero. Exit warning offers ~Yes ~No. |
| Temple service list (09D7) | Actor name + `, how can we help you?` at (1,1), color15; ten nodes from DS:00F1 + i*41, i=1..10. List rectangle arguments include (2,4)-(38,15), full picker ABI provisional. | H or Return (13) selects; result0 exits. Indices0..8 select nine cures,9 exits. |
| Temple confirmation / payment (0013,00BF) | Actor message, `cast cure anyway: `, `<service> will only cost <n> gold pieces.`, `pay for cure `, insufficient/cured messages. | Y proceeds, N/other result fails. Exact prompt positions depend on resident/VIEW helper. |
| Tactical main actions (ov08:031A,0666) | Conditional `Move View Aim Use Cast Turn Quick Done`; Magic On/Off. | M,V,A,U,C,T,Q,D; digit2 toggles magic. Space clears NPC auto flags; byte16 enables quick behavior across actors; minus attempts intervention. These are handler comparisons, not new UI shortcuts. |
| Tactical done / bandage / speed (0E45,0FFF,10F6) | Guard, Delay, Quit, Bandage, Speed, Exit; dying-teammate warning; Continue Battle; GameSpeed/Slower/Faster/Exit. | G,D,Q,B,S and exit according to command branch; Y continues battle. Speed limits and exact keys remain numeric in body. |
| Tactical movement (09DF) | Move/Attack, Move Left; Flee; Blocked; target/guard messages. | Direction/scan codes remain literal numeric branches; not inferred from message text. |
| Spell eligibility and picker (ov15:036C,04A1; ov22:008A) | Cannot cast in area; unfit actor messages; Cast/Memorize/Scribe/Learn and Choose Spell. | Picker/confirmation helper codes remain explicit; no extra hotkeys inferred from the heading. |
| Memorize / Scribe (ov15:05A4,090A,0B5B) | Cleric/Magic-User capacity; confirm these spells; known/already-scribing/cannot-scribe errors. | Confirmation compares N to clear plans; selection indices originate in spell-list helper. |
| Camp spell activities (13F1) | DS:0531 menu plus prompt fragment; Cast,Memorize,Scribe,Display,Rest actions. | C,M,S,D,R handler comparisons. Exit and actor change delegated to menu helper. |
| Effects display (0FBC) | Effect names listed below; `<No Spell Effects>` fallback. | Display list helper owns navigation/exit; keys not independently decoded. |
| Party/order/drop/options (1780,18E5,1A97,1C59) | Party Order, selected-name message, quit/drop/farewell, speed, monsters/portraits toggles. | Alter handler compares M and P; Yes/No confirms drop/quit. Exact menu/cursor mapping remains provisional. |
| Camp (1E6F) | `The party makes camp...` at (1,18),color10; `Camp:` prompt, DS:0508 menu. Saves previous mode then sets2. | S save then quit confirmation, V view, M magic menu, R rest, A alter. Rested/exit guard from pointer argument and set-based loop remains to verify. |
| Spell cast report (ov22:331A) | Combat: actor `Casts a Spell`, `Spell:` + DS name at (0,23),color10. Outside combat: actor display row19 and spell name (1,20),color10. | Notification, no new key implied. |
| Spell/item targeting and abort (0A91,0C20) | Cast Spell on whom; combat-only spell/item, Lose it?/Use it?, casts, Abort Spell?, Spell Aborted. | Explicit confirmations plus target-selection helper. Full cancellation semantics retained in body. |
| Spell outcomes (100F..30D9) | Blessed/Cursed/affected/resistance/charm/sleep/held/cloud/heal/etc messages below; actor prefix supplied by resident message helpers. | Notifications/timing calls; no independent key inferred from fragments. |

| Unit:literal offset | Exact literal | Routine/census reference | Kind |
| --- | --- | --- | --- |
| ov04:0000 | `cast cure anyway: ` | ConfirmCureAnyway | referenced text/menu |
| ov04:0076 | ` will only cost ` | ChargeTempleCure | referenced text/menu |
| ov04:0087 | ` gold pieces.` | ChargeTempleCure | referenced text/menu |
| ov04:0095 | `pay for cure ` | ChargeTempleCure | referenced text/menu |
| ov04:00A3 | `Not enough money.` | ChargeTempleCure | referenced text/menu |
| ov04:00B5 | `is cured.` | ChargeTempleCure | referenced text/menu |
| ov04:022C | `is not blind.` | TempleCureBlindness | referenced text/menu |
| ov04:023A | `Cure Blindness` | TempleCureBlindness | referenced text/menu |
| ov04:02CF | `is not Diseased.` | TempleCureDisease | referenced text/menu |
| ov04:02E0 | `Cure Disease` | TempleCureDisease | referenced text/menu |
| ov04:03C6 | `Cure Light Wounds` | TempleCureWounds | referenced text/menu |
| ov04:03D8 | `Cure Serious Wounds` | TempleCureWounds | referenced text/menu |
| ov04:03EC | `Cure Critical Wounds` | TempleCureWounds | referenced text/menu |
| ov04:04F8 | `is not dead.` | TempleRaiseDead | referenced text/menu |
| ov04:0505 | `Raise Dead` | TempleRaiseDead | referenced text/menu |
| ov04:072E | `is not poisoned.` | TempleNeutralizePoison | referenced text/menu |
| ov04:073F | `Neutralize Poison` | TempleNeutralizePoison | referenced text/menu |
| ov04:081E | `is not cursed.` | TempleRemoveCurse | referenced text/menu |
| ov04:082D | `Remove Curse` | TempleRemoveCurse | referenced text/menu |
| ov04:090A | `is not stoned.` | TempleStoneToFlesh | referenced text/menu |
| ov04:0919 | `Stone to Flesh` | TempleStoneToFlesh | referenced text/menu |
| ov04:09B6 | `, how can we help you?` | TempleHealingMenu | referenced text/menu |
| ov04:09CD | `Heal Exit` | TempleHealingMenu | referenced text/menu |
| ov04:0C3F | `Heal View Take Pool Share Appraise Exit` | TempleMenu | referenced text/menu |
| ov04:0C67 | `Heal View Pool Appraise Exit` | TempleMenu | referenced text/menu |
| ov04:0C85 | `~Yes ~No` | TempleMenu | referenced text/menu |
| ov04:0C8E | `As you leave a priest says, "Excuse me but you have left some money here" ` | TempleMenu | referenced text/menu |
| ov04:0CD9 | `Do you want to go back and retrieve your money?` | TempleMenu | referenced text/menu |
| ov08:02F5 | `Magic On` | PlayerCombatCommands | referenced text/menu |
| ov08:02FE | `Magic Off` | PlayerCombatCommands | referenced text/menu |
| ov08:0308 | `That doesn't work` | PlayerCombatCommands | referenced text/menu |
| ov08:05F9 | `Move ` | CombatActionMenu | referenced text/menu |
| ov08:05FF | `View Aim ` | CombatActionMenu | referenced text/menu |
| ov08:0609 | `Use ` | CombatActionMenu | referenced text/menu |
| ov08:060E | `Cast ` | CombatActionMenu | referenced text/menu |
| ov08:0614 | `Turn ` | CombatActionMenu | referenced text/menu |
| ov08:061A | `Quick Done` | CombatActionMenu | referenced text/menu |
| ov08:064A | ` ` | no static reference | gap candidate; may be non-text |
| ov08:0858 | `Your Teammate is Dying` | EndCombatRound | referenced text/menu |
| ov08:086F | `Continue Battle:` | EndCombatRound | referenced text/menu |
| ov08:09B4 | `Move/Attack, Move Left = ` | CombatMoveAttack | referenced text/menu |
| ov08:09CE | ` ` | no static reference | gap candidate; may be non-text |
| ov08:09D1 | `Flee:` | CombatMoveAttack | referenced text/menu |
| ov08:09D7 | `Blocked` | CombatMoveAttack | referenced text/menu |
| ov08:0D30 | `Not with that weapon` | CheckWeaponCanGuard | referenced text/menu |
| ov08:0DFE | `Guard ` | CombatDoneMenu | referenced text/menu |
| ov08:0E05 | `Delay Quit ` | CombatDoneMenu | referenced text/menu |
| ov08:0E11 | `Bandage ` | CombatDoneMenu | referenced text/menu |
| ov08:0E1A | `Speed Exit` | CombatDoneMenu | referenced text/menu |
| ov08:0FF3 | `is bandaged` | BandageDyingCharacter | referenced text/menu |
| ov08:10CF | `GameSpeed (` | CombatSpeedMenu | referenced text/menu |
| ov08:10DB | `) :` | CombatSpeedMenu | referenced text/menu |
| ov08:10DF | ` ` | no static reference | gap candidate; may be non-text |
| ov08:10E1 | `Slower ` | CombatSpeedMenu | referenced text/menu |
| ov08:10E9 | `Faster ` | CombatSpeedMenu | referenced text/menu |
| ov08:10F1 | `Exit` | CombatSpeedMenu | referenced text/menu |
| ov15:0302 | `cannot cast spells in this area` | CanPerformSpellActivity | referenced text/menu |
| ov15:0322 | `is in no condition to ` | CanPerformSpellActivity | referenced text/menu |
| ov15:0339 | `cast any spells` | CanPerformSpellActivity | referenced text/menu |
| ov15:0349 | `memorize spells` | CanPerformSpellActivity | referenced text/menu |
| ov15:0359 | `scribe any scrolls` | CanPerformSpellActivity | referenced text/menu |
| ov15:0489 | `has no spells memorized` | CampCastMenu | referenced text/menu |
| ov15:056E | ` ` | no static reference | gap candidate; may be non-text |
| ov15:0570 | `can memorize:` | ShowMemorizeCapacity | referenced text/menu |
| ov15:057E | `    Cleric Spells:` | ShowMemorizeCapacity | referenced text/menu |
| ov15:0591 | `Magic-User Spells:` | ShowMemorizeCapacity | referenced text/menu |
| ov15:08BF | `Memorize These Spells? ` | MemorizeMenu | referenced text/menu |
| ov15:08D7 | `cannot memorize any spells` | MemorizeMenu | referenced text/menu |
| ov15:08F2 | `Memorize these spells? ` | MemorizeMenu | referenced text/menu |
| ov15:0AB9 | `Scribe These Spells? ` | ScribeMenu | referenced text/menu |
| ov15:0ACF | `has no copyable scrolls` | ScribeMenu | referenced text/menu |
| ov15:0AE7 | `You already know that spell` | ScribeMenu | referenced text/menu |
| ov15:0B03 | `You are already scibing that spell` | ScribeMenu | referenced text/menu |
| ov15:0B26 | `You can not scribe that spell.` | ScribeMenu | referenced text/menu |
| ov15:0B45 | `Scribe these spells? ` | ScribeMenu | referenced text/menu |
| ov15:0EBE | ` ` | no static reference | gap candidate; may be non-text |
| ov15:0EC0 | `Funky--` | DisplaySpellEffects | referenced text/menu |
| ov15:0EC8 | `Studying Manual of Bodily Health` | DisplaySpellEffects | referenced text/menu |
| ov15:0EE9 | `Training with Manual of Bodily Health` | DisplaySpellEffects | referenced text/menu |
| ov15:0F0F | `Feather Fall` | DisplaySpellEffects | referenced text/menu |
| ov15:0F1C | `Helpless` | DisplaySpellEffects | referenced text/menu |
| ov15:0F25 | `Prayer` | DisplaySpellEffects | referenced text/menu |
| ov15:0F2C | `Cause Disease` | DisplaySpellEffects | referenced text/menu |
| ov15:0F3A | `Dreaded Mummy Disease` | DisplaySpellEffects | referenced text/menu |
| ov15:0F50 | `Repulsed` | DisplaySpellEffects | referenced text/menu |
| ov15:0F59 | `Poisoned` | DisplaySpellEffects | referenced text/menu |
| ov15:0F62 | `Regenerating` | DisplaySpellEffects | referenced text/menu |
| ov15:0F6F | `Fire Resistance` | DisplaySpellEffects | referenced text/menu |
| ov15:0F7F | `Invisible` | DisplaySpellEffects | referenced text/menu |
| ov15:0F89 | `Camouflaged` | DisplaySpellEffects | referenced text/menu |
| ov15:0F95 | `Displaced` | DisplaySpellEffects | referenced text/menu |
| ov15:0F9F | ` <No Spell Effects>` | DisplaySpellEffects | referenced text/menu |
| ov15:0FB3 | `Display` | DisplaySpellEffects | referenced text/menu |
| ov15:1740 | `Party Order: ` | PartyOrderMenu | referenced text/menu |
| ov15:176E | `has been selected` | PartyOrderMenu | referenced text/menu |
| ov15:1877 | `quit TO DOS: ` | CampQuitOrDrop | referenced text/menu |
| ov15:1885 | `will be gone` | CampQuitOrDrop | referenced text/menu |
| ov15:1892 | `Drop from party? ` | CampQuitOrDrop | referenced text/menu |
| ov15:18A4 | `bids you farewell` | CampQuitOrDrop | referenced text/menu |
| ov15:18B6 | `is dumped in a ditch` | CampQuitOrDrop | referenced text/menu |
| ov15:18CB | `Breathes A sigh of relief` | CampQuitOrDrop | referenced text/menu |
| ov15:1A30 | `Game Speed = ` | CampSpeedMenu | referenced text/menu |
| ov15:1A3E | ` (0=fastest 9=slowest)` | CampSpeedMenu | referenced text/menu |
| ov15:1A55 | ` Faster` | CampSpeedMenu | referenced text/menu |
| ov15:1A5D | ` Slower` | CampSpeedMenu | referenced text/menu |
| ov15:1A65 | ` Exit` | CampSpeedMenu | referenced text/menu |
| ov15:1A6B | `Game Speed:` | CampSpeedMenu | referenced text/menu |
| ov15:1C10 | `Alter: ` | AlterOptionsMenu | referenced text/menu |
| ov15:1C18 | `Monsters on  ` | AlterOptionsMenu | referenced text/menu |
| ov15:1C26 | `Monsters off  ` | AlterOptionsMenu | referenced text/menu |
| ov15:1C35 | `Portraits on  ` | AlterOptionsMenu | referenced text/menu |
| ov15:1C44 | `Portraits off  ` | AlterOptionsMenu | referenced text/menu |
| ov15:1C54 | `Exit` | AlterOptionsMenu | referenced text/menu |
| ov15:1E23 | `The party makes camp...` | CampMenu | referenced text/menu |
| ov15:1E5B | `Camp: ` | CampMenu | referenced text/menu |
| ov15:1E62 | `Quit TO DOS ` | CampMenu | referenced text/menu |
| ov22:0000 | `Cast` | ChooseSpell | referenced text/menu |
| ov22:0005 | `Memorize` | ChooseSpell | referenced text/menu |
| ov22:000E | `Scribe` | ChooseSpell | referenced text/menu |
| ov22:0015 | `Learn` | ChooseSpell | referenced text/menu |
| ov22:003B | `Choose Spell: ` | ChooseSpell | referenced text/menu |
| ov22:004A | ` ` | no static reference | gap candidate; may be non-text |
| ov22:0287 | ` *` | no static reference | gap candidate; may be non-text |
| ov22:028A | `  ` | no static reference | gap candidate; may be non-text |
| ov22:0A7E | `Cast Spell on whom` | ChooseSpellTargets | referenced text/menu |
| ov22:0BAE | `is a combat-only spell...` | CastSpellOrUseItem | referenced text/menu |
| ov22:0BC8 | `Lose it? ` | CastSpellOrUseItem | referenced text/menu |
| ov22:0BD2 | `That Item` | CastSpellOrUseItem | referenced text/menu |
| ov22:0BDC | `is a combat-only item...` | CastSpellOrUseItem | referenced text/menu |
| ov22:0BF5 | `Use it? ` | CastSpellOrUseItem | referenced text/menu |
| ov22:0BFE | `casts` | CastSpellOrUseItem | referenced text/menu |
| ov22:0C04 | `Abort Spell? ` | CastSpellOrUseItem | referenced text/menu |
| ov22:0C12 | `Spell Aborted` | CastSpellOrUseItem | referenced text/menu |
| ov22:1004 | `is Blessed` | BlessEffect | referenced text/menu |
| ov22:1036 | `is Cursed` | Fragment_104A | referenced text/menu |
| ov22:10DD | `is affected` | GenericAffectedEffect | referenced text/menu |
| ov22:1116 | `is protected` | ProtectionEffect | referenced text/menu |
| ov22:1150 | `is cold-resistant` | ResistColdEffect | referenced text/menu |
| ov22:11C4 | `is unaffected` | CharmPersonEffect | referenced text/menu |
| ov22:11D2 | `is charmed` | CharmPersonEffect | referenced text/menu |
| ov22:1299 | `is stronger` | EnlargeEffect | referenced text/menu |
| ov22:135D | `has been reduced` | ReduceEffect | referenced text/menu |
| ov22:13CC | `is friendly` | FriendsEffect | referenced text/menu |
| ov22:148D | `is shielded` | ShieldEffect | referenced text/menu |
| ov22:150E | `falls asleep` | SleepEffect | referenced text/menu |
| ov22:1650 | `is held` | HoldPersonEffect | referenced text/menu |
| ov22:17D7 | `is fire resistant` | ResistFireEffect | referenced text/menu |
| ov22:1816 | `is silenced` | Silence15RadiusEffect | referenced text/menu |
| ov22:184F | `is affected` | SlowPoisonEffect | referenced text/menu |
| ov22:1904 | `is charmed` | SnakeCharmEffect | referenced text/menu |
| ov22:1A09 | `is invisible` | InvisibilityEffect | referenced text/menu |
| ov22:1A43 | `Knock-Knock` | KnockEffect | referenced text/menu |
| ov22:1A7C | `is duplicated` | MirrorImageEffect | referenced text/menu |
| ov22:1AC0 | `is weakened` | RayofEnfeeblementEffect | referenced text/menu |
| ov22:1AF9 | `Creates a noxious cloud` | Fragment_1DC1 | referenced text/menu |
| ov22:1F35 | `is stronger` | StrengthEffect | referenced text/menu |
| ov22:2063 | `is animated` | AnimateDeadEffect | referenced text/menu |
| ov22:220F | `can see` | CureBlindnessEffect | referenced text/menu |
| ov22:2254 | `is blind` | CauseBlindnessEffect | referenced text/menu |
| ov22:2340 | `is diseased` | CauseDiseaseEffect | referenced text/menu |
| ov22:2379 | `is affected` | DispelMagicEffect | referenced text/menu |
| ov22:24CB | `is praying` | PrayerEffect | referenced text/menu |
| ov22:251E | `is un-cursed` | RemoveCurseEffect | referenced text/menu |
| ov22:252B | `'s item is un-cursed` | RemoveCurseEffect | referenced text/menu |
| ov22:25F3 | `has been cursed!` | BestowCurseEffect | referenced text/menu |
| ov22:2631 | `is blinking` | BlinkEffect | referenced text/menu |
| ov22:2888 | `is Hasted` | HasteEffect | referenced text/menu |
| ov22:2BFF | `is Slowed` | SlowEffect | referenced text/menu |
| ov22:2C37 | `is restored` | RestorationEffect | referenced text/menu |
| ov22:2DF8 | `is Speedy` | SpeedEffect | referenced text/menu |
| ov22:2E43 | `is Healed` | HealEffect | referenced text/menu |
| ov22:2ED9 | `is stronger` | ov22_2EE5 | referenced text/menu |
| ov22:2F8C | `is paralyzed` | ParalysisEffect | referenced text/menu |
| ov22:2FC6 | `is Healed` | HealOtherEffect | referenced text/menu |
| ov22:301D | `is invisible` | OtherInvisibilityEffect | referenced text/menu |
| ov22:3097 | `is Reading` | ReadingEffect | referenced text/menu |
| ov22:30CF | `Breathes!` | BreathEffect | referenced text/menu |
| ov22:3305 | `Casts a Spell` | ReportSpellCast | referenced text/menu |
| ov22:3313 | `Spell:` | ReportSpellCast | referenced text/menu |

DS menu/list labels read through calculated addresses (exact bytes). Temple source index is **1..10**; picker selection index is **0..9**.

| DS offset | Exact Pascal string | Display site |
| --- | --- | --- |
| 011A | `Cure Blindness` | temple service-list selection 0 |
| 0143 | `Cure Disease` | temple service-list selection 1 |
| 016C | `Cure Light Wounds` | temple service-list selection 2 |
| 0195 | `Cure Serious Wounds` | temple service-list selection 3 |
| 01BE | `Cure Critical Wounds` | temple service-list selection 4 |
| 01E7 | `Neutralize Poison` | temple service-list selection 5 |
| 0210 | `Raise Dead` | temple service-list selection 6 |
| 0239 | `Remove Curse` | temple service-list selection 7 |
| 0262 | `Stone to Flesh` | temple service-list selection 8 |
| 028B | `Exit` | temple service-list selection 9 |
| 0508 | `Save View Magic Rest Alter Exit` | CampMenu |
| 0531 | `Cast Memorize Scribe Display Rest Exit` | SpellActivityMenu |

Spell-name strings read by ChooseSpell/ReportSpellCast (position varies with picker mode; callback relation in Globals):

| Id | DS offset | Exact Pascal spell name |
| --- | --- | --- |
| 1 | 2912 | `Bless` |
| 2 | 293B | `Curse` |
| 3 | 2964 | `Cure Light Wounds` |
| 4 | 298D | `Cause Light Wounds` |
| 5 | 29B6 | `Detect Magic` |
| 6 | 29DF | `Protection From Evil` |
| 7 | 2A08 | `Protection from Good` |
| 8 | 2A31 | `Resist Cold` |
| 9 | 2A5A | `Burning Hands` |
| 10 | 2A83 | `Charm Person` |
| 11 | 2AAC | `Detect Magic` |
| 12 | 2AD5 | `Enlarge` |
| 13 | 2AFE | `Reduce` |
| 14 | 2B27 | `Friends` |
| 15 | 2B50 | `Magic Missile` |
| 16 | 2B79 | `Protection From Evil` |
| 17 | 2BA2 | `Protection From Good` |
| 18 | 2BCB | `Read Magic` |
| 19 | 2BF4 | `Shield` |
| 20 | 2C1D | `Shocking Grasp` |
| 21 | 2C46 | `Sleep` |
| 22 | 2C6F | `Find Traps` |
| 23 | 2C98 | `Hold Person` |
| 24 | 2CC1 | `Resist Fire` |
| 25 | 2CEA | `Silence, 15' Radius` |
| 26 | 2D13 | `Slow Poison` |
| 27 | 2D3C | `Snake Charm` |
| 28 | 2D65 | `Spiritual Hammer` |
| 29 | 2D8E | `Detect Invisibility` |
| 30 | 2DB7 | `Invisibility` |
| 31 | 2DE0 | `Knock` |
| 32 | 2E09 | `Mirror Image` |
| 33 | 2E32 | `Ray of Enfeeblement` |
| 34 | 2E5B | `Stinking Cloud` |
| 35 | 2E84 | `Strength` |
| 36 | 2EAD | `Animate Dead` |
| 37 | 2ED6 | `Cure Blindness` |
| 38 | 2EFF | `Cause Blindness` |
| 39 | 2F28 | `Cure Disease` |
| 40 | 2F51 | `Cause Disease` |
| 41 | 2F7A | `Dispel Magic` |
| 42 | 2FA3 | `Prayer` |
| 43 | 2FCC | `Remove Curse` |
| 44 | 2FF5 | `Bestow Curse` |
| 45 | 301E | `Blink` |
| 46 | 3047 | `Dispel Magic` |
| 47 | 3070 | `Fireball` |
| 48 | 3099 | `Haste` |
| 49 | 30C2 | `Hold Person` |
| 50 | 30EB | `Invisibility, 10' Radius` |
| 51 | 3114 | `Lightning Bolt` |
| 52 | 313D | `Protection From Evil, 10' Radius` |
| 53 | 3166 | `Protection From Good, 10' Radius` |
| 54 | 318F | `Protection From Normal Missiles` |
| 55 | 31B8 | `Slow` |
| 56 | 31E1 | `Restoration` |

## Globals

DS=0C7C. Types below are observed machine access widths; a far-pointer low/high pair is not a 32-bit linear address. Suffix aliases such as g_6C91_3 are normalized to their actual DS offset (6C94); PackedAlias retains unresolved overlapping access width. Known names used by other lanes (SelectedChar, PartyHead, TreasureMoney, ECL memory bases) are cross-referenced, without editing their maps.

| DS offset | Type / inferred name and confidence | Evidence |
| --- | --- | --- |
| 0018 | unknown width; g_0018 (L) | direct/indexed DS operand or decompiler alias |
| 0113 | Byte; g_0113 (L) | direct/indexed DS operand or decompiler alias; 3400:031E, 3400:03A6 |
| 0114 | Byte[6]; DiseaseEffectIds (M) | ov04:02ED loops DS:0114..0119 |
| 25F3 | unknown width; g_25F3 (L) | direct/indexed DS operand or decompiler alias |
| 2618 | Word; g_2618 (L) | direct/indexed DS operand or decompiler alias; 8E00:0E16, 8E00:16E2 |
| 2624 | Word; g_2624 (L) | direct/indexed DS operand or decompiler alias; 8E00:0E0B |
| 262A | Word; g_262A (L) | direct/indexed DS operand or decompiler alias; 8E00:0DFC |
| 2736 | Byte; g_2736 (L) | direct/indexed DS operand or decompiler alias; 8E00:1C49, 8E00:1D12, 8E00:1D30, 8E00:1DE6, 8E00:1E79 |
| 273F | Byte; g_273F (L) | direct/indexed DS operand or decompiler alias; 8E00:1C5E, 8E00:1D4C, 8E00:1D6A, 8E00:1E11, 8E00:1E8F |
| 2744 | Byte; g_2744 (L) | direct/indexed DS operand or decompiler alias; 4800:0C5F, 8E00:1C93, 8E00:28F1, 8E00:2AB5 |
| 28E9 | Pascal string[40] table base (H) | spell name id1..56 at base + id*41; ov22:331A |
| 290D | Byte; g_290D (L) | direct/indexed DS operand or decompiler alias; 8E00:1C3B, 8E00:1D28, 8E00:1D62 |
| 290E | unknown width; g_290E (L) | direct/indexed DS operand or decompiler alias |
| 31FA | Byte, repertoire category (M) | record stride16; RemainingMemorizeSlots; 6B00:02BC, 6B00:0A0C, 6B00:0D1C, 8E00:06D8 |
| 31FB | Byte, spell level (H) | capacity display and CalculateStudyTime; 6B00:0048, 6B00:00C5, 6B00:029A, 6B00:09FC, 6B00:0D0A, 8E00:0314; +3 sites |
| 31FC | Byte, base magnitude / FF sentinel (M) | ov22:0729 and 08C3; 8E00:0763, 8E00:077B, 8E00:09A0 |
| 31FD | Byte, magnitude per caster level (M) | ov22:0729; 8E00:074E, 8E00:078E |
| 31FE | Byte, base duration (M) | ov22:07D6; 8E00:08A9 |
| 31FF | Byte, duration per caster level (M) | ov22:07D6; 8E00:0894 |
| 3200 | Byte, zero-magnitude minimum flag (L) | ov22:0729 coerces zero to1 when set; 8E00:07B2 |
| 3201 | Byte, target mode (M) | ov22:0A91 target dispatch and 0C20 combat-only guard; 8E00:0AD3, 8E00:0C4C |
| 3202 | Byte, saving-throw mode (M) | ov22:08C3 and ov24 damage/effect args; 8E00:0967, 8E00:0A03, 8E00:0A55, 8E00:17AD |
| 3203 | Byte, save category (M) | ov22:08C3 to SavingThrow; 8E00:0985, 8E00:174C |
| 3204 | Byte, effect id (M) | ov22:08C3 to ApplyEffect; 6B00:10D9, 8E00:0A1C, 8E00:0A34, 8E00:1787 |
| 409B | Word; g_409B (L) | direct/indexed DS operand or decompiler alias; 8E00:2D0C, 8E00:2D2C, 8E00:2D78 |
| 409D | Word; g_409D (L) | direct/indexed DS operand or decompiler alias; 8E00:2D03, 8E00:2D30, 8E00:2D7C |
| 4766 | far pointer; spell-choice list head (M) | 059C clears then028D appends; 8E00:01C0, 8E00:01EF, 8E00:0294, 8E00:02A1, 8E00:02BF, 8E00:05A8; +1 sites |
| 4768 | Word; g_4768 (L) | direct/indexed DS operand or decompiler alias; 8E00:01BC, 8E00:01F2, 8E00:0297, 8E00:02A4, 8E00:02C2, 8E00:05AB; +1 sites |
| 476A | Byte[21] choice scratch (M) | 059C clears indices0..20; 8E00:024D, 8E00:0308, 8E00:0444, 8E00:05BE |
| 477F | far pointer[49] scroll-to-choice mapping (M) | 051C clears indices0..48;044E maps scroll per choice; 8E00:0265, 8E00:0504, 8E00:0538 |
| 4781 | Word; g_4781 (L) | direct/indexed DS operand or decompiler alias; 8E00:0269, 8E00:0508, 8E00:053C |
| 4843 | Byte; scroll-choice count (M) | 051C clears,044E increments; 8E00:04F9, 8E00:050C, 8E00:0546 |
| 4844 | Byte; g_4844 (L) | direct/indexed DS operand or decompiler alias; 8E00:12AB, 8E00:1301, 8E00:1531, 8E00:15F7, 8E00:1603, 8E00:191E; +7 sites |
| 4845 | Byte; g_4845 (L) | direct/indexed DS operand or decompiler alias; 8E00:12BD, 8E00:12C8, 8E00:12D3, 8E00:12DE, 8E00:12E9, 8E00:12F4; +15 sites |
| 49D2 | far pointer; ecl_Mem4900 (H) | ECL_VM.md; +1CA spell-restriction flag and +1CC view mode; 4800:074E, 6B00:037D, 8E00:269E |
| 49D6 | Word; g_49D6 (L) | direct/indexed DS operand or decompiler alias; 4800:00ED |
| 49E2 | Byte; speed option (H) | both speed menus; 0 fastest,9 slowest; 4800:112A, 4800:1163, 4800:1192, 4800:1216, 4800:1220, 6B00:1ABD; +8 sites |
| 49F3 | Byte; current mode (M) | temple1, camp2, tactical combat5; 3400:0D0F, 4800:0080, 6B00:1E75, 6B00:1E7B, 6B00:1FC1, 8E00:0839; +7 sites |
| 49F4 | Byte; g_49F4 (L) | direct/indexed DS operand or decompiler alias; 4800:097F |
| 49F5 | Byte; portrait option (M) | ov15:1C59 labels and toggle; 6B00:1D31, 6B00:1DFC, 6B00:1E06 |
| 49F6 | Byte; monsters option (M) | ov15:1C59 labels and toggle; 6B00:1D02, 6B00:1DE9, 6B00:1DF3 |
| 5582 | Byte; g_5582 (L) | direct/indexed DS operand or decompiler alias; 8E00:0489, 8E00:325A, 8E00:3270 |
| 5D92 | Word; SelectedChar offset (H) | every actor-context menu; paired DS:5D94; 3400:0032, 3400:016E, 3400:01FD, 3400:025E, 3400:02B9, 3400:0312; +113 sites |
| 5D94 | Word; SelectedChar segment (H) | paired with5D92; 3400:002E, 3400:016A, 3400:01F9, 3400:025A, 3400:02B5, 3400:030E; +63 sites |
| 5D96 | Word; PartyHead offset (H) | actor list +104/+106; 4800:00B8, 4800:013F, 4800:04EC, 4800:053E, 4800:089A, 4800:1009; +17 sites |
| 5D98 | Word; PartyHead segment (H) | paired with5D96; 4800:00BB, 4800:0142, 4800:04EF, 4800:0541, 4800:089D, 4800:100C; +17 sites |
| 65B9 | Word; g_65B9 (L) | direct/indexed DS operand or decompiler alias; 4800:0BFC, 8E00:1F22, 8E00:26F7, 8E00:2910 |
| 65BB | Word; g_65BB (L) | direct/indexed DS operand or decompiler alias; 4800:0BF8, 8E00:1F1E, 8E00:26FB, 8E00:2914 |
| 66DA | Byte; g_66DA (L) | direct/indexed DS operand or decompiler alias; 8E00:1E01 |
| 66DB | Byte; g_66DB (L) | direct/indexed DS operand or decompiler alias; 8E00:1E2C |
| 66DC | Byte; g_66DC (L) | direct/indexed DS operand or decompiler alias; 8E00:1E41 |
| 6715 | Byte; g_6715 (L) | direct/indexed DS operand or decompiler alias; 8E00:1DCA |
| 6716 | far pointer; combat map/buffer (M) | FreeCombatState frees$4E9 bytes; cloud tiles y*50+x+7; 4800:0045, 4800:0054, 4800:0937, 4800:0944, 8E00:1EA1, 8E00:26C0 |
| 6718 | Byte/Word; g_6718 (L) | direct/indexed DS operand or decompiler alias; 4800:0041, 4800:0057, 8E00:26BC, 8E00:26EB |
| 671A | Byte; g_671A (L) | direct/indexed DS operand or decompiler alias; 8E00:26C9, 8E00:271A |
| 67F4 | 7 LongInt money entries; TreasureMoney (H) | ov04 clears28 bytes; ChargeTempleCure pool valuation |
| 6814 | Byte; g_6814 (L) | direct/indexed DS operand or decompiler alias; 4800:009B, 4800:095C, 4800:0971 |
| 6815 | Byte; g_6815 (L) | direct/indexed DS operand or decompiler alias; 4800:00A2, 4800:0963, 4800:0978 |
| 6818 | Byte; pending damage (H) | COMBAT ov24:1344 and ApplySpellToTargets |
| 6819 | Byte; damage type scratch (M) | ov22:08C3 assigned/reset; 8E00:08E2, 8E00:08EC, 8E00:0A73, 8E00:291E, 8E00:2950 |
| 681B | Byte; CurrentSpellId (H) | ov22:0C20 sets around indexed callback; initialized/reset0; 8E00:0995, 8E00:0EAF, 8E00:0EB2, 8E00:0EC1, 8E00:0F9B, 8E00:0FE5; +55 sites |
| 681F | Byte; suppress effect-removal reporting candidate (L) | temple disease/poison/dead set around removals; exact callback effects unproven; 3400:0386, 3400:03BD, 3400:05AB, 3400:05DC, 3400:07CE, 3400:0815; +5 sites |
| 6820 | Byte; area/special-effect flag (L) | cloud, sleep, fireball, shared target processing; 8E00:0EC6, 8E00:0F68, 8E00:1521, 8E00:1B17, 8E00:2075, 8E00:238B; +4 sites |
| 6821 | Byte; inventory redraw flag (M) | ov22 initializer sets1; COMBAT inventory consumes; 8E00:3435 |
| 6988 | Word; g_6988 (L) | direct/indexed DS operand or decompiler alias; 8E00:37A7 |
| 698A | Word; g_698A (L) | direct/indexed DS operand or decompiler alias; 8E00:37AA |
| 6B00 | unknown width; g_6B00 (L) | direct/indexed DS operand or decompiler alias |
| 6B80 | far pointer; current scroll item (M) | ov22:044E/051C; item +3C..+3E spell bytes; 8E00:026D, 8E00:0479, 8E00:0490, 8E00:0499, 8E00:04B8, 8E00:04D0; +7 sites |
| 6B82 | Word; g_6B82 (L) | direct/indexed DS operand or decompiler alias; 8E00:0270, 8E00:04F5, 8E00:055C, 8E00:0563, 8E00:0569, 8E00:0590 |
| 6B84 | 68 far procedure pointers; SpellCallbacks (H) | 8E00:3413 initializes,0C20 calls index id*4; 4800:006F, 4800:008B, 8E00:0D70, 8E00:0EBD, 8E00:313F, 8E00:341C |
| 6B86 | Word; g_6B86 (L) | direct/indexed DS operand or decompiler alias; 4800:0072, 4800:008E, 8E00:341F |
| 6B88 | Word; g_6B88 (L) | direct/indexed DS operand or decompiler alias; 8E00:3440 |
| 6B8A | Word; g_6B8A (L) | direct/indexed DS operand or decompiler alias; 8E00:3443 |
| 6B8C | Word; g_6B8C (L) | direct/indexed DS operand or decompiler alias; 8E00:344D |
| 6B8E | Word; g_6B8E (L) | direct/indexed DS operand or decompiler alias; 8E00:3450 |
| 6B90 | Word; g_6B90 (L) | direct/indexed DS operand or decompiler alias; 8E00:345A |
| 6B92 | Word; g_6B92 (L) | direct/indexed DS operand or decompiler alias; 8E00:345D |
| 6B94 | Word; g_6B94 (L) | direct/indexed DS operand or decompiler alias; 8E00:3467 |
| 6B96 | Word; g_6B96 (L) | direct/indexed DS operand or decompiler alias; 8E00:346A |
| 6B98 | Word; g_6B98 (L) | direct/indexed DS operand or decompiler alias; 8E00:3474 |
| 6B9A | Word; g_6B9A (L) | direct/indexed DS operand or decompiler alias; 8E00:3477 |
| 6B9C | Word; g_6B9C (L) | direct/indexed DS operand or decompiler alias; 8E00:3481 |
| 6B9E | Word; g_6B9E (L) | direct/indexed DS operand or decompiler alias; 8E00:3484 |
| 6BA0 | Word; g_6BA0 (L) | direct/indexed DS operand or decompiler alias; 8E00:348E |
| 6BA2 | Word; g_6BA2 (L) | direct/indexed DS operand or decompiler alias; 8E00:3491 |
| 6BA4 | Word; g_6BA4 (L) | direct/indexed DS operand or decompiler alias; 8E00:349B |
| 6BA6 | Word; g_6BA6 (L) | direct/indexed DS operand or decompiler alias; 8E00:349E |
| 6BA8 | Word; g_6BA8 (L) | direct/indexed DS operand or decompiler alias; 8E00:34A8 |
| 6BAA | Word; g_6BAA (L) | direct/indexed DS operand or decompiler alias; 8E00:34AB |
| 6BAC | Word; g_6BAC (L) | direct/indexed DS operand or decompiler alias; 8E00:34B5 |
| 6BAE | Word; g_6BAE (L) | direct/indexed DS operand or decompiler alias; 8E00:34B8 |
| 6BB0 | Word; g_6BB0 (L) | direct/indexed DS operand or decompiler alias; 8E00:34C2 |
| 6BB2 | Word; g_6BB2 (L) | direct/indexed DS operand or decompiler alias; 8E00:34C5 |
| 6BB4 | Word; g_6BB4 (L) | direct/indexed DS operand or decompiler alias; 8E00:34CF |
| 6BB6 | Word; g_6BB6 (L) | direct/indexed DS operand or decompiler alias; 8E00:34D2 |
| 6BB8 | Word; g_6BB8 (L) | direct/indexed DS operand or decompiler alias; 8E00:34DC |
| 6BBA | Word; g_6BBA (L) | direct/indexed DS operand or decompiler alias; 8E00:34DF |
| 6BBC | Word; g_6BBC (L) | direct/indexed DS operand or decompiler alias; 8E00:34E9 |
| 6BBE | Word; g_6BBE (L) | direct/indexed DS operand or decompiler alias; 8E00:34EC |
| 6BC0 | Word; g_6BC0 (L) | direct/indexed DS operand or decompiler alias; 8E00:34F6 |
| 6BC2 | Word; g_6BC2 (L) | direct/indexed DS operand or decompiler alias; 8E00:34F9 |
| 6BC4 | Word; g_6BC4 (L) | direct/indexed DS operand or decompiler alias; 8E00:3503 |
| 6BC6 | Word; g_6BC6 (L) | direct/indexed DS operand or decompiler alias; 8E00:3506 |
| 6BC8 | Word; g_6BC8 (L) | direct/indexed DS operand or decompiler alias; 8E00:3510 |
| 6BCA | Word; g_6BCA (L) | direct/indexed DS operand or decompiler alias; 8E00:3513 |
| 6BCC | Word; g_6BCC (L) | direct/indexed DS operand or decompiler alias; 8E00:351D |
| 6BCE | Word; g_6BCE (L) | direct/indexed DS operand or decompiler alias; 8E00:3520 |
| 6BD0 | Word; g_6BD0 (L) | direct/indexed DS operand or decompiler alias; 8E00:352A |
| 6BD2 | Word; g_6BD2 (L) | direct/indexed DS operand or decompiler alias; 8E00:352D |
| 6BD4 | Word; g_6BD4 (L) | direct/indexed DS operand or decompiler alias; 8E00:3537 |
| 6BD6 | Word; g_6BD6 (L) | direct/indexed DS operand or decompiler alias; 8E00:353A |
| 6BD8 | Word; g_6BD8 (L) | direct/indexed DS operand or decompiler alias; 8E00:3544 |
| 6BDA | Word; g_6BDA (L) | direct/indexed DS operand or decompiler alias; 8E00:3547 |
| 6BDC | Word; g_6BDC (L) | direct/indexed DS operand or decompiler alias; 8E00:3551 |
| 6BDE | Word; g_6BDE (L) | direct/indexed DS operand or decompiler alias; 8E00:3554 |
| 6BE0 | Word; g_6BE0 (L) | direct/indexed DS operand or decompiler alias; 8E00:355E |
| 6BE2 | Word; g_6BE2 (L) | direct/indexed DS operand or decompiler alias; 8E00:3561 |
| 6BE4 | Word; g_6BE4 (L) | direct/indexed DS operand or decompiler alias; 8E00:356B |
| 6BE6 | Word; g_6BE6 (L) | direct/indexed DS operand or decompiler alias; 8E00:356E |
| 6BE8 | Word; g_6BE8 (L) | direct/indexed DS operand or decompiler alias; 8E00:3578 |
| 6BEA | Word; g_6BEA (L) | direct/indexed DS operand or decompiler alias; 8E00:357B |
| 6BEC | Word; g_6BEC (L) | direct/indexed DS operand or decompiler alias; 8E00:3585 |
| 6BEE | Word; g_6BEE (L) | direct/indexed DS operand or decompiler alias; 8E00:3588 |
| 6BF0 | Word; g_6BF0 (L) | direct/indexed DS operand or decompiler alias; 8E00:3592 |
| 6BF2 | Word; g_6BF2 (L) | direct/indexed DS operand or decompiler alias; 8E00:3595 |
| 6BF4 | Word; g_6BF4 (L) | direct/indexed DS operand or decompiler alias; 8E00:359F |
| 6BF6 | Word; g_6BF6 (L) | direct/indexed DS operand or decompiler alias; 8E00:35A2 |
| 6BF8 | Word; g_6BF8 (L) | direct/indexed DS operand or decompiler alias; 8E00:35AC |
| 6BFA | Word; g_6BFA (L) | direct/indexed DS operand or decompiler alias; 8E00:35AF |
| 6BFC | Word; g_6BFC (L) | direct/indexed DS operand or decompiler alias; 8E00:35B9 |
| 6BFE | Word; g_6BFE (L) | direct/indexed DS operand or decompiler alias; 8E00:35BC |
| 6C00 | Word; g_6C00 (L) | direct/indexed DS operand or decompiler alias; 8E00:35C6 |
| 6C02 | Word; g_6C02 (L) | direct/indexed DS operand or decompiler alias; 8E00:35C9 |
| 6C04 | Word; g_6C04 (L) | direct/indexed DS operand or decompiler alias; 8E00:35D3 |
| 6C06 | Word; g_6C06 (L) | direct/indexed DS operand or decompiler alias; 8E00:35D6 |
| 6C08 | Word; g_6C08 (L) | direct/indexed DS operand or decompiler alias; 8E00:35E0 |
| 6C0A | Word; g_6C0A (L) | direct/indexed DS operand or decompiler alias; 8E00:35E3 |
| 6C0C | Word; g_6C0C (L) | direct/indexed DS operand or decompiler alias; 8E00:35ED |
| 6C0E | Word; g_6C0E (L) | direct/indexed DS operand or decompiler alias; 8E00:35F0 |
| 6C10 | Word; g_6C10 (L) | direct/indexed DS operand or decompiler alias; 8E00:35FA |
| 6C12 | Word; g_6C12 (L) | direct/indexed DS operand or decompiler alias; 8E00:35FD |
| 6C14 | Word; g_6C14 (L) | direct/indexed DS operand or decompiler alias; 8E00:3607 |
| 6C16 | Word; g_6C16 (L) | direct/indexed DS operand or decompiler alias; 8E00:360A |
| 6C18 | Word; g_6C18 (L) | direct/indexed DS operand or decompiler alias; 8E00:3614 |
| 6C1A | Word; g_6C1A (L) | direct/indexed DS operand or decompiler alias; 8E00:3617 |
| 6C1C | Word; g_6C1C (L) | direct/indexed DS operand or decompiler alias; 8E00:3621 |
| 6C1E | Word; g_6C1E (L) | direct/indexed DS operand or decompiler alias; 8E00:3624 |
| 6C20 | Word; g_6C20 (L) | direct/indexed DS operand or decompiler alias; 8E00:362E |
| 6C22 | Word; g_6C22 (L) | direct/indexed DS operand or decompiler alias; 8E00:3631 |
| 6C24 | Word; g_6C24 (L) | direct/indexed DS operand or decompiler alias; 8E00:363B |
| 6C26 | Word; g_6C26 (L) | direct/indexed DS operand or decompiler alias; 8E00:363E |
| 6C28 | Word; g_6C28 (L) | direct/indexed DS operand or decompiler alias; 8E00:3648 |
| 6C2A | Word; g_6C2A (L) | direct/indexed DS operand or decompiler alias; 8E00:364B |
| 6C2C | Word; g_6C2C (L) | direct/indexed DS operand or decompiler alias; 8E00:3655 |
| 6C2E | Word; g_6C2E (L) | direct/indexed DS operand or decompiler alias; 8E00:3658 |
| 6C30 | Word; g_6C30 (L) | direct/indexed DS operand or decompiler alias; 8E00:3662 |
| 6C32 | Word; g_6C32 (L) | direct/indexed DS operand or decompiler alias; 8E00:3665 |
| 6C34 | Word; g_6C34 (L) | direct/indexed DS operand or decompiler alias; 8E00:366F |
| 6C36 | Word; g_6C36 (L) | direct/indexed DS operand or decompiler alias; 8E00:3672 |
| 6C38 | Word; g_6C38 (L) | direct/indexed DS operand or decompiler alias; 8E00:367C |
| 6C3A | Word; g_6C3A (L) | direct/indexed DS operand or decompiler alias; 8E00:367F |
| 6C3C | Word; g_6C3C (L) | direct/indexed DS operand or decompiler alias; 8E00:3689 |
| 6C3E | Word; g_6C3E (L) | direct/indexed DS operand or decompiler alias; 8E00:368C |
| 6C40 | Word; g_6C40 (L) | direct/indexed DS operand or decompiler alias; 8E00:3696 |
| 6C42 | Word; g_6C42 (L) | direct/indexed DS operand or decompiler alias; 8E00:3699 |
| 6C44 | Word; g_6C44 (L) | direct/indexed DS operand or decompiler alias; 8E00:36A3 |
| 6C46 | Word; g_6C46 (L) | direct/indexed DS operand or decompiler alias; 8E00:36A6 |
| 6C48 | Word; g_6C48 (L) | direct/indexed DS operand or decompiler alias; 8E00:36B0 |
| 6C4A | Word; g_6C4A (L) | direct/indexed DS operand or decompiler alias; 8E00:36B3 |
| 6C4C | Word; g_6C4C (L) | direct/indexed DS operand or decompiler alias; 8E00:36BD |
| 6C4E | Word; g_6C4E (L) | direct/indexed DS operand or decompiler alias; 8E00:36C0 |
| 6C50 | Word; g_6C50 (L) | direct/indexed DS operand or decompiler alias; 8E00:36CA |
| 6C52 | Word; g_6C52 (L) | direct/indexed DS operand or decompiler alias; 8E00:36CD |
| 6C54 | Word; g_6C54 (L) | direct/indexed DS operand or decompiler alias; 8E00:36D7 |
| 6C56 | Word; g_6C56 (L) | direct/indexed DS operand or decompiler alias; 8E00:36DA |
| 6C58 | Word; g_6C58 (L) | direct/indexed DS operand or decompiler alias; 8E00:36E4 |
| 6C5A | Word; g_6C5A (L) | direct/indexed DS operand or decompiler alias; 8E00:36E7 |
| 6C5C | Word; g_6C5C (L) | direct/indexed DS operand or decompiler alias; 8E00:36F1 |
| 6C5E | Word; g_6C5E (L) | direct/indexed DS operand or decompiler alias; 8E00:36F4 |
| 6C60 | Word; g_6C60 (L) | direct/indexed DS operand or decompiler alias; 8E00:36FE |
| 6C62 | Word; g_6C62 (L) | direct/indexed DS operand or decompiler alias; 8E00:3701 |
| 6C64 | Word; g_6C64 (L) | direct/indexed DS operand or decompiler alias; 8E00:370B |
| 6C66 | Word; g_6C66 (L) | direct/indexed DS operand or decompiler alias; 8E00:370E |
| 6C68 | Word; g_6C68 (L) | direct/indexed DS operand or decompiler alias; 8E00:3718 |
| 6C6A | Word; g_6C6A (L) | direct/indexed DS operand or decompiler alias; 8E00:371B |
| 6C6C | Word; g_6C6C (L) | direct/indexed DS operand or decompiler alias; 8E00:3725 |
| 6C6E | Word; g_6C6E (L) | direct/indexed DS operand or decompiler alias; 8E00:3728 |
| 6C70 | Word; g_6C70 (L) | direct/indexed DS operand or decompiler alias; 8E00:3732 |
| 6C72 | Word; g_6C72 (L) | direct/indexed DS operand or decompiler alias; 8E00:3735 |
| 6C74 | Word; g_6C74 (L) | direct/indexed DS operand or decompiler alias; 8E00:373F |
| 6C76 | Word; g_6C76 (L) | direct/indexed DS operand or decompiler alias; 8E00:3742 |
| 6C78 | Word; g_6C78 (L) | direct/indexed DS operand or decompiler alias; 8E00:374C |
| 6C7A | Word; g_6C7A (L) | direct/indexed DS operand or decompiler alias; 8E00:374F |
| 6C7C | Word; g_6C7C (L) | direct/indexed DS operand or decompiler alias; 8E00:3759 |
| 6C7E | Word; g_6C7E (L) | direct/indexed DS operand or decompiler alias; 8E00:375C |
| 6C80 | Word; g_6C80 (L) | direct/indexed DS operand or decompiler alias; 8E00:3766 |
| 6C82 | Word; g_6C82 (L) | direct/indexed DS operand or decompiler alias; 8E00:3769 |
| 6C84 | Word; g_6C84 (L) | direct/indexed DS operand or decompiler alias; 8E00:3773 |
| 6C86 | Word; g_6C86 (L) | direct/indexed DS operand or decompiler alias; 8E00:3776 |
| 6C88 | Word; g_6C88 (L) | direct/indexed DS operand or decompiler alias; 8E00:3780 |
| 6C8A | Word; g_6C8A (L) | direct/indexed DS operand or decompiler alias; 8E00:3783 |
| 6C8C | Word; g_6C8C (L) | direct/indexed DS operand or decompiler alias; 8E00:378D |
| 6C8E | Word; g_6C8E (L) | direct/indexed DS operand or decompiler alias; 8E00:3790 |
| 6C90 | Word; g_6C90 (L) | direct/indexed DS operand or decompiler alias; 8E00:379A |
| 6C91 | Word; g_6C91 (L) | direct/indexed DS operand or decompiler alias; 8E00:0936, 8E00:094E, 8E00:0B49, 8E00:0B5C, 8E00:0B77, 8E00:0B91; +18 sites |
| 6C92 | Word; g_6C92 (L) | direct/indexed DS operand or decompiler alias; 8E00:379D |
| 6C93 | Word; g_6C93 (L) | direct/indexed DS operand or decompiler alias; 8E00:093A, 8E00:0952, 8E00:0B4D, 8E00:0B95, 8E00:0FB4, 8E00:0FD9; +11 sites |
| 6C94 | Byte; SpellTargetCount (H) | set1 by0A91; loops in08C3; decompiler g_6C91_3 alias; 8E00:08EF, 8E00:0913, 8E00:0ABC, 8E00:0B14, 8E00:0B3E, 8E00:0B51; +18 sites |
| 6C95 | far pointer array, target1 (H) | target i at DS:6C91+4*i; first low6C95/high6C97; 3400:08FA, 8E00:0AB5, 8E00:0B0E, 8E00:0B29, 8E00:107B, 8E00:109B; +40 sites |
| 6C97 | Word; target1 segment (H) | paired6C95; 3400:08FD, 8E00:0AB8, 8E00:0B11, 8E00:0B2C, 8E00:1077, 8E00:1097; +35 sites |
| 6DB5 | far pointer; remembered spell-target actor candidate (M) | 0A91 initialized from SelectedChar and restored; camp clears; 6B00:04B2, 6B00:1FB8, 8E00:0A97, 8E00:0AA7, 8E00:0B03, 8E00:0B22; +1 sites |
| 6DB7 | Word; g_6DB7 (L) | direct/indexed DS operand or decompiler alias; 6B00:04B5, 6B00:1FBB, 8E00:0A9A, 8E00:0AAA, 8E00:0B06, 8E00:0B25; +1 sites |
| 6DB9 | Byte; target center X (M) | cloud node+10 and combat map writes; 8E00:0DBE, 8E00:0E27, 8E00:1C17, 8E00:1C50, 8E00:1D19, 8E00:1DED; +19 sites |
| 6DBA | Byte; target center Y (M) | cloud node+11 and map offset y*50+x; 8E00:0DC2, 8E00:0E2B, 8E00:1C21, 8E00:1C65, 8E00:1D53, 8E00:1E18; +19 sites |
| 6DBB | far pointer; cloud list head (H) | 19-byte nodes, next+4/+6; ov22:1B11,ov08:0000; 4800:0006, 4800:000F, 4800:0025, 4800:0038, 8E00:1B2C, 8E00:1B39; +3 sites |
| 6DBD | Word; g_6DBD (L) | direct/indexed DS operand or decompiler alias; 4800:0009, 4800:0021, 4800:003B, 8E00:1B2F, 8E00:1B3C, 8E00:1B4E; +2 sites |
| 6DBF | Byte; item-cast level override flag (M) | 0729 explicitly substitutes level6;07D6 calls FUN_00ba_26c2; 8E00:072F, 8E00:0C56, 8E00:0D36, 8E00:0E9C, 8E00:0F15, 8E00:3428 |
| 6DC0 | Byte; g_6DC0 (L) | direct/indexed DS operand or decompiler alias; 3400:0D37 |
| 6DC2 | unknown width; g_6DC2 (L) | direct/indexed DS operand or decompiler alias |
| 6DC4 | Word; g_6DC4 (L) | direct/indexed DS operand or decompiler alias; 6B00:07FA |
| 6DC6 | Word; g_6DC6 (L) | direct/indexed DS operand or decompiler alias; 6B00:07EC |
| 6DC8 | Word; g_6DC8 (L) | direct/indexed DS operand or decompiler alias; 6B00:07D4, 6B00:07DA |
| 6DD8 | Word; g_6DD8 (L) | direct/indexed DS operand or decompiler alias; 6B00:1E82 |
| 6DE3 | Byte; g_6DE3 (L) | direct/indexed DS operand or decompiler alias; 4800:0891, 8E00:30DF |
| 6E30 | Byte; g_6E30 (L) | direct/indexed DS operand or decompiler alias; 4800:04A7, 4800:04B1, 4800:04B4 |
| 6E31 | unknown width; g_6E31 (L) | direct/indexed DS operand or decompiler alias |
| 6E36 | unknown width; g_6E36 (L) | direct/indexed DS operand or decompiler alias |
| 70C6 | unknown width; g_70C6 (L) | direct/indexed DS operand or decompiler alias |

Spell callback table decoded from the initializer. Entry0 is a target-selection helper, not a named spell. Names1..56 come from the initialized DS name table; ids57..67 remain internal/unnamed here. Stub targets resolve via ov22 FBOV entries (segment0096).

| Id | DS callback | Stub pointer | Resolved routine | Spell-name evidence | Store offset |
| --- | --- | --- | --- | --- | --- |
| 0 | 6B84 | 0096:0034 | 8E00:0A91 ChooseSpellTargets | target selection | 8E00:341C |
| 1 | 6B88 | 0096:0057 | 8E00:100F BlessEffect | `Bless` | 8E00:3440 |
| 2 | 6B8C | 0096:005C | 8E00:1040 CurseEffect | `Curse` | 8E00:344D |
| 3 | 6B90 | 0096:0061 | 8E00:106B CureLightWoundsEffect | `Cure Light Wounds` | 8E00:345A |
| 4 | 6B94 | 0096:0066 | 8E00:10A7 CauseLightWoundsEffect | `Cause Light Wounds` | 8E00:3467 |
| 5 | 6B98 | 0096:006B | 8E00:10E9 GenericAffectedEffect | `Detect Magic` | 8E00:3474 |
| 6 | 6B9C | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection From Evil` | 8E00:3481 |
| 7 | 6BA0 | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection from Good` | 8E00:348E |
| 8 | 6BA4 | 0096:0075 | 8E00:1162 ResistColdEffect | `Resist Cold` | 8E00:349B |
| 9 | 6BA8 | 0096:007A | 8E00:1190 BurningHandsEffect | `Burning Hands` | 8E00:34A8 |
| 10 | 6BAC | 0096:007F | 8E00:11DD CharmPersonEffect | `Charm Person` | 8E00:34B5 |
| 11 | 6BB0 | 0096:006B | 8E00:10E9 GenericAffectedEffect | `Detect Magic` | 8E00:34C2 |
| 12 | 6BB4 | 0096:0084 | 8E00:12A5 EnlargeEffect | `Enlarge` | 8E00:34CF |
| 13 | 6BB8 | 0096:0089 | 8E00:136E ReduceEffect | `Reduce` | 8E00:34DC |
| 14 | 6BBC | 0096:008E | 8E00:13D8 FriendsEffect | `Friends` | 8E00:34E9 |
| 15 | 6BC0 | 0096:0093 | 8E00:1439 MagicMissileEffect | `Magic Missile` | 8E00:34F6 |
| 16 | 6BC4 | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection From Evil` | 8E00:3503 |
| 17 | 6BC8 | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection From Good` | 8E00:3510 |
| 18 | 6BCC | 0096:006B | 8E00:10E9 GenericAffectedEffect | `Read Magic` | 8E00:351D |
| 19 | 6BD0 | 0096:0098 | 8E00:1499 ShieldEffect | `Shield` | 8E00:352A |
| 20 | 6BD4 | 0096:009D | 8E00:14C7 ShockingGraspEffect | `Shocking Grasp` | 8E00:3537 |
| 21 | 6BD8 | 0096:00A2 | 8E00:151B SleepEffect | `Sleep` | 8E00:3544 |
| 22 | 6BDC | 0096:006B | 8E00:10E9 GenericAffectedEffect | `Find Traps` | 8E00:3551 |
| 23 | 6BE0 | 0096:00A7 | 8E00:1658 HoldPersonEffect | `Hold Person` | 8E00:355E |
| 24 | 6BE4 | 0096:00AC | 8E00:17E9 ResistFireEffect | `Resist Fire` | 8E00:356B |
| 25 | 6BE8 | 0096:00B1 | 8E00:1822 Silence15RadiusEffect | `Silence, 15' Radius` | 8E00:3578 |
| 26 | 6BEC | 0096:00B6 | 8E00:185B SlowPoisonEffect | `Slow Poison` | 8E00:3585 |
| 27 | 6BF0 | 0096:00BB | 8E00:190F SnakeCharmEffect | `Snake Charm` | 8E00:3592 |
| 28 | 6BF4 | 0096:00C0 | 8E00:19C3 SpiritualHammerEffect | `Spiritual Hammer` | 8E00:359F |
| 29 | 6BF8 | 0096:006B | 8E00:10E9 GenericAffectedEffect | `Detect Invisibility` | 8E00:35AC |
| 30 | 6BFC | 0096:00C5 | 8E00:1A16 InvisibilityEffect | `Invisibility` | 8E00:35B9 |
| 31 | 6C00 | 0096:00CA | 8E00:1A4F KnockEffect | `Knock` | 8E00:35C6 |
| 32 | 6C04 | 0096:00CF | 8E00:1A8A MirrorImageEffect | `Mirror Image` | 8E00:35D3 |
| 33 | 6C08 | 0096:00D4 | 8E00:1ACC RayofEnfeeblementEffect | `Ray of Enfeeblement` | 8E00:35E0 |
| 34 | 6C0C | 0096:00D9 | 8E00:1B11 StinkingCloudEffect | `Stinking Cloud` | 8E00:35ED |
| 35 | 6C10 | 0096:00DE | 8E00:1F41 StrengthEffect | `Strength` | 8E00:35FA |
| 36 | 6C14 | 0096:00E3 | 8E00:206F AnimateDeadEffect | `Animate Dead` | 8E00:3607 |
| 37 | 6C18 | 0096:00E8 | 8E00:2217 CureBlindnessEffect | `Cure Blindness` | 8E00:3614 |
| 38 | 6C1C | 0096:00ED | 8E00:225D CauseBlindnessEffect | `Cause Blindness` | 8E00:3621 |
| 39 | 6C20 | 0096:00F2 | 8E00:232F CureDiseaseEffect | `Cure Disease` | 8E00:362E |
| 40 | 6C24 | 0096:00F7 | 8E00:234C CauseDiseaseEffect | `Cause Disease` | 8E00:363B |
| 41 | 6C28 | 0096:00FC | 8E00:2385 DispelMagicEffect | `Dispel Magic` | 8E00:3648 |
| 42 | 6C2C | 0096:0101 | 8E00:24D6 PrayerEffect | `Prayer` | 8E00:3655 |
| 43 | 6C30 | 0096:004D | 8E00:2540 RemoveCurseEffect | `Remove Curse` | 8E00:3662 |
| 44 | 6C34 | 0096:0106 | 8E00:2604 BestowCurseEffect | `Bestow Curse` | 8E00:366F |
| 45 | 6C38 | 0096:010B | 8E00:263D BlinkEffect | `Blink` | 8E00:367C |
| 46 | 6C3C | 0096:00FC | 8E00:2385 DispelMagicEffect | `Dispel Magic` | 8E00:3689 |
| 47 | 6C40 | 0096:0110 | 8E00:266B FireballEffect | `Fireball` | 8E00:3696 |
| 48 | 6C44 | 0096:0115 | 8E00:2892 HasteEffect | `Haste` | 8E00:36A3 |
| 49 | 6C48 | 0096:00A7 | 8E00:1658 HoldPersonEffect | `Hold Person` | 8E00:36B0 |
| 50 | 6C4C | 0096:00C5 | 8E00:1A16 InvisibilityEffect | `Invisibility, 10' Radius` | 8E00:36BD |
| 51 | 6C50 | 0096:011A | 8E00:2BB7 LightningBoltEffect | `Lightning Bolt` | 8E00:36CA |
| 52 | 6C54 | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection From Evil, 10' Radius` | 8E00:36D7 |
| 53 | 6C58 | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection From Good, 10' Radius` | 8E00:36E4 |
| 54 | 6C5C | 0096:0070 | 8E00:1123 ProtectionEffect | `Protection From Normal Missiles` | 8E00:36F1 |
| 55 | 6C60 | 0096:011F | 8E00:2C09 SlowEffect | `Slow` | 8E00:36FE |
| 56 | 6C64 | 0096:0124 | 8E00:2C43 RestorationEffect | `Restoration` | 8E00:370B |
| 57 | 6C68 | 0096:0129 | 8E00:2E02 SpeedEffect | unnamed internal slot | 8E00:3718 |
| 58 | 6C6C | 0096:012E | 8E00:2E4D HealEffect | unnamed internal slot | 8E00:3725 |
| 59 | 6C70 | 0096:0133 | 8E00:2EE5 ov22_2EE5 | unnamed internal slot | 8E00:3732 |
| 60 | 6C74 | 0096:0138 | 8E00:2F4D ov22_2F4D | unnamed internal slot | 8E00:373F |
| 61 | 6C78 | 0096:013D | 8E00:2F99 ParalysisEffect | unnamed internal slot | 8E00:374C |
| 62 | 6C7C | 0096:0142 | 8E00:2FD0 HealOtherEffect | unnamed internal slot | 8E00:3759 |
| 63 | 6C80 | 0096:0147 | 8E00:302A OtherInvisibilityEffect | unnamed internal slot | 8E00:3766 |
| 64 | 6C84 | 0096:0110 | 8E00:266B FireballEffect | unnamed internal slot | 8E00:3773 |
| 65 | 6C88 | 0096:014C | 8E00:3058 ov22_3058 | unnamed internal slot | 8E00:3780 |
| 66 | 6C8C | 0096:0151 | 8E00:3092 ov22_3092 | unnamed internal slot | 8E00:378D |
| 67 | 6C90 | 0096:0156 | 8E00:30A2 ReadingEffect | unnamed internal slot | 8E00:379A |

Spell metadata record: DS:31FA + id*16. Byte offsets0/1 categorize repertoire/level; +2/+3 magnitude base/per-level; +4/+5 duration base/per-level; +6 zero-magnitude minimum flag; +7 target mode; +8 save behavior; +9 saving-throw category; +A effect id. These field meanings are M except spell-level usage H; bytes+B..+F remain unassigned here. Values are bytes; signed sentinel interpretation is performed by the consuming routine, not the table reader.

SelectedActor is a semantic far-pointer alias for DS:5D92/+5D94; ByteAt/WordAt/FarPtrAt(actor,offset) use that far segment. The generic exported SelectedChar symbol is its low word.

Actor record crossrefs (relative, **not DS globals**): memorization bytes+17..+2B; setup hours+2C; known spell bytes+33..+6A (loop limits vary by activity); capacity grid+B1+3*repertoire+level; inventory count+C7/list+C8/+CA; effect list+7F/+81; next actor+104/+106; combat record pointer+108; status+10C; active+10D; side/AI flags+10E/+10F; current HP+11B; max HP+32; constitution+14; levels+96..+9D. Name confidence M; retain exact differing loop bounds in bodies. Scroll items use spell bytes+3C..+3E and next-item far pointer+2A/+2C.

## Unknowns

Assembly-reviewed source-level replacements (28): 3400:0401, 6B00:0159, 6B00:019C, 6B00:025C, 6B00:036C, 6B00:077A, 6B00:0824, 8E00:0729, 8E00:07D6, 8E00:08C3, 8E00:1040, 8E00:104A, 8E00:10E9, 8E00:1123, 8E00:1162, 8E00:1499, 8E00:17E9, 8E00:1822, 8E00:1A16, 8E00:1A4F, 8E00:1ACC, 8E00:225D, 8E00:234C, 8E00:2604, 8E00:263D, 8E00:2F99, 8E00:302A, 8E00:30A2. Other bodies remain annotated first-pass decompiler transcriptions. Runtime flags, string temporaries and all entry-only anchors remain explicit verification work.


- Coverage: 131 exported candidates, 4 unit initializers, 0 parser failures. Eight ov22 entries lack a prologue: seven frame fragments/shared tails and one rejected overlapping entry1D70. Export boundaries are not asserted native Pascal procedure boundaries.
- 1D70 is inside MOV DX,AX at1D6F; no ROL-based game mechanic is inferred. Fragments104A/150D inherit the Curse/Shocking Grasp frames; 1C31/1CF4/1DAA/1DBE/1DC1 inherit the Stinking Cloud frame1B11. Native JMPs are represented as gotos where identified; full cloud CFG stitching remains a verifier task.
- Initial transcription: 859 matched calls, 3894 routine-only location anchors including structure/register temporaries, 29 unmatched call expressions. Repeated-occurrence matches and pure decompiler expressions still need source-location recovery.
- Dataflow: 14 membership calls need CPU-flag consumer reconstruction; 608 unresolved register references retained; unsupported AST expressions: 0. Those are generation counters before the 28 assembly-reviewed replacements. Final artifact counts: 3449 routine-only anchors, 542 unresolved register references, 15 explicit membership-flag writes.
- Runtime unknown names encountered: 0: none. Known arithmetic helpers with implicit registers and mismatched argument prototypes are separate dataflow unknowns, not newly named runtime routines.
- Static evidence: 68 callback entries resolved; 56 exact spell names; 179 unit literal/string candidates including gap-only rows. Global census includes 228 direct/indexed bases or exported aliases; that is not a proven record count.
- Global aliases/PackedAlias types, split far-pointer segments and Pascal argument order remain provisional. Callback target identity is H from byte stores/stubs, but source-body behavior needs independent review. Metadata records for unnamed slots57..67 are retained numerically.
- Screen unknowns: full picker/window ABI, dynamic effect names from tables, positions not directly cited, complete joystick/lower-case normalization, control-key meaning and conditional command availability. Literal gap candidates are not asserted screens.
- Gameplay unknowns: exact cloud overlap/tile restoration CFG, all effect callback semantics, default uninitialized locals in unsupported branches, item/monster spell names57..67, source compiler version, and effect-time units where callers do not establish them. No gate/build claim.

Input snapshot SHA-256 (read-only; other lanes may regenerate exports):

| Input | SHA-256 |
| --- | --- |
| decode/listings/ov04.lst | c32b7fb1db703202149ca1685a095868feb85bd5581ed57d7fcb910659dd257f |
| decode/listings/ov04.c | 7df0de38b5c8590d24f5d630f7ea33abed70f8c0bdbb5b5a8e6c166cd6913561 |
| decode/listings/ov08.lst | 6b13da0752295f1ab53c81843bde2e6ce94bd14b06c88f2d3aa76373af1a5619 |
| decode/listings/ov08.c | e230c6a0ab7f3345e7f4e76c3cf6ac36eb142bbef92bb11bf3995b1f8d760bdb |
| decode/listings/ov15.lst | 1afac620ea9f7ffa4f114c07094c4ebbe438cd8bc689acd98a4488869bd908e1 |
| decode/listings/ov15.c | 7f500dde0edbf47b7c40803eb7b965155b7ab36d7f4e335c7a5e7cd97df4fefa |
| decode/listings/ov22.lst | 308c8c40ae7409b815ffb2623df7c21ec0c4d204636dc7755fe6e1706f82fd3e |
| decode/listings/ov22.c | 9ca255a82b9ec9ca97b666a1c5bd0e0a97984474003a727f81ef6bcc5dabe887 |

Repository commit at read: `3342fb984d769f836ca1dbb2f4e1b5774d92d379`. RT_LEDGER re-read before completion; ECL_VM.md was consulted for cross-area caller/context meanings, not used as a substitute for spell disassembly.
