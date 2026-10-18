# Acceptance reports (committed)

BYOC step 7: screenshots, DOSBox reference PNGs and diff images show the original art and stay in the gitignored
`acceptance/local/`. These JSON reports are what is committed:

| folder | written by | content per step / shot |
|---|---|---|
| `acc/<run>.json` | `acceptance/acc/run_at.mjs` + `acceptance/acc/cmp.py` (por-accept) | keys, ready, errors, `sha256` of the build shot; with a `ref`: `ref_sha256`, `mismatch_pixels`, `bbox` (exact RGB at 320×200, `acceptance/ref/compare.py`) |
| `integration/<run>.json` | `acceptance/integration/run.mjs` (por-build-qa) | keys, reps, ready, errors, `sha256` of the shot |
| `shoot/<id>.json` | `acceptance/shoot.mjs` | URL, ready, errors, `sha256` of the shot |

A shot can be checked against a report by regenerating it locally (same run file, same build) and comparing SHA-256.
DOSBox capture sidecars (`acceptance/ref/<id>.capture.json`, with the PNG's SHA-256) stay next to the harness.
