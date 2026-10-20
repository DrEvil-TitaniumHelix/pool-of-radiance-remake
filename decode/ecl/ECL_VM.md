# ECL_VM — the Pool of Radiance event-script virtual machine (por-ecl)

Owner: por-ecl. Tools: `decode/tools/ecldis.py` (disassembler, driven by this spec), `decode/ecl/hdis.py`
(annotated capstone disassembly of an overlay range, used for every "asm" citation below), `decode/ecl/cfilt.py`
(decompile filter). Names: `decode/names/ecl_names.json`. Listings: `decode/ecl/listings/ECL<n>_<rec>.ecl.txt`.

Address convention: overlay unit N is at analysis segment `2000h + N*500h` (LAYOUT.md); ov03 = `2F00`, ov07 = `4300`.
`DS` = 0C7C. "asm" = verified on the instruction bytes; "dec" = read from the Ghidra decompile only (parameter
order corrected: Ghidra lists TP far-proc parameters right-to-left). Confidence H/M/L per item.

Decompiler artifact to read around: the code buffer is addressed as `CodeBuf + PC + 6700h`; `6700h = -9900h`
(mod 10000h), i.e. byte `CodeBuf[PC - 9900h]`. Likewise `+6E00h` = `-2*4900h`, `+2A00h` = `-2*6B00h`,
`-2E00h` = `-2*9700h` (word arrays indexed by `addr - base`).

---------------------------------------------------------------------------------------------------------
## 1. Where the interpreter lives (gate item: "ECL interpreter found") — H

| routine | address | role | evidence |
|---|---|---|---|
| `LoadEclBlock(n)` | ov07_0341 4300:0341 | FillChar(CodeBuf^, 1E00h, 0); repeat LoadDaxRecord('ECL'+Str(DS:5376)+'.dax', id = n) until size >= 2; `Move(rec[2], CodeBuf^, size-2)`; FreeMem | asm 4300:0348..040E; strings `[ps] "ECL"` 4300:0338, `".dax"` 033C; `CALLF 0802:0716` = LoadDaxRecord (DAX.md) |
| `ecl_InitVM` | ov07_01B6 4300:01B6 | clears VM/encounter flags, `PC := 9900h`, reads the 5 header vectors, gosub stack := nil | dec + asm (`MOV word [49ED],9900h` 4300:01D7; five `ecl_ReadOperands(1)` + `MakeWord`) |
| `ecl_Run(addr)` | 2F00:3171 | the fetch loop (below) | asm 2F00:3171..31B0 |
| `ecl_Dispatch` | 2F00:2F2D | `case CurOp of` — a TP compare chain (`CMP AL,n / JNZ / CALL handler`), **no jump table**; 0..3Dh, 1Fh absent | asm 2F00:2F2D..3170 |
| `ecl_ReadOperands(n)` | ov07_0000 4300:0000 | operand decoder (§2) | asm |
| `ecl_OperandValue(i)` | ov07_0136 4300:0136 | value of decoded operand i | asm |
| `ecl_GetMem(a)` / `ecl_SetMem(a,v)` | ov07_0E0C / ov07_0C77 | VM memory (§3) | asm/dec |
| `ecl_GetMemString(a,slot)` / `ecl_SetMemString(a,s)` | ov07_12FB / ov07_0F53 | string variables | dec |
| `ecl_SkipInstruction` | ov07_1EA6 4300:1EA6 | used by IF when the condition is false (§2.4) | dec, checked vs asm |
| `ecl_CompareWords(a,b)` / `ecl_CompareStrings(a,b)` | ov07_18EB / ov07_1815 | set the 6 condition flags | asm |
| `ecl_Gosub(i)` | ov07_1951 | push PC, PC := operand i address | dec |
| `ecl_GameLoop` | ov03_32F8 2F00:32F8 | adventure loop: calls the VM through the vectors (§5) | asm |

Fetch loop, from the bytes at 2F00:3171:

```pascal
procedure ecl_Run(addr: word);                 { 2F00:3171 }
begin
  ecl_PC := addr;                              { DS:49ED }
  ecl_Stop := false;                           { DS:442E }
  while not ecl_Stop and not PartyDead do      { DS:49FF }
  begin
    ecl_LastOp := ecl_CurOp;                   { DS:6F7E := DS:6F7F }
    ecl_CurOp  := CodeBuf^[ecl_PC - $9900];    { ES:[DI+6700h] }
    ecl_Dispatch;                              { 2F00:2F2D }
  end;
  ecl_Stop := false;
end;
```

Each handler is responsible for advancing `ecl_PC` (`ecl_ReadOperands` leaves it on the next opcode; operand-less
handlers do `INC word [49ED]`). **Opcode 1Fh and any opcode > 3Dh have no handler: the PC is not advanced and the
loop spins forever** (H, asm: the chain ends at `CMP AL,3Dh / JNZ 316F`). No such opcode is reachable in the
shipped scripts (§7).

---------------------------------------------------------------------------------------------------------
## 2. Operand encoding — H (asm 4300:0000..0133, 4300:0136..01B3)

`ecl_ReadOperands(n)` decodes n operands that follow the byte at `PC` into three parallel 1-based byte arrays
`OpType[i]` = DS:7006+i-1, `OpLo[i]` = DS:7086+i-1, `OpHi[i]` = DS:7046+i-1, and string operands into the string
slots `Str[k]` = `DS:6FC8 + k*100h` (string[255]; k counts string operands of this call, 1, 2, ...):

| type byte | bytes | meaning | value (`ecl_OperandValue`) |
|---|---|---|---|
| `00` | `00 bb` | immediate byte | `bb` |
| `01` | `01 lo hi` | memory reference | `ecl_GetMem(hi*256+lo)` |
| `02` | `02 lo hi` | immediate word | `hi*256+lo` |
| `03` | `03 lo hi` | memory reference (same as 01 in this engine) | `ecl_GetMem(hi*256+lo)` |
| `80` | `80 len b1..blen` | packed text, unpacked into `Str[k]` (§2.2); `len = 0` → empty string | `ecl_GetMem(OpHi*256+len)` (meaningless, never used) |
| `81` | `81 lo hi` | string variable at address `hi*256+lo`, copied into `Str[k]` by `ecl_GetMemString` | `hi*256+lo` |
| other | `tt bb` | (2 bytes consumed) | unassigned local → undefined (L); not present in data |

Handlers that need an **address** (a destination) do not call `ecl_OperandValue`; they take
`MakeWord(OpLo[i], OpHi[i])` (ov07_06AF: `hi*100h+lo`; first pushed = lo; written `a(i)` below) directly, whatever the type byte is.

```pascal
procedure ecl_ReadOperands(n: byte);           { 4300:0000, asm }
var i, k: byte;
begin
  k := 0;
  for i := 1 to n do begin
    OpType[i] := Code[PC+1]; OpLo[i] := Code[PC+2]; PC := PC + 2;
    case OpType[i] of
      1, 2, 3: begin PC := PC + 1; OpHi[i] := Code[PC] end;
      $80:     begin Inc(k); if OpLo[i] > 0 then ecl_UnpackString(k, OpLo[i]) else Str[k] := '' end;
      $81:     begin Inc(k); PC := PC + 1; OpHi[i] := Code[PC];
                     ecl_GetMemString(MakeWord(OpHi[i], OpLo[i]), k) end;
    end;
  end;
  PC := PC + 1                                  { -> next opcode }
end;
```

