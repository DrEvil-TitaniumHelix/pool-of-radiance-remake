"""Cross-area consistency data for decode/CROSSREF.md (lane por-crossref).

Usage: python crossref.py SECTION...   SECTION in units names globals calls unknowns data all
Writes decode/crossref/<section>.md fragments (assembled into decode/CROSSREF.md) and prints a summary.

Sources: decode/listings/functions.tsv (every routine: unit, addr, callers, callees), decode/pseudo/*.pas.md and
party_parts/*.pas.md (routine headers `### SEG:OFF Name (conf)`), decode/names/*.json (merged with the PorExport
rule: real name beats placeholder, later file wins), decode/globals_xref.tsv, decode/data/*.md.
"""
import collections, csv, glob, json, os, re, sys

R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
D = os.path.join(R, "decode")
OUT = os.path.join(D, "crossref")
PH = re.compile(r"^(g_[0-9A-Fa-f]{4}(_hi|_[0-9A-Fa-f]+)?|RT_[0-9A-Fa-f]{4}_[0-9A-Fa-f]{4}|FUN_.*|DAT_.*|LAB_.*|ov\d\d_[0-9A-F]{4}|ov\d\d_init|stub_.*)$")

# ---------------------------------------------------------------- base data
FUNCS = list(csv.DictReader(open(os.path.join(D, "listings/functions.tsv"), encoding="latin-1"), delimiter="\t"))
for f in FUNCS:
    f["key"] = f["addr"].upper()
UNIT_OF_SEG = {}
for f in FUNCS:
    UNIT_OF_SEG.setdefault(f["key"][:4], f["unit"])
UNITS = sorted({f["unit"] for f in FUNCS}, key=lambda u: (u.startswith("ov"), u))
NAME2UNIT = collections.defaultdict(set)
for f in FUNCS:
    NAME2UNIT[f["name"]].add(f["unit"])

AREA_FILES = {"ENGINE": "ENGINE.pas.md", "ECL": "ECL.pas.md", "VIEW": "VIEW.pas.md", "COMBAT": "COMBAT.pas.md",
              "MAGIC": "MAGIC.pas.md", "PARTY": "PARTY.pas.md"}
RUNTIME = {"system_0AF8": "RT_LEDGER.md (System)", "crt_0A40": "RT_LEDGER.md (Crt)", "dos_0A32": "RT_LEDGER.md (Dos)",
           "overlay_0AA2": "RT_LEDGER.md (Overlay)"}
HDR = re.compile(r"^#{2,4} +([0-9A-Fa-f]{4}):([0-9A-Fa-f]{4}) +([^\s(]+)(?: +\((H|M|L)\))?")


def pseudo_files():
    out = {}
    for a, fn in AREA_FILES.items():
        p = os.path.join(D, "pseudo", fn)
        if os.path.exists(p):
            out[a] = [p]
    if "PARTY" not in out:
        parts = sorted(glob.glob(os.path.join(D, "pseudo/party_parts/ov*.pas.md")))
        if parts:
            out["PARTY(parts)"] = parts
    return out


def headers():
    """area -> list of (addr, name, conf, file)"""
    res = collections.defaultdict(list)
    for a, files in pseudo_files().items():
        for p in files:
            for ln in open(p, encoding="utf-8", errors="replace"):
                # table-row documentation ("| ... | SEG:OFF | body |"): counts as covered (e.g. MAGIC spell handlers)
                if ln.startswith("|"):
                    for m3 in re.finditer(r"\|\s*`?([0-9A-Fa-f]{4}):([0-9A-Fa-f]{4})`?[^|]*\|", ln):
                        res[a].append(("%s:%s" % (m3.group(1).upper(), m3.group(2).upper()), "(table row)", "?", os.path.relpath(p, R)))
                m = HDR.match(ln)
                if m:
                    res[a].append(("%s:%s" % (m.group(1).upper(), m.group(2).upper()), m.group(3), m.group(4) or "?", os.path.relpath(p, R)))
                    # combined headers: "### A Name1 / B Name2 ..." or several "### X" on one line
                    for m2 in re.finditer(r"(?:/|\u00b7|###) *([0-9A-Fa-f]{4}):([0-9A-Fa-f]{4}) +([^\s(/\u00b7]+)(?: +\((H|M|L)\))?", ln[m.end():]):
                        res[a].append(("%s:%s" % (m2.group(1).upper(), m2.group(2).upper()), m2.group(3), m2.group(4) or m.group(4) or "?", os.path.relpath(p, R)))
    return res


def names_merged():
    """addr -> (name, file) with the PorExport precedence; also list of all (addr, name, file)."""
    allv = []
    merged = {}
    for f in sorted(glob.glob(os.path.join(D, "names/*.json"))):
        for k, v in json.load(open(f, encoding="utf-8")).items():
            k = k.upper().replace("DS:", "0C7C:")
            allv.append((k, v, os.path.basename(f)))
            old = merged.get(k)
            if old and PH.match(v) and not PH.match(old[0]):
                continue
            merged[k] = (v, os.path.basename(f))
    return merged, allv


def write(name, text):
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, name + ".md"), "w", encoding="utf-8").write(text)


