// game/test/magic/ov15.test.mjs — node tests for game/areas/magic_ov15.js (lane por-build-magic).
// Run: node game/test/magic/ov15.test.mjs
// Expected values are derived by hand from decode/listings/ov15.lst (addresses cited per check).
// magic_ov22.js is replaced by a stub (IsScroll = item.isScroll flag) so the ov15 routines are tested in isolation.
import { register } from 'node:module';

const stub = `export async function IsScroll(it) { return !!it.isScroll; }
export async function CastSpell() { throw new Error('CastSpell not expected'); }`;
register('data:text/javascript,' + encodeURIComponent(`
export async function resolve(spec, ctx, next) {
  if (spec.endsWith('magic_ov22.js')) return { url: 'data:text/javascript,' + ${JSON.stringify(encodeURIComponent(stub))}, shortCircuit: true };
  return next(spec, ctx);
}`));

const ov15 = await import('../../areas/magic_ov15.js');
const core = await import('../../areas/magic_core.js');
const { newChar, newItem } = core;

let fails = 0, checks = 0;
const eq = (name, got, want) => { checks++; if (got !== want) { fails++; console.log(`FAIL ${name}: got ${got}, want ${want}`); } };

// fake DS image: spell table DS:31FA + id*16 (+0 class, +1 level, +0Ah effect type)
const ds = new Uint8Array(0x8760);
const setSpell = (id, cls, lvl) => { ds[0x31FA + id * 16] = cls; ds[0x31FB + id * 16] = lvl; };
setSpell(1, 0, 1); setSpell(2, 0, 1); setSpell(9, 0, 2); setSpell(0x14, 0, 3);
setSpell(0x21, 1, 1); setSpell(0x22, 1, 1); setSpell(0x2B, 1, 2); setSpell(0x30, 1, 3);
const g = { ds, PartyHead: null, SelectedChar: null };
core.bindMagic({ g });

// ---- RestTimeNeeded 6B00:0000 -----------------------------------------------------------------------
{
  const c = newChar();
  c.b[0x17] = 0x81; c.b[0x18] = 0x09; c.b[0x19] = 0x89; c.b[0x1A] = 0xA1;     // pending 1 (lvl1), 9 (lvl2), 21h (lvl1); 9 memorised
  const sc = newItem(); sc.isScroll = true; sc.b[0x3C] = 0x2B | 0x80; sc.b[0x3D] = 0x30; sc.b[0x3E] = 0;
  const notScroll = newItem(); notScroll.b[0x3C] = 0x94;                        // ignored: not a scroll (IsScroll at 6b00:008a)
  c.items = sc; sc.next = notScroll;
  // mem: levels 1+2+1 = 4, max 2; scribe: 2Bh lvl 2, max 2 -> need 4 (any), not 6 (max not > 2)
  const t = await ov15.RestTimeNeeded(c);
  eq('RestTimeNeeded rest_need', c.b[0x2C], 4);                                 // 6b00:0109 / 0123
  eq('RestTimeNeeded minutes', t, 4 * 60 + 4 * 15 + 2 * 15);                     // 6b00:0127..014b = 330
  c.b[0x1B] = 0x94;                                                            // pending 14h (lvl 3) -> max 3 > 2
  eq('RestTimeNeeded minutes lvl3', await ov15.RestTimeNeeded(c), 6 * 60 + 7 * 15 + 2 * 15);
  eq('RestTimeNeeded rest_need lvl3', c.b[0x2C], 6);                           // 6b00:0119
  const empty = newChar();
  eq('RestTimeNeeded nothing', await ov15.RestTimeNeeded(empty), 0);
  eq('RestTimeNeeded nothing need', empty.b[0x2C], 0);
}

// ---- CancelMemorizing 6B00:0159 ---------------------------------------------------------------------
{
  const c = newChar();
  c.b[0x17] = 0x81; c.b[0x18] = 0x09; c.b[0x2B] = 0xFF; c.b[0x2C] = 6;
  ov15.CancelMemorizing(c);
  eq('CancelMemorizing pending cleared', c.b[0x17], 0);                        // 6b00:0183
  eq('CancelMemorizing memorised kept', c.b[0x18], 9);
  eq('CancelMemorizing slot 20 cleared', c.b[0x2B], 0);                        // loop to 14h inclusive (6b00:0188)
  eq('CancelMemorizing rest_need', c.b[0x2C], 0);                              // 6b00:0191
}

