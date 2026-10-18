# LAYOUT — START.EXE + GAME.OVR code units (por-tooling)

All segments are **image-relative** (paragraphs from the start of the unpacked load module, = the values
the MZ relocations and overlay fixups contain). Analysis load base for the resident image = segment 0000.
Tools: `decode/tools/unexepack.py`, `decode/tools/tpovl.py` (`--json decode/bin/ovl_layout.json`, `--extract DIR`).

## EXEPACK (step 1)
Evidence (START.EXE, 65,231 B): MZ hdr 0x20 paras, 0 relocs, CS:IP 0F72:0012, SS:SP 0080:0000 (packed).
EXEPACK header at load-module 0xF720 (file 0xF920): `06 00 00 00 00 00 af 05 00 40 f2 14 bf 10 01 00 52 42`
= real IP 0006, real CS 0000, exepack_size 05AF, real SP 4000, real SS 14F2, dest_len 10BF paras, skip_len 1, 'RB'.
Stub code: backwards RLE (B0 fill / B2 copy, bit0 = last) — 889 commands; src and dst pointers meet at 0x151 (H: clean unpack).
Packed relocation table at stub+0x12D (after "Packed file is corrupt"; stub `BE 2D 01` = MOV SI,012Dh) to stub+0x5AF = exepack_size: **561 relocations**.
Result `decode/bin/START.unpacked.exe` 70,864 B, image 68,592 B (0x10BF paras), entry 0000:0006, SS:SP 14F2:4000.

## Compiler (H/M)
- Turbo Pascal: "Runtime error ", " at ", "Portions Copyright (c) 1983,91 Borland" in seg 0AF8 (H).
- Version: copyright year 1991 and FBOV overlay format (TP 5.0+). Header layout below matches the TP 5.5/6.0/7.0 OvrHeader. Exact version **TP 6.0 (M)** — the year string fits neither 5.5 (1989) nor 7.0 (1992) — to be confirmed by por-rt via System-unit signatures.

## Data segment / stack (H)
- DS = **0C7C** (relocated `B8 7C 0C 8E D8` = MOV AX,0C7C; MOV DS,AX at 0A53:0000-ish sites in System, 5 reloc sites). Initialised data in the image: 0C7C..10BF = 0x4430 B (starts with Pascal strings "BEWARE", "ZOMBIE").
- SS:SP = 14F2:4000 (from EXEPACK header) -> DS+BSS spans 0C7C..14F2 (0x8760 B), stack 0x4000 B above it.

## Unit order (H)
Main program at 0000:0006 is a chain of 47 `9A` far calls to unit initialisers (TP order: System first, then units in `uses` order); full list in `tpovl.py` output / below. Overlay units' inits are called through their stub entry 0 (stub:0020).

## Resident code segments
| seg | end | size | unit / role (evidence) | TP std unit | conf |
|---|---|---|---|---|---|
| 0000 | 0016 | 00160 | main program (PROGRAM body + init chain at 0000:0006, body at 0000:00F6) | — | H |
| 00BA | 03C5 | 030B0 | resident game unit, init 00BA:309E (strings " Yes "/" No ") | unknown | M |
| 03DA | 03DB | 00010 | unit with empty init only (globals/consts unit?) | unknown | L |
| 03ED | 03EE | 00010 | unit with empty init only (globals/consts unit?) | unknown | L |
| 03F1 | 0428 | 00370 | resident game unit, init 03F1:0367 | unknown | M |
| 042B | 0464 | 00390 | startup unit, init 042B:00A4: "GAME.OVR", "POOL.CFG", "Please insert startup disk.", "Not enough memory to run game" | unknown | M |
| 0464 | 0709 | 02A50 | resident game unit, init 0464:2A4A; ".dax" | unknown | M |
| 0709 | 0802 | 00F90 | resident game unit, init 0709:0F82; "8X8d1", ".dax", "Press any key to continue" | unknown | M |
| 0802 | 0899 | 00970 | resident unit, init 0802:0968; "game.ovr", "Please insert overlay disk.", "tempsize" (overlay/memory setup) | unknown | M |
| 0899 | 08AE | 00150 | resident unit, init 0899:013C ("STING") | unknown | L |
| 08AE | 0A31 | 01830 | resident unit, init 08AE:01D2; sine table, INT 10h x3 (low-level video?) | unknown | M |
| 0A31 | 0A32 | 00010 | unit with empty init only | unknown | L |
| 0A32 | 0A40 | 000E0 | no-init code: INT 21h wrappers (MsDos/Intr-like) -> TP Dos unit? | Dos? | M |
| 0A40 | 0AA2 | 00620 | init 0A40:0000; INT 16h x4, INT 10h -> TP Crt unit? | Crt? | M |
| 0AA2 | 0AF8 | 00560 | no-init code; "PATH=" search -> TP Overlay unit (OvrInit)? | Overlay? | M |
| 0AF8 | 0C7C | 01840 | System unit: init 0AF8:0000 called first; "Runtime error", "Portions Copyright (c) 1983,91 Borland" | System | H |

