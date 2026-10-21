# ov01 screens (lane por-mod-party)

Skipped entirely when START.EXE is run with parameter `STING` (MainProgram 0000:0102).

## PARTY-ov01-01 — title picture 1
- Trigger: MainProgram → ShowTitle (after ov11 init has set the video mode and loaded the font).
- Picture: TITLE.DAX record 1 (320×200, PICTURES.md P), drawn at cell (0,0) by PutPicture; loaded with DataPath = '' (current dir).
- Duration: 5 s (TimeInHundredths) or until a key is pressed (key not consumed).
- Next: if POOL.CFG line 5 ≠ 'F' (cfg_FullIntro = 0) → return to MainProgram → code wheel (PARTY-ov02-01); else PARTY-ov01-02.

## PARTY-ov01-02 — title picture 2 with lightning (EGA)
- Picture: TITLE.DAX record 2 at (0,0).
- Effect (EGA only, VideoMode = 1): random bursts of 2..4 flashes; each flash sets EGA palette register 1 to 09h (150 ms), 0Bh
  (100 ms), 0Fh (50 ms), 0Bh (100 ms), 09h (150 ms), then 01h. Burst trigger = busy counter (CPU-speed dependent, see ov01.pas.md).
- Duration: 5 s (checked between bursts) or a key (not consumed).
- Next: PARTY-ov01-03.

## PARTY-ov01-03 — credits
- Frames: DrawTitledFrame(1,1,38,3) and (1,5,38,23), style 0 (symbols 114h..116h), no title text.
- Text (col, row, colour) — all shown in capitals (DrawText UpCase):

| col | row | colour | text |
|---|---|---|---|
| 5 | 1 | 0Ah | scenario created by: |
| 26 | 1 | 0Eh | tsr, inc. |
| 15 | 2 | 0Ah | jim ward |
| 2 | 3 | 0Ah | david cook,steve winter,mike breault |
| 1 | 5 | 0Ah | game created by: |
| 18 | 5 | 0Eh | ssi special projects |
| 14 | 6 | 0Bh | version 1.3 |
| 2 | 7 | 0Eh | programming: |
| 20 | 7 | 0Eh | original |
| 2 | 8 | 0Bh | scot bayless |
| 20 | 8 | 0Eh | programming: |
| 2 | 9 | 0Bh | brad myers |
| 20 | 9 | 0Bh | keith brors |
| 2 | 10 | 0Bh | russ brown |
| 20 | 10 | 0Bh | brad myers |
| 2 | 11 | 0Bh | ted greer |
| 2 | 13 | 0Eh | graphic arts: |
| 20 | 13 | 0Eh | encounter coding: |
| 2 | 14 | 0Bh | tom wahl |
| 20 | 14 | 0Bh | paul murray |
| 2 | 15 | 0Bh | fred butts |
| 20 | 15 | 0Bh | russ brown |
| 2 | 16 | 0Bh | darla marasco |
| 20 | 16 | 0Bh | victor penman |
| 2 | 17 | 0Bh | susan halbleib |
| 20 | 17 | 0Bh | dave shelley |
| 2 | 19 | 0Eh | project manager |
| 20 | 19 | 0Eh | developer: |
| 2 | 20 | 0Bh | victor penman |
| 20 | 20 | 0Bh | george mac donald |
| 2 | 22 | 0Eh | testing: |
| 11 | 22 | 0Bh | joel billings,steve salyer |
| 2 | 23 | 0Bh | james kucera,robert daly,rick white |

- Duration: 10 s or a key (not consumed — it becomes the first key of the code-wheel prompt).
- Next: return to MainProgram → PARTY-ov02-01.