### 2.1 Variable-length instructions — H (asm)
Handlers 15h (VERTICAL_MENU), 25h/26h (ON_GOTO/ON_GOSUB) and 2Bh (HORIZONTAL_MENU) read their fixed operands,
then do `DEC word [49ED]` and `ecl_ReadOperands(count)` again, where count = the value of their last fixed
operand (15h: operand 3; 25h/26h/2Bh: operand 2). The second call **overwrites operand slots 1..count and restarts
string slot numbering at 1** (2F00:0F5A, 2F00:1920 dec, 2F00:1103). Encoded form: `op fixed... extra[1..count]`.

### 2.2 Packed text — H (ecl_UnpackString 4300:1153 dec + asm 4300:00B3; ecl_SixBitChar 4300:06D3)
Every 3 bytes hold four 6-bit codes, most significant first: `c1 = b1>>2`, `c2 = (b1&3)<<4 | b2>>4`,
`c3 = (b2&0Fh)<<2 | b3>>6`, `c4 = b3&3Fh`. Code 0 is skipped; codes `01..1F` → `chr(code+40h)` ('A'..'_'), codes
`20..3F` → `chr(code)` (space, digits, punctuation). `len` counts bytes; a trailing partial group yields only its
whole codes (+ c4 of the last group when the phase ends on it). All 29 records decode to clean upper-case text with
this rule (e.g. ECL1/18 at 9A36: "THE PLAZA AHEAD IS CROWDED WITH MONSTERS. HOW WILL YOU PROCEDE?").

