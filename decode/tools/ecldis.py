"""ecldis.py — Pool of Radiance ECL (event script) disassembler. Owner: por-ecl.

Spec: decode/ecl/ECL_VM.md (every rule below cites the engine routine it comes from).

Usage:
  ecldis.py FILE.bin [--n N --rec R]         disassemble one extracted ECL record (decode/bin/dax/ECLn/R.bin)
  ecldis.py --all [--dax DIR] [--out DIR]     all records of ECL1..8.DAX -> decode/ecl/listings/, prints usage table
  ecldis.py --stats                           opcode usage table only (markdown)

Record -> VM memory (LoadEclBlock 4300:0341): the first 2 bytes of the record are skipped, the rest is copied
to the code buffer, which the VM addresses as 0x9900 + offset (ecl_Run 2F00:3171: byte at CodeBuf[PC-9900h]).
"""
import os, sys, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, "decode", "tools"))
BASE = 0x9900

# opcode -> (mnemonic, fixed operand count, variable-count rule)
# fixed count = the ReadOperands(n) call at the start of each handler (ov03, ECL_VM.md section 4).
# var rule: ('count_in', k) = after the k fixed operands, PC is backed up by one byte and the value of
# operand k more operands are read (handlers 15, 25/26, 2B: "dec ecl_PC ; ReadOperands(OperandValue(k))").
OPS = {
    0x00: ("EXIT", 0), 0x01: ("GOTO", 1), 0x02: ("GOSUB", 1), 0x03: ("COMPARE", 2),
    0x04: ("ADD", 3), 0x05: ("SUBTRACT", 3), 0x06: ("DIVIDE", 3), 0x07: ("MULTIPLY", 3),
    0x08: ("RANDOM", 2), 0x09: ("SAVE", 2), 0x0A: ("LOAD_CHARACTER", 1), 0x0B: ("LOAD_MONSTER", 3),
    0x0C: ("SETUP_MONSTER", 3), 0x0D: ("APPROACH", 0), 0x0E: ("PICTURE", 1), 0x0F: ("INPUT_NUMBER", 2),
    0x10: ("INPUT_STRING", 2), 0x11: ("PRINT", 1), 0x12: ("PRINTCLEAR", 1), 0x13: ("RETURN", 0),
    0x14: ("COMPARE_AND", 4), 0x15: ("VERTICAL_MENU", 3), 0x16: ("IF_EQ", 0), 0x17: ("IF_NE", 0),
    0x18: ("IF_LT", 0), 0x19: ("IF_GT", 0), 0x1A: ("IF_LE", 0), 0x1B: ("IF_GE", 0),
    0x1C: ("CLEAR_MONSTERS", 0), 0x1D: ("PARTY_STRENGTH", 1), 0x1E: ("CHECK_PARTY", 6),
    0x20: ("NEW_ECL", 1), 0x21: ("LOAD_FILES", 3), 0x22: ("PARTY_SURPRISE", 2), 0x23: ("SURPRISE", 4),
    0x24: ("COMBAT", 0), 0x25: ("ON_GOTO", 2), 0x26: ("ON_GOSUB", 2), 0x27: ("TREASURE", 8),
    0x28: ("ROB", 3), 0x29: ("ENCOUNTER_MENU", 14), 0x2A: ("GET_TABLE", 3), 0x2B: ("HORIZONTAL_MENU", 2),
    0x2C: ("PARLAY", 6), 0x2D: ("CALL", 1), 0x2E: ("DAMAGE", 5), 0x2F: ("AND", 3), 0x30: ("OR", 3),
    0x31: ("SPRITE_OFF", 0), 0x32: ("FIND_ITEM", 1), 0x33: ("PRINT_RETURN", 0), 0x34: ("ECL_CLOCK", 1),
    0x35: ("SAVE_TABLE", 3), 0x36: ("ADD_NPC", 2), 0x37: ("LOAD_PIECES", 3), 0x38: ("PROGRAM", 1),
    0x39: ("WHO", 1), 0x3A: ("DELAY", 0), 0x3B: ("SPELL", 3), 0x3C: ("PRINT_MEM", 1), 0x3D: ("CLEAR_BOX", 0),
}
VARCOUNT = {0x15: 3, 0x25: 2, 0x26: 2, 0x2B: 2}   # opcode -> index of the operand holding the extra count
# IF-skip operand counts (ecl_SkipInstruction 4300:1EA6) where they differ from the handler's real count
SKIPCOUNT = {0x0C: 2, 0x15: 0, 0x1F: 2, 0x25: 0, 0x26: 0, 0x2B: 0, 0x36: 1}
ENDS = {0x00, 0x01, 0x13, 0x20, 0x25}   # no fall-through (EXIT, GOTO, RETURN, NEW_ECL, ON_GOTO falls through only if no match)


