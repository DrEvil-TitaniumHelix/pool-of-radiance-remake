import { renderKeys } from './keys.js';
import { renderStatus } from './status.js';
export const tabs = [
 ['status', 'Status'], ['quests', 'Quests'], ['journal', 'Journal'], ['pedia', 'Pedia'],
 ['map', 'Map'], ['helpers', 'Helpers'], ['mods', 'Mods'], ['keys', 'Keys'],
 ['cheats', 'Cheats (dev)'], ['scenario', 'Scenario'], ['games', 'Games'], ['about', 'About/Credits'],
];
export function renderStub(container, id) {
 if (id === 'keys') return renderKeys(container);
 if (id === 'status') return renderStatus(container, globalThis.goldBoxPlus);
 const p = document.createElement('p');
 p.textContent = `${tabs.find(t => t[0] === id)?.[1] || id}: this page is being built.`;
 container.append(p);
}
