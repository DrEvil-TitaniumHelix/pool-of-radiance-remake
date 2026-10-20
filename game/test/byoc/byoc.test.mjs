// game/test/byoc/byoc.test.mjs — BYOC step 2: engine/byoc.js validation + IndexedDB import with a fake IDB.
// Uses the local originals (POR_DATA, outside the repo) when present; the synthetic cases run without them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeFakeIDB } from './fakeidb.mjs';
import * as byoc from '../../engine/byoc.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const POR = process.env.POR_DATA || path.resolve(ROOT, '../re-targets/goldbox/por/POOLRAD');
const man = JSON.parse(readFileSync(path.join(ROOT, 'game/byoc/manifest-por-1.3.json'), 'utf8'));
byoc.setManifest(man);
const HAVE = existsSync(POR);

// candidates as the file-list collector makes them, from a real folder (prefix = top folder name, as webkitRelativePath)
function folderCands(dir, prefix = 'POOLRAD/') { return byoc.collectFromFileList(rawFiles(dir, prefix)); }
function rawFiles(dir, prefix) {
  const out = [];
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...rawFiles(p, prefix + f.name + '/'));
    else { const b = new Uint8Array(readFileSync(p)); out.push({ name: f.name, webkitRelativePath: prefix + f.name, size: b.length, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.length) }); }
  }
  return out;
}

test('empty / wrong folder: nothing ok, every required file missing (F1)', async () => {
  const rep = await byoc.validate(byoc.collectFromFileList([{ name: 'README.TXT', size: 3, arrayBuffer: async () => new ArrayBuffer(3) }]));
  assert.equal(rep.ok, false);
  assert.equal(rep.okCount, 0);
  assert.equal(rep.files.filter((f) => f.required && f.status === 'missing').length, 115);
  assert.equal(rep.likelyOtherVersion, false);
  assert.equal(rep.gameOvr, 'absent');
});

test('import refused for a failed report', async () => {
  byoc.setIndexedDB(makeFakeIDB());
  await assert.rejects(byoc.importFiles({ ok: false, manifestId: 'por-1.3' }), /import refused/);
  assert.equal(await byoc.isImported(), false);
});

test('real copy: validate ok, import in one transaction, read back, saves into the save store', { skip: !HAVE && 'no originals' }, async () => {
  byoc.setIndexedDB(makeFakeIDB());
  const cands = folderCands(POR);
  let calls = 0;
  const rep = await byoc.validate(cands, { onProgress: () => calls++ });
  assert.equal(rep.ok, true, JSON.stringify(rep.files.filter((f) => f.status !== 'ok').slice(0, 3)));
  assert.equal(rep.okCount, 115);
  assert.equal(calls, Object.keys(man.files).length);
  assert.equal(rep.gameOvr, 'match');
  assert.ok(rep.saves.length > 0 && rep.saves.every((s) => s.ok), `shipped SAVE/ files recognised: ${rep.saves.length} ${JSON.stringify(rep.saves.filter((s) => !s.ok).map((s) => [s.name, s.size, s.reason]))}`);
  const r = await byoc.importFiles(rep);
  assert.equal(r.stored, 115);
  assert.equal(r.bytes, 1351836);
  assert.equal(await byoc.isImported(), true);
  const meta = await byoc.info();
  assert.equal(meta.manifest, 'por-1.3');
  // read back through a fresh module state (no cache): same bytes
  const idb = makeFakeIDB();
  byoc.setIndexedDB(idb);
  await byoc.importFiles(rep);
  byoc.setIndexedDB(idb);                                   // clears the cache, keeps the database
  const start = await byoc.get('start.exe');
  assert.deepEqual(start, new Uint8Array(readFileSync(path.join(POR, 'START.EXE'))));
  assert.equal(await byoc.get('NOPE.DAX'), null);
  assert.equal(await byoc.preload(), 115);
  // quota failure: the transaction aborts and nothing is kept
  const bad = makeFakeIDB(); bad.failPuts = true;
  byoc.setIndexedDB(bad);
  await assert.rejects(byoc.importFiles(rep));
  assert.equal(await byoc.isImported(), false);
  await byoc.removeGameFiles().catch(() => {});
});

test('one corrupted DAX: report names it (hash), import refused (F3)', { skip: !HAVE && 'no originals' }, async () => {
  const cands = folderCands(POR).map((c) => (c.name !== 'GEO1.DAX' ? c : { ...c, read: async () => { const b = await c.read(); b[100] ^= 0xFF; return b; } }));
  const rep = await byoc.validate(cands);
  assert.equal(rep.ok, false);
  assert.deepEqual(rep.files.filter((f) => f.status !== 'ok' && f.required).map((f) => [f.name, f.status]), [['GEO1.DAX', 'hash']]);
  assert.equal(rep.likelyOtherVersion, true);
});

test('lower-case names and a nested folder are accepted (F4)', { skip: !HAVE && 'no originals' }, async () => {
  const cands = folderCands(POR, 'games/PoolRad/').map((c) => ({ ...c, path: c.path.toLowerCase() }));
  const rep = await byoc.validate(cands);
  assert.equal(rep.ok, true);
});

test('importSaves: shipped saves go into the save store, an existing save is never overwritten (§4.4, F10)', { skip: !HAVE && 'no originals' }, async () => {
  const files = await import('../../engine/files.js');
  await files.writeFile('SAVGAMA.DAT', new Uint8Array(13137).fill(7));        // the player's own save of the same name
  const rep = await byoc.validate(folderCands(POR));
  const r = await byoc.importSaves(rep);
  assert.ok(r.imported.includes('CHRDATA1.SAV'));
  assert.deepEqual(r.conflicts, ['SAVGAMA.DAT']);
  assert.equal((await files.readFile('SAVGAMA.DAT'))[0], 7);
  assert.deepEqual(await files.readFile('CHRDATA1.SAV'), new Uint8Array(readFileSync(path.join(POR, 'SAVE', 'CHRDATA1.SAV'))));
  const r2 = await byoc.importSaves(rep, { replace: true });
  assert.ok(r2.imported.includes('SAVGAMA.DAT'));
});
