#!/usr/bin/env bash
# =============================================================================
#  InSync — Stop Script (macOS / Linux)
#  Kills Flask and Vite processes started by start.sh
#  Usage:  bash stop.sh
# =============================================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

stop_pid() {
    local PID_FILE="$1"
    local LABEL="$2"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            kill "$PID"
            echo -e "${GREEN}[OK]${RESET}  Stopped $LABEL (PID $PID)"
        else
            echo -e "${YELLOW}[WARN]${RESET} $LABEL (PID $PID) was not running."
        fi
        rm -f "$PID_FILE"
    else
        echo -e "${YELLOW}[WARN]${RESET} No PID file found for $LABEL — may already be stopped."
    fi
}

echo -e "${CYAN}Stopping InSync services...${RESET}"
stop_pid "$PROJECT_ROOT/.flask.pid" "Flask backend"
stop_pid "$PROJECT_ROOT/.vite.pid"  "Vite frontend"
echo -e "${GREEN}Done.${RESET}"
