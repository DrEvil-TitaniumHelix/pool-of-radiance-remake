// game/plus/click/index.js — Gold Box Plus W3 entry: mount the click layer and its screen providers (gbp-click).
// Boot (gbp-integrate): `(await import('./plus/click/index.js')).mountClickLayer({ canvas })` after the game canvas exists.
import { mountClick } from './click.js';
import { mountTravel } from './travel.js';
import { mountCombat } from './combat.js';
import { mountInput } from './input.js';
import { mountTitle } from './title.js';

let mounted = false;
export function mountClickLayer({ canvas = document.getElementById('screen') } = {}) {
  const c = mountClick({ canvas });
  if (!mounted) { mounted = true; mountTravel(); mountCombat(); mountInput(); mountTitle(); }
  return c;
}
export { travelTo, path, overlandTravelTo, overlandPath } from './travel.js';
