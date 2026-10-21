# ov00 notes (lane por-mod-party)

## (a) Routines

| routine | name | conf | evidence |
|---|---|---|---|
| 2000:0042 | HeapErrorHandler | H | stored into HeapError (DS:4414) as 0016:0025 = ov00 stub entry 1; param size [BP+6], RETF 2; "Insufficient Memory" texts |
| 2000:00AC | InstallHeapErrorHandler | H | unit init (entry 0), only writes HeapError |

Counts: 2/2 routines; H 2.

## (b) Globals named

| DS | name | conf | evidence |
|---|---|---|---|
| 49D0 | LowMemSaveGame | M | only reader 2000:0069 selects "save game then exit" vs "exit"; no writer anywhere (GLOBALS.md) → always 0 |

Used, named elsewhere: HeapError 4414 (RT), g_557D (written by SaveGame SaveGame, ov11, ov16, ecl_CampCheck; meaning owned by ov17/ECL).

## (c) Unknowns
- g_557D exact meaning (M: "game was saved / done" flag returned by SaveGame) — ov17 owner.
- Why LowMemSaveGame exists without a writer (debug leftover, L).

## (d) Self-check
Statements: 7. Re-read against the asm: all 7 (100 %).
- `ShowBottomPromptAndReadKey($0E, 'WARNING…')`: push AL=0Eh (2000:0052) then string temp (2000:0055..005f) → colour first = ENGINE signature (colour [BP+0Ah], s [BP+6]) — OK.
- second message: push 0Eh (2000:0081) then string (2000:0084..008e) — OK.
- `HeapError := 0016:0025`: AX=25h → [4414], DX=16h → [4416] — OK.
- size test JBE on word compare with 0 → `size > 0` (unsigned) — OK.
- loop exit `CMP [BP-3],0 ; JZ 0052` — OK.
