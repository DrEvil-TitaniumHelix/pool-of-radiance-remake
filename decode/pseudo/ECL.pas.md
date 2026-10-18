# ECL — the event-script VM: interpreter, all opcode handlers, helpers (FINAL pseudocode, lane por-mod-ecl)

Units (herdr/assignments/por-areas.md): **ov03** (2F00: ecl_Run, ecl_Dispatch, the 61 opcode handlers, game loop) and
**ov07** (4300: operand decoder, VM memory, strings, compare, gosub, menus, encounter display, ECL helpers).
Spec: `decode/ecl/ECL_VM.md` (operand encoding, memory map, opcode table); this file is the routine-level source.
Screens: `ECL_SCREENS.md`. Names: `decode/names/ecl_names.json`. Evidence = `decode/listings/ov03.lst` / `ov07.lst`
(checked with `decode/ecl/hdis.py`); `.c` only as help.

Conventions (as VIEW.pas.md)
- **Signatures in Pascal order** (first parameter = highest BP offset = pushed first; Ghidra's param list is the reverse); parameters as `name [BP+xx]`.
- `{ seg:off }` = first instruction of the statement. `{ quirk: ... }` = engine behaviour a faithful port must copy.
- VM notation: `Code[a]` = `ecl_CodeBuf^[a-9900h]` (asm `ES:[DI+6700h]`); `Mem[a]` = VM memory at ECL address a (ecl_GetMem/SetMem regions, ECL_VM.md §3; direct array accesses written with the byte offset in a comment); `OpType/OpLo/OpHi[i]` = DS:7005+i / 7085+i / 7045+i; `Str[k]` = DS:6FC8+k*100h; `v(i)` = `ecl_OperandValue(i)`; `a(i)` = `OpHi[i]*256+OpLo[i]` (`MakeWord(OpLo[i], OpHi[i])`).
- Globals `g_XXXX` = DS:XXXX (GLOBALS.md) or the ecl_names.json name; characters by SAVES.md TChar field names; ENGINE/VIEW callees by their lanes' names where given, otherwise `FUN_`/`ovNN_` + a role comment (M).
- Production: five fork workers of this lane each wrote one address range (A ov03 0000..0E5D, B 0E5E..1EF7, C 1EF8..end, D ov07 0000..0F52, E 0F53..end) from the asm with their own 10% byte re-check; merged and cross-checked here (§Self-check).

---

# ov03 (2F00)

## ov03 (2F00) part A — opcode handlers 00..2F (2F00:0001 .. 2F00:0E5D)

Conventions as VIEW.pas.md: Pascal-order signatures, `{ 2f00:oooo }` = first instruction of the statement.
All handlers are `procedure ...; far` without parameters, called only by `ecl_Dispatch` (2F00:2F2D) with `ecl_CurOp`
already fetched. `v(i)` = `ecl_OperandValue(i)` (4300:0136), `a(i)` = `MakeWord(OpLo[i], OpHi[i])` (4300:06AF,
= `OpHi[i]*256 + OpLo[i]`), `Str[k]` = string slot `DS:6FC8 + k*100h`, `Mem[x]` = the VM word/byte at ECL address x
(ECL_VM.md §3; direct array accesses through `ecl_Mem4900^` / `ecl_Mem6B00^` are written as `Mem[...]` with the
byte offset in a comment). ENGINE routines are named after decode/pseudo/ENGINE.draft.md (draft names, M) with
their address.

### 2F00:0001 ecl_op00_Exit (H)
`procedure ecl_op00_Exit` — callers: ecl_Dispatch (op 00), ecl_op38_Program (`CALL 0001` at 2f00:2e76).
callees: DrawTitledFrame 03F1:02E8, System.FillChar, System.FreeMem.
The byte at 2F00:0000 is the empty string literal `''` (length 0) used as the frame title.
```pascal
if g_84E2 <> 0 then begin                                            { 2f00:0007 }
  DrawTitledFrame(1, 1, $0F, $0F, 0, $0F, '');                       { 2f00:000e  frame around the picture box }
  if Mem[$49E6] <> 0 then                                            { 2f00:0034  3D-area flag (ecl_Mem4900^ +1CCh) }
    DrawTitledFrame(3, 3, $0D, $0D, 0, $0F, '');                     { 2f00:0040  inner 3D-view frame }
end;
if g_4430 <> 0 then begin                                            { 2f00:0066  LOAD_CHARACTER pending restore }
  SelectedChar := g_4436;                                            { 2f00:006d }
  g_4430 := 0;                                                       { 2f00:007b }
end;
FillChar(g_84C8, 2, 0);                                              { 2f00:0080  g_84C8, g_84C9 }
g_84E0 := 0;                                                         { 2f00:0091 }
g_84E2 := 0;                                                         { 2f00:0096 }
ecl_Stop := True;                                                    { 2f00:009b }
Inc(ecl_PC);                                                         { 2f00:00a0 }
while ecl_GosubSP <> nil do begin                                    { 2f00:00a4  drop the whole GOSUB stack }
  g_6F74 := ecl_GosubSP^.next;                                       { 2f00:00ad  node = (ret: Word; next: Pointer) }
  FreeMem(ecl_GosubSP, 6);                                           { 2f00:00c0 }
  ecl_GosubSP := g_6F74;                                             { 2f00:00d1 }
end;
g_5E25 := $11;                                                       { 2f00:00e1  text cursor row 17 }
g_5E24 := 1;                                                         { 2f00:00e6  text cursor column 1 }
g_84DE := 0;                                                         { 2f00:00eb  CLEAR_BOX mode off }
```

### 2F00:00F4 ecl_op01_Goto (H)
`procedure ecl_op01_Goto` — callers: ecl_Dispatch (01). callees: ecl_ReadOperands, MakeWord.
```pascal
ecl_ReadOperands(1);                                                 { 2f00:00f7 }
ecl_PC := MakeWord(OpLo[1], OpHi[1]);                                { 2f00:00ff  address field, type byte ignored }
```

### 2F00:0111 ecl_op02_Gosub (H)
`procedure ecl_op02_Gosub` — callers: ecl_Dispatch (02). callees: ecl_ReadOperands, ecl_Gosub.
```pascal
ecl_ReadOperands(1);                                                 { 2f00:0114 }
ecl_Gosub(1);                                                        { 2f00:011c  push ecl_PC (next insn), PC := a(1) }
```

### 2F00:0126 ecl_op03_Compare (H)
`procedure ecl_op03_Compare` — callers: ecl_Dispatch (03). locals s1 [BP-104h], s2 [BP-204h]: string; x1 [BP-2], x2 [BP-4]: Word.
callees: ecl_ReadOperands, System.@StrAssign, ecl_CompareStrings, ecl_OperandValue, ecl_CompareWords.
```pascal
ecl_ReadOperands(2);                                                 { 2f00:012d }
if (OpType[1] >= $80) or (OpType[2] >= $80) then begin               { 2f00:0135 }
  s1 := Str[1];                                                      { 2f00:0143 }
  s2 := Str[2];                                                      { 2f00:0157 }
  ecl_CompareStrings(s1, s2);                                        { 2f00:016b }
  { quirk: with one string and one number operand, Str[2] is whatever the slot held before (stale) }
end else begin
  x1 := ecl_OperandValue(1);                                         { 2f00:017e }
  x2 := ecl_OperandValue(2);                                         { 2f00:0189 }
  ecl_CompareWords(x1, x2);                                          { 2f00:0194  flags = x1 ? x2, unsigned }
end;
```

### 2F00:01A3 ecl_op04_AddSubDivMul (H)
`procedure ecl_op04_AddSubDivMul` — callers: ecl_Dispatch (04, 05, 06, 07). locals x[1..2] at [BP-6]/[BP-4], dest [BP-2], r [BP-9]: Word.
callees: ecl_ReadOperands, ecl_OperandValue, MakeWord, ecl_SetMem.
```pascal
ecl_ReadOperands(3);                                                 { 2f00:01a9 }
for i := 1 to 2 do x[i] := ecl_OperandValue(i);                      { 2f00:01b1 }
dest := MakeWord(OpLo[3], OpHi[3]);                                  { 2f00:01d6 }
case ecl_CurOp of                                                    { 2f00:01e6 }
  $04: r := x[1] + x[2];                                             { 2f00:01ed }
  $05: r := x[2] - x[1];                                             { 2f00:01fc  quirk: operand 2 minus operand 1 }
  $06: r := x[1] div x[2];                                           { 2f00:020b  unsigned DIV; x[2] = 0 -> runtime error 200 }
  $07: r := x[1] * x[2];                                             { 2f00:021c  low word of MUL }
end;
ecl_SetMem(dest, r);                                                 { 2f00:0225 }
```

### 2F00:0234 ecl_op08_Random (H)
`procedure ecl_op08_Random` — callers: ecl_Dispatch (08). locals n [BP-1], r [BP-2]: Byte; dest [BP-4].
callees: ecl_ReadOperands, ecl_OperandValue, MakeWord, System.RandomWord, System.@LongToReal, System.Trunc (RT_LEDGER names), ecl_SetMem.
```pascal
ecl_ReadOperands(2);                                                 { 2f00:023a }
n := Byte(ecl_OperandValue(1));                                      { 2f00:0242 }
if n < $FF then Inc(n);                                              { 2f00:024d }
dest := MakeWord(OpLo[2], OpHi[2]);                                  { 2f00:0256 }
r := Byte(Random(n));                                                { 2f00:0266  0AF8:11C0 then 0AF8:119A/119E; result 0..n-1 = 0..v(1) (M: RT names of the two helpers) }
ecl_SetMem(dest, r);                                                 { 2f00:0280 }
```

### 2F00:0292 ecl_op09_Save (H)
`procedure ecl_op09_Save` — callers: ecl_Dispatch (09). locals dest [BP-4], x [BP-2].
callees: ecl_ReadOperands, MakeWord, ecl_OperandValue, ecl_SetMem, ecl_SetMemString.
```pascal
ecl_ReadOperands(2);                                                 { 2f00:0298 }
dest := MakeWord(OpLo[2], OpHi[2]);                                  { 2f00:02a0 }
if OpType[1] < $80 then                                              { 2f00:02b0 }
  ecl_SetMem(dest, ecl_OperandValue(1))                              { 2f00:02b7 }
else
  ecl_SetMemString(dest, Str[1]);                                    { 2f00:02cf }
```

### 2F00:02E0 ecl_op0A_LoadCharacter (H)
`procedure ecl_op0A_LoadCharacter` — callers: ecl_Dispatch (0A). locals i [BP-7], x [BP-6], hi [BP-8]: Byte; c [BP-4]: PChar.
callees: ecl_ReadOperands, ecl_OperandValue, RemoveFromParty, DrawPartyRoster 00BA:0767.
```pascal
g_4430 := 1;                                                         { 2f00:02e6  EXIT restores SelectedChar from g_4436 }
ecl_ReadOperands(1);                                                 { 2f00:02eb }
i := 0;                                                              { 2f00:02f3 }
x := Byte(ecl_OperandValue(1));                                      { 2f00:02f7 }
c := PartyHead;                                                      { 2f00:0302 }
hi := x and $80;                                                     { 2f00:030f }
x := x and $7F;                                                      { 2f00:0317 }
if x > 0 then                                                        { 2f00:031f }
  while (i < x) and (c <> nil) do begin                              { 2f00:0325 }
    c := c^.next;                                                    { 2f00:0335  TChar +104h }
    Inc(i);                                                          { 2f00:0348 }
  end;
if c <> nil then SelectedChar := c;                                  { 2f00:034d  index past the end: selection unchanged }
if (hi <> 0) and (g_84D2 <> 0) and (g_84D3 <> 0) then begin          { 2f00:0362 }
  if g_4436 = SelectedChar then g_4430 := 0;                         { 2f00:0376 }
  RemoveFromParty(0, 1);                                                   { 2f00:038e  Pascal order verified (push 0, push 1; fix #fable-3); role unknown, ov16 = top-level/menus }
  DrawPartyRoster(SelectedChar);                                     { 2f00:0399 }
  g_84D2 := 0;                                                       { 2f00:03a6 }
  g_84D3 := 0;                                                       { 2f00:03ab }
end;
```

### 2F00:03B4 ecl_op0C_SetupMonster (H)
`procedure ecl_op0C_SetupMonster` — callers: ecl_Dispatch (0C). callees: ecl_ReadOperands, ecl_OperandValue, ApproachDistance 4300:0482, ShowEncounter 4300:054E.
```pascal
ecl_ReadOperands(3);                                                 { 2f00:03ba }
enc_SpriteId := ecl_OperandValue(1);                                 { 2f00:03c2  g_6F81 }
Mem[$6DC0] := ecl_OperandValue(2);                                   { 2f00:03cd  ecl_Mem6B00^ +580h: requested distance }
enc_PicId := ecl_OperandValue(3);                                    { 2f00:03de  g_6F82 }
Mem[$6DC1] := ApproachDistance(party_MapX, party_MapY, party_Dir);   { 2f00:03e9  +582h: free squares ahead (max 2) }
if Mem[$6DC0] < Mem[$6DC1] then Mem[$6DC1] := Mem[$6DC0];            { 2f00:0405 }
ShowEncounter(enc_SpriteId, enc_PicId, Byte(Mem[$6DC1]), g_84C8);    { 2f00:042b  var g_84C8 = (spriteShown, picShown) }
```
Note: writes `ecl_Mem6B00^` directly, not through `ecl_SetMem` (no character-field side effects).

### 2F00:0450 ecl_op0B_LoadMonster (H)
`procedure ecl_op0B_LoadMonster` — callers: ecl_Dispatch (0B). locals: savedSel [BP-14h], k [BP-4], cnt [BP-2], pic [BP-3], id [BP-1]: Byte; p [BP-8], rec [BP-10h], newRec [BP-0Ch], items [BP-142h], effects [BP-14Eh], itemsHead [BP-14Ah], effHead [BP-156h], old [BP-146h]/[BP-152h]: Pointer; tmpl [BP-131h]: TChar (11Dh bytes); name [BP-13Eh]: string[12].
The byte string at 2F00:044B is `'CPIC'`.
callees: ecl_ReadOperands, ecl_OperandValue, ecl_LoadMonsterRec 4300:0411, System.@CopyBytes, System.@StrAssign, LoadCombatIcon (LoadCombatIcon, VIEW.pas.md), System.GetMem.
```pascal
savedSel := SelectedChar;                                            { 2f00:0457 }
k := 1;                                                              { 2f00:0464 }
ecl_ReadOperands(3);                                                 { 2f00:0468 }
if MonsterCount >= $3F then Exit;                                    { 2f00:0470  g_4435; Exit -> 2f00:0813 }
p := nil;                                                            { 2f00:047a }
newRec := nil;                                                       { 2f00:0482 }
id := Byte(ecl_OperandValue(1));                                     { 2f00:048a }
ecl_LoadMonsterRec(id, rec, items, effects);                         { 2f00:0495  GetMem(11Dh) + LoadMonster LoadMonster; rec^.items (+C8h), rec^.effects (+7Fh) }
tmpl := rec^;                                                        { 2f00:04af  CopyBytes 11Dh }
itemsHead := items;                                                  { 2f00:04c3 }
effHead := effects;                                                  { 2f00:04d3 }
cnt := Byte(ecl_OperandValue(2));                                    { 2f00:04e3 }
if cnt = 0 then cnt := 1;                                            { 2f00:04ee }
pic := Byte(ecl_OperandValue(3));                                    { 2f00:04f8 }
p := PartyHead;                                                      { 2f00:0503 }
name := 'CPIC';                                                      { 2f00:0510 }
LoadCombatIcon(name, pic, enc_NextIconSlot);                         { 2f00:0524  LoadCombatIcon (name, record, icon slot g_6F83) }
while p^.next <> nil do p := p^.next;                                { 2f00:0537  to the last party/monster record }
p^.next := rec;                                                      { 2f00:055b  first monster = the loaded record itself }
p := p^.next;                                                        { 2f00:056e }
p^.iconSlot := enc_NextIconSlot;                                     { 2f00:0581  TChar +BFh }
p^.next := nil;                                                      { 2f00:058c }
Inc(MonsterCount);                                                   { 2f00:059b }
Inc(k);                                                              { 2f00:059f }
while (k <= cnt) and (MonsterCount < $3F) do begin                   { 2f00:05a2 }
  newRec := GetMem($11D);                                            { 2f00:05b7 }
  p^.next := newRec;                                                 { 2f00:05c6 }
  p := p^.next;                                                      { 2f00:05d9 }
  p^ := tmpl;                                                        { 2f00:05ec  CopyBytes 11Dh }
  p^.iconSlot := enc_NextIconSlot;                                   { 2f00:0600 }
  p^.next := nil;                                                    { 2f00:060b }
  p^.effects := nil;                                                 { 2f00:061a  +7Fh }
  p^.items := nil;                                                   { 2f00:0628  +C8h }
  Inc(k);                                                            { 2f00:0637 }
  Inc(MonsterCount);                                                 { 2f00:063a }
  while items <> nil do begin                                        { 2f00:063e  copy the item list (63-byte TItem) }
    if p^.items = nil then begin                                     { 2f00:064b }
      p^.items := GetMem($3F);                                       { 2f00:065a }
      p^.items^ := items^;                                           { 2f00:0670  CopyBytes 3Fh }
      p^.items^.next := nil;                                         { 2f00:0689  TItem +2Ah }
    end else begin
      old := p^.items;                                               { 2f00:069d }
      p^.items := GetMem($3F);                                       { 2f00:06b2 }
      p^.items^ := items^;                                           { 2f00:06c8 }
      p^.items^.next := old;                                         { 2f00:06e1  quirk: prepends -> copy is in reverse order }
    end;
    items := items^.next;                                            { 2f00:06f9 }
  end;
  items := itemsHead;                                                { 2f00:0710 }
  while effects <> nil do begin                                      { 2f00:0720  copy the 9-byte effect list }
    if p^.effects = nil then begin                                   { 2f00:072d }
      p^.effects := GetMem(9);                                       { 2f00:073b }
      p^.effects^ := effects^;                                       { 2f00:0750 }
      p^.effects^.next := nil;                                       { 2f00:0768  TEffect +5 }
    end else begin
      old := p^.effects;                                             { 2f00:077b }
      p^.effects := GetMem(9);                                       { 2f00:078f }
      p^.effects^ := effects^;                                       { 2f00:07a4 }
      p^.effects^.next := old;                                       { 2f00:07bc  reverse order, as above }
    end;
    effects := effects^.next;                                        { 2f00:07d3 }
  end;
  effects := effHead;                                                { 2f00:07ea }
end;
Inc(enc_NextIconSlot);                                               { 2f00:07fd }
g_84E7 := 1;                                                         { 2f00:0801  monsters present }
SelectedChar := savedSel;                                            { 2f00:0806 }
```

### 2F00:0817 ecl_op0D_Approach (H)
`procedure ecl_op0D_Approach` — callers: ecl_Dispatch (0D). callees: ShowEncounter.
```pascal
if Mem[$6DC1] > 0 then begin                                         { 2f00:081a }
  Dec(Mem[$6DC1]);                                                   { 2f00:0826 }
  ShowEncounter(enc_SpriteId, enc_PicId, Byte(Mem[$6DC1]), g_84C8);  { 2f00:082f }
end;
Inc(ecl_PC);                                                         { 2f00:084b }
```

### 2F00:0856 ecl_op0E_Picture (H)
`procedure ecl_op0E_Picture` — callers: ecl_Dispatch (0E). locals p [BP-1]: Byte; s [BP-5]: string[3].
Literals: 2F00:0851 `''`, 2F00:0852 `'PIC'`.
callees: ecl_ReadOperands, ecl_OperandValue, DrawTitledFrame, LoadAnimation (load picture record into a picture var), DrawPictureScreenOrView (draw picture), ShowHeadBodyPicture 4300:0511, RefreshView (redraw 3D view).
```pascal
ecl_ReadOperands(1);                                                 { 2f00:085c }
p := Byte(ecl_OperandValue(1));                                      { 2f00:0864 }
if (Mem[$49E6] = 0) and (p <> $FF) then                              { 2f00:086f  not in a 3D area }
  DrawTitledFrame(3, 3, $0D, $0D, 0, $0F, '');                       { 2f00:0881 }
if p <> $FF then begin                                               { 2f00:08a7 }
  g_84C9 := 1;                                                       { 2f00:08ad  picture shown }
  g_84E0 := 1;                                                       { 2f00:08b2  view needs redraw later }
  if Mem[$6DE1] = $FF then begin                                     { 2f00:08b7  ecl_Mem6B00^ +5C2h: no 3D sprite set -> full picture }
    s := 'PIC';                                                      { 2f00:08c4 }
    LoadAnimation(s, p, 0, g_6ABE);                                      { 2f00:08d3  load PIC<DataSet>.dax record p into picture var g_6ABE }
    DrawPictureScreenOrView(3, 3, 1, g_6AC4);                                      { 2f00:08e4  draw it at cell (3,3) }
  end else
    ShowHeadBodyPicture(Byte(Mem[$6DE1]), p);                        { 2f00:08fe }
end else begin                                                       { p = FFh: remove the picture }
  if (g_49F9 > 1) or (g_49FA = 1) then                               { 2f00:0913 }
    if (g_84E0 <> 0) or (g_84E3 <> 0) then begin                     { 2f00:0921 }
      RefreshView;                                                     { 2f00:092f  redraw 3D view }
      g_84E0 := 0;                                                   { 2f00:0934 }
      g_84E3 := 0;                                                   { 2f00:0939 }
      g_84E1 := 1;                                                   { 2f00:093e }
    end;
  g_84C8 := 0;                                                       { 2f00:0943 }
  g_84C9 := 0;                                                       { 2f00:0948 }
end;
```

### 2F00:0951 ecl_op0F_InputNumber (H)
`procedure ecl_op0F_InputNumber` — callers: ecl_Dispatch (0F). locals empty [BP-2]: string[0] (length byte 0); dest [BP-6], n [BP-4]: Word.
callees: ecl_ReadOperands, MakeWord, ReadWordNumber 0709:0B66, ecl_SetMem.
```pascal
ecl_ReadOperands(2);                                                 { 2f00:0957 }
empty := '';                                                         { 2f00:095f  MOV byte [BP-2],0 = length 0 }
dest := MakeWord(OpLo[2], OpHi[2]);                                  { 2f00:0963 }
n := ReadWordNumber(empty, $0A);                                     { 2f00:0973  prompt = @[BP-2], a byte set to 0 at 2f00:095f = the empty string (const String param, ENGINE 0709:0B66); colour 0Ah }
ecl_SetMem(dest, n);                                                 { 2f00:0983 }
{ quirk: operand 1 is decoded but never used }
```

### 2F00:0994 ecl_op10_InputString (H)
`procedure ecl_op10_InputString` — callers: ecl_Dispatch (10). locals empty [BP-2]: string[0] (length byte 0); dest [BP-4]; s [BP-104h]: string.
Literal 2F00:0992 `' '`. callees: ecl_ReadOperands, MakeWord, ReadBottomLine 0709:09E3, ecl_SetMemString.
```pascal
ecl_ReadOperands(2);                                                 { 2f00:099b }
empty := '';                                                         { 2f00:09a3 }
dest := MakeWord(OpLo[2], OpHi[2]);                                  { 2f00:09a7 }
s := ReadBottomLine(empty, $0A, $28);                                { 2f00:09b7  prompt = @[BP-2] = '' (byte 0 set at 2f00:09a3; const String param, ENGINE 0709:09E3); colour 0Ah, max 40 chars }
if s = '' then s := ' ';                                             { 2f00:09dc }
ecl_SetMemString(dest, s);                                           { 2f00:09f7 }
{ quirk: operand 1 unused }
```

### 2F00:0A09 ecl_op11_Print (H)
`procedure ecl_op11_Print` — callers: ecl_Dispatch (11 PRINT, 12 PRINTCLEAR). local t [BP-100h]: string.
callees: ecl_ReadOperands, ecl_OperandValue, WordToDecimalString 00BA:1073, DrawWrappedText 0709:0768.
```pascal
ecl_ReadOperands(1);                                                 { 2f00:0a10 }
g_84E4 := 0;                                                         { 2f00:0a18 }
g_4A00 := 1;                                                         { 2f00:0a1d  "text output active" }
if OpType[1] < $80 then                                              { 2f00:0a22  numeric operand: print its decimal value }
  Str[1] := WordToDecimalString(ecl_OperandValue(1));                { 2f00:0a29 }
if ecl_CurOp = $11 then                                              { 2f00:0a4b }
  DrawWrappedText(1, $11, $26, $16, $0A, 0, Str[1])                  { 2f00:0a52  window cols 1..38, rows 17..22, colour 0Ah, continue at cursor }
else begin
  g_5E25 := $11;                                                     { 2f00:0a70  cursor row 17 }
  g_5E24 := 1;                                                       { 2f00:0a75  cursor col 1 }
  DrawWrappedText(1, $11, $26, $16, $0A, 1, Str[1]);                 { 2f00:0a7a  clear the window first }
end;
g_4A00 := 0;                                                         { 2f00:0a96 }
```
(Argument roles x1, y1, x2, y2, colour, clear: from the two call patterns and ENGINE draft; M.)

### 2F00:0A9F ecl_op13_Return (H)
`procedure ecl_op13_Return` — callers: ecl_Dispatch (13). callees: System.FreeMem.
```pascal
Inc(ecl_PC);                                                         { 2f00:0aa2 }
if ecl_GosubSP <> nil then begin                                     { 2f00:0aa6  empty stack: just continue (quirk) }
  ecl_PC := ecl_GosubSP^.ret;                                        { 2f00:0aaf }
  g_6F74 := ecl_GosubSP^.next;                                       { 2f00:0ab9 }
  FreeMem(ecl_GosubSP, 6);                                           { 2f00:0acc }
  ecl_GosubSP := g_6F74;                                             { 2f00:0add }
end;
```

### 2F00:0AED ecl_op14_CompareAnd (H)
`procedure ecl_op14_CompareAnd` — callers: ecl_Dispatch (14). locals x[1..4] at [BP-8],[BP-6],[BP-4],[BP-2].
callees: System.FillChar, ecl_ReadOperands, ecl_OperandValue.
```pascal
FillChar(ecl_FlagEQ, 6, 0);                                          { 2f00:0af3  all six flags }
ecl_ReadOperands(4);                                                 { 2f00:0b04 }
for i := 1 to 4 do x[i] := ecl_OperandValue(i);                      { 2f00:0b0c }
if (x[1] = x[2]) and (x[3] = x[4]) then ecl_FlagEQ := 1              { 2f00:0b32 }
else ecl_FlagNE := 1;                                                { 2f00:0b49 }
```

### 2F00:0B52 ecl_op16_If (H)
`procedure ecl_op16_If` — callers: ecl_Dispatch (16..1B). callees: ecl_SkipInstruction 4300:1EA6.
```pascal
Inc(ecl_PC);                                                         { 2f00:0b55 }
case ecl_CurOp of                                                    { 2f00:0b59 }
  $16: if ecl_FlagEQ = 0 then ecl_SkipInstruction;                   { 2f00:0b60 }
  $17: if ecl_FlagNE = 0 then ecl_SkipInstruction;                   { 2f00:0b72 }
  $18: if ecl_FlagLT = 0 then ecl_SkipInstruction;                   { 2f00:0b84 }
  $19: if ecl_FlagGT = 0 then ecl_SkipInstruction;                   { 2f00:0b96 }
  $1A: if ecl_FlagLE = 0 then ecl_SkipInstruction;                   { 2f00:0ba8 }
  $1B: if ecl_FlagGE = 0 then ecl_SkipInstruction;                   { 2f00:0bba }
end;
```

### 2F00:0BD1 ecl_op20_NewEcl (H)
`procedure ecl_op20_NewEcl` — callers: ecl_Dispatch (20). locals n [BP-1]; num [BP-3]: string[1].
Literals 2F00:0BC8 `'ECL'`, 2F00:0BCC `'.dax'`. callees: ecl_ReadOperands, ecl_OperandValue, System.@StrLong, @StrCopy/@StrAppend, CheckEclDisk, LoadEclBlock 4300:0341, ecl_InitVM 4300:01B6.
```pascal
ecl_ReadOperands(1);                                                 { 2f00:0bd8 }
Mem[$49F2] := ecl_Block;                                             { 2f00:0be0  ecl_Mem4900^ +1E4h: previous block (g_84DC) }
n := Byte(ecl_OperandValue(1));                                      { 2f00:0bee }
ecl_Block := n;                                                      { 2f00:0bf9 }
Str(DataSet, num);                                                   { 2f00:0bff  g_5376, string[1] }
CheckEclDisk(g_547C + 'ECL' + num + '.dax');                            { 2f00:0c19  the string temp stays on the stack as the parameter; CheckEclDisk holds "Save and exit  Insert disk #" (disk check for that file, M) }
LoadEclBlock(n);                                                     { 2f00:0c4c }
ecl_InitVM;                                                          { 2f00:0c55 }
ecl_Stop := True;                                                    { 2f00:0c5a }
ecl_Restart := True;                                                 { 2f00:0c5f  g_442F: game loop runs the new block (ecl_RunAfterNewBlock) }
g_4431 := 0;                                                         { 2f00:0c64 }
```

### 2F00:0C74 ecl_op21_LoadFilesPieces (H)
`procedure ecl_op21_LoadFilesPieces` — callers: ecl_Dispatch (21 LOAD_FILES, 37 LOAD_PIECES). locals b[1..3] at [BP-3],[BP-2],[BP-1]: Byte; s [BP-0Bh]: string[6].
Literal 2F00:0C6D `'BACPAC'`. callees: ecl_ReadOperands, ecl_OperandValue, Load3DMap B100:10C7, Load24x24Set (load 2D backdrop), LoadWallSet B100:0E08, RedrawCurrentMode 00BA:27D9, DrawPartyRoster 00BA:0767.
```pascal
ecl_ReadOperands(3);                                                 { 2f00:0c7a }
g_4431 := 1;                                                         { 2f00:0c82  set for both opcodes }
for i := 1 to 3 do b[i] := Byte(ecl_OperandValue(i));                { 2f00:0c87 }
if ecl_CurOp = $21 then begin                                        { 2f00:0cab  LOAD_FILES }
  g_4434 := 1;                                                       { 2f00:0cb2  map step done }
  if (b[1] <> $FF) and (b[1] <> $7F) and (Mem[$49E6] <> 0) then begin   { 2f00:0cb7 }
    Mem[$49C5] := b[1];                                              { 2f00:0ccf  +18Ah (Load3DMap stores it again) }
    Load3DMap(b[1]);                                                 { 2f00:0cdd }
    Mem[$6DC9] := 0;                                                 { 2f00:0ce6  ecl_Mem6B00^ +592h }
  end;
  if (b[3] <> $FF) and (Mem[$49E6] = 0) then begin                   { 2f00:0cf1 }
    s := 'BACPAC';                                                   { 2f00:0d03 }
    Load24x24Set(s, 0, $28);                                            { 2f00:0d12  2D-area backdrop (BACPAC.DAX); b[3] only gates it }
  end;
  { b[2] unused by LOAD_FILES }
end else begin                                                       { LOAD_PIECES }
  g_4433 := 1;                                                       { 2f00:0d20  wall-set step done }
  if b[1] = $7F then                                                 { 2f00:0d25 }
    LoadWallSet(0, 1)                                                { 2f00:0d2b  (id, slot) }
  else if (Mem[$49E7] <> 0) and (Mem[$49E8] <> 0) then begin         { 2f00:0d39 }
    LoadWallSet(b[1], 1);                                            { 2f00:0d51 }
    LoadWallSet(b[3], 3);                                            { 2f00:0d5d  b[2] skipped }
  end else
    for i := 1 to 3 do                                               { 2f00:0d6b }
      if b[i] <> $FF then LoadWallSet(b[i], i)                       { 2f00:0d74 }
      else begin
        WallSlotId[i] := $FFFF;                                      { 2f00:0d97  g_6AAE + i*4 (VIEW: g_6AB2..) }
        WallSlotNo[i] := $FFFF;                                      { 2f00:0da8  g_6AB0 + i*4 }
      end;
end;
if (g_4432 <> 0) and (g_4433 <> 0) and (g_4434 <> 0) then begin      { 2f00:0dbf  first time map + walls are both loaded }
  RedrawCurrentMode;                                                 { 2f00:0dd4 }
  DrawPartyRoster(SelectedChar);                                     { 2f00:0dd9 }
  g_4432 := 0;                                                       { 2f00:0de6 }
end;
```

### 2F00:0DEF ecl_op2F_AndOr (H)
`procedure ecl_op2F_AndOr` — callers: ecl_Dispatch (2F AND, 30 OR). locals x1 [BP-6], x2 [BP-4], dest [BP-2]: Word; r [BP-7]: Byte.
callees: ecl_ReadOperands, ecl_OperandValue, MakeWord, ecl_CompareWords, ecl_SetMem.
```pascal
ecl_ReadOperands(3);                                                 { 2f00:0df5 }
x1 := ecl_OperandValue(1);                                           { 2f00:0dfd }
x2 := ecl_OperandValue(2);                                           { 2f00:0e08 }
dest := MakeWord(OpLo[3], OpHi[3]);                                  { 2f00:0e13 }
if ecl_CurOp = $2F then r := Byte(x1 and x2)                         { 2f00:0e23 }
else r := Byte(x1 or x2);                                            { 2f00:0e35 }
ecl_CompareWords(0, r);                                              { 2f00:0e3e  quirk: 0 is the FIRST operand: EQ and GE iff r = 0; NE and LT iff r <> 0; LE always; GT never }
ecl_SetMem(dest, r);                                                 { 2f00:0e4c }
```

## ov03 (2F00) part B — handlers 2F00:0E5E .. 2F00:1EF7

All handlers here are `procedure; far;` without parameters, called only by `ecl_Dispatch` (2F00:2F2D) through
`PUSH CS / CALL near` (they end in `RETF`). Exception: `ecl_CheckPartyStore` is a **nested procedure** of
`ecl_op1E_CheckParty` (receives the parent frame pointer, `RETF 2`). Notation as in ECL_VM.md: `v(i)` =
`ecl_OperandValue(i)`, `a(i)` = `MakeWord(OpLo[i], OpHi[i])` (hi*256+lo, the address field), `Str[k]` = DS:6FC8+k*100h.
`c^[x]` = byte at offset x of a 285-byte TChar record (SAVES.md); `c^.next` = far ptr at +104h.

### 2F00:0E5E ecl_op2A_GetTable (H)
`procedure ecl_op2A_GetTable` — callers: ecl_Dispatch (op 2Ah). Callees: ecl_ReadOperands, MakeWord, ecl_OperandValue, ecl_GetMem, ecl_SetMem.
```pascal
ecl_ReadOperands(3);                              { 2f00:0e64 }
base := a(1);                                     { 2f00:0e6c }
idx  := Lo(v(2));                                 { 2f00:0e7c  byte }
dest := a(3);                                     { 2f00:0e87 }
ecl_SetMem(dest, ecl_GetMem(base + idx));         { 2f00:0e97 }
```

### 2F00:0EBC ecl_op35_SaveTable (H)
`procedure ecl_op35_SaveTable` — callers: ecl_Dispatch (op 35h).
```pascal
ecl_ReadOperands(3);                              { 2f00:0ec2 }
value := v(1);                                    { 2f00:0eca  word }
base  := a(2);                                    { 2f00:0ed5 }
idx   := v(3);                                    { 2f00:0ee5  word }
ecl_SetMem(base + idx, value);                    { 2f00:0ef0 }
```

### 2F00:0F08 ecl_op15_VerticalMenu (H)
`procedure ecl_op15_VerticalMenu` — callers: ecl_Dispatch (op 15h). Callees: ecl_ReadOperands, MakeWord, ecl_OperandValue, NewMenuList (allocate a list of n 2Eh-byte text nodes, M), DrawWrappedText (word-wrapped print), EclVerticalListMenu (EclVerticalListMenu), ecl_SetMem, FreeMenuList (free the list, M), ClearTextRectangle (clear rectangle).
Locals: `prompt: string[255]` [BP-102h], `list, node: pointer` [BP-106h]/[BP-10Ah], `sel: word` [BP-10Eh], `esc: byte` [BP-10Fh] := 1, `empty: string` [BP-10Ch] := '', `k: byte` [BP-2] := 1.
```pascal
g_84E4 := 0;                                      { 2f00:0f0f }
ecl_ReadOperands(3);                              { 2f00:0f22 }
dest := a(1);                                     { 2f00:0f2a }
prompt := Str[1];                                 { 2f00:0f3b  operand 2 = prompt text, copied before the re-read }
cnt := Lo(v(3));                                  { 2f00:0f4f }
Dec(ecl_PC);                                      { 2f00:0f5a }
ecl_ReadOperands(cnt);                            { 2f00:0f5e  items -> Str[1..cnt] }
NewMenuList(cnt, var list);                         { 2f00:0f67  build cnt list nodes; Pascal order verified (push cnt, @list; fix #fable-3) }
node := list;                                     { 2f00:0f78 }
g_5E24 := 1;  g_5E25 := $11;                      { 2f00:0f88  text cursor col 1, row 17 }
DrawWrappedText(1, $11, $26, $16, $0A, 1, prompt);  { 2f00:0f92  print prompt, clear window first }
while node <> nil do begin                        { 2f00:0faf }
  node^.text := Copy(Str[k], 1, 40);              { 2f00:0fb9  StrAssign max 28h }
  node^[$29] := 0;                                { 2f00:0fd9 }
  node := node^.next;                             { 2f00:0fe2  far ptr at +2Ah }
  Inc(k);                                         { 2f00:0ff6 }
end;
node := list;                                     { 2f00:0ffb }
sel := 0;                                         { 2f00:100b }
EclVerticalListMenu(empty, empty, $0D, $0A, $0F, 1, g_5E25 + 1, $26, $16, list, 0, var esc, var sel, var node);   { 2f00:1011..1053  Pascal order = push order (fix #fable-3; was written reversed) }
ecl_SetMem(dest, sel);                            { 2f00:1058 }
FreeMenuList(list);                                  { 2f00:1065  free list }
ClearTextRectangle(1, $11, $26, $16);                  { 2f00:1070  clear text window }
```
{ quirk: the selection is stored even when the picker was left with Esc (esc flag ignored). }

### 2F00:10D1 ecl_op2B_HorizontalMenu (H)
`procedure ecl_op2B_HorizontalMenu` — callers: ecl_Dispatch (op 2Bh). Callees: ecl_ReadOperands, MakeWord, ecl_OperandValue, MenuSelect (MenuSelect), ecl_SetMem, ClearTextRectangle.
Locals: `menu: string[50]` [BP-38h] := '', `prompt: string` [BP-5] := '', `single` [BP-3Bh], `hilite` [BP-3Ch], `colA` [BP-3Dh], `colB` [BP-3Eh].
```pascal
ecl_ReadOperands(2);                              { 2f00:10e0 }
dest := a(1);                                     { 2f00:10e8 }
cnt := Lo(v(2));                                  { 2f00:10f8 }
Dec(ecl_PC);                                      { 2f00:1103 }
ecl_ReadOperands(cnt);                            { 2f00:1107  items -> Str[1..cnt] }
menu := '';                                       { 2f00:1110 }
if cnt = 1 then begin                             { 2f00:1114 }
  single := 1;  colA := $0F;  colB := $0F;        { 2f00:111a }
  if Str[1] = 'PRESS <RETURN> OR BUTTON TO CONTINUE' then          { 2f00:1126 }
    Str[1] := 'PRESS <ENTER>/<RETURN> TO CONTINUE';                { 2f00:1137 }
end else begin
  single := 0;  colA := $0F;  colB := $0A;        { 2f00:114c }
end;
hilite := Ord((g_84E0 <> 0) and (g_84E1 <> 0));   { 2f00:1158 }
for i := 1 to cnt - 1 do                          { 2f00:116f  byte arithmetic }
  menu := Copy(menu + '~' + Str[i] + ' ', 1, 50); { 2f00:1187 }
menu := Copy(menu + '~' + Str[cnt], 1, 50);       { 2f00:11d7 }
choice := MenuSelect(prompt, menu, $0D, colB, colA, single, hilite);   { 2f00:1215  Pascal order (title, items, c0E, c0C, c0A, acceptEnter, animate); fix #fable-2 }
ecl_SetMem(dest, choice);                         { 2f00:123a  0-based }
ClearTextRectangle(0, $18, $27, $18);                  { 2f00:1248  clear row 24 }
```
{ quirk: cnt = 0 gives `cnt-1 = 255` (byte), the loop runs over Str[1..255]; not present in the shipped scripts. }
{ quirk: the '~' before each item marks its first letter as the hot key (MenuHotkeys MenuHotkeys). }

### 2F00:125D ecl_op1C_ClearMonsters (H)
`procedure ecl_op1C_ClearMonsters` — callers: ecl_Dispatch (op 1Ch).
```pascal
Inc(ecl_PC);                                      { 2f00:1263 }
MonsterCount := 0;                                { 2f00:1267  g_4435 }
g_84E7 := 0;                                      { 2f00:126c  monsters-present flag }
enc_NextIconSlot := 8;                            { 2f00:1271 }
FillChar(TreasureMoney, $1C, 0);                  { 2f00:1276  7 longints }
while TreasureItems <> nil do begin               { 2f00:1287 }
  nxt := TreasureItems^.next;                     { 2f00:1290  +2Ah }
  FreeMem(TreasureItems, $3F);                    { 2f00:12a2 }
  TreasureItems := nxt;                           { 2f00:12b3 }
end;
```
{ note: the monster records appended to the party list by LOAD_MONSTER are not freed here (only the count is reset). }

### 2F00:12C6 ecl_op1D_PartyStrength (H)
`procedure ecl_op1D_PartyStrength` — callers: ecl_Dispatch (op 1Dh).
```pascal
ecl_ReadOperands(1);                              { 2f00:12cc }
s := 0;                                           { 2f00:12d4  byte }
c := PartyHead;                                   { 2f00:12d8 }
while c <> nil do begin                           { 2f00:12e5 }
  hp := c^[$11B];  ac := c^[$111];  th := c^[$110];   { 2f00:12f0  hp, ac (60-AC), thac0 (60-THAC0) }
  lvMU := c^[$9B];  lvCl := c^[$96];              { 2f00:1311  level[5] (magic-user), level[0] (cleric) }
  if ac > $3C then ac := ac - $3C else ac := 0;   { 2f00:1327 }
  if th > $27 then th := th - $27 else th := 0;   { 2f00:133e }
  s := s + (hp + ac*5 + th*5 + lvMU*8 + lvCl*4) div 10;   { 2f00:1355  word div, low byte added }
  c := c^.next;                                   { 2f00:139f }
end;
ecl_SetMem(a(1), s);                              { 2f00:13b5 }
```
{ note: the list also holds loaded monsters (LOAD_MONSTER appends to PartyHead), so they count too. }

### 2F00:13D7 ecl_CheckPartyStore (H)
`procedure ecl_CheckPartyStore(frame [BP+6])` — nested in ecl_op1E_CheckParty; `frame` = parent BP. Callees: ecl_SetMem.
```pascal
ecl_SetMem(dest3, minV);                          { 2f00:13da  parent [BP-13h], [BP-11h] }
ecl_SetMem(dest4, maxV);                          { 2f00:13f0  [BP-15h], [BP-10h] }
ecl_SetMem(dest5, avgV);                          { 2f00:1406  [BP-17h], [BP-0Fh] }
ecl_SetMem(dest6, found);                         { 2f00:141c  [BP-19h], [BP-0Ah] sign-extended (CBW) }
```

### 2F00:1435 ecl_op1E_CheckParty (H)
`procedure ecl_op1E_CheckParty` — callers: ecl_Dispatch (op 1Eh). Callees: ecl_ReadOperands, MakeWord, ecl_OperandValue, HasEffect (HasEffect, SAVES.md), ecl_CheckPartyStore.
Locals (parent frame of the nested store): key [BP-2], id [BP-5], c [BP-9], found [BP-0Ah], sum [BP-4], n [BP-1Ah], minV [BP-11h], maxV [BP-10h], avgV [BP-0Fh], dest3..6 [BP-13h,-15h,-17h,-19h].
```pascal
ecl_ReadOperands(6);                              { 2f00:143b }
c := PartyHead;  found := 0;                      { 2f00:1443 }
if OpType[1] = 1 then key := a(1)                 { 2f00:1454  memory operand: the address itself is the key }
else key := v(1);                                 { 2f00:146d }
id := Lo(v(2));                                   { 2f00:1478 }
dest3 := a(3);  dest4 := a(4);  dest5 := a(5);  dest6 := a(6);   { 2f00:1483 }
sum := 0;  n := 0;  minV := $FF;  maxV := 0;      { 2f00:14c3  avgV not initialised }
if key = 0 then begin                             { 2f00:14d4 }
  while (c <> nil) and (found = 0) do begin       { 2f00:14dc }
    found := HasEffect(tmp, id, c);           { 2f00:14ea  HasEffect(c, id) }
    c := c^.next;                                 { 2f00:1501 }
  end;
  for n := 1 to 3 do bytes[BP-12h+n] := 0;        { 2f00:1516  minV := 0; maxV := 0; avgV := 0 }
  ecl_CheckPartyStore;                            { 2f00:1530 }
end else if key = $6BA7 then begin                { 2f00:1538  thief_skill[2] }
  while c <> nil do begin                         { 2f00:153d }
    Inc(n);                                       { 2f00:1545 }
    if c^[$79] < minV then minV := c^[$79];       { 2f00:1548 }
    if c^[$79] > maxV then maxV := c^[$79];       { 2f00:155e }
    sum := sum + c^[$79];                         { 2f00:1574 }
    c := c^.next;                                 { 2f00:1580 }
  end;
  avgV := sum div n;                              { 2f00:1595  n = 0 -> divide error (empty list never happens) }
  ecl_CheckPartyStore;                            { 2f00:15a6 }
end else if key = $6C1B then begin                { 2f00:15ad  move }
  { same loop over c^[$11C] }                     { 2f00:15b2..160d }
  avgV := sum div n;                              { 2f00:160f }
  ecl_CheckPartyStore;                            { 2f00:1620 }
end;                                              { other keys: nothing stored }
```
{ quirk: with key 6BA7h/6C1Bh `found` stays 0; with key 0 `found` is the HasEffect result of the last member tested. }

### 2F00:1629 ecl_op22_PartySurprise (H)
`procedure ecl_op22_PartySurprise` — callers: ecl_Dispatch (op 22h).
```pascal
ecl_ReadOperands(2);                              { 2f00:162f }
c := PartyHead;  r := 0;  r0 := 0;  r2 := 0;      { 2f00:1637  [BP-5], [BP-6], [BP-7] }
while c <> nil do begin                           { 2f00:1650 }
  if (c^[$2F] = 4) or (c^[$2F] = 10) then begin r := 1; r2 := 1 end;   { 2f00:1658  class Ranger / C-R }
  c := c^.next;                                   { 2f00:1674 }
end;
ecl_SetMem(a(1), r);                              { 2f00:1689 }
ecl_SetMem(a(2), r0);                             { 2f00:16b7  always 0 }
```
{ quirk: [BP-7] is set but never used; operand 2 always receives 0. }

### 2F00:16C9 ecl_op23_Surprise (H)
`procedure ecl_op23_Surprise` — callers: ecl_Dispatch (op 23h). Callees: Roll (Roll).
```pascal
ecl_ReadOperands(4);                              { 2f00:16cf }
res := 0;                                         { 2f00:16d7 }
for i := 1 to 4 do b[i] := Lo(v(i));              { 2f00:16db  b1..b4 at [BP-8..-5] }
p := b[4] + 2 - b[1];                             { 2f00:16ff  shortint }
m := b[2] + 2 - b[3];                             { 2f00:1712 }
r1 := Roll(1, 6);                                 { 2f00:1725  1d6 }
r2 := Roll(1, 6);                                 { 2f00:1733 }
if r1 <= p then                                   { 2f00:1741  signed }
  if r2 > m then res := 1 else res := 3;          { 2f00:1750 }
if r2 <= m then res := 2;                         { 2f00:1769 }
ecl_SetMem($6DCB, res);                           { 2f00:177c }
```
{ quirk: result 3 is always overwritten by 2 (both conditions true -> 2), so the outcomes are 0, 1, 2 only:
  2 if r2 <= m, else 1 if r1 <= p, else 0. }

### 2F00:179B ecl_op24_Combat (M)
`procedure ecl_op24_Combat` — callers: ecl_Dispatch (op 24h). Callees: Shop (shop, M), Temple (temple, M), AfterCombat, ApproachDistance (ApproachDistance), CombatMain (combat, M), Load24x24Set (load 2D backdrop picture, M), LoadCombatIcon (load picture into slot, M), RedrawCurrentMode (redraw main screen, M). Strings at 2F00:178F 'BACPAC', 1796 'ICON'.
```pascal
Inc(ecl_PC);                                      { 2f00:17a1 }
if (g_84E7 = 0) and (g_84D4 = 0) then begin       { 2f00:17a5  no monsters loaded }
  if Mem[$6E6C] = 1 then begin Mem[$6E6C] := 0; Shop end         { 2f00:17b3  block-2 word +6D8h }
  else if Mem[$6DE2] = 1 then begin Mem[$6DE2] := 0; Temple end    { 2f00:17d1  +5C4h }
  else AfterCombat;                                 { 2f00:17ef }
end else begin
  d := ApproachDistance(party_MapX, party_MapY, party_Dir);   { 2f00:17f7  Pascal order verified (push X, Y, Dir; fix #fable-3) }
  if d < Mem[$6DC1] then Mem[$6DC1] := d;         { 2f00:180d }
  CombatMain;                                      { 2f00:1827 }
  AfterCombat;                                      { 2f00:182c }
  if Mem[$49E6] = 0 then begin                    { 2f00:1831  not a 3D area }
    Load24x24Set('BACPAC', 0, $28);                  { 2f00:183d }
    LoadCombatIcon('ICON', 0, 9);                      { 2f00:1857 }
    LoadCombatIcon('ICON', 1, $0A);                    { 2f00:1871 }
    LoadCombatIcon('ICON', 2, $0B);                    { 2f00:188b }
  end;
  if g_84D4 <> 0 then g_84D4 := 0;                { 2f00:18a5 }
end;
if travel_Mode = 1 then g_49F3 := 4 else g_49F3 := 3;   { 2f00:18b1 }
Mem[$6DCA] := Mem[$6DCA] and 1;                   { 2f00:18c4 }
FillChar(g_84C8, 2, 0);                           { 2f00:18d9 }
g_84E0 := 0;                                      { 2f00:18ea }
RedrawCurrentMode;                                    { 2f00:18ef }
```
(`Mem[x]` = ecl word array access through `ecl_Mem6B00` / `ecl_Mem4900`, written directly, not via ecl_SetMem.)

### 2F00:18F8 ecl_op25_OnGotoGosub (H)
`procedure ecl_op25_OnGotoGosub` — callers: ecl_Dispatch (ops 25h, 26h). Callees: ecl_ReadOperands, ecl_OperandValue, MakeWord, ecl_Gosub.
```pascal
done := false;                                    { 2f00:18fe }
ecl_ReadOperands(2);                              { 2f00:1902 }
x   := Lo(v(1));                                  { 2f00:190a }
cnt := Lo(v(2));                                  { 2f00:1915 }
Dec(ecl_PC);                                      { 2f00:1920 }
ecl_ReadOperands(cnt);                            { 2f00:1924  targets -> operand slots 1..cnt }
i := 0;                                           { 2f00:192d }
while (i < cnt) and not done do begin             { 2f00:1931 }
  if x = i then begin                             { 2f00:193f }
    if ecl_CurOp = $25 then ecl_PC := a(i+1)      { 2f00:1947  ON_GOTO }
    else ecl_Gosub(i+1);                          { 2f00:1972  ON_GOSUB }
    done := true;                                 { 2f00:197e }
  end else Inc(i);                                { 2f00:1984 }
end;                                              { x >= cnt: continue after the instruction }
```

### 2F00:19B0 ecl_op27_Treasure (H)
`procedure ecl_op27_Treasure` — callers: ecl_Dispatch (op 27h). Callees: ecl_ReadOperands, ecl_OperandValue, StrLong, LoadDaxRecord (LoadDaxRecord), ShowBottomPromptAndReadKey (message + wait, M), TerminateGame (halt to DOS, M), Move, GetMem, FreeMem, Roll, MakeTreasureItem (make random item of a type, M), BuildItemName (BuildItemName, SAVES.md). Strings 2F00:198D 'ITEM', 1992 '.dax', 1997 'Unable to find item file'.
Locals: `item: array[0..62] of byte` [BP-59h], `rec: pointer` [BP-6Fh], `size` [BP-69h], `ofs` [BP-67h], `t` [BP-2], `n` [BP-70h], `typ` [BP-65h] (not initialised).
```pascal
ecl_ReadOperands(8);                              { 2f00:19b7 }
for i := 0 to 6 do TreasureMoney[i] := LongInt(v(i+1));   { 2f00:19bf  DS:67F4 + 4*i, hi word 0 }
t := Lo(v(8));                                    { 2f00:19f2 }
if t < $80 then begin                             { 2f00:19fd  fixed item list ITEMn.DAX }
  name := 'ITEM' + Str(DataSet);                  { 2f00:1a06 }
  LoadDaxRecord(name, '.dax', t, size, rec);      { 2f00:1a4a  LoadDaxRecord }
  if size = 0 then begin                          { 2f00:1a5d }
    ShowBottomPromptAndReadKey($0F, 'Unable to find item file');   { 0709:0BF5 (colour, s) — order fixed by por-mod-engine }   { 2f00:1a63 }
    TerminateGame;                                { 2f00:1a7b  abort }
  end;
  ofs := 0;                                       { 2f00:1a80 }
  repeat
    Move(rec^[ofs], item, $3F);                   { 2f00:1a85 }
    item.next := nil;                             { 2f00:1a9d  +2Ah..+2Dh }
    ofs := ofs + $3F;                             { 2f00:1aa5 }
    if TreasureItems = nil then begin             { 2f00:1aa9 }
      GetMem(TreasureItems, $3F);  TreasureItems^ := item;    { 2f00:1ab2 }
    end else begin
      old := TreasureItems;                       { 2f00:1ad8 }
      GetMem(TreasureItems, $3F);  TreasureItems^ := item;    { 2f00:1ae5 }
      TreasureItems^.next := old;                 { 2f00:1b09  prepend }
    end;
  until ofs >= size;                              { 2f00:1b1b }
  FreeMem(rec, size);                             { 2f00:1b26 }
end else if t <> $FF then begin                   { 2f00:1b37  t-80h random items }
  n := t - $80;                                   { 2f00:1b40 }
  for k := 1 to n do begin                        { 2f00:1b51 }
    r1 := Roll(1, 100);                           { 2f00:1b63 }
    if r1 in [1..60] then begin                   { 2f00:1b71 }
      r2 := Roll(1, 100);                         { 2f00:1b82 }
      if r2 in [1..47, 50..59] then begin         { 2f00:1b90 }
        if r2 = 45 then typ := $3B else typ := r2;     { 2f00:1ba3 }
      end else if r2 in [60..90] then begin       { 2f00:1bb7 }
        r3 := Roll(1, 10);                        { 2f00:1bbf }
        case r3 of 1..4: typ := $24; 5..7: typ := $23; 8: typ := $22; 9: typ := $25; 10: typ := $26 end;  { 2f00:1bcd }
      end else if r2 in [91..94] then typ := $49  { 2f00:1c0a }
      else if r2 in [95..97] then typ := $5D      { 2f00:1c18 }
      else if r2 in [98..100] then typ := $4D;    { 2f00:1c26 }
    end else if r1 in [61..85] then typ := $3D    { 2f00:1c35 }
    else if r1 in [86..92] then typ := $3E        { 2f00:1c44 }
    else if r1 in [91..98] then begin             { 2f00:1c52  effectively 93..98 }
      r4 := Roll(1, 16);                          { 2f00:1c5a }
      case r4 of 1..7: typ := $47; 8..9: typ := $46; 10: typ := $54; 11..12: typ := $4E;
                 13..14: typ := $4F; 15: typ := $5C; 16: typ := $43 end;    { 2f00:1c68 }
    end else if r1 in [99, 100] then typ := $45;  { 2f00:1cc1 }
    MakeTreasureItem(typ, item);                         { 2f00:1ccd  build item of type typ; push typ then @item (#verify-6) }
    { prepend item to TreasureItems exactly as above }   { 2f00:1cdb..1d57 }
  end;
  p := TreasureItems;                             { 2f00:1d66 }
  while p <> nil do begin                         { 2f00:1d73 }
    BuildItemName(SelectedChar, p, 0, 0, 0, 0);   { 2f00:1d7b  BuildItemName }
    p := p^.next;                                 { 2f00:1d9a }
  end;
end;                                              { t = FFh: money only }
```
{ quirk: r2 = 48 or 49 assigns no type, so `typ` keeps the previous item's type (or stack garbage for the first item). }
{ quirk: only randomly generated treasure gets its names built here; items from ITEMn.DAX keep zero names until a later
  BuildItemName (ITEM.md: name bytes are 0 in the DAX records). }
{ note: items are prepended, so the list is in reverse order of the record. }

### 2F00:1DB1 ecl_op28_Rob (H)
`procedure ecl_op28_Rob` — callers: ecl_Dispatch (op 28h). Callees: ecl_ReadOperands, ecl_OperandValue, real arithmetic (@LongToReal, @RealDiv), ScaleMoney (ScaleMoney), LoseItemsChance (LoseItemsChance).
```pascal
ecl_ReadOperands(3);                              { 2f00:1db7 }
who := Lo(v(1));                                  { 2f00:1dbf }
pct := Lo(v(2));                                  { 2f00:1dca }
f := (100 - pct) / 100.0;                         { 2f00:1dd5  6-byte real, constant 87h 0 4800h = 100.0 }
loss := Lo(v(2));                                 { 2f00:1dfd  quirk: operand 2 again, operand 3 unused }
if who = 0 then begin                             { 2f00:1e08 }
  ScaleMoney(f, SelectedChar);                    { 2f00:1e0e }
  LoseItemsChance(loss, SelectedChar);            { 2f00:1e24 }
end else begin
  c := PartyHead;                                 { 2f00:1e37 }
  while c <> nil do begin                         { 2f00:1e44 }
    items := c^.items;                            { 2f00:1e4c  +C8h, dead store }
    ScaleMoney(f, c);                             { 2f00:1e5f }
    LoseItemsChance(loss, c);                     { 2f00:1e73 }
    c := c^.next;                                 { 2f00:1e82 }
  end;
end;
```

## ov03 (2F00) part C — 2F00:1EF8 .. end (fork C)

Conventions as VIEW.pas.md: Pascal-order signatures, `{ ssss:oooo }` = first instruction of the statement.
`v(i)` = `ecl_OperandValue(i)`, `a(i)` = `MakeWord(OpLo[i], OpHi[i])` = `OpHi[i]*256+OpLo[i]` (address field of operand i),
`Mem[x]` = VM word/byte at ECL address x via the region arrays (ECL_VM.md §3; e.g. `Mem[6DC1]` = `ecl_Mem6B00^` word +582h).
ENGINE callees are named with the ENGINE.draft.md names (draft, conf as there): 0709:0768 DrawWrappedText(x1,y1,x2,y2,colour,clear,s),
0709:0DD3 ClearTextRectangle(x1,y1,x2,y2), 0709:0DBE MessageDelay, 0709:0BF5 ShowBottomPromptAndReadKey(colour, s), 0709:01DF DrawRepeatedGlyph,
03F1:02E8 DrawTitledFrame, 00BA:0767 DrawPartyRoster(c), 00BA:0BB8 RecalcCharacter(c), 00BA:27D9 RedrawCurrentMode,
00BA:290B DrawLocationTimeStatus, 00BA:2C48 SelectPartyCharacter(prompt, flag, var c), 08AE:00DC PlayOrStopSound(snd).
`g_5E24`/`g_5E25` = text cursor column/row (DrawWrappedText reads/writes them, ENGINE draft 0709:07C1); named text_Col/text_Row here.

### 2F00:1EF8 ecl_op29_EncounterMenu (H)
`procedure ecl_op29_EncounterMenu` — opcode 29h, 14 operands. callers: ecl_Dispatch. callees: PartyMoveRange, ecl_ReadOperands, ecl_OperandValue, MakeWord, ApproachDistance, ShowEncounter, DrawWrappedText, MenuSelect, ecl_SetMem, ClearTextRectangle.
Locals: `maxMove [BP-40Ah]`, `minMove [BP-40Bh]`, `react[0..4] [BP-6..-2]`, `txt[0..3]: string[255] [BP-406h + k*100h]`, `fleeLimit [BP-407h]`, `monFleeLimit [BP-408h]`, `dest [BP-43Dh]`, `choice [BP-1]`, `again [BP-40Ch]`.
```pascal
g_84E9 := 1;                                              { 2f00:1eff  encounter menu active (read by ShowEncounter) }
g_84E4 := 0;                                              { 2f00:1f04 }
g_4A00 := 1;                                              { 2f00:1f09 }
PartyMoveRange(maxMove, minMove);                         { 2f00:1f0e  PartyMoveRange: max / min of member move }
title := '';                                              { 2f00:1f1f  [BP-439h] }
ecl_ReadOperands(14);                                     { 2f00:1f24 }
enc_SpriteId := v(1);                                     { 2f00:1f2c  g_6F81 }
Mem[6DC0] := v(2);                                        { 2f00:1f37  requested distance }
enc_PicId := v(3);                                        { 2f00:1f48  g_6F82 }
dest := a(4);                                             { 2f00:1f53 }
for i := 0 to 4 do react[i] := v(i + 5);                  { 2f00:1f64  operands 5..9 }
for k := 1 to 3 do txt[k] := Str[k];                      { 2f00:1f92  operands 10..12 = string slots 1..3 }
fleeLimit := v(13);                                       { 2f00:1fd1 }
monFleeLimit := v(14);                                    { 2f00:1fdd }
Mem[6DC1] := ApproachDistance(party_MapX, party_MapY, party_Dir);   { 2f00:1fe9 }
if Mem[6DC0] < Mem[6DC1] then Mem[6DC1] := Mem[6DC0];    { 2f00:2005 }
ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g_84C8);{ 2f00:202b }
repeat                                                    { 2f00:2047 }
  highlight := (g_84E0 <> 0) and (g_84E1 <> 0);           { 2f00:2047 }
  clearIt := 1;                                           { 2f00:205f }
  again := false;                                         { 2f00:2064 }
  text_Col := 1;  text_Row := $11;                        { 2f00:2069 }
  case Mem[6DC1] of                                       { 2f00:2073  pick the text for the distance, fall back cyclically }
    0: begin k := 1;                                      { 2f00:2081 }
         repeat txt[0] := txt[k]; k := k + 1 until (txt[0] <> '') or (k > 3) end;
    1: begin k := 2;                                      { 2f00:20c1 }
         repeat txt[0] := txt[k]; k := k + 1; if k > 3 then k := 1 until (txt[0] <> '') or (k = 2) end;
    2: begin k := 3;                                      { 2f00:210c }
         repeat txt[0] := txt[k]; k := k + 1; if k > 3 then k := 1 until (txt[0] <> '') or (k = 3) end;
  end;                                                    { quirk: distance > 2 keeps the previous txt[0] (uninitialised on the first pass) }
  if txt[0] = '' then clearIt := 0;                       { 2f00:2150 }
  DrawWrappedText(1, $11, $26, $16, $0A, clearIt, txt[0]);{ 2f00:215c }
  if (Mem[6DC1] = 0) or (Mem[49E6] = 0) then              { 2f00:217b }
    items := '~COMBAT ~WAIT ~FLEE ~PARLAY'                { 2f00:2193 }
  else
    items := '~COMBAT ~WAIT ~FLEE ~ADVANCE';              { 2f00:21a9 }
  choice := MenuSelect(title, items, $0D, $0A, $0F, 0, highlight);   { 2f00:21bd  MenuSelect, 0-based }
  if ((Mem[6DC1] = 0) or (Mem[49E6] = 0)) and (choice = 3) then choice := 4;   { 2f00:21e2  PARLAY }
  r := react[choice];                                     { 2f00:2204 }
  case r of
    0: if choice = 2 then begin                           { 2f00:2212 }
         if minMove >= fleeLimit then ecl_SetMem(dest, 2) { 2f00:222f  party escapes }
         else ecl_SetMem(dest, 1)                         { 2f00:2248 }
       end else ecl_SetMem(dest, 1);                      { 2f00:2220 }
    1: case choice of                                     { 2f00:2258 }
         0: ecl_SetMem(dest, 1);                          { 2f00:2266 }
         1: begin again := true; DrawWrappedText(1, $11, $26, $16, $0A, 1, 'Both sides wait.') end;   { 2f00:227a }
         2: ecl_SetMem(dest, 2);                          { 2f00:22ad }
         3: begin                                         { 2f00:22c1  ADVANCE }
              if Mem[6DC1] <> 0 then begin Mem[6DC1] := Mem[6DC1] - 1; ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g_84C8) end
              else DrawWrappedText(1, $11, $26, $16, $0A, 1, 'Both sides wait.');
              again := true                               { 2f00:231b }
            end;
         4: if Mem[6DC1] = 0 then ecl_SetMem(dest, 3)     { 2f00:2326  PARLAY at distance 0 }
            else begin Mem[6DC1] := Mem[6DC1] - 1; ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g_84C8); again := true end;   { 2f00:2341 }
       end;
    2: if choice = 0 then begin                           { 2f00:2375  monsters may flee }
         if monFleeLimit > maxMove then begin             { 2f00:237c }
           ecl_SetMem(dest, 0);                           { 2f00:2386 }
           text_Col := 1; text_Row := $11;                { 2f00:2392 }
           DrawWrappedText(1, $11, $26, $16, $0A, 1, 'The monsters flee.')   { 2f00:239c }
         end else ecl_SetMem(dest, 1)                     { 2f00:23c5 }
       end else if choice in [1..4] then begin            { 2f00:23d4 }
         ecl_SetMem(dest, 0);                             { 2f00:23dc }
         text_Col := 1; text_Row := $11;                  { 2f00:23e8 }
         DrawWrappedText(1, $11, $26, $16, $0A, 1, 'The monsters flee.')   { 2f00:23f2 }
       end;
    3: case choice of                                     { 2f00:2423 }
         0: ecl_SetMem(dest, 1);                          { 2f00:242a }
         1, 3: begin                                      { 2f00:2442 }
              if Mem[6DC1] <> 0 then begin Mem[6DC1] := Mem[6DC1] - 1; ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g_84C8) end
              else DrawWrappedText(1, $11, $26, $16, $0A, 1, 'Both sides wait.');
              again := true                               { 2f00:249c }
            end;
         2: ecl_SetMem(dest, 2);                          { 2f00:24a7 }
         4: if Mem[6DC1] = 0 then ecl_SetMem(dest, 3)     { 2f00:24ba }
            else begin Mem[6DC1] := Mem[6DC1] - 1; ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g_84C8); again := true end;   { 2f00:24d5 }
       end;
    4: case choice of                                     { 2f00:2505 }
         0: ecl_SetMem(dest, 1);                          { 2f00:250c }
         1, 3, 4: if Mem[6DC1] = 0 then ecl_SetMem(dest, 3)   { 2f00:2527 }
                  else begin Mem[6DC1] := Mem[6DC1] - 1; ShowEncounter(enc_SpriteId, enc_PicId, Mem[6DC1], g_84C8); again := true end;   { 2f00:2542 }
         2: ecl_SetMem(dest, 2);                          { 2f00:2572 }
       end;
  end;                                                    { r >= 5: nothing stored, loop ends }
until not again;                                          { 2f00:257f }
ClearTextRectangle(0, $18, $27, $18);                     { 2f00:2589  clear the menu line (row 24) }
g_4A00 := 0;                                              { 2f00:259a }
g_84E9 := 0;                                              { 2f00:259f }
```
Result in `dest`: 0 = monsters flee, 1 = combat, 2 = party flees, 3 = parlay. **Correction to ECL_VM.md §4.4 table**: r=0/FLEE compares the party's *minimum* move (`[BP-40Bh]`) with v(13) (`minMove >= v(13)` → 2), r=2/COMBAT compares v(14) with the party's *maximum* move (`v(14) > maxMove` → 0); PartyMoveRange's first var parameter is the maximum (ov07 4300:203D `cmp al,es:[di]; jbe` on [BP+0Ah]).

### 2F00:25CB ecl_op2C_Parlay (H)
`procedure ecl_op2C_Parlay` — opcode 2Ch, 6 operands. callers: ecl_Dispatch. callees: ecl_ReadOperands, ecl_OperandValue, MenuSelect, MakeWord, ecl_SetMem.
```pascal
ecl_ReadOperands(6);                                      { 2f00:25d2 }
title := ' ';                                             { 2f00:25da  CharToStr(#$20) }
for i := 0 to 4 do resp[i] := v(i + 1);                   { 2f00:25de }
k := MenuSelect(title, '~HAUGHTY ~SLY ~NICE ~MEEK ~ABUSIVE', $0D, $0A, $0F, 0, 0);   { 2f00:2605 }
ecl_SetMem(a(6), resp[k]);                                { 2f00:263b }
```

### 2F00:266A ecl_op32_FindItem (H)
`procedure ecl_op32_FindItem` — opcode 32h, 1 operand. callers: ecl_Dispatch.
```pascal
ecl_ReadOperands(1);                                      { 2f00:2670 }
found := false;                                           { 2f00:2678 }
id := v(1);                                               { 2f00:267c }
FillChar(ecl_FlagEQ, 6, 0);                               { 2f00:2687 }
ecl_FlagNE := 1;                                          { 2f00:2698 }
c := PartyHead;                                           { 2f00:269d  includes loaded monsters }
while (c <> nil) and not found do begin                   { 2f00:26aa }
  it := c^.items;                                         { 2f00:26b8  TChar +C8h }
  while (it <> nil) and not found do begin                { 2f00:26cb }
    if it^.type = id then begin                           { 2f00:26d9  item +2Eh }
      ecl_FlagEQ := 1; ecl_FlagNE := 0; found := true     { 2f00:26e5 }
    end;
    it := it^.next                                        { 2f00:26f3  item +2Ah }
  end;
  c := c^.next                                            { 2f00:2706  TChar +104h }
end;
```

### 2F00:271F ecl_op3A_Delay (H)
`procedure ecl_op3A_Delay` — opcode 3Ah.
```pascal
ecl_PC := ecl_PC + 1;                                     { 2f00:2722 }
MessageDelay;                                             { 2f00:2726  0709:0DBE }
```

### 2F00:2775 ecl_op2E_Damage (H)
`procedure ecl_op2E_Damage` — opcode 2Eh, 5 operands. callers: ecl_Dispatch. callees: Roll (Roll), SavingThrow (saving throw, M), AttackRollVsAC (target/hit check, M), ApplyEclDamage (ApplyEclDamage), DrawTitledFrame, DrawWrappedText, Crt.Delay, ShowBottomPromptAndReadKey.
```pascal
saved := SelectedChar;                                    { 2f00:277b }
allMembers := false;                                      { 2f00:278c  [BP-1Ah] }
c := PartyHead;                                           { 2f00:2790 }
ecl_ReadOperands(5);                                      { 2f00:279d }
flags := v(1); dice := v(2); sides := v(3); bonus := v(4); save := v(5);   { 2f00:27a5 }
dmg := bonus + Roll(dice, sides);                         { 2f00:27dc }
if flags and $40 <> 0 then allMembers := true             { 2f00:27f7 }
else victim := Roll(1, Mem[6E3E]);                        { 2f00:2806  1d(party member count) }
if flags and $80 <> 0 then begin                          { 2f00:281b }
  kind := flags and $1F;                                  { 2f00:2827 }
  st := save and 7;                                       { 2f00:282f }
  if allMembers then begin                                { 2f00:2837 }
    while c <> nil do begin                               { 2f00:283d  quirk: walks the whole list, monsters included }
      if flags and $20 <> 0 then ApplyEclDamage(dmg, c)   { 2f00:2845  no saving throw }
      else if not SavingThrow(c, st, kind) then ApplyEclDamage(dmg, c);   { 2f00:285e }
      c := c^.next                                        { 2f00:2883 }
    end                                                   { same dmg for everybody }
  end else if save and $80 <> 0 then begin                { 2f00:289b  the selected character }
    if (st = 0) or not SavingThrow(SelectedChar, st - 1, kind) then   { 2f00:28a4 }
      ApplyEclDamage(dmg, SelectedChar)                   { 2f00:28c6 }
  end else begin                                          { 2f00:28d8  a random member }
    for k := 2 to victim do c := c^.next;                 { 2f00:28de }
    if not SavingThrow(c, st, kind) then ApplyEclDamage(dmg, c)   { 2f00:2908 }
  end
end else
  for i := 1 to flags do begin                            { 2f00:2930  flags = number of hits }
    c := PartyHead;                                       { 2f00:2948 }
    victim := Roll(1, Mem[6E3E]);                         { 2f00:2955 }
    for k := 1 to victim - 1 do c := c^.next;             { 2f00:296a }
    if AttackRollVsAC(c, save) then ApplyEclDamage(dmg, c);    { 2f00:298e }
    dmg := bonus + Roll(dice, sides)                      { 2f00:29af  re-rolled per hit }
  end;
PartyDead := true;                                        { 2f00:29d5 }
c := PartyHead;
while c <> nil do begin                                   { 2f00:29e7 }
  if c^.active <> 0 then PartyDead := false;              { 2f00:29ef  TChar +10Dh; quirk: monsters in the list count too }
  c := c^.next
end;
if PartyDead then begin                                   { 2f00:2a14 }
  DrawTitledFrame(1, 1, $26, $16, 0, $0F, 'The END!');    { 2f00:2a1b }
  text_Col := 2;  text_Row := 2;                          { 2f00:2a41 }
  DrawWrappedText(1, 1, $26, $16, $0A, 1, 'The entire party is killed!');   { 2f00:2a4b }
  Delay(3000)                                             { 2f00:2a71 }
end;
SelectedChar := saved;                                    { 2f00:2a7a }
ShowBottomPromptAndReadKey($0F, 'press <enter>/<return> to continue');   { 2f00:2a87 }
```
Argument orders from the pushes: `Roll(dice, sides)` (2f00:27dc pushes [BP-2] then [BP-3]), `SavingThrow(c, st, kind)` (pushes char, [BP-9], [BP-5]), `AttackRollVsAC(c, save)`.

### 2F00:2AA2 ecl_op31_SpriteOff (H)
```pascal
ecl_PC := ecl_PC + 1;                                     { 2f00:2aa5 }
if g_84E3 <> 0 then begin                                 { 2f00:2aa9  sprite / picture shown in the view }
  RefreshView;                                            { 2f00:2ab0  RefreshView (VIEW lane name) }
  g_84E3 := 0;  g_84E0 := 0                               { 2f00:2ab5 }
end;
```

### 2F00:2AC1 ecl_op34_EclClock (H)
```pascal
ecl_ReadOperands(1);                                      { 2f00:2ac7 }
n := v(i);                                                { 2f00:2acf  quirk: i = [BP-1], never initialised }
AdvanceClock(n, 1);                                       { 2f00:2adb  AdvanceClock(count, counter index) — arg roles M }
```

### 2F00:2AEB ecl_op33_PrintReturn (H)
```pascal
ecl_PC := ecl_PC + 1;                                     { 2f00:2aee }
if g_84DF <> 0 then begin text_Col := 1; text_Row := text_Row + 1; g_84DF := 0 end   { 2f00:2af2 }
else begin text_Col := 1; text_Row := text_Row + 1 end;   { 2f00:2b09  same effect in both branches }
```

### 2F00:2B14 ecl_op3D_ClearBox (H)
```pascal
ecl_PC := ecl_PC + 1;                                     { 2f00:2b17 }
ClearTextRectangle(1, 1, $0F, $0F);                       { 2f00:2b1b  the picture box }
g_84DE := 1;                                              { 2f00:2b2c  box cleared → PRINT_MEM may print into it }
```

### 2F00:2B33 ecl_op39_Who (H)
```pascal
ecl_ReadOperands(1);                                      { 2f00:2b3a }
ClearTextRectangle(1, $11, $26, $16);                     { 2f00:2b42  text window }
prompt := Str[1];                                         { 2f00:2b53 }
SelectPartyCharacter(prompt, 0, SelectedChar);            { 2f00:2b67  00BA:2C48 "Select / Exit" picker }
```

### 2F00:2B7E ecl_op36_AddNpc (M)
```pascal
ecl_ReadOperands(2);                                      { 2f00:2b84 }
id := v(1);                                               { 2f00:2b8c }
AddNpcToParty(id);                                            { 2f00:2b97  load NPC id into the party (M; selects it) }
m := (v(2) shr 1) or $80;                                 { 2f00:2ba0 }
SelectedChar^.npc_flags := m;                             { 2f00:2bbd  TChar +84h }
if id = $18 then SelectedChar^.unk_10E := 1               { 2f00:2bc9 }
else SelectedChar^.unk_10E := 0;                          { 2f00:2bcf }
RecalcCharacter(SelectedChar);               { 2f00:2be5 }
DrawPartyRoster(SelectedChar);                            { 2f00:2bf2 }
```

### 2F00:2C03 ecl_op3B_Spell (H)
```pascal
ecl_ReadOperands(3);                                      { 2f00:2c09 }
id := v(1);                                               { 2f00:2c11 }
dSlot := Lo(a(2));                                        { 2f00:2c1c  quirk: MOV [BP-9],AL — address truncated to a byte }
dWho := Lo(a(3));                                         { 2f00:2c2c  quirk: [BP-0Ah] }
k := 1;                                                   { 2f00:2c3c  set once, not per member }
who := 0;                                                 { 2f00:2c40 }
c := PartyHead;                                           { 2f00:2c44 }
while (c <> nil) and not found do begin                   { 2f00:2c51  quirk: found = [BP-8] never initialised }
  repeat                                                  { 2f00:2c5f }
    if c^.mem_spell[k] = id then found := true            { 2f00:2c62  TChar +17h+k }
    else if k <= $51 then k := k + 1                      { 2f00:2c78 }
    else begin k := $FF; found := true end                { 2f00:2c83 }
  until found;                                            { → loop always ends after the first member }
  c := c^.next;  who := who + 1                           { 2f00:2c91 }
end;
ecl_SetMem(dSlot, k);                                     { 2f00:2ca9  region 4 → ignored }
ecl_SetMem(dWho, who);                                    { 2f00:2cba  region 4 → ignored }
```

### 2F00:2CCF ecl_op2D_Call (H)
```pascal
ecl_ReadOperands(1);                                      { 2f00:2cd5 }
t := a(1);                                                { 2f00:2cdd  the address field selects the routine }
case t - $7FFF of                                         { 2f00:2ced }
  $AC91 {2C90h}: begin                                    { 2f00:2cfe }
      party_CellAttr := GetCellAttr(party_MapX, party_MapY);   { 2f00:2cfe  g_6AB1 }
      if (g_4431 <> 0) and ((g_84E0 <> 0) or (g_84E3 <> 0) or (g_84E5 <> 0) or (g_84E6 <> 0) or (g_84E8 <> 0)) then begin   { 2f00:2d0e }
        RefreshView;                                        { 2f00:2d38  RefreshView }
        DrawLocationTimeStatus;                           { 2f00:2d3d }
        g_84E8 := 0; g_84E5 := 0; g_84E6 := 0; g_84E0 := 0; g_84E3 := 0   { 2f00:2d42 }
      end
    end;
  1 {8000h}: SetupDuel(1);                                { 2f00:2d62 }
  2 {8001h}: SetupDuel(0);                                { 2f00:2d71 }
  $3A04 {BA03h}: if g_84CC = 8 then PlayOrStopSound(g_2628)   { 2f00:2d80 }
                 else if g_84CC = 10 then PlayOrStopSound(g_262A);   { 2f00:2d93 }
  $401F {C01Eh}: StepForward;                             { 2f00:2da8  StepForward }
  $4019 {C018h}: if travel_Mode = 1 then                  { 2f00:2db4 }
                   party_Ahead := GetWallType(party_MapX, party_MapY, party_Dir);   { 2f00:2dbb  g_6AB0 }
end;                                                      { any other address: no-op }
```

### 2F00:2DD3 ecl_CampCheck (H)
`procedure ecl_CampCheck` — callers: ecl_GameLoop ('E' key), ecl_op38_Program (9). callees: ecl_Run, Camp (camp menu "Camp:", "The party makes camp..."), RedrawCurrentMode, RefreshView (RefreshView).
```pascal
rested := false;                                          { 2f00:2dd9 }
ecl_Run(ecl_VecC);                                        { 2f00:2ddd }
Camp(rested);                                        { 2f00:2de5  camp menu; var result }
if rested then begin                                      { 2f00:2def }
  RedrawCurrentMode;                                      { 2f00:2df5 }
  ecl_Run(ecl_VecD)                                       { 2f00:2dfa }
end;
RefreshView;                                                { 2f00:2e02  RefreshView }
g_557D := 0;                                              { 2f00:2e07 }
```
Note: the script's camp vector runs before the menu even if the player then leaves the menu.

### 2F00:2E10 ecl_op38_Program (H)
```pascal
if g_4430 <> 0 then begin SelectedChar := g_4436; g_4430 := 0 end;   { 2f00:2e16 }
ecl_ReadOperands(1);                                      { 2f00:2e30 }
p := v(1);                                                { 2f00:2e38 }
case p of
  0: begin PartyCreationMenu; RedrawCurrentMode end;              { 2f00:2e4a  ov16 = top-level menu unit ("Choose a function", M) }
  8: DragonFinale;                                           { 2f00:2e5a  end-game sequence (M) }
  9: begin                                                { 2f00:2e65 }
       pc := ecl_PC;
       ecl_CampCheck;                                     { 2f00:2e6c  runs vecC/vecD → nested ecl_Run changes ecl_PC }
       ecl_PC := pc;                                      { 2f00:2e6f }
       ecl_op00_Exit                                      { 2f00:2e76  near CALL 0001 }
     end;
end;
```

### 2F00:2E7D ecl_op3C_PrintMem (H)
```pascal
FillChar(g_84C8, 2, 0);                                   { 2f00:2e83 }
g_84E0 := 0;                                              { 2f00:2e94 }
ecl_ReadOperands(1);                                      { 2f00:2e99 }
base := a(1);                                             { 2f00:2ea1 }
i := 0;  done := false;                                   { 2f00:2eb1 }
if (g_84DE <> 0) and (text_Row > $0D) then begin          { 2f00:2eb9  box was cleared by CLEAR_BOX }
  text_Row := 5;  text_Col := 2;  g_84E2 := 1             { 2f00:2ec7 }
end;
g_84DF := 1;                                              { 2f00:2ed6 }
repeat
  g := Lo(ecl_GetMem(base + i) + 1);                      { 2f00:2edb  quirk: glyph = value + 1 }
  if g > 1 then begin                                     { 2f00:2ef2  stop on value 0 or FFh }
    DrawRepeatedGlyph(text_Col, text_Row, $0F, 1, g, 0);  { 2f00:2ef8 }
    text_Col := text_Col + 1;  i := i + 1                 { 2f00:2f12 }
  end else done := true                                   { 2f00:2f1b }
until done;
text_Row := text_Row + 1;                                 { 2f00:2f25 }
```

### 2F00:2F2D ecl_Dispatch (H)
`procedure ecl_Dispatch` — caller ecl_Run. A TP `case` compiled as a compare chain on `ecl_CurOp` (2f00:2f30).
```pascal
case ecl_CurOp of                                         { 2f00:2f30 }
  $00: ecl_op00_Exit;                 $01: ecl_op01_Goto;            $02: ecl_op02_Gosub;
  $03: ecl_op03_Compare;              $04..$07: ecl_op04_AddSubDivMul;
  $08: ecl_op08_Random;               $09: ecl_op09_Save;            $0A: ecl_op0A_LoadCharacter;
  $0B: ecl_op0B_LoadMonster;          $0C: ecl_op0C_SetupMonster;    $0D: ecl_op0D_Approach;
  $0E: ecl_op0E_Picture;              $0F: ecl_op0F_InputNumber;     $10: ecl_op10_InputString;
  $11, $12: ecl_op11_Print;           $13: ecl_op13_Return;          $14: ecl_op14_CompareAnd;
  $15: ecl_op15_VerticalMenu;         $16..$1B: ecl_op16_If;         $1C: ecl_op1C_ClearMonsters;
  $1D: ecl_op1D_PartyStrength;        $1E: ecl_op1E_CheckParty;      { $1F: no entry }
  $20: ecl_op20_NewEcl;               $21, $37: ecl_op21_LoadFilesPieces;
  $22: ecl_op22_PartySurprise;        $23: ecl_op23_Surprise;        $24: ecl_op24_Combat;
  $25, $26: ecl_op25_OnGotoGosub;     $27: ecl_op27_Treasure;        $28: ecl_op28_Rob;
  $29: ecl_op29_EncounterMenu;        $2A: ecl_op2A_GetTable;        $2B: ecl_op2B_HorizontalMenu;
  $2C: ecl_op2C_Parlay;               $2D: ecl_op2D_Call;            $2E: ecl_op2E_Damage;
  $2F, $30: ecl_op2F_AndOr;           $31: ecl_op31_SpriteOff;       $32: ecl_op32_FindItem;
  $33: ecl_op33_PrintReturn;          $34: ecl_op34_EclClock;        $35: ecl_op35_SaveTable;
  $36: ecl_op36_AddNpc;               $38: ecl_op38_Program;         $39: ecl_op39_Who;
  $3A: ecl_op3A_Delay;                $3B: ecl_op3B_Spell;           $3C: ecl_op3C_PrintMem;
  $3D: ecl_op3D_ClearBox;
end;                                                      { 2f00:316f  no else: 1Fh / >3Dh leave ecl_PC unchanged → endless loop }
```
Chain order in the bytes: 00..15, the group 16..1B, 1C, 1D, 1E, 20, 21/37, 22..2E, 2F/30, 31..36, 38..3D (2f00:2f33..3167).

### 2F00:3171 ecl_Run (H)
`procedure ecl_Run(addr [BP+6]: Word)` — callers: ecl_CampCheck, ecl_RunAfterNewBlock, ecl_GameLoop.
```pascal
ecl_PC := addr;                                           { 2f00:3174 }
ecl_Stop := false;                                        { 2f00:317a  g_442E }
while not ecl_Stop and not PartyDead do begin             { 2f00:317f }
  ecl_LastOp := ecl_CurOp;                                { 2f00:318d }
  ecl_CurOp := CodeBuf^[ecl_PC - $9900];                  { 2f00:3193 }
  ecl_Dispatch                                            { 2f00:31a4 }
end;
ecl_Stop := false;                                        { 2f00:31aa }
```

### 2F00:31B4 ecl_RunAfterNewBlock (H)
`procedure ecl_RunAfterNewBlock` — callers: ecl_GameLoop (after any vector that executed NEW_ECL). Runs the new block's init vector, sets the travel mode, then A and B, repeating while NEW_ECL keeps chaining.
```pascal
repeat                                                    { 2f00:31ba }
  party_CellAttr := GetCellAttr(party_MapX, party_MapY);  { 2f00:31ba }
  Mem[6DD5] := 0;                                         { 2f00:31ca  block 2 +5AAh }
  saved := SelectedChar;                                  { 2f00:31d5 }
  g_49F9 := travel_Mode;                                  { 2f00:31e2  previous mode }
  travel_Mode := 1;                                       { 2f00:31e8 }
  ecl_Run(ecl_VecE);                                      { 2f00:31ed }
  g_49F3 := 4;                                            { 2f00:31f5 }
  if Mem[49E6] = 0 then                                   { 2f00:31fa  not a 3D area }
    case ecl_Block of
      $19: begin travel_Mode := 2; g_49F3 := 3 end;       { 2f00:320d }
      $1A: begin travel_Mode := 3; g_49F3 := 3;           { 2f00:321d }
             if (Mem[4AB3] = $FE) and (Mem[4AA2] = 0) then RecolourOverlandTiles(1)   { 2f00:3227  block-1 +366h / +344h }
           end;
      $1B: begin travel_Mode := 4; g_49F3 := 3 end;       { 2f00:324e }
    end;
  if (g_49F9 > 1) and (travel_Mode = 1) then              { 2f00:3258  overland → 3D }
    DrawTitledFrame(3, 3, $0D, $0D, 0, $0A, '');          { 2f00:3266 }
  if (((g_49F9 > 1) or (travel_Mode = 1)) and (g_4431 <> 0))  { 2f00:328c }
     or ((g_49F9 = 1) and (travel_Mode = 1)) then
    RefreshView;                                            { 2f00:32af  RefreshView }
  ecl_Restart := false;                                   { 2f00:32b4  g_442F }
  ecl_Run(ecl_VecA);                                      { 2f00:32b9 }
  if not ecl_Restart then begin                           { 2f00:32c1 }
    ecl_Run(ecl_VecB);                                    { 2f00:32c8 }
    SelectedChar := saved;                                { 2f00:32d0 }
    DrawPartyRoster(SelectedChar)                         { 2f00:32dd }
  end
until not ecl_Restart;                                    { 2f00:32ea }
```

### 2F00:32F8 ecl_GameLoop (H)
`procedure ecl_GameLoop` — called from main (0000:00F6 body, `ecl_GameLoop`). callees: LoadEclBlock, ecl_InitVM, ecl_Run, RedrawCurrentMode, RefreshView (RefreshView), ExploreCommand (ExploreCommand), MoveParty (MoveParty), ecl_CampCheck, ecl_RunAfterNewBlock, PlayOrStopSound.
```pascal
g_4433 := 0; g_4434 := 0; g_4430 := 0; g_4431 := 0;       { 2f00:32fe }
g_4432 := 1;                                              { 2f00:3312 }
g_49F3 := 4;                                              { 2f00:3317 }
ecl_Restart := false;                                     { 2f00:331c }
ecl_Block := Lo(Mem[49F2]);                               { 2f00:3321  block to resume }
if (ecl_Block in [$19, $1A, $1B]) and (Mem[49E6] = 0) then g_49F3 := 3;   { 2f00:332d }
if g_49F8 = 0 then LoadEclBlock(ecl_Block);               { 2f00:334d  g_49F8 <> 0: a loaded saved game already holds the script }
ecl_InitVM;                                               { 2f00:335d }
ecl_Run(ecl_VecE);                                        { 2f00:3362 }
if g_49F3 <> 3 then begin                                 { 2f00:336a }
  if g_4432 = 1 then begin RedrawCurrentMode; g_4432 := 0 end;   { 2f00:3371 }
  RefreshView                                             { 2f00:3382  RefreshView }
end;
Mem[49F2] := ecl_Block;                                   { 2f00:3387 }
repeat                                                    { 2f00:3395 }
  key := ExploreCommand;                                  { 2f00:3395  ExploreCommand }
  g_4436 := SelectedChar;                                 { 2f00:339d }
  Mem[49F2] := ecl_Block;                                 { 2f00:33ab }
  while ((Mem[6DCA] > 1) or (UpCase(key) = 'E')) and not PartyDead do begin   { 2f00:33b9  Look (bit 1) or Encamp }
    if UpCase(key) = 'E' then ecl_CampCheck               { 2f00:33d9 }
    else begin                                            { 2f00:33ec  Look: run vecB as if searching this square }
      g_84DD := Mem[6DCA] and 1;                          { 2f00:33ec  keep the Search bit }
      Mem[6DCA] := 1;                                     { 2f00:33fb }
      RefreshView;                                          { 2f00:3406  RefreshView }
      ecl_Run(ecl_VecB);                                  { 2f00:340b }
      if ecl_Restart then ecl_RunAfterNewBlock;           { 2f00:3413 }
      Mem[6DCA] := g_84DD                                 { 2f00:341e }
    end;
    if not PartyDead then begin                           { 2f00:342c }
      key := ExploreCommand;                              { 2f00:3433 }
      g_4436 := SelectedChar                              { 2f00:343b }
    end
  end;
  if not PartyDead then ecl_Run(ecl_VecA);                { 2f00:344c }
  if ecl_Restart then ecl_RunAfterNewBlock                { 2f00:345b }
  else if not PartyDead then begin                        { 2f00:3469 }
    Mem[49F0] := ShortInt(party_MapX);                    { 2f00:3473  block 1 +1E0h }
    Mem[49F1] := ShortInt(party_MapY);                    { 2f00:3480  +1E2h }
    MoveParty;                                            { 2f00:348d  MoveParty }
    RefreshView;                                            { 2f00:3492  RefreshView }
    if (party_MapX <> Mem[49F0]) or (party_MapY <> Mem[49F1]) then   { 2f00:3497 }
      PlayOrStopSound(g_2628);                            { 2f00:34cf  step sound }
    g_84E0 := 0;  g_84E1 := 1;                            { 2f00:34d8 }
    ecl_Run(ecl_VecB);                                    { 2f00:34e2 }
    if ecl_Restart then ecl_RunAfterNewBlock              { 2f00:34ea }
  end
until PartyDead;                                          { 2f00:34f5 }
PartyDead := false;                                       { 2f00:34ff }
```
Note: `Mem[6DCA]` bit 0 = Search toggled by 'S', bit 1 = Look set by 'L' (ExploreCommand, VIEW.pas.md 6600:0A5E/0A79), so Look runs vecB with only bit 0 = 1, then restores the Search bit.

### 2F00:3508 ov03_init (H)
```pascal
{ empty unit initialisation }                             { 2f00:3508 }
```

Notes for the merge
- `RefreshView` = RefreshView (A200:016D, VIEW lane name): from its decompile it redraws the current view: mode 1 (or `Mem[49E6] <> 0`) → recompute g_6AB1, backdrop colours (from **g_6F69 / g_6F68 when g_84E5**, via A200:00C7/00FB/012F), SetBackdropColours, Draw3DView; modes 2..4 → overland. So ECL C059h/C05Fh (g_6F68/g_6F69 + g_84E5) are **3D backdrop (sky/ground) colour selectors** (M) — resolves an ECL_VM §9 unknown.
- PartyCreationMenu, DragonFinale, RecolourOverlandTiles, Camp, AddNpcToParty, SavingThrow, AttackRollVsAC are other areas; roles in comments are M.

---

# ov07 (4300)

## ov07 (4300) part D — operand decoder, VM init/loader, encounter display, VM memory (4300:0000..0F52)

Conventions as VIEW.pas.md: Pascal-order signatures (first parameter = highest BP offset), `{ seg:off }` = first
instruction of the statement. VM names per decode/ecl/ECL_VM.md: `Code[a]` = `ecl_CodeBuf^[a - $9900]` (the asm form
`ES:[DI+6700h]` with DI = CodeBuf + a); `Mem4900^[a]` = word `ecl_Mem4900^[(a-$4900)*2]` (asm `+6E00h`),
`Mem6B00^[a]` (asm `+2A00h`), `Mem9700^[a]` (asm `-2E00h`). `OpType/OpLo/OpHi[i]` = DS:7005+i / 7085+i / 7045+i.
`Str[k]` = DS:6FC8 + k*100h. Character fields by SAVES.md TChar names (`SelectedChar^` = far ptr DS:5D92).

### 4300:0000 ecl_ReadOperands (H)
`procedure ecl_ReadOperands(n [BP+6]: Byte)` — callers: every ov03 handler with operands, ecl_InitVM, ecl_SkipInstruction, ecl_op15/25/2B (second call). Callees: ecl_UnpackString, MakeWord, ecl_GetMemString.
```pascal
k := 0;                                                         { 4300:0006  string slot counter [bp-2] }
for i := 1 to n do begin                                        { 4300:000A  i = [bp-1]; skipped if n < 1 }
  OpType[i] := Code[ecl_PC + 1];                                { 4300:0022 }
  OpLo[i]   := Code[ecl_PC + 2];                                { 4300:003C }
  ecl_PC := ecl_PC + 2;                                         { 4300:0057 }
  case OpType[i] of                                             { 4300:005F }
    1, 2, 3: begin
               ecl_PC := ecl_PC + 1;                            { 4300:0076 }
               OpHi[i] := Code[ecl_PC];                         { 4300:007A }
             end;
    $80:     begin
               k := k + 1;                                      { 4300:009A }
               if OpLo[i] > 0 then                              { 4300:00AD }
                 ecl_UnpackString(OpLo[i], k)                   { 4300:00B3  Pascal order (len, slot); reads len bytes, advances ecl_PC }
               else
                 Str[k] := '';                                  { 4300:00C1 }
             end;
    $81:     begin
               k := k + 1;                                      { 4300:00D7 }
               ecl_PC := ecl_PC + 1;                            { 4300:00DA }
               OpHi[i] := Code[ecl_PC];                         { 4300:00DE }
               ecl_GetMemString(k, MakeWord(OpLo[i], OpHi[i])); { 4300:00F7  Pascal order (slot, addr): pushes k then addr }
             end;
  end;                                                          { other types: 2 bytes consumed, OpHi[i] stale }
end;
ecl_PC := ecl_PC + 1;                                           { 4300:012C  -> next opcode }
```

### 4300:0136 ecl_OperandValue (H)
`function ecl_OperandValue(i [BP+6]: Byte): Word` — callers: ov03 handlers. Callees: ecl_GetMem, MakeWord.
```pascal
lo := OpLo[i];  hi := OpHi[i];                                  { 4300:013C  quirk: index sign-extended (CBW), i >= 80h would index backwards }
case OpType[i] of                                               { 4300:0156 }
  0:          Result := lo;                                     { 4300:0164 }
  1, 3, $80:  Result := ecl_GetMem(hi * 256 + lo);              { 4300:017A  $80: meaningless (lo = string length) }
  2, $81:     Result := MakeWord(lo, hi);                       { 4300:019E }
end;                                                            { other types: Result = uninitialised local [bp-2] (quirk) }
```

### 4300:01B6 ecl_InitVM (H)
`procedure ecl_InitVM` — callers: ecl_GameLoop (2F00:335D), ecl_op20_NewEcl (2F00:0C55). Callees: FillChar, ecl_ReadOperands, MakeWord.
```pascal
g_84E0 := 0;  g_84E2 := 0;  g_84D2 := 0;  g_84D3 := 0;          { 4300:01BC }
g_6F68 := $41;  g_6F69 := 9;                                    { 4300:01D0  values of ECL addr C059/C05F }
g_84E5 := 1;                                                    { 4300:01DA  redraw request }
FillChar(g_84C8, 2, 0);                                         { 4300:01EB  encounter sprite/picture shown flags }
enc_NextIconSlot := 8;                                          { 4300:01F0  g_6F83 }
ecl_PC := $9900;                                                { 4300:01F5 }
g_70C6 := 0;                                                    { 4300:01FB }
ecl_GosubSP := nil;  g_6F74 := nil;                             { 4300:0200  gosub stack + its temp }
FillChar(ecl_FlagEQ, 6, 0);                                     { 4300:021C  EQ NE LT GT LE GE }
Mem6B00^[$6DE1] := $FF;                                         { 4300:0225  no head picture (PICTURE draws full PIC) }
Mem6B00^[$6DD2] := 0;  Mem6B00^[$6DD3] := 0;                    { 4300:0232 }
Mem4900^[$49E5] := 0;                                           { 4300:0248 }
ecl_ReadOperands(1);  ecl_VecA := MakeWord(OpLo[1], OpHi[1]);   { 4300:0251  operand of the GOTO at 9900 }
ecl_ReadOperands(1);  ecl_VecB := MakeWord(OpLo[1], OpHi[1]);   { 4300:0267  GOTO at 9904 }
ecl_ReadOperands(1);  ecl_VecC := MakeWord(OpLo[1], OpHi[1]);   { 4300:027D  9908 }
ecl_ReadOperands(1);  ecl_VecD := MakeWord(OpLo[1], OpHi[1]);   { 4300:0293  990C }
ecl_ReadOperands(1);  ecl_VecE := MakeWord(OpLo[1], OpHi[1]);   { 4300:02A9  9910 }
Mem4900^[$49E6] := 1;                                           { 4300:02BF  3D-area flag on }
if g_49F8 = 0 then begin                                        { 4300:02C6  not resuming a saved game }
  for j := 1 to $20 do Mem4900^[$49FF + j] := 0;                { 4300:02CD  clears 4A00..4A1F }
  for j := 0 to 9 do Mem6B00^[$6E79 + j] := 0;                  { 4300:02F2  clears script scratch 6E79..6E82 }
end else
  g_49F8 := 0;                                                  { 4300:0319 }
```
Note: the ReadOperands calls start with `ecl_PC = 9900h` (the GOTO opcode byte), so each reads the GOTO's operand; ecl_PC ends at 9914h (unused afterwards).

### 4300:0341 LoadEclBlock (H)
`procedure LoadEclBlock(block [BP+6]: Byte)` — callers: ecl_GameLoop (2F00:3358), ecl_op20_NewEcl (2F00:0C50). Callees: FillChar, ClearMenuLine, DrawText, Str, LoadDaxRecord (0802:0716), Move, FreeMem.
```pascal
FillChar(ecl_CodeBuf^, $1E00, 0);                               { 4300:0355 }
g_557C := 0;                                                    { 4300:035A }
repeat
  ClearMenuLine;                                                    { 4300:035F  clears text row 24 (ClearGlyphRun(0, 18h, 0, 28h)) M }
  DrawText(0, $18, $0F, 'Loading...Please Wait');          { 4300:037C  print at col 0, row 24, colour 15 }
  Str(DataSet, ds);                                             { 4300:0396  DataSet = g_5376; ds: string[1] (#verify-11) }
  LoadDaxRecord('ECL' + ds, '.dax', block, size, p);            { 4300:03D3  file 'ECL'+ds+'.dax', record id = block }
until size >= 2;                                                { 4300:03D8  quirk: retries forever if the record is missing (disk prompt loop) }
Move(p^[2], ecl_CodeBuf^, size - 2);                            { 4300:03F3  first 2 bytes of the record skipped }
FreeMem(p, size);                                               { 4300:0401 }
ClearMenuLine;                                                      { 4300:0406  clear row 24 again }
```

### 4300:0411 ecl_LoadMonsterRec (H)
`procedure ecl_LoadMonsterRec(id [BP+12h]: Byte; var rec [BP+0Eh]: PChar; var items [BP+0Ah], effects [BP+6]: Pointer)` — caller: ecl_op0B_LoadMonster (2F00:04AA). Callees: GetMem, LoadMonster (LoadMonster).
```pascal
rec := nil;                                                     { 4300:041A }
GetMem(rec, $11D);                                              { 4300:0427  one TChar (285 bytes) }
LoadMonster(id, rec^);                                          { 4300:0444  LoadMonster, MONSTERS.md }
items := rec^.items;                                            { 4300:044F  TChar +C8h }
effects := rec^.effects;                                        { 4300:0469  TChar +7Fh }
```

### 4300:0482 ApproachDistance (H)
`function ApproachDistance(x [BP+0Ah], y [BP+8]: ShortInt; dir [BP+6]: Byte): Byte` — callers: ecl_op0C_SetupMonster, ecl_op24_Combat, ecl_op29_EncounterMenu (all pass party_MapX, party_MapY, party_Dir). Callees: GetWallType (GetWallType).
Number of open squares (0..2) in front of the party before a wall; 2 outside 3D areas.
```pascal
steps := 0;  blocked := false;  Result := 0;                    { 4300:0488 }
if Mem4900^[$49E6] = 0 then begin                               { 4300:0494  not a 3D area }
  Result := 2;                                                  { 4300:04A0 }
  Mem6B00^[$6DC1] := 2;                                         { 4300:04A4 }
end else
  while (steps < 2) and not blocked do                          { 4300:04B1 }
    if GetWallType(x, y, dir) = 0 then begin                    { 4300:04C9 }
      steps := steps + 1;  Result := steps;                     { 4300:04D2 }
      case dir of                                               { 4300:04DB }
        0: y := y - 1;  2: x := x + 1;  4: y := y + 1;  6: x := x - 1;
      end;
    end else
      blocked := true;                                          { 4300:0502 }
```

### 4300:0511 ShowHeadBodyPicture (M) — was `ShowHeadBodyPicture` in ecl_names.json (the asm loads a portrait: renamed)
`procedure ShowHeadBodyPicture(head [BP+8], body [BP+6]: Byte)` — callers: ShowEncounter (4300:0699), ecl_op0E_Picture (2F00:090C). Callees: LoadPortrait (load HEAD/BODY pictures into DS:6B01/6B06, data/INDEX.md), DrawPortrait.
```pascal
g_84E1 := 0;                                                    { 4300:0514 }
g_49FD := head;  g_49FE := body;                                { 4300:0519  current portrait ids }
LoadPortrait(head, body);                                          { 4300:052D  load HEAD<ds>/BODY<ds> records }
DrawPortrait(3, 3, 1);                                             { 4300:053B  draw the portrait at cell (3,3) (M) }
```
Name: M — the head/body ids come from Mem[6DE1] and the PICTURE operand; the loader is the HEAD/BODY one (INDEX.md).

### 4300:054E ShowEncounter (H)
`procedure ShowEncounter(sprite [BP+0Eh], pic [BP+0Ch], dist [BP+0Ah]: Byte; var shown [BP+6]: array[0..1] of Boolean)` — callers: ecl_op0C_SetupMonster, ecl_op0D_Approach, ecl_op29_EncounterMenu (all with `g_84C8`, enc_SpriteId g_6F81, enc_PicId g_6F82, Mem[6DC1]). Callees: RefreshView (redraw 3D view), LoadAnimation (load SPRIT/PIC record into g_6ABE), Show3DSprite Show3DSprite, DrawPictureScreenOrView (draw picture), ShowHeadBodyPicture.
`shown[0]` = 3D sprite loaded (g_84C8), `shown[1]` = close-up picture shown (g_84C9).
```pascal
if not shown[1] and shown[0] then RefreshView;                    { 4300:0554  redraw view under the old sprite }
size := dist + 1;                                               { 4300:056C }
if not shown[1] then begin                                      { 4300:0575 }
  if not shown[0] then begin                                    { 4300:057F }
    if view_AreaMap <> 0 then begin                             { 4300:0588  g_6AAC: overhead map active }
      view_AreaMap := 0;  RefreshView;                            { 4300:058F }
    end;
    LoadAnimation('SPRIT', sprite, 1, g_6ABE);                      { 4300:05B4  SPRIT<ds>.dax record sprite }
    shown[0] := true;  g_84E3 := 1;                             { 4300:05B9  g_84E3 = sprite on screen (SPRITE_OFF clears) }
  end;
  if travel_Mode = 1 then Show3DSprite(size, g_6ABE)            { 4300:05C5  g_49FA = 1: 3D movement mode }
  else Show3DSprite(2, g_6ABE);                                 { 4300:05DC }
end;
if shown[1] and (g_84EA = Mem6B00^[$6DE1]) then exit;           { 4300:05E9  same picture already up }
if dist <> 0 then exit;                                         { 4300:0606  close-up only at distance 0 }
if travel_Mode <> 1 then exit;                                  { 4300:060F }
if (g_84E9 <> 0) and (g_49F6 = 0) then exit;                    { 4300:0619  g_84E9 = inside ENCOUNTER_MENU }
g_84EA := Lo(Mem6B00^[$6DE1]);                                  { 4300:062A }
g_84E0 := 1;                                                    { 4300:0636 }
if Mem6B00^[$6DE1] = $FF then begin                             { 4300:063B  no head id: full picture }
  LoadAnimation('PIC', pic, 0, g_6ABE);                             { 4300:0663  PIC<ds>.dax record pic }
  shown[1] := true;                                             { 4300:0668 }
  DrawPictureScreenOrView(3, 3, 1, g_6AC4);                                   { 4300:0683  draw frame list g_6AC4 at (3,3) (M) }
end else begin
  ShowHeadBodyPicture(Lo(Mem6B00^[$6DE1]), pic);                { 4300:0699 }
  shown[1] := true;  g_84E1 := 0;                               { 4300:069C }
end;
```

### 4300:06AF MakeWord (H)
`function MakeWord(lo [BP+8], hi [BP+6]: Byte): Word`
```pascal
Result := hi * 256 + lo;                                        { 4300:06B5 }
```

### 4300:06D3 ecl_SixBitChar (H)
`function ecl_SixBitChar(c [BP+6]: Byte): Char` — caller: ecl_UnpackString.
```pascal
if c > $1F then Result := Chr(c)                                { 4300:06D9 }
else Result := Chr(c + $40);                                    { 4300:06E7  01..1F -> 'A'..'_' }
```

### 4300:06FB ecl_MemRegion (H)
`function ecl_MemRegion(a [BP+6]: Word): Byte` — callers: ecl_SetMem, ecl_GetMem, ecl_SetMemString, ecl_GetMemString.
```pascal
Result := 4;                                                    { 4300:0701 }
if (a >= $4900) and (a <= $4CFF) then Result := 0;              { 4300:0705 }
if (a >= $6B00) and (a <= $6EFF) then Result := 1;              { 4300:0717 }
if (a >= $9700) and (a <= $98FF) then Result := 2;              { 4300:0729 }
if (a >= $9900) and (a <= $B6FF) then Result := 3;              { 4300:073B }
```

### 4300:0756 PartyIndexOf (H)
`function PartyIndexOf(c [BP+6]: PChar): Byte` — caller: ecl_GetCharField. 0-based position of `c` in the party list; the list length if absent.
```pascal
p := PartyHead;  found := false;  n := 0;                       { 4300:075C  PartyHead = g_5D96 }
while (p <> nil) and not found do                               { 4300:0771 }
  if p = c then found := true                                   { 4300:077F }
  else begin n := n + 1;  p := p^.next end;                     { 4300:0795  TChar +104h }
Result := n;                                                    { 4300:07AD }
```

### 4300:07BC ecl_GetCharField (H)
`function ecl_GetCharField(a [BP+0Ah]: Word; var found [BP+6]: Boolean): Word` — caller: ecl_GetMem (region 1). `c` = SelectedChar^.
```pascal
found := true;                                                  { 4300:07C2 }
case a - $6B00 of                                               { 4300:07C9 }
  $018:        Result := c.con;                                 { 4300:07DA  +14h }
  $09B:        Result := c.save[1];                             { 4300:07EF  +6Eh }
  $0A0:        Result := ShortInt(c.unk_73);                    { 4300:0804  +73h, sign-extended }
  $0A5..$0AC:  Result := c.thief_skill[(a-$6B00) - $A5];        { 4300:081D  +77h..+7Eh }
  $0B8:        Result := c.npc_flags;                           { 4300:0842  +84h }
  $0BB:        Result := c.money[0];                            { 4300:0858  +88h copper }
  $0BD:        Result := c.money[1];                            { 4300:086C  +8Ah }
  $0BF:        Result := c.money[2];                            { 4300:0880  +8Ch }
  $0C1:        Result := c.money[3];                            { 4300:0894  +8Eh gold }
  $0C3:        Result := c.money[4];                            { 4300:08A8  +90h platinum }
  $0D8:        Result := ShortInt(c.alignment);                 { 4300:08BC  +A0h }
  $0F7:        Result := Word at c+$B8;                         { 4300:08D1  spell_slots tail (L) }
  $0F9:        Result := Byte at c+$BA;                         { 4300:08E5 }
  $100:        if c.active <> 0 then Result := 1 else Result := $80;      { 4300:08FB  +10Dh }
  $10C:        if (c.unk_10E = 0) and (Byte(c+$10F) <> 0) then Result := $80   { 4300:091B }
               else if c.unk_10E = 1 then Result := $81                    { 4300:093A }
               else Result := 0;                                           { 4300:094D }
  $10D:        ;                                                { 4300:095A  quirk: found stays true, Result uninitialised }
  $11B:        Result := c.move;                                { 4300:0962  +11Ch }
  $2B1, $2B4:  Result := PartyIndexOf(SelectedChar);            { 4300:0978 / 0991 }
  $2CF:        case c.cha of                                    { 4300:09AD  +15h -> reaction adjustment }
                 3: Result := 0;   4: Result := 5;   5: Result := 10;  6: Result := 15;
                 7: Result := 20;  8..12: Result := 25; 13: Result := 30; 14: Result := 35;
                 15: Result := 40; 16: Result := 50; 17: Result := 55; 18..25: Result := 60;
               end;                                             { quirk: cha < 3 or > 25 -> Result uninitialised }
  $312:        Result := DataSet;                               { 4300:0A47  g_5376 }
  $33E:        Result := Mem6B00^[$6E3E];                       { 4300:0A56  the array word itself (party count) }
else
  found := false;                                               { 4300:0A64  caller falls back to the array }
end;
```

### 4300:0A74 ecl_SetCharField (H)
`procedure ecl_SetCharField(a [BP+8], v [BP+6]: Word)` — caller: ecl_SetMem (region 1, after the array store). `c` = SelectedChar^.
```pascal
case a - $6B00 of                                               { 4300:0A7A }
  $000:        if v = 0 then g_84D3 := 1;                       { 4300:0A8B  (the name string is set by ecl_SetMemString) }
  $020..$070:  Byte(c + $17 + ((a-$6B00) - $1F)) := Lo(v);      { 4300:0AA3  c+18h..c+68h: mem_spell[] / known_spell[] }
  $0B8:        begin if v > $B2 then v := v - $32;              { 4300:0AC6 }
                     c.npc_flags := Lo(v) end;                  { 4300:0AD1 }
  $0BB:        c.money[0] := v;                                 { 4300:0AE5 }
  $0BD:        c.money[1] := v;                                 { 4300:0AF9 }
  $0BF:        c.money[2] := v;                                 { 4300:0B0D }
  $0C1:        c.money[3] := v;                                 { 4300:0B21 }
  $0C3:        c.money[4] := v;                                 { 4300:0B35 }
  $0F7:        Word at c+$B8 := v;                              { 4300:0B49 }
  $0F9:        Byte at c+$BA := Lo(v);                          { 4300:0B5D }
  $100:        begin
                 if v >= $80 then begin                         { 4300:0B71 }
                   c.active := 0;                               { 4300:0B78 }
                   if v = $87 then c.status := 7;               { 4300:0B82  Stoned }
                 end;
                 if v = 0 then g_84D2 := 1;                     { 4300:0B93 }
               end;
  $10C:        case v of                                        { 4300:0BA6 }
                 0:   begin c.unk_10E := 0; Byte(c+$10F) := 0 end;
                 $80: begin c.unk_10E := 0; Byte(c+$10F) := 1 end;
                 $81: begin c.unk_10E := 1; Byte(c+$10F) := 1 end;
               end;
  $312:        SetDataSet(Lo(v));                            { 4300:0C03  select data set / disk (M) }
  $322:        if v > $80 then LoadWallSet(v and $7F, 1);       { 4300:0C0F  LoadWallSet(id, slot): pushes v and 7Fh (0C1F), then 1 (0C23) }
  $324:        if v > $80 then LoadWallSet(v and $7F, 2);       { 4300:0C32 }
  $326:        if v > $80 then LoadWallSet(v and $7F, 3);       { 4300:0C55 }
end;
```
(`SetDataSet` is called with one byte argument; ECL_VM.md §3.1 said `(3, v)` from the decompile — the asm pushes only `v`, H.)

### 4300:0C77 ecl_SetMem (H)
`procedure ecl_SetMem(a [BP+8], v [BP+6]: Word)` — callers: most ov03 handlers. Callees: ecl_MemRegion, ecl_SetCharField.
```pascal
case ecl_MemRegion(a) of                                        { 4300:0C7D }
  0: begin
       Mem4900^[a] := v;                                        { 4300:0C8E }
       if (a = $49FD) or (a = $49FE) then g_84E8 := 1;          { 4300:0CA1  redraw request }
     end;
  1: begin
       Mem6B00^[a] := v;                                        { 4300:0CBB }
       ecl_SetCharField(a, v);                                  { 4300:0CCE }
     end;
  2: Mem9700^[a] := v;                                          { 4300:0CDF }
  3: Code[a] := Lo(v);                                          { 4300:0CF9  scripts patch their own buffer }
  4: if a < $BF68 then
       case a of                                                { 4300:0D1B }
         $00FB, $00FC, $00B1: ;                                 { read-only engine values }
         $03DE: g_84CC := v;                                    { 4300:0D38  sound selector (CALL BA03h) }
         $00B8: g_84CE := v;                                    { 4300:0D45 }
         $00B9: g_84D0 := v;                                    { 4300:0D52 }
       end
     else
       case a - $BF68 of                                        { 4300:0D5B }
         $0E3: begin g_84E6 := 1; party_MapX := Lo(v) end;      { 4300:0D6C  ECL C04B }
         $0E4: begin party_MapY := Lo(v); g_84E6 := 1 end;      { 4300:0D7F  C04C }
         $0E5: begin                                            { 4300:0D91  C04D: facing 0..3 -> 0,2,4,6 }
                 repeat
                   ok := true;
                   case v of 0: party_Dir := 0; 1: party_Dir := 2; 2: party_Dir := 4; 3: party_Dir := 6;
                   else begin ok := false; v := v - 4 end end;
                 until ok;
                 g_84E6 := 1;                                   { 4300:0DD6 }
               end;
         $0F1: begin g_6F68 := Lo(v); g_84E5 := 1 end;          { 4300:0DE2  C059 }
         $0F7: begin g_6F69 := Lo(v); g_84E5 := 1 end;          { 4300:0DF4  C05F }
         $10BA: ;                                               { 4300:0E01  D022: empty case }
       end;
end;
```

### 4300:0E0C ecl_GetMem (H)
`function ecl_GetMem(a [BP+6]: Word): Word` — callers: ecl_OperandValue, ecl_op2A_GetTable, ecl_op3C_PrintMem. Callees: ecl_MemRegion, ecl_GetCharField.
```pascal
found := false;                                                 { 4300:0E1C }
case ecl_MemRegion(a) of                                        { 4300:0E12 }
  0: Result := Mem4900^[a];                                     { 4300:0E27 }
  1: begin
       Result := ecl_GetCharField(a, found);                    { 4300:0E41 }
       if not found then Result := Mem6B00^[a];                 { 4300:0E50 }
     end;
  2: Result := Mem9700^[a];                                     { 4300:0E70 }
  3: Result := Code[a];                                         { 4300:0E8A  byte }
  4: if a < $C04B then
       case a of                                                { 4300:0EAE }
         $00B1: Result := g_6F6E;                               { 4300:0EB6 }
         $00FB: Result := g_6F6A;                               { 4300:0EC3 }
         $00FC: Result := g_6F6C;                               { 4300:0ED0 }
         $033D: Result := party_Dir;                            { 4300:0EDD  0/2/4/6 }
         $035F: ;                                               { 4300:0EE7  quirk: empty case, Result uninitialised }
       end
     else
       case a - $C04B of                                        { 4300:0EEE }
         0:  Result := ShortInt(party_MapX);                    { 4300:0EFF  sign-extended }
         1:  Result := ShortInt(party_MapY);                    { 4300:0F0D }
         2:  Result := party_Dir shr 1;                         { 4300:0F1B  0..3 }
         3:  Result := party_Ahead;                             { 4300:0F2C  g_6AB0 wall type ahead }
         4:  Result := party_CellAttr;                          { 4300:0F3B  g_6AB1 }
         $E: ;                                                  { 4300:0F45  C059: empty case }
       end;
end;                                                            { unlisted region-4 addresses: Result uninitialised (quirk) }
```

Open unknowns (part D): roles of g_6F68/g_6F69 (written via C059/C05F, init 41h/09h), g_6F6A/6F6C/6F6E (read via 00FB/00FC/00B1), g_84CE/g_84D0 (00B8/00B9), g_70C6, g_557C; TChar +B8h/+BAh/+10Fh meanings; DrawPortrait/DrawPictureScreenOrView argument meanings (draw at (3,3), M); SetDataSet exact role (data-set switch, M).

## ov07 (4300) part E — 4300:0F53 .. 4300:2215 (string memory, menus, compare, gosub, CALL helpers, ROB/DAMAGE helpers, IF skip)

Conventions as VIEW.pas.md: Pascal-order signatures (first parameter = highest BP offset), `{ seg:off }` = first
instruction of the statement. `Mem…`, `CodeBuf`, `Str[k]` (= `DS:6FC8 + k*100h`), `OpType/OpLo/OpHi`, flags: ECL_VM.md.
TChar fields by SAVES.md names (`name +00h`, `move +11Ch`, `hp +11Bh`, `status +10Ch`, `active +10Dh`, `next +104h`,
`items +C8h`, `effects +7Fh`, `money[0..6] +88h..+94h`, `npc_flags +84h`, `party_slot +BFh`); item fields
(`next +2Ah`, `weight +37h`). Runtime: `0AF8:*` = Turbo Pascal System (RT_LEDGER).

### 4300:0F53 ecl_SetMemString (H)
`procedure ecl_SetMemString(addr [BP+0Ah]: Word; const s [BP+6]: String)` (retf 6) — callers: ecl_op09_Save
(2F00:02D7), ecl_op10_InputString (2F00:0A00). Callees: ecl_MemRegion.
Stores `s` as a 0-terminated string, one character per word (regions 0..2) or per byte (region 3).
```pascal
t := s;                                                   { 4300:0F5A  StrAssign(255) into local }
region := ecl_MemRegion(addr);                            { 4300:0F6E }
len := Length(t);                                         { 4300:0F79 }
if region = 0 then begin                                  { 4300:0F81 }
  last := Byte(len - 1);                                  { 4300:0F89  quirk: len = 0 gives last = 255 }
  for i := 0 to last do                                   { 4300:0F94  byte loop variable }
    Mem4900^[addr + i] := Ord(t[i+1]);                    { 4300:0FA6  word store }
  Mem4900^[addr + len] := 0;                              { 4300:0FD7 }
end
else if region = 1 then begin                             { 4300:0FF2 }
  if addr = $6B00 then                                    { 4300:0FF9 }
    SelectedChar^.name := t                               { 4300:1000  StrAssign(15): truncated to 15 chars }
  else begin
    for i := 0 to Byte(len - 1) do                        { 4300:1017 }
      Mem6B00^[addr + i] := Ord(t[i+1]);                  { 4300:1034  the char-field overlay (ecl_SetCharField) is NOT applied }
    Mem6B00^[addr + len] := 0;                            { 4300:1065 }
  end;
end
else if region = 2 then begin                             { 4300:1080 }
  for i := 0 to Byte(len - 1) do                          { 4300:1084 }
    Mem9700^[addr + i] := Ord(t[i+1]);                    { 4300:10A1 }
  Mem9700^[addr + len] := 0;                              { 4300:10D2 }
end
else if region = 3 then begin                             { 4300:10EC }
  for i := 0 to Byte(len - 1) do                          { 4300:10F0 }
    CodeBuf^[addr + i - $9900] := Ord(t[i+1]);            { 4300:110D  byte store }
  CodeBuf^[addr + len - $9900] := 0;                      { 4300:1138 }
end;                                                      { region 4: nothing }
```
Quirk (H, bytes 0F89..0F9A): for an empty string `last = Byte(0-1) = 255`, so 256 characters of the (uninitialised
tail of the) local buffer are written before the terminator at `addr+0`; the terminator then overwrites only the
first one. Scripts never store empty strings (INPUT_STRING replaces '' by ' ').

### 4300:1153 ecl_UnpackString (H)
`procedure ecl_UnpackString(len [BP+8], slot [BP+6]: Byte)` (retf 4) — caller: ecl_ReadOperands (4300:00BC).
Reads `len` packed bytes after `ecl_PC` (advancing it) and appends the decoded characters to `Str[slot]`.
```pascal
Str[slot] := '';                                          { 4300:115A }
n := 0;                                                   { 4300:116A  bytes consumed }
phase := 1;                                               { 4300:116E }
while n < len do begin                                    { 4300:1172 }
  if phase < 4 then begin                                 { 4300:117D }
    Inc(ecl_PC);                                          { 4300:1183 }
    prev := cur;                                          { 4300:1187 }
    cur := CodeBuf^[ecl_PC - $9900];                      { 4300:118D }
    Inc(n);                                               { 4300:119E }
  end;
  case phase of
    1: c := cur shr 2;                                    { 4300:11A8 }
    2: c := Byte((prev shl 6) + (cur shr 2)) shr 2;       { 4300:11BB  = (prev and 3) shl 4 or cur shr 4 }
    3: c := Byte((prev shl 4) + (cur shr 4)) shr 2;       { 4300:11E9  = (prev and 0Fh) shl 2 or cur shr 6 }
    4: c := cur and $3F;                                  { 4300:1217 }
  end;
  if phase < 4 then Inc(phase) else phase := 1;           { 4300:121F }
  if c <> 0 then                                          { 4300:122E }
    Str[slot] := Str[slot] + ecl_SixBitChar(c);           { 4300:1234  StrCopy/CharToStr/StrAppend/StrAssign(255) }
end;
if phase = 4 then begin                                   { 4300:128C  last group ended after its 3rd byte }
  c := cur and $3F;                                       { 4300:1292 }
  if c <> 0 then Str[slot] := Str[slot] + ecl_SixBitChar(c);   { 4300:129A }
end;
```

### 4300:12FB ecl_GetMemString (H)
`procedure ecl_GetMemString(slot [BP+8]: Byte; addr [BP+6]: Word)` (retf 4) — caller: ecl_ReadOperands (4300:011E, operand type 81h).
```pascal
region := ecl_MemRegion(addr);                            { 4300:1302 }
Str[slot] := '';                                          { 4300:130C }
i := 0;                                                   { 4300:131C  byte }
if region = 0 then                                        { 4300:1320 }
  while Mem4900^[addr + i] <> 0 do begin                  { 4300:1327 }
    Str[slot] := Str[slot] + Chr(Lo(Mem4900^[addr + i])); { 4300:133F }
    Inc(i);                                               { 4300:139B }
  end
else if region = 1 then begin                             { 4300:13A3 }
  if addr = $6B00 then
    Str[slot] := SelectedChar^.name                       { 4300:13B1 }
  else
    while Mem6B00^[addr + i] <> 0 do begin                { 4300:13D3  plain array, no char-field overlay }
      Str[slot] := Str[slot] + Chr(Lo(Mem6B00^[addr + i]));   { 4300:13EB }
      Inc(i);                                             { 4300:1447 }
    end;
end
else if region = 2 then                                   { 4300:144F }
  while Mem9700^[addr + i] <> 0 do begin                  { 4300:1453 }
    Str[slot] := Str[slot] + Chr(Lo(Mem9700^[addr + i])); { 4300:146B }
    Inc(i);                                               { 4300:14C7 }
  end
else if region = 3 then                                   { 4300:14CE }
  while CodeBuf^[addr + i - $9900] <> 0 do begin          { 4300:14D2 }
    Str[slot] := Str[slot] + Chr(CodeBuf^[addr + i - $9900]); { 4300:14E8 }
    Inc(i);                                               { 4300:1542 }
  end;                                                    { region 4: Str[slot] stays '' }
```
Quirk: `i` is a byte; a string without terminator in the first 256 entries loops (the index wraps; the slot is
capped at 255 chars by StrAssign). (H, `INC byte [bp-2]`.)

### 4300:156D MenuHotkeys (H)
`procedure MenuHotkeys(var s [BP+0Ah]: String; var keys [BP+6]: String[40])` (retf 8) — callers: MenuSelect (4300:16BF), VerticalListMenu (4300:17C3).
Converts a `~`-marked menu string for display and collects its hotkeys. Set constant at CS:154D (32 bytes
`.. 06: FF 03 FE FF FF 07 ..`) = `['0'..'9', 'A'..'Z']` (H, bit decode).
```pascal
keys := '';                                               { 4300:1574 }
n := Length(s);                                           { 4300:157B  length taken once }
for i := 1 to n do begin                                  { 4300:1584 }
  if s[i] in ['0'..'9', 'A'..'Z'] then                    { 4300:1596  System.@SetIn }
    s[i] := Chr(Ord(s[i]) + $20);                         { 4300:15B0  to lower case; quirk: also maps '0'..'9' to 'P'..'Y' (#verify-12) }
  if s[i] = '~' then begin                                { 4300:15D1 }
    Delete(s, i, 1);                                      { 4300:15E1 }
    s[i] := UpCase(s[i]);                                 { 4300:15F5  the hotkey letter stays upper case }
    keys := keys + s[i];                                  { 4300:1617  StrAssign(40) }
  end;
end;
```
Quirks (H): digits are "lower-cased" too (`'0'+20h = 'P'`), so a digit not preceded by `~` turns into P..Y on
screen; the loop bound is the original length, so after each `Delete` the last iterations read past the new end
(harmless: bytes beyond are not in the set and not `~` unless stale). The hotkey letter after `~` is not lowered
because the `in`-test ran on the `~` itself and `i` then advances past the letter.

### 4300:1684 MenuSelect (H)
`function MenuSelect(const title [BP+14h]: String[40]; const items [BP+10h]: String; c0E [BP+0Eh], c0C [BP+0Ch],
c0A [BP+0Ah]: Byte; acceptEnter [BP+8]: Boolean; animate [BP+6]: Byte): Byte` (retf 12h) — callers:
ecl_op2B_HorizontalMenu, ecl_op29_EncounterMenu, ecl_op2C_Parlay, and (via stub) ov04, ov05, ov06.
Callees: MenuHotkeys, HorizontalMenu (horizontal menu input engine: shows `title` on row 18h in colour c0E, the items
with highlight, keys `,`/`.` move the highlight, Esc, Enter (only if c0C or c0A ≠ 0), letters; animates picture
frames while waiting when `animate` ≠ 0; returns the key, `special` := 1 for an extended key) — M for the ov25 roles.
```pascal
t := title;                                               { 4300:168B }
m := items;                                               { 4300:169E }
MenuHotkeys(m, keys);                                     { 4300:16B2 }
repeat
  key := HorizontalMenu(t, m, c0E, c0C, c0A, 1, animate, special);   { 4300:16C2 }
  if special then begin                                   { 4300:16EF }
    CycleSelectedChar(key);                                       { 4300:16F6  extended-key command (character screens; M) }
    DrawPartyRoster(SelectedChar);                          { 4300:1700  redraw the character summary }
    key := 0;                                             { 4300:170D }
  end;
until (key in ['0'..'9', 'A'..'Z']) or ((key = 13) and acceptEnter);   { 4300:1712 / 1723 / 172A }
if key = 13 then MenuSelect := 0                          { 4300:1730 }
else begin
  k := 1;                                                 { 4300:173E }
  while (k <= Length(keys)) and (keys[k] <> Chr(key)) do Inc(k);   { 4300:1743 }
  if k <= Length(keys) then MenuSelect := k - 1           { 4300:1765  0-based index }
  else MenuSelect := $FF;                                 { 4300:177B }
end;
```
Quirk (H): any letter or digit ends the loop, also one that is not a hotkey of this menu → result 0FFh. Callers
use the result as an array index without a range check (ENCOUNTER_MENU `react[k]`, PARLAY `resp[k]` → value from
beyond the local array; L for the visible effect). Enter maps to item 0. Esc (key 0) never ends the menu.

### 4300:1788 EclVerticalListMenu (M)
`procedure EclVerticalListMenu(const title [BP+2Ah]: String[40]; const keys0 [BP+26h]: String; c24 [BP+24h], c22
[BP+22h], c20 [BP+20h], x1 [BP+1Eh], y1 [BP+1Ch], x2 [BP+1Ah], y2 [BP+18h]: Byte; list [BP+14h]: Pointer;
b12 [BP+12h]: Byte; var p0E [BP+0Eh]; var index [BP+0Ah]: Word; var cur [BP+6]: Pointer)` (retf 28h) — caller
ecl_op15_VerticalMenu (2F00:1053, args `('', '', 0Dh, 0Ah, 0Fh, 1, row+1, 26h, 16h, list, 0, @b, @index, @cur)`).
A thin wrapper around VerticalListMenu (scrolling vertical list picker, VIEW/ENGINE area; M).
```pascal
t := title;                                               { 4300:178F }
m := keys0;                                               { 4300:17A2 }
MenuHotkeys(m, keys);                                     { 4300:17B6  result unused below except via m }
r := VerticalListMenu(t, m, c24, c22, c20, x1, y1, x2, y2, list, b12, p0E, index, cur);   { 4300:17C6 }
{ 4300:180B: the function result is stored into a dead local; the selection is returned through index / cur }
```
Names of the byte parameters: colours 0Dh/0Ah/0Fh as at MenuSelect (M), window (x1,y1)-(x2,y2) = (1, row+1)-(26h,16h) (M).

### 4300:1815 ecl_CompareStrings (H)
`procedure ecl_CompareStrings(const a [BP+0Ah], b [BP+6]: String)` (retf 8) — caller: ecl_op03_Compare (2F00:0177).
```pascal
sa := a;  sb := b;                                        { 4300:181C / 1830  StrAssign(255) }
FillChar(ecl_FlagEQ, 6, 0);                               { 4300:1844 }
if sa = sb then ecl_FlagEQ := 1;                          { 4300:1855  @StrCompare(sa, sb) }
if sa <> sb then ecl_FlagNE := 1;                         { 4300:186D }
if sa < sb then ecl_FlagLT := 1;                          { 4300:1885 }
if sa > sb then ecl_FlagGT := 1;                          { 4300:189D }
if sa <= sb then ecl_FlagLE := 1;                         { 4300:18B5 }
if sa >= sb then ecl_FlagGE := 1;                         { 4300:18CD }
```

### 4300:18EB ecl_CompareWords (H)
`procedure ecl_CompareWords(a [BP+8], b [BP+6]: Word)` (retf 4) — callers: ecl_op03_Compare (2F00:019A), ecl_op2F_AndOr (2F00:0E47, `(0, r)`: pushes 0 then r, #verify-10).
```pascal
FillChar(ecl_FlagEQ, 6, 0);                               { 4300:18EE }
if a = b then ecl_FlagEQ := 1;                            { 4300:18FF }
if a <> b then ecl_FlagNE := 1;                           { 4300:190C }
if a < b then ecl_FlagLT := 1;                            { 4300:1919  unsigned (JAE) }
if a > b then ecl_FlagGT := 1;                            { 4300:1926 }
if a <= b then ecl_FlagLE := 1;                           { 4300:1933 }
if a >= b then ecl_FlagGE := 1;                           { 4300:1940 }
```

### 4300:1951 ecl_Gosub (H)
`procedure ecl_Gosub(i [BP+6]: Byte)` (retf 2) — callers: ecl_op02_Gosub (2F00:011F), ecl_op25_OnGotoGosub (ON_GOSUB).
Gosub stack = singly linked list of 6-byte heap nodes `record ret: Word; next: Pointer end`, top in `ecl_GosubSP` (DS:6F70).
```pascal
if ecl_GosubSP = nil then begin                           { 4300:1954 }
  ecl_GosubSP := GetMem(6);                               { 4300:195D }
  ecl_GosubSP^.next := nil;                               { 4300:196D }
end else begin
  g_6F74 := ecl_GosubSP;                                  { 4300:197D  temp }
  ecl_GosubSP := GetMem(6);                               { 4300:198B }
  ecl_GosubSP^.next := g_6F74;                            { 4300:199B }
end;
ecl_GosubSP^.ret := ecl_PC;                               { 4300:19AE  PC already points past the operands }
ecl_PC := MakeWord(OpLo[i], OpHi[i]);                     { 4300:19B8  = OpHi[i]*256 + OpLo[i] }
```

### 4300:19DB StepForward (H)
`procedure StepForward` — caller: ecl_op2D_Call (target C01Eh). Callees: GetCellAttr, GetWallType (ov29, VIEW.pas.md).
```pascal
case party_Dir of                                         { 4300:19DE }
  0: if party_MapY > 0 then Dec(party_MapY) else party_MapY := 15;    { 4300:19E5  signed compare }
  2: if party_MapX < 15 then Inc(party_MapX) else party_MapX := 0;    { 4300:19FD }
  4: if party_MapY < 15 then Inc(party_MapY) else party_MapY := 0;    { 4300:1A15 }
  6: if party_MapX > 0 then Dec(party_MapX) else party_MapX := 15;    { 4300:1A2D }
end;                                                      { odd directions: no move }
party_CellAttr := GetCellAttr(party_MapX, party_MapY);    { 4300:1A3F  DS:6AB1 }
party_Ahead := GetWallType(party_MapX, party_MapY, party_Dir);        { 4300:1A4F  DS:6AB0 }
```

### 4300:1A6F SetupDuel (M) — was SetupDuel
`procedure SetupDuel(withOpponent [BP+6]: ShortInt)` (retf 2) — caller: ecl_op2D_Call (CALL 8000h → 1, CALL 8001h → 0).
Name evidence (M): string constants `'CPIC'` (CS:1A65) and `'ROLF'` (CS:1A6A); sets `g_84D4 := 1`, the flag that makes
COMBAT (2F00:179B) take the monster branch with no monsters loaded; the combat overlay ov05 holds "You have won the
duel." / "You have lost the duel.". The routine leaves only the selected character active and appends a copy of him
named ROLF as the opponent.
```pascal
g_84D4 := 1;                                              { 4300:1A75 }
Mem6B00^[$6DE6] := withOpponent;                          { 4300:1A7A  (+5CCh, sign-extended) }
me := SelectedChar;                                       { 4300:1A87 }
c := PartyHead;                                           { 4300:1A94 }
while c <> nil do begin                                   { 4300:1AA1 }
  if c^.name <> me^.name then c^.active := 0;             { 4300:1AA9  @StrCompare on the records (name is the first field) }
  c := c^.next;                                           { 4300:1AC3 }
end;
if withOpponent <> 0 then begin                           { 4300:1AD8 }
  LoadCombatIcon('CPIC', $0B, g_6F83);                         { 4300:1AE1  load CPIC record 0Bh as combat icon into slot g_6F83 (same call shape as LOAD_MONSTER; M) }
  c := PartyHead;                                         { 4300:1AFC }
  while c^.next <> nil do c := c^.next;                   { 4300:1B09  last list entry }
  r := GetMem(SizeOf(TChar));                             { 4300:1B2D  11Dh }
  r^ := me^;                                              { 4300:1B3C  CopyBytes 11Dh }
  r^.active := 1;                                         { 4300:1B4F }
  r^.next := nil;                                         { 4300:1B58 }
  r^.name := 'ROLF';                                      { 4300:1B67 }
  r^.unk_10F := 1;                                        { 4300:1B7A }
  r^.unk_10E := 1;                                        { 4300:1B83  enemy side (cf. ECL var 6C0C = 81h) }
  r^.npc_flags := $B2;                                    { 4300:1B8C }
  r^.party_slot := g_6F83;                                { 4300:1B95  icon slot }
  r^.effects := nil;                                      { 4300:1BA0 }
  r^.items := nil;                                        { 4300:1BAE }
  c^.next := r;                                           { 4300:1BBD }
  c := c^.next;                                           { 4300:1BD0 }
  it := me^.items;                                        { 4300:1BE3 }
  while it <> nil do begin                                { 4300:1BF6  copy the item list }
    if c^.items = nil then begin                          { 4300:1C01 }
      c^.items := GetMem(3Fh);                            { 4300:1C10 }
      c^.items^ := it^;                                   { 4300:1C26 }
      c^.items^.next := nil;                              { 4300:1C3E }
    end else begin
      old := c^.items;                                    { 4300:1C52 }
      c^.items := GetMem(3Fh);                            { 4300:1C65 }
      c^.items^ := it^;                                   { 4300:1C7B }
      c^.items^.next := old;                              { 4300:1C93  prepend: the copy is in reverse order }
    end;
    it := it^.next;                                       { 4300:1CA9 }
  end;
end;
```
Quirks: characters with the same name as the selected one also stay active; the copied items keep their `readied`
flags but in reverse order; `g_6F83` is not incremented here (unlike LOAD_MONSTER).

### 4300:1CC3 ScaleMoney (H)
`procedure ScaleMoney(f [BP+0Ah]: Real; c [BP+6]: PChar)` (retf 0Ah) — caller: ecl_op28_Rob (2F00:1E1F and the party loop).
```pascal
c^.money[0] := Trunc(c^.money[0] * f);                    { 4300:1CC6  +88h copper; word -> LongToReal, RealMul, Trunc }
c^.money[1] := Trunc(c^.money[1] * f);                    { 4300:1CF0  +8Ah }
c^.money[2] := Trunc(c^.money[2] * f);                    { +8Ch }
c^.money[3] := Trunc(c^.money[3] * f);                    { +8Eh }
c^.money[4] := Trunc(c^.money[4] * f);                    { +90h }
c^.money[5] := Trunc(c^.money[5] * f);                    { +92h gems }
c^.money[6] := Trunc(c^.money[6] * f);                    { 4300:1DE4  +94h jewelry }
```

### 4300:1DF0 LoseItemsChance (H)
`procedure LoseItemsChance(p [BP+0Ah]: Byte; c [BP+6]: PChar)` (retf 6) — caller ecl_op28_Rob (p = ROB operand 2).
```pascal
it := c^.items;                                           { 4300:1DF6 }
while it <> nil do begin                                  { 4300:1E09 }
  if it^.weight > $FF then                                { 4300:1E14 }
    if p > $5A then p := p - $5A else p := 0              { 4300:1E1F }
  else if it^.weight > $18 then                           { 4300:1E38 }
    if p > $32 then p := p - $32 else p := 0;             { 4300:1E42 }
  r := Roll(1, 100);                                      { 4300:1E59  ov24 0DE3, 1d100 }
  nxt := it^.next;                                        { 4300:1E67 }
  if r <= p then LoseItem(c, it);                    { 4300:1E78  LoseItem (strings "Tried to Lose item & couldn't find it!") }
  it := nxt;                                              { 4300:1E91 }
end;
```
Quirk (H): `p` is the parameter itself and is reduced cumulatively, so after the first heavy item every later item
has a smaller chance.

### 4300:1EA6 ecl_SkipInstruction (H)
`procedure ecl_SkipInstruction` — caller: ecl_op16_If (6 sites, 2F00:0B67..0BC1).
```pascal
ecl_CurOp := CodeBuf^[ecl_PC - $9900];                    { 4300:1EA9  quirk: overwrites CurOp (LastOp keeps the IF) }
case ecl_CurOp of                                         { 4300:1EBA }
  $01, $02, $0A, $0E, $11, $12, $1D, $20, $2D, $32, $34, $36, $38, $39, $3C:
    ecl_ReadOperands(1);                                  { 4300:1EF9 }
  $03, $08, $09, $0C, $0F, $10, $1F, $22:
    ecl_ReadOperands(2);                                  { 4300:1F23 }
  $04..$07, $0B, $21, $28, $2A, $2F, $30, $35, $37, $3B:
    ecl_ReadOperands(3);                                  { 4300:1F59 }
  $14, $23: ecl_ReadOperands(4);                          { 4300:1F6A }
  $2E: ecl_ReadOperands(5);                               { 4300:1F77 }
  $1E, $2C: ecl_ReadOperands(6);                          { 4300:1F88 }
  $27: ecl_ReadOperands(8);                               { 4300:1F95 }
  $29: ecl_ReadOperands(14);                              { 4300:1FA2 }
else
  Inc(ecl_PC);                                            { 4300:1FAB  incl. 15h, 25h, 26h, 2Bh (variable length) }
end;
```
Mismatches with the handlers (0Ch, 36h, 15h/25h/26h/2Bh): ECL_VM.md §2.4. Side effect: string operands of the
skipped instruction are unpacked into `Str[1..]`.

### 4300:1FB1 PartyMoveRange (H)
`procedure PartyMoveRange(var maxMove [BP+0Ah], minMove [BP+6]: Byte)` (retf 8) — caller ecl_op29_EncounterMenu
(2F00:1EF8; called as `PartyMoveRange(local_40C, local_40D)`, i.e. local_40C = max, local_40D = min).
```pascal
c := PartyHead;                                           { 4300:1FB7 }
maxMove := c^.move;                                       { 4300:1FC4  quirk: dereferenced before the nil test }
minMove := c^.move;                                       { 4300:1FD2 }
while c <> nil do begin                                   { 4300:1FE0 }
  m := c^.move;                                           { 4300:1FEB  +11Ch }
  if HasEffect(c, $27, e) then m := Byte(m * 2)       { 4300:1FF6  HasEffect(c, 27h): doubled (SHL) }
  else if HasEffect(c, $2A, e) then m := m div 2;     { 4300:2019  HasEffect(c, 2Ah): halved (SHR) }
  if m > maxMove then maxMove := m;                       { 4300:203A }
  if m < minMove then minMove := m;                       { 4300:204E }
  c := c^.next;                                           { 4300:2062 }
end;
```
Note: the walk includes loaded monsters (they are appended to the same list by LOAD_MONSTER). SAVES.md says 27h
halves and 2Ah doubles the displayed movement; here 27h doubles and 2Ah halves (H from `SHL`/`SHR` at 2012/2035)
— the two code sites disagree or SAVES.md has them swapped; flag for the SAVES/COMBAT owners.

### 4300:20CC ApplyEclDamage (H)
`procedure ApplyEclDamage(dmg [BP+0Ah]: Word; c [BP+6]: PChar)` (retf 6) — caller ecl_op2E_Damage (2F00:2775, several sites).
Strings (CS, H): 207E `'  '` (2 spaces), 2081 `' dies. '`, 2089 `' is hit FOR '`, 2096 `' points of Damage.'`,
20A9 `'press <enter>/<return> to continue'`.
```pascal
if c^.status = 6 then exit;                               { 4300:20D3  Dead: nothing }
clear := 0;                                               { 4300:20E1 }
num := Str(dmg);                                          { 4300:20E6  @StrLong width 0 into string[3] (pushes width 0, maxlen 3) }
if c^.hp + 10 < dmg then                                  { 4300:20FF }
  s := '  ' + c^.name + ' dies. '                         { 4300:2111 }
else
  s := '  ' + c^.name + ' is hit FOR ' + num + ' points of Damage.';   { 4300:2146 }
if g_5E25 > $16 then begin                                { 4300:218E  text row past the window }
  g_5E25 := $11;                                          { 4300:2195 }
  clear := 1;                                             { 4300:219A }
  ShowBottomPromptAndReadKey($0F, 'press <enter>/<return> to continue');   { 4300:219F  prompt + wait key (ENGINE; M) }
end else clear := 0;                                      { 4300:21B9 }
g_5E24 := $26;                                            { 4300:21BE  text column 38 }
DrawWrappedText(1, $11, $26, $16, $0F, clear, s);           { 4300:21C3  print into text window rows 17..22, colour 0Fh }
ApplyDamage(c, Lo(dmg));                                { 4300:21E2  subtract HP / set status (ENGINE; M) }
ClearTextRectangle($11, 1, $26, $0F);                          { 4300:21F1  clear the roster area cols 17..38, rows 1..15 (M) }
DrawPartyRoster(SelectedChar);                              { 4300:2202  redraw the party roster }
```
The "dies" test is `dmg > hp + 10` (the AD&D −10 HP death rule) and only selects the text; the real HP change is in
ApplyDamage with the damage truncated to a byte (`MOV AL,[bp+0Ah]`, H).

### 4300:2215 ov07_init (H)
`procedure ov07_init` — unit initialisation (overlay entry 0), called from the main program init chain.
```pascal
{ empty: push bp / mov bp,sp / pop bp / retf }            { 4300:2215 }
```

#### ov07 data inside the code segment (not routines)
| range | content |
|---|---|
| 4300:0322..0340 | strings "Loading...Please Wait", "ECL", ".dax" |
| 4300:0544..054D | strings "SPRIT", "PIC" |
| 4300:154D..156C | set constant `['0'..'9','A'..'Z']` (MenuHotkeys) |
| 4300:1664..1683 | the same set constant (MenuSelect) |
| 4300:1A65..1A6E | strings "CPIC", "ROLF" |
| 4300:207E..20CB | strings "  ", " dies. ", " is hit FOR ", " points of Damage.", "press <enter>/<return> to continue" |
(table from the independent second decode `combat_parts/ov07.pas.md`; added by por-crossref)

---

## Unknowns (explicit, collected from all parts)
- Foreign callees with M/L roles: AfterCombat (after-combat/treasure), CombatMain (combat), Shop (shop), Temple (temple), MakeTreasureItem (make item), NewMenuList/11F3 (list allocate/free), HorizontalMenu/0D9A (menu drawing; meaning of the colour byte arguments), AttackRollVsAC/0D63 (target / saving-throw checks), AddNpcToParty (load NPC), CheckEclDisk (disk check), PartyCreationMenu, RemoveFromParty, DragonFinale/06B3, Camp (camp), LoadAnimation/0000/0697, Load24x24Set, SetDataSet, ApplyDamage, ShowBottomPromptAndReadKey.
- Globals without a role: g_6F6A/6F6C/6F6E, g_84CE/84D0, g_70C6, g_557C, g_547C (data path? M); TChar +B8h/+BAh/+10Fh.
- Effect ids 27h/2Ah: the bytes of PartyMoveRange (4300:2012/2035) show 27h doubling and 2Ah halving movement, the reverse of the SAVES.md note — for the SAVES/COMBAT owners.

## Self-check
Each part re-read ~10% of its statements against the bytes (`hdis.py`):

| part | range | checked | OK | fixed |
|---|---|---|---|---|
| A | ov03 0000..0E5D | 19 | 14 | 5 (incl. AND/OR compare order, PICTURE FFh condition, RemoveFromParty order) |
| B | ov03 0E5E..1EF7 | 12 | 11 | 1 (NewMenuList argument order) |
| C | ov03 1EF8..end | 28 | 26 | 2 |
| D | ov07 0000..0F52 | 16 | 15 | 1 (ecl_UnpackString argument order) |
| E | ov07 0F53..end | 16 | 15 | 1 (CPIC call argument order) |

Merge-level sample (lane, 10 random statements of the merged file, seed 16, against the bytes):

| statement | address | result |
|---|---|---|
| `if d < Mem[$6DC1] then Mem[$6DC1] := d` (COMBAT clamp) | 2f00:180d | OK (ApproachDistance result in [bp-2], compared with +582h) |
| `0: begin k := 1;` (EncounterMenu text fallback) | 2f00:2081 | OK (`MOV byte [bp-43Bh],1` after `CMP +582h,0`) |
| `if minMove >= fleeLimit then ecl_SetMem(dest, 2)` | 2f00:222f | OK (`CMP [bp-40Bh],[bp-407h]; JB` else SetMem(…,2)) |
| `menu := Copy(menu + '~' + Str[i] + ' ', 1, 50)` | 2f00:1187 | OK (StrCopy, `cs:"~"`, slot, `" "`, StrAssign 32h) |
| `r3 := Roll(1, 10)` | 2f00:1bbf | OK (push 1, push 0Ah, CALLF Roll) |
| `WallSlotId[i] := $FFFF` | 2f00:0d97 | OK (`MOV word [di+6AAEh],FFFFh`, di = i*4) |
| `for k := 1 to n do begin` (Treasure random items) | 2f00:1b51 | OK |
| `g_84E9 := 1` | 2f00:1eff | OK (`C6 06 E9 84 01`) |
| `SelectedChar := g_4436` | 2f00:006d | OK |
| `end else done := true` (PrintMem loop end) | 2f00:2f1b | OK (loop exit, then `INC text_Row` 2F25) |

Result: 10/10. All 89 routines of ov03 (56) and ov07 (33) are present (`grep -c '^### '`).
