// Unit checks of documented engine quirks (ECL_VM.md / ECL.pas.md). Run: node game/test/ecl/quirks.mjs
import { EclVM, makeGlobals, newChar, setPstr } from '../../engine/ecl.js';
import { loadRecord } from './daxnode.mjs';

let bad = 0;
const eq = (name, got, exp) => { const ok = JSON.stringify(got) === JSON.stringify(exp); if (!ok) bad++; console.log((ok ? 'ok   ' : 'FAIL ') + name + (ok ? '' : `: ${JSON.stringify(got)} != ${JSON.stringify(exp)}`)); };
const host = new Proxy({}, { get: () => () => 0 });
function vmWith(bytes) {
  const g = makeGlobals(); const c = newChar(); setPstr(c.b, 0, 'A', 15); c.b[0x10D] = 1; g.PartyHead = g.SelectedChar = c;
  const vm = new EclVM(host, g); vm.code.set(bytes); return vm;
}
const run = async (vm, at = 0x9900) => { vm.stepLimit = 100; await vm.run(at); return vm; };

// SUBTRACT = operand 2 - operand 1 (2F00:01FC)
{ const vm = await run(vmWith([0x05, 0, 3, 0, 10, 1, 0x00, 0x97, 0x00])); eq('SUBTRACT op2-op1', vm.m2(0x9700), 7); }
// AND: CompareWords(0, r): r = 0 -> EQ GE LE; r <> 0 -> NE LT LE (2F00:0E3E)
{ const vm = await run(vmWith([0x2F, 0, 1, 0, 2, 1, 0, 0x97, 0x00])); eq('AND r=0 flags', [...vm.flags], [1, 0, 0, 0, 1, 1]); }
{ const vm = await run(vmWith([0x30, 0, 1, 0, 2, 1, 0, 0x97, 0x00])); eq('OR r=3 flags', [...vm.flags], [0, 1, 1, 0, 1, 0]); }
// IF false + SETUP_MONSTER (0Ch): the skip table reads 2 operands, the handler 3 -> PC lands on operand 3 (4300:1EA6)
{ const vm = vmWith([0x16, 0x0C, 0, 1, 0, 2, 0, 3, 0x00]); vm.flags[0] = 0; vm.pc = 0x9900; vm.curOp = 0x16; await vm.dispatch();
  eq('IF skip 0Ch uses 2 operands', vm.pc.toString(16), '9906'); }
// IF false + HORIZONTAL_MENU (2Bh): only the opcode byte is skipped
{ const vm = vmWith([0x17, 0x2B, 1, 0, 0x97, 0, 1]); vm.flags[1] = 0; vm.pc = 0x9900; vm.curOp = 0x17; await vm.dispatch();
  eq('IF skip 2Bh skips 1 byte', vm.pc.toString(16), '9902'); }
// RETURN with an empty gosub stack continues after it (2F00:0A9F)
{ const vm = await run(vmWith([0x13, 0x09, 0, 5, 1, 0, 0x97, 0x00])); eq('RETURN empty stack falls through', vm.m2(0x9700), 5); }
// ON_GOTO selector >= count falls through (2F00:18F8)
{ const vm = await run(vmWith([0x25, 0, 2, 0, 1, 2, 0x00, 0x99, 0x09, 0, 9, 1, 0, 0x97, 0x00])); eq('ON_GOTO out of range falls through', vm.m2(0x9700), 9); }
// RANDOM n: 0..v(1) (n+1 unless 255)
{ const vm = vmWith([0x08, 0, 5, 1, 0, 0x97, 0x00]); let seen = 0; vm.host = new Proxy({}, { get: (t, k) => k === 'random' ? (n) => { seen = n; return n - 1; } : () => 0 });
  await run(vm); eq('RANDOM 5 -> Random(6)', [seen, vm.m2(0x9700)], [6, 5]); }
// MenuHotkeys: digits not after '~' become 'P'..'Y'; hotkeys stay upper case (4300:156D)
{ const vm = vmWith([]); eq('MenuHotkeys', vm.menuHotkeys('~YES ~NO 1'), { s: 'Yes No Q', keys: 'YN' }); }
// Region 1 char overlay: 6C00 reads active as 1 / 80h; 6B00 string = name
{ const vm = vmWith([]); eq('6C00 active', vm.getMem(0x6C00), 1); vm.getMemString(1, 0x6B00); eq('6B00 name', vm.str[1], 'A'); }
// C04D write: facing 5 -> (5-4)*2 = 2 (4300:0D91)
{ const vm = vmWith([]); await vm.setMem(0xC04D, 5); eq('C04D facing wrap', vm.g.party_Dir, 2); }
// Packed text: ECL1/18 at 9A36 (ECL_VM.md §2.2)
{ const rec = loadRecord('ECL1', '.DAX', 18); const vm = vmWith(rec.subarray(2)); vm.pc = 0x9A36 - 1;
  let found = '';
  for (let a = 0x9A30; a < 0x9A40 && !found; a++) { if (vm.codeAt(a) === 0x80) { vm.pc = a - 1; vm.readOperands(1); found = vm.str[1]; } }
  eq('packed text ECL1/18', found.startsWith('THE PLAZA AHEAD IS CROWDED WITH MONSTERS.'), true); }

console.log(bad ? `RESULT: ${bad} failure(s)` : 'RESULT: PASS');
process.exit(bad ? 1 : 0);
