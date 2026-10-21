#!/usr/bin/env python3
"""Assemble decode/tools/ecldis.py address listings without executing source text."""
import argparse
import re
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'decode/tools'))
from ecldis import OPS, VARCOUNT, BASE
MNEMONICS = {name: (op, count) for op, (name, count) in OPS.items()}


def pack_string(text):
    codes = []
    for c in text:
        n = ord(c)
        if 65 <= n <= 95: codes.append(n - 64)
        elif 32 <= n <= 63: codes.append(n)
        else: raise ValueError('packed text supports ASCII space.._ except @')
    bits = ''.join(format(c, '06b') for c in codes)
    bits += '0' * (-len(bits) % 8)
    return bytes(int(bits[i:i+8], 2) for i in range(0, len(bits), 8))


def operand(token):
    if token.startswith('"') and token.endswith('"'):
        data = pack_string(token[1:-1])
        if len(data) > 255: raise ValueError('packed string exceeds 255 bytes')
        return bytes([0x80, len(data)]) + data
    m = re.fullmatch(r'#([0-9A-Fa-f]{2}|[0-9A-Fa-f]{4})', token)
    if m:
        n = int(m[1], 16)
        return bytes([0, n]) if len(m[1]) == 2 else bytes([2, n & 255, n >> 8])
    m = re.fullmatch(r'(\$)?\[([0-9A-Fa-f]{4})\](\')?', token)
    if m:
        n = int(m[2], 16)
        return bytes([0x81 if m[1] else 3 if m[3] else 1, n & 255, n >> 8])
    m = re.fullmatch(r'\?t([0-9A-Fa-f]{2}):([0-9A-Fa-f]{2})', token)
    if m: return bytes([int(m[1], 16), int(m[2], 16)])
    raise ValueError('invalid operand: ' + token)


def assemble(text):
    header = re.search(r'record header \(skipped by LoadEclBlock\): ([0-9a-fA-F ]+?) ; code ([0-9A-Fa-f]+)\.\.([0-9A-Fa-f]+)', text)
    if not header: raise ValueError('missing record header / code extent comment')
    prefix = bytes.fromhex(header[1]); end = int(header[3], 16) + 1
    if len(prefix) != 2 or int(header[2], 16) != BASE or not BASE <= end <= 0x10000: raise ValueError('invalid record extent')
    image = {}; lines = []
    for number, line in enumerate(text.splitlines(), 1):
        m = re.match(r'^([0-9A-Fa-f]{4})  (.*)$', line)
        if m: lines.append((int(m[1], 16), m[2], number))
    for address, body, number in lines:
        try:
            if body.startswith('db '): data = bytes.fromhex(body[3:].split(';', 1)[0])
            else:
                # Byte preview has a fixed 24-character minimum width, but can grow.
                m = re.match(r'((?:[0-9A-Fa-f]{2} )*(?:[0-9A-Fa-f]{2})(?: \.\.)?) +(.+)$', body)
                if not m: raise ValueError('missing byte preview / instruction')
                preview = bytes.fromhex(m[1].replace(' ..', '')); instruction = m[2]
                if instruction.startswith('???'): data = preview
                elif '; header vector' in instruction:
                    target = int(instruction.split()[1], 16)
                    data = preview[:2] + bytes([target & 255, target >> 8])
                else:
                    name, _, tail = instruction.partition(' ')
                    op, count = MNEMONICS[name];tail = tail.strip()
                    # Quotes may contain commas, semicolons and unescaped quote glyphs.
                    pattern = r'".*?"(?=, |   ;|$)|\$?\[[0-9A-Fa-f]{4}\]\'?|#[0-9A-Fa-f]{2,4}|\?t[0-9A-Fa-f]{2}:[0-9A-Fa-f]{2}'
                    comment = re.search(r'   ;', tail)
                    if comment: tail = tail[:comment.start()]
                    tokens = re.findall(pattern, tail)
                    if ', '.join(tokens) != tail: raise ValueError('invalid operand sequence')
                    encoded = [operand(t) for t in tokens]
                    expected = count
                    if op in VARCOUNT and len(encoded) >= count:
                        k = VARCOUNT[op]-1
                        if encoded[k][0] in (0, 2): expected += encoded[k][1]
                    if len(encoded) != expected: raise ValueError('wrong operand count')
                    data = bytes([op]) + b''.join(encoded)
                    # A lossless preview may preserve padding the text notation omits.
                    if '..' not in m[1]:
                        from ecldis import Code, decode_at
                        code = Code({BASE+i:b for i,b in enumerate(preview)})
                        _, decoded_name, decoded, _ = decode_at(code, BASE)
                        if decoded_name == name and [o.fmt() for o in decoded] == tokens: data = preview
            for offset, byte in enumerate(data):
                pos = address + offset
                if not BASE <= pos < end: raise ValueError('write outside record extent')
                if pos in image and image[pos] != byte: raise ValueError('conflicting overlapping instruction/data')
                image[pos] = byte
        except (ValueError, KeyError, IndexError) as e: raise ValueError(f'line {number}, {address:04X}: {e}') from e
    missing = set(range(BASE, end)) - image.keys()
    if missing: raise ValueError(f'listing leaves {len(missing)} bytes uncovered (first {min(missing):04X}); truncated listings cannot be recovered')
    return prefix + bytes(image[a] for a in range(BASE, end))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('listing', type=Path); parser.add_argument('output', type=Path)
    args = parser.parse_args()
    args.output.write_bytes(assemble(args.listing.read_text(encoding='utf-8')))

if __name__ == '__main__': main()
