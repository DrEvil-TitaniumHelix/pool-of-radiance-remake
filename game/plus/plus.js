import { createStore } from './store.js';
import { tabs, renderStub } from './tabs/stubs.js';

export const defaults = Object.freeze({ original: false, devTools: false, sidePanel: false, tooltips: true, automap: true, combatLog: true, quicksave: true, autosave: true, spellPresets: false, margins: false, crispFont: false });
const labels = { tooltips: 'Tooltips', automap: 'Automap', combatLog: 'Combat log', quicksave: 'Quick save', autosave: 'Autosave on area entry', spellPresets: 'Spell presets', margins: 'Margins', crispFont: 'Crisp alternative font' };
let instance;
export function mountPlus({ canvas = document.getElementById('screen'), input = null, profile = 'por', slot = 'default', dev = new URLSearchParams(location.search).has('sting') || new URLSearchParams(location.search).get('dev') === '1' } = {}) {
 if (instance) { if (input) instance.setInput(input); return instance; }
 let storage = createStore({ profile, slot });
 let settings = { ...defaults }, open = false, tab = 'status', previousFocus, previousSuspended, gate = input;
 const renderers = new Map();
 const link = document.createElement('link'); link.rel = 'stylesheet'; link.href = new URL('./plus.css', import.meta.url); document.head.append(link);
 const gear = document.createElement('button'); gear.id = 'por-plus-menu'; gear.textContent = '⚙ Menu'; gear.title = 'Gold Box Plus (F12)';
 const root = document.createElement('section'); root.id = 'por-plus'; root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Gold Box Plus');
 const header = document.createElement('header'); const title = document.createElement('strong'); title.textContent = 'Gold Box Plus';
 const close = document.createElement('button'); close.textContent = 'Close (Esc)'; close.onclick = () => api.close(); header.append(title, close);
 const nav = document.createElement('nav'); nav.setAttribute('role', 'tablist'); nav.setAttribute('aria-label', 'Plus pages');
 const body = document.createElement('div'); body.id = 'por-plus-content'; body.setAttribute('role', 'tabpanel'); body.tabIndex = 0;
 root.append(header, nav, body); document.body.append(gear, root);
 function checkbox(name, text, disabled = false) {
  const label = document.createElement('label'), c = document.createElement('input'); c.dataset.setting = name; c.type = 'checkbox'; c.checked = !!settings[name]; c.disabled = disabled;
  c.onchange = () => api.setSetting(name, c.checked); label.append(c, document.createTextNode(text)); body.append(label);
 }
 function render() {
  root.classList.toggle('side-panel', settings.sidePanel && !settings.original);
  gear.hidden = settings.original;
  const cheats = nav.querySelector('[data-tab=cheats]');
  if (cheats) cheats.hidden = settings.original || !(dev || settings.devTools);
  if (tab === 'cheats' && cheats?.hidden) tab = 'helpers';
  for (const b of nav.children) { const selected = b.dataset.tab === tab; b.setAttribute('aria-selected', String(selected)); b.tabIndex = selected ? 0 : -1; }
  body.replaceChildren(); body.setAttribute('aria-labelledby', `por-plus-tab-${tab}`);
  if (renderers.has(tab)) { renderers.get(tab)(body, api); return; }
  if (tab === 'helpers') {
   checkbox('original', 'Play the original game');
   const p = document.createElement('p'); p.textContent = 'Original mode turns every addition off. Your helper choices are kept. F12 returns here.'; body.append(p);
   checkbox('devTools', 'Developer tools', settings.original);
   checkbox('sidePanel', 'Show Plus as a side panel', settings.original);
   for (const [name, label] of Object.entries(labels)) checkbox(name, label, settings.original);
   if (!settings.original) window.goldBoxPlusHelpers?.renderExtras(body);   // W8 helper actions (presets, quick save/load)
  } else if (tab === 'about') {
   const p = document.createElement('p'); p.textContent = 'Gold Box Plus — optional helpers for the Gold Box engine. Darklands+ (MIT) inspired the F12 window and original-game switch. Gold Box Companion: feature inspiration. Dungeon Craft / uaf and FRUA: editor design references only; no code copied. Original assets and journal text are supplied by the player.'; body.append(p);
   const a = document.createElement('a'); a.href = new URL('./CREDITS.md', import.meta.url); a.textContent = 'Full credits'; a.target = '_blank'; a.rel = 'noopener'; body.append(a);
  } else renderStub(body, tab);
 }
 for (const [id, label] of tabs) {

  const b = document.createElement('button'); b.id = `por-plus-tab-${id}`; b.dataset.tab = id; b.textContent = label; b.setAttribute('role', 'tab'); b.setAttribute('aria-controls', body.id); b.onclick = () => api.selectTab(id); nav.append(b);
 }
 function focusables() { return [...root.querySelectorAll('button, input:not(:disabled), a, [tabindex="0"]')].filter(e => !e.hidden); }
 function move(delta) { const a = focusables(); a[(a.indexOf(document.activeElement) + delta + a.length) % a.length]?.focus(); }
 const api = {
  get isOpen() { return open; }, get settings() { return { ...settings }; },
  enabled(name) { return !settings.original && settings[name] === true; },
  setInput(value) { gate = value; if (open && gate) { previousSuspended = gate.suspended; gate.suspended = true; } },
  async setSetting(name, value) { if (!(name in defaults)) return; settings[name] = !!value; const focused = document.activeElement?.dataset.setting; render(); if (focused) body.querySelector(`[data-setting="${focused}"]`)?.focus(); window.dispatchEvent(new CustomEvent('por-plus-settings', { detail: { settings: api.settings, enabled: api.enabled } })); return storage.set('settings', settings); },
  async setContext({ profile = 'por', slot = 'default' } = {}) { storage = createStore({ profile, slot }); const saved = await storage.get('settings', defaults); settings = { ...defaults }; for (const k of Object.keys(defaults)) if (typeof saved?.[k] === 'boolean') settings[k] = saved[k]; render(); window.dispatchEvent(new CustomEvent('por-plus-settings', { detail: { settings: api.settings, enabled: api.enabled } })); },
  selectTab(id) { if (![...nav.children].some(b => b.dataset.tab === id && !b.hidden)) return; tab = id; render(); },
  registerTab(id, renderer) { renderers.set(id, renderer); if (tab === id) render(); },
  open() { if (open) return; previousFocus = document.activeElement; open = true; if (gate) { previousSuspended = gate.suspended; gate.suspended = true; } root.hidden = false; render(); nav.querySelector('[aria-selected="true"]')?.focus(); window.dispatchEvent(new CustomEvent('por-plus-open')); },
  close() { if (!open) return; open = false; root.hidden = true; if (gate) gate.suspended = previousSuspended; previousFocus?.focus(); window.dispatchEvent(new CustomEvent('por-plus-close')); },
  toggle() { open ? api.close() : api.open(); },
  ready: null,
 };
 gear.onclick = () => api.toggle();
 window.addEventListener('keydown', e => {
  if (e.key === 'F12') { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) api.toggle(); return; }
  if (!open) return;
  e.stopImmediatePropagation();
  if (e.key === 'Escape') { e.preventDefault(); api.close(); }
  else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
  else if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) && document.activeElement?.getAttribute('role') === 'tab') {
   e.preventDefault(); const a = [...nav.children].filter(b => !b.hidden); const n = e.key === 'Home' ? 0 : e.key === 'End' ? a.length - 1 : (a.findIndex(b => b.dataset.tab === tab) + (e.key === 'ArrowRight' ? 1 : a.length - 1)) % a.length; api.selectTab(a[n].dataset.tab); a[n].focus();
  }
 }, true);
 for (const type of ['keyup', 'keypress', 'mousedown', 'mouseup', 'pointerdown', 'pointerup', 'click', 'contextmenu', 'wheel']) window.addEventListener(type, e => {
  if (open && !root.contains(e.target) && e.target !== gear) { e.preventDefault(); e.stopImmediatePropagation(); }
 }, { capture: true, passive: false });
 const previous = new Map();
 function poll() {
  for (const pad of navigator.getGamepads?.() || []) {
   if (!pad) continue;
   const values = { menu: pad.buttons[9]?.pressed, back: pad.buttons[1]?.pressed, choose: pad.buttons[0]?.pressed, next: pad.buttons[13]?.pressed || pad.axes[1] > .6, prev: pad.buttons[12]?.pressed || pad.axes[1] < -.6, left: pad.buttons[14]?.pressed || pad.buttons[4]?.pressed, right: pad.buttons[15]?.pressed || pad.buttons[5]?.pressed };
   for (const [key, down] of Object.entries(values)) {
    const id = `${pad.index}:${key}`;
    if (down && !previous.get(id)) {
     if (key === 'menu') api.toggle();
     else if (open) {
      if (key === 'back') api.close(); else if (key === 'choose') document.activeElement?.click();
      else if (key === 'next' || key === 'prev') move(key === 'next' ? 1 : -1);
      else { const a = [...nav.children].filter(b => !b.hidden); const n = (a.findIndex(b => b.dataset.tab === tab) + (key === 'right' ? 1 : a.length - 1)) % a.length; api.selectTab(a[n].dataset.tab); a[n].focus(); }
     }
    }
    previous.set(id, down);
   }
  }
  requestAnimationFrame(poll);
 }
 requestAnimationFrame(poll);
 api.ready = storage.get('settings', defaults).then(saved => { settings = { ...defaults }; for (const k of Object.keys(defaults)) if (typeof saved?.[k] === 'boolean') settings[k] = saved[k]; render(); });
 instance = api; window.goldBoxPlus = api;
 if (!gate) import('../engine/input.js').then(m => api.setInput(m.gamepad)).catch(() => {});
 render(); return api;
}
if (typeof document !== 'undefined') mountPlus();