// ---- FreeSlots 6B00:025C ----------------------------------------------------------------------------
{
  const c = newChar();
  c.b[0xB2] = 3;                       // cleric lvl1 slots (+B1h + 0*3 + 1)
  c.b[0xB6] = 1;                       // magic-user lvl2 (+B1h + 1*3 + 2 = B6h)
  c.b[0x17] = 0x01; c.b[0x18] = 0x82;  // two cleric lvl1 (memorised + pending)
  c.b[0x19] = 0x2B; c.b[0x1A] = 0xAB;  // two MU lvl2 -> more than slots
  g.SelectedChar = c;
  eq('FreeSlots cleric lvl1', ov15.FreeSlots(1, 0), 1);                        // 3 - 2
  eq('FreeSlots cleric lvl2', ov15.FreeSlots(2, 0), 0);
  eq('FreeSlots MU lvl2 wraps (byte)', ov15.FreeSlots(2, 1), 0xFF);            // 1 - 2 as AL (6b00:02f4/02f6)
  eq('FreeSlots MU lvl1', ov15.FreeSlots(1, 1), 0);
}

// ---- SortMemorized 6B00:0824 ------------------------------------------------------------------------
{
  const c = newChar();
  const v = [0x30, 0x81, 0x00, 0x09, 0xA1, 0x02, 0x00, 0x8B];
  v.forEach((x, i) => { c.b[0x17 + i] = x; });
  g.SelectedChar = c;
  ov15.SortMemorized();
  // ascending by (id and 7Fh), bit 7 kept with its byte; zeros (13 more slots) sort to the front
  const got = Array.from(c.b.slice(0x17, 0x17 + 21));
  const want = [...new Array(15).fill(0), 0x81, 0x02, 0x09, 0x8B, 0xA1, 0x30];
  eq('SortMemorized order', JSON.stringify(got), JSON.stringify(want));
  // the exchange sort (swap only on '>') is not stable: 81h/01h (equal keys) leapfrog past the zeros one slot per
  // outer step (hand simulation of 6b00:082a..08b2): i=0 swaps 81h to slot 2, i=1 swaps 01h to slot 3, ... ending 01h, 81h.
  const d = newChar(); d.b[0x17] = 0x81; d.b[0x18] = 0x01; g.SelectedChar = d;
  ov15.SortMemorized();
  eq('SortMemorized equal keys (unstable)', d.b[0x17 + 19] + ':' + d.b[0x17 + 20], '1:129');
}

// ---- MoveSelectedDown / Up 6B00:14A9 / 1601 (list surgery) ------------------------------------------------
{
  const mk = (n) => { const a = []; for (let i = 0; i < n; i++) { const c = newChar(); c.id = i; a.push(c); } for (let i = 0; i < n - 1; i++) a[i].next = a[i + 1]; return a; };
  const order = () => { const r = []; for (let p = g.PartyHead; p; p = p.next) r.push(p.id); return r.join(''); };
  let a = mk(4); g.PartyHead = a[0]; g.SelectedChar = a[2];
  ov15.MoveSelectedDown(); eq('Down middle -> towards front', order(), '0213');
  a = mk(4); g.PartyHead = a[0]; g.SelectedChar = a[0];
  ov15.MoveSelectedDown(); eq('Down first -> wraps to end', order(), '1230');
  a = mk(4); g.PartyHead = a[0]; g.SelectedChar = a[1];
  ov15.MoveSelectedDown(); eq('Down second -> becomes head', order(), '1023');
  a = mk(4); g.PartyHead = a[0]; g.SelectedChar = a[1];
  ov15.MoveSelectedUp(); eq('Up middle -> towards end', order(), '0213');
  a = mk(4); g.PartyHead = a[0]; g.SelectedChar = a[3];
  ov15.MoveSelectedUp(); eq('Up last -> wraps to front', order(), '3012');
  a = mk(4); g.PartyHead = a[0]; g.SelectedChar = a[0];
  ov15.MoveSelectedUp(); eq('Up first -> second', order(), '1023');
}

console.log(`${checks - fails}/${checks} checks passed`);
if (fails) process.exit(1);
