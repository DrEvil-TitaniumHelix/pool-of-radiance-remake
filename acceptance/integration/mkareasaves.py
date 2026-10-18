"""mkareasaves.py (por-build-qa) — one save per ECL block for RUN-3: a copy of the test-party save (slot C) placed in the block.

Usage: python -I acceptance/integration/mkareasaves.py   -> acceptance/integration/saves/ECL<n>_<rec>/ (+ areas.json)

SAVGAM<x>.DAT fields set (decode/data/SAVES.md §2; LoadGame 7500:1602 = party_ov17.js LoadGame):
  off 0              data set n                        (DS:5376)
  1 + 2*(49F2-4900)  Mem[49F2] = rec                   (ECL block resumed by ecl_GameLoop 2F00:32F8)
  1 + 2*(49C5-4900)  Mem[49C5] = map id                (+18Ah, Load3DMap in LoadGame)
  2049 + 624h        Mem6B00 .b[$624] = n              (LoadGame 7500:1bc1 takes the data set from here)
  5121 .. +1E00h     ECL code buffer = ECL<n>.DAX record rec minus its 2-byte header (LoadEclBlock skips them)
  12801..12805       x, y, facing 6 (W), passage 0, cell attribute of (x, y)
  12806              travel mode: 1 = 3D; blocks 19h/1Ah/1Bh = 2/3/4 (ecl_RunAfterNewBlock table)
  +3F4h..+3F8h      wall-set slot ids FFFFh (the test save's data-set-3 wall set does not exist in other data sets)
  Mem[49E7/49E8]     1 for the castle blocks 5_03/5_04/5_05 (as left by ECL5_06's init; LOAD_PIECES 2F00:0D39)
  12807              game_Mode 2 (as the shipped SAVGAMA: LoadGame returns into the game, not to the party menu)
The resumed block's init vector E runs LOAD_FILES / LOAD_PIECES itself, so the map / wall sets come from the script.
Start square: on the block's map (first LoadFiles(map=..) of the script, else the GEO record with the block's id, else the data set's first GEO record), the
attribute-0 square of the largest connected open region, nearest to its centre. Quest flags stay zero (fresh party).
The files contain bytes of the original game data: acceptance/integration/saves/ is git-ignored (never committed).
"""
import json, os, re, shutil, struct, collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'game', 'assets', 'saves', 'testparty')
OUT = os.path.join(ROOT, 'acceptance', 'integration', 'saves')
DAX = os.path.join(ROOT, 'decode', 'bin', 'dax')
SCRIPTS = os.path.join(ROOT, 'decode', 'ecl', 'scripts')


def geo(n, mid):
    p = os.path.join(DAX, 'GEO%d' % n, '%d.bin' % mid)
    return open(p, 'rb').read()[2:] if os.path.exists(p) else None


def start_square(g):
    def wall(x, y, d):
        i = y * 16 + x
        return [g[i] >> 4, g[i] & 15, g[256 + i] >> 4, g[256 + i] & 15][d]

    def open_(x, y, d):
        if wall(x, y, d) == 0:
            return True
        p = g[0x300 + y * 16 + x]
        return [p & 3, (p >> 2) & 3, (p >> 4) & 3, p >> 6][d] == 1
    D = [(0, -1), (1, 0), (0, 1), (-1, 0)]
    seen, best = set(), []
    for s in [(x, y) for y in range(16) for x in range(16)]:
        if s in seen:
            continue
        comp, q = [s], collections.deque([s])
        seen.add(s)
        while q:
            x, y = q.popleft()
            for d, (dx, dy) in enumerate(D):
                nx, ny = x + dx, y + dy
                if 0 <= nx < 16 and 0 <= ny < 16 and (nx, ny) not in seen and open_(x, y, d):
                    seen.add((nx, ny)); comp.append((nx, ny)); q.append((nx, ny))
        if len(comp) > len(best):
            best = comp
    cand = [c for c in best if g[0x200 + c[1] * 16 + c[0]] == 0] or best
    cx = sum(c[0] for c in best) / len(best); cy = sum(c[1] for c in best) / len(best)
    x, y = min(cand, key=lambda c: (c[0] - cx) ** 2 + (c[1] - cy) ** 2)
    return x, y, g[0x200 + y * 16 + x], len(best)


