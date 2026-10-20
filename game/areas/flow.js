// game/areas/flow.js — integration glue for the original main loop (lane por-build-qa).
// por-only: Pool translated resident helpers/control flow, DS offsets and record fields (whole module) (profile: engine.areaModules / engine.state / recordSizes; game/profiles/PORONLY.md)
//
// The main loop itself is engine/main.js MainProgram (0000:0006: InitGameState -> title/credits/wheel -> PartyCreationMenu ->
// SetBackdropColours -> ecl_GameLoop, decode/CROSSREF.md §4c). The areas call each other by published name through their own
// `X` proxies, and every area routine reads its own `env.g`. The integration runs (acceptance/integration/RUN-1.md, P1) showed
// that the failures between areas were all of one kind: a routine of area A called by area B before A had been bound.
// flow.js binds every area, in dependency order, once, before the main loop starts — so no hand-off depends on which area
// happens to be called first:
//   res_00ba (resident 00BA: redraw, roster, messages)  ->  view (ov10..ov34)  ->  party  ->  combat  ->  magic  ->  ECL host
// Each area keeps its own self-binding (idempotent); this only forces the order and waits for all of them.
// Use: `await (await import('../areas/flow.js')).BindAllAreas()` in MainProgram after initState (engine request #qa-7).

const AREAS = [
  ['./res_00ba.js', 'ensureRes00baBound'],
  ['./view.js', null],
  ['./party.js', 'ensurePartyBound'],
  ['./combat.js', 'ensureCombatBound'],
  ['./magic.js', 'ensureMagicBound'],
  ['./ecl_host.js', 'bindEclHost'],
];

// Engine modules that no area's own lookup (`ENGINE_MODULES` in the *_core.js files) searches: their exports are handed
// to every area through its bind function, but only names no area module exports itself (never overrides area code).
// Found by P1: COMBAT MissileAnim -> X.SetSoundTimerMode (engine/audio.js) threw "missing routine".
const EXTRA_ENGINE = ['../engine/audio.js', '../engine/files.js', '../engine/ecl.js'];   // ecl.js: MenuSelect 4300:1684 (linkcheck)
const BINDERS = [['./res_00ba.js', 'bindRes00ba'], ['./party.js', 'bindParty'], ['./combat.js', 'bindCombat'], ['./magic.js', 'bindMagic']];

let done = null;
export function BindAllAreas() {
  if (!done) done = (async () => {
    const report = [];
    const mods = {};
    for (const [path, fn] of AREAS) {
      try {
        const m = await import(path);
        mods[path] = m;
        if (fn && typeof m[fn] === 'function') await m[fn]();
        report.push([path, 'bound']);
      } catch (e) {
        report.push([path, 'missing: ' + (e && e.message)]);
      }
    }
    const areaNames = new Set(Object.values(mods).flatMap((m) => Object.keys(m)));
    const extra = {};
    for (const path of EXTRA_ENGINE) {
      try {
        const m = await import(path);
        for (const [k, v] of Object.entries(m)) if (typeof v === 'function' && !areaNames.has(k)) extra[k] = v;
      } catch { /* engine module not built */ }
    }
    for (const [path, fn] of BINDERS) {
      const m = mods[path] || (await import(path).catch(() => null));
      if (m && typeof m[fn] === 'function') { m[fn]({ ext: extra }); report.push([path, `+${Object.keys(extra).length} engine routines`]); }
    }
    return report;
  })();
  return done;
}
