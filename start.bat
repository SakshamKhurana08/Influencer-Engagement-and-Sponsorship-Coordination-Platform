@echo off
:: =============================================================================
::  InSync — Local Startup Script (Windows)
::  Usage:  Double-click start.bat  OR  run from any terminal
:: =============================================================================
setlocal EnableDelayedExpansion

:: ── Project paths ─────────────────────────────────────────────────────────────
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "BACKEND_DIR=%PROJECT_ROOT%\flask_backend"
set "VENV_DIR=%BACKEND_DIR%\venv"
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
set "VENV_PIP=%VENV_DIR%\Scripts\pip.exe"

:: ── Ports ─────────────────────────────────────────────────────────────────────
set "FLASK_PORT=5001"
set "VITE_PORT=5173"
set "FRONTEND_URL=http://localhost:%VITE_PORT%"

echo.
echo  ============================================================
echo   InSync  --  Starting Local Environment  (Windows)
echo  ============================================================
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 1 — Python 3
:: ─────────────────────────────────────────────────────────────────────────────
echo [1/8] Checking Python 3...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org and re-run.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo [OK]    Found %%v

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 2 — Node.js
:: ─────────────────────────────────────────────────────────────────────────────
echo [2/8] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org and re-run.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo [OK]    Found Node %%v

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 3 — Python virtual environment
:: ─────────────────────────────────────────────────────────────────────────────
echo [3/8] Checking Python virtual environment...
if not exist "%VENV_PYTHON%" (
    echo [INFO]  Creating venv at flask_backend\venv ...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 ( echo [ERROR] Failed to create venv. & pause & exit /b 1 )
    echo [OK]    venv created.
) else (
    echo [OK]    venv exists.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 4 — Python dependencies (always sync — fast if nothing changed)
:: ─────────────────────────────────────────────────────────────────────────────
echo [4/8] Installing / syncing Python dependencies...
"%VENV_PYTHON%" -m pip install --quiet -r "%BACKEND_DIR%\requirements.txt"
if errorlevel 1 ( echo [ERROR] pip install failed. & pause & exit /b 1 )
echo [OK]    Python dependencies up to date.

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 5 — .env file
:: ─────────────────────────────────────────────────────────────────────────────
echo [5/8] Checking .env file...
if not exist "%BACKEND_DIR%\.env" (
    if exist "%BACKEND_DIR%\.env.example" (
        copy "%BACKEND_DIR%\.env.example" "%BACKEND_DIR%\.env" >nul
        echo [WARN]  .env copied from .env.example — edit flask_backend\.env if needed.
    ) else (
        echo [ERROR] .env missing and no .env.example found. & pause & exit /b 1
    )
) else (
    echo [OK]    .env found.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 6 — Database init + admin seed
:: ─────────────────────────────────────────────────────────────────────────────
echo [6/8] Initialising database and seeding admin...
cd /d "%BACKEND_DIR%"
set "FLASK_APP=run.py"
"%VENV_PYTHON%" -m flask init-db    2>&1 | findstr /V "UserWarning" | findstr /V "warnings.warn" | findstr /V "flask_limiter" | findstr /V "storage backend" | findstr /V "^$"
"%VENV_PYTHON%" -m flask seed-admin 2>&1 | findstr /V "UserWarning" | findstr /V "warnings.warn" | findstr /V "flask_limiter" | findstr /V "storage backend" | findstr /V "^$"
echo [OK]    Database ready.
cd /d "%PROJECT_ROOT%"

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 7 — npm install
:: ─────────────────────────────────────────────────────────────────────────────
echo [7/8] Checking npm dependencies...
if not exist "%PROJECT_ROOT%\node_modules\.bin\vite.cmd" (
    echo [INFO]  Running npm install ...
    call npm install --legacy-peer-deps --silent
    if errorlevel 1 ( echo [ERROR] npm install failed. & pause & exit /b 1 )
    echo [OK]    npm packages installed.
) else (
    echo [OK]    node_modules found.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 8a — Start Flask backend
:: ─────────────────────────────────────────────────────────────────────────────
echo [8/8] Starting servers...
echo        Launching Flask API on port %FLASK_PORT%...
start "InSync -- Flask API" /D "%BACKEND_DIR%" cmd /k ^
    "set FLASK_APP=run.py & "%VENV_PYTHON%" run.py"

:: Poll Flask — max 30 s
set /a WAITED=0
:WAIT_FLASK
timeout /t 1 /nobreak >nul 2>&1
set /a WAITED+=1
curl -sf "http://localhost:%FLASK_PORT%/" >nul 2>&1
if not errorlevel 1 goto FLASK_READY
if !WAITED! GEQ 30 (
    echo [ERROR] Flask did not respond after 30 s — check the Flask window.
    pause & exit /b 1
)
goto WAIT_FLASK
:FLASK_READY
echo [OK]    Flask running  ->  http://localhost:%FLASK_PORT%

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 8b — Start Vite frontend
:: ─────────────────────────────────────────────────────────────────────────────
echo        Launching Vite frontend on port %VITE_PORT%...
start "InSync -- Vite Frontend" /D "%PROJECT_ROOT%" cmd /k ^
    "node_modules\.bin\vite.cmd --port %VITE_PORT%"

:: Poll Vite — max 30 s
set /a WAITED=0
:WAIT_VITE
timeout /t 1 /nobreak >nul 2>&1
set /a WAITED+=1
curl -sf "http://localhost:%VITE_PORT%/" >nul 2>&1
if not errorlevel 1 goto VITE_READY
if !WAITED! GEQ 30 (
    echo [WARN]  Vite taking longer than expected — opening browser anyway.
    goto OPEN_BROWSER
)
goto WAIT_VITE
:VITE_READY
echo [OK]    Vite running   ->  %FRONTEND_URL%

:: ─────────────────────────────────────────────────────────────────────────────
:: OPEN BROWSER
:: ─────────────────────────────────────────────────────────────────────────────
:OPEN_BROWSER
echo.
echo [INFO]  Opening browser -> %FRONTEND_URL%
start "" "%FRONTEND_URL%"

echo.
echo  ============================================================
echo   InSync is running!
echo.
echo   Frontend  ->  %FRONTEND_URL%
echo   API       ->  http://localhost:%FLASK_PORT%
echo   Admin     ->  admin@insync.dev  /  Admin@1234
echo.
echo   Two console windows are open — keep them running.
echo   Close this window or press any key to exit this launcher.
echo  ============================================================
echo.
pause
endlocal
