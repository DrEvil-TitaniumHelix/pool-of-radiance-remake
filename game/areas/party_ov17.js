// party_ov17.js — PARTY ov17 (seg 7500): character roster (charlist.txt), character / monster / NPC files, party list,
// por-only: Pool character/party creation, roster, save layouts, shops and training rules (whole module) (profile: engine.areaModules / recordSizes / saveFormat; game/profiles/PORONLY.md)
// load and save game; plus the 0802 name helpers it needs (DeleteAll / MakeDosName, ENGINE.pas.md 0802).
// Source: decode/pseudo/party_parts/ov17.pas.md (= PARTY.pas.md ov17; verified PARTY_VERIFY.md), decode/listings/ov17.lst,
// record layouts decode/data/SAVES.md §1..§3 (code wins: ov17_notes.md). First load path written by build-engine for
// M2 (af8fcb0); owner: build-party.
//
// - Files go through engine/files.js (browser save store + read-only shipped SAVE folder). In the browser a write never
//   fails, so the original's `IOResult <> 0 -> "Put save disk in X:"` retry loops are kept but never prompt.
// - TMenuItem (VIEW ov25, 46 bytes: text string[40] +0, isHeader +29h, next +2Ah) = `{ text, isHeader, next }`.
// - Combat icons: `g.CombatIcons[slot] = { pose0, pose1 }` (DS:5E5A + slot*8, VIEW ov32); LoadCombatIcon / FreeCombatIcon
//   / UpdateLevelStats / Roll / RecalcCharacter come from the other areas through party_core `X` (optional ones are
//   skipped with a warning until their lane lands them).
// - The ECL VM memory regions are word arrays (G.ecl_Mem4900 / G.ecl_Mem6B00 / G.ecl_Mem9700 = vm.mem*, engine request
//   #3); `.b[k]` of an even offset = low byte of word k >> 1.

import { G, newChar, newItem, newEffect, pstr, setPstr, rdW } from '../engine/state.js';
import { state as pic } from '../engine/pictures.js';
import { readFile, fileExists, writeFile, eraseFile, readLines, writeLines, reader } from '../engine/files.js';
import { LoadDaxRecord, SetDataSet, RestoreDataSet } from '../engine/dax.js';


import { keyState } from '../engine/input.js';
import { UpCase, Random, byte, shortint } from '../engine/tp.js';
import { dev } from '../engine/dev.js';
import { env, X } from './party_core.js';
import { hooks } from '../plus/hooks.js';   // GBP W1 (docs/PLUS_HOOKS.md)

const SavePath = () => G.SavePath ?? '';               // g_537A (POOL.CFG line 4); the store is the save directory
const SaveDrive = () => SavePath()[0] ?? '';           // g_537B = SavePath[1]
const DataDrive = () => (pic.DataPath ?? '')[0] ?? ''; // g_547D = DataPath[1]
const dsb = (o) => (G.ds ? G.ds[o] : 0);
const dsPstr = (o) => { if (!G.ds) return ''; let s = ''; for (let i = 1; i <= G.ds[o]; i++) s += String.fromCharCode(G.ds[o + i]); return s; };

// optional cross-area routine: bound ext, then a function on G (build-engine's M2 hooks); null when nobody provides it
const warned = new Set();
function opt(name) {
  const f = env.ext[name] ?? (typeof G[name] === 'function' ? G[name] : null);
  if (!f && !warned.has(name)) { warned.add(name); console.warn('party_ov17: ' + name + ' not bound yet (skipped)'); }
  return f;
}
const mem = (k) => G['ecl_Mem' + k];                   // word arrays of the VM regions
const memB = (k, ofs) => mem(k) ? mem(k)[ofs >> 1] & 0xFF : 0;
const memW = (k, ofs) => mem(k) ? mem(k)[ofs >> 1] : 0;
const setMemW = (k, ofs, v) => { if (mem(k)) mem(k)[ofs >> 1] = v & 0xFFFF; };

function terminateGame() {                            // 0899:0000 TerminateGame
  const f = opt('TerminateGame');
  if (f) return f();
  if (keyState.onTerminate) return keyState.onTerminate();
  throw new Error('TerminateGame');
}

// ---- 0802 name helpers (ENGINE.pas.md) --------------------------------------------------------------------------

// 0802:0356 DeleteAll(s, sub) — quirk: bound computed once (a Byte: wraps when sub is longer than s + 1), i still
// advances after a deletion, so two adjacent occurrences leave the second one.
export function DeleteAll(s, sub) {
  let a = s;
  const n = byte(a.length - sub.length + 1);                               // 0802:0385 .. 039e  Byte
  for (let i = 1; i <= n; i++)                                             // 0802:03aa
    if (a.substr(i - 1, sub.length) === sub) a = a.slice(0, i - 1) + a.slice(i - 1 + sub.length);   // 0802:03bc
  return a;
}

