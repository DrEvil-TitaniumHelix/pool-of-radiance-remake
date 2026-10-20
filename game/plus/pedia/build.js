import {readDir,DaxRleDecode} from '../../engine/dax.js';
import {unexepack} from '../../engine/state.js';
import {extractCharacter,extractItem,extractItemType,extractSpells,extractEffects,splitRecords,need} from './records.js';
import {decodePicture} from './pictures.js';

// ADD_NPC constant operands from verified ECL scripts, not names or story text.
// Dynamic training-hall NPC ids cannot be inferred statically and are supplied when met.
export const NPC_REFERENCES = Object.freeze([
 {dataSet:2,block:15,record:25}, {dataSet:3,block:0,record:107},
 {dataSet:4,block:2,record:27}, {dataSet:4,block:10,record:24},
 {dataSet:5,block:7,record:88}, {dataSet:8,block:13,record:104},
]);
export function archiveRecords(bytes) {
 if (!bytes) return new Map();
 need(bytes,2,'DAX');const directory=readDir(bytes);
 if (directory.dataStart>bytes.length || (directory.dataStart-2)%9) throw new Error('Invalid DAX directory');
 const out=new Map();
 for(const e of directory.entries) {
  if (directory.dataStart+e.ofs+e.comp>bytes.length) throw new Error('Truncated DAX record');
  out.set(e.id,DaxRleDecode(bytes.subarray(directory.dataStart+e.ofs,directory.dataStart+e.ofs+e.comp),e.comp,e.raw));
 }
 return out;
}
export async function buildPedia({profile,readFile}={}) {
 if(!profile) { const response=await fetch(new URL('../../profiles/por.json',import.meta.url));if(!response.ok) throw new Error('Game profile unavailable');profile=await response.json(); }
 if(profile.id!=='por' || profile.version!=='1.3') throw new Error('Pedia needs the supported Pool of Radiance v1.3 profile');
 if(!readFile) {
  const dax=await import('../../engine/dax.js');
  if(dax.dataSource!=='byoc') throw new Error('Import your own supported game files before opening the pedia');
  readFile=dax.fetchFile;
 }
 const files=new Map(),archives=new Map();
 const file=async name => { if(!files.has(name)) files.set(name,Promise.resolve(readFile(name)));return files.get(name); };
 const archive=async name => { if(!archives.has(name)) archives.set(name,file(name).then(bytes => {if(!bytes) throw new Error(`Imported file missing: ${name}`);return archiveRecords(bytes);}));return archives.get(name); };
 const exe=await file('START.EXE');if(!exe) throw new Error('Imported START.EXE is unavailable');
 const image=unexepack(exe),state=profile.engine.state;
 need(image,state.dsImageOffset+0x363A,'executable DS');
 const ds=image.subarray(state.dsImageOffset),entries=[];
 const catalogue=await file('ITEMS');need(catalogue,2050,'ITEMS');
 for(let i=0;i<128;i++) entries.push(extractItemType(catalogue.subarray(2+i*16,18+i*16),i,ds));
 entries.push(...extractSpells(ds));
 const monsters=new Map();
 for(let n=1;n<=8;n++) {
  const chars=await archive(`MON${n}CHA.DAX`);
  const items=await archive(`MON${n}ITM.DAX`);
  const effects=profile.daxGroups.MONSPC.includes(`MON${n}SPC.DAX`)?await archive(`MON${n}SPC.DAX`):new Map();
  for(const [record,b] of chars) {
   const c=extractCharacter(b,ds),entry={...c,id:`monster:${n}:${record}`,kind:'monster',dataSet:n,record,whereMet:[],picture:null,
    inventory:splitRecords(items.get(record),63,'monster item').map(b => extractItem(b,ds)),effects:extractEffects(effects.get(record)),
    source:{file:`MON${n}CHA.DAX`,record},note:'Template base values; equipped and in-combat values can differ. Pictures are attached only when an encounter confirms the asset.'};
   entries.push(entry);monsters.set(`${n}:${record}`,entry);
  }
 }
 for(const ref of NPC_REFERENCES) {
  const monster=monsters.get(`${ref.dataSet}:${ref.record}`);if(!monster) throw new Error('NPC source record missing');
  entries.push({...monster,id:`npc:${ref.dataSet}:${ref.record}`,kind:'npc',whereMet:[],scriptRef:{dataSet:ref.dataSet,block:ref.block},note:'Named record referenced by ADD_NPC. Script association is not evidence that the player met this person.'});
 }
 for(const name of [...profile.daxGroups.ITEM,...profile.daxGroups.MONITM]) {
  const dataSet=Number(name.match(/\d/)[0]);
  for(const [record,bytes] of await archive(name)) splitRecords(bytes,63,'item').forEach((b,index) => entries.push({
   ...extractItem(b,ds),id:`item:${name}:${record}:${index}`,kind:'item',dataSet,record,index,whereMet:[],source:{file:name,record,index},picture:null,
  }));
 }
 for(const a of profile.areas) entries.push({id:`place:${a.dataSet}:${a.block}`,kind:'place',name:a.name,dataSet:a.dataSet,block:a.block,whereMet:[],stats:{'Data set':a.dataSet,'Block':a.block,'3D map':a.hasGeo},note:'Area label from the decoded profile; candidate labels retain their uncertainty.'});
 return {
  entries,
  observeItem(bytes){return extractItem(bytes,ds);},
  async picture(reference) {
   if(!reference || !/^(CPIC|PIC|SPRIT|HEAD|BODY)[1-8]\.DAX$/.test(reference.file) || !Number.isInteger(reference.record)) return null;
   const bytes=(await archive(reference.file)).get(reference.record);if(!bytes) return null;
   const animation=/^(PIC|SPRIT)/.test(reference.file);
   return decodePicture(bytes,{animation,xor:reference.file.startsWith('PIC'),frame:reference.frame||0});
  },
 };
}
