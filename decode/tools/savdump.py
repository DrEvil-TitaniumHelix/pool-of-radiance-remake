"""Read-only Pool of Radiance save survey; emits Markdown to stdout.

Usage: python decode/tools/savdump.py [POOLRAD directory]
Offsets and candidate names are evidence, not a verified engine schema.
"""
from pathlib import Path
import hashlib
import os
import sys

# env POR_DATA, else re-targets/goldbox/por/POOLRAD next to this repo
DEFAULT = Path(os.environ.get('POR_DATA') or Path(__file__).resolve().parents[3] / 're-targets' / 'goldbox' / 'por' / 'POOLRAD')


def hx(data):
    return data.hex(' ')


def table(headers, rows):
    print('| ' + ' | '.join(headers) + ' |')
    print('| ' + ' | '.join('---' for _ in headers) + ' |')
    for row in rows:
        print('| ' + ' | '.join(str(x).replace('|', '\\|') for x in row) + ' |')
    print()


def main(root):
    save = root / 'SAVE'
    files = sorted(save.glob('CHRDAT*.*')) + [save / 'SAVGAMA.DAT', root / 'ITEMS']
    blobs = {p.name: p.read_bytes() for p in files}
    savs = {n: b for n, b in blobs.items() if n.endswith('.SAV')}
    itms = {n: b for n, b in blobs.items() if n.endswith('.ITM')}
    spcs = {n: b for n, b in blobs.items() if n.endswith('.SPC')}
    assert len(savs) == 18 and all(len(b) == 285 for b in savs.values())
    assert all(len(b) % 63 == 0 for b in itms.values())
    assert all(len(b) % 9 == 0 for b in spcs.values())
    print('# Pool of Radiance saves and ITEMS — evidence draft\n')
    print('Lane: por-saves. Original inputs read only. All offsets are hexadecimal, zero based; sizes are decimal. '
          'H = directly observed structure/value; M = strong comparative interpretation; L = hypothesis requiring code or controlled gameplay confirmation. '
          'No external format documentation used. Integer widths/signedness are hypotheses unless noted; byte arrays preserve the evidence. '
          'This is a draft, not a decode-gate sign-off.\n')
    print(f'Input root: `{root}`. Reproduce: `python decode/tools/savdump.py` (optional alternate root argument).\n')
    print('## Inventory and integrity\n')
    table(['File', 'Bytes (H)', 'Records / note', 'SHA-256'],
          [(n, len(b), f'{len(b)//63} x 63' if n.endswith('.ITM') else f'{len(b)//9} x 9' if n.endswith('.SPC') else '1 x 285' if n.endswith('.SAV') else 'opaque / see below', hashlib.sha256(b).hexdigest()) for n, b in blobs.items()])
    print('Missing sidecars are meaningful observations, not zero-byte files: CHRDATB5.ITM is absent; '
          'A4/A5/B4/B5 have no SPC. Slots A/B/J are filename groups (H); chronological ordering is unknown. '
          'All groups contain the same six names and base attributes.\n')
    print('## Character .SAV: 285-byte record\n')
    print('The following table covers every byte. Unknown fields remain unk_XX, even when a plausible interpretation is discussed below. '
          'Each evidence cell gives CHRDATA1 / CHRDATA2 raw bytes and the number of distinct values across all 18 saves. '
          'One-byte rows do not assert that the engine uses byte-sized fields.\n')
    annotations = {
        0: ('name_length', 'u8', 'H'),
        **{i: ('name_storage' if i == 1 else f'name_storage_{i-1:02X}', 'char / padding', 'H') for i in range(1, 16)},
        **{i: (f'ability_candidate_{i-16}', 'u8 candidate', 'M') for i in range(16, 22)},
        0x16: ('unk_16', 'u8; exceptional-strength candidate', 'L'),
        0x2e: ('unk_2E', 'u8; class candidate', 'L'),
        0x2f: ('unk_2F', 'u8; race/alignment candidate', 'L'),
        0xab: ('unk_AB', 'byte; XP candidate starts here', 'L'),
        0xbf: ('party_index_candidate', 'u8', 'M'),
        0xc7: ('inventory_count', 'u8', 'H'),
        0x100: ('unk_100', 'byte; spell-list metadata candidate', 'L'),
        0x11b: ('current_hp_candidate', 'u8', 'M'),
        0x32: ('maximum_hp_candidate', 'u8', 'M'),
    }
    a, b = savs['CHRDATA1.SAV'], savs['CHRDATA2.SAV']
    table(['Offset', 'Size', 'Name', 'Type', 'Evidence A1 / A2; distinct', 'Confidence'],
          [(f'{i:03X}', 1, annotations.get(i, (f'unk_{i:02X}', 'byte', 'H'))[0],
            annotations.get(i, ('', 'byte', 'H'))[1], f'{a[i]:02X} / {b[i]:02X}; {len(set(d[i] for d in savs.values()))}',
            annotations.get(i, ('', '', 'H'))[2]) for i in range(285)])
    print('H on an unknown means only its raw offset/bytes are verified, not its semantics.\n')
    print('### Comparative field evidence\n')
    table(['Character files (suffix A/B/J)', 'Name: 00 length, 01..0F storage', '10..15 stats candidate', '16', '2E / 2F', '32 max HP?', '11B A/B/J current HP?', 'AB..AE u32le XP?'],
          [(f'CHRDAT[A/B/J]{i}.SAV', savs[f'CHRDATA{i}.SAV'][1:1+savs[f'CHRDATA{i}.SAV'][0]].decode('ascii'),
            ', '.join(str(v) for v in savs[f'CHRDATA{i}.SAV'][16:22]), f'{savs[f"CHRDATA{i}.SAV"][22]:02X}',
            hx(savs[f'CHRDATA{i}.SAV'][46:48]), savs[f'CHRDATA{i}.SAV'][50],
            '/'.join(str(savs[f'CHRDAT{s}{i}.SAV'][0x11b]) for s in 'ABJ'),
            '/'.join(str(int.from_bytes(savs[f'CHRDAT{s}{i}.SAV'][0xab:0xaf], 'little')) for s in 'ABJ')) for i in range(1, 7)])
    print('Name length matches printable prefixes in every save; trailing name storage is zero in these samples (H). '
          'Six bytes at 10..15 are 10..18 in this corpus, stable per character; ability block M, individual stat order unknown. '
          'Byte 16 is 90 only for BAKSHI, whose first stat is 18; exceptional strength is L. '
          'Class at 2E is L: values 1,4,2,7,7,5 distinguish characters but do not prove an enum. '
          'Race cannot be separated securely from alignment/status candidates at 2F, 90, A0, C0, 113; all remain unknown. '
          'The apparent healing/damage relationship between 32 and 11B supports HP M: 11B never exceeds 32 and A values equal it. '
          'AB..AE as u32le increases A→B→J for most characters, with plausible XP magnitudes, but ordering of saves and width are unproven (L). '
          'Gold is NOT located with defensible confidence: 30..31 = 52/48/180/22/27/46 and 102..103 = 538/638/563/638/93/217 in A '
          'are currency/weight candidates (L); neither is named gold. Need money-display or add-gold code cross-reference.\n')
    print('C7 equals inventory sidecar record count in all 18 slots, including absent B5 = 0 (H). '
          'BF is 0..5 by party position in all groups (M semantic). '
          'C8..D7 contains four 4-byte tuples; C8..CB and CC..CF are equal in all saves. '
          'Values such as 0000:4EDE and 000F:4EF9 change between groups, consistent with serialized far pointers (M), '
          'not portable disk offsets. 7F..82 and 104..107 show similar tuples (M). '
          'C1..C6 = 91 A2 B3 C4 E6 F7 in every file; purpose unknown (H bytes). '
          'The 6-byte block 6D..72 also resembles stats/saving-throw thresholds; it is NOT proven to be the base ability block.\n')
    print('### Complete hex dumps: two characters\n')
    for name in ['CHRDATA1.SAV', 'CHRDATA2.SAV']:
        print(f'#### {name}\n')
        data = savs[name]
        table(['Offset', 'Hex', 'ASCII'], [(f'{i:03X}', hx(data[i:i+16]), ''.join(chr(x) if 32 <= x < 127 else '.' for x in data[i:i+16])) for i in range(0, len(data), 16)])
    print('### Every A→B / A→J byte change\n')
    for i in range(1, 7):
        for s in 'BJ':
            x, y = savs[f'CHRDATA{i}.SAV'], savs[f'CHRDAT{s}{i}.SAV']
            print(f'- A{i} → {s}{i}: ' + ', '.join(f'{j:03X}:{v:02X}→{w:02X}' for j, (v, w) in enumerate(zip(x, y)) if v != w))
    print('\n## Inventory .ITM: headerless 63-byte records\n')
    table(['Relative offset', 'Size', 'Type / name', 'Evidence', 'Confidence'], [
        ('00', 1, 'u8 display_length', '06 + Flail[space]; 0C + Banded Mail[2 spaces]; J1 second = 12 hex', 'H'),
        ('01', 30, 'char[30] display_storage', 'bytes beyond length retain old text; A5 says 11 Darts but J5 count is 8', 'H'),
        ('1F', 11, 'byte[11] unk_1F', 'zero in all records in supplied corpus', 'H'),
        ('2A', 4, 'byte[4] unk_2A; next-pointer candidate', 'A1 record0 = 0F 00 E1 4E = SAV D4..D7; last records zero', 'M'),
        ('2E', 1, 'u8 item_id_candidate', 'Flail 0C, darts 09, dagger 08, Banded Mail 39 across groups', 'M'),
        ('2F', 2, 'byte[2] unk_2F', 'Flail 00 00; Banded Mail 00 30; Leather 00 31', 'H'),
        ('31', 1, 'u8 item_id_copy_candidate', 'equals 2E throughout corpus', 'M'),
        ('32', 2, 'byte[2] unk_32', 'zero throughout corpus', 'H'),
        ('34', 1, 'u8 unk_34; identified/active flag candidate', 'mostly 01; unselected A6 darts = 00', 'L'),
        ('35', 2, 'byte[2] unk_35', 'zero throughout corpus', 'H'),
        ('37', 2, 'u16le weight_candidate', 'Flail 150, Banded 350, Splint 400, dagger 10, darts 5', 'M'),
        ('39', 1, 'u8 quantity_candidate', 'A5 0B vs J5 08 despite stale display; other darts 04; non-ammo 00', 'M'),
        ('3A', 2, 'u16le value_candidate', 'Flail 3, Banded 90, sword 30, dagger 2; matches display numeric suffix', 'M'),
        ('3C', 3, 'byte[3] unk_3C', 'zero throughout corpus', 'H')])
    print('The inventory display is a Pascal string[30] with stale backing storage, not three independent strings. '
          'Gold-piece value and weight units need shop/encumbrance code verification; signedness unknown.\n')
    table(['File:record (0 based)', 'Display prefix', 'Full 63-byte evidence'],
          [(f'{n}:{i//63}', repr(b[i+1:i+1+b[i]].decode('ascii')), hx(b[i:i+63])) for n, b in itms.items() for i in range(0, len(b), 63)])
    print('## Spell/effect .SPC: headerless 9-byte records\n')
    table(['Relative offset', 'Size', 'Name / type', 'Evidence', 'Confidence'], [
        ('00', 1, 'effect_id_candidate u8', 'A1 IDs 5A,61,1A,2F; A2 7C; A3 6B; every J appends 01', 'M'),
        ('01', 1, 'unk_01 byte', '00 except appended J record = 02', 'H'),
        ('02', 1, 'unk_02 byte', '00 in all records', 'H'),
        ('03', 1, 'unk_03 byte; duration/source candidate', 'FF for old records; 01 for appended J record', 'L'),
        ('04', 1, 'unk_04 byte', '00 in all records', 'H'),
        ('05', 4, 'unk_05 byte[4]; next-pointer candidate', 'terminal zero in A/B; J old tail points nonzero to appended node; low words differ', 'M')])
    print('Nine-byte stride H (all lengths divisible; repeated IDs and suffixes align). Semantics of spells vs effects unknown. '
          'Pointer hypothesis explains 05..08, but IDs and duration widths require code verification. '
          'SAV 100..103 may be separate spell data: it does not equal SPC record count (A1 has 4 records but byte 100 = 1).\n')
    table(['File:record', 'Full raw evidence'], [(f'{n}:{i//9}', hx(b[i:i+9])) for n, b in spcs.items() for i in range(0, len(b), 9)])
    print('## ITEMS: 2050-byte catalog, tentative stride only\n')
    print('Length H = 0x802 = 128*16+2. A 16-byte period is strongly visible (M): '
          '1621 equal byte pairs at distance 16 versus 1133 at distance 15 and 1130 at 17. '
          'This does NOT prove header size, record origin, count, index base, or whether the last two bytes are a trailer. '
          'No text names occur in the inspected periodic blocks. Do not conflate catalog rows with 63-byte inventory nodes. '
          'Provisional lossless partition below uses 128 blocks at 000..7FF plus two tail bytes; all semantics unknown. '
          'The alternative 2-byte header plus 128 records is not ruled out.\n')
    table(['Offset', 'Size', 'Name / type', 'Evidence', 'Confidence'], [
        ('000', 2048, 'unk_00 array[128] of byte[16] (provisional grouping)', 'full raw blocks below; observed period 16', 'M grouping / H bytes'),
        ('800', 2, 'unk_800 byte[2]', hx(blobs['ITEMS'][2048:]), 'H bytes / L trailer interpretation')])
    print('For each provisional block r, fields unk_00..unk_0F each have relative offset 00..0F, '
          'size 1, type byte, confidence H for raw bytes only. Evidence is the corresponding byte in row r below. '
          'Damage dice, flags, armor class, weight and value are NOT assigned from appearance alone.\n')
    table(['Block', 'Absolute offset', 'Bytes unk_00..unk_0F'], [(i, f'{i*16:03X}', hx(blobs['ITEMS'][i*16:i*16+16])) for i in range(128)])
    print('## SAVGAMA.DAT: 13137-byte opaque state image\n')
    g = blobs['SAVGAMA.DAT']
    print('Single sample: no differential state evidence. No full SAV record or Pascal name prefix from any supplied character '
          'occurs in this DAT (exact byte search, H). Absence does not prove the file has no encoded character information. '
          'At 1321..1334, alternating ASCII and zero bytes spell " GOBLINS. ", consistent with 16-bit character slots (M); '
          'it is not a proven Unicode encoding. Dense data begins at 1401 (H observation), possibly stale/runtime state (L). '
          'No map, coordinates, quest flags, party count, gold or XP field can be named defensibly from one file.\n')
    table(['Offset', 'Size', 'Name / type', 'Evidence', 'Confidence'], [('0000', len(g), 'unk_00 byte[13137]', 'SHA-256 above; nonzero spans below; entire file retained in read-only original', 'H extent / unknown semantics')])
    print('Nonzero spans below are separated by at least 16 zero bytes. Every omitted byte is zero (H); '
          'spans are inspection aids, not inferred engine records. Long spans show only their first 96 bytes.\n')
    groups = []
    for i, v in enumerate(g):
        if v:
            if not groups or i - groups[-1][-1] > 16:
                groups.append([])
            groups[-1].append(i)
    table(['Start', 'End inclusive', 'Extent', 'Raw prefix (max 96 bytes)'], [(f'{s[0]:04X}', f'{s[-1]:04X}', s[-1]-s[0]+1, hx(g[s[0]:min(s[-1]+1, s[0]+96)])) for s in groups])
    print('## Verification and remaining decode work\n')
    for i in range(1, 7):
        for s in 'ABJ':
            name = f'CHRDAT{s}{i}'
            assert savs[name+'.SAV'][0xc7] == len(itms.get(name+'.ITM', b'')) // 63
    assert all(g.find(b) == -1 and g.find(b[:b[0]+1]) == -1 for b in savs.values())
    print('Helper checks pass: 18 fixed-size SAV records; every ITM/SPC divides exactly into 63/9-byte records; '
          'C7 matches all inventory counts including missing B5; no supplied SAV/name prefix embedded in DAT. '
          'Hashes identify the original evidence. Needed next: file read/write routine sizes and pointer fixups; '
          'class/race enums; displayed gold/XP/HP cross-checks; ITEMS array origin and field use; '
          'controlled save differences for DAT. These gaps are explicit unknowns, not completed format decode.\n')


if __name__ == '__main__':
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT)
