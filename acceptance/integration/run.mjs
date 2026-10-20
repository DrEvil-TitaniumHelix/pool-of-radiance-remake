// acceptance/integration/run.mjs (por-build-qa) — integration key-script driver: ONE headless Chrome, ONE page, the whole run.
// Steps are typed into the running game through the engine's own key-script hook (engine/input.js `script`): a step's keys
// are fed one per idle tick; when they are used up and the game idles again, the step is "done" and the 320x200 canvas is
// saved as acceptance/local/integration/<run>/<nn>-<name>.png (gitignored, BYOC step 7); the report (per step: keys, ready,
// errors, SHA-256 of the shot) is written next to it and to the committed acceptance/reports/integration/<run>.json.
// Console errors / exceptions are recorded per step.
// Load rule (owner): only one headless Chrome/DOSBox at a time — this script takes acceptance/.runlock itself.
// Needs: python -I tools/serve.py 8188.   Usage: node acceptance/integration/run.mjs <run.json>
// run.json: { "name": "RUN-1", "query": "sting=1&seed=1&fast=4", "steps": [ { "name": "menu", "keys": "", "ref": "REF-MENU" }, ... ] }
// Step extras: "reload" (restart the page), "inject": "<dir>" (write every file of <dir> into the game's save store via
// engine/files.js writeFile, then reload), "until"/"repeat", "probe", "ms", and "auto" (RUN-3 area sweep, see autoWalk).
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { acquireLock, setLockChild, onRelease, releaseLock } from '../runlock.mjs';
import { local, report as reportPath, sha256 } from '../paths.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = process.env.GAME_URL || 'http://127.0.0.1:8188/index.html';
const STEP_MS = Number(process.env.STEP_MS || 60000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const run = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const OUT = local('integration', run.name);
mkdirSync(OUT, { recursive: true });

// global run lock (acceptance/runlock.mjs: owner file, dead-owner takeover, released on exit/signals)
await acquireLock(`run.mjs ${run.name}`);
const PORT = 9600 + (process.pid % 300);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${join(tmpdir(), `por-qa-${process.pid}`)}`, '--window-size=640,400', '--hide-scrollbars',
  '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
setLockChild(chrome.pid, `por-qa-${process.pid}`);           // a waiter kills this Chrome if we are killed hard
onRelease(() => chrome.kill());

async function getJSON(path, method = 'GET') {
  for (let i = 0; i < 300; i++) {
    try { return await (await fetch(`http://127.0.0.1:${PORT}${path}`, { method })).json(); } catch { await sleep(200); }
  }
  throw new Error('chrome did not start');
}
function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map(), errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') { const d = m.params.exceptionDetails; errors.push((d.exception?.description ?? d.text) + (d.url ? ` @ ${d.url}:${d.lineNumber + 1}:${d.columnNumber + 1}` : '')); }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning'))
      errors.push(m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description).join(' '));
  };
  const send = (method, params = {}) => new Promise((r, j) => {
    const i = ++id;
    const t = setTimeout(() => { pending.delete(i); j(new Error(`${method} timed out`)); }, 20000);
    pending.set(i, (m) => { clearTimeout(t); r(m); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  return new Promise((r) => { ws.onopen = () => r({ send, errors, close: () => ws.close() }); });
}

const EXTK = { Up: 0x48, Down: 0x50, Left: 0x4B, Right: 0x4D, Home: 0x47, End: 0x4F, PgUp: 0x49, PgDn: 0x51 };
function parseKeys(s) { const out = []; for (let k = 0; k < s.length; k++) { if (s[k] === '{') { const j = s.indexOf('}', k); const t = s.slice(k + 1, j); k = j;
  if (t === 'Enter') out.push([13, 0x1C]); else if (t === 'Esc') out.push([27, 1]); else if (t === 'Space') out.push([32, 0x39]);
  else if (t === 'wait') out.push(null); else if (EXTK[t]) out.push([0, EXTK[t]]);
  else if (/^Ctrl-[A-Z]$/i.test(t)) out.push([t.toUpperCase().charCodeAt(5) - 64, 0]); } else out.push([s.charCodeAt(k), 0]); } return out; }   // {Ctrl-S} = ^S (#a-1)
for (const st of run.steps) st.keysParsed = parseKeys(st.keys || '');
// RUN-3 "auto" step: a seeded walk driven by the menu on screen (engine/input.js gamepad.menuLetters = hot keys of the
// last HorizontalMenu) and the ECL game state. Explore menu (Area Cast View Encamp Search Look) -> a move (forward 60 %,
// turn 30 %, Search toggle 5 %, Look 5 %), Encamp once after campAt moves (then Exit); encounter menus -> Combat;
// combat -> Quick; treasure -> Exit; Yes/No -> N (Y when the same prompt comes straight back); while nothing changes:
// Enter / Esc / N / Y / E / Enter / Up in turn. Ends after `moves` moves outside combat, `max` iterations, 3 timeouts,
// a dead party or an ENGINE ERROR. Event texts: the VM host's drawWrappedText is wrapped (ECL PRINT / PRINTCLEAR 2F00:0A09).
async function autoWalk(st, n, evalv, waitIdle) {
  const a = st.auto;
  let seed = (a.seed ?? 1) >>> 0;
  const rnd = () => {                                             // mulberry32
    seed = (seed + 0x6D2B79F5) >>> 0; let x = seed;
    x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
  await evalv(`(async () => { const h = await import('/areas/ecl_host.js'); const v = h.vm;
    window.__texts = window.__texts || [];
    if (v && v.host && !v.host.__qaHooked) { const o = v.host.drawWrappedText; v.host.drawWrappedText = async function (...x) {
      try { const t = String(x[6] ?? ''); if (t.trim()) window.__texts.push(t); } catch (e) { /* */ } return o.apply(this, x); };
      v.host.__qaHooked = true; } return true; })()`);
  const state = async () => JSON.parse((await evalv(`(async () => { const i = await import('/engine/input.js');
    const e = (await import('/areas/ecl_host.js')).eclG;
    return JSON.stringify({ L: i.gamepad.menuLetters.join(''), mode: e.g_49F3, x: e.party_MapX, y: e.party_MapY, d: e.party_Dir,
      blk: e.ecl_Block, ds: e.DataSet, dead: !!e.PartyDead, nt: (window.__texts || []).length,
      cs: e.g_49F3 === 5 ? (() => { let s = ''; let k = 0; for (let p = e.PartyHead; p; p = p.next, k++)
        s += (p === e.SelectedChar ? '*' : '') + p.b[0x11B] + ':' + (p.combat ? p.combat.b[3] + '.' + p.combat.b[6] : '') + ','; return s; })() : '' }); })()`)) || '{}');
  const feed = async (keys) => evalv(`(async () => { const i = await import('/engine/input.js'); window.__screenReady = false;
    i.script.keys = ${JSON.stringify(parseKeys(keys))}; return true; })()`);
  const shot = async (tag) => {
    const data = await evalv(`(() => { const E = window.E; if (E) E.pic.display.present(); return document.getElementById('screen').toDataURL('image/png'); })()`);
    if (data) writeFileSync(join(OUT, `${String(n + 1).padStart(2, '0')}-${st.name}-${tag}.png`), Buffer.from(data.split(',')[1], 'base64'));
  };
  const res = { moves: 0, iterations: 0, fights: 0, camped: false, timeouts: 0, blocks: [], menus: {}, log: [] };
  let prev = await state(), same = 0, lastYN = '', inCombat = false;
  res.start = prev;
  res.blocks.push(`${prev.ds}_${prev.blk}`);
  await shot('start');
  const isExplore = (L) => ['C', 'V', 'E', 'S', 'L'].every((c) => L.includes(c)) && L.length <= 7;   // 3D (Area ...) and overland (no Area)
  while (res.iterations < (a.max || 300) && !(res.moves >= (a.moves || 40) && !inCombat)) {
    const S = prev, L = S.L;
    let k;
    if (S.dead) { res.log.push('party dead'); break; }
    if (S.mode === 5) {                                           // combat
      if (!inCombat) { inCombat = true; res.fights++; await shot(`fight${res.fights}`); }
      if (a.stopAtCombat && L.includes('V') && L.includes('Q')) { res.log.push('stopAtCombat'); break; }   // opt-in: leave the party's first combat menu to the next steps (#a-9)
      if (same >= 8) {                                            // nothing changes in combat: dump the party's combat state, stop
        res.stuck = JSON.parse((await evalv(`(async () => { const e = (await import('/areas/ecl_host.js')).eclG; const o = [];
          for (let p = e.PartyHead; p; p = p.next) o.push({ name: String.fromCharCode(...p.b.slice(1, 1 + p.b[0])), status: p.b[0x10C],
            active: p.b[0x10D], side: p.b[0x10E], controlled: p.b[0x10F], hp: p.b[0x11B], sel: p === e.SelectedChar,
            cr: p.combat ? Array.from(p.combat.b.slice(0, 0x16)) : null, target: !!(p.combat && p.combat.target) });
          return JSON.stringify({ party: o, magicOn: e.MagicOn, round: e.g_6DE3 }); })()`)) || 'null');
        res.log.push(`combat stuck at menu ${L}`); await shot('stuck'); break;
      }
      k = same >= 3 ? ['{Enter}', '{Esc}', 'N'][(same - 3) % 3] : L.includes('Q') && L.includes('D') ? 'Q' : L === 'YN' ? 'N' : '{Enter}';   // YN in combat = 'Continue Battle:' (4800:0971) -> N
    } else {
      if (inCombat) { inCombat = false; await shot(`fight${res.fights}-end`); }
      if (same >= 2) k = ['{Enter}', '{Esc}', 'N', 'Y', 'E', '{Enter}', '{Up}'][(same - 2) % 7];
      else if (isExplore(L)) {
        if (!res.camped && res.moves >= (a.campAt ?? 20)) { k = 'E'; res.camped = true; }
        else {
          const r = rnd();
          k = r < 0.6 ? '{Up}' : r < 0.75 ? '{Left}' : r < 0.9 ? '{Right}' : r < 0.95 ? 'S' : 'L';
          if (k.startsWith('{')) res.moves++;
        }
      } else if (L.startsWith('SVMRA') && L.endsWith('E')) k = 'E';           // Camp menu -> leave
      else if (['C', 'V', 'B', 'E'].every((c) => L.includes(c)) && L.length >= 8) { k = 'B'; res.log.push('party menu -> Begin'); }   // never Exit to DOS
      else if (L.includes('C') && L.includes('F') && !L.includes('D')) k = 'C';  // encounter menu (Combat Wait Flee Parlay ...)
      else if (L.startsWith('VT') || L.startsWith('VP')) k = 'E';                 // treasure / pool menus
      else if (L === 'YN') { const key = `${S.x},${S.y},${S.nt}`; k = lastYN === key ? 'Y' : 'N'; lastYN = key; }
      else if (L.includes('E')) k = 'E';
      else k = L ? L[(res.menus[L] || 0) % L.length] : '{Enter}';   // unknown menu: rotate through its options
    }
    res.menus[L] = (res.menus[L] || 0) + 1;
    await feed(k);
    const ok = await waitIdle();
    if (!ok) { res.timeouts++; res.log.push(`timeout after ${k} (menu ${L})`); if (res.timeouts >= 3) break; }
    res.iterations++;
    const N = await state();
    const changed = N.L !== S.L || N.x !== S.x || N.y !== S.y || N.d !== S.d || N.mode !== S.mode || N.nt !== S.nt || N.blk !== S.blk || N.cs !== S.cs;
    same = changed ? 0 : same + 1;
    if (N.blk !== S.blk || N.ds !== S.ds) { res.blocks.push(`${N.ds}_${N.blk}`); await shot(`block${N.ds}_${N.blk}`); }
    if (res.iterations % 25 === 0) await shot(`i${res.iterations}`);
    prev = N;
    if (s.errors.some((e) => /ENGINE ERROR/.test(e))) { res.log.push('ENGINE ERROR'); break; }
  }
  res.final = { ...prev, cs: undefined };
  res.texts = JSON.parse((await evalv('JSON.stringify(window.__texts || [])')) || '[]');
  await shot('end');
  return res;
}

const report = [];
let s = null;
try {
  const url = `${BASE}?screen=idle&${run.query || ''}`;
  const tab = await getJSON(`/json/new?${encodeURIComponent(url)}`, 'PUT');
  s = await connect(tab.webSocketDebuggerUrl);
  await s.send('Runtime.enable');
  const evalv = async (expr) => (await s.send('Runtime.evaluate', { expression: expr, awaitPromise: true })).result?.result?.value;
  for (let n = 0; n < run.steps.length; n++) {
    const st = run.steps[n];
    const e0 = s.errors.length;
    if (st.inject) {                                  // save files from a folder into the browser file store, then reload
      const dir = join(ROOT, st.inject);
      for (const f of readdirSync(dir).filter((x) => !x.startsWith('.'))) {
        const b64 = readFileSync(join(dir, f)).toString('base64');
        await evalv(`(async () => { const m = await import('/engine/files.js');
          await m.writeFile(${JSON.stringify(f)}, Uint8Array.from(atob(${JSON.stringify(b64)}), (c) => c.charCodeAt(0))); return true; })()`);
      }
      st.reload = true;
    }
    if (st.reload) {                                  // restart the program in the same tab (same browser file store)
      await s.send('Page.enable');
      await s.send('Page.navigate', { url });
      await sleep(1500);
    }
    if (!st.reload && (n > 0 || st.keys)) {
      // feed this step's keys through the engine's key script and wait for the next idle
      await evalv(`(async () => { const i = await import('/engine/input.js'); const d = await import('/engine/dev.js');
        window.__screenReady = false; d.dev.target = 'idle';
        i.script.keys = ${JSON.stringify(st.keysParsed || [])};               // parseKeys above (one parser; {Ctrl-X} #a-1)
        i.script.readyWhenIdle = true; return true; })()`);
    }
    if (st.pointer) {                                 // synthetic mouse events at 320x200 game points (engine/input.js pointer layer)
      await evalv(`(async () => { const c = document.getElementById('screen'); const r = c.getBoundingClientRect();
        for (const p of ${JSON.stringify(st.pointer)}) {
          window.__screenReady = false;
          const o = { clientX: r.left + (p.x + 0.5) * r.width / 320, clientY: r.top + (p.y + 0.5) * r.height / 200, bubbles: true, cancelable: true };
          if (p.wheel) c.dispatchEvent(new WheelEvent('wheel', { ...o, deltaY: p.wheel }));
          else if (p.button === 2) c.dispatchEvent(new MouseEvent('contextmenu', { ...o, button: 2 }));
          else c.dispatchEvent(new MouseEvent('mousedown', { ...o, button: 0 }));
          await new Promise((res) => setTimeout(res, p.wait ?? 600));
        }
        window.__screenReady = false; return true; })()`);
    }
    const waitIdle = async () => {
      const t0 = Date.now();
      while (Date.now() - t0 < (st.ms || STEP_MS)) {
        if (await evalv('window.__screenReady === true')) return true;
        await sleep(250);
      }
      return false;
    };
    let ready = await waitIdle();
    if (st.auto && ready) st.autoResult = await autoWalk(st, n, evalv, waitIdle);
    // repeat: feed the step's keys again (up to st.repeat times) until the page expression st.until is true
    let reps = 1;
    if (st.until) {
      while (ready && !(await evalv(`(async () => { try { return !!(${st.until}); } catch (e) { return false; } })()`)) && reps < (st.repeat || 20)) {
        await evalv(`(async () => { const i = await import('/engine/input.js'); window.__screenReady = false;
          i.script.keys = ${JSON.stringify(st.keysParsed || null)} || []; return true; })()`);
        ready = await waitIdle(); reps++;
      }
      st.reps = reps;
    }
    if (st.probe) {                                   // log the value of a page expression after the step (diagnostics)
      const pv = await evalv(`(async () => { try { return JSON.stringify(await (async () => (${st.probe}))()); } catch (e) { return 'probe error: ' + e.message; } })()`);
      console.log(`${run.name} ${n + 1} probe: ${pv}`);
    }
    await sleep(300);
    const data = await evalv(`(() => { const E = window.E; if (E) E.pic.display.present();
      return document.getElementById('screen').toDataURL('image/png'); })()`);
    const file = `${String(n + 1).padStart(2, '0')}-${st.name}.png`;
    const png = data ? Buffer.from(data.split(',')[1], 'base64') : null;
    if (png) writeFileSync(join(OUT, file), png);
    const errs = s.errors.slice(e0);
    report.push({ step: n + 1, name: st.name, keys: st.keys || '', ref: st.ref || '', file, sha256: png ? sha256(png) : null, ready, reps: st.reps || 1, errors: errs, ...(st.autoResult ? { auto: st.autoResult } : {}) });
    console.log(`${run.name} ${n + 1} ${st.name}${st.reps ? ' x' + st.reps : ''}: ${ready ? 'idle' : 'TIMEOUT'}${errs.length ? ' errors: ' + errs.join(' | ').slice(0, 600) : ''}`);
    if (errs.some((e) => /ENGINE ERROR/.test(e)) || (errs.some((e) => /SyntaxError/.test(e)) && !ready)) { console.log(`${run.name}: aborted (page did not load / program stopped)`); break; }
  }
} finally {
  try { s && s.close(); } catch { /* */ }
  chrome.kill();
  await sleep(500);
  releaseLock();
  writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1));
  writeFileSync(reportPath('integration', run.name), JSON.stringify({ run: run.name, query: run.query || '', steps: report }, null, 1));
}
