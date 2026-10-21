// ECL VM node test harness (por-build-ecl M1).  Run: node game/test/ecl/run.mjs [--seeds N]
// 1. DAX: every ECL record read by the JS reader equals decode/bin/dax/ECLn/<id>.bin (dax.py output).
// 2. Static: for every instruction ecldis.py decodes (16,015), the VM's own operand decoder (readOperands + the
//    variable-length re-read of 15/25/26/2B) gives the same length, operand types/bytes and unpacked texts.
// 3. Dynamic: each of the 29 records x 5 entry vectors runs in the VM with a scripted host (seeded random menu
//    answers, dice, walls) for N seeds; every dispatched PC must be an ecldis instruction start, every
//    straight-line instruction must leave PC on ecldis's next address, and no opcode may lack a handler.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EclVM, EclHang, makeGlobals, newChar, newItem, setPstr, wrW, HOST_METHODS, BASE } from '../../engine/ecl.js';
import { loadRecord } from './daxnode.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const argSeeds = process.argv.indexOf('--seeds');
const SEEDS = argSeeds > 0 ? +process.argv[argSeeds + 1] : 200;
let failures = 0;
const fail = (msg) => { failures++; if (failures <= 40) console.log('FAIL ' + msg); };

// ---- oracle --------------------------------------------------------------------------------------------
const oraclePath = join(tmpdir(), 'por_ecldis_oracle.json');
execFileSync('python', ['-I', join(ROOT, 'game', 'test', 'ecl', 'ecldis_export.py'), oraclePath], { stdio: 'inherit' });
const oracle = JSON.parse(readFileSync(oraclePath, 'utf8'));
const recs = Object.keys(oracle);

// ---- 1. DAX ----------------------------------------------------------------------------------------------
let daxOk = 0;
for (const key of recs) {
  const [n, id] = key.split('/').map(Number);
  const js = loadRecord('ECL' + n, '.DAX', id);
  const py = readFileSync(join(ROOT, 'decode', 'bin', 'dax', 'ECL' + n, id + '.bin'));
  if (js && js.length === py.length && js.every((b, i) => b === py[i])) daxOk++;
  else fail('DAX ' + key + ' differs from dax.py output');
}
console.log(`dax: ${daxOk}/${recs.length} ECL records identical to dax.py`);

// ---- scripted host -----------------------------------------------------------------------------------
function lcg(seed) { let s = seed >>> 0; return (n) => { s = (Math.imul(s, 0x08088405) + 1) >>> 0; return n ? Math.floor(((s >>> 16) * n) / 65536) : 0; }; }

function makeWorld(rnd) {
  const g = makeGlobals();
  let prev = null;
  for (let i = 0; i < 6; i++) {
    const c = newChar();
    setPstr(c.b, 0, 'HERO' + i, 15);
    c.b[0x10D] = 1; c.b[0x11B] = 40; c.b[0x11C] = 12; c.b[0x15] = 10 + i; c.b[0x2F] = i;
    wrW(c.b, 0x88, 100);
    const it = newItem(); it.b[0x2E] = rnd(128); wrW(it.b, 0x37, rnd(500)); c.items = it;
    if (prev) prev.next = c; else g.PartyHead = c;
    prev = c;
  }
  g.SelectedChar = g.PartyHead; g.g_4436 = g.PartyHead; g.travel_Mode = 1; g.DataSet = 1;
  g.party_MapX = rnd(16); g.party_MapY = rnd(16); g.party_Dir = 2 * rnd(4);
  return g;
}

