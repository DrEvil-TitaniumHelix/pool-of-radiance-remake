"""Assemble decode/CROSSREF.md from decode/crossref/s[0-9]_*.md fragments."""
import glob, os
R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
head = """# CROSSREF — cross-area consistency (lane por-crossref)

Gate input (DECODE_GATE.md). Sections: 1 unit map, 2 routine names, 3 shared globals, 4 cross-area calls + main loop, 5 unknowns, 6 data <-> code.
Generated parts come from `decode/tools/crossref*.py` (fragments in `decode/crossref/`). Decisions and evidence are written inline. MAGIC and PARTY were still being finalised during this pass: their rows are marked pending and get refreshed by re-running the scripts.

"""
parts = [open(p, encoding="utf-8").read() for p in sorted(glob.glob(os.path.join(R, "decode/crossref/s[0-9]_*.md")))]
open(os.path.join(R, "decode/CROSSREF.md"), "w", encoding="utf-8").write(head + "\n\n".join(parts))
print(len(parts), "sections")
