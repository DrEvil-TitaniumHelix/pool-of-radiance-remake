// game/test/plus/hint.test.mjs — Gold Box Plus 1.0.1: the "F12: Plus" hint is always shown (Plus and original mode, every
// mount, not only the first run), hidden only while the panel is open, and placed in a margin outside the frame.
// node --test game/test/plus/hint.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { hintPosition } from '../../plus/plus.js';

class Element {
 constructor() { this.children = []; this.dataset = {}; this.style = {}; this.attrs = {}; this.hidden = false; this.classList = { toggle() {}, add() {}, remove() {} }; }
 append(...els) { this.children.push(...els); }
 replaceChildren(...els) { this.children = els; }
 setAttribute(k, v) { this.attrs[k] = v; }
 getAttribute(k) { return this.attrs[k]; }
 addEventListener() {}
 querySelector() { return this.children.find(e => e.attrs?.['aria-selected'] === 'true'); }
 querySelectorAll() { return []; }
 focus() { document.activeElement = this; }
 contains(el) { return this === el || this.children.some(c => c.contains?.(el)); }
}
test('hint exists in both modes on every mount, opens the panel, hides only while it is open, follows the gamepad', async () => {
 const records = new Map();
 const db = { objectStoreNames: { contains: () => true }, close() {}, transaction() {
  const tx = { objectStore: () => ({ get(k) { const r = { result: records.get(k) }; setTimeout(() => tx.oncomplete(), 0); return r; }, put(v, k) { records.set(k, structuredClone(v)); setTimeout(() => tx.oncomplete(), 0); return {}; } }) }; return tx;
 } };
 globalThis.indexedDB = { open() { const r = { result: db }; queueMicrotask(() => r.onsuccess()); return r; } };
 let pads = [];
 Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { getGamepads: () => pads } });
 globalThis.CustomEvent = class {};
 // mount 0 = first run (Plus mode), mount 1 = switch to original, mount 2 = a later run that restores original from the store
 for (const [i, original] of [false, true, true].entries()) {
  const listeners = new Map(); let frame;
  const canvas = { getBoundingClientRect: () => ({ left: 20, right: 340, top: 220, bottom: 420, width: 320, height: 200 }) };
  globalThis.location = { search: '' };
  globalThis.document = { createElement: () => new Element(), createTextNode: t => t, getElementById: id => id === 'screen' ? canvas : null, head: new Element(), body: new Element(), documentElement: new Element() };
  globalThis.window = { innerWidth: 360, innerHeight: 640, addEventListener(t, f) { const a = listeners.get(t) || []; a.push(f); listeners.set(t, a); }, dispatchEvent() {} };
  globalThis.requestAnimationFrame = f => { frame = f; };
  const { mountPlus } = await import(`../../plus/plus.js?hint-mount=${i}`);
  const plus = mountPlus({ canvas, input: { suspended: false } }); await plus.ready;
  if (i === 2) assert.equal(plus.settings.original, true, 'stored settings restored on a fresh mount');
  await plus.setSetting('original', original);
  const hint = document.body.children.find(e => e.id === 'por-plus-hint');
  assert.ok(hint, 'hint element mounted'); assert.equal(hint.hidden, false, `visible (original=${original}, mount ${i})`);
  assert.equal(hint.attrs['aria-label'], 'F12 opens the Plus screen'); assert.equal(hint.textContent, 'F12: Plus');
  assert.equal(document.documentElement.dataset.plusHint, '36', 'asks fit() for a margin');
  assert.ok(parseFloat(hint.style.top) >= 424, 'placed below the frame, not over it');
  plus.selectTab('about'); assert.match(document.body.children.find(e => e.id === 'por-plus').children[2].children[0].textContent, /Gold Box Plus 1\.0\.1/);
  hint.onclick(); assert.equal(plus.isOpen, true); assert.equal(hint.hidden, true, 'hidden while the panel is open');
  plus.close(); assert.equal(hint.hidden, false, 'back after closing');
  for (const f of listeners.get('keydown')) f({ key: 'F12', preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(plus.isOpen, true); assert.equal(hint.hidden, true);
  for (const f of listeners.get('keydown')) f({ key: 'F12', preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(plus.isOpen, false); assert.equal(hint.hidden, false);
  pads = [{ index: 0, buttons: [{ pressed: true }], axes: [0, 0] }]; frame(); assert.equal(hint.textContent, 'Menu: Plus');
  pads = []; for (const f of listeners.get('keydown')) f({ key: 'a', preventDefault() {}, stopImmediatePropagation() {} });
  assert.equal(hint.textContent, 'F12: Plus');
 }
 delete globalThis.indexedDB;
});
test('hint strip uses a free margin, never the frame, and fits a phone', () => {
 const below = hintPosition({ left: 80, right: 720, top: 40, bottom: 440 }, 800, 480);
 assert.ok(below.top >= 440 && below.top + 28 <= 480); assert.ok(below.left >= 0 && below.left + 194 <= 800);
 const phone = hintPosition({ left: 20, right: 340, top: 220, bottom: 420 }, 360, 640);
 assert.ok(phone.top >= 420 && phone.top + 28 <= 640); assert.ok(phone.left >= 0 && phone.left + 194 <= 360);
 const right = hintPosition({ left: 0, right: 640, top: 0, bottom: 400 }, 900, 400); assert.ok(right.left >= 640 && right.left + 194 <= 900);
 const above = hintPosition({ left: 0, right: 640, top: 40, bottom: 400 }, 640, 400); assert.ok(above.top + 28 <= 40);
});
