# ov00 screens (lane por-mod-party)

## PARTY-ov00-01 — low-memory warning
- Trigger: a GetMem/New request the TP heap cannot satisfy → HeapErrorHandler (2000:0042).
- Text: row 24, col 0, colour 0Eh (yellow): `WARNING: Insufficient Memory` (row 24 cleared first). Rest of the screen unchanged.
- Keys: any key (ReadGameKey; ^S/^D/^C rules of ReadGameKey apply).
- Pictures: none.
- Next: PARTY-ov00-02 (the save branch via g_49D0 is dead code, see ov00.pas.md).

## PARTY-ov00-02 — exiting
- Text: row 24, col 0, colour 0Eh: `Insufficient Memory. Exiting Program`.
- Keys: any key.
- Next: TerminateGame → sound stopped, BIOS video mode restored, exit to DOS.