def six_bit_char(v):
    """ecl_SixBitChar 4300:06D3: v < 20h -> v + 40h, else v."""
    return chr(v + 0x40) if v < 0x20 else chr(v)


def unpack_string(data):
    """ecl_UnpackString 4300:1153: 3 bytes -> 4 six-bit codes, MSB first; code 0 is dropped."""
    out = []
    phase, cur, prev, i = 1, 0, 0, 0
    n = len(data)
    while i < n:
        if phase < 4:
            prev, cur = cur, data[i]
            i += 1
        if phase == 1:
            c = cur >> 2
        elif phase == 2:
            c = (((prev << 6) & 0xFF) + (cur >> 2) & 0xFF) >> 2
        elif phase == 3:
            c = (((prev << 4) & 0xFF) + (cur >> 4) & 0xFF) >> 2
        else:
            c = cur & 0x3F
        phase = phase + 1 if phase < 4 else 1
        if c:
            out.append(six_bit_char(c))
    if phase == 4 and (cur & 0x3F):
        out.append(six_bit_char(cur & 0x3F))
    return "".join(out)


# known VM addresses (ECL_VM.md section 3) -> comment text in listings
ADDR_NOTES = {
    0xC04B: "party X", 0xC04C: "party Y", 0xC04D: "facing/2", 0xC04E: "wall type ahead", 0xC04F: "cell attribute",
    0xC059: "DS:6F68", 0xC05F: "DS:6F69", 0x033D: "facing", 0x035F: "undefined read", 0x03DE: "sound selector DS:84CC",
    0x00B1: "DS:6F6E", 0x00FB: "DS:6F6A", 0x00FC: "DS:6F6C", 0x00B8: "DS:84CE", 0x00B9: "DS:84D0",
    0x49E6: "3D-area flag", 0x49C5: "3D map id", 0x49F2: "previous ECL block", 0x6E12: "data set (ECLn digit)",
    0x6DC0: "encounter distance", 0x6DC1: "encounter distance (actual)", 0x6DCB: "SURPRISE result",
    0x6DE1: "3D sprite id (FF = full picture)", 0x6DE2: "COMBAT->temple flag", 0x6E6C: "COMBAT->shop flag",
    0x6E22: "wall set slot 1 load", 0x6E24: "wall set slot 2 load", 0x6E26: "wall set slot 3 load",
    0x6E3E: "party member count", 0x6B00: "selected char name", 0x6C00: "char active/status", 0x6C1B: "char move",
    0x6BB8: "char NPC flags", 0x6BBB: "char copper", 0x6BBD: "char silver", 0x6BBF: "char electrum",
    0x6BC1: "char gold", 0x6BC3: "char platinum", 0x6BD8: "char alignment", 0x6DB1: "char party index",
    0x6DB4: "char party index", 0x6DCF: "char reaction bonus (CHA)",
}
for _i in range(7):
    ADDR_NOTES[0x49C6 + _i] = "game clock[%d]" % _i
CALL_NOTES = {0x2C90: "update cell attr + redraw", 0x8000: "ov07_1A6F(1)", 0x8001: "ov07_1A6F(0)",
              0xBA03: "sound by DS:84CC", 0xC01E: "step forward", 0xC018: "wall type ahead"}


class Operand:
    __slots__ = ("type", "lo", "hi", "text", "size")

    def __init__(self, t, lo, hi=None, text=None, size=2):
        self.type, self.lo, self.hi, self.text, self.size = t, lo, hi, text, size

    @property
    def word(self):
        return (self.hi or 0) * 256 + self.lo

    def fmt(self, names=None):
        t = self.type
        if t == 0x00:
            return "#%02X" % self.lo
        if t in (0x01, 0x03):
            return "[%04X]%s" % (self.word, ("" if t == 1 else "'"))
        if t == 0x02:
            return "#%04X" % self.word
        if t == 0x80:
            return '"%s"' % self.text
        if t == 0x81:
            return "$[%04X]" % self.word
        return "?t%02X:%02X" % (t, self.lo)


