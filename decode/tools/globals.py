"""DS (0C7C) globals cross-reference from the Ghidra listings (por-tooling).

Usage: python globals.py            -> decode/GLOBALS.md, decode/names/globals.json, decode/globals_xref.tsv

Reference kinds (parsed from decode/listings/*.lst, Ghidra x86 real mode, DS context = 0C7C):
  direct   [0xN] with no segment override (DS default)                         conf H
  indexed  [BX|SI|DI + 0xN] with no override and no BP (DS default): array base  conf M
  addr     MOV r16,0xN adjacent (+-2 instr) to PUSH DS: address of a global
           passed as var/pointer argument (TP `push ds; push di`)                  conf M
Functions that load DS themselves (MOV DS,/LDS) are flagged: their refs may not be DS 0C7C (conf L).
Access: W = MOV-type store, RW = read-modify-write, R = read (incl. CMP/TEST/PUSH/LES/LDS), A = address taken.
"""
import collections, glob, json, os, re, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mz

R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DS, DSEND, INIT = 0x0C7C, 0x8760, 0x4430   # dseg size (SS-DS)*16; initialised part from the image
lm = mz.load(os.path.join(R, "decode/bin/START.unpacked.exe"))["lm"]
dsimg = lm[DS * 16:DS * 16 + INIT]

# names with byte evidence (System/Crt/Overlay variables, verified in decode/rt/RT_LEDGER.md pass)
EVID = {
    0x43EE: ("OvrHeapSize", "System.Init adds it to OvrHeapOrg for the initial heap start; OvrSetBuf minimum", "M"),
    0x43F4: ("OvrHeapOrg", "System.Init: SS+stack paras -> 43F4/43F6; OvrGetBuf = [43F8]-[43F4]", "H"),
    0x43F6: ("OvrHeapPtr", "System.Init sets = OvrHeapOrg", "M"),
    0x43F8: ("OvrHeapEnd", "OvrGetBuf = [43F8]-[43F4]; OvrSetBuf stores new end", "H"),
    0x43FA: ("OvrLoadList", "OvrSetBuf refuses if <>0; Halt walks the list via ES:[14h]", "M"),
    0x43FC: ("OvrDosHandle", "OvrInit stores the DOS handle of the opened overlay file", "H"),
    0x4400: ("HeapOrg", "far ptr (seg at 4402 set by System.Init / OvrSetBuf)", "H"),
    0x4404: ("HeapPtr", "far ptr (seg 4406); MemAvail subtracts it from HeapEnd", "H"),
    0x4408: ("HeapEnd", "far ptr; seg 440A = PSP:[2] memory top (System.Init)", "H"),
    0x440C: ("FreeList", "far ptr; MemAvail/MaxAvail walkers LDS SI,[440C]", "H"),
    0x4414: ("HeapError", "far proc ptr; System.Init stores CS:00A9", "H"),
    0x4418: ("ExitProc", "far proc ptr; Halt tail calls and clears it", "H"),
    0x441C: ("ExitCode", "Halt stores AX", "H"),
    0x441E: ("ErrorAddr", "far ptr; RunError/Halt store CX:BX", "H"),
    0x4422: ("PrefixSeg", "System.Init stores ES (PSP) at entry", "H"),
    0x4426: ("InOutRes", "IOResult XCHG with 0; @IOCheck tests it", "H"),
    0x4428: ("RandSeed", "LongInt; Randomize (AH=2C) and @NextRandom LCG", "H"),
    0x442C: ("FileMode", "byte; ResetFile uses it as AL for AH=3D", "H"),
    0x8501: ("Crt_ScanCode", "Crt.ReadKey buffered extended scan code; KeyPressed tests it", "H"),
    0x8508: ("Input", "TextRec (256 B); System.Init Assign/Reset, Crt.Init AssignCrt", "H"),
    0x8608: ("Output", "TextRec (256 B); System.Init Assign/Rewrite, Crt.Init AssignCrt", "H"),
    0x8708: ("SaveIntTable", "19 saved interrupt vectors (System.Init INT21 AH=35 loop)", "H"),
}

