"""Print random pseudocode statements of a <AREA>.pas.md part next to the asm at their `{ seg:off }` anchor.

Usage: python pseudo_check.py FILE.pas.md UNIT N [SEED]   (UNIT = listings name, e.g. ov13)
Used for the verifier's independent sample (the lane's own self-check is separate).
"""
import random, re, sys, os

R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
f, unit, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
seed = int(sys.argv[4]) if len(sys.argv) > 4 else 1
stm = [l.rstrip() for l in open(f, encoding="utf-8") if re.search(r"\{ *[0-9a-fA-F]{4}:[0-9a-fA-F]{4}", l)]
lst = [l.rstrip() for l in open(os.path.join(R, "decode/listings/%s.lst" % unit), encoding="latin-1")]
idx = {}
for i, l in enumerate(lst):
    m = re.match(r"^  ([0-9a-f]{4}:[0-9a-f]{4}) ", l)
    if m: idx[m.group(1)] = i
random.seed(seed)
for s in random.sample(stm, min(n, len(stm))):
    a = re.search(r"\{ *([0-9a-fA-F]{4}:[0-9a-fA-F]{4})", s).group(1).lower()
    print("=" * 100); print("PSEUDO:", s.strip()[:220])
    i = idx.get(a)
    if i is None:
        print("  (anchor not an instruction start in %s.lst)" % unit); continue
    for l in lst[max(0, i - 3):i + 7]: print("   ", l[:130])
