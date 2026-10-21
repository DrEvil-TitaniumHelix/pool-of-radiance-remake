// Static-host catalog. The profile tests require one URL for every profiles/*.json.
export const PROFILE_URLS = Object.freeze([new URL('../profiles/por.json', import.meta.url).href]);
export async function loadProfiles({ urls = PROFILE_URLS, fetcher = globalThis.fetch } = {}) {
 const profiles = await Promise.all(urls.map(async url => {
  const response = await fetcher(url);
  if (!response.ok) throw new Error(`Cannot load game profile: ${url}`);
  const profile = await response.json();
  if (profile.schemaVersion !== 1 || !/^[a-z0-9-]+$/.test(profile.id) || !profile.title || !profile.manifest?.url) throw new Error(`Invalid game profile: ${url}`);
  return { ...profile, url };
 }));
 if (new Set(profiles.map(p => p.id)).size !== profiles.length) throw new Error('Duplicate game profile id');
 return profiles;
}
export async function loadProfile(id, options) {
 const profile = (await loadProfiles(options)).find(p => p.id === id);
 if (!profile) throw new Error(`Unknown game profile: ${id}`);
 if (!profile.supported) throw new Error(`Game is not supported yet: ${profile.title}`);
 return profile;
}
// Resolve configuration references against the profile URL, never against the current page.
export function profileResource(profile, relative) { return new URL(relative, profile.url).href; }

export async function renderGames(container, { profiles, onStart, ...options } = {}) {
 container.replaceChildren();
 const heading = document.createElement('h2'); heading.textContent = 'Games'; container.append(heading);
 const status = document.createElement('p'); status.setAttribute('role', 'status'); container.append(status);
 try {
  const catalog = profiles || await loadProfiles(options);
  if (!catalog.length) status.textContent = 'No game profiles are installed.';
  else status.textContent = 'Choose a game. Each game requires your own supported copy.';
  for (const profile of catalog) {
   const row = document.createElement('div'), title = document.createElement('span'), start = document.createElement('button');
   title.textContent = `${profile.title} (${profile.version}) `;
   start.textContent = 'Start'; start.disabled = !profile.supported; start.setAttribute('aria-label', `Start ${profile.title}`);
   start.onclick = async () => {
    start.disabled = true;
    try {
     if (onStart) await onStart(profile);
     else { const url = new URL(location.href); url.searchParams.set('profile', profile.id); location.assign(url.href); }
    } catch (error) { status.textContent = `Could not start ${profile.title}: ${error.message}`; }
    finally { start.disabled = !profile.supported; }
   };
   row.append(title, start); container.append(row);
  }
 } catch (error) { status.textContent = `Games could not be loaded: ${error.message}`; }
}

// Engine boot calls this BEFORE starting MainProgram. A missing selection waits for Start.
// Explicit ?profile=por keeps legacy/test launchers able to boot without a selector.
export async function chooseProfile({ id = new URLSearchParams(location.search).get('profile'), container, ...options } = {}) {
 if (id) return loadProfile(id, options);
 const profiles = await loadProfiles(options);
 const root = container || document.createElement('section');
 let owned = !container;
 if (owned) {
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Choose a game');
  Object.assign(root.style, { position:'fixed', inset:'5vh 5vw', zIndex:'1001', overflow:'auto', background:'#16202e', color:'#f1f4f8', padding:'24px', font:'16px system-ui' });
  document.body.append(root);
 }
 return new Promise(resolve => {
  renderGames(root, { profiles, onStart(profile) { if (owned) root.remove(); else root.replaceChildren(); resolve(profile); } });
 });
}
// Optional wiring by the shell owner, with no engine import or boot side effects.
export function registerGamesTab(plus, options) {
 plus.registerTab('games', container => { void renderGames(container, options); });
}
