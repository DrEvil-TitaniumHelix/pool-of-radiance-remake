// Cheats tab (W11, gbp-cheat; developer tools): install a scenario (list or JSON file) as a saved game, edit the live
// party (levels, HP, gold), teleport inside the current map, read/set an ECL flag. Shown only with ?dev=1 (or ?sting=1,
// or the "Developer tools" setting); off in original-game mode.
import * as live from '../cheats/live.js';
import { installScenario, validateScenario, FACING } from '../cheats/scenario.js';

const CLASS_IDS = [0, 1, 2, 3, 4, 5, 6, 7];
export function devToolsEnabled(plus) {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  return q.get('dev') === '1' || q.get('sting') === '1' || plus?.settings?.devTools === true;
}

function el(tag, props = {}, ...kids) { const e = document.createElement(tag); Object.assign(e, props); e.append(...kids); return e; }
function field(label, input) { return el('label', {}, label + ' ', input); }
function num(value, min, max, aria) { return el('input', { type: 'number', value: String(value), min: String(min), max: String(max), ariaLabel: aria }); }

export function registerCheatsTab(plus, { scenarios = () => fetch(new URL('../../scenarios/index.json', import.meta.url)).then((r) => r.json()), install = installScenario } = {}) {
  plus.registerTab('cheats', (container) => {
    container.append(el('h2', { textContent: 'Cheats (developer tools)' }));
    if (plus.settings.original) { container.append(el('p', { textContent: 'Cheats are off in original-game mode.' })); return; }
    if (!devToolsEnabled(plus)) { container.append(el('p', { textContent: 'Developer tools are off. Start with ?dev=1 to use them.' })); return; }
    const status = el('p', { role: 'status' }); status.dataset.cheat = 'status';
    const say = (t) => { status.textContent = t; };
    const run = (fn) => async () => { try { say(await fn() || 'Done.'); } catch (e) { say('Not applied: ' + e.message); } };

    // scenario
    const list = el('select', { ariaLabel: 'Scenario' }), file = el('input', { type: 'file', accept: '.json,application/json', ariaLabel: 'Scenario JSON file' });
    const installBtn = el('button', { textContent: 'Install selected scenario' });
    installBtn.dataset.cheat = 'install';
    scenarios().then((names) => { for (const n of names) list.append(el('option', { value: n, textContent: n })); }).catch(() => say('Scenario list unavailable.'));
    const done = (b) => `Scenario saved as game ${b.slot}: ${b.chars.length} characters. Load it with Load Saved Game, ${b.slot} (party menu).`;
    installBtn.onclick = run(async () => done(await install(list.value)));
    file.onchange = run(async () => { const s = validateScenario(JSON.parse(await file.files[0].text())); return done(await install(s)); });
    container.append(el('h3', { textContent: 'Scenario' }), el('p', {}, list, ' ', installBtn), el('p', {}, field('or a JSON file', file)));

    // live party
    const partyBox = el('div'); partyBox.dataset.cheat = 'party';
    container.append(el('h3', { textContent: 'Party (current game)' }), partyBox);
    live.liveParty().then((party) => {
      for (const m of party) {
        const row = el('fieldset'); row.dataset.member = String(m.index);
        row.append(el('legend', { textContent: m.name }));
        const lv = CLASS_IDS.filter((k) => m.levels[k] > 0).map((k) => [k, num(m.levels[k], 1, 127, `${m.name} level, class ${k}`)]);
        const hp = num(m.hp, 0, 255, `${m.name} HP`), gold = num(m.gold, 0, 65535, `${m.name} gold`), cheat = el('input', { type: 'checkbox', ariaLabel: `${m.name}: allow HP above maximum` });
        lv.forEach(([, i]) => row.append(field('Level', i)));
        row.append(field('HP', hp), ` / ${m.hpMax} `, field('above max', cheat), field('Gold', gold));
        const apply = el('button', { textContent: 'Apply' }); apply.dataset.cheat = 'apply';
        apply.onclick = run(async () => {
          for (const [k, i] of lv) if (Number(i.value) !== m.levels[k]) await live.setLevel(m.index, k, Number(i.value));
          await live.setHp(m.index, Number(hp.value), { cheat: cheat.checked });
          await live.setGold(m.index, Number(gold.value));
          return `${m.name} updated.`;
        });
        row.append(apply); partyBox.append(row);
      }
      if (!party.length) partyBox.textContent = 'No party yet.';
    }).catch((e) => { partyBox.textContent = 'Party unavailable: ' + e.message; });

    // teleport (current map) and flags
    const x = num(0, 0, 15, 'Teleport x'), y = num(0, 0, 15, 'Teleport y'), face = el('select', { ariaLabel: 'Facing' });
    for (const f of Object.keys(FACING)) face.append(el('option', { value: f, textContent: f }));
    const tp = el('button', { textContent: 'Teleport' }); tp.dataset.cheat = 'teleport';
    tp.onclick = run(async () => { await live.teleport(Number(x.value), Number(y.value), FACING[face.value]); return `Party moved to ${x.value},${y.value} ${face.value} (shown after the next step or turn).`; });
    container.append(el('h3', { textContent: 'Teleport in this map' }), el('p', {}, field('x', x), field('y', y), field('facing', face), tp),
      el('p', { textContent: 'Another area: install a scenario for it (other areas need the engine entry, hooks request #14).' }));
    const addr = el('input', { type: 'text', placeholder: '4AA7', size: 6, ariaLabel: 'Flag address (hex)' }), value = el('input', { type: 'text', placeholder: '0xFE', size: 6, ariaLabel: 'Flag value' });
    const read = el('button', { textContent: 'Read' }), set = el('button', { textContent: 'Set flag' }); set.dataset.cheat = 'flag';
    const parseAddr = () => { if (!/^(0x)?[0-9a-f]{1,4}$/i.test(addr.value.trim())) throw new Error('address: hex, e.g. 4AA7'); return parseInt(addr.value.trim().replace(/^0x/i, ''), 16); };
    read.onclick = run(async () => `Flag ${addr.value.toUpperCase()} = ${(await live.getFlag(parseAddr())).toString(16).toUpperCase()}h`);
    set.onclick = run(async () => `Flag ${addr.value.toUpperCase()} := ${(await live.setFlag(parseAddr(), Number(value.value))).toString(16).toUpperCase()}h`);
    container.append(el('h3', { textContent: 'Flag' }), el('p', {}, field('address', addr), field('value', value), read, set),
      el('p', { textContent: 'Quest flags: decode/ecl/QUESTS.md.' }), status);
  });
}
