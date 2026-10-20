cd "$(dirname "$0")/../.."
# BYOC step 7: shots in the gitignored acceptance/local/integration/RUN-1 (older runs: acceptance/integration/out/RUN-1);
# references acceptance/local/ref first, then the legacy tracked acceptance/ref
O=acceptance/local/integration/RUN-1; [ -d "$O" ] || O=acceptance/integration/out/RUN-1
refpng() { [ -f acceptance/local/ref/$1 ] && echo acceptance/local/ref/$1 || echo acceptance/ref/$1; }
while read r b; do
  printf '%s vs %s: ' "$b" "$r"
  python3 acceptance/ref/compare.py $(refpng $r.png) $O/$b.png --out /tmp/c_$b 2>&1 | tail -1 | cut -d';' -f1
  grep -o 'Bounding box[^.]*' /tmp/c_$b.md
done <<L
REF-MENU 01-party-menu
REF-LOAD 02-load-which
ECL-03 03-phlan-view
ECL-14 07-encamp
VIEW-10 09-save-B-quit-prompt
REF-MENU 12-reload-menu
L
