import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {PROFILE_URLS, loadProfiles, loadProfile, profileResource} from '../../plus/games.js';
const root = new URL('../../', import.meta.url);
const read = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const profile = await read('profiles/por.json');
const manifest = await read('byoc/manifest-por-1.3.json');
const fetcher = async url => ({ok:true, json:() => readFile(new URL(url),'utf8').then(JSON.parse)});
test('catalog covers exactly every profile JSON and loads the supported game', async () => {
 const files = (await readdir(new URL('profiles/',root))).filter(f => f.endsWith('.json')).sort();
 assert.deepEqual(PROFILE_URLS.map(u => new URL(u).pathname.split('/').pop()).sort(),files);
 const games = await loadProfiles({fetcher}); assert.equal(games.length,1); assert.equal(games[0].id,'por');
 assert.equal(games[0].supported,true); assert.equal(games[0].title,'Pool of Radiance');
 assert.equal(profileResource(games[0], games[0].manifest.url),new URL('byoc/manifest-por-1.3.json',root).href);
});
test('manifest and every DAX group match the authoritative imported-file list', () => {
 assert.equal(profile.schemaVersion,1); assert.equal(profile.manifest.id,manifest.id);
 assert.equal(profile.manifest.requiredCount,Object.values(manifest.files).filter(f => f.required).length);
 assert.deepEqual([...profile.manifest.files].sort(),Object.keys(manifest.files).sort());
 const dax = Object.values(profile.daxGroups).flat();
 assert.equal(new Set(dax).size,dax.length);
 assert.deepEqual(dax.sort(),Object.keys(manifest.files).filter(n => n.endsWith('.DAX')).sort());
});
test('record and save sizes agree with SAVES.md, including headerless sidecars', async () => {
 const doc = await readFile(new URL('../decode/data/SAVES.md',root),'utf8');
 for (const [field,re] of [['TChar',/Character record TChar — (\d+) bytes/],['item',/Item record — (\d+) bytes/],['effect',/Effect record — (\d+) bytes/]]) {
  assert.equal(profile.recordSizes[field],Number(doc.match(re)?.[1]),field);
 }
 assert.equal(profile.saveFormat.gameBytes,Number(doc.match(/SAVGAM<x>\.DAT \(([\d,]+) bytes\)/)?.[1].replaceAll(',','')));
 assert.equal(profile.saveFormat.partyCapacity,8); assert.equal(profile.saveFormat.slots,'ABCDEFGHIJ');
 assert.equal(profile.saveFormat.id,'por-1.3-dos');
});
test('area names and dataset/block pairs match every verified ECL index row', async () => {
 const index = await readFile(new URL('../decode/ecl/scripts/INDEX.md',root),'utf8');
 const rows = [...index.matchAll(/\| \[(ECL(\d)_(\d+))\]\([^)]*\) \| ([^|]+) \|/g)];
 assert.equal(rows.length,29); assert.equal(profile.areas.length,29);
 for (const [,script,ds,block,name] of rows) {
  const a = profile.areas.find(a => a.dataSet === +ds && a.block === +block);
  assert.equal(a?.name,name.trim()); assert.equal(a.hasGeo,![8,11,19].includes(+block));
  assert.ok(profile.daxGroups.ECL.includes(`ECL${ds}.DAX`));
 }
 assert.deepEqual(profile.questTable.entries,[]);
 assert.equal(profile.ecl.codeBufferBytes,7680);
 for (const source of Object.values(profile.pediaSources)) for (const group of source.groups || []) assert.ok(profile.daxGroups[group],group);
 assert.equal(profile.pediaSources.spells.file,'START.EXE');
 assert.equal(profile.pediaSources.spells.names.dsOffset,0x28E9);
});
test('invalid, missing, unsupported and duplicate selections fail explicitly', async () => {
 await assert.rejects(loadProfile('missing',{fetcher}),/Unknown/);
 await assert.rejects(loadProfiles({fetcher:async () => ({ok:false})}),/Cannot load/);
 await assert.rejects(loadProfiles({fetcher:async () => ({ok:true,json:async () => ({id:'bad'})})}),/Invalid/);
 await assert.rejects(loadProfile('por',{fetcher:async () => ({ok:true,json:async () => ({...profile,supported:false})})}),/not supported/);
 await assert.rejects(loadProfiles({urls:[...PROFILE_URLS,...PROFILE_URLS],fetcher}),/Duplicate/);
});