// 0802:0425 MakeDosName(s): remove ' . * , ? / \ : ; |' (g_0D19[1..10]), first 8 chars, upper case
export function MakeDosName(s) {
  let a = s;
  for (const ch of [' ', '.', '*', ',', '?', '/', '\\', ':', ';', '|']) a = DeleteAll(a, ch);   // 0802:0440 / 044b
  a = a.slice(0, 8);                                                       // 0802:0489
  return a.split('').map(UpCase).join('');                                 // 0802:04b1
}

// ---- roster -------------------------------------------------------------------------------------------------------

// 7500:0010 ReadCharList(var list): returns the list (nil = null). '* ' marks names of characters already in the party.
export async function ReadCharList() {
  let list = null, last = null;                                            // 7500:0017
  await EnsureSaveDir();                                                   // 7500:0024
  if (!(await fileExists(SavePath() + 'charlist.txt'))) return list;      // 7500:0027 .. 004a
  const lines = (await readLines(SavePath() + 'charlist.txt')) ?? [];     // 7500:004d / 0072  Assign / Reset
  for (const line of lines) {                                              // 7500:007d  while not Eof(t)
    const node = { text: '', isHeader: 0, next: null };                    // 7500:008f / 009e  GetMem + FillChar $2E
    if (list === null) { list = node; last = list; }                       // 7500:00af / 00bb
    else { last.next = node; last = last.next; }                           // 7500:00dd
    last.text = line.substring(0, 40);                                     // 7500:00ff  ReadLn into string[40]
    let p = G.PartyHead;                                                   // 7500:0118
    while (p !== null && pstr(p.b, 0) !== last.text) p = p.next;           // 7500:0125 .. 0151
    if (p !== null) last.text = ('* ' + last.text).substring(0, 40);       // 7500:0153 .. 017e
  }
  return list;                                                             // 7500:0186  Close
}

// 7500:01B8 WriteCharList(list): entries starting with '*' (party members) are dropped
export async function WriteCharList(list) {
  await EnsureSaveDir();                                                   // 7500:01bf
  let err;
  do {
    err = 0;                                                               // 7500:01c3 .. 01f3  Assign / Rewrite / IOResult (cannot fail here)
    if (err !== 0) await X.ShowBottomPromptAndReadKey(0x0E, 'Put save disk in ' + SaveDrive() + ':');   // 7500:0203
  } while (err !== 0);                                                     // 7500:0239
  const out = [];
  for (let node = list; node !== null; node = node.next)                   // 7500:0240 / 024c / 0276
    if (node.text[0] !== '*') out.push(node.text);                         // 7500:0254 / 025e  WriteLn
  await writeLines(SavePath() + 'charlist.txt', out);                      // 7500:0289  Close
}

// 7500:02AE EnsureSaveDir: MkDir(SavePath without the trailing '\') until 0 or 5 (exists). The store needs no directory.
export async function EnsureSaveDir() {
  let err;
  do {
    err = 0;                                                               // 7500:02b5 .. 02d5  MkDir / IOResult
    if (err !== 0 && err !== 5) await X.ShowBottomPromptAndReadKey(0x0E, 'Put save disk in ' + SaveDrive() + ':');   // 7500:02e9
  } while (!(err === 0 || err === 5));                                     // 7500:031f
}

// ---- combat icon --------------------------------------------------------------------------------------------------

// 7500:032F OverlayIconPicture(src, dst): head icon onto body icon — pixel OR, transparency AND (pictures.js keeps one
// colour index + one transparency flag per pixel; OR of the EGA plane bytes = OR of the colour indices because masked
// pixels are 0). quirk: the EGA mask length comes from CombatIcons[11].pose0 (g_5EB2), not from src (same size here).
export function OverlayIconPicture(src, dst) {
  if (!src || !dst) return;
  const n = src.height * src.width8 * 8;                                   // 7500:0343  frameSize (frame 0)
  for (let i = 0; i < n; i++) dst.px[i] |= src.px[i];                      // 7500:035d / 03c8
  const icons = typeof env.ext.combatIcons === 'function' ? env.ext.combatIcons() : G.CombatIcons;   // VIEW ov32 slot shape
  const ref = (icons && icons[11] && icons[11][0]) || src;                // 7500:0412  g_5EB2 = CombatIcons[11] pose 0
  const m = ref.height * ref.width8 * 8;
  if (dst.mask && src.mask) for (let i = 0; i < m; i++) dst.mask[i] &= src.mask[i];     // 7500:0385 / 0437
}

