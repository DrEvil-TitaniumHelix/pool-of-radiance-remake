"""gen_globals.py: decode/names/*_names.json (DS 0C7C globals) -> game/state/globals.json {"XXXX": "name"}.

Precedence when two lanes named the same address: engine, ecl, view, combat, magic, party (first wins); the
generic g_XXXX names of globals.json are not emitted (state.js aliases g_XXXX to the named property itself).
Usage: python -I tools/gen_globals.py
"""
import json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAMES = os.path.join(ROOT, 'decode', 'names')
ORDER = ['engine', 'ecl', 'view', 'combat', 'magic', 'party']

out = {}
for lane in ORDER:
    p = os.path.join(NAMES, lane + '_names.json')
    if not os.path.exists(p):
        continue
    for k, v in json.load(open(p, encoding='utf-8')).items():
        m = re.fullmatch(r'0C7C:([0-9A-Fa-f]{4})', k)
        if not m or re.fullmatch(r'g_[0-9A-Fa-f]{4}(_hi)?', v):
            continue
        a = m.group(1).upper()
        if a not in out and v not in out.values():
            out[a] = v
os.makedirs(os.path.join(ROOT, 'game', 'state'), exist_ok=True)
with open(os.path.join(ROOT, 'game', 'state', 'globals.json'), 'w', encoding='utf-8', newline='\n') as f:
    json.dump(dict(sorted(out.items())), f, indent=1)
print(len(out), 'named DS globals')
