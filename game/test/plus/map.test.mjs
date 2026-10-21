import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {parseGeo,geoPlan,rasterGeo} from '../../plus/map/geo.js';
import {parseOverland,overlandImage} from '../../plus/map/overland.js';
import {loadCurrentMap} from '../../plus/map/load.js';
import {archiveRecords} from '../../plus/pedia/build.js';
import {unexepack} from '../../engine/state.js';
const root=new URL('../../../',import.meta.url),folder=process.env.POR_DATA||fileURLToPath(new URL('../re-targets/goldbox/por/POOLRAD/',root));
const profile=JSON.parse(readFileSync(new URL('game/profiles/por.json',root),'utf8'));
const readOriginal=async name=>new Uint8Array(readFileSync(path.join(folder,name)));
test('GEO planes retain all four directed walls, raw passage states and attributes',()=>{
 const b=new Uint8Array(1026);b[2]=0xA3;b[258]=0xF1;b[514]=0xA5;b[770]=0xE4;
 const c=parseGeo(b)[0];assert.deepEqual(c,{x:0,y:0,wall:[10,3,15,1],door:[0,1,2,3],attr:0xA5});
 assert.deepEqual(geoPlan(parseGeo(b))[0].filter(c=>c.op==='line').map(c=>[c.colour,c.width]),[[[85,255,255],2],[[255,255,255],1],[[255,85,85],2],[[255,85,255],2]]);
 assert.throws(()=>parseGeo(new Uint8Array(1024)),/1026/);
});
test('three local GEO records equal Python reference cell by cell, draw command by command and non-text pixel by pixel',{skip:!existsSync(folder)&&'local player copy unavailable'},async()=>{
 const targets=[['GEO3.DAX',0],['GEO4.DAX',21],['GEO8.DAX',29]],records=[];
 for(const [file,id]of targets)records.push(archiveRecords(await readOriginal(file)).get(id));
 const reference=spawnSync('python',['-I','-B',fileURLToPath(new URL('game/test/plus/map-reference.py',root))],{input:JSON.stringify(records.map(b=>Buffer.from(b).toString('base64'))),encoding:'utf8',maxBuffer:8*1024*1024});
 assert.equal(reference.status,0,reference.stderr);const expected=JSON.parse(reference.stdout);
 for(let i=0;i<records.length;i++) {
  const cells=parseGeo(records[i]);assert.deepEqual(cells.map(({x,y,...cell})=>cell),expected[i].cells,targets[i].join('/'));
  const plan=geoPlan(cells);assert.deepEqual(plan.flat(),expected[i].commands,'wall/door colour, thickness, per-side geometry, attribute shading and hex label positions');
  const image=rasterGeo(plan),rgb=Buffer.alloc(image.width*image.height*3);for(let p=0;p<image.width*image.height;p++)for(let c=0;c<3;c++)rgb[p*3+c]=image.data[p*4+c];
  assert.deepEqual(rgb,Buffer.from(expected[i].rgb,'base64'),'all reference raster pixels except font glyphs');
 }
});
test('live current-area planes override source door states without mutating imported records',{skip:!existsSync(folder)&&'local player copy unavailable'},async()=>{
 const archive=await readOriginal('GEO3.DAX'),before=archive.slice(),record=archiveRecords(archive).get(0),live=record.slice(2);live[768]=(live[768]&252)|3;
 const model=await loadCurrentMap({dataset:3,block:0,mapId:0,is3D:true,travelMode:1,livePlanes:live},{profile,readFile:async()=>archive});
 assert.equal(model.cells[0].door[0],3);assert.deepEqual(archive,before);assert.equal(model.kind,'geo');
 await assert.rejects(loadCurrentMap(null,{profile,readFile:readOriginal}),/No current area/);
 await assert.rejects(loadCurrentMap({dataset:3,block:8,mapId:0,is3D:false,travelMode:1},{profile,readFile:readOriginal}),/no 3D GEO/);
});
test('overland windows, landmark flags and imported 24x24 tile rendering',{skip:!existsSync(folder)&&'local player copy unavailable'},async()=>{
 const ds=unexepack(await readOriginal('START.EXE')).subarray(profile.engine.state.dsImageOffset),tiles=archiveRecords(await readOriginal('SQRPACI.DAX'));
 for(const mode of [2,3,4]) {const map=parseOverland(ds,mode);assert.equal(map.width,16);assert.equal(map.height,36);assert.equal(map.origin,ds[0x3C76+mode]);for(const cell of map.cells)assert.equal(cell.value,ds[0x3648+cell.y*44+cell.worldX]);const image=overlandImage(map,tiles);assert.equal(image.width,384);assert.equal(image.height,864);assert.equal(image.data.length,384*864*4);}
 assert.equal(parseOverland(ds,2,{whole:true}).cells.length,44*36);
 const synthetic=new Uint8Array(0x4000);synthetic[0x3C78]=13;synthetic.fill(1,0x3648,0x3648+44*36);const landmark=0x0C30+3*6;synthetic[landmark]=13;synthetic[landmark+4]=9;
 assert.equal(parseOverland(synthetic,2,{mem:()=>255}).cells[0].tile,0);assert.equal(parseOverland(synthetic,2,{mem:()=>0}).cells[0].tile,8);
 assert.throws(()=>parseOverland(ds,1),/mode/);
 const model=await loadCurrentMap({dataset:6,block:25,travelMode:2,ds},{profile,readFile:readOriginal});assert.equal(model.kind,'overland');
});
