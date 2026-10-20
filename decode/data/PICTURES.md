# Picture record formats (all graphic DAX groups)

Owner: por-data. Tools: `decode/tools/dax.py` (container) + `decode/tools/daxpic.py` (render). PNGs: `decode/data/png/<GROUP>/<FILE>_<id>.png`, index `decode/data/png/INDEX.md` (every record, its layout and header values).
Addresses are `SEG:OFF` in the unpacked START.EXE image (see DAX.md).

## 1. P-record: picture / tile set — confidence H

| off | type | name | meaning | evidence |
|---|---|---|---|---|
| 0 | u16 | `height` | rows (pixels) | 0464:0111 reads word@0 → `[bp-102h]`; 0464:02A5 outer loop `0..word@0-1`. TITLE/1 = 200 |
| 2 | u16 | `width8` | width in 8-pixel units | word@2 → `[bp-104h]`; inner loop `0..word@2-1`, 4 source bytes per step. TITLE/1 = 40 (=320 px) |
| 4 | u16 | `x` | placement column in 8×8 cells (used by Show3DSprite: view cell x+2); other groups pass explicit positions | 0464:0111 → struct +4; AC00:0708 (H) |
| 6 | u16 | `y` | placement row in 8×8 cells (Show3DSprite: view cell y+2) | struct +6; AC00:0708 (H) |
| 8 | u8 | `count` | number of frames/tiles of this size that follow | byte@8 → `[bp-109h]` → struct +8; 0464:02A5 loops `1..count` |
| 9 | 8 B | `cga_map` | 16 × 4-bit entries (byte n>>1, even n = high nibble, odd n = low nibble), values 0..3: **EGA colour → CGA colour** (M) | copied to struct +9 (`0AF8:0A3F` = Move, 8 bytes); 0464:007B returns entry n; used only in the branch taken when `DS:4A1E = 0`, where the result indexes the table `DS:25FA[c*4 + pixelpos]` and is OR'd into a 4-pixels-per-byte buffer (CGA 2bpp packing). All entries in shipped data are 0..3 |
| 17 | count × height × width8 × 4 B | pixels | 4 bpp packed, **high nibble = left pixel**, row-major, rows of width8×4 bytes, frames back to back. Pixel value = EGA colour index 0..15 (default EGA palette; no remap seen in the EGA path) | 0464:02A5 reads 4 bytes per 8-px step (`0AF8:1685` Move 4 → `[bp-15h]`); nibble order hi→lo per byte (0464:0427..0459 hi, 0464:04D5..0505 lo). Verified visually: TITLE/1 renders the SSI/TSR title screen exactly |

Size check: `17 + count*height*width8*4 == raw_size` holds for every P-record (all groups listed below).

Transparency mask (struct +13h, optional): 0464:0000 `MaskByte(transpColour, 4 bytes)` returns a byte with bit (7-i) set where pixel i == transpColour; 0464:02A5 ORs these into the mask buffer when the struct's mask pointer (+13h) is non-nil. Which colour is transparent is a **caller argument** (byte `[bp+0Ah]` of 0464:0111); per-group values: **unknown** until the callers are read in the listings.

Picture struct built by 0464:0111 (`LoadPicture`, M): +0 height, +2 width8, +4 x, +6 y, +8 count, +9..+10h cga_map, +13h far ptr mask, +17h… converted pixel data. Allocation via near call 0464:(packed 0x6B07 → resolve in listings).

## 2. A-record: animation / multi-size sprite — confidence H (layout), M (semantics)

| off | type | meaning |
|---|---|---|
| 0 | u8 | `n` = number of frames |
| 1 | n × { u32 `delay`; P-record } | each frame is a full P-record (own height/width/x/y/count=1/map/pixels) preceded by a 32-bit value |

Size check holds for every PIC, SPRIT and FINAL5 animation record.

- **PIC / FINAL5 (88×88 event pictures) — H (LoadAnimation AC00:00A2):** frame 1 is stored plainly; **every later frame's pixel bytes are XOR-ed with frame 1's pixel bytes** (byte-wise over the raw 4-bpp frame, header not included; AC00:0392..03D6). Decoding: `frame_k[i] := stored_k[i] xor frame_1[i]`. PIC record 1 is capped at 4 frames by the loader. `delay` = per-frame display time (unit: ECL/animation timer, M). The PNGs show the decoded frames. (Correction of the earlier "overlay with colour 0" hypothesis.)
- **SPRIT (3D-view monster sprites) — H (Show3DSprite AC00:0708):** frames 1..3 = the monster at distance 1 (nearest, largest) .. 3; each frame is drawn into the 88×88 view at text cell (`y` + 2, `x` + 2), i.e. **`x`, `y` = position in 8×8 cells inside the view**; `delay` = 0. Not XOR-coded. Records with 2 frames have an 88×88 near frame.
- Dispatch P vs A: by group (loader that is called: LoadAnimation for PIC/FINAL/SPRIT, LoadPicture for the rest), not by a tag byte.

## 3. F-record: 1-bpp 8×8 font — confidence M

`8X8D1/201` (1416 B = 177 glyphs × 8 bytes): one byte per row, bit 7 = leftmost pixel. Glyphs include an ornate A–Z alphabet, digits and line-art/runic symbols (see `png/8X8D/8X8D1_201.png`). Its use (the code-wheel/translation runes or the title font?) is **unknown** until the caller is found.

## 4. Groups

| group | files | records / layout | content (M, from renders) |
|---|---|---|---|
| TITLE | TITLE.DAX | 2 × P 320×200 | id 1 = "SSI presents an Official AD&D computer product"; id 2 = "Pool of Radiance" logo screen (H, rendered) |
| PIC | PIC1..8 | A 88×88, 1–8 frames | event pictures for the 3D-view window, animated |
| FINAL | FINAL5 | A 88×88 (3), P 120×120, 56×32, 16×48 | end-game sequence pictures (M); FINAL5/1 and /3 are 120×120 frames with a flat grey centre (a window other pictures are drawn into, L) |
| SPRIT | SPRIT1..8 | A, 3 sizes | monster sprites drawn into the 3D view at distances |
| HEAD / BODY | HEAD1..8, BODY1..8 | P 88×40 / P 88×48 | two-part encounter portraits (head over body) |
| CHEAD / CBODY | CHEAD, CBODY | P 24×8/24×10, P 24×24 | combat icon head/body parts for player characters (icon editor) |
| CPIC | CPIC1..8 | P 24×24, 24×48, 48×24, 48×48 | combat monster icons (1×1, 1×2, 2×1, 2×2 squares) |
| COMSPR | COMSPR | P 24×24 | combat effect sprites (spells, missiles, explosions) |
| ICON | ICON | P 24×24 | default combat icons |
| 8X8D | 8X8D1..8 | P 8×8 × 70 (also ×31, ×45), F font | 3D-view wall tile sets (indexed by WALLDEF), font |
| SQRPACI | SQRPACI | 2 × P 24×24 × 128 | overland (wilderness) map tiles |
| BACPAC | BACPAC | P 24×24 × 40 | terrain tiles in the same style as SQRPACI (grass/mountain/rock); exact use (area map backdrop?) **unknown** (L) |
| DUNGCOM / WILDCOM / RANDCOM | 1 file each | P 24×24 × 25 / × 34 / × 6 | combat-map terrain tiles: dungeon / wilderness / random encounter |

Per-record list with header values: `png/INDEX.md`.
