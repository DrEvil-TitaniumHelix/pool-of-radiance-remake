// W5 quests (gbp-flags): ECL text decoder, quest state machine, hook wiring. node --test game/test/plus/quests.test.mjs
// Game texts are never written here: the decoder is checked by a round trip and, when the local decode exists, against
// the FINAL script document; quest texts in the state tests are placeholders.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { QUESTS, STATUS_RANK, cellIndex, textRefs, refKey } from '../../plus/quests/table.js';
import { unpackText, textAt, loadQuestTexts } from '../../plus/quests/text.js';
import { createQuestLog } from '../../plus/quests/log.js';
import { startQuests, saveSlot } from '../../plus/quests/quests.js';
import { questText } from '../../plus/tabs/quests.js';

const ROOT = new URL('../../../', import.meta.url);
const ID = Object.fromEntries(Object.entries(QUESTS).map(([k, q]) => [q.id, Number(k)]));

// the inverse of ECL_VM.md §2.2 (6-bit codes, 'A'..'_' = 01..1F, ' '..'?' = 20..3F)
function pack(s) {
  const codes = [...s].map((ch) => { const c = ch.charCodeAt(0); return c >= 0x40 ? c - 0x40 : c; });
  while (codes.length % 4) codes.push(0);
  const out = [];
  for (let i = 0; i < codes.length; i += 4) { const [a, b, c, d] = codes.slice(i, i + 4); out.push((a << 2) | (b >> 4), ((b & 15) << 4) | (c >> 2), ((c & 3) << 6) | d); }
  return out;
}
const placeholder = () => new Map(textRefs().map((r) => [refKey(r), `TEXT ${refKey(r)}`]));

test('table: ids unique, every rule cell is a saved script cell, statuses known', () => {
  const ids = Object.values(QUESTS).map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const [key, q] of Object.entries(QUESTS)) {
    assert.ok(Number(key) >= 0x4A20 && Number(key) <= 0x4AFF, q.id);
    for (const [cell, , , s] of q.rules) { assert.ok(cell >= 0x4A20 && cell <= 0x4AFF, `${q.id} ${cell}`); assert.ok(s in STATUS_RANK); }
    for (const [ref, s] of q.marks || []) { assert.equal(ref.length, 3); assert.ok(s in STATUS_RANK); }
    assert.ok(q.offer || q.title, `${q.id} needs a text`);
  }
  assert.ok(cellIndex().get(0x4ABB).has(0x4ABB));
});

test('text: unpack round trip, both phase endings', () => {
  for (const s of ['A', 'AB', 'ABC', 'ABCD', 'HELLO, WORLD? 0123', "IT'S _ A TEST."]) {
    const b = pack(s);
    assert.equal(unpackText(Uint8Array.from(b), 0, b.length), s);
  }
  const rec = new Uint8Array(2 + 0x20 + 40); const t = pack('PLACEHOLDER');
  rec.set([0x12, 0x80, t.length, ...t], 2 + 0x10);
  assert.equal(textAt(rec, 0x9910), 'PLACEHOLDER');
  assert.throws(() => textAt(rec, 0x9900), /packed text/);
});

test('text: every table address decodes to the text of the FINAL script document (local decode only)', { skip: !existsSync(new URL('decode/bin/dax/ECL3/8.bin', ROOT)) && 'decode/bin not present' }, async () => {
  const docs = new Map();
  const doc = (ds, block) => {
    const name = `ECL${ds}_${String(block).padStart(2, '0')}`;
    if (!docs.has(name)) {
      const map = new Map();
      for (const m of readFileSync(new URL(`decode/ecl/scripts/${name}.md`, ROOT), 'utf8').matchAll(/^\| ([0-9A-F]{4})\/1 \| [A-Z_]+ \| "(.*)" \|$/gm)) map.set(parseInt(m[1], 16), m[2]);
      docs.set(name, map);
    }
    return docs.get(name);
  };
  // record files are decode/bin/dax/ECL<n>/<id>.bin (the 2-byte header kept), so serve them as one-record "archives"
  const texts = await loadQuestTexts({ readFile: (name) => name });
  assert.equal(texts.size, 0);   // not DAX files -> skipped, no throw
  let n = 0;
  for (const ref of textRefs()) {
    const rec = new Uint8Array(readFileSync(new URL(`decode/bin/dax/ECL${ref[0]}/${ref[1]}.bin`, ROOT)));
    assert.equal(textAt(rec, ref[2]), doc(ref[0], ref[1]).get(ref[2]), refKey(ref)); n++;
  }
  assert.equal(n, textRefs().length);
});

