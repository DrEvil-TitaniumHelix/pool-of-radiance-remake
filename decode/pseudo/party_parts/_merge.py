"""Merge decode/pseudo/party_parts/* into PARTY.pas.md, PARTY_SCREENS.md, decode/names/party_names.json."""
import json, os, sys
ROOT = ""
P = os.path.join(ROOT, "decode", "pseudo", "party_parts")
ORDER = ["ov00", "ov01", "ov02", "ov11", "ov16a", "ov16b", "ov17", "ov20", "ov21", "ov06", "ov12a", "ov12b"]
present = [u for u in ORDER if os.path.exists(os.path.join(P, u + ".pas.md"))]

def rd(n):
    p = os.path.join(P, n)
    return open(p, encoding="utf-8-sig").read().rstrip() + "\n" if os.path.exists(p) else ""

head = open(os.path.join(P, "_header.md"), encoding="utf-8").read().rstrip() + "\n"
body = [head]
for u in present:
    body.append("\n---\n\n" + rd(u + ".pas.md"))
body.append("\n---\n\n" + open(os.path.join(P, "_footer.md"), encoding="utf-8").read())
open(os.path.join(ROOT, "decode", "pseudo", "PARTY.pas.md"), "w", encoding="utf-8", newline="\n").write("".join(body))

scr = ["# PARTY screens (lane por-mod-party)\n\nIds `PARTY-<part>-nn`; per-part sources in `decode/pseudo/party_parts/*_SCREENS.md`.\n"]
for u in present:
    s = rd(u + "_SCREENS.md")
    if s:
        scr.append("\n---\n\n" + s)
open(os.path.join(ROOT, "decode", "pseudo", "PARTY_SCREENS.md"), "w", encoding="utf-8", newline="\n").write("".join(scr))

names = {}
for u in present:
    p = os.path.join(P, u + "_names.json")
    if os.path.exists(p):
        for k, v in json.load(open(p, encoding="utf-8-sig")).items():
            k = k.upper()
            if k in names and names[k] != v:
                print("CONFLICT", k, names[k], v)
            names[k] = v
json.dump(dict(sorted(names.items())), open(os.path.join(ROOT, "decode", "names", "party_names.json"), "w", encoding="utf-8", newline="\n"), indent=1)
print("parts:", present, "names:", len(names))