// 7500:0482 LoadCharacterIcon(recolour): builds the two combat-icon poses of SelectedChar in slot c.party_slot
export async function LoadCharacterIcon(recolour) {
  SetDataSet(3);                                                           // 7500:0489
  const c = G.SelectedChar;                                                // 7500:0491
  const load = opt('LoadCombatIcon'), free = opt('FreeCombatIcon');
  if (load) {
    const letter = String.fromCharCode(dsb(0x08C5 + c.b[0xC0] /* icon_size */));       // IconSizeLetter: 1 'S', 2 'T'
    await load('CHEAD' + letter, c.b[0xBD] /* icon_head */, 11);           // 7500:049b .. 04d8
    await load('CBODY' + letter, c.b[0xBE] /* icon_body */, c.b[0xBF] /* party_slot */);   // 7500:04dd .. 0520
    const ic = G.CombatIcons || [];
    const s11 = ic[11] || {}, sc = ic[c.b[0xBF]] || {};
    OverlayIconPicture(s11.pose0, sc.pose0);                               // 7500:0525 .. 0546
    OverlayIconPicture(s11.pose1, sc.pose1);                               // 7500:0549 .. 056a
    if (recolour) {                                                        // 7500:056d
      const fromCol = [], toCol = [];
      for (let k = 0; k <= 15; k++) { fromCol[k] = k; toCol[k] = k; }      // 7500:0576
      for (let i = 1; i <= 6; i++) {                                       // 7500:059f
        toCol[dsb(0x3CF5 + i)] = c.b[0xC0 + i] /* icon_colours[i] */ & 0x0F;          // 7500:05a8  IconColourSlot
        toCol[dsb(0x3CF5 + i) + 8] = c.b[0xC0 + i] >> 4;                   // 7500:05cd
      }
      X.RecolorPicture(fromCol, toCol, 0, false, sc.pose0);               // 7500:0602 .. 062a
      X.RecolorPicture(fromCol, toCol, 0, false, sc.pose1);               // 7500:062f .. 0657
    }
    if (free) await free(11);                                              // 7500:065c
  }
  RestoreDataSet();                                                        // 7500:0664
  // 7500:0669 FUN_0899_0104: disabled key flush (no effect)
}

// ---- character files ----------------------------------------------------------------------------------------------

// 7500:069E WriteCharacter(var c, name): name = '' -> roster character <MakeDosName(c.name)>.CHA (+ charlist.txt entry),
// otherwise saved-game member <name>.SAV; then .ITM / .SPC (SAVES.md §1)
export async function WriteCharacter(c, name) {
  const nm = name.substring(0, 8);                                         // 7500:06a5  string[8]
  let ext, base;
  if (nm === '') {                                                         // 7500:06b8
    let list = await ReadCharList();                                       // 7500:06c1
    let last = list;                                                       // 7500:06cb
    if (last !== null) while (last.next !== null) last = last.next;        // 7500:06e5
    const node = { text: pstr(c.b, 0).substring(0, 40), isHeader: 0, next: null };   // 7500:0709 .. 072c
    if (last !== null) last.next = node; else list = node;                 // 7500:0740 / 0760
    await WriteCharList(list);                                             // 7500:0770
    const fml = opt('FreeMenuList'); if (fml) await fml({ v: list });      // 7500:077c
    ext = '.cha';                                                          // 7500:0787
    base = (SavePath() + MakeDosName(DeleteAll(pstr(c.b, 0), '.'))).substring(0, 40);   // 7500:079b .. 07e5
  } else {
    await EnsureSaveDir();                                                 // 7500:07ec
    ext = '.sav';                                                          // 7500:07f0
    base = SavePath() + nm;                                                // 7500:0804
  }
  // 7500:082d .. 08a9  Assign / Rewrite / IOResult loop (cannot fail here)
  await writeFile(base + ext, c.b.slice(0, 0x11D));                        // 7500:08b3 / 08cb  BlockWrite $11D raw, Close
  if (await fileExists(base + '.itm')) await eraseFile(base + '.itm');     // 7500:08d6 .. 0920
  if (c.items !== null) {                                                  // 7500:092b
    const parts = [];
    for (let it = c.items; it !== null; it = it.next) parts.push(it.b.slice(0, 0x3F));   // 7500:0987 .. 09aa
    await writeFile(base + '.itm', concat(parts));                         // 7500:093d / 0991 / 09c0
  }
  if (await fileExists(base + '.spc')) await eraseFile(base + '.spc');     // 7500:09cb .. 0a15
  if (c.effects !== null) {                                                // 7500:0a20
    const parts = [];
    for (let e = c.effects; e !== null; e = e.next) parts.push(e.b.slice(0, 9));   // 7500:0a7a .. 0a9d
    await writeFile(base + '.spc', concat(parts));                         // 7500:0a31 / 0a84 / 0ab3
  }
}

