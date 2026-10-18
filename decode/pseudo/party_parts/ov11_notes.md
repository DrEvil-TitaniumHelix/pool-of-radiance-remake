# ov11 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 5700:002D | InitGameState | M | first call of the program body (0000:00fd); GetMem of every engine buffer, resets ~50 state globals, loads font/8x8 202,203/SQRPACI/COMSPR/ITEMS, Randomize, spell + ov12 handler tables. Behaviour H, original name unknown |
| 5700:0615 | ov11_init | H | empty unit init |

Counts: 2/2; H 1, M 1.

## (b) Globals named (new; requested for GLOBALS.md)

| DS | name | conf | evidence |
|---|---|---|---|
| 465C | InitIdx | H | only users ov11; loop variable of all six loops in InitGameState |
| 4660 | ItemsFound | M | `:= OpenWithPrompt(...)` at 5700:05a6, never read |
| 4661 | SavedDataPath | H | `:= DataPath` (max 40) at 5700:0477, `DataPath :=` it at 5700:05f8 |
| 468C | ItemsFile | H | untyped file var passed to OpenWithPrompt / Reset / Seek / BlockRead / Close for 'ITEMS' |
| 5582 | ItemTypeTable | H | BlockRead target of ITEMS after Seek(2) (ITEMS.md: 128 types × 16 bytes); readers in 00BA/ov09/ov19/ov22 |
| 5E1E | ItemsReadCount | H | BlockRead result var |
| 2614 | DiskPromptText | H | `array[0..9] of string[29]`; image bytes: 'Insert disk 1..8 in drive '; indexed by DataSet*1Eh |
| 5E4E | SymbolPic | M | AllocPicture(8,1,1,0) 8×8 one-frame picture; only other user Put8x8Symbol (ov34) |
| 5E52 | TileSetLo (+ TileSetHi 5E56, view_names.json) | M | `array[0..1] of PPicture` (5E52, 5E56) = SQRPACI records 1 and 2 (combat_parts/ov18 recolours them) |

Used with existing lane names (listing): ecl_Mem4900/6B00/9700, ecl_CodeBuf, FontPtr, WallBuf, MapBuf, PicSaveBuffer,
view_LineDirty/SpanScreenX/SpanFirst/SpanLast, cga_LineSeg, ega_LineOfs, m2_LineSeg, SymbolSets, CombatIcons, enc_Anim,
TreasureItems, party_MapX/Y/Dir, door_CanBash, opt_Portraits, opt_MonsterPics, DebugFlag, TextOutputActive, PartyHead,
SelectedChar, ecl_PC, GameSpeed, DataSet, PrevDataSet, view_AreaMap, travel_Mode, menu_Top, DuelActive, PartyDead, ClipPictures,
enc_SpriteOnScreen, NoDiskPrompt, enc_MenuActive, SoundTransientMode, DataPath.

## (c) Unknowns
- Meaning of the defaults: g_49F8, g_49FB, g_49F4, g_547A, g_5378, g_49F9, g_6DDC, g_6DDA, g_84DD..g_84E0, g_6B0A, g_6B1C (FFh),
  g_557D, g_6F68 (DBh) / g_6F69 (E8h), ecl_Mem6B00^ word 67Ch — owners ECL/VIEW/COMBAT; values here are H.
- g_4A20 dimensions (168 lines × 21 cells) suggest the 3D-view/screen work picture; VIEW owns the name.
- Wall-set slot table interpretation (6AAE + slot*4: id word, slot word) follows VIEW LoadWallSet; slot 1 = (0, 1), slots 2/3 = FFFFh (M).
- Start position (15, 1, facing 6 = W) is overwritten by ECL/LoadGame later (M).

## (d) Self-check
Statements: ~95. Re-checked 14 (15 %):
- AllocPicture($A8,$15,1,0,g_4A20) — pushes A8h, 15h, 1, 0, DS:4A20 (5700:00bc..00ce) — OK (ENGINE: height first).
- FillChar(view_SpanFirst,$150,$FF) — pushes DS:4C20, 150h, FFh — OK.
- cga odd/even — SHR AL,1; JNC → even branch at 0165 uses B800h; odd uses BA00h — OK.
- ega_LineOfs[i] := i*40 — MUL 28h — OK.
- m2_LineSeg case — IDIV 4 remainder (XCHG AX,DX) 0/1/2/3 → B800/BA00/BC00/BE00 + (i shr 2)*0Ah — OK.
- loop end — CMP [465C],C7h; JZ exit; JMP INC — OK (0..199).
- portrait slots — [i*5+6AFB] := FFh; words [i*5+6AFC],[i*5+6AFE] := 0, i = 1..2 — OK.
- party start — 6AAD := 0Fh, 6AAE := 1, 6AAF := 6 — OK.
- wall slots — for i = 2..3: [i*4+6AAE], [i*4+6AB0] := FFFFh — OK.
- SavedDataPath := DataPath — pushes DS:547C, DS:4661, 28h; restore pushes 4661, 547C, FFh — OK (dest = 2nd, max = dest size).
- DrawText(0,24,$0A,'Loading...') — pushes 0, 18h, 0Ah, string — OK.
- Load8x8Set($CA,4) — pushes CAh then 4 (id [BP+8] first) — OK.
- LoadCombatIcon('COMSPR', i, i+13) — string, [465C], [465C]+0Dh — OK (VIEW: name, id, slot).
- OpenWithPrompt('ITEMS', DiskPromptText[DataSet]+DataPath[1]+':', False, ItemsFile) — [BP-6]='ITEMS' first, then the concatenation (StrCopy DS:2614+DataSet*1Eh, CharToStr [547D], StrAppend cs:2B ':'), push 0, DS:468C — OK.
- BlockRead(ItemsFile, g_5582, $810, g_5E1E) — pushes 468C, 5582, 810h, 5E1E — OK.
