// game/test/byoc/manifest.test.mjs — BYOC step 1: the manifest por-1.3 matches the local original copy (docs/BYOC.md §2).
// The originals are read from POR_DATA (outside the repo, never modified); the test is skipped when the folder is missing.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const POR = process.env.POR_DATA || path.resolve(ROOT, '../re-targets/goldbox/por/POOLRAD');
const man = JSON.parse(readFileSync(path.join(ROOT, 'game/byoc/manifest-por-1.3.json'), 'utf8'));

test('manifest shape: 115 required files (START.EXE, ITEMS, 113 DAX), GAME.OVR optional', () => {
  const req = Object.entries(man.files).filter(([, f]) => f.required).map(([n]) => n);
  assert.equal(man.id, 'por-1.3');
  assert.equal(req.length, 115);
  assert.equal(man.requiredCount, 115);
  assert.ok(req.includes('START.EXE') && req.includes('ITEMS'));
  assert.equal(req.filter((n) => n.endsWith('.DAX')).length, 113);
  assert.equal(man.files['GAME.OVR'].required, false);
  for (const f of Object.values(man.files)) assert.match(f.sha256, /^[0-9a-f]{64}$/);
});

test('local POOLRAD copy matches the manifest', { skip: !existsSync(POR) && `no originals at ${POR}` }, () => {
  const onDisk = new Map(readdirSync(POR).map((f) => [f.toUpperCase(), f]));
  for (const [name, f] of Object.entries(man.files)) {
    const real = onDisk.get(name);
    if (!real) { assert.ok(!f.required, `missing required ${name}`); continue; }
    const b = readFileSync(path.join(POR, real));
    assert.equal(b.length, f.size, `${name} size`);
    assert.equal(createHash('sha256').update(b).digest('hex'), f.sha256, `${name} sha256`);
  }
});
