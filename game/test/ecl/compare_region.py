"""Exact-RGB compare of one cell rectangle of a build shot with a DOSBox reference (both 320x200 native).
Usage: python -I game/test/ecl/compare_region.py REF.png BUILD.png col1 row1 col2 row2   (text cells, inclusive)
M2: ECL-02 text window = acceptance/ref/ECL-02.native.png acceptance/out/ECL-02-TEXT.png 1 17 38 22"""
import sys
from PIL import Image
ref, out = (Image.open(p).convert('RGB') for p in sys.argv[1:3])
assert ref.size == out.size == (320, 200), (ref.size, out.size)
c1, r1, c2, r2 = map(int, sys.argv[3:7])
a, b = ref.load(), out.load()
cells = [(x, y) for y in range(r1 * 8, r2 * 8 + 8) for x in range(c1 * 8, c2 * 8 + 8)]
bad = sum(1 for x, y in cells if a[x, y] != b[x, y])
print('%d / %d pixels differ in cells (%d,%d)-(%d,%d)' % (bad, len(cells), c1, r1, c2, r2))
sys.exit(1 if bad else 0)