def read_operands(code, pc, n):
    """ecl_ReadOperands 4300:0000. pc = address of the opcode (or the byte before the first operand).
    Returns (operands, new_pc) where new_pc = address after the last operand."""
    ops = []
    for _ in range(n):
        t = code.get(pc + 1)
        lo = code.get(pc + 2)
        if t is None or lo is None:
            raise IndexError("operand past end at %04X" % pc)
        pc += 2
        if t in (1, 2, 3):
            pc += 1
            ops.append(Operand(t, lo, code[pc], size=3))
        elif t == 0x80:
            data = bytes(code[pc + 1 + k] for k in range(lo))
            pc += lo
            ops.append(Operand(t, lo, text=unpack_string(data), size=2 + lo))
        elif t == 0x81:
            pc += 1
            ops.append(Operand(t, lo, code[pc], size=3))
        else:
            ops.append(Operand(t, lo))
    return ops, pc + 1


class Code(dict):
    pass


def load(path):
    raw = open(path, "rb").read()
    code = Code()
    for i, b in enumerate(raw[2:]):
        code[BASE + i] = b
    code.hdr = raw[:2]
    code.end = BASE + len(raw) - 2
    return code


def decode_at(code, pc):
    op = code[pc]
    if op not in OPS:
        return op, None, [], pc + 1
    name, n = OPS[op]
    ops, npc = read_operands(code, pc, n)
    if op in VARCOUNT:
        k = VARCOUNT[op]
        cnt = ops[k - 1].lo if ops[k - 1].type in (0, 2) else None
        if cnt is None:
            return op, name, ops, npc   # count from memory: cannot follow statically
        more, npc = read_operands(code, npc - 1, cnt)
        ops += more
    return op, name, ops, npc


def header(code):
    vec = []
    pc = BASE
    for _ in range(5):
        ops, pc = read_operands(code, pc, 1)
        vec.append(ops[0].word)
    return vec


# operand index (1-based) that is the base address of an in-script data table
TABLE_OPERAND = {0x2A: 1, 0x35: 2, 0x3C: 1}


def trace(code):
    """Recursive traversal from the five header vectors (ecl_InitVM 4300:01B6), repeated until the set
    of data-table addresses (GET_TABLE/SAVE_TABLE/PRINT_MEM bases) is stable; traversal stops there."""
    data = set()
    while True:
        vec, insns, labels = _trace(code, data)
        nd = set()
        for op, name, ops, npc in insns.values():
            k = TABLE_OPERAND.get(op)
            if k and len(ops) >= k and ops[k - 1].type in (1, 2, 3) and ops[k - 1].word >= BASE:
                nd.add(ops[k - 1].word)
        if nd <= data:
            code.data = data
            return vec, insns, labels
        data |= nd


def _trace(code, data):
    vec = header(code)
    insns, todo, labels = {}, list(vec), set(vec)
    while todo:
        pc = todo.pop()
        while BASE + 20 <= pc < code.end and pc not in insns and pc not in data:
            try:
                op, name, ops, npc = decode_at(code, pc)
            except (IndexError, KeyError):
                break
            insns[pc] = (op, name, ops, npc)
            if name is None:
                break
            if op in (0x01, 0x02):
                if ops[0].type in (1, 2, 3):
                    labels.add(ops[0].word); todo.append(ops[0].word)
            if op in (0x25, 0x26):
                for o in ops[2:]:
                    labels.add(o.word); todo.append(o.word)
            if 0x16 <= op <= 0x1B:
                # true: next insn; false: skip next insn (ecl_SkipInstruction) -> both successors
                try:
                    nop = code[npc]
                    if nop in OPS:
                        cnt = SKIPCOUNT.get(nop, OPS[nop][1])
                        _, skip_end = read_operands(code, npc, cnt)
                        todo.append(skip_end); labels.add(skip_end)
                except (IndexError, KeyError):
                    pass
            if op in (0x00, 0x01, 0x13, 0x20):
                break
            pc = npc
    return vec, insns, labels


VECNAMES = ["vecA (before each player command)", "vecB (after move / location)", "vecC (camp check)",
            "vecD (after rest)", "vecE (block init)"]


