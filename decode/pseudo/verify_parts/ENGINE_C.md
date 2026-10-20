# ENGINE verification part C — res_0802, res_0899, res_08AE (ENGINE.pas.md lines 2316..end)

Verifier: por-verify2 fork C (did not write ENGINE). Evidence: `python -I decode/ecl/hdis.py r0802|r0899|r08AE START END` (image bytes) and `decode/listings/res_0802.lst / res_0899.lst / res_08AE.lst`; 08AE routines 137C..17AE are not in the export and were read from the bytes only.

## 1. Seeded sample (seed 303)

Population: 258 anchored statements in lines 2316..2875 (first `{ 0802|0899|08AE:oooo }` per line). Sample: 27 (10.5 %), `random.seed(303); random.sample(pop, 27)`.

| # | line | address | statement (abridged) | verdict | evidence |
|---|---|---|---|---|---|
| 1 | 2353 | 0802:00a5 | `Intr($10, Regs)` | AGREE | push 10h, DS:4A02, lcall Dos.Intr |
| 2 | 2367 | 0802:0142 | `BiosPutChars(col, row, colour, 1, t[i])` | AGREE | pushes [bp+0Eh], [bp+0Ch], [bp+0Ah], 1, [bp+di-100h]; near call 0040 |
| 3 | 2384 | 0802:01cf | `key := ReadGameKey` | AGREE | lcall 0899:0059, AL → [bp-2Ah], unused |
| 4 | 2385 | 0802:01d7 | `BiosFillChars(0, 24, 0, 40)` | AGREE | push 0, 18h, 0, 28h; call 0175 |
| 5 | 2405 | 0802:0289 | `ok := FileExists(n)` | AGREE | push ss:[bp-2Ah]; call 02EB; AL → [bp-54h] |
| 6 | 2420 | 0802:032f | `g_49CE := IOResult` | AGREE | lcall IOResult; mov [49CE],ax |
| 7 | 2470 | 0802:064f | `g_557C <> 0` (noPrompt arg) | AGREE | raw byte [557C] pushed; callee only tests `cmp [bp+0Ah],0`, so equivalent |
| 8 | 2471 | 0802:065c | `if ok then begin` | AGREE | or al,al / je 06DA |
| 9 | 2530 | 0802:0953 | `DataSet := n` | AGREE | [bp+6] → [5376] |
| 10 | 2543 | 0802:0968 | empty init | AGREE | 55 89 E5 5D CB |
| 11 | 2555 | 0899:0012 | `Regs.AH := 0; Regs.AL := PrevBiosVideoMode` | AGREE | [4A03] := 0; AL := [4A1C] (= PrevBiosVideoMode) → [4A02] |
| 12 | 2581 | 0899:00f7 | `ReadGameKey := ch` | AGREE | [bp-2] → [bp-1] → AL |
| 13 | 2588 | 0899:010a | JMP 011E skips loop | AGREE | `EB 12` → 011E epilogue |
| 14 | 2631 | 08ae:00df | `if SoundDevice = 2 then Exit` | AGREE | cmp byte [5372],2; jne / jmp 0177 |
| 15 | 2635 | 08ae:0118 | `1: SetSoundOutput(1)` | AGREE | cmp ax,1; push 1; call 181A |
| 16 | 2641 | 08ae:0156 | `if g_5374 > 0` | AGREE | cmp word [5374],0; jbe (unsigned, word) |
| 17 | 2652 | 08ae:0184 | `if SoundDevice <> 2` | AGREE | cmp byte [5372],2; jne 018D |
| 18 | 2653 | 08ae:018e | `InstallSoundTimer` | AGREE | push cs; call 137C |
| 19 | 2663 | 08ae:01b1 | `if mode > 0` | AGREE | cmp word [bp+6],0; jbe 01C4 |
| 20 | 2667 | 08ae:01cb | `g_5374 := mode` | AGREE | [bp+6] → word [5374] |
| 21 | 2689 | 08ae:13d2 | `Port[$61] := Port[$61] and $FC` | AGREE | in al,61h; and al,0FCh; out 61h,al |
| 22 | 2724 | 08ae:1477 | `if cs08AE_01FF = 0 then gate := 0; goto Out` | AGREE | bx := [1FF]; je 14E3 with BL = 0 |
| 23 | 2757 | 08ae:153b | `Port[$C0] := latch xor (Lo(f) shr 4)` | AGREE | ax := [si+8] shr 2; 4× shr al,1; xor al,dl; out C0h |
| 24 | 2771 | 08ae:157c | `ch^.volume := ch^.volume + ch^.volDelta` | AGREE | ax := [si+0Ch]; add [si+0Ah],ax |
| 25 | 2781 | 08ae:15b3 | `if ch^.noteOff <> 0` | AGREE | cmp word [si+14h],0; je 15C8 |
| 26 | 2783 | 08ae:15be | `if noteOff = 0 then envIndex := $10; envCount := 1` | AGREE | dec [si+14h]; jne; [si+18h] := 10h; [si+1Ah] := 1 |
| 27 | 2838 | 08ae:16fb | `dst^.duration := ch^.duration; dst^.noteOff := ...` | AGREE | cx := [si]; [di] := cx; [di+14h] := cx |

