#!/usr/bin/env bash
# =============================================================================
#  InSync — Local Startup Script (macOS / Linux)
#  Usage:  bash start.sh
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

# ── Resolve project root (script may be called from any cwd) ─────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKEND_DIR="$PROJECT_ROOT/flask_backend"

FLASK_PORT=5001
VITE_PORT=5173
FRONTEND_URL="http://localhost:${VITE_PORT}"

banner "╔══════════════════════════════════════════╗"
banner "║   InSync — Starting Local Environment    ║"
banner "╚══════════════════════════════════════════╝"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1 — Dependency: Python 3
# ─────────────────────────────────────────────────────────────────────────────
info "Checking Python 3..."
if ! command -v python3 &>/dev/null; then
    error "Python 3 not found. Install it from https://python.org and re-run."
    exit 1
fi
PY_VERSION=$(python3 --version 2>&1)
success "Found $PY_VERSION"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 2 — Dependency: Node.js / npm
# ─────────────────────────────────────────────────────────────────────────────
info "Checking Node.js..."
if ! command -v node &>/dev/null; then
    error "Node.js not found. Install it from https://nodejs.org and re-run."
    exit 1
fi
NODE_VERSION=$(node --version 2>&1)
success "Found Node $NODE_VERSION"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 3 — Python virtual environment
# ─────────────────────────────────────────────────────────────────────────────
info "Checking Python virtual environment..."
VENV_DIR="$BACKEND_DIR/venv"

if [ ! -d "$VENV_DIR" ]; then
    info "Creating venv at flask_backend/venv ..."
    python3 -m venv "$VENV_DIR"
    success "venv created."
else
    success "venv already exists."
fi

# Activate
# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
success "venv activated."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 4 — Python dependencies
# ─────────────────────────────────────────────────────────────────────────────
info "Checking Python dependencies..."
REQUIREMENTS="$BACKEND_DIR/requirements.txt"

# Install if flask is missing or requirements.txt is newer than the venv marker
MARKER="$VENV_DIR/.deps_installed"
if [ ! -f "$MARKER" ] || [ "$REQUIREMENTS" -nt "$MARKER" ]; then
    info "Installing/updating pip packages from requirements.txt ..."
    pip install --quiet --upgrade pip
    pip install --quiet -r "$REQUIREMENTS"
    touch "$MARKER"
    success "Dependencies installed."
else
    success "Dependencies up to date."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 5 — .env file
# ─────────────────────────────────────────────────────────────────────────────
info "Checking .env file..."
ENV_FILE="$BACKEND_DIR/.env"
ENV_EXAMPLE="$BACKEND_DIR/.env.example"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        warn ".env not found — copied from .env.example. Edit flask_backend/.env if needed."
    else
        error ".env file missing and no .env.example found in flask_backend/."
        exit 1
    fi
else
    success ".env found."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 6 — Database init + admin seed
# ─────────────────────────────────────────────────────────────────────────────
info "Initialising database and seeding admin account..."
cd "$BACKEND_DIR"

# init-db creates tables; seed-admin is idempotent (update if exists)
FLASK_APP=run.py flask init-db   2>&1 | sed 's/^/         /'
FLASK_APP=run.py flask seed-admin 2>&1 | sed 's/^/         /'
success "Database ready."

# ─────────────────────────────────────────────────────────────────────────────
# STEP 7 — Node / npm dependencies
# ─────────────────────────────────────────────────────────────────────────────
cd "$PROJECT_ROOT"
info "Checking npm dependencies..."
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    info "Running npm install ..."
    npm install --silent
    success "npm packages installed."
else
    success "node_modules found."
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 8 — Start Flask backend (background)
# ─────────────────────────────────────────────────────────────────────────────
cd "$BACKEND_DIR"
info "Starting Flask backend on port $FLASK_PORT ..."
python run.py > "$PROJECT_ROOT/flask.log" 2>&1 &
FLASK_PID=$!
echo $FLASK_PID > "$PROJECT_ROOT/.flask.pid"

# Wait up to 10 s for Flask to become responsive
MAX_WAIT=10
WAITED=0
until curl -sf "http://localhost:$FLASK_PORT/" > /dev/null 2>&1; do
    sleep 1
    WAITED=$((WAITED + 1))
    if [ $WAITED -ge $MAX_WAIT ]; then
        error "Flask did not start within ${MAX_WAIT}s. Check flask.log for details."
        kill "$FLASK_PID" 2>/dev/null || true
        exit 1
    fi
    echo -n "."
done
echo ""
success "Flask backend running (PID $FLASK_PID) → http://localhost:$FLASK_PORT"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 9 — Start Vite frontend (background)
# ─────────────────────────────────────────────────────────────────────────────
cd "$PROJECT_ROOT"
info "Starting Vite frontend on port $VITE_PORT ..."
npm run dev > "$PROJECT_ROOT/vite.log" 2>&1 &
VITE_PID=$!
echo $VITE_PID > "$PROJECT_ROOT/.vite.pid"

# Wait up to 15 s for Vite to start
WAITED=0
MAX_WAIT=15
until curl -sf "http://localhost:$VITE_PORT/" > /dev/null 2>&1; do
    sleep 1
    WAITED=$((WAITED + 1))
    if [ $WAITED -ge $MAX_WAIT ]; then
        warn "Vite did not respond within ${MAX_WAIT}s — it may still be compiling."
        warn "Open $FRONTEND_URL manually once Vite finishes."
        break
    fi
    echo -n "."
done
echo ""
success "Vite frontend running (PID $VITE_PID) → $FRONTEND_URL"

# ─────────────────────────────────────────────────────────────────────────────
# STEP 10 — Open browser
# ─────────────────────────────────────────────────────────────────────────────
info "Opening browser → $FRONTEND_URL"
if command -v xdg-open &>/dev/null; then
    xdg-open "$FRONTEND_URL" &>/dev/null &        # Linux
elif command -v open &>/dev/null; then
    open "$FRONTEND_URL"                           # macOS
else
    warn "Could not detect a browser opener. Navigate to $FRONTEND_URL manually."
fi

# ─────────────────────────────────────────────────────────────────────────────
# Done
# ─────────────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}✅  InSync is running!${RESET}"
echo -e "   Frontend  → ${CYAN}$FRONTEND_URL${RESET}"
echo -e "   API       → ${CYAN}http://localhost:$FLASK_PORT${RESET}"
echo -e "   Admin login: admin@insync.dev / Admin@1234"
echo ""
echo -e "   Logs  →  flask.log  |  vite.log  (project root)"
echo -e "   PIDs  →  .flask.pid | .vite.pid  (project root)"
echo ""
echo -e "   To stop everything:  ${YELLOW}bash stop.sh${RESET}"
echo ""

# Keep the script alive so Ctrl-C tears everything down cleanly
trap 'echo ""; info "Shutting down..."; kill $FLASK_PID $VITE_PID 2>/dev/null; exit 0' INT TERM
wait $FLASK_PID $VITE_PID
