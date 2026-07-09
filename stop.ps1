# =============================================================================
#  InSync — Stop Script (Windows PowerShell)
#  Kills Flask (port 5001) and Vite (port 5173) processes
#  Usage:  Right-click -> "Run with PowerShell"
#          OR from any terminal: .\stop.ps1
# =============================================================================

$ErrorActionPreference = 'SilentlyContinue'

function Write-Ok    { param($msg) Write-Host " [OK]   $msg" -ForegroundColor Green }
function Write-Info  { param($msg) Write-Host " [INFO] $msg" -ForegroundColor Cyan }
function Write-Warn  { param($msg) Write-Host " [WARN] $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host "  InSync  --  Stopping Local Environment  (Windows)"          -ForegroundColor Cyan
Write-Host " ============================================================" -ForegroundColor Cyan
Write-Host ""

# ── Helper: kill every process holding a given TCP port ──────────────────────
function Stop-ProcessOnPort {
    param(
        [int]    $Port,
        [string] $Label
    )

    # netstat -ano lists: Proto  Local  Foreign  State  PID
    $lines = netstat -ano 2>$null | Select-String ":$Port\s"
    if (-not $lines) {
        Write-Warn "Nothing listening on port $Port ($Label already stopped)."
        return
    }

    $pids = $lines |
        ForEach-Object { ($_ -split '\s+')[-1] } |
        Sort-Object -Unique |
        Where-Object { $_ -match '^\d+$' -and [int]$_ -gt 0 }

    foreach ($p in $pids) {
        $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Info "Stopping $Label (PID $p — $($proc.ProcessName))..."
            Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
            Write-Ok    "$Label stopped."
        } else {
            Write-Warn "PID $p not found (may have already exited)."
        }
    }
}

# ── Close the named console windows opened by start.bat ──────────────────────
function Close-ConsoleWindow {
    param([string] $WindowTitle)
    $procs = Get-Process cmd, powershell -ErrorAction SilentlyContinue |
             Where-Object { $_.MainWindowTitle -like "*$WindowTitle*" }
    foreach ($p in $procs) {
        Write-Info "Closing window: $($p.MainWindowTitle)"
        $p.CloseMainWindow() | Out-Null
        Start-Sleep -Milliseconds 400
        if (-not $p.HasExited) { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue }
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. Stop by port
# ─────────────────────────────────────────────────────────────────────────────
Stop-ProcessOnPort -Port 5001 -Label "Flask API"
Stop-ProcessOnPort -Port 5173 -Label "Vite Frontend"

# ─────────────────────────────────────────────────────────────────────────────
# 2. Also close the labelled console windows start.bat opened
# ─────────────────────────────────────────────────────────────────────────────
Close-ConsoleWindow "InSync -- Flask API"
Close-ConsoleWindow "InSync -- Vite Frontend"

# ─────────────────────────────────────────────────────────────────────────────
# 3. Verify ports are free
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Info "Verifying ports are free..."

foreach ($port in @(5001, 5173)) {
    $check = netstat -ano 2>$null | Select-String ":$port\s"
    if ($check) {
        Write-Warn "Port $port still in use. You may need to wait a few seconds and re-run."
    } else {
        Write-Ok   "Port $port is free."
    }
}

Write-Host ""
Write-Host " ============================================================" -ForegroundColor Green
Write-Host "  InSync services stopped." -ForegroundColor Green
Write-Host " ============================================================" -ForegroundColor Green
Write-Host ""
