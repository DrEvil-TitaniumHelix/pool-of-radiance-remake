import {u16,need} from '../pedia/records.js';
import {decodePicture,EGA_RGB} from '../pedia/pictures.js';
const signed=n=>(n<<16)>>16;
export function parseOverland(ds,mode,{mem=()=>0,whole=false}={}) {
 need(ds,0x3C7B,'overland DS image');if(![2,3,4].includes(mode))throw new Error('Overland travel mode must be 2, 3 or 4');
 const origin=whole?0:ds[0x3C76+mode],width=whole?44:16,height=36;
 if(origin+width>44)throw new Error('Invalid overland window offset');
 const cells=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
  const worldX=origin+x,value=ds[0x3648+y*44+worldX];let tile=(value-1)&255;
  for(let k=1;k<=9;k++) {
   const o=0x0C30+6*k;if(worldX!==signed(u16(ds,o)) || y!==signed(u16(ds,o+2)))continue;
   const show=k===3?mem(0x4A8C)!==255:k===4?(mem(0x4AD2)!==0 || (mem(0x4A7C)&8)!==0 || mem(0x4A9F)===0):k===5?(mem(0x4AA0)&2)===0:k===6?true:k===7?(mem(0x4AA0)&1)===0:(k===8||k===9)?mem(0x4AB3)>253:false;
   if(show)tile=(u16(ds,o+4)-1)&255;
  }
  cells.push({x,y,worldX,value,tile});
 }
 return {width,height,origin,cells};
}
export function overlandImage(map,records) {
 const sets=[records.get(1),records.get(2)];if(sets.some(s=>!s))throw new Error('Imported SQRPACI tile sets are missing');
 const tiles=new Map();
 const width=map.width*24,height=map.height*24,data=new Uint8ClampedArray(width*height*4);
 for(const cell of map.cells) {
  if(!tiles.has(cell.tile))tiles.set(cell.tile,decodePicture(sets[cell.tile>>7],{frame:cell.tile&127}));
  const tile=tiles.get(cell.tile);if(tile.width!==24 || tile.height!==24)throw new Error('Overland tile must be 24×24');
  for(let y=0;y<24;y++)for(let x=0;x<24;x++){const o=((cell.y*24+y)*width+cell.x*24+x)*4;data.set(EGA_RGB[tile.pixels[y*24+x]],o);data[o+3]=255;}
 }
 return {width,height,data};
}
export function overlandCanvas(map,records) {
 const image=overlandImage(map,records),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(canvas.width,canvas.height);pixels.data.set(image.data);ctx.putImageData(pixels,0,0);
 canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Overland map, north up, using the imported game terrain tiles.');return canvas;
}