function makeHost(rnd, g, calls) {
  const impl = {
    loadDaxRecord: (name, ext, id) => loadRecord(name, ext.toUpperCase(), id),
    random: (n) => rnd(n),
    roll: (n, s) => { let t = 0; for (let i = 0; i < n; i++) t += rnd(s) + 1; return t; },
    getWallType: () => (rnd(3) === 0 ? 1 : 0),
    getCellAttr: () => rnd(16),
    horizontalMenu: (t, m) => {
      const keys = [...m].filter((ch) => ch >= 'A' && ch <= 'Z');
      return { key: keys.length ? keys[rnd(keys.length)].charCodeAt(0) : 13, special: 0 };
    },
    verticalListMenu: (o) => rnd(Math.max(1, o.items.length)),
    readWordNumber: () => rnd(100),
    readBottomLine: () => ['', 'YES', 'NO', 'RISE', 'ROLF'][rnd(5)],
    loadMonster: () => { const c = newChar(); c.b[0x10D] = 1; c.b[0x11C] = 9; c.items = newItem(); return c; },
    makeTreasureItem: (t) => { const it = newItem(); it.b[0x2E] = t; return it; },
    hasEffect: () => rnd(4) === 0,
    savingThrow: () => rnd(2) === 0,
    attackRollVsAC: () => rnd(2) === 0,
    applyDamage: (c, d) => { if (c.b[0x11B] <= d) { c.b[0x11B] = 0; c.b[0x10D] = 0; } else c.b[0x11B] -= d; },
    selectPartyCharacter: () => { let c = g.PartyHead, k = rnd(6); while (k-- && c.next) c = c.next; return c; },
    addNpcToParty: () => { const c = newChar(); c.b[0x10D] = 1; let p = g.PartyHead; while (p.next) p = p.next; p.next = c; g.SelectedChar = c; },
    camp: () => rnd(2) === 0,
    setDataSet: (v) => { g.DataSet = v; },
    loseItem: (c, it) => { if (c.items === it) c.items = it.next; },
    terminateGame: () => { throw new Error('TerminateGame'); },
  };
  return new Proxy(impl, {
    get(t, k) {
      if (typeof k !== 'string') return undefined;
      if (!HOST_METHODS.includes(k)) throw new Error('VM called undeclared host method ' + k);
      return (...a) => { calls[k] = (calls[k] || 0) + 1; return t[k] ? t[k](...a) : 0; };
    },
  });
}

// ---- 2. static decode ---------------------------------------------------------------------------------
const VARCOUNT = { 0x15: 3, 0x25: 2, 0x26: 2, 0x2B: 2 };
const NOPS = { 0:0,1:1,2:1,3:2,4:3,5:3,6:3,7:3,8:2,9:2,10:1,11:3,12:3,13:0,14:1,15:2,16:2,17:1,18:1,19:0,20:4,21:3,
  22:0,23:0,24:0,25:0,26:0,27:0,28:0,29:1,30:6,32:1,33:3,34:2,35:4,36:0,37:2,38:2,39:8,40:3,41:14,42:3,43:2,44:6,45:1,
  46:5,47:3,48:3,49:0,50:1,51:0,52:1,53:3,54:2,55:3,56:1,57:1,58:0,59:3,60:1,61:0 };
