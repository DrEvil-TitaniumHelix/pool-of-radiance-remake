import {archiveRecords} from '../pedia/build.js';
import {unexepack} from '../../engine/state.js';
import {parseGeo} from './geo.js';
import {parseOverland} from './overland.js';
// Read-only map geometry snapshot; hook-driven visited state lives in fog.js.
export async function currentMapContext() {
 const {view}=await import('../../areas/view.js'),g=view.g;
 if(!g || !g.ds || !Number.isInteger(g.ecl_Block))return null;
 const read=address=>view.m0(address);
 return {dataset:g.DataSet,block:g.ecl_Block,travelMode:g.travel_Mode,x:g.travel_Mode>=2?read(0x49C3):g.party_MapX,y:g.travel_Mode>=2?read(0x49C4):g.party_MapY,dir:g.party_Dir,facing:(g.party_Dir&7)>>1,mapId:read(0x49C5),is3D:read(0x49E6)!==0,livePlanes:view.map.slice(),ds:g.ds,mem:read};
}
export async function loadCurrentMap(context,{readFile,profile}={}) {
 if(!context)throw new Error('No current area is available. Load or begin a game first.');
 if(!readFile) {const dax=await import('../../engine/dax.js');if(dax.dataSource!=='byoc')throw new Error('Import your supported game copy first');readFile=dax.fetchFile;}
 if(!profile){const response=await fetch(new URL('../../profiles/por.json',import.meta.url));if(!response.ok)throw new Error('Map profile unavailable');profile=await response.json();}
 if(profile.id!=='por' || profile.version!=='1.3')throw new Error('Map needs the supported Pool of Radiance v1.3 profile');
 const label=profile.areas.find(a=>a.dataSet===context.dataset && a.block===context.block)?.name || `Block ${context.block}`;
 if(context.travelMode>=2 && context.travelMode<=4) {
  let ds=context.ds;if(!ds){const exe=await readFile('START.EXE');if(!exe)throw new Error('Imported START.EXE unavailable');ds=unexepack(exe).subarray(profile.engine.state.dsImageOffset);}
  const map=parseOverland(ds,context.travelMode,{mem:context.mem});
  return {kind:'overland',label,map,tiles:archiveRecords(await readFile('SQRPACI.DAX')),context};
 }
 if(context.travelMode!==1 || !context.is3D)throw new Error('This interior has no 3D GEO map.');
 if(!Number.isInteger(context.dataset) || context.dataset<1 || context.dataset>8 || !Number.isInteger(context.mapId))throw new Error('Current map coordinates are unavailable');
 const name=`GEO${context.dataset}.DAX`,record=archiveRecords(await readFile(name)).get(context.mapId);
 if(!record)throw new Error(`Current map record is missing: ${name}/${context.mapId}`);
 let bytes=record;
 if(context.livePlanes instanceof Uint8Array && context.livePlanes.length===1024){bytes=record.slice();bytes.set(context.livePlanes,2);}
 return {kind:'geo',label,cells:parseGeo(bytes),source:{file:name,record:context.mapId},context};
}
