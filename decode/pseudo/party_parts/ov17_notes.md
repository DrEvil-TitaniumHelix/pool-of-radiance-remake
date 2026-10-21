# ov17 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 7500:0010 | ReadCharList | H | literal 'charlist.txt' (7500:0000), ReadLn of 40-char names into 46-byte TMenuItem nodes, `'* '` prefix (7500:000D) for party members |
| 7500:01B8 | WriteCharList | H | RewriteText 'charlist.txt' (7500:0197), WriteLn of every entry whose first char ≠ '*' |
| 7500:02AE | EnsureSaveDir | M | MkDir(Copy(SavePath,1,len-1)) until IOResult ∈ {0,5}, "Put save disk in" prompt |
| 7500:032F | OverlayIconPicture | M | OR of pixel bytes (+17h), AND of mask bytes (+13h^) per VideoMode; caller passes head (slot 11) as src |
| 7500:0482 | LoadCharacterIcon | H | 'CHEAD'/'CBODY' + size letter, LoadCombatIcon into slot 11 / party_slot, merge, RecolorPicture with the icon colours |
| 7500:069E | WriteCharacter | H | BlockWrite 11Dh / 3Fh / 9 to .cha|.sav / .itm / .spc (SAVES.md §1) |
| 7500:0AEC | ReadCharacter | H | BlockRead 11Dh, pointer clears, .itm/.spc list rebuild |
| 7500:0EC4 | LoadMonster | H | 'MON'+n+'CHA'/'SPC'/'ITM' '.dax', "Unable to load monster" |
| 7500:1262 | AddNpcToParty | M | only caller ECL op 36 (ecl_op36_AddNpc); LoadMonster + random portrait + AddToParty |
| 7500:1446 | AddToParty | H | appends to PartyHead list (+104h), lowest free party_slot, count +67Ch, UpdateLevelStats |
| 7500:1602 | LoadGame | H | "Load Which Game:", 'savgam'+x+'.dat', BlockRead order = SAVES.md §2 |
| 7500:1D58 | SaveGame | H | "Save Which Game:", "Saving...Please Wait", BlockWrite order = SAVES.md §2 |
| 7500:22D5 | CheckEclDisk | M | "Save and exit  Insert disk #"; caller ecl_op20_NewEcl with the new ECL file name |
| 7500:23E0 | ov17_init | H | empty unit initialiser |

Counts: 14/14 routines covered; H 10, M 4, L 0.

## (b) Globals named (ov17_names.json)

| DS | name | conf | evidence |
|---|---|---|---|
| 08C5 | IconSizeLetter | H | `[DI+8C5h]` indexed by `c.icon_size` (+C0h) and appended to 'CHEAD'/'CBODY' (7500:04BD/04FF); bytes `04 'S' 'T'`; LoadCombatIcon adds 40h for a trailing 'T' (VIEW C000:023D) |
| 08C7 | NpcHead | M | `[gender*8 + Roll(1,8) + 8C7h]` → c.head_pic (7500:1403); bytes male 1 2 3 4 5 8 11 12, female 6 7 9 10 13 14 6 7 |
| 08D7 | NpcBodyCleric | M | body_pic for class 0 (7500:1338) |
| 08E1 | NpcBodyFighter | M | body_pic for every class other than 0/5/6 (7500:13D7) |
| 08EB | NpcBodyMagicUser | M | body_pic for class 5 (7500:136F) |
| 08F5 | NpcBodyThief | M | body_pic for class 6 (7500:13A5) |
| 2614 | DiskPromptText | H | `DS:2614 + DataSet*1Eh` used as a prompt prefix (7500:0B87); image bytes: entries 1..8 = string[29] `'Insert disk n in drive '` (entry 0 is other data) |
| 3CF5 | IconColourSlot | M | `[i + 3CF5h]`, i = 1..6, selects the EGA colour pair (k, k+8) recoloured by icon colour byte i (7500:05C2); bytes 1 2 3 4 6 7; also read by ov16 CreateCharacter / 35BE |
| 537B | SaveDrive | H | `SavePath[1]` (SavePath = Pascal string at 537A); appended with ':' to "Put save disk in " (7500:021C etc.) |
| 547D | DataDrive | H | `DataPath[1]` (DataPath string at 547C); appended with ':' to DiskPromptText (7500:0BA4) |