### 2.3 Condition flags — H (asm 4300:18EB, 4300:1815)
Six bytes `DS:6F78..6F7D` = EQ, NE, LT, GT, LE, GE, all cleared then set from `CompareWords(a, b)` (unsigned 16-bit,
a = operand 1, b = operand 2) or `CompareStrings(s1, s2)` (TP `@StrCompare`, same orientation). Also written by
COMPARE_AND (14h, EQ/NE only), AND/OR (2Fh/30h: compare(0, result), 2F00:0E3E pushes 0 first — #verify-8), FIND_ITEM (32h, EQ/NE).

### 2.4 IF and the skip table — H (asm 2F00:0B52, dec+asm 4300:1EA6)
`IF_xx` (16h..1Bh) has no operands: `PC := PC+1`; if the flag (16 EQ, 17 NE, 18 LT, 19 GT, 1A LE, 1B GE) is
**false** the next instruction is skipped by `ecl_SkipInstruction`, which does `ecl_ReadOperands(k)` with k taken
from a fixed table by opcode — *not* from the handlers:

| k | opcodes |
|---|---|
| 1 | 01 02 0A 0E 11 12 1D 20 2D 32 34 36 38 39 3C |
| 2 | 03 08 09 0C 0F 10 1F 22 |
| 3 | 04..07 0B 21 28 2A 2F 30 35 37 3B |
| 4 | 14 23 |
| 5 | 2E |
| 6 | 1E 2C |
| 8 | 27 |
| 14 | 29 |
| 0 (PC+1) | all others: 00 0D 13 15 16..1B 1C 24 25 26 2B 31 33 3A 3D |

Engine quirks (H): the table disagrees with the handlers for **0Ch** (table 2, handler 3), **36h** (table 1, handler
2), and the variable-length **15h/25h/26h/2Bh** (table 0: only the opcode byte is skipped, the PC then lands inside
the operands). A faithful reimplementation must use this table, not the decoder, for skipping. `ecldis.py` follows
the table for the skip successor (`SKIPCOUNT`).

---------------------------------------------------------------------------------------------------------
## 3. VM memory map (gate item: "memory the scripts address") — H unless noted

`ecl_MemRegion(a)` (ov07_06FB, dec): `4900..4CFF` → 0, `6B00..6EFF` → 1, `9700..98FF` → 2, `9900..B6FF` → 3, else 4.

| region | ECL addresses | storage | read (`ecl_GetMem`) | write (`ecl_SetMem`) |
|---|---|---|---|---|
| 0 | 4900..4CFF | word array at far ptr `DS:49D2` (saved: SAVGAM block 1, SAVES.md) | word | word; writing 49FD or 49FE also sets redraw flag `DS:84E8` |
| 1 | 6B00..6EFF | word array at far ptr `DS:49D6` (SAVGAM block 2) **overlaid by fields of the selected character** `DS:5D92` | `ecl_GetCharField` first; array if not a char field | array always, then `ecl_SetCharField` |
| 2 | 9700..98FF | word array at far ptr `DS:49DA` (SAVGAM block 3) | word | word |
| 3 | 9900..B6FF | the loaded script itself, **bytes** (`DS:49DE`, 1E00h) | byte | byte (scripts store into their own code/data area) |
| 4 | everything else | engine globals (below) | listed cases; others → uninitialised local (L: garbage) | listed cases; others ignored |

Strings (`ecl_SetMemString`/`ecl_GetMemString`): one character per **word** in regions 0..2, per byte in region 3,
0-terminated; region-1 address 6B00 = the selected character's name (string[15], `char+00h`).

### 3.1 Region 1 character overlay (ov07_07BC get / ov07_0A74 set; dec, offsets checked against SAVES.md TChar)
ECL offset = `a - 6B00h`; `char` = record at `DS:5D92` (TChar, 285 bytes, SAVES.md §3).

| ECL addr | get | set | TChar field (SAVES.md) |
|---|---|---|---|
| 6B00 | (array) | value 0 → `DS:84D3 := 1`; string = name | `name` |
| 6B18 | byte `+14h` | — | `con` (M: odd offset, as coded) |
| 6B20..6B70 | (array) | byte `char[a-6B1Fh+17h]` (`+18h..+68h`) | `mem_spell[]`, `known_spell[]` |
| 6B9B | byte `+6Eh` | — | `save[1]` |
| 6BA0 | shortint `+73h` | — | unk_73 |
| 6BA5..6BAC | byte `+77h..+7Eh` | — | `thief_skill[0..7]` |
| 6BB8 | byte `+84h` | byte `+84h` (value > B2h: −32h) | `npc_flags` |
| 6BBB,6BBD,6BBF,6BC1,6BC3 | word `+88h,+8Ah,+8Ch,+8Eh,+90h` | same | `money[0..4]` (copper..platinum) |
| 6BD8 | shortint `+A0h` | — | `alignment` |
| 6BF7 | word `+B8h` | word `+B8h` | (spell_slots tail; L) |
| 6BF9 | byte `+BAh` | byte `+BAh` | (L) |
| 6C00 | `+10Dh = 0` → 80h else 1 | v > 7Fh: `+10Dh := 0`, v = 87h: `+10Ch := 7` (stoned); v = 0: `DS:84D2 := 1` | `active`, `status` |
| 6C0C | `+10Eh=0 and +10Fh<>0` → 80h; `+10Eh=1` → 81h; else 0 | 0 / 80h / 81h → (+10Eh,+10Fh) = (0,0)/(0,1)/(1,1) | unk_10E (combat side? L) |
| 6C0D | found, value undefined (L) | — | |
| 6C1B | byte `+11Ch` | — | `move` |
| 6DB1, 6DB4 | 0-based party position of the selected char (`PartyIndexOf` ov07_0756) | — | |
| 6DCF | reaction bonus from `cha` (`+15h`): 3→0, 4→5, 5→10, 6→15, 7→20, 8..12→25, 13→30, 14→35, 15→40, 16→50, 17→55, 18..25→60 | — | |
| 6E12 | `DS:5376` (current data set / disk 1..8) | `FUN_0802_094A(byte(v))` (one byte argument; select data set, M) | |
| 6E22,6E24,6E26 | (array) | v > 80h: `LoadWallSet(v and 7Fh, slot 1/2/3)` (ov29_0E08, Pascal order (id, slot); asm 4300:0C1F..0C26) | |
| 6E3E | array word (= party member count, SAVES.md "+67Ch") | (array) | |

### 3.2 Region 4 engine globals (ov07_0E0C / ov07_0C77, asm 4300:0EA7..0F48)

| ECL addr | read | write |
|---|---|---|
| 00B1 | `DS:6F6E` | ignored |
| 00FB / 00FC | `DS:6F6A` / `DS:6F6C` | ignored |
| 00B8 / 00B9 | — | `DS:84CE` / `DS:84D0` |
| 033D | party facing `DS:6AAF` | — |
| 035F | case present but empty → **undefined value** (scripts COMPARE [035F] 3×; L: garbage) | — |
| 03DE | — | `DS:84CC` (sound selector used by CALL BA03h) |
| C04B | party X `DS:6AAD` | X, `DS:84E6 := 1` (view redraw) |
| C04C | party Y `DS:6AAE` | Y, redraw |
| C04D | facing / 2 (0..3) | `DS:6AAF := 2*(v mod 4)`, redraw |
| C04E | `DS:6AB0` (wall type ahead, `GetWallType` ov29_047B) | — |
| C04F | `DS:6AB1` (cell attribute, `GetCellAttr` ov29_057A) | — |
| C059 / C05F | — (C059: undefined) | `DS:6F68` / `DS:6F69` + `DS:84E5 := 1` (InitVM sets 41h / 09h; M: 3D backdrop colours, read by RefreshView ov26_016D) |

### 3.3 Well-known fixed addresses used by the engine around ECL (H where the code is cited)
- `49C6..49CC` region 0: game clock, 7 counters (ov20_03D5 AdvanceClock(count, unit) reads/writes them).
- `49C5` (word +18Ah of block 1): current 3D map id — written by LOAD_FILES before `Load3DMap`.
- `49E6` (+1CCh): **3D-area flag** (0 = not in a 3D area: frames drawn by `FUN_03F1_02E8`, distance fixed at 2,
  BACPAC/ICON graphics; ≠ 0 = 3D view). `ecl_InitVM` sets it to 1 after the vectors (`+1CCh := 1`). (M name)
- `49F2` (+1E4h): previous ECL block number (NEW_ECL saves `DS:84DC` there; the game loop restores `DS:84DC` from it).
- `6DC0`/`6DC1`: encounter distance (requested / actual, clamped to `ApproachDistance` ov07_0482).
- `6DCA` (+594h of block 2): search/look state bits (game loop §5; M).
- `6DCB`: SURPRISE result. `6DE1` (+5C2h): 0FFh = no 3D sprite (PICTURE then loads a full PIC).
- `6DE2` (+5C4h) / `6E6C` (+6D8h): COMBAT with no monsters → temple (ov04_0D09) / shop (ov06_053E).
- `4A00..4A1F` (region 0) and `6E79..6E82` (region 1): **block-local** — `ecl_InitVM` zeroes them on every block load unless a save is being resumed (`DS:49F8`) (H, asm 4300:02CD..0315). Persistent quest flags are the other script-only region-0 cells (4A20 and up). Full per-cell map: `decode/ecl/scripts/FLAGMAP.md`; engine roles: `decode/ecl/varkb.py`.

---------------------------------------------------------------------------------------------------------
## 4. Opcodes — every handler (gate item: "every opcode specified")

Columns: op, mnemonic, handler (ov03 offset, seg 2F00), fixed operand count `n` (the handler's
`ecl_ReadOperands(n)`), semantics (Pascal-style, `v(i)` = `ecl_OperandValue(i)`, `a(i)` = address `OpHi[i]*256+OpLo[i]`,
`S(k)` = string slot k), confidence. Mnemonics are this lane's, chosen from the handler bodies; §8 compares them
with the community names.

### 4.1 Control flow, arithmetic, memory

| op | mnemonic | handler | n | semantics | conf |
|---|---|---|---|---|---|
| 00 | EXIT | 0001 | 0 | if `DS:84E2`: frame (1,1)-(0Fh,0Fh) and, if 3D (`49E6` ≠ 0), frame (3,3)-(0Dh,0Dh) (`FUN_03F1_02E8`, colour 0Fh); if `DS:4430` restore SelectedChar from `DS:4436`; clear `DS:84C8/84C9`, `84E0`, `84E2`; `ecl_Stop := true`; `PC+1`; **free the whole gosub stack**; `DS:5E25 := 11h; 5E24 := 1` (text cursor row 17, col 1); `DS:84DE := 0`. Returns to the engine (ends `ecl_Run`). | H asm |
| 01 | GOTO | 00F4 | 1 | `PC := a(1)` | H asm |
| 02 | GOSUB | 0111 | 1 | `ecl_Gosub(1)`: push `PC` (already past the operand) on a heap linked list (`DS:6F70`, 6-byte nodes {ret, next}), `PC := a(1)` | H |
| 03 | COMPARE | 0126 | 2 | if `OpType[1] >= 80h or OpType[2] >= 80h` then `CompareStrings(S(1), S(2))` else `CompareWords(v(1), v(2))` | H asm |
| 04 | ADD | 01A3 | 3 | `SetMem(a(3), v(1) + v(2))` (16-bit wrap) | H asm |
| 05 | SUBTRACT | 01A3 | 3 | `SetMem(a(3), v(2) - v(1))` — **operand 2 minus operand 1** | H asm (2F00:01FC) |
| 06 | DIVIDE | 01A3 | 3 | `SetMem(a(3), v(1) div v(2))` (unsigned `DIV`; v(2)=0 → CPU divide fault → TP runtime error 200) | H asm |
| 07 | MULTIPLY | 01A3 | 3 | `SetMem(a(3), v(1) * v(2))` (low word) | H asm |
| 08 | RANDOM | 0234 | 2 | `n := byte(v(1)); if n < 255 then n := n+1; SetMem(a(2), byte(Trunc(Random(n))))` → 0..v(1) | H asm |
| 09 | SAVE | 0292 | 2 | if `OpType[1] >= 80h` then `SetMemString(a(2), S(1))` else `SetMem(a(2), v(1))` | H asm |
| 13 | RETURN | 0A9F | 0 | `PC+1`; if gosub stack not empty: `PC := pop` (node freed). **Empty stack: execution continues after the RETURN.** | H asm |
| 14 | COMPARE_AND | 0AED | 4 | clear flags; if `v(1)=v(2) and v(3)=v(4)` then EQ else NE (no other flags) | H asm |
| 16..1B | IF_EQ/NE/LT/GT/LE/GE | 0B52 | 0 | `PC+1`; if not flag then `ecl_SkipInstruction` (§2.4) | H asm |
| 25 | ON_GOTO | 18F8 | 2+v(2) | `x := v(1); cnt := v(2); PC-1; ReadOperands(cnt)`; if `x < cnt` then `PC := a(x+1)`; else fall through to the next instruction | H dec+asm 1920 |
| 26 | ON_GOSUB | 18F8 | 2+v(2) | same, but `ecl_Gosub(x+1)` | H |
| 2A | GET_TABLE | 0E5E | 3 | `SetMem(a(3), GetMem(a(1) + byte(v(2))))` — table base a(1) is usually an address inside the script (region 3) | H asm |
| 2F | AND | 0DEF | 3 | `r := byte(v(1) and v(2)); CompareWords(0, r); SetMem(a(3), r)` → EQ and GE iff r = 0, NE and LT iff r ≠ 0, LE always, GT never (0 is the first operand; corrected by por-mod-ecl) | H asm |
| 30 | OR | 0DEF | 3 | same with `or` | H asm |
| 35 | SAVE_TABLE | 0EBC | 3 | `SetMem(a(2) + v(3), v(1))` | H asm |
| 1F | — | none | — | no handler: VM hangs (PC not advanced). Not in data. | H |

### 4.2 Text, input, menus

Window conventions (M): `FUN_0709_0768(x1, y1, x2, y2, colour, clear, s)` = word-wrapped print, called by the text
opcodes as `(1, 11h, 26h, 16h, 0Ah, flag, s)` = text window rows 17..22, cols 1..38; `DS:5E24/5E25` = text cursor
column/row; `FUN_0709_0DD3(x1,y1,x2,y2)` = clear rectangle; `DS:4A00` = "printing" flag.

| op | mnemonic | handler | n | semantics | conf |
|---|---|---|---|---|---|
| 11 | PRINT | 0A09 | 1 | `DS:84E4 := 0; 4A00 := 1`; if `OpType[1] < 80h` then `S(1) := IntToStr(v(1))` (`FUN_00BA_1073`); print `S(1)` in the text window continuing at the cursor (clear flag 0); `4A00 := 0` | H asm |
| 12 | PRINTCLEAR | 0A09 | 1 | same, but cursor := (1, 11h) and clear flag 1 (clears the window first) | H asm |
| 33 | PRINT_RETURN | 2AEB | 0 | `PC+1; DS:84DF := 0; row := row+1; col := 1` (new line) | H dec |
| 3C | PRINT_MEM | 2E7D | 1 | clear `84C8/84C9`, `84E0`; `a := a(1)`; if `84DE` and row > 0Dh then row := 5, col := 2, `84E2 := 1`; `84DF := 1`; for i := 0.. : `c := GetMem(a+i)`; stop when `c` = 0 or 0FFh (low byte); put glyph `c+1` at (col,row) colour 0Fh (`FUN_0709_01DF`), col+1; finally row+1 | H dec |
| 3D | CLEAR_BOX | 2B14 | 0 | `PC+1`; clear (1,1)-(0Fh,0Fh) (the picture box); `DS:84DE := 1` | H dec |
| 0F | INPUT_NUMBER | 0951 | 2 | `n := ReadWordNumber('', 0Ah)` (0709:0B66; the prompt is a local byte 0 passed as an empty string); `SetMem(a(2), n)`; operand 1 unused | H asm |
| 10 | INPUT_STRING | 0994 | 2 | `s := ReadBottomLine('', 0Ah, 28h)` (0709:09E3; empty prompt as above); if s = '' then s := ' '; `SetMemString(a(2), s)`; operand 1 unused | H asm |
| 15 | VERTICAL_MENU | 0F08 | 3+v(3) | `dest := a(1); prompt := S(1); cnt := v(3); PC-1; ReadOperands(cnt)` (items → S(1..cnt)); build a list (ov25_1140), print prompt at (1,11h) colour 0Ah, copy items into list nodes, run the vertical list picker (ov07_1788 → ov25_0D9A, window 1..26h × row+1..16h), `SetMem(dest, chosen index)`; free list (ov25_11F3); clear text window | M dec |
| 2B | HORIZONTAL_MENU | 10D1 | 2+v(2) | `dest := a(1); cnt := v(2); PC-1; ReadOperands(cnt)`; if cnt = 1: highlight colours (0Fh,0Fh), and `S(1) = 'PRESS <RETURN> OR BUTTON TO CONTINUE'` is replaced by `'PRESS <ENTER>/<RETURN> TO CONTINUE'` (platform text; M); else colours (0Fh,0Ah); menu string := `'~'+S(1)+' ' + ... + '~'+S(cnt)`; `k := MenuSelect(...)` (ov07_1684, '~' marks the hot key letter); `SetMem(dest, k)` (0-based); clear row 18h | H dec |
| 39 | WHO | 2B33 | 1 | clear text window; `FUN_00BA_2C48(var SelectedChar, 0, S(1))` = "Select / Exit" party picker with prompt `S(1)` (M) | M dec |
| 3A | DELAY | 271F | 0 | `PC+1; FUN_0709_0DBE` (delay by game speed; M) | M |

### 4.3 Party / characters

| op | mnemonic | handler | n | semantics | conf |
|---|---|---|---|---|---|
| 0A | LOAD_CHARACTER | 02E0 | 1 | `DS:4430 := 1` (restore SelectedChar at EXIT); `x := byte(v(1)); idx := x and 7Fh`; walk the party list `DS:5D96` idx links; if not nil `SelectedChar := it`; if `x and 80h` and `DS:84D2` and `DS:84D3`: (if it is the char saved in `DS:4436` then `4430 := 0`); redraw the char display `ov16_3291(0,1)` (Pascal order), `FUN_00BA_0767(SelectedChar)`; clear 84D2/84D3 | H asm |
| 1D | PARTY_STRENGTH | 12C6 | 1 | `s := 0`; for each member c: `s := byte(s + (c[96h]*4 + c[11Bh] + max(c[111h]-3Ch,0)*5 + max(c[110h]-27h,0)*5 + c[9Bh]*8) div 10)`; `SetMem(a(1), s)` (offsets: level[0], hp, ac, thac0, level[5]) | H dec |
| 1E | CHECK_PARTY | 1435 | 6 | `key := a(1)` if `OpType[1]=1` else `v(1)`; `id := v(2)`; dest3..6 := a(3..6). key 0: found := any member `HasEffect(id)` (FUN_00BA_2199), min=max=avg := 0; key 6BA7h: min/max/avg over members of `c[79h]` (thief_skill[2]); key 6C1Bh: same over `c[11Ch]` (move); then `SetMem(a(3),min); SetMem(a(4),max); SetMem(a(5),avg); SetMem(a(6),found)`. Other keys: nothing stored. | H dec |
| 22 | PARTY_SURPRISE | 1629 | 2 | `r := 1 if any member class (c[2Fh]) = 4 (Ranger) or 10 (C/R) else 0; SetMem(a(1), r); SetMem(a(2), 0)` | H dec |
| 23 | SURPRISE | 16C9 | 4 | `p := v(4)+2-v(1); m := v(2)+2-v(3); r1 := 1d6; r2 := 1d6; res := 0; if r1 <= p then (if m < r2 then res := 1 else res := 3); if r2 <= m then res := 2; SetMem(6DCBh, res)` — res 3 is always overwritten by 2 (when r1 <= p and m >= r2 the last test also holds), so **only 0, 1, 2 occur** (side assignment M) | H dec |
| 28 | ROB | 1DB1 | 3 | `who := v(1); f := (100 - v(2)) / 100.0`; for the selected char (who=0) or every member: money[0..6] := Trunc(money*f) (ov07_1CC3); `LoseItems(c, v(2))` (ov07_1DF0: per item, p reduced by 32h for weight > 18h, by 5Ah for weight ≥ 100h — **cumulatively**, floored at 0; lose the item (FUN_00BA_1509) when 1d100 ≤ p). **Operand 3 is read but never used; the item chance is operand 2** | H asm |
| 2E | DAMAGE | 2775 | 5 | `flags := v(1); dice := v(2); sides := v(3); bonus := v(4); save := v(5); dmg := bonus + Roll(dice, sides)`. flags bit 7 clear: repeat `flags` times: pick a random member (`1d(member count 6E3Eh)`), if `ov24_0C4F(save, c)` (target check) then `ApplyDamage(c, dmg)` (ov07_20CC "is hit FOR n points of Damage"/"dies"), re-roll dmg. bit 7 set: `kind := flags and 1Fh; st := save and 7`; bit 6 set → every member (bit 5: no saving throw, else `ov24_0D63` saving throw kind/st decides); bit 6 clear → `save and 80h`: selected char (saving throw `SavingThrow(c, st−1, kind)` if st ≠ 0, 2F00:28B7 DEC AX), else the `1d(count)`-th member with a saving throw. Then `PartyDead := no member active (c[10Dh])`; if dead: "The END!" frame + "The entire party is killed!", Delay 3000. Restores SelectedChar, "press <enter>/<return> to continue" | M dec |
| 32 | FIND_ITEM | 266A | 1 | `id := byte(v(1))`; EQ := any item of any member has `type` (+2Eh) = id, else NE | H dec |
| 36 | ADD_NPC | 2B7E | 2 | `ov17_1262(v(1))` (load NPC character, M); `SelectedChar[84h] := (v(2) shr 1) or 80h` (NPC flag + morale?); `c[10Eh] := 1 if v(1) = 18h else 0`; recalc (`FUN_00BA_0BB8`), redraw | M dec |
| 3B | SPELL | 2C03 | 3 | `id := byte(v(1))`; search `c[17h+k]` (k = 1..52h, `mem_spell`) for id; `SetMem(lo(a(2)), k or 0FFh)`; `SetMem(lo(a(3)), member count walked)`. **Engine bugs (H, asm):** (1) the destination addresses are truncated to their low byte (`MOV [bp-9],AL` 2C29, `[bp-0Ah]` 2C39), so the writes land in region 4 and are ignored; (2) the found flag `[bp-8]` is never initialised (if non-zero on entry nothing is searched); (3) the slot index `[bp-2]` is set to 1 once (2C3C) and the inner loop always ends with the flag set (match, or k > 51h → k := FFh at 2C83), so **only the first party member is ever searched**; stored member value = 1 (0 if the garbage flag was set). Single use: ECL3/14 at 9ECA (Knock check before "CASTS A KNOCK SPELL") | H asm |
| 34 | ECL_CLOCK | 2AC1 | 1 | `AdvanceClock(byte(v(i)), 1)` (ov20_03D5; pushes (v, 1); by the decompile the first argument is the repeat count and 1 the clock counter index — M) — **i is an uninitialised local** (`MOV AL,[bp-1]` before any store, asm 2ACF), so the operand index is garbage | H asm |

### 4.4 Monsters, encounters, combat, treasure

| op | mnemonic | handler | n | semantics | conf |
|---|---|---|---|---|---|
| 0B | LOAD_MONSTER | 0450 | 3 | if `DS:4435 >= 3Fh` (monster count limit) nothing. `id := v(1)`: `ov07_0411(id)` = GetMem(11Dh) + `LoadMonster(rec, id)` (ov17_0EC4) returning the record, its item list (+C8h) and effect list (+7Fh); `cnt := max(v(2),1)`; `pic := v(3)`: `ov32_01C8('CPIC', pic, slot DS:6F83)` (combat icon); append cnt copies (each with its own item and effect list copies, `+BFh := DS:6F83`) to the end of the party list `DS:5D96` (monsters live in the same list), `DS:4435 += 1` per copy, stop at 3Fh; `DS:6F83 += 1; DS:84E7 := 1` (monsters present) | H asm |
| 0C | SETUP_MONSTER | 03B4 | 3 | `DS:6F81 := v(1)` (sprite id); `6DC0 := v(2)` (distance); `DS:6F82 := v(3)` (picture id); `6DC1 := min(6DC0, ApproachDistance(x,y,dir))` (ov07_0482: free squares ahead, max 2; 2 when not 3D); `ShowEncounter(6F81, 6F82, 6DC1, var DS:84C8)` (ov07_054E (sprite, pic, dist, var shown): SPRIT sprite at distance or PIC) | H asm |
| 0D | APPROACH | 0817 | 0 | if `6DC1 > 0`: `6DC1 -= 1`, `ShowEncounter(...)` again; `PC+1` | H asm |
| 0E | PICTURE | 0856 | 1 | `p := byte(v(1))`; if not 3D and p ≠ FFh: frame; p ≠ FFh: `84C9 := 1, 84E0 := 1`; if `6DE1 = FFh`: load `'PIC'` record p into `DS:6ABE` (ov28_00A2) and draw at (3,3) (ov28_0000), else `ShowHeadBodyPicture(p, 6DE1)` (ov07_0511: HEAD id `6DE1`, BODY id p, drawn at (3,3)); p = FFh: if (`49F9 > 1 or 49FA = 1`) and (84E0 or 84E3): redraw view (ov26_016D RefreshView), clear 84E0/84E3, 84E1 := 1; then (FFh path only) clear 84C8/84C9 | H asm |
| 1C | CLEAR_MONSTERS | 125D | 0 | `PC+1; DS:4435 := 0; 84E7 := 0; 6F83 := 8`; FillChar(DS:67F4, 1Ch) (treasure money); free the treasure item list `DS:6810` | H dec |
| 24 | COMBAT | 179B | 0 | `PC+1`. no monsters (`84E7 = 0` and `84D4 = 0`): if `6E6C = 1` → `6E6C := 0`, `ov06_053E` (shop); elif `6DE2 = 1` → `6DE2 := 0`, `ov04_0D09` (temple); else `ov05_1527`. monsters: clamp 6DC1 to ApproachDistance, `ov08_007A` (combat), `ov05_1527` (after-combat/treasure, M), if not 3D redraw BACPAC/ICON panels, `84D4 := 0`. Then `49F3 := 4` if `49FA = 1` else 3; `6DCA := 6DCA and 1`; clear 84C8/84C9, 84E0; `FUN_00BA_27D9` | M dec (callee roles M) |
| 27 | TREASURE | 19B0 | 8 | `DS:67F4[i] := (v(i+1), 0)` for i = 0..6 (money pool as 7 longints); `t := v(8)`: `t < 80h`: `LoadDaxRecord('ITEM'+Str(5376)+'.dax', t)` (abort "Unable to find item file" if size 0), append each 3Fh-byte item to the treasure list `DS:6810`; `80h <= t < FFh`: generate `t-80h` random items (1d100/1d16/1d10 tables → item type, `ov21_1010`; quirk: a roll of 48/49 leaves the type unset), then name every item of the list (FUN_00BA_0442) — **only on this branch**; the ITEMn.DAX branch returns without naming. Items are prepended (list in reverse record order). t = FFh: money only | H dec (ITEM.md) |
| 29 | ENCOUNTER_MENU | 1EF8 | 14 | `84E9 := 1; 4A00 := 1`; party move range (ov07_1FB1 → min/max of `c[11Ch]` ×2/÷2 by effects 27h/2Ah); `6F81 := v(1); 6DC0 := v(2); 6F82 := v(3); dest := a(4); react[0..4] := v(5..9)`; texts for distance 0/1/2 = S(1..3) (operands 10..12); `fleeLimit := v(13); monFleeLimit := v(14)`; distance setup as SETUP_MONSTER. Loop: print the text for the current distance (falls back to the next non-empty), menu `~COMBAT ~WAIT ~FLEE ~ADVANCE` (3D and distance > 0) or `~COMBAT ~WAIT ~FLEE ~PARLAY` (choice 3 then becomes 4 = PARLAY); `r := react[choice]`; outcome table below; repeat while the outcome is "again". `SetMem(dest, result)`: 0 = monsters fled, 1 = combat, 2 = party fled, 3 = parlay | H dec |
| 2C | PARLAY | 25CB | 6 | `resp[0..4] := v(1..5)`; `k := MenuSelect('~HAUGHTY ~SLY ~NICE ~MEEK ~ABUSIVE')`; `SetMem(a(6), resp[k])` | H dec |
| 31 | SPRITE_OFF | 2AA2 | 0 | `PC+1`; if `84E3`: redraw view (ov26_016D), `84E3 := 0, 84E0 := 0` | H dec |

ENCOUNTER_MENU outcome (`r` = react[choice]; choice 0 COMBAT, 1 WAIT, 2 FLEE, 3 ADVANCE, 4 PARLAY; "approach" = if
distance 0: "Both sides wait." (or result 3 for PARLAY/4) else distance−1 and redisplay, again):

| r | COMBAT | WAIT | FLEE | ADVANCE | PARLAY |
|---|---|---|---|---|---|
| 0 | 1 | 1 | partyMinMove >= v(13) ? 2 : 1 | 1 | 1 |
| 1 | 1 | "Both sides wait." again | 2 | approach (dist 0: "Both sides wait.") again | dist 0: 3, else approach |
| 2 | v(14) > partyMaxMove ? (0, "The monsters flee.") : 1 | 0, "The monsters flee." | 0 | 0 | 0 |
| 3 | 1 | approach | 2 | approach | dist 0: 3, else approach |
| 4 | 1 | dist 0: 3, else approach | 2 | dist 0: 3, else approach | dist 0: 3, else approach |

(H dec 2F00:1EF8; "approach" decrements `6DC1` and calls `ShowEncounter`.)

### 4.5 Engine calls, data loading

| op | mnemonic | handler | n | semantics | conf |
|---|---|---|---|---|---|
| 20 | NEW_ECL | 0BD1 | 1 | `49F2 := DS:84DC` (previous block); `84DC := byte(v(1))`; `ov17_22D5(g_547C + 'ECL' + Str(DataSet) + '.dax')` (the routine with the "Insert disk #" prompt: makes sure the file's disk is present, M); `LoadEclBlock(84DC)`; `ecl_InitVM`; `ecl_Stop := true; DS:442F := true` (restart: the game loop runs the new block's vectors); `DS:4431 := 0` | H asm |
| 21 | LOAD_FILES | 0C74 | 3 | `b1,b2,b3 := v(1..3)` (bytes, `[bp-3],[bp-2],[bp-1]`); `DS:4431 := 1; 4434 := 1`; if b1 ∉ {FFh, 7Fh} and 3D (`49E6` ≠ 0): `49C5 := b1; Load3DMap(b1)` (ov29_10C7); `6DC9 := 0` (+592h of block 2); if b3 ≠ FFh and not 3D: `ov32_0022('BACPAC', 28h, 0)` (2D backdrop); b2 unused here (M) | H asm |
| 37 | LOAD_PIECES | 0C74 | 3 | `DS:4431 := 1` (both 21/37, set at 0C82 before the opcode test); `DS:4433 := 1`; b1 = 7Fh: `LoadWallSet(0, 1)`; elif `49E7` and `49E8` ≠ 0: `LoadWallSet(b1, 1); LoadWallSet(b3, 3)`; else for slot 1..3: b(slot) ≠ FFh → `LoadWallSet(b, slot)` (Pascal order (id, slot), asm 2F00:0D2B..0D58), FFh → `DS:6AAE+4*slot := FFFFh, 6AB0+4*slot := FFFFh` (slot empty) | H asm (operand→slot mapping: `[bp+di-4]`, di = 1..3 = b1..b3) |
| (21/37) | | | | after either: if `4432` and `4433` and `4434` (map + wall sets loaded): `FUN_00BA_27D9` (redraw), char display, `4432 := 0` | H asm |
| 2D | CALL | 2CCF | 1 | `t := a(1)` (the **address field** selects an engine routine, the old 6502 entry points): 2C90h: `6AB1 := GetCellAttr(y,x)`; if `4431` and a redraw flag (84E0/84E3/84E5/84E6/84E8): redraw view + status, clear flags. 8000h: `SetupDuel(1)`; 8001h: `SetupDuel(0)` (ov07_1A6F: deactivate everyone but the selected char, append a copy named "ROLF" with CPIC icon 0Bh, `DuelActive (DS:84D4) := 1` so COMBAT runs the duel code — M). BA03h: sound `FUN_08AE_00DC(DS:2628)` if `84CC`=8, `(DS:262A)` if 10. C01Eh: step forward one square (ov07_19DB: wrap 0..15, update 6AB1/6AB0). C018h: if `49FA = 1`: `6AB0 := GetWallType(dir,y,x)`. Others: nothing — the scripts also CALL 0806h (13×), C01Bh, 2C4Eh, 2C51h (3× each), C003h, C009h (1×): **no-ops in PoR** (entry points of the original 8-bit engine that this port does not implement) | H dec |
| 38 | PROGRAM | 2E10 | 1 | if `4430`: restore SelectedChar; `p := v(1)`: 0 → `ov16_0161` (main menu / start screen, M), `FUN_00BA_27D9`; 8 → `ov18_02A4` (endgame sequence, M — used after "TYRANTHRAXUS HAS FINALLY BEEN DEFEATED"); 9 → camp: `ecl_CampCheck` (2F00:2DD3: run vecC, camp menu ov15_1E6F, vecD if rested), restore PC, then **call the EXIT handler** (`CALL 0001`, asm 2E76) | H asm |

---------------------------------------------------------------------------------------------------------
## 5. How the engine calls into the VM (gate item: "event/trigger tables") — H (asm 2F00:31B4..3507)

Record layout: `[2 bytes, skipped by LoadEclBlock]` + script, loaded at 9900h. The script starts with **five
GOTO instructions** (`01 01 lo hi`, 20 bytes); `ecl_InitVM` reads their operands as vectors:

| vector | DS | run by | when (from `ecl_GameLoop` ov03_32F8 / `ecl_RunAfterNewBlock` 2F00:31B4) |
|---|---|---|---|
| A | 49E3 | game loop | every adventure command that is not Encamp and not a search/look state, **before** the move (`if not PartyDead then ecl_Run(vecA)`) |
| B | 49E5 | game loop | **after** the move: stores x,y in `49F0/49F1`, `ov14_0D6D` (move/door handling), redraw, step sound if the position changed, then `ecl_Run(vecB)`; also with `6DCA := 1` when the input routine left a search/look state (`6DCA > 1`), restoring it afterwards |
| C | 49E7 | `ecl_CampCheck` 2F00:2DD3 | on the Encamp key ('E', `UpCase`) before the camp menu (`ov15_1E6F` "The party makes camp...") |
| D | 49E9 | `ecl_CampCheck` | after the camp menu if it reported a rest |
| E | 49EB | game loop start + after every NEW_ECL | block init (load map/walls/pictures, set variables) |

Game loop outline (asm 2F00:32F8):

```pascal
procedure ecl_GameLoop;                        { ov03_32F8 }
begin
  { 4430/4431/4433/4434 := 0, 4432 := 1 (3312); 49F3 := 4; 84DC := Mem[49F2] (block to resume);
    blocks 19h/1Ah/1Bh when not 3D: 49F3 := 3 (332D..3348) }
  if not ResumingSave (DS:49F8) then LoadEclBlock(84DC);
  ecl_InitVM;  ecl_Run(vecE);
  repeat
    key := ov14_0989;                          { adventure command input (Area/Cast/View/Encamp/Search/Look...) }
    if (Mem[6DCA] > 1) or (UpCase(key) = 'E') then begin
      if UpCase(key) = 'E' then ecl_CampCheck
      else begin save := Mem[6DCA] and 1; Mem[6DCA] := 1; redraw; ecl_Run(vecB);
                 if Restart then ecl_RunAfterNewBlock; Mem[6DCA] := save end
    end else begin
      DS:4436 := SelectedChar;               { saved after each key }
      if not PartyDead then ecl_Run(vecA);
      if Restart then ecl_RunAfterNewBlock
      else if not PartyDead then begin
        Mem[49F0] := X; Mem[49F1] := Y; ov14_0D6D; redraw;
        if (X,Y) changed then StepSound;
        84E0 := 0; 84E1 := 1; ecl_Run(vecB); if Restart then ecl_RunAfterNewBlock
      end
    end
  until PartyDead;
end;
```

`ecl_RunAfterNewBlock` (2F00:31B4): repeat { `6AB1 := GetCellAttr`; `Mem[6DD5] := 0`; `49F9 := 49FA; 49FA := 1`;
`ecl_Run(vecE)`; `49F3 := 4`; if not 3D: block 19h/1Ah/1Bh set `49FA := 2/3/4` (with `ov18_06B3(1)` for 1Ah when
`Mem[4AB3] = FEh and Mem[4AA2] = 0`), `49F3 := 3`; redraw as needed; `ecl_Run(vecA)`, unless restart `ecl_Run(vecB)` }
until no restart (`DS:442F`). Other entries: `ov11_002D` (new game init) sets `PC := 9900h`, ov14 sets `PC := vecB`
before returning a search command (dead store, M).

---------------------------------------------------------------------------------------------------------
## 6. VM state summary

| DS | name | meaning |
|---|---|---|
| 49DE | ecl_CodeBuf | far ptr, 1E00h-byte script buffer (VM 9900..B6FF) |
| 49D2 / 49D6 / 49DA | ecl_Mem4900 / 6B00 / 9700 | far ptrs to the 3 word arrays (saved with the game) |
| 49ED | ecl_PC | |
| 49E3..49EB | ecl_VecA..E | |
| 6F7F / 6F7E | ecl_CurOp / LastOp | |
| 6F78..6F7D | flags EQ NE LT GT LE GE | |
| 7006/7046/7086 (+i−1) | OpType/OpHi/OpLo[i] | i ≤ 14 fixed, up to 255 for menus (arrays are 40h apart: **more than 64 operands would overlap**; max in data = 13 ON_GOTO targets + 2) |
| 6FC8 + k*100h | Str[k] | string slots (k = 1..; 6FC8 itself = slot 0, unused) |
| 6F70 | ecl_GosubSP | linked stack on the heap (no depth limit; freed by EXIT) |
| 442E / 442F | Stop / Restart | |
| 49FF | PartyDead | ends ecl_Run and the game loop |
| 84DC | current ECL block number (record id) | |
| 5376 | current data set (file digit of ECLn/GEOn/ITEMn...) | |
| 4435, 6F83, 84E7 | monster count / next CPIC slot (starts 8) / monsters-present flag | |
| 84C8,84C9,84E0..84E9 | display state flags (sprite shown, picture shown, redraw requests) | M |

---------------------------------------------------------------------------------------------------------
## 7. Usage in the shipped scripts (gate item) — `python decode/tools/ecldis.py --stats`

29 records (ECL1 18,24; ECL2 9,15,20; ECL3 0,8,11,14; ECL4 2,10,21; ECL5 3..7; ECL6 1,19,25,28; ECL7 17,22,23,26;
ECL8 13,16,27,29), recursive traversal from the 5 vectors (IF: both successors; ON_GOTO/GOSUB tables; data tables
named by GET_TABLE/SAVE_TABLE/PRINT_MEM are not executed). **0 undecodable operands, 0 unhandled opcodes reached;
all 61 handler opcodes occur.**

| op | mnemonic | count | records |
|---|---|---|---|
| 00 | EXIT | 981 | 29 |
| 01 | GOTO | 1695 | 29 |
| 02 | GOSUB | 915 | 29 |
| 03 | COMPARE | 1504 | 29 |
| 04 | ADD | 317 | 28 |
| 05 | SUBTRACT | 76 | 24 |
| 06 | DIVIDE | 29 | 10 |
| 07 | MULTIPLY | 12 | 9 |
| 08 | RANDOM | 144 | 26 |
| 09 | SAVE | 2341 | 29 |
| 0A | LOAD_CHARACTER | 36 | 13 |
| 0B | LOAD_MONSTER | 330 | 28 |
| 0C | SETUP_MONSTER | 187 | 27 |
| 0D | APPROACH | 97 | 21 |
| 0E | PICTURE | 137 | 24 |
| 0F | INPUT_NUMBER | 2 | 2 |
| 10 | INPUT_STRING | 20 | 9 |
| 11 | PRINT | 289 | 26 |
| 12 | PRINTCLEAR | 1401 | 29 |
| 13 | RETURN | 440 | 29 |
| 14 | COMPARE_AND | 65 | 23 |
| 15 | VERTICAL_MENU | 15 | 8 |
| 16 | IF_EQ | 690 | 29 |
| 17 | IF_NE | 634 | 29 |
| 18 | IF_LT | 180 | 25 |
| 19 | IF_GT | 281 | 27 |
| 1A | IF_LE | 24 | 10 |
| 1B | IF_GE | 127 | 26 |
| 1C | CLEAR_MONSTERS | 251 | 28 |
| 1D | PARTY_STRENGTH | 18 | 12 |
| 1E | CHECK_PARTY | 4 | 3 |
| 20 | NEW_ECL | 79 | 29 |
| 21 | LOAD_FILES | 61 | 28 |
| 22 | PARTY_SURPRISE | 22 | 17 |
| 23 | SURPRISE | 22 | 17 |
| 24 | COMBAT | 245 | 28 |
| 25 | ON_GOTO | 427 | 29 |
| 26 | ON_GOSUB | 37 | 17 |
| 27 | TREASURE | 77 | 22 |
| 28 | ROB | 14 | 8 |
| 29 | ENCOUNTER_MENU | 94 | 21 |
| 2A | GET_TABLE | 271 | 26 |
| 2B | HORIZONTAL_MENU | 204 | 29 |
| 2C | PARLAY | 41 | 19 |
| 2D | CALL | 180 | 28 |
| 2E | DAMAGE | 48 | 16 |
| 2F | AND | 356 | 29 |
| 30 | OR | 208 | 20 |
| 31 | SPRITE_OFF | 56 | 23 |
| 32 | FIND_ITEM | 7 | 5 |
| 33 | PRINT_RETURN | 20 | 7 |
| 34 | ECL_CLOCK | 1 | 1 |
| 35 | SAVE_TABLE | 17 | 6 |
| 36 | ADD_NPC | 8 | 7 |
| 37 | LOAD_PIECES | 35 | 26 |
| 38 | PROGRAM | 4 | 4 |
| 39 | WHO | 11 | 9 |
| 3A | DELAY | 188 | 25 |
| 3B | SPELL | 1 | 1 |
| 3C | PRINT_MEM | 12 | 4 |
| 3D | CLEAR_BOX | 27 | 4 |

records=29 distinct opcodes=61 unused handlers: none

Static-only caveat: code reached only through computed jumps does not exist in this VM (no indirect jump opcode), but
bytes after an ON_GOTO whose selector is always in range are not followed (the engine would fall through); the
listings show unreached bytes as `db`.

---------------------------------------------------------------------------------------------------------
## 8. Cross-check with public Gold Box ECL knowledge (cross-check only; the binary wins)

No fan document is in this repo (FOREMAN rule: cross-check only). Compared from recall with the community naming
used by Gold Box tools (coab / "Curse of the Azure Bonds" reimplementation, ECL editors) — confidence of the
*public* names themselves: L (recall, no document at hand).

- **Agree**: opcode numbering 00..3D and names EXIT, GOTO, GOSUB, COMPARE, ADD/SUBTRACT/DIVIDE/MULTIPLY, RANDOM,
  SAVE, LOAD CHARACTER, LOAD MONSTER, SETUP MONSTER, APPROACH, PICTURE, INPUT NUMBER/STRING, PRINT, PRINTCLEAR,
  RETURN, COMPARE AND, VERTICAL MENU, IF =/<>/</>/<=/>=, CLEAR MONSTERS, PARTY STRENGTH, CHECK PARTY, NEW ECL, LOAD
  FILES, PARTY SURPRISE, SURPRISE, COMBAT, ON GOTO, ON GOSUB, TREASURE, ROB, ENCOUNTER MENU, GET TABLE, HORIZONTAL
  MENU, PARLAY, CALL, DAMAGE, AND, OR, SPRITE OFF, FIND ITEM, PRINT RETURN, ECL CLOCK, SAVE TABLE, ADD NPC, LOAD
  PIECES, PROGRAM, WHO, DELAY, SPELL, CLEAR BOX — every handler body above supports its public name.
- Agree: operand type byte scheme (00 byte, 01/03 memory, 02 word, 80 inline compressed string, 81 string variable),
  6-bit text packing, header of GOTO vectors, IF = "skip next instruction when false".
- **Differ / binary-only facts**: 3Ch — public name recalled as "PROTECTION"(?) for later games; in PoR the handler
  prints a 0/FFh-terminated character string from VM memory (PRINT_MEM here). 1Fh has no handler in PoR. Later
  games add 3Eh+ (DUMP, FIND SPECIAL, DESTROY ITEMS) — absent from this dispatcher. SUBTRACT is `op2 − op1`.
  The IF skip table's mismatches (0Ch, 36h, 15h/25h/26h/2Bh), the SPELL address truncation, the ECL_CLOCK
  uninitialised operand index and ROB's unused operand 3 are engine facts not found in public notes (from recall).
- Public notes describe the 4 VM regions (4900/6B00/9700/9900 = "global", "character/area", "temp", "ECL code");
  this agrees with `ecl_MemRegion`.

---------------------------------------------------------------------------------------------------------
## 8a. Independent verification (Opus review subagent, 2026-10-16)
13 checks on the bytes (operands, SUB/DIV order, flags, IF table incl. mismatches, memory regions, SPELL, ECL_CLOCK,
ROB, variable operands, RETURN, LOAD_FILES/PIECES, game loop, dispatcher offsets): all confirmed except 4 detail
errors, fixed above (SPELL location + first-member-only loop, LOAD_PIECES uses b1 not b2, 4431 set by both 21/37,
game-loop start flags). Extra facts from the review: `ecl_OperandValue` sign-extends the operand index (`CBW`
4300:013F; index >= 80h would misbehave, not in data); reads of C04B/C04C sign-extend (`CBW`); `ecl_SkipInstruction`
overwrites `ecl_CurOp` (4300:1EB7); COMPARE with mixed string/number types compares stale string slots; ON_GOTO
selector/count are byte-truncated; ROB with who ≠ 0 also walks monsters in the party list.

## 8b. Corrections from the routine-level pass (por-mod-ecl, decode/pseudo/ECL.pas.md)
AND/OR flag orientation (CompareWords(0, r)); SURPRISE never yields 3; TREASURE names items only for random treasure;
PICTURE FFh redraw condition; LOAD_CHARACTER ov16_3291 argument order; NEW_ECL passes its file name to the disk check
ov17_22D5; 6E12 write takes one argument; ov07_0511 = ShowHeadBodyPicture (6DE1 = HEAD id); CALL 8000h/8001h =
SetupDuel; ENCOUNTER_MENU uses the party's minimum move for FLEE and maximum move for the monsters' flee check;
PRINT_MEM draws glyph value+1. More quirks (empty-string store writes 256 bytes, MenuSelect returns 0FFh for non-hotkeys,
HORIZONTAL_MENU count 0 loops 255 times, VERTICAL_MENU stores the choice after Esc) are in ECL.pas.md.

## 9. Unknowns (explicit)

- Exact roles (names M/L) of: `DS:6F68/6F69` (C059/C05F), `6F6A/6F6C/6F6E` (00FB/00FC/00B1), `84CE/84D0` (00B8/00B9),
  char overlay 6BF7/6BF9/6C0C, `ov17_22D5` in NEW_ECL, `ov05_1527`/`ov08_007A` split in COMBAT, `ov07_1A6F`
  (CALL 8000h/8001h), `ov17_1262` (ADD_NPC), the meaning of the 2-byte record header (ECL1/18: `88 13` = 5000).
- Which side SURPRISE results 1/2 denote (code is exact, the game meaning M).
- Region-4 reads of unlisted addresses return an uninitialised local (garbage). Region-4 addresses in the listings:
  C04B..C04F, C059, C05F, 033D, 035F (read: undefined), 03DE, 00B1, 00FB/00FC, 00B8/00B9; writes to D015 and
  SAVE_TABLE bases 6300/D000 are ignored by `ecl_SetMem` (region 4, no case).