function concat(parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0; for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

// 7500:0AEC ReadCharacter(name, var c, isSav, inSaveDir)
export async function ReadCharacter(name, c, isSav, inSaveDir) {
  let nm = name;                                                           // 7500:0af3
  let prompt;
  if (inSaveDir) {                                                         // 7500:0b07
    nm = SavePath() + MakeDosName(nm);                                     // 7500:0b0d .. 0b3d
    prompt = 'Put save disk in ' + SaveDrive() + ':';                      // 7500:0b42 .. 0b7a
  } else
    prompt = dsPstr(0x2614 + pic.DataSet * 0x1E) + DataDrive() + ':';      // 7500:0b81 .. 0bc6  DiskPromptText[DataSet]
  const ext = isSav ? '.sav' : '.cha';                                     // 7500:0bcb / 0be7
  // 7500:0bfb OpenWithPrompt(nm + ext, prompt, False, f): the store/shipped folder answers at once.
  // TODO(decode): a missing file makes the original prompt with `prompt` until the disk is inserted; here the record stays.
  const f = inSaveDir ? await readFile(nm + ext) : await fetchData(nm + ext);
  void prompt;
  if (f) c.b.set(f.subarray(0, Math.min(0x11D, f.length)));                // 7500:0c2f  BlockRead $11D
  c.next = null;                                                           // 7500:0c54
  c.items = null;                                                          // 7500:0c63
  c.effects = null;                                                        // 7500:0c72
  c.combat = null;                                                         // 7500:0c80  combatant
  const itm = inSaveDir ? await readFile(nm + '.itm') : await fetchData(nm + '.itm');
  if (itm !== null) {                                                      // 7500:0c8f  FileExists
    const r = reader(itm);
    let it = newItem(); c.items = it;                                      // 7500:0cb6 / 0ccc
    for (;;) {
      it.b.set(r.read(0x3F));                                              // 7500:0d14  quirk: an empty file leaves one
      it.next = null;                                                      // 7500:0d2f  uninitialised node (zeros here)
      if (r.eof()) break;                                                  // 7500:0d3d / 0d75
      it.next = newItem(); it = it.next;                                   // 7500:0d4c / 0d61
    }
  }
  const spc = inSaveDir ? await readFile(nm + '.spc') : await fetchData(nm + '.spc');
  if (spc !== null) {                                                      // 7500:0d8f
    const r = reader(spc);
    let e = newEffect(); c.effects = e;                                    // 7500:0db6 / 0dcb
    for (;;) {
      e.b.set(r.read(9));                                                  // 7500:0e12
      e.next = null;                                                       // 7500:0e2d
      if (r.eof()) break;                                                  // 7500:0e3b / 0e73
      e.next = newEffect(); e = e.next;                                    // 7500:0e4a
    }
  }
  // 7500:0e8d FUN_0899_0104 (no effect)
}

async function fetchData(path) {                       // data-disk character files (inSaveDir = False; no caller in this build)
  const { fetchFile } = await import('../engine/dax.js');
  return fetchFile(path);
}

// ---- monsters / NPCs ----------------------------------------------------------------------------------------------

// 7500:0EC4 LoadMonster(id, var c): MON<n>CHA/SPC/ITM.DAX record id (MONSTERS.md)
export async function LoadMonster(id, c) {
  const n = String(pic.DataSet).substring(0, 1);                           // 7500:0ecb  Str(DataSet:0) into string[1]
  const p = await LoadDaxRecord(pic.DataPath + 'MON' + n + 'CHA', '.dax', id);   // 7500:0ee5 .. 0f27
  if (!p || p.length === 0) {                                              // 7500:0f2c
    await X.ShowBottomPromptAndReadKey(0x0F, 'Unable to load monster');      // 7500:0f32  (PARTY-ov17-07)
    terminateGame();                                                       // 7500:0f49
    return;
  }
  c.b.set(p.subarray(0, Math.min(0x11D, p.length)));                       // 7500:0f4e  Move $11D
  c.items = null;                                                          // 7500:0f6a
  c.effects = null;                                                        // 7500:0f79
  c.next = null;                                                           // 7500:0f87
  c.combat = null;                                                         // 7500:0f96
  switch (c.b[0x2E] /* race */) {                                          // 7500:0fa5
    case 1: case 3: case 5: c.b[0xC0] /* icon_size */ = 1; break;          // 7500:0fb8
    case 2: case 4: case 6: case 7: c.b[0xC0] = 2; break;                  // 7500:0fd3
    default: break;                                                        // race 0 (monster): unchanged
  }
  for (let i = 1; i <= 3; i++) {                                           // 7500:0fdc
    const r = await X.Roll(1, 6);                                          // 7500:0fe5
    c.b[0xC0 + i] = byte(((r + 8) << 4) + r);                              // 7500:0ff3  icon_colours[i]
  }
  c.b[0xC4] = 0xC4;                                                        // 7500:1020  icon_colours[4]
  for (let i = 5; i <= 6; i++) {                                           // 7500:1029
    const r = await X.Roll(1, 6);                                          // 7500:1032
    c.b[0xC0 + i] = byte(((r + 8) << 4) + r);                              // 7500:1040
  }
  // 7500:106d FreeMem
  G.NoDiskPrompt = 1;                                                      // 7500:107b  g_557C
  const s = await LoadDaxRecord(pic.DataPath + 'MON' + n + 'SPC', '.dax', id);   // 7500:1080 .. 10c2
  if (s && s.length !== 0) {                                               // 7500:10c7
    let ofs = 0;                                                           // 7500:10d0
    let e = newEffect(); c.effects = e;                                    // 7500:10d5 / 10ea
    do {
      e.b.set(s.subarray(ofs, ofs + 9));                                   // 7500:10fc
      e.next = null;                                                       // 7500:1114
      ofs += 9;                                                            // 7500:1121
      if (ofs < s.length) { e.next = newEffect(); e = e.next; }            // 7500:1125 / 112d
    } while (ofs < s.length);                                              // 7500:1152
  }
  const t = await LoadDaxRecord(pic.DataPath + 'MON' + n + 'ITM', '.dax', id);   // 7500:1168 .. 11aa
  if (t && t.length !== 0) {                                               // 7500:11af
    let ofs = 0;                                                           // 7500:11b8
    let it = newItem(); c.items = it;                                      // 7500:11bd / 11d3
    do {
      it.b.set(t.subarray(ofs, ofs + 0x3F));                               // 7500:11e6
      it.next = null;                                                      // 7500:11fe
      ofs += 0x3F;                                                         // 7500:120b
      if (ofs < t.length) { it.next = newItem(); it = it.next; }           // 7500:120f / 1217
    } while (ofs < t.length);                                              // 7500:123c
  }
  G.NoDiskPrompt = 0;                                                      // 7500:1252
  // 7500:1257 FUN_0899_0104 (no effect)
}

// 7500:1262 AddNpcToParty(id): monster record id joins the party (max 8) with a random portrait
export async function AddNpcToParty(id) {
  if (memW('6B00', 0x67C) > 7) return;                                     // 7500:1268  party member count
  const c = newChar();                                                     // 7500:1277  GetMem $11D
  await LoadMonster(id, c);                                                // 7500:1286
  c.b[0xAB] = Random(256);                                                 // 7500:129d  TChar +ABh (unknown)
  let n = 0;                                                               // 7500:12ae
  const cls = [];
  for (let i = 0; i <= 6; i++)                                             // 7500:12b2
    if (shortint(c.b[0x96 + i]) > 0) { n++; cls[n] = i; }                  // 7500:12bb  level[i], signed; monk not considered
  if (n === 0) { n = 1; cls[1] = 2; }                                      // 7500:12e2  default: fighter
  n = await X.Roll(1, n);                                                  // 7500:12f7
  const gender = shortint(c.b[0x9E]);                                      // CBW: signed
  const pick = async (tab) => dsb(tab + gender * 5 + (await X.Roll(1, 5)));   // [DI + tab], DI = gender*5 + Roll(1,5)
  switch (cls[n]) {                                                        // 7500:1306
    case 0: c.b[0xBC] /* body_pic */ = await pick(0x08D7); break;          // 7500:1314  NpcBodyCleric
    case 5: c.b[0xBC] = await pick(0x08EB); break;                         // 7500:134b  NpcBodyMagicUser
    case 6: c.b[0xBC] = await pick(0x08F5); break;                         // 7500:1381  NpcBodyThief
    default: c.b[0xBC] = await pick(0x08E1); break;                        // 7500:13b3  NpcBodyFighter
  }
  c.b[0xBB] /* head_pic */ = dsb(0x08C7 + gender * 8 + (await X.Roll(1, 8)));   // 7500:13e3 .. 140a  NpcHead
  await AddToParty(c);                                                     // 7500:140f
  await LoadCharacterIcon(true);                                           // 7500:1419  c is SelectedChar now
}

// 7500:1446 AddToParty(c): append, select, lowest free party slot 0..7, count. (mem6B00 parameter kept for the M2
// caller; the original uses ecl_Mem6B00.)
export async function AddToParty(c, mem6B00) {
  c.b[0xBF] = 0xFF;                                                        // 7500:144c  party_slot
  if (G.PartyHead === null) {                                              // 7500:1455
    G.PartyHead = c;                                                       // 7500:145e
    G.SelectedChar = c;                                                    // 7500:146b
  } else {
    let p = G.PartyHead;                                                   // 7500:147a
    while (p.next !== null) p = p.next;                                    // 7500:1487
    p.next = c;                                                            // 7500:14ab
  }
  const used = new Array(8).fill(false);                                   // 7500:14be  FillChar(used, 8, 0)
  for (let p = G.PartyHead; p !== null; p = p.next)                        // 7500:14cf / 14dc / 1509
    if (p.b[0xBF] <= 7) used[p.b[0xBF]] = true;                            // 7500:14e4  in [0..7]
  G.SelectedChar = c;                                                      // 7500:151e
  c.b[0xBF] = 0;                                                           // 7500:1535
  while (c.b[0xBF] < 8 && used[c.b[0xBF]]) c.b[0xBF]++;                    // 7500:153e .. 155e
  const m = mem6B00 ?? mem('6B00');
  if (m) m[0x67C >> 1] = (m[0x67C >> 1] + 1) & 0xFFFF;                     // 7500:1565  ecl_Mem6B00^.w[$67C]
  const uls = opt('UpdateLevelStats'); if (uls) await uls(c);              // 7500:156e  ov23
}

// ---- saved games --------------------------------------------------------------------------------------------------

const words = (b) => { const w = new Uint16Array(b.length >> 1); for (let i = 0; i < w.length; i++) w[i] = b[2 * i] | (b[2 * i + 1] << 8); return w; };
const bytesOf = (w) => { const b = new Uint8Array(w.length * 2); for (let i = 0; i < w.length; i++) { b[2 * i] = w[i] & 0xFF; b[2 * i + 1] = w[i] >> 8; } return b; };

async function vmAndView(vm, view) {
  if (!vm) vm = (await import('./ecl_host.js')).vm;
  if (!view) view = await import('./view.js');
  return { vm, view };
}

// 7500:1602 LoadGame — vm = the ECL VM (word arrays mem4900/mem6B00/mem9700, code buffer), view = areas/view.js module.
// GBP W8 (hooks request #16): `presetKey` = a slot letter chosen by Plus quick load; the "Load Which Game" menu is
// skipped (no caller of the original passes it). Returns false when that save does not exist.
export async function LoadGame(vm, view, presetKey) {
  ({ vm, view } = await vmAndView(vm, view));
  await EnsureSaveDir();                                                   // 7500:1609
  let opts = '';                                                           // 7500:160d  string[20]
  for (let k = 65; k <= 74; k++) {                                         // 7500:1612  'A'..'J'
    const key = String.fromCharCode(k);
    if (await fileExists(SavePath() + 'savgam' + key + '.dat')) opts += key + ' ';   // 7500:161d .. 1699
  }
  let key;
  if (presetKey) {                                                         // GBP #16
    key = presetKey;
    if (!(await fileExists(SavePath() + 'savgam' + key + '.dat'))) return false;
  } else for (;;) {
    if (opts === '') return;                                               // 7500:16a8
    dev.screenSoon('PM-13');
    key = (await X.HorizontalMenu('Load Which Game: ', opts, 0x0D, 0x0A, 0x0F, false, false)).key;   // 7500:16b2 .. 16dd
    if ((key >= 'A' && key <= 'J' && await fileExists(SavePath() + 'savgam' + key + '.dat')) || key === '\0') break;   // 7500:16e6 .. 1739
  }
  if (key === '\0') return;                                                // 7500:1743  Esc
  // 7500:174d OpenWithPrompt(SavePath + 'savgam' + key + '.dat', 'Put save disk in ' + SavePath, True, f) — never prompts
  const f = reader((await readFile(SavePath() + 'savgam' + key + '.dat')) ?? new Uint8Array(0));
  X.ClearMenuLine();                                                         // 7500:17b2
  X.DrawText(0, 24, 0x0A, 'Loading...Please Wait');                          // 7500:17b7 .. 17d0  (PARTY-ov17-04)
  pic.DataSet = f.read(1)[0] ?? pic.DataSet;                               // 7500:17d5
  vm.mem4900.set(words(f.read(0x800)));                                    // 7500:17ef
  vm.mem6B00.set(words(f.read(0x800)));                                    // 7500:180a
  vm.mem9700.set(words(f.read(0x400)));                                    // 7500:1825
  vm.code.set(f.read(0x1E00));                                             // 7500:1840
  const pos = f.read(5);                                                   // 7500:185b  6AAD..6AB1: x, y, dir, passage, attr
  G.party_MapX = pos[0]; G.party_MapY = pos[1]; G.party_Dir = pos[2]; G.party_Ahead = pos[3]; G.party_CellAttr = pos[4];
  G.travel_Mode = f.read(1)[0];                                            // 7500:1875
  G.game_Mode = f.read(1)[0];                                              // 7500:188f
  const count = f.read(1)[0];                                              // 7500:18a9
  const nb = f.read(0x148);                                                // 7500:18c4  names[1..8] string[40]
  const names = []; for (let i = 0; i < 8; i++) names.push(nb.length >= i * 41 + 1 ? pstr(nb, i * 41) : '');
  // 7500:18df Close
  const m49 = vm.mem4900, m6B = vm.mem6B00;
  G.opt_MonsterPics = m49[0x1FE >> 1] >> 1;                                // 7500:18ea
  G.opt_Portraits = m49[0x1FE >> 1] & 1;                                   // 7500:18f8
  G.GameSpeed = m49[0x1F8 >> 1] & 0xFF;                                    // 7500:1907  .b[$1F8]
  m6B[0x67C >> 1] = 0;                                                     // 7500:1913  party count, rebuilt by AddToParty
  for (let i = 1; i <= count; i++) {                                       // 7500:191e
    const fn = MakeDosName(DeleteAll(names[i - 1], '.'));                  // 7500:193b .. 197e
    if (await fileExists(SavePath() + fn + '.sav')) {                      // 7500:1983 .. 19a8
      const c = newChar();                                                 // 7500:19b1
      await ReadCharacter(fn, c, true, true);                              // 7500:19c2
      await AddToParty(c, m6B);                                            // 7500:19da
      await EnsureSaveDir();                                               // 7500:19e6
    }
  }
  for (let p = G.PartyHead; p !== null; p = p.next) {                      // 7500:19f7 / 1a06 / 1b65  members leave the roster
    const fn = SavePath() + MakeDosName(DeleteAll(pstr(p.b, 0), '.'));     // 7500:1a13 .. 1a5e
    if (await fileExists(fn + '.cha')) {                                   // 7500:1a63
      await eraseFile(fn + '.cha');                                        // 7500:1a8a / 1ab0
      if (await fileExists(fn + '.itm')) await eraseFile(fn + '.itm');     // 7500:1abb .. 1b05
      if (await fileExists(fn + '.spc')) await eraseFile(fn + '.spc');     // 7500:1b10 .. 1b5a
    }
  }
  for (G.SelectedChar = G.PartyHead; G.SelectedChar !== null; G.SelectedChar = G.SelectedChar.next)   // 7500:1b7e / 1b8c / 1b9c
    await LoadCharacterIcon(true);                                         // 7500:1b95
  G.SelectedChar = G.PartyHead;                                            // 7500:1bb3
  pic.DataSet = m6B[0x624 >> 1] & 0xFF;                                    // 7500:1bc1  .b[$624]
  if (G.travel_Mode < 2) await view.Load3DMap(m49[0x18A >> 1] & 0xFF);     // 7500:1bcd / 1bde  .b[$18A]
  if (G.travel_Mode > 1) {
    const lci = opt('LoadCombatIcon'); if (lci) await lci('ICON', 0, 11);  // 7500:1be3 .. 1c00
  } else {
    for (let i = 1; i <= 3; i++) {                                         // 7500:1c08
      view.view.wallSlotId[i] = m49[(0x3F2 + 2 * i) >> 1];                 // 7500:1c13  g_6AAE[i*4]
      view.view.wallSlotNo[i] = m49[(0x3F8 + 2 * i) >> 1];                 // 7500:1c39  g_6AB0[i*4]
      if ((view.view.wallSlotId[i] & 0x8000) === 0)                        // Integer(...) >= 0
        await view.LoadWallSet(view.view.wallSlotId[i] & 0xFF, view.view.wallSlotNo[i] & 0xFF);   // 7500:1c63 .. 1c94
    }
  }
  if (m49[0x344 >> 1] !== 0) { const r = opt('RecolourOverlandTiles'); if (r) await r(0); }   // 7500:1ca3 / 1cb2
  // 7500:1cb7 FUN_0899_0104 (no effect)
  X.ClearMenuLine();                                                         // 7500:1cbc
  hooks.emit('saveLoaded', () => ({ slot: key, members: count }));         // 7500:1cbc
}

// 7500:1D58 SaveGame — members saved as CHRDAT<key><n> (n = list position), roster copies erased, GameSaved := 1.
// GBP W8 (hooks request #16): `presetKey` = a Plus quick/auto-save slot letter; the "Save Which Game" menu is skipped.
export async function SaveGame(vm, view, presetKey) {
  ({ vm, view } = await vmAndView(vm, view));
  let key = presetKey;
  if (!key) do {
    dev.screenSoon('SV-01');
    key = (await X.HorizontalMenu('Save Which Game: ', 'A B C D E F G H I J', 0x0D, 0x0A, 0x0F,
      false, G.game_Mode === 2)).key;                                      // 7500:1d5f .. 1d9c  animate in mode 2
  } while (!(key === '\0' || (key >= 'A' && key <= 'J')));                 // 7500:1da5  set CS:1CEB
  if (key === '\0') return;                                                // 7500:1db6
  await EnsureSaveDir();                                                   // 7500:1dc0
  // 7500:1dc4 .. 1e5d  Assign / Rewrite / IOResult loop (cannot fail here)
  X.ClearMenuLine();                                                         // 7500:1e67
  X.DrawText(0, 24, 0x0A, 'Saving...Please Wait');                           // 7500:1e6c .. 1e85  (PARTY-ov17-06)
  const m49 = vm.mem4900, m6B = vm.mem6B00;
  for (let i = 1; i <= 3; i++) {                                           // 7500:1e8a
    m49[(0x3F2 + 2 * i) >> 1] = view.view.wallSlotId[i] & 0xFFFF;          // 7500:1e95  g_6AAE[i*4]
    m49[(0x3F8 + 2 * i) >> 1] = view.view.wallSlotNo[i] & 0xFFFF;          // 7500:1ebb  g_6AB0[i*4]
  }
  m49[0x1F8 >> 1] = G.GameSpeed & 0xFFFF;                                  // 7500:1ee8
  m49[0x1FE >> 1] = (G.opt_MonsterPics * 2 + G.opt_Portraits) & 0xFFFF;    // 7500:1ef6
  m6B[0x624 >> 1] = pic.DataSet & 0xFFFF;                                  // 7500:1f0f
  const parts = [];
  parts.push(Uint8Array.of(pic.DataSet));                                  // 7500:1f1d
  parts.push(bytesOf(m49));                                                // 7500:1f35  $800
  parts.push(bytesOf(m6B));                                                // 7500:1f4e  $800
  parts.push(bytesOf(vm.mem9700));                                         // 7500:1f67  $400
  parts.push(vm.code.slice(0, 0x1E00));                                    // 7500:1f80
  parts.push(Uint8Array.of(G.party_MapX, G.party_MapY, G.party_Dir, G.party_Ahead ?? 0, G.party_CellAttr ?? 0));   // 7500:1f99  6AAD..6AB1
  parts.push(Uint8Array.of(G.travel_Mode));                                // 7500:1fb1
  parts.push(Uint8Array.of(G.game_Mode));                                  // 7500:1fc9
  // TODO(decode): garbage — the unused name slots are uninitialised stack bytes in the original; zeros here.
  const names = new Uint8Array(0x148);
  let n = 0;                                                               // 7500:1fe1
  for (let p = G.PartyHead; p !== null; p = p.next) {                      // 7500:1fe6 / 1ff5 / 206e
    n++;                                                                   // 7500:2002
    setPstr(names, (n - 1) * 41, 'CHRDAT' + key + String(n).substring(0, 1), 40);   // 7500:2006 .. 2069
  }
  parts.push(Uint8Array.of(n));                                            // 7500:2087
  parts.push(names);                                                       // 7500:20a0  all 8 slots
  await writeFile(SavePath() + 'savgam' + key + '.dat', concat(parts));    // 7500:20b9  Close
  n = 0;                                                                   // 7500:20c4 / 20d3
  for (let p = G.PartyHead; p !== null; p = p.next) {                      // 7500:20d8 / 2290
    n++;                                                                   // 7500:20e5
    await WriteCharacter(p, 'CHRDAT' + key + String(n).substring(0, 1));   // 7500:20e9 .. 213e
    const fn = SavePath() + MakeDosName(DeleteAll(pstr(p.b, 0), '.'));     // 7500:2141 .. 218c
    if (await fileExists(fn + '.cha')) await eraseFile(fn + '.cha');       // 7500:2191 .. 21db  quirk: three independent tests
    if (await fileExists(fn + '.itm')) await eraseFile(fn + '.itm');       // 7500:21e6 .. 2230
    if (await fileExists(fn + '.spc')) await eraseFile(fn + '.spc');       // 7500:223b .. 2285
  }
  G.GameSaved = 1;                                                         // 7500:22a9  g_557D
  X.ClearMenuLine();                                                         // 7500:22ae
  hooks.emit('gameSaved', () => ({ slot: key }));                          // 7500:22ae
}

// 7500:22D5 CheckEclDisk(name): the ECL file of the new data set must exist, else a menu 'Save and exit  Insert disk #n'
// (empty prompt; S = step back, save, quit; I = return, the caller's loader then prompts for the disk). Fix request #a-6:
// the bytes push '' (CS:22D4) first = prompt, the built string second = options (7500:2342..236a).
export async function CheckEclDisk(name, vm, view) {
  const nm = name.substring(0, 40);                                        // 7500:22dc
  const { FileExists } = await import('../engine/dax.js');
  if (await FileExists(nm)) return;                                        // 7500:22ef  data files on /data/
  const ns = String(pic.DataSet).substring(0, 1);                          // 7500:2300
  const options = 'Save and exit  Insert disk #' + ns;                     // 7500:231a .. 233d  string[40] (PARTY-ov17-08)
  const r = await X.HorizontalMenu('', options, 0x0D, 0x0A, 0x0F, false, false);   // 7500:2342 .. 236a  prompt '' (CS:22D4)
  if (!r.ext && r.key === 'S') {                                           // 7500:2372 / 2378
    const dx = shortint(dsb(0x2736 + G.party_Dir)), dy = shortint(dsb(0x273F + G.party_Dir));
    G.party_MapX = shortint(G.party_MapX - dx);                            // 7500:237e
    if (G.party_MapX < 0) G.party_MapX = 15;                               // 7500:238d
    if (G.party_MapX > 15) G.party_MapX = 0;                               // 7500:2399
    G.party_MapY = shortint(G.party_MapY - dy);                            // 7500:23a5
    if (G.party_MapY < 0) G.party_MapY = 15;                               // 7500:23b4
    if (G.party_MapY > 15) G.party_MapY = 0;                               // 7500:23c0
    RestoreDataSet();                                                      // 7500:23cc
    await SaveGame(vm, view);                                              // 7500:23d1
    terminateGame();                                                       // 7500:23d5
  }
}

// ---- ECL host methods (game/engine/ecl.js call shapes) ------------------------------------------------------------
export const partyOv17Host = {
  loadMonster: async (id) => { const c = newChar(); await LoadMonster(id & 0xFF, c); return c; },   // 4300:0411 GetMem + LoadMonster
  addNpcToParty: (id) => AddNpcToParty(id & 0xFF),                         // 2F00:2B97 (stub ov17 e7)
  checkEclDisk: (name) => CheckEclDisk(name),                              // 2F00:0C19 (stub ov17 e11)
};

export { rdW };