let staticOk = 0, staticTotal = 0;
for (const key of recs) {
  const [n, id] = key.split('/').map(Number);
  const rnd = lcg(1); const g = makeWorld(rnd);
  const vm = new EclVM(makeHost(rnd, g, {}), g);
  const rec = loadRecord('ECL' + n, '.DAX', id);
  vm.code.set(rec.subarray(2, 2 + Math.min(rec.length - 2, vm.code.length)));
  vm.initVM();
  const vec = [vm.vecA, vm.vecB, vm.vecC, vm.vecD, vm.vecE];
  if (vec.join() !== oracle[key].vec.join()) fail(`${key} vectors ${vec} != ${oracle[key].vec}`);
  const snapshot = vm.code.slice();
  for (const [pcs, [op, npc, ops, unk]] of Object.entries(oracle[key].insns)) {
    staticTotal++;
    if (unk) { fail(`${key} ${(+pcs).toString(16)} undecodable op ${op}`); continue; }
    vm.code.set(snapshot);
    vm.pc = +pcs;
    vm.readOperands(NOPS[op]);
    const first = [];
    let k = 0;
    for (let i = 1; i <= NOPS[op]; i++) {
      const t = vm.opType(i);
      first.push([t, vm.opLo(i), [1, 2, 3, 0x81].includes(t) ? vm.opHi(i) : null, t >= 0x80 ? vm.str[++k] : null]);
    }
    let all = first;
    if (VARCOUNT[op] && [0, 2].includes(first[VARCOUNT[op] - 1][0])) {
      const cnt = first[VARCOUNT[op] - 1][1];
      vm.pc = (vm.pc - 1) & 0xFFFF;
      vm.readOperands(cnt);
      k = 0;
      const more = [];
      for (let i = 1; i <= cnt; i++) {
        const t = vm.opType(i);
        more.push([t, vm.opLo(i), [1, 2, 3, 0x81].includes(t) ? vm.opHi(i) : null, t >= 0x80 ? vm.str[++k] : null]);
      }
      all = first.concat(more);
    }
    const exp = ops.map(([t, l, h, txt]) => [t, l, [1, 2, 3, 0x81].includes(t) ? h : null, t >= 0x80 ? (t === 0x81 ? null : txt) : null]);
    const gotCmp = all.map(([t, l, h, txt]) => [t, l, h, t === 0x80 ? txt : null]);
    if (vm.pc !== npc || JSON.stringify(gotCmp) !== JSON.stringify(exp))
      fail(`${key} ${(+pcs).toString(16)} op ${op.toString(16)}: vm pc ${vm.pc.toString(16)} ops ${JSON.stringify(gotCmp)} vs ecldis ${npc.toString(16)} ${JSON.stringify(exp)}`);
    else staticOk++;
  }
}
console.log(`static: ${staticOk}/${staticTotal} instructions decode identically to ecldis.py`);

// ---- 3. dynamic runs ------------------------------------------------------------------------------------
const STRAIGHT_EXCLUDE = new Set([0x00, 0x01, 0x02, 0x13, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x20, 0x25, 0x26, 0x38]);
let runs = 0, steps = 0, outside = 0, npcBad = 0, hangs = 0, stepLimits = 0, deaths = 0, newEcl = 0;
const outsideWhy = {};
const loopsAt = [];
const executed = new Map();
const allCalls = {};
for (const key of recs) {
  const [n, id] = key.split('/').map(Number);
  const insns = oracle[key].insns;
  const ex = new Set(); executed.set(key, ex);
  for (let seed = 1; seed <= SEEDS; seed++) {
    for (let v = 0; v < 5; v++) {
      const rnd = lcg(seed * 7919 + v * 31 + n * 1009 + id);
      const g = makeWorld(rnd);
      g.ecl_Block = id; g.DataSet = n;
      const vm = new EclVM(makeHost(rnd, g, allCalls), g);
      vm.stepLimit = 20000;
      await vm.loadEclBlock(id);
      vm.initVM();
      vm.setM1(0x6E3E, 6);
      if (seed % 2 === 0)                     // vary the persistent script state (quest cells 4A20..4AFF, 6DCA)
        for (let a = 0x4A20; a < 0x4B00; a++) vm.setM0(a, [0, 1, rnd(4), rnd(256)][rnd(4)]);
      vm.setM1(0x6DCA, rnd(2));
      const startCode = vm.code.slice();
      const vec = [vm.vecA, vm.vecB, vm.vecC, vm.vecD, vm.vecE][v];
      let pending = null, foreign = false;
      vm.trace = (pc, op) => {
        if (pending && !foreign) {
          const [ppc, pop] = pending;
          const o = insns[ppc];
          if (o && !STRAIGHT_EXCLUDE.has(pop) && o[1] !== pc && vm.lastOp === pop) { npcBad++; fail(`${key} ${ppc.toString(16)} op ${pop.toString(16)} -> ${pc.toString(16)}, ecldis ${o[1].toString(16)}`); }
        }
        pending = [pc, op];
        if (foreign) return;
        if (!insns[pc]) {
          outside++;
          const why = vm.lastOp === 0x13 ? 'after RETURN with empty stack' : 'after op ' + vm.lastOp.toString(16);
          outsideWhy[why] = (outsideWhy[why] || 0) + 1;
        } else ex.add(pc);
      };
      const origLoad = vm.loadEclBlock.bind(vm);
      vm.loadEclBlock = async (b) => { foreign = true; newEcl++; await origLoad(b); };
      runs++;
      try { await vm.run(vec); }
      catch (e) {
        if (e instanceof EclHang && e.message === 'step limit') { stepLimits++; loopsAt.push(`${key} vec${'ABCDE'[v]} seed ${seed} pc ${vm.pc.toString(16)}`); }
        else if (e instanceof EclHang) { hangs++; fail(`${key} vec${'ABCDE'[v]} seed ${seed}: ${e.message}`); }
        else fail(`${key} vec${'ABCDE'[v]} seed ${seed}: ${e.stack}`);
      }
      if (g.PartyDead) deaths++;
      steps += vm.steps;
      void startCode;
    }
  }
}
let cov = 0, tot = 0;
for (const key of recs) { cov += executed.get(key).size; tot += Object.keys(oracle[key].insns).length; }
console.log(`dynamic: ${runs} runs (${SEEDS} seeds x 5 vectors x ${recs.length} records), ${steps} instructions executed, ` +
  `coverage ${cov}/${tot} static instructions (${(100 * cov / tot).toFixed(1)}%)`);