Globals request for por-tooling (GLOBALS.md/globals.json): the ten names above (keys `0C7C:XXXX` in ov17_names.json).
Left as g_: `g_557D` (set to 1 at the end of SaveGame, 0 by ecl_CampCheck, read by HeapErrorHandler / PartyCreationMenu — "game saved since last change" is plausible but unproven, L); `g_5EB2`/`g_5EB6` = CombatIcons slot 11 pose 0/1 (not separate variables); `g_6AAE[i*4]`/`g_6AB0[i*4]` (i = 1..3, DS:6AB2..6ABC) = the wall-set slot table of LoadWallSet (VIEW owner); `g_2736`/`g_273F` = VIEW step tables dx/dy.

## (c) Unknowns / open points
- `g_557D` meaning (see above).
- TChar `+ABh` (SAVES.md unk_AB): AddNpcToParty sets it to `Random(256)` (7500:12A1); readers not located here.
- Why LoadCharacterIcon selects data set 3 (SetDataSet(3), 7500:048C) although CHEAD/CBODY names carry no set number — presumably the disk that holds CHEAD/CBODY.DAX for the disk prompt in OpenDax (M, engine).
- ReadCharacter's `inSaveDir = False` branch (data-disk character file + "Insert disk n" prompt) has no caller in this build.
- `CheckEclDisk`: the `'S'` (save and exit) branch is unreachable with an empty options string (HorizontalMenu 9D00:0634 scans `Length(options)` characters) unless `menu_TimeoutKey = 'S'`; a port should keep the menu behaviour, not "fix" it.

