#!/bin/sh
# Outside check that BringsUp is up and the hourly operator is still running. Runs every 2 hours from
# .github/workflows/watchdog.yml; a failure fails the workflow, and GitHub emails the repo owner (Jake).
# Locally: sh tools/watchdog.sh
FN=https://rgeeynodxvusivfbaxfu.supabase.co/functions/v1
MAX_QUIET_MINUTES=${MAX_QUIET_MINUTES:-300}   # the operator runs at least every 4 hours (hourly 8 AM-8 PM ET, then midnight and 4 AM)
fail=0

check() { # <name> <url> <wanted status>
  code=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 30 -A "BringsUp watchdog" "$2")
  if [ "$code" = "$3" ]; then echo "ok    $1"; else echo "FAIL  $1: $2 returned $code (want $3)"; fail=1; fi
}

check "bringsup.com"            https://bringsup.com/ 200
check "/try/"                   https://bringsup.com/try/ 200
check "/start/"                 https://bringsup.com/start/ 200
check "/approve/"               https://bringsup.com/approve/ 200
check "/changes/"               https://bringsup.com/changes/ 200
check "/extra/"                 https://bringsup.com/extra/ 200
check "/managed/"               https://bringsup.com/managed/ 200
check "capacity"                "$FN/projects?capacity=1" 200
check "projects function"       "$FN/projects?status=watchdog-check" 404
for form in Ar7yBl EqkMlA VpLDP6 5XBMpd; do check "Tally form $form" "https://tally.so/r/$form" 200; done
check "Stripe \$1,000 link"     https://buy.stripe.com/8x2dR80ECbrl4Qz9yk3cc08 200
check "Stripe \$150 link"       https://buy.stripe.com/9B69ASevs1QL3Mv39W3cc09 200
check "Stripe \$49/mo link"     https://buy.stripe.com/8x228qafcanh4QzaCo3cc0a 200

# The /for/ Cloudflare worker: a known preview must come back with its own share card, not the generic one.
card=$(curl -s -L --max-time 30 -A "BringsUp watchdog" https://bringsup.com/for/scoops-and-cookies-ff8hnwge)
if printf '%s' "$card" | grep -q 'this could be your new website'; then echo "ok    /for/ share cards"; else echo "FAIL  /for/ share cards: the bringsup-for-preview worker isn't adding the business's card"; fail=1; fi

pulse=$(curl -s --max-time 30 "$FN/projects?pulse=1")
mins=$(printf '%s' "$pulse" | sed -n 's/.*"minutes_since":\([0-9]*\).*/\1/p')
if [ -n "$mins" ] && [ "$mins" -le "$MAX_QUIET_MINUTES" ]; then
  echo "ok    operator ran $mins minutes ago"
else
  echo "FAIL  the hourly operator hasn't reported in over $MAX_QUIET_MINUTES minutes ($pulse)."
  echo "      Check the \"BringsUp operator\" scheduled task at claude.ai/code: is it enabled, and did its last runs fail?"
  fail=1
fi
exit $fail
