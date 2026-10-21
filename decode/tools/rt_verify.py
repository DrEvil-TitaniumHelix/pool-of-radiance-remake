"""Mechanical verification of decode/rt/RT_LEDGER.md against the bytes (por-tooling, Opus verifier).

Usage: python rt_verify.py [--dis ADDR ...] [--near-table]
Checks per ledger row: 12-byte signature == image bytes; far-site count (MZ relocations + FBOV fixups whose
opcode at p-3 is 9A/EA, target = row address); near-site count (E8 rel16 inside the same runtime segment,
counted only at instruction starts of a linear Capstone sweep of the segment, then cross-checked by a raw scan).
--dis prints a Capstone disassembly of the routine(s) for semantic review.
"""
import collections, os, re, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tpovl
import capstone

R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
m, o, _, stubs, _ = tpovl.parse(os.path.join(R, "decode/bin/START.unpacked.exe"), os.path.join(R, "decode/bin/GAME.OVR"))
lm = m["lm"]
SEGS = {0xA32: 0xE0, 0xA40: 0x620, 0xAA2: 0x560, 0xAF8: 0x1840}
md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_16)


def rows():
    out = []
    for ln in open(os.path.join(R, "decode/rt/RT_LEDGER.md"), encoding="utf-8"):
        mm = re.match(r"\| (0A[0-9A-F]{2}:[0-9A-F]{4}) \| ([^|]+) \| ([^|]+) \| (H|M|L) \| (\d+) \| (\d+) \|", ln)
        if mm:
            out.append(dict(addr=mm.group(1), name=mm.group(2).strip(), ev=mm.group(3).strip(), conf=mm.group(4),
                            far=int(mm.group(5)), near=int(mm.group(6))))
    return out


def far_sites():
    refs = collections.defaultdict(list)
    blocks = [("resident", lm, [s * 16 + p for p, s in m["relocs"]])]
    for j, u in enumerate(stubs):
        blocks.append(("ov%02d" % j, o[u["file_ofs"]:u["file_ofs"] + u["code_size"]], u["fixups"]))
    for label, code, fix in blocks:
        for p in fix:
            if p >= 3 and code[p - 3] in (0x9A, 0xEA):
                ip, seg = struct.unpack_from("<HH", code, p - 2)
                if seg in SEGS:
                    refs["%04X:%04X" % (seg, ip)].append((label, p - 3, code[p - 3]))
    return refs


def near_sites():
    """E8 calls at instruction starts of a linear sweep, per runtime segment."""
    refs = collections.defaultdict(list)
    raw = collections.defaultdict(list)
    for seg, size in SEGS.items():
        code = lm[seg * 16:seg * 16 + size]
        for i in md.disasm(code, 0):
            if i.bytes[0] == 0xE8 and i.size == 3:
                t = (i.address + 3 + struct.unpack_from("<h", i.bytes, 1)[0]) & 0xFFFF
                refs["%04X:%04X" % (seg, t)].append(i.address)
        for p in range(size - 2):
            if code[p] == 0xE8:
                t = (p + 3 + struct.unpack_from("<h", code, p + 1)[0]) & 0xFFFF
                raw["%04X:%04X" % (seg, t)].append(p)
    return refs, raw


def dis(addr, n=60):
    seg, off = (int(x, 16) for x in addr.split(":"))
    code = lm[seg * 16:seg * 16 + SEGS[seg]]
    k = 0
    for i in md.disasm(code[off:], off):
        print("  %04X:%04X  %-16s %s %s" % (seg, i.address, i.bytes.hex(), i.mnemonic, i.op_str))
        k += 1
        if k >= n or i.mnemonic in ("retf", "iret") and k > 3:
            break


def main():
    if "--dis" in sys.argv:
        for a in sys.argv[sys.argv.index("--dis") + 1:]:
            print(a); dis(a, 80)
        return
    fs = far_sites()
    ns, raw = near_sites()
    bad = 0
    rs = rows()
    for r in rs:
        seg, off = (int(x, 16) for x in r["addr"].split(":"))
        sig = bytes.fromhex(r["ev"].split(";")[0].replace(" ", ""))
        real = lm[seg * 16 + off: seg * 16 + off + len(sig)]
        f = len(fs.get(r["addr"], [])); n = len(ns.get(r["addr"], []))
        nraw = len(raw.get(r["addr"], []))
        prob = []
        if sig != real: prob.append("SIG " + real.hex(" "))
        if f != r["far"]: prob.append("FAR %d" % f)
        if n != r["near"]: prob.append("NEAR %d (raw %d)" % (n, nraw))
        if prob:
            bad += 1
            print(r["addr"], r["name"], r["conf"], "ledger far/near %d/%d" % (r["far"], r["near"]), "; ".join(prob))
    print("rows %d, H %d, M %d, L %d, mismatching rows %d" % (len(rs), sum(r["conf"] == "H" for r in rs),
          sum(r["conf"] == "M" for r in rs), sum(r["conf"] == "L" for r in rs), bad))
    led = {r["addr"] for r in rs}
    print("far targets %d sites %d; far targets missing from ledger: %s" % (
        len(fs), sum(map(len, fs.values())), sorted(set(fs) - led)))
    print("far JMP (EA) sites:", sum(1 for v in fs.values() for x in v if x[2] == 0xEA))
    if "--near-table" in sys.argv:
        for a in sorted(ns):
            if a in led:
                print("| %s | %d | %s |" % (a, len(ns[a]), ", ".join("%04X" % x for x in sorted(ns[a]))))


if __name__ == "__main__":
    main()
