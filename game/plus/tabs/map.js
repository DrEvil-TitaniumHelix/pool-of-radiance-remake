import {hooks} from '../hooks.js';
import {createMapTracker} from '../map/fog.js';
import {applyMapOverlay} from '../map/overlay.js';
const trackers=new WeakMap(),registrations=new WeakMap();
import {currentMapContext,loadCurrentMap} from '../map/load.js';
import {geoCanvas,DIRECTIONS} from '../map/geo.js';
import {overlandCanvas} from '../map/overland.js';
export function registerMapTab(plus,{context=currentMapContext,load=loadCurrentMap,tracker,profile='por',bus=hooks}={}) {
 if(!tracker){if(!trackers.has(plus))trackers.set(plus,createMapTracker({bus,profile,enabled:()=>bus.enabled!==false&&plus.enabled('automap')}));tracker=trackers.get(plus);}
 registrations.get(plus)?.();
 let zoom=1,unsubscribe;registrations.set(plus,()=>unsubscribe?.());
 plus.registerTab('map',container=>{
  unsubscribe?.();if(plus.enabled('automap'))tracker.sync?.();
  const host=document.createElement('section');container.append(host);
  if(!plus.enabled('automap')){host.textContent=plus.settings.original?'Map is off in original-game mode.':'Map is off. Enable Automap in Helpers to view it.';return;}
  const heading=document.createElement('h2');heading.textContent='Map';host.append(heading);
  const controls=document.createElement('div'),zoomLabel=document.createElement('label'),range=document.createElement('input'),readout=document.createElement('span');
  range.type='range';range.min='.5';range.max='3';range.step='.25';range.value=String(zoom);range.setAttribute('aria-label','Map zoom');zoomLabel.append(document.createTextNode('Zoom '),range,readout);controls.append(zoomLabel);
  const refresh=document.createElement('button');refresh.textContent='Refresh current area';controls.append(refresh);host.append(controls);
  const status=document.createElement('p');status.setAttribute('role','status');host.append(status);
  const viewport=document.createElement('div');viewport.tabIndex=0;viewport.setAttribute('aria-label','Scrollable map');Object.assign(viewport.style,{overflow:'auto',maxHeight:'55vh',maxWidth:'100%',background:'#000'});host.append(viewport);
  const info=document.createElement('p');info.textContent='North is up. Point at a visited cell for details; click to travel from the exploration menu.';host.append(info);
  const legend=document.createElement('p');host.append(legend);let canvas,revision=0;
  function size(){readout.textContent=` ${Math.round(zoom*100)}%`;if(canvas){canvas.style.width=`${canvas.width*zoom}px`;canvas.style.height=`${canvas.height*zoom}px`;canvas.style.imageRendering='pixelated';}}
  range.oninput=()=>{zoom=Number(range.value);size();};size();
  async function update() {
   const request=++revision;status.textContent='Reading current area…';refresh.disabled=true;
   try {
    const snapshot=await context(),model=await load(snapshot);await tracker.flush();
    if(request!==revision || !container.contains(host))return;
    canvas=model.kind==='geo'?geoCanvas(model.cells):overlandCanvas(model.map,model.tiles);
    const discovered=tracker.snapshot(model.context),columns=model.kind==='geo'?16:model.map.width,rows=model.kind==='geo'?16:model.map.height;
    applyMapOverlay(canvas,discovered,columns,rows);
    host.querySelector('[data-map-progress]')?.remove();
    viewport.replaceChildren(canvas);size();status.textContent=model.kind==='geo'?`${model.label} — 16 × 16, north up`:`${model.label} — overland, ${model.map.width} × ${model.map.height}, columns ${model.map.origin}–${model.map.origin+model.map.width-1}`;
    legend.textContent=model.kind==='geo'?'White: wall slot 1 · Cyan: slot 2 · Yellow: slot 3 · Thin line: open passage in a wall · Red: locked door · Magenta: wizard-locked door · Grey: passage state without a wall type. Shading and hex labels show the script-defined cell attribute (blue when bit 7 is set). Each side is drawn separately; neighbouring sides can differ.':'Imported 24 × 24 terrain tiles. The current travel mode selects a 16-column window of the 44 × 36 overland table; landmark tiles follow current game flags.';
    const progress=document.createElement('p');progress.dataset.mapProgress='true';progress.textContent=`${discovered.visited.size} cells visited in save slot ${tracker.slot}. Unvisited cells are hidden. Gold arrow: party and facing.${tracker.sessionOnly?' Changes are kept for this session.':''}`;viewport.after(progress);
    const canTravel=()=>{const p=hooks.state.position();return plus.enabled('automap')&&hooks.enabled&&p?.gameMode===4&&p.dataset===model.context.dataset&&p.map3d===model.context.mapId&&hooks.regions().find(r=>r.id==='hmenu')?.draw?.items?.some(item=>/^Encamp$/i.test(item.label));};
    canvas.onclick=async event=>{
     if(model.kind!=='geo'||!canTravel())return;
     const rect=canvas.getBoundingClientRect(),x=Math.floor((event.clientX-rect.left)/rect.width*canvas.width/24),y=Math.floor((event.clientY-rect.top)/rect.height*canvas.height/24);
     if(x<0||x>=16||y<0||y>=16||!tracker.snapshot(model.context).visited.has(y*16+x))return;
     const {travelTo}=await import('../click/index.js');
     if(!canTravel())return;
     plus.close();
     const result=await travelTo(x,y);
     if(result!=='arrived')globalThis.goldBoxPlusHelpers?.toast('Travel stopped: '+result);
    };
    canvas.onpointermove=event=>{
     const rect=canvas.getBoundingClientRect(),x=Math.floor((event.clientX-rect.left)/rect.width*canvas.width/24),y=Math.floor((event.clientY-rect.top)/rect.height*canvas.height/24);
     canvas.style.cursor=model.kind==='geo'&&canTravel()&&discovered.visited.has(y*columns+x)?'pointer':'default';
     if(!discovered.visited.has(y*columns+x)){info.textContent='Unvisited cell.';return;}
     if(model.kind==='geo') {const cell=model.cells[y*16+x];if(x<0||x>=16||y<0||y>=16||!cell)return;info.textContent=`(${x}, ${y}) · Attribute 0x${cell.attr.toString(16).padStart(2,'0')} · `+DIRECTIONS.map((dir,i)=>`${dir}: wall ${cell.wall[i]}, state ${cell.door[i]}`).join(' · ');}
     else {const cell=model.map.cells[y*model.map.width+x];if(x<0||x>=model.map.width||y<0||y>=model.map.height||!cell)return;info.textContent=`(${x}, ${y}) · World column ${cell.worldX} · Tile ${cell.tile}`;}
    };
   }catch(error){if(request===revision && container.contains(host)){viewport.replaceChildren();status.textContent=`Map unavailable: ${error.message}`;}}
   finally{if(request===revision)refresh.disabled=false;}
  }
  refresh.onclick=()=>{void update();};unsubscribe=tracker.onChange(()=>{if(container.contains(host)&&plus.enabled('automap'))void update();});void update();
 });
 return {tracker,dispose(){unsubscribe?.();tracker.dispose();trackers.delete(plus);}};
}
