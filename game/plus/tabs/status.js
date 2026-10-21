import { hooks } from '../hooks.js';

// Read-only snapshot refreshed whenever the panel/tab opens.
export function renderStatus(container, plus) {
 const heading=document.createElement('h2');heading.textContent='Status';container.append(heading);
 const state=hooks.state,position=state.position(),clock=state.clock(),party=state.party();
 const details=document.createElement('dl');
 const row=(label,value)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;details.append(dt,dd);};
 row('Save slot',state.slot||'Session (not saved)');
 row('Place',position?`Data set ${position.dataset}, area ${position.block}, map ${position.map3d ?? '?'}; (${position.x}, ${position.y})`:'No game loaded');
 row('Facing',position?(['North','East','South','West'][position.facing]||'Unknown'):'Unknown');
 row('Game time',clock?`${clock.text}, day ${clock.day}, month ${clock.month}, year ${clock.year}`:'Unavailable');
 const settings=plus?.settings||{};
 row('Active helpers',settings.original?'Original game (all additions off)':Object.entries(settings).filter(([key,value])=>value&&!['original','devTools','sidePanel'].includes(key)).map(([key])=>({automap:'Automap',tooltips:'Tooltips',combatLog:'Combat log',quicksave:'Quick save',autosave:'Autosave',spellPresets:'Spell presets',margins:'Margins',crispFont:'Crisp font'}[key]||key)).join(', ')||'None');
 container.append(details);
 const title=document.createElement('h3');title.textContent='Party';container.append(title);
 if(!party.length){const p=document.createElement('p');p.textContent='No party loaded.';container.append(p);return;}
 const table=document.createElement('table'),head=document.createElement('tr');
 for(const label of ['Character','HP','AC','Levels']){const th=document.createElement('th');th.textContent=label;head.append(th);}table.append(head);
 for(const member of party){const tr=document.createElement('tr');for(const value of [member.name,`${member.hp} / ${member.hpMax}`,member.ac,(member.levels||[]).filter(n=>n>0).join(' / ')]){const td=document.createElement('td');td.textContent=String(value);tr.append(td);}table.append(tr);}container.append(table);
}