# ---------------------------------------------------------------- 1. units
def sec_units():
    hd = headers()
    # table rows count only in segments where the same area also has ### routine headers
    for a in list(hd):
        segs = {addr[:4] for addr, n, c, p in hd[a] if n != "(table row)"}
        hd[a] = [x for x in hd[a] if x[1] != "(table row)" or x[0][:4] in segs]
    fcount = collections.Counter(f["unit"] for f in FUNCS)
    cov = collections.defaultdict(lambda: collections.defaultdict(set))
    for a, lst in hd.items():
        for addr, name, conf, p in lst:
            u = UNIT_OF_SEG.get(addr[:4])
            if u: cov[u][a].add(addr)
    rows = []
    for u in UNITS:
        if u == "stubs":
            rows.append((u, "—", "overlay stub segments (LAYOUT.md); thunks, no pseudocode", fcount[u], "")); continue
        if u in RUNTIME:
            rows.append((u, "RUNTIME", RUNTIME[u], fcount[u], "")); continue
        areas = cov.get(u, {})
        txt = "; ".join("%s %d/%d" % (a, len(s), fcount[u]) for a, s in sorted(areas.items()))
        rows.append((u, ",".join(sorted(areas)) or "NONE", txt, fcount[u], ""))
    return rows, hd


# ---------------------------------------------------------------- 2. names
def sec_names():
    hd = headers()
    merged, allv = names_merged()
    funcaddr = {f["key"] for f in FUNCS}
    # a) json conflicts between real names per address
    per = collections.defaultdict(set)
    for k, v, f in allv:
        if not PH.match(v): per[k].add((v, f))
    jconf = {k: s for k, s in per.items() if len({v for v, _ in s}) > 1}
    # b) header name vs published (merged) name
    hconf = []
    for a, lst in hd.items():
        for addr, name, conf, p in lst:
            pub = merged.get(addr)
            if pub and not PH.match(pub[0]) and pub[0] != name and not PH.match(name):
                hconf.append((addr, name, a, pub[0], pub[1]))
            if pub is None and not PH.match(name) and addr in funcaddr:
                hconf.append((addr, name, a, "(not in any names json)", "-"))
    # c) one name -> several addresses (routines only)
    byname = collections.defaultdict(set)
    for k, (v, f) in merged.items():
        if not k.startswith("0C7C") and not PH.match(v): byname[v].add(k)
    dup = {n: s for n, s in byname.items() if len(s) > 1}
    # d) stale placeholders in pseudo bodies where a real name exists
    stale = collections.Counter()
    ex = collections.defaultdict(set)
    seg2ov = {}
    for f in FUNCS:
        m = re.match(r"ov(\d\d)", f["unit"])
        if m: seg2ov[m.group(1)] = f["key"][:4]
    for a, files in pseudo_files().items():
        for p in files:
            t = open(p, encoding="utf-8", errors="replace").read()
            for m in re.finditer(r"\bFUN_([0-9a-fA-F]{4})_([0-9a-fA-F]{4})\b|\bov(\d\d)_([0-9A-Fa-f]{4})\b", t):
                if m.group(1): k = ("%s:%s" % (m.group(1), m.group(2))).upper()
                else:
                    s = seg2ov.get(m.group(3))
                    if not s: continue
                    k = ("%s:%s" % (s, m.group(4))).upper()
                pub = merged.get(k)
                if pub and not PH.match(pub[0]):
                    stale[(a, k, pub[0])] += 1
    return jconf, hconf, dup, stale, merged


# ---------------------------------------------------------------- area map helpers
def unit_area(hd=None):
    rows, hd = sec_units()
    ua = {}
    for u, areas, txt, n, _ in rows:
        a = areas.split(",")[0] if areas not in ("NONE", "—") else areas
        ua[u] = a
    return ua


# ---------------------------------------------------------------- 3. globals
def sec_globals(ua):
    xr = list(csv.DictReader(open(os.path.join(D, "globals_xref.tsv"), encoding="latin-1"), delimiter="\t"))
    by = collections.defaultdict(lambda: collections.defaultdict(lambda: [set(), set()]))
    name = {}
    for r in xr:
        off = r["ds_off"]; name[off] = r["name"]
        if int(off, 16) < 0x100 and r["kind"] != "direct":
            continue  # small [reg+disp] / immediates: record fields via pointers, not globals
        a = ua.get(r["unit"], r["unit"])
        if r["access"] in ("W", "RW"): by[off][a][1].add(r["function"])
        if r["access"] in ("R", "RW", "A"): by[off][a][0].add(r["function"])
    shared = {o: v for o, v in by.items() if len(v) >= 2}
    return shared, name


# ---------------------------------------------------------------- 4. calls
def sec_calls(ua):
    edges = collections.Counter()
    for f in FUNCS:
        if f["unit"] == "stubs": continue
        for c in f["callees"].split(","):
            c = c.strip()
            if not c: continue
            for u2 in NAME2UNIT.get(c, ()):
                if u2 != f["unit"] and u2 != "stubs":
                    edges[(f["unit"], u2)] += 1
    return edges


# ---------------------------------------------------------------- 5. unknowns
def sec_unknowns():
    files = []
    for a, fs in pseudo_files().items():
        for p in fs: files.append((a, p))
    for p in sorted(glob.glob(os.path.join(D, "data/*.md"))):
        files.append(("DATA", p))
    for p in [os.path.join(D, "ecl/ECL_VM.md")]:
        files.append(("ECL", p))
    rows = []
    for a, p in files:
        t = open(p, encoding="utf-8", errors="replace").read()
        fun = set(re.findall(r"\bFUN_[0-9a-fA-F]{4}_[0-9a-fA-F]{4}\b", t))
        ovn = set(re.findall(r"\bov\d\d_[0-9A-F]{4}\b", t))
        g = set(re.findall(r"\bg_[0-9A-F]{4}\b", t))
        unk = set(re.findall(r"\bunk_\w+", t)) | set(re.findall(r"\bUNKNOWN\w*", t))
        lconf = len(re.findall(r"^#{2,4} +[0-9A-Fa-f]{4}:[0-9A-Fa-f]{4} .*\(L\)", t, re.M))
        rows.append((a, os.path.relpath(p, R), len(fun), len(ovn), len(g), len(unk), lconf))
    return rows


if __name__ == "__main__":
    print("units", len(UNITS))
