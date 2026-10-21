# Gold Box Plus mods

Open F12 → Mods to import a folder or ZIP containing one mod.json and its PNG files. Imports start disabled. Enable a mod, move it up or down, or remove it. The last enabled matching override wins. Stack order and assets live in IndexedDB `por-mods`, keyed by game profile, beside the imported game database; game files and saves are never overwritten. If storage fails, changes last for this browser session and the panel says so.

“Play the original game” bypasses the entire stack without forgetting your enabled choices. A picture already loaded by the engine must be reloaded when the stack changes. The manager emits `por-mods-changed` for the engine owner to invalidate retained image caches and redraw. Until that engine integration lands, changes apply only at the resolver boundary, and already-loaded scenes can retain their old pixels.

A minimal mod folder:

```text
My skin/
  mod.json
  pictures/
    encounter.png
```

```json
{
  "schemaVersion": 1,
  "id": "my-skin",
  "name": "My skin",
  "version": "1.0.0",
  "author": "Your name",
  "profile": "por",
  "overrides": [
    {"dax": "PIC", "dataSet": 3, "record": 29, "png": "pictures/encounter.png"}
  ]
}
```

`record` is a DAX record id (0–255). `dataSet` selects archive suffix 1–8; omit it to match that group in every dataset. `dax: "PIC3"` is also accepted, with the same meaning as PIC plus dataSet 3. Archive paths and `.dax` suffixes are normalized by the resolver. Currently supported targets are PIC, CPIC, SPRIT, HEAD, BODY, TITLE, ICON, COMSPR, BACPAC, SQRPACI, DUNGCOM, WILDCOM, RANDCOM, CHEAD and CBODY. Font, text, geometry, script and rules overrides are deferred. Imported JavaScript is never loaded or executed.

PNG dimensions must match the original record. For a record with several frames or tiles, place every decoded frame side by side in original order, aligned at the top. Width is the sum of frame widths; height is the largest frame height. Keep original frame count, geometry and timing. PIC animations use XOR deltas internally; the compiler reconstructs those deltas from your full frames. SPRIT distance frames can have different sizes. Extra space below a shorter frame is ignored.

RGB colours are mapped to the nearest of the engine's 16 EGA colours. Use the exact EGA palette for predictable results. Fully transparent PNG pixels retain the corresponding original pixel; partial alpha is rejected. Dimensions, paths, archive sizes and checksums are validated. Limits: 128 overrides, 512 import files, 8 MiB per file, 64 MiB total, and four million PNG pixels. ZIP supports stored and deflated entries, including a single enclosing folder. The PNG decoder or frame compiler can reject additional malformed input. On override failure the resolver returns null and the original record is used; the Mods tab reports the most recent issue.

The sample recolour is available through “Add built-in recolour sample”. Its committed folder `game/mods/sample-recolour/` contains only metadata and our generator. Enabling it generates PNG strips for PIC3 records 1, 29 and 41 from your imported copy, cycling the hues within each intensity bank. All animation frames are recoloured; no geometry, timing, text or game rules change. Generated PNGs stay in local browser storage. No original-derived PNG is shipped. The generator is a trusted built-in tool, not a mod-provided script.

Integration API for gbp-hooks:

```js
import { plusMods } from '../plus/mods/manager.js';
// In LoadDaxRecord, after decompressing the ORIGINAL bytes:
const raw = DaxRleDecode(src, e.comp, e.raw);
return (await plusMods.resolve(name, id, raw)) ?? raw;
```

`resolve(daxName, recordId, originalBytes)` is asynchronous and returns a fresh Uint8Array containing the replacement decoded record, or null. It preserves headers, placement, frame count and delays; existing picture/animation loaders continue to decode the returned record. Always pass original bytes, never a prior modded result. Resolver caches are invalidated on enable, disable, reorder, removal and master-switch changes. It rechecks the generation after asynchronous PNG decoding, preventing stale work from leaking across a toggle. The engine must invalidate its own retained picture/animation caches on `por-mods-changed`; this is hooks request #6 in STATUS.md. No engine file is owned by this lane.

`registerModsTab(plus)` installs the UI. `plusMods.ready` waits for stored settings; `list` returns metadata, `install` adds an imported descriptor disabled, `enable(id, boolean)` toggles, `reorder(ids)` supplies every installed id exactly once, and `remove(id)` deletes metadata and assets. The sample must be installed with `installSample`, which fetches its bundled manifest. Stack mutation is serialized. `setOriginal` is also available; the default manager reads the shell's master switch directly on each resolve and listens to settings changes.

Design credit: Darklands+ (MIT), docs/MODDING.md and port/mods/datamods.c, inspired the folder/stack model, last-match precedence and separation of mods from original data. This implementation is independently written JavaScript; no Darklands+ code was copied.

Validation: `node --test game/test/plus/mods.test.mjs`. The locked browser route is `node acceptance/integration/run.mjs game/test/plus/mods-run.json`; its probe generates the sample, exercises all three resolver overrides and draws each through the existing picture renderer, checks disabled/original-mode rendering against original bytes, and restores the explore canvas. It also records whether the engine loader hook has landed.
