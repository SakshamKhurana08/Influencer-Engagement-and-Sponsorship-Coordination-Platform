@echo off
:: =============================================================================
::  InSync — Stop Script (Windows)
::  Kills the Flask API and Vite frontend processes by port.
::  Usage: Double-click stop.bat  OR  run from any terminal
:: =============================================================================
setlocal

set "FLASK_PORT=5001"
set "VITE_PORT=5173"

echo.
echo  ============================================================
echo   InSync  --  Stopping Local Environment
echo  ============================================================
echo.

:: ── Kill Flask (port 5001) ────────────────────────────────────────────────────
echo [1/2] Stopping Flask API on port %FLASK_PORT%...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%FLASK_PORT% " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
    echo [OK]    Flask process %%p terminated.
)
:: Fallback — kill by window title
taskkill /FI "WINDOWTITLE eq InSync -- Flask API" /F >nul 2>&1

:: ── Kill Vite (port 5173) ─────────────────────────────────────────────────────
echo [2/2] Stopping Vite frontend on port %VITE_PORT%...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%VITE_PORT% " ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
    echo [OK]    Vite process %%p terminated.
)
:: Fallback — kill by window title
taskkill /FI "WINDOWTITLE eq InSync -- Vite Frontend" /F >nul 2>&1

echo.
echo  ============================================================
echo   All InSync servers stopped.
echo  ============================================================
echo.
pause
endlocal
