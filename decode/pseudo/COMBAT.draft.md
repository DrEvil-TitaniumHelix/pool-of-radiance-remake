# COMBAT — first draft

Scope: ov05, ov07, ov09, ov13, ov18, ov19, ov24. All 147 exported routine candidates are accounted for, including seven empty initializers, one invalid entry and one shared tail. Two additional byte-proved routines are supplied at ov19:0D70 and 2156 (149 sections total). Evidence: paired `.lst` / `.c` and `functions.tsv`, `LAYOUT.md`, `RT_LEDGER.md`. `decode/ecl/ECL_VM.md` was absent at draft start and became available during final review; its binary-backed ov07 names and VM crossrefs are incorporated below.

**Draft conventions and limits.** M/H confidence describes only an inferred routine name, not a verified ABI or body. Unnamed routines retain their exported name and L. Unless an assembly-reconstructed section states otherwise, parameters below are **ascending BP stack slots**, preserving the decompiler call-slot order; these are not recovered Pascal declaration order. A source `undefined4` occupies four bytes; explicit decompiler pointer words remain split. Pointer slot widths are reconciled with RETF cleanup where possible; a residual mismatch is flagged, not guessed away. Caller/callee lists are static Ghidra edges, not proof of all dynamic callers. The ordinal in `stub_ovNN_eK` is resolved through FBOV entry tables.

Bodies use Pascal-style control flow and typed dereferences; `ShortInt` preserves signed character tests; `Word` is unsigned 16-bit; arithmetic truncates on assignment. `and then` / `or else` preserve short-circuit order. `Sequence` evaluates left-to-right and returns its last expression; `SliceN(x,b)` is the N-bit slice at byte b and is assignable. `FarBits(segment,offset)` packs words without linearizing; dereferences reconstructed from split far pointers still require segment propagation. `Pack16(hi,lo)` preserves decompiler AH contamination until the true byte prototype is verified. `UNKNOWN_in_*` / `UNKNOWN_extraout_*` mean unresolved machine-register dataflow, never uninitialized Pascal source locals. `Allocate` is the pointer result of Pascal `GetMem`; `MemRef(offset,segment)` denotes its referent.

**Offsets:** a call-derived line cites its CALL instruction; a directly matched BP/DS assignment cites its write instruction (occurrence-matched within that routine). Every other line explicitly says `routine anchor; statement location unresolved` and cites the routine entry. Those annotations are coverage anchors, **not claimed source-line addresses**. Nested/reordered decompiler branches and repeated store/call occurrences need verifier confirmation. Structural begin/end lines are also routine-anchored. This is intentionally a first draft, not a decode-gate completion claim.

**Runtime corrections (ledger re-read after Opus verification):** string helpers are rendered as assignment/concatenation/Copy, with CS literals read from the current overlay rather than Ghidra’s stale callee CS. Compiler string destinations are recovered from nearby LEA DI,[BP+disp] where possible; destination lifetime across nested numeric conversion remains provisional. Set membership writes `Flags.ZF`; the following decompiler boolean is **not reliable** where flag propagation was lost. All such routines require assembly verification. Arithmetic helpers named `*FromRegisters` retain implicit operands as unknown. Resolved Pascal runtime operations do not imply resolved game-call prototypes.

Ledger update: runtime verification reports H 64 / M 22 / L 74. Random uses `RandSeed := RandSeed * $08088405 + 1`, returns `HiWord(RandSeed) mod N`. The draft uses Pascal Random and does not substitute a host PRNG. ECL_VM.md became available during final checks and was read; see the area correction below.

**Area correction:** Most of ov07 is **ECL support**, not combat proper: operand fetch (0000), value resolution (0136), initialization (01B6), script loading (0341), word/byte memory and strings (0C77/0E0C/0F53/12FB), six-bit text (1153), comparison flags (1815/18EB), gosub (1951), and skip decoding (1EA6). [ECL_VM.md](../ecl/ECL_VM.md) is the authoritative VM specification; these sections remain included to cover all assigned units. ECL addresses +6700/+6E00/+2A00/-2E00 in the decompile are modular base adjustments, not giant arrays. ov19 contains inventory/shop/coin/spell-list UI as well as combat statistics; ov05 includes post-combat treasure. They are included because the assignment owns the whole units.

### ov05:0000 FUN_3900_0000 (conf L)

Params (stack slots): param_1: P_Integer [BP+$06].  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; piVar2: P_Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar11: Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; iVar10: Integer [compiler temporary; no proven BP slot]; iVar12: Integer [compiler temporary; no proven BP slot]; iVar13: Integer [compiler temporary; no proven BP slot]; iVar14: Integer [compiler temporary; no proven BP slot]; uVar15: Word [compiler temporary; no proven BP slot]; uVar16: Word [compiler temporary; no proven BP slot]; bVar17: Boolean [compiler temporary; no proven BP slot]; local_14: Byte [BP-$12]; local_13: Word [BP-$11]; uStack_11: Word [BP-$F]; local_f: Integer [BP-$D]; iStack_d: Integer [BP-$B]; local_b: Word [BP-$9]; local_9: Integer [BP-$7]; local_7: ShortInt [BP-$5]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: FUN_3900_04c9.  
Callees: FUN_00ba_0442, System.@CopyBytes, System.@LongDivMod, System.@LongMul, System.GetMem, RollDice.

```pascal
procedure FUN_3900_0000(param_1: P_Integer); { 3900:0000 }
begin { routine anchor; statement location unresolved } { 3900:0000 }
  uVar15 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 3900:0000 }
  if ((g_84D4 = 0) or else ((P_Integer((Integer(g_49D6) + $5CC)))^ = 0)) then { routine anchor; statement location unresolved } { 3900:0000 }
    begin { routine anchor; statement location unresolved } { 3900:0000 }
      local_b := 0; { 3900:0037 }
      local_9 := 0; { 3900:003A }
      iStack_4 := g_5D98; { 3900:0047 }
      local_14 := 0; { 3900:004A }
      local_6 := g_5D96; { 3900:0044 }
      while ((local_6 <> 0) or else (iStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3900:0000 }
        begin { routine anchor; statement location unresolved } { 3900:0000 }
          local_13 := (P_Word((local_6 + 200)))^; { 3900:0066 }
          uStack_11 := (P_Word((local_6 + $CA)))^; { 3900:0069 }
          if (((P_ShortInt((local_6 + $10E)))^ = 1) and then ((P_ShortInt((local_6 + $10C)))^ <> 3)) then { routine anchor; statement location unresolved } { 3900:0000 }
            begin { routine anchor; statement location unresolved } { 3900:0000 }
              g_443A := 1; { 3900:0088 }
              local_7 := 0; { 3900:008D }
              while true do { routine anchor; statement location unresolved } { 3900:0000 }
                begin { routine anchor; statement location unresolved } { 3900:0000 }
                  uVar5 := (P_Word(((local_6 + (local_7 * 2)) + $88)))^; { routine anchor; statement location unresolved } { 3900:0000 }
                  puVar1 := (P_Word(@(g_67F4)) + (local_7 * 2)); { routine anchor; statement location unresolved } { 3900:0000 }
                  uVar3 := (puVar1)^; { routine anchor; statement location unresolved } { 3900:0000 }
                  (puVar1)^ := ((puVar1)^ + uVar5); { routine anchor; statement location unresolved } { 3900:0000 }
                  P_Word(@(g_67F6))[(local_7 * 2)] := (P_Word(@(g_67F6))[(local_7 * 2)] + Word(Carry16(uVar3, uVar5))); { routine anchor; statement location unresolved } { 3900:0000 }
                  if (local_7 = 6) then { routine anchor; statement location unresolved } { 3900:0000 }
                    Break; { routine anchor; statement location unresolved } { 3900:0000 }
                  local_7 := (local_7 + 1); { 3900:0093 }
                end; { routine anchor; statement location unresolved } { 3900:0000 }
              uVar3 := (Word((P_Byte((local_6 + $BA)))^) * Word((P_Byte((local_6 + $B1)))^)); { routine anchor; statement location unresolved } { 3900:0000 }
              bVar17 := Carry16((P_Word((local_6 + $B8)))^, local_b); { routine anchor; statement location unresolved } { 3900:0000 }
              uVar5 := ((P_Word((local_6 + $B8)))^ + local_b); { routine anchor; statement location unresolved } { 3900:0000 }
              local_b := (uVar5 + uVar3); { 3900:00F5 }
              local_9 := (((local_9 + Word(bVar17)) + (Integer(uVar3) shr $F)) + Word(Carry16(uVar5, uVar3))); { 3900:00F8 }
              if ((P_Integer((Integer(g_49D6) + $5C6)))^ <> 1) then { routine anchor; statement location unresolved } { 3900:0000 }
                begin { routine anchor; statement location unresolved } { 3900:0000 }
                  while ((local_13 or uStack_11) <> 0) do { routine anchor; statement location unresolved } { 3900:0000 }
                    begin { routine anchor; statement location unresolved } { 3900:0000 }
                      if (((P_Integer((local_13 + $3A)))^ <> 0) or else ((local_14 < 8) and then Sequence((uVar11 := Byte(((local_13 or uStack_11) shr 8))); (bVar4 := RollDice(Pack16(uVar11, 10), Pack16(uVar11, 1))); (bVar4 < 4)))) then { 3900:012E }
                        begin { routine anchor; statement location unresolved } { 3900:0000 }
                          local_14 := (local_14 + 1); { 3900:013A }
                          iVar10 := g_6810; { routine anchor; statement location unresolved } { 3900:0000 }
                          iVar12 := g_6812; { routine anchor; statement location unresolved } { 3900:0000 }
                          if ((g_6810 = 0) and then (g_6812 = 0)) then { routine anchor; statement location unresolved } { 3900:0000 }
                            begin { routine anchor; statement location unresolved } { 3900:0000 }
                              g_6810 := Allocate($3F); { 3900:014A }
                              uVar3 := (Word(g_6810) shr 8); { routine anchor; statement location unresolved } { 3900:0000 }
                              FUN_00ba_0442((uVar3 shl 8), (uVar3 shl 8), (uVar3 shl 8), (uVar3 shl 8), local_13, uStack_11, local_6, iStack_4); { 3900:016E }
                              Move(MemRef(local_13, uStack_11), MemRef(Integer(g_6810), Integer((LongWord(g_6810) shr $10))), $3F); { 3900:0182 }
                              (P_Byte((Integer(g_6810) + $34)))^ := 0; { routine anchor; statement location unresolved } { 3900:0000 }
                              uVar16 := Word((LongWord(g_6810) shr $10)); { routine anchor; statement location unresolved } { 3900:0000 }
                              iVar10 := Integer(g_6810); { routine anchor; statement location unresolved } { 3900:0000 }
                              (P_Word((iVar10 + $2A)))^ := 0; { routine anchor; statement location unresolved } { 3900:0000 }
                              (P_Word((iVar10 + $2C)))^ := 0; { routine anchor; statement location unresolved } { 3900:0000 }
                            end; { routine anchor; statement location unresolved } { 3900:0000 }
                          else { routine anchor; statement location unresolved } { 3900:0000 }
                            begin { routine anchor; statement location unresolved } { 3900:0000 }
                              g_6810 := Allocate($3F); { 3900:01B1 }
                              uVar3 := (Word(g_6810) shr 8); { routine anchor; statement location unresolved } { 3900:0000 }
                              FUN_00ba_0442((uVar3 shl 8), (uVar3 shl 8), (uVar3 shl 8), (uVar3 shl 8), local_13, uStack_11, local_6, iStack_4); { 3900:01D5 }
                              Move(MemRef(local_13, uStack_11), MemRef(Integer(g_6810), Integer((LongWord(g_6810) shr $10))), $3F); { 3900:01E9 }
                              (P_Byte((Integer(g_6810) + $34)))^ := 0; { routine anchor; statement location unresolved } { 3900:0000 }
                              uVar16 := Word((LongWord(g_6810) shr $10)); { routine anchor; statement location unresolved } { 3900:0000 }
                              iVar14 := Integer(g_6810); { routine anchor; statement location unresolved } { 3900:0000 }
                              (P_Integer((iVar14 + $2A)))^ := iVar10; { routine anchor; statement location unresolved } { 3900:0000 }
                              (P_Integer((iVar14 + $2C)))^ := iVar12; { routine anchor; statement location unresolved } { 3900:0000 }
                            end; { routine anchor; statement location unresolved } { 3900:0000 }
                        end; { routine anchor; statement location unresolved } { 3900:0000 }
                      puVar1 := P_Word((local_13 + $2A)); { routine anchor; statement location unresolved } { 3900:0000 }
                      uStack_11 := (P_Word((local_13 + $2C)))^; { 3900:0217 }
                      local_13 := (puVar1)^; { 3900:0214 }
                    end; { routine anchor; statement location unresolved } { 3900:0000 }
                end; { routine anchor; statement location unresolved } { 3900:0000 }
            end; { routine anchor; statement location unresolved } { 3900:0000 }
          piVar2 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:0000 }
          iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:022D }
          local_6 := (piVar2)^; { 3900:022A }
        end; { routine anchor; statement location unresolved } { 3900:0000 }
      iVar10 := g_67F6; { routine anchor; statement location unresolved } { 3900:0000 }
      uVar6 := DivMod32FromRegisters(); { 3900:023F }
      iVar12 := g_67FA; { routine anchor; statement location unresolved } { 3900:0000 }
      uVar7 := DivMod32FromRegisters(); { 3900:0256 }
      uVar3 := ((local_b + uVar6) + uVar7); { routine anchor; statement location unresolved } { 3900:0000 }
      iVar14 := g_67FE; { routine anchor; statement location unresolved } { 3900:0000 }
      uVar8 := DivMod32FromRegisters(); { 3900:026D }
      uVar5 := (uVar3 + uVar8); { routine anchor; statement location unresolved } { 3900:0000 }
      bVar17 := Carry16(uVar5, g_6800); { routine anchor; statement location unresolved } { 3900:0000 }
      uVar5 := (uVar5 + g_6800); { routine anchor; statement location unresolved } { 3900:0000 }
      iVar10 := (((((((local_9 + iVar10) + Word(Carry16(local_b, uVar6))) + iVar12) + Word(Carry16((local_b + uVar6), uVar7))) + iVar14) + Word(Carry16(uVar3, uVar8))) + g_6802); { routine anchor; statement location unresolved } { 3900:0000 }
      iVar12 := g_6806; { routine anchor; statement location unresolved } { 3900:0000 }
      uVar7 := Multiply32FromRegisters(); { 3900:0291 }
      uVar3 := (uVar5 + uVar7); { routine anchor; statement location unresolved } { 3900:0000 }
      iVar14 := g_680A; { routine anchor; statement location unresolved } { 3900:0000 }
      uVar8 := Multiply32FromRegisters(); { 3900:02A8 }
      uVar6 := (uVar3 + uVar8); { routine anchor; statement location unresolved } { 3900:0000 }
      iVar13 := g_680E; { routine anchor; statement location unresolved } { 3900:0000 }
      uVar9 := Multiply32FromRegisters(); { 3900:02BF }
      local_b := (uVar6 + uVar9); { 3900:0244 }
      local_9 := (((((((iVar10 + Word(bVar17)) + iVar12) + Word(Carry16(uVar5, uVar7))) + iVar14) + Word(Carry16(uVar3, uVar8))) + iVar13) + Word(Carry16(uVar6, uVar9))); { routine anchor; statement location unresolved } { 3900:0000 }
      iStack_d := g_6812; { 3900:01AA }
      local_f := Integer(g_6810); { 3900:01A7 }
      while ((local_f <> 0) or else ((iStack_d <> 0) and then ((iStack_d <> g_5D9C) or else (local_f <> g_5D9A)))) do { routine anchor; statement location unresolved } { 3900:0000 }
        begin { routine anchor; statement location unresolved } { 3900:0000 }
          if (0 < (P_ShortInt((local_f + $32)))^) then { routine anchor; statement location unresolved } { 3900:0000 }
            begin { routine anchor; statement location unresolved } { 3900:0000 }
              iVar10 := Integer((P_ShortInt((local_f + $32)))^); { routine anchor; statement location unresolved } { 3900:0000 }
              bVar17 := Carry16(local_b, (iVar10 * 400)); { routine anchor; statement location unresolved } { 3900:0000 }
              local_b := (local_b + (iVar10 * 400)); { 3900:025B }
              local_9 := (((local_9 + (iVar10 div $52)) + (iVar10 shr $F)) + Word(bVar17)); { routine anchor; statement location unresolved } { 3900:0000 }
            end; { routine anchor; statement location unresolved } { 3900:0000 }
          piVar2 := P_Integer((local_f + $2A)); { routine anchor; statement location unresolved } { 3900:0000 }
          iStack_d := (P_Integer((local_f + $2C)))^; { 3900:02D4 }
          local_f := (piVar2)^; { 3900:02D1 }
        end; { routine anchor; statement location unresolved } { 3900:0000 }
      iVar10 := DivMod32FromRegisters(); { 3900:0340 }
      (param_1)^ := iVar10; { routine anchor; statement location unresolved } { 3900:0000 }
      P_Integer(param_1)[1] := local_9; { routine anchor; statement location unresolved } { 3900:0000 }
    end; { routine anchor; statement location unresolved } { 3900:0000 }
  else { routine anchor; statement location unresolved } { 3900:0000 }
    begin { routine anchor; statement location unresolved } { 3900:0000 }
      iVar10 := ((P_ShortInt((Integer(g_5D92) + $73)))^ * 100); { routine anchor; statement location unresolved } { 3900:0000 }
      (param_1)^ := iVar10; { routine anchor; statement location unresolved } { 3900:0000 }
      P_Integer(param_1)[1] := (iVar10 shr $F); { routine anchor; statement location unresolved } { 3900:0000 }
    end; { routine anchor; statement location unresolved } { 3900:0000 }
  Exit; { 3900:0352 }
end; { routine anchor; statement location unresolved } { 3900:0000 }
```

### ov05:0355 FUN_3900_0355 (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Integer [BP+$08].  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; piVar2: P_Integer [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; local_a: Word [BP-$8]; local_8: Integer [BP-$6]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: FUN_3900_04c9.  
Callees: System.@LongDivMod.

```pascal
procedure FUN_3900_0355(param_1: Word; param_2: Integer); { 3900:0355 }
begin { routine anchor; statement location unresolved } { 3900:0355 }
  iStack_4 := g_5D98; { 3900:0365 }
  local_6 := g_5D96; { 3900:0362 }
  while ((local_6 <> 0) or else (iStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3900:0355 }
    begin { routine anchor; statement location unresolved } { 3900:0355 }
      if (((P_ShortInt((local_6 + $10D)))^ <> 0) and then ((P_ShortInt((local_6 + $10C)))^ <> 1)) then { routine anchor; statement location unresolved } { 3900:0355 }
        begin { routine anchor; statement location unresolved } { 3900:0355 }
          local_a := param_1; { 3900:0395 }
          local_8 := param_2; { 3900:0398 }
          cVar3 := (P_ShortInt((local_6 + $2F)))^; { routine anchor; statement location unresolved } { 3900:0355 }
          if (cVar3 = 0) then { routine anchor; statement location unresolved } { 3900:0355 }
            begin { routine anchor; statement location unresolved } { 3900:0355 }
              if ($F < (P_Byte((local_6 + $12)))^) then { routine anchor; statement location unresolved } { 3900:0355 }
                begin { routine anchor; statement location unresolved } { 3900:0355 }
                  iVar5 := param_2; { routine anchor; statement location unresolved } { 3900:0355 }
                  uVar4 := DivMod32FromRegisters(); { 3900:03BB }
                  local_a := (uVar4 + param_1); { 3900:03C6 }
                  local_8 := ((iVar5 + param_2) + Word(Carry16(uVar4, param_1))); { 3900:03C9 }
                end; { routine anchor; statement location unresolved } { 3900:0355 }
            end; { routine anchor; statement location unresolved } { 3900:0355 }
          else { routine anchor; statement location unresolved } { 3900:0355 }
            if (cVar3 = 2) then { routine anchor; statement location unresolved } { 3900:0355 }
              begin { routine anchor; statement location unresolved } { 3900:0355 }
                if ($F < (P_Byte((local_6 + $10)))^) then { routine anchor; statement location unresolved } { 3900:0355 }
                  begin { routine anchor; statement location unresolved } { 3900:0355 }
                    iVar5 := param_2; { routine anchor; statement location unresolved } { 3900:0355 }
                    uVar4 := DivMod32FromRegisters(); { 3900:03E8 }
                    local_a := (uVar4 + param_1); { 3900:03F3 }
                    local_8 := ((iVar5 + param_2) + Word(Carry16(uVar4, param_1))); { 3900:03F6 }
                  end; { routine anchor; statement location unresolved } { 3900:0355 }
              end; { routine anchor; statement location unresolved } { 3900:0355 }
            else { routine anchor; statement location unresolved } { 3900:0355 }
              if (cVar3 = 5) then { routine anchor; statement location unresolved } { 3900:0355 }
                begin { routine anchor; statement location unresolved } { 3900:0355 }
                  if ($F < (P_Byte((local_6 + $11)))^) then { routine anchor; statement location unresolved } { 3900:0355 }
                    begin { routine anchor; statement location unresolved } { 3900:0355 }
                      iVar5 := param_2; { routine anchor; statement location unresolved } { 3900:0355 }
                      uVar4 := DivMod32FromRegisters(); { 3900:0415 }
                      local_a := (uVar4 + param_1); { 3900:0420 }
                      local_8 := ((iVar5 + param_2) + Word(Carry16(uVar4, param_1))); { 3900:0423 }
                    end; { routine anchor; statement location unresolved } { 3900:0355 }
                end; { routine anchor; statement location unresolved } { 3900:0355 }
              else { routine anchor; statement location unresolved } { 3900:0355 }
                if (cVar3 = 6) then { routine anchor; statement location unresolved } { 3900:0355 }
                  begin { routine anchor; statement location unresolved } { 3900:0355 }
                    if ($F < (P_Byte((local_6 + $13)))^) then { routine anchor; statement location unresolved } { 3900:0355 }
                      begin { routine anchor; statement location unresolved } { 3900:0355 }
                        iVar5 := param_2; { routine anchor; statement location unresolved } { 3900:0355 }
                        uVar4 := DivMod32FromRegisters(); { 3900:0441 }
                        local_a := (uVar4 + param_1); { 3900:044C }
                        local_8 := ((iVar5 + param_2) + Word(Carry16(uVar4, param_1))); { 3900:044F }
                      end; { routine anchor; statement location unresolved } { 3900:0355 }
                  end; { routine anchor; statement location unresolved } { 3900:0355 }
                else { routine anchor; statement location unresolved } { 3900:0355 }
                  if ((cVar3 = 8) or else (((9 < cVar3) and then (cVar3 < 15)) or else (cVar3 = 16))) then { routine anchor; statement location unresolved } { 3900:0355 }
                    begin { routine anchor; statement location unresolved } { 3900:0355 }
                      local_a := DivMod32FromRegisters(); { 3900:046F }
                    end; { routine anchor; statement location unresolved } { 3900:0355 }
                  else { routine anchor; statement location unresolved } { 3900:0355 }
                    if ((cVar3 = 9) or else (cVar3 = 15)) then { routine anchor; statement location unresolved } { 3900:0355 }
                      begin { routine anchor; statement location unresolved } { 3900:0355 }
                        local_a := DivMod32FromRegisters(); { 3900:048F }
                      end; { routine anchor; statement location unresolved } { 3900:0355 }
          puVar1 := P_Word((local_6 + $AC)); { routine anchor; statement location unresolved } { 3900:0355 }
          uVar4 := (puVar1)^; { routine anchor; statement location unresolved } { 3900:0355 }
          (puVar1)^ := ((puVar1)^ + local_a); { routine anchor; statement location unresolved } { 3900:0355 }
          (P_Integer((local_6 + $AE)))^ := (((P_Integer((local_6 + $AE)))^ + local_8) + Word(Carry16(uVar4, local_a))); { routine anchor; statement location unresolved } { 3900:0355 }
        end; { routine anchor; statement location unresolved } { 3900:0355 }
      piVar2 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:0355 }
      iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:04BD }
      local_6 := (piVar2)^; { 3900:04BA }
    end; { routine anchor; statement location unresolved } { 3900:0355 }
  Exit; { 3900:04C6 }
end; { routine anchor; statement location unresolved } { 3900:0355 }
```

### ov05:04C9 FUN_3900_04c9 (conf L)

Params (stack slots): none.  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; bVar3: Boolean [compiler temporary; no proven BP slot]; local_6: Word [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: ov05_1527.  
Callees: FUN_3900_0000, FUN_3900_0355, ov16_3291.

```pascal
procedure FUN_3900_04c9(); { 3900:04C9 }
begin { routine anchor; statement location unresolved } { 3900:04C9 }
  g_84D5 := 0; { 3900:04CF }
  g_443B := 0; { 3900:04D9 }
  local_6 := g_5D96; { 3900:04E5 }
  iStack_4 := g_5D98; { 3900:04E8 }
  while ((local_6 <> 0) or else ((iStack_4 <> 0) and then ((P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $13)))^ <> 1))) do { routine anchor; statement location unresolved } { 3900:04C9 }
    begin { routine anchor; statement location unresolved } { 3900:04C9 }
      if ((P_ShortInt((local_6 + $10C)))^ = 3) then { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          g_443B := 1; { 3900:050D }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
      puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:04C9 }
      iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:0522 }
      local_6 := (puVar1)^; { 3900:051F }
    end; { routine anchor; statement location unresolved } { 3900:04C9 }
  g_49FF := (g_84D4 = 0); { 3900:04D4 }
  g_84DA := 0; { 3900:0533 }
  local_6 := g_5D96; { 3900:053F }
  iStack_4 := g_5D98; { 3900:0542 }
  if (g_84D4 = 0) then { routine anchor; statement location unresolved } { 3900:04C9 }
    begin { routine anchor; statement location unresolved } { 3900:04C9 }
      while ((local_6 <> 0) or else ((iStack_4 <> 0) and then ((P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $13)))^ <> 1))) do { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          if ((((P_ShortInt((local_6 + $10C)))^ = 3) or else ((((P_ShortInt((local_6 + $10C)))^ = 1) or else ((P_ShortInt((local_6 + $10C)))^ = 0)) or else ((P_Integer((Integer(g_49D6) + $5CC)))^ = 1))) and then (((P_ShortInt((local_6 + $10E)))^ = 0) and then ((P_Byte((local_6 + $84)))^ < $80))) then { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              g_49FF := false; { 3900:052E }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          if (((P_ShortInt((local_6 + $10C)))^ = 1) or else ((P_ShortInt((local_6 + $10C)))^ = 0)) then { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              g_84DA := 1; { 3900:05CA }
              g_443B := 0; { 3900:05CF }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          if (((P_ShortInt((local_6 + $10D)))^ = 0) or else ((P_ShortInt((local_6 + $10C)))^ = 1)) then { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              g_84D5 := (g_84D5 + 1); { 3900:05EA }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:04C9 }
          iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:05FE }
          local_6 := (puVar1)^; { 3900:05FB }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
      if (g_84DA <> 0) then { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          FUN_3900_0000(P_Word(@(g_84D6)), $C7C); { 3900:0611 }
          FUN_3900_0355(g_84D6, g_84D8); { 3900:061D }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
      local_6 := g_5D96; { 3900:0627 }
      iStack_4 := g_5D98; { 3900:062A }
      if (g_49FF = 0) then { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          while ((local_6 <> 0) or else ((iStack_4 <> 0) and then ((P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $13)))^ <> 1))) do { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              if (g_443B = 0) then { routine anchor; statement location unresolved } { 3900:04C9 }
                begin { routine anchor; statement location unresolved } { 3900:04C9 }
                  cVar2 := (P_ShortInt((local_6 + $10C)))^; { routine anchor; statement location unresolved } { 3900:04C9 }
                  if (cVar2 = 3) then { routine anchor; statement location unresolved } { 3900:04C9 }
                    begin { routine anchor; statement location unresolved } { 3900:04C9 }
                      (P_Byte((local_6 + $10C)))^ := 0; { routine anchor; statement location unresolved } { 3900:04C9 }
                      (P_Byte((local_6 + $10D)))^ := 1; { routine anchor; statement location unresolved } { 3900:04C9 }
                    end; { routine anchor; statement location unresolved } { 3900:04C9 }
                  else { routine anchor; statement location unresolved } { 3900:04C9 }
                    if (cVar2 = 5) then { routine anchor; statement location unresolved } { 3900:04C9 }
                      begin { routine anchor; statement location unresolved } { 3900:04C9 }
                        (P_Byte((local_6 + $10C)))^ := 4; { routine anchor; statement location unresolved } { 3900:04C9 }
                      end; { routine anchor; statement location unresolved } { 3900:04C9 }
                    else { routine anchor; statement location unresolved } { 3900:04C9 }
                      if ((cVar2 = 4) and then ((P_ShortInt((local_6 + $11B)))^ <> 0)) then { routine anchor; statement location unresolved } { 3900:04C9 }
                        begin { routine anchor; statement location unresolved } { 3900:04C9 }
                          (P_Byte((local_6 + $10C)))^ := 0; { routine anchor; statement location unresolved } { 3900:04C9 }
                          (P_Byte((local_6 + $10D)))^ := 1; { routine anchor; statement location unresolved } { 3900:04C9 }
                        end; { routine anchor; statement location unresolved } { 3900:04C9 }
                end; { routine anchor; statement location unresolved } { 3900:04C9 }
              else { routine anchor; statement location unresolved } { 3900:04C9 }
                begin { routine anchor; statement location unresolved } { 3900:04C9 }
                  (P_Word((Integer(g_49D6) + $58E)))^ := $81; { routine anchor; statement location unresolved } { 3900:04C9 }
                  if ((P_ShortInt((local_6 + $10C)))^ = 3) then { routine anchor; statement location unresolved } { 3900:04C9 }
                    begin { routine anchor; statement location unresolved } { 3900:04C9 }
                      (P_Byte((local_6 + $10C)))^ := 0; { routine anchor; statement location unresolved } { 3900:04C9 }
                      (P_Byte((local_6 + $10D)))^ := 1; { routine anchor; statement location unresolved } { 3900:04C9 }
                    end; { routine anchor; statement location unresolved } { 3900:04C9 }
                  else { routine anchor; statement location unresolved } { 3900:04C9 }
                    begin { routine anchor; statement location unresolved } { 3900:04C9 }
                      g_5D92 := local_6; { 3900:06DD }
                      g_5D94 := iStack_4; { 3900:06E0 }
                      ov16_3291(1, (local_6 and $FF00)); { 3900:06EA }
                    end; { routine anchor; statement location unresolved } { 3900:04C9 }
                end; { routine anchor; statement location unresolved } { 3900:04C9 }
              puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:04C9 }
              iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:06FF }
              local_6 := (puVar1)^; { 3900:06FC }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
      else { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          local_6 := g_5D96; { 3900:070E }
          bVar3 := false; { routine anchor; statement location unresolved } { 3900:04C9 }
          while ((local_6 <> 0) or else ((iStack_4 <> 0) and then not (bVar3))) do { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              if ((P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $13)))^ = 1) then { routine anchor; statement location unresolved } { 3900:04C9 }
                begin { routine anchor; statement location unresolved } { 3900:04C9 }
                  bVar3 := true; { routine anchor; statement location unresolved } { 3900:04C9 }
                end; { routine anchor; statement location unresolved } { 3900:04C9 }
              else { routine anchor; statement location unresolved } { 3900:04C9 }
                begin { routine anchor; statement location unresolved } { 3900:04C9 }
                  g_5D92 := local_6; { 3900:073B }
                  g_5D94 := iStack_4; { 3900:073E }
                  ov16_3291(1, (local_6 and $FF00)); { 3900:0748 }
                end; { routine anchor; statement location unresolved } { 3900:04C9 }
              puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:04C9 }
              iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:0711 }
              local_6 := (puVar1)^; { 3900:0760 }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          (P_Word((Integer(g_49D6) + $67C)))^ := 0; { routine anchor; statement location unresolved } { 3900:04C9 }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
    end; { routine anchor; statement location unresolved } { 3900:04C9 }
  else { routine anchor; statement location unresolved } { 3900:04C9 }
    begin { routine anchor; statement location unresolved } { 3900:04C9 }
      local_6 := g_5D96; { 3900:077D }
      while ((local_6 <> 0) or else (iStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          if ((((P_ShortInt((local_6 + $10D)))^ = 1) and then ((P_ShortInt((local_6 + $10C)))^ = 0)) and then ((P_ShortInt((local_6 + $10E)))^ <> 1)) then { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              g_84DA := 1; { 3900:07AC }
              FUN_3900_0000(P_Word(@(g_84D6)), $C7C); { 3900:07B7 }
              FUN_3900_0355(g_84D6, g_84D8); { 3900:07C3 }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:04C9 }
          iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:0763 }
          local_6 := (puVar1)^; { 3900:07D3 }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
      iStack_4 := g_5D98; { 3900:0780 }
      local_6 := g_5D96; { 3900:07E2 }
      while ((local_6 <> 0) or else (iStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3900:04C9 }
        begin { routine anchor; statement location unresolved } { 3900:04C9 }
          if (((P_ShortInt((local_6 + $10C)))^ = 0) or else ((P_ShortInt((local_6 + $10C)))^ = 1)) then { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              (P_Byte((local_6 + $10D)))^ := 1; { routine anchor; statement location unresolved } { 3900:04C9 }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          if ((P_ShortInt((local_6 + $10C)))^ = 5) then { routine anchor; statement location unresolved } { 3900:04C9 }
            begin { routine anchor; statement location unresolved } { 3900:04C9 }
              (P_Byte((local_6 + $10C)))^ := 4; { routine anchor; statement location unresolved } { 3900:04C9 }
            end; { routine anchor; statement location unresolved } { 3900:04C9 }
          puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:04C9 }
          iStack_4 := (P_Integer((local_6 + $106)))^; { 3900:07D6 }
          local_6 := (puVar1)^; { 3900:0830 }
        end; { routine anchor; statement location unresolved } { 3900:04C9 }
    end; { routine anchor; statement location unresolved } { 3900:04C9 }
  Exit; { 3900:083B }
end; { routine anchor; statement location unresolved } { 3900:04C9 }
```

### ov05:0916 ShowCombatOutcome (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar8: Byte [compiler temporary; no proven BP slot]; puVar9: P_Byte [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; local_211: array[0..220] of Byte [BP-$20F]; local_134: array[0..4] of Byte [BP-$132]; local_12f: array[0..5] of Byte [BP-$12D]; local_129: Byte [BP-$127]; local_128: array[0..2] of Byte [BP-$126]; local_125: Byte [BP-$123]; local_124: array[0..17] of Byte [BP-$122]; local_112: Byte [BP-$110]; local_111: Byte [BP-$10F]; local_110: array[0..2] of Byte [BP-$10E]; local_10d: array[0..255] of Byte [BP-$10B]; local_d: array[0..10] of Byte [BP-$B]; bVar7: Byte [compiler temporary; no proven BP slot].  
Callers: ov05_1527.  
Callees: FUN_03f1_02e8, FUN_0709_0626, System.@StrAppend, System.@StrAssign, System.@StrCopy, System.@StrLong, ov25_03BD.

M: g_84D4 selects duel outcome, g_84DA duel win; ordinary branches distinguish party won/fled/found treasure. XP input is a split 32-bit value; zeroed on loss/flee paths.

```pascal
procedure ShowCombatOutcome(param_1: Word; param_2: Word); { 3900:0916 }
begin { routine anchor; statement location unresolved } { 3900:0916 }
  local_110[0] := 0; { routine anchor; statement location unresolved } { 3900:0916 }
  bVar7 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar1 := Pack16(bVar7, 1); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar2 := Pack16(bVar7, 1); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar3 := Pack16(bVar7, $26); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar4 := Pack16(bVar7, $16); { routine anchor; statement location unresolved } { 3900:0916 }
  iVar5 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar6 := Pack16(bVar7, $F); { routine anchor; statement location unresolved } { 3900:0916 }
  puVar9 := @(local_112); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
  PString(BP+65264, SS) := ''; { 3900:093F }
  FUN_03f1_02e8(puVar9, uVar10, uVar6, iVar5, uVar4, uVar3, uVar2, uVar1); { 3900:0944 }
  if ((g_443A = 0) and then (g_84D4 = 0)) then { routine anchor; statement location unresolved } { 3900:0916 }
    begin { routine anchor; statement location unresolved } { 3900:0916 }
      if (g_443B = 0) then { routine anchor; statement location unresolved } { 3900:0916 }
        begin { routine anchor; statement location unresolved } { 3900:0916 }
          uVar1 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:0916 }
          uVar2 := Pack16(UNKNOWN_extraout_AH, 3); { routine anchor; statement location unresolved } { 3900:0916 }
          uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 3900:0916 }
          puVar9 := local_12f; { routine anchor; statement location unresolved } { 3900:0916 }
          uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
          PString(BP+65241, SS) := 'The party has found Treasure!'; { 3900:097C }
          FUN_0709_0626(puVar9, uVar10, uVar3, uVar2, uVar1); { 3900:0981 }
        end; { routine anchor; statement location unresolved } { 3900:0916 }
      else { routine anchor; statement location unresolved } { 3900:0916 }
        begin { routine anchor; statement location unresolved } { 3900:0916 }
          uVar1 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:0916 }
          uVar2 := Pack16(UNKNOWN_extraout_AH, 3); { routine anchor; statement location unresolved } { 3900:0916 }
          uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 3900:0916 }
          puVar9 := @(local_125); { routine anchor; statement location unresolved } { 3900:0916 }
          uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
          PString(BP+65242, SS) := 'The party has fled.'; { 3900:09AB }
          FUN_0709_0626(puVar9, uVar10, uVar3, uVar2, uVar1); { 3900:09B0 }
          param_1 := 0; { routine anchor; statement location unresolved } { 3900:0916 }
          param_2 := 0; { routine anchor; statement location unresolved } { 3900:0916 }
        end; { routine anchor; statement location unresolved } { 3900:0916 }
    end; { routine anchor; statement location unresolved } { 3900:0916 }
  else { routine anchor; statement location unresolved } { 3900:0916 }
    if ((g_84D4 = 0) or else (g_84DA <> 0)) then { routine anchor; statement location unresolved } { 3900:0916 }
      begin { routine anchor; statement location unresolved } { 3900:0916 }
        if (g_84D4 = 0) then { routine anchor; statement location unresolved } { 3900:0916 }
          begin { routine anchor; statement location unresolved } { 3900:0916 }
            uVar1 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:0916 }
            uVar2 := Pack16(UNKNOWN_extraout_AH, 3); { routine anchor; statement location unresolved } { 3900:0916 }
            uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 3900:0916 }
            puVar9 := local_124; { routine anchor; statement location unresolved } { 3900:0916 }
            uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
            PString(BP+65246, SS) := 'The party has won.'; { 3900:09CB }
            FUN_0709_0626(puVar9, uVar10, uVar3, uVar2, uVar1); { 3900:09D0 }
          end; { routine anchor; statement location unresolved } { 3900:0916 }
        else { routine anchor; statement location unresolved } { 3900:0916 }
          begin { routine anchor; statement location unresolved } { 3900:0916 }
            uVar1 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:0916 }
            uVar2 := Pack16(UNKNOWN_extraout_AH, 3); { routine anchor; statement location unresolved } { 3900:0916 }
            uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 3900:0916 }
            puVar9 := local_128; { routine anchor; statement location unresolved } { 3900:0916 }
            uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
            PString(BP+65245, SS) := 'You have won the duel.'; { 3900:09F2 }
            FUN_0709_0626(puVar9, uVar10, uVar3, uVar2, uVar1); { 3900:09F7 }
          end; { routine anchor; statement location unresolved } { 3900:0916 }
      end; { routine anchor; statement location unresolved } { 3900:0916 }
    else { routine anchor; statement location unresolved } { 3900:0916 }
      begin { routine anchor; statement location unresolved } { 3900:0916 }
        uVar1 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:0916 }
        uVar2 := Pack16(UNKNOWN_extraout_AH, 3); { routine anchor; statement location unresolved } { 3900:0916 }
        uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 3900:0916 }
        puVar9 := @(local_129); { routine anchor; statement location unresolved } { 3900:0916 }
        uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
        PString(BP+65235, SS) := 'You have lost the duel.'; { 3900:0A1A }
        FUN_0709_0626(puVar9, uVar10, uVar3, uVar2, uVar1); { 3900:0A1F }
        param_1 := 0; { routine anchor; statement location unresolved } { 3900:0916 }
        param_2 := 0; { routine anchor; statement location unresolved } { 3900:0916 }
      end; { routine anchor; statement location unresolved } { 3900:0916 }
  Str(LongInt(FarBits(param_2, param_1)):0, PString(local_d, SS), capacity := 10); { 3900:0A36 }
  if (g_84D4 = 0) then { routine anchor; statement location unresolved } { 3900:0916 }
    begin { routine anchor; statement location unresolved } { 3900:0916 }
      puVar9 := local_211; { routine anchor; statement location unresolved } { 3900:0916 }
      uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
      PString(BP+65009, SS) := 'Each character receives '; { 3900:0A4D }
      PString(BP+65009, SS) := Copy(PString(BP+65009, SS) + PString(local_d, SS), 1, 255); { 3900:0A57 }
      PString(local_10d, SS) := Copy(PString(puVar9, uVar10), 1, $FF); { 3900:0A66 }
      uVar8 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 3900:0916 }
    end; { routine anchor; statement location unresolved } { 3900:0916 }
  else { routine anchor; statement location unresolved } { 3900:0916 }
    begin { routine anchor; statement location unresolved } { 3900:0916 }
      puVar9 := local_211; { routine anchor; statement location unresolved } { 3900:0916 }
      uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
      PString(BP+65009, SS) := 'The duelist receives '; { 3900:0A78 }
      PString(BP+65009, SS) := Copy(PString(BP+65009, SS) + PString(local_d, SS), 1, 255); { 3900:0A82 }
      PString(local_10d, SS) := Copy(PString(puVar9, uVar10), 1, $FF); { 3900:0A91 }
      uVar8 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 3900:0916 }
    end; { routine anchor; statement location unresolved } { 3900:0916 }
  FUN_0709_0626(local_10d, SS, Pack16(uVar8, 10), Pack16(uVar8, 5), Pack16(uVar8, 1)); { 3900:0AA5 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_02, 1); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_02, 7); { routine anchor; statement location unresolved } { 3900:0916 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_02, 10); { routine anchor; statement location unresolved } { 3900:0916 }
  puVar9 := local_124; { routine anchor; statement location unresolved } { 3900:0916 }
  uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
  PString(BP+65246, SS) := 'experience points.'; { 3900:0ABE }
  FUN_0709_0626(puVar9, uVar10, uVar3, uVar2, uVar1); { 3900:0AC3 }
  puVar9 := local_110; { routine anchor; statement location unresolved } { 3900:0916 }
  puVar11 := local_134; { routine anchor; statement location unresolved } { 3900:0916 }
  uVar10 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
  uVar1 := SS; { routine anchor; statement location unresolved } { 3900:0916 }
  PString(BP+65230, SS) := 'press <enter>/<return> to continue'; { 3900:0AD9 }
  ov25_03BD(@(local_111), SS, (Word(UNKNOWN_extraout_AH_03) shl 8), Pack16(UNKNOWN_extraout_AH_03, 1), Pack16(UNKNOWN_extraout_AH_03, $F), Pack16(UNKNOWN_extraout_AH_03, $F), Pack16(UNKNOWN_extraout_AH_03, $F), puVar11, uVar10, puVar9, uVar1); { 3900:0AF3 }
  Exit; { 3900:0AFF }
end; { routine anchor; statement location unresolved } { 3900:0916 }
```

### ov05:0B14 ShowLootItems (conf M)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: P_Word [BP+$0A]; param_3: P_Word [BP+$0E]; param_4: P_Byte [BP+$12].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; uVar12: Word [compiler temporary; no proven BP slot]; puVar13: P_Byte [compiler temporary; no proven BP slot]; local_2b: array[0..4] of Byte [BP-$29]; local_26: array[0..2] of Byte [BP-$24]; local_23: array[0..4] of Byte [BP-$21]; local_1e: Integer [BP-$1C]; iStack_1c: Integer [BP-$1A]; local_1a: array[0..19] of Byte [BP-$18]; local_6: Integer [BP-$4]; local_4: Integer [BP-$2]; bVar8: Byte [compiler temporary; no proven BP slot].  
Callers: FUN_3900_0c06.  
Callees: FUN_00ba_0442, FUN_03f1_02e8, System.@StrCopy, ov25_0D9A.

```pascal
procedure ShowLootItems(param_1: LongWord; param_2: P_Word; param_3: P_Word; param_4: P_Byte); { 3900:0B14 }
begin { routine anchor; statement location unresolved } { 3900:0B14 }
  local_1a[0] := 1; { routine anchor; statement location unresolved } { 3900:0B14 }
  bVar8 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar3 := Pack16(bVar8, 1); { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar9 := Pack16(bVar8, 1); { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar4 := Pack16(bVar8, $26); { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar5 := Pack16(bVar8, $16); { routine anchor; statement location unresolved } { 3900:0B14 }
  iVar6 := (Word(bVar8) shl 8); { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar7 := Pack16(bVar8, $F); { routine anchor; statement location unresolved } { 3900:0B14 }
  puVar11 := local_23; { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar12 := SS; { routine anchor; statement location unresolved } { 3900:0B14 }
  PString(local_23, SS) := 'Loot'; { 3900:0B3A }
  uVar10 := $3F1; { routine anchor; statement location unresolved } { 3900:0B14 }
  FUN_03f1_02e8(puVar11, uVar12, uVar7, iVar6, uVar5, uVar4, uVar9, uVar3); { 3900:0B3F }
  iStack_1c := g_6812; { 3900:0B4E }
  local_1e := g_6810; { 3900:0B4B }
  while ((local_1e <> 0) or else (iStack_1c <> 0)) do { routine anchor; statement location unresolved } { 3900:0B14 }
    begin { routine anchor; statement location unresolved } { 3900:0B14 }
      uVar10 := $BA; { routine anchor; statement location unresolved } { 3900:0B14 }
      FUN_00ba_0442(0, 0, 0, 0, local_1e, iStack_1c, 0, 0); { 3900:0B71 }
      piVar1 := P_Integer((local_1e + $2A)); { routine anchor; statement location unresolved } { 3900:0B14 }
      iStack_1c := (P_Integer((local_1e + $2C)))^; { 3900:0B84 }
      local_1e := (piVar1)^; { 3900:0B81 }
    end; { routine anchor; statement location unresolved } { 3900:0B14 }
  local_6 := g_6810; { 3900:0B90 }
  local_4 := g_6812; { 3900:0B93 }
  puVar11 := local_26; { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar3 := SS; { routine anchor; statement location unresolved } { 3900:0B14 }
  PString(local_26, SS) := 'Items: '; { 3900:0BA0 }
  puVar13 := local_2b; { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar12 := SS; { routine anchor; statement location unresolved } { 3900:0B14 }
  PString(local_2b, SS) := 'Take'; { 3900:0BAF }
  uVar9 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar2 := ov25_0D9A(P_Word(param_2), uVar9, Integer(param_1), Integer((LongWord(param_1) shr $10)), local_1a, SS, Pack16(UNKNOWN_extraout_AH, 1), local_6, local_4, Pack16(UNKNOWN_extraout_AH, $16), Pack16(UNKNOWN_extraout_AH, $26), Pack16(UNKNOWN_extraout_AH, 4), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), puVar13, uVar12, puVar11, uVar3); { 3900:0BE1 }
  (param_4)^ := uVar2; { routine anchor; statement location unresolved } { 3900:0B14 }
  uVar12 := P_Word(param_2)[1]; { routine anchor; statement location unresolved } { 3900:0B14 }
  (param_3)^ := (param_2)^; { routine anchor; statement location unresolved } { 3900:0B14 }
  P_Word(param_3)[1] := uVar12; { routine anchor; statement location unresolved } { 3900:0B14 }
  Exit; { 3900:0C03 }
end; { routine anchor; statement location unresolved } { 3900:0B14 }
```

### ov05:0C06 FUN_3900_0c06 (conf L)

Params (stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_13: ShortInt [BP-$11]; local_12: Word [BP-$10]; local_10: Integer [BP-$E]; local_e: Integer [BP-$C]; local_c: ShortInt [BP-$A]; local_b: ShortInt [BP-$9]; local_a: Integer [BP-$8]; iStack_8: Integer [BP-$6]; local_6: LongWord [BP-$4].  
Callers: FUN_3900_0d38.  
Callees: FUN_00ba_27d9, ShowLootItems, System.FreeMem, ov06_0239.

```pascal
procedure FUN_3900_0c06(); { 3900:0C06 }
begin { routine anchor; statement location unresolved } { 3900:0C06 }
  local_6 := 0; { 3900:0C0E }
  local_10 := g_6810; { 3900:0C1B }
  local_e := g_6812; { 3900:0C1E }
  local_12 := 0; { 3900:0C23 }
  repeat { routine anchor; statement location unresolved } { 3900:0C06 }
    begin { routine anchor; statement location unresolved } { 3900:0C06 }
      ShowLootItems(@(local_12), SS, @(local_10), SS, @(local_6), SS, @(local_b), SS); { 3900:0C3B }
      if ((local_b = 84) or else (local_b = 13)) then { routine anchor; statement location unresolved } { 3900:0C06 }
        begin { routine anchor; statement location unresolved } { 3900:0C06 }
          local_c := 0; { 3900:0C4A }
          ov06_0239(@(local_13), SS, Integer(local_6), Slice16(local_6, 2)); { 3900:0C60 }
          if (local_13 = 0) then { routine anchor; statement location unresolved } { 3900:0C06 }
            begin { routine anchor; statement location unresolved } { 3900:0C06 }
              _local_a := FarBits(g_6812, g_6810); { routine anchor; statement location unresolved } { 3900:0C06 }
              if ((g_6812 = Slice16(local_6, 2)) and then (g_6810 = Integer(local_6))) then { routine anchor; statement location unresolved } { 3900:0C06 }
                begin { routine anchor; statement location unresolved } { 3900:0C06 }
                  g_6810 := (P_Integer((Integer(local_6) + $2A)))^; { 3900:0C96 }
                  g_6812 := (P_Integer((Integer(local_6) + $2C)))^; { 3900:0C99 }
                end; { routine anchor; statement location unresolved } { 3900:0C06 }
              else { routine anchor; statement location unresolved } { 3900:0C06 }
                begin { routine anchor; statement location unresolved } { 3900:0C06 }
                  while true do { routine anchor; statement location unresolved } { 3900:0C06 }
                    begin { routine anchor; statement location unresolved } { 3900:0C06 }
                      uVar3 := Word((LongWord(_local_a) shr $10)); { routine anchor; statement location unresolved } { 3900:0C06 }
                      iVar2 := Integer(_local_a); { routine anchor; statement location unresolved } { 3900:0C06 }
                      if (((P_Integer((iVar2 + $2C)))^ = Slice16(local_6, 2)) and then ((P_Integer((iVar2 + $2A)))^ = Integer(local_6))) then { routine anchor; statement location unresolved } { 3900:0C06 }
                        Break; { routine anchor; statement location unresolved } { 3900:0C06 }
                      _local_a := FarBits((P_Word((iVar2 + $2C)))^, (P_Word((iVar2 + $2A)))^); { routine anchor; statement location unresolved } { 3900:0C06 }
                    end; { routine anchor; statement location unresolved } { 3900:0C06 }
                  uVar1 := (P_Word((Integer(local_6) + $2C)))^; { routine anchor; statement location unresolved } { 3900:0C06 }
                  (P_Word((iVar2 + $2A)))^ := (P_Word((Integer(local_6) + $2A)))^; { routine anchor; statement location unresolved } { 3900:0C06 }
                  (P_Word((iVar2 + $2C)))^ := uVar1; { routine anchor; statement location unresolved } { 3900:0C06 }
                end; { routine anchor; statement location unresolved } { 3900:0C06 }
              (P_Word((Integer(local_6) + $2A)))^ := 0; { routine anchor; statement location unresolved } { 3900:0C06 }
              (P_Word((Integer(local_6) + $2C)))^ := 0; { routine anchor; statement location unresolved } { 3900:0C06 }
              if ((Integer(local_6) <> 0) or else (Slice16(local_6, 2) <> 0)) then { routine anchor; statement location unresolved } { 3900:0C06 }
                begin { routine anchor; statement location unresolved } { 3900:0C06 }
                  FreeMem(FarPtr(Slice16(local_6, 2), Integer(local_6)), $3F); { 3900:0CFC }
                end; { routine anchor; statement location unresolved } { 3900:0C06 }
              if ((g_6810 = 0) and then (g_6812 = 0)) then { routine anchor; statement location unresolved } { 3900:0C06 }
                begin { routine anchor; statement location unresolved } { 3900:0C06 }
                  local_c := 1; { 3900:0C51 }
                end; { routine anchor; statement location unresolved } { 3900:0C06 }
            end; { routine anchor; statement location unresolved } { 3900:0C06 }
        end; { routine anchor; statement location unresolved } { 3900:0C06 }
      else { routine anchor; statement location unresolved } { 3900:0C06 }
        begin { routine anchor; statement location unresolved } { 3900:0C06 }
          local_c := 1; { 3900:0D0A }
        end; { routine anchor; statement location unresolved } { 3900:0C06 }
    end; { routine anchor; statement location unresolved } { 3900:0C06 }
  until not ((local_c = 0)); { routine anchor; statement location unresolved } { 3900:0C06 }
  FUN_00ba_27d9(); { 3900:0D17 }
  Exit; { 3900:0D1F }
end; { routine anchor; statement location unresolved } { 3900:0C06 }
```

### ov05:0D38 ChooseMoneyOrItems (conf M)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: P_ShortInt [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_1d: array[0..16] of Byte [BP-$1B]; local_c: array[0..6] of Byte [BP-$A]; local_5: Byte [BP-$3]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: FUN_3900_0ecd.  
Callees: FUN_00ba_0767, FUN_00ba_27d9, FUN_3900_0c06, System.@StrCopy, ov19_27DF, ov21_0CEB, ov21_0F7E, ov25_03BD.

```pascal
procedure ChooseMoneyOrItems(param_1: P_ShortInt; param_2: P_ShortInt); { 3900:0D38 }
begin { routine anchor; statement location unresolved } { 3900:0D38 }
  uVar1 := $3900; { routine anchor; statement location unresolved } { 3900:0D38 }
  local_4 := 0; { 3900:0D3E }
  if ((param_2)^ = 0) then { routine anchor; statement location unresolved } { 3900:0D38 }
    begin { routine anchor; statement location unresolved } { 3900:0D38 }
      FUN_3900_0c06(); { 3900:0DAC }
    end; { routine anchor; statement location unresolved } { 3900:0D38 }
  else { routine anchor; statement location unresolved } { 3900:0D38 }
    if ((param_1)^ = 0) then { routine anchor; statement location unresolved } { 3900:0D38 }
      begin { routine anchor; statement location unresolved } { 3900:0D38 }
        ov21_0CEB(); { 3900:0D9B }
        FUN_00ba_27d9(); { 3900:0DA0 }
      end; { routine anchor; statement location unresolved } { 3900:0D38 }
    else { routine anchor; statement location unresolved } { 3900:0D38 }
      begin { routine anchor; statement location unresolved } { 3900:0D38 }
        repeat { routine anchor; statement location unresolved } { 3900:0D38 }
          begin { routine anchor; statement location unresolved } { 3900:0D38 }
            puVar3 := local_c; { routine anchor; statement location unresolved } { 3900:0D38 }
            uVar4 := SS; { routine anchor; statement location unresolved } { 3900:0D38 }
            PString(local_c, SS) := 'Take: '; { 3900:0D64 }
            puVar2 := local_1d; { routine anchor; statement location unresolved } { 3900:0D38 }
            uVar1 := SS; { routine anchor; statement location unresolved } { 3900:0D38 }
            PString(local_1d, SS) := 'Money Items Exit'; { 3900:0D73 }
            uVar1 := ov25_03BD(@(local_5), SS, Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), puVar2, uVar1, puVar3, uVar4); { 3900:0D8C }
            local_3 := ShortInt(uVar1); { 3900:0D91 }
            if (local_3 = 77) then { routine anchor; statement location unresolved } { 3900:0D38 }
              begin { routine anchor; statement location unresolved } { 3900:0D38 }
                ov21_0CEB(); { 3900:0E18 }
                FUN_00ba_27d9(); { 3900:0E1D }
              end; { routine anchor; statement location unresolved } { 3900:0D38 }
            else { routine anchor; statement location unresolved } { 3900:0D38 }
              if (local_3 = 73) then { routine anchor; statement location unresolved } { 3900:0D38 }
                begin { routine anchor; statement location unresolved } { 3900:0D38 }
                  FUN_3900_0c06(); { 3900:0E25 }
                end; { routine anchor; statement location unresolved } { 3900:0D38 }
              else { routine anchor; statement location unresolved } { 3900:0D38 }
                if ((local_3 = 69) or else (local_3 = 0)) then { routine anchor; statement location unresolved } { 3900:0D38 }
                  begin { routine anchor; statement location unresolved } { 3900:0D38 }
                    local_4 := 1; { 3900:0DB9 }
                  end; { routine anchor; statement location unresolved } { 3900:0D38 }
                else { routine anchor; statement location unresolved } { 3900:0D38 }
                  if (local_3 = 71) then { routine anchor; statement location unresolved } { 3900:0D38 }
                    begin { routine anchor; statement location unresolved } { 3900:0D38 }
                      ov19_27DF(uVar1); { 3900:0DC7 }
                    end; { routine anchor; statement location unresolved } { 3900:0D38 }
                  else { routine anchor; statement location unresolved } { 3900:0D38 }
                    if (local_3 = 79) then { routine anchor; statement location unresolved } { 3900:0D38 }
                      begin { routine anchor; statement location unresolved } { 3900:0D38 }
                        ov19_27DF(uVar1); { 3900:0DD6 }
                      end; { routine anchor; statement location unresolved } { 3900:0D38 }
            FUN_00ba_0767(g_5D92, g_5D94); { 3900:0DE3 }
            uVar1 := $8F; { routine anchor; statement location unresolved } { 3900:0D38 }
            ov21_0F7E(P_ShortInt(param_1), Integer((LongWord(param_1) shr $10)), P_ShortInt(param_2), Integer((LongWord(param_2) shr $10))); { 3900:0DF2 }
            if (((param_2)^ = 0) or else ((param_1)^ = 0)) then { routine anchor; statement location unresolved } { 3900:0D38 }
              begin { routine anchor; statement location unresolved } { 3900:0D38 }
                local_4 := 1; { 3900:0E09 }
              end; { routine anchor; statement location unresolved } { 3900:0D38 }
          end; { routine anchor; statement location unresolved } { 3900:0D38 }
        until not ((local_4 = 0)); { routine anchor; statement location unresolved } { 3900:0D38 }
      end; { routine anchor; statement location unresolved } { 3900:0D38 }
  Exit; { 3900:0E2B }
end; { routine anchor; statement location unresolved } { 3900:0D38 }
```

### ov05:0ECD TreasureMenu (conf M)

Params (stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar8: Byte [compiler temporary; no proven BP slot]; bVar9: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; iVar10: Integer [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; local_21c: array[0..207] of Byte [BP-$21A]; local_14c: array[0..15] of Byte [BP-$14A]; local_13c: array[0..31] of Byte [BP-$13A]; local_11c: array[0..13] of Byte [BP-$11A]; local_10e: ShortInt [BP-$10C]; local_10d: Byte [BP-$10B]; local_10c: Byte [BP-$10A]; local_10b: ShortInt [BP-$109]; local_10a: array[0..1] of Byte [BP-$108]; local_108: ShortInt [BP-$106]; local_107: ShortInt [BP-$105]; local_106: ShortInt [BP-$104]; local_105: array[0..256] of Byte [BP-$103]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: ov05_1527.  
Callees: FUN_00ba_0767, FUN_00ba_27d9, FUN_0709_0768, FUN_0709_0dd3, ChooseMoneyOrItems, System.@StrAppend, System.@StrAssign, System.@StrCopy, MenuSelect, CharacterViewMenu, ov19_27DF, ov21_0508, ov21_063A, ov21_0F7E, ov22_0C20, ov25_03BD.

M: treasure menu changes by mode and pooled-money state; exit can ask whether to return for unclaimed treasure.

```pascal
procedure TreasureMenu(); { 3900:0ECD }
begin { routine anchor; statement location unresolved } { 3900:0ECD }
  local_10a[0] := 0; { routine anchor; statement location unresolved } { 3900:0ECD }
  local_107 := 0; { routine anchor; statement location unresolved } { 3900:0ECD }
  FUN_00ba_27d9(); { 3900:0EDE }
  local_3 := 0; { 3900:0EE3 }
  repeat { routine anchor; statement location unresolved } { 3900:0ECD }
    begin { routine anchor; statement location unresolved } { 3900:0ECD }
      ov21_0F7E(@(local_4), SS, @(local_3), SS); { 3900:0EF1 }
      PString(local_105, SS) := Copy('View Pool Exit', 1, $FF); { 3900:0F05 }
      local_10c := 0; { routine anchor; statement location unresolved } { 3900:0ECD }
      PString(local_11c, SS) := Copy(' Exit', 1, $D); { 3900:0F1E }
      uVar1 := UNKNOWN_AXAfterHelper; { 3900:0F1E }
      uVar8 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 3900:0ECD }
      local_10e := 0; { routine anchor; statement location unresolved } { 3900:0ECD }
      if (local_4 <> 0) then { routine anchor; statement location unresolved } { 3900:0ECD }
        begin { routine anchor; statement location unresolved } { 3900:0ECD }
          while Sequence((uVar8 := Byte((Word(uVar1) shr 8))); ((local_10c < $15) and then (local_10e = 0))) do { routine anchor; statement location unresolved } { 3900:0ECD }
            begin { routine anchor; statement location unresolved } { 3900:0ECD }
              uVar1 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 3900:0ECD }
              iVar10 := Integer(g_5D92); { routine anchor; statement location unresolved } { 3900:0ECD }
              if (((P_ShortInt(((iVar10 + Word(local_10c)) + $17)))^ = 5) or else ((P_ShortInt(((iVar10 + Word(local_10c)) + $17)))^ = 11)) then { routine anchor; statement location unresolved } { 3900:0ECD }
                begin { routine anchor; statement location unresolved } { 3900:0ECD }
                  local_10e := 1; { routine anchor; statement location unresolved } { 3900:0ECD }
                  local_10d := (P_Byte(((iVar10 + Word(local_10c)) + $17)))^; { routine anchor; statement location unresolved } { 3900:0ECD }
                end; { routine anchor; statement location unresolved } { 3900:0ECD }
              uVar1 := 0; { routine anchor; statement location unresolved } { 3900:0ECD }
              local_10c := (local_10c + 1); { routine anchor; statement location unresolved } { 3900:0ECD }
            end; { routine anchor; statement location unresolved } { 3900:0ECD }
        end; { routine anchor; statement location unresolved } { 3900:0ECD }
      if (local_10e <> 0) then { routine anchor; statement location unresolved } { 3900:0ECD }
        begin { routine anchor; statement location unresolved } { 3900:0ECD }
          PString(local_11c, SS) := Copy(' Detect Exit', 1, $D); { 3900:0F97 }
          uVar8 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 3900:0ECD }
        end; { routine anchor; statement location unresolved } { 3900:0ECD }
      if (local_3 = 0) then { routine anchor; statement location unresolved } { 3900:0ECD }
        begin { routine anchor; statement location unresolved } { 3900:0ECD }
          if (local_4 <> 0) then { routine anchor; statement location unresolved } { 3900:0ECD }
            begin { routine anchor; statement location unresolved } { 3900:0ECD }
              puVar11 := local_21c; { routine anchor; statement location unresolved } { 3900:0ECD }
              uVar1 := SS; { routine anchor; statement location unresolved } { 3900:0ECD }
              PString(BP+64998, SS) := 'View Take Pool'; { 3900:0FAD }
              PString(BP+64998, SS) := Copy(PString(BP+64998, SS) + PString(local_11c, SS), 1, 255); { 3900:0FB8 }
              PString(local_105, SS) := Copy(PString(puVar11, uVar1), 1, $FF); { 3900:0FC7 }
              uVar8 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 3900:0ECD }
            end; { routine anchor; statement location unresolved } { 3900:0ECD }
        end; { routine anchor; statement location unresolved } { 3900:0ECD }
      else { routine anchor; statement location unresolved } { 3900:0ECD }
        begin { routine anchor; statement location unresolved } { 3900:0ECD }
          puVar11 := local_21c; { routine anchor; statement location unresolved } { 3900:0ECD }
          uVar1 := SS; { routine anchor; statement location unresolved } { 3900:0ECD }
          PString(BP+64998, SS) := 'View Take Pool Share'; { 3900:0FDF }
          PString(BP+64998, SS) := Copy(PString(BP+64998, SS) + PString(local_11c, SS), 1, 255); { 3900:0FEA }
          PString(local_105, SS) := Copy(PString(puVar11, uVar1), 1, $FF); { 3900:0FF9 }
          uVar8 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 3900:0ECD }
        end; { routine anchor; statement location unresolved } { 3900:0ECD }
      uVar1 := ov25_03BD(@(local_108), SS, Pack16(uVar8, 1), Pack16(uVar8, 1), Pack16(uVar8, $F), Pack16(uVar8, 10), Pack16(uVar8, $D), local_105, SS, local_10a, SS); { 3900:101F }
      local_106 := ShortInt(uVar1); { routine anchor; statement location unresolved } { 3900:0ECD }
      bVar9 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 3900:0ECD }
      if (local_106 = 86) then { routine anchor; statement location unresolved } { 3900:0ECD }
        begin { routine anchor; statement location unresolved } { 3900:0ECD }
          CharacterViewMenu(@(local_108), SS); { 3900:1036 }
        end; { routine anchor; statement location unresolved } { 3900:0ECD }
      else { routine anchor; statement location unresolved } { 3900:0ECD }
        if (local_106 = 84) then { routine anchor; statement location unresolved } { 3900:0ECD }
          begin { routine anchor; statement location unresolved } { 3900:0ECD }
            ChooseMoneyOrItems(@(local_4), SS, @(local_3), SS); { 3900:104D }
          end; { routine anchor; statement location unresolved } { 3900:0ECD }
        else { routine anchor; statement location unresolved } { 3900:0ECD }
          if (local_106 = 80) then { routine anchor; statement location unresolved } { 3900:0ECD }
            begin { routine anchor; statement location unresolved } { 3900:0ECD }
              if (local_108 = 0) then { routine anchor; statement location unresolved } { 3900:0ECD }
                begin { routine anchor; statement location unresolved } { 3900:0ECD }
                  ov21_0508(); { 3900:105E }
                end; { routine anchor; statement location unresolved } { 3900:0ECD }
            end; { routine anchor; statement location unresolved } { 3900:0ECD }
          else { routine anchor; statement location unresolved } { 3900:0ECD }
            if (local_106 = 83) then { routine anchor; statement location unresolved } { 3900:0ECD }
              begin { routine anchor; statement location unresolved } { 3900:0ECD }
                ov21_063A(); { 3900:106A }
              end; { routine anchor; statement location unresolved } { 3900:0ECD }
            else { routine anchor; statement location unresolved } { 3900:0ECD }
              if (local_106 = 68) then { routine anchor; statement location unresolved } { 3900:0ECD }
                begin { routine anchor; statement location unresolved } { 3900:0ECD }
                  ov22_0C20(@(local_108), SS, (Word(bVar9) shl 8), (Word(bVar9) shl 8), Pack16(bVar9, local_10d)); { 3900:1087 }
                end; { routine anchor; statement location unresolved } { 3900:0ECD }
              else { routine anchor; statement location unresolved } { 3900:0ECD }
                if ((local_106 = 69) or else (local_106 = 0)) then { routine anchor; statement location unresolved } { 3900:0ECD }
                  begin { routine anchor; statement location unresolved } { 3900:0ECD }
                    ov21_0F7E(@(local_4), SS, @(local_3), SS); { 3900:10A4 }
                    if ((local_3 = 0) and then (local_4 = 0)) then { routine anchor; statement location unresolved } { 3900:0ECD }
                      begin { routine anchor; statement location unresolved } { 3900:0ECD }
                        local_107 := 1; { routine anchor; statement location unresolved } { 3900:0ECD }
                      end; { routine anchor; statement location unresolved } { 3900:0ECD }
                    else { routine anchor; statement location unresolved } { 3900:0ECD }
                      begin { routine anchor; statement location unresolved } { 3900:0ECD }
                        PString(local_105, SS) := Copy('~Yes ~No', 1, $FF); { 3900:10C7 }
                        uVar2 := Pack16(UNKNOWN_extraout_AH_02, 1); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar3 := Pack16(UNKNOWN_extraout_AH_02, $11); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar4 := Pack16(UNKNOWN_extraout_AH_02, $26); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar5 := Pack16(UNKNOWN_extraout_AH_02, $16); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar6 := Pack16(UNKNOWN_extraout_AH_02, 10); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar7 := Pack16(UNKNOWN_extraout_AH_02, 1); { routine anchor; statement location unresolved } { 3900:0ECD }
                        puVar11 := local_13c; { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar1 := SS; { routine anchor; statement location unresolved } { 3900:0ECD }
                        PString(BP+65222, SS) := 'There is still treasure left.  '; { 3900:10E9 }
                        FUN_0709_0768(puVar11, uVar1, uVar7, uVar6, uVar5, uVar4, uVar3, uVar2); { 3900:10EE }
                        uVar2 := Pack16(UNKNOWN_extraout_AH_03, 1); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar3 := Pack16(UNKNOWN_extraout_AH_03, $11); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar4 := Pack16(UNKNOWN_extraout_AH_03, $26); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar5 := Pack16(UNKNOWN_extraout_AH_03, $16); { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar6 := Pack16(UNKNOWN_extraout_AH_03, $F); { routine anchor; statement location unresolved } { 3900:0ECD }
                        iVar10 := (Word(UNKNOWN_extraout_AH_03) shl 8); { routine anchor; statement location unresolved } { 3900:0ECD }
                        puVar11 := local_14c; { routine anchor; statement location unresolved } { 3900:0ECD }
                        uVar1 := SS; { routine anchor; statement location unresolved } { 3900:0ECD }
                        PString(BP+65206, SS) := 'Do you want to go back and claim your treasure?'; { 3900:1110 }
                        FUN_0709_0768(puVar11, uVar1, iVar10, uVar6, uVar5, uVar4, uVar3, uVar2); { 3900:1115 }
                        local_10b := MenuSelect((Word(UNKNOWN_extraout_AH_04) shl 8), (Word(UNKNOWN_extraout_AH_04) shl 8), Pack16(UNKNOWN_extraout_AH_04, $F), Pack16(UNKNOWN_extraout_AH_04, 10), Pack16(UNKNOWN_extraout_AH_04, $D), local_105, SS, local_10a, SS); { 3900:1135 }
                        if (local_10b = 1) then { routine anchor; statement location unresolved } { 3900:0ECD }
                          begin { routine anchor; statement location unresolved } { 3900:0ECD }
                            local_107 := 1; { routine anchor; statement location unresolved } { 3900:0ECD }
                          end; { routine anchor; statement location unresolved } { 3900:0ECD }
                        else { routine anchor; statement location unresolved } { 3900:0ECD }
                          begin { routine anchor; statement location unresolved } { 3900:0ECD }
                            FUN_0709_0dd3($16, $26, $11, 1); { 3900:1158 }
                          end; { routine anchor; statement location unresolved } { 3900:0ECD }
                      end; { routine anchor; statement location unresolved } { 3900:0ECD }
                  end; { routine anchor; statement location unresolved } { 3900:0ECD }
                else { routine anchor; statement location unresolved } { 3900:0ECD }
                  if (local_106 = 71) then { routine anchor; statement location unresolved } { 3900:0ECD }
                    begin { routine anchor; statement location unresolved } { 3900:0ECD }
                      ov19_27DF(uVar1); { 3900:116F }
                      FUN_00ba_0767(g_5D92, g_5D94); { 3900:117C }
                    end; { routine anchor; statement location unresolved } { 3900:0ECD }
                  else { routine anchor; statement location unresolved } { 3900:0ECD }
                    if (local_106 = 79) then { routine anchor; statement location unresolved } { 3900:0ECD }
                      begin { routine anchor; statement location unresolved } { 3900:0ECD }
                        ov19_27DF(uVar1); { 3900:118C }
                        FUN_00ba_0767(g_5D92, g_5D94); { 3900:1199 }
                      end; { routine anchor; statement location unresolved } { 3900:0ECD }
    end; { routine anchor; statement location unresolved } { 3900:0ECD }
  until not ((local_107 = 0)); { routine anchor; statement location unresolved } { 3900:0ECD }
  Exit; { 3900:11AB }
end; { routine anchor; statement location unresolved } { 3900:0ECD }
```

### ov05:11AC FUN_3900_11ac (conf L)

Params (stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; puVar2: P_Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers: ov05_1527.  
Callees: System.FreeMem, ov16_3291.

```pascal
procedure FUN_3900_11ac(); { 3900:11AC }
begin { routine anchor; statement location unresolved } { 3900:11AC }
  (P_Word((Integer(g_49D6) + $590)))^ := 0; { routine anchor; statement location unresolved } { 3900:11AC }
  local_6 := g_5D96; { 3900:11C4 }
  uStack_4 := g_5D98; { 3900:11C7 }
  while ((local_6 <> 0) or else (uStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3900:11AC }
    begin { routine anchor; statement location unresolved } { 3900:11AC }
      if (((P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $13)))^ = 1) or else ((P_ShortInt((local_6 + $10E)))^ = 1)) then { routine anchor; statement location unresolved } { 3900:11AC }
        begin { routine anchor; statement location unresolved } { 3900:11AC }
          if ((P_ShortInt((local_6 + $10D)))^ <> 1) then { routine anchor; statement location unresolved } { 3900:11AC }
            begin { routine anchor; statement location unresolved } { 3900:11AC }
              piVar1 := P_Integer((Integer(g_49D6) + $590)); { routine anchor; statement location unresolved } { 3900:11AC }
              (piVar1)^ := ((piVar1)^ + 1); { routine anchor; statement location unresolved } { 3900:11AC }
            end; { routine anchor; statement location unresolved } { 3900:11AC }
          uVar3 := (P_Word((local_6 + $104)))^; { routine anchor; statement location unresolved } { 3900:11AC }
          iVar4 := (P_Integer((local_6 + $106)))^; { routine anchor; statement location unresolved } { 3900:11AC }
          g_5D92 := local_6; { 3900:121C }
          g_5D94 := uStack_4; { 3900:121F }
          uVar5 := (local_6 and $FF00); { routine anchor; statement location unresolved } { 3900:11AC }
          if ((P_ShortInt((Integer((P_LongWord((local_6 + $108)))^) + $13)))^ = 1) then { routine anchor; statement location unresolved } { 3900:11AC }
            begin { routine anchor; statement location unresolved } { 3900:11AC }
              uVar5 := (uVar5 + 1); { routine anchor; statement location unresolved } { 3900:11AC }
            end; { routine anchor; statement location unresolved } { 3900:11AC }
          ov16_3291(Pack16(ShortInt((uVar5 shr 8)), 1), uVar5); { 3900:1239 }
          local_6 := uVar3; { 3900:1244 }
          uStack_4 := iVar4; { 3900:1247 }
        end; { routine anchor; statement location unresolved } { 3900:11AC }
      else { routine anchor; statement location unresolved } { 3900:11AC }
        begin { routine anchor; statement location unresolved } { 3900:11AC }
          if (((P_Integer((local_6 + $108)))^ <> 0) or else ((P_Integer((local_6 + $10A)))^ <> 0)) then { routine anchor; statement location unresolved } { 3900:11AC }
            begin { routine anchor; statement location unresolved } { 3900:11AC }
              FreeMem(FarPtr((P_Word((local_6 + $10A)))^, (P_Word((local_6 + $108)))^), $16); { 3900:126C }
              (P_Word((local_6 + $108)))^ := 0; { routine anchor; statement location unresolved } { 3900:11AC }
              (P_Word((local_6 + $10A)))^ := 0; { routine anchor; statement location unresolved } { 3900:11AC }
            end; { routine anchor; statement location unresolved } { 3900:11AC }
          puVar2 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:11AC }
          uStack_4 := (P_Integer((local_6 + $106)))^; { 3900:1290 }
          local_6 := (puVar2)^; { 3900:128D }
        end; { routine anchor; statement location unresolved } { 3900:11AC }
    end; { routine anchor; statement location unresolved } { 3900:11AC }
  g_5D92 := g_5D96; { 3900:129D }
  g_5D94 := g_5D98; { 3900:12A0 }
  Exit; { 3900:12A7 }
end; { routine anchor; statement location unresolved } { 3900:11AC }
```

### ov05:12E8 NPCShareOfTreasure (conf M)

Params (stack slots): none.  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; bVar10: Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar11: Byte [compiler temporary; no proven BP slot]; uVar12: Word [compiler temporary; no proven BP slot]; puVar13: P_Byte [compiler temporary; no proven BP slot]; uVar14: Word [compiler temporary; no proven BP slot]; puVar15: P_Byte [compiler temporary; no proven BP slot]; local_117: array[0..219] of Byte [BP-$115]; local_3b: array[0..34] of Byte [BP-$39]; local_18: array[0..1] of Byte [BP-$16]; local_16: Byte [BP-$14]; local_15: ShortInt [BP-$13]; local_b: ShortInt [BP-$9]; local_a: Byte [BP-$8]; local_9: Byte [BP-$7]; local_8: ShortInt [BP-$6]; local_7: Byte [BP-$5]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers: ov05_1527.  
Callees: FUN_03f1_02e8, FUN_0709_0768, System.@LongDivMod, System.@StrAppend, System.@StrCopy, ov25_03BD.

```pascal
procedure NPCShareOfTreasure(); { 3900:12E8 }
begin { routine anchor; statement location unresolved } { 3900:12E8 }
  uVar12 := $3900; { routine anchor; statement location unresolved } { 3900:12E8 }
  local_15 := 0; { 3900:12EF }
  uStack_4 := g_5D98; { 3900:12FD }
  local_7 := 0; { 3900:1300 }
  local_8 := 0; { 3900:1304 }
  local_6 := g_5D96; { 3900:12FA }
  while ((local_6 <> 0) or else (uStack_4 <> 0)) do { routine anchor; statement location unresolved } { 3900:12E8 }
    begin { routine anchor; statement location unresolved } { 3900:12E8 }
      if (((P_Byte((local_6 + $84)))^ < $80) or else ((P_ShortInt((local_6 + $10C)))^ <> 0)) then { routine anchor; statement location unresolved } { 3900:12E8 }
        begin { routine anchor; statement location unresolved } { 3900:12E8 }
          local_8 := (local_8 + 1); { 3900:133D }
        end; { routine anchor; statement location unresolved } { 3900:12E8 }
      else { routine anchor; statement location unresolved } { 3900:12E8 }
        begin { routine anchor; statement location unresolved } { 3900:12E8 }
          local_7 := (local_7 + ((P_Byte((local_6 + $85)))^ and 7)); { 3900:1330 }
          local_8 := (local_8 + ((P_Byte((local_6 + $85)))^ and 7)); { 3900:1342 }
        end; { routine anchor; statement location unresolved } { 3900:12E8 }
      puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:12E8 }
      uStack_4 := (P_Word((local_6 + $106)))^; { 3900:1355 }
      local_6 := (puVar1)^; { 3900:1352 }
    end; { routine anchor; statement location unresolved } { 3900:12E8 }
  bVar10 := 0; { routine anchor; statement location unresolved } { 3900:12E8 }
  if (local_7 <> 0) then { routine anchor; statement location unresolved } { 3900:12E8 }
    begin { routine anchor; statement location unresolved } { 3900:12E8 }
      local_b := 0; { 3900:1360 }
      while true do { routine anchor; statement location unresolved } { 3900:12E8 }
        begin { routine anchor; statement location unresolved } { 3900:12E8 }
          iVar4 := Integer(local_b); { routine anchor; statement location unresolved } { 3900:12E8 }
          if ((0 < Integer(P_Word(@(g_67F6))[(iVar4 * 2)])) or else ((-(1) < Integer(P_Word(@(g_67F6))[(iVar4 * 2)])) and then (P_Word(@(g_67F4))[(iVar4 * 2)] <> 0))) then { routine anchor; statement location unresolved } { 3900:12E8 }
            begin { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar12 := $AF8; { routine anchor; statement location unresolved } { 3900:12E8 }
              local_9 := DivMod32FromRegisters(); { 3900:13A0 }
              uVar3 := (Word(local_7) * Word(local_9)); { routine anchor; statement location unresolved } { 3900:12E8 }
              iVar4 := Integer(local_b); { routine anchor; statement location unresolved } { 3900:12E8 }
              puVar1 := (P_Word(@(g_67F4)) + (iVar4 * 2)); { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar2 := (puVar1)^; { routine anchor; statement location unresolved } { 3900:12E8 }
              (puVar1)^ := ((puVar1)^ - uVar3); { routine anchor; statement location unresolved } { 3900:12E8 }
              P_Word(@(g_67F6))[(iVar4 * 2)] := ((P_Word(@(g_67F6))[(iVar4 * 2)] - (Integer(uVar3) shr $F)) - Word((uVar2 < uVar3))); { routine anchor; statement location unresolved } { 3900:12E8 }
              local_15 := 1; { 3900:13CD }
            end; { routine anchor; statement location unresolved } { 3900:12E8 }
          bVar10 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 3900:12E8 }
          if (local_b = 6) then { routine anchor; statement location unresolved } { 3900:12E8 }
            Break; { routine anchor; statement location unresolved } { 3900:12E8 }
          local_b := (local_b + 1); { 3900:1366 }
        end; { routine anchor; statement location unresolved } { 3900:12E8 }
    end; { routine anchor; statement location unresolved } { 3900:12E8 }
  if (local_15 <> 0) then { routine anchor; statement location unresolved } { 3900:12E8 }
    begin { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar5 := Pack16(bVar10, 1); { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar6 := Pack16(bVar10, 1); { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar7 := Pack16(bVar10, $26); { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar8 := Pack16(bVar10, $16); { routine anchor; statement location unresolved } { 3900:12E8 }
      iVar4 := (Word(bVar10) shl 8); { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar9 := Pack16(bVar10, $F); { routine anchor; statement location unresolved } { 3900:12E8 }
      puVar13 := local_18; { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar14 := SS; { routine anchor; statement location unresolved } { 3900:12E8 }
      PString(local_18, SS) := ''; { 3900:13FC }
      uVar12 := $3F1; { routine anchor; statement location unresolved } { 3900:12E8 }
      FUN_03f1_02e8(puVar13, uVar14, uVar9, iVar4, uVar8, uVar7, uVar6, uVar5); { 3900:1401 }
      uStack_4 := g_5D98; { 3900:1410 }
      local_a := 0; { 3900:1413 }
      local_6 := g_5D96; { 3900:140D }
      while ((local_6 or uStack_4) <> 0) do { routine anchor; statement location unresolved } { 3900:12E8 }
        begin { routine anchor; statement location unresolved } { 3900:12E8 }
          if ((($7F < (P_Byte((local_6 + $84)))^) and then ((P_ShortInt((local_6 + $10C)))^ = 0)) and then ((P_ShortInt((local_6 + $85)))^ <> 0)) then { routine anchor; statement location unresolved } { 3900:12E8 }
            begin { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar5 := Pack16(ShortInt(((local_6 or uStack_4) shr 8)), 5); { routine anchor; statement location unresolved } { 3900:12E8 }
              iVar4 := (local_a + 5); { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar11 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar6 := Pack16(uVar11, $22); { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar7 := Pack16(uVar11, $16); { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar8 := Pack16(uVar11, 10); { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar9 := Pack16(uVar11, 1); { routine anchor; statement location unresolved } { 3900:12E8 }
              puVar13 := local_117; { routine anchor; statement location unresolved } { 3900:12E8 }
              uVar14 := SS; { routine anchor; statement location unresolved } { 3900:12E8 }
              PString(BP+65259, SS) := PString(local_6, uStack_4); { 3900:1463 }
              PString(BP+65259, SS) := Copy(PString(BP+65259, SS) + ' takes and hides his share.', 1, 255); { 3900:146D }
              uVar12 := $709; { routine anchor; statement location unresolved } { 3900:12E8 }
              FUN_0709_0768(puVar13, uVar14, uVar9, uVar8, uVar7, uVar6, iVar4, uVar5); { 3900:1472 }
              local_a := (local_a + 2); { 3900:1477 }
            end; { routine anchor; statement location unresolved } { 3900:12E8 }
          puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 3900:12E8 }
          uStack_4 := (P_Word((local_6 + $106)))^; { 3900:148B }
          local_6 := (puVar1)^; { 3900:1488 }
        end; { routine anchor; statement location unresolved } { 3900:12E8 }
      puVar13 := local_18; { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar14 := SS; { routine anchor; statement location unresolved } { 3900:12E8 }
      PString(local_18, SS) := ''; { 3900:149A }
      puVar15 := local_3b; { routine anchor; statement location unresolved } { 3900:12E8 }
      uVar12 := SS; { routine anchor; statement location unresolved } { 3900:12E8 }
      PString(local_3b, SS) := 'press <enter>/<return> to continue'; { 3900:14A9 }
      ov25_03BD(@(local_16), SS, (Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, $F), puVar15, uVar12, puVar13, uVar14); { 3900:14C2 }
    end; { routine anchor; statement location unresolved } { 3900:12E8 }
  Exit; { 3900:14CD }
end; { routine anchor; statement location unresolved } { 3900:12E8 }
```

### ov05:1527 FinishCombat (conf M)

Params (stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; local_40: array[0..27] of Byte [BP-$3E]; local_24: array[0..16] of Byte [BP-$22]; local_13: array[0..8] of Byte [BP-$11]; local_a: Integer [BP-$8]; local_8: Integer [BP-$6]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: none recorded.  
Callees: FUN_03f1_02e8, FUN_0709_0768, FUN_0709_0bf5, FUN_3900_04c9, ShowCombatOutcome, TreasureMenu, FUN_3900_11ac, NPCShareOfTreasure, System.@StrCopy, System.FreeMem.

```pascal
procedure FinishCombat(); { 3900:1527 }
begin { routine anchor; statement location unresolved } { 3900:1527 }
  (P_Word((Integer(g_49D6) + $58E)))^ := 0; { routine anchor; statement location unresolved } { 3900:1527 }
  g_443A := 0; { 3900:1538 }
  g_49F3 := 6; { 3900:153D }
  FUN_3900_04c9(); { 3900:1543 }
  FUN_3900_11ac(); { 3900:1547 }
  if ((g_49FF = 0) or else (g_84D4 <> 0)) then { routine anchor; statement location unresolved } { 3900:1527 }
    begin { routine anchor; statement location unresolved } { 3900:1527 }
      NPCShareOfTreasure(); { 3900:1559 }
      ShowCombatOutcome(g_84D6, g_84D8); { 3900:1565 }
      TreasureMenu(); { 3900:1569 }
      local_6 := g_6810; { 3900:1573 }
      iStack_4 := g_6812; { 3900:1576 }
      while Sequence((iVar2 := iStack_4); (iVar7 := local_6); ((local_6 <> 0) or else (iStack_4 <> 0))) do { routine anchor; statement location unresolved } { 3900:1527 }
        begin { routine anchor; statement location unresolved } { 3900:1527 }
          local_a := local_6; { 3900:1587 }
          local_8 := iStack_4; { 3900:158A }
          piVar1 := P_Integer((local_6 + $2A)); { routine anchor; statement location unresolved } { 3900:1527 }
          iStack_4 := (P_Integer((local_6 + $2C)))^; { 3900:159B }
          local_6 := (piVar1)^; { 3900:1598 }
          FreeMem(FarPtr(iVar2, iVar7), $3F); { 3900:15A8 }
        end; { routine anchor; statement location unresolved } { 3900:1527 }
      g_6810 := 0; { 3900:15B1 }
      g_6812 := 0; { 3900:15B4 }
    end; { routine anchor; statement location unresolved } { 3900:1527 }
  else { routine anchor; statement location unresolved } { 3900:1527 }
    begin { routine anchor; statement location unresolved } { 3900:1527 }
      (P_Word((Integer(g_49D6) + $58E)))^ := $80; { routine anchor; statement location unresolved } { 3900:1527 }
      uVar3 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar4 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar5 := Pack16(UNKNOWN_extraout_AH, $26); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar6 := Pack16(UNKNOWN_extraout_AH, $16); { routine anchor; statement location unresolved } { 3900:1527 }
      iVar7 := (Word(UNKNOWN_extraout_AH) shl 8); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar8 := Pack16(UNKNOWN_extraout_AH, $F); { routine anchor; statement location unresolved } { 3900:1527 }
      puVar11 := local_13; { routine anchor; statement location unresolved } { 3900:1527 }
      uVar10 := SS; { routine anchor; statement location unresolved } { 3900:1527 }
      PString(local_13, SS) := 'The END!'; { 3900:15E0 }
      FUN_03f1_02e8(puVar11, uVar10, uVar8, iVar7, uVar6, uVar5, uVar4, uVar3); { 3900:15E5 }
      g_5E24 := 2; { 3900:15EA }
      g_5E25 := 6; { 3900:15EF }
      uVar3 := Pack16(UNKNOWN_extraout_AH_00, 2); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar4 := Pack16(UNKNOWN_extraout_AH_00, 5); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar5 := Pack16(UNKNOWN_extraout_AH_00, $25); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar6 := Pack16(UNKNOWN_extraout_AH_00, $16); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar8 := Pack16(UNKNOWN_extraout_AH_00, 10); { routine anchor; statement location unresolved } { 3900:1527 }
      uVar9 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 3900:1527 }
      puVar11 := local_40; { routine anchor; statement location unresolved } { 3900:1527 }
      uVar10 := SS; { routine anchor; statement location unresolved } { 3900:1527 }
      PString(local_40, SS) := 'The monsters rejoice for the party has been destroyed'; { 3900:1610 }
      FUN_0709_0768(puVar11, uVar10, uVar9, uVar8, uVar6, uVar5, uVar4, uVar3); { 3900:1615 }
      uVar10 := Pack16(UNKNOWN_extraout_AH_01, $D); { routine anchor; statement location unresolved } { 3900:1527 }
      puVar11 := local_24; { routine anchor; statement location unresolved } { 3900:1527 }
      PString(local_24, SS) := 'Press any key to continue'; { 3900:1627 }
      FUN_0709_0bf5(puVar11, SS, uVar10); { 3900:162C }
    end; { routine anchor; statement location unresolved } { 3900:1527 }
  g_4A00 := 1; { 3900:1631 }
  (P_Word((Integer(g_49D6) + $6E0)))^ := 0; { routine anchor; statement location unresolved } { 3900:1527 }
  (P_Word((Integer(g_49D6) + $6E2)))^ := 0; { routine anchor; statement location unresolved } { 3900:1527 }
  (P_Word((Integer(g_49D6) + $6E4)))^ := 0; { routine anchor; statement location unresolved } { 3900:1527 }
  (P_Word((Integer(g_49D6) + $5C6)))^ := 0; { routine anchor; statement location unresolved } { 3900:1527 }
  (P_Word((Integer(g_49D6) + $5CC)))^ := 0; { routine anchor; statement location unresolved } { 3900:1527 }
  Exit; { 3900:1670 }
end; { routine anchor; statement location unresolved } { 3900:1527 }
```

### ov05:1671 ov05_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov05_init(); { 3900:1671 }
begin { routine anchor; statement location unresolved } { 3900:1671 }
  Exit; { 3900:1675 }
end; { routine anchor; statement location unresolved } { 3900:1671 }
```

### ov07:0000 ecl_ReadOperands (conf H)

Params (stack slots): param_1: Byte [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: ecl_InitVM,ecl_SkipInstruction.  
Callees: ecl_UnpackString, ecl_GetMemString, MakeWord.

```pascal
procedure ecl_ReadOperands(param_1: Byte); { 4300:0000 }
begin { routine anchor; statement location unresolved } { 4300:0000 }
  local_4 := 0; { 4300:0006 }
  if (param_1 <> 0) then { routine anchor; statement location unresolved } { 4300:0000 }
    begin { routine anchor; statement location unresolved } { 4300:0000 }
      local_3 := 1; { 4300:001A }
      while true do { routine anchor; statement location unresolved } { 4300:0000 }
        begin { routine anchor; statement location unresolved } { 4300:0000 }
          (P_Byte((local_3 + $7005)))^ := (P_Byte(((Integer(g_49DE) + g_49ED) + $6701)))^; { routine anchor; statement location unresolved } { 4300:0000 }
          (P_Byte((local_3 + $7085)))^ := (P_Byte(((Integer(g_49DE) + g_49ED) + $6702)))^; { routine anchor; statement location unresolved } { 4300:0000 }
          iVar2 := (g_49ED + 2); { routine anchor; statement location unresolved } { 4300:0000 }
          cVar1 := (P_ShortInt((local_3 + $7005)))^; { routine anchor; statement location unresolved } { 4300:0000 }
          uVar3 := Word((LongWord(g_49DE) shr $10)); { routine anchor; statement location unresolved } { 4300:0000 }
          if (((cVar1 = 1) or else (cVar1 = 2)) or else (cVar1 = 3)) then { routine anchor; statement location unresolved } { 4300:0000 }
            begin { routine anchor; statement location unresolved } { 4300:0000 }
              g_49ED := (g_49ED + 3); { 4300:005C }
              (P_Byte((local_3 + $7045)))^ := (P_Byte(((Integer(g_49DE) + g_49ED) + $6700)))^; { routine anchor; statement location unresolved } { 4300:0000 }
              iVar2 := g_49ED; { routine anchor; statement location unresolved } { 4300:0000 }
            end; { routine anchor; statement location unresolved } { 4300:0000 }
          else { routine anchor; statement location unresolved } { 4300:0000 }
            if (cVar1 = -($80)) then { routine anchor; statement location unresolved } { 4300:0000 }
              begin { routine anchor; statement location unresolved } { 4300:0000 }
                local_4 := (local_4 + 1); { 4300:009A }
                g_49ED := iVar2; { 4300:0076 }
                if ((P_ShortInt((local_3 + $7085)))^ = 0) then { routine anchor; statement location unresolved } { 4300:0000 }
                  begin { routine anchor; statement location unresolved } { 4300:0000 }
                    (P_Byte(((Word(local_4) * $100) + $6FC8)))^ := 0; { routine anchor; statement location unresolved } { 4300:0000 }
                    iVar2 := g_49ED; { routine anchor; statement location unresolved } { 4300:0000 }
                  end; { routine anchor; statement location unresolved } { 4300:0000 }
                else { routine anchor; statement location unresolved } { 4300:0000 }
                  begin { routine anchor; statement location unresolved } { 4300:0000 }
                    ecl_UnpackString(local_4, (P_ShortInt((local_3 + $7085)))^); { 4300:00BC }
                    iVar2 := g_49ED; { routine anchor; statement location unresolved } { 4300:0000 }
                  end; { routine anchor; statement location unresolved } { 4300:0000 }
              end; { routine anchor; statement location unresolved } { 4300:0000 }
            else { routine anchor; statement location unresolved } { 4300:0000 }
              if (cVar1 = -($7F)) then { routine anchor; statement location unresolved } { 4300:0000 }
                begin { routine anchor; statement location unresolved } { 4300:0000 }
                  local_4 := (local_4 + 1); { 4300:00D7 }
                  g_49ED := (g_49ED + 3); { 4300:00DA }
                  (P_Byte((local_3 + $7045)))^ := (P_Byte(((Integer(g_49DE) + g_49ED) + $6700)))^; { routine anchor; statement location unresolved } { 4300:0000 }
                  uVar3 := MakeWord((P_Byte((local_3 + $7045)))^, (P_Byte((local_3 + $7085)))^); { 4300:0110 }
                  ecl_GetMemString(uVar3, local_4); { 4300:011E }
                  iVar2 := g_49ED; { routine anchor; statement location unresolved } { 4300:0000 }
                end; { routine anchor; statement location unresolved } { 4300:0000 }
          g_49ED := iVar2; { 4300:012C }
          if (local_3 = param_1) then { routine anchor; statement location unresolved } { 4300:0000 }
            Break; { routine anchor; statement location unresolved } { 4300:0000 }
          local_3 := (local_3 + 1); { 4300:001F }
        end; { routine anchor; statement location unresolved } { 4300:0000 }
    end; { routine anchor; statement location unresolved } { 4300:0000 }
  g_49ED := (g_49ED + 1); { routine anchor; statement location unresolved } { 4300:0000 }
  Exit; { 4300:0133 }
end; { routine anchor; statement location unresolved } { 4300:0000 }
```

### ov07:0136 ecl_OperandValue (conf H)

Params (stack slots): param_1: ShortInt [BP+$06].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; local_4: Word [BP-$2].  
Callers: none recorded.  
Callees: MakeWord, ecl_GetMem.

```pascal
function ecl_OperandValue(param_1: ShortInt): Word; { 4300:0136 }
begin { routine anchor; statement location unresolved } { 4300:0136 }
  bVar1 := (P_Byte((param_1 + $7085)))^; { routine anchor; statement location unresolved } { 4300:0136 }
  cVar2 := (P_ShortInt((param_1 + $7005)))^; { routine anchor; statement location unresolved } { 4300:0136 }
  if (cVar2 = 0) then { routine anchor; statement location unresolved } { 4300:0136 }
    begin { routine anchor; statement location unresolved } { 4300:0136 }
      local_4 := Word(bVar1); { 4300:0169 }
    end; { routine anchor; statement location unresolved } { 4300:0136 }
  else { routine anchor; statement location unresolved } { 4300:0136 }
    if (((cVar2 = 1) or else (cVar2 = 3)) or else (cVar2 = -($80))) then { routine anchor; statement location unresolved } { 4300:0136 }
      begin { routine anchor; statement location unresolved } { 4300:0136 }
        local_4 := ecl_GetMem(((Word((P_Byte((param_1 + $7045)))^) * $100) + Word(bVar1))); { 4300:018E }
      end; { routine anchor; statement location unresolved } { 4300:0136 }
    else { routine anchor; statement location unresolved } { 4300:0136 }
      if ((cVar2 = 2) or else (cVar2 = -($7F))) then { routine anchor; statement location unresolved } { 4300:0136 }
        begin { routine anchor; statement location unresolved } { 4300:0136 }
          local_4 := MakeWord(Pack16((param_1 shr 7), (P_Byte((param_1 + $7045)))^), Pack16((param_1 shr 7), bVar1)); { 4300:01A7 }
        end; { routine anchor; statement location unresolved } { 4300:0136 }
  Exit(local_4); { 4300:01B3 }
end; { routine anchor; statement location unresolved } { 4300:0136 }
```

### ov07:01B6 ecl_InitVM (conf H)

Params (stack slots): none.  
Locals: local_5: Integer [BP-$3].  
Callers: none recorded.  
Callees: System.FillChar, ecl_ReadOperands, MakeWord.

```pascal
procedure ecl_InitVM(); { 4300:01B6 }
begin { routine anchor; statement location unresolved } { 4300:01B6 }
  g_84E0 := 0; { 4300:01BC }
  g_84E2 := 0; { 4300:01C1 }
  g_84D2 := 0; { 4300:01C6 }
  g_84D3 := 0; { 4300:01CB }
  g_6F68 := $41; { 4300:01D0 }
  g_6F69 := 9; { 4300:01D5 }
  g_84E5 := 1; { 4300:01DA }
  FillChar(MemRef($84C8, $C7C), 2, 0); { 4300:01EB }
  g_6F83 := 8; { 4300:01F0 }
  g_49ED := $9900; { 4300:01F5 }
  g_70C6 := 0; { 4300:01FB }
  g_6F70 := 0; { 4300:0202 }
  g_6F72 := 0; { 4300:0205 }
  g_6F74 := 0; { 4300:020A }
  g_6F76 := 0; { 4300:020D }
  FillChar(MemRef(P_Byte(@(g_6F78)), $C7C), 6, 0); { 4300:021C }
  (P_Word((Integer(g_49D6) + $5C2)))^ := $FF; { routine anchor; statement location unresolved } { 4300:01B6 }
  (P_Word((Integer(g_49D6) + $5A4)))^ := 0; { routine anchor; statement location unresolved } { 4300:01B6 }
  (P_Word((Integer(g_49D6) + $5A6)))^ := 0; { routine anchor; statement location unresolved } { 4300:01B6 }
  (P_Word((Integer(g_49D2) + $1CA)))^ := 0; { routine anchor; statement location unresolved } { 4300:01B6 }
  ecl_ReadOperands(1); { 4300:0251 }
  g_49E3 := MakeWord(Pack16(UNKNOWN_extraout_AH, g_7046), Pack16(UNKNOWN_extraout_AH, g_7086)); { 4300:025D }
  ecl_ReadOperands(1); { 4300:0267 }
  g_49E5 := MakeWord(Pack16(UNKNOWN_extraout_AH_00, g_7046), Pack16(UNKNOWN_extraout_AH_00, g_7086)); { 4300:0273 }
  ecl_ReadOperands(1); { 4300:027D }
  g_49E7 := MakeWord(Pack16(UNKNOWN_extraout_AH_01, g_7046), Pack16(UNKNOWN_extraout_AH_01, g_7086)); { 4300:0289 }
  ecl_ReadOperands(1); { 4300:0293 }
  g_49E9 := MakeWord(Pack16(UNKNOWN_extraout_AH_02, g_7046), Pack16(UNKNOWN_extraout_AH_02, g_7086)); { 4300:029F }
  ecl_ReadOperands(1); { 4300:02A9 }
  g_49EB := MakeWord(Pack16(UNKNOWN_extraout_AH_03, g_7046), Pack16(UNKNOWN_extraout_AH_03, g_7086)); { 4300:02B5 }
  (P_Word((Integer(g_49D2) + $1CC)))^ := 1; { routine anchor; statement location unresolved } { 4300:01B6 }
  if (g_49F8 = 0) then { routine anchor; statement location unresolved } { 4300:01B6 }
    begin { routine anchor; statement location unresolved } { 4300:01B6 }
      local_5 := 1; { 4300:02CD }
      while Sequence(((P_Word(((Integer(g_49D2) + (Integer((P_Byte(@(g_49FF)) + local_5)) * 2)) + $6E00)))^ := 0); (local_5 <> $20)) do { routine anchor; statement location unresolved } { 4300:01B6 }
      begin { routine anchor; statement location unresolved } { 4300:01B6 }
        begin { routine anchor; statement location unresolved } { 4300:01B6 }
        end; { routine anchor; statement location unresolved } { 4300:01B6 }
        local_5 := (local_5 + 1); { 4300:02D4 }
      end; { routine anchor; statement location unresolved } { 4300:01B6 }
      local_5 := 0; { 4300:02F4 }
      while Sequence(((P_Word(((Integer(g_49D6) + ((local_5 + $6E79) * 2)) + $2A00)))^ := 0); (local_5 <> 9)) do { routine anchor; statement location unresolved } { 4300:01B6 }
      begin { routine anchor; statement location unresolved } { 4300:01B6 }
        begin { routine anchor; statement location unresolved } { 4300:01B6 }
        end; { routine anchor; statement location unresolved } { 4300:01B6 }
        local_5 := (local_5 + 1); { 4300:02F9 }
      end; { routine anchor; statement location unresolved } { 4300:01B6 }
    end; { routine anchor; statement location unresolved } { 4300:01B6 }
  else { routine anchor; statement location unresolved } { 4300:01B6 }
    begin { routine anchor; statement location unresolved } { 4300:01B6 }
      g_49F8 := 0; { 4300:0319 }
    end; { routine anchor; statement location unresolved } { 4300:01B6 }
  Exit; { 4300:0321 }
end; { routine anchor; statement location unresolved } { 4300:01B6 }
```

### ov07:0341 LoadEclBlock (conf H)

Params (stack slots): param_1: Byte [BP+$06].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; local_113: array[0..4] of Byte [BP-$111]; local_10e: array[0..233] of Byte [BP-$10C]; local_24: array[0..21] of Byte [BP-$22]; local_e: Word [BP-$C]; uStack_c: Word [BP-$A]; local_a: Word [BP-$8]; local_8: array[0..5] of Byte [BP-$6].  
Callers: none recorded.  
Callees: FUN_0709_0626, FUN_0802_0716, System.@StrAppend, System.@StrCopy, System.@StrLong, System.FillChar, System.FreeMem, System.Move, ov25_06FB.

```pascal
procedure LoadEclBlock(param_1: Byte); { 4300:0341 }
begin { routine anchor; statement location unresolved } { 4300:0341 }
  FillChar(MemRef(Integer(g_49DE), Integer((LongWord(g_49DE) shr $10))), $1E00, $1E00); { 4300:0355 }
  g_557C := 0; { 4300:035A }
  repeat { routine anchor; statement location unresolved } { 4300:0341 }
    begin { routine anchor; statement location unresolved } { 4300:0341 }
      ov25_06FB(); { 4300:035F }
      iVar1 := (Word(UNKNOWN_extraout_AH) shl 8); { routine anchor; statement location unresolved } { 4300:0341 }
      uVar2 := Pack16(UNKNOWN_extraout_AH, $18); { routine anchor; statement location unresolved } { 4300:0341 }
      uVar3 := Pack16(UNKNOWN_extraout_AH, $F); { routine anchor; statement location unresolved } { 4300:0341 }
      puVar4 := local_24; { routine anchor; statement location unresolved } { 4300:0341 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 4300:0341 }
      PString(local_24, SS) := 'Loading...Please Wait'; { 4300:0377 }
      FUN_0709_0626(puVar4, uVar5, uVar3, uVar2, iVar1); { 4300:037C }
      Str(LongInt(FarBits(0, g_5376)):0, PString(local_8, SS), capacity := 1); { 4300:0396 }
      puVar4 := local_10e; { routine anchor; statement location unresolved } { 4300:0341 }
      uVar2 := SS; { routine anchor; statement location unresolved } { 4300:0341 }
      PString(BP+65268, SS) := 'ECL'; { 4300:03A6 }
      PString(BP+65268, SS) := Copy(PString(BP+65268, SS) + PString(local_8, SS), 1, 255); { 4300:03B0 }
      puVar6 := local_113; { routine anchor; statement location unresolved } { 4300:0341 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 4300:0341 }
      PString(BP+65263, SS) := '.dax'; { 4300:03C0 }
      FUN_0802_0716(@(local_e), SS, @(local_a), SS, Pack16(UNKNOWN_extraout_AH_00, param_1), puVar6, uVar5, puVar4, uVar2); { 4300:03D3 }
    end; { routine anchor; statement location unresolved } { 4300:0341 }
  until not ((local_a < 2)); { routine anchor; statement location unresolved } { 4300:0341 }
  Move(MemRef((Integer(_local_e) + 2), Integer((LongWord(_local_e) shr $10))), MemRef(Integer(g_49DE), Integer((LongWord(g_49DE) shr $10))), (local_a - 2)); { 4300:03F3 }
  FreeMem(FarPtr(uStack_c, local_e), local_a); { 4300:0401 }
  ov25_06FB(); { 4300:0406 }
  Exit; { 4300:040E }
end; { routine anchor; statement location unresolved } { 4300:0341 }
```

### ov07:0411 ecl_LoadMonsterRec (conf H)

Params (stack slots): param_1: P_Word [BP+$06]; param_2: P_Word [BP+$0A]; param_3: P_LongWord [BP+$0E]; param_4: Byte [BP+$12].  
Locals: puVar1: P_LongWord [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: LongWord [compiler temporary; no proven BP slot].  
Callers: none recorded.  
Callees: System.GetMem, ov17_0EC4.

```pascal
procedure ecl_LoadMonsterRec(param_1: P_Word; param_2: P_Word; param_3: P_LongWord; param_4: Byte); { 4300:0411 }
begin { routine anchor; statement location unresolved } { 4300:0411 }
  uVar3 := Word((LongWord(param_3) shr $10)); { routine anchor; statement location unresolved } { 4300:0411 }
  puVar1 := P_LongWord(param_3); { routine anchor; statement location unresolved } { 4300:0411 }
  (P_Word(param_3))^ := 0; { routine anchor; statement location unresolved } { 4300:0411 }
  (P_Word((Integer(puVar1) + 2)))^ := 0; { routine anchor; statement location unresolved } { 4300:0411 }
  uVar5 := Allocate($11D); { 4300:0427 }
  (P_Integer(param_3))^ := Integer(uVar5); { routine anchor; statement location unresolved } { 4300:0411 }
  (P_Word((Integer(puVar1) + 2)))^ := Integer((LongWord(uVar5) shr $10)); { routine anchor; statement location unresolved } { 4300:0411 }
  ov17_0EC4((P_Word(param_3))^, (P_Word((Integer(puVar1) + 2)))^, param_4); { 4300:0444 }
  uVar4 := Word((LongWord((param_3)^) shr $10)); { routine anchor; statement location unresolved } { 4300:0411 }
  iVar2 := Integer((param_3)^); { routine anchor; statement location unresolved } { 4300:0411 }
  uVar3 := (P_Word((iVar2 + $CA)))^; { routine anchor; statement location unresolved } { 4300:0411 }
  (param_2)^ := (P_Word((iVar2 + 200)))^; { routine anchor; statement location unresolved } { 4300:0411 }
  P_Word(param_2)[1] := uVar3; { routine anchor; statement location unresolved } { 4300:0411 }
  uVar4 := Word((LongWord((param_3)^) shr $10)); { routine anchor; statement location unresolved } { 4300:0411 }
  iVar2 := Integer((param_3)^); { routine anchor; statement location unresolved } { 4300:0411 }
  uVar3 := (P_Word((iVar2 + $81)))^; { routine anchor; statement location unresolved } { 4300:0411 }
  (param_1)^ := (P_Word((iVar2 + $7F)))^; { routine anchor; statement location unresolved } { 4300:0411 }
  P_Word(param_1)[1] := uVar3; { routine anchor; statement location unresolved } { 4300:0411 }
  Exit; { 4300:047F }
end; { routine anchor; statement location unresolved } { 4300:0411 }
```

### ov07:0482 ApproachDistance (conf H)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: ShortInt [BP+$08]; param_3: ShortInt [BP+$0A].  
Locals: bVar1: Boolean [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; local_5: Byte [BP-$3]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: ov29_047B.

```pascal
function ApproachDistance(param_1: ShortInt; param_2: ShortInt; param_3: ShortInt): Word; { 4300:0482 }
begin { routine anchor; statement location unresolved } { 4300:0482 }
  uVar2 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 4300:0482 }
  local_5 := 0; { 4300:0488 }
  bVar1 := false; { routine anchor; statement location unresolved } { 4300:0482 }
  local_3 := 0; { 4300:0490 }
  if ((P_Integer((Integer(g_49D2) + $1CC)))^ = 0) then { routine anchor; statement location unresolved } { 4300:0482 }
    begin { routine anchor; statement location unresolved } { 4300:0482 }
      local_3 := 2; { 4300:04A0 }
      (P_Word((Integer(g_49D6) + $582)))^ := 2; { routine anchor; statement location unresolved } { 4300:0482 }
    end; { routine anchor; statement location unresolved } { 4300:0482 }
  else { routine anchor; statement location unresolved } { 4300:0482 }
    begin { routine anchor; statement location unresolved } { 4300:0482 }
      while Sequence((uVar2 := Byte((Word(UNKNOWN_in_AX) shr 8))); ((local_5 < 2) and then not (bVar1))) do { routine anchor; statement location unresolved } { 4300:0482 }
        begin { routine anchor; statement location unresolved } { 4300:0482 }
          UNKNOWN_in_AX := ov29_047B(Pack16(uVar2, param_1), Pack16(uVar2, param_2), Pack16(uVar2, param_3)); { 4300:04C9 }
          if (ShortInt(UNKNOWN_in_AX) = 0) then { routine anchor; statement location unresolved } { 4300:0482 }
            begin { routine anchor; statement location unresolved } { 4300:0482 }
              local_5 := (local_5 + 1); { 4300:04D2 }
              UNKNOWN_in_AX := Pack16(ShortInt((Word(UNKNOWN_in_AX) shr 8)), param_1); { routine anchor; statement location unresolved } { 4300:0482 }
              local_3 := local_5; { 4300:04D8 }
              if (param_1 = 0) then { routine anchor; statement location unresolved } { 4300:0482 }
                begin { routine anchor; statement location unresolved } { 4300:0482 }
                  param_2 := (param_2 + -(1)); { routine anchor; statement location unresolved } { 4300:0482 }
                end; { routine anchor; statement location unresolved } { 4300:0482 }
              else { routine anchor; statement location unresolved } { 4300:0482 }
                if (param_1 = 2) then { routine anchor; statement location unresolved } { 4300:0482 }
                  begin { routine anchor; statement location unresolved } { 4300:0482 }
                    param_3 := (param_3 + 1); { routine anchor; statement location unresolved } { 4300:0482 }
                  end; { routine anchor; statement location unresolved } { 4300:0482 }
                else { routine anchor; statement location unresolved } { 4300:0482 }
                  if (param_1 = 4) then { routine anchor; statement location unresolved } { 4300:0482 }
                    begin { routine anchor; statement location unresolved } { 4300:0482 }
                      param_2 := (param_2 + 1); { routine anchor; statement location unresolved } { 4300:0482 }
                    end; { routine anchor; statement location unresolved } { 4300:0482 }
                  else { routine anchor; statement location unresolved } { 4300:0482 }
                    if (param_1 = 6) then { routine anchor; statement location unresolved } { 4300:0482 }
                      begin { routine anchor; statement location unresolved } { 4300:0482 }
                        param_3 := (param_3 + -(1)); { routine anchor; statement location unresolved } { 4300:0482 }
                      end; { routine anchor; statement location unresolved } { 4300:0482 }
            end; { routine anchor; statement location unresolved } { 4300:0482 }
          else { routine anchor; statement location unresolved } { 4300:0482 }
            begin { routine anchor; statement location unresolved } { 4300:0482 }
              bVar1 := true; { routine anchor; statement location unresolved } { 4300:0482 }
            end; { routine anchor; statement location unresolved } { 4300:0482 }
        end; { routine anchor; statement location unresolved } { 4300:0482 }
    end; { routine anchor; statement location unresolved } { 4300:0482 }
  Exit(Pack16(uVar2, local_3)); { 4300:050E }
end; { routine anchor; statement location unresolved } { 4300:0482 }
```

### ov07:0511 ShowEncounterSprite (conf H)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Byte [BP+$08].  
Locals: none.  
Callers: ov07_054E.  
Callees: ov28_05D9, ov28_0697.

```pascal
procedure ShowEncounterSprite(param_1: Byte; param_2: Byte); { 4300:0511 }
begin { routine anchor; statement location unresolved } { 4300:0511 }
  g_84E1 := 0; { 4300:0514 }
  g_49FD := param_2; { 4300:051C }
  g_49FE := param_1; { 4300:0522 }
  ov28_05D9(param_1, param_2); { 4300:052D }
  ov28_0697(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 3), Pack16(UNKNOWN_extraout_AH, 3)); { 4300:053B }
  Exit; { 4300:0541 }
end; { routine anchor; statement location unresolved } { 4300:0511 }
```

### ov07:054E ShowEncounter (conf H)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: Byte [BP+$0C]; param_4: Byte [BP+$0E].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_11: array[0..1] of Byte [BP-$F]; local_f: array[0..3] of Byte [BP-$D]; local_b: ShortInt [BP-$9].  
Callers: none recorded.  
Callees: System.@StrCopy, ShowEncounterSprite, ov26_016D, ov28_0000, ov28_00A2, ov28_0708.

```pascal
procedure ShowEncounter(param_1: P_ShortInt; param_2: ShortInt; param_3: Byte; param_4: Byte); { 4300:054E }
begin { routine anchor; statement location unresolved } { 4300:054E }
  uVar4 := $4300; { routine anchor; statement location unresolved } { 4300:054E }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4300:054E }
  pcVar1 := P_ShortInt(param_1); { routine anchor; statement location unresolved } { 4300:054E }
  if ((pcVar1[1] = 0) and then ((param_1)^ <> 0)) then { routine anchor; statement location unresolved } { 4300:054E }
    begin { routine anchor; statement location unresolved } { 4300:054E }
      uVar4 := $3CA; { routine anchor; statement location unresolved } { 4300:054E }
      ov26_016D(); { 4300:0567 }
    end; { routine anchor; statement location unresolved } { 4300:054E }
  local_b := (param_2 + 1); { 4300:0572 }
  if (pcVar1[1] = 0) then { routine anchor; statement location unresolved } { 4300:054E }
    begin { routine anchor; statement location unresolved } { 4300:054E }
      if ((param_1)^ = 0) then { routine anchor; statement location unresolved } { 4300:054E }
        begin { routine anchor; statement location unresolved } { 4300:054E }
          if (g_6AAC <> 0) then { routine anchor; statement location unresolved } { 4300:054E }
            begin { routine anchor; statement location unresolved } { 4300:054E }
              g_6AAC := 0; { 4300:058F }
              uVar4 := $3CA; { routine anchor; statement location unresolved } { 4300:054E }
              ov26_016D(); { 4300:0594 }
            end; { routine anchor; statement location unresolved } { 4300:054E }
          puVar5 := local_11; { routine anchor; statement location unresolved } { 4300:054E }
          uVar6 := SS; { routine anchor; statement location unresolved } { 4300:054E }
          PString(local_11, SS) := 'SPRIT'; { 4300:05A3 }
          ov28_00A2(P_Byte(@(g_6ABE)), $C7C, Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, param_4), puVar5, uVar6); { 4300:05B4 }
          (param_1)^ := 1; { routine anchor; statement location unresolved } { 4300:054E }
          g_84E3 := 1; { 4300:05C0 }
        end; { routine anchor; statement location unresolved } { 4300:054E }
      if (g_49FA = 1) then { routine anchor; statement location unresolved } { 4300:054E }
        begin { routine anchor; statement location unresolved } { 4300:054E }
          uVar4 := $3D0; { routine anchor; statement location unresolved } { 4300:054E }
          ov28_0708(P_Byte(@(g_6ABE)), $C7C, local_b); { 4300:05D5 }
        end; { routine anchor; statement location unresolved } { 4300:054E }
      else { routine anchor; statement location unresolved } { 4300:054E }
        begin { routine anchor; statement location unresolved } { 4300:054E }
          uVar4 := $3D0; { routine anchor; statement location unresolved } { 4300:054E }
          ov28_0708(P_Byte(@(g_6ABE)), $C7C, 2); { 4300:05E4 }
        end; { routine anchor; statement location unresolved } { 4300:054E }
    end; { routine anchor; statement location unresolved } { 4300:054E }
  iVar2 := Integer(g_49D6); { routine anchor; statement location unresolved } { 4300:054E }
  uVar6 := Word((LongWord(g_49D6) shr $10)); { routine anchor; statement location unresolved } { 4300:054E }
  if ((((pcVar1[1] = 0) or else (Word(g_84EA) <> (P_Word((iVar2 + $5C2)))^)) and then (param_2 = 0)) and then ((g_49FA = 1) and then ((g_84E9 = 0) or else (g_49F6 <> 0)))) then { routine anchor; statement location unresolved } { 4300:054E }
    begin { routine anchor; statement location unresolved } { 4300:054E }
      g_84EA := (P_Byte((iVar2 + $5C2)))^; { 4300:0633 }
      g_84E0 := 1; { 4300:0636 }
      if ((P_Integer((iVar2 + $5C2)))^ = $FF) then { routine anchor; statement location unresolved } { 4300:054E }
        begin { routine anchor; statement location unresolved } { 4300:054E }
          puVar5 := local_f; { routine anchor; statement location unresolved } { 4300:054E }
          PString(local_f, SS) := 'PIC'; { 4300:0652 }
          ov28_00A2(P_Byte(@(g_6ABE)), $C7C, (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, param_3), puVar5, SS); { 4300:0663 }
          pcVar1[1] := 1; { routine anchor; statement location unresolved } { 4300:054E }
          ov28_0000(g_6AC4, g_6AC6, 1, 3, 3); { 4300:0683 }
        end; { routine anchor; statement location unresolved } { 4300:054E }
      else { routine anchor; statement location unresolved } { 4300:054E }
        begin { routine anchor; statement location unresolved } { 4300:054E }
          ShowEncounterSprite(param_3, (P_Byte((iVar2 + $5C2)))^); { 4300:0699 }
          pcVar1[1] := 1; { routine anchor; statement location unresolved } { 4300:054E }
          g_84E1 := 0; { 4300:06A4 }
        end; { routine anchor; statement location unresolved } { 4300:054E }
    end; { routine anchor; statement location unresolved } { 4300:054E }
  Exit; { 4300:06AC }
end; { routine anchor; statement location unresolved } { 4300:054E }
```

### ov07:06AF MakeWord (conf H)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Byte [BP+$08].  
Locals: none.  
Callers: ecl_ReadOperands,ecl_OperandValue,ecl_InitVM,ecl_Gosub.  
Callees: none recorded.

```pascal
function MakeWord(param_1: Byte; param_2: Byte): Integer; { 4300:06AF }
begin { routine anchor; statement location unresolved } { 4300:06AF }
  Exit(((Word(param_1) * $100) + Word(param_2))); { 4300:06D0 }
end; { routine anchor; statement location unresolved } { 4300:06AF }
```

### ov07:06D3 ecl_SixBitChar (conf H)

Params (stack slots): param_1: Byte [BP+$06].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: ecl_UnpackString.  
Callees: none recorded.

```pascal
function ecl_SixBitChar(param_1: Byte): Word; { 4300:06D3 }
begin { routine anchor; statement location unresolved } { 4300:06D3 }
  if (param_1 < $20) then { routine anchor; statement location unresolved } { 4300:06D3 }
    begin { routine anchor; statement location unresolved } { 4300:06D3 }
      iVar1 := (param_1 + $40); { routine anchor; statement location unresolved } { 4300:06D3 }
      local_3 := Byte(iVar1); { 4300:06E2 }
    end; { routine anchor; statement location unresolved } { 4300:06D3 }
  else { routine anchor; statement location unresolved } { 4300:06D3 }
    begin { routine anchor; statement location unresolved } { 4300:06D3 }
      iVar1 := Pack16(ShortInt((Word(UNKNOWN_in_AX) shr 8)), param_1); { routine anchor; statement location unresolved } { 4300:06D3 }
      local_3 := param_1; { 4300:06EF }
    end; { routine anchor; statement location unresolved } { 4300:06D3 }
  Exit(Pack16(ShortInt((Word(iVar1) shr 8)), local_3)); { 4300:06F8 }
end; { routine anchor; statement location unresolved } { 4300:06D3 }
```

### ov07:06FB ecl_MemRegion (conf M)

Params (stack slots): param_1: Word [BP+$06].  
Locals: local_3: Byte [BP-$1].  
Callers: ecl_GetMemString,ecl_SetMem,ecl_GetMem,ecl_SetMemString.  
Callees: none recorded.

```pascal
function ecl_MemRegion(param_1: Word): Byte; { 4300:06FB }
begin { routine anchor; statement location unresolved } { 4300:06FB }
  local_3 := 4; { 4300:0701 }
  if (($48FF < param_1) and then (param_1 < $4D00)) then { routine anchor; statement location unresolved } { 4300:06FB }
    begin { routine anchor; statement location unresolved } { 4300:06FB }
      local_3 := 0; { 4300:0713 }
    end; { routine anchor; statement location unresolved } { 4300:06FB }
  if (($6AFF < param_1) and then (param_1 < $6F00)) then { routine anchor; statement location unresolved } { 4300:06FB }
    begin { routine anchor; statement location unresolved } { 4300:06FB }
      local_3 := 1; { 4300:0725 }
    end; { routine anchor; statement location unresolved } { 4300:06FB }
  if (($96FF < param_1) and then (param_1 < $9900)) then { routine anchor; statement location unresolved } { 4300:06FB }
    begin { routine anchor; statement location unresolved } { 4300:06FB }
      local_3 := 2; { 4300:0737 }
    end; { routine anchor; statement location unresolved } { 4300:06FB }
  if (($98FF < param_1) and then (param_1 < $B700)) then { routine anchor; statement location unresolved } { 4300:06FB }
    begin { routine anchor; statement location unresolved } { 4300:06FB }
      local_3 := 3; { 4300:0749 }
    end; { routine anchor; statement location unresolved } { 4300:06FB }
  Exit(local_3); { 4300:0753 }
end; { routine anchor; statement location unresolved } { 4300:06FB }
```

### ov07:0756 PartyIndexOf (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; bVar2: Boolean [compiler temporary; no proven BP slot]; local_8: Word [BP-$6]; uStack_6: Word [BP-$4]; local_4: ShortInt [BP-$2].  
Callers: ecl_GetCharField.  
Callees: none recorded.

```pascal
function PartyIndexOf(param_1: Word; param_2: Word): Word; { 4300:0756 }
begin { routine anchor; statement location unresolved } { 4300:0756 }
  local_8 := g_5D96; { 4300:0763 }
  uStack_6 := g_5D98; { 4300:0766 }
  bVar2 := false; { routine anchor; statement location unresolved } { 4300:0756 }
  local_4 := 0; { 4300:076D }
  while (((local_8 or uStack_6) <> 0) and then not (bVar2)) do { routine anchor; statement location unresolved } { 4300:0756 }
    begin { routine anchor; statement location unresolved } { 4300:0756 }
      if ((uStack_6 = param_2) and then (local_8 = param_1)) then { routine anchor; statement location unresolved } { 4300:0756 }
        begin { routine anchor; statement location unresolved } { 4300:0756 }
          bVar2 := true; { routine anchor; statement location unresolved } { 4300:0756 }
        end; { routine anchor; statement location unresolved } { 4300:0756 }
      else { routine anchor; statement location unresolved } { 4300:0756 }
        begin { routine anchor; statement location unresolved } { 4300:0756 }
          local_4 := (local_4 + 1); { 4300:0795 }
          puVar1 := P_Word((local_8 + $104)); { routine anchor; statement location unresolved } { 4300:0756 }
          uStack_6 := (P_Word((local_8 + $106)))^; { 4300:07A8 }
          local_8 := (puVar1)^; { 4300:07A5 }
        end; { routine anchor; statement location unresolved } { 4300:0756 }
    end; { routine anchor; statement location unresolved } { 4300:0756 }
  Exit(Pack16(ShortInt(((local_8 or uStack_6) shr 8)), local_4)); { 4300:07B9 }
end; { routine anchor; statement location unresolved } { 4300:0756 }
```

### ov07:07BC ecl_GetCharField (conf M)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: Integer [BP+$0A].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_4: Word [BP-$2].  
Callers: ecl_GetMem.  
Callees: PartyIndexOf.

```pascal
function ecl_GetCharField(param_1: P_Byte; param_2: Integer): Word; { 4300:07BC }
begin { routine anchor; statement location unresolved } { 4300:07BC }
  (param_1)^ := 1; { routine anchor; statement location unresolved } { 4300:07BC }
  uVar2 := (param_2 + $9500); { routine anchor; statement location unresolved } { 4300:07BC }
  iVar3 := Integer(g_5D92); { routine anchor; statement location unresolved } { 4300:07BC }
  uVar4 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 4300:07BC }
  if (uVar2 = $18) then { routine anchor; statement location unresolved } { 4300:07BC }
    begin { routine anchor; statement location unresolved } { 4300:07BC }
      local_4 := Word((P_Byte((iVar3 + $14)))^); { 4300:07E4 }
    end; { routine anchor; statement location unresolved } { 4300:07BC }
  else { routine anchor; statement location unresolved } { 4300:07BC }
    if (uVar2 = $9B) then { routine anchor; statement location unresolved } { 4300:07BC }
      begin { routine anchor; statement location unresolved } { 4300:07BC }
        local_4 := Word((P_Byte((iVar3 + $6E)))^); { 4300:07F9 }
      end; { routine anchor; statement location unresolved } { 4300:07BC }
    else { routine anchor; statement location unresolved } { 4300:07BC }
      if (uVar2 = $A0) then { routine anchor; statement location unresolved } { 4300:07BC }
        begin { routine anchor; statement location unresolved } { 4300:07BC }
          local_4 := Word((P_ShortInt((iVar3 + $73)))^); { 4300:080D }
        end; { routine anchor; statement location unresolved } { 4300:07BC }
      else { routine anchor; statement location unresolved } { 4300:07BC }
        if ((uVar2 < $A5) or else ($AC < uVar2)) then { routine anchor; statement location unresolved } { 4300:07BC }
          begin { routine anchor; statement location unresolved } { 4300:07BC }
            if (uVar2 = $B8) then { routine anchor; statement location unresolved } { 4300:07BC }
              begin { routine anchor; statement location unresolved } { 4300:07BC }
                local_4 := Word((P_Byte((iVar3 + $84)))^); { 4300:0837 }
              end; { routine anchor; statement location unresolved } { 4300:07BC }
            else { routine anchor; statement location unresolved } { 4300:07BC }
              if (uVar2 = $BB) then { routine anchor; statement location unresolved } { 4300:07BC }
                begin { routine anchor; statement location unresolved } { 4300:07BC }
                  local_4 := (P_Word((iVar3 + $88)))^; { 4300:084D }
                end; { routine anchor; statement location unresolved } { 4300:07BC }
              else { routine anchor; statement location unresolved } { 4300:07BC }
                if (uVar2 = $BD) then { routine anchor; statement location unresolved } { 4300:07BC }
                  begin { routine anchor; statement location unresolved } { 4300:07BC }
                    local_4 := (P_Word((iVar3 + $8A)))^; { 4300:0861 }
                  end; { routine anchor; statement location unresolved } { 4300:07BC }
                else { routine anchor; statement location unresolved } { 4300:07BC }
                  if (uVar2 = $BF) then { routine anchor; statement location unresolved } { 4300:07BC }
                    begin { routine anchor; statement location unresolved } { 4300:07BC }
                      local_4 := (P_Word((iVar3 + $8C)))^; { 4300:0875 }
                    end; { routine anchor; statement location unresolved } { 4300:07BC }
                  else { routine anchor; statement location unresolved } { 4300:07BC }
                    if (uVar2 = $C1) then { routine anchor; statement location unresolved } { 4300:07BC }
                      begin { routine anchor; statement location unresolved } { 4300:07BC }
                        local_4 := (P_Word((iVar3 + $8E)))^; { 4300:0889 }
                      end; { routine anchor; statement location unresolved } { 4300:07BC }
                    else { routine anchor; statement location unresolved } { 4300:07BC }
                      if (uVar2 = $C3) then { routine anchor; statement location unresolved } { 4300:07BC }
                        begin { routine anchor; statement location unresolved } { 4300:07BC }
                          local_4 := (P_Word((iVar3 + $90)))^; { 4300:089D }
                        end; { routine anchor; statement location unresolved } { 4300:07BC }
                      else { routine anchor; statement location unresolved } { 4300:07BC }
                        if (uVar2 = $D8) then { routine anchor; statement location unresolved } { 4300:07BC }
                          begin { routine anchor; statement location unresolved } { 4300:07BC }
                            local_4 := Word((P_ShortInt((iVar3 + $A0)))^); { 4300:08B1 }
                          end; { routine anchor; statement location unresolved } { 4300:07BC }
                        else { routine anchor; statement location unresolved } { 4300:07BC }
                          if (uVar2 = $F7) then { routine anchor; statement location unresolved } { 4300:07BC }
                            begin { routine anchor; statement location unresolved } { 4300:07BC }
                              local_4 := (P_Word((iVar3 + $B8)))^; { 4300:08C6 }
                            end; { routine anchor; statement location unresolved } { 4300:07BC }
                          else { routine anchor; statement location unresolved } { 4300:07BC }
                            if (uVar2 = $F9) then { routine anchor; statement location unresolved } { 4300:07BC }
                              begin { routine anchor; statement location unresolved } { 4300:07BC }
                                local_4 := Word((P_Byte((iVar3 + $BA)))^); { 4300:08DA }
                              end; { routine anchor; statement location unresolved } { 4300:07BC }
                            else { routine anchor; statement location unresolved } { 4300:07BC }
                              if (uVar2 = $100) then { routine anchor; statement location unresolved } { 4300:07BC }
                                begin { routine anchor; statement location unresolved } { 4300:07BC }
                                  if ((P_ShortInt((iVar3 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4300:07BC }
                                    begin { routine anchor; statement location unresolved } { 4300:07BC }
                                      local_4 := $80; { 4300:08F0 }
                                    end; { routine anchor; statement location unresolved } { 4300:07BC }
                                  else { routine anchor; statement location unresolved } { 4300:07BC }
                                    begin { routine anchor; statement location unresolved } { 4300:07BC }
                                      local_4 := 1; { 4300:0907 }
                                    end; { routine anchor; statement location unresolved } { 4300:07BC }
                                end; { routine anchor; statement location unresolved } { 4300:07BC }
                              else { routine anchor; statement location unresolved } { 4300:07BC }
                                if (uVar2 = $10C) then { routine anchor; statement location unresolved } { 4300:07BC }
                                  begin { routine anchor; statement location unresolved } { 4300:07BC }
                                    if (((P_ShortInt((iVar3 + $10E)))^ = 0) and then ((P_ShortInt((iVar3 + $10F)))^ <> 0)) then { routine anchor; statement location unresolved } { 4300:07BC }
                                      begin { routine anchor; statement location unresolved } { 4300:07BC }
                                        local_4 := $80; { 4300:090E }
                                      end; { routine anchor; statement location unresolved } { 4300:07BC }
                                    else { routine anchor; statement location unresolved } { 4300:07BC }
                                      if ((P_ShortInt((iVar3 + $10E)))^ = 1) then { routine anchor; statement location unresolved } { 4300:07BC }
                                        begin { routine anchor; statement location unresolved } { 4300:07BC }
                                          local_4 := $81; { 4300:0933 }
                                        end; { routine anchor; statement location unresolved } { 4300:07BC }
                                      else { routine anchor; statement location unresolved } { 4300:07BC }
                                        begin { routine anchor; statement location unresolved } { 4300:07BC }
                                          local_4 := 0; { 4300:0946 }
                                        end; { routine anchor; statement location unresolved } { 4300:07BC }
                                  end; { routine anchor; statement location unresolved } { 4300:07BC }
                                else { routine anchor; statement location unresolved } { 4300:07BC }
                                  if (uVar2 <> $10D) then { routine anchor; statement location unresolved } { 4300:07BC }
                                    begin { routine anchor; statement location unresolved } { 4300:07BC }
                                      if (uVar2 = $11B) then { routine anchor; statement location unresolved } { 4300:07BC }
                                        begin { routine anchor; statement location unresolved } { 4300:07BC }
                                          local_4 := Word((P_Byte((iVar3 + $11C)))^); { 4300:094F }
                                        end; { routine anchor; statement location unresolved } { 4300:07BC }
                                      else { routine anchor; statement location unresolved } { 4300:07BC }
                                        if (uVar2 = $2B1) then { routine anchor; statement location unresolved } { 4300:07BC }
                                          begin { routine anchor; statement location unresolved } { 4300:07BC }
                                            uVar2 := PartyIndexOf(iVar3, uVar4); { 4300:0981 }
                                            local_4 := (uVar2 and $FF); { 4300:096D }
                                          end; { routine anchor; statement location unresolved } { 4300:07BC }
                                        else { routine anchor; statement location unresolved } { 4300:07BC }
                                          if (uVar2 = $2B4) then { routine anchor; statement location unresolved } { 4300:07BC }
                                            begin { routine anchor; statement location unresolved } { 4300:07BC }
                                              uVar2 := PartyIndexOf(iVar3, uVar4); { 4300:099A }
                                              local_4 := (uVar2 and $FF); { 4300:0986 }
                                            end; { routine anchor; statement location unresolved } { 4300:07BC }
                                          else { routine anchor; statement location unresolved } { 4300:07BC }
                                            if (uVar2 = $2CF) then { routine anchor; statement location unresolved } { 4300:07BC }
                                              begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                bVar1 := (P_Byte((iVar3 + $15)))^; { routine anchor; statement location unresolved } { 4300:07BC }
                                                if (bVar1 = 3) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                  begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                    local_4 := 0; { 4300:099F }
                                                  end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                else { routine anchor; statement location unresolved } { 4300:07BC }
                                                  if (bVar1 = 4) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                    begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                      local_4 := 5; { 4300:09BB }
                                                    end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                  else { routine anchor; statement location unresolved } { 4300:07BC }
                                                    if (bVar1 = 5) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                      begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                        local_4 := 10; { 4300:09C5 }
                                                      end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                    else { routine anchor; statement location unresolved } { 4300:07BC }
                                                      if (bVar1 = 6) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                        begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                          local_4 := $F; { 4300:09D0 }
                                                        end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                      else { routine anchor; statement location unresolved } { 4300:07BC }
                                                        if (bVar1 = 7) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                          begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                            local_4 := $14; { 4300:09DB }
                                                          end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                        else { routine anchor; statement location unresolved } { 4300:07BC }
                                                          if ((bVar1 < 8) or else ($C < bVar1)) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                            begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                              if (bVar1 = $D) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                                begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                                  local_4 := $1E; { 4300:09E6 }
                                                                end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                              else { routine anchor; statement location unresolved } { 4300:07BC }
                                                                if (bVar1 = $E) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                                  begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                                    local_4 := $23; { 4300:09F5 }
                                                                  end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                                else { routine anchor; statement location unresolved } { 4300:07BC }
                                                                  if (bVar1 = $F) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                                    begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                                      local_4 := $28; { 4300:0A00 }
                                                                    end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                                  else { routine anchor; statement location unresolved } { 4300:07BC }
                                                                    if (bVar1 = $10) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                                      begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                                        local_4 := $32; { 4300:0A0B }
                                                                      end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                                    else { routine anchor; statement location unresolved } { 4300:07BC }
                                                                      if (bVar1 = $11) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                                        begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                                          local_4 := $37; { 4300:0A16 }
                                                                        end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                                      else { routine anchor; statement location unresolved } { 4300:07BC }
                                                                        if (($11 < bVar1) and then (bVar1 < $1A)) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                                          begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                                            local_4 := $3C; { 4300:0A21 }
                                                                          end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                            end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                          else { routine anchor; statement location unresolved } { 4300:07BC }
                                                            begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                              local_4 := $19; { 4300:0A2C }
                                                            end; { routine anchor; statement location unresolved } { 4300:07BC }
                                              end; { routine anchor; statement location unresolved } { 4300:07BC }
                                            else { routine anchor; statement location unresolved } { 4300:07BC }
                                              if (uVar2 = $312) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                  local_4 := Word(g_5376); { 4300:0A3B }
                                                end; { routine anchor; statement location unresolved } { 4300:07BC }
                                              else { routine anchor; statement location unresolved } { 4300:07BC }
                                                if (uVar2 = $33E) then { routine anchor; statement location unresolved } { 4300:07BC }
                                                  begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                    local_4 := (P_Word((Integer(g_49D6) + $67C)))^; { 4300:0A4C }
                                                  end; { routine anchor; statement location unresolved } { 4300:07BC }
                                                else { routine anchor; statement location unresolved } { 4300:07BC }
                                                  begin { routine anchor; statement location unresolved } { 4300:07BC }
                                                    (param_1)^ := 0; { routine anchor; statement location unresolved } { 4300:07BC }
                                                  end; { routine anchor; statement location unresolved } { 4300:07BC }
                                    end; { routine anchor; statement location unresolved } { 4300:07BC }
          end; { routine anchor; statement location unresolved } { 4300:07BC }
        else { routine anchor; statement location unresolved } { 4300:07BC }
          begin { routine anchor; statement location unresolved } { 4300:07BC }
            local_4 := Word((P_Byte(((iVar3 + ((param_2 + $945C) and $FF)) + $76)))^); { 4300:0A5F }
          end; { routine anchor; statement location unresolved } { 4300:07BC }
  Exit(local_4); { 4300:0A71 }
end; { routine anchor; statement location unresolved } { 4300:07BC }
```

### ov07:0A74 ecl_SetCharField (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: P_Byte [BP+$08].  
Locals: puVar1: P_Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers: ecl_SetMem.  
Callees: FUN_0802_094a, ov29_0E08.

```pascal
procedure ecl_SetCharField(param_1: Word; param_2: P_Byte); { 4300:0A74 }
begin { routine anchor; statement location unresolved } { 4300:0A74 }
  puVar1 := (param_2 + -($6B00)); { routine anchor; statement location unresolved } { 4300:0A74 }
  if (param_2 = P_Byte(@(g_6B00))) then { routine anchor; statement location unresolved } { 4300:0A74 }
    begin { routine anchor; statement location unresolved } { 4300:0A74 }
      if (param_1 = 0) then { routine anchor; statement location unresolved } { 4300:0A74 }
        begin { routine anchor; statement location unresolved } { 4300:0A74 }
          g_84D3 := 1; { 4300:0A91 }
        end; { routine anchor; statement location unresolved } { 4300:0A74 }
    end; { routine anchor; statement location unresolved } { 4300:0A74 }
  else { routine anchor; statement location unresolved } { 4300:0A74 }
    begin { routine anchor; statement location unresolved } { 4300:0A74 }
      iVar2 := Integer(g_5D92); { routine anchor; statement location unresolved } { 4300:0A74 }
      uVar3 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 4300:0A74 }
      if ((puVar1 < P_Byte($20)) or else (P_Byte($70) < puVar1)) then { routine anchor; statement location unresolved } { 4300:0A74 }
        begin { routine anchor; statement location unresolved } { 4300:0A74 }
          if (puVar1 = P_Byte($B8)) then { routine anchor; statement location unresolved } { 4300:0A74 }
            begin { routine anchor; statement location unresolved } { 4300:0A74 }
              if ($B2 < param_1) then { routine anchor; statement location unresolved } { 4300:0A74 }
                begin { routine anchor; statement location unresolved } { 4300:0A74 }
                  param_1 := (param_1 - $32); { routine anchor; statement location unresolved } { 4300:0A74 }
                end; { routine anchor; statement location unresolved } { 4300:0A74 }
              (P_Byte((iVar2 + $84)))^ := Byte(param_1); { routine anchor; statement location unresolved } { 4300:0A74 }
            end; { routine anchor; statement location unresolved } { 4300:0A74 }
          else { routine anchor; statement location unresolved } { 4300:0A74 }
            if (puVar1 = P_Byte($BB)) then { routine anchor; statement location unresolved } { 4300:0A74 }
              begin { routine anchor; statement location unresolved } { 4300:0A74 }
                (P_Word((iVar2 + $88)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0A74 }
              end; { routine anchor; statement location unresolved } { 4300:0A74 }
            else { routine anchor; statement location unresolved } { 4300:0A74 }
              if (puVar1 = P_Byte($BD)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                begin { routine anchor; statement location unresolved } { 4300:0A74 }
                  (P_Word((iVar2 + $8A)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0A74 }
                end; { routine anchor; statement location unresolved } { 4300:0A74 }
              else { routine anchor; statement location unresolved } { 4300:0A74 }
                if (puVar1 = P_Byte($BF)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                  begin { routine anchor; statement location unresolved } { 4300:0A74 }
                    (P_Word((iVar2 + $8C)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0A74 }
                  end; { routine anchor; statement location unresolved } { 4300:0A74 }
                else { routine anchor; statement location unresolved } { 4300:0A74 }
                  if (puVar1 = P_Byte($C1)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                    begin { routine anchor; statement location unresolved } { 4300:0A74 }
                      (P_Word((iVar2 + $8E)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0A74 }
                    end; { routine anchor; statement location unresolved } { 4300:0A74 }
                  else { routine anchor; statement location unresolved } { 4300:0A74 }
                    if (puVar1 = P_Byte($C3)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                      begin { routine anchor; statement location unresolved } { 4300:0A74 }
                        (P_Word((iVar2 + $90)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0A74 }
                      end; { routine anchor; statement location unresolved } { 4300:0A74 }
                    else { routine anchor; statement location unresolved } { 4300:0A74 }
                      if (puVar1 = P_Byte($F7)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                        begin { routine anchor; statement location unresolved } { 4300:0A74 }
                          (P_Word((iVar2 + $B8)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0A74 }
                        end; { routine anchor; statement location unresolved } { 4300:0A74 }
                      else { routine anchor; statement location unresolved } { 4300:0A74 }
                        if (puVar1 = P_Byte($F9)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                          begin { routine anchor; statement location unresolved } { 4300:0A74 }
                            (P_Byte((iVar2 + $BA)))^ := Byte(param_1); { routine anchor; statement location unresolved } { 4300:0A74 }
                          end; { routine anchor; statement location unresolved } { 4300:0A74 }
                        else { routine anchor; statement location unresolved } { 4300:0A74 }
                          if (puVar1 = P_Byte($100)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                            begin { routine anchor; statement location unresolved } { 4300:0A74 }
                              if (($7F < param_1) and then Sequence(((P_Byte((iVar2 + $10D)))^ := 0); (param_1 = $87))) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                  (P_Byte((Integer(g_5D92) + $10C)))^ := 7; { routine anchor; statement location unresolved } { 4300:0A74 }
                                end; { routine anchor; statement location unresolved } { 4300:0A74 }
                              if (param_1 = 0) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                  g_84D2 := 1; { 4300:0B99 }
                                end; { routine anchor; statement location unresolved } { 4300:0A74 }
                            end; { routine anchor; statement location unresolved } { 4300:0A74 }
                          else { routine anchor; statement location unresolved } { 4300:0A74 }
                            if (puVar1 = P_Byte($10C)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                              begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                if (param_1 = 0) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                  begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                    (P_Byte((iVar2 + $10E)))^ := 0; { routine anchor; statement location unresolved } { 4300:0A74 }
                                    (P_Byte((Integer(g_5D92) + $10F)))^ := 0; { routine anchor; statement location unresolved } { 4300:0A74 }
                                  end; { routine anchor; statement location unresolved } { 4300:0A74 }
                                else { routine anchor; statement location unresolved } { 4300:0A74 }
                                  if (param_1 = $80) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                    begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                      (P_Byte((iVar2 + $10E)))^ := 0; { routine anchor; statement location unresolved } { 4300:0A74 }
                                      (P_Byte((Integer(g_5D92) + $10F)))^ := 1; { routine anchor; statement location unresolved } { 4300:0A74 }
                                    end; { routine anchor; statement location unresolved } { 4300:0A74 }
                                  else { routine anchor; statement location unresolved } { 4300:0A74 }
                                    if (param_1 = $81) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                      begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                        (P_Byte((iVar2 + $10E)))^ := 1; { routine anchor; statement location unresolved } { 4300:0A74 }
                                        (P_Byte((Integer(g_5D92) + $10F)))^ := 1; { routine anchor; statement location unresolved } { 4300:0A74 }
                                      end; { routine anchor; statement location unresolved } { 4300:0A74 }
                              end; { routine anchor; statement location unresolved } { 4300:0A74 }
                            else { routine anchor; statement location unresolved } { 4300:0A74 }
                              if (puVar1 = P_Byte($312)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                  FUN_0802_094a(Pack16(3, Byte(param_1))); { 4300:0C03 }
                                end; { routine anchor; statement location unresolved } { 4300:0A74 }
                              else { routine anchor; statement location unresolved } { 4300:0A74 }
                                if (puVar1 = P_Byte($322)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                  begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                    if ($80 < param_1) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                      begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                        ov29_0E08(1, (param_1 and $7F)); { 4300:0C26 }
                                      end; { routine anchor; statement location unresolved } { 4300:0A74 }
                                  end; { routine anchor; statement location unresolved } { 4300:0A74 }
                                else { routine anchor; statement location unresolved } { 4300:0A74 }
                                  if (puVar1 = P_Byte($324)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                    begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                      if ($80 < param_1) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                        begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                          ov29_0E08(2, (param_1 and $7F)); { 4300:0C49 }
                                        end; { routine anchor; statement location unresolved } { 4300:0A74 }
                                    end; { routine anchor; statement location unresolved } { 4300:0A74 }
                                  else { routine anchor; statement location unresolved } { 4300:0A74 }
                                    if ((puVar1 = P_Byte($326)) and then ($80 < param_1)) then { routine anchor; statement location unresolved } { 4300:0A74 }
                                      begin { routine anchor; statement location unresolved } { 4300:0A74 }
                                        ov29_0E08(3, (param_1 and $7F)); { 4300:0C6C }
                                      end; { routine anchor; statement location unresolved } { 4300:0A74 }
        end; { routine anchor; statement location unresolved } { 4300:0A74 }
      else { routine anchor; statement location unresolved } { 4300:0A74 }
        begin { routine anchor; statement location unresolved } { 4300:0A74 }
          (P_Byte(((iVar2 + (Word((param_2 + -($6B1F))) and $FF)) + $17)))^ := Byte(param_1); { routine anchor; statement location unresolved } { 4300:0A74 }
        end; { routine anchor; statement location unresolved } { 4300:0A74 }
    end; { routine anchor; statement location unresolved } { 4300:0A74 }
  Exit; { 4300:0C74 }
end; { routine anchor; statement location unresolved } { 4300:0A74 }
```

### ov07:0C77 ecl_SetMem (conf H)

Params (stack slots): param_1: Integer [BP+$06]; param_2: P_Byte [BP+$08].  
Locals: bVar1: Boolean [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot].  
Callers: none recorded.  
Callees: ecl_MemRegion, ecl_SetCharField.

```pascal
procedure ecl_SetMem(param_1: Integer; param_2: P_Byte); { 4300:0C77 }
begin { routine anchor; statement location unresolved } { 4300:0C77 }
  cVar2 := ecl_MemRegion(param_2); { 4300:0C81 }
  if (cVar2 = 0) then { routine anchor; statement location unresolved } { 4300:0C77 }
    begin { routine anchor; statement location unresolved } { 4300:0C77 }
      (P_Integer(((Integer(g_49D2) + (Integer(param_2) * 2)) + $6E00)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0C77 }
      if ((param_2 = P_Byte(@(g_49FD))) or else (param_2 = P_Byte(@(g_49FE)))) then { routine anchor; statement location unresolved } { 4300:0C77 }
        begin { routine anchor; statement location unresolved } { 4300:0C77 }
          g_84E8 := 1; { 4300:0CAF }
        end; { routine anchor; statement location unresolved } { 4300:0C77 }
    end; { routine anchor; statement location unresolved } { 4300:0C77 }
  else { routine anchor; statement location unresolved } { 4300:0C77 }
    if (cVar2 = 1) then { routine anchor; statement location unresolved } { 4300:0C77 }
      begin { routine anchor; statement location unresolved } { 4300:0C77 }
        (P_Integer(((Integer(g_49D6) + (Integer(param_2) * 2)) + $2A00)))^ := param_1; { routine anchor; statement location unresolved } { 4300:0C77 }
        ecl_SetCharField(param_1, param_2); { 4300:0CD5 }
      end; { routine anchor; statement location unresolved } { 4300:0C77 }
    else { routine anchor; statement location unresolved } { 4300:0C77 }
      if (cVar2 = 2) then { routine anchor; statement location unresolved } { 4300:0C77 }
        begin { routine anchor; statement location unresolved } { 4300:0C77 }
          (P_Integer(((Integer(g_49DA) + (Integer(param_2) * 2)) + -($2E00))))^ := param_1; { routine anchor; statement location unresolved } { 4300:0C77 }
        end; { routine anchor; statement location unresolved } { 4300:0C77 }
      else { routine anchor; statement location unresolved } { 4300:0C77 }
        if (cVar2 = 3) then { routine anchor; statement location unresolved } { 4300:0C77 }
          begin { routine anchor; statement location unresolved } { 4300:0C77 }
            param_2[(Integer(g_49DE) + $6700)] := Byte(param_1); { routine anchor; statement location unresolved } { 4300:0C77 }
          end; { routine anchor; statement location unresolved } { 4300:0C77 }
        else { routine anchor; statement location unresolved } { 4300:0C77 }
          if (cVar2 = 4) then { routine anchor; statement location unresolved } { 4300:0C77 }
            begin { routine anchor; statement location unresolved } { 4300:0C77 }
              if (param_2 < P_Byte($BF68)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                begin { routine anchor; statement location unresolved } { 4300:0C77 }
                  if (((param_2 <> P_Byte($FB)) and then (param_2 <> P_Byte($FC))) and then (param_2 <> P_Byte($B1))) then { routine anchor; statement location unresolved } { 4300:0C77 }
                    begin { routine anchor; statement location unresolved } { 4300:0C77 }
                      if (param_2 = P_Byte($3DE)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                        begin { routine anchor; statement location unresolved } { 4300:0C77 }
                          g_84CC := param_1; { 4300:0D3B }
                        end; { routine anchor; statement location unresolved } { 4300:0C77 }
                      else { routine anchor; statement location unresolved } { 4300:0C77 }
                        if (param_2 = P_Byte($B8)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                          begin { routine anchor; statement location unresolved } { 4300:0C77 }
                            g_84CE := param_1; { 4300:0D48 }
                          end; { routine anchor; statement location unresolved } { 4300:0C77 }
                        else { routine anchor; statement location unresolved } { 4300:0C77 }
                          if (param_2 = P_Byte($B9)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                            begin { routine anchor; statement location unresolved } { 4300:0C77 }
                              g_84D0 := param_1; { 4300:0D55 }
                            end; { routine anchor; statement location unresolved } { 4300:0C77 }
                    end; { routine anchor; statement location unresolved } { 4300:0C77 }
                end; { routine anchor; statement location unresolved } { 4300:0C77 }
              else { routine anchor; statement location unresolved } { 4300:0C77 }
                if (param_2 = P_Byte($C04B)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                  begin { routine anchor; statement location unresolved } { 4300:0C77 }
                    g_84E6 := 1; { 4300:0D6C }
                    g_6AAD := Byte(param_1); { 4300:0D74 }
                  end; { routine anchor; statement location unresolved } { 4300:0C77 }
                else { routine anchor; statement location unresolved } { 4300:0C77 }
                  if (param_2 = P_Byte($C04C)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                    begin { routine anchor; statement location unresolved } { 4300:0C77 }
                      g_6AAE := Byte(param_1); { 4300:0D82 }
                      g_84E6 := 1; { 4300:0D85 }
                    end; { routine anchor; statement location unresolved } { 4300:0C77 }
                  else { routine anchor; statement location unresolved } { 4300:0C77 }
                    if (param_2 = P_Byte($C04D)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                      begin { routine anchor; statement location unresolved } { 4300:0C77 }
                        repeat { routine anchor; statement location unresolved } { 4300:0C77 }
                          begin { routine anchor; statement location unresolved } { 4300:0C77 }
                            bVar1 := true; { routine anchor; statement location unresolved } { 4300:0C77 }
                            if (param_1 = 0) then { routine anchor; statement location unresolved } { 4300:0C77 }
                              begin { routine anchor; statement location unresolved } { 4300:0C77 }
                                g_6AAF := 0; { 4300:0D9D }
                              end; { routine anchor; statement location unresolved } { 4300:0C77 }
                            else { routine anchor; statement location unresolved } { 4300:0C77 }
                              if (param_1 = 1) then { routine anchor; statement location unresolved } { 4300:0C77 }
                                begin { routine anchor; statement location unresolved } { 4300:0C77 }
                                  g_6AAF := 2; { 4300:0DA9 }
                                end; { routine anchor; statement location unresolved } { 4300:0C77 }
                              else { routine anchor; statement location unresolved } { 4300:0C77 }
                                if (param_1 = 2) then { routine anchor; statement location unresolved } { 4300:0C77 }
                                  begin { routine anchor; statement location unresolved } { 4300:0C77 }
                                    g_6AAF := 4; { 4300:0DB5 }
                                  end; { routine anchor; statement location unresolved } { 4300:0C77 }
                                else { routine anchor; statement location unresolved } { 4300:0C77 }
                                  if (param_1 = 3) then { routine anchor; statement location unresolved } { 4300:0C77 }
                                    begin { routine anchor; statement location unresolved } { 4300:0C77 }
                                      g_6AAF := 6; { 4300:0DC1 }
                                    end; { routine anchor; statement location unresolved } { 4300:0C77 }
                                  else { routine anchor; statement location unresolved } { 4300:0C77 }
                                    begin { routine anchor; statement location unresolved } { 4300:0C77 }
                                      bVar1 := false; { routine anchor; statement location unresolved } { 4300:0C77 }
                                      param_1 := (param_1 + -(4)); { routine anchor; statement location unresolved } { 4300:0C77 }
                                    end; { routine anchor; statement location unresolved } { 4300:0C77 }
                          end; { routine anchor; statement location unresolved } { 4300:0C77 }
                        until not (not (bVar1)); { routine anchor; statement location unresolved } { 4300:0C77 }
                        g_84E6 := 1; { 4300:0DD6 }
                      end; { routine anchor; statement location unresolved } { 4300:0C77 }
                    else { routine anchor; statement location unresolved } { 4300:0C77 }
                      if (param_2 = P_Byte($C059)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                        begin { routine anchor; statement location unresolved } { 4300:0C77 }
                          g_6F68 := Byte(param_1); { 4300:0DE5 }
                          g_84E5 := 1; { 4300:0DE8 }
                        end; { routine anchor; statement location unresolved } { 4300:0C77 }
                      else { routine anchor; statement location unresolved } { 4300:0C77 }
                        if (param_2 = P_Byte($C05F)) then { routine anchor; statement location unresolved } { 4300:0C77 }
                          begin { routine anchor; statement location unresolved } { 4300:0C77 }
                            g_6F69 := Byte(param_1); { 4300:0DF7 }
                            g_84E5 := 1; { 4300:0DFA }
                          end; { routine anchor; statement location unresolved } { 4300:0C77 }
            end; { routine anchor; statement location unresolved } { 4300:0C77 }
  Exit; { 4300:0E09 }
end; { routine anchor; statement location unresolved } { 4300:0C77 }
```

### ov07:0E0C ecl_GetMem (conf H)

Params (stack slots): param_1: Word [BP+$06].  
Locals: local_6: ShortInt [BP-$4]; local_5: ShortInt [BP-$3]; local_4: Word [BP-$2].  
Callers: ecl_OperandValue.  
Callees: ecl_MemRegion, ecl_GetCharField.

```pascal
function ecl_GetMem(param_1: Word): Word; { 4300:0E0C }
begin { routine anchor; statement location unresolved } { 4300:0E0C }
  local_5 := ecl_MemRegion(param_1); { 4300:0E16 }
  local_6 := 0; { 4300:0E1C }
  if (local_5 = 0) then { routine anchor; statement location unresolved } { 4300:0E0C }
    begin { routine anchor; statement location unresolved } { 4300:0E0C }
      local_4 := (P_Word(((Integer(g_49D2) + (param_1 * 2)) + $6E00)))^; { 4300:0E37 }
    end; { routine anchor; statement location unresolved } { 4300:0E0C }
  else { routine anchor; statement location unresolved } { 4300:0E0C }
    if (local_5 = 1) then { routine anchor; statement location unresolved } { 4300:0E0C }
      begin { routine anchor; statement location unresolved } { 4300:0E0C }
        local_4 := ecl_GetCharField(@(local_6), SS, param_1); { 4300:0E4A }
        if (local_6 = 0) then { routine anchor; statement location unresolved } { 4300:0E0C }
          begin { routine anchor; statement location unresolved } { 4300:0E0C }
            local_4 := (P_Word(((Integer(g_49D6) + (param_1 * 2)) + $2A00)))^; { 4300:0E66 }
          end; { routine anchor; statement location unresolved } { 4300:0E0C }
      end; { routine anchor; statement location unresolved } { 4300:0E0C }
    else { routine anchor; statement location unresolved } { 4300:0E0C }
      if (local_5 = 2) then { routine anchor; statement location unresolved } { 4300:0E0C }
        begin { routine anchor; statement location unresolved } { 4300:0E0C }
          local_4 := (P_Word(((Integer(g_49DA) + (param_1 * 2)) + -($2E00))))^; { 4300:0E80 }
        end; { routine anchor; statement location unresolved } { 4300:0E0C }
      else { routine anchor; statement location unresolved } { 4300:0E0C }
        if (local_5 = 3) then { routine anchor; statement location unresolved } { 4300:0E0C }
          begin { routine anchor; statement location unresolved } { 4300:0E0C }
            local_4 := Word((P_Byte(((Integer(g_49DE) + param_1) + $6700)))^); { 4300:0E9A }
          end; { routine anchor; statement location unresolved } { 4300:0E0C }
        else { routine anchor; statement location unresolved } { 4300:0E0C }
          if (local_5 = 4) then { routine anchor; statement location unresolved } { 4300:0E0C }
            begin { routine anchor; statement location unresolved } { 4300:0E0C }
              if (param_1 < $C04B) then { routine anchor; statement location unresolved } { 4300:0E0C }
                begin { routine anchor; statement location unresolved } { 4300:0E0C }
                  if (param_1 = $B1) then { routine anchor; statement location unresolved } { 4300:0E0C }
                    begin { routine anchor; statement location unresolved } { 4300:0E0C }
                      local_4 := g_6F6E; { 4300:0EB9 }
                    end; { routine anchor; statement location unresolved } { 4300:0E0C }
                  else { routine anchor; statement location unresolved } { 4300:0E0C }
                    if (param_1 = $FB) then { routine anchor; statement location unresolved } { 4300:0E0C }
                      begin { routine anchor; statement location unresolved } { 4300:0E0C }
                        local_4 := g_6F6A; { 4300:0EC6 }
                      end; { routine anchor; statement location unresolved } { 4300:0E0C }
                    else { routine anchor; statement location unresolved } { 4300:0E0C }
                      if (param_1 = $FC) then { routine anchor; statement location unresolved } { 4300:0E0C }
                        begin { routine anchor; statement location unresolved } { 4300:0E0C }
                          local_4 := g_6F6C; { 4300:0ED3 }
                        end; { routine anchor; statement location unresolved } { 4300:0E0C }
                      else { routine anchor; statement location unresolved } { 4300:0E0C }
                        if (param_1 = $33D) then { routine anchor; statement location unresolved } { 4300:0E0C }
                          begin { routine anchor; statement location unresolved } { 4300:0E0C }
                            local_4 := Word(g_6AAF); { 4300:0EE2 }
                          end; { routine anchor; statement location unresolved } { 4300:0E0C }
                end; { routine anchor; statement location unresolved } { 4300:0E0C }
              else { routine anchor; statement location unresolved } { 4300:0E0C }
                if (param_1 = $C04B) then { routine anchor; statement location unresolved } { 4300:0E0C }
                  begin { routine anchor; statement location unresolved } { 4300:0E0C }
                    local_4 := Word(g_6AAD); { 4300:0F03 }
                  end; { routine anchor; statement location unresolved } { 4300:0E0C }
                else { routine anchor; statement location unresolved } { 4300:0E0C }
                  if (param_1 = $C04C) then { routine anchor; statement location unresolved } { 4300:0E0C }
                    begin { routine anchor; statement location unresolved } { 4300:0E0C }
                      local_4 := Word(g_6AAE); { 4300:0F11 }
                    end; { routine anchor; statement location unresolved } { 4300:0E0C }
                  else { routine anchor; statement location unresolved } { 4300:0E0C }
                    if (param_1 = $C04D) then { routine anchor; statement location unresolved } { 4300:0E0C }
                      begin { routine anchor; statement location unresolved } { 4300:0E0C }
                        local_4 := Word((g_6AAF shr 1)); { 4300:0F22 }
                      end; { routine anchor; statement location unresolved } { 4300:0E0C }
                    else { routine anchor; statement location unresolved } { 4300:0E0C }
                      if (param_1 = $C04E) then { routine anchor; statement location unresolved } { 4300:0E0C }
                        begin { routine anchor; statement location unresolved } { 4300:0E0C }
                          local_4 := Word(g_6AB0); { 4300:0F31 }
                        end; { routine anchor; statement location unresolved } { 4300:0E0C }
                      else { routine anchor; statement location unresolved } { 4300:0E0C }
                        if (param_1 = $C04F) then { routine anchor; statement location unresolved } { 4300:0E0C }
                          begin { routine anchor; statement location unresolved } { 4300:0E0C }
                            local_4 := Word(g_6AB1); { 4300:0F40 }
                          end; { routine anchor; statement location unresolved } { 4300:0E0C }
            end; { routine anchor; statement location unresolved } { 4300:0E0C }
  Exit(local_4); { 4300:0F50 }
end; { routine anchor; statement location unresolved } { 4300:0E0C }
```

### ov07:0F53 ecl_SetMemString (conf M)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: P_Byte [BP+$0A].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; local_105: Byte [BP-$103]; local_102: Byte [BP-$100]; abStack_101: array[0..254] of Byte [BP-$FF].  
Callers: none recorded.  
Callees: ecl_MemRegion, System.@StrAssign.

```pascal
procedure ecl_SetMemString(param_1: LongWord; param_2: P_Byte); { 4300:0F53 }
begin { routine anchor; statement location unresolved } { 4300:0F53 }
  PString(@(local_102), SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $FF); { 4300:0F69 }
  cVar1 := ecl_MemRegion(param_2); { 4300:0F72 }
  if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4300:0F53 }
    begin { routine anchor; statement location unresolved } { 4300:0F53 }
      local_105 := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
      while Sequence(((P_Word(((Integer(g_49D2) + (Integer((param_2 + local_105)) * 2)) + $6E00)))^ := Word(abStack_101[local_105])); (local_105 <> Byte((local_102 - 1)))) do { routine anchor; statement location unresolved } { 4300:0F53 }
      begin { routine anchor; statement location unresolved } { 4300:0F53 }
        begin { routine anchor; statement location unresolved } { 4300:0F53 }
        end; { routine anchor; statement location unresolved } { 4300:0F53 }
        local_105 := (local_105 + 1); { routine anchor; statement location unresolved } { 4300:0F53 }
      end; { routine anchor; statement location unresolved } { 4300:0F53 }
      (P_Word(((Integer(g_49D2) + (Integer((param_2 + local_102)) * 2)) + $6E00)))^ := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
    end; { routine anchor; statement location unresolved } { 4300:0F53 }
  else { routine anchor; statement location unresolved } { 4300:0F53 }
    if (cVar1 = 1) then { routine anchor; statement location unresolved } { 4300:0F53 }
      begin { routine anchor; statement location unresolved } { 4300:0F53 }
        if (param_2 = P_Byte(@(g_6B00))) then { routine anchor; statement location unresolved } { 4300:0F53 }
          begin { routine anchor; statement location unresolved } { 4300:0F53 }
            PString(Integer(g_5D92), Integer((LongWord(g_5D92) shr $10))) := Copy(PString(@(local_102), SS), 1, $F); { 4300:1010 }
          end; { routine anchor; statement location unresolved } { 4300:0F53 }
        else { routine anchor; statement location unresolved } { 4300:0F53 }
          begin { routine anchor; statement location unresolved } { 4300:0F53 }
            local_105 := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
            while Sequence(((P_Word(((Integer(g_49D6) + (Integer((param_2 + local_105)) * 2)) + $2A00)))^ := Word(abStack_101[local_105])); (local_105 <> Byte((local_102 - 1)))) do { routine anchor; statement location unresolved } { 4300:0F53 }
            begin { routine anchor; statement location unresolved } { 4300:0F53 }
              begin { routine anchor; statement location unresolved } { 4300:0F53 }
              end; { routine anchor; statement location unresolved } { 4300:0F53 }
              local_105 := (local_105 + 1); { routine anchor; statement location unresolved } { 4300:0F53 }
            end; { routine anchor; statement location unresolved } { 4300:0F53 }
            (P_Word(((Integer(g_49D6) + (Integer((param_2 + local_102)) * 2)) + $2A00)))^ := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
          end; { routine anchor; statement location unresolved } { 4300:0F53 }
      end; { routine anchor; statement location unresolved } { 4300:0F53 }
    else { routine anchor; statement location unresolved } { 4300:0F53 }
      if (cVar1 = 2) then { routine anchor; statement location unresolved } { 4300:0F53 }
        begin { routine anchor; statement location unresolved } { 4300:0F53 }
          local_105 := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
          while Sequence(((P_Word(((Integer(g_49DA) + (Integer((param_2 + local_105)) * 2)) + -($2E00))))^ := Word(abStack_101[local_105])); (local_105 <> Byte((local_102 - 1)))) do { routine anchor; statement location unresolved } { 4300:0F53 }
          begin { routine anchor; statement location unresolved } { 4300:0F53 }
            begin { routine anchor; statement location unresolved } { 4300:0F53 }
            end; { routine anchor; statement location unresolved } { 4300:0F53 }
            local_105 := (local_105 + 1); { routine anchor; statement location unresolved } { 4300:0F53 }
          end; { routine anchor; statement location unresolved } { 4300:0F53 }
          (P_Word(((Integer(g_49DA) + (Integer((param_2 + local_102)) * 2)) + -($2E00))))^ := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
        end; { routine anchor; statement location unresolved } { 4300:0F53 }
      else { routine anchor; statement location unresolved } { 4300:0F53 }
        if (cVar1 = 3) then { routine anchor; statement location unresolved } { 4300:0F53 }
          begin { routine anchor; statement location unresolved } { 4300:0F53 }
            local_105 := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
            while Sequence((param_2[((Integer(g_49DE) + Word(local_105)) + $6700)] := abStack_101[local_105]); (local_105 <> Byte((local_102 - 1)))) do { routine anchor; statement location unresolved } { 4300:0F53 }
            begin { routine anchor; statement location unresolved } { 4300:0F53 }
              begin { routine anchor; statement location unresolved } { 4300:0F53 }
              end; { routine anchor; statement location unresolved } { 4300:0F53 }
              local_105 := (local_105 + 1); { routine anchor; statement location unresolved } { 4300:0F53 }
            end; { routine anchor; statement location unresolved } { 4300:0F53 }
            param_2[((Integer(g_49DE) + Word(local_102)) + $6700)] := 0; { routine anchor; statement location unresolved } { 4300:0F53 }
          end; { routine anchor; statement location unresolved } { 4300:0F53 }
  Exit; { 4300:1150 }
end; { routine anchor; statement location unresolved } { 4300:0F53 }
```

### ov07:1153 ecl_UnpackString (conf H)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Byte [BP+$08].  
Locals: uVar2: Byte [compiler temporary; no proven BP slot]; uVar1: Word [compiler temporary; no proven BP slot]; puVar3: P_Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_209: array[0..255] of Byte [BP-$207]; local_109: array[0..255] of Byte [BP-$107]; local_9: Byte [BP-$7]; local_8: Byte [BP-$6]; local_7: Byte [BP-$5]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3]; local_3: Byte [BP-$1].  
Callers: ecl_ReadOperands.  
Callees: ecl_SixBitChar, System.@CharToStr, System.@StrAppend, System.@StrAssign, System.@StrCopy.

```pascal
procedure ecl_UnpackString(param_1: Byte; param_2: Byte); { 4300:1153 }
begin { routine anchor; statement location unresolved } { 4300:1153 }
  uVar2 := 0; { routine anchor; statement location unresolved } { 4300:1153 }
  (P_Byte(((Word(param_1) * $100) + $6FC8)))^ := 0; { routine anchor; statement location unresolved } { 4300:1153 }
  local_3 := 0; { 4300:116A }
  local_8 := 1; { 4300:116E }
  while (local_3 < param_2) do { routine anchor; statement location unresolved } { 4300:1153 }
    begin { routine anchor; statement location unresolved } { 4300:1153 }
      if (local_8 < 4) then { routine anchor; statement location unresolved } { 4300:1153 }
        begin { routine anchor; statement location unresolved } { 4300:1153 }
          g_49ED := (g_49ED + 1); { 4300:1183 }
          local_6 := local_5; { 4300:118A }
          local_5 := (P_Byte(((Integer(g_49DE) + g_49ED) + $6700)))^; { 4300:119B }
          uVar2 := Byte((Word(g_49ED) shr 8)); { routine anchor; statement location unresolved } { 4300:1153 }
          local_3 := (local_3 + 1); { 4300:119E }
        end; { routine anchor; statement location unresolved } { 4300:1153 }
      if (local_8 = 1) then { routine anchor; statement location unresolved } { 4300:1153 }
        begin { routine anchor; statement location unresolved } { 4300:1153 }
          local_7 := (local_5 shr 2); { 4300:11B2 }
          uVar2 := 0; { routine anchor; statement location unresolved } { 4300:1153 }
        end; { routine anchor; statement location unresolved } { 4300:1153 }
      else { routine anchor; statement location unresolved } { 4300:1153 }
        if (local_8 = 2) then { routine anchor; statement location unresolved } { 4300:1153 }
          begin { routine anchor; statement location unresolved } { 4300:1153 }
            local_7 := (Byte(((local_6 * 64) + (local_5 shr 2))) shr 2); { 4300:11D3 }
            uVar2 := 0; { routine anchor; statement location unresolved } { 4300:1153 }
          end; { routine anchor; statement location unresolved } { 4300:1153 }
        else { routine anchor; statement location unresolved } { 4300:1153 }
          if (local_8 = 3) then { routine anchor; statement location unresolved } { 4300:1153 }
            begin { routine anchor; statement location unresolved } { 4300:1153 }
              local_7 := (Byte(((local_6 * 16) + (local_5 shr 4))) shr 2); { 4300:11E0 }
              uVar2 := 0; { routine anchor; statement location unresolved } { 4300:1153 }
            end; { routine anchor; statement location unresolved } { 4300:1153 }
          else { routine anchor; statement location unresolved } { 4300:1153 }
            if (local_8 = 4) then { routine anchor; statement location unresolved } { 4300:1153 }
              begin { routine anchor; statement location unresolved } { 4300:1153 }
                local_7 := (local_5 and $3F); { 4300:1201 }
              end; { routine anchor; statement location unresolved } { 4300:1153 }
      if (local_8 < 4) then { routine anchor; statement location unresolved } { 4300:1153 }
        begin { routine anchor; statement location unresolved } { 4300:1153 }
          local_8 := (local_8 + 1); { 4300:1225 }
        end; { routine anchor; statement location unresolved } { 4300:1153 }
      else { routine anchor; statement location unresolved } { 4300:1153 }
        begin { routine anchor; statement location unresolved } { 4300:1153 }
          local_8 := 1; { 4300:122A }
        end; { routine anchor; statement location unresolved } { 4300:1153 }
      if (local_7 <> 0) then { routine anchor; statement location unresolved } { 4300:1153 }
        begin { routine anchor; statement location unresolved } { 4300:1153 }
          local_9 := ecl_SixBitChar(Pack16(uVar2, local_7)); { 4300:1239 }
          puVar5 := local_109; { routine anchor; statement location unresolved } { 4300:1153 }
          uVar6 := SS; { routine anchor; statement location unresolved } { 4300:1153 }
          PString(BP+65273, SS) := PString(((Word(param_1) * $100) + $6FC8), $C7C); { 4300:1256 }
          puVar3 := local_209; { routine anchor; statement location unresolved } { 4300:1153 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 4300:1153 }
          PString(BP+65017, SS) := Chr(LoByte(Pack16(UNKNOWN_extraout_AH, local_9))); { 4300:1265 }
          PString(BP+65273, SS) := Copy(PString(BP+65273, SS) + PString(puVar3, uVar4), 1, 255); { 4300:126A }
          PString(((Word(param_1) * $100) + $6FC8), $C7C) := Copy(PString(puVar5, uVar6), 1, $FF); { 4300:1284 }
          uVar2 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 4300:1153 }
        end; { routine anchor; statement location unresolved } { 4300:1153 }
    end; { routine anchor; statement location unresolved } { 4300:1153 }
  if (local_8 = 4) then { routine anchor; statement location unresolved } { 4300:1153 }
    begin { routine anchor; statement location unresolved } { 4300:1153 }
      uVar1 := (Pack16(uVar2, local_5) and $FF3F); { routine anchor; statement location unresolved } { 4300:1153 }
      local_7 := Byte(uVar1); { 4300:120E }
      if (local_7 <> 0) then { routine anchor; statement location unresolved } { 4300:1153 }
        begin { routine anchor; statement location unresolved } { 4300:1153 }
          local_9 := ecl_SixBitChar(uVar1); { 4300:12A5 }
          puVar5 := local_109; { routine anchor; statement location unresolved } { 4300:1153 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 4300:1153 }
          PString(BP+65273, SS) := PString(((Word(param_1) * $100) + $6FC8), $C7C); { 4300:12C2 }
          puVar3 := local_209; { routine anchor; statement location unresolved } { 4300:1153 }
          PString(BP+65017, SS) := Chr(LoByte(Pack16(UNKNOWN_extraout_AH_01, local_9))); { 4300:12D1 }
          PString(BP+65273, SS) := Copy(PString(BP+65273, SS) + PString(puVar3, SS), 1, 255); { 4300:12D6 }
          PString(((Word(param_1) * $100) + $6FC8), $C7C) := Copy(PString(puVar5, uVar4), 1, $FF); { 4300:12F0 }
        end; { routine anchor; statement location unresolved } { 4300:1153 }
    end; { routine anchor; statement location unresolved } { 4300:1153 }
  Exit; { 4300:12F8 }
end; { routine anchor; statement location unresolved } { 4300:1153 }
```

### ov07:12FB ecl_GetMemString (conf M)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: Byte [BP+$08].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_204: array[0..255] of Byte [BP-$202]; local_104: array[0..255] of Byte [BP-$102]; local_4: Byte [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: ecl_ReadOperands.  
Callees: ecl_MemRegion, System.@CharToStr, System.@StrAppend, System.@StrAssign, System.@StrCopy.

```pascal
procedure ecl_GetMemString(param_1: P_Byte; param_2: Byte); { 4300:12FB }
begin { routine anchor; statement location unresolved } { 4300:12FB }
  local_3 := ecl_MemRegion(param_1); { 4300:1306 }
  (P_Byte(((Word(param_2) * $100) + $6FC8)))^ := 0; { routine anchor; statement location unresolved } { 4300:12FB }
  local_4 := 0; { 4300:131C }
  if (local_3 = 0) then { routine anchor; statement location unresolved } { 4300:12FB }
    begin { routine anchor; statement location unresolved } { 4300:12FB }
      while ((P_Integer(((Integer(g_49D2) + (Integer((param_1 + local_4)) * 2)) + $6E00)))^ <> 0) do { routine anchor; statement location unresolved } { 4300:12FB }
        begin { routine anchor; statement location unresolved } { 4300:12FB }
          puVar4 := local_104; { routine anchor; statement location unresolved } { 4300:12FB }
          uVar5 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
          PString(BP+65278, SS) := PString(((Word(param_2) * $100) + $6FC8), $C7C); { 4300:1356 }
          puVar2 := local_204; { routine anchor; statement location unresolved } { 4300:12FB }
          uVar3 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
          PString(BP+65022, SS) := Chr(LoByte(Pack16(ShortInt((Word((Integer((param_1 + local_4)) * 2)) shr 8)), (P_Byte(((Integer(g_49D2) + (Integer((param_1 + local_4)) * 2)) + $6E00)))^))); { 4300:1377 }
          PString(BP+65278, SS) := Copy(PString(BP+65278, SS) + PString(puVar2, uVar3), 1, 255); { 4300:137C }
          PString(((Word(param_2) * $100) + $6FC8), $C7C) := Copy(PString(puVar4, uVar5), 1, $FF); { 4300:1396 }
          local_4 := (local_4 + 1); { 4300:139B }
        end; { routine anchor; statement location unresolved } { 4300:12FB }
    end; { routine anchor; statement location unresolved } { 4300:12FB }
  else { routine anchor; statement location unresolved } { 4300:12FB }
    if (local_3 = 1) then { routine anchor; statement location unresolved } { 4300:12FB }
      begin { routine anchor; statement location unresolved } { 4300:12FB }
        cVar1 := 1; { routine anchor; statement location unresolved } { 4300:12FB }
        if (param_1 = P_Byte(@(g_6B00))) then { routine anchor; statement location unresolved } { 4300:12FB }
          begin { routine anchor; statement location unresolved } { 4300:12FB }
            PString(((Word(param_2) * $100) + $6FC8), $C7C) := Copy(PString(Integer(g_5D92), Integer((LongWord(g_5D92) shr $10))), 1, $FF); { 4300:13CC }
          end; { routine anchor; statement location unresolved } { 4300:12FB }
        else { routine anchor; statement location unresolved } { 4300:12FB }
          begin { routine anchor; statement location unresolved } { 4300:12FB }
            while Sequence((local_3 := cVar1); ((P_Integer(((Integer(g_49D6) + (Integer((param_1 + local_4)) * 2)) + $2A00)))^ <> 0)) do { routine anchor; statement location unresolved } { 4300:12FB }
              begin { routine anchor; statement location unresolved } { 4300:12FB }
                puVar4 := local_104; { routine anchor; statement location unresolved } { 4300:12FB }
                uVar5 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
                PString(BP+65278, SS) := PString(((Word(param_2) * $100) + $6FC8), $C7C); { 4300:1402 }
                puVar2 := local_204; { routine anchor; statement location unresolved } { 4300:12FB }
                uVar3 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
                PString(BP+65022, SS) := Chr(LoByte(Pack16(ShortInt((Word((Integer((param_1 + local_4)) * 2)) shr 8)), (P_Byte(((Integer(g_49D6) + (Integer((param_1 + local_4)) * 2)) + $2A00)))^))); { 4300:1423 }
                PString(BP+65278, SS) := Copy(PString(BP+65278, SS) + PString(puVar2, uVar3), 1, 255); { 4300:1428 }
                PString(((Word(param_2) * $100) + $6FC8), $C7C) := Copy(PString(puVar4, uVar5), 1, $FF); { 4300:1442 }
                local_4 := (local_4 + 1); { 4300:1447 }
                cVar1 := local_3; { routine anchor; statement location unresolved } { 4300:12FB }
              end; { routine anchor; statement location unresolved } { 4300:12FB }
          end; { routine anchor; statement location unresolved } { 4300:12FB }
      end; { routine anchor; statement location unresolved } { 4300:12FB }
    else { routine anchor; statement location unresolved } { 4300:12FB }
      if (local_3 = 2) then { routine anchor; statement location unresolved } { 4300:12FB }
        begin { routine anchor; statement location unresolved } { 4300:12FB }
          while ((P_Integer(((Integer(g_49DA) + (Integer((param_1 + local_4)) * 2)) + -($2E00))))^ <> 0) do { routine anchor; statement location unresolved } { 4300:12FB }
            begin { routine anchor; statement location unresolved } { 4300:12FB }
              puVar4 := local_104; { routine anchor; statement location unresolved } { 4300:12FB }
              uVar5 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
              PString(BP+65278, SS) := PString(((Word(param_2) * $100) + $6FC8), $C7C); { 4300:1482 }
              puVar2 := local_204; { routine anchor; statement location unresolved } { 4300:12FB }
              uVar3 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
              PString(BP+65022, SS) := Chr(LoByte(Pack16(ShortInt((Word((Integer((param_1 + local_4)) * 2)) shr 8)), (P_Byte(((Integer(g_49DA) + (Integer((param_1 + local_4)) * 2)) + -($2E00))))^))); { 4300:14A3 }
              PString(BP+65278, SS) := Copy(PString(BP+65278, SS) + PString(puVar2, uVar3), 1, 255); { 4300:14A8 }
              PString(((Word(param_2) * $100) + $6FC8), $C7C) := Copy(PString(puVar4, uVar5), 1, $FF); { 4300:14C2 }
              local_4 := (local_4 + 1); { 4300:14C7 }
            end; { routine anchor; statement location unresolved } { 4300:12FB }
        end; { routine anchor; statement location unresolved } { 4300:12FB }
      else { routine anchor; statement location unresolved } { 4300:12FB }
        if (local_3 = 3) then { routine anchor; statement location unresolved } { 4300:12FB }
          begin { routine anchor; statement location unresolved } { 4300:12FB }
            while (param_1[((Integer(g_49DE) + Word(local_4)) + $6700)] <> 0) do { routine anchor; statement location unresolved } { 4300:12FB }
              begin { routine anchor; statement location unresolved } { 4300:12FB }
                puVar4 := local_104; { routine anchor; statement location unresolved } { 4300:12FB }
                uVar5 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
                PString(BP+65278, SS) := PString(((Word(param_2) * $100) + $6FC8), $C7C); { 4300:14FF }
                puVar2 := local_204; { routine anchor; statement location unresolved } { 4300:12FB }
                uVar3 := SS; { routine anchor; statement location unresolved } { 4300:12FB }
                PString(BP+65022, SS) := Chr(LoByte(Pack16(ShortInt((Word((param_1 + local_4)) shr 8)), (param_1 + local_4)[(Integer(g_49DE) + $6700)]))); { 4300:151E }
                PString(BP+65278, SS) := Copy(PString(BP+65278, SS) + PString(puVar2, uVar3), 1, 255); { 4300:1523 }
                PString(((Word(param_2) * $100) + $6FC8), $C7C) := Copy(PString(puVar4, uVar5), 1, $FF); { 4300:153D }
                local_4 := (local_4 + 1); { 4300:1542 }
              end; { routine anchor; statement location unresolved } { 4300:12FB }
          end; { routine anchor; statement location unresolved } { 4300:12FB }
  Exit; { 4300:154A }
end; { routine anchor; statement location unresolved } { 4300:12FB }
```

### ov07:156D MenuHotkeys (conf H)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: P_Byte [BP+$0A].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; pbVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; bVar6: Boolean [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; local_204: array[0..255] of Byte [BP-$202]; local_104: array[0..255] of Byte [BP-$102]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: MenuSelect,VerticalListMenu.  
Callees: System.@CharToStr, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, System.Delete, System.UpCase.

```pascal
procedure MenuHotkeys(param_1: P_Byte; param_2: P_Byte); { 4300:156D }
begin { routine anchor; statement location unresolved } { 4300:156D }
  uVar5 := $4300; { routine anchor; statement location unresolved } { 4300:156D }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 4300:156D }
  local_4 := (param_2)^; { 4300:1581 }
  if (local_4 <> 0) then { routine anchor; statement location unresolved } { 4300:156D }
    begin { routine anchor; statement location unresolved } { 4300:156D }
      local_3 := 1; { 4300:158E }
      while true do { routine anchor; statement location unresolved } { 4300:156D }
        begin { routine anchor; statement location unresolved } { 4300:156D }
          uVar3 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 4300:156D }
          pbVar2 := P_Byte(param_2); { routine anchor; statement location unresolved } { 4300:156D }
          bVar6 := ((pbVar2 + local_3) = P_Byte($0)); { routine anchor; statement location unresolved } { 4300:156D }
          Flags.ZF := not (LoByte(pbVar2[local_3]) in [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90]); { 4300:15A9 }
          if not (bVar6) then { routine anchor; statement location unresolved } { 4300:156D }
            begin { routine anchor; statement location unresolved } { 4300:156D }
              pbVar2[local_3] := (pbVar2[local_3] + $20); { routine anchor; statement location unresolved } { 4300:156D }
            end; { routine anchor; statement location unresolved } { 4300:156D }
          if (pbVar2[local_3] = $7E) then { routine anchor; statement location unresolved } { 4300:156D }
            begin { routine anchor; statement location unresolved } { 4300:156D }
              Delete(PString(pbVar2, uVar3), local_3, 1); { 4300:15F0 }
              bVar1 := UpCase(pbVar2[local_3]); { 4300:1603 }
              pbVar2[local_3] := bVar1; { routine anchor; statement location unresolved } { 4300:156D }
              puVar8 := local_204; { routine anchor; statement location unresolved } { 4300:156D }
              uVar4 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4300:156D }
              uVar9 := SS; { routine anchor; statement location unresolved } { 4300:156D }
              PString(BP+65022, SS) := PString(P_Byte(param_1), uVar4); { 4300:1622 }
              puVar7 := local_104; { routine anchor; statement location unresolved } { 4300:156D }
              uVar5 := SS; { routine anchor; statement location unresolved } { 4300:156D }
              PString(BP+65278, SS) := Chr(LoByte(pbVar2[local_3])); { 4300:163B }
              PString(BP+65022, SS) := Copy(PString(BP+65022, SS) + PString(puVar7, uVar5), 1, 255); { 4300:1640 }
              PString(P_Byte(param_1), uVar4) := Copy(PString(puVar8, uVar9), 1, $28); { 4300:164E }
            end; { routine anchor; statement location unresolved } { 4300:156D }
          uVar5 := $AF8; { routine anchor; statement location unresolved } { 4300:156D }
          if (local_3 = local_4) then { routine anchor; statement location unresolved } { 4300:156D }
            Break; { routine anchor; statement location unresolved } { 4300:156D }
          local_3 := (local_3 + 1); { 4300:1593 }
        end; { routine anchor; statement location unresolved } { 4300:156D }
    end; { routine anchor; statement location unresolved } { 4300:156D }
  Exit; { 4300:1661 }
end; { routine anchor; statement location unresolved } { 4300:156D }
```

### ov07:1684 MenuSelect (conf H)

Params (stack slots): param_1: Byte [BP+$06]; param_2: ShortInt [BP+$08]; param_3: Byte [BP+$0A]; param_4: Byte [BP+$0C]; param_5: Byte [BP+$0E]; param_6: LongWord [BP+$10]; param_7: LongWord [BP+$14].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; local_158: ShortInt [BP-$156]; local_157: Byte [BP-$155]; local_156: Byte [BP-$154]; local_155: array[0..40] of Byte [BP-$153]; local_12c: array[0..255] of Byte [BP-$12A]; local_2c: array[0..40] of Byte [BP-$2A]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_0767, MenuHotkeys, System.@SetIn, System.@StrAssign, ov19_27DF, ov25_03BD.

```pascal
function MenuSelect(param_1: Byte; param_2: ShortInt; param_3: Byte; param_4: Byte; param_5: Byte; param_6: LongWord; param_7: LongWord): Word; { 4300:1684 }
begin { routine anchor; statement location unresolved } { 4300:1684 }
  PString(local_2c, SS) := Copy(PString(Integer(param_7), Integer((LongWord(param_7) shr $10))), 1, $28); { 4300:1699 }
  PString(local_12c, SS) := Copy(PString(Integer(param_6), Integer((LongWord(param_6) shr $10))), 1, $FF); { 4300:16AD }
  MenuHotkeys(local_155, SS, local_12c, SS); { 4300:16BF }
  repeat { routine anchor; statement location unresolved } { 4300:1684 }
    begin { routine anchor; statement location unresolved } { 4300:1684 }
      uVar3 := $3C5; { routine anchor; statement location unresolved } { 4300:1684 }
      uVar1 := ov25_03BD(@(local_158), SS, param_1, 1, param_3, param_4, param_5, local_12c, SS, local_2c, SS); { 4300:16E6 }
      local_157 := Byte(uVar1); { routine anchor; statement location unresolved } { 4300:1684 }
      uVar4 := (local_158 = 0); { routine anchor; statement location unresolved } { 4300:1684 }
      if not (Boolean(uVar4)) then { routine anchor; statement location unresolved } { 4300:1684 }
        begin { routine anchor; statement location unresolved } { 4300:1684 }
          ov19_27DF(uVar1); { 4300:16FB }
          uVar3 := $BA; { routine anchor; statement location unresolved } { 4300:1684 }
          FUN_00ba_0767(g_5D92, g_5D94); { 4300:1708 }
          local_157 := 0; { routine anchor; statement location unresolved } { 4300:1684 }
        end; { routine anchor; statement location unresolved } { 4300:1684 }
      Flags.ZF := not (LoByte(local_157) in [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90]); { 4300:171C }
      uVar1 := UNKNOWN_AXAfterHelper; { 4300:171C }
    end; { routine anchor; statement location unresolved } { 4300:1684 }
  until not ((Boolean(uVar4) and then ((local_157 <> $D) or else (param_2 = 0)))); { routine anchor; statement location unresolved } { 4300:1684 }
  iVar2 := Pack16(ShortInt((Word(uVar1) shr 8)), local_157); { routine anchor; statement location unresolved } { 4300:1684 }
  if (local_157 = $D) then { routine anchor; statement location unresolved } { 4300:1684 }
    begin { routine anchor; statement location unresolved } { 4300:1684 }
      local_3 := 0; { 4300:1738 }
    end; { routine anchor; statement location unresolved } { 4300:1684 }
  else { routine anchor; statement location unresolved } { 4300:1684 }
    begin { routine anchor; statement location unresolved } { 4300:1684 }
      local_156 := 1; { routine anchor; statement location unresolved } { 4300:1684 }
      while Sequence((uVar4 := Byte((Word(iVar2) shr 8))); ((local_156 <= local_155[0]) and then Sequence((iVar2 := 0); (uVar4 := 0); (local_155[local_156] <> local_157)))) do { routine anchor; statement location unresolved } { 4300:1684 }
        begin { routine anchor; statement location unresolved } { 4300:1684 }
          local_156 := (local_156 + 1); { routine anchor; statement location unresolved } { 4300:1684 }
        end; { routine anchor; statement location unresolved } { 4300:1684 }
      iVar2 := Pack16(uVar4, local_156); { routine anchor; statement location unresolved } { 4300:1684 }
      if (local_155[0] < local_156) then { routine anchor; statement location unresolved } { 4300:1684 }
        begin { routine anchor; statement location unresolved } { 4300:1684 }
          local_3 := $FF; { 4300:1776 }
        end; { routine anchor; statement location unresolved } { 4300:1684 }
      else { routine anchor; statement location unresolved } { 4300:1684 }
        begin { routine anchor; statement location unresolved } { 4300:1684 }
          iVar2 := (local_156 - 1); { routine anchor; statement location unresolved } { 4300:1684 }
          local_3 := Byte(iVar2); { 4300:177B }
        end; { routine anchor; statement location unresolved } { 4300:1684 }
    end; { routine anchor; statement location unresolved } { 4300:1684 }
  Exit(Pack16(ShortInt((Word(iVar2) shr 8)), local_3)); { 4300:1785 }
end; { routine anchor; statement location unresolved } { 4300:1684 }
```

### ov07:1788 VerticalListMenu (conf H)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: LongWord [BP+$0A]; param_3: LongWord [BP+$0E]; param_4: Byte [BP+$12]; param_5: Word [BP+$14]; param_6: Word [BP+$16]; param_7: Byte [BP+$18]; param_8: Byte [BP+$1A]; param_9: Byte [BP+$1C]; param_10: Byte [BP+$1E]; param_11: Byte [BP+$20]; param_12: Byte [BP+$22]; param_13: Byte [BP+$24]; param_14: LongWord [BP+$26]; param_15: LongWord [BP+$2A].  
Locals: local_155: array[0..41] of Byte [BP-$153]; local_12b: array[0..255] of Byte [BP-$129]; local_2b: array[0..40] of Byte [BP-$29].  
Callers: none recorded.  
Callees: MenuHotkeys, System.@StrAssign, ov25_0D9A.

```pascal
procedure VerticalListMenu(param_1: LongWord; param_2: LongWord; param_3: LongWord; param_4: Byte; param_5: Word; param_6: Word; param_7: Byte; param_8: Byte; param_9: Byte; param_10: Byte; param_11: Byte; param_12: Byte; param_13: Byte; param_14: LongWord; param_15: LongWord); { 4300:1788 }
begin { routine anchor; statement location unresolved } { 4300:1788 }
  PString(local_2b, SS) := Copy(PString(Integer(param_15), Integer((LongWord(param_15) shr $10))), 1, $28); { 4300:179D }
  PString(local_12b, SS) := Copy(PString(Integer(param_14), Integer((LongWord(param_14) shr $10))), 1, $FF); { 4300:17B1 }
  MenuHotkeys(local_155, SS, local_12b, SS); { 4300:17C3 }
  ov25_0D9A(Integer(param_1), Integer((LongWord(param_1) shr $10)), Integer(param_2), Integer((LongWord(param_2) shr $10)), Integer(param_3), Integer((LongWord(param_3) shr $10)), Pack16(UNKNOWN_extraout_AH, param_4), param_5, param_6, Pack16(UNKNOWN_extraout_AH, param_7), Pack16(UNKNOWN_extraout_AH, param_8), Pack16(UNKNOWN_extraout_AH, param_9), Pack16(UNKNOWN_extraout_AH, param_10), Pack16(UNKNOWN_extraout_AH, param_11), Pack16(UNKNOWN_extraout_AH, param_12), Pack16(UNKNOWN_extraout_AH, param_13), local_12b, SS, local_2b, SS); { 4300:1806 }
  Exit; { 4300:1812 }
end; { routine anchor; statement location unresolved } { 4300:1788 }
```

### ov07:1815 ecl_CompareStrings (conf H)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; local_202: array[0..255] of Byte [BP-$200]; local_102: array[0..255] of Byte [BP-$100].  
Callers: none recorded.  
Callees: System.@StrAssign, System.@StrCompare, System.FillChar.

```pascal
procedure ecl_CompareStrings(param_1: LongWord; param_2: LongWord); { 4300:1815 }
begin { routine anchor; statement location unresolved } { 4300:1815 }
  uVar1 := (@(stack0xfffe) < P_Byte($200)); { routine anchor; statement location unresolved } { 4300:1815 }
  uVar2 := (@(stack0x0000) = P_Byte($202)); { routine anchor; statement location unresolved } { 4300:1815 }
  PString(local_102, SS) := Copy(PString(Integer(param_2), Integer((LongWord(param_2) shr $10))), 1, $FF); { 4300:182B }
  PString(local_202, SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $FF); { 4300:183F }
  FillChar(MemRef(P_Byte(@(g_6F78)), $C7C), 6, 0); { 4300:1850 }
  ComparePascalStrings(PString(local_102, SS), PString(local_202, SS)); { 4300:1861 }
  if Boolean(uVar2) then { routine anchor; statement location unresolved } { 4300:1815 }
    begin { routine anchor; statement location unresolved } { 4300:1815 }
      g_6F78 := 1; { 4300:1868 }
    end; { routine anchor; statement location unresolved } { 4300:1815 }
  ComparePascalStrings(PString(local_102, SS), PString(local_202, SS)); { 4300:1879 }
  if not (Boolean(uVar2)) then { routine anchor; statement location unresolved } { 4300:1815 }
    begin { routine anchor; statement location unresolved } { 4300:1815 }
      g_6F79 := 1; { 4300:1880 }
    end; { routine anchor; statement location unresolved } { 4300:1815 }
  ComparePascalStrings(PString(local_102, SS), PString(local_202, SS)); { 4300:1891 }
  if Boolean(uVar1) then { routine anchor; statement location unresolved } { 4300:1815 }
    begin { routine anchor; statement location unresolved } { 4300:1815 }
      g_6F7A := 1; { 4300:1898 }
    end; { routine anchor; statement location unresolved } { 4300:1815 }
  ComparePascalStrings(PString(local_102, SS), PString(local_202, SS)); { 4300:18A9 }
  if (not (Boolean(uVar1)) and then not (Boolean(uVar2))) then { routine anchor; statement location unresolved } { 4300:1815 }
    begin { routine anchor; statement location unresolved } { 4300:1815 }
      g_6F7B := 1; { 4300:18B0 }
    end; { routine anchor; statement location unresolved } { 4300:1815 }
  ComparePascalStrings(PString(local_102, SS), PString(local_202, SS)); { 4300:18C1 }
  if (Boolean(uVar1) or else Boolean(uVar2)) then { routine anchor; statement location unresolved } { 4300:1815 }
    begin { routine anchor; statement location unresolved } { 4300:1815 }
      g_6F7C := 1; { 4300:18C8 }
    end; { routine anchor; statement location unresolved } { 4300:1815 }
  ComparePascalStrings(PString(local_102, SS), PString(local_202, SS)); { 4300:18D9 }
  if not (Boolean(uVar1)) then { routine anchor; statement location unresolved } { 4300:1815 }
    begin { routine anchor; statement location unresolved } { 4300:1815 }
      g_6F7D := 1; { 4300:18E0 }
    end; { routine anchor; statement location unresolved } { 4300:1815 }
  Exit; { 4300:18E8 }
end; { routine anchor; statement location unresolved } { 4300:1815 }
```

### ov07:18EB ecl_CompareWords (conf H)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: none.  
Callers: none recorded.  
Callees: System.FillChar.

```pascal
procedure ecl_CompareWords(param_1: Word; param_2: Word); { 4300:18EB }
begin { routine anchor; statement location unresolved } { 4300:18EB }
  FillChar(MemRef(P_Byte(@(g_6F78)), $C7C), 6, 0); { 4300:18FA }
  if (param_2 = param_1) then { routine anchor; statement location unresolved } { 4300:18EB }
    begin { routine anchor; statement location unresolved } { 4300:18EB }
      g_6F78 := 1; { 4300:1907 }
    end; { routine anchor; statement location unresolved } { 4300:18EB }
  else { routine anchor; statement location unresolved } { 4300:18EB }
    begin { routine anchor; statement location unresolved } { 4300:18EB }
      g_6F79 := 1; { 4300:1914 }
    end; { routine anchor; statement location unresolved } { 4300:18EB }
  if (param_2 < param_1) then { routine anchor; statement location unresolved } { 4300:18EB }
    begin { routine anchor; statement location unresolved } { 4300:18EB }
      g_6F7A := 1; { 4300:1921 }
    end; { routine anchor; statement location unresolved } { 4300:18EB }
  if (param_1 < param_2) then { routine anchor; statement location unresolved } { 4300:18EB }
    begin { routine anchor; statement location unresolved } { 4300:18EB }
      g_6F7B := 1; { 4300:192E }
    end; { routine anchor; statement location unresolved } { 4300:18EB }
  else { routine anchor; statement location unresolved } { 4300:18EB }
    begin { routine anchor; statement location unresolved } { 4300:18EB }
      g_6F7C := 1; { 4300:193B }
    end; { routine anchor; statement location unresolved } { 4300:18EB }
  if (param_1 <= param_2) then { routine anchor; statement location unresolved } { 4300:18EB }
    begin { routine anchor; statement location unresolved } { 4300:18EB }
      g_6F7D := 1; { 4300:1948 }
    end; { routine anchor; statement location unresolved } { 4300:18EB }
  Exit; { 4300:194E }
end; { routine anchor; statement location unresolved } { 4300:18EB }
```

### ov07:1951 ecl_Gosub (conf M)

Params (stack slots): param_1: Byte [BP+$06].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; puVar2: P_Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers: none recorded.  
Callees: System.GetMem, MakeWord.

```pascal
procedure ecl_Gosub(param_1: Byte); { 4300:1951 }
begin { routine anchor; statement location unresolved } { 4300:1951 }
  if ((g_6F70 = 0) and then (g_6F72 = 0)) then { routine anchor; statement location unresolved } { 4300:1951 }
    begin { routine anchor; statement location unresolved } { 4300:1951 }
      g_6F70 := P_Word(Allocate(6)); { 4300:1961 }
      uVar3 := Word((LongWord(g_6F70) shr $10)); { routine anchor; statement location unresolved } { 4300:1951 }
      puVar2 := P_Word(g_6F70); { routine anchor; statement location unresolved } { 4300:1951 }
      puVar2[1] := 0; { routine anchor; statement location unresolved } { 4300:1951 }
      puVar2[2] := 0; { routine anchor; statement location unresolved } { 4300:1951 }
    end; { routine anchor; statement location unresolved } { 4300:1951 }
  else { routine anchor; statement location unresolved } { 4300:1951 }
    begin { routine anchor; statement location unresolved } { 4300:1951 }
      g_6F74 := g_6F70; { 4300:1984 }
      g_6F76 := g_6F72; { 4300:1987 }
      g_6F70 := P_Word(Allocate(6)); { 4300:198F }
      iVar1 := g_6F76; { routine anchor; statement location unresolved } { 4300:1951 }
      uVar3 := Word((LongWord(g_6F70) shr $10)); { routine anchor; statement location unresolved } { 4300:1951 }
      puVar2 := P_Word(g_6F70); { routine anchor; statement location unresolved } { 4300:1951 }
      puVar2[1] := g_6F74; { routine anchor; statement location unresolved } { 4300:1951 }
      puVar2[2] := iVar1; { routine anchor; statement location unresolved } { 4300:1951 }
    end; { routine anchor; statement location unresolved } { 4300:1951 }
  (g_6F70)^ := g_49ED; { routine anchor; statement location unresolved } { 4300:1951 }
  g_49ED := MakeWord((P_Byte((param_1 + $7045)))^, (P_Byte((param_1 + $7085)))^); { 4300:19D1 }
  Exit; { 4300:19D8 }
end; { routine anchor; statement location unresolved } { 4300:1951 }
```

### ov07:19DB StepForward (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: ov29_047B, ov29_057A.

```pascal
procedure StepForward(); { 4300:19DB }
begin { routine anchor; statement location unresolved } { 4300:19DB }
  if (g_6AAF = 0) then { routine anchor; statement location unresolved } { 4300:19DB }
    begin { routine anchor; statement location unresolved } { 4300:19DB }
      if (g_6AAE < 1) then { routine anchor; statement location unresolved } { 4300:19DB }
        begin { routine anchor; statement location unresolved } { 4300:19DB }
          g_6AAE := 15; { 4300:19EC }
        end; { routine anchor; statement location unresolved } { 4300:19DB }
      else { routine anchor; statement location unresolved } { 4300:19DB }
        begin { routine anchor; statement location unresolved } { 4300:19DB }
          g_6AAE := (g_6AAE + -(1)); { 4300:19F2 }
        end; { routine anchor; statement location unresolved } { 4300:19DB }
    end; { routine anchor; statement location unresolved } { 4300:19DB }
  else { routine anchor; statement location unresolved } { 4300:19DB }
    if (g_6AAF = 2) then { routine anchor; statement location unresolved } { 4300:19DB }
      begin { routine anchor; statement location unresolved } { 4300:19DB }
        if (g_6AAD < 15) then { routine anchor; statement location unresolved } { 4300:19DB }
          begin { routine anchor; statement location unresolved } { 4300:19DB }
            g_6AAD := (g_6AAD + 1); { 4300:1A04 }
          end; { routine anchor; statement location unresolved } { 4300:19DB }
        else { routine anchor; statement location unresolved } { 4300:19DB }
          begin { routine anchor; statement location unresolved } { 4300:19DB }
            g_6AAD := 0; { 4300:1A0A }
          end; { routine anchor; statement location unresolved } { 4300:19DB }
      end; { routine anchor; statement location unresolved } { 4300:19DB }
    else { routine anchor; statement location unresolved } { 4300:19DB }
      if (g_6AAF = 4) then { routine anchor; statement location unresolved } { 4300:19DB }
        begin { routine anchor; statement location unresolved } { 4300:19DB }
          if (g_6AAE < 15) then { routine anchor; statement location unresolved } { 4300:19DB }
            begin { routine anchor; statement location unresolved } { 4300:19DB }
              g_6AAE := (g_6AAE + 1); { 4300:1A1C }
            end; { routine anchor; statement location unresolved } { 4300:19DB }
          else { routine anchor; statement location unresolved } { 4300:19DB }
            begin { routine anchor; statement location unresolved } { 4300:19DB }
              g_6AAE := 0; { 4300:1A22 }
            end; { routine anchor; statement location unresolved } { 4300:19DB }
        end; { routine anchor; statement location unresolved } { 4300:19DB }
      else { routine anchor; statement location unresolved } { 4300:19DB }
        if (g_6AAF = 6) then { routine anchor; statement location unresolved } { 4300:19DB }
          begin { routine anchor; statement location unresolved } { 4300:19DB }
            if (g_6AAD < 1) then { routine anchor; statement location unresolved } { 4300:19DB }
              begin { routine anchor; statement location unresolved } { 4300:19DB }
                g_6AAD := 15; { 4300:1A34 }
              end; { routine anchor; statement location unresolved } { 4300:19DB }
            else { routine anchor; statement location unresolved } { 4300:19DB }
              begin { routine anchor; statement location unresolved } { 4300:19DB }
                g_6AAD := (g_6AAD + -(1)); { 4300:1A3A }
              end; { routine anchor; statement location unresolved } { 4300:19DB }
          end; { routine anchor; statement location unresolved } { 4300:19DB }
  g_6AB1 := ov29_057A(g_6AAE, g_6AAD); { 4300:1A47 }
  g_6AB0 := ov29_047B(g_6AAF, g_6AAE, g_6AAD); { 4300:1A5B }
  Exit; { 4300:1A64 }
end; { routine anchor; statement location unresolved } { 4300:19DB }
```

### ov07:1A6F ov07_1A6F (conf L)

Params (stack slots): param_1: ShortInt [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar4: Boolean [compiler temporary; no proven BP slot]; uVar5: LongWord [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; local_1f: array[0..8] of Byte [BP-$1D]; local_16: Word [BP-$14]; local_14: Word [BP-$12]; local_12: Integer [BP-$10]; iStack_10: Integer [BP-$E]; local_e: Integer [BP-$C]; uStack_c: Word [BP-$A]; local_a: LongWord [BP-$8]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: none recorded.  
Callees: System.@CopyBytes, System.@StrAssign, System.@StrCompare, System.@StrCopy, System.GetMem, ov32_01C8.

```pascal
procedure ov07_1A6F(param_1: ShortInt); { 4300:1A6F }
begin { routine anchor; statement location unresolved } { 4300:1A6F }
  uVar3 := $4300; { routine anchor; statement location unresolved } { 4300:1A6F }
  g_84D4 := 1; { 4300:1A75 }
  (P_Integer((Integer(g_49D6) + $5CC)))^ := Integer(param_1); { routine anchor; statement location unresolved } { 4300:1A6F }
  local_e := g_5D92; { 4300:1A8E }
  uStack_c := g_5D94; { 4300:1A91 }
  iStack_4 := g_5D98; { 4300:1A9E }
  local_6 := g_5D96; { 4300:1A9B }
  while Sequence((bVar4 := ((local_6 = 0) and then (iStack_4 = 0))); ((local_6 <> 0) or else (iStack_4 <> 0))) do { routine anchor; statement location unresolved } { 4300:1A6F }
    begin { routine anchor; statement location unresolved } { 4300:1A6F }
      uVar3 := $AF8; { routine anchor; statement location unresolved } { 4300:1A6F }
      ComparePascalStrings(PString(local_6, iStack_4), PString(local_e, uStack_c)); { 4300:1AB3 }
      if not (bVar4) then { routine anchor; statement location unresolved } { 4300:1A6F }
        begin { routine anchor; statement location unresolved } { 4300:1A6F }
          (P_Byte((local_6 + $10D)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
        end; { routine anchor; statement location unresolved } { 4300:1A6F }
      piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 4300:1A6F }
      iStack_4 := (P_Integer((local_6 + $106)))^; { 4300:1AD3 }
      local_6 := (piVar1)^; { 4300:1AD0 }
    end; { routine anchor; statement location unresolved } { 4300:1A6F }
  if (param_1 <> 0) then { routine anchor; statement location unresolved } { 4300:1A6F }
    begin { routine anchor; statement location unresolved } { 4300:1A6F }
      puVar6 := local_1f; { routine anchor; statement location unresolved } { 4300:1A6F }
      PString(local_1f, SS) := 'CPIC'; { 4300:1AEB }
      ov32_01C8(Pack16(UNKNOWN_extraout_AH, g_6F83), Pack16(UNKNOWN_extraout_AH, $B), puVar6, SS); { 4300:1AF7 }
      local_6 := g_5D96; { 4300:1B03 }
      iStack_4 := g_5D98; { 4300:1B06 }
      while (((P_Integer((local_6 + $104)))^ <> 0) or else ((P_Integer((local_6 + $106)))^ <> 0)) do { routine anchor; statement location unresolved } { 4300:1A6F }
        begin { routine anchor; statement location unresolved } { 4300:1A6F }
          piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 4300:1A6F }
          iStack_4 := (P_Integer((local_6 + $106)))^; { 4300:1B28 }
          local_6 := (piVar1)^; { 4300:1B25 }
        end; { routine anchor; statement location unresolved } { 4300:1A6F }
      local_a := Allocate($11D); { 4300:1B31 }
      Move(MemRef(local_e,uStack_c), MemRef(WordAtSS(BP-8),WordAtSS(BP-6)), $11D); { 4300:1B4A }
      (P_Byte((Integer(local_a) + $10D)))^ := 1; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((Integer(local_a) + $104)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((Integer(local_a) + $106)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
      PString(WordAtSS(BP-8),WordAtSS(BP-6)) := Copy('ROLF',1,15); { 4300:1B75 }
      (P_Byte((Integer(local_a) + $10F)))^ := 1; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Byte((Integer(local_a) + $10E)))^ := 1; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Byte((Integer(local_a) + $84)))^ := $B2; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Byte((Integer(local_a) + $BF)))^ := g_6F83; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((Integer(local_a) + $7F)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((Integer(local_a) + $81)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((Integer(local_a) + 200)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((Integer(local_a) + $CA)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Integer((local_6 + $104)))^ := Integer(local_a); { routine anchor; statement location unresolved } { 4300:1A6F }
      (P_Word((local_6 + $106)))^ := Slice16(local_a, 2); { routine anchor; statement location unresolved } { 4300:1A6F }
      piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 4300:1A6F }
      iStack_4 := (P_Word((local_6 + $106)))^; { 4300:1BE0 }
      iStack_10 := (P_Integer((local_e + $CA)))^; { 4300:1BF3 }
      local_12 := (P_Integer((local_e + 200)))^; { 4300:1BF0 }
      local_6 := (piVar1)^; { 4300:1BDD }
      while ((local_12 <> 0) or else (iStack_10 <> 0)) do { routine anchor; statement location unresolved } { 4300:1A6F }
        begin { routine anchor; statement location unresolved } { 4300:1A6F }
          if (((P_Integer((local_6 + 200)))^ = 0) and then ((P_Integer((local_6 + $CA)))^ = 0)) then { routine anchor; statement location unresolved } { 4300:1A6F }
            begin { routine anchor; statement location unresolved } { 4300:1A6F }
              uVar5 := Allocate($3F); { 4300:1C14 }
              (P_Word((local_6 + 200)))^ := Integer(uVar5); { routine anchor; statement location unresolved } { 4300:1A6F }
              (P_Word((local_6 + $CA)))^ := Integer((LongWord(uVar5) shr $10)); { routine anchor; statement location unresolved } { 4300:1A6F }
              Move(MemRef(local_12, iStack_10), MemRef(Integer((P_LongWord((local_6 + 200)))^), Integer((LongWord((P_LongWord((local_6 + 200)))^) shr $10))), $3F); { 4300:1C39 }
              uVar3 := Word((LongWord((P_LongWord((local_6 + 200)))^) shr $10)); { routine anchor; statement location unresolved } { 4300:1A6F }
              iVar2 := Integer((P_LongWord((local_6 + 200)))^); { routine anchor; statement location unresolved } { 4300:1A6F }
              (P_Word((iVar2 + $2A)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
              (P_Word((iVar2 + $2C)))^ := 0; { routine anchor; statement location unresolved } { 4300:1A6F }
            end; { routine anchor; statement location unresolved } { 4300:1A6F }
          else { routine anchor; statement location unresolved } { 4300:1A6F }
            begin { routine anchor; statement location unresolved } { 4300:1A6F }
              local_16 := (P_Word((local_6 + 200)))^; { 4300:1C5F }
              local_14 := (P_Word((local_6 + $CA)))^; { 4300:1C62 }
              uVar5 := Allocate($3F); { 4300:1C69 }
              (P_Word((local_6 + 200)))^ := Integer(uVar5); { routine anchor; statement location unresolved } { 4300:1A6F }
              (P_Word((local_6 + $CA)))^ := Integer((LongWord(uVar5) shr $10)); { routine anchor; statement location unresolved } { 4300:1A6F }
              Move(MemRef(local_12, iStack_10), MemRef(Integer((P_LongWord((local_6 + 200)))^), Integer((LongWord((P_LongWord((local_6 + 200)))^) shr $10))), $3F); { 4300:1C8E }
              uVar3 := Word((LongWord((P_LongWord((local_6 + 200)))^) shr $10)); { routine anchor; statement location unresolved } { 4300:1A6F }
              iVar2 := Integer((P_LongWord((local_6 + 200)))^); { routine anchor; statement location unresolved } { 4300:1A6F }
              (P_Word((iVar2 + $2A)))^ := local_16; { routine anchor; statement location unresolved } { 4300:1A6F }
              (P_Word((iVar2 + $2C)))^ := local_14; { routine anchor; statement location unresolved } { 4300:1A6F }
            end; { routine anchor; statement location unresolved } { 4300:1A6F }
          piVar1 := P_Integer((local_12 + $2A)); { routine anchor; statement location unresolved } { 4300:1A6F }
          iStack_10 := (P_Integer((local_12 + $2C)))^; { 4300:1CB7 }
          local_12 := (piVar1)^; { 4300:1CB4 }
        end; { routine anchor; statement location unresolved } { 4300:1A6F }
    end; { routine anchor; statement location unresolved } { 4300:1A6F }
  Exit; { 4300:1CC0 }
end; { routine anchor; statement location unresolved } { 4300:1A6F }
```

### ov07:1CC3 ScaleMoney (conf H)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers: none recorded.  
Callees: System.@LongToReal, System.@RealMul, System.Trunc.

Stack layout disagrees with RETF: remaining difference 6 bytes.

```pascal
procedure ScaleMoney(param_1: LongWord); { 4300:1CC3 }
begin { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1CD0 }
  MultiplyRealFromRegisters(); { 4300:1CDE }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1CE3 }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4300:1CC3 }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 4300:1CC3 }
  (P_Word((iVar2 + $88)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1CFA }
  MultiplyRealFromRegisters(); { 4300:1D08 }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1D0D }
  (P_Word((iVar2 + $8A)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1D24 }
  MultiplyRealFromRegisters(); { 4300:1D32 }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1D37 }
  (P_Word((iVar2 + $8C)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1D4E }
  MultiplyRealFromRegisters(); { 4300:1D5C }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1D61 }
  (P_Word((iVar2 + $8E)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1D78 }
  MultiplyRealFromRegisters(); { 4300:1D86 }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1D8B }
  (P_Word((iVar2 + $90)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1DA2 }
  MultiplyRealFromRegisters(); { 4300:1DB0 }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1DB5 }
  (P_Word((iVar2 + $92)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  RealFromRegisters(); { 4300:1DCC }
  MultiplyRealFromRegisters(); { 4300:1DDA }
  uVar1 := Trunc(UNKNOWN_RealRegisterOperand); { 4300:1DDF }
  (P_Word((iVar2 + $94)))^ := uVar1; { routine anchor; statement location unresolved } { 4300:1CC3 }
  Exit; { 4300:1DED }
end; { routine anchor; statement location unresolved } { 4300:1CC3 }
```

### ov07:1DF0 LoseItemsChance (conf H)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: Byte [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_7: Word [BP-$5]; uStack_5: Word [BP-$3].  
Callers: none recorded.  
Callees: FUN_00ba_1509, RollDice.

```pascal
procedure LoseItemsChance(param_1: LongWord; param_2: Byte); { 4300:1DF0 }
begin { routine anchor; statement location unresolved } { 4300:1DF0 }
  uVar6 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4300:1DF0 }
  iVar5 := Integer(param_1); { routine anchor; statement location unresolved } { 4300:1DF0 }
  uVar3 := (P_Word((iVar5 + 200)))^; { routine anchor; statement location unresolved } { 4300:1DF0 }
  uVar1 := (P_Word((iVar5 + $CA)))^; { routine anchor; statement location unresolved } { 4300:1DF0 }
  while Sequence((uStack_5 := uVar1); (local_7 := uVar3); (uVar3 := (local_7 or uStack_5)); (uVar3 <> 0)) do { routine anchor; statement location unresolved } { 4300:1DF0 }
    begin { routine anchor; statement location unresolved } { 4300:1DF0 }
      if ((P_Word((local_7 + $37)))^ < $100) then { routine anchor; statement location unresolved } { 4300:1DF0 }
        begin { routine anchor; statement location unresolved } { 4300:1DF0 }
          if ($18 < (P_Word((local_7 + $37)))^) then { routine anchor; statement location unresolved } { 4300:1DF0 }
            begin { routine anchor; statement location unresolved } { 4300:1DF0 }
              if (param_2 < $33) then { routine anchor; statement location unresolved } { 4300:1DF0 }
                begin { routine anchor; statement location unresolved } { 4300:1DF0 }
                  param_2 := 0; { routine anchor; statement location unresolved } { 4300:1DF0 }
                end; { routine anchor; statement location unresolved } { 4300:1DF0 }
              else { routine anchor; statement location unresolved } { 4300:1DF0 }
                begin { routine anchor; statement location unresolved } { 4300:1DF0 }
                  uVar3 := (param_2 - $32); { routine anchor; statement location unresolved } { 4300:1DF0 }
                  param_2 := Byte(uVar3); { routine anchor; statement location unresolved } { 4300:1DF0 }
                end; { routine anchor; statement location unresolved } { 4300:1DF0 }
            end; { routine anchor; statement location unresolved } { 4300:1DF0 }
        end; { routine anchor; statement location unresolved } { 4300:1DF0 }
      else { routine anchor; statement location unresolved } { 4300:1DF0 }
        if (param_2 < $5B) then { routine anchor; statement location unresolved } { 4300:1DF0 }
          begin { routine anchor; statement location unresolved } { 4300:1DF0 }
            param_2 := 0; { routine anchor; statement location unresolved } { 4300:1DF0 }
          end; { routine anchor; statement location unresolved } { 4300:1DF0 }
        else { routine anchor; statement location unresolved } { 4300:1DF0 }
          begin { routine anchor; statement location unresolved } { 4300:1DF0 }
            uVar3 := (param_2 - $5A); { routine anchor; statement location unresolved } { 4300:1DF0 }
            param_2 := Byte(uVar3); { routine anchor; statement location unresolved } { 4300:1DF0 }
          end; { routine anchor; statement location unresolved } { 4300:1DF0 }
      uVar4 := Byte((uVar3 shr 8)); { routine anchor; statement location unresolved } { 4300:1DF0 }
      bVar2 := RollDice(Pack16(uVar4, 100), Pack16(uVar4, 1)); { 4300:1E5F }
      uVar3 := (P_Word((local_7 + $2A)))^; { routine anchor; statement location unresolved } { 4300:1DF0 }
      uVar1 := (P_Word((local_7 + $2C)))^; { routine anchor; statement location unresolved } { 4300:1DF0 }
      if (bVar2 <= param_2) then { routine anchor; statement location unresolved } { 4300:1DF0 }
        begin { routine anchor; statement location unresolved } { 4300:1DF0 }
          FUN_00ba_1509(local_7, uStack_5, iVar5, uVar6); { 4300:1E8C }
        end; { routine anchor; statement location unresolved } { 4300:1DF0 }
    end; { routine anchor; statement location unresolved } { 4300:1DF0 }
  Exit; { 4300:1EA3 }
end; { routine anchor; statement location unresolved } { 4300:1DF0 }
```

### ov07:1EA6 ecl_SkipInstruction (conf H)

Params (stack slots): none.  
Locals: uVar1: Byte [compiler temporary; no proven BP slot].  
Callers: none recorded.  
Callees: ecl_ReadOperands.

```pascal
procedure ecl_SkipInstruction(); { 4300:1EA6 }
begin { routine anchor; statement location unresolved } { 4300:1EA6 }
  g_6F7F := (P_Byte(((Integer(g_49DE) + g_49ED) + $6700)))^; { 4300:1EB7 }
  uVar1 := Byte((Word(g_49ED) shr 8)); { routine anchor; statement location unresolved } { 4300:1EA6 }
  if (((((g_6F7F = 1) or else (g_6F7F = 2)) or else (g_6F7F = 10)) or else ((g_6F7F = $E) or else (g_6F7F = $11))) or else ((((g_6F7F = $12) or else ((g_6F7F = $1D) or else (g_6F7F = $20))) or else (g_6F7F = $2D)) or else ((((g_6F7F = $32) or else (g_6F7F = $34)) or else (g_6F7F = $36)) or else (((g_6F7F = $38) or else (g_6F7F = $39)) or else (g_6F7F = $3C))))) then { routine anchor; statement location unresolved } { 4300:1EA6 }
    begin { routine anchor; statement location unresolved } { 4300:1EA6 }
      ecl_ReadOperands(Pack16(uVar1, 1)); { 4300:1EFD }
    end; { routine anchor; statement location unresolved } { 4300:1EA6 }
  else { routine anchor; statement location unresolved } { 4300:1EA6 }
    if ((((g_6F7F = 3) or else (g_6F7F = 8)) or else ((g_6F7F = 9) or else (((g_6F7F = $C) or else (g_6F7F = $F)) or else (g_6F7F = $10)))) or else ((g_6F7F = $1F) or else (g_6F7F = $22))) then { routine anchor; statement location unresolved } { 4300:1EA6 }
      begin { routine anchor; statement location unresolved } { 4300:1EA6 }
        ecl_ReadOperands(Pack16(uVar1, 2)); { 4300:1F27 }
      end; { routine anchor; statement location unresolved } { 4300:1EA6 }
    else { routine anchor; statement location unresolved } { 4300:1EA6 }
      if ((((g_6F7F < 4) or else (7 < g_6F7F)) and then (((g_6F7F <> $B) and then (g_6F7F <> $21)) and then ((g_6F7F <> $28) and then ((((g_6F7F <> $2A) and then (g_6F7F <> $2F)) and then (g_6F7F <> $30)) and then ((g_6F7F <> $35) and then (g_6F7F <> $37)))))) and then (g_6F7F <> $3B)) then { routine anchor; statement location unresolved } { 4300:1EA6 }
        begin { routine anchor; statement location unresolved } { 4300:1EA6 }
          if ((g_6F7F = $14) or else (g_6F7F = $23)) then { routine anchor; statement location unresolved } { 4300:1EA6 }
            begin { routine anchor; statement location unresolved } { 4300:1EA6 }
              ecl_ReadOperands(Pack16(uVar1, 4)); { 4300:1F5D }
            end; { routine anchor; statement location unresolved } { 4300:1EA6 }
          else { routine anchor; statement location unresolved } { 4300:1EA6 }
            if (g_6F7F = $2E) then { routine anchor; statement location unresolved } { 4300:1EA6 }
              begin { routine anchor; statement location unresolved } { 4300:1EA6 }
                ecl_ReadOperands(Pack16(uVar1, 5)); { 4300:1F6E }
              end; { routine anchor; statement location unresolved } { 4300:1EA6 }
            else { routine anchor; statement location unresolved } { 4300:1EA6 }
              if ((g_6F7F = $1E) or else (g_6F7F = $2C)) then { routine anchor; statement location unresolved } { 4300:1EA6 }
                begin { routine anchor; statement location unresolved } { 4300:1EA6 }
                  ecl_ReadOperands(Pack16(uVar1, 6)); { 4300:1F7B }
                end; { routine anchor; statement location unresolved } { 4300:1EA6 }
              else { routine anchor; statement location unresolved } { 4300:1EA6 }
                if (g_6F7F = $27) then { routine anchor; statement location unresolved } { 4300:1EA6 }
                  begin { routine anchor; statement location unresolved } { 4300:1EA6 }
                    ecl_ReadOperands(Pack16(uVar1, 8)); { 4300:1F8C }
                  end; { routine anchor; statement location unresolved } { 4300:1EA6 }
                else { routine anchor; statement location unresolved } { 4300:1EA6 }
                  if (g_6F7F = $29) then { routine anchor; statement location unresolved } { 4300:1EA6 }
                    begin { routine anchor; statement location unresolved } { 4300:1EA6 }
                      ecl_ReadOperands(Pack16(uVar1, $E)); { 4300:1F99 }
                    end; { routine anchor; statement location unresolved } { 4300:1EA6 }
                  else { routine anchor; statement location unresolved } { 4300:1EA6 }
                    begin { routine anchor; statement location unresolved } { 4300:1EA6 }
                      g_49ED := (g_49ED + 1); { 4300:1FAB }
                    end; { routine anchor; statement location unresolved } { 4300:1EA6 }
        end; { routine anchor; statement location unresolved } { 4300:1EA6 }
      else { routine anchor; statement location unresolved } { 4300:1EA6 }
        begin { routine anchor; statement location unresolved } { 4300:1EA6 }
          ecl_ReadOperands(Pack16(uVar1, 3)); { 4300:1FA6 }
        end; { routine anchor; statement location unresolved } { 4300:1EA6 }
  Exit; { 4300:1FB0 }
end; { routine anchor; statement location unresolved } { 4300:1EA6 }
```

### ov07:1FB1 PartyMoveRange (conf H)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: P_Byte [BP+$0A].  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; cVar4: ShortInt [compiler temporary; no proven BP slot]; local_b: Byte [BP-$9]; local_a: array[0..3] of Byte [BP-$8]; local_6: Word [BP-$4]; uStack_4: Word [BP-$2].  
Callers: none recorded.  
Callees: FUN_00ba_2199.

```pascal
procedure PartyMoveRange(param_1: P_Byte; param_2: P_Byte); { 4300:1FB1 }
begin { routine anchor; statement location unresolved } { 4300:1FB1 }
  uVar3 := g_5D98; { routine anchor; statement location unresolved } { 4300:1FB1 }
  uVar2 := g_5D96; { routine anchor; statement location unresolved } { 4300:1FB1 }
  local_6 := g_5D96; { 4300:1FBE }
  uStack_4 := g_5D98; { 4300:1FC1 }
  (param_2)^ := (P_Byte((g_5D96 + $11C)))^; { routine anchor; statement location unresolved } { 4300:1FB1 }
  (param_1)^ := (P_Byte((uVar2 + $11C)))^; { routine anchor; statement location unresolved } { 4300:1FB1 }
  while ((local_6 or uStack_4) <> 0) do { routine anchor; statement location unresolved } { 4300:1FB1 }
    begin { routine anchor; statement location unresolved } { 4300:1FB1 }
      local_b := (P_Byte((local_6 + $11C)))^; { 4300:1FF3 }
      cVar4 := FUN_00ba_2199(local_a, SS, Pack16(ShortInt(((local_6 or uStack_4) shr 8)), $27), local_6, uStack_4); { 4300:2004 }
      if (cVar4 = 0) then { routine anchor; statement location unresolved } { 4300:1FB1 }
        begin { routine anchor; statement location unresolved } { 4300:1FB1 }
          cVar4 := FUN_00ba_2199(local_a, SS, $2A, local_6, uStack_4); { 4300:2027 }
          if (cVar4 <> 0) then { routine anchor; statement location unresolved } { 4300:1FB1 }
            begin { routine anchor; statement location unresolved } { 4300:1FB1 }
              local_b := (local_b shr 1); { 4300:2014 }
            end; { routine anchor; statement location unresolved } { 4300:1FB1 }
        end; { routine anchor; statement location unresolved } { 4300:1FB1 }
      else { routine anchor; statement location unresolved } { 4300:1FB1 }
        begin { routine anchor; statement location unresolved } { 4300:1FB1 }
          local_b := (local_b shl 1); { 4300:2037 }
        end; { routine anchor; statement location unresolved } { 4300:1FB1 }
      if ((param_2)^ < local_b) then { routine anchor; statement location unresolved } { 4300:1FB1 }
        begin { routine anchor; statement location unresolved } { 4300:1FB1 }
          (param_2)^ := local_b; { routine anchor; statement location unresolved } { 4300:1FB1 }
        end; { routine anchor; statement location unresolved } { 4300:1FB1 }
      if (local_b < (param_1)^) then { routine anchor; statement location unresolved } { 4300:1FB1 }
        begin { routine anchor; statement location unresolved } { 4300:1FB1 }
          (param_1)^ := local_b; { routine anchor; statement location unresolved } { 4300:1FB1 }
        end; { routine anchor; statement location unresolved } { 4300:1FB1 }
      puVar1 := P_Word((local_6 + $104)); { routine anchor; statement location unresolved } { 4300:1FB1 }
      uStack_4 := (P_Word((local_6 + $106)))^; { 4300:2072 }
      local_6 := (puVar1)^; { 4300:206F }
    end; { routine anchor; statement location unresolved } { 4300:1FB1 }
  Exit; { 4300:207B }
end; { routine anchor; statement location unresolved } { 4300:1FB1 }
```

### ov07:20CC ApplyEclDamage (conf H)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: Word [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_208: array[0..220] of Byte [BP-$206]; local_12b: array[0..34] of Byte [BP-$129]; local_108: Byte [BP-$106]; local_107: array[0..3] of Byte [BP-$105]; local_103: array[0..256] of Byte [BP-$101].  
Callers: none recorded.  
Callees: FUN_00ba_0767, FUN_00ba_2228, FUN_0709_0768, FUN_0709_0bf5, FUN_0709_0dd3, System.@StrAppend, System.@StrAssign, System.@StrCopy, System.@StrLong.

```pascal
procedure ApplyEclDamage(param_1: LongWord; param_2: Word); { 4300:20CC }
begin { routine anchor; statement location unresolved } { 4300:20CC }
  uVar4 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4300:20CC }
  iVar3 := Integer(param_1); { routine anchor; statement location unresolved } { 4300:20CC }
  if ((P_ShortInt((iVar3 + $10C)))^ <> 6) then { routine anchor; statement location unresolved } { 4300:20CC }
    begin { routine anchor; statement location unresolved } { 4300:20CC }
      local_108 := 0; { routine anchor; statement location unresolved } { 4300:20CC }
      Str(LongInt(FarBits(0, param_2)):0, PString(local_107, SS), capacity := 3); { 4300:20FA }
      if (((P_Byte((iVar3 + $11B)))^ + 10) < param_2) then { routine anchor; statement location unresolved } { 4300:20CC }
        begin { routine anchor; statement location unresolved } { 4300:20CC }
          puVar5 := local_208; { routine anchor; statement location unresolved } { 4300:20CC }
          uVar6 := SS; { routine anchor; statement location unresolved } { 4300:20CC }
          PString(BP+65018, SS) := '  '; { 4300:211C }
          PString(BP+65018, SS) := Copy(PString(BP+65018, SS) + PString(iVar3, uVar4), 1, 255); { 4300:2126 }
          PString(BP+65018, SS) := Copy(PString(BP+65018, SS) + ' dies. ', 1, 255); { 4300:2130 }
          PString(local_103, SS) := Copy(PString(puVar5, uVar6), 1, $FF); { 4300:213F }
          uVar2 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4300:20CC }
        end; { routine anchor; statement location unresolved } { 4300:20CC }
      else { routine anchor; statement location unresolved } { 4300:20CC }
        begin { routine anchor; statement location unresolved } { 4300:20CC }
          puVar5 := local_208; { routine anchor; statement location unresolved } { 4300:20CC }
          uVar6 := SS; { routine anchor; statement location unresolved } { 4300:20CC }
          PString(BP+65018, SS) := '  '; { 4300:2151 }
          PString(BP+65018, SS) := Copy(PString(BP+65018, SS) + PString(iVar3, uVar4), 1, 255); { 4300:215B }
          PString(BP+65018, SS) := Copy(PString(BP+65018, SS) + ' is hit FOR ', 1, 255); { 4300:2165 }
          PString(BP+65018, SS) := Copy(PString(BP+65018, SS) + PString(local_107, SS), 1, 255); { 4300:2170 }
          PString(BP+65018, SS) := Copy(PString(BP+65018, SS) + ' points of Damage.', 1, 255); { 4300:217A }
          PString(local_103, SS) := Copy(PString(puVar5, uVar6), 1, $FF); { 4300:2189 }
          uVar2 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 4300:20CC }
        end; { routine anchor; statement location unresolved } { 4300:20CC }
      if (g_5E25 < $17) then { routine anchor; statement location unresolved } { 4300:20CC }
        begin { routine anchor; statement location unresolved } { 4300:20CC }
          local_108 := 0; { routine anchor; statement location unresolved } { 4300:20CC }
        end; { routine anchor; statement location unresolved } { 4300:20CC }
      else { routine anchor; statement location unresolved } { 4300:20CC }
        begin { routine anchor; statement location unresolved } { 4300:20CC }
          g_5E25 := $11; { 4300:2195 }
          local_108 := 1; { routine anchor; statement location unresolved } { 4300:20CC }
          uVar1 := Pack16(uVar2, $F); { routine anchor; statement location unresolved } { 4300:20CC }
          puVar5 := local_12b; { routine anchor; statement location unresolved } { 4300:20CC }
          uVar6 := SS; { routine anchor; statement location unresolved } { 4300:20CC }
          PString(BP+65239, SS) := 'press <enter>/<return> to continue'; { 4300:21AD }
          FUN_0709_0bf5(puVar5, uVar6, uVar1); { 4300:21B2 }
          uVar2 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 4300:20CC }
        end; { routine anchor; statement location unresolved } { 4300:20CC }
      g_5E24 := $26; { 4300:21BE }
      FUN_0709_0768(local_103, SS, Pack16(uVar2, local_108), Pack16(uVar2, $F), Pack16(uVar2, $16), Pack16(uVar2, $26), Pack16(uVar2, $11), Pack16(uVar2, 1)); { 4300:21DD }
      FUN_00ba_2228(Pack16(UNKNOWN_extraout_AH_02, Byte(param_2)), iVar3, uVar4); { 4300:21EC }
      FUN_0709_0dd3(Pack16(UNKNOWN_extraout_AH_03, $F), Pack16(UNKNOWN_extraout_AH_03, $26), Pack16(UNKNOWN_extraout_AH_03, 1), Pack16(UNKNOWN_extraout_AH_03, $11)); { 4300:21FD }
      FUN_00ba_0767(g_5D92, g_5D94); { 4300:220A }
    end; { routine anchor; statement location unresolved } { 4300:20CC }
  Exit; { 4300:2212 }
end; { routine anchor; statement location unresolved } { 4300:20CC }
```

### ov07:2215 ov07_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov07_init(); { 4300:2215 }
begin { routine anchor; statement location unresolved } { 4300:2215 }
  Exit; { 4300:2219 }
end; { routine anchor; statement location unresolved } { 4300:2215 }
```

### ov09:000F CheckPanic (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_13: array[0..14] of Byte [BP-$11]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_2637, FUN_4d00_0203, FUN_4d00_03e4, FUN_4d00_0545, FUN_4d00_0b3c, FUN_4d00_0f4f, ToggleMagic, FleeOrSurrender, ChooseEquipmentForCombat, System.@StrCopy, ov13_37E4, ov22_0C20, RollDice, ov25_06FB.

```pascal
procedure CheckPanic(param_1: LongWord); { 4D00:000F }
begin { routine anchor; statement location unresolved } { 4D00:000F }
  local_4 := ToggleMagic(Integer(param_1), Slice16(param_1, 2)); { 4D00:001C }
  ov25_06FB(); { 4D00:0022 }
  uVar2 := FUN_00ba_17e3(); { 4D00:0027 }
  if ((P_ShortInt((Integer(param_1) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
    begin { routine anchor; statement location unresolved } { 4D00:000F }
      uVar2 := FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 4D00:003D }
      local_4 := ShortInt(uVar2); { 4D00:0042 }
    end; { routine anchor; statement location unresolved } { 4D00:000F }
  local_3 := (P_Byte((Integer((P_LongWord((Integer(param_1) + $108)))^) + $15)))^; { 4D00:0051 }
  uVar3 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 4D00:000F }
  if (((local_3 = 0) or else (4 < local_3)) or else Sequence(RollDice(Pack16(uVar3, 4), Pack16(uVar3, 1)); (uVar3 := UNKNOWN_extraout_AH); (UNKNOWN_extraout_AL = 1))) then { 4D00:0066 }
    begin { routine anchor; statement location unresolved } { 4D00:000F }
      local_3 := RollDice(Pack16(uVar3, 8), Pack16(uVar3, 1)); { 4D00:0075 }
      if (local_3 = 8) then { routine anchor; statement location unresolved } { 4D00:000F }
        begin { routine anchor; statement location unresolved } { 4D00:000F }
          cVar1 := RollDice(2, 1); { 4D00:0089 }
          local_3 := (cVar1 + 4); { 4D00:0093 }
        end; { routine anchor; statement location unresolved } { 4D00:000F }
      else { routine anchor; statement location unresolved } { 4D00:000F }
        begin { routine anchor; statement location unresolved } { 4D00:000F }
          local_3 := RollDice(4, 1); { 4D00:009E }
        end; { routine anchor; statement location unresolved } { 4D00:000F }
    end; { routine anchor; statement location unresolved } { 4D00:000F }
  (P_Byte((Integer((P_LongWord((Integer(param_1) + $108)))^) + $15)))^ := local_3; { routine anchor; statement location unresolved } { 4D00:000F }
  if (local_4 = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
    begin { routine anchor; statement location unresolved } { 4D00:000F }
      local_4 := FleeOrSurrender(Integer(param_1), Slice16(param_1, 2)); { 4D00:00C2 }
    end; { routine anchor; statement location unresolved } { 4D00:000F }
  if (((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + $14)))^ <> 0) and then ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + $10)))^ = 0)) then { routine anchor; statement location unresolved } { 4D00:000F }
    begin { routine anchor; statement location unresolved } { 4D00:000F }
      puVar5 := local_13; { routine anchor; statement location unresolved } { 4D00:000F }
      uVar2 := SS; { routine anchor; statement location unresolved } { 4D00:000F }
      iVar6 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:000F }
      uVar7 := Slice16(param_1, 2); { routine anchor; statement location unresolved } { 4D00:000F }
      PString(local_13, SS) := 'flees in panic'; { 4D00:00F6 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 10), puVar5, uVar2, iVar6, uVar7); { 4D00:0101 }
    end; { routine anchor; statement location unresolved } { 4D00:000F }
  if (local_4 = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
    begin { routine anchor; statement location unresolved } { 4D00:000F }
      cVar1 := FUN_4d00_03e4(Integer(param_1), Slice16(param_1, 2)); { 4D00:0116 }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
        begin { routine anchor; statement location unresolved } { 4D00:000F }
          if ((P_ShortInt((P_LongWord((Integer(param_1) + $108)))^))^ = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
            begin { routine anchor; statement location unresolved } { 4D00:000F }
              cVar1 := FUN_4d00_0203(Integer(param_1), Slice16(param_1, 2)); { 4D00:0170 }
              if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
                begin { routine anchor; statement location unresolved } { 4D00:000F }
                  cVar1 := FUN_4d00_0545(Integer(param_1), Slice16(param_1, 2)); { 4D00:018E }
                  if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4D00:000F }
                    begin { routine anchor; statement location unresolved } { 4D00:000F }
                      ChooseEquipmentForCombat(Integer(param_1), Slice16(param_1, 2)); { 4D00:01A2 }
                      uVar2 := ToggleMagic(Integer(param_1), Slice16(param_1, 2)); { 4D00:01AC }
                      local_4 := ShortInt(uVar2); { 4D00:0128 }
                      while (local_4 = 0) do { routine anchor; statement location unresolved } { 4D00:000F }
                        begin { routine anchor; statement location unresolved } { 4D00:000F }
                          bVar4 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 4D00:000F }
                          cVar1 := ov13_37E4((Word(bVar4) shl 8), Pack16(bVar4, 1), Pack16(bVar4, $FF), Integer(param_1), Slice16(param_1, 2)); { 4D00:01C7 }
                          if ((cVar1 = 0) or else ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^ < 1)) then { routine anchor; statement location unresolved } { 4D00:000F }
                            begin { routine anchor; statement location unresolved } { 4D00:000F }
                              uVar2 := FUN_4d00_0f4f(Integer(param_1), Slice16(param_1, 2)); { 4D00:01F5 }
                              local_4 := ShortInt(uVar2); { 4D00:0163 }
                            end; { routine anchor; statement location unresolved } { 4D00:000F }
                          else { routine anchor; statement location unresolved } { 4D00:000F }
                            begin { routine anchor; statement location unresolved } { 4D00:000F }
                              uVar2 := FUN_4d00_0b3c(Integer(param_1), Slice16(param_1, 2)); { 4D00:01E6 }
                              local_4 := ShortInt(uVar2); { 4D00:0182 }
                            end; { routine anchor; statement location unresolved } { 4D00:000F }
                        end; { routine anchor; statement location unresolved } { 4D00:000F }
                    end; { routine anchor; statement location unresolved } { 4D00:000F }
                end; { routine anchor; statement location unresolved } { 4D00:000F }
              else { routine anchor; statement location unresolved } { 4D00:000F }
                begin { routine anchor; statement location unresolved } { 4D00:000F }
                  FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 4D00:0123 }
                end; { routine anchor; statement location unresolved } { 4D00:000F }
            end; { routine anchor; statement location unresolved } { 4D00:000F }
          else { routine anchor; statement location unresolved } { 4D00:000F }
            begin { routine anchor; statement location unresolved } { 4D00:000F }
              ov22_0C20(@(local_4), SS, 1, 1, (P_Byte((P_LongWord((Integer(param_1) + $108)))^))^); { 4D00:0153 }
              FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 4D00:015E }
            end; { routine anchor; statement location unresolved } { 4D00:000F }
        end; { routine anchor; statement location unresolved } { 4D00:000F }
      else { routine anchor; statement location unresolved } { 4D00:000F }
        begin { routine anchor; statement location unresolved } { 4D00:000F }
          FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 4D00:017D }
        end; { routine anchor; statement location unresolved } { 4D00:000F }
    end; { routine anchor; statement location unresolved } { 4D00:000F }
  Exit; { 4D00:0200 }
end; { routine anchor; statement location unresolved } { 4D00:000F }
```

### ov09:0203 FUN_4d00_0203 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_7: array[0..3] of Byte [BP-$5]; local_3: Byte [BP-$1].  
Callers: ov09_000F.  
Callees: TurnUndead, ov13_1351.

```pascal
function FUN_4d00_0203(param_1: LongWord): Byte; { 4D00:0203 }
begin { routine anchor; statement location unresolved } { 4D00:0203 }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:0203 }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:0203 }
  if ((((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + $11)))^ = 0) and then (0 < (P_ShortInt((iVar2 + $96)))^)) and then Sequence((cVar1 := ov13_1351(local_7, SS, iVar2, uVar3)); (cVar1 <> 0))) then { 4D00:022E }
    begin { routine anchor; statement location unresolved } { 4D00:0203 }
      local_3 := 1; { 4D00:0237 }
      TurnUndead(iVar2, uVar3); { 4D00:0241 }
      Exit(local_3); { 4D00:0252 }
    end; { routine anchor; statement location unresolved } { 4D00:0203 }
  Exit(0); { 4D00:0252 }
end; { routine anchor; statement location unresolved } { 4D00:0203 }
```

### ov09:0255 FUN_4d00_0255 (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Byte [BP+$08]; param_3: Byte [BP+$0A]; param_4: Byte [BP+$0C].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: FUN_4d00_02eb.  
Callees: FUN_00ba_23b7, ov30_0909.

```pascal
function FUN_4d00_0255(param_1: Word; param_2: Byte; param_3: Byte; param_4: Byte): Word; { 4D00:0255 }
begin { routine anchor; statement location unresolved } { 4D00:0255 }
  local_3 := 0; { 4D00:025B }
  ov30_0909(Word(g_6716), Slice16(g_6716, 2), 1, $FF, (P_Byte(((Word(param_2) * $10) + $3209)))^, param_3, param_4); { 4D00:0287 }
  bVar2 := g_671A; { routine anchor; statement location unresolved } { 4D00:0255 }
  uVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4D00:0255 }
  if (g_671A <> 0) then { routine anchor; statement location unresolved } { 4D00:0255 }
    begin { routine anchor; statement location unresolved } { 4D00:0255 }
      local_4 := 1; { 4D00:0299 }
      while true do { routine anchor; statement location unresolved } { 4D00:0255 }
        begin { routine anchor; statement location unresolved } { 4D00:0255 }
          cVar3 := FUN_00ba_23b7(g_5D92, g_5D94); { 4D00:02A9 }
          uVar1 := (P_LongWord(((Word((P_Byte(((Integer(P_LongWord(@(g_6716))) + (Word(local_4) * 3)) + 2)))^) * 4) + $65B9)))^; { routine anchor; statement location unresolved } { 4D00:0255 }
          if ((P_ShortInt((Integer(uVar1) + $10E)))^ <> cVar3) then { routine anchor; statement location unresolved } { 4D00:0255 }
            begin { routine anchor; statement location unresolved } { 4D00:0255 }
              local_3 := 1; { 4D00:02D6 }
            end; { routine anchor; statement location unresolved } { 4D00:0255 }
          uVar4 := 0; { routine anchor; statement location unresolved } { 4D00:0255 }
          if (local_4 = bVar2) then { routine anchor; statement location unresolved } { 4D00:0255 }
            Break; { routine anchor; statement location unresolved } { 4D00:0255 }
          local_4 := (local_4 + 1); { 4D00:029E }
        end; { routine anchor; statement location unresolved } { 4D00:0255 }
    end; { routine anchor; statement location unresolved } { 4D00:0255 }
  Exit(Pack16(uVar4, local_3)); { 4D00:02E8 }
end; { routine anchor; statement location unresolved } { 4D00:0255 }
```

### ov09:02EB FUN_4d00_02eb (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Byte [BP+$08]; param_3: Word [BP+$0A]; param_4: Word [BP+$0C].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_9: Byte [BP-$7]; local_7: array[0..3] of Byte [BP-$5]; local_3: Byte [BP-$1].  
Callers: FUN_4d00_03e4,FUN_4d00_0545.  
Callees: FUN_00ba_2433, FUN_4d00_0255, ov13_1BF8, ov22_0729.

```pascal
function FUN_4d00_02eb(param_1: Byte; param_2: Byte; param_3: Word; param_4: Word): Byte; { 4D00:02EB }
begin { routine anchor; statement location unresolved } { 4D00:02EB }
  local_3 := 0; { 4D00:02F1 }
  if (param_1 <= (P_Byte(((Word(param_2) * $10) + $3207)))^) then { routine anchor; statement location unresolved } { 4D00:02EB }
    begin { routine anchor; statement location unresolved } { 4D00:02EB }
      if (((param_2 = 3) or else ((P_ShortInt(((Word(param_2) * $10) + $3208)))^ <> 0)) and then ((param_2 <> 3) or else Sequence((cVar1 := ov13_1BF8(local_7, SS, param_3, param_4)); (cVar1 = 0)))) then { 4D00:0335 }
        begin { routine anchor; statement location unresolved } { 4D00:02EB }
          uVar3 := ov22_0729(param_2); { 4D00:034F }
          bVar2 := FUN_00ba_2433(uVar3, param_3, param_4); { 4D00:0355 }
          if (bVar2 <> 0) then { routine anchor; statement location unresolved } { 4D00:02EB }
            begin { routine anchor; statement location unresolved } { 4D00:02EB }
              if ((P_ShortInt(((Word(param_2) * $10) + $3209)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:02EB }
                begin { routine anchor; statement location unresolved } { 4D00:02EB }
                  local_3 := 1; { 4D00:033E }
                end; { routine anchor; statement location unresolved } { 4D00:02EB }
              else { routine anchor; statement location unresolved } { 4D00:02EB }
                if (bVar2 = 0) then { routine anchor; statement location unresolved } { 4D00:02EB }
                  begin { routine anchor; statement location unresolved } { 4D00:02EB }
                    LAB_4d00_03d7: { routine anchor; statement location unresolved } { 4D00:02EB }
                    local_3 := 1; { 4D00:0375 }
                  end; { routine anchor; statement location unresolved } { 4D00:02EB }
                else { routine anchor; statement location unresolved } { 4D00:02EB }
                  begin { routine anchor; statement location unresolved } { 4D00:02EB }
                    local_9 := 1; { 4D00:0388 }
                    while true do { routine anchor; statement location unresolved } { 4D00:02EB }
                      begin { routine anchor; statement location unresolved } { 4D00:02EB }
                        cVar1 := FUN_4d00_0255(@(stack0xfffe), param_2, (P_Byte(((Word((P_Byte((local_9 + $6DE4)))^) * 4) + $5F28)))^, (P_Byte(((Word((P_Byte((local_9 + $6DE4)))^) * 4) + $5F27)))^); { 4D00:03C6 }
                        if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 4D00:02EB }
                          Break; { routine anchor; statement location unresolved } { 4D00:02EB }
                        if (local_9 = bVar2) then { routine anchor; statement location unresolved } { 4D00:02EB }
                          goto LAB_4d00_03d7; { routine anchor; statement location unresolved } { 4D00:02EB }
                        local_9 := (local_9 + 1); { 4D00:038D }
                      end; { routine anchor; statement location unresolved } { 4D00:02EB }
                  end; { routine anchor; statement location unresolved } { 4D00:02EB }
            end; { routine anchor; statement location unresolved } { 4D00:02EB }
        end; { routine anchor; statement location unresolved } { 4D00:02EB }
      else { routine anchor; statement location unresolved } { 4D00:02EB }
        begin { routine anchor; statement location unresolved } { 4D00:02EB }
          local_3 := 1; { 4D00:03D7 }
        end; { routine anchor; statement location unresolved } { 4D00:02EB }
    end; { routine anchor; statement location unresolved } { 4D00:02EB }
  Exit(local_3); { 4D00:03E1 }
end; { routine anchor; statement location unresolved } { 4D00:02EB }
```

### ov09:03E4 FUN_4d00_03e4 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_17: Byte [BP-$15]; local_16: Integer [BP-$14]; local_14: Integer [BP-$12]; local_12: Integer [BP-$10]; iStack_10: Integer [BP-$E]; local_a: Byte [BP-$8]; local_9: Byte [BP-$7]; local_6: ShortInt [BP-$4]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers: ov09_000F.  
Callees: FUN_00ba_23b7, FUN_4d00_02eb, UseItem, ov22_323D, RollDice.

```pascal
function FUN_4d00_03e4(param_1: LongWord): Word; { 4D00:03E4 }
begin { routine anchor; statement location unresolved } { 4D00:03E4 }
  local_3 := 0; { 4D00:03EA }
  local_16 := 0; { 4D00:03F0 }
  local_14 := 0; { 4D00:03F3 }
  local_4 := 7; { 4D00:03F6 }
  local_5 := RollDice(7, 1); { 4D00:0400 }
  uVar5 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:03E4 }
  iVar4 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:03E4 }
  if (((((P_ShortInt((Integer((P_LongWord((iVar4 + $108)))^) + 2)))^ <> 0) and then Sequence((cVar2 := FUN_00ba_23b7(iVar4, uVar5)); (cVar1 := local_5); (P_Byte(@(g_6814))[cVar2] <> 0))) and then ((P_Integer((Integer(g_49D2) + $1CA)))^ = 0)) and then (local_5 <> 0)) then { 4D00:0420 }
    begin { routine anchor; statement location unresolved } { 4D00:03E4 }
      local_6 := 1; { 4D00:0451 }
      while true do { routine anchor; statement location unresolved } { 4D00:03E4 }
        begin { routine anchor; statement location unresolved } { 4D00:03E4 }
          _local_12 := FarBits((P_Word((iVar4 + $CA)))^, (P_Word((iVar4 + 200)))^); { routine anchor; statement location unresolved } { 4D00:03E4 }
          while true do { routine anchor; statement location unresolved } { 4D00:03E4 }
            begin { routine anchor; statement location unresolved } { 4D00:03E4 }
              if (((local_12 = 0) and then (iStack_10 = 0)) or else ((local_16 <> 0) or else (local_14 <> 0))) then { routine anchor; statement location unresolved } { 4D00:03E4 }
                Break; { routine anchor; statement location unresolved } { 4D00:03E4 }
              local_a := (P_Byte((local_12 + $3D)))^; { 4D00:0489 }
              local_9 := (P_Byte(((Word((P_Byte((local_12 + $2E)))^) * $10) + $5582)))^; { 4D00:049F }
              cVar2 := ov22_323D(local_12, iStack_10); { 4D00:04A8 }
              if (cVar2 = 0) then { routine anchor; statement location unresolved } { 4D00:03E4 }
                begin { routine anchor; statement location unresolved } { 4D00:03E4 }
                  uVar6 := Word((LongWord(_local_12) shr $10)); { routine anchor; statement location unresolved } { 4D00:03E4 }
                  if ((((P_Byte((Integer(_local_12) + $3E)))^ < $80) and then ((P_ShortInt((Integer(_local_12) + $34)))^ <> 0)) and then (local_a <> 0)) then { routine anchor; statement location unresolved } { 4D00:03E4 }
                    begin { routine anchor; statement location unresolved } { 4D00:03E4 }
                      if ($38 < local_a) then { routine anchor; statement location unresolved } { 4D00:03E4 }
                        begin { routine anchor; statement location unresolved } { 4D00:03E4 }
                          local_a := (local_a - $17); { 4D00:04D9 }
                        end; { routine anchor; statement location unresolved } { 4D00:03E4 }
                      cVar2 := FUN_4d00_02eb(local_4, local_a, iVar4, uVar5); { 4D00:04EB }
                      if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 4D00:03E4 }
                        begin { routine anchor; statement location unresolved } { 4D00:03E4 }
                          local_16 := local_12; { 4D00:04F8 }
                          local_14 := iStack_10; { 4D00:04FB }
                        end; { routine anchor; statement location unresolved } { 4D00:03E4 }
                    end; { routine anchor; statement location unresolved } { 4D00:03E4 }
                end; { routine anchor; statement location unresolved } { 4D00:03E4 }
              uVar6 := Word((LongWord(_local_12) shr $10)); { routine anchor; statement location unresolved } { 4D00:03E4 }
              _local_12 := FarBits((P_Word((Integer(_local_12) + $2C)))^, (P_Word((Integer(_local_12) + $2A)))^); { routine anchor; statement location unresolved } { 4D00:03E4 }
            end; { routine anchor; statement location unresolved } { 4D00:03E4 }
          local_4 := (local_4 + -(1)); { 4D00:0512 }
          if (local_6 = cVar1) then { routine anchor; statement location unresolved } { 4D00:03E4 }
            Break; { routine anchor; statement location unresolved } { 4D00:03E4 }
          local_6 := (local_6 + 1); { 4D00:0456 }
        end; { routine anchor; statement location unresolved } { 4D00:03E4 }
    end; { routine anchor; statement location unresolved } { 4D00:03E4 }
  uVar3 := 0; { routine anchor; statement location unresolved } { 4D00:03E4 }
  if ((local_16 <> 0) or else (local_14 <> 0)) then { routine anchor; statement location unresolved } { 4D00:03E4 }
    begin { routine anchor; statement location unresolved } { 4D00:03E4 }
      UseItem(@(local_17), SS, local_16, local_14); { 4D00:0533 }
      local_3 := 1; { 4D00:0538 }
      uVar3 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4D00:03E4 }
    end; { routine anchor; statement location unresolved } { 4D00:03E4 }
  Exit(Pack16(uVar3, local_3)); { 4D00:0542 }
end; { routine anchor; statement location unresolved } { 4D00:03E4 }
```

### ov09:0545 FUN_4d00_0545 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_25: ShortInt [BP-$23]; local_23: Byte [BP-$21]; local_22: Byte [BP-$20]; local_21: Byte [BP-$1F]; local_20: Byte [BP-$1E]; local_1f: Byte [BP-$1D]; local_1e: Byte [BP-$1C]; local_1d: ShortInt [BP-$1B]; acStack_18: array[0..21] of ShortInt [BP-$16].  
Callers: ov09_000F.  
Callees: FUN_00ba_23b7, FUN_4d00_02eb, BeginCasting, RollDice.

```pascal
function FUN_4d00_0545(param_1: LongWord): Word; { 4D00:0545 }
begin { routine anchor; statement location unresolved } { 4D00:0545 }
  uVar4 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 4D00:0545 }
  local_22 := 0; { 4D00:054B }
  uVar6 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:0545 }
  iVar5 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:0545 }
  if ((P_ShortInt((Integer((P_LongWord((iVar5 + $108)))^) + 1)))^ <> 0) then { routine anchor; statement location unresolved } { 4D00:0545 }
    begin { routine anchor; statement location unresolved } { 4D00:0545 }
      local_23 := 0; { 4D00:055E }
      while true do { routine anchor; statement location unresolved } { 4D00:0545 }
        begin { routine anchor; statement location unresolved } { 4D00:0545 }
          if ((P_ShortInt(((iVar5 + Word(local_23)) + $17)))^ <> 0) then { routine anchor; statement location unresolved } { 4D00:0545 }
            begin { routine anchor; statement location unresolved } { 4D00:0545 }
              acStack_18[local_22] := (P_ShortInt(((iVar5 + Word(local_23)) + $17)))^; { routine anchor; statement location unresolved } { 4D00:0545 }
              local_22 := (local_22 + 1); { 4D00:0590 }
            end; { routine anchor; statement location unresolved } { 4D00:0545 }
          uVar4 := 0; { routine anchor; statement location unresolved } { 4D00:0545 }
          if (local_23 = $14) then { routine anchor; statement location unresolved } { 4D00:0545 }
            Break; { routine anchor; statement location unresolved } { 4D00:0545 }
          local_23 := (local_23 + 1); { 4D00:0564 }
        end; { routine anchor; statement location unresolved } { 4D00:0545 }
    end; { routine anchor; statement location unresolved } { 4D00:0545 }
  local_25 := 0; { 4D00:0599 }
  local_1d := 7; { 4D00:059D }
  iVar2 := RollDice(Pack16(uVar4, 7), Pack16(uVar4, 1)); { 4D00:05A7 }
  local_1e := Byte(iVar2); { 4D00:05AC }
  local_20 := 1; { 4D00:05AF }
  if ((local_22 <> 0) and then (($7F < (P_Byte((iVar5 + $84)))^) or else (g_6E30 <> 0))) then { routine anchor; statement location unresolved } { 4D00:0545 }
    begin { routine anchor; statement location unresolved } { 4D00:0545 }
      cVar1 := FUN_00ba_23b7(iVar5, uVar6); { 4D00:05D4 }
      iVar2 := Integer(cVar1); { routine anchor; statement location unresolved } { 4D00:0545 }
      if (P_Byte(@(g_6814))[iVar2] <> 0) then { routine anchor; statement location unresolved } { 4D00:0545 }
        begin { routine anchor; statement location unresolved } { 4D00:0545 }
          while Sequence((iVar2 := Pack16(ShortInt((Word(iVar2) shr 8)), local_20)); ((local_20 <= local_1e) and then (local_25 = 0))) do { routine anchor; statement location unresolved } { 4D00:0545 }
            begin { routine anchor; statement location unresolved } { 4D00:0545 }
              local_21 := 1; { 4D00:05F1 }
              while ((local_21 < 4) and then (local_25 = 0)) do { routine anchor; statement location unresolved } { 4D00:0545 }
                begin { routine anchor; statement location unresolved } { 4D00:0545 }
                  uVar3 := RollDice(local_22, 1); { 4D00:0608 }
                  cVar1 := acStack_18[(((uVar3 and $FF) - 1) and $FF)]; { routine anchor; statement location unresolved } { 4D00:0545 }
                  iVar2 := FUN_4d00_02eb(local_1d, cVar1, iVar5, uVar6); { 4D00:062F }
                  if (ShortInt(iVar2) <> 0) then { routine anchor; statement location unresolved } { 4D00:0545 }
                    begin { routine anchor; statement location unresolved } { 4D00:0545 }
                      iVar2 := Pack16(ShortInt((Word(iVar2) shr 8)), cVar1); { routine anchor; statement location unresolved } { 4D00:0545 }
                      local_25 := cVar1; { 4D00:0639 }
                    end; { routine anchor; statement location unresolved } { 4D00:0545 }
                  local_21 := (local_21 + 1); { 4D00:063C }
                end; { routine anchor; statement location unresolved } { 4D00:0545 }
              local_1d := (local_1d + -(1)); { 4D00:0641 }
              local_20 := (local_20 + 1); { 4D00:0644 }
            end; { routine anchor; statement location unresolved } { 4D00:0545 }
        end; { routine anchor; statement location unresolved } { 4D00:0545 }
    end; { routine anchor; statement location unresolved } { 4D00:0545 }
  uVar4 := Byte((Word(iVar2) shr 8)); { routine anchor; statement location unresolved } { 4D00:0545 }
  if (local_25 = 0) then { routine anchor; statement location unresolved } { 4D00:0545 }
    begin { routine anchor; statement location unresolved } { 4D00:0545 }
      local_1f := 0; { 4D00:0662 }
    end; { routine anchor; statement location unresolved } { 4D00:0545 }
  else { routine anchor; statement location unresolved } { 4D00:0545 }
    begin { routine anchor; statement location unresolved } { 4D00:0545 }
      BeginCasting(@(local_1f), SS, Pack16(uVar4, 1), Pack16(uVar4, local_25)); { 4D00:065B }
      uVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4D00:0545 }
    end; { routine anchor; statement location unresolved } { 4D00:0545 }
  Exit(Pack16(uVar4, local_1f)); { 4D00:0672 }
end; { routine anchor; statement location unresolved } { 4D00:0545 }
```

### ov09:0675 FUN_4d00_0675 (conf L)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: Byte [BP+$0A]; param_3: Byte [BP+$0C]; param_4: LongWord [BP+$0E].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_c: Byte [BP-$A]; local_b: Byte [BP-$9]; local_a: ShortInt [BP-$8]; local_9: Byte [BP-$7]; local_8: Byte [BP-$6]; local_7: array[0..3] of Byte [BP-$5]; local_3: Byte [BP-$1].  
Callers: FUN_4d00_07f2.  
Callees: FUN_00ba_2199, ov31_0CB9.

```pascal
function FUN_4d00_0675(param_1: P_Byte; param_2: Byte; param_3: Byte; param_4: LongWord): Word; { 4D00:0675 }
begin { routine anchor; statement location unresolved } { 4D00:0675 }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 4D00:0675 }
  local_3 := 0; { 4D00:0682 }
  uVar5 := Word((LongWord(param_4) shr $10)); { routine anchor; statement location unresolved } { 4D00:0675 }
  iVar4 := Integer(param_4); { routine anchor; statement location unresolved } { 4D00:0675 }
  local_8 := (P_Byte((((Word((P_Byte((Integer((P_LongWord((iVar4 + $108)))^) + $15)))^) * 5) + Word(param_3)) + $2AE)))^; { 4D00:06AB }
  uVar3 := ((Word(param_2) + Word(local_8)) mod 8); { routine anchor; statement location unresolved } { 4D00:0675 }
  local_9 := Byte(uVar3); { 4D00:06C3 }
  ov31_0CB9(@(local_b), SS, @(local_a), SS, uVar3, iVar4, uVar5); { 4D00:06DA }
  uVar2 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 4D00:0675 }
  if (local_b = 0) then { routine anchor; statement location unresolved } { 4D00:0675 }
    begin { routine anchor; statement location unresolved } { 4D00:0675 }
      (param_1)^ := 1; { routine anchor; statement location unresolved } { 4D00:0675 }
    end; { routine anchor; statement location unresolved } { 4D00:0675 }
  else { routine anchor; statement location unresolved } { 4D00:0675 }
    if ((local_a = 0) and then Sequence((uVar2 := 0); ((P_Byte(((Word(local_b) * 4) + $2744)))^ < (P_Byte((Integer((P_LongWord((iVar4 + $108)))^) + 6)))^))) then { routine anchor; statement location unresolved } { 4D00:0675 }
      begin { routine anchor; statement location unresolved } { 4D00:0675 }
        local_c := 2; { 4D00:0718 }
        if Boolean((local_9 and 1)) then { routine anchor; statement location unresolved } { 4D00:0675 }
          begin { routine anchor; statement location unresolved } { 4D00:0675 }
            local_c := 3; { 4D00:0723 }
          end; { routine anchor; statement location unresolved } { 4D00:0675 }
        iVar1 := (Word(local_c) * Word((P_Byte(((Word(local_b) * 4) + $2744)))^)); { routine anchor; statement location unresolved } { 4D00:0675 }
        local_c := Byte(iVar1); { 4D00:0741 }
        if (local_b = $1E) then { routine anchor; statement location unresolved } { 4D00:0675 }
          begin { routine anchor; statement location unresolved } { 4D00:0675 }
            iVar1 := FUN_00ba_2199(local_7, SS, Pack16(ShortInt((Word(iVar1) shr 8)), $20), iVar4, uVar5); { 4D00:0758 }
            if (ShortInt(iVar1) = 0) then { routine anchor; statement location unresolved } { 4D00:0675 }
              begin { routine anchor; statement location unresolved } { 4D00:0675 }
                iVar1 := FUN_00ba_2199(local_7, SS, $1E, iVar4, uVar5); { 4D00:076F }
                if (ShortInt(iVar1) = 0) then { routine anchor; statement location unresolved } { 4D00:0675 }
                  begin { routine anchor; statement location unresolved } { 4D00:0675 }
                    iVar1 := FUN_00ba_2199(local_7, SS, $6F, iVar4, uVar5); { 4D00:0786 }
                    if ((ShortInt(iVar1) = 0) and then Sequence((iVar1 := FUN_00ba_2199(local_7, SS, $7D, iVar4, uVar5)); (ShortInt(iVar1) = 0))) then { 4D00:079D }
                      begin { routine anchor; statement location unresolved } { 4D00:0675 }
                        iVar1 := ((P_Byte((Integer((P_LongWord((iVar4 + $108)))^) + 6)))^ + 1); { routine anchor; statement location unresolved } { 4D00:0675 }
                        local_c := Byte(iVar1); { 4D00:07B5 }
                      end; { routine anchor; statement location unresolved } { 4D00:0675 }
                  end; { routine anchor; statement location unresolved } { 4D00:0675 }
              end; { routine anchor; statement location unresolved } { 4D00:0675 }
          end; { routine anchor; statement location unresolved } { 4D00:0675 }
        uVar2 := Byte((Word(iVar1) shr 8)); { routine anchor; statement location unresolved } { 4D00:0675 }
        if (local_c <= (P_Byte((Integer((P_LongWord((iVar4 + $108)))^) + 6)))^) then { routine anchor; statement location unresolved } { 4D00:0675 }
          begin { routine anchor; statement location unresolved } { 4D00:0675 }
            local_3 := 1; { 4D00:07C9 }
          end; { routine anchor; statement location unresolved } { 4D00:0675 }
      end; { routine anchor; statement location unresolved } { 4D00:0675 }
  Exit(Pack16(uVar2, local_3)); { 4D00:07D3 }
end; { routine anchor; statement location unresolved } { 4D00:0675 }
```

### ov09:07F2 MoveAttackCommand (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; iVar9: Integer [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; puVar12: P_Byte [compiler temporary; no proven BP slot]; puVar13: P_Byte [compiler temporary; no proven BP slot]; uVar14: Word [compiler temporary; no proven BP slot]; local_207: array[0..255] of Byte [BP-$205]; local_107: array[0..255] of Byte [BP-$105]; local_7: ShortInt [BP-$5]; local_6: ShortInt [BP-$4]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: FUN_4d00_0b3c.  
Callees: FUN_00ba_1037, FUN_00ba_2637, FUN_0709_0626, FUN_4d00_0675, FUN_4d00_0f4f, ToggleMagic, System.@StrAppend, System.@StrCopy, ov13_0712, ov13_08B2, AttemptEscape, ov13_263D, ov13_37E4, CoughOrNausea, RollDice, ov31_0AF8.

```pascal
procedure MoveAttackCommand(param_1: LongWord); { 4D00:07F2 }
begin { routine anchor; statement location unresolved } { 4D00:07F2 }
  uVar7 := (UNKNOWN_in_AX and $FF00); { routine anchor; statement location unresolved } { 4D00:07F2 }
  uVar3 := $18; { routine anchor; statement location unresolved } { 4D00:07F2 }
  uVar4 := 10; { routine anchor; statement location unresolved } { 4D00:07F2 }
  puVar13 := local_207; { routine anchor; statement location unresolved } { 4D00:07F2 }
  uVar14 := SS; { routine anchor; statement location unresolved } { 4D00:07F2 }
  PString(BP+65019, SS) := 'Move/Attack, Move Left = '; { 4D00:080D }
  puVar12 := local_107; { routine anchor; statement location unresolved } { 4D00:07F2 }
  uVar10 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:07F2 }
  iVar8 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:07F2 }
  uVar11 := SS; { routine anchor; statement location unresolved } { 4D00:07F2 }
  FUN_00ba_1037(((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ shr 1)); { 4D00:0829 }
  PString(BP+65019, SS) := Copy(PString(BP+65019, SS) + PString(puVar12, uVar11), 1, 255); { 4D00:082E }
  PString(BP+65019, SS) := Copy(PString(BP+65019, SS) + ' ', 1, 255); { 4D00:0838 }
  FUN_0709_0626(puVar13, uVar14, uVar4, uVar3, uVar7); { 4D00:083D }
  cVar1 := ToggleMagic(iVar8, uVar10); { 4D00:0849 }
  if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
    begin { routine anchor; statement location unresolved } { 4D00:07F2 }
      if (((((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ shr 1) = 0) or else ((P_ShortInt((Integer((P_LongWord((iVar8 + $108)))^) + 3)))^ < 1)) or else (((P_ShortInt((Integer((P_LongWord((iVar8 + $108)))^) + $14)))^ = 0) and then ((P_ShortInt((iVar8 + $2F)))^ = 5))) then { routine anchor; statement location unresolved } { 4D00:07F2 }
        begin { routine anchor; statement location unresolved } { 4D00:07F2 }
          FUN_4d00_0f4f(iVar8, uVar10); { 4D00:0A82 }
        end; { routine anchor; statement location unresolved } { 4D00:07F2 }
      else { routine anchor; statement location unresolved } { 4D00:07F2 }
        begin { routine anchor; statement location unresolved } { 4D00:07F2 }
          if ((P_ShortInt((Integer((P_LongWord((iVar8 + $108)))^) + $14)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
              uVar11 := Word((LongWord((P_LongWord((iVar8 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 4D00:07F2 }
              iVar9 := Integer((P_LongWord((iVar8 + $108)))^); { routine anchor; statement location unresolved } { 4D00:07F2 }
              local_3 := ov13_263D((P_Word((iVar9 + 10)))^, (P_Word((iVar9 + $C)))^, iVar8, uVar10); { 4D00:08BD }
            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
          else { routine anchor; statement location unresolved } { 4D00:07F2 }
            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
              uVar2 := RollDice(2, 1); { 4D00:08CD }
              (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $15)))^ := uVar2; { routine anchor; statement location unresolved } { 4D00:07F2 }
              local_3 := Byte((Word(g_6AAF) - (((g_6AAF + 2) mod 4) shr 1))); { 4D00:08F7 }
              if ((P_ShortInt((iVar8 + $10E)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  local_3 := (local_3 + 4); { 4D00:090D }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
              local_3 := (local_3 mod 8); { 4D00:091C }
            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
          local_6 := 0; { 4D00:091F }
          local_7 := 0; { 4D00:0923 }
          local_5 := 1; { 4D00:0927 }
          while (((local_5 < 6) and then (local_7 = 0)) and then Sequence((cVar1 := FUN_4d00_0675(@(local_6), SS, local_3, local_5, iVar8, uVar10)); (cVar1 = 0))) do { 4D00:094B }
            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
              if (((P_ShortInt((Integer((P_LongWord((iVar8 + $108)))^) + $14)))^ = 0) or else (local_6 = 0)) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  local_5 := (local_5 + 1); { 4D00:0977 }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
              else { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  local_7 := AttemptEscape(iVar8, uVar10); { 4D00:096D }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
          if (local_7 = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
              uVar7 := ((Word(local_3) + Word((P_Byte((((Word((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $15)))^) * 5) + Word(local_5)) + $2AE)))^)) mod 8); { routine anchor; statement location unresolved } { 4D00:07F2 }
              local_4 := Byte(uVar7); { 4D00:09E4 }
              if ((local_5 = 6) or else Sequence((uVar5 := Word(g_443C)); (uVar5 = ((uVar7 + 4) mod 8)))) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  g_443D := (g_443D + 1); { 4D00:0A0A }
                  uVar5 := ((Word((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $15)))^) mod 6) + 1); { routine anchor; statement location unresolved } { 4D00:07F2 }
                  (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $15)))^ := ShortInt(uVar5); { routine anchor; statement location unresolved } { 4D00:07F2 }
                  if (1 < g_443D) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                    begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                      uVar11 := Word((LongWord((P_LongWord((iVar8 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 4D00:07F2 }
                      iVar9 := Integer((P_LongWord((iVar8 + $108)))^); { routine anchor; statement location unresolved } { 4D00:07F2 }
                      uVar5 := 0; { routine anchor; statement location unresolved } { 4D00:07F2 }
                      (P_Word((iVar9 + 10)))^ := 0; { routine anchor; statement location unresolved } { 4D00:07F2 }
                      (P_Word((iVar9 + $C)))^ := 0; { routine anchor; statement location unresolved } { 4D00:07F2 }
                      if (g_443D < 3) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                        begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                          uVar5 := ov13_37E4(0, 1, $FF, iVar8, uVar10); { 4D00:0A72 }
                          if (ShortInt(uVar5) = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                              uVar5 := FUN_4d00_0f4f(iVar8, uVar10); { 4D00:0B30 }
                              local_7 := ShortInt(uVar5); { 4D00:09A7 }
                            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
                        end; { routine anchor; statement location unresolved } { 4D00:07F2 }
                      else { routine anchor; statement location unresolved } { 4D00:07F2 }
                        begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                          (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ := 0; { routine anchor; statement location unresolved } { 4D00:07F2 }
                          local_7 := 1; { 4D00:0A5D }
                        end; { routine anchor; statement location unresolved } { 4D00:07F2 }
                    end; { routine anchor; statement location unresolved } { 4D00:07F2 }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
              if (local_5 < 6) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  uVar5 := Pack16(ShortInt((uVar5 shr 8)), local_4); { routine anchor; statement location unresolved } { 4D00:07F2 }
                  g_443C := local_4; { 4D00:0A91 }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
              else { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  local_7 := 1; { 4D00:0A85 }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
          else { routine anchor; statement location unresolved } { 4D00:07F2 }
            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
              (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ := 0; { routine anchor; statement location unresolved } { 4D00:07F2 }
              (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $14)))^ := 0; { routine anchor; statement location unresolved } { 4D00:07F2 }
              uVar5 := FUN_00ba_2637(iVar8, uVar10); { 4D00:09A2 }
              local_7 := ShortInt(uVar5); { 4D00:0A96 }
            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
          if (local_7 = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
            begin { routine anchor; statement location unresolved } { 4D00:07F2 }
              bVar6 := Byte((uVar5 shr 8)); { routine anchor; statement location unresolved } { 4D00:07F2 }
              ov31_0AF8((Word(bVar6) shl 8), (Word(bVar6) shl 8), Pack16(bVar6, local_4), iVar8, uVar10); { 4D00:0AB3 }
              ov13_08B2(Pack16(UNKNOWN_extraout_AH, (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 9)))^), iVar8, uVar10); { 4D00:0ACB }
              if ((P_ShortInt((iVar8 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  FUN_00ba_2637(iVar8, uVar10); { 4D00:0AE1 }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
              else { routine anchor; statement location unresolved } { 4D00:07F2 }
                begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                  ov13_0712(Pack16(UNKNOWN_extraout_AH_00, (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 9)))^), iVar8, uVar10); { 4D00:0AFE }
                  if ((P_ShortInt((iVar8 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:07F2 }
                    begin { routine anchor; statement location unresolved } { 4D00:07F2 }
                      local_7 := FUN_00ba_2637(iVar8, uVar10); { 4D00:0B14 }
                    end; { routine anchor; statement location unresolved } { 4D00:07F2 }
                  CoughOrNausea(iVar8, uVar10); { 4D00:0B22 }
                end; { routine anchor; statement location unresolved } { 4D00:07F2 }
            end; { routine anchor; statement location unresolved } { 4D00:07F2 }
        end; { routine anchor; statement location unresolved } { 4D00:07F2 }
    end; { routine anchor; statement location unresolved } { 4D00:07F2 }
  Exit; { 4D00:0B39 }
end; { routine anchor; statement location unresolved } { 4D00:07F2 }
```

### ov09:0B3C FUN_4d00_0b3c (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; local_16: Byte [BP-$14]; local_15: Byte [BP-$13]; local_14: Byte [BP-$12]; local_13: LongWord [BP-$11]; local_f: Word [BP-$D]; local_d: Word [BP-$B]; local_b: Byte [BP-$9]; local_a: ShortInt [BP-$8]; local_9: Word [BP-$7]; local_7: Byte [BP-$5]; local_6: ShortInt [BP-$4]; local_5: ShortInt [BP-$3]; local_4: array[0..1] of ShortInt [BP-$2].  
Callers: ov09_000F.  
Callees: FUN_00ba_2433, FUN_00ba_255b, FUN_00ba_2637, FUN_00ba_2e03, FUN_00ba_2e46, FUN_00ba_2e8b, MoveAttackCommand, FUN_4d00_0f4f, ChooseEquipmentForCombat, SweepAttack, ov13_1085, ov13_17F6, ov13_1884, ov13_263D, ov13_37E4, VisitEffectHooks, RollDice, ov30_0422, ov31_0996, ov31_0BE7, ov31_0C0F.

```pascal
function FUN_4d00_0b3c(param_1: LongWord): Word; { 4D00:0B3C }
begin { routine anchor; statement location unresolved } { 4D00:0B3C }
  g_443C := 8; { 4D00:0B42 }
  g_443D := 0; { 4D00:0B47 }
  g_443E := 0; { 4D00:0B4C }
  local_16 := 0; { 4D00:0B51 }
  local_6 := 1; { 4D00:0B55 }
  local_4[0] := 0; { routine anchor; statement location unresolved } { 4D00:0B3C }
  uVar2 := VisitEffectHooks(Integer(param_1), Slice16(param_1, 2), $E); { 4D00:0B66 }
  if ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
    begin { routine anchor; statement location unresolved } { 4D00:0B3C }
      local_6 := 0; { 4D00:0B7A }
    end; { routine anchor; statement location unresolved } { 4D00:0B3C }
  repeat { routine anchor; statement location unresolved } { 4D00:0B3C }
    begin { routine anchor; statement location unresolved } { 4D00:0B3C }
      repeat { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          if ((local_4[0] <> 0) or else (local_6 = 0)) then { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              uVar2 := (uVar2 and $FF00); { routine anchor; statement location unresolved } { 4D00:0B3C }
              if (local_6 = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  uVar2 := (uVar2 + 1); { routine anchor; statement location unresolved } { 4D00:0B3C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
              Exit(uVar2); { 4D00:0F4C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
          if ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + $14)))^ <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              while ((((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 6)))^ <> 0) and then (0 < (P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^)) and then ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^ < 20)) do { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  uVar2 := MoveAttackCommand(Integer(param_1), Slice16(param_1, 2)); { 4D00:0BD3 }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
          if (((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^ = 0) or else ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^ = 20)) then { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              local_6 := 0; { 4D00:0BF6 }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
          else { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              local_4[0] := 0; { routine anchor; statement location unresolved } { 4D00:0B3C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      until not (((local_4[0] <> 0) or else (local_6 = 0))); { routine anchor; statement location unresolved } { 4D00:0B3C }
      local_16 := (local_16 + 1); { 4D00:0C12 }
      if ($14 < local_16) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          local_4[0] := 1; { routine anchor; statement location unresolved } { 4D00:0B3C }
          cVar1 := FUN_4d00_0f4f(Integer(param_1), Slice16(param_1, 2)); { 4D00:0C26 }
          local_6 := (cVar1 = 0); { 4D00:0C30 }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      local_5 := 0; { 4D00:0C33 }
      local_7 := 1; { 4D00:0C37 }
      if (((P_Integer((Integer(param_1) + $CC)))^ <> 0) or else ((P_Integer((Integer(param_1) + $CE)))^ <> 0)) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          local_7 := ((P_ShortInt(((Word((P_Byte((Integer((P_LongWord((Integer(param_1) + $CC)))^) + $2E)))^) * $10) + $558E)))^ - 1); { 4D00:0C65 }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      if ((local_7 = 0) or else (local_7 = $FF)) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          local_7 := 1; { 4D00:0C74 }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      uVar9 := Word((LongWord((P_LongWord((Integer(param_1) + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 4D00:0B3C }
      iVar7 := Integer((P_LongWord((Integer(param_1) + $108)))^); { routine anchor; statement location unresolved } { 4D00:0B3C }
      iVar8 := (P_Integer((iVar7 + 10)))^; { routine anchor; statement location unresolved } { 4D00:0B3C }
      uVar9 := (P_Word((iVar7 + $C)))^; { routine anchor; statement location unresolved } { 4D00:0B3C }
      local_13 := FarBits(uVar9, iVar8); { 4D00:0C88 }
      if (((P_ShortInt((iVar8 + $10D)))^ = 0) or else ((P_ShortInt((iVar8 + $10E)))^ = 0)) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          local_13 := 0; { 4D00:0CA6 }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      if ((Integer(local_13) = 0) and then (Slice16(local_13, 2) = 0)) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          uVar2 := 0; { routine anchor; statement location unresolved } { 4D00:0B3C }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      else { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          uVar2 := ov13_1085(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0CC3 }
          if (ShortInt(uVar2) <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              local_14 := ov31_0BE7(Integer(local_13), Slice16(local_13, 2)); { 4D00:0CD2 }
              local_15 := ov31_0C0F(Integer(local_13), Slice16(local_13, 2)); { 4D00:0CE0 }
              local_9 := Word(local_7); { 4D00:0CED }
              uVar9 := ov31_0BE7(Integer(param_1), Slice16(param_1, 2)); { 4D00:0CF6 }
              uVar3 := ov31_0C0F(Integer(param_1), Slice16(param_1, 2)); { 4D00:0D02 }
              uVar2 := ov30_0422(Word(g_6716), Slice16(g_6716, 2), @(local_9), SS, @(local_15), SS, @(local_14), SS, uVar3, uVar9); { 4D00:0D1F }
              if ((ShortInt(uVar2) <> 0) and then Sequence((uVar2 := (local_9 shr 1)); (uVar2 <= local_7))) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  local_5 := 1; { 4D00:0D38 }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      if (local_5 = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          uVar9 := FUN_00ba_2433(local_7, Integer(param_1), Slice16(param_1, 2)); { 4D00:0D4F }
          local_a := ShortInt(uVar9); { 4D00:0D54 }
          bVar6 := Byte((Word(uVar9) shr 8)); { routine anchor; statement location unresolved } { 4D00:0B3C }
          if (local_a = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              cVar1 := ov13_37E4((Word(bVar6) shl 8), (Word(bVar6) shl 8), Pack16(bVar6, $FF), Integer(param_1), Slice16(param_1, 2)); { 4D00:0D6C }
              if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  uVar2 := FUN_4d00_0f4f(Integer(param_1), Slice16(param_1, 2)); { 4D00:0D88 }
                  local_4[0] := ShortInt(uVar2); { routine anchor; statement location unresolved } { 4D00:0B3C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
              else { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  uVar2 := MoveAttackCommand(Integer(param_1), Slice16(param_1, 2)); { 4D00:0D7C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
          else { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              local_b := RollDice(uVar9, Pack16(bVar6, 1)); { 4D00:0D98 }
              iVar8 := (Word((P_Byte((local_b + $6DE4)))^) * 4); { routine anchor; statement location unresolved } { 4D00:0B3C }
              local_13 := FarBits((P_Word((iVar8 + $65BB)))^, (P_Word((iVar8 + $65B9)))^); { 4D00:0DBB }
              cVar1 := FUN_00ba_2e03(Integer(param_1), Slice16(param_1, 2)); { 4D00:0DC7 }
              if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  cVar1 := FUN_00ba_2e46(Integer(param_1), Slice16(param_1, 2)); { 4D00:0DD6 }
                  if ((cVar1 = 0) and then Sequence((cVar1 := FUN_00ba_2433(1, Integer(param_1), Slice16(param_1, 2))); (cVar1 <> 0))) then { 4D00:0DE8 }
                    begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                      uVar2 := ChooseEquipmentForCombat(Integer(param_1), Slice16(param_1, 2)); { 4D00:0DF8 }
                      local_4[0] := 1; { routine anchor; statement location unresolved } { 4D00:0B3C }
                      goto LAB_4d00_0e2f; { routine anchor; statement location unresolved } { 4D00:0B3C }
                    end; { routine anchor; statement location unresolved } { 4D00:0B3C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
              uVar2 := FUN_00ba_255b(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0E0D }
              if (ShortInt(uVar2) <> 1) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  uVar2 := ov13_1085(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0E22 }
                  if (ShortInt(uVar2) = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                    goto LAB_4d00_0e2f; { routine anchor; statement location unresolved } { 4D00:0B3C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
              local_5 := 1; { 4D00:0E2B }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      LAB_4d00_0e2f: { routine anchor; statement location unresolved } { 4D00:0B3C }
      if (local_5 <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          uVar9 := ov31_0BE7(Integer(param_1), Slice16(param_1, 2)); { 4D00:0E3B }
          uVar3 := ov31_0C0F(Integer(param_1), Slice16(param_1, 2)); { 4D00:0E47 }
          uVar4 := 2; { routine anchor; statement location unresolved } { 4D00:0B3C }
          uVar5 := ov13_263D(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0E5C }
          uVar2 := ov31_0996(uVar5, uVar4, uVar3, uVar9); { 4D00:0E62 }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
      if (local_5 <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
          cVar1 := SweepAttack(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0E7C }
          if (cVar1 = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              ov13_17F6(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0EA2 }
              local_f := 0; { 4D00:0EA9 }
              local_d := 0; { 4D00:0EAC }
              uVar2 := FUN_00ba_2e03(Integer(param_1), Slice16(param_1, 2)); { 4D00:0EB5 }
              if (ShortInt(uVar2) <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  local_5 := FUN_00ba_2e8b(@(local_f), SS, Integer(param_1), Slice16(param_1, 2)); { 4D00:0EC9 }
                  uVar2 := FUN_00ba_2e46(Integer(param_1), Slice16(param_1, 2)); { 4D00:0ED7 }
                  if (ShortInt(uVar2) <> 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                    begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                      uVar2 := FUN_00ba_255b(Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0EEC }
                      if (ShortInt(uVar2) = 1) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                        begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                          uVar2 := 0; { routine anchor; statement location unresolved } { 4D00:0B3C }
                          local_f := 0; { 4D00:0EF7 }
                          local_d := 0; { 4D00:0EFA }
                        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
                    end; { routine anchor; statement location unresolved } { 4D00:0B3C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
              uVar2 := ov13_1884(local_4, SS, local_f, local_d, (uVar2 and $FF00), Integer(local_13), Slice16(local_13, 2), Integer(param_1), Slice16(param_1, 2)); { 4D00:0F17 }
              if (local_4[0] = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  if ((P_ShortInt((Integer(local_13) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:0B3C }
                    begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                      local_4[0] := 1; { routine anchor; statement location unresolved } { 4D00:0B3C }
                    end; { routine anchor; statement location unresolved } { 4D00:0B3C }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
              else { routine anchor; statement location unresolved } { 4D00:0B3C }
                begin { routine anchor; statement location unresolved } { 4D00:0B3C }
                  local_6 := 0; { 4D00:0F22 }
                end; { routine anchor; statement location unresolved } { 4D00:0B3C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
          else { routine anchor; statement location unresolved } { 4D00:0B3C }
            begin { routine anchor; statement location unresolved } { 4D00:0B3C }
              uVar2 := FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 4D00:0E8B }
              local_4[0] := ShortInt(uVar2); { routine anchor; statement location unresolved } { 4D00:0B3C }
            end; { routine anchor; statement location unresolved } { 4D00:0B3C }
        end; { routine anchor; statement location unresolved } { 4D00:0B3C }
    end; { routine anchor; statement location unresolved } { 4D00:0B3C }
  until not (true); { routine anchor; statement location unresolved } { 4D00:0B3C }
end; { routine anchor; statement location unresolved } { 4D00:0B3C }
```

### ov09:0F4F FUN_4d00_0f4f (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot].  
Callers: FUN_4d00_07f2,FUN_4d00_0b3c,ov09_000F.  
Callees: FUN_00ba_0b73, FUN_00ba_17e3, FUN_00ba_2637, FUN_00ba_2686, FUN_00ba_2e03.

```pascal
function FUN_4d00_0f4f(param_1: LongWord): Byte; { 4D00:0F4F }
begin { routine anchor; statement location unresolved } { 4D00:0F4F }
  FUN_00ba_17e3(); { 4D00:0F55 }
  cVar1 := FUN_00ba_0b73(Integer(param_1), Slice16(param_1, 2)); { 4D00:0F60 }
  if (((cVar1 = 0) and then Sequence((cVar1 := FUN_00ba_2e03(Integer(param_1), Slice16(param_1, 2))); (cVar1 = 0))) and then ((P_ShortInt((Integer((P_LongWord((Integer(param_1) + $108)))^) + 3)))^ <> 0)) then { 4D00:0F6F }
    begin { routine anchor; statement location unresolved } { 4D00:0F4F }
      uVar2 := FUN_00ba_2686(Integer(param_1), Slice16(param_1, 2)); { 4D00:0F9D }
      Exit(uVar2); { 4D00:0FAB }
    end; { routine anchor; statement location unresolved } { 4D00:0F4F }
  uVar2 := FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 4D00:0F8D }
  Exit(uVar2); { 4D00:0FAB }
end; { routine anchor; statement location unresolved } { 4D00:0F4F }
```

### ov09:0FC1 ToggleMagic (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; local_12: Byte [BP-$10]; local_11: array[0..8] of Byte [BP-$F]; local_8: ShortInt [BP-$6]; local_7: Integer [BP-$5]; iStack_5: Integer [BP-$3]; local_3: Byte [BP-$1].  
Callers: FUN_4d00_07f2,ov09_000F.  
Callees: Crt.KeyPressed, FUN_00ba_1693, FUN_0899_0059, FUN_0899_0104, System.@StrCopy, GodsIntervene.

```pascal
function ToggleMagic(param_1: LongWord): Byte; { 4D00:0FC1 }
begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
  local_3 := 0; { 4D00:0FC7 }
  cVar2 := Crt_KeyPressed(); { 4D00:0FCB }
  if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
    begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
      local_8 := FUN_0899_0059(); { 4D00:0FD7 }
      if (local_8 = 0) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
        begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
          local_8 := FUN_0899_0059(); { 4D00:0FE5 }
        end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
      if (local_8 = 50) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
        begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
          g_6E30 := (g_6E30 = 0); { 4D00:0FFE }
          if Boolean(g_6E30) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
            begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
              puVar4 := local_11; { routine anchor; statement location unresolved } { 4D00:0FC1 }
              PString(local_11, SS) := 'Magic On'; { 4D00:1012 }
              FUN_00ba_1693(puVar4, SS); { 4D00:1017 }
            end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
          else { routine anchor; statement location unresolved } { 4D00:0FC1 }
            begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
              puVar4 := @(local_12); { routine anchor; statement location unresolved } { 4D00:0FC1 }
              PString(local_12, SS) := 'Magic Off'; { 4D00:1028 }
              FUN_00ba_1693(puVar4, SS); { 4D00:102D }
            end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
        end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
      else { routine anchor; statement location unresolved } { 4D00:0FC1 }
        if (local_8 = 32) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
          begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
            _local_7 := FarBits(g_5D98, g_5D96); { routine anchor; statement location unresolved } { 4D00:0FC1 }
            while true do { routine anchor; statement location unresolved } { 4D00:0FC1 }
              begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
                if ((local_7 = 0) and then (iStack_5 = 0)) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
                  Break; { routine anchor; statement location unresolved } { 4D00:0FC1 }
                if (((P_Byte((local_7 + $84)))^ < $80) and then ((P_ShortInt((local_7 + $10C)))^ <> 1)) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
                  begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
                    (P_Byte((local_7 + $10F)))^ := 0; { routine anchor; statement location unresolved } { 4D00:0FC1 }
                  end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
                _local_7 := FarBits((P_Word((local_7 + $106)))^, (P_Word((local_7 + $104)))^); { routine anchor; statement location unresolved } { 4D00:0FC1 }
              end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
            uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:0FC1 }
            if ((P_ShortInt((Integer(param_1) + $10F)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
              begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
                uVar1 := (P_LongWord((Integer(param_1) + $108)))^; { routine anchor; statement location unresolved } { 4D00:0FC1 }
                (P_Byte((Integer(uVar1) + 3)))^ := $14; { routine anchor; statement location unresolved } { 4D00:0FC1 }
                local_3 := 1; { 4D00:1099 }
              end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
          end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
        else { routine anchor; statement location unresolved } { 4D00:0FC1 }
          if (local_8 = 45) then { routine anchor; statement location unresolved } { 4D00:0FC1 }
            begin { routine anchor; statement location unresolved } { 4D00:0FC1 }
              GodsIntervene(); { 4D00:10A3 }
            end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
    end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
  FUN_0899_0104(); { 4D00:10AC }
  Exit(local_3); { 4D00:10B7 }
end; { routine anchor; statement location unresolved } { 4D00:0FC1 }
```

### ov09:10D7 FleeOrSurrender (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_17: array[0..6] of Byte [BP-$15]; local_10: array[0..10] of Byte [BP-$E]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: ov09_000F.  
Callees: FUN_00ba_16ec, FUN_00ba_2637, System.@StrCopy, ov13_0123, ov13_2908, RemoveEffect, VisitEffectHooks, ov24_0F06, ov24_1041.

```pascal
function FleeOrSurrender(param_1: LongWord): Byte; { 4D00:10D7 }
begin { routine anchor; statement location unresolved } { 4D00:10D7 }
  local_3 := 0; { 4D00:10DD }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:10D7 }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:10D7 }
  (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + $14)))^ := 0; { routine anchor; statement location unresolved } { 4D00:10D7 }
  ov24_1041(iVar2, uVar3); { 4D00:10F4 }
  if ((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + $10)))^ = 0) then { routine anchor; statement location unresolved } { 4D00:10D7 }
    begin { routine anchor; statement location unresolved } { 4D00:10D7 }
      if ($7F < (P_Byte((iVar2 + $84)))^) then { routine anchor; statement location unresolved } { 4D00:10D7 }
        begin { routine anchor; statement location unresolved } { 4D00:10D7 }
          g_6825 := ((P_ShortInt((iVar2 + $84)))^ shl 1); { 4D00:1154 }
          if ($66 < g_6825) then { routine anchor; statement location unresolved } { 4D00:10D7 }
            begin { routine anchor; statement location unresolved } { 4D00:10D7 }
              g_6825 := 0; { 4D00:115E }
            end; { routine anchor; statement location unresolved } { 4D00:10D7 }
          VisitEffectHooks(iVar2, uVar3, $11); { 4D00:116C }
          if ((Integer(Word(g_6825)) < Integer((100 - ((Word((P_Byte((iVar2 + $11B)))^) * 100) div Word((P_Byte((iVar2 + $32)))^))))) or else (g_6825 = 0)) then { routine anchor; statement location unresolved } { 4D00:10D7 }
            begin { routine anchor; statement location unresolved } { 4D00:10D7 }
              local_5 := g_6825; { 4D00:11AD }
              g_6825 := g_6E2F; { 4D00:11B3 }
              VisitEffectHooks(iVar2, uVar3, $11); { 4D00:11BF }
              if ((Word(g_6825) < (100 - (P_Integer((Integer(g_49D6) + $58C)))^)) or else ((g_6825 = 0) or else ((P_ShortInt((iVar2 + $10E)))^ = 0))) then { routine anchor; statement location unresolved } { 4D00:10D7 }
                begin { routine anchor; statement location unresolved } { 4D00:10D7 }
                  local_4 := ov13_2908(iVar2, uVar3); { 4D00:11F6 }
                  uVar1 := ov13_0123(iVar2, uVar3); { 4D00:1204 }
                  if (((uVar1 and $FF) shr 1) < Word(local_4)) then { routine anchor; statement location unresolved } { 4D00:10D7 }
                    begin { routine anchor; statement location unresolved } { 4D00:10D7 }
                      if (5 < (P_Byte((iVar2 + $11)))^) then { routine anchor; statement location unresolved } { 4D00:10D7 }
                        begin { routine anchor; statement location unresolved } { 4D00:10D7 }
                          uVar5 := 4; { routine anchor; statement location unresolved } { 4D00:10D7 }
                          puVar4 := local_10; { routine anchor; statement location unresolved } { 4D00:10D7 }
                          iVar6 := iVar2; { routine anchor; statement location unresolved } { 4D00:10D7 }
                          uVar7 := uVar3; { routine anchor; statement location unresolved } { 4D00:10D7 }
                          PString(local_17, SS) := 'Surrenders'; { 4D00:1125 }
                          ov24_0F06(puVar4, SS, uVar5, iVar6, uVar7); { 4D00:1271 }
                          local_3 := FUN_00ba_2637(iVar2, uVar3); { 4D00:127C }
                        end; { routine anchor; statement location unresolved } { 4D00:10D7 }
                    end; { routine anchor; statement location unresolved } { 4D00:10D7 }
                  else { routine anchor; statement location unresolved } { 4D00:10D7 }
                    begin { routine anchor; statement location unresolved } { 4D00:10D7 }
                      (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + $14)))^ := 1; { routine anchor; statement location unresolved } { 4D00:10D7 }
                      RemoveEffect(0, 0, $4A, iVar2, uVar3); { 4D00:1234 }
                      RemoveEffect(0, 0, Pack16(UNKNOWN_extraout_AH_00, $4B), iVar2, uVar3); { 4D00:1248 }
                    end; { routine anchor; statement location unresolved } { 4D00:10D7 }
                end; { routine anchor; statement location unresolved } { 4D00:10D7 }
            end; { routine anchor; statement location unresolved } { 4D00:10D7 }
        end; { routine anchor; statement location unresolved } { 4D00:10D7 }
    end; { routine anchor; statement location unresolved } { 4D00:10D7 }
  else { routine anchor; statement location unresolved } { 4D00:10D7 }
    begin { routine anchor; statement location unresolved } { 4D00:10D7 }
      (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + $14)))^ := 1; { routine anchor; statement location unresolved } { 4D00:10D7 }
      puVar4 := local_17; { routine anchor; statement location unresolved } { 4D00:10D7 }
      PString(local_10, SS) := 'is forced to flee'; { 4D00:126C }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar4, SS, iVar2, uVar3); { 4D00:1130 }
    end; { routine anchor; statement location unresolved } { 4D00:10D7 }
  Exit(local_3); { 4D00:128A }
end; { routine anchor; statement location unresolved } { 4D00:10D7 }
```

### ov09:128D FUN_4d00_128d (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_14: Byte [BP-$12]; local_13: Byte [BP-$11]; local_f: ShortInt [BP-$D]; local_b: ShortInt [BP-$9]; local_a: ShortInt [BP-$8]; local_9: ShortInt [BP-$7]; local_6: Byte [BP-$4]; local_4: ShortInt [BP-$2].  
Callers: FUN_4d00_13ca.  
Callees: System.@CopyBytes.

```pascal
function FUN_4d00_128d(param_1: LongWord; param_2: LongWord): Word; { 4D00:128D }
begin { routine anchor; statement location unresolved } { 4D00:128D }
  uVar6 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:128D }
  iVar3 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:128D }
  Move(MemRef(((Word((P_Byte((iVar3 + $2E)))^) * $10) + $5582), $C7C), MemRef(@(local_14), SS), $10); { 4D00:12B1 }
  local_4 := (local_a * local_b); { 4D00:12C4 }
  if (0 < (P_ShortInt((iVar3 + $32)))^) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := (local_4 + ((P_ShortInt((iVar3 + $32)))^ * 8)); { 4D00:12E6 }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  if (0 < local_9) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := (local_4 + (local_9 * 2)); { 4D00:12FE }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  iVar4 := Integer(param_2); { routine anchor; statement location unresolved } { 4D00:128D }
  uVar7 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 4D00:128D }
  if ((((P_ShortInt((iVar3 + $2E)))^ = 85) and then Sequence((uVar8 := Word((LongWord((P_LongWord((iVar4 + $108)))^) shr $10))); (iVar5 := Integer((P_LongWord((iVar4 + $108)))^)); (((P_Integer((iVar5 + 10)))^ <> 0) or else ((P_Integer((iVar5 + $C)))^ <> 0)))) and then Sequence((uVar1 := (P_LongWord((Integer((P_LongWord((iVar4 + $108)))^) + 10)))^); (0 < (P_ShortInt((Integer(uVar1) + $76)))^))) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := 8; { 4D00:1330 }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  if ((local_6 and 8) <> 0) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := (local_4 + ((local_f + -(1)) * 2)); { 4D00:134E }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  if (local_13 < 2) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := (local_4 + 3); { 4D00:135F }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  uVar2 := (Word(local_13) + Word((P_Byte((iVar4 + $100)))^)); { routine anchor; statement location unresolved } { 4D00:128D }
  if (3 < uVar2) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := 0; { 4D00:137A }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  if (((P_ShortInt((iVar3 + $3E)))^ = -($7C)) and then Sequence((uVar2 := (Pack16(ShortInt((uVar2 shr 8)), (P_Byte((iVar3 + $3D)))^) and $FF0F)); (ShortInt(uVar2) <> (P_ShortInt((iVar4 + $A0)))^))) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := 0; { 4D00:139B }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  if ((P_ShortInt((iVar3 + $3D)))^ = 83) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := 0; { 4D00:13A9 }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  if ((P_ShortInt((iVar3 + $36)))^ <> 0) then { routine anchor; statement location unresolved } { 4D00:128D }
    begin { routine anchor; statement location unresolved } { 4D00:128D }
      local_4 := 0; { 4D00:13B7 }
    end; { routine anchor; statement location unresolved } { 4D00:128D }
  Exit(Pack16(ShortInt((uVar2 shr 8)), local_4)); { 4D00:13C7 }
end; { routine anchor; statement location unresolved } { 4D00:128D }
```

### ov09:13CA ChooseEquipmentForCombat (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; bVar3: Boolean [compiler temporary; no proven BP slot]; bVar4: Boolean [compiler temporary; no proven BP slot]; bVar5: Byte [compiler temporary; no proven BP slot]; cVar6: ShortInt [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_1c: Byte [BP-$1A]; local_1a: Byte [BP-$18]; local_19: Byte [BP-$17]; local_18: Byte [BP-$16]; local_17: Byte [BP-$15]; local_16: Integer [BP-$14]; local_14: Integer [BP-$12]; local_12: Integer [BP-$10]; iStack_10: Integer [BP-$E]; local_e: Integer [BP-$C]; local_c: Integer [BP-$A]; local_a: Integer [BP-$8]; local_8: Integer [BP-$6]; local_6: LongWord [BP-$4].  
Callers: FUN_4d00_0b3c,ov09_000F.  
Callees: FUN_00ba_09e3, FUN_00ba_0bb8, FUN_00ba_2433, FUN_4d00_128d, ov13_0D23, ReadyItem.

```pascal
procedure ChooseEquipmentForCombat(param_1: LongWord); { 4D00:13CA }
begin { routine anchor; statement location unresolved } { 4D00:13CA }
  uVar8 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 4D00:13CA }
  iVar7 := Integer(param_1); { routine anchor; statement location unresolved } { 4D00:13CA }
  if (((P_Integer((iVar7 + $CC)))^ <> 0) or else ((P_Integer((iVar7 + $CE)))^ <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      (P_ShortInt((iVar7 + $100)))^ := ((P_ShortInt((iVar7 + $100)))^ - (P_ShortInt(((Word((P_Byte((Integer((P_LongWord((iVar7 + $CC)))^) + $2E)))^) * $10) + $5583)))^); { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  if (((P_Integer((iVar7 + $D0)))^ <> 0) or else ((P_Integer((iVar7 + $D2)))^ <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      (P_ShortInt((iVar7 + $100)))^ := ((P_ShortInt((iVar7 + $100)))^ - (P_ShortInt(((Word((P_Byte((Integer((P_LongWord((iVar7 + $D0)))^) + $2E)))^) * $10) + $5583)))^); { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  local_6 := 0; { 4D00:1450 }
  local_a := 0; { 4D00:1458 }
  local_8 := 0; { 4D00:145B }
  local_e := 0; { 4D00:1460 }
  local_c := 0; { 4D00:1463 }
  local_17 := 1; { 4D00:1466 }
  local_18 := ((P_ShortInt((iVar7 + $A5)))^ * (P_ShortInt((iVar7 + $A3)))^); { 4D00:1482 }
  if (0 < (P_ShortInt((iVar7 + $A7)))^) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      local_18 := (local_18 + ((P_ShortInt((iVar7 + $A7)))^ * 2)); { 4D00:14A4 }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  local_19 := 0; { 4D00:14A7 }
  iStack_10 := (P_Integer((iVar7 + $CA)))^; { 4D00:14BB }
  local_12 := (P_Integer((iVar7 + 200)))^; { 4D00:14B8 }
  while ((local_12 <> 0) or else (iStack_10 <> 0)) do { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar2 := (P_Byte((local_12 + $2E)))^; { routine anchor; statement location unresolved } { 4D00:13CA }
      if (((P_ShortInt(((Word(bVar2) * $10) + $5582)))^ = 0) and then (((P_Byte(((Word(bVar2) * $10) + $558F)))^ and (P_Byte((iVar7 + $B0)))^) <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          bVar5 := FUN_4d00_128d(local_12, iStack_10, iVar7, uVar8); { 4D00:1513 }
          if (((((P_Byte(((Word(bVar2) * $10) + $5590)))^ and 8) <> 0) or else (((P_Byte(((Word(bVar2) * $10) + $5590)))^ and $10) <> 0)) and then (local_17 < bVar5)) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_6 := FarBits(iStack_10, local_12); { 4D00:1551 }
              local_17 := bVar5; { 4D00:155A }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
          if ((((P_Byte(((Word(bVar2) * $10) + $5590)))^ and 8) = 0) and then (local_18 < bVar5)) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_a := local_12; { 4D00:1580 }
              local_8 := iStack_10; { 4D00:1583 }
              local_18 := bVar5; { 4D00:1589 }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      if (((P_ShortInt(((Word(bVar2) * $10) + $5582)))^ = 1) and then (((P_Byte(((Word(bVar2) * $10) + $558F)))^ and (P_Byte((iVar7 + $B0)))^) <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          if ((P_ShortInt((local_12 + $32)))^ < 0) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_1a := 0; { 4D00:1516 }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
          else { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_1a := ((P_ShortInt((local_12 + $32)))^ + 1); { 4D00:15CC }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
          if (local_19 < local_1a) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_e := local_12; { 4D00:15E3 }
              local_c := iStack_10; { 4D00:15E6 }
              local_19 := local_1a; { 4D00:15EC }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      piVar1 := P_Integer((local_12 + $2A)); { routine anchor; statement location unresolved } { 4D00:13CA }
      iStack_10 := (P_Integer((local_12 + $2C)))^; { 4D00:15FD }
      local_12 := (piVar1)^; { 4D00:15FA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  if ((((Integer(local_6) = 0) and then (Slice16(local_6, 2) = 0)) or else ((P_Byte(((Word((P_Byte((Integer(local_6) + $2E)))^) * $10) + $558E)))^ < 2)) or else (((P_Byte(((Word((P_Byte((Integer(local_6) + $2E)))^) * $10) + $5590)))^ and $14) <> $14)) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar4 := false; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  else { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar4 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  bVar3 := false; { routine anchor; statement location unresolved } { 4D00:13CA }
  local_16 := 0; { 4D00:164A }
  local_14 := 0; { 4D00:164D }
  local_1c := 0; { 4D00:1650 }
  if ((Integer(local_6) <> 0) or else (Slice16(local_6, 2) <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      local_1c := (P_Byte(((Word((P_Byte((Integer(local_6) + $2E)))^) * $10) + $5590)))^; { 4D00:166F }
      if ((local_1c and $10) <> 0) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          local_16 := Integer(local_6); { 4D00:1681 }
          local_14 := Slice16(local_6, 2); { 4D00:1684 }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      if ((local_1c and 8) <> 0) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          if ((local_1c and 1) <> 0) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_16 := (P_Integer((iVar7 + $F8)))^; { 4D00:16A6 }
              local_14 := (P_Integer((iVar7 + $FA)))^; { 4D00:16A9 }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
          if ((local_1c and $80) <> 0) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              local_16 := (P_Integer((iVar7 + $FC)))^; { 4D00:16C2 }
              local_14 := (P_Integer((iVar7 + $FE)))^; { 4D00:16C5 }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  if (((local_16 <> 0) or else (local_14 <> 0)) or else (local_1c = 10)) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar3 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  if ((((Integer(local_6) = 0) and then (Slice16(local_6, 2) = 0)) or else (local_17 <= (local_18 shr 1))) or else (not (bVar3) or else (not (bVar4) and then Sequence((cVar6 := FUN_00ba_2433(1, iVar7, uVar8)); (cVar6 <> 0))))) then { 4D00:1709 }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      local_12 := local_a; { 4D00:1718 }
      iStack_10 := local_8; { 4D00:171B }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  else { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      local_12 := Integer(local_6); { 4D00:1726 }
      iStack_10 := Slice16(local_6, 2); { 4D00:1729 }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  bVar3 := false; { routine anchor; statement location unresolved } { 4D00:13CA }
  bVar4 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
  if ((((P_Integer((iVar7 + $CC)))^ <> 0) or else ((P_Integer((iVar7 + $CE)))^ <> 0)) and then ((((P_Integer((iVar7 + $CE)))^ = iStack_10) and then ((P_Integer((iVar7 + $CC)))^ = local_12)) or else ((P_ShortInt((Integer((P_LongWord((iVar7 + $CC)))^) + $36)))^ <> 0))) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar4 := false; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  if bVar4 then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      if (((P_Integer((iVar7 + $CC)))^ <> 0) or else ((P_Integer((iVar7 + $CE)))^ <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          ReadyItem((P_Word((iVar7 + $CC)))^, (P_Word((iVar7 + $CE)))^); { 4D00:1792 }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      FUN_00ba_0bb8(iVar7, uVar8); { 4D00:179D }
      if ((((P_Integer((iVar7 + $D0)))^ <> 0) or else ((P_Integer((iVar7 + $D2)))^ <> 0)) and then ((P_ShortInt((Integer((P_LongWord((iVar7 + $D0)))^) + $36)))^ = 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          (P_ShortInt((iVar7 + $100)))^ := ((P_ShortInt((iVar7 + $100)))^ - (P_ShortInt(((Word((P_Byte((Integer((P_LongWord((iVar7 + $D0)))^) + $2E)))^) * $10) + $5583)))^); { routine anchor; statement location unresolved } { 4D00:13CA }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      if ((local_12 <> 0) or else (iStack_10 <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          ReadyItem(local_12, iStack_10); { 4D00:17FE }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar3 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  FUN_00ba_0bb8(iVar7, uVar8); { 4D00:180D }
  ov13_0D23(iVar7, uVar8); { 4D00:1818 }
  bVar4 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
  if ((((P_Integer((iVar7 + $D0)))^ <> 0) or else ((P_Integer((iVar7 + $D2)))^ <> 0)) and then ((((P_Integer((iVar7 + $D2)))^ = local_c) and then ((P_Integer((iVar7 + $D0)))^ = local_e)) or else ((P_ShortInt((Integer((P_LongWord((iVar7 + $D0)))^) + $36)))^ <> 0))) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar4 := false; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  if ((P_Byte((iVar7 + $100)))^ < 3) then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      if (((P_Byte((iVar7 + $100)))^ < 2) and then bVar4) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          if (((P_Integer((iVar7 + $D0)))^ <> 0) or else ((P_Integer((iVar7 + $D2)))^ <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              ReadyItem((P_Word((iVar7 + $D0)))^, (P_Word((iVar7 + $D2)))^); { 4D00:1889 }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
          FUN_00ba_0bb8(iVar7, uVar8); { 4D00:18E4 }
          if ((local_e <> 0) or else (local_c <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
            begin { routine anchor; statement location unresolved } { 4D00:13CA }
              ReadyItem(local_e, local_c); { 4D00:18A1 }
            end; { routine anchor; statement location unresolved } { 4D00:13CA }
          bVar3 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  else { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      if ((((P_Integer((iVar7 + $D0)))^ = 0) and then ((P_Integer((iVar7 + $D2)))^ = 0)) or else ((P_ShortInt((Integer((P_LongWord((iVar7 + $D0)))^) + $36)))^ <> 0)) then { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          ReadyItem(local_12, iStack_10); { 4D00:18D9 }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      else { routine anchor; statement location unresolved } { 4D00:13CA }
        begin { routine anchor; statement location unresolved } { 4D00:13CA }
          ReadyItem((P_Word((iVar7 + $D0)))^, (P_Word((iVar7 + $D2)))^); { 4D00:18F7 }
        end; { routine anchor; statement location unresolved } { 4D00:13CA }
      bVar3 := true; { routine anchor; statement location unresolved } { 4D00:13CA }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  FUN_00ba_0bb8(iVar7, uVar8); { 4D00:1906 }
  if bVar3 then { routine anchor; statement location unresolved } { 4D00:13CA }
    begin { routine anchor; statement location unresolved } { 4D00:13CA }
      FUN_00ba_09e3(iVar7, uVar8); { 4D00:1917 }
    end; { routine anchor; statement location unresolved } { 4D00:13CA }
  Exit; { 4D00:191F }
end; { routine anchor; statement location unresolved } { 4D00:13CA }
```

### ov09:1922 ov09_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov09_init(); { 4D00:1922 }
begin { routine anchor; statement location unresolved } { 4D00:1922 }
  Exit; { 4D00:1926 }
end; { routine anchor; statement location unresolved } { 4D00:1922 }
```

### ov13:0000 ov13_0000 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: puVar1: P_Byte [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; cVar4: ShortInt [compiler temporary; no proven BP slot]; cVar5: ShortInt [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot].  
Callers: none recorded.  
Callees: FUN_00ba_1168, FUN_6100_0e52, ov13_0123, ov13_0D23, VisitEffectHooks, RollDice.

M behavior: initializes per-combat record via character +108, initiative byte +3, movement +6; dispatches effect hook 12. Character +10D gates initiative; exact gameplay status names require crossref.

```pascal
procedure ov13_0000(param_1: LongWord); { 6100:0000 }
begin { routine anchor; statement location unresolved } { 6100:0000 }
  uVar7 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:0000 }
  iVar6 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:0000 }
  puVar1 := P_Byte((P_LongWord((iVar6 + $108)))^); { routine anchor; statement location unresolved } { 6100:0000 }
  uVar8 := Word((LongWord(puVar1) shr $10)); { routine anchor; statement location unresolved } { 6100:0000 }
  puVar2 := P_Byte(puVar1); { routine anchor; statement location unresolved } { 6100:0000 }
  (puVar1)^ := 0; { routine anchor; statement location unresolved } { 6100:0000 }
  puVar2[1] := 1; { routine anchor; statement location unresolved } { 6100:0000 }
  puVar2[2] := 1; { routine anchor; statement location unresolved } { 6100:0000 }
  puVar2[8] := 0; { routine anchor; statement location unresolved } { 6100:0000 }
  puVar2[4] := 2; { routine anchor; statement location unresolved } { 6100:0000 }
  ov13_0D23(iVar6, uVar7); { 6100:0042 }
  g_681A := (P_Byte((iVar6 + $A2)))^; { 6100:004D }
  g_681D := 0; { 6100:0050 }
  VisitEffectHooks(iVar6, uVar7, Pack16(UNKNOWN_extraout_AH, $12)); { 6100:005E }
  uVar3 := FUN_6100_0e52(Pack16(UNKNOWN_extraout_AH_00, g_681A)); { 6100:0068 }
  (P_Byte((iVar6 + $114)))^ := uVar3; { routine anchor; statement location unresolved } { 6100:0000 }
  puVar2[5] := (P_Byte((iVar6 + $6B)))^; { routine anchor; statement location unresolved } { 6100:0000 }
  if ((P_ShortInt((iVar6 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 6100:0000 }
    begin { routine anchor; statement location unresolved } { 6100:0000 }
      puVar2[3] := 0; { routine anchor; statement location unresolved } { 6100:0000 }
    end; { routine anchor; statement location unresolved } { 6100:0000 }
  else { routine anchor; statement location unresolved } { 6100:0000 }
    begin { routine anchor; statement location unresolved } { 6100:0000 }
      cVar4 := FUN_00ba_1168(iVar6, uVar7); { 6100:0092 }
      cVar5 := RollDice(Pack16((cVar4 shr 7), 6), Pack16((cVar4 shr 7), 1)); { 6100:009F }
      puVar2[3] := (cVar5 + cVar4); { routine anchor; statement location unresolved } { 6100:0000 }
      if (ShortInt(puVar2[3]) < 1) then { routine anchor; statement location unresolved } { 6100:0000 }
        begin { routine anchor; statement location unresolved } { 6100:0000 }
          puVar2[3] := 1; { routine anchor; statement location unresolved } { 6100:0000 }
        end; { routine anchor; statement location unresolved } { 6100:0000 }
      if (Byte((((P_ShortInt((iVar6 + $10E)))^ + 1) and Byte((P_Word((Integer(g_49D6) + $596)))^))) <> 0) then { routine anchor; statement location unresolved } { 6100:0000 }
        begin { routine anchor; statement location unresolved } { 6100:0000 }
          puVar2[3] := (puVar2[3] + -(6)); { routine anchor; statement location unresolved } { 6100:0000 }
        end; { routine anchor; statement location unresolved } { 6100:0000 }
      if ((ShortInt(puVar2[3]) < 0) or else (20 < ShortInt(puVar2[3]))) then { routine anchor; statement location unresolved } { 6100:0000 }
        begin { routine anchor; statement location unresolved } { 6100:0000 }
          puVar2[3] := 0; { routine anchor; statement location unresolved } { 6100:0000 }
        end; { routine anchor; statement location unresolved } { 6100:0000 }
    end; { routine anchor; statement location unresolved } { 6100:0000 }
  uVar3 := ov13_0123(iVar6, uVar7); { 6100:010E }
  (P_Byte((Integer((P_LongWord((iVar6 + $108)))^) + 6)))^ := uVar3; { routine anchor; statement location unresolved } { 6100:0000 }
  Exit; { 6100:0120 }
end; { routine anchor; statement location unresolved } { 6100:0000 }
```

### ov13:0123 ov13_0123 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; local_4: Byte [BP-$2].  
Callers: ov13_0000,ov13_0C6A,ov13_2908.  
Callees: VisitEffectHooks.

```pascal
function ov13_0123(param_1: LongWord): Byte; { 6100:0123 }
begin { routine anchor; statement location unresolved } { 6100:0123 }
  uVar2 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:0123 }
  iVar1 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:0123 }
  local_4 := (P_Byte((iVar1 + $11C)))^; { 6100:0131 }
  if ((P_ShortInt((iVar1 + $10E)))^ = 0) then { routine anchor; statement location unresolved } { 6100:0123 }
    begin { routine anchor; statement location unresolved } { 6100:0123 }
      local_4 := (local_4 + ShortInt((P_Word((Integer(g_49D6) + $6E4)))^)); { 6100:014D }
    end; { routine anchor; statement location unresolved } { 6100:0123 }
  g_681D := 1; { 6100:0150 }
  if ((local_4 = 0) or else ($60 < local_4)) then { routine anchor; statement location unresolved } { 6100:0123 }
    begin { routine anchor; statement location unresolved } { 6100:0123 }
      local_4 := 1; { 6100:0161 }
    end; { routine anchor; statement location unresolved } { 6100:0123 }
  g_681A := Byte((Word(local_4) shl 1)); { 6100:016C }
  VisitEffectHooks(iVar1, uVar2, Pack16(ShortInt(((Word(local_4) shl 1) shr 8)), $12)); { 6100:0178 }
  g_681D := 0; { 6100:017D }
  Exit(g_681A); { 6100:018E }
end; { routine anchor; statement location unresolved } { 6100:0123 }
```

### ov13:0191 FUN_6100_0191 (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Word [BP+$08]; param_3: Word [BP+$0A]; param_4: LongWord [BP+$0C].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot].  
Callers: FUN_6100_1406.  
Callees: FUN_6100_2574, VisitEffectHooks, RollDiceWithCount.

M behavioral evidence: base damage roll plus character attack bonus, possible backstab multiplier, effect hooks 4 and 5. Export warns of a removed unreachable block; assembly remains authoritative.

```pascal
procedure FUN_6100_0191(param_1: Byte; param_2: Word; param_3: Word; param_4: LongWord); { 6100:0191 }
begin { routine anchor; statement location unresolved } { 6100:0191 }
  uVar3 := Word((LongWord(param_4) shr $10)); { routine anchor; statement location unresolved } { 6100:0191 }
  iVar2 := Integer(param_4); { routine anchor; statement location unresolved } { 6100:0191 }
  cVar1 := RollDiceWithCount((P_Byte(((iVar2 + Word(param_1)) + $116)))^, (P_Byte(((iVar2 + Word(param_1)) + $114)))^); { 6100:01B4 }
  g_6818 := ((P_ShortInt(((iVar2 + Word(param_1)) + $118)))^ + cVar1); { 6100:01CF }
  cVar1 := FUN_6100_2574(param_2, param_3, iVar2, uVar3); { 6100:01EB }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:0191 }
    begin { routine anchor; statement location unresolved } { 6100:0191 }
      g_6818 := (g_6818 * (ShortInt((Word(Integer((P_ShortInt((iVar2 + $9C)))^)) shr 2)) + 2)); { 6100:01D9 }
    end; { routine anchor; statement location unresolved } { 6100:0191 }
  g_6819 := 0; { 6100:020D }
  VisitEffectHooks(iVar2, uVar3, 4); { 6100:021B }
  VisitEffectHooks(param_2, param_3, Pack16(UNKNOWN_extraout_AH, 5)); { 6100:0229 }
  Exit; { 6100:022F }
end; { routine anchor; statement location unresolved } { 6100:0191 }
```

### ov13:02F9 ReportAttack (conf M)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: ShortInt [BP+$08]; param_3: ShortInt [BP+$0A]; param_4: ShortInt [BP+$0C]; param_5: LongWord [BP+$0E]; param_6: Word [BP+$12]; param_7: Word [BP+$14].  
Locals: bVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Byte [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; puVar9: P_Byte [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; iVar11: Integer [compiler temporary; no proven BP slot]; local_254: array[0..255] of Byte [BP-$252]; local_154: array[0..242] of Byte [BP-$152]; local_61: array[0..2] of Byte [BP-$5F]; local_5e: array[0..9] of Byte [BP-$5C]; local_54: array[0..80] of Byte [BP-$52]; local_3: Byte [BP-$1].  
Callers: FUN_6100_1406.  
Callees: FUN_00ba_1037, FUN_00ba_148b, FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_1816, FUN_00ba_2228, FUN_0709_0626, FUN_0709_0768, FUN_0709_0dbe, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, VisitEffectHooks, ov24_100A, ov31_0E11.

M: text-based attack report; preserve backstab, helpless victim, rear attack, hit/miss, lost-spell, dying/killed branches independently.

```pascal
procedure ReportAttack(param_1: ShortInt; param_2: ShortInt; param_3: ShortInt; param_4: ShortInt; param_5: LongWord; param_6: Word; param_7: Word); { 6100:02F9 }
begin { routine anchor; statement location unresolved } { 6100:02F9 }
  if (param_4 = 2) then { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      PString(local_54, SS) := Copy('-Backstabs-', 1, $50); { 6100:0315 }
      bVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 6100:02F9 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  else { routine anchor; statement location unresolved } { 6100:02F9 }
    if (param_4 = 3) then { routine anchor; statement location unresolved } { 6100:02F9 }
      begin { routine anchor; statement location unresolved } { 6100:02F9 }
        PString(local_54, SS) := Copy('slays helpless', 1, $50); { 6100:032E }
        bVar4 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 6100:02F9 }
      end; { routine anchor; statement location unresolved } { 6100:02F9 }
    else { routine anchor; statement location unresolved } { 6100:02F9 }
      begin { routine anchor; statement location unresolved } { 6100:02F9 }
        PString(local_54, SS) := Copy('Attacks', 1, $50); { 6100:0343 }
        bVar4 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 6100:02F9 }
      end; { routine anchor; statement location unresolved } { 6100:02F9 }
  FUN_00ba_16ec((Word(bVar4) shl 8), Pack16(bVar4, 10), local_54, SS, param_6, param_7); { 6100:0359 }
  local_3 := 12; { 6100:035E }
  uVar6 := $BA; { routine anchor; statement location unresolved } { 6100:02F9 }
  FUN_00ba_1816((Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, $C), Pack16(UNKNOWN_extraout_AH_02, $17), Integer(param_5), Slice16(param_5, 2)); { 6100:0372 }
  local_3 := (local_3 + 1); { 6100:0377 }
  if (param_4 = 1) then { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      uVar6 := $AF8; { routine anchor; statement location unresolved } { 6100:02F9 }
      PString(local_54, SS) := Copy('(from behind) ', 1, $50); { 6100:038E }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  else { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      local_54[0] := 0; { routine anchor; statement location unresolved } { 6100:02F9 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  if (param_1 = 0) then { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      puVar8 := local_154; { routine anchor; statement location unresolved } { 6100:02F9 }
      uVar6 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
      PString(local_54, SS) := PString(local_54, SS); { 6100:03C9 }
      PString(local_54, SS) := Copy(PString(local_54, SS) + 'and Misses', 1, 255); { 6100:03D3 }
      PString(local_54, SS) := Copy(PString(puVar8, uVar6), 1, $50); { 6100:03B6 }
      uVar5 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 6100:02F9 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  else { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      if (param_4 = 3) then { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          PString(local_54, SS) := Copy(PString($264, uVar6), 1, $50); { 6100:03F5 }
          uVar5 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 6100:02F9 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
      else { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          puVar8 := local_154; { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar10 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
          PString(local_54, SS) := PString(local_54, SS); { 6100:040B }
          PString(local_54, SS) := Copy(PString(local_54, SS) + 'Hitting for ', 1, 255); { 6100:03E7 }
          puVar9 := local_254; { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar6 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
          FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH_04, param_2)); { 6100:03E2 }
          PString(local_54, SS) := Copy(PString(local_54, SS) + PString(puVar9, uVar6), 1, 255); { 6100:0415 }
          PString(local_54, SS) := Copy(PString(puVar8, uVar10), 1, $50); { 6100:0423 }
          if (param_2 = 1) then { routine anchor; statement location unresolved } { 6100:02F9 }
            begin { routine anchor; statement location unresolved } { 6100:02F9 }
              puVar8 := local_154; { routine anchor; statement location unresolved } { 6100:02F9 }
              uVar6 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
              PString(local_54, SS) := PString(local_54, SS); { 6100:0435 }
              PString(local_54, SS) := Copy(PString(local_54, SS) + ' point ', 1, 255); { 6100:043F }
              PString(local_54, SS) := Copy(PString(puVar8, uVar6), 1, $50); { 6100:044D }
            end; { routine anchor; statement location unresolved } { 6100:02F9 }
          else { routine anchor; statement location unresolved } { 6100:02F9 }
            begin { routine anchor; statement location unresolved } { 6100:02F9 }
              puVar8 := local_154; { routine anchor; statement location unresolved } { 6100:02F9 }
              uVar6 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
              PString(local_54, SS) := PString(local_54, SS); { 6100:045D }
              PString(local_54, SS) := Copy(PString(local_54, SS) + ' points ', 1, 255); { 6100:0467 }
              PString(local_54, SS) := Copy(PString(puVar8, uVar6), 1, $50); { 6100:0475 }
            end; { routine anchor; statement location unresolved } { 6100:02F9 }
          puVar8 := local_154; { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar6 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
          PString(local_54, SS) := PString(local_54, SS); { 6100:0496 }
          PString(local_54, SS) := Copy(PString(local_54, SS) + 'of damage', 1, 255); { 6100:04A0 }
          PString(local_54, SS) := Copy(PString(puVar8, uVar6), 1, $50); { 6100:04AE }
          uVar5 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 6100:02F9 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
      FUN_00ba_2228(Pack16(uVar5, param_3), Integer(param_5), Slice16(param_5, 2)); { 6100:0484 }
      uVar5 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 6100:02F9 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  uVar7 := Byte(((local_3 + 3) shr 8)); { routine anchor; statement location unresolved } { 6100:02F9 }
  FUN_0709_0768(local_54, SS, Pack16(uVar7, 1), Pack16(uVar7, 10), (local_3 + 3), Pack16(uVar5, $26), Pack16(uVar5, local_3), Pack16(uVar5, $17)); { 6100:04D1 }
  local_3 := (g_5E25 + 1); { 6100:04DC }
  if (param_3 = 0) then { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      uVar6 := $709; { routine anchor; statement location unresolved } { 6100:02F9 }
      FUN_0709_0dbe(); { 6100:0500 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  else { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      (P_Byte((Integer((P_LongWord((Integer(param_5) + $108)))^) + 1)))^ := 0; { routine anchor; statement location unresolved } { 6100:02F9 }
      if ((P_ShortInt((P_LongWord((Integer(param_5) + $108)))^))^ = 0) then { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar6 := $709; { routine anchor; statement location unresolved } { 6100:02F9 }
          FUN_0709_0dbe(); { 6100:0544 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
      else { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          FUN_0709_0dbe(); { 6100:054B }
          puVar8 := local_61; { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar6 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
          iVar11 := Integer(param_5); { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar10 := Slice16(param_5, 2); { routine anchor; statement location unresolved } { 6100:02F9 }
          PString(local_61, SS) := 'lost a spell'; { 6100:0515 }
          FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_08, 1), Pack16(UNKNOWN_extraout_AH_08, $C), puVar8, uVar6, iVar11, uVar10); { 6100:0520 }
          uVar6 := $BA; { routine anchor; statement location unresolved } { 6100:02F9 }
          FUN_00ba_148b(Pack16(UNKNOWN_extraout_AH_09, (P_Byte((P_LongWord((Integer(param_5) + $108)))^))^)); { 6100:0531 }
          (P_Byte((P_LongWord((Integer(param_5) + $108)))^))^ := 0; { routine anchor; statement location unresolved } { 6100:02F9 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  if ((P_ShortInt((Integer(param_5) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 6100:02F9 }
    begin { routine anchor; statement location unresolved } { 6100:02F9 }
      puVar8 := local_5e; { routine anchor; statement location unresolved } { 6100:02F9 }
      uVar10 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
      iVar11 := Integer(param_5); { routine anchor; statement location unresolved } { 6100:02F9 }
      uVar1 := Slice16(param_5, 2); { routine anchor; statement location unresolved } { 6100:02F9 }
      PString(local_5e, SS) := 'goes down'; { 6100:056E }
      uVar6 := $BA; { routine anchor; statement location unresolved } { 6100:02F9 }
      FUN_00ba_16ec((Word(UNKNOWN_extraout_AH_10) shl 8), Pack16(UNKNOWN_extraout_AH_10, local_3), puVar8, uVar10, iVar11, uVar1); { 6100:057A }
      local_3 := (local_3 + 2); { 6100:057F }
      uVar7 := ((P_ShortInt((Integer(param_5) + $10C)))^ = 5); { routine anchor; statement location unresolved } { 6100:02F9 }
      uVar5 := UNKNOWN_extraout_AH_11; { routine anchor; statement location unresolved } { 6100:02F9 }
      if Boolean(uVar7) then { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar1 := Pack16(UNKNOWN_extraout_AH_11, $17); { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar2 := Pack16(UNKNOWN_extraout_AH_11, local_3); { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar3 := Pack16(UNKNOWN_extraout_AH_11, 10); { routine anchor; statement location unresolved } { 6100:02F9 }
          puVar8 := local_61; { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar10 := SS; { routine anchor; statement location unresolved } { 6100:02F9 }
          PString(local_61, SS) := 'and is Dying'; { 6100:05A2 }
          uVar6 := $709; { routine anchor; statement location unresolved } { 6100:02F9 }
          FUN_0709_0626(puVar8, uVar10, uVar3, uVar2, uVar1); { 6100:05A7 }
          uVar5 := UNKNOWN_extraout_AH_12; { routine anchor; statement location unresolved } { 6100:02F9 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
      Flags.ZF := not (LoByte(Pack16(uVar5, (P_Byte((Integer(param_5) + $10C)))^)) in [6, 7, 8]); { 6100:05BA }
      if not (Boolean(uVar7)) then { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          puVar8 := local_5e; { routine anchor; statement location unresolved } { 6100:02F9 }
          iVar11 := Integer(param_5); { routine anchor; statement location unresolved } { 6100:02F9 }
          uVar6 := Slice16(param_5, 2); { routine anchor; statement location unresolved } { 6100:02F9 }
          PString(local_5e, SS) := 'is killed'; { 6100:05D1 }
          FUN_00ba_16ec((Word(UNKNOWN_extraout_AH_13) shl 8), Pack16(UNKNOWN_extraout_AH_13, local_3), puVar8, SS, iVar11, uVar6); { 6100:05DD }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
      local_3 := (local_3 + 2); { 6100:05E2 }
      ov24_100A(Integer(param_5), Slice16(param_5, 2)); { 6100:05EC }
      VisitEffectHooks(Integer(param_5), Slice16(param_5, 2), Pack16(UNKNOWN_extraout_AH_14, $D)); { 6100:05FA }
      if ((P_ShortInt((Integer(param_5) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          ov31_0E11(Integer(param_5), Slice16(param_5, 2)); { 6100:0610 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
      else { routine anchor; statement location unresolved } { 6100:02F9 }
        begin { routine anchor; statement location unresolved } { 6100:02F9 }
          FUN_0709_0dbe(); { 6100:0617 }
        end; { routine anchor; statement location unresolved } { 6100:02F9 }
    end; { routine anchor; statement location unresolved } { 6100:02F9 }
  FUN_00ba_17e3(); { 6100:061C }
  Exit; { 6100:0624 }
end; { routine anchor; statement location unresolved } { 6100:02F9 }
```

### ov13:0627 FUN_6100_0627 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; local_9: Byte [BP-$7]; local_8: Integer [BP-$6]; uStack_6: Word [BP-$4]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: ov13_0712.  
Callees: FUN_00ba_0b73, FUN_00ba_2433, ov13_17F6, ov13_1884, ov31_0996, ov31_0BE7, ov31_0C0F.

```pascal
procedure FUN_6100_0627(param_1: LongWord); { 6100:0627 }
begin { routine anchor; statement location unresolved } { 6100:0627 }
  bVar1 := FUN_00ba_2433(1, Integer(param_1), Slice16(param_1, 2)); { 6100:0636 }
  if (bVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:0627 }
    begin { routine anchor; statement location unresolved } { 6100:0627 }
      local_4 := 1; { 6100:064E }
      local_3 := bVar1; { 6100:063B }
      while true do { routine anchor; statement location unresolved } { 6100:0627 }
        begin { routine anchor; statement location unresolved } { 6100:0627 }
          if ((P_ShortInt((Integer(param_1) + $10D)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:0627 }
            begin { routine anchor; statement location unresolved } { 6100:0627 }
              iVar5 := (Word((P_Byte((local_4 + $6DE4)))^) * 4); { routine anchor; statement location unresolved } { 6100:0627 }
              local_8 := (P_Integer((iVar5 + $65B9)))^; { 6100:067F }
              uStack_6 := (P_Word((iVar5 + $65BB)))^; { 6100:0682 }
              if (((P_ShortInt((Integer((P_LongWord((local_8 + $108)))^) + 7)))^ <> 0) and then Sequence((cVar2 := FUN_00ba_0b73(local_8, uStack_6)); (cVar2 = 0))) then { 6100:069A }
                begin { routine anchor; statement location unresolved } { 6100:0627 }
                  uVar3 := ov31_0BE7(Integer(param_1), Slice16(param_1, 2)); { 6100:06A9 }
                  uVar4 := ov31_0C0F(Integer(param_1), Slice16(param_1, 2)); { 6100:06B5 }
                  ov31_0996(8, 2, uVar4, uVar3); { 6100:06C1 }
                  (P_Byte((Integer((P_LongWord((local_8 + $108)))^) + 7)))^ := 0; { routine anchor; statement location unresolved } { 6100:0627 }
                  ov13_17F6(Integer(param_1), Slice16(param_1, 2), local_8, uStack_6); { 6100:06E0 }
                  ov13_1884(@(local_9), SS, 0, 0, (Word(UNKNOWN_extraout_AH) shl 8), Integer(param_1), Slice16(param_1, 2), local_8, uStack_6); { 6100:06FE }
                end; { routine anchor; statement location unresolved } { 6100:0627 }
            end; { routine anchor; statement location unresolved } { 6100:0627 }
          if (local_4 = bVar1) then { routine anchor; statement location unresolved } { 6100:0627 }
            Break; { routine anchor; statement location unresolved } { 6100:0627 }
          local_4 := (local_4 + 1); { 6100:0653 }
        end; { routine anchor; statement location unresolved } { 6100:0627 }
    end; { routine anchor; statement location unresolved } { 6100:0627 }
  Exit; { 6100:070F }
end; { routine anchor; statement location unresolved } { 6100:0627 }
```

### ov13:0712 ov13_0712 (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: LongWord [BP+$08].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; cVar4: ShortInt [compiler temporary; no proven BP slot]; cVar5: ShortInt [compiler temporary; no proven BP slot]; cVar6: ShortInt [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_0b73, FUN_08ae_00dc, FUN_6100_0627, ov31_03A0, ov31_052B, ov31_06E9, ov31_0996, ov31_0C5F.

```pascal
procedure ov13_0712(param_1: Byte; param_2: LongWord); { 6100:0712 }
begin { routine anchor; statement location unresolved } { 6100:0712 }
  if Boolean((param_1 and 1)) then { routine anchor; statement location unresolved } { 6100:0712 }
    begin { routine anchor; statement location unresolved } { 6100:0712 }
      local_3 := 3; { 6100:071F }
    end; { routine anchor; statement location unresolved } { 6100:0712 }
  else { routine anchor; statement location unresolved } { 6100:0712 }
    begin { routine anchor; statement location unresolved } { 6100:0712 }
      local_3 := 2; { 6100:0725 }
    end; { routine anchor; statement location unresolved } { 6100:0712 }
  uVar9 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 6100:0712 }
  iVar8 := Integer(param_2); { routine anchor; statement location unresolved } { 6100:0712 }
  if ((P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ < local_3) then { routine anchor; statement location unresolved } { 6100:0712 }
    begin { routine anchor; statement location unresolved } { 6100:0712 }
      (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ := 0; { routine anchor; statement location unresolved } { 6100:0712 }
    end; { routine anchor; statement location unresolved } { 6100:0712 }
  else { routine anchor; statement location unresolved } { 6100:0712 }
    begin { routine anchor; statement location unresolved } { 6100:0712 }
      pcVar1 := P_ShortInt((Integer((P_LongWord((iVar8 + $108)))^) + 6)); { routine anchor; statement location unresolved } { 6100:0712 }
      (pcVar1)^ := ((pcVar1)^ - local_3); { routine anchor; statement location unresolved } { 6100:0712 }
      bVar3 := ov31_0C5F(iVar8, uVar9); { 6100:075F }
      cVar6 := (P_ShortInt(((Word(bVar3) * 4) + $5F27)))^; { routine anchor; statement location unresolved } { 6100:0712 }
      cVar2 := (P_ShortInt(((Word(bVar3) * 4) + $5F28)))^; { routine anchor; statement location unresolved } { 6100:0712 }
      cVar4 := (cVar6 + (P_ShortInt((param_1 + $2736)))^); { routine anchor; statement location unresolved } { 6100:0712 }
      uVar7 := (Integer(cVar2) + Integer((P_ShortInt((param_1 + $273F)))^)); { routine anchor; statement location unresolved } { 6100:0712 }
      cVar5 := ShortInt(uVar7); { routine anchor; statement location unresolved } { 6100:0712 }
      local_3 := 1; { 6100:07B9 }
      if ((P_ShortInt((iVar8 + $10F)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:0712 }
        begin { routine anchor; statement location unresolved } { 6100:0712 }
          local_3 := 3; { 6100:07C8 }
          uVar10 := Word((LongWord(g_6716) shr $10)); { routine anchor; statement location unresolved } { 6100:0712 }
          uVar7 := ov31_06E9((Integer(cVar5) - Integer((P_ShortInt((Integer(g_6716) + 3)))^)), (Integer(cVar4) - Integer((P_ShortInt((Integer(g_6716) + 2)))^))); { 6100:07F0 }
          if (ShortInt(uVar7) = 0) then { routine anchor; statement location unresolved } { 6100:0712 }
            begin { routine anchor; statement location unresolved } { 6100:0712 }
              uVar7 := ov31_0996(8, 2, cVar2, cVar6); { 6100:0807 }
            end; { routine anchor; statement location unresolved } { 6100:0712 }
        end; { routine anchor; statement location unresolved } { 6100:0712 }
      ov31_052B(bVar3, ((uVar7 shr 8) shl 8), ((uVar7 shr 8) shl 8)); { 6100:0816 }
      (P_ShortInt(((Word(bVar3) * 4) + $5F27)))^ := cVar4; { routine anchor; statement location unresolved } { 6100:0712 }
      (P_ShortInt(((Word(bVar3) * 4) + $5F28)))^ := cVar5; { routine anchor; statement location unresolved } { 6100:0712 }
      ov31_03A0(); { 6100:083F }
      ov31_0996(Pack16(UNKNOWN_extraout_AH, 8), Pack16(UNKNOWN_extraout_AH, local_3), Pack16(UNKNOWN_extraout_AH, cVar5), Pack16(UNKNOWN_extraout_AH, cVar4)); { 6100:0853 }
      (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $F)))^ := 0; { routine anchor; statement location unresolved } { 6100:0712 }
      (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + $12)))^ := 0; { routine anchor; statement location unresolved } { 6100:0712 }
      FUN_08ae_00dc(g_2628); { 6100:0876 }
      FUN_6100_0627(iVar8, uVar9); { 6100:0882 }
      if (((P_ShortInt((iVar8 + $10D)))^ <> 0) and then Sequence((cVar6 := FUN_00ba_0b73(iVar8, uVar9)); (cVar6 = 0))) then { 6100:0896 }
        begin { routine anchor; statement location unresolved } { 6100:0712 }
          Exit; { 6100:08AF }
        end; { routine anchor; statement location unresolved } { 6100:0712 }
      (P_Byte((Integer((P_LongWord((iVar8 + $108)))^) + 6)))^ := 0; { routine anchor; statement location unresolved } { 6100:0712 }
    end; { routine anchor; statement location unresolved } { 6100:0712 }
  Exit; { 6100:08AF }
end; { routine anchor; statement location unresolved } { 6100:0712 }
```

### ov13:08B2 ov13_08B2 (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: LongWord [BP+$08].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar4: Boolean [compiler temporary; no proven BP slot]; bVar5: Byte [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; cVar7: ShortInt [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; uVar12: Word [compiler temporary; no proven BP slot]; iVar13: Integer [compiler temporary; no proven BP slot]; local_1d: Byte [BP-$1B]; local_1c: Byte [BP-$1A]; local_1b: Byte [BP-$19]; local_1a: Byte [BP-$18]; local_19: Byte [BP-$17]; local_12: array[0..2] of Byte [BP-$10]; abStack_f: array[0..12] of Byte [BP-$D].  
Callers: none recorded.  
Callees: FUN_00ba_09e3, FUN_00ba_0b73, FUN_00ba_2199, FUN_00ba_2433, System.FillChar, ov13_1085, ov13_1884, ov30_057B, ov31_0BE7, ov31_0C0F, ov31_0C5F.

```pascal
procedure ov13_08B2(param_1: Byte; param_2: LongWord); { 6100:08B2 }
begin { routine anchor; statement location unresolved } { 6100:08B2 }
  FillChar(MemRef((abStack_f + 1), SS), $C, 0); { 6100:08C4 }
  uVar8 := ov31_0C5F(Integer(param_2), Slice16(param_2, 2)); { 6100:08CF }
  bVar5 := FUN_00ba_2433(1, Integer(param_2), Slice16(param_2, 2)); { 6100:08E0 }
  if (bVar5 <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
    begin { routine anchor; statement location unresolved } { 6100:08B2 }
      if (bVar5 <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
        begin { routine anchor; statement location unresolved } { 6100:08B2 }
          local_1a := 1; { 6100:08FE }
          while Sequence((abStack_f[local_1a] := (P_Byte((local_1a + $6DE4)))^); (local_1a <> bVar5)) do { routine anchor; statement location unresolved } { 6100:08B2 }
          begin { routine anchor; statement location unresolved } { 6100:08B2 }
            begin { routine anchor; statement location unresolved } { 6100:08B2 }
            end; { routine anchor; statement location unresolved } { 6100:08B2 }
            local_1a := (local_1a + 1); { 6100:0903 }
          end; { routine anchor; statement location unresolved } { 6100:08B2 }
        end; { routine anchor; statement location unresolved } { 6100:08B2 }
      pcVar1 := P_ShortInt((((uVar8 and $FF) * 4) + $5F27)); { routine anchor; statement location unresolved } { 6100:08B2 }
      (pcVar1)^ := ((pcVar1)^ + (P_ShortInt((param_1 + $2736)))^); { routine anchor; statement location unresolved } { 6100:08B2 }
      pcVar1 := P_ShortInt((((uVar8 and $FF) * 4) + $5F28)); { routine anchor; statement location unresolved } { 6100:08B2 }
      (pcVar1)^ := ((pcVar1)^ + (P_ShortInt((param_1 + $273F)))^); { routine anchor; statement location unresolved } { 6100:08B2 }
      bVar6 := FUN_00ba_2433(1, Integer(param_2), Slice16(param_2, 2)); { 6100:0960 }
      pcVar1 := P_ShortInt((((uVar8 and $FF) * 4) + $5F27)); { routine anchor; statement location unresolved } { 6100:08B2 }
      (pcVar1)^ := ((pcVar1)^ - (P_ShortInt((param_1 + $2736)))^); { routine anchor; statement location unresolved } { 6100:08B2 }
      pcVar1 := P_ShortInt((((uVar8 and $FF) * 4) + $5F28)); { routine anchor; statement location unresolved } { 6100:08B2 }
      (pcVar1)^ := ((pcVar1)^ - (P_ShortInt((param_1 + $273F)))^); { routine anchor; statement location unresolved } { 6100:08B2 }
      if (bVar5 <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
        begin { routine anchor; statement location unresolved } { 6100:08B2 }
          local_1a := 1; { 6100:09A9 }
          while true do { routine anchor; statement location unresolved } { 6100:08B2 }
            begin { routine anchor; statement location unresolved } { 6100:08B2 }
              bVar4 := false; { routine anchor; statement location unresolved } { 6100:08B2 }
              if (bVar6 <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
                begin { routine anchor; statement location unresolved } { 6100:08B2 }
                  local_19 := 1; { 6100:09C2 }
                  while true do { routine anchor; statement location unresolved } { 6100:08B2 }
                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                      if ((P_Byte((local_19 + $6DE4)))^ = abStack_f[local_1a]) then { routine anchor; statement location unresolved } { 6100:08B2 }
                        begin { routine anchor; statement location unresolved } { 6100:08B2 }
                          bVar4 := true; { routine anchor; statement location unresolved } { 6100:08B2 }
                        end; { routine anchor; statement location unresolved } { 6100:08B2 }
                      if (local_19 = bVar6) then { routine anchor; statement location unresolved } { 6100:08B2 }
                        Break; { routine anchor; statement location unresolved } { 6100:08B2 }
                      local_19 := (local_19 + 1); { 6100:09C7 }
                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                end; { routine anchor; statement location unresolved } { 6100:08B2 }
              if bVar4 then { routine anchor; statement location unresolved } { 6100:08B2 }
                begin { routine anchor; statement location unresolved } { 6100:08B2 }
                  abStack_f[local_1a] := 0; { routine anchor; statement location unresolved } { 6100:08B2 }
                end; { routine anchor; statement location unresolved } { 6100:08B2 }
              if (local_1a = bVar5) then { routine anchor; statement location unresolved } { 6100:08B2 }
                Break; { routine anchor; statement location unresolved } { 6100:08B2 }
              local_1a := (local_1a + 1); { 6100:09AE }
            end; { routine anchor; statement location unresolved } { 6100:08B2 }
        end; { routine anchor; statement location unresolved } { 6100:08B2 }
      if (bVar5 <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
        begin { routine anchor; statement location unresolved } { 6100:08B2 }
          local_1a := 1; { 6100:0A18 }
          repeat { routine anchor; statement location unresolved } { 6100:08B2 }
            begin { routine anchor; statement location unresolved } { 6100:08B2 }
              if ((abStack_f[local_1a] <> 0) and then ((P_ShortInt((Integer(param_2) + $10D)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:08B2 }
                begin { routine anchor; statement location unresolved } { 6100:08B2 }
                  bVar4 := false; { routine anchor; statement location unresolved } { 6100:08B2 }
                  iVar2 := (P_Integer(((Word(abStack_f[local_1a]) * 4) + $65B9)))^; { routine anchor; statement location unresolved } { 6100:08B2 }
                  uVar3 := (P_Word(((Word(abStack_f[local_1a]) * 4) + $65BB)))^; { routine anchor; statement location unresolved } { 6100:08B2 }
                  cVar7 := FUN_00ba_0b73(iVar2, uVar3); { 6100:0A68 }
                  if ((cVar7 = 0) and then (Sequence((cVar7 := ov13_1085(Integer(param_2), Slice16(param_2, 2), iVar2, uVar3)); ((cVar7 <> 0) and then Sequence((cVar7 := FUN_00ba_2199(local_12, SS, $4B, iVar2, uVar3)); (cVar7 = 0)))) and then Sequence((cVar7 := FUN_00ba_2199(local_12, SS, $4A, iVar2, uVar3)); (cVar7 = 0)))) then { 6100:0AB3 }
                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                      bVar6 := ((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + 9)))^ + 10); { routine anchor; statement location unresolved } { 6100:08B2 }
                      local_1d := ((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + 9)))^ + 6); { 6100:0AEC }
                      if (local_1d <= bVar6) then { routine anchor; statement location unresolved } { 6100:08B2 }
                        begin { routine anchor; statement location unresolved } { 6100:08B2 }
                          repeat { routine anchor; statement location unresolved } { 6100:08B2 }
                            begin { routine anchor; statement location unresolved } { 6100:08B2 }
                              if not (bVar4) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                  if (((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + 3)))^ < 1) and then ((P_ShortInt((Integer((P_LongWord((iVar2 + $108)))^) + $F)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                      uVar9 := ov31_0BE7(iVar2, uVar3); { 6100:0B21 }
                                      uVar10 := ov31_0C0F(iVar2, uVar3); { 6100:0B2D }
                                      uVar11 := ov31_0BE7(Integer(param_2), Slice16(param_2, 2)); { 6100:0B39 }
                                      uVar12 := ov31_0C0F(Integer(param_2), Slice16(param_2, 2)); { 6100:0B45 }
                                      cVar7 := ov30_057B((Word(local_1d) mod 8), uVar12, uVar11, uVar10, uVar9); { 6100:0B58 }
                                      if (cVar7 = 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                        goto LAB_6100_0c33; { routine anchor; statement location unresolved } { 6100:08B2 }
                                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  local_1c := 1; { 6100:0B64 }
                                  if ((P_ShortInt((iVar2 + $A1)))^ = 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                      local_1c := 2; { 6100:0B73 }
                                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  local_1b := 1; { 6100:0B77 }
                                  while true do { routine anchor; statement location unresolved } { 6100:08B2 }
                                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                      if ((P_ShortInt(((iVar2 + Word(local_1b)) + $112)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                        begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                          local_1c := local_1b; { 6100:0B95 }
                                        end; { routine anchor; statement location unresolved } { 6100:08B2 }
                                      if (local_1b = 2) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                        Break; { routine anchor; statement location unresolved } { 6100:08B2 }
                                      local_1b := (local_1b + 1); { 6100:0B7D }
                                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  if ((P_ShortInt(((iVar2 + Word(local_1c)) + $112)))^ = 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                      (P_Byte(((iVar2 + Word(local_1c)) + $112)))^ := 1; { routine anchor; statement location unresolved } { 6100:08B2 }
                                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + 4)))^ := local_1c; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  uVar10 := Word((LongWord((P_LongWord((iVar2 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:08B2 }
                                  iVar13 := Integer((P_LongWord((iVar2 + $108)))^); { routine anchor; statement location unresolved } { 6100:08B2 }
                                  uVar9 := (P_Word((iVar13 + 10)))^; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  uVar10 := (P_Word((iVar13 + $C)))^; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  ov13_1884(P_Byte(@(g_6E31)), $C7C, 0, 0, Pack16(ShortInt((Word(uVar9) shr 8)), 1), Integer(param_2), Slice16(param_2, 2), iVar2, uVar3); { 6100:0C00 }
                                  bVar4 := true; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  uVar11 := Word((LongWord((P_LongWord((iVar2 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:08B2 }
                                  iVar13 := Integer((P_LongWord((iVar2 + $108)))^); { routine anchor; statement location unresolved } { 6100:08B2 }
                                  (P_Word((iVar13 + 10)))^ := uVar9; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  (P_Word((iVar13 + $C)))^ := uVar10; { routine anchor; statement location unresolved } { 6100:08B2 }
                                  if ((P_ShortInt((Integer(param_2) + $10D)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                    begin { routine anchor; statement location unresolved } { 6100:08B2 }
                                      FUN_00ba_09e3(Integer(param_2), Slice16(param_2, 2)); { 6100:0C2E }
                                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                                end; { routine anchor; statement location unresolved } { 6100:08B2 }
                              LAB_6100_0c33: { routine anchor; statement location unresolved } { 6100:08B2 }
                              if (local_1d = bVar6) then { routine anchor; statement location unresolved } { 6100:08B2 }
                                Break; { routine anchor; statement location unresolved } { 6100:08B2 }
                              local_1d := (local_1d + 1); { 6100:0AF1 }
                            end; { routine anchor; statement location unresolved } { 6100:08B2 }
                          until not (true); { routine anchor; statement location unresolved } { 6100:08B2 }
                        end; { routine anchor; statement location unresolved } { 6100:08B2 }
                    end; { routine anchor; statement location unresolved } { 6100:08B2 }
                end; { routine anchor; statement location unresolved } { 6100:08B2 }
              if (local_1a = bVar5) then { routine anchor; statement location unresolved } { 6100:08B2 }
                begin { routine anchor; statement location unresolved } { 6100:08B2 }
                  Exit; { 6100:0C4C }
                end; { routine anchor; statement location unresolved } { 6100:08B2 }
              local_1a := (local_1a + 1); { 6100:0A1D }
            end; { routine anchor; statement location unresolved } { 6100:08B2 }
          until not (true); { routine anchor; statement location unresolved } { 6100:08B2 }
        end; { routine anchor; statement location unresolved } { 6100:08B2 }
    end; { routine anchor; statement location unresolved } { 6100:08B2 }
  Exit; { 6100:0C4C }
end; { routine anchor; statement location unresolved } { 6100:08B2 }
```

### ov13:0C6A AttemptEscape (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_18: array[0..8] of Byte [BP-$16]; local_f: array[0..8] of Byte [BP-$D]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3]; local_4: ShortInt [BP-$2].  
Callers: none recorded.  
Callees: FUN_00ba_1693, FUN_00ba_2433, FUN_00ba_2637, System.@StrCopy, ov13_0123, ov13_2908, RollDice, ov24_0F06.

```pascal
function AttemptEscape(param_1: Word; param_2: Word): Word; { 6100:0C6A }
begin { routine anchor; statement location unresolved } { 6100:0C6A }
  local_4 := 0; { 6100:0C70 }
  uVar5 := $BA; { routine anchor; statement location unresolved } { 6100:0C6A }
  FUN_00ba_2433($FF, param_1, param_2); { 6100:0C7D }
  if (UNKNOWN_extraout_AL = 0) then { routine anchor; statement location unresolved } { 6100:0C6A }
    begin { routine anchor; statement location unresolved } { 6100:0C6A }
      local_4 := 1; { 6100:0C86 }
      uVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 6100:0C6A }
    end; { routine anchor; statement location unresolved } { 6100:0C6A }
  else { routine anchor; statement location unresolved } { 6100:0C6A }
    begin { routine anchor; statement location unresolved } { 6100:0C6A }
      uVar1 := ov13_0123(param_1, param_2); { 6100:0C93 }
      local_6 := Byte(((uVar1 and $FF) shr 1)); { 6100:0C9A }
      uVar2 := ov13_2908(param_1, param_2); { 6100:0CA4 }
      local_5 := Byte(uVar2); { 6100:0CA7 }
      uVar4 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 6100:0C6A }
      if (local_5 < local_6) then { routine anchor; statement location unresolved } { 6100:0C6A }
        begin { routine anchor; statement location unresolved } { 6100:0C6A }
          local_4 := 1; { 6100:0CB2 }
        end; { routine anchor; statement location unresolved } { 6100:0C6A }
      else { routine anchor; statement location unresolved } { 6100:0C6A }
        if (local_5 = local_6) then { routine anchor; statement location unresolved } { 6100:0C6A }
          begin { routine anchor; statement location unresolved } { 6100:0C6A }
            uVar5 := $B0; { routine anchor; statement location unresolved } { 6100:0C6A }
            RollDice(Pack16(uVar4, 2), Pack16(uVar4, 1)); { 6100:0CC6 }
            uVar4 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 6100:0C6A }
            if (UNKNOWN_extraout_AL_00 = 1) then { routine anchor; statement location unresolved } { 6100:0C6A }
              begin { routine anchor; statement location unresolved } { 6100:0C6A }
                local_4 := 1; { 6100:0CCF }
              end; { routine anchor; statement location unresolved } { 6100:0C6A }
          end; { routine anchor; statement location unresolved } { 6100:0C6A }
    end; { routine anchor; statement location unresolved } { 6100:0C6A }
  if (local_4 = 0) then { routine anchor; statement location unresolved } { 6100:0C6A }
    begin { routine anchor; statement location unresolved } { 6100:0C6A }
      puVar6 := local_18; { routine anchor; statement location unresolved } { 6100:0C6A }
      PString(local_f, SS) := 'Escape is blocked'; { 6100:0CEC }
      FUN_00ba_1693(puVar6, SS); { 6100:0D07 }
    end; { routine anchor; statement location unresolved } { 6100:0C6A }
  else { routine anchor; statement location unresolved } { 6100:0C6A }
    begin { routine anchor; statement location unresolved } { 6100:0C6A }
      uVar3 := Pack16(uVar4, 3); { routine anchor; statement location unresolved } { 6100:0C6A }
      puVar6 := local_f; { routine anchor; statement location unresolved } { 6100:0C6A }
      uVar2 := param_1; { routine anchor; statement location unresolved } { 6100:0C6A }
      uVar7 := param_2; { routine anchor; statement location unresolved } { 6100:0C6A }
      PString(local_18, SS) := 'Got Away'; { 6100:0D02 }
      ov24_0F06(puVar6, SS, uVar3, uVar2, uVar7); { 6100:0CF1 }
    end; { routine anchor; statement location unresolved } { 6100:0C6A }
  uVar5 := FUN_00ba_2637(param_1, param_2); { 6100:0D12 }
  Exit(uVar5); { 6100:0D20 }
end; { routine anchor; statement location unresolved } { 6100:0C6A }
```

### ov13:0D23 ov13_0D23 (conf L)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_b: Integer [BP-$9]; iStack_9: Integer [BP-$7]; local_7: ShortInt [BP-$5]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: ov13_0000.  
Callees: FUN_00ba_2e03, FUN_00ba_2e8b, FUN_6100_0e52, VisitEffectHooks.

```pascal
procedure ov13_0D23(param_1: LongWord); { 6100:0D23 }
begin { routine anchor; statement location unresolved } { 6100:0D23 }
  local_7 := 0; { 6100:0D29 }
  uVar4 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:0D23 }
  iVar3 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:0D23 }
  local_4 := (P_Byte((iVar3 + $113)))^; { 6100:0D35 }
  (P_Byte((iVar3 + $113)))^ := (P_Byte((iVar3 + $A1)))^; { routine anchor; statement location unresolved } { 6100:0D23 }
  uVar1 := FUN_00ba_2e03(iVar3, uVar4); { 6100:0D4E }
  if (ShortInt(uVar1) <> 0) then { routine anchor; statement location unresolved } { 6100:0D23 }
    begin { routine anchor; statement location unresolved } { 6100:0D23 }
      uVar1 := FUN_00ba_2e8b(@(local_b), SS, iVar3, uVar4); { 6100:0D62 }
      if (ShortInt(uVar1) <> 0) then { routine anchor; statement location unresolved } { 6100:0D23 }
        begin { routine anchor; statement location unresolved } { 6100:0D23 }
          local_7 := 1; { 6100:0D6B }
          local_6 := (P_Byte(((Word((P_Byte((Integer((P_LongWord((iVar3 + $CC)))^) + $2E)))^) * $10) + $5587)))^; { 6100:0D87 }
          if (local_6 < 2) then { routine anchor; statement location unresolved } { 6100:0D23 }
            begin { routine anchor; statement location unresolved } { 6100:0D23 }
              local_6 := 2; { 6100:0D90 }
            end; { routine anchor; statement location unresolved } { 6100:0D23 }
          uVar2 := 0; { routine anchor; statement location unresolved } { 6100:0D23 }
          g_681A := local_6; { 6100:0D97 }
          goto LAB_6100_0da7; { routine anchor; statement location unresolved } { 6100:0D23 }
        end; { routine anchor; statement location unresolved } { 6100:0D23 }
    end; { routine anchor; statement location unresolved } { 6100:0D23 }
  g_681A := (P_Byte((iVar3 + $113)))^; { 6100:0DA4 }
  uVar2 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 6100:0D23 }
  LAB_6100_0da7: { routine anchor; statement location unresolved } { 6100:0D23 }
  g_681D := 0; { 6100:0DA7 }
  VisitEffectHooks(iVar3, uVar4, Pack16(uVar2, $12)); { 6100:0DB5 }
  local_3 := FUN_6100_0e52(Pack16(UNKNOWN_extraout_AH, g_681A)); { 6100:0DBF }
  if ((local_7 <> 0) and then ((local_b <> 0) or else (iStack_9 <> 0))) then { routine anchor; statement location unresolved } { 6100:0D23 }
    begin { routine anchor; statement location unresolved } { 6100:0D23 }
      local_5 := 1; { 6100:0DD3 }
      if (((local_b <> 0) or else (iStack_9 <> 0)) and then (1 < (P_Byte((local_b + $39)))^)) then { routine anchor; statement location unresolved } { 6100:0D23 }
        begin { routine anchor; statement location unresolved } { 6100:0D23 }
          local_5 := (P_Byte((local_b + $39)))^; { 6100:0DF2 }
        end; { routine anchor; statement location unresolved } { 6100:0D23 }
      if (local_5 < local_3) then { routine anchor; statement location unresolved } { 6100:0D23 }
        begin { routine anchor; statement location unresolved } { 6100:0D23 }
          local_3 := local_5; { 6100:0E00 }
        end; { routine anchor; statement location unresolved } { 6100:0D23 }
    end; { routine anchor; statement location unresolved } { 6100:0D23 }
  if ((((P_ShortInt((Integer((P_LongWord((iVar3 + $108)))^) + 8)))^ = 0) or else (local_3 < local_4)) or else (((P_ShortInt((Integer((P_LongWord((iVar3 + $108)))^) + 8)))^ <> 0) and then ((Word(local_3) < (Word(local_4) * 2)) and then (local_7 = 0)))) then { routine anchor; statement location unresolved } { 6100:0D23 }
    begin { routine anchor; statement location unresolved } { 6100:0D23 }
      (P_Byte((iVar3 + $113)))^ := local_3; { routine anchor; statement location unresolved } { 6100:0D23 }
    end; { routine anchor; statement location unresolved } { 6100:0D23 }
  Exit; { 6100:0E4F }
end; { routine anchor; statement location unresolved } { 6100:0D23 }
```

### ov13:0E52 FUN_6100_0e52 (conf L)

Params (stack slots): param_1: Byte [BP+$06].  
Locals: local_4: Byte [BP-$2].  
Callers: ov13_0000,ov13_0D23.  
Callees: none recorded.

```pascal
function FUN_6100_0e52(param_1: Byte): Byte; { 6100:0E52 }
begin { routine anchor; statement location unresolved } { 6100:0E52 }
  local_4 := param_1; { 6100:0E5B }
  if Boolean((g_6DE3 and 1)) then { routine anchor; statement location unresolved } { 6100:0E52 }
    begin { routine anchor; statement location unresolved } { 6100:0E52 }
      local_4 := (param_1 + 1); { 6100:0E65 }
    end; { routine anchor; statement location unresolved } { 6100:0E52 }
  Exit((local_4 shr 1)); { 6100:0E78 }
end; { routine anchor; statement location unresolved } { 6100:0E52 }
```

### ov13:0E82 SweepAttack (conf M)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; puVar8: P_Byte [compiler temporary; no proven BP slot]; iVar9: Integer [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; local_12: array[0..5] of Byte [BP-$10]; local_c: Byte [BP-$A]; local_b: Integer [BP-$9]; iStack_9: Integer [BP-$7]; local_7: Byte [BP-$5]; local_6: Byte [BP-$4]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: FUN_6100_2c3d.  
Callees: FUN_00ba_16ec, FUN_00ba_2433, FUN_00ba_255b, System.@StrCopy, ov13_17F6, ov13_1884, ov31_0C5F.

```pascal
function SweepAttack(param_1: LongWord; param_2: LongWord): Byte; { 6100:0E82 }
begin { routine anchor; statement location unresolved } { 6100:0E82 }
  local_3 := 0; { 6100:0E88 }
  uVar6 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 6100:0E82 }
  iVar3 := Integer(param_2); { routine anchor; statement location unresolved } { 6100:0E82 }
  if ((P_Byte((iVar3 + $113)))^ < (P_Byte((Integer((P_LongWord((iVar3 + $108)))^) + 5)))^) then { routine anchor; statement location unresolved } { 6100:0E82 }
    begin { routine anchor; statement location unresolved } { 6100:0E82 }
      iVar7 := Integer((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:0E82 }
      iVar4 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:0E82 }
      if (((P_ShortInt((iVar4 + $73)))^ = 0) and then Sequence((cVar2 := FUN_00ba_255b(iVar4, iVar7, iVar3, uVar6)); (cVar2 = 1))) then { 6100:0EBE }
        begin { routine anchor; statement location unresolved } { 6100:0E82 }
          local_c := FUN_00ba_2433(1, iVar3, uVar6); { 6100:0ED3 }
          local_5 := 0; { 6100:0EDB }
          if (local_c <> 0) then { routine anchor; statement location unresolved } { 6100:0E82 }
            begin { routine anchor; statement location unresolved } { 6100:0E82 }
              local_6 := 1; { 6100:0EEC }
              while true do { routine anchor; statement location unresolved } { 6100:0E82 }
                begin { routine anchor; statement location unresolved } { 6100:0E82 }
                  iVar5 := (Word((P_Byte((local_6 + $6DE4)))^) * 4); { routine anchor; statement location unresolved } { 6100:0E82 }
                  iVar9 := (P_Integer((iVar5 + $65B9)))^; { routine anchor; statement location unresolved } { 6100:0E82 }
                  iVar5 := (P_Integer((iVar5 + $65BB)))^; { routine anchor; statement location unresolved } { 6100:0E82 }
                  _local_b := FarBits(iVar5, iVar9); { routine anchor; statement location unresolved } { 6100:0E82 }
                  if ((iVar5 = iVar7) and then (iVar9 = iVar4)) then { routine anchor; statement location unresolved } { 6100:0E82 }
                    begin { routine anchor; statement location unresolved } { 6100:0E82 }
                      local_7 := local_6; { 6100:0F28 }
                    end; { routine anchor; statement location unresolved } { 6100:0E82 }
                  if ((P_ShortInt((iVar9 + $73)))^ = 0) then { routine anchor; statement location unresolved } { 6100:0E82 }
                    begin { routine anchor; statement location unresolved } { 6100:0E82 }
                      local_5 := (local_5 + 1); { 6100:0F35 }
                    end; { routine anchor; statement location unresolved } { 6100:0E82 }
                  if (local_6 = local_c) then { routine anchor; statement location unresolved } { 6100:0E82 }
                    Break; { routine anchor; statement location unresolved } { 6100:0E82 }
                  local_6 := (local_6 + 1); { 6100:0EF1 }
                end; { routine anchor; statement location unresolved } { 6100:0E82 }
            end; { routine anchor; statement location unresolved } { 6100:0E82 }
          if ((P_Byte((iVar3 + $113)))^ < local_5) then { routine anchor; statement location unresolved } { 6100:0E82 }
            begin { routine anchor; statement location unresolved } { 6100:0E82 }
              if ((P_Byte((Integer((P_LongWord((iVar3 + $108)))^) + 5)))^ < local_5) then { routine anchor; statement location unresolved } { 6100:0E82 }
                begin { routine anchor; statement location unresolved } { 6100:0E82 }
                  local_5 := (P_Byte((Integer((P_LongWord((iVar3 + $108)))^) + 5)))^; { 6100:0F6D }
                end; { routine anchor; statement location unresolved } { 6100:0E82 }
              puVar8 := local_12; { routine anchor; statement location unresolved } { 6100:0E82 }
              iVar9 := iVar3; { routine anchor; statement location unresolved } { 6100:0E82 }
              uVar10 := uVar6; { routine anchor; statement location unresolved } { 6100:0E82 }
              local_4 := local_c; { 6100:0ED8 }
              PString(local_12, SS) := 'sweeps'; { 6100:0F80 }
              FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar8, SS, iVar9, uVar10); { 6100:0F8B }
              iVar9 := (P_Integer(((Word(g_6DE5) * 4) + $65B9)))^; { routine anchor; statement location unresolved } { 6100:0E82 }
              iVar5 := (P_Integer(((Word(g_6DE5) * 4) + $65BB)))^; { routine anchor; statement location unresolved } { 6100:0E82 }
              _local_b := FarBits(iVar5, iVar9); { routine anchor; statement location unresolved } { 6100:0E82 }
              if ((iVar5 <> iVar7) or else (iVar9 <> iVar4)) then { routine anchor; statement location unresolved } { 6100:0E82 }
                begin { routine anchor; statement location unresolved } { 6100:0E82 }
                  (P_Byte((local_7 + $6DE4)))^ := g_6DE5; { routine anchor; statement location unresolved } { 6100:0E82 }
                  g_6DE5 := ov31_0C5F(iVar4, iVar7); { 6100:0FCE }
                end; { routine anchor; statement location unresolved } { 6100:0E82 }
              local_c := local_4; { 6100:0FD9 }
              if (local_4 <> 0) then { routine anchor; statement location unresolved } { 6100:0E82 }
                begin { routine anchor; statement location unresolved } { 6100:0E82 }
                  local_6 := 1; { 6100:0FE6 }
                  while true do { routine anchor; statement location unresolved } { 6100:0E82 }
                    begin { routine anchor; statement location unresolved } { 6100:0E82 }
                      if ((local_5 <> 0) and then Sequence((uVar1 := (P_LongWord(((Word((P_Byte((local_6 + $6DE4)))^) * 4) + $65B9)))^); ((P_ShortInt((Integer(uVar1) + $73)))^ = 0))) then { routine anchor; statement location unresolved } { 6100:0E82 }
                        begin { routine anchor; statement location unresolved } { 6100:0E82 }
                          iVar4 := (Word((P_Byte((local_6 + $6DE4)))^) * 4); { routine anchor; statement location unresolved } { 6100:0E82 }
                          local_b := (P_Word((iVar4 + $65B9)))^; { 6100:0F0F }
                          iStack_9 := (P_Word((iVar4 + $65BB)))^; { 6100:0F12 }
                          ov13_17F6(local_b, iStack_9, iVar3, uVar6); { 6100:1040 }
                          (P_Byte((iVar3 + $113)))^ := 1; { routine anchor; statement location unresolved } { 6100:0E82 }
                          ov13_1884(P_Byte(@(g_6E31)), $C7C, 0, 0, (Word(UNKNOWN_extraout_AH_00) shl 8), local_b, iStack_9, iVar3, uVar6); { 6100:1067 }
                          local_5 := (local_5 - 1); { 6100:106A }
                        end; { routine anchor; statement location unresolved } { 6100:0E82 }
                      if (local_6 = local_c) then { routine anchor; statement location unresolved } { 6100:0E82 }
                        Break; { routine anchor; statement location unresolved } { 6100:0E82 }
                      local_6 := (local_6 + 1); { 6100:0FEB }
                    end; { routine anchor; statement location unresolved } { 6100:0E82 }
                end; { routine anchor; statement location unresolved } { 6100:0E82 }
              local_3 := 1; { 6100:1078 }
            end; { routine anchor; statement location unresolved } { 6100:0E82 }
        end; { routine anchor; statement location unresolved } { 6100:0E82 }
    end; { routine anchor; statement location unresolved } { 6100:0E82 }
  Exit(local_3); { 6100:1082 }
end; { routine anchor; statement location unresolved } { 6100:0E82 }
```

### ov13:1085 ov13_1085 (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Integer [BP+$08]; param_3: LongWord [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: FUN_6100_2dfa,ov13_08B2,ov13_3558,ov13_37E4.  
Callees: VisitEffectHooks.

```pascal
function ov13_1085(param_1: Word; param_2: Integer; param_3: LongWord): Word; { 6100:1085 }
begin { routine anchor; statement location unresolved } { 6100:1085 }
  local_3 := 0; { 6100:108B }
  if ((param_1 = 0) and then (param_2 = 0)) then { routine anchor; statement location unresolved } { 6100:1085 }
    begin { routine anchor; statement location unresolved } { 6100:1085 }
      Slice16(param_3, 0) := 0; { routine anchor; statement location unresolved } { 6100:1085 }
    end; { routine anchor; statement location unresolved } { 6100:1085 }
  else { routine anchor; statement location unresolved } { 6100:1085 }
    if ((Slice16(param_3, 2) = param_2) and then (Word(param_3) = param_1)) then { routine anchor; statement location unresolved } { 6100:1085 }
      begin { routine anchor; statement location unresolved } { 6100:1085 }
        local_3 := 1; { 6100:10AA }
      end; { routine anchor; statement location unresolved } { 6100:1085 }
    else { routine anchor; statement location unresolved } { 6100:1085 }
      begin { routine anchor; statement location unresolved } { 6100:1085 }
        g_681E := 0; { 6100:10B0 }
        uVar1 := VisitEffectHooks(param_1, param_2, 1); { 6100:10BE }
        if (g_681E = 0) then { routine anchor; statement location unresolved } { 6100:1085 }
          begin { routine anchor; statement location unresolved } { 6100:1085 }
            uVar3 := Word((LongWord((P_LongWord((Word(param_3) + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:1085 }
            iVar2 := Integer((P_LongWord((Word(param_3) + $108)))^); { routine anchor; statement location unresolved } { 6100:1085 }
            uVar1 := (P_Word((iVar2 + 10)))^; { routine anchor; statement location unresolved } { 6100:1085 }
            uVar3 := (P_Word((iVar2 + $C)))^; { routine anchor; statement location unresolved } { 6100:1085 }
            uVar4 := Word((LongWord((P_LongWord((Word(param_3) + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:1085 }
            iVar2 := Integer((P_LongWord((Word(param_3) + $108)))^); { routine anchor; statement location unresolved } { 6100:1085 }
            (P_Word((iVar2 + 10)))^ := param_1; { routine anchor; statement location unresolved } { 6100:1085 }
            (P_Integer((iVar2 + $C)))^ := param_2; { routine anchor; statement location unresolved } { 6100:1085 }
            VisitEffectHooks(Word(param_3), Slice16(param_3, 2), (param_1 and $FF00)); { 6100:10FF }
            uVar4 := Word((LongWord((P_LongWord((Word(param_3) + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:1085 }
            iVar2 := Integer((P_LongWord((Word(param_3) + $108)))^); { routine anchor; statement location unresolved } { 6100:1085 }
            (P_Word((iVar2 + 10)))^ := uVar1; { routine anchor; statement location unresolved } { 6100:1085 }
            (P_Word((iVar2 + $C)))^ := uVar3; { routine anchor; statement location unresolved } { 6100:1085 }
          end; { routine anchor; statement location unresolved } { 6100:1085 }
        Slice16(param_3, 0) := (uVar1 and $FF00); { routine anchor; statement location unresolved } { 6100:1085 }
        if (g_681E = 0) then { routine anchor; statement location unresolved } { 6100:1085 }
          begin { routine anchor; statement location unresolved } { 6100:1085 }
            Slice16(param_3, 0) := (Word(param_3) + 1); { routine anchor; statement location unresolved } { 6100:1085 }
          end; { routine anchor; statement location unresolved } { 6100:1085 }
        local_3 := Byte(Word(param_3)); { 6100:1124 }
      end; { routine anchor; statement location unresolved } { 6100:1085 }
  Exit(Pack16(ShortInt((Word(param_3) shr 8)), local_3)); { 6100:112D }
end; { routine anchor; statement location unresolved } { 6100:1085 }
```

### ov13:116A TurnUndead (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; local_20: array[0..2] of Byte [BP-$1E]; local_1d: array[0..2] of Byte [BP-$1B]; local_1a: array[0..2] of Byte [BP-$18]; local_17: array[0..9] of Byte [BP-$15]; local_d: ShortInt [BP-$B]; local_c: Integer [BP-$A]; uStack_a: Word [BP-$8]; local_8: ShortInt [BP-$6]; local_7: ShortInt [BP-$5]; local_6: ShortInt [BP-$4]; local_5: ShortInt [BP-$3]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_09e3, FUN_00ba_1693, FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_1feb, FUN_00ba_23db, FUN_00ba_2637, FUN_0709_0dbe, System.@StrCopy, ov13_1351, RollDice, ov25_06FB, ov31_0E11, ov31_1298.

M: turn-undead attempt and per-target turned/destroyed messages; table thresholds remain numeric in the body.

```pascal
procedure TurnUndead(param_1: LongWord); { 6100:116A }
begin { routine anchor; statement location unresolved } { 6100:116A }
  puVar6 := local_1d; { routine anchor; statement location unresolved } { 6100:116A }
  uVar5 := SS; { routine anchor; statement location unresolved } { 6100:116A }
  iVar7 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:116A }
  uVar4 := Slice16(param_1, 2); { routine anchor; statement location unresolved } { 6100:116A }
  PString(local_1d, SS) := 'turns undead...'; { 6100:1180 }
  FUN_00ba_16ec((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 10), puVar6, uVar5, iVar7, uVar4); { 6100:118B }
  ov25_06FB(); { 6100:1190 }
  FUN_0709_0dbe(); { 6100:1195 }
  local_7 := 0; { 6100:119A }
  local_8 := 0; { 6100:119E }
  (P_Byte((Integer((P_LongWord((Integer(param_1) + $108)))^) + $11)))^ := 1; { routine anchor; statement location unresolved } { 6100:116A }
  local_5 := 6; { 6100:11AF }
  local_4 := RollDice(Pack16(UNKNOWN_extraout_AH_00, $C), Pack16(UNKNOWN_extraout_AH_00, 1)); { 6100:11B9 }
  uVar5 := $B0; { routine anchor; statement location unresolved } { 6100:116A }
  local_3 := RollDice($14, 1); { 6100:11C7 }
  cVar1 := (P_ShortInt((Integer(param_1) + $96)))^; { routine anchor; statement location unresolved } { 6100:116A }
  if ((cVar1 < 1) or else (8 < cVar1)) then { routine anchor; statement location unresolved } { 6100:116A }
    begin { routine anchor; statement location unresolved } { 6100:116A }
      if ((cVar1 < 9) or else (13 < cVar1)) then { routine anchor; statement location unresolved } { 6100:116A }
        begin { routine anchor; statement location unresolved } { 6100:116A }
          local_d := 10; { 6100:11E7 }
        end; { routine anchor; statement location unresolved } { 6100:116A }
      else { routine anchor; statement location unresolved } { 6100:116A }
        begin { routine anchor; statement location unresolved } { 6100:116A }
          local_d := 9; { 6100:11F4 }
        end; { routine anchor; statement location unresolved } { 6100:116A }
    end; { routine anchor; statement location unresolved } { 6100:116A }
  else { routine anchor; statement location unresolved } { 6100:116A }
    begin { routine anchor; statement location unresolved } { 6100:116A }
      local_d := (P_ShortInt((Integer(param_1) + $96)))^; { 6100:11FA }
    end; { routine anchor; statement location unresolved } { 6100:116A }
  while (Sequence((cVar1 := ov13_1351(@(local_c), SS, Integer(param_1), Slice16(param_1, 2))); ((cVar1 <> 0) and then (local_4 <> 0))) and then (local_8 = 0)) do { 6100:120A }
    begin { routine anchor; statement location unresolved } { 6100:116A }
      uVar4 := Word((LongWord(_local_c) shr $10)); { routine anchor; statement location unresolved } { 6100:116A }
      local_6 := (P_ShortInt(((((P_ShortInt((Integer(_local_c) + $76)))^ * 10) + Integer(local_d)) + $447)))^; { 6100:1241 }
      uVar3 := (Integer(local_6) shr $F); { routine anchor; statement location unresolved } { 6100:116A }
      if (Integer(Word(local_3)) < Integer(((Integer(local_6) xor uVar3) - uVar3))) then { routine anchor; statement location unresolved } { 6100:116A }
        begin { routine anchor; statement location unresolved } { 6100:116A }
          local_8 := 1; { 6100:1312 }
        end; { routine anchor; statement location unresolved } { 6100:116A }
      else { routine anchor; statement location unresolved } { 6100:116A }
        begin { routine anchor; statement location unresolved } { 6100:116A }
          local_7 := 1; { 6100:125B }
          ov31_1298(0, 3, Integer(_local_c), uVar4); { 6100:126B }
          FUN_00ba_09e3(local_c, uStack_a); { 6100:1276 }
          if (local_6 < 1) then { routine anchor; statement location unresolved } { 6100:116A }
            begin { routine anchor; statement location unresolved } { 6100:116A }
              puVar6 := local_1a; { routine anchor; statement location unresolved } { 6100:116A }
              uVar5 := SS; { routine anchor; statement location unresolved } { 6100:116A }
              iVar7 := local_c; { routine anchor; statement location unresolved } { 6100:116A }
              uVar4 := uStack_a; { routine anchor; statement location unresolved } { 6100:116A }
              PString(local_17, SS) := 'Is destroyed'; { 6100:12A1 }
              FUN_00ba_16ec((Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, 10), puVar6, uVar5, iVar7, uVar4); { 6100:12C8 }
              ov31_0E11(local_c, uStack_a); { 6100:12D3 }
              uVar5 := Word((LongWord(_local_c) shr $10)); { routine anchor; statement location unresolved } { 6100:116A }
              (P_Byte((Integer(_local_c) + $10C)))^ := 8; { routine anchor; statement location unresolved } { 6100:116A }
              (P_Byte((Integer(_local_c) + $10D)))^ := 0; { routine anchor; statement location unresolved } { 6100:116A }
            end; { routine anchor; statement location unresolved } { 6100:116A }
          else { routine anchor; statement location unresolved } { 6100:116A }
            begin { routine anchor; statement location unresolved } { 6100:116A }
              (P_Byte((Integer((P_LongWord((local_c + $108)))^) + $10)))^ := 1; { routine anchor; statement location unresolved } { 6100:116A }
              uVar2 := Pack16(UNKNOWN_extraout_AH_01, 1); { routine anchor; statement location unresolved } { 6100:116A }
              puVar6 := local_17; { routine anchor; statement location unresolved } { 6100:116A }
              uVar5 := SS; { routine anchor; statement location unresolved } { 6100:116A }
              iVar7 := local_c; { routine anchor; statement location unresolved } { 6100:116A }
              uVar4 := uStack_a; { routine anchor; statement location unresolved } { 6100:116A }
              PString(local_1a, SS) := 'is turned'; { 6100:12BD }
              FUN_00ba_1feb(puVar6, uVar5, uVar2, iVar7, uVar4); { 6100:12A6 }
            end; { routine anchor; statement location unresolved } { 6100:116A }
          if (local_5 <> 0) then { routine anchor; statement location unresolved } { 6100:116A }
            begin { routine anchor; statement location unresolved } { 6100:116A }
              local_5 := (local_5 + -(1)); { 6100:12F0 }
            end; { routine anchor; statement location unresolved } { 6100:116A }
          cVar1 := (local_4 + -(1)); { routine anchor; statement location unresolved } { 6100:116A }
          if (((cVar1 = 0) and then (local_5 <> 0)) and then (local_6 < 0)) then { routine anchor; statement location unresolved } { 6100:116A }
            begin { routine anchor; statement location unresolved } { 6100:116A }
              cVar1 := local_4; { routine anchor; statement location unresolved } { 6100:116A }
            end; { routine anchor; statement location unresolved } { 6100:116A }
          local_4 := cVar1; { 6100:12F3 }
          uVar5 := $BA; { routine anchor; statement location unresolved } { 6100:116A }
          FUN_00ba_17e3(); { 6100:130B }
        end; { routine anchor; statement location unresolved } { 6100:116A }
    end; { routine anchor; statement location unresolved } { 6100:116A }
  if (local_7 = 0) then { routine anchor; statement location unresolved } { 6100:116A }
    begin { routine anchor; statement location unresolved } { 6100:116A }
      puVar6 := local_20; { routine anchor; statement location unresolved } { 6100:116A }
      PString(local_20, SS) := 'Nothing Happens...'; { 6100:1329 }
      FUN_00ba_1693(puVar6, SS); { 6100:132E }
    end; { routine anchor; statement location unresolved } { 6100:116A }
  FUN_00ba_23db(); { 6100:1333 }
  g_6E31 := FUN_00ba_2637(Integer(param_1), Slice16(param_1, 2)); { 6100:133E }
  FUN_00ba_17e3(); { 6100:1346 }
  Exit; { 6100:134E }
end; { routine anchor; statement location unresolved } { 6100:116A }
```

### ov13:1351 ov13_1351 (conf L)

Params (stack slots): param_1: P_Integer [BP+$06]; param_2: Word [BP+$0A]; param_3: Word [BP+$0C].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_6: ShortInt [BP-$4]; local_5: Byte [BP-$3]; local_3: Byte [BP-$1].  
Callers: ov13_116A.  
Callees: FUN_00ba_2433.

```pascal
function ov13_1351(param_1: P_Integer; param_2: Word; param_3: Word): Word; { 6100:1351 }
begin { routine anchor; statement location unresolved } { 6100:1351 }
  local_6 := 13; { 6100:1357 }
  uVar6 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:1351 }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:1351 }
  P_Integer(param_1)[1] := 0; { routine anchor; statement location unresolved } { 6100:1351 }
  uVar2 := FUN_00ba_2433($FF, param_2, param_3); { 6100:1370 }
  local_3 := 0; { 6100:1378 }
  uVar4 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 6100:1351 }
  if (Byte(uVar2) <> 0) then { routine anchor; statement location unresolved } { 6100:1351 }
    begin { routine anchor; statement location unresolved } { 6100:1351 }
      local_5 := 1; { 6100:1389 }
      while true do { routine anchor; statement location unresolved } { 6100:1351 }
        begin { routine anchor; statement location unresolved } { 6100:1351 }
          iVar5 := (Word((P_Byte((local_5 + $6DE4)))^) * 4); { routine anchor; statement location unresolved } { 6100:1351 }
          iVar1 := (P_Integer((iVar5 + $65B9)))^; { routine anchor; statement location unresolved } { 6100:1351 }
          iVar5 := (P_Integer((iVar5 + $65BB)))^; { routine anchor; statement location unresolved } { 6100:1351 }
          iVar3 := iVar1; { routine anchor; statement location unresolved } { 6100:1351 }
          if ((((P_ShortInt((Integer((P_LongWord((iVar1 + $108)))^) + $10)))^ = 0) and then (0 < (P_ShortInt((iVar1 + $76)))^)) and then Sequence((iVar3 := Pack16(ShortInt((Word(iVar1) shr 8)), (P_ShortInt((iVar1 + $76)))^)); ((P_ShortInt((iVar1 + $76)))^ < local_6))) then { routine anchor; statement location unresolved } { 6100:1351 }
            begin { routine anchor; statement location unresolved } { 6100:1351 }
              local_6 := (P_ShortInt((iVar1 + $76)))^; { 6100:13DE }
              (param_1)^ := iVar1; { routine anchor; statement location unresolved } { 6100:1351 }
              P_Integer(param_1)[1] := iVar5; { routine anchor; statement location unresolved } { 6100:1351 }
              local_3 := 1; { 6100:13F1 }
              iVar3 := iVar1; { routine anchor; statement location unresolved } { 6100:1351 }
            end; { routine anchor; statement location unresolved } { 6100:1351 }
          uVar4 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 6100:1351 }
          if (local_5 = Byte(uVar2)) then { routine anchor; statement location unresolved } { 6100:1351 }
            Break; { routine anchor; statement location unresolved } { 6100:1351 }
          local_5 := (local_5 + 1); { 6100:138E }
        end; { routine anchor; statement location unresolved } { 6100:1351 }
    end; { routine anchor; statement location unresolved } { 6100:1351 }
  Exit(Pack16(uVar4, local_3)); { 6100:1403 }
end; { routine anchor; statement location unresolved } { 6100:1351 }
```

### ov13:1406 FUN_6100_1406 (conf L)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: LongWord [BP+$0C]; param_4: LongWord [BP+$10].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_19: Byte [BP-$17]; local_17: Byte [BP-$15]; local_16: ShortInt [BP-$14]; local_15: ShortInt [BP-$13]; local_14: ShortInt [BP-$12]; local_13: ShortInt [BP-$11]; local_12: array[0..1] of Byte [BP-$10]; local_10: Byte [BP-$E]; local_f: Byte [BP-$D]; local_e: ShortInt [BP-$C]; local_7: ShortInt [BP-$5].  
Callers: ov13_1884.  
Callees: FUN_00ba_0b73, FUN_00ba_0bb8, FUN_00ba_2637, FUN_08ae_00dc, FUN_6100_0191, ReportAttack, FUN_6100_1b1e, FUN_6100_2574, System.@CopyBytes, ov13_263D, VisitEffectHooks, ov24_0CB7, ov24_0FD2.

```pascal
procedure FUN_6100_1406(param_1: P_ShortInt; param_2: ShortInt; param_3: LongWord; param_4: LongWord); { 6100:1406 }
begin { routine anchor; statement location unresolved } { 6100:1406 }
  local_15 := param_2; { 6100:140F }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:1406 }
  g_6823 := 0; { 6100:1419 }
  g_6824 := 0; { 6100:141E }
  g_6E2D := 0; { 6100:1423 }
  g_6E2E := 0; { 6100:1428 }
  local_13 := 0; { 6100:142D }
  local_14 := 0; { 6100:1431 }
  g_6818 := 0; { 6100:1435 }
  uVar6 := Word((LongWord(param_4) shr $10)); { routine anchor; statement location unresolved } { 6100:1406 }
  iVar5 := Integer(param_4); { routine anchor; statement location unresolved } { 6100:1406 }
  (P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + 8)))^ := 1; { routine anchor; statement location unresolved } { 6100:1406 }
  cVar2 := FUN_00ba_0b73(Integer(param_3), Slice16(param_3, 2)); { 6100:144D }
  if (cVar2 = 0) then { routine anchor; statement location unresolved } { 6100:1406 }
    begin { routine anchor; statement location unresolved } { 6100:1406 }
      if ((((P_Integer((iVar5 + $CC)))^ <> 0) or else ((P_Integer((iVar5 + $CE)))^ <> 0)) and then (($80 < (P_Byte((Integer(param_3) + $6C)))^) or else (1 < ((P_Byte((Integer(param_3) + $6C)))^ and 7)))) then { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          Move(MemRef(((Word((P_Byte((Integer((P_LongWord((iVar5 + $CC)))^) + $2E)))^) * $10) + $5582), $C7C), MemRef(local_12, SS), $10); { 6100:1547 }
          (P_Byte((iVar5 + $115)))^ := local_10; { routine anchor; statement location unresolved } { 6100:1406 }
          (P_Byte((iVar5 + $117)))^ := local_f; { routine anchor; statement location unresolved } { 6100:1406 }
          (P_ShortInt((iVar5 + $119)))^ := (((P_ShortInt((iVar5 + $119)))^ - local_7) + local_e); { routine anchor; statement location unresolved } { 6100:1406 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      FUN_00ba_0bb8(Integer(param_3), Slice16(param_3, 2)); { 6100:1589 }
      VisitEffectHooks(Integer(param_3), Slice16(param_3, 2), Pack16(UNKNOWN_extraout_AH, $B)); { 6100:1597 }
      cVar2 := FUN_6100_2574(Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:15AD }
      if (cVar2 = 0) then { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          if (((1 < (P_Byte((Integer((P_LongWord((Integer(param_3) + $108)))^) + $F)))^) and then Sequence((cVar2 := ov13_263D(Integer(param_3), Slice16(param_3, 2), iVar5, uVar6)); (cVar2 = (P_ShortInt((Integer((P_LongWord((Integer(param_3) + $108)))^) + 9)))^))) and then (4 < (P_Byte((Integer((P_LongWord((Integer(param_3) + $108)))^) + $12)))^)) then { 6100:15E1 }
            begin { routine anchor; statement location unresolved } { 6100:1406 }
              local_15 := 1; { 6100:1601 }
            end; { routine anchor; statement location unresolved } { 6100:1406 }
          local_16 := (P_ShortInt(((Integer(param_3) + (local_15 <> 0)) + $111)))^; { 6100:15C0 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      else { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          local_16 := ((P_ShortInt((Integer(param_3) + $112)))^ + -(2)); { 6100:161D }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      FUN_6100_1b1e(@(local_16), SS, Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:1632 }
      local_19 := (local_15 <> 0); { 6100:1635 }
      cVar2 := FUN_6100_2574(Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:1650 }
      if (cVar2 <> 0) then { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          local_19 := 2; { 6100:163F }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      local_17 := (P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + 4)))^; { 6100:14D1 }
      if (local_17 <> 0) then { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          while true do { routine anchor; statement location unresolved } { 6100:1406 }
            begin { routine anchor; statement location unresolved } { 6100:1406 }
              while (((P_ShortInt(((iVar5 + Word(local_17)) + $112)))^ <> 0) and then (local_14 = 0)) do { routine anchor; statement location unresolved } { 6100:1406 }
                begin { routine anchor; statement location unresolved } { 6100:1406 }
                  pcVar1 := P_ShortInt(((iVar5 + Word(local_17)) + $112)); { routine anchor; statement location unresolved } { 6100:1406 }
                  (pcVar1)^ := ((pcVar1)^ + -(1)); { routine anchor; statement location unresolved } { 6100:1406 }
                  (P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + 4)))^ := local_17; { routine anchor; statement location unresolved } { 6100:1406 }
                  (P_ShortInt((local_17 + $6E2C)))^ := ((P_ShortInt((local_17 + $6E2C)))^ + 1); { routine anchor; statement location unresolved } { 6100:1406 }
                  cVar2 := ov24_0CB7(local_16, Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:16D3 }
                  if ((cVar2 <> 0) or else Sequence((cVar2 := FUN_00ba_0b73(Integer(param_3), Slice16(param_3, 2))); (cVar2 <> 0))) then { 6100:16E2 }
                    begin { routine anchor; statement location unresolved } { 6100:1406 }
                      P_Byte(@(g_6822))[local_17] := (P_Byte(@(g_6822))[local_17] + 1); { routine anchor; statement location unresolved } { 6100:1406 }
                      FUN_08ae_00dc(g_2622); { 6100:145D }
                      local_13 := 1; { 6100:14F0 }
                      FUN_6100_0191(Pack16(UNKNOWN_extraout_AH_00, local_17), Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:1714 }
                      ReportAttack(Pack16(UNKNOWN_extraout_AH_01, 1), Pack16(UNKNOWN_extraout_AH_01, g_6818), Pack16(UNKNOWN_extraout_AH_01, g_6818), Pack16(UNKNOWN_extraout_AH_01, local_19), Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:14C3 }
                      if ((P_ShortInt((Integer(param_3) + $10D)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:1406 }
                        begin { routine anchor; statement location unresolved } { 6100:1406 }
                          VisitEffectHooks(iVar5, uVar6, (local_17 + 1)); { 6100:174E }
                        end; { routine anchor; statement location unresolved } { 6100:1406 }
                      if ((P_ShortInt((Integer(param_3) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 6100:1406 }
                        begin { routine anchor; statement location unresolved } { 6100:1406 }
                          local_14 := 1; { 6100:175E }
                        end; { routine anchor; statement location unresolved } { 6100:1406 }
                    end; { routine anchor; statement location unresolved } { 6100:1406 }
                end; { routine anchor; statement location unresolved } { 6100:1406 }
              if (local_17 = 1) then { routine anchor; statement location unresolved } { 6100:1406 }
                Break; { routine anchor; statement location unresolved } { 6100:1406 }
              local_17 := (local_17 - 1); { 6100:14D7 }
            end; { routine anchor; statement location unresolved } { 6100:1406 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      if (local_13 = 0) then { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          FUN_08ae_00dc(g_2626); { 6100:16FA }
          ReportAttack((Word(UNKNOWN_extraout_AH_02) shl 8), (Word(UNKNOWN_extraout_AH_02) shl 8), (Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, local_19), Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:1733 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      (param_1)^ := 1; { routine anchor; statement location unresolved } { 6100:1406 }
      local_17 := 1; { 6100:1674 }
      while true do { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          if ((P_ShortInt(((iVar5 + Word(local_17)) + $112)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:1406 }
            begin { routine anchor; statement location unresolved } { 6100:1406 }
              (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:1406 }
            end; { routine anchor; statement location unresolved } { 6100:1406 }
          if (local_17 = 2) then { routine anchor; statement location unresolved } { 6100:1406 }
            Break; { routine anchor; statement location unresolved } { 6100:1406 }
          local_17 := (local_17 + 1); { 6100:1679 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      (P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + 5)))^ := 0; { routine anchor; statement location unresolved } { 6100:1406 }
    end; { routine anchor; statement location unresolved } { 6100:1406 }
  else { routine anchor; statement location unresolved } { 6100:1406 }
    begin { routine anchor; statement location unresolved } { 6100:1406 }
      FUN_08ae_00dc(g_2622); { 6100:1778 }
      while ((P_ShortInt(((iVar5 + Word((P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + 4)))^)) + $112)))^ = 0) do { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
          pcVar1 := P_ShortInt((Integer((P_LongWord((iVar5 + $108)))^) + 4)); { routine anchor; statement location unresolved } { 6100:1406 }
          (pcVar1)^ := ((pcVar1)^ + -(1)); { routine anchor; statement location unresolved } { 6100:1406 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
      pcVar1 := P_ShortInt(((P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + 4)))^ + $6E2C)); { routine anchor; statement location unresolved } { 6100:1406 }
      (pcVar1)^ := ((pcVar1)^ + 1); { routine anchor; statement location unresolved } { 6100:1406 }
      iVar3 := ((P_Byte((Integer(param_3) + $11B)))^ + 5); { routine anchor; statement location unresolved } { 6100:1406 }
      uVar4 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 6100:1406 }
      ReportAttack(Pack16(uVar4, 1), Pack16(uVar4, 1), iVar3, 3, Integer(param_3), Slice16(param_3, 2), iVar5, uVar6); { 6100:1797 }
      ov24_0FD2(iVar5, uVar6); { 6100:14CC }
      local_17 := 1; { 6100:17A1 }
      while Sequence(((P_Byte(((iVar5 + Word(local_17)) + $112)))^ := 0); (local_17 <> 2)) do { routine anchor; statement location unresolved } { 6100:1406 }
      begin { routine anchor; statement location unresolved } { 6100:1406 }
        begin { routine anchor; statement location unresolved } { 6100:1406 }
        end; { routine anchor; statement location unresolved } { 6100:1406 }
        local_17 := (local_17 + 1); { 6100:17A7 }
      end; { routine anchor; statement location unresolved } { 6100:1406 }
      local_13 := 1; { 6100:16FF }
      (param_1)^ := 1; { routine anchor; statement location unresolved } { 6100:1406 }
    end; { routine anchor; statement location unresolved } { 6100:1406 }
  if ((param_1)^ <> 0) then { routine anchor; statement location unresolved } { 6100:1406 }
    begin { routine anchor; statement location unresolved } { 6100:1406 }
      cVar2 := FUN_00ba_2637(iVar5, uVar6); { 6100:17E5 }
      (param_1)^ := cVar2; { routine anchor; statement location unresolved } { 6100:1406 }
    end; { routine anchor; statement location unresolved } { 6100:1406 }
  Exit; { 6100:17F3 }
end; { routine anchor; statement location unresolved } { 6100:1406 }
```

### ov13:17F6 ov13_17F6 (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: Word [BP+$0A]; param_3: Word [BP+$0C].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: FUN_6100_0627,FUN_6100_2c3d,ov13_0E82.  
Callees: ov13_263D.

```pascal
procedure ov13_17F6(param_1: LongWord; param_2: Word; param_3: Word); { 6100:17F6 }
begin { routine anchor; statement location unresolved } { 6100:17F6 }
  uVar4 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:17F6 }
  iVar3 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:17F6 }
  pcVar1 := P_ShortInt((Integer((P_LongWord((iVar3 + $108)))^) + $F)); { routine anchor; statement location unresolved } { 6100:17F6 }
  (pcVar1)^ := ((pcVar1)^ + 1); { routine anchor; statement location unresolved } { 6100:17F6 }
  bVar2 := ov13_263D(param_2, param_3, iVar3, uVar4); { 6100:1815 }
  local_3 := Byte((Integer(((Word(bVar2) - Word((P_Byte((Integer((P_LongWord((iVar3 + $108)))^) + 9)))^)) + 8)) mod 8)); { 6100:183C }
  if (4 < local_3) then { routine anchor; statement location unresolved } { 6100:17F6 }
    begin { routine anchor; statement location unresolved } { 6100:17F6 }
      local_3 := (8 - local_3); { 6100:1851 }
    end; { routine anchor; statement location unresolved } { 6100:17F6 }
  (P_Byte((Integer((P_LongWord((iVar3 + $108)))^) + $12)))^ := ShortInt(((Word((P_Byte((Integer((P_LongWord((iVar3 + $108)))^) + $12)))^) + Word(local_3)) mod 8)); { routine anchor; statement location unresolved } { 6100:17F6 }
  Exit; { 6100:1881 }
end; { routine anchor; statement location unresolved } { 6100:17F6 }
```

### ov13:1884 ov13_1884 (conf L)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: LongWord [BP+$0A]; param_3: ShortInt [BP+$0E]; param_4: LongWord [BP+$10]; param_5: LongWord [BP+$14].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: LongWord [compiler temporary; no proven BP slot].  
Callers: FUN_6100_0627,FUN_6100_2c3d,ov13_08B2,ov13_0E82,ov13_39D2,ov13_3A86.  
Callees: Crt.Delay, FUN_00ba_09e3, FUN_00ba_0bb8, FUN_00ba_1509, FUN_00ba_2637, FUN_00ba_2e46, FUN_6100_1406, FUN_6100_26b0, System.GetMem, System.Move, ov13_263D, ov31_071A, ov31_0AF8.

```pascal
procedure ov13_1884(param_1: P_ShortInt; param_2: LongWord; param_3: ShortInt; param_4: LongWord; param_5: LongWord); { 6100:1884 }
begin { routine anchor; statement location unresolved } { 6100:1884 }
  uVar9 := Word((LongWord(param_4) shr $10)); { routine anchor; statement location unresolved } { 6100:1884 }
  iVar7 := Integer(param_4); { routine anchor; statement location unresolved } { 6100:1884 }
  if (((P_Byte((Integer((P_LongWord((iVar7 + $108)))^) + $F)))^ < 3) and then (param_3 = 0)) then { routine anchor; statement location unresolved } { 6100:1884 }
    begin { routine anchor; statement location unresolved } { 6100:1884 }
      uVar4 := ov13_263D(Integer(param_5), Slice16(param_5, 2), iVar7, uVar9); { 6100:18AC }
      uVar5 := ov31_071A((uVar4 and $FF00), iVar7, uVar9); { 6100:18BB }
      bVar6 := Byte((Word(uVar5) shr 8)); { routine anchor; statement location unresolved } { 6100:1884 }
      if (ShortInt(uVar5) = 0) then { routine anchor; statement location unresolved } { 6100:1884 }
        begin { routine anchor; statement location unresolved } { 6100:1884 }
          (P_Byte((Integer((P_LongWord((iVar7 + $108)))^) + 9)))^ := ShortInt(uVar4); { routine anchor; statement location unresolved } { 6100:1884 }
        end; { routine anchor; statement location unresolved } { 6100:1884 }
      else { routine anchor; statement location unresolved } { 6100:1884 }
        begin { routine anchor; statement location unresolved } { 6100:1884 }
          ov31_0AF8((Word(bVar6) shl 8), (Word(bVar6) shl 8), Pack16(bVar6, ShortInt(uVar4)), iVar7, uVar9); { 6100:18D4 }
        end; { routine anchor; statement location unresolved } { 6100:1884 }
    end; { routine anchor; statement location unresolved } { 6100:1884 }
  uVar2 := ov13_263D(iVar7, uVar9, Integer(param_5), Slice16(param_5, 2)); { 6100:18F7 }
  FUN_00ba_09e3(Integer(param_5), Slice16(param_5, 2)); { 6100:1903 }
  ov31_0AF8((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, uVar2), Integer(param_5), Slice16(param_5, 2)); { 6100:1918 }
  uVar5 := Word((LongWord((P_LongWord((Integer(param_5) + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:1884 }
  iVar8 := Integer((P_LongWord((Integer(param_5) + $108)))^); { routine anchor; statement location unresolved } { 6100:1884 }
  (P_Integer((iVar8 + 10)))^ := iVar7; { routine anchor; statement location unresolved } { 6100:1884 }
  (P_Word((iVar8 + $C)))^ := uVar9; { routine anchor; statement location unresolved } { 6100:1884 }
  Crt_Delay(100); { 6100:1937 }
  uVar4 := 0; { routine anchor; statement location unresolved } { 6100:1884 }
  if ((Integer(param_2) <> 0) or else (Slice16(param_2, 2) <> 0)) then { routine anchor; statement location unresolved } { 6100:1884 }
    begin { routine anchor; statement location unresolved } { 6100:1884 }
      uVar4 := FUN_6100_26b0(Integer(param_2), Slice16(param_2, 2), iVar7, uVar9, Integer(param_5), Slice16(param_5, 2)); { 6100:1957 }
    end; { routine anchor; statement location unresolved } { 6100:1884 }
  if ((P_ShortInt((Integer((P_LongWord((Integer(param_5) + $CC)))^) + $2E)))^ = 47) then { routine anchor; statement location unresolved } { 6100:1884 }
    begin { routine anchor; statement location unresolved } { 6100:1884 }
      uVar4 := FUN_6100_26b0((P_Word((Integer(param_5) + $CC)))^, (P_Word((Integer(param_5) + $CE)))^, iVar7, uVar9, Integer(param_5), Slice16(param_5, 2)); { 6100:1983 }
    end; { routine anchor; statement location unresolved } { 6100:1884 }
  (param_1)^ := 1; { routine anchor; statement location unresolved } { 6100:1884 }
  uVar5 := g_5D94; { routine anchor; statement location unresolved } { 6100:1884 }
  uVar1 := g_5D92; { routine anchor; statement location unresolved } { 6100:1884 }
  if (((P_ShortInt((Integer(param_5) + $113)))^ <> 0) or else ((P_ShortInt((Integer(param_5) + $114)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:1884 }
    begin { routine anchor; statement location unresolved } { 6100:1884 }
      g_5D92 := Integer(param_5); { 6100:19B9 }
      g_5D94 := Slice16(param_5, 2); { 6100:19BC }
      FUN_6100_1406(P_ShortInt(param_1), Integer((LongWord(param_1) shr $10)), param_3, iVar7, uVar9, Integer(param_5), Slice16(param_5, 2)); { 6100:19D6 }
      uVar10 := FarBits(g_5D9C, g_5D9A); { routine anchor; statement location unresolved } { 6100:1884 }
      if ((Integer(param_2) <> 0) or else (Slice16(param_2, 2) <> 0)) then { routine anchor; statement location unresolved } { 6100:1884 }
        begin { routine anchor; statement location unresolved } { 6100:1884 }
          if ((P_ShortInt((Integer(param_2) + $39)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:1884 }
            begin { routine anchor; statement location unresolved } { 6100:1884 }
              (P_ShortInt((Integer(param_2) + $39)))^ := ((P_ShortInt((Integer(param_2) + $39)))^ - g_6E2D); { routine anchor; statement location unresolved } { 6100:1884 }
            end; { routine anchor; statement location unresolved } { 6100:1884 }
          uVar10 := FarBits(g_5D9C, g_5D9A); { routine anchor; statement location unresolved } { 6100:1884 }
          if ((P_ShortInt((Integer(param_2) + $39)))^ = 0) then { routine anchor; statement location unresolved } { 6100:1884 }
            begin { routine anchor; statement location unresolved } { 6100:1884 }
              cVar3 := FUN_00ba_2e46(Integer(param_5), Slice16(param_5, 2)); { 6100:1A0B }
              if ((cVar3 = 0) or else ((P_ShortInt((Integer(param_2) + $3E)))^ = -($77))) then { routine anchor; statement location unresolved } { 6100:1884 }
                begin { routine anchor; statement location unresolved } { 6100:1884 }
                  FUN_00ba_1509(Integer(param_2), Slice16(param_2, 2), Integer(param_5), Slice16(param_5, 2)); { 6100:1A73 }
                  uVar10 := FarBits(g_5D9C, g_5D9A); { routine anchor; statement location unresolved } { 6100:1884 }
                end; { routine anchor; statement location unresolved } { 6100:1884 }
              else { routine anchor; statement location unresolved } { 6100:1884 }
                begin { routine anchor; statement location unresolved } { 6100:1884 }
                  uVar10 := Allocate($3F); { 6100:1A22 }
                  uVar9 := Word((LongWord(uVar10) shr $10)); { routine anchor; statement location unresolved } { 6100:1884 }
                  iVar7 := Integer(uVar10); { routine anchor; statement location unresolved } { 6100:1884 }
                  Move(MemRef(Integer(param_2),Slice16(param_2,2)), MemRef(WordAtSS(BP-4),WordAtSS(BP-2)), $3F); { 6100:1A3B }
                  (P_Integer((iVar7 + $2A)))^ := g_6810; { routine anchor; statement location unresolved } { 6100:1884 }
                  (P_Word((iVar7 + $2C)))^ := g_6812; { routine anchor; statement location unresolved } { 6100:1884 }
                  g_6810 := iVar7; { 6100:1A58 }
                  g_6812 := uVar9; { 6100:1A5B }
                  (P_Byte((iVar7 + $34)))^ := 0; { routine anchor; statement location unresolved } { 6100:1884 }
                  FUN_00ba_1509(Integer(param_2), Slice16(param_2, 2), Integer(param_5), Slice16(param_5, 2)); { 6100:1A93 }
                end; { routine anchor; statement location unresolved } { 6100:1884 }
            end; { routine anchor; statement location unresolved } { 6100:1884 }
        end; { routine anchor; statement location unresolved } { 6100:1884 }
      g_5D9C := Word((LongWord(uVar10) shr $10)); { 6100:1A81 }
      g_5D9A := Word(uVar10); { 6100:1A7E }
      FUN_00ba_0bb8(Integer(param_5), Slice16(param_5, 2)); { 6100:1A9E }
      uVar4 := uVar1; { routine anchor; statement location unresolved } { 6100:1884 }
    end; { routine anchor; statement location unresolved } { 6100:1884 }
  g_5D92 := uVar1; { 6100:1AA9 }
  g_5D94 := uVar5; { 6100:1AAC }
  if ((param_1)^ <> 0) then { routine anchor; statement location unresolved } { 6100:1884 }
    begin { routine anchor; statement location unresolved } { 6100:1884 }
      uVar4 := FUN_00ba_2637(Integer(param_5), Slice16(param_5, 2)); { 6100:1ABF }
      (param_1)^ := ShortInt(uVar4); { routine anchor; statement location unresolved } { 6100:1884 }
    end; { routine anchor; statement location unresolved } { 6100:1884 }
  cVar3 := ov31_071A((uVar4 and $FF00), Integer(param_5), Slice16(param_5, 2)); { 6100:1AD3 }
  if (cVar3 <> 0) then { routine anchor; statement location unresolved } { 6100:1884 }
    begin { routine anchor; statement location unresolved } { 6100:1884 }
      ov31_0AF8(1, 1, (P_Byte((Integer((P_LongWord((Integer(param_5) + $108)))^) + 9)))^, Integer(param_5), Slice16(param_5, 2)); { 6100:1AF5 }
      ov31_0AF8((Word(UNKNOWN_extraout_AH_00) shl 8), (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, (P_Byte((Integer((P_LongWord((Integer(param_5) + $108)))^) + 9)))^), Integer(param_5), Slice16(param_5, 2)); { 6100:1B13 }
    end; { routine anchor; statement location unresolved } { 6100:1884 }
  Exit; { 6100:1B1B }
end; { routine anchor; statement location unresolved } { 6100:1884 }
```

### ov13:1B1E FUN_6100_1b1e (conf L)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: Word [BP+$0A]; param_3: Word [BP+$0C]; param_4: LongWord [BP+$0E].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: FUN_6100_1406.  
Callees: FUN_00ba_255b, FUN_00ba_2e03.

```pascal
procedure FUN_6100_1b1e(param_1: P_ShortInt; param_2: Word; param_3: Word; param_4: LongWord); { 6100:1B1E }
begin { routine anchor; statement location unresolved } { 6100:1B1E }
  local_4 := FUN_00ba_255b(param_2, param_3, Integer(param_4), Slice16(param_4, 2)); { 6100:1B30 }
  cVar1 := FUN_00ba_2e03(Integer(param_4), Slice16(param_4, 2)); { 6100:1B3E }
  local_3 := local_4; { 6100:1B68 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:1B1E }
    begin { routine anchor; statement location unresolved } { 6100:1B1E }
      local_3 := ShortInt((LongWord(LongInt(Integer(((P_Byte(((Word((P_Byte((Integer((P_LongWord((Integer(param_4) + $CC)))^) + $2E)))^) * $10) + $558E)))^ - 1)))) div 3)); { 6100:1B70 }
    end; { routine anchor; statement location unresolved } { 6100:1B1E }
  if ((Integer(local_4) <> Integer(local_3)) and then (-(1) < (Integer(local_4) - Integer(local_3)))) then { routine anchor; statement location unresolved } { 6100:1B1E }
    begin { routine anchor; statement location unresolved } { 6100:1B1E }
      local_4 := (local_4 - local_3); { 6100:1B8F }
      (param_1)^ := ((param_1)^ + 2); { routine anchor; statement location unresolved } { 6100:1B1E }
    end; { routine anchor; statement location unresolved } { 6100:1B1E }
  if ((Integer(local_4) <> Integer(local_3)) and then (-(1) < (Integer(local_4) - Integer(local_3)))) then { routine anchor; statement location unresolved } { 6100:1B1E }
    begin { routine anchor; statement location unresolved } { 6100:1B1E }
      (param_1)^ := ((param_1)^ + 3); { routine anchor; statement location unresolved } { 6100:1B1E }
    end; { routine anchor; statement location unresolved } { 6100:1B1E }
  Exit; { 6100:1BD5 }
end; { routine anchor; statement location unresolved } { 6100:1B1E }
```

### ov13:1BF8 ov13_1BF8 (conf L)

Params (stack slots): param_1: P_Word [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: LongWord [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; cVar4: ShortInt [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; puVar6: P_Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; bVar10: Boolean [compiler temporary; no proven BP slot]; local_f: ShortInt [BP-$D]; local_e: Byte [BP-$C]; local_d: Byte [BP-$B]; local_c: Byte [BP-$A]; local_b: Byte [BP-$9]; local_a: Byte [BP-$8]; local_9: ShortInt [BP-$7]; local_8: ShortInt [BP-$6]; local_7: Word [BP-$5]; local_5: Word [BP-$3].  
Callers: FUN_6100_1e16.  
Callees: System.@SetIn, ov31_04BE, ov31_0BE7, ov31_0C0F.

```pascal
function ov13_1BF8(param_1: P_Word; param_2: LongWord): Word; { 6100:1BF8 }
begin { routine anchor; statement location unresolved } { 6100:1BF8 }
  local_7 := 0; { 6100:1C00 }
  local_5 := 0; { 6100:1C03 }
  local_a := 0; { 6100:1C06 }
  local_b := $FF; { 6100:1C0A }
  local_c := 0; { 6100:1C0E }
  while true do { routine anchor; statement location unresolved } { 6100:1BF8 }
    begin { routine anchor; statement location unresolved } { 6100:1BF8 }
      local_8 := ov31_0BE7(Word(param_2), Slice16(param_2, 2)); { 6100:1C1D }
      local_8 := ((P_ShortInt((local_c + $2736)))^ + local_8); { routine anchor; statement location unresolved } { 6100:1BF8 }
      cVar4 := ov31_0C0F(Word(param_2), Slice16(param_2, 2)); { 6100:1C3C }
      iVar5 := (Integer((P_ShortInt((local_c + $273F)))^) + Integer(cVar4)); { routine anchor; statement location unresolved } { 6100:1BF8 }
      local_9 := ShortInt(iVar5); { 6100:1C52 }
      ov31_04BE(@(local_f), SS, @(local_e), SS, iVar5, Pack16(ShortInt((Word(iVar5) shr 8)), local_8)); { 6100:1C67 }
      bVar3 := g_6715; { routine anchor; statement location unresolved } { 6100:1BF8 }
      puVar6 := P_Word(param_1); { routine anchor; statement location unresolved } { 6100:1BF8 }
      uVar7 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:1BF8 }
      if (local_e = 0) then { routine anchor; statement location unresolved } { 6100:1BF8 }
        begin { routine anchor; statement location unresolved } { 6100:1BF8 }
          if ((local_f = 31) and then (g_6715 <> 0)) then { routine anchor; statement location unresolved } { 6100:1BF8 }
            begin { routine anchor; statement location unresolved } { 6100:1BF8 }
              local_d := 1; { 6100:1D3A }
              uVar8 := $3E0; { routine anchor; statement location unresolved } { 6100:1BF8 }
              while true do { routine anchor; statement location unresolved } { 6100:1BF8 }
                begin { routine anchor; statement location unresolved } { 6100:1BF8 }
                  uVar9 := uVar8; { routine anchor; statement location unresolved } { 6100:1BF8 }
                  if (((P_Integer(((Word(local_d) * 7) + $66D6)))^ <> 0) or else ((P_Integer(((Word(local_d) * 7) + $66D8)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:1BF8 }
                    begin { routine anchor; statement location unresolved } { 6100:1BF8 }
                      bVar10 := true; { routine anchor; statement location unresolved } { 6100:1BF8 }
                      uVar2 := (P_LongWord(((Word(local_d) * 7) + $66D6)))^; { routine anchor; statement location unresolved } { 6100:1BF8 }
                      uVar9 := $AF8; { routine anchor; statement location unresolved } { 6100:1BF8 }
                      Flags.ZF := not (LoByte(Pack16(ShortInt(((Word(local_d) * 7) shr 8)), (P_Byte((Integer(uVar2) + $10C)))^)) in [6, 7, 8]); { 6100:1D73 }
                      if ((bVar10 and then ((P_ShortInt(((Word(local_d) * 7) + $66DA)))^ = local_8)) and then ((P_ShortInt(((Word(local_d) * 7) + $66DB)))^ = local_9)) then { routine anchor; statement location unresolved } { 6100:1BF8 }
                        begin { routine anchor; statement location unresolved } { 6100:1BF8 }
                          local_a := local_d; { 6100:1DA7 }
                        end; { routine anchor; statement location unresolved } { 6100:1BF8 }
                    end; { routine anchor; statement location unresolved } { 6100:1BF8 }
                  if (local_d = bVar3) then { routine anchor; statement location unresolved } { 6100:1BF8 }
                    Break; { routine anchor; statement location unresolved } { 6100:1BF8 }
                  local_d := (local_d + 1); { 6100:1D3F }
                  uVar8 := uVar9; { routine anchor; statement location unresolved } { 6100:1BF8 }
                end; { routine anchor; statement location unresolved } { 6100:1BF8 }
            end; { routine anchor; statement location unresolved } { 6100:1BF8 }
        end; { routine anchor; statement location unresolved } { 6100:1BF8 }
      else { routine anchor; statement location unresolved } { 6100:1BF8 }
        begin { routine anchor; statement location unresolved } { 6100:1BF8 }
          uVar1 := (P_Word(((Word(local_e) * 4) + $65BB)))^; { routine anchor; statement location unresolved } { 6100:1BF8 }
          (param_1)^ := (P_Word(((Word(local_e) * 4) + $65B9)))^; { routine anchor; statement location unresolved } { 6100:1BF8 }
          puVar6[1] := uVar1; { routine anchor; statement location unresolved } { 6100:1BF8 }
          if ((((P_ShortInt((Integer((P_LongWord(param_1))^) + $10E)))^ = (P_ShortInt((Word(param_2) + $10E)))^) and then ((P_Byte((Integer((P_LongWord(param_1))^) + $11B)))^ < (P_Byte((Integer((P_LongWord(param_1))^) + $32)))^)) and then (((P_Byte((Integer((P_LongWord(param_1))^) + $11B)))^ < local_b) or else (((puVar6[1] = Slice16(param_2, 2)) and then ((param_1)^ = Word(param_2))) and then ((P_Byte((Integer((P_LongWord(param_1))^) + $11B)))^ < ((P_Byte((Integer((P_LongWord(param_1))^) + $32)))^ shr 1))))) then { routine anchor; statement location unresolved } { 6100:1BF8 }
            begin { routine anchor; statement location unresolved } { 6100:1BF8 }
              local_7 := (param_1)^; { 6100:1D0D }
              local_5 := puVar6[1]; { 6100:1D10 }
              local_b := (P_Byte((Integer((P_LongWord(param_1))^) + $11B)))^; { 6100:1D1E }
            end; { routine anchor; statement location unresolved } { 6100:1BF8 }
        end; { routine anchor; statement location unresolved } { 6100:1BF8 }
      if (local_c = 8) then { routine anchor; statement location unresolved } { 6100:1BF8 }
        Break; { routine anchor; statement location unresolved } { 6100:1BF8 }
      local_c := (local_c + 1); { 6100:1C14 }
    end; { routine anchor; statement location unresolved } { 6100:1BF8 }
  if ((local_b < 8) or else (local_a = 0)) then { routine anchor; statement location unresolved } { 6100:1BF8 }
    begin { routine anchor; statement location unresolved } { 6100:1BF8 }
      (param_1)^ := local_7; { routine anchor; statement location unresolved } { 6100:1BF8 }
      puVar6[1] := local_5; { routine anchor; statement location unresolved } { 6100:1BF8 }
    end; { routine anchor; statement location unresolved } { 6100:1BF8 }
  else { routine anchor; statement location unresolved } { 6100:1BF8 }
    begin { routine anchor; statement location unresolved } { 6100:1BF8 }
      uVar1 := (P_Word(((Word(local_a) * 7) + $66D8)))^; { routine anchor; statement location unresolved } { 6100:1BF8 }
      (param_1)^ := (P_Word(((Word(local_a) * 7) + $66D6)))^; { routine anchor; statement location unresolved } { 6100:1BF8 }
      puVar6[1] := uVar1; { routine anchor; statement location unresolved } { 6100:1BF8 }
    end; { routine anchor; statement location unresolved } { 6100:1BF8 }
  Exit(Pack16(ShortInt((((param_1)^ or puVar6[1]) shr 8)), (((param_1)^ or puVar6[1]) <> 0))); { 6100:1E13 }
end; { routine anchor; statement location unresolved } { 6100:1BF8 }
```

### ov13:1E16 FUN_6100_1e16 (conf L)

Params (stack slots): param_1: P_Word [BP+$06]; param_2: Byte [BP+$0A]; param_3: ShortInt [BP+$0C]; param_4: Byte [BP+$0E].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; bVar2: Boolean [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; cVar5: ShortInt [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; puVar11: P_Word [compiler temporary; no proven BP slot]; iVar12: Integer [compiler temporary; no proven BP slot]; uVar13: Word [compiler temporary; no proven BP slot]; uVar14: Word [compiler temporary; no proven BP slot]; uVar15: Word [compiler temporary; no proven BP slot]; local_b: ShortInt [BP-$9]; local_a: Byte [BP-$8]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers: ov13_20C3.  
Callees: FUN_00ba_0b73, FUN_00ba_23b7, System.FillChar, ov13_1BF8, ov13_3558, ov13_37E4, ov22_0729, ov30_0909, ov31_0BE7, ov31_0C0F.

```pascal
function FUN_6100_1e16(param_1: P_Word; param_2: Byte; param_3: ShortInt; param_4: Byte): Word; { 6100:1E16 }
begin { routine anchor; statement location unresolved } { 6100:1E16 }
  local_4 := 0; { 6100:1E1C }
  uVar8 := g_5D94; { routine anchor; statement location unresolved } { 6100:1E16 }
  puVar11 := P_Word(param_1); { routine anchor; statement location unresolved } { 6100:1E16 }
  uVar13 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:1E16 }
  if (param_3 = 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
    begin { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar8 := g_5D92; { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar7 := g_5D94; { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar6 := ov22_0729(param_4); { 6100:1E32 }
      ov13_3558(puVar11, uVar13, @(local_4), SS, param_2, (uVar6 and $FF00), uVar6, uVar8, uVar7); { 6100:1E4A }
      uVar7 := (param_1)^; { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar8 := puVar11[1]; { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar1 := (P_LongWord((Integer(g_5D92) + $108)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar14 := Word((LongWord(uVar1) shr $10)); { routine anchor; statement location unresolved } { 6100:1E16 }
      iVar12 := Integer(uVar1); { routine anchor; statement location unresolved } { 6100:1E16 }
      (P_Word((iVar12 + 10)))^ := uVar7; { routine anchor; statement location unresolved } { 6100:1E16 }
      (P_Word((iVar12 + $C)))^ := uVar8; { routine anchor; statement location unresolved } { 6100:1E16 }
    end; { routine anchor; statement location unresolved } { 6100:1E16 }
  else { routine anchor; statement location unresolved } { 6100:1E16 }
    begin { routine anchor; statement location unresolved } { 6100:1E16 }
      uVar7 := Word(param_4); { routine anchor; statement location unresolved } { 6100:1E16 }
      if ((P_ShortInt(((uVar7 * $10) + $3208)))^ = 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
        begin { routine anchor; statement location unresolved } { 6100:1E16 }
          (param_1)^ := g_5D92; { routine anchor; statement location unresolved } { 6100:1E16 }
          puVar11[1] := uVar8; { routine anchor; statement location unresolved } { 6100:1E16 }
          if (param_4 = 3) then { routine anchor; statement location unresolved } { 6100:1E16 }
            begin { routine anchor; statement location unresolved } { 6100:1E16 }
              uVar7 := ov13_1BF8(puVar11, uVar13, g_5D92, g_5D94); { 6100:1EA2 }
              if (ShortInt(uVar7) = 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
                goto LAB_6100_206f; { routine anchor; statement location unresolved } { 6100:1E16 }
            end; { routine anchor; statement location unresolved } { 6100:1E16 }
          uVar4 := ov31_0BE7((param_1)^, puVar11[1]); { 6100:1EB3 }
          (P_Byte((puVar11 + 2)))^ := uVar4; { routine anchor; statement location unresolved } { 6100:1E16 }
          uVar7 := ov31_0C0F((param_1)^, puVar11[1]); { 6100:1EC9 }
          (P_Byte((Integer(puVar11) + 5)))^ := ShortInt(uVar7); { routine anchor; statement location unresolved } { 6100:1E16 }
          local_4 := 1; { 6100:1ED5 }
        end; { routine anchor; statement location unresolved } { 6100:1E16 }
      else { routine anchor; statement location unresolved } { 6100:1E16 }
        begin { routine anchor; statement location unresolved } { 6100:1E16 }
          local_b := 20; { 6100:1EDC }
          while ((local_b <> 0) and then (local_4 = 0)) do { routine anchor; statement location unresolved } { 6100:1E16 }
            begin { routine anchor; statement location unresolved } { 6100:1E16 }
              bVar2 := true; { routine anchor; statement location unresolved } { 6100:1E16 }
              uVar14 := g_5D92; { routine anchor; statement location unresolved } { 6100:1E16 }
              uVar15 := g_5D94; { routine anchor; statement location unresolved } { 6100:1E16 }
              uVar8 := ov22_0729(param_4); { 6100:1F02 }
              uVar7 := ov13_37E4(1, (uVar8 and $FF00), uVar8, uVar14, uVar15); { 6100:1F0F }
              if (ShortInt(uVar7) <> 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
                begin { routine anchor; statement location unresolved } { 6100:1E16 }
                  uVar1 := (P_LongWord((Integer(g_5D92) + $108)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                  uVar15 := Word((LongWord(uVar1) shr $10)); { routine anchor; statement location unresolved } { 6100:1E16 }
                  iVar12 := Integer(uVar1); { routine anchor; statement location unresolved } { 6100:1E16 }
                  uVar14 := (P_Word((iVar12 + 10)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                  uVar15 := (P_Word((iVar12 + $C)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                  if ((P_ShortInt(((Word(param_4) * $10) + $3209)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
                    begin { routine anchor; statement location unresolved } { 6100:1E16 }
                      uVar9 := ov31_0BE7(uVar14, uVar15); { 6100:1F4B }
                      uVar10 := ov31_0C0F(uVar14, uVar15); { 6100:1F57 }
                      ov30_0909(Word(g_6716), Slice16(g_6716, 2), 1, $FF, (P_Byte(((Word(param_4) * $10) + $3209)))^, uVar10, uVar9); { 6100:1F7D }
                      bVar3 := g_671A; { routine anchor; statement location unresolved } { 6100:1E16 }
                      if (g_671A <> 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
                        begin { routine anchor; statement location unresolved } { 6100:1E16 }
                          local_a := 1; { 6100:1F8F }
                          while true do { routine anchor; statement location unresolved } { 6100:1E16 }
                            begin { routine anchor; statement location unresolved } { 6100:1E16 }
                              cVar5 := FUN_00ba_23b7(g_5D92, g_5D94); { 6100:1F9F }
                              uVar1 := (P_LongWord(((Word((P_Byte(((Integer(P_LongWord(@(g_6716))) + (Word(local_a) * 3)) + 2)))^) * 4) + $65B9)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                              if ((P_ShortInt((Integer(uVar1) + $10E)))^ <> cVar5) then { routine anchor; statement location unresolved } { 6100:1E16 }
                                begin { routine anchor; statement location unresolved } { 6100:1E16 }
                                  bVar2 := false; { routine anchor; statement location unresolved } { 6100:1E16 }
                                end; { routine anchor; statement location unresolved } { 6100:1E16 }
                              if (local_a = bVar3) then { routine anchor; statement location unresolved } { 6100:1E16 }
                                Break; { routine anchor; statement location unresolved } { 6100:1E16 }
                              local_a := (local_a + 1); { 6100:1F94 }
                            end; { routine anchor; statement location unresolved } { 6100:1E16 }
                        end; { routine anchor; statement location unresolved } { 6100:1E16 }
                    end; { routine anchor; statement location unresolved } { 6100:1E16 }
                  uVar7 := FUN_00ba_0b73(uVar14, uVar15); { 6100:1FDE }
                  if (ShortInt(uVar7) <> 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
                    begin { routine anchor; statement location unresolved } { 6100:1E16 }
                      local_a := 1; { 6100:1FE7 }
                      while true do { routine anchor; statement location unresolved } { 6100:1E16 }
                        begin { routine anchor; statement location unresolved } { 6100:1E16 }
                          uVar7 := 0; { routine anchor; statement location unresolved } { 6100:1E16 }
                          if ((P_ShortInt(((Word(param_4) * $10) + $3204)))^ = (P_ShortInt((local_a + $286B)))^) then { routine anchor; statement location unresolved } { 6100:1E16 }
                            begin { routine anchor; statement location unresolved } { 6100:1E16 }
                              bVar2 := false; { routine anchor; statement location unresolved } { 6100:1E16 }
                            end; { routine anchor; statement location unresolved } { 6100:1E16 }
                          if (local_a = 4) then { routine anchor; statement location unresolved } { 6100:1E16 }
                            Break; { routine anchor; statement location unresolved } { 6100:1E16 }
                          local_a := (local_a + 1); { 6100:1FED }
                        end; { routine anchor; statement location unresolved } { 6100:1E16 }
                    end; { routine anchor; statement location unresolved } { 6100:1E16 }
                  if bVar2 then { routine anchor; statement location unresolved } { 6100:1E16 }
                    begin { routine anchor; statement location unresolved } { 6100:1E16 }
                      uVar1 := (P_LongWord((Integer(g_5D92) + $108)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                      uVar14 := Word((LongWord(uVar1) shr $10)); { routine anchor; statement location unresolved } { 6100:1E16 }
                      iVar12 := Integer(uVar1); { routine anchor; statement location unresolved } { 6100:1E16 }
                      uVar8 := (P_Word((iVar12 + $C)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                      (param_1)^ := (P_Word((iVar12 + 10)))^; { routine anchor; statement location unresolved } { 6100:1E16 }
                      puVar11[1] := uVar8; { routine anchor; statement location unresolved } { 6100:1E16 }
                      uVar4 := ov31_0BE7((param_1)^, puVar11[1]); { 6100:2043 }
                      (P_Byte((puVar11 + 2)))^ := uVar4; { routine anchor; statement location unresolved } { 6100:1E16 }
                      uVar7 := ov31_0C0F((param_1)^, puVar11[1]); { 6100:2059 }
                      (P_Byte((Integer(puVar11) + 5)))^ := ShortInt(uVar7); { routine anchor; statement location unresolved } { 6100:1E16 }
                      local_4 := 1; { 6100:2065 }
                    end; { routine anchor; statement location unresolved } { 6100:1E16 }
                end; { routine anchor; statement location unresolved } { 6100:1E16 }
              local_b := (local_b + -(1)); { 6100:2069 }
            end; { routine anchor; statement location unresolved } { 6100:1E16 }
        end; { routine anchor; statement location unresolved } { 6100:1E16 }
    end; { routine anchor; statement location unresolved } { 6100:1E16 }
  LAB_6100_206f: { routine anchor; statement location unresolved } { 6100:1E16 }
  if (local_4 = 0) then { routine anchor; statement location unresolved } { 6100:1E16 }
    begin { routine anchor; statement location unresolved } { 6100:1E16 }
      local_3 := 0; { 6100:2075 }
      FillChar(MemRef(puVar11, uVar13), 7, 0); { 6100:209F }
      uVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 6100:1E16 }
    end; { routine anchor; statement location unresolved } { 6100:1E16 }
  else { routine anchor; statement location unresolved } { 6100:1E16 }
    begin { routine anchor; statement location unresolved } { 6100:1E16 }
      local_3 := 1; { 6100:208F }
      g_6DB9 := Byte(puVar11[2]); { 6100:2080 }
      uVar4 := Byte((uVar7 shr 8)); { routine anchor; statement location unresolved } { 6100:1E16 }
      g_6DBA := (P_Byte((Integer(puVar11) + 5)))^; { 6100:208A }
    end; { routine anchor; statement location unresolved } { 6100:1E16 }
  Exit(Pack16(uVar4, local_3)); { 6100:20AA }
end; { routine anchor; statement location unresolved } { 6100:1E16 }
```

### ov13:20C3 ov13_20C3 (conf L)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: Byte [BP+$0C].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_23: array[0..20] of Byte [BP-$21]; local_e: Byte [BP-$C]; local_d: ShortInt [BP-$B]; local_c: Integer [BP-$A]; local_a: Integer [BP-$8]; local_5: Byte [BP-$3]; local_4: Byte [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_1693, FUN_6100_1e16, System.@StrCopy, ov30_0909, ov31_02D5, ov31_0BE7, ov31_0C0F.

```pascal
procedure ov13_20C3(param_1: P_Byte; param_2: ShortInt; param_3: Byte); { 6100:20C3 }
begin { routine anchor; statement location unresolved } { 6100:20C3 }
  (param_1)^ := 1; { routine anchor; statement location unresolved } { 6100:20C3 }
  g_6C94 := 0; { 6100:20D0 }
  g_6820 := 0; { 6100:20D5 }
  g_6DB9 := ov31_0BE7(g_5D92, g_5D94); { 6100:20E2 }
  g_6DBA := ov31_0C0F(g_5D92, g_5D94); { 6100:20F2 }
  bVar2 := ((P_Byte(((Word(param_3) * $10) + $3200)))^ and $F); { routine anchor; statement location unresolved } { 6100:20C3 }
  if (bVar2 = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
    begin { routine anchor; statement location unresolved } { 6100:20C3 }
      g_6C95 := g_5D92; { 6100:2116 }
      g_6C97 := g_5D94; { 6100:2119 }
      g_6C94 := 1; { 6100:211D }
    end; { routine anchor; statement location unresolved } { 6100:20C3 }
  else { routine anchor; statement location unresolved } { 6100:20C3 }
    if (bVar2 = $F) then { routine anchor; statement location unresolved } { 6100:20C3 }
      begin { routine anchor; statement location unresolved } { 6100:20C3 }
        cVar3 := FUN_6100_1e16(@(local_c), SS, 0, param_2, param_3); { 6100:213D }
        if (cVar3 = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
          begin { routine anchor; statement location unresolved } { 6100:20C3 }
            (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:20C3 }
          end; { routine anchor; statement location unresolved } { 6100:20C3 }
        else { routine anchor; statement location unresolved } { 6100:20C3 }
          begin { routine anchor; statement location unresolved } { 6100:20C3 }
            uVar5 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 6100:20C3 }
            uVar1 := (P_LongWord((Integer(g_5D92) + $108)))^; { routine anchor; statement location unresolved } { 6100:20C3 }
            uVar6 := Word((LongWord(uVar1) shr $10)); { routine anchor; statement location unresolved } { 6100:20C3 }
            iVar4 := Integer(uVar1); { routine anchor; statement location unresolved } { 6100:20C3 }
            if (((P_Integer((iVar4 + 10)))^ = 0) and then ((P_Integer((iVar4 + $C)))^ = 0)) then { routine anchor; statement location unresolved } { 6100:20C3 }
              begin { routine anchor; statement location unresolved } { 6100:20C3 }
                ov30_0909(Word(g_6716), Slice16(g_6716, 2), 1, $FF, 0, g_6DBA, g_6DB9); { 6100:21A9 }
                bVar2 := g_671A; { routine anchor; statement location unresolved } { 6100:20C3 }
                if (g_671A <> 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
                  begin { routine anchor; statement location unresolved } { 6100:20C3 }
                    local_4 := 1; { 6100:21BB }
                    while true do { routine anchor; statement location unresolved } { 6100:20C3 }
                      begin { routine anchor; statement location unresolved } { 6100:20C3 }
                        iVar4 := (Word((P_Byte(((Integer(P_LongWord(@(g_6716))) + (Word(local_4) * 3)) + 2)))^) * 4); { routine anchor; statement location unresolved } { 6100:20C3 }
                        uVar5 := (P_Word((iVar4 + $65BB)))^; { routine anchor; statement location unresolved } { 6100:20C3 }
                        (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_4) * 4)) + 1)))^ := (P_Word((iVar4 + $65B9)))^; { routine anchor; statement location unresolved } { 6100:20C3 }
                        (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_4) * 4)) + 1)))^ := uVar5; { routine anchor; statement location unresolved } { 6100:20C3 }
                        if (local_4 = bVar2) then { routine anchor; statement location unresolved } { 6100:20C3 }
                          Break; { routine anchor; statement location unresolved } { 6100:20C3 }
                        local_4 := (local_4 + 1); { 6100:21C0 }
                      end; { routine anchor; statement location unresolved } { 6100:20C3 }
                  end; { routine anchor; statement location unresolved } { 6100:20C3 }
                g_6C94 := g_671A; { 6100:2172 }
                g_6820 := 1; { 6100:2205 }
              end; { routine anchor; statement location unresolved } { 6100:20C3 }
            else { routine anchor; statement location unresolved } { 6100:20C3 }
              begin { routine anchor; statement location unresolved } { 6100:20C3 }
                uVar1 := (P_LongWord((Integer(g_5D92) + $108)))^; { routine anchor; statement location unresolved } { 6100:20C3 }
                uVar5 := Word((LongWord(uVar1) shr $10)); { routine anchor; statement location unresolved } { 6100:20C3 }
                iVar4 := Integer(uVar1); { routine anchor; statement location unresolved } { 6100:20C3 }
                g_6C95 := (P_Word((iVar4 + 10)))^; { 6100:216B }
                g_6C97 := (P_Word((iVar4 + $C)))^; { 6100:216E }
                g_6C94 := 1; { 6100:2202 }
              end; { routine anchor; statement location unresolved } { 6100:20C3 }
          end; { routine anchor; statement location unresolved } { 6100:20C3 }
      end; { routine anchor; statement location unresolved } { 6100:20C3 }
    else { routine anchor; statement location unresolved } { 6100:20C3 }
      if ((bVar2 < 8) or else ($E < bVar2)) then { routine anchor; statement location unresolved } { 6100:20C3 }
        begin { routine anchor; statement location unresolved } { 6100:20C3 }
          iVar4 := (((P_Byte(((Word(param_3) * $10) + $3200)))^ and 3) + 1); { routine anchor; statement location unresolved } { 6100:20C3 }
          local_3 := ShortInt(iVar4); { 6100:22EA }
          local_4 := 0; { 6100:227B }
          while (local_3 <> 0) do { routine anchor; statement location unresolved } { 6100:20C3 }
            begin { routine anchor; statement location unresolved } { 6100:20C3 }
              bVar2 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 6100:20C3 }
              iVar4 := FUN_6100_1e16(@(local_c), SS, (Word(bVar2) shl 8), Pack16(bVar2, param_2), Pack16(bVar2, param_3)); { 6100:2235 }
              if (ShortInt(iVar4) = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
                begin { routine anchor; statement location unresolved } { 6100:20C3 }
                  local_3 := (local_3 + -(1)); { 6100:2379 }
                end; { routine anchor; statement location unresolved } { 6100:20C3 }
              else { routine anchor; statement location unresolved } { 6100:20C3 }
                begin { routine anchor; statement location unresolved } { 6100:20C3 }
                  local_d := 0; { 6100:2315 }
                  local_e := local_4; { 6100:21B1 }
                  if (local_4 <> 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
                    begin { routine anchor; statement location unresolved } { 6100:20C3 }
                      local_5 := 1; { 6100:2326 }
                      while true do { routine anchor; statement location unresolved } { 6100:20C3 }
                        begin { routine anchor; statement location unresolved } { 6100:20C3 }
                          if (((P_Integer(((Integer(P_Word(@(g_6C92))) + (Word(local_5) * 4)) + 1)))^ = local_a) and then ((P_Integer(((Integer(P_Word(@(g_6C90))) + (Word(local_5) * 4)) + 1)))^ = local_c)) then { routine anchor; statement location unresolved } { 6100:20C3 }
                            begin { routine anchor; statement location unresolved } { 6100:20C3 }
                              local_d := 1; { 6100:234B }
                            end; { routine anchor; statement location unresolved } { 6100:20C3 }
                          if (local_5 = local_4) then { routine anchor; statement location unresolved } { 6100:20C3 }
                            Break; { routine anchor; statement location unresolved } { 6100:20C3 }
                          local_5 := (local_5 + 1); { 6100:232B }
                        end; { routine anchor; statement location unresolved } { 6100:20C3 }
                    end; { routine anchor; statement location unresolved } { 6100:20C3 }
                  if (local_d = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
                    begin { routine anchor; statement location unresolved } { 6100:20C3 }
                      local_4 := (local_4 + 1); { 6100:2280 }
                      (P_Integer(((Integer(P_Word(@(g_6C90))) + (Word(local_4) * 4)) + 1)))^ := local_c; { routine anchor; statement location unresolved } { 6100:20C3 }
                      (P_Integer(((Integer(P_Word(@(g_6C92))) + (Word(local_4) * 4)) + 1)))^ := local_a; { routine anchor; statement location unresolved } { 6100:20C3 }
                      local_3 := (local_3 + -(1)); { 6100:239A }
                    end; { routine anchor; statement location unresolved } { 6100:20C3 }
                  else { routine anchor; statement location unresolved } { 6100:20C3 }
                    if (param_2 = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
                      begin { routine anchor; statement location unresolved } { 6100:20C3 }
                        puVar7 := local_23; { routine anchor; statement location unresolved } { 6100:20C3 }
                        uVar5 := SS; { routine anchor; statement location unresolved } { 6100:20C3 }
                        PString(local_23, SS) := 'Already been targeted'; { 6100:238E }
                        FUN_00ba_1693(puVar7, uVar5); { 6100:2393 }
                      end; { routine anchor; statement location unresolved } { 6100:20C3 }
                    else { routine anchor; statement location unresolved } { 6100:20C3 }
                      begin { routine anchor; statement location unresolved } { 6100:20C3 }
                        local_3 := (local_3 + -(1)); { 6100:23D6 }
                      end; { routine anchor; statement location unresolved } { 6100:20C3 }
                  uVar5 := ov31_0BE7((P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_4) * 4)) + 1)))^, (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_4) * 4)) + 1)))^); { 6100:23B0 }
                  uVar6 := ov31_0C0F((P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_4) * 4)) + 1)))^, (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_4) * 4)) + 1)))^); { 6100:23C9 }
                  iVar4 := ov31_02D5(uVar6, uVar5); { 6100:23CF }
                end; { routine anchor; statement location unresolved } { 6100:20C3 }
            end; { routine anchor; statement location unresolved } { 6100:20C3 }
          g_6C94 := local_4; { 6100:22C2 }
          if (local_4 = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
            begin { routine anchor; statement location unresolved } { 6100:20C3 }
              (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:20C3 }
            end; { routine anchor; statement location unresolved } { 6100:20C3 }
        end; { routine anchor; statement location unresolved } { 6100:20C3 }
      else { routine anchor; statement location unresolved } { 6100:20C3 }
        begin { routine anchor; statement location unresolved } { 6100:20C3 }
          cVar3 := FUN_6100_1e16(@(local_c), SS, 1, param_2, param_3); { 6100:230B }
          if (cVar3 = 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
            begin { routine anchor; statement location unresolved } { 6100:20C3 }
              (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:20C3 }
            end; { routine anchor; statement location unresolved } { 6100:20C3 }
          else { routine anchor; statement location unresolved } { 6100:20C3 }
            begin { routine anchor; statement location unresolved } { 6100:20C3 }
              ov30_0909(Word(g_6716), Slice16(g_6716, 2), 1, $FF, ((P_Byte(((Word(param_3) * $10) + $3200)))^ and 7), g_6DBA, g_6DB9); { 6100:2269 }
              bVar2 := g_671A; { routine anchor; statement location unresolved } { 6100:20C3 }
              if (g_671A <> 0) then { routine anchor; statement location unresolved } { 6100:20C3 }
                begin { routine anchor; statement location unresolved } { 6100:20C3 }
                  local_4 := 1; { 6100:22ED }
                  while true do { routine anchor; statement location unresolved } { 6100:20C3 }
                    begin { routine anchor; statement location unresolved } { 6100:20C3 }
                      iVar4 := (Word((P_Byte(((Integer(P_LongWord(@(g_6716))) + (Word(local_4) * 3)) + 2)))^) * 4); { routine anchor; statement location unresolved } { 6100:20C3 }
                      uVar5 := (P_Word((iVar4 + $65BB)))^; { routine anchor; statement location unresolved } { 6100:20C3 }
                      (P_Word(((Integer(P_Word(@(g_6C90))) + (Word(local_4) * 4)) + 1)))^ := (P_Word((iVar4 + $65B9)))^; { routine anchor; statement location unresolved } { 6100:20C3 }
                      (P_Word(((Integer(P_Word(@(g_6C92))) + (Word(local_4) * 4)) + 1)))^ := uVar5; { routine anchor; statement location unresolved } { 6100:20C3 }
                      if (local_4 = bVar2) then { routine anchor; statement location unresolved } { 6100:20C3 }
                        Break; { routine anchor; statement location unresolved } { 6100:20C3 }
                      local_4 := (local_4 + 1); { 6100:235D }
                    end; { routine anchor; statement location unresolved } { 6100:20C3 }
                end; { routine anchor; statement location unresolved } { 6100:20C3 }
              g_6C94 := g_671A; { 6100:23DF }
              g_6820 := 1; { 6100:22C5 }
            end; { routine anchor; statement location unresolved } { 6100:20C3 }
        end; { routine anchor; statement location unresolved } { 6100:20C3 }
  Exit; { 6100:23F2 }
end; { routine anchor; statement location unresolved } { 6100:20C3 }
```

### ov13:2414 BeginCasting (conf M)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: Byte [BP+$0C].  
Locals: pcVar1: P_ShortInt [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_1c: Byte [BP-$1A]; local_1b: array[0..14] of Byte [BP-$19]; local_c: Word [BP-$A]; uStack_a: Word [BP-$8]; local_8: Byte [BP-$6]; local_7: Word [BP-$5]; local_5: Byte [BP-$3]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_09e3, FUN_00ba_1693, FUN_00ba_16ec, FUN_00ba_2637, FUN_00ba_2b88, System.@StrCopy, SpellListHeading, ov22_0C20, ov31_1298.

```pascal
procedure BeginCasting(param_1: P_Byte; param_2: ShortInt; param_3: Byte); { 6100:2414 }
begin { routine anchor; statement location unresolved } { 6100:2414 }
  uVar5 := g_5D92; { routine anchor; statement location unresolved } { 6100:2414 }
  uVar6 := $6100; { routine anchor; statement location unresolved } { 6100:2414 }
  _local_c := FarBits(g_5D94, g_5D92); { routine anchor; statement location unresolved } { 6100:2414 }
  local_8 := 1; { 6100:2427 }
  local_7 := $FFFF; { 6100:242B }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:2414 }
  bVar3 := Byte((Word(uVar5) shr 8)); { routine anchor; statement location unresolved } { 6100:2414 }
  local_3 := param_3; { 6100:243A }
  if (param_3 = 0) then { routine anchor; statement location unresolved } { 6100:2414 }
    begin { routine anchor; statement location unresolved } { 6100:2414 }
      uVar6 := $85; { routine anchor; statement location unresolved } { 6100:2414 }
      local_3 := SpellListHeading(@(local_8), SS, @(local_7), SS, Pack16(bVar3, 1), (Word(bVar3) shl 8)); { 6100:2453 }
    end; { routine anchor; statement location unresolved } { 6100:2414 }
  if ((local_3 <> 0) and then ((P_ShortInt(((Word(local_3) * $10) + $3205)))^ = 0)) then { routine anchor; statement location unresolved } { 6100:2414 }
    begin { routine anchor; statement location unresolved } { 6100:2414 }
      puVar7 := @(local_1c); { routine anchor; statement location unresolved } { 6100:2414 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 6100:2414 }
      PString(local_1c, SS) := 'Camp Only Spell'; { 6100:247D }
      uVar6 := $BA; { routine anchor; statement location unresolved } { 6100:2414 }
      FUN_00ba_1693(puVar7, uVar5); { 6100:2482 }
      local_3 := 0; { 6100:2487 }
    end; { routine anchor; statement location unresolved } { 6100:2414 }
  if (param_2 = 0) then { routine anchor; statement location unresolved } { 6100:2414 }
    begin { routine anchor; statement location unresolved } { 6100:2414 }
      FUN_00ba_2b88(); { 6100:2491 }
      ov31_1298(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 3), local_c, uStack_a); { 6100:24A2 }
      uVar6 := $BA; { routine anchor; statement location unresolved } { 6100:2414 }
      FUN_00ba_09e3(local_c, uStack_a); { 6100:24AD }
    end; { routine anchor; statement location unresolved } { 6100:2414 }
  if (local_3 <> 0) then { routine anchor; statement location unresolved } { 6100:2414 }
    begin { routine anchor; statement location unresolved } { 6100:2414 }
      local_5 := Byte((LongWord(LongInt(Integer(Word((P_Byte(((Word(local_3) * $10) + $3206)))^)))) div 3)); { 6100:24D2 }
      if (local_5 = 0) then { routine anchor; statement location unresolved } { 6100:2414 }
        begin { routine anchor; statement location unresolved } { 6100:2414 }
          ov22_0C20(P_Byte(param_1), Integer((LongWord(param_1) shr $10)), 1, param_2, local_3); { 6100:24EB }
          uVar2 := FUN_00ba_2637(local_c, uStack_a); { 6100:24F6 }
          (param_1)^ := uVar2; { routine anchor; statement location unresolved } { 6100:2414 }
        end; { routine anchor; statement location unresolved } { 6100:2414 }
      else { routine anchor; statement location unresolved } { 6100:2414 }
        begin { routine anchor; statement location unresolved } { 6100:2414 }
          (param_1)^ := 1; { routine anchor; statement location unresolved } { 6100:2414 }
          puVar7 := local_1b; { routine anchor; statement location unresolved } { 6100:2414 }
          uVar5 := local_c; { routine anchor; statement location unresolved } { 6100:2414 }
          uVar8 := uStack_a; { routine anchor; statement location unresolved } { 6100:2414 }
          PString(local_1b, SS) := 'Begins Casting'; { 6100:251A }
          FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 10), puVar7, SS, uVar5, uVar8); { 6100:2525 }
          uVar5 := Word((LongWord(_local_c) shr $10)); { routine anchor; statement location unresolved } { 6100:2414 }
          iVar4 := Integer(_local_c); { routine anchor; statement location unresolved } { 6100:2414 }
          (P_Byte((P_LongWord((iVar4 + $108)))^))^ := local_3; { routine anchor; statement location unresolved } { 6100:2414 }
          if (Integer(Word(local_5)) < Integer((P_ShortInt((Integer((P_LongWord((iVar4 + $108)))^) + 3)))^)) then { routine anchor; statement location unresolved } { 6100:2414 }
            begin { routine anchor; statement location unresolved } { 6100:2414 }
              pcVar1 := P_ShortInt((Integer((P_LongWord((iVar4 + $108)))^) + 3)); { routine anchor; statement location unresolved } { 6100:2414 }
              (pcVar1)^ := ((pcVar1)^ - local_5); { routine anchor; statement location unresolved } { 6100:2414 }
            end; { routine anchor; statement location unresolved } { 6100:2414 }
          else { routine anchor; statement location unresolved } { 6100:2414 }
            begin { routine anchor; statement location unresolved } { 6100:2414 }
              (P_Byte((Integer((P_LongWord((iVar4 + $108)))^) + 3)))^ := 1; { routine anchor; statement location unresolved } { 6100:2414 }
            end; { routine anchor; statement location unresolved } { 6100:2414 }
        end; { routine anchor; statement location unresolved } { 6100:2414 }
    end; { routine anchor; statement location unresolved } { 6100:2414 }
  Exit; { 6100:2571 }
end; { routine anchor; statement location unresolved } { 6100:2414 }
```

### ov13:2574 FUN_6100_2574 (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; bVar2: Boolean [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_c: Byte [BP-$A].  
Callers: FUN_6100_0191,FUN_6100_1406.  
Callees: ov13_263D.

```pascal
function FUN_6100_2574(param_1: LongWord; param_2: LongWord): Byte; { 6100:2574 }
begin { routine anchor; statement location unresolved } { 6100:2574 }
  bVar2 := false; { routine anchor; statement location unresolved } { 6100:2574 }
  uVar6 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 6100:2574 }
  iVar4 := Integer(param_2); { routine anchor; statement location unresolved } { 6100:2574 }
  iVar5 := (P_Integer((iVar4 + $CC)))^; { routine anchor; statement location unresolved } { 6100:2574 }
  iVar1 := (P_Integer((iVar4 + $CE)))^; { routine anchor; statement location unresolved } { 6100:2574 }
  if ((iVar5 <> 0) or else (iVar1 <> 0)) then { routine anchor; statement location unresolved } { 6100:2574 }
    begin { routine anchor; statement location unresolved } { 6100:2574 }
      local_c := (P_Byte((iVar5 + $2E)))^; { 6100:25A0 }
    end; { routine anchor; statement location unresolved } { 6100:2574 }
  if (((0 < (P_ShortInt((iVar4 + $9C)))^) and then ((((P_Integer((iVar4 + $D4)))^ = 0) and then ((P_Integer((iVar4 + $D6)))^ = 0)) or else ((P_ShortInt(((P_Integer((iVar4 + $D4)))^ + $2E)))^ = 50))) and then (((iVar5 = 0) and then (iVar1 = 0)) or else (((local_c = 7) or else (local_c = 8)) or else (($22 < local_c) and then (local_c < $26))))) then { routine anchor; statement location unresolved } { 6100:2574 }
    begin { routine anchor; statement location unresolved } { 6100:2574 }
      bVar2 := true; { routine anchor; statement location unresolved } { 6100:2574 }
    end; { routine anchor; statement location unresolved } { 6100:2574 }
  if bVar2 then { routine anchor; statement location unresolved } { 6100:2574 }
    begin { routine anchor; statement location unresolved } { 6100:2574 }
      uVar7 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:2574 }
      iVar5 := Integer(param_1); { routine anchor; statement location unresolved } { 6100:2574 }
      if ((1 < (P_Byte((Integer((P_LongWord((iVar5 + $108)))^) + $F)))^) and then Sequence((cVar3 := ov13_263D(iVar5, uVar7, iVar4, uVar6)); (cVar3 = (P_ShortInt((Integer((P_LongWord((iVar5 + $108)))^) + 9)))^))) then { 6100:2619 }
        begin { routine anchor; statement location unresolved } { 6100:2574 }
          Exit(1); { 6100:263A }
        end; { routine anchor; statement location unresolved } { 6100:2574 }
    end; { routine anchor; statement location unresolved } { 6100:2574 }
  Exit(0); { 6100:263A }
end; { routine anchor; statement location unresolved } { 6100:2574 }
```

### ov13:263D ov13_263D (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08]; param_3: Word [BP+$0A]; param_4: Word [BP+$0C].  
Locals: uVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; local_4: ShortInt [BP-$2].  
Callers: FUN_6100_1406,FUN_6100_2574,FUN_6100_26b0,FUN_6100_2aa0,ov13_17F6,ov13_1884.  
Callees: ov30_057B, ov31_0BE7, ov31_0C0F.

```pascal
function ov13_263D(param_1: Word; param_2: Word; param_3: Word; param_4: Word): Word; { 6100:263D }
begin { routine anchor; statement location unresolved } { 6100:263D }
  uVar1 := ov31_0BE7(param_3, param_4); { 6100:2649 }
  uVar2 := ov31_0C0F(param_3, param_4); { 6100:2657 }
  uVar3 := ov31_0BE7(param_1, param_2); { 6100:2665 }
  ov31_0C0F(param_1, param_2); { 6100:2673 }
  local_4 := 0; { 6100:267B }
  uVar5 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 6100:263D }
  while true do { routine anchor; statement location unresolved } { 6100:263D }
    begin { routine anchor; statement location unresolved } { 6100:263D }
      uVar4 := ov30_057B(Pack16(uVar5, local_4), Pack16(uVar5, UNKNOWN_extraout_AL), Pack16(uVar5, uVar3), Pack16(uVar5, uVar2), Pack16(uVar5, uVar1)); { 6100:2693 }
      uVar5 := Byte((Word(uVar4) shr 8)); { routine anchor; statement location unresolved } { 6100:263D }
      if (ShortInt(uVar4) <> 0) then { routine anchor; statement location unresolved } { 6100:263D }
        Break; { routine anchor; statement location unresolved } { 6100:263D }
      local_4 := (local_4 + 1); { 6100:269C }
    end; { routine anchor; statement location unresolved } { 6100:263D }
  Exit(Pack16(uVar5, local_4)); { 6100:26AD }
end; { routine anchor; statement location unresolved } { 6100:263D }
```

### ov13:26B0 FUN_6100_26b0 (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: Word [BP+$0A]; param_3: Word [BP+$0C]; param_4: Word [BP+$0E]; param_5: Word [BP+$10].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; bVar2: Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_6: Byte [BP-$4]; local_4: Byte [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: ov13_1884.  
Callees: FUN_00ba_1892, FUN_00ba_19de, FUN_00ba_1a29, FUN_08ae_00dc, FUN_08ae_01a5, ov13_263D, ov31_0BE7, ov31_0C0F.

```pascal
procedure FUN_6100_26b0(param_1: LongWord; param_2: Word; param_3: Word; param_4: Word; param_5: Word); { 6100:26B0 }
begin { routine anchor; statement location unresolved } { 6100:26B0 }
  bVar2 := ov13_263D(param_2, param_3, param_4, param_5); { 6100:26C3 }
  local_4 := 1; { 6100:26C9 }
  local_6 := 10; { 6100:26CD }
  local_3 := 13; { 6100:26D1 }
  uVar6 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:26B0 }
  cVar1 := (P_ShortInt((Integer(param_1) + $2E)))^; { routine anchor; statement location unresolved } { 6100:26B0 }
  if ((((cVar1 = 9) or else (cVar1 = 21)) or else (cVar1 = 28)) or else ((cVar1 = 31) or else (cVar1 = 73))) then { routine anchor; statement location unresolved } { 6100:26B0 }
    begin { routine anchor; statement location unresolved } { 6100:26B0 }
      if Boolean((bVar2 and 1)) then { routine anchor; statement location unresolved } { 6100:26B0 }
        begin { routine anchor; statement location unresolved } { 6100:26B0 }
          if ((bVar2 = 3) or else (bVar2 = 5)) then { routine anchor; statement location unresolved } { 6100:26B0 }
            begin { routine anchor; statement location unresolved } { 6100:26B0 }
              FUN_00ba_1892((bVar2 = 5), 0, 1, $E); { 6100:2739 }
            end; { routine anchor; statement location unresolved } { 6100:26B0 }
          else { routine anchor; statement location unresolved } { 6100:26B0 }
            begin { routine anchor; statement location unresolved } { 6100:26B0 }
              FUN_00ba_1892((bVar2 = 7), 0, 0, $E); { 6100:2757 }
            end; { routine anchor; statement location unresolved } { 6100:26B0 }
        end; { routine anchor; statement location unresolved } { 6100:26B0 }
      else { routine anchor; statement location unresolved } { 6100:26B0 }
        begin { routine anchor; statement location unresolved } { 6100:26B0 }
          FUN_00ba_1892(0, 0, (bVar2 shr 2), ((Word(bVar2) mod 4) + $D)); { 6100:2784 }
        end; { routine anchor; statement location unresolved } { 6100:26B0 }
    end; { routine anchor; statement location unresolved } { 6100:26B0 }
  else { routine anchor; statement location unresolved } { 6100:26B0 }
    if (((cVar1 = 2) or else (cVar1 = 7)) or else (cVar1 = 20)) then { routine anchor; statement location unresolved } { 6100:26B0 }
      begin { routine anchor; statement location unresolved } { 6100:26B0 }
        FUN_00ba_19de($10); { 6100:27A1 }
        local_4 := 4; { 6100:27A6 }
        local_6 := $32; { 6100:27AA }
      end; { routine anchor; statement location unresolved } { 6100:26B0 }
    else { routine anchor; statement location unresolved } { 6100:26B0 }
      if ((cVar1 = 85) or else (cVar1 = 86)) then { routine anchor; statement location unresolved } { 6100:26B0 }
        begin { routine anchor; statement location unresolved } { 6100:26B0 }
          FUN_00ba_19de($11); { 6100:27C1 }
          local_4 := 4; { 6100:27C6 }
          local_6 := $32; { 6100:27CA }
        end; { routine anchor; statement location unresolved } { 6100:26B0 }
      else { routine anchor; statement location unresolved } { 6100:26B0 }
        begin { routine anchor; statement location unresolved } { 6100:26B0 }
          if ((P_ShortInt((Integer(param_1) + $2E)))^ = 47) then { routine anchor; statement location unresolved } { 6100:26B0 }
            begin { routine anchor; statement location unresolved } { 6100:26B0 }
              local_3 := 14; { 6100:27DA }
            end; { routine anchor; statement location unresolved } { 6100:26B0 }
          FUN_00ba_1892(0, 0, 0, (local_3 + 7)); { 6100:27EF }
          FUN_00ba_1892(0, 1, 1, (local_3 + 7)); { 6100:2806 }
          local_4 := 2; { 6100:280B }
          local_6 := $14; { 6100:280F }
        end; { routine anchor; statement location unresolved } { 6100:26B0 }
  FUN_08ae_01a5(0); { 6100:2816 }
  FUN_08ae_00dc(g_2620); { 6100:281F }
  uVar6 := ov31_0BE7(param_4, param_5); { 6100:282A }
  uVar3 := ov31_0C0F(param_4, param_5); { 6100:2836 }
  uVar4 := ov31_0BE7(param_2, param_3); { 6100:2842 }
  uVar5 := ov31_0C0F(param_2, param_3); { 6100:284E }
  FUN_00ba_1a29(local_6, local_4, uVar5, uVar4, uVar3, uVar6); { 6100:285C }
  FUN_08ae_00dc(g_262C); { 6100:2865 }
  FUN_08ae_01a5(10); { 6100:286E }
  Exit; { 6100:2876 }
end; { routine anchor; statement location unresolved } { 6100:26B0 }
```

### ov13:2879 ov13_2879 (conf L)

Params (stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; local_a: Word [BP-$8]; uStack_8: Word [BP-$6]; local_6: Word [BP-$4]; local_4: Word [BP-$2].  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov13_2879(); { 6100:2879 }
begin { routine anchor; statement location unresolved } { 6100:2879 }
  local_4 := 0; { 6100:2881 }
  local_6 := 0; { 6100:2886 }
  uStack_8 := g_5D98; { 6100:2893 }
  local_a := g_5D96; { 6100:2890 }
  while ((local_a <> 0) or else (uStack_8 <> 0)) do { routine anchor; statement location unresolved } { 6100:2879 }
    begin { routine anchor; statement location unresolved } { 6100:2879 }
      if ((P_ShortInt((local_a + $10E)))^ = 1) then { routine anchor; statement location unresolved } { 6100:2879 }
        begin { routine anchor; statement location unresolved } { 6100:2879 }
          if ((P_ShortInt((local_a + $10D)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:2879 }
            begin { routine anchor; statement location unresolved } { 6100:2879 }
              local_6 := ((P_Byte((local_a + $11B)))^ + local_6); { 6100:28C1 }
            end; { routine anchor; statement location unresolved } { 6100:2879 }
          local_4 := ((P_Byte((local_a + $32)))^ + local_4); { 6100:28D0 }
        end; { routine anchor; statement location unresolved } { 6100:2879 }
      piVar1 := P_Integer((local_a + $104)); { routine anchor; statement location unresolved } { 6100:2879 }
      uStack_8 := (P_Integer((local_a + $106)))^; { 6100:28E3 }
      local_a := (piVar1)^; { 6100:28E0 }
    end; { routine anchor; statement location unresolved } { 6100:2879 }
  if (local_4 <> 0) then { routine anchor; statement location unresolved } { 6100:2879 }
    begin { routine anchor; statement location unresolved } { 6100:2879 }
      g_6E2F := (ShortInt((((LongWord(local_6) * $14) and $FFFF) div LongWord(local_4))) * 5); { 6100:2901 }
    end; { routine anchor; statement location unresolved } { 6100:2879 }
  Exit; { 6100:2907 }
end; { routine anchor; statement location unresolved } { 6100:2879 }
```

### ov13:2908 ov13_2908 (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_9: Word [BP-$7]; uStack_7: Word [BP-$5]; local_4: Byte [BP-$2].  
Callers: ov13_0C6A.  
Callees: FUN_00ba_23b7, ov13_0123.

```pascal
function ov13_2908(param_1: Word; param_2: Word): Byte; { 6100:2908 }
begin { routine anchor; statement location unresolved } { 6100:2908 }
  local_4 := 0; { 6100:290E }
  uStack_7 := g_5D98; { 6100:291C }
  local_9 := g_5D96; { 6100:2919 }
  while ((local_9 <> 0) or else (uStack_7 <> 0)) do { routine anchor; statement location unresolved } { 6100:2908 }
    begin { routine anchor; statement location unresolved } { 6100:2908 }
      cVar2 := FUN_00ba_23b7(param_1, param_2); { 6100:292D }
      if ((cVar2 = (P_ShortInt((local_9 + $10E)))^) and then ((P_ShortInt((local_9 + $10D)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:2908 }
        begin { routine anchor; statement location unresolved } { 6100:2908 }
          uVar4 := ov13_0123(local_9, uStack_7); { 6100:294E }
          bVar3 := Byte(((uVar4 and $FF) shr 1)); { routine anchor; statement location unresolved } { 6100:2908 }
          if (local_4 < bVar3) then { routine anchor; statement location unresolved } { 6100:2908 }
            begin { routine anchor; statement location unresolved } { 6100:2908 }
              local_4 := bVar3; { 6100:2963 }
            end; { routine anchor; statement location unresolved } { 6100:2908 }
        end; { routine anchor; statement location unresolved } { 6100:2908 }
      piVar1 := P_Integer((local_9 + $104)); { routine anchor; statement location unresolved } { 6100:2908 }
      uStack_7 := (P_Integer((local_9 + $106)))^; { 6100:2976 }
      local_9 := (piVar1)^; { 6100:2973 }
    end; { routine anchor; statement location unresolved } { 6100:2908 }
  Exit(local_4); { 6100:2987 }
end; { routine anchor; statement location unresolved } { 6100:2908 }
```

### ov13:2998 ConfirmAttackAlly (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08]; param_3: LongWord [BP+$0A].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; cVar2: ShortInt [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; local_15: array[0..13] of Byte [BP-$13]; local_7: Integer [BP-$5]; iStack_5: Integer [BP-$3]; local_3: Byte [BP-$1].  
Callers: FUN_6100_2c3d.  
Callees: FUN_00ba_23b7, FUN_00ba_23db, System.@StrCopy, ov25_10D1.

```pascal
function ConfirmAttackAlly(param_1: Word; param_2: Word; param_3: LongWord): Byte; { 6100:2998 }
begin { routine anchor; statement location unresolved } { 6100:2998 }
  cVar2 := FUN_00ba_23b7(param_1, param_2); { 6100:29A4 }
  uVar4 := Word((LongWord(param_3) shr $10)); { routine anchor; statement location unresolved } { 6100:2998 }
  if ((cVar2 = (P_ShortInt((Integer(param_3) + $10E)))^) or else ((P_ShortInt((Integer(param_3) + $10F)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:2998 }
    begin { routine anchor; statement location unresolved } { 6100:2998 }
      local_3 := 1; { 6100:29BE }
    end; { routine anchor; statement location unresolved } { 6100:2998 }
  else { routine anchor; statement location unresolved } { 6100:2998 }
    begin { routine anchor; statement location unresolved } { 6100:2998 }
      puVar5 := local_15; { routine anchor; statement location unresolved } { 6100:2998 }
      PString(local_15, SS) := 'Attack Ally: '; { 6100:29CF }
      cVar2 := ov25_10D1(Pack16(UNKNOWN_extraout_AH, $F), Pack16(UNKNOWN_extraout_AH, 10), Pack16(UNKNOWN_extraout_AH, $D), puVar5, SS); { 6100:29DD }
      if (cVar2 = 89) then { routine anchor; statement location unresolved } { 6100:2998 }
        begin { routine anchor; statement location unresolved } { 6100:2998 }
          local_3 := 1; { 6100:29E6 }
          g_6DE2 := 1; { 6100:29F0 }
          (P_Word((Integer(g_49D6) + $666)))^ := 1; { routine anchor; statement location unresolved } { 6100:2998 }
          iStack_5 := g_5D98; { 6100:2A0A }
          local_7 := g_5D96; { 6100:2A07 }
          while ((local_7 <> 0) or else (iStack_5 <> 0)) do { routine anchor; statement location unresolved } { 6100:2998 }
            begin { routine anchor; statement location unresolved } { 6100:2998 }
              if (((P_ShortInt((local_7 + $10C)))^ = 0) and then ($7F < (P_Byte((local_7 + $84)))^)) then { routine anchor; statement location unresolved } { 6100:2998 }
                begin { routine anchor; statement location unresolved } { 6100:2998 }
                  (P_Byte((local_7 + $10E)))^ := 1; { routine anchor; statement location unresolved } { 6100:2998 }
                  uVar4 := Word((LongWord((P_LongWord((local_7 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:2998 }
                  iVar3 := Integer((P_LongWord((local_7 + $108)))^); { routine anchor; statement location unresolved } { 6100:2998 }
                  (P_Word((iVar3 + 10)))^ := 0; { routine anchor; statement location unresolved } { 6100:2998 }
                  (P_Word((iVar3 + $C)))^ := 0; { routine anchor; statement location unresolved } { 6100:2998 }
                end; { routine anchor; statement location unresolved } { 6100:2998 }
              piVar1 := P_Integer((local_7 + $104)); { routine anchor; statement location unresolved } { 6100:2998 }
              iStack_5 := (P_Integer((local_7 + $106)))^; { 6100:2A56 }
              local_7 := (piVar1)^; { 6100:2A53 }
            end; { routine anchor; statement location unresolved } { 6100:2998 }
          FUN_00ba_23db(); { 6100:2A5B }
        end; { routine anchor; statement location unresolved } { 6100:2998 }
      else { routine anchor; statement location unresolved } { 6100:2998 }
        begin { routine anchor; statement location unresolved } { 6100:2998 }
          local_3 := 0; { 6100:29EC }
        end; { routine anchor; statement location unresolved } { 6100:2998 }
    end; { routine anchor; statement location unresolved } { 6100:2998 }
  Exit(local_3); { 6100:2A66 }
end; { routine anchor; statement location unresolved } { 6100:2998 }
```

### ov13:2AA0 TargetMenu (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: ShortInt [BP+$08]; param_3: Byte [BP+$0A]; param_4: Integer [BP+$0C]; param_5: Integer [BP+$0E]; param_6: Integer [BP+$10]; param_7: Integer [BP+$12].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_233: array[0..255] of Byte [BP-$231]; local_133: array[0..250] of Byte [BP-$131]; local_38: array[0..4] of Byte [BP-$36]; local_33: Byte [BP-$31]; local_32: Byte [BP-$30]; local_31: array[0..3] of Byte [BP-$2F]; local_2d: Byte [BP-$2B]; local_2c: array[0..41] of Byte [BP-$2A].  
Callers: ov13_3558.  
Callees: FUN_00ba_09e3, FUN_00ba_1037, FUN_00ba_2433, FUN_00ba_255b, FUN_00ba_2e03, FUN_00ba_2e46, FUN_00ba_2e8b, FUN_0709_0626, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov13_263D, ov25_03BD, ov31_1298.

```pascal
function TargetMenu(param_1: Word; param_2: ShortInt; param_3: Byte; param_4: Integer; param_5: Integer; param_6: Integer; param_7: Integer): Word; { 6100:2AA0 }
begin { routine anchor; statement location unresolved } { 6100:2AA0 }
  local_2c[0] := 0; { routine anchor; statement location unresolved } { 6100:2AA0 }
  uVar5 := $BA; { routine anchor; statement location unresolved } { 6100:2AA0 }
  local_32 := FUN_00ba_255b(param_4, param_5, param_6, param_7); { 6100:2AB7 }
  uVar2 := ov13_263D(param_4, param_5, param_6, param_7); { 6100:2ACC }
  local_33 := Byte(uVar2); { 6100:2ACF }
  if (param_2 <> 0) then { routine anchor; statement location unresolved } { 6100:2AA0 }
    begin { routine anchor; statement location unresolved } { 6100:2AA0 }
      uVar2 := (uVar2 and $FF00); { routine anchor; statement location unresolved } { 6100:2AA0 }
      uVar3 := $17; { routine anchor; statement location unresolved } { 6100:2AA0 }
      uVar4 := 10; { routine anchor; statement location unresolved } { 6100:2AA0 }
      puVar7 := local_233; { routine anchor; statement location unresolved } { 6100:2AA0 }
      uVar8 := SS; { routine anchor; statement location unresolved } { 6100:2AA0 }
      PString(BP+64975, SS) := 'Range = '; { 6100:2AEC }
      puVar6 := local_133; { routine anchor; statement location unresolved } { 6100:2AA0 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 6100:2AA0 }
      FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH, local_32)); { 6100:2AFB }
      PString(BP+64975, SS) := Copy(PString(BP+64975, SS) + PString(puVar6, uVar5), 1, 255); { 6100:2B00 }
      PString(BP+64975, SS) := Copy(PString(BP+64975, SS) + '  ', 1, 255); { 6100:2B0A }
      uVar5 := $709; { routine anchor; statement location unresolved } { 6100:2AA0 }
      FUN_0709_0626(puVar7, uVar8, uVar4, uVar3, uVar2); { 6100:2B0F }
    end; { routine anchor; statement location unresolved } { 6100:2AA0 }
  if (local_32 <= param_3) then { routine anchor; statement location unresolved } { 6100:2AA0 }
    begin { routine anchor; statement location unresolved } { 6100:2AA0 }
      if (param_2 = 0) then { routine anchor; statement location unresolved } { 6100:2AA0 }
        begin { routine anchor; statement location unresolved } { 6100:2AA0 }
          PString(local_2c, SS) := Copy('Target ', 1, $28); { 6100:2B33 }
          uVar5 := $AF8; { routine anchor; statement location unresolved } { 6100:2AA0 }
        end; { routine anchor; statement location unresolved } { 6100:2AA0 }
      else { routine anchor; statement location unresolved } { 6100:2AA0 }
        if ((param_7 <> param_5) or else (param_6 <> param_4)) then { routine anchor; statement location unresolved } { 6100:2AA0 }
          begin { routine anchor; statement location unresolved } { 6100:2AA0 }
            cVar1 := FUN_00ba_2e03(param_6, param_7); { 6100:2B50 }
            if (cVar1 = 0) then { routine anchor; statement location unresolved } { 6100:2AA0 }
              begin { routine anchor; statement location unresolved } { 6100:2AA0 }
                uVar5 := $AF8; { routine anchor; statement location unresolved } { 6100:2AA0 }
                PString(local_2c, SS) := Copy('Target ', 1, $28); { 6100:2B67 }
              end; { routine anchor; statement location unresolved } { 6100:2AA0 }
            else { routine anchor; statement location unresolved } { 6100:2AA0 }
              begin { routine anchor; statement location unresolved } { 6100:2AA0 }
                uVar5 := $BA; { routine anchor; statement location unresolved } { 6100:2AA0 }
                cVar1 := FUN_00ba_2e8b(local_31, SS, param_6, param_7); { 6100:2B79 }
                if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:2AA0 }
                  begin { routine anchor; statement location unresolved } { 6100:2AA0 }
                    cVar1 := FUN_00ba_2433(1, param_6, param_7); { 6100:2B8B }
                    if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:2AA0 }
                      begin { routine anchor; statement location unresolved } { 6100:2AA0 }
                        uVar5 := $BA; { routine anchor; statement location unresolved } { 6100:2AA0 }
                        cVar1 := FUN_00ba_2e46(param_6, param_7); { 6100:2B9A }
                        if (cVar1 = 0) then { routine anchor; statement location unresolved } { 6100:2AA0 }
                          goto LAB_6100_2bb6; { routine anchor; statement location unresolved } { 6100:2AA0 }
                      end; { routine anchor; statement location unresolved } { 6100:2AA0 }
                    uVar5 := $AF8; { routine anchor; statement location unresolved } { 6100:2AA0 }
                    PString(local_2c, SS) := Copy('Target ', 1, $28); { 6100:2BB1 }
                  end; { routine anchor; statement location unresolved } { 6100:2AA0 }
              end; { routine anchor; statement location unresolved } { 6100:2AA0 }
          end; { routine anchor; statement location unresolved } { 6100:2AA0 }
    end; { routine anchor; statement location unresolved } { 6100:2AA0 }
  LAB_6100_2bb6: { routine anchor; statement location unresolved } { 6100:2AA0 }
  puVar7 := local_133; { routine anchor; statement location unresolved } { 6100:2AA0 }
  uVar8 := SS; { routine anchor; statement location unresolved } { 6100:2AA0 }
  PString(BP+65231, SS) := 'Next Prev Manual '; { 6100:2BC1 }
  PString(BP+65231, SS) := Copy(PString(BP+65231, SS) + PString(local_2c, SS), 1, 255); { 6100:2BCB }
  PString(BP+65231, SS) := Copy(PString(BP+65231, SS) + 'Center Exit', 1, 255); { 6100:2BD5 }
  PString(local_2c, SS) := Copy(PString(puVar7, uVar8), 1, $28); { 6100:2BE3 }
  ov31_1298(Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 3), param_4, param_5); { 6100:2BF4 }
  FUN_00ba_09e3(param_4, param_5); { 6100:2BFF }
  puVar7 := local_38; { routine anchor; statement location unresolved } { 6100:2AA0 }
  uVar5 := SS; { routine anchor; statement location unresolved } { 6100:2AA0 }
  PString(local_38, SS) := 'Aim:'; { 6100:2C0E }
  uVar5 := ov25_03BD(@(local_2d), SS, (Word(UNKNOWN_extraout_AH_01) shl 8), (Word(UNKNOWN_extraout_AH_01) shl 8), Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 10), Pack16(UNKNOWN_extraout_AH_01, $D), local_2c, SS, puVar7, uVar5); { 6100:2C2C }
  Exit(uVar5); { 6100:2C3A }
end; { routine anchor; statement location unresolved } { 6100:2AA0 }
```

### ov13:2C3D FUN_6100_2c3d (conf L)

Params (stack slots): param_1: P_Word [BP+$06]; param_2: P_ShortInt [BP+$0A]; param_3: ShortInt [BP+$0E]; param_4: Word [BP+$10]; param_5: Word [BP+$12]; param_6: Word [BP+$14]; param_7: Word [BP+$16].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar5: P_Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_7: Word [BP-$5]; local_5: Word [BP-$3].  
Callers: FUN_6100_2dfa,ov13_3558.  
Callees: FUN_00ba_255b, FUN_00ba_2637, FUN_00ba_2e03, FUN_00ba_2e46, FUN_00ba_2e8b, System.FillChar, SweepAttack, ov13_17F6, ov13_1884, ConfirmAttackAlly, ov31_0996, ov31_0BE7, ov31_0C0F.

```pascal
procedure FUN_6100_2c3d(param_1: P_Word; param_2: P_ShortInt; param_3: ShortInt; param_4: Word; param_5: Word; param_6: Word; param_7: Word); { 6100:2C3D }
begin { routine anchor; statement location unresolved } { 6100:2C3D }
  local_7 := 0; { 6100:2C45 }
  local_5 := 0; { 6100:2C48 }
  (param_2)^ := 1; { routine anchor; statement location unresolved } { 6100:2C3D }
  if ((param_3 = 1) and then Sequence((cVar1 := ConfirmAttackAlly(param_4, param_5, param_6, param_7)); (cVar1 = 0))) then { 6100:2C65 }
    begin { routine anchor; statement location unresolved } { 6100:2C3D }
      (param_2)^ := 0; { routine anchor; statement location unresolved } { 6100:2C3D }
    end; { routine anchor; statement location unresolved } { 6100:2C3D }
  puVar5 := P_Word(param_1); { routine anchor; statement location unresolved } { 6100:2C3D }
  uVar6 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:2C3D }
  if ((param_2)^ = 0) then { routine anchor; statement location unresolved } { 6100:2C3D }
    begin { routine anchor; statement location unresolved } { 6100:2C3D }
      FillChar(MemRef(puVar5, uVar6), 7, 0); { 6100:2D9C }
    end; { routine anchor; statement location unresolved } { 6100:2C3D }
  else { routine anchor; statement location unresolved } { 6100:2C3D }
    begin { routine anchor; statement location unresolved } { 6100:2C3D }
      (param_1)^ := param_4; { routine anchor; statement location unresolved } { 6100:2C3D }
      puVar5[1] := param_5; { routine anchor; statement location unresolved } { 6100:2C3D }
      uVar2 := ov31_0BE7(param_4, param_5); { 6100:2C95 }
      (P_Byte((puVar5 + 2)))^ := uVar2; { routine anchor; statement location unresolved } { 6100:2C3D }
      uVar2 := ov31_0C0F(param_4, param_5); { 6100:2CA7 }
      (P_Byte((Integer(puVar5) + 5)))^ := uVar2; { routine anchor; statement location unresolved } { 6100:2C3D }
      (P_Byte((Integer(g_6716) + 4)))^ := 0; { routine anchor; statement location unresolved } { 6100:2C3D }
      uVar6 := Word((LongWord(g_6716) shr $10)); { routine anchor; statement location unresolved } { 6100:2C3D }
      iVar3 := ((P_ShortInt((Integer(g_6716) + 3)))^ + 3); { routine anchor; statement location unresolved } { 6100:2C3D }
      uVar2 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 6100:2C3D }
      ov31_0996(Pack16(uVar2, 8), Pack16(uVar2, 3), iVar3, ((P_ShortInt((Integer(g_6716) + 2)))^ + 3)); { 6100:2CDC }
      if (param_3 = 1) then { routine anchor; statement location unresolved } { 6100:2C3D }
        begin { routine anchor; statement location unresolved } { 6100:2C3D }
          cVar1 := SweepAttack(param_4, param_5, param_6, param_7); { 6100:2CF7 }
          if (cVar1 = 0) then { routine anchor; statement location unresolved } { 6100:2C3D }
            begin { routine anchor; statement location unresolved } { 6100:2C3D }
              ov13_17F6(param_4, param_5, param_6, param_7); { 6100:2D1E }
              uVar4 := FUN_00ba_2e03(param_6, param_7); { 6100:2D27 }
              if ((((ShortInt(uVar4) <> 0) and then Sequence((uVar4 := FUN_00ba_2e8b(@(local_7), SS, param_6, param_7)); (ShortInt(uVar4) <> 0))) and then Sequence((uVar4 := FUN_00ba_2e46(param_6, param_7)); (ShortInt(uVar4) <> 0))) and then Sequence((uVar4 := FUN_00ba_255b(param_4, param_5, param_6, param_7)); (ShortInt(uVar4) = 1))) then { 6100:2D5F }
                begin { routine anchor; statement location unresolved } { 6100:2C3D }
                  uVar4 := 0; { routine anchor; statement location unresolved } { 6100:2C3D }
                  local_7 := 0; { 6100:2D6A }
                  local_5 := 0; { 6100:2D6D }
                end; { routine anchor; statement location unresolved } { 6100:2C3D }
              ov13_1884(P_ShortInt(param_2), Integer((LongWord(param_2) shr $10)), local_7, local_5, (uVar4 and $FF00), param_4, param_5, param_6, param_7); { 6100:2D8B }
            end; { routine anchor; statement location unresolved } { 6100:2C3D }
          else { routine anchor; statement location unresolved } { 6100:2C3D }
            begin { routine anchor; statement location unresolved } { 6100:2C3D }
              cVar1 := FUN_00ba_2637(param_6, param_7); { 6100:2D04 }
              (param_2)^ := cVar1; { routine anchor; statement location unresolved } { 6100:2C3D }
            end; { routine anchor; statement location unresolved } { 6100:2C3D }
        end; { routine anchor; statement location unresolved } { 6100:2C3D }
    end; { routine anchor; statement location unresolved } { 6100:2C3D }
  Exit; { 6100:2DA4 }
end; { routine anchor; statement location unresolved } { 6100:2C3D }
```

### ov13:2DFA ManualTarget (conf M)

Params (stack slots): param_1: P_Integer [BP+$06]; param_2: P_ShortInt [BP+$0A]; param_3: ShortInt [BP+$0E]; param_4: ShortInt [BP+$10]; param_5: Byte [BP+$12]; param_6: Integer [BP+$14]; param_7: Integer [BP+$16]; param_8: Integer [BP+$18]; param_9: Integer [BP+$1A].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar6: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; piVar7: P_Integer [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Byte [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; puVar12: P_Byte [compiler temporary; no proven BP slot]; local_23b: array[0..255] of Byte [BP-$239]; local_13b: array[0..236] of Byte [BP-$139]; local_4e: array[0..17] of Byte [BP-$4C]; local_3c: Byte [BP-$3A]; local_3b: ShortInt [BP-$39]; local_3a: Word [BP-$38]; local_38: Byte [BP-$36]; local_37: Byte [BP-$35]; local_36: ShortInt [BP-$34]; local_35: ShortInt [BP-$33]; local_34: ShortInt [BP-$32]; local_33: ShortInt [BP-$31]; local_32: Byte [BP-$30]; local_31: Byte [BP-$2F]; local_30: array[0..3] of Byte [BP-$2E]; local_2c: ShortInt [BP-$2A]; local_2b: array[0..40] of Byte [BP-$29].  
Callers: ov13_3558.  
Callees: FUN_00ba_09e3, FUN_00ba_1073, FUN_00ba_2433, FUN_00ba_2e03, FUN_00ba_2e46, FUN_00ba_2e8b, FUN_03f1_0137, FUN_0709_0626, FUN_0899_0104, FUN_6100_2c3d, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, System.FillChar, ov13_1085, ov25_03BD, ov30_0422, ov31_02D5, ov31_04BE, ov31_0996, ov31_0BE7, ov31_0C0F.

```pascal
procedure ManualTarget(param_1: P_Integer; param_2: P_ShortInt; param_3: ShortInt; param_4: ShortInt; param_5: Byte; param_6: Integer; param_7: Integer; param_8: Integer; param_9: Integer); { 6100:2DFA }
begin { routine anchor; statement location unresolved } { 6100:2DFA }
  uVar10 := (@(stack0x0000) = (P_ShortInt(g_023A) + 2)); { routine anchor; statement location unresolved } { 6100:2DFA }
  uVar8 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:2DFA }
  piVar7 := P_Integer(param_1); { routine anchor; statement location unresolved } { 6100:2DFA }
  FillChar(MemRef(piVar7, uVar8), 7, 0); { 6100:2E0D }
  local_35 := ov31_0BE7(param_6, param_7); { 6100:2E18 }
  uVar9 := $3E0; { routine anchor; statement location unresolved } { 6100:2DFA }
  local_36 := ov31_0C0F(param_6, param_7); { 6100:2E26 }
  local_2c := 32; { 6100:2E2E }
  local_31 := 8; { 6100:2E32 }
  (param_2)^ := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
  (P_Byte((Integer(g_6716) + 4)))^ := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
  (P_Byte((Integer(g_6716) + 5)))^ := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
  repeat { routine anchor; statement location unresolved } { 6100:2DFA }
    begin { routine anchor; statement location unresolved } { 6100:2DFA }
      Flags.ZF := not (LoByte(local_2c) in [0, 13, 69, 84]); { 6100:2E58 }
      if not (Boolean(uVar10)) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          Exit; { 6100:32E3 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      ov31_0996(Pack16(UNKNOWN_extraout_AH, local_31), Pack16(UNKNOWN_extraout_AH, 3), Pack16(UNKNOWN_extraout_AH, local_36), Pack16(UNKNOWN_extraout_AH, local_35)); { 6100:2E71 }
      local_35 := (local_35 + (P_ShortInt((local_31 + $2736)))^); { 6100:2E81 }
      local_36 := (local_36 + (P_ShortInt((local_31 + $273F)))^); { 6100:2E8F }
      if (local_35 < 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          local_35 := 0; { 6100:2E98 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      if (local_36 < 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          local_36 := 0; { 6100:2EA2 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      if (49 < local_35) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          local_35 := 49; { 6100:2EAC }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      if (24 < local_36) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          local_36 := 24; { 6100:2EB6 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      ov31_04BE(@(local_38), SS, @(local_37), SS, local_36, local_35); { 6100:2ECC }
      FUN_0899_0104(); { 6100:2ED1 }
      local_3b := 0; { 6100:2ED6 }
      local_3a := $FF; { 6100:2EDA }
      local_33 := local_35; { 6100:2EE2 }
      local_34 := local_36; { 6100:2EE8 }
      uVar9 := ov31_0BE7(param_8, param_9); { 6100:2EF1 }
      uVar2 := ov31_0C0F(param_8, param_9); { 6100:2EFD }
      uVar9 := ov30_0422(Word(g_6716), Slice16(g_6716, 2), @(local_3a), SS, @(local_34), SS, @(local_33), SS, uVar2, uVar9); { 6100:2F1A }
      bVar6 := Byte((Word(uVar9) shr 8)); { routine anchor; statement location unresolved } { 6100:2DFA }
      if (ShortInt(uVar9) = 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          if (param_4 <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              FUN_03f1_0137(Pack16(bVar6, $17), Pack16(bVar6, $27), Pack16(bVar6, $17), (Word(bVar6) shl 8)); { 6100:2F7F }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      else { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          local_3b := 1; { 6100:2F23 }
          if (param_4 <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              iVar3 := (Word(bVar6) shl 8); { routine anchor; statement location unresolved } { 6100:2DFA }
              uVar4 := Pack16(bVar6, $17); { routine anchor; statement location unresolved } { 6100:2DFA }
              uVar5 := Pack16(bVar6, 10); { routine anchor; statement location unresolved } { 6100:2DFA }
              puVar12 := local_23b; { routine anchor; statement location unresolved } { 6100:2DFA }
              uVar2 := SS; { routine anchor; statement location unresolved } { 6100:2DFA }
              PString(BP+64967, SS) := 'Range = '; { 6100:2F41 }
              puVar11 := local_13b; { routine anchor; statement location unresolved } { 6100:2DFA }
              uVar9 := SS; { routine anchor; statement location unresolved } { 6100:2DFA }
              FUN_00ba_1073((local_3a shr 1)); { 6100:2F52 }
              PString(BP+64967, SS) := Copy(PString(BP+64967, SS) + PString(puVar11, uVar9), 1, 255); { 6100:2F57 }
              PString(BP+64967, SS) := Copy(PString(BP+64967, SS) + '  ', 1, 255); { 6100:2F61 }
              FUN_0709_0626(puVar12, uVar2, uVar5, uVar4, iVar3); { 6100:2F66 }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      local_3a := (local_3a shr 1); { 6100:2F89 }
      param_6 := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
      param_7 := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
      if (local_3b <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          if (local_37 = 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              if ((local_38 = $1F) and then Sequence((local_3c := g_6715); (g_6715 <> 0))) then { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  local_32 := 1; { 6100:2FD1 }
                  while true do { routine anchor; statement location unresolved } { 6100:2DFA }
                    begin { routine anchor; statement location unresolved } { 6100:2DFA }
                      if (((P_ShortInt(((Word(local_32) * 7) + $66DA)))^ = local_35) and then ((P_ShortInt(((Word(local_32) * 7) + $66DB)))^ = local_36)) then { routine anchor; statement location unresolved } { 6100:2DFA }
                        begin { routine anchor; statement location unresolved } { 6100:2DFA }
                          param_6 := (P_Integer(((Word(local_32) * 7) + $66D6)))^; { routine anchor; statement location unresolved } { 6100:2DFA }
                          param_7 := (P_Integer(((Word(local_32) * 7) + $66D8)))^; { routine anchor; statement location unresolved } { 6100:2DFA }
                        end; { routine anchor; statement location unresolved } { 6100:2DFA }
                      if (local_32 = g_6715) then { routine anchor; statement location unresolved } { 6100:2DFA }
                        Break; { routine anchor; statement location unresolved } { 6100:2DFA }
                      local_32 := (local_32 + 1); { 6100:2FD6 }
                    end; { routine anchor; statement location unresolved } { 6100:2DFA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
          else { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              param_6 := (P_Integer(((Word(local_37) * 4) + $65B9)))^; { routine anchor; statement location unresolved } { 6100:2DFA }
              param_7 := (P_Integer(((Word(local_37) * 4) + $65BB)))^; { routine anchor; statement location unresolved } { 6100:2DFA }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      if ((param_6 = 0) and then (param_7 = 0)) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          uVar9 := $3F1; { routine anchor; statement location unresolved } { 6100:2DFA }
          FUN_03f1_0137($15, $26, 1, $17); { 6100:3046 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      else { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          uVar9 := $BA; { routine anchor; statement location unresolved } { 6100:2DFA }
          FUN_00ba_09e3(param_6, param_7); { 6100:3033 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      if ((param_5 < local_3a) or else ((P_ShortInt(((Word(local_38) * 4) + $2744)))^ = -(1))) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          local_3b := 0; { 6100:3067 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      if ((param_6 = 0) and then (param_7 = 0)) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          if (param_3 = 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              local_3b := 0; { 6100:308A }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      else { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          cVar1 := ov13_1085(param_6, param_7, param_8, param_9); { 6100:3083 }
          if (cVar1 = 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              local_3b := 0; { 6100:30B0 }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
          if (param_4 = 1) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              if (((param_9 = param_7) and then (param_8 = param_6)) or else ((local_37 = 0) and then (local_38 = $1F))) then { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  local_3b := 0; { 6100:30FA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
              else { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  uVar9 := $BA; { routine anchor; statement location unresolved } { 6100:2DFA }
                  cVar1 := FUN_00ba_2e03(param_8, param_9); { 6100:30BC }
                  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
                    begin { routine anchor; statement location unresolved } { 6100:2DFA }
                      cVar1 := FUN_00ba_2e8b(local_30, SS, param_8, param_9); { 6100:30D0 }
                      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
                        begin { routine anchor; statement location unresolved } { 6100:2DFA }
                          LAB_6100_30fa: { routine anchor; statement location unresolved } { 6100:2DFA }
                          uVar9 := $BA; { routine anchor; statement location unresolved } { 6100:2DFA }
                          local_3b := 0; { 6100:3106 }
                        end; { routine anchor; statement location unresolved } { 6100:2DFA }
                      else { routine anchor; statement location unresolved } { 6100:2DFA }
                        begin { routine anchor; statement location unresolved } { 6100:2DFA }
                          uVar9 := $BA; { routine anchor; statement location unresolved } { 6100:2DFA }
                          cVar1 := FUN_00ba_2433(1, param_8, param_9); { 6100:30E2 }
                          if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
                            begin { routine anchor; statement location unresolved } { 6100:2DFA }
                              uVar9 := $BA; { routine anchor; statement location unresolved } { 6100:2DFA }
                              cVar1 := FUN_00ba_2e46(param_8, param_9); { 6100:30F1 }
                              if (cVar1 = 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
                                goto LAB_6100_30fa; { routine anchor; statement location unresolved } { 6100:2DFA }
                            end; { routine anchor; statement location unresolved } { 6100:2DFA }
                        end; { routine anchor; statement location unresolved } { 6100:2DFA }
                    end; { routine anchor; statement location unresolved } { 6100:2DFA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      PString(local_2b, SS) := Copy('Center Exit', 1, $28); { 6100:3118 }
      if (local_3b <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          puVar12 := local_13b; { routine anchor; statement location unresolved } { 6100:2DFA }
          uVar9 := SS; { routine anchor; statement location unresolved } { 6100:2DFA }
          PString(BP+65223, SS) := 'Target '; { 6100:312E }
          PString(BP+65223, SS) := Copy(PString(BP+65223, SS) + PString(local_2b, SS), 1, 255); { 6100:3138 }
          PString(local_2b, SS) := Copy(PString(puVar12, uVar9), 1, $28); { 6100:3146 }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      puVar12 := local_4e; { routine anchor; statement location unresolved } { 6100:2DFA }
      uVar2 := SS; { routine anchor; statement location unresolved } { 6100:2DFA }
      PString(local_4e, SS) := '(Use Cursor keys) '; { 6100:3155 }
      uVar9 := $3C5; { routine anchor; statement location unresolved } { 6100:2DFA }
      uVar2 := ov25_03BD(P_Byte(@(g_6E31)), $C7C, (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), local_2b, SS, puVar12, uVar2); { 6100:3173 }
      local_2c := ShortInt(uVar2); { 6100:3178 }
      bVar6 := Byte((Word(uVar2) shr 8)); { routine anchor; statement location unresolved } { 6100:2DFA }
      if ((local_2c = 13) or else (local_2c = 84)) then { routine anchor; statement location unresolved } { 6100:2DFA }
        begin { routine anchor; statement location unresolved } { 6100:2DFA }
          (P_Byte((Integer(g_6716) + 4)))^ := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
          if (local_3b <> 0) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              (P_ShortInt((piVar7 + 2)))^ := local_35; { routine anchor; statement location unresolved } { 6100:2DFA }
              (P_ShortInt((Integer(piVar7) + 5)))^ := local_36; { routine anchor; statement location unresolved } { 6100:2DFA }
              if ((param_6 = 0) and then (param_7 = 0)) then { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  param_6 := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
                  (param_1)^ := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
                  piVar7[1] := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
              else { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  (param_1)^ := param_6; { routine anchor; statement location unresolved } { 6100:2DFA }
                  piVar7[1] := param_7; { routine anchor; statement location unresolved } { 6100:2DFA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
              if (param_4 = 1) then { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  FUN_6100_2c3d(piVar7, uVar8, P_ShortInt(param_2), Integer((LongWord(param_2) shr $10)), Pack16(ShortInt((Word(param_6) shr 8)), 1), (param_1)^, piVar7[1], param_8, param_9); { 6100:31F7 }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
              else { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  (param_2)^ := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
          uVar10 := true; { routine anchor; statement location unresolved } { 6100:2DFA }
          if ((local_3b = 0) or else Sequence((uVar10 := ((param_2)^ = 0)); Boolean(uVar10))) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              ov31_02D5(local_36, local_35); { 6100:321A }
              (param_2)^ := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
              uVar9 := $AF8; { routine anchor; statement location unresolved } { 6100:2DFA }
              FillChar(MemRef(piVar7, uVar8), 7, 0); { 6100:3232 }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
        end; { routine anchor; statement location unresolved } { 6100:2DFA }
      else { routine anchor; statement location unresolved } { 6100:2DFA }
        if (local_2c = 72) then { routine anchor; statement location unresolved } { 6100:2DFA }
          begin { routine anchor; statement location unresolved } { 6100:2DFA }
            local_31 := 0; { 6100:323E }
            uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
          end; { routine anchor; statement location unresolved } { 6100:2DFA }
        else { routine anchor; statement location unresolved } { 6100:2DFA }
          if (local_2c = 73) then { routine anchor; statement location unresolved } { 6100:2DFA }
            begin { routine anchor; statement location unresolved } { 6100:2DFA }
              local_31 := 1; { 6100:3249 }
              uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
            end; { routine anchor; statement location unresolved } { 6100:2DFA }
          else { routine anchor; statement location unresolved } { 6100:2DFA }
            if (local_2c = 77) then { routine anchor; statement location unresolved } { 6100:2DFA }
              begin { routine anchor; statement location unresolved } { 6100:2DFA }
                local_31 := 2; { 6100:3254 }
                uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
              end; { routine anchor; statement location unresolved } { 6100:2DFA }
            else { routine anchor; statement location unresolved } { 6100:2DFA }
              if (local_2c = 81) then { routine anchor; statement location unresolved } { 6100:2DFA }
                begin { routine anchor; statement location unresolved } { 6100:2DFA }
                  local_31 := 3; { 6100:325F }
                  uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                end; { routine anchor; statement location unresolved } { 6100:2DFA }
              else { routine anchor; statement location unresolved } { 6100:2DFA }
                if (local_2c = 80) then { routine anchor; statement location unresolved } { 6100:2DFA }
                  begin { routine anchor; statement location unresolved } { 6100:2DFA }
                    local_31 := 4; { 6100:3269 }
                    uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                  end; { routine anchor; statement location unresolved } { 6100:2DFA }
                else { routine anchor; statement location unresolved } { 6100:2DFA }
                  if (local_2c = 79) then { routine anchor; statement location unresolved } { 6100:2DFA }
                    begin { routine anchor; statement location unresolved } { 6100:2DFA }
                      local_31 := 5; { 6100:3273 }
                      uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                    end; { routine anchor; statement location unresolved } { 6100:2DFA }
                  else { routine anchor; statement location unresolved } { 6100:2DFA }
                    if (local_2c = 75) then { routine anchor; statement location unresolved } { 6100:2DFA }
                      begin { routine anchor; statement location unresolved } { 6100:2DFA }
                        local_31 := 6; { 6100:327D }
                        uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                      end; { routine anchor; statement location unresolved } { 6100:2DFA }
                    else { routine anchor; statement location unresolved } { 6100:2DFA }
                      if (local_2c = 71) then { routine anchor; statement location unresolved } { 6100:2DFA }
                        begin { routine anchor; statement location unresolved } { 6100:2DFA }
                          local_31 := 7; { 6100:3287 }
                          uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                        end; { routine anchor; statement location unresolved } { 6100:2DFA }
                      else { routine anchor; statement location unresolved } { 6100:2DFA }
                        if ((local_2c = 0) or else (local_2c = 69)) then { routine anchor; statement location unresolved } { 6100:2DFA }
                          begin { routine anchor; statement location unresolved } { 6100:2DFA }
                            uVar10 := 1; { routine anchor; statement location unresolved } { 6100:2DFA }
                            ov31_02D5(Pack16(bVar6, local_36), Pack16(bVar6, local_35)); { 6100:329D }
                            uVar9 := $AF8; { routine anchor; statement location unresolved } { 6100:2DFA }
                            FillChar(MemRef(piVar7, uVar8), 7, 0); { 6100:32AE }
                            (param_2)^ := 0; { routine anchor; statement location unresolved } { 6100:2DFA }
                          end; { routine anchor; statement location unresolved } { 6100:2DFA }
                        else { routine anchor; statement location unresolved } { 6100:2DFA }
                          begin { routine anchor; statement location unresolved } { 6100:2DFA }
                            uVar10 := (local_2c = 67); { routine anchor; statement location unresolved } { 6100:2DFA }
                            if Boolean(uVar10) then { routine anchor; statement location unresolved } { 6100:2DFA }
                              begin { routine anchor; statement location unresolved } { 6100:2DFA }
                                uVar9 := $3E0; { routine anchor; statement location unresolved } { 6100:2DFA }
                                ov31_0996(Pack16(bVar6, 8), (Word(bVar6) shl 8), Pack16(bVar6, local_36), Pack16(bVar6, local_35)); { 6100:32CE }
                                local_31 := 8; { 6100:32D3 }
                              end; { routine anchor; statement location unresolved } { 6100:2DFA }
                            else { routine anchor; statement location unresolved } { 6100:2DFA }
                              begin { routine anchor; statement location unresolved } { 6100:2DFA }
                                local_31 := 8; { 6100:32D9 }
                              end; { routine anchor; statement location unresolved } { 6100:2DFA }
                          end; { routine anchor; statement location unresolved } { 6100:2DFA }
    end; { routine anchor; statement location unresolved } { 6100:2DFA }
  until not (true); { routine anchor; statement location unresolved } { 6100:2DFA }
end; { routine anchor; statement location unresolved } { 6100:2DFA }
```

### ov13:32E6 FUN_6100_32e6 (conf L)

Params (stack slots): param_1: Integer [BP+$06]; param_2: Word [BP+$08]; param_3: Word [BP+$0A].  
Locals: bVar1: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: ov13_3558.  
Callees: System.@CopyBytes, ov30_0909, ov31_0BE7, ov31_0C0F, ov31_0C37.

```pascal
procedure FUN_6100_32e6(param_1: Integer; param_2: Word; param_3: Word); { 6100:32E6 }
begin { routine anchor; statement location unresolved } { 6100:32E6 }
  uVar2 := ov31_0BE7(param_2, param_3); { 6100:32F2 }
  uVar3 := ov31_0C0F(param_2, param_3); { 6100:32FE }
  uVar6 := $7F; { routine anchor; statement location unresolved } { 6100:32E6 }
  uVar5 := $FF; { routine anchor; statement location unresolved } { 6100:32E6 }
  uVar4 := ov31_0C37(param_2, param_3); { 6100:3311 }
  ov30_0909(Word(g_6716), Slice16(g_6716, 2), uVar4, uVar5, uVar6, uVar3, uVar2); { 6100:331F }
  (P_Byte((param_1 + -($DA))))^ := g_671A; { routine anchor; statement location unresolved } { 6100:32E6 }
  bVar1 := (P_Byte((param_1 + -($DA))))^; { routine anchor; statement location unresolved } { 6100:32E6 }
  if (bVar1 <> 0) then { routine anchor; statement location unresolved } { 6100:32E6 }
    begin { routine anchor; statement location unresolved } { 6100:32E6 }
      local_3 := 1; { 6100:3341 }
      while true do { routine anchor; statement location unresolved } { 6100:32E6 }
        begin { routine anchor; statement location unresolved } { 6100:32E6 }
          Move(MemRef(((Word(local_3) * 3) + $6718), $C7C), MemRef(((param_1 + (Word(local_3) * 3)) + -($DB)), SS), 3); { 6100:3376 }
          if (local_3 = bVar1) then { routine anchor; statement location unresolved } { 6100:32E6 }
            Break; { routine anchor; statement location unresolved } { 6100:32E6 }
          local_3 := (local_3 + 1); { 6100:3346 }
        end; { routine anchor; statement location unresolved } { 6100:32E6 }
    end; { routine anchor; statement location unresolved } { 6100:32E6 }
  Exit; { 6100:3386 }
end; { routine anchor; statement location unresolved } { 6100:32E6 }
```

### ov13:3389 FUN_6100_3389 (conf L)

Params (stack slots): param_1: Integer [BP+$06]; param_2: ShortInt [BP+$08]; param_3: ShortInt [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot].  
Callers: ov13_3558.  
Callees: FUN_00ba_1a29, ov31_02D5.

```pascal
function FUN_6100_3389(param_1: Integer; param_2: ShortInt; param_3: ShortInt): LongWord; { 6100:3389 }
begin { routine anchor; statement location unresolved } { 6100:3389 }
  if (param_2 = 0) then { routine anchor; statement location unresolved } { 6100:3389 }
    begin { routine anchor; statement location unresolved } { 6100:3389 }
      ov31_02D5((P_Byte((param_1 + -($DF))))^, (P_Byte((param_1 + -($DE))))^); { 6100:3405 }
    end; { routine anchor; statement location unresolved } { 6100:3389 }
  else { routine anchor; statement location unresolved } { 6100:3389 }
    begin { routine anchor; statement location unresolved } { 6100:3389 }
      (P_Byte((param_1 + -($DE))))^ := (P_Byte(((Word((P_Byte(((param_1 + (Word((P_Byte((param_1 + -($DB))))^) * 3)) + -($DB))))^) * 4) + $5F27)))^; { routine anchor; statement location unresolved } { 6100:3389 }
      (P_Byte((param_1 + -($DF))))^ := (P_Byte(((Word((P_Byte(((param_1 + (Word((P_Byte((param_1 + -($DB))))^) * 3)) + -($DB))))^) * 4) + $5F28)))^; { routine anchor; statement location unresolved } { 6100:3389 }
    end; { routine anchor; statement location unresolved } { 6100:3389 }
  (P_ShortInt((param_1 + -($DB))))^ := ((P_ShortInt((param_1 + -($DB))))^ + param_3); { routine anchor; statement location unresolved } { 6100:3389 }
  if ((P_ShortInt((param_1 + -($DB))))^ = 0) then { routine anchor; statement location unresolved } { 6100:3389 }
    begin { routine anchor; statement location unresolved } { 6100:3389 }
      (P_Byte((param_1 + -($DB))))^ := (P_Byte((param_1 + -($DA))))^; { routine anchor; statement location unresolved } { 6100:3389 }
    end; { routine anchor; statement location unresolved } { 6100:3389 }
  if ((P_Byte((param_1 + -($DA))))^ < (P_Byte((param_1 + -($DB))))^) then { routine anchor; statement location unresolved } { 6100:3389 }
    begin { routine anchor; statement location unresolved } { 6100:3389 }
      (P_Byte((param_1 + -($DB))))^ := 1; { routine anchor; statement location unresolved } { 6100:3389 }
    end; { routine anchor; statement location unresolved } { 6100:3389 }
  iVar3 := (Word((P_Byte(((param_1 + (Word((P_Byte((param_1 + -($DB))))^) * 3)) + -($DB))))^) * 4); { routine anchor; statement location unresolved } { 6100:3389 }
  uVar1 := (P_Word((iVar3 + $65B9)))^; { routine anchor; statement location unresolved } { 6100:3389 }
  uVar2 := (P_Word((iVar3 + $65BB)))^; { routine anchor; statement location unresolved } { 6100:3389 }
  (P_Byte((param_1 + -($E0))))^ := (P_Byte(((Word((P_Byte(((param_1 + (Word((P_Byte((param_1 + -($DB))))^) * 3)) + -($DB))))^) * 4) + $5F27)))^; { routine anchor; statement location unresolved } { 6100:3389 }
  (P_Byte((param_1 + -($E1))))^ := (P_Byte(((Word((P_Byte(((param_1 + (Word((P_Byte((param_1 + -($DB))))^) * 3)) + -($DB))))^) * 4) + $5F28)))^; { routine anchor; statement location unresolved } { 6100:3389 }
  if (param_2 <> 0) then { routine anchor; statement location unresolved } { 6100:3389 }
    begin { routine anchor; statement location unresolved } { 6100:3389 }
      FUN_00ba_1a29(0, 1, (P_Byte((param_1 + -($E1))))^, (P_Byte((param_1 + -($E0))))^, (P_Byte((param_1 + -($DF))))^, (P_Byte((param_1 + -($DE))))^); { 6100:3507 }
      (P_Byte((param_1 + -($DE))))^ := (P_Byte((param_1 + -($E0))))^; { routine anchor; statement location unresolved } { 6100:3389 }
      (P_Byte((param_1 + -($DF))))^ := (P_Byte((param_1 + -($E1))))^; { routine anchor; statement location unresolved } { 6100:3389 }
    end; { routine anchor; statement location unresolved } { 6100:3389 }
  Exit(FarBits(uVar2, uVar1)); { 6100:3535 }
end; { routine anchor; statement location unresolved } { 6100:3389 }
```

### ov13:3558 ov13_3558 (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: P_ShortInt [BP+$0A]; param_3: Byte [BP+$0E]; param_4: ShortInt [BP+$10]; param_5: ShortInt [BP+$12]; param_6: LongWord [BP+$14].  
Locals: bVar5: Byte [compiler temporary; no proven BP slot]; uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; bVar8: Boolean [compiler temporary; no proven BP slot]; uVar9: LongWord [compiler temporary; no proven BP slot]; local_e8: ShortInt [BP-$E6]; local_df: Byte [BP-$DD]; local_de: Byte [BP-$DC]; local_db: ShortInt [BP-$D9].  
Callers: FUN_6100_1e16.  
Callees: FUN_00ba_1892, FUN_03f1_0137, TargetMenu, FUN_6100_2c3d, ManualTarget, FUN_6100_32e6, FUN_6100_3389, System.@SetIn, System.FillChar, ov13_1085, ov31_02D5, ov31_0996, ov31_0BE7, ov31_0C0F.

```pascal
procedure ov13_3558(param_1: LongWord; param_2: P_ShortInt; param_3: Byte; param_4: ShortInt; param_5: ShortInt; param_6: LongWord); { 6100:3558 }
begin { routine anchor; statement location unresolved } { 6100:3558 }
  bVar5 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 6100:3558 }
  FUN_00ba_1892((Word(bVar5) shl 8), (Word(bVar5) shl 8), (Word(bVar5) shl 8), Pack16(bVar5, $19)); { 6100:356B }
  uVar7 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 6100:3558 }
  uVar6 := Word(param_1); { routine anchor; statement location unresolved } { 6100:3558 }
  FillChar(MemRef(uVar6, uVar7), 7, 0); { 6100:357C }
  (param_2)^ := 0; { routine anchor; statement location unresolved } { 6100:3558 }
  local_db := param_5; { routine anchor; statement location unresolved } { 6100:3558 }
  if (param_5 = -(1)) then { routine anchor; statement location unresolved } { 6100:3558 }
    begin { routine anchor; statement location unresolved } { 6100:3558 }
      if (((P_Integer((Integer(param_6) + $CC)))^ = 0) and then ((P_Integer((Integer(param_6) + $CE)))^ = 0)) then { routine anchor; statement location unresolved } { 6100:3558 }
        begin { routine anchor; statement location unresolved } { 6100:3558 }
          local_db := 1; { routine anchor; statement location unresolved } { 6100:3558 }
        end; { routine anchor; statement location unresolved } { 6100:3558 }
      else { routine anchor; statement location unresolved } { 6100:3558 }
        begin { routine anchor; statement location unresolved } { 6100:3558 }
          local_db := ((P_ShortInt(((Word((P_Byte((Integer((P_LongWord((Integer(param_6) + $CC)))^) + $2E)))^) * $10) + $558E)))^ + -(1)); { routine anchor; statement location unresolved } { 6100:3558 }
        end; { routine anchor; statement location unresolved } { 6100:3558 }
    end; { routine anchor; statement location unresolved } { 6100:3558 }
  if ((local_db = 0) or else (local_db = -(1))) then { routine anchor; statement location unresolved } { 6100:3558 }
    begin { routine anchor; statement location unresolved } { 6100:3558 }
      local_db := 1; { routine anchor; statement location unresolved } { 6100:3558 }
    end; { routine anchor; statement location unresolved } { 6100:3558 }
  FUN_6100_32e6(@(stack0xfffe), Integer(param_6), Slice16(param_6, 2)); { 6100:35E6 }
  uVar9 := FUN_6100_3389(@(stack0xfffe), Pack16(UNKNOWN_extraout_AH, 1), (Word(UNKNOWN_extraout_AH) shl 8)); { 6100:35FD }
  local_de := 1; { routine anchor; statement location unresolved } { 6100:3558 }
  local_e8 := 32; { routine anchor; statement location unresolved } { 6100:3558 }
  uVar1 := $AF8; { routine anchor; statement location unresolved } { 6100:3558 }
  while true do { routine anchor; statement location unresolved } { 6100:3558 }
    begin { routine anchor; statement location unresolved } { 6100:3558 }
      bVar5 := Byte((LongWord(uVar9) shr 8)); { routine anchor; statement location unresolved } { 6100:3558 }
      bVar8 := ((param_2)^ = 0); { routine anchor; statement location unresolved } { 6100:3558 }
      if not (bVar8) then { routine anchor; statement location unresolved } { 6100:3558 }
        Break; { routine anchor; statement location unresolved } { 6100:3558 }
      Flags.ZF := not (LoByte(Pack16(bVar5, local_e8)) in [0, 69]); { 6100:3628 }
      bVar5 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 6100:3558 }
      if not (bVar8) then { routine anchor; statement location unresolved } { 6100:3558 }
        Break; { routine anchor; statement location unresolved } { 6100:3558 }
      uVar1 := ov13_1085(uVar9, Integer(param_6), Slice16(param_6, 2)); { 6100:3641 }
      bVar5 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 6100:3558 }
      if (ShortInt(uVar1) = 0) then { routine anchor; statement location unresolved } { 6100:3558 }
        begin { routine anchor; statement location unresolved } { 6100:3558 }
          uVar9 := FUN_6100_3389(@(stack0xfffe), (Word(bVar5) shl 8), Pack16(bVar5, local_de)); { 6100:3652 }
          uVar1 := $AF8; { routine anchor; statement location unresolved } { 6100:3558 }
        end; { routine anchor; statement location unresolved } { 6100:3558 }
      else { routine anchor; statement location unresolved } { 6100:3558 }
        begin { routine anchor; statement location unresolved } { 6100:3558 }
          local_e8 := TargetMenu(Pack16(bVar5, param_3), Pack16(bVar5, param_4), Pack16(bVar5, local_db), uVar9, Integer(param_6), Slice16(param_6, 2)); { 6100:367C }
          if (local_e8 = 78) then { routine anchor; statement location unresolved } { 6100:3558 }
            begin { routine anchor; statement location unresolved } { 6100:3558 }
              local_de := 1; { routine anchor; statement location unresolved } { 6100:3558 }
              local_df := 1; { routine anchor; statement location unresolved } { 6100:3558 }
            end; { routine anchor; statement location unresolved } { 6100:3558 }
          else { routine anchor; statement location unresolved } { 6100:3558 }
            if (local_e8 = 80) then { routine anchor; statement location unresolved } { 6100:3558 }
              begin { routine anchor; statement location unresolved } { 6100:3558 }
                local_de := $FF; { routine anchor; statement location unresolved } { 6100:3558 }
                local_df := $FF; { routine anchor; statement location unresolved } { 6100:3558 }
              end; { routine anchor; statement location unresolved } { 6100:3558 }
            else { routine anchor; statement location unresolved } { 6100:3558 }
              begin { routine anchor; statement location unresolved } { 6100:3558 }
                uVar1 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 6100:3558 }
                if (local_e8 = 77) then { routine anchor; statement location unresolved } { 6100:3558 }
                  begin { routine anchor; statement location unresolved } { 6100:3558 }
                    ManualTarget(uVar6, uVar7, P_ShortInt(param_2), uVar1, param_3, param_4, local_db, uVar9, Integer(param_6), Slice16(param_6, 2)); { 6100:36D3 }
                    FUN_00ba_1892((Word(UNKNOWN_extraout_AH_01) shl 8), (Word(UNKNOWN_extraout_AH_01) shl 8), (Word(UNKNOWN_extraout_AH_01) shl 8), Pack16(UNKNOWN_extraout_AH_01, $19)); { 6100:36E2 }
                    FUN_6100_32e6(@(stack0xfffe), Integer(param_6), Slice16(param_6, 2)); { 6100:36EF }
                    local_df := 0; { routine anchor; statement location unresolved } { 6100:3558 }
                  end; { routine anchor; statement location unresolved } { 6100:3558 }
                else { routine anchor; statement location unresolved } { 6100:3558 }
                  if (local_e8 = 84) then { routine anchor; statement location unresolved } { 6100:3558 }
                    begin { routine anchor; statement location unresolved } { 6100:3558 }
                      FUN_6100_2c3d(uVar6, uVar7, P_ShortInt(param_2), uVar1, param_4, uVar9, Integer(param_6), Slice16(param_6, 2)); { 6100:371A }
                      FUN_00ba_1892((Word(UNKNOWN_extraout_AH_02) shl 8), (Word(UNKNOWN_extraout_AH_02) shl 8), (Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, $19)); { 6100:3729 }
                      FUN_6100_32e6(@(stack0xfffe), Integer(param_6), Slice16(param_6, 2)); { 6100:3736 }
                      local_df := 0; { routine anchor; statement location unresolved } { 6100:3558 }
                    end; { routine anchor; statement location unresolved } { 6100:3558 }
                  else { routine anchor; statement location unresolved } { 6100:3558 }
                    if (local_e8 = 67) then { routine anchor; statement location unresolved } { 6100:3558 }
                      begin { routine anchor; statement location unresolved } { 6100:3558 }
                        uVar1 := ov31_0BE7(uVar9); { 6100:374C }
                        uVar2 := ov31_0C0F(uVar9); { 6100:375A }
                        ov31_0996(8, (uVar2 and $FF00), uVar2, uVar1); { 6100:3766 }
                        local_df := 0; { routine anchor; statement location unresolved } { 6100:3558 }
                      end; { routine anchor; statement location unresolved } { 6100:3558 }
              end; { routine anchor; statement location unresolved } { 6100:3558 }
          uVar3 := ov31_0BE7(uVar9); { 6100:3778 }
          uVar4 := ov31_0C0F(uVar9); { 6100:3786 }
          uVar1 := $3E0; { routine anchor; statement location unresolved } { 6100:3558 }
          ov31_02D5(uVar4, uVar3); { 6100:378C }
          uVar3 := Pack16(UNKNOWN_extraout_AH_03, local_df); { routine anchor; statement location unresolved } { 6100:3558 }
          bVar8 := ((param_2)^ = 0); { routine anchor; statement location unresolved } { 6100:3558 }
          if bVar8 then { routine anchor; statement location unresolved } { 6100:3558 }
            begin { routine anchor; statement location unresolved } { 6100:3558 }
              uVar1 := $AF8; { routine anchor; statement location unresolved } { 6100:3558 }
              Flags.ZF := not (LoByte(Pack16(UNKNOWN_extraout_AH_03, local_e8)) in [0, 69]); { 6100:37A9 }
              if not (bVar8) then { routine anchor; statement location unresolved } { 6100:3558 }
                goto LAB_6100_37b0; { routine anchor; statement location unresolved } { 6100:3558 }
              uVar4 := 1; { routine anchor; statement location unresolved } { 6100:3558 }
            end; { routine anchor; statement location unresolved } { 6100:3558 }
          else { routine anchor; statement location unresolved } { 6100:3558 }
            begin { routine anchor; statement location unresolved } { 6100:3558 }
              LAB_6100_37b0: { routine anchor; statement location unresolved } { 6100:3558 }
              uVar4 := 0; { routine anchor; statement location unresolved } { 6100:3558 }
            end; { routine anchor; statement location unresolved } { 6100:3558 }
          uVar9 := FUN_6100_3389(@(stack0xfffe), uVar4, uVar3); { 6100:37B9 }
        end; { routine anchor; statement location unresolved } { 6100:3558 }
    end; { routine anchor; statement location unresolved } { 6100:3558 }
  if (param_4 <> 0) then { routine anchor; statement location unresolved } { 6100:3558 }
    begin { routine anchor; statement location unresolved } { 6100:3558 }
      FUN_03f1_0137(Pack16(bVar5, $17), Pack16(bVar5, $27), Pack16(bVar5, $17), (Word(bVar5) shl 8)); { 6100:37D9 }
    end; { routine anchor; statement location unresolved } { 6100:3558 }
  Exit; { 6100:37E1 }
end; { routine anchor; statement location unresolved } { 6100:3558 }
```

### ov13:37E4 ov13_37E4 (conf L)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: ShortInt [BP+$08]; param_3: Byte [BP+$0A]; param_4: LongWord [BP+$0C].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; bVar2: Boolean [compiler temporary; no proven BP slot]; bVar3: Boolean [compiler temporary; no proven BP slot]; cVar4: ShortInt [compiler temporary; no proven BP slot]; bVar5: Byte [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; local_8: ShortInt [BP-$6]; local_6: Byte [BP-$4]; local_5: ShortInt [BP-$3]; local_4: Byte [BP-$2].  
Callers: FUN_6100_1e16.  
Callees: FUN_00ba_2433, ov13_1085, RollDice.

```pascal
function ov13_37E4(param_1: ShortInt; param_2: ShortInt; param_3: Byte; param_4: LongWord): ShortInt; { 6100:37E4 }
begin { routine anchor; statement location unresolved } { 6100:37E4 }
  local_8 := 0; { 6100:37EE }
  uVar9 := Word((LongWord(param_4) shr $10)); { routine anchor; statement location unresolved } { 6100:37E4 }
  iVar6 := Integer(param_4); { routine anchor; statement location unresolved } { 6100:37E4 }
  uVar10 := Word((LongWord((P_LongWord((iVar6 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:37E4 }
  iVar7 := Integer((P_LongWord((iVar6 + $108)))^); { routine anchor; statement location unresolved } { 6100:37E4 }
  iVar8 := (P_Integer((iVar7 + 10)))^; { routine anchor; statement location unresolved } { 6100:37E4 }
  iVar7 := (P_Integer((iVar7 + $C)))^; { routine anchor; statement location unresolved } { 6100:37E4 }
  if ((param_1 <> 0) or else ((iVar8 <> 0) or else ((iVar7 <> 0) and then ((((P_ShortInt((iVar8 + $10E)))^ = (P_ShortInt((iVar6 + $10E)))^) or else ((P_ShortInt((iVar8 + $10D)))^ = 0)) or else Sequence((cVar4 := ov13_1085(iVar8, iVar7, iVar6, uVar9)); (cVar4 = 0)))))) then { 6100:3844 }
    begin { routine anchor; statement location unresolved } { 6100:37E4 }
      uVar10 := Word((LongWord((P_LongWord((iVar6 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:37E4 }
      iVar8 := Integer((P_LongWord((iVar6 + $108)))^); { routine anchor; statement location unresolved } { 6100:37E4 }
      (P_Word((iVar8 + 10)))^ := 0; { routine anchor; statement location unresolved } { 6100:37E4 }
      (P_Word((iVar8 + $C)))^ := 0; { routine anchor; statement location unresolved } { 6100:37E4 }
    end; { routine anchor; statement location unresolved } { 6100:37E4 }
  uVar10 := Word((LongWord((P_LongWord((iVar6 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:37E4 }
  iVar8 := Integer((P_LongWord((iVar6 + $108)))^); { routine anchor; statement location unresolved } { 6100:37E4 }
  bVar2 := false; { routine anchor; statement location unresolved } { 6100:37E4 }
  bVar3 := false; { routine anchor; statement location unresolved } { 6100:37E4 }
  if (((P_Integer((iVar8 + 10)))^ <> 0) or else ((P_Integer((iVar8 + $C)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:37E4 }
    begin { routine anchor; statement location unresolved } { 6100:37E4 }
      local_8 := 1; { 6100:386F }
    end; { routine anchor; statement location unresolved } { 6100:37E4 }
  while true do { routine anchor; statement location unresolved } { 6100:37E4 }
    begin { routine anchor; statement location unresolved } { 6100:37E4 }
      uVar10 := Word((LongWord(g_6716) shr $10)); { routine anchor; statement location unresolved } { 6100:37E4 }
      if ((local_8 <> 0) or else bVar2) then { routine anchor; statement location unresolved } { 6100:37E4 }
        Break; { routine anchor; statement location unresolved } { 6100:37E4 }
      if (bVar3 and then (param_1 = 0)) then { routine anchor; statement location unresolved } { 6100:37E4 }
        begin { routine anchor; statement location unresolved } { 6100:37E4 }
          (P_Byte((Integer(g_6716) + 6)))^ := 1; { routine anchor; statement location unresolved } { 6100:37E4 }
        end; { routine anchor; statement location unresolved } { 6100:37E4 }
      local_5 := 20; { 6100:38A0 }
      local_4 := FUN_00ba_2433(param_3, iVar6, uVar9); { 6100:38AE }
      while (((local_5 <> 0) and then (local_8 = 0)) and then (local_4 <> 0)) do { routine anchor; statement location unresolved } { 6100:37E4 }
        begin { routine anchor; statement location unresolved } { 6100:37E4 }
          local_5 := (local_5 + -(1)); { 6100:38D1 }
          bVar5 := RollDice(local_4, 1); { 6100:38DB }
          if ((P_ShortInt((bVar5 + $6DE4)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:37E4 }
            begin { routine anchor; statement location unresolved } { 6100:37E4 }
              iVar8 := (Word((P_Byte((bVar5 + $6DE4)))^) * 4); { routine anchor; statement location unresolved } { 6100:37E4 }
              uVar10 := (P_Word((iVar8 + $65B9)))^; { routine anchor; statement location unresolved } { 6100:37E4 }
              uVar1 := (P_Word((iVar8 + $65BB)))^; { routine anchor; statement location unresolved } { 6100:37E4 }
              if (((param_2 = 0) or else ((P_ShortInt((Integer(g_6716) + 6)))^ = 0)) and then Sequence((cVar4 := ov13_1085(uVar10, uVar1, iVar6, uVar9)); (cVar4 = 0))) then { 6100:3933 }
                begin { routine anchor; statement location unresolved } { 6100:37E4 }
                  (P_Byte((bVar5 + $6DE4)))^ := 0; { routine anchor; statement location unresolved } { 6100:37E4 }
                  if (local_4 <> 0) then { routine anchor; statement location unresolved } { 6100:37E4 }
                    begin { routine anchor; statement location unresolved } { 6100:37E4 }
                      local_6 := 1; { 6100:38E0 }
                      while true do { routine anchor; statement location unresolved } { 6100:37E4 }
                        begin { routine anchor; statement location unresolved } { 6100:37E4 }
                          if ((P_ShortInt((local_6 + $6DE4)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:37E4 }
                            begin { routine anchor; statement location unresolved } { 6100:37E4 }
                              local_8 := 1; { 6100:393A }
                            end; { routine anchor; statement location unresolved } { 6100:37E4 }
                          if (local_6 = local_4) then { routine anchor; statement location unresolved } { 6100:37E4 }
                            Break; { routine anchor; statement location unresolved } { 6100:37E4 }
                          local_6 := (local_6 + 1); { 6100:396F }
                        end; { routine anchor; statement location unresolved } { 6100:37E4 }
                    end; { routine anchor; statement location unresolved } { 6100:37E4 }
                  if (local_8 = 0) then { routine anchor; statement location unresolved } { 6100:37E4 }
                    begin { routine anchor; statement location unresolved } { 6100:37E4 }
                      local_4 := 0; { 6100:399D }
                    end; { routine anchor; statement location unresolved } { 6100:37E4 }
                  else { routine anchor; statement location unresolved } { 6100:37E4 }
                    begin { routine anchor; statement location unresolved } { 6100:37E4 }
                      local_8 := 0; { 6100:3985 }
                    end; { routine anchor; statement location unresolved } { 6100:37E4 }
                end; { routine anchor; statement location unresolved } { 6100:37E4 }
              else { routine anchor; statement location unresolved } { 6100:37E4 }
                begin { routine anchor; statement location unresolved } { 6100:37E4 }
                  local_8 := 1; { 6100:3997 }
                  uVar11 := Word((LongWord((P_LongWord((iVar6 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:37E4 }
                  iVar8 := Integer((P_LongWord((iVar6 + $108)))^); { routine anchor; statement location unresolved } { 6100:37E4 }
                  (P_Word((iVar8 + 10)))^ := uVar10; { routine anchor; statement location unresolved } { 6100:37E4 }
                  (P_Word((iVar8 + $C)))^ := uVar1; { routine anchor; statement location unresolved } { 6100:37E4 }
                end; { routine anchor; statement location unresolved } { 6100:37E4 }
            end; { routine anchor; statement location unresolved } { 6100:37E4 }
        end; { routine anchor; statement location unresolved } { 6100:37E4 }
      bVar2 := bVar3; { routine anchor; statement location unresolved } { 6100:37E4 }
      if not (bVar3) then { routine anchor; statement location unresolved } { 6100:37E4 }
        begin { routine anchor; statement location unresolved } { 6100:37E4 }
          bVar3 := true; { routine anchor; statement location unresolved } { 6100:37E4 }
        end; { routine anchor; statement location unresolved } { 6100:37E4 }
    end; { routine anchor; statement location unresolved } { 6100:37E4 }
  (P_Byte((Integer(g_6716) + 6)))^ := 0; { routine anchor; statement location unresolved } { 6100:37E4 }
  Exit(local_8); { 6100:39C6 }
end; { routine anchor; statement location unresolved } { 6100:37E4 }
```

### ov13:39D2 RakeAttack (conf M)

Params (stack slots): none.  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; local_c: array[0..8] of Byte [BP-$A]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_16ec, FUN_00ba_2637, System.@StrCopy, ov13_1884.

Stack layout disagrees with RETF: remaining difference 10 bytes.

```pascal
procedure RakeAttack(); { 6100:39D2 }
begin { routine anchor; statement location unresolved } { 6100:39D2 }
  if (g_6823 = 2) then { routine anchor; statement location unresolved } { 6100:39D2 }
    begin { routine anchor; statement location unresolved } { 6100:39D2 }
      uVar4 := Word((LongWord(UNKNOWN_in_stack_0000000a) shr $10)); { routine anchor; statement location unresolved } { 6100:39D2 }
      iVar2 := Integer(UNKNOWN_in_stack_0000000a); { routine anchor; statement location unresolved } { 6100:39D2 }
      uVar1 := (P_LongWord((Integer((P_LongWord((iVar2 + $108)))^) + 10)))^; { routine anchor; statement location unresolved } { 6100:39D2 }
      if ((P_ShortInt((Integer(uVar1) + $10D)))^ <> 0) then { routine anchor; statement location unresolved } { 6100:39D2 }
        begin { routine anchor; statement location unresolved } { 6100:39D2 }
          (P_Byte((Integer((P_LongWord((iVar2 + $108)))^) + 4)))^ := 2; { routine anchor; statement location unresolved } { 6100:39D2 }
          (P_Byte((iVar2 + $114)))^ := 2; { routine anchor; statement location unresolved } { 6100:39D2 }
          (P_Byte((iVar2 + $116)))^ := 2; { routine anchor; statement location unresolved } { 6100:39D2 }
          (P_Byte((iVar2 + $118)))^ := 4; { routine anchor; statement location unresolved } { 6100:39D2 }
          (P_Byte((iVar2 + $113)))^ := 0; { routine anchor; statement location unresolved } { 6100:39D2 }
          puVar6 := local_c; { routine anchor; statement location unresolved } { 6100:39D2 }
          uVar5 := SS; { routine anchor; statement location unresolved } { 6100:39D2 }
          iVar3 := iVar2; { routine anchor; statement location unresolved } { 6100:39D2 }
          uVar7 := uVar4; { routine anchor; statement location unresolved } { 6100:39D2 }
          PString(local_c, SS) := 'Rakes...'; { 6100:3A3A }
          FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar6, uVar5, iVar3, uVar7); { 6100:3A45 }
          uVar5 := Word((LongWord((P_LongWord((iVar2 + $108)))^) shr $10)); { routine anchor; statement location unresolved } { 6100:39D2 }
          iVar3 := Integer((P_LongWord((iVar2 + $108)))^); { routine anchor; statement location unresolved } { 6100:39D2 }
          ov13_1884(@(local_3), SS, 0, 0, (Word(UNKNOWN_extraout_AH_00) shl 8), (P_Word((iVar3 + 10)))^, (P_Word((iVar3 + $C)))^, iVar2, uVar4); { 6100:3A6F }
          FUN_00ba_2637(iVar2, uVar4); { 6100:3A78 }
        end; { routine anchor; statement location unresolved } { 6100:39D2 }
    end; { routine anchor; statement location unresolved } { 6100:39D2 }
  Exit; { 6100:3A83 }
end; { routine anchor; statement location unresolved } { 6100:39D2 }
```

### ov13:3A86 ov13_3A86 (conf L)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: LongWord [BP+$08]; param_3: LongWord [BP+$0C].  
Locals: uVar1: Byte [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_2637, ov13_1884, RemoveEffect.

```pascal
procedure ov13_3A86(param_1: ShortInt; param_2: LongWord; param_3: LongWord); { 6100:3A86 }
begin { routine anchor; statement location unresolved } { 6100:3A86 }
  uVar4 := Word((LongWord(param_2) shr $10)); { routine anchor; statement location unresolved } { 6100:3A86 }
  iVar2 := Integer(param_2); { routine anchor; statement location unresolved } { 6100:3A86 }
  iVar3 := (Word((P_Byte((iVar2 + 3)))^) * 4); { routine anchor; statement location unresolved } { 6100:3A86 }
  g_6826 := (P_Integer((iVar3 + $65B9)))^; { 6100:3AA3 }
  g_6828 := (P_Word((iVar3 + $65BB)))^; { 6100:3AA6 }
  uVar1 := Byte((Word(g_6826) shr 8)); { routine anchor; statement location unresolved } { 6100:3A86 }
  iVar3 := Integer(param_3); { routine anchor; statement location unresolved } { 6100:3A86 }
  uVar5 := Word((LongWord(param_3) shr $10)); { routine anchor; statement location unresolved } { 6100:3A86 }
  if (((param_1 = 0) and then ((P_ShortInt((iVar3 + $10D)))^ <> 0)) and then ((P_ShortInt((g_6826 + $10D)))^ <> 0)) then { routine anchor; statement location unresolved } { 6100:3A86 }
    begin { routine anchor; statement location unresolved } { 6100:3A86 }
      (P_Byte((iVar3 + $113)))^ := 1; { routine anchor; statement location unresolved } { 6100:3A86 }
      (P_Byte((iVar3 + $114)))^ := 0; { routine anchor; statement location unresolved } { 6100:3A86 }
      (P_Byte((iVar3 + $115)))^ := 3; { routine anchor; statement location unresolved } { 6100:3A86 }
      (P_Byte((iVar3 + $117)))^ := 4; { routine anchor; statement location unresolved } { 6100:3A86 }
      ov13_1884(@(local_3), SS, 0, 0, Pack16(uVar1, 1), g_6826, g_6828, iVar3, uVar5); { 6100:3B42 }
      local_3 := FUN_00ba_2637(iVar3, uVar5); { 6100:3B4B }
      if ((P_ShortInt((g_6826 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 6100:3A86 }
        begin { routine anchor; statement location unresolved } { 6100:3A86 }
          RemoveEffect(iVar2, uVar4, $4A, iVar3, uVar5); { 6100:3AD8 }
        end; { routine anchor; statement location unresolved } { 6100:3A86 }
    end; { routine anchor; statement location unresolved } { 6100:3A86 }
  else { routine anchor; statement location unresolved } { 6100:3A86 }
    begin { routine anchor; statement location unresolved } { 6100:3A86 }
      RemoveEffect(0, 0, Pack16(uVar1, $3A), g_6826, g_6828); { 6100:3AFA }
      if (param_1 = 0) then { routine anchor; statement location unresolved } { 6100:3A86 }
        begin { routine anchor; statement location unresolved } { 6100:3A86 }
          (P_Byte((iVar2 + 4)))^ := 0; { routine anchor; statement location unresolved } { 6100:3A86 }
          RemoveEffect(iVar2, uVar4, Pack16(UNKNOWN_extraout_AH, $4A), iVar3, uVar5); { 6100:3B6E }
        end; { routine anchor; statement location unresolved } { 6100:3A86 }
    end; { routine anchor; statement location unresolved } { 6100:3A86 }
  Exit; { 6100:3B76 }
end; { routine anchor; statement location unresolved } { 6100:3A86 }
```

### ov13:3B93 GodsIntervene (conf M)

Params (stack slots): none.  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Byte [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_108: array[0..235] of Byte [BP-$106]; local_1c: array[0..19] of Byte [BP-$1A]; local_8: Integer [BP-$6]; iStack_6: Integer [BP-$4]; local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_1693, FUN_00ba_2637, System.@StrCompare, System.@StrCopy, System.ParamStr, ov31_0996, ov31_0C5F.

```pascal
function GodsIntervene(): Word; { 6100:3B93 }
begin { routine anchor; statement location unresolved } { 6100:3B93 }
  uVar6 := (@(stack0x0000) = P_Byte($108)); { routine anchor; statement location unresolved } { 6100:3B93 }
  local_3 := 0; { 6100:3B9A }
  puVar7 := local_108; { routine anchor; statement location unresolved } { 6100:3B93 }
  uVar5 := SS; { routine anchor; statement location unresolved } { 6100:3B93 }
  PString(BP+65274, SS) := ParamStr(1); { 6100:3BA8 }
  ComparePascalStrings(PString(puVar7, uVar5), 'STING'); { 6100:3BB2 }
  uVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 6100:3B93 }
  if Boolean(uVar6) then { routine anchor; statement location unresolved } { 6100:3B93 }
    begin { routine anchor; statement location unresolved } { 6100:3B93 }
      local_3 := 1; { 6100:3BBC }
      puVar7 := local_1c; { routine anchor; statement location unresolved } { 6100:3B93 }
      PString(local_1c, SS) := 'The Gods intervene!'; { 6100:3BCA }
      FUN_00ba_1693(puVar7, SS); { 6100:3BCF }
      iStack_6 := g_5D98; { 6100:3BDE }
      local_8 := g_5D96; { 6100:3BDB }
      while ((local_8 <> 0) or else (iStack_6 <> 0)) do { routine anchor; statement location unresolved } { 6100:3B93 }
        begin { routine anchor; statement location unresolved } { 6100:3B93 }
          if ((P_ShortInt((local_8 + $10E)))^ = 1) then { routine anchor; statement location unresolved } { 6100:3B93 }
            begin { routine anchor; statement location unresolved } { 6100:3B93 }
              (P_Byte((local_8 + $10D)))^ := 0; { routine anchor; statement location unresolved } { 6100:3B93 }
              (P_Byte((local_8 + $10C)))^ := 6; { routine anchor; statement location unresolved } { 6100:3B93 }
              uVar2 := ov31_0C5F(local_8, iStack_6); { 6100:3C0C }
              P_Byte(@(g_5F2A))[((uVar2 and $FF) * 4)] := 0; { routine anchor; statement location unresolved } { 6100:3B93 }
            end; { routine anchor; statement location unresolved } { 6100:3B93 }
          local_4 := FUN_00ba_2637(local_8, iStack_6); { 6100:3C24 }
          piVar1 := P_Integer((local_8 + $104)); { routine anchor; statement location unresolved } { 6100:3B93 }
          iStack_6 := (P_Integer((local_8 + $106)))^; { 6100:3C3C }
          local_8 := (piVar1)^; { 6100:3C39 }
        end; { routine anchor; statement location unresolved } { 6100:3B93 }
      uVar5 := Word((LongWord(g_6716) shr $10)); { routine anchor; statement location unresolved } { 6100:3B93 }
      iVar3 := ((P_ShortInt((Integer(g_6716) + 3)))^ + 3); { routine anchor; statement location unresolved } { 6100:3B93 }
      uVar4 := Byte((Word(iVar3) shr 8)); { routine anchor; statement location unresolved } { 6100:3B93 }
      ov31_0996(Pack16(uVar4, 8), Pack16(uVar4, $FF), iVar3, ((P_ShortInt((Integer(g_6716) + 2)))^ + 3)); { 6100:3C61 }
      uVar4 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 6100:3B93 }
    end; { routine anchor; statement location unresolved } { 6100:3B93 }
  Exit(Pack16(uVar4, local_3)); { 6100:3C6C }
end; { routine anchor; statement location unresolved } { 6100:3B93 }
```

### ov13:3C6D ov13_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov13_init(); { 6100:3C6D }
begin { routine anchor; statement location unresolved } { 6100:3C6D }
  Exit; { 6100:3C71 }
end; { routine anchor; statement location unresolved } { 6100:3C6D }
```

### ov18:0006 PlayFinalAnimation (conf M)

Params: repeats: Byte [BP+6]; resourceId: Byte [BP+8]; coordA: Integer [BP+A]; coordB: Integer [BP+C].  
Locals: animation descriptor: 66 bytes [BP-42]; cycles: Byte [BP-4B]; oldTick: LongInt [BP-4A,-48]; nowTick: LongInt [BP-46,-44]; filename: string [BP-51].  
Callers: ov18_02A4.  
Callees (export; corrections below): FUN_0464_0d71, FUN_0464_1b52, FUN_0709_0c3f, System.@LongMul, System.@StrCopy, System.FillChar, ov28_0000, ov28_00A2, ov28_048F.

Assembly reconstruction of frame layout/timing; field aliases are local meanings, not recovered symbols. Two-byte header: frame count +0, current frame +1; then eight-byte entries duration longint +2, far image +6. Low-word compare is unsigned after signed high-word compare; elapsed and duration are treated as 32-bit signed quantities. Free-call 0109 resolves through stub ov28 entry 3 to 048F; epilogue RETF 8 is 0111.

```pascal
procedure PlayFinalAnimation(repeats,resourceId: Byte; coordA,coordB: Integer); { 7A00:0006 }
begin { 7A00:0006 }
  cycles := 0; { 7A00:000C }
  oldTick := FUN_0709_0c3f; { 7A00:0010 }
  FillChar(animation,66,0); { 7A00:0027 }
  ov28_00A2(UNKNOWN_AnimationLoadABI('FINAL',resourceId,2,animation)); { 7A00:0047 }
  FUN_0464_0d71(g_4A20,g_4A22,WordAt(animation,6),WordAt(animation,8),0,0,coordA-1,coordB-1); { 7A00:006A }
  FUN_0464_1b52; { 7A00:006F }
  repeat { 7A00:0074 }
    frame := ByteAt(animation,1); { 7A00:007D }
    ov28_0000(UNKNOWN_AnimationDrawABI(FarPtrAt(animation,6+8*(frame-1)),1,coordA,coordB)); { 7A00:008E }
    nowTick := FUN_0709_0c3f; { 7A00:0093 }
    frameDelay := LongIntAt(animation,2+8*(frame-1)) * (g_49E2+3); { 7A00:00BC }
    if LongInt(nowTick-oldTick) > frameDelay then begin { 7A00:00D1 }
      ByteAt(animation,1) := frame+1; { 7A00:00DB }
      if ByteAt(animation,1) > ByteAt(animation,0) then begin { 7A00:00E1 }
        ByteAt(animation,1) := 1; { 7A00:00E6 }
        cycles := Byte(cycles+1); { 7A00:00EA }
      end; { 7A00:00ED }
      oldTick := nowTick; { 7A00:00F3 }
    end; { 7A00:00F9 }
  until cycles = repeats; { 7A00:00FC }
  ov28_048F(UNKNOWN_AnimationFreeABI(animation)); { 7A00:0109 }
end; { 7A00:0111 }
```

### ov18:02A4 DragonFinale (conf H)

Params (stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; local_102: array[0..215] of Byte [BP-$100]; local_2a: Byte [BP-$28]; local_29: array[0..1] of Byte [BP-$27]; local_27: Byte [BP-$25]; local_26: array[0..3] of Byte [BP-$24]; local_22: array[0..7] of Byte [BP-$20]; local_1a: array[0..4] of Byte [BP-$18]; local_15: array[0..9] of Byte [BP-$13]; local_b: array[0..8] of Byte [BP-$9].  
Callers: none recorded.  
Callees: FUN_00ba_27d9, FUN_0464_0111, FUN_0464_0d71, FUN_0709_0626, FUN_0709_0dbe, FUN_0709_0dd3, PlayFinalAnimation, System.@StrAppend, System.@StrCopy, System.@StrLong.

H name from dragon/Tyranthraxus/Bane narrative and FINAL resource sequence. Text goes through 0709:0626, not standard WriteLn.

```pascal
procedure DragonFinale(); { 7A00:02A4 }
begin { routine anchor; statement location unresolved } { 7A00:02A4 }
  Str(LongInt(FarBits(0, g_5376)):0, PString($4713, $C7C), capacity := 1); { 7A00:02C0 }
  g_4712 := g_49F3; { 7A00:02C8 }
  g_49F3 := 7; { 7A00:02CB }
  g_470E := 0; { 7A00:02D2 }
  g_4710 := 0; { 7A00:02D5 }
  FUN_0709_0dd3($16, $26, $11, 1); { 7A00:02E4 }
  uVar1 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH, $11); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_26; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_26, SS) := 'Mortally wounded, the dragon roars!'; { 7A00:02FC }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:0301 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_00, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_00, $12); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_00, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := @(local_27); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_27, SS) := 'The spirit of Tyranthraxus flares up'; { 7A00:0319 }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:031E }
  uVar1 := Pack16(UNKNOWN_extraout_AH_01, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_01, $13); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_01, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_1a; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_1a, SS) := 'from the dragon''s body.'; { 7A00:0336 }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:033B }
  FUN_00ba_27d9(); { 7A00:0340 }
  puVar6 := local_102; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(BP+65280, SS) := 'FINAL'; { 7A00:0350 }
  PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + PString($4713, $C7C), 1, 255); { 7A00:035A }
  FUN_0464_0111(P_Word(@(g_470E)), $C7C, (Word(UNKNOWN_extraout_AH_02) shl 8), (Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, 1), puVar6, uVar4); { 7A00:036D }
  FUN_0464_0d71(g_4A20, g_4A22, g_470E, g_4710, 0, 0, 0, 0); { 7A00:038E }
  PlayFinalAnimation((((10 - Word(g_49E2)) * 5) shr 1), 2, 5, 3); { 7A00:03B6 }
  puVar6 := local_102; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(BP+65280, SS) := 'FINAL'; { 7A00:03C4 }
  PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + PString($4713, $C7C), 1, 255); { 7A00:03CE }
  FUN_0464_0111(P_Word(@(g_470E)), $C7C, (Word(UNKNOWN_extraout_AH_03) shl 8), (Word(UNKNOWN_extraout_AH_03) shl 8), Pack16(UNKNOWN_extraout_AH_03, 3), puVar6, uVar4); { 7A00:03E1 }
  FUN_0464_0d71(g_4A20, g_4A22, g_470E, g_4710, 0, 0, 0, 0); { 7A00:0402 }
  uVar5 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 7A00:02A4 }
  if (1 < (P_Word((Integer(g_49D6) + $67C)))^) then { routine anchor; statement location unresolved } { 7A00:02A4 }
    begin { routine anchor; statement location unresolved } { 7A00:02A4 }
      puVar6 := local_102; { routine anchor; statement location unresolved } { 7A00:02A4 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
      PString(BP+65280, SS) := 'FINAL'; { 7A00:041E }
      PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + PString($4713, $C7C), 1, 255); { 7A00:0428 }
      FUN_0464_0111(P_Word(@(g_470E)), $C7C, (Word(UNKNOWN_extraout_AH_05) shl 8), (Word(UNKNOWN_extraout_AH_05) shl 8), Pack16(UNKNOWN_extraout_AH_05, 4), puVar6, uVar4); { 7A00:043B }
      FUN_0464_0d71(g_4A20, g_4A22, g_470E, g_4710, 0, 0, $B, 0); { 7A00:045D }
      uVar5 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 7A00:02A4 }
    end; { routine anchor; statement location unresolved } { 7A00:02A4 }
  if (2 < (P_Word((Integer(g_49D6) + $67C)))^) then { routine anchor; statement location unresolved } { 7A00:02A4 }
    begin { routine anchor; statement location unresolved } { 7A00:02A4 }
      puVar6 := local_102; { routine anchor; statement location unresolved } { 7A00:02A4 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
      PString(BP+65280, SS) := 'FINAL'; { 7A00:0479 }
      PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + PString($4713, $C7C), 1, 255); { 7A00:0483 }
      FUN_0464_0111(P_Word(@(g_470E)), $C7C, (Word(UNKNOWN_extraout_AH_07) shl 8), (Word(UNKNOWN_extraout_AH_07) shl 8), Pack16(UNKNOWN_extraout_AH_07, 5), puVar6, uVar4); { 7A00:0496 }
      FUN_0464_0d71(g_4A20, g_4A22, g_470E, g_4710, 0, 0, 9, $D); { 7A00:04B9 }
      uVar5 := UNKNOWN_extraout_AH_08; { routine anchor; statement location unresolved } { 7A00:02A4 }
    end; { routine anchor; statement location unresolved } { 7A00:02A4 }
  if (3 < (P_Word((Integer(g_49D6) + $67C)))^) then { routine anchor; statement location unresolved } { 7A00:02A4 }
    begin { routine anchor; statement location unresolved } { 7A00:02A4 }
      puVar6 := local_102; { routine anchor; statement location unresolved } { 7A00:02A4 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
      PString(BP+65280, SS) := 'FINAL'; { 7A00:04D5 }
      PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + PString($4713, $C7C), 1, 255); { 7A00:04DF }
      FUN_0464_0111(P_Word(@(g_470E)), $C7C, (Word(UNKNOWN_extraout_AH_09) shl 8), (Word(UNKNOWN_extraout_AH_09) shl 8), Pack16(UNKNOWN_extraout_AH_09, 6), puVar6, uVar4); { 7A00:04F2 }
      FUN_0464_0d71(g_4A20, g_4A22, g_470E, g_4710, 0, 0, 9, 0); { 7A00:0514 }
      uVar5 := UNKNOWN_extraout_AH_10; { routine anchor; statement location unresolved } { 7A00:02A4 }
    end; { routine anchor; statement location unresolved } { 7A00:02A4 }
  FUN_0709_0dd3(Pack16(uVar5, $16), Pack16(uVar5, $26), Pack16(uVar5, $11), Pack16(uVar5, 1)); { 7A00:0525 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_11, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_11, $11); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_11, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_26; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_26, SS) := '"Fools, you have but slain the body'; { 7A00:053D }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:0542 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_12, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_12, $12); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_12, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := @(local_27); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_27, SS) := 'I possessed.  I cannot be defeated!"'; { 7A00:055A }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:055F }
  uVar1 := Pack16(UNKNOWN_extraout_AH_13, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_13, $13); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_13, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_29; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_29, SS) := 'With the power of the pool of radiance'; { 7A00:0577 }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:057C }
  uVar1 := Pack16(UNKNOWN_extraout_AH_14, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_14, $14); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_14, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_22; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_22, SS) := 'which I moved here, to my lair,'; { 7A00:0594 }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:0599 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_15, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_15, $15); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_15, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := @(local_27); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_27, SS) := 'I will still rule, by possessing one'; { 7A00:05B1 }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:05B6 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_16, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_16, $16); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_16, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_b; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_b, SS) := 'of you!"'; { 7A00:05CE }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:05D3 }
  PlayFinalAnimation((((10 - Word(g_49E2)) * 5) shr 1), 7, 1, 3); { 7A00:05FB }
  FUN_0709_0dd3(Pack16(UNKNOWN_extraout_AH_17, $16), Pack16(UNKNOWN_extraout_AH_17, $26), Pack16(UNKNOWN_extraout_AH_17, $11), Pack16(UNKNOWN_extraout_AH_17, 1)); { 7A00:060A }
  uVar1 := Pack16(UNKNOWN_extraout_AH_18, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_18, $11); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_18, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_29; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_29, SS) := '"No Lord Bane!  I can still rule here!'; { 7A00:0622 }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:0627 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_19, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_19, $12); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_19, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := @(local_2a); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_2a, SS) := 'I have not failed.  Do not call me back'; { 7A00:063F }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:0644 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_20, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_20, $13); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_20, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_15; { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_15, SS) := 'through the pool!"'; { 7A00:065C }
  FUN_0709_0626(puVar6, uVar4, uVar3, uVar2, uVar1); { 7A00:0661 }
  uVar4 := Pack16(UNKNOWN_extraout_AH_21, 1); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar1 := Pack16(UNKNOWN_extraout_AH_21, $14); { routine anchor; statement location unresolved } { 7A00:02A4 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_21, 10); { routine anchor; statement location unresolved } { 7A00:02A4 }
  puVar6 := local_b; { routine anchor; statement location unresolved } { 7A00:02A4 }
  PString(local_b, SS) := 'Noooo...'; { 7A00:0679 }
  FUN_0709_0626(puVar6, SS, uVar2, uVar1, uVar4); { 7A00:067E }
  PlayFinalAnimation(1, 8, 1, 3); { 7A00:0692 }
  FUN_0709_0dbe(); { 7A00:0695 }
  FUN_0709_0dbe(); { 7A00:069A }
  FUN_0709_0dbe(); { 7A00:069F }
  g_49F3 := g_4712; { 7A00:06A7 }
  FUN_00ba_27d9(); { 7A00:06AA }
  Exit; { 7A00:06B2 }
end; { routine anchor; statement location unresolved } { 7A00:02A4 }
```

### ov18:06B3 ov18_06B3 (conf L)

Params (stack slots): param_1: ShortInt [BP+$06].  
Locals: local_4: Byte [BP-$2]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_0464_1b52, FUN_0464_1e5c, FUN_0709_0dbe, ov27_0000.

```pascal
procedure ov18_06B3(param_1: ShortInt); { 7A00:06B3 }
begin { routine anchor; statement location unresolved } { 7A00:06B3 }
  if (param_1 <> 0) then { routine anchor; statement location unresolved } { 7A00:06B3 }
    begin { routine anchor; statement location unresolved } { 7A00:06B3 }
      ov27_0000($F, $11); { 7A00:06CA }
      FUN_0464_1b52(); { 7A00:06CF }
      local_4 := 0; { 7A00:06D4 }
      while true do { routine anchor; statement location unresolved } { 7A00:06B3 }
        begin { routine anchor; statement location unresolved } { 7A00:06B3 }
          local_3 := 0; { 7A00:06DD }
          while true do { routine anchor; statement location unresolved } { 7A00:06B3 }
            begin { routine anchor; statement location unresolved } { 7A00:06B3 }
              if ((P_Byte((local_3 + $900)))^ < $80) then { routine anchor; statement location unresolved } { 7A00:06B3 }
                begin { routine anchor; statement location unresolved } { 7A00:06B3 }
                  FUN_0464_1e5c(g_5E52, g_5E54, 1, (P_Byte((local_3 + $900)))^, $92D, $C7C, $91D, $C7C); { 7A00:0719 }
                end; { routine anchor; statement location unresolved } { 7A00:06B3 }
              else { routine anchor; statement location unresolved } { 7A00:06B3 }
                begin { routine anchor; statement location unresolved } { 7A00:06B3 }
                  FUN_0464_1e5c(g_5E56, g_5E58, 1, ((P_Byte((local_3 + $900)))^ and $7F), $92D, $C7C, $91D, $C7C); { 7A00:0743 }
                end; { routine anchor; statement location unresolved } { 7A00:06B3 }
              if (local_3 = 10) then { routine anchor; statement location unresolved } { 7A00:06B3 }
                Break; { routine anchor; statement location unresolved } { 7A00:06B3 }
              local_3 := (local_3 + 1); { 7A00:06E3 }
            end; { routine anchor; statement location unresolved } { 7A00:06B3 }
          local_3 := 0; { 7A00:074E }
          while true do { routine anchor; statement location unresolved } { 7A00:06B3 }
            begin { routine anchor; statement location unresolved } { 7A00:06B3 }
              if ((P_Byte((local_3 + $90B)))^ < $80) then { routine anchor; statement location unresolved } { 7A00:06B3 }
                begin { routine anchor; statement location unresolved } { 7A00:06B3 }
                  FUN_0464_1e5c(g_5E52, g_5E54, 1, (P_Byte((local_3 + $90B)))^, $93D, $C7C, $91D, $C7C); { 7A00:078A }
                end; { routine anchor; statement location unresolved } { 7A00:06B3 }
              else { routine anchor; statement location unresolved } { 7A00:06B3 }
                begin { routine anchor; statement location unresolved } { 7A00:06B3 }
                  FUN_0464_1e5c(g_5E56, g_5E58, 1, ((P_Byte((local_3 + $90B)))^ and $7F), $93D, $C7C, $91D, $C7C); { 7A00:07B4 }
                end; { routine anchor; statement location unresolved } { 7A00:06B3 }
              if (local_3 = $11) then { routine anchor; statement location unresolved } { 7A00:06B3 }
                Break; { routine anchor; statement location unresolved } { 7A00:06B3 }
              local_3 := (local_3 + 1); { 7A00:0754 }
            end; { routine anchor; statement location unresolved } { 7A00:06B3 }
          ov27_0000((P_Word(((Word(local_4) * 2) + $95F)))^, (P_Word(((Word(local_4) * 2) + $94D)))^); { 7A00:07D9 }
          FUN_0464_1b52(); { 7A00:07DE }
          if (local_4 = 8) then { routine anchor; statement location unresolved } { 7A00:06B3 }
            Break; { routine anchor; statement location unresolved } { 7A00:06B3 }
          local_4 := (local_4 + 1); { 7A00:06DA }
        end; { routine anchor; statement location unresolved } { 7A00:06B3 }
    end; { routine anchor; statement location unresolved } { 7A00:06B3 }
  local_3 := 0; { 7A00:07EC }
  while true do { routine anchor; statement location unresolved } { 7A00:06B3 }
    begin { routine anchor; statement location unresolved } { 7A00:06B3 }
      if ((P_Byte((local_3 + $900)))^ < $80) then { routine anchor; statement location unresolved } { 7A00:06B3 }
        begin { routine anchor; statement location unresolved } { 7A00:06B3 }
          FUN_0464_1e5c(g_5E52, g_5E54, 0, (P_Byte((local_3 + $900)))^, $92D, $C7C, $91D, $C7C); { 7A00:0828 }
        end; { routine anchor; statement location unresolved } { 7A00:06B3 }
      else { routine anchor; statement location unresolved } { 7A00:06B3 }
        begin { routine anchor; statement location unresolved } { 7A00:06B3 }
          FUN_0464_1e5c(g_5E56, g_5E58, 0, ((P_Byte((local_3 + $900)))^ and $7F), $92D, $C7C, $91D, $C7C); { 7A00:0852 }
        end; { routine anchor; statement location unresolved } { 7A00:06B3 }
      if (local_3 = 10) then { routine anchor; statement location unresolved } { 7A00:06B3 }
        Break; { routine anchor; statement location unresolved } { 7A00:06B3 }
      local_3 := (local_3 + 1); { 7A00:07F2 }
    end; { routine anchor; statement location unresolved } { 7A00:06B3 }
  local_3 := 0; { 7A00:085D }
  while true do { routine anchor; statement location unresolved } { 7A00:06B3 }
    begin { routine anchor; statement location unresolved } { 7A00:06B3 }
      if ((P_Byte((local_3 + $90B)))^ < $80) then { routine anchor; statement location unresolved } { 7A00:06B3 }
        begin { routine anchor; statement location unresolved } { 7A00:06B3 }
          FUN_0464_1e5c(g_5E52, g_5E54, 0, (P_Byte((local_3 + $90B)))^, $93D, $C7C, $91D, $C7C); { 7A00:0899 }
        end; { routine anchor; statement location unresolved } { 7A00:06B3 }
      else { routine anchor; statement location unresolved } { 7A00:06B3 }
        begin { routine anchor; statement location unresolved } { 7A00:06B3 }
          FUN_0464_1e5c(g_5E56, g_5E58, 0, ((P_Byte((local_3 + $90B)))^ and $7F), $93D, $C7C, $91D, $C7C); { 7A00:08C3 }
        end; { routine anchor; statement location unresolved } { 7A00:06B3 }
      if (local_3 = $11) then { routine anchor; statement location unresolved } { 7A00:06B3 }
        Break; { routine anchor; statement location unresolved } { 7A00:06B3 }
      local_3 := (local_3 + 1); { 7A00:0863 }
    end; { routine anchor; statement location unresolved } { 7A00:06B3 }
  if (param_1 <> 0) then { routine anchor; statement location unresolved } { 7A00:06B3 }
    begin { routine anchor; statement location unresolved } { 7A00:06B3 }
      ov27_0000($19, $17); { 7A00:08DC }
      FUN_0464_1b52(); { 7A00:08E1 }
      FUN_0709_0dbe(); { 7A00:08E6 }
      FUN_0709_0dbe(); { 7A00:08EB }
    end; { routine anchor; statement location unresolved } { 7A00:06B3 }
  Exit; { 7A00:08F3 }
end; { routine anchor; statement location unresolved } { 7A00:06B3 }
```

### ov18:08F6 ov18_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov18_init(); { 7A00:08F6 }
begin { routine anchor; statement location unresolved } { 7A00:08F6 }
  Exit; { 7A00:08FA }
end; { routine anchor; statement location unresolved } { 7A00:08F6 }
```

### ov19:004A ShowCharacterSummary (conf M)

Params (stack slots): none.  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; local_309: array[0..255] of Byte [BP-$307]; local_209: array[0..248] of Byte [BP-$207]; local_110: Byte [BP-$10E]; local_10f: array[0..5] of Byte [BP-$10D]; local_109: ShortInt [BP-$107]; local_108: array[0..255] of Byte [BP-$106]; local_8: ShortInt [BP-$6]; local_7: ShortInt [BP-$5]; local_5: Byte [BP-$3]; local_4: ShortInt [BP-$2]; uVar8: Byte [compiler temporary; no proven BP slot].  
Callers: ov19_0AB3.  
Callees: FUN_00ba_0442, FUN_00ba_1037, FUN_00ba_1073, FUN_00ba_10ad, FUN_00ba_1816, FUN_03f1_0000, FUN_0709_0626, FUN_0709_0cab, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov19_050D, ShowCombatStatistics, ov19_0901, ov28_04F9.

```pascal
procedure ShowCharacterSummary(); { 7F00:004A }
begin { routine anchor; statement location unresolved } { 7F00:004A }
  g_4716 := P_Byte(FarBits(g_5D94, g_5D92)); { 7F00:0058 }
  FUN_0709_0cab(); { 7F00:005F }
  FUN_03f1_0000((Word(UNKNOWN_extraout_AH) shl 8), Pack16(UNKNOWN_extraout_AH, $16), Pack16(UNKNOWN_extraout_AH, $26), Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 1)); { 7F00:0073 }
  FUN_00ba_1816((Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, 1), Pack16(UNKNOWN_extraout_AH_00, 1), P_Byte(g_4716), Slice16(g_4716, 2)); { 7F00:0089 }
  if ($7F < P_Byte(g_4716)[$84]) then { routine anchor; statement location unresolved } { 7F00:004A }
    begin { routine anchor; statement location unresolved } { 7F00:004A }
      iVar1 := ((g_4716)^ + 3); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar8 := Byte((Word(iVar1) shr 8)); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar2 := Pack16(uVar8, 1); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar3 := Pack16(uVar8, 10); { routine anchor; statement location unresolved } { 7F00:004A }
      puVar11 := local_10f; { routine anchor; statement location unresolved } { 7F00:004A }
      uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
      PString(BP+65267, SS) := '(NPC)'; { 7F00:00B8 }
      FUN_0709_0626(puVar11, uVar5, uVar3, uVar2, iVar1); { 7F00:00BD }
    end; { routine anchor; statement location unresolved } { 7F00:004A }
  local_5 := 1; { 7F00:00C2 }
  PString(local_108, SS) := Copy(PString(((ShortInt(P_Byte(g_4716)[$9E]) * 7) + $FEC), $C7C), 1, $FF); { 7F00:00E7 }
  FUN_0709_0626(local_108, SS, Pack16(UNKNOWN_extraout_AH_01, $F), Pack16(UNKNOWN_extraout_AH_01, 3), Pack16(UNKNOWN_extraout_AH_01, local_5)); { 7F00:00FC }
  local_5 := ((local_5 + local_108[0]) + 1); { 7F00:0111 }
  PString(local_108, SS) := Copy(PString(((ShortInt(P_Byte(g_4716)[$2E]) * 10) + $F03), $C7C), 1, $FF); { 7F00:0134 }
  FUN_0709_0626(local_108, SS, Pack16(UNKNOWN_extraout_AH_02, $F), Pack16(UNKNOWN_extraout_AH_02, 3), Pack16(UNKNOWN_extraout_AH_02, local_5)); { 7F00:0149 }
  iVar1 := ((Word(local_5) + Word(local_108[0])) + 1); { routine anchor; statement location unresolved } { 7F00:004A }
  local_5 := Byte(iVar1); { 7F00:015E }
  uVar8 := Byte((Word(iVar1) shr 8)); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar3 := Pack16(uVar8, 3); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar4 := Pack16(uVar8, $F); { routine anchor; statement location unresolved } { 7F00:004A }
  puVar11 := local_309; { routine anchor; statement location unresolved } { 7F00:004A }
  uVar2 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
  PString(BP+64761, SS) := 'Age '; { 7F00:0176 }
  puVar10 := local_209; { routine anchor; statement location unresolved } { 7F00:004A }
  uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
  FUN_00ba_1073((P_Word((P_Byte(g_4716) + $30)))^); { 7F00:0189 }
  PString(BP+64761, SS) := Copy(PString(BP+64761, SS) + PString(puVar10, uVar5), 1, 255); { 7F00:018E }
  FUN_0709_0626(puVar11, uVar2, uVar4, uVar3, iVar1); { 7F00:0193 }
  PString(local_108, SS) := Copy(PString(((ShortInt(P_Byte(g_4716)[$A0]) * $11) + $F53), $C7C), 1, $FF); { 7F00:01B9 }
  FUN_0709_0626(local_108, SS, Pack16(UNKNOWN_extraout_AH_03, $F), Pack16(UNKNOWN_extraout_AH_03, 4), Pack16(UNKNOWN_extraout_AH_03, 1)); { 7F00:01CD }
  PString(local_108, SS) := Copy(PString(((ShortInt(P_Byte(g_4716)[$2F]) * $1B) + $D38), $C7C), 1, $FF); { 7F00:01F2 }
  uVar5 := FUN_0709_0626(local_108, SS, Pack16(UNKNOWN_extraout_AH_04, $F), Pack16(UNKNOWN_extraout_AH_04, 5), Pack16(UNKNOWN_extraout_AH_04, 1)); { 7F00:0206 }
  local_7 := 0; { 7F00:020B }
  while true do { routine anchor; statement location unresolved } { 7F00:004A }
    begin { routine anchor; statement location unresolved } { 7F00:004A }
      uVar8 := Byte((Word(uVar5) shr 8)); { routine anchor; statement location unresolved } { 7F00:004A }
      if (local_7 = 0) then { routine anchor; statement location unresolved } { 7F00:004A }
        begin { routine anchor; statement location unresolved } { 7F00:004A }
          PString(local_108, SS) := Copy('STR ', 1, $FF); { 7F00:022A }
          uVar8 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 7F00:004A }
        end; { routine anchor; statement location unresolved } { 7F00:004A }
      else { routine anchor; statement location unresolved } { 7F00:004A }
        if (local_7 = 1) then { routine anchor; statement location unresolved } { 7F00:004A }
          begin { routine anchor; statement location unresolved } { 7F00:004A }
            PString(local_108, SS) := Copy('INT ', 1, $FF); { 7F00:0245 }
            uVar8 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 7F00:004A }
          end; { routine anchor; statement location unresolved } { 7F00:004A }
        else { routine anchor; statement location unresolved } { 7F00:004A }
          if (local_7 = 2) then { routine anchor; statement location unresolved } { 7F00:004A }
            begin { routine anchor; statement location unresolved } { 7F00:004A }
              PString(local_108, SS) := Copy('WIS ', 1, $FF); { 7F00:025F }
              uVar8 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 7F00:004A }
            end; { routine anchor; statement location unresolved } { 7F00:004A }
          else { routine anchor; statement location unresolved } { 7F00:004A }
            if (local_7 = 3) then { routine anchor; statement location unresolved } { 7F00:004A }
              begin { routine anchor; statement location unresolved } { 7F00:004A }
                PString(local_108, SS) := Copy('DEX ', 1, $FF); { 7F00:0279 }
                uVar8 := UNKNOWN_extraout_AH_08; { routine anchor; statement location unresolved } { 7F00:004A }
              end; { routine anchor; statement location unresolved } { 7F00:004A }
            else { routine anchor; statement location unresolved } { 7F00:004A }
              if (local_7 = 4) then { routine anchor; statement location unresolved } { 7F00:004A }
                begin { routine anchor; statement location unresolved } { 7F00:004A }
                  PString(local_108, SS) := Copy('CON ', 1, $FF); { 7F00:0293 }
                  uVar8 := UNKNOWN_extraout_AH_09; { routine anchor; statement location unresolved } { 7F00:004A }
                end; { routine anchor; statement location unresolved } { 7F00:004A }
              else { routine anchor; statement location unresolved } { 7F00:004A }
                if (local_7 = 5) then { routine anchor; statement location unresolved } { 7F00:004A }
                  begin { routine anchor; statement location unresolved } { 7F00:004A }
                    PString(local_108, SS) := Copy('CHA ', 1, $FF); { 7F00:02AD }
                    uVar8 := UNKNOWN_extraout_AH_10; { routine anchor; statement location unresolved } { 7F00:004A }
                  end; { routine anchor; statement location unresolved } { 7F00:004A }
      FUN_0709_0626(local_108, SS, Pack16(ShortInt((Word((local_7 + 7)) shr 8)), 10), (local_7 + 7), Pack16(uVar8, 1)); { 7F00:02C6 }
      uVar5 := ov19_0901((Word(UNKNOWN_extraout_AH_11) shl 8), Pack16(UNKNOWN_extraout_AH_11, local_7)); { 7F00:02D3 }
      if (local_7 = 5) then { routine anchor; statement location unresolved } { 7F00:004A }
        Break; { routine anchor; statement location unresolved } { 7F00:004A }
      local_7 := (local_7 + 1); { 7F00:0211 }
    end; { routine anchor; statement location unresolved } { 7F00:004A }
  ov19_050D(); { 7F00:02E0 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_12, 1); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar3 := Pack16(UNKNOWN_extraout_AH_12, $F); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar4 := Pack16(UNKNOWN_extraout_AH_12, $F); { routine anchor; statement location unresolved } { 7F00:004A }
  puVar11 := local_10f; { routine anchor; statement location unresolved } { 7F00:004A }
  uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
  PString(BP+65267, SS) := 'Level'; { 7F00:02F7 }
  FUN_0709_0626(puVar11, uVar5, uVar4, uVar3, uVar2); { 7F00:02FC }
  local_109 := 0; { routine anchor; statement location unresolved } { 7F00:004A }
  local_108[0] := 0; { routine anchor; statement location unresolved } { 7F00:004A }
  local_8 := 0; { 7F00:030B }
  while true do { routine anchor; statement location unresolved } { 7F00:004A }
    begin { routine anchor; statement location unresolved } { 7F00:004A }
      if (0 < ShortInt(P_Byte(g_4716)[(local_8 + $96)])) then { routine anchor; statement location unresolved } { 7F00:004A }
        begin { routine anchor; statement location unresolved } { 7F00:004A }
          if (local_109 <> 0) then { routine anchor; statement location unresolved } { 7F00:004A }
            begin { routine anchor; statement location unresolved } { 7F00:004A }
              puVar11 := local_209; { routine anchor; statement location unresolved } { 7F00:004A }
              uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
              PString(BP+65274, SS) := PString(local_108, SS); { 7F00:0339 }
              PString(BP+65274, SS) := Copy(PString(BP+65274, SS) + '/', 1, 255); { 7F00:0343 }
              PString(local_108, SS) := Copy(PString(puVar11, uVar5), 1, $FF); { 7F00:0352 }
            end; { routine anchor; statement location unresolved } { 7F00:004A }
          puVar11 := local_309; { routine anchor; statement location unresolved } { 7F00:004A }
          uVar2 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
          PString(BP+65274, SS) := PString(local_108, SS); { 7F00:0363 }
          puVar10 := local_209; { routine anchor; statement location unresolved } { 7F00:004A }
          uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
          FUN_00ba_1037(Pack16((local_8 shr 7), P_Byte(g_4716)[(local_8 + $96)])); { 7F00:037E }
          PString(BP+65274, SS) := Copy(PString(BP+65274, SS) + PString(puVar10, uVar5), 1, 255); { 7F00:0383 }
          PString(local_108, SS) := Copy(PString(puVar11, uVar2), 1, $FF); { 7F00:0392 }
          local_109 := 1; { routine anchor; statement location unresolved } { 7F00:004A }
        end; { routine anchor; statement location unresolved } { 7F00:004A }
      if (local_8 = 7) then { routine anchor; statement location unresolved } { 7F00:004A }
        Break; { routine anchor; statement location unresolved } { 7F00:004A }
      local_8 := (local_8 + 1); { 7F00:0311 }
    end; { routine anchor; statement location unresolved } { 7F00:004A }
  FUN_0709_0626(local_108, SS, $F, $F, 7); { 7F00:03B4 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_13, $11); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar4 := Pack16(UNKNOWN_extraout_AH_13, $F); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar6 := Pack16(UNKNOWN_extraout_AH_13, $F); { routine anchor; statement location unresolved } { 7F00:004A }
  puVar11 := local_309; { routine anchor; statement location unresolved } { 7F00:004A }
  uVar2 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
  PString(BP+64761, SS) := 'Exp '; { 7F00:03CD }
  puVar10 := local_209; { routine anchor; statement location unresolved } { 7F00:004A }
  uVar9 := Word((LongWord(g_4716) shr $10)); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
  FUN_00ba_10ad((P_Word((P_Byte(g_4716) + $AC)))^, (P_Word((P_Byte(g_4716) + $AE)))^); { 7F00:03E6 }
  PString(BP+64761, SS) := Copy(PString(BP+64761, SS) + PString(puVar10, uVar5), 1, 255); { 7F00:03EB }
  uVar9 := $709; { routine anchor; statement location unresolved } { 7F00:004A }
  FUN_0709_0626(puVar11, uVar2, uVar6, uVar4, uVar3); { 7F00:03F0 }
  ShowCombatStatistics(); { 7F00:03F6 }
  local_4 := 20; { 7F00:03F9 }
  uVar5 := Word((LongWord(g_4716) shr $10)); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar7 := ((P_Word((P_Byte(g_4716) + $CC)))^ or (P_Word((P_Byte(g_4716) + $CE)))^); { routine anchor; statement location unresolved } { 7F00:004A }
  if (uVar7 <> 0) then { routine anchor; statement location unresolved } { 7F00:004A }
    begin { routine anchor; statement location unresolved } { 7F00:004A }
      uVar8 := Byte((uVar7 shr 8)); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar2 := Pack16(uVar8, 1); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar3 := Pack16(uVar8, $14); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar4 := Pack16(uVar8, $F); { routine anchor; statement location unresolved } { 7F00:004A }
      puVar11 := @(local_110); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
      PString(BP+65266, SS) := 'Weapon'; { 7F00:0422 }
      FUN_0709_0626(puVar11, uVar5, uVar4, uVar3, uVar2); { 7F00:0427 }
      uVar9 := $BA; { routine anchor; statement location unresolved } { 7F00:004A }
      FUN_00ba_0442(Pack16(UNKNOWN_extraout_AH_14, 1), (Word(UNKNOWN_extraout_AH_14) shl 8), Pack16(UNKNOWN_extraout_AH_14, local_4), Pack16(UNKNOWN_extraout_AH_14, 8), (P_Word((P_Byte(g_4716) + $CC)))^, (P_Word((P_Byte(g_4716) + $CE)))^, P_Byte(g_4716), Slice16(g_4716, 2)); { 7F00:044F }
    end; { routine anchor; statement location unresolved } { 7F00:004A }
  local_4 := (local_4 + 1); { 7F00:0454 }
  uVar5 := Word((LongWord(g_4716) shr $10)); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar7 := ((P_Word((P_Byte(g_4716) + $D4)))^ or (P_Word((P_Byte(g_4716) + $D6)))^); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar8 := 0; { routine anchor; statement location unresolved } { 7F00:004A }
  if (uVar7 <> 0) then { routine anchor; statement location unresolved } { 7F00:004A }
    begin { routine anchor; statement location unresolved } { 7F00:004A }
      uVar8 := Byte((uVar7 shr 8)); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar2 := Pack16(uVar8, 2); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar3 := Pack16(uVar8, local_4); { routine anchor; statement location unresolved } { 7F00:004A }
      uVar4 := Pack16(uVar8, $F); { routine anchor; statement location unresolved } { 7F00:004A }
      puVar11 := local_10f; { routine anchor; statement location unresolved } { 7F00:004A }
      uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:004A }
      PString(BP+65267, SS) := 'Armor'; { 7F00:047C }
      FUN_0709_0626(puVar11, uVar5, uVar4, uVar3, uVar2); { 7F00:0481 }
      uVar9 := $BA; { routine anchor; statement location unresolved } { 7F00:004A }
      FUN_00ba_0442(Pack16(UNKNOWN_extraout_AH_15, 1), (Word(UNKNOWN_extraout_AH_15) shl 8), Pack16(UNKNOWN_extraout_AH_15, local_4), Pack16(UNKNOWN_extraout_AH_15, 8), (P_Word((P_Byte(g_4716) + $D4)))^, (P_Word((P_Byte(g_4716) + $D6)))^, P_Byte(g_4716), Slice16(g_4716, 2)); { 7F00:04A9 }
      uVar8 := UNKNOWN_extraout_AH_16; { routine anchor; statement location unresolved } { 7F00:004A }
    end; { routine anchor; statement location unresolved } { 7F00:004A }
  local_4 := (local_4 + 1); { 7F00:04AE }
  uVar5 := Pack16(uVar8, 1); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar2 := Pack16(uVar8, local_4); { routine anchor; statement location unresolved } { 7F00:004A }
  uVar3 := Pack16(uVar8, $F); { routine anchor; statement location unresolved } { 7F00:004A }
  puVar11 := @(local_110); { routine anchor; statement location unresolved } { 7F00:004A }
  PString(BP+65266, SS) := 'Status'; { 7F00:04C6 }
  FUN_0709_0626(puVar11, SS, uVar3, uVar2, uVar5); { 7F00:04CB }
  FUN_0709_0626(((ShortInt(P_Byte(g_4716)[$10C]) * $D) + $1047), $C7C, Pack16(UNKNOWN_extraout_AH_17, 10), Pack16(UNKNOWN_extraout_AH_17, local_4), Pack16(UNKNOWN_extraout_AH_17, 8)); { 7F00:04F1 }
  if ((g_49F5 <> 0) and then (g_5376 = 3)) then { routine anchor; statement location unresolved } { 7F00:004A }
    begin { routine anchor; statement location unresolved } { 7F00:004A }
      ov28_04F9(); { 7F00:0504 }
    end; { routine anchor; statement location unresolved } { 7F00:004A }
  Exit; { 7F00:050C }
end; { routine anchor; statement location unresolved } { 7F00:004A }
```

### ov19:050D ov19_050D (conf L)

Params (stack slots): none.  
Locals: uVar4: Byte [compiler temporary; no proven BP slot]; uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; local_12d: array[0..255] of Byte [BP-$12B]; local_2d: array[0..40] of Byte [BP-$2B]; local_4: ShortInt [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: ov19_004A,ov19_0AB3.  
Callees: FUN_00ba_1073, FUN_03f1_0137, FUN_0709_0626, System.@StrAssign.

```pascal
procedure ov19_050D(); { 7F00:050D }
begin { routine anchor; statement location unresolved } { 7F00:050D }
  FUN_03f1_0137($E, $1A, 7, $C); { 7F00:0520 }
  local_3 := 7; { 7F00:0525 }
  local_4 := 6; { 7F00:0529 }
  while true do { routine anchor; statement location unresolved } { 7F00:050D }
    begin { routine anchor; statement location unresolved } { 7F00:050D }
      if ((P_Integer(((Integer(g_5D92) + (local_4 * 2)) + $88)))^ <> 0) then { routine anchor; statement location unresolved } { 7F00:050D }
        begin { routine anchor; statement location unresolved } { 7F00:050D }
          PString(local_2d, SS) := Copy(PString(((local_4 * $B) + $FFA), $C7C), 1, $28); { 7F00:0560 }
          uVar4 := Byte((($14 - Word(local_2d[0])) shr 8)); { routine anchor; statement location unresolved } { 7F00:050D }
          FUN_0709_0626(local_2d, SS, Pack16(uVar4, 10), Pack16(uVar4, local_3), ($14 - Word(local_2d[0]))); { 7F00:057E }
          uVar1 := Pack16(UNKNOWN_extraout_AH, $15); { routine anchor; statement location unresolved } { 7F00:050D }
          uVar2 := Pack16(UNKNOWN_extraout_AH, local_3); { routine anchor; statement location unresolved } { 7F00:050D }
          uVar3 := Pack16(UNKNOWN_extraout_AH, 10); { routine anchor; statement location unresolved } { 7F00:050D }
          puVar5 := local_12d; { routine anchor; statement location unresolved } { 7F00:050D }
          uVar6 := SS; { routine anchor; statement location unresolved } { 7F00:050D }
          FUN_00ba_1073((P_Word(((Integer(g_5D92) + (local_4 * 2)) + $88)))^); { 7F00:05A4 }
          FUN_0709_0626(puVar5, uVar6, uVar3, uVar2, uVar1); { 7F00:05A9 }
          local_3 := (local_3 + 1); { 7F00:05AE }
        end; { routine anchor; statement location unresolved } { 7F00:050D }
      if (local_4 = 0) then { routine anchor; statement location unresolved } { 7F00:050D }
        Break; { routine anchor; statement location unresolved } { 7F00:050D }
      local_4 := (local_4 + -(1)); { 7F00:052F }
    end; { routine anchor; statement location unresolved } { 7F00:050D }
  Exit; { 7F00:05BD }
end; { routine anchor; statement location unresolved } { 7F00:050D }
```

### ov19:0608 ShowCombatStatistics (conf H)

Params (stack slots): none.  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar8: Byte [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; local_236: array[0..255] of Byte [BP-$234]; local_136: array[0..237] of Byte [BP-$134]; local_48: array[0..2] of Byte [BP-$46]; local_45: array[0..2] of Byte [BP-$43]; local_42: array[0..2] of Byte [BP-$40]; local_3f: array[0..1] of Byte [BP-$3D]; local_3d: array[0..6] of Byte [BP-$3B]; local_36: array[0..3] of Byte [BP-$34]; local_32: array[0..40] of Byte [BP-$30]; local_9: Byte [BP-$7]; local_8: Byte [BP-$6]; local_7: Byte [BP-$5]; local_6: Integer [BP-$4]; uStack_4: Word [BP-$2].  
Callers: ov19_004A.  
Callees: FUN_00ba_08ef, FUN_00ba_0973, FUN_00ba_0bb8, FUN_00ba_1037, FUN_00ba_1073, FUN_00ba_2199, FUN_0709_0626, System.@StrAppend, System.@StrAssign, System.@StrCopy.

H: printed AC/HP/THAC0/damage/encumbrance/movement labels establish statistics display; numeric field offsets remain explicit.

```pascal
procedure ShowCombatStatistics(); { 7F00:0608 }
begin { routine anchor; statement location unresolved } { 7F00:0608 }
  local_6 := g_5D92; { 7F00:0616 }
  uStack_4 := g_5D94; { 7F00:0619 }
  FUN_00ba_0bb8(g_5D92, g_5D94); { 7F00:0622 }
  local_7 := $11; { 7F00:0627 }
  uVar5 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := Pack16(UNKNOWN_extraout_AH, $11); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar3 := Pack16(UNKNOWN_extraout_AH, $F); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_3d; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  PString(local_3d, SS) := 'AC    '; { 7F00:063F }
  FUN_0709_0626(puVar10, uVar7, uVar3, uVar2, uVar5); { 7F00:0644 }
  FUN_00ba_08ef(Pack16(UNKNOWN_extraout_AH_00, local_7), Pack16(UNKNOWN_extraout_AH_00, 4), local_6, uStack_4); { 7F00:0656 }
  uVar5 := Pack16(UNKNOWN_extraout_AH_01, 1); { routine anchor; statement location unresolved } { 7F00:0608 }
  iVar4 := (local_7 + 1); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := Pack16(ShortInt((Word(iVar4) shr 8)), $F); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_3d; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  PString(local_3d, SS) := 'HP    '; { 7F00:0672 }
  FUN_0709_0626(puVar10, uVar7, uVar2, iVar4, uVar5); { 7F00:0677 }
  FUN_00ba_0973(((local_7 + 1) and $FF00), (local_7 + 1), Pack16(UNKNOWN_extraout_AH_02, 4), local_6, uStack_4); { 7F00:068F }
  local_8 := 8; { 7F00:0694 }
  uVar5 := 9; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar9 := Word(local_7); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := $F; { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_3f; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  PString(local_3f, SS) := 'THAC0   '; { 7F00:06B0 }
  FUN_0709_0626(puVar10, uVar7, uVar2, uVar9, uVar5); { 7F00:06B5 }
  iVar4 := (local_8 + 7); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar8 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar5 := Pack16(uVar8, local_7); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := Pack16(uVar8, 10); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_136; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  FUN_00ba_1037(($3C - Word((P_Byte((local_6 + $110)))^))); { 7F00:06E2 }
  FUN_0709_0626(puVar10, uVar7, uVar2, uVar5, iVar4); { 7F00:06E7 }
  puVar10 := local_136; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH_03, (P_Byte((local_6 + $115)))^)); { 7F00:06FB }
  PString(local_3f, SS) := Copy(PString(local_3f, SS) + 'd', 1, 255); { 7F00:0705 }
  puVar11 := local_236; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH_04, (P_Byte((local_6 + $117)))^)); { 7F00:0719 }
  PString(local_3f, SS) := Copy(PString(local_3f, SS) + PString(puVar11, uVar7), 1, 255); { 7F00:071E }
  PString(local_32, SS) := Copy(PString(puVar10, uVar5), 1, $28); { 7F00:072C }
  uVar8 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 7F00:0608 }
  if (0 < (P_ShortInt((local_6 + $119)))^) then { routine anchor; statement location unresolved } { 7F00:0608 }
    begin { routine anchor; statement location unresolved } { 7F00:0608 }
      puVar10 := local_136; { routine anchor; statement location unresolved } { 7F00:0608 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
      PString(local_32, SS) := PString(local_32, SS); { 7F00:0747 }
      PString(local_32, SS) := Copy(PString(local_32, SS) + '+', 1, 255); { 7F00:0751 }
      puVar11 := local_236; { routine anchor; statement location unresolved } { 7F00:0608 }
      uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
      FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH_06, (P_Byte((local_6 + $119)))^)); { 7F00:0765 }
      PString(local_32, SS) := Copy(PString(local_32, SS) + PString(puVar11, uVar7), 1, 255); { 7F00:076A }
      PString(local_32, SS) := Copy(PString(puVar10, uVar5), 1, $28); { 7F00:0778 }
      uVar8 := UNKNOWN_extraout_AH_07; { routine anchor; statement location unresolved } { 7F00:0608 }
    end; { routine anchor; statement location unresolved } { 7F00:0608 }
  if ((P_ShortInt((local_6 + $119)))^ < 0) then { routine anchor; statement location unresolved } { 7F00:0608 }
    begin { routine anchor; statement location unresolved } { 7F00:0608 }
      puVar10 := local_136; { routine anchor; statement location unresolved } { 7F00:0608 }
      uVar5 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
      PString(local_32, SS) := PString(local_32, SS); { 7F00:0793 }
      PString(local_32, SS) := Copy(PString(local_32, SS) + '-', 1, 255); { 7F00:079D }
      puVar11 := local_236; { routine anchor; statement location unresolved } { 7F00:0608 }
      uVar9 := (Integer((P_ShortInt((local_6 + $119)))^) shr $F); { routine anchor; statement location unresolved } { 7F00:0608 }
      uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
      FUN_00ba_1037(((Integer((P_ShortInt((local_6 + $119)))^) xor uVar9) - uVar9)); { 7F00:07B7 }
      PString(local_32, SS) := Copy(PString(local_32, SS) + PString(puVar11, uVar7), 1, 255); { 7F00:07BC }
      PString(local_32, SS) := Copy(PString(puVar10, uVar5), 1, $28); { 7F00:07CA }
      uVar8 := UNKNOWN_extraout_AH_08; { routine anchor; statement location unresolved } { 7F00:0608 }
    end; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar5 := Pack16(uVar8, local_8); { routine anchor; statement location unresolved } { 7F00:0608 }
  iVar4 := (local_7 + 1); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := Pack16(ShortInt((Word(iVar4) shr 8)), $F); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_45; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  PString(local_45, SS) := 'Damage        '; { 7F00:07E7 }
  FUN_0709_0626(puVar10, uVar7, uVar2, iVar4, uVar5); { 7F00:07EC }
  FUN_0709_0626(local_32, SS, Pack16(ShortInt(((local_7 + 1) shr 8)), 10), (local_7 + 1), (local_8 + 7)); { 7F00:0809 }
  local_8 := $16; { 7F00:080E }
  uVar5 := Pack16(UNKNOWN_extraout_AH_09, $16); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := Pack16(UNKNOWN_extraout_AH_09, local_7); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar3 := Pack16(UNKNOWN_extraout_AH_09, $F); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_48; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  PString(local_48, SS) := 'Encumbrance      '; { 7F00:0827 }
  FUN_0709_0626(puVar10, uVar7, uVar3, uVar2, uVar5); { 7F00:082C }
  iVar4 := (local_8 + $C); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar8 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar5 := Pack16(uVar8, local_7); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar2 := Pack16(uVar8, 10); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_136; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  FUN_00ba_1073((P_Word((local_6 + $102)))^); { 7F00:084F }
  FUN_0709_0626(puVar10, uVar7, uVar2, uVar5, iVar4); { 7F00:0854 }
  local_9 := (P_Byte((local_6 + $11C)))^; { 7F00:0861 }
  cVar1 := FUN_00ba_2199(local_36, SS, Pack16(UNKNOWN_extraout_AH_10, $2A), local_6, uStack_4); { 7F00:0872 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 7F00:0608 }
    begin { routine anchor; statement location unresolved } { 7F00:0608 }
      local_9 := (local_9 shl 1); { 7F00:0882 }
    end; { routine anchor; statement location unresolved } { 7F00:0608 }
  cVar1 := FUN_00ba_2199(local_36, SS, $27, local_6, uStack_4); { 7F00:0893 }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 7F00:0608 }
    begin { routine anchor; statement location unresolved } { 7F00:0608 }
      local_9 := (local_9 shr 1); { 7F00:08A3 }
    end; { routine anchor; statement location unresolved } { 7F00:0608 }
  iVar4 := (local_8 + 3); { routine anchor; statement location unresolved } { 7F00:0608 }
  iVar6 := (local_7 + 1); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar5 := Pack16(ShortInt((Word(iVar6) shr 8)), $F); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_42; { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:0608 }
  PString(local_42, SS) := 'Movement   '; { 7F00:08C3 }
  FUN_0709_0626(puVar10, uVar7, uVar5, iVar6, iVar4); { 7F00:08C8 }
  iVar4 := (local_8 + $C); { routine anchor; statement location unresolved } { 7F00:0608 }
  iVar6 := (local_7 + 1); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar8 := Byte((Word(iVar6) shr 8)); { routine anchor; statement location unresolved } { 7F00:0608 }
  uVar7 := Pack16(uVar8, 10); { routine anchor; statement location unresolved } { 7F00:0608 }
  puVar10 := local_136; { routine anchor; statement location unresolved } { 7F00:0608 }
  FUN_00ba_1037(Pack16(uVar8, local_9)); { 7F00:08EA }
  FUN_0709_0626(puVar10, SS, uVar7, iVar6, iVar4); { 7F00:08EF }
  Exit; { 7F00:08F7 }
end; { routine anchor; statement location unresolved } { 7F00:0608 }
```

### ov19:0901 ov19_0901 (conf L)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: ShortInt [BP+$08].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; puVar7: P_Byte [compiler temporary; no proven BP slot]; local_12d: array[0..255] of Byte [BP-$12B]; local_2d: Byte [BP-$2B]; local_2c: ShortInt [BP-$2A]; local_2b: array[0..40] of Byte [BP-$29]; uVar5: Byte [compiler temporary; no proven BP slot].  
Callers: ov19_004A.  
Callees: FUN_00ba_1037, FUN_03f1_0137, FUN_0709_0626, System.@StrAppend, System.@StrAssign, System.@StrCopy.

```pascal
procedure ov19_0901(param_1: ShortInt; param_2: ShortInt); { 7F00:0901 }
begin { routine anchor; statement location unresolved } { 7F00:0901 }
  if (param_1 = 0) then { routine anchor; statement location unresolved } { 7F00:0901 }
    begin { routine anchor; statement location unresolved } { 7F00:0901 }
      local_2d := 10; { 7F00:090E }
    end; { routine anchor; statement location unresolved } { 7F00:0901 }
  else { routine anchor; statement location unresolved } { 7F00:0901 }
    begin { routine anchor; statement location unresolved } { 7F00:0901 }
      local_2d := $D; { 7F00:0914 }
    end; { routine anchor; statement location unresolved } { 7F00:0901 }
  local_2c := 5; { 7F00:0918 }
  FUN_03f1_0137((param_2 + 7), Pack16(ShortInt((Word((param_2 + 7)) shr 8)), $B), (param_2 + 7), 5); { 7F00:0933 }
  uVar6 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 7F00:0901 }
  if ((P_Byte(((Integer(g_5D92) + Integer(param_2)) + $10)))^ < 10) then { routine anchor; statement location unresolved } { 7F00:0901 }
    begin { routine anchor; statement location unresolved } { 7F00:0901 }
      local_2c := (local_2c + 1); { 7F00:0949 }
    end; { routine anchor; statement location unresolved } { 7F00:0901 }
  uVar1 := Pack16((param_2 shr 7), local_2c); { routine anchor; statement location unresolved } { 7F00:0901 }
  iVar2 := (param_2 + 7); { routine anchor; statement location unresolved } { 7F00:0901 }
  uVar3 := Pack16(ShortInt((Word(iVar2) shr 8)), local_2d); { routine anchor; statement location unresolved } { 7F00:0901 }
  puVar7 := local_12d; { routine anchor; statement location unresolved } { 7F00:0901 }
  uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0901 }
  FUN_00ba_1037(Pack16((param_2 shr 7), (P_Byte(((Integer(g_5D92) + Integer(param_2)) + $10)))^)); { 7F00:0971 }
  FUN_0709_0626(puVar7, uVar4, uVar3, iVar2, uVar1); { 7F00:0976 }
  if (param_2 = 0) then { routine anchor; statement location unresolved } { 7F00:0901 }
    begin { routine anchor; statement location unresolved } { 7F00:0901 }
      uVar6 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 7F00:0901 }
      iVar2 := Integer(g_5D92); { routine anchor; statement location unresolved } { 7F00:0901 }
      if (((P_ShortInt((iVar2 + $10)))^ = 18) and then ((P_ShortInt((iVar2 + $16)))^ <> 0)) then { routine anchor; statement location unresolved } { 7F00:0901 }
        begin { routine anchor; statement location unresolved } { 7F00:0901 }
          puVar7 := local_12d; { routine anchor; statement location unresolved } { 7F00:0901 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0901 }
          FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH, (P_Byte((iVar2 + $16)))^)); { 7F00:09AF }
          PString(local_2b, SS) := Copy(PString(puVar7, uVar4), 1, $28); { 7F00:09BD }
          uVar5 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 7F00:0901 }
          if ((P_Byte((Integer(g_5D92) + $16)))^ < 10) then { routine anchor; statement location unresolved } { 7F00:0901 }
            begin { routine anchor; statement location unresolved } { 7F00:0901 }
              puVar7 := local_12d; { routine anchor; statement location unresolved } { 7F00:0901 }
              uVar6 := SS; { routine anchor; statement location unresolved } { 7F00:0901 }
              PString(BP+65237, SS) := '0'; { 7F00:09D8 }
              PString(BP+65237, SS) := Copy(PString(BP+65237, SS) + PString(local_2b, SS), 1, 255); { 7F00:09E2 }
              PString(local_2b, SS) := Copy(PString(puVar7, uVar6), 1, $28); { 7F00:09F0 }
              uVar5 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 7F00:0901 }
            end; { routine anchor; statement location unresolved } { 7F00:0901 }
          if ((P_ShortInt((Integer(g_5D92) + $16)))^ = 100) then { routine anchor; statement location unresolved } { 7F00:0901 }
            begin { routine anchor; statement location unresolved } { 7F00:0901 }
              PString(local_2b, SS) := Copy('00', 1, $28); { 7F00:0A0E }
              uVar5 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 7F00:0901 }
            end; { routine anchor; statement location unresolved } { 7F00:0901 }
          uVar4 := Pack16(uVar5, 7); { routine anchor; statement location unresolved } { 7F00:0901 }
          uVar1 := Pack16(uVar5, 7); { routine anchor; statement location unresolved } { 7F00:0901 }
          uVar3 := Pack16(uVar5, local_2d); { routine anchor; statement location unresolved } { 7F00:0901 }
          puVar7 := local_12d; { routine anchor; statement location unresolved } { 7F00:0901 }
          uVar6 := SS; { routine anchor; statement location unresolved } { 7F00:0901 }
          PString(BP+65237, SS) := '('; { 7F00:0A28 }
          PString(BP+65237, SS) := Copy(PString(BP+65237, SS) + PString(local_2b, SS), 1, 255); { 7F00:0A32 }
          PString(BP+65237, SS) := Copy(PString(BP+65237, SS) + ')', 1, 255); { 7F00:0A3C }
          FUN_0709_0626(puVar7, uVar6, uVar3, uVar1, uVar4); { 7F00:0A41 }
        end; { routine anchor; statement location unresolved } { 7F00:0901 }
    end; { routine anchor; statement location unresolved } { 7F00:0901 }
  Exit; { 7F00:0A49 }
end; { routine anchor; statement location unresolved } { 7F00:0901 }
```

### ov19:0AB3 CharacterViewMenu (conf M)

Params (stack slots): param_1: P_ShortInt [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; local_134: array[0..249] of Byte [BP-$132]; local_3a: array[0..5] of Byte [BP-$38]; local_34: Word [BP-$32]; local_32: ShortInt [BP-$30]; local_31: Byte [BP-$2F]; local_30: Byte [BP-$2E]; local_2f: ShortInt [BP-$2D]; local_2e: ShortInt [BP-$2C]; local_2d: array[0..41] of Byte [BP-$2B]; local_3: ShortInt [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_27d9, FUN_7000_1156, FUN_7000_14a7, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ShowCharacterSummary, ov19_050D, InventoryMenu, ov25_03BD, ov31_00E3, ov31_0105.

Unmatched call-location evidence: func_0x0007199c; these keep routine anchors.

```pascal
procedure CharacterViewMenu(param_1: P_ShortInt); { 7F00:0AB3 }
begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
  uVar4 := $7F00; { routine anchor; statement location unresolved } { 7F00:0AB3 }
  uVar5 := (g_49F3 = 5); { routine anchor; statement location unresolved } { 7F00:0AB3 }
  if Boolean(uVar5) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
    begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
      uVar4 := $3E0; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      ov31_0105(); { 7F00:0AC1 }
    end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
  local_3 := 32; { 7F00:0AC6 }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 7F00:0AB3 }
  g_471A := g_5D92; { 7F00:0AD8 }
  g_471C := g_5D94; { 7F00:0ADB }
  ShowCharacterSummary(); { 7F00:0AE0 }
  uVar2 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 7F00:0AB3 }
  while Sequence(Flags.ZF := not (LoByte(Pack16(uVar2, local_3)) in [0, 69]); (Boolean(uVar5) and then ((param_1)^ = 0))) do { 7F00:0AEC }
    begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
      local_2d[0] := 0; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      local_2f := 0; { 7F00:0B06 }
      local_2e := 0; { 7F00:0B0A }
      local_31 := 0; { 7F00:0B0E }
      while true do { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          uVar4 := Word((LongWord(g_4716) shr $10)); { routine anchor; statement location unresolved } { 7F00:0AB3 }
          iVar3 := Integer(g_4716); { routine anchor; statement location unresolved } { 7F00:0AB3 }
          if ((P_ShortInt(((iVar3 + Word(local_31)) + $17)))^ <> 0) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
            begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
              local_2f := 1; { 7F00:0B29 }
            end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          if (local_31 = $14) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
            Break; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          local_31 := (local_31 + 1); { 7F00:0B14 }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      local_32 := 0; { 7F00:0B33 }
      while true do { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          if ((P_Integer(((iVar3 + (local_32 * 2)) + $88)))^ <> 0) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
            begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
              local_2e := 1; { 7F00:0B50 }
            end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          if (local_32 = 6) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
            Break; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          local_32 := (local_32 + 1); { 7F00:0B39 }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      if (((P_Integer((iVar3 + 200)))^ <> 0) or else ((P_Integer((iVar3 + $CA)))^ <> 0)) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          puVar6 := local_134; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          PString(local_2d, SS) := PString(local_2d, SS); { 7F00:0B75 }
          PString(local_2d, SS) := Copy(PString(local_2d, SS) + 'Items ', 1, 255); { 7F00:0B7F }
          PString(local_2d, SS) := Copy(PString(puVar6, uVar4), 1, $28); { 7F00:0B8D }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      if (local_2f <> 0) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          puVar6 := local_134; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          PString(local_2d, SS) := PString(local_2d, SS); { 7F00:0BA3 }
          PString(local_2d, SS) := Copy(PString(local_2d, SS) + 'Spells ', 1, 255); { 7F00:0BAD }
          PString(local_2d, SS) := Copy(PString(puVar6, uVar4), 1, $28); { 7F00:0BBB }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      uVar4 := Word((LongWord(g_4716) shr $10)); { routine anchor; statement location unresolved } { 7F00:0AB3 }
      iVar3 := Integer(g_4716); { routine anchor; statement location unresolved } { 7F00:0AB3 }
      if (((((P_Byte((iVar3 + $84)))^ < $80) or else ((P_ShortInt((iVar3 + $10D)))^ = 0)) or else ((P_ShortInt((iVar3 + $10C)))^ = 1)) and then ((local_2e <> 0) and then (g_49F3 <> 5))) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          puVar6 := local_134; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          PString(local_2d, SS) := PString(local_2d, SS); { 7F00:0BFC }
          PString(local_2d, SS) := Copy(PString(local_2d, SS) + 'Trade ', 1, 255); { 7F00:0C06 }
          PString(local_2d, SS) := Copy(PString(puVar6, uVar4), 1, $28); { 7F00:0C14 }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      if (local_2e <> 0) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          puVar6 := local_134; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          PString(local_2d, SS) := PString(local_2d, SS); { 7F00:0C2A }
          PString(local_2d, SS) := Copy(PString(local_2d, SS) + 'Drop ', 1, 255); { 7F00:0C34 }
          PString(local_2d, SS) := Copy(PString(puVar6, uVar4), 1, $28); { 7F00:0C42 }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      puVar6 := local_134; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      uVar4 := SS; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      PString(local_2d, SS) := PString(local_2d, SS); { 7F00:0C52 }
      PString(local_2d, SS) := Copy(PString(local_2d, SS) + 'Exit', 1, 255); { 7F00:0C5C }
      PString(local_2d, SS) := Copy(PString(puVar6, uVar4), 1, $28); { 7F00:0C6A }
      puVar6 := local_3a; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      uVar1 := SS; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      PString(local_3a, SS) := 'View:'; { 7F00:0C79 }
      uVar4 := $3C5; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      uVar1 := ov25_03BD(@(local_30), SS, (Word(UNKNOWN_extraout_AH_00) shl 8), (Word(UNKNOWN_extraout_AH_00) shl 8), Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), local_2d, SS, puVar6, uVar1); { 7F00:0C97 }
      local_3 := ShortInt(uVar1); { 7F00:0C9C }
      local_34 := $FFFF; { 7F00:0C9F }
      uVar2 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 7F00:0AB3 }
      if (local_3 = 73) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          InventoryMenu(P_ShortInt(param_1), Integer((LongWord(param_1) shr $10))); { 7F00:0CB1 }
          uVar2 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 7F00:0AB3 }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      else { routine anchor; statement location unresolved } { 7F00:0AB3 }
        if (local_3 = 83) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
          begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
            func_0x0007199c($3C5, @(local_2f)); { routine anchor; statement location unresolved } { 7F00:0AB3 }
            uVar2 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 7F00:0AB3 }
            local_31 := UNKNOWN_extraout_AL; { 7F00:0CCE }
          end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
        else { routine anchor; statement location unresolved } { 7F00:0AB3 }
          if (local_3 = 84) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
            begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
              FUN_7000_1156($3C5); { 7F00:0CD8 }
              uVar2 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 7F00:0AB3 }
            end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          else { routine anchor; statement location unresolved } { 7F00:0AB3 }
            if (local_3 = 68) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
              begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
                FUN_7000_14a7(); { 7F00:0CE2 }
                ov19_050D(); { 7F00:0CE6 }
                uVar2 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 7F00:0AB3 }
              end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
      uVar5 := ((param_1)^ = 0); { routine anchor; statement location unresolved } { 7F00:0AB3 }
      if Boolean(uVar5) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
        begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
          uVar4 := $AF8; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          Flags.ZF := not (LoByte(Pack16(uVar2, local_3)) in [73, 83, 84]); { 7F00:0CFB }
          uVar2 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 7F00:0AB3 }
          if not (Boolean(uVar5)) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
            begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
              ShowCharacterSummary(); { 7F00:0D03 }
              uVar2 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 7F00:0AB3 }
            end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
        end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
    end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
  if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 7F00:0AB3 }
    begin { routine anchor; statement location unresolved } { 7F00:0AB3 }
      ov31_00E3(); { 7F00:0D10 }
    end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
  FUN_00ba_27d9(); { 7F00:0D15 }
  Exit; { 7F00:0D1D }
end; { routine anchor; statement location unresolved } { 7F00:0AB3 }
```

### ov19:0D70 CanReleaseItem (conf M)

Params: item: far pointer [BP+6,+8].  
Locals: result: Boolean [BP-1]; three temporary strings within BP-28..-1.  
Callers: see evidence below.
Callees (export; corrections below): see body; Pascal source order shown for explicitly reconstructed calls.

Additional real routine omitted by the export. Raw prologue at 0D70, RETF 4 at 0E60. All three item bytes +3C..+3E use unsigned >7F tests. Name M from gating inventory trade/drop/sell and unreadied/scribe-warning strings. Overlay 22 callback is entry 6 (stub 0096:003E); exact Pascal ABI still follows the shared slot convention.

```pascal
function CanReleaseItem(item: FarPtr): Boolean; { 7F00:0D70 }
begin { 7F00:0D70 }
  CanReleaseItem := False; { 7F00:0D76 }
  if ByteAt(item,$34) <> 0 then { 7F00:0D7D }
    FUN_00ba_1693('Must be unreadied') { 7F00:0D93 }
  else if stub_ov22_e6(item) = 0 then { 7F00:0DA1 }
    CanReleaseItem := True { 7F00:0DAA }
  else if (ByteAt(item,$3C) > $7F) or else (ByteAt(item,$3D) > $7F) or else (ByteAt(item,$3E) > $7F) then begin { 7F00:0DB4 }
    FUN_00ba_1816(0,21,1,g_5D92,g_5D94); { 7F00:0DE0 }
    g_5E24 := Byte(ByteAt(FarPtr(g_5D94,g_5D92),0) + 2); { 7F00:0DF0 }
    g_5E25 := 21; { 7F00:0DF3 }
    UNKNOWN_PrintBox(' was going to scribe from that scroll',1,21,38,22); { 7F00:0E19 }
    if ov25_10D1(UNKNOWN_ConfirmABI('is it Okay to lose it? ',13,10,15)) = 'Y' then { 7F00:0E36 }
      CanReleaseItem := True; { 7F00:0E3F }
  end else CanReleaseItem := True; { 7F00:0E45 }
  FUN_03f1_0137(22,38,21,1); { 7F00:0E55 }
end; { 7F00:0E60 }
```

### ov19:0EF8 InventoryMenu (conf M)

Params: var exitFlag: Byte via far pointer [BP+6,+8].  
Locals: actor: far pointer [BP-3F,-3D]; item: far pointer [BP-35,-33]; top/index [BP-37]; menu: string[40] [BP-2A]; refresh flags [BP-2D,-2C]; command [BP-1]; old count [BP-40].  
Callers: ov19_0AB3.  
Callees (export; corrections below): FUN_00ba_0442, FUN_00ba_0bb8, FUN_00ba_1509, FUN_00ba_1693, FUN_00ba_1816, FUN_03f1_0000, FUN_03f1_0137, FUN_03f1_02e8, FUN_0709_0626, FUN_0709_0768, FUN_0709_0cab, TradeItem, HalveItem, FUN_7f00_189d, SellItem, IdentifyItem, FUN_8e00_1d70, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, ReadyItem, UseItem, ov22_323D, ov25_0D9A, ov25_10D1.

Reconstructed from raw **current-CS near displacements**, not the contaminated C body. At 1339 E8 34 FA and 1365 E8 08 FA both target **7F00:0D70**, not FUN_8e00_1d70. At 148B E9 A2 FA loops to 0F30; exit is 148E..1493 (raw 89 EC 5D CA 04 00), not the exported foreign 8E00:1F30. UNKNOWN_* calls explicitly retain unfinished UI argument recovery. Case keys R/U/T/D/H/J/S/I and E exit are byte-proved. Continuation lines in multi-line predicates share the following annotated condition address.

```pascal
procedure InventoryMenu(var exitFlag: Byte); { 7F00:0EF8 }
begin { 7F00:0EF8 }
  actor := FarPtr(g_5D94,g_5D92); { 7F00:0F06 }
  command := ' '; { 7F00:0F0C }
  item := FarPtrAt(actor,$C8); { 7F00:0F1D }
  top := 0; { 7F00:0F25 }
  listChanged := True; { 7F00:0F28 }
  repaint := True; { 7F00:0F2C }
  while not (command in [#0,'E']) and then (exitFlag = 0) and then (ByteAt(actor,$C7) > 0) do begin { 7F00:0F30 }
    oldCount := ByteAt(actor,$C7); { 7F00:0F65 }
    if FarPtrAt(actor,$C8) = nil then Break; { 7F00:0F70 }
    menu := 'Ready'; { 7F00:0F88 }
    if (ByteAt(actor,$10D) <> 0) and then (WordAt(g_49D2,$1CA) = 0) and then ((g_49F3 in [2,3,4]) or else ((g_49F3 = 5) and then (ByteAt(FarPtrAt(actor,$108),2) <> 0))) then { 7F00:0F8D }
      menu := Copy(menu + ' Use',1,40); { 7F00:0FF2 }
    if ((ByteAt(actor,$84) < $80) or else (ByteAt(actor,$10D) = 0) or else (ByteAt(actor,$10C) = 1)) and then (g_49F3 <> 5) then { 7F00:0FF7 }
      menu := Copy(menu + ' Trade',1,40); { 7F00:1042 }
    menu := Copy(menu + ' Drop',1,40); { 7F00:106A }
    if ByteAt(actor,$C7) < 16 then { 7F00:1072 }
      menu := Copy(menu + ' Halve',1,40); { 7F00:109D }
    menu := Copy(menu + ' Join',1,40); { 7F00:10C5 }
    if ((ByteAt(actor,$84) < $80) or else (ByteAt(actor,$10D) = 0) or else (ByteAt(actor,$10C) = 1)) and then (g_49F3 = 1) then { 7F00:10CA }
      menu := Copy(menu + ' Sell',1,40); { 7F00:1115 }
    if g_49F3 = 1 then { 7F00:111A }
      menu := Copy(menu + ' Id',1,40); { 7F00:1144 }
    scan := FarPtrAt(actor,$C8); { 7F00:1156 }
    while scan <> nil do begin { 7F00:115C }
      FUN_00ba_0442(0,0,1,0,Offset(scan),Segment(scan),Offset(actor),Segment(actor)); { 7F00:117C }
      scan := FarPtrAt(scan,$2A); { 7F00:118C }
    end; { 7F00:1192 }
    if repaint or else (g_6821 <> 0) then begin { 7F00:1194 }
      UNKNOWN_RefreshInventoryScreen(actor,'Items','Ready Item'); { 7F00:11A4 }
      listChanged := True; { 7F00:123A }
      repaint := False; { 7F00:123E }
      g_6821 := 0; { 7F00:1242 }
    end; { 7F00:1247 }
    command := ov25_0D9A(UNKNOWN_InventoryListABI(menu,actor,top,item,listChanged)); { 7F00:128F }
    if item <> nil then case command of { 7F00:1297 }
      'R': ReadyItem(item); { 7F00:12B0 }
      'U': begin { 7F00:12B6 }
        if ByteAt(item,$34) = 0 then { 7F00:12BD }
          UNKNOWN_ShowMessage('Must be Readied') { 7F00:12CE }
        else begin { 7F00:12DE }
          UseItem(UNKNOWN_UseItemSlots(exitFlag,item)); { 7F00:130D }
          if g_49F3 <> 5 then exitFlag := 0; { 7F00:1310 }
          if exitFlag = 0 then repaint := True; { 7F00:131E }
        end; { 7F00:132B }
      end; { 7F00:132B }
      'T': begin { 7F00:132E }
        if CanReleaseItem(item) then TradeItem(item) else command := ' '; { 7F00:1339 }
        repaint := True; { 7F00:1350 }
      end; { 7F00:1354 }
      'D': begin { 7F00:1357 }
        if CanReleaseItem(item) then begin { 7F00:1365 }
          FUN_00ba_0442(0,0,0,0,Offset(item),Segment(item),Offset(actor),Segment(actor)); { 7F00:1387 }
          UNKNOWN_PrintBox('Your ' + PStringAt(item) + 'will be gone forever',1,21,38,22); { 7F00:13C2 }
          if ov25_10D1(UNKNOWN_ConfirmABI('Drop It? ',13,10,15)) = 'Y' then begin { 7F00:13DF }
            FUN_00ba_1509(Offset(item),Segment(item),g_5D92,g_5D94); { 7F00:13F6 }
            listChanged := True; { 7F00:13FB }
          end; { 7F00:13FF }
          FUN_03f1_0137(22,38,21,1); { 7F00:140B }
        end else command := ' '; { 7F00:1412 }
      end; { 7F00:1416 }
      'H': HalveItem(item); { 7F00:1423 }
      'J': FUN_7f00_189d(item); { 7F00:1433 }
      'S': if CanReleaseItem(item) then SellItem(item) else command := ' '; { 7F00:1443 }
      'I': IdentifyItem(UNKNOWN_IdentifySlots(item,listChanged)); { 7F00:146C }
    end; { 7F00:146F }
    FUN_00ba_0bb8(Offset(actor),Segment(actor)); { 7F00:1475 }
    if ByteAt(actor,$C7) <> oldCount then listChanged := True; { 7F00:1482 }
  end; { 7F00:148B }
end; { 7F00:1491 }
```

### ov19:14D0 ReadyItem (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; puVar9: P_Byte [compiler temporary; no proven BP slot]; local_109: array[0..234] of Byte [BP-$107]; local_1e: array[0..8] of Byte [BP-$1C]; local_15: array[0..11] of Byte [BP-$13]; local_9: Integer [BP-$7]; uStack_7: Word [BP-$5]; local_5: Byte [BP-$3]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_0442, FUN_00ba_1693, System.@StrAppend, System.@StrCopy, DispatchEffect.

```pascal
procedure ReadyItem(param_1: LongWord); { 7F00:14D0 }
begin { routine anchor; statement location unresolved } { 7F00:14D0 }
  uVar3 := g_5D94; { routine anchor; statement location unresolved } { 7F00:14D0 }
  iVar7 := g_5D92; { routine anchor; statement location unresolved } { 7F00:14D0 }
  uVar8 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 7F00:14D0 }
  iVar5 := Integer(param_1); { routine anchor; statement location unresolved } { 7F00:14D0 }
  local_3 := ($7F < (P_Byte((iVar5 + $3E)))^); { 7F00:14E4 }
  local_9 := g_5D92; { 7F00:14EE }
  local_9 := g_5D92; { routine anchor; statement location unresolved } { 7F00:14D0 }
  uStack_7 := g_5D94; { 7F00:14F1 }
  uVar4 := Byte((Word(g_5D92) shr 8)); { routine anchor; statement location unresolved } { 7F00:14D0 }
  if ((P_ShortInt((iVar5 + $34)))^ = 0) then { routine anchor; statement location unresolved } { 7F00:14D0 }
    begin { routine anchor; statement location unresolved } { 7F00:14D0 }
      local_4 := 0; { 7F00:154B }
      if (2 < (Word((P_Byte((g_5D92 + $100)))^) + Word((P_Byte(((Word((P_Byte((iVar5 + $2E)))^) * $10) + $5583)))^))) then { routine anchor; statement location unresolved } { 7F00:14D0 }
        begin { routine anchor; statement location unresolved } { 7F00:14D0 }
          local_4 := 3; { 7F00:1577 }
        end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      local_5 := (P_Byte(((Word((P_Byte((iVar5 + $2E)))^) * $10) + $5582)))^; { 7F00:158E }
      if (local_5 < 9) then { routine anchor; statement location unresolved } { 7F00:14D0 }
        begin { routine anchor; statement location unresolved } { 7F00:14D0 }
          iVar6 := (g_5D92 + (ShortInt(local_5) * 4)); { routine anchor; statement location unresolved } { 7F00:14D0 }
          if (((P_Integer((iVar6 + $CC)))^ <> 0) or else ((P_Integer((iVar6 + $CE)))^ <> 0)) then { routine anchor; statement location unresolved } { 7F00:14D0 }
            begin { routine anchor; statement location unresolved } { 7F00:14D0 }
              local_4 := 2; { 7F00:15B5 }
            end; { routine anchor; statement location unresolved } { 7F00:14D0 }
        end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      else { routine anchor; statement location unresolved } { 7F00:14D0 }
        if ((local_5 = 9) and then (((P_Integer((g_5D92 + $F4)))^ <> 0) or else ((P_Integer((g_5D92 + $F6)))^ <> 0))) then { routine anchor; statement location unresolved } { 7F00:14D0 }
          begin { routine anchor; statement location unresolved } { 7F00:14D0 }
            local_4 := 2; { 7F00:15CE }
          end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      if (((P_ShortInt((iVar5 + $2E)))^ = 73) and then (((P_Integer((g_5D92 + $F8)))^ <> 0) or else ((P_Integer((g_5D92 + $FA)))^ <> 0))) then { routine anchor; statement location unresolved } { 7F00:14D0 }
        begin { routine anchor; statement location unresolved } { 7F00:14D0 }
          local_4 := 2; { 7F00:15EB }
          local_5 := $B; { 7F00:15EF }
        end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      if (((P_ShortInt((iVar5 + $2E)))^ = 28) and then (((P_Integer((g_5D92 + $FC)))^ <> 0) or else ((P_Integer((g_5D92 + $FE)))^ <> 0))) then { routine anchor; statement location unresolved } { 7F00:14D0 }
        begin { routine anchor; statement location unresolved } { 7F00:14D0 }
          local_4 := 2; { 7F00:160C }
          local_5 := $C; { 7F00:1610 }
        end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      if (((P_Byte(((Word((P_Byte((iVar5 + $2E)))^) * $10) + $558F)))^ and (P_Byte((g_5D92 + $B0)))^) = 0) then { routine anchor; statement location unresolved } { 7F00:14D0 }
        begin { routine anchor; statement location unresolved } { 7F00:14D0 }
          local_4 := 1; { 7F00:1633 }
        end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      if (local_4 = 0) then { routine anchor; statement location unresolved } { 7F00:14D0 }
        begin { routine anchor; statement location unresolved } { 7F00:14D0 }
          (P_Byte((iVar5 + $34)))^ := 1; { routine anchor; statement location unresolved } { 7F00:14D0 }
          if Boolean(local_3) then { routine anchor; statement location unresolved } { 7F00:14D0 }
            begin { routine anchor; statement location unresolved } { 7F00:14D0 }
              DispatchEffect(0, iVar5, uVar8, iVar7, uVar3, (P_Byte((iVar5 + $3E)))^); { 7F00:1543 }
            end; { routine anchor; statement location unresolved } { 7F00:14D0 }
        end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      else { routine anchor; statement location unresolved } { 7F00:14D0 }
        if (local_4 = 1) then { routine anchor; statement location unresolved } { 7F00:14D0 }
          begin { routine anchor; statement location unresolved } { 7F00:14D0 }
            puVar9 := local_15; { routine anchor; statement location unresolved } { 7F00:14D0 }
            PString(local_15, SS) := 'Wrong Class'; { 7F00:1512 }
            FUN_00ba_1693(puVar9, SS); { 7F00:1517 }
          end; { routine anchor; statement location unresolved } { 7F00:14D0 }
        else { routine anchor; statement location unresolved } { 7F00:14D0 }
          if (local_4 = 2) then { routine anchor; statement location unresolved } { 7F00:14D0 }
            begin { routine anchor; statement location unresolved } { 7F00:14D0 }
              iVar7 := (g_5D92 + (ShortInt(local_5) * 4)); { routine anchor; statement location unresolved } { 7F00:14D0 }
              uVar2 := ((Integer(ShortInt(local_5)) and $3FFF) shr 6); { routine anchor; statement location unresolved } { 7F00:14D0 }
              FUN_00ba_0442((uVar2 shl 8), (uVar2 shl 8), (uVar2 shl 8), (uVar2 shl 8), (P_Word((iVar7 + $CC)))^, (P_Word((iVar7 + $CE)))^, g_5D92, g_5D94); { 7F00:16B3 }
              puVar9 := local_109; { routine anchor; statement location unresolved } { 7F00:14D0 }
              PString(local_15, SS) := 'already using '; { 7F00:1679 }
              uVar1 := (P_LongWord(((local_9 + (ShortInt(local_5) * 4)) + $CC)))^; { routine anchor; statement location unresolved } { 7F00:14D0 }
              PString(local_15, SS) := Copy(PString(local_15, SS) + PString(Integer(uVar1), Integer((LongWord(uVar1) shr $10))), 1, 255); { 7F00:16DC }
              FUN_00ba_1693(puVar9, SS); { 7F00:167E }
            end; { routine anchor; statement location unresolved } { 7F00:14D0 }
          else { routine anchor; statement location unresolved } { 7F00:14D0 }
            if ((local_4 = 3) and then ((g_49F3 <> 5) or else ((P_ShortInt((g_5D92 + $10F)))^ = 0))) then { routine anchor; statement location unresolved } { 7F00:14D0 }
              begin { routine anchor; statement location unresolved } { 7F00:14D0 }
                puVar9 := local_1e; { routine anchor; statement location unresolved } { 7F00:14D0 }
                PString(BP+65273, SS) := 'Your hands are full!'; { 7F00:16C3 }
                FUN_00ba_1693(puVar9, SS); { 7F00:16E1 }
              end; { routine anchor; statement location unresolved } { 7F00:14D0 }
    end; { routine anchor; statement location unresolved } { 7F00:14D0 }
  else { routine anchor; statement location unresolved } { 7F00:14D0 }
    if ((P_ShortInt((iVar5 + $36)))^ = 0) then { routine anchor; statement location unresolved } { 7F00:14D0 }
      begin { routine anchor; statement location unresolved } { 7F00:14D0 }
        (P_Byte((iVar5 + $34)))^ := 0; { routine anchor; statement location unresolved } { 7F00:14D0 }
        if Boolean(local_3) then { routine anchor; statement location unresolved } { 7F00:14D0 }
          begin { routine anchor; statement location unresolved } { 7F00:14D0 }
            DispatchEffect(Pack16(uVar4, 1), iVar5, uVar8, iVar7, uVar3, Pack16(uVar4, (P_Byte((iVar5 + $3E)))^)); { 7F00:1663 }
          end; { routine anchor; statement location unresolved } { 7F00:14D0 }
      end; { routine anchor; statement location unresolved } { 7F00:14D0 }
    else { routine anchor; statement location unresolved } { 7F00:14D0 }
      begin { routine anchor; statement location unresolved } { 7F00:14D0 }
        puVar9 := local_15; { routine anchor; statement location unresolved } { 7F00:14D0 }
        PString(local_1e, SS) := 'It''s Cursed'; { 7F00:1708 }
        FUN_00ba_1693(puVar9, SS); { 7F00:170D }
      end; { routine anchor; statement location unresolved } { 7F00:14D0 }
  Exit; { 7F00:1715 }
end; { routine anchor; statement location unresolved } { 7F00:14D0 }
```

### ov19:1734 TradeItem (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_17: array[0..5] of Byte [BP-$15]; local_11: array[0..10] of Byte [BP-$F]; local_6: Integer [BP-$4]; local_4: Integer [BP-$2].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_0bb8, FUN_00ba_1509, FUN_00ba_15f7, FUN_00ba_1693, FUN_00ba_27d9, FUN_00ba_2c48, System.@StrCopy, ov19_275B.

```pascal
procedure TradeItem(param_1: Word; param_2: Word); { 7F00:1734 }
begin { routine anchor; statement location unresolved } { 7F00:1734 }
  local_6 := g_471A; { 7F00:1741 }
  local_4 := g_471C; { 7F00:1744 }
  FUN_00ba_27d9(); { 7F00:1747 }
  puVar2 := local_17; { routine anchor; statement location unresolved } { 7F00:1734 }
  uVar3 := SS; { routine anchor; statement location unresolved } { 7F00:1734 }
  PString(local_17, SS) := 'Trade with Whom?'; { 7F00:1756 }
  FUN_00ba_2c48(@(local_6), SS, Pack16(UNKNOWN_extraout_AH, 1), puVar2, uVar3); { 7F00:1763 }
  if ((local_6 <> 0) or else (local_4 <> 0)) then { routine anchor; statement location unresolved } { 7F00:1734 }
    begin { routine anchor; statement location unresolved } { 7F00:1734 }
      g_471A := local_6; { 7F00:1776 }
      g_471C := local_4; { 7F00:1779 }
      cVar1 := ov19_275B(param_1, param_2, local_6, local_4); { 7F00:178A }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 7F00:1734 }
        begin { routine anchor; statement location unresolved } { 7F00:1734 }
          FUN_00ba_15f7(param_1, param_2, local_6, local_4); { 7F00:17B3 }
          FUN_00ba_1509(param_1, param_2, g_5D92, g_5D94); { 7F00:17C6 }
          FUN_00ba_0bb8(local_6, local_4); { 7F00:17D1 }
        end; { routine anchor; statement location unresolved } { 7F00:1734 }
      else { routine anchor; statement location unresolved } { 7F00:1734 }
        begin { routine anchor; statement location unresolved } { 7F00:1734 }
          puVar2 := local_11; { routine anchor; statement location unresolved } { 7F00:1734 }
          PString(local_11, SS) := 'Overloaded'; { 7F00:179B }
          FUN_00ba_1693(puVar2, SS); { 7F00:17A0 }
        end; { routine anchor; statement location unresolved } { 7F00:1734 }
    end; { routine anchor; statement location unresolved } { 7F00:1734 }
  Exit; { 7F00:17D9 }
end; { routine anchor; statement location unresolved } { 7F00:1734 }
```

### ov19:17ED HalveItem (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; local_19: array[0..16] of Byte [BP-$17]; local_8: ShortInt [BP-$6]; local_7: Byte [BP-$5]; local_6: LongWord [BP-$4].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_1693, System.@StrCopy, System.GetMem, System.Move.

```pascal
procedure HalveItem(param_1: LongWord); { 7F00:17ED }
begin { routine anchor; statement location unresolved } { 7F00:17ED }
  uVar3 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 7F00:17ED }
  iVar2 := Integer(param_1); { routine anchor; statement location unresolved } { 7F00:17ED }
  local_7 := ((P_Byte((iVar2 + $39)))^ shr 1); { 7F00:17FE }
  if (local_7 = 0) then { routine anchor; statement location unresolved } { 7F00:17ED }
    begin { routine anchor; statement location unresolved } { 7F00:17ED }
      puVar4 := local_19; { routine anchor; statement location unresolved } { 7F00:17ED }
      PString(local_19, SS) := 'Can''t halve that'; { 7F00:188D }
      FUN_00ba_1693(puVar4, SS); { 7F00:1892 }
    end; { routine anchor; statement location unresolved } { 7F00:17ED }
  else { routine anchor; statement location unresolved } { 7F00:17ED }
    begin { routine anchor; statement location unresolved } { 7F00:17ED }
      local_8 := ((P_ShortInt((iVar2 + $39)))^ - local_7); { 7F00:1819 }
      local_6 := Allocate($3F); { 7F00:1820 }
      Move(MemRef(iVar2,uVar3), MemRef(WordAtSS(BP-4),WordAtSS(BP-2)), $3F); { 7F00:1839 }
      (P_Byte((Integer(local_6) + $39)))^ := local_7; { routine anchor; statement location unresolved } { 7F00:17ED }
      (P_Byte((Integer(local_6) + $34)))^ := 0; { routine anchor; statement location unresolved } { 7F00:17ED }
      uVar1 := (P_Word((iVar2 + $2C)))^; { routine anchor; statement location unresolved } { 7F00:17ED }
      (P_Word((Integer(local_6) + $2A)))^ := (P_Word((iVar2 + $2A)))^; { routine anchor; statement location unresolved } { 7F00:17ED }
      (P_Word((Integer(local_6) + $2C)))^ := uVar1; { routine anchor; statement location unresolved } { 7F00:17ED }
      (P_ShortInt((iVar2 + $39)))^ := local_8; { routine anchor; statement location unresolved } { 7F00:17ED }
      (P_Integer((iVar2 + $2A)))^ := Integer(local_6); { routine anchor; statement location unresolved } { 7F00:17ED }
      (P_Word((iVar2 + $2C)))^ := Slice16(local_6, 2); { routine anchor; statement location unresolved } { 7F00:17ED }
    end; { routine anchor; statement location unresolved } { 7F00:17ED }
  Exit; { 7F00:189A }
end; { routine anchor; statement location unresolved } { 7F00:17ED }
```

### ov19:189D FUN_7f00_189d (conf L)

Params (stack slots): param_1: Integer [BP+$06]; param_2: Integer [BP+$08].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; local_f: Byte [BP-$D]; local_e: Integer [BP-$C]; iStack_c: Integer [BP-$A]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_1509.

```pascal
procedure FUN_7f00_189d(param_1: Integer; param_2: Integer); { 7F00:189D }
begin { routine anchor; statement location unresolved } { 7F00:189D }
  local_e := param_1; { 7F00:18A9 }
  iStack_c := param_2; { 7F00:18AC }
  local_f := (P_Byte((param_1 + $39)))^; { 7F00:18B6 }
  uVar3 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 7F00:189D }
  iVar1 := (P_Integer((Integer(g_5D92) + 200)))^; { routine anchor; statement location unresolved } { 7F00:189D }
  iVar2 := (P_Integer((Integer(g_5D92) + $CA)))^; { routine anchor; statement location unresolved } { 7F00:189D }
  while Sequence((iStack_4 := iVar2); (local_6 := iVar1); ((local_6 <> 0) or else (iStack_4 <> 0))) do { routine anchor; statement location unresolved } { 7F00:189D }
    begin { routine anchor; statement location unresolved } { 7F00:189D }
      iVar1 := (P_Integer((local_6 + $2A)))^; { routine anchor; statement location unresolved } { 7F00:189D }
      iVar2 := (P_Integer((local_6 + $2C)))^; { routine anchor; statement location unresolved } { 7F00:189D }
      if (((((iStack_4 <> iStack_c) or else (local_6 <> local_e)) and then ((P_ShortInt((local_6 + $39)))^ <> 0)) and then ((((P_ShortInt((local_6 + $2F)))^ = (P_ShortInt((local_e + $2F)))^) and then ((P_ShortInt((local_6 + $30)))^ = (P_ShortInt((local_e + $30)))^)) and then (((P_ShortInt((local_6 + $31)))^ = (P_ShortInt((local_e + $31)))^) and then (((P_ShortInt((local_6 + $2E)))^ = (P_ShortInt((local_e + $2E)))^) and then ((P_ShortInt((local_6 + $32)))^ = (P_ShortInt((local_e + $32)))^))))) and then (((P_ShortInt((local_6 + $33)))^ = (P_ShortInt((local_e + $33)))^) and then ((((((P_ShortInt((local_6 + $36)))^ = (P_ShortInt((local_e + $36)))^) and then ((P_Integer((local_6 + $37)))^ = (P_Integer((local_e + $37)))^)) and then ((P_ShortInt((local_6 + $3C)))^ = (P_ShortInt((local_6 + $3C)))^)) and then (((P_Byte((local_6 + $3C)))^ < 2) and then ((P_ShortInt((local_6 + $3D)))^ = (P_ShortInt((local_6 + $3D)))^))) and then ((P_ShortInt((local_6 + $3E)))^ = (P_ShortInt((local_6 + $3E)))^)))) then { routine anchor; statement location unresolved } { 7F00:189D }
        begin { routine anchor; statement location unresolved } { 7F00:189D }
          if ((Word(local_f) + Word((P_Byte((local_6 + $39)))^)) < $100) then { routine anchor; statement location unresolved } { 7F00:189D }
            begin { routine anchor; statement location unresolved } { 7F00:189D }
              local_f := (local_f + (P_ShortInt((local_6 + $39)))^); { 7F00:1A02 }
              FUN_00ba_1509(local_6, iStack_4, g_5D92, g_5D94); { 7F00:1A13 }
            end; { routine anchor; statement location unresolved } { 7F00:189D }
          else { routine anchor; statement location unresolved } { 7F00:189D }
            begin { routine anchor; statement location unresolved } { 7F00:189D }
              (P_Byte((local_e + $39)))^ := $FF; { routine anchor; statement location unresolved } { 7F00:189D }
              (P_ShortInt((local_6 + $39)))^ := ((P_ShortInt((local_6 + $39)))^ - (-(1) - local_f)); { routine anchor; statement location unresolved } { 7F00:189D }
              local_f := (P_Byte((local_6 + $39)))^; { 7F00:1A49 }
              local_e := local_6; { 7F00:1A52 }
              iStack_c := iStack_4; { 7F00:1A55 }
            end; { routine anchor; statement location unresolved } { 7F00:189D }
        end; { routine anchor; statement location unresolved } { 7F00:189D }
    end; { routine anchor; statement location unresolved } { 7F00:189D }
  (P_Byte((local_e + $39)))^ := local_f; { routine anchor; statement location unresolved } { 7F00:189D }
  Exit; { 7F00:1A74 }
end; { routine anchor; statement location unresolved } { 7F00:189D }
```

### ov19:1A8A UseItem (conf M)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; local_13: array[0..6] of Byte [BP-$11]; local_c: array[0..5] of Byte [BP-$A]; local_6: Byte [BP-$4]; local_5: Word [BP-$3]; local_3: Byte [BP-$1].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_0442, FUN_00ba_1509, FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_2637, FUN_00ba_2b88, FUN_0709_0626, FUN_0709_0dbe, System.@StrCopy, SpellListHeading, ov22_0C20, ov22_323D, ov22_328A.

```pascal
procedure UseItem(param_1: P_ShortInt; param_2: LongWord); { 7F00:1A8A }
begin { routine anchor; statement location unresolved } { 7F00:1A8A }
  local_5 := $FFFF; { 7F00:1A90 }
  g_6DBF := 0; { 7F00:1A95 }
  local_3 := 0; { 7F00:1A9A }
  uVar5 := $96; { routine anchor; statement location unresolved } { 7F00:1A8A }
  ov22_323D(Integer(param_2), Slice16(param_2, 2)); { 7F00:1AA4 }
  if (UNKNOWN_extraout_AL = 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
    begin { routine anchor; statement location unresolved } { 7F00:1A8A }
      bVar4 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 7F00:1A8A }
      if (((P_ShortInt((Integer(param_2) + $3D)))^ <> 0) and then ((P_Byte((Integer(param_2) + $3E)))^ < $80)) then { routine anchor; statement location unresolved } { 7F00:1A8A }
        begin { routine anchor; statement location unresolved } { 7F00:1A8A }
          g_6DBF := 1; { 7F00:1AE7 }
          local_3 := (P_Byte((Integer(param_2) + $3D)))^; { 7F00:1ACE }
        end; { routine anchor; statement location unresolved } { 7F00:1A8A }
    end; { routine anchor; statement location unresolved } { 7F00:1A8A }
  else { routine anchor; statement location unresolved } { 7F00:1A8A }
    begin { routine anchor; statement location unresolved } { 7F00:1A8A }
      g_6B80 := Integer(param_2); { 7F00:1AB3 }
      g_6B82 := Slice16(param_2, 2); { 7F00:1AB6 }
      SpellListHeading(@(local_6), SS, @(local_5), SS, 1, 2); { 7F00:1ACB }
      bVar4 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 7F00:1A8A }
      local_3 := UNKNOWN_extraout_AL_00; { 7F00:1AF3 }
    end; { routine anchor; statement location unresolved } { 7F00:1A8A }
  if (local_3 = 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
    begin { routine anchor; statement location unresolved } { 7F00:1A8A }
      (param_1)^ := 0; { routine anchor; statement location unresolved } { 7F00:1A8A }
    end; { routine anchor; statement location unresolved } { 7F00:1A8A }
  else { routine anchor; statement location unresolved } { 7F00:1A8A }
    begin { routine anchor; statement location unresolved } { 7F00:1A8A }
      if ((g_49F3 = 5) and then ((P_ShortInt((Integer(g_5D92) + $10F)))^ = 0)) then { routine anchor; statement location unresolved } { 7F00:1A8A }
        begin { routine anchor; statement location unresolved } { 7F00:1A8A }
          uVar5 := $BA; { routine anchor; statement location unresolved } { 7F00:1A8A }
          FUN_00ba_2b88(); { 7F00:1B19 }
          bVar4 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 7F00:1A8A }
        end; { routine anchor; statement location unresolved } { 7F00:1A8A }
      if (g_6DBF <> 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
        begin { routine anchor; statement location unresolved } { 7F00:1A8A }
          if ($38 < local_3) then { routine anchor; statement location unresolved } { 7F00:1A8A }
            begin { routine anchor; statement location unresolved } { 7F00:1A8A }
              local_3 := (local_3 - $17); { 7F00:1B2E }
            end; { routine anchor; statement location unresolved } { 7F00:1A8A }
          puVar6 := local_13; { routine anchor; statement location unresolved } { 7F00:1A8A }
          uVar3 := SS; { routine anchor; statement location unresolved } { 7F00:1A8A }
          uVar7 := g_5D92; { routine anchor; statement location unresolved } { 7F00:1A8A }
          uVar8 := g_5D94; { routine anchor; statement location unresolved } { 7F00:1A8A }
          PString(local_13, SS) := 'uses an item'; { 7F00:1B44 }
          FUN_00ba_16ec((Word(UNKNOWN_extraout_AH_02) shl 8), Pack16(UNKNOWN_extraout_AH_02, 10), puVar6, uVar3, uVar7, uVar8); { 7F00:1B4F }
          if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 7F00:1A8A }
            begin { routine anchor; statement location unresolved } { 7F00:1A8A }
              iVar2 := (Word(UNKNOWN_extraout_AH_03) shl 8); { routine anchor; statement location unresolved } { 7F00:1A8A }
              uVar5 := Pack16(UNKNOWN_extraout_AH_03, $17); { routine anchor; statement location unresolved } { 7F00:1A8A }
              uVar3 := Pack16(UNKNOWN_extraout_AH_03, 10); { routine anchor; statement location unresolved } { 7F00:1A8A }
              puVar6 := local_c; { routine anchor; statement location unresolved } { 7F00:1A8A }
              PString(local_c, SS) := 'Item:'; { 7F00:1B6E }
              FUN_0709_0626(puVar6, SS, uVar3, uVar5, iVar2); { 7F00:1B73 }
              FUN_00ba_0442(Pack16(UNKNOWN_extraout_AH_04, 1), (Word(UNKNOWN_extraout_AH_04) shl 8), Pack16(UNKNOWN_extraout_AH_04, $17), Pack16(UNKNOWN_extraout_AH_04, 5), Integer(param_2), Slice16(param_2, 2), g_5D92, g_5D94); { 7F00:1B92 }
            end; { routine anchor; statement location unresolved } { 7F00:1A8A }
          else { routine anchor; statement location unresolved } { 7F00:1A8A }
            begin { routine anchor; statement location unresolved } { 7F00:1A8A }
              FUN_00ba_0442(Pack16(UNKNOWN_extraout_AH_03, 1), (Word(UNKNOWN_extraout_AH_03) shl 8), Pack16(UNKNOWN_extraout_AH_03, $16), Pack16(UNKNOWN_extraout_AH_03, 1), Integer(param_2), Slice16(param_2, 2), g_5D92, g_5D94); { 7F00:1BB3 }
            end; { routine anchor; statement location unresolved } { 7F00:1A8A }
          FUN_0709_0dbe(); { 7F00:1BB8 }
          FUN_00ba_17e3(); { 7F00:1BBD }
          bVar4 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 7F00:1A8A }
        end; { routine anchor; statement location unresolved } { 7F00:1A8A }
      g_6DBF := 1; { 7F00:1BC2 }
      ov22_0C20(P_ShortInt(param_1), Integer((LongWord(param_1) shr $10)), (Word(bVar4) shl 8), Pack16(bVar4, (P_Byte((Integer(g_5D92) + $10F)))^), Pack16(bVar4, local_3)); { 7F00:1BDD }
      g_6DBF := 0; { 7F00:1BE2 }
      if ((g_49F3 = 5) and then ((P_ShortInt(((Word(local_3) * $10) + $3205)))^ <> 0)) then { routine anchor; statement location unresolved } { 7F00:1A8A }
        begin { routine anchor; statement location unresolved } { 7F00:1A8A }
          cVar1 := FUN_00ba_2637(g_5D92, g_5D94); { 7F00:1C08 }
          (param_1)^ := cVar1; { routine anchor; statement location unresolved } { 7F00:1A8A }
        end; { routine anchor; statement location unresolved } { 7F00:1A8A }
    end; { routine anchor; statement location unresolved } { 7F00:1A8A }
  if ((param_1)^ <> 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
    begin { routine anchor; statement location unresolved } { 7F00:1A8A }
      cVar1 := ov22_323D(Integer(param_2), Slice16(param_2, 2)); { 7F00:1C22 }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
        begin { routine anchor; statement location unresolved } { 7F00:1A8A }
          if ((P_ShortInt((Integer(param_2) + $3C)))^ <> 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
            begin { routine anchor; statement location unresolved } { 7F00:1A8A }
              if ((P_Byte((Integer(param_2) + $39)))^ < 2) then { routine anchor; statement location unresolved } { 7F00:1A8A }
                begin { routine anchor; statement location unresolved } { 7F00:1A8A }
                  (P_ShortInt((Integer(param_2) + $3C)))^ := ((P_ShortInt((Integer(param_2) + $3C)))^ + -(1)); { routine anchor; statement location unresolved } { 7F00:1A8A }
                  if ((P_ShortInt((Integer(param_2) + $3C)))^ = 0) then { routine anchor; statement location unresolved } { 7F00:1A8A }
                    begin { routine anchor; statement location unresolved } { 7F00:1A8A }
                      FUN_00ba_1509(Integer(param_2), Slice16(param_2, 2), g_5D92, g_5D94); { 7F00:1C80 }
                    end; { routine anchor; statement location unresolved } { 7F00:1A8A }
                end; { routine anchor; statement location unresolved } { 7F00:1A8A }
              else { routine anchor; statement location unresolved } { 7F00:1A8A }
                begin { routine anchor; statement location unresolved } { 7F00:1A8A }
                  (P_ShortInt((Integer(param_2) + $39)))^ := ((P_ShortInt((Integer(param_2) + $39)))^ + -(1)); { routine anchor; statement location unresolved } { 7F00:1A8A }
                end; { routine anchor; statement location unresolved } { 7F00:1A8A }
            end; { routine anchor; statement location unresolved } { 7F00:1A8A }
        end; { routine anchor; statement location unresolved } { 7F00:1A8A }
      else { routine anchor; statement location unresolved } { 7F00:1A8A }
        begin { routine anchor; statement location unresolved } { 7F00:1A8A }
          ov22_328A(local_3, Integer(param_2), Slice16(param_2, 2), g_5D92, g_5D94); { 7F00:1C3D }
        end; { routine anchor; statement location unresolved } { 7F00:1A8A }
    end; { routine anchor; statement location unresolved } { 7F00:1A8A }
  Exit; { 7F00:1C88 }
end; { routine anchor; statement location unresolved } { 7F00:1A8A }
```

### ov19:1CEE SellItem (conf M)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; iVar10: Integer [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; bVar12: Boolean [compiler temporary; no proven BP slot]; puVar13: P_Byte [compiler temporary; no proven BP slot]; uVar14: Word [compiler temporary; no proven BP slot]; puVar15: P_Byte [compiler temporary; no proven BP slot]; uVar16: Word [compiler temporary; no proven BP slot]; local_20a: array[0..255] of Byte [BP-$208]; local_10a: array[0..200] of Byte [BP-$108]; local_41: array[0..33] of Byte [BP-$3F]; local_1f: array[0..5] of Byte [BP-$1D]; local_19: array[0..14] of Byte [BP-$17]; local_a: Word [BP-$8]; local_8: Word [BP-$6]; local_6: Word [BP-$4]; local_4: Word [BP-$2].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_0442, FUN_00ba_1073, FUN_00ba_1509, FUN_00ba_1693, FUN_03f1_0137, FUN_0709_0768, System.@StrAppend, System.@StrCopy, ov21_0054, ov25_10D1.

```pascal
procedure SellItem(param_1: LongWord); { 7F00:1CEE }
begin { routine anchor; statement location unresolved } { 7F00:1CEE }
  local_4 := 0; { 7F00:1CF7 }
  uVar11 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 7F00:1CEE }
  iVar10 := Integer(param_1); { routine anchor; statement location unresolved } { 7F00:1CEE }
  if ((P_Integer((iVar10 + $3A)))^ <> 0) then { routine anchor; statement location unresolved } { 7F00:1CEE }
    begin { routine anchor; statement location unresolved } { 7F00:1CEE }
      local_4 := ((P_Word((iVar10 + $3A)))^ shr 1); { 7F00:1D0D }
    end; { routine anchor; statement location unresolved } { 7F00:1CEE }
  if (1 < (P_Byte((iVar10 + $39)))^) then { routine anchor; statement location unresolved } { 7F00:1CEE }
    begin { routine anchor; statement location unresolved } { 7F00:1CEE }
      if (((P_ShortInt((iVar10 + $2E)))^ = 73) and then ((P_ShortInt((iVar10 + $2E)))^ = 28)) then { routine anchor; statement location unresolved } { 7F00:1CEE }
        begin { routine anchor; statement location unresolved } { 7F00:1CEE }
          local_4 := ((P_Byte((iVar10 + $39)))^ * local_4); { 7F00:1D41 }
        end; { routine anchor; statement location unresolved } { 7F00:1CEE }
      else { routine anchor; statement location unresolved } { 7F00:1CEE }
        begin { routine anchor; statement location unresolved } { 7F00:1CEE }
          local_4 := Word((((LongWord((P_Byte((iVar10 + $39)))^) * LongWord(local_4)) and $FFFF) div $14)); { 7F00:1D52 }
        end; { routine anchor; statement location unresolved } { 7F00:1CEE }
    end; { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar2 := (local_4 shr 8); { routine anchor; statement location unresolved } { 7F00:1CEE }
  FUN_00ba_0442((uVar2 shl 8), (uVar2 shl 8), (uVar2 shl 8), (uVar2 shl 8), iVar10, uVar11, Word(g_4716), Slice16(g_4716, 2)); { 7F00:1D6F }
  uVar4 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar5 := Pack16(UNKNOWN_extraout_AH, $15); { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar6 := Pack16(UNKNOWN_extraout_AH, $26); { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar7 := Pack16(UNKNOWN_extraout_AH, $16); { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar8 := Pack16(UNKNOWN_extraout_AH, $E); { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar9 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 7F00:1CEE }
  puVar15 := local_20a; { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar16 := SS; { routine anchor; statement location unresolved } { 7F00:1CEE }
  PString(BP+65016, SS) := 'I''ll give you '; { 7F00:1D91 }
  puVar13 := local_10a; { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar14 := SS; { routine anchor; statement location unresolved } { 7F00:1CEE }
  FUN_00ba_1073(local_4); { 7F00:1D9F }
  PString(BP+65016, SS) := Copy(PString(BP+65016, SS) + PString(puVar13, uVar14), 1, 255); { 7F00:1DA4 }
  PString(BP+65016, SS) := Copy(PString(BP+65016, SS) + ' gold pieces for your ', 1, 255); { 7F00:1DAE }
  PString(BP+65016, SS) := Copy(PString(BP+65016, SS) + PString(iVar10, uVar11), 1, 255); { 7F00:1DB8 }
  FUN_0709_0768(puVar15, uVar16, uVar9, uVar8, uVar7, uVar6, uVar5, uVar4); { 7F00:1DBD }
  puVar15 := local_19; { routine anchor; statement location unresolved } { 7F00:1CEE }
  uVar14 := SS; { routine anchor; statement location unresolved } { 7F00:1CEE }
  PString(local_19, SS) := 'Is It a Deal? '; { 7F00:1DCC }
  cVar3 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), puVar15, uVar14); { 7F00:1DDA }
  if (cVar3 = 89) then { routine anchor; statement location unresolved } { 7F00:1CEE }
    begin { routine anchor; statement location unresolved } { 7F00:1CEE }
      puVar15 := local_1f; { routine anchor; statement location unresolved } { 7F00:1CEE }
      uVar14 := SS; { routine anchor; statement location unresolved } { 7F00:1CEE }
      PString(local_1f, SS) := 'Sold!'; { 7F00:1DF0 }
      FUN_00ba_1693(puVar15, uVar14); { 7F00:1DF5 }
      FUN_00ba_1509(iVar10, uVar11, g_5D92, g_5D94); { 7F00:1E08 }
      local_6 := (local_4 div 5); { 7F00:1E17 }
      local_8 := (local_4 mod 5); { 7F00:1E25 }
      cVar3 := ov21_0054(@(local_a), SS, (local_8 + local_6), g_5D92, g_5D94); { 7F00:1E3C }
      if (cVar3 = 0) then { routine anchor; statement location unresolved } { 7F00:1CEE }
        begin { routine anchor; statement location unresolved } { 7F00:1CEE }
          piVar1 := P_Integer((Integer(g_5D92) + $90)); { routine anchor; statement location unresolved } { 7F00:1CEE }
          (piVar1)^ := ((piVar1)^ + local_6); { routine anchor; statement location unresolved } { 7F00:1CEE }
          piVar1 := P_Integer((Integer(g_5D92) + $8E)); { routine anchor; statement location unresolved } { 7F00:1CEE }
          (piVar1)^ := ((piVar1)^ + local_8); { routine anchor; statement location unresolved } { 7F00:1CEE }
        end; { routine anchor; statement location unresolved } { 7F00:1CEE }
      else { routine anchor; statement location unresolved } { 7F00:1CEE }
        begin { routine anchor; statement location unresolved } { 7F00:1CEE }
          puVar15 := local_41; { routine anchor; statement location unresolved } { 7F00:1CEE }
          PString(local_41, SS) := 'Overloaded.  Money will be put in pool.'; { 7F00:1E4F }
          FUN_00ba_1693(puVar15, SS); { 7F00:1E54 }
          uVar11 := Word((LongWord(g_5D92) shr $10)); { routine anchor; statement location unresolved } { 7F00:1CEE }
          if (local_6 < local_a) then { routine anchor; statement location unresolved } { 7F00:1CEE }
            begin { routine anchor; statement location unresolved } { 7F00:1CEE }
              piVar1 := P_Integer((Integer(g_5D92) + $90)); { routine anchor; statement location unresolved } { 7F00:1CEE }
              (piVar1)^ := ((piVar1)^ + local_6); { routine anchor; statement location unresolved } { 7F00:1CEE }
            end; { routine anchor; statement location unresolved } { 7F00:1CEE }
          else { routine anchor; statement location unresolved } { 7F00:1CEE }
            begin { routine anchor; statement location unresolved } { 7F00:1CEE }
              piVar1 := P_Integer((Integer(g_5D92) + $90)); { routine anchor; statement location unresolved } { 7F00:1CEE }
              (piVar1)^ := ((piVar1)^ + local_a); { routine anchor; statement location unresolved } { 7F00:1CEE }
              bVar12 := Carry16(g_6804, (local_6 - local_a)); { routine anchor; statement location unresolved } { 7F00:1CEE }
              g_6804 := (g_6804 + (local_6 - local_a)); { 7F00:1E83 }
              g_6806 := (g_6806 + Word(bVar12)); { routine anchor; statement location unresolved } { 7F00:1CEE }
            end; { routine anchor; statement location unresolved } { 7F00:1CEE }
          piVar1 := P_Integer((Integer(g_5D92) + $8E)); { routine anchor; statement location unresolved } { 7F00:1CEE }
          (piVar1)^ := ((piVar1)^ + local_8); { routine anchor; statement location unresolved } { 7F00:1CEE }
        end; { routine anchor; statement location unresolved } { 7F00:1CEE }
    end; { routine anchor; statement location unresolved } { 7F00:1CEE }
  FUN_03f1_0137($16, $26, $15, 1); { 7F00:1EBD }
  Exit; { 7F00:1EC5 }
end; { routine anchor; statement location unresolved } { 7F00:1CEE }
```

### ov19:1F52 IdentifyItem (conf M)

Params (stack slots): param_1: P_Byte [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: LongWord [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; uVar8: Word [compiler temporary; no proven BP slot]; bVar9: Byte [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; puVar11: P_Byte [compiler temporary; no proven BP slot]; local_10b: array[0..223] of Byte [BP-$109]; local_2b: array[0..16] of Byte [BP-$29]; local_1a: array[0..14] of Byte [BP-$18]; local_b: ShortInt [BP-$9]; local_a: LongWord [BP-$8]; local_6: LongWord [BP-$4].  
Callers: ov19_0EF8.  
Callees: FUN_00ba_0442, FUN_00ba_1693, FUN_03f1_0137, FUN_0709_0768, FUN_0709_0dbe, System.@StrAppend, System.@StrCopy, ov19_28BE, ov21_00A8, ov21_0130, ov21_0185, ov25_10D1.

```pascal
procedure IdentifyItem(param_1: P_Byte; param_2: LongWord); { 7F00:1F52 }
begin { routine anchor; statement location unresolved } { 7F00:1F52 }
  local_b := 0; { 7F00:1F59 }
  uVar8 := (UNKNOWN_in_AX shr 8); { routine anchor; statement location unresolved } { 7F00:1F52 }
  FUN_00ba_0442((uVar8 shl 8), (uVar8 shl 8), (uVar8 shl 8), (uVar8 shl 8), Integer(param_2), Slice16(param_2, 2), Word(g_4716), Slice16(g_4716, 2)); { 7F00:1F77 }
  uVar10 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar2 := Pack16(UNKNOWN_extraout_AH, $15); { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar3 := Pack16(UNKNOWN_extraout_AH, $26); { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar4 := Pack16(UNKNOWN_extraout_AH, $16); { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar5 := Pack16(UNKNOWN_extraout_AH, $E); { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar6 := Pack16(UNKNOWN_extraout_AH, 1); { routine anchor; statement location unresolved } { 7F00:1F52 }
  puVar11 := local_10b; { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:1F52 }
  PString(BP+65271, SS) := 'For 200 gold pieces I''ll identify your '; { 7F00:1F99 }
  PString(BP+65271, SS) := Copy(PString(BP+65271, SS) + PString(Integer(param_2), Slice16(param_2, 2)), 1, 255); { 7F00:1FA3 }
  FUN_0709_0768(puVar11, uVar7, uVar6, uVar5, uVar4, uVar3, uVar2, uVar10); { 7F00:1FA8 }
  puVar11 := local_1a; { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:1F52 }
  PString(local_1a, SS) := 'Is It a Deal? '; { 7F00:1FB7 }
  uVar10 := $3C5; { routine anchor; statement location unresolved } { 7F00:1F52 }
  uVar7 := ov25_10D1(Pack16(UNKNOWN_extraout_AH_00, $F), Pack16(UNKNOWN_extraout_AH_00, 10), Pack16(UNKNOWN_extraout_AH_00, $D), puVar11, uVar7); { 7F00:1FC5 }
  if (ShortInt(uVar7) = 89) then { routine anchor; statement location unresolved } { 7F00:1F52 }
    begin { routine anchor; statement location unresolved } { 7F00:1F52 }
      local_6 := ov19_28BE(g_5D92, g_5D94); { 7F00:1FDA }
      uVar1 := (LongWord(local_6) shr $10); { routine anchor; statement location unresolved } { 7F00:1F52 }
      uVar8 := Word(local_6); { routine anchor; statement location unresolved } { 7F00:1F52 }
      if (local_6 < 200) then { routine anchor; statement location unresolved } { 7F00:1F52 }
        begin { routine anchor; statement location unresolved } { 7F00:1F52 }
          local_a := ov21_00A8(P_Word(@(g_67F4)), $C7C); { 7F00:200E }
          uVar1 := (LongWord(local_a) shr $10); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar8 := Word(local_a); { routine anchor; statement location unresolved } { 7F00:1F52 }
          if (local_a < 200) then { routine anchor; statement location unresolved } { 7F00:1F52 }
            begin { routine anchor; statement location unresolved } { 7F00:1F52 }
              puVar11 := local_2b; { routine anchor; statement location unresolved } { 7F00:1F52 }
              uVar7 := SS; { routine anchor; statement location unresolved } { 7F00:1F52 }
              PString(local_2b, SS) := 'Not Enough Money'; { 7F00:2049 }
              uVar10 := $BA; { routine anchor; statement location unresolved } { 7F00:1F52 }
              uVar7 := FUN_00ba_1693(puVar11, uVar7); { 7F00:204E }
            end; { routine anchor; statement location unresolved } { 7F00:1F52 }
          else { routine anchor; statement location unresolved } { 7F00:1F52 }
            begin { routine anchor; statement location unresolved } { 7F00:1F52 }
              local_b := 1; { 7F00:1FF2 }
              Slice16(local_a, 0) := (uVar8 - 200); { routine anchor; statement location unresolved } { 7F00:1F52 }
              Slice16(local_a, 2) := (Integer(uVar1) - Word((uVar8 < 200))); { routine anchor; statement location unresolved } { 7F00:1F52 }
              uVar10 := $8F; { routine anchor; statement location unresolved } { 7F00:1F52 }
              uVar7 := ov21_0185(Integer(local_a)); { 7F00:2038 }
            end; { routine anchor; statement location unresolved } { 7F00:1F52 }
        end; { routine anchor; statement location unresolved } { 7F00:1F52 }
      else { routine anchor; statement location unresolved } { 7F00:1F52 }
        begin { routine anchor; statement location unresolved } { 7F00:1F52 }
          local_b := 1; { 7F00:2028 }
          Slice16(local_6, 0) := (uVar8 - 200); { routine anchor; statement location unresolved } { 7F00:1F52 }
          Slice16(local_6, 2) := (Integer(uVar1) - Word((uVar8 < 200))); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar10 := $8F; { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar7 := ov21_0130(Integer(local_6)); { 7F00:2002 }
        end; { routine anchor; statement location unresolved } { 7F00:1F52 }
    end; { routine anchor; statement location unresolved } { 7F00:1F52 }
  bVar9 := Byte((Word(uVar7) shr 8)); { routine anchor; statement location unresolved } { 7F00:1F52 }
  if (local_b <> 0) then { routine anchor; statement location unresolved } { 7F00:1F52 }
    begin { routine anchor; statement location unresolved } { 7F00:1F52 }
      if ((P_ShortInt((Integer(param_2) + $35)))^ = 0) then { routine anchor; statement location unresolved } { 7F00:1F52 }
        begin { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar7 := Pack16(bVar9, 1); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar2 := Pack16(bVar9, $15); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar3 := Pack16(bVar9, $26); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar4 := Pack16(bVar9, $16); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar5 := Pack16(bVar9, $E); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar6 := Pack16(bVar9, 1); { routine anchor; statement location unresolved } { 7F00:1F52 }
          puVar11 := local_10b; { routine anchor; statement location unresolved } { 7F00:1F52 }
          PString(BP+65271, SS) := 'I can''t tell anything new about your '; { 7F00:2083 }
          PString(BP+65271, SS) := Copy(PString(BP+65271, SS) + PString(Integer(param_2), Slice16(param_2, 2)), 1, 255); { 7F00:208D }
          FUN_0709_0768(puVar11, SS, uVar6, uVar5, uVar4, uVar3, uVar2, uVar7); { 7F00:2092 }
          bVar9 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 7F00:1F52 }
        end; { routine anchor; statement location unresolved } { 7F00:1F52 }
      else { routine anchor; statement location unresolved } { 7F00:1F52 }
        begin { routine anchor; statement location unresolved } { 7F00:1F52 }
          (P_Byte((Integer(param_2) + $35)))^ := 0; { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar8 := Word(bVar9); { routine anchor; statement location unresolved } { 7F00:1F52 }
          FUN_00ba_0442((uVar8 shl 8), (uVar8 shl 8), (uVar8 shl 8), (uVar8 shl 8), Integer(param_2), Slice16(param_2, 2), Word(g_4716), Slice16(g_4716, 2)); { 7F00:20BB }
          uVar7 := Pack16(UNKNOWN_extraout_AH_02, 1); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar10 := Pack16(UNKNOWN_extraout_AH_02, $15); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar2 := Pack16(UNKNOWN_extraout_AH_02, $26); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar3 := Pack16(UNKNOWN_extraout_AH_02, $16); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar4 := Pack16(UNKNOWN_extraout_AH_02, $E); { routine anchor; statement location unresolved } { 7F00:1F52 }
          uVar5 := Pack16(UNKNOWN_extraout_AH_02, 1); { routine anchor; statement location unresolved } { 7F00:1F52 }
          puVar11 := local_10b; { routine anchor; statement location unresolved } { 7F00:1F52 }
          PString(BP+65271, SS) := 'It looks like some sort of '; { 7F00:20DD }
          PString(BP+65271, SS) := Copy(PString(BP+65271, SS) + PString(Integer(param_2), Slice16(param_2, 2)), 1, 255); { 7F00:20E7 }
          FUN_0709_0768(puVar11, SS, uVar5, uVar4, uVar3, uVar2, uVar10, uVar7); { 7F00:20EC }
          (param_1)^ := 1; { routine anchor; statement location unresolved } { 7F00:1F52 }
          bVar9 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 7F00:1F52 }
        end; { routine anchor; statement location unresolved } { 7F00:1F52 }
    end; { routine anchor; statement location unresolved } { 7F00:1F52 }
  if (local_b <> 0) then { routine anchor; statement location unresolved } { 7F00:1F52 }
    begin { routine anchor; statement location unresolved } { 7F00:1F52 }
      FUN_0709_0dbe(); { 7F00:20FE }
      bVar9 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 7F00:1F52 }
    end; { routine anchor; statement location unresolved } { 7F00:1F52 }
  FUN_03f1_0137(Pack16(bVar9, $16), Pack16(bVar9, $26), Pack16(bVar9, $15), Pack16(bVar9, 1)); { 7F00:210F }
  Exit; { 7F00:2117 }
end; { routine anchor; statement location unresolved } { 7F00:1F52 }
```

### ov19:2156 TradeCoins (conf M)

Params: none; selected actor through g_5D92/g_5D94.  
Locals: destination: far pointer [BP-4,-2]; selected coin node [BP-10,-E]; temporary list [BP-14,-12]; amount: Word [BP-130]; coinKind: ShortInt [BP-6]; exit flags [BP-132,-131]; frame size $234.  
Callers: see evidence below.
Callees (export; corrections below): see body; Pascal source order shown for explicitly reconstructed calls.

Raw-byte corrected entry and near calls: E8 AA DE at 219D targets 004A; E8 69 E3 at 21A1 targets 050D. The decompiler/export falsely routes these to overlay 22 through stale CS. Coin-list construction 21D4..2317 is explicitly unknown; selection, transfer and repeat guards are traced below. The cancel branch 2194 sets leaveAll=True before going to 2468; that assignment is represented by the nil-selection exit, not a new Pascal function. Source call signatures marked UNKNOWN retain unfinished argument recovery.

```pascal
procedure TradeCoins; { 7F00:2156 }
begin { 7F00:2156 }
  repeat { 7F00:215D }
    destination := FarPtr(g_471C,g_471A); { 7F00:2164 }
    FUN_00ba_27d9; { 7F00:216A }
    FUN_00ba_2c48(UNKNOWN_SelectActorABI('Trade to?',destination,1)); { 7F00:2187 }
    if destination = nil then begin { 7F00:218C }
      leaveAll := True; { 7F00:2194 }
      goto TradeCoins_2468; { 7F00:2199 }
    end; { 7F00:219C }
    ShowCharacterSummary; { 7F00:219D }
    repeat { 7F00:21A0 }
      FUN_7f00_050d; { 7F00:21A1 }
      g_471A := Offset(destination); { 7F00:21AA }
      g_471C := Segment(destination); { 7F00:21AD }
      UNKNOWN_BuildCoinChoiceListFromSevenCoinSlots; { 7F00:21D4 }
      listHead := UNKNOWN_CoinListResult; { 7F00:2312 }
      selectedCoin := nil; { 7F00:231E }
      command := ov25_0D9A(UNKNOWN_CoinListABI('Select type of coin',listHead,selectedCoin)); { 7F00:2376 }
      if selectedCoin = nil then { 7F00:237F }
        leaveCoins := True { 7F00:2387 }
      else begin { 7F00:238F }
        coinKind := ov21_0B93(UNKNOWN_CoinNameABI(selectedCoin,coinName)); { 7F00:239F }
        prompt := 'How much ' + coinName + 'will you trade? '; { 7F00:23D6 }
        amount := ov21_0294(UNKNOWN_AmountABI(10,prompt,WordAt(FarPtr(g_5D94,g_5D92),$88+2*coinKind))); { 7F00:23F5 }
        ov21_044C(UNKNOWN_CoinTransferABI(coinKind,amount,destination,FarPtr(g_5D94,g_5D92))); { 7F00:2410 }
        leaveCoins := True; { 7F00:2415 }
        leaveAll := True; { 7F00:241A }
        for coinKind := 0 to 6 do { 7F00:241F }
          if WordAt(FarPtr(g_5D94,g_5D92),$88+2*coinKind) > 0 then begin { 7F00:2434 }
            leaveAll := False; { 7F00:243C }
            leaveCoins := False; { 7F00:2441 }
          end; { 7F00:2446 }
      end; { 7F00:244C }
      if listHead <> nil then ov25_11F3(@listHead); { 7F00:2459 }
    until leaveCoins; { 7F00:245E }
TradeCoins_2468: { 7F00:2468 }
  until leaveAll; { 7F00:2468 }
end; { 7F00:2475 }
```

### ov19:231A FUN_7F00_231A (conf H)

Params: none proven; not a valid source-procedure entry.  
Locals: inherits surrounding TradeCoins frame.  
Callers: ov22_0C20.  
Callees (export; corrections below): FUN_00ba_27d9, FUN_00ba_2c48, FUN_7f00_2468, FUN_8e00_104a, FUN_8e00_150d, System.@StrAppend, System.@StrAssign, System.@StrCopy, System.@StrLong, System.GetMem, ov21_0294, ov21_044C, ov21_0B93, ov25_0D9A, ov25_11F3.

Exported entry 231A is **the displacement byte EC of MOV [BP-14],AX beginning at 2318**. Raw bytes at 2312 are 8B 46 F4 8B 56 F6 89 46 EC 89 56 EE. The IN AL,DX interpretation is not game logic. Actual coin-trading prologue is 2156 (55 89 E5 81 EC 34 02). See corrected section 2156 below. This candidate must not become a game routine.

```pascal
procedure InvalidExportCandidate_231A; { 7F00:231A }
begin { 7F00:231A }
  UNKNOWN_InvalidEntryInsideMOVInstruction; { 7F00:231A }
end; { 7F00:231A }
```

### ov19:2468 FUN_7F00_2468 (conf H)

Params: inherits TradeCoins BP frame; no independently pushed arguments.  
Locals: exit-all flag: Byte [inherited BP-131].  
Callers: FUN_7f00_231a.  
Callees (export; corrections below): none recorded.

This is a **shared tail, not a distinct Pascal source procedure**. Exported C follows far beyond its 14-byte block with an invalid inherited-CS interpretation; that body is rejected. 246F E9 EB FC resolves to current-CS 215D. Return uses caller frame. Retained as a section to account for the exported candidate.

```pascal
procedure SharedTradeCoinsTail; { 7F00:2468 }
begin { 7F00:2468 }
  if ByteAtSS(BP-$131) = 0 then { 7F00:2468 }
    goto TradeCoins_215D; { 7F00:246F }
  RestoreInheritedBPFrameAndReturnFar; { 7F00:2472 }
end; { 7F00:2475 }
```

### ov19:275B ov19_275B (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: LongWord [BP+$0A].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_6: Integer [BP-$4]; local_4: Boolean [BP-$2].  
Callers: FUN_7f00_1734.  
Callees: FUN_00ba_0bb8, FUN_00ba_13ab.

```pascal
function ov19_275B(param_1: LongWord; param_2: LongWord): Word; { 7F00:275B }
begin { routine anchor; statement location unresolved } { 7F00:275B }
  FUN_00ba_0bb8(Integer(param_2), Slice16(param_2, 2)); { 7F00:2767 }
  local_4 := ($F < (P_Byte((Integer(param_2) + 199)))^); { 7F00:276C }
  uVar4 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 7F00:275B }
  iVar3 := Integer(param_1); { routine anchor; statement location unresolved } { 7F00:275B }
  local_6 := (P_Integer((iVar3 + $37)))^; { 7F00:2786 }
  if ((P_ShortInt((iVar3 + $39)))^ <> 0) then { routine anchor; statement location unresolved } { 7F00:275B }
    begin { routine anchor; statement location unresolved } { 7F00:275B }
      local_6 := (Word((P_Byte((iVar3 + $39)))^) * local_6); { 7F00:279F }
    end; { routine anchor; statement location unresolved } { 7F00:275B }
  iVar3 := FUN_00ba_13ab(Integer(param_2), Slice16(param_2, 2)); { 7F00:27A8 }
  uVar1 := (iVar3 + $5DC); { routine anchor; statement location unresolved } { 7F00:275B }
  uVar2 := ((P_Integer((Integer(param_2) + $102)))^ + local_6); { routine anchor; statement location unresolved } { 7F00:275B }
  if (((Integer(uVar1) < 0) and then ((Integer(uVar1) shr $F) < 1)) or else (((Integer(uVar1) shr $F) < 1) and then (uVar1 < uVar2))) then { routine anchor; statement location unresolved } { 7F00:275B }
    begin { routine anchor; statement location unresolved } { 7F00:275B }
      local_4 := true; { 7F00:277B }
    end; { routine anchor; statement location unresolved } { 7F00:275B }
  Exit(Pack16(ShortInt((uVar2 shr 8)), local_4)); { 7F00:27DC }
end; { routine anchor; statement location unresolved } { 7F00:275B }
```

### ov19:27DF ov19_27DF (conf L)

Params (stack slots): param_1: ShortInt [BP+$06].  
Locals: piVar1: P_Integer [compiler temporary; no proven BP slot]; local_6: Integer [BP-$4]; iStack_4: Integer [BP-$2].  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov19_27DF(param_1: ShortInt); { 7F00:27DF }
begin { routine anchor; statement location unresolved } { 7F00:27DF }
  local_6 := g_5D96; { 7F00:27EC }
  local_6 := g_5D96; { 7F00:2832 }
  iStack_4 := g_5D98; { 7F00:27EF }
  if ((g_5D96 <> 0) or else (g_5D98 <> 0)) then { routine anchor; statement location unresolved } { 7F00:27DF }
    begin { routine anchor; statement location unresolved } { 7F00:27DF }
      if (param_1 = 71) then { routine anchor; statement location unresolved } { 7F00:27DF }
        begin { routine anchor; statement location unresolved } { 7F00:27DF }
          if ((g_5D98 = g_5D94) and then (g_5D96 = g_5D92)) then { routine anchor; statement location unresolved } { 7F00:27DF }
            begin { routine anchor; statement location unresolved } { 7F00:27DF }
              while (((P_Integer((local_6 + $104)))^ <> 0) or else ((P_Integer((local_6 + $106)))^ <> 0)) do { routine anchor; statement location unresolved } { 7F00:27DF }
                begin { routine anchor; statement location unresolved } { 7F00:27DF }
                  piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 7F00:27DF }
                  iStack_4 := (P_Integer((local_6 + $106)))^; { 7F00:2835 }
                  local_6 := (piVar1)^; { 7F00:286A }
                end; { routine anchor; statement location unresolved } { 7F00:27DF }
            end; { routine anchor; statement location unresolved } { 7F00:27DF }
          else { routine anchor; statement location unresolved } { 7F00:27DF }
            begin { routine anchor; statement location unresolved } { 7F00:27DF }
              while ((local_6 <> 0) or else ((iStack_4 <> 0) and then (((P_Integer((local_6 + $106)))^ <> g_5D94) or else ((P_Integer((local_6 + $104)))^ <> g_5D92)))) do { routine anchor; statement location unresolved } { 7F00:27DF }
                begin { routine anchor; statement location unresolved } { 7F00:27DF }
                  piVar1 := P_Integer((local_6 + $104)); { routine anchor; statement location unresolved } { 7F00:27DF }
                  iStack_4 := (P_Integer((local_6 + $106)))^; { 7F00:286D }
                  local_6 := (piVar1)^; { 7F00:2896 }
                end; { routine anchor; statement location unresolved } { 7F00:27DF }
            end; { routine anchor; statement location unresolved } { 7F00:27DF }
        end; { routine anchor; statement location unresolved } { 7F00:27DF }
      else { routine anchor; statement location unresolved } { 7F00:27DF }
        if (param_1 = 79) then { routine anchor; statement location unresolved } { 7F00:27DF }
          begin { routine anchor; statement location unresolved } { 7F00:27DF }
            if (((P_Integer((g_5D92 + $104)))^ <> 0) or else ((P_Integer((g_5D92 + $106)))^ <> 0)) then { routine anchor; statement location unresolved } { 7F00:27DF }
              begin { routine anchor; statement location unresolved } { 7F00:27DF }
                local_6 := (P_Integer((g_5D92 + $104)))^; { 7F00:28A5 }
                iStack_4 := (P_Integer((g_5D92 + $106)))^; { 7F00:2899 }
              end; { routine anchor; statement location unresolved } { 7F00:27DF }
          end; { routine anchor; statement location unresolved } { 7F00:27DF }
        else { routine anchor; statement location unresolved } { 7F00:27DF }
          begin { routine anchor; statement location unresolved } { 7F00:27DF }
          end; { routine anchor; statement location unresolved } { 7F00:27DF }
    end; { routine anchor; statement location unresolved } { 7F00:27DF }
  g_5D92 := FarBits(iStack_4, local_6); { routine anchor; statement location unresolved } { 7F00:27DF }
  Exit; { 7F00:28BB }
end; { routine anchor; statement location unresolved } { 7F00:27DF }
```

### ov19:28BE ov19_28BE (conf L)

Params (stack slots): none.  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; bVar4: Boolean [compiler temporary; no proven BP slot]; local_b: Byte [BP-$9]; local_a: Word [BP-$8]; local_8: Word [BP-$6].  
Callers: FUN_7f00_1f52.  
Callees: System.@LongDivMod, System.@LongMul.

Stack layout disagrees with RETF: remaining difference 4 bytes.

```pascal
function ov19_28BE(): LongWord; { 7F00:28BE }
begin { routine anchor; statement location unresolved } { 7F00:28BE }
  local_a := 0; { 7F00:28C6 }
  local_8 := 0; { 7F00:28C9 }
  local_b := 0; { 7F00:28CC }
  while true do { routine anchor; statement location unresolved } { 7F00:28BE }
    begin { routine anchor; statement location unresolved } { 7F00:28BE }
      iVar3 := (P_Integer(((local_b * 4) + $D26)))^; { routine anchor; statement location unresolved } { 7F00:28BE }
      uVar1 := Multiply32FromRegisters(); { 7F00:28FD }
      bVar4 := Carry16(local_a, uVar1); { routine anchor; statement location unresolved } { 7F00:28BE }
      local_a := (local_a + uVar1); { 7F00:2902 }
      local_8 := ((local_8 + iVar3) + Word(bVar4)); { routine anchor; statement location unresolved } { 7F00:28BE }
      if (local_b = 4) then { routine anchor; statement location unresolved } { 7F00:28BE }
        Break; { routine anchor; statement location unresolved } { 7F00:28BE }
      local_b := (local_b + 1); { 7F00:28D2 }
    end; { routine anchor; statement location unresolved } { 7F00:28BE }
  local_8 := (local_8 + Word(($FF9B < local_a))); { routine anchor; statement location unresolved } { 7F00:28BE }
  uVar2 := DivMod32FromRegisters(); { 7F00:2922 }
  Exit(FarBits(local_8, uVar2)); { 7F00:2936 }
end; { routine anchor; statement location unresolved } { 7F00:28BE }
```

### ov19:299C SpellListHeading (conf M)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: P_Integer [BP+$0A]; param_3: Byte [BP+$0E]; param_4: ShortInt [BP+$10].  
Locals: uVar8: Byte [compiler temporary; no proven BP slot]; uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; iVar7: Integer [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; local_12c: array[0..254] of Byte [BP-$12A]; local_2d: Byte [BP-$2B]; local_2c: array[0..40] of Byte [BP-$2A]; local_3: Byte [BP-$1]; bVar9: Byte [compiler temporary; no proven BP slot].  
Callers: ov19_1A8A.  
Callees: FUN_00ba_1816, FUN_03f1_02e8, FUN_0709_0626, System.@StrAppend, System.@StrAssign, System.@StrCopy, ov22_008A, ov22_059C.

```pascal
function SpellListHeading(param_1: P_ShortInt; param_2: P_Integer; param_3: Byte; param_4: ShortInt): Byte; { 7F00:299C }
begin { routine anchor; statement location unresolved } { 7F00:299C }
  uVar8 := Byte((Word(UNKNOWN_in_AX) shr 8)); { routine anchor; statement location unresolved } { 7F00:299C }
  if (param_4 = 0) then { routine anchor; statement location unresolved } { 7F00:299C }
    begin { routine anchor; statement location unresolved } { 7F00:299C }
      PString(local_2c, SS) := Copy('in Memory', 1, $28); { 7F00:29B8 }
      uVar8 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 7F00:299C }
    end; { routine anchor; statement location unresolved } { 7F00:299C }
  else { routine anchor; statement location unresolved } { 7F00:299C }
    if (param_4 = 1) then { routine anchor; statement location unresolved } { 7F00:299C }
      begin { routine anchor; statement location unresolved } { 7F00:299C }
        PString(local_2c, SS) := Copy('in Spell Book', 1, $28); { 7F00:29D2 }
        uVar8 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 7F00:299C }
      end; { routine anchor; statement location unresolved } { 7F00:299C }
    else { routine anchor; statement location unresolved } { 7F00:299C }
      if (param_4 = 2) then { routine anchor; statement location unresolved } { 7F00:299C }
        begin { routine anchor; statement location unresolved } { 7F00:299C }
          PString(local_2c, SS) := Copy('on Scroll', 1, $28); { 7F00:29EC }
          uVar8 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 7F00:299C }
        end; { routine anchor; statement location unresolved } { 7F00:299C }
      else { routine anchor; statement location unresolved } { 7F00:299C }
        if (param_4 = 3) then { routine anchor; statement location unresolved } { 7F00:299C }
          begin { routine anchor; statement location unresolved } { 7F00:299C }
            PString(local_2c, SS) := Copy('on Scrolls', 1, $28); { 7F00:2A05 }
            uVar8 := UNKNOWN_extraout_AH_02; { routine anchor; statement location unresolved } { 7F00:299C }
          end; { routine anchor; statement location unresolved } { 7F00:299C }
        else { routine anchor; statement location unresolved } { 7F00:299C }
          if (param_4 = 4) then { routine anchor; statement location unresolved } { 7F00:299C }
            begin { routine anchor; statement location unresolved } { 7F00:299C }
              PString(local_2c, SS) := Copy('to choose from', 1, $28); { 7F00:2A1E }
              uVar8 := UNKNOWN_extraout_AH_03; { routine anchor; statement location unresolved } { 7F00:299C }
            end; { routine anchor; statement location unresolved } { 7F00:299C }
          else { routine anchor; statement location unresolved } { 7F00:299C }
            if (param_4 = 5) then { routine anchor; statement location unresolved } { 7F00:299C }
              begin { routine anchor; statement location unresolved } { 7F00:299C }
                PString(local_2c, SS) := Copy('to be memorized', 1, $28); { 7F00:2A37 }
                uVar8 := UNKNOWN_extraout_AH_04; { routine anchor; statement location unresolved } { 7F00:299C }
              end; { routine anchor; statement location unresolved } { 7F00:299C }
            else { routine anchor; statement location unresolved } { 7F00:299C }
              if (param_4 = 6) then { routine anchor; statement location unresolved } { 7F00:299C }
                begin { routine anchor; statement location unresolved } { 7F00:299C }
                  PString(local_2c, SS) := Copy('to be scribed', 1, $28); { 7F00:2A50 }
                  uVar8 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 7F00:299C }
                end; { routine anchor; statement location unresolved } { 7F00:299C }
              else { routine anchor; statement location unresolved } { 7F00:299C }
                begin { routine anchor; statement location unresolved } { 7F00:299C }
                  local_2c[0] := 0; { routine anchor; statement location unresolved } { 7F00:299C }
                end; { routine anchor; statement location unresolved } { 7F00:299C }
  uVar1 := ov22_059C(Pack16(uVar8, param_4)); { 7F00:2A5F }
  (param_1)^ := ShortInt(uVar1); { routine anchor; statement location unresolved } { 7F00:299C }
  if ((param_1)^ = 0) then { routine anchor; statement location unresolved } { 7F00:299C }
    begin { routine anchor; statement location unresolved } { 7F00:299C }
      local_3 := 0; { 7F00:2AFB }
    end; { routine anchor; statement location unresolved } { 7F00:299C }
  else { routine anchor; statement location unresolved } { 7F00:299C }
    begin { routine anchor; statement location unresolved } { 7F00:299C }
      if ((param_2)^ < 0) then { routine anchor; statement location unresolved } { 7F00:299C }
        begin { routine anchor; statement location unresolved } { 7F00:299C }
          bVar9 := Byte((Word(uVar1) shr 8)); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar2 := Pack16(bVar9, 1); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar3 := Pack16(bVar9, 1); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar4 := Pack16(bVar9, $26); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar5 := Pack16(bVar9, 1); { routine anchor; statement location unresolved } { 7F00:299C }
          iVar7 := (Word(bVar9) shl 8); { routine anchor; statement location unresolved } { 7F00:299C }
          iVar6 := (Word(bVar9) shl 8); { routine anchor; statement location unresolved } { 7F00:299C }
          puVar10 := @(local_2d); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar1 := SS; { routine anchor; statement location unresolved } { 7F00:299C }
          PString(local_2d, SS) := ''; { 7F00:2A9B }
          FUN_03f1_02e8(puVar10, uVar1, iVar6, iVar7, uVar5, uVar4, uVar3, uVar2); { 7F00:2AA0 }
          FUN_00ba_1816(Pack16(UNKNOWN_extraout_AH_06, 1), Pack16(UNKNOWN_extraout_AH_06, 1), Pack16(UNKNOWN_extraout_AH_06, 1), g_5D92, g_5D94); { 7F00:2AB6 }
          iVar7 := ((g_5D92)^ + 4); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar8 := Byte((Word(iVar7) shr 8)); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar2 := Pack16(uVar8, 1); { routine anchor; statement location unresolved } { 7F00:299C }
          uVar3 := Pack16(uVar8, 10); { routine anchor; statement location unresolved } { 7F00:299C }
          puVar10 := local_12c; { routine anchor; statement location unresolved } { 7F00:299C }
          uVar1 := SS; { routine anchor; statement location unresolved } { 7F00:299C }
          PString(BP+65238, SS) := 'Spells '; { 7F00:2AD9 }
          PString(BP+65238, SS) := Copy(PString(BP+65238, SS) + PString(local_2c, SS), 1, 255); { 7F00:2AE3 }
          FUN_0709_0626(puVar10, uVar1, uVar3, uVar2, iVar7); { 7F00:2AE8 }
        end; { routine anchor; statement location unresolved } { 7F00:299C }
      local_3 := ov22_008A(P_Integer(param_2), Integer((LongWord(param_2) shr $10)), param_3); { 7F00:2AF6 }
    end; { routine anchor; statement location unresolved } { 7F00:299C }
  Exit(local_3); { 7F00:2B0A }
end; { routine anchor; statement location unresolved } { 7F00:299C }
```

### ov19:2B0D ov19_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov19_init(); { 7F00:2B0D }
begin { routine anchor; statement location unresolved } { 7F00:2B0D }
  Exit; { 7F00:2B11 }
end; { routine anchor; statement location unresolved } { 7F00:2B0D }
```

### ov24:0000 DispatchEffect (conf H)

Params: active: Byte [BP+6]; nodeOff: Word [BP+8]; nodeSeg: Word [BP+A]; actorOff: Word [BP+C]; actorSeg: Word [BP+E]; effectId: Byte [BP+10].  
Locals: none.  
Callers: FUN_9800_0160,ov24_0026,ov24_0AE7,ov24_175D.  
Callees (export; corrections below): none recorded.

Assembly reconstruction: FF 9D 28 68 is a far indirect CALL through a **direct DS table**, not a far-pointer dereference of g_6828. Three source arguments are pushed actor, node, active. Table slots and callback behavior remain unknown; this call is not ECL dispatch.

```pascal
procedure DispatchEffect(active, nodeOff, nodeSeg, actorOff, actorSeg, effectId); { 9800:0000 }
begin { 9800:0000 }
  EffectProc := FarProcedureAtDS($6828 + Word(effectId) * 4); { 9800:001E }
  EffectProc(FarPtr(actorSeg, actorOff), FarPtr(nodeSeg, nodeOff), active); { 9800:001E }
end; { 9800:0023 }
```

### ov24:0026 RemoveEffect (conf H)

Params: nodeOff: Word [BP+6]; nodeSeg: Word [BP+8]; id: Byte [BP+A]; actor: far pointer [BP+C,+E].  
Locals: node: far pointer [BP-8,-6]; previous: far pointer [BP-4,-2].  
Callers: ov24_0FD2,ov24_100A,ov24_1041,ov24_1081,ov24_1656.  
Callees (export; corrections below): System.FreeMem, DispatchEffect.

Assembly reconstruction fixes the C export�s misleading nil-list Boolean grouping. A supplied non-head node is assumed to belong to actor�s list; if it does not, the original still dereferences the exhausted previous pointer. Do not invent a safety check absent from the binary.

```pascal
procedure RemoveEffect(nodeOff,nodeSeg: Word; id: Byte; actor: FarPtr); { 9800:0026 }
begin { 9800:0026 }
  node := FarPtr(nodeSeg,nodeOff); { 9800:0032 }
  if node = nil then begin { 9800:003B }
    node := FarPtrAt(actor,$7F); { 9800:004C }
    while (node <> nil) and then (ByteAt(node,0) <> id) do { 9800:0052 }
      node := FarPtrAt(node,5); { 9800:0070 }
  end; { 9800:0078 }
  if node <> nil then begin { 9800:007B }
    if ByteAt(node,4) <> 0 then { 9800:0086 }
      DispatchEffect(1,Offset(node),Segment(node),Offset(actor),Segment(actor),id); { 9800:00A1 }
    if FarPtrAt(actor,$7F) = node then { 9800:00B0 }
      SetFarPtrAt(actor,$7F,FarPtrAt(node,5)) { 9800:00C8 }
    else begin { 9800:00D3 }
      previous := FarPtrAt(actor,$7F); { 9800:00DF }
      while (previous <> nil) and then (FarPtrAt(previous,5) <> node) do { 9800:00E5 }
        previous := FarPtrAt(previous,5); { 9800:010D }
      SetFarPtrAt(previous,5,FarPtrAt(node,5)); { 9800:0123 }
    end; { 9800:012B }
    FreeMem(node,9); { 9800:0135 }
  end; { 9800:013A }
end; { 9800:013D }
```

### ov24:0160 FUN_9800_0160 (conf L)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: Word [BP+$08]; param_3: Word [BP+$0A].  
Locals: puVar1: P_Word [compiler temporary; no proven BP slot]; bVar2: Boolean [compiler temporary; no proven BP slot]; cVar3: ShortInt [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; uVar6: Word [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; bVar8: Byte [compiler temporary; no proven BP slot]; bVar9: Boolean [compiler temporary; no proven BP slot]; uVar10: Word [compiler temporary; no proven BP slot]; local_e5: Byte [BP-$E3]; local_e4: Byte [BP-$E2]; local_e2: Word [BP-$E0]; local_e0: Word [BP-$DE]; local_de: Word [BP-$DC]; uStack_dc: Word [BP-$DA]; local_da: array[0..215] of Byte [BP-$D8].  
Callers: ov24_02FA.  
Callees: FUN_00ba_2199, System.@SetIn, System.Move, DispatchEffect, ov30_0909, ov31_0BE7, ov31_0C0F, ov31_0C37, ov31_0C5F.

```pascal
procedure FUN_9800_0160(param_1: ShortInt; param_2: Word; param_3: Word); { 9800:0160 }
begin { routine anchor; statement location unresolved } { 9800:0160 }
  bVar2 := false; { routine anchor; statement location unresolved } { 9800:0160 }
  local_de := g_5D96; { routine anchor; statement location unresolved } { 9800:0160 }
  uStack_dc := g_5D98; { routine anchor; statement location unresolved } { 9800:0160 }
  uVar4 := FUN_00ba_2199(@(local_e2), SS, Pack16(ShortInt((g_5D96 shr 8)), param_1), param_2, param_3); { 9800:018B }
  bVar9 := (ShortInt(uVar4) = 0); { routine anchor; statement location unresolved } { 9800:0160 }
  if bVar9 then { routine anchor; statement location unresolved } { 9800:0160 }
    begin { routine anchor; statement location unresolved } { 9800:0160 }
      Flags.ZF := not (LoByte(param_1) in [21, 45, 46, 49]); { 9800:01A5 }
      uVar4 := UNKNOWN_AXAfterHelper; { 9800:01A5 }
      if not (bVar9) then { routine anchor; statement location unresolved } { 9800:0160 }
        begin { routine anchor; statement location unresolved } { 9800:0160 }
          Move(MemRef(P_Byte(@(g_671B)), $C7C), MemRef(local_da, SS), $D8); { 9800:01BE }
          while (((local_de or uStack_dc) <> 0) and then not (bVar2)) do { routine anchor; statement location unresolved } { 9800:0160 }
            begin { routine anchor; statement location unresolved } { 9800:0160 }
              cVar3 := FUN_00ba_2199(@(local_e2), SS, Pack16(ShortInt(((local_de or uStack_dc) shr 8)), param_1), local_de, uStack_dc); { 9800:01EC }
              if (cVar3 <> 0) then { routine anchor; statement location unresolved } { 9800:0160 }
                begin { routine anchor; statement location unresolved } { 9800:0160 }
                  if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 9800:0160 }
                    begin { routine anchor; statement location unresolved } { 9800:0160 }
                      if (param_1 = 49) then { routine anchor; statement location unresolved } { 9800:0160 }
                        begin { routine anchor; statement location unresolved } { 9800:0160 }
                          local_e5 := 6; { routine anchor; statement location unresolved } { 9800:0160 }
                        end; { routine anchor; statement location unresolved } { 9800:0160 }
                      else { routine anchor; statement location unresolved } { 9800:0160 }
                        begin { routine anchor; statement location unresolved } { 9800:0160 }
                          local_e5 := 1; { routine anchor; statement location unresolved } { 9800:0160 }
                        end; { routine anchor; statement location unresolved } { 9800:0160 }
                      uVar4 := ov31_0BE7(local_de, uStack_dc); { 9800:021C }
                      uVar5 := ov31_0C0F(local_de, uStack_dc); { 9800:022A }
                      uVar6 := Word(local_e5); { routine anchor; statement location unresolved } { 9800:0160 }
                      uVar10 := $FF; { routine anchor; statement location unresolved } { 9800:0160 }
                      uVar7 := ov31_0C37(local_de, uStack_dc); { 9800:0242 }
                      ov30_0909(Word(g_6716), Slice16(g_6716, 2), uVar7, uVar10, uVar6, uVar5, uVar4); { 9800:0250 }
                      bVar8 := g_671A; { routine anchor; statement location unresolved } { 9800:0160 }
                      if (g_671A <> 0) then { routine anchor; statement location unresolved } { 9800:0160 }
                        begin { routine anchor; statement location unresolved } { 9800:0160 }
                          local_e4 := 1; { routine anchor; statement location unresolved } { 9800:0160 }
                          while true do { routine anchor; statement location unresolved } { 9800:0160 }
                            begin { routine anchor; statement location unresolved } { 9800:0160 }
                              cVar3 := ov31_0C5F(param_2, param_3); { 9800:0274 }
                              if ((P_ShortInt(((Integer(P_LongWord(@(g_6716))) + (Word(local_e4) * 3)) + 2)))^ = cVar3) then { routine anchor; statement location unresolved } { 9800:0160 }
                                begin { routine anchor; statement location unresolved } { 9800:0160 }
                                  bVar2 := true; { routine anchor; statement location unresolved } { 9800:0160 }
                                end; { routine anchor; statement location unresolved } { 9800:0160 }
                              if (local_e4 = bVar8) then { routine anchor; statement location unresolved } { 9800:0160 }
                                Break; { routine anchor; statement location unresolved } { 9800:0160 }
                              local_e4 := (local_e4 + 1); { routine anchor; statement location unresolved } { 9800:0160 }
                            end; { routine anchor; statement location unresolved } { 9800:0160 }
                        end; { routine anchor; statement location unresolved } { 9800:0160 }
                    end; { routine anchor; statement location unresolved } { 9800:0160 }
                  else { routine anchor; statement location unresolved } { 9800:0160 }
                    begin { routine anchor; statement location unresolved } { 9800:0160 }
                      bVar2 := true; { routine anchor; statement location unresolved } { 9800:0160 }
                    end; { routine anchor; statement location unresolved } { 9800:0160 }
                end; { routine anchor; statement location unresolved } { 9800:0160 }
              puVar1 := P_Word((local_de + $104)); { routine anchor; statement location unresolved } { 9800:0160 }
              uStack_dc := (P_Word((local_de + $106)))^; { routine anchor; statement location unresolved } { 9800:0160 }
              local_de := (puVar1)^; { routine anchor; statement location unresolved } { 9800:0160 }
            end; { routine anchor; statement location unresolved } { 9800:0160 }
          uVar4 := Move(MemRef(local_da, SS), MemRef(P_Byte(@(g_671B)), $C7C), $D8); { 9800:02CF }
        end; { routine anchor; statement location unresolved } { 9800:0160 }
    end; { routine anchor; statement location unresolved } { 9800:0160 }
  else { routine anchor; statement location unresolved } { 9800:0160 }
    begin { routine anchor; statement location unresolved } { 9800:0160 }
      bVar2 := true; { routine anchor; statement location unresolved } { 9800:0160 }
    end; { routine anchor; statement location unresolved } { 9800:0160 }
  if bVar2 then { routine anchor; statement location unresolved } { 9800:0160 }
    begin { routine anchor; statement location unresolved } { 9800:0160 }
      bVar8 := Byte((Word(uVar4) shr 8)); { routine anchor; statement location unresolved } { 9800:0160 }
      DispatchEffect((Word(bVar8) shl 8), local_e2, local_e0, param_2, param_3, Pack16(bVar8, param_1)); { 9800:02F1 }
    end; { routine anchor; statement location unresolved } { 9800:0160 }
  Exit; { 9800:02F7 }
end; { routine anchor; statement location unresolved } { 9800:0160 }
```

### ov24:02FA VisitEffectHooks (conf M)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08]; param_3: ShortInt [BP+$0A].  
Locals: none.  
Callers: ov24_0C4F,ov24_0CB7,ov24_0D63,ov24_1344,ov24_1656.  
Callees: FUN_9800_0160.

```pascal
procedure VisitEffectHooks(param_1: Word; param_2: Word; param_3: ShortInt); { 9800:02FA }
begin { routine anchor; statement location unresolved } { 9800:02FA }
  if (param_3 = 0) then { routine anchor; statement location unresolved } { 9800:02FA }
    begin { routine anchor; statement location unresolved } { 9800:02FA }
      FUN_9800_0160($7E, param_1, param_2); { 9800:0311 }
    end; { routine anchor; statement location unresolved } { 9800:02FA }
  else { routine anchor; statement location unresolved } { 9800:02FA }
    if (param_3 = 1) then { routine anchor; statement location unresolved } { 9800:02FA }
      begin { routine anchor; statement location unresolved } { 9800:02FA }
        FUN_9800_0160($3F, param_1, param_2); { 9800:0325 }
        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH, $25), param_1, param_2); { 9800:0332 }
        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_00, $19), param_1, param_2); { 9800:033F }
        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_01, $47), param_1, param_2); { 9800:034C }
      end; { routine anchor; statement location unresolved } { 9800:02FA }
    else { routine anchor; statement location unresolved } { 9800:02FA }
      if (param_3 = 2) then { routine anchor; statement location unresolved } { 9800:02FA }
        begin { routine anchor; statement location unresolved } { 9800:02FA }
          FUN_9800_0160($55, param_1, param_2); { 9800:0360 }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_02, $56), param_1, param_2); { 9800:036D }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_03, $57), param_1, param_2); { 9800:037A }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_04, $44), param_1, param_2); { 9800:0387 }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_05, $4F), param_1, param_2); { 9800:0394 }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_06, $50), param_1, param_2); { 9800:03A1 }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_07, $4C), param_1, param_2); { 9800:03AE }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_08, $49), param_1, param_2); { 9800:03BB }
          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_09, $4D), param_1, param_2); { 9800:03C8 }
        end; { routine anchor; statement location unresolved } { 9800:02FA }
      else { routine anchor; statement location unresolved } { 9800:02FA }
        if (param_3 = 3) then { routine anchor; statement location unresolved } { 9800:02FA }
          begin { routine anchor; statement location unresolved } { 9800:02FA }
            FUN_9800_0160($40, param_1, param_2); { 9800:03DF }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_10, $41), param_1, param_2); { 9800:03EC }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_11, $42), param_1, param_2); { 9800:03F9 }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_12, $43), param_1, param_2); { 9800:0406 }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_13, $44), param_1, param_2); { 9800:0413 }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_14, $45), param_1, param_2); { 9800:0420 }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_15, $46), param_1, param_2); { 9800:042D }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_16, $4F), param_1, param_2); { 9800:043A }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_17, $55), param_1, param_2); { 9800:0447 }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_18, $56), param_1, param_2); { 9800:0454 }
            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_19, $57), param_1, param_2); { 9800:0461 }
          end; { routine anchor; statement location unresolved } { 9800:02FA }
        else { routine anchor; statement location unresolved } { 9800:02FA }
          if (param_3 = 4) then { routine anchor; statement location unresolved } { 9800:02FA }
            begin { routine anchor; statement location unresolved } { 9800:02FA }
              FUN_9800_0160($1D, param_1, param_2); { 9800:0475 }
              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_20, 3), param_1, param_2); { 9800:0482 }
              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_21, 6), param_1, param_2); { 9800:048F }
            end; { routine anchor; statement location unresolved } { 9800:02FA }
          else { routine anchor; statement location unresolved } { 9800:02FA }
            if (param_3 = 5) then { routine anchor; statement location unresolved } { 9800:02FA }
              begin { routine anchor; statement location unresolved } { 9800:02FA }
                FUN_9800_0160($1C, param_1, param_2); { 9800:04A6 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_22, $29), param_1, param_2); { 9800:04B3 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_23, $68), param_1, param_2); { 9800:04C0 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_24, $78), param_1, param_2); { 9800:04CD }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_25, $65), param_1, param_2); { 9800:04DA }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_26, $73), param_1, param_2); { 9800:04E7 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_27, $74), param_1, param_2); { 9800:04F4 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_28, $77), param_1, param_2); { 9800:0501 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_29, $7B), param_1, param_2); { 9800:050E }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_30, $60), param_1, param_2); { 9800:051B }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_31, $5E), param_1, param_2); { 9800:0528 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_32, $3C), param_1, param_2); { 9800:0535 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_33, $7A), param_1, param_2); { 9800:0542 }
                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_34, $75), param_1, param_2); { 9800:054F }
              end; { routine anchor; statement location unresolved } { 9800:02FA }
            else { routine anchor; statement location unresolved } { 9800:02FA }
              if (param_3 = 6) then { routine anchor; statement location unresolved } { 9800:02FA }
                begin { routine anchor; statement location unresolved } { 9800:02FA }
                  FUN_9800_0160($71, param_1, param_2); { 9800:0566 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_35, $3D), param_1, param_2); { 9800:0573 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_36, $7A), param_1, param_2); { 9800:0580 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_37, $3C), param_1, param_2); { 9800:058D }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_38, $5B), param_1, param_2); { 9800:059A }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_39, 10), param_1, param_2); { 9800:05A7 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_40, $14), param_1, param_2); { 9800:05B4 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_41, $69), param_1, param_2); { 9800:05C1 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_42, $6A), param_1, param_2); { 9800:05CE }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_43, $70), param_1, param_2); { 9800:05DB }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_44, $72), param_1, param_2); { 9800:05E8 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_45, $76), param_1, param_2); { 9800:05F5 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_46, $11), param_1, param_2); { 9800:0602 }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_47, $5D), param_1, param_2); { 9800:060F }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_48, $65), param_1, param_2); { 9800:061C }
                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_49, $1C), param_1, param_2); { 9800:0629 }
                end; { routine anchor; statement location unresolved } { 9800:02FA }
              else { routine anchor; statement location unresolved } { 9800:02FA }
                if (param_3 = 7) then { routine anchor; statement location unresolved } { 9800:02FA }
                  begin { routine anchor; statement location unresolved } { 9800:02FA }
                    FUN_9800_0160($33, param_1, param_2); { 9800:063D }
                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_50, $34), param_1, param_2); { 9800:064A }
                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_51, $35), param_1, param_2); { 9800:0657 }
                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_52, $1F), param_1, param_2); { 9800:0664 }
                  end; { routine anchor; statement location unresolved } { 9800:02FA }
                else { routine anchor; statement location unresolved } { 9800:02FA }
                  if (param_3 = 8) then { routine anchor; statement location unresolved } { 9800:02FA }
                    begin { routine anchor; statement location unresolved } { 9800:02FA }
                      FUN_9800_0160(99, param_1, param_2); { 9800:0678 }
                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_53, $51), param_1, param_2); { 9800:0685 }
                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_54, $52), param_1, param_2); { 9800:0692 }
                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_55, $59), param_1, param_2); { 9800:069F }
                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_56, $48), param_1, param_2); { 9800:06AC }
                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_57, $38), param_1, param_2); { 9800:06B9 }
                    end; { routine anchor; statement location unresolved } { 9800:02FA }
                  else { routine anchor; statement location unresolved } { 9800:02FA }
                    if (param_3 = 9) then { routine anchor; statement location unresolved } { 9800:02FA }
                      begin { routine anchor; statement location unresolved } { 9800:02FA }
                        FUN_9800_0160($69, param_1, param_2); { 9800:06D0 }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_58, $6A), param_1, param_2); { 9800:06DD }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_59, $6B), param_1, param_2); { 9800:06EA }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_60, $6C), param_1, param_2); { 9800:06F7 }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_61, $6D), param_1, param_2); { 9800:0704 }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_62, $6E), param_1, param_2); { 9800:0711 }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_63, $6F), param_1, param_2); { 9800:071E }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_64, $70), param_1, param_2); { 9800:072B }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_65, $7C), param_1, param_2); { 9800:0738 }
                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_66, $7D), param_1, param_2); { 9800:0745 }
                      end; { routine anchor; statement location unresolved } { 9800:02FA }
                    else { routine anchor; statement location unresolved } { 9800:02FA }
                      if (param_3 = 10) then { routine anchor; statement location unresolved } { 9800:02FA }
                        begin { routine anchor; statement location unresolved } { 9800:02FA }
                          FUN_9800_0160(1, param_1, param_2); { 9800:0759 }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_67, 2), param_1, param_2); { 9800:0766 }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_68, $21), param_1, param_2); { 9800:0773 }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_69, $24), param_1, param_2); { 9800:0780 }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_70, $31), param_1, param_2); { 9800:078D }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_71, 3), param_1, param_2); { 9800:079A }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_72, 6), param_1, param_2); { 9800:07A7 }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_73, $12), param_1, param_2); { 9800:07B4 }
                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_74, $1A), param_1, param_2); { 9800:07C1 }
                        end; { routine anchor; statement location unresolved } { 9800:02FA }
                      else { routine anchor; statement location unresolved } { 9800:02FA }
                        if (param_3 = 11) then { routine anchor; statement location unresolved } { 9800:02FA }
                          begin { routine anchor; statement location unresolved } { 9800:02FA }
                            FUN_9800_0160($21, param_1, param_2); { 9800:07D5 }
                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_75, $11), param_1, param_2); { 9800:07E2 }
                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_76, 8), param_1, param_2); { 9800:07EF }
                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_77, 9), param_1, param_2); { 9800:07FC }
                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_78, $2D), param_1, param_2); { 9800:0809 }
                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_79, $2E), param_1, param_2); { 9800:0816 }
                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_80, $1E), param_1, param_2); { 9800:0823 }
                          end; { routine anchor; statement location unresolved } { 9800:02FA }
                        else { routine anchor; statement location unresolved } { 9800:02FA }
                          if (param_3 = 12) then { routine anchor; statement location unresolved } { 9800:02FA }
                            begin { routine anchor; statement location unresolved } { 9800:02FA }
                              FUN_9800_0160(8, param_1, param_2); { 9800:083A }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_81, 9), param_1, param_2); { 9800:0847 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_82, 10), param_1, param_2); { 9800:0854 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_83, $11), param_1, param_2); { 9800:0861 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_84, $14), param_1, param_2); { 9800:086E }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_85, $21), param_1, param_2); { 9800:087B }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_86, $24), param_1, param_2); { 9800:0888 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_87, $2D), param_1, param_2); { 9800:0895 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_88, $2E), param_1, param_2); { 9800:08A2 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_89, $31), param_1, param_2); { 9800:08AF }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_90, $3D), param_1, param_2); { 9800:08BC }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_91, $6F), param_1, param_2); { 9800:08C9 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_92, $7D), param_1, param_2); { 9800:08D6 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_93, $5A), param_1, param_2); { 9800:08E3 }
                              FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_94, $61), param_1, param_2); { 9800:08F0 }
                            end; { routine anchor; statement location unresolved } { 9800:02FA }
                          else { routine anchor; statement location unresolved } { 9800:02FA }
                            if (param_3 = 13) then { routine anchor; statement location unresolved } { 9800:02FA }
                              begin { routine anchor; statement location unresolved } { 9800:02FA }
                                FUN_9800_0160(99, param_1, param_2); { 9800:0904 }
                                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_95, 100), param_1, param_2); { 9800:0911 }
                                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_96, $67), param_1, param_2); { 9800:091E }
                                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_97, $4B), param_1, param_2); { 9800:092B }
                                FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_98, $4A), param_1, param_2); { 9800:0938 }
                              end; { routine anchor; statement location unresolved } { 9800:02FA }
                            else { routine anchor; statement location unresolved } { 9800:02FA }
                              if (param_3 = 14) then { routine anchor; statement location unresolved } { 9800:02FA }
                                begin { routine anchor; statement location unresolved } { 9800:02FA }
                                  FUN_9800_0160($53, param_1, param_2); { 9800:094C }
                                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_99, $54), param_1, param_2); { 9800:0959 }
                                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00100, $58), param_1, param_2); { 9800:0966 }
                                  FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00101, $79), param_1, param_2); { 9800:0973 }
                                end; { routine anchor; statement location unresolved } { 9800:02FA }
                              else { routine anchor; statement location unresolved } { 9800:02FA }
                                if (param_3 = 15) then { routine anchor; statement location unresolved } { 9800:02FA }
                                  begin { routine anchor; statement location unresolved } { 9800:02FA }
                                    FUN_9800_0160($15, param_1, param_2); { 9800:0987 }
                                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00102, $1E), param_1, param_2); { 9800:0994 }
                                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00103, $4A), param_1, param_2); { 9800:09A1 }
                                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00104, $4B), param_1, param_2); { 9800:09AE }
                                    FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00105, $B), param_1, param_2); { 9800:09BB }
                                  end; { routine anchor; statement location unresolved } { 9800:02FA }
                                else { routine anchor; statement location unresolved } { 9800:02FA }
                                  if (param_3 = 16) then { routine anchor; statement location unresolved } { 9800:02FA }
                                    begin { routine anchor; statement location unresolved } { 9800:02FA }
                                      FUN_9800_0160($19, param_1, param_2); { 9800:09CF }
                                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00106, $47), param_1, param_2); { 9800:09DC }
                                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00107, $25), param_1, param_2); { 9800:09E9 }
                                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00108, $2F), param_1, param_2); { 9800:09F6 }
                                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00109, $30), param_1, param_2); { 9800:0A03 }
                                      FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00110, $59), param_1, param_2); { 9800:0A10 }
                                    end; { routine anchor; statement location unresolved } { 9800:02FA }
                                  else { routine anchor; statement location unresolved } { 9800:02FA }
                                    if (param_3 = 17) then { routine anchor; statement location unresolved } { 9800:02FA }
                                      begin { routine anchor; statement location unresolved } { 9800:02FA }
                                        FUN_9800_0160(1, param_1, param_2); { 9800:0A24 }
                                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00111, 2), param_1, param_2); { 9800:0A31 }
                                        FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00112, $B), param_1, param_2); { 9800:0A3E }
                                      end; { routine anchor; statement location unresolved } { 9800:02FA }
                                    else { routine anchor; statement location unresolved } { 9800:02FA }
                                      if (param_3 = 18) then { routine anchor; statement location unresolved } { 9800:02FA }
                                        begin { routine anchor; statement location unresolved } { 9800:02FA }
                                          FUN_9800_0160($27, param_1, param_2); { 9800:0A51 }
                                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00113, $2A), param_1, param_2); { 9800:0A5E }
                                          FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00114, $3A), param_1, param_2); { 9800:0A6B }
                                        end; { routine anchor; statement location unresolved } { 9800:02FA }
                                      else { routine anchor; statement location unresolved } { 9800:02FA }
                                        if (param_3 = 19) then { routine anchor; statement location unresolved } { 9800:02FA }
                                          begin { routine anchor; statement location unresolved } { 9800:02FA }
                                            FUN_9800_0160($62, param_1, param_2); { 9800:0A7E }
                                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00115, $17), param_1, param_2); { 9800:0A8B }
                                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00116, $48), param_1, param_2); { 9800:0A98 }
                                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00117, $38), param_1, param_2); { 9800:0AA5 }
                                            FUN_9800_0160(Pack16(UNKNOWN_extraout_AH_x00118, $B), param_1, param_2); { 9800:0AB2 }
                                          end; { routine anchor; statement location unresolved } { 9800:02FA }
  Exit; { 9800:0AB8 }
end; { routine anchor; statement location unresolved } { 9800:02FA }
```

### ov24:0AE7 CoughOrNausea (conf H)

Params (stack slots): param_1: LongWord [BP+$06].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; bVar7: Byte [compiler temporary; no proven BP slot]; iVar5: Integer [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; puVar10: P_Byte [compiler temporary; no proven BP slot]; uVar11: Word [compiler temporary; no proven BP slot]; uVar12: Word [compiler temporary; no proven BP slot]; uVar13: Word [compiler temporary; no proven BP slot]; uVar14: Word [compiler temporary; no proven BP slot]; iVar15: Integer [compiler temporary; no proven BP slot]; uVar16: Word [compiler temporary; no proven BP slot]; local_25: array[0..11] of Byte [BP-$23]; local_19: array[0..15] of Byte [BP-$17]; local_9: Byte [BP-$7]; local_8: Word [BP-$6]; local_6: Word [BP-$4]; local_4: Byte [BP-$2]; local_3: ShortInt [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_2199, System.@StrCopy, DispatchEffect, SavingThrow, RollDice, ApplyEffectUnlessUnaffected, ov31_0CB9.

```pascal
procedure CoughOrNausea(param_1: LongWord); { 9800:0AE7 }
begin { routine anchor; statement location unresolved } { 9800:0AE7 }
  uVar9 := Word((LongWord(param_1) shr $10)); { routine anchor; statement location unresolved } { 9800:0AE7 }
  iVar8 := Integer(param_1); { routine anchor; statement location unresolved } { 9800:0AE7 }
  if (((P_ShortInt((iVar8 + $10D)))^ <> 0) and then Sequence(ov31_0CB9(@(local_3), SS, @(local_4), SS, 8, iVar8, uVar9); (local_3 = 30))) then { 9800:0B0E }
    begin { routine anchor; statement location unresolved } { 9800:0AE7 }
      cVar1 := FUN_00ba_2199(@(local_8), SS, Pack16(UNKNOWN_extraout_AH, $1E), iVar8, uVar9); { 9800:0B2A }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 9800:0AE7 }
        begin { routine anchor; statement location unresolved } { 9800:0AE7 }
          cVar1 := FUN_00ba_2199(@(local_8), SS, $1F, iVar8, uVar9); { 9800:0B44 }
          if (cVar1 = 0) then { routine anchor; statement location unresolved } { 9800:0AE7 }
            begin { routine anchor; statement location unresolved } { 9800:0AE7 }
              cVar1 := FUN_00ba_2199(@(local_8), SS, $20, iVar8, uVar9); { 9800:0B5E }
              if (cVar1 = 0) then { routine anchor; statement location unresolved } { 9800:0AE7 }
                begin { routine anchor; statement location unresolved } { 9800:0AE7 }
                  cVar1 := FUN_00ba_2199(@(local_8), SS, $6F, iVar8, uVar9); { 9800:0B78 }
                  if ((cVar1 = 0) and then Sequence((uVar2 := FUN_00ba_2199(@(local_8), SS, $7D, iVar8, uVar9)); (ShortInt(uVar2) = 0))) then { 9800:0B92 }
                    begin { routine anchor; statement location unresolved } { 9800:0AE7 }
                      local_9 := SavingThrow(((uVar2 shr 8) shl 8), ((uVar2 shr 8) shl 8), iVar8, uVar9); { 9800:0BAB }
                      if (local_9 = 0) then { routine anchor; statement location unresolved } { 9800:0AE7 }
                        begin { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar3 := $1F; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          iVar15 := iVar8; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar16 := uVar9; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar2 := RollDice(4, 1); { 9800:0C0C }
                          iVar4 := ((uVar2 and $FF) + 1); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          bVar7 := Byte((Word(iVar4) shr 8)); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar11 := Pack16(bVar7, $FF); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          iVar5 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          iVar6 := (Word(bVar7) shl 8); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar12 := Pack16(bVar7, local_9); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          puVar10 := local_25; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          PString(local_19, SS) := 'chokes and gags from nausea'; { 9800:0BDB }
                          ApplyEffectUnlessUnaffected(puVar10, SS, uVar12, iVar6, iVar5, uVar11, iVar4, uVar3, iVar15, uVar16); { 9800:0BE1 }
                          DispatchEffect((Word(UNKNOWN_extraout_AH_01) shl 8), local_8, local_6, iVar8, uVar9, Pack16(UNKNOWN_extraout_AH_01, $1F)); { 9800:0BF7 }
                        end; { routine anchor; statement location unresolved } { 9800:0AE7 }
                      else { routine anchor; statement location unresolved } { 9800:0AE7 }
                        begin { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar3 := $1E; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar14 := 1; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar13 := $FF; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar12 := 0; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar11 := 0; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar2 := Word(local_9); { routine anchor; statement location unresolved } { 9800:0AE7 }
                          puVar10 := local_19; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          iVar15 := iVar8; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          uVar16 := uVar9; { routine anchor; statement location unresolved } { 9800:0AE7 }
                          PString(local_25, SS) := 'starts to cough'; { 9800:0C2A }
                          ApplyEffectUnlessUnaffected(puVar10, SS, uVar2, uVar11, uVar12, uVar13, uVar14, uVar3, iVar15, uVar16); { 9800:0C30 }
                          DispatchEffect((Word(UNKNOWN_extraout_AH_00) shl 8), local_8, local_6, iVar8, uVar9, Pack16(UNKNOWN_extraout_AH_00, $1E)); { 9800:0C46 }
                        end; { routine anchor; statement location unresolved } { 9800:0AE7 }
                    end; { routine anchor; statement location unresolved } { 9800:0AE7 }
                end; { routine anchor; statement location unresolved } { 9800:0AE7 }
            end; { routine anchor; statement location unresolved } { 9800:0AE7 }
        end; { routine anchor; statement location unresolved } { 9800:0AE7 }
    end; { routine anchor; statement location unresolved } { 9800:0AE7 }
  Exit; { 9800:0C4C }
end; { routine anchor; statement location unresolved } { 9800:0AE7 }
```

### ov24:0C4F ov24_0C4F (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: LongWord [BP+$08].  
Locals: local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: VisitEffectHooks, RollDice.

```pascal
function ov24_0C4F(param_1: Byte; param_2: LongWord): Byte; { 9800:0C4F }
begin { routine anchor; statement location unresolved } { 9800:0C4F }
  local_3 := 0; { 9800:0C55 }
  g_6822 := RollDice($14, 1); { 9800:0C60 }
  if (1 < g_6822) then { routine anchor; statement location unresolved } { 9800:0C4F }
    begin { routine anchor; statement location unresolved } { 9800:0C4F }
      if (g_6822 = 20) then { routine anchor; statement location unresolved } { 9800:0C4F }
        begin { routine anchor; statement location unresolved } { 9800:0C4F }
          g_6822 := 100; { 9800:0C74 }
        end; { routine anchor; statement location unresolved } { 9800:0C4F }
      VisitEffectHooks(Integer(param_2), Slice16(param_2, 2), $10); { 9800:0C83 }
      if ((-(1) < g_6822) and then (Integer(Word((P_Byte((Integer(param_2) + $111)))^)) < Integer((Integer(g_6822) + Word(param_1))))) then { routine anchor; statement location unresolved } { 9800:0C4F }
        begin { routine anchor; statement location unresolved } { 9800:0C4F }
          local_3 := 1; { 9800:0CAA }
        end; { routine anchor; statement location unresolved } { 9800:0C4F }
    end; { routine anchor; statement location unresolved } { 9800:0C4F }
  Exit(local_3); { 9800:0CB4 }
end; { routine anchor; statement location unresolved } { 9800:0C4F }
```

### ov24:0CB7 ov24_0CB7 (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Word [BP+$08]; param_3: Word [BP+$0A]; param_4: LongWord [BP+$0C].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; local_4: ShortInt [BP-$2]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: VisitEffectHooks, RollDice, ov24_0FD2.

```pascal
function ov24_0CB7(param_1: Byte; param_2: Word; param_3: Word; param_4: LongWord): Byte; { 9800:0CB7 }
begin { routine anchor; statement location unresolved } { 9800:0CB7 }
  local_3 := 0; { 9800:0CBD }
  ov24_0FD2(Integer(param_4), Slice16(param_4, 2)); { 9800:0CC8 }
  g_6822 := RollDice(Pack16(UNKNOWN_extraout_AH, $14), Pack16(UNKNOWN_extraout_AH, 1)); { 9800:0CD2 }
  if (1 < g_6822) then { routine anchor; statement location unresolved } { 9800:0CB7 }
    begin { routine anchor; statement location unresolved } { 9800:0CB7 }
      if (g_6822 = 20) then { routine anchor; statement location unresolved } { 9800:0CB7 }
        begin { routine anchor; statement location unresolved } { 9800:0CB7 }
          g_6822 := 100; { 9800:0CE6 }
        end; { routine anchor; statement location unresolved } { 9800:0CB7 }
      VisitEffectHooks(Integer(param_4), Slice16(param_4, 2), 10); { 9800:0CF5 }
      VisitEffectHooks(param_2, param_3, Pack16(UNKNOWN_extraout_AH_00, $10)); { 9800:0D02 }
      uVar1 := Word((LongWord(g_49D6) shr $10)); { routine anchor; statement location unresolved } { 9800:0CB7 }
      if ((P_ShortInt((Integer(param_4) + $10E)))^ = 0) then { routine anchor; statement location unresolved } { 9800:0CB7 }
        begin { routine anchor; statement location unresolved } { 9800:0CB7 }
          local_4 := (P_ShortInt((Integer(g_49D6) + $6E2)))^; { 9800:0D19 }
        end; { routine anchor; statement location unresolved } { 9800:0CB7 }
      else { routine anchor; statement location unresolved } { 9800:0CB7 }
        begin { routine anchor; statement location unresolved } { 9800:0CB7 }
          local_4 := (P_ShortInt((Integer(g_49D6) + $6E0)))^; { 9800:0D27 }
        end; { routine anchor; statement location unresolved } { 9800:0CB7 }
      if ((-(1) < g_6822) and then (Integer(Word(param_1)) <= Integer(((Integer(g_6822) + Word((P_Byte((Integer(param_4) + $110)))^)) + Integer(local_4))))) then { routine anchor; statement location unresolved } { 9800:0CB7 }
        begin { routine anchor; statement location unresolved } { 9800:0CB7 }
          local_3 := 1; { 9800:0D56 }
        end; { routine anchor; statement location unresolved } { 9800:0CB7 }
    end; { routine anchor; statement location unresolved } { 9800:0CB7 }
  Exit(local_3); { 9800:0D60 }
end; { routine anchor; statement location unresolved } { 9800:0CB7 }
```

### ov24:0D63 SavingThrow (conf H)

Params: modifier: ShortInt [BP+6]; saveKind: ShortInt [BP+8]; actor: far pointer [BP+A,+C].  
Locals: result: Boolean [BP-1].  
Callers: ov24_0AE7.  
Callees (export; corrections below): VisitEffectHooks, RollDice.

Assembly reconstructed: natural 1 fails, 20 succeeds before hooks; other rolls wrap to byte before hook 12. Final comparison uses unsigned JA, saveKind is sign-extended for indexing.

```pascal
function SavingThrow(modifier, saveKind: ShortInt; actor: FarPtr): Boolean; { 9800:0D63 }
begin { 9800:0D63 }
  g_6816 := RollDice(20, 1); { 9800:0D70 }
  if g_6816 = 1 then { 9800:0D79 }
    SavingThrow := False { 9800:0D7D }
  else if g_6816 = 20 then { 9800:0D83 }
    SavingThrow := True { 9800:0D87 }
  else begin { 9800:0D8D }
    g_6816 := Byte(g_6816 + SignedByteAt(actor,$101) + modifier); { 9800:0DA7 }
    g_682A := Byte(saveKind); { 9800:0DAD }
    VisitEffectHooks(Offset(actor), Segment(actor), 12); { 9800:0DBA }
    SavingThrow := g_6816 >= ByteAt(actor,$6D + saveKind); { 9800:0DCA }
  end; { 9800:0DDA }
end; { 9800:0DE0 }
```

### ov24:0DE3 RollDice (conf H)

Params: sides: Byte [BP+6]; count: Byte [BP+8].  
Locals: total: Byte [BP-3]; loop bound: Byte [BP-4]; i: Byte [BP-2]; result: Byte [BP-1].  
Callers: ov24_0AE7,ov24_0C4F,ov24_0CB7,ov24_0D63,ov24_0E2E.  
Callees (export; corrections below): System.RandomWord.

Assembly reconstructed. Pseudocode keeps stack-slot argument order for compatibility with the other draft calls; original Pascal order is (count,sides). Count and sides are unsigned bytes despite the decompiler char types; result wraps modulo 256. Zero-count loop executes zero times. Random(0) behavior belongs to the runtime contract.

```pascal
function RollDice(sides, count: Byte): Byte; { 9800:0DE3 }
begin { 9800:0DE3 }
  total := 0; { 9800:0DE9 }
  for i := 1 to count do { 9800:0DED }
    total := Byte(total + Random(sides) + 1); { 9800:0E0E }
  RollDice := total; { 9800:0E22 }
end; { 9800:0E2B }
```

### ov24:0E2E RollDiceWithCount (conf H)

Params: sides: Byte [BP+6]; count: Byte [BP+8].  
Locals: result: Byte [BP-1].  
Callers: none recorded.  
Callees (export; corrections below): RollDice.

Assembly reconstructed. g_681C retains count for effect/damage consumers; the called helper uses the same stack-slot convention.

```pascal
function RollDiceWithCount(sides, count: Byte): Byte; { 9800:0E2E }
begin { 9800:0E2E }
  g_681C := count; { 9800:0E37 }
  RollDiceWithCount := RollDice(sides, count); { 9800:0E43 }
end; { 9800:0E4F }
```

### ov24:0E52 AppendEffect (conf H)

Params: active: Byte [BP+6]; data: Byte [BP+8]; duration: Word [BP+A]; id: Byte [BP+C]; actor: far pointer [BP+E,+10].  
Locals: node: far pointer [BP-4,-2]; previous: far pointer [BP-8,-6].  
Callers: ov24_1656.  
Callees (export; corrections below): System.GetMem.

Assembly reconstructed, source-level GetMem and complete nine-byte layout. Caller is responsible for duplicate-id policy; no uniqueness check here.

```pascal
procedure AppendEffect(active, data: Byte; duration: Word; id: Byte; actor: FarPtr); { 9800:0E52 }
begin { 9800:0E52 }
  GetMem(node, 9); { 9800:0E5C }
  if FarPtrAt(actor,$7F) = nil then { 9800:0E6E }
    SetFarPtrAt(actor,$7F,node) { 9800:0E7E }
  else begin { 9800:0E89 }
    previous := FarPtrAt(actor,$7F); { 9800:0E95 }
    while FarPtrAt(previous,5) <> nil do { 9800:0E9E }
      previous := FarPtrAt(previous,5); { 9800:0EB3 }
    SetFarPtrAt(previous,5,node); { 9800:0EC4 }
  end; { 9800:0ECC }
  SetFarPtrAt(node,5,nil); { 9800:0ED1 }
  ByteAt(node,0) := id; { 9800:0EDF }
  WordAt(node,1) := duration; { 9800:0EE8 }
  ByteAt(node,4) := active; { 9800:0EF2 }
  ByteAt(node,3) := data; { 9800:0EFC }
end; { 9800:0F03 }
```

### ov24:0F06 ov24_0F06 (conf L)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: Byte [BP+$0A]; param_3: LongWord [BP+$0C].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; bVar3: Byte [compiler temporary; no proven BP slot]; iVar4: Integer [compiler temporary; no proven BP slot]; uVar5: Word [compiler temporary; no proven BP slot]; local_2b: array[0..40] of Byte [BP-$29].  
Callers: none recorded.  
Callees: FUN_00ba_16ec, FUN_00ba_2637, FUN_0464_1b52, System.@StrAssign, ov24_100A, ov31_03A0, ov31_052B, ov31_0C5F, ov31_1298.

```pascal
procedure ov24_0F06(param_1: LongWord; param_2: Byte; param_3: LongWord); { 9800:0F06 }
begin { routine anchor; statement location unresolved } { 9800:0F06 }
  PString(local_2b, SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $28); { 9800:0F1A }
  uVar5 := Word((LongWord(param_3) shr $10)); { routine anchor; statement location unresolved } { 9800:0F06 }
  iVar4 := Integer(param_3); { routine anchor; statement location unresolved } { 9800:0F06 }
  if ((P_ShortInt((iVar4 + $10D)))^ <> 0) then { routine anchor; statement location unresolved } { 9800:0F06 }
    begin { routine anchor; statement location unresolved } { 9800:0F06 }
      uVar2 := ov31_0C5F(iVar4, uVar5); { 9800:0F33 }
      bVar3 := Byte((uVar2 shr 8)); { routine anchor; statement location unresolved } { 9800:0F06 }
      ov31_1298((Word(bVar3) shl 8), Pack16(bVar3, 3), iVar4, uVar5); { 9800:0F47 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), local_2b, SS, iVar4, uVar5); { 9800:0F5D }
      (P_Byte((iVar4 + $10D)))^ := 0; { routine anchor; statement location unresolved } { 9800:0F06 }
      (P_Byte((iVar4 + $10C)))^ := param_2; { routine anchor; statement location unresolved } { 9800:0F06 }
      if ((P_ShortInt((iVar4 + $10C)))^ <> 3) then { routine anchor; statement location unresolved } { 9800:0F06 }
        begin { routine anchor; statement location unresolved } { 9800:0F06 }
          (P_Byte((iVar4 + $11B)))^ := 0; { routine anchor; statement location unresolved } { 9800:0F06 }
        end; { routine anchor; statement location unresolved } { 9800:0F06 }
      ov31_052B(Pack16(UNKNOWN_extraout_AH_00, ShortInt(uVar2)), (Word(UNKNOWN_extraout_AH_00) shl 8), (Word(UNKNOWN_extraout_AH_00) shl 8)); { 9800:0F94 }
      FUN_0464_1b52(); { 9800:0F99 }
      P_Byte(@(g_5F2A))[((uVar2 and $FF) * 4)] := 0; { routine anchor; statement location unresolved } { 9800:0F06 }
      ov31_03A0(); { 9800:0FAE }
      cVar1 := FUN_00ba_2637(iVar4, uVar5); { 9800:0FB9 }
      if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 9800:0F06 }
        begin { routine anchor; statement location unresolved } { 9800:0F06 }
          ov24_100A(iVar4, uVar5); { 9800:0FC9 }
        end; { routine anchor; statement location unresolved } { 9800:0F06 }
    end; { routine anchor; statement location unresolved } { 9800:0F06 }
  Exit; { 9800:0FCF }
end; { routine anchor; statement location unresolved } { 9800:0F06 }
```

### ov24:0FD2 ov24_0FD2 (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; local_6: Word [BP-$4]; local_4: Word [BP-$2].  
Callers: ov24_0CB7.  
Callees: FUN_00ba_2199, RemoveEffect.

```pascal
procedure ov24_0FD2(param_1: Word; param_2: Word); { 9800:0FD2 }
begin { routine anchor; statement location unresolved } { 9800:0FD2 }
  while true do { routine anchor; statement location unresolved } { 9800:0FD2 }
    begin { routine anchor; statement location unresolved } { 9800:0FD2 }
      cVar1 := FUN_00ba_2199(@(local_6), SS, $19, param_1, param_2); { 9800:0FE6 }
      if (cVar1 = 0) then { routine anchor; statement location unresolved } { 9800:0FD2 }
        Break; { routine anchor; statement location unresolved } { 9800:0FD2 }
      RemoveEffect(local_6, local_4, $19, param_1, param_2); { 9800:0FFF }
    end; { routine anchor; statement location unresolved } { 9800:0FD2 }
  Exit; { 9800:1007 }
end; { routine anchor; statement location unresolved } { 9800:0FD2 }
```

### ov24:100A ov24_100A (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: local_3: Byte [BP-$1].  
Callers: ov24_0F06,ov24_1344.  
Callees: RemoveEffect.

```pascal
procedure ov24_100A(param_1: Word; param_2: Word); { 9800:100A }
begin { routine anchor; statement location unresolved } { 9800:100A }
  local_3 := 1; { 9800:1010 }
  while true do { routine anchor; statement location unresolved } { 9800:100A }
    begin { routine anchor; statement location unresolved } { 9800:100A }
      RemoveEffect(0, 0, (P_Byte((local_3 + $C13)))^, param_1, param_2); { 9800:1032 }
      if (local_3 = $10) then { routine anchor; statement location unresolved } { 9800:100A }
        Break; { routine anchor; statement location unresolved } { 9800:100A }
      local_3 := (local_3 + 1); { 9800:1016 }
    end; { routine anchor; statement location unresolved } { 9800:100A }
  Exit; { 9800:103E }
end; { routine anchor; statement location unresolved } { 9800:100A }
```

### ov24:1041 ov24_1041 (conf L)

Params (stack slots): param_1: Word [BP+$06]; param_2: Word [BP+$08].  
Locals: local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: RemoveEffect.

```pascal
procedure ov24_1041(param_1: Word; param_2: Word); { 9800:1041 }
begin { routine anchor; statement location unresolved } { 9800:1041 }
  local_3 := 1; { 9800:1047 }
  while true do { routine anchor; statement location unresolved } { 9800:1041 }
    begin { routine anchor; statement location unresolved } { 9800:1041 }
      RemoveEffect(0, 0, (P_Byte((local_3 + $C23)))^, param_1, param_2); { 9800:1069 }
      if (local_3 = 2) then { routine anchor; statement location unresolved } { 9800:1041 }
        Break; { routine anchor; statement location unresolved } { 9800:1041 }
      local_3 := (local_3 + 1); { 9800:104D }
    end; { routine anchor; statement location unresolved } { 9800:1041 }
  Exit; { 9800:1075 }
end; { routine anchor; statement location unresolved } { 9800:1041 }
```

### ov24:1081 ReportCured (conf M)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Word [BP+$08]; param_3: Word [BP+$0A].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; puVar2: P_Byte [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_10: array[0..8] of Byte [BP-$E]; local_7: Word [BP-$5]; local_5: Word [BP-$3]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_16ec, FUN_00ba_2199, System.@StrCopy, RemoveEffect.

```pascal
function ReportCured(param_1: Byte; param_2: Word; param_3: Word): Byte; { 9800:1081 }
begin { routine anchor; statement location unresolved } { 9800:1081 }
  local_3 := 0; { 9800:1087 }
  cVar1 := FUN_00ba_2199(@(local_7), SS, param_1, param_2, param_3); { 9800:109A }
  if (cVar1 <> 0) then { routine anchor; statement location unresolved } { 9800:1081 }
    begin { routine anchor; statement location unresolved } { 9800:1081 }
      puVar2 := local_10; { routine anchor; statement location unresolved } { 9800:1081 }
      uVar3 := param_2; { routine anchor; statement location unresolved } { 9800:1081 }
      uVar4 := param_3; { routine anchor; statement location unresolved } { 9800:1081 }
      PString(local_10, SS) := 'is Cured'; { 9800:10B3 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH, 1), Pack16(UNKNOWN_extraout_AH, 10), puVar2, SS, uVar3, uVar4); { 9800:10BE }
      RemoveEffect(local_7, local_5, Pack16(UNKNOWN_extraout_AH_00, param_1), param_2, param_3); { 9800:10D4 }
      local_3 := 1; { 9800:10D7 }
    end; { routine anchor; statement location unresolved } { 9800:1081 }
  Exit(local_3); { 9800:10E1 }
end; { routine anchor; statement location unresolved } { 9800:1081 }
```

### ov24:10E4 ov24_10E4 (conf L)

Params (stack slots): param_1: Byte [BP+$06]; param_2: Byte [BP+$08].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; local_3: Byte [BP-$1].  
Callers: ov24_115C.  
Callees: none recorded.

```pascal
function ov24_10E4(param_1: Byte; param_2: Byte): Word; { 9800:10E4 }
begin { routine anchor; statement location unresolved } { 9800:10E4 }
  iVar1 := (param_2 + 100); { routine anchor; statement location unresolved } { 9800:10E4 }
  local_3 := Byte(iVar1); { 9800:10F2 }
  if (param_2 = $12) then { routine anchor; statement location unresolved } { 9800:10E4 }
    begin { routine anchor; statement location unresolved } { 9800:10E4 }
      iVar1 := (param_1 + 1); { routine anchor; statement location unresolved } { 9800:10E4 }
      local_3 := Byte(iVar1); { 9800:1101 }
    end; { routine anchor; statement location unresolved } { 9800:10E4 }
  Exit(Pack16(ShortInt((Word(iVar1) shr 8)), local_3)); { 9800:110A }
end; { routine anchor; statement location unresolved } { 9800:10E4 }
```

### ov24:110D ov24_110D (conf L)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: P_Byte [BP+$0A]; param_3: LongWord [BP+$0E].  
Locals: none.  
Callers: ov24_115C.  
Callees: none recorded.

```pascal
procedure ov24_110D(param_1: P_ShortInt; param_2: P_Byte; param_3: LongWord); { 9800:110D }
begin { routine anchor; statement location unresolved } { 9800:110D }
  (param_1)^ := 0; { routine anchor; statement location unresolved } { 9800:110D }
  (param_2)^ := ((P_Byte((Integer(param_3) + 3)))^ and $7F); { routine anchor; statement location unresolved } { 9800:110D }
  if ((param_2)^ < $66) then { routine anchor; statement location unresolved } { 9800:110D }
    begin { routine anchor; statement location unresolved } { 9800:110D }
      (param_1)^ := ((param_2)^ - 1); { routine anchor; statement location unresolved } { 9800:110D }
      (param_2)^ := $12; { routine anchor; statement location unresolved } { 9800:110D }
    end; { routine anchor; statement location unresolved } { 9800:110D }
  else { routine anchor; statement location unresolved } { 9800:110D }
    begin { routine anchor; statement location unresolved } { 9800:110D }
      (param_2)^ := ((param_2)^ + $9C); { routine anchor; statement location unresolved } { 9800:110D }
    end; { routine anchor; statement location unresolved } { 9800:110D }
  Exit; { 9800:1159 }
end; { routine anchor; statement location unresolved } { 9800:110D }
```

### ov24:115C ov24_115C (conf L)

Params (stack slots): param_1: P_ShortInt [BP+$06]; param_2: Byte [BP+$0A]; param_3: Byte [BP+$0C]; param_4: LongWord [BP+$0E].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; local_d: Byte [BP-$B]; local_c: Byte [BP-$A]; local_b: LongWord [BP-$9]; local_7: LongWord [BP-$5]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_0bb8, ov24_10E4, ov24_110D.

```pascal
function ov24_115C(param_1: P_ShortInt; param_2: Byte; param_3: Byte; param_4: LongWord): Byte; { 9800:115C }
begin { routine anchor; statement location unresolved } { 9800:115C }
  uVar4 := Word((LongWord(param_4) shr $10)); { routine anchor; statement location unresolved } { 9800:115C }
  iVar3 := Integer(param_4); { routine anchor; statement location unresolved } { 9800:115C }
  local_c := (P_Byte((iVar3 + $10)))^; { 9800:1169 }
  local_d := (P_Byte((iVar3 + $16)))^; { 9800:1173 }
  if ((param_3 < local_c) or else ((param_3 = $12) and then (param_2 < local_d))) then { routine anchor; statement location unresolved } { 9800:115C }
    begin { routine anchor; statement location unresolved } { 9800:115C }
      local_3 := 0; { 9800:118C }
      cVar1 := ov24_10E4(param_2, param_3); { 9800:1199 }
      (param_1)^ := (cVar1 + -($80)); { routine anchor; statement location unresolved } { 9800:115C }
    end; { routine anchor; statement location unresolved } { 9800:115C }
  else { routine anchor; statement location unresolved } { 9800:115C }
    begin { routine anchor; statement location unresolved } { 9800:115C }
      local_b := P_ShortInt($0); { 9800:11AC }
      local_7 := P_ShortInt(FarBits((P_Word((iVar3 + $81)))^, P_ShortInt((P_Word((iVar3 + $7F)))^))); { 9800:11BE }
      while ((P_ShortInt(local_7) <> P_ShortInt($0)) or else ((Slice16(local_7, 2) <> 0) and then ((P_ShortInt(local_b) = P_ShortInt($0)) and then (Slice16(local_b, 2) = 0)))) do { routine anchor; statement location unresolved } { 9800:115C }
        begin { routine anchor; statement location unresolved } { 9800:115C }
          if ((((local_7)^ = 12) or else ((local_7)^ = 38)) and then (Byte(P_ShortInt(local_7)[3]) < $80)) then { routine anchor; statement location unresolved } { 9800:115C }
            begin { routine anchor; statement location unresolved } { 9800:115C }
              local_b := local_7; { 9800:11F6 }
            end; { routine anchor; statement location unresolved } { 9800:115C }
          local_7 := P_ShortInt(FarBits((P_Word((P_ShortInt(local_7) + 7)))^, (P_P_ShortInt((P_ShortInt(local_7) + 5)))^)); { 9800:1207 }
        end; { routine anchor; statement location unresolved } { 9800:115C }
      if ((Word(P_ShortInt(local_b)) or Slice16(local_b, 2)) <> 0) then { routine anchor; statement location unresolved } { 9800:115C }
        begin { routine anchor; statement location unresolved } { 9800:115C }
          uVar2 := Byte(((Word(P_ShortInt(local_b)) or Slice16(local_b, 2)) shr 8)); { routine anchor; statement location unresolved } { 9800:115C }
          cVar1 := ov24_10E4(Pack16(uVar2, local_d), Pack16(uVar2, local_c)); { 9800:1220 }
          ov24_110D(@(local_d), SS, @(local_c), SS, P_ShortInt(local_b), Slice16(local_b, 2)); { 9800:1237 }
          P_ShortInt(local_b)[3] := (cVar1 + -($80)); { routine anchor; statement location unresolved } { 9800:115C }
        end; { routine anchor; statement location unresolved } { 9800:115C }
      (P_Byte((iVar3 + $10)))^ := param_3; { routine anchor; statement location unresolved } { 9800:115C }
      (P_Byte((iVar3 + $16)))^ := param_2; { routine anchor; statement location unresolved } { 9800:115C }
      FUN_00ba_0bb8(iVar3, uVar4); { 9800:1263 }
      cVar1 := ov24_10E4(Pack16(UNKNOWN_extraout_AH, local_d), Pack16(UNKNOWN_extraout_AH, local_c)); { 9800:1271 }
      (param_1)^ := cVar1; { routine anchor; statement location unresolved } { 9800:115C }
      local_3 := 1; { 9800:127A }
    end; { routine anchor; statement location unresolved } { 9800:115C }
  Exit(local_3); { 9800:1284 }
end; { routine anchor; statement location unresolved } { 9800:115C }
```

### ov24:1344 ApplyTypedDamage (conf M)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: ShortInt [BP+$08]; param_3: Byte [BP+$0A]; param_4: LongWord [BP+$0C].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; uVar3: Byte [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar4: Byte [compiler temporary; no proven BP slot]; puVar5: P_Byte [compiler temporary; no proven BP slot]; puVar6: P_Byte [compiler temporary; no proven BP slot]; uVar7: Word [compiler temporary; no proven BP slot]; iVar8: Integer [compiler temporary; no proven BP slot]; uVar9: Word [compiler temporary; no proven BP slot]; local_302: array[0..255] of Byte [BP-$300]; local_202: array[0..242] of Byte [BP-$200]; local_10f: array[0..12] of Byte [BP-$10D]; local_102: array[0..255] of Byte [BP-$100].  
Callers: none recorded.  
Callees: FUN_00ba_1037, FUN_00ba_148b, FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_1feb, FUN_00ba_2228, FUN_0709_0dbe, System.@SetIn, System.@StrAppend, System.@StrAssign, System.@StrCopy, VisitEffectHooks, ov24_100A, ov31_0E11.

M: g_6818 is pending damage; effect hook 6 can alter it; save-result 1 zeroes, 2 halves when enabled. Damage type g_6819 selects fire/cold/electricity/acid/magic text. Death/status and lost-spell messages follow. SetIn-dependent killed predicate remains unresolved.

```pascal
procedure ApplyTypedDamage(param_1: ShortInt; param_2: ShortInt; param_3: Byte; param_4: LongWord); { 9800:1344 }
begin { routine anchor; statement location unresolved } { 9800:1344 }
  g_6818 := param_3; { 9800:134E }
  VisitEffectHooks(Integer(param_4), Slice16(param_4, 2), 6); { 9800:135B }
  if (param_1 <> 0) then { routine anchor; statement location unresolved } { 9800:1344 }
    begin { routine anchor; statement location unresolved } { 9800:1344 }
      if (param_2 = 1) then { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          g_6818 := 0; { 9800:136B }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      else { routine anchor; statement location unresolved } { 9800:1344 }
        if (param_2 = 2) then { routine anchor; statement location unresolved } { 9800:1344 }
          begin { routine anchor; statement location unresolved } { 9800:1344 }
            g_6818 := (g_6818 shr 1); { 9800:137D }
          end; { routine anchor; statement location unresolved } { 9800:1344 }
    end; { routine anchor; statement location unresolved } { 9800:1344 }
  if (g_6818 <> 0) then { routine anchor; statement location unresolved } { 9800:1344 }
    begin { routine anchor; statement location unresolved } { 9800:1344 }
      if (g_6818 = 1) then { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          PString(local_102, SS) := Copy('takes 1 point of damage ', 1, $FF); { 9800:13C9 }
          uVar3 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 9800:1344 }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      else { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          puVar6 := local_302; { routine anchor; statement location unresolved } { 9800:1344 }
          uVar9 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
          PString(BP+64768, SS) := 'takes '; { 9800:139C }
          puVar5 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
          uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
          FUN_00ba_1037(Pack16(UNKNOWN_extraout_AH, g_6818)); { 9800:13AB }
          PString(BP+64768, SS) := Copy(PString(BP+64768, SS) + PString(puVar5, uVar7), 1, 255); { 9800:13B0 }
          PString(BP+64768, SS) := Copy(PString(BP+64768, SS) + ' points of damage ', 1, 255); { 9800:13BA }
          PString(local_102, SS) := Copy(PString(puVar6, uVar9), 1, $FF); { 9800:13DF }
          uVar3 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 9800:1344 }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      uVar2 := (Pack16(uVar3, g_6819) and $FFF7); { routine anchor; statement location unresolved } { 9800:1344 }
      cVar1 := ShortInt(uVar2); { routine anchor; statement location unresolved } { 9800:1344 }
      if (cVar1 = 1) then { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          puVar6 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
          uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
          PString(BP+65280, SS) := PString(local_102, SS); { 9800:13F9 }
          PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + 'from Fire', 1, 255); { 9800:1403 }
          PString(local_102, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 9800:1412 }
          uVar2 := UNKNOWN_AXAfterHelper; { 9800:1412 }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      else { routine anchor; statement location unresolved } { 9800:1344 }
        if (cVar1 = 2) then { routine anchor; statement location unresolved } { 9800:1344 }
          begin { routine anchor; statement location unresolved } { 9800:1344 }
            puVar6 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
            uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
            PString(BP+65280, SS) := PString(local_102, SS); { 9800:142A }
            PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + 'from Cold', 1, 255); { 9800:1434 }
            PString(local_102, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 9800:1443 }
            uVar2 := UNKNOWN_AXAfterHelper; { 9800:1443 }
          end; { routine anchor; statement location unresolved } { 9800:1344 }
        else { routine anchor; statement location unresolved } { 9800:1344 }
          if (cVar1 = 4) then { routine anchor; statement location unresolved } { 9800:1344 }
            begin { routine anchor; statement location unresolved } { 9800:1344 }
              puVar6 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
              uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
              PString(BP+65280, SS) := PString(local_102, SS); { 9800:145A }
              PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + 'from Electricity', 1, 255); { 9800:1464 }
              PString(local_102, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 9800:1473 }
              uVar2 := UNKNOWN_AXAfterHelper; { 9800:1473 }
            end; { routine anchor; statement location unresolved } { 9800:1344 }
          else { routine anchor; statement location unresolved } { 9800:1344 }
            if (cVar1 = 16) then { routine anchor; statement location unresolved } { 9800:1344 }
              begin { routine anchor; statement location unresolved } { 9800:1344 }
                puVar6 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
                uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
                PString(BP+65280, SS) := PString(local_102, SS); { 9800:148A }
                PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + 'from Acid', 1, 255); { 9800:1494 }
                PString(local_102, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 9800:14A3 }
                uVar2 := UNKNOWN_AXAfterHelper; { 9800:14A3 }
              end; { routine anchor; statement location unresolved } { 9800:1344 }
      uVar2 := (Pack16(ShortInt((uVar2 shr 8)), g_6819) and $FF08); { routine anchor; statement location unresolved } { 9800:1344 }
      if (ShortInt(uVar2) = g_6819) then { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          puVar6 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
          uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
          PString(BP+65280, SS) := PString(local_102, SS); { 9800:14BF }
          PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + 'from Magic', 1, 255); { 9800:14C9 }
          PString(local_102, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 9800:14D8 }
          uVar2 := UNKNOWN_AXAfterHelper; { 9800:14D8 }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      FUN_00ba_1feb(local_102, SS, (uVar2 and $FF00), Integer(param_4), Slice16(param_4, 2)); { 9800:14EC }
      FUN_00ba_2228(Pack16(UNKNOWN_extraout_AH_02, g_6818), Integer(param_4), Slice16(param_4, 2)); { 9800:14FB }
      if ((g_49F3 = 5) and then Sequence(((P_Byte((Integer((P_LongWord((Integer(param_4) + $108)))^) + 1)))^ := 0); ((P_ShortInt((P_LongWord((Integer(param_4) + $108)))^))^ <> 0))) then { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          puVar6 := local_10f; { routine anchor; statement location unresolved } { 9800:1344 }
          uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
          iVar8 := Integer(param_4); { routine anchor; statement location unresolved } { 9800:1344 }
          uVar9 := Slice16(param_4, 2); { routine anchor; statement location unresolved } { 9800:1344 }
          PString(BP+65267, SS) := 'lost a spell'; { 9800:1533 }
          FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_03, 1), Pack16(UNKNOWN_extraout_AH_03, $C), puVar6, uVar7, iVar8, uVar9); { 9800:153E }
          FUN_00ba_148b(Pack16(UNKNOWN_extraout_AH_04, (P_Byte((P_LongWord((Integer(param_4) + $108)))^))^)); { 9800:154F }
          (P_Byte((P_LongWord((Integer(param_4) + $108)))^))^ := 0; { routine anchor; statement location unresolved } { 9800:1344 }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      if ((P_ShortInt((Integer(param_4) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 9800:1344 }
        begin { routine anchor; statement location unresolved } { 9800:1344 }
          PString(local_102, SS) := Copy('Goes Down', 1, $FF); { 9800:157D }
          uVar4 := ((P_ShortInt((Integer(param_4) + $10C)))^ = 5); { routine anchor; statement location unresolved } { 9800:1344 }
          uVar3 := UNKNOWN_extraout_AH_05; { routine anchor; statement location unresolved } { 9800:1344 }
          if Boolean(uVar4) then { routine anchor; statement location unresolved } { 9800:1344 }
            begin { routine anchor; statement location unresolved } { 9800:1344 }
              puVar6 := local_202; { routine anchor; statement location unresolved } { 9800:1344 }
              uVar7 := SS; { routine anchor; statement location unresolved } { 9800:1344 }
              PString(BP+65280, SS) := PString(local_102, SS); { 9800:1599 }
              PString(BP+65280, SS) := Copy(PString(BP+65280, SS) + ', and is Dying', 1, 255); { 9800:15A3 }
              PString(local_102, SS) := Copy(PString(puVar6, uVar7), 1, $FF); { 9800:15B2 }
              uVar3 := UNKNOWN_extraout_AH_06; { routine anchor; statement location unresolved } { 9800:1344 }
            end; { routine anchor; statement location unresolved } { 9800:1344 }
          Flags.ZF := not (LoByte(Pack16(uVar3, (P_Byte((Integer(param_4) + $10C)))^)) in [6, 7, 8]); { 9800:15C5 }
          if not (Boolean(uVar4)) then { routine anchor; statement location unresolved } { 9800:1344 }
            begin { routine anchor; statement location unresolved } { 9800:1344 }
              PString(local_102, SS) := Copy('is killed', 1, $FF); { 9800:15DB }
            end; { routine anchor; statement location unresolved } { 9800:1344 }
          FUN_00ba_16ec(((g_5E25 + 1) and $FF00), (g_5E25 + 1), local_102, SS, Integer(param_4), Slice16(param_4, 2)); { 9800:15F6 }
          if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 9800:1344 }
            begin { routine anchor; statement location unresolved } { 9800:1344 }
              ov24_100A(Integer(param_4), Slice16(param_4, 2)); { 9800:1610 }
              VisitEffectHooks(Integer(param_4), Slice16(param_4, 2), Pack16(UNKNOWN_extraout_AH_07, $D)); { 9800:161D }
              if ((P_ShortInt((Integer(param_4) + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 9800:1344 }
                begin { routine anchor; statement location unresolved } { 9800:1344 }
                  ov31_0E11(Integer(param_4), Slice16(param_4, 2)); { 9800:1631 }
                end; { routine anchor; statement location unresolved } { 9800:1344 }
              else { routine anchor; statement location unresolved } { 9800:1344 }
                begin { routine anchor; statement location unresolved } { 9800:1344 }
                  FUN_0709_0dbe(); { 9800:1602 }
                end; { routine anchor; statement location unresolved } { 9800:1344 }
            end; { routine anchor; statement location unresolved } { 9800:1344 }
          else { routine anchor; statement location unresolved } { 9800:1344 }
            begin { routine anchor; statement location unresolved } { 9800:1344 }
              FUN_0709_0dbe(); { 9800:1638 }
            end; { routine anchor; statement location unresolved } { 9800:1344 }
        end; { routine anchor; statement location unresolved } { 9800:1344 }
      FUN_00ba_17e3(); { 9800:163D }
    end; { routine anchor; statement location unresolved } { 9800:1344 }
  Exit; { 9800:1645 }
end; { routine anchor; statement location unresolved } { 9800:1344 }
```

### ov24:1656 ApplyEffectUnlessUnaffected (conf M)

Params (stack slots): param_1: LongWord [BP+$06]; param_2: ShortInt [BP+$0A]; param_3: ShortInt [BP+$0C]; param_4: Byte [BP+$0E]; param_5: Byte [BP+$10]; param_6: Word [BP+$12]; param_7: ShortInt [BP+$14]; param_8: Word [BP+$16]; param_9: Word [BP+$18].  
Locals: cVar1: ShortInt [compiler temporary; no proven BP slot]; iVar2: Integer [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; puVar4: P_Byte [compiler temporary; no proven BP slot]; local_3e: array[0..14] of Byte [BP-$3C]; local_2f: array[0..3] of Byte [BP-$2D]; local_2b: array[0..40] of ShortInt [BP-$29].  
Callers: ov24_0AE7.  
Callees: FUN_00ba_16ec, FUN_00ba_17e3, FUN_00ba_1feb, FUN_00ba_2199, System.@StrAssign, System.@StrCopy, RemoveEffect, VisitEffectHooks, AppendEffect.

```pascal
procedure ApplyEffectUnlessUnaffected(param_1: LongWord; param_2: ShortInt; param_3: ShortInt; param_4: Byte; param_5: Byte; param_6: Word; param_7: ShortInt; param_8: Word; param_9: Word); { 9800:1656 }
begin { routine anchor; statement location unresolved } { 9800:1656 }
  PString(local_2b, SS) := Copy(PString(Integer(param_1), Integer((LongWord(param_1) shr $10))), 1, $28); { 9800:166A }
  g_6817 := param_7; { 9800:1672 }
  VisitEffectHooks(param_8, param_9, Pack16(UNKNOWN_extraout_AH, 9)); { 9800:167F }
  if ((g_6817 = 0) or else ((param_2 <> 0) and then (param_3 = 1))) then { routine anchor; statement location unresolved } { 9800:1656 }
    begin { routine anchor; statement location unresolved } { 9800:1656 }
      puVar4 := local_3e; { routine anchor; statement location unresolved } { 9800:1656 }
      PString(local_3e, SS) := 'is Unaffected'; { 9800:16A5 }
      FUN_00ba_16ec(Pack16(UNKNOWN_extraout_AH_01, 1), Pack16(UNKNOWN_extraout_AH_01, 10), puVar4, SS, param_8, param_9); { 9800:16B0 }
    end; { routine anchor; statement location unresolved } { 9800:1656 }
  else { routine anchor; statement location unresolved } { 9800:1656 }
    begin { routine anchor; statement location unresolved } { 9800:1656 }
      cVar1 := FUN_00ba_2199(local_2f, SS, Pack16(UNKNOWN_extraout_AH_00, param_7), param_8, param_9); { 9800:16C7 }
      if ((cVar1 <> 0) and then (Sequence((uVar3 := Slice16(local_2f, 2)); (iVar2 := Slice16(local_2f, 0)); (((P_Integer((iVar2 + 1)))^ <> 0) and then ((P_Word((iVar2 + 1)))^ < param_6))) or else (param_6 = 0))) then { routine anchor; statement location unresolved } { 9800:1656 }
        begin { routine anchor; statement location unresolved } { 9800:1656 }
          RemoveEffect(iVar2, uVar3, param_7, param_8, param_9); { 9800:16FD }
        end; { routine anchor; statement location unresolved } { 9800:1656 }
      AppendEffect(param_4, param_5, param_6, param_7, param_8, param_9); { 9800:1716 }
      if (local_2b[0] <> 0) then { routine anchor; statement location unresolved } { 9800:1656 }
        begin { routine anchor; statement location unresolved } { 9800:1656 }
          FUN_00ba_1feb(local_2b, SS, Pack16(UNKNOWN_extraout_AH_02, 1), param_8, param_9); { 9800:172D }
          FUN_00ba_17e3(); { 9800:1732 }
        end; { routine anchor; statement location unresolved } { 9800:1656 }
    end; { routine anchor; statement location unresolved } { 9800:1656 }
  Exit; { 9800:173A }
end; { routine anchor; statement location unresolved } { 9800:1656 }
```

### ov24:175D RestoreHitPoints (conf M)

Params (stack slots): param_1: ShortInt [BP+$06]; param_2: Byte [BP+$08]; param_3: LongWord [BP+$0A].  
Locals: iVar1: Integer [compiler temporary; no proven BP slot]; uVar2: Byte [compiler temporary; no proven BP slot]; iVar3: Integer [compiler temporary; no proven BP slot]; uVar4: Word [compiler temporary; no proven BP slot]; bVar5: Boolean [compiler temporary; no proven BP slot]; local_7: array[0..3] of Byte [BP-$5]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_2199, System.@SetIn, DispatchEffect.

M: restores current HP +11B up to max HP +32 under status/effect guards; changes dying status 5 to 4. The stack-address boolean is a Ghidra flags artifact; do not implement literally.

```pascal
function RestoreHitPoints(param_1: ShortInt; param_2: Byte; param_3: LongWord): Word; { 9800:175D }
begin { routine anchor; statement location unresolved } { 9800:175D }
  bVar5 := (@(stack0x0000) = P_Byte($8)); { routine anchor; statement location unresolved } { 9800:175D }
  local_3 := 0; { 9800:1763 }
  uVar4 := Word((LongWord(param_3) shr $10)); { routine anchor; statement location unresolved } { 9800:175D }
  iVar3 := Integer(param_3); { routine anchor; statement location unresolved } { 9800:175D }
  Flags.ZF := not (LoByte((P_Byte((iVar3 + $10C)))^) in [0, 1, 4, 5]); { 9800:1775 }
  uVar2 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 9800:175D }
  if (not (bVar5) and then ((((P_Byte((iVar3 + $11B)))^ < (P_Byte((iVar3 + $32)))^) and then (param_1 <> 0)) or else Sequence(FUN_00ba_2199(local_7, SS, Pack16(UNKNOWN_extraout_AH, $32), iVar3, uVar4); (uVar2 := UNKNOWN_extraout_AH_00); ((UNKNOWN_extraout_AL = 0) and then (param_1 = 0))))) then { 9800:17A4 }
    begin { routine anchor; statement location unresolved } { 9800:175D }
      iVar1 := (Word((P_Byte((iVar3 + $11B)))^) + Word(param_2)); { routine anchor; statement location unresolved } { 9800:175D }
      (P_Byte((iVar3 + $11B)))^ := ShortInt(iVar1); { routine anchor; statement location unresolved } { 9800:175D }
      uVar2 := Byte((Word(iVar1) shr 8)); { routine anchor; statement location unresolved } { 9800:175D }
      if ((P_Byte((iVar3 + $32)))^ < (P_Byte((iVar3 + $11B)))^) then { routine anchor; statement location unresolved } { 9800:175D }
        begin { routine anchor; statement location unresolved } { 9800:175D }
          (P_Byte((iVar3 + $11B)))^ := (P_Byte((iVar3 + $32)))^; { routine anchor; statement location unresolved } { 9800:175D }
        end; { routine anchor; statement location unresolved } { 9800:175D }
      if ((P_ShortInt((iVar3 + $10D)))^ = 0) then { routine anchor; statement location unresolved } { 9800:175D }
        begin { routine anchor; statement location unresolved } { 9800:175D }
          if ((P_ShortInt((iVar3 + $10C)))^ = 5) then { routine anchor; statement location unresolved } { 9800:175D }
            begin { routine anchor; statement location unresolved } { 9800:175D }
              (P_Byte((iVar3 + $10C)))^ := 4; { routine anchor; statement location unresolved } { 9800:175D }
            end; { routine anchor; statement location unresolved } { 9800:175D }
          if (((P_ShortInt((iVar3 + $10C)))^ = 4) and then (g_49F3 <> 5)) then { routine anchor; statement location unresolved } { 9800:175D }
            begin { routine anchor; statement location unresolved } { 9800:175D }
              DispatchEffect(1, 0, 0, iVar3, uVar4, Pack16(uVar2, $4E)); { 9800:1838 }
              uVar2 := UNKNOWN_extraout_AH_01; { routine anchor; statement location unresolved } { 9800:175D }
            end; { routine anchor; statement location unresolved } { 9800:175D }
        end; { routine anchor; statement location unresolved } { 9800:175D }
      local_3 := 1; { 9800:183B }
    end; { routine anchor; statement location unresolved } { 9800:175D }
  Exit(Pack16(uVar2, local_3)); { 9800:1845 }
end; { routine anchor; statement location unresolved } { 9800:175D }
```

### ov24:1869 StandUpAgain (conf M)

Params (stack slots): param_1: Byte [BP+$06]; param_2: LongWord [BP+$08].  
Locals: uVar1: Word [compiler temporary; no proven BP slot]; uVar2: Word [compiler temporary; no proven BP slot]; uVar3: Word [compiler temporary; no proven BP slot]; bVar4: Byte [compiler temporary; no proven BP slot]; uVar5: Byte [compiler temporary; no proven BP slot]; iVar6: Integer [compiler temporary; no proven BP slot]; local_2c: array[0..40] of Byte [BP-$2A]; local_3: Byte [BP-$1].  
Callers: none recorded.  
Callees: FUN_00ba_16ec, FUN_00ba_23db, System.@StrAssign, ov31_0BE7, ov31_0C0F, ov31_10A7, ov31_1298.

M: tests placement via ov31; on success status +10C=0, active +10D=1, HP +11B=argument, and chooses one of the two recovery messages.

```pascal
function StandUpAgain(param_1: Byte; param_2: LongWord): Byte; { 9800:1869 }
begin { routine anchor; statement location unresolved } { 9800:1869 }
  iVar6 := Integer(param_2); { routine anchor; statement location unresolved } { 9800:1869 }
  uVar3 := Slice16(param_2, 2); { routine anchor; statement location unresolved } { 9800:1869 }
  uVar1 := ov31_0BE7(Integer(param_2), Slice16(param_2, 2)); { 9800:187B }
  uVar2 := ov31_0C0F(Integer(param_2), Slice16(param_2, 2)); { 9800:1887 }
  uVar3 := ov31_10A7(1, uVar2, uVar1, iVar6, uVar3); { 9800:1890 }
  bVar4 := Byte((Word(uVar3) shr 8)); { routine anchor; statement location unresolved } { 9800:1869 }
  if (ShortInt(uVar3) = 0) then { routine anchor; statement location unresolved } { 9800:1869 }
    begin { routine anchor; statement location unresolved } { 9800:1869 }
      local_3 := 0; { 9800:191F }
    end; { routine anchor; statement location unresolved } { 9800:1869 }
  else { routine anchor; statement location unresolved } { 9800:1869 }
    begin { routine anchor; statement location unresolved } { 9800:1869 }
      (P_Byte((Integer(param_2) + $10C)))^ := 0; { routine anchor; statement location unresolved } { 9800:1869 }
      (P_Byte((Integer(param_2) + $10D)))^ := 1; { routine anchor; statement location unresolved } { 9800:1869 }
      (P_Byte((Integer(param_2) + $11B)))^ := param_1; { routine anchor; statement location unresolved } { 9800:1869 }
      if (g_49F3 = 5) then { routine anchor; statement location unresolved } { 9800:1869 }
        begin { routine anchor; statement location unresolved } { 9800:1869 }
          ov31_1298((Word(bVar4) shl 8), Pack16(bVar4, 3), Integer(param_2), Slice16(param_2, 2)); { 9800:18CC }
        end; { routine anchor; statement location unresolved } { 9800:1869 }
      if ((P_ShortInt((Integer(param_2) + $10E)))^ = 1) then { routine anchor; statement location unresolved } { 9800:1869 }
        begin { routine anchor; statement location unresolved } { 9800:1869 }
          PString(local_2c, SS) := Copy('stands up and grins', 1, $28); { 9800:18EA }
          uVar5 := UNKNOWN_extraout_AH; { routine anchor; statement location unresolved } { 9800:1869 }
        end; { routine anchor; statement location unresolved } { 9800:1869 }
      else { routine anchor; statement location unresolved } { 9800:1869 }
        begin { routine anchor; statement location unresolved } { 9800:1869 }
          PString(local_2c, SS) := Copy('gets back up', 1, $28); { 9800:18FF }
          uVar5 := UNKNOWN_extraout_AH_00; { routine anchor; statement location unresolved } { 9800:1869 }
        end; { routine anchor; statement location unresolved } { 9800:1869 }
      FUN_00ba_16ec(Pack16(uVar5, 1), Pack16(uVar5, 10), local_2c, SS, Integer(param_2), Slice16(param_2, 2)); { 9800:1915 }
      FUN_00ba_23db(); { 9800:191A }
      local_3 := 1; { 9800:1925 }
    end; { routine anchor; statement location unresolved } { 9800:1869 }
  Exit(local_3); { 9800:192F }
end; { routine anchor; statement location unresolved } { 9800:1869 }
```

### ov24:1932 ov24_init (conf H)

Params (stack slots): none.  
Locals: none.  
Callers: none recorded.  
Callees: none recorded.

```pascal
procedure ov24_init(); { 9800:1932 }
begin { routine anchor; statement location unresolved } { 9800:1932 }
  Exit; { 9800:1936 }
end; { routine anchor; statement location unresolved } { 9800:1932 }
```

## Screens

**New inventory screen evidence:** Ready Item at x=1,y=3,color=15 (7F00:1235); Items at x=length(actor-name)+4,y=1,color=10 (11F2). Inventory selection call 128F uses rectangle x=1,y=5,x2=38,y2=22 plus menu style arguments; complete UI ABI is unknown. Case byte comparisons prove R Ready, U Use, T Trade, D Drop, H Halve, J Join, S Sell, I Id; E or zero exits (0F39 set [0,69]). Drop confirmation compares Y at 13E4; scroll-loss confirmation compares Y at 0E3B. The resident helper may normalize lower-case or joystick input; that is not proven here.

**Recovered warning strings** absent from exported routine metadata:

| Unit:literal | Exact text | Position / input |
| --- | --- | --- |
| ov19:0D20 | `Must be unreadied` | 0D93 resident message; position unknown |
| ov19:0D32 | ` was going to scribe from that scroll` | warning box x=1,y=21,x2=38,y2=22, message prefix supplied elsewhere |
| ov19:0D58 | `is it Okay to lose it? ` | confirmation helper at 0E36; Y accepted, text style slots 13,10,15 |



All literal annotations in the owned routine inventory are catalogued below, including resource names (marked resource) and headings that are composed dynamically. Empty/unannotated strings are not guaranteed absent: the exporter does not exhaustively recover DS text tables. Coordinates below use original text-cell arguments; renderer pixel conversion and unknown positions require ENGINE/VIEW crossref.

| Flow | Positions / output evidence | Accepted keys / input evidence |
| --- | --- | --- |
| Combat result / XP | ov05:0916: row 3 outcome, numeric XP composed with decimal Str; continuation text. 0709:0626 arguments and .lst are coordinate authority. | Enter/Return explicitly printed; resident input helper behavior not independently proved. |
| Loot / treasure | ov05:0B14,0D38,0ECD: Loot, Items, Money/Items/Exit and conditional View/Take/Pool/Share/Detect menus. | Menu labels plus numeric/character branch tests below; labels alone do not prove all hotkeys. |
| Party destroyed | ov05:1527: The END!, monsters-rejoice line, Press any key. | Any key as printed, input delegated to resident helper. |
| Movement / targeting | ov09:07F2 movement budget; ov13:2AA0 and 2DFA Range/Target/Next/Prev/Manual/Center/Exit. | Cursor keys explicitly printed for manual targeting. Escape/select/other scan codes remain numeric in body. |
| Action messages | ov13:02F9,0C6A,116A,2414,2998,39D2,3B93; actor name composed by 00BA:16EC/1FEB. | Timed/queued messages; no independent key implied by each fragment. |
| Dragon finale | ov18:02A4: text x=1,color=10; rows 17..19, then 17..22, then 17..20; clears rectangle (x1=1,y1=17,x2=38,y2=22); FINAL frames between panels. | Tick-driven animation; 00BA:27D9/0709:0DBE interleave; exact continue-key contract unresolved. |
| Character / statistics | ov19:004A and 0608: labels listed below; numbers, equipment/status strings composed from DS tables. | View submenu delegates to inventory, spells, trade, drop, exit. |
| Inventory / ready / trade / split / sell / identify | ov19:0EF8,14D0,1734,17ED,1CEE,1F52,231A; conditional labels and prompts below. | Choice/confirmation helpers plus numeric coin quantity; exact scan codes remain in bodies. |
| Spell heading | ov19:299C: dynamic memory/book/scroll/memorize/scribe heading. | Heading alone establishes no input key. |
| Status / damage / recovery | ov24:0AE7,1081,1344,1656,1869: actor-name messages and damage type fragments. | No explicit keys in these literals. |

| Unit:literal offset | Exact literal | Referencing routine | Kind |
| --- | --- | --- | --- |
| ov05:083D | `You have lost the duel.` | ShowCombatOutcome | text/menu fragment |
| ov05:0855 | `You have won the duel.` | ShowCombatOutcome | text/menu fragment |
| ov05:086C | `The party has won.` | ShowCombatOutcome | text/menu fragment |
| ov05:087F | `The party has fled.` | ShowCombatOutcome | text/menu fragment |
| ov05:0893 | `The party has found Treasure!` | ShowCombatOutcome | text/menu fragment |
| ov05:08B1 | `The duelist receives ` | ShowCombatOutcome | text/menu fragment |
| ov05:08C7 | `Each character receives ` | ShowCombatOutcome | text/menu fragment |
| ov05:08E0 | `experience points.` | ShowCombatOutcome | text/menu fragment |
| ov05:08F3 | `press <enter>/<return> to continue` | ShowCombatOutcome | text/menu fragment |
| ov05:0B02 | `Loot` | ShowLootItems | text/menu fragment |
| ov05:0B07 | `Items: ` | ShowLootItems | text/menu fragment |
| ov05:0B0F | `Take` | ShowLootItems | text/menu fragment |
| ov05:0D20 | `Take: ` | ChooseMoneyOrItems | text/menu fragment |
| ov05:0D27 | `Money Items Exit` | ChooseMoneyOrItems | text/menu fragment |
| ov05:0E2E | `View Pool Exit` | TreasureMenu | text/menu fragment |
| ov05:0E3D | ` Exit` | TreasureMenu | text/menu fragment |
| ov05:0E43 | ` Detect Exit` | TreasureMenu | text/menu fragment |
| ov05:0E50 | `View Take Pool Share` | TreasureMenu | text/menu fragment |
| ov05:0E65 | `View Take Pool` | TreasureMenu | text/menu fragment |
| ov05:0E74 | `~Yes ~No` | TreasureMenu | text/menu fragment |
| ov05:0E7D | `There is still treasure left.  ` | TreasureMenu | text/menu fragment |
| ov05:0E9D | `Do you want to go back and claim your treasure?` | TreasureMenu | text/menu fragment |
| ov05:12A9 | ` takes and hides his share.` | NPCShareOfTreasure | text/menu fragment |
| ov05:12C5 | `press <enter>/<return> to continue` | NPCShareOfTreasure | text/menu fragment |
| ov05:14CE | `The END!` | FinishCombat | text/menu fragment |
| ov05:14D7 | `The monsters rejoice for the party has been destroyed` | FinishCombat | text/menu fragment |
| ov05:150D | `Press any key to continue` | FinishCombat | text/menu fragment |
| ov07:0322 | `Loading...Please Wait` | LoadEclBlock | text/menu fragment |
| ov07:0338 | `ECL` | LoadEclBlock | resource/control |
| ov07:033C | `.dax` | LoadEclBlock | resource/control |
| ov07:0544 | `SPRIT` | ShowEncounter | resource/control |
| ov07:054A | `PIC` | ShowEncounter | resource/control |
| ov07:1A65 | `CPIC` | ov07_1A6F | resource/control |
| ov07:1A6A | `ROLF` | ov07_1A6F | resource/control |
| ov07:2081 | ` dies. ` | ApplyEclDamage | text/menu fragment |
| ov07:2089 | ` is hit FOR ` | ApplyEclDamage | text/menu fragment |
| ov07:2096 | ` points of Damage.` | ApplyEclDamage | text/menu fragment |
| ov07:20A9 | `press <enter>/<return> to continue` | ApplyEclDamage | text/menu fragment |
| ov09:0000 | `flees in panic` | CheckPanic | text/menu fragment |
| ov09:07D6 | `Move/Attack, Move Left = ` | MoveAttackCommand | text/menu fragment |
| ov09:0FAE | `Magic On` | ToggleMagic | text/menu fragment |
| ov09:0FB7 | `Magic Off` | ToggleMagic | text/menu fragment |
| ov09:10BA | `is forced to flee` | FleeOrSurrender | text/menu fragment |
| ov09:10CC | `Surrenders` | FleeOrSurrender | text/menu fragment |
| ov13:0232 | `-Backstabs-` | ReportAttack | text/menu fragment |
| ov13:023E | `slays helpless` | ReportAttack | text/menu fragment |
| ov13:024D | `Attacks` | ReportAttack | text/menu fragment |
| ov13:0255 | `(from behind) ` | ReportAttack | text/menu fragment |
| ov13:0264 | `with one cruel blow` | ReportAttack | text/menu fragment |
| ov13:0278 | `Hitting for ` | ReportAttack | text/menu fragment |
| ov13:0285 | ` point ` | ReportAttack | text/menu fragment |
| ov13:028D | ` points ` | ReportAttack | text/menu fragment |
| ov13:0296 | `of damage` | ReportAttack | text/menu fragment |
| ov13:02A0 | `and Misses` | ReportAttack | text/menu fragment |
| ov13:02AB | `lost a spell` | ReportAttack | text/menu fragment |
| ov13:02B8 | `goes down` | ReportAttack | text/menu fragment |
| ov13:02C2 | `and is Dying` | ReportAttack | text/menu fragment |
| ov13:02EF | `is killed` | ReportAttack | text/menu fragment |
| ov13:0C4F | `Got Away` | AttemptEscape | text/menu fragment |
| ov13:0C58 | `Escape is blocked` | AttemptEscape | text/menu fragment |
| ov13:0E7B | `sweeps` | SweepAttack | text/menu fragment |
| ov13:1130 | `turns undead...` | TurnUndead | text/menu fragment |
| ov13:1140 | `is turned` | TurnUndead | text/menu fragment |
| ov13:114A | `Is destroyed` | TurnUndead | text/menu fragment |
| ov13:1157 | `Nothing Happens...` | TurnUndead | text/menu fragment |
| ov13:20AD | `Already been targeted` | ov13_20C3 | text/menu fragment |
| ov13:23F5 | `Camp Only Spell` | BeginCasting | text/menu fragment |
| ov13:2405 | `Begins Casting` | BeginCasting | text/menu fragment |
| ov13:298A | `Attack Ally: ` | ConfirmAttackAlly | text/menu fragment |
| ov13:2A69 | `Range = ` | TargetMenu | text/menu fragment |
| ov13:2A75 | `Target ` | TargetMenu | text/menu fragment |
| ov13:2A7D | `Next Prev Manual ` | TargetMenu | text/menu fragment |
| ov13:2A8F | `Center Exit` | TargetMenu | text/menu fragment |
| ov13:2A9B | `Aim:` | TargetMenu | text/menu fragment |
| ov13:2DC7 | `Range = ` | ManualTarget | text/menu fragment |
| ov13:2DD3 | `Center Exit` | ManualTarget | text/menu fragment |
| ov13:2DDF | `Target ` | ManualTarget | text/menu fragment |
| ov13:2DE7 | `(Use Cursor keys) ` | ManualTarget | text/menu fragment |
| ov13:39C9 | `Rakes...` | RakeAttack | text/menu fragment |
| ov13:3B79 | `STING` | GodsIntervene | resource/control |
| ov13:3B7F | `The Gods intervene!` | GodsIntervene | text/menu fragment |
| ov18:0000 | `FINAL` | PlayFinalAnimation | resource/control |
| ov18:0114 | `Mortally wounded, the dragon roars!` | DragonFinale | text/menu fragment |
| ov18:0138 | `The spirit of Tyranthraxus flares up` | DragonFinale | text/menu fragment |
| ov18:015D | `from the dragon's body.` | DragonFinale | text/menu fragment |
| ov18:0175 | `FINAL` | DragonFinale | resource/control |
| ov18:017B | `"Fools, you have but slain the body` | DragonFinale | text/menu fragment |
| ov18:019F | `I possessed.  I cannot be defeated!"` | DragonFinale | text/menu fragment |
| ov18:01C4 | `With the power of the pool of radiance` | DragonFinale | text/menu fragment |
| ov18:01EB | `which I moved here, to my lair,` | DragonFinale | text/menu fragment |
| ov18:020B | `I will still rule, by possessing one` | DragonFinale | text/menu fragment |
| ov18:0230 | `of you!"` | DragonFinale | text/menu fragment |
| ov18:0239 | `"No Lord Bane!  I can still rule here!` | DragonFinale | text/menu fragment |
| ov18:0260 | `I have not failed.  Do not call me back` | DragonFinale | text/menu fragment |
| ov18:0288 | `through the pool!"` | DragonFinale | text/menu fragment |
| ov18:029B | `Noooo...` | DragonFinale | text/menu fragment |
| ov19:0000 | `(NPC)` | ShowCharacterSummary | text/menu fragment |
| ov19:0006 | `Age ` | ShowCharacterSummary | text/menu fragment |
| ov19:000B | `STR ` | ShowCharacterSummary | text/menu fragment |
| ov19:0010 | `INT ` | ShowCharacterSummary | text/menu fragment |
| ov19:0015 | `WIS ` | ShowCharacterSummary | text/menu fragment |
| ov19:001A | `DEX ` | ShowCharacterSummary | text/menu fragment |
| ov19:001F | `CON ` | ShowCharacterSummary | text/menu fragment |
| ov19:0024 | `CHA ` | ShowCharacterSummary | text/menu fragment |
| ov19:0029 | `Level` | ShowCharacterSummary | text/menu fragment |
| ov19:0031 | `Exp ` | ShowCharacterSummary | text/menu fragment |
| ov19:0036 | `Weapon` | ShowCharacterSummary | text/menu fragment |
| ov19:003D | `Armor` | ShowCharacterSummary | text/menu fragment |
| ov19:0043 | `Status` | ShowCharacterSummary | text/menu fragment |
| ov19:05BE | `AC    ` | ShowCombatStatistics | text/menu fragment |
| ov19:05C5 | `HP    ` | ShowCombatStatistics | text/menu fragment |
| ov19:05CC | `THAC0   ` | ShowCombatStatistics | text/menu fragment |
| ov19:05DB | `Damage        ` | ShowCombatStatistics | text/menu fragment |
| ov19:05EA | `Encumbrance      ` | ShowCombatStatistics | text/menu fragment |
| ov19:05FC | `Movement   ` | ShowCombatStatistics | text/menu fragment |
| ov19:0A6C | `Items ` | CharacterViewMenu | text/menu fragment |
| ov19:0A73 | `Spells ` | CharacterViewMenu | text/menu fragment |
| ov19:0A7B | `Trade ` | CharacterViewMenu | text/menu fragment |
| ov19:0A82 | `Drop ` | CharacterViewMenu | text/menu fragment |
| ov19:0A88 | `Exit` | CharacterViewMenu | text/menu fragment |
| ov19:0A8D | `View:` | CharacterViewMenu | text/menu fragment |
| ov19:0E83 | `Ready` | InventoryMenu | text/menu fragment |
| ov19:0E89 | ` Use` | InventoryMenu | text/menu fragment |
| ov19:0E8E | ` Trade` | InventoryMenu | text/menu fragment |
| ov19:0E95 | ` Drop` | InventoryMenu | text/menu fragment |
| ov19:0E9B | ` Halve` | InventoryMenu | text/menu fragment |
| ov19:0EA2 | ` Join` | InventoryMenu | text/menu fragment |
| ov19:0EA8 | ` Sell` | InventoryMenu | text/menu fragment |
| ov19:0EAE | ` Id` | InventoryMenu | text/menu fragment |
| ov19:0EB2 | `Items` | InventoryMenu | text/menu fragment |
| ov19:0EB8 | `Ready Item` | InventoryMenu | text/menu fragment |
| ov19:0EC3 | `Must be Readied` | InventoryMenu | text/menu fragment |
| ov19:0ED3 | `Your ` | InventoryMenu | text/menu fragment |
| ov19:0ED9 | `will be gone forever` | InventoryMenu | text/menu fragment |
| ov19:0EEE | `Drop It? ` | InventoryMenu | text/menu fragment |
| ov19:1494 | `It's Cursed` | ReadyItem | text/menu fragment |
| ov19:14A0 | `Wrong Class` | ReadyItem | text/menu fragment |
| ov19:14AC | `already using ` | ReadyItem | text/menu fragment |
| ov19:14BB | `Your hands are full!` | ReadyItem | text/menu fragment |
| ov19:1718 | `Trade with Whom?` | TradeItem | text/menu fragment |
| ov19:1729 | `Overloaded` | TradeItem | text/menu fragment |
| ov19:17DC | `Can't halve that` | HalveItem | text/menu fragment |
| ov19:1A77 | `uses an item` | UseItem | text/menu fragment |
| ov19:1A84 | `Item:` | UseItem | text/menu fragment |
| ov19:1C8B | `I'll give you ` | SellItem | text/menu fragment |
| ov19:1C9A | ` gold pieces for your ` | SellItem | text/menu fragment |
| ov19:1CB1 | `Is It a Deal? ` | SellItem | text/menu fragment |
| ov19:1CC0 | `Sold!` | SellItem | text/menu fragment |
| ov19:1CC6 | `Overloaded.  Money will be put in pool.` | SellItem | text/menu fragment |
| ov19:1EC8 | `For 200 gold pieces I'll identify your ` | IdentifyItem | text/menu fragment |
| ov19:1EF0 | `Is It a Deal? ` | IdentifyItem | text/menu fragment |
| ov19:1EFF | `Not Enough Money` | IdentifyItem | text/menu fragment |
| ov19:1F10 | `I can't tell anything new about your ` | IdentifyItem | text/menu fragment |
| ov19:1F36 | `It looks like some sort of ` | IdentifyItem | text/menu fragment |
| ov19:211A | `Trade to?` | TradeCoins | text/menu fragment |
| ov19:2126 | `Select type of coin` | TradeCoins | text/menu fragment |
| ov19:213B | `How much ` | TradeCoins | text/menu fragment |
| ov19:2145 | `will you trade? ` | TradeCoins | text/menu fragment |
| ov19:2939 | `in Memory` | SpellListHeading | text/menu fragment |
| ov19:2943 | `in Spell Book` | SpellListHeading | text/menu fragment |
| ov19:2951 | `on Scroll` | SpellListHeading | text/menu fragment |
| ov19:295B | `on Scrolls` | SpellListHeading | text/menu fragment |
| ov19:2966 | `to choose from` | SpellListHeading | text/menu fragment |
| ov19:2975 | `to be memorized` | SpellListHeading | text/menu fragment |
| ov19:2985 | `to be scribed` | SpellListHeading | text/menu fragment |
| ov19:2994 | `Spells ` | SpellListHeading | text/menu fragment |
| ov24:0ABB | `starts to cough` | CoughOrNausea | text/menu fragment |
| ov24:0ACB | `chokes and gags from nausea` | CoughOrNausea | text/menu fragment |
| ov24:1078 | `is Cured` | ReportCured | text/menu fragment |
| ov24:1287 | `takes ` | ApplyTypedDamage | text/menu fragment |
| ov24:128E | ` points of damage ` | ApplyTypedDamage | text/menu fragment |
| ov24:12A1 | `takes 1 point of damage ` | ApplyTypedDamage | text/menu fragment |
| ov24:12BA | `from Fire` | ApplyTypedDamage | text/menu fragment |
| ov24:12C4 | `from Cold` | ApplyTypedDamage | text/menu fragment |
| ov24:12CE | `from Electricity` | ApplyTypedDamage | text/menu fragment |
| ov24:12DF | `from Acid` | ApplyTypedDamage | text/menu fragment |
| ov24:12E9 | `from Magic` | ApplyTypedDamage | text/menu fragment |
| ov24:12F4 | `lost a spell` | ApplyTypedDamage | text/menu fragment |
| ov24:1301 | `Goes Down` | ApplyTypedDamage | text/menu fragment |
| ov24:130B | `, and is Dying` | ApplyTypedDamage | text/menu fragment |
| ov24:133A | `is killed` | ApplyTypedDamage | text/menu fragment |
| ov24:1648 | `is Unaffected` | ApplyEffectUnlessUnaffected | text/menu fragment |
| ov24:1848 | `stands up and grins` | StandUpAgain | text/menu fragment |
| ov24:185C | `gets back up` | StandUpAgain | text/menu fragment |


Additional literals from the late-arriving `decode/strings.tsv` census. `gap` rows are **unconfirmed string candidates**, not asserted screens; referenced resource/table fragments can also be non-screen data. Positions and keys remain unknown unless the routine or flow table above establishes them.

| Unit:literal offset | Exact literal | Reference / certainty |
| --- | --- | --- |
| ov07:207E | `  ` | no static reference; gap |
| ov09:07F0 | ` ` | no static reference; gap |
| ov13:2A72 | `  ` | no static reference; gap |
| ov13:2DA7 | ` ` | no static reference; gap |
| ov13:2DD0 | `  ` | no static reference; gap |
| ov19:002F | `/` | no static reference; gap |
| ov19:05D5 | `d` | no static reference; gap |
| ov19:05D7 | `+` | no static reference; gap |
| ov19:05D9 | `-` | no static reference; gap |
| ov19:08F8 | `0` | no static reference; gap |
| ov19:08FA | `00` | no static reference; gap |
| ov19:08FD | `(` | no static reference; gap |
| ov19:08FF | `)` | no static reference; gap |
| ov19:0DD8 | `P` | no static reference; gap |
| ov19:0DF9 | `P` | no static reference; gap |
| ov19:0E3A | `<Yu` | no static reference; gap |
| ov19:0E4A | `P` | no static reference; gap |
| ov19:2124 | ` ` | no static reference; gap |
| ov19:2476 | ` ` | no static reference; gap |
| ov19:2478 | `Select type of coin` | no static reference; gap |
| ov19:248D | `How much ` | no static reference; gap |
| ov19:2497 | `will you drop? ` | no static reference; gap |
| ov19:2597 | `:` | no static reference; gap |
| ov19:2664 | `P` | no static reference; gap |

Literal census cross-check: 208 unique candidates across the seven assigned units; 24 supplementary entries beyond the earlier per-routine/reference tables. Complete DS-table string coverage remains unresolved.

## Globals

DS is 0C7C. Census covers explicit exported DAT references and evidenced indirect/table bases. Types are observed access widths, not recovered Pascal declarations. Paired far pointers still appear as two words in bodies.

| DS offset | Type / inferred name (confidence) | Evidence |
| --- | --- | --- |
| 0642 | unknown access width; g_0642 (L) | explicit DS reference; ov19:0EF8 |
| 066C | unknown access width; g_066C (L) | explicit DS reference; ov19:0EF8 |
| 0696 | unknown access width; g_0696 (L) | explicit DS reference; ov19:0EF8 |
| 06C0 | unknown access width; g_06C0 (L) | explicit DS reference; ov19:0EF8 |
| 06EA | unknown access width; g_06EA (L) | explicit DS reference; ov19:0EF8 |
| 0714 | unknown access width; g_0714 (L) | explicit DS reference; ov19:0EF8 |
| 073E | unknown access width; g_073E (L) | explicit DS reference; ov19:0EF8 |
| 0768 | unknown access width; g_0768 (L) | explicit DS reference; ov19:0EF8 |
| 0792 | unknown access width; g_0792 (L) | explicit DS reference; ov19:0EF8 |
| 07BC | unknown access width; g_07BC (L) | explicit DS reference; ov19:0EF8 |
| 07E6 | unknown access width; g_07E6 (L) | explicit DS reference; ov19:0EF8 |
| 2620 | Word observed; g_2620 (L) | explicit DS reference; ov13:26B0 |
| 2622 | Word observed; g_2622 (L) | explicit DS reference; ov13:1406 |
| 2626 | Word observed; g_2626 (L) | explicit DS reference; ov13:1406 |
| 2628 | Word observed; g_2628 (L) | explicit DS reference; ov13:0712 |
| 262C | Word observed; g_262C (L) | explicit DS reference; ov13:26B0 |
| 443A | Byte; g_443A, outcome flag (L) | ov05:0916 result branch; ov05:0000, ov05:0916, ov05:1527 |
| 443B | Byte; g_443B, fled flag candidate (M) | ov05:0916 selects The party has fled; ov05:04C9, ov05:0916 |
| 443C | Byte observed; g_443C (L) | explicit DS reference; ov09:07F2, ov09:0B3C |
| 443D | Byte observed; g_443D (L) | explicit DS reference; ov09:07F2, ov09:0B3C |
| 443E | Byte observed; g_443E (L) | explicit DS reference; ov09:0B3C |
| 470C | unknown access width; g_470C (L) | explicit DS reference; ov19:0EF8 |
| 470E | Word; g_470E, temporary picture offset (M) | ov18:02A4 DAX picture loader result; ov18:02A4 |
| 4710 | Word; g_4710, paired picture segment (M) | paired with 470E; ov18:02A4 |
| 4712 | Byte; g_4712, saved mode (H) | ov18:02A4 saves g_49F3 then restores; ov18:02A4 |
| 4713 | Pascal string; g_4713, numeric FINAL suffix (M) | ov18:02A4 Str(g_5376:0), FINAL + suffix |
| 4716 | Word observed; g_4716 (L) | explicit DS reference; ov19:004A, ov19:0AB3, ov19:1CEE, ov19:1F52 |
| 471A | Word observed; g_471A (L) | explicit DS reference; ov19:0AB3, ov19:1734, ov19:231A, ov19:2468 |
| 471C | Word observed; g_471C (L) | explicit DS reference; ov19:0AB3, ov19:1734, ov19:231A, ov19:2468 |
| 49D2 | far pointer; ecl_Mem4900 {was g_49D2} (H) | ECL_VM.md region-0 word-array base; ov07:01B6, ov07:0482, ov07:0C77, ov07:0E0C, ov07:0F53, ov07:12FB, ov09:03E4, ov19:0EF8 |
| 49D6 | far pointer; ecl_Mem6B00 {was g_49D6} (H) | ECL_VM.md region-1 word-array base; encounter/world fields +58E,+596,+5CC,+67C,+6E4; ov05:0000, ov05:04C9, ov05:11AC, ov05:1527, ov07:01B6, ov07:0482, ov07:054E, ov07:07BC, ov07:0C77, ov07:0E0C, ov07:0F53, ov07:12FB, ov07:1A6F, ov09:10D7, ov13:0000, ov13:0123, ov13:2998, ov18:02A4, ov19:0EF8, ov24:0CB7 |
| 49DA | Word observed; g_49DA (L) | explicit DS reference; ov07:0C77, ov07:0E0C, ov07:0F53, ov07:12FB |
| 49DE | Word observed; g_49DE (L) | explicit DS reference; ov07:0000, ov07:0341, ov07:0C77, ov07:0E0C, ov07:0F53, ov07:1153, ov07:12FB, ov07:1EA6 |
| 49E2 | Byte; g_49E2, animation-speed setting candidate (M) | ov18:0006 uses +3 in frame delay; 02A4 derives repeat count; ov18:02A4 |
| 49E3 | Word observed; g_49E3 (L) | explicit DS reference; ov07:01B6 |
| 49E5 | Word observed; g_49E5 (L) | explicit DS reference; ov07:01B6 |
| 49E7 | Word observed; g_49E7 (L) | explicit DS reference; ov07:01B6 |
| 49E9 | Word observed; g_49E9 (L) | explicit DS reference; ov07:01B6 |
| 49EB | Word observed; g_49EB (L) | explicit DS reference; ov07:01B6 |
| 49ED | Word observed; g_49ED (L) | explicit DS reference; ov07:0000, ov07:01B6, ov07:1153, ov07:1951, ov07:1EA6 |
| 49F3 | Byte; g_49F3, current mode (M) | 5 gates combat handling; finale saves/restores and sets 7; ov05:1527, ov18:02A4, ov19:0AB3, ov19:0EF8, ov19:14D0, ov19:1A8A, ov24:0160, ov24:1344, ov24:175D, ov24:1869 |
| 49F5 | Byte observed; g_49F5 (L) | explicit DS reference; ov19:004A |
| 49F6 | Byte observed; g_49F6 (L) | explicit DS reference; ov07:054E |
| 49F8 | Byte observed; g_49F8 (L) | explicit DS reference; ov07:01B6, ov19:0EF8 |
| 49FA | Byte observed; g_49FA (L) | explicit DS reference; ov07:054E |
| 49FD | Byte observed; g_49FD (L) | explicit DS reference; ov07:0511, ov07:0C77 |
| 49FE | Byte observed; g_49FE (L) | explicit DS reference; ov07:0511, ov07:0C77 |
| 49FF | Byte; PartyDead {was g_49FF} (H) | ECL_VM.md fetch-loop stop and combat cleanup; ov05:04C9, ov05:1527, ov07:01B6 |
| 4A00 | Byte observed; g_4A00 (L) | explicit DS reference; ov05:1527 |
| 4A20 | Word observed; g_4A20 (L) | explicit DS reference; ov18:0006, ov18:02A4 |
| 4A22 | Word observed; g_4A22 (L) | explicit DS reference; ov18:0006, ov18:02A4 |
| 5376 | Byte; g_5376, FINAL resource selector (M) | ov18:02A4 decimal suffix input; ov07:0341, ov07:07BC, ov18:02A4, ov19:004A |
| 557C | Byte observed; g_557C (L) | explicit DS reference; ov07:0341 |
| 557D | unknown access width; g_557D (L) | explicit DS reference; ov19:0EF8 |
| 5D92 | Word; g_5D92, selected-character offset candidate (M) | ov05:04C9 and ov19 inventory context; ov05:0000, ov05:04C9, ov05:0D38, ov05:0ECD, ov05:11AC, ov07:07BC, ov07:0A74, ov07:0F53, ov07:12FB, ov07:1684, ov07:1A6F, ov07:20CC, ov09:0255, ov13:1884, ov13:1E16, ov13:20C3, ov13:2414, ov19:004A, ov19:050D, ov19:0608, ov19:0901, ov19:0AB3, ov19:0EF8, ov19:14D0, ov19:1734, ov19:189D, ov19:1A8A, ov19:1CEE, ov19:1F52, ov19:231A, ov19:2468, ov19:27DF, ov19:299C |
| 5D94 | Word; g_5D94, paired segment candidate (M) | paired with 5D92; ov05:04C9, ov05:0D38, ov05:0ECD, ov05:11AC, ov07:1684, ov07:1A6F, ov07:20CC, ov09:0255, ov13:1884, ov13:1E16, ov13:20C3, ov13:2414, ov19:004A, ov19:0608, ov19:0AB3, ov19:0EF8, ov19:14D0, ov19:1734, ov19:189D, ov19:1A8A, ov19:1CEE, ov19:1F52, ov19:27DF, ov19:299C |
| 5D96 | Word; g_5D96, character-list head offset (M) | ov24:0160 and ov05 list traversal +104/+106; ov05:0000, ov05:0355, ov05:04C9, ov05:11AC, ov05:12E8, ov07:0756, ov07:1A6F, ov07:1FB1, ov09:0FC1, ov13:2879, ov13:2908, ov13:2998, ov13:3B93, ov19:0EF8, ov19:27DF, ov24:0160 |
| 5D98 | Word; g_5D98, paired list-head segment (M) | paired with 5D96; ov05:0000, ov05:0355, ov05:04C9, ov05:11AC, ov05:12E8, ov07:0756, ov07:1A6F, ov07:1FB1, ov09:0FC1, ov13:2879, ov13:2908, ov13:2998, ov13:3B93, ov19:0EF8, ov19:27DF, ov24:0160 |
| 5D9A | Word observed; g_5D9A (L) | explicit DS reference; ov05:0000, ov13:1884 |
| 5D9C | Word observed; g_5D9C (L) | explicit DS reference; ov05:0000, ov13:1884 |
| 5E24 | Byte observed; g_5E24 (L) | explicit DS reference; ov05:1527, ov07:20CC |
| 5E25 | Byte observed; g_5E25 (L) | explicit DS reference; ov05:1527, ov07:20CC, ov13:02F9, ov24:1344 |
| 5E52 | Word observed; g_5E52 (L) | explicit DS reference; ov18:06B3 |
| 5E54 | Word observed; g_5E54 (L) | explicit DS reference; ov18:06B3 |
| 5E56 | Word observed; g_5E56 (L) | explicit DS reference; ov18:06B3 |
| 5E58 | Word observed; g_5E58 (L) | explicit DS reference; ov18:06B3 |
| 5F2A | unknown access width; g_5F2A (L) | explicit DS reference; ov13:3B93, ov24:0F06 |
| 6715 | Byte observed; g_6715 (L) | explicit DS reference; ov13:1BF8, ov13:2DFA |
| 6716 | Word observed; g_6716 (L) | explicit DS reference; ov09:0255, ov09:0B3C, ov13:0712, ov13:1E16, ov13:20C3, ov13:2C3D, ov13:2DFA, ov13:32E6, ov13:37E4, ov13:3B93, ov24:0160 |
| 671A | Byte observed; g_671A (L) | explicit DS reference; ov09:0255, ov13:1E16, ov13:20C3, ov13:32E6, ov24:0160 |
| 671B | unknown access width; g_671B (L) | explicit DS reference; ov24:0160 |
| 67F4 | Word observed; g_67F4 (L) | explicit DS reference; ov05:0000, ov05:12E8, ov19:1F52 |
| 67F6 | Word observed; g_67F6 (L) | explicit DS reference; ov05:0000, ov05:12E8 |
| 67FA | Word observed; g_67FA (L) | explicit DS reference; ov05:0000 |
| 67FE | Word observed; g_67FE (L) | explicit DS reference; ov05:0000 |
| 6800 | Word observed; g_6800 (L) | explicit DS reference; ov05:0000 |
| 6802 | Word observed; g_6802 (L) | explicit DS reference; ov05:0000 |
| 6804 | Word observed; g_6804 (L) | explicit DS reference; ov19:1CEE |
| 6806 | Word observed; g_6806 (L) | explicit DS reference; ov05:0000, ov19:1CEE |
| 680A | Word observed; g_680A (L) | explicit DS reference; ov05:0000 |
| 680E | Word observed; g_680E (L) | explicit DS reference; ov05:0000 |
| 6810 | Word observed; g_6810 (L) | explicit DS reference; ov05:0000, ov05:0B14, ov05:0C06, ov05:1527, ov13:1884 |
| 6812 | Word observed; g_6812 (L) | explicit DS reference; ov05:0000, ov05:0B14, ov05:0C06, ov05:1527, ov13:1884 |
| 6814 | unknown access width; g_6814 (L) | explicit DS reference; ov09:03E4, ov09:0545 |
| 6816 | Byte; g_6816, saving-throw scratch (M) | ov24:0D63 d20 and modified roll; ov24:0D63 |
| 6817 | Byte; g_6817, effect applicability scratch (M) | ov24:1656 hook 9 then zero test; ov24:1656 |
| 6818 | Byte; g_6818, pending damage (H) | ov24:1344 damage amount and text; ov13:0191 base damage; ov13:0191, ov13:1406, ov24:1344 |
| 6819 | Byte; g_6819, damage flags (M) | ov24:1344 masks 1 fire,2 cold,4 electricity,10h acid,8 magic flag; ov13:0191, ov24:1344 |
| 681A | Byte; g_681A, movement/initiative scratch (M) | ov13:0000,+0123 and hook 12; ov13:0000, ov13:0123, ov13:0D23 |
| 681C | Byte; g_681C, dice count scratch (H) | ov24:0E2E writes count before RollDice; ov24:0E2E |
| 681D | Byte; g_681D, hook-context flag (M) | ov13:0123 sets 1 around hook 12 then clears; ov13:0000, ov13:0123, ov13:0D23 |
| 681E | Byte; g_681E, hook-result flag (L) | ov13:1085; ov13:1085 |
| 6820 | Byte observed; g_6820 (L) | explicit DS reference; ov13:20C3 |
| 6821 | Byte observed; g_6821 (L) | explicit DS reference; ov19:0EF8 |
| 6822 | Byte observed; g_6822 (L) | explicit DS reference; ov13:1406, ov24:0C4F, ov24:0CB7 |
| 6823 | Byte observed; g_6823 (L) | explicit DS reference; ov13:1406, ov13:39D2 |
| 6824 | Byte observed; g_6824 (L) | explicit DS reference; ov13:1406 |
| 6825 | Byte observed; g_6825 (L) | explicit DS reference; ov09:10D7 |
| 6826 | Word observed; g_6826 (L) | explicit DS reference; ov13:3A86 |
| 6828 | direct array of far procedure pointers; g_6828 (H) | 9800:001E FF9D2868, DS:[DI+6828] after DI=id*4; table extent/slot meanings unknown; ov13:3A86, ov24:0000 |
| 682A | Byte; g_682A, save-kind scratch (M) | ov24:0D63 before hook 12; ov24:0D63 |
| 6AAC | Byte observed; g_6AAC (L) | explicit DS reference; ov07:054E |
| 6AAD | Byte observed; g_6AAD (L) | explicit DS reference; ov07:0C77, ov07:0E0C, ov07:19DB |
| 6AAE | Byte observed; g_6AAE (L) | explicit DS reference; ov07:0C77, ov07:0E0C, ov07:19DB |
| 6AAF | Byte observed; g_6AAF (L) | explicit DS reference; ov07:0C77, ov07:0E0C, ov07:19DB, ov09:07F2 |
| 6AB0 | Byte observed; g_6AB0 (L) | explicit DS reference; ov07:0E0C, ov07:19DB |
| 6AB1 | Byte observed; g_6AB1 (L) | explicit DS reference; ov07:0E0C, ov07:19DB |
| 6ABE | unknown access width; g_6ABE (L) | explicit DS reference; ov07:054E |
| 6AC4 | Word observed; g_6AC4 (L) | explicit DS reference; ov07:054E |
| 6AC6 | Word observed; g_6AC6 (L) | explicit DS reference; ov07:054E |
| 6B00 | unknown access width; g_6B00 (L) | explicit DS reference; ov07:0A74, ov07:0F53, ov07:12FB |
| 6B80 | Word observed; g_6B80 (L) | explicit DS reference; ov19:1A8A |
| 6B82 | Word observed; g_6B82 (L) | explicit DS reference; ov19:1A8A |
| 6C90 | unknown access width; g_6C90 (L) | explicit DS reference; ov13:20C3 |
| 6C92 | unknown access width; g_6C92 (L) | explicit DS reference; ov13:20C3 |
| 6C94 | Byte observed; g_6C94 (L) | explicit DS reference; ov13:20C3 |
| 6C95 | Word observed; g_6C95 (L) | explicit DS reference; ov13:20C3 |
| 6C97 | Word observed; g_6C97 (L) | explicit DS reference; ov13:20C3 |
| 6DB9 | Byte observed; g_6DB9 (L) | explicit DS reference; ov13:1E16, ov13:20C3 |
| 6DBA | Byte observed; g_6DBA (L) | explicit DS reference; ov13:1E16, ov13:20C3 |
| 6DBF | Byte observed; g_6DBF (L) | explicit DS reference; ov19:1A8A |
| 6DE2 | Byte observed; g_6DE2 (L) | explicit DS reference; ov13:2998 |
| 6DE3 | Byte observed; g_6DE3 (L) | explicit DS reference; ov13:0E52 |
| 6DE5 | Byte observed; g_6DE5 (L) | explicit DS reference; ov13:0E82 |
| 6E2D | Byte observed; g_6E2D (L) | explicit DS reference; ov13:1406, ov13:1884 |
| 6E2E | Byte observed; g_6E2E (L) | explicit DS reference; ov13:1406 |
| 6E2F | Byte observed; g_6E2F (L) | explicit DS reference; ov09:10D7, ov13:2879 |
| 6E30 | Byte observed; g_6E30 (L) | explicit DS reference; ov09:0545, ov09:0FC1 |
| 6E31 | Byte observed; g_6E31 (L) | explicit DS reference; ov13:08B2, ov13:0E82, ov13:116A, ov13:2DFA |
| 6F68 | Byte observed; g_6F68 (L) | explicit DS reference; ov07:01B6, ov07:0C77 |
| 6F69 | Byte observed; g_6F69 (L) | explicit DS reference; ov07:01B6, ov07:0C77 |
| 6F6A | Word observed; g_6F6A (L) | explicit DS reference; ov07:0E0C |
| 6F6C | Word observed; g_6F6C (L) | explicit DS reference; ov07:0E0C |
| 6F6E | Word observed; g_6F6E (L) | explicit DS reference; ov07:0E0C |
| 6F70 | Word observed; g_6F70 (L) | explicit DS reference; ov07:01B6, ov07:1951 |
| 6F72 | Word observed; g_6F72 (L) | explicit DS reference; ov07:01B6, ov07:1951 |
| 6F74 | Word observed; g_6F74 (L) | explicit DS reference; ov07:01B6, ov07:1951 |
| 6F76 | Word observed; g_6F76 (L) | explicit DS reference; ov07:01B6, ov07:1951 |
| 6F78 | Byte observed; g_6F78 (L) | explicit DS reference; ov07:01B6, ov07:1815, ov07:18EB |
| 6F79 | Byte observed; g_6F79 (L) | explicit DS reference; ov07:1815, ov07:18EB |
| 6F7A | Byte observed; g_6F7A (L) | explicit DS reference; ov07:1815, ov07:18EB |
| 6F7B | Byte observed; g_6F7B (L) | explicit DS reference; ov07:1815, ov07:18EB |
| 6F7C | Byte observed; g_6F7C (L) | explicit DS reference; ov07:1815, ov07:18EB |
| 6F7D | Byte observed; g_6F7D (L) | explicit DS reference; ov07:1815, ov07:18EB |
| 6F7F | Byte observed; g_6F7F (L) | explicit DS reference; ov07:1EA6 |
| 6F83 | Byte observed; g_6F83 (L) | explicit DS reference; ov07:01B6, ov07:1A6F |
| 7046 | Byte observed; g_7046 (L) | explicit DS reference; ov07:01B6 |
| 7086 | Byte observed; g_7086 (L) | explicit DS reference; ov07:01B6 |
| 70C6 | Byte observed; g_70C6 (L) | explicit DS reference; ov07:01B6 |
| 84CC | Word observed; g_84CC (L) | explicit DS reference; ov07:0C77 |
| 84CE | Word observed; g_84CE (L) | explicit DS reference; ov07:0C77 |
| 84D0 | Word observed; g_84D0 (L) | explicit DS reference; ov07:0C77 |
| 84D2 | unknown access width; g_84D2 (L) | explicit DS reference; ov07:01B6, ov07:0A74 |
| 84D3 | unknown access width; g_84D3 (L) | explicit DS reference; ov07:01B6, ov07:0A74 |
| 84D4 | Byte; g_84D4, duel-mode flag (H) | ov05:0916 chooses duel won/lost wording; ov05:0000, ov05:04C9, ov05:0916, ov05:1527, ov07:1A6F |
| 84D5 | Byte observed; g_84D5 (L) | explicit DS reference; ov05:04C9 |
| 84D6 | unknown access width; g_84D6 (L) | explicit DS reference; ov05:04C9, ov05:1527 |
| 84D8 | unknown access width; g_84D8 (L) | explicit DS reference; ov05:04C9, ov05:1527 |
| 84DA | Byte; g_84DA, duel-success flag (M) | ov05:0916 chooses You have won the duel; ov05:04C9, ov05:0916 |
| 84E0 | unknown access width; g_84E0 (L) | explicit DS reference; ov07:01B6, ov07:054E |
| 84E1 | unknown access width; g_84E1 (L) | explicit DS reference; ov07:0511, ov07:054E |
| 84E2 | unknown access width; g_84E2 (L) | explicit DS reference; ov07:01B6 |
| 84E3 | unknown access width; g_84E3 (L) | explicit DS reference; ov07:054E |
| 84E5 | unknown access width; g_84E5 (L) | explicit DS reference; ov07:01B6, ov07:0C77 |
| 84E6 | unknown access width; g_84E6 (L) | explicit DS reference; ov07:0C77 |
| 84E8 | unknown access width; g_84E8 (L) | explicit DS reference; ov07:0C77 |
| 84E9 | unknown access width; g_84E9 (L) | explicit DS reference; ov07:054E |
| 84EA | Byte observed; g_84EA (L) | explicit DS reference; ov07:054E |


Additional symbol aliases present in bodies (Ghidra named-string aliases may be stale-CS artifacts; these are **not proven DS variables**):

| DS candidate | Type | Evidence |
| --- | --- | --- |
| 023A | unknown; g_023A (L) | decompiler symbol/address alias only; establish segment before implementation |

Additional indirect bases: DS:0900 / 090B tile-index strips; 091D / 092D / 093D drawing arrays and 094D / 095F coordinates (ov18:06B3); DS:5582 item table stride $10 (ov09:128D/13CA); DS:65B9 far-pointer index stride 4 (ov09/ov13); DS:671B temporary $D8-byte record (ov24:0160); DS:3208/3209 action metadata stride $10 (ov09:02EB). Bounds/full layouts unknown.

Character field crossref: +7F/+81 effect head, +C8/+CA inventory candidate, +CC/+CE and +D0/+D2 readied item candidates, +104/+106 next character, +108 far pointer to combat record, +10C status, +10D actionable/alive flag candidate, +10E party/monster affiliation candidate, +11B current HP, +32 max HP. These are **record-relative**, not DS globals. Names M except effect linkage H. Combat record +108 contains actions/initiative/movement and target fields; full layout not claimed.

## Unknowns

**Independent byte review:** hand-reconstructed bodies: ov24:0000, ov24:0DE3, ov24:0E2E, ov24:0D63, ov24:0E52, ov24:0026, ov19:0EF8, ov19:0D70, ov19:2468, ov19:231A, ov19:2156, ov18:0006. Other bodies remain conservative mechanical Pascal-style transcriptions of Ghidra C, with explicit register/ABI/location unknowns. Final artifact counts are reported below. Routine naming confidence does not imply source-body verification.

**Export defects requiring tooling review:** ov19:231A is not a routine start; 2468 is a shared tail; actual entries 0D70 and 2156 are absent. ov19:0EF8 exported flow reaches a foreign 8E00:1F30 RETF, while bytes 148E..1493 give the real local epilogue. Near CALL/JMP comments can have wrong CS as well as string operands. For disputed near targets, use signed displacement from instruction end in the owning unit. Do not apply exported foreign CS to current overlay bytes.



- Coverage: 149 sections = 147 exported candidates + 2 corrected real entries. Of the exported candidates, 231A is invalid and 2468 is a shared tail; both explicitly rejected as independent source procedures. Seven empty initializers are included.
- Naming confidence: H 42, M 47, L 60; name confidence is independent of body confidence.
- Source-location unknowns: 5789 routine-only anchors, including structural lines and compiler temporaries. These are explicitly not claimed exact source statement offsets. Exact call/store and manually traced anchors elsewhere still require independent occurrence review.
- Dataflow unknowns: 618 unresolved register references; 12 remaining explicit Flags.ZF membership writes with consumer propagation pending. Three residual prototype/RETF cleanup mismatches are flagged in their sections. UNKNOWN_* game/ABI/dataflow operations are intentionally not invented implementations.
- Raw-byte reviewed replacements: 12 sections, including the two corrected real entries and two rejected export candidates. Unsupported AST expression nodes in the remaining transcription: 0.
- All game-call ABIs, split far-pointer segment propagation, repeated-occurrence anchors and string-destination lifetimes require independent assembly review. Helpers with implicit register operands are not fully reconstructed. Decompiled nil-list OR/AND predicates require branch checks before implementation.
- Known hazards: SetIn preserves flags rather than returning a Boolean in AX; stale flag variables and stack-address predicates must not be implemented literally. Ghidra unreachable-block warnings remain for review. Dynamic callbacks and DS text tables are not exhaustive.
- Screen unknowns: exact positions outside the explicitly traced finale, resident key normalization, function-key/joystick mappings, implicit DS strings and conditional command availability. See numeric tests/call sites; labels alone do not prove shortcuts.
- ECL_VM.md arrived during final review: verified ov07 names incorporated; interpreter semantics remain owned by por-ecl. ECL support bodies here retain initial decompile artifacts; use the VM spec for source-level operand/memory semantics. Compiler/source names, effect-id table meanings and full actor/combat/equipment layouts still need crossref.


Read-only source snapshot hashes (SHA-256). These are the initial working listings; committed listing snapshot `bd4483c` contains the corresponding original instruction inventory. A concurrent tooling re-export began during final checks and is correcting the CS-flow defects; this draft intentionally keeps its initial-source provenance. Newly arrived ECL names are crossrefs, not an assertion that all bodies use the fresh export.

| Input | SHA-256 |
| --- | --- |
| decode/listings/ov05.lst | 6862f0e6e98629a31431a456d7d82c55e050557d5047e8c5211554889b2e70ff |
| decode/listings/ov05.c | a7aef325626c5aa26ad9ae4343bc602951dbadbe2a8e4f74c5cb660a6eb1688e |
| decode/listings/ov07.lst | d959ddc279470a622f7f85f55478b48fd9df1d5f65a93d9cbd0eec0236725a36 |
| decode/listings/ov07.c | eb3aa3bbc0caee971ba376864d46a6427f1a903eacc2e57472866334ceb66ccb |
| decode/listings/ov09.lst | 16dc3eeb0f21cc65294ca1deda15b2ce61a2d64f2076a525171bad221cb9caa7 |
| decode/listings/ov09.c | 772285e661de8af610d48f0fdfb31c634f9cf5b39ac35ca6e7d1649b34963206 |
| decode/listings/ov13.lst | 3d221a5912c4827ce215193f47e50013a78c2d134d5c80509eeb6041c2965e74 |
| decode/listings/ov13.c | af30d093a3a44c3b4d6b34719ebeea2cf0de89635a51a827c402d91d94b02da1 |
| decode/listings/ov18.lst | ca71394e1767fd1896cd23400345722f91905c6ddb19af9a39291093199dec85 |
| decode/listings/ov18.c | 0c69f9f46a3ea3a09172bf22a51a6c8e184047624323c9a7045b2651703f21a1 |
| decode/listings/ov19.lst | 809b723f2bb7ca6a16e51fce629f747720a0dd5a35e31d79fb6ddc0fb3bc41a1 |
| decode/listings/ov19.c | 68950f7ba00c5640a6b7c77c91ba242c4f3969dbdec9d8c1aab1e00132cd6eaa |
| decode/listings/ov24.lst | f0a2e9840db1eda4365972d80d2dc8fb12c2111264cc21f20a96a599d128631d |
| decode/listings/ov24.c | e35ee7e3268dfd25fa170abf0ad9ea42b4e03fcac93f4562189bba5ad74cb79f |
