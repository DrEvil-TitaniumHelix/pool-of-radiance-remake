// game/test/party/ov17.test.mjs — node test of game/areas/party_ov17.js (PARTY ov17: character / monster / game files).
// Run: node game/test/party/ov17.test.mjs
// The original data folder is served read-only through a fetch stub (/data/<file>, /data/SAVE/<file>); writes go to the
// files.js memory store (no IndexedDB in node), never into the original folder. Expected values: SAVES.md §1..§3 and
// decode/pseudo/party_parts/ov17.pas.md (addresses cited per case).
import { readFile as fsRead } from 'node:fs/promises';
import { bindParty, env } from '../../areas/party_core.js';
import * as P from '../../areas/party_ov17.js';
import { G, newChar, pstr, setPstr } from '../../engine/state.js';
import { state as pic } from '../../engine/pictures.js';
import { readFile, fileExists, readLines } from '../../engine/files.js';
import { readDir, fetchFile } from '../../engine/dax.js';

const DATA = process.env.POR_DATA || '../re-targets/goldbox/por/POOLRAD';
globalThis.fetch = async (url) => {
  const u = decodeURIComponent(String(url));
  const m = /^\/data\/(.*)$/.exec(u);
  if (!m) return { ok: false };
  try { const b = await fsRead(DATA + '/' + m[1]); return { ok: true, arrayBuffer: async () => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) }; }
  catch { return { ok: false }; }
};

let fails = 0;
const eq = (name, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a !== b) { fails++; console.log(`FAIL ${name}: got ${a}, want ${b}`); } else console.log(`ok   ${name}`);
};
const bytesEq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const list = (p) => { const r = []; for (; p; p = p.next) r.push(p); return r; };

// fake environment: menus answer from a key queue, text calls are recorded, Roll from a queue
let keys = [], calls = [], rolls = [];
const rec = (name, ret) => (...a) => { calls.push([name, ...a]); return typeof ret === 'function' ? ret(...a) : ret; };
const fakeVM = () => ({ mem4900: new Uint16Array(0x400), mem6B00: new Uint16Array(0x400), mem9700: new Uint16Array(0x200), code: new Uint8Array(0x1E00) });
const fakeView = () => ({ view: { wallSlotId: [0, 0, 0, 0], wallSlotNo: [0, 0, 0, 0] }, Load3DMap: rec('Load3DMap'), LoadWallSet: rec('LoadWallSet') });
function setup() {
  keys = []; calls = []; rolls = [];
  G.PartyHead = null; G.SelectedChar = null; G.SavePath = '';
  bindParty({
    g: G, ext: {
      HorizontalMenu: async (...a) => { calls.push(['HorizontalMenu', ...a]); return { key: keys.shift() ?? '\0', ext: false }; },
      DrawText: rec('DrawText'), ClearMenuLine: rec('ClearMenuLine'), ShowBottomPromptAndReadKey: rec('ShowBottomPromptAndReadKey'),
      Roll: (n, s) => { calls.push(['Roll', n, s]); return rolls.length ? rolls.shift() : 1; },
      RecolorPicture: rec('RecolorPicture'), TerminateGame: rec('TerminateGame'),
    },
  });
}

// ---- 0802 helpers --------------------------------------------------------------------------------------------
setup();
eq('MakeDosName strips + caps (0802:0425)', P.MakeDosName('Sir. Bob*x,y'), 'SIRBOBXY');
eq('MakeDosName first 8', P.MakeDosName('abcdefghij'), 'ABCDEFGH');
eq('DeleteAll adjacent quirk (0802:03bc)', P.DeleteAll('a..b', '.'), 'a.b');
eq('DeleteAll byte bound wrap (0802:0385)', P.DeleteAll('', 'xxxxx'), '');

// ---- ReadCharacter of a shipped member (7500:0AEC) -------------------------------------------------------------
setup();
const raw = new Uint8Array(await fsRead(DATA + '/SAVE/CHRDATA1.SAV'));
const rawItm = new Uint8Array(await fsRead(DATA + '/SAVE/CHRDATA1.ITM'));
const rawSpc = new Uint8Array(await fsRead(DATA + '/SAVE/CHRDATA1.SPC'));
const c1 = newChar();
await P.ReadCharacter('CHRDATA1', c1, true, true);
eq('ReadCharacter record = file (0c2f)', bytesEq(c1.b, raw), true);
eq('ReadCharacter items 126/63 = 2 (0d14)', list(c1.items).length, 2);
eq('ReadCharacter effects 36/9 = 4 (0e12)', list(c1.effects).length, 4);
eq('ReadCharacter item 2 bytes', bytesEq(c1.items.next.b, rawItm.subarray(63, 126)), true);
const c4 = newChar();
await P.ReadCharacter('chrdata4', c4, true, true);
eq('ReadCharacter no .spc -> effects nil (0d8f)', c4.effects, null);

