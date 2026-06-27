@echo off
:: =============================================================================
::  InSync — Local Startup Script (Windows)
::  Usage:  start.bat   (double-click or run from any terminal)
:: =============================================================================
setlocal EnableDelayedExpansion

:: ── Resolve project root relative to this .bat file ──────────────────────────
set "PROJECT_ROOT=%~dp0"
:: Remove trailing backslash
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "BACKEND_DIR=%PROJECT_ROOT%\flask_backend"
set "VENV_DIR=%BACKEND_DIR%\venv"
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
set "VENV_PIP=%VENV_DIR%\Scripts\pip.exe"
set "VENV_FLASK=%VENV_DIR%\Scripts\flask.exe"
set "FLASK_PORT=5000"
set "VITE_PORT=5173"
set "FRONTEND_URL=http://localhost:%VITE_PORT%"

echo.
echo  ============================================================
echo   InSync ^— Starting Local Environment (Windows)
echo  ============================================================
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 1 — Python 3 check
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 1/9] Checking Python 3...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org and re-run.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do set "PY_VER=%%v"
echo [OK]    Found !PY_VER!

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 2 — Node.js / npm check
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 2/9] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org and re-run.
    pause & exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do set "NODE_VER=%%v"
echo [OK]    Found Node !NODE_VER!

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 3 — Python virtual environment
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 3/9] Checking Python virtual environment...
if not exist "%VENV_PYTHON%" (
    echo [INFO]  Creating venv at flask_backend\venv ...
    python -m venv "%VENV_DIR%"
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause & exit /b 1
    )
    echo [OK]    venv created.
) else (
    echo [OK]    venv already exists.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 4 — Python dependencies
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 4/9] Checking Python dependencies...
set "MARKER=%VENV_DIR%\.deps_installed"
set "REQUIREMENTS=%BACKEND_DIR%\requirements.txt"

:: Reinstall if marker is missing
if not exist "%MARKER%" (
    echo [INFO]  Installing pip packages from requirements.txt ...
    "%VENV_PIP%" install --quiet --upgrade pip
    "%VENV_PIP%" install --quiet -r "%REQUIREMENTS%"
    if errorlevel 1 (
        echo [ERROR] pip install failed. Check your internet connection.
        pause & exit /b 1
    )
    type nul > "%MARKER%"
    echo [OK]    Dependencies installed.
) else (
    echo [OK]    Dependencies up to date.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 5 — .env file
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 5/9] Checking .env file...
set "ENV_FILE=%BACKEND_DIR%\.env"
set "ENV_EXAMPLE=%BACKEND_DIR%\.env.example"

if not exist "%ENV_FILE%" (
    if exist "%ENV_EXAMPLE%" (
        copy "%ENV_EXAMPLE%" "%ENV_FILE%" >nul
        echo [WARN]  .env not found — copied from .env.example.
        echo         Edit flask_backend\.env if you need custom settings.
    ) else (
        echo [ERROR] .env missing and no .env.example found in flask_backend\.
        pause & exit /b 1
    )
) else (
    echo [OK]    .env found.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 6 — Database init + admin seed
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 6/9] Initialising database and seeding admin account...
cd /d "%BACKEND_DIR%"
set "FLASK_APP=run.py"

"%VENV_FLASK%" init-db
if errorlevel 1 (
    echo [ERROR] Database initialisation failed.
    pause & exit /b 1
)

"%VENV_FLASK%" seed-admin
if errorlevel 1 (
    echo [ERROR] Admin seeding failed.
    pause & exit /b 1
)
echo [OK]    Database ready.

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 7 — npm dependencies
:: ─────────────────────────────────────────────────────────────────────────────
cd /d "%PROJECT_ROOT%"
echo [Step 7/9] Checking npm dependencies...
if not exist "%PROJECT_ROOT%\node_modules" (
    echo [INFO]  Running npm install ...
    call npm install --silent
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause & exit /b 1
    )
    echo [OK]    npm packages installed.
) else (
    echo [OK]    node_modules found.
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 8 — Start Flask backend in a new window
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 8/9] Starting Flask backend (port %FLASK_PORT%)...
start "InSync — Flask API" /D "%BACKEND_DIR%" cmd /k ""%VENV_PYTHON%" run.py"

:: Poll until Flask responds (max 20 s)
set /a WAITED=0
:WAIT_FLASK
timeout /t 1 /nobreak >nul
set /a WAITED+=1
curl -sf "http://localhost:%FLASK_PORT%/" >nul 2>&1
if not errorlevel 1 goto FLASK_READY
if %WAITED% GEQ 20 (
    echo [ERROR] Flask did not start within 20s.
    echo         Check the "InSync — Flask API" console window for errors.
    pause & exit /b 1
)
goto WAIT_FLASK

:FLASK_READY
echo [OK]    Flask running -> http://localhost:%FLASK_PORT%

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 9 — Start Vite frontend in a new window
:: ─────────────────────────────────────────────────────────────────────────────
echo [Step 9/9] Starting Vite frontend (port %VITE_PORT%)...
start "InSync — Vite Frontend" /D "%PROJECT_ROOT%" cmd /k "npm run dev"

:: Poll until Vite responds (max 20 s)
set /a WAITED=0
:WAIT_VITE
timeout /t 1 /nobreak >nul
set /a WAITED+=1
curl -sf "http://localhost:%VITE_PORT%/" >nul 2>&1
if not errorlevel 1 goto VITE_READY
if %WAITED% GEQ 20 (
    echo [WARN]  Vite hasn't responded yet — it may still be compiling.
    echo         Open %FRONTEND_URL% manually once compilation finishes.
    goto OPEN_BROWSER
)
goto WAIT_VITE

:VITE_READY
echo [OK]    Vite running -> %FRONTEND_URL%

:: ─────────────────────────────────────────────────────────────────────────────
:: OPEN BROWSER
:: ─────────────────────────────────────────────────────────────────────────────
:OPEN_BROWSER
echo.
echo [INFO]  Opening browser -> %FRONTEND_URL%
start "" "%FRONTEND_URL%"

:: ─────────────────────────────────────────────────────────────────────────────
:: Done
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo  ============================================================
echo   InSync is running!
echo.
echo   Frontend   -^>  %FRONTEND_URL%
echo   API        -^>  http://localhost:%FLASK_PORT%
echo   Admin      -^>  admin@insync.dev  /  Admin@1234
echo.
echo   Two console windows have been opened:
echo     - "InSync -- Flask API"      (keep open)
echo     - "InSync -- Vite Frontend"  (keep open)
echo.
echo   Close those windows or press Ctrl+C in them to stop.
echo  ============================================================
echo.
pause
endlocal
