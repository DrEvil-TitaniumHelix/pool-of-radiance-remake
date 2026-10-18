"""Prepare inputs for the overlay-aware Ghidra project (PorBuild.java).

Usage: python ghidra_prep.py START.unpacked.exe GAME.OVR OUTDIR

Writes OUTDIR/resident.bin  load module, every overlay stub entry `CD 3F off 00` rewritten to
                            `EA off ovseg` (JMP FAR to the unit's routine at its analysis segment)
       OUTDIR/ovNN.bin      overlay unit NN code (fixups need no change: resident base = 0000)
       OUTDIR/layout.txt    one line per block, read by PorBuild.java:
            R <seg> <size> <name>                         resident segment (bytes from resident.bin)
            B <seg> <size> <name>                         uninitialised (stack)
            O <idx> <seg> <size> <stubseg> <e0,e1,...>    overlay unit
            E <seg:off> <name>                            seed entry point
"""
import os, re, struct, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tpovl

OVBASE, OVSTEP = 0x2000, 0x500
DS, SS, SP = 0x0C7C, 0x14F2, 0x4000
# resident unit segment starts (LAYOUT.md "Resident code segments"); stubs are separate segments
RES = [0x0000, 0x00BA, 0x03DA, 0x03ED, 0x03F1, 0x042B, 0x0464, 0x0709, 0x0802, 0x0899,
       0x08AE, 0x0A31, 0x0A32, 0x0A40, 0x0AA2, 0x0AF8]
RES_NAMES = {0x0000: "main", 0x0A32: "dos", 0x0A40: "crt", 0x0AA2: "overlay", 0x0AF8: "system"}


def main():
    exe, ovr, out = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    m, o, _, units, _ = tpovl.parse(exe, ovr)
    img = bytearray(m["lm"])
    lines = []
    stub_ranges = []
    for i, u in enumerate(units):
        seg = OVBASE + i * OVSTEP
        base = u["stub_seg"] * 16
        for k, e in enumerate(u["entries"]):
            q = base + 0x20 + 5 * k
            assert img[q:q + 2] == b"\xCD\x3F"
            img[q:q + 5] = b"\xEA" + struct.pack("<HH", e, seg)
        stub_ranges.append((u["stub_seg"], u["stub_size"]))
        open(os.path.join(out, "ov%02d.bin" % i), "wb").write(
            o[u["file_ofs"]:u["file_ofs"] + u["code_size"]])
    img_end = len(img) // 16
    img += bytes((SS - img_end) * 16)  # DS bss zero-filled so all DS data is one block at 0C7C
    open(os.path.join(out, "resident.bin"), "wb").write(img)
    # segment list: resident units + stub segments + DS
    starts = sorted(set(RES) | {s for s, _ in stub_ranges} | {DS})
    stubset = {s: i for i, (s, _) in enumerate(stub_ranges)}
    for j, s in enumerate(starts):
        e = starts[j + 1] if j + 1 < len(starts) else img_end
        if s == 0x0000:
            e = 0x0016  # main program; stub segs follow
        if s in stubset:
            name = "stub_ov%02d" % stubset[s]
            size = stub_ranges[stubset[s]][1]
        elif s == DS:
            name, size = "dseg", (SS - s) * 16
        else:
            name = "res_%04X" % s if s not in RES_NAMES else "%s_%04X" % (RES_NAMES[s], s)
            size = (e - s) * 16
        lines.append("R %04X %X %s" % (s, size, name))
    lines.append("B %04X %X %s" % (SS, SP, "stack"))
    for i, u in enumerate(units):
        lines.append("O %d %04X %X %04X %s" % (i, OVBASE + i * OVSTEP, u["code_size"], u["stub_seg"],
                                                ",".join("%X" % e for e in u["entries"])))
    lines.append("E 0000:0006 entry")
    # runtime routines from the verified RT ledger names map (frameless asm entries, callbacks)
    rtn = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "names", "rt_names.json")
    if os.path.exists(rtn):
        import json
        for a, n in sorted(json.load(open(rtn)).items()):
            lines.append("E %s %s" % (a, re.sub(r"[^A-Za-z0-9_]", "_", n)))
    open(os.path.join(out, "layout.txt"), "w", newline="\n").write("\n".join(lines) + "\n")
    print("\n".join(lines))


if __name__ == "__main__":
    main()
