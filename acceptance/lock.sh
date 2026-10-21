# acceptance/lock.sh (por-fixer) — the shared run lock for shell scripts (Git Bash on Windows). Same protocol as
# acceptance/runlock.mjs (node: run.mjs and shoot.mjs lock themselves):
#   acceptance/.runlock/ (mkdir = atomic) + acceptance/.runlock/owner (lane, pid = Windows PID, start, epoch, cmd)
#   a waiter takes over when the owner PID is gone, or when there is no owner PID and the lock is older than 20 min;
#   takeovers are logged in acceptance/.runlock-takeovers.log; release only if the owner file still names us.
# Usage (source it, do not execute it):
#   . acceptance/lock.sh
#   lock_acquire "por-accept RUN-x"      # waits; exports POR_RUNLOCK_PID so run.mjs/shoot.mjs started below reuse it
#   node acceptance/integration/run.mjs ...; node acceptance/shoot.mjs ...
#   lock_release                         # also done by the EXIT/INT/TERM trap
# Never `mkdir acceptance/.runlock` by hand, and never wrap a locked run in `timeout`.

_LK_ACC="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
_LK_DIR="$_LK_ACC/.runlock"
_LK_LOG="$_LK_ACC/.runlock-takeovers.log"
_LK_START=""

_lk_mypid() { cat "/proc/$$/winpid" 2>/dev/null || echo "$$"; }     # Windows PID of this shell
_lk_alive() {                                                         # Windows PID exists?
  [ -n "$1" ] && [ "$1" -gt 0 ] 2>/dev/null || return 1
  tasklist //FI "PID eq $1" //NH 2>/dev/null | grep -q " $1 "
}
_lk_get() { sed -n "s/^$1=//p" "${2:-$_LK_DIR/owner}" 2>/dev/null | head -n 1 | tr -d '\r'; }
_lk_now() { date +%s; }

_lk_takeover() {                                                      # $1 = reason, $2 = pid seen
  local away="$_LK_DIR.stale-$(_lk_mypid)-$(_lk_now)"
  mv "$_LK_DIR" "$away" 2>/dev/null || return 0                       # another waiter won
  local opid; opid="$(_lk_get pid "$away/owner")"
  if [ -n "$opid" ] && [ "$opid" != "$2" ] && _lk_alive "$opid"; then   # raced a fresh holder: give it back
    mv "$away" "$_LK_DIR" 2>/dev/null && return 0
  fi
  local child marker extra=""
  child="$(_lk_get child "$away/owner")"; marker="$(_lk_get marker "$away/owner")"
  if [ -n "$child" ] && [ -n "$marker" ] && _lk_alive "$child"; then
    if powershell.exe -NoProfile -Command "(Get-CimInstance Win32_Process -Filter 'ProcessId=$child').CommandLine" 2>/dev/null | grep -qF "$marker"; then
      taskkill //PID "$child" //T //F >/dev/null 2>&1 && extra=" (orphan child $child killed)"
    else extra=" (child $child alive but not ours: left)"; fi
  fi
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) TAKEOVER by ${_LK_NAME:-lock.sh} pid=$(_lk_mypid): $1; old lane=$(_lk_get lane "$away/owner") pid=${opid:-?} start=$(_lk_get start "$away/owner")$extra" >> "$_LK_LOG"
  rm -rf "$away"
}

lock_acquire() {
  _LK_NAME="${1:-lock.sh $0}"
  local me waited="" pid age
  me="$(_lk_mypid)"
  if [ "$POR_RUNLOCK_PID" = "$me" ] && [ "$(_lk_get pid)" = "$me" ]; then return 0; fi   # already ours
  while :; do
    if mkdir "$_LK_DIR" 2>/dev/null; then break; fi
    pid="$(_lk_get pid)"
    if [ -n "$pid" ]; then
      if ! _lk_alive "$pid"; then _lk_takeover "owner pid $pid gone" "$pid"; continue; fi
    else
      age=$(( $(_lk_now) - $(stat -c %Y "$_LK_DIR" 2>/dev/null || _lk_now) ))
      if [ "$age" -gt 1200 ]; then _lk_takeover "no owner pid, lock $((age / 60)) min old" ""; continue; fi
    fi
    [ -z "$waited" ] && { echo "lock.sh: waiting for lane=$(_lk_get lane) pid=${pid:-?}" >&2; waited=1; }
    sleep 5
  done
  _LK_START="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  printf 'lane=%s\npid=%s\nstart=%s\nepoch=%s\ncmd=%s\n' "$_LK_NAME" "$me" "$_LK_START" "$(_lk_now)" "$0" > "$_LK_DIR/owner.$me"
  mv "$_LK_DIR/owner.$me" "$_LK_DIR/owner"
  export POR_RUNLOCK_PID="$me"
  trap 'lock_release' EXIT
  trap 'lock_release; exit 130' INT
  trap 'lock_release; exit 143' TERM
}

lock_release() {
  [ -n "$_LK_START" ] || return 0
  if [ "$(_lk_get pid)" = "$(_lk_mypid)" ] && [ "$(_lk_get start)" = "$_LK_START" ]; then rm -rf "$_LK_DIR"; fi
  _LK_START=""
  unset POR_RUNLOCK_PID
}
