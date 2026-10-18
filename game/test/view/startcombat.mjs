// StartCombat smoke test (por-build-ecl): shipped save area, 6 placeholder members + 2 placeholder monsters at distance 2;
// prints the deployment and an occupancy/terrain map ('#' impassable, digits = combatants). node game/test/view/startcombat.mjs
console.warn = () => {};
import { readFileSync } from 'node:fs';
const DATA=(process.env.POR_DATA||'../re-targets/goldbox/por/POOLRAD')+'/';
globalThis.fetch = async (u) => { const n = decodeURIComponent(String(u).replace('/data/','')); try { const b = readFileSync(DATA+n); return { ok:true, json: async()=>JSON.parse(b), arrayBuffer: async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.length) }; } catch { return {ok:false}; } };
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
const R=new URL('../../', import.meta.url).href;
const P = await import(R+'engine/pictures.js'); P.state.display = { pix: new Uint8Array(64000), touch(){}, setPaletteRegister(){} };
const T = await import(R+'engine/text.js'); await (await import(R+'areas/startup.js')).InitGameState(); T.text.GameSpeed = 0; T.text.TextOutputActive = 0;
const H = await import(R+'areas/ecl_host.js'); const { newChar } = await import(R+'engine/ecl.js');
const vm = await H.bindEclHost(); const g = H.eclG;
const exe = readFileSync(new URL('../../../decode/bin/START.unpacked.exe', import.meta.url)); if (!g.ds) g.ds = new Uint8Array(exe.subarray(exe.readUInt16LE(8)*16 + 0xC7C0, exe.readUInt16LE(8)*16 + 0xC7C0 + 0x8760));
H.resumeSaveIntoVM(readFileSync(DATA+'SAVE/SAVGAMA.DAT'));
g.ecl_Block = 20; vm.stepLimit=5000; await vm.run(vm.vecE); g.party_Dir = 2;
let prev = null;
for (let i = 0; i < 6; i++) { const c = newChar(); c.b[0x10D]=1; c.b[0x6C]=1; c.b[0xBF]=i; c.b[0x11B]=10; if (prev) prev.next = c; else g.PartyHead = c; prev = c; }
g.SelectedChar = g.PartyHead; vm.setM1(0x6E3E, 6); vm.setM1(0x6DC1, 2);
const P17 = await import(R+'areas/party_ov17.js');
for (let i = 0; i < 2; i++) { const m = newChar(); m.b[0x6C] = 1; m.b[0xBF] = 8; m.b[0x10E] = 1; m.b[0x10D] = 1; prev.next = m; prev = m; }
const O10 = await import(R+'areas/view_ov10.js');
const CB = await import(R+'areas/combat.js'); const ext = {}; for (const m of ['areas/res_00ba.js','areas/view.js','areas/magic.js']) { const mod = await import(R+m); for (const [k,v] of Object.entries(mod)) if (typeof v==='function' && !(k in ext)) ext[k]=v; } CB.bindCombat({ g, ext });
await O10.StartCombat();
const n = g.cb_Size[0];
console.log('count', n, 'origin', g.cm_Map.b[2], g.cm_Map.b[3], 'mode', g.game_Mode);
for (let i = 1; i <= n; i++) console.log(i, g.cb_Char[i] ? 'side'+g.cb_Char[i].b[0x10E] : '-', g.cb_Col[i], g.cb_Row[i], g.cb_Size[i]);
let s=''; for (let r = 0; r < 25; r++) { let l=''; for (let c = 0; c < 50; c++) { const o = g.cm_Occupant[r*50+c]; l += o ? String(o%10) : (g.ds[0x2744 + g.cm_Map.b[7+r*50+c]*4] === 0xFF ? '#' : '.'); } s += l + '\n'; } console.log(s);

const bad = n !== 9 || g.game_Mode !== 5 || [1,2,3,4,5,6,7,8].some((i) => !g.cb_Size[i]);
console.log(bad ? 'RESULT: FAIL' : 'RESULT: PASS'); process.exit(bad ? 1 : 0);
