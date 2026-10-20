// acceptance/runlock.mjs (por-fixer) — the shared run lock (the owner's load rule: one headless Chrome/DOSBox at a time).
// Same protocol as acceptance/lock.sh, so node runs and shell wrappers exclude each other:
//   - acquire = mkdir acceptance/.runlock (atomic), then acceptance/.runlock/owner = key=value lines
//     lane, pid (Windows PID of the holding process), start (ISO), epoch (s), cmd, child, marker
//   - a waiter takes the lock over when the owner PID no longer exists, or when there is no readable owner PID and the
//     lock is older than 20 min (hand-made / half-written lock); takeover = rename the lock dir away (atomic, only one
//     waiter wins), log a line in acceptance/.runlock-takeovers.log, delete it, then mkdir as usual
//   - an orphaned headless Chrome of a killed holder (child PID whose command line contains the holder's marker) is
//     killed by PID on takeover — never by image name
//   - release only if the owner file still names us; released in finally, on exit and on SIGINT/SIGTERM/SIGHUP/SIGBREAK
//   - re-entrant under lock.sh: if POR_RUNLOCK_PID names the live owner (a parent shell holds the lock), acquire is a no-op
// Usage: import { acquireLock, setLockChild, onRelease, releaseLock } from '../runlock.mjs';
//        await acquireLock('por-build-qa run.mjs RUN-1');   ...   releaseLock();
import { mkdirSync, readFileSync, writeFileSync, renameSync, rmSync, statSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ACC = dirname(fileURLToPath(import.meta.url));
export const LOCK = join(ACC, '.runlock');
const OWNER = join(LOCK, 'owner');
const LOG = join(ACC, '.runlock-takeovers.log');
const STALE_MS = 20 * 60 * 1000;
const POLL_MS = 5000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let held = false;          // we created the lock (and must release it)
let mine = null;           // our owner record
const hooks = [];          // cleanup run on release by signal (e.g. kill our Chrome)

function readOwner(file = OWNER) {
  try {
    const o = {};
    for (const l of readFileSync(file, 'latin1').split(/\r?\n/)) { const i = l.indexOf('='); if (i > 0) o[l.slice(0, i)] = l.slice(i + 1); }
    return o;
  } catch { return null; }
}
function writeOwner(o) {
  const tmp = OWNER + '.' + process.pid;
  writeFileSync(tmp, Object.entries(o).map(([k, v]) => `${k}=${v}`).join('\n') + '\n', 'latin1');
  renameSync(tmp, OWNER);
}
export function pidAlive(pid) {
  pid = Number(pid);
  if (!(pid > 0)) return false;
  try { process.kill(pid, 0); return true; }                       // Windows: OpenProcess test, any PID
  catch (e) { return e.code === 'EPERM'; }
}
function lockAgeMs() { try { return Date.now() - statSync(LOCK).mtimeMs; } catch { return 0; } }
function log(line) { try { appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`); } catch { /* */ } }
function cmdLineOf(pid) {
  try {
    return execFileSync('powershell.exe', ['-NoProfile', '-Command',
      `(Get-CimInstance Win32_Process -Filter 'ProcessId=${Number(pid)}').CommandLine`], { encoding: 'utf8', timeout: 15000 }).trim();
  } catch { return ''; }
}
function killOrphan(o) {
  if (!o || !(Number(o.child) > 0) || !o.marker || !pidAlive(o.child)) return '';
  if (!cmdLineOf(o.child).includes(o.marker)) return ` (child ${o.child} alive but not ours: left)`;
  try { execFileSync('taskkill', ['/PID', String(Number(o.child)), '/T', '/F'], { stdio: 'ignore' }); return ` (orphan child ${o.child} killed)`; }
  catch { return ` (orphan child ${o.child}: kill failed)`; }
}
const describe = (o) => (o ? `lane=${o.lane || '?'} pid=${o.pid || '?'} start=${o.start || '?'}` : 'no owner file');

// stale -> reason string, else null
function staleReason(o) {
  if (o && Number(o.pid) > 0) return pidAlive(o.pid) ? null : `owner pid ${o.pid} gone`;
  const age = lockAgeMs();
  return age > STALE_MS ? `no owner pid, lock ${Math.round(age / 60000)} min old` : null;
}

function takeOver(seen, reason, name) {
  const away = `${LOCK}.stale-${process.pid}-${Date.now()}`;
  try { renameSync(LOCK, away); } catch { return; }               // another waiter won (or the holder released)
  const now = readOwner(join(away, 'owner'));
  if (now && seen && now.pid !== seen.pid && pidAlive(now.pid)) {  // raced a fresh holder: give it back
    try { renameSync(away, LOCK); return; } catch { /* lock was re-created meanwhile: the fresh holder lost it */ }
  }
  log(`TAKEOVER by ${name} pid=${process.pid}: ${reason}; old ${describe(now)}${killOrphan(now)}`);
  try { rmSync(away, { recursive: true, force: true }); } catch { /* */ }
}

export async function acquireLock(name = 'node ' + process.argv.slice(1).join(' ')) {
  if (held) return;
  const parent = Number(process.env.POR_RUNLOCK_PID);
  if (parent > 0) { const o = readOwner(); if (o && Number(o.pid) === parent && pidAlive(parent)) return; }   // lock.sh holds it
  let waited = false;
  for (;;) {
    try { mkdirSync(LOCK); break; }
    catch (e) { if (e.code !== 'EEXIST') throw e; }
    const o = readOwner();
    const why = staleReason(o);
    if (why) { takeOver(o, why, name); continue; }
    if (!waited) { console.error(`runlock: waiting for ${describe(o)}`); waited = true; }
    await sleep(POLL_MS);
  }
  mine = { lane: name.replace(/[\r\n]/g, ' '), pid: process.pid, start: new Date().toISOString(), epoch: Math.floor(Date.now() / 1000),
    cmd: process.argv.slice(1).join(' ').replace(/[\r\n]/g, ' ') };
  writeOwner(mine);
  held = true;
  installHandlers();
}

// record our Chrome so a waiter can kill it if we are killed hard (taskkill /F runs no handlers)
export function setLockChild(pid, marker) {
  if (!held) return;
  mine.child = pid; mine.marker = marker;
  try { writeOwner(mine); } catch { /* */ }
}
export function onRelease(fn) { hooks.push(fn); }

export function releaseLock() {
  if (!held) return;
  held = false;
  const o = readOwner();
  if (!o || Number(o.pid) !== process.pid || o.start !== mine.start) { log(`release skipped by pid=${process.pid}: lock now ${describe(o)}`); return; }
  try { rmSync(LOCK, { recursive: true, force: true }); } catch { /* */ }
}

let installed = false;
function installHandlers() {
  if (installed) return;
  installed = true;
  process.on('exit', releaseLock);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGBREAK']) {
    process.on(sig, () => {
      for (const f of hooks) { try { f(); } catch { /* */ } }
      releaseLock();
      process.exit(128 + ({ SIGINT: 2, SIGTERM: 15, SIGHUP: 1, SIGBREAK: 21 }[sig]));
    });
  }
}