EVSIZE = {0x4400: 4, 0x4404: 4, 0x4408: 4, 0x440C: 4, 0x4414: 4, 0x4418: 4, 0x441E: 4, 0x4428: 4,
          0x8508: 256, 0x8608: 256, 0x8708: 76}

WRITE = {"MOV", "POP", "STOSB", "STOSW"}
RMW = {"ADD", "SUB", "INC", "DEC", "OR", "AND", "XOR", "ADC", "SBB", "NEG", "NOT", "SHL", "SHR", "SAR",
       "RCL", "RCR", "ROL", "ROR", "XCHG"}
LINE = re.compile(r"^  ([0-9a-f]{4}):([0-9a-f]{4})  ([0-9a-f]+)\s+(\S+)\s*([^;]*?)\s*(?:;.*)?$")


def split_ops(s):
    out, depth, cur = [], 0, ""
    for c in s:
        if c == "[": depth += 1
        if c == "]": depth -= 1
        if c == "," and depth == 0:
            out.append(cur.strip()); cur = ""
        else:
            cur += c
    if cur.strip(): out.append(cur.strip())
    return out


def parse():
    refs = []   # (off, kind, size, access, unit, func, addr, text)
    dsfuncs = set()
    for f in sorted(glob.glob(os.path.join(R, "decode/listings/*.lst"))):
        unit = os.path.basename(f)[:-4]
        if unit == "stubs": continue
        func = None; ins = []
        for ln in open(f, encoding="latin-1"):
            if ln.startswith(";==== "):
                func = ln.split()[1]; continue
            m = LINE.match(ln.rstrip("\n"))
            if m: ins.append((func, m.group(1) + ":" + m.group(2), m.group(4), m.group(5)))
        for k, (fn, ad, mn, ops) in enumerate(ins):
            if mn == "LDS":
                dsfuncs.add((unit, fn))
            elif mn == "MOV" and ops.startswith("DS,"):
                reg = ops.split(",")[1].strip()
                prev = [ins[j][2] + " " + ins[j][3] for j in range(max(0, k - 3), k)]
                if ("MOV %s,0xc7c" % reg) not in prev:
                    dsfuncs.add((unit, fn))
        for k, (fn, ad, mn, ops) in enumerate(ins):
            ol = split_ops(ops)
            for i, op in enumerate(ol):
                if "[" not in op: continue
                if re.search(r"\b(ES|SS|CS):", op) or "BP" in op: continue
                inner = op[op.index("[") + 1:op.rindex("]")]
                nums = re.findall(r"0x([0-9a-f]+)", inner)
                regs = re.findall(r"\b(BX|SI|DI)\b", inner)
                if not nums: continue
                off = int(nums[0], 16)
                if "-" in inner or off >= DSEND: continue
                kind = "indexed" if regs else "direct"
                size = {"byte": 1, "word": 2, "dword": 4}.get(op.split()[0], 0)
                if mn in ("LES", "LDS"): size = 4
                if i == 0 and mn in WRITE: acc = "W"
                elif i == 0 and mn in RMW: acc = "RW"
                else: acc = "R"
                if mn == "XCHG": acc = "RW"
                refs.append((off, kind, size, acc, unit, fn, ad, mn + " " + ops))
            # address-taken: MOV r16,imm next to PUSH DS
            if mn == "MOV" and len(ol) == 2 and ol[0] in ("AX", "BX", "CX", "DX", "SI", "DI") and re.fullmatch(r"0x[0-9a-f]+", ol[1]):
                v = int(ol[1], 16)
                near = [ins[j][2] + " " + ins[j][3] for j in range(max(0, k - 2), min(len(ins), k + 3)) if j != k]
                if 0x40 <= v < DSEND and v != DS and "PUSH DS" in [x.strip() for x in near]:
                    refs.append((v, "addr", 0, "A", unit, fn, ad, mn + " " + ops))
    return refs, dsfuncs


def pstr(off):
    if off >= INIT: return None
    n = dsimg[off]
    if 2 <= n and off + 1 + n <= INIT and all(32 <= c < 127 for c in dsimg[off + 1:off + 1 + n]):
        return dsimg[off + 1:off + 1 + n].decode()
    return None


