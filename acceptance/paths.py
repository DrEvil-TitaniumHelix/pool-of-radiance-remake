"""acceptance/paths.py (por-accept, BYOC step 7) — Python twin of acceptance/paths.mjs.

Screenshots, DOSBox reference captures and diff images go to the gitignored acceptance/local/ tree; only small reports
(pixel counts, SHA-256 of every shot) are committed under acceptance/reports/. ref_png() prefers acceptance/local/ref/
and falls back to the legacy tracked acceptance/ref/ (kept in this private repo, absent from the public tree).
"""
import hashlib
from pathlib import Path

ACC = Path(__file__).resolve().parent
ROOT = ACC.parent
LOCAL = ACC / 'local'
REPORTS = ACC / 'reports'


def local(kind, name=''):
    d = LOCAL / kind / name
    d.mkdir(parents=True, exist_ok=True)
    return d


def report(kind, name):
    (REPORTS / kind).mkdir(parents=True, exist_ok=True)
    return REPORTS / kind / (str(name).replace('/', '_').replace('\\', '_') + '.json')


def ref_png(file):
    p = LOCAL / 'ref' / file
    return p if p.exists() else ACC / 'ref' / file


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
