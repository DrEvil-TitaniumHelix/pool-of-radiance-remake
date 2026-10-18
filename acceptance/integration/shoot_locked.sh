#!/bin/sh
# por-build-qa: run acceptance/shoot.mjs under the global run lock (the owner's load rule: one headless Chrome/DOSBox at a time).
# Usage: sh acceptance/integration/shoot_locked.sh <shoot.mjs args...>
# shoot.mjs takes the lock itself (acceptance/runlock.mjs: owner file, dead-owner takeover, released on exit/signals);
# this wrapper is kept for existing callers. Never mkdir acceptance/.runlock by hand, never wrap this in `timeout`.
cd "$(dirname "$0")/../.." || exit 1
exec node acceptance/shoot.mjs "$@"