Sample result: **27 AGREE, 0 DISAGREE, 0 UNSURE**.

## 2. Sweeps over the range (every routine 0802:0000..0968, 0899:0000..013C, 08AE:0000..182D)

| class | sites checked | result |
|---|---|---|
| call-argument order | all calls of BiosPutChars, BiosWriteString, BiosFillChars, BiosPromptLine, OpenWithPrompt (05FA..0659), OpenDax (0743..0775), CloseDax ×2, AllocBlock, FreeBlock, DaxRleDecode (0920..0935), Seek ×2, BlockRead ×6, @StrLong (Str(comp:0)), GetTime (08ae:0006), StartSpeaker/Psg (all PlayOrStopSound/ResetSound sites), WaitHundredths(10) | AGREE. dataF = [bp-0B3h], dirF = [bp-133h] confirmed by OpenDax's frame ([BP+0Ah] dataF, [BP+6] dirF): directory reads use dirF, data Seek/BlockRead use dataF. |
| argcheck MISMATCH 0802:08bf `GetMem(size)` | 08BF `les di,[bp+0Ah]`; 08C2 `push word es:[di]`; lcall 0AF8:023F; DX:AX → p^ | **false positive (AGREE)**: `size` is a `var` parameter, the push is its dereferenced value (size^ = raw size). Pseudo is right; the tool cannot see var dereference. (Pascal form would be `GetMem(p, size)`; meaning identical.) |
| signed vs unsigned | DaxRleDecode 0533..057A (`jl/jg` signed on ShortInt c: 0..7Eh literal, 81h..FFh repeat, 7Fh/80h no progress); loop `si >= compSize` jae (unsigned word); `comp > 36000` cmp 8CA0h / jbe (unsigned); FilePos(dirF) >= dataStart (0874..087F: signed hi word jl/jle, unsigned lo jbe → LongInt compare); WaitHundredths 00A8..00D4 (signed LongInt `target-now > n` and `now >= target`); `g_5374 > 0`, `mode > 0` (jbe, word unsigned); NoteList `tempo > 1` (byte `cmp al,1 / ja`), `chan > 0` (ja) | AGREE |
| byte vs word operands | Regs fields (AH/AL/BH/BL/DH/DL byte stores, CX word via xor ah); SoundDevice/g_5373 byte; g_5374 word; DataSet byte; DeleteAll `n` is a **Byte** (0389..039E, `mov [bp-201h],al`) — so `Length(a)-Length(b)+1` wraps mod 256 when b is longer than a+1 (e.g. len a = 0, len b = 5 → n = 252, loop runs); NoteList duration `tempo*length` is an 8-bit MUL (`mul byte [bx+1]` with AL = tempo low byte) | AGREE with one precision note (DeleteAll n byte wrap — not a DISAGREE: the pseudo does not claim a type; the only callers pass 1-char `sub`, so n wraps only for a = '' → n = 0, loop skipped). |
| folded constant array indexes | g_2614[DataSet] = 2614h + DataSet×1Eh (061A..0626); g_25D5[colour] (0086); g_0D19[i] (0465, i = 1..10); SpeakerSoundTable 055Fh + snd×8 + 2k (1756..1769); cs08AE_0209[4 - 01D9] (1698, 1781) | AGREE |
| ABS / neg idioms | DaxRleDecode 0580 `neg ax` (count = −c; stored back into the byte c, then `di += c'` = di − c) | AGREE (not ABS; as written) |
| Pascal set tests | ReadGameKey 008B..0099 `g_5373 in [0, 1]` via @SetIn with set constant CS:0033 = 03h | AGREE |
| string length-byte handling | FileExists `n <> ''` = `cmp [bp-2Ah],0` (length byte); BiosWriteString / MakeDosName loops `1 to Length(t)` (ja exit if 1 > len); MakeDosName `Copy(a,1,8)`, UpCase per char; DeleteAll lengths from [bp-100h]/[bp-200h] | AGREE |