test('state: slums from offer text through 25 fights to the reward', () => {
  const log = createQuestLog({ texts: placeholder() });
  const k = ID.slums;
  assert.equal(log.status(k), 'unknown');
  assert.deepEqual(log.applyText('TEXT 3:8:A8B6', { dataSet: 3, block: 7 }), []);              // wrong block
  assert.deepEqual(log.applyText('TEXT 3:8:A8B6', { dataSet: 3, block: 8 }), [{ key: k, id: 'slums', from: 'unknown', to: 'offered' }]);
  let v = 0, changes = [];
  while (v < 0x19) { v++; changes.push(...log.applyFlag(0x4ABB, v)); if (v === 0x19) changes.push(...log.applyFlag(0x4ABB, 0xFE)); }
  assert.deepEqual(changes.map((c) => c.to), ['progress', 'done']);
  assert.deepEqual(log.list().find((q) => q.id === 'slums').progress, { count: 0xFE, of: 0x19 });
  assert.deepEqual(log.applyFlag(0x4ABB, 0xFF).map((c) => c.to), ['rewarded']);
  assert.deepEqual(log.applyFlag(0x4A00, 1), []);                                               // block-local cell: no quest
});

test('state: podal offered by its own flag; graveyard accepted; bivant failed / rewarded told apart by text', () => {
  const log = createQuestLog({ texts: placeholder() });
  assert.equal(log.applyFlag(0x4AB0, 1)[0].to, 'offered');
  assert.equal(log.applyFlag(0x4AB0, 0xFE)[0].to, 'done');
  assert.equal(log.applyFlag(0x4A96, 0xFF)[0].to, 'accepted');
  assert.equal(log.applyFlag(0x4AB1, 0xFE)[0].to, 'done');
  assert.equal(log.applyFlag(0x4A8C, 0xFF)[0].to, 'offered');
  assert.equal(log.applyFlag(0x4AA9, 0x80)[0].to, 'failed');
  assert.equal(log.applyFlag(0x4AA9, 0xFF)[0].to, 'closed');                                    // the clerk's pass: flags alone say "finished"
  assert.equal(log.applyText('TEXT 3:8:9E88', { dataSet: 3, block: 8 })[0].to, 'failed');      // ... its text says how
  const other = createQuestLog({ texts: placeholder() });
  other.applyFlag(0x4AA9, 0xFE); assert.equal(other.applyFlag(0x4AA9, 0xFF)[0].to, 'closed');
  assert.equal(other.applyText('TEXT 3:8:A027', { dataSet: 3, block: 8 })[0].to, 'rewarded');
  const books = createQuestLog({ texts: placeholder() });
  assert.equal(books.applyFlag(0x4AAC, 0xFE)[0].to, 'done');
  assert.equal(books.applyFlag(0x4AAC, 0xFF)[0].to, 'progress');
});

test('state: full read, snapshot/restore of marks', () => {
  const mem = new Map([[0x4AA7, 0xFF], [0x4AB2, 0xFE], [0x4A97, 0xFE]]);
  const log = createQuestLog({ texts: placeholder() });
  const changes = log.readAll((a) => mem.get(a) ?? 0);
  assert.deepEqual(changes.map((c) => `${c.id}:${c.to}`).sort(), ['cadorna-treasure:offered', 'kovel:done', 'sokal:rewarded']);
  log.applyText('TEXT 3:8:A8B6', { dataSet: 3, block: 8 });
  const snap = log.snapshot();
  assert.deepEqual(snap, { marks: { slums: ['offered'] } });
  const again = createQuestLog({ texts: placeholder() });
  assert.deepEqual(again.restore(snap).map((c) => c.to), ['offered']);
  assert.deepEqual(again.restore({ marks: { nope: ['offered'], slums: ['bogus'] } }).map((c) => c.to), ['unknown']);
});

