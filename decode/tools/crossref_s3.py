"""CROSSREF section 3: DS globals shared by >= 2 areas. Usage: python crossref_s3.py"""
import collections, csv, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import crossref as X


def unit_areas():
    rows, hd = X.sec_units()
    ua = {}
    for u, areas, txt, n, _ in rows:
        if u in ('res_03DA', 'res_03ED', 'res_0A31') or u.startswith('res_') or u == 'main_0000': ua[u] = 'ENGINE'
        elif areas == 'RUNTIME': ua[u] = 'RUNTIME'
        elif u == 'ov07': ua[u] = 'ECL'
        elif areas in ('NONE',) or areas.startswith('PARTY'): ua[u] = 'PARTY'
        else: ua[u] = areas.split(',')[0]
    return ua


def main():
    ua = unit_areas()
    g = {}
    for l in open(os.path.join(X.D, 'GLOBALS.md'), encoding='utf-8'):
        c = [x.strip() for x in l.split('|')]
        if len(c) > 12 and re.fullmatch(r'[0-9A-F]{4}', c[1]):
            g[c[1]] = dict(name=c[2], type=c[3], size=c[4], init=c[6], conf=c[7], ev=c[12])
    shared, _ = X.sec_globals(ua)
    L = ['## 3. Shared globals (DS 0C7C, used by >= 2 areas)', '',
         'One row per DS offset whose references (decode/globals_xref.tsv) come from routines of two or more areas. Area of a routine = canonical area of its unit (§1). Name = the merged name (lane names beat `g_XXXX`; see §2 for the conflicts). Type/init/evidence from GLOBALS.md; meaning = the naming lane\'s evidence (GLOBALS.md last column and the lane pseudo file). R = read/address taken, W = written.', '',
         '| DS | name | type | init | areas: writers | areas: readers only | evidence / notes |', '|---|---|---|---|---|---|---|']
    named = 0
    for off in sorted(shared):
        per = shared[off]; r = g.get(off, {})
        w = '; '.join('%s: %s' % (a, ', '.join(sorted(v[1]))[:120]) for a, v in sorted(per.items()) if v[1])
        ro = ', '.join(sorted(a for a, v in per.items() if not v[1]))
        nm = r.get('name', 'g_' + off)
        if not nm.startswith('g_'): named += 1
        L.append('| %s | %s | %s | %s | %s | %s | %s |' % (off, nm, r.get('type', ''), r.get('init', ''), w.replace('|', '/'), ro, r.get('ev', '')[:160].replace('|', '/')))
    L += ['', 'Shared offsets: %d, with a real name: %d, still `g_XXXX`: %d (listed in §5 with their owner).' % (len(shared), named, len(shared) - named), '',
          '### Globals requests (STATUS.md) — APPLIED', '',
          '| request | content | status |', '|---|---|---|',
          '| ecl globals request #1 | names in ecl_names.json (61 DS names: VM registers, text_Col/Row, enc_*, view_Redraw*, ...) | **APPLIED**: 61/61 shown in GLOBALS.md and the listings (merged names) |',
          '| engine globals request #2 | names in engine_names.json (50 DS names: VideoMode, view_Line*, game_Mode, GameSpeed, DiskPromptText, ...) | **APPLIED**: 50/50 (4 tables with no direct code reference added as GLOBALS rows) |',
          '| view globals request #1 | names in view_names.json (40 DS names: party_*, door_*, cm_Map, cb_*, menu_*, ...) | **APPLIED**: 40/40 |',
          '| magic globals request #2 | names in magic_names.json (17: SpellTable, SpellNames, SpellHandlers, sp_Current, sc_List, ...) | **APPLIED**: 17/17; 6B84 SpellHandlers wins over COMBAT SpellTargetProc (§2b); 6DBB sc_List vs PARTY AreaEffectList = party fix request #xref-4 |',
          '| combat (my lane) | names in combat_names.json (57 DS names) | **APPLIED** |', '',
          'Mechanism: `decode/tools/globals.py` shows lane names (precedence as PorExport: real beats placeholder, later file wins) and adds lane-named offsets that no instruction references directly. `globals.json` keeps the placeholders so it never shadows a lane name.', '',
          '### Global-name conflicts with PARTY (party fix request #xref-4) — APPLIED (PARTY DONE)', '',
          '| DS | PARTY name | kept | reason |', '|---|---|---|---|',
          '| 2614 | DiskPrompt | DiskPromptText (ENGINE) | same variable, ENGINE published first |',
          '| 5E52 | OverlandTiles | TileSetLo (VIEW) | VIEW names the pair 5E52/5E56 TileSetLo/Hi (two SQRPACI tile sets) |',
          '| 6DBB | AreaEffectList | sc_List (MAGIC) | MAGIC owns the stinking-cloud list |',
          '| party globals request #1 | names in party_names.json | **APPLIED** (shown in GLOBALS.md, listings) | |']
    X.write('s3_globals', '\n'.join(L) + '\n')
    print(len(shared), named)


if __name__ == '__main__':
    main()