Stub segments (35) occupy 0016..00B9, 03C5..03D9, 03DB..03EC, 03EE..03F0, 0428..042A (interleaved with resident units, in unit order).

## FBOV overlay file (H)
GAME.OVR = `46 42 4F 56` 'FBOV' + dword 0x00032511 (= file size 0x32519 - 8), then the 35 units back to back: code[CodeSize] then fixups[FixupSize]; no gaps, last unit ends exactly at EOF (tpovl.py check).

Stub segment layout (evidence: e.g. image 0x160 = `cd 3f 00 00 08 00 00 00 be 00 0e 00 02 00 00 00`, entries at 0x180 `cd 3f ac 00 00 cd 3f 42 00 00`):
`+00 CD 3F` INT 3Fh · `+02` ReturnAddr (0) · `+04 dword` FileOfs (absolute in GAME.OVR) · `+08` CodeSize · `+0A` FixupSize (bytes) · `+0C` EntryPts · `+0E` CodeListNext (previous stub seg; 0 for the first) · `+10..+1F` runtime (0 on disk) · `+20+5i` entry i = `CD 3F <offset> 00`.
Fixups: FixupSize/2 words, each an offset in the unit code where a 16-bit image-relative segment value sits (targets are stub segs, resident code segs and DS 0C7C... see tseg column of `tpovl.py`). Every entry offset lands on `55 89 E5` (406/406, H). Entry 0 = unit init (at end of code, called by main).

Analysis load segment for overlay unit N = **2000 + N*0500** (unit max 0x4459 B < 0x5000). In the Ghidra project each stub entry `CD 3F off 00` is rewritten to `EA off ovseg` (JMP FAR, same 5 bytes) so far calls into stubs resolve to the unit's routine.