PH = re.compile(r"^(g_[0-9A-Fa-f]{4}(_hi|_[0-9A-Fa-f]+)?|RT_[0-9A-Fa-f]{4}_[0-9A-Fa-f]{4}|FUN_.*|DAT_.*|LAB_.*)$")


def lane_names():
    """Real DS names from other decode/names/*.json files (same precedence as PorExport: later file wins)."""
    out = {}
    for f in sorted(glob.glob(os.path.join(R, "decode/names/*.json"))):
        if os.path.basename(f) == "globals.json": continue
        for k, v in json.load(open(f)).items():
            if k.upper().startswith("0C7C:") and not PH.match(v):
                out[int(k[5:], 16)] = (v, os.path.basename(f))
    return out


def main():
    refs, dsfuncs = parse()
    lanes = lane_names()
    by = collections.defaultdict(list)
    for r in refs:
        by[r[0]].append(r)
    offs = sorted(by)
    names = {}
    rows = []
    parent = None  # (off, size, name) of the last row that has a known extent
    for j, off in enumerate(offs):
        rs = by[off]
        nxt = offs[j + 1] if j + 1 < len(offs) else DSEND
        sizes = collections.Counter(r[2] for r in rs if r[2])
        kinds = collections.Counter(r[1] for r in rs)
        ds_only = all((r[4], r[5]) in dsfuncs for r in rs)
        size = max(sizes) if sizes else 0
        inside = parent and parent[0] < off < parent[0] + parent[1] and off not in EVID
        if off in EVID:
            name, ev, conf = EVID[off]
        elif inside:
            d = off - parent[0]
            name = "%s_%s" % (parent[2], "hi" if parent[1] == 4 and d == 2 else "%X" % d)
            ev, conf = "inside %s (+%Xh)" % (parent[2], d), ("L" if ds_only else ("H" if kinds.get("direct") else "M"))
        else:
            name, ev, conf = "g_%04X" % off, "", ("L" if ds_only else ("H" if kinds.get("direct") else "M"))
            if off < 0x100 and not kinds.get("direct"):
                conf, ev = "L", "small displacement without a direct reference: probably a record field via a DS pointer"
        # type guess
        init = None
        ps = pstr(off)
        if kinds.get("indexed") and not kinds.get("direct"):
            t = "array (elem %s B?)" % (size or "?")
        elif size == 4 and any(r[7].startswith(("LES", "LDS")) for r in rs):
            t = "far pointer"
        elif ps is not None and kinds.get("addr"):
            t = "string[%d] (Pascal)" % dsimg[off]
        elif kinds.get("addr") and not size:
            t = "var/record (address taken)"
        else:
            t = {1: "byte", 2: "word", 4: "dword"}.get(size, "?")
        if off < INIT:
            n = max(1, min(size or (len(ps) + 1 if ps else 2), 8))
            init = dsimg[off:off + n].hex(" ")
            if ps: init = "'%s'" % ps[:40]
        else:
            init = "bss"
        span = nxt - off
        ext = EVSIZE.get(off) or (4 if t == "far pointer" or size == 4 else 0)
        if not inside and ext:
            parent = (off, ext, name)
        units = collections.defaultdict(lambda: [set(), set()])
        for r in rs:
            u = units[r[4]]
            if r[3] in ("W", "RW"): u[1].add(r[5])
            if r[3] in ("R", "RW", "A"): u[0].add(r[5])
        names["%04X:%04X" % (DS, off)] = name   # globals.json keeps the placeholder/evidence name
        if off in lanes and off not in EVID:
            name = lanes[off][0]
            ev = ("%s; " % ev if ev else "") + "name from " + lanes[off][1]
        rows.append(dict(off=off, name=name, t=t, size=size, span=span, init=init, conf=conf, ev=ev,
                         nref=len(rs), kinds=kinds, units=units, ds_only=ds_only))
    # lane-named offsets without a static code reference (tables reached via a computed base)
    for off, (nm, src) in sorted(lanes.items()):
        if off in by or off >= DSEND: continue
        init = ("'%s'" % pstr(off)[:40]) if pstr(off) else (dsimg[off:off + 8].hex(" ") if off < INIT else "bss")
        rows.append(dict(off=off, name=nm, t="(named, no direct ref)", size=0, span=0, init=init, conf="M",
                         ev="name from %s; no static operand references it (computed address)" % src,
                         nref=0, kinds=collections.Counter(), units={}, ds_only=False))
    rows.sort(key=lambda r: r["off"])
    # outputs
    json.dump(names, open(os.path.join(R, "decode/names/globals.json"), "w"), indent=1, sort_keys=True)
    disp = {r["off"]: r["name"] for r in rows}
    with open(os.path.join(R, "decode/globals_xref.tsv"), "w", newline="\n") as f:
        f.write("ds_off\tname\tkind\tsize\taccess\tunit\tfunction\taddr\tinstruction\n")
        for r in sorted(refs):
            f.write("%04X\t%s\t%s\t%d\t%s\t%s\t%s\t%s\t%s\n" % (r[0], disp[r[0]], r[1], r[2], r[3], r[4], r[5], r[6], r[7]))
    nunits = collections.Counter()
    for row in rows:
        nunits[len(row["units"])] += 1
    md = ["# GLOBALS — DS 0C7C cross-reference (generated by decode/tools/globals.py; regenerate, do not edit)", "",
          "The CROSSREF base for every module lane. Source: Ghidra listings (`decode/listings/*.lst`), DS context 0C7C on all code.",
          "One row per DS offset referenced by code. **Kinds:** `direct` = `[0xN]` operand (H); `indexed` = `[BX/SI/DI+0xN]` (DS default), i.e. an array/table base (M); `addr` = `MOV r,0xN` next to `PUSH DS`, i.e. address passed as a var/pointer argument (M).",
          "**Type** is a guess from operand sizes and kinds. **Span** = distance to the next referenced offset (an upper bound on the size). **Init** = image bytes for offsets < 4430h (typed constants / initialised data); `bss` = zero-filled at start. The range 4430..8760 is BSS.",
          "**Names:** evidence names for TP System/Crt/Overlay variables (RT_LEDGER pass); real names from lane files (`decode/names/<lane>_names.json`, noted in the last column); otherwise `g_XXXX`. Module lanes: put evidence-backed names in `decode/names/<lane>_names.json` (key `0C7C:XXXX`); later files override `globals.json` on export. Cite the evidence in your pseudo file.",
          "Per-reference detail (instruction, address, access) is in `decode/globals_xref.tsv`. Reader/writer lists: `unit: functions`. **R** = read/address taken, **W** = written.",
          "Refs inside functions that load DS themselves (System/Crt/Dos helpers) may not be DS 0C7C; such rows have conf L and are marked `dsswitch`.", "",
          "Totals: %d DS offsets, %d references; %d evidence-named; offsets used by >= 2 units: %d." % (
              len(rows), len(refs), sum(1 for r in rows if r["off"] in EVID), sum(v for k, v in nunits.items() if k >= 2)), "",
          "| DS off | name | type | size | span | init | conf | kinds | refs | readers | writers | evidence/notes |",
          "|---|---|---|---|---|---|---|---|---|---|---|---|"]

    def fl(units, i):
        return "; ".join("%s: %s" % (u, ", ".join(sorted(v[i]))) for u, v in sorted(units.items()) if v[i]).replace("|", "/")
    for r in rows:
        md.append("| %04X | %s | %s | %s | %X | %s | %s | %s | %d | %s | %s | %s |" % (
            r["off"], r["name"], r["t"], r["size"] or "", r["span"], r["init"].replace("|", "/"), r["conf"],
            ",".join("%s%d" % (k, v) for k, v in sorted(r["kinds"].items())), r["nref"], fl(r["units"], 0), fl(r["units"], 1),
            (r["ev"] + (" dsswitch" if r["ds_only"] and r["off"] not in EVID and not r["ev"].startswith("inside") else "")).strip()))
    open(os.path.join(R, "decode/GLOBALS.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print("offsets %d refs %d evid %d multiunit %d dsswitch-only %d" % (
        len(rows), len(refs), sum(1 for r in rows if r["off"] in EVID), sum(v for k, v in nunits.items() if k >= 2),
        sum(1 for r in rows if r["ds_only"])))
    print(collections.Counter(r[1] for r in refs))


if __name__ == "__main__":
    main()
