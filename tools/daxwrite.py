#!/usr/bin/env python3
"""Write SSI DAX containers (decode/data/DAX.md). No original assets bundled."""
import argparse
import struct
from pathlib import Path


def rle_encode(data):
    data = bytes(data); out = bytearray(); i = 0
    def run(at):
        n = 1
        while at+n < len(data) and n < 127 and data[at+n] == data[at]: n += 1
        return n
    while i < len(data):
        n = run(i)
        if n >= 3:
            out.extend((256-n, data[i])); i += n
        else:
            start = i; i += n
            while i < len(data) and i-start < 127:
                n = run(i)
                if n >= 3: break
                i += min(n, 127-(i-start))
            out.append(i-start-1); out.extend(data[start:i])
    return bytes(out)


def write_dax(records):
    records = list(records); seen = set(); directory = bytearray(); payload = bytearray()
    if len(records) > 256: raise ValueError('DAX supports at most 256 distinct byte ids')
    for rid, raw in records:
        if not isinstance(rid, int) or not 0 <= rid <= 255 or rid in seen: raise ValueError('record ids must be unique bytes')
        seen.add(rid); raw = bytes(raw)
        if not raw or len(raw) > 65535: raise ValueError('record size must be 1..65535 bytes')
        compressed = rle_encode(raw)
        if len(compressed) > 36000: raise ValueError('compressed record exceeds original engine 36000-byte buffer')
        directory.extend(struct.pack('<BIHH', rid, len(payload), len(raw), len(compressed))); payload.extend(compressed)
    return struct.pack('<H', len(directory)) + directory + payload


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path, help='numeric <id>.bin files; ids sorted numerically')
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    records = sorted((int(p.stem), p.read_bytes()) for p in args.directory.glob('*.bin'))
    if not records: parser.error('no numeric .bin records')
    args.output.write_bytes(write_dax(records))

if __name__ == '__main__': main()
