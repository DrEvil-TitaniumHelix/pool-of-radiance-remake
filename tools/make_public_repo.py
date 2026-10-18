"""make_public_repo.py: build the public release repo LOCALLY as a filtered clone (docs/BYOC.md §9a, ruling PR-3).

Usage: python -I tools/make_public_repo.py [--target DIR] [--replace] [--no-gate]
  --target   default <repo>-public (a NEW directory next to this repo)
  --replace  delete an existing target first, but only one this script made (marker file .git/por-public-clone)

Steps: (1) `git clone --no-local` of this repo (no shared objects), origin removed at once; (2) git filter-repo pass 1 =
ALLOW-LIST (only the paths below survive, in every commit), pass 2 = deny inside the kept folders (save files, binaries and
renders by extension, the test-party save); history is rewritten in the CLONE only; (3) the verification gate
tools/public_gate.py on the clone's tree + every blob of its history. This repo is never modified; nothing is pushed and
no remote is added (publishing needs the owner's approval).
"""
import argparse, os, shutil, subprocess, sys, tempfile

WS = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_TARGET = os.path.join(os.path.dirname(WS), 'PoolRadianceRE-public')
MARKER = 'por-public-clone'

# PR-2 A: engine + importer + our pseudocode/specs/names + docs + tools that read the originals only at run time.
# (git filter-repo's glob `*` crosses '/', so single-level patterns are written as regex.)
ALLOW = r"""
game/
docs/
tools/serve.py
tools/make_test_party.mjs
tools/gen_globals.py
tools/public_gate.py
tools/make_public_repo.py
decode/pseudo/
decode/names/
decode/tools/
decode/ghidra_scripts/
decode/crossref/
decode/ecl/ECL_VM.md
regex:^decode/data/[^/]+\.md$
decode/LAYOUT.md
decode/CROSSREF.md
decode/GLOBALS.md
DECODE_GATE.md
BUILD_PLAN.md
ACCEPTANCE.md
README.md
.gitignore
acceptance/.gitattributes
acceptance/runlock.mjs
acceptance/lock.sh
acceptance/shoot.mjs
regex:^acceptance/integration/[^/]+\.(mjs|md|json|py|sh)$
acceptance/integration/RUN-2/
acceptance/integration/RUN-3/
"""
# inside the kept folders: original-format saves (the committed test party copies ITEM3.DAX records), old run outputs,
# the superseded SAVES draft (hex dumps of save records; SAVES.md replaces it), any binary/render. decode/rt/ (runtime
# ledger with Turbo Pascal signature bytes) is not allow-listed.
DENY = r"""
game/assets/saves/
acceptance/integration/out/
decode/data/SAVES.draft.md
regex:(?i)\.(png|pdf|exe|dax|ovr|sav|itm|spc|dat|bin|gif|jpg|bmp|zip)$
"""


def run(cmd, **kw):
    print('+', ' '.join(cmd))
    subprocess.run(cmd, check=True, **kw)


def filter_repo_exe():
    for c in (shutil.which('git-filter-repo'),
              os.path.join(os.environ.get('APPDATA', ''), 'Python', 'Python313', 'Scripts', 'git-filter-repo.exe')):
        if c and os.path.exists(c):
            return c
    sys.exit('git-filter-repo not found (pip install --user git-filter-repo)')


def paths_file(text):
    f = tempfile.NamedTemporaryFile('w', suffix='.txt', delete=False, encoding='utf-8')
    f.write('\n'.join(l for l in text.strip().splitlines() if l.strip()) + '\n')
    f.close()
    return f.name


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--target', default=DEFAULT_TARGET)
    ap.add_argument('--replace', action='store_true')
    ap.add_argument('--no-gate', action='store_true')
    a = ap.parse_args()
    target = os.path.abspath(a.target)
    if os.path.normcase(target).startswith(os.path.normcase(WS + os.sep)) or os.path.normcase(target) == os.path.normcase(WS):
        sys.exit('refusing: the target must be outside this repo')
    if os.path.exists(target):
        if not (a.replace and os.path.exists(os.path.join(target, '.git', MARKER))):
            sys.exit(f'{target} exists (use --replace; only a clone made by this script, marker .git/{MARKER}, is replaced)')
        shutil.rmtree(target, onerror=lambda f, p, e: (os.chmod(p, 0o700), f(p)))
    head = subprocess.run(['git', '-C', WS, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True, check=True).stdout.strip()
    run(['git', 'clone', '--no-local', '--quiet', WS, target])
    run(['git', '-C', target, 'remote', 'remove', 'origin'])
    with open(os.path.join(target, '.git', MARKER), 'w', encoding='utf-8') as f:
        f.write(f'filtered clone of {WS} at {head}; never push without owner/coordinator approval\n')
    fr = filter_repo_exe()
    allow, deny = paths_file(ALLOW), paths_file(DENY)
    try:
        run([fr, '--force', '--quiet', '--paths-from-file', allow], cwd=target)
        run([fr, '--force', '--quiet', '--invert-paths', '--paths-from-file', deny], cwd=target)
    finally:
        os.unlink(allow); os.unlink(deny)
    run(['git', '-C', target, 'reflog', 'expire', '--expire=now', '--all'])
    run(['git', '-C', target, 'gc', '--prune=now', '--aggressive', '--quiet'])
    with open(os.path.join(target, '.git', MARKER), 'w', encoding='utf-8') as f:
        f.write(f'filtered clone of {WS} at {head}; never push without owner/coordinator approval\n')
    remotes = subprocess.run(['git', '-C', target, 'remote'], capture_output=True, text=True).stdout.strip()
    print(f'clone ready: {target} (source {head}, remotes: {remotes or "none"})')
    if not a.no_gate:
        sys.exit(subprocess.run([sys.executable, '-I', os.path.join(WS, 'tools', 'public_gate.py'), target,
                                 '--json', os.path.join(target, '.git', 'public_gate.json')]).returncode)


if __name__ == '__main__':
    main()
