import test from 'node:test';
import assert from 'node:assert/strict';
import {createPediaTracker} from '../../plus/pedia/reveal.js';
import {extractItem} from '../../plus/pedia/records.js';
function bus(){let position=null,party=[];const listeners=new Set();return {enabled:true,state:{slot:'A',position:()=>position,clock:()=>({text:'10:30'}),party:()=>party,partyCount:()=>party.length},setParty(value){party=value;},on(name,fn){listeners.add(fn);return()=>listeners.delete(fn);},emit(name,p){if(name==='saveLoaded'||name==='gameSaved')this.state.slot=p.slot;if(name==='areaEntered')position={...p};for(const fn of listeners)fn(p,name);}};}
function storage({fail=false}={}){const records=new Map();return {records,factory:({profile,slot})=>({async get(key,fallback){await new Promise(r=>setTimeout(r,1));return structuredClone(records.get(JSON.stringify([profile,slot,key]))??fallback);},async set(key,value){if(fail)return false;records.set(JSON.stringify([profile,slot,key]),structuredClone(value));return true;}})};}
const place={dataset:3,block:0,x:1,y:2,is3D:true,travelMode:1,map3d:0,dir:0};
function catalog(){return {entries:[{id:'place:3:0',kind:'place',name:'Test square'},{id:'monster:3:1',kind:'monster',name:'First beast',dataSet:3,stats:{'Base AC':4}},{id:'monster:3:2',kind:'monster',name:'Second beast',dataSet:3},{id:'monster:3:3',kind:'monster',name:'Unseen beast',dataSet:3},{id:'monster:3:4',kind:'monster',name:'Ambiguous',dataSet:3},{id:'monster:3:5',kind:'monster',name:'Ambiguous',dataSet:3},{id:'npc:3:107',kind:'npc',name:'Test guide'},...[1,2,3].map(i=>({id:`spell:${i}`,kind:'spell',name:`Test spell ${i}`})),{id:'item:secret',kind:'item',name:'Secret potion power',stats:{'Magic bonus':9}}]};}
test('area/monster/combat/treasure/spell/named NPC hooks unlock only proven entries and confirmed pictures',async()=>{
 const events=bus(),tracker=createPediaTracker({bus:events,load:async()=>catalog(),storeFactory:storage().factory});
 events.emit('areaEntered',place);events.emit('monsterShown',{id:1,dataset:3,name:'First beast',pic:12});events.emit('combatStart',{monsters:[{monsterId:2,dataset:3,name:'Second beast',hp:7,ac:5}]});events.emit('treasure',{items:[{name:'Unidentified potion',type:70}]});events.emit('npcTalk',{kind:'parlay',text:'The Test guide speaks.'});events.emit('spellCast',{spellId:2});events.emit('spellMemorised',{spellId:1});events.emit('spellCast',{spellId:57});await tracker.flush();
 assert.equal(tracker.revealed.has('npc:3:107'),false);assert.equal(tracker.revealed.has('monster:3:3'),false);assert.equal(tracker.revealed.has('spell:3'),false);assert.equal(tracker.revealed.has('item:secret'),false);
 events.emit('npcTalk',{npc:{name:'Test guide',dataset:3,monsterId:107}});await tracker.flush();assert.equal(tracker.revealed.size,7);
 assert.deepEqual(tracker.revealed.get('monster:3:1').picture,{file:'CPIC3.DAX',record:12});assert.equal(tracker.revealed.get('monster:3:2').stats['HP observed'],7);
 assert.equal(tracker.revealed.get('monster:3:1').whereMet[0].name,'Test square');const item=tracker.entries.find(e=>e.kind==='item');assert.equal(item.name,'Unidentified potion');assert.deepEqual(item.stats,{});tracker.dispose();
});
test('catalogue loads in background; rapid slot changes never leak queued discoveries and save-as inherits knowledge',async()=>{
 const events=bus(),store=storage();let release;const waiting=new Promise(resolve=>{release=resolve;});const tracker=createPediaTracker({bus:events,storeFactory:store.factory,load:async()=>{await waiting;return catalog();}});
 assert.doesNotThrow(()=>events.emit('monsterShown',{dataset:3,id:1,name:'First beast'}));events.emit('saveLoaded',{slot:'B'});events.emit('monsterShown',{dataset:3,id:2,name:'Second beast'});release();await tracker.flush();
 assert.equal(tracker.slot,'B');assert.equal(tracker.revealed.has('monster:3:1'),false);assert.equal(tracker.revealed.has('monster:3:2'),true);
 events.emit('gameSaved',{slot:'C'});await tracker.flush();assert.equal(tracker.revealed.has('monster:3:2'),true);events.emit('saveLoaded',{slot:'A'});await tracker.flush();assert.equal(tracker.revealed.has('monster:3:1'),true);assert.equal(tracker.revealed.has('monster:3:2'),false);tracker.dispose();
 const restored=createPediaTracker({bus:events,storeFactory:store.factory,load:async()=>catalog()});await restored.flush();assert.equal(restored.revealed.has('monster:3:1'),true);restored.dispose();
 const isolated=createPediaTracker({bus:bus(),profile:'other',storeFactory:store.factory,load:async()=>catalog()});await isolated.flush();assert.equal(isolated.revealed.size,0);isolated.dispose();
});
test('party snapshots reveal ready memorised spells, not pending/book spells; disabled events and disposed listeners do nothing',async()=>{
 const events=bus(),record=new Uint8Array(285);record[0x17]=1;record[0x18]=0x82;record[0x35]=1;events.setParty([{name:'Test caster',record}]);let enabled=false;
 const tracker=createPediaTracker({bus:events,load:async()=>catalog(),storeFactory:storage({fail:true}).factory,enabled:()=>enabled});events.emit('spellCast',{id:2});events.emit('areaEntered',place);await tracker.flush();assert.equal(tracker.revealed.size,0);
 enabled=true;events.emit('partyDrawn',{});await tracker.flush();assert.equal(tracker.revealed.has('spell:1'),true);assert.equal(tracker.revealed.has('spell:2'),false);assert.equal(tracker.revealed.has('spell:3'),false);assert.equal(tracker.sessionOnly,true);tracker.dispose();events.emit('spellCast',{id:2});await tracker.flush();assert.equal(tracker.revealed.has('spell:2'),false);
});
test('unidentified observed records suppress hidden words/bonus and ambiguous combat names do not unlock templates',async()=>{
 const ds=new Uint8Array(0x4000);const put=(o,s)=>{ds[o]=s.length;for(let i=0;i<s.length;i++)ds[o+i+1]=s.charCodeAt(i);};put(0x10A7+21,'Visible');put(0x10A7+42,'Secret');
 const record=new Uint8Array(63);record[0x31]=1;record[0x30]=2;record[0x35]=2;record[0x32]=9;record[0x2E]=20;
 const c=catalog();c.observeItem=bytes=>extractItem(bytes,ds);const events=bus(),tracker=createPediaTracker({bus:events,load:async()=>c,storeFactory:storage().factory});
 events.emit('itemsSeen',{items:[{record}]});events.emit('combatStart',{monsters:[{name:'Ambiguous',dataset:3,hp:2}]});await tracker.flush();
 const item=tracker.entries.find(e=>e.kind==='item');assert.equal(item.name,'Visible');assert.equal(item.stats['Magic bonus'],undefined);assert.equal(tracker.revealed.has('monster:3:4'),false);assert.equal(tracker.revealed.has('monster:3:5'),false);assert.equal(tracker.entries.filter(e=>e.kind==='monster').length,1);tracker.dispose();
});
test('early authoritative slot metadata is reconciled before discoveries from a new load',async()=>{
 const events=bus(),tracker=createPediaTracker({bus:events,load:async()=>catalog(),storeFactory:storage().factory});events.emit('monsterShown',{dataset:3,id:1});await tracker.flush();events.state.slot='B';events.emit('monsterShown',{dataset:3,id:2});await tracker.flush();assert.equal(tracker.slot,'B');assert.equal(tracker.revealed.has('monster:3:1'),false);assert.equal(tracker.revealed.has('monster:3:2'),true);tracker.dispose();
});
