import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import * as byoc from '../../engine/byoc.js';
import {makeFakeIDB} from '../byoc/fakeidb.mjs';
import {buildPedia,archiveRecords,NPC_REFERENCES} from '../../plus/pedia/build.js';
import {extractItem,extractSpells,extractEffects,splitRecords} from '../../plus/pedia/records.js';
import {decodePicture} from '../../plus/pedia/pictures.js';
import {searchEntries,discoveredEntry} from '../../plus/pedia/search.js';
const root=new URL('../../../',import.meta.url);
const profile=JSON.parse(readFileSync(new URL('game/profiles/por.json',root),'utf8'));
const manifest=JSON.parse(readFileSync(new URL('game/byoc/manifest-por-1.3.json',root),'utf8'));
const folder=process.env.POR_DATA || fileURLToPath(new URL('../re-targets/goldbox/por/POOLRAD/',root));
function putString(b,o,s) {b[o]=s.length;for(let i=0;i<s.length;i++)b[o+i+1]=s.charCodeAt(i);}

test('hidden item words, bonuses and cached identified names stay hidden',()=>{
 const ds=new Uint8Array(0x4000),item=new Uint8Array(63);
 putString(ds,0x10A7+21,'Visible');putString(ds,0x10A7+42,'Secret');
 item[0x31]=1;item[0x30]=2;item[0x35]=2;item[0x32]=5;
 const visible=extractItem(item,ds);assert.equal(visible.name,'Visible');assert.equal(visible.stats['Magic bonus'],undefined);
 item[0x35]=0;assert.equal(extractItem(item,ds).name,'Visible Secret');assert.equal(extractItem(item,ds).stats['Magic bonus'],5);
 item[0x35]=7;putString(item,0,'Previously identified');assert.equal(extractItem(item,ds).name,'Unidentified item');
});
test('search returns only revealed entries and searches only visible discovery names',()=>{
 const entries=[{id:'a',kind:'monster',name:'Hidden template name'},{id:'b',kind:'spell',name:'Unseen spell'}];
 assert.deepEqual(searchEntries(entries,''),[]);
 const revealed=new Map([['a',{name:'Observed name',whereMet:[{name:'Test place'}]}]]);
 assert.equal(searchEntries(entries,'observed place',{revealed}).length,1);
 assert.equal(searchEntries(entries,'Hidden',{revealed}).length,0);
 assert.equal(searchEntries(entries,'',{revealed,kind:'spell'}).length,0);
 assert.equal(discoveredEntry(entries[0],revealed.get('a')).name,'Observed name');
});
test('spells stop at named id 56; effects ignore stale pointers and reject partial records',()=>{
 const ds=new Uint8Array(0x4000);for(let id=1;id<=56;id++) putString(ds,0x28E9+id*41,`Spell ${id}`);
 const spells=extractSpells(ds);assert.equal(spells.length,56);assert.equal(spells.at(-1).spellId,56);
 const effect=new Uint8Array(9);effect.set([3,30,0,1,2,255,255,255,255]);
 assert.deepEqual(extractEffects(effect),[{type:3,duration:30,parameter3:1,parameter4:2}]);
 assert.throws(()=>splitRecords(new Uint8Array(8),9,'effect'),/length/);
 assert.throws(()=>archiveRecords(new Uint8Array([9,0])),/directory|bounds/);
});
function pictureBytes(pixel) {const b=new Uint8Array(21);b[0]=1;b[2]=1;b[8]=1;b.fill(pixel,17);return b;}
test('picture decoder handles packed nibbles, animation XOR and rejects malformed frames',()=>{
 const p=pictureBytes(0x12),original=p.slice();const image=decodePicture(p);
 assert.equal(image.width,8);assert.equal(image.height,1);assert.deepEqual([...image.pixels],[1,2,1,2,1,2,1,2]);assert.deepEqual(p,original);
 const a=new Uint8Array(51);a[0]=2;a.set(p,5);a.set(pictureBytes(0x33),30);
 assert.deepEqual([...decodePicture(a,{animation:true,xor:true,frame:1}).pixels],[2,1,2,1,2,1,2,1]);
 assert.throws(()=>decodePicture(p.subarray(0,20)),/picture pixels/);
 assert.throws(()=>decodePicture(a,{animation:true,frame:2}),/frame/);
});
test('local copy: read-only devImport pipeline builds all monsters, records, pictures and NPC references',{skip:!existsSync(folder)&&'local player copy unavailable'},async()=>{
 byoc.setManifest(manifest);byoc.setIndexedDB(makeFakeIDB());
 // Emulate only the read-only dev server transport; execute the actual devImport validation/import pipeline.
 const fetchBefore=globalThis.fetch;const files=readdirSync(folder).filter(n => Object.hasOwn(manifest.files,n.toUpperCase()));
 globalThis.fetch=async url=>{
  const u=new URL(String(url),'http://pedia-test.local');
  if(u.pathname==='/devdata/' && u.search==='?list') return {ok:true,json:async()=>files};
  const name=decodeURIComponent(u.pathname.split('/').pop());
  if(!files.includes(name)) return {ok:false,status:404};
  const b=readFileSync(path.join(folder,name));return {ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};
 };
 try {
  const imported=await byoc.devImport('/devdata/');assert.equal(imported.ok,true);assert.equal(imported.okCount,115);
  const catalog=await buildPedia({profile,readFile:byoc.get});
  const monsters=catalog.entries.filter(e=>e.kind==='monster');assert.equal(monsters.length,172);
  assert.equal(catalog.entries.filter(e=>e.kind==='spell').length,56);
  assert.equal(catalog.entries.filter(e=>e.kind==='itemType').length,128);
  assert.equal(catalog.entries.filter(e=>e.kind==='place').length,29);
  assert.equal(catalog.entries.filter(e=>e.kind==='npc').length,NPC_REFERENCES.length);
  assert.equal(searchEntries(catalog.entries,'').length,0);
  let monsterItems=0,monsterEffects=0;
  for(const n of [1,2,3,4,5,6,7,8]) {
   const records=archiveRecords(await byoc.get(`MON${n}CHA.DAX`));
   for(const [id,b] of records) {
    const e=monsters.find(e=>e.dataSet===n && e.record===id);
    assert.equal(e.name,String.fromCharCode(...b.subarray(1,1+b[0])).trim());
    assert.equal(e.stats['Base AC'],60-b[0xA9]);assert.equal(e.whereMet.length,0);
    if(e.inventory.length)monsterItems++;if(e.effects.length)monsterEffects++;
   }
  }
  assert.equal(monsterItems,105);assert.equal(monsterEffects,42);
  let pictures=0;
  for(const file of [...profile.daxGroups.PIC,...profile.daxGroups.CPIC]) for(const [record] of archiveRecords(await byoc.get(file))) {
   const image=await catalog.picture({file,record});assert.ok(image.width>0);assert.equal(image.pixels.length,image.width*image.height);pictures++;
  }
  assert.equal(pictures,310);
  for(const e of catalog.entries.filter(e=>e.kind==='npc')) assert.ok(monsters.some(m=>m.dataSet===e.dataSet && m.record===e.record && m.name===e.name));
 } finally {globalThis.fetch=fetchBefore;}
});
