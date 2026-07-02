#!/usr/bin/env bash
# =============================================================================
#  InSync — Test Runner (macOS / Linux)
#  Runs the Flask/pytest backend suite AND the Vitest frontend suite.
#  Usage:  bash test.sh
# =============================================================================
set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
banner()  { echo -e "\n${BOLD}${CYAN}$*${RESET}\n"; }

# ── Resolve project root ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_ROOT/flask_backend"
VENV_DIR="$BACKEND_DIR/venv"

BACKEND_PASSED=0
FRONTEND_PASSED=0

banner "╔══════════════════════════════════════════╗"
banner "║   InSync — Running Test Suites           ║"
banner "╚══════════════════════════════════════════╝"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Activate Python venv
# ─────────────────────────────────────────────────────────────────────────────
info "Activating Python virtual environment..."
if [ ! -d "$VENV_DIR" ]; then
    error "venv not found at flask_backend/venv."
    error "Run 'bash start.sh' first to set up the environment, then re-run test.sh."
    exit 1
fi
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
success "venv activated."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — Backend: pytest
# ─────────────────────────────────────────────────────────────────────────────
banner "▶  Backend Tests  (pytest)"
cd "$BACKEND_DIR"

if pytest; then
    success "Backend tests passed."
    BACKEND_PASSED=1
else
    error "Backend tests FAILED."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Frontend: Vitest
# ─────────────────────────────────────────────────────────────────────────────
banner "▶  Frontend Tests  (Vitest)"
cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
    info "node_modules not found — running npm install..."
    npm install --legacy-peer-deps --silent
    success "npm packages installed."
fi

if npm test; then
    success "Frontend tests passed."
    FRONTEND_PASSED=1
else
    error "Frontend tests FAILED."
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}══════════════════════════════════════════${RESET}"
echo -e "${BOLD}  Test Summary${RESET}"
echo -e "${BOLD}══════════════════════════════════════════${RESET}"

if [ $BACKEND_PASSED -eq 1 ]; then
    echo -e "  Backend  (pytest)   ${GREEN}✅ PASSED${RESET}"
else
    echo -e "  Backend  (pytest)   ${RED}❌ FAILED${RESET}"
fi

if [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "  Frontend (Vitest)   ${GREEN}✅ PASSED${RESET}"
else
    echo -e "  Frontend (Vitest)   ${RED}❌ FAILED${RESET}"
fi

echo ""

if [ $BACKEND_PASSED -eq 1 ] && [ $FRONTEND_PASSED -eq 1 ]; then
    echo -e "${GREEN}${BOLD}All tests passed!${RESET}"
    exit 0
else
    echo -e "${RED}${BOLD}Some tests failed. See output above for details.${RESET}"
    exit 1
fi
