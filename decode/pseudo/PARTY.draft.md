# PARTY — Pascal-style first draft

215 routines across ov12, ov00, ov01, ov02, ov06, ov11, ov16, ov17, ov20 and ov21. This includes every assigned ov12 routine, including effect/monster-ability callbacks, beyond the provisional training label. First draft for independent verification; control-flow and ABI uncertainties remain explicit.

## Evidence and notation

Committed listing snapshot `4f729c811a0b0d8d2362f3f573fd2b383239e40c`; immutable `.c`/`.lst` pairs avoid concurrent export changes. Original GAME.OVR bytes provide strings; instruction starts are decoded from listing bytes with Capstone. Read FOREMAN.md, LAYOUT.md, INDEX.md, RT_LEDGER.md and ECL_VM.md. Cross-references: decode/data/SAVES.md, decode/data/ITEMS.md and decode/ecl/ECL_VM.md; bodies below retain local evidence where interpretations differ.

| Unit | Routines | C SHA-256 | Listing SHA-256 |
| --- | --- | --- | --- |
| ov12 | 127 | 50960ef18546c88643b3a16c4f1eba7986292c9034756f50a85efe55bf5a6de3 | a787359b7c3f1de71c7ea4e54f07e15379e30f16cd109dd1870c2f15d489e357 |
| ov00 | 2 | 074353dafeafc990eab51a455bd47ebc166f20b18d74d47ada9aaf70a289b321 | b244d2ea6c6b6b1e89ec814ae6a090982c6e4a91335d5fb4b27b2fecc3b872c6 |
| ov01 | 4 | ab9fbfdc58917a50c39ac957555a49bee7f005b52dcc5f95870ba660a0fc10c1 | fc78fc01bec4ecb7410f418d345a0ec278a761a543445a55a82b8bc6a8ca9027 |
| ov02 | 2 | d35e7b453a89537aed978a41536fe2735ccfa7abe0cc1963f94ad7abd60244bf | 1baacad1283af0a6adadff1dc9414b7f78fc9dc90adf926c041fae179951e130 |
| ov06 | 5 | c230333d58c6cae5031e4d06a0f15a74d62f7d4bff72a81d73214989b808ebf0 | 67c212d86f9aeb4c9e6a4525c20d2dfdc8aaecd13b11043e0075b2fc4bbf9b7d |
| ov11 | 2 | 891d9c6e4a4c3afe86f64d3b53039f53f5984d9b0c1ac792dc7e49d54e8ab106 | f3497db2a593d2b61d490cffb31da95748d185df928cb7a5d58bf8d45ce793af |
| ov16 | 22 | 4ea362be654458f36f931e3ec7fec65b003b5c32e694d3dd7984c4061f4251bc | fcd342d100c45c52f2e8dcd2471ab92afca87b714b2142a3782e38e3f5ab5876 |
| ov17 | 14 | 5277e914ba24ba6bd727c3a49150d1477b40d1c43c6f74c681595fa41ceb45e7 | 26f89cd95398c654da9a253d55e219832d547e25b0c34302bbe89e91f8a5a7b1 |
| ov20 | 15 | 15e09b6d38820831ffb3f0d0358501a33baa4885c97b9e1d6bbe0a55c83b64d0 | 50f97fb862522a366264989dcff8924218ca65fe0461e32fb5193c12e0445b5a |
| ov21 | 22 | aaacb5ec91aa4c13fa6167d24ac24c634fe9b7bb88a1d23bba0ca9563538bea5 | 799e108edadb0b1ba5bb1891d6bccdb56e069c5e5a6350eea0341fca8547309e |

Confidence concerns the inferred role/name, not proof of complete semantic equivalence. Numeric pointer accesses preserve unresolved packed records. Original identifiers remain in calls for listing cross-reference.

Params use decompiler ABI order, not original Pascal formal order. BP access inventories give signed hexadecimal byte offsets and access widths. `local_N` is an entry-SP name: in a conventional PUSH BP frame its BP displacement is 2-N. `in_stack_*`, `UNK_in_*`, `UNK_unaff_*` and `UNK_extraout_*` retain unresolved input/SSA state; callbacks can have stack arguments even when their exported C prototype says void. ov16:1156/14A7/1551/2033 have shared-parent-frame evidence; their standalone declarations below are inventory placeholders, not independent callable Pascal procedures.

A trailing `region anchor, exact origin unknown` marks only a nearby proven instruction region; it does not claim exact statement provenance. Unqualified anchors match a call, store, return or port operation. Resolve all region-only mappings before finalization. `Ptr<T>`, `MemByte/Word/Far`, `BPWord/BPAddr`, `FarPtr(segment,offset)`, `ExtractBytes`, `Seq`, `PackedSet` and `IfThenElseLazy` are pseudocode primitives. `Seq` evaluates left-to-right; `and then`/`or else` short-circuit. `PString` is a length-prefixed string lvalue. Hidden runtime output pointers remain `UNK_hidden_string_result`; different occurrences are not necessarily the same destination.

All g_XXXX are DS=0C7C offsets. Named exported globals and DAT_10BF aliases are normalized back to these offsets; alias displacement is +4430h. String-shaped C symbols used numerically become numeric addresses. Runtime string copy/append, sets, I/O and Random are rendered as Pascal operations. Non-runtime calls retain the ABI argument view. Unrecovered runtime calls retain RT_segment_offset. Ghidra CS values following far calls are unproven; raw caller CS is the overlay segment.

FLAGS warning: Boolean SSA temporaries after CompareStrFlags or set operations may be decompiler artifacts. Their expanded branches are L until checked against Jcc; do not implement stale uninitialized Boolean values literally. For ov02:00FD the intended verified branch contract is equality succeeds, mismatch displays Sorry and retries, third mismatch exits; the expanded body preserves remaining ABI artifacts. Runtime correction: 0AF8:1593 is FilePos, not FileSize (15DA queries current, end, restores current; 15AA selects end). Shared runtime files are unchanged.

## ov12

### ov12:0000 ClearPendingCombatState (conf M)

Original `FUN_5c00_0000`. Params (ABI order): param_1: ShortInt.
BP access inventory (hex offset:byte widths): +6:1.
Locals/SSA temporaries: none.
Callers: FUN_5c00_2915,ov12_09C0,ov12_1490,ov12_2556,ov12_2992,ov12_29B6,ov12_29CB,ov12_29D9,ov12_29F0,ov12_2A11,ov12_2DE4,ov12_2E08.
Callees (listing): none.

Clears g_6817/g_6818 conditionally. Evidence: decode/listings/ov12.lst at 5C00:0000, paired .c.

```pascal
procedure FUN_5c00_0000(param_1: ShortInt);
begin
  if ((param_1 = $0) or else (g_6817 = param_1)) then begin { 5C00:0000; region anchor, exact origin unknown }
    g_6818 := 0; { 5C00:0011 }
    g_6817 := $0; { 5C00:0016 }
  end; { 5C00:0016; region anchor, exact origin unknown }
  Exit; { 5C00:001C }
end;
```

### ov12:001F CreateEffectWhenEnabled (conf M)

Original `FUN_5c00_001f`. Params (ABI order): param_1: Word; param_2: Byte; param_3: Byte; param_4: Word; param_5: Word.
BP access inventory (hex offset:byte widths): -1:1, +6:2, +8:1, +A:1, +C:2, +E:2.
Locals/SSA temporaries: in_AX: Word; uVar1: Byte; extraout_AH: Byte; bVar2: Boolean.
Callers: ov12_05EB,ov12_10DE,ov12_1168,ov12_12FB,ov12_1399,ov12_14EB,ov12_19D9,ov12_2866.
Callees (listing): stub_ov24_e10.

Guards ov24 effect creation with g_681F. Evidence: decode/listings/ov12.lst at 5C00:001F, paired .c.

```pascal
function FUN_5c00_001f(param_1: Word; param_2: Byte; param_3: Byte; param_4: Word; param_5: Word): Word;
begin
  uVar1 := Byte((Word(UNK_in_AX) shr 8)); { 5C00:001F; region anchor, exact origin unknown }
  bVar2 := (g_681F = $0); { 5C00:001F; region anchor, exact origin unknown }
  if bVar2 then begin { 5C00:001F; region anchor, exact origin unknown }
    stub_ov24_e10(MakeWord(uVar1, 1), MakeWord(uVar1, param_2), param_1, MakeWord(uVar1, param_3), param_4, param_5); { 5C00:004A }
    uVar1 := UNK_extraout_AH; { 5C00:004A; region anchor, exact origin unknown }
  end; { 5C00:004A; region anchor, exact origin unknown }
  Exit(MakeWord(uVar1, bVar2)); { 5C00:0055 }
end;
```

### ov12:0058 ApplyIncapacitatingStatus (conf M)

Original `FUN_5c00_0058`. Params (ABI order): param_1: LongWord; param_2: Byte; param_3: LongWord.
BP access inventory (hex offset:byte widths): -29:2, +6:2, +A:1, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; unaff_SS: Word; local_2b: array[0..41-1] of Byte.
Callers: FUN_5c00_1545,FUN_5c00_2122,ov12_0775,ov12_0B1B,ov12_1399,ov12_1CAD,ov12_2610.
Callees (listing): System.@StrAssign, FUN_00ba_16ec, stub_ov24_e13, stub_ov24_e3, stub_ov31_e17, FUN_0709_0dbe, FUN_00ba_17e3, FUN_00ba_0767.

Checks existing status 6/7/8; sets inactive, HP zero, dispatches removal/message/display work. Evidence: decode/listings/ov12.lst at 5C00:0058, paired .c.

```pascal
procedure FUN_5c00_0058(param_1: LongWord; param_2: Byte; param_3: LongWord);
begin
  PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))), 1, $28); { 5C00:006C }
  FUN_00ba_16ec((Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 10), local_2b, UNK_unaff_SS, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:0082 }
  cVar1 := (Ptr<ShortInt>((SmallInt(param_3) + $10C)))^; { 5C00:0082; region anchor, exact origin unknown }
  if (((cVar1 <> $7) and then (cVar1 <> $6)) and then (cVar1 <> $8)) then begin { 5C00:0082; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(param_3) + $10C)))^ := param_2; { 5C00:0082; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(param_3) + $10D)))^ := 0; { 5C00:0082; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(param_3) + $11B)))^ := 0; { 5C00:0082; region anchor, exact origin unknown }
    stub_ov24_e13(SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:00C0 }
    stub_ov24_e3(SmallInt(param_3), ExtractBytes(param_3, 2, 2), MakeWord(UNK_extraout_AH_00, $D)); { 5C00:00CE }
    if ((Ptr<ShortInt>((SmallInt(param_3) + $10D)))^ = $0) then begin { 5C00:00CE; region anchor, exact origin unknown }
      stub_ov31_e17(SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:00E4 }
    end; { 5C00:00E4; region anchor, exact origin unknown }
    FUN_0709_0dbe(); { 5C00:00E9 }
    FUN_00ba_17e3(); { 5C00:00EE }
    if (g_49F3 <> $5) then begin { 5C00:00EE; region anchor, exact origin unknown }
      FUN_00ba_0767(g_5D92, g_5D94); { 5C00:0102 }
    end; { 5C00:0102; region anchor, exact origin unknown }
  end; { 5C00:0102; region anchor, exact origin unknown }
  Exit; { 5C00:010A }
end;
```

### ov12:010D RaiseCombatModifiers (conf M)

Original `ov12_010D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Adds 5 to g_6825 and 1 to g_6822. Evidence: decode/listings/ov12.lst at 5C00:010D, paired .c.

```pascal
procedure ov12_010D();
begin
  g_6825 := (g_6825 + $5); { 5C00:0110 }
  g_6822 := (g_6822 + $1); { 5C00:0115 }
  Exit; { 5C00:011A }
end;
```

### ov12:011D RestoreCombatModifiers (conf M)

Original `ov12_011D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Undoes combat modifier with clamp. Evidence: decode/listings/ov12.lst at 5C00:011D, paired .c.

```pascal
procedure ov12_011D();
begin
  if (g_6825 < 5) then begin { 5C00:011D; region anchor, exact origin unknown }
    g_6825 := $0; { 5C00:0127 }
  end else begin { 5C00:0127; region anchor, exact origin unknown }
    g_6825 := (g_6825 - 5); { 5C00:012E }
  end; { 5C00:012E; region anchor, exact origin unknown }
  g_6822 := (g_6822 + (-1)); { 5C00:0133 }
  Exit; { 5C00:0138 }
end;
```

### ov12:013B ov12_013B (conf L)

Original `ov12_013B`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: LongWord; iVar3: SmallInt; uVar4: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:013B, paired .c.

```pascal
procedure ov12_013B();
begin
  uVar2 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:013B; region anchor, exact origin unknown }
  uVar4 := Word((LongWord(uVar2) shr $10)); { 5C00:013B; region anchor, exact origin unknown }
  iVar3 := SmallInt(uVar2); { 5C00:013B; region anchor, exact origin unknown }
  iVar1 := (Ptr<SmallInt>((iVar3 + 10)))^; { 5C00:013B; region anchor, exact origin unknown }
  uVar4 := (Ptr<Word>((iVar3 + $C)))^; { 5C00:013B; region anchor, exact origin unknown }
  g_6826 := MakeLong(uVar4, iVar1); { 5C00:014E }
  if ((Ptr<ShortInt>((iVar1 + $9F)))^ = $4) then begin { 5C00:014E; region anchor, exact origin unknown }
    g_6822 := (g_6822 + $2); { 5C00:0161 }
    g_6818 := (g_6818 + $2); { 5C00:0166 }
  end; { 5C00:0166; region anchor, exact origin unknown }
  Exit; { 5C00:016C }
end;
```

### ov12:017F StartTrainingEffect (conf M)

Original `ov12_017F`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -10:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; unaff_SS: Word; in_stack_0000000a: Word; in_stack_0000000c: Word; puVar1: ^Byte; uVar2: Word; uVar3: Word; local_12: array[0..16-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec, stub_ov24_e10.

Message starts to train; installs timed effect, not evidence of the training-hall menu. Evidence: decode/listings/ov12.lst at 5C00:017F, paired .c.

```pascal
procedure ov12_017F();
begin
  puVar1 := local_12; { 5C00:017F; region anchor, exact origin unknown }
  uVar2 := UNK_in_stack_0000000a; { 5C00:017F; region anchor, exact origin unknown }
  uVar3 := UNK_in_stack_0000000c; { 5C00:017F; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$10))) := 'starts to train'; { 5C00:0195 }
  FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar1, UNK_unaff_SS, uVar2, uVar3); { 5C00:01A0 }
  stub_ov24_e10($A801, $A8FF, $A8C0, MakeWord(UNK_extraout_AH_00, 7), UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:01B8 }
  Exit; { 5C00:01C0 }
end;
```

### ov12:01C3 ov12_01C3 (conf L)

Original `ov12_01C3`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1:1, +C:2.
Locals/SSA temporaries: cVar1: ShortInt; iVar2: SmallInt; uVar3: LongWord; iVar4: SmallInt; uVar5: Word; in_stack_0000000a: LongWord; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:01C3, paired .c.

```pascal
procedure ov12_01C3();
begin
  uVar3 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:01C3; region anchor, exact origin unknown }
  uVar5 := Word((LongWord(uVar3) shr $10)); { 5C00:01C3; region anchor, exact origin unknown }
  iVar4 := SmallInt(uVar3); { 5C00:01C3; region anchor, exact origin unknown }
  iVar2 := (Ptr<SmallInt>((iVar4 + 10)))^; { 5C00:01C3; region anchor, exact origin unknown }
  uVar5 := (Ptr<Word>((iVar4 + $C)))^; { 5C00:01C3; region anchor, exact origin unknown }
  g_6826 := MakeLong(uVar5, iVar2); { 5C00:01D9 }
  cVar1 := (Ptr<ShortInt>((iVar2 + $9F)))^; { 5C00:01D9; region anchor, exact origin unknown }
  if (cVar1 = $A) then begin { 5C00:01D9; region anchor, exact origin unknown }
    local_3 := $1; { 5C00:01ED }
  end else begin { 5C00:01ED; region anchor, exact origin unknown }
    if ((cVar1 = $9) or else (cVar1 = $C)) then begin { 5C00:01ED; region anchor, exact origin unknown }
      local_3 := $2; { 5C00:01FB }
    end else begin { 5C00:01FB; region anchor, exact origin unknown }
      if (cVar1 = $4) then begin { 5C00:01FB; region anchor, exact origin unknown }
        local_3 := $3; { 5C00:0205 }
      end else begin { 5C00:0205; region anchor, exact origin unknown }
        local_3 := $0; { 5C00:020B }
      end; { 5C00:020B; region anchor, exact origin unknown }
    end; { 5C00:020B; region anchor, exact origin unknown }
  end; { 5C00:020B; region anchor, exact origin unknown }
  g_6822 := (g_6822 + local_3); { 5C00:0212 }
  g_6818 := (g_6818 + local_3); { 5C00:0219 }
  g_6819 := 9; { 5C00:021D }
  Exit; { 5C00:0225 }
end;
```

### ov12:0233 IncreaseConstitution (conf M)

Original `ov12_0233`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -E:2, -3:1, -2:1, -1:1, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; unaff_SS: Word; iStack000a: SmallInt; uStack000c: Word; puVar1: ^Byte; iVar2: SmallInt; uVar3: Word; local_10: array[0..11-1] of Byte; local_5: ShortInt; local_4: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec, stub_ov24_e10.

Message is hardier; character +14 changes, HP adjustment and effect $3E. Evidence: decode/listings/ov12.lst at 5C00:0233, paired .c.

```pascal
procedure ov12_0233();
begin
  puVar1 := local_10; { 5C00:0233; region anchor, exact origin unknown }
  iVar2 := iStack000a; { 5C00:0233; region anchor, exact origin unknown }
  uVar3 := uStack000c; { 5C00:0233; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$E))) := 'is hardier'; { 5C00:0249 }
  FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar1, UNK_unaff_SS, iVar2, uVar3); { 5C00:0254 }
  (Ptr<ShortInt>((iStack000a + $14)))^ := ((Ptr<ShortInt>((iStack000a + $14)))^ + $1); { 5C00:0254; region anchor, exact origin unknown }
  if ((Ptr<Byte>((iStack000a + $14)))^ < $14) then begin { 5C00:0254; region anchor, exact origin unknown }
    local_4 := 0; { 5C00:029F }
    if ($E < (Ptr<Byte>((iStack000a + $14)))^) then begin { 5C00:029F; region anchor, exact origin unknown }
      local_5 := $0; { 5C00:02B0 }
      while true do begin { 5C00:02B0; region anchor, exact origin unknown }
        if ($0 < (Ptr<ShortInt>(((iStack000a + local_5) + $96)))^) then begin { 5C00:02B0; region anchor, exact origin unknown }
          if (local_5 = $2) then begin { 5C00:02B0; region anchor, exact origin unknown }
            local_4 := (local_4 + (((Ptr<ShortInt>((iStack000a + $14)))^ + (-$F)) * (Ptr<ShortInt>((iStack000a + $98)))^)); { 5C00:02EF }
          end else begin { 5C00:02EF; region anchor, exact origin unknown }
            if ((Ptr<Byte>((iStack000a + $14)))^ < $10) then begin { 5C00:02EF; region anchor, exact origin unknown }
              local_4 := (local_4 + (Ptr<ShortInt>(((iStack000a + local_5) + $96)))^); { 5C00:030F }
            end else begin { 5C00:030F; region anchor, exact origin unknown }
              local_4 := (local_4 + ((Ptr<ShortInt>(((iStack000a + local_5) + $96)))^ * $2)); { 5C00:0322 }
            end; { 5C00:0322; region anchor, exact origin unknown }
          end; { 5C00:0322; region anchor, exact origin unknown }
        end; { 5C00:0322; region anchor, exact origin unknown }
        if (local_5 = $7) then begin { 5C00:0322; region anchor, exact origin unknown }
          Break; { 5C00:0322; region anchor, exact origin unknown }
        end; { 5C00:0322; region anchor, exact origin unknown }
        local_5 := (local_5 + $1); { 5C00:02B6 }
      end; { 5C00:02B6; region anchor, exact origin unknown }
      if (local_4 = 0) then begin { 5C00:02B6; region anchor, exact origin unknown }
        local_4 := 1; { 5C00:0331 }
      end; { 5C00:0331; region anchor, exact origin unknown }
      local_4 := (Byte(((Ptr<ShortInt>((iStack000a + $32)))^ - (Ptr<ShortInt>((iStack000a + $B1)))^)) div local_4); { 5C00:0331; region anchor, exact origin unknown }
      if (((Ptr<Byte>((iStack000a + $14)))^ < $11) or else ($0 < (Ptr<ShortInt>((iStack000a + $98)))^)) then begin { 5C00:0331; region anchor, exact origin unknown }
        (Ptr<ShortInt>((iStack000a + $32)))^ := ((Ptr<ShortInt>((iStack000a + $32)))^ + local_4); { 5C00:0331; region anchor, exact origin unknown }
        (Ptr<ShortInt>((iStack000a + $11B)))^ := ((Ptr<ShortInt>((iStack000a + $11B)))^ + local_4); { 5C00:0331; region anchor, exact origin unknown }
      end; { 5C00:0331; region anchor, exact origin unknown }
    end; { 5C00:0331; region anchor, exact origin unknown }
  end else begin { 5C00:0331; region anchor, exact origin unknown }
    stub_ov24_e10(1, $FF, $3C, MakeWord(UNK_extraout_AH_00, $3E), iStack000a, uStack000c); { 5C00:027D }
  end; { 5C00:027D; region anchor, exact origin unknown }
  Exit; { 5C00:0374 }
end;
```

### ov12:0377 ProtectionAgainstEvilModifier (conf M)

Original `ov12_0377`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Alignment values 2/5/8 gate defense changes. Evidence: decode/listings/ov12.lst at 5C00:0377, paired .c.

```pascal
procedure ov12_0377();
begin
  uVar2 := Word((LongWord(g_5D92) shr $10)); { 5C00:0377; region anchor, exact origin unknown }
  iVar1 := SmallInt(g_5D92); { 5C00:0377; region anchor, exact origin unknown }
  if ((((Ptr<ShortInt>((iVar1 + $A0)))^ = $2) or else ((Ptr<ShortInt>((iVar1 + $A0)))^ = $5)) or else ((Ptr<ShortInt>((iVar1 + $A0)))^ = $8)) then begin { 5C00:0377; region anchor, exact origin unknown }
    g_6816 := (g_6816 + $2); { 5C00:039E }
    g_6822 := (g_6822 + (-2)); { 5C00:03A3 }
  end; { 5C00:03A3; region anchor, exact origin unknown }
  Exit; { 5C00:03A9 }
end;
```

### ov12:03AC ProtectionAgainstGoodModifier (conf M)

Original `ov12_03AC`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Alignment values 0/3/6 gate defense changes. Evidence: decode/listings/ov12.lst at 5C00:03AC, paired .c.

```pascal
procedure ov12_03AC();
begin
  uVar2 := Word((LongWord(g_5D92) shr $10)); { 5C00:03AC; region anchor, exact origin unknown }
  iVar1 := SmallInt(g_5D92); { 5C00:03AC; region anchor, exact origin unknown }
  if ((((Ptr<ShortInt>((iVar1 + $A0)))^ = $0) or else ((Ptr<ShortInt>((iVar1 + $A0)))^ = $3)) or else ((Ptr<ShortInt>((iVar1 + $A0)))^ = $6)) then begin { 5C00:03AC; region anchor, exact origin unknown }
    g_6816 := (g_6816 + $2); { 5C00:03D3 }
    g_6822 := (g_6822 + (-2)); { 5C00:03D8 }
  end; { 5C00:03D8; region anchor, exact origin unknown }
  Exit; { 5C00:03DE }
end;
```

### ov12:03E1 ConditionalDamageModifier (conf M)

Original `ov12_03E1`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

g_6819 bit 1 gates halving g_6818 and adding 3 to g_6816. Evidence: decode/listings/ov12.lst at 5C00:03E1, paired .c.

```pascal
procedure ov12_03E1();
begin
  if ((g_6819 and 2) <> 0) then begin { 5C00:03E1; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:03F4 }
    g_6816 := (g_6816 + $3); { 5C00:03F7 }
  end; { 5C00:03F7; region anchor, exact origin unknown }
  Exit; { 5C00:03FD }
end;
```

### ov12:0400 ChangeOrRestoreCombatSide (conf M)

Original `ov12_0400`. Params (ABI order): param_1: ShortInt; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): +6:1, +8:2, +C:2.
Locals/SSA temporaries: iVar1: SmallInt; iVar2: SmallInt; uVar3: Word; uVar4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_23db.

Effect flags retain old side; character +10E/+10F and combat target updated. Evidence: decode/listings/ov12.lst at 5C00:0400, paired .c.

```pascal
procedure ov12_0400(param_1: ShortInt; param_2: LongWord; param_3: LongWord);
begin
  iVar2 := SmallInt(param_2); { 5C00:0400; region anchor, exact origin unknown }
  uVar4 := Word((LongWord(param_2) shr $10)); { 5C00:0400; region anchor, exact origin unknown }
  iVar1 := SmallInt(param_3); { 5C00:0400; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(param_3) shr $10)); { 5C00:0400; region anchor, exact origin unknown }
  if (param_1 = $0) then begin { 5C00:0400; region anchor, exact origin unknown }
    if (((Ptr<Byte>((iVar2 + 3)))^ and $20) = 0) then begin { 5C00:0400; region anchor, exact origin unknown }
      (Ptr<ShortInt>((iVar2 + 3)))^ := (((Ptr<ShortInt>((iVar2 + 3)))^ + $20) + ((Ptr<ShortInt>((iVar1 + $10E)))^ * $40)); { 5C00:0400; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar1 + $10E)))^ := ((Ptr<Byte>((iVar2 + 3)))^ shr 7); { 5C00:0400; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar1 + $10F)))^ := 1; { 5C00:0400; region anchor, exact origin unknown }
      if ((Ptr<Byte>((iVar1 + $84)))^ < $80) then begin { 5C00:0400; region anchor, exact origin unknown }
        (Ptr<Byte>((iVar1 + $84)))^ := $B3; { 5C00:0400; region anchor, exact origin unknown }
      end; { 5C00:0400; region anchor, exact origin unknown }
      uVar4 := Word((LongWord((Ptr<LongWord>((iVar1 + $108)))^) shr $10)); { 5C00:0400; region anchor, exact origin unknown }
      iVar2 := SmallInt((Ptr<LongWord>((iVar1 + $108)))^); { 5C00:0400; region anchor, exact origin unknown }
      (Ptr<Word>((iVar2 + 10)))^ := 0; { 5C00:0400; region anchor, exact origin unknown }
      (Ptr<Word>((iVar2 + $C)))^ := 0; { 5C00:0400; region anchor, exact origin unknown }
      FUN_00ba_23db(); { 5C00:04AC }
    end; { 5C00:04AC; region anchor, exact origin unknown }
    g_6825 := 100; { 5C00:04B1 }
  end else begin { 5C00:04B1; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar1 + $10E)))^ := (((Ptr<Byte>((iVar2 + 3)))^ and $40) shr 6); { 5C00:04B1; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((iVar1 + $84)))^ = (-$4D)) then begin { 5C00:04B1; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar1 + $84)))^ := 0; { 5C00:04B1; region anchor, exact origin unknown }
    end; { 5C00:04B1; region anchor, exact origin unknown }
  end; { 5C00:04B1; region anchor, exact origin unknown }
  Exit; { 5C00:04B7 }
end;
```

### ov12:04BA RestoreStrengthEffect (conf M)

Original `ov12_04BA`. Params (ABI order): param_1: Word; param_2: ^ShortInt; param_3: LongWord.
BP access inventory (hex offset:byte widths): -C:2, -A:2, -8:2, -6:2, -4:1, -3:1, -2:1/2, -1:1/2, +8:2, +A:2, +C:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Byte; pcVar3: ^ShortInt; iVar4: SmallInt; iVar5: SmallInt; uVar6: Word; unaff_SS: Word; local_e: LongWord; local_a: LongWord; local_6: Byte; local_5: Byte; local_4: Byte; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e17, stub_ov24_e16.

Strength +10 and exceptional strength +16; competes with effects $12/$26. Evidence: decode/listings/ov12.lst at 5C00:04BA, paired .c.

```pascal
procedure ov12_04BA(param_1: Word; param_2: ^ShortInt; param_3: LongWord);
begin
  iVar5 := SmallInt((LongWord(param_2) shr $10)); { 5C00:04BA; region anchor, exact origin unknown }
  pcVar3 := Ptr<ShortInt>(param_2); { 5C00:04BA; region anchor, exact origin unknown }
  if (Byte(pcVar3[3]) < $80) then begin { 5C00:04BA; region anchor, exact origin unknown }
    stub_ov24_e17(@local_4, UNK_unaff_SS, @local_3, UNK_unaff_SS, pcVar3, iVar5); { 5C00:04DD }
    uVar6 := Word((LongWord(param_3) shr $10)); { 5C00:04DD; region anchor, exact origin unknown }
    iVar4 := SmallInt(param_3); { 5C00:04DD; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar4 + $10)))^ := local_3; { 5C00:04DD; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar4 + $16)))^ := local_4; { 5C00:04DD; region anchor, exact origin unknown }
    local_e := Ptr<ShortInt>($0); { 5C00:04F8 }
    local_5 := 0; { 5C00:04FE }
    local_6 := 0; { 5C00:0502 }
    local_a := Ptr<ShortInt>(MakeLong((Ptr<Word>((iVar4 + $81)))^, Ptr<ShortInt>((Ptr<Word>((iVar4 + $7F)))^))); { 5C00:0512 }
    while true do begin { 5C00:0512; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>(local_a) = Ptr<ShortInt>($0)) and then (ExtractBytes(local_a, 2, 2) = 0)) then begin { 5C00:0512; region anchor, exact origin unknown }
        Break; { 5C00:0512; region anchor, exact origin unknown }
      end; { 5C00:0512; region anchor, exact origin unknown }
      if (((((local_a)^ = $C) or else ((local_a)^ = $26)) and then ((ExtractBytes(local_a, 2, 2) <> iVar5) or else (Ptr<ShortInt>(local_a) <> pcVar3))) and then Seq(stub_ov24_e17(@local_4, UNK_unaff_SS, @local_3, UNK_unaff_SS, Ptr<ShortInt>(local_a), ExtractBytes(local_a, 2, 2)), ((local_5 < local_3) or else ((local_5 = $12) and then (local_6 < local_4))))) then begin { 5C00:0552 }
        local_5 := local_3; { 5C00:0570 }
        local_6 := local_4; { 5C00:0576 }
        local_e := local_a; { 5C00:057F }
      end; { 5C00:057F; region anchor, exact origin unknown }
      local_a := Ptr<ShortInt>(MakeLong((Ptr<Word>((Ptr<ShortInt>(local_a) + 7)))^, (Ptr<^ShortInt>((Ptr<ShortInt>(local_a) + 5)))^)); { 5C00:0590 }
    end; { 5C00:0590; region anchor, exact origin unknown }
    if ((Word(Ptr<ShortInt>(local_e)) or ExtractBytes(local_e, 2, 2)) <> 0) then begin { 5C00:0590; region anchor, exact origin unknown }
      uVar2 := Byte(((Word(Ptr<ShortInt>(local_e)) or ExtractBytes(local_e, 2, 2)) shr 8)); { 5C00:0590; region anchor, exact origin unknown }
      cVar1 := stub_ov24_e16(MakeWord(uVar2, (Ptr<Byte>((iVar4 + $16)))^), MakeWord(uVar2, (Ptr<Byte>((iVar4 + $10)))^)); { 5C00:05B0 }
      Ptr<ShortInt>(local_e)[3] := cVar1; { 5C00:05B0; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar4 + $10)))^ := local_5; { 5C00:05B0; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar4 + $16)))^ := local_6; { 5C00:05B0; region anchor, exact origin unknown }
    end; { 5C00:05B0; region anchor, exact origin unknown }
  end; { 5C00:05B0; region anchor, exact origin unknown }
  Exit; { 5C00:05D3 }
end;
```

### ov12:05D6 RestoreAttributeFromEffect (conf M)

Original `ov12_05D6`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): +8:2, +C:2.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Copies effect payload +3 back to character +15. Evidence: decode/listings/ov12.lst at 5C00:05D6, paired .c.

```pascal
procedure ov12_05D6(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  (Ptr<Byte>((SmallInt(param_3) + $15)))^ := (Ptr<Byte>((SmallInt(param_2) + 3)))^; { 5C00:05D6; region anchor, exact origin unknown }
  Exit; { 5C00:05E8 }
end;
```

### ov12:05EB ov12_05EB (conf L)

Original `ov12_05EB`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): +8:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; bVar2: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_001f, stub_ov24_e19, FUN_00ba_0767.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:05EB, paired .c.

```pascal
procedure ov12_05EB(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  uVar1 := FUN_5c00_001f(10, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $F, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:0604 }
  bVar2 := Byte((Word(uVar1) shr 8)); { 5C00:0604; region anchor, exact origin unknown }
  if ((ShortInt(uVar1) <> $0) and then (1 < (Ptr<Byte>((SmallInt(param_3) + $11B)))^)) then begin { 5C00:0604; region anchor, exact origin unknown }
    g_6819 := 0; { 5C00:0616 }
    stub_ov24_e19((Word(bVar2) shl 8), (Word(bVar2) shl 8), MakeWord(bVar2, 1), SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:062A }
    if (g_49F3 <> $5) then begin { 5C00:062A; region anchor, exact origin unknown }
      FUN_00ba_0767(g_5D92, g_5D94); { 5C00:063E }
    end; { 5C00:063E; region anchor, exact origin unknown }
  end; { 5C00:063E; region anchor, exact origin unknown }
  Exit; { 5C00:0644 }
end;
```

### ov12:0647 ov12_0647 (conf L)

Original `ov12_0647`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0647, paired .c.

```pascal
procedure ov12_0647();
begin
  Exit; { 5C00:064B }
end;
```

### ov12:064E ov12_064E (conf L)

Original `ov12_064E`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:064E, paired .c.

```pascal
procedure ov12_064E();
begin
  uVar1 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:064E; region anchor, exact origin unknown }
  if ((Ptr<Byte>((SmallInt(UNK_in_stack_0000000a) + $111)))^ < $39) then begin { 5C00:064E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(UNK_in_stack_0000000a) + $111)))^ := $39; { 5C00:064E; region anchor, exact origin unknown }
  end; { 5C00:064E; region anchor, exact origin unknown }
  g_6816 := (g_6816 + $1); { 5C00:0665 }
  if (g_681B = $F) then begin { 5C00:0665; region anchor, exact origin unknown }
    g_6818 := 0; { 5C00:0670 }
  end; { 5C00:0670; region anchor, exact origin unknown }
  Exit; { 5C00:0676 }
end;
```

### ov12:0679 ov12_0679 (conf L)

Original `ov12_0679`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1:1, +C:2.
Locals/SSA temporaries: uVar1: LongWord; iVar2: SmallInt; uVar3: Word; bVar4: Boolean; in_stack_0000000a: LongWord; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCompare.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0679, paired .c.

```pascal
procedure ov12_0679();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:0679; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(uVar1) shr $10)); { 5C00:0679; region anchor, exact origin unknown }
  iVar2 := SmallInt(uVar1); { 5C00:0679; region anchor, exact origin unknown }
  g_6826 := (Ptr<SmallInt>((iVar2 + 10)))^; { 5C00:068F }
  g_6828 := (Ptr<Word>((iVar2 + $C)))^; { 5C00:0692 }
  if (((Ptr<ShortInt>((g_6826 + $9F)))^ = $1) and then ((Ptr<ShortInt>((g_6826 + $6C)))^ = $1)) then begin { 5C00:0692; region anchor, exact origin unknown }
    local_3 := 1; { 5C00:06AD }
    while true do begin { 5C00:06AD; region anchor, exact origin unknown }
      iVar2 := ((Word(local_3) * $10) + $332); { 5C00:06AD; region anchor, exact origin unknown }
      bVar4 := (iVar2 = 0); { 5C00:06AD; region anchor, exact origin unknown }
      CompareStrFlags(PString(FarPtr(g_6828, g_6826)), PString(FarPtr($C7C, iVar2))); { 5C00:06CD }
      if bVar4 then begin { 5C00:06CD; region anchor, exact origin unknown }
        g_6822 := (g_6822 + $1); { 5C00:06D4 }
      end; { 5C00:06D4; region anchor, exact origin unknown }
      if (local_3 = 4) then begin { 5C00:06D4; region anchor, exact origin unknown }
        Break; { 5C00:06D4; region anchor, exact origin unknown }
      end; { 5C00:06D4; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 5C00:06B3 }
    end; { 5C00:06B3; region anchor, exact origin unknown }
  end; { 5C00:06B3; region anchor, exact origin unknown }
  Exit; { 5C00:06E1 }
end;
```

### ov12:06E4 ov12_06E4 (conf L)

Original `ov12_06E4`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:06E4, paired .c.

```pascal
procedure ov12_06E4();
begin
  if ((g_6819 and 1) <> 0) then begin { 5C00:06E4; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:06F7 }
    g_6816 := (g_6816 + $3); { 5C00:06FA }
  end; { 5C00:06FA; region anchor, exact origin unknown }
  Exit; { 5C00:0700 }
end;
```

### ov12:070F ov12_070F (conf L)

Original `ov12_070F`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -C:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; iVar1: SmallInt; uVar2: Word; unaff_SS: Word; in_stack_0000000a: LongWord; puVar3: ^Byte; iVar4: SmallInt; uVar5: Word; local_e: array[0..12-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:070F, paired .c.

```pascal
procedure ov12_070F();
begin
  uVar2 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:070F; region anchor, exact origin unknown }
  iVar1 := SmallInt(UNK_in_stack_0000000a); { 5C00:070F; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((iVar1 + $108)))^) + 2)))^ <> $0) then begin { 5C00:070F; region anchor, exact origin unknown }
    puVar3 := local_e; { 5C00:070F; region anchor, exact origin unknown }
    iVar4 := iVar1; { 5C00:070F; region anchor, exact origin unknown }
    uVar5 := uVar2; { 5C00:070F; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$C))) := 'is silenced'; { 5C00:0734 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar3, UNK_unaff_SS, iVar4, uVar5); { 5C00:073F }
  end; { 5C00:073F; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar1 + $108)))^) + 2)))^ := 0; { 5C00:073F; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar1 + $108)))^) + 1)))^ := 0; { 5C00:073F; region anchor, exact origin unknown }
  Exit; { 5C00:0761 }
end;
```

### ov12:0775 ov12_0775 (conf L)

Original `ov12_0775`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -15:2, -4:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; unaff_SS: Word; in_stack_0000000a: Word; in_stack_0000000c: Word; puVar3: ^Byte; uVar4: Word; uVar5: Word; local_17: array[0..17-1] of Byte; local_6: array[0..4-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_2199, System.@StrCopy, FUN_5c00_0058, stub_ov24_e2.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0775, paired .c.

```pascal
procedure ov12_0775();
begin
  cVar1 := FUN_00ba_2199(local_6, UNK_unaff_SS, $37, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:0789 }
  if (cVar1 <> $0) then begin { 5C00:0789; region anchor, exact origin unknown }
    uVar2 := 6; { 5C00:0789; region anchor, exact origin unknown }
    puVar3 := local_17; { 5C00:0789; region anchor, exact origin unknown }
    uVar4 := UNK_in_stack_0000000a; { 5C00:0789; region anchor, exact origin unknown }
    uVar5 := UNK_in_stack_0000000c; { 5C00:0789; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$15))) := 'dies from poison'; { 5C00:07A5 }
    FUN_5c00_0058(puVar3, UNK_unaff_SS, uVar2, uVar4, uVar5); { 5C00:07AB }
  end; { 5C00:07AB; region anchor, exact origin unknown }
  g_681F := 1; { 5C00:07AE }
  stub_ov24_e2(0, 0, $F, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:07C2 }
  g_681F := 0; { 5C00:07C7 }
  Exit; { 5C00:07CF }
end;
```

### ov12:07E0 ov12_07E0 (conf L)

Original `ov12_07E0`. Params (ABI order): param_1: ShortInt; param_2: Word; param_3: Word; param_4: LongWord.
BP access inventory (hex offset:byte widths): -13:2, -5:1, -4:2, -2:2, +6:1, +C:2, +E:2.
Locals/SSA temporaries: piVar1: ^SmallInt; extraout_AH: Byte; iVar2: SmallInt; uVar3: Word; unaff_SS: Word; puVar4: ^Byte; iVar5: SmallInt; uVar6: Word; local_15: array[0..14-1] of Byte; local_7: ShortInt; local_6: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_1509, System.GetMem, System.FillChar, FUN_00ba_15f7, System.FreeMem, System.@StrCopy, FUN_00ba_16ec, FUN_00ba_0bb8.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:07E0, paired .c.

```pascal
procedure ov12_07E0(param_1: ShortInt; param_2: Word; param_3: Word; param_4: LongWord);
begin
  uVar3 := Word((LongWord(param_4) shr $10)); { 5C00:07E0; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_4); { 5C00:07E0; region anchor, exact origin unknown }
  ExtractBytes(local_6, 2, 2) := (Ptr<SmallInt>((iVar2 + $CA)))^; { 5C00:07E0; region anchor, exact origin unknown }
  local_7 := $0; { 5C00:07F9 }
  ExtractBytes(local_6, 0, 2) := (Ptr<SmallInt>((iVar2 + 200)))^; { 5C00:07F9; region anchor, exact origin unknown }
  while ((SmallInt(local_6) <> 0) or else ((ExtractBytes(local_6, 2, 2) <> 0) and then (local_7 = $0))) do begin { 5C00:07F9; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((SmallInt(local_6) + $2E)))^ = $14) and then ((Ptr<ShortInt>((SmallInt(local_6) + $31)))^ = (-$D))) then begin { 5C00:07F9; region anchor, exact origin unknown }
      local_7 := $1; { 5C00:081F }
    end else begin { 5C00:081F; region anchor, exact origin unknown }
      piVar1 := Ptr<SmallInt>((SmallInt(local_6) + $2A)); { 5C00:081F; region anchor, exact origin unknown }
      ExtractBytes(local_6, 2, 2) := (Ptr<SmallInt>((SmallInt(local_6) + $2C)))^; { 5C00:081F; region anchor, exact origin unknown }
      ExtractBytes(local_6, 0, 2) := (piVar1)^; { 5C00:081F; region anchor, exact origin unknown }
    end; { 5C00:081F; region anchor, exact origin unknown }
  end; { 5C00:081F; region anchor, exact origin unknown }
  if ((param_1 <> $0) and then ((SmallInt(local_6) <> 0) or else (ExtractBytes(local_6, 2, 2) <> 0))) then begin { 5C00:081F; region anchor, exact origin unknown }
    FUN_00ba_1509(SmallInt(local_6), ExtractBytes(local_6, 2, 2), iVar2, uVar3); { 5C00:0852 }
  end; { 5C00:0852; region anchor, exact origin unknown }
  if (((param_1 = $0) and then Seq(local_6 := MakeLong(ExtractBytes(local_6, 2, 2), SmallInt(local_6)), (local_7 = $0))) and then Seq(local_6 := MakeLong(ExtractBytes(local_6, 2, 2), SmallInt(local_6)), ((Ptr<Byte>((iVar2 + 199)))^ < $10))) then begin { 5C00:0852; region anchor, exact origin unknown }
    local_6 := GetMem($3F); { 5C00:087B }
    FillChar(0, $3F, local_6); { 5C00:0892 }
    (Ptr<Byte>((SmallInt(local_6) + $2E)))^ := $14; { 5C00:0892; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(local_6) + $30)))^ := $14; { 5C00:0892; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(local_6) + $31)))^ := $F3; { 5C00:0892; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(local_6) + $32)))^ := 1; { 5C00:0892; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(local_6) + $3D)))^ := $17; { 5C00:0892; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(local_6) + $3E)))^ := $89; { 5C00:0892; region anchor, exact origin unknown }
    FUN_00ba_15f7(local_6, iVar2, uVar3); { 5C00:08D3 }
    FreeMem($3F, local_6); { 5C00:08E2 }
    puVar4 := local_15; { 5C00:08E2; region anchor, exact origin unknown }
    iVar5 := iVar2; { 5C00:08E2; region anchor, exact origin unknown }
    uVar6 := uVar3; { 5C00:08E2; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$13))) := 'Gains an item'; { 5C00:08F7 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar4, UNK_unaff_SS, iVar5, uVar6); { 5C00:0902 }
  end; { 5C00:0902; region anchor, exact origin unknown }
  FUN_00ba_0bb8(iVar2, uVar3); { 5C00:090D }
  Exit; { 5C00:0915 }
end;
```

### ov12:0918 ov12_0918 (conf L)

Original `ov12_0918`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2.
Locals/SSA temporaries: cVar1: ShortInt; unaff_SS: Word; local_6: array[0..4-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_2199.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0918, paired .c.

```pascal
procedure ov12_0918();
begin
  cVar1 := FUN_00ba_2199(local_6, UNK_unaff_SS, $18, g_5D92, g_5D94); { 5C00:092E }
  if (cVar1 = $0) then begin { 5C00:092E; region anchor, exact origin unknown }
    g_681E := 1; { 5C00:0937 }
  end; { 5C00:0937; region anchor, exact origin unknown }
  g_6822 := (g_6822 + (-4)); { 5C00:093C }
  Exit; { 5C00:0944 }
end;
```

### ov12:0947 ov12_0947 (conf L)

Original `ov12_0947`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1:1, +C:2.
Locals/SSA temporaries: uVar1: LongWord; iVar2: SmallInt; uVar3: Word; bVar4: Boolean; in_stack_0000000a: LongWord; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCompare.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0947, paired .c.

```pascal
procedure ov12_0947();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:0947; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(uVar1) shr $10)); { 5C00:0947; region anchor, exact origin unknown }
  iVar2 := SmallInt(uVar1); { 5C00:0947; region anchor, exact origin unknown }
  g_6826 := (Ptr<SmallInt>((iVar2 + 10)))^; { 5C00:095D }
  g_6828 := (Ptr<Word>((iVar2 + $C)))^; { 5C00:0960 }
  if (((Ptr<ShortInt>((g_6826 + $9F)))^ = $1) and then ((Ptr<ShortInt>((g_6826 + $6C)))^ = $1)) then begin { 5C00:0960; region anchor, exact origin unknown }
    local_3 := 1; { 5C00:097B }
    while true do begin { 5C00:097B; region anchor, exact origin unknown }
      iVar2 := ((Word(local_3) * $10) + $372); { 5C00:097B; region anchor, exact origin unknown }
      bVar4 := (iVar2 = 0); { 5C00:097B; region anchor, exact origin unknown }
      CompareStrFlags(PString(FarPtr(g_6828, g_6826)), PString(FarPtr($C7C, iVar2))); { 5C00:099B }
      if bVar4 then begin { 5C00:099B; region anchor, exact origin unknown }
        g_6822 := (g_6822 + $1); { 5C00:09A2 }
      end; { 5C00:09A2; region anchor, exact origin unknown }
      if (local_3 = 8) then begin { 5C00:09A2; region anchor, exact origin unknown }
        Break; { 5C00:09A2; region anchor, exact origin unknown }
      end; { 5C00:09A2; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 5C00:0981 }
    end; { 5C00:0981; region anchor, exact origin unknown }
  end; { 5C00:0981; region anchor, exact origin unknown }
  Exit; { 5C00:09AF }
end;
```

### ov12:09C0 ov12_09C0 (conf L)

Original `ov12_09C0`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: Word; param_4: Word.
BP access inventory (hex offset:byte widths): -E:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; extraout_AH: Byte; extraout_AH_00: Byte; iVar2: SmallInt; uVar3: Word; unaff_SS: Word; puVar4: ^Byte; uVar5: Word; uVar6: Word; local_10: array[0..14-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, FUN_5c00_0000, System.@StrCopy, FUN_00ba_16ec, stub_ov24_e2.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:09C0, paired .c.

```pascal
procedure ov12_09C0(param_1: Word; param_2: LongWord; param_3: Word; param_4: Word);
begin
  uVar3 := Word((LongWord(param_2) shr $10)); { 5C00:09C0; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_2); { 5C00:09C0; region anchor, exact origin unknown }
  uVar1 := stub_ov24_e8(((Ptr<Byte>((iVar2 + 3)))^ + 1), 1); { 5C00:09D4 }
  if (((1 < Byte(uVar1)) and then (g_681B <> $0)) and then (g_6820 = $0)) then begin { 5C00:09D4; region anchor, exact origin unknown }
    FUN_5c00_0000((uVar1 and $FF00)); { 5C00:09EF }
    puVar4 := local_10; { 5C00:09EF; region anchor, exact origin unknown }
    uVar5 := param_3; { 5C00:09EF; region anchor, exact origin unknown }
    uVar6 := param_4; { 5C00:09EF; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$E))) := 'lost an image'; { 5C00:0A02 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar4, UNK_unaff_SS, uVar5, uVar6); { 5C00:0A0D }
    (Ptr<ShortInt>((iVar2 + 3)))^ := ((Ptr<ShortInt>((iVar2 + 3)))^ + (-1)); { 5C00:0A0D; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((iVar2 + 3)))^ = $0) then begin { 5C00:0A0D; region anchor, exact origin unknown }
      stub_ov24_e2(0, 0, MakeWord(UNK_extraout_AH_00, $1C), param_3, param_4); { 5C00:0A32 }
    end; { 5C00:0A32; region anchor, exact origin unknown }
  end; { 5C00:0A32; region anchor, exact origin unknown }
  Exit; { 5C00:0A3A }
end;
```

### ov12:0A3D ov12_0A3D (conf L)

Original `ov12_0A3D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0A3D, paired .c.

```pascal
procedure ov12_0A3D();
begin
  g_6818 := (g_6818 - (g_6818 shr 2)); { 5C00:0A52 }
  Exit; { 5C00:0A56 }
end;
```

### ov12:0A65 ov12_0A65 (conf L)

Original `ov12_0A65`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -C:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; iVar1: SmallInt; iVar2: SmallInt; unaff_SS: Word; in_stack_0000000a: LongWord; puVar3: ^Byte; iVar4: SmallInt; iVar5: SmallInt; local_e: array[0..12-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec, FUN_00ba_0bb8, FUN_00ba_09e3.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0A65, paired .c.

```pascal
procedure ov12_0A65();
begin
  iVar2 := SmallInt((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:0A65; region anchor, exact origin unknown }
  iVar1 := SmallInt(UNK_in_stack_0000000a); { 5C00:0A65; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((iVar1 + $108)))^) + 2)))^ <> $0) then begin { 5C00:0A65; region anchor, exact origin unknown }
    puVar3 := local_e; { 5C00:0A65; region anchor, exact origin unknown }
    iVar4 := iVar1; { 5C00:0A65; region anchor, exact origin unknown }
    iVar5 := iVar2; { 5C00:0A65; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$C))) := 'is coughing'; { 5C00:0A8A }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar3, UNK_unaff_SS, iVar4, iVar5); { 5C00:0A95 }
  end; { 5C00:0A95; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar1 + $108)))^) + 2)))^ := 0; { 5C00:0A95; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar1 + $108)))^) + 1)))^ := 0; { 5C00:0A95; region anchor, exact origin unknown }
  FUN_00ba_0bb8(iVar1, iVar2); { 5C00:0ABA }
  if ((Ptr<Byte>((iVar1 + $112)))^ < $35) then begin { 5C00:0ABA; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar1 + $112)))^ := $32; { 5C00:0ABA; region anchor, exact origin unknown }
  end else begin { 5C00:0ABA; region anchor, exact origin unknown }
    (Ptr<ShortInt>((iVar1 + $112)))^ := ((Ptr<ShortInt>((iVar1 + $112)))^ + (-2)); { 5C00:0ABA; region anchor, exact origin unknown }
  end; { 5C00:0ABA; region anchor, exact origin unknown }
  (Ptr<Byte>((iVar1 + $111)))^ := (Ptr<Byte>((iVar1 + $112)))^; { 5C00:0ABA; region anchor, exact origin unknown }
  if ((iVar2 = g_5D94) and then (iVar1 = g_5D92)) then begin { 5C00:0ABA; region anchor, exact origin unknown }
    FUN_00ba_09e3(iVar1, iVar2); { 5C00:0B06 }
  end; { 5C00:0B06; region anchor, exact origin unknown }
  Exit; { 5C00:0B0E }
end;
```

### ov12:0B1B ov12_0B1B (conf L)

Original `ov12_0B1B`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -A:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; unaff_SS: Word; puVar3: ^Byte; iVar4: SmallInt; uVar5: Word; local_c: array[0..10-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_5c00_0058.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0B1B, paired .c.

```pascal
procedure ov12_0B1B(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  uVar2 := Word((LongWord(param_2) shr $10)); { 5C00:0B1B; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_2) + 4)))^ := 0; { 5C00:0B1B; region anchor, exact origin unknown }
  if (g_681F = $0) then begin { 5C00:0B1B; region anchor, exact origin unknown }
    uVar1 := 6; { 5C00:0B1B; region anchor, exact origin unknown }
    puVar3 := local_c; { 5C00:0B1B; region anchor, exact origin unknown }
    iVar4 := SmallInt(param_3); { 5C00:0B1B; region anchor, exact origin unknown }
    uVar5 := ExtractBytes(param_3, 2, 2); { 5C00:0B1B; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$A))) := 'collapses'; { 5C00:0B43 }
    FUN_5c00_0058(puVar3, UNK_unaff_SS, uVar1, iVar4, uVar5); { 5C00:0B49 }
  end; { 5C00:0B49; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_3) + $10E)))^ := ((Ptr<Byte>((SmallInt(param_2) + 3)))^ shr 4); { 5C00:0B49; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_3) + $10F)))^ := 1; { 5C00:0B49; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_3) + $76)))^ := 0; { 5C00:0B49; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_3) + $6B)))^ := (Ptr<Byte>((SmallInt(param_3) + $98)))^; { 5C00:0B49; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_3) + $72)))^ := $C; { 5C00:0B49; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((SmallInt(param_3) + $84)))^ = (-$4D)) then begin { 5C00:0B49; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(param_3) + $84)))^ := 0; { 5C00:0B49; region anchor, exact origin unknown }
  end; { 5C00:0B49; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(param_3) + $9F)))^ := 0; { 5C00:0B49; region anchor, exact origin unknown }
  Exit; { 5C00:0BA9 }
end;
```

### ov12:0BAC ov12_0BAC (conf L)

Original `ov12_0BAC`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: pcVar1: ^ShortInt; uVar2: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0BAC, paired .c.

```pascal
procedure ov12_0BAC();
begin
  g_6822 := (g_6822 + (-4)); { 5C00:0BAF }
  uVar2 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:0BAF; region anchor, exact origin unknown }
  pcVar1 := Ptr<ShortInt>((SmallInt(UNK_in_stack_0000000a) + $111)); { 5C00:0BAF; region anchor, exact origin unknown }
  (pcVar1)^ := ((pcVar1)^ + (-4)); { 5C00:0BAF; region anchor, exact origin unknown }
  pcVar1 := Ptr<ShortInt>((SmallInt(UNK_in_stack_0000000a) + $112)); { 5C00:0BAF; region anchor, exact origin unknown }
  (pcVar1)^ := ((pcVar1)^ + (-4)); { 5C00:0BAF; region anchor, exact origin unknown }
  g_6816 := (g_6816 + (-4)); { 5C00:0BC6 }
  Exit; { 5C00:0BCC }
end;
```

### ov12:0BCF ov12_0BCF (conf L)

Original `ov12_0BCF`. Params (ABI order): param_1: Byte; param_2: Word; param_3: Word; param_4: Word; param_5: Word.
BP access inventory (hex offset:byte widths): +6:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e1.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0BCF, paired .c.

```pascal
procedure ov12_0BCF(param_1: Byte; param_2: Word; param_3: Word; param_4: Word; param_5: Word);
begin
  stub_ov24_e1(param_1, param_2, param_3, param_4, param_5, $2B); { 5C00:0BE5 }
  stub_ov24_e1(MakeWord(UNK_extraout_AH, param_1), param_2, param_3, param_4, param_5, MakeWord(UNK_extraout_AH, $2C)); { 5C00:0BFD }
  Exit; { 5C00:0C03 }
end;
```

### ov12:0C06 ov12_0C06 (conf L)

Original `ov12_0C06`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: ov12_12B2.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0C06, paired .c.

```pascal
procedure ov12_0C06();
begin
  g_6816 := (g_6816 + $1); { 5C00:0C09 }
  g_6822 := (g_6822 + $1); { 5C00:0C0D }
  Exit; { 5C00:0C12 }
end;
```

### ov12:0C15 ov12_0C15 (conf L)

Original `ov12_0C15`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0C15, paired .c.

```pascal
procedure ov12_0C15();
begin
  g_6822 := (g_6822 + (-4)); { 5C00:0C18 }
  g_6816 := (g_6816 + (-4)); { 5C00:0C1D }
  Exit; { 5C00:0C23 }
end;
```

### ov12:0C26 ov12_0C26 (conf L)

Original `ov12_0C26`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: LongWord; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0C26, paired .c.

```pascal
procedure ov12_0C26();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:0C26; region anchor, exact origin unknown }
  if ($0 < (Ptr<ShortInt>((SmallInt(uVar1) + 3)))^) then begin { 5C00:0C26; region anchor, exact origin unknown }
    g_681E := 1; { 5C00:0C38 }
    g_6822 := $FF; { 5C00:0C3D }
  end; { 5C00:0C3D; region anchor, exact origin unknown }
  Exit; { 5C00:0C43 }
end;
```

### ov12:0C4B ov12_0C4B (conf L)

Original `ov12_0C4B`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -5:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; iVar1: SmallInt; uVar2: Word; unaff_SS: Word; puVar3: ^Byte; local_7: array[0..5-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0C4B, paired .c.

```pascal
procedure ov12_0C4B(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  uVar2 := Word((LongWord(param_2) shr $10)); { 5C00:0C4B; region anchor, exact origin unknown }
  iVar1 := SmallInt(param_2); { 5C00:0C4B; region anchor, exact origin unknown }
  if (((Ptr<Byte>((iVar1 + 3)))^ and $10) = 0) then begin { 5C00:0C4B; region anchor, exact origin unknown }
    (Ptr<ShortInt>((iVar1 + 3)))^ := ((Ptr<ShortInt>((iVar1 + 3)))^ + $10); { 5C00:0C4B; region anchor, exact origin unknown }
    puVar3 := local_7; { 5C00:0C4B; region anchor, exact origin unknown }
    iVar1 := SmallInt(param_3); { 5C00:0C4B; region anchor, exact origin unknown }
    uVar2 := ExtractBytes(param_3, 2, 2); { 5C00:0C4B; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$5))) := 'ages'; { 5C00:0C81 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar3, UNK_unaff_SS, iVar1, uVar2); { 5C00:0C8C }
    (Ptr<SmallInt>((SmallInt(param_3) + $30)))^ := ((Ptr<SmallInt>((SmallInt(param_3) + $30)))^ + 1); { 5C00:0C8C; region anchor, exact origin unknown }
  end; { 5C00:0C8C; region anchor, exact origin unknown }
  g_681A := (g_681A shl 1); { 5C00:0C9F }
  Exit; { 5C00:0CA5 }
end;
```

### ov12:0CC3 ov12_0CC3 (conf L)

Original `ov12_0CC3`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: SmallInt; param_4: SmallInt.
BP access inventory (hex offset:byte widths): -28:2, -E:1, -D:1, -C:1, -B:1, -A:1, -9:1, -8:2, -6:2, -4:2, -2:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: piVar1: ^SmallInt; iVar2: SmallInt; piVar3: ^SmallInt; iVar4: SmallInt; uVar5: Word; unaff_SS: Word; puVar6: ^Byte; local_2a: array[0..26-1] of Byte; local_10: Byte; local_f: Byte; local_e: Byte; local_d: Byte; local_c: Byte; local_b: ShortInt; local_a: LongWord; local_6: ^SmallInt; iStack_4: SmallInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_1693, System.FreeMem.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0CC3, paired .c.

```pascal
procedure ov12_0CC3(param_1: Word; param_2: LongWord; param_3: SmallInt; param_4: SmallInt);
begin
  local_c := ((Ptr<Byte>((SmallInt(param_2) + 3)))^ shr 4); { 5C00:0CD6 }
  local_b := $0; { 5C00:0CD9 }
  local_a := Ptr<SmallInt>(MakeLong(g_6DBD, g_6DBB)); { 5C00:0CE4 }
  while true do begin { 5C00:0CE4; region anchor, exact origin unknown }
    if (((Ptr<SmallInt>(local_a) = Ptr<SmallInt>($0)) and then (ExtractBytes(local_a, 2, 2) = 0)) or else (local_b <> $0)) then begin { 5C00:0CE4; region anchor, exact origin unknown }
      Break; { 5C00:0CE4; region anchor, exact origin unknown }
    end; { 5C00:0CE4; region anchor, exact origin unknown }
    if ((Ptr<SmallInt>(local_a)[1] = param_4) and then (((local_a)^ = param_3) and then ((Ptr<Byte>((Ptr<SmallInt>(local_a) + 9)))^ = local_c))) then begin { 5C00:0CE4; region anchor, exact origin unknown }
      local_b := $1; { 5C00:0D18 }
    end else begin { 5C00:0D18; region anchor, exact origin unknown }
      local_a := Ptr<SmallInt>(MakeLong(Ptr<SmallInt>(local_a)[3], Ptr<SmallInt>(Ptr<SmallInt>(local_a)[2]))); { 5C00:0D29 }
    end; { 5C00:0D29; region anchor, exact origin unknown }
  end; { 5C00:0D29; region anchor, exact origin unknown }
  if (local_b <> $0) then begin { 5C00:0D29; region anchor, exact origin unknown }
    puVar6 := local_2a; { 5C00:0D29; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$28))) := 'The air clears a little...'; { 5C00:0D44 }
    FUN_00ba_1693(puVar6, UNK_unaff_SS); { 5C00:0D49 }
    local_d := 1; { 5C00:0D4E }
    while true do begin { 5C00:0D4E; region anchor, exact origin unknown }
      iVar4 := SmallInt((LongWord(local_a) shr $10)); { 5C00:0D4E; region anchor, exact origin unknown }
      piVar3 := Ptr<SmallInt>(local_a); { 5C00:0D4E; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>(((SmallInt(piVar3) + local_d) + $B)))^ <> $0) then begin { 5C00:0D4E; region anchor, exact origin unknown }
        local_e := (ShortInt(piVar3[8]) + Ptr<UnknownValue>(@g_2736)[Byte(Ptr<UnknownValue>(@g_290D)[local_d])]); { 5C00:0D8B }
        local_f := ((Ptr<ShortInt>((SmallInt(piVar3) + $11)))^ + Ptr<UnknownValue>(@g_273F)[Byte(Ptr<UnknownValue>(@g_290D)[local_d])]); { 5C00:0DAE }
        local_b := $0; { 5C00:0DB1 }
        local_10 := g_6715; { 5C00:0DB8 }
        if (g_6715 <> 0) then begin { 5C00:0DB8; region anchor, exact origin unknown }
          local_c := 1; { 5C00:0DC2 }
          while true do begin { 5C00:0DC2; region anchor, exact origin unknown }
            if (((((Ptr<SmallInt>((Ptr<UnknownValue>(@g_66D6) + (Word(local_c) * 7))))^ <> 0) or else ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_66D8) + (Word(local_c) * 7))))^ <> 0)) and then (SmallInt(ShortInt(Ptr<UnknownValue>(@g_66DA)[(Word(local_c) * 7)])) = Word(local_e))) and then (SmallInt(ShortInt(Ptr<UnknownValue>(@g_66DB)[(Word(local_c) * 7)])) = Word(local_f))) then begin { 5C00:0DC2; region anchor, exact origin unknown }
              local_b := $1; { 5C00:0E18 }
            end; { 5C00:0E18; region anchor, exact origin unknown }
            if (local_c = g_6715) then begin { 5C00:0E18; region anchor, exact origin unknown }
              Break; { 5C00:0E18; region anchor, exact origin unknown }
            end; { 5C00:0E18; region anchor, exact origin unknown }
            local_c := (local_c + 1); { 5C00:0DC7 }
          end; { 5C00:0DC7; region anchor, exact origin unknown }
        end; { 5C00:0DC7; region anchor, exact origin unknown }
        uVar5 := Word((LongWord(g_6716) shr $10)); { 5C00:0DC7; region anchor, exact origin unknown }
        if (local_b = $0) then begin { 5C00:0DC7; region anchor, exact origin unknown }
          (Ptr<Byte>((((SmallInt(g_6716) + (Word(local_f) * $32)) + Word(local_e)) + 7)))^ := (Ptr<Byte>(((SmallInt(piVar3) + local_d) + 7)))^; { 5C00:0DC7; region anchor, exact origin unknown }
        end else begin { 5C00:0DC7; region anchor, exact origin unknown }
          (Ptr<Byte>((((SmallInt(g_6716) + (Word(local_f) * $32)) + Word(local_e)) + 7)))^ := $1F; { 5C00:0DC7; region anchor, exact origin unknown }
        end; { 5C00:0DC7; region anchor, exact origin unknown }
      end; { 5C00:0DC7; region anchor, exact origin unknown }
      if (local_d = 4) then begin { 5C00:0DC7; region anchor, exact origin unknown }
        Break; { 5C00:0DC7; region anchor, exact origin unknown }
      end; { 5C00:0DC7; region anchor, exact origin unknown }
      local_d := (local_d + 1); { 5C00:0D54 }
    end; { 5C00:0D54; region anchor, exact origin unknown }
    local_6 := g_6DBB; { 5C00:0E85 }
    local_6 := g_6DBB; { 5C00:0ECF }
    iStack_4 := g_6DBD; { 5C00:0ECF; region anchor, exact origin unknown }
    if ((g_6DBD = iVar4) and then (g_6DBB = piVar3)) then begin { 5C00:0ECF; region anchor, exact origin unknown }
      piVar1 := (g_6DBB + 2); { 5C00:0ECF; region anchor, exact origin unknown }
      g_6DBD := g_6DBB[3]; { 5C00:0EA9 }
      g_6DBB := Ptr<SmallInt>((piVar1)^); { 5C00:0EA6 }
    end else begin { 5C00:0EA6; region anchor, exact origin unknown }
      while ((local_6[3] <> iVar4) or else (Ptr<SmallInt>(local_6[2]) <> piVar3)) do begin { 5C00:0EA6; region anchor, exact origin unknown }
        piVar1 := (local_6 + 2); { 5C00:0EA6; region anchor, exact origin unknown }
        iStack_4 := local_6[3]; { 5C00:0EA6; region anchor, exact origin unknown }
        local_6 := Ptr<SmallInt>((piVar1)^); { 5C00:0F03 }
      end; { 5C00:0F03; region anchor, exact origin unknown }
    end; { 5C00:0F03; region anchor, exact origin unknown }
    iVar2 := piVar3[3]; { 5C00:0F03; region anchor, exact origin unknown }
    local_6[2] := piVar3[2]; { 5C00:0F03; region anchor, exact origin unknown }
    local_6[3] := iVar2; { 5C00:0F03; region anchor, exact origin unknown }
    FreeMem(FarPtr(BPWord(-$6), BPWord(-$8)), $13); { 5C00:0EF7 }
    iStack_4 := g_6DBD; { 5C00:0EF7; region anchor, exact origin unknown }
    local_6 := g_6DBB; { 5C00:0F93 }
    while ((local_6 <> Ptr<SmallInt>($0)) or else (iStack_4 <> 0)) do begin { 5C00:0F93; region anchor, exact origin unknown }
      local_d := 1; { 5C00:0F1A }
      while true do begin { 5C00:0F1A; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>(((SmallInt(local_6) + local_d) + $B)))^ <> $0) then begin { 5C00:0F1A; region anchor, exact origin unknown }
          (Ptr<Byte>(((((SmallInt(g_6716) + ((SmallInt((Ptr<ShortInt>((SmallInt(local_6) + $11)))^) + SmallInt(ShortInt(Ptr<UnknownValue>(@g_273F)[Byte(Ptr<UnknownValue>(@g_290D)[local_d])]))) * $32)) + SmallInt(ShortInt(local_6[8]))) + SmallInt(ShortInt(Ptr<UnknownValue>(@g_2736)[Byte(Ptr<UnknownValue>(@g_290D)[local_d])]))) + 7)))^ := $1E; { 5C00:0F1A; region anchor, exact origin unknown }
        end; { 5C00:0F1A; region anchor, exact origin unknown }
        if (local_d = 4) then begin { 5C00:0F1A; region anchor, exact origin unknown }
          Break; { 5C00:0F1A; region anchor, exact origin unknown }
        end; { 5C00:0F1A; region anchor, exact origin unknown }
        local_d := (local_d + 1); { 5C00:0F14 }
      end; { 5C00:0F14; region anchor, exact origin unknown }
      piVar1 := (local_6 + 2); { 5C00:0F14; region anchor, exact origin unknown }
      iStack_4 := local_6[3]; { 5C00:0F14; region anchor, exact origin unknown }
      local_6 := Ptr<SmallInt>((piVar1)^); { 5C00:0F14; region anchor, exact origin unknown }
    end; { 5C00:0F14; region anchor, exact origin unknown }
  end; { 5C00:0F14; region anchor, exact origin unknown }
  Exit; { 5C00:0F9F }
end;
```

### ov12:0FAC FUN_5c00_0fac (conf L)

Original `FUN_5c00_0fac`. Params (ABI order): param_1: Byte; param_2: Word; param_3: Word.
BP access inventory (hex offset:byte widths): -A:2, +6:1, +8:2, +A:2.
Locals/SSA temporaries: bVar1: Byte; extraout_AH: Byte; iVar2: SmallInt; uVar3: Word; unaff_SS: Word; puVar4: ^Byte; local_c: array[0..10-1] of Byte.
Callers: ov12_1086,ov12_2901,ov12_2BC8.
Callees (listing): FUN_00ba_255b, stub_ov24_e8, System.@StrCopy, FUN_00ba_16ec.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:0FAC, paired .c.

```pascal
procedure FUN_5c00_0fac(param_1: Byte; param_2: Word; param_3: Word);
begin
  uVar3 := Word((LongWord(g_5D92) shr $10)); { 5C00:0FAC; region anchor, exact origin unknown }
  iVar2 := SmallInt(g_5D92); { 5C00:0FAC; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((iVar2 + $CC)))^ <> 0) or else ((Ptr<SmallInt>((iVar2 + $CE)))^ <> 0)) then begin { 5C00:0FAC; region anchor, exact origin unknown }
    bVar1 := FUN_00ba_255b(param_2, param_3, iVar2, uVar3); { 5C00:0FD0 }
    if (1 < bVar1) then begin { 5C00:0FD0; region anchor, exact origin unknown }
      bVar1 := stub_ov24_e8(100, 1); { 5C00:0FDF }
      if (bVar1 <= param_1) then begin { 5C00:0FDF; region anchor, exact origin unknown }
        puVar4 := local_c; { 5C00:0FDF; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$A))) := 'Avoids it'; { 5C00:0FF9 }
        FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar4, UNK_unaff_SS, param_2, param_3); { 5C00:1004 }
        g_6818 := 0; { 5C00:1009 }
        g_6822 := $FF; { 5C00:100E }
        g_6823 := (g_6823 + (-1)); { 5C00:1013 }
      end; { 5C00:1013; region anchor, exact origin unknown }
    end; { 5C00:1013; region anchor, exact origin unknown }
  end; { 5C00:1013; region anchor, exact origin unknown }
  Exit; { 5C00:101A }
end;
```

### ov12:101D FUN_5c00_101d (conf L)

Original `FUN_5c00_101d`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -9:1, -8:2, -6:2, -4:2, -2:2, +6:2, +8:2.
Locals/SSA temporaries: cVar1: ShortInt; iVar2: SmallInt; uVar3: Word; unaff_SS: Word; local_a: SmallInt; local_8: SmallInt.
Callers: ov12_1086,ov12_25BC,ov12_264B,ov12_2A87,ov12_2AE6,ov12_2B7D,ov12_2D88.
Callees (listing): FUN_00ba_2e8b.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:101D, paired .c.

```pascal
function FUN_5c00_101d(param_1: LongWord): LongWord;
begin
  local_a := 0; { 5C00:1025 }
  local_8 := 0; { 5C00:1028 }
  uVar3 := Word((LongWord(param_1) shr $10)); { 5C00:1028; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_1); { 5C00:1028; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((iVar2 + $CC)))^ <> 0) or else ((Ptr<SmallInt>((iVar2 + $CE)))^ <> 0)) then begin { 5C00:1028; region anchor, exact origin unknown }
    cVar1 := FUN_00ba_2e8b(@local_a, UNK_unaff_SS, iVar2, uVar3); { 5C00:1045 }
    if ((cVar1 = $0) or else ((local_a = 0) and then (local_8 = 0))) then begin { 5C00:1045; region anchor, exact origin unknown }
      local_a := (Ptr<SmallInt>((iVar2 + $CC)))^; { 5C00:1068 }
      local_8 := (Ptr<SmallInt>((iVar2 + $CE)))^; { 5C00:106B }
    end; { 5C00:106B; region anchor, exact origin unknown }
  end; { 5C00:106B; region anchor, exact origin unknown }
  Exit(MakeLong(local_8, local_a)); { 5C00:1083 }
end;
```

### ov12:1086 ov12_1086 (conf L)

Original `ov12_1086`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: lVar1: LongInt; uVar2: LongWord; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d, FUN_5c00_0fac.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1086, paired .c.

```pascal
procedure ov12_1086();
begin
  lVar1 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:1092 }
  if (lVar1 <> 0) then begin { 5C00:1092; region anchor, exact origin unknown }
    uVar2 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:10A2 }
    if ((Ptr<ShortInt>((SmallInt(uVar2) + $32)))^ = $0) then begin { 5C00:10A2; region anchor, exact origin unknown }
      FUN_5c00_0fac(100, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:10BA }
    end; { 5C00:10BA; region anchor, exact origin unknown }
  end; { 5C00:10BA; region anchor, exact origin unknown }
  Exit; { 5C00:10BE }
end;
```

### ov12:10C1 ov12_10C1 (conf L)

Original `ov12_10C1`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:10C1, paired .c.

```pascal
procedure ov12_10C1();
begin
  g_681A := (g_681A shr 1); { 5C00:10CB }
  Exit; { 5C00:10CF }
end;
```

### ov12:10DE ov12_10DE (conf L)

Original `ov12_10DE`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -10:2, -4:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; unaff_SS: Word; puVar2: ^Byte; iVar3: SmallInt; uVar4: Word; local_12: array[0..12-1] of Byte; local_6: array[0..4-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_001f, System.@StrCopy, FUN_00ba_16ec, FUN_00ba_2199, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:10DE, paired .c.

```pascal
procedure ov12_10DE(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  cVar1 := FUN_5c00_001f($3C, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $2B, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:10FA }
  if (cVar1 <> $0) then begin { 5C00:10FA; region anchor, exact origin unknown }
    if ((Ptr<Byte>((SmallInt(param_3) + $10)))^ < 4) then begin { 5C00:10FA; region anchor, exact origin unknown }
      cVar1 := FUN_00ba_2199(local_6, UNK_unaff_SS, $1F, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:1142 }
      if (cVar1 = $0) then begin { 5C00:1142; region anchor, exact origin unknown }
        stub_ov24_e10(0, $FF, 0, $1F, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:115D }
      end; { 5C00:115D; region anchor, exact origin unknown }
    end else begin { 5C00:115D; region anchor, exact origin unknown }
      puVar2 := local_12; { 5C00:115D; region anchor, exact origin unknown }
      iVar3 := SmallInt(param_3); { 5C00:115D; region anchor, exact origin unknown }
      uVar4 := ExtractBytes(param_3, 2, 2); { 5C00:115D; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$10))) := 'is weakened'; { 5C00:111B }
      FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar2, UNK_unaff_SS, iVar3, uVar4); { 5C00:1126 }
      (Ptr<ShortInt>((SmallInt(param_3) + $10)))^ := ((Ptr<ShortInt>((SmallInt(param_3) + $10)))^ + (-1)); { 5C00:1126; region anchor, exact origin unknown }
    end; { 5C00:1126; region anchor, exact origin unknown }
  end; { 5C00:1126; region anchor, exact origin unknown }
  Exit; { 5C00:1165 }
end;
```

### ov12:1168 ov12_1168 (conf L)

Original `ov12_1168`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -4:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; bVar3: Byte; unaff_SS: Word; local_6: array[0..4-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_001f, stub_ov24_e19, FUN_00ba_0767, FUN_00ba_2199, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1168, paired .c.

```pascal
procedure ov12_1168(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  uVar2 := FUN_5c00_001f(10, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $2C, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:1184 }
  bVar3 := Byte((Word(uVar2) shr 8)); { 5C00:1184; region anchor, exact origin unknown }
  if (ShortInt(uVar2) <> $0) then begin { 5C00:1184; region anchor, exact origin unknown }
    if ((Ptr<Byte>((SmallInt(param_3) + $11B)))^ < 2) then begin { 5C00:1184; region anchor, exact origin unknown }
      cVar1 := FUN_00ba_2199(local_6, UNK_unaff_SS, MakeWord(bVar3, $1F), SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:11D3 }
      if (cVar1 = $0) then begin { 5C00:11D3; region anchor, exact origin unknown }
        stub_ov24_e10(0, $FF, 0, $1F, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:11EE }
      end; { 5C00:11EE; region anchor, exact origin unknown }
    end else begin { 5C00:11EE; region anchor, exact origin unknown }
      g_6819 := 0; { 5C00:1196 }
      stub_ov24_e19((Word(bVar3) shl 8), (Word(bVar3) shl 8), MakeWord(bVar3, 1), SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:11AA }
      if (g_49F3 <> $5) then begin { 5C00:11AA; region anchor, exact origin unknown }
        FUN_00ba_0767(g_5D92, g_5D94); { 5C00:11BE }
      end; { 5C00:11BE; region anchor, exact origin unknown }
    end; { 5C00:11BE; region anchor, exact origin unknown }
  end; { 5C00:11BE; region anchor, exact origin unknown }
  Exit; { 5C00:11F6 }
end;
```

### ov12:11F9 ov12_11F9 (conf L)

Original `ov12_11F9`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1:1, +C:2.
Locals/SSA temporaries: uVar1: LongWord; iVar2: SmallInt; uVar3: Word; bVar4: Boolean; in_stack_0000000a: LongWord; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCompare.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:11F9, paired .c.

```pascal
procedure ov12_11F9();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:11F9; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(uVar1) shr $10)); { 5C00:11F9; region anchor, exact origin unknown }
  iVar2 := SmallInt(uVar1); { 5C00:11F9; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar2 + 10)))^; { 5C00:120F }
  g_6828 := (Ptr<Word>((iVar2 + $C)))^; { 5C00:1212 }
  uVar3 := Word((LongWord(g_5D92) shr $10)); { 5C00:1212; region anchor, exact origin unknown }
  if (((Ptr<ShortInt>((SmallInt(g_5D92) + $9F)))^ = $1) and then (((Ptr<Byte>((SmallInt(g_5D92) + $6C)))^ and $7F) = 2)) then begin { 5C00:1212; region anchor, exact origin unknown }
    local_3 := 1; { 5C00:1230 }
    while true do begin { 5C00:1230; region anchor, exact origin unknown }
      iVar2 := ((Word(local_3) * $10) + $3F2); { 5C00:1230; region anchor, exact origin unknown }
      bVar4 := (iVar2 = 0); { 5C00:1230; region anchor, exact origin unknown }
      CompareStrFlags(PString(FarPtr(g_6828, g_6826)), PString(FarPtr($C7C, iVar2))); { 5C00:1250 }
      if bVar4 then begin { 5C00:1250; region anchor, exact origin unknown }
        g_6822 := (g_6822 + (-4)); { 5C00:1257 }
      end; { 5C00:1257; region anchor, exact origin unknown }
      if (local_3 = 8) then begin { 5C00:1257; region anchor, exact origin unknown }
        Break; { 5C00:1257; region anchor, exact origin unknown }
      end; { 5C00:1257; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 5C00:1236 }
    end; { 5C00:1236; region anchor, exact origin unknown }
  end; { 5C00:1236; region anchor, exact origin unknown }
  Exit; { 5C00:1265 }
end;
```

### ov12:1276 ov12_1276 (conf L)

Original `ov12_1276`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: uVar1: Word; bVar2: Boolean.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCompare.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1276, paired .c.

```pascal
procedure ov12_1276();
begin
  uVar1 := Word((LongWord(g_5D92) shr $10)); { 5C00:1276; region anchor, exact origin unknown }
  bVar2 := ((Ptr<ShortInt>((SmallInt(g_5D92) + $9F)))^ = $1); { 5C00:1276; region anchor, exact origin unknown }
  if bVar2 then begin { 5C00:1276; region anchor, exact origin unknown }
    CompareStrFlags(PString(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $5D92))), FarOff(MemWord(FarPtr($0C7C, $5D92))))), 'BUGBEAR'); { 5C00:1290 }
    if ((not bVar2) and then Seq(CompareStrFlags(PString(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $5D92))), FarOff(MemWord(FarPtr($0C7C, $5D92))))), 'GNOLL'), (not bVar2))) then begin { 5C00:12A2 }
      Exit; { 5C00:12AF }
    end; { 5C00:12A2; region anchor, exact origin unknown }
    g_6822 := (g_6822 + (-4)); { 5C00:12A9 }
  end; { 5C00:12A9; region anchor, exact origin unknown }
  Exit; { 5C00:12AF }
end;
```

### ov12:12B2 ov12_12B2 (conf L)

Original `ov12_12B2`. Params (ABI order): param_1: Byte; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -1:1, +6:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): ov12_0C06.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:12B2, paired .c.

```pascal
procedure ov12_12B2(param_1: Byte; param_2: LongWord; param_3: LongWord);
begin
  uVar1 := Word((LongWord(param_2) shr $10)); { 5C00:12B2; region anchor, exact origin unknown }
  uVar2 := Word((LongWord(param_3) shr $10)); { 5C00:12B2; region anchor, exact origin unknown }
  if ((Ptr<Byte>((SmallInt(param_3) + $10E)))^ = (((Ptr<Byte>((SmallInt(param_2) + 3)))^ and $10) shr 4)) then begin { 5C00:12B2; region anchor, exact origin unknown }
    ov12_0C06(param_1, SmallInt(param_2), uVar1, SmallInt(param_3), uVar2); { 5C00:12E8 }
  end else begin { 5C00:12E8; region anchor, exact origin unknown }
    g_6822 := (g_6822 + (-1)); { 5C00:12ED }
    g_6816 := (g_6816 + (-1)); { 5C00:12F1 }
  end; { 5C00:12F1; region anchor, exact origin unknown }
  Exit; { 5C00:12F8 }
end;
```

### ov12:12FB ov12_12FB (conf L)

Original `ov12_12FB`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: Word; param_4: Word.
BP access inventory (hex offset:byte widths): +8:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_001f, stub_ov24_e21, FUN_00ba_234a.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:12FB, paired .c.

```pascal
procedure ov12_12FB(param_1: Word; param_2: LongWord; param_3: Word; param_4: Word);
begin
  cVar1 := FUN_5c00_001f($3840, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $32, param_3, param_4); { 5C00:1314 }
  if (cVar1 <> $0) then begin { 5C00:1314; region anchor, exact origin unknown }
    cVar1 := stub_ov24_e21(1, 1, param_3, param_4); { 5C00:1327 }
    if (cVar1 <> $0) then begin { 5C00:1327; region anchor, exact origin unknown }
      FUN_00ba_234a(param_3, param_4); { 5C00:1336 }
    end; { 5C00:1336; region anchor, exact origin unknown }
  end; { 5C00:1336; region anchor, exact origin unknown }
  Exit; { 5C00:133C }
end;
```

### ov12:133F ov12_133F (conf L)

Original `ov12_133F`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_2637.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:133F, paired .c.

```pascal
procedure ov12_133F();
begin
  FUN_00ba_2637(UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1348 }
  Exit; { 5C00:1352 }
end;
```

### ov12:1355 ov12_1355 (conf L)

Original `ov12_1355`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1355, paired .c.

```pascal
procedure ov12_1355();
begin
  Exit; { 5C00:1359 }
end;
```

### ov12:135C ov12_135C (conf L)

Original `ov12_135C`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:135C, paired .c.

```pascal
procedure ov12_135C();
begin
  Exit; { 5C00:1360 }
end;
```

### ov12:1363 ov12_1363 (conf L)

Original `ov12_1363`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1363, paired .c.

```pascal
procedure ov12_1363();
begin
  stub_ov24_e10(0, $C, 1, $19, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1379 }
  Exit; { 5C00:137F }
end;
```

### ov12:1399 ov12_1399 (conf L)

Original `ov12_1399`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -F:2, -8:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; iVar1: SmallInt; uVar2: Word; unaff_SS: Word; puVar3: ^Byte; uVar4: Word; local_11: array[0..7-1] of Byte; local_a: array[0..8-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec, FUN_5c00_001f, FUN_5c00_0058.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1399, paired .c.

```pascal
procedure ov12_1399(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  if (g_681F = $0) then begin { 5C00:1399; region anchor, exact origin unknown }
    puVar3 := local_a; { 5C00:1399; region anchor, exact origin unknown }
    uVar2 := UNK_unaff_SS; { 5C00:1399; region anchor, exact origin unknown }
    iVar1 := SmallInt(param_3); { 5C00:1399; region anchor, exact origin unknown }
    uVar4 := ExtractBytes(param_3, 2, 2); { 5C00:1399; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$8))) := 'Rots...'; { 5C00:13B9 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar3, uVar2, iVar1, uVar4); { 5C00:13C4 }
    if ((Ptr<Byte>((SmallInt(param_3) + $15)))^ < 3) then begin { 5C00:13C4; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt(param_3) + $15)))^ := 0; { 5C00:13C4; region anchor, exact origin unknown }
    end else begin { 5C00:13C4; region anchor, exact origin unknown }
      (Ptr<ShortInt>((SmallInt(param_3) + $15)))^ := ((Ptr<ShortInt>((SmallInt(param_3) + $15)))^ + (-2)); { 5C00:13C4; region anchor, exact origin unknown }
    end; { 5C00:13C4; region anchor, exact origin unknown }
    if ((Ptr<Byte>((SmallInt(param_3) + $15)))^ < 3) then begin { 5C00:13C4; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt(param_3) + $15)))^ := 3; { 5C00:13C4; region anchor, exact origin unknown }
    end; { 5C00:13C4; region anchor, exact origin unknown }
    uVar2 := Word((LongWord(param_2) shr $10)); { 5C00:13C4; region anchor, exact origin unknown }
    iVar1 := SmallInt(param_2); { 5C00:13C4; region anchor, exact origin unknown }
    if (((Ptr<Byte>((iVar1 + 3)))^ shr 4) < 2) then begin { 5C00:13C4; region anchor, exact origin unknown }
      uVar2 := 8; { 5C00:13C4; region anchor, exact origin unknown }
      puVar3 := local_11; { 5C00:13C4; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$F))) := 'Dies rots away'; { 5C00:1443 }
      FUN_5c00_0058(puVar3, UNK_unaff_SS, uVar2, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:1449 }
    end else begin { 5C00:1449; region anchor, exact origin unknown }
      (Ptr<ShortInt>((iVar1 + 3)))^ := ((Ptr<ShortInt>((iVar1 + 3)))^ + (-$10)); { 5C00:1449; region anchor, exact origin unknown }
      FUN_5c00_001f($A8C0, (Ptr<Byte>((iVar1 + 3)))^, $39, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:1427 }
    end; { 5C00:1427; region anchor, exact origin unknown }
  end; { 5C00:1427; region anchor, exact origin unknown }
  Exit; { 5C00:144F }
end;
```

### ov12:1452 ov12_1452 (conf L)

Original `ov12_1452`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: LongWord; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1452, paired .c.

```pascal
procedure ov12_1452();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:1452; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(uVar1) + 6)))^ := 0; { 5C00:1452; region anchor, exact origin unknown }
  if (g_681D <> $0) then begin { 5C00:1452; region anchor, exact origin unknown }
    g_681A := 0; { 5C00:1469 }
  end; { 5C00:1469; region anchor, exact origin unknown }
  Exit; { 5C00:146F }
end;
```

### ov12:1472 ov12_1472 (conf L)

Original `ov12_1472`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1472, paired .c.

```pascal
procedure ov12_1472();
begin
  stub_ov24_e10(0, $FF, 0, $62, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1487 }
  Exit; { 5C00:148D }
end;
```

### ov12:1490 ov12_1490 (conf L)

Original `ov12_1490`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -2:1, -1:1.
Locals/SSA temporaries: in_AX: Word; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1490, paired .c.

```pascal
procedure ov12_1490();
begin
  if ((g_6819 and 1) <> 0) then begin { 5C00:1490; region anchor, exact origin unknown }
    if (g_681C <> 0) then begin { 5C00:1490; region anchor, exact origin unknown }
      local_3 := 1; { 5C00:14AC }
      while true do begin { 5C00:14AC; region anchor, exact origin unknown }
        g_6818 := (g_6818 - 2); { 5C00:14B4 }
        if (g_6818 < g_681C) then begin { 5C00:14B4; region anchor, exact origin unknown }
          g_6818 := g_681C; { 5C00:14C5 }
        end; { 5C00:14C5; region anchor, exact origin unknown }
        if (local_3 = g_681C) then begin { 5C00:14C5; region anchor, exact origin unknown }
          Break; { 5C00:14C5; region anchor, exact origin unknown }
        end; { 5C00:14C5; region anchor, exact origin unknown }
        local_3 := (local_3 + 1); { 5C00:14B1 }
      end; { 5C00:14B1; region anchor, exact origin unknown }
    end; { 5C00:14B1; region anchor, exact origin unknown }
    g_6816 := (g_6816 + $4); { 5C00:14D0 }
    if ((g_6819 and 8) = 0) then begin { 5C00:14D0; region anchor, exact origin unknown }
      FUN_5c00_0000((UNK_in_AX and $FF00)); { 5C00:14E2 }
    end; { 5C00:14E2; region anchor, exact origin unknown }
  end; { 5C00:14E2; region anchor, exact origin unknown }
  Exit; { 5C00:14E8 }
end;
```

### ov12:14EB ov12_14EB (conf L)

Original `ov12_14EB`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: Word; param_4: Word.
BP access inventory (hex offset:byte widths): +8:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_001f, stub_ov24_e21, FUN_00ba_234a.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:14EB, paired .c.

```pascal
procedure ov12_14EB(param_1: Word; param_2: LongWord; param_3: Word; param_4: Word);
begin
  cVar1 := FUN_5c00_001f($3C, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $3E, param_3, param_4); { 5C00:1504 }
  if (cVar1 <> $0) then begin { 5C00:1504; region anchor, exact origin unknown }
    cVar1 := stub_ov24_e21(1, 1, param_3, param_4); { 5C00:1517 }
    if (cVar1 <> $0) then begin { 5C00:1517; region anchor, exact origin unknown }
      FUN_00ba_234a(param_3, param_4); { 5C00:1526 }
    end; { 5C00:1526; region anchor, exact origin unknown }
  end; { 5C00:1526; region anchor, exact origin unknown }
  Exit; { 5C00:152C }
end;
```

### ov12:1545 FUN_5c00_1545 (conf L)

Original `FUN_5c00_1545`. Params (ABI order): param_1: Byte; param_2: LongWord.
BP access inventory (hex offset:byte widths): -C:2, -A:2, +6:1, +8:2.
Locals/SSA temporaries: uVar1: LongWord; cVar2: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; uVar3: Word; iVar4: SmallInt; uVar5: Word; unaff_SS: Word; puVar6: ^Byte; uVar7: Word; local_e: array[0..2-1] of Byte; local_c: array[0..10-1] of Byte.
Callers: ov12_165D,ov12_1671,ov12_1685,ov12_170B.
Callees (listing): stub_ov24_e7, System.@StrCopy, FUN_00ba_16ec, FUN_0709_0dbe, stub_ov24_e10, FUN_5c00_0058.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1545, paired .c.

```pascal
procedure FUN_5c00_1545(param_1: Byte; param_2: LongWord);
begin
  uVar1 := (Ptr<LongWord>((SmallInt(param_2) + $108)))^; { 5C00:1545; region anchor, exact origin unknown }
  uVar5 := Word((LongWord(uVar1) shr $10)); { 5C00:1545; region anchor, exact origin unknown }
  iVar4 := SmallInt(uVar1); { 5C00:1545; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar4 + 10)))^; { 5C00:155B }
  g_6828 := (Ptr<Word>((iVar4 + $C)))^; { 5C00:155E }
  cVar2 := stub_ov24_e7(MakeWord(ShortInt((g_6826 shr 8)), param_1), (g_6826 and $FF00), g_6826, g_6828); { 5C00:1571 }
  if (cVar2 = $0) then begin { 5C00:1571; region anchor, exact origin unknown }
    puVar6 := local_e; { 5C00:1571; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 5C00:1571; region anchor, exact origin unknown }
    uVar7 := g_6826; { 5C00:1571; region anchor, exact origin unknown }
    uVar3 := g_6828; { 5C00:1571; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$C))) := 'is Poisoned'; { 5C00:158C }
    FUN_00ba_16ec((Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 10), puVar6, uVar5, uVar7, uVar3); { 5C00:1597 }
    FUN_0709_0dbe(); { 5C00:159C }
    stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_00, $37), g_6826, g_6828); { 5C00:15B5 }
    uVar3 := MakeWord(UNK_extraout_AH_01, 6); { 5C00:15B5; region anchor, exact origin unknown }
    puVar6 := local_c; { 5C00:15B5; region anchor, exact origin unknown }
    uVar7 := g_6826; { 5C00:15B5; region anchor, exact origin unknown }
    uVar5 := g_6828; { 5C00:15B5; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$A))) := 'is killed'; { 5C00:15CF }
    FUN_5c00_0058(puVar6, UNK_unaff_SS, uVar3, uVar7, uVar5); { 5C00:15D5 }
  end; { 5C00:15D5; region anchor, exact origin unknown }
  Exit; { 5C00:15DB }
end;
```

### ov12:15EB FUN_5c00_15eb (conf L)

Original `FUN_5c00_15eb`. Params (ABI order): param_1: Word; param_2: Word; param_3: LongWord.
BP access inventory (hex offset:byte widths): -D:2, +8:2, +A:2.
Locals/SSA temporaries: uVar1: LongWord; cVar2: ShortInt; uVar3: Word; extraout_AH: Byte; iVar4: SmallInt; uVar5: Word; unaff_SS: Word; puVar6: ^Byte; uVar7: Word; local_f: array[0..13-1] of Byte.
Callers: ov12_1699,ov12_16BB,ov12_16E6.
Callees (listing): stub_ov24_e7, System.@StrCopy, FUN_00ba_1feb, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:15EB, paired .c.

```pascal
procedure FUN_5c00_15eb(param_1: Word; param_2: Word; param_3: LongWord);
begin
  uVar1 := (Ptr<LongWord>((SmallInt(param_3) + $108)))^; { 5C00:15EB; region anchor, exact origin unknown }
  uVar5 := Word((LongWord(uVar1) shr $10)); { 5C00:15EB; region anchor, exact origin unknown }
  iVar4 := SmallInt(uVar1); { 5C00:15EB; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar4 + 10)))^; { 5C00:1601 }
  g_6828 := (Ptr<Word>((iVar4 + $C)))^; { 5C00:1604 }
  cVar2 := stub_ov24_e7(((g_6826 shr 8) shl 8), ((g_6826 shr 8) shl 8), g_6826, g_6828); { 5C00:1616 }
  if (cVar2 = $0) then begin { 5C00:1616; region anchor, exact origin unknown }
    uVar3 := 1; { 5C00:1616; region anchor, exact origin unknown }
    puVar6 := local_f; { 5C00:1616; region anchor, exact origin unknown }
    uVar7 := g_6826; { 5C00:1616; region anchor, exact origin unknown }
    uVar5 := g_6828; { 5C00:1616; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$D))) := 'is Paralyzed'; { 5C00:1634 }
    FUN_00ba_1feb(puVar6, UNK_unaff_SS, uVar3, uVar7, uVar5); { 5C00:1639 }
    stub_ov24_e10((Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, $C), param_2, MakeWord(UNK_extraout_AH, $34), g_6826, g_6828); { 5C00:1652 }
  end; { 5C00:1652; region anchor, exact origin unknown }
  Exit; { 5C00:165A }
end;
```

### ov12:165D ov12_165D (conf L)

Original `ov12_165D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_AX: Word; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_1545.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:165D, paired .c.

```pascal
procedure ov12_165D();
begin
  FUN_5c00_1545((UNK_in_AX and $FF00), UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:166A }
  Exit; { 5C00:166E }
end;
```

### ov12:1671 ov12_1671 (conf L)

Original `ov12_1671`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_1545.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1671, paired .c.

```pascal
procedure ov12_1671();
begin
  FUN_5c00_1545(4, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:167E }
  Exit; { 5C00:1682 }
end;
```

### ov12:1685 ov12_1685 (conf L)

Original `ov12_1685`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_1545.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1685, paired .c.

```pascal
procedure ov12_1685();
begin
  FUN_5c00_1545(2, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1692 }
  Exit; { 5C00:1696 }
end;
```

### ov12:1699 ov12_1699 (conf L)

Original `ov12_1699`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: uVar1: Byte; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, FUN_5c00_15eb.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1699, paired .c.

```pascal
procedure ov12_1699();
begin
  uVar1 := stub_ov24_e8(8, 2); { 5C00:16A8 }
  FUN_5c00_15eb(0, uVar1, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:16B4 }
  Exit; { 5C00:16B8 }
end;
```

### ov12:16BB ov12_16BB (conf L)

Original `ov12_16BB`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: uVar1: LongWord; uVar2: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_15eb.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:16BB, paired .c.

```pascal
procedure ov12_16BB();
begin
  uVar2 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:16BB; region anchor, exact origin unknown }
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:16BB; region anchor, exact origin unknown }
  uVar1 := (Ptr<LongWord>((SmallInt(uVar1) + 10)))^; { 5C00:16BB; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((SmallInt(uVar1) + $2E)))^ <> $2) then begin { 5C00:16BB; region anchor, exact origin unknown }
    FUN_5c00_15eb(0, $3F, SmallInt(UNK_in_stack_0000000a), uVar2); { 5C00:16DF }
  end; { 5C00:16DF; region anchor, exact origin unknown }
  Exit; { 5C00:16E3 }
end;
```

### ov12:16E6 ov12_16E6 (conf L)

Original `ov12_16E6`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; iVar2: SmallInt; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, FUN_5c00_15eb.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:16E6, paired .c.

```pascal
procedure ov12_16E6();
begin
  uVar1 := stub_ov24_e8(9, 1); { 5C00:16F5 }
  iVar2 := ((uVar1 and $FF) + 10); { 5C00:16F5; region anchor, exact origin unknown }
  FUN_5c00_15eb(MakeWord(ShortInt((Word(iVar2) shr 8)), $FE), iVar2, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1704 }
  Exit; { 5C00:1708 }
end;
```

### ov12:170B ov12_170B (conf L)

Original `ov12_170B`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_1545.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:170B, paired .c.

```pascal
procedure ov12_170B();
begin
  FUN_5c00_1545($FE, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1718 }
  Exit; { 5C00:171C }
end;
```

### ov12:171F ov12_171F (conf L)

Original `ov12_171F`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:171F, paired .c.

```pascal
procedure ov12_171F();
begin
  g_681E := 1; { 5C00:1722 }
  g_6822 := (g_6822 + (-4)); { 5C00:1727 }
  Exit; { 5C00:172D }
end;
```

### ov12:1730 ov12_1730 (conf L)

Original `ov12_1730`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: bVar1: Byte; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1730, paired .c.

```pascal
procedure ov12_1730();
begin
  bVar1 := stub_ov24_e8(100, 1); { 5C00:1739 }
  if (bVar1 < $60) then begin { 5C00:1739; region anchor, exact origin unknown }
    stub_ov24_e10(0, $C, 1, $19, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:1755 }
  end; { 5C00:1755; region anchor, exact origin unknown }
  Exit; { 5C00:175B }
end;
```

### ov12:176F ov12_176F (conf L)

Original `ov12_176F`. Params (ABI order): param_1: ShortInt; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -13:2, -2:1, -1:1, +6:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; uVar1: Word; bVar2: Byte; iVar3: SmallInt; iVar4: SmallInt; uVar5: Word; uVar6: Word; unaff_SS: Word; puVar7: ^Byte; iVar8: SmallInt; local_15: array[0..17-1] of Byte; local_4: Byte; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e2, System.@StrCopy, FUN_00ba_16ec, stub_ov24_e9, stub_ov24_e19, FUN_00ba_2637.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:176F, paired .c.

```pascal
procedure ov12_176F(param_1: ShortInt; param_2: LongWord; param_3: LongWord);
begin
  uVar5 := Word((LongWord(param_2) shr $10)); { 5C00:176F; region anchor, exact origin unknown }
  iVar3 := SmallInt(param_2); { 5C00:176F; region anchor, exact origin unknown }
  iVar4 := (Word((Ptr<Byte>((iVar3 + 3)))^) * 4); { 5C00:176F; region anchor, exact origin unknown }
  g_6826 := (Ptr<SmallInt>((Ptr<UnknownValue>(@g_65B9) + iVar4)))^; { 5C00:178C }
  g_6828 := (Ptr<Word>((Ptr<UnknownValue>(@g_65BB) + iVar4)))^; { 5C00:178F }
  iVar4 := SmallInt(param_3); { 5C00:178F; region anchor, exact origin unknown }
  uVar6 := Word((LongWord(param_3) shr $10)); { 5C00:178F; region anchor, exact origin unknown }
  if (((param_1 = $0) and then ((Ptr<ShortInt>((iVar4 + $10D)))^ <> $0)) and then ((Ptr<ShortInt>((g_6826 + $10D)))^ <> $0)) then begin { 5C00:178F; region anchor, exact origin unknown }
    puVar7 := local_15; { 5C00:178F; region anchor, exact origin unknown }
    iVar8 := iVar4; { 5C00:178F; region anchor, exact origin unknown }
    uVar1 := uVar6; { 5C00:178F; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$13))) := 'Sucks some Blood'; { 5C00:181F }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH_00, 1), MakeWord(UNK_extraout_AH_00, 10), puVar7, UNK_unaff_SS, iVar8, uVar1); { 5C00:182A }
    uVar1 := stub_ov24_e9(MakeWord(UNK_extraout_AH_01, 4), MakeWord(UNK_extraout_AH_01, 1)); { 5C00:1835 }
    local_4 := Byte(uVar1); { 5C00:183A }
    g_6819 := 0; { 5C00:183D }
    bVar2 := Byte((Word(uVar1) shr 8)); { 5C00:183D; region anchor, exact origin unknown }
    stub_ov24_e19((Word(bVar2) shl 8), (Word(bVar2) shl 8), uVar1, g_6826, g_6828); { 5C00:1854 }
    local_3 := FUN_00ba_2637(iVar4, uVar6); { 5C00:185F }
    if (((Ptr<ShortInt>((g_6826 + $10D)))^ = $0) or else (((Ptr<Word>((iVar3 + 1)))^ shr 4) <= Word(local_4))) then begin { 5C00:185F; region anchor, exact origin unknown }
      stub_ov24_e2(iVar3, uVar5, $4B, iVar4, uVar6); { 5C00:17C1 }
    end else begin { 5C00:17C1; region anchor, exact origin unknown }
      (Ptr<SmallInt>((iVar3 + 1)))^ := ((Ptr<SmallInt>((iVar3 + 1)))^ + (Word(local_4) * (-$10))); { 5C00:17C1; region anchor, exact origin unknown }
    end; { 5C00:17C1; region anchor, exact origin unknown }
  end else begin { 5C00:17C1; region anchor, exact origin unknown }
    stub_ov24_e2(0, 0, MakeWord(ShortInt((Word(g_6826) shr 8)), $3A), g_6826, g_6828); { 5C00:17E3 }
    if (param_1 = $0) then begin { 5C00:17E3; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar3 + 4)))^ := 0; { 5C00:17E3; region anchor, exact origin unknown }
      stub_ov24_e2(iVar3, uVar5, MakeWord(UNK_extraout_AH, $4B), iVar4, uVar6); { 5C00:18AA }
    end; { 5C00:18AA; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((iVar4 + $10D)))^ <> $0) and then ((Ptr<ShortInt>((g_6826 + $10D)))^ <> $0)) then begin { 5C00:18AA; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar4 + $108)))^) + $10)))^ := 1; { 5C00:18AA; region anchor, exact origin unknown }
    end; { 5C00:18AA; region anchor, exact origin unknown }
  end; { 5C00:18AA; region anchor, exact origin unknown }
  Exit; { 5C00:18B2 }
end;
```

### ov12:18B5 ov12_18B5 (conf L)

Original `ov12_18B5`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; extraout_AH: Byte; extraout_AH_00: Byte; iVar2: SmallInt; iVar3: SmallInt; uVar4: Word; uVar5: Word; in_stack_0000000a: LongWord; uVar6: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov31_e15, stub_ov24_e10, stub_ov24_e1.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:18B5, paired .c.

```pascal
procedure ov12_18B5();
begin
  uVar4 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:18B5; region anchor, exact origin unknown }
  iVar2 := SmallInt(UNK_in_stack_0000000a); { 5C00:18B5; region anchor, exact origin unknown }
  uVar5 := Word((LongWord((Ptr<LongWord>((iVar2 + $108)))^) shr $10)); { 5C00:18B5; region anchor, exact origin unknown }
  iVar3 := SmallInt((Ptr<LongWord>((iVar2 + $108)))^); { 5C00:18B5; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar3 + 10)))^; { 5C00:18C8 }
  g_6828 := (Ptr<Word>((iVar3 + $C)))^; { 5C00:18CB }
  uVar5 := MakeWord(ShortInt((Word(g_6826) shr 8)), $4B); { 5C00:18CB; region anchor, exact origin unknown }
  uVar6 := $CF; { 5C00:18CB; region anchor, exact origin unknown }
  uVar1 := stub_ov31_e15(g_6826, g_6828); { 5C00:18E4 }
  stub_ov24_e10(1, uVar1, uVar6, uVar5, iVar2, uVar4); { 5C00:18ED }
  stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH, $3A), g_6826, g_6828); { 5C00:1906 }
  stub_ov24_e1(0, 0, 0, g_6826, g_6828, MakeWord(UNK_extraout_AH_00, $3A)); { 5C00:191F }
  Exit; { 5C00:1925 }
end;
```

### ov12:1935 ov12_1935 (conf L)

Original `ov12_1935`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -D:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; iVar2: SmallInt; iVar3: SmallInt; uVar4: Word; uVar5: Word; unaff_SS: Word; in_stack_0000000a: LongWord; uVar6: Word; puVar7: ^Byte; local_f: array[0..13-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov31_e15, stub_ov24_e10, stub_ov24_e1, System.@StrCopy, FUN_00ba_16ec.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1935, paired .c.

```pascal
procedure ov12_1935();
begin
  uVar4 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:1935; region anchor, exact origin unknown }
  iVar2 := SmallInt(UNK_in_stack_0000000a); { 5C00:1935; region anchor, exact origin unknown }
  uVar5 := Word((LongWord((Ptr<LongWord>((iVar2 + $108)))^) shr $10)); { 5C00:1935; region anchor, exact origin unknown }
  iVar3 := SmallInt((Ptr<LongWord>((iVar2 + $108)))^); { 5C00:1935; region anchor, exact origin unknown }
  g_6826 := (Ptr<SmallInt>((iVar3 + 10)))^; { 5C00:194B }
  g_6828 := (Ptr<Word>((iVar3 + $C)))^; { 5C00:194E }
  if ((Ptr<Byte>((g_6826 + $10)))^ < $13) then begin { 5C00:194E; region anchor, exact origin unknown }
    uVar5 := MakeWord(ShortInt((Word(g_6826) shr 8)), $4A); { 5C00:194E; region anchor, exact origin unknown }
    uVar6 := 0; { 5C00:194E; region anchor, exact origin unknown }
    uVar1 := stub_ov31_e15(g_6826, g_6828); { 5C00:1971 }
    stub_ov24_e10(1, uVar1, uVar6, uVar5, iVar2, uVar4); { 5C00:197A }
    stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH, $3A), g_6826, g_6828); { 5C00:1993 }
    stub_ov24_e1(0, 0, 0, g_6826, g_6828, MakeWord(UNK_extraout_AH_00, $3A)); { 5C00:19AC }
    puVar7 := local_f; { 5C00:19AC; region anchor, exact origin unknown }
    iVar2 := g_6826; { 5C00:19AC; region anchor, exact origin unknown }
    uVar4 := g_6828; { 5C00:19AC; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$D))) := 'is held fast'; { 5C00:19C3 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH_01, 1), MakeWord(UNK_extraout_AH_01, 10), puVar7, UNK_unaff_SS, iVar2, uVar4); { 5C00:19CE }
  end; { 5C00:19CE; region anchor, exact origin unknown }
  Exit; { 5C00:19D6 }
end;
```

### ov12:19D9 ov12_19D9 (conf L)

Original `ov12_19D9`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -1:1, +8:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e22, FUN_5c00_001f.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:19D9, paired .c.

```pascal
procedure ov12_19D9(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  cVar1 := stub_ov24_e22((Ptr<Byte>((SmallInt(param_3) + $11B)))^, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:19EE }
  if (cVar1 = $0) then begin { 5C00:19EE; region anchor, exact origin unknown }
    FUN_5c00_001f(1, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $4E, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:1A0D }
  end; { 5C00:1A0D; region anchor, exact origin unknown }
  Exit; { 5C00:1A16 }
end;
```

### ov12:1A19 ov12_1A19 (conf L)

Original `ov12_1A19`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: LongWord; uVar2: Word; iVar3: SmallInt; uVar4: Word; in_stack_0000000a: LongWord; uVar5: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e9, stub_ov24_e19.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1A19, paired .c.

```pascal
procedure ov12_1A19();
begin
  g_6819 := 9; { 5C00:1A1C }
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:1A1C; region anchor, exact origin unknown }
  uVar4 := Word((LongWord(uVar1) shr $10)); { 5C00:1A1C; region anchor, exact origin unknown }
  iVar3 := SmallInt(uVar1); { 5C00:1A1C; region anchor, exact origin unknown }
  uVar5 := (Ptr<Word>((iVar3 + $C)))^; { 5C00:1A1C; region anchor, exact origin unknown }
  uVar4 := (Ptr<Word>((iVar3 + 10)))^; { 5C00:1A1C; region anchor, exact origin unknown }
  uVar2 := stub_ov24_e9(10, 2); { 5C00:1A37 }
  stub_ov24_e19(((uVar2 shr 8) shl 8), ((uVar2 shr 8) shl 8), uVar2, uVar4, uVar5); { 5C00:1A43 }
  Exit; { 5C00:1A49 }
end;
```

### ov12:1A4C ov12_1A4C (conf L)

Original `ov12_1A4C`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: LongWord; uVar2: Word; iVar3: SmallInt; uVar4: Word; in_stack_0000000a: LongWord; uVar5: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e9, stub_ov24_e19.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1A4C, paired .c.

```pascal
procedure ov12_1A4C();
begin
  g_6819 := $10; { 5C00:1A4F }
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:1A4F; region anchor, exact origin unknown }
  uVar4 := Word((LongWord(uVar1) shr $10)); { 5C00:1A4F; region anchor, exact origin unknown }
  iVar3 := SmallInt(uVar1); { 5C00:1A4F; region anchor, exact origin unknown }
  uVar5 := (Ptr<Word>((iVar3 + $C)))^; { 5C00:1A4F; region anchor, exact origin unknown }
  uVar4 := (Ptr<Word>((iVar3 + 10)))^; { 5C00:1A4F; region anchor, exact origin unknown }
  uVar2 := stub_ov24_e9(4, 1); { 5C00:1A6A }
  stub_ov24_e19(((uVar2 shr 8) shl 8), ((uVar2 shr 8) shl 8), uVar2, uVar4, uVar5); { 5C00:1A76 }
  Exit; { 5C00:1A7C }
end;
```

### ov12:1AAA ov12_1AAA (conf L)

Original `ov12_1AAA`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1C:2, -19:2, -5:1, -4:2, -2:2, +C:2, +E:2.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; uVar3: Word; bVar6: Byte; uVar4: Word; uVar5: Word; unaff_SS: Word; in_stack_0000000a: Word; in_stack_0000000c: Word; puVar7: ^Byte; uVar8: Word; uVar9: Word; uVar10: Word; uVar11: Word; iVar12: SmallInt; iVar13: SmallInt; local_1e: array[0..3-1] of Byte; local_1b: array[0..20-1] of Byte; local_7: Byte; local_6: SmallInt; iStack_4: SmallInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_23b7, stub_ov24_e7, System.@StrCopy, stub_ov24_e20.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1AAA, paired .c.

```pascal
procedure ov12_1AAA();
begin
  iStack_4 := g_5D98; { 5C00:1AAA; region anchor, exact origin unknown }
  local_6 := g_5D96; { 5C00:1AB7 }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do begin { 5C00:1AB7; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((local_6 + $10D)))^ <> $0) and then Seq(uVar3 := FUN_00ba_23b7(UNK_in_stack_0000000a, UNK_in_stack_0000000c), (ShortInt(uVar3) = (Ptr<ShortInt>((local_6 + $10E)))^))) then begin { 5C00:1ADC }
      bVar6 := Byte((Word(uVar3) shr 8)); { 5C00:1ADC; region anchor, exact origin unknown }
      local_7 := stub_ov24_e7((Word(bVar6) shl 8), MakeWord(bVar6, 4), local_6, iStack_4); { 5C00:1AFA }
      cVar2 := (Ptr<ShortInt>((local_6 + $73)))^; { 5C00:1AFA; region anchor, exact origin unknown }
      if ((cVar2 < $0) or else ($3 < cVar2)) then begin { 5C00:1AFA; region anchor, exact origin unknown }
        if ((cVar2 = $4) or else (cVar2 = $5)) then begin { 5C00:1AFA; region anchor, exact origin unknown }
          uVar4 := 2; { 5C00:1AFA; region anchor, exact origin unknown }
          uVar11 := 0; { 5C00:1AFA; region anchor, exact origin unknown }
          uVar10 := $C; { 5C00:1AFA; region anchor, exact origin unknown }
          uVar9 := 0; { 5C00:1AFA; region anchor, exact origin unknown }
          uVar8 := 1; { 5C00:1AFA; region anchor, exact origin unknown }
          uVar5 := Word(local_7); { 5C00:1AFA; region anchor, exact origin unknown }
          puVar7 := local_1b; { 5C00:1AFA; region anchor, exact origin unknown }
          uVar3 := UNK_unaff_SS; { 5C00:1AFA; region anchor, exact origin unknown }
          iVar12 := local_6; { 5C00:1AFA; region anchor, exact origin unknown }
          iVar13 := iStack_4; { 5C00:1AFA; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$1C))) := 'is paralyzed with fear'; { 5C00:1B34 }
          stub_ov24_e20(puVar7, uVar3, uVar5, uVar8, uVar9, uVar10, uVar11, uVar4, iVar12, iVar13); { 5C00:1B39 }
        end; { 5C00:1B39; region anchor, exact origin unknown }
      end else begin { 5C00:1B39; region anchor, exact origin unknown }
        uVar4 := $34; { 5C00:1B39; region anchor, exact origin unknown }
        uVar11 := 0; { 5C00:1B39; region anchor, exact origin unknown }
        uVar10 := $C; { 5C00:1B39; region anchor, exact origin unknown }
        uVar9 := 0; { 5C00:1B39; region anchor, exact origin unknown }
        uVar8 := 1; { 5C00:1B39; region anchor, exact origin unknown }
        uVar5 := Word(local_7); { 5C00:1B39; region anchor, exact origin unknown }
        puVar7 := local_1e; { 5C00:1B39; region anchor, exact origin unknown }
        uVar3 := UNK_unaff_SS; { 5C00:1B39; region anchor, exact origin unknown }
        iVar12 := local_6; { 5C00:1B39; region anchor, exact origin unknown }
        iVar13 := iStack_4; { 5C00:1B39; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$19))) := 'is weakened by fear'; { 5C00:1B6B }
        stub_ov24_e20(puVar7, uVar3, uVar5, uVar8, uVar9, uVar10, uVar11, uVar4, iVar12, iVar13); { 5C00:1B70 }
      end; { 5C00:1B70; region anchor, exact origin unknown }
    end; { 5C00:1B70; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_6 + $104)); { 5C00:1B70; region anchor, exact origin unknown }
    iStack_4 := (Ptr<SmallInt>((local_6 + $106)))^; { 5C00:1B70; region anchor, exact origin unknown }
    local_6 := (piVar1)^; { 5C00:1B82 }
  end; { 5C00:1B82; region anchor, exact origin unknown }
  Exit; { 5C00:1B8E }
end;
```

### ov12:1BA8 ov12_1BA8 (conf L)

Original `ov12_1BA8`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1D:2, -6:1, -5:1, -4:2, -2:2, +C:2, +E:2.
Locals/SSA temporaries: puVar1: ^Word; cVar2: ShortInt; bVar6: Byte; uVar3: Word; uVar4: Word; uVar5: Word; unaff_SS: Word; in_stack_0000000a: Word; in_stack_0000000c: Word; puVar7: ^Byte; uVar8: Word; uVar9: Word; uVar10: Word; uVar11: Word; uVar12: Word; uVar13: Word; local_1f: array[0..23-1] of Byte; local_8: Byte; local_7: ShortInt; local_6: Word; uStack_4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e2, FUN_00ba_23b7, stub_ov24_e7, stub_ov24_e8, System.@StrCopy, stub_ov24_e20.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1BA8, paired .c.

```pascal
procedure ov12_1BA8();
begin
  uStack_4 := g_5D98; { 5C00:1BA8; region anchor, exact origin unknown }
  local_6 := g_5D96; { 5C00:1BB5 }
  while ((local_6 or uStack_4) <> 0) do begin { 5C00:1BB5; region anchor, exact origin unknown }
    stub_ov24_e2(0, 0, MakeWord(ShortInt(((local_6 or uStack_4) shr 8)), $52), local_6, uStack_4); { 5C00:1BD5 }
    if (((Ptr<ShortInt>((local_6 + $10D)))^ <> $0) and then Seq(cVar2 := FUN_00ba_23b7(UNK_in_stack_0000000a, UNK_in_stack_0000000c), (cVar2 = (Ptr<ShortInt>((local_6 + $10E)))^))) then begin { 5C00:1BEE }
      local_7 := (5 < Byte(Ptr<Byte>(@g_6814)[(Ptr<ShortInt>((local_6 + $10E)))^])); { 5C00:1BFD }
      if ((Ptr<ShortInt>((local_6 + $2E)))^ = $7) then begin { 5C00:1BFD; region anchor, exact origin unknown }
        local_7 := (local_7 + $2); { 5C00:1C13 }
      end; { 5C00:1C13; region anchor, exact origin unknown }
      bVar6 := ((Ptr<ShortInt>((local_6 + $10E)))^ shr 7); { 5C00:1C13; region anchor, exact origin unknown }
      local_8 := stub_ov24_e7(MakeWord(bVar6, local_7), (Word(bVar6) shl 8), local_6, uStack_4); { 5C00:1C31 }
      uVar3 := $34; { 5C00:1C31; region anchor, exact origin unknown }
      uVar12 := local_6; { 5C00:1C31; region anchor, exact origin unknown }
      uVar13 := uStack_4; { 5C00:1C31; region anchor, exact origin unknown }
      uVar4 := stub_ov24_e8(4, 1); { 5C00:1C48 }
      uVar4 := (uVar4 and $FF); { 5C00:1C48; region anchor, exact origin unknown }
      uVar11 := $C; { 5C00:1C48; region anchor, exact origin unknown }
      uVar10 := 0; { 5C00:1C48; region anchor, exact origin unknown }
      uVar9 := 1; { 5C00:1C48; region anchor, exact origin unknown }
      uVar5 := Word(local_8); { 5C00:1C48; region anchor, exact origin unknown }
      puVar7 := local_1f; { 5C00:1C48; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 5C00:1C48; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$1D))) := 'is paralyzed with fear'; { 5C00:1C67 }
      stub_ov24_e20(puVar7, uVar8, uVar5, uVar9, uVar10, uVar11, uVar4, uVar3, uVar12, uVar13); { 5C00:1C6C }
    end; { 5C00:1C6C; region anchor, exact origin unknown }
    puVar1 := Ptr<Word>((local_6 + $104)); { 5C00:1C6C; region anchor, exact origin unknown }
    uStack_4 := (Ptr<Word>((local_6 + $106)))^; { 5C00:1C6C; region anchor, exact origin unknown }
    local_6 := (puVar1)^; { 5C00:1C7E }
  end; { 5C00:1C7E; region anchor, exact origin unknown }
  Exit; { 5C00:1C8A }
end;
```

### ov12:1CAD ov12_1CAD (conf L)

Original `ov12_1CAD`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -16:2, -13:2, -12:2, -9:2, -5:1, -4:2, -2:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; uVar2: Word; uVar3: Word; uVar4: Word; extraout_AH_01: Byte; uVar5: Word; extraout_AH_02: Byte; bVar6: Byte; iVar7: SmallInt; iVar8: SmallInt; uVar9: Word; uVar10: Word; unaff_SS: Word; in_stack_0000000a: LongWord; puVar11: ^Byte; local_18: array[0..3-1] of Byte; local_15: Byte; local_14: array[0..9-1] of Byte; local_b: array[0..4-1] of Byte; local_7: ShortInt; local_6: Word; uStack_4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_16ec, FUN_00ba_19de, stub_ov31_e12, stub_ov31_e13, FUN_00ba_1a29, FUN_00ba_2199, stub_ov24_e7, FUN_5c00_0058.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1CAD, paired .c.

```pascal
procedure ov12_1CAD();
begin
  uVar9 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:1CAD; region anchor, exact origin unknown }
  iVar7 := SmallInt(UNK_in_stack_0000000a); { 5C00:1CAD; region anchor, exact origin unknown }
  uVar10 := Word((LongWord((Ptr<LongWord>((iVar7 + $108)))^) shr $10)); { 5C00:1CAD; region anchor, exact origin unknown }
  iVar8 := SmallInt((Ptr<LongWord>((iVar7 + $108)))^); { 5C00:1CAD; region anchor, exact origin unknown }
  g_6826 := (Ptr<SmallInt>((iVar8 + 10)))^; { 5C00:1CC3 }
  g_6828 := (Ptr<Word>((iVar8 + $C)))^; { 5C00:1CC6 }
  puVar11 := local_14; { 5C00:1CC6; region anchor, exact origin unknown }
  uVar10 := UNK_unaff_SS; { 5C00:1CC6; region anchor, exact origin unknown }
  iVar8 := iVar7; { 5C00:1CC6; region anchor, exact origin unknown }
  uVar2 := uVar9; { 5C00:1CC6; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$12))) := 'gazes...'; { 5C00:1CDA }
  FUN_00ba_16ec((Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 10), puVar11, uVar10, iVar8, uVar2); { 5C00:1CE5 }
  FUN_00ba_19de(MakeWord(UNK_extraout_AH_00, $12)); { 5C00:1CED }
  uVar10 := stub_ov31_e12(iVar7, uVar9); { 5C00:1CF8 }
  uVar2 := stub_ov31_e13(iVar7, uVar9); { 5C00:1D04 }
  uVar3 := stub_ov31_e12(g_6826, g_6828); { 5C00:1D12 }
  uVar4 := stub_ov31_e13(g_6826, g_6828); { 5C00:1D20 }
  FUN_00ba_1a29($2D, 4, uVar4, uVar3, uVar2, uVar10); { 5C00:1D2C }
  uVar5 := FUN_00ba_2199(local_b, UNK_unaff_SS, MakeWord(UNK_extraout_AH_01, $7F), iVar7, uVar9); { 5C00:1D3F }
  if (ShortInt(uVar5) <> $0) then begin { 5C00:1D3F; region anchor, exact origin unknown }
    local_7 := $0; { 5C00:1D4B }
    _local_6 := MakeLong((Ptr<Word>((g_6826 + $CA)))^, (Ptr<Word>((g_6826 + 200)))^); { 5C00:1D4B; region anchor, exact origin unknown }
    while true do begin { 5C00:1D4B; region anchor, exact origin unknown }
      uVar5 := (local_6 or uStack_4); { 5C00:1D4B; region anchor, exact origin unknown }
      if ((uVar5 = 0) or else (local_7 <> $0)) then begin { 5C00:1D4B; region anchor, exact origin unknown }
        Break; { 5C00:1D4B; region anchor, exact origin unknown }
      end; { 5C00:1D4B; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>((local_6 + $34)))^ <> $0) and then ((((Ptr<ShortInt>((local_6 + $2F)))^ = $76) or else ((Ptr<ShortInt>((local_6 + $30)))^ = $76)) or else ((Ptr<ShortInt>((local_6 + $31)))^ = $76))) then begin { 5C00:1D4B; region anchor, exact origin unknown }
        puVar11 := local_18; { 5C00:1D4B; region anchor, exact origin unknown }
        uVar10 := UNK_unaff_SS; { 5C00:1D4B; region anchor, exact origin unknown }
        iVar8 := g_6826; { 5C00:1D4B; region anchor, exact origin unknown }
        uVar2 := g_6828; { 5C00:1D4B; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$16))) := 'reflects it!'; { 5C00:1DB4 }
        FUN_00ba_16ec((Word(UNK_extraout_AH_02) shl 8), MakeWord(UNK_extraout_AH_02, $C), puVar11, uVar10, iVar8, uVar2); { 5C00:1DBF }
        uVar10 := stub_ov31_e12(g_6826, g_6828); { 5C00:1DCC }
        uVar2 := stub_ov31_e13(g_6826, g_6828); { 5C00:1DDA }
        uVar3 := stub_ov31_e12(iVar7, uVar9); { 5C00:1DE6 }
        uVar4 := stub_ov31_e13(iVar7, uVar9); { 5C00:1DF2 }
        FUN_00ba_1a29($2D, 4, uVar4, uVar3, uVar2, uVar10); { 5C00:1DFE }
        local_7 := $1; { 5C00:1E03 }
        g_6826 := iVar7; { 5C00:1E0D }
        g_6828 := uVar9; { 5C00:1E10 }
      end; { 5C00:1E10; region anchor, exact origin unknown }
      uVar10 := Word((LongWord(_local_6) shr $10)); { 5C00:1E10; region anchor, exact origin unknown }
      _local_6 := MakeLong((Ptr<Word>((SmallInt(_local_6) + $2C)))^, (Ptr<Word>((SmallInt(_local_6) + $2A)))^); { 5C00:1E10; region anchor, exact origin unknown }
    end; { 5C00:1E10; region anchor, exact origin unknown }
  end; { 5C00:1E10; region anchor, exact origin unknown }
  bVar6 := Byte((uVar5 shr 8)); { 5C00:1E10; region anchor, exact origin unknown }
  cVar1 := stub_ov24_e7((Word(bVar6) shl 8), MakeWord(bVar6, 1), g_6826, g_6828); { 5C00:1E36 }
  if (cVar1 = $0) then begin { 5C00:1E36; region anchor, exact origin unknown }
    uVar2 := 7; { 5C00:1E36; region anchor, exact origin unknown }
    puVar11 := @local_15; { 5C00:1E36; region anchor, exact origin unknown }
    iVar8 := g_6826; { 5C00:1E36; region anchor, exact origin unknown }
    uVar10 := g_6828; { 5C00:1E36; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$13))) := 'is Stoned'; { 5C00:1E54 }
    FUN_5c00_0058(puVar11, UNK_unaff_SS, uVar2, iVar8, uVar10); { 5C00:1E5A }
  end; { 5C00:1E5A; region anchor, exact origin unknown }
  Exit; { 5C00:1E60 }
end;
```

### ov12:1E77 ov12_1E77 (conf L)

Original `ov12_1E77`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -13:2, -11:2, -8:1/2, -7:1/2, -6:2, -4:2, -2:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; extraout_AH: Byte; extraout_AH_00: Byte; uVar3: Word; uVar4: Word; extraout_AH_01: Byte; uVar6: Byte; uVar5: Word; extraout_AH_02: Byte; bVar7: Byte; iVar8: SmallInt; iVar9: SmallInt; uVar10: Word; uVar11: Word; uVar12: Word; unaff_SS: Word; in_stack_0000000a: LongWord; puVar13: ^Byte; uVar14: Word; local_15: array[0..2-1] of Byte; local_13: array[0..9-1] of Byte; local_a: Byte; local_9: Byte; local_8: Word; local_6: Word; local_4: array[0..2-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov31_e12, stub_ov31_e13, stub_ov13_e8, stub_ov30_e5, System.@StrCopy, FUN_00ba_16ec, FUN_00ba_19de, FUN_00ba_1a29, stub_ov24_e7, stub_ov24_e20, FUN_00ba_2199, stub_ov24_e1.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:1E77, paired .c.

```pascal
procedure ov12_1E77();
begin
  uVar10 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:1E77; region anchor, exact origin unknown }
  iVar8 := SmallInt(UNK_in_stack_0000000a); { 5C00:1E77; region anchor, exact origin unknown }
  uVar11 := Word((LongWord((Ptr<LongWord>((iVar8 + $108)))^) shr $10)); { 5C00:1E77; region anchor, exact origin unknown }
  iVar9 := SmallInt((Ptr<LongWord>((iVar8 + $108)))^); { 5C00:1E77; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar9 + 10)))^; { 5C00:1E8D }
  g_6828 := (Ptr<Word>((iVar9 + $C)))^; { 5C00:1E90 }
  local_9 := stub_ov31_e12(g_6826, g_6828); { 5C00:1E9C }
  local_a := stub_ov31_e13(g_6826, g_6828); { 5C00:1EAC }
  cVar1 := stub_ov13_e8(g_6826, g_6828, iVar8, uVar10); { 5C00:1EC2 }
  if (cVar1 <> $0) then begin { 5C00:1EC2; region anchor, exact origin unknown }
    uVar11 := stub_ov31_e12(iVar8, uVar10); { 5C00:1ED4 }
    uVar2 := stub_ov31_e13(iVar8, uVar10); { 5C00:1EE0 }
    cVar1 := stub_ov30_e5(Word(g_6716), ExtractBytes(g_6716, 2, 2), local_4, UNK_unaff_SS, @local_a, UNK_unaff_SS, @local_9, UNK_unaff_SS, uVar2, uVar11); { 5C00:1EFD }
    if (cVar1 <> $0) then begin { 5C00:1EFD; region anchor, exact origin unknown }
      puVar13 := local_13; { 5C00:1EFD; region anchor, exact origin unknown }
      uVar11 := UNK_unaff_SS; { 5C00:1EFD; region anchor, exact origin unknown }
      iVar9 := iVar8; { 5C00:1EFD; region anchor, exact origin unknown }
      uVar2 := uVar10; { 5C00:1EFD; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$11))) := 'Gazes...'; { 5C00:1F19 }
      FUN_00ba_16ec((Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 10), puVar13, uVar11, iVar9, uVar2); { 5C00:1F24 }
      FUN_00ba_19de(MakeWord(UNK_extraout_AH_00, $12)); { 5C00:1F2C }
      uVar11 := stub_ov31_e12(iVar8, uVar10); { 5C00:1F37 }
      uVar2 := stub_ov31_e13(iVar8, uVar10); { 5C00:1F43 }
      uVar3 := stub_ov31_e12(g_6826, g_6828); { 5C00:1F51 }
      uVar4 := stub_ov31_e13(g_6826, g_6828); { 5C00:1F5F }
      FUN_00ba_1a29($2D, 4, uVar4, uVar3, uVar2, uVar11); { 5C00:1F6B }
      g_681B := 10; { 5C00:1F70 }
      uVar3 := MakeWord(UNK_extraout_AH_01, $B); { 5C00:1F70; region anchor, exact origin unknown }
      uVar14 := 0; { 5C00:1F70; region anchor, exact origin unknown }
      iVar9 := (((Ptr<ShortInt>((iVar8 + $10E)))^ * $80) + $C); { 5C00:1F70; region anchor, exact origin unknown }
      uVar6 := Byte((Word(iVar9) shr 8)); { 5C00:1F70; region anchor, exact origin unknown }
      uVar4 := MakeWord(uVar6, 1); { 5C00:1F70; region anchor, exact origin unknown }
      uVar5 := MakeWord(uVar6, 1); { 5C00:1F70; region anchor, exact origin unknown }
      uVar12 := Word((LongWord((Ptr<LongWord>((iVar8 + $108)))^) shr $10)); { 5C00:1F70; region anchor, exact origin unknown }
      iVar8 := SmallInt((Ptr<LongWord>((iVar8 + $108)))^); { 5C00:1F70; region anchor, exact origin unknown }
      uVar11 := g_6826; { 5C00:1F70; region anchor, exact origin unknown }
      uVar2 := g_6828; { 5C00:1F70; region anchor, exact origin unknown }
      uVar12 := stub_ov24_e7(MakeWord(uVar6, $FE), MakeWord(uVar6, 4), (Ptr<Word>((iVar8 + 10)))^, (Ptr<Word>((iVar8 + $C)))^); { 5C00:1FB0 }
      puVar13 := local_15; { 5C00:1FB0; region anchor, exact origin unknown }
      uVar10 := UNK_unaff_SS; { 5C00:1FB0; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$13))) := 'is charmed'; { 5C00:1FC0 }
      stub_ov24_e20(puVar13, uVar10, uVar12, uVar5, uVar4, iVar9, uVar14, uVar3, uVar11, uVar2); { 5C00:1FC5 }
      uVar10 := FUN_00ba_2199(@local_8, UNK_unaff_SS, MakeWord(UNK_extraout_AH_02, $B), g_6826, g_6828); { 5C00:1FDA }
      bVar7 := Byte((Word(uVar10) shr 8)); { 5C00:1FDA; region anchor, exact origin unknown }
      if (ShortInt(uVar10) <> $0) then begin { 5C00:1FDA; region anchor, exact origin unknown }
        stub_ov24_e1((Word(bVar7) shl 8), local_8, local_6, g_6826, g_6828, MakeWord(bVar7, $B)); { 5C00:1FF7 }
      end; { 5C00:1FF7; region anchor, exact origin unknown }
    end; { 5C00:1FF7; region anchor, exact origin unknown }
  end; { 5C00:1FF7; region anchor, exact origin unknown }
  Exit; { 5C00:1FFF }
end;
```

### ov12:2002 FUN_5c00_2002 (conf L)

Original `FUN_5c00_2002`. Params (ABI order): param_1: SmallInt.
BP access inventory (hex offset:byte widths): -4:1, -3:1, -2:1, -1:1, +6:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; uVar3: Word; uVar4: Word; iVar5: SmallInt; unaff_SS: Word; local_5: ShortInt; local_4: ShortInt; local_3: ShortInt.
Callers: FUN_5c00_2122.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2002, paired .c.

```pascal
function FUN_5c00_2002(param_1: SmallInt): Word;
begin
  (Ptr<Word>((param_1 + (-$31))))^ := 0; { 5C00:2002; region anchor, exact origin unknown }
  (Ptr<Word>((param_1 + (-$2F))))^ := 0; { 5C00:2002; region anchor, exact origin unknown }
  local_5 := $0; { 5C00:2015 }
  local_4 := $0; { 5C00:2019 }
  while true do begin { 5C00:2019; region anchor, exact origin unknown }
    cVar1 := (Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((param_1 + 8)))^) + SmallInt(local_4)) + $96)))^; { 5C00:2019; region anchor, exact origin unknown }
    if (cVar1 < $2) then begin { 5C00:2019; region anchor, exact origin unknown }
      uVar3 := 0; { 5C00:2019; region anchor, exact origin unknown }
      (Ptr<Word>((param_1 + (-$2D))))^ := 0; { 5C00:2019; region anchor, exact origin unknown }
      (Ptr<Word>((param_1 + (-$2B))))^ := 0; { 5C00:2019; region anchor, exact origin unknown }
    end else begin { 5C00:2019; region anchor, exact origin unknown }
      iVar5 := ((local_4 * $38) + (cVar1 * 4)); { 5C00:2019; region anchor, exact origin unknown }
      uVar3 := (Ptr<Word>((Ptr<UnknownValue>(@g_409B) + iVar5)))^; { 5C00:2019; region anchor, exact origin unknown }
      uVar2 := (Ptr<Word>((Ptr<UnknownValue>(@g_409D) + iVar5)))^; { 5C00:2019; region anchor, exact origin unknown }
      (Ptr<Word>((param_1 + (-$2D))))^ := uVar3; { 5C00:2019; region anchor, exact origin unknown }
      (Ptr<Word>((param_1 + (-$2B))))^ := uVar2; { 5C00:2019; region anchor, exact origin unknown }
    end; { 5C00:2019; region anchor, exact origin unknown }
    uVar4 := MakeWord(ShortInt((Word(uVar3) shr 8)), cVar1); { 5C00:2019; region anchor, exact origin unknown }
    if (local_5 <= cVar1) then begin { 5C00:2019; region anchor, exact origin unknown }
      uVar4 := (Ptr<Word>((param_1 + (-$2D))))^; { 5C00:2019; region anchor, exact origin unknown }
      if ((((Ptr<SmallInt>((param_1 + (-$2F))))^ < (Ptr<SmallInt>((param_1 + (-$2B))))^) or else (((Ptr<SmallInt>((param_1 + (-$2F))))^ <= (Ptr<SmallInt>((param_1 + (-$2B))))^) and then ((Ptr<Word>((param_1 + (-$31))))^ <= uVar4))) or else (((Ptr<SmallInt>((param_1 + (-$2B))))^ = (-1)) and then ((Ptr<SmallInt>((param_1 + (-$2D))))^ = (-1)))) then begin { 5C00:2019; region anchor, exact origin unknown }
        uVar3 := (Ptr<Word>((param_1 + (-$2D))))^; { 5C00:2019; region anchor, exact origin unknown }
        uVar2 := (Ptr<Word>((param_1 + (-$2B))))^; { 5C00:2019; region anchor, exact origin unknown }
        (Ptr<Word>((param_1 + (-$31))))^ := uVar3; { 5C00:2019; region anchor, exact origin unknown }
        (Ptr<Word>((param_1 + (-$2F))))^ := uVar2; { 5C00:2019; region anchor, exact origin unknown }
        local_3 := local_4; { 5C00:20C4 }
        uVar4 := MakeWord(ShortInt((Word(uVar3) shr 8)), cVar1); { 5C00:20C4; region anchor, exact origin unknown }
        local_5 := cVar1; { 5C00:20CA }
      end; { 5C00:20CA; region anchor, exact origin unknown }
    end; { 5C00:20CA; region anchor, exact origin unknown }
    if (local_4 = $7) then begin { 5C00:20CA; region anchor, exact origin unknown }
      Break; { 5C00:20CA; region anchor, exact origin unknown }
    end; { 5C00:20CA; region anchor, exact origin unknown }
    local_4 := (local_4 + $1); { 5C00:201F }
  end; { 5C00:201F; region anchor, exact origin unknown }
  Exit(MakeWord(ShortInt((uVar4 shr 8)), local_3)); { 5C00:20DC }
end;
```

### ov12:2122 FUN_5c00_2122 (conf L)

Original `FUN_5c00_2122`. Params (ABI order): param_1: Byte; param_2: LongWord.
BP access inventory (hex offset:byte widths): -136:2, -47:2, -46:2, -44:2, -41:2, -38:1, -37:1, -36:1, -35:1, -34:1, -33:1, -32:1, -31:2, -2F:2, -29:2, +6:1, +8:2, +A:2.
Locals/SSA temporaries: pcVar1: ^ShortInt; cVar2: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; uVar3: Word; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar4: Word; unaff_SS: Word; puVar5: ^Byte; uVar6: Word; iVar7: SmallInt; local_138: array[0..239-1] of Byte; local_49: Byte; local_48: array[0..2-1] of Byte; local_46: array[0..3-1] of Byte; local_43: array[0..9-1] of Byte; local_3a: Byte; local_39: Byte; local_38: Byte; local_37: Byte; local_36: Byte; local_35: Byte; local_34: ShortInt; local_33: Word; local_31: Word; local_2b: array[0..41-1] of Byte.
Callers: ov12_23A4,ov12_23C2.
Callees (listing): FUN_00ba_1037, System.@StrAppend, System.@StrAssign, System.@StrCopy, FUN_00ba_16ec, FUN_5c00_0058, stub_ov33_e1, FUN_5c00_2002, stub_ov23_e1, FUN_00ba_0bb8.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2122, paired .c.

```pascal
procedure FUN_5c00_2122(param_1: Byte; param_2: LongWord);
begin
  if (param_1 < 2) then begin { 5C00:2122; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$136))), 1, $28); { 5C00:2151 }
  end else begin { 5C00:2151; region anchor, exact origin unknown }
    puVar5 := local_138; { 5C00:2151; region anchor, exact origin unknown }
    uVar6 := UNK_unaff_SS; { 5C00:2151; region anchor, exact origin unknown }
    FUN_00ba_1037(param_1); { 5C00:2139 }
    PString(FarPtr(SS, BPAddr(-$136))) := PString(FarPtr(SS, BPAddr(-$136))) + ' levels'; { 5C00:2143 }
    PString(FarPtr(SS, BPAddr(-$29))) := Copy('a level', 1, $28); { 5C00:2166 }
  end; { 5C00:2166; region anchor, exact origin unknown }
  puVar5 := local_138; { 5C00:2166; region anchor, exact origin unknown }
  uVar6 := UNK_unaff_SS; { 5C00:2166; region anchor, exact origin unknown }
  iVar7 := SmallInt(param_2); { 5C00:2166; region anchor, exact origin unknown }
  uVar3 := ExtractBytes(param_2, 2, 2); { 5C00:2166; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$136))) := 'is drained '; { 5C00:217C }
  PString(FarPtr(SS, BPAddr(-$136))) := PString(FarPtr(SS, BPAddr(-$136))) + PString(FarPtr(SS, BPAddr(-$29))); { 5C00:2186 }
  FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar5, uVar6, iVar7, uVar3); { 5C00:2191 }
  if ((Ptr<ShortInt>((SmallInt(param_2) + $10C)))^ = $1) then begin { 5C00:2191; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_00, 8); { 5C00:2191; region anchor, exact origin unknown }
    puVar5 := local_48; { 5C00:2191; region anchor, exact origin unknown }
    iVar7 := SmallInt(param_2); { 5C00:2191; region anchor, exact origin unknown }
    uVar6 := ExtractBytes(param_2, 2, 2); { 5C00:2191; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$46))) := 'is dead forever'; { 5C00:21B4 }
    FUN_5c00_0058(puVar5, UNK_unaff_SS, uVar3, iVar7, uVar6); { 5C00:21BA }
    (Ptr<Byte>((SmallInt(param_2) + $32)))^ := 0; { 5C00:21BA; region anchor, exact origin unknown }
  end else begin { 5C00:21BA; region anchor, exact origin unknown }
    local_39 := param_1; { 5C00:21CB }
    if (param_1 <> 0) then begin { 5C00:21CB; region anchor, exact origin unknown }
      local_35 := 1; { 5C00:21D8 }
      while true do begin { 5C00:21D8; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((SmallInt(param_2) + $10C)))^ <> $8) then begin { 5C00:21D8; region anchor, exact origin unknown }
          (Ptr<ShortInt>((SmallInt(param_2) + $74)))^ := ((Ptr<ShortInt>((SmallInt(param_2) + $74)))^ + $1); { 5C00:21D8; region anchor, exact origin unknown }
          local_36 := 0; { 5C00:21F5 }
          local_34 := $0; { 5C00:21F9 }
          while Seq(local_36 := (local_36 + (Ptr<ShortInt>(((SmallInt(param_2) + local_34) + $96)))^), (local_34 <> $7)) do begin { 5C00:21F9; region anchor, exact origin unknown }
            local_34 := (local_34 + $1); { 5C00:21FF }
          end; { 5C00:21FF; region anchor, exact origin unknown }
          local_37 := ((Ptr<Byte>((SmallInt(param_2) + $32)))^ div local_36); { 5C00:222C }
          puVar5 := local_46; { 5C00:222C; region anchor, exact origin unknown }
          uVar6 := UNK_unaff_SS; { 5C00:222C; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$44))) := 'max,cur,lost'; { 5C00:2239 }
          stub_ov33_e1(MakeWord(UNK_extraout_AH_01, (Ptr<Byte>((SmallInt(param_2) + $75)))^), MakeWord(UNK_extraout_AH_01, (Ptr<Byte>((SmallInt(param_2) + $11B)))^), MakeWord(UNK_extraout_AH_01, (Ptr<Byte>((SmallInt(param_2) + $32)))^), puVar5, uVar6); { 5C00:2257 }
          local_3a := local_37; { 5C00:225F }
          if (local_37 <> 0) then begin { 5C00:225F; region anchor, exact origin unknown }
            local_38 := 1; { 5C00:2269 }
            while true do begin { 5C00:2269; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((SmallInt(param_2) + $32)))^ <> $0) then begin { 5C00:2269; region anchor, exact origin unknown }
                (Ptr<ShortInt>((SmallInt(param_2) + $32)))^ := ((Ptr<ShortInt>((SmallInt(param_2) + $32)))^ + (-1)); { 5C00:2269; region anchor, exact origin unknown }
              end; { 5C00:2269; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((SmallInt(param_2) + $B1)))^ <> $0) then begin { 5C00:2269; region anchor, exact origin unknown }
                (Ptr<ShortInt>((SmallInt(param_2) + $B1)))^ := ((Ptr<ShortInt>((SmallInt(param_2) + $B1)))^ + (-1)); { 5C00:2269; region anchor, exact origin unknown }
              end; { 5C00:2269; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((SmallInt(param_2) + $11B)))^ <> $0) then begin { 5C00:2269; region anchor, exact origin unknown }
                (Ptr<ShortInt>((SmallInt(param_2) + $11B)))^ := ((Ptr<ShortInt>((SmallInt(param_2) + $11B)))^ + (-1)); { 5C00:2269; region anchor, exact origin unknown }
              end; { 5C00:2269; region anchor, exact origin unknown }
              (Ptr<ShortInt>((SmallInt(param_2) + $75)))^ := ((Ptr<ShortInt>((SmallInt(param_2) + $75)))^ + $1); { 5C00:2269; region anchor, exact origin unknown }
              if (local_38 = local_37) then begin { 5C00:2269; region anchor, exact origin unknown }
                Break; { 5C00:2269; region anchor, exact origin unknown }
              end; { 5C00:2269; region anchor, exact origin unknown }
              local_38 := (local_38 + 1); { 5C00:226E }
            end; { 5C00:226E; region anchor, exact origin unknown }
          end; { 5C00:226E; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((SmallInt(param_2) + $73)))^ < $2) then begin { 5C00:226E; region anchor, exact origin unknown }
            uVar4 := MakeWord(UNK_extraout_AH_02, 8); { 5C00:226E; region anchor, exact origin unknown }
            puVar5 := @local_49; { 5C00:226E; region anchor, exact origin unknown }
            uVar6 := UNK_unaff_SS; { 5C00:226E; region anchor, exact origin unknown }
            iVar7 := SmallInt(param_2); { 5C00:226E; region anchor, exact origin unknown }
            uVar3 := ExtractBytes(param_2, 2, 2); { 5C00:226E; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$47))) := 'is dead forever'; { 5C00:22D4 }
            FUN_5c00_0058(puVar5, uVar6, uVar4, iVar7, uVar3); { 5C00:22DA }
            (Ptr<Byte>((SmallInt(param_2) + $32)))^ := 0; { 5C00:22DA; region anchor, exact origin unknown }
            cVar2 := FUN_5c00_2002(@stack0xfffe); { 5C00:22E7 }
            if (($0 < (Ptr<ShortInt>(((SmallInt(param_2) + cVar2) + $96)))^) and then (param_1 = 2)) then begin { 5C00:22E7; region anchor, exact origin unknown }
              cVar2 := FUN_5c00_2002(@stack0xfffe); { 5C00:2300 }
              (Ptr<Byte>(((SmallInt(param_2) + cVar2) + $96)))^ := 0; { 5C00:2300; region anchor, exact origin unknown }
            end; { 5C00:2300; region anchor, exact origin unknown }
          end else begin { 5C00:2300; region anchor, exact origin unknown }
            cVar2 := FUN_5c00_2002(@stack0xfffe); { 5C00:2313 }
            pcVar1 := Ptr<ShortInt>(((SmallInt(param_2) + cVar2) + $96)); { 5C00:2313; region anchor, exact origin unknown }
            (pcVar1)^ := ((pcVar1)^ + (-1)); { 5C00:2313; region anchor, exact origin unknown }
            if (((Ptr<ShortInt>((SmallInt(param_2) + $11B)))^ = $0) and then ((Ptr<ShortInt>((SmallInt(param_2) + $10C)))^ <> $6)) then begin { 5C00:2313; region anchor, exact origin unknown }
              uVar4 := MakeWord((cVar2 shr 7), 6); { 5C00:2313; region anchor, exact origin unknown }
              puVar5 := local_43; { 5C00:2313; region anchor, exact origin unknown }
              uVar6 := UNK_unaff_SS; { 5C00:2313; region anchor, exact origin unknown }
              iVar7 := SmallInt(param_2); { 5C00:2313; region anchor, exact origin unknown }
              uVar3 := ExtractBytes(param_2, 2, 2); { 5C00:2313; region anchor, exact origin unknown }
              PString(FarPtr(SS, BPAddr(-$41))) := 'is killed'; { 5C00:234A }
              FUN_5c00_0058(puVar5, uVar6, uVar4, iVar7, uVar3); { 5C00:2350 }
            end; { 5C00:2350; region anchor, exact origin unknown }
            stub_ov23_e1(SmallInt(param_2), ExtractBytes(param_2, 2, 2)); { 5C00:2359 }
          end; { 5C00:2359; region anchor, exact origin unknown }
          cVar2 := FUN_5c00_2002(@stack0xfffe); { 5C00:2360 }
          (Ptr<Byte>((SmallInt(param_2) + $73)))^ := (Ptr<Byte>(((SmallInt(param_2) + cVar2) + $96)))^; { 5C00:2360; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(param_2) + $AC)))^ := local_33; { 5C00:2360; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(param_2) + $AE)))^ := local_31; { 5C00:2360; region anchor, exact origin unknown }
          FUN_00ba_0bb8(SmallInt(param_2), ExtractBytes(param_2, 2, 2)); { 5C00:238E }
        end; { 5C00:238E; region anchor, exact origin unknown }
        if (local_35 = local_39) then begin { 5C00:238E; region anchor, exact origin unknown }
          Break; { 5C00:238E; region anchor, exact origin unknown }
        end; { 5C00:238E; region anchor, exact origin unknown }
        local_35 := (local_35 + 1); { 5C00:21DD }
      end; { 5C00:21DD; region anchor, exact origin unknown }
    end; { 5C00:21DD; region anchor, exact origin unknown }
  end; { 5C00:21DD; region anchor, exact origin unknown }
  Exit; { 5C00:23A1 }
end;
```

### ov12:23A4 ov12_23A4 (conf L)

Original `ov12_23A4`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: LongWord; iVar2: SmallInt; uVar3: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_2122.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:23A4, paired .c.

```pascal
procedure ov12_23A4();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:23A4; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(uVar1) shr $10)); { 5C00:23A4; region anchor, exact origin unknown }
  iVar2 := SmallInt(uVar1); { 5C00:23A4; region anchor, exact origin unknown }
  FUN_5c00_2122(1, (Ptr<Word>((iVar2 + 10)))^, (Ptr<Word>((iVar2 + $C)))^); { 5C00:23BB }
  Exit; { 5C00:23BF }
end;
```

### ov12:23C2 ov12_23C2 (conf L)

Original `ov12_23C2`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: uVar1: LongWord; iVar2: SmallInt; uVar3: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_2122.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:23C2, paired .c.

```pascal
procedure ov12_23C2();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:23C2; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(uVar1) shr $10)); { 5C00:23C2; region anchor, exact origin unknown }
  iVar2 := SmallInt(uVar1); { 5C00:23C2; region anchor, exact origin unknown }
  FUN_5c00_2122(2, (Ptr<Word>((iVar2 + 10)))^, (Ptr<Word>((iVar2 + $C)))^); { 5C00:23D9 }
  Exit; { 5C00:23DD }
end;
```

### ov12:23EC ov12_23EC (conf L)

Original `ov12_23EC`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -10:2, -4:2, +C:2.
Locals/SSA temporaries: uVar1: LongWord; cVar2: ShortInt; extraout_AH: Byte; uVar3: Word; uVar4: Word; extraout_AH_00: Byte; iVar5: SmallInt; uVar6: Word; unaff_SS: Word; in_stack_0000000a: LongWord; uVar7: Word; puVar8: ^Byte; uVar9: Word; local_12: array[0..12-1] of Byte; local_6: array[0..4-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_2199, stub_ov24_e10, stub_ov24_e8, System.@StrCopy, FUN_00ba_16ec.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:23EC, paired .c.

```pascal
procedure ov12_23EC();
begin
  uVar1 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:23EC; region anchor, exact origin unknown }
  uVar6 := Word((LongWord(uVar1) shr $10)); { 5C00:23EC; region anchor, exact origin unknown }
  iVar5 := SmallInt(uVar1); { 5C00:23EC; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar5 + 10)))^; { 5C00:2402 }
  g_6828 := (Ptr<Word>((iVar5 + $C)))^; { 5C00:2405 }
  cVar2 := FUN_00ba_2199(local_6, UNK_unaff_SS, MakeWord(ShortInt((Word(g_6826) shr 8)), $32), g_6826, g_6828); { 5C00:2419 }
  if (cVar2 = $0) then begin { 5C00:2419; region anchor, exact origin unknown }
    stub_ov24_e10($3801, $38FF, $3840, $32, g_6826, g_6828); { 5C00:2437 }
    uVar3 := MakeWord(UNK_extraout_AH, $39); { 5C00:2437; region anchor, exact origin unknown }
    uVar7 := $A8C0; { 5C00:2437; region anchor, exact origin unknown }
    uVar6 := g_6826; { 5C00:2437; region anchor, exact origin unknown }
    uVar9 := g_6828; { 5C00:2437; region anchor, exact origin unknown }
    uVar4 := stub_ov24_e8($A806, $A801); { 5C00:2451 }
    iVar5 := (((uVar4 and $FF) * $10) + $F); { 5C00:2451; region anchor, exact origin unknown }
    stub_ov24_e10(MakeWord(ShortInt((Word(iVar5) shr 8)), 1), iVar5, uVar7, uVar3, uVar6, uVar9); { 5C00:2463 }
    puVar8 := local_12; { 5C00:2463; region anchor, exact origin unknown }
    uVar6 := g_6826; { 5C00:2463; region anchor, exact origin unknown }
    uVar9 := g_6828; { 5C00:2463; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$10))) := 'is Diseased'; { 5C00:247A }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH_00, 1), MakeWord(UNK_extraout_AH_00, 10), puVar8, UNK_unaff_SS, uVar6, uVar9); { 5C00:2485 }
  end; { 5C00:2485; region anchor, exact origin unknown }
  Exit; { 5C00:248D }
end;
```

### ov12:2490 ov12_2490 (conf L)

Original `ov12_2490`. Params (ABI order): param_1: Word; param_2: LongWord.
BP access inventory (hex offset:byte widths): +8:2.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2490, paired .c.

```pascal
procedure ov12_2490(param_1: Word; param_2: LongWord);
begin
  iVar1 := SmallInt(param_2); { 5C00:2490; region anchor, exact origin unknown }
  uVar2 := Word((LongWord(param_2) shr $10)); { 5C00:2490; region anchor, exact origin unknown }
  if ((g_6DE3 = $0) and then (g_6822 = $0)) then begin { 5C00:2490; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar1 + 3)))^ := ((Ptr<Byte>((iVar1 + 3)))^ and $F); { 5C00:2490; region anchor, exact origin unknown }
  end else begin { 5C00:2490; region anchor, exact origin unknown }
    if (((Ptr<Byte>((iVar1 + 3)))^ and $10) = 0) then begin { 5C00:2490; region anchor, exact origin unknown }
      g_6822 := (-1); { 5C00:24C0 }
      (Ptr<Byte>((iVar1 + 3)))^ := ((Ptr<Byte>((iVar1 + 3)))^ or $10); { 5C00:24C0; region anchor, exact origin unknown }
    end; { 5C00:24C0; region anchor, exact origin unknown }
  end; { 5C00:24C0; region anchor, exact origin unknown }
  Exit; { 5C00:24D6 }
end;
```

### ov12:24D9 ov12_24D9 (conf L)

Original `ov12_24D9`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1:1, +C:2.
Locals/SSA temporaries: bVar1: Byte; in_stack_0000000a: LongWord; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:24D9, paired .c.

```pascal
procedure ov12_24D9();
begin
  if (g_682A = $0) then begin { 5C00:24D9; region anchor, exact origin unknown }
    bVar1 := (Ptr<Byte>((SmallInt(UNK_in_stack_0000000a) + $14)))^; { 5C00:24D9; region anchor, exact origin unknown }
    if ((bVar1 < 4) or else (6 < bVar1)) then begin { 5C00:24D9; region anchor, exact origin unknown }
      if ((bVar1 < 7) or else (10 < bVar1)) then begin { 5C00:24D9; region anchor, exact origin unknown }
        if ((bVar1 < $B) or else ($D < bVar1)) then begin { 5C00:24D9; region anchor, exact origin unknown }
          if ((bVar1 < $E) or else ($11 < bVar1)) then begin { 5C00:24D9; region anchor, exact origin unknown }
            if (($11 < bVar1) and then (bVar1 < $15)) then begin { 5C00:24D9; region anchor, exact origin unknown }
              local_3 := $5; { 5C00:24F5 }
            end; { 5C00:24F5; region anchor, exact origin unknown }
          end else begin { 5C00:24F5; region anchor, exact origin unknown }
            local_3 := $4; { 5C00:2503 }
          end; { 5C00:2503; region anchor, exact origin unknown }
        end else begin { 5C00:2503; region anchor, exact origin unknown }
          local_3 := $3; { 5C00:2511 }
        end; { 5C00:2511; region anchor, exact origin unknown }
      end else begin { 5C00:2511; region anchor, exact origin unknown }
        local_3 := $2; { 5C00:251F }
      end; { 5C00:251F; region anchor, exact origin unknown }
    end else begin { 5C00:251F; region anchor, exact origin unknown }
      local_3 := $1; { 5C00:252D }
    end; { 5C00:252D; region anchor, exact origin unknown }
    g_6816 := (g_6816 + local_3); { 5C00:253F }
  end; { 5C00:253F; region anchor, exact origin unknown }
  Exit; { 5C00:2545 }
end;
```

### ov12:2556 ov12_2556 (conf L)

Original `ov12_2556`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -E:2, +C:2, +E:2.
Locals/SSA temporaries: in_AX: Word; bVar1: Byte; extraout_AH: Byte; unaff_SS: Word; in_stack_0000000a: Word; in_stack_0000000c: Word; puVar2: ^Byte; local_10: array[0..14-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000, System.@StrCopy, FUN_00ba_16ec.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2556, paired .c.

```pascal
procedure ov12_2556();
begin
  bVar1 := Byte((Word(UNK_in_AX) shr 8)); { 5C00:2556; region anchor, exact origin unknown }
  if (g_681B = $F) then begin { 5C00:2556; region anchor, exact origin unknown }
    FUN_5c00_0000((Word(bVar1) shl 8)); { 5C00:2567 }
    puVar2 := local_10; { 5C00:2567; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$E))) := 'is unaffected'; { 5C00:257A }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar2, UNK_unaff_SS, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:2585 }
  end else begin { 5C00:2585; region anchor, exact origin unknown }
    if ((g_6819 and 4) <> 0) then begin { 5C00:2585; region anchor, exact origin unknown }
      FUN_5c00_0000((Word(bVar1) shl 8)); { 5C00:2599 }
    end; { 5C00:2599; region anchor, exact origin unknown }
  end; { 5C00:2599; region anchor, exact origin unknown }
  Exit; { 5C00:259F }
end;
```

### ov12:25A2 ov12_25A2 (conf L)

Original `ov12_25A2`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:25A2, paired .c.

```pascal
procedure ov12_25A2();
begin
  if ((g_6819 and 1) <> 0) then begin { 5C00:25A2; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:25B5 }
  end; { 5C00:25B5; region anchor, exact origin unknown }
  Exit; { 5C00:25B9 }
end;
```

### ov12:25BC ov12_25BC (conf L)

Original `ov12_25BC`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: lVar1: LongInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:25BC, paired .c.

```pascal
procedure ov12_25BC();
begin
  lVar1 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:25CB }
  if ((lVar1 <> 0) and then ((Ptr<UnknownValue>(@g_5589)[(Word((Ptr<Byte>((SmallInt(lVar1) + $2E)))^) * $10)] and $81) <> 0)) then begin { 5C00:25CB; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:25FC }
  end; { 5C00:25FC; region anchor, exact origin unknown }
  Exit; { 5C00:2602 }
end;
```

### ov12:2610 ov12_2610 (conf L)

Original `ov12_2610`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -B:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; iVar2: SmallInt; uVar3: Word; unaff_SS: Word; puVar4: ^Byte; local_d: array[0..11-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_5c00_0058.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2610, paired .c.

```pascal
procedure ov12_2610(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  (Ptr<Byte>((SmallInt(param_2) + 4)))^ := 0; { 5C00:2610; region anchor, exact origin unknown }
  uVar3 := Word((LongWord(param_3) shr $10)); { 5C00:2610; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_3); { 5C00:2610; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((iVar2 + $10D)))^ <> $0) then begin { 5C00:2610; region anchor, exact origin unknown }
    uVar1 := 6; { 5C00:2610; region anchor, exact origin unknown }
    puVar4 := local_d; { 5C00:2610; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$B))) := 'Falls dead'; { 5C00:263C }
    FUN_5c00_0058(puVar4, UNK_unaff_SS, uVar1, iVar2, uVar3); { 5C00:2642 }
  end; { 5C00:2642; region anchor, exact origin unknown }
  Exit; { 5C00:2648 }
end;
```

### ov12:264B ov12_264B (conf L)

Original `ov12_264B`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: uVar1: Word; lVar2: LongInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:264B, paired .c.

```pascal
procedure ov12_264B();
begin
  lVar2 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:265A }
  uVar1 := Word((LongWord(lVar2) shr $10)); { 5C00:265A; region anchor, exact origin unknown }
  if ((lVar2 = 0) or else (((Ptr<ShortInt>((SmallInt(lVar2) + $32)))^ = $0) and then ((Ptr<ShortInt>((SmallInt(lVar2) + $31)))^ <> (-$4F)))) then begin { 5C00:265A; region anchor, exact origin unknown }
    g_6818 := 0; { 5C00:267F }
  end; { 5C00:267F; region anchor, exact origin unknown }
  Exit; { 5C00:2687 }
end;
```

### ov12:268A ov12_268A (conf L)

Original `ov12_268A`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1:1, +C:2.
Locals/SSA temporaries: bVar1: Byte; in_stack_0000000a: LongWord; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:268A, paired .c.

```pascal
procedure ov12_268A();
begin
  if ((g_682A = $4) or else (g_682A = $2)) then begin { 5C00:268A; region anchor, exact origin unknown }
    bVar1 := (Ptr<Byte>((SmallInt(UNK_in_stack_0000000a) + $14)))^; { 5C00:268A; region anchor, exact origin unknown }
    if ((bVar1 < 4) or else (6 < bVar1)) then begin { 5C00:268A; region anchor, exact origin unknown }
      if ((bVar1 < 7) or else (10 < bVar1)) then begin { 5C00:268A; region anchor, exact origin unknown }
        if ((bVar1 < $B) or else ($D < bVar1)) then begin { 5C00:268A; region anchor, exact origin unknown }
          if ((bVar1 < $E) or else ($11 < bVar1)) then begin { 5C00:268A; region anchor, exact origin unknown }
            if (($11 < bVar1) and then (bVar1 < $15)) then begin { 5C00:268A; region anchor, exact origin unknown }
              local_3 := $5; { 5C00:26AD }
            end; { 5C00:26AD; region anchor, exact origin unknown }
          end else begin { 5C00:26AD; region anchor, exact origin unknown }
            local_3 := $4; { 5C00:26BB }
          end; { 5C00:26BB; region anchor, exact origin unknown }
        end else begin { 5C00:26BB; region anchor, exact origin unknown }
          local_3 := $3; { 5C00:26C9 }
        end; { 5C00:26C9; region anchor, exact origin unknown }
      end else begin { 5C00:26C9; region anchor, exact origin unknown }
        local_3 := $2; { 5C00:26D7 }
      end; { 5C00:26D7; region anchor, exact origin unknown }
    end else begin { 5C00:26D7; region anchor, exact origin unknown }
      local_3 := $1; { 5C00:26E5 }
    end; { 5C00:26E5; region anchor, exact origin unknown }
    g_6816 := (g_6816 + local_3); { 5C00:26F7 }
  end; { 5C00:26F7; region anchor, exact origin unknown }
  Exit; { 5C00:26FD }
end;
```

### ov12:2700 ov12_2700 (conf L)

Original `ov12_2700`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Word; in_stack_0000000a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2700, paired .c.

```pascal
procedure ov12_2700();
begin
  uVar2 := Word((LongWord(UNK_in_stack_0000000a) shr $10)); { 5C00:2700; region anchor, exact origin unknown }
  iVar1 := SmallInt(UNK_in_stack_0000000a); { 5C00:2700; region anchor, exact origin unknown }
  (Ptr<ShortInt>((iVar1 + $11B)))^ := ((Ptr<ShortInt>((iVar1 + $11B)))^ + $3); { 5C00:2700; region anchor, exact origin unknown }
  if ((Ptr<Byte>((iVar1 + $32)))^ < (Ptr<Byte>((iVar1 + $11B)))^) then begin { 5C00:2700; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar1 + $11B)))^ := (Ptr<Byte>((iVar1 + $32)))^; { 5C00:2700; region anchor, exact origin unknown }
  end; { 5C00:2700; region anchor, exact origin unknown }
  Exit; { 5C00:272D }
end;
```

### ov12:2730 ov12_2730 (conf L)

Original `ov12_2730`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -1:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; uVar3: Word; iVar4: SmallInt; uVar5: Byte; extraout_AH: Byte; iVar6: SmallInt; uVar7: Word; uVar8: Word; iVar9: SmallInt; local_3: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e22, stub_ov24_e8, stub_ov24_e10, stub_ov24_e2.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2730, paired .c.

```pascal
procedure ov12_2730(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  local_3 := $0; { 5C00:2736 }
  uVar7 := Word((LongWord(param_3) shr $10)); { 5C00:2736; region anchor, exact origin unknown }
  iVar6 := SmallInt(param_3); { 5C00:2736; region anchor, exact origin unknown }
  if (((Ptr<ShortInt>((iVar6 + $10C)))^ = $5) and then ((Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar6 + $108)))^) + $E)))^ < 6)) then begin { 5C00:2736; region anchor, exact origin unknown }
    local_3 := ($6 - (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((iVar6 + $108)))^) + $E)))^); { 5C00:2769 }
  end; { 5C00:2769; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((iVar6 + $10C)))^ = $4) then begin { 5C00:2769; region anchor, exact origin unknown }
    local_3 := $6; { 5C00:2777 }
  end; { 5C00:2777; region anchor, exact origin unknown }
  if (local_3 <> $0) then begin { 5C00:2777; region anchor, exact origin unknown }
    cVar1 := stub_ov24_e22(local_3, iVar6, uVar7); { 5C00:278B }
    if (cVar1 <> $0) then begin { 5C00:278B; region anchor, exact origin unknown }
      uVar2 := $5F; { 5C00:278B; region anchor, exact origin unknown }
      iVar9 := iVar6; { 5C00:278B; region anchor, exact origin unknown }
      uVar8 := uVar7; { 5C00:278B; region anchor, exact origin unknown }
      uVar3 := stub_ov24_e8(4, 1); { 5C00:27A3 }
      iVar4 := ((uVar3 and $FF) + 1); { 5C00:27A3; region anchor, exact origin unknown }
      uVar5 := Byte((Word(iVar4) shr 8)); { 5C00:27A3; region anchor, exact origin unknown }
      stub_ov24_e10(MakeWord(uVar5, 1), MakeWord(uVar5, $FF), iVar4, uVar2, iVar9, uVar8); { 5C00:27B2 }
      uVar8 := Word((LongWord(param_2) shr $10)); { 5C00:27B2; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt(param_2) + 4)))^ := 0; { 5C00:27B2; region anchor, exact origin unknown }
      stub_ov24_e2(SmallInt(param_2), uVar8, MakeWord(UNK_extraout_AH, 99), iVar6, uVar7); { 5C00:27CE }
    end; { 5C00:27CE; region anchor, exact origin unknown }
  end; { 5C00:27CE; region anchor, exact origin unknown }
  Exit; { 5C00:27D6 }
end;
```

### ov12:27D9 ov12_27D9 (conf L)

Original `ov12_27D9`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: uVar1: Byte; in_AX: Word; uVar2: Word; uVar3: Word; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:27D9, paired .c.

```pascal
procedure ov12_27D9();
begin
  uVar2 := (MakeWord(ShortInt((Word(UNK_in_AX) shr 8)), g_6819) and $FF01); { 5C00:27D9; region anchor, exact origin unknown }
  if ((ShortInt(uVar2) = $0) and then Seq(uVar2 := (MakeWord(ShortInt((uVar2 shr 8)), g_6819) and $FF10), uVar1 := Byte((uVar2 shr 8)), (ShortInt(uVar2) = $0))) then begin { 5C00:27D9; region anchor, exact origin unknown }
    uVar3 := MakeWord(uVar1, $66); { 5C00:27D9; region anchor, exact origin unknown }
    uVar1 := stub_ov24_e8(MakeWord(uVar1, 6), MakeWord(uVar1, 3)); { 5C00:27FD }
    stub_ov24_e10(1, $FF, uVar1, uVar3, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:280B }
  end; { 5C00:280B; region anchor, exact origin unknown }
  Exit; { 5C00:2811 }
end;
```

### ov12:2814 ov12_2814 (conf L)

Original `ov12_2814`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; unaff_SS: Word; in_stack_0000000a: Word; in_stack_0000000c: Word; local_6: array[0..4-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_2199, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2814, paired .c.

```pascal
procedure ov12_2814();
begin
  cVar1 := FUN_00ba_2199(local_6, UNK_unaff_SS, $62, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:2828 }
  if (cVar1 = $0) then begin { 5C00:2828; region anchor, exact origin unknown }
    cVar1 := FUN_00ba_2199(local_6, UNK_unaff_SS, $3B, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:283F }
    if (cVar1 = $0) then begin { 5C00:283F; region anchor, exact origin unknown }
      stub_ov24_e10(1, $FF, 3, $3B, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:285B }
    end; { 5C00:285B; region anchor, exact origin unknown }
  end; { 5C00:285B; region anchor, exact origin unknown }
  Exit; { 5C00:2863 }
end;
```

### ov12:2866 ov12_2866 (conf L)

Original `ov12_2866`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: LongWord.
BP access inventory (hex offset:byte widths): -1:1, +8:2, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e22, FUN_5c00_001f.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2866, paired .c.

```pascal
procedure ov12_2866(param_1: Word; param_2: LongWord; param_3: LongWord);
begin
  cVar1 := stub_ov24_e22((Ptr<Byte>((SmallInt(param_3) + $32)))^, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:287A }
  if (cVar1 = $0) then begin { 5C00:287A; region anchor, exact origin unknown }
    FUN_5c00_001f(1, (Ptr<Byte>((SmallInt(param_2) + 3)))^, $66, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 5C00:2899 }
  end; { 5C00:2899; region anchor, exact origin unknown }
  Exit; { 5C00:28A2 }
end;
```

### ov12:28BF ov12_28BF (conf L)

Original `ov12_28BF`. Params (ABI order): param_1: Word; param_2: LongWord; param_3: Word; param_4: Word.
BP access inventory (hex offset:byte widths): -1A:2, +8:2, +C:2, +E:2.
Locals/SSA temporaries: in_AX: Word; bVar2: Byte; extraout_AH: Byte; uVar1: Word; unaff_SS: Word; puVar3: ^Byte; local_1c: array[0..26-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov31_e19, System.@StrCopy, stub_ov24_e11.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:28BF, paired .c.

```pascal
procedure ov12_28BF(param_1: Word; param_2: LongWord; param_3: Word; param_4: Word);
begin
  (Ptr<Byte>((SmallInt(param_2) + 4)))^ := 0; { 5C00:28BF; region anchor, exact origin unknown }
  bVar2 := Byte((Word(UNK_in_AX) shr 8)); { 5C00:28BF; region anchor, exact origin unknown }
  stub_ov31_e19((Word(bVar2) shl 8), MakeWord(bVar2, 3), param_3, param_4); { 5C00:28D9 }
  uVar1 := MakeWord(UNK_extraout_AH, 3); { 5C00:28D9; region anchor, exact origin unknown }
  puVar3 := local_1c; { 5C00:28D9; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1A))) := 'Turns gaseous and escapes'; { 5C00:28F1 }
  stub_ov24_e11(puVar3, UNK_unaff_SS, uVar1, param_3, param_4); { 5C00:28F6 }
  Exit; { 5C00:28FE }
end;
```

### ov12:2901 ov12_2901 (conf L)

Original `ov12_2901`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): +C:2, +E:2.
Locals/SSA temporaries: in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0fac.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2901, paired .c.

```pascal
procedure ov12_2901();
begin
  FUN_5c00_0fac($3C, UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:290E }
  Exit; { 5C00:2912 }
end;
```

### ov12:2915 FUN_5c00_2915 (conf L)

Original `FUN_5c00_2915`. Params (ABI order): param_1: Byte.
BP access inventory (hex offset:byte widths): -2:1, -1:1, +6:1.
Locals/SSA temporaries: bVar1: Byte; uVar2: Word; uVar3: Byte.
Callers: ov12_2976,ov12_2984.
Callees (listing): FUN_00ba_26c2, stub_ov24_e8, FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2915, paired .c.

```pascal
procedure FUN_5c00_2915(param_1: Byte);
begin
  bVar1 := FUN_00ba_26c2(g_681B); { 5C00:291F }
  uVar2 := (Word(param_1) + (($B - Word(bVar1)) * (-5))); { 5C00:291F; region anchor, exact origin unknown }
  bVar1 := Byte(uVar2); { 5C00:291F; region anchor, exact origin unknown }
  if (((g_6817 <> $0) or else Seq(uVar2 := (MakeWord(ShortInt((uVar2 shr 8)), g_6819) and $FF08), (ShortInt(uVar2) <> $0))) and then Seq(uVar3 := Byte((uVar2 shr 8)), uVar2 := stub_ov24_e8(MakeWord(uVar3, 100), MakeWord(uVar3, 1)), (Byte(uVar2) <= bVar1))) then begin { 5C00:295F }
    FUN_5c00_0000((uVar2 and $FF00)); { 5C00:296D }
  end; { 5C00:296D; region anchor, exact origin unknown }
  Exit; { 5C00:2973 }
end;
```

### ov12:2976 ov12_2976 (conf L)

Original `ov12_2976`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_2915.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2976, paired .c.

```pascal
procedure ov12_2976();
begin
  FUN_5c00_2915($32); { 5C00:297D }
  Exit; { 5C00:2981 }
end;
```

### ov12:2984 ov12_2984 (conf L)

Original `ov12_2984`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_2915.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2984, paired .c.

```pascal
procedure ov12_2984();
begin
  FUN_5c00_2915($F); { 5C00:298B }
  Exit; { 5C00:298F }
end;
```

### ov12:2992 ov12_2992 (conf L)

Original `ov12_2992`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: bVar1: Byte; extraout_AH: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2992, paired .c.

```pascal
procedure ov12_2992();
begin
  bVar1 := stub_ov24_e8(100, 1); { 5C00:299B }
  if (bVar1 < $5B) then begin { 5C00:299B; region anchor, exact origin unknown }
    FUN_5c00_0000($35); { 5C00:29A8 }
    FUN_5c00_0000(MakeWord(UNK_extraout_AH, $B)); { 5C00:29AF }
  end; { 5C00:29AF; region anchor, exact origin unknown }
  Exit; { 5C00:29B3 }
end;
```

### ov12:29B6 ov12_29B6 (conf L)

Original `ov12_29B6`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: extraout_AH: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:29B6, paired .c.

```pascal
procedure ov12_29B6();
begin
  FUN_5c00_0000($B); { 5C00:29BD }
  FUN_5c00_0000(MakeWord(UNK_extraout_AH, $35)); { 5C00:29C4 }
  Exit; { 5C00:29C8 }
end;
```

### ov12:29CB ov12_29CB (conf L)

Original `ov12_29CB`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:29CB, paired .c.

```pascal
procedure ov12_29CB();
begin
  FUN_5c00_0000($34); { 5C00:29D2 }
  Exit; { 5C00:29D6 }
end;
```

### ov12:29D9 ov12_29D9 (conf L)

Original `ov12_29D9`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: in_AX: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:29D9, paired .c.

```pascal
procedure ov12_29D9();
begin
  if ((g_6819 and 2) <> 0) then begin { 5C00:29D9; region anchor, exact origin unknown }
    FUN_5c00_0000((UNK_in_AX and $FF00)); { 5C00:29E9 }
  end; { 5C00:29E9; region anchor, exact origin unknown }
  Exit; { 5C00:29ED }
end;
```

### ov12:29F0 ov12_29F0 (conf L)

Original `ov12_29F0`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: extraout_AH: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:29F0, paired .c.

```pascal
procedure ov12_29F0();
begin
  FUN_5c00_0000($37); { 5C00:29F7 }
  FUN_5c00_0000(MakeWord(UNK_extraout_AH, $34)); { 5C00:29FE }
  if (g_682A = $0) then begin { 5C00:29FE; region anchor, exact origin unknown }
    g_6816 := 100; { 5C00:2A08 }
  end; { 5C00:2A08; region anchor, exact origin unknown }
  Exit; { 5C00:2A0E }
end;
```

### ov12:2A11 ov12_2A11 (conf L)

Original `ov12_2A11`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: in_AX: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2A11, paired .c.

```pascal
procedure ov12_2A11();
begin
  if ((g_6819 and 1) <> 0) then begin { 5C00:2A11; region anchor, exact origin unknown }
    FUN_5c00_0000((UNK_in_AX and $FF00)); { 5C00:2A21 }
  end; { 5C00:2A21; region anchor, exact origin unknown }
  Exit; { 5C00:2A25 }
end;
```

### ov12:2A28 ov12_2A28 (conf L)

Original `ov12_2A28`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -2:1, -1:1.
Locals/SSA temporaries: local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2A28, paired .c.

```pascal
procedure ov12_2A28();
begin
  if (((g_6819 and 1) <> 0) and then (g_681C <> 0)) then begin { 5C00:2A28; region anchor, exact origin unknown }
    local_3 := 1; { 5C00:2A44 }
    while true do begin { 5C00:2A44; region anchor, exact origin unknown }
      g_6818 := (g_6818 - 1); { 5C00:2A4C }
      if (g_6818 < g_681C) then begin { 5C00:2A4C; region anchor, exact origin unknown }
        g_6818 := g_681C; { 5C00:2A5C }
      end; { 5C00:2A5C; region anchor, exact origin unknown }
      if (local_3 = g_681C) then begin { 5C00:2A5C; region anchor, exact origin unknown }
        Break; { 5C00:2A5C; region anchor, exact origin unknown }
      end; { 5C00:2A5C; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 5C00:2A49 }
    end; { 5C00:2A49; region anchor, exact origin unknown }
  end; { 5C00:2A49; region anchor, exact origin unknown }
  Exit; { 5C00:2A6A }
end;
```

### ov12:2A6D ov12_2A6D (conf L)

Original `ov12_2A6D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2A6D, paired .c.

```pascal
procedure ov12_2A6D();
begin
  if ((g_6819 and 4) <> 0) then begin { 5C00:2A6D; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:2A80 }
  end; { 5C00:2A80; region anchor, exact origin unknown }
  Exit; { 5C00:2A84 }
end;
```

### ov12:2A87 ov12_2A87 (conf L)

Original `ov12_2A87`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: uVar1: Word; lVar2: LongInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2A87, paired .c.

```pascal
procedure ov12_2A87();
begin
  lVar2 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:2A96 }
  uVar1 := Word((LongWord(lVar2) shr $10)); { 5C00:2A96; region anchor, exact origin unknown }
  if ((lVar2 <> 0) and then ((Ptr<UnknownValue>(@g_5589)[(Word((Ptr<Byte>((SmallInt(lVar2) + $2E)))^) * $10)] = $0) or else ((Ptr<UnknownValue>(@g_5589)[(Word((Ptr<Byte>((SmallInt(lVar2) + $2E)))^) * $10)] and 1) <> 0))) then begin { 5C00:2A96; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:2ADD }
  end; { 5C00:2ADD; region anchor, exact origin unknown }
  Exit; { 5C00:2AE3 }
end;
```

### ov12:2AE6 ov12_2AE6 (conf L)

Original `ov12_2AE6`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: lVar1: LongInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2AE6, paired .c.

```pascal
procedure ov12_2AE6();
begin
  lVar1 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:2AF5 }
  if ((lVar1 <> 0) and then ($0 < (Ptr<ShortInt>((SmallInt(lVar1) + $32)))^)) then begin { 5C00:2AF5; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:2B17 }
  end; { 5C00:2B17; region anchor, exact origin unknown }
  Exit; { 5C00:2B1D }
end;
```

### ov12:2B20 ov12_2B20 (conf L)

Original `ov12_2B20`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; cVar3: ShortInt; uVar4: Word; uVar5: Byte; uVar6: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e9.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2B20, paired .c.

```pascal
procedure ov12_2B20();
begin
  uVar6 := Word((LongWord(g_5D92) shr $10)); { 5C00:2B20; region anchor, exact origin unknown }
  uVar1 := (Ptr<Word>((SmallInt(g_5D92) + $CC)))^; { 5C00:2B20; region anchor, exact origin unknown }
  uVar2 := (Ptr<Word>((SmallInt(g_5D92) + $CE)))^; { 5C00:2B20; region anchor, exact origin unknown }
  uVar4 := (uVar1 or uVar2); { 5C00:2B20; region anchor, exact origin unknown }
  if ((uVar4 <> 0) and then ((Ptr<ShortInt>((uVar1 + $2E)))^ = $55)) then begin { 5C00:2B20; region anchor, exact origin unknown }
    uVar5 := Byte((uVar4 shr 8)); { 5C00:2B20; region anchor, exact origin unknown }
    cVar3 := stub_ov24_e9(MakeWord(uVar5, 6), MakeWord(uVar5, 1)); { 5C00:2B52 }
    g_6818 := (cVar3 + $1); { 5C00:2B5A }
  end; { 5C00:2B5A; region anchor, exact origin unknown }
  Exit; { 5C00:2B60 }
end;
```

### ov12:2B63 ov12_2B63 (conf L)

Original `ov12_2B63`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2B63, paired .c.

```pascal
procedure ov12_2B63();
begin
  if ((g_6819 and 2) <> 0) then begin { 5C00:2B63; region anchor, exact origin unknown }
    g_6818 := (g_6818 shr 1); { 5C00:2B76 }
  end; { 5C00:2B76; region anchor, exact origin unknown }
  Exit; { 5C00:2B7A }
end;
```

### ov12:2B7D ov12_2B7D (conf L)

Original `ov12_2B7D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: uVar1: Word; lVar2: LongInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2B7D, paired .c.

```pascal
procedure ov12_2B7D();
begin
  lVar2 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:2B8C }
  if (((lVar2 = 0) or else ((Ptr<ShortInt>((SmallInt(lVar2) + $32)))^ = $0)) and then Seq(uVar1 := Word((LongWord(g_5D92) shr $10)), (($0 < (Ptr<ShortInt>((SmallInt(g_5D92) + $2E)))^) or else ((Ptr<ShortInt>((SmallInt(g_5D92) + $73)))^ < $4)))) then begin { 5C00:2B8C; region anchor, exact origin unknown }
    g_6818 := 0; { 5C00:2BBD }
  end; { 5C00:2BBD; region anchor, exact origin unknown }
  Exit; { 5C00:2BC5 }
end;
```

### ov12:2BC8 ov12_2BC8 (conf L)

Original `ov12_2BC8`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; uVar3: Word; in_stack_0000000a: Word; in_stack_0000000c: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0fac.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2BC8, paired .c.

```pascal
procedure ov12_2BC8();
begin
  uVar3 := Word((LongWord(g_5D92) shr $10)); { 5C00:2BC8; region anchor, exact origin unknown }
  uVar1 := (Ptr<Word>((SmallInt(g_5D92) + $CC)))^; { 5C00:2BC8; region anchor, exact origin unknown }
  uVar2 := (Ptr<Word>((SmallInt(g_5D92) + $CE)))^; { 5C00:2BC8; region anchor, exact origin unknown }
  if (((uVar1 or uVar2) <> 0) and then (((Ptr<ShortInt>((uVar1 + $2E)))^ = $57) or else ((Ptr<ShortInt>((uVar1 + $2E)))^ = $58))) then begin { 5C00:2BC8; region anchor, exact origin unknown }
    FUN_5c00_0fac(MakeWord(ShortInt(((uVar1 or uVar2) shr 8)), $32), UNK_in_stack_0000000a, UNK_in_stack_0000000c); { 5C00:2C08 }
  end; { 5C00:2C08; region anchor, exact origin unknown }
  Exit; { 5C00:2C0E }
end;
```

### ov12:2C1C ov12_2C1C (conf L)

Original `ov12_2C1C`. Params (ABI order): param_1: Word; param_2: Word; param_3: Word; param_4: LongWord.
BP access inventory (hex offset:byte widths): -C:2, -1:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: bVar1: Byte; uVar6: Byte; extraout_AH: Byte; extraout_AH_00: Byte; uVar2: Word; uVar3: Word; uVar4: Word; extraout_AH_01: Byte; uVar5: Word; extraout_AH_02: Byte; extraout_AH_03: Byte; iVar7: SmallInt; iVar8: SmallInt; uVar9: Word; uVar10: Word; unaff_SS: Word; puVar11: ^Byte; local_e: array[0..11-1] of Byte; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, FUN_00ba_255b, FUN_00ba_2637, System.@StrCopy, FUN_00ba_16ec, FUN_00ba_19de, stub_ov31_e12, stub_ov31_e13, FUN_00ba_1a29, stub_ov24_e9, stub_ov24_e7, stub_ov24_e19, stub_ov24_e2.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2C1C, paired .c.

```pascal
procedure ov12_2C1C(param_1: Word; param_2: Word; param_3: Word; param_4: LongWord);
begin
  uVar9 := Word((LongWord(param_4) shr $10)); { 5C00:2C1C; region anchor, exact origin unknown }
  iVar7 := SmallInt(param_4); { 5C00:2C1C; region anchor, exact origin unknown }
  uVar10 := Word((LongWord((Ptr<LongWord>((iVar7 + $108)))^) shr $10)); { 5C00:2C1C; region anchor, exact origin unknown }
  iVar8 := SmallInt((Ptr<LongWord>((iVar7 + $108)))^); { 5C00:2C1C; region anchor, exact origin unknown }
  g_6826 := (Ptr<Word>((iVar8 + 10)))^; { 5C00:2C32 }
  g_6828 := (Ptr<Word>((iVar8 + $C)))^; { 5C00:2C35 }
  uVar6 := Byte((Word(g_6826) shr 8)); { 5C00:2C35; region anchor, exact origin unknown }
  bVar1 := stub_ov24_e8(MakeWord(uVar6, 100), MakeWord(uVar6, 1)); { 5C00:2C3F }
  if ((bVar1 < $1A) and then Seq(bVar1 := FUN_00ba_255b(g_6826, g_6828, iVar7, uVar9), (bVar1 < 4))) then begin { 5C00:2C59 }
    local_3 := FUN_00ba_2637(iVar7, uVar9); { 5C00:2C6B }
    puVar11 := local_e; { 5C00:2C6B; region anchor, exact origin unknown }
    iVar8 := iVar7; { 5C00:2C6B; region anchor, exact origin unknown }
    uVar10 := uVar9; { 5C00:2C6B; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$C))) := 'Spits Acid'; { 5C00:2C83 }
    FUN_00ba_16ec(MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, 10), puVar11, UNK_unaff_SS, iVar8, uVar10); { 5C00:2C8E }
    FUN_00ba_19de(MakeWord(UNK_extraout_AH_00, $17)); { 5C00:2C96 }
    uVar10 := stub_ov31_e12(iVar7, uVar9); { 5C00:2CA1 }
    uVar2 := stub_ov31_e13(iVar7, uVar9); { 5C00:2CAD }
    uVar3 := stub_ov31_e12(g_6826, g_6828); { 5C00:2CBB }
    uVar4 := stub_ov31_e13(g_6826, g_6828); { 5C00:2CC9 }
    FUN_00ba_1a29($1E, 1, uVar4, uVar3, uVar2, uVar10); { 5C00:2CD5 }
    uVar10 := g_6826; { 5C00:2CD5; region anchor, exact origin unknown }
    uVar2 := g_6828; { 5C00:2CD5; region anchor, exact origin unknown }
    uVar3 := stub_ov24_e9(MakeWord(UNK_extraout_AH_01, 4), MakeWord(UNK_extraout_AH_01, 8)); { 5C00:2CE8 }
    bVar1 := Byte((Word(uVar3) shr 8)); { 5C00:2CE8; region anchor, exact origin unknown }
    uVar4 := MakeWord(bVar1, 2); { 5C00:2CE8; region anchor, exact origin unknown }
    uVar5 := stub_ov24_e7((Word(bVar1) shl 8), MakeWord(bVar1, 3), g_6826, g_6828); { 5C00:2CFF }
    stub_ov24_e19(uVar5, uVar4, uVar3, uVar10, uVar2); { 5C00:2D05 }
    stub_ov24_e2(param_2, param_3, MakeWord(UNK_extraout_AH_02, $79), iVar7, uVar9); { 5C00:2D19 }
    stub_ov24_e2(0, 0, MakeWord(UNK_extraout_AH_03, $50), iVar7, uVar9); { 5C00:2D2D }
  end; { 5C00:2D2D; region anchor, exact origin unknown }
  Exit; { 5C00:2D35 }
end;
```

### ov12:2D38 ov12_2D38 (conf L)

Original `ov12_2D38`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; uVar3: Word; uVar4: Byte; uVar5: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e9.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2D38, paired .c.

```pascal
procedure ov12_2D38();
begin
  uVar5 := Word((LongWord(g_5D92) shr $10)); { 5C00:2D38; region anchor, exact origin unknown }
  uVar1 := (Ptr<Word>((SmallInt(g_5D92) + $CC)))^; { 5C00:2D38; region anchor, exact origin unknown }
  uVar2 := (Ptr<Word>((SmallInt(g_5D92) + $CE)))^; { 5C00:2D38; region anchor, exact origin unknown }
  uVar3 := (uVar1 or uVar2); { 5C00:2D38; region anchor, exact origin unknown }
  if ((uVar3 <> 0) and then ((Ptr<ShortInt>((uVar1 + $2E)))^ = $56)) then begin { 5C00:2D38; region anchor, exact origin unknown }
    uVar4 := Byte((uVar3 shr 8)); { 5C00:2D38; region anchor, exact origin unknown }
    g_6818 := stub_ov24_e9(MakeWord(uVar4, 8), MakeWord(uVar4, 3)); { 5C00:2D6A }
  end; { 5C00:2D6A; region anchor, exact origin unknown }
  if ((g_6819 and 9) <> 0) then begin { 5C00:2D6A; region anchor, exact origin unknown }
    g_6818 := (g_6818 + g_681C); { 5C00:2D6F }
  end; { 5C00:2D6F; region anchor, exact origin unknown }
  Exit; { 5C00:2D85 }
end;
```

### ov12:2D88 ov12_2D88 (conf L)

Original `ov12_2D88`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4:2, -2:2.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Word; lVar3: LongInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_101d.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2D88, paired .c.

```pascal
procedure ov12_2D88();
begin
  lVar3 := FUN_5c00_101d(g_5D92, g_5D94); { 5C00:2D97 }
  uVar2 := Word((LongWord(lVar3) shr $10)); { 5C00:2D97; region anchor, exact origin unknown }
  iVar1 := SmallInt(lVar3); { 5C00:2D97; region anchor, exact origin unknown }
  if (lVar3 = 0) then begin { 5C00:2D97; region anchor, exact origin unknown }
    g_6818 := 0; { 5C00:2DC3 }
  end else begin { 5C00:2DC3; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((iVar1 + $32)))^ = $0) and then ((Ptr<ShortInt>((iVar1 + $31)))^ = (-$4F))) then begin { 5C00:2DC3; region anchor, exact origin unknown }
      g_6818 := (g_6818 shr 1); { 5C00:2DD2 }
    end else begin { 5C00:2DD2; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((iVar1 + $32)))^ = $0) then begin { 5C00:2DD2; region anchor, exact origin unknown }
        g_6818 := 0; { 5C00:2DD9 }
      end; { 5C00:2DD9; region anchor, exact origin unknown }
    end; { 5C00:2DD9; region anchor, exact origin unknown }
  end; { 5C00:2DD9; region anchor, exact origin unknown }
  Exit; { 5C00:2DE1 }
end;
```

### ov12:2DE4 ov12_2DE4 (conf L)

Original `ov12_2DE4`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: bVar1: Byte; extraout_AH: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e8, FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2DE4, paired .c.

```pascal
procedure ov12_2DE4();
begin
  bVar1 := stub_ov24_e8(100, 1); { 5C00:2DED }
  if (bVar1 < $1F) then begin { 5C00:2DED; region anchor, exact origin unknown }
    FUN_5c00_0000($B); { 5C00:2DFA }
    FUN_5c00_0000(MakeWord(UNK_extraout_AH, $35)); { 5C00:2E01 }
  end; { 5C00:2E01; region anchor, exact origin unknown }
  Exit; { 5C00:2E05 }
end;
```

### ov12:2E08 ov12_2E08 (conf L)

Original `ov12_2E08`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_5c00_0000.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2E08, paired .c.

```pascal
procedure ov12_2E08();
begin
  FUN_5c00_0000($B); { 5C00:2E0F }
  FUN_5c00_0000(MakeWord(UNK_extraout_AH, $35)); { 5C00:2E16 }
  FUN_5c00_0000(MakeWord(UNK_extraout_AH_00, $34)); { 5C00:2E1D }
  FUN_5c00_0000(MakeWord(UNK_extraout_AH_01, $37)); { 5C00:2E24 }
  if (g_682A = $0) then begin { 5C00:2E24; region anchor, exact origin unknown }
    g_6816 := 100; { 5C00:2E2E }
  end; { 5C00:2E2E; region anchor, exact origin unknown }
  Exit; { 5C00:2E34 }
end;
```

### ov12:2E37 ov12_2E37 (conf L)

Original `ov12_2E37`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -5:1, -4:2, -2:2, +C:2.
Locals/SSA temporaries: piVar1: ^SmallInt; iVar2: SmallInt; uVar3: LongWord; iVar4: SmallInt; uVar5: Word; in_stack_0000000a: LongWord; local_7: Byte; local_6: Word; uStack_4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2E37, paired .c.

```pascal
procedure ov12_2E37();
begin
  uVar3 := (Ptr<LongWord>((SmallInt(UNK_in_stack_0000000a) + $108)))^; { 5C00:2E37; region anchor, exact origin unknown }
  uVar5 := Word((LongWord(uVar3) shr $10)); { 5C00:2E37; region anchor, exact origin unknown }
  iVar4 := SmallInt(uVar3); { 5C00:2E37; region anchor, exact origin unknown }
  iVar2 := (Ptr<SmallInt>((iVar4 + 10)))^; { 5C00:2E37; region anchor, exact origin unknown }
  uVar5 := (Ptr<Word>((iVar4 + $C)))^; { 5C00:2E37; region anchor, exact origin unknown }
  g_6826 := MakeLong(uVar5, iVar2); { 5C00:2E4D }
  uStack_4 := (Ptr<SmallInt>((iVar2 + $CA)))^; { 5C00:2E4D; region anchor, exact origin unknown }
  local_6 := (Ptr<SmallInt>((iVar2 + 200)))^; { 5C00:2E62 }
  while ((local_6 <> 0) or else ((uStack_4 <> 0) and then (g_681E = $0))) do begin { 5C00:2E62; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((local_6 + $34)))^ <> $0) then begin { 5C00:2E62; region anchor, exact origin unknown }
      local_7 := 1; { 5C00:2E81 }
      while true do begin { 5C00:2E81; region anchor, exact origin unknown }
        if ((((Ptr<ShortInt>(((local_6 + Word(local_7)) + $2E)))^ = (-$68)) and then ((Ptr<ShortInt>((local_6 + $31)))^ = (-4))) or else ((Ptr<ShortInt>(((local_6 + Word(local_7)) + $2E)))^ = $76)) then begin { 5C00:2E81; region anchor, exact origin unknown }
          g_681E := $1; { 5C00:2EB6 }
        end; { 5C00:2EB6; region anchor, exact origin unknown }
        if (local_7 = 3) then begin { 5C00:2EB6; region anchor, exact origin unknown }
          Break; { 5C00:2EB6; region anchor, exact origin unknown }
        end; { 5C00:2EB6; region anchor, exact origin unknown }
        local_7 := (local_7 + 1); { 5C00:2E87 }
      end; { 5C00:2E87; region anchor, exact origin unknown }
    end; { 5C00:2E87; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_6 + $2A)); { 5C00:2E87; region anchor, exact origin unknown }
    uStack_4 := (Ptr<SmallInt>((local_6 + $2C)))^; { 5C00:2E87; region anchor, exact origin unknown }
    local_6 := (piVar1)^; { 5C00:2ECC }
  end; { 5C00:2ECC; region anchor, exact origin unknown }
  Exit; { 5C00:2ED7 }
end;
```

### ov12:2EDA ov12_2EDA (conf L)

Original `ov12_2EDA`. Params (ABI order): param_1: ShortInt; param_2: SmallInt; param_3: Word; param_4: Word; param_5: Word.
BP access inventory (hex offset:byte widths): -4:2, -2:2, +6:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: extraout_AH: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e2, stub_ov24_e10, stub_ov24_e1.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2EDA, paired .c.

```pascal
procedure ov12_2EDA(param_1: ShortInt; param_2: SmallInt; param_3: Word; param_4: Word; param_5: Word);
begin
  if (param_1 = $0) then begin { 5C00:2EDA; region anchor, exact origin unknown }
    stub_ov24_e10(0, $C, 0, (Ptr<Byte>((param_2 + $3D)))^, param_4, param_5); { 5C00:2F24 }
    stub_ov24_e1(0, 0, 0, param_4, param_5, MakeWord(UNK_extraout_AH, (Ptr<Byte>((param_2 + $3D)))^)); { 5C00:2F40 }
  end else begin { 5C00:2F40; region anchor, exact origin unknown }
    stub_ov24_e2(0, 0, (Ptr<Byte>((param_2 + $3D)))^, param_4, param_5); { 5C00:2F06 }
  end; { 5C00:2F06; region anchor, exact origin unknown }
  Exit; { 5C00:2F48 }
end;
```

### ov12:2F57 ov12_2F57 (conf L)

Original `ov12_2F57`. Params (ABI order): param_1: ShortInt; param_2: Word; param_3: Word; param_4: LongWord.
BP access inventory (hex offset:byte widths): -15:2, -9:2, -7:2, -5:1, -4:1, -3:1/2, -2:1/2, -1:1/2, +6:1, +C:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; uVar2: Word; unaff_SS: Word; puVar3: ^Byte; iVar4: SmallInt; local_17: array[0..12-1] of Byte; local_b: LongWord; local_7: ShortInt; local_6: ShortInt; local_5: ShortInt; local_4: ShortInt; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e17, stub_ov24_e2, stub_ov24_e18, System.@StrCopy, FUN_00ba_16ec, stub_ov24_e10.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:2F57, paired .c.

```pascal
procedure ov12_2F57(param_1: ShortInt; param_2: Word; param_3: Word; param_4: LongWord);
begin
  if (param_1 = $0) then begin { 5C00:2F57; region anchor, exact origin unknown }
    cVar1 := stub_ov24_e18(@local_3, UNK_unaff_SS, 100, $12, SmallInt(param_4), ExtractBytes(param_4, 2, 2)); { 5C00:3026 }
    if (cVar1 <> $0) then begin { 5C00:3026; region anchor, exact origin unknown }
      if (g_49F3 = $5) then begin { 5C00:3026; region anchor, exact origin unknown }
        g_49F3 := 2; { 5C00:3036 }
        puVar3 := local_17; { 5C00:3036; region anchor, exact origin unknown }
        iVar4 := SmallInt(param_4); { 5C00:3036; region anchor, exact origin unknown }
        uVar2 := ExtractBytes(param_4, 2, 2); { 5C00:3036; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$15))) := 'is stronger'; { 5C00:304B }
        FUN_00ba_16ec(MakeWord(UNK_extraout_AH_00, 1), MakeWord(UNK_extraout_AH_00, 10), puVar3, UNK_unaff_SS, iVar4, uVar2); { 5C00:3056 }
        g_49F3 := $5; { 5C00:305B }
      end else begin { 5C00:305B; region anchor, exact origin unknown }
        puVar3 := local_17; { 5C00:305B; region anchor, exact origin unknown }
        iVar4 := SmallInt(param_4); { 5C00:305B; region anchor, exact origin unknown }
        uVar2 := ExtractBytes(param_4, 2, 2); { 5C00:305B; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$15))) := 'is stronger'; { 5C00:3072 }
        FUN_00ba_16ec(MakeWord(UNK_extraout_AH_01, 1), MakeWord(UNK_extraout_AH_01, 10), puVar3, UNK_unaff_SS, iVar4, uVar2); { 5C00:307D }
      end; { 5C00:307D; region anchor, exact origin unknown }
    end; { 5C00:307D; region anchor, exact origin unknown }
    g_6821 := 1; { 5C00:3082 }
    stub_ov24_e10(1, local_3, 0, $26, SmallInt(param_4), ExtractBytes(param_4, 2, 2)); { 5C00:309A }
  end else begin { 5C00:309A; region anchor, exact origin unknown }
    local_7 := $0; { 5C00:2FFB }
    local_b := Ptr<Byte>(MakeLong((Ptr<Word>((SmallInt(param_4) + $81)))^, Ptr<Byte>((Ptr<Word>((SmallInt(param_4) + $7F)))^))); { 5C00:300A }
    if (((Ptr<ShortInt>((SmallInt(param_4) + $10)))^ = $12) and then ((Ptr<ShortInt>((SmallInt(param_4) + $16)))^ = $64)) then begin { 5C00:300A; region anchor, exact origin unknown }
      local_6 := $1; { 5C00:2F96 }
    end else begin { 5C00:2F96; region anchor, exact origin unknown }
      local_6 := $0; { 5C00:2F90 }
    end; { 5C00:2F90; region anchor, exact origin unknown }
    while true do begin { 5C00:2F90; region anchor, exact origin unknown }
      if (((Ptr<Byte>(local_b) = Ptr<Byte>($0)) and then (ExtractBytes(local_b, 2, 2) = 0)) or else (local_7 <> $0)) then begin { 5C00:2F90; region anchor, exact origin unknown }
        Break; { 5C00:2F90; region anchor, exact origin unknown }
      end; { 5C00:2F90; region anchor, exact origin unknown }
      if (((local_b)^ = $26) and then (Seq(stub_ov24_e17(@local_5, UNK_unaff_SS, @local_4, UNK_unaff_SS, Ptr<Byte>(local_b), ExtractBytes(local_b, 2, 2)), ((local_6 <> $0) and then ((local_b)^ < $80))) or else ((local_4 = $12) and then ((local_5 = $64) and then (local_6 = $0))))) then begin { 5C00:2FC1 }
        stub_ov24_e2(Ptr<Byte>(local_b), ExtractBytes(local_b, 2, 2), MakeWord(UNK_extraout_AH, $26), SmallInt(param_4), ExtractBytes(param_4, 2, 2)); { 5C00:2FF6 }
        local_7 := $1; { 5C00:2F66 }
      end; { 5C00:2F66; region anchor, exact origin unknown }
      uVar2 := Word((LongWord(local_b) shr $10)); { 5C00:2F66; region anchor, exact origin unknown }
      local_b := Ptr<Byte>(MakeLong((Ptr<Word>((Ptr<Byte>(local_b) + 7)))^, (Ptr<^Byte>((Ptr<Byte>(local_b) + 5)))^)); { 5C00:2F76 }
    end; { 5C00:2F76; region anchor, exact origin unknown }
  end; { 5C00:2F76; region anchor, exact origin unknown }
  Exit; { 5C00:30A2 }
end;
```

### ov12:30A5 ov12_30A5 (conf L)

Original `ov12_30A5`. Params (ABI order): param_1: ShortInt; param_2: SmallInt; param_3: Word; param_4: LongWord.
BP access inventory (hex offset:byte widths): -5:1, -4:2, -2:2, +6:1, +8:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: bVar1: Byte; bVar2: Byte; extraout_AH: Byte; uVar3: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_2b88, stub_ov24_e19.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:30A5, paired .c.

```pascal
procedure ov12_30A5(param_1: ShortInt; param_2: SmallInt; param_3: Word; param_4: LongWord);
begin
  if (param_1 = $0) then begin { 5C00:30A5; region anchor, exact origin unknown }
    uVar3 := Word((LongWord(param_4) shr $10)); { 5C00:30A5; region anchor, exact origin unknown }
    if (((Ptr<Byte>((param_2 + $3D)))^ and $F) <> (Ptr<Byte>((SmallInt(param_4) + $A0)))^) then begin { 5C00:30A5; region anchor, exact origin unknown }
      (Ptr<Byte>((param_2 + $34)))^ := 0; { 5C00:30A5; region anchor, exact origin unknown }
      bVar1 := (Ptr<Byte>((param_2 + $3D)))^; { 5C00:30A5; region anchor, exact origin unknown }
      bVar2 := 0; { 5C00:30A5; region anchor, exact origin unknown }
      g_6819 := 8; { 5C00:30EA }
      if (g_49F3 = $5) then begin { 5C00:30EA; region anchor, exact origin unknown }
        FUN_00ba_2b88(); { 5C00:30F6 }
        bVar2 := UNK_extraout_AH; { 5C00:30F6; region anchor, exact origin unknown }
      end; { 5C00:30F6; region anchor, exact origin unknown }
      stub_ov24_e19((Word(bVar2) shl 8), (Word(bVar2) shl 8), MakeWord(bVar2, (bVar1 shr 4)), SmallInt(param_4), uVar3); { 5C00:310B }
      g_6821 := 1; { 5C00:3110 }
    end; { 5C00:3110; region anchor, exact origin unknown }
  end; { 5C00:3110; region anchor, exact origin unknown }
  Exit; { 5C00:3118 }
end;
```

### ov12:3134 ov12_3134 (conf L)

Original `ov12_3134`. Params (ABI order): param_1: ShortInt; param_2: SmallInt; param_3: Word; param_4: LongWord.
BP access inventory (hex offset:byte widths): -1D:2, -4:2, -2:2, +6:1, +8:2, +A:2, +C:2.
Locals/SSA temporaries: unaff_SS: Word; puVar1: ^Byte; local_1f: array[0..25-1] of Byte; local_6: SmallInt; uStack_4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_1693.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:3134, paired .c.

```pascal
procedure ov12_3134(param_1: ShortInt; param_2: SmallInt; param_3: Word; param_4: LongWord);
begin
  _local_6 := MakeLong(param_3, param_2); { 5C00:3134; region anchor, exact origin unknown }
  if ((param_1 = $0) and then ((Ptr<Byte>((SmallInt(param_4) + $10)))^ < $13)) then begin { 5C00:3134; region anchor, exact origin unknown }
    (Ptr<Byte>((param_2 + $34)))^ := 0; { 5C00:3134; region anchor, exact origin unknown }
    puVar1 := local_1f; { 5C00:3134; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$1D))) := 'Must have Giant Strength'; { 5C00:316A }
    FUN_00ba_1693(puVar1, UNK_unaff_SS); { 5C00:316F }
  end; { 5C00:316F; region anchor, exact origin unknown }
  Exit; { 5C00:3177 }
end;
```

### ov12:317A ov12_317A (conf L)

Original `ov12_317A`. Params (ABI order): param_1: ShortInt; param_2: Word; param_3: Word; param_4: Word; param_5: Word.
BP access inventory (hex offset:byte widths): +6:1, +C:2, +E:2.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov24_e2.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:317A, paired .c.

```pascal
procedure ov12_317A(param_1: ShortInt; param_2: Word; param_3: Word; param_4: Word; param_5: Word);
begin
  if (param_1 <> $0) then begin { 5C00:317A; region anchor, exact origin unknown }
    stub_ov24_e2(0, 0, $17, param_4, param_5); { 5C00:3192 }
  end; { 5C00:3192; region anchor, exact origin unknown }
  Exit; { 5C00:3198 }
end;
```

### ov12:319B NoEffectCallback (conf M)

Original `ov12_319B`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

No-op callback. Evidence: decode/listings/ov12.lst at 5C00:319B, paired .c.

```pascal
procedure ov12_319B();
begin
  Exit; { 5C00:319F }
end;
```

### ov12:31A2 InstallEffectCallbacks (conf M)

Original `ov12_31A2`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Stores far overlay-stub pointers at g_682C through g_6A56. These are effect callbacks, including combat and monster abilities; ov12 is not exclusively training. Runtime stub addresses must not be replaced with static analysis segments. Evidence: decode/listings/ov12.lst at 5C00:31A2, paired .c.

```pascal
procedure ov12_31A2();
begin
  g_682C := $2A; { 5C00:31AB }
  g_682E := $41; { 5C00:31AE }
  g_6830 := $2F; { 5C00:31B8 }
  g_6832 := $41; { 5C00:31BB }
  g_6834 := $34; { 5C00:31C5 }
  g_6836 := $41; { 5C00:31C8 }
  g_6838 := $39; { 5C00:31D2 }
  g_683A := $41; { 5C00:31D5 }
  g_683C := $264; { 5C00:31DF }
  g_683E := $41; { 5C00:31E2 }
  g_6840 := $3E; { 5C00:31EC }
  g_6842 := $41; { 5C00:31EF }
  g_6844 := $43; { 5C00:31F9 }
  g_6846 := $41; { 5C00:31FC }
  g_6848 := $48; { 5C00:3206 }
  g_684A := $41; { 5C00:3209 }
  g_684C := $4D; { 5C00:3213 }
  g_684E := $41; { 5C00:3216 }
  g_6850 := $52; { 5C00:3220 }
  g_6852 := $41; { 5C00:3223 }
  g_6854 := $57; { 5C00:322D }
  g_6856 := $41; { 5C00:3230 }
  g_6858 := $5C; { 5C00:323A }
  g_685A := $41; { 5C00:323D }
  g_685C := $264; { 5C00:3247 }
  g_685E := $41; { 5C00:324A }
  g_6860 := $61; { 5C00:3254 }
  g_6862 := $41; { 5C00:3257 }
  g_6864 := $66; { 5C00:3261 }
  g_6866 := $41; { 5C00:3264 }
  g_6868 := $6B; { 5C00:326E }
  g_686A := $41; { 5C00:3271 }
  g_686C := $70; { 5C00:327B }
  g_686E := $41; { 5C00:327E }
  g_6870 := $75; { 5C00:3288 }
  g_6872 := $41; { 5C00:328B }
  g_6874 := $264; { 5C00:3295 }
  g_6876 := $41; { 5C00:3298 }
  g_6878 := $7A; { 5C00:32A2 }
  g_687A := $41; { 5C00:32A5 }
  g_687C := $7F; { 5C00:32AF }
  g_687E := $41; { 5C00:32B2 }
  g_6880 := $84; { 5C00:32BC }
  g_6882 := $41; { 5C00:32BF }
  g_6884 := $89; { 5C00:32C9 }
  g_6886 := $41; { 5C00:32CC }
  g_6888 := $264; { 5C00:32D6 }
  g_688A := $41; { 5C00:32D9 }
  g_688C := $8E; { 5C00:32E3 }
  g_688E := $41; { 5C00:32E6 }
  g_6890 := $93; { 5C00:32F0 }
  g_6892 := $41; { 5C00:32F3 }
  g_6894 := $264; { 5C00:32FD }
  g_6896 := $41; { 5C00:3300 }
  g_6898 := $98; { 5C00:330A }
  g_689A := $41; { 5C00:330D }
  g_689C := $9D; { 5C00:3317 }
  g_689E := $41; { 5C00:331A }
  g_68A0 := $A2; { 5C00:3324 }
  g_68A2 := $41; { 5C00:3327 }
  g_68A4 := $F7; { 5C00:3331 }
  g_68A6 := $41; { 5C00:3334 }
  g_68A8 := $A7; { 5C00:333E }
  g_68AA := $41; { 5C00:3341 }
  g_68AC := $AC; { 5C00:334B }
  g_68AE := $41; { 5C00:334E }
  g_68B0 := $B1; { 5C00:3358 }
  g_68B2 := $41; { 5C00:335B }
  g_68B4 := $B6; { 5C00:3365 }
  g_68B6 := $41; { 5C00:3368 }
  g_68B8 := $BB; { 5C00:3372 }
  g_68BA := $41; { 5C00:3375 }
  g_68BC := $C0; { 5C00:337F }
  g_68BE := $41; { 5C00:3382 }
  g_68C0 := $5C; { 5C00:338C }
  g_68C2 := $41; { 5C00:338F }
  g_68C4 := $C5; { 5C00:3399 }
  g_68C6 := $41; { 5C00:339C }
  g_68C8 := $CA; { 5C00:33A6 }
  g_68CA := $41; { 5C00:33A9 }
  g_68CC := $CF; { 5C00:33B3 }
  g_68CE := $41; { 5C00:33B6 }
  g_68D0 := $D4; { 5C00:33C0 }
  g_68D2 := $41; { 5C00:33C3 }
  g_68D4 := $D9; { 5C00:33CD }
  g_68D6 := $41; { 5C00:33D0 }
  g_68D8 := $DE; { 5C00:33DA }
  g_68DA := $41; { 5C00:33DD }
  g_68DC := $48; { 5C00:33E7 }
  g_68DE := $41; { 5C00:33EA }
  g_68E0 := $4D; { 5C00:33F4 }
  g_68E2 := $41; { 5C00:33F7 }
  g_68E4 := $E3; { 5C00:3401 }
  g_68E6 := $41; { 5C00:3404 }
  g_68E8 := $E8; { 5C00:340E }
  g_68EA := $41; { 5C00:3411 }
  g_68EC := $ED; { 5C00:341B }
  g_68EE := $41; { 5C00:341E }
  g_68F0 := $F2; { 5C00:3428 }
  g_68F2 := $41; { 5C00:342B }
  g_68F4 := $F7; { 5C00:3435 }
  g_68F6 := $41; { 5C00:3438 }
  g_68F8 := $F7; { 5C00:3442 }
  g_68FA := $41; { 5C00:3445 }
  g_68FC := $F7; { 5C00:344F }
  g_68FE := $41; { 5C00:3452 }
  g_6900 := $FC; { 5C00:345C }
  g_6902 := $41; { 5C00:345F }
  g_6904 := $101; { 5C00:3469 }
  g_6906 := $41; { 5C00:346C }
  g_6908 := $106; { 5C00:3476 }
  g_690A := $41; { 5C00:3479 }
  g_690C := $10B; { 5C00:3483 }
  g_690E := $41; { 5C00:3486 }
  g_6910 := $110; { 5C00:3490 }
  g_6912 := $41; { 5C00:3493 }
  g_6914 := $115; { 5C00:349D }
  g_6916 := $41; { 5C00:34A0 }
  g_6918 := $264; { 5C00:34AA }
  g_691A := $41; { 5C00:34AD }
  g_691C := $11A; { 5C00:34B7 }
  g_691E := $41; { 5C00:34BA }
  g_6920 := $11F; { 5C00:34C4 }
  g_6922 := $41; { 5C00:34C7 }
  g_6924 := $264; { 5C00:34D1 }
  g_6926 := $41; { 5C00:34D4 }
  g_6928 := $124; { 5C00:34DE }
  g_692A := $41; { 5C00:34E1 }
  g_692C := $129; { 5C00:34EB }
  g_692E := $41; { 5C00:34EE }
  g_6930 := $12E; { 5C00:34F8 }
  g_6932 := $41; { 5C00:34FB }
  g_6934 := $133; { 5C00:3505 }
  g_6936 := $41; { 5C00:3508 }
  g_6938 := $138; { 5C00:3512 }
  g_693A := $41; { 5C00:3515 }
  g_693C := $13D; { 5C00:351F }
  g_693E := $41; { 5C00:3522 }
  g_6940 := $142; { 5C00:352C }
  g_6942 := $41; { 5C00:352F }
  g_6944 := $147; { 5C00:3539 }
  g_6946 := $41; { 5C00:353C }
  g_6948 := $14C; { 5C00:3546 }
  g_694A := $41; { 5C00:3549 }
  g_694C := $8E; { 5C00:3553 }
  g_694E := $68; { 5C00:3556 }
  g_6950 := $93; { 5C00:3560 }
  g_6952 := $68; { 5C00:3563 }
  g_6954 := $151; { 5C00:356D }
  g_6956 := $41; { 5C00:3570 }
  g_6958 := $156; { 5C00:357A }
  g_695A := $41; { 5C00:357D }
  g_695C := $15B; { 5C00:3587 }
  g_695E := $41; { 5C00:358A }
  g_6960 := $160; { 5C00:3594 }
  g_6962 := $41; { 5C00:3597 }
  g_6964 := $165; { 5C00:35A1 }
  g_6966 := $41; { 5C00:35A4 }
  g_6968 := $16A; { 5C00:35AE }
  g_696A := $41; { 5C00:35B1 }
  g_696C := $16F; { 5C00:35BB }
  g_696E := $41; { 5C00:35BE }
  g_6970 := $174; { 5C00:35C8 }
  g_6972 := $41; { 5C00:35CB }
  g_6974 := $179; { 5C00:35D5 }
  g_6976 := $41; { 5C00:35D8 }
  g_6978 := $17E; { 5C00:35E2 }
  g_697A := $41; { 5C00:35E5 }
  g_697C := $183; { 5C00:35EF }
  g_697E := $41; { 5C00:35F2 }
  g_6980 := $188; { 5C00:35FC }
  g_6982 := $41; { 5C00:35FF }
  g_6984 := $18D; { 5C00:3609 }
  g_6986 := $41; { 5C00:360C }
  g_698C := $192; { 5C00:3616 }
  g_698E := $41; { 5C00:3619 }
  g_6990 := $197; { 5C00:3623 }
  g_6992 := $41; { 5C00:3626 }
  g_6994 := $19C; { 5C00:3630 }
  g_6996 := $41; { 5C00:3633 }
  g_6998 := $264; { 5C00:363D }
  g_699A := $41; { 5C00:3640 }
  g_699C := $1A1; { 5C00:364A }
  g_699E := $41; { 5C00:364D }
  g_69A0 := $1A6; { 5C00:3657 }
  g_69A2 := $41; { 5C00:365A }
  g_69A4 := $1AB; { 5C00:3664 }
  g_69A6 := $41; { 5C00:3667 }
  g_69A8 := $1B0; { 5C00:3671 }
  g_69AA := $41; { 5C00:3674 }
  g_69AC := $1B5; { 5C00:367E }
  g_69AE := $41; { 5C00:3681 }
  g_69B0 := $1BA; { 5C00:368B }
  g_69B2 := $41; { 5C00:368E }
  g_69B4 := $1BF; { 5C00:3698 }
  g_69B6 := $41; { 5C00:369B }
  g_69B8 := $1C4; { 5C00:36A5 }
  g_69BA := $41; { 5C00:36A8 }
  g_69BC := $1C9; { 5C00:36B2 }
  g_69BE := $41; { 5C00:36B5 }
  g_69C0 := $1CE; { 5C00:36BF }
  g_69C2 := $41; { 5C00:36C2 }
  g_69C4 := $1D3; { 5C00:36CC }
  g_69C6 := $41; { 5C00:36CF }
  g_69C8 := $1D8; { 5C00:36D9 }
  g_69CA := $41; { 5C00:36DC }
  g_69CC := $1DD; { 5C00:36E6 }
  g_69CE := $41; { 5C00:36E9 }
  g_69D0 := $1E2; { 5C00:36F3 }
  g_69D2 := $41; { 5C00:36F6 }
  g_69D4 := $1E7; { 5C00:3700 }
  g_69D6 := $41; { 5C00:3703 }
  g_69D8 := $1EC; { 5C00:370D }
  g_69DA := $41; { 5C00:3710 }
  g_69DC := $1F1; { 5C00:371A }
  g_69DE := $41; { 5C00:371D }
  g_69E0 := $1F6; { 5C00:3727 }
  g_69E2 := $41; { 5C00:372A }
  g_69E4 := $1FB; { 5C00:3734 }
  g_69E6 := $41; { 5C00:3737 }
  g_69E8 := $200; { 5C00:3741 }
  g_69EA := $41; { 5C00:3744 }
  g_69EC := $205; { 5C00:374E }
  g_69EE := $41; { 5C00:3751 }
  g_69F0 := $20A; { 5C00:375B }
  g_69F2 := $41; { 5C00:375E }
  g_69F4 := $20F; { 5C00:3768 }
  g_69F6 := $41; { 5C00:376B }
  g_69F8 := $214; { 5C00:3775 }
  g_69FA := $41; { 5C00:3778 }
  g_69FC := $219; { 5C00:3782 }
  g_69FE := $41; { 5C00:3785 }
  g_6A00 := $21E; { 5C00:378F }
  g_6A02 := $41; { 5C00:3792 }
  g_6A04 := $223; { 5C00:379C }
  g_6A06 := $41; { 5C00:379F }
  g_6A08 := $228; { 5C00:37A9 }
  g_6A0A := $41; { 5C00:37AC }
  g_6A0C := $22D; { 5C00:37B6 }
  g_6A0E := $41; { 5C00:37B9 }
  g_6A10 := $232; { 5C00:37C3 }
  g_6A12 := $41; { 5C00:37C6 }
  g_6A14 := $237; { 5C00:37D0 }
  g_6A16 := $41; { 5C00:37D3 }
  g_6A18 := $23C; { 5C00:37DD }
  g_6A1A := $41; { 5C00:37E0 }
  g_6A1C := $241; { 5C00:37EA }
  g_6A1E := $41; { 5C00:37ED }
  g_6A20 := $246; { 5C00:37F7 }
  g_6A22 := $41; { 5C00:37FA }
  g_6A24 := $264; { 5C00:3804 }
  g_6A26 := $41; { 5C00:3807 }
  g_6A28 := $24B; { 5C00:3811 }
  g_6A2A := $41; { 5C00:3814 }
  g_6A2C := $24B; { 5C00:381E }
  g_6A2E := $41; { 5C00:3821 }
  g_6A30 := $24B; { 5C00:382B }
  g_6A32 := $41; { 5C00:382E }
  g_6A34 := $250; { 5C00:3838 }
  g_6A36 := $41; { 5C00:383B }
  g_6A38 := $255; { 5C00:3845 }
  g_6A3A := $41; { 5C00:3848 }
  g_6A3C := $24B; { 5C00:3852 }
  g_6A3E := $41; { 5C00:3855 }
  g_6A40 := $24B; { 5C00:385F }
  g_6A42 := $41; { 5C00:3862 }
  g_6A44 := $25A; { 5C00:386C }
  g_6A46 := $41; { 5C00:386F }
  g_6A48 := $24B; { 5C00:3879 }
  g_6A4A := $41; { 5C00:387C }
  g_6A4C := $25F; { 5C00:3886 }
  g_6A4E := $41; { 5C00:3889 }
  g_6A50 := $24B; { 5C00:3893 }
  g_6A52 := $41; { 5C00:3896 }
  g_6A54 := $24B; { 5C00:38A0 }
  g_6A56 := $41; { 5C00:38A3 }
  Exit; { 5C00:38A8 }
end;
```

### ov12:38A9 ov12_init (conf L)

Original `ov12_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Effect callback ABI/role unverified; retain numeric accesses and original entry name. Evidence: decode/listings/ov12.lst at 5C00:38A9, paired .c.

```pascal
procedure ov12_init();
begin
  Exit; { 5C00:38AD }
end;
```

## ov00

### ov00:0042 HeapFailureHandler (conf M)

Original `ov00_0042`. Params (ABI order): param_1: SmallInt.
BP access inventory (hex offset:byte widths): -28:2, -20:2, -3:1, -2:2, +6:2.
Locals/SSA temporaries: uVar1: Word; extraout_AH: Byte; uVar2: Word; unaff_SS: Word; puVar3: ^Byte; uVar4: Word; local_2a: array[0..8-1] of Byte; local_22: array[0..29-1] of Byte; local_5: ShortInt; local_4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_0709_0bf5, stub_ov17_e9, FUN_0899_0000.

Heap error recovery; attempts save when game state is available; warning and exit otherwise. Evidence: decode/listings/ov00.lst at 2000:0042, paired .c.

```pascal
function ov00_0042(param_1: SmallInt): Word;
begin
  uVar2 := $2000; { 2000:0042; region anchor, exact origin unknown }
  if (param_1 <> 0) then begin { 2000:0042; region anchor, exact origin unknown }
    local_5 := $0; { 2000:004E }
    repeat { 2000:004E; region anchor, exact origin unknown }
      uVar1 := $E; { 2000:004E; region anchor, exact origin unknown }
      puVar3 := local_22; { 2000:004E; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 2000:004E; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$20))) := 'WARNING: Insufficient Memory'; { 2000:005F }
      FUN_0709_0bf5(puVar3, uVar4, uVar1); { 2000:0064 }
      if (g_49D0 = $0) then begin { 2000:0064; region anchor, exact origin unknown }
        local_5 := $1; { 2000:0078 }
        uVar1 := MakeWord(UNK_extraout_AH, $E); { 2000:0078; region anchor, exact origin unknown }
        puVar3 := local_2a; { 2000:0078; region anchor, exact origin unknown }
        uVar4 := UNK_unaff_SS; { 2000:0078; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$28))) := 'Insufficient Memory. Exiting Program'; { 2000:008E }
        uVar2 := $709; { 2000:008E; region anchor, exact origin unknown }
        FUN_0709_0bf5(puVar3, uVar4, uVar1); { 2000:0093 }
      end else begin { 2000:0093; region anchor, exact origin unknown }
        uVar2 := $7C; { 2000:0093; region anchor, exact origin unknown }
        stub_ov17_e9(); { 2000:0070 }
        local_5 := g_557D; { 2000:007D }
      end; { 2000:007D; region anchor, exact origin unknown }
    until not ((local_5 = $0)); { 2000:007D; region anchor, exact origin unknown }
    FUN_0899_0000(); { 2000:009E }
  end; { 2000:009E; region anchor, exact origin unknown }
  Exit(local_4); { 2000:00A9 }
end;
```

### ov00:00AC ov00_init (conf L)

Original `ov00_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Role unverified; original entry name retained. Evidence: decode/listings/ov00.lst at 2000:00AC, paired .c.

```pascal
procedure ov00_init();
begin
  g_4414 := $25; { 2000:00B5 }
  g_4416 := $16; { 2000:00B8 }
  Exit; { 2000:00BD }
end;
```

## ov01

### ov01:0000 TitleDelayOrKey (conf M)

Original `FUN_2500_0000`. Params (ABI order): param_1: SmallInt.
BP access inventory (hex offset:byte widths): -8:2, -6:2, -4:2, -2:2, +6:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; uVar3: Word; in_DX: SmallInt; iVar4: SmallInt.
Callers: FUN_2500_0206,ov01_0627.
Callees (listing): FUN_0709_0c3f, Crt.KeyPressed, FUN_0899_0104.

Timed input polling. Evidence: decode/listings/ov01.lst at 2500:0000, paired .c.

```pascal
procedure FUN_2500_0000(param_1: SmallInt);
begin
  uVar2 := FUN_0709_0c3f(); { 2500:0006 }
  UNK_in_DX := (UNK_in_DX + Word(CARRY2((param_1 * 100), uVar2))); { 2500:0006; region anchor, exact origin unknown }
  iVar4 := UNK_in_DX; { 2500:0006; region anchor, exact origin unknown }
  repeat { 2500:0006; region anchor, exact origin unknown }
    uVar3 := FUN_0709_0c3f(); { 2500:0025 }
    if ((UNK_in_DX < iVar4) or else ((UNK_in_DX <= iVar4) and then (((param_1 * 100) + uVar2) <= uVar3))) then begin { 2500:0025; region anchor, exact origin unknown }
      Break; { 2500:0025; region anchor, exact origin unknown }
    end; { 2500:0025; region anchor, exact origin unknown }
    cVar1 := KeyPressed(); { 2500:0036 }
  until not ((cVar1 = $0)); { 2500:0036; region anchor, exact origin unknown }
  FUN_0899_0104(); { 2500:003F }
  Exit; { 2500:0047 }
end;
```

### ov01:0206 DrawCredits (conf M)

Original `FUN_2500_0206`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -25:2, -24:2, -1B:2, -15:2, -12:2, -11:2, -10:2, -F:2, -E:2, -D:2, -C:2, -B:2, -A:2, -9:2, -1:2.
Locals/SSA temporaries: in_AX: Word; uVar1: Word; uVar2: Word; uVar3: Word; uVar4: Word; iVar5: SmallInt; iVar6: SmallInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; extraout_AH_06: Byte; extraout_AH_07: Byte; extraout_AH_08: Byte; extraout_AH_09: Byte; extraout_AH_10: Byte; extraout_AH_11: Byte; extraout_AH_12: Byte; extraout_AH_13: Byte; extraout_AH_14: Byte; extraout_AH_15: Byte; extraout_AH_16: Byte; extraout_AH_17: Byte; extraout_AH_18: Byte; extraout_AH_19: Byte; extraout_AH_20: Byte; extraout_AH_21: Byte; extraout_AH_22: Byte; extraout_AH_23: Byte; extraout_AH_24: Byte; extraout_AH_25: Byte; extraout_AH_26: Byte; extraout_AH_27: Byte; extraout_AH_28: Byte; extraout_AH_29: Byte; extraout_AH_30: Byte; extraout_AH_31: Byte; extraout_AH_32: Byte; uVar7: Word; unaff_SS: Word; puVar9: ^Byte; local_27: Byte; local_26: array[0..9-1] of Byte; local_1d: array[0..6-1] of Byte; local_17: array[0..3-1] of Byte; local_14: Byte; local_13: Byte; local_12: Byte; local_11: Byte; local_10: Byte; local_f: Byte; local_e: Byte; local_d: Byte; local_c: Byte; local_b: array[0..8-1] of Byte; local_3: Byte; bVar8: Byte.
Callers: ov01_0627.
Callees (listing): System.@StrCopy, FUN_03f1_02e8, FUN_0709_0626, FUN_2500_0000.

Credits text renderer. Evidence: decode/listings/ov01.lst at 2500:0206, paired .c.

```pascal
procedure FUN_2500_0206();
begin
  bVar8 := Byte((Word(UNK_in_AX) shr 8)); { 2500:0206; region anchor, exact origin unknown }
  uVar1 := MakeWord(bVar8, 1); { 2500:0206; region anchor, exact origin unknown }
  uVar2 := MakeWord(bVar8, 1); { 2500:0206; region anchor, exact origin unknown }
  uVar3 := MakeWord(bVar8, $26); { 2500:0206; region anchor, exact origin unknown }
  uVar4 := MakeWord(bVar8, 3); { 2500:0206; region anchor, exact origin unknown }
  iVar5 := (Word(bVar8) shl 8); { 2500:0206; region anchor, exact origin unknown }
  iVar6 := (Word(bVar8) shl 8); { 2500:0206; region anchor, exact origin unknown }
  puVar9 := @local_3; { 2500:0206; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0206; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1))) := ''; { 2500:0228 }
  FUN_03f1_02e8(puVar9, uVar7, iVar6, iVar5, uVar4, uVar3, uVar2, uVar1); { 2500:022D }
  uVar1 := MakeWord(UNK_extraout_AH, 1); { 2500:022D; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH, 5); { 2500:022D; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH, $26); { 2500:022D; region anchor, exact origin unknown }
  uVar4 := MakeWord(UNK_extraout_AH, $17); { 2500:022D; region anchor, exact origin unknown }
  iVar5 := (Word(UNK_extraout_AH) shl 8); { 2500:022D; region anchor, exact origin unknown }
  iVar6 := (Word(UNK_extraout_AH) shl 8); { 2500:022D; region anchor, exact origin unknown }
  puVar9 := @local_3; { 2500:022D; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:022D; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1))) := ''; { 2500:024E }
  FUN_03f1_02e8(puVar9, uVar7, iVar6, iVar5, uVar4, uVar3, uVar2, uVar1); { 2500:0253 }
  uVar1 := MakeWord(UNK_extraout_AH_00, 5); { 2500:0253; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_00, 1); { 2500:0253; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_00, 10); { 2500:0253; region anchor, exact origin unknown }
  puVar9 := local_17; { 2500:0253; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0253; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$15))) := 'scenario created by:'; { 2500:026B }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0270 }
  uVar1 := MakeWord(UNK_extraout_AH_01, $1A); { 2500:0270; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_01, 1); { 2500:0270; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_01, $E); { 2500:0270; region anchor, exact origin unknown }
  puVar9 := @local_c; { 2500:0270; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0270; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$A))) := 'tsr, inc.'; { 2500:0288 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:028D }
  uVar1 := MakeWord(UNK_extraout_AH_02, $F); { 2500:028D; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_02, 2); { 2500:028D; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_02, 10); { 2500:028D; region anchor, exact origin unknown }
  puVar9 := local_b; { 2500:028D; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:028D; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$9))) := 'jim ward'; { 2500:02A5 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:02AA }
  uVar1 := MakeWord(UNK_extraout_AH_03, 2); { 2500:02AA; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_03, 3); { 2500:02AA; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_03, 10); { 2500:02AA; region anchor, exact origin unknown }
  puVar9 := @local_27; { 2500:02AA; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:02AA; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$25))) := 'david cook,steve winter,mike breault'; { 2500:02C2 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:02C7 }
  uVar1 := MakeWord(UNK_extraout_AH_04, 1); { 2500:02C7; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_04, 5); { 2500:02C7; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_04, 10); { 2500:02C7; region anchor, exact origin unknown }
  puVar9 := @local_13; { 2500:02C7; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:02C7; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$11))) := 'game created by:'; { 2500:02DF }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:02E4 }
  uVar1 := MakeWord(UNK_extraout_AH_05, $12); { 2500:02E4; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_05, 5); { 2500:02E4; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_05, $E); { 2500:02E4; region anchor, exact origin unknown }
  puVar9 := local_17; { 2500:02E4; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:02E4; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$15))) := 'ssi special projects'; { 2500:02FC }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0301 }
  uVar1 := MakeWord(UNK_extraout_AH_06, $E); { 2500:0301; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_06, 6); { 2500:0301; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_06, $B); { 2500:0301; region anchor, exact origin unknown }
  puVar9 := @local_e; { 2500:0301; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0301; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$C))) := 'version 1.3'; { 2500:0319 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:031E }
  uVar1 := MakeWord(UNK_extraout_AH_07, 2); { 2500:031E; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_07, 7); { 2500:031E; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_07, $E); { 2500:031E; region anchor, exact origin unknown }
  puVar9 := @local_f; { 2500:031E; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:031E; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$D))) := 'programming:'; { 2500:0336 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:033B }
  uVar1 := MakeWord(UNK_extraout_AH_08, $14); { 2500:033B; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_08, 7); { 2500:033B; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_08, $E); { 2500:033B; region anchor, exact origin unknown }
  puVar9 := local_b; { 2500:033B; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:033B; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$9))) := 'original'; { 2500:0353 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0358 }
  uVar1 := MakeWord(UNK_extraout_AH_09, 2); { 2500:0358; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_09, 8); { 2500:0358; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_09, $B); { 2500:0358; region anchor, exact origin unknown }
  puVar9 := @local_f; { 2500:0358; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0358; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$D))) := 'scot bayless'; { 2500:0370 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0375 }
  uVar1 := MakeWord(UNK_extraout_AH_10, $14); { 2500:0375; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_10, 8); { 2500:0375; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_10, $E); { 2500:0375; region anchor, exact origin unknown }
  puVar9 := @local_f; { 2500:0375; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0375; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$D))) := 'programming:'; { 2500:038D }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0392 }
  uVar1 := MakeWord(UNK_extraout_AH_11, 2); { 2500:0392; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_11, 9); { 2500:0392; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_11, $B); { 2500:0392; region anchor, exact origin unknown }
  puVar9 := @local_d; { 2500:0392; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0392; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$B))) := 'brad myers'; { 2500:03AA }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:03AF }
  uVar1 := MakeWord(UNK_extraout_AH_12, $14); { 2500:03AF; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_12, 9); { 2500:03AF; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_12, $B); { 2500:03AF; region anchor, exact origin unknown }
  puVar9 := @local_e; { 2500:03AF; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:03AF; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$C))) := 'keith brors'; { 2500:03C7 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:03CC }
  uVar1 := MakeWord(UNK_extraout_AH_13, 2); { 2500:03CC; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_13, 10); { 2500:03CC; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_13, $B); { 2500:03CC; region anchor, exact origin unknown }
  puVar9 := @local_d; { 2500:03CC; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:03CC; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$B))) := 'russ brown'; { 2500:03E4 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:03E9 }
  uVar1 := MakeWord(UNK_extraout_AH_14, $14); { 2500:03E9; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_14, 10); { 2500:03E9; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_14, $B); { 2500:03E9; region anchor, exact origin unknown }
  puVar9 := @local_d; { 2500:03E9; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:03E9; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$B))) := 'brad myers'; { 2500:0401 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0406 }
  uVar1 := MakeWord(UNK_extraout_AH_15, 2); { 2500:0406; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_15, $B); { 2500:0406; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_15, $B); { 2500:0406; region anchor, exact origin unknown }
  puVar9 := @local_c; { 2500:0406; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0406; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$A))) := 'ted greer'; { 2500:041E }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0423 }
  uVar1 := MakeWord(UNK_extraout_AH_16, 2); { 2500:0423; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_16, $D); { 2500:0423; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_16, $E); { 2500:0423; region anchor, exact origin unknown }
  puVar9 := @local_10; { 2500:0423; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0423; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$E))) := 'graphic arts:'; { 2500:043B }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0440 }
  uVar1 := MakeWord(UNK_extraout_AH_17, $14); { 2500:0440; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_17, $D); { 2500:0440; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_17, $E); { 2500:0440; region anchor, exact origin unknown }
  puVar9 := @local_14; { 2500:0440; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0440; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$12))) := 'encounter coding:'; { 2500:0458 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:045D }
  uVar1 := MakeWord(UNK_extraout_AH_18, 2); { 2500:045D; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_18, $E); { 2500:045D; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_18, $B); { 2500:045D; region anchor, exact origin unknown }
  puVar9 := local_b; { 2500:045D; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:045D; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$9))) := 'tom wahl'; { 2500:0475 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:047A }
  uVar1 := MakeWord(UNK_extraout_AH_19, $14); { 2500:047A; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_19, $E); { 2500:047A; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_19, $B); { 2500:047A; region anchor, exact origin unknown }
  puVar9 := @local_e; { 2500:047A; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:047A; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$C))) := 'paul murray'; { 2500:0492 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0497 }
  uVar1 := MakeWord(UNK_extraout_AH_20, 2); { 2500:0497; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_20, $F); { 2500:0497; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_20, $B); { 2500:0497; region anchor, exact origin unknown }
  puVar9 := @local_d; { 2500:0497; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0497; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$B))) := 'fred butts'; { 2500:04AF }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:04B4 }
  uVar1 := MakeWord(UNK_extraout_AH_21, $14); { 2500:04B4; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_21, $F); { 2500:04B4; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_21, $B); { 2500:04B4; region anchor, exact origin unknown }
  puVar9 := @local_d; { 2500:04B4; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:04B4; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$B))) := 'russ brown'; { 2500:04CC }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:04D1 }
  uVar1 := MakeWord(UNK_extraout_AH_22, 2); { 2500:04D1; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_22, $10); { 2500:04D1; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_22, $B); { 2500:04D1; region anchor, exact origin unknown }
  puVar9 := @local_10; { 2500:04D1; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:04D1; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$E))) := 'darla marasco'; { 2500:04E9 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:04EE }
  uVar1 := MakeWord(UNK_extraout_AH_23, $14); { 2500:04EE; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_23, $10); { 2500:04EE; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_23, $B); { 2500:04EE; region anchor, exact origin unknown }
  puVar9 := @local_10; { 2500:04EE; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:04EE; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$E))) := 'victor penman'; { 2500:0506 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:050B }
  uVar1 := MakeWord(UNK_extraout_AH_24, 2); { 2500:050B; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_24, $11); { 2500:050B; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_24, $B); { 2500:050B; region anchor, exact origin unknown }
  puVar9 := @local_11; { 2500:050B; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:050B; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$F))) := 'susan halbleib'; { 2500:0523 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0528 }
  uVar1 := MakeWord(UNK_extraout_AH_25, $14); { 2500:0528; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_25, $11); { 2500:0528; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_25, $B); { 2500:0528; region anchor, exact origin unknown }
  puVar9 := @local_f; { 2500:0528; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0528; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$D))) := 'dave shelley'; { 2500:0540 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0545 }
  uVar1 := MakeWord(UNK_extraout_AH_26, 2); { 2500:0545; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_26, $13); { 2500:0545; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_26, $E); { 2500:0545; region anchor, exact origin unknown }
  puVar9 := @local_12; { 2500:0545; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0545; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$10))) := 'project manager'; { 2500:055D }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:0562 }
  uVar1 := MakeWord(UNK_extraout_AH_27, $14); { 2500:0562; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_27, $13); { 2500:0562; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_27, $E); { 2500:0562; region anchor, exact origin unknown }
  puVar9 := @local_d; { 2500:0562; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0562; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$B))) := 'developer:'; { 2500:057A }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:057F }
  uVar1 := MakeWord(UNK_extraout_AH_28, 2); { 2500:057F; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_28, $14); { 2500:057F; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_28, $B); { 2500:057F; region anchor, exact origin unknown }
  puVar9 := @local_10; { 2500:057F; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:057F; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$E))) := 'victor penman'; { 2500:0597 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:059C }
  uVar1 := MakeWord(UNK_extraout_AH_29, $14); { 2500:059C; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_29, $14); { 2500:059C; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_29, $B); { 2500:059C; region anchor, exact origin unknown }
  puVar9 := @local_14; { 2500:059C; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:059C; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$12))) := 'george mac donald'; { 2500:05B4 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:05B9 }
  uVar1 := MakeWord(UNK_extraout_AH_30, 2); { 2500:05B9; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_30, $16); { 2500:05B9; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_30, $E); { 2500:05B9; region anchor, exact origin unknown }
  puVar9 := local_b; { 2500:05B9; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:05B9; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$9))) := 'testing:'; { 2500:05D1 }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:05D6 }
  uVar1 := MakeWord(UNK_extraout_AH_31, $B); { 2500:05D6; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_31, $16); { 2500:05D6; region anchor, exact origin unknown }
  uVar3 := MakeWord(UNK_extraout_AH_31, $B); { 2500:05D6; region anchor, exact origin unknown }
  puVar9 := local_1d; { 2500:05D6; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:05D6; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1B))) := 'joel billings,steve salyer'; { 2500:05EE }
  FUN_0709_0626(puVar9, uVar7, uVar3, uVar2, uVar1); { 2500:05F3 }
  uVar7 := MakeWord(UNK_extraout_AH_32, 2); { 2500:05F3; region anchor, exact origin unknown }
  uVar1 := MakeWord(UNK_extraout_AH_32, $17); { 2500:05F3; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH_32, $B); { 2500:05F3; region anchor, exact origin unknown }
  puVar9 := local_26; { 2500:05F3; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$24))) := 'james kucera,robert daly,rick white'; { 2500:060B }
  FUN_0709_0626(puVar9, UNK_unaff_SS, uVar2, uVar1, uVar7); { 2500:0610 }
  FUN_2500_0000(10); { 2500:061A }
  Exit; { 2500:0620 }
end;
```

### ov01:0627 ShowTitleSequence (conf M)

Original `ov01_0627`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -3C:2, -37:1, -36:2, -34:2, -32:2, -9:1, -8:2, -6:2, -4:2, -2:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; uVar2: Word; uVar3: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; extraout_AH_06: Byte; extraout_DX: SmallInt; iVar4: SmallInt; extraout_DX_00: SmallInt; unaff_SS: Word; bVar5: Boolean; puVar6: ^Byte; uVar7: Word; local_3e: array[0..5-1] of Byte; local_39: ShortInt; local_38: Word; local_36: SmallInt; local_34: array[0..41-1] of Byte; local_b: ShortInt; local_a: Word; local_8: SmallInt; local_6: Word; local_4: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrAssign, System.@StrCopy, FUN_0464_0111, FUN_0464_1951, FUN_2500_0000, FUN_0464_2595, FUN_0709_0c3f, System.RandomWord, FUN_0464_2a0d, Crt.Delay, Crt.KeyPressed, FUN_0899_0104, FUN_2500_0206.

TITLE resources and palette animation, then credits. Evidence: decode/listings/ov01.lst at 2500:0627, paired .c.

```pascal
procedure ov01_0627();
begin
  local_a := 0; { 2500:062F }
  local_8 := 0; { 2500:0632 }
  local_6 := 0; { 2500:0637 }
  local_4 := 0; { 2500:063A }
  PString(FarPtr(SS, BPAddr(-$32))) := Copy(PString(FarPtr($0C7C, $547C)), 1, $28); { 2500:064B }
  g_547C := 0; { 2500:0650 }
  puVar6 := local_3e; { 2500:0650; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 2500:0650; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$3C))) := 'title'; { 2500:065F }
  FUN_0464_0111(@local_6, UNK_unaff_SS, (Word(UNK_extraout_AH) shl 8), (Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 1), puVar6, uVar7); { 2500:0672 }
  FUN_0464_1951(local_6, local_4, 0, 0); { 2500:0683 }
  FUN_2500_0000(5); { 2500:068D }
  if (g_49D1 = $0) then begin { 2500:068D; region anchor, exact origin unknown }
    PString(FarPtr($0C7C, $547C)) := Copy(PString(FarPtr(SS, BPAddr(-$32))), 1, $FF); { 2500:06A5 }
  end else begin { 2500:06A5; region anchor, exact origin unknown }
    puVar6 := local_3e; { 2500:06A5; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 2500:06A5; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3C))) := 'title'; { 2500:06B7 }
    FUN_0464_0111(@local_6, UNK_unaff_SS, (Word(UNK_extraout_AH_00) shl 8), (Word(UNK_extraout_AH_00) shl 8), MakeWord(UNK_extraout_AH_00, 2), puVar6, uVar7); { 2500:06CA }
    PString(FarPtr($0C7C, $547C)) := Copy(PString(FarPtr(SS, BPAddr(-$32))), 1, $FF); { 2500:06DD }
    FUN_0464_1951(local_6, local_4, 0, 0); { 2500:06EE }
    FUN_0464_2595(@local_6, UNK_unaff_SS); { 2500:06F8 }
    iVar4 := UNK_extraout_DX; { 2500:06F8; region anchor, exact origin unknown }
    uVar2 := FUN_0709_0c3f(); { 2500:06FD }
    local_38 := (uVar2 + 500); { 2500:0708 }
    iVar4 := (iVar4 + Word(($FE0B < uVar2))); { 2500:0708; region anchor, exact origin unknown }
    local_36 := iVar4; { 2500:070B }
    repeat { 2500:070B; region anchor, exact origin unknown }
      if (g_4A1E = $1) then begin { 2500:070B; region anchor, exact origin unknown }
        uVar2 := Random($4); { 2500:071C }
        iVar4 := 0; { 2500:071C; region anchor, exact origin unknown }
        bVar5 := CARRY2(local_a, uVar2); { 2500:071C; region anchor, exact origin unknown }
        local_a := (local_a + uVar2); { 2500:0723 }
        local_8 := (local_8 + Word(bVar5)); { 2500:0743 }
        if ((0 < local_8) or else (((-1) < local_8) and then (50000 < local_a))) then begin { 2500:0743; region anchor, exact origin unknown }
          local_a := 0; { 2500:0740 }
          local_8 := 0; { 2500:0740; region anchor, exact origin unknown }
          iVar4 := Random($3); { 2500:074A }
          local_39 := ShortInt((iVar4 + 1)); { 2500:0750 }
          uVar2 := ((iVar4 + 1) and $FF00); { 2500:0750; region anchor, exact origin unknown }
          local_b := $0; { 2500:075D }
          while true do begin { 2500:075D; region anchor, exact origin unknown }
            uVar3 := Byte((uVar2 shr 8)); { 2500:075D; region anchor, exact origin unknown }
            FUN_0464_2a0d(MakeWord(uVar3, 9), MakeWord(uVar3, 1)); { 2500:076B }
            Delay($96); { 2500:0774 }
            FUN_0464_2a0d(MakeWord(UNK_extraout_AH_01, $B), MakeWord(UNK_extraout_AH_01, 1)); { 2500:077F }
            Delay($64); { 2500:0788 }
            FUN_0464_2a0d(MakeWord(UNK_extraout_AH_02, $F), MakeWord(UNK_extraout_AH_02, 1)); { 2500:0793 }
            Delay($32); { 2500:079C }
            FUN_0464_2a0d(MakeWord(UNK_extraout_AH_03, $B), MakeWord(UNK_extraout_AH_03, 1)); { 2500:07A7 }
            Delay($64); { 2500:07B0 }
            FUN_0464_2a0d(MakeWord(UNK_extraout_AH_04, 9), MakeWord(UNK_extraout_AH_04, 1)); { 2500:07BB }
            Delay($96); { 2500:07C4 }
            FUN_0464_2a0d(MakeWord(UNK_extraout_AH_05, 1), MakeWord(UNK_extraout_AH_05, 1)); { 2500:07CF }
            uVar2 := MakeWord(UNK_extraout_AH_06, local_b); { 2500:07CF; region anchor, exact origin unknown }
            iVar4 := UNK_extraout_DX_00; { 2500:07CF; region anchor, exact origin unknown }
            if (local_b = local_39) then begin { 2500:07CF; region anchor, exact origin unknown }
              Break; { 2500:07CF; region anchor, exact origin unknown }
            end; { 2500:07CF; region anchor, exact origin unknown }
            local_b := (local_b + $1); { 2500:0762 }
          end; { 2500:0762; region anchor, exact origin unknown }
        end; { 2500:0762; region anchor, exact origin unknown }
      end; { 2500:0762; region anchor, exact origin unknown }
      cVar1 := KeyPressed(); { 2500:07DC }
    until not ((((cVar1 = $0) and then Seq(uVar2 := FUN_0709_0c3f(), (iVar4 <= local_36))) and then ((iVar4 < local_36) or else (uVar2 < local_38)))); { 2500:07E5 }
    FUN_0899_0104(); { 2500:07FC }
    FUN_2500_0206(); { 2500:0802 }
  end; { 2500:0802; region anchor, exact origin unknown }
  Exit; { 2500:0808 }
end;
```

### ov01:0809 ov01_init (conf L)

Original `ov01_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov01.lst at 2500:0809, paired .c.

```pascal
procedure ov01_init();
begin
  Exit; { 2500:080D }
end;
```

## ov02

### ov02:00FD CodeWheelChallenge (conf M)

Original `ov02_00FD`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -141:2, -12B:2, -52:2, -51:2, -50:2, -4F:2, -4D:2, -44:2, -41:2, -3A:2, -2C:2, -2B:1, -2A:1, -29:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; uVar3: Word; uVar4: Word; uVar5: Word; iVar6: SmallInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar7: Word; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; uVar9: Byte; extraout_AH_06: Byte; extraout_AH_07: Byte; extraout_AH_08: Byte; extraout_AH_09: Byte; iVar10: SmallInt; unaff_SS: Word; bVar11: Boolean; puVar12: ^Byte; puVar13: ^Byte; local_143: array[0..22-1] of Byte; local_12d: array[0..217-1] of Byte; local_54: Byte; local_53: Byte; local_52: Byte; local_51: array[0..2-1] of Byte; local_4f: array[0..9-1] of Byte; local_46: array[0..3-1] of Byte; local_43: array[0..7-1] of Byte; local_3c: array[0..14-1] of Byte; local_2e: Byte; local_2d: ShortInt; local_2c: Byte; local_2b: array[0..41-1] of Byte; bVar8: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.RandomWord, System.@StrCopy, FUN_03f1_02e8, FUN_0709_0626, FUN_0709_01df, System.@StrAppend, FUN_0899_0104, FUN_0709_09e3, System.@StrAssign, System.@StrCompare, FUN_0709_0d68, FUN_0899_0000.

Three randomized attempts; 21-byte challenge records at DS:0002. Outer glyphs +9/+10, inner +11/+12 (FF absent), path +13; expected string +0. CompareStr FLAGS need verification in expanded body; a correct input exits, third incorrect input terminates. Evidence: decode/listings/ov02.lst at 2A00:00FD, paired .c.

```pascal
procedure ov02_00FD();
begin
  local_2d := $1; { 2A00:0104 }
  while true do begin { 2A00:0104; region anchor, exact origin unknown }
    uVar1 := Random($D); { 2A00:0111 }
    local_2c := Byte(uVar1); { 2A00:0116 }
    bVar8 := Byte((Word(uVar1) shr 8)); { 2A00:0116; region anchor, exact origin unknown }
    uVar2 := MakeWord(bVar8, 1); { 2A00:0116; region anchor, exact origin unknown }
    uVar3 := MakeWord(bVar8, 1); { 2A00:0116; region anchor, exact origin unknown }
    uVar4 := MakeWord(bVar8, $26); { 2A00:0116; region anchor, exact origin unknown }
    uVar5 := MakeWord(bVar8, $16); { 2A00:0116; region anchor, exact origin unknown }
    iVar10 := (Word(bVar8) shl 8); { 2A00:0116; region anchor, exact origin unknown }
    iVar6 := (Word(bVar8) shl 8); { 2A00:0116; region anchor, exact origin unknown }
    puVar12 := @local_2e; { 2A00:0116; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:0116; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2C))) := ''; { 2A00:0135 }
    FUN_03f1_02e8(puVar12, uVar1, iVar6, iVar10, uVar5, uVar4, uVar3, uVar2); { 2A00:013A }
    uVar2 := MakeWord(UNK_extraout_AH, 1); { 2A00:013A; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH, 1); { 2A00:013A; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH, 10); { 2A00:013A; region anchor, exact origin unknown }
    puVar12 := @local_53; { 2A00:013A; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:013A; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$51))) := 'USE THE TRANSLATION WHEEL TO DECIPHER'; { 2A00:0152 }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:0157 }
    uVar2 := MakeWord(UNK_extraout_AH_00, 1); { 2A00:0157; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_00, 2); { 2A00:0157; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_00, 10); { 2A00:0157; region anchor, exact origin unknown }
    puVar12 := local_3c; { 2A00:0157; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:0157; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3A))) := 'THE CODE WORD.'; { 2A00:016F }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:0174 }
    uVar2 := MakeWord(UNK_extraout_AH_01, 1); { 2A00:0174; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_01, 5); { 2A00:0174; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_01, 10); { 2A00:0174; region anchor, exact origin unknown }
    puVar12 := local_51; { 2A00:0174; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:0174; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$4F))) := 'MATCH THE ESPRUAR RUNE (OUTER RING)'; { 2A00:018C }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:0191 }
    uVar7 := ((Ptr<Byte>(((Word(local_2c) * $15) + 9)))^ + $40); { 2A00:0191; region anchor, exact origin unknown }
    FUN_0709_01df((uVar7 and $FF00), uVar7, MakeWord(UNK_extraout_AH_02, 1), MakeWord(UNK_extraout_AH_02, $C), MakeWord(UNK_extraout_AH_02, 6), MakeWord(UNK_extraout_AH_02, 8)); { 2A00:01BB }
    uVar7 := ((Ptr<Byte>(((Word(local_2c) * $15) + 10)))^ + $40); { 2A00:01BB; region anchor, exact origin unknown }
    FUN_0709_01df((uVar7 and $FF00), uVar7, MakeWord(UNK_extraout_AH_03, 1), MakeWord(UNK_extraout_AH_03, $C), MakeWord(UNK_extraout_AH_03, 6), MakeWord(UNK_extraout_AH_03, 9)); { 2A00:01E5 }
    uVar2 := MakeWord(UNK_extraout_AH_04, 1); { 2A00:01E5; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_04, 8); { 2A00:01E5; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_04, 10); { 2A00:01E5; region anchor, exact origin unknown }
    puVar12 := local_4f; { 2A00:01E5; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:01E5; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$4D))) := 'WITH THE DETHEK RUNE (INNER RING)'; { 2A00:01FD }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:0202 }
    uVar7 := ((Ptr<Byte>(((Word(local_2c) * $15) + $B)))^ + $40); { 2A00:0202; region anchor, exact origin unknown }
    FUN_0709_01df((uVar7 and $FF00), uVar7, MakeWord(UNK_extraout_AH_05, 1), MakeWord(UNK_extraout_AH_05, $C), MakeWord(UNK_extraout_AH_05, 9), MakeWord(UNK_extraout_AH_05, 8)); { 2A00:022C }
    if ((Ptr<ShortInt>(((Word(local_2c) * $15) + $C)))^ <> (-1)) then begin { 2A00:022C; region anchor, exact origin unknown }
      uVar9 := Byte(((Word(local_2c) * $15) shr 8)); { 2A00:022C; region anchor, exact origin unknown }
      uVar7 := ((Ptr<Byte>(((Word(local_2c) * $15) + $C)))^ + $40); { 2A00:022C; region anchor, exact origin unknown }
      FUN_0709_01df((uVar7 and $FF00), uVar7, MakeWord(uVar9, 1), MakeWord(uVar9, $C), MakeWord(uVar9, 9), MakeWord(uVar9, 9)); { 2A00:0269 }
    end; { 2A00:0269; region anchor, exact origin unknown }
    uVar2 := 1; { 2A00:0269; region anchor, exact origin unknown }
    uVar3 := $B; { 2A00:0269; region anchor, exact origin unknown }
    uVar4 := 10; { 2A00:0269; region anchor, exact origin unknown }
    puVar12 := @local_54; { 2A00:0269; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:0269; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$52))) := 'AND READ THE CODE WORD UNDER THE PATH:'; { 2A00:0281 }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:0286 }
    uVar2 := MakeWord(UNK_extraout_AH_06, 1); { 2A00:0286; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_06, $D); { 2A00:0286; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_06, $C); { 2A00:0286; region anchor, exact origin unknown }
    puVar12 := local_12d; { 2A00:0286; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:0286; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$12B))) := '     '; { 2A00:029F }
    PString(FarPtr(SS, BPAddr(-$12B))) := PString(FarPtr(SS, BPAddr(-$12B))) + PString(FarPtr($C7C, ((Word(local_2c) * $15) + $D))); { 2A00:02B6 }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:02BB }
    uVar2 := MakeWord(UNK_extraout_AH_07, 1); { 2A00:02BB; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_07, $E); { 2A00:02BB; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_07, 10); { 2A00:02BB; region anchor, exact origin unknown }
    puVar12 := @local_52; { 2A00:02BB; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:02BB; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$50))) := 'READ FROM THE INSIDE TO THE OUTSIDE.'; { 2A00:02D3 }
    FUN_0709_0626(puVar12, uVar1, uVar4, uVar3, uVar2); { 2A00:02D8 }
    FUN_0899_0104(); { 2A00:02DD }
    puVar13 := local_143; { 2A00:02DD; region anchor, exact origin unknown }
    puVar12 := local_43; { 2A00:02DD; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:02DD; region anchor, exact origin unknown }
    uVar2 := UNK_unaff_SS; { 2A00:02DD; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$41))) := 'INPUT THE CODE WORD: '; { 2A00:02F2 }
    FUN_0709_09e3(MakeWord(UNK_extraout_AH_08, 6), MakeWord(UNK_extraout_AH_08, $D), puVar12, uVar1); { 2A00:02FD }
    PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$141))), 1, $28); { 2A00:030B }
    iVar10 := ((Word(local_2c) * $15) + 2); { 2A00:030B; region anchor, exact origin unknown }
    WheelEqual := CompareStrEqual(PString(FarPtr(UNK_unaff_SS, local_2b)), PString(FarPtr($C7C, iVar10))); { 2A00:0327 }
    if WheelEqual then begin { 2A00:032C }
      Break; { 2A00:0327; region anchor, exact origin unknown }
    end; { 2A00:0327; region anchor, exact origin unknown }
    puVar12 := local_46; { 2A00:0327; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 2A00:0327; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$44))) := 'Sorry, that''s incorrect.'; { 2A00:033A }
    FUN_0709_0d68(MakeWord(UNK_extraout_AH_09, $E), puVar12, uVar1); { 2A00:0342 }
    if (local_2d = $3) then begin { 2A00:0342; region anchor, exact origin unknown }
      FUN_0899_0000(); { 2A00:0350 }
      Exit; { 2A00:0358 }
    end; { 2A00:0350; region anchor, exact origin unknown }
    local_2d := (local_2d + $1); { 2A00:010A }
  end; { 2A00:010A; region anchor, exact origin unknown }
  Exit; { 2A00:0358 }
end;
```

### ov02:0359 ov02_init (conf L)

Original `ov02_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov02.lst at 2A00:0359, paired .c.

```pascal
procedure ov02_init();
begin
  Exit; { 2A00:035D }
end;
```

## ov06

### ov06:0030 ShowShopItems (conf M)

Original `FUN_3e00_0030`. Params (ABI order): param_1: LongWord; param_2: ^Word; param_3: ^Word; param_4: ^Byte.
BP access inventory (hex offset:byte widths): -47:2, -43:2, -40:2, -3C:1, -3B:1/2, -3A:1, -39:1, -38:1/2, -19:1/2, -8:2, -6:2, -4:2, -2:2, +6:2, +A:2, +E:2, +12:2.
Locals/SSA temporaries: pbVar1: ^Byte; uVar2: Byte; extraout_AH: Byte; pbVar3: ^Byte; uVar4: Word; uVar5: Word; uVar6: Word; unaff_SS: Word; puVar7: ^Byte; uVar8: Word; uVar9: Word; puVar10: ^Byte; uVar11: Word; uVar12: Word; uVar13: Word; local_49: array[0..4-1] of Byte; local_45: array[0..3-1] of Byte; local_42: array[0..4-1] of Byte; local_3e: Byte; local_3d: Byte; local_3c: Byte; local_3b: Byte; local_3a: array[0..30-1] of Byte; abStack_1c: array[0..18-1] of Byte; local_a: LongWord; local_6: ^Byte; local_4: SmallInt.
Callers: FUN_3e00_0361.
Callees (listing): System.@StrAssign, System.@StrLong, System.@StrCopy, FUN_03f1_02e8, stub_ov25_e4, FUN_00ba_0442.

Shop, Items:, Buy; prices appended temporarily to item names. Evidence: decode/listings/ov06.lst at 3E00:0030, paired .c.

```pascal
procedure FUN_3e00_0030(param_1: LongWord; param_2: ^Word; param_3: ^Word; param_4: ^Byte);
begin
  uVar4 := $3E00; { 3E00:0030; region anchor, exact origin unknown }
  local_3d := 1; { 3E00:0036 }
  local_a := Ptr<Byte>(MakeLong(g_6812, g_6810)); { 3E00:0041 }
  while ((Ptr<Byte>(local_a) <> Ptr<Byte>($0)) or else (ExtractBytes(local_a, 2, 2) <> 0)) do begin { 3E00:0041; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$38))) := Copy('                              ', 1, $1E); { 3E00:0060 }
    uVar4 := Word((LongWord(local_a) shr $10)); { 3E00:0060; region anchor, exact origin unknown }
    pbVar3 := Ptr<Byte>(local_a); { 3E00:0060; region anchor, exact origin unknown }
    if ((Ptr<SmallInt>((pbVar3 + $3A)))^ = 0) then begin { 3E00:0060; region anchor, exact origin unknown }
      (pbVar3 + $3A)[0] := 1; { 3E00:0060; region anchor, exact origin unknown }
      (pbVar3 + $3A)[1] := 0; { 3E00:0060; region anchor, exact origin unknown }
    end; { 3E00:0060; region anchor, exact origin unknown }
    Str(LongInt(MakeLong(0, MemWord(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8)) + $3A)))), PString(FarPtr(SS, BPAddr(-$19)))); { 3E00:008F }
    if (abStack_1c[1] <> 0) then begin { 3E00:008F; region anchor, exact origin unknown }
      local_3c := 1; { 3E00:00A7 }
      while Seq(abStack_1c[(Word(local_3c) - Word(abStack_1c[1]))] := abStack_1c[(local_3c + 1)], (local_3c <> abStack_1c[1])) do begin { 3E00:00A7; region anchor, exact origin unknown }
        local_3c := (local_3c + 1); { 3E00:00AC }
      end; { 3E00:00AC; region anchor, exact origin unknown }
    end; { 3E00:00AC; region anchor, exact origin unknown }
    local_3e := (local_a)^; { 3E00:009D }
    if (local_3e <> 0) then begin { 3E00:009D; region anchor, exact origin unknown }
      local_3c := 1; { 3E00:00F1 }
      while Seq(local_3a[local_3c] := Ptr<Byte>(local_a)[local_3c], (local_3c <> local_3e)) do begin { 3E00:00F1; region anchor, exact origin unknown }
        local_3c := (local_3c + 1); { 3E00:00F6 }
      end; { 3E00:00F6; region anchor, exact origin unknown }
    end; { 3E00:00F6; region anchor, exact origin unknown }
    uVar4 := $AF8; { 3E00:00F6; region anchor, exact origin unknown }
    local_3b := local_3e; { 3E00:00E1 }
    PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8)))) := Copy(PString(FarPtr(SS, BPAddr(-$38))), 1, $28); { 3E00:0126 }
    (local_a)^ := $1E; { 3E00:0126; region anchor, exact origin unknown }
    uVar5 := Word((LongWord(local_a) shr $10)); { 3E00:0126; region anchor, exact origin unknown }
    local_a := Ptr<Byte>(MakeLong((Ptr<Word>((Ptr<Byte>(local_a) + $2C)))^, (Ptr<^Byte>((Ptr<Byte>(local_a) + $2A)))^)); { 3E00:013D }
  end; { 3E00:013D; region anchor, exact origin unknown }
  uVar13 := 1; { 3E00:013D; region anchor, exact origin unknown }
  uVar12 := 1; { 3E00:013D; region anchor, exact origin unknown }
  uVar11 := $26; { 3E00:013D; region anchor, exact origin unknown }
  uVar9 := $16; { 3E00:013D; region anchor, exact origin unknown }
  uVar6 := 0; { 3E00:013D; region anchor, exact origin unknown }
  uVar8 := $F; { 3E00:013D; region anchor, exact origin unknown }
  puVar7 := local_42; { 3E00:013D; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 3E00:013D; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$40))) := 'Shop'; { 3E00:0162 }
  FUN_03f1_02e8(puVar7, uVar5, uVar8, uVar6, uVar9, uVar11, uVar12, uVar13); { 3E00:0167 }
  local_6 := g_6810; { 3E00:0173 }
  local_4 := g_6812; { 3E00:0176 }
  puVar7 := local_45; { 3E00:0176; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 3E00:0176; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$43))) := 'Items: '; { 3E00:0183 }
  puVar10 := local_49; { 3E00:0183; region anchor, exact origin unknown }
  uVar4 := UNK_unaff_SS; { 3E00:0183; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$47))) := 'Buy'; { 3E00:0192 }
  uVar6 := Word((LongWord(param_2) shr $10)); { 3E00:0192; region anchor, exact origin unknown }
  uVar2 := stub_ov25_e4(Ptr<Word>(param_2), uVar6, SmallInt(param_1), SmallInt((LongWord(param_1) shr $10)), @local_3d, UNK_unaff_SS, MakeWord(UNK_extraout_AH, 1), local_6, local_4, MakeWord(UNK_extraout_AH, $16), MakeWord(UNK_extraout_AH, $26), MakeWord(UNK_extraout_AH, 4), MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), puVar10, uVar4, puVar7, uVar5); { 3E00:01C4 }
  (param_4)^ := uVar2; { 3E00:01C4; region anchor, exact origin unknown }
  uVar4 := Ptr<Word>(param_2)[1]; { 3E00:01C4; region anchor, exact origin unknown }
  (param_3)^ := (param_2)^; { 3E00:01C4; region anchor, exact origin unknown }
  Ptr<Word>(param_3)[1] := uVar4; { 3E00:01C4; region anchor, exact origin unknown }
  ExtractBytes(local_a, 2, 2) := g_6812; { 3E00:01C4; region anchor, exact origin unknown }
  ExtractBytes(local_a, 0, 2) := g_6810; { 3E00:01C4; region anchor, exact origin unknown }
  while ((Ptr<Byte>(local_a) <> Ptr<Byte>($0)) or else (ExtractBytes(local_a, 2, 2) <> 0)) do begin { 3E00:01C4; region anchor, exact origin unknown }
    FUN_00ba_0442(0, 0, 0, 0, Ptr<Byte>(local_a), ExtractBytes(local_a, 2, 2), 0, 0); { 3E00:0210 }
    pbVar1 := (Ptr<Byte>(local_a) + $2A); { 3E00:0210; region anchor, exact origin unknown }
    ExtractBytes(local_a, 2, 2) := (Ptr<SmallInt>((Ptr<Byte>(local_a) + $2C)))^; { 3E00:0210; region anchor, exact origin unknown }
    ExtractBytes(local_a, 0, 2) := (Ptr<^Byte>(pbVar1))^; { 3E00:0210; region anchor, exact origin unknown }
  end; { 3E00:0210; region anchor, exact origin unknown }
  Exit; { 3E00:022B }
end;
```

### ov06:0239 TransferPurchasedItem (conf M)

Original `ov06_0239`. Params (ABI order): param_1: ^Byte; param_2: LongWord.
BP access inventory (hex offset:byte widths): -13:2, -8:2, -6:2, -4:2, -2:2, +6:2, +A:2, +C:2.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; iVar3: SmallInt; uVar4: Word; unaff_SS: Word; puVar5: ^Byte; local_15: array[0..11-1] of Byte; local_a: LongWord; local_6: LongWord.
Callers: FUN_3e00_0361.
Callees (listing): stub_ov19_e9, System.@StrCopy, FUN_00ba_1693, System.GetMem, System.@CopyBytes, FUN_00ba_0bb8.

Copies 63-byte item and relinks inventory only if capacity allows; otherwise OverLoaded. Evidence: decode/listings/ov06.lst at 3E00:0239, paired .c.

```pascal
procedure ov06_0239(param_1: ^Byte; param_2: LongWord);
begin
  cVar2 := stub_ov19_e9(Word(param_2), ExtractBytes(param_2, 2, 2), g_5D92, g_5D94); { 3E00:024D }
  if (cVar2 = $0) then begin { 3E00:024D; region anchor, exact origin unknown }
    (param_1)^ := 0; { 3E00:024D; region anchor, exact origin unknown }
    uVar4 := Word((LongWord(g_5D92) shr $10)); { 3E00:024D; region anchor, exact origin unknown }
    ExtractBytes(local_6, 0, 2) := (Ptr<SmallInt>((SmallInt(g_5D92) + 200)))^; { 3E00:024D; region anchor, exact origin unknown }
    ExtractBytes(local_6, 2, 2) := (Ptr<SmallInt>((SmallInt(g_5D92) + $CA)))^; { 3E00:024D; region anchor, exact origin unknown }
    if ((SmallInt(local_6) = 0) and then (ExtractBytes(local_6, 2, 2) = 0)) then begin { 3E00:024D; region anchor, exact origin unknown }
      local_6 := GetMem($3F); { 3E00:029B }
      CopyBytes($3F, local_6, Word(param_2), ExtractBytes(param_2, 2, 2)); { 3E00:02B4 }
      (Ptr<Word>((SmallInt(local_6) + $2A)))^ := 0; { 3E00:02B4; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(local_6) + $2C)))^ := 0; { 3E00:02B4; region anchor, exact origin unknown }
      uVar4 := Word((LongWord(g_5D92) shr $10)); { 3E00:02B4; region anchor, exact origin unknown }
      iVar3 := SmallInt(g_5D92); { 3E00:02B4; region anchor, exact origin unknown }
      (Ptr<SmallInt>((iVar3 + 200)))^ := SmallInt(local_6); { 3E00:02B4; region anchor, exact origin unknown }
      (Ptr<Word>((iVar3 + $CA)))^ := ExtractBytes(local_6, 2, 2); { 3E00:02B4; region anchor, exact origin unknown }
    end else begin { 3E00:02B4; region anchor, exact origin unknown }
      while (((Ptr<SmallInt>((SmallInt(local_6) + $2A)))^ <> 0) or else ((Ptr<SmallInt>((SmallInt(local_6) + $2C)))^ <> 0)) do begin { 3E00:02B4; region anchor, exact origin unknown }
        piVar1 := Ptr<SmallInt>((SmallInt(local_6) + $2A)); { 3E00:02B4; region anchor, exact origin unknown }
        ExtractBytes(local_6, 2, 2) := (Ptr<SmallInt>((SmallInt(local_6) + $2C)))^; { 3E00:02B4; region anchor, exact origin unknown }
        ExtractBytes(local_6, 0, 2) := (piVar1)^; { 3E00:02B4; region anchor, exact origin unknown }
      end; { 3E00:02B4; region anchor, exact origin unknown }
      local_a := GetMem($3F); { 3E00:0300 }
      CopyBytes($3F, local_a, Word(param_2), ExtractBytes(param_2, 2, 2)); { 3E00:0319 }
      uVar4 := Word((LongWord(local_a) shr $10)); { 3E00:0319; region anchor, exact origin unknown }
      iVar3 := SmallInt(local_a); { 3E00:0319; region anchor, exact origin unknown }
      (Ptr<Word>((iVar3 + $2A)))^ := 0; { 3E00:0319; region anchor, exact origin unknown }
      (Ptr<Word>((iVar3 + $2C)))^ := 0; { 3E00:0319; region anchor, exact origin unknown }
      (Ptr<SmallInt>((SmallInt(local_6) + $2A)))^ := iVar3; { 3E00:0319; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(local_6) + $2C)))^ := uVar4; { 3E00:0319; region anchor, exact origin unknown }
    end; { 3E00:0319; region anchor, exact origin unknown }
    FUN_00ba_0bb8(g_5D92, g_5D94); { 3E00:0344 }
  end else begin { 3E00:0344; region anchor, exact origin unknown }
    puVar5 := local_15; { 3E00:0344; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$13))) := 'OverLoaded'; { 3E00:0260 }
    FUN_00ba_1693(puVar5, UNK_unaff_SS); { 3E00:0265 }
    (param_1)^ := 1; { 3E00:0265; region anchor, exact origin unknown }
  end; { 3E00:0265; region anchor, exact origin unknown }
  Exit; { 3E00:034C }
end;
```

### ov06:0361 BuyItems (conf M)

Original `FUN_3e00_0361`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -27:2, -15:2, -13:2, -11:2, -F:1/2, -E:2, -C:2, -A:2, -8:2, -6:1, -5:1/2, -4:2, -2:2.
Locals/SSA temporaries: unaff_SS: Word; bVar1: Boolean; uVar2: LongWord; puVar3: ^Byte; uVar4: Word; local_29: array[0..18-1] of Byte; local_17: Word; local_15: Word; local_13: Word; local_11: ShortInt; local_10: LongWord; local_c: Word; local_a: Word; local_8: ShortInt; local_7: ShortInt; local_6: LongWord.
Callers: ov06_053E.
Callees (listing): FUN_3e00_0030, stub_ov19_e11, ov06_0239, stub_ov21_e10, stub_ov21_e12, stub_ov21_e11, System.@StrCopy, FUN_00ba_1693.

Buy/Return selection; selected character money or pooled money pays only after successful transfer. Evidence: decode/listings/ov06.lst at 3E00:0361, paired .c.

```pascal
procedure FUN_3e00_0361();
begin
  local_6 := 0; { 3E00:0369 }
  local_15 := g_6810; { 3E00:0376 }
  local_13 := g_6812; { 3E00:0379 }
  local_17 := 1; { 3E00:037C }
  repeat { 3E00:037C; region anchor, exact origin unknown }
    FUN_3e00_0030(@local_17, UNK_unaff_SS, @local_15, UNK_unaff_SS, @local_6, UNK_unaff_SS, @local_7, UNK_unaff_SS); { 3E00:0396 }
    if ((local_7 = $42) or else (local_7 = $D)) then begin { 3E00:0396; region anchor, exact origin unknown }
      local_8 := $0; { 3E00:03A5 }
      local_a := (Ptr<Word>((SmallInt(local_6) + $3A)))^; { 3E00:03B7 }
      local_c := stub_ov19_e11(g_5D92, g_5D94); { 3E00:03C2 }
      if (local_c < local_a) then begin { 3E00:03C2; region anchor, exact origin unknown }
        uVar2 := stub_ov21_e12(Ptr<Word>(@g_67F4), $C7C); { 3E00:03FF }
        local_10 := uVar2; { 3E00:0404 }
        if ((LongInt(uVar2) < $10000) and then (($7FFFFFFF < uVar2) or else (Word(uVar2) < local_a))) then begin { 3E00:0404; region anchor, exact origin unknown }
          puVar3 := local_29; { 3E00:0404; region anchor, exact origin unknown }
          uVar4 := UNK_unaff_SS; { 3E00:0404; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$27))) := 'Not enough Money.'; { 3E00:045D }
          FUN_00ba_1693(puVar3, uVar4); { 3E00:0462 }
        end else begin { 3E00:0462; region anchor, exact origin unknown }
          ov06_0239(@local_11, UNK_unaff_SS, Word(local_6), ExtractBytes(local_6, 2, 2)); { 3E00:03DE }
          if (local_11 = $0) then begin { 3E00:03DE; region anchor, exact origin unknown }
            bVar1 := (Word(local_10) < local_a); { 3E00:03DE; region anchor, exact origin unknown }
            ExtractBytes(local_10, 0, 2) := (Word(local_10) - local_a); { 3E00:03DE; region anchor, exact origin unknown }
            ExtractBytes(local_10, 2, 2) := (ExtractBytes(local_10, 2, 2) - Word(bVar1)); { 3E00:03DE; region anchor, exact origin unknown }
            stub_ov21_e11(Word(local_10)); { 3E00:044C }
          end; { 3E00:044C; region anchor, exact origin unknown }
        end; { 3E00:044C; region anchor, exact origin unknown }
      end else begin { 3E00:044C; region anchor, exact origin unknown }
        ov06_0239(@local_11, UNK_unaff_SS, Word(local_6), ExtractBytes(local_6, 2, 2)); { 3E00:0427 }
        if (local_11 = $0) then begin { 3E00:0427; region anchor, exact origin unknown }
          local_c := (local_c - local_a); { 3E00:03ED }
          stub_ov21_e10(local_c); { 3E00:03F3 }
        end; { 3E00:03F3; region anchor, exact origin unknown }
      end; { 3E00:03F3; region anchor, exact origin unknown }
    end else begin { 3E00:03F3; region anchor, exact origin unknown }
      local_8 := $1; { 3E00:03AC }
    end; { 3E00:03AC; region anchor, exact origin unknown }
  until not ((local_8 = $0)); { 3E00:03AC; region anchor, exact origin unknown }
  Exit; { 3E00:0473 }
end;
```

### ov06:053E ShopMenu (conf M)

Original `ov06_053E`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -89:2, -61:2, -36:2, -34:2, -32:1/2, -31:1, -30:2, -2F:1/2, -2E:1, -2D:1, -2C:1/2, -2B:1/2, -29:2.
Locals/SSA temporaries: piVar1: ^SmallInt; extraout_AH: Byte; extraout_AH_00: Byte; bVar10: Byte; uVar2: Word; extraout_AH_01: Byte; uVar3: Word; uVar4: Word; uVar5: Word; uVar6: Word; uVar7: Word; uVar8: Word; extraout_AH_02: Byte; iVar9: SmallInt; extraout_AH_03: Byte; unaff_SS: Word; puVar11: ^Byte; local_8b: array[0..40-1] of Byte; local_63: array[0..43-1] of Byte; local_38: SmallInt; iStack_36: SmallInt; local_34: ShortInt; local_33: ShortInt; local_32: Byte; local_31: ShortInt; local_30: ShortInt; local_2f: ShortInt; local_2e: array[0..3-1] of ShortInt; local_2b: array[0..41-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_00ba_27d9, FUN_00ba_0767, System.FillChar, FUN_00ba_0442, stub_ov21_e9, System.@StrAssign, stub_ov25_e2, FUN_3e00_0361, stub_ov19_e5, stub_ov21_e4, stub_ov21_e2, stub_ov21_e3, stub_ov21_e14, System.@StrCopy, FUN_0709_0768, stub_ov07_e13, FUN_0709_0dd3, stub_ov19_e10.

Buy View Take Pool Share Appraise Exit; choices depend on pool state. Evidence: decode/listings/ov06.lst at 3E00:053E, paired .c.

```pascal
procedure ov06_053E();
begin
  g_49F3 := 1; { 3E00:0545 }
  FUN_00ba_27d9(); { 3E00:054A }
  FUN_00ba_0767(g_5D92, g_5D94); { 3E00:0557 }
  FillChar(FarPtr($0C7C, $67F4), $1C, LoByte(MakeWord(HiByte($1C), $0))); { 3E00:0568 }
  local_2e[1] := 0; { 3E00:0568; region anchor, exact origin unknown }
  g_6DC0 := 0; { 3E00:0571 }
  local_2f := $0; { 3E00:0576 }
  iStack_36 := g_6812; { 3E00:0576; region anchor, exact origin unknown }
  local_38 := g_6810; { 3E00:0581 }
  while ((local_38 <> 0) or else (iStack_36 <> 0)) do begin { 3E00:0581; region anchor, exact origin unknown }
    FUN_00ba_0442(0, 0, 0, 0, local_38, iStack_36, 0, 0); { 3E00:05A7 }
    piVar1 := Ptr<SmallInt>((local_38 + $2A)); { 3E00:05A7; region anchor, exact origin unknown }
    iStack_36 := (Ptr<SmallInt>((local_38 + $2C)))^; { 3E00:05A7; region anchor, exact origin unknown }
    local_38 := (piVar1)^; { 3E00:05B7 }
  end; { 3E00:05B7; region anchor, exact origin unknown }
  repeat { 3E00:05B7; region anchor, exact origin unknown }
    stub_ov21_e9(@local_32, UNK_unaff_SS, @local_31, UNK_unaff_SS); { 3E00:05C9 }
    if (local_31 = $0) then begin { 3E00:05C9; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$29))) := Copy('Buy View Take Pool Share Appraise Exit', 1, $28); { 3E00:05E2 }
      bVar10 := UNK_extraout_AH_00; { 3E00:05E2; region anchor, exact origin unknown }
    end else begin { 3E00:05E2; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$29))) := Copy('Buy View Pool Appraise Exit', 1, $28); { 3E00:05F7 }
      bVar10 := UNK_extraout_AH; { 3E00:05F7; region anchor, exact origin unknown }
    end; { 3E00:05F7; region anchor, exact origin unknown }
    uVar2 := stub_ov25_e2(local_2e, UNK_unaff_SS, (Word(bVar10) shl 8), MakeWord(bVar10, 1), MakeWord(bVar10, $F), MakeWord(bVar10, 10), MakeWord(bVar10, $D), local_2b, UNK_unaff_SS, (local_2e + 1), UNK_unaff_SS); { 3E00:061A }
    local_30 := ShortInt(uVar2); { 3E00:061F }
    if (local_30 = $42) then begin { 3E00:061F; region anchor, exact origin unknown }
      FUN_3e00_0361(); { 3E00:062A }
    end else begin { 3E00:062A; region anchor, exact origin unknown }
      if (local_30 = $56) then begin { 3E00:062A; region anchor, exact origin unknown }
        stub_ov19_e5(local_2e, UNK_unaff_SS); { 3E00:0639 }
      end else begin { 3E00:0639; region anchor, exact origin unknown }
        if (local_30 = $54) then begin { 3E00:0639; region anchor, exact origin unknown }
          stub_ov21_e4(); { 3E00:0645 }
        end else begin { 3E00:0645; region anchor, exact origin unknown }
          if (local_30 = $50) then begin { 3E00:0645; region anchor, exact origin unknown }
            if (local_2e[0] = $0) then begin { 3E00:0645; region anchor, exact origin unknown }
              stub_ov21_e2(); { 3E00:0657 }
            end; { 3E00:0657; region anchor, exact origin unknown }
          end else begin { 3E00:0657; region anchor, exact origin unknown }
            if (local_30 = $53) then begin { 3E00:0657; region anchor, exact origin unknown }
              stub_ov21_e3(); { 3E00:0663 }
            end else begin { 3E00:0663; region anchor, exact origin unknown }
              if (local_30 = $41) then begin { 3E00:0663; region anchor, exact origin unknown }
                stub_ov21_e14(@local_34, UNK_unaff_SS); { 3E00:0674 }
              end else begin { 3E00:0674; region anchor, exact origin unknown }
                if (local_30 = $45) then begin { 3E00:0674; region anchor, exact origin unknown }
                  stub_ov21_e9(@local_32, UNK_unaff_SS, @local_31, UNK_unaff_SS); { 3E00:068D }
                  if (local_31 = $0) then begin { 3E00:068D; region anchor, exact origin unknown }
                    local_2f := $1; { 3E00:0722 }
                  end else begin { 3E00:0722; region anchor, exact origin unknown }
                    PString(FarPtr(SS, BPAddr(-$29))) := Copy('~Yes ~No', 1, $28); { 3E00:06A9 }
                    uVar3 := MakeWord(UNK_extraout_AH_01, 1); { 3E00:06A9; region anchor, exact origin unknown }
                    uVar4 := MakeWord(UNK_extraout_AH_01, $11); { 3E00:06A9; region anchor, exact origin unknown }
                    uVar5 := MakeWord(UNK_extraout_AH_01, $26); { 3E00:06A9; region anchor, exact origin unknown }
                    uVar6 := MakeWord(UNK_extraout_AH_01, $16); { 3E00:06A9; region anchor, exact origin unknown }
                    uVar7 := MakeWord(UNK_extraout_AH_01, 10); { 3E00:06A9; region anchor, exact origin unknown }
                    uVar8 := MakeWord(UNK_extraout_AH_01, 1); { 3E00:06A9; region anchor, exact origin unknown }
                    puVar11 := local_8b; { 3E00:06A9; region anchor, exact origin unknown }
                    uVar2 := UNK_unaff_SS; { 3E00:06A9; region anchor, exact origin unknown }
                    PString(FarPtr(SS, BPAddr(-$89))) := 'As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."  '; { 3E00:06CB }
                    FUN_0709_0768(puVar11, uVar2, uVar8, uVar7, uVar6, uVar5, uVar4, uVar3); { 3E00:06D0 }
                    uVar3 := MakeWord(UNK_extraout_AH_02, 1); { 3E00:06D0; region anchor, exact origin unknown }
                    uVar4 := MakeWord(UNK_extraout_AH_02, $11); { 3E00:06D0; region anchor, exact origin unknown }
                    uVar5 := MakeWord(UNK_extraout_AH_02, $26); { 3E00:06D0; region anchor, exact origin unknown }
                    uVar6 := MakeWord(UNK_extraout_AH_02, $16); { 3E00:06D0; region anchor, exact origin unknown }
                    uVar7 := MakeWord(UNK_extraout_AH_02, $F); { 3E00:06D0; region anchor, exact origin unknown }
                    iVar9 := (Word(UNK_extraout_AH_02) shl 8); { 3E00:06D0; region anchor, exact origin unknown }
                    puVar11 := local_63; { 3E00:06D0; region anchor, exact origin unknown }
                    uVar2 := UNK_unaff_SS; { 3E00:06D0; region anchor, exact origin unknown }
                    PString(FarPtr(SS, BPAddr(-$61))) := 'Do you want to go back and get your Money?'; { 3E00:06F1 }
                    FUN_0709_0768(puVar11, uVar2, iVar9, uVar7, uVar6, uVar5, uVar4, uVar3); { 3E00:06F6 }
                    local_33 := stub_ov07_e13((Word(UNK_extraout_AH_03) shl 8), (Word(UNK_extraout_AH_03) shl 8), MakeWord(UNK_extraout_AH_03, $F), MakeWord(UNK_extraout_AH_03, 10), MakeWord(UNK_extraout_AH_03, $D), local_2b, UNK_unaff_SS, (local_2e + 1), UNK_unaff_SS); { 3E00:0714 }
                    if (local_33 = $1) then begin { 3E00:0714; region anchor, exact origin unknown }
                      local_2f := $1; { 3E00:073B }
                    end else begin { 3E00:073B; region anchor, exact origin unknown }
                      FUN_0709_0dd3($16, $26, $11, 1); { 3E00:0734 }
                    end; { 3E00:0734; region anchor, exact origin unknown }
                  end; { 3E00:0734; region anchor, exact origin unknown }
                end else begin { 3E00:0734; region anchor, exact origin unknown }
                  if (local_30 = $47) then begin { 3E00:0734; region anchor, exact origin unknown }
                    stub_ov19_e10(uVar2); { 3E00:0749 }
                  end else begin { 3E00:0749; region anchor, exact origin unknown }
                    if (local_30 = $4F) then begin { 3E00:0749; region anchor, exact origin unknown }
                      stub_ov19_e10(uVar2); { 3E00:0758 }
                    end; { 3E00:0758; region anchor, exact origin unknown }
                  end; { 3E00:0758; region anchor, exact origin unknown }
                end; { 3E00:0758; region anchor, exact origin unknown }
              end; { 3E00:0758; region anchor, exact origin unknown }
            end; { 3E00:0758; region anchor, exact origin unknown }
          end; { 3E00:0758; region anchor, exact origin unknown }
        end; { 3E00:0758; region anchor, exact origin unknown }
      end; { 3E00:0758; region anchor, exact origin unknown }
    end; { 3E00:0758; region anchor, exact origin unknown }
    if ((local_30 = $42) or else (local_30 = $54)) then begin { 3E00:0758; region anchor, exact origin unknown }
      FUN_00ba_27d9(); { 3E00:0768 }
    end else begin { 3E00:0768; region anchor, exact origin unknown }
      if ((local_30 = $41) and then (local_34 <> $0)) then begin { 3E00:0768; region anchor, exact origin unknown }
        FUN_00ba_27d9(); { 3E00:0779 }
      end; { 3E00:0779; region anchor, exact origin unknown }
    end; { 3E00:0779; region anchor, exact origin unknown }
    FUN_00ba_0767(g_5D92, g_5D94); { 3E00:0786 }
  until not ((local_2f = $0)); { 3E00:0786; region anchor, exact origin unknown }
  Exit; { 3E00:0797 }
end;
```

### ov06:0798 ov06_init (conf L)

Original `ov06_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov06.lst at 3E00:0798, paired .c.

```pascal
procedure ov06_init();
begin
  Exit; { 3E00:079C }
end;
```

## ov11

### ov11:002D InitializeGameState (conf M)

Original `ov11_002D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -206:2, -106:2, -16:2, -8:2, -7:2, -6:2.
Locals/SSA temporaries: extraout_AH: Byte; iVar1: SmallInt; uVar2: Word; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; extraout_AH_06: Byte; extraout_AH_07: Byte; uVar3: Word; uVar4: Word; unaff_SS: Word; puVar5: ^Byte; puVar6: ^Byte; uVar7: Word; puVar8: ^Byte; local_208: array[0..256-1] of Byte; local_108: array[0..240-1] of Byte; local_18: array[0..14-1] of Byte; local_a: Byte; local_9: Byte; local_8: array[0..6-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.GetMem, FUN_0464_248e, System.FillChar, FUN_08ae_01a5, System.@StrAssign, FUN_0709_017c, stub_ov25_e3, System.@StrCopy, FUN_0709_0626, stub_ov34_e1, FUN_0464_0111, stub_ov32_e4, System.@CharToStr, System.@StrAppend, FUN_0802_025d, System.ResetFile, System.Seek, System.BlockRead, System.CloseFile, System.Randomize, stub_ov22_e10, stub_ov12_e1.

Allocates ECL regions 800/800/400/1E00 hex bytes; loads fonts, wall glyphs and combat sprites. At 5700:05C3 Seek(2); 05D2 requests $0810=2064 bytes, 05DB BlockRead into g_5582, count g_5E1E; shipped ITEMS supplies 2048 bytes. Preserve requested versus delivered counts. Registers ov12 callback table. Evidence: decode/listings/ov11.lst at 5700:002D, paired .c.

```pascal
procedure ov11_002D();
begin
  g_49D2 := GetMem($800); { 5700:0038 }
  g_49D6 := GetMem($800); { 5700:0048 }
  g_49DA := GetMem($400); { 5700:0058 }
  g_49DE := GetMem($1E00); { 5700:0068 }
  g_5E20 := GetMem($588); { 5700:0078 }
  g_6A58 := GetMem($924); { 5700:0088 }
  g_6A5C := GetMem($400); { 5700:0098 }
  FUN_0464_248e(Ptr<Word>(@g_5E4E), $C7C, 0, 1, 1, 8); { 5700:00B7 }
  FUN_0464_248e(Ptr<Word>(@g_4A20), $C7C, 0, 1, $15, $A8); { 5700:00CF }
  FUN_0464_248e(Ptr<Word>(@g_4A24), $C7C, 0, 1, 3, $18); { 5700:00E7 }
  FillChar(FarPtr($0C7C, $4A28), $A8, LoByte(MakeWord(HiByte($A8), $0))); { 5700:00F8 }
  FillChar(FarPtr($0C7C, $4AD0), $150, LoByte(MakeWord(HiByte($150), $0))); { 5700:0109 }
  FillChar(FarPtr($0C7C, $4C20), $150, LoByte(MakeWord(HiByte($150), $FF))); { 5700:011A }
  FillChar(FarPtr($0C7C, $4D70), $150, LoByte(MakeWord(HiByte($150), $0))); { 5700:012B }
  g_465C := 0; { 5700:0130 }
  while true do begin { 5700:0130; region anchor, exact origin unknown }
    if Boolean((g_465C and 1)) then begin { 5700:0130; region anchor, exact origin unknown }
      Ptr<Word>(@g_4EC0)[g_465C] := ((Word((g_465C shr 1)) * 5) + (-$4600)); { 5700:0130; region anchor, exact origin unknown }
    end else begin { 5700:0130; region anchor, exact origin unknown }
      Ptr<Word>(@g_4EC0)[g_465C] := ((Word((g_465C shr 1)) * 5) + (-$4800)); { 5700:0130; region anchor, exact origin unknown }
    end; { 5700:0130; region anchor, exact origin unknown }
    Ptr<Word>(@g_5050)[g_465C] := (Word(g_465C) * $28); { 5700:0130; region anchor, exact origin unknown }
    uVar3 := (Word(g_465C) mod 4); { 5700:0130; region anchor, exact origin unknown }
    if (uVar3 = 0) then begin { 5700:0130; region anchor, exact origin unknown }
      Ptr<Word>(@g_51E0)[g_465C] := ((Word((g_465C shr 2)) * 10) + (-$4800)); { 5700:0130; region anchor, exact origin unknown }
    end else begin { 5700:0130; region anchor, exact origin unknown }
      if (uVar3 = 1) then begin { 5700:0130; region anchor, exact origin unknown }
        Ptr<Word>(@g_51E0)[g_465C] := ((Word((g_465C shr 2)) * 10) + (-$4600)); { 5700:0130; region anchor, exact origin unknown }
      end else begin { 5700:0130; region anchor, exact origin unknown }
        if (uVar3 = 2) then begin { 5700:0130; region anchor, exact origin unknown }
          Ptr<Word>(@g_51E0)[g_465C] := ((Word((g_465C shr 2)) * 10) + (-$4400)); { 5700:0130; region anchor, exact origin unknown }
        end else begin { 5700:0130; region anchor, exact origin unknown }
          if (uVar3 = 3) then begin { 5700:0130; region anchor, exact origin unknown }
            Ptr<Word>(@g_51E0)[g_465C] := ((Word((g_465C shr 2)) * 10) + (-$4200)); { 5700:0130; region anchor, exact origin unknown }
          end; { 5700:0130; region anchor, exact origin unknown }
        end; { 5700:0130; region anchor, exact origin unknown }
      end; { 5700:0130; region anchor, exact origin unknown }
    end; { 5700:0130; region anchor, exact origin unknown }
    if (g_465C = 199) then begin { 5700:0130; region anchor, exact origin unknown }
      Break; { 5700:0130; region anchor, exact origin unknown }
    end; { 5700:0130; region anchor, exact origin unknown }
    g_465C := (g_465C + 1); { 5700:0137 }
  end; { 5700:0137; region anchor, exact origin unknown }
  FillChar(FarPtr($0C7C, $5E3A), $14, LoByte(MakeWord(HiByte($14), $0))); { 5700:025B }
  FillChar(FarPtr($0C7C, $5E52), $8, LoByte(MakeWord(HiByte($8), $0))); { 5700:026C }
  FillChar(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49D2))), FarOff(MemWord(FarPtr($0C7C, $49D2)))), $800, LoByte(MakeWord(HiByte($800), $0))); { 5700:027E }
  FillChar(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49D6))), FarOff(MemWord(FarPtr($0C7C, $49D6)))), $800, LoByte(MakeWord(HiByte($800), $0))); { 5700:0290 }
  FillChar(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49DA))), FarOff(MemWord(FarPtr($0C7C, $49DA)))), $400, LoByte(MakeWord(HiByte($400), $0))); { 5700:02A2 }
  FillChar(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49DE))), FarOff(MemWord(FarPtr($0C7C, $49DE)))), $1E00, LoByte(MakeWord(HiByte($1E00), $0))); { 5700:02B4 }
  FillChar(FarPtr($0C7C, $5E5A), $D0, LoByte(MakeWord(HiByte($D0), $0))); { 5700:02C5 }
  g_465C := 1; { 5700:02CA }
  while true do begin { 5700:02CA; region anchor, exact origin unknown }
    Ptr<UnknownValue>(@g_6AFB)[(Word(g_465C) * 5)] := $FF; { 5700:02CA; region anchor, exact origin unknown }
    uVar3 := Word(g_465C); { 5700:02CA; region anchor, exact origin unknown }
    (Ptr<Word>((Ptr<UnknownValue>(@g_6AFC) + (uVar3 * 5))))^ := 0; { 5700:02CA; region anchor, exact origin unknown }
    (Ptr<Word>((Ptr<UnknownValue>(@g_6AFE) + (uVar3 * 5))))^ := 0; { 5700:02CA; region anchor, exact origin unknown }
    if (g_465C = 2) then begin { 5700:02CA; region anchor, exact origin unknown }
      Break; { 5700:02CA; region anchor, exact origin unknown }
    end; { 5700:02CA; region anchor, exact origin unknown }
    g_465C := (g_465C + 1); { 5700:02D1 }
  end; { 5700:02D1; region anchor, exact origin unknown }
  FillChar(FarPtr($0C7C, $6ABE), $42, LoByte(MakeWord(HiByte($42), $0))); { 5700:0315 }
  g_6810 := 0; { 5700:031C }
  g_6812 := 0; { 5700:031F }
  FillChar(FarPtr($0C7C, $6AAD), $5, LoByte(MakeWord(HiByte($5), $0))); { 5700:032E }
  g_6AAD := $F; { 5700:0333 }
  g_6AAE := 1; { 5700:0338 }
  g_6AAF := 6; { 5700:033D }
  FillChar(FarPtr($0C7C, $6DDE), $3, LoByte(MakeWord(HiByte($3), $1))); { 5700:034E }
  g_6AB2 := 0; { 5700:0355 }
  g_6AB4 := 1; { 5700:0358 }
  g_465C := 2; { 5700:035E }
  while true do begin { 5700:035E; region anchor, exact origin unknown }
    (Ptr<Word>((Ptr<Byte>(@g_6AAE) + (Word(g_465C) * 4))))^ := $FFFF; { 5700:035E; region anchor, exact origin unknown }
    (Ptr<Word>((Ptr<Byte>(@g_6AB0) + (Word(g_465C) * 4))))^ := $FFFF; { 5700:035E; region anchor, exact origin unknown }
    if (g_465C = 3) then begin { 5700:035E; region anchor, exact origin unknown }
      Break; { 5700:035E; region anchor, exact origin unknown }
    end; { 5700:035E; region anchor, exact origin unknown }
    g_465C := (g_465C + 1); { 5700:0365 }
  end; { 5700:0365; region anchor, exact origin unknown }
  g_49F5 := 1; { 5700:0392 }
  g_49F6 := 1; { 5700:0397 }
  g_49F7 := 0; { 5700:039C }
  g_4A00 := 1; { 5700:03A1 }
  g_49F8 := 0; { 5700:03A6 }
  g_49FB := 0; { 5700:03AD }
  g_5D96 := 0; { 5700:03B2 }
  g_5D98 := 0; { 5700:03B5 }
  g_5D92 := 0; { 5700:03BA }
  g_5D94 := 0; { 5700:03BD }
  g_49ED := $9900; { 5700:03C0 }
  g_49E2 := 1; { 5700:03C6 }
  g_49F4 := 0; { 5700:03CB }
  g_5376 := 1; { 5700:03D0 }
  g_5377 := 1; { 5700:03D5 }
  g_547A := 1; { 5700:03DA }
  g_5378 := 1; { 5700:03E0 }
  g_6AAC := 0; { 5700:03E6 }
  g_49F9 := 1; { 5700:03EB }
  g_49FA := 1; { 5700:03F0 }
  (Ptr<Word>((SmallInt(g_49D6) + $67C)))^ := 0; { 5700:03F0; region anchor, exact origin unknown }
  g_6DDC := 0; { 5700:0400 }
  g_6B29 := 1; { 5700:0405 }
  g_84D4 := 0; { 5700:0405; region anchor, exact origin unknown }
  g_6DDA := 0; { 5700:0410 }
  g_84DD := 0; { 5700:0410; region anchor, exact origin unknown }
  g_84DE := 0; { 5700:0410; region anchor, exact origin unknown }
  g_84DF := 0; { 5700:0410; region anchor, exact origin unknown }
  g_84E0 := 0; { 5700:0410; region anchor, exact origin unknown }
  g_49FF := 0; { 5700:0429 }
  g_5370 := 1; { 5700:042E }
  g_84E3 := 0; { 5700:042E; region anchor, exact origin unknown }
  g_557C := 0; { 5700:0438 }
  g_6B0A := 0; { 5700:043D }
  g_6B1C := $FF; { 5700:0442 }
  g_557D := 0; { 5700:0447 }
  g_6F69 := $E8; { 5700:044C }
  g_6F68 := $DB; { 5700:0451 }
  g_84E9 := 0; { 5700:0451; region anchor, exact origin unknown }
  g_5374 := 0; { 5700:045D }
  FUN_08ae_01a5(100); { 5700:0464 }
  PString(FarPtr($0C7C, $4661)) := Copy(PString(FarPtr($0C7C, $547C)), 1, $28); { 5700:0477 }
  g_547C := 0; { 5700:047C }
  FUN_0709_017c(); { 5700:0481 }
  stub_ov25_e3(); { 5700:0486 }
  iVar1 := (Word(UNK_extraout_AH) shl 8); { 5700:0486; region anchor, exact origin unknown }
  uVar4 := MakeWord(UNK_extraout_AH, $18); { 5700:0486; region anchor, exact origin unknown }
  uVar2 := MakeWord(UNK_extraout_AH, 10); { 5700:0486; region anchor, exact origin unknown }
  puVar6 := local_18; { 5700:0486; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 5700:0486; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$16))) := 'Loading...Please Wait'; { 5700:049E }
  FUN_0709_0626(puVar6, uVar7, uVar2, uVar4, iVar1); { 5700:04A3 }
  stub_ov34_e1(MakeWord(UNK_extraout_AH_00, 4), MakeWord(UNK_extraout_AH_00, $CA)); { 5700:04AE }
  stub_ov34_e1((Word(UNK_extraout_AH_01) shl 8), MakeWord(UNK_extraout_AH_01, $CB)); { 5700:04B9 }
  puVar6 := @local_a; { 5700:04B9; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 5700:04B9; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$8))) := 'sqrpaci'; { 5700:04C8 }
  FUN_0464_0111(Ptr<Word>(@g_5E52), $C7C, (Word(UNK_extraout_AH_02) shl 8), (Word(UNK_extraout_AH_02) shl 8), MakeWord(UNK_extraout_AH_02, 1), puVar6, uVar7); { 5700:04DB }
  puVar6 := @local_a; { 5700:04DB; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 5700:04DB; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$8))) := 'sqrpaci'; { 5700:04EA }
  uVar4 := $464; { 5700:04EA; region anchor, exact origin unknown }
  FUN_0464_0111(Ptr<Word>(@g_5E56), $C7C, (Word(UNK_extraout_AH_03) shl 8), (Word(UNK_extraout_AH_03) shl 8), MakeWord(UNK_extraout_AH_03, 2), puVar6, uVar7); { 5700:04FD }
  g_465C := 0; { 5700:0502 }
  while true do begin { 5700:0502; region anchor, exact origin unknown }
    puVar6 := @local_9; { 5700:0502; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 5700:0502; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$7))) := 'COMSPR'; { 5700:0517 }
    uVar4 := $3E9; { 5700:0517; region anchor, exact origin unknown }
    stub_ov32_e4((g_465C + $D), MakeWord(UNK_extraout_AH_04, g_465C), puVar6, uVar7); { 5700:0529 }
    if (g_465C = $B) then begin { 5700:0529; region anchor, exact origin unknown }
      Break; { 5700:0529; region anchor, exact origin unknown }
    end; { 5700:0529; region anchor, exact origin unknown }
    g_465C := (g_465C + 1); { 5700:0509 }
  end; { 5700:0509; region anchor, exact origin unknown }
  puVar6 := @local_9; { 5700:0509; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 5700:0509; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$7))) := 'COMSPR'; { 5700:053F }
  stub_ov32_e4(MakeWord(UNK_extraout_AH_05, $19), MakeWord(UNK_extraout_AH_05, $19), puVar6, uVar7); { 5700:054A }
  puVar6 := local_8; { 5700:054A; region anchor, exact origin unknown }
  uVar4 := UNK_unaff_SS; { 5700:054A; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$6))) := 'ITEMS'; { 5700:0559 }
  puVar8 := local_208; { 5700:0559; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 5700:0559; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$206))) := PString(FarPtr($C7C, ((Word(g_5376) * $1E) + $2614))); { 5700:0576 }
  puVar5 := local_108; { 5700:0576; region anchor, exact origin unknown }
  PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_06, g_547D))); { 5700:0585 }
  PString(FarPtr(SS, BPAddr(-$206))) := PString(FarPtr(SS, BPAddr(-$206))) + PString(FarPtr(SS, BPAddr(-$106))); { 5700:058A }
  PString(FarPtr(SS, BPAddr(-$206))) := PString(FarPtr(SS, BPAddr(-$206))) + ':'; { 5700:0594 }
  g_4660 := FUN_0802_025d(Ptr<UnknownValue>(@g_468C), $C7C, (Word(UNK_extraout_AH_07) shl 8), puVar8, uVar7, puVar6, uVar4); { 5700:05A1 }
  Reset(FarPtr($C7C, Ptr<UnknownValue>(@g_468C)), 1); { 5700:05B2 }
  Seek(FarPtr($0C7C, $468C), MakeLong(0, $2)); { 5700:05C3 }
  BlockRead(FarPtr($C7C, Ptr<UnknownValue>(@g_468C)), FarPtr($C7C, Ptr<UnknownValue>(@g_5582)), $810, FarPtr($C7C, Ptr<UnknownValue>(@g_5E1E))); { 5700:05DB }
  Close(FarPtr($0C7C, $468C)); { 5700:05E5 }
  PString(FarPtr($0C7C, $547C)) := Copy(PString(FarPtr($0C7C, $4661)), 1, $FF); { 5700:05F8 }
  stub_ov25_e3(); { 5700:05FD }
  Randomize(); { 5700:0602 }
  stub_ov22_e10(); { 5700:0607 }
  stub_ov12_e1(); { 5700:060C }
  Exit; { 5700:0614 }
end;
```

### ov11:0615 ov11_init (conf L)

Original `ov11_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov11.lst at 5700:0615, paired .c.

```pascal
procedure ov11_init();
begin
  Exit; { 5700:0619 }
end;
```

## ov16

### ov16:0000 FreeCharacter (conf M)

Original `FUN_7000_0000`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -14:2, -12:2, -10:2, -E:2, -C:2, -A:2, -8:2, -6:2, -4:2, -2:2, +6:2, +8:2.
Locals/SSA temporaries: iVar1: SmallInt; iVar2: SmallInt; iVar3: SmallInt; uVar4: Word; local_12: Word; uStack_10: Word; local_a: Word; uStack_8: Word.
Callers: ov16_3291.
Callees (listing): System.FreeMem.

Frees combat object (22 bytes), inventory nodes (63), effect nodes (9), character (285). Evidence: decode/listings/ov16.lst at 7000:0000, paired .c.

```pascal
procedure FUN_7000_0000(param_1: LongWord);
begin
  uVar4 := Word((LongWord(param_1) shr $10)); { 7000:0000; region anchor, exact origin unknown }
  iVar3 := SmallInt(param_1); { 7000:0000; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((iVar3 + $108)))^ <> 0) or else ((Ptr<SmallInt>((iVar3 + $10A)))^ <> 0)) then begin { 7000:0000; region anchor, exact origin unknown }
    FreeMem(FarPtr(MemWord(FarPtr(FarSeg(BPWord(-$14)), FarOff(BPWord(-$14)) + $10A)), MemWord(FarPtr(FarSeg(BPWord(-$14)), FarOff(BPWord(-$14)) + $108))), $16); { 7000:002F }
  end; { 7000:002F; region anchor, exact origin unknown }
  local_a := (Ptr<SmallInt>((iVar3 + 200)))^; { 7000:0041 }
  uStack_8 := (Ptr<SmallInt>((iVar3 + $CA)))^; { 7000:0041; region anchor, exact origin unknown }
  while ((local_a <> 0) or else (uStack_8 <> 0)) do begin { 7000:0041; region anchor, exact origin unknown }
    iVar1 := (Ptr<SmallInt>((local_a + $2A)))^; { 7000:0041; region anchor, exact origin unknown }
    iVar2 := (Ptr<SmallInt>((local_a + $2C)))^; { 7000:0041; region anchor, exact origin unknown }
    FreeMem(FarPtr(BPWord(-$2), BPWord(-$4)), $3F); { 7000:0076 }
    local_a := iVar1; { 7000:0066 }
    uStack_8 := iVar2; { 7000:0066; region anchor, exact origin unknown }
  end; { 7000:0066; region anchor, exact origin unknown }
  local_12 := (Ptr<SmallInt>((iVar3 + $7F)))^; { 7000:0089 }
  uStack_10 := (Ptr<SmallInt>((iVar3 + $81)))^; { 7000:0089; region anchor, exact origin unknown }
  while ((local_12 <> 0) or else (uStack_10 <> 0)) do begin { 7000:0089; region anchor, exact origin unknown }
    iVar1 := (Ptr<SmallInt>((local_12 + 5)))^; { 7000:0089; region anchor, exact origin unknown }
    iVar2 := (Ptr<SmallInt>((local_12 + 7)))^; { 7000:0089; region anchor, exact origin unknown }
    FreeMem(FarPtr(BPWord(-$A), BPWord(-$C)), $9); { 7000:00BE }
    local_12 := iVar1; { 7000:00AE }
    uStack_10 := iVar2; { 7000:00AE; region anchor, exact origin unknown }
  end; { 7000:00AE; region anchor, exact origin unknown }
  FreeMem(FarPtr(BPWord($8), BPWord($6)), $11D); { 7000:00CF }
  Exit; { 7000:00DF }
end;
```

### ov16:0161 TrainingHallMenu (conf M)

Original `ov16_0161`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -128:2, -110:2, -23:2, -1D:2, -11:2, -10:1, -F:1, -E:1, -4:2, -3:1/2, -2:1, -1:1.
Locals/SSA temporaries: in_AX: Word; uVar1: Word; uVar2: Word; uVar3: Word; uVar4: Word; iVar5: SmallInt; uVar6: Word; iVar7: SmallInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; uVar9: Word; unaff_SS: Word; bVar10: Boolean; uVar11: Byte; puVar12: ^Byte; local_12a: array[0..24-1] of Byte; local_112: array[0..237-1] of Byte; local_25: array[0..6-1] of Byte; local_1f: array[0..12-1] of Byte; local_13: Byte; local_12: Byte; local_11: ShortInt; local_10: ShortInt; local_6: Byte; local_5: ShortInt; local_4: ShortInt; local_3: Byte; bVar8: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_03f1_02e8, FUN_00ba_0767, System.@CharToStr, FUN_0709_0626, System.Copy, stub_ov25_e2, stub_ov25_e3, System.@SetIn, stub_ov19_e10, FUN_7000_056c, FUN_7000_1f37, FUN_7000_209f, FUN_7000_29ae, stub_ov19_e5, FUN_7000_306d, stub_ov17_e4, ov16_3291, stub_ov17_e8, stub_ov17_e9, stub_ov25_e5, FUN_0899_0000, System.ParamStr, System.@StrCompare, FUN_00ba_1693.

Create Drop Modify Train View Add Remove Load Save Begin Exit. STING permits J override. DataSet=3; Begin mode=4; Exit confirms then saves. Evidence: decode/listings/ov16.lst at 7000:0161, paired .c.

```pascal
procedure ov16_0161();
begin
  uVar9 := $7000; { 7000:0161; region anchor, exact origin unknown }
  g_5376 := 3; { 7000:0168 }
  local_12 := 4; { 7000:016D }
  local_11 := $1; { 7000:0171 }
  g_470C := $0; { 7000:0175 }
  g_49F3 := $0; { 7000:017A }
  repeat { 7000:017A; region anchor, exact origin unknown }
    while true do begin { 7000:017A; region anchor, exact origin unknown }
      if (local_11 <> $0) then begin { 7000:017A; region anchor, exact origin unknown }
        bVar8 := Byte((Word(UNK_in_AX) shr 8)); { 7000:017A; region anchor, exact origin unknown }
        uVar1 := MakeWord(bVar8, 1); { 7000:017A; region anchor, exact origin unknown }
        uVar2 := MakeWord(bVar8, 1); { 7000:017A; region anchor, exact origin unknown }
        uVar3 := MakeWord(bVar8, $26); { 7000:017A; region anchor, exact origin unknown }
        uVar4 := MakeWord(bVar8, $16); { 7000:017A; region anchor, exact origin unknown }
        iVar7 := (Word(bVar8) shl 8); { 7000:017A; region anchor, exact origin unknown }
        iVar5 := (Word(bVar8) shl 8); { 7000:017A; region anchor, exact origin unknown }
        puVar12 := @local_13; { 7000:017A; region anchor, exact origin unknown }
        uVar6 := UNK_unaff_SS; { 7000:017A; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$11))) := ''; { 7000:01A4 }
        uVar9 := $3F1; { 7000:01A4; region anchor, exact origin unknown }
        FUN_03f1_02e8(puVar12, uVar6, iVar5, iVar7, uVar4, uVar3, uVar2, uVar1); { 7000:01A9 }
        if ((g_5D92 = 0) and then (g_5D94 = 0)) then begin { 7000:01A9; region anchor, exact origin unknown }
          g_066C := $0; { 7000:01C4 }
          g_0696 := $0; { 7000:01C9 }
          g_06C0 := $0; { 7000:01E1 }
          g_06EA := $0; { 7000:01E6 }
          g_073E := $0; { 7000:01EB }
          g_0768 := $1; { 7000:01F0 }
          g_0792 := $0; { 7000:01F5 }
          g_07BC := $0; { 7000:01FA }
        end else begin { 7000:01FA; region anchor, exact origin unknown }
          uVar9 := $BA; { 7000:01FA; region anchor, exact origin unknown }
          FUN_00ba_0767(g_5D92, g_5D94); { 7000:01BF }
          g_066C := $1; { 7000:0201 }
          g_0696 := $1; { 7000:0206 }
          if (((Ptr<SmallInt>((SmallInt(g_49D6) + $550)))^ <> 0) or else (g_470C <> $0)) then begin { 7000:0206; region anchor, exact origin unknown }
            g_06C0 := $1; { 7000:020B }
          end; { 7000:020B; region anchor, exact origin unknown }
          g_06EA := $1; { 7000:0210 }
          g_073E := $1; { 7000:0215 }
          g_0768 := $0; { 7000:021A }
          g_0792 := $1; { 7000:021F }
          g_07BC := $1; { 7000:0224 }
        end; { 7000:0224; region anchor, exact origin unknown }
        local_10 := $0; { 7000:0229 }
        local_3 := 0; { 7000:022D }
        while true do begin { 7000:022D; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>(((Word(local_3) * $2A) + $642)))^ <> $0) then begin { 7000:022D; region anchor, exact origin unknown }
            uVar6 := MakeWord(ShortInt(((Word(local_3) * $2A) shr 8)), 2); { 7000:022D; region anchor, exact origin unknown }
            iVar7 := (local_10 + $C); { 7000:022D; region anchor, exact origin unknown }
            uVar1 := MakeWord(ShortInt((Word(iVar7) shr 8)), $F); { 7000:022D; region anchor, exact origin unknown }
            puVar12 := local_112; { 7000:022D; region anchor, exact origin unknown }
            uVar9 := UNK_unaff_SS; { 7000:022D; region anchor, exact origin unknown }
            PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(ShortInt(((Word(local_3) * $2A) shr 8)), (Ptr<Byte>(((Word(local_3) * $2A) + $61A)))^))); { 7000:026E }
            FUN_0709_0626(puVar12, uVar9, uVar1, iVar7, uVar6); { 7000:0273 }
            uVar1 := MakeWord(UNK_extraout_AH, 3); { 7000:0273; region anchor, exact origin unknown }
            iVar7 := (local_10 + $C); { 7000:0273; region anchor, exact origin unknown }
            uVar2 := MakeWord(ShortInt((Word(iVar7) shr 8)), 10); { 7000:0273; region anchor, exact origin unknown }
            puVar12 := local_112; { 7000:0273; region anchor, exact origin unknown }
            uVar6 := UNK_unaff_SS; { 7000:0273; region anchor, exact origin unknown }
            PString(UNK_hidden_string_result) := Copy(PString(FarPtr($C7C, ((Word(local_3) * $2A) + $619))), 2, ((Ptr<Byte>(((Word(local_3) * $2A) + $619)))^ - 1)); { 7000:02B6 }
            uVar9 := $709; { 7000:02B6; region anchor, exact origin unknown }
            FUN_0709_0626(puVar12, uVar6, uVar2, iVar7, uVar1); { 7000:02BB }
            local_10 := (local_10 + $1); { 7000:02C0 }
          end; { 7000:02C0; region anchor, exact origin unknown }
          if (local_3 = 10) then begin { 7000:02C0; region anchor, exact origin unknown }
            Break; { 7000:02C0; region anchor, exact origin unknown }
          end; { 7000:02C0; region anchor, exact origin unknown }
          local_3 := (local_3 + 1); { 7000:0233 }
        end; { 7000:0233; region anchor, exact origin unknown }
        local_11 := $0; { 7000:02CC }
      end; { 7000:02CC; region anchor, exact origin unknown }
      puVar12 := local_25; { 7000:02CC; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7000:02CC; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$23))) := 'Choose a function '; { 7000:02DA }
      local_4 := stub_ov25_e2(@local_5, UNK_unaff_SS, (Word(UNK_extraout_AH_00) shl 8), MakeWord(UNK_extraout_AH_00, 1), (Word(UNK_extraout_AH_00) shl 8), (Word(UNK_extraout_AH_00) shl 8), MakeWord(UNK_extraout_AH_00, $D), $5F0, $C7C, puVar12, uVar6); { 7000:02F8 }
      stub_ov25_e3(); { 7000:0300 }
      bVar10 := (local_5 = $0); { 7000:0300; region anchor, exact origin unknown }
      if bVar10 then begin { 7000:0300; region anchor, exact origin unknown }
        Break; { 7000:0300; region anchor, exact origin unknown }
      end; { 7000:0300; region anchor, exact origin unknown }
      uVar9 := $AF8; { 7000:0300; region anchor, exact origin unknown }
      UNK_in_AX := (MakeWord(UNK_extraout_AH_01, local_4) in PackedSet(FarPtr($3C5, $F6))); { 7000:0314 }
      if (not bVar10) then begin { 7000:0314; region anchor, exact origin unknown }
        stub_ov19_e10(local_4); { 7000:031F }
        uVar9 := $BA; { 7000:031F; region anchor, exact origin unknown }
        UNK_in_AX := FUN_00ba_0767(g_5D92, g_5D94); { 7000:032C }
      end; { 7000:032C; region anchor, exact origin unknown }
    end; { 7000:032C; region anchor, exact origin unknown }
    uVar9 := $AF8; { 7000:032C; region anchor, exact origin unknown }
    (MakeWord(UNK_extraout_AH_01, local_4) in PackedSet(FarPtr($3C5, $116))); { 7000:033D }
    if bVar10 then begin { 7000:033D; region anchor, exact origin unknown }
      g_557D := $0; { 7000:0344 }
    end; { 7000:0344; region anchor, exact origin unknown }
    UNK_in_AX := MakeWord(UNK_extraout_AH_02, local_4); { 7000:0344; region anchor, exact origin unknown }
    if (local_4 = $43) then begin { 7000:0344; region anchor, exact origin unknown }
      if (g_0642 <> $0) then begin { 7000:0344; region anchor, exact origin unknown }
        UNK_in_AX := FUN_7000_056c(); { 7000:0358 }
      end; { 7000:0358; region anchor, exact origin unknown }
    end else begin { 7000:0358; region anchor, exact origin unknown }
      if (local_4 = $44) then begin { 7000:0358; region anchor, exact origin unknown }
        if (g_066C <> $0) then begin { 7000:0358; region anchor, exact origin unknown }
          UNK_in_AX := FUN_7000_1f37(); { 7000:036A }
        end; { 7000:036A; region anchor, exact origin unknown }
      end else begin { 7000:036A; region anchor, exact origin unknown }
        if (local_4 = $4D) then begin { 7000:036A; region anchor, exact origin unknown }
          if (g_0696 <> $0) then begin { 7000:036A; region anchor, exact origin unknown }
            UNK_in_AX := FUN_7000_209f(); { 7000:037C }
          end; { 7000:037C; region anchor, exact origin unknown }
        end else begin { 7000:037C; region anchor, exact origin unknown }
          if (local_4 = $54) then begin { 7000:037C; region anchor, exact origin unknown }
            if (g_06C0 <> $0) then begin { 7000:037C; region anchor, exact origin unknown }
              UNK_in_AX := FUN_7000_29ae(); { 7000:038E }
            end; { 7000:038E; region anchor, exact origin unknown }
          end else begin { 7000:038E; region anchor, exact origin unknown }
            if (local_4 = $56) then begin { 7000:038E; region anchor, exact origin unknown }
              if (g_06EA <> $0) then begin { 7000:038E; region anchor, exact origin unknown }
                uVar9 := $85; { 7000:038E; region anchor, exact origin unknown }
                UNK_in_AX := stub_ov19_e5(@local_6, UNK_unaff_SS); { 7000:03A4 }
              end; { 7000:03A4; region anchor, exact origin unknown }
            end else begin { 7000:03A4; region anchor, exact origin unknown }
              if (local_4 = $41) then begin { 7000:03A4; region anchor, exact origin unknown }
                if (g_0714 <> $0) then begin { 7000:03A4; region anchor, exact origin unknown }
                  UNK_in_AX := FUN_7000_306d(); { 7000:03B8 }
                end; { 7000:03B8; region anchor, exact origin unknown }
              end else begin { 7000:03B8; region anchor, exact origin unknown }
                if (local_4 = $52) then begin { 7000:03B8; region anchor, exact origin unknown }
                  if ((g_073E <> $0) and then Seq(UNK_in_AX := 0, ((g_5D92 <> 0) or else (g_5D94 <> 0)))) then begin { 7000:03B8; region anchor, exact origin unknown }
                    puVar12 := @local_13; { 7000:03B8; region anchor, exact origin unknown }
                    uVar6 := UNK_unaff_SS; { 7000:03B8; region anchor, exact origin unknown }
                    iVar7 := g_5D92; { 7000:03B8; region anchor, exact origin unknown }
                    iVar5 := g_5D94; { 7000:03B8; region anchor, exact origin unknown }
                    PString(FarPtr(SS, BPAddr(-$11))) := ''; { 7000:03E4 }
                    uVar9 := $7C; { 7000:03E4; region anchor, exact origin unknown }
                    stub_ov17_e4(puVar12, uVar6, iVar7, iVar5); { 7000:03E9 }
                    UNK_in_AX := ov16_3291(MakeWord(UNK_extraout_AH_03, 1), (Word(UNK_extraout_AH_03) shl 8)); { 7000:03F5 }
                  end; { 7000:03F5; region anchor, exact origin unknown }
                end else begin { 7000:03F5; region anchor, exact origin unknown }
                  if (local_4 = $4C) then begin { 7000:03F5; region anchor, exact origin unknown }
                    if (g_0768 <> $0) then begin { 7000:03F5; region anchor, exact origin unknown }
                      uVar9 := $7C; { 7000:03F5; region anchor, exact origin unknown }
                      UNK_in_AX := stub_ov17_e8(); { 7000:0406 }
                      if (g_49F3 <> $0) then begin { 7000:0406; region anchor, exact origin unknown }
                        g_49F8 := 1; { 7000:0412 }
                        Exit; { 7000:04F0 }
                      end; { 7000:0412; region anchor, exact origin unknown }
                    end; { 7000:0412; region anchor, exact origin unknown }
                  end else begin { 7000:0412; region anchor, exact origin unknown }
                    if (local_4 = $53) then begin { 7000:0412; region anchor, exact origin unknown }
                      if ((g_0792 <> $0) and then Seq(UNK_in_AX := 0, ((g_5D96 <> 0) or else (g_5D98 <> 0)))) then begin { 7000:0412; region anchor, exact origin unknown }
                        uVar9 := $7C; { 7000:0412; region anchor, exact origin unknown }
                        UNK_in_AX := stub_ov17_e9(); { 7000:0431 }
                      end; { 7000:0431; region anchor, exact origin unknown }
                    end else begin { 7000:0431; region anchor, exact origin unknown }
                      if (local_4 = $42) then begin { 7000:0431; region anchor, exact origin unknown }
                        if ((g_07BC <> $0) and then Seq(UNK_in_AX := 0, ((g_5D96 <> 0) or else (g_5D98 <> 0)))) then begin { 7000:0431; region anchor, exact origin unknown }
                          g_49F3 := local_12; { 7000:0450 }
                          stub_ov25_e3(); { 7000:0453 }
                          Exit; { 7000:04F0 }
                        end; { 7000:0453; region anchor, exact origin unknown }
                      end else begin { 7000:0453; region anchor, exact origin unknown }
                        if (local_4 = $45) then begin { 7000:0453; region anchor, exact origin unknown }
                          if (g_07E6 <> $0) then begin { 7000:0453; region anchor, exact origin unknown }
                            puVar12 := local_1f; { 7000:0453; region anchor, exact origin unknown }
                            uVar6 := UNK_unaff_SS; { 7000:0453; region anchor, exact origin unknown }
                            PString(FarPtr(SS, BPAddr(-$1D))) := 'Quit to DOS '; { 7000:0473 }
                            uVar9 := $3C5; { 7000:0473; region anchor, exact origin unknown }
                            UNK_in_AX := stub_ov25_e5(MakeWord(UNK_extraout_AH_04, $F), MakeWord(UNK_extraout_AH_04, 10), MakeWord(UNK_extraout_AH_04, $E), puVar12, uVar6); { 7000:0481 }
                            local_4 := ShortInt(UNK_in_AX); { 7000:0486 }
                            if (local_4 = $59) then begin { 7000:0486; region anchor, exact origin unknown }
                              while ((g_557D = $0) and then ((g_5D96 <> 0) or else (g_5D98 <> 0))) do begin { 7000:0486; region anchor, exact origin unknown }
                                stub_ov17_e9(); { 7000:049F }
                              end; { 7000:049F; region anchor, exact origin unknown }
                              uVar9 := $899; { 7000:049F; region anchor, exact origin unknown }
                              UNK_in_AX := FUN_0899_0000(); { 7000:04A6 }
                            end; { 7000:04A6; region anchor, exact origin unknown }
                          end; { 7000:04A6; region anchor, exact origin unknown }
                        end else begin { 7000:04A6; region anchor, exact origin unknown }
                          uVar11 := (local_4 = $4A); { 7000:04A6; region anchor, exact origin unknown }
                          if Boolean(uVar11) then begin { 7000:04A6; region anchor, exact origin unknown }
                            puVar12 := local_112; { 7000:04A6; region anchor, exact origin unknown }
                            uVar6 := UNK_unaff_SS; { 7000:04A6; region anchor, exact origin unknown }
                            ParamStr($1); { 7000:04BB }
                            uVar9 := $AF8; { 7000:04BB; region anchor, exact origin unknown }
                            UNK_in_AX := CompareStrFlags(PString(FarPtr(SS, BPAddr(-$110))), 'STING'); { 7000:04C5 }
                            if Boolean(uVar11) then begin { 7000:04C5; region anchor, exact origin unknown }
                              g_470C := $1; { 7000:04CC }
                              puVar12 := local_12a; { 7000:04CC; region anchor, exact origin unknown }
                              uVar6 := UNK_unaff_SS; { 7000:04CC; region anchor, exact origin unknown }
                              PString(FarPtr(SS, BPAddr(-$128))) := 'I Understand, master...'; { 7000:04DC }
                              uVar9 := $BA; { 7000:04DC; region anchor, exact origin unknown }
                              UNK_in_AX := FUN_00ba_1693(puVar12, uVar6); { 7000:04E1 }
                            end; { 7000:04E1; region anchor, exact origin unknown }
                          end; { 7000:04E1; region anchor, exact origin unknown }
                        end; { 7000:04E1; region anchor, exact origin unknown }
                      end; { 7000:04E1; region anchor, exact origin unknown }
                    end; { 7000:04E1; region anchor, exact origin unknown }
                  end; { 7000:04E1; region anchor, exact origin unknown }
                end; { 7000:04E1; region anchor, exact origin unknown }
              end; { 7000:04E1; region anchor, exact origin unknown }
            end; { 7000:04E1; region anchor, exact origin unknown }
          end; { 7000:04E1; region anchor, exact origin unknown }
        end; { 7000:04E1; region anchor, exact origin unknown }
      end; { 7000:04E1; region anchor, exact origin unknown }
    end; { 7000:04E1; region anchor, exact origin unknown }
    local_11 := $1; { 7000:04E6 }
  until not (true); { 7000:04E6; region anchor, exact origin unknown }
end;
```

### ov16:056C CreateCharacter (conf M)

Original `FUN_7000_056c`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -124:2, -123:2, -27:2, -25:2, -24:1/2, -23:1/2, -22:1, -1C:1, -19:1, -18:1, -17:1, -16:1, -13:1, -12:1/2, -10:2, -E:2, -C:2, -A:2, -4:2, -2:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; extraout_AH_06: Byte; extraout_AH_07: Byte; extraout_AH_08: Byte; extraout_AH_09: Byte; uVar4: Byte; uVar2: Word; iVar3: SmallInt; bVar5: Byte; extraout_AH_10: Byte; extraout_AH_11: Byte; piVar6: ^SmallInt; iVar7: SmallInt; uVar8: Word; uVar9: Word; unaff_SS: Word; uVar10: LongWord; puVar11: ^Byte; puVar12: ^Byte; uVar13: Word; auStack_136: array[0..16-1] of Byte; local_126: Byte; local_125: array[0..234-1] of Byte; auStack_3b: array[0..5-1] of Byte; auStack_36: array[0..9-1] of Byte; uStack_2d: LongWord; local_29: LongWord; local_25: Byte; local_24: Byte; bStack_23: Byte; bStack_22: Byte; uStack_20: Word; local_1e: Byte; cStack_1d: ShortInt; local_1b: ShortInt; local_1a: ShortInt; local_19: ShortInt; local_18: ShortInt; bStack_17: Byte; cStack_16: ShortInt; local_15: Byte; local_14: SmallInt; local_12: LongWord; local_e: Word; uStack_c: Word; uStack_a: Word; uStack_8: Word; local_6: LongWord.
Callers: ov16_0161.
Callees (listing): System.GetMem, System.FillChar, System.RandomWord, stub_ov25_e6, System.@StrAssign, stub_ov25_e1, System.@StrCopy, System.@StrAppend, stub_ov25_e4, stub_ov24_e10, stub_ov25_e7, stub_ov23_e4, stub_ov23_e3, stub_ov24_e8.

Race/gender/class/alignment and rolled attributes, name, roster persistence. Evidence: decode/listings/ov16.lst at 7000:056C, paired .c.

```pascal
procedure FUN_7000_056c();
begin
  local_6 := Ptr<SmallInt>(GetMem($11D)); { 7000:0577 }
  FillChar($100, $11D, local_6); { 7000:058E }
  ExtractBytes(local_29, 2, 2) := Word((LongWord(local_6) shr $10)); { 7000:058E; region anchor, exact origin unknown }
  ExtractBytes(local_29, 0, 2) := Ptr<SmallInt>(local_6); { 7000:058E; region anchor, exact origin unknown }
  local_15 := 1; { 7000:059C }
  while Seq((Ptr<ShortInt>(((SmallInt(Ptr<SmallInt>(local_29)) + local_15) + $C0)))^ := (Ptr<UnknownValue>(@g_3CF5)[local_15] + ((Ptr<UnknownValue>(@g_3CF5)[local_15] + $8) * $10)), (local_15 <> 6)) do begin { 7000:059C; region anchor, exact origin unknown }
    local_15 := (local_15 + 1); { 7000:05A2 }
  end; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_29)) + $A9)))^ := $32; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_29)) + $2D)))^ := $28; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((Ptr<SmallInt>(local_29) + $86)))^ := $0; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_29)) + $10D)))^ := $1; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_29)) + $BB)))^ := $1; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((Ptr<SmallInt>(local_29) + $5E)))^ := $1; { 7000:05A2; region anchor, exact origin unknown }
  (Ptr<ShortInt>((Ptr<SmallInt>(local_29) + $36)))^ := $1; { 7000:05A2; region anchor, exact origin unknown }
  cVar1 := Random($100); { 7000:0622 }
  (Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_29)) + $AB)))^ := cVar1; { 7000:0622; region anchor, exact origin unknown }
  stub_ov25_e6(@local_e, UNK_unaff_SS, 7); { 7000:0638 }
  uVar8 := Word((LongWord(_local_e) shr $10)); { 7000:0638; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(_local_e) + $29)))^ := 1; { 7000:0638; region anchor, exact origin unknown }
  PString(FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C)))) := Copy('Pick Race', 1, $28); { 7000:0653 }
  local_19 := $1; { 7000:0658 }
  while true do begin { 7000:0658; region anchor, exact origin unknown }
    if ((local_19 < $1) or else ($5 < local_19)) then begin { 7000:0658; region anchor, exact origin unknown }
      if (local_19 = $7) then begin { 7000:0658; region anchor, exact origin unknown }
        local_12 := stub_ov25_e1(local_e, uStack_c, 6); { 7000:0677 }
        puVar11 := local_125; { 7000:0677; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 7000:0677; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$123))) := '  '; { 7000:068D }
        PString(FarPtr(SS, BPAddr(-$123))) := PString(FarPtr(SS, BPAddr(-$123))) + PString(FarPtr($C7C, ((local_19 * 10) + $F03))); { 7000:06A3 }
        PString(FarPtr(FarSeg(BPWord(-$10)), FarOff(BPWord(-$10)))) := Copy(PString(FarPtr(SS, BPAddr(-$123))), 1, $28); { 7000:06B1 }
      end; { 7000:06B1; region anchor, exact origin unknown }
    end else begin { 7000:06B1; region anchor, exact origin unknown }
      local_12 := stub_ov25_e1(local_e, uStack_c, SmallInt(local_19)); { 7000:06C8 }
      puVar11 := local_125; { 7000:06C8; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7000:06C8; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$123))) := '  '; { 7000:06DE }
      PString(FarPtr(SS, BPAddr(-$123))) := PString(FarPtr(SS, BPAddr(-$123))) + PString(FarPtr($C7C, ((local_19 * 10) + $F03))); { 7000:06F4 }
      PString(FarPtr(FarSeg(BPWord(-$10)), FarOff(BPWord(-$10)))) := Copy(PString(FarPtr(SS, BPAddr(-$123))), 1, $28); { 7000:0702 }
    end; { 7000:0702; region anchor, exact origin unknown }
    uVar8 := $AF8; { 7000:0702; region anchor, exact origin unknown }
    if (local_19 = $7) then begin { 7000:0702; region anchor, exact origin unknown }
      Break; { 7000:0702; region anchor, exact origin unknown }
    end; { 7000:0702; region anchor, exact origin unknown }
    local_19 := (local_19 + $1); { 7000:065E }
  end; { 7000:065E; region anchor, exact origin unknown }
  ExtractBytes(local_12, 0, 2) := Word(_local_e); { 7000:065E; region anchor, exact origin unknown }
  ExtractBytes(local_12, 2, 2) := uStack_c; { 7000:065E; region anchor, exact origin unknown }
  local_14 := 1; { 7000:071C }
  local_25 := 1; { 7000:0721 }
  local_24 := 1; { 7000:0725 }
  repeat { 7000:0725; region anchor, exact origin unknown }
    iVar3 := (SmallInt(@local_29) + 3); { 7000:0725; region anchor, exact origin unknown }
    uVar13 := UNK_unaff_SS; { 7000:0725; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$24))) := ''; { 7000:0733 }
    iVar7 := (SmallInt(@local_29) + 2); { 7000:0733; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:0733; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$25))) := ''; { 7000:0742 }
    uVar8 := $3C5; { 7000:0742; region anchor, exact origin unknown }
    local_18 := stub_ov25_e4(@local_12, UNK_unaff_SS, @local_14, UNK_unaff_SS, @local_25, UNK_unaff_SS, MakeWord(UNK_extraout_AH, local_24), local_e, uStack_c, MakeWord(UNK_extraout_AH, $16), MakeWord(UNK_extraout_AH, $26), MakeWord(UNK_extraout_AH, 2), MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), iVar7, uVar9, iVar3, uVar13); { 7000:0775 }
    if (local_18 = $0) then begin { 7000:0775; region anchor, exact origin unknown }
      Exit; { 7000:0775; region anchor, exact origin unknown }
    end; { 7000:0775; region anchor, exact origin unknown }
  until not ((local_18 <> $D)); { 7000:0775; region anchor, exact origin unknown }
  if (local_14 = 6) then begin { 7000:0775; region anchor, exact origin unknown }
    local_14 := 7; { 7000:0792 }
  end; { 7000:0792; region anchor, exact origin unknown }
  uVar8 := Word((LongWord(local_6) shr $10)); { 7000:0792; region anchor, exact origin unknown }
  piVar6 := Ptr<SmallInt>(local_6); { 7000:0792; region anchor, exact origin unknown }
  local_29 := local_6; { 7000:0798 }
  (Ptr<ShortInt>((piVar6 + $17)))^ := ShortInt(local_14); { 7000:0798; region anchor, exact origin unknown }
  cVar1 := ShortInt(piVar6[$17]); { 7000:0798; region anchor, exact origin unknown }
  if (cVar1 = $5) then begin { 7000:0798; region anchor, exact origin unknown }
    (Ptr<ShortInt>((piVar6 + $60)))^ := $1; { 7000:0798; region anchor, exact origin unknown }
    stub_ov24_e10(0, $FF, 0, $5A, piVar6, uVar8); { 7000:07CE }
    stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_00, $61), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:07E5 }
  end else begin { 7000:07E5; region anchor, exact origin unknown }
    if (cVar1 = $1) then begin { 7000:07E5; region anchor, exact origin unknown }
      (Ptr<ShortInt>((piVar6 + $60)))^ := $1; { 7000:07E5; region anchor, exact origin unknown }
      stub_ov24_e10(0, $FF, 0, $5A, piVar6, uVar8); { 7000:080C }
      stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_01, $61), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:0823 }
      stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_02, $1A), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:083A }
      stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_03, $2F), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:0851 }
    end else begin { 7000:0851; region anchor, exact origin unknown }
      if (cVar1 = $3) then begin { 7000:0851; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + $60)))^ := $1; { 7000:0851; region anchor, exact origin unknown }
        stub_ov24_e10(0, $FF, 0, $61, piVar6, uVar8); { 7000:0878 }
        stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_04, $12), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:088F }
        stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_05, $2F), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:08A6 }
        stub_ov24_e10(0, $FF, 0, MakeWord(UNK_extraout_AH_06, $30), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:08BD }
      end else begin { 7000:08BD; region anchor, exact origin unknown }
        if (cVar1 = $2) then begin { 7000:08BD; region anchor, exact origin unknown }
          (Ptr<ShortInt>((piVar6 + $60)))^ := $2; { 7000:08BD; region anchor, exact origin unknown }
          stub_ov24_e10(0, $FF, 0, $6B, piVar6, uVar8); { 7000:08E3 }
        end else begin { 7000:08E3; region anchor, exact origin unknown }
          if (cVar1 = $4) then begin { 7000:08E3; region anchor, exact origin unknown }
            (Ptr<ShortInt>((piVar6 + $60)))^ := $2; { 7000:08E3; region anchor, exact origin unknown }
            stub_ov24_e10(0, $FF, 0, $7C, piVar6, uVar8); { 7000:0909 }
          end else begin { 7000:0909; region anchor, exact origin unknown }
            (Ptr<ShortInt>((piVar6 + $60)))^ := $2; { 7000:0909; region anchor, exact origin unknown }
          end; { 7000:0909; region anchor, exact origin unknown }
        end; { 7000:0909; region anchor, exact origin unknown }
      end; { 7000:0909; region anchor, exact origin unknown }
    end; { 7000:0909; region anchor, exact origin unknown }
  end; { 7000:0909; region anchor, exact origin unknown }
  stub_ov25_e7(@local_e, UNK_unaff_SS); { 7000:091E }
  stub_ov25_e6(@local_e, UNK_unaff_SS, 3); { 7000:092C }
  uVar8 := Word((LongWord(_local_e) shr $10)); { 7000:092C; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(_local_e) + $29)))^ := 1; { 7000:092C; region anchor, exact origin unknown }
  PString(FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C)))) := Copy('Pick Gender', 1, $28); { 7000:0947 }
  local_1a := $0; { 7000:094C }
  while true do begin { 7000:094C; region anchor, exact origin unknown }
    uVar10 := stub_ov25_e1(local_e, uStack_c, (local_1a + 1)); { 7000:0961 }
    puVar11 := local_125; { 7000:0961; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7000:0961; region anchor, exact origin unknown }
    local_12 := uVar10; { 7000:0966 }
    PString(FarPtr(SS, BPAddr(-$123))) := '  '; { 7000:0977 }
    PString(FarPtr(SS, BPAddr(-$123))) := PString(FarPtr(SS, BPAddr(-$123))) + PString(FarPtr($C7C, ((local_1a * 7) + $FEC))); { 7000:098D }
    uVar9 := $AF8; { 7000:098D; region anchor, exact origin unknown }
    StrAssign($28, local_12, puVar11, uVar8); { 7000:099B }
    if (local_1a = $1) then begin { 7000:099B; region anchor, exact origin unknown }
      Break; { 7000:099B; region anchor, exact origin unknown }
    end; { 7000:099B; region anchor, exact origin unknown }
    local_1a := (local_1a + $1); { 7000:0952 }
  end; { 7000:0952; region anchor, exact origin unknown }
  ExtractBytes(local_12, 0, 2) := Word(_local_e); { 7000:0952; region anchor, exact origin unknown }
  ExtractBytes(local_12, 2, 2) := uStack_c; { 7000:0952; region anchor, exact origin unknown }
  local_14 := 1; { 7000:09B2 }
  local_24 := 1; { 7000:09B7 }
  local_25 := 1; { 7000:09BB }
  repeat { 7000:09BB; region anchor, exact origin unknown }
    iVar3 := (SmallInt(@local_29) + 3); { 7000:09BB; region anchor, exact origin unknown }
    uVar13 := UNK_unaff_SS; { 7000:09BB; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$24))) := ''; { 7000:09C9 }
    iVar7 := (SmallInt(@local_29) + 2); { 7000:09C9; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7000:09C9; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$25))) := ''; { 7000:09D8 }
    uVar9 := $3C5; { 7000:09D8; region anchor, exact origin unknown }
    local_18 := stub_ov25_e4(@local_12, UNK_unaff_SS, @local_14, UNK_unaff_SS, @local_25, UNK_unaff_SS, MakeWord(UNK_extraout_AH_07, local_24), local_e, uStack_c, MakeWord(UNK_extraout_AH_07, $16), MakeWord(UNK_extraout_AH_07, $26), MakeWord(UNK_extraout_AH_07, 2), MakeWord(UNK_extraout_AH_07, 1), MakeWord(UNK_extraout_AH_07, $F), MakeWord(UNK_extraout_AH_07, 10), MakeWord(UNK_extraout_AH_07, $D), iVar7, uVar8, iVar3, uVar13); { 7000:0A0B }
    if (local_18 = $0) then begin { 7000:0A0B; region anchor, exact origin unknown }
      Exit; { 7000:0A0B; region anchor, exact origin unknown }
    end; { 7000:0A0B; region anchor, exact origin unknown }
  until not ((local_18 <> $D)); { 7000:0A0B; region anchor, exact origin unknown }
  (Ptr<ShortInt>((Ptr<SmallInt>(local_6) + $4F)))^ := (ShortInt(local_14) + (-1)); { 7000:0A0B; region anchor, exact origin unknown }
  stub_ov25_e7(@local_e, UNK_unaff_SS); { 7000:0A33 }
  local_1e := Ptr<UnknownValue>(@g_3E17)[(ShortInt(Ptr<SmallInt>(local_6)[$17]) * $C)]; { 7000:0A4B }
  stub_ov25_e6(@local_e, UNK_unaff_SS, (local_1e + 1)); { 7000:0A5A }
  uVar8 := Word((LongWord(_local_e) shr $10)); { 7000:0A5A; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(_local_e) + $29)))^ := 1; { 7000:0A5A; region anchor, exact origin unknown }
  PString(FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C)))) := Copy('Pick Class', 1, $28); { 7000:0A75 }
  ExtractBytes(local_29, 3, 1) := local_1e; { 7000:0A75; region anchor, exact origin unknown }
  if (local_1e <> 0) then begin { 7000:0A75; region anchor, exact origin unknown }
    local_15 := 1; { 7000:0A87 }
    while true do begin { 7000:0A87; region anchor, exact origin unknown }
      uVar10 := stub_ov25_e1(local_e, uStack_c, local_15); { 7000:0A9B }
      puVar11 := @local_126; { 7000:0A9B; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7000:0A9B; region anchor, exact origin unknown }
      local_12 := uVar10; { 7000:0AA0 }
      PString(FarPtr(SS, BPAddr(-$124))) := '  '; { 7000:0AB1 }
      PString(FarPtr(SS, BPAddr(-$124))) := PString(FarPtr(SS, BPAddr(-$124))) + PString(FarPtr($C7C, ((ShortInt(Ptr<UnknownValue>(@g_3E17)[((ShortInt(Ptr<SmallInt>(local_6)[$17]) * $C) + Word(local_15))]) * $1B) + $D38))); { 7000:0AE0 }
      StrAssign($28, local_12, puVar11, uVar8); { 7000:0AEE }
      if (local_15 = ExtractBytes(local_29, 3, 1)) then begin { 7000:0AEE; region anchor, exact origin unknown }
        Break; { 7000:0AEE; region anchor, exact origin unknown }
      end; { 7000:0AEE; region anchor, exact origin unknown }
      local_15 := (local_15 + 1); { 7000:0A8C }
    end; { 7000:0A8C; region anchor, exact origin unknown }
  end; { 7000:0A8C; region anchor, exact origin unknown }
  uVar8 := $AF8; { 7000:0A8C; region anchor, exact origin unknown }
  ExtractBytes(local_12, 0, 2) := Word(_local_e); { 7000:0A8C; region anchor, exact origin unknown }
  ExtractBytes(local_12, 2, 2) := uStack_c; { 7000:0A8C; region anchor, exact origin unknown }
  local_14 := 1; { 7000:0B07 }
  local_24 := 1; { 7000:0B0C }
  local_25 := 1; { 7000:0B10 }
  repeat { 7000:0B10; region anchor, exact origin unknown }
    iVar3 := (SmallInt(@local_29) + 3); { 7000:0B10; region anchor, exact origin unknown }
    uVar13 := UNK_unaff_SS; { 7000:0B10; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$24))) := ''; { 7000:0B1E }
    iVar7 := (SmallInt(@local_29) + 2); { 7000:0B1E; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:0B1E; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$25))) := ''; { 7000:0B2D }
    uVar8 := $3C5; { 7000:0B2D; region anchor, exact origin unknown }
    local_18 := stub_ov25_e4(@local_12, UNK_unaff_SS, @local_14, UNK_unaff_SS, @local_25, UNK_unaff_SS, MakeWord(UNK_extraout_AH_08, local_24), local_e, uStack_c, MakeWord(UNK_extraout_AH_08, $16), MakeWord(UNK_extraout_AH_08, $26), MakeWord(UNK_extraout_AH_08, 2), MakeWord(UNK_extraout_AH_08, 1), MakeWord(UNK_extraout_AH_08, $F), MakeWord(UNK_extraout_AH_08, 10), MakeWord(UNK_extraout_AH_08, $D), iVar7, uVar9, iVar3, uVar13); { 7000:0B60 }
    if (local_18 = $0) then begin { 7000:0B60; region anchor, exact origin unknown }
      Exit; { 7000:0B60; region anchor, exact origin unknown }
    end; { 7000:0B60; region anchor, exact origin unknown }
  until not ((local_18 <> $D)); { 7000:0B60; region anchor, exact origin unknown }
  uVar8 := Word((LongWord(local_6) shr $10)); { 7000:0B60; region anchor, exact origin unknown }
  piVar6 := Ptr<SmallInt>(local_6); { 7000:0B60; region anchor, exact origin unknown }
  local_29 := local_6; { 7000:0B7A }
  (Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^ := Ptr<UnknownValue>(@g_3E17)[((ShortInt(piVar6[$17]) * $C) + local_14)]; { 7000:0B7A; region anchor, exact origin unknown }
  (Ptr<ShortInt>((SmallInt(piVar6) + $73)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
  cVar1 := (Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^; { 7000:0B7A; region anchor, exact origin unknown }
  if ((cVar1 < $0) or else ($7 < cVar1)) then begin { 7000:0B7A; region anchor, exact origin unknown }
    if (cVar1 = $8) then begin { 7000:0B7A; region anchor, exact origin unknown }
      (Ptr<ShortInt>((piVar6 + $4B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
      (Ptr<ShortInt>((piVar6 + $4C)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
    end else begin { 7000:0B7A; region anchor, exact origin unknown }
      if (cVar1 = $9) then begin { 7000:0B7A; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + $4B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + $4C)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
        (Ptr<ShortInt>((SmallInt(piVar6) + $9B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
      end else begin { 7000:0B7A; region anchor, exact origin unknown }
        if (cVar1 = $A) then begin { 7000:0B7A; region anchor, exact origin unknown }
          (Ptr<ShortInt>((piVar6 + $4B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
          (Ptr<ShortInt>((piVar6 + $4D)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
        end else begin { 7000:0B7A; region anchor, exact origin unknown }
          if (cVar1 = $B) then begin { 7000:0B7A; region anchor, exact origin unknown }
            (Ptr<ShortInt>((piVar6 + $4B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
            (Ptr<ShortInt>((SmallInt(piVar6) + $9B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
          end else begin { 7000:0B7A; region anchor, exact origin unknown }
            if (cVar1 = $C) then begin { 7000:0B7A; region anchor, exact origin unknown }
              (Ptr<ShortInt>((piVar6 + $4B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
              (Ptr<ShortInt>((piVar6 + $4E)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
            end else begin { 7000:0B7A; region anchor, exact origin unknown }
              if (cVar1 = $D) then begin { 7000:0B7A; region anchor, exact origin unknown }
                (Ptr<ShortInt>((piVar6 + $4C)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                (Ptr<ShortInt>((SmallInt(piVar6) + $9B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
              end else begin { 7000:0B7A; region anchor, exact origin unknown }
                if (cVar1 = $E) then begin { 7000:0B7A; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((piVar6 + $4C)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((piVar6 + $4E)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                end else begin { 7000:0B7A; region anchor, exact origin unknown }
                  if (cVar1 = $F) then begin { 7000:0B7A; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((piVar6 + $4C)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((SmallInt(piVar6) + $9B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((piVar6 + $4E)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                  end else begin { 7000:0B7A; region anchor, exact origin unknown }
                    if (cVar1 = $10) then begin { 7000:0B7A; region anchor, exact origin unknown }
                      (Ptr<ShortInt>((SmallInt(piVar6) + $9B)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                      (Ptr<ShortInt>((piVar6 + $4E)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
                    end; { 7000:0B7A; region anchor, exact origin unknown }
                  end; { 7000:0B7A; region anchor, exact origin unknown }
                end; { 7000:0B7A; region anchor, exact origin unknown }
              end; { 7000:0B7A; region anchor, exact origin unknown }
            end; { 7000:0B7A; region anchor, exact origin unknown }
          end; { 7000:0B7A; region anchor, exact origin unknown }
        end; { 7000:0B7A; region anchor, exact origin unknown }
      end; { 7000:0B7A; region anchor, exact origin unknown }
    end; { 7000:0B7A; region anchor, exact origin unknown }
  end else begin { 7000:0B7A; region anchor, exact origin unknown }
    (Ptr<ShortInt>(((SmallInt(piVar6) + (Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^) + $96)))^ := $1; { 7000:0B7A; region anchor, exact origin unknown }
  end; { 7000:0B7A; region anchor, exact origin unknown }
  if ($0 < ShortInt(piVar6[$4E])) then begin { 7000:0B7A; region anchor, exact origin unknown }
    stub_ov23_e4(piVar6, uVar8); { 7000:0CC9 }
  end; { 7000:0CC9; region anchor, exact origin unknown }
  uVar8 := Word((LongWord(local_29) shr $10)); { 7000:0CC9; region anchor, exact origin unknown }
  piVar6 := Ptr<SmallInt>(local_29); { 7000:0CC9; region anchor, exact origin unknown }
  (Ptr<ShortInt>((piVar6 + $58)))^ := $0; { 7000:0CC9; region anchor, exact origin unknown }
  (Ptr<ShortInt>((SmallInt(piVar6) + $2D)))^ := $0; { 7000:0CC9; region anchor, exact origin unknown }
  local_1b := $0; { 7000:0CDF }
  while true do begin { 7000:0CDF; region anchor, exact origin unknown }
    if ($0 < (Ptr<ShortInt>(((SmallInt(piVar6) + local_1b) + $96)))^) then begin { 7000:0CDF; region anchor, exact origin unknown }
      if ((Ptr<Byte>((SmallInt(piVar6) + $2D)))^ < Byte(Ptr<UnknownValue>(@g_3C7C)[((local_1b * $B) + SmallInt((Ptr<ShortInt>(((SmallInt(piVar6) + local_1b) + $96)))^))])) then begin { 7000:0CDF; region anchor, exact origin unknown }
        (Ptr<ShortInt>((SmallInt(piVar6) + $2D)))^ := Ptr<UnknownValue>(@g_3C7C)[((local_1b * $B) + SmallInt((Ptr<ShortInt>(((SmallInt(piVar6) + local_1b) + $96)))^))]; { 7000:0CDF; region anchor, exact origin unknown }
      end; { 7000:0CDF; region anchor, exact origin unknown }
      (Ptr<ShortInt>((piVar6 + $58)))^ := (ShortInt(piVar6[$58]) + (Ptr<ShortInt>((local_1b + $5D6)))^); { 7000:0CDF; region anchor, exact origin unknown }
    end; { 7000:0CDF; region anchor, exact origin unknown }
    if (local_1b = $7) then begin { 7000:0CDF; region anchor, exact origin unknown }
      Break; { 7000:0CDF; region anchor, exact origin unknown }
    end; { 7000:0CDF; region anchor, exact origin unknown }
    local_1b := (local_1b + $1); { 7000:0CE5 }
  end; { 7000:0CE5; region anchor, exact origin unknown }
  stub_ov23_e3(Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:0D6B }
  stub_ov25_e7(@local_e, UNK_unaff_SS); { 7000:0D75 }
  local_1e := Ptr<UnknownValue>(@g_3FE7)[((Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_6)) + $2F)))^ * 10)]; { 7000:0D8D }
  stub_ov25_e6(@local_e, UNK_unaff_SS, (local_1e + 1)); { 7000:0D9C }
  uVar8 := Word((LongWord(_local_e) shr $10)); { 7000:0D9C; region anchor, exact origin unknown }
  (Ptr<Byte>((SmallInt(_local_e) + $29)))^ := 1; { 7000:0D9C; region anchor, exact origin unknown }
  PString(FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C)))) := Copy('Pick Alignment', 1, $28); { 7000:0DB7 }
  ExtractBytes(local_29, 3, 1) := local_1e; { 7000:0DB7; region anchor, exact origin unknown }
  if (local_1e <> 0) then begin { 7000:0DB7; region anchor, exact origin unknown }
    local_15 := 1; { 7000:0DC9 }
    while true do begin { 7000:0DC9; region anchor, exact origin unknown }
      uVar10 := stub_ov25_e1(local_e, uStack_c, local_15); { 7000:0DDD }
      puVar11 := @local_126; { 7000:0DDD; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7000:0DDD; region anchor, exact origin unknown }
      local_12 := uVar10; { 7000:0DE2 }
      PString(FarPtr(SS, BPAddr(-$124))) := '  '; { 7000:0DF3 }
      PString(FarPtr(SS, BPAddr(-$124))) := PString(FarPtr(SS, BPAddr(-$124))) + PString(FarPtr($C7C, ((ShortInt(Ptr<UnknownValue>(@g_3FE7)[(((Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_6)) + $2F)))^ * 10) + Word(local_15))]) * $11) + $F53))); { 7000:0E22 }
      StrAssign($28, local_12, puVar11, uVar8); { 7000:0E30 }
      if (local_15 = ExtractBytes(local_29, 3, 1)) then begin { 7000:0E30; region anchor, exact origin unknown }
        Break; { 7000:0E30; region anchor, exact origin unknown }
      end; { 7000:0E30; region anchor, exact origin unknown }
      local_15 := (local_15 + 1); { 7000:0DCE }
    end; { 7000:0DCE; region anchor, exact origin unknown }
  end; { 7000:0DCE; region anchor, exact origin unknown }
  uVar8 := $AF8; { 7000:0DCE; region anchor, exact origin unknown }
  local_14 := 1; { 7000:0E49 }
  local_24 := 1; { 7000:0E4E }
  local_25 := 1; { 7000:0E52 }
  repeat { 7000:0E52; region anchor, exact origin unknown }
    iVar3 := (SmallInt(@local_29) + 3); { 7000:0E52; region anchor, exact origin unknown }
    uVar13 := UNK_unaff_SS; { 7000:0E52; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$24))) := ''; { 7000:0E60 }
    iVar7 := (SmallInt(@local_29) + 2); { 7000:0E60; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:0E60; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$25))) := ''; { 7000:0E6F }
    uVar8 := $3C5; { 7000:0E6F; region anchor, exact origin unknown }
    local_18 := stub_ov25_e4(@local_12, UNK_unaff_SS, @local_14, UNK_unaff_SS, @local_25, UNK_unaff_SS, MakeWord(UNK_extraout_AH_09, local_24), local_e, uStack_c, MakeWord(UNK_extraout_AH_09, $16), MakeWord(UNK_extraout_AH_09, $26), MakeWord(UNK_extraout_AH_09, 2), MakeWord(UNK_extraout_AH_09, 1), MakeWord(UNK_extraout_AH_09, $F), MakeWord(UNK_extraout_AH_09, 10), MakeWord(UNK_extraout_AH_09, $D), iVar7, uVar9, iVar3, uVar13); { 7000:0EA2 }
    if (local_18 = $0) then begin { 7000:0EA2; region anchor, exact origin unknown }
      Exit; { 7000:0EA2; region anchor, exact origin unknown }
    end; { 7000:0EA2; region anchor, exact origin unknown }
  until not ((local_18 <> $D)); { 7000:0EA2; region anchor, exact origin unknown }
  uVar8 := Word((LongWord(local_6) shr $10)); { 7000:0EA2; region anchor, exact origin unknown }
  (Ptr<UnknownValue>((Ptr<SmallInt>(local_6) + $50)))^ := Ptr<UnknownValue>(@g_3FE7)[(((Ptr<ShortInt>((SmallInt(Ptr<SmallInt>(local_6)) + $2F)))^ * 10) + local_14)]; { 7000:0EA2; region anchor, exact origin unknown }
  stub_ov25_e7(@local_e, UNK_unaff_SS); { 7000:0EDE }
  uVar8 := Word((LongWord(local_6) shr $10)); { 7000:0EDE; region anchor, exact origin unknown }
  piVar6 := Ptr<SmallInt>(local_6); { 7000:0EDE; region anchor, exact origin unknown }
  if ((Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^ < $8) then begin { 7000:0EDE; region anchor, exact origin unknown }
    iVar3 := (ShortInt(piVar6[$17]) * $1C); { 7000:0EDE; region anchor, exact origin unknown }
    iVar7 := (iVar3 + ((Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^ * 4)); { 7000:0EDE; region anchor, exact origin unknown }
    local_29 := Ptr<SmallInt>(MakeLong($C7C, (Ptr<UnknownValue>(@g_3E5B) + iVar7))); { 7000:0F10 }
    uVar4 := Byte((Word(iVar3) shr 8)); { 7000:0F10; region anchor, exact origin unknown }
    uVar2 := stub_ov24_e8(MakeWord(uVar4, Ptr<UnknownValue>(@g_3E5E)[iVar7]), MakeWord(uVar4, Ptr<UnknownValue>(@g_3E5D)[iVar7])); { 7000:0F26 }
    Ptr<SmallInt>(local_6)[$18] := ((uVar2 and $FF) + (local_29)^); { 7000:0F26; region anchor, exact origin unknown }
  end else begin { 7000:0F26; region anchor, exact origin unknown }
    local_29 := local_6; { 7000:0F40 }
    cVar1 := (Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^; { 7000:0F40; region anchor, exact origin unknown }
    if (cVar1 = $8) then begin { 7000:0F40; region anchor, exact origin unknown }
      piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E5B) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E5E)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E5D)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
    end else begin { 7000:0F40; region anchor, exact origin unknown }
      if (cVar1 = $9) then begin { 7000:0F40; region anchor, exact origin unknown }
        piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E5B) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E5E)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E5D)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
      end else begin { 7000:0F40; region anchor, exact origin unknown }
        if (cVar1 = $B) then begin { 7000:0F40; region anchor, exact origin unknown }
          piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E5B) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E5E)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E5D)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
        end else begin { 7000:0F40; region anchor, exact origin unknown }
          if (cVar1 = $C) then begin { 7000:0F40; region anchor, exact origin unknown }
            piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E5B) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E5E)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E5D)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
          end else begin { 7000:0F40; region anchor, exact origin unknown }
            if (cVar1 = $D) then begin { 7000:0F40; region anchor, exact origin unknown }
              piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E6F) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E72)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E71)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
            end else begin { 7000:0F40; region anchor, exact origin unknown }
              if (cVar1 = $E) then begin { 7000:0F40; region anchor, exact origin unknown }
                piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E63) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E66)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E65)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
              end else begin { 7000:0F40; region anchor, exact origin unknown }
                if (cVar1 = $F) then begin { 7000:0F40; region anchor, exact origin unknown }
                  piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E6F) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E72)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E71)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
                end else begin { 7000:0F40; region anchor, exact origin unknown }
                  if (cVar1 = $10) then begin { 7000:0F40; region anchor, exact origin unknown }
                    piVar6[$18] := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E6F) + (ShortInt(piVar6[$17]) * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E72)[(ShortInt(piVar6[$17]) * $1C)])) * Word(Byte(Ptr<UnknownValue>(@g_3E71)[(ShortInt(piVar6[$17]) * $1C)])))); { 7000:0F40; region anchor, exact origin unknown }
                  end; { 7000:0F40; region anchor, exact origin unknown }
                end; { 7000:0F40; region anchor, exact origin unknown }
              end; { 7000:0F40; region anchor, exact origin unknown }
            end; { 7000:0F40; region anchor, exact origin unknown }
          end; { 7000:0F40; region anchor, exact origin unknown }
        end; { 7000:0F40; region anchor, exact origin unknown }
      end; { 7000:0F40; region anchor, exact origin unknown }
    end; { 7000:0F40; region anchor, exact origin unknown }
  end; { 7000:0F40; region anchor, exact origin unknown }
  uStack_a := g_5D92; { 7000:0F40; region anchor, exact origin unknown }
  uStack_8 := g_5D94; { 7000:0F40; region anchor, exact origin unknown }
  g_5D92 := Ptr<SmallInt>(local_6); { 7000:0F40; region anchor, exact origin unknown }
  g_5D94 := ExtractBytes(local_6, 2, 2); { 7000:0F40; region anchor, exact origin unknown }
  stub_ov19_e1(); { 7000:0F40; region anchor, exact origin unknown }
  repeat { 7000:0F40; region anchor, exact origin unknown }
    (Ptr<ShortInt>((Ptr<SmallInt>(local_6) + $B)))^ := $0; { 7000:0F40; region anchor, exact origin unknown }
    cStack_1d := $0; { 7000:0F40; region anchor, exact origin unknown }
    while true do begin { 7000:0F40; region anchor, exact origin unknown }
      iVar3 := SmallInt(cStack_1d); { 7000:0F40; region anchor, exact origin unknown }
      (Ptr<ShortInt>(((SmallInt(Ptr<SmallInt>(local_6)) + iVar3) + $10)))^ := $0; { 7000:0F40; region anchor, exact origin unknown }
      cStack_16 := $1; { 7000:0F40; region anchor, exact origin unknown }
      while true do begin { 7000:0F40; region anchor, exact origin unknown }
        uVar4 := Byte((Word(iVar3) shr 8)); { 7000:0F40; region anchor, exact origin unknown }
        bStack_17 := stub_ov24_e8(MakeWord(uVar4, 6), MakeWord(uVar4, 3)); { 7000:0F40; region anchor, exact origin unknown }
        if (local_19 = $1) then begin { 7000:0F40; region anchor, exact origin unknown }
          if (cStack_1d = $4) then begin { 7000:0F40; region anchor, exact origin unknown }
            bStack_17 := (bStack_17 + 1); { 7000:0F40; region anchor, exact origin unknown }
          end else begin { 7000:0F40; region anchor, exact origin unknown }
            if (cStack_1d = $5) then begin { 7000:0F40; region anchor, exact origin unknown }
              bStack_17 := (bStack_17 - 1); { 7000:0F40; region anchor, exact origin unknown }
            end; { 7000:0F40; region anchor, exact origin unknown }
          end; { 7000:0F40; region anchor, exact origin unknown }
        end else begin { 7000:0F40; region anchor, exact origin unknown }
          if (local_19 = $2) then begin { 7000:0F40; region anchor, exact origin unknown }
            if (cStack_1d = $3) then begin { 7000:0F40; region anchor, exact origin unknown }
              bStack_17 := (bStack_17 + 1); { 7000:0F40; region anchor, exact origin unknown }
            end else begin { 7000:0F40; region anchor, exact origin unknown }
              if (cStack_1d = $4) then begin { 7000:0F40; region anchor, exact origin unknown }
                bStack_17 := (bStack_17 - 1); { 7000:0F40; region anchor, exact origin unknown }
              end; { 7000:0F40; region anchor, exact origin unknown }
            end; { 7000:0F40; region anchor, exact origin unknown }
          end else begin { 7000:0F40; region anchor, exact origin unknown }
            if (local_19 = $5) then begin { 7000:0F40; region anchor, exact origin unknown }
              if (cStack_1d = $0) then begin { 7000:0F40; region anchor, exact origin unknown }
                bStack_17 := (bStack_17 - 1); { 7000:0F40; region anchor, exact origin unknown }
              end else begin { 7000:0F40; region anchor, exact origin unknown }
                if (cStack_1d = $3) then begin { 7000:0F40; region anchor, exact origin unknown }
                  bStack_17 := (bStack_17 + 1); { 7000:0F40; region anchor, exact origin unknown }
                end; { 7000:0F40; region anchor, exact origin unknown }
              end; { 7000:0F40; region anchor, exact origin unknown }
            end else begin { 7000:0F40; region anchor, exact origin unknown }
              if (local_19 = $6) then begin { 7000:0F40; region anchor, exact origin unknown }
                if (cStack_1d = $0) then begin { 7000:0F40; region anchor, exact origin unknown }
                  bStack_17 := (bStack_17 + 1); { 7000:0F40; region anchor, exact origin unknown }
                end else begin { 7000:0F40; region anchor, exact origin unknown }
                  if (cStack_1d = $4) then begin { 7000:0F40; region anchor, exact origin unknown }
                    bStack_17 := (bStack_17 + 1); { 7000:0F40; region anchor, exact origin unknown }
                  end else begin { 7000:0F40; region anchor, exact origin unknown }
                    if (cStack_1d = $5) then begin { 7000:0F40; region anchor, exact origin unknown }
                      bStack_17 := (bStack_17 - 2); { 7000:0F40; region anchor, exact origin unknown }
                    end; { 7000:0F40; region anchor, exact origin unknown }
                  end; { 7000:0F40; region anchor, exact origin unknown }
                end; { 7000:0F40; region anchor, exact origin unknown }
              end; { 7000:0F40; region anchor, exact origin unknown }
            end; { 7000:0F40; region anchor, exact origin unknown }
          end; { 7000:0F40; region anchor, exact origin unknown }
        end; { 7000:0F40; region anchor, exact origin unknown }
        uVar8 := Word((LongWord(local_6) shr $10)); { 7000:0F40; region anchor, exact origin unknown }
        piVar6 := Ptr<SmallInt>(local_6); { 7000:0F40; region anchor, exact origin unknown }
        bVar5 := (Ptr<Byte>(((SmallInt(piVar6) + cStack_1d) + $10)))^; { 7000:0F40; region anchor, exact origin unknown }
        iVar3 := MakeWord((cStack_1d shr 7), bVar5); { 7000:0F40; region anchor, exact origin unknown }
        if (bVar5 < bStack_17) then begin { 7000:0F40; region anchor, exact origin unknown }
          iVar3 := SmallInt(cStack_1d); { 7000:0F40; region anchor, exact origin unknown }
          (Ptr<Byte>(((SmallInt(piVar6) + iVar3) + $10)))^ := bStack_17; { 7000:0F40; region anchor, exact origin unknown }
        end; { 7000:0F40; region anchor, exact origin unknown }
        if (cStack_16 = $6) then begin { 7000:0F40; region anchor, exact origin unknown }
          Break; { 7000:0F40; region anchor, exact origin unknown }
        end; { 7000:0F40; region anchor, exact origin unknown }
        cStack_16 := (cStack_16 + $1); { 7000:0F40; region anchor, exact origin unknown }
      end; { 7000:0F40; region anchor, exact origin unknown }
      local_29 := local_6; { 7000:0596 }
      if (cStack_1d <> $0) then begin { 7000:0596; region anchor, exact origin unknown }
        FUN_7000_1551(); { 7000:0596; region anchor, exact origin unknown }
        Exit; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if ((ShortInt(piVar6[8]) <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F31) + (ShortInt(piVar6[$17]) * 10))))^ < Word(piVar6[$18]))) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + 8)))^ := (ShortInt(piVar6[8]) + $1); { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if ((ShortInt(piVar6[8]) <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + (ShortInt(piVar6[$17]) * 10))))^ < Word(piVar6[$18]))) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + 8)))^ := (ShortInt(piVar6[8]) + (-1)); { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if ((ShortInt(piVar6[8]) <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + (ShortInt(piVar6[$17]) * 10))))^ < Word(piVar6[$18]))) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + 8)))^ := (ShortInt(piVar6[8]) + (-2)); { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if ((ShortInt(piVar6[8]) <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + (ShortInt(piVar6[$17]) * 10))))^ < Word(piVar6[$18]))) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + 8)))^ := (ShortInt(piVar6[8]) + (-1)); { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if ((Ptr<Byte>((piVar6 + 8)))^ < Byte(Ptr<UnknownValue>(@g_3DA3)[((ShortInt(piVar6[$17]) * $10) + SmallInt(ShortInt(piVar6[$4F])))])) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<UnknownValue>((piVar6 + 8)))^ := Ptr<UnknownValue>(@g_3DA3)[((ShortInt(piVar6[$17]) * $10) + SmallInt(ShortInt(piVar6[$4F])))]; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if (Byte(Ptr<UnknownValue>(@g_3DA5)[((ShortInt(piVar6[$17]) * $10) + SmallInt(ShortInt(piVar6[$4F])))]) < (Ptr<Byte>((piVar6 + 8)))^) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<UnknownValue>((piVar6 + 8)))^ := Ptr<UnknownValue>(@g_3DA5)[((ShortInt(piVar6[$17]) * $10) + SmallInt(ShortInt(piVar6[$4F])))]; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if ((Ptr<Byte>((piVar6 + 8)))^ < Byte(Ptr<UnknownValue>(@g_3F81)[((Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^ * 6)])) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<UnknownValue>((piVar6 + 8)))^ := Ptr<UnknownValue>(@g_3F81)[((Ptr<ShortInt>((SmallInt(piVar6) + $2F)))^ * 6)]; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      bVar5 := 0; { 7000:0596; region anchor, exact origin unknown }
      if ((ShortInt(piVar6[8]) = $12) and then ($0 < ShortInt(piVar6[$4C]))) then begin { 7000:0596; region anchor, exact origin unknown }
        cVar1 := Random(100); { 7000:0596; region anchor, exact origin unknown }
        uVar8 := Word((LongWord(local_29) shr $10)); { 7000:0596; region anchor, exact origin unknown }
        piVar6 := Ptr<SmallInt>(local_29); { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + $B)))^ := (cVar1 + $1); { 7000:0596; region anchor, exact origin unknown }
        bVar5 := (ShortInt(piVar6[$17]) shr 7); { 7000:0596; region anchor, exact origin unknown }
        if (Byte(Ptr<UnknownValue>(@g_3DA7)[((ShortInt(piVar6[$17]) * $10) + SmallInt(ShortInt(piVar6[$4F])))]) < (Ptr<Byte>((piVar6 + $B)))^) then begin { 7000:0596; region anchor, exact origin unknown }
          bVar5 := (ShortInt(piVar6[$17]) shr 7); { 7000:0596; region anchor, exact origin unknown }
          (Ptr<UnknownValue>((piVar6 + $B)))^ := Ptr<UnknownValue>(@g_3DA7)[((ShortInt(piVar6[$17]) * $10) + SmallInt(ShortInt(piVar6[$4F])))]; { 7000:0596; region anchor, exact origin unknown }
        end; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      stub_ov19_e3((Word(bVar5) shl 8), MakeWord(bVar5, cStack_1d)); { 7000:0596; region anchor, exact origin unknown }
      if (cStack_1d = $5) then begin { 7000:0596; region anchor, exact origin unknown }
        Break; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      cStack_1d := (cStack_1d + $1); { 7000:0596; region anchor, exact origin unknown }
    end; { 7000:0596; region anchor, exact origin unknown }
    uVar8 := Word((LongWord(local_6) shr $10)); { 7000:0596; region anchor, exact origin unknown }
    piVar6 := Ptr<SmallInt>(local_6); { 7000:0596; region anchor, exact origin unknown }
    local_29 := local_6; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((SmallInt(piVar6) + $11B)))^ := ShortInt(piVar6[$19]); { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((SmallInt(piVar6) + $A1)))^ := $2; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((SmallInt(piVar6) + $A3)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((SmallInt(piVar6) + $A5)))^ := $2; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((piVar6 + $55)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((piVar6 + $39)))^ := $C; { 7000:0596; region anchor, exact origin unknown }
    bStack_23 := 0; { 7000:0596; region anchor, exact origin unknown }
    bStack_22 := 0; { 7000:0596; region anchor, exact origin unknown }
    local_1b := $0; { 7000:0596; region anchor, exact origin unknown }
    while true do begin { 7000:0596; region anchor, exact origin unknown }
      uVar8 := Word((LongWord(local_29) shr $10)); { 7000:0596; region anchor, exact origin unknown }
      piVar6 := Ptr<SmallInt>(local_29); { 7000:0596; region anchor, exact origin unknown }
      if ($0 < (Ptr<ShortInt>(((SmallInt(piVar6) + local_1b) + $96)))^) then begin { 7000:0596; region anchor, exact origin unknown }
        if (local_1b = $0) then begin { 7000:0596; region anchor, exact origin unknown }
          (Ptr<ShortInt>((piVar6 + $59)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
        end else begin { 7000:0596; region anchor, exact origin unknown }
          if (local_1b = $5) then begin { 7000:0596; region anchor, exact origin unknown }
            (Ptr<ShortInt>((SmallInt(piVar6) + $B5)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
          end; { 7000:0596; region anchor, exact origin unknown }
        end; { 7000:0596; region anchor, exact origin unknown }
        cVar1 := stub_ov24_e8(MakeWord((local_1b shr 7), Ptr<UnknownValue>(@g_4264)[(local_1b * 2)]), MakeWord((local_1b shr 7), Ptr<UnknownValue>(@g_4263)[(local_1b * 2)])); { 7000:0596; region anchor, exact origin unknown }
        bStack_23 := (bStack_23 + cVar1); { 7000:0596; region anchor, exact origin unknown }
        bStack_22 := (bStack_22 + 1); { 7000:0596; region anchor, exact origin unknown }
        if (local_1b = $0) then begin { 7000:0596; region anchor, exact origin unknown }
          stub_ov23_e2(Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:0596; region anchor, exact origin unknown }
          local_15 := 1; { 7000:0596; region anchor, exact origin unknown }
          while true do begin { 7000:0596; region anchor, exact origin unknown }
            uStack_2d := Ptr<ShortInt>(MakeLong($C7C, (Ptr<UnknownValue>(@g_31FA) + (Word(local_15) * $10)))); { 7000:0596; region anchor, exact origin unknown }
            if (((uStack_2d)^ = $0) and then (Ptr<UnknownValue>(@g_31FB)[(Word(local_15) * $10)] = $1)) then begin { 7000:0596; region anchor, exact origin unknown }
              (Ptr<ShortInt>(((SmallInt(Ptr<SmallInt>(local_29)) + local_15) + $32)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
            end; { 7000:0596; region anchor, exact origin unknown }
            if (local_15 = $38) then begin { 7000:0596; region anchor, exact origin unknown }
              Break; { 7000:0596; region anchor, exact origin unknown }
            end; { 7000:0596; region anchor, exact origin unknown }
            local_15 := (local_15 + 1); { 7000:0596; region anchor, exact origin unknown }
          end; { 7000:0596; region anchor, exact origin unknown }
        end else begin { 7000:0596; region anchor, exact origin unknown }
          if (local_1b = $5) then begin { 7000:0596; region anchor, exact origin unknown }
            uVar8 := Word((LongWord(local_29) shr $10)); { 7000:0596; region anchor, exact origin unknown }
            piVar6 := Ptr<SmallInt>(local_29); { 7000:0596; region anchor, exact origin unknown }
            (Ptr<ShortInt>((SmallInt(piVar6) + $3D)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
            (Ptr<ShortInt>((piVar6 + $22)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
            (Ptr<ShortInt>((SmallInt(piVar6) + $45)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
            (Ptr<ShortInt>((SmallInt(piVar6) + $47)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
          end; { 7000:0596; region anchor, exact origin unknown }
        end; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      if (local_1b = $7) then begin { 7000:0596; region anchor, exact origin unknown }
        Break; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
      local_1b := (local_1b + $1); { 7000:0596; region anchor, exact origin unknown }
    end; { 7000:0596; region anchor, exact origin unknown }
    uVar2 := ((Word(bStack_23) * 10) div Word(bStack_22)); { 7000:0596; region anchor, exact origin unknown }
    Ptr<SmallInt>(local_29)[$47] := uVar2; { 7000:0596; region anchor, exact origin unknown }
    cVar1 := FUN_7000_4235(MakeWord(ShortInt((uVar2 shr 8)), $FF), Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:0596; region anchor, exact origin unknown }
    uVar8 := Word((LongWord(local_29) shr $10)); { 7000:0596; region anchor, exact origin unknown }
    piVar6 := Ptr<SmallInt>(local_29); { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((SmallInt(piVar6) + $B1)))^ := cVar1; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((piVar6 + $19)))^ := (Ptr<ShortInt>((SmallInt(piVar6) + $B1)))^; { 7000:0596; region anchor, exact origin unknown }
    cVar1 := FUN_7000_3f31(Ptr<SmallInt>(local_6), ExtractBytes(local_6, 2, 2)); { 7000:0596; region anchor, exact origin unknown }
    uStack_20 := Word(cVar1); { 7000:0596; region anchor, exact origin unknown }
    piVar6 := Ptr<SmallInt>(local_29); { 7000:0596; region anchor, exact origin unknown }
    uVar8 := Word((LongWord(local_29) shr $10)); { 7000:0596; region anchor, exact origin unknown }
    if (SmallInt(uStack_20) < 0) then begin { 7000:0596; region anchor, exact origin unknown }
      if (SmallInt((((uStack_20 xor (SmallInt(uStack_20) shr $F)) - (SmallInt(uStack_20) shr $F)) + Word(bStack_22))) < SmallInt(Word((Ptr<Byte>((piVar6 + $19)))^))) then begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + $19)))^ := ShortInt((SmallInt(((Ptr<Byte>((piVar6 + $19)))^ + uStack_20)) div SmallInt(Word(bStack_22)))); { 7000:0596; region anchor, exact origin unknown }
      end else begin { 7000:0596; region anchor, exact origin unknown }
        (Ptr<ShortInt>((piVar6 + $19)))^ := $1; { 7000:0596; region anchor, exact origin unknown }
      end; { 7000:0596; region anchor, exact origin unknown }
    end else begin { 7000:0596; region anchor, exact origin unknown }
      (Ptr<ShortInt>((piVar6 + $19)))^ := ShortInt((SmallInt(((Ptr<Byte>((piVar6 + $19)))^ + uStack_20)) div SmallInt(Word(bStack_22)))); { 7000:0596; region anchor, exact origin unknown }
    end; { 7000:0596; region anchor, exact origin unknown }
    (Ptr<ShortInt>((SmallInt(piVar6) + $11B)))^ := ShortInt(piVar6[$19]); { 7000:0596; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(piVar6) + $B1)))^ := ((Ptr<Byte>((SmallInt(piVar6) + $B1)))^ div bStack_22); { 7000:0596; region anchor, exact origin unknown }
    stub_ov19_e2(); { 7000:0596; region anchor, exact origin unknown }
    stub_ov19_e4(); { 7000:0596; region anchor, exact origin unknown }
    puVar11 := auStack_3b; { 7000:0596; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7000:0596; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := PString(FarPtr($85, $545)); { 7000:0596; region anchor, exact origin unknown }
    local_18 := stub_ov25_e5(MakeWord(UNK_extraout_AH_10, $F), MakeWord(UNK_extraout_AH_10, 10), MakeWord(UNK_extraout_AH_10, $D), puVar11, uVar8); { 7000:077A }
    if (local_18 = $59) then begin { 7000:077A; region anchor, exact origin unknown }
      uVar8 := $85; { 7000:077A; region anchor, exact origin unknown }
      stub_ov19_e1(); { 7000:077A; region anchor, exact origin unknown }
      g_5D92 := Ptr<SmallInt>(uStack_a); { 7000:077A; region anchor, exact origin unknown }
      g_5D94 := uStack_8; { 7000:077A; region anchor, exact origin unknown }
      repeat { 7000:077A; region anchor, exact origin unknown }
        puVar12 := auStack_136; { 7000:077A; region anchor, exact origin unknown }
        puVar11 := auStack_36; { 7000:077A; region anchor, exact origin unknown }
        uVar9 := UNK_unaff_SS; { 7000:077A; region anchor, exact origin unknown }
        uVar13 := UNK_unaff_SS; { 7000:077A; region anchor, exact origin unknown }
        PString(UNK_hidden_string_result) := PString(FarPtr(uVar8, $55B)); { 7000:077A; region anchor, exact origin unknown }
        FUN_0709_09e3(MakeWord(UNK_extraout_AH_11, $F), MakeWord(UNK_extraout_AH_11, $D), puVar11, uVar9); { 7000:077A; region anchor, exact origin unknown }
        uVar8 := $AF8; { 7000:077A; region anchor, exact origin unknown }
        PString(FarPtr(SmallInt((LongWord(local_6) shr $10)), Ptr<SmallInt>(local_6))) := Copy(PString(FarPtr(uVar13, puVar12)), 1, $F); { 7000:077A; region anchor, exact origin unknown }
      until not ((ShortInt((local_6)^) = $0)); { 7000:077A; region anchor, exact origin unknown }
      uStack_a := g_5D92; { 7000:077A; region anchor, exact origin unknown }
      uStack_8 := g_5D94; { 7000:077A; region anchor, exact origin unknown }
      g_5D92 := Ptr<SmallInt>(local_6); { 7000:077A; region anchor, exact origin unknown }
      g_5D94 := ExtractBytes(local_6, 2, 2); { 7000:077A; region anchor, exact origin unknown }
      FUN_7000_33e7(); { 7000:077A; region anchor, exact origin unknown }
      ov16_382D(); { 7000:077A; region anchor, exact origin unknown }
      iVar3 := (SmallInt(@local_29) + 3); { 7000:077A; region anchor, exact origin unknown }
      piVar6 := Ptr<SmallInt>(local_6); { 7000:077A; region anchor, exact origin unknown }
      uVar8 := ExtractBytes(local_6, 2, 2); { 7000:077A; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := PString(FarPtr($AF8, $4FE)); { 7000:077A; region anchor, exact origin unknown }
      stub_ov17_e4(iVar3, UNK_unaff_SS, piVar6, uVar8); { 7000:077A; region anchor, exact origin unknown }
      g_5D92 := Ptr<SmallInt>(uStack_a); { 7000:077A; region anchor, exact origin unknown }
      g_5D94 := uStack_8; { 7000:077A; region anchor, exact origin unknown }
      FreeMem(FarPtr(ExtractBytes(local_6, 2, 2), Ptr<SmallInt>(local_6)), $11D); { 7000:077A; region anchor, exact origin unknown }
      Exit; { 7000:077A; region anchor, exact origin unknown }
    end; { 7000:077A; region anchor, exact origin unknown }
  until not (true); { 7000:077A; region anchor, exact origin unknown }
end;
```

### ov16:1156 CreationSharedFramePart1 (conf M)

Original `FUN_7000_1156`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -27:2, -25:2, -1B:1, -17:1, -15:1, -14:1, -8:2, -6:2, -4:2, -2:2.
Locals/SSA temporaries: pcVar1: ^ShortInt; uVar2: LongWord; uVar3: Byte; cVar4: ShortInt; in_AX: Word; iVar5: SmallInt; bVar7: Byte; uVar6: Word; extraout_AH: Byte; extraout_AH_00: Byte; unaff_BP: SmallInt; uVar8: Word; unaff_SS: Word; uVar9: Word; uVar10: Word; iVar11: SmallInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): stub_ov19_e1, stub_ov24_e8.

Decompiler split/shared parent BP frame; not an independent recovered procedure. Evidence: decode/listings/ov16.lst at 7000:1156, paired .c.

```pascal
procedure FUN_7000_1156();
begin
  (Ptr<SmallInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^ := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_3E6F) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $1C))))^ + (Word(Byte(Ptr<UnknownValue>(@g_3E72)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $1C)])) * (UNK_in_AX and $FF))); { 7000:1156; region anchor, exact origin unknown }
  (Ptr<Word>((UNK_unaff_BP + (-8))))^ := g_5D92; { 7000:1156; region anchor, exact origin unknown }
  (Ptr<Word>((UNK_unaff_BP + (-6))))^ := g_5D94; { 7000:1156; region anchor, exact origin unknown }
  g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:11F4 }
  g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:11F7 }
  stub_ov19_e1(); { 7000:11FB }
  repeat { 7000:11FB; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + $16)))^ := 0; { 7000:11FB; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$1B))))^ := 0; { 7000:11FB; region anchor, exact origin unknown }
    while true do begin { 7000:11FB; region anchor, exact origin unknown }
      iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:11FB; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + iVar5) + $10)))^ := 0; { 7000:11FB; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$14))))^ := 1; { 7000:11FB; region anchor, exact origin unknown }
      while true do begin { 7000:11FB; region anchor, exact origin unknown }
        uVar3 := Byte((Word(iVar5) shr 8)); { 7000:11FB; region anchor, exact origin unknown }
        uVar3 := stub_ov24_e8(MakeWord(uVar3, 6), MakeWord(uVar3, 3)); { 7000:122E }
        (Ptr<Byte>((UNK_unaff_BP + (-$15))))^ := uVar3; { 7000:122E; region anchor, exact origin unknown }
        cVar4 := (Ptr<ShortInt>((UNK_unaff_BP + (-$17))))^; { 7000:122E; region anchor, exact origin unknown }
        if (cVar4 = $1) then begin { 7000:122E; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $4) then begin { 7000:122E; region anchor, exact origin unknown }
            (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
          end else begin { 7000:122E; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $5) then begin { 7000:122E; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:122E; region anchor, exact origin unknown }
            end; { 7000:122E; region anchor, exact origin unknown }
          end; { 7000:122E; region anchor, exact origin unknown }
        end else begin { 7000:122E; region anchor, exact origin unknown }
          if (cVar4 = $2) then begin { 7000:122E; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $3) then begin { 7000:122E; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
            end else begin { 7000:122E; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $4) then begin { 7000:122E; region anchor, exact origin unknown }
                (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:122E; region anchor, exact origin unknown }
              end; { 7000:122E; region anchor, exact origin unknown }
            end; { 7000:122E; region anchor, exact origin unknown }
          end else begin { 7000:122E; region anchor, exact origin unknown }
            if (cVar4 = $5) then begin { 7000:122E; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $0) then begin { 7000:122E; region anchor, exact origin unknown }
                (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:122E; region anchor, exact origin unknown }
              end else begin { 7000:122E; region anchor, exact origin unknown }
                if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $3) then begin { 7000:122E; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
                end; { 7000:122E; region anchor, exact origin unknown }
              end; { 7000:122E; region anchor, exact origin unknown }
            end else begin { 7000:122E; region anchor, exact origin unknown }
              if (cVar4 = $6) then begin { 7000:122E; region anchor, exact origin unknown }
                cVar4 := (Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^; { 7000:122E; region anchor, exact origin unknown }
                if (cVar4 = $0) then begin { 7000:122E; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
                end else begin { 7000:122E; region anchor, exact origin unknown }
                  if (cVar4 = $4) then begin { 7000:122E; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
                  end else begin { 7000:122E; region anchor, exact origin unknown }
                    if (cVar4 = $5) then begin { 7000:122E; region anchor, exact origin unknown }
                      (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-2)); { 7000:122E; region anchor, exact origin unknown }
                    end; { 7000:122E; region anchor, exact origin unknown }
                  end; { 7000:122E; region anchor, exact origin unknown }
                end; { 7000:122E; region anchor, exact origin unknown }
              end; { 7000:122E; region anchor, exact origin unknown }
            end; { 7000:122E; region anchor, exact origin unknown }
          end; { 7000:122E; region anchor, exact origin unknown }
        end; { 7000:122E; region anchor, exact origin unknown }
        bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:122E; region anchor, exact origin unknown }
        iVar5 := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:122E; region anchor, exact origin unknown }
        if (bVar7 < (Ptr<Byte>((UNK_unaff_BP + (-$15))))^) then begin { 7000:122E; region anchor, exact origin unknown }
          iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:122E; region anchor, exact origin unknown }
          (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + iVar5) + $10)))^ := (Ptr<Byte>((UNK_unaff_BP + (-$15))))^; { 7000:122E; region anchor, exact origin unknown }
        end; { 7000:122E; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ = $6) then begin { 7000:122E; region anchor, exact origin unknown }
          Break; { 7000:122E; region anchor, exact origin unknown }
        end; { 7000:122E; region anchor, exact origin unknown }
        (Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      uVar2 := (Ptr<LongWord>((UNK_unaff_BP + (-4))))^; { 7000:122E; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-$27))))^ := SmallInt(uVar2); { 7000:122E; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-$25))))^ := SmallInt((LongWord(uVar2) shr $10)); { 7000:122E; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ <> $0) then begin { 7000:122E; region anchor, exact origin unknown }
        FUN_7000_1551(); { 7000:122E; region anchor, exact origin unknown }
        Exit; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F31) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:122E; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:122E; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + $1); { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:122E; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:122E; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:122E; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:122E; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + (-2)); { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:122E; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:122E; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))])) then begin { 7000:122E; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if (Byte(Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:122E; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:122E; region anchor, exact origin unknown }
      iVar5 := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:122E; region anchor, exact origin unknown }
      if (bVar7 < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:122E; region anchor, exact origin unknown }
        iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:122E; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + iVar5) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      bVar7 := Byte((Word(iVar5) shr 8)); { 7000:122E; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $10)))^ = $12) and then ($0 < (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $98)))^)) then begin { 7000:122E; region anchor, exact origin unknown }
        cVar4 := Random(100); { 7000:122E; region anchor, exact origin unknown }
        (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^ := (cVar4 + $1); { 7000:122E; region anchor, exact origin unknown }
        cVar4 := (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^; { 7000:122E; region anchor, exact origin unknown }
        bVar7 := (cVar4 shr 7); { 7000:122E; region anchor, exact origin unknown }
        if (Byte(Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]) < (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^) then begin { 7000:122E; region anchor, exact origin unknown }
          cVar4 := (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^; { 7000:122E; region anchor, exact origin unknown }
          bVar7 := (cVar4 shr 7); { 7000:122E; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^ := Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:122E; region anchor, exact origin unknown }
        end; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      stub_ov19_e3((Word(bVar7) shl 8), MakeWord(bVar7, (Ptr<Byte>((UNK_unaff_BP + (-$1B))))^)); { 7000:122E; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $5) then begin { 7000:122E; region anchor, exact origin unknown }
        Break; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      (Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
    end; { 7000:122E; region anchor, exact origin unknown }
    uVar2 := (Ptr<LongWord>((UNK_unaff_BP + (-4))))^; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Word>((UNK_unaff_BP + (-$27))))^ := SmallInt(uVar2); { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Word>((UNK_unaff_BP + (-$25))))^ := SmallInt((LongWord(uVar2) shr $10)); { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $11B)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A1)))^ := 2; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A3)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A5)))^ := 2; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $AA)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $72)))^ := $C; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$21))))^ := 0; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$20))))^ := 0; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$19))))^ := 0; { 7000:122E; region anchor, exact origin unknown }
    while true do begin { 7000:122E; region anchor, exact origin unknown }
      if ($0 < (Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^)) + $96)))^) then begin { 7000:122E; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $0) then begin { 7000:122E; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B2)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
        end else begin { 7000:122E; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $5) then begin { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B5)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
          end; { 7000:122E; region anchor, exact origin unknown }
        end; { 7000:122E; region anchor, exact origin unknown }
        cVar4 := stub_ov24_e8(MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ shr 7), Ptr<UnknownValue>(@g_4264)[((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ * 2)]), MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ shr 7), Ptr<UnknownValue>(@g_4263)[((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ * 2)])); { 7000:122E; region anchor, exact origin unknown }
        (Ptr<ShortInt>((UNK_unaff_BP + (-$21))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$21))))^ + cVar4); { 7000:122E; region anchor, exact origin unknown }
        (Ptr<ShortInt>((UNK_unaff_BP + (-$20))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$20))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $0) then begin { 7000:122E; region anchor, exact origin unknown }
          stub_ov23_e2((Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:122E; region anchor, exact origin unknown }
          (Ptr<Byte>((UNK_unaff_BP + (-$13))))^ := 1; { 7000:122E; region anchor, exact origin unknown }
          while true do begin { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Word>((UNK_unaff_BP + (-$2B))))^ := (Ptr<UnknownValue>(@g_31FA) + (Word((Ptr<Byte>((UNK_unaff_BP + (-$13))))^) * $10)); { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Word>((UNK_unaff_BP + (-$29))))^ := $C7C; { 7000:122E; region anchor, exact origin unknown }
            if (((Ptr<ShortInt>((Ptr<LongWord>((UNK_unaff_BP + (-$2B))))^))^ = $0) and then ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$2B))))^) + 1)))^ = $1)) then begin { 7000:122E; region anchor, exact origin unknown }
              (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + Word((Ptr<Byte>((UNK_unaff_BP + (-$13))))^)) + $32)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
            end; { 7000:122E; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ = $38) then begin { 7000:122E; region anchor, exact origin unknown }
              Break; { 7000:122E; region anchor, exact origin unknown }
            end; { 7000:122E; region anchor, exact origin unknown }
            (Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
          end; { 7000:122E; region anchor, exact origin unknown }
        end else begin { 7000:122E; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $5) then begin { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $3D)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $44)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $45)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $47)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
          end; { 7000:122E; region anchor, exact origin unknown }
        end; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $7) then begin { 7000:122E; region anchor, exact origin unknown }
        Break; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
      (Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ + $1); { 7000:122E; region anchor, exact origin unknown }
    end; { 7000:122E; region anchor, exact origin unknown }
    uVar6 := ((Word((Ptr<Byte>((UNK_unaff_BP + (-$21))))^) * 10) div Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)); { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $8E)))^ := uVar6; { 7000:122E; region anchor, exact origin unknown }
    uVar3 := FUN_7000_4235(MakeWord(ShortInt((uVar6 shr 8)), $FF), (Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ := uVar3; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^; { 7000:122E; region anchor, exact origin unknown }
    cVar4 := FUN_7000_3f31((Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:122E; region anchor, exact origin unknown }
    (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^ := SmallInt(cVar4); { 7000:122E; region anchor, exact origin unknown }
    if ((Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^ < 0) then begin { 7000:122E; region anchor, exact origin unknown }
      uVar6 := (SmallInt((Ptr<Word>((UNK_unaff_BP + (-$1E))))^) shr $F); { 7000:122E; region anchor, exact origin unknown }
      if (SmallInt(((((Ptr<Word>((UNK_unaff_BP + (-$1E))))^ xor uVar6) - uVar6) + Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^))) < SmallInt(Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^))) then begin { 7000:122E; region anchor, exact origin unknown }
        (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := ShortInt((SmallInt((Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^) + (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^)) div SmallInt(Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)))); { 7000:122E; region anchor, exact origin unknown }
      end else begin { 7000:122E; region anchor, exact origin unknown }
        (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := 1; { 7000:122E; region anchor, exact origin unknown }
      end; { 7000:122E; region anchor, exact origin unknown }
    end else begin { 7000:122E; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := ShortInt((SmallInt((Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^) + (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^)) div SmallInt(Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)))); { 7000:122E; region anchor, exact origin unknown }
    end; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $11B)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^; { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ := ((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ div (Ptr<Byte>((UNK_unaff_BP + (-$20))))^); { 7000:122E; region anchor, exact origin unknown }
    stub_ov19_e2(); { 7000:122E; region anchor, exact origin unknown }
    stub_ov19_e4(); { 7000:122E; region anchor, exact origin unknown }
    iVar5 := (UNK_unaff_BP + (-$39)); { 7000:122E; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7000:122E; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := PString(FarPtr($85, $545)); { 7000:122E; region anchor, exact origin unknown }
    uVar3 := stub_ov25_e5(MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), iVar5, uVar8); { 7000:122E; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$16))))^ := uVar3; { 7000:122E; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((UNK_unaff_BP + (-$16))))^ = $59) then begin { 7000:122E; region anchor, exact origin unknown }
      uVar8 := $85; { 7000:122E; region anchor, exact origin unknown }
      stub_ov19_e1(); { 7000:122E; region anchor, exact origin unknown }
      g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-8))))^; { 7000:122E; region anchor, exact origin unknown }
      g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-6))))^; { 7000:122E; region anchor, exact origin unknown }
      repeat { 7000:122E; region anchor, exact origin unknown }
        iVar11 := (UNK_unaff_BP + (-$134)); { 7000:122E; region anchor, exact origin unknown }
        iVar5 := (UNK_unaff_BP + (-$34)); { 7000:122E; region anchor, exact origin unknown }
        uVar9 := UNK_unaff_SS; { 7000:122E; region anchor, exact origin unknown }
        uVar10 := UNK_unaff_SS; { 7000:122E; region anchor, exact origin unknown }
        PString(UNK_hidden_string_result) := PString(FarPtr(uVar8, $55B)); { 7000:122E; region anchor, exact origin unknown }
        FUN_0709_09e3(MakeWord(UNK_extraout_AH_00, $F), MakeWord(UNK_extraout_AH_00, $D), iVar5, uVar9); { 7000:122E; region anchor, exact origin unknown }
        uVar8 := $AF8; { 7000:122E; region anchor, exact origin unknown }
        PString(FarPtr(SmallInt((LongWord((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) shr $10)), SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^))) := Copy(PString(FarPtr(uVar10, iVar11)), 1, $F); { 7000:122E; region anchor, exact origin unknown }
      until not (((Ptr<ShortInt>((Ptr<LongWord>((UNK_unaff_BP + (-4))))^))^ = $0)); { 7000:122E; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-8))))^ := g_5D92; { 7000:122E; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-6))))^ := g_5D94; { 7000:122E; region anchor, exact origin unknown }
      g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:122E; region anchor, exact origin unknown }
      g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:122E; region anchor, exact origin unknown }
      FUN_7000_33e7(); { 7000:122E; region anchor, exact origin unknown }
      ov16_382D(); { 7000:122E; region anchor, exact origin unknown }
      uVar8 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:122E; region anchor, exact origin unknown }
      uVar9 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:122E; region anchor, exact origin unknown }
      iVar5 := (UNK_unaff_BP + (-$24)); { 7000:122E; region anchor, exact origin unknown }
      uVar10 := UNK_unaff_SS; { 7000:122E; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := PString(FarPtr($AF8, $4FE)); { 7000:122E; region anchor, exact origin unknown }
      stub_ov17_e4(iVar5, uVar10, uVar9, uVar8); { 7000:122E; region anchor, exact origin unknown }
      g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-8))))^; { 7000:122E; region anchor, exact origin unknown }
      g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-6))))^; { 7000:122E; region anchor, exact origin unknown }
      FreeMem(FarPtr((Ptr<Word>((UNK_unaff_BP + (-2))))^, (Ptr<Word>((UNK_unaff_BP + (-4))))^), $11D); { 7000:122E; region anchor, exact origin unknown }
      Exit; { 7000:122E; region anchor, exact origin unknown }
    end; { 7000:122E; region anchor, exact origin unknown }
  until not (true); { 7000:122E; region anchor, exact origin unknown }
end;
```

### ov16:14A7 CreationSharedFramePart2 (conf M)

Original `FUN_7000_14a7`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -27:2, -1B:1.
Locals/SSA temporaries: pcVar1: ^ShortInt; uVar2: LongWord; uVar3: Byte; cVar4: ShortInt; in_AX: SmallInt; iVar5: SmallInt; bVar7: Byte; uVar6: Word; extraout_AH: Byte; extraout_AH_00: Byte; in_DL: Byte; unaff_BP: SmallInt; unaff_DI: SmallInt; unaff_ES: Word; uVar8: Word; unaff_SS: Word; uVar9: Word; uVar10: Word; iVar11: SmallInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.RandomWord.

Decompiler split/shared parent BP frame; preserve cross-entry flow and unresolved parent locals. Evidence: decode/listings/ov16.lst at 7000:14A7, paired .c.

```pascal
procedure FUN_7000_14a7();
begin
  while true do begin { 7000:14A7; region anchor, exact origin unknown }
    iVar5 := MakeWord(ShortInt((Word(UNK_in_AX) shr 8)), (Ptr<Byte>((UNK_unaff_DI + $10)))^); { 7000:14A7; region anchor, exact origin unknown }
    if ((Ptr<Byte>((UNK_unaff_DI + $10)))^ < UNK_in_DL) then begin { 7000:14A7; region anchor, exact origin unknown }
      iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:14A7; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + iVar5) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:14A7; region anchor, exact origin unknown }
    end; { 7000:14A7; region anchor, exact origin unknown }
    bVar7 := Byte((Word(iVar5) shr 8)); { 7000:14A7; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $10)))^ = $12) and then ($0 < (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $98)))^)) then begin { 7000:14A7; region anchor, exact origin unknown }
      cVar4 := Random($64); { 7000:14F3 }
      (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^ := (cVar4 + $1); { 7000:14F3; region anchor, exact origin unknown }
      cVar4 := (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^; { 7000:14F3; region anchor, exact origin unknown }
      bVar7 := (cVar4 shr 7); { 7000:14F3; region anchor, exact origin unknown }
      if (Byte(Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]) < (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^) then begin { 7000:14F3; region anchor, exact origin unknown }
        cVar4 := (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^; { 7000:14F3; region anchor, exact origin unknown }
        bVar7 := (cVar4 shr 7); { 7000:14F3; region anchor, exact origin unknown }
        (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^ := Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    stub_ov19_e3((Word(bVar7) shl 8), MakeWord(bVar7, (Ptr<Byte>((UNK_unaff_BP + (-$1B))))^)); { 7000:14F3; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $5) then begin { 7000:14F3; region anchor, exact origin unknown }
      uVar2 := (Ptr<LongWord>((UNK_unaff_BP + (-4))))^; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-$27))))^ := SmallInt(uVar2); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-$25))))^ := SmallInt((LongWord(uVar2) shr $10)); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $11B)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A1)))^ := 2; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A3)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A5)))^ := 2; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $AA)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $72)))^ := $C; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$21))))^ := 0; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$20))))^ := 0; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$19))))^ := 0; { 7000:14F3; region anchor, exact origin unknown }
      while true do begin { 7000:14F3; region anchor, exact origin unknown }
        if ($0 < (Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^)) + $96)))^) then begin { 7000:14F3; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $0) then begin { 7000:14F3; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B2)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
          end else begin { 7000:14F3; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $5) then begin { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B5)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
            end; { 7000:14F3; region anchor, exact origin unknown }
          end; { 7000:14F3; region anchor, exact origin unknown }
          cVar4 := stub_ov24_e8(MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ shr 7), Ptr<UnknownValue>(@g_4264)[((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ * 2)]), MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ shr 7), Ptr<UnknownValue>(@g_4263)[((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ * 2)])); { 7000:14F3; region anchor, exact origin unknown }
          (Ptr<ShortInt>((UNK_unaff_BP + (-$21))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$21))))^ + cVar4); { 7000:14F3; region anchor, exact origin unknown }
          (Ptr<ShortInt>((UNK_unaff_BP + (-$20))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$20))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $0) then begin { 7000:14F3; region anchor, exact origin unknown }
            stub_ov23_e2((Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:14F3; region anchor, exact origin unknown }
            (Ptr<Byte>((UNK_unaff_BP + (-$13))))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
            while true do begin { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Word>((UNK_unaff_BP + (-$2B))))^ := (Ptr<UnknownValue>(@g_31FA) + (Word((Ptr<Byte>((UNK_unaff_BP + (-$13))))^) * $10)); { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Word>((UNK_unaff_BP + (-$29))))^ := $C7C; { 7000:14F3; region anchor, exact origin unknown }
              if (((Ptr<ShortInt>((Ptr<LongWord>((UNK_unaff_BP + (-$2B))))^))^ = $0) and then ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$2B))))^) + 1)))^ = $1)) then begin { 7000:14F3; region anchor, exact origin unknown }
                (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + Word((Ptr<Byte>((UNK_unaff_BP + (-$13))))^)) + $32)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
              end; { 7000:14F3; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ = $38) then begin { 7000:14F3; region anchor, exact origin unknown }
                Break; { 7000:14F3; region anchor, exact origin unknown }
              end; { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
            end; { 7000:14F3; region anchor, exact origin unknown }
          end else begin { 7000:14F3; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $5) then begin { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $3D)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $44)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $45)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $47)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
            end; { 7000:14F3; region anchor, exact origin unknown }
          end; { 7000:14F3; region anchor, exact origin unknown }
        end; { 7000:14F3; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $7) then begin { 7000:14F3; region anchor, exact origin unknown }
          Break; { 7000:14F3; region anchor, exact origin unknown }
        end; { 7000:14F3; region anchor, exact origin unknown }
        (Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
      uVar6 := ((Word((Ptr<Byte>((UNK_unaff_BP + (-$21))))^) * 10) div Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $8E)))^ := uVar6; { 7000:14F3; region anchor, exact origin unknown }
      uVar3 := FUN_7000_4235(MakeWord(ShortInt((uVar6 shr 8)), $FF), (Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ := uVar3; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^; { 7000:14F3; region anchor, exact origin unknown }
      cVar4 := FUN_7000_3f31((Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^ := SmallInt(cVar4); { 7000:14F3; region anchor, exact origin unknown }
      if ((Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^ < 0) then begin { 7000:14F3; region anchor, exact origin unknown }
        uVar6 := (SmallInt((Ptr<Word>((UNK_unaff_BP + (-$1E))))^) shr $F); { 7000:14F3; region anchor, exact origin unknown }
        if (SmallInt(((((Ptr<Word>((UNK_unaff_BP + (-$1E))))^ xor uVar6) - uVar6) + Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^))) < SmallInt(Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^))) then begin { 7000:14F3; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := ShortInt((SmallInt((Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^) + (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^)) div SmallInt(Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)))); { 7000:14F3; region anchor, exact origin unknown }
        end else begin { 7000:14F3; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
        end; { 7000:14F3; region anchor, exact origin unknown }
      end else begin { 7000:14F3; region anchor, exact origin unknown }
        (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := ShortInt((SmallInt((Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^) + (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^)) div SmallInt(Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)))); { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $11B)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ := ((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ div (Ptr<Byte>((UNK_unaff_BP + (-$20))))^); { 7000:14F3; region anchor, exact origin unknown }
      stub_ov19_e2(); { 7000:14F3; region anchor, exact origin unknown }
      stub_ov19_e4(); { 7000:14F3; region anchor, exact origin unknown }
      iVar5 := (UNK_unaff_BP + (-$39)); { 7000:14F3; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7000:14F3; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := PString(FarPtr($85, $545)); { 7000:14F3; region anchor, exact origin unknown }
      uVar3 := stub_ov25_e5(MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), iVar5, uVar8); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$16))))^ := uVar3; { 7000:14F3; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$16))))^ = $59) then begin { 7000:14F3; region anchor, exact origin unknown }
        uVar8 := $85; { 7000:14F3; region anchor, exact origin unknown }
        stub_ov19_e1(); { 7000:14F3; region anchor, exact origin unknown }
        g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-8))))^; { 7000:14F3; region anchor, exact origin unknown }
        g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-6))))^; { 7000:14F3; region anchor, exact origin unknown }
        repeat { 7000:14F3; region anchor, exact origin unknown }
          iVar11 := (UNK_unaff_BP + (-$134)); { 7000:14F3; region anchor, exact origin unknown }
          iVar5 := (UNK_unaff_BP + (-$34)); { 7000:14F3; region anchor, exact origin unknown }
          uVar9 := UNK_unaff_SS; { 7000:14F3; region anchor, exact origin unknown }
          uVar10 := UNK_unaff_SS; { 7000:14F3; region anchor, exact origin unknown }
          PString(UNK_hidden_string_result) := PString(FarPtr(uVar8, $55B)); { 7000:14F3; region anchor, exact origin unknown }
          FUN_0709_09e3(MakeWord(UNK_extraout_AH_00, $F), MakeWord(UNK_extraout_AH_00, $D), iVar5, uVar9); { 7000:14F3; region anchor, exact origin unknown }
          uVar8 := $AF8; { 7000:14F3; region anchor, exact origin unknown }
          PString(FarPtr(SmallInt((LongWord((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) shr $10)), SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^))) := Copy(PString(FarPtr(uVar10, iVar11)), 1, $F); { 7000:14F3; region anchor, exact origin unknown }
        until not (((Ptr<ShortInt>((Ptr<LongWord>((UNK_unaff_BP + (-4))))^))^ = $0)); { 7000:14F3; region anchor, exact origin unknown }
        (Ptr<Word>((UNK_unaff_BP + (-8))))^ := g_5D92; { 7000:14F3; region anchor, exact origin unknown }
        (Ptr<Word>((UNK_unaff_BP + (-6))))^ := g_5D94; { 7000:14F3; region anchor, exact origin unknown }
        g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:14F3; region anchor, exact origin unknown }
        g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:14F3; region anchor, exact origin unknown }
        FUN_7000_33e7(); { 7000:14F3; region anchor, exact origin unknown }
        ov16_382D(); { 7000:14F3; region anchor, exact origin unknown }
        uVar8 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:14F3; region anchor, exact origin unknown }
        uVar9 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:14F3; region anchor, exact origin unknown }
        iVar5 := (UNK_unaff_BP + (-$24)); { 7000:14F3; region anchor, exact origin unknown }
        uVar10 := UNK_unaff_SS; { 7000:14F3; region anchor, exact origin unknown }
        PString(UNK_hidden_string_result) := PString(FarPtr($AF8, $4FE)); { 7000:14F3; region anchor, exact origin unknown }
        stub_ov17_e4(iVar5, uVar10, uVar9, uVar8); { 7000:14F3; region anchor, exact origin unknown }
        g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-8))))^; { 7000:14F3; region anchor, exact origin unknown }
        g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-6))))^; { 7000:14F3; region anchor, exact origin unknown }
        FreeMem(FarPtr((Ptr<Word>((UNK_unaff_BP + (-2))))^, (Ptr<Word>((UNK_unaff_BP + (-4))))^), $11D); { 7000:14F3; region anchor, exact origin unknown }
        Exit; { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + $16)))^ := 0; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$1B))))^ := 0; { 7000:14F3; region anchor, exact origin unknown }
    end else begin { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:14F3; region anchor, exact origin unknown }
    (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + iVar5) + $10)))^ := 0; { 7000:14F3; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$14))))^ := 1; { 7000:14F3; region anchor, exact origin unknown }
    while true do begin { 7000:14F3; region anchor, exact origin unknown }
      uVar3 := Byte((Word(iVar5) shr 8)); { 7000:14F3; region anchor, exact origin unknown }
      uVar3 := stub_ov24_e8(MakeWord(uVar3, 6), MakeWord(uVar3, 3)); { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$15))))^ := uVar3; { 7000:14F3; region anchor, exact origin unknown }
      cVar4 := (Ptr<ShortInt>((UNK_unaff_BP + (-$17))))^; { 7000:14F3; region anchor, exact origin unknown }
      if (cVar4 = $1) then begin { 7000:14F3; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $4) then begin { 7000:14F3; region anchor, exact origin unknown }
          (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
        end else begin { 7000:14F3; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $5) then begin { 7000:14F3; region anchor, exact origin unknown }
            (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:14F3; region anchor, exact origin unknown }
          end; { 7000:14F3; region anchor, exact origin unknown }
        end; { 7000:14F3; region anchor, exact origin unknown }
      end else begin { 7000:14F3; region anchor, exact origin unknown }
        if (cVar4 = $2) then begin { 7000:14F3; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $3) then begin { 7000:14F3; region anchor, exact origin unknown }
            (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
          end else begin { 7000:14F3; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $4) then begin { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:14F3; region anchor, exact origin unknown }
            end; { 7000:14F3; region anchor, exact origin unknown }
          end; { 7000:14F3; region anchor, exact origin unknown }
        end else begin { 7000:14F3; region anchor, exact origin unknown }
          if (cVar4 = $5) then begin { 7000:14F3; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $0) then begin { 7000:14F3; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:14F3; region anchor, exact origin unknown }
            end else begin { 7000:14F3; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $3) then begin { 7000:14F3; region anchor, exact origin unknown }
                (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
              end; { 7000:14F3; region anchor, exact origin unknown }
            end; { 7000:14F3; region anchor, exact origin unknown }
          end else begin { 7000:14F3; region anchor, exact origin unknown }
            if (cVar4 = $6) then begin { 7000:14F3; region anchor, exact origin unknown }
              cVar4 := (Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^; { 7000:14F3; region anchor, exact origin unknown }
              if (cVar4 = $0) then begin { 7000:14F3; region anchor, exact origin unknown }
                (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
              end else begin { 7000:14F3; region anchor, exact origin unknown }
                if (cVar4 = $4) then begin { 7000:14F3; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
                end else begin { 7000:14F3; region anchor, exact origin unknown }
                  if (cVar4 = $5) then begin { 7000:14F3; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-2)); { 7000:14F3; region anchor, exact origin unknown }
                  end; { 7000:14F3; region anchor, exact origin unknown }
                end; { 7000:14F3; region anchor, exact origin unknown }
              end; { 7000:14F3; region anchor, exact origin unknown }
            end; { 7000:14F3; region anchor, exact origin unknown }
          end; { 7000:14F3; region anchor, exact origin unknown }
        end; { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
      bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:14F3; region anchor, exact origin unknown }
      iVar5 := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:14F3; region anchor, exact origin unknown }
      if (bVar7 < (Ptr<Byte>((UNK_unaff_BP + (-$15))))^) then begin { 7000:14F3; region anchor, exact origin unknown }
        iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:14F3; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + iVar5) + $10)))^ := (Ptr<Byte>((UNK_unaff_BP + (-$15))))^; { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ = $6) then begin { 7000:14F3; region anchor, exact origin unknown }
        Break; { 7000:14F3; region anchor, exact origin unknown }
      end; { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ + $1); { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    uVar2 := (Ptr<LongWord>((UNK_unaff_BP + (-4))))^; { 7000:14F3; region anchor, exact origin unknown }
    (Ptr<Word>((UNK_unaff_BP + (-$27))))^ := SmallInt(uVar2); { 7000:14F3; region anchor, exact origin unknown }
    (Ptr<Word>((UNK_unaff_BP + (-$25))))^ := SmallInt((LongWord(uVar2) shr $10)); { 7000:14F3; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ <> $0) then begin { 7000:14F3; region anchor, exact origin unknown }
      Break; { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F31) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:14F3; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:14F3; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + $1); { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:14F3; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:14F3; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:14F3; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:14F3; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + (-2)); { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:14F3; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:14F3; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))])) then begin { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    if (Byte(Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:14F3; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:14F3; region anchor, exact origin unknown }
    end; { 7000:14F3; region anchor, exact origin unknown }
    UNK_in_DL := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:14F3; region anchor, exact origin unknown }
    UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:14F3; region anchor, exact origin unknown }
    UNK_unaff_ES := Word((LongWord((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) shr $10)); { 7000:14F3; region anchor, exact origin unknown }
    UNK_unaff_DI := (SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX); { 7000:14F3; region anchor, exact origin unknown }
  end; { 7000:14F3; region anchor, exact origin unknown }
  FUN_7000_1551(); { 7000:14F3; region anchor, exact origin unknown }
  Exit; { 7000:14F3; region anchor, exact origin unknown }
end;
```

### ov16:1551 CreationSharedFramePart3 (conf M)

Original `FUN_7000_1551`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -134:2, -39:2, -34:2, -2B:2, -29:2, -27:2, -25:2, -24:2, -21:1, -20:1, -1E:2, -1B:1, -19:1, -16:1, -13:1, -8:2, -6:2, -4:2, -2:2.
Locals/SSA temporaries: pcVar1: ^ShortInt; uVar2: LongWord; uVar3: Byte; cVar4: ShortInt; iVar5: SmallInt; in_AX: SmallInt; bVar7: Byte; uVar6: Word; extraout_AH: Byte; extraout_AH_00: Byte; unaff_BP: SmallInt; uVar8: Word; unaff_SS: Word; bVar9: Boolean; uVar10: Word; uVar11: Word; iVar12: SmallInt.
Callers: FUN_7000_1156.
Callees (listing): System.@SetIn, stub_ov19_e3, stub_ov24_e8, stub_ov23_e2, FUN_7000_4235, FUN_7000_3f31, stub_ov19_e2, stub_ov19_e4, System.@StrCopy, stub_ov25_e5, stub_ov19_e1, FUN_0709_09e3, System.@StrAssign, FUN_7000_33e7, ov16_382D, stub_ov17_e4, System.FreeMem.

Decompiler split/shared parent BP frame; original nesting unresolved. Evidence: decode/listings/ov16.lst at 7000:1551, paired .c.

```pascal
procedure FUN_7000_1551();
begin
  cVar4 := ShortInt(UNK_in_AX); { 7000:1551; region anchor, exact origin unknown }
  if (cVar4 = $1) then begin { 7000:1551; region anchor, exact origin unknown }
    if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1551; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1551; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + $1); { 7000:1551; region anchor, exact origin unknown }
    end; { 7000:1551; region anchor, exact origin unknown }
    if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1551; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1551; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + $1); { 7000:1551; region anchor, exact origin unknown }
    end; { 7000:1551; region anchor, exact origin unknown }
    if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DA9)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)])) then begin { 7000:1551; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA9)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1551; region anchor, exact origin unknown }
    end; { 7000:1551; region anchor, exact origin unknown }
    if (Byte(Ptr<UnknownValue>(@g_3DAA)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:1551; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DAA)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1551; region anchor, exact origin unknown }
    end; { 7000:1551; region anchor, exact origin unknown }
    bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:1551; region anchor, exact origin unknown }
    UNK_in_AX := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:1551; region anchor, exact origin unknown }
    if (bVar7 < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:1551; region anchor, exact origin unknown }
      UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1551; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:1551; region anchor, exact origin unknown }
    end; { 7000:1551; region anchor, exact origin unknown }
  end else begin { 7000:1551; region anchor, exact origin unknown }
    if (cVar4 = $2) then begin { 7000:1551; region anchor, exact origin unknown }
      if ((Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^ <= (Ptr<Word>((Ptr<UnknownValue>(@g_3F31) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^) then begin { 7000:1551; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1551; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1551; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1551; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + $1); { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1551; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1551; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + $1); { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1551; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1551; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + $1); { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DAB)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)])) then begin { 7000:1551; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DAB)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      if (Byte(Ptr<UnknownValue>(@g_3DAC)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:1551; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DAC)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:1551; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:1551; region anchor, exact origin unknown }
      end; { 7000:1551; region anchor, exact origin unknown }
      UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1551; region anchor, exact origin unknown }
      bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^; { 7000:1551; region anchor, exact origin unknown }
      bVar9 := (bVar7 = $D); { 7000:1551; region anchor, exact origin unknown }
      if ((bVar7 < $D) and then Seq(UNK_in_AX := (MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^) in PackedSet(FarPtr($7000, $525))), (not bVar9))) then begin { 7000:1831 }
        UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1831; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^ := $D; { 7000:1831; region anchor, exact origin unknown }
      end; { 7000:1831; region anchor, exact origin unknown }
    end else begin { 7000:1831; region anchor, exact origin unknown }
      if (cVar4 = $3) then begin { 7000:1831; region anchor, exact origin unknown }
        if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1831; region anchor, exact origin unknown }
          pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1831; region anchor, exact origin unknown }
          (pcVar1)^ := ((pcVar1)^ + (-2)); { 7000:1831; region anchor, exact origin unknown }
        end; { 7000:1831; region anchor, exact origin unknown }
        if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1831; region anchor, exact origin unknown }
          pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1831; region anchor, exact origin unknown }
          (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1831; region anchor, exact origin unknown }
        end; { 7000:1831; region anchor, exact origin unknown }
        if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DAD)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)])) then begin { 7000:1831; region anchor, exact origin unknown }
          (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DAD)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1831; region anchor, exact origin unknown }
        end; { 7000:1831; region anchor, exact origin unknown }
        if (Byte(Ptr<UnknownValue>(@g_3DAE)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:1831; region anchor, exact origin unknown }
          (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DAE)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1831; region anchor, exact origin unknown }
        end; { 7000:1831; region anchor, exact origin unknown }
        bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:1831; region anchor, exact origin unknown }
        UNK_in_AX := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:1831; region anchor, exact origin unknown }
        if (bVar7 < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:1831; region anchor, exact origin unknown }
          UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1831; region anchor, exact origin unknown }
          (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:1831; region anchor, exact origin unknown }
        end; { 7000:1831; region anchor, exact origin unknown }
      end else begin { 7000:1831; region anchor, exact origin unknown }
        if (cVar4 = $4) then begin { 7000:1831; region anchor, exact origin unknown }
          if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1831; region anchor, exact origin unknown }
            pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1831; region anchor, exact origin unknown }
            (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
          if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1831; region anchor, exact origin unknown }
            pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1831; region anchor, exact origin unknown }
            (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
          if ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^) then begin { 7000:1831; region anchor, exact origin unknown }
            pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1831; region anchor, exact origin unknown }
            (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
          if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DAF)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)])) then begin { 7000:1831; region anchor, exact origin unknown }
            (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DAF)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
          if (Byte(Ptr<UnknownValue>(@g_3DB0)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:1831; region anchor, exact origin unknown }
            (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DB0)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
          bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:1831; region anchor, exact origin unknown }
          UNK_in_AX := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:1831; region anchor, exact origin unknown }
          if (bVar7 < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:1831; region anchor, exact origin unknown }
            UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1831; region anchor, exact origin unknown }
            (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
        end else begin { 7000:1831; region anchor, exact origin unknown }
          if (cVar4 = $5) then begin { 7000:1831; region anchor, exact origin unknown }
            if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DB1)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)])) then begin { 7000:1831; region anchor, exact origin unknown }
              (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DB1)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1831; region anchor, exact origin unknown }
            end; { 7000:1831; region anchor, exact origin unknown }
            if (Byte(Ptr<UnknownValue>(@g_3DB2)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:1831; region anchor, exact origin unknown }
              (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DB2)[((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10)]; { 7000:1831; region anchor, exact origin unknown }
            end; { 7000:1831; region anchor, exact origin unknown }
            bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:1831; region anchor, exact origin unknown }
            UNK_in_AX := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:1831; region anchor, exact origin unknown }
            if (bVar7 < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:1831; region anchor, exact origin unknown }
              UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1831; region anchor, exact origin unknown }
              (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:1831; region anchor, exact origin unknown }
            end; { 7000:1831; region anchor, exact origin unknown }
          end; { 7000:1831; region anchor, exact origin unknown }
        end; { 7000:1831; region anchor, exact origin unknown }
      end; { 7000:1831; region anchor, exact origin unknown }
    end; { 7000:1831; region anchor, exact origin unknown }
  end; { 7000:1831; region anchor, exact origin unknown }
  while true do begin { 7000:1831; region anchor, exact origin unknown }
    bVar7 := Byte((Word(UNK_in_AX) shr 8)); { 7000:1831; region anchor, exact origin unknown }
    stub_ov19_e3((Word(bVar7) shl 8), MakeWord(bVar7, (Ptr<Byte>((UNK_unaff_BP + (-$1B))))^)); { 7000:1BD3 }
    if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $5) then begin { 7000:1BD3; region anchor, exact origin unknown }
      uVar2 := (Ptr<LongWord>((UNK_unaff_BP + (-4))))^; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-$27))))^ := SmallInt(uVar2); { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Word>((UNK_unaff_BP + (-$25))))^ := SmallInt((LongWord(uVar2) shr $10)); { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $11B)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A1)))^ := 2; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A3)))^ := 1; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $A5)))^ := 2; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $AA)))^ := 1; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $72)))^ := $C; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$21))))^ := 0; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$20))))^ := 0; { 7000:1BD3; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$19))))^ := 0; { 7000:1BD3; region anchor, exact origin unknown }
      while true do begin { 7000:1BD3; region anchor, exact origin unknown }
        if ($0 < (Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^)) + $96)))^) then begin { 7000:1BD3; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $0) then begin { 7000:1BD3; region anchor, exact origin unknown }
            (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B2)))^ := 1; { 7000:1BD3; region anchor, exact origin unknown }
          end else begin { 7000:1BD3; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $5) then begin { 7000:1BD3; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B5)))^ := 1; { 7000:1BD3; region anchor, exact origin unknown }
            end; { 7000:1BD3; region anchor, exact origin unknown }
          end; { 7000:1BD3; region anchor, exact origin unknown }
          cVar4 := stub_ov24_e8(MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ shr 7), Ptr<UnknownValue>(@g_4264)[((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ * 2)]), MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ shr 7), Ptr<UnknownValue>(@g_4263)[((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ * 2)])); { 7000:1C83 }
          (Ptr<ShortInt>((UNK_unaff_BP + (-$21))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$21))))^ + cVar4); { 7000:1C83; region anchor, exact origin unknown }
          (Ptr<ShortInt>((UNK_unaff_BP + (-$20))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$20))))^ + $1); { 7000:1C83; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $0) then begin { 7000:1C83; region anchor, exact origin unknown }
            stub_ov23_e2((Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:1C9B }
            (Ptr<Byte>((UNK_unaff_BP + (-$13))))^ := 1; { 7000:1C9B; region anchor, exact origin unknown }
            while true do begin { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<Word>((UNK_unaff_BP + (-$2B))))^ := (Ptr<UnknownValue>(@g_31FA) + (Word((Ptr<Byte>((UNK_unaff_BP + (-$13))))^) * $10)); { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<Word>((UNK_unaff_BP + (-$29))))^ := $C7C; { 7000:1C9B; region anchor, exact origin unknown }
              if (((Ptr<ShortInt>((Ptr<LongWord>((UNK_unaff_BP + (-$2B))))^))^ = $0) and then ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$2B))))^) + 1)))^ = $1)) then begin { 7000:1C9B; region anchor, exact origin unknown }
                (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + Word((Ptr<Byte>((UNK_unaff_BP + (-$13))))^)) + $32)))^ := 1; { 7000:1C9B; region anchor, exact origin unknown }
              end; { 7000:1C9B; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ = $38) then begin { 7000:1C9B; region anchor, exact origin unknown }
                Break; { 7000:1C9B; region anchor, exact origin unknown }
              end; { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$13))))^ + $1); { 7000:1C9B; region anchor, exact origin unknown }
            end; { 7000:1C9B; region anchor, exact origin unknown }
          end else begin { 7000:1C9B; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $5) then begin { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $3D)))^ := 1; { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $44)))^ := 1; { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $45)))^ := 1; { 7000:1C9B; region anchor, exact origin unknown }
              (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $47)))^ := 1; { 7000:1C9B; region anchor, exact origin unknown }
            end; { 7000:1C9B; region anchor, exact origin unknown }
          end; { 7000:1C9B; region anchor, exact origin unknown }
        end; { 7000:1C9B; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ = $7) then begin { 7000:1C9B; region anchor, exact origin unknown }
          Break; { 7000:1C9B; region anchor, exact origin unknown }
        end; { 7000:1C9B; region anchor, exact origin unknown }
        (Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$19))))^ + $1); { 7000:1C9B; region anchor, exact origin unknown }
      end; { 7000:1C9B; region anchor, exact origin unknown }
      uVar6 := ((Word((Ptr<Byte>((UNK_unaff_BP + (-$21))))^) * 10) div Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)); { 7000:1C9B; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $8E)))^ := uVar6; { 7000:1C9B; region anchor, exact origin unknown }
      uVar3 := FUN_7000_4235(MakeWord(ShortInt((uVar6 shr 8)), $FF), (Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:1D3B }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ := uVar3; { 7000:1D3B; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^; { 7000:1D3B; region anchor, exact origin unknown }
      cVar4 := FUN_7000_3f31((Ptr<Word>((UNK_unaff_BP + (-4))))^, (Ptr<Word>((UNK_unaff_BP + (-2))))^); { 7000:1D5C }
      (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^ := SmallInt(cVar4); { 7000:1D5C; region anchor, exact origin unknown }
      if ((Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^ < 0) then begin { 7000:1D5C; region anchor, exact origin unknown }
        uVar6 := (SmallInt((Ptr<Word>((UNK_unaff_BP + (-$1E))))^) shr $F); { 7000:1D5C; region anchor, exact origin unknown }
        if (SmallInt(((((Ptr<Word>((UNK_unaff_BP + (-$1E))))^ xor uVar6) - uVar6) + Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^))) < SmallInt(Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^))) then begin { 7000:1D5C; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := ShortInt((SmallInt((Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^) + (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^)) div SmallInt(Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)))); { 7000:1D5C; region anchor, exact origin unknown }
        end else begin { 7000:1D5C; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := 1; { 7000:1D5C; region anchor, exact origin unknown }
        end; { 7000:1D5C; region anchor, exact origin unknown }
      end else begin { 7000:1D5C; region anchor, exact origin unknown }
        (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^ := ShortInt((SmallInt((Word((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^) + (Ptr<SmallInt>((UNK_unaff_BP + (-$1E))))^)) div SmallInt(Word((Ptr<Byte>((UNK_unaff_BP + (-$20))))^)))); { 7000:1D5C; region anchor, exact origin unknown }
      end; { 7000:1D5C; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $11B)))^ := (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $32)))^; { 7000:1D5C; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ := ((Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $B1)))^ div (Ptr<Byte>((UNK_unaff_BP + (-$20))))^); { 7000:1D5C; region anchor, exact origin unknown }
      stub_ov19_e2(); { 7000:1DFA }
      stub_ov19_e4(); { 7000:1DFF }
      iVar5 := (UNK_unaff_BP + (-$39)); { 7000:1DFF; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7000:1DFF; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$39))) := 'Keep this character? '; { 7000:1E0E }
      uVar3 := stub_ov25_e5(MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), iVar5, uVar8); { 7000:1E1C }
      (Ptr<Byte>((UNK_unaff_BP + (-$16))))^ := uVar3; { 7000:1E1C; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$16))))^ = $59) then begin { 7000:1E1C; region anchor, exact origin unknown }
        uVar8 := $85; { 7000:1E1C; region anchor, exact origin unknown }
        stub_ov19_e1(); { 7000:1E2D }
        g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-8))))^; { 7000:1E38 }
        g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-6))))^; { 7000:1E3B }
        repeat { 7000:1E3B; region anchor, exact origin unknown }
          iVar12 := (UNK_unaff_BP + (-$134)); { 7000:1E3B; region anchor, exact origin unknown }
          iVar5 := (UNK_unaff_BP + (-$34)); { 7000:1E3B; region anchor, exact origin unknown }
          uVar10 := UNK_unaff_SS; { 7000:1E3B; region anchor, exact origin unknown }
          uVar11 := UNK_unaff_SS; { 7000:1E3B; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$34))) := 'Character name: '; { 7000:1E4F }
          FUN_0709_09e3(MakeWord(UNK_extraout_AH_00, $F), MakeWord(UNK_extraout_AH_00, $D), iVar5, uVar10); { 7000:1E5A }
          uVar8 := $AF8; { 7000:1E5A; region anchor, exact origin unknown }
          PString(FarPtr(FarSeg(BPWord(-$4)), FarOff(BPWord(-$4)))) := Copy(PString(FarPtr(SS, BPAddr(-$134))), 1, $F); { 7000:1E68 }
        until not (((Ptr<ShortInt>((Ptr<LongWord>((UNK_unaff_BP + (-4))))^))^ = $0)); { 7000:1E68; region anchor, exact origin unknown }
        (Ptr<Word>((UNK_unaff_BP + (-8))))^ := g_5D92; { 7000:1E68; region anchor, exact origin unknown }
        (Ptr<Word>((UNK_unaff_BP + (-6))))^ := g_5D94; { 7000:1E68; region anchor, exact origin unknown }
        g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:1E89 }
        g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:1E8C }
        FUN_7000_33e7(); { 7000:1E91 }
        ov16_382D(); { 7000:1E95 }
        uVar8 := (Ptr<Word>((UNK_unaff_BP + (-2))))^; { 7000:1E95; region anchor, exact origin unknown }
        uVar10 := (Ptr<Word>((UNK_unaff_BP + (-4))))^; { 7000:1E95; region anchor, exact origin unknown }
        iVar5 := (UNK_unaff_BP + (-$24)); { 7000:1E95; region anchor, exact origin unknown }
        uVar11 := UNK_unaff_SS; { 7000:1E95; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$24))) := ''; { 7000:1EA8 }
        stub_ov17_e4(iVar5, uVar11, uVar10, uVar8); { 7000:1EAD }
        g_5D92 := (Ptr<Word>((UNK_unaff_BP + (-8))))^; { 7000:1EB8 }
        g_5D94 := (Ptr<Word>((UNK_unaff_BP + (-6))))^; { 7000:1EBB }
        FreeMem(FarPtr(BPWord(-$2), BPWord(-$4)), $11D); { 7000:1EC9 }
        Exit; { 7000:1ED1 }
      end; { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + $16)))^ := 0; { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$1B))))^ := 0; { 7000:1EC9; region anchor, exact origin unknown }
    end else begin { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1EC9; region anchor, exact origin unknown }
    (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + iVar5) + $10)))^ := 0; { 7000:1EC9; region anchor, exact origin unknown }
    (Ptr<Byte>((UNK_unaff_BP + (-$14))))^ := 1; { 7000:1EC9; region anchor, exact origin unknown }
    while true do begin { 7000:1EC9; region anchor, exact origin unknown }
      uVar3 := Byte((Word(iVar5) shr 8)); { 7000:1EC9; region anchor, exact origin unknown }
      uVar3 := stub_ov24_e8(MakeWord(uVar3, 6), MakeWord(uVar3, 3)); { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<Byte>((UNK_unaff_BP + (-$15))))^ := uVar3; { 7000:1EC9; region anchor, exact origin unknown }
      cVar4 := (Ptr<ShortInt>((UNK_unaff_BP + (-$17))))^; { 7000:1EC9; region anchor, exact origin unknown }
      if (cVar4 = $1) then begin { 7000:1EC9; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $4) then begin { 7000:1EC9; region anchor, exact origin unknown }
          (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
        end else begin { 7000:1EC9; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $5) then begin { 7000:1EC9; region anchor, exact origin unknown }
            (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:1EC9; region anchor, exact origin unknown }
          end; { 7000:1EC9; region anchor, exact origin unknown }
        end; { 7000:1EC9; region anchor, exact origin unknown }
      end else begin { 7000:1EC9; region anchor, exact origin unknown }
        if (cVar4 = $2) then begin { 7000:1EC9; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $3) then begin { 7000:1EC9; region anchor, exact origin unknown }
            (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
          end else begin { 7000:1EC9; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $4) then begin { 7000:1EC9; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:1EC9; region anchor, exact origin unknown }
            end; { 7000:1EC9; region anchor, exact origin unknown }
          end; { 7000:1EC9; region anchor, exact origin unknown }
        end else begin { 7000:1EC9; region anchor, exact origin unknown }
          if (cVar4 = $5) then begin { 7000:1EC9; region anchor, exact origin unknown }
            if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $0) then begin { 7000:1EC9; region anchor, exact origin unknown }
              (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-1)); { 7000:1EC9; region anchor, exact origin unknown }
            end else begin { 7000:1EC9; region anchor, exact origin unknown }
              if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ = $3) then begin { 7000:1EC9; region anchor, exact origin unknown }
                (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
              end; { 7000:1EC9; region anchor, exact origin unknown }
            end; { 7000:1EC9; region anchor, exact origin unknown }
          end else begin { 7000:1EC9; region anchor, exact origin unknown }
            if (cVar4 = $6) then begin { 7000:1EC9; region anchor, exact origin unknown }
              cVar4 := (Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^; { 7000:1EC9; region anchor, exact origin unknown }
              if (cVar4 = $0) then begin { 7000:1EC9; region anchor, exact origin unknown }
                (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
              end else begin { 7000:1EC9; region anchor, exact origin unknown }
                if (cVar4 = $4) then begin { 7000:1EC9; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
                end else begin { 7000:1EC9; region anchor, exact origin unknown }
                  if (cVar4 = $5) then begin { 7000:1EC9; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$15))))^ + (-2)); { 7000:1EC9; region anchor, exact origin unknown }
                  end; { 7000:1EC9; region anchor, exact origin unknown }
                end; { 7000:1EC9; region anchor, exact origin unknown }
              end; { 7000:1EC9; region anchor, exact origin unknown }
            end; { 7000:1EC9; region anchor, exact origin unknown }
          end; { 7000:1EC9; region anchor, exact origin unknown }
        end; { 7000:1EC9; region anchor, exact origin unknown }
      end; { 7000:1EC9; region anchor, exact origin unknown }
      bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:1EC9; region anchor, exact origin unknown }
      iVar5 := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:1EC9; region anchor, exact origin unknown }
      if (bVar7 < (Ptr<Byte>((UNK_unaff_BP + (-$15))))^) then begin { 7000:1EC9; region anchor, exact origin unknown }
        iVar5 := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1EC9; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-4))))^) + iVar5) + $10)))^ := (Ptr<Byte>((UNK_unaff_BP + (-$15))))^; { 7000:1EC9; region anchor, exact origin unknown }
      end; { 7000:1EC9; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ = $6) then begin { 7000:1EC9; region anchor, exact origin unknown }
        Break; { 7000:1EC9; region anchor, exact origin unknown }
      end; { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ := ((Ptr<ShortInt>((UNK_unaff_BP + (-$14))))^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    uVar2 := (Ptr<LongWord>((UNK_unaff_BP + (-4))))^; { 7000:1EC9; region anchor, exact origin unknown }
    (Ptr<Word>((UNK_unaff_BP + (-$27))))^ := SmallInt(uVar2); { 7000:1EC9; region anchor, exact origin unknown }
    (Ptr<Word>((UNK_unaff_BP + (-$25))))^ := SmallInt((LongWord(uVar2) shr $10)); { 7000:1EC9; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ <> $0) then begin { 7000:1EC9; region anchor, exact origin unknown }
      Break; { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F31) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:1EC9; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1EC9; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + $1); { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F33) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:1EC9; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1EC9; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F35) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:1EC9; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1EC9; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + (-2)); { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ <> $0) and then ((Ptr<Word>((Ptr<UnknownValue>(@g_3F37) + ((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * 10))))^ < (Ptr<Word>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $30)))^)) then begin { 7000:1EC9; region anchor, exact origin unknown }
      pcVar1 := Ptr<ShortInt>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)); { 7000:1EC9; region anchor, exact origin unknown }
      (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if ((Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))])) then begin { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if (Byte(Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]) < (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^) then begin { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^ := Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    bVar7 := (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^)) + $10)))^; { 7000:1EC9; region anchor, exact origin unknown }
    UNK_in_AX := MakeWord(((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^ shr 7), bVar7); { 7000:1EC9; region anchor, exact origin unknown }
    if (bVar7 < Byte(Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))])) then begin { 7000:1EC9; region anchor, exact origin unknown }
      UNK_in_AX := SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^); { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + UNK_in_AX) + $10)))^ := Ptr<UnknownValue>(@g_3F81)[(((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2F)))^ * 6) + SmallInt((Ptr<ShortInt>((UNK_unaff_BP + (-$1B))))^))]; { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $10)))^ = $12) and then ($0 < (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $98)))^)) then begin { 7000:1EC9; region anchor, exact origin unknown }
      cVar4 := Random(100); { 7000:1EC9; region anchor, exact origin unknown }
      (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^ := (cVar4 + $1); { 7000:1EC9; region anchor, exact origin unknown }
      cVar4 := (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^; { 7000:1EC9; region anchor, exact origin unknown }
      UNK_in_AX := MakeWord((cVar4 shr 7), Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]); { 7000:1EC9; region anchor, exact origin unknown }
      if (Byte(Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]) < (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^) then begin { 7000:1EC9; region anchor, exact origin unknown }
        cVar4 := (Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $2E)))^; { 7000:1EC9; region anchor, exact origin unknown }
        UNK_in_AX := MakeWord((cVar4 shr 7), Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]); { 7000:1EC9; region anchor, exact origin unknown }
        (Ptr<Byte>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $16)))^ := Ptr<UnknownValue>(@g_3DA7)[((cVar4 * $10) + SmallInt((Ptr<ShortInt>((SmallInt((Ptr<LongWord>((UNK_unaff_BP + (-$27))))^) + $9E)))^))]; { 7000:1EC9; region anchor, exact origin unknown }
      end; { 7000:1EC9; region anchor, exact origin unknown }
    end; { 7000:1EC9; region anchor, exact origin unknown }
  end; { 7000:1EC9; region anchor, exact origin unknown }
  FUN_7000_1551(); { 7000:1EC9; region anchor, exact origin unknown }
  Exit; { 7000:1ED1 }
end;
```

### ov16:1F37 DropCharacterPermanently (conf M)

Original `FUN_7000_1f37`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -214:2, -114:2, -105:2, -5:2, -3:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; bVar2: Byte; unaff_SS: Word; puVar3: ^Byte; uVar4: Word; local_216: array[0..256-1] of Byte; local_116: array[0..15-1] of Byte; local_107: array[0..256-1] of Byte; local_7: SmallInt; iStack_5: SmallInt.
Callers: ov16_0161.
Callees (listing): System.@StrCopy, System.@StrAppend, stub_ov25_e5, FUN_00ba_1693, ov16_3291.

Drop forever and confirmation; distinct from removing a party member. Evidence: decode/listings/ov16.lst at 7000:1F37, paired .c.

```pascal
procedure FUN_7000_1f37();
begin
  if ((g_5D92 <> 0) or else (g_5D94 <> 0)) then begin { 7000:1F37; region anchor, exact origin unknown }
    local_7 := g_5D92; { 7000:1F4E }
    iStack_5 := g_5D94; { 7000:1F4E; region anchor, exact origin unknown }
    puVar3 := local_107; { 7000:1F4E; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7000:1F4E; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$105))) := 'Drop '; { 7000:1F5F }
    PString(FarPtr(SS, BPAddr(-$105))) := PString(FarPtr(SS, BPAddr(-$105))) + PString(FarPtr(FarSeg(BPWord(-$5)), FarOff(BPWord(-$5)))); { 7000:1F69 }
    PString(FarPtr(SS, BPAddr(-$105))) := PString(FarPtr(SS, BPAddr(-$105))) + ' forever? '; { 7000:1F73 }
    cVar1 := stub_ov25_e5(MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $E), puVar3, uVar4); { 7000:1F81 }
    if (cVar1 = $59) then begin { 7000:1F81; region anchor, exact origin unknown }
      puVar3 := local_116; { 7000:1F81; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7000:1F81; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$114))) := 'Are you sure? '; { 7000:1F98 }
      cVar1 := stub_ov25_e5(MakeWord(UNK_extraout_AH_00, $F), MakeWord(UNK_extraout_AH_00, 10), MakeWord(UNK_extraout_AH_00, $E), puVar3, uVar4); { 7000:1FA6 }
      if (cVar1 = $59) then begin { 7000:1FA6; region anchor, exact origin unknown }
        if ((Ptr<ShortInt>((local_7 + $10D)))^ = $0) then begin { 7000:1FA6; region anchor, exact origin unknown }
          puVar3 := local_216; { 7000:1FA6; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$214))) := 'You dump '; { 7000:1FC5 }
          PString(FarPtr(SS, BPAddr(-$214))) := PString(FarPtr(SS, BPAddr(-$214))) + PString(FarPtr(FarSeg(BPWord(-$5)), FarOff(BPWord(-$5)))); { 7000:1FCF }
          PString(FarPtr(SS, BPAddr(-$214))) := PString(FarPtr(SS, BPAddr(-$214))) + ' out back.'; { 7000:1FD9 }
          FUN_00ba_1693(puVar3, UNK_unaff_SS); { 7000:1FDE }
          bVar2 := UNK_extraout_AH_01; { 7000:1FDE; region anchor, exact origin unknown }
        end else begin { 7000:1FDE; region anchor, exact origin unknown }
          puVar3 := local_216; { 7000:1FDE; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$214))) := PString(FarPtr(FarSeg(BPWord(-$5)), FarOff(BPWord(-$5)))); { 7000:1FF0 }
          PString(FarPtr(SS, BPAddr(-$214))) := PString(FarPtr(SS, BPAddr(-$214))) + ' bids you farewell.'; { 7000:1FFA }
          FUN_00ba_1693(puVar3, UNK_unaff_SS); { 7000:1FFF }
          bVar2 := UNK_extraout_AH_02; { 7000:1FFF; region anchor, exact origin unknown }
        end; { 7000:1FFF; region anchor, exact origin unknown }
        ov16_3291(MakeWord(bVar2, 1), (Word(bVar2) shl 8)); { 7000:200B }
        Exit; { 7000:2032 }
      end; { 7000:200B; region anchor, exact origin unknown }
    end; { 7000:200B; region anchor, exact origin unknown }
    puVar3 := local_216; { 7000:200B; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$214))) := PString(FarPtr(FarSeg(BPWord(-$5)), FarOff(BPWord(-$5)))); { 7000:201B }
    PString(FarPtr(SS, BPAddr(-$214))) := PString(FarPtr(SS, BPAddr(-$214))) + ' breathes a sigh of relief.'; { 7000:2025 }
    FUN_00ba_1693(puVar3, UNK_unaff_SS); { 7000:202A }
  end; { 7000:202A; region anchor, exact origin unknown }
  Exit; { 7000:2032 }
end;
```

### ov16:2033 AttributeDisplayNestedHelper (conf M)

Original `FUN_7000_2033`. Params (ABI order): param_1: SmallInt; param_2: Byte.
BP access inventory (hex offset:byte widths): +6:2, +8:1.
Locals/SSA temporaries: unaff_SS: Word.
Callers: FUN_7000_209f.
Callees (listing): stub_ov19_e3, FUN_00ba_0973.

Uses parent frame; independent signature not recovered. Evidence: decode/listings/ov16.lst at 7000:2033, paired .c.

```pascal
procedure FUN_7000_2033(param_1: SmallInt; param_2: Byte);
begin
  if ((Ptr<Byte>((param_1 + (-$D))))^ < 6) then begin { 7000:2033; region anchor, exact origin unknown }
    stub_ov19_e3(param_2, (Ptr<Byte>((param_1 + (-$D))))^); { 7000:204C }
  end else begin { 7000:204C; region anchor, exact origin unknown }
    FUN_00ba_0973(param_2, $12, 4, g_5D92, g_5D94); { 7000:2065 }
  end; { 7000:2065; region anchor, exact origin unknown }
  Exit; { 7000:206B }
end;
```

### ov16:209F ModifyCharacter (conf M)

Original `FUN_7000_209f`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -114:2, -35:2, -2B:2, -18:2, -16:2, -D:1, -C:1/2, -B:1, -A:1, -8:1, -7:1, -6:1/2.
Locals/SSA temporaries: pcVar1: ^ShortInt; bVar2: Byte; uVar3: Byte; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar4: Word; extraout_AH_03: Byte; iVar5: SmallInt; uVar6: Word; uVar7: Word; unaff_SS: Word; puVar8: ^Byte; puVar9: ^Byte; uVar10: Word; local_116: array[0..223-1] of Byte; local_37: array[0..10-1] of Byte; local_2d: array[0..19-1] of Byte; local_1a: SmallInt; uStack_18: Word; local_f: Byte; local_e: ShortInt; local_d: ShortInt; local_c: Byte; local_a: Byte; local_9: Byte; local_8: array[0..6-1] of Byte.
Callers: ov16_0161.
Callees (listing): System.@StrCopy, System.@StrAppend, FUN_0709_0d68, stub_ov19_e1, System.Move, FUN_7000_2033, stub_ov25_e2, stub_ov23_e2, FUN_7000_408c, FUN_7000_3fb3, FUN_00ba_0bb8, stub_ov19_e2.

Interactive statistics and HP adjustment; Keep/Exit. Evidence: decode/listings/ov16.lst at 7000:209F, paired .c.

```pascal
procedure FUN_7000_209f();
begin
  uVar6 := Word((LongWord(g_5D92) shr $10)); { 7000:209F; region anchor, exact origin unknown }
  iVar5 := SmallInt(g_5D92); { 7000:209F; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((iVar5 + $AE)))^ < 1) and then (((Ptr<SmallInt>((iVar5 + $AE)))^ < 0) or else ((Ptr<SmallInt>((iVar5 + $AC)))^ = 0))) then begin { 7000:209F; region anchor, exact origin unknown }
    stub_ov19_e1(); { 7000:20E2 }
    uVar7 := $AF8; { 7000:20E2; region anchor, exact origin unknown }
    Move(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $5D92))), (FarOff(MemWord(FarPtr($0C7C, $5D92))) + $10)), FarPtr(SS, BPAddr(-$6)), $6); { 7000:20FA }
    uVar6 := Word((LongWord(g_5D92) shr $10)); { 7000:20FA; region anchor, exact origin unknown }
    local_9 := (Ptr<Byte>((SmallInt(g_5D92) + $16)))^; { 7000:2107 }
    local_a := (Ptr<Byte>((SmallInt(g_5D92) + $32)))^; { 7000:2112 }
    local_f := 6; { 7000:2115 }
    FUN_7000_2033(@stack0xfffe, (Word(UNK_extraout_AH_00) shl 8)); { 7000:211E }
    local_f := 0; { 7000:2121 }
    FUN_7000_2033(@stack0xfffe, MakeWord(UNK_extraout_AH_01, 1)); { 7000:212A }
    uStack_18 := Word((LongWord(g_5D92) shr $10)); { 7000:212A; region anchor, exact origin unknown }
    local_1a := SmallInt(g_5D92); { 7000:2131 }
    repeat { 7000:2131; region anchor, exact origin unknown }
      puVar9 := local_2d; { 7000:2131; region anchor, exact origin unknown }
      uVar10 := UNK_unaff_SS; { 7000:2131; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $5D92))), FarOff(MemWord(FarPtr($0C7C, $5D92))))); { 7000:20C8 }
      puVar8 := local_37; { 7000:20C8; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7000:20C8; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$2B))) := 'Modify character: '; { 7000:2141 }
      uVar4 := stub_ov25_e2(@local_e, UNK_unaff_SS, (Word(UNK_extraout_AH_02) shl 8), MakeWord(UNK_extraout_AH_02, 1), MakeWord(UNK_extraout_AH_02, $F), MakeWord(UNK_extraout_AH_02, 10), MakeWord(UNK_extraout_AH_02, $D), puVar8, uVar6, puVar9, uVar10); { 7000:2169 }
      local_d := ShortInt(uVar4); { 7000:216E }
      FUN_7000_2033(@stack0xfffe, (uVar4 and $FF00)); { 7000:2176 }
      if (local_e = $0) then begin { 7000:2176; region anchor, exact origin unknown }
        if ((local_d = $45) or else (local_d = $0)) then begin { 7000:2176; region anchor, exact origin unknown }
          local_c := $0; { 7000:21C4 }
          while Seq((Ptr<Byte>(((SmallInt(g_5D92) + SmallInt(ShortInt(local_c))) + $10)))^ := local_8[ShortInt(local_c)], (local_c <> $5)) do begin { 7000:21C4; region anchor, exact origin unknown }
            local_c := (local_c + $1); { 7000:2575 }
          end; { 7000:2575; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt(g_5D92) + $16)))^ := local_9; { 7000:2575; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt(g_5D92) + $32)))^ := local_a; { 7000:2575; region anchor, exact origin unknown }
          (Ptr<Byte>((SmallInt(g_5D92) + $11B)))^ := (Ptr<Byte>((local_1a + $32)))^; { 7000:2575; region anchor, exact origin unknown }
          FUN_00ba_0bb8(g_5D92, g_5D94); { 7000:28AD }
          Exit; { 7000:28ED }
        end; { 7000:28AD; region anchor, exact origin unknown }
      end else begin { 7000:28AD; region anchor, exact origin unknown }
        if ((local_d = $50) or else (local_d = $D)) then begin { 7000:28AD; region anchor, exact origin unknown }
          local_f := (local_f + 1); { 7000:27C0 }
          if (6 < local_f) then begin { 7000:27C0; region anchor, exact origin unknown }
            local_f := 0; { 7000:27B4 }
          end; { 7000:27B4; region anchor, exact origin unknown }
        end else begin { 7000:27B4; region anchor, exact origin unknown }
          if (local_d = $48) then begin { 7000:27B4; region anchor, exact origin unknown }
            local_f := (local_f - 1); { 7000:24AC }
            if (local_f = $FF) then begin { 7000:24AC; region anchor, exact origin unknown }
              local_f := 6; { 7000:24A0 }
            end; { 7000:24A0; region anchor, exact origin unknown }
          end else begin { 7000:24A0; region anchor, exact origin unknown }
            if (local_d = $4B) then begin { 7000:24A0; region anchor, exact origin unknown }
              if (local_f < 6) then begin { 7000:24A0; region anchor, exact origin unknown }
                local_c := local_f; { 7000:2859 }
                pcVar1 := Ptr<ShortInt>(((local_1a + ShortInt(local_f)) + $10)); { 7000:2859; region anchor, exact origin unknown }
                (pcVar1)^ := ((pcVar1)^ + (-1)); { 7000:2859; region anchor, exact origin unknown }
                if (local_f = 0) then begin { 7000:2859; region anchor, exact origin unknown }
                  if ((Ptr<ShortInt>((local_1a + $16)))^ = $0) then begin { 7000:2859; region anchor, exact origin unknown }
                    if (((Ptr<Byte>((local_1a + $10)))^ < Byte(Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((local_1a + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((local_1a + $9E)))^))])) or else ((Ptr<Byte>((local_1a + $10)))^ < Byte(Ptr<UnknownValue>(@g_3F81)[((Ptr<ShortInt>((local_1a + $2F)))^ * 6)]))) then begin { 7000:2859; region anchor, exact origin unknown }
                      (Ptr<Byte>((local_1a + $10)))^ := Ptr<UnknownValue>(@g_3DA3)[(((Ptr<ShortInt>((local_1a + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((local_1a + $9E)))^))]; { 7000:2859; region anchor, exact origin unknown }
                    end; { 7000:2859; region anchor, exact origin unknown }
                  end else begin { 7000:2859; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((local_1a + $16)))^ := ((Ptr<ShortInt>((local_1a + $16)))^ + (-1)); { 7000:2859; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((local_1a + $10)))^ := ((Ptr<ShortInt>((local_1a + $10)))^ + $1); { 7000:2859; region anchor, exact origin unknown }
                  end; { 7000:2859; region anchor, exact origin unknown }
                end else begin { 7000:2859; region anchor, exact origin unknown }
                  if (local_f = 1) then begin { 7000:2859; region anchor, exact origin unknown }
                    if (((Ptr<Byte>((local_1a + $11)))^ < Byte(Ptr<UnknownValue>(@g_3DA9)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)])) or else ((Ptr<Byte>((local_1a + $11)))^ < Byte(Ptr<UnknownValue>(@g_3F82)[((Ptr<ShortInt>((local_1a + $2F)))^ * 6)]))) then begin { 7000:2859; region anchor, exact origin unknown }
                      (Ptr<Byte>((local_1a + $11)))^ := Ptr<UnknownValue>(@g_3DA9)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:2859; region anchor, exact origin unknown }
                    end; { 7000:2859; region anchor, exact origin unknown }
                  end else begin { 7000:2859; region anchor, exact origin unknown }
                    if (local_f = 2) then begin { 7000:2859; region anchor, exact origin unknown }
                      if (((Ptr<Byte>((local_1a + $12)))^ < Byte(Ptr<UnknownValue>(@g_3DAB)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)])) or else ((Ptr<Byte>((local_1a + $12)))^ < Byte(Ptr<UnknownValue>(@g_3F83)[((Ptr<ShortInt>((local_1a + $2F)))^ * 6)]))) then begin { 7000:2859; region anchor, exact origin unknown }
                        (Ptr<Byte>((local_1a + $12)))^ := Ptr<UnknownValue>(@g_3DAB)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:2859; region anchor, exact origin unknown }
                      end; { 7000:2859; region anchor, exact origin unknown }
                      if ((Ptr<ShortInt>((local_1a + $B2)))^ <> $0) then begin { 7000:2859; region anchor, exact origin unknown }
                        (Ptr<Byte>((local_1a + $B2)))^ := 1; { 7000:2859; region anchor, exact origin unknown }
                      end; { 7000:2859; region anchor, exact origin unknown }
                      stub_ov23_e2(g_5D92, g_5D94); { 7000:2381 }
                    end else begin { 7000:2381; region anchor, exact origin unknown }
                      if (local_f = 3) then begin { 7000:2381; region anchor, exact origin unknown }
                        if (((Ptr<Byte>((local_1a + $13)))^ < Byte(Ptr<UnknownValue>(@g_3DAD)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)])) or else ((Ptr<Byte>((local_1a + $13)))^ < Byte(Ptr<UnknownValue>(@g_3F84)[((Ptr<ShortInt>((local_1a + $2F)))^ * 6)]))) then begin { 7000:2381; region anchor, exact origin unknown }
                          (Ptr<Byte>((local_1a + $13)))^ := Ptr<UnknownValue>(@g_3DAD)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:2381; region anchor, exact origin unknown }
                        end; { 7000:2381; region anchor, exact origin unknown }
                      end else begin { 7000:2381; region anchor, exact origin unknown }
                        if (local_f = 4) then begin { 7000:2381; region anchor, exact origin unknown }
                          if (((Ptr<Byte>((local_1a + $14)))^ < Byte(Ptr<UnknownValue>(@g_3DAF)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)])) or else ((Ptr<Byte>((local_1a + $14)))^ < Byte(Ptr<UnknownValue>(@g_3F85)[((Ptr<ShortInt>((local_1a + $2F)))^ * 6)]))) then begin { 7000:2381; region anchor, exact origin unknown }
                            (Ptr<Byte>((local_1a + $14)))^ := Ptr<UnknownValue>(@g_3DAF)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:2381; region anchor, exact origin unknown }
                          end; { 7000:2381; region anchor, exact origin unknown }
                          uVar4 := FUN_7000_408c(g_5D92, g_5D94); { 7000:2472 }
                          if (Byte(uVar4) < (Ptr<Byte>((local_1a + $32)))^) then begin { 7000:2472; region anchor, exact origin unknown }
                            uVar4 := FUN_7000_408c(g_5D92, g_5D94); { 7000:2487 }
                            (Ptr<Byte>((local_1a + $32)))^ := ShortInt(uVar4); { 7000:2487; region anchor, exact origin unknown }
                          end; { 7000:2487; region anchor, exact origin unknown }
                          (Ptr<Byte>((local_1a + $11B)))^ := (Ptr<Byte>((local_1a + $32)))^; { 7000:2487; region anchor, exact origin unknown }
                          local_f := 6; { 7000:21AA }
                          FUN_7000_2033(@stack0xfffe, (uVar4 and $FF00)); { 7000:24A9 }
                          local_f := 4; { 7000:21A1 }
                        end else begin { 7000:21A1; region anchor, exact origin unknown }
                          if ((local_f = 5) and then (((Ptr<Byte>((local_1a + $15)))^ < Byte(Ptr<UnknownValue>(@g_3DB1)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)])) or else ((Ptr<Byte>((local_1a + $15)))^ < Byte(Ptr<UnknownValue>(@g_3F86)[((Ptr<ShortInt>((local_1a + $2F)))^ * 6)])))) then begin { 7000:21A1; region anchor, exact origin unknown }
                            (Ptr<Byte>((local_1a + $15)))^ := Ptr<UnknownValue>(@g_3DB1)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:21A1; region anchor, exact origin unknown }
                          end; { 7000:21A1; region anchor, exact origin unknown }
                        end; { 7000:21A1; region anchor, exact origin unknown }
                      end; { 7000:21A1; region anchor, exact origin unknown }
                    end; { 7000:21A1; region anchor, exact origin unknown }
                  end; { 7000:21A1; region anchor, exact origin unknown }
                end; { 7000:21A1; region anchor, exact origin unknown }
              end else begin { 7000:21A1; region anchor, exact origin unknown }
                (Ptr<ShortInt>((local_1a + $32)))^ := ((Ptr<ShortInt>((local_1a + $32)))^ + (-1)); { 7000:21A1; region anchor, exact origin unknown }
                bVar2 := FUN_7000_3fb3(g_5D92, g_5D94); { 7000:2531 }
                if ((Ptr<Byte>((local_1a + $32)))^ < bVar2) then begin { 7000:2531; region anchor, exact origin unknown }
                  uVar3 := FUN_7000_3fb3(g_5D92, g_5D94); { 7000:2546 }
                  (Ptr<Byte>((local_1a + $32)))^ := uVar3; { 7000:2546; region anchor, exact origin unknown }
                end; { 7000:2546; region anchor, exact origin unknown }
                (Ptr<Byte>((local_1a + $11B)))^ := (Ptr<Byte>((local_1a + $32)))^; { 7000:2546; region anchor, exact origin unknown }
              end; { 7000:2546; region anchor, exact origin unknown }
            end else begin { 7000:2546; region anchor, exact origin unknown }
              if (local_d = $4D) then begin { 7000:2546; region anchor, exact origin unknown }
                if (local_f < 6) then begin { 7000:2546; region anchor, exact origin unknown }
                  local_c := local_f; { 7000:285F }
                  pcVar1 := Ptr<ShortInt>(((local_1a + ShortInt(local_f)) + $10)); { 7000:285F; region anchor, exact origin unknown }
                  (pcVar1)^ := ((pcVar1)^ + $1); { 7000:285F; region anchor, exact origin unknown }
                  if (local_f = 0) then begin { 7000:285F; region anchor, exact origin unknown }
                    if (Byte(Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((local_1a + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((local_1a + $9E)))^))]) < (Ptr<Byte>((local_1a + $10)))^) then begin { 7000:285F; region anchor, exact origin unknown }
                      if ((($12 < (Ptr<Byte>((local_1a + $10)))^) and then ($0 < (Ptr<ShortInt>((local_1a + $98)))^)) and then ((Ptr<Byte>((local_1a + $16)))^ < Byte(Ptr<UnknownValue>(@g_3DA7)[(((Ptr<ShortInt>((local_1a + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((local_1a + $9E)))^))]))) then begin { 7000:285F; region anchor, exact origin unknown }
                        (Ptr<ShortInt>((local_1a + $16)))^ := ((Ptr<ShortInt>((local_1a + $16)))^ + $1); { 7000:285F; region anchor, exact origin unknown }
                      end; { 7000:285F; region anchor, exact origin unknown }
                      (Ptr<Byte>((local_1a + $10)))^ := Ptr<UnknownValue>(@g_3DA5)[(((Ptr<ShortInt>((local_1a + $2E)))^ * $10) + SmallInt((Ptr<ShortInt>((local_1a + $9E)))^))]; { 7000:285F; region anchor, exact origin unknown }
                    end; { 7000:285F; region anchor, exact origin unknown }
                  end else begin { 7000:285F; region anchor, exact origin unknown }
                    if (local_f = 1) then begin { 7000:285F; region anchor, exact origin unknown }
                      if (Byte(Ptr<UnknownValue>(@g_3DAA)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]) < (Ptr<Byte>((local_1a + $11)))^) then begin { 7000:285F; region anchor, exact origin unknown }
                        (Ptr<Byte>((local_1a + $11)))^ := Ptr<UnknownValue>(@g_3DAA)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:285F; region anchor, exact origin unknown }
                      end; { 7000:285F; region anchor, exact origin unknown }
                    end else begin { 7000:285F; region anchor, exact origin unknown }
                      if (local_f = 2) then begin { 7000:285F; region anchor, exact origin unknown }
                        if (Byte(Ptr<UnknownValue>(@g_3DAC)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]) < (Ptr<Byte>((local_1a + $12)))^) then begin { 7000:285F; region anchor, exact origin unknown }
                          (Ptr<Byte>((local_1a + $12)))^ := Ptr<UnknownValue>(@g_3DAC)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:285F; region anchor, exact origin unknown }
                        end; { 7000:285F; region anchor, exact origin unknown }
                        if ((Ptr<ShortInt>((local_1a + $B2)))^ <> $0) then begin { 7000:285F; region anchor, exact origin unknown }
                          (Ptr<Byte>((local_1a + $B2)))^ := 1; { 7000:285F; region anchor, exact origin unknown }
                        end; { 7000:285F; region anchor, exact origin unknown }
                        stub_ov23_e2(g_5D92, g_5D94); { 7000:26E3 }
                      end else begin { 7000:26E3; region anchor, exact origin unknown }
                        if (local_f = 3) then begin { 7000:26E3; region anchor, exact origin unknown }
                          if (Byte(Ptr<UnknownValue>(@g_3DAE)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]) < (Ptr<Byte>((local_1a + $13)))^) then begin { 7000:26E3; region anchor, exact origin unknown }
                            (Ptr<Byte>((local_1a + $13)))^ := Ptr<UnknownValue>(@g_3DAE)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:26E3; region anchor, exact origin unknown }
                          end; { 7000:26E3; region anchor, exact origin unknown }
                        end else begin { 7000:26E3; region anchor, exact origin unknown }
                          if (local_f = 4) then begin { 7000:26E3; region anchor, exact origin unknown }
                            if (Byte(Ptr<UnknownValue>(@g_3DB0)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]) < (Ptr<Byte>((local_1a + $14)))^) then begin { 7000:26E3; region anchor, exact origin unknown }
                              (Ptr<Byte>((local_1a + $14)))^ := Ptr<UnknownValue>(@g_3DB0)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:26E3; region anchor, exact origin unknown }
                            end; { 7000:26E3; region anchor, exact origin unknown }
                            uVar4 := FUN_7000_3fb3(g_5D92, g_5D94); { 7000:2786 }
                            if ((Ptr<Byte>((local_1a + $32)))^ < Byte(uVar4)) then begin { 7000:2786; region anchor, exact origin unknown }
                              uVar4 := FUN_7000_3fb3(g_5D92, g_5D94); { 7000:279B }
                              (Ptr<Byte>((local_1a + $32)))^ := ShortInt(uVar4); { 7000:279B; region anchor, exact origin unknown }
                            end; { 7000:279B; region anchor, exact origin unknown }
                            (Ptr<Byte>((local_1a + $11B)))^ := (Ptr<Byte>((local_1a + $32)))^; { 7000:279B; region anchor, exact origin unknown }
                            local_f := 6; { 7000:2196 }
                            FUN_7000_2033(@stack0xfffe, (uVar4 and $FF00)); { 7000:27BD }
                            local_f := 4; { 7000:218D }
                          end else begin { 7000:218D; region anchor, exact origin unknown }
                            if ((local_f = 5) and then (Byte(Ptr<UnknownValue>(@g_3DB2)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]) < (Ptr<Byte>((local_1a + $15)))^)) then begin { 7000:218D; region anchor, exact origin unknown }
                              (Ptr<Byte>((local_1a + $15)))^ := Ptr<UnknownValue>(@g_3DB2)[((Ptr<ShortInt>((local_1a + $2E)))^ * $10)]; { 7000:218D; region anchor, exact origin unknown }
                            end; { 7000:218D; region anchor, exact origin unknown }
                          end; { 7000:218D; region anchor, exact origin unknown }
                        end; { 7000:218D; region anchor, exact origin unknown }
                      end; { 7000:218D; region anchor, exact origin unknown }
                    end; { 7000:218D; region anchor, exact origin unknown }
                  end; { 7000:218D; region anchor, exact origin unknown }
                end else begin { 7000:218D; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((local_1a + $32)))^ := ((Ptr<ShortInt>((local_1a + $32)))^ + $1); { 7000:218D; region anchor, exact origin unknown }
                  bVar2 := FUN_7000_408c(g_5D92, g_5D94); { 7000:281E }
                  if (bVar2 < (Ptr<Byte>((local_1a + $32)))^) then begin { 7000:281E; region anchor, exact origin unknown }
                    uVar3 := FUN_7000_408c(g_5D92, g_5D94); { 7000:2833 }
                    (Ptr<Byte>((local_1a + $32)))^ := uVar3; { 7000:2833; region anchor, exact origin unknown }
                  end; { 7000:2833; region anchor, exact origin unknown }
                  (Ptr<Byte>((local_1a + $11B)))^ := (Ptr<Byte>((local_1a + $32)))^; { 7000:2833; region anchor, exact origin unknown }
                end; { 7000:2833; region anchor, exact origin unknown }
              end; { 7000:2833; region anchor, exact origin unknown }
            end; { 7000:2833; region anchor, exact origin unknown }
          end; { 7000:2833; region anchor, exact origin unknown }
        end; { 7000:2833; region anchor, exact origin unknown }
      end; { 7000:2833; region anchor, exact origin unknown }
      FUN_00ba_0bb8(g_5D92, g_5D94); { 7000:28BC }
      uVar7 := $85; { 7000:28BC; region anchor, exact origin unknown }
      stub_ov19_e2(); { 7000:28C1 }
      FUN_7000_2033(@stack0xfffe, MakeWord(UNK_extraout_AH_03, 1)); { 7000:28CB }
    until not (((local_e <> $0) or else (local_d <> $4B))); { 7000:28CB; region anchor, exact origin unknown }
    (Ptr<Byte>((SmallInt(g_5D92) + $85)))^ := 1; { 7000:28CB; region anchor, exact origin unknown }
  end else begin { 7000:28CB; region anchor, exact origin unknown }
    puVar9 := local_116; { 7000:28CB; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$35))) := 'Keep Exit'; { 7000:2150 }
    PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + ' can''t be modified.'; { 7000:20D2 }
    FUN_0709_0d68(MakeWord(UNK_extraout_AH, $E), puVar9, UNK_unaff_SS); { 7000:20DA }
  end; { 7000:20DA; region anchor, exact origin unknown }
  Exit; { 7000:28ED }
end;
```

### ov16:29AE TrainCharacter (conf M)

Original `FUN_7000_29ae`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -221:2, -121:2, -40:2, -3C:2, -38:2, -37:2, -35:2, -34:2, -2F:2, -21:2, -1F:2, -1C:1/2, -1B:2, -19:1, -18:1, -17:1, -16:1, -15:2, -13:1, -12:1, -11:1/2, -F:2, -D:1, -C:1, -B:1, -A:1, -9:2, -7:2, -5:2, -3:2, -1:1.
Locals/SSA temporaries: bVar1: Byte; cVar2: ShortInt; bVar3: Byte; extraout_AH: Byte; extraout_AH_00: Byte; uVar4: Word; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar10: Byte; extraout_AH_03: Byte; iVar5: SmallInt; uVar6: Word; uVar7: Word; uVar8: Word; uVar9: Word; extraout_AH_04: Byte; extraout_AH_05: Byte; pbVar11: ^Byte; uVar12: Word; unaff_SS: Word; lVar13: LongInt; puVar14: ^Byte; puVar15: ^Byte; local_223: array[0..256-1] of Byte; local_123: array[0..225-1] of Byte; local_42: array[0..4-1] of Byte; local_3e: array[0..4-1] of Byte; local_3a: Byte; local_39: array[0..2-1] of Byte; local_37: Byte; local_36: array[0..5-1] of Byte; local_31: array[0..14-1] of Byte; local_23: ^Byte; local_1e: ShortInt; local_1d: Word; local_1b: Byte; local_1a: Byte; local_19: Byte; local_18: ShortInt; local_15: ShortInt; local_13: Word; local_11: Word; local_f: Byte; local_e: Byte; local_d: Byte; local_c: Byte; local_b: Word; local_9: SmallInt; local_7: Word; local_5: SmallInt; local_3: ShortInt.
Callers: ov16_0161.
Callees (listing): System.@StrCopy, FUN_0709_0d68, stub_ov19_e11, FUN_03f1_0137, FUN_00ba_1816, FUN_0709_0626, FUN_00ba_1037, System.@StrAppend, stub_ov25_e5, FUN_00ba_1693, FUN_7000_42ed, stub_ov23_e1, stub_ov19_e12, FUN_7000_4235, FUN_7000_3f31.

Conscious or override; normally 1000 gp. Checks race/class/XP and VM region1+550 training mask; updates level, HP, saves and spells. Evidence: decode/listings/ov16.lst at 7000:29AE, paired .c.

```pascal
procedure FUN_7000_29ae();
begin
  uVar12 := Word((LongWord(g_5D92) shr $10)); { 7000:29AE; region anchor, exact origin unknown }
  if ((Ptr<Byte>(g_5D92)[$10C] = 0) or else (g_470C <> $0)) then begin { 7000:29AE; region anchor, exact origin unknown }
    lVar13 := stub_ov19_e11(Ptr<Byte>(g_5D92), uVar12); { 7000:29EA }
    if ((lVar13 < 1000) and then (g_470C = $0)) then begin { 7000:29EA; region anchor, exact origin unknown }
      puVar15 := @local_37; { 7000:29EA; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$3C))) := 'we only train conscious people'; { 7000:29D2 }
      FUN_0709_0d68(MakeWord(UNK_extraout_AH_00, $E), puVar15, UNK_unaff_SS); { 7000:29DA }
    end else begin { 7000:29DA; region anchor, exact origin unknown }
      local_c := 0; { 7000:2A1C }
      local_d := 0; { 7000:2A20 }
      uVar12 := Word((LongWord(g_5D92) shr $10)); { 7000:2A20; region anchor, exact origin unknown }
      pbVar11 := Ptr<Byte>(g_5D92); { 7000:2A20; region anchor, exact origin unknown }
      local_23 := g_5D92; { 7000:2A28 }
      local_7 := 0; { 7000:2A30 }
      local_5 := 0; { 7000:2A33 }
      local_15 := $0; { 7000:2A36 }
      while true do begin { 7000:2A36; region anchor, exact origin unknown }
        uVar4 := Word(local_15); { 7000:2A36; region anchor, exact origin unknown }
        if ($0 < ShortInt(pbVar11[(uVar4 + $96)])) then begin { 7000:2A36; region anchor, exact origin unknown }
          local_d := (local_d + (Ptr<ShortInt>((local_15 + $5DE)))^); { 7000:2A5D }
          local_3 := $0; { 7000:2A60 }
          local_1a := pbVar11[(local_15 + $96)]; { 7000:2A72 }
          bVar3 := pbVar11[$2E]; { 7000:2A72; region anchor, exact origin unknown }
          uVar4 := MakeWord((local_15 shr 7), bVar3); { 7000:2A72; region anchor, exact origin unknown }
          if (bVar3 = 1) then begin { 7000:2A72; region anchor, exact origin unknown }
            if ((local_15 = $2) and then (((local_1a = 8) and then (pbVar11[$10] = $11)) or else ((local_1a = 7) and then (pbVar11[$10] < $11)))) then begin { 7000:2A72; region anchor, exact origin unknown }
              local_3 := $1; { 7000:2AA6 }
            end; { 7000:2AA6; region anchor, exact origin unknown }
          end else begin { 7000:2AA6; region anchor, exact origin unknown }
            if (bVar3 = 2) then begin { 7000:2AA6; region anchor, exact origin unknown }
              if ((local_15 = $2) and then (((local_1a = 7) or else ((local_1a = 6) and then (pbVar11[$10] = $11))) or else ((local_1a = 5) and then (pbVar11[$10] < $11)))) then begin { 7000:2AA6; region anchor, exact origin unknown }
                local_3 := $1; { 7000:2ADD }
              end; { 7000:2ADD; region anchor, exact origin unknown }
            end else begin { 7000:2ADD; region anchor, exact origin unknown }
              if (bVar3 = 3) then begin { 7000:2ADD; region anchor, exact origin unknown }
                if ((local_15 = $2) and then ((local_1a = 6) or else ((local_1a = 5) and then (pbVar11[$10] < $12)))) then begin { 7000:2ADD; region anchor, exact origin unknown }
                  local_3 := $1; { 7000:2B04 }
                end; { 7000:2B04; region anchor, exact origin unknown }
              end else begin { 7000:2B04; region anchor, exact origin unknown }
                if (bVar3 = 4) then begin { 7000:2B04; region anchor, exact origin unknown }
                  if ((local_15 = $0) and then (local_1a = 5)) then begin { 7000:2B04; region anchor, exact origin unknown }
                    local_3 := $1; { 7000:2B1A }
                  end else begin { 7000:2B1A; region anchor, exact origin unknown }
                    if ((local_15 = $2) and then (((local_1a = 8) or else ((local_1a = 7) and then (pbVar11[$10] = $11))) or else ((local_1a = 6) and then (pbVar11[$10] < $11)))) then begin { 7000:2B1A; region anchor, exact origin unknown }
                      local_3 := $1; { 7000:2B4C }
                    end; { 7000:2B4C; region anchor, exact origin unknown }
                  end; { 7000:2B4C; region anchor, exact origin unknown }
                end else begin { 7000:2B4C; region anchor, exact origin unknown }
                  if (((bVar3 = 5) and then (local_15 = $2)) and then (((local_1a = 6) or else ((local_1a = 5) and then (pbVar11[$10] = $11))) or else ((local_1a = 4) and then (pbVar11[$10] < $11)))) then begin { 7000:2B4C; region anchor, exact origin unknown }
                    local_3 := $1; { 7000:2B82 }
                  end; { 7000:2B82; region anchor, exact origin unknown }
                end; { 7000:2B82; region anchor, exact origin unknown }
              end; { 7000:2B82; region anchor, exact origin unknown }
            end; { 7000:2B82; region anchor, exact origin unknown }
          end; { 7000:2B82; region anchor, exact origin unknown }
          if (local_3 = $0) then begin { 7000:2B82; region anchor, exact origin unknown }
            iVar5 := ((local_15 * $38) + (ShortInt((local_1a + 1)) * 4)); { 7000:2B82; region anchor, exact origin unknown }
            uVar4 := (Ptr<Word>((Ptr<UnknownValue>(@g_409B) + iVar5)))^; { 7000:2B82; region anchor, exact origin unknown }
            if (((Ptr<SmallInt>((Ptr<UnknownValue>(@g_409D) + iVar5)))^ < (Ptr<SmallInt>((pbVar11 + $AE)))^) or else ((((Ptr<SmallInt>((Ptr<UnknownValue>(@g_409D) + iVar5)))^ <= (Ptr<SmallInt>((pbVar11 + $AE)))^) and then (uVar4 <= (Ptr<Word>((pbVar11 + $AC)))^)) or else (g_470C <> $0))) then begin { 7000:2B82; region anchor, exact origin unknown }
              uVar4 := (local_15 * $38); { 7000:2B82; region anchor, exact origin unknown }
              iVar5 := (uVar4 + (ShortInt((local_1a + 1)) * 4)); { 7000:2B82; region anchor, exact origin unknown }
              if ((0 < (Ptr<SmallInt>((Ptr<UnknownValue>(@g_409D) + iVar5)))^) or else (((-1) < (Ptr<SmallInt>((Ptr<UnknownValue>(@g_409D) + iVar5)))^) and then ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_409B) + iVar5)))^ <> 0))) then begin { 7000:2B82; region anchor, exact origin unknown }
                local_c := (local_c + (Ptr<ShortInt>((local_15 + $5DE)))^); { 7000:2C06 }
                iVar5 := ((local_15 * $38) + (ShortInt((local_1a + 2)) * 4)); { 7000:2C06; region anchor, exact origin unknown }
                local_b := (Ptr<Word>((Ptr<UnknownValue>(@g_409B) + iVar5)))^; { 7000:2C2C }
                local_9 := (Ptr<SmallInt>((Ptr<UnknownValue>(@g_409D) + iVar5)))^; { 7000:2C2F }
                uVar4 := local_b; { 7000:2C2F; region anchor, exact origin unknown }
                if ((0 < local_9) or else (((-1) < local_9) and then (local_b <> 0))) then begin { 7000:2C2F; region anchor, exact origin unknown }
                  uVar4 := (Ptr<Word>((pbVar11 + $AC)))^; { 7000:2C2F; region anchor, exact origin unknown }
                  if (((local_9 < (Ptr<SmallInt>((pbVar11 + $AE)))^) or else ((local_9 <= (Ptr<SmallInt>((pbVar11 + $AE)))^) and then (local_b <= uVar4))) and then ((local_5 < local_9) or else Seq(uVar4 := local_b, ((local_5 <= local_9) and then (local_7 < local_b))))) then begin { 7000:2C2F; region anchor, exact origin unknown }
                    uVar4 := (local_b - 1); { 7000:2C2F; region anchor, exact origin unknown }
                    local_5 := (local_9 - Word((local_b = 0))); { 7000:2C7A }
                    local_7 := uVar4; { 7000:2C77 }
                  end; { 7000:2C77; region anchor, exact origin unknown }
                end; { 7000:2C77; region anchor, exact origin unknown }
              end; { 7000:2C77; region anchor, exact origin unknown }
            end; { 7000:2C77; region anchor, exact origin unknown }
          end; { 7000:2C77; region anchor, exact origin unknown }
        end; { 7000:2C77; region anchor, exact origin unknown }
        if (local_15 = $7) then begin { 7000:2C77; region anchor, exact origin unknown }
          Break; { 7000:2C77; region anchor, exact origin unknown }
        end; { 7000:2C77; region anchor, exact origin unknown }
        local_15 := (local_15 + $1); { 7000:2D7B }
      end; { 7000:2D7B; region anchor, exact origin unknown }
      if ((0 < local_5) or else (((-1) < local_5) and then (local_7 <> 0))) then begin { 7000:2D7B; region anchor, exact origin unknown }
        (Ptr<Word>((pbVar11 + $AC)))^ := local_7; { 7000:2D7B; region anchor, exact origin unknown }
        (Ptr<SmallInt>((pbVar11 + $AE)))^ := local_5; { 7000:2D7B; region anchor, exact origin unknown }
        uVar4 := local_7; { 7000:2D7B; region anchor, exact origin unknown }
      end; { 7000:2D7B; region anchor, exact origin unknown }
      iVar5 := SmallInt(g_49D6); { 7000:2D7B; region anchor, exact origin unknown }
      uVar12 := Word((LongWord(g_49D6) shr $10)); { 7000:2D7B; region anchor, exact origin unknown }
      if (g_470C = $0) then begin { 7000:2D7B; region anchor, exact origin unknown }
        if ((local_d and Byte((Ptr<Word>((iVar5 + $550)))^)) = 0) then begin { 7000:2D7B; region anchor, exact origin unknown }
          puVar15 := local_42; { 7000:2D7B; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$35))) := 'Training costs 1000 gp.'; { 7000:2A0C }
          FUN_0709_0d68(MakeWord(UNK_extraout_AH_01, $E), puVar15, UNK_unaff_SS); { 7000:2A14 }
          Exit; { 7000:304E }
        end; { 7000:2A14; region anchor, exact origin unknown }
        uVar4 := (Word(local_c) and (Ptr<Word>((iVar5 + $550)))^); { 7000:2A14; region anchor, exact origin unknown }
        if (ShortInt(uVar4) = $0) then begin { 7000:2A14; region anchor, exact origin unknown }
          puVar15 := local_39; { 7000:2A14; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$40))) := 'We don''t train that class here'; { 7000:2CCA }
          FUN_0709_0d68(MakeWord(UNK_extraout_AH_02, $E), puVar15, UNK_unaff_SS); { 7000:2CD2 }
          Exit; { 7000:304E }
        end; { 7000:2CD2; region anchor, exact origin unknown }
      end; { 7000:2CD2; region anchor, exact origin unknown }
      if (g_470C = $0) then begin { 7000:2CD2; region anchor, exact origin unknown }
        uVar4 := (Word(local_c) and (Ptr<Word>((iVar5 + $550)))^); { 7000:2CD2; region anchor, exact origin unknown }
        local_e := Byte(uVar4); { 7000:2D1D }
      end else begin { 7000:2D1D; region anchor, exact origin unknown }
        uVar4 := MakeWord(ShortInt((uVar4 shr 8)), local_c); { 7000:2D1D; region anchor, exact origin unknown }
        local_e := local_c; { 7000:2D25 }
      end; { 7000:2D25; region anchor, exact origin unknown }
      uVar10 := Byte((uVar4 shr 8)); { 7000:2D25; region anchor, exact origin unknown }
      FUN_03f1_0137(MakeWord(uVar10, $16), MakeWord(uVar10, $26), MakeWord(uVar10, 1), MakeWord(uVar10, 1)); { 7000:2D34 }
      local_18 := $4; { 7000:2D39 }
      FUN_00ba_1816((Word(UNK_extraout_AH_03) shl 8), MakeWord(UNK_extraout_AH_03, 4), MakeWord(UNK_extraout_AH_03, 4), g_5D92, g_5D94); { 7000:2D4F }
      iVar5 := ((local_23)^ + 4); { 7000:2D4F; region anchor, exact origin unknown }
      uVar10 := Byte((Word(iVar5) shr 8)); { 7000:2D4F; region anchor, exact origin unknown }
      uVar6 := MakeWord(uVar10, local_18); { 7000:2D4F; region anchor, exact origin unknown }
      uVar7 := MakeWord(uVar10, 10); { 7000:2D4F; region anchor, exact origin unknown }
      puVar15 := local_31; { 7000:2D4F; region anchor, exact origin unknown }
      uVar12 := UNK_unaff_SS; { 7000:2D4F; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$37))) := 'Not Enough Experience'; { 7000:2CF8 }
      FUN_0709_0626(puVar15, uVar12, uVar7, uVar6, iVar5); { 7000:2D76 }
      local_15 := $0; { 7000:2D81 }
      while true do begin { 7000:2D81; region anchor, exact origin unknown }
        if (($0 < ShortInt(Ptr<Byte>(local_23)[(local_15 + $96)])) and then Seq(cVar2 := (local_15 shr 7), (((Ptr<Byte>((local_15 + $5DE)))^ and local_e) <> 0))) then begin { 7000:2D81; region anchor, exact origin unknown }
          local_18 := (local_18 + $1); { 7000:2DAC }
          if (local_18 = $5) then begin { 7000:2DAC; region anchor, exact origin unknown }
            uVar7 := MakeWord(cVar2, 6); { 7000:2DAC; region anchor, exact origin unknown }
            uVar8 := MakeWord(cVar2, 5); { 7000:2DAC; region anchor, exact origin unknown }
            uVar9 := MakeWord(cVar2, 10); { 7000:2DAC; region anchor, exact origin unknown }
            puVar15 := local_223; { 7000:2DAC; region anchor, exact origin unknown }
            uVar6 := UNK_unaff_SS; { 7000:2DAC; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$2F))) := ' will become:'; { 7000:2D71 }
            puVar14 := local_123; { 7000:2D71; region anchor, exact origin unknown }
            uVar12 := UNK_unaff_SS; { 7000:2D71; region anchor, exact origin unknown }
            FUN_00ba_1037((ShortInt(Ptr<Byte>(local_23)[(local_15 + $96)]) + 1)); { 7000:2DE6 }
            PString(FarPtr(SS, BPAddr(-$221))) := PString(FarPtr(SS, BPAddr(-$221))) + PString(FarPtr(SS, BPAddr(-$121))); { 7000:2DEB }
            PString(FarPtr(SS, BPAddr(-$221))) := PString(FarPtr(SS, BPAddr(-$221))) + ' '; { 7000:2DF5 }
            PString(FarPtr(SS, BPAddr(-$221))) := PString(FarPtr(SS, BPAddr(-$221))) + PString(FarPtr($C7C, ((local_15 * $1B) + $D38))); { 7000:2E0B }
            FUN_0709_0626(puVar15, uVar6, uVar9, uVar8, uVar7); { 7000:2E10 }
          end else begin { 7000:2E10; region anchor, exact origin unknown }
            uVar7 := MakeWord(cVar2, 6); { 7000:2E10; region anchor, exact origin unknown }
            uVar8 := MakeWord(cVar2, local_18); { 7000:2E10; region anchor, exact origin unknown }
            uVar9 := MakeWord(cVar2, 10); { 7000:2E10; region anchor, exact origin unknown }
            puVar15 := local_223; { 7000:2E10; region anchor, exact origin unknown }
            uVar6 := UNK_unaff_SS; { 7000:2E10; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$221))) := '    a level '; { 7000:2DCA }
            puVar14 := local_123; { 7000:2DCA; region anchor, exact origin unknown }
            uVar12 := UNK_unaff_SS; { 7000:2DCA; region anchor, exact origin unknown }
            FUN_00ba_1037((ShortInt(Ptr<Byte>(local_23)[(local_15 + $96)]) + 1)); { 7000:2E48 }
            PString(FarPtr(SS, BPAddr(-$221))) := PString(FarPtr(SS, BPAddr(-$221))) + PString(FarPtr(SS, BPAddr(-$121))); { 7000:2E4D }
            PString(FarPtr(SS, BPAddr(-$221))) := PString(FarPtr(SS, BPAddr(-$221))) + ' '; { 7000:2E57 }
            PString(FarPtr(SS, BPAddr(-$221))) := PString(FarPtr(SS, BPAddr(-$221))) + PString(FarPtr($C7C, ((local_15 * $1B) + $D38))); { 7000:2E6D }
            FUN_0709_0626(puVar15, uVar6, uVar9, uVar8, uVar7); { 7000:2E72 }
          end; { 7000:2E72; region anchor, exact origin unknown }
        end; { 7000:2E72; region anchor, exact origin unknown }
        if (local_15 = $7) then begin { 7000:2E72; region anchor, exact origin unknown }
          Break; { 7000:2E72; region anchor, exact origin unknown }
        end; { 7000:2E72; region anchor, exact origin unknown }
        local_15 := (local_15 + $1); { 7000:2EE1 }
      end; { 7000:2EE1; region anchor, exact origin unknown }
      puVar15 := @local_3a; { 7000:2EE1; region anchor, exact origin unknown }
      uVar12 := UNK_unaff_SS; { 7000:2EE1; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$221))) := 'and a level '; { 7000:2E2C }
      cVar2 := stub_ov25_e5(MakeWord(UNK_extraout_AH_04, $F), MakeWord(UNK_extraout_AH_04, 10), MakeWord(UNK_extraout_AH_04, $D), puVar15, uVar12); { 7000:2E98 }
      if (cVar2 = $59) then begin { 7000:2E98; region anchor, exact origin unknown }
        puVar15 := local_36; { 7000:2E98; region anchor, exact origin unknown }
        uVar12 := UNK_unaff_SS; { 7000:2E98; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$38))) := 'Do you wish to train? '; { 7000:2E8A }
        FUN_00ba_1693(puVar15, uVar12); { 7000:2EB3 }
        if (g_470C = $0) then begin { 7000:2EB3; region anchor, exact origin unknown }
          FUN_7000_42ed(g_5D92, g_5D94, 1000, 0); { 7000:2ECF }
        end; { 7000:2ECF; region anchor, exact origin unknown }
        local_f := 0; { 7000:2ED2 }
        uVar12 := Word((LongWord(local_23) shr $10)); { 7000:2ED2; region anchor, exact origin unknown }
        pbVar11 := Ptr<Byte>(local_23); { 7000:2ED2; region anchor, exact origin unknown }
        local_19 := pbVar11[$9B]; { 7000:2EDE }
        local_15 := $0; { 7000:2EE7 }
        while true do begin { 7000:2EE7; region anchor, exact origin unknown }
          if ((($0 < ShortInt(pbVar11[(local_15 + $96)])) and then Seq(local_f := (local_f + 1), (((Ptr<Byte>((local_15 + $5DE)))^ and local_e) <> 0))) and then Seq(pbVar11[(local_15 + $96)] := (pbVar11[(local_15 + $96)] + 1), (pbVar11[$74] <> 0))) then begin { 7000:2EE7; region anchor, exact origin unknown }
            pbVar11[$75] := (pbVar11[$75] - (pbVar11[$75] div pbVar11[$74])); { 7000:2EE7; region anchor, exact origin unknown }
            pbVar11[$74] := (pbVar11[$74] - 1); { 7000:2EE7; region anchor, exact origin unknown }
          end; { 7000:2EE7; region anchor, exact origin unknown }
          if (local_15 = $7) then begin { 7000:2EE7; region anchor, exact origin unknown }
            Break; { 7000:2EE7; region anchor, exact origin unknown }
          end; { 7000:2EE7; region anchor, exact origin unknown }
          local_15 := (local_15 + $1); { 7000:2A3C }
        end; { 7000:2A3C; region anchor, exact origin unknown }
        stub_ov23_e1(g_5D92, g_5D94); { 7000:2F5A }
        uVar4 := MakeWord(UNK_extraout_AH_05, Ptr<Byte>(local_23)[$9B]); { 7000:2F5A; region anchor, exact origin unknown }
        if (ShortInt(local_19) < ShortInt(Ptr<Byte>(local_23)[$9B])) then begin { 7000:2F5A; region anchor, exact origin unknown }
          local_1d := $FFFF; { 7000:2F6C }
          repeat { 7000:2F6C; region anchor, exact origin unknown }
            bVar3 := stub_ov19_e12(@local_1e, UNK_unaff_SS, @local_1d, UNK_unaff_SS, 4, 4); { 7000:2F81 }
            if (bVar3 <> 0) then begin { 7000:2F81; region anchor, exact origin unknown }
              Break; { 7000:2F81; region anchor, exact origin unknown }
            end; { 7000:2F81; region anchor, exact origin unknown }
            local_1b := 0; { 7000:2F86 }
          until not ((local_1e <> $0)); { 7000:2F86; region anchor, exact origin unknown }
          uVar4 := Word(bVar3); { 7000:2F86; region anchor, exact origin unknown }
          Ptr<Byte>(local_23)[(uVar4 + $32)] := 1; { 7000:2F86; region anchor, exact origin unknown }
          local_1b := bVar3; { 7000:2F86; region anchor, exact origin unknown }
        end; { 7000:2F86; region anchor, exact origin unknown }
        local_11 := FUN_7000_4235(MakeWord(ShortInt((uVar4 shr 8)), local_e), g_5D92, g_5D94); { 7000:2FB1 }
        local_11 := (local_11 and $FF); { 7000:2FB6 }
        local_13 := (local_11 div local_f); { 7000:2FC6 }
        if (local_13 = 0) then begin { 7000:2FC6; region anchor, exact origin unknown }
          local_13 := 1; { 7000:2FCF }
        end; { 7000:2FCF; region anchor, exact origin unknown }
        Ptr<Byte>(local_23)[$B1] := (Ptr<Byte>(local_23)[$B1] + ShortInt(local_13)); { 7000:2FCF; region anchor, exact origin unknown }
        cVar2 := FUN_7000_3f31(g_5D92, g_5D94); { 7000:2FE8 }
        local_13 := (SmallInt((local_11 + SmallInt(cVar2))) div SmallInt(Word(local_f))); { 7000:2FFF }
        if (SmallInt(local_13) < 1) then begin { 7000:2FFF; region anchor, exact origin unknown }
          local_13 := 1; { 7000:3008 }
        end; { 7000:3008; region anchor, exact origin unknown }
        uVar12 := Word((LongWord(local_23) shr $10)); { 7000:3008; region anchor, exact origin unknown }
        pbVar11 := Ptr<Byte>(local_23); { 7000:3008; region anchor, exact origin unknown }
        bVar3 := pbVar11[$11B]; { 7000:3008; region anchor, exact origin unknown }
        bVar1 := pbVar11[$32]; { 7000:3008; region anchor, exact origin unknown }
        pbVar11[$32] := (pbVar11[$32] + ShortInt(local_13)); { 7000:3008; region anchor, exact origin unknown }
        pbVar11[$11B] := (pbVar11[$32] - (bVar1 - bVar3)); { 7000:3008; region anchor, exact origin unknown }
      end; { 7000:3008; region anchor, exact origin unknown }
    end; { 7000:3008; region anchor, exact origin unknown }
  end else begin { 7000:3008; region anchor, exact origin unknown }
    puVar15 := local_3e; { 7000:3008; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$34))) := 'Congratulations...'; { 7000:2EAE }
    FUN_0709_0d68(MakeWord(UNK_extraout_AH, $E), puVar15, UNK_unaff_SS); { 7000:2D00 }
  end; { 7000:2D00; region anchor, exact origin unknown }
  Exit; { 7000:304E }
end;
```

### ov16:306D AddRosterCharacter (conf M)

Original `FUN_7000_306d`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -116:2, -31:2, -28:2, -16:1, -15:1/2, -14:1, -13:1, -12:2, -10:2, -E:2, -C:2, -A:2, -8:2, -6:2, -4:2, -2:2.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; iVar1: SmallInt; uVar2: Word; unaff_SS: Word; bVar3: Boolean; puVar4: ^Byte; uVar5: Word; puVar6: ^Byte; uVar7: Word; local_118: array[0..229-1] of Byte; local_33: array[0..9-1] of Byte; local_2a: array[0..18-1] of Byte; local_18: Byte; local_17: Byte; local_16: Byte; local_15: ShortInt; local_14: Word; local_12: SmallInt; iStack_10: SmallInt; local_e: LongWord; local_a: SmallInt; iStack_8: SmallInt; local_6: SmallInt; local_4: SmallInt.
Callers: ov16_0161.
Callees (listing): FUN_03f1_0137, stub_ov17_e1, System.@StrCopy, stub_ov25_e4, System.GetMem, stub_ov17_e5, System.@StrAppend, System.@StrAssign, stub_ov17_e10, stub_ov17_e3, System.@StrCompare, System.FreeMem, stub_ov17_e2, stub_ov25_e7.

Rejects active * entries; capacity checks; reads character and appends party. Evidence: decode/listings/ov16.lst at 7000:306D, paired .c.

```pascal
procedure FUN_7000_306d();
begin
  FUN_03f1_0137($16, $26, 1, 1); { 7000:3080 }
  uVar2 := $7C; { 7000:3080; region anchor, exact origin unknown }
  stub_ov17_e1(@local_6, UNK_unaff_SS); { 7000:308A }
  if ((local_6 <> 0) or else (local_4 <> 0)) then begin { 7000:308A; region anchor, exact origin unknown }
    local_14 := 0; { 7000:309C }
    local_a := local_6; { 7000:30A5 }
    iStack_8 := local_4; { 7000:30A5; region anchor, exact origin unknown }
    local_17 := 1; { 7000:30AB }
    repeat { 7000:30AB; region anchor, exact origin unknown }
      puVar6 := local_2a; { 7000:30AB; region anchor, exact origin unknown }
      uVar7 := UNK_unaff_SS; { 7000:30AB; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$28))) := 'Add a character: '; { 7000:30B9 }
      puVar4 := local_33; { 7000:30B9; region anchor, exact origin unknown }
      uVar5 := UNK_unaff_SS; { 7000:30B9; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$31))) := 'Add Exit'; { 7000:30C8 }
      uVar2 := $3C5; { 7000:30C8; region anchor, exact origin unknown }
      local_15 := stub_ov25_e4(@local_a, UNK_unaff_SS, @local_14, UNK_unaff_SS, @local_17, UNK_unaff_SS, MakeWord(UNK_extraout_AH, local_16), local_6, local_4, MakeWord(UNK_extraout_AH, $16), MakeWord(UNK_extraout_AH, $26), MakeWord(UNK_extraout_AH, 2), MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), puVar4, uVar5, puVar6, uVar7); { 7000:30FB }
      if (((local_15 = $D) or else (local_15 = $41)) and then ((Ptr<ShortInt>((local_a + 1)))^ <> $2A)) then begin { 7000:30FB; region anchor, exact origin unknown }
        local_e := GetMem($11D); { 7000:3123 }
        stub_ov17_e5(1, (Word(local_e) and $FF00), local_e, local_a, iStack_8); { 7000:313F }
        puVar6 := local_118; { 7000:313F; region anchor, exact origin unknown }
        uVar2 := UNK_unaff_SS; { 7000:313F; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$116))) := '* '; { 7000:314F }
        PString(FarPtr(SS, BPAddr(-$116))) := PString(FarPtr(SS, BPAddr(-$116))) + PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8)))); { 7000:3159 }
        PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8)))) := Copy(PString(FarPtr(SS, BPAddr(-$116))), 1, $28); { 7000:3167 }
        local_18 := 0; { 7000:316C }
        if ((g_5D96 = 0) and then (g_5D98 = 0)) then begin { 7000:316C; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(g_49D6) + $67C)))^ := 0; { 7000:316C; region anchor, exact origin unknown }
          stub_ov17_e10(SmallInt(local_e), ExtractBytes(local_e, 2, 2)); { 7000:318A }
          uVar2 := $7C; { 7000:318A; region anchor, exact origin unknown }
          stub_ov17_e3(MakeWord(UNK_extraout_AH_00, 1)); { 7000:3192 }
        end else begin { 7000:3192; region anchor, exact origin unknown }
          _local_12 := MakeLong(g_5D98, g_5D96); { 7000:3192; region anchor, exact origin unknown }
          while true do begin { 7000:3192; region anchor, exact origin unknown }
            bVar3 := ((local_12 = 0) and then (iStack_10 = 0)); { 7000:3192; region anchor, exact origin unknown }
            if ((local_12 = 0) and then (iStack_10 = 0)) then begin { 7000:3192; region anchor, exact origin unknown }
              Break; { 7000:3192; region anchor, exact origin unknown }
            end; { 7000:3192; region anchor, exact origin unknown }
            CompareStrFlags(PString(FarPtr(FarSeg(BPWord(-$10)), FarOff(BPWord(-$10)))), PString(FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C))))); { 7000:31B9 }
            iVar1 := SmallInt(_local_12); { 7000:31B9; region anchor, exact origin unknown }
            uVar2 := Word((LongWord(_local_12) shr $10)); { 7000:31B9; region anchor, exact origin unknown }
            if (bVar3 and then ((Ptr<ShortInt>((iVar1 + $AB)))^ = (Ptr<ShortInt>((SmallInt(local_e) + $AB)))^)) then begin { 7000:31B9; region anchor, exact origin unknown }
              Break; { 7000:31B9; region anchor, exact origin unknown }
            end; { 7000:31B9; region anchor, exact origin unknown }
            if ((Ptr<Byte>((iVar1 + $84)))^ < $80) then begin { 7000:31B9; region anchor, exact origin unknown }
              local_18 := (local_18 + 1); { 7000:31DD }
            end; { 7000:31DD; region anchor, exact origin unknown }
            _local_12 := MakeLong((Ptr<Word>((iVar1 + $106)))^, (Ptr<Word>((iVar1 + $104)))^); { 7000:31DD; region anchor, exact origin unknown }
          end; { 7000:31DD; region anchor, exact origin unknown }
          if (((local_12 = 0) and then (iStack_10 = 0)) and then ((((Ptr<Byte>((SmallInt(local_e) + $84)))^ < $80) and then (local_18 < 6)) or else (($7F < (Ptr<Byte>((SmallInt(local_e) + $84)))^) and then ((Ptr<Word>((SmallInt(g_49D6) + $67C)))^ < 8)))) then begin { 7000:31DD; region anchor, exact origin unknown }
            stub_ov17_e10(SmallInt(local_e), ExtractBytes(local_e, 2, 2)); { 7000:322B }
            uVar2 := $7C; { 7000:322B; region anchor, exact origin unknown }
            stub_ov17_e3(MakeWord(UNK_extraout_AH_01, 1)); { 7000:3233 }
            if ((Ptr<Byte>((SmallInt(local_e) + $84)))^ < $80) then begin { 7000:3233; region anchor, exact origin unknown }
              local_18 := (local_18 + 1); { 7000:3243 }
            end; { 7000:3243; region anchor, exact origin unknown }
          end else begin { 7000:3243; region anchor, exact origin unknown }
            uVar2 := $AF8; { 7000:3243; region anchor, exact origin unknown }
            FreeMem(FarPtr(BPWord(-$A), BPWord(-$C)), $11D); { 7000:3252 }
          end; { 7000:3252; region anchor, exact origin unknown }
        end; { 7000:3252; region anchor, exact origin unknown }
      end; { 7000:3252; region anchor, exact origin unknown }
    until not (((((local_15 <> $45) and then (local_15 <> $0)) and then (local_18 < 6)) and then ((Ptr<Word>((SmallInt(g_49D6) + $67C)))^ < 8))); { 7000:3252; region anchor, exact origin unknown }
    stub_ov17_e2(local_6, local_4); { 7000:327E }
    stub_ov25_e7(@local_6, UNK_unaff_SS); { 7000:3288 }
  end; { 7000:3288; region anchor, exact origin unknown }
  Exit; { 7000:3290 }
end;
```

### ov16:3291 RemovePartyCharacter (conf M)

Original `ov16_3291`. Params (ABI order): param_1: ShortInt; param_2: ShortInt.
BP access inventory (hex offset:byte widths): -4:2, -2:2, +6:1, +8:1.
Locals/SSA temporaries: piVar1: ^SmallInt; uVar2: Word; uVar3: Word; iVar4: SmallInt; uVar5: Word; uVar6: Word; local_6: SmallInt; iStack_4: SmallInt.
Callers: FUN_7000_1f37,ov16_0161.
Callees (listing): stub_ov32_e3, FUN_7000_0000.

Unlinks selected member; optional freeing; updates count. Evidence: decode/listings/ov16.lst at 7000:3291, paired .c.

```pascal
procedure ov16_3291(param_1: ShortInt; param_2: ShortInt);
begin
  if ((g_5D96 <> 0) or else (g_5D98 <> 0)) then begin { 7000:3291; region anchor, exact origin unknown }
    local_6 := g_5D96; { 7000:32AA }
    iStack_4 := g_5D98; { 7000:32AA; region anchor, exact origin unknown }
    if ((g_5D98 = g_5D94) and then (g_5D96 = g_5D92)) then begin { 7000:32AA; region anchor, exact origin unknown }
      if (param_1 <> $0) then begin { 7000:32AA; region anchor, exact origin unknown }
        stub_ov32_e3(MakeWord(ShortInt((Word(g_5D96) shr 8)), (Ptr<Byte>((g_5D92 + $BF)))^)); { 7000:3321 }
      end; { 7000:3321; region anchor, exact origin unknown }
      uVar6 := Word((LongWord(g_5D92) shr $10)); { 7000:3321; region anchor, exact origin unknown }
      iVar4 := SmallInt(g_5D92); { 7000:3321; region anchor, exact origin unknown }
      g_5D96 := (Ptr<SmallInt>((iVar4 + $104)))^; { 7000:338E }
      g_5D98 := (Ptr<SmallInt>((iVar4 + $106)))^; { 7000:3391 }
      uVar2 := (Ptr<Word>((iVar4 + $104)))^; { 7000:3391; region anchor, exact origin unknown }
      uVar5 := (Ptr<Word>((iVar4 + $106)))^; { 7000:3391; region anchor, exact origin unknown }
      FUN_7000_0000(iVar4, uVar6); { 7000:334A }
      g_5D92 := MakeLong(uVar5, uVar2); { 7000:3353 }
      if (param_2 = $0) then begin { 7000:3353; region anchor, exact origin unknown }
        piVar1 := Ptr<SmallInt>((SmallInt(g_49D6) + $67C)); { 7000:3353; region anchor, exact origin unknown }
        (piVar1)^ := ((piVar1)^ + (-1)); { 7000:3353; region anchor, exact origin unknown }
      end; { 7000:3353; region anchor, exact origin unknown }
    end else begin { 7000:3353; region anchor, exact origin unknown }
      while ((((Ptr<SmallInt>((local_6 + $106)))^ <> g_5D94) or else ((Ptr<SmallInt>((local_6 + $104)))^ <> g_5D92)) and then (((Ptr<SmallInt>((local_6 + $104)))^ <> 0) or else ((Ptr<SmallInt>((local_6 + $106)))^ <> 0))) do begin { 7000:3353; region anchor, exact origin unknown }
        piVar1 := Ptr<SmallInt>((local_6 + $104)); { 7000:3353; region anchor, exact origin unknown }
        iStack_4 := (Ptr<SmallInt>((local_6 + $106)))^; { 7000:3353; region anchor, exact origin unknown }
        local_6 := (piVar1)^; { 7000:33A3 }
      end; { 7000:33A3; region anchor, exact origin unknown }
      uVar3 := ((Ptr<Word>((local_6 + $104)))^ or (Ptr<Word>((local_6 + $106)))^); { 7000:33A3; region anchor, exact origin unknown }
      if (uVar3 <> 0) then begin { 7000:33A3; region anchor, exact origin unknown }
        if (param_1 <> $0) then begin { 7000:33A3; region anchor, exact origin unknown }
          stub_ov32_e3(MakeWord(ShortInt((uVar3 shr 8)), (Ptr<Byte>((g_5D92 + $BF)))^)); { 7000:337B }
        end; { 7000:337B; region anchor, exact origin unknown }
        uVar5 := Word((LongWord(g_5D92) shr $10)); { 7000:337B; region anchor, exact origin unknown }
        uVar2 := (Ptr<Word>((SmallInt(g_5D92) + $106)))^; { 7000:337B; region anchor, exact origin unknown }
        (Ptr<Word>((local_6 + $104)))^ := (Ptr<Word>((SmallInt(g_5D92) + $104)))^; { 7000:337B; region anchor, exact origin unknown }
        (Ptr<Word>((local_6 + $106)))^ := uVar2; { 7000:337B; region anchor, exact origin unknown }
        FUN_7000_0000(g_5D92, g_5D94); { 7000:33B2 }
        g_5D92 := MakeLong(iStack_4, local_6); { 7000:33BB }
        if (param_2 = $0) then begin { 7000:33BB; region anchor, exact origin unknown }
          piVar1 := Ptr<SmallInt>((SmallInt(g_49D6) + $67C)); { 7000:33BB; region anchor, exact origin unknown }
          (piVar1)^ := ((piVar1)^ + (-1)); { 7000:33BB; region anchor, exact origin unknown }
        end; { 7000:33BB; region anchor, exact origin unknown }
      end; { 7000:33BB; region anchor, exact origin unknown }
    end; { 7000:33BB; region anchor, exact origin unknown }
  end; { 7000:33BB; region anchor, exact origin unknown }
  Exit; { 7000:33D4 }
end;
```

### ov16:33E7 ChoosePortrait (conf M)

Original `FUN_7000_33e7`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -18:2, -9:2, -8:2, -6:2, -4:1, -3:1, -2:1/2, -1:1.
Locals/SSA temporaries: extraout_AH: Byte; unaff_SS: Word; puVar1: ^Byte; uVar2: Word; puVar3: ^Byte; uVar4: Word; local_1a: array[0..15-1] of Byte; local_b: Byte; local_a: SmallInt; uStack_8: Word; local_6: Byte; local_5: Byte; local_4: ShortInt; local_3: ShortInt.
Callers: FUN_7000_1551.
Callees (listing): stub_ov28_e4, System.@StrCopy, stub_ov25_e2, stub_ov25_e3.

Head/body selection and Keep. Evidence: decode/listings/ov16.lst at 7000:33E7, paired .c.

```pascal
procedure FUN_7000_33e7();
begin
  uStack_8 := Word((LongWord(g_5D92) shr $10)); { 7000:33E7; region anchor, exact origin unknown }
  local_a := SmallInt(g_5D92); { 7000:33F1 }
  local_5 := (Ptr<Byte>((local_a + $BB)))^; { 7000:33FF }
  local_6 := (Ptr<Byte>((local_a + $BC)))^; { 7000:340A }
  repeat { 7000:340A; region anchor, exact origin unknown }
    stub_ov28_e4(); { 7000:340D }
    puVar3 := @local_b; { 7000:340D; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7000:340D; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$9))) := ''; { 7000:341C }
    puVar1 := local_1a; { 7000:341C; region anchor, exact origin unknown }
    uVar2 := UNK_unaff_SS; { 7000:341C; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$18))) := 'Head Body Keep'; { 7000:342B }
    local_3 := stub_ov25_e2(@local_4, UNK_unaff_SS, (Word(UNK_extraout_AH) shl 8), (Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $F), (Word(UNK_extraout_AH) shl 8), puVar1, uVar2, puVar3, uVar4); { 7000:3444 }
    if (local_4 = $0) then begin { 7000:3444; region anchor, exact origin unknown }
      if (local_3 = $48) then begin { 7000:3444; region anchor, exact origin unknown }
        if ((Ptr<Byte>((local_a + $BB)))^ < $E) then begin { 7000:3444; region anchor, exact origin unknown }
          (Ptr<ShortInt>((local_a + $BB)))^ := ((Ptr<ShortInt>((local_a + $BB)))^ + $1); { 7000:3444; region anchor, exact origin unknown }
        end else begin { 7000:3444; region anchor, exact origin unknown }
          (Ptr<Byte>((local_a + $BB)))^ := 1; { 7000:3444; region anchor, exact origin unknown }
        end; { 7000:3444; region anchor, exact origin unknown }
      end else begin { 7000:3444; region anchor, exact origin unknown }
        if (local_3 = $42) then begin { 7000:3444; region anchor, exact origin unknown }
          if ((Ptr<Byte>((local_a + $BC)))^ < $C) then begin { 7000:3444; region anchor, exact origin unknown }
            (Ptr<ShortInt>((local_a + $BC)))^ := ((Ptr<ShortInt>((local_a + $BC)))^ + $1); { 7000:3444; region anchor, exact origin unknown }
          end else begin { 7000:3444; region anchor, exact origin unknown }
            (Ptr<Byte>((local_a + $BC)))^ := 1; { 7000:3444; region anchor, exact origin unknown }
          end; { 7000:3444; region anchor, exact origin unknown }
        end else begin { 7000:3444; region anchor, exact origin unknown }
          if (local_3 = $4B) then begin { 7000:3444; region anchor, exact origin unknown }
            local_5 := (Ptr<Byte>((local_a + $BB)))^; { 7000:34A9 }
            local_6 := (Ptr<Byte>((local_a + $BC)))^; { 7000:34B4 }
          end; { 7000:34B4; region anchor, exact origin unknown }
        end; { 7000:34B4; region anchor, exact origin unknown }
      end; { 7000:34B4; region anchor, exact origin unknown }
    end; { 7000:34B4; region anchor, exact origin unknown }
  until not ((local_3 <> $4B)); { 7000:34B4; region anchor, exact origin unknown }
  (Ptr<Byte>((local_a + $BB)))^ := local_5; { 7000:34B4; region anchor, exact origin unknown }
  (Ptr<Byte>((local_a + $BC)))^ := local_6; { 7000:34B4; region anchor, exact origin unknown }
  stub_ov25_e3(); { 7000:34D6 }
  Exit; { 7000:34DE }
end;
```

### ov16:34DF PreviewCombatIcon (conf M)

Original `FUN_7000_34df`. Params (ABI order): param_1: Word; param_2: Byte; param_3: Byte.
BP access inventory (hex offset:byte widths): +8:1, +A:1.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; bVar1: Byte; extraout_AH_01: Byte.
Callers: ov16_382D.
Callees (listing): FUN_0464_2632, stub_ov32_e5, FUN_0464_1b52.

Icon preview. Evidence: decode/listings/ov16.lst at 7000:34DF, paired .c.

```pascal
procedure FUN_7000_34df(param_1: Word; param_2: Byte; param_3: Byte);
begin
  if (g_4A1E = $0) then begin { 7000:34DF; region anchor, exact origin unknown }
    FUN_0464_2632(g_4A20, g_4A22, Ptr<UnknownValue>(@g_260A), $C7C, 3, $18, $C, (Word(param_2) * $18), (Word(param_3) * 3)); { 7000:3518 }
    bVar1 := UNK_extraout_AH; { 7000:3518; region anchor, exact origin unknown }
  end else begin { 7000:3518; region anchor, exact origin unknown }
    FUN_0464_2632(g_4A20, g_4A22, Ptr<UnknownValue>(@g_260A), $C7C, 0, $18, $C, (Word(param_2) * $18), (Word(param_3) * 3)); { 7000:354E }
    stub_ov32_e5(MakeWord(UNK_extraout_AH_00, $19), (Word(UNK_extraout_AH_00) shl 8), (Word(UNK_extraout_AH_00) shl 8), MakeWord(UNK_extraout_AH_00, param_2), MakeWord(UNK_extraout_AH_00, param_3)); { 7000:3564 }
    bVar1 := Byte(((param_3 + 3) shr 8)); { 7000:3564; region anchor, exact origin unknown }
    stub_ov32_e5(MakeWord(bVar1, $19), MakeWord(bVar1, 1), (Word(bVar1) shl 8), MakeWord(bVar1, param_2), (param_3 + 3)); { 7000:357F }
    bVar1 := UNK_extraout_AH_01; { 7000:357F; region anchor, exact origin unknown }
  end; { 7000:357F; region anchor, exact origin unknown }
  stub_ov32_e5(MakeWord(bVar1, $C), (Word(bVar1) shl 8), (Word(bVar1) shl 8), MakeWord(bVar1, param_2), MakeWord(bVar1, param_3)); { 7000:3595 }
  bVar1 := Byte(((param_3 + 3) shr 8)); { 7000:3595; region anchor, exact origin unknown }
  stub_ov32_e5(MakeWord(bVar1, $C), MakeWord(bVar1, 1), (Word(bVar1) shl 8), MakeWord(bVar1, param_2), (param_3 + 3)); { 7000:35B0 }
  FUN_0464_1b52(); { 7000:35B5 }
  Exit; { 7000:35BB }
end;
```

### ov16:35BE RemapCombatIcon (conf M)

Original `FUN_7000_35be`. Params (ABI order): param_1: Word; param_2: ShortInt; param_3: Byte; param_4: Byte.
BP access inventory (hex offset:byte widths): -28:2, -26:2, -24:2, -22:1/2, -12:1/2, -1:1, +8:1, +A:1, +C:1.
Locals/SSA temporaries: uVar1: LongWord; uVar2: LongWord; uVar3: Word; unaff_SS: Word; local_26: Word; local_24: array[0..8-1] of Byte; abStack_1c: array[0..8-1] of Byte; local_14: array[0..17-1] of Byte; local_3: Byte.
Callers: ov16_382D.
Callees (listing): System.Move, FUN_0464_1e5c.

Icon copy/remapping. Evidence: decode/listings/ov16.lst at 7000:35BE, paired .c.

```pascal
procedure FUN_7000_35be(param_1: Word; param_2: ShortInt; param_3: Byte; param_4: Byte);
begin
  local_26 := (Ptr<Word>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_3) * 8))))^) + $11)))^; { 7000:35D7 }
  if (g_4A1E = $1) then begin { 7000:35D7; region anchor, exact origin unknown }
    local_26 := (local_26 shr 2); { 7000:35E8 }
  end; { 7000:35E8; region anchor, exact origin unknown }
  Move(FarPtr(SmallInt((LongWord((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_4) * 8))))^) shr $10)), (SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_4) * 8))))^) + $17)), FarPtr(SmallInt((LongWord((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_3) * 8))))^) shr $10)), (SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_3) * 8))))^) + $17)), (Ptr<Word>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_3) * 8))))^) + $11)))^); { 7000:3628 }
  Move(FarPtr(SmallInt((LongWord((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_4) * 8))))^) shr $10)), (SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_4) * 8))))^) + $17)), FarPtr(SmallInt((LongWord((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_3) * 8))))^) shr $10)), (SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_3) * 8))))^) + $17)), (Ptr<Word>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_3) * 8))))^) + $11)))^); { 7000:366A }
  uVar1 := (Ptr<LongWord>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_4) * 8))))^) + $13)))^; { 7000:366A; region anchor, exact origin unknown }
  uVar2 := (Ptr<LongWord>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_3) * 8))))^) + $13)))^; { 7000:366A; region anchor, exact origin unknown }
  Move(FarPtr(SmallInt((LongWord(uVar1) shr $10)), SmallInt(uVar1)), FarPtr(SmallInt((LongWord(uVar2) shr $10)), SmallInt(uVar2)), local_26); { 7000:369C }
  uVar1 := (Ptr<LongWord>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_4) * 8))))^) + $13)))^; { 7000:369C; region anchor, exact origin unknown }
  uVar2 := (Ptr<LongWord>((SmallInt((Ptr<LongWord>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_3) * 8))))^) + $13)))^; { 7000:369C; region anchor, exact origin unknown }
  Move(FarPtr(SmallInt((LongWord(uVar1) shr $10)), SmallInt(uVar1)), FarPtr(SmallInt((LongWord(uVar2) shr $10)), SmallInt(uVar2)), local_26); { 7000:36CE }
  if (param_2 <> $0) then begin { 7000:36CE; region anchor, exact origin unknown }
    local_3 := 0; { 7000:36E6 }
    while true do begin { 7000:36E6; region anchor, exact origin unknown }
      local_14[local_3] := local_3; { 7000:36E6; region anchor, exact origin unknown }
      local_24[local_3] := local_3; { 7000:36E6; region anchor, exact origin unknown }
      if (local_3 = $F) then begin { 7000:36E6; region anchor, exact origin unknown }
        Break; { 7000:36E6; region anchor, exact origin unknown }
      end; { 7000:36E6; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 7000:36EC }
    end; { 7000:36EC; region anchor, exact origin unknown }
    local_3 := 1; { 7000:370F }
    while true do begin { 7000:370F; region anchor, exact origin unknown }
      uVar3 := Word((LongWord(g_5D92) shr $10)); { 7000:370F; region anchor, exact origin unknown }
      local_24[Byte(Ptr<UnknownValue>(@g_3CF5)[local_3])] := ((Ptr<Byte>(((SmallInt(g_5D92) + Word(local_3)) + $C0)))^ and $F); { 7000:370F; region anchor, exact origin unknown }
      abStack_1c[Byte(Ptr<UnknownValue>(@g_3CF5)[local_3])] := ((Ptr<Byte>(((SmallInt(g_5D92) + Word(local_3)) + $C0)))^ shr 4); { 7000:370F; region anchor, exact origin unknown }
      if (local_3 = 6) then begin { 7000:370F; region anchor, exact origin unknown }
        Break; { 7000:370F; region anchor, exact origin unknown }
      end; { 7000:370F; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 7000:3715 }
    end; { 7000:3715; region anchor, exact origin unknown }
    FUN_0464_1e5c((Ptr<Word>((Ptr<UnknownValue>(@g_5E5A) + (Word(param_3) * 8))))^, (Ptr<Word>((Ptr<UnknownValue>(@g_5E5C) + (Word(param_3) * 8))))^, 0, 0, local_24, UNK_unaff_SS, local_14, UNK_unaff_SS); { 7000:3795 }
    FUN_0464_1e5c((Ptr<Word>((Ptr<UnknownValue>(@g_5E5E) + (Word(param_3) * 8))))^, (Ptr<Word>((Ptr<UnknownValue>(@g_5E60) + (Word(param_3) * 8))))^, 0, 0, local_24, UNK_unaff_SS, local_14, UNK_unaff_SS); { 7000:37BD }
  end; { 7000:37BD; region anchor, exact origin unknown }
  Exit; { 7000:37C5 }
end;
```

### ov16:382D EditCombatIcon (conf M)

Original `ov16_382D`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -120:2, -2E:2, -2D:2, -23:2, -21:2, -20:2, -1F:2, -1D:2, -1C:2, -1B:1, -1A:1, -19:1, -18:1, -17:1, -16:1, -15:2, -E:1/2, -8:1, -7:1, -6:1, -5:1, -4:1, -3:1/2, -2:1.
Locals/SSA temporaries: in_AX: Word; bVar7: Byte; uVar1: Word; uVar2: Word; uVar3: Word; iVar4: SmallInt; iVar5: SmallInt; uVar6: Word; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; extraout_AH_06: Byte; extraout_AH_07: Byte; extraout_AH_08: Byte; extraout_AH_09: Byte; extraout_AH_10: Byte; extraout_AH_11: Byte; extraout_AH_12: Byte; extraout_AH_13: Byte; extraout_AH_14: Byte; iVar8: SmallInt; uVar9: Word; uVar10: Word; unaff_SS: Word; bVar11: Boolean; puVar12: ^LongWord; puVar13: ^Byte; local_122: array[0..242-1] of Byte; local_30: Byte; local_2f: array[0..10-1] of Byte; local_25: LongWord; local_21: LongWord; local_1d: ShortInt; local_1c: Byte; local_1b: Byte; local_1a: Byte; local_19: ShortInt; local_18: Byte; local_17: array[0..7-1] of Byte; local_10: array[0..6-1] of Byte; local_a: Byte; local_9: Byte; local_8: Byte; local_7: Byte; local_6: Byte; local_5: ShortInt; local_4: ShortInt.
Callers: FUN_7000_1551.
Callees (listing): System.@StrCopy, FUN_03f1_02e8, stub_ov31_e2, stub_ov17_e3, System.@CopyBytes, FUN_7000_35be, FUN_7000_34df, FUN_0709_0626, System.@StrAssign, System.@StrAppend, stub_ov25_e2, System.Delete, System.Insert, System.@SetIn, stub_ov25_e3, stub_ov32_e3, stub_ov32_e4, stub_ov25_e5, stub_ov31_e3.

Ready/action, size and body colors; Keep/Exit confirmation. Evidence: decode/listings/ov16.lst at 7000:382D, paired .c.

```pascal
procedure ov16_382D();
begin
  bVar7 := Byte((Word(UNK_in_AX) shr 8)); { 7000:382D; region anchor, exact origin unknown }
  uVar10 := MakeWord(bVar7, 1); { 7000:382D; region anchor, exact origin unknown }
  uVar1 := MakeWord(bVar7, 1); { 7000:382D; region anchor, exact origin unknown }
  uVar2 := MakeWord(bVar7, $26); { 7000:382D; region anchor, exact origin unknown }
  uVar3 := MakeWord(bVar7, $16); { 7000:382D; region anchor, exact origin unknown }
  iVar4 := (Word(bVar7) shl 8); { 7000:382D; region anchor, exact origin unknown }
  iVar5 := (Word(bVar7) shl 8); { 7000:382D; region anchor, exact origin unknown }
  iVar8 := (SmallInt(@local_21) + 3); { 7000:382D; region anchor, exact origin unknown }
  uVar9 := UNK_unaff_SS; { 7000:382D; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1C))) := ''; { 7000:3850 }
  FUN_03f1_02e8(iVar8, uVar9, iVar5, iVar4, uVar3, uVar2, uVar1, uVar10); { 7000:3855 }
  uVar6 := stub_ov31_e2(); { 7000:385A }
  repeat { 7000:385A; region anchor, exact origin unknown }
    stub_ov17_e3((uVar6 and $FF00)); { 7000:3862 }
    local_21 := g_5D92; { 7000:386B }
    local_a := 1; { 7000:3871 }
    Move(FarPtr(FarSeg(BPWord(-$1F)), (FarOff(BPWord(-$1F)) + $C1)), FarPtr(SS, BPAddr(-$15)), $6); { 7000:3887 }
    uVar9 := Word((LongWord(local_21) shr $10)); { 7000:3887; region anchor, exact origin unknown }
    local_9 := (Ptr<Byte>((SmallInt(local_21) + $BF)))^; { 7000:3894 }
    (Ptr<Byte>((SmallInt(local_21) + $BF)))^ := $C; { 7000:3894; region anchor, exact origin unknown }
    stub_ov17_e3((Word(UNK_extraout_AH) shl 8)); { 7000:38A3 }
    uVar9 := Word((LongWord(local_21) shr $10)); { 7000:38A3; region anchor, exact origin unknown }
    iVar8 := SmallInt(local_21); { 7000:38A3; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar8 + $BF)))^ := local_9; { 7000:38A3; region anchor, exact origin unknown }
    local_6 := (Ptr<Byte>((iVar8 + $BD)))^; { 7000:38BB }
    local_7 := (Ptr<Byte>((iVar8 + $BE)))^; { 7000:38C6 }
    local_8 := (Ptr<Byte>((iVar8 + $C0)))^; { 7000:38D1 }
    FUN_7000_35be(@stack0xfffe, MakeWord(UNK_extraout_AH_00, 1), MakeWord(UNK_extraout_AH_00, $C), MakeWord(UNK_extraout_AH_00, (Ptr<Byte>((iVar8 + $BF)))^)); { 7000:38E5 }
    FUN_7000_34df(@stack0xfffe, MakeWord(UNK_extraout_AH_01, 2), MakeWord(UNK_extraout_AH_01, 1)); { 7000:38F0 }
    uVar10 := MakeWord(UNK_extraout_AH_02, 8); { 7000:38F0; region anchor, exact origin unknown }
    uVar1 := MakeWord(UNK_extraout_AH_02, 6); { 7000:38F0; region anchor, exact origin unknown }
    uVar2 := MakeWord(UNK_extraout_AH_02, $F); { 7000:38F0; region anchor, exact origin unknown }
    puVar12 := @local_25; { 7000:38F0; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:38F0; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$23))) := 'old'; { 7000:3906 }
    FUN_0709_0626(puVar12, uVar9, uVar2, uVar1, uVar10); { 7000:390B }
    uVar10 := MakeWord(UNK_extraout_AH_03, 3); { 7000:390B; region anchor, exact origin unknown }
    uVar1 := MakeWord(UNK_extraout_AH_03, 10); { 7000:390B; region anchor, exact origin unknown }
    uVar2 := MakeWord(UNK_extraout_AH_03, $F); { 7000:390B; region anchor, exact origin unknown }
    puVar13 := @local_30; { 7000:390B; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:390B; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2E))) := 'ready   action'; { 7000:3923 }
    FUN_0709_0626(puVar13, uVar9, uVar2, uVar1, uVar10); { 7000:3928 }
    uVar10 := MakeWord(UNK_extraout_AH_04, 8); { 7000:3928; region anchor, exact origin unknown }
    uVar1 := MakeWord(UNK_extraout_AH_04, $C); { 7000:3928; region anchor, exact origin unknown }
    uVar2 := MakeWord(UNK_extraout_AH_04, $F); { 7000:3928; region anchor, exact origin unknown }
    puVar12 := @local_25; { 7000:3928; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:3928; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$23))) := 'new'; { 7000:3940 }
    FUN_0709_0626(puVar12, uVar9, uVar2, uVar1, uVar10); { 7000:3945 }
    uVar10 := MakeWord(UNK_extraout_AH_05, 3); { 7000:3945; region anchor, exact origin unknown }
    uVar1 := MakeWord(UNK_extraout_AH_05, $10); { 7000:3945; region anchor, exact origin unknown }
    uVar2 := MakeWord(UNK_extraout_AH_05, $F); { 7000:3945; region anchor, exact origin unknown }
    puVar13 := @local_30; { 7000:3945; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:3945; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2E))) := 'ready   action'; { 7000:395D }
    FUN_0709_0626(puVar13, uVar9, uVar2, uVar1, uVar10); { 7000:3962 }
    uVar9 := $709; { 7000:3962; region anchor, exact origin unknown }
    repeat { 7000:3962; region anchor, exact origin unknown }
      repeat { 7000:3962; region anchor, exact origin unknown }
        FUN_7000_34df(@stack0xfffe, 4, 1); { 7000:396F }
        local_10[0] := 0; { 7000:396F; region anchor, exact origin unknown }
        uVar10 := uVar9; { 7000:396F; region anchor, exact origin unknown }
        if (local_a = 4) then begin { 7000:396F; region anchor, exact origin unknown }
          if ((Ptr<ShortInt>((SmallInt(local_21) + $C0)))^ = $2) then begin { 7000:396F; region anchor, exact origin unknown }
            uVar10 := $AF8; { 7000:396F; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$E))) := Copy('Small', 1, $5); { 7000:3995 }
          end else begin { 7000:3995; region anchor, exact origin unknown }
            uVar10 := $AF8; { 7000:3995; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$E))) := Copy('Large', 1, $5); { 7000:39AA }
          end; { 7000:39AA; region anchor, exact origin unknown }
        end; { 7000:39AA; region anchor, exact origin unknown }
        iVar8 := (SmallInt(@local_25) + 3); { 7000:39AA; region anchor, exact origin unknown }
        uVar1 := UNK_unaff_SS; { 7000:39AA; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$20))) := ''; { 7000:39B9 }
        puVar13 := local_122; { 7000:39B9; region anchor, exact origin unknown }
        uVar10 := UNK_unaff_SS; { 7000:39B9; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$120))) := PString(FarPtr(SS, BPAddr(-$E))); { 7000:39C9 }
        PString(FarPtr(SS, BPAddr(-$120))) := PString(FarPtr(SS, BPAddr(-$120))) + PString(FarPtr($C7C, ((Word(local_a) * $29) + $7BF))); { 7000:39E0 }
        uVar9 := $3C5; { 7000:39E0; region anchor, exact origin unknown }
        uVar10 := stub_ov25_e2(@local_5, UNK_unaff_SS, (Word(UNK_extraout_AH_06) shl 8), (Word(UNK_extraout_AH_06) shl 8), MakeWord(UNK_extraout_AH_06, $F), MakeWord(UNK_extraout_AH_06, 10), MakeWord(UNK_extraout_AH_06, $D), puVar13, uVar10, iVar8, uVar1); { 7000:39F9 }
        local_4 := ShortInt(uVar10); { 7000:39FE }
        if (local_5 = $0) then begin { 7000:39FE; region anchor, exact origin unknown }
          bVar7 := Byte((Word(uVar10) shr 8)); { 7000:39FE; region anchor, exact origin unknown }
          if (local_a = 1) then begin { 7000:39FE; region anchor, exact origin unknown }
            local_1c := 1; { 7000:3A14 }
            if (local_4 = $50) then begin { 7000:3A14; region anchor, exact origin unknown }
              local_a := 2; { 7000:3A1F }
            end else begin { 7000:3A1F; region anchor, exact origin unknown }
              if (local_4 = $31) then begin { 7000:3A1F; region anchor, exact origin unknown }
                local_a := 3; { 7000:3A29 }
                local_19 := $0; { 7000:3A2D }
                Delete('Weapon Body xxxx Shield Arm Leg Exit', $D, $4); { 7000:3A3E }
                uVar9 := $AF8; { 7000:3A3E; region anchor, exact origin unknown }
                Insert_ABI($D, $28, $83A, $0C7C, $37EC, $7000); { 7000:3A55 }
              end else begin { 7000:3A55; region anchor, exact origin unknown }
                if (local_4 = $32) then begin { 7000:3A55; region anchor, exact origin unknown }
                  local_a := 3; { 7000:3A60 }
                  local_19 := $1; { 7000:3A64 }
                  Delete('Weapon Body xxxx Shield Arm Leg Exit', $D, $4); { 7000:3A75 }
                  uVar9 := $AF8; { 7000:3A75; region anchor, exact origin unknown }
                  Insert_ABI($D, $28, $83A, $0C7C, $37F1, $7000); { 7000:3A8C }
                end else begin { 7000:3A8C; region anchor, exact origin unknown }
                  if (local_4 = $53) then begin { 7000:3A8C; region anchor, exact origin unknown }
                    local_a := 4; { 7000:3A97 }
                  end; { 7000:3A97; region anchor, exact origin unknown }
                end; { 7000:3A97; region anchor, exact origin unknown }
              end; { 7000:3A97; region anchor, exact origin unknown }
            end; { 7000:3A97; region anchor, exact origin unknown }
          end else begin { 7000:3A97; region anchor, exact origin unknown }
            bVar11 := (local_a = 2); { 7000:3A97; region anchor, exact origin unknown }
            if bVar11 then begin { 7000:3A97; region anchor, exact origin unknown }
              local_1c := 2; { 7000:3AA2 }
              uVar9 := $AF8; { 7000:3AA2; region anchor, exact origin unknown }
              (uVar10 in PackedSet(FarPtr($3C5, $37F6))); { 7000:3AAF }
              if bVar11 then begin { 7000:3AAF; region anchor, exact origin unknown }
                local_1d := local_4; { 7000:3ABF }
                local_a := 5; { 7000:3AC2 }
              end else begin { 7000:3AC2; region anchor, exact origin unknown }
                local_a := 1; { 7000:3AB6 }
              end; { 7000:3AB6; region anchor, exact origin unknown }
            end else begin { 7000:3AB6; region anchor, exact origin unknown }
              if (local_a = 3) then begin { 7000:3AB6; region anchor, exact origin unknown }
                local_1c := 3; { 7000:3ACD }
                if (local_4 = $57) then begin { 7000:3ACD; region anchor, exact origin unknown }
                  local_18 := 6; { 7000:3AD8 }
                  bVar11 := true; { 7000:3AD8; region anchor, exact origin unknown }
                end else begin { 7000:3AD8; region anchor, exact origin unknown }
                  if (local_4 = $42) then begin { 7000:3AD8; region anchor, exact origin unknown }
                    local_18 := 1; { 7000:3AE2 }
                    bVar11 := true; { 7000:3AE2; region anchor, exact origin unknown }
                  end else begin { 7000:3AE2; region anchor, exact origin unknown }
                    if (local_4 = $48) then begin { 7000:3AE2; region anchor, exact origin unknown }
                      local_18 := 4; { 7000:3AEC }
                      bVar11 := true; { 7000:3AEC; region anchor, exact origin unknown }
                    end else begin { 7000:3AEC; region anchor, exact origin unknown }
                      if (local_4 = $46) then begin { 7000:3AEC; region anchor, exact origin unknown }
                        local_18 := 4; { 7000:3AF6 }
                        bVar11 := true; { 7000:3AF6; region anchor, exact origin unknown }
                      end else begin { 7000:3AF6; region anchor, exact origin unknown }
                        if (local_4 = $53) then begin { 7000:3AF6; region anchor, exact origin unknown }
                          local_18 := 5; { 7000:3B00 }
                          bVar11 := true; { 7000:3B00; region anchor, exact origin unknown }
                        end else begin { 7000:3B00; region anchor, exact origin unknown }
                          if (local_4 = $41) then begin { 7000:3B00; region anchor, exact origin unknown }
                            local_18 := 2; { 7000:3B0A }
                            bVar11 := true; { 7000:3B0A; region anchor, exact origin unknown }
                          end else begin { 7000:3B0A; region anchor, exact origin unknown }
                            bVar11 := (local_4 = $4C); { 7000:3B0A; region anchor, exact origin unknown }
                            if bVar11 then begin { 7000:3B0A; region anchor, exact origin unknown }
                              local_18 := 3; { 7000:3B14 }
                            end else begin { 7000:3B14; region anchor, exact origin unknown }
                              local_18 := 1; { 7000:3B1A }
                            end; { 7000:3B1A; region anchor, exact origin unknown }
                          end; { 7000:3B1A; region anchor, exact origin unknown }
                        end; { 7000:3B1A; region anchor, exact origin unknown }
                      end; { 7000:3B1A; region anchor, exact origin unknown }
                    end; { 7000:3B1A; region anchor, exact origin unknown }
                  end; { 7000:3B1A; region anchor, exact origin unknown }
                end; { 7000:3B1A; region anchor, exact origin unknown }
                uVar9 := $AF8; { 7000:3B1A; region anchor, exact origin unknown }
                (uVar10 in PackedSet(FarPtr($3C5, $37F6))); { 7000:3B27 }
                if bVar11 then begin { 7000:3B27; region anchor, exact origin unknown }
                  local_a := 5; { 7000:3B2E }
                end else begin { 7000:3B2E; region anchor, exact origin unknown }
                  local_a := 1; { 7000:3B34 }
                end; { 7000:3B34; region anchor, exact origin unknown }
              end else begin { 7000:3B34; region anchor, exact origin unknown }
                iVar8 := SmallInt(local_21); { 7000:3B34; region anchor, exact origin unknown }
                uVar10 := Word((LongWord(local_21) shr $10)); { 7000:3B34; region anchor, exact origin unknown }
                if (local_a = 4) then begin { 7000:3B34; region anchor, exact origin unknown }
                  if (local_4 = $4C) then begin { 7000:3B34; region anchor, exact origin unknown }
                    (Ptr<Byte>((iVar8 + $C0)))^ := 2; { 7000:3B34; region anchor, exact origin unknown }
                    stub_ov17_e3((Word(bVar7) shl 8)); { 7000:3B52 }
                    bVar7 := UNK_extraout_AH_07; { 7000:3B52; region anchor, exact origin unknown }
                  end else begin { 7000:3B52; region anchor, exact origin unknown }
                    if (local_4 = $53) then begin { 7000:3B52; region anchor, exact origin unknown }
                      (Ptr<Byte>((iVar8 + $C0)))^ := 1; { 7000:3B52; region anchor, exact origin unknown }
                      stub_ov17_e3((Word(bVar7) shl 8)); { 7000:3B69 }
                      bVar7 := UNK_extraout_AH_08; { 7000:3B69; region anchor, exact origin unknown }
                    end else begin { 7000:3B69; region anchor, exact origin unknown }
                      if (local_4 = $4B) then begin { 7000:3B69; region anchor, exact origin unknown }
                        local_8 := (Ptr<Byte>((iVar8 + $C0)))^; { 7000:3B7C }
                        local_a := 1; { 7000:3B7F }
                        local_4 := $20; { 7000:3B83 }
                      end else begin { 7000:3B83; region anchor, exact origin unknown }
                        if ((local_4 = $45) or else (local_4 = $0)) then begin { 7000:3B83; region anchor, exact origin unknown }
                          (Ptr<Byte>((iVar8 + $C0)))^ := local_8; { 7000:3B83; region anchor, exact origin unknown }
                          local_a := 1; { 7000:3B9C }
                          local_4 := $20; { 7000:3BA0 }
                        end; { 7000:3BA0; region anchor, exact origin unknown }
                      end; { 7000:3BA0; region anchor, exact origin unknown }
                    end; { 7000:3BA0; region anchor, exact origin unknown }
                  end; { 7000:3BA0; region anchor, exact origin unknown }
                  uVar9 := $7C; { 7000:3BA0; region anchor, exact origin unknown }
                  stub_ov17_e3((Word(bVar7) shl 8)); { 7000:3BA7 }
                end else begin { 7000:3BA7; region anchor, exact origin unknown }
                  if (local_a = 5) then begin { 7000:3BA7; region anchor, exact origin unknown }
                    if (local_1c = 2) then begin { 7000:3BA7; region anchor, exact origin unknown }
                      uVar1 := Word((LongWord(g_5D92) shr $10)); { 7000:3BA7; region anchor, exact origin unknown }
                      if (local_1d = $48) then begin { 7000:3BA7; region anchor, exact origin unknown }
                        if (local_4 = $50) then begin { 7000:3BA7; region anchor, exact origin unknown }
                          if ((Ptr<ShortInt>((iVar8 + $BD)))^ = $0) then begin { 7000:3BA7; region anchor, exact origin unknown }
                            (Ptr<Byte>((iVar8 + $BD)))^ := $D; { 7000:3BA7; region anchor, exact origin unknown }
                          end else begin { 7000:3BA7; region anchor, exact origin unknown }
                            (Ptr<ShortInt>((iVar8 + $BD)))^ := ((Ptr<ShortInt>((iVar8 + $BD)))^ + (-1)); { 7000:3BA7; region anchor, exact origin unknown }
                          end; { 7000:3BA7; region anchor, exact origin unknown }
                        end else begin { 7000:3BA7; region anchor, exact origin unknown }
                          if (local_4 = $4E) then begin { 7000:3BA7; region anchor, exact origin unknown }
                            if ((Ptr<Byte>((iVar8 + $BD)))^ < $D) then begin { 7000:3BA7; region anchor, exact origin unknown }
                              (Ptr<ShortInt>((iVar8 + $BD)))^ := ((Ptr<ShortInt>((iVar8 + $BD)))^ + $1); { 7000:3BA7; region anchor, exact origin unknown }
                            end else begin { 7000:3BA7; region anchor, exact origin unknown }
                              (Ptr<Byte>((iVar8 + $BD)))^ := 0; { 7000:3BA7; region anchor, exact origin unknown }
                            end; { 7000:3BA7; region anchor, exact origin unknown }
                          end else begin { 7000:3BA7; region anchor, exact origin unknown }
                            if (local_4 = $4B) then begin { 7000:3BA7; region anchor, exact origin unknown }
                              local_25 := g_5D92; { 7000:3C1D }
                              local_6 := (Ptr<Byte>((SmallInt(g_5D92) + $BD)))^; { 7000:3C2B }
                              local_a := local_1c; { 7000:3C31 }
                              local_4 := $20; { 7000:3C34 }
                            end else begin { 7000:3C34; region anchor, exact origin unknown }
                              if ((local_4 = $45) or else (local_4 = $0)) then begin { 7000:3C34; region anchor, exact origin unknown }
                                (Ptr<Byte>((iVar8 + $BD)))^ := local_6; { 7000:3C34; region anchor, exact origin unknown }
                                local_a := local_1c; { 7000:3C50 }
                                local_4 := $20; { 7000:3C53 }
                              end; { 7000:3C53; region anchor, exact origin unknown }
                            end; { 7000:3C53; region anchor, exact origin unknown }
                          end; { 7000:3C53; region anchor, exact origin unknown }
                        end; { 7000:3C53; region anchor, exact origin unknown }
                        uVar9 := $7C; { 7000:3C53; region anchor, exact origin unknown }
                        stub_ov17_e3((Word(bVar7) shl 8)); { 7000:3C5A }
                      end else begin { 7000:3C5A; region anchor, exact origin unknown }
                        if (local_1d = $57) then begin { 7000:3C5A; region anchor, exact origin unknown }
                          if (local_4 = $50) then begin { 7000:3C5A; region anchor, exact origin unknown }
                            if ((Ptr<ShortInt>((iVar8 + $BE)))^ = $0) then begin { 7000:3C5A; region anchor, exact origin unknown }
                              (Ptr<Byte>((iVar8 + $BE)))^ := $1F; { 7000:3C5A; region anchor, exact origin unknown }
                            end else begin { 7000:3C5A; region anchor, exact origin unknown }
                              (Ptr<ShortInt>((iVar8 + $BE)))^ := ((Ptr<ShortInt>((iVar8 + $BE)))^ + (-1)); { 7000:3C5A; region anchor, exact origin unknown }
                            end; { 7000:3C5A; region anchor, exact origin unknown }
                          end else begin { 7000:3C5A; region anchor, exact origin unknown }
                            if (local_4 = $4E) then begin { 7000:3C5A; region anchor, exact origin unknown }
                              if ((Ptr<Byte>((iVar8 + $BE)))^ < $1F) then begin { 7000:3C5A; region anchor, exact origin unknown }
                                (Ptr<ShortInt>((iVar8 + $BE)))^ := ((Ptr<ShortInt>((iVar8 + $BE)))^ + $1); { 7000:3C5A; region anchor, exact origin unknown }
                              end else begin { 7000:3C5A; region anchor, exact origin unknown }
                                (Ptr<Byte>((iVar8 + $BE)))^ := 0; { 7000:3C5A; region anchor, exact origin unknown }
                              end; { 7000:3C5A; region anchor, exact origin unknown }
                            end else begin { 7000:3C5A; region anchor, exact origin unknown }
                              if (local_4 = $4B) then begin { 7000:3C5A; region anchor, exact origin unknown }
                                local_25 := g_5D92; { 7000:3CBC }
                                local_7 := (Ptr<Byte>((SmallInt(g_5D92) + $BE)))^; { 7000:3CCA }
                                local_a := local_1c; { 7000:3CD0 }
                                local_4 := $20; { 7000:3CD3 }
                              end else begin { 7000:3CD3; region anchor, exact origin unknown }
                                if ((local_4 = $45) or else (local_4 = $0)) then begin { 7000:3CD3; region anchor, exact origin unknown }
                                  (Ptr<Byte>((iVar8 + $BE)))^ := local_7; { 7000:3CD3; region anchor, exact origin unknown }
                                  local_a := local_1c; { 7000:3CEF }
                                  local_4 := $20; { 7000:3CF2 }
                                end; { 7000:3CF2; region anchor, exact origin unknown }
                              end; { 7000:3CF2; region anchor, exact origin unknown }
                            end; { 7000:3CF2; region anchor, exact origin unknown }
                          end; { 7000:3CF2; region anchor, exact origin unknown }
                          uVar9 := $7C; { 7000:3CF2; region anchor, exact origin unknown }
                          stub_ov17_e3((Word(bVar7) shl 8)); { 7000:3CF9 }
                        end; { 7000:3CF9; region anchor, exact origin unknown }
                      end; { 7000:3CF9; region anchor, exact origin unknown }
                    end else begin { 7000:3CF9; region anchor, exact origin unknown }
                      if (local_1c = 3) then begin { 7000:3CF9; region anchor, exact origin unknown }
                        local_1a := ((Ptr<Byte>(((iVar8 + Word(local_18)) + $C0)))^ and $F); { 7000:3D19 }
                        local_1b := ((Ptr<Byte>(((iVar8 + Word(local_18)) + $C0)))^ shr 4); { 7000:3D34 }
                        if (local_4 = $4E) then begin { 7000:3D34; region anchor, exact origin unknown }
                          if (local_19 = $0) then begin { 7000:3D34; region anchor, exact origin unknown }
                            local_1a := Byte(((local_1a + 1) mod $10)); { 7000:3D63 }
                          end else begin { 7000:3D63; region anchor, exact origin unknown }
                            local_1b := Byte(((local_1b + 1) mod $10)); { 7000:3D51 }
                          end; { 7000:3D51; region anchor, exact origin unknown }
                          (Ptr<ShortInt>(((iVar8 + Word(local_18)) + $C0)))^ := ((local_1b * $10) + local_1a); { 7000:3D51; region anchor, exact origin unknown }
                        end else begin { 7000:3D51; region anchor, exact origin unknown }
                          if (local_4 = $50) then begin { 7000:3D51; region anchor, exact origin unknown }
                            if (local_19 = $0) then begin { 7000:3D51; region anchor, exact origin unknown }
                              local_1a := ((local_1a - 1) and $F); { 7000:3DAE }
                            end else begin { 7000:3DAE; region anchor, exact origin unknown }
                              local_1b := ((local_1b - 1) and $F); { 7000:3DA0 }
                            end; { 7000:3DA0; region anchor, exact origin unknown }
                            (Ptr<ShortInt>(((iVar8 + Word(local_18)) + $C0)))^ := ((local_1b * $10) + local_1a); { 7000:3DA0; region anchor, exact origin unknown }
                          end else begin { 7000:3DA0; region anchor, exact origin unknown }
                            if (local_4 = $4B) then begin { 7000:3DA0; region anchor, exact origin unknown }
                              uVar9 := $AF8; { 7000:3DA0; region anchor, exact origin unknown }
                              Move(FarPtr(FarSeg(BPWord(-$1F)), (FarOff(BPWord(-$1F)) + $C1)), FarPtr(SS, BPAddr(-$15)), $6); { 7000:3DED }
                              local_a := local_1c; { 7000:3DF5 }
                              local_4 := $20; { 7000:3DF8 }
                            end else begin { 7000:3DF8; region anchor, exact origin unknown }
                              if ((local_4 = $45) or else (local_4 = $0)) then begin { 7000:3DF8; region anchor, exact origin unknown }
                                uVar9 := $AF8; { 7000:3DF8; region anchor, exact origin unknown }
                                Move(FarPtr(SS, BPAddr(-$15)), FarPtr(FarSeg(BPWord(-$1F)), (FarOff(BPWord(-$1F)) + $C1)), $6); { 7000:3E18 }
                                local_a := local_1c; { 7000:3E20 }
                                local_4 := $20; { 7000:3E23 }
                              end; { 7000:3E23; region anchor, exact origin unknown }
                            end; { 7000:3E23; region anchor, exact origin unknown }
                          end; { 7000:3E23; region anchor, exact origin unknown }
                        end; { 7000:3E23; region anchor, exact origin unknown }
                      end; { 7000:3E23; region anchor, exact origin unknown }
                    end; { 7000:3E23; region anchor, exact origin unknown }
                  end; { 7000:3E23; region anchor, exact origin unknown }
                end; { 7000:3E23; region anchor, exact origin unknown }
              end; { 7000:3E23; region anchor, exact origin unknown }
            end; { 7000:3E23; region anchor, exact origin unknown }
          end; { 7000:3E23; region anchor, exact origin unknown }
        end; { 7000:3E23; region anchor, exact origin unknown }
        FUN_7000_35be(@stack0xfffe, 1, $C, (Ptr<Byte>((SmallInt(local_21) + $BF)))^); { 7000:3E38 }
        bVar11 := (local_1c = 1); { 7000:3E38; region anchor, exact origin unknown }
      until not ((not bVar11)); { 7000:3E38; region anchor, exact origin unknown }
      (local_4 in PackedSet(FarPtr(uVar9, $37F6))); { 7000:3E4D }
      uVar9 := $AF8; { 7000:3E4D; region anchor, exact origin unknown }
    until not (bVar11); { 7000:3E4D; region anchor, exact origin unknown }
    uVar9 := Word((LongWord(local_21) shr $10)); { 7000:3E4D; region anchor, exact origin unknown }
    iVar8 := SmallInt(local_21); { 7000:3E4D; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar8 + $BD)))^ := local_6; { 7000:3E4D; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar8 + $BE)))^ := local_7; { 7000:3E4D; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar8 + $C0)))^ := local_8; { 7000:3E4D; region anchor, exact origin unknown }
    Move(FarPtr(SS, BPAddr(-$15)), FarPtr(FarSeg(BPWord(-$1F)), (FarOff(BPWord(-$1F)) + $C1)), $6); { 7000:3E8A }
    FUN_7000_35be(@stack0xfffe, MakeWord(UNK_extraout_AH_09, 1), MakeWord(UNK_extraout_AH_09, $C), MakeWord(UNK_extraout_AH_09, (Ptr<Byte>((SmallInt(local_21) + $BF)))^)); { 7000:3EA0 }
    FUN_7000_35be(@stack0xfffe, (Word(UNK_extraout_AH_10) shl 8), MakeWord(UNK_extraout_AH_10, (Ptr<Byte>((SmallInt(local_21) + $BF)))^), MakeWord(UNK_extraout_AH_10, $C)); { 7000:3EB4 }
    stub_ov25_e3(); { 7000:3EB7 }
    stub_ov32_e3(MakeWord(UNK_extraout_AH_11, $C)); { 7000:3EBF }
    if (1 < g_49FA) then begin { 7000:3EBF; region anchor, exact origin unknown }
      iVar8 := (SmallInt(@local_25) + 3); { 7000:3EBF; region anchor, exact origin unknown }
      uVar9 := UNK_unaff_SS; { 7000:3EBF; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$20))) := 'ICON'; { 7000:3ED5 }
      stub_ov32_e4(MakeWord(UNK_extraout_AH_12, $B), (Word(UNK_extraout_AH_12) shl 8), iVar8, uVar9); { 7000:3EE0 }
      iVar8 := (SmallInt(@local_25) + 3); { 7000:3EE0; region anchor, exact origin unknown }
      uVar9 := UNK_unaff_SS; { 7000:3EE0; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$20))) := 'ICON'; { 7000:3EEF }
      stub_ov32_e4(MakeWord(UNK_extraout_AH_13, $C), MakeWord(UNK_extraout_AH_13, 1), iVar8, uVar9); { 7000:3EFA }
    end; { 7000:3EFA; region anchor, exact origin unknown }
    puVar13 := local_2f; { 7000:3EFA; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7000:3EFA; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2D))) := 'Is this icon ok? '; { 7000:3F09 }
    uVar6 := stub_ov25_e5(MakeWord(UNK_extraout_AH_14, $F), MakeWord(UNK_extraout_AH_14, 10), MakeWord(UNK_extraout_AH_14, $D), puVar13, uVar9); { 7000:3F17 }
    local_4 := ShortInt(uVar6); { 7000:3F1C }
  until not ((local_4 <> $59)); { 7000:3F1C; region anchor, exact origin unknown }
  stub_ov31_e3(); { 7000:3F28 }
  Exit; { 7000:3F30 }
end;
```

### ov16:3F31 ConstitutionHitPointModifier (conf M)

Original `FUN_7000_3f31`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -8:2, -6:2, -3:1, -2:1, -1:1, +6:2.
Locals/SSA temporaries: iVar1: SmallInt; iVar2: SmallInt; uVar3: Word; local_5: ShortInt; local_4: ShortInt.
Callers: FUN_7000_1551,FUN_7000_29ae,FUN_7000_3fb3,FUN_7000_408c.
Callees (listing): none.

Class-sensitive constitution HP adjustment. Evidence: decode/listings/ov16.lst at 7000:3F31, paired .c.

```pascal
function FUN_7000_3f31(param_1: LongWord): Word;
begin
  local_4 := $0; { 7000:3F37 }
  uVar3 := Word((LongWord(param_1) shr $10)); { 7000:3F37; region anchor, exact origin unknown }
  iVar1 := SmallInt(param_1); { 7000:3F37; region anchor, exact origin unknown }
  local_5 := $0; { 7000:3F44 }
  while true do begin { 7000:3F44; region anchor, exact origin unknown }
    iVar2 := SmallInt(local_5); { 7000:3F44; region anchor, exact origin unknown }
    if ($0 < (Ptr<ShortInt>(((iVar1 + iVar2) + $96)))^) then begin { 7000:3F44; region anchor, exact origin unknown }
      iVar2 := 0; { 7000:3F44; region anchor, exact origin unknown }
      local_4 := (local_4 + Ptr<UnknownValue>(@g_408E)[(Ptr<Byte>((iVar1 + $14)))^]); { 7000:3F6D }
      if (($10 < (Ptr<Byte>((iVar1 + $14)))^) and then ((Ptr<ShortInt>((iVar1 + $2F)))^ = $2)) then begin { 7000:3F6D; region anchor, exact origin unknown }
        local_4 := (local_4 + $1); { 7000:3F84 }
      end; { 7000:3F84; region anchor, exact origin unknown }
      if (($11 < (Ptr<Byte>((iVar1 + $14)))^) and then ((Ptr<ShortInt>((iVar1 + $2F)))^ = $2)) then begin { 7000:3F84; region anchor, exact origin unknown }
        local_4 := (local_4 + $1); { 7000:3F9B }
      end; { 7000:3F9B; region anchor, exact origin unknown }
    end; { 7000:3F9B; region anchor, exact origin unknown }
    if (local_5 = $7) then begin { 7000:3F9B; region anchor, exact origin unknown }
      Break; { 7000:3F9B; region anchor, exact origin unknown }
    end; { 7000:3F9B; region anchor, exact origin unknown }
    local_5 := (local_5 + $1); { 7000:3F4A }
  end; { 7000:3F4A; region anchor, exact origin unknown }
  Exit(MakeWord(ShortInt((Word(iVar2) shr 8)), local_4)); { 7000:3FB0 }
end;
```

### ov16:3FB3 MinimumHitPoints (conf M)

Original `FUN_7000_3fb3`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -9:2, -7:2, -5:1, -4:1, -3:1, -2:1, -1:1, +6:2, +8:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Word; uVar3: Word; iVar4: SmallInt; uVar5: Word; local_7: Byte; local_6: Byte; local_4: Byte.
Callers: FUN_7000_209f.
Callees (listing): FUN_7000_3f31.

Hit-point bound calculation. Evidence: decode/listings/ov16.lst at 7000:3FB3, paired .c.

```pascal
function FUN_7000_3fb3(param_1: LongWord): Word;
begin
  uVar5 := Word((LongWord(param_1) shr $10)); { 7000:3FB3; region anchor, exact origin unknown }
  iVar4 := SmallInt(param_1); { 7000:3FB3; region anchor, exact origin unknown }
  local_4 := 0; { 7000:3FC2 }
  local_6 := 0; { 7000:3FC6 }
  local_7 := $0; { 7000:3FCA }
  while true do begin { 7000:3FCA; region anchor, exact origin unknown }
    if ($0 < (Ptr<ShortInt>(((iVar4 + local_7) + $96)))^) then begin { 7000:3FCA; region anchor, exact origin unknown }
      local_6 := (local_6 + (Ptr<ShortInt>(((iVar4 + local_7) + $96)))^); { 7000:3FF2 }
      local_4 := (local_4 + 1); { 7000:3FF5 }
      if (local_7 = $4) then begin { 7000:3FF5; region anchor, exact origin unknown }
        local_6 := (local_6 + 1); { 7000:3FFF }
      end else begin { 7000:3FFF; region anchor, exact origin unknown }
        if (local_7 = $7) then begin { 7000:3FFF; region anchor, exact origin unknown }
          local_6 := (local_6 + 1); { 7000:4008 }
        end; { 7000:4008; region anchor, exact origin unknown }
      end; { 7000:4008; region anchor, exact origin unknown }
    end; { 7000:4008; region anchor, exact origin unknown }
    if (local_7 = $7) then begin { 7000:4008; region anchor, exact origin unknown }
      Break; { 7000:4008; region anchor, exact origin unknown }
    end; { 7000:4008; region anchor, exact origin unknown }
    local_7 := (local_7 + $1); { 7000:3FD0 }
  end; { 7000:3FD0; region anchor, exact origin unknown }
  cVar1 := FUN_7000_3f31(iVar4, uVar5); { 7000:4018 }
  if (cVar1 < $0) then begin { 7000:4018; region anchor, exact origin unknown }
    uVar3 := (SmallInt(cVar1) shr $F); { 7000:4018; region anchor, exact origin unknown }
    uVar2 := Word(local_6); { 7000:4018; region anchor, exact origin unknown }
    if (SmallInt((((SmallInt(cVar1) xor uVar3) - uVar3) + Word(local_4))) < SmallInt(uVar2)) then begin { 7000:4018; region anchor, exact origin unknown }
      uVar2 := (SmallInt((Word(local_6) + SmallInt(cVar1))) div SmallInt(Word(local_4))); { 7000:4018; region anchor, exact origin unknown }
      local_6 := Byte(uVar2); { 7000:4058 }
    end else begin { 7000:4058; region anchor, exact origin unknown }
      local_6 := 1; { 7000:405D }
    end; { 7000:405D; region anchor, exact origin unknown }
  end else begin { 7000:405D; region anchor, exact origin unknown }
    uVar2 := (SmallInt((Word(local_6) + SmallInt(cVar1))) div SmallInt(Word(local_4))); { 7000:405D; region anchor, exact origin unknown }
    local_6 := Byte(uVar2); { 7000:407A }
  end; { 7000:407A; region anchor, exact origin unknown }
  Exit(MakeWord(ShortInt((uVar2 shr 8)), local_6)); { 7000:4089 }
end;
```

### ov16:408C MaximumHitPoints (conf M)

Original `FUN_7000_408c`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -9:2, -7:2, -5:1, -4:1, -3:1, -2:1, -1:1, +6:2.
Locals/SSA temporaries: iVar1: SmallInt; cVar2: ShortInt; uVar3: Word; uVar4: Word; uVar5: Word; local_7: Byte; local_5: Byte; local_4: Byte.
Callers: FUN_7000_209f.
Callees (listing): FUN_7000_3f31.

Hit-point bound calculation. Evidence: decode/listings/ov16.lst at 7000:408C, paired .c.

```pascal
function FUN_7000_408c(param_1: LongWord): Word;
begin
  uVar5 := Word((LongWord(param_1) shr $10)); { 7000:408C; region anchor, exact origin unknown }
  iVar1 := SmallInt(param_1); { 7000:408C; region anchor, exact origin unknown }
  local_4 := 0; { 7000:409B }
  local_5 := 0; { 7000:409F }
  local_7 := $0; { 7000:40A3 }
  while true do begin { 7000:40A3; region anchor, exact origin unknown }
    if ($0 < (Ptr<ShortInt>(((iVar1 + local_7) + $96)))^) then begin { 7000:40A3; region anchor, exact origin unknown }
      local_4 := (local_4 + 1); { 7000:40C0 }
      if (local_7 = $0) then begin { 7000:40C0; region anchor, exact origin unknown }
        local_5 := (local_5 + ((Ptr<ShortInt>((iVar1 + $96)))^ * $8)); { 7000:40DD }
      end else begin { 7000:40DD; region anchor, exact origin unknown }
        if (local_7 = $1) then begin { 7000:40DD; region anchor, exact origin unknown }
          local_5 := (local_5 + ((Ptr<ShortInt>((iVar1 + $97)))^ * $8)); { 7000:40FA }
        end else begin { 7000:40FA; region anchor, exact origin unknown }
          if (local_7 = $2) then begin { 7000:40FA; region anchor, exact origin unknown }
            local_5 := (local_5 + ((Ptr<ShortInt>((iVar1 + $98)))^ * $A)); { 7000:4118 }
          end else begin { 7000:4118; region anchor, exact origin unknown }
            if (local_7 = $3) then begin { 7000:4118; region anchor, exact origin unknown }
              local_5 := (local_5 + ((Ptr<ShortInt>((iVar1 + $99)))^ * $A)); { 7000:4136 }
            end else begin { 7000:4136; region anchor, exact origin unknown }
              if (local_7 = $4) then begin { 7000:4136; region anchor, exact origin unknown }
                local_5 := (local_5 + (((Ptr<ShortInt>((iVar1 + $9A)))^ + $1) * $8)); { 7000:4153 }
              end else begin { 7000:4153; region anchor, exact origin unknown }
                if (local_7 = $5) then begin { 7000:4153; region anchor, exact origin unknown }
                  local_5 := (local_5 + ((Ptr<ShortInt>((iVar1 + $9B)))^ * $4)); { 7000:416F }
                end else begin { 7000:416F; region anchor, exact origin unknown }
                  if (local_7 = $6) then begin { 7000:416F; region anchor, exact origin unknown }
                    local_5 := (local_5 + ((Ptr<ShortInt>((iVar1 + $9C)))^ * $6)); { 7000:418F }
                  end else begin { 7000:418F; region anchor, exact origin unknown }
                    if (local_7 = $7) then begin { 7000:418F; region anchor, exact origin unknown }
                      local_5 := (local_5 + (((Ptr<ShortInt>((iVar1 + $9D)))^ + $1) * $4)); { 7000:41AC }
                    end; { 7000:41AC; region anchor, exact origin unknown }
                  end; { 7000:41AC; region anchor, exact origin unknown }
                end; { 7000:41AC; region anchor, exact origin unknown }
              end; { 7000:41AC; region anchor, exact origin unknown }
            end; { 7000:41AC; region anchor, exact origin unknown }
          end; { 7000:41AC; region anchor, exact origin unknown }
        end; { 7000:41AC; region anchor, exact origin unknown }
      end; { 7000:41AC; region anchor, exact origin unknown }
    end; { 7000:41AC; region anchor, exact origin unknown }
    if (local_7 = $7) then begin { 7000:41AC; region anchor, exact origin unknown }
      Break; { 7000:41AC; region anchor, exact origin unknown }
    end; { 7000:41AC; region anchor, exact origin unknown }
    local_7 := (local_7 + $1); { 7000:40A9 }
  end; { 7000:40A9; region anchor, exact origin unknown }
  cVar2 := FUN_7000_3f31(g_5D92, g_5D94); { 7000:41C1 }
  if (cVar2 < $0) then begin { 7000:41C1; region anchor, exact origin unknown }
    uVar4 := (SmallInt(cVar2) shr $F); { 7000:41C1; region anchor, exact origin unknown }
    uVar3 := Word(local_5); { 7000:41C1; region anchor, exact origin unknown }
    if (SmallInt((((SmallInt(cVar2) xor uVar4) - uVar4) + Word(local_4))) < SmallInt(uVar3)) then begin { 7000:41C1; region anchor, exact origin unknown }
      uVar3 := (SmallInt((Word(local_5) + SmallInt(cVar2))) div SmallInt(Word(local_4))); { 7000:41C1; region anchor, exact origin unknown }
      local_5 := Byte(uVar3); { 7000:4201 }
    end else begin { 7000:4201; region anchor, exact origin unknown }
      local_5 := 1; { 7000:4206 }
    end; { 7000:4206; region anchor, exact origin unknown }
  end else begin { 7000:4206; region anchor, exact origin unknown }
    uVar3 := (SmallInt((Word(local_5) + SmallInt(cVar2))) div SmallInt(Word(local_4))); { 7000:4206; region anchor, exact origin unknown }
    local_5 := Byte(uVar3); { 7000:4223 }
  end; { 7000:4223; region anchor, exact origin unknown }
  Exit(MakeWord(ShortInt((uVar3 shr 8)), local_5)); { 7000:4232 }
end;
```

### ov16:4235 RollLevelHitPoints (conf M)

Original `FUN_7000_4235`. Params (ABI order): param_1: Byte; param_2: LongWord.
BP access inventory (hex offset:byte widths): -4:1, -3:1, -2:1, -1:1, +6:1, +8:2.
Locals/SSA temporaries: bVar1: Byte; iVar2: SmallInt; cVar4: ShortInt; uVar3: Word; uVar5: Word; local_6: Byte; local_5: Byte; local_4: Byte.
Callers: FUN_7000_1551,FUN_7000_29ae.
Callees (listing): stub_ov24_e8.

Level gain HP roll. Evidence: decode/listings/ov16.lst at 7000:4235, paired .c.

```pascal
function FUN_7000_4235(param_1: Byte; param_2: LongWord): Word;
begin
  local_5 := $0; { 7000:423B }
  local_6 := $0; { 7000:423F }
  while true do begin { 7000:423F; region anchor, exact origin unknown }
    iVar2 := SmallInt(local_6); { 7000:423F; region anchor, exact origin unknown }
    uVar5 := Word((LongWord(param_2) shr $10)); { 7000:423F; region anchor, exact origin unknown }
    if (($0 < (Ptr<ShortInt>(((SmallInt(param_2) + iVar2) + $96)))^) and then Seq(cVar4 := (local_6 shr 7), bVar1 := ((Ptr<Byte>((local_6 + $5DE)))^ and param_1), iVar2 := MakeWord(cVar4, bVar1), (bVar1 <> 0))) then begin { 7000:423F; region anchor, exact origin unknown }
      local_4 := stub_ov24_e8(MakeWord(cVar4, (Ptr<Byte>((local_6 + $8BE)))^), MakeWord(cVar4, (Ptr<Byte>((local_6 + $8B6)))^)); { 7000:4280 }
      uVar3 := Word(local_6); { 7000:4280; region anchor, exact origin unknown }
      if (((Ptr<ShortInt>(((SmallInt(param_2) + uVar3) + $96)))^ = $1) and then Seq(uVar3 := Word(local_4), (uVar3 < Word(((LongWord((Ptr<Byte>((local_6 + $8BE)))^) shl 1) div 3))))) then begin { 7000:4280; region anchor, exact origin unknown }
        uVar3 := 0; { 7000:4280; region anchor, exact origin unknown }
        local_4 := Byte(((LongWord((Ptr<Byte>((local_6 + $8BE)))^) shl 1) div 3)); { 7000:4285 }
      end; { 7000:4285; region anchor, exact origin unknown }
      iVar2 := MakeWord(ShortInt((uVar3 shr 8)), local_4); { 7000:4285; region anchor, exact origin unknown }
      local_5 := (local_5 + local_4); { 7000:42D2 }
    end; { 7000:42D2; region anchor, exact origin unknown }
    if (local_6 = $7) then begin { 7000:42D2; region anchor, exact origin unknown }
      Break; { 7000:42D2; region anchor, exact origin unknown }
    end; { 7000:42D2; region anchor, exact origin unknown }
    local_6 := (local_6 + $1); { 7000:4245 }
  end; { 7000:4245; region anchor, exact origin unknown }
  Exit(MakeWord(ShortInt((Word(iVar2) shr 8)), local_5)); { 7000:42EA }
end;
```

### ov16:42ED ChargeCharacterGold (conf M)

Original `FUN_7000_42ed`. Params (ABI order): param_1: LongWord; param_2: Word; param_3: SmallInt.
BP access inventory (hex offset:byte widths): -7:2, -5:2, -3:1, -2:2, +6:2, +A:2, +C:2.
Locals/SSA temporaries: piVar1: ^SmallInt; iVar2: SmallInt; iVar3: SmallInt; uVar4: Word; iVar5: SmallInt; uVar6: Word; bVar7: Boolean; local_5: ShortInt; local_4: Word.
Callers: FUN_7000_29ae.
Callees (listing): System.@LongMul, System.@LongDivMod, System.@LongAbs.

Deducts gold with denomination borrowing. Evidence: decode/listings/ov16.lst at 7000:42ED, paired .c.

```pascal
procedure FUN_7000_42ed(param_1: LongWord; param_2: Word; param_3: SmallInt);
begin
  param_2 := (MakeLong(BPWord($C), BPWord($A)) * MakeLong(0, $C8)); { 7000:42FE }
  local_5 := $0; { 7000:4309 }
  uVar6 := Word((LongWord(param_1) shr $10)); { 7000:4309; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_1); { 7000:4309; region anchor, exact origin unknown }
  while ((0 < param_3) or else (((-1) < param_3) and then (param_2 <> 0))) do begin { 7000:4309; region anchor, exact origin unknown }
    iVar3 := (MakeLong(BPWord($C), BPWord($A)) div MakeLong(MemWord(FarPtr($0C7C, ((MakeWord(HiByte(UNK_RET_42FE_AX), BPByte(-$3)) shl $1) shl $1) + $D26)), MemWord(FarPtr($0C7C, ((MakeWord(HiByte(UNK_RET_42FE_AX), BPByte(-$3)) shl $1) shl $1) + $D24)))); { 7000:4342 }
    local_4 := (iVar3 + 1); { 7000:434D }
    if ((Ptr<Word>(((iVar2 + (local_5 * 2)) + $88)))^ < local_4) then begin { 7000:434D; region anchor, exact origin unknown }
      local_4 := (Ptr<Word>(((iVar2 + (local_5 * 2)) + $88)))^; { 7000:4375 }
    end; { 7000:4375; region anchor, exact origin unknown }
    iVar3 := 0; { 7000:4375; region anchor, exact origin unknown }
    uVar4 := (MakeLong(0, BPWord(-$2)) * MakeLong(MemWord(FarPtr($0C7C, ((MakeWord(HiByte(MemWord(FarPtr(FarSeg(BPWord(-$7)), (FarOff(BPWord(-$7)) + (UNK_AX shl $1)) + $88))), BPByte(-$3)) shl $1) shl $1) + $D26)), MemWord(FarPtr($0C7C, ((MakeWord(HiByte(MemWord(FarPtr(FarSeg(BPWord(-$7)), (FarOff(BPWord(-$7)) + (UNK_AX shl $1)) + $88))), BPByte(-$3)) shl $1) shl $1) + $D24)))); { 7000:438F }
    bVar7 := (param_2 < uVar4); { 7000:438F; region anchor, exact origin unknown }
    param_2 := (param_2 - uVar4); { 7000:438F; region anchor, exact origin unknown }
    param_3 := ((param_3 - iVar3) - Word(bVar7)); { 7000:438F; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>(((iVar2 + (local_5 * 2)) + $88)); { 7000:438F; region anchor, exact origin unknown }
    (piVar1)^ := ((piVar1)^ - local_4); { 7000:438F; region anchor, exact origin unknown }
    local_5 := (local_5 + $1); { 7000:43B2 }
  end; { 7000:43B2; region anchor, exact origin unknown }
  if (param_3 < 0) then begin { 7000:43B2; region anchor, exact origin unknown }
    param_2 := Abs(UNK_DXAX); { 7000:43D2 }
    local_5 := $4; { 7000:43DD }
    while ((0 < param_3) or else (((-1) < param_3) and then (param_2 <> 0))) do begin { 7000:43DD; region anchor, exact origin unknown }
      iVar3 := (MakeLong(BPWord($C), BPWord($A)) div MakeLong(MemWord(FarPtr($0C7C, ((MakeWord(HiByte(UNK_RET_43D2_AX), BPByte(-$3)) shl $1) shl $1) + $D26)), MemWord(FarPtr($0C7C, ((MakeWord(HiByte(UNK_RET_43D2_AX), BPByte(-$3)) shl $1) shl $1) + $D24)))); { 7000:4407 }
      iVar5 := 0; { 7000:4407; region anchor, exact origin unknown }
      uVar4 := (MakeLong(0, BPWord(-$2)) * MakeLong(MemWord(FarPtr($0C7C, ((MakeWord(HiByte(UNK_RET_4407_AX), BPByte(-$3)) shl $1) shl $1) + $D26)), MemWord(FarPtr($0C7C, ((MakeWord(HiByte(UNK_RET_4407_AX), BPByte(-$3)) shl $1) shl $1) + $D24)))); { 7000:4426 }
      bVar7 := (param_2 < uVar4); { 7000:4426; region anchor, exact origin unknown }
      param_2 := (param_2 - uVar4); { 7000:4426; region anchor, exact origin unknown }
      param_3 := ((param_3 - iVar5) - Word(bVar7)); { 7000:4426; region anchor, exact origin unknown }
      piVar1 := Ptr<SmallInt>(((iVar2 + (local_5 * 2)) + $88)); { 7000:4426; region anchor, exact origin unknown }
      (piVar1)^ := ((piVar1)^ + iVar3); { 7000:4426; region anchor, exact origin unknown }
      local_5 := (local_5 + (-1)); { 7000:4449 }
    end; { 7000:4449; region anchor, exact origin unknown }
  end; { 7000:4449; region anchor, exact origin unknown }
  Exit; { 7000:4451 }
end;
```

### ov16:4454 ov16_init (conf L)

Original `ov16_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov16.lst at 7000:4454, paired .c.

```pascal
procedure ov16_init();
begin
  Exit; { 7000:4458 }
end;
```

## ov17

### ov17:0010 ReadCharacterRoster (conf M)

Original `ov17_0010`. Params (ABI order): param_1: ^SmallInt.
BP access inventory (hex offset:byte widths): -20C:2, -10C:2, -C:2, -A:2, -8:2, -6:2, -4:2, -2:2, +6:2.
Locals/SSA temporaries: cVar1: ShortInt; piVar2: ^SmallInt; iVar3: SmallInt; uVar4: Word; uVar5: Word; unaff_SS: Word; bVar6: Boolean; puVar7: ^Byte; puVar8: ^Byte; uVar9: Word; local_20e: array[0..256-1] of Byte; local_10e: array[0..256-1] of Byte; local_e: SmallInt; iStack_c: SmallInt; local_a: SmallInt; iStack_8: SmallInt; local_6: LongWord.
Callers: ov17_069E.
Callees (listing): FUN_7500_02ae, System.@StrCopy, System.@StrAppend, FUN_0802_02eb, System.AssignText, System.ResetText, System.EofText, System.GetMem, System.FillChar, System.@ReadStr, System.@ReadLn, System.@StrCompare, System.@StrAssign, System.CloseText.

charlist.txt; 46-byte linked nodes, next +2A; active names prefixed *. Evidence: decode/listings/ov17.lst at 7500:0010, paired .c.

```pascal
procedure ov17_0010(param_1: ^SmallInt);
begin
  uVar4 := Word((LongWord(param_1) shr $10)); { 7500:0010; region anchor, exact origin unknown }
  piVar2 := Ptr<SmallInt>(param_1); { 7500:0010; region anchor, exact origin unknown }
  (param_1)^ := 0; { 7500:0010; region anchor, exact origin unknown }
  piVar2[1] := 0; { 7500:0010; region anchor, exact origin unknown }
  FUN_7500_02ae(); { 7500:0024 }
  puVar8 := local_20e; { 7500:0024; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:0024; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$20C))) := PString(FarPtr($0C7C, $537A)); { 7500:0032 }
  PString(FarPtr(SS, BPAddr(-$20C))) := PString(FarPtr(SS, BPAddr(-$20C))) + 'charlist.txt'; { 7500:003C }
  cVar1 := FUN_0802_02eb(puVar8, uVar5); { 7500:0041 }
  if (cVar1 <> $0) then begin { 7500:0041; region anchor, exact origin unknown }
    puVar8 := local_10e; { 7500:0041; region anchor, exact origin unknown }
    puVar7 := local_20e; { 7500:0041; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 7500:0041; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7500:0041; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$20C))) := PString(FarPtr($0C7C, $537A)); { 7500:005E }
    PString(FarPtr(SS, BPAddr(-$20C))) := PString(FarPtr(SS, BPAddr(-$20C))) + 'charlist.txt'; { 7500:0068 }
    Assign(FarPtr(SS, BPAddr(-$10C)), PString(FarPtr(SS, BPAddr(-$20C)))); { 7500:006D }
    Reset(FarPtr(local_10e, $AF8)); { 7500:0078 }
    while Seq(cVar1 := EofText(BPAddr(-$10C), SS), (cVar1 = $0)) do begin { 7500:0083 }
      local_6 := GetMem($2E); { 7500:0093 }
      FillChar(0, $2E, local_6); { 7500:00AA }
      if (((param_1)^ = 0) and then (piVar2[1] = 0)) then begin { 7500:00AA; region anchor, exact origin unknown }
        (param_1)^ := SmallInt(local_6); { 7500:00AA; region anchor, exact origin unknown }
        piVar2[1] := ExtractBytes(local_6, 2, 2); { 7500:00AA; region anchor, exact origin unknown }
        _local_a := MakeLong(piVar2[1], (param_1)^); { 7500:00AA; region anchor, exact origin unknown }
      end else begin { 7500:00AA; region anchor, exact origin unknown }
        uVar5 := Word((LongWord(_local_a) shr $10)); { 7500:00AA; region anchor, exact origin unknown }
        iVar3 := SmallInt(_local_a); { 7500:00AA; region anchor, exact origin unknown }
        (Ptr<SmallInt>((iVar3 + $2A)))^ := SmallInt(local_6); { 7500:00AA; region anchor, exact origin unknown }
        (Ptr<SmallInt>((iVar3 + $2C)))^ := ExtractBytes(local_6, 2, 2); { 7500:00AA; region anchor, exact origin unknown }
        _local_a := MakeLong((Ptr<Word>((iVar3 + $2C)))^, (Ptr<Word>((iVar3 + $2A)))^); { 7500:00AA; region anchor, exact origin unknown }
      end; { 7500:00AA; region anchor, exact origin unknown }
      puVar8 := local_10e; { 7500:00AA; region anchor, exact origin unknown }
      uVar5 := UNK_unaff_SS; { 7500:00AA; region anchor, exact origin unknown }
      Read(PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8))))); { 7500:010E }
      ReadLn; { 7500:0113 }
      _local_e := MakeLong(g_5D98, g_5D96); { 7500:0113; region anchor, exact origin unknown }
      while true do begin { 7500:0113; region anchor, exact origin unknown }
        bVar6 := ((local_e = 0) and then (iStack_c = 0)); { 7500:0113; region anchor, exact origin unknown }
        if (((local_e = 0) and then (iStack_c = 0)) or else Seq(CompareStrFlags(PString(FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C)))), PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8))))), bVar6)) then begin { 7500:0137 }
          Break; { 7500:0137; region anchor, exact origin unknown }
        end; { 7500:0137; region anchor, exact origin unknown }
        uVar5 := Word((LongWord(_local_e) shr $10)); { 7500:0137; region anchor, exact origin unknown }
        _local_e := MakeLong((Ptr<Word>((SmallInt(_local_e) + $106)))^, (Ptr<Word>((SmallInt(_local_e) + $104)))^); { 7500:0137; region anchor, exact origin unknown }
      end; { 7500:0137; region anchor, exact origin unknown }
      if ((local_e <> 0) or else (iStack_c <> 0)) then begin { 7500:0137; region anchor, exact origin unknown }
        puVar8 := local_20e; { 7500:0137; region anchor, exact origin unknown }
        uVar5 := UNK_unaff_SS; { 7500:0137; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$20C))) := '* '; { 7500:0166 }
        PString(FarPtr(SS, BPAddr(-$20C))) := PString(FarPtr(SS, BPAddr(-$20C))) + PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8)))); { 7500:0170 }
        PString(FarPtr(FarSeg(BPWord(-$8)), FarOff(BPWord(-$8)))) := Copy(PString(FarPtr(SS, BPAddr(-$20C))), 1, $28); { 7500:017E }
      end; { 7500:017E; region anchor, exact origin unknown }
    end; { 7500:017E; region anchor, exact origin unknown }
    Close(FarPtr(SS, BPAddr(-$10C))); { 7500:018C }
  end; { 7500:018C; region anchor, exact origin unknown }
  Exit; { 7500:0194 }
end;
```

### ov17:01B8 WriteCharacterRoster (conf M)

Original `ov17_01B8`. Params (ABI order): param_1: SmallInt; param_2: SmallInt.
BP access inventory (hex offset:byte widths): -306:2, -206:2, -106:2, -104:2, -4:2, -2:2, +6:2, +8:2.
Locals/SSA temporaries: piVar1: ^SmallInt; uVar2: Word; extraout_AH: Byte; unaff_SS: Word; puVar3: ^Byte; uVar4: Word; puVar5: ^Byte; uVar6: Word; local_308: array[0..256-1] of Byte; local_208: array[0..256-1] of Byte; local_108: SmallInt; local_106: array[0..256-1] of Byte; local_6: SmallInt; iStack_4: SmallInt.
Callers: ov17_069E.
Callees (listing): FUN_7500_02ae, System.@StrCopy, System.@StrAppend, System.AssignText, System.RewriteText, System.IOResult, System.@CharToStr, FUN_0709_0bf5, System.@WriteStr, System.@WriteLn, System.CloseText.

Excludes nodes whose first name character node[1] is *. Do not interpret as second character. Evidence: decode/listings/ov17.lst at 7500:01B8, paired .c.

```pascal
procedure ov17_01B8(param_1: SmallInt; param_2: SmallInt);
begin
  FUN_7500_02ae(); { 7500:01C0 }
  repeat { 7500:01C0; region anchor, exact origin unknown }
    puVar5 := local_106; { 7500:01C0; region anchor, exact origin unknown }
    puVar3 := local_208; { 7500:01C0; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7500:01C0; region anchor, exact origin unknown }
    uVar6 := UNK_unaff_SS; { 7500:01C0; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$206))) := PString(FarPtr($0C7C, $537A)); { 7500:01D4 }
    PString(FarPtr(SS, BPAddr(-$206))) := PString(FarPtr(SS, BPAddr(-$206))) + 'charlist.txt'; { 7500:01DE }
    Assign(FarPtr(SS, BPAddr(-$104)), PString(FarPtr(SS, BPAddr(-$206)))); { 7500:01E3 }
    Rewrite(FarPtr(local_106, $AF8)); { 7500:01EE }
    local_108 := IOResult(); { 7500:01F3 }
    if (local_108 <> 0) then begin { 7500:01F3; region anchor, exact origin unknown }
      uVar2 := $E; { 7500:01F3; region anchor, exact origin unknown }
      puVar5 := local_308; { 7500:01F3; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:01F3; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$306))) := 'Put save disk in '; { 7500:0211 }
      puVar3 := local_208; { 7500:0211; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:0211; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH, g_537B))); { 7500:0220 }
      PString(FarPtr(SS, BPAddr(-$306))) := PString(FarPtr(SS, BPAddr(-$306))) + PString(FarPtr(SS, BPAddr(-$206))); { 7500:0225 }
      PString(FarPtr(SS, BPAddr(-$306))) := PString(FarPtr(SS, BPAddr(-$306))) + ':'; { 7500:022F }
      FUN_0709_0bf5(puVar5, uVar6, uVar2); { 7500:0234 }
    end; { 7500:0234; region anchor, exact origin unknown }
  until not ((local_108 <> 0)); { 7500:0234; region anchor, exact origin unknown }
  iStack_4 := param_2; { 7500:0234; region anchor, exact origin unknown }
  local_6 := param_1; { 7500:0246 }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do begin { 7500:0246; region anchor, exact origin unknown }
    if ((Ptr<ShortInt>((local_6 + 1)))^ <> $2A) then begin { 7500:0246; region anchor, exact origin unknown }
      puVar5 := local_106; { 7500:0246; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:0246; region anchor, exact origin unknown }
      Write(PString(FarPtr(FarSeg(BPWord(-$4)), FarOff(BPWord(-$4)))):0); { 7500:026C }
      WriteLn; { 7500:0271 }
    end; { 7500:0271; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_6 + $2A)); { 7500:0271; region anchor, exact origin unknown }
    iStack_4 := (Ptr<SmallInt>((local_6 + $2C)))^; { 7500:0271; region anchor, exact origin unknown }
    local_6 := (piVar1)^; { 7500:0281 }
  end; { 7500:0281; region anchor, exact origin unknown }
  Close(FarPtr(SS, BPAddr(-$104))); { 7500:028F }
  Exit; { 7500:0297 }
end;
```

### ov17:02AE EnsureSaveDirectory (conf M)

Original `FUN_7500_02ae`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -202:2, -102:2, -2:2.
Locals/SSA temporaries: uVar1: Word; extraout_AH: Byte; unaff_SS: Word; puVar2: ^Byte; uVar3: Word; puVar4: ^Byte; uVar5: Word; local_204: array[0..256-1] of Byte; local_104: array[0..256-1] of Byte; local_4: SmallInt.
Callers: ov17_0010,ov17_01B8,ov17_069E,ov17_1602,ov17_1D58.
Callees (listing): System.Copy, System.MkDir, System.IOResult, System.@StrCopy, System.@CharToStr, System.@StrAppend, FUN_0709_0bf5.

MkDir path without trailing separator; tolerates IOResult 0 or 5; retries disk prompt otherwise. Evidence: decode/listings/ov17.lst at 7500:02AE, paired .c.

```pascal
procedure FUN_7500_02ae();
begin
  repeat { 7500:02AE; region anchor, exact origin unknown }
    puVar4 := local_104; { 7500:02AE; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:02AE; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := Copy(PString(FarPtr($0C7C, $537A)), $1, (MakeWord(0, LoByte(MakeWord(HiByte($1), MemByte(FarPtr($0C7C, $537A))))) - 1)); { 7500:02CB }
    MkDir(BPAddr(-$102), SS); { 7500:02D0 }
    local_4 := IOResult(); { 7500:02D5 }
    if ((local_4 <> 0) and then (local_4 <> 5)) then begin { 7500:02D5; region anchor, exact origin unknown }
      uVar1 := $E; { 7500:02D5; region anchor, exact origin unknown }
      puVar4 := local_204; { 7500:02D5; region anchor, exact origin unknown }
      uVar5 := UNK_unaff_SS; { 7500:02D5; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$202))) := 'Put save disk in '; { 7500:02F7 }
      puVar2 := local_104; { 7500:02F7; region anchor, exact origin unknown }
      uVar3 := UNK_unaff_SS; { 7500:02F7; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH, g_537B))); { 7500:0306 }
      PString(FarPtr(SS, BPAddr(-$202))) := PString(FarPtr(SS, BPAddr(-$202))) + PString(FarPtr(SS, BPAddr(-$102))); { 7500:030B }
      PString(FarPtr(SS, BPAddr(-$202))) := PString(FarPtr(SS, BPAddr(-$202))) + ':'; { 7500:0315 }
      FUN_0709_0bf5(puVar4, uVar5, uVar1); { 7500:031A }
    end; { 7500:031A; region anchor, exact origin unknown }
  until not (((local_4 <> 0) and then (local_4 <> 5))); { 7500:031A; region anchor, exact origin unknown }
  Exit; { 7500:032E }
end;
```

### ov17:032F CompositePortrait (conf M)

Original `FUN_7500_032f`. Params (ABI order): param_1: LongWord; param_2: LongWord.
BP access inventory (hex offset:byte widths): -6:2, -4:2, -2:2, +6:2, +A:2.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Word; iVar3: SmallInt; uVar5: Word; local_6: Word; iVar4: SmallInt; uVar6: Word.
Callers: ov17_0482.
Callees (listing): none.

Head/body pixels OR and masks AND. Evidence: decode/listings/ov17.lst at 7500:032F, paired .c.

```pascal
procedure FUN_7500_032f(param_1: LongWord; param_2: LongWord);
begin
  iVar3 := SmallInt(param_2); { 7500:032F; region anchor, exact origin unknown }
  uVar5 := Word((LongWord(param_2) shr $10)); { 7500:032F; region anchor, exact origin unknown }
  iVar4 := SmallInt(param_1); { 7500:032F; region anchor, exact origin unknown }
  uVar6 := Word((LongWord(param_1) shr $10)); { 7500:032F; region anchor, exact origin unknown }
  if ((g_4A1E = $0) or else (g_4A1E = $2)) then begin { 7500:032F; region anchor, exact origin unknown }
    iVar1 := (Ptr<SmallInt>((iVar3 + $11)))^; { 7500:032F; region anchor, exact origin unknown }
    local_6 := 0; { 7500:0355 }
    while true do begin { 7500:0355; region anchor, exact origin unknown }
      (Ptr<Byte>(((iVar4 + local_6) + $17)))^ := ((Ptr<Byte>(((iVar4 + local_6) + $17)))^ or (Ptr<Byte>(((iVar3 + local_6) + $17)))^); { 7500:0355; region anchor, exact origin unknown }
      (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar4 + $13)))^) + local_6)))^ := ((Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar4 + $13)))^) + local_6)))^ and (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar3 + $13)))^) + local_6)))^); { 7500:0355; region anchor, exact origin unknown }
      if (local_6 = (iVar1 + (-1))) then begin { 7500:0355; region anchor, exact origin unknown }
        Break; { 7500:0355; region anchor, exact origin unknown }
      end; { 7500:0355; region anchor, exact origin unknown }
      local_6 := (local_6 + 1); { 7500:035A }
    end; { 7500:035A; region anchor, exact origin unknown }
  end else begin { 7500:035A; region anchor, exact origin unknown }
    if (g_4A1E = $1) then begin { 7500:035A; region anchor, exact origin unknown }
      iVar1 := (Ptr<SmallInt>((iVar3 + $11)))^; { 7500:035A; region anchor, exact origin unknown }
      local_6 := 0; { 7500:03DA }
      while Seq((Ptr<Byte>(((iVar4 + local_6) + $17)))^ := ((Ptr<Byte>(((iVar4 + local_6) + $17)))^ or (Ptr<Byte>(((iVar3 + local_6) + $17)))^), (local_6 <> (iVar1 + (-1)))) do begin { 7500:03DA; region anchor, exact origin unknown }
        local_6 := (local_6 + 1); { 7500:03DF }
      end; { 7500:03DF; region anchor, exact origin unknown }
      uVar2 := (Ptr<Word>((SmallInt(g_5EB2) + $11)))^; { 7500:03DF; region anchor, exact origin unknown }
      local_6 := 0; { 7500:042F }
      while Seq((Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar4 + $13)))^) + local_6)))^ := ((Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar4 + $13)))^) + local_6)))^ and (Ptr<Byte>((SmallInt((Ptr<LongWord>((iVar3 + $13)))^) + local_6)))^), (local_6 <> ((uVar2 shr 2) - 1))) do begin { 7500:042F; region anchor, exact origin unknown }
        local_6 := (local_6 + 1); { 7500:0434 }
      end; { 7500:0434; region anchor, exact origin unknown }
    end; { 7500:0434; region anchor, exact origin unknown }
  end; { 7500:0434; region anchor, exact origin unknown }
  Exit; { 7500:0473 }
end;
```

### ov17:0482 LoadPortrait (conf M)

Original `ov17_0482`. Params (ABI order): param_1: ShortInt.
BP access inventory (hex offset:byte widths): -229:2, -129:2, -29:2, -27:2, -24:1, -23:1/2, -13:1/2, +6:1.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar1: Byte; iVar2: SmallInt; unaff_SS: Word; puVar3: ^Byte; uVar4: Word; puVar5: ^Byte; uVar6: Word; local_22b: array[0..256-1] of Byte; local_12b: array[0..256-1] of Byte; local_2b: SmallInt; uStack_29: Word; local_26: Byte; local_25: array[0..8-1] of Byte; abStack_1d: array[0..8-1] of Byte; local_15: array[0..19-1] of Byte.
Callers: ov17_1262,ov17_1602.
Callees (listing): FUN_0802_094a, System.@StrCopy, System.@CharToStr, System.@StrAppend, stub_ov32_e4, FUN_7500_032f, FUN_0464_1e5c, stub_ov32_e3, FUN_0802_095d, FUN_0899_0104.

CHEAD/CBODY, temporary DataSet 3, composite and color remap. Evidence: decode/listings/ov17.lst at 7500:0482, paired .c.

```pascal
procedure ov17_0482(param_1: ShortInt);
begin
  FUN_0802_094a(3); { 7500:048C }
  uStack_29 := Word((LongWord(g_5D92) shr $10)); { 7500:048C; region anchor, exact origin unknown }
  local_2b := SmallInt(g_5D92); { 7500:0495 }
  puVar5 := local_22b; { 7500:0495; region anchor, exact origin unknown }
  uVar6 := UNK_unaff_SS; { 7500:0495; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$229))) := 'CHEAD'; { 7500:04A6 }
  puVar3 := local_12b; { 7500:04A6; region anchor, exact origin unknown }
  uVar4 := UNK_unaff_SS; { 7500:04A6; region anchor, exact origin unknown }
  PString(UNK_hidden_string_result) := Chr(LoByte((Ptr<Byte>(((Ptr<Byte>((local_2b + $C0)))^ + $8C5)))^)); { 7500:04C2 }
  PString(FarPtr(SS, BPAddr(-$229))) := PString(FarPtr(SS, BPAddr(-$229))) + PString(FarPtr(SS, BPAddr(-$129))); { 7500:04C7 }
  stub_ov32_e4(MakeWord(UNK_extraout_AH, $B), MakeWord(UNK_extraout_AH, (Ptr<Byte>((local_2b + $BD)))^), puVar5, uVar6); { 7500:04D8 }
  puVar5 := local_22b; { 7500:04D8; region anchor, exact origin unknown }
  uVar6 := UNK_unaff_SS; { 7500:04D8; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$229))) := 'CBODY'; { 7500:04E8 }
  puVar3 := local_12b; { 7500:04E8; region anchor, exact origin unknown }
  uVar4 := UNK_unaff_SS; { 7500:04E8; region anchor, exact origin unknown }
  PString(UNK_hidden_string_result) := Chr(LoByte((Ptr<Byte>(((Ptr<Byte>((local_2b + $C0)))^ + $8C5)))^)); { 7500:0504 }
  PString(FarPtr(SS, BPAddr(-$229))) := PString(FarPtr(SS, BPAddr(-$229))) + PString(FarPtr(SS, BPAddr(-$129))); { 7500:0509 }
  stub_ov32_e4(MakeWord(UNK_extraout_AH_00, (Ptr<Byte>((local_2b + $BF)))^), MakeWord(UNK_extraout_AH_00, (Ptr<Byte>((local_2b + $BE)))^), puVar5, uVar6); { 7500:0520 }
  iVar2 := (Word((Ptr<Byte>((local_2b + $BF)))^) * 8); { 7500:0520; region anchor, exact origin unknown }
  FUN_7500_032f((Ptr<Word>((Ptr<UnknownValue>(@g_5E5A) + iVar2)))^, (Ptr<Word>((Ptr<UnknownValue>(@g_5E5C) + iVar2)))^, g_5EB2, g_5EB4); { 7500:0546 }
  iVar2 := (Word((Ptr<Byte>((local_2b + $BF)))^) * 8); { 7500:0546; region anchor, exact origin unknown }
  FUN_7500_032f((Ptr<Word>((Ptr<UnknownValue>(@g_5E5E) + iVar2)))^, (Ptr<Word>((Ptr<UnknownValue>(@g_5E60) + iVar2)))^, g_5EB6, g_5EB8); { 7500:056A }
  uVar1 := UNK_extraout_AH_01; { 7500:056A; region anchor, exact origin unknown }
  if (param_1 <> $0) then begin { 7500:056A; region anchor, exact origin unknown }
    local_26 := 0; { 7500:0576 }
    while true do begin { 7500:0576; region anchor, exact origin unknown }
      local_15[local_26] := local_26; { 7500:0576; region anchor, exact origin unknown }
      local_25[local_26] := local_26; { 7500:0576; region anchor, exact origin unknown }
      if (local_26 = $F) then begin { 7500:0576; region anchor, exact origin unknown }
        Break; { 7500:0576; region anchor, exact origin unknown }
      end; { 7500:0576; region anchor, exact origin unknown }
      local_26 := (local_26 + 1); { 7500:057C }
    end; { 7500:057C; region anchor, exact origin unknown }
    local_26 := 1; { 7500:059F }
    while true do begin { 7500:059F; region anchor, exact origin unknown }
      local_25[Byte(Ptr<UnknownValue>(@g_3CF5)[local_26])] := ((Ptr<Byte>(((local_2b + Word(local_26)) + $C0)))^ and $F); { 7500:059F; region anchor, exact origin unknown }
      abStack_1d[Byte(Ptr<UnknownValue>(@g_3CF5)[local_26])] := ((Ptr<Byte>(((local_2b + Word(local_26)) + $C0)))^ shr 4); { 7500:059F; region anchor, exact origin unknown }
      if (local_26 = 6) then begin { 7500:059F; region anchor, exact origin unknown }
        Break; { 7500:059F; region anchor, exact origin unknown }
      end; { 7500:059F; region anchor, exact origin unknown }
      local_26 := (local_26 + 1); { 7500:05A5 }
    end; { 7500:05A5; region anchor, exact origin unknown }
    iVar2 := (Word((Ptr<Byte>((local_2b + $BF)))^) * 8); { 7500:05A5; region anchor, exact origin unknown }
    FUN_0464_1e5c((Ptr<Word>((Ptr<UnknownValue>(@g_5E5A) + iVar2)))^, (Ptr<Word>((Ptr<UnknownValue>(@g_5E5C) + iVar2)))^, 0, 0, local_25, UNK_unaff_SS, local_15, UNK_unaff_SS); { 7500:062A }
    iVar2 := (Word((Ptr<Byte>((local_2b + $BF)))^) * 8); { 7500:062A; region anchor, exact origin unknown }
    FUN_0464_1e5c((Ptr<Word>((Ptr<UnknownValue>(@g_5E5E) + iVar2)))^, (Ptr<Word>((Ptr<UnknownValue>(@g_5E60) + iVar2)))^, 0, 0, local_25, UNK_unaff_SS, local_15, UNK_unaff_SS); { 7500:0657 }
    uVar1 := UNK_extraout_AH_02; { 7500:0657; region anchor, exact origin unknown }
  end; { 7500:0657; region anchor, exact origin unknown }
  stub_ov32_e3(MakeWord(uVar1, $B)); { 7500:065F }
  FUN_0802_095d(); { 7500:0664 }
  FUN_0899_0104(); { 7500:0669 }
  Exit; { 7500:0671 }
end;
```

### ov17:069E WriteCharacter (conf M)

Original `ov17_069E`. Params (ABI order): param_1: LongWord; param_2: LongWord.
BP access inventory (hex offset:byte widths): -3D1:2, -2D1:2, -2CF:2, -1D1:2, -1CF:2, -D1:2, -CF:2, -CD:2, -CB:2, -C9:2, -C7:2, -C5:2, -C3:2, -C1:2, -BF:2, -BD:2, -BB:2, -B7:2, -B2:2, -89:2, -9:1/2, +6:2, +A:2.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; uVar3: Word; extraout_AH: Byte; iVar4: SmallInt; iVar5: SmallInt; uVar6: Word; uVar7: Word; unaff_SS: Word; puVar8: ^Byte; uVar9: Word; puVar10: ^Byte; puVar11: ^Byte; uVar12: Word; puVar13: ^Byte; uVar14: Word; local_3d3: array[0..256-1] of Byte; local_2d3: array[0..2-1] of Byte; local_2d1: array[0..254-1] of Byte; local_1d3: array[0..2-1] of Byte; local_1d1: array[0..254-1] of Byte; local_d3: array[0..2-1] of Byte; local_d1: SmallInt; local_cf: LongWord; local_cb: SmallInt; iStack_c9: SmallInt; local_c7: SmallInt; local_c5: SmallInt; local_c3: SmallInt; iStack_c1: SmallInt; local_bf: SmallInt; iStack_bd: SmallInt; local_b9: array[0..5-1] of Byte; local_b4: array[0..41-1] of Byte; local_8b: array[0..128-1] of Byte; local_b: array[0..9-1] of ShortInt.
Callers: ov17_1D58.
Callees (listing): System.@StrAssign, ov17_0010, System.GetMem, System.FillChar, ov17_01B8, stub_ov25_e7, System.@StrCopy, FUN_0802_0356, FUN_0802_0425, System.@StrAppend, FUN_7500_02ae, System.AssignFile, System.RewriteFile, System.IOResult, System.@CharToStr, FUN_0709_0bf5, System.BlockWrite, System.CloseFile, FUN_0802_02eb, System.Erase.

285-byte character, 63-byte items, 9-byte effects; stale pointers on disk. See decode/data/SAVES.md. Evidence: decode/listings/ov17.lst at 7500:069E, paired .c.

```pascal
procedure ov17_069E(param_1: LongWord; param_2: LongWord);
begin
  PString(FarPtr(SS, BPAddr(-$9))) := Copy(PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))), 1, $8); { 7500:06B3 }
  iVar4 := SmallInt(param_2); { 7500:06B3; region anchor, exact origin unknown }
  uVar6 := Word((LongWord(param_2) shr $10)); { 7500:06B3; region anchor, exact origin unknown }
  if (local_b[0] = $0) then begin { 7500:06B3; region anchor, exact origin unknown }
    ov17_0010(@local_c7, UNK_unaff_SS); { 7500:06C8 }
    _local_cb := MakeLong(local_c5, local_c7); { 7500:06C8; region anchor, exact origin unknown }
    if ((local_c7 <> 0) or else (local_c5 <> 0)) then begin { 7500:06C8; region anchor, exact origin unknown }
      while true do begin { 7500:06C8; region anchor, exact origin unknown }
        uVar7 := Word((LongWord(_local_cb) shr $10)); { 7500:06C8; region anchor, exact origin unknown }
        iVar5 := SmallInt(_local_cb); { 7500:06C8; region anchor, exact origin unknown }
        if (((Ptr<SmallInt>((iVar5 + $2A)))^ = 0) and then ((Ptr<SmallInt>((iVar5 + $2C)))^ = 0)) then begin { 7500:06C8; region anchor, exact origin unknown }
          Break; { 7500:06C8; region anchor, exact origin unknown }
        end; { 7500:06C8; region anchor, exact origin unknown }
        _local_cb := MakeLong((Ptr<Word>((iVar5 + $2C)))^, (Ptr<Word>((iVar5 + $2A)))^); { 7500:06C8; region anchor, exact origin unknown }
      end; { 7500:06C8; region anchor, exact origin unknown }
    end; { 7500:06C8; region anchor, exact origin unknown }
    local_cf := GetMem($2E); { 7500:070D }
    FillChar(0, $2E, local_cf); { 7500:0727 }
    PString(FarPtr(FarSeg(BPWord(-$CD)), FarOff(BPWord(-$CD)))) := Copy(PString(FarPtr(FarSeg(BPWord($A)), FarOff(BPWord($A)))), 1, $28); { 7500:073B }
    if ((local_cb = 0) and then (iStack_c9 = 0)) then begin { 7500:073B; region anchor, exact origin unknown }
      local_c7 := SmallInt(local_cf); { 7500:0768 }
      local_c5 := ExtractBytes(local_cf, 2, 2); { 7500:076C }
    end else begin { 7500:076C; region anchor, exact origin unknown }
      (Ptr<SmallInt>((local_cb + $2A)))^ := SmallInt(local_cf); { 7500:076C; region anchor, exact origin unknown }
      (Ptr<SmallInt>((local_cb + $2C)))^ := ExtractBytes(local_cf, 2, 2); { 7500:076C; region anchor, exact origin unknown }
    end; { 7500:076C; region anchor, exact origin unknown }
    ov17_01B8(local_c7, local_c5); { 7500:0779 }
    stub_ov25_e7(@local_c7, UNK_unaff_SS); { 7500:0782 }
    PString(FarPtr(SS, BPAddr(-$B7))) := Copy('.cha', 1, $4); { 7500:0796 }
    puVar13 := local_3d3; { 7500:0796; region anchor, exact origin unknown }
    uVar14 := UNK_unaff_SS; { 7500:0796; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3D1))) := PString(FarPtr($0C7C, $537A)); { 7500:07A6 }
    puVar11 := local_2d3; { 7500:07A6; region anchor, exact origin unknown }
    puVar10 := local_1d3; { 7500:07A6; region anchor, exact origin unknown }
    puVar8 := local_d3; { 7500:07A6; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:07A6; region anchor, exact origin unknown }
    iVar5 := iVar4; { 7500:07A6; region anchor, exact origin unknown }
    uVar9 := uVar6; { 7500:07A6; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:07A6; region anchor, exact origin unknown }
    uVar12 := UNK_unaff_SS; { 7500:07A6; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$D1))) := '.'; { 7500:07C7 }
    FUN_0802_0356(puVar8, uVar7, iVar5, uVar9); { 7500:07CC }
    FUN_0802_0425(puVar10, uVar3); { 7500:07D1 }
    PString(FarPtr(SS, BPAddr(-$3D1))) := PString(FarPtr(SS, BPAddr(-$3D1))) + PString(FarPtr(SS, BPAddr(-$2D1))); { 7500:07D6 }
    PString(FarPtr(SS, BPAddr(-$B2))) := Copy(PString(FarPtr(SS, BPAddr(-$3D1))), 1, $28); { 7500:07E5 }
  end else begin { 7500:07E5; region anchor, exact origin unknown }
    FUN_7500_02ae(); { 7500:07ED }
    PString(FarPtr(SS, BPAddr(-$B7))) := Copy('.sav', 1, $4); { 7500:07FF }
    puVar13 := local_1d1; { 7500:07FF; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:07FF; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr($0C7C, $537A)); { 7500:080F }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$1CF))) + PString(FarPtr(SS, BPAddr(-$9))); { 7500:0819 }
    PString(FarPtr(SS, BPAddr(-$B2))) := Copy(PString(FarPtr(SS, BPAddr(-$1CF))), 1, $28); { 7500:0828 }
  end; { 7500:0828; region anchor, exact origin unknown }
  repeat { 7500:0828; region anchor, exact origin unknown }
    puVar13 := local_8b; { 7500:0828; region anchor, exact origin unknown }
    puVar11 := local_1d1; { 7500:0828; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:0828; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7500:0828; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:083F }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$1CF))) + PString(FarPtr(SS, BPAddr(-$B7))); { 7500:084A }
    Assign(FarPtr(SS, BPAddr(-$89)), PString(FarPtr(SS, BPAddr(-$1CF)))); { 7500:084F }
    Rewrite(FarPtr(SS, BPAddr(-$89)), $1); { 7500:085E }
    local_d1 := IOResult(); { 7500:0863 }
    if (local_d1 <> 0) then begin { 7500:0863; region anchor, exact origin unknown }
      uVar3 := $E; { 7500:0863; region anchor, exact origin unknown }
      puVar13 := local_2d1; { 7500:0863; region anchor, exact origin unknown }
      uVar9 := UNK_unaff_SS; { 7500:0863; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$2CF))) := 'Put save disk in '; { 7500:0881 }
      puVar11 := local_1d1; { 7500:0881; region anchor, exact origin unknown }
      uVar7 := UNK_unaff_SS; { 7500:0881; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH, g_537B))); { 7500:0890 }
      PString(FarPtr(SS, BPAddr(-$2CF))) := PString(FarPtr(SS, BPAddr(-$2CF))) + PString(FarPtr(SS, BPAddr(-$1CF))); { 7500:0895 }
      PString(FarPtr(SS, BPAddr(-$2CF))) := PString(FarPtr(SS, BPAddr(-$2CF))) + ':'; { 7500:089F }
      FUN_0709_0bf5(puVar13, uVar9, uVar3); { 7500:08A4 }
    end; { 7500:08A4; region anchor, exact origin unknown }
  until not ((local_d1 <> 0)); { 7500:08A4; region anchor, exact origin unknown }
  BlockWrite(FarPtr(SS, BPAddr(-$89)), FarPtr(FarSeg(BPWord($A)), FarOff(BPWord($A))), $11D, FarPtr(0, 0)); { 7500:08C6 }
  Close(FarPtr(SS, BPAddr(-$89))); { 7500:08D1 }
  puVar13 := local_1d1; { 7500:08D1; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 7500:08D1; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:08E2 }
  PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$1CF))) + '.itm'; { 7500:08EC }
  cVar2 := FUN_0802_02eb(puVar13, uVar7); { 7500:08F1 }
  if (cVar2 <> $0) then begin { 7500:08F1; region anchor, exact origin unknown }
    puVar13 := local_8b; { 7500:08F1; region anchor, exact origin unknown }
    puVar11 := local_2d1; { 7500:08F1; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:08F1; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7500:08F1; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:090C }
    PString(FarPtr(SS, BPAddr(-$2CF))) := PString(FarPtr(SS, BPAddr(-$2CF))) + '.itm'; { 7500:0916 }
    Assign(FarPtr(SS, BPAddr(-$89)), PString(FarPtr(SS, BPAddr(-$2CF)))); { 7500:091B }
    Erase(BPAddr(-$89), SS); { 7500:0926 }
  end; { 7500:0926; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((iVar4 + 200)))^ <> 0) or else ((Ptr<SmallInt>((iVar4 + $CA)))^ <> 0)) then begin { 7500:0926; region anchor, exact origin unknown }
    puVar13 := local_8b; { 7500:0926; region anchor, exact origin unknown }
    puVar11 := local_1d1; { 7500:0926; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:0926; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7500:0926; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:094F }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$1CF))) + '.itm'; { 7500:0959 }
    Assign(FarPtr(SS, BPAddr(-$89)), PString(FarPtr(SS, BPAddr(-$1CF)))); { 7500:095E }
    Rewrite(FarPtr(SS, BPAddr(-$89)), $1); { 7500:096D }
    _local_bf := MakeLong((Ptr<Word>((iVar4 + $CA)))^, (Ptr<Word>((iVar4 + 200)))^); { 7500:096D; region anchor, exact origin unknown }
    while true do begin { 7500:096D; region anchor, exact origin unknown }
      if ((local_bf = 0) and then (iStack_bd = 0)) then begin { 7500:096D; region anchor, exact origin unknown }
        Break; { 7500:096D; region anchor, exact origin unknown }
      end; { 7500:096D; region anchor, exact origin unknown }
      BlockWrite(FarPtr(SS, BPAddr(-$89)), FarPtr(FarSeg(BPWord(-$BD)), FarOff(BPWord(-$BD))), $3F, FarPtr(0, 0)); { 7500:09A5 }
      uVar7 := Word((LongWord(_local_bf) shr $10)); { 7500:09A5; region anchor, exact origin unknown }
      _local_bf := MakeLong((Ptr<Word>((SmallInt(_local_bf) + $2C)))^, (Ptr<Word>((SmallInt(_local_bf) + $2A)))^); { 7500:09A5; region anchor, exact origin unknown }
    end; { 7500:09A5; region anchor, exact origin unknown }
    Close(FarPtr(SS, BPAddr(-$89))); { 7500:09C6 }
  end; { 7500:09C6; region anchor, exact origin unknown }
  puVar13 := local_1d1; { 7500:09C6; region anchor, exact origin unknown }
  uVar7 := UNK_unaff_SS; { 7500:09C6; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:09D7 }
  PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$1CF))) + '.spc'; { 7500:09E1 }
  cVar2 := FUN_0802_02eb(puVar13, uVar7); { 7500:09E6 }
  if (cVar2 <> $0) then begin { 7500:09E6; region anchor, exact origin unknown }
    puVar13 := local_8b; { 7500:09E6; region anchor, exact origin unknown }
    puVar11 := local_2d1; { 7500:09E6; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:09E6; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7500:09E6; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:0A01 }
    PString(FarPtr(SS, BPAddr(-$2CF))) := PString(FarPtr(SS, BPAddr(-$2CF))) + '.spc'; { 7500:0A0B }
    Assign(FarPtr(SS, BPAddr(-$89)), PString(FarPtr(SS, BPAddr(-$2CF)))); { 7500:0A10 }
    Erase(BPAddr(-$89), SS); { 7500:0A1B }
  end; { 7500:0A1B; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((iVar4 + $7F)))^ <> 0) or else ((Ptr<SmallInt>((iVar4 + $81)))^ <> 0)) then begin { 7500:0A1B; region anchor, exact origin unknown }
    puVar13 := local_8b; { 7500:0A1B; region anchor, exact origin unknown }
    puVar11 := local_1d1; { 7500:0A1B; region anchor, exact origin unknown }
    uVar7 := UNK_unaff_SS; { 7500:0A1B; region anchor, exact origin unknown }
    uVar9 := UNK_unaff_SS; { 7500:0A1B; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$B2))); { 7500:0A43 }
    PString(FarPtr(SS, BPAddr(-$1CF))) := PString(FarPtr(SS, BPAddr(-$1CF))) + '.spc'; { 7500:0A4D }
    Assign(FarPtr(SS, BPAddr(-$89)), PString(FarPtr(SS, BPAddr(-$1CF)))); { 7500:0A52 }
    Rewrite(FarPtr(SS, BPAddr(-$89)), $1); { 7500:0A61 }
    iStack_c1 := (Ptr<SmallInt>((iVar4 + $81)))^; { 7500:0A61; region anchor, exact origin unknown }
    local_c3 := (Ptr<SmallInt>((iVar4 + $7F)))^; { 7500:0A72 }
    while ((local_c3 <> 0) or else (iStack_c1 <> 0)) do begin { 7500:0A72; region anchor, exact origin unknown }
      BlockWrite(FarPtr(SS, BPAddr(-$89)), FarPtr(FarSeg(BPWord(-$C1)), FarOff(BPWord(-$C1))), $9, FarPtr(0, 0)); { 7500:0A98 }
      piVar1 := Ptr<SmallInt>((local_c3 + 5)); { 7500:0A98; region anchor, exact origin unknown }
      iStack_c1 := (Ptr<SmallInt>((local_c3 + 7)))^; { 7500:0A98; region anchor, exact origin unknown }
      local_c3 := (piVar1)^; { 7500:0AA9 }
    end; { 7500:0AA9; region anchor, exact origin unknown }
    Close(FarPtr(SS, BPAddr(-$89))); { 7500:0AB9 }
  end; { 7500:0AB9; region anchor, exact origin unknown }
  Exit; { 7500:0AC1 }
end;
```

### ov17:0AEC ReadCharacter (conf M)

Original `ov17_0AEC`. Params (ABI order): param_1: ShortInt; param_2: ShortInt; param_3: LongWord; param_4: LongWord.
BP access inventory (hex offset:byte widths): -3B9:2, -2B9:2, -1B9:1, -1B8:2, -18F:2, -18D:2, -18B:2, -189:2, -187:2, -182:2, -180:2, -100:2, +6:1, +8:1, +A:2, +E:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; iVar2: SmallInt; iVar3: SmallInt; uVar4: Word; uVar5: Word; unaff_SS: Word; uVar6: LongWord; puVar7: ^Byte; puVar8: ^Byte; local_3bb: array[0..256-1] of Byte; local_2bb: array[0..256-1] of Byte; local_1bb: Byte; local_1ba: array[0..41-1] of Byte; local_191: Word; uStack_18f: Word; local_18d: Word; uStack_18b: Word; local_189: array[0..5-1] of Byte; local_184: array[0..2-1] of Byte; local_182: array[0..128-1] of Byte; local_102: array[0..256-1] of Byte.
Callers: ov17_1602.
Callees (listing): System.@StrAssign, System.@StrCopy, FUN_0802_0425, System.@StrAppend, System.@CharToStr, FUN_0802_025d, System.BlockRead, System.CloseFile, FUN_0802_02eb, System.GetMem, System.EofFile, FUN_0899_0104.

Clears/relinks saved pointers. See SAVES.md; retains exact byte I/O counts below. Evidence: decode/listings/ov17.lst at 7500:0AEC, paired .c.

```pascal
procedure ov17_0AEC(param_1: ShortInt; param_2: ShortInt; param_3: LongWord; param_4: LongWord);
begin
  PString(FarPtr(SS, BPAddr(-$100))) := Copy(PString(FarPtr(FarSeg(BPWord($E)), FarOff(BPWord($E)))), 1, $FF); { 7500:0B02 }
  if (param_1 = $0) then begin { 7500:0B02; region anchor, exact origin unknown }
    puVar8 := local_3bb; { 7500:0B02; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7500:0B02; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr($0C7C, $537A)); { 7500:0B18 }
    puVar7 := local_2bb; { 7500:0B18; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 7500:0B18; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_00, g_547D))); { 7500:0B5C }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + PString(FarPtr(SS, BPAddr(-$2B9))); { 7500:0B2E }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + PString(FarPtr(SS, BPAddr(-$2B9))); { 7500:0B61 }
    PString(FarPtr(SS, BPAddr(-$100))) := Copy(PString(FarPtr(SS, BPAddr(-$3B9))), 1, $FF); { 7500:0B3D }
  end else begin { 7500:0B3D; region anchor, exact origin unknown }
    puVar8 := local_3bb; { 7500:0B3D; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7500:0B3D; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3B9))) := 'Put save disk in '; { 7500:0B4D }
    puVar7 := local_2bb; { 7500:0B4D; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 7500:0B4D; region anchor, exact origin unknown }
    FUN_0802_0425(local_102, UNK_unaff_SS); { 7500:0B29 }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + ':'; { 7500:0B6B }
    PString(FarPtr(SS, BPAddr(-$1B8))) := Copy(PString(FarPtr(SS, BPAddr(-$3B9))), 1, $28); { 7500:0B7A }
    puVar8 := local_3bb; { 7500:0B7A; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7500:0B7A; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr($AF8, $AC4)); { 7500:0B99 }
    puVar7 := local_2bb; { 7500:0B99; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 7500:0B99; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH, g_537B))); { 7500:0BA8 }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + PString(FarPtr(SS, BPAddr(-$2B9))); { 7500:0BAD }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + ':'; { 7500:0BB7 }
    PString(FarPtr(SS, BPAddr(-$1B8))) := Copy(PString(FarPtr(SS, BPAddr(-$3B9))), 1, $28); { 7500:0BC6 }
  end; { 7500:0BC6; region anchor, exact origin unknown }
  if (param_2 = $0) then begin { 7500:0BC6; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$187))) := Copy('.sav', 1, $4); { 7500:0BE0 }
  end else begin { 7500:0BE0; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$187))) := Copy('.cha', 1, $4); { 7500:0BF6 }
  end; { 7500:0BF6; region anchor, exact origin unknown }
  puVar8 := local_2bb; { 7500:0BF6; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:0BF6; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$2B9))) := PString(FarPtr(SS, BPAddr(-$100))); { 7500:0C07 }
  PString(FarPtr(SS, BPAddr(-$2B9))) := PString(FarPtr(SS, BPAddr(-$2B9))) + PString(FarPtr(SS, BPAddr(-$187))); { 7500:0C12 }
  local_1bb := FUN_0802_025d(local_182, UNK_unaff_SS, (Word(UNK_extraout_AH_01) shl 8), local_1ba, UNK_unaff_SS, puVar8, uVar5); { 7500:0C26 }
  uVar4 := Word((LongWord(param_3) shr $10)); { 7500:0C26; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_3); { 7500:0C26; region anchor, exact origin unknown }
  BlockRead(FarPtr(UNK_unaff_SS, local_182), FarPtr(uVar4, iVar2), $11D, FarPtr(UNK_unaff_SS, local_184)); { 7500:0C44 }
  Close(FarPtr(SS, BPAddr(-$180))); { 7500:0C4F }
  (Ptr<Word>((iVar2 + $104)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $106)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + 200)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $CA)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $7F)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $81)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $108)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $10A)))^ := 0; { 7500:0C4F; region anchor, exact origin unknown }
  puVar8 := local_2bb; { 7500:0C4F; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:0C4F; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$2B9))) := PString(FarPtr(SS, BPAddr(-$100))); { 7500:0C9B }
  PString(FarPtr(SS, BPAddr(-$2B9))) := PString(FarPtr(SS, BPAddr(-$2B9))) + '.itm'; { 7500:0CA5 }
  cVar1 := FUN_0802_02eb(puVar8, uVar5); { 7500:0CAA }
  if (cVar1 <> $0) then begin { 7500:0CAA; region anchor, exact origin unknown }
    uVar6 := GetMem($3F); { 7500:0CBA }
    (Ptr<Word>((iVar2 + 200)))^ := SmallInt(uVar6); { 7500:0CBA; region anchor, exact origin unknown }
    (Ptr<Word>((iVar2 + $CA)))^ := SmallInt((LongWord(uVar6) shr $10)); { 7500:0CBA; region anchor, exact origin unknown }
    _local_18d := MakeLong((Ptr<Word>((iVar2 + $CA)))^, (Ptr<Word>((iVar2 + 200)))^); { 7500:0CBA; region anchor, exact origin unknown }
    puVar8 := local_3bb; { 7500:0CBA; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 7500:0CBA; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$100))); { 7500:0CED }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + '.itm'; { 7500:0CF7 }
    local_1bb := FUN_0802_025d(local_182, UNK_unaff_SS, (Word(UNK_extraout_AH_02) shl 8), local_1ba, UNK_unaff_SS, puVar8, uVar5); { 7500:0D0B }
    repeat { 7500:0D0B; region anchor, exact origin unknown }
      BlockRead(FarPtr(UNK_unaff_SS, local_182), FarPtr(SmallInt((LongWord(_local_18d) shr $10)), SmallInt(_local_18d)), $3F, FarPtr(UNK_unaff_SS, local_184)); { 7500:0D2A }
      uVar5 := Word((LongWord(_local_18d) shr $10)); { 7500:0D2A; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_18d) + $2A)))^ := 0; { 7500:0D2A; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_18d) + $2C)))^ := 0; { 7500:0D2A; region anchor, exact origin unknown }
      cVar1 := EofFile(BPAddr(-$180), SS); { 7500:0D43 }
      if (cVar1 = $0) then begin { 7500:0D43; region anchor, exact origin unknown }
        uVar6 := GetMem($3F); { 7500:0D50 }
        uVar5 := Word((LongWord(_local_18d) shr $10)); { 7500:0D50; region anchor, exact origin unknown }
        iVar3 := SmallInt(_local_18d); { 7500:0D50; region anchor, exact origin unknown }
        (Ptr<Word>((iVar3 + $2A)))^ := SmallInt(uVar6); { 7500:0D50; region anchor, exact origin unknown }
        (Ptr<Word>((iVar3 + $2C)))^ := SmallInt((LongWord(uVar6) shr $10)); { 7500:0D50; region anchor, exact origin unknown }
        _local_18d := MakeLong((Ptr<Word>((iVar3 + $2C)))^, (Ptr<Word>((iVar3 + $2A)))^); { 7500:0D50; region anchor, exact origin unknown }
      end; { 7500:0D50; region anchor, exact origin unknown }
      cVar1 := EofFile(BPAddr(-$180), SS); { 7500:0D7B }
    until not ((cVar1 = $0)); { 7500:0D7B; region anchor, exact origin unknown }
    Close(FarPtr(SS, BPAddr(-$180))); { 7500:0D8A }
  end; { 7500:0D8A; region anchor, exact origin unknown }
  puVar8 := local_2bb; { 7500:0D8A; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:0D8A; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$2B9))) := PString(FarPtr(SS, BPAddr(-$100))); { 7500:0D9B }
  PString(FarPtr(SS, BPAddr(-$2B9))) := PString(FarPtr(SS, BPAddr(-$2B9))) + '.spc'; { 7500:0DA5 }
  cVar1 := FUN_0802_02eb(puVar8, uVar5); { 7500:0DAA }
  if (cVar1 <> $0) then begin { 7500:0DAA; region anchor, exact origin unknown }
    uVar6 := GetMem($9); { 7500:0DBA }
    (Ptr<Word>((iVar2 + $7F)))^ := SmallInt(uVar6); { 7500:0DBA; region anchor, exact origin unknown }
    (Ptr<Word>((iVar2 + $81)))^ := SmallInt((LongWord(uVar6) shr $10)); { 7500:0DBA; region anchor, exact origin unknown }
    _local_191 := MakeLong((Ptr<Word>((iVar2 + $81)))^, (Ptr<Word>((iVar2 + $7F)))^); { 7500:0DBA; region anchor, exact origin unknown }
    puVar8 := local_3bb; { 7500:0DBA; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 7500:0DBA; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$100))); { 7500:0DEB }
    PString(FarPtr(SS, BPAddr(-$3B9))) := PString(FarPtr(SS, BPAddr(-$3B9))) + '.spc'; { 7500:0DF5 }
    local_1bb := FUN_0802_025d(local_182, UNK_unaff_SS, (Word(UNK_extraout_AH_03) shl 8), local_1ba, UNK_unaff_SS, puVar8, uVar5); { 7500:0E09 }
    repeat { 7500:0E09; region anchor, exact origin unknown }
      BlockRead(FarPtr(UNK_unaff_SS, local_182), FarPtr(SmallInt((LongWord(_local_191) shr $10)), SmallInt(_local_191)), 9, FarPtr(UNK_unaff_SS, local_184)); { 7500:0E28 }
      uVar5 := Word((LongWord(_local_191) shr $10)); { 7500:0E28; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_191) + 5)))^ := 0; { 7500:0E28; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_191) + 7)))^ := 0; { 7500:0E28; region anchor, exact origin unknown }
      cVar1 := EofFile(BPAddr(-$180), SS); { 7500:0E41 }
      if (cVar1 = $0) then begin { 7500:0E41; region anchor, exact origin unknown }
        uVar6 := GetMem($9); { 7500:0E4E }
        uVar5 := Word((LongWord(_local_191) shr $10)); { 7500:0E4E; region anchor, exact origin unknown }
        iVar2 := SmallInt(_local_191); { 7500:0E4E; region anchor, exact origin unknown }
        (Ptr<Word>((iVar2 + 5)))^ := SmallInt(uVar6); { 7500:0E4E; region anchor, exact origin unknown }
        (Ptr<Word>((iVar2 + 7)))^ := SmallInt((LongWord(uVar6) shr $10)); { 7500:0E4E; region anchor, exact origin unknown }
        _local_191 := MakeLong((Ptr<Word>((iVar2 + 7)))^, (Ptr<Word>((iVar2 + 5)))^); { 7500:0E4E; region anchor, exact origin unknown }
      end; { 7500:0E4E; region anchor, exact origin unknown }
      cVar1 := EofFile(BPAddr(-$180), SS); { 7500:0E79 }
    until not ((cVar1 = $0)); { 7500:0E79; region anchor, exact origin unknown }
    Close(FarPtr(SS, BPAddr(-$180))); { 7500:0E88 }
  end; { 7500:0E88; region anchor, exact origin unknown }
  FUN_0899_0104(); { 7500:0E8D }
  Exit; { 7500:0E95 }
end;
```

### ov17:0EC4 LoadMonster (conf M)

Original `ov17_0EC4`. Params (ABI order): param_1: LongWord; param_2: Byte.
BP access inventory (hex offset:byte widths): -119:2, -114:2, -2B:2, -18:2, -16:2, -14:1, -13:1, -12:2, -10:2, -E:2, -C:2, -A:2, -8:2, -6:2, -4:2, -2:2, +6:2, +A:1.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; iVar2: SmallInt; iVar3: SmallInt; uVar4: Word; uVar5: Word; uVar6: Word; unaff_SS: Word; uVar7: LongWord; puVar8: ^Byte; puVar9: ^Byte; uVar10: Word; local_11b: array[0..5-1] of Byte; local_116: array[0..233-1] of Byte; local_2d: array[0..19-1] of Byte; local_1a: SmallInt; uStack_18: Word; local_16: ShortInt; local_15: Byte; local_14: array[0..2-1] of Byte; local_12: Word; uStack_10: Word; local_e: Word; uStack_c: Word; local_a: Word; local_8: Word; uStack_6: Word; local_4: Word.
Callers: ov17_1262.
Callees (listing): System.@StrLong, System.@StrCopy, System.@StrAppend, FUN_0802_0716, FUN_0709_0bf5, FUN_0899_0000, System.Move, stub_ov24_e8, System.FreeMem, System.GetMem, FUN_0899_0104.

DAX character/item/effect records. Evidence: decode/listings/ov17.lst at 7500:0EC4, paired .c.

```pascal
procedure ov17_0EC4(param_1: LongWord; param_2: Byte);
begin
  Str(LongInt(MakeLong(0, g_5376)), PString(FarPtr(UNK_unaff_SS, local_14))); { 7500:0EE0 }
  puVar9 := local_116; { 7500:0EE0; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:0EE0; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$114))) := 'MON'; { 7500:0EF0 }
  PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + PString(FarPtr(SS, BPAddr(-$12))); { 7500:0EFA }
  PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + 'CHA'; { 7500:0F04 }
  puVar8 := local_11b; { 7500:0F04; region anchor, exact origin unknown }
  uVar4 := UNK_unaff_SS; { 7500:0F04; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$119))) := '.dax'; { 7500:0F14 }
  FUN_0802_0716(@local_8, UNK_unaff_SS, @local_4, UNK_unaff_SS, MakeWord(UNK_extraout_AH, param_2), puVar8, uVar4, puVar9, uVar5); { 7500:0F27 }
  if (local_4 = 0) then begin { 7500:0F27; region anchor, exact origin unknown }
    uVar5 := MakeWord(UNK_extraout_AH_00, $F); { 7500:0F27; region anchor, exact origin unknown }
    puVar9 := local_2d; { 7500:0F27; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7500:0F27; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2B))) := 'Unable to load monster'; { 7500:0F3F }
    FUN_0709_0bf5(puVar9, uVar4, uVar5); { 7500:0F44 }
    FUN_0899_0000(); { 7500:0F49 }
  end; { 7500:0F49; region anchor, exact origin unknown }
  uVar4 := Word((LongWord(param_1) shr $10)); { 7500:0F49; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_1); { 7500:0F49; region anchor, exact origin unknown }
  Move(FarPtr(FarSeg(BPWord(-$6)), FarOff(BPWord(-$6))), FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6))), $11D); { 7500:0F5C }
  (Ptr<Word>((iVar2 + 200)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $CA)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $7F)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $81)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $104)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $106)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $108)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  (Ptr<Word>((iVar2 + $10A)))^ := 0; { 7500:0F5C; region anchor, exact origin unknown }
  cVar1 := (Ptr<ShortInt>((iVar2 + $2E)))^; { 7500:0F5C; region anchor, exact origin unknown }
  if (((cVar1 = $1) or else (cVar1 = $3)) or else (cVar1 = $5)) then begin { 7500:0F5C; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar2 + $C0)))^ := 1; { 7500:0F5C; region anchor, exact origin unknown }
  end else begin { 7500:0F5C; region anchor, exact origin unknown }
    if (((cVar1 = $2) or else (cVar1 = $4)) or else ((cVar1 = $6) or else (cVar1 = $7))) then begin { 7500:0F5C; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar2 + $C0)))^ := 2; { 7500:0F5C; region anchor, exact origin unknown }
    end; { 7500:0F5C; region anchor, exact origin unknown }
  end; { 7500:0F5C; region anchor, exact origin unknown }
  local_15 := 1; { 7500:0FDC }
  local_1a := iVar2; { 7500:0F64 }
  uStack_18 := uVar4; { 7500:0F64; region anchor, exact origin unknown }
  while true do begin { 7500:0F64; region anchor, exact origin unknown }
    local_16 := stub_ov24_e8(6, 1); { 7500:0FEB }
    (Ptr<ShortInt>(((local_1a + Word(local_15)) + $C0)))^ := ((local_16 * $11) + (-$80)); { 7500:0FEB; region anchor, exact origin unknown }
    if (local_15 = 3) then begin { 7500:0FEB; region anchor, exact origin unknown }
      Break; { 7500:0FEB; region anchor, exact origin unknown }
    end; { 7500:0FEB; region anchor, exact origin unknown }
    local_15 := (local_15 + 1); { 7500:0FE2 }
  end; { 7500:0FE2; region anchor, exact origin unknown }
  (Ptr<Byte>((local_1a + $C4)))^ := $C4; { 7500:0FE2; region anchor, exact origin unknown }
  local_15 := 5; { 7500:1029 }
  while true do begin { 7500:1029; region anchor, exact origin unknown }
    local_16 := stub_ov24_e8(6, 1); { 7500:1038 }
    (Ptr<ShortInt>(((local_1a + Word(local_15)) + $C0)))^ := ((local_16 * $11) + (-$80)); { 7500:1038; region anchor, exact origin unknown }
    if (local_15 = 6) then begin { 7500:1038; region anchor, exact origin unknown }
      Break; { 7500:1038; region anchor, exact origin unknown }
    end; { 7500:1038; region anchor, exact origin unknown }
    local_15 := (local_15 + 1); { 7500:102F }
  end; { 7500:102F; region anchor, exact origin unknown }
  FreeMem(FarPtr(BPWord(-$4), BPWord(-$6)), BPWord(-$2)); { 7500:1076 }
  g_557C := 1; { 7500:107B }
  puVar9 := local_116; { 7500:107B; region anchor, exact origin unknown }
  uVar10 := UNK_unaff_SS; { 7500:107B; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$114))) := 'MON'; { 7500:108B }
  PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + PString(FarPtr(SS, BPAddr(-$12))); { 7500:1095 }
  PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + 'SPC'; { 7500:109F }
  puVar8 := local_11b; { 7500:109F; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:109F; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$119))) := '.dax'; { 7500:10AF }
  uVar6 := $802; { 7500:10AF; region anchor, exact origin unknown }
  FUN_0802_0716(@local_8, UNK_unaff_SS, @local_4, UNK_unaff_SS, MakeWord(UNK_extraout_AH_01, param_2), puVar8, uVar5, puVar9, uVar10); { 7500:10C2 }
  if (local_4 <> 0) then begin { 7500:10C2; region anchor, exact origin unknown }
    local_a := 0; { 7500:10D2 }
    uVar7 := GetMem($9); { 7500:10D9 }
    (Ptr<Word>((iVar2 + $7F)))^ := SmallInt(uVar7); { 7500:10D9; region anchor, exact origin unknown }
    (Ptr<Word>((iVar2 + $81)))^ := SmallInt((LongWord(uVar7) shr $10)); { 7500:10D9; region anchor, exact origin unknown }
    _local_12 := MakeLong((Ptr<Word>((iVar2 + $81)))^, (Ptr<Word>((iVar2 + $7F)))^); { 7500:10D9; region anchor, exact origin unknown }
    repeat { 7500:10D9; region anchor, exact origin unknown }
      Move(FarPtr(FarSeg(BPWord(-$6)), (FarOff(BPWord(-$6)) + BPWord(-$8))), FarPtr(FarSeg(BPWord(-$10)), FarOff(BPWord(-$10))), $9); { 7500:110F }
      uVar5 := Word((LongWord(_local_12) shr $10)); { 7500:110F; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_12) + 5)))^ := 0; { 7500:110F; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_12) + 7)))^ := 0; { 7500:110F; region anchor, exact origin unknown }
      local_a := (local_a + 9); { 7500:1121 }
      if (local_a < local_4) then begin { 7500:1121; region anchor, exact origin unknown }
        uVar7 := GetMem($9); { 7500:1131 }
        uVar5 := Word((LongWord(_local_12) shr $10)); { 7500:1131; region anchor, exact origin unknown }
        iVar3 := SmallInt(_local_12); { 7500:1131; region anchor, exact origin unknown }
        (Ptr<Word>((iVar3 + 5)))^ := SmallInt(uVar7); { 7500:1131; region anchor, exact origin unknown }
        (Ptr<Word>((iVar3 + 7)))^ := SmallInt((LongWord(uVar7) shr $10)); { 7500:1131; region anchor, exact origin unknown }
        _local_12 := MakeLong((Ptr<Word>((iVar3 + 7)))^, (Ptr<Word>((iVar3 + 5)))^); { 7500:1131; region anchor, exact origin unknown }
      end; { 7500:1131; region anchor, exact origin unknown }
    until not ((local_a < local_4)); { 7500:1131; region anchor, exact origin unknown }
    uVar6 := $AF8; { 7500:1131; region anchor, exact origin unknown }
    FreeMem(FarPtr(BPWord(-$4), BPWord(-$6)), BPWord(-$2)); { 7500:1163 }
  end; { 7500:1163; region anchor, exact origin unknown }
  puVar9 := local_116; { 7500:1163; region anchor, exact origin unknown }
  uVar10 := UNK_unaff_SS; { 7500:1163; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$114))) := 'MON'; { 7500:1173 }
  PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + PString(FarPtr(SS, BPAddr(-$12))); { 7500:117D }
  PString(FarPtr(SS, BPAddr(-$114))) := PString(FarPtr(SS, BPAddr(-$114))) + 'ITM'; { 7500:1187 }
  puVar8 := local_11b; { 7500:1187; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 7500:1187; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$119))) := '.dax'; { 7500:1197 }
  FUN_0802_0716(@local_8, UNK_unaff_SS, @local_4, UNK_unaff_SS, MakeWord(UNK_extraout_AH_02, param_2), puVar8, uVar5, puVar9, uVar10); { 7500:11AA }
  if (local_4 <> 0) then begin { 7500:11AA; region anchor, exact origin unknown }
    local_a := 0; { 7500:11BA }
    uVar7 := GetMem($3F); { 7500:11C1 }
    (Ptr<Word>((iVar2 + 200)))^ := SmallInt(uVar7); { 7500:11C1; region anchor, exact origin unknown }
    (Ptr<Word>((iVar2 + $CA)))^ := SmallInt((LongWord(uVar7) shr $10)); { 7500:11C1; region anchor, exact origin unknown }
    _local_e := MakeLong((Ptr<Word>((iVar2 + $CA)))^, (Ptr<Word>((iVar2 + 200)))^); { 7500:11C1; region anchor, exact origin unknown }
    repeat { 7500:11C1; region anchor, exact origin unknown }
      Move(FarPtr(FarSeg(BPWord(-$6)), (FarOff(BPWord(-$6)) + BPWord(-$8))), FarPtr(FarSeg(BPWord(-$C)), FarOff(BPWord(-$C))), $3F); { 7500:11F9 }
      uVar4 := Word((LongWord(_local_e) shr $10)); { 7500:11F9; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_e) + $2A)))^ := 0; { 7500:11F9; region anchor, exact origin unknown }
      (Ptr<Word>((SmallInt(_local_e) + $2C)))^ := 0; { 7500:11F9; region anchor, exact origin unknown }
      local_a := (local_a + $3F); { 7500:120B }
      if (local_a < local_4) then begin { 7500:120B; region anchor, exact origin unknown }
        uVar7 := GetMem($3F); { 7500:121B }
        uVar4 := Word((LongWord(_local_e) shr $10)); { 7500:121B; region anchor, exact origin unknown }
        iVar2 := SmallInt(_local_e); { 7500:121B; region anchor, exact origin unknown }
        (Ptr<Word>((iVar2 + $2A)))^ := SmallInt(uVar7); { 7500:121B; region anchor, exact origin unknown }
        (Ptr<Word>((iVar2 + $2C)))^ := SmallInt((LongWord(uVar7) shr $10)); { 7500:121B; region anchor, exact origin unknown }
        _local_e := MakeLong((Ptr<Word>((iVar2 + $2C)))^, (Ptr<Word>((iVar2 + $2A)))^); { 7500:121B; region anchor, exact origin unknown }
      end; { 7500:121B; region anchor, exact origin unknown }
    until not ((local_a < local_4)); { 7500:121B; region anchor, exact origin unknown }
    FreeMem(FarPtr(BPWord(-$4), BPWord(-$6)), BPWord(-$2)); { 7500:124D }
  end; { 7500:124D; region anchor, exact origin unknown }
  g_557C := 0; { 7500:1252 }
  FUN_0899_0104(); { 7500:1257 }
  Exit; { 7500:125F }
end;
```

### ov17:1262 CreateSummonedMonster (conf M)

Original `ov17_1262`. Params (ABI order): param_1: Byte.
BP access inventory (hex offset:byte widths): -12:2, -10:2, -F:1, -A:1, -9:1, -8:2, -6:2, +6:1.
Locals/SSA temporaries: iVar1: SmallInt; uVar2: Byte; uVar3: Word; cVar4: ShortInt; extraout_AH: Byte; unaff_SS: Word; uStack_12: Word; uStack_10: Byte; local_c: ShortInt; local_b: Byte; local_a: LongWord.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.GetMem, ov17_0EC4, System.RandomWord, stub_ov24_e8, ov17_1446, ov17_0482.

Monster setup with random portrait and class-dependent work. Evidence: decode/listings/ov17.lst at 7500:1262, paired .c.

```pascal
procedure ov17_1262(param_1: Byte);
begin
  if ((Ptr<Word>((SmallInt(g_49D6) + $67C)))^ < 8) then begin { 7500:1262; region anchor, exact origin unknown }
    local_a := GetMem($11D); { 7500:127B }
    ov17_0EC4(local_a, param_1); { 7500:1291 }
    iVar1 := SmallInt(local_a); { 7500:1291; region anchor, exact origin unknown }
    uStack_12 := ExtractBytes(local_a, 2, 2); { 7500:1291; region anchor, exact origin unknown }
    uVar2 := Random($100); { 7500:12A1 }
    (Ptr<Byte>((iVar1 + $AB)))^ := uVar2; { 7500:12A1; region anchor, exact origin unknown }
    local_b := 0; { 7500:12AE }
    local_c := $0; { 7500:12B2 }
    while true do begin { 7500:12B2; region anchor, exact origin unknown }
      uVar3 := Word(local_c); { 7500:12B2; region anchor, exact origin unknown }
      if ($0 < (Ptr<ShortInt>(((iVar1 + uVar3) + $96)))^) then begin { 7500:12B2; region anchor, exact origin unknown }
        local_b := (local_b + 1); { 7500:12CC }
        uVar3 := Word(local_b); { 7500:12CC; region anchor, exact origin unknown }
        (Ptr<ShortInt>(((SmallInt(@uStack_12) + uVar3) + 1)))^ := local_c; { 7500:12CC; region anchor, exact origin unknown }
      end; { 7500:12CC; region anchor, exact origin unknown }
      uVar2 := Byte((uVar3 shr 8)); { 7500:12CC; region anchor, exact origin unknown }
      if (local_c = $6) then begin { 7500:12CC; region anchor, exact origin unknown }
        Break; { 7500:12CC; region anchor, exact origin unknown }
      end; { 7500:12CC; region anchor, exact origin unknown }
      local_c := (local_c + $1); { 7500:12B8 }
    end; { 7500:12B8; region anchor, exact origin unknown }
    if (local_b = 0) then begin { 7500:12B8; region anchor, exact origin unknown }
      local_b := 1; { 7500:12E8 }
      uVar2 := 0; { 7500:12E8; region anchor, exact origin unknown }
      uStack_10 := 2; { 7500:12E8; region anchor, exact origin unknown }
    end; { 7500:12E8; region anchor, exact origin unknown }
    local_b := stub_ov24_e8(MakeWord(uVar2, local_b), MakeWord(uVar2, 1)); { 7500:12FE }
    cVar4 := (Ptr<ShortInt>(((SmallInt(@uStack_12) + local_b) + 1)))^; { 7500:12FE; region anchor, exact origin unknown }
    if (cVar4 = $0) then begin { 7500:12FE; region anchor, exact origin unknown }
      uVar3 := stub_ov24_e8(5, 1); { 7500:131A }
      cVar4 := ((Ptr<ShortInt>((iVar1 + $9E)))^ shr 7); { 7500:131A; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar1 + $BC)))^ := (Ptr<Byte>(((((Ptr<ShortInt>((iVar1 + $9E)))^ * 5) + (uVar3 and $FF)) + $8D7)))^; { 7500:131A; region anchor, exact origin unknown }
    end else begin { 7500:131A; region anchor, exact origin unknown }
      if (cVar4 = $5) then begin { 7500:131A; region anchor, exact origin unknown }
        uVar3 := stub_ov24_e8(5, 1); { 7500:1351 }
        cVar4 := ((Ptr<ShortInt>((iVar1 + $9E)))^ shr 7); { 7500:1351; region anchor, exact origin unknown }
        (Ptr<Byte>((iVar1 + $BC)))^ := (Ptr<Byte>(((((Ptr<ShortInt>((iVar1 + $9E)))^ * 5) + (uVar3 and $FF)) + $8EB)))^; { 7500:1351; region anchor, exact origin unknown }
      end else begin { 7500:1351; region anchor, exact origin unknown }
        if (cVar4 = $6) then begin { 7500:1351; region anchor, exact origin unknown }
          uVar3 := stub_ov24_e8(5, 1); { 7500:1387 }
          cVar4 := ((Ptr<ShortInt>((iVar1 + $9E)))^ shr 7); { 7500:1387; region anchor, exact origin unknown }
          (Ptr<Byte>((iVar1 + $BC)))^ := (Ptr<Byte>(((((Ptr<ShortInt>((iVar1 + $9E)))^ * 5) + (uVar3 and $FF)) + $8F5)))^; { 7500:1387; region anchor, exact origin unknown }
        end else begin { 7500:1387; region anchor, exact origin unknown }
          uVar3 := stub_ov24_e8(5, 1); { 7500:13B9 }
          cVar4 := ((Ptr<ShortInt>((iVar1 + $9E)))^ shr 7); { 7500:13B9; region anchor, exact origin unknown }
          (Ptr<Byte>((iVar1 + $BC)))^ := (Ptr<Byte>(((((Ptr<ShortInt>((iVar1 + $9E)))^ * 5) + (uVar3 and $FF)) + $8E1)))^; { 7500:13B9; region anchor, exact origin unknown }
        end; { 7500:13B9; region anchor, exact origin unknown }
      end; { 7500:13B9; region anchor, exact origin unknown }
    end; { 7500:13B9; region anchor, exact origin unknown }
    uVar3 := stub_ov24_e8(MakeWord(cVar4, 8), MakeWord(cVar4, 1)); { 7500:13E9 }
    (Ptr<Byte>((iVar1 + $BB)))^ := (Ptr<Byte>(((((Ptr<ShortInt>((iVar1 + $9E)))^ * 8) + (uVar3 and $FF)) + $8C7)))^; { 7500:13E9; region anchor, exact origin unknown }
    ov17_1446(local_a); { 7500:1416 }
    ov17_0482(MakeWord(UNK_extraout_AH, 1)); { 7500:141D }
  end; { 7500:141D; region anchor, exact origin unknown }
  Exit; { 7500:1423 }
end;
```

### ov17:1446 AppendPartyMember (conf M)

Original `ov17_1446`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -10:2, -E:2, -C:1/2, -4:2, -2:2, +6:2, +8:2.
Locals/SSA temporaries: puVar1: ^Word; piVar2: ^SmallInt; uVar3: Word; iVar4: SmallInt; uVar5: Word; uVar6: Word; unaff_SS: Word; bVar7: Boolean; local_e: array[0..8-1] of ShortInt; local_6: Word; uStack_4: Word.
Callers: ov17_1262,ov17_1602.
Callees (listing): System.FillChar, System.@SetIn, stub_ov23_e1.

Appends through character +104; assigns unused slot 0..7 at +BF; increments VM region1+67C. Evidence: decode/listings/ov17.lst at 7500:1446, paired .c.

```pascal
procedure ov17_1446(param_1: LongWord);
begin
  uVar5 := Word((LongWord(param_1) shr $10)); { 7500:1446; region anchor, exact origin unknown }
  uVar3 := Word(param_1); { 7500:1446; region anchor, exact origin unknown }
  (Ptr<Byte>((uVar3 + $BF)))^ := $FF; { 7500:1446; region anchor, exact origin unknown }
  if ((g_5D96 = 0) and then (g_5D98 = 0)) then begin { 7500:1446; region anchor, exact origin unknown }
    g_5D92 := param_1; { 7500:1471 }
    g_5D96 := uVar3; { 7500:1464 }
    g_5D98 := uVar5; { 7500:1467 }
  end else begin { 7500:1467; region anchor, exact origin unknown }
    _local_6 := MakeLong(g_5D98, g_5D96); { 7500:1467; region anchor, exact origin unknown }
    while Seq(uVar6 := Word((LongWord(_local_6) shr $10)), iVar4 := SmallInt(_local_6), (((Ptr<SmallInt>((iVar4 + $104)))^ <> 0) or else ((Ptr<SmallInt>((iVar4 + $106)))^ <> 0))) do begin { 7500:1467; region anchor, exact origin unknown }
      _local_6 := MakeLong((Ptr<Word>((iVar4 + $106)))^, (Ptr<Word>((iVar4 + $104)))^); { 7500:1467; region anchor, exact origin unknown }
    end; { 7500:1467; region anchor, exact origin unknown }
    (Ptr<Word>((iVar4 + $104)))^ := uVar3; { 7500:1467; region anchor, exact origin unknown }
    (Ptr<Word>((iVar4 + $106)))^ := uVar5; { 7500:1467; region anchor, exact origin unknown }
  end; { 7500:1467; region anchor, exact origin unknown }
  FillChar(FarPtr(SS, BPAddr(-$C)), $8, LoByte(MakeWord(HiByte($8), $0))); { 7500:14CA }
  local_6 := g_5D96; { 7500:14D6 }
  uStack_4 := g_5D98; { 7500:14D6; region anchor, exact origin unknown }
  while true do begin { 7500:14D6; region anchor, exact origin unknown }
    bVar7 := ((local_6 or uStack_4) = 0); { 7500:14D6; region anchor, exact origin unknown }
    if bVar7 then begin { 7500:14D6; region anchor, exact origin unknown }
      Break; { 7500:14D6; region anchor, exact origin unknown }
    end; { 7500:14D6; region anchor, exact origin unknown }
    (MakeWord(HiByte((BPWord(-$4) or BPWord(-$2))), MemByte(FarPtr(FarSeg(BPWord(-$4)), FarOff(BPWord(-$4)) + $BF))) in PackedSet(FarPtr($7500, $1426))); { 7500:14F2 }
    if (not bVar7) then begin { 7500:14F2; region anchor, exact origin unknown }
      local_e[(Ptr<Byte>((local_6 + $BF)))^] := $1; { 7500:14F2; region anchor, exact origin unknown }
    end; { 7500:14F2; region anchor, exact origin unknown }
    puVar1 := Ptr<Word>((local_6 + $106)); { 7500:14F2; region anchor, exact origin unknown }
    local_6 := (Ptr<Word>((local_6 + $104)))^; { 7500:1516 }
    uStack_4 := (puVar1)^; { 7500:1516; region anchor, exact origin unknown }
  end; { 7500:1516; region anchor, exact origin unknown }
  g_5D92 := param_1; { 7500:1524 }
  (Ptr<Byte>((uVar3 + $BF)))^ := 0; { 7500:1524; region anchor, exact origin unknown }
  while (((Ptr<Byte>((uVar3 + $BF)))^ < 8) and then (local_e[(Ptr<Byte>((uVar3 + $BF)))^] <> $0)) do begin { 7500:1524; region anchor, exact origin unknown }
    (Ptr<ShortInt>((uVar3 + $BF)))^ := ((Ptr<ShortInt>((uVar3 + $BF)))^ + $1); { 7500:1524; region anchor, exact origin unknown }
  end; { 7500:1524; region anchor, exact origin unknown }
  piVar2 := Ptr<SmallInt>((SmallInt(g_49D6) + $67C)); { 7500:1524; region anchor, exact origin unknown }
  (piVar2)^ := ((piVar2)^ + 1); { 7500:1524; region anchor, exact origin unknown }
  stub_ov23_e1(uVar3, uVar5); { 7500:1574 }
  Exit; { 7500:157C }
end;
```

### ov17:1602 LoadGame (conf M)

Original `ov17_1602`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -611:2, -513:2, -511:2, -414:2, -413:2, -411:2, -314:2, -313:2, -312:2, -311:2, -227:2, -223:2, -216:2, -214:2, -213:2, -212:1, -211:1/2, -1FC:2, -1FB:1, -1FA:1, -1F9:1/2, -1F8:2, -1F6:2, -1CD:2, -1CB:2, -1C9:1, -1C8:2, -171:2, -148:2.
Locals/SSA temporaries: puVar1: ^Word; cVar2: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; uVar3: Word; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; uVar4: Word; extraout_AH_06: Byte; extraout_AH_07: Byte; uVar5: Word; bVar6: Byte; iVar7: SmallInt; uVar8: Word; unaff_SS: Word; uVar9: Byte; puVar10: ^Byte; uVar11: Word; puVar12: ^Byte; puVar13: ^Byte; puVar14: ^Byte; uVar15: Word; uVar16: Word; local_613: array[0..254-1] of Byte; local_515: array[0..2-1] of Byte; local_513: array[0..253-1] of Byte; local_416: Byte; local_415: array[0..2-1] of Byte; local_413: array[0..253-1] of Byte; local_316: Byte; local_315: Byte; local_314: Byte; local_313: array[0..234-1] of Byte; local_229: array[0..4-1] of Byte; local_225: array[0..13-1] of Byte; local_218: array[0..2-1] of Byte; local_216: Byte; local_215: Byte; local_214: Byte; local_213: array[0..21-1] of ShortInt; local_1fe: Byte; local_1fd: ShortInt; local_1fc: Byte; local_1fb: Byte; local_1fa: array[0..2-1] of Byte; local_1f8: array[0..41-1] of Byte; local_1cf: LongWord; local_1cb: Byte; local_1ca: array[0..87-1] of Byte; auStack_173: array[0..41-1] of Byte; local_14a: array[0..328-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_7500_02ae, System.@StrCopy, System.@StrAppend, System.@CharToStr, FUN_0802_02eb, System.@StrAssign, stub_ov25_e2, System.@SetIn, FUN_0802_025d, stub_ov25_e3, FUN_0709_0626, System.BlockRead, System.CloseFile, FUN_0802_0356, FUN_0802_0425, System.GetMem, ov17_0AEC, ov17_1446, System.AssignFile, System.Erase, ov17_0482, stub_ov29_e7, stub_ov32_e4, stub_ov29_e6, stub_ov18_e2, FUN_0899_0104.

Slots A..J; state blocks 1+800+800+400+1E00+5+1+1+1+328 bytes = 13137 bytes; member sidecars restored. Evidence: decode/listings/ov17.lst at 7500:1602, paired .c.

```pascal
procedure ov17_1602();
begin
  FUN_7500_02ae(); { 7500:160A }
  local_213[0] := $0; { 7500:160A; region anchor, exact origin unknown }
  local_1fd := $41; { 7500:1612 }
  while true do begin { 7500:1612; region anchor, exact origin unknown }
    puVar12 := local_313; { 7500:1612; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:1612; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr($0C7C, $537A)); { 7500:1628 }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + 'savgam'; { 7500:1632 }
    puVar14 := local_413; { 7500:1632; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7500:1632; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH, local_1fd))); { 7500:1642 }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + PString(FarPtr(SS, BPAddr(-$411))); { 7500:1647 }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + '.dat'; { 7500:1651 }
    uVar8 := $802; { 7500:1651; region anchor, exact origin unknown }
    cVar2 := FUN_0802_02eb(puVar12, uVar3); { 7500:1656 }
    if (cVar2 <> $0) then begin { 7500:1656; region anchor, exact origin unknown }
      puVar12 := local_613; { 7500:1656; region anchor, exact origin unknown }
      uVar3 := UNK_unaff_SS; { 7500:1656; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$611))) := PString(FarPtr(SS, BPAddr(-$211))); { 7500:166B }
      puVar14 := local_513; { 7500:166B; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7500:166B; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_00, local_1fd))); { 7500:167B }
      PString(FarPtr(SS, BPAddr(-$611))) := PString(FarPtr(SS, BPAddr(-$611))) + PString(FarPtr(SS, BPAddr(-$511))); { 7500:1680 }
      PString(FarPtr(SS, BPAddr(-$611))) := PString(FarPtr(SS, BPAddr(-$611))) + ' '; { 7500:168A }
      uVar8 := $AF8; { 7500:168A; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$211))) := Copy(PString(FarPtr(SS, BPAddr(-$611))), 1, $14); { 7500:1699 }
    end; { 7500:1699; region anchor, exact origin unknown }
    if (local_1fd = $4A) then begin { 7500:1699; region anchor, exact origin unknown }
      Break; { 7500:1699; region anchor, exact origin unknown }
    end; { 7500:1699; region anchor, exact origin unknown }
    local_1fd := (local_1fd + $1); { 7500:16E2 }
  end; { 7500:16E2; region anchor, exact origin unknown }
  if (local_213[0] = $0) then begin { 7500:16E2; region anchor, exact origin unknown }
    Exit; { 7500:1CC4 }
  end; { 7500:16E2; region anchor, exact origin unknown }
  repeat { 7500:16E2; region anchor, exact origin unknown }
    uVar9 := 0; { 7500:16E2; region anchor, exact origin unknown }
    puVar12 := local_225; { 7500:16E2; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:16E2; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$223))) := 'Load Which Game: '; { 7500:16BD }
    uVar3 := stub_ov25_e2(@local_1fe, UNK_unaff_SS, (Word(UNK_extraout_AH_01) shl 8), (Word(UNK_extraout_AH_01) shl 8), MakeWord(UNK_extraout_AH_01, $F), MakeWord(UNK_extraout_AH_01, 10), MakeWord(UNK_extraout_AH_01, $D), local_213, UNK_unaff_SS, puVar12, uVar3); { 7500:16DD }
    local_1fd := ShortInt(uVar3); { 7500:1619 }
    uVar8 := $AF8; { 7500:1619; region anchor, exact origin unknown }
    (uVar3 in PackedSet(FarPtr($3C5, $159F))); { 7500:16F0 }
    if (not Boolean(uVar9)) then begin { 7500:16F0; region anchor, exact origin unknown }
      puVar12 := local_313; { 7500:16F0; region anchor, exact origin unknown }
      uVar3 := UNK_unaff_SS; { 7500:16F0; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr($0C7C, $537A)); { 7500:1702 }
      PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + 'savgam'; { 7500:170C }
      puVar14 := local_413; { 7500:170C; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7500:170C; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_02, local_1fd))); { 7500:171C }
      PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + PString(FarPtr(SS, BPAddr(-$411))); { 7500:1721 }
      PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + '.dat'; { 7500:172B }
      uVar8 := $802; { 7500:172B; region anchor, exact origin unknown }
      cVar2 := FUN_0802_02eb(puVar12, uVar3); { 7500:1730 }
      if (cVar2 <> $0) then begin { 7500:1730; region anchor, exact origin unknown }
        Break; { 7500:1730; region anchor, exact origin unknown }
      end; { 7500:1730; region anchor, exact origin unknown }
    end; { 7500:1730; region anchor, exact origin unknown }
  until not ((local_1fd <> $0)); { 7500:1730; region anchor, exact origin unknown }
  if (local_1fd <> $0) then begin { 7500:1730; region anchor, exact origin unknown }
    puVar12 := local_313; { 7500:1730; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:1730; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr($0C7C, $537A)); { 7500:1758 }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + 'savgam'; { 7500:1762 }
    puVar14 := local_413; { 7500:1762; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7500:1762; region anchor, exact origin unknown }
    PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_03, local_1fd))); { 7500:1772 }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + PString(FarPtr(SS, BPAddr(-$411))); { 7500:1777 }
    PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + '.dat'; { 7500:1781 }
    puVar14 := local_513; { 7500:1781; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7500:1781; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$511))) := 'Put save disk in '; { 7500:1791 }
    PString(FarPtr(SS, BPAddr(-$511))) := PString(FarPtr(SS, BPAddr(-$511))) + PString(FarPtr($0C7C, $537A)); { 7500:179B }
    local_1fc := FUN_0802_025d(local_1ca, UNK_unaff_SS, MakeWord(UNK_extraout_AH_04, 1), puVar14, uVar8, puVar12, uVar3); { 7500:17A9 }
    stub_ov25_e3(); { 7500:17B2 }
    iVar7 := (Word(UNK_extraout_AH_05) shl 8); { 7500:17B2; region anchor, exact origin unknown }
    uVar3 := MakeWord(UNK_extraout_AH_05, $18); { 7500:17B2; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_05, 10); { 7500:17B2; region anchor, exact origin unknown }
    puVar12 := local_229; { 7500:17B2; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 7500:17B2; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$227))) := 'Loading...Please Wait'; { 7500:17CB }
    FUN_0709_0626(puVar12, uVar8, uVar4, uVar3, iVar7); { 7500:17D0 }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr($C7C, Ptr<Byte>(@g_5376)), 1, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:17EA }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr(SmallInt((LongWord(g_49D2) shr $10)), SmallInt(g_49D2)), $800, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:1805 }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr(SmallInt((LongWord(g_49D6) shr $10)), SmallInt(g_49D6)), $800, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:1820 }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr(SmallInt((LongWord(g_49DA) shr $10)), SmallInt(g_49DA)), $400, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:183B }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr(SmallInt((LongWord(g_49DE) shr $10)), SmallInt(g_49DE)), $1E00, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:1856 }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr($C7C, Ptr<Byte>(@g_6AAD)), 5, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:1870 }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr($C7C, Ptr<Byte>(@g_49FA)), 1, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:188A }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr($C7C, Ptr<Byte>(@g_49F3)), 1, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:18A4 }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr(UNK_unaff_SS, @local_1fb), 1, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:18BF }
    BlockRead(FarPtr(UNK_unaff_SS, local_1ca), FarPtr(UNK_unaff_SS, local_14a), $148, FarPtr(UNK_unaff_SS, local_1fa)); { 7500:18DA }
    uVar3 := $AF8; { 7500:18DA; region anchor, exact origin unknown }
    Close(FarPtr(SS, BPAddr(-$1C8))); { 7500:18E5 }
    uVar8 := Word((LongWord(g_49D2) shr $10)); { 7500:18E5; region anchor, exact origin unknown }
    iVar7 := SmallInt(g_49D2); { 7500:18E5; region anchor, exact origin unknown }
    g_49F6 := Byte(((Ptr<Word>((iVar7 + $1FE)))^ shr 1)); { 7500:18F5 }
    g_49F5 := (Byte((Ptr<Word>((iVar7 + $1FE)))^) and 1); { 7500:1904 }
    g_49E2 := (Ptr<Byte>((iVar7 + $1F8)))^; { 7500:1910 }
    (Ptr<Word>((SmallInt(g_49D6) + $67C)))^ := 0; { 7500:1910; region anchor, exact origin unknown }
    local_214 := local_1fb; { 7500:1922 }
    if (local_1fb <> 0) then begin { 7500:1922; region anchor, exact origin unknown }
      local_1cb := 1; { 7500:1931 }
      while true do begin { 7500:1931; region anchor, exact origin unknown }
        puVar14 := @local_416; { 7500:1931; region anchor, exact origin unknown }
        puVar13 := @local_316; { 7500:1931; region anchor, exact origin unknown }
        puVar12 := (auStack_173 + (Word(local_1cb) * $29)); { 7500:1931; region anchor, exact origin unknown }
        puVar10 := @local_216; { 7500:1931; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 7500:1931; region anchor, exact origin unknown }
        uVar4 := UNK_unaff_SS; { 7500:1931; region anchor, exact origin unknown }
        uVar15 := UNK_unaff_SS; { 7500:1931; region anchor, exact origin unknown }
        uVar16 := UNK_unaff_SS; { 7500:1931; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$214))) := '.'; { 7500:1965 }
        FUN_0802_0356(puVar10, uVar8, puVar12, uVar4); { 7500:196A }
        FUN_0802_0425(puVar13, uVar15); { 7500:196F }
        PString(FarPtr(SS, BPAddr(-$1F6))) := Copy(PString(FarPtr(SS, BPAddr(-$414))), 1, $28); { 7500:197E }
        puVar12 := @local_314; { 7500:197E; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 7500:197E; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$312))) := PString(FarPtr($0C7C, $537A)); { 7500:198E }
        PString(FarPtr(SS, BPAddr(-$312))) := PString(FarPtr(SS, BPAddr(-$312))) + PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1999 }
        PString(FarPtr(SS, BPAddr(-$312))) := PString(FarPtr(SS, BPAddr(-$312))) + '.sav'; { 7500:19A3 }
        uVar3 := $802; { 7500:19A3; region anchor, exact origin unknown }
        cVar2 := FUN_0802_02eb(puVar12, uVar8); { 7500:19A8 }
        if (cVar2 <> $0) then begin { 7500:19A8; region anchor, exact origin unknown }
          uVar3 := $AF8; { 7500:19A8; region anchor, exact origin unknown }
          local_1cf := GetMem($11D); { 7500:19B5 }
          ov17_0AEC(1, 1, local_1cf, local_1f8, UNK_unaff_SS); { 7500:19D7 }
          ov17_1446(Word(local_1cf), ExtractBytes(local_1cf, 2, 2)); { 7500:19E3 }
          FUN_7500_02ae(); { 7500:19E7 }
        end; { 7500:19E7; region anchor, exact origin unknown }
        if (local_1cb = local_214) then begin { 7500:19E7; region anchor, exact origin unknown }
          Break; { 7500:19E7; region anchor, exact origin unknown }
        end; { 7500:19E7; region anchor, exact origin unknown }
        local_1cb := (local_1cb + 1); { 7500:1937 }
      end; { 7500:1937; region anchor, exact origin unknown }
    end; { 7500:1937; region anchor, exact origin unknown }
    ExtractBytes(local_1cf, 2, 2) := g_5D98; { 7500:1937; region anchor, exact origin unknown }
    ExtractBytes(local_1cf, 0, 2) := g_5D96; { 7500:1937; region anchor, exact origin unknown }
    while ((Word(local_1cf) <> 0) or else (ExtractBytes(local_1cf, 2, 2) <> 0)) do begin { 7500:1937; region anchor, exact origin unknown }
      puVar12 := local_515; { 7500:1937; region anchor, exact origin unknown }
      uVar15 := UNK_unaff_SS; { 7500:1937; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$513))) := PString(FarPtr($0C7C, $537A)); { 7500:1A1E }
      puVar14 := local_415; { 7500:1A1E; region anchor, exact origin unknown }
      puVar13 := @local_315; { 7500:1A1E; region anchor, exact origin unknown }
      puVar10 := @local_215; { 7500:1A1E; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7500:1A1E; region anchor, exact origin unknown }
      uVar5 := Word(local_1cf); { 7500:1A1E; region anchor, exact origin unknown }
      uVar11 := ExtractBytes(local_1cf, 2, 2); { 7500:1A1E; region anchor, exact origin unknown }
      uVar3 := UNK_unaff_SS; { 7500:1A1E; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:1A1E; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$213))) := '.'; { 7500:1A40 }
      FUN_0802_0356(puVar10, uVar8, uVar5, uVar11); { 7500:1A45 }
      FUN_0802_0425(puVar13, uVar3); { 7500:1A4A }
      PString(FarPtr(SS, BPAddr(-$513))) := PString(FarPtr(SS, BPAddr(-$513))) + PString(FarPtr(SS, BPAddr(-$413))); { 7500:1A4F }
      PString(FarPtr(SS, BPAddr(-$1F6))) := Copy(PString(FarPtr(SS, BPAddr(-$513))), 1, $28); { 7500:1A5E }
      puVar12 := local_313; { 7500:1A5E; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 7500:1A5E; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1A6F }
      PString(FarPtr(SS, BPAddr(-$311))) := PString(FarPtr(SS, BPAddr(-$311))) + '.cha'; { 7500:1A79 }
      uVar3 := $802; { 7500:1A79; region anchor, exact origin unknown }
      cVar2 := FUN_0802_02eb(puVar12, uVar8); { 7500:1A7E }
      if (cVar2 <> $0) then begin { 7500:1A7E; region anchor, exact origin unknown }
        puVar12 := local_1ca; { 7500:1A7E; region anchor, exact origin unknown }
        puVar14 := local_413; { 7500:1A7E; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 7500:1A7E; region anchor, exact origin unknown }
        uVar3 := UNK_unaff_SS; { 7500:1A7E; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$411))) := PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1A9C }
        PString(FarPtr(SS, BPAddr(-$411))) := PString(FarPtr(SS, BPAddr(-$411))) + '.cha'; { 7500:1AA6 }
        Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$411)))); { 7500:1AAB }
        Erase(BPAddr(-$1C8), SS); { 7500:1AB6 }
        puVar12 := local_413; { 7500:1AB6; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 7500:1AB6; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$411))) := PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1AC7 }
        PString(FarPtr(SS, BPAddr(-$411))) := PString(FarPtr(SS, BPAddr(-$411))) + '.itm'; { 7500:1AD1 }
        cVar2 := FUN_0802_02eb(puVar12, uVar8); { 7500:1AD6 }
        if (cVar2 <> $0) then begin { 7500:1AD6; region anchor, exact origin unknown }
          puVar12 := local_1ca; { 7500:1AD6; region anchor, exact origin unknown }
          puVar14 := local_513; { 7500:1AD6; region anchor, exact origin unknown }
          uVar8 := UNK_unaff_SS; { 7500:1AD6; region anchor, exact origin unknown }
          uVar3 := UNK_unaff_SS; { 7500:1AD6; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$511))) := PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1AF1 }
          PString(FarPtr(SS, BPAddr(-$511))) := PString(FarPtr(SS, BPAddr(-$511))) + '.itm'; { 7500:1AFB }
          Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$511)))); { 7500:1B00 }
          Erase(BPAddr(-$1C8), SS); { 7500:1B0B }
        end; { 7500:1B0B; region anchor, exact origin unknown }
        puVar12 := local_413; { 7500:1B0B; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 7500:1B0B; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$411))) := PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1B1C }
        PString(FarPtr(SS, BPAddr(-$411))) := PString(FarPtr(SS, BPAddr(-$411))) + '.spc'; { 7500:1B26 }
        uVar3 := $802; { 7500:1B26; region anchor, exact origin unknown }
        cVar2 := FUN_0802_02eb(puVar12, uVar8); { 7500:1B2B }
        if (cVar2 <> $0) then begin { 7500:1B2B; region anchor, exact origin unknown }
          puVar12 := local_1ca; { 7500:1B2B; region anchor, exact origin unknown }
          puVar14 := local_513; { 7500:1B2B; region anchor, exact origin unknown }
          uVar8 := UNK_unaff_SS; { 7500:1B2B; region anchor, exact origin unknown }
          uVar3 := UNK_unaff_SS; { 7500:1B2B; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$511))) := PString(FarPtr(SS, BPAddr(-$1F6))); { 7500:1B46 }
          PString(FarPtr(SS, BPAddr(-$511))) := PString(FarPtr(SS, BPAddr(-$511))) + '.spc'; { 7500:1B50 }
          Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$511)))); { 7500:1B55 }
          uVar3 := $AF8; { 7500:1B55; region anchor, exact origin unknown }
          Erase(BPAddr(-$1C8), SS); { 7500:1B60 }
        end; { 7500:1B60; region anchor, exact origin unknown }
      end; { 7500:1B60; region anchor, exact origin unknown }
      puVar1 := Ptr<Word>((Word(local_1cf) + $104)); { 7500:1B60; region anchor, exact origin unknown }
      ExtractBytes(local_1cf, 2, 2) := (Ptr<Word>((Word(local_1cf) + $106)))^; { 7500:1B60; region anchor, exact origin unknown }
      ExtractBytes(local_1cf, 0, 2) := (puVar1)^; { 7500:1B60; region anchor, exact origin unknown }
    end; { 7500:1B60; region anchor, exact origin unknown }
    g_5D94 := g_5D98; { 7500:1B88 }
    g_5D92 := g_5D96; { 7500:1B85 }
    while ((g_5D92 or g_5D94) <> 0) do begin { 7500:1B85; region anchor, exact origin unknown }
      ov17_0482(MakeWord(ShortInt(((g_5D92 or g_5D94) shr 8)), 1)); { 7500:1B99 }
      puVar1 := Ptr<Word>((g_5D92 + $104)); { 7500:1B99; region anchor, exact origin unknown }
      g_5D94 := (Ptr<Word>((g_5D92 + $106)))^; { 7500:1BAD }
      g_5D92 := (puVar1)^; { 7500:1BAA }
    end; { 7500:1BAA; region anchor, exact origin unknown }
    g_5D92 := MakeLong(g_5D98, g_5D96); { 7500:1BBA }
    g_5376 := (Ptr<Byte>((SmallInt(g_49D6) + $624)))^; { 7500:1BCA }
    if (g_49FA < 2) then begin { 7500:1BCA; region anchor, exact origin unknown }
      uVar3 := $3D5; { 7500:1BCA; region anchor, exact origin unknown }
      stub_ov29_e7((Ptr<Byte>((SmallInt(g_49D2) + $18A)))^); { 7500:1BDE }
    end; { 7500:1BDE; region anchor, exact origin unknown }
    if (g_49FA < 2) then begin { 7500:1BDE; region anchor, exact origin unknown }
      local_1cb := 1; { 7500:1C08 }
      while true do begin { 7500:1C08; region anchor, exact origin unknown }
        (Ptr<Word>((Ptr<Byte>(@g_6AAE) + (Word(local_1cb) * 4))))^ := (Ptr<Word>(((SmallInt(g_49D2) + ((local_1cb + $4AF9) * 2)) + $6E00)))^; { 7500:1C08; region anchor, exact origin unknown }
        (Ptr<Word>((Ptr<Byte>(@g_6AB0) + (Word(local_1cb) * 4))))^ := (Ptr<Word>(((SmallInt(g_49D2) + ((local_1cb + $4AFC) * 2)) + $6E00)))^; { 7500:1C08; region anchor, exact origin unknown }
        uVar5 := Word(local_1cb); { 7500:1C08; region anchor, exact origin unknown }
        if ((-1) < (Ptr<SmallInt>((Ptr<Byte>(@g_6AAE) + (uVar5 * 4))))^) then begin { 7500:1C08; region anchor, exact origin unknown }
          uVar5 := stub_ov29_e6(Ptr<Byte>(@g_6AB0)[(Word(local_1cb) * 4)], Ptr<Byte>(@g_6AAE)[(Word(local_1cb) * 4)]); { 7500:1C94 }
        end; { 7500:1C94; region anchor, exact origin unknown }
        bVar6 := Byte((uVar5 shr 8)); { 7500:1C94; region anchor, exact origin unknown }
        if (local_1cb = 3) then begin { 7500:1C94; region anchor, exact origin unknown }
          Break; { 7500:1C94; region anchor, exact origin unknown }
        end; { 7500:1C94; region anchor, exact origin unknown }
        local_1cb := (local_1cb + 1); { 7500:1C0F }
      end; { 7500:1C0F; region anchor, exact origin unknown }
    end else begin { 7500:1C0F; region anchor, exact origin unknown }
      puVar12 := local_218; { 7500:1C0F; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$216))) := 'ICON'; { 7500:1BF5 }
      stub_ov32_e4(MakeWord(UNK_extraout_AH_06, $B), (Word(UNK_extraout_AH_06) shl 8), puVar12, UNK_unaff_SS); { 7500:1C00 }
      bVar6 := UNK_extraout_AH_07; { 7500:1C00; region anchor, exact origin unknown }
    end; { 7500:1C00; region anchor, exact origin unknown }
    if ((Ptr<SmallInt>((SmallInt(g_49D2) + $344)))^ <> 0) then begin { 7500:1C00; region anchor, exact origin unknown }
      stub_ov18_e2((Word(bVar6) shl 8)); { 7500:1CB2 }
    end; { 7500:1CB2; region anchor, exact origin unknown }
    FUN_0899_0104(); { 7500:1CB7 }
    stub_ov25_e3(); { 7500:1CBC }
    Exit; { 7500:1CC4 }
  end; { 7500:1CBC; region anchor, exact origin unknown }
  Exit; { 7500:1CC4 }
end;
```

### ov17:1D58 SaveGame (conf M)

Original `ov17_1D58`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -4FE:2, -3FE:2, -3FC:2, -2FE:2, -2FC:2, -222:2, -211:2, -20E:2, -1FE:2, -1FC:2, -1FA:1, -1F9:2, -1F8:2, -1CF:2, -1CD:2, -1CB:2, -1C9:1/2, -1C8:2, -171:2, -148:2.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; extraout_AH: Byte; iVar3: SmallInt; uVar4: Word; extraout_AH_00: Byte; uVar5: Word; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; uVar6: Word; unaff_SS: Word; uVar7: Byte; puVar8: ^Byte; iVar9: SmallInt; puVar10: ^Byte; puVar11: ^Byte; puVar12: ^Byte; uVar13: Word; local_500: array[0..256-1] of Byte; local_400: array[0..2-1] of Byte; local_3fe: array[0..254-1] of Byte; local_300: array[0..2-1] of Byte; local_2fe: array[0..218-1] of Byte; local_224: array[0..17-1] of Byte; local_213: array[0..3-1] of Byte; local_210: array[0..16-1] of Byte; local_200: array[0..2-1] of Byte; local_1fe: SmallInt; local_1fc: ShortInt; local_1fb: Byte; local_1fa: array[0..41-1] of Byte; local_1d1: array[0..2-1] of Byte; local_1cf: SmallInt; iStack_1cd: SmallInt; local_1cb: Byte; local_1ca: array[0..87-1] of Byte; auStack_173: array[0..41-1] of Byte; local_14a: array[0..328-1] of Byte.
Callers: ov17_22D5.
Callees (listing): System.@StrCopy, stub_ov25_e2, System.@SetIn, FUN_7500_02ae, System.@StrAppend, System.@CharToStr, System.AssignFile, System.RewriteFile, System.IOResult, FUN_0709_0bf5, stub_ov25_e3, FUN_0709_0626, System.BlockWrite, System.@StrLong, System.@StrAssign, System.CloseFile, ov17_069E, FUN_0802_0356, FUN_0802_0425, FUN_0802_02eb, System.Erase.

Writes corresponding state blocks/member sidecars; g_557D success; see SAVES.md. Evidence: decode/listings/ov17.lst at 7500:1D58, paired .c.

```pascal
procedure ov17_1D58();
begin
  uVar6 := $7500; { 7500:1D58; region anchor, exact origin unknown }
  repeat { 7500:1D58; region anchor, exact origin unknown }
    puVar12 := local_210; { 7500:1D58; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 7500:1D58; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$20E))) := 'Save Which Game: '; { 7500:1D6A }
    puVar11 := local_224; { 7500:1D6A; region anchor, exact origin unknown }
    uVar6 := UNK_unaff_SS; { 7500:1D6A; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$222))) := 'A B C D E F G H I J'; { 7500:1D7A }
    iVar3 := (Word(UNK_extraout_AH) * $100); { 7500:1D7A; region anchor, exact origin unknown }
    uVar7 := false; { 7500:1D7A; region anchor, exact origin unknown }
    if (g_49F3 = $2) then begin { 7500:1D7A; region anchor, exact origin unknown }
      iVar3 := (iVar3 + 1); { 7500:1D7A; region anchor, exact origin unknown }
      uVar7 := (iVar3 = 0); { 7500:1D7A; region anchor, exact origin unknown }
    end; { 7500:1D7A; region anchor, exact origin unknown }
    uVar4 := stub_ov25_e2(@local_1fb, UNK_unaff_SS, iVar3, (Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), puVar11, uVar6, puVar12, uVar4); { 7500:1D9C }
    local_1fc := ShortInt(uVar4); { 7500:1DA1 }
    uVar6 := $AF8; { 7500:1DA1; region anchor, exact origin unknown }
    (uVar4 in PackedSet(FarPtr($3C5, (Ptr<ShortInt>($1CE1) + 10)))); { 7500:1DAF }
  until not (Boolean(uVar7)); { 7500:1DAF; region anchor, exact origin unknown }
  if (local_1fc <> $0) then begin { 7500:1DAF; region anchor, exact origin unknown }
    FUN_7500_02ae(); { 7500:1DC1 }
    repeat { 7500:1DC1; region anchor, exact origin unknown }
      puVar12 := local_1ca; { 7500:1DC1; region anchor, exact origin unknown }
      puVar11 := local_2fe; { 7500:1DC1; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:1DC1; region anchor, exact origin unknown }
      uVar5 := UNK_unaff_SS; { 7500:1DC1; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr($0C7C, $537A)); { 7500:1DD5 }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$2FC))) + 'savgam'; { 7500:1DDF }
      puVar10 := local_3fe; { 7500:1DDF; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:1DDF; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_00, local_1fc))); { 7500:1DEF }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$2FC))) + PString(FarPtr(SS, BPAddr(-$3FC))); { 7500:1DF4 }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$2FC))) + '.dat'; { 7500:1DFE }
      Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$2FC)))); { 7500:1E03 }
      Rewrite(FarPtr(SS, BPAddr(-$1C8)), $1); { 7500:1E12 }
      local_1fe := IOResult(); { 7500:1E17 }
      if (local_1fe <> 0) then begin { 7500:1E17; region anchor, exact origin unknown }
        uVar5 := $E; { 7500:1E17; region anchor, exact origin unknown }
        puVar12 := local_3fe; { 7500:1E17; region anchor, exact origin unknown }
        uVar4 := UNK_unaff_SS; { 7500:1E17; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$3FC))) := 'Put save disk in '; { 7500:1E35 }
        puVar11 := local_2fe; { 7500:1E35; region anchor, exact origin unknown }
        uVar6 := UNK_unaff_SS; { 7500:1E35; region anchor, exact origin unknown }
        PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_01, g_537B))); { 7500:1E44 }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + PString(FarPtr(SS, BPAddr(-$2FC))); { 7500:1E49 }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + ':'; { 7500:1E53 }
        FUN_0709_0bf5(puVar12, uVar4, uVar5); { 7500:1E58 }
      end; { 7500:1E58; region anchor, exact origin unknown }
    until not ((local_1fe <> 0)); { 7500:1E58; region anchor, exact origin unknown }
    stub_ov25_e3(); { 7500:1E67 }
    iVar3 := (Word(UNK_extraout_AH_02) shl 8); { 7500:1E67; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH_02, $18); { 7500:1E67; region anchor, exact origin unknown }
    uVar5 := MakeWord(UNK_extraout_AH_02, 10); { 7500:1E67; region anchor, exact origin unknown }
    puVar12 := local_213; { 7500:1E67; region anchor, exact origin unknown }
    uVar6 := UNK_unaff_SS; { 7500:1E67; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$211))) := 'Saving...Please Wait'; { 7500:1E80 }
    FUN_0709_0626(puVar12, uVar6, uVar5, uVar4, iVar3); { 7500:1E85 }
    local_1cb := 1; { 7500:1E8A }
    while true do begin { 7500:1E8A; region anchor, exact origin unknown }
      (Ptr<Word>(((SmallInt(g_49D2) + ((local_1cb + $4AF9) * 2)) + $6E00)))^ := (Ptr<Word>((Ptr<Byte>(@g_6AAE) + (Word(local_1cb) * 4))))^; { 7500:1E8A; region anchor, exact origin unknown }
      (Ptr<Word>(((SmallInt(g_49D2) + ((local_1cb + $4AFC) * 2)) + $6E00)))^ := (Ptr<Word>((Ptr<Byte>(@g_6AB0) + (Word(local_1cb) * 4))))^; { 7500:1E8A; region anchor, exact origin unknown }
      if (local_1cb = 3) then begin { 7500:1E8A; region anchor, exact origin unknown }
        Break; { 7500:1E8A; region anchor, exact origin unknown }
      end; { 7500:1E8A; region anchor, exact origin unknown }
      local_1cb := (local_1cb + 1); { 7500:1E91 }
    end; { 7500:1E91; region anchor, exact origin unknown }
    (Ptr<Word>((SmallInt(g_49D2) + $1F8)))^ := Word(g_49E2); { 7500:1E91; region anchor, exact origin unknown }
    (Ptr<SmallInt>((SmallInt(g_49D2) + $1FE)))^ := ((Word(g_49F6) * 2) + Word(g_49F5)); { 7500:1E91; region anchor, exact origin unknown }
    (Ptr<Word>((SmallInt(g_49D6) + $624)))^ := Word(g_5376); { 7500:1E91; region anchor, exact origin unknown }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr($0C7C, $5376), $1, FarPtr(0, 0)); { 7500:1F30 }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49D2))), FarOff(MemWord(FarPtr($0C7C, $49D2)))), $800, FarPtr(0, 0)); { 7500:1F49 }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49D6))), FarOff(MemWord(FarPtr($0C7C, $49D6)))), $800, FarPtr(0, 0)); { 7500:1F62 }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49DA))), FarOff(MemWord(FarPtr($0C7C, $49DA)))), $400, FarPtr(0, 0)); { 7500:1F7B }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr(FarSeg(MemWord(FarPtr($0C7C, $49DE))), FarOff(MemWord(FarPtr($0C7C, $49DE)))), $1E00, FarPtr(0, 0)); { 7500:1F94 }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr($0C7C, $6AAD), $5, FarPtr(0, 0)); { 7500:1FAC }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr($0C7C, $49FA), $1, FarPtr(0, 0)); { 7500:1FC4 }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr($0C7C, $49F3), $1, FarPtr(0, 0)); { 7500:1FDC }
    local_1cb := 0; { 7500:1FE1 }
    iStack_1cd := g_5D98; { 7500:1FE1; region anchor, exact origin unknown }
    local_1cf := g_5D96; { 7500:1FED }
    while ((local_1cf <> 0) or else (iStack_1cd <> 0)) do begin { 7500:1FED; region anchor, exact origin unknown }
      local_1cb := (local_1cb + 1); { 7500:2002 }
      Str(LongInt(MakeLong(0, MakeWord(0, LoByte(MakeWord(HiByte((BPWord(-$1CD) or BPWord(-$1CB))), BPByte(-$1C9)))))), PString(FarPtr(SS, BPAddr(-$1CF)))); { 7500:201D }
      puVar12 := local_3fe; { 7500:201D; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:201D; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$3FC))) := 'CHRDAT'; { 7500:202D }
      puVar11 := local_2fe; { 7500:202D; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:202D; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_03, local_1fc))); { 7500:203D }
      PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + PString(FarPtr(SS, BPAddr(-$2FC))); { 7500:2042 }
      PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + PString(FarPtr(SS, BPAddr(-$1CF))); { 7500:204D }
      PString(FarPtr(SS, BPAddr(-$171))) := Copy(PString(FarPtr(SS, BPAddr(-$3FC))), 1, $28); { 7500:2069 }
      piVar1 := Ptr<SmallInt>((local_1cf + $104)); { 7500:2069; region anchor, exact origin unknown }
      iStack_1cd := (Ptr<SmallInt>((local_1cf + $106)))^; { 7500:2069; region anchor, exact origin unknown }
      local_1cf := (piVar1)^; { 7500:207C }
    end; { 7500:207C; region anchor, exact origin unknown }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr(SS, BPAddr(-$1C9)), $1, FarPtr(0, 0)); { 7500:209B }
    BlockWrite(FarPtr(SS, BPAddr(-$1C8)), FarPtr(SS, BPAddr(-$148)), $148, FarPtr(0, 0)); { 7500:20B4 }
    Close(FarPtr(SS, BPAddr(-$1C8))); { 7500:20BF }
    iStack_1cd := g_5D98; { 7500:20BF; region anchor, exact origin unknown }
    local_1cb := 0; { 7500:20D3 }
    local_1cf := g_5D96; { 7500:20CB }
    while ((local_1cf <> 0) or else (iStack_1cd <> 0)) do begin { 7500:20CB; region anchor, exact origin unknown }
      local_1cb := (local_1cb + 1); { 7500:20E5 }
      Str(LongInt(MakeLong(0, MakeWord(0, LoByte(MakeWord(HiByte((BPWord(-$1CD) or BPWord(-$1CB))), BPByte(-$1C9)))))), PString(FarPtr(SS, BPAddr(-$1CF)))); { 7500:2100 }
      puVar12 := local_3fe; { 7500:2100; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:2100; region anchor, exact origin unknown }
      iVar3 := local_1cf; { 7500:2100; region anchor, exact origin unknown }
      iVar9 := iStack_1cd; { 7500:2100; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$3FC))) := 'CHRDAT'; { 7500:2118 }
      puVar11 := local_2fe; { 7500:2118; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:2118; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_04, local_1fc))); { 7500:2128 }
      PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + PString(FarPtr(SS, BPAddr(-$2FC))); { 7500:212D }
      PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + PString(FarPtr(SS, BPAddr(-$1CF))); { 7500:2138 }
      ov17_069E(puVar12, uVar4, iVar3, iVar9); { 7500:213E }
      puVar12 := local_500; { 7500:213E; region anchor, exact origin unknown }
      uVar13 := UNK_unaff_SS; { 7500:213E; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$4FE))) := PString(FarPtr($0C7C, $537A)); { 7500:214C }
      puVar11 := local_400; { 7500:214C; region anchor, exact origin unknown }
      puVar10 := local_300; { 7500:214C; region anchor, exact origin unknown }
      puVar8 := local_200; { 7500:214C; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:214C; region anchor, exact origin unknown }
      iVar3 := local_1cf; { 7500:214C; region anchor, exact origin unknown }
      iVar9 := iStack_1cd; { 7500:214C; region anchor, exact origin unknown }
      uVar4 := UNK_unaff_SS; { 7500:214C; region anchor, exact origin unknown }
      uVar5 := UNK_unaff_SS; { 7500:214C; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$1FE))) := '.'; { 7500:216E }
      FUN_0802_0356(puVar8, uVar6, iVar3, iVar9); { 7500:2173 }
      FUN_0802_0425(puVar10, uVar4); { 7500:2178 }
      PString(FarPtr(SS, BPAddr(-$4FE))) := PString(FarPtr(SS, BPAddr(-$4FE))) + PString(FarPtr(SS, BPAddr(-$3FE))); { 7500:217D }
      PString(FarPtr(SS, BPAddr(-$1F8))) := Copy(PString(FarPtr(SS, BPAddr(-$4FE))), 1, $28); { 7500:218C }
      puVar12 := local_2fe; { 7500:218C; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:218C; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$1F8))); { 7500:219D }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$2FC))) + '.cha'; { 7500:21A7 }
      cVar2 := FUN_0802_02eb(puVar12, uVar6); { 7500:21AC }
      if (cVar2 <> $0) then begin { 7500:21AC; region anchor, exact origin unknown }
        puVar12 := local_1ca; { 7500:21AC; region anchor, exact origin unknown }
        puVar11 := local_3fe; { 7500:21AC; region anchor, exact origin unknown }
        uVar6 := UNK_unaff_SS; { 7500:21AC; region anchor, exact origin unknown }
        uVar4 := UNK_unaff_SS; { 7500:21AC; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$1F8))); { 7500:21C7 }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + '.cha'; { 7500:21D1 }
        Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$3FC)))); { 7500:21D6 }
        Erase(BPAddr(-$1C8), SS); { 7500:21E1 }
      end; { 7500:21E1; region anchor, exact origin unknown }
      puVar12 := local_2fe; { 7500:21E1; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:21E1; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$1F8))); { 7500:21F2 }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$2FC))) + '.itm'; { 7500:21FC }
      cVar2 := FUN_0802_02eb(puVar12, uVar6); { 7500:2201 }
      if (cVar2 <> $0) then begin { 7500:2201; region anchor, exact origin unknown }
        puVar12 := local_1ca; { 7500:2201; region anchor, exact origin unknown }
        puVar11 := local_3fe; { 7500:2201; region anchor, exact origin unknown }
        uVar6 := UNK_unaff_SS; { 7500:2201; region anchor, exact origin unknown }
        uVar4 := UNK_unaff_SS; { 7500:2201; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$1F8))); { 7500:221C }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + '.itm'; { 7500:2226 }
        Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$3FC)))); { 7500:222B }
        Erase(BPAddr(-$1C8), SS); { 7500:2236 }
      end; { 7500:2236; region anchor, exact origin unknown }
      puVar12 := local_2fe; { 7500:2236; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 7500:2236; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$1F8))); { 7500:2247 }
      PString(FarPtr(SS, BPAddr(-$2FC))) := PString(FarPtr(SS, BPAddr(-$2FC))) + '.spc'; { 7500:2251 }
      cVar2 := FUN_0802_02eb(puVar12, uVar6); { 7500:2256 }
      if (cVar2 <> $0) then begin { 7500:2256; region anchor, exact origin unknown }
        puVar12 := local_1ca; { 7500:2256; region anchor, exact origin unknown }
        puVar11 := local_3fe; { 7500:2256; region anchor, exact origin unknown }
        uVar6 := UNK_unaff_SS; { 7500:2256; region anchor, exact origin unknown }
        uVar4 := UNK_unaff_SS; { 7500:2256; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$1F8))); { 7500:2271 }
        PString(FarPtr(SS, BPAddr(-$3FC))) := PString(FarPtr(SS, BPAddr(-$3FC))) + '.spc'; { 7500:227B }
        Assign(FarPtr(SS, BPAddr(-$1C8)), PString(FarPtr(SS, BPAddr(-$3FC)))); { 7500:2280 }
        Erase(BPAddr(-$1C8), SS); { 7500:228B }
      end; { 7500:228B; region anchor, exact origin unknown }
      piVar1 := Ptr<SmallInt>((local_1cf + $104)); { 7500:228B; region anchor, exact origin unknown }
      iStack_1cd := (Ptr<SmallInt>((local_1cf + $106)))^; { 7500:228B; region anchor, exact origin unknown }
      local_1cf := (piVar1)^; { 7500:229E }
    end; { 7500:229E; region anchor, exact origin unknown }
    g_557D := 1; { 7500:22A9 }
    stub_ov25_e3(); { 7500:22AE }
  end; { 7500:22AE; region anchor, exact origin unknown }
  Exit; { 7500:22B6 }
end;
```

### ov17:22D5 SaveAndExitPrompt (conf M)

Original `ov17_22D5`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -156:2, -57:2, -56:1/2, -55:1, -54:2, -52:2, -29:2, +6:2.
Locals/SSA temporaries: cVar1: ShortInt; extraout_AH: Byte; unaff_SS: Word; puVar2: ^Byte; uVar3: Word; local_158: array[0..255-1] of Byte; local_59: Byte; local_58: ShortInt; local_57: ShortInt; local_56: array[0..2-1] of Byte; local_54: array[0..41-1] of Byte; local_2b: array[0..41-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrAssign, FUN_0802_02eb, System.@StrLong, System.@StrCopy, System.@StrAppend, stub_ov25_e2, FUN_0802_095d, ov17_1D58, FUN_0899_0000.

Insert disk and S save; backs up one map cell with 0..15 wrapping. Evidence: decode/listings/ov17.lst at 7500:22D5, paired .c.

```pascal
procedure ov17_22D5(param_1: LongWord);
begin
  PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))), 1, $28); { 7500:22EA }
  cVar1 := FUN_0802_02eb(local_2b, UNK_unaff_SS); { 7500:22F4 }
  if (cVar1 = $0) then begin { 7500:22F4; region anchor, exact origin unknown }
    Str(LongInt(MakeLong(0, g_5376)), PString(FarPtr(UNK_unaff_SS, local_56))); { 7500:2315 }
    puVar2 := local_158; { 7500:2315; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:2315; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$156))) := 'Save and exit  Insert disk #'; { 7500:2325 }
    PString(FarPtr(SS, BPAddr(-$156))) := PString(FarPtr(SS, BPAddr(-$156))) + PString(FarPtr(SS, BPAddr(-$54))); { 7500:232F }
    PString(FarPtr(SS, BPAddr(-$52))) := Copy(PString(FarPtr(SS, BPAddr(-$156))), 1, $28); { 7500:233D }
    puVar2 := @local_59; { 7500:233D; region anchor, exact origin unknown }
    uVar3 := UNK_unaff_SS; { 7500:233D; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$57))) := ''; { 7500:234C }
    local_57 := stub_ov25_e2(@local_58, UNK_unaff_SS, (Word(UNK_extraout_AH) shl 8), (Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), local_54, UNK_unaff_SS, puVar2, uVar3); { 7500:236A }
    if ((local_58 = $0) and then (local_57 = $53)) then begin { 7500:236A; region anchor, exact origin unknown }
      g_6AAD := (g_6AAD - Ptr<UnknownValue>(@g_2736)[g_6AAF]); { 7500:2389 }
      if (g_6AAD < $0) then begin { 7500:2389; region anchor, exact origin unknown }
        g_6AAD := $F; { 7500:2394 }
      end; { 7500:2394; region anchor, exact origin unknown }
      if ($F < g_6AAD) then begin { 7500:2394; region anchor, exact origin unknown }
        g_6AAD := $0; { 7500:23A0 }
      end; { 7500:23A0; region anchor, exact origin unknown }
      g_6AAE := (g_6AAE - Ptr<UnknownValue>(@g_273F)[g_6AAF]); { 7500:23B0 }
      if (g_6AAE < $0) then begin { 7500:23B0; region anchor, exact origin unknown }
        g_6AAE := $F; { 7500:23BB }
      end; { 7500:23BB; region anchor, exact origin unknown }
      if ($F < g_6AAE) then begin { 7500:23BB; region anchor, exact origin unknown }
        g_6AAE := $0; { 7500:23C7 }
      end; { 7500:23C7; region anchor, exact origin unknown }
      FUN_0802_095d(); { 7500:23CC }
      ov17_1D58(); { 7500:23D2 }
      FUN_0899_0000(); { 7500:23D5 }
    end; { 7500:23D5; region anchor, exact origin unknown }
  end; { 7500:23D5; region anchor, exact origin unknown }
  Exit; { 7500:23DD }
end;
```

### ov17:23E0 ov17_init (conf L)

Original `ov17_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov17.lst at 7500:23E0, paired .c.

```pascal
procedure ov17_init();
begin
  Exit; { 7500:23E4 }
end;
```

## ov20

### ov20:0000 UpdateTimedEffects (conf M)

Original `FUN_8400_0000`. Params (ABI order): param_1: ShortInt; param_2: Byte.
BP access inventory (hex offset:byte widths): -1B:2, -19:2, -17:2, -15:2, -13:2, -11:2, -F:2, -D:2, -B:1, -A:1, -9:2, -7:2, -5:1/2, -3:1, -2:1, -1:1, +6:1, +8:1.
Locals/SSA temporaries: puVar1: ^Word; piVar2: ^SmallInt; puVar3: ^Byte; uVar4: Word; bVar5: Boolean; local_1d: LongWord; local_15: ^Byte; iStack_13: SmallInt; local_11: ^Byte; iStack_f: SmallInt; local_b: SmallInt; iStack_9: SmallInt; local_7: Word; local_5: Byte; local_4: Byte; local_3: ShortInt.
Callers: AdvanceClock.
Callees (listing): System.FillChar, stub_ov24_e2.

Chunks elapsed time up to 10; iterates/relinks 9-byte effect nodes, dispatches expirations. Evidence: decode/listings/ov20.lst at 8400:0000, paired .c.

```pascal
procedure FUN_8400_0000(param_1: ShortInt; param_2: Byte);
begin
  if (g_49F3 = $2) then begin { 8400:0000; region anchor, exact origin unknown }
    bVar5 := false; { 8400:0000; region anchor, exact origin unknown }
    local_4 := 1; { 8400:0024 }
    repeat { 8400:0024; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>(((SmallInt(Ptr<Word>(@g_471C)) + local_4) + 1)))^ <> $0) then begin { 8400:0024; region anchor, exact origin unknown }
        bVar5 := true; { 8400:0024; region anchor, exact origin unknown }
      end; { 8400:0024; region anchor, exact origin unknown }
      local_4 := (local_4 + 1); { 8400:003A }
    until not (((not bVar5) and then (Word(local_4) <= (Ptr<Word>((SmallInt(g_49D6) + $67C)))^))); { 8400:003A; region anchor, exact origin unknown }
    if (not bVar5) then begin { 8400:003A; region anchor, exact origin unknown }
      Exit; { 8400:02EF }
    end; { 8400:003A; region anchor, exact origin unknown }
  end else begin { 8400:003A; region anchor, exact origin unknown }
    FillChar(FarPtr($0C7C, $471E), $48, LoByte(MakeWord(HiByte($48), $1))); { 8400:0019 }
  end; { 8400:0019; region anchor, exact origin unknown }
  local_7 := Word(param_2); { 8400:0061 }
  local_3 := param_1; { 8400:0067 }
  while ($1 < local_3) do begin { 8400:0067; region anchor, exact origin unknown }
    local_7 := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_363A) + (ShortInt((local_3 + (-1))) * 2))))^ * local_7); { 8400:0081 }
    local_3 := (local_3 + (-1)); { 8400:0089 }
  end; { 8400:0089; region anchor, exact origin unknown }
  repeat { 8400:0089; region anchor, exact origin unknown }
    if (local_7 = 0) then begin { 8400:0089; region anchor, exact origin unknown }
      Exit; { 8400:02EF }
    end; { 8400:0089; region anchor, exact origin unknown }
    if (local_7 < $B) then begin { 8400:0089; region anchor, exact origin unknown }
      local_5 := Byte(local_7); { 8400:009D }
    end else begin { 8400:009D; region anchor, exact origin unknown }
      local_5 := 10; { 8400:00A6 }
    end; { 8400:00A6; region anchor, exact origin unknown }
    local_4 := 1; { 8400:00A9 }
    local_b := g_5D96; { 8400:00B4 }
    iStack_9 := g_5D98; { 8400:00B4; region anchor, exact origin unknown }
  LAB_8400_00ba: { 8400:00B4; region anchor, exact origin unknown }
    if ((local_b <> 0) or else (iStack_9 <> 0)) then begin { 8400:00B4; region anchor, exact origin unknown }
      if ((Ptr<ShortInt>(((SmallInt(Ptr<Word>(@g_471C)) + local_4) + 1)))^ <> $0) then begin { 8400:00B4; region anchor, exact origin unknown }
        (Ptr<Byte>(((SmallInt(Ptr<Word>(@g_471C)) + local_4) + 1)))^ := 0; { 8400:00B4; region anchor, exact origin unknown }
        local_1d := Ptr<Byte>(MakeLong((Ptr<Word>((local_b + $81)))^, Ptr<Byte>((Ptr<Word>((local_b + $7F)))^))); { 8400:00EE }
        local_11 := Ptr<Byte>((Ptr<Word>((local_b + $7F)))^); { 8400:0100 }
        iStack_f := (Ptr<SmallInt>((local_b + $81)))^; { 8400:0100; region anchor, exact origin unknown }
        local_15 := Ptr<Byte>((Ptr<Word>((local_b + $7F)))^); { 8400:0112 }
        iStack_13 := (Ptr<SmallInt>((local_b + $81)))^; { 8400:0112; region anchor, exact origin unknown }
        if (((Ptr<SmallInt>((local_b + $7F)))^ <> 0) or else ((Ptr<SmallInt>((local_b + $81)))^ <> 0)) then begin { 8400:0112; region anchor, exact origin unknown }
          while (((Ptr<SmallInt>((local_11 + 5)))^ <> 0) or else ((Ptr<SmallInt>((local_11 + 7)))^ <> 0)) do begin { 8400:0112; region anchor, exact origin unknown }
            puVar1 := Ptr<Word>((local_11 + 5)); { 8400:0112; region anchor, exact origin unknown }
            iStack_f := (Ptr<SmallInt>((local_11 + 7)))^; { 8400:0112; region anchor, exact origin unknown }
            local_11 := Ptr<Byte>((puVar1)^); { 8400:014F }
          end; { 8400:014F; region anchor, exact origin unknown }
        end; { 8400:014F; region anchor, exact origin unknown }
        bVar5 := false; { 8400:014F; region anchor, exact origin unknown }
        repeat { 8400:014F; region anchor, exact origin unknown }
          if (((Ptr<Byte>(local_1d) = Ptr<Byte>($0)) and then (ExtractBytes(local_1d, 2, 2) = 0)) or else bVar5) then begin { 8400:014F; region anchor, exact origin unknown }
            goto LAB_8400_028e; { 8400:014F; region anchor, exact origin unknown }
          end; { 8400:014F; region anchor, exact origin unknown }
          if ((ExtractBytes(local_1d, 2, 2) = iStack_f) and then (Ptr<Byte>(local_1d) = local_11)) then begin { 8400:014F; region anchor, exact origin unknown }
            bVar5 := true; { 8400:014F; region anchor, exact origin unknown }
          end; { 8400:014F; region anchor, exact origin unknown }
          if ((Ptr<SmallInt>((Ptr<Byte>(local_1d) + 1)))^ = 0) then begin { 8400:014F; region anchor, exact origin unknown }
            local_1d := Ptr<Byte>(MakeLong((Ptr<Word>((Ptr<Byte>(local_1d) + 7)))^, (Ptr<^Byte>((Ptr<Byte>(local_1d) + 5)))^)); { 8400:0198 }
          end else begin { 8400:0198; region anchor, exact origin unknown }
            if (Word(local_5) < (Ptr<Word>((Ptr<Byte>(local_1d) + 1)))^) then begin { 8400:0198; region anchor, exact origin unknown }
              (Ptr<Word>((Ptr<Byte>(local_1d) + 1)))^ := ((Ptr<SmallInt>((Ptr<Byte>(local_1d) + 1)))^ - Word(local_5)); { 8400:0198; region anchor, exact origin unknown }
              (Ptr<Byte>(((SmallInt(Ptr<Word>(@g_471C)) + local_4) + 1)))^ := 1; { 8400:0198; region anchor, exact origin unknown }
              local_1d := Ptr<Byte>(MakeLong((Ptr<Word>((Ptr<Byte>(local_1d) + 7)))^, (Ptr<^Byte>((Ptr<Byte>(local_1d) + 5)))^)); { 8400:01D2 }
            end else begin { 8400:01D2; region anchor, exact origin unknown }
              puVar3 := (Ptr<^Byte>((Ptr<Byte>(local_1d) + 5)))^; { 8400:01D2; region anchor, exact origin unknown }
              uVar4 := (Ptr<Word>((Ptr<Byte>(local_1d) + 7)))^; { 8400:01D2; region anchor, exact origin unknown }
              stub_ov24_e2(Ptr<Byte>(local_1d), ExtractBytes(local_1d, 2, 2), MakeWord(ShortInt((Word(puVar3) shr 8)), (local_1d)^), local_b, iStack_9); { 8400:01FE }
              if ((iStack_13 = (Ptr<SmallInt>((local_b + $81)))^) and then (local_15 = Ptr<Byte>((Ptr<Word>((local_b + $7F)))^))) then begin { 8400:01FE; region anchor, exact origin unknown }
                local_1d := Ptr<Byte>(MakeLong((Ptr<Word>((local_b + $81)))^, Ptr<Byte>((Ptr<Word>((local_b + $7F)))^))); { 8400:0225 }
              end else begin { 8400:0225; region anchor, exact origin unknown }
                local_1d := Ptr<Byte>(MakeLong(uVar4, puVar3)); { 8400:0233 }
              end; { 8400:0233; region anchor, exact origin unknown }
            end; { 8400:0233; region anchor, exact origin unknown }
          end; { 8400:0233; region anchor, exact origin unknown }
          iStack_13 := (Ptr<SmallInt>((local_b + $81)))^; { 8400:0233; region anchor, exact origin unknown }
          local_15 := Ptr<Byte>((Ptr<Word>((local_b + $7F)))^); { 8400:0245 }
          while ((local_15 <> Ptr<Byte>($0)) or else (iStack_13 <> 0)) do begin { 8400:0245; region anchor, exact origin unknown }
            if (((iStack_13 = ExtractBytes(local_1d, 2, 2)) and then (local_15 = Ptr<Byte>(local_1d))) or else (((Ptr<SmallInt>((local_15 + 7)))^ = ExtractBytes(local_1d, 2, 2)) and then ((Ptr<^Byte>((local_15 + 5)))^ = Ptr<Byte>(local_1d)))) then begin { 8400:0245; region anchor, exact origin unknown }
              Break; { 8400:0245; region anchor, exact origin unknown }
            end; { 8400:0245; region anchor, exact origin unknown }
            puVar1 := Ptr<Word>((local_15 + 5)); { 8400:0245; region anchor, exact origin unknown }
            iStack_13 := (Ptr<SmallInt>((local_15 + 7)))^; { 8400:0245; region anchor, exact origin unknown }
            local_15 := Ptr<Byte>((puVar1)^); { 8400:0283 }
          end; { 8400:0283; region anchor, exact origin unknown }
        until not (true); { 8400:0283; region anchor, exact origin unknown }
      end; { 8400:0283; region anchor, exact origin unknown }
      goto LAB_8400_02bf; { 8400:0283; region anchor, exact origin unknown }
    end; { 8400:0283; region anchor, exact origin unknown }
    if (local_7 < $B) then begin { 8400:0283; region anchor, exact origin unknown }
      local_7 := 0; { 8400:02DE }
    end else begin { 8400:02DE; region anchor, exact origin unknown }
      local_7 := (local_7 - 10); { 8400:02E6 }
    end; { 8400:02E6; region anchor, exact origin unknown }
  until not (true); { 8400:02E6; region anchor, exact origin unknown }
LAB_8400_028e: { 8400:02E6; region anchor, exact origin unknown }
  while true do begin { 8400:02E6; region anchor, exact origin unknown }
    if ((Ptr<Byte>(local_1d) = Ptr<Byte>($0)) and then (ExtractBytes(local_1d, 2, 2) = 0)) then begin { 8400:02E6; region anchor, exact origin unknown }
      Break; { 8400:02E6; region anchor, exact origin unknown }
    end; { 8400:02E6; region anchor, exact origin unknown }
    if ((Ptr<SmallInt>((Ptr<Byte>(local_1d) + 1)))^ <> 0) then begin { 8400:02E6; region anchor, exact origin unknown }
      (Ptr<Byte>(((SmallInt(Ptr<Word>(@g_471C)) + local_4) + 1)))^ := 1; { 8400:02E6; region anchor, exact origin unknown }
    end; { 8400:02E6; region anchor, exact origin unknown }
    local_1d := Ptr<Byte>(MakeLong((Ptr<Word>((Ptr<Byte>(local_1d) + 7)))^, (Ptr<^Byte>((Ptr<Byte>(local_1d) + 5)))^)); { 8400:02B7 }
  end; { 8400:02B7; region anchor, exact origin unknown }
LAB_8400_02bf: { 8400:02B7; region anchor, exact origin unknown }
  local_4 := (local_4 + 1); { 8400:02BF }
  piVar2 := Ptr<SmallInt>((local_b + $104)); { 8400:02BF; region anchor, exact origin unknown }
  iStack_9 := (Ptr<SmallInt>((local_b + $106)))^; { 8400:02BF; region anchor, exact origin unknown }
  local_b := (piVar2)^; { 8400:02CF }
  goto LAB_8400_00ba; { 8400:02CF; region anchor, exact origin unknown }
end;
```

### ov20:02F2 NormalizeGameClock (conf M)

Original `FUN_8400_02f2`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -5:2, -3:2, -1:1, +6:2.
Locals/SSA temporaries: piVar1: ^SmallInt; iVar2: SmallInt; uVar3: Word; local_7: SmallInt; iStack_5: SmallInt; local_3: ShortInt.
Callers: AdvanceClock,FUN_8400_03a3.
Callees (listing): none.

Seven fields; thresholds at DS:363A; final overflow increments character age word +30. Evidence: decode/listings/ov20.lst at 8400:02F2, paired .c.

```pascal
procedure FUN_8400_02f2(param_1: LongWord);
begin
  local_3 := $0; { 8400:02F8 }
  while true do begin { 8400:02F8; region anchor, exact origin unknown }
    uVar3 := Word((LongWord(param_1) shr $10)); { 8400:02F8; region anchor, exact origin unknown }
    iVar2 := SmallInt(param_1); { 8400:02F8; region anchor, exact origin unknown }
    if ((Ptr<Word>((Ptr<UnknownValue>(@g_363A) + (local_3 * 2))))^ <= (Ptr<Word>((iVar2 + (local_3 * 2))))^) then begin { 8400:02F8; region anchor, exact origin unknown }
      if (local_3 = $6) then begin { 8400:02F8; region anchor, exact origin unknown }
        iStack_5 := g_5D98; { 8400:02F8; region anchor, exact origin unknown }
        local_7 := g_5D96; { 8400:036A }
        while ((local_7 <> 0) or else (iStack_5 <> 0)) do begin { 8400:036A; region anchor, exact origin unknown }
          (Ptr<SmallInt>((local_7 + $30)))^ := ((Ptr<SmallInt>((local_7 + $30)))^ + 1); { 8400:036A; region anchor, exact origin unknown }
          piVar1 := Ptr<SmallInt>((local_7 + $104)); { 8400:036A; region anchor, exact origin unknown }
          iStack_5 := (Ptr<SmallInt>((local_7 + $106)))^; { 8400:036A; region anchor, exact origin unknown }
          local_7 := (piVar1)^; { 8400:038C }
        end; { 8400:038C; region anchor, exact origin unknown }
      end else begin { 8400:038C; region anchor, exact origin unknown }
        piVar1 := Ptr<SmallInt>((iVar2 + (ShortInt((local_3 + $1)) * 2))); { 8400:038C; region anchor, exact origin unknown }
        (piVar1)^ := ((piVar1)^ + 1); { 8400:038C; region anchor, exact origin unknown }
        (Ptr<SmallInt>((iVar2 + (local_3 * 2))))^ := ((Ptr<SmallInt>((iVar2 + (local_3 * 2))))^ - (Ptr<SmallInt>((Ptr<UnknownValue>(@g_363A) + (local_3 * 2))))^); { 8400:038C; region anchor, exact origin unknown }
      end; { 8400:038C; region anchor, exact origin unknown }
    end; { 8400:038C; region anchor, exact origin unknown }
    if (local_3 = $6) then begin { 8400:038C; region anchor, exact origin unknown }
      Break; { 8400:038C; region anchor, exact origin unknown }
    end; { 8400:038C; region anchor, exact origin unknown }
    local_3 := (local_3 + $1); { 8400:02FE }
  end; { 8400:02FE; region anchor, exact origin unknown }
  Exit; { 8400:03A0 }
end;
```

### ov20:03A3 NormalizeRestTime (conf M)

Original `FUN_8400_03a3`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: FUN_8400_047a,FUN_8400_0721.
Callees (listing): FUN_8400_02f2.

Rest counters g_6DC2; days capped at 99. Evidence: decode/listings/ov20.lst at 8400:03A3, paired .c.

```pascal
procedure FUN_8400_03a3();
begin
  FUN_8400_02f2(Ptr<UnknownValue>(@g_6DC2), $C7C); { 8400:03AC }
  if (g_6DCC <> 0) then begin { 8400:03AC; region anchor, exact origin unknown }
    g_6DCA := (g_6DCA + (g_3642 * g_6DCC)); { 8400:03BD }
    g_6DCC := 0; { 8400:03C3 }
    if (99 < g_6DCA) then begin { 8400:03C3; region anchor, exact origin unknown }
      g_6DCA := 99; { 8400:03CD }
    end; { 8400:03CD; region anchor, exact origin unknown }
  end; { 8400:03CD; region anchor, exact origin unknown }
  Exit; { 8400:03D4 }
end;
```

### ov20:03D5 AdvanceClock (conf M)

Original `AdvanceClock`. Params (ABI order): param_1: ShortInt; param_2: ShortInt.
BP access inventory (hex offset:byte widths): -11:1, -10:1, -F:1, -E:2, +6:1, +8:1.
Locals/SSA temporaries: unaff_SS: Word; local_12: ShortInt; local_11: ShortInt; local_10: array[0..7-1] of SmallInt.
Callers: ov20_0C9A.
Callees (listing): FUN_8400_02f2, FUN_8400_0000.

Reads VM clock fields, increments requested unit, normalizes, stores and advances effects. Evidence: decode/listings/ov20.lst at 8400:03D5, paired .c.

```pascal
procedure AdvanceClock(param_1: ShortInt; param_2: ShortInt);
begin
  local_11 := $0; { 8400:03DB }
  while Seq(local_10[local_11] := (Ptr<SmallInt>(((SmallInt(g_49D2) + ((local_11 + $49C6) * 2)) + $6E00)))^, (local_11 <> $6)) do begin { 8400:03DB; region anchor, exact origin unknown }
    local_11 := (local_11 + $1); { 8400:03E1 }
  end; { 8400:03E1; region anchor, exact origin unknown }
  if (param_2 <> $0) then begin { 8400:03E1; region anchor, exact origin unknown }
    local_12 := $1; { 8400:0416 }
    while true do begin { 8400:0416; region anchor, exact origin unknown }
      local_10[param_1] := (local_10[param_1] + 1); { 8400:0416; region anchor, exact origin unknown }
      FUN_8400_02f2(local_10, UNK_unaff_SS); { 8400:042F }
      if (local_12 = param_2) then begin { 8400:042F; region anchor, exact origin unknown }
        Break; { 8400:042F; region anchor, exact origin unknown }
      end; { 8400:042F; region anchor, exact origin unknown }
      local_12 := (local_12 + $1); { 8400:041B }
    end; { 8400:041B; region anchor, exact origin unknown }
  end; { 8400:041B; region anchor, exact origin unknown }
  local_11 := $0; { 8400:043A }
  while true do begin { 8400:043A; region anchor, exact origin unknown }
    (Ptr<SmallInt>(((SmallInt(g_49D2) + ((local_11 + $49C6) * 2)) + $6E00)))^ := local_10[local_11]; { 8400:043A; region anchor, exact origin unknown }
    if (local_11 = $6) then begin { 8400:043A; region anchor, exact origin unknown }
      Break; { 8400:043A; region anchor, exact origin unknown }
    end; { 8400:043A; region anchor, exact origin unknown }
    local_11 := (local_11 + $1); { 8400:0440 }
  end; { 8400:0440; region anchor, exact origin unknown }
  FUN_8400_0000(MakeWord($93, param_1), MakeWord($93, param_2)); { 8400:0471 }
  Exit; { 8400:0477 }
end;
```

### ov20:047A SubtractRestInterval (conf M)

Original `FUN_8400_047a`. Params (ABI order): param_1: ShortInt; param_2: Byte.
BP access inventory (hex offset:byte widths): -3:1, -2:1, -1:1, +6:1, +8:1.
Locals/SSA temporaries: local_4: ShortInt; local_3: ShortInt.
Callers: FUN_8400_0721,ov20_0C9A.
Callees (listing): System.FillChar, FUN_8400_03a3.

Borrows across rest time units. Evidence: decode/listings/ov20.lst at 8400:047A, paired .c.

```pascal
procedure FUN_8400_047a(param_1: ShortInt; param_2: Byte);
begin
  if ((((g_6DCA <> 0) or else (g_6DC8 <> 0)) or else (g_6DC6 <> 0)) or else (g_6DC4 <> 0)) then begin { 8400:047A; region anchor, exact origin unknown }
    while Seq(local_3 := param_1, ((Ptr<Word>((Ptr<UnknownValue>(@g_6DC2) + (param_1 * 2))))^ < Word(param_2))) do begin { 8400:047A; region anchor, exact origin unknown }
      repeat { 8400:047A; region anchor, exact origin unknown }
        local_3 := (local_3 + $1); { 8400:04BC }
        if ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (local_3 * 2))))^ <> 0) then begin { 8400:04BC; region anchor, exact origin unknown }
          Break; { 8400:04BC; region anchor, exact origin unknown }
        end; { 8400:04BC; region anchor, exact origin unknown }
      until not ((local_3 < $5)); { 8400:04BC; region anchor, exact origin unknown }
      if (local_3 = $5) then begin { 8400:04BC; region anchor, exact origin unknown }
        FillChar(FarPtr($0C7C, $6DC2), $E, LoByte(MakeWord(HiByte($E), $0))); { 8400:04F0 }
        param_2 := 0; { 8400:04F0; region anchor, exact origin unknown }
      end else begin { 8400:04F0; region anchor, exact origin unknown }
        if (ShortInt((param_1 + $1)) <= local_3) then begin { 8400:04F0; region anchor, exact origin unknown }
          local_4 := local_3; { 8400:050B }
          while true do begin { 8400:050B; region anchor, exact origin unknown }
            (Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (local_4 * 2))))^ := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (local_4 * 2))))^ + (-1)); { 8400:050B; region anchor, exact origin unknown }
            (Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (ShortInt((local_4 + (-1))) * 2))))^ := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (ShortInt((local_4 + (-1))) * 2))))^ + (Ptr<SmallInt>((Ptr<UnknownValue>(@g_363A) + (ShortInt((local_4 + (-1))) * 2))))^); { 8400:050B; region anchor, exact origin unknown }
            if (local_4 = ShortInt((param_1 + $1))) then begin { 8400:050B; region anchor, exact origin unknown }
              Break; { 8400:050B; region anchor, exact origin unknown }
            end; { 8400:050B; region anchor, exact origin unknown }
            local_4 := (local_4 + (-1)); { 8400:0510 }
          end; { 8400:0510; region anchor, exact origin unknown }
        end; { 8400:0510; region anchor, exact origin unknown }
      end; { 8400:0510; region anchor, exact origin unknown }
    end; { 8400:0510; region anchor, exact origin unknown }
    (Ptr<Word>((Ptr<UnknownValue>(@g_6DC2) + (param_1 * 2))))^ := ((Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (param_1 * 2))))^ - Word(param_2)); { 8400:0510; region anchor, exact origin unknown }
    FUN_8400_03a3(); { 8400:055A }
  end; { 8400:055A; region anchor, exact origin unknown }
  Exit; { 8400:0560 }
end;
```

### ov20:0565 TwoDigitNumber (conf M)

Original `FUN_8400_0565`. Params (ABI order): param_1: Byte; param_2: LongWord.
BP access inventory (hex offset:byte widths): -129:2, -29:2, +6:1, +8:2.
Locals/SSA temporaries: unaff_SS: Word; puVar1: ^Byte; uVar2: Word; local_12b: array[0..256-1] of Byte; local_2b: array[0..41-1] of Byte.
Callers: FUN_8400_05f0.
Callees (listing): FUN_00ba_1037, System.@StrAssign, System.@StrCopy, System.@StrAppend, System.Copy.

Decimal leading zero formatting. Evidence: decode/listings/ov20.lst at 8400:0565, paired .c.

```pascal
procedure FUN_8400_0565(param_1: Byte; param_2: LongWord);
begin
  puVar1 := local_12b; { 8400:0565; region anchor, exact origin unknown }
  uVar2 := UNK_unaff_SS; { 8400:0565; region anchor, exact origin unknown }
  FUN_00ba_1037(param_1); { 8400:0576 }
  PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$129))), 1, $28); { 8400:0584 }
  if (param_1 < 10) then begin { 8400:0584; region anchor, exact origin unknown }
    puVar1 := local_12b; { 8400:0584; region anchor, exact origin unknown }
    uVar2 := UNK_unaff_SS; { 8400:0584; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$129))) := '0'; { 8400:059A }
    PString(FarPtr(SS, BPAddr(-$129))) := PString(FarPtr(SS, BPAddr(-$129))) + PString(FarPtr(SS, BPAddr(-$29))); { 8400:05A4 }
    PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$129))), 1, $28); { 8400:05B2 }
  end; { 8400:05B2; region anchor, exact origin unknown }
  puVar1 := local_12b; { 8400:05B2; region anchor, exact origin unknown }
  PString(UNK_hidden_string_result) := Copy(PString(FarPtr(SS, BPAddr(-$29))), $1, $2); { 8400:05CA }
  PString(FarPtr(FarSeg(BPWord($8)), FarOff(BPWord($8)))) := Copy(PString(FarPtr(SS, BPAddr(-$129))), 1, $28); { 8400:05D8 }
  Exit; { 8400:05E0 }
end;
```

### ov20:05F0 DrawRestTime (conf M)

Original `FUN_8400_05f0`. Params (ABI order): param_1: ShortInt.
BP access inventory (hex offset:byte widths): -110:2, -1B:2, -12:2, -10:1, -F:1/2, -B:1, -1:1, +6:1.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; uVar3: Word; iVar4: SmallInt; uVar6: Byte; uVar5: Word; unaff_SS: Word; puVar7: ^Byte; local_112: array[0..245-1] of Byte; local_1d: array[0..9-1] of Byte; local_14: array[0..2-1] of Byte; local_12: Byte; auStack_11: array[0..2-1] of Word; local_d: Byte; local_3: ShortInt.
Callers: FUN_8400_0721,FUN_8400_0871,FUN_8400_0925,FUN_8400_09e7,ov20_0C9A.
Callees (listing): System.@StrCopy, FUN_0709_0626, FUN_8400_0565.

Rest Time display. Evidence: decode/listings/ov20.lst at 8400:05F0, paired .c.

```pascal
procedure FUN_8400_05f0(param_1: ShortInt);
begin
  local_3 := $0; { 8400:05F7 }
  while Seq(auStack_11[local_3] := 10, (local_3 <> $6)) do begin { 8400:05F7; region anchor, exact origin unknown }
    local_3 := (local_3 + $1); { 8400:05FD }
  end; { 8400:05FD; region anchor, exact origin unknown }
  auStack_11[param_1] := $F; { 8400:05FD; region anchor, exact origin unknown }
  param_1 := (param_1 shr 7); { 8400:05FD; region anchor, exact origin unknown }
  uVar1 := MakeWord(param_1, 1); { 8400:05FD; region anchor, exact origin unknown }
  uVar2 := MakeWord(param_1, $11); { 8400:05FD; region anchor, exact origin unknown }
  uVar3 := MakeWord(param_1, 10); { 8400:05FD; region anchor, exact origin unknown }
  puVar7 := local_1d; { 8400:05FD; region anchor, exact origin unknown }
  uVar5 := UNK_unaff_SS; { 8400:05FD; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$1B))) := 'Rest Time:'; { 8400:0633 }
  FUN_0709_0626(puVar7, uVar5, uVar3, uVar2, uVar1); { 8400:0638 }
  local_12 := $B; { 8400:063D }
  local_3 := $4; { 8400:0641 }
  while true do begin { 8400:0641; region anchor, exact origin unknown }
    iVar4 := (local_12 + 1); { 8400:0641; region anchor, exact origin unknown }
    uVar1 := MakeWord(ShortInt((Word(iVar4) shr 8)), $11); { 8400:0641; region anchor, exact origin unknown }
    uVar2 := MakeWord((local_3 shr 7), (Ptr<Byte>((auStack_11 + local_3)))^); { 8400:0641; region anchor, exact origin unknown }
    puVar7 := local_112; { 8400:0641; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 8400:0641; region anchor, exact origin unknown }
    FUN_8400_0565(MakeWord((local_3 shr 7), Ptr<UnknownValue>(@g_6DC2)[(local_3 * 2)])); { 8400:0674 }
    FUN_0709_0626(puVar7, uVar5, uVar2, uVar1, iVar4); { 8400:0677 }
    iVar4 := (local_12 + 3); { 8400:0677; region anchor, exact origin unknown }
    uVar6 := Byte((Word(iVar4) shr 8)); { 8400:0677; region anchor, exact origin unknown }
    uVar1 := MakeWord(uVar6, $11); { 8400:0677; region anchor, exact origin unknown }
    uVar2 := MakeWord(uVar6, 10); { 8400:0677; region anchor, exact origin unknown }
    puVar7 := local_14; { 8400:0677; region anchor, exact origin unknown }
    uVar5 := UNK_unaff_SS; { 8400:0677; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$12))) := ':'; { 8400:0695 }
    FUN_0709_0626(puVar7, uVar5, uVar2, uVar1, iVar4); { 8400:069A }
    local_12 := (local_12 + 3); { 8400:069F }
    if (local_3 = $3) then begin { 8400:069F; region anchor, exact origin unknown }
      Break; { 8400:069F; region anchor, exact origin unknown }
    end; { 8400:069F; region anchor, exact origin unknown }
    local_3 := (local_3 + (-1)); { 8400:0647 }
  end; { 8400:0647; region anchor, exact origin unknown }
  iVar4 := (local_12 + 1); { 8400:0647; region anchor, exact origin unknown }
  uVar6 := Byte((Word(iVar4) shr 8)); { 8400:0647; region anchor, exact origin unknown }
  uVar5 := MakeWord(uVar6, $11); { 8400:0647; region anchor, exact origin unknown }
  uVar1 := MakeWord(uVar6, local_d); { 8400:0647; region anchor, exact origin unknown }
  puVar7 := local_112; { 8400:0647; region anchor, exact origin unknown }
  FUN_8400_0565(((g_6DC6 * 10) + g_6DC4)); { 8400:06CA }
  FUN_0709_0626(puVar7, UNK_unaff_SS, uVar1, uVar5, iVar4); { 8400:06CD }
  Exit; { 8400:06D5 }
end;
```

### ov20:0721 EditRestTime (conf M)

Original `FUN_8400_0721`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -2D:2, -5:2, -4:1, -3:1, -2:1/2, -1:1.
Locals/SSA temporaries: piVar1: ^SmallInt; iVar2: SmallInt; extraout_AL: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar3: Byte; extraout_AH_03: Byte; uVar4: Word; unaff_SS: Word; uVar5: Byte; puVar6: ^Byte; puVar7: ^Byte; uVar8: Word; local_2f: array[0..40-1] of Byte; local_7: Byte; local_6: ShortInt; local_5: ShortInt; local_4: ShortInt; local_3: Byte.
Callers: ov20_0C9A.
Callees (listing): FUN_8400_05f0, System.@StrCopy, stub_ov25_e2, FUN_8400_03a3, FUN_8400_047a, System.@SetIn.

Rest daYs Hours Mins Inc Dec Exit; Y/H/M select unit, I/D change, R starts, E exits; arrow scan codes also used. Evidence: decode/listings/ov20.lst at 8400:0721, paired .c.

```pascal
function FUN_8400_0721(): Word;
begin
  uVar4 := $8400; { 8400:0721; region anchor, exact origin unknown }
  local_3 := 0; { 8400:0727 }
  local_6 := $2; { 8400:072B }
  repeat { 8400:072B; region anchor, exact origin unknown }
    FUN_8400_05f0(local_6); { 8400:0734 }
    puVar7 := @local_7; { 8400:0734; region anchor, exact origin unknown }
    uVar8 := UNK_unaff_SS; { 8400:0734; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$5))) := ''; { 8400:0741 }
    puVar6 := local_2f; { 8400:0741; region anchor, exact origin unknown }
    uVar4 := UNK_unaff_SS; { 8400:0741; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2D))) := 'Rest   daYs Hours Mins   Inc Dec   Exit'; { 8400:0750 }
    stub_ov25_e2(@local_4, UNK_unaff_SS, (Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, 1), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), puVar6, uVar4, puVar7, uVar8); { 8400:0769 }
    local_5 := UNK_extraout_AL; { 8400:076E }
    if (local_4 <> $0) then begin { 8400:076E; region anchor, exact origin unknown }
      if (UNK_extraout_AL = $48) then begin { 8400:076E; region anchor, exact origin unknown }
        local_5 := $49; { 8400:077E }
      end else begin { 8400:077E; region anchor, exact origin unknown }
        if (UNK_extraout_AL = $50) then begin { 8400:077E; region anchor, exact origin unknown }
          local_5 := $44; { 8400:0788 }
        end else begin { 8400:0788; region anchor, exact origin unknown }
          if (UNK_extraout_AL = $4B) then begin { 8400:0788; region anchor, exact origin unknown }
            local_6 := (local_6 + $1); { 8400:0792 }
            if ($4 < local_6) then begin { 8400:0792; region anchor, exact origin unknown }
              local_6 := $2; { 8400:079B }
            end; { 8400:079B; region anchor, exact origin unknown }
            local_5 := $58; { 8400:079F }
          end else begin { 8400:079F; region anchor, exact origin unknown }
            if (UNK_extraout_AL = $4D) then begin { 8400:079F; region anchor, exact origin unknown }
              local_6 := (local_6 + (-1)); { 8400:07A9 }
              if (local_6 < $2) then begin { 8400:07A9; region anchor, exact origin unknown }
                local_6 := $4; { 8400:07B2 }
              end; { 8400:07B2; region anchor, exact origin unknown }
              local_5 := $58; { 8400:07B6 }
            end else begin { 8400:07B6; region anchor, exact origin unknown }
              local_5 := $58; { 8400:07BC }
            end; { 8400:07BC; region anchor, exact origin unknown }
          end; { 8400:07BC; region anchor, exact origin unknown }
        end; { 8400:07BC; region anchor, exact origin unknown }
      end; { 8400:07BC; region anchor, exact origin unknown }
    end; { 8400:07BC; region anchor, exact origin unknown }
    if (local_5 = $D) then begin { 8400:07BC; region anchor, exact origin unknown }
      local_5 := $52; { 8400:07C6 }
    end; { 8400:07C6; region anchor, exact origin unknown }
    uVar3 := UNK_extraout_AH_00; { 8400:07C6; region anchor, exact origin unknown }
    if (local_5 = $52) then begin { 8400:07C6; region anchor, exact origin unknown }
      local_3 := 1; { 8400:07D1 }
      uVar5 := 1; { 8400:07D1; region anchor, exact origin unknown }
    end else begin { 8400:07D1; region anchor, exact origin unknown }
      if (local_5 = $59) then begin { 8400:07D1; region anchor, exact origin unknown }
        local_6 := $4; { 8400:07DB }
        uVar5 := 1; { 8400:07DB; region anchor, exact origin unknown }
      end else begin { 8400:07DB; region anchor, exact origin unknown }
        if (local_5 = $48) then begin { 8400:07DB; region anchor, exact origin unknown }
          local_6 := $3; { 8400:07E5 }
          uVar5 := 1; { 8400:07E5; region anchor, exact origin unknown }
        end else begin { 8400:07E5; region anchor, exact origin unknown }
          if (local_5 = $4D) then begin { 8400:07E5; region anchor, exact origin unknown }
            local_6 := $2; { 8400:07EF }
            uVar5 := 1; { 8400:07EF; region anchor, exact origin unknown }
          end else begin { 8400:07EF; region anchor, exact origin unknown }
            if (local_5 = $49) then begin { 8400:07EF; region anchor, exact origin unknown }
              if (local_6 = $2) then begin { 8400:07EF; region anchor, exact origin unknown }
                iVar2 := (g_6DC4 + 5); { 8400:07EF; region anchor, exact origin unknown }
                g_6DC4 := iVar2; { 8400:07FF }
              end else begin { 8400:07FF; region anchor, exact origin unknown }
                piVar1 := Ptr<SmallInt>((Ptr<UnknownValue>(@g_6DC2) + (local_6 * 2))); { 8400:07FF; region anchor, exact origin unknown }
                (piVar1)^ := ((piVar1)^ + 1); { 8400:07FF; region anchor, exact origin unknown }
                iVar2 := (piVar1)^; { 8400:07FF; region anchor, exact origin unknown }
              end; { 8400:07FF; region anchor, exact origin unknown }
              uVar5 := (iVar2 = 0); { 8400:07FF; region anchor, exact origin unknown }
              FUN_8400_03a3(); { 8400:0813 }
              uVar3 := UNK_extraout_AH_01; { 8400:0813; region anchor, exact origin unknown }
            end else begin { 8400:0813; region anchor, exact origin unknown }
              uVar5 := 0; { 8400:0813; region anchor, exact origin unknown }
              if (local_5 = $44) then begin { 8400:0813; region anchor, exact origin unknown }
                uVar5 := (local_6 = $2); { 8400:0813; region anchor, exact origin unknown }
                if Boolean(uVar5) then begin { 8400:0813; region anchor, exact origin unknown }
                  FUN_8400_047a(MakeWord(UNK_extraout_AH_00, 1), MakeWord(UNK_extraout_AH_00, 5)); { 8400:0829 }
                end else begin { 8400:0829; region anchor, exact origin unknown }
                  FUN_8400_047a(MakeWord(UNK_extraout_AH_00, local_6), MakeWord(UNK_extraout_AH_00, 1)); { 8400:0836 }
                end; { 8400:0836; region anchor, exact origin unknown }
                FUN_8400_03a3(); { 8400:083A }
                uVar3 := UNK_extraout_AH_02; { 8400:083A; region anchor, exact origin unknown }
              end; { 8400:083A; region anchor, exact origin unknown }
            end; { 8400:083A; region anchor, exact origin unknown }
          end; { 8400:083A; region anchor, exact origin unknown }
        end; { 8400:083A; region anchor, exact origin unknown }
      end; { 8400:083A; region anchor, exact origin unknown }
    end; { 8400:083A; region anchor, exact origin unknown }
    uVar4 := $AF8; { 8400:083A; region anchor, exact origin unknown }
    (MakeWord(uVar3, local_5) in PackedSet(FarPtr($3C5, $701))); { 8400:0846 }
  until not (Boolean(uVar5)); { 8400:0846; region anchor, exact origin unknown }
  Exit(MakeWord(UNK_extraout_AH_03, local_3)); { 8400:0856 }
end;
```

### ov20:0871 RestHealingTick (conf M)

Original `FUN_8400_0871`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -1F:2, -5:2, -3:2, -1:1.
Locals/SSA temporaries: puVar1: ^Word; cVar2: ShortInt; bVar6: Byte; extraout_AH: Byte; uVar3: Word; uVar4: Word; uVar5: Word; uVar7: Word; unaff_SS: Word; puVar8: ^Byte; local_21: array[0..26-1] of Byte; local_7: Word; uStack_5: Word; local_3: ShortInt.
Callers: ov20_0C9A.
Callees (listing): stub_ov24_e21, FUN_8400_05f0, System.@StrCopy, FUN_0709_0626, FUN_00ba_0767, FUN_0709_0dbe, FUN_00ba_17e3.

Every 288 iterations applies healing; whole party healed message. Evidence: decode/listings/ov20.lst at 8400:0871, paired .c.

```pascal
procedure FUN_8400_0871();
begin
  uVar7 := $8400; { 8400:0871; region anchor, exact origin unknown }
  g_6DD8 := (g_6DD8 + 1); { 8400:0877 }
  if ($11F < g_6DD8) then begin { 8400:0877; region anchor, exact origin unknown }
    local_3 := $0; { 8400:0886 }
    uStack_5 := g_5D98; { 8400:0886; region anchor, exact origin unknown }
    local_7 := g_5D96; { 8400:0891 }
    while Seq(bVar6 := Byte(((local_7 or uStack_5) shr 8)), ((local_7 or uStack_5) <> 0)) do begin { 8400:0891; region anchor, exact origin unknown }
      uVar7 := $B0; { 8400:0891; region anchor, exact origin unknown }
      cVar2 := stub_ov24_e21((Word(bVar6) shl 8), MakeWord(bVar6, 1), local_7, uStack_5); { 8400:08AB }
      if (cVar2 <> $0) then begin { 8400:08AB; region anchor, exact origin unknown }
        local_3 := $1; { 8400:08B4 }
      end; { 8400:08B4; region anchor, exact origin unknown }
      puVar1 := Ptr<Word>((local_7 + $104)); { 8400:08B4; region anchor, exact origin unknown }
      uStack_5 := (Ptr<Word>((local_7 + $106)))^; { 8400:08B4; region anchor, exact origin unknown }
      local_7 := (puVar1)^; { 8400:08C5 }
    end; { 8400:08C5; region anchor, exact origin unknown }
    FUN_8400_05f0(0); { 8400:08D1 }
    uVar3 := MakeWord(UNK_extraout_AH, 1); { 8400:08D1; region anchor, exact origin unknown }
    uVar4 := MakeWord(UNK_extraout_AH, $13); { 8400:08D1; region anchor, exact origin unknown }
    uVar5 := MakeWord(UNK_extraout_AH, 10); { 8400:08D1; region anchor, exact origin unknown }
    puVar8 := local_21; { 8400:08D1; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$1F))) := 'The Whole Party Is Healed'; { 8400:08E7 }
    FUN_0709_0626(puVar8, UNK_unaff_SS, uVar5, uVar4, uVar3); { 8400:08EC }
    if (local_3 <> $0) then begin { 8400:08EC; region anchor, exact origin unknown }
      FUN_00ba_0767(g_5D92, g_5D94); { 8400:08FF }
    end; { 8400:08FF; region anchor, exact origin unknown }
    FUN_0709_0dbe(); { 8400:0904 }
    FUN_00ba_17e3(); { 8400:0909 }
    g_6DD8 := 0; { 8400:0910 }
  end; { 8400:0910; region anchor, exact origin unknown }
  Exit; { 8400:0916 }
end;
```

### ov20:0925 MemorizePendingSpell (conf M)

Original `FUN_8400_0925`. Params (ABI order): param_1: ^ShortInt; param_2: LongWord.
BP access inventory (hex offset:byte widths): -11:2, -3:1, -2:1, -1:1, +6:2, +A:2, +C:2.
Locals/SSA temporaries: pcVar1: ^ShortInt; iVar2: SmallInt; uVar3: Word; uVar4: Word; unaff_SS: Word; puVar5: ^Byte; uVar6: Word; iVar7: SmallInt; uVar8: Word; local_13: array[0..14-1] of Byte; local_5: Byte; local_4: ShortInt.
Callers: FUN_8400_0b0a,FUN_8400_0bb2.
Callees (listing): FUN_8400_05f0, System.@StrCopy, stub_ov22_e8.

First pending spell; character +17 high-bit state; has memorized message. Evidence: decode/listings/ov20.lst at 8400:0925, paired .c.

```pascal
function FUN_8400_0925(param_1: ^ShortInt; param_2: LongWord): ShortInt;
begin
  uVar4 := $8400; { 8400:0925; region anchor, exact origin unknown }
  local_4 := $0; { 8400:092B }
  local_5 := 0; { 8400:092F }
  while ((local_5 < $15) and then (local_4 = $0)) do begin { 8400:092F; region anchor, exact origin unknown }
    uVar3 := Word((LongWord(param_2) shr $10)); { 8400:092F; region anchor, exact origin unknown }
    iVar2 := SmallInt(param_2); { 8400:092F; region anchor, exact origin unknown }
    if ($7F < (Ptr<Byte>(((iVar2 + Word(local_5)) + $17)))^) then begin { 8400:092F; region anchor, exact origin unknown }
      if ((param_1)^ = $0) then begin { 8400:092F; region anchor, exact origin unknown }
        pcVar1 := Ptr<ShortInt>(((iVar2 + Word(local_5)) + $17)); { 8400:092F; region anchor, exact origin unknown }
        (pcVar1)^ := ((pcVar1)^ + (-$80)); { 8400:092F; region anchor, exact origin unknown }
        FUN_8400_05f0(0); { 8400:0993 }
        puVar5 := local_13; { 8400:0993; region anchor, exact origin unknown }
        uVar6 := UNK_unaff_SS; { 8400:0993; region anchor, exact origin unknown }
        iVar7 := iVar2; { 8400:0993; region anchor, exact origin unknown }
        uVar8 := uVar3; { 8400:0993; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$11))) := 'has memorized'; { 8400:09A6 }
        uVar4 := $96; { 8400:09A6; region anchor, exact origin unknown }
        stub_ov22_e8((Ptr<Byte>(((iVar2 + Word(local_5)) + $17)))^, puVar5, uVar6, iVar7, uVar8); { 8400:09BA }
        (param_1)^ := $1; { 8400:09BA; region anchor, exact origin unknown }
      end else begin { 8400:09BA; region anchor, exact origin unknown }
        local_4 := Ptr<UnknownValue>(@g_31FB)[(Word(((Ptr<Byte>(((iVar2 + Word(local_5)) + $17)))^ and $7F)) * $10)]; { 8400:097B }
      end; { 8400:097B; region anchor, exact origin unknown }
    end; { 8400:097B; region anchor, exact origin unknown }
    local_5 := (local_5 + 1); { 8400:09C6 }
  end; { 8400:09C6; region anchor, exact origin unknown }
  Exit(local_4); { 8400:09D8 }
end;
```

### ov20:09E7 ScribePendingScroll (conf M)

Original `FUN_8400_09e7`. Params (ABI order): param_1: ^ShortInt; param_2: LongWord.
BP access inventory (hex offset:byte widths): -14:2, -8:2, -6:2, -4:1, -3:1, -2:1, -1:1, +6:2, +A:2, +C:2.
Locals/SSA temporaries: puVar1: ^Word; cVar2: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; iVar3: SmallInt; uVar4: Word; unaff_SS: Word; puVar5: ^Byte; uVar6: Word; iVar7: SmallInt; uVar8: Word; local_16: array[0..12-1] of Byte; local_a: Word; uStack_8: Word; local_6: ShortInt; local_5: Byte; local_4: Byte.
Callers: FUN_8400_0b0a,FUN_8400_0bb2.
Callees (listing): stub_ov22_e6, stub_ov22_e7, FUN_8400_05f0, System.@StrCopy, stub_ov22_e8.

Scribing completion and message. Evidence: decode/listings/ov20.lst at 8400:09E7, paired .c.

```pascal
function FUN_8400_09e7(param_1: ^ShortInt; param_2: LongWord): Word;
begin
  local_6 := $0; { 8400:09ED }
  uVar4 := Word((LongWord(param_2) shr $10)); { 8400:09ED; region anchor, exact origin unknown }
  iVar3 := SmallInt(param_2); { 8400:09ED; region anchor, exact origin unknown }
  uStack_8 := (Ptr<Word>((iVar3 + $CA)))^; { 8400:09ED; region anchor, exact origin unknown }
  local_a := (Ptr<Word>((iVar3 + 200)))^; { 8400:09FE }
  while (((local_a or uStack_8) <> 0) and then (local_6 = $0)) do begin { 8400:09FE; region anchor, exact origin unknown }
    local_4 := 1; { 8400:0A18 }
    cVar2 := stub_ov22_e6(local_a, uStack_8); { 8400:0A22 }
    if (cVar2 <> $0) then begin { 8400:0A22; region anchor, exact origin unknown }
      while ((local_4 < 4) and then (local_6 = $0)) do begin { 8400:0A22; region anchor, exact origin unknown }
        if ($80 < (Ptr<Byte>(((local_a + local_4) + $3B)))^) then begin { 8400:0A22; region anchor, exact origin unknown }
          if ((param_1)^ = $0) then begin { 8400:0A22; region anchor, exact origin unknown }
            local_5 := ((Ptr<Byte>(((local_a + local_4) + $3B)))^ and $7F); { 8400:0A8E }
            (Ptr<Byte>(((iVar3 + Word(local_5)) + $32)))^ := 1; { 8400:0A8E; region anchor, exact origin unknown }
            stub_ov22_e7(local_5, local_a, uStack_8, iVar3, uVar4); { 8400:0AB0 }
            FUN_8400_05f0((Word(UNK_extraout_AH) shl 8)); { 8400:0AB9 }
            puVar5 := local_16; { 8400:0AB9; region anchor, exact origin unknown }
            uVar6 := UNK_unaff_SS; { 8400:0AB9; region anchor, exact origin unknown }
            iVar7 := iVar3; { 8400:0AB9; region anchor, exact origin unknown }
            uVar8 := uVar4; { 8400:0AB9; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$14))) := 'has scribed'; { 8400:0ACC }
            stub_ov22_e8(MakeWord(UNK_extraout_AH_00, local_5), puVar5, uVar6, iVar7, uVar8); { 8400:0AD5 }
            (param_1)^ := $1; { 8400:0AD5; region anchor, exact origin unknown }
          end else begin { 8400:0AD5; region anchor, exact origin unknown }
            local_6 := Ptr<UnknownValue>(@g_31FB)[(Word(((Ptr<Byte>(((local_a + local_4) + $3B)))^ and $7F)) * $10)]; { 8400:0A79 }
          end; { 8400:0A79; region anchor, exact origin unknown }
        end; { 8400:0A79; region anchor, exact origin unknown }
        local_4 := (local_4 + 1); { 8400:0AE1 }
      end; { 8400:0AE1; region anchor, exact origin unknown }
    end; { 8400:0AE1; region anchor, exact origin unknown }
    puVar1 := Ptr<Word>((local_a + $2A)); { 8400:0AE1; region anchor, exact origin unknown }
    uStack_8 := (Ptr<Word>((local_a + $2C)))^; { 8400:0AE1; region anchor, exact origin unknown }
    local_a := (puVar1)^; { 8400:0AF2 }
  end; { 8400:0AF2; region anchor, exact origin unknown }
  Exit(MakeWord(ShortInt(((local_a or uStack_8) shr 8)), local_6)); { 8400:0B07 }
end;
```

### ov20:0B0A AdvanceRestSpellCountdown (conf M)

Original `FUN_8400_0b0a`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -7:1/2, -6:2, -4:2, -2:1, -1:1.
Locals/SSA temporaries: piVar1: ^SmallInt; unaff_SS: Word; local_9: Byte; local_8: SmallInt; iStack_6: SmallInt; local_4: ShortInt; local_3: Byte.
Callers: ov20_0C9A.
Callees (listing): FUN_8400_09e7, FUN_8400_0925.

Per-party countdown at g_6DCF. Evidence: decode/listings/ov20.lst at 8400:0B0A, paired .c.

```pascal
procedure FUN_8400_0b0a();
begin
  local_3 := 1; { 8400:0B10 }
  iStack_6 := g_5D98; { 8400:0B10; region anchor, exact origin unknown }
  local_8 := g_5D96; { 8400:0B1B }
  while ((local_8 <> 0) or else (iStack_6 <> 0)) do begin { 8400:0B1B; region anchor, exact origin unknown }
    Ptr<UnknownValue>(@g_6DCF)[local_3] := (Ptr<UnknownValue>(@g_6DCF)[local_3] + (-1)); { 8400:0B1B; region anchor, exact origin unknown }
    if ((Ptr<UnknownValue>(@g_6DCF)[local_3] = $0) and then ((Ptr<ShortInt>((local_8 + $2C)))^ = $0)) then begin { 8400:0B1B; region anchor, exact origin unknown }
      local_9 := 0; { 8400:0B4F }
      local_4 := FUN_8400_09e7(@local_9, UNK_unaff_SS, local_8, iStack_6); { 8400:0B5F }
      if (local_4 = $0) then begin { 8400:0B5F; region anchor, exact origin unknown }
        local_4 := FUN_8400_0925(@local_9, UNK_unaff_SS, local_8, iStack_6); { 8400:0B77 }
      end; { 8400:0B77; region anchor, exact origin unknown }
      Ptr<UnknownValue>(@g_6DCF)[local_3] := (local_4 * $3); { 8400:0B77; region anchor, exact origin unknown }
    end; { 8400:0B77; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_8 + $104)); { 8400:0B77; region anchor, exact origin unknown }
    iStack_6 := (Ptr<SmallInt>((local_8 + $106)))^; { 8400:0B77; region anchor, exact origin unknown }
    local_3 := (local_3 + 1); { 8400:0BA8 }
    local_8 := (piVar1)^; { 8400:0BA2 }
  end; { 8400:0BA2; region anchor, exact origin unknown }
  Exit; { 8400:0BB1 }
end;
```

### ov20:0BB2 InitializeRestStudyTime (conf M)

Original `FUN_8400_0bb2`. Params (ABI order): param_1: ^Byte.
BP access inventory (hex offset:byte widths): -7:1/2, -6:2, -4:2, -2:1, -1:1, +6:2.
Locals/SSA temporaries: piVar1: ^SmallInt; unaff_SS: Word; local_9: Byte; local_8: SmallInt; iStack_6: SmallInt; local_4: ShortInt; local_3: Byte.
Callers: ov20_0C9A.
Callees (listing): FUN_8400_09e7, FUN_8400_0925.

Character +2C study countdown; 12-step intervals. Evidence: decode/listings/ov20.lst at 8400:0BB2, paired .c.

```pascal
procedure FUN_8400_0bb2(param_1: ^Byte);
begin
  (param_1)^ := ((param_1)^ + 1); { 8400:0BB2; region anchor, exact origin unknown }
  if ($B < (param_1)^) then begin { 8400:0BB2; region anchor, exact origin unknown }
    (param_1)^ := 0; { 8400:0BB2; region anchor, exact origin unknown }
    local_3 := 1; { 8400:0BD1 }
    iStack_6 := g_5D98; { 8400:0BD1; region anchor, exact origin unknown }
    local_8 := g_5D96; { 8400:0BDC }
    while ((local_8 <> 0) or else (iStack_6 <> 0)) do begin { 8400:0BDC; region anchor, exact origin unknown }
      if (($0 < (Ptr<ShortInt>((local_8 + $2C)))^) and then Seq((Ptr<ShortInt>((local_8 + $2C)))^ := ((Ptr<ShortInt>((local_8 + $2C)))^ + (-1)), ((Ptr<ShortInt>((local_8 + $2C)))^ = $0))) then begin { 8400:0BDC; region anchor, exact origin unknown }
        local_9 := 1; { 8400:0C05 }
        local_4 := FUN_8400_09e7(@local_9, UNK_unaff_SS, local_8, iStack_6); { 8400:0C15 }
        if (local_4 = $0) then begin { 8400:0C15; region anchor, exact origin unknown }
          local_4 := FUN_8400_0925(@local_9, UNK_unaff_SS, local_8, iStack_6); { 8400:0C2D }
        end; { 8400:0C2D; region anchor, exact origin unknown }
        Ptr<UnknownValue>(@g_6DCF)[local_3] := (local_4 * $3); { 8400:0C2D; region anchor, exact origin unknown }
      end; { 8400:0C2D; region anchor, exact origin unknown }
      piVar1 := Ptr<SmallInt>((local_8 + $104)); { 8400:0C2D; region anchor, exact origin unknown }
      iStack_6 := (Ptr<SmallInt>((local_8 + $106)))^; { 8400:0C2D; region anchor, exact origin unknown }
      local_3 := (local_3 + 1); { 8400:0C5E }
      local_8 := (piVar1)^; { 8400:0C58 }
    end; { 8400:0C58; region anchor, exact origin unknown }
  end; { 8400:0C58; region anchor, exact origin unknown }
  Exit; { 8400:0C67 }
end;
```

### ov20:0C9A RestParty (conf M)

Original `ov20_0C9A`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -30:2, -1E:2, -F:1, -E:1, -D:1, -C:1/2, -B:1, -5:2, -3:2, -1:1.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; uVar3: Word; extraout_AH_01: Byte; uVar7: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; uVar4: Word; uVar5: Word; uVar6: Word; uVar8: Word; unaff_SS: Word; puVar9: ^Byte; local_32: array[0..18-1] of Byte; local_20: array[0..15-1] of Byte; local_11: Byte; local_10: ShortInt; local_f: Byte; local_e: Byte; local_d: Byte; local_7: SmallInt; iStack_5: SmallInt; local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.FillChar, FUN_0709_0dd3, FUN_8400_05f0, FUN_8400_0721, Crt.KeyPressed, System.@StrCopy, stub_ov25_e5, stub_ov25_e3, FUN_8400_047a, AdvanceClock, FUN_8400_0871, FUN_8400_0b0a, FUN_8400_0bb2, stub_ov24_e8, FUN_00ba_17e3, FUN_0709_0626, FUN_0709_0dbe.

5-unit ticks; stop confirmation; healing/study; random encounters from VM region1+5A4/+5A6 interrupt. Returns 1 if interrupted. Evidence: decode/listings/ov20.lst at 8400:0C9A, paired .c.

```pascal
function ov20_0C9A(): Byte;
begin
  local_3 := 0; { 8400:0CA0 }
  local_11 := 0; { 8400:0CA4 }
  local_d := 1; { 8400:0CA8 }
  iStack_5 := g_5D98; { 8400:0CA8; region anchor, exact origin unknown }
  local_7 := g_5D96; { 8400:0CB3 }
  while ((local_7 <> 0) or else (iStack_5 <> 0)) do begin { 8400:0CB3; region anchor, exact origin unknown }
    Ptr<UnknownValue>(@g_6DCF)[local_d] := 0; { 8400:0CB3; region anchor, exact origin unknown }
    local_d := (local_d + 1); { 8400:0CCD }
    piVar1 := Ptr<SmallInt>((local_7 + $104)); { 8400:0CCD; region anchor, exact origin unknown }
    iStack_5 := (Ptr<SmallInt>((local_7 + $106)))^; { 8400:0CCD; region anchor, exact origin unknown }
    local_7 := (piVar1)^; { 8400:0CDD }
  end; { 8400:0CDD; region anchor, exact origin unknown }
  FillChar(FarPtr($0C7C, $471E), $48, LoByte(MakeWord(HiByte($48), $1))); { 8400:0CF1 }
  local_e := 0; { 8400:0CF6 }
  local_f := 0; { 8400:0CFA }
  FUN_0709_0dd3(MakeWord(UNK_extraout_AH, $16), MakeWord(UNK_extraout_AH, $26), MakeWord(UNK_extraout_AH, $11), MakeWord(UNK_extraout_AH, 1)); { 8400:0D0A }
  FUN_8400_05f0((Word(UNK_extraout_AH_00) shl 8)); { 8400:0D13 }
  g_6DDA := 1; { 8400:0D16 }
  cVar2 := FUN_8400_0721(); { 8400:0D1C }
  local_10 := (cVar2 = $0); { 8400:0D26 }
  while ((local_10 = $0) and then ((((g_6DCA <> 0) or else (g_6DC8 <> 0)) or else (g_6DC6 <> 0)) or else (g_6DC4 <> 0))) do begin { 8400:0D26; region anchor, exact origin unknown }
    uVar3 := KeyPressed(); { 8400:0D51 }
    if (ShortInt(uVar3) <> $0) then begin { 8400:0D51; region anchor, exact origin unknown }
      FUN_8400_05f0((uVar3 and $FF00)); { 8400:0D5E }
      puVar9 := local_20; { 8400:0D5E; region anchor, exact origin unknown }
      uVar8 := UNK_unaff_SS; { 8400:0D5E; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$1E))) := 'Stop Resting? '; { 8400:0D6B }
      cVar2 := stub_ov25_e5(MakeWord(UNK_extraout_AH_01, $F), MakeWord(UNK_extraout_AH_01, 10), MakeWord(UNK_extraout_AH_01, $D), puVar9, uVar8); { 8400:0D79 }
      if (cVar2 = $59) then begin { 8400:0D79; region anchor, exact origin unknown }
        local_10 := $1; { 8400:0D82 }
      end else begin { 8400:0D82; region anchor, exact origin unknown }
        stub_ov25_e3(); { 8400:0D88 }
      end; { 8400:0D88; region anchor, exact origin unknown }
    end; { 8400:0D88; region anchor, exact origin unknown }
    if (local_10 = $0) then begin { 8400:0D88; region anchor, exact origin unknown }
      uVar3 := FUN_8400_047a(1, 5); { 8400:0D9D }
      uVar7 := Byte((uVar3 shr 8)); { 8400:0D9D; region anchor, exact origin unknown }
      local_f := (local_f + 1); { 8400:0DA0 }
      if (4 < local_f) then begin { 8400:0DA0; region anchor, exact origin unknown }
        FUN_8400_05f0((uVar3 and $FF00)); { 8400:0DAD }
        local_f := 0; { 8400:0DB0 }
        uVar7 := UNK_extraout_AH_02; { 8400:0DB0; region anchor, exact origin unknown }
      end; { 8400:0DB0; region anchor, exact origin unknown }
      AdvanceClock(MakeWord(uVar7, 1), MakeWord(uVar7, 5)); { 8400:0DBB }
      FUN_8400_0871(); { 8400:0DBF }
      FUN_8400_0b0a(); { 8400:0DC3 }
      FUN_8400_0bb2(@local_e, UNK_unaff_SS); { 8400:0DCC }
      uVar8 := Word((LongWord(g_49D6) shr $10)); { 8400:0DCC; region anchor, exact origin unknown }
      if (((Ptr<SmallInt>((SmallInt(g_49D6) + $5A4)))^ <> 0) and then Seq(g_49FB := (g_49FB + 1), ((Ptr<Word>((SmallInt(g_49D6) + $5A4)))^ <= g_49FB))) then begin { 8400:0DCC; region anchor, exact origin unknown }
        g_49FB := 0; { 8400:0DDB }
        uVar3 := stub_ov24_e8(100, 1); { 8400:0DF8 }
        if ((uVar3 and $FF) <= (Ptr<Word>((SmallInt(g_49D6) + $5A6)))^) then begin { 8400:0DF8; region anchor, exact origin unknown }
          FUN_00ba_17e3(); { 8400:0E0A }
          FUN_8400_05f0((Word(UNK_extraout_AH_03) shl 8)); { 8400:0E13 }
          uVar4 := MakeWord(UNK_extraout_AH_04, 1); { 8400:0E13; region anchor, exact origin unknown }
          uVar5 := MakeWord(UNK_extraout_AH_04, $13); { 8400:0E13; region anchor, exact origin unknown }
          uVar6 := MakeWord(UNK_extraout_AH_04, $F); { 8400:0E13; region anchor, exact origin unknown }
          puVar9 := local_32; { 8400:0E13; region anchor, exact origin unknown }
          uVar8 := UNK_unaff_SS; { 8400:0E13; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$30))) := 'The Party is rudely interrupted!'; { 8400:0E29 }
          FUN_0709_0626(puVar9, uVar8, uVar6, uVar5, uVar4); { 8400:0E2E }
          local_10 := $1; { 8400:0E33 }
          local_3 := 1; { 8400:0E37 }
          FUN_0709_0dbe(); { 8400:0E3B }
        end; { 8400:0E3B; region anchor, exact origin unknown }
      end; { 8400:0E3B; region anchor, exact origin unknown }
    end; { 8400:0E3B; region anchor, exact origin unknown }
  end; { 8400:0E3B; region anchor, exact origin unknown }
  FUN_0709_0dd3($16, $26, $11, 1); { 8400:0E4F }
  g_6DDA := 0; { 8400:0E54 }
  Exit(local_3); { 8400:0E5F }
end;
```

### ov20:0E60 ov20_init (conf L)

Original `ov20_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov20.lst at 8400:0E60, paired .c.

```pascal
procedure ov20_init();
begin
  Exit; { 8400:0E64 }
end;
```

## ov21

### ov21:0000 CarryingCapacity (conf M)

Original `FUN_8900_0000`. Params (ABI order): param_1: Word; param_2: Word.
BP access inventory (hex offset:byte widths): -2:2, +6:2, +8:2.
Locals/SSA temporaries: iVar1: SmallInt.
Callers: ov21_0054,ov21_044C,ov21_063A.
Callees (listing): FUN_00ba_13ab.

Strength allowance plus 1500. Evidence: decode/listings/ov21.lst at 8900:0000, paired .c.

```pascal
function FUN_8900_0000(param_1: Word; param_2: Word): SmallInt;
begin
  iVar1 := FUN_00ba_13ab(param_1, param_2); { 8900:000C }
  Exit((iVar1 + $5DC)); { 8900:001D }
end;
```

### ov21:0020 SubtractCarriedWeight (conf M)

Original `FUN_8900_0020`. Params (ABI order): param_1: SmallInt; param_2: LongWord.
BP access inventory (hex offset:byte widths): +6:2, +8:2.
Locals/SSA temporaries: uVar1: Word.
Callers: ov21_044C,ov21_0508,ov21_0A01.
Callees (listing): none.

Character +102. Evidence: decode/listings/ov21.lst at 8900:0020, paired .c.

```pascal
procedure FUN_8900_0020(param_1: SmallInt; param_2: LongWord);
begin
  uVar1 := Word((LongWord(param_2) shr $10)); { 8900:0020; region anchor, exact origin unknown }
  (Ptr<SmallInt>((SmallInt(param_2) + $102)))^ := ((Ptr<SmallInt>((SmallInt(param_2) + $102)))^ - param_1); { 8900:0020; region anchor, exact origin unknown }
  Exit; { 8900:0037 }
end;
```

### ov21:003A AddCarriedWeight (conf M)

Original `FUN_8900_003a`. Params (ABI order): param_1: SmallInt; param_2: LongWord.
BP access inventory (hex offset:byte widths): +6:2, +8:2.
Locals/SSA temporaries: uVar1: Word.
Callers: FUN_8900_0203,FUN_8900_0a88,ov21_044C,ov21_063A.
Callees (listing): none.

Character +102. Evidence: decode/listings/ov21.lst at 8900:003A, paired .c.

```pascal
procedure FUN_8900_003a(param_1: SmallInt; param_2: LongWord);
begin
  uVar1 := Word((LongWord(param_2) shr $10)); { 8900:003A; region anchor, exact origin unknown }
  (Ptr<SmallInt>((SmallInt(param_2) + $102)))^ := ((Ptr<SmallInt>((SmallInt(param_2) + $102)))^ + param_1); { 8900:003A; region anchor, exact origin unknown }
  Exit; { 8900:0051 }
end;
```

### ov21:0054 CheckMoneyCapacity (conf M)

Original `ov21_0054`. Params (ABI order): param_1: ^SmallInt; param_2: SmallInt; param_3: LongWord.
BP access inventory (hex offset:byte widths): -1:1, +6:2, +A:2, +C:2, +E:2.
Locals/SSA temporaries: uVar1: Word; iVar2: SmallInt; local_3: Byte.
Callers: FUN_8900_0203,FUN_8900_0a88,ov21_063A,ov21_19B2.
Callees (listing): FUN_8900_0000.

Returns overload and capacity-limited amount. Evidence: decode/listings/ov21.lst at 8900:0054, paired .c.

```pascal
function ov21_0054(param_1: ^SmallInt; param_2: SmallInt; param_3: LongWord): Word;
begin
  uVar1 := FUN_8900_0000(SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 8900:0061 }
  local_3 := (Word(((Ptr<SmallInt>((SmallInt(param_3) + $102)))^ + param_2)) <= uVar1); { 8900:0075 }
  if local_3 then begin { 8900:0075; region anchor, exact origin unknown }
    iVar2 := 0; { 8900:0075; region anchor, exact origin unknown }
    (param_1)^ := 0; { 8900:0075; region anchor, exact origin unknown }
  end else begin { 8900:0075; region anchor, exact origin unknown }
    iVar2 := FUN_8900_0000(SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 8900:0080 }
    iVar2 := (iVar2 - (Ptr<SmallInt>((SmallInt(param_3) + $102)))^); { 8900:0080; region anchor, exact origin unknown }
    (param_1)^ := iVar2; { 8900:0080; region anchor, exact origin unknown }
  end; { 8900:0080; region anchor, exact origin unknown }
  local_3 := (not local_3); { 8900:0093 }
  Exit(MakeWord(ShortInt((Word(iVar2) shr 8)), local_3)); { 8900:00A5 }
end;
```

### ov21:00A8 MoneyValueInGold (conf M)

Original `ov21_00A8`. Params (ABI order): param_1: LongWord.
BP access inventory (hex offset:byte widths): -25:1, -24:2, -22:2, -20:2, -1E:2, -4:2, -2:2, +6:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; iVar3: SmallInt; unaff_SS: Word; bVar4: Boolean; local_27: ShortInt; local_26: Word; local_24: SmallInt; local_22: array[0..32-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@CopyBytes, System.@LongMul, System.@LongDivMod.

32-bit value conversion, five coin denominations; coefficients/table arithmetic retained. Evidence: decode/listings/ov21.lst at 8900:00A8, paired .c.

```pascal
function ov21_00A8(param_1: LongWord): LongWord;
begin
  Move(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6))), FarPtr(SS, BPAddr(-$20)), $1C); { 8900:00BC }
  local_26 := 0; { 8900:00C3 }
  local_24 := 0; { 8900:00C6 }
  local_27 := $0; { 8900:00C9 }
  while true do begin { 8900:00C9; region anchor, exact origin unknown }
    iVar3 := (Ptr<SmallInt>(((local_27 * 4) + $D26)))^; { 8900:00C9; region anchor, exact origin unknown }
    uVar1 := (MakeLong(MemWord(FarPtr($0C7C, ((MakeWord(HiByte(MakeWord(HiByte(0), BPByte(-$25))), BPByte(-$25)) shl $1) shl $1) + $D26)), MemWord(FarPtr($0C7C, ((MakeWord(HiByte(MakeWord(HiByte(0), BPByte(-$25))), BPByte(-$25)) shl $1) shl $1) + $D24))) * MakeLong(MemWord(FarPtr(SS, UNK_SP + ((MakeWord(HiByte(0), BPByte(-$25)) shl $1) shl $1) + -$1E)), MemWord(FarPtr(SS, UNK_SP + ((MakeWord(HiByte(0), BPByte(-$25)) shl $1) shl $1) + -$20)))); { 8900:00F4 }
    bVar4 := CARRY2(local_26, uVar1); { 8900:00F4; region anchor, exact origin unknown }
    local_26 := (local_26 + uVar1); { 8900:00F9 }
    local_24 := ((local_24 + iVar3) + Word(bVar4)); { 8900:00F9; region anchor, exact origin unknown }
    if (local_27 = $4) then begin { 8900:00F9; region anchor, exact origin unknown }
      Break; { 8900:00F9; region anchor, exact origin unknown }
    end; { 8900:00F9; region anchor, exact origin unknown }
    local_27 := (local_27 + $1); { 8900:00CF }
  end; { 8900:00CF; region anchor, exact origin unknown }
  local_24 := (local_24 + Word(($FF9B < local_26))); { 8900:00CF; region anchor, exact origin unknown }
  uVar2 := (MakeLong(BPWord(-$22), (BPWord(-$24) + $64)) div MakeLong(MemWord(FarPtr($0C7C, $D32)), MemWord(FarPtr($0C7C, $D30)))); { 8900:0119 }
  Exit(MakeLong(local_24, uVar2)); { 8900:012D }
end;
```

### ov21:0130 NormalizeCharacterMoney (conf M)

Original `ov21_0130`. Params (ABI order): param_1: Word.
BP access inventory (hex offset:byte widths): -1:1, +6:2.
Locals/SSA temporaries: local_3: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Platinum=gold div 5; gold remainder; clears other denominations. Evidence: decode/listings/ov21.lst at 8900:0130, paired .c.

```pascal
procedure ov21_0130(param_1: Word);
begin
  local_3 := $0; { 8900:0136 }
  while Seq((Ptr<Word>(((SmallInt(g_5D92) + (local_3 * 2)) + $88)))^ := 0, (local_3 <> $4)) do begin { 8900:0136; region anchor, exact origin unknown }
    local_3 := (local_3 + $1); { 8900:013C }
  end; { 8900:013C; region anchor, exact origin unknown }
  (Ptr<Word>((SmallInt(g_5D92) + $90)))^ := (param_1 div 5); { 8900:013C; region anchor, exact origin unknown }
  (Ptr<Word>((SmallInt(g_5D92) + $8E)))^ := (param_1 mod 5); { 8900:013C; region anchor, exact origin unknown }
  Exit; { 8900:0182 }
end;
```

### ov21:0185 NormalizePooledMoney (conf M)

Original `ov21_0185`. Params (ABI order): param_1: Word.
BP access inventory (hex offset:byte widths): -1:1, +6:2.
Locals/SSA temporaries: local_3: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

32-bit pooled denomination conversion. Evidence: decode/listings/ov21.lst at 8900:0185, paired .c.

```pascal
procedure ov21_0185(param_1: Word);
begin
  local_3 := $0; { 8900:018B }
  while true do begin { 8900:018B; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F4)[(local_3 * 2)] := 0; { 8900:018B; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F6)[(local_3 * 2)] := 0; { 8900:018B; region anchor, exact origin unknown }
    if (local_3 = $4) then begin { 8900:018B; region anchor, exact origin unknown }
      Break; { 8900:018B; region anchor, exact origin unknown }
    end; { 8900:018B; region anchor, exact origin unknown }
    local_3 := (local_3 + $1); { 8900:0191 }
  end; { 8900:0191; region anchor, exact origin unknown }
  g_6804 := (param_1 div 5); { 8900:01BA }
  g_6806 := 0; { 8900:01BD }
  g_6800 := (param_1 mod 5); { 8900:01CE }
  g_6802 := 0; { 8900:01D1 }
  Exit; { 8900:01D8 }
end;
```

### ov21:0203 CreditCharacterOrPool (conf M)

Original `FUN_8900_0203`. Params (ABI order): param_1: Word.
BP access inventory (hex offset:byte widths): -2A:2, -2:2, +6:2.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; unaff_SS: Word; bVar3: Boolean; puVar4: ^Byte; local_2c: array[0..40-1] of Byte; local_4: Word.
Callers: ov21_19B2.
Callees (listing): ov21_0054, System.@StrCopy, FUN_00ba_1693, FUN_8900_003a.

Capacity failure overflows to pool with message. Evidence: decode/listings/ov21.lst at 8900:0203, paired .c.

```pascal
procedure FUN_8900_0203(param_1: Word);
begin
  cVar2 := ov21_0054(@local_4, UNK_unaff_SS, param_1, g_5D92, g_5D94); { 8900:021A }
  if (cVar2 = $0) then begin { 8900:021A; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((SmallInt(g_5D92) + $90)); { 8900:021A; region anchor, exact origin unknown }
    (piVar1)^ := ((piVar1)^ + param_1); { 8900:021A; region anchor, exact origin unknown }
    FUN_8900_003a(param_1, g_5D92, g_5D94); { 8900:024D }
  end else begin { 8900:024D; region anchor, exact origin unknown }
    puVar4 := local_2c; { 8900:024D; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$2A))) := 'Overloaded.  Money will be put in Pool.'; { 8900:022B }
    FUN_00ba_1693(puVar4, UNK_unaff_SS); { 8900:0230 }
    piVar1 := Ptr<SmallInt>((SmallInt(g_5D92) + $90)); { 8900:0230; region anchor, exact origin unknown }
    (piVar1)^ := ((piVar1)^ + local_4); { 8900:0230; region anchor, exact origin unknown }
    FUN_8900_003a(local_4, g_5D92, g_5D94); { 8900:028B }
    bVar3 := CARRY2(param_1, g_6804); { 8900:028B; region anchor, exact origin unknown }
    param_1 := (param_1 + g_6804); { 8900:028B; region anchor, exact origin unknown }
    g_6804 := (param_1 - local_4); { 8900:026A }
    g_6806 := ((g_6806 + Word(bVar3)) - Word((param_1 < local_4))); { 8900:026D }
  end; { 8900:026D; region anchor, exact origin unknown }
  Exit; { 8900:0291 }
end;
```

### ov21:0294 ReadBoundedAmount (conf M)

Original `ov21_0294`. Params (ABI order): param_1: Byte; param_2: LongWord; param_3: Word.
BP access inventory (hex offset:byte widths): -244:2, -144:2, -44:2, -42:2, -40:2, -3E:2, -3C:1, -3B:1/2, -34:1/2, -2E:1, -2C:1, -2B:1/2, -2:2, +6:1, +8:2, +C:2.
Locals/SSA temporaries: extraout_AH: Byte; extraout_AH_00: Byte; uVar1: Word; bVar2: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; unaff_SS: Word; uVar3: LongWord; puVar4: ^Byte; puVar5: ^Byte; uVar6: Word; local_246: array[0..256-1] of Byte; local_146: array[0..256-1] of Byte; local_46: Word; local_44: array[0..2-1] of Byte; local_42: LongWord; local_3e: Byte; local_3d: array[0..7-1] of Byte; local_36: array[0..6-1] of ShortInt; local_30: ShortInt; local_2e: ShortInt; local_2d: array[0..43-1] of ShortInt.
Callers: ov21_0CEB.
Callees (listing): System.@StrAssign, FUN_0709_05eb, FUN_0709_0626, System.@StrLong, FUN_0899_0059, System.@StrCopy, System.@CharToStr, System.@StrAppend, System.@ValLong, System.Copy.

Digits, Backspace, Return/Escape; Val and bounds. Evidence: decode/listings/ov21.lst at 8900:0294, paired .c.

```pascal
function ov21_0294(param_1: Byte; param_2: LongWord; param_3: Word): Word;
begin
  PString(FarPtr(SS, BPAddr(-$2B))) := Copy(PString(FarPtr(FarSeg(BPWord($8)), FarOff(BPWord($8)))), 1, $28); { 8900:02A9 }
  FUN_0709_05eb(MakeWord(UNK_extraout_AH, $28), (Word(UNK_extraout_AH) shl 8), MakeWord(UNK_extraout_AH, $18), (Word(UNK_extraout_AH) shl 8)); { 8900:02BA }
  FUN_0709_0626(local_2d, UNK_unaff_SS, MakeWord(UNK_extraout_AH_00, param_1), MakeWord(UNK_extraout_AH_00, $18), (Word(UNK_extraout_AH_00) shl 8)); { 8900:02CE }
  local_30 := local_2d[0]; { 8900:02D6 }
  local_2e := local_2d[0]; { 8900:02DC }
  Str(LongInt(MakeLong(0, BPWord($C))), PString(FarPtr(SS, BPAddr(-$34)))); { 8900:02F2 }
  local_3d[0] := 0; { 8900:02F2; region anchor, exact origin unknown }
  repeat { 8900:02F2; region anchor, exact origin unknown }
    uVar1 := FUN_0899_0059(); { 8900:02FB }
    local_3e := Byte(uVar1); { 8900:0300 }
    bVar2 := Byte((Word(uVar1) shr 8)); { 8900:0300; region anchor, exact origin unknown }
    if ((local_3e < $30) or else ($39 < local_3e)) then begin { 8900:0300; region anchor, exact origin unknown }
      if ((local_3e = 8) and then (local_3d[0] <> 0)) then begin { 8900:0300; region anchor, exact origin unknown }
        puVar5 := local_146; { 8900:0300; region anchor, exact origin unknown }
        uVar1 := UNK_unaff_SS; { 8900:0300; region anchor, exact origin unknown }
        PString(UNK_hidden_string_result) := Copy(PString(FarPtr(SS, BPAddr(-$3B))), $1, (MakeWord(0, LoByte(MakeWord(HiByte($1), BPByte(-$3B)))) - 1)); { 8900:03CB }
        PString(FarPtr(SS, BPAddr(-$3B))) := Copy(PString(FarPtr(SS, BPAddr(-$144))), 1, $6); { 8900:0341 }
        FUN_0709_05eb(MakeWord(UNK_extraout_AH_03, 1), (Word(UNK_extraout_AH_03) shl 8), MakeWord(UNK_extraout_AH_03, $18), MakeWord(UNK_extraout_AH_03, local_2e)); { 8900:03EB }
        local_2e := (local_2e + (-1)); { 8900:03F0 }
        bVar2 := UNK_extraout_AH_04; { 8900:03F0; region anchor, exact origin unknown }
      end; { 8900:03F0; region anchor, exact origin unknown }
    end else begin { 8900:03F0; region anchor, exact origin unknown }
      puVar5 := local_146; { 8900:03F0; region anchor, exact origin unknown }
      uVar6 := UNK_unaff_SS; { 8900:03F0; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$144))) := PString(FarPtr(SS, BPAddr(-$3B))); { 8900:031F }
      puVar4 := local_246; { 8900:031F; region anchor, exact origin unknown }
      uVar1 := UNK_unaff_SS; { 8900:031F; region anchor, exact origin unknown }
      PString(UNK_hidden_string_result) := Chr(LoByte(MakeWord(UNK_extraout_AH_01, local_3e))); { 8900:032E }
      PString(FarPtr(SS, BPAddr(-$144))) := PString(FarPtr(SS, BPAddr(-$144))) + PString(FarPtr(SS, BPAddr(-$244))); { 8900:0333 }
      PString(FarPtr(SS, BPAddr(-$3B))) := Copy(PString(FarPtr(SS, BPAddr(-$34))), 1, $6); { 8900:037F }
      uVar3 := Val(PString(FarPtr(SS, BPAddr(-$3B))), UNK_long_result, FarPtr(SS, BPAddr(-$42))); { 8900:0350 }
      local_42 := uVar3; { 8900:0355 }
      if ((uVar3 < $80000000) and then (($FFFF < LongInt(uVar3)) or else (param_3 < Word(uVar3)))) then begin { 8900:0355; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$3B))) := Copy(PString(FarPtr(SS, BPAddr(-$144))), 1, $6); { 8900:03D9 }
        local_2e := (local_30 + local_36[0]); { 8900:0392 }
      end else begin { 8900:0392; region anchor, exact origin unknown }
        local_2e := (local_2e + $1); { 8900:036C }
      end; { 8900:036C; region anchor, exact origin unknown }
      FUN_0709_0626(local_3d, UNK_unaff_SS, $F, $18, local_30); { 8900:03A4 }
      bVar2 := UNK_extraout_AH_02; { 8900:03A4; region anchor, exact origin unknown }
    end; { 8900:03A4; region anchor, exact origin unknown }
  until not (((local_3e <> $D) and then (local_3e <> $1B))); { 8900:03A4; region anchor, exact origin unknown }
  FUN_0709_05eb(MakeWord(bVar2, $28), (Word(bVar2) shl 8), MakeWord(bVar2, $18), (Word(bVar2) shl 8)); { 8900:040E }
  if (local_3e = $1B) then begin { 8900:040E; region anchor, exact origin unknown }
    local_46 := 0; { 8900:041B }
  end else begin { 8900:041B; region anchor, exact origin unknown }
    local_46 := Val(PString(FarPtr(SS, BPAddr(-$3B))), UNK_long_result, FarPtr(SS, BPAddr(-$42))); { 8900:042A }
  end; { 8900:042A; region anchor, exact origin unknown }
  Exit(local_46); { 8900:043E }
end;
```

### ov21:044C CheckCapacityWithMessage (conf M)

Original `ov21_044C`. Params (ABI order): param_1: ShortInt; param_2: SmallInt; param_3: ^LongWord; param_4: ^LongWord.
BP access inventory (hex offset:byte widths): -B:2, +6:1, +8:2, +A:2, +E:2.
Locals/SSA temporaries: uVar1: Word; uVar2: Word; unaff_SS: Word; puVar3: ^Byte; local_d: array[0..11-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_8900_0000, FUN_8900_0020, FUN_8900_003a, System.@StrCopy, FUN_00ba_1693.

Overloaded warning. Evidence: decode/listings/ov21.lst at 8900:044C, paired .c.

```pascal
procedure ov21_044C(param_1: ShortInt; param_2: SmallInt; param_3: ^LongWord; param_4: ^LongWord);
begin
  uVar1 := FUN_8900_0000((Ptr<Word>(param_3))^, (Ptr<Word>((SmallInt(Ptr<LongWord>(param_3)) + 2)))^); { 8900:045D }
  if (uVar1 < Word(((Ptr<SmallInt>((SmallInt((param_3)^) + $102)))^ + param_2))) then begin { 8900:045D; region anchor, exact origin unknown }
    puVar3 := local_d; { 8900:045D; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$B))) := 'Overloaded'; { 8900:04F8 }
    FUN_00ba_1693(puVar3, UNK_unaff_SS); { 8900:04FD }
  end else begin { 8900:04FD; region anchor, exact origin unknown }
    (Ptr<SmallInt>(((SmallInt((param_4)^) + (param_1 * 2)) + $88)))^ := ((Ptr<SmallInt>(((SmallInt((param_4)^) + (param_1 * 2)) + $88)))^ - param_2); { 8900:04FD; region anchor, exact origin unknown }
    uVar2 := Word((LongWord(param_4) shr $10)); { 8900:04FD; region anchor, exact origin unknown }
    FUN_8900_0020(param_2, (Ptr<Word>(param_4))^, (Ptr<Word>((SmallInt(Ptr<LongWord>(param_4)) + 2)))^); { 8900:04AD }
    (Ptr<SmallInt>(((SmallInt((param_3)^) + (param_1 * 2)) + $88)))^ := ((Ptr<SmallInt>(((SmallInt((param_3)^) + (param_1 * 2)) + $88)))^ + param_2); { 8900:04AD; region anchor, exact origin unknown }
    FUN_8900_003a(param_2, (Ptr<Word>(param_4))^, (Ptr<Word>((SmallInt(Ptr<LongWord>(param_4)) + 2)))^); { 8900:04E9 }
  end; { 8900:04E9; region anchor, exact origin unknown }
  Exit; { 8900:0505 }
end;
```

### ov21:0508 PoolPartyMoney (conf M)

Original `ov21_0508`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -6:1, -5:1, -4:2, -2:2.
Locals/SSA temporaries: piVar1: ^SmallInt; uVar2: Word; iVar3: SmallInt; uVar4: Word; local_7: ShortInt; local_6: SmallInt; iStack_4: SmallInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_8900_0020, System.FillChar.

Seven denominations including gems/jewelry; eligible NPC flags 0/B3; subtract weight. Evidence: decode/listings/ov21.lst at 8900:0508, paired .c.

```pascal
procedure ov21_0508();
begin
  iStack_4 := g_5D98; { 8900:0508; region anchor, exact origin unknown }
  g_6DC0 := 1; { 8900:051B }
  local_6 := g_5D96; { 8900:0515 }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do begin { 8900:0515; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((local_6 + $84)))^ = $0) or else ((Ptr<ShortInt>((local_6 + $84)))^ = (-$4D))) then begin { 8900:0515; region anchor, exact origin unknown }
      local_7 := $0; { 8900:0544 }
      while true do begin { 8900:0544; region anchor, exact origin unknown }
        uVar2 := Ptr<Word>(@g_67F4)[(local_7 * 2)]; { 8900:0544; region anchor, exact origin unknown }
        iVar3 := Ptr<Word>(@g_67F6)[(local_7 * 2)]; { 8900:0544; region anchor, exact origin unknown }
        uVar4 := (Ptr<Word>(((local_6 + (local_7 * 2)) + $88)))^; { 8900:0544; region anchor, exact origin unknown }
        Ptr<Word>(@g_67F4)[(local_7 * 2)] := (uVar4 + uVar2); { 8900:0544; region anchor, exact origin unknown }
        Ptr<Word>(@g_67F6)[(local_7 * 2)] := (iVar3 + Word(CARRY2(uVar4, uVar2))); { 8900:0544; region anchor, exact origin unknown }
        FUN_8900_0020((Ptr<Word>(((local_6 + (local_7 * 2)) + $88)))^, local_6, iStack_4); { 8900:05A8 }
        if (local_7 = $6) then begin { 8900:05A8; region anchor, exact origin unknown }
          Break; { 8900:05A8; region anchor, exact origin unknown }
        end; { 8900:05A8; region anchor, exact origin unknown }
        local_7 := (local_7 + $1); { 8900:054A }
      end; { 8900:054A; region anchor, exact origin unknown }
      FillChar(FarPtr(FarSeg(BPWord(-$4)), (FarOff(BPWord(-$4)) + $88)), $E, LoByte(MakeWord(HiByte($E), $0))); { 8900:05C1 }
    end; { 8900:05C1; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_6 + $104)); { 8900:05C1; region anchor, exact origin unknown }
    iStack_4 := (Ptr<SmallInt>((local_6 + $106)))^; { 8900:05C1; region anchor, exact origin unknown }
    local_6 := (piVar1)^; { 8900:05D3 }
  end; { 8900:05D3; region anchor, exact origin unknown }
  Exit; { 8900:05DF }
end;
```

### ov21:05E0 CountMoneySharingMembers (conf M)

Original `FUN_8900_05e0`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -6:1, -5:2, -3:2, -1:1.
Locals/SSA temporaries: piVar1: ^SmallInt; local_8: Byte; local_7: Word; uStack_5: Word.
Callers: ov21_063A.
Callees (listing): none.

Counts eligible members. Evidence: decode/listings/ov21.lst at 8900:05E0, paired .c.

```pascal
function FUN_8900_05e0(): ShortInt;
begin
  uStack_5 := g_5D98; { 8900:05E0; region anchor, exact origin unknown }
  local_8 := $0; { 8900:05F3 }
  local_7 := g_5D96; { 8900:05ED }
  while ((local_7 <> 0) or else (uStack_5 <> 0)) do begin { 8900:05ED; region anchor, exact origin unknown }
    if (((Ptr<ShortInt>((local_7 + $84)))^ = $0) or else ((Ptr<ShortInt>((local_7 + $84)))^ = (-$4D))) then begin { 8900:05ED; region anchor, exact origin unknown }
      local_8 := (local_8 + $1); { 8900:0615 }
    end; { 8900:0615; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_7 + $104)); { 8900:0615; region anchor, exact origin unknown }
    uStack_5 := (Ptr<SmallInt>((local_7 + $106)))^; { 8900:0615; region anchor, exact origin unknown }
    local_7 := (piVar1)^; { 8900:0625 }
  end; { 8900:0625; region anchor, exact origin unknown }
  Exit(local_8); { 8900:0639 }
end;
```

### ov21:063A SharePooledMoney (conf M)

Original `ov21_063A`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -29:1, -28:2, -1A:2, -C:2, -A:1, -9:1, -4:2, -2:2.
Locals/SSA temporaries: piVar1: ^SmallInt; cVar2: ShortInt; iVar3: SmallInt; uVar4: Word; unaff_SS: Word; local_2b: ShortInt; local_2a: array[0..7-1] of Word; local_1c: array[0..7-1] of SmallInt; local_e: Word; local_c: Byte; local_b: Byte; local_6: SmallInt; iStack_4: SmallInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_8900_05e0, System.FillChar, System.@LongDivMod, ov21_0054, FUN_8900_003a, FUN_8900_0000.

Quotient/remainder sharing constrained by capacity; zero-eligible guard unresolved. Evidence: decode/listings/ov21.lst at 8900:063A, paired .c.

```pascal
procedure ov21_063A();
begin
  local_6 := g_5D96; { 8900:0647 }
  iStack_4 := g_5D98; { 8900:0647; region anchor, exact origin unknown }
  local_c := 0; { 8900:064D }
  local_b := FUN_8900_05e0(); { 8900:0652 }
  FillChar(FarPtr(SS, BPAddr(-$1A)), $E, LoByte(MakeWord(HiByte($E), $0))); { 8900:0664 }
  FillChar(FarPtr(SS, BPAddr(-$28)), $E, LoByte(MakeWord(HiByte($E), $0))); { 8900:0675 }
  local_2b := $0; { 8900:067A }
  while true do begin { 8900:067A; region anchor, exact origin unknown }
    if ((SmallInt(Ptr<Word>(@g_67F6)[(local_2b * 2)]) < 1) and then ((SmallInt(Ptr<Word>(@g_67F6)[(local_2b * 2)]) < 0) or else (Ptr<Word>(@g_67F4)[(local_2b * 2)] = 0))) then begin { 8900:067A; region anchor, exact origin unknown }
      local_1c[local_2b] := 0; { 8900:067A; region anchor, exact origin unknown }
      local_2a[local_2b] := 0; { 8900:067A; region anchor, exact origin unknown }
    end else begin { 8900:067A; region anchor, exact origin unknown }
      iVar3 := (MakeLong(MemWord(FarPtr($0C7C, ((UNK_AX shl $1) shl $1) + $67F6)), MemWord(FarPtr($0C7C, ((UNK_AX shl $1) shl $1) + $67F4))) div MakeLong(0, MakeWord(0, LoByte(MakeWord(HiByte(MakeWord(HiByte(UNK_RET_0675_AX), BPByte(-$29))), BPByte(-$9)))))); { 8900:06BA }
      local_1c[local_2b] := iVar3; { 8900:06BA; region anchor, exact origin unknown }
      uVar4 := Word(local_b); { 8900:06BA; region anchor, exact origin unknown }
      (MakeLong(MemWord(FarPtr($0C7C, ((UNK_AX shl $1) shl $1) + $67F6)), MemWord(FarPtr($0C7C, ((UNK_AX shl $1) shl $1) + $67F4))) div MakeLong(0, MakeWord(0, LoByte(MakeWord(HiByte(MakeWord(HiByte(UNK_RET_06BA_AX), BPByte(-$29))), BPByte(-$9)))))); { 8900:06E9 }
      local_2a[local_2b] := uVar4; { 8900:06E9; region anchor, exact origin unknown }
    end; { 8900:06E9; region anchor, exact origin unknown }
    if (local_2b = $6) then begin { 8900:06E9; region anchor, exact origin unknown }
      Break; { 8900:06E9; region anchor, exact origin unknown }
    end; { 8900:06E9; region anchor, exact origin unknown }
    local_2b := (local_2b + $1); { 8900:073D }
  end; { 8900:073D; region anchor, exact origin unknown }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do begin { 8900:073D; region anchor, exact origin unknown }
    if ((Ptr<Byte>((local_6 + $84)))^ < $80) then begin { 8900:073D; region anchor, exact origin unknown }
      local_2b := $6; { 8900:0743 }
      while true do begin { 8900:0743; region anchor, exact origin unknown }
        cVar2 := ov21_0054(@local_e, UNK_unaff_SS, local_1c[local_2b], local_6, iStack_4); { 8900:075D }
        if (cVar2 = $0) then begin { 8900:075D; region anchor, exact origin unknown }
          (Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ := (local_1c[local_2b] + (Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^); { 8900:075D; region anchor, exact origin unknown }
          FUN_8900_003a(local_1c[local_2b], local_6, iStack_4); { 8900:07A8 }
          if ((local_2a[local_2b] <> 0) and then Seq(cVar2 := ov21_0054(@local_e, UNK_unaff_SS, local_2a[local_2b], local_6, iStack_4), (cVar2 = $0))) then begin { 8900:07D0 }
            (Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ := ((Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ + 1); { 8900:07D0; region anchor, exact origin unknown }
            FUN_8900_003a(1, local_6, iStack_4); { 8900:0805 }
            local_2a[local_2b] := (local_2a[local_2b] - 1); { 8900:0805; region anchor, exact origin unknown }
          end; { 8900:0805; region anchor, exact origin unknown }
        end else begin { 8900:0805; region anchor, exact origin unknown }
          (Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ := ((Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ + local_e); { 8900:0805; region anchor, exact origin unknown }
          local_2a[local_2b] := ((local_2a[local_2b] + local_1c[local_2b]) - local_e); { 8900:0805; region anchor, exact origin unknown }
          FUN_8900_003a(local_e, local_6, iStack_4); { 8900:086C }
        end; { 8900:086C; region anchor, exact origin unknown }
        if (local_2b = $0) then begin { 8900:086C; region anchor, exact origin unknown }
          Break; { 8900:086C; region anchor, exact origin unknown }
        end; { 8900:086C; region anchor, exact origin unknown }
        local_2b := (local_2b + (-1)); { 8900:088E }
      end; { 8900:088E; region anchor, exact origin unknown }
    end; { 8900:088E; region anchor, exact origin unknown }
    piVar1 := Ptr<SmallInt>((local_6 + $104)); { 8900:088E; region anchor, exact origin unknown }
    iStack_4 := (Ptr<SmallInt>((local_6 + $106)))^; { 8900:088E; region anchor, exact origin unknown }
    local_6 := (piVar1)^; { 8900:0885 }
  end; { 8900:0885; region anchor, exact origin unknown }
  local_2b := $6; { 8900:0894 }
  while true do begin { 8900:0894; region anchor, exact origin unknown }
    if (local_2a[local_2b] <> 0) then begin { 8900:0894; region anchor, exact origin unknown }
      iStack_4 := g_5D98; { 8900:0894; region anchor, exact origin unknown }
      local_6 := g_5D96; { 8900:08AF }
      while ((local_6 <> 0) or else (iStack_4 <> 0)) do begin { 8900:08AF; region anchor, exact origin unknown }
        iVar3 := FUN_8900_0000(local_6, iStack_4); { 8900:08C7 }
        local_e := (iVar3 - (Ptr<SmallInt>((local_6 + $102)))^); { 8900:08D2 }
        if (local_e <> 0) then begin { 8900:08D2; region anchor, exact origin unknown }
          if (local_e < local_2a[local_2b]) then begin { 8900:08D2; region anchor, exact origin unknown }
            (Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ := ((Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ + local_e); { 8900:08D2; region anchor, exact origin unknown }
            FUN_8900_003a(local_e, local_6, iStack_4); { 8900:091D }
            local_2a[local_2b] := (local_2a[local_2b] - local_e); { 8900:091D; region anchor, exact origin unknown }
          end else begin { 8900:091D; region anchor, exact origin unknown }
            (Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ := ((Ptr<SmallInt>(((local_6 + (local_2b * 2)) + $88)))^ + local_2a[local_2b]); { 8900:091D; region anchor, exact origin unknown }
            FUN_8900_003a(local_2a[local_2b], local_6, iStack_4); { 8900:097E }
            local_2a[local_2b] := 0; { 8900:097E; region anchor, exact origin unknown }
          end; { 8900:097E; region anchor, exact origin unknown }
        end; { 8900:097E; region anchor, exact origin unknown }
        piVar1 := Ptr<SmallInt>((local_6 + $104)); { 8900:097E; region anchor, exact origin unknown }
        iStack_4 := (Ptr<SmallInt>((local_6 + $106)))^; { 8900:097E; region anchor, exact origin unknown }
        local_6 := (piVar1)^; { 8900:099B }
      end; { 8900:099B; region anchor, exact origin unknown }
    end; { 8900:099B; region anchor, exact origin unknown }
    if (local_2b = $0) then begin { 8900:099B; region anchor, exact origin unknown }
      Break; { 8900:099B; region anchor, exact origin unknown }
    end; { 8900:099B; region anchor, exact origin unknown }
    local_2b := (local_2b + (-1)); { 8900:09B2 }
  end; { 8900:09B2; region anchor, exact origin unknown }
  g_6DC0 := 0; { 8900:09AD }
  local_2b := $0; { 8900:09B8 }
  while true do begin { 8900:09B8; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F4)[(local_2b * 2)] := local_2a[local_2b]; { 8900:09B8; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F6)[(local_2b * 2)] := 0; { 8900:09B8; region anchor, exact origin unknown }
    if ((Ptr<Word>(@g_67F4)[(local_2b * 2)] <> 0) or else (Ptr<Word>(@g_67F6)[(local_2b * 2)] <> 0)) then begin { 8900:09B8; region anchor, exact origin unknown }
      g_6DC0 := 1; { 8900:09F2 }
    end; { 8900:09F2; region anchor, exact origin unknown }
    if (local_2b = $6) then begin { 8900:09F2; region anchor, exact origin unknown }
      Break; { 8900:09F2; region anchor, exact origin unknown }
    end; { 8900:09F2; region anchor, exact origin unknown }
    local_2b := (local_2b + $1); { 8900:0680 }
  end; { 8900:0680; region anchor, exact origin unknown }
  Exit; { 8900:0A00 }
end;
```

### ov21:0A01 AddTreasureMoney (conf M)

Original `ov21_0A01`. Params (ABI order): param_1: ShortInt; param_2: Word; param_3: LongWord.
BP access inventory (hex offset:byte widths): +6:1, +8:2, +A:2, +C:2.
Locals/SSA temporaries: uVar1: Word; iVar2: SmallInt; uVar3: Word.
Callers: none exported; indirect callback use unknown.
Callees (listing): FUN_8900_0020.

Money pooling mode flags. Evidence: decode/listings/ov21.lst at 8900:0A01, paired .c.

```pascal
procedure ov21_0A01(param_1: ShortInt; param_2: Word; param_3: LongWord);
begin
  uVar3 := Word((LongWord(param_3) shr $10)); { 8900:0A01; region anchor, exact origin unknown }
  iVar2 := SmallInt(param_3); { 8900:0A01; region anchor, exact origin unknown }
  (Ptr<SmallInt>(((iVar2 + (param_1 * 2)) + $88)))^ := ((Ptr<SmallInt>(((iVar2 + (param_1 * 2)) + $88)))^ - param_2); { 8900:0A01; region anchor, exact origin unknown }
  FUN_8900_0020(param_2, iVar2, uVar3); { 8900:0A33 }
  if ((g_49F3 = $6) or else (g_49F3 = $1)) then begin { 8900:0A33; region anchor, exact origin unknown }
    uVar1 := Ptr<Word>(@g_67F4)[(param_1 * 2)]; { 8900:0A33; region anchor, exact origin unknown }
    iVar2 := Ptr<Word>(@g_67F6)[(param_1 * 2)]; { 8900:0A33; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F4)[(param_1 * 2)] := (uVar1 + param_2); { 8900:0A33; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F6)[(param_1 * 2)] := (iVar2 + Word(CARRY2(uVar1, param_2))); { 8900:0A33; region anchor, exact origin unknown }
  end; { 8900:0A33; region anchor, exact origin unknown }
  Exit; { 8900:0A7A }
end;
```

### ov21:0A88 TakePooledMoney (conf M)

Original `FUN_8900_0a88`. Params (ABI order): param_1: ShortInt; param_2: Word; param_3: LongWord.
BP access inventory (hex offset:byte widths): -D:2, -2:2, +6:1, +8:2, +A:2, +C:2.
Locals/SSA temporaries: uVar1: Word; iVar2: SmallInt; cVar3: ShortInt; unaff_SS: Word; puVar4: ^Byte; local_f: array[0..11-1] of Byte; local_4: array[0..2-1] of Byte.
Callers: ov21_0CEB.
Callees (listing): ov21_0054, System.@StrCopy, FUN_00ba_1693, FUN_8900_003a.

Bounds by pool and carrying capacity. Evidence: decode/listings/ov21.lst at 8900:0A88, paired .c.

```pascal
procedure FUN_8900_0a88(param_1: ShortInt; param_2: Word; param_3: LongWord);
begin
  cVar3 := ov21_0054(local_4, UNK_unaff_SS, param_2, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 8900:0A9D }
  if (cVar3 = $0) then begin { 8900:0A9D; region anchor, exact origin unknown }
    if (($7FFF < Word(Ptr<Word>(@g_67F6)[(param_1 * 2)])) or else ((SmallInt(Ptr<Word>(@g_67F6)[(param_1 * 2)]) < 1) and then (Word(Ptr<Word>(@g_67F4)[(param_1 * 2)]) < param_2))) then begin { 8900:0A9D; region anchor, exact origin unknown }
      param_2 := Ptr<Word>(@g_67F4)[(param_1 * 2)]; { 8900:0A9D; region anchor, exact origin unknown }
    end; { 8900:0A9D; region anchor, exact origin unknown }
    uVar1 := Ptr<Word>(@g_67F4)[(param_1 * 2)]; { 8900:0A9D; region anchor, exact origin unknown }
    iVar2 := Ptr<Word>(@g_67F6)[(param_1 * 2)]; { 8900:0A9D; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F4)[(param_1 * 2)] := (uVar1 - param_2); { 8900:0A9D; region anchor, exact origin unknown }
    Ptr<Word>(@g_67F6)[(param_1 * 2)] := (iVar2 - Word((uVar1 < param_2))); { 8900:0A9D; region anchor, exact origin unknown }
    (Ptr<SmallInt>(((SmallInt(param_3) + (param_1 * 2)) + $88)))^ := ((Ptr<SmallInt>(((SmallInt(param_3) + (param_1 * 2)) + $88)))^ + param_2); { 8900:0A9D; region anchor, exact origin unknown }
    FUN_8900_003a(param_2, SmallInt(param_3), ExtractBytes(param_3, 2, 2)); { 8900:0B51 }
  end else begin { 8900:0B51; region anchor, exact origin unknown }
    puVar4 := local_f; { 8900:0B51; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$D))) := 'Overloaded'; { 8900:0AAE }
    FUN_00ba_1693(puVar4, UNK_unaff_SS); { 8900:0AB3 }
  end; { 8900:0AB3; region anchor, exact origin unknown }
  Exit; { 8900:0B57 }
end;
```

### ov21:0B93 SelectDenomination (conf M)

Original `ov21_0B93`. Params (ABI order): param_1: LongWord; param_2: LongWord.
BP access inventory (hex offset:byte widths): -102:1, -101:1/2, -1:1, +6:2, +A:2.
Locals/SSA temporaries: cVar1: ShortInt; uVar2: Byte; extraout_AH: Byte; extraout_AH_00: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; uVar3: Word; uVar4: Word; unaff_SS: Word; local_104: Byte; local_103: array[0..256-1] of ShortInt; local_3: Byte.
Callers: ov21_0CEB.
Callees (listing): System.@StrAssign, System.UpCase.

Gems/Gold/Platinum/Electrum/Silver/Copper/Jewelry; G choices distinguished by second character. Evidence: decode/listings/ov21.lst at 8900:0B93, paired .c.

```pascal
function ov21_0B93(param_1: LongWord; param_2: LongWord): Word;
begin
  PString(FarPtr(SS, BPAddr(-$101))) := Copy(PString(FarPtr(FarSeg(BPWord($A)), FarOff(BPWord($A)))), 1, $FF); { 8900:0BA9 }
  local_104 := 1; { 8900:0BAE }
  while (local_103[local_104] = $20) do begin { 8900:0BAE; region anchor, exact origin unknown }
    local_104 := (local_104 + 1); { 8900:0BC2 }
  end; { 8900:0BC2; region anchor, exact origin unknown }
  cVar1 := local_103[local_104]; { 8900:0BC2; region anchor, exact origin unknown }
  uVar2 := 0; { 8900:0BC2; region anchor, exact origin unknown }
  uVar3 := Word(param_1); { 8900:0BC2; region anchor, exact origin unknown }
  uVar4 := Word((LongWord(param_1) shr $10)); { 8900:0BC2; region anchor, exact origin unknown }
  if (cVar1 = $47) then begin { 8900:0BC2; region anchor, exact origin unknown }
    cVar1 := UpCase(MakeWord(ShortInt(((local_104 + 1) shr 8)), local_103[(local_104 + 1)])); { 8900:0BE6 }
    if (cVar1 = $45) then begin { 8900:0BE6; region anchor, exact origin unknown }
      local_3 := 5; { 8900:0BEF }
      PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('Gems ', 1, $FF); { 8900:0C01 }
      uVar2 := UNK_extraout_AH; { 8900:0C01; region anchor, exact origin unknown }
    end else begin { 8900:0C01; region anchor, exact origin unknown }
      PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('Gold ', 1, $FF); { 8900:0C16 }
      local_3 := 3; { 8900:0C1B }
      uVar2 := UNK_extraout_AH_00; { 8900:0C1B; region anchor, exact origin unknown }
    end; { 8900:0C1B; region anchor, exact origin unknown }
  end else begin { 8900:0C1B; region anchor, exact origin unknown }
    if (cVar1 = $50) then begin { 8900:0C1B; region anchor, exact origin unknown }
      PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('Platinum ', 1, $FF); { 8900:0C34 }
      local_3 := 4; { 8900:0C39 }
      uVar2 := UNK_extraout_AH_01; { 8900:0C39; region anchor, exact origin unknown }
    end else begin { 8900:0C39; region anchor, exact origin unknown }
      if (cVar1 = $45) then begin { 8900:0C39; region anchor, exact origin unknown }
        PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('electrum ', 1, $FF); { 8900:0C51 }
        local_3 := 2; { 8900:0C56 }
        uVar2 := UNK_extraout_AH_02; { 8900:0C56; region anchor, exact origin unknown }
      end else begin { 8900:0C56; region anchor, exact origin unknown }
        if (cVar1 = $53) then begin { 8900:0C56; region anchor, exact origin unknown }
          PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('silver ', 1, $FF); { 8900:0C6E }
          local_3 := 1; { 8900:0C73 }
          uVar2 := UNK_extraout_AH_03; { 8900:0C73; region anchor, exact origin unknown }
        end else begin { 8900:0C73; region anchor, exact origin unknown }
          if (cVar1 = $43) then begin { 8900:0C73; region anchor, exact origin unknown }
            PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('Copper ', 1, $FF); { 8900:0C8B }
            local_3 := 0; { 8900:0C90 }
            uVar2 := UNK_extraout_AH_04; { 8900:0C90; region anchor, exact origin unknown }
          end else begin { 8900:0C90; region anchor, exact origin unknown }
            if (cVar1 = $4A) then begin { 8900:0C90; region anchor, exact origin unknown }
              PString(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6)))) := Copy('Jewelry ', 1, $FF); { 8900:0CA8 }
              local_3 := 6; { 8900:0CAD }
              uVar2 := UNK_extraout_AH_05; { 8900:0CAD; region anchor, exact origin unknown }
            end; { 8900:0CAD; region anchor, exact origin unknown }
          end; { 8900:0CAD; region anchor, exact origin unknown }
        end; { 8900:0CAD; region anchor, exact origin unknown }
      end; { 8900:0CAD; region anchor, exact origin unknown }
    end; { 8900:0CAD; region anchor, exact origin unknown }
  end; { 8900:0CAD; region anchor, exact origin unknown }
  Exit(MakeWord(uVar2, local_3)); { 8900:0CB7 }
end;
```

### ov21:0CEB TakeMoneyMenu (conf M)

Original `ov21_0CEB`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -219:2, -12E:2, -12D:2, -11A:2, -119:1, -118:1/2, -117:1, -116:2, -114:2, -14:2, -12:2, -10:2, -E:2, -C:2, -A:2, -8:2, -6:2, -2:1, -1:1.
Locals/SSA temporaries: in_AX: Word; uVar1: Word; uVar2: Word; uVar3: Word; uVar4: Word; iVar5: SmallInt; uVar6: Word; extraout_AH: Byte; uVar8: Word; unaff_SS: Word; lVar9: LongInt; puVar10: ^Byte; uVar11: Word; puVar12: ^Byte; local_21b: array[0..235-1] of Byte; local_130: Byte; local_12f: array[0..19-1] of Byte; local_11c: Byte; local_11b: ShortInt; local_11a: Byte; local_119: ShortInt; local_118: Word; local_116: array[0..256-1] of Byte; local_16: Word; local_14: SmallInt; local_12: LongWord; local_e: LongWord; local_a: LongWord; local_4: ShortInt; local_3: ShortInt; bVar7: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_03f1_02e8, System.GetMem, System.@StrLong, System.@StrAppend, System.@StrAssign, stub_ov25_e4, ov21_0B93, ov21_0294, FUN_8900_0a88, stub_ov25_e7.

Denomination and quantity menu. Evidence: decode/listings/ov21.lst at 8900:0CEB, paired .c.

```pascal
procedure ov21_0CEB();
begin
  bVar7 := Byte((Word(UNK_in_AX) shr 8)); { 8900:0CEB; region anchor, exact origin unknown }
  uVar1 := MakeWord(bVar7, 1); { 8900:0CEB; region anchor, exact origin unknown }
  uVar2 := MakeWord(bVar7, 1); { 8900:0CEB; region anchor, exact origin unknown }
  uVar3 := MakeWord(bVar7, $26); { 8900:0CEB; region anchor, exact origin unknown }
  uVar4 := MakeWord(bVar7, $16); { 8900:0CEB; region anchor, exact origin unknown }
  iVar5 := (Word(bVar7) shl 8); { 8900:0CEB; region anchor, exact origin unknown }
  uVar6 := MakeWord(bVar7, 10); { 8900:0CEB; region anchor, exact origin unknown }
  puVar10 := @local_11c; { 8900:0CEB; region anchor, exact origin unknown }
  uVar11 := UNK_unaff_SS; { 8900:0CEB; region anchor, exact origin unknown }
  PString(FarPtr(SS, BPAddr(-$11A))) := ''; { 8900:0D0F }
  uVar8 := $3F1; { 8900:0D0F; region anchor, exact origin unknown }
  FUN_03f1_02e8(puVar10, uVar11, uVar6, iVar5, uVar4, uVar3, uVar2, uVar1); { 8900:0D14 }
  local_16 := 0; { 8900:0D1B }
  repeat { 8900:0D1B; region anchor, exact origin unknown }
    local_11a := 1; { 8900:0D1E }
    local_a := 0; { 8900:0D25 }
    local_e := 0; { 8900:0D2D }
    local_3 := $6; { 8900:0D33 }
    while true do begin { 8900:0D33; region anchor, exact origin unknown }
      if ((0 < SmallInt(Ptr<Word>(@g_67F6)[(local_3 * 2)])) or else (((-1) < SmallInt(Ptr<Word>(@g_67F6)[(local_3 * 2)])) and then (Ptr<Word>(@g_67F4)[(local_3 * 2)] <> 0))) then begin { 8900:0D33; region anchor, exact origin unknown }
        local_14 := (local_14 + 1); { 8900:0D5C }
        if (local_a = 0) then begin { 8900:0D5C; region anchor, exact origin unknown }
          lVar9 := GetMem($2E); { 8900:0D6B }
          uVar11 := Word((LongWord(lVar9) shr $10)); { 8900:0D6B; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(lVar9) + $2A)))^ := 0; { 8900:0D6B; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(lVar9) + $2C)))^ := 0; { 8900:0D6B; region anchor, exact origin unknown }
        end else begin { 8900:0D6B; region anchor, exact origin unknown }
          local_e := local_a; { 8900:0D8B }
          lVar9 := GetMem($2E); { 8900:0D95 }
          uVar11 := Word((LongWord(lVar9) shr $10)); { 8900:0D95; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(lVar9) + $2A)))^ := Word(local_e); { 8900:0D95; region anchor, exact origin unknown }
          (Ptr<Word>((SmallInt(lVar9) + $2C)))^ := ExtractBytes(local_e, 2, 2); { 8900:0D95; region anchor, exact origin unknown }
        end; { 8900:0D95; region anchor, exact origin unknown }
        local_a := lVar9; { 8900:0D9A }
        Str(LongInt(MakeLong(MemWord(FarPtr($0C7C, ((MakeWord(HiByte(BPWord(-$C)), BPByte(-$1)) shl $1) shl $1) + $67F6)), MemWord(FarPtr($0C7C, ((MakeWord(HiByte(BPWord(-$C)), BPByte(-$1)) shl $1) shl $1) + $67F4)))), PString(FarPtr(SS, BPAddr(-$114)))); { 8900:0DD0 }
        puVar10 := local_21b; { 8900:0DD0; region anchor, exact origin unknown }
        uVar11 := UNK_unaff_SS; { 8900:0DD0; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$219))) := PString(FarPtr($C7C, ((local_3 * $B) + $FFA))); { 8900:0DEC }
        PString(FarPtr(SS, BPAddr(-$219))) := PString(FarPtr(SS, BPAddr(-$219))) + ' '; { 8900:0DF6 }
        PString(FarPtr(SS, BPAddr(-$219))) := PString(FarPtr(SS, BPAddr(-$219))) + PString(FarPtr(SS, BPAddr(-$114))); { 8900:0E01 }
        uVar8 := $AF8; { 8900:0E01; region anchor, exact origin unknown }
        StrAssign($28, local_a, puVar10, uVar11); { 8900:0E0F }
        (Ptr<Byte>((SmallInt(local_a) + $29)))^ := 0; { 8900:0E0F; region anchor, exact origin unknown }
      end; { 8900:0E0F; region anchor, exact origin unknown }
      if (local_3 = $0) then begin { 8900:0E0F; region anchor, exact origin unknown }
        Break; { 8900:0E0F; region anchor, exact origin unknown }
      end; { 8900:0E0F; region anchor, exact origin unknown }
      local_3 := (local_3 + (-1)); { 8900:0D39 }
    end; { 8900:0D39; region anchor, exact origin unknown }
    puVar10 := local_12f; { 8900:0D39; region anchor, exact origin unknown }
    uVar1 := UNK_unaff_SS; { 8900:0D39; region anchor, exact origin unknown }
    local_12 := local_a; { 8900:0E37 }
    local_e := local_a; { 8900:0E2B }
    PString(FarPtr(SS, BPAddr(-$12D))) := 'Select type of coin'; { 8900:0E48 }
    puVar12 := @local_130; { 8900:0E48; region anchor, exact origin unknown }
    uVar11 := UNK_unaff_SS; { 8900:0E48; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$12E))) := ''; { 8900:0E58 }
    local_11b := stub_ov25_e4(@local_e, UNK_unaff_SS, @local_16, UNK_unaff_SS, @local_11a, UNK_unaff_SS, MakeWord(UNK_extraout_AH, 1), local_a, MakeWord(UNK_extraout_AH, 8), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 2), MakeWord(UNK_extraout_AH, 2), MakeWord(UNK_extraout_AH, $F), MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, $D), puVar12, uVar11, puVar10, uVar1); { 8900:0E8B }
    if ((local_e = 0) or else (local_11b = $0)) then begin { 8900:0E8B; region anchor, exact origin unknown }
      local_119 := $1; { 8900:0EA3 }
    end else begin { 8900:0EA3; region anchor, exact origin unknown }
      local_119 := 0; { 8900:0EAB }
      local_4 := ov21_0B93(local_116, UNK_unaff_SS, local_e); { 8900:0EBC }
      puVar10 := local_21b; { 8900:0EBC; region anchor, exact origin unknown }
      uVar11 := UNK_unaff_SS; { 8900:0EBC; region anchor, exact origin unknown }
      PString(FarPtr(SS, BPAddr(-$219))) := 'How much '; { 8900:0ECD }
      PString(FarPtr(SS, BPAddr(-$219))) := PString(FarPtr(SS, BPAddr(-$219))) + PString(FarPtr(SS, BPAddr(-$114))); { 8900:0ED8 }
      PString(FarPtr(SS, BPAddr(-$219))) := PString(FarPtr(SS, BPAddr(-$219))) + 'will you take? '; { 8900:0EE2 }
      PString(FarPtr(SS, BPAddr(-$114))) := Copy(PString(FarPtr(SS, BPAddr(-$219))), 1, $FF); { 8900:0EF1 }
      local_118 := ov21_0294(MakeWord((local_4 shr 7), 10), local_116, UNK_unaff_SS, Ptr<Word>(@g_67F4)[(local_4 * 2)]); { 8900:0F0E }
      FUN_8900_0a88(local_4, local_118, g_5D92, g_5D94); { 8900:0F26 }
      stub_ov25_e7(@local_12, UNK_unaff_SS); { 8900:0F2E }
      g_6DC0 := 0; { 8900:0F33 }
      local_119 := $1; { 8900:0F38 }
      local_3 := $0; { 8900:0F3D }
      while true do begin { 8900:0F3D; region anchor, exact origin unknown }
        if ((0 < SmallInt(Ptr<Word>(@g_67F6)[(local_3 * 2)])) or else (((-1) < SmallInt(Ptr<Word>(@g_67F6)[(local_3 * 2)])) and then (Ptr<Word>(@g_67F4)[(local_3 * 2)] <> 0))) then begin { 8900:0F3D; region anchor, exact origin unknown }
          g_6DC0 := 1; { 8900:0F60 }
          local_119 := $0; { 8900:0F65 }
        end; { 8900:0F65; region anchor, exact origin unknown }
        if (local_3 = $6) then begin { 8900:0F65; region anchor, exact origin unknown }
          Break; { 8900:0F65; region anchor, exact origin unknown }
        end; { 8900:0F65; region anchor, exact origin unknown }
        local_3 := (local_3 + $1); { 8900:0F43 }
      end; { 8900:0F43; region anchor, exact origin unknown }
    end; { 8900:0F43; region anchor, exact origin unknown }
    uVar8 := $3C5; { 8900:0F43; region anchor, exact origin unknown }
  until not ((local_119 = $0)); { 8900:0F43; region anchor, exact origin unknown }
  Exit; { 8900:0F7D }
end;
```

### ov21:0F7E HasPooledTreasure (conf M)

Original `ov21_0F7E`. Params (ABI order): param_1: ^Byte; param_2: ^Byte.
BP access inventory (hex offset:byte widths): -1:1, +6:2, +A:2.
Locals/SSA temporaries: local_3: ShortInt.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Money/item presence flags. Evidence: decode/listings/ov21.lst at 8900:0F7E, paired .c.

```pascal
procedure ov21_0F7E(param_1: ^Byte; param_2: ^Byte);
begin
  (param_2)^ := 0; { 8900:0F7E; region anchor, exact origin unknown }
  (param_1)^ := 0; { 8900:0F7E; region anchor, exact origin unknown }
  local_3 := $0; { 8900:0F92 }
  while true do begin { 8900:0F92; region anchor, exact origin unknown }
    if ((Ptr<Word>(@g_67F4)[(local_3 * 2)] <> 0) or else (Ptr<Word>(@g_67F6)[(local_3 * 2)] <> 0)) then begin { 8900:0F92; region anchor, exact origin unknown }
      (param_2)^ := 1; { 8900:0F92; region anchor, exact origin unknown }
    end; { 8900:0F92; region anchor, exact origin unknown }
    if (local_3 = $6) then begin { 8900:0F92; region anchor, exact origin unknown }
      Break; { 8900:0F92; region anchor, exact origin unknown }
    end; { 8900:0F92; region anchor, exact origin unknown }
    local_3 := (local_3 + $1); { 8900:0F98 }
  end; { 8900:0F98; region anchor, exact origin unknown }
  if ((g_6810 <> 0) or else (g_6812 <> 0)) then begin { 8900:0F98; region anchor, exact origin unknown }
    (param_1)^ := 1; { 8900:0F98; region anchor, exact origin unknown }
  end; { 8900:0F98; region anchor, exact origin unknown }
  Exit; { 8900:0FCF }
end;
```

### ov21:0FD2 RollTreasureTier (conf M)

Original `FUN_8900_0fd2`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): -2:1, -1:1.
Locals/SSA temporaries: bVar1: Byte; local_3: Byte.
Callers: ov21_1010.
Callees (listing): stub_ov24_e8.

1d20 tier: 1..14 =>1;15..19=>2;20=>3. Evidence: decode/listings/ov21.lst at 8900:0FD2, paired .c.

```pascal
function FUN_8900_0fd2(): Byte;
begin
  bVar1 := stub_ov24_e8($14, 1); { 8900:0FDE }
  if ((bVar1 = 0) or else ($E < bVar1)) then begin { 8900:0FDE; region anchor, exact origin unknown }
    if ((bVar1 < $F) or else ($13 < bVar1)) then begin { 8900:0FDE; region anchor, exact origin unknown }
      local_3 := 3; { 8900:0FF1 }
    end else begin { 8900:0FF1; region anchor, exact origin unknown }
      local_3 := 2; { 8900:0FFF }
    end; { 8900:0FFF; region anchor, exact origin unknown }
  end else begin { 8900:0FFF; region anchor, exact origin unknown }
    local_3 := 1; { 8900:1005 }
  end; { 8900:1005; region anchor, exact origin unknown }
  Exit(local_3); { 8900:100F }
end;
```

### ov21:1010 GenerateTreasureItem (conf M)

Original `ov21_1010`. Params (ABI order): param_1: LongWord; param_2: Byte.
BP access inventory (hex offset:byte widths): -A:1, -9:2, -7:2, -5:1, -4:1, -3:1, -2:1, -1:1, +6:2, +A:1.
Locals/SSA temporaries: uVar1: Byte; bVar2: Byte; bVar3: Byte; cVar4: ShortInt; extraout_AH: Byte; iVar5: SmallInt; iVar6: SmallInt; uVar7: Word; local_7: ShortInt; local_6: Byte; local_5: Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.FillChar, FUN_8900_0fd2, stub_ov24_e8.

63-byte items; catalog type-specific generation and charges. Evidence: decode/listings/ov21.lst at 8900:1010, paired .c.

```pascal
procedure ov21_1010(param_1: LongWord; param_2: Byte);
begin
  uVar7 := Word((LongWord(param_1) shr $10)); { 8900:1010; region anchor, exact origin unknown }
  iVar6 := SmallInt(param_1); { 8900:1010; region anchor, exact origin unknown }
  FillChar(FarPtr(FarSeg(BPWord($6)), FarOff(BPWord($6))), $3F, LoByte(MakeWord(HiByte($3F), $0))); { 8900:1022 }
  local_6 := 0; { 8900:1027 }
  FillChar(FarPtr(FarSeg(BPWord(-$9)), (FarOff(BPWord(-$9)) + $3C)), $3, LoByte(MakeWord(HiByte($3), $0))); { 8900:1044 }
  (Ptr<Word>((iVar6 + $2A)))^ := 0; { 8900:1044; region anchor, exact origin unknown }
  (Ptr<Word>((iVar6 + $2C)))^ := 0; { 8900:1044; region anchor, exact origin unknown }
  (Ptr<Byte>((iVar6 + $34)))^ := 0; { 8900:1044; region anchor, exact origin unknown }
  (Ptr<Byte>((iVar6 + $35)))^ := 6; { 8900:1044; region anchor, exact origin unknown }
  (Ptr<Byte>((iVar6 + $36)))^ := 0; { 8900:1044; region anchor, exact origin unknown }
  (Ptr<Byte>((iVar6 + $2E)))^ := param_2; { 8900:1044; region anchor, exact origin unknown }
  FillChar(FarPtr(FarSeg(BPWord(-$9)), (FarOff(BPWord(-$9)) + $2F)), $3, LoByte(MakeWord(HiByte($3), $0))); { 8900:1088 }
  bVar3 := (Ptr<Byte>((iVar6 + $2E)))^; { 8900:1088; region anchor, exact origin unknown }
  if ((((bVar3 = 0) or else ($3B < bVar3)) and then (bVar3 <> $49)) and then ((bVar3 <> $4D) and then (bVar3 <> $5D))) then begin { 8900:1088; region anchor, exact origin unknown }
    if ((bVar3 = $3D) or else (bVar3 = $3E)) then begin { 8900:1088; region anchor, exact origin unknown }
      bVar3 := stub_ov24_e8(MakeWord(UNK_extraout_AH, 3), MakeWord(UNK_extraout_AH, 1)); { 8900:10C7 }
      if ((Ptr<ShortInt>((iVar6 + $2E)))^ = $3D) then begin { 8900:10C7; region anchor, exact origin unknown }
        (Ptr<Byte>((iVar6 + $31)))^ := $D1; { 8900:10C7; region anchor, exact origin unknown }
      end else begin { 8900:10C7; region anchor, exact origin unknown }
        (Ptr<Byte>((iVar6 + $31)))^ := $D0; { 8900:10C7; region anchor, exact origin unknown }
      end; { 8900:10C7; region anchor, exact origin unknown }
      (Ptr<ShortInt>((iVar6 + $30)))^ := (bVar3 - $2F); { 8900:10C7; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar6 + $2F)))^ := 0; { 8900:10C7; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar6 + $32)))^ := 1; { 8900:10C7; region anchor, exact origin unknown }
      (Ptr<Word>((iVar6 + $37)))^ := $19; { 8900:10C7; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar6 + $39)))^ := 0; { 8900:10C7; region anchor, exact origin unknown }
      (Ptr<Word>((iVar6 + $3A)))^ := 0; { 8900:10C7; region anchor, exact origin unknown }
      uVar1 := 0; { 8900:10C7; region anchor, exact origin unknown }
      if (bVar3 <> 0) then begin { 8900:10C7; region anchor, exact origin unknown }
        local_5 := 1; { 8900:1603 }
        while true do begin { 8900:1603; region anchor, exact origin unknown }
          bVar2 := stub_ov24_e8(MakeWord(uVar1, 3), MakeWord(uVar1, 1)); { 8900:1596 }
          if ((Ptr<ShortInt>((iVar6 + $2E)))^ = $3D) then begin { 8900:1596; region anchor, exact origin unknown }
            if (bVar2 = 1) then begin { 8900:1596; region anchor, exact origin unknown }
              cVar4 := stub_ov24_e8($D, 1); { 8900:1611 }
              local_7 := (cVar4 + $8); { 8900:163A }
            end else begin { 8900:163A; region anchor, exact origin unknown }
              if (bVar2 = 2) then begin { 8900:163A; region anchor, exact origin unknown }
                cVar4 := stub_ov24_e8(7, 1); { 8900:1630 }
                local_7 := (cVar4 + $1C); { 8900:1653 }
              end else begin { 8900:1653; region anchor, exact origin unknown }
                if (bVar2 = 3) then begin { 8900:1653; region anchor, exact origin unknown }
                  cVar4 := stub_ov24_e8($B, 1); { 8900:1649 }
                  local_7 := (cVar4 + $2C); { 8900:166C }
                end; { 8900:166C; region anchor, exact origin unknown }
              end; { 8900:166C; region anchor, exact origin unknown }
            end; { 8900:166C; region anchor, exact origin unknown }
          end else begin { 8900:166C; region anchor, exact origin unknown }
            if (bVar2 = 1) then begin { 8900:166C; region anchor, exact origin unknown }
              local_7 := stub_ov24_e8(8, 1); { 8900:1662 }
            end else begin { 8900:1662; region anchor, exact origin unknown }
              if (bVar2 = 2) then begin { 8900:1662; region anchor, exact origin unknown }
                cVar4 := stub_ov24_e8(7, 1); { 8900:167E }
                local_7 := (cVar4 + $15); { 8900:1683 }
              end else begin { 8900:1683; region anchor, exact origin unknown }
                if (bVar2 = 3) then begin { 8900:1683; region anchor, exact origin unknown }
                  cVar4 := stub_ov24_e8(9, 1); { 8900:1692 }
                  local_7 := (cVar4 + $23); { 8900:169C }
                end; { 8900:169C; region anchor, exact origin unknown }
              end; { 8900:169C; region anchor, exact origin unknown }
            end; { 8900:169C; region anchor, exact origin unknown }
          end; { 8900:169C; region anchor, exact origin unknown }
          (Ptr<ShortInt>(((iVar6 + Word(local_5)) + $3B)))^ := local_7; { 8900:169C; region anchor, exact origin unknown }
          iVar5 := ((Word(bVar2) * 300) + (Ptr<SmallInt>((iVar6 + $3A)))^); { 8900:169C; region anchor, exact origin unknown }
          (Ptr<SmallInt>((iVar6 + $3A)))^ := iVar5; { 8900:169C; region anchor, exact origin unknown }
          uVar1 := Byte((Word(iVar5) shr 8)); { 8900:169C; region anchor, exact origin unknown }
          if (local_5 = bVar3) then begin { 8900:169C; region anchor, exact origin unknown }
            Break; { 8900:169C; region anchor, exact origin unknown }
          end; { 8900:169C; region anchor, exact origin unknown }
          local_5 := (local_5 + 1); { 8900:1608 }
        end; { 8900:1608; region anchor, exact origin unknown }
      end; { 8900:1608; region anchor, exact origin unknown }
    end else begin { 8900:1608; region anchor, exact origin unknown }
      if (bVar3 = $3F) then begin { 8900:1608; region anchor, exact origin unknown }
        local_6 := $49; { 8900:16F3 }
      end else begin { 8900:16F3; region anchor, exact origin unknown }
        if (bVar3 = $43) then begin { 8900:16F3; region anchor, exact origin unknown }
          local_6 := $91; { 8900:16FE }
        end else begin { 8900:16FE; region anchor, exact origin unknown }
          if (bVar3 = $45) then begin { 8900:16FE; region anchor, exact origin unknown }
            bVar3 := stub_ov24_e8(MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, 1)); { 8900:16AB }
            if (bVar3 = 1) then begin { 8900:16AB; region anchor, exact origin unknown }
              local_6 := $29; { 8900:171E }
            end else begin { 8900:171E; region anchor, exact origin unknown }
              if ((bVar3 < 2) or else (6 < bVar3)) then begin { 8900:171E; region anchor, exact origin unknown }
                if ((6 < bVar3) and then (bVar3 < $B)) then begin { 8900:171E; region anchor, exact origin unknown }
                  local_6 := $81; { 8900:172C }
                end; { 8900:172C; region anchor, exact origin unknown }
              end else begin { 8900:172C; region anchor, exact origin unknown }
                local_6 := $79; { 8900:173A }
              end; { 8900:173A; region anchor, exact origin unknown }
            end; { 8900:173A; region anchor, exact origin unknown }
          end else begin { 8900:173A; region anchor, exact origin unknown }
            if (bVar3 = $4E) then begin { 8900:173A; region anchor, exact origin unknown }
              cVar4 := stub_ov24_e8(MakeWord(UNK_extraout_AH, 3), MakeWord(UNK_extraout_AH, 1)); { 8900:170F }
              if (cVar4 = $0) then begin { 8900:170F; region anchor, exact origin unknown }
                local_6 := $31; { 8900:175D }
              end else begin { 8900:175D; region anchor, exact origin unknown }
                if (cVar4 = $1) then begin { 8900:175D; region anchor, exact origin unknown }
                  local_6 := $41; { 8900:1767 }
                end else begin { 8900:1767; region anchor, exact origin unknown }
                  if (cVar4 = $2) then begin { 8900:1767; region anchor, exact origin unknown }
                    local_6 := $71; { 8900:1771 }
                  end; { 8900:1771; region anchor, exact origin unknown }
                end; { 8900:1771; region anchor, exact origin unknown }
              end; { 8900:1771; region anchor, exact origin unknown }
            end else begin { 8900:1771; region anchor, exact origin unknown }
              if (bVar3 = $4F) then begin { 8900:1771; region anchor, exact origin unknown }
                local_6 := $39; { 8900:177C }
              end else begin { 8900:177C; region anchor, exact origin unknown }
                if (bVar3 = $54) then begin { 8900:177C; region anchor, exact origin unknown }
                  local_6 := 9; { 8900:1787 }
                end else begin { 8900:1787; region anchor, exact origin unknown }
                  if (bVar3 = $5C) then begin { 8900:1787; region anchor, exact origin unknown }
                    local_6 := $61; { 8900:1791 }
                  end else begin { 8900:1791; region anchor, exact origin unknown }
                    if (bVar3 = $47) then begin { 8900:1791; region anchor, exact origin unknown }
                      bVar3 := stub_ov24_e8(MakeWord(UNK_extraout_AH, $B), MakeWord(UNK_extraout_AH, 1)); { 8900:174B }
                      if ((bVar3 = 0) or else (5 < bVar3)) then begin { 8900:174B; region anchor, exact origin unknown }
                        if ((bVar3 < 6) or else (8 < bVar3)) then begin { 8900:174B; region anchor, exact origin unknown }
                          if (bVar3 = 9) then begin { 8900:174B; region anchor, exact origin unknown }
                            local_6 := $19; { 8900:17B4 }
                          end else begin { 8900:17B4; region anchor, exact origin unknown }
                            if (bVar3 = 10) then begin { 8900:17B4; region anchor, exact origin unknown }
                              local_6 := $51; { 8900:17C2 }
                            end; { 8900:17C2; region anchor, exact origin unknown }
                          end; { 8900:17C2; region anchor, exact origin unknown }
                        end else begin { 8900:17C2; region anchor, exact origin unknown }
                          local_6 := 1; { 8900:17CC }
                        end; { 8900:17CC; region anchor, exact origin unknown }
                      end else begin { 8900:17CC; region anchor, exact origin unknown }
                        local_6 := $11; { 8900:17D6 }
                      end; { 8900:17D6; region anchor, exact origin unknown }
                    end else begin { 8900:17D6; region anchor, exact origin unknown }
                      if (bVar3 = $46) then begin { 8900:17D6; region anchor, exact origin unknown }
                        bVar3 := stub_ov24_e8(MakeWord(UNK_extraout_AH, 10), MakeWord(UNK_extraout_AH, 1)); { 8900:17A1 }
                        if ((bVar3 = 0) or else (7 < bVar3)) then begin { 8900:17A1; region anchor, exact origin unknown }
                          if ((7 < bVar3) and then (bVar3 < $B)) then begin { 8900:17A1; region anchor, exact origin unknown }
                            local_6 := $89; { 8900:17F9 }
                          end; { 8900:17F9; region anchor, exact origin unknown }
                        end else begin { 8900:17F9; region anchor, exact origin unknown }
                          local_6 := $59; { 8900:1807 }
                        end; { 8900:1807; region anchor, exact origin unknown }
                      end; { 8900:1807; region anchor, exact origin unknown }
                    end; { 8900:1807; region anchor, exact origin unknown }
                  end; { 8900:1807; region anchor, exact origin unknown }
                end; { 8900:1807; region anchor, exact origin unknown }
              end; { 8900:1807; region anchor, exact origin unknown }
            end; { 8900:1807; region anchor, exact origin unknown }
          end; { 8900:1807; region anchor, exact origin unknown }
        end; { 8900:1807; region anchor, exact origin unknown }
      end; { 8900:1807; region anchor, exact origin unknown }
    end; { 8900:1807; region anchor, exact origin unknown }
  end else begin { 8900:1807; region anchor, exact origin unknown }
    uVar1 := FUN_8900_0fd2(); { 8900:10AC }
    (Ptr<Byte>((iVar6 + $32)))^ := uVar1; { 8900:10AC; region anchor, exact origin unknown }
    bVar3 := (Ptr<Byte>((iVar6 + $2E)))^; { 8900:10AC; region anchor, exact origin unknown }
    if (bVar3 = $15) then begin { 8900:10AC; region anchor, exact origin unknown }
      cVar4 := stub_ov24_e8(5, 1); { 8900:17E6 }
      if (cVar4 = $5) then begin { 8900:17E6; region anchor, exact origin unknown }
        local_6 := $90; { 8900:10D5 }
      end; { 8900:10D5; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar6 + $31)))^ := $15; { 8900:10D5; region anchor, exact origin unknown }
      (Ptr<ShortInt>((iVar6 + $30)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
    end else begin { 8900:10D5; region anchor, exact origin unknown }
      if (bVar3 = $1C) then begin { 8900:10D5; region anchor, exact origin unknown }
        (Ptr<Byte>((iVar6 + $31)))^ := $1C; { 8900:10D5; region anchor, exact origin unknown }
        (Ptr<ShortInt>((iVar6 + $30)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
      end else begin { 8900:10D5; region anchor, exact origin unknown }
        if ((bVar3 = $32) or else (bVar3 = $33)) then begin { 8900:10D5; region anchor, exact origin unknown }
          (Ptr<Byte>((iVar6 + $31)))^ := (Ptr<Byte>((iVar6 + $2E)))^; { 8900:10D5; region anchor, exact origin unknown }
          (Ptr<Byte>((iVar6 + $30)))^ := $31; { 8900:10D5; region anchor, exact origin unknown }
          (Ptr<ShortInt>((iVar6 + $2F)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
          (Ptr<Byte>((iVar6 + $35)))^ := 4; { 8900:10D5; region anchor, exact origin unknown }
        end else begin { 8900:10D5; region anchor, exact origin unknown }
          if (bVar3 = $34) then begin { 8900:10D5; region anchor, exact origin unknown }
            (Ptr<Byte>((iVar6 + $31)))^ := (Ptr<Byte>((iVar6 + $2E)))^; { 8900:10D5; region anchor, exact origin unknown }
            (Ptr<Byte>((iVar6 + $30)))^ := $32; { 8900:10D5; region anchor, exact origin unknown }
            (Ptr<ShortInt>((iVar6 + $2F)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
            (Ptr<Byte>((iVar6 + $35)))^ := 4; { 8900:10D5; region anchor, exact origin unknown }
          end else begin { 8900:10D5; region anchor, exact origin unknown }
            if ((bVar3 < $35) or else ($3A < bVar3)) then begin { 8900:10D5; region anchor, exact origin unknown }
              if (bVar3 = $49) then begin { 8900:10D5; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar6 + $31)))^ := $3D; { 8900:10D5; region anchor, exact origin unknown }
                (Ptr<ShortInt>((iVar6 + $30)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
              end else begin { 8900:10D5; region anchor, exact origin unknown }
                if (bVar3 = $4D) then begin { 8900:10D5; region anchor, exact origin unknown }
                  (Ptr<Byte>((iVar6 + $31)))^ := $4F; { 8900:10D5; region anchor, exact origin unknown }
                  (Ptr<Byte>((iVar6 + $30)))^ := $A7; { 8900:10D5; region anchor, exact origin unknown }
                  (Ptr<ShortInt>((iVar6 + $32)))^ := (((Ptr<ShortInt>((iVar6 + $32)))^ * $2) + $2); { 8900:10D5; region anchor, exact origin unknown }
                  cVar4 := (Ptr<ShortInt>((iVar6 + $32)))^; { 8900:10D5; region anchor, exact origin unknown }
                  if (cVar4 = $4) then begin { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<Byte>((iVar6 + $2F)))^ := $DD; { 8900:10D5; region anchor, exact origin unknown }
                  end else begin { 8900:10D5; region anchor, exact origin unknown }
                    if (cVar4 = $6) then begin { 8900:10D5; region anchor, exact origin unknown }
                      (Ptr<Byte>((iVar6 + $2F)))^ := $DE; { 8900:10D5; region anchor, exact origin unknown }
                    end else begin { 8900:10D5; region anchor, exact origin unknown }
                      if (cVar4 = $8) then begin { 8900:10D5; region anchor, exact origin unknown }
                        (Ptr<Byte>((iVar6 + $2F)))^ := $DC; { 8900:10D5; region anchor, exact origin unknown }
                      end; { 8900:10D5; region anchor, exact origin unknown }
                    end; { 8900:10D5; region anchor, exact origin unknown }
                  end; { 8900:10D5; region anchor, exact origin unknown }
                end else begin { 8900:10D5; region anchor, exact origin unknown }
                  if (bVar3 = $5D) then begin { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<Byte>((iVar6 + $31)))^ := $42; { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<Byte>((iVar6 + $30)))^ := $E0; { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((iVar6 + $2F)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
                  end else begin { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<Byte>((iVar6 + $31)))^ := (Ptr<Byte>((iVar6 + $2E)))^; { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<ShortInt>((iVar6 + $30)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
                  end; { 8900:10D5; region anchor, exact origin unknown }
                end; { 8900:10D5; region anchor, exact origin unknown }
              end; { 8900:10D5; region anchor, exact origin unknown }
            end else begin { 8900:10D5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar6 + $31)))^ := (Ptr<Byte>((iVar6 + $2E)))^; { 8900:10D5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar6 + $30)))^ := $30; { 8900:10D5; region anchor, exact origin unknown }
              (Ptr<ShortInt>((iVar6 + $2F)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ + (-$5F)); { 8900:10D5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar6 + $35)))^ := 4; { 8900:10D5; region anchor, exact origin unknown }
            end; { 8900:10D5; region anchor, exact origin unknown }
          end; { 8900:10D5; region anchor, exact origin unknown }
        end; { 8900:10D5; region anchor, exact origin unknown }
      end; { 8900:10D5; region anchor, exact origin unknown }
    end; { 8900:10D5; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar6 + $33)))^ := 0; { 8900:10D5; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar6 + $39)))^ := 0; { 8900:10D5; region anchor, exact origin unknown }
    cVar4 := (Ptr<ShortInt>((iVar6 + $2E)))^; { 8900:10D5; region anchor, exact origin unknown }
    if ((((cVar4 = $1) or else (cVar4 = $D)) or else (cVar4 = $E)) or else (cVar4 = $23)) then begin { 8900:10D5; region anchor, exact origin unknown }
      (Ptr<Word>((iVar6 + $37)))^ := $4B; { 8900:10D5; region anchor, exact origin unknown }
    end else begin { 8900:10D5; region anchor, exact origin unknown }
      if ((((((cVar4 = $2) or else (cVar4 = $14)) or else ((cVar4 = $1D) or else ((cVar4 = $1F) or else (cVar4 = $20)))) or else (cVar4 = $21)) or else (((cVar4 = $27) or else (cVar4 = $2A)) or else (cVar4 = $2C))) or else ((cVar4 = $2E) or else (cVar4 = $3B))) then begin { 8900:10D5; region anchor, exact origin unknown }
        (Ptr<Word>((iVar6 + $37)))^ := $32; { 8900:10D5; region anchor, exact origin unknown }
      end else begin { 8900:10D5; region anchor, exact origin unknown }
        if (((cVar4 = $3) or else (cVar4 = $18)) or else (cVar4 = $28)) then begin { 8900:10D5; region anchor, exact origin unknown }
          (Ptr<Word>((iVar6 + $37)))^ := $7D; { 8900:10D5; region anchor, exact origin unknown }
        end else begin { 8900:10D5; region anchor, exact origin unknown }
          if ((((((cVar4 = $4) or else (cVar4 = $F)) or else (cVar4 = $17)) or else ((cVar4 = $22) or else (cVar4 = $2B))) or else (cVar4 = $2D)) or else (cVar4 = $33)) then begin { 8900:10D5; region anchor, exact origin unknown }
            (Ptr<Word>((iVar6 + $37)))^ := 100; { 8900:10D5; region anchor, exact origin unknown }
          end else begin { 8900:10D5; region anchor, exact origin unknown }
            if (((cVar4 = $5) or else (cVar4 = $C)) or else ((cVar4 = $11) or else ((cVar4 = $13) or else (cVar4 = $32)))) then begin { 8900:10D5; region anchor, exact origin unknown }
              (Ptr<Word>((iVar6 + $37)))^ := $96; { 8900:10D5; region anchor, exact origin unknown }
            end else begin { 8900:10D5; region anchor, exact origin unknown }
              if (cVar4 = $6) then begin { 8900:10D5; region anchor, exact origin unknown }
                (Ptr<Word>((iVar6 + $37)))^ := $F; { 8900:10D5; region anchor, exact origin unknown }
              end else begin { 8900:10D5; region anchor, exact origin unknown }
                if (cVar4 = $7) then begin { 8900:10D5; region anchor, exact origin unknown }
                  (Ptr<Word>((iVar6 + $37)))^ := $1E; { 8900:10D5; region anchor, exact origin unknown }
                end else begin { 8900:10D5; region anchor, exact origin unknown }
                  if ((cVar4 = $8) or else (cVar4 = $4D)) then begin { 8900:10D5; region anchor, exact origin unknown }
                    (Ptr<Word>((iVar6 + $37)))^ := 10; { 8900:10D5; region anchor, exact origin unknown }
                  end else begin { 8900:10D5; region anchor, exact origin unknown }
                    if (cVar4 = $9) then begin { 8900:10D5; region anchor, exact origin unknown }
                      (Ptr<Word>((iVar6 + $37)))^ := $19; { 8900:10D5; region anchor, exact origin unknown }
                      (Ptr<Byte>((iVar6 + $39)))^ := 5; { 8900:10D5; region anchor, exact origin unknown }
                    end else begin { 8900:10D5; region anchor, exact origin unknown }
                      if (((cVar4 = $A) or else (cVar4 = $1A)) or else (cVar4 = $24)) then begin { 8900:10D5; region anchor, exact origin unknown }
                        (Ptr<Word>((iVar6 + $37)))^ := $3C; { 8900:10D5; region anchor, exact origin unknown }
                      end else begin { 8900:10D5; region anchor, exact origin unknown }
                        if ((((cVar4 = $B) or else (cVar4 = $10)) or else ((cVar4 = $19) or else ((cVar4 = $1B) or else (cVar4 = $29)))) or else (cVar4 = $2F)) then begin { 8900:10D5; region anchor, exact origin unknown }
                          (Ptr<Word>((iVar6 + $37)))^ := $50; { 8900:10D5; region anchor, exact origin unknown }
                        end else begin { 8900:10D5; region anchor, exact origin unknown }
                          if (cVar4 = $12) then begin { 8900:10D5; region anchor, exact origin unknown }
                            (Ptr<Word>((iVar6 + $37)))^ := $AF; { 8900:10D5; region anchor, exact origin unknown }
                          end else begin { 8900:10D5; region anchor, exact origin unknown }
                            if (cVar4 = $15) then begin { 8900:10D5; region anchor, exact origin unknown }
                              (Ptr<Word>((iVar6 + $37)))^ := $14; { 8900:10D5; region anchor, exact origin unknown }
                            end else begin { 8900:10D5; region anchor, exact origin unknown }
                              if ((cVar4 = $16) or else (cVar4 = $1E)) then begin { 8900:10D5; region anchor, exact origin unknown }
                                (Ptr<Word>((iVar6 + $37)))^ := $28; { 8900:10D5; region anchor, exact origin unknown }
                              end else begin { 8900:10D5; region anchor, exact origin unknown }
                                if (cVar4 = $25) then begin { 8900:10D5; region anchor, exact origin unknown }
                                  (Ptr<Word>((iVar6 + $37)))^ := $23; { 8900:10D5; region anchor, exact origin unknown }
                                end else begin { 8900:10D5; region anchor, exact origin unknown }
                                  if ((cVar4 = $26) or else (cVar4 = $35)) then begin { 8900:10D5; region anchor, exact origin unknown }
                                    (Ptr<Word>((iVar6 + $37)))^ := $FA; { 8900:10D5; region anchor, exact origin unknown }
                                  end else begin { 8900:10D5; region anchor, exact origin unknown }
                                    if (cVar4 = $34) then begin { 8900:10D5; region anchor, exact origin unknown }
                                      (Ptr<Word>((iVar6 + $37)))^ := 200; { 8900:10D5; region anchor, exact origin unknown }
                                    end else begin { 8900:10D5; region anchor, exact origin unknown }
                                      if ((cVar4 = $36) or else (cVar4 = $38)) then begin { 8900:10D5; region anchor, exact origin unknown }
                                        (Ptr<Word>((iVar6 + $37)))^ := 400; { 8900:10D5; region anchor, exact origin unknown }
                                      end else begin { 8900:10D5; region anchor, exact origin unknown }
                                        if (cVar4 = $37) then begin { 8900:10D5; region anchor, exact origin unknown }
                                          (Ptr<Word>((iVar6 + $37)))^ := 300; { 8900:10D5; region anchor, exact origin unknown }
                                        end else begin { 8900:10D5; region anchor, exact origin unknown }
                                          if (cVar4 = $39) then begin { 8900:10D5; region anchor, exact origin unknown }
                                            (Ptr<Word>((iVar6 + $37)))^ := $15E; { 8900:10D5; region anchor, exact origin unknown }
                                          end else begin { 8900:10D5; region anchor, exact origin unknown }
                                            if (cVar4 = $3A) then begin { 8900:10D5; region anchor, exact origin unknown }
                                              (Ptr<Word>((iVar6 + $37)))^ := $1C2; { 8900:10D5; region anchor, exact origin unknown }
                                            end else begin { 8900:10D5; region anchor, exact origin unknown }
                                              if ((cVar4 = $2F) or else (cVar4 = $5D)) then begin { 8900:10D5; region anchor, exact origin unknown }
                                                (Ptr<Word>((iVar6 + $37)))^ := 1; { 8900:10D5; region anchor, exact origin unknown }
                                              end else begin { 8900:10D5; region anchor, exact origin unknown }
                                                (Ptr<Word>((iVar6 + $37)))^ := $28; { 8900:10D5; region anchor, exact origin unknown }
                                                (Ptr<Byte>((iVar6 + $39)))^ := 10; { 8900:10D5; region anchor, exact origin unknown }
                                              end; { 8900:10D5; region anchor, exact origin unknown }
                                            end; { 8900:10D5; region anchor, exact origin unknown }
                                          end; { 8900:10D5; region anchor, exact origin unknown }
                                        end; { 8900:10D5; region anchor, exact origin unknown }
                                      end; { 8900:10D5; region anchor, exact origin unknown }
                                    end; { 8900:10D5; region anchor, exact origin unknown }
                                  end; { 8900:10D5; region anchor, exact origin unknown }
                                end; { 8900:10D5; region anchor, exact origin unknown }
                              end; { 8900:10D5; region anchor, exact origin unknown }
                            end; { 8900:10D5; region anchor, exact origin unknown }
                          end; { 8900:10D5; region anchor, exact origin unknown }
                        end; { 8900:10D5; region anchor, exact origin unknown }
                      end; { 8900:10D5; region anchor, exact origin unknown }
                    end; { 8900:10D5; region anchor, exact origin unknown }
                  end; { 8900:10D5; region anchor, exact origin unknown }
                end; { 8900:10D5; region anchor, exact origin unknown }
              end; { 8900:10D5; region anchor, exact origin unknown }
            end; { 8900:10D5; region anchor, exact origin unknown }
          end; { 8900:10D5; region anchor, exact origin unknown }
        end; { 8900:10D5; region anchor, exact origin unknown }
      end; { 8900:10D5; region anchor, exact origin unknown }
    end; { 8900:10D5; region anchor, exact origin unknown }
    cVar4 := (Ptr<ShortInt>((iVar6 + $2E)))^; { 8900:10D5; region anchor, exact origin unknown }
    if (cVar4 = $3B) then begin { 8900:10D5; region anchor, exact origin unknown }
      (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * $9C4); { 8900:10D5; region anchor, exact origin unknown }
    end else begin { 8900:10D5; region anchor, exact origin unknown }
      if ((cVar4 = $49) or else (cVar4 = $1C)) then begin { 8900:10D5; region anchor, exact origin unknown }
        (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * $96); { 8900:10D5; region anchor, exact origin unknown }
      end else begin { 8900:10D5; region anchor, exact origin unknown }
        if ((cVar4 = $35) or else (cVar4 = $36)) then begin { 8900:10D5; region anchor, exact origin unknown }
          (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * 3000); { 8900:10D5; region anchor, exact origin unknown }
        end else begin { 8900:10D5; region anchor, exact origin unknown }
          if ((cVar4 = $37) or else (cVar4 = $38)) then begin { 8900:10D5; region anchor, exact origin unknown }
            (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * $DAC); { 8900:10D5; region anchor, exact origin unknown }
          end else begin { 8900:10D5; region anchor, exact origin unknown }
            if (cVar4 = $39) then begin { 8900:10D5; region anchor, exact origin unknown }
              (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * 4000); { 8900:10D5; region anchor, exact origin unknown }
            end else begin { 8900:10D5; region anchor, exact origin unknown }
              if (cVar4 = $3A) then begin { 8900:10D5; region anchor, exact origin unknown }
                (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * 5000); { 8900:10D5; region anchor, exact origin unknown }
              end else begin { 8900:10D5; region anchor, exact origin unknown }
                if (cVar4 = $4D) then begin { 8900:10D5; region anchor, exact origin unknown }
                  (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * 3000); { 8900:10D5; region anchor, exact origin unknown }
                end else begin { 8900:10D5; region anchor, exact origin unknown }
                  (Ptr<SmallInt>((iVar6 + $3A)))^ := ((Ptr<ShortInt>((iVar6 + $32)))^ * 2000); { 8900:10D5; region anchor, exact origin unknown }
                end; { 8900:10D5; region anchor, exact origin unknown }
              end; { 8900:10D5; region anchor, exact origin unknown }
            end; { 8900:10D5; region anchor, exact origin unknown }
          end; { 8900:10D5; region anchor, exact origin unknown }
        end; { 8900:10D5; region anchor, exact origin unknown }
      end; { 8900:10D5; region anchor, exact origin unknown }
    end; { 8900:10D5; region anchor, exact origin unknown }
  end; { 8900:10D5; region anchor, exact origin unknown }
  if (local_6 <> 0) then begin { 8900:10D5; region anchor, exact origin unknown }
    local_5 := 0; { 8900:1814 }
    while Seq((Ptr<Byte>(((iVar6 + Word(local_5)) + $2F)))^ := (Ptr<Byte>((((Word(local_6) + Word(local_5)) * 2) + $970)))^, (local_5 <> 2)) do begin { 8900:1814; region anchor, exact origin unknown }
      local_5 := (local_5 + 1); { 8900:181A }
    end; { 8900:181A; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar6 + $32)))^ := 1; { 8900:181A; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar6 + $33)))^ := 1; { 8900:181A; region anchor, exact origin unknown }
    if (local_6 = $61) then begin { 8900:181A; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar6 + $32)))^ := 2; { 8900:181A; region anchor, exact origin unknown }
      (Ptr<Byte>((iVar6 + $33)))^ := 2; { 8900:181A; region anchor, exact origin unknown }
    end; { 8900:181A; region anchor, exact origin unknown }
    (Ptr<Word>((iVar6 + $37)))^ := (Ptr<Word>((((local_6 + 3) * 2) + $970)))^; { 8900:181A; region anchor, exact origin unknown }
    (Ptr<Byte>((iVar6 + $39)))^ := 0; { 8900:181A; region anchor, exact origin unknown }
    (Ptr<Word>((iVar6 + $3A)))^ := (Ptr<Word>((((local_6 + 4) * 2) + $970)))^; { 8900:181A; region anchor, exact origin unknown }
    local_5 := 1; { 8900:18A4 }
    while Seq((Ptr<Byte>(((iVar6 + Word(local_5)) + $3B)))^ := (Ptr<Byte>(((((local_6 + 4) + Word(local_5)) * 2) + $970)))^, (local_5 <> 3)) do begin { 8900:18A4; region anchor, exact origin unknown }
      local_5 := (local_5 + 1); { 8900:18AA }
    end; { 8900:18AA; region anchor, exact origin unknown }
  end; { 8900:18AA; region anchor, exact origin unknown }
  Exit; { 8900:18DD }
end;
```

### ov21:19B2 AppraiseGemsAndJewelry (conf M)

Original `ov21_19B2`. Params (ABI order): param_1: ^Byte.
BP access inventory (hex offset:byte widths): -1B5:2, -D4:2, -C8:2, -C1:2, -C0:2, -B5:1, -B4:2, -B3:1, -B2:2, -B0:2, -AE:2, -AC:2, -AA:2, -A8:2, -A6:1, -A5:2, -7C:1/2, -53:1, -52:1/2, -29:1/2, +6:2.
Locals/SSA temporaries: iVar1: SmallInt; cVar2: ShortInt; extraout_AH: Byte; extraout_AH_00: Byte; uVar5: Byte; extraout_AH_01: Byte; extraout_AH_02: Byte; uVar3: Word; uVar4: Word; extraout_AH_03: Byte; extraout_AH_04: Byte; extraout_AH_05: Byte; extraout_AH_06: Byte; extraout_AH_07: Byte; extraout_AH_08: Byte; extraout_AH_09: Byte; iVar6: SmallInt; iVar7: SmallInt; uVar8: Word; uVar9: Word; unaff_SS: Word; puVar10: ^Byte; local_1b7: array[0..225-1] of Byte; local_d6: array[0..12-1] of Byte; local_ca: array[0..7-1] of Byte; local_c3: Byte; local_c2: array[0..11-1] of Byte; local_b7: ShortInt; local_b6: Byte; local_b5: ShortInt; local_b4: LongWord; local_b0: LongWord; local_ac: array[0..2-1] of Byte; local_aa: ^ShortInt; local_a8: Byte; local_a7: array[0..41-1] of Byte; local_7e: array[0..41-1] of Byte; local_55: ShortInt; local_54: array[0..41-1] of Byte; local_2b: array[0..41-1] of Byte.
Callers: none exported; indirect callback use unknown.
Callees (listing): System.@StrCopy, FUN_00ba_1693, System.@StrLong, System.@StrAppend, System.@StrAssign, FUN_0709_0dd3, FUN_00ba_1816, FUN_0709_0626, stub_ov25_e2, stub_ov24_e8, ov21_0054, System.GetMem, System.FillChar, FUN_8900_0203, System.RandomWord, System.@LongToReal, System.Trunc, FUN_00ba_0bb8.

Keep or Sell; keeping creates item when inventory count <16. Evidence: decode/listings/ov21.lst at 8900:19B2, paired .c.

```pascal
procedure ov21_19B2(param_1: ^Byte);
begin
  (param_1)^ := 1; { 8900:19B2; region anchor, exact origin unknown }
  uVar8 := Word((LongWord(g_5D92) shr $10)); { 8900:19B2; region anchor, exact origin unknown }
  if (((Ptr<SmallInt>((SmallInt(g_5D92) + $92)))^ = 0) and then ((Ptr<SmallInt>((SmallInt(g_5D92) + $94)))^ = 0)) then begin { 8900:19B2; region anchor, exact origin unknown }
    puVar10 := local_ca; { 8900:19B2; region anchor, exact origin unknown }
    PString(FarPtr(SS, BPAddr(-$C8))) := 'No Gems or Jewelry'; { 8900:19E3 }
    FUN_00ba_1693(puVar10, UNK_unaff_SS); { 8900:19E8 }
    (param_1)^ := 0; { 8900:19E8; region anchor, exact origin unknown }
  end else begin { 8900:19E8; region anchor, exact origin unknown }
    repeat { 8900:19E8; region anchor, exact origin unknown }
      uVar8 := Word((LongWord(g_5D92) shr $10)); { 8900:19E8; region anchor, exact origin unknown }
      iVar6 := SmallInt(g_5D92); { 8900:19E8; region anchor, exact origin unknown }
      if (((Ptr<SmallInt>((iVar6 + $92)))^ = 0) and then ((Ptr<SmallInt>((iVar6 + $94)))^ = 0)) then begin { 8900:19E8; region anchor, exact origin unknown }
        local_b5 := $1; { 8900:1A0F }
      end else begin { 8900:1A0F; region anchor, exact origin unknown }
        local_b5 := $0; { 8900:1A17 }
        Str(LongInt(MakeLong(0, MemWord(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $5D92))), FarOff(MemWord(FarPtr($0C7C, $5D92))) + $92)))), PString(FarPtr(SS, BPAddr(-$29)))); { 8900:1A35 }
        Str(LongInt(MakeLong(0, MemWord(FarPtr(FarSeg(MemWord(FarPtr($0C7C, $5D92))), FarOff(MemWord(FarPtr($0C7C, $5D92))) + $94)))), PString(FarPtr(SS, BPAddr(-$52)))); { 8900:1A53 }
        iVar6 := (Ptr<SmallInt>((SmallInt(g_5D92) + $92)))^; { 8900:1A53; region anchor, exact origin unknown }
        if (iVar6 = 0) then begin { 8900:1A53; region anchor, exact origin unknown }
          local_2b[0] := 0; { 8900:1A53; region anchor, exact origin unknown }
        end else begin { 8900:1A53; region anchor, exact origin unknown }
          if (iVar6 = 1) then begin { 8900:1A53; region anchor, exact origin unknown }
            puVar10 := local_1b7; { 8900:1A53; region anchor, exact origin unknown }
            uVar8 := UNK_unaff_SS; { 8900:1A53; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$29))); { 8900:1A7C }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' Gem'; { 8900:1A86 }
            PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1A94 }
          end else begin { 8900:1A94; region anchor, exact origin unknown }
            puVar10 := local_1b7; { 8900:1A94; region anchor, exact origin unknown }
            uVar8 := UNK_unaff_SS; { 8900:1A94; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$29))); { 8900:1AA6 }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' Gems'; { 8900:1AB0 }
            PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1ABE }
          end; { 8900:1ABE; region anchor, exact origin unknown }
        end; { 8900:1ABE; region anchor, exact origin unknown }
        iVar6 := (Ptr<SmallInt>((SmallInt(g_5D92) + $94)))^; { 8900:1ABE; region anchor, exact origin unknown }
        if (iVar6 = 0) then begin { 8900:1ABE; region anchor, exact origin unknown }
          local_54[0] := 0; { 8900:1ABE; region anchor, exact origin unknown }
          uVar5 := 0; { 8900:1ABE; region anchor, exact origin unknown }
        end else begin { 8900:1ABE; region anchor, exact origin unknown }
          if (iVar6 = 1) then begin { 8900:1ABE; region anchor, exact origin unknown }
            puVar10 := local_1b7; { 8900:1ABE; region anchor, exact origin unknown }
            uVar8 := UNK_unaff_SS; { 8900:1ABE; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$52))); { 8900:1AE7 }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' piece of Jewelry'; { 8900:1AF1 }
            PString(FarPtr(SS, BPAddr(-$52))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1AFF }
            uVar5 := UNK_extraout_AH; { 8900:1AFF; region anchor, exact origin unknown }
          end else begin { 8900:1AFF; region anchor, exact origin unknown }
            puVar10 := local_1b7; { 8900:1AFF; region anchor, exact origin unknown }
            uVar8 := UNK_unaff_SS; { 8900:1AFF; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$52))); { 8900:1B11 }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' pieces of Jewelry'; { 8900:1B1B }
            PString(FarPtr(SS, BPAddr(-$52))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1B29 }
            uVar5 := UNK_extraout_AH_00; { 8900:1B29; region anchor, exact origin unknown }
          end; { 8900:1B29; region anchor, exact origin unknown }
        end; { 8900:1B29; region anchor, exact origin unknown }
        FUN_0709_0dd3(MakeWord(uVar5, $16), MakeWord(uVar5, $26), MakeWord(uVar5, 1), MakeWord(uVar5, 1)); { 8900:1B3A }
        FUN_00ba_1816((Word(UNK_extraout_AH_01) shl 8), MakeWord(UNK_extraout_AH_01, 1), MakeWord(UNK_extraout_AH_01, 1), g_5D92, g_5D94); { 8900:1B50 }
        uVar9 := MakeWord(UNK_extraout_AH_02, 1); { 8900:1B50; region anchor, exact origin unknown }
        uVar3 := MakeWord(UNK_extraout_AH_02, 7); { 8900:1B50; region anchor, exact origin unknown }
        uVar4 := MakeWord(UNK_extraout_AH_02, $F); { 8900:1B50; region anchor, exact origin unknown }
        puVar10 := local_d6; { 8900:1B50; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 8900:1B50; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$D4))) := 'You have a fine collection of:'; { 8900:1B69 }
        FUN_0709_0626(puVar10, uVar8, uVar4, uVar3, uVar9); { 8900:1B6E }
        FUN_0709_0626(local_2b, UNK_unaff_SS, MakeWord(UNK_extraout_AH_03, $F), MakeWord(UNK_extraout_AH_03, 9), MakeWord(UNK_extraout_AH_03, 1)); { 8900:1B81 }
        FUN_0709_0626(local_54, UNK_unaff_SS, MakeWord(UNK_extraout_AH_04, $F), MakeWord(UNK_extraout_AH_04, 10), MakeWord(UNK_extraout_AH_04, 1)); { 8900:1B94 }
        local_7e[0] := 0; { 8900:1B94; region anchor, exact origin unknown }
        if ((Ptr<SmallInt>((SmallInt(g_5D92) + $92)))^ <> 0) then begin { 8900:1B94; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$7C))) := Copy('  Gems', 1, $28); { 8900:1BB7 }
        end; { 8900:1BB7; region anchor, exact origin unknown }
        if ((Ptr<SmallInt>((SmallInt(g_5D92) + $94)))^ <> 0) then begin { 8900:1BB7; region anchor, exact origin unknown }
          puVar10 := local_1b7; { 8900:1BB7; region anchor, exact origin unknown }
          uVar8 := UNK_unaff_SS; { 8900:1BB7; region anchor, exact origin unknown }
          PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$7C))); { 8900:1BD3 }
          PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + '  Jewelry'; { 8900:1BDD }
          PString(FarPtr(SS, BPAddr(-$7C))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1BEB }
        end; { 8900:1BEB; region anchor, exact origin unknown }
        puVar10 := local_1b7; { 8900:1BEB; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 8900:1BEB; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$7C))); { 8900:1BFB }
        PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' Exit'; { 8900:1C05 }
        PString(FarPtr(SS, BPAddr(-$7C))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1C13 }
        puVar10 := @local_c3; { 8900:1C13; region anchor, exact origin unknown }
        uVar8 := UNK_unaff_SS; { 8900:1C13; region anchor, exact origin unknown }
        PString(FarPtr(SS, BPAddr(-$C1))) := 'Appraise : '; { 8900:1C23 }
        local_55 := stub_ov25_e2(@local_b6, UNK_unaff_SS, (Word(UNK_extraout_AH_05) shl 8), MakeWord(UNK_extraout_AH_05, 1), MakeWord(UNK_extraout_AH_05, $F), MakeWord(UNK_extraout_AH_05, 10), MakeWord(UNK_extraout_AH_05, $D), local_7e, UNK_unaff_SS, puVar10, uVar8); { 8900:1C42 }
        iVar6 := SmallInt(g_5D92); { 8900:1C42; region anchor, exact origin unknown }
        uVar8 := Word((LongWord(g_5D92) shr $10)); { 8900:1C42; region anchor, exact origin unknown }
        if (local_55 = $47) then begin { 8900:1C42; region anchor, exact origin unknown }
          if ((Ptr<SmallInt>((iVar6 + $92)))^ <> 0) then begin { 8900:1C42; region anchor, exact origin unknown }
            (Ptr<SmallInt>((iVar6 + $92)))^ := ((Ptr<SmallInt>((iVar6 + $92)))^ + (-1)); { 8900:1C42; region anchor, exact origin unknown }
            local_a8 := stub_ov24_e8(100, 1); { 8900:1C72 }
            if ((local_a8 = 0) or else ($19 < local_a8)) then begin { 8900:1C72; region anchor, exact origin unknown }
              if ((local_a8 < $1A) or else ($32 < local_a8)) then begin { 8900:1C72; region anchor, exact origin unknown }
                if ((local_a8 < $33) or else ($46 < local_a8)) then begin { 8900:1C72; region anchor, exact origin unknown }
                  if ((local_a8 < $47) or else ($5A < local_a8)) then begin { 8900:1C72; region anchor, exact origin unknown }
                    if ((local_a8 < $5B) or else (99 < local_a8)) then begin { 8900:1C72; region anchor, exact origin unknown }
                      if (local_a8 = 100) then begin { 8900:1C72; region anchor, exact origin unknown }
                        local_aa := (Ptr<ShortInt>($1387) + 1); { 8900:1C87 }
                      end; { 8900:1C87; region anchor, exact origin unknown }
                    end else begin { 8900:1C87; region anchor, exact origin unknown }
                      local_aa := Ptr<ShortInt>($3E8); { 8900:1C97 }
                    end; { 8900:1C97; region anchor, exact origin unknown }
                  end else begin { 8900:1C97; region anchor, exact origin unknown }
                    local_aa := Ptr<ShortInt>($1F4); { 8900:1CA7 }
                  end; { 8900:1CA7; region anchor, exact origin unknown }
                end else begin { 8900:1CA7; region anchor, exact origin unknown }
                  local_aa := Ptr<ShortInt>($64); { 8900:1CB7 }
                end; { 8900:1CB7; region anchor, exact origin unknown }
              end else begin { 8900:1CB7; region anchor, exact origin unknown }
                local_aa := Ptr<ShortInt>($32); { 8900:1CC7 }
              end; { 8900:1CC7; region anchor, exact origin unknown }
            end else begin { 8900:1CC7; region anchor, exact origin unknown }
              local_aa := Ptr<ShortInt>($A); { 8900:1CD3 }
            end; { 8900:1CD3; region anchor, exact origin unknown }
            Str(LongInt(MakeLong(0, BPWord(-$A8))), PString(FarPtr(SS, BPAddr(-$29)))); { 8900:1CED }
            puVar10 := local_1b7; { 8900:1CED; region anchor, exact origin unknown }
            uVar8 := UNK_unaff_SS; { 8900:1CED; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$1B5))) := 'The Gem is Valued at '; { 8900:1CFD }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + PString(FarPtr(SS, BPAddr(-$29))); { 8900:1D07 }
            PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' gp.'; { 8900:1D11 }
            PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:1D1F }
            FUN_0709_0626(local_2b, UNK_unaff_SS, MakeWord(UNK_extraout_AH_06, $F), MakeWord(UNK_extraout_AH_06, $C), MakeWord(UNK_extraout_AH_06, 1)); { 8900:1D32 }
            cVar2 := ov21_0054(local_ac, UNK_unaff_SS, 1, g_5D92, g_5D94); { 8900:1D4A }
            if ((cVar2 = $0) and then ((Ptr<Byte>((SmallInt(g_5D92) + 199)))^ < $10)) then begin { 8900:1D4A; region anchor, exact origin unknown }
              PString(FarPtr(SS, BPAddr(-$A5))) := Copy('Sell', 1, $28); { 8900:1D6C }
              local_b7 := $0; { 8900:1D71 }
            end else begin { 8900:1D71; region anchor, exact origin unknown }
              PString(FarPtr(SS, BPAddr(-$A5))) := Copy('Sell Keep', 1, $28); { 8900:1D87 }
              local_b7 := $1; { 8900:1D8C }
            end; { 8900:1D8C; region anchor, exact origin unknown }
            puVar10 := local_c2; { 8900:1D8C; region anchor, exact origin unknown }
            uVar8 := UNK_unaff_SS; { 8900:1D8C; region anchor, exact origin unknown }
            PString(FarPtr(SS, BPAddr(-$C0))) := 'You can : '; { 8900:1D9C }
            local_55 := stub_ov25_e2(@local_b6, UNK_unaff_SS, (Word(UNK_extraout_AH_07) shl 8), MakeWord(UNK_extraout_AH_07, 1), MakeWord(UNK_extraout_AH_07, $F), MakeWord(UNK_extraout_AH_07, 10), MakeWord(UNK_extraout_AH_07, $D), local_a7, UNK_unaff_SS, puVar10, uVar8); { 8900:1DBC }
            if ((local_55 = $4B) and then (local_b7 = $0)) then begin { 8900:1DBC; region anchor, exact origin unknown }
              local_b4 := GetMem($3F); { 8900:1DDB }
              FillChar(0, $3F, local_b4); { 8900:1DF5 }
              uVar8 := Word((LongWord(local_b4) shr $10)); { 8900:1DF5; region anchor, exact origin unknown }
              iVar7 := SmallInt(local_b4); { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Word>((iVar7 + $2A)))^ := 0; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Word>((iVar7 + $2C)))^ := 0; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar7 + $34)))^ := 0; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar7 + $31)))^ := $65; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar7 + $30)))^ := 0; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar7 + $2F)))^ := 0; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar7 + $2E)))^ := $46; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Word>((iVar7 + $3A)))^ := local_aa; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Word>((iVar7 + $37)))^ := 1; { 8900:1DF5; region anchor, exact origin unknown }
              (Ptr<Byte>((iVar7 + $35)))^ := 0; { 8900:1DF5; region anchor, exact origin unknown }
              uVar9 := Word((LongWord(g_5D92) shr $10)); { 8900:1DF5; region anchor, exact origin unknown }
              iVar6 := (Ptr<SmallInt>((SmallInt(g_5D92) + 200)))^; { 8900:1DF5; region anchor, exact origin unknown }
              iVar1 := (Ptr<SmallInt>((SmallInt(g_5D92) + $CA)))^; { 8900:1DF5; region anchor, exact origin unknown }
              local_b0 := MakeLong(iVar1, iVar6); { 8900:1E62 }
              if ((iVar6 = 0) and then (iVar1 = 0)) then begin { 8900:1E62; region anchor, exact origin unknown }
                local_b0 := local_b4; { 8900:1E7C }
              end else begin { 8900:1E7C; region anchor, exact origin unknown }
                while true do begin { 8900:1E7C; region anchor, exact origin unknown }
                  uVar9 := Word((LongWord(local_b0) shr $10)); { 8900:1E7C; region anchor, exact origin unknown }
                  iVar6 := SmallInt(local_b0); { 8900:1E7C; region anchor, exact origin unknown }
                  if (((Ptr<SmallInt>((iVar6 + $2A)))^ = 0) and then ((Ptr<SmallInt>((iVar6 + $2C)))^ = 0)) then begin { 8900:1E7C; region anchor, exact origin unknown }
                    Break; { 8900:1E7C; region anchor, exact origin unknown }
                  end; { 8900:1E7C; region anchor, exact origin unknown }
                  local_b0 := MakeLong((Ptr<Word>((iVar6 + $2C)))^, (Ptr<Word>((iVar6 + $2A)))^); { 8900:1EA0 }
                end; { 8900:1EA0; region anchor, exact origin unknown }
                (Ptr<SmallInt>((iVar6 + $2A)))^ := iVar7; { 8900:1EA0; region anchor, exact origin unknown }
                (Ptr<Word>((iVar6 + $2C)))^ := uVar8; { 8900:1EA0; region anchor, exact origin unknown }
              end; { 8900:1EA0; region anchor, exact origin unknown }
            end else begin { 8900:1EA0; region anchor, exact origin unknown }
              local_aa := Ptr<ShortInt>((Word(local_aa) div 5)); { 8900:1ECB }
              FUN_8900_0203(local_aa); { 8900:1ED4 }
            end; { 8900:1ED4; region anchor, exact origin unknown }
          end; { 8900:1ED4; region anchor, exact origin unknown }
        end else begin { 8900:1ED4; region anchor, exact origin unknown }
          if (local_55 = $4A) then begin { 8900:1ED4; region anchor, exact origin unknown }
            if ((Ptr<SmallInt>((iVar6 + $94)))^ <> 0) then begin { 8900:1ED4; region anchor, exact origin unknown }
              (Ptr<SmallInt>((iVar6 + $94)))^ := ((Ptr<SmallInt>((iVar6 + $94)))^ + (-1)); { 8900:1ED4; region anchor, exact origin unknown }
              local_a8 := stub_ov24_e8(100, 1); { 8900:1EFF }
              if ((local_a8 = 0) or else (10 < local_a8)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                if ((local_a8 < $B) or else ($14 < local_a8)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                  if ((local_a8 < $15) or else ($28 < local_a8)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                    if ((local_a8 < $29) or else ($32 < local_a8)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                      if ((local_a8 < $33) or else ($46 < local_a8)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                        if ((local_a8 < $47) or else ($5A < local_a8)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                          if (($5A < local_a8) and then (local_a8 < $65)) then begin { 8900:1EFF; region anchor, exact origin unknown }
                            Random($384); { 8900:1F18 }
                            LongToReal(UNK_register_ABI); { 8900:1F1F }
                            iVar6 := Trunc(); { 8900:1F24 }
                            local_aa := Ptr<ShortInt>((iVar6 + 2000)); { 8900:1F2F }
                          end; { 8900:1F2F; region anchor, exact origin unknown }
                        end else begin { 8900:1F2F; region anchor, exact origin unknown }
                          Random($3E8); { 8900:1F42 }
                          LongToReal(UNK_register_ABI); { 8900:1F49 }
                          iVar6 := Trunc(); { 8900:1F4E }
                          local_aa := Ptr<ShortInt>((iVar6 + 2000)); { 8900:1F59 }
                        end; { 8900:1F59; region anchor, exact origin unknown }
                      end else begin { 8900:1F59; region anchor, exact origin unknown }
                        Random($5DC); { 8900:1F6C }
                        LongToReal(UNK_register_ABI); { 8900:1F73 }
                        iVar6 := Trunc(); { 8900:1F78 }
                        local_aa := Ptr<ShortInt>((iVar6 + 1000)); { 8900:1F83 }
                      end; { 8900:1F83; region anchor, exact origin unknown }
                    end else begin { 8900:1F83; region anchor, exact origin unknown }
                      Random($9C4); { 8900:1F96 }
                      LongToReal(UNK_register_ABI); { 8900:1F9D }
                      iVar6 := Trunc(); { 8900:1FA2 }
                      local_aa := Ptr<ShortInt>((iVar6 + 500)); { 8900:1FAD }
                    end; { 8900:1FAD; region anchor, exact origin unknown }
                  end else begin { 8900:1FAD; region anchor, exact origin unknown }
                    Random($1388); { 8900:1FBF }
                    LongToReal(UNK_register_ABI); { 8900:1FC6 }
                    iVar6 := Trunc(); { 8900:1FCB }
                    local_aa := Ptr<ShortInt>((iVar6 + 300)); { 8900:1FD6 }
                  end; { 8900:1FD6; region anchor, exact origin unknown }
                end else begin { 8900:1FD6; region anchor, exact origin unknown }
                  Random($1770); { 8900:1FE8 }
                  LongToReal(UNK_register_ABI); { 8900:1FEF }
                  iVar6 := Trunc(); { 8900:1FF4 }
                  local_aa := Ptr<ShortInt>((iVar6 + 200)); { 8900:1FFF }
                end; { 8900:1FFF; region anchor, exact origin unknown }
              end else begin { 8900:1FFF; region anchor, exact origin unknown }
                Random($2710); { 8900:2011 }
                LongToReal(UNK_register_ABI); { 8900:2018 }
                iVar6 := Trunc(); { 8900:201D }
                local_aa := Ptr<ShortInt>((iVar6 + 100)); { 8900:2028 }
              end; { 8900:2028; region anchor, exact origin unknown }
              Str(LongInt(MakeLong(0, BPWord(-$A8))), PString(FarPtr(SS, BPAddr(-$52)))); { 8900:2040 }
              puVar10 := local_1b7; { 8900:2040; region anchor, exact origin unknown }
              uVar8 := UNK_unaff_SS; { 8900:2040; region anchor, exact origin unknown }
              PString(FarPtr(SS, BPAddr(-$1B5))) := 'The Jewel is Valued at '; { 8900:2050 }
              PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + PString(FarPtr(SS, BPAddr(-$52))); { 8900:205A }
              PString(FarPtr(SS, BPAddr(-$1B5))) := PString(FarPtr(SS, BPAddr(-$1B5))) + ' gp.'; { 8900:2064 }
              PString(FarPtr(SS, BPAddr(-$29))) := Copy(PString(FarPtr(SS, BPAddr(-$1B5))), 1, $28); { 8900:2072 }
              FUN_0709_0626(local_2b, UNK_unaff_SS, MakeWord(UNK_extraout_AH_08, $F), MakeWord(UNK_extraout_AH_08, $C), MakeWord(UNK_extraout_AH_08, 1)); { 8900:2085 }
              cVar2 := ov21_0054(local_ac, UNK_unaff_SS, 1, g_5D92, g_5D94); { 8900:209D }
              if ((cVar2 = $0) and then ((Ptr<Byte>((SmallInt(g_5D92) + 199)))^ < $10)) then begin { 8900:209D; region anchor, exact origin unknown }
                PString(FarPtr(SS, BPAddr(-$A5))) := Copy('Sell', 1, $28); { 8900:20BF }
                local_b7 := $0; { 8900:20C4 }
              end else begin { 8900:20C4; region anchor, exact origin unknown }
                PString(FarPtr(SS, BPAddr(-$A5))) := Copy('Sell Keep', 1, $28); { 8900:20DA }
                local_b7 := $1; { 8900:20DF }
              end; { 8900:20DF; region anchor, exact origin unknown }
              puVar10 := local_c2; { 8900:20DF; region anchor, exact origin unknown }
              uVar8 := UNK_unaff_SS; { 8900:20DF; region anchor, exact origin unknown }
              PString(FarPtr(SS, BPAddr(-$C0))) := 'You can : '; { 8900:20EF }
              local_55 := stub_ov25_e2(@local_b6, UNK_unaff_SS, (Word(UNK_extraout_AH_09) shl 8), MakeWord(UNK_extraout_AH_09, 1), MakeWord(UNK_extraout_AH_09, $F), MakeWord(UNK_extraout_AH_09, 10), MakeWord(UNK_extraout_AH_09, $D), local_a7, UNK_unaff_SS, puVar10, uVar8); { 8900:210F }
              if ((local_55 = $4B) and then (local_b7 = $0)) then begin { 8900:210F; region anchor, exact origin unknown }
                local_b4 := GetMem($3F); { 8900:212E }
                FillChar(0, $3F, local_b4); { 8900:2148 }
                uVar8 := Word((LongWord(local_b4) shr $10)); { 8900:2148; region anchor, exact origin unknown }
                iVar7 := SmallInt(local_b4); { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Word>((iVar7 + $2A)))^ := 0; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Word>((iVar7 + $2C)))^ := 0; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar7 + $34)))^ := 0; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar7 + $31)))^ := $D6; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar7 + $30)))^ := 0; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar7 + $2F)))^ := 0; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar7 + $2E)))^ := $46; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Word>((iVar7 + $3A)))^ := local_aa; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Word>((iVar7 + $37)))^ := 1; { 8900:2148; region anchor, exact origin unknown }
                (Ptr<Byte>((iVar7 + $35)))^ := 0; { 8900:2148; region anchor, exact origin unknown }
                uVar9 := Word((LongWord(g_5D92) shr $10)); { 8900:2148; region anchor, exact origin unknown }
                iVar6 := (Ptr<SmallInt>((SmallInt(g_5D92) + 200)))^; { 8900:2148; region anchor, exact origin unknown }
                iVar1 := (Ptr<SmallInt>((SmallInt(g_5D92) + $CA)))^; { 8900:2148; region anchor, exact origin unknown }
                local_b0 := MakeLong(iVar1, iVar6); { 8900:21B5 }
                if ((iVar6 = 0) and then (iVar1 = 0)) then begin { 8900:21B5; region anchor, exact origin unknown }
                  local_b0 := local_b4; { 8900:21CF }
                end else begin { 8900:21CF; region anchor, exact origin unknown }
                  while true do begin { 8900:21CF; region anchor, exact origin unknown }
                    uVar9 := Word((LongWord(local_b0) shr $10)); { 8900:21CF; region anchor, exact origin unknown }
                    iVar6 := SmallInt(local_b0); { 8900:21CF; region anchor, exact origin unknown }
                    if (((Ptr<SmallInt>((iVar6 + $2A)))^ = 0) and then ((Ptr<SmallInt>((iVar6 + $2C)))^ = 0)) then begin { 8900:21CF; region anchor, exact origin unknown }
                      Break; { 8900:21CF; region anchor, exact origin unknown }
                    end; { 8900:21CF; region anchor, exact origin unknown }
                    local_b0 := MakeLong((Ptr<Word>((iVar6 + $2C)))^, (Ptr<Word>((iVar6 + $2A)))^); { 8900:21F3 }
                  end; { 8900:21F3; region anchor, exact origin unknown }
                  (Ptr<SmallInt>((iVar6 + $2A)))^ := iVar7; { 8900:21F3; region anchor, exact origin unknown }
                  (Ptr<Word>((iVar6 + $2C)))^ := uVar8; { 8900:21F3; region anchor, exact origin unknown }
                end; { 8900:21F3; region anchor, exact origin unknown }
              end else begin { 8900:21F3; region anchor, exact origin unknown }
                local_aa := Ptr<ShortInt>((Word(local_aa) div 5)); { 8900:221E }
                FUN_8900_0203(local_aa); { 8900:2227 }
              end; { 8900:2227; region anchor, exact origin unknown }
            end; { 8900:2227; region anchor, exact origin unknown }
          end else begin { 8900:2227; region anchor, exact origin unknown }
            if ((local_55 = $45) or else (local_55 = $0)) then begin { 8900:2227; region anchor, exact origin unknown }
              local_b5 := $1; { 8900:2234 }
            end; { 8900:2234; region anchor, exact origin unknown }
          end; { 8900:2234; region anchor, exact origin unknown }
        end; { 8900:2234; region anchor, exact origin unknown }
        FUN_00ba_0bb8(g_5D92, g_5D94); { 8900:2241 }
      end; { 8900:2241; region anchor, exact origin unknown }
    until not ((local_b5 = $0)); { 8900:2241; region anchor, exact origin unknown }
  end; { 8900:2241; region anchor, exact origin unknown }
  Exit; { 8900:2253 }
end;
```

### ov21:2256 ov21_init (conf L)

Original `ov21_init`. Params (ABI order): none exported; implicit callback/register inputs may exist.
BP access inventory (hex offset:byte widths): none.
Locals/SSA temporaries: none.
Callers: none exported; indirect callback use unknown.
Callees (listing): none.

Unit initializer or short helper; role unverified. Evidence: decode/listings/ov21.lst at 8900:2256, paired .c.

```pascal
procedure ov21_init();
begin
  Exit; { 8900:225A }
end;
```

### Callback pointer table installed by ov12:31A2

The following are actual stored far-stub addresses, with analysis-only targets resolved through the original overlay header entry table. Slot is an ordinal from g_682C, not a proven effect ID. The missing g_6988 pointer is not assigned by this initializer.

| Slot ordinal | DS pointer | Runtime stub pointer | Static analysis target |
| --- | --- | --- | --- |
| 0 | g_682C | 0041:002A | ov12:010D |
| 1 | g_6830 | 0041:002F | ov12:011D |
| 2 | g_6834 | 0041:0034 | ov12:013B |
| 3 | g_6838 | 0041:0039 | ov12:017F |
| 4 | g_683C | 0041:0264 | ov12:319B |
| 5 | g_6840 | 0041:003E | ov12:01C3 |
| 6 | g_6844 | 0041:0043 | ov12:0233 |
| 7 | g_6848 | 0041:0048 | ov12:0377 |
| 8 | g_684C | 0041:004D | ov12:03AC |
| 9 | g_6850 | 0041:0052 | ov12:03E1 |
| 10 | g_6854 | 0041:0057 | ov12:0400 |
| 11 | g_6858 | 0041:005C | ov12:04BA |
| 12 | g_685C | 0041:0264 | ov12:319B |
| 13 | g_6860 | 0041:0061 | ov12:05D6 |
| 14 | g_6864 | 0041:0066 | ov12:05EB |
| 15 | g_6868 | 0041:006B | ov12:0647 |
| 16 | g_686C | 0041:0070 | ov12:064E |
| 17 | g_6870 | 0041:0075 | ov12:0679 |
| 18 | g_6874 | 0041:0264 | ov12:319B |
| 19 | g_6878 | 0041:007A | ov12:06E4 |
| 20 | g_687C | 0041:007F | ov12:070F |
| 21 | g_6880 | 0041:0084 | ov12:0775 |
| 22 | g_6884 | 0041:0089 | ov12:07E0 |
| 23 | g_6888 | 0041:0264 | ov12:319B |
| 24 | g_688C | 0041:008E | ov12:0918 |
| 25 | g_6890 | 0041:0093 | ov12:0947 |
| 26 | g_6894 | 0041:0264 | ov12:319B |
| 27 | g_6898 | 0041:0098 | ov12:09C0 |
| 28 | g_689C | 0041:009D | ov12:0A3D |
| 29 | g_68A0 | 0041:00A2 | ov12:0A65 |
| 30 | g_68A4 | 0041:00F7 | ov12:133F |
| 31 | g_68A8 | 0041:00A7 | ov12:0B1B |
| 32 | g_68AC | 0041:00AC | ov12:0BAC |
| 33 | g_68B0 | 0041:00B1 | ov12:0BCF |
| 34 | g_68B4 | 0041:00B6 | ov12:0C06 |
| 35 | g_68B8 | 0041:00BB | ov12:0C15 |
| 36 | g_68BC | 0041:00C0 | ov12:0C26 |
| 37 | g_68C0 | 0041:005C | ov12:04BA |
| 38 | g_68C4 | 0041:00C5 | ov12:0C4B |
| 39 | g_68C8 | 0041:00CA | ov12:0CC3 |
| 40 | g_68CC | 0041:00CF | ov12:1086 |
| 41 | g_68D0 | 0041:00D4 | ov12:10C1 |
| 42 | g_68D4 | 0041:00D9 | ov12:10DE |
| 43 | g_68D8 | 0041:00DE | ov12:1168 |
| 44 | g_68DC | 0041:0048 | ov12:0377 |
| 45 | g_68E0 | 0041:004D | ov12:03AC |
| 46 | g_68E4 | 0041:00E3 | ov12:11F9 |
| 47 | g_68E8 | 0041:00E8 | ov12:1276 |
| 48 | g_68EC | 0041:00ED | ov12:12B2 |
| 49 | g_68F0 | 0041:00F2 | ov12:12FB |
| 50 | g_68F4 | 0041:00F7 | ov12:133F |
| 51 | g_68F8 | 0041:00F7 | ov12:133F |
| 52 | g_68FC | 0041:00F7 | ov12:133F |
| 53 | g_6900 | 0041:00FC | ov12:1355 |
| 54 | g_6904 | 0041:0101 | ov12:135C |
| 55 | g_6908 | 0041:0106 | ov12:1363 |
| 56 | g_690C | 0041:010B | ov12:1399 |
| 57 | g_6910 | 0041:0110 | ov12:1452 |
| 58 | g_6914 | 0041:0115 | ov12:1472 |
| 59 | g_6918 | 0041:0264 | ov12:319B |
| 60 | g_691C | 0041:011A | ov12:1490 |
| 61 | g_6920 | 0041:011F | ov12:14EB |
| 62 | g_6924 | 0041:0264 | ov12:319B |
| 63 | g_6928 | 0041:0124 | ov12:165D |
| 64 | g_692C | 0041:0129 | ov12:1671 |
| 65 | g_6930 | 0041:012E | ov12:1685 |
| 66 | g_6934 | 0041:0133 | ov12:1699 |
| 67 | g_6938 | 0041:0138 | ov12:16BB |
| 68 | g_693C | 0041:013D | ov12:16E6 |
| 69 | g_6940 | 0041:0142 | ov12:170B |
| 70 | g_6944 | 0041:0147 | ov12:171F |
| 71 | g_6948 | 0041:014C | ov12:1730 |
| 72 | g_694C | 0068:008E | ov13:39D2 |
| 73 | g_6950 | 0068:0093 | ov13:3A86 |
| 74 | g_6954 | 0041:0151 | ov12:176F |
| 75 | g_6958 | 0041:0156 | ov12:18B5 |
| 76 | g_695C | 0041:015B | ov12:1935 |
| 77 | g_6960 | 0041:0160 | ov12:19D9 |
| 78 | g_6964 | 0041:0165 | ov12:1A19 |
| 79 | g_6968 | 0041:016A | ov12:1A4C |
| 80 | g_696C | 0041:016F | ov12:1AAA |
| 81 | g_6970 | 0041:0174 | ov12:1BA8 |
| 82 | g_6974 | 0041:0179 | ov12:1CAD |
| 83 | g_6978 | 0041:017E | ov12:1E77 |
| 84 | g_697C | 0041:0183 | ov12:23A4 |
| 85 | g_6980 | 0041:0188 | ov12:23C2 |
| 86 | g_6984 | 0041:018D | ov12:23EC |
| 87 | g_6988 | unassigned | unknown |
| 88 | g_698C | 0041:0192 | ov12:2490 |
| 89 | g_6990 | 0041:0197 | ov12:24D9 |
| 90 | g_6994 | 0041:019C | ov12:2556 |
| 91 | g_6998 | 0041:0264 | ov12:319B |
| 92 | g_699C | 0041:01A1 | ov12:25A2 |
| 93 | g_69A0 | 0041:01A6 | ov12:25BC |
| 94 | g_69A4 | 0041:01AB | ov12:2610 |
| 95 | g_69A8 | 0041:01B0 | ov12:264B |
| 96 | g_69AC | 0041:01B5 | ov12:268A |
| 97 | g_69B0 | 0041:01BA | ov12:2700 |
| 98 | g_69B4 | 0041:01BF | ov12:2730 |
| 99 | g_69B8 | 0041:01C4 | ov12:27D9 |
| 100 | g_69BC | 0041:01C9 | ov12:2814 |
| 101 | g_69C0 | 0041:01CE | ov12:2866 |
| 102 | g_69C4 | 0041:01D3 | ov12:28BF |
| 103 | g_69C8 | 0041:01D8 | ov12:2901 |
| 104 | g_69CC | 0041:01DD | ov12:2976 |
| 105 | g_69D0 | 0041:01E2 | ov12:2984 |
| 106 | g_69D4 | 0041:01E7 | ov12:2992 |
| 107 | g_69D8 | 0041:01EC | ov12:29B6 |
| 108 | g_69DC | 0041:01F1 | ov12:29CB |
| 109 | g_69E0 | 0041:01F6 | ov12:29D9 |
| 110 | g_69E4 | 0041:01FB | ov12:29F0 |
| 111 | g_69E8 | 0041:0200 | ov12:2A11 |
| 112 | g_69EC | 0041:0205 | ov12:2A28 |
| 113 | g_69F0 | 0041:020A | ov12:2A6D |
| 114 | g_69F4 | 0041:020F | ov12:2A87 |
| 115 | g_69F8 | 0041:0214 | ov12:2AE6 |
| 116 | g_69FC | 0041:0219 | ov12:2B20 |
| 117 | g_6A00 | 0041:021E | ov12:2B63 |
| 118 | g_6A04 | 0041:0223 | ov12:2B7D |
| 119 | g_6A08 | 0041:0228 | ov12:2BC8 |
| 120 | g_6A0C | 0041:022D | ov12:2C1C |
| 121 | g_6A10 | 0041:0232 | ov12:2D38 |
| 122 | g_6A14 | 0041:0237 | ov12:2D88 |
| 123 | g_6A18 | 0041:023C | ov12:2DE4 |
| 124 | g_6A1C | 0041:0241 | ov12:2E08 |
| 125 | g_6A20 | 0041:0246 | ov12:2E37 |
| 126 | g_6A24 | 0041:0264 | ov12:319B |
| 127 | g_6A28 | 0041:024B | ov12:2EDA |
| 128 | g_6A2C | 0041:024B | ov12:2EDA |
| 129 | g_6A30 | 0041:024B | ov12:2EDA |
| 130 | g_6A34 | 0041:0250 | ov12:2F57 |
| 131 | g_6A38 | 0041:0255 | ov12:30A5 |
| 132 | g_6A3C | 0041:024B | ov12:2EDA |
| 133 | g_6A40 | 0041:024B | ov12:2EDA |
| 134 | g_6A44 | 0041:025A | ov12:3134 |
| 135 | g_6A48 | 0041:024B | ov12:2EDA |
| 136 | g_6A4C | 0041:025F | ov12:317A |
| 137 | g_6A50 | 0041:024B | ov12:2EDA |
| 138 | g_6A54 | 0041:024B | ov12:2EDA |

## Screens

Static text inventory follows, including resource names and non-display comparison strings. Dynamic character names, item descriptions, spell names and menu table strings are represented by pointer expressions in the corresponding bodies; their full contents depend on game data. Coordinates are text cells where stated; unknown coordinates are explicitly unresolved.

| Screen / routine | Text / placement | Accepted keys / behavior | Evidence / confidence |
| --- | --- | --- | --- |
| Memory error ov00:0042 | WARNING: Insufficient Memory; Insufficient Memory. Exiting Program; bottom message helper | Save retry or terminate depending g_49D0; original return policy unresolved | H strings/calls; M handler policy |
| Title/credits ov01:0206/0627 | TITLE 1/2 graphics; credits literal inventory below; coordinates retained in draw-call arguments | Timed polling/key skip; 0899:0104 itself is a no-op | M expanded bodies |
| Wheel ov02:00FD | Instruction rows 1/2, outer row5 with glyphs col8/9 row6, inner row8 with glyphs col8/9 row9; path row13; row14 instruction; input bottom row; 0-based columns/rows | Six-character input, uppercase; Return/Escape via input helper; three attempts; randomized challenge each attempt | M glyphs +40h, optional FF second glyph; DS0002 records stride21 |
| Shop ov06:0030/053E | Shop Items: Buy; dynamic prices; Not enough Money.; OverLoaded; shopkeeper leftover money warning | B Buy,V View,T Take,P Pool,S Share,A Appraise,E Exit,O/G select member; options depend on pool state | M menu dispatch |
| Training hall ov16:0161 | Choose a function; dynamic roster; I Understand, master... override | C create,D drop,M modify,T train,V view,A add,R remove,L load,S save,B begin,E exit; J STING override | M dispatch; menu layout dynamic |
| Creation/modification ov16:056C..209F | Race/gender/class/alignment/attribute choices; name, Keep Exit; Drop forever and Are you sure? | Selection keys and values retained in bodies; parent-frame splits prevent complete key-path verification | L shared frame; static text inventory below |
| Training ov16:29AE | Training eligibility, funds and level messages; exact literal inventory below | Member selection/menu acceptance delegated to ov25; training normally costs1000gp | M body; caps/table semantics not fully named |
| Portrait/icon ov16:33E7..382D | Head/body; ready/action; small/large; hair/face/body colors; Keep Exit confirmation | Dynamic menus; exact cursor/key mapping unresolved beyond expanded cases | M bodies; L screenshot equivalence |
| Save/load ov17 | Disk prompts; slots A..J; charlist.txt and sidecar names are resources | Slot A..J, save prompt S; retry on disk failure | M1602/1D58/22D5; see SAVES.md |
| Rest ov20:05F0/0721/0C9A | Rest Time: ; Rest daYs Hours Mins Inc Dec Exit; whole party healed; has memorized; has scribed; interrupted | Y/H/M select, I/D adjust,R rest,E exit; extended arrows; any key asks stop confirmation | M bodies; cursor positions as call arguments |
| Treasure ov21 | Overloaded; Gems Gold Platinum Electrum Silver Copper Jewelry; quantity; appraisal Keep/Sell | Digits0..9,Backspace,Return/Escape for amount; K keep,S sell; money name disambiguation in0B93 | M bodies; full menu table positions unresolved |
| Effect messages ov12 | Dynamic member name plus effect/ability strings in inventory: silenced, poison, paralysis, fear, gaze, level drain, disease, acid, strength | Timed/shared message helper; usually no local input; cross-reference COMBAT/MAGIC | M callbacks; numeric effect IDs not fully assigned |

### Literal inventory

| Segment:offset | Pascal string (spaces preserved) | Referencing routine |
| --- | --- | --- |
| 2000:0000 | `WARNING: Insufficient Memory` | ov00_0042 |
| 2000:001D | `Insufficient Memory. Exiting Program` | ov00_0042 |
| 2500:004B | `scenario created by:` | FUN_2500_0206 |
| 2500:0060 | `tsr, inc.` | FUN_2500_0206 |
| 2500:006A | `jim ward` | FUN_2500_0206 |
| 2500:0073 | `david cook,steve winter,mike breault` | FUN_2500_0206 |
| 2500:0098 | `game created by:` | FUN_2500_0206 |
| 2500:00A9 | `ssi special projects` | FUN_2500_0206 |
| 2500:00BE | `version 1.3` | FUN_2500_0206 |
| 2500:00CA | `programming:` | FUN_2500_0206 |
| 2500:00D7 | `original` | FUN_2500_0206 |
| 2500:00E0 | `scot bayless` | FUN_2500_0206 |
| 2500:00ED | `brad myers` | FUN_2500_0206 |
| 2500:00F8 | `keith brors` | FUN_2500_0206 |
| 2500:0104 | `russ brown` | FUN_2500_0206 |
| 2500:010F | `ted greer` | FUN_2500_0206 |
| 2500:0119 | `graphic arts:` | FUN_2500_0206 |
| 2500:0127 | `encounter coding:` | FUN_2500_0206 |
| 2500:0139 | `tom wahl` | FUN_2500_0206 |
| 2500:0142 | `paul murray` | FUN_2500_0206 |
| 2500:014E | `fred butts` | FUN_2500_0206 |
| 2500:0159 | `darla marasco` | FUN_2500_0206 |
| 2500:0167 | `victor penman` | FUN_2500_0206 |
| 2500:0175 | `susan halbleib` | FUN_2500_0206 |
| 2500:0184 | `dave shelley` | FUN_2500_0206 |
| 2500:0191 | `project manager` | FUN_2500_0206 |
| 2500:01A1 | `developer:` | FUN_2500_0206 |
| 2500:01AC | `george mac donald` | FUN_2500_0206 |
| 2500:01BE | `testing:` | FUN_2500_0206 |
| 2500:01C7 | `joel billings,steve salyer` | FUN_2500_0206 |
| 2500:01E2 | `james kucera,robert daly,rick white` | FUN_2500_0206 |
| 2500:0621 | `title` | ov01_0627 |
| 2A00:0001 | `USE THE TRANSLATION WHEEL TO DECIPHER` | ov02_00FD |
| 2A00:0027 | `THE CODE WORD.` | ov02_00FD |
| 2A00:0036 | `MATCH THE ESPRUAR RUNE (OUTER RING)` | ov02_00FD |
| 2A00:005A | `WITH THE DETHEK RUNE (INNER RING)` | ov02_00FD |
| 2A00:007C | `AND READ THE CODE WORD UNDER THE PATH:` | ov02_00FD |
| 2A00:00A3 | `     ` | ov02_00FD |
| 2A00:00A9 | `READ FROM THE INSIDE TO THE OUTSIDE.` | ov02_00FD |
| 2A00:00CE | `INPUT THE CODE WORD: ` | ov02_00FD |
| 2A00:00E4 | `Sorry, that's incorrect.` | ov02_00FD |
| 3E00:0000 | `                              ` | FUN_3e00_0030 |
| 3E00:001F | `Shop` | FUN_3e00_0030 |
| 3E00:0024 | `Items: ` | FUN_3e00_0030 |
| 3E00:002C | `Buy` | FUN_3e00_0030 |
| 3E00:022E | `OverLoaded` | ov06_0239 |
| 3E00:034F | `Not enough Money.` | FUN_3e00_0361 |
| 3E00:0474 | `Buy View Take Pool Share Appraise Exit` | ov06_053E |
| 3E00:049B | `Buy View Pool Appraise Exit` | ov06_053E |
| 3E00:04B7 | `~Yes ~No` | ov06_053E |
| 3E00:04C0 | `As you Leave the Shopkeeper says, "Excuse me but you have Left Some Money here."  ` | ov06_053E |
| 3E00:0513 | `Do you want to go back and get your Money?` | ov06_053E |
| 5700:0000 | `Loading...Please Wait` | ov11_002D |
| 5700:0016 | `sqrpaci` | ov11_002D |
| 5700:001E | `COMSPR` | ov11_002D |
| 5700:0025 | `ITEMS` | ov11_002D |
| 5700:002B | `:` | ov11_002D |
| 5C00:016F | `starts to train` | ov12_017F |
| 5C00:0228 | `is hardier` | ov12_0233 |
| 5C00:0703 | `is silenced` | ov12_070F |
| 5C00:0764 | `dies from poison` | ov12_0775 |
| 5C00:07D2 | `Gains an item` | ov12_07E0 |
| 5C00:09B2 | `lost an image` | ov12_09C0 |
| 5C00:0A59 | `is coughing` | ov12_0A65 |
| 5C00:0B11 | `collapses` | ov12_0B1B |
| 5C00:0C46 | `ages` | ov12_0C4B |
| 5C00:0CA8 | `The air clears a little...` | ov12_0CC3 |
| 5C00:0FA2 | `Avoids it` | FUN_5c00_0fac |
| 5C00:10D2 | `is weakened` | ov12_10DE |
| 5C00:1268 | `BUGBEAR` | ov12_1276 |
| 5C00:1270 | `GNOLL` | ov12_1276 |
| 5C00:1382 | `Rots...` | ov12_1399 |
| 5C00:138A | `Dies rots away` | ov12_1399 |
| 5C00:152F | `is Poisoned` | FUN_5c00_1545 |
| 5C00:153B | `is killed` | FUN_5c00_1545 |
| 5C00:15DE | `is Paralyzed` | FUN_5c00_15eb |
| 5C00:175E | `Sucks some Blood` | ov12_176F |
| 5C00:1928 | `is held fast` | ov12_1935 |
| 5C00:1A7F | `is paralyzed with fear` | ov12_1AAA |
| 5C00:1A96 | `is weakened by fear` | ov12_1AAA |
| 5C00:1B91 | `is paralyzed with fear` | ov12_1BA8 |
| 5C00:1C8D | `gazes...` | ov12_1CAD |
| 5C00:1C96 | `reflects it!` | ov12_1CAD |
| 5C00:1CA3 | `is Stoned` | ov12_1CAD |
| 5C00:1E63 | `Gazes...` | ov12_1E77 |
| 5C00:1E6C | `is charmed` | ov12_1E77 |
| 5C00:20DF | ` levels` | FUN_5c00_2122 |
| 5C00:20E7 | `a level` | FUN_5c00_2122 |
| 5C00:20EF | `is drained ` | FUN_5c00_2122 |
| 5C00:20FB | `is dead forever` | FUN_5c00_2122 |
| 5C00:210B | `max,cur,lost` | FUN_5c00_2122 |
| 5C00:2118 | `is killed` | FUN_5c00_2122 |
| 5C00:23E0 | `is Diseased` | ov12_23EC |
| 5C00:2548 | `is unaffected` | ov12_2556 |
| 5C00:2605 | `Falls dead` | ov12_2610 |
| 5C00:28A5 | `Turns gaseous and escapes` | ov12_28BF |
| 5C00:2C11 | `Spits Acid` | ov12_2C1C |
| 5C00:2F4B | `is stronger` | ov12_2F57 |
| 5C00:311B | `Must have Giant Strength` | ov12_3134 |
| 7000:00E3 | `Choose a function ` | ov16_0161 |
| 7000:0136 | `Quit to DOS ` | ov16_0161 |
| 7000:0143 | `STING` | ov16_0161 |
| 7000:0149 | `I Understand, master...` | ov16_0161 |
| 7000:04F1 | `Pick Race` | FUN_7000_056c |
| 7000:04FB | `  ` | FUN_7000_056c |
| 7000:04FF | `Pick Gender` | FUN_7000_056c |
| 7000:050B | `Pick Class` | FUN_7000_056c |
| 7000:0516 | `Pick Alignment` | FUN_7000_056c |
| 7000:0545 | `Keep this character? ` | FUN_7000_1551 |
| 7000:055B | `Character name: ` | FUN_7000_1551 |
| 7000:1ED2 | `Drop ` | FUN_7000_1f37 |
| 7000:1ED8 | ` forever? ` | FUN_7000_1f37 |
| 7000:1EE3 | `Are you sure? ` | FUN_7000_1f37 |
| 7000:1EF2 | `You dump ` | FUN_7000_1f37 |
| 7000:1EFC | ` out back.` | FUN_7000_1f37 |
| 7000:1F07 | ` bids you farewell.` | FUN_7000_1f37 |
| 7000:1F1B | ` breathes a sigh of relief.` | FUN_7000_1f37 |
| 7000:206E | ` can't be modified.` | FUN_7000_209f |
| 7000:2082 | `Modify character: ` | FUN_7000_209f |
| 7000:2095 | `Keep Exit` | FUN_7000_209f |
| 7000:28EE | `we only train conscious people` | FUN_7000_29ae |
| 7000:290D | `Training costs 1000 gp.` | FUN_7000_29ae |
| 7000:2925 | `We don't train that class here` | FUN_7000_29ae |
| 7000:2944 | `Not Enough Experience` | FUN_7000_29ae |
| 7000:295A | ` will become:` | FUN_7000_29ae |
| 7000:2968 | `    a level ` | FUN_7000_29ae |
| 7000:2975 | ` ` | FUN_7000_29ae |
| 7000:2977 | `and a level ` | FUN_7000_29ae |
| 7000:2984 | `Do you wish to train? ` | FUN_7000_29ae |
| 7000:299B | `Congratulations...` | FUN_7000_29ae |
| 7000:304F | `Add a character: ` | FUN_7000_306d |
| 7000:3061 | `Add Exit` | FUN_7000_306d |
| 7000:306A | `* ` | FUN_7000_306d |
| 7000:33D8 | `Head Body Keep` | FUN_7000_33e7 |
| 7000:37C9 | `old` | ov16_382D |
| 7000:37CD | `ready   action` | ov16_382D |
| 7000:37DC | `new` | ov16_382D |
| 7000:37E0 | `Small` | ov16_382D |
| 7000:37E6 | `Large` | ov16_382D |
| 7000:37EC | `Hair` | ov16_382D |
| 7000:37F1 | `Face` | ov16_382D |
| 7000:3816 | `ICON` | ov16_382D |
| 7000:381B | `Is this icon ok? ` | ov16_382D |
| 7500:0000 | `charlist.txt` | ov17_0010 |
| 7500:000D | `* ` | ov17_0010 |
| 7500:0197 | `charlist.txt` | ov17_01B8 |
| 7500:01A4 | `Put save disk in ` | ov17_01B8 |
| 7500:01B6 | `:` | ov17_01B8 |
| 7500:029A | `Put save disk in ` | FUN_7500_02ae |
| 7500:02AC | `:` | FUN_7500_02ae |
| 7500:0476 | `CHEAD` | ov17_0482 |
| 7500:047C | `CBODY` | ov17_0482 |
| 7500:0674 | `.cha` | ov17_069E |
| 7500:0679 | `.` | ov17_069E |
| 7500:067B | `.sav` | ov17_069E |
| 7500:0680 | `Put save disk in ` | ov17_069E |
| 7500:0692 | `:` | ov17_069E |
| 7500:0694 | `.itm` | ov17_069E |
| 7500:0699 | `.spc` | ov17_069E |
| 7500:0AC4 | `Put save disk in ` | ov17_0AEC |
| 7500:0AD6 | `:` | ov17_0AEC |
| 7500:0AD8 | `.sav` | ov17_0AEC |
| 7500:0ADD | `.cha` | ov17_0AEC |
| 7500:0AE2 | `.itm` | ov17_0AEC |
| 7500:0AE7 | `.spc` | ov17_0AEC |
| 7500:0E98 | `MON` | ov17_0EC4 |
| 7500:0E9C | `CHA` | ov17_0EC4 |
| 7500:0EA0 | `.dax` | ov17_0EC4 |
| 7500:0EA5 | `Unable to load monster` | ov17_0EC4 |
| 7500:0EBC | `SPC` | ov17_0EC4 |
| 7500:0EC0 | `ITM` | ov17_0EC4 |
| 7500:157F | `savgam` | ov17_1602 |
| 7500:1586 | `.dat` | ov17_1602 |
| 7500:158B | ` ` | ov17_1602 |
| 7500:158D | `Load Which Game: ` | ov17_1602 |
| 7500:15BF | `Put save disk in ` | ov17_1602 |
| 7500:15D1 | `Loading...Please Wait` | ov17_1602 |
| 7500:15E7 | `.` | ov17_1602 |
| 7500:15E9 | `.sav` | ov17_1602 |
| 7500:15EE | `.cha` | ov17_1602 |
| 7500:15F3 | `.itm` | ov17_1602 |
| 7500:15F8 | `.spc` | ov17_1602 |
| 7500:15FD | `ICON` | ov17_1602 |
| 7500:1CC5 | `Save Which Game: ` | ov17_1D58 |
| 7500:1CD7 | `A B C D E F G H I J` | ov17_1D58 |
| 7500:1D0B | `savgam` | ov17_1D58 |
| 7500:1D12 | `.dat` | ov17_1D58 |
| 7500:1D17 | `Put save disk in ` | ov17_1D58 |
| 7500:1D29 | `:` | ov17_1D58 |
| 7500:1D2B | `Saving...Please Wait` | ov17_1D58 |
| 7500:1D40 | `CHRDAT` | ov17_1D58 |
| 7500:1D47 | `.` | ov17_1D58 |
| 7500:1D49 | `.cha` | ov17_1D58 |
| 7500:1D4E | `.itm` | ov17_1D58 |
| 7500:1D53 | `.spc` | ov17_1D58 |
| 7500:22B7 | `Save and exit  Insert disk #` | ov17_22D5 |
| 8400:0563 | `0` | FUN_8400_0565 |
| 8400:05E3 | `Rest Time:` | FUN_8400_05f0 |
| 8400:05EE | `:` | FUN_8400_05f0 |
| 8400:06D9 | `Rest   daYs Hours Mins   Inc Dec   Exit` | FUN_8400_0721 |
| 8400:0857 | `The Whole Party Is Healed` | FUN_8400_0871 |
| 8400:0917 | `has memorized` | FUN_8400_0925 |
| 8400:09DB | `has scribed` | FUN_8400_09e7 |
| 8400:0C6A | `Stop Resting? ` | ov20_0C9A |
| 8400:0C79 | `The Party is rudely interrupted!` | ov20_0C9A |
| 8900:01DB | `Overloaded.  Money will be put in Pool.` | FUN_8900_0203 |
| 8900:0441 | `Overloaded` | ov21_044C |
| 8900:0A7D | `Overloaded` | FUN_8900_0a88 |
| 8900:0B5A | `Gems ` | ov21_0B93 |
| 8900:0B60 | `Gold ` | ov21_0B93 |
| 8900:0B66 | `Platinum ` | ov21_0B93 |
| 8900:0B70 | `electrum ` | ov21_0B93 |
| 8900:0B7A | `silver ` | ov21_0B93 |
| 8900:0B82 | `Copper ` | ov21_0B93 |
| 8900:0B8A | `Jewelry ` | ov21_0B93 |
| 8900:0CBB | ` ` | ov21_0CEB |
| 8900:0CBD | `Select type of coin` | ov21_0CEB |
| 8900:0CD1 | `How much ` | ov21_0CEB |
| 8900:0CDB | `will you take? ` | ov21_0CEB |
| 8900:18E0 | `No Gems or Jewelry` | ov21_19B2 |
| 8900:18F3 | ` Gem` | ov21_19B2 |
| 8900:18F8 | ` Gems` | ov21_19B2 |
| 8900:18FE | ` piece of Jewelry` | ov21_19B2 |
| 8900:1910 | ` pieces of Jewelry` | ov21_19B2 |
| 8900:1923 | `You have a fine collection of:` | ov21_19B2 |
| 8900:1942 | `  Gems` | ov21_19B2 |
| 8900:1949 | `  Jewelry` | ov21_19B2 |
| 8900:1953 | ` Exit` | ov21_19B2 |
| 8900:1959 | `Appraise : ` | ov21_19B2 |
| 8900:1965 | `The Gem is Valued at ` | ov21_19B2 |
| 8900:197B | ` gp.` | ov21_19B2 |
| 8900:1980 | `Sell` | ov21_19B2 |
| 8900:1985 | `Sell Keep` | ov21_19B2 |
| 8900:198F | `You can : ` | ov21_19B2 |
| 8900:199A | `The Jewel is Valued at ` | ov21_19B2 |

## Globals

Direct DS memory references below include observed access widths and source instructions. Indexed arrays/address-taken fields can appear only in bodies; these are not inferred record declarations. All inferred names are annotations; identifiers stay g_XXXX.

| DS offset | Observed byte widths | Inferred role | Evidence | Conf |
| --- | --- | --- | --- | --- |
| g_0642 | 1 | unknown; retain numeric identifier | 7000:0350 CMP byte ptr [0x642],0x0          | L |
| g_066C | 1 | unknown; retain numeric identifier | 7000:01C4 MOV byte ptr [0x66c],0x1         ; 7000:0201 MOV byte ptr [0x66c],0x0         ; 7000:0362 CMP byte ptr [0x66c],0x0          | L |
| g_0696 | 1 | unknown; retain numeric identifier | 7000:01C9 MOV byte ptr [0x696],0x1         ; 7000:0206 MOV byte ptr [0x696],0x0         ; 7000:0374 CMP byte ptr [0x696],0x0          | L |
| g_06C0 | 1 | unknown; retain numeric identifier | 7000:01E1 MOV byte ptr [0x6c0],0x1         ; 7000:020B MOV byte ptr [0x6c0],0x0         ; 7000:0386 CMP byte ptr [0x6c0],0x0          | L |
| g_06EA | 1 | unknown; retain numeric identifier | 7000:01E6 MOV byte ptr [0x6ea],0x1         ; 7000:0210 MOV byte ptr [0x6ea],0x0         ; 7000:0398 CMP byte ptr [0x6ea],0x0          | L |
| g_0714 | 1 | unknown; retain numeric identifier | 7000:03B0 CMP byte ptr [0x714],0x0          | L |
| g_073E | 1 | unknown; retain numeric identifier | 7000:01EB MOV byte ptr [0x73e],0x1         ; 7000:0215 MOV byte ptr [0x73e],0x0         ; 7000:03C2 CMP byte ptr [0x73e],0x0          | L |
| g_0768 | 1 | unknown; retain numeric identifier | 7000:01F0 MOV byte ptr [0x768],0x0         ; 7000:021A MOV byte ptr [0x768],0x1         ; 7000:03FF CMP byte ptr [0x768],0x0          | L |
| g_0792 | 1 | unknown; retain numeric identifier | 7000:01F5 MOV byte ptr [0x792],0x1         ; 7000:021F MOV byte ptr [0x792],0x0         ; 7000:0421 CMP byte ptr [0x792],0x0          | L |
| g_07BC | 1 | unknown; retain numeric identifier | 7000:01FA MOV byte ptr [0x7bc],0x1         ; 7000:0224 MOV byte ptr [0x7bc],0x0         ; 7000:043D CMP byte ptr [0x7bc],0x0          | L |
| g_07E6 | 1 | unknown; retain numeric identifier | 7000:0462 CMP byte ptr [0x7e6],0x0          | L |
| g_0D30 | 2 | unknown; retain numeric identifier | 8900:0111 MOV CX,word ptr [0xd30]           | L |
| g_0D32 | 2 | unknown; retain numeric identifier | 8900:0115 MOV BX,word ptr [0xd32]           | L |
| g_260A | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_2736 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_273F | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_290D | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_31FA | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_31FB | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_363A | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3642 | 2 | unknown; retain numeric identifier | 8400:03B6 MOV AX,[0x3642]                   | L |
| g_3C7C | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3CF5 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DA3 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DA5 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DA7 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DA9 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DAA | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DAB | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DAC | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DAD | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DAE | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DAF | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DB0 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DB1 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3DB2 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E17 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E5B | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E5D | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E5E | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E63 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E65 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E66 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E6F | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E71 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3E72 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F31 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F33 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F35 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F37 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F81 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F82 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F83 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F84 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F85 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3F86 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_3FE7 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_408E | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_409B | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_409D | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_4263 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_4264 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_4414 | 2 | unknown; retain numeric identifier | 2000:00B5 MOV [0x4414],AX                   | L |
| g_4416 | 2 | unknown; retain numeric identifier | 2000:00B8 MOV word ptr [0x4416],DX          | L |
| g_465C | 1 | unknown; retain numeric identifier | 5700:0130 MOV byte ptr [0x465c],0x0        ; 5700:0137 INC byte ptr [0x465c]            ; 5700:013B MOV AL,[0x465c]                   | L |
| g_4660 | 1 | unknown; retain numeric identifier | 5700:05A6 MOV [0x4660],AL                   | L |
| g_468C | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_470C | 1 | STING training override | 7000:0175 MOV byte ptr [0x470c],0x0        ; 7000:01DA CMP byte ptr [0x470c],0x0        ; 7000:04CC MOV byte ptr [0x470c],0x1         | M |
| g_471C | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_49D0 | 1 | game/save recovery available flag | 2000:0069 CMP byte ptr [0x49d0],0x0         | M |
| g_49D1 | 1 | title/config flag | 2500:0690 CMP byte ptr [0x49d1],0x0         | M |
| g_49D2 | 2 | ECL region0 far pointer,800 bytes | 5700:003D MOV [0x49d2],AX                  ; 5700:0271 LES DI,[0x49d2]                  ; 7500:17F5 LES DI,[0x49d2]                   | M |
| g_49D4 | 2 | unknown; retain numeric identifier | 5700:0040 MOV word ptr [0x49d4],DX          | L |
| g_49D6 | 2 | ECL region1 far pointer,800 bytes | 5700:004D MOV [0x49d6],AX                  ; 5700:0283 LES DI,[0x49d6]                  ; 5700:03F5 LES DI,[0x49d6]                   | M |
| g_49D8 | 2 | unknown; retain numeric identifier | 5700:0050 MOV word ptr [0x49d8],DX          | L |
| g_49DA | 2 | ECL region2 far pointer,400 bytes | 5700:005D MOV [0x49da],AX                  ; 5700:0295 LES DI,[0x49da]                  ; 7500:182B LES DI,[0x49da]                   | M |
| g_49DC | 2 | unknown; retain numeric identifier | 5700:0060 MOV word ptr [0x49dc],DX          | L |
| g_49DE | 2 | ECL code far pointer,1E00 bytes | 5700:006D MOV [0x49de],AX                  ; 5700:02A7 LES DI,[0x49de]                  ; 7500:1846 LES DI,[0x49de]                   | M |
| g_49E0 | 2 | unknown; retain numeric identifier | 5700:0070 MOV word ptr [0x49e0],DX          | L |
| g_49E2 | 1 | unknown; retain numeric identifier | 5700:03C6 MOV byte ptr [0x49e2],0x1        ; 7500:1910 MOV [0x49e2],AL                  ; 7500:1EE8 MOV AL,[0x49e2]                   | L |
| g_49ED | 2 | unknown; retain numeric identifier | 5700:03C0 MOV word ptr [0x49ed],0x9900      | L |
| g_49F3 | 1 | game/screen mode | 5C00:00F3 CMP byte ptr [0x49f3],0x5        ; 5C00:062F CMP byte ptr [0x49f3],0x5        ; 5C00:11AF CMP byte ptr [0x49f3],0x5         | M |
| g_49F4 | 1 | unknown; retain numeric identifier | 5700:03CB MOV byte ptr [0x49f4],0x0         | L |
| g_49F5 | 1 | unknown; retain numeric identifier | 5700:0392 MOV byte ptr [0x49f5],0x1        ; 7500:1904 MOV [0x49f5],AL                  ; 7500:1EF6 MOV AL,[0x49f5]                   | L |
| g_49F6 | 1 | unknown; retain numeric identifier | 5700:0397 MOV byte ptr [0x49f6],0x1        ; 7500:18F5 MOV [0x49f6],AL                  ; 7500:1EFD MOV AL,[0x49f6]                   | L |
| g_49F7 | 1 | unknown; retain numeric identifier | 5700:039C MOV byte ptr [0x49f7],0x0         | L |
| g_49F8 | 1 | unknown; retain numeric identifier | 5700:03A6 MOV byte ptr [0x49f8],0x0        ; 7000:0412 MOV byte ptr [0x49f8],0x1         | L |
| g_49F9 | 1 | unknown; retain numeric identifier | 5700:03EB MOV byte ptr [0x49f9],0x1         | L |
| g_49FA | 1 | unknown; retain numeric identifier | 5700:03F0 MOV byte ptr [0x49fa],0x1        ; 7000:3EC4 CMP byte ptr [0x49fa],0x1        ; 7500:1BCD CMP byte ptr [0x49fa],0x2         | L |
| g_49FB | 2 | unknown; retain numeric identifier | 5700:03AD MOV [0x49fb],AX                  ; 8400:0DDB INC word ptr [0x49fb]            ; 8400:0DDF MOV AX,[0x49fb]                   | L |
| g_49FF | 1 | unknown; retain numeric identifier | 5700:0429 MOV byte ptr [0x49ff],0x0         | L |
| g_4A00 | 1 | unknown; retain numeric identifier | 5700:03A1 MOV byte ptr [0x4a00],0x1         | L |
| g_4A1E | 1 | unknown; retain numeric identifier | 2500:070E CMP byte ptr [0x4a1e],0x1        ; 7000:34E2 CMP byte ptr [0x4a1e],0x0        ; 7000:35DA CMP byte ptr [0x4a1e],0x1         | L |
| g_4A20 | 2 | unknown; retain numeric identifier | 7000:3514 PUSH word ptr [0x4a20]           ; 7000:354A PUSH word ptr [0x4a20]            | L |
| g_4A22 | 2 | unknown; retain numeric identifier | 7000:3510 PUSH word ptr [0x4a22]           ; 7000:3546 PUSH word ptr [0x4a22]            | L |
| g_4A24 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_4EC0 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5050 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_51E0 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5370 | 1 | unknown; retain numeric identifier | 5700:042E MOV byte ptr [0x5370],0x1         | L |
| g_5374 | 2 | unknown; retain numeric identifier | 5700:045D MOV [0x5374],AX                   | L |
| g_5376 | 1 | data-set index | 5700:03D0 MOV byte ptr [0x5376],0x1        ; 5700:0564 MOV AL,[0x5376]                  ; 7000:0168 MOV byte ptr [0x5376],0x3         | M |
| g_5377 | 1 | unknown; retain numeric identifier | 5700:03D5 MOV byte ptr [0x5377],0x1         | L |
| g_5378 | 2 | unknown; retain numeric identifier | 5700:03E0 MOV word ptr [0x5378],0x1         | L |
| g_537A | 1 | unknown; retain numeric identifier | 7500:02C4 MOV AL,[0x537a]                   | L |
| g_537B | 1 | unknown; retain numeric identifier | 7500:021C MOV AL,[0x537b]                  ; 7500:0302 MOV AL,[0x537b]                  ; 7500:088C MOV AL,[0x537b]                   | L |
| g_547A | 2 | unknown; retain numeric identifier | 5700:03DA MOV word ptr [0x547a],0x1         | L |
| g_547C | 1 | unknown; retain numeric identifier | 2500:0650 MOV byte ptr [0x547c],0x0        ; 5700:047C MOV byte ptr [0x547c],0x0         | L |
| g_547D | 1 | unknown; retain numeric identifier | 5700:0581 MOV AL,[0x547d]                  ; 7500:0BA4 MOV AL,[0x547d]                   | L |
| g_557C | 1 | unknown; retain numeric identifier | 5700:0438 MOV byte ptr [0x557c],0x0        ; 7500:107B MOV byte ptr [0x557c],0x1        ; 7500:1252 MOV byte ptr [0x557c],0x0         | L |
| g_557D | 1 | save success flag | 2000:0075 MOV AL,[0x557d]                  ; 5700:0447 MOV byte ptr [0x557d],0x0        ; 7000:0344 MOV byte ptr [0x557d],0x0         | M |
| g_5582 | indexed/address-taken | ITEMS catalog buffer | named routine body / ECL_VM map | M |
| g_5589 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5D92 | 2 | selected character far pointer | 5C00:00FE PUSH word ptr [0x5d92]           ; 5C00:037A LES DI,[0x5d92]                  ; 5C00:0386 LES DI,[0x5d92]                   | M |
| g_5D94 | 2 | unknown; retain numeric identifier | 5C00:00FA PUSH word ptr [0x5d94]           ; 5C00:0636 PUSH word ptr [0x5d94]           ; 5C00:091E PUSH word ptr [0x5d94]            | L |
| g_5D96 | 2 | party head far pointer | 5C00:1AB0 MOV AX,[0x5d96]                  ; 5C00:1BAE MOV AX,[0x5d96]                  ; 5700:03B2 MOV [0x5d96],AX                   | M |
| g_5D98 | 2 | unknown; retain numeric identifier | 5C00:1AB3 MOV DX,word ptr [0x5d98]         ; 5C00:1BB1 MOV DX,word ptr [0x5d98]         ; 5700:03B5 MOV [0x5d98],AX                   | L |
| g_5E1E | indexed/address-taken | BlockRead result count | named routine body / ECL_VM map | M |
| g_5E20 | 2 | font far pointer | 5700:007D MOV [0x5e20],AX                   | M |
| g_5E22 | 2 | unknown; retain numeric identifier | 5700:0080 MOV word ptr [0x5e22],DX          | L |
| g_5E4E | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5E52 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5E56 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5E5A | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5E5C | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5E5E | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5E60 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_5EB2 | 2 | unknown; retain numeric identifier | 7500:0412 LES DI,[0x5eb2]                  ; 7500:0529 PUSH word ptr [0x5eb2]            | L |
| g_5EB4 | 2 | unknown; retain numeric identifier | 7500:0525 PUSH word ptr [0x5eb4]            | L |
| g_5EB6 | 2 | unknown; retain numeric identifier | 7500:054D PUSH word ptr [0x5eb6]            | L |
| g_5EB8 | 2 | unknown; retain numeric identifier | 7500:0549 PUSH word ptr [0x5eb8]            | L |
| g_65B9 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_65BB | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_66D6 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_66D8 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_66DA | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_66DB | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_6715 | 1 | unknown; retain numeric identifier | 5C00:0DB5 MOV AL,[0x6715]                   | L |
| g_6716 | 2 | unknown; retain numeric identifier | 5C00:0E3B LES DI,[0x6716]                  ; 5C00:0E69 LES DI,[0x6716]                  ; 5C00:0F75 LES DI,[0x6716]                   | L |
| g_6718 | 2 | unknown; retain numeric identifier | 5C00:1EF5 PUSH word ptr [0x6718]            | L |
| g_67F4 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_67F6 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_6800 | 2 | unknown; retain numeric identifier | 8900:01CE MOV [0x6800],AX                   | L |
| g_6802 | 2 | unknown; retain numeric identifier | 8900:01D1 MOV word ptr [0x6802],DX          | L |
| g_6804 | 2 | unknown; retain numeric identifier | 8900:01BA MOV [0x6804],AX                  ; 8900:025E ADD AX,word ptr [0x6804]         ; 8900:026A MOV [0x6804],AX                   | L |
| g_6806 | 2 | unknown; retain numeric identifier | 8900:01BD MOV word ptr [0x6806],DX         ; 8900:0262 ADC DX,word ptr [0x6806]         ; 8900:026D MOV word ptr [0x6806],DX          | L |
| g_6810 | 2 | unknown; retain numeric identifier | 3E00:003A MOV AX,[0x6810]                  ; 3E00:016C MOV AX,[0x6810]                  ; 3E00:01E3 MOV AX,[0x6810]                   | L |
| g_6812 | 2 | unknown; retain numeric identifier | 3E00:003D MOV DX,word ptr [0x6812]         ; 3E00:016F MOV DX,word ptr [0x6812]         ; 3E00:01E6 MOV DX,word ptr [0x6812]          | L |
| g_6814 | indexed/address-taken | side counts | named routine body / ECL_VM map | M |
| g_6816 | 1 | combat modifier scratch | 5C00:039E ADD byte ptr [0x6816],0x2        ; 5C00:03D3 ADD byte ptr [0x6816],0x2        ; 5C00:03F7 ADD byte ptr [0x6816],0x3         | M |
| g_6817 | 1 | combat state scratch | 5C00:0009 MOV AL,[0x6817]                  ; 5C00:0016 MOV byte ptr [0x6817],0x0        ; 5C00:2947 CMP byte ptr [0x6817],0x0         | M |
| g_6818 | 1 | pending damage/state scratch | 5C00:0011 MOV byte ptr [0x6818],0x0        ; 5C00:0166 ADD byte ptr [0x6818],0x2        ; 5C00:0219 ADD byte ptr [0x6818],AL          | M |
| g_6819 | 1 | combat flags/type scratch | 5C00:021D MOV byte ptr [0x6819],0x9        ; 5C00:03E4 MOV AL,[0x6819]                  ; 5C00:0616 MOV byte ptr [0x6819],0x0         | M |
| g_681A | 1 | unknown; retain numeric identifier | 5C00:0C98 MOV AL,[0x681a]                  ; 5C00:0C9F MOV [0x681a],AL                  ; 5C00:10C4 MOV AL,[0x681a]                   | L |
| g_681B | 1 | unknown; retain numeric identifier | 5C00:0669 CMP byte ptr [0x681b],0xf        ; 5C00:09DD CMP byte ptr [0x681b],0x0        ; 5C00:1F70 MOV byte ptr [0x681b],0xa         | L |
| g_681C | 1 | unknown; retain numeric identifier | 5C00:149F MOV AL,[0x681c]                  ; 5C00:14BC CMP AL,byte ptr [0x681c]         ; 5C00:14C2 MOV AL,[0x681c]                   | L |
| g_681D | 1 | unknown; retain numeric identifier | 5C00:1462 CMP byte ptr [0x681d],0x0         | L |
| g_681E | 1 | unknown; retain numeric identifier | 5C00:0937 MOV byte ptr [0x681e],0x1        ; 5C00:0C38 MOV byte ptr [0x681e],0x1        ; 5C00:1722 MOV byte ptr [0x681e],0x1         | L |
| g_681F | 1 | unknown; retain numeric identifier | 5C00:0025 CMP byte ptr [0x681f],0x0        ; 5C00:07AE MOV byte ptr [0x681f],0x1        ; 5C00:07C7 MOV byte ptr [0x681f],0x0         | L |
| g_6820 | 1 | unknown; retain numeric identifier | 5C00:09E4 CMP byte ptr [0x6820],0x0         | L |
| g_6821 | 1 | unknown; retain numeric identifier | 5C00:3082 MOV byte ptr [0x6821],0x1        ; 5C00:3110 MOV byte ptr [0x6821],0x1         | L |
| g_6822 | 1 | combat modifier scratch | 5C00:0115 INC byte ptr [0x6822]            ; 5C00:0133 DEC byte ptr [0x6822]            ; 5C00:0161 ADD byte ptr [0x6822],0x2         | M |
| g_6823 | 1 | unknown; retain numeric identifier | 5C00:1013 DEC byte ptr [0x6823]             | L |
| g_6825 | 1 | combat modifier scratch | 5C00:0110 ADD byte ptr [0x6825],0x5        ; 5C00:0120 CMP byte ptr [0x6825],0x5        ; 5C00:0127 MOV byte ptr [0x6825],0x0         | M |
| g_6826 | 2 | combat target far pointer | 5C00:014E MOV [0x6826],AX                  ; 5C00:0155 LES DI,[0x6826]                  ; 5C00:01D9 MOV [0x6826],AX                   | M |
| g_6828 | 2 | unknown; retain numeric identifier | 5C00:0151 MOV word ptr [0x6828],DX         ; 5C00:01DC MOV word ptr [0x6828],DX         ; 5C00:0692 MOV word ptr [0x6828],DX          | L |
| g_682A | 1 | unknown; retain numeric identifier | 5C00:24DF CMP byte ptr [0x682a],0x0        ; 5C00:2690 CMP byte ptr [0x682a],0x4        ; 5C00:2697 CMP byte ptr [0x682a],0x2         | L |
| g_682C | 2 | effect callback far-pointer table base | 5C00:31AB MOV [0x682c],AX                   | M |
| g_682E | 2 | unknown; retain numeric identifier | 5C00:31AE MOV word ptr [0x682e],DX          | L |
| g_6830 | 2 | unknown; retain numeric identifier | 5C00:31B8 MOV [0x6830],AX                   | L |
| g_6832 | 2 | unknown; retain numeric identifier | 5C00:31BB MOV word ptr [0x6832],DX          | L |
| g_6834 | 2 | unknown; retain numeric identifier | 5C00:31C5 MOV [0x6834],AX                   | L |
| g_6836 | 2 | unknown; retain numeric identifier | 5C00:31C8 MOV word ptr [0x6836],DX          | L |
| g_6838 | 2 | unknown; retain numeric identifier | 5C00:31D2 MOV [0x6838],AX                   | L |
| g_683A | 2 | unknown; retain numeric identifier | 5C00:31D5 MOV word ptr [0x683a],DX          | L |
| g_683C | 2 | unknown; retain numeric identifier | 5C00:31DF MOV [0x683c],AX                   | L |
| g_683E | 2 | unknown; retain numeric identifier | 5C00:31E2 MOV word ptr [0x683e],DX          | L |
| g_6840 | 2 | unknown; retain numeric identifier | 5C00:31EC MOV [0x6840],AX                   | L |
| g_6842 | 2 | unknown; retain numeric identifier | 5C00:31EF MOV word ptr [0x6842],DX          | L |
| g_6844 | 2 | unknown; retain numeric identifier | 5C00:31F9 MOV [0x6844],AX                   | L |
| g_6846 | 2 | unknown; retain numeric identifier | 5C00:31FC MOV word ptr [0x6846],DX          | L |
| g_6848 | 2 | unknown; retain numeric identifier | 5C00:3206 MOV [0x6848],AX                   | L |
| g_684A | 2 | unknown; retain numeric identifier | 5C00:3209 MOV word ptr [0x684a],DX          | L |
| g_684C | 2 | unknown; retain numeric identifier | 5C00:3213 MOV [0x684c],AX                   | L |
| g_684E | 2 | unknown; retain numeric identifier | 5C00:3216 MOV word ptr [0x684e],DX          | L |
| g_6850 | 2 | unknown; retain numeric identifier | 5C00:3220 MOV [0x6850],AX                   | L |
| g_6852 | 2 | unknown; retain numeric identifier | 5C00:3223 MOV word ptr [0x6852],DX          | L |
| g_6854 | 2 | unknown; retain numeric identifier | 5C00:322D MOV [0x6854],AX                   | L |
| g_6856 | 2 | unknown; retain numeric identifier | 5C00:3230 MOV word ptr [0x6856],DX          | L |
| g_6858 | 2 | unknown; retain numeric identifier | 5C00:323A MOV [0x6858],AX                   | L |
| g_685A | 2 | unknown; retain numeric identifier | 5C00:323D MOV word ptr [0x685a],DX          | L |
| g_685C | 2 | unknown; retain numeric identifier | 5C00:3247 MOV [0x685c],AX                   | L |
| g_685E | 2 | unknown; retain numeric identifier | 5C00:324A MOV word ptr [0x685e],DX          | L |
| g_6860 | 2 | unknown; retain numeric identifier | 5C00:3254 MOV [0x6860],AX                   | L |
| g_6862 | 2 | unknown; retain numeric identifier | 5C00:3257 MOV word ptr [0x6862],DX          | L |
| g_6864 | 2 | unknown; retain numeric identifier | 5C00:3261 MOV [0x6864],AX                   | L |
| g_6866 | 2 | unknown; retain numeric identifier | 5C00:3264 MOV word ptr [0x6866],DX          | L |
| g_6868 | 2 | unknown; retain numeric identifier | 5C00:326E MOV [0x6868],AX                   | L |
| g_686A | 2 | unknown; retain numeric identifier | 5C00:3271 MOV word ptr [0x686a],DX          | L |
| g_686C | 2 | unknown; retain numeric identifier | 5C00:327B MOV [0x686c],AX                   | L |
| g_686E | 2 | unknown; retain numeric identifier | 5C00:327E MOV word ptr [0x686e],DX          | L |
| g_6870 | 2 | unknown; retain numeric identifier | 5C00:3288 MOV [0x6870],AX                   | L |
| g_6872 | 2 | unknown; retain numeric identifier | 5C00:328B MOV word ptr [0x6872],DX          | L |
| g_6874 | 2 | unknown; retain numeric identifier | 5C00:3295 MOV [0x6874],AX                   | L |
| g_6876 | 2 | unknown; retain numeric identifier | 5C00:3298 MOV word ptr [0x6876],DX          | L |
| g_6878 | 2 | unknown; retain numeric identifier | 5C00:32A2 MOV [0x6878],AX                   | L |
| g_687A | 2 | unknown; retain numeric identifier | 5C00:32A5 MOV word ptr [0x687a],DX          | L |
| g_687C | 2 | unknown; retain numeric identifier | 5C00:32AF MOV [0x687c],AX                   | L |
| g_687E | 2 | unknown; retain numeric identifier | 5C00:32B2 MOV word ptr [0x687e],DX          | L |
| g_6880 | 2 | unknown; retain numeric identifier | 5C00:32BC MOV [0x6880],AX                   | L |
| g_6882 | 2 | unknown; retain numeric identifier | 5C00:32BF MOV word ptr [0x6882],DX          | L |
| g_6884 | 2 | unknown; retain numeric identifier | 5C00:32C9 MOV [0x6884],AX                   | L |
| g_6886 | 2 | unknown; retain numeric identifier | 5C00:32CC MOV word ptr [0x6886],DX          | L |
| g_6888 | 2 | unknown; retain numeric identifier | 5C00:32D6 MOV [0x6888],AX                   | L |
| g_688A | 2 | unknown; retain numeric identifier | 5C00:32D9 MOV word ptr [0x688a],DX          | L |
| g_688C | 2 | unknown; retain numeric identifier | 5C00:32E3 MOV [0x688c],AX                   | L |
| g_688E | 2 | unknown; retain numeric identifier | 5C00:32E6 MOV word ptr [0x688e],DX          | L |
| g_6890 | 2 | unknown; retain numeric identifier | 5C00:32F0 MOV [0x6890],AX                   | L |
| g_6892 | 2 | unknown; retain numeric identifier | 5C00:32F3 MOV word ptr [0x6892],DX          | L |
| g_6894 | 2 | unknown; retain numeric identifier | 5C00:32FD MOV [0x6894],AX                   | L |
| g_6896 | 2 | unknown; retain numeric identifier | 5C00:3300 MOV word ptr [0x6896],DX          | L |
| g_6898 | 2 | unknown; retain numeric identifier | 5C00:330A MOV [0x6898],AX                   | L |
| g_689A | 2 | unknown; retain numeric identifier | 5C00:330D MOV word ptr [0x689a],DX          | L |
| g_689C | 2 | unknown; retain numeric identifier | 5C00:3317 MOV [0x689c],AX                   | L |
| g_689E | 2 | unknown; retain numeric identifier | 5C00:331A MOV word ptr [0x689e],DX          | L |
| g_68A0 | 2 | unknown; retain numeric identifier | 5C00:3324 MOV [0x68a0],AX                   | L |
| g_68A2 | 2 | unknown; retain numeric identifier | 5C00:3327 MOV word ptr [0x68a2],DX          | L |
| g_68A4 | 2 | unknown; retain numeric identifier | 5C00:3331 MOV [0x68a4],AX                   | L |
| g_68A6 | 2 | unknown; retain numeric identifier | 5C00:3334 MOV word ptr [0x68a6],DX          | L |
| g_68A8 | 2 | unknown; retain numeric identifier | 5C00:333E MOV [0x68a8],AX                   | L |
| g_68AA | 2 | unknown; retain numeric identifier | 5C00:3341 MOV word ptr [0x68aa],DX          | L |
| g_68AC | 2 | unknown; retain numeric identifier | 5C00:334B MOV [0x68ac],AX                   | L |
| g_68AE | 2 | unknown; retain numeric identifier | 5C00:334E MOV word ptr [0x68ae],DX          | L |
| g_68B0 | 2 | unknown; retain numeric identifier | 5C00:3358 MOV [0x68b0],AX                   | L |
| g_68B2 | 2 | unknown; retain numeric identifier | 5C00:335B MOV word ptr [0x68b2],DX          | L |
| g_68B4 | 2 | unknown; retain numeric identifier | 5C00:3365 MOV [0x68b4],AX                   | L |
| g_68B6 | 2 | unknown; retain numeric identifier | 5C00:3368 MOV word ptr [0x68b6],DX          | L |
| g_68B8 | 2 | unknown; retain numeric identifier | 5C00:3372 MOV [0x68b8],AX                   | L |
| g_68BA | 2 | unknown; retain numeric identifier | 5C00:3375 MOV word ptr [0x68ba],DX          | L |
| g_68BC | 2 | unknown; retain numeric identifier | 5C00:337F MOV [0x68bc],AX                   | L |
| g_68BE | 2 | unknown; retain numeric identifier | 5C00:3382 MOV word ptr [0x68be],DX          | L |
| g_68C0 | 2 | unknown; retain numeric identifier | 5C00:338C MOV [0x68c0],AX                   | L |
| g_68C2 | 2 | unknown; retain numeric identifier | 5C00:338F MOV word ptr [0x68c2],DX          | L |
| g_68C4 | 2 | unknown; retain numeric identifier | 5C00:3399 MOV [0x68c4],AX                   | L |
| g_68C6 | 2 | unknown; retain numeric identifier | 5C00:339C MOV word ptr [0x68c6],DX          | L |
| g_68C8 | 2 | unknown; retain numeric identifier | 5C00:33A6 MOV [0x68c8],AX                   | L |
| g_68CA | 2 | unknown; retain numeric identifier | 5C00:33A9 MOV word ptr [0x68ca],DX          | L |
| g_68CC | 2 | unknown; retain numeric identifier | 5C00:33B3 MOV [0x68cc],AX                   | L |
| g_68CE | 2 | unknown; retain numeric identifier | 5C00:33B6 MOV word ptr [0x68ce],DX          | L |
| g_68D0 | 2 | unknown; retain numeric identifier | 5C00:33C0 MOV [0x68d0],AX                   | L |
| g_68D2 | 2 | unknown; retain numeric identifier | 5C00:33C3 MOV word ptr [0x68d2],DX          | L |
| g_68D4 | 2 | unknown; retain numeric identifier | 5C00:33CD MOV [0x68d4],AX                   | L |
| g_68D6 | 2 | unknown; retain numeric identifier | 5C00:33D0 MOV word ptr [0x68d6],DX          | L |
| g_68D8 | 2 | unknown; retain numeric identifier | 5C00:33DA MOV [0x68d8],AX                   | L |
| g_68DA | 2 | unknown; retain numeric identifier | 5C00:33DD MOV word ptr [0x68da],DX          | L |
| g_68DC | 2 | unknown; retain numeric identifier | 5C00:33E7 MOV [0x68dc],AX                   | L |
| g_68DE | 2 | unknown; retain numeric identifier | 5C00:33EA MOV word ptr [0x68de],DX          | L |
| g_68E0 | 2 | unknown; retain numeric identifier | 5C00:33F4 MOV [0x68e0],AX                   | L |
| g_68E2 | 2 | unknown; retain numeric identifier | 5C00:33F7 MOV word ptr [0x68e2],DX          | L |
| g_68E4 | 2 | unknown; retain numeric identifier | 5C00:3401 MOV [0x68e4],AX                   | L |
| g_68E6 | 2 | unknown; retain numeric identifier | 5C00:3404 MOV word ptr [0x68e6],DX          | L |
| g_68E8 | 2 | unknown; retain numeric identifier | 5C00:340E MOV [0x68e8],AX                   | L |
| g_68EA | 2 | unknown; retain numeric identifier | 5C00:3411 MOV word ptr [0x68ea],DX          | L |
| g_68EC | 2 | unknown; retain numeric identifier | 5C00:341B MOV [0x68ec],AX                   | L |
| g_68EE | 2 | unknown; retain numeric identifier | 5C00:341E MOV word ptr [0x68ee],DX          | L |
| g_68F0 | 2 | unknown; retain numeric identifier | 5C00:3428 MOV [0x68f0],AX                   | L |
| g_68F2 | 2 | unknown; retain numeric identifier | 5C00:342B MOV word ptr [0x68f2],DX          | L |
| g_68F4 | 2 | unknown; retain numeric identifier | 5C00:3435 MOV [0x68f4],AX                   | L |
| g_68F6 | 2 | unknown; retain numeric identifier | 5C00:3438 MOV word ptr [0x68f6],DX          | L |
| g_68F8 | 2 | unknown; retain numeric identifier | 5C00:3442 MOV [0x68f8],AX                   | L |
| g_68FA | 2 | unknown; retain numeric identifier | 5C00:3445 MOV word ptr [0x68fa],DX          | L |
| g_68FC | 2 | unknown; retain numeric identifier | 5C00:344F MOV [0x68fc],AX                   | L |
| g_68FE | 2 | unknown; retain numeric identifier | 5C00:3452 MOV word ptr [0x68fe],DX          | L |
| g_6900 | 2 | unknown; retain numeric identifier | 5C00:345C MOV [0x6900],AX                   | L |
| g_6902 | 2 | unknown; retain numeric identifier | 5C00:345F MOV word ptr [0x6902],DX          | L |
| g_6904 | 2 | unknown; retain numeric identifier | 5C00:3469 MOV [0x6904],AX                   | L |
| g_6906 | 2 | unknown; retain numeric identifier | 5C00:346C MOV word ptr [0x6906],DX          | L |
| g_6908 | 2 | unknown; retain numeric identifier | 5C00:3476 MOV [0x6908],AX                   | L |
| g_690A | 2 | unknown; retain numeric identifier | 5C00:3479 MOV word ptr [0x690a],DX          | L |
| g_690C | 2 | unknown; retain numeric identifier | 5C00:3483 MOV [0x690c],AX                   | L |
| g_690E | 2 | unknown; retain numeric identifier | 5C00:3486 MOV word ptr [0x690e],DX          | L |
| g_6910 | 2 | unknown; retain numeric identifier | 5C00:3490 MOV [0x6910],AX                   | L |
| g_6912 | 2 | unknown; retain numeric identifier | 5C00:3493 MOV word ptr [0x6912],DX          | L |
| g_6914 | 2 | unknown; retain numeric identifier | 5C00:349D MOV [0x6914],AX                   | L |
| g_6916 | 2 | unknown; retain numeric identifier | 5C00:34A0 MOV word ptr [0x6916],DX          | L |
| g_6918 | 2 | unknown; retain numeric identifier | 5C00:34AA MOV [0x6918],AX                   | L |
| g_691A | 2 | unknown; retain numeric identifier | 5C00:34AD MOV word ptr [0x691a],DX          | L |
| g_691C | 2 | unknown; retain numeric identifier | 5C00:34B7 MOV [0x691c],AX                   | L |
| g_691E | 2 | unknown; retain numeric identifier | 5C00:34BA MOV word ptr [0x691e],DX          | L |
| g_6920 | 2 | unknown; retain numeric identifier | 5C00:34C4 MOV [0x6920],AX                   | L |
| g_6922 | 2 | unknown; retain numeric identifier | 5C00:34C7 MOV word ptr [0x6922],DX          | L |
| g_6924 | 2 | unknown; retain numeric identifier | 5C00:34D1 MOV [0x6924],AX                   | L |
| g_6926 | 2 | unknown; retain numeric identifier | 5C00:34D4 MOV word ptr [0x6926],DX          | L |
| g_6928 | 2 | unknown; retain numeric identifier | 5C00:34DE MOV [0x6928],AX                   | L |
| g_692A | 2 | unknown; retain numeric identifier | 5C00:34E1 MOV word ptr [0x692a],DX          | L |
| g_692C | 2 | unknown; retain numeric identifier | 5C00:34EB MOV [0x692c],AX                   | L |
| g_692E | 2 | unknown; retain numeric identifier | 5C00:34EE MOV word ptr [0x692e],DX          | L |
| g_6930 | 2 | unknown; retain numeric identifier | 5C00:34F8 MOV [0x6930],AX                   | L |
| g_6932 | 2 | unknown; retain numeric identifier | 5C00:34FB MOV word ptr [0x6932],DX          | L |
| g_6934 | 2 | unknown; retain numeric identifier | 5C00:3505 MOV [0x6934],AX                   | L |
| g_6936 | 2 | unknown; retain numeric identifier | 5C00:3508 MOV word ptr [0x6936],DX          | L |
| g_6938 | 2 | unknown; retain numeric identifier | 5C00:3512 MOV [0x6938],AX                   | L |
| g_693A | 2 | unknown; retain numeric identifier | 5C00:3515 MOV word ptr [0x693a],DX          | L |
| g_693C | 2 | unknown; retain numeric identifier | 5C00:351F MOV [0x693c],AX                   | L |
| g_693E | 2 | unknown; retain numeric identifier | 5C00:3522 MOV word ptr [0x693e],DX          | L |
| g_6940 | 2 | unknown; retain numeric identifier | 5C00:352C MOV [0x6940],AX                   | L |
| g_6942 | 2 | unknown; retain numeric identifier | 5C00:352F MOV word ptr [0x6942],DX          | L |
| g_6944 | 2 | unknown; retain numeric identifier | 5C00:3539 MOV [0x6944],AX                   | L |
| g_6946 | 2 | unknown; retain numeric identifier | 5C00:353C MOV word ptr [0x6946],DX          | L |
| g_6948 | 2 | unknown; retain numeric identifier | 5C00:3546 MOV [0x6948],AX                   | L |
| g_694A | 2 | unknown; retain numeric identifier | 5C00:3549 MOV word ptr [0x694a],DX          | L |
| g_694C | 2 | unknown; retain numeric identifier | 5C00:3553 MOV [0x694c],AX                   | L |
| g_694E | 2 | unknown; retain numeric identifier | 5C00:3556 MOV word ptr [0x694e],DX          | L |
| g_6950 | 2 | unknown; retain numeric identifier | 5C00:3560 MOV [0x6950],AX                   | L |
| g_6952 | 2 | unknown; retain numeric identifier | 5C00:3563 MOV word ptr [0x6952],DX          | L |
| g_6954 | 2 | unknown; retain numeric identifier | 5C00:356D MOV [0x6954],AX                   | L |
| g_6956 | 2 | unknown; retain numeric identifier | 5C00:3570 MOV word ptr [0x6956],DX          | L |
| g_6958 | 2 | unknown; retain numeric identifier | 5C00:357A MOV [0x6958],AX                   | L |
| g_695A | 2 | unknown; retain numeric identifier | 5C00:357D MOV word ptr [0x695a],DX          | L |
| g_695C | 2 | unknown; retain numeric identifier | 5C00:3587 MOV [0x695c],AX                   | L |
| g_695E | 2 | unknown; retain numeric identifier | 5C00:358A MOV word ptr [0x695e],DX          | L |
| g_6960 | 2 | unknown; retain numeric identifier | 5C00:3594 MOV [0x6960],AX                   | L |
| g_6962 | 2 | unknown; retain numeric identifier | 5C00:3597 MOV word ptr [0x6962],DX          | L |
| g_6964 | 2 | unknown; retain numeric identifier | 5C00:35A1 MOV [0x6964],AX                   | L |
| g_6966 | 2 | unknown; retain numeric identifier | 5C00:35A4 MOV word ptr [0x6966],DX          | L |
| g_6968 | 2 | unknown; retain numeric identifier | 5C00:35AE MOV [0x6968],AX                   | L |
| g_696A | 2 | unknown; retain numeric identifier | 5C00:35B1 MOV word ptr [0x696a],DX          | L |
| g_696C | 2 | unknown; retain numeric identifier | 5C00:35BB MOV [0x696c],AX                   | L |
| g_696E | 2 | unknown; retain numeric identifier | 5C00:35BE MOV word ptr [0x696e],DX          | L |
| g_6970 | 2 | unknown; retain numeric identifier | 5C00:35C8 MOV [0x6970],AX                   | L |
| g_6972 | 2 | unknown; retain numeric identifier | 5C00:35CB MOV word ptr [0x6972],DX          | L |
| g_6974 | 2 | unknown; retain numeric identifier | 5C00:35D5 MOV [0x6974],AX                   | L |
| g_6976 | 2 | unknown; retain numeric identifier | 5C00:35D8 MOV word ptr [0x6976],DX          | L |
| g_6978 | 2 | unknown; retain numeric identifier | 5C00:35E2 MOV [0x6978],AX                   | L |
| g_697A | 2 | unknown; retain numeric identifier | 5C00:35E5 MOV word ptr [0x697a],DX          | L |
| g_697C | 2 | unknown; retain numeric identifier | 5C00:35EF MOV [0x697c],AX                   | L |
| g_697E | 2 | unknown; retain numeric identifier | 5C00:35F2 MOV word ptr [0x697e],DX          | L |
| g_6980 | 2 | unknown; retain numeric identifier | 5C00:35FC MOV [0x6980],AX                   | L |
| g_6982 | 2 | unknown; retain numeric identifier | 5C00:35FF MOV word ptr [0x6982],DX          | L |
| g_6984 | 2 | unknown; retain numeric identifier | 5C00:3609 MOV [0x6984],AX                   | L |
| g_6986 | 2 | unknown; retain numeric identifier | 5C00:360C MOV word ptr [0x6986],DX          | L |
| g_698C | 2 | unknown; retain numeric identifier | 5C00:3616 MOV [0x698c],AX                   | L |
| g_698E | 2 | unknown; retain numeric identifier | 5C00:3619 MOV word ptr [0x698e],DX          | L |
| g_6990 | 2 | unknown; retain numeric identifier | 5C00:3623 MOV [0x6990],AX                   | L |
| g_6992 | 2 | unknown; retain numeric identifier | 5C00:3626 MOV word ptr [0x6992],DX          | L |
| g_6994 | 2 | unknown; retain numeric identifier | 5C00:3630 MOV [0x6994],AX                   | L |
| g_6996 | 2 | unknown; retain numeric identifier | 5C00:3633 MOV word ptr [0x6996],DX          | L |
| g_6998 | 2 | unknown; retain numeric identifier | 5C00:363D MOV [0x6998],AX                   | L |
| g_699A | 2 | unknown; retain numeric identifier | 5C00:3640 MOV word ptr [0x699a],DX          | L |
| g_699C | 2 | unknown; retain numeric identifier | 5C00:364A MOV [0x699c],AX                   | L |
| g_699E | 2 | unknown; retain numeric identifier | 5C00:364D MOV word ptr [0x699e],DX          | L |
| g_69A0 | 2 | unknown; retain numeric identifier | 5C00:3657 MOV [0x69a0],AX                   | L |
| g_69A2 | 2 | unknown; retain numeric identifier | 5C00:365A MOV word ptr [0x69a2],DX          | L |
| g_69A4 | 2 | unknown; retain numeric identifier | 5C00:3664 MOV [0x69a4],AX                   | L |
| g_69A6 | 2 | unknown; retain numeric identifier | 5C00:3667 MOV word ptr [0x69a6],DX          | L |
| g_69A8 | 2 | unknown; retain numeric identifier | 5C00:3671 MOV [0x69a8],AX                   | L |
| g_69AA | 2 | unknown; retain numeric identifier | 5C00:3674 MOV word ptr [0x69aa],DX          | L |
| g_69AC | 2 | unknown; retain numeric identifier | 5C00:367E MOV [0x69ac],AX                   | L |
| g_69AE | 2 | unknown; retain numeric identifier | 5C00:3681 MOV word ptr [0x69ae],DX          | L |
| g_69B0 | 2 | unknown; retain numeric identifier | 5C00:368B MOV [0x69b0],AX                   | L |
| g_69B2 | 2 | unknown; retain numeric identifier | 5C00:368E MOV word ptr [0x69b2],DX          | L |
| g_69B4 | 2 | unknown; retain numeric identifier | 5C00:3698 MOV [0x69b4],AX                   | L |
| g_69B6 | 2 | unknown; retain numeric identifier | 5C00:369B MOV word ptr [0x69b6],DX          | L |
| g_69B8 | 2 | unknown; retain numeric identifier | 5C00:36A5 MOV [0x69b8],AX                   | L |
| g_69BA | 2 | unknown; retain numeric identifier | 5C00:36A8 MOV word ptr [0x69ba],DX          | L |
| g_69BC | 2 | unknown; retain numeric identifier | 5C00:36B2 MOV [0x69bc],AX                   | L |
| g_69BE | 2 | unknown; retain numeric identifier | 5C00:36B5 MOV word ptr [0x69be],DX          | L |
| g_69C0 | 2 | unknown; retain numeric identifier | 5C00:36BF MOV [0x69c0],AX                   | L |
| g_69C2 | 2 | unknown; retain numeric identifier | 5C00:36C2 MOV word ptr [0x69c2],DX          | L |
| g_69C4 | 2 | unknown; retain numeric identifier | 5C00:36CC MOV [0x69c4],AX                   | L |
| g_69C6 | 2 | unknown; retain numeric identifier | 5C00:36CF MOV word ptr [0x69c6],DX          | L |
| g_69C8 | 2 | unknown; retain numeric identifier | 5C00:36D9 MOV [0x69c8],AX                   | L |
| g_69CA | 2 | unknown; retain numeric identifier | 5C00:36DC MOV word ptr [0x69ca],DX          | L |
| g_69CC | 2 | unknown; retain numeric identifier | 5C00:36E6 MOV [0x69cc],AX                   | L |
| g_69CE | 2 | unknown; retain numeric identifier | 5C00:36E9 MOV word ptr [0x69ce],DX          | L |
| g_69D0 | 2 | unknown; retain numeric identifier | 5C00:36F3 MOV [0x69d0],AX                   | L |
| g_69D2 | 2 | unknown; retain numeric identifier | 5C00:36F6 MOV word ptr [0x69d2],DX          | L |
| g_69D4 | 2 | unknown; retain numeric identifier | 5C00:3700 MOV [0x69d4],AX                   | L |
| g_69D6 | 2 | unknown; retain numeric identifier | 5C00:3703 MOV word ptr [0x69d6],DX          | L |
| g_69D8 | 2 | unknown; retain numeric identifier | 5C00:370D MOV [0x69d8],AX                   | L |
| g_69DA | 2 | unknown; retain numeric identifier | 5C00:3710 MOV word ptr [0x69da],DX          | L |
| g_69DC | 2 | unknown; retain numeric identifier | 5C00:371A MOV [0x69dc],AX                   | L |
| g_69DE | 2 | unknown; retain numeric identifier | 5C00:371D MOV word ptr [0x69de],DX          | L |
| g_69E0 | 2 | unknown; retain numeric identifier | 5C00:3727 MOV [0x69e0],AX                   | L |
| g_69E2 | 2 | unknown; retain numeric identifier | 5C00:372A MOV word ptr [0x69e2],DX          | L |
| g_69E4 | 2 | unknown; retain numeric identifier | 5C00:3734 MOV [0x69e4],AX                   | L |
| g_69E6 | 2 | unknown; retain numeric identifier | 5C00:3737 MOV word ptr [0x69e6],DX          | L |
| g_69E8 | 2 | unknown; retain numeric identifier | 5C00:3741 MOV [0x69e8],AX                   | L |
| g_69EA | 2 | unknown; retain numeric identifier | 5C00:3744 MOV word ptr [0x69ea],DX          | L |
| g_69EC | 2 | unknown; retain numeric identifier | 5C00:374E MOV [0x69ec],AX                   | L |
| g_69EE | 2 | unknown; retain numeric identifier | 5C00:3751 MOV word ptr [0x69ee],DX          | L |
| g_69F0 | 2 | unknown; retain numeric identifier | 5C00:375B MOV [0x69f0],AX                   | L |
| g_69F2 | 2 | unknown; retain numeric identifier | 5C00:375E MOV word ptr [0x69f2],DX          | L |
| g_69F4 | 2 | unknown; retain numeric identifier | 5C00:3768 MOV [0x69f4],AX                   | L |
| g_69F6 | 2 | unknown; retain numeric identifier | 5C00:376B MOV word ptr [0x69f6],DX          | L |
| g_69F8 | 2 | unknown; retain numeric identifier | 5C00:3775 MOV [0x69f8],AX                   | L |
| g_69FA | 2 | unknown; retain numeric identifier | 5C00:3778 MOV word ptr [0x69fa],DX          | L |
| g_69FC | 2 | unknown; retain numeric identifier | 5C00:3782 MOV [0x69fc],AX                   | L |
| g_69FE | 2 | unknown; retain numeric identifier | 5C00:3785 MOV word ptr [0x69fe],DX          | L |
| g_6A00 | 2 | unknown; retain numeric identifier | 5C00:378F MOV [0x6a00],AX                   | L |
| g_6A02 | 2 | unknown; retain numeric identifier | 5C00:3792 MOV word ptr [0x6a02],DX          | L |
| g_6A04 | 2 | unknown; retain numeric identifier | 5C00:379C MOV [0x6a04],AX                   | L |
| g_6A06 | 2 | unknown; retain numeric identifier | 5C00:379F MOV word ptr [0x6a06],DX          | L |
| g_6A08 | 2 | unknown; retain numeric identifier | 5C00:37A9 MOV [0x6a08],AX                   | L |
| g_6A0A | 2 | unknown; retain numeric identifier | 5C00:37AC MOV word ptr [0x6a0a],DX          | L |
| g_6A0C | 2 | unknown; retain numeric identifier | 5C00:37B6 MOV [0x6a0c],AX                   | L |
| g_6A0E | 2 | unknown; retain numeric identifier | 5C00:37B9 MOV word ptr [0x6a0e],DX          | L |
| g_6A10 | 2 | unknown; retain numeric identifier | 5C00:37C3 MOV [0x6a10],AX                   | L |
| g_6A12 | 2 | unknown; retain numeric identifier | 5C00:37C6 MOV word ptr [0x6a12],DX          | L |
| g_6A14 | 2 | unknown; retain numeric identifier | 5C00:37D0 MOV [0x6a14],AX                   | L |
| g_6A16 | 2 | unknown; retain numeric identifier | 5C00:37D3 MOV word ptr [0x6a16],DX          | L |
| g_6A18 | 2 | unknown; retain numeric identifier | 5C00:37DD MOV [0x6a18],AX                   | L |
| g_6A1A | 2 | unknown; retain numeric identifier | 5C00:37E0 MOV word ptr [0x6a1a],DX          | L |
| g_6A1C | 2 | unknown; retain numeric identifier | 5C00:37EA MOV [0x6a1c],AX                   | L |
| g_6A1E | 2 | unknown; retain numeric identifier | 5C00:37ED MOV word ptr [0x6a1e],DX          | L |
| g_6A20 | 2 | unknown; retain numeric identifier | 5C00:37F7 MOV [0x6a20],AX                   | L |
| g_6A22 | 2 | unknown; retain numeric identifier | 5C00:37FA MOV word ptr [0x6a22],DX          | L |
| g_6A24 | 2 | unknown; retain numeric identifier | 5C00:3804 MOV [0x6a24],AX                   | L |
| g_6A26 | 2 | unknown; retain numeric identifier | 5C00:3807 MOV word ptr [0x6a26],DX          | L |
| g_6A28 | 2 | unknown; retain numeric identifier | 5C00:3811 MOV [0x6a28],AX                   | L |
| g_6A2A | 2 | unknown; retain numeric identifier | 5C00:3814 MOV word ptr [0x6a2a],DX          | L |
| g_6A2C | 2 | unknown; retain numeric identifier | 5C00:381E MOV [0x6a2c],AX                   | L |
| g_6A2E | 2 | unknown; retain numeric identifier | 5C00:3821 MOV word ptr [0x6a2e],DX          | L |
| g_6A30 | 2 | unknown; retain numeric identifier | 5C00:382B MOV [0x6a30],AX                   | L |
| g_6A32 | 2 | unknown; retain numeric identifier | 5C00:382E MOV word ptr [0x6a32],DX          | L |
| g_6A34 | 2 | unknown; retain numeric identifier | 5C00:3838 MOV [0x6a34],AX                   | L |
| g_6A36 | 2 | unknown; retain numeric identifier | 5C00:383B MOV word ptr [0x6a36],DX          | L |
| g_6A38 | 2 | unknown; retain numeric identifier | 5C00:3845 MOV [0x6a38],AX                   | L |
| g_6A3A | 2 | unknown; retain numeric identifier | 5C00:3848 MOV word ptr [0x6a3a],DX          | L |
| g_6A3C | 2 | unknown; retain numeric identifier | 5C00:3852 MOV [0x6a3c],AX                   | L |
| g_6A3E | 2 | unknown; retain numeric identifier | 5C00:3855 MOV word ptr [0x6a3e],DX          | L |
| g_6A40 | 2 | unknown; retain numeric identifier | 5C00:385F MOV [0x6a40],AX                   | L |
| g_6A42 | 2 | unknown; retain numeric identifier | 5C00:3862 MOV word ptr [0x6a42],DX          | L |
| g_6A44 | 2 | unknown; retain numeric identifier | 5C00:386C MOV [0x6a44],AX                   | L |
| g_6A46 | 2 | unknown; retain numeric identifier | 5C00:386F MOV word ptr [0x6a46],DX          | L |
| g_6A48 | 2 | unknown; retain numeric identifier | 5C00:3879 MOV [0x6a48],AX                   | L |
| g_6A4A | 2 | unknown; retain numeric identifier | 5C00:387C MOV word ptr [0x6a4a],DX          | L |
| g_6A4C | 2 | unknown; retain numeric identifier | 5C00:3886 MOV [0x6a4c],AX                   | L |
| g_6A4E | 2 | unknown; retain numeric identifier | 5C00:3889 MOV word ptr [0x6a4e],DX          | L |
| g_6A50 | 2 | unknown; retain numeric identifier | 5C00:3893 MOV [0x6a50],AX                   | L |
| g_6A52 | 2 | unknown; retain numeric identifier | 5C00:3896 MOV word ptr [0x6a52],DX          | L |
| g_6A54 | 2 | unknown; retain numeric identifier | 5C00:38A0 MOV [0x6a54],AX                   | L |
| g_6A56 | 2 | unknown; retain numeric identifier | 5C00:38A3 MOV word ptr [0x6a56],DX          | L |
| g_6A58 | 2 | unknown; retain numeric identifier | 5700:008D MOV [0x6a58],AX                   | L |
| g_6A5A | 2 | unknown; retain numeric identifier | 5700:0090 MOV word ptr [0x6a5a],DX          | L |
| g_6A5C | 2 | unknown; retain numeric identifier | 5700:009D MOV [0x6a5c],AX                   | L |
| g_6A5E | 2 | unknown; retain numeric identifier | 5700:00A0 MOV word ptr [0x6a5e],DX          | L |
| g_6AAC | 1 | unknown; retain numeric identifier | 5700:03E6 MOV byte ptr [0x6aac],0x0         | L |
| g_6AAD | 1 | map X | 5700:0333 MOV byte ptr [0x6aad],0xf        ; 7500:2389 SUB byte ptr [0x6aad],AL         ; 7500:238D CMP byte ptr [0x6aad],0x0         | M |
| g_6AAE | 1 | map Y | 5700:0338 MOV byte ptr [0x6aae],0x1        ; 7500:23B0 SUB byte ptr [0x6aae],AL         ; 7500:23B4 CMP byte ptr [0x6aae],0x0         | M |
| g_6AAF | 1 | facing | 5700:033D MOV byte ptr [0x6aaf],0x6        ; 7500:237E MOV AL,[0x6aaf]                  ; 7500:23A5 MOV AL,[0x6aaf]                   | M |
| g_6AB0 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_6AB2 | 2 | unknown; retain numeric identifier | 5700:0355 MOV [0x6ab2],AX                   | L |
| g_6AB4 | 2 | unknown; retain numeric identifier | 5700:0358 MOV word ptr [0x6ab4],0x1         | L |
| g_6AFB | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_6AFC | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_6AFE | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_6B0A | 1 | unknown; retain numeric identifier | 5700:043D MOV byte ptr [0x6b0a],0x0         | L |
| g_6B1C | 1 | unknown; retain numeric identifier | 5700:0442 MOV byte ptr [0x6b1c],0xff        | L |
| g_6B29 | 2 | unknown; retain numeric identifier | 5700:0405 MOV word ptr [0x6b29],0x1         | L |
| g_6DBB | 2 | unknown; retain numeric identifier | 5C00:0CDD MOV AX,[0x6dbb]                  ; 5C00:0E7E MOV AX,[0x6dbb]                  ; 5C00:0EA6 MOV [0x6dbb],AX                   | L |
| g_6DBD | 2 | unknown; retain numeric identifier | 5C00:0CE0 MOV DX,word ptr [0x6dbd]         ; 5C00:0E81 MOV DX,word ptr [0x6dbd]         ; 5C00:0EA9 MOV word ptr [0x6dbd],DX          | L |
| g_6DC0 | 1 | unknown; retain numeric identifier | 3E00:0571 MOV byte ptr [0x6dc0],0x0        ; 8900:051B MOV byte ptr [0x6dc0],0x1        ; 8900:09AD MOV byte ptr [0x6dc0],0x0         | L |
| g_6DC2 | indexed/address-taken | rest time counter array | named routine body / ECL_VM map | M |
| g_6DC4 | 2 | unknown; retain numeric identifier | 8400:0495 CMP word ptr [0x6dc4],0x0        ; 8400:06C4 ADD AX,word ptr [0x6dc4]         ; 8400:07FF ADD word ptr [0x6dc4],0x5         | L |
| g_6DC6 | 2 | unknown; retain numeric identifier | 8400:048E CMP word ptr [0x6dc6],0x0        ; 8400:06C0 MUL word ptr [0x6dc6]            ; 8400:0D40 CMP word ptr [0x6dc6],0x0         | L |
| g_6DC8 | 2 | unknown; retain numeric identifier | 8400:0487 CMP word ptr [0x6dc8],0x0        ; 8400:0D39 CMP word ptr [0x6dc8],0x0         | L |
| g_6DCA | 2 | unknown; retain numeric identifier | 8400:03BD ADD word ptr [0x6dca],AX         ; 8400:03C6 CMP word ptr [0x6dca],0x63       ; 8400:03CD MOV word ptr [0x6dca],0x63        | L |
| g_6DCC | 2 | unknown; retain numeric identifier | 8400:03AF CMP word ptr [0x6dcc],0x0        ; 8400:03B9 MUL word ptr [0x6dcc]            ; 8400:03C3 MOV [0x6dcc],AX                   | L |
| g_6DCF | indexed/address-taken | per-member rest spell countdown | named routine body / ECL_VM map | M |
| g_6DD8 | 2 | unknown; retain numeric identifier | 8400:0877 INC word ptr [0x6dd8]            ; 8400:087B CMP word ptr [0x6dd8],0x120      ; 8400:0910 MOV [0x6dd8],AX                   | L |
| g_6DDA | 1 | rest/message pane state | 5700:0410 MOV byte ptr [0x6dda],0x0        ; 8400:0D16 MOV byte ptr [0x6dda],0x1        ; 8400:0E54 MOV byte ptr [0x6dda],0x0         | M |
| g_6DDC | 1 | unknown; retain numeric identifier | 5700:0400 MOV byte ptr [0x6ddc],0x0         | L |
| g_6DE3 | 1 | unknown; retain numeric identifier | 5C00:2493 CMP byte ptr [0x6de3],0x0         | L |
| g_6F68 | 1 | unknown; retain numeric identifier | 5700:0451 MOV byte ptr [0x6f68],0xdb        | L |
| g_6F69 | 1 | unknown; retain numeric identifier | 5700:044C MOV byte ptr [0x6f69],0xe8        | L |
| g_84D4 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_84DD | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_84DE | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_84DF | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_84E0 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_84E3 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |
| g_84E9 | indexed/address-taken | unknown; retain numeric identifier | named routine body / ECL_VM map | L |

Packed record cross-reference (M, inspect bodies and SAVES.md): character285 bytes; next+104, combat-object+108, inventory head+C8/count+C7, effects+7F, strength+10, exceptional strength+16, constitution+14, current HP+11B/max+32, weight+102, party slot+BF, side+10E. Item63 bytes, next+2A, catalog ID+2E, weight+37, quantity+39. Effect9 bytes, duration+1, payload/flags+3, next+5. Saved pointers are stale process addresses and must be rebuilt. Roster nodes46 bytes, next+2A; character-name Pascal string begins at0, first character at1.

## Unknowns

| Category | Count / status | Required verification |
| --- | --- | --- |
| Routine coverage | 215/215; zero omitted | Independent review of all ten units |
| Name confidence | H=0, M=94, L=121 | Local role names; original Pascal source names unknown |
| Region-only statement mappings | 5617 | Recover exact per-statement instruction origins |
| Hidden string result occurrences | 31 | Caller-stack hidden destinations; do not merge unknowns |
| Distinct unknown runtime labels | 0 | Retain until runtime owner resolves |
| Distinct unresolved register/segment artifacts | 46 | Far pointers, AX/DX returns, AL width and FLAGS |
| Unsupported AST nodes | 0 | No silently omitted statement nodes; check counters |
| Unmatched C call anchors | 65 | Calls retained with region-only provenance |
| Input call sites | 1486 | Static inventory only |
| ov12 routine/callback scope | 127 routines | ABI parameters, effect ID -> callback mapping and numeric status definitions incomplete |
| Shared-frame helpers | 4 | ov16:1156/14A7/1551/2033 parent BP/control-flow boundaries |
| FLAGS consumers | CompareStrFlags/set branches unverified except wheel branch contract documented | Trace actual Jcc; no decompiler Boolean accepted as proof |
| Menu and dynamic screen gaps | Dynamic table strings/positions and ov25 result keys partly unresolved | Screenshot and table extraction before gate |
| Known local corrections | 3 | ITEMS2064 requested/2048 supplied; roster first-character *; FilePos1593 |
| Execution validation | No game execution or screenshot equivalence claimed | First draft requires Opus verification; not decode-gate approval |

Validation: all 215 AST bodies expanded with zero unsupported nodes; 215 unique routine sections match the input entry set. All 8,503 trailing instruction anchors resolve to decoded instruction starts; all 21,609 listing instruction byte ranges match the original overlay bytes. The callback table has 139 slots, including one unassigned slot. Source hashes are recorded. Full semantic equivalence and branch/dataflow recovery remain pending.

