"""public_gate.py: verification gate for the public release repo (docs/BYOC.md §9a step 3, ruling PR-3; lane por-fixer).

Usage: python -I tools/public_gate.py REPO [--originals DIR] [--workspace DIR] [--json OUT]
  REPO         the filtered clone (a git repo): its work tree AND every blob of `git rev-list --all --objects` are checked
  --originals  the original v1.3 folder, read only (default env POR_DATA or ../re-targets/goldbox/por/POOLRAD)
  --workspace  this RE workspace, for the hashes of its own derived material (renders, test-party saves, unpacked EXE)

FAIL (exit 1) when any of these is found:
  (p) PATH    a forbidden path or file type in any commit (*.png *.pdf *.exe *.dax *.ovr *.sav *.itm *.spc *.dat, listings,
              renders, refs, the lane files ...)
  (h) HASH    a blob whose SHA-256 is an original file (manifest + every file of the original folder incl. SAVE/ and the
              code-wheel PDF), a decoded DAX record, the unpacked START.EXE image, a PNG render or a save file of the workspace
  (b) BYTES   a blob containing a run of >= 31 bytes identical to the originals (raw files, the unpacked image, every
              decoded DAX record) that is binary (not only printable text); low-entropy runs (< 6 distinct values) ignored
  (x) HEXDUMP a text blob with a hex dump of >= 32 consecutive bytes that occur in the originals (a listing with code bytes)
REPORT only (PR-2 A: our pseudocode/specs may quote short texts and byte evidence):
  (t) TEXT    a printable run of >= 31 bytes from the originals (a quoted game or runtime string)
  (s) SHORTHEX a hex dump of 16..31 bytes that occurs in the originals
Only paths, offsets, lengths and counts are printed, never the matched content.
"""
import argparse, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
WS_DEFAULT = os.path.dirname(HERE)
W = 16              # window; the originals are indexed every W bytes, targets probed at every offset -> runs >= 2W-1 found
MIN_DISTINCT = 6
TEXT = set(range(0x20, 0x7F)) | {9, 10, 13}
BAD_EXT = ('.png', '.pdf', '.exe', '.dax', '.ovr', '.sav', '.itm', '.spc', '.dat', '.bin', '.gif', '.jpg', '.bmp')
BAD_PREFIX = ('decode/listings/', 'decode/ecl/listings/', 'decode/ecl/scripts/', 'decode/data/png/', 'decode/bin/',
              'decode/docs/', 'acceptance/out/', 'acceptance/ref/', 'acceptance/acc/', 'acceptance/local/',
              'acceptance/testparty/', 'acceptance/integration/out/', 'game/assets/saves/', 'herdr/')
BAD_FILES = ('STATUS.md', 'FOREMAN.md', 'RULINGS.md', 'decode/STRINGS.md', 'decode/strings.tsv')
HEX_RX = re.compile(rb'(?:\b[0-9A-Fa-f]{2}(?:[ ,]+|$)){16,}|\b(?:[0-9a-f]{2}){16,}\b')


def originals(orig_dir, ws):
    """name -> bytes: every original file (recursive), the unpacked EXE image, every decoded DAX record"""
    sys.path.insert(0, os.path.join(ws, 'decode', 'tools'))
    import unexepack, dax  # noqa: E402
    out = {}
    for root, _, files in os.walk(orig_dir):
        for f in files:
            p = os.path.join(root, f)
            with open(p, 'rb') as fh:
                out[os.path.relpath(p, orig_dir).replace('\\', '/').upper()] = fh.read()
    start = out.get('START.EXE')
    if start:
        image, _, _ = unexepack.unpack(start)
        out['START.EXE#image'] = bytes(image)
    for name in [n for n in out if n.endswith('.DAX')]:
        data = out[name]
        _, entries = dax.read_dir(data)
        for e in entries:
            try:
                rec = dax.record(data, e)[0]
                out[f"{name}#{e['id']}"] = bytes(rec)
            except Exception:
                pass
    return out


def build_index(orig):
    idx = {}
    for name, b in orig.items():
        for i in range(0, len(b) - W + 1, W):
            w = b[i:i + W]
            if len(set(w)) >= MIN_DISTINCT:
                idx.setdefault(w, (name, i))
    return idx


def derived_hashes(orig, ws):
    hs = {hashlib.sha256(b).hexdigest(): n for n, b in orig.items()}
    for root, dirs, files in os.walk(ws):
        dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', 'ghidra_proj')]
        rel = os.path.relpath(root, ws).replace('\\', '/')
        for f in files:
            if f.lower().endswith(('.png', '.pdf', '.exe', '.sav', '.itm', '.spc', '.dat')) or rel.startswith(('game/assets/saves', 'decode/bin')):
                p = os.path.join(root, f)
                try:
                    with open(p, 'rb') as fh:
                        hs.setdefault(hashlib.sha256(fh.read()).hexdigest(), 'workspace:' + os.path.relpath(p, ws).replace('\\', '/'))
                except OSError:
                    pass
    return hs