def listing(path, title):
    code = load(path)
    vec, insns, labels = trace(code)
    out = ["; %s — generated by decode/tools/ecldis.py from %s; regenerate, do not edit" % (title, os.path.basename(path)),
           "; record header (skipped by LoadEclBlock): %s ; code %04X..%04X (%d bytes)" % (code.hdr.hex(" "), BASE, code.end - 1, code.end - BASE),
           ";"]
    for i, v in enumerate(vec):
        out.append("; %-36s = %04X" % (VECNAMES[i], v))
    out.append("")
    pc = BASE
    covered = set()
    for a, (op, name, ops, npc) in insns.items():
        covered.update(range(a, npc))
    covered.update(range(BASE, BASE + 20))
    for i in range(5):
        a = BASE + 4 * i
        out.append("%04X  %-24s GOTO %04X        ; header vector %d" % (a, " ".join("%02X" % code[a + k] for k in range(4)), vec[i], i + 1))
    pc = BASE + 20
    while pc < code.end:
        if pc in insns:
            op, name, ops, npc = insns[pc]
            if pc in labels:
                out.append("L%04X:" % pc)
            bs = " ".join("%02X" % code[k] for k in range(pc, min(npc, pc + 8))) + (" .." if npc - pc > 8 else "")
            if name is None:
                out.append("%04X  %-24s ??? opcode %02X (no handler in ecl_Dispatch)" % (pc, bs, op))
            else:
                notes = []
                if op == 0x2D:
                    notes.append(CALL_NOTES.get(ops[0].word, "no-op in PoR"))
                for o in ops:
                    if o.type in (1, 3, 0x81) or (op in (0x09, 0x35) and o is ops[-2 if op == 0x35 else -1]):
                        n = ADDR_NOTES.get(o.word)
                        if n and op != 0x2D:
                            notes.append("%04X=%s" % (o.word, n))
                text = "%04X  %-24s %-15s %s" % (pc, bs, name, ", ".join(o.fmt() for o in ops))
                out.append(text + ("   ; " + "; ".join(notes) if notes else ""))
            pc = npc
        else:
            a = pc
            if pc in code.data:
                out.append("T%04X:                          ; data table (GET_TABLE/SAVE_TABLE/PRINT_MEM base)" % pc)
            while pc < code.end and pc not in covered:
                pc += 1
            if pc == a:
                pc += 1
                continue
            for k in range(a, pc, 16):
                chunk = [code[j] for j in range(k, min(pc, k + 16))]
                out.append("%04X  db %-47s ; %s" % (k, " ".join("%02X" % c for c in chunk),
                                                   "".join(chr(c) if 32 <= c < 127 else "." for c in chunk)))
    return out, insns


def dax_records(daxdir):
    from dax import read_dax  # por-data tool
    for n in range(1, 9):
        path = os.path.join(daxdir, "ECL%d.DAX" % n)
        for rid, data in read_dax(path):
            yield n, rid, data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file", nargs="?")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--stats", action="store_true")
    ap.add_argument("--bin", default=os.path.join(ROOT, "decode", "bin", "dax"))
    ap.add_argument("--out", default=os.path.join(ROOT, "decode", "ecl", "listings"))
    a = ap.parse_args()
    if a.file:
        print("\n".join(listing(a.file, os.path.basename(a.file))[0]))
        return
    usage, recs = {}, 0
    os.makedirs(a.out, exist_ok=True)
    for n in range(1, 9):
        d = os.path.join(a.bin, "ECL%d" % n)
        for f in sorted(os.listdir(d), key=lambda s: int(s.split(".")[0])):
            rid = int(f.split(".")[0])
            out, insns = listing(os.path.join(d, f), "ECL%d record %d" % (n, rid))
            recs += 1
            for op, name, ops, npc in insns.values():
                key = op
                usage.setdefault(key, [0, set()])
                usage[key][0] += 1
                usage[key][1].add("%d/%d" % (n, rid))
            if a.all:
                open(os.path.join(a.out, "ECL%d_%02d.ecl.txt" % (n, rid)), "w", newline="\n").write("\n".join(out) + "\n")
    print("| op | mnemonic | count | records |")
    print("|---|---|---|---|")
    for op in sorted(usage):
        name = OPS.get(op, ("??? (no handler)", 0))[0]
        print("| %02X | %s | %d | %d |" % (op, name, usage[op][0], len(usage[op][1])))
    print("\nrecords=%d distinct opcodes=%d unused handlers: %s" % (
        recs, len(usage), " ".join("%02X" % o for o in sorted(set(OPS) - set(usage))) or "none"))


if __name__ == "__main__":
    main()