| unit | stub seg | analysis seg | GAME.OVR ofs | code | fixups | entries | init | sample strings |
|---|---|---|---|---|---|---|---|---|
| ov00 | 0016 | 2000 | 000008 | 00BE | 7 | 2 | 00AC | WARNING: Insufficient Memory$Ins |
| ov01 | 0019 | 2500 | 0000D4 | 080E | 101 | 2 | 0809 | scenario created by:; tsr, inc. |
| ov02 | 001C | 2A00 | 0009AC | 035E | 30 | 2 | 0359 | %USE THE TRANSLATION WHEEL TO DE; THE CODE WORD.#MATCH THE ESPRUAR |
| ov03 | 001F | 2F00 | 000D46 | 350D | 402 | 2 | 3508 | $PRESS <RETURN> OR BUTTON TO CON; Unable to find item fileU |
| ov04 | 0022 | 3400 | 004577 | 0F37 | 104 | 2 | 0F32 | cast cure anyway: U;  will only cost  |
| ov05 | 0025 | 3900 | 00557E | 1676 | 112 | 2 | 1671 | You have lost the duel.; You have won the duel. |
| ov06 | 0028 | 3E00 | 006CD4 | 079D | 49 | 3 | 0798 |                               ; OverLoadedU |
| ov07 | 002B | 4300 | 0074D3 | 221A | 141 | 25 | 2215 | Loading...Please Wait;  is hit FOR  |
| ov08 | 0035 | 4800 | 009807 | 127F | 157 | 2 | 127A | Magic On; Magic Off |
| ov09 | 0038 | 4D00 | 00ABC0 | 1927 | 117 | 2 | 1922 | flees in panicU; Move/Attack, Move Left =  |
| ov10 | 003B | 5200 | 00C5D1 | 1F92 | 56 | 2 | 1F8D | <%t0<9t,<@t(<; RandComU |
| ov11 | 003E | 5700 | 00E5D3 | 061A | 55 | 2 | 0615 | Loading...Please Wait |
| ov12 | 0041 | 5C00 | 00EC5B | 38AE | 377 | 117 | 38A9 | starts to trainU; is hardierU |
| ov13 | 0068 | 6100 | 0127FB | 3C72 | 303 | 25 | 3C6D | -Backstabs-; slays helpless |
| ov14 | 0072 | 6600 | 0166CB | 10AC | 93 | 3 | 10A7 | #The river's stench drives you b; H6<Nt8<~r |
| ov15 | 0075 | 6B00 | 017831 | 1FDE | 184 | 3 | 1FD9 | cannot cast spells in this area; is in no condition to  |
| ov16 | 0078 | 7000 | 01997F | 4459 | 263 | 4 | 4454 | Choose a function ; Quit to DOS  |
| ov17 | 007C | 7500 | 01DFE6 | 23E5 | 361 | 12 | 23E0 | charlist.txt; charlist.txt |
| ov18 | 0082 | 7A00 | 02069D | 08FB | 81 | 3 | 08F6 | #Mortally wounded, the dragon ro; from the dragon's body. |
| ov19 | 0085 | 7F00 | 02103A | 2B12 | 320 | 13 | 2B0D | THAC0   ; Damage         |
| ov20 | 008C | 8400 | 023DCC | 0E65 | 44 | 3 | 0E60 | Rest Time:; 'Rest   daYs Hours Mins   Inc De |
| ov21 | 008F | 8900 | 024C89 | 225B | 154 | 15 | 2256 | 'Overloaded.  Money will be put ; OverloadedU |
| ov22 | 0096 | 8E00 | 027018 | 37B5 | 349 | 64 | 37B0 | Memorize; Choose Spell:  |
| ov23 | 00AC | 9300 | 02AA87 | 0463 | 0 | 5 | 045E |  |
| ov24 | 00B0 | 9800 | 02AEEA | 1937 | 87 | 23 | 1932 | starts to cough; chokes and gags from nauseaU |
| ov25 | 03C5 | 9D00 | 02C8CF | 124A | 55 | 8 | 1245 |  |
| ov26 | 03CA | A200 | 02DB87 | 02A5 | 6 | 3 | 02A0 |  |
| ov27 | 03CD | A700 | 02DE38 | 0288 | 7 | 3 | 0283 |  |
| ov28 | 03D0 | AC00 | 02E0CE | 07C5 | 50 | 8 | 07C0 | Illegal range in Show3DSprite.U |
| ov29 | 03D5 | B100 | 02E8F7 | 120B | 40 | 8 | 1206 | .dax&Unable to load wallset in L; .dax Unable to load geo in Load3 |
| ov30 | 03DB | B600 | 02FB52 | 0BDE | 5 | 7 | 0BD9 |  |
| ov31 | 03E0 | BB00 | 03073A | 1300 | 25 | 20 | 12FB |  |
| ov32 | 03E9 | C000 | 031A6C | 0645 | 55 | 6 | 0640 | !Start range error in Load24x24S |
| ov33 | 03EE | C500 | 03211F | 00FC | 13 | 2 | 00F7 |  |
| ov34 | 0428 | CA00 | 032235 | 02B2 | 25 | 3 | 02AD | Unable to load 8x8D; "Bad symbol number in Put8x8Symb |

Totals: 35 overlay units, 406 entry points, 0x30409 B overlay code; resident code ≈ 0x31E0 (main+stubs) + unit segments.

## Ghidra project (step 3)
- Build: `wsl.exe -d Ubuntu -- bash <repo>/decode/tools/ghidra_build.sh build` (≈3 min); after editing `decode/names/*.json`: `... ghidra_build.sh export` (≈1 min). Run it from PowerShell (Git Bash mangles the `/mnt/c` path). One Ghidra at a time.
- `decode/tools/ghidra_prep.py` -> `decode/bin/ghidra/` (resident.bin with stub entries rewritten `CD 3F off 00` -> `EA off ovseg`; ovNN.bin; layout.txt). `decode/ghidra_scripts/PorBuild.java`: one memory block per resident segment, per stub segment and per overlay unit (each at seg:0000, so addresses keep their run-time segment); `dseg` = 0C7C..14F2 (initialised data + zero-filled BSS, one block), `stack` 14F2:0000+4000; context DS=0C7C and CS=block segment on all code; seeds = 406 overlay entries (`ovNN_init` = entry 0, `ovNN_XXXX`) + 406 stub thunks (`stub_ovNN_eK`) + entry 0000:0006; then auto-analysis. Program x86:LE:16:Real Mode, project `ghidra_proj/por` (gitignored).
- `decode/ghidra_scripts/PorExport.java`: applies `decode/names/*.json` ({"SSSS:OOOO": "Name"}, USER_DEFINED; files in name order, later wins), marks System.Halt/@RunError/@DivideError no-return, exports `decode/listings/<unit>.lst` + `<unit>.c` + `functions.tsv`; `decode/tools/listings_index.py` writes `decode/listings/INDEX.md`.
- Result: **1347 functions, 0 decompile failures**; calls into stubs show the real target, e.g. `CALLF ... ; ov19_27DF (via stub_ov19_e10)`, and decompiles call `stub_ovNN_eK()` thunks that resolve to the unit routine. Pascal string literals annotated `[ps] cs:"text"` in .lst (728) and as `offset=text` in each .c function header.
- **Near-branch fix (2026-10-16):** Ghidra's x86 real-mode `rel16` wraps E8/E9 targets inside the *linear* 64 KB page instead of the segment. Overlay units whose analysis range crosses a linear 64 KB boundary (ov03 @2F00, ov19 @7F00, ov22 @8E00) had 55 near CALL/JMP targets 64 KB off, so their callees were never disassembled. PorBuild now recomputes every E8/E9 target as seg:((ip+3+rel)&FFFF), replaces wrong flows with CALL/JUMP_OVERRIDE references, creates the functions and re-analyses until stable. It also scans for uncovered `55 89 E5` prologues and seeds all RT-ledger entries (frameless runtime callbacks). Result: 1389 functions (was 1347). The operand text still shows Ghidra's raw value (e.g. `CALL 0x3000:f001`); the `;` comment and the decompile use the corrected target (`FUN_2f00_0001`). Analysis segments were NOT renumbered: other lanes already key overlay addresses by seg:off.
- DS operands carry their global name (from `decode/names/globals.json` or lane names) as a `;` comment in .lst and as the symbol in .c.
- Known artifacts (read around them): (1) CALLF operands print as linear `0x0000:XXXX` — use the `;` comment for the target. (2) After a far call Ghidra's p-code leaves CS = callee segment, so a following `PUSH CS` decompiles as e.g. `0xaf8`; the true value is the function's own segment (string literal offsets are in the function header). (3) Ghidra prototypes default to `__stdcall16far`; TP far procs are Pascal convention (args pushed left-to-right, callee pops) so decompiled parameter order is reversed vs. the Pascal source until signatures are applied.

## Gate check (step 4) — real engine functions decompile sensibly
1. **ov29_0E08 @ B100:0E08 = LoadWallSet** (name H: its error text "Unable to load wallset in LoadWallSet." at unit offset 0DC1). Decompile (`ov29.c`): builds "WALLDEF" + IntToStr(n) + ".dax" (StrCopy 0xDB4, StrConcat, 0xDBC), loads the record via `FUN_0802_0716`, on size 0 or overflow (`size/0x30C + n > 4`) prints the error and exits; else copies 0x30C-byte wall-set records into the far buffer at DS:6A58 slot n, rebases tile bytes (`+= delta` where `>= DS:272C`) over 5 x 0x9C entries, then calls ov34 entry 1 (8x8 symbol loader, "Unable to load 8x8D") per set. Coherent control flow, globals in DS 0C7C.
2. **FUN_0464_0111 @ 0464:0111 = generic DAX record loader (M)**: `StrAssign(name)`, frees a previous buffer (`FUN_0464_2595`) if the far pointer is non-nil, appends ".dax" (literal at 0464:010C), calls the same `FUN_0802_0716` (file+record load, returns far ptr + size), then unpacks a 17-byte picture header (four words, a byte, 8 bytes via System.Move) and calls the decoder `FUN_0464_02a5`. `FUN_0802_0716` is thus the DAX open/read path used by both 1 and 2 (unit 0802 also holds "game.ovr"/"Please insert overlay disk.").
3. **entry @ 0000:0006 = main program (H)**: calls the 47 unit inits (System, Crt, ..., ov00), then body at 0000:00F6: `ov11_002D` (stub_ov11_e1); `if ParamStr(1) <> 'STING' then begin ov01_0627; ov02_00FD end` — ov01 holds the title/credits text ("scenario created by", "tsr, inc."), ov02 the code-wheel check text ("USE THE TRANSLATION WHEEL TO DECIPHER"); then `ov16_0161` (the game's top-level: unit with "Choose a function", "Quit to DOS"), `ov29_0155(0B,0,7,6)`, `ov03_32F8`, `FUN_0899_0000`, `System.Halt`. **Finding (H, from bytes 0000:0111-0127): `START.EXE STING` skips credits + code wheel** — relevant for the copy-protection flag.

- TP exact version (M) — por-rt.
- Names of the non-standard resident units (00BA, 03F1, 042B, 0464, 0709, 0802, 0899, 08AE) and the three empty-init units (03DA, 03ED, 0A31): unknown; module lanes.
