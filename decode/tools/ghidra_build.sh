#!/bin/bash
# Build (or re-export) the overlay-aware Ghidra project. Run from Windows:
#   wsl.exe -d Ubuntu -- bash ${REPO:-$PWD}/decode/tools/ghidra_build.sh [build|export]
# build  = prep inputs + import + PorBuild (analysis) + PorExport
# export = PorExport only (after editing decode/names/*.json)
# Only one Ghidra at a time on this machine.
set -e
R=${REPO:-$PWD}
export GHIDRA_INSTALL_DIR=$HOME/tools/ghidra_12.1.4_PUBLIC
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
H=$GHIDRA_INSTALL_DIR/support/analyzeHeadless
P=$R/ghidra_proj
B=$R/decode/bin/ghidra
mkdir -p "$P" "$R/decode/names" "$R/decode/listings"
mode=${1:-build}
# one Ghidra at a time on this machine: refuse if a headless analyzer JVM is already running
if pgrep -f "headless.AnalyzeHeadless" > /dev/null; then echo "Ghidra already running - not starting"; exit 2; fi
if [ "$mode" = build ]; then
  python3 "$R/decode/tools/ghidra_prep.py" "$R/decode/bin/START.unpacked.exe" "$R/decode/bin/GAME.OVR" "$B" > /dev/null
  "$H" "$P" por -import "$B/resident.bin" -overwrite -loader BinaryLoader -processor "x86:LE:16:Real Mode" \
    -noanalysis -scriptPath "$R/decode/ghidra_scripts" -postScript PorBuild.java "$B" > "$P/build.log" 2>&1 || true
  grep -E "PorBuild.java>|ERROR|Exception" "$P/build.log" | grep -v "^INFO  REPORT" || true
  if ! grep -q PORBUILD_OK "$P/build.log"; then echo "BUILD FAILED - export skipped (listings unchanged)"; exit 1; fi
fi
"$H" "$P" por -process resident.bin -noanalysis -scriptPath "$R/decode/ghidra_scripts" \
  -postScript PorExport.java "$R/decode/names" "$R/decode/listings" 2>&1 | grep -E "PorExport|ERROR|Exception|exported|names" || true
