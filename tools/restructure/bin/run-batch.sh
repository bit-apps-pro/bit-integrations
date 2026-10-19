#!/usr/bin/env bash
# Usage: WP_PATH=/path/to/wordpress tools/restructure/bin/run-batch.sh F2 [out-dir]
# Moves one batch and stops at the first failing gate (plan section 8.5).

set -uo pipefail

B="${1:?batch id, e.g. F2}"
F="$(cd "$(dirname "$0")/../../.." && pwd)"
PRO="${PRO_PATH:-$F/../bit-integrations-pro}"
WP="${WP_PATH:?set WP_PATH to the WordPress root}"
OUT="${2:-${TMPDIR:-/tmp}/restructure-batch-$B}"
RENAMES=Controller:Action,Controller:Helper,RecordApiHelper:Service,ApiHelper:Service
BI="php tools/restructure/bin/bi"
GIT=/usr/bin/git

cd "$F" || exit 2
mkdir -p "$OUT"
rm -rf "$OUT/results"

step() { echo "== [$B] $*"; }
fail() { echo "GATE FAILED [$B]: $*"; exit 1; }
same() { /usr/bin/cmp -s "$1" "$2"; }

[ -z "$($GIT status --porcelain -- backend tools/restructure/manifests)" ] || fail "backend or manifests not clean"
BASE=$($GIT rev-parse HEAD)
echo "$BASE" > "$OUT/base.sha"

LIST=$(sed -n "s/^ *'$B' *=> *'\([^']*\)'.*/\1/p" tools/restructure/src/Cli/Batches.php)
[ -n "$LIST" ] || fail "no integration list for $B in Batches.php"

step "analyze"
$BI analyze --free . --pro "$PRO" --batch "$B" --summary "$OUT/summary.json" > "$OUT/analyze.log" 2>&1 || fail "bi analyze (see $OUT/analyze.log)"
REFUSED=$(jq -r .refused "$OUT/summary.json")
[ "$REFUSED" = 0 ] || fail "bi analyze refused $REFUSED integration(s)"
T1=$(for n in $(echo "$LIST" | tr ',' ' '); do jq -r 'select(.tests | index("T1")) | .integration' "tools/restructure/manifests/$n.json"; done | paste -sd,)
FLAGS=$(sed -n '/^integrations=/,$p' "$OUT/analyze.log" | sed 's/^/  /')
$GIT add tools/restructure/manifests
$GIT commit -q -F - <<EOF || fail "commit manifests"
chore(restructure): add the reviewed $B manifests

$(echo "$LIST" | tr ',' ' ' | fold -s -w 72)

bi analyze summary:
$FLAGS
EOF

step "apply"
$BI apply --repo free --batch "$B" --commit-per-unit > "$OUT/apply.log" 2>&1 || fail "bi apply (see $OUT/apply.log)"
composer dump-autoload -o --strict-psr --strict-ambiguous > "$OUT/dump.log" 2>&1 || fail "strict composer dump (see $OUT/dump.log)"

step "route smoke compare"
php tools/restructure/contract/route-smoke.php --wp="$WP" --batch="$B" --compare=baseline/route-smoke --results="$OUT/results" --timeout=120 > "$OUT/route.log" 2>&1 || fail "route smoke (see $OUT/route.log)"

step "flow smoke compare (Pro on/off)"
php tools/restructure/contract/flow-smoke.php --wp="$WP" --batch="$B" --pro=on,off --compare=baseline/flow-smoke --results="$OUT/results" --timeout=120 > "$OUT/flow.log" 2>&1 || fail "flow smoke (see $OUT/flow.log)"

if [ -n "$T1" ]; then
    step "T1 forced-expiry compare: $T1"
    php tools/restructure/contract/flow-smoke.php --wp="$WP" --only="$T1" --pro=on,off --force-expiry --compare=baseline/flow-smoke-t1 --results="$OUT/results" --timeout=120 > "$OUT/t1.log" 2>&1 || fail "T1 (see $OUT/t1.log)"
fi

step "bi verify with test evidence"
$BI verify --root . --base "$BASE" --batch "$B" --tests "$OUT/results" > "$OUT/verify.log" 2>&1 || fail "bi verify (see $OUT/verify.log)"

step "contract snapshot"
wp --path="$WP" eval-file tools/restructure/contract/snapshot.php > "$OUT/snap.json" 2> "$OUT/snap.err" || fail "snapshot"
php tools/restructure/contract/diff.php baseline/snap.json "$OUT/snap.json" --allow="$RENAMES" > "$OUT/snap-diff.log" 2>&1 || fail "snapshot diff (see $OUT/snap-diff.log)"

step "seams, counts, public contract, Pro bindings"
php tools/restructure/contract/seams.php backend/Actions > "$OUT/seams.tsv" && same baseline/seams.tsv "$OUT/seams.tsv" || fail "seams differ"
php tools/restructure/qa/counts.php backend/Actions > "$OUT/counts.txt" && same baseline/counts.txt "$OUT/counts.txt" || fail "counts differ"
php tools/restructure/contract/public-contract.php > "$OUT/public-contract.log" 2>&1 || fail "public contract"
php tools/restructure/contract/pro-bindings.php > "$OUT/bindings.tsv" 2>/dev/null && same baseline/bindings.tsv "$OUT/bindings.tsv" || fail "Pro bindings differ"

step "PHPStan, php-cs-fixer subset, actions-shape, frontend"
tools/restructure/vendor/bin/phpstan clear-result-cache -c tools/restructure/phpstan.neon > /dev/null 2>&1
tools/restructure/vendor/bin/phpstan analyse -c tools/restructure/phpstan.neon --memory-limit=2G --error-format=json --no-progress > "$OUT/phpstan.json" 2>/dev/null
$BI phpstan-diff baseline/phpstan.json "$OUT/phpstan.json" --rename-map tools/restructure/manifests > "$OUT/phpstan-diff.log" 2>&1 || fail "PHPStan new errors (see $OUT/phpstan-diff.log)"
$BI csfixer-subset --base "$BASE" --batch "$B" > "$OUT/csfixer.log" 2>&1 || fail "php-cs-fixer subset (see $OUT/csfixer.log)"
php tools/restructure/ci/actions-shape.php > "$OUT/actions-shape.log" 2>&1 || fail "actions-shape"
[ -z "$($GIT diff --name-only "$BASE" -- frontend)" ] || fail "frontend changed"

step "blame-ignore"
for s in $($GIT log --format=%H --reverse --grep='^refactor(actions): move ' "$BASE"..HEAD); do
    echo "# $($GIT log -1 --format=%s "$s")" >> .git-blame-ignore-revs
    echo "$s" >> .git-blame-ignore-revs
done
$GIT add .git-blame-ignore-revs
$GIT commit -q -m "chore: ignore the $B action move commits in git blame" || fail "commit blame-ignore"

echo "BATCH $B PASSED: $(echo "$LIST" | tr ',' '\n' | wc -l) integration(s), $($GIT rev-list --count "$BASE"..HEAD) commit(s)"