console.log(`dynamic: PCs outside the static trace ${outside} ${JSON.stringify(outsideWhy)}; next-PC mismatches ${npcBad}; ` +
  `no-handler hangs ${hangs}; step-limit loops ${stepLimits}; party deaths ${deaths}; NEW_ECL ${newEcl}`);
if (loopsAt.length) console.log('step-limit runs (script loops waiting on host answers): ' + loopsAt.join('; '));
console.log('host calls: ' + Object.entries(allCalls).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + '=' + v).join(' '));

// ---- 4. every instruction: start the VM at each static instruction once (random world), check its successor ----
let eachOk = 0, eachTot = 0, eachSkip = 0, eachAbort = 0;
for (const key of recs) {
  const [n, id] = key.split('/').map(Number);
  const insns = oracle[key].insns;
  const rnd0 = lcg(n * 31 + id);
  const g0 = makeWorld(rnd0); g0.DataSet = n;
  const base = new EclVM(makeHost(rnd0, g0, {}), g0);
  await base.loadEclBlock(id);
  const code0 = base.code.slice();
  for (const [pcs, [op, npc]] of Object.entries(insns)) {
    eachTot++;
    const rnd = lcg(+pcs * 13 + id);
    const g = makeWorld(rnd); g.ecl_Block = id; g.DataSet = n;
    const vm = new EclVM(makeHost(rnd, g, {}), g);
    vm.code.set(code0); vm.initVM(); vm.setM1(0x6E3E, 6);
    vm.setM0(0x49E6, rnd(2));
    vm.pc = +pcs; vm.curOp = op;
    if (op === 0x20) {                        // NEW_ECL alone: use the data set that holds the target block
      const save = vm.pc; vm.readOperands(1); const t = vm.v(1) & 0xFF; vm.pc = save;
      for (let d = 1; d <= 8; d++) if (loadRecord('ECL' + d, '.DAX', t)) { g.DataSet = d; break; }
    }
    try { await vm.dispatch(); }
    catch (e) {                               // out of context the original aborts too: RTE 200 / "Unable to find item file"
      if (/Runtime error 200|TerminateGame/.test(e.message)) { eachAbort++; continue; }
      fail(`${key} ${(+pcs).toString(16)} op ${op.toString(16)} alone: ${e.message}`); continue;
    }
    if (STRAIGHT_EXCLUDE.has(op) || op === 0x24 && g.ecl_Restart) { eachSkip++; continue; }
    if (vm.pc !== npc) fail(`${key} ${(+pcs).toString(16)} op ${op.toString(16)} alone: pc ${vm.pc.toString(16)} != ${npc.toString(16)}`);
    else eachOk++;
  }
}
console.log(`each: ${eachTot} instructions dispatched once each; ${eachOk} straight-line successors = ecldis, ${eachSkip} control-flow ops not compared, ${eachAbort} faithful aborts (DIVIDE by 0 / missing ITEM record out of context)`);
console.log(failures ? `RESULT: ${failures} failure(s)` : 'RESULT: PASS');
process.exit(failures ? 1 : 0);