### Disagreements with the data specs (code wins)
1. SAVES.md §1 `WriteCharacter WriteCharacter(name: string[8]; var c: TChar)` — Pascal order is `(var c [BP+0Ah]; name [BP+6])` (callers push c first: 7500:2105/213E).
2. SAVES.md §1 `ReadCharacter ReadCharacter(fromSave, isSav: boolean; var c: TChar; name)` — this is Ghidra's reversed order; Pascal order is `(name [BP+0Eh]; var c [BP+0Ah]; isSav [BP+8]; inSaveDir [BP+6])` (7500:19C2..19D5).
3. SAVES.md §1 "entries whose 2nd char is `*` are not written back" — the test is `byte [node+1]` = the first character of the string; the marker is the `'* '` prefix that ReadCharList gives to names of current party members (and ov16 gives to an entry when it is added).
4. SAVES.md §1/§2 do not mention that **LoadGame and SaveGame erase the roster files** `<name>.CHA/.ITM/.SPC` of every party member (7500:1A63..1B60 nested under the .CHA test; 7500:2191..228B independent tests).
5. SAVES.md §2: the 8 × string[40] name block is written in full; slots after the member count are uninitialised stack bytes (7500:20A0) — a port should not rely on them. Name = `'CHRDAT' + letter + Str(list position)`.
6. MONSTERS.md loader: signature is `LoadMonster(id [BP+0Ah]; var c [BP+6])` (pushes id first: 7500:1286..1291, 4300:0444), not `(var rec, id)`; the colour bytes are `Roll(1,6)` = 1..6 (not `Random(6)` 0..5): byte = `(r+8)*16 + r` (MONSTERS.md's `r*$11 - $80` is the same value mod 256 but with the wrong range of r); `c.next` (+104h) and `c.combatant` (+108h) are cleared, matching "+104h..+10Ah := 0".
7. MONSTERS.md "DS:557C optional record flag" = `NoDiskPrompt` (engine name) — consistent.
Record sizes 285 / 63 / 9 and SAVGAM layout (13,137 bytes) agree with the code.

## (d) Self-check
Method: every statement was written while reading `ov17.lst`; afterwards a script confirmed that all 353 distinct `7500:xxxx` addresses in ov17.pas.md are instruction starts in the listing (only `7500:0000`, a CS literal, is not — expected). Then a re-read sample of 34 statements (≈ 12 % of ~290) against the asm (`ov17.lst` / `python decode/ecl/hdis.py ov17 S E`):

| # | addr | statement | result |
|---|---|---|---|
| 1 | 0017 | list := nil | OK (word stores 0 to ES:[DI], [DI+2]) |
| 2 | 0153 | `'* '` prefix when p ≠ nil | OK (StrCopy cs:000D, StrAppend node, StrAssign 28h) |
| 3 | 0254 | test first char ≠ '*' | OK (`CMP ES:[DI+1],2Ah`) |
| 4 | 02e3 | err ≠ 0 and ≠ 5 → prompt | OK |
| 5 | 0412 | EGA mask loop length from g_5EB2^.frameSize shr 2 | OK (SHR AX,1 ×2, DEC) |
| 6 | 04d8 | LoadCombatIcon(name, icon_head, 11) — push order name, +BDh, 0Bh | OK |
| 7 | 0546 | OverlayIconPicture(g_5EB2, CombatIcons[slot].pose0) — pushes 5EB4/5EB2 first, then [slot*8+5E5C/5E5A] | OK |
| 8 | 05cd | toCol[slot+8] := high nibble | OK (AND F0h, SHR 4, +8) |
| 9 | 062a | RecolorPicture(from [BP-13h], to [BP-23h], 0, 0, pic) | OK (push order) |
| 10 | 06b8 | `nm = ''` branch | OK (CMP [BP-9],0) |
| 11 | 07cc | base := SavePath + MakeDosName(DeleteAll(c.name,'.')) | OK (result buffers fe2f/fd2f, cs:0679 = '.') |
| 12 | 08b3 | BlockWrite(f, c, 11Dh) nil result | OK (push 0,0) |
| 13 | 0a90 | BlockWrite effect 9 bytes, next +5 | OK |
| 14 | 0b81 | DiskPromptText[DataSet] + DataDrive + ':' | OK (MUL 1Eh, ADD 2614h; g_547D; cs:0AD6) |
| 15 | 0c26 | OpenWithPrompt(nm+ext, prompt, False, f) | OK (push order fd47, fe48, 0, fe80) |
| 16 | 0c80 | c.combatant := nil | OK (+108h/+10Ah) |
| 17 | 0d3d | GetMem next only if not Eof | OK |
| 18 | 0f27 | LoadDaxRecord('MON'+n+'CHA', '.dax', id, size, p) | OK (push fee c, fee7, [BP+0Ah], -2, -6) |
| 19 | 0fa5 | race 1,3,5 → 1; 2,4,6,7 → 2 | OK |
| 20 | 0ff3 | colour := (r+8) shl 4 + r | OK |
| 21 | 107b | NoDiskPrompt := 1 | OK |
| 22 | 1286 | LoadMonster(id, c^) — push [BP+6] then far c | OK |
| 23 | 12bb | signed level test, i = 0..6 | OK (JLE, CMP 6) |
| 24 | 13e3 | head := g_08C7[gender*8 + Roll(1,8)] | OK (SHL 3, Roll push 1,8) |
| 25 | 14e4 | party_slot in [0..7] | OK (set CS:1426 = FF 00…) |
| 26 | 1565 | inc ecl_Mem6B00^.w[67Ch] | OK |
| 27 | 16dd | HorizontalMenu(prompt, opts, 0Dh, 0Ah, 0Fh, 0, 0, @ext) | OK (push order) |
| 28 | 17a9 | OpenWithPrompt(…, 'Put save disk in '+SavePath, True, f) | OK (StrAppend DS:537A, push 1) |
| 29 | 18ea | opt_MonsterPics := w[1FEh] shr 1 | OK |
| 30 | 19c2 | ReadCharacter(fn, c^, True, True) | OK (push fe0a, c, 1, 1) |
| 31 | 1c13 | wall-set id from Mem4900 (4AF9h+i)*2+6E00h | OK (= 3F2h+2i mod 10000h) |
| 32 | 1d8b | animate := game_Mode = 2 | OK (CMP 2, INC AX on equal) |
| 33 | 213e | WriteCharacter(p^, 'CHRDAT'+key+ns) | OK (push p first, then string) |
| 34 | 2372 | (not ext) and (key = 'S') | OK (`CMP [BP-56h],0` = ext var, `CMP [BP-55h],53h` = result) |

Call push orders checked: 13 (#6, 7, 9, 11, 15, 18, 22, 24, 27, 28, 30, 33, and LoadWallSet(id, slot) at 7500:1C7E..1C94). Result: 34/34 OK after two corrections made during writing (caller addresses for AddToParty/LoadGame/SaveGame had been taken from listing line numbers; fixed to 7000:318A/322B, 7000:0406, 7000:0431/049F, 6B00:1F4C, 2000:0070). Not run: `decode/tools/argcheck.py` (accepts only ECL/VIEW; the lane runs it on the merged PARTY.pas.md).