function fakeBus(memory = new Map()) {
  const on = new Map();
  const bus = { enabled: true, state: { slot: null, position: () => ({ dataset: 3, block: 8 }), mem: (a) => memory.get(a) ?? 0 },
    on(n, fn) { on.set(n, fn); return () => on.delete(n); }, emit(n, p) { if (bus.enabled) on.get(n)?.(p, n); } };
  return bus;
}
function fakeStores() {
  const data = new Map();
  return { data, factory: ({ profile, slot }) => ({ get: async (n, f) => data.get(`${profile}/${slot}/${n}`) ?? f, set: async (n, v) => { data.set(`${profile}/${slot}/${n}`, structuredClone(v)); return true; } }) };
}

test('wiring: the tab listener sees each change inside the event that caused it; per-slot marks', async () => {
  const memory = new Map(), bus = fakeBus(memory), stores = fakeStores();
  const q = startQuests({ bus, storeFactory: stores.factory, loadTexts: async () => placeholder() });
  const seen = [];
  q.onChange((changes, cause) => seen.push(`${cause}:${changes.map((c) => `${c.id}=${c.to}`).join(',')}`));
  bus.emit('textPrinted', { text: 'TEXT 3:8:A8F7' });            // before the texts are loaded: replayed after ready
  await q.ready;
  assert.deepEqual(seen, ['textPrinted:sokal=offered']);
  memory.set(0x4AB0, 1); bus.emit('flagSet', { addr: 0x4AB0, value: 1, old: 0, region: 0 });
  assert.equal(seen.at(-1), 'flagSet:podal=offered');            // synchronous: no await between emit and the listener
  bus.emit('gameSaved', { slot: 'c' });
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(stores.data.get('por/C/quests'), { marks: { sokal: ['offered'] } });
  memory.clear(); memory.set(0x4AA7, 0xFF);
  bus.emit('saveLoaded', { slot: 'D' });
  assert.equal(q.slot, 'D');
  assert.equal(q.log.status(ID.sokal), 'rewarded');
  assert.equal(q.log.status(ID.podal), 'unknown');
  await new Promise((r) => setTimeout(r, 0));
  bus.emit('saveLoaded', { slot: 'C' });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(q.log.status(ID.sokal), 'rewarded');               // flag wins over the restored mark
  const quickSnapshot = q.log.snapshot();
  bus.emit('gameSaved', { slot: 'Q' });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(q.slot, 'Q');
  assert.deepEqual(stores.data.get('por/Q/quests'), quickSnapshot);
  bus.emit('gameSaved', { slot: 'X' });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(q.slot, 'X');
  assert.deepEqual(stores.data.get('por/X/quests'), quickSnapshot);
  bus.emit('saveLoaded', { slot: 'Q' });
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(q.slot, 'Q');
  bus.enabled = false; bus.state.slot = 'X';
  assert.equal(saveSlot('x'), 'X');
  q.stop();
});

test('tab text: offer text, or the title parts joined, quotes trimmed', () => {
  const texts = new Map([['3:8:A8B6', "THE SLUM PLACEHOLDER.'"], ['3:8:9E4A', "'REWARD FOR "], ['3:8:9E2C', "PLACE.'"]]);
  assert.equal(questText(QUESTS[ID.slums], texts), 'THE SLUM PLACEHOLDER.');
  assert.equal(questText(QUESTS[ID.textile], texts), 'REWARD FOR PLACE.');
  assert.equal(questText(QUESTS[ID.sokal], texts), null);
});

test('replay: the flag and text events recorded in the headless clerk run (GBP-QUESTS-1) give the run\'s changes', () => {
  const rec = JSON.parse(readFileSync(new URL('quests-events.json', import.meta.url)));
  const log = createQuestLog({ texts: placeholder() });
  const changes = [];
  for (const e of rec.events) changes.push(...(e.text ? log.applyText(`TEXT ${e.text}`, e) : log.applyFlag(e.flag, e.value)));
  assert.deepEqual(changes.map((c) => [c.id, c.from, c.to]), rec.trace.flatMap((t) => t.changes));
  assert.deepEqual(log.list().filter((q) => q.met).map((q) => `${q.id}:${q.status}`), rec.rows);
});