def runs(b, idx, orig):
    """maximal runs shared with the originals: [(offset, length, text_only, source)]"""
    found, i, n = [], 0, len(b)
    while i <= n - W:
        hit = idx.get(b[i:i + W])
        if hit is None:
            i += 1
            continue
        name, j = hit
        src = orig[name]
        s, t = i, j                                    # extend backwards and forwards
        while s > 0 and t > 0 and b[s - 1] == src[t - 1]:
            s -= 1; t -= 1
        e, u = i + W, j + W
        while e < n and u < len(src) and b[e] == src[u]:
            e += 1; u += 1
        if e - s >= 2 * W - 1:
            seg = b[s:e]
            found.append((s, e - s, all(c in TEXT for c in seg), name))
        i = e
    return found


def hexdumps(b, idx, orig):
    out = []
    for m in HEX_RX.finditer(b):
        digits = re.sub(rb'[^0-9A-Fa-f]', b'', m.group(0))
        raw = bytes.fromhex(digits.decode()) if len(digits) % 2 == 0 else b''
        if len(raw) < 16:
            continue
        best = max((r[1] for r in runs(raw, idx, orig)), default=0)
        if best == 0:                                  # a short dump may not contain an indexed window: direct search
            for src in orig.values():
                if raw[:16] in src:
                    best = 16
                    break
        if best:
            out.append((m.start(), len(raw), best))
    return out


def git(repo, *a, data=None):
    return subprocess.run(['git', '-C', repo] + list(a), input=data, capture_output=True, check=True).stdout


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('repo')
    ap.add_argument('--originals', default=os.environ.get('POR_DATA', r'../re-targets\goldbox\por\POOLRAD'))
    ap.add_argument('--workspace', default=WS_DEFAULT)
    ap.add_argument('--json')
    a = ap.parse_args()
    orig = originals(a.originals, a.workspace)
    idx = build_index(orig)
    hashes = derived_hashes(orig, a.workspace)
    print(f'originals: {len(orig)} byte sources ({sum(len(b) for b in orig.values()):,} B), index {len(idx):,} windows, '
          f'{len(hashes):,} forbidden hashes')
    rep = {'path': [], 'hash': [], 'bytes': [], 'hexdump': [], 'text': [], 'shorthex': []}
    # (p) paths in every commit
    paths = set(git(a.repo, 'log', '--all', '--name-only', '--format=').decode('utf-8', 'replace').split('\n')) - {''}
    for p in sorted(paths):
        lp = p.lower()
        if lp.endswith(BAD_EXT) or p.startswith(BAD_PREFIX) or p in BAD_FILES:
            rep['path'].append(p)
    # every blob of the history (the work tree of HEAD is a subset) once, under its first path
    objs = git(a.repo, 'rev-list', '--all', '--objects').decode('utf-8', 'replace').split('\n')
    first = {}
    for line in objs:
        if ' ' in line:
            sha, path = line.split(' ', 1)
            first.setdefault(sha, path)
    shas = list(first)
    types = git(a.repo, 'cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)', data='\n'.join(shas).encode()).decode().split('\n')
    blobs = [t.split()[0] for t in types if t.endswith(tuple('0123456789')) and ' blob ' in t]
    total = 0
    for sha in blobs:
        b = git(a.repo, 'cat-file', 'blob', sha)
        total += len(b)
        path = first[sha]
        h = hashlib.sha256(b).hexdigest()
        if h in hashes:
            rep['hash'].append({'path': path, 'blob': sha, 'equals': hashes[h]})
            continue
        for off, ln, text, src in runs(b, idx, orig):
            (rep['text'] if text else rep['bytes']).append({'path': path, 'blob': sha, 'offset': off, 'length': ln, 'source': src})
        if b.count(b'\0') < len(b) // 100:            # text blob: hex dumps
            for off, ln, best in hexdumps(b, idx, orig):
                (rep['hexdump'] if best >= 32 else rep['shorthex']).append({'path': path, 'blob': sha, 'offset': off, 'dump_bytes': ln, 'match_bytes': best})
    head_files = git(a.repo, 'ls-files').decode('utf-8', 'replace').split('\n')
    fail = bool(rep['path'] or rep['hash'] or rep['bytes'] or rep['hexdump'])
    summary = {'repo': os.path.abspath(a.repo), 'head_files': len([f for f in head_files if f]), 'commits': int(git(a.repo, 'rev-list', '--all', '--count')),
               'blobs': len(blobs), 'blob_bytes': total, **{k: len(v) for k, v in rep.items()}, 'result': 'FAIL' if fail else 'PASS'}
    print(json.dumps(summary))
    for k in ('path', 'hash', 'bytes', 'hexdump'):
        for r in rep[k][:20]:
            print(f'  {k.upper()}: {r}')
    by_file = {}
    for k in ('text', 'shorthex'):
        for r in rep[k]:
            by_file.setdefault((k, r['path']), 0)
            by_file[(k, r['path'])] += 1
    for (k, p), c in sorted(by_file.items()):
        print(f'  report {k}: {p} x{c}')
    if a.json:
        with open(a.json, 'w', encoding='utf-8') as f:
            json.dump({'summary': summary, **rep}, f, indent=1)
    sys.exit(1 if fail else 0)


if __name__ == '__main__':
    main()
