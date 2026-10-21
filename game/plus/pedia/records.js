// Decoded layouts only. All names and record values come from the player's copy.
export function need(bytes, size, label = 'record') {
 if (!(bytes instanceof Uint8Array) || bytes.length < size) throw new Error(`Invalid ${label}: needs ${size} bytes`);
 return bytes;
}
export function pstr(bytes, offset, max) {
 need(bytes, offset + 1, 'string');
 const n = bytes[offset]; if (n > max || offset + 1 + n > bytes.length) throw new Error('Invalid Pascal string');
 return String.fromCharCode(...bytes.subarray(offset + 1, offset + 1 + n)).trim();
}
export const u16 = (b,o) => b[o] | b[o+1] << 8;
const signed = n => (n << 24) >> 24;
export function extractCharacter(b, ds) {
 need(b,285,'TChar');
 return { name:pstr(b,0,15), stats: {
  'Strength':b[0x10], 'Intelligence':b[0x11], 'Wisdom':b[0x12], 'Dexterity':b[0x13], 'Constitution':b[0x14], 'Charisma':b[0x15],
  'Race':pstr(ds,0xF03 + b[0x2E]*10,9), 'Class':pstr(ds,0xD38 + b[0x2F]*27,26),
  'Maximum HP (record)':b[0x32], 'Base AC':60-b[0xA9], 'Base movement':b[0x72],
  'Class levels':[...b.subarray(0x96,0x9E)].map(signed).join('/'),
  'Attacks per round':b[0xA1]/2,
  'Base damage':[0,1].map(i => `${b[0xA3+i]}d${b[0xA5+i]}${signed(b[0xA7+i]) >= 0 ? '+' : ''}${signed(b[0xA7+i])}`).join(' / '),
 }, portrait:{head:b[0xBB],body:b[0xBC]} };
}
export function extractItemType(b,id,ds) {
 need(b,16,'ITEMS row');
 const wordName = id > 0 ? pstr(ds,0x10A7+id*21,20) : '';
 return { id:`itemType:${id}`, kind:'itemType', name:wordName || `Item type ${id}`, type:id, whereMet:[], stats:{
  'Equipment slot code':b[0], 'Hands':b[1], 'Damage vs large':`${b[2]}d${b[3]}${signed(b[4]) >= 0 ? '+' : ''}${signed(b[4])}`,
  'Damage vs small/medium':`${b[9]}d${b[10]}${signed(b[11]) >= 0 ? '+' : ''}${signed(b[11])}`, 'Missile range':b[12], 'Class mask':b[13],
 } };
}
export function extractItem(b,ds) {
 need(b,63,'item');
 let name='';
 for (let k=3;k>=1;k--) if (b[0x2E+k] && !(b[0x35] & (1 << (3-k)))) name += (name ? ' ' : '') + pstr(ds,0x10A7+b[0x2E+k]*21,20);
 // The game suppresses hidden name words. Never construct an identified name for the UI.
 if (!name) name=b[0x35] ? 'Unidentified item' : (pstr(b,0,40) || 'Unidentified item');
 const stats={'Weight':u16(b,0x37),'Count':b[0x39] || 1,'Readied':!!b[0x34]};
 if (!b[0x35]) { stats['Magic bonus']=signed(b[0x32]); stats['Value (gp)']=u16(b,0x3A); }
 return {name,type:b[0x2E],identified:b[0x35] === 0,stats};
}
export function splitRecords(bytes,size,label) {
 if (!bytes) return [];
 if (bytes.length % size) throw new Error(`Invalid ${label} record length`);
 return Array.from({length:bytes.length/size},(_,i) => bytes.subarray(i*size,(i+1)*size));
}
export function extractEffects(bytes) {
 return splitRecords(bytes,9,'effect').map(b => ({type:b[0],duration:u16(b,1),parameter3:b[3],parameter4:b[4]}));
}
export function extractSpells(ds) {
 need(ds,0x31FA+68*16,'spell table');
 // SpellNames has only ids 1..56. Powers 57..67 have no name and must not read beyond it.
 return Array.from({length:56},(_,i) => {
  const id=i+1,b=ds.subarray(0x31FA+id*16,0x31FA+(id+1)*16);
  return {id:`spell:${id}`,kind:'spell',spellId:id,name:pstr(ds,0x28E9+id*41,40),whereMet:[],stats:{
   'Class':b[0]===0?'Cleric':b[0]===1?'Magic-user':'Item/monster power','Level':b[1],
   'Range base':b[2],'Range per caster level':b[3], 'Duration base':b[4],'Duration per caster level':b[5],
   'Target mode code':b[7],'Save effect code':b[8],'Saving throw type':b[9],'Effect type':b[10],
  }};
 });
}