// ---- WriteCharacter round trip, saved-game branch (7500:069E name <> '') ---------------------------------------
await P.WriteCharacter(c1, 'CHRDATZ1');
eq('WriteCharacter .sav = record (08b3)', bytesEq(await readFile('CHRDATZ1.SAV'), raw), true);
eq('WriteCharacter .itm (0991)', bytesEq(await readFile('CHRDATZ1.ITM'), rawItm), true);
eq('WriteCharacter .spc (0a84)', bytesEq(await readFile('CHRDATZ1.SPC'), rawSpc), true);
const c1b = newChar(); await P.ReadCharacter('CHRDATZ1', c1b, true, true);
eq('round trip record', bytesEq(c1b.b, c1.b), true);
// no effects any more: the old .spc is erased and none written (09cb / 0a20)
c1b.effects = null; await P.WriteCharacter(c1b, 'CHRDATZ1');
eq('WriteCharacter erases stale .spc', await fileExists('CHRDATZ1.SPC'), false);

// ---- roster branch + charlist.txt (7500:06b8, 0010, 01B8) ------------------------------------------------------
setup();
const r1 = newChar(); setPstr(r1.b, 0, 'Al.ice', 15);
await P.WriteCharacter(r1, '');
eq('roster file name = MakeDosName(DeleteAll(name,".")) .cha (079b)', await fileExists('ALICE.CHA'), true);
eq('charlist.txt gets the name (072c)', await readLines('charlist.txt'), ['Al.ice']);
const r2 = newChar(); setPstr(r2.b, 0, 'Bob', 15);
await P.WriteCharacter(r2, '');
eq('charlist appends (0740)', await readLines('charlist.txt'), ['Al.ice', 'Bob']);
G.PartyHead = r2;
let l = await P.ReadCharList();
eq("ReadCharList '* ' for party members (0153)", list(l).map((n) => n.text), ['Al.ice', '* Bob']);
await P.WriteCharList(l);
eq("WriteCharList drops '*' entries (0254)", await readLines('charlist.txt'), ['Al.ice']);

// ---- AddToParty (7500:1446) ------------------------------------------------------------------------------------
setup();
const vm = fakeVM(); G.ecl_Mem6B00 = vm.mem6B00; G.ecl_Mem4900 = vm.mem4900;
const a = newChar(), b = newChar(), d = newChar();
await P.AddToParty(a); await P.AddToParty(b);
b.b[0xBF] = 5;                                    // a member with slot 5
await P.AddToParty(d);
eq('AddToParty slots lowest free (153e)', [a.b[0xBF], b.b[0xBF], d.b[0xBF]], [0, 5, 1]);
eq('AddToParty count w[67Ch] (1565)', vm.mem6B00[0x67C >> 1], 3);
eq('AddToParty selects the new one (151e)', G.SelectedChar === d, true);
eq('AddToParty appends (14ab)', list(G.PartyHead).length, 3);

// ---- LoadMonster (7500:0EC4) -----------------------------------------------------------------------------------
setup();
pic.DataSet = 1; pic.DataPath = '';
const dax = await fetchFile('MON1CHA.DAX');
const id = readDir(dax).entries[0].id;
rolls = [3, 4, 5, 6, 2];
const m = newChar();
await P.LoadMonster(id, m);
eq('LoadMonster colours ((r+8) shl 4) + r, [4] = C4h (0ff3 / 1020)', Array.from(m.b.subarray(0xC1, 0xC7)), [0xB3, 0xC4, 0xD5, 0xC4, 0xE6, 0xA2]);
eq('LoadMonster rolls 1d6 x5', calls.filter((x) => x[0] === 'Roll').map((x) => [x[1], x[2]]), [[1, 6], [1, 6], [1, 6], [1, 6], [1, 6]]);
const race = m.b[0x2E];
eq('LoadMonster icon_size by race (0fa5)', [1, 3, 5].includes(race) ? m.b[0xC0] === 1 : [2, 4, 6, 7].includes(race) ? m.b[0xC0] === 2 : true, true);
eq('LoadMonster name is a Pascal string', pstr(m.b, 0).length > 0, true);
calls = [];
await P.LoadMonster(0xFE, newChar());
eq('LoadMonster missing record -> message + TerminateGame (0f32 / 0f49)', calls.map((x) => x[0]), ['ShowBottomPromptAndReadKey', 'TerminateGame']);