def main():
    sav = bytearray(open(os.path.join(SRC, 'SAVGAMC.DAT'), 'rb').read())
    areas = []
    for f in sorted(os.listdir(SCRIPTS)):
        m = re.fullmatch(r'ECL(\d)_(\d+)\.md', f)
        if not m:
            continue
        n, rec = int(m.group(1)), int(m.group(2))
        md = open(os.path.join(SCRIPTS, f), encoding='utf-8').read()
        title = md.splitlines()[0].split('—', 1)[-1].replace('(FINAL)', '').strip()
        lm = re.search(r'LoadFiles\(map=\$([0-9A-F]{4})', md)
        mid = int(lm.group(1), 16) if lm else rec
        g = None
        for cand in (mid, rec) + tuple(sorted(int(x[:-4]) for x in os.listdir(os.path.join(DAX, 'GEO%d' % n)))):
            g = geo(n, cand)
            if g:
                mid = cand       # a map id LoadGame's Load3DMap can load (scripts may pass FFh/7Fh = keep / overland)
                break
        b = bytearray(sav)
        b[0] = n
        struct.pack_into('<H', b, 1 + 2 * (0x49F2 - 0x4900), rec)
        struct.pack_into('<H', b, 1 + 2 * (0x49C5 - 0x4900), mid)
        b[2049 + 0x624] = n
        for k in range(3):       # wall-set slot ids +3F4h..+3F8h := FFFFh: LoadGame skips them (7500:1c63, Integer < 0);
            struct.pack_into('<H', b, 1 + 0x3F4 + 2 * k, 0xFFFF)   # the block's init vector LOAD_PIECES loads its own
        code = open(os.path.join(DAX, 'ECL%d' % n, '%d.bin' % rec), 'rb').read()[2:2 + 0x1E00]
        b[5121:5121 + 0x1E00] = code + bytes(0x1E00 - len(code))
        x = y = attr = 0; region = 0
        if g:
            x, y, attr, region = start_square(g)
        b[12801:12806] = bytes([x, y, 6, 0, attr])
        b[12806] = {0x19: 2, 0x1A: 3, 0x1B: 4}.get(rec, 1)
        b[12807] = 2
        if n == 5 and rec in (3, 4, 5):   # castle districts: LOAD_PIECES(24, 25, 1) needs Mem[49E7] = Mem[49E8] = 1 (slots 1 + 3
            for a in (0x49E7, 0x49E8):    # only, 2F00:0D39; WALLDEF5 has no record 25) — set by ECL5_06's init 9C5A/9C60
                struct.pack_into('<H', b, 1 + 2 * (a - 0x4900), 1)
        name = 'ECL%d_%02d' % (n, rec)
        d = os.path.join(OUT, name)
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'SAVGAMC.DAT'), 'wb').write(b)
        for fn in os.listdir(SRC):
            if fn.upper().startswith('CHRDATC'):
                shutil.copyfile(os.path.join(SRC, fn), os.path.join(d, fn))
        areas.append({'name': name, 'title': title, 'dataSet': n, 'block': rec, 'map': mid, 'geo': bool(g),
                      'start': [x, y, 'W'], 'attr': attr, 'region': region, 'travelMode': b[12806]})
    open(os.path.join(OUT, '.gitignore'), 'w').write('*\n')
    json.dump(areas, open(os.path.join(ROOT, 'acceptance', 'integration', 'RUN-3', 'areas.json'), 'w'), indent=1)
    for a in areas:
        print(a)


if __name__ == '__main__':
    main()
