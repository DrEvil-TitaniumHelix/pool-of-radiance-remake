import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
const root=new URL('../../../',import.meta.url),read=p=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
test('all pre-GBP PASS rows have a replay; original gate routes explicitly select original mode',()=>{
 const text=readFileSync(new URL('ACCEPTANCE.md',root),'utf8').split('\n## GBP\n')[0],ids=[];
 for(const line of text.split('\n')){const c=line.split('|').slice(1,-1).map(s=>s.trim());if(c.length>=6&&c[5]==='PASS'&&(/^[A-Z]{2}-/.test(c[0])||c[0]==='—'))ids.push(c[0]==='—'?'extra-inn':c[0]);}
 const coverage=read('acceptance/plus/original/coverage.json');assert.equal(ids.length,70);assert.deepEqual(new Set(Object.keys(coverage.rows)),new Set(ids));
 for(const source of new Set(Object.values(coverage.rows))){const r=read('acceptance/plus/original/'+source+'.json'),q=new URLSearchParams(r.query);assert.equal(q.get('plus'),'0');assert.equal(q.get('profile'),'por');assert.ok(r.steps.length);}
});
test('every regression row resolves to concrete references in its replay',()=>{
 const c=read('acceptance/plus/original/coverage.json');
 for(const [row,source] of Object.entries(c.rows)){const route=read('acceptance/plus/original/'+source+'.json'),refs=route.steps.map(s=>s.ref).filter(Boolean),required=c.references[row]||refs.filter(r=>r===row||r.startsWith(row+'-'));assert.ok(required.length,row);for(const ref of required)assert.ok(refs.includes(ref),row+' -> '+ref);}
});
test('functional routes use the mounted product and real hook events',()=>{
 for(const file of ['features','quests','combat','mods','zip-pad','helpers','helpers-runtime','helpers-saves','tabs','click-menus','click-travel','click-combat','click-input','click-automap']){
  const route=read('acceptance/plus/'+file+'.json');for(const step of route.steps){const p=step.probe||'';assert.doesNotMatch(p,/register[A-Z]\w*Tab\s*\(/,file);assert.doesNotMatch(p,/hooks\.emit\s*\(/,file);}
 }
});