// ---- LoadGame of the shipped SAVGAMA.DAT (7500:1602), then SaveGame round trip (7500:1D58) ---------------------
setup();
const sav = new Uint8Array(await fsRead(DATA + '/SAVE/SAVGAMA.DAT'));
const vm2 = fakeVM(), view2 = fakeView();
G.ecl_Mem4900 = vm2.mem4900; G.ecl_Mem6B00 = vm2.mem6B00; G.ecl_Mem9700 = vm2.mem9700;
keys = ['A'];
await P.LoadGame(vm2, view2);
const hm = calls.find((x) => x[0] === 'HorizontalMenu');
eq('LoadGame menu (16b2)', hm.slice(1, 6), ['Load Which Game: ', 'A ', 0x0D, 0x0A, 0x0F]);
eq('LoadGame loading line (17b7)', calls.find((x) => x[0] === 'DrawText').slice(1), [0, 24, 0x0A, 'Loading...Please Wait']);
eq('LoadGame position bytes 12801.. (185b)', [G.party_MapX, G.party_MapY, G.party_Dir], [sav[12801], sav[12802], sav[12803]]);
eq('LoadGame travel/game mode (1875 / 188f)', [G.travel_Mode, G.game_Mode], [sav[12806], sav[12807]]);
const members = list(G.PartyHead);
eq('LoadGame member count (18a9)', members.length, sav[12808]);
eq('LoadGame w[67Ch] rebuilt', vm2.mem6B00[0x67C >> 1], sav[12808]);
eq('LoadGame first member = CHRDATA1.SAV', bytesEq(members[0].b.subarray(0, 0xBF), raw.subarray(0, 0xBF)), true);
eq('LoadGame DataSet := 6B00 .b[624h] (1bc1)', pic.DataSet, vm2.mem6B00[0x624 >> 1] & 0xFF);
if (G.travel_Mode < 2) eq('LoadGame Load3DMap(.b[18Ah]) (1bde)', calls.find((x) => x[0] === 'Load3DMap').slice(1), [vm2.mem4900[0x18A >> 1] & 0xFF]);
eq('LoadGame SelectedChar = PartyHead (1bb3)', G.SelectedChar === G.PartyHead, true);

calls = []; keys = ['Q', 'C'];                     // 'Q' is not in the set: the menu repeats (1da5)
await P.SaveGame(vm2, view2);
eq('SaveGame menu repeats until A..J (1da5)', calls.filter((x) => x[0] === 'HorizontalMenu').length, 2);
const out = await readFile('SAVGAMC.DAT');
eq('SaveGame size 13137 (SAVES.md §2)', out.length, 13137);
eq('SaveGame state blocks = loaded file (1f1d .. 1fc9)', bytesEq(out.subarray(0, 12809), sav.subarray(0, 12809)), true);
eq('SaveGame names CHRDATC<n> (2022)', members.map((_, i) => pstr(out, 12809 + i * 41)), members.map((_, i) => 'CHRDATC' + (i + 1)));
eq('SaveGame member files (213e)', bytesEq((await readFile('CHRDATC1.SAV')).subarray(0, 0xBF), raw.subarray(0, 0xBF)), true);
eq('SaveGame GameSaved := 1 (22a9)', G.GameSaved, 1);

// ---- CheckEclDisk (7500:22D5) ------------------------------------------------------------------------------------
setup(); calls = [];
await P.CheckEclDisk('ECL1.dax');
eq('CheckEclDisk present file -> no menu (22ef)', calls.length, 0);
keys = ['\0'];
await P.CheckEclDisk('ECL9.dax');
eq('CheckEclDisk missing -> menu: empty prompt first, options = Save and exit / Insert disk (2342, #a-6)', calls.find((x) => x[0] === 'HorizontalMenu').slice(1, 3), ['', 'Save and exit  Insert disk #' + String(pic.DataSet)[0]]);

void env;
console.log(fails ? `${fails} FAILED` : 'all passed');
process.exit(fails ? 1 : 0);
