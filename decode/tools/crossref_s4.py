"""CROSSREF section 4: cross-area call graph + main game loop path. Usage: python crossref_s4.py"""
import collections, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import crossref as X
import crossref_s3 as S3


def nm(merged, k):
    v = merged.get(k)
    return v[0] if v else k


def main():
    ua = S3.unit_areas()
    merged, _ = X.names_merged()
    edges = X.sec_calls(ua)
    aa = collections.Counter()
    for (u1, u2), c in edges.items():
        a1, a2 = ua.get(u1, u1), ua.get(u2, u2)
        if a1 != a2: aa[(a1, a2)] += c
    areas = ['ENGINE', 'ECL', 'VIEW', 'COMBAT', 'MAGIC', 'PARTY', 'RUNTIME']
    L = ['## 4. Cross-area call graph and the main game loop', '',
         'Static call edges from `decode/listings/functions.tsv` (callees resolved through stub thunks to the overlay routine). Counts = caller->callee function pairs. Areas per §1.', '',
         '### 4a. Area x area (rows call columns; RUNTIME = TP System/Crt/Dos/Overlay)', '',
         '| caller / callee | ' + ' | '.join(areas) + ' |', '|---|' + '---|' * len(areas)]
    for a in areas:
        L.append('| **%s** | ' % a + ' | '.join(str(aa.get((a, b), '')) if a != b else '·' for b in areas) + ' |')
    L += ['', '### 4b. Unit -> unit edges across areas', '',
          '| caller unit (area) | callee units (area: pairs) |', '|---|---|']
    byu = collections.defaultdict(list)
    for (u1, u2), c in sorted(edges.items()):
        if ua.get(u1) != ua.get(u2): byu[u1].append('%s (%s: %d)' % (u2, ua.get(u2, '?'), c))
    for u in X.UNITS:
        if u in byu: L.append('| %s (%s) | %s |' % (u, ua.get(u, '?'), ', '.join(byu[u])))
    n = lambda k: nm(merged, k)
    L += ['', '### 4c. Main game loop path (evidence: ENGINE.pas.md MainProgram, ECL_VM.md "Game loop outline", ECL.pas.md, VIEW.pas.md, MAGIC.pas.md, COMBAT.pas.md, PARTY.pas.md)', '',
          '```',
          'START.EXE entry 0000:0006 %s (ENGINE)' % n('0000:0006'),
          ' ├─ 47 unit initialisers (System, Crt, ... ov00_init)                     0000:0006..00F1',
          ' ├─ ov11_002D %s (PARTY)                                                 0000:00FD  new game / engine init, ECL PC := 9900h' % n('5700:002D'),
          ' ├─ if ParamStr(1) <> \'STING\':  ov01_0627 %s, ov02_00FD %s (PARTY)        0000:0102..0122' % (n('2500:0627'), n('2A00:00FD')),
          ' ├─ ov16_0161 %s (PARTY)  "Choose a function": create/load/... party      0000:0127' % n('7000:0161'),
          ' ├─ %s(0Bh,0,7,6) (VIEW ov29)                                              0000:0138' % n('B100:0155'),
          ' ├─ ov03_32F8 %s (ECL)                                                    0000:013D' % n('2F00:32F8'),
          ' │    ├─ LoadEclBlock 4300:0341 + ecl_InitVM 4300:01B6 + ecl_Run(vecE) (ECL)   block init: map/walls/pictures',
          ' │    └─ repeat',
          ' │         ├─ ov14_0989 %s (VIEW)  adventure menu: Area / Cast / View / Encamp / Search / Look, 3D view (ov29 Draw3DView)' % n('6600:0989'),
          ' │         │     ├─ Cast  -> MAGIC (ov15 spell menus, ov22 spell effects)',
          ' │         │     ├─ View  -> ov19 ViewMenu 7F00:0AB3 (COMBAT unit, party UI: items, trade, spells)',
          ' │         │     └─ Area  -> ov29 DrawAreaMap B100:0000',
          ' │         ├─ "E" -> ecl_CampCheck 2F00:2DD3 (ECL) -> ecl_Run(vecC); camp menu ov15_1E6F %s (MAGIC); ecl_Run(vecD)' % n('6B00:1E6F'),
          ' │         ├─ ecl_Run(vecA) (before the move)  -> ecl_Dispatch 2F00:2F2D -> opcode handlers ov03 (ECL)',
          ' │         │     ├─ COMBAT opcode -> ov08_007A %s (MAGIC.pas.md: combat main loop) -> ov10 StartCombat (VIEW), per combatant: ov09 %s (computer) / ov13 actions (COMBAT), ov24 effects; ov05 %s after combat' % (n('4800:007A'), n('4D00:000F'), n('3900:1527')),
          ' │         │     ├─ shops / temple / training -> ov06 / ov04 / ov12 (PARTY / MAGIC)',
          ' │         │     └─ NEW_ECL -> next block (ecl_Restart -> %s 2F00:31B4)' % n('2F00:31B4'),
          ' │         ├─ move: ov14_0D6D %s (VIEW), redraw (RedrawCurrentMode 00BA, ov29 3D view), step sound' % n('6600:0D6D'),
          ' │         └─ ecl_Run(vecB) (after the move)',
          ' │       until PartyDead (DS:49FF)',
          ' └─ %s 0899:0000 (ENGINE) -> Halt' % n('0899:0000'),
          '```', '',
          'The dragon finale (ov18 DragonFinale) is reached from ECL (PROGRAM 8 / after-new-block), not from the main program.']
    X.write('s4_calls', '\n'.join(L) + '\n')
    print(len(edges), sum(aa.values()))


if __name__ == '__main__':
    main()