Further body checks done in the sweep (not sampled): LoadDaxRecord whole body 0716..0947 AGREE; OpenDax 05CD..06E4 AGREE; OpenWithPrompt / FileExists AGREE; TimeInHundredths_08AE (`Word(m*6000)` quirk: `mul word [bp-8]`, `xor dx,dx`) AGREE; InstallSoundTimer / RemoveSoundTimer / SoundTimerInterrupt (timebomb 13F5..143F, 13 tick divider) AGREE; SpeakerChannelTick 1477..14EB AGREE; StartSpeakerChannels 1742..17AB AGREE; SetSoundOutput AGREE; ChannelStep 157A..160A AGREE; ReadSoundCommands jump table at 08AE:0221 = 164E, 16AC, 16B3, 1645, 162E, 167F for FA..FF — matches the pseudo's case labels.

## 3. DISAGREE list (with corrections)

1. **#verify-C1 — 08AE NoteList entry format (lines 2833..2836, 08ae:16c1..173f).** Pseudo: "2-byte entries {note, length} … chan := note shr 5 … n := note and $7F". Bytes: at 16C4 `DI` already points one past the first byte (`mov bl,[di]; inc di` at 1618/16C1); `chan := BL shr 5` (byte 0), `length = [bx+1]` (byte 2), `n := [bx] and 7Fh` (byte 1), and after the entry `al := [di]; di += 2; test al,80h` (bit 7 of byte 1 ends the list). **Correction:** entries are **3 bytes {chanByte, note, length}**: `chan := entry[0] shr 5`, `n := entry[1] and $7F` (7Fh = rest), `length := entry[2]`, list ends after the entry whose `entry[1]` has bit 7 set; the first entry's byte 0 is the command byte read by the dispatcher (< FAh).
2. **#verify-C2 — 08AE ResetChannel field list (line 2815, 08ae:164e..167d; same body used by FD 1645).** Pseudo: "clear fields 4..24h of the current channel". Bytes clear words **+04, +06, +08, +0A, +0C, +10, +12, +16, +18, +1A, +1C, +1E, +20, +22, +24** only; **+0Eh (tempo) and +14h (noteOff) are kept** (and +0/+2). **Correction:** list the cleared fields explicitly; tempo and noteOff survive FA/FD.

## 4. Notes (not DISAGREE)
- `decode/names/rt_names.json` still labels 0AF8:1593 `System.FileSize` (hdis prints that), while ENGINE.pas.md (and this check: the directory scan compares it with the data-area start, which only terminates if it is the current position) says FilePos. Cross-lane for por-rt/por-tooling, not an ENGINE defect.
- LoadDaxRecord writes the exit as `Halt_0899_0000` while the same file names 0899:0000 `TerminateGame` — cosmetic naming inconsistency (line ~2503).
- Unknowns/Self-check sections reviewed: they are consistent with the bodies; the Self-check claims (part T: LoadDaxRecord signature) are confirmed by this pass.

## 5. Summary
- Sample (seed 303): 27 statements — **27 AGREE / 0 DISAGREE / 0 UNSURE**.
- Sweeps: 8 classes, all AGREE; argcheck MISMATCH 0802:08bf adjudicated **false positive** (var-parameter dereference).
- Body-level DISAGREE found by the sweep: **2** (#verify-C1 NoteList 3-byte entries — behaviour-relevant for a sound port; #verify-C2 ResetChannel keeps +0Eh/+14h).
