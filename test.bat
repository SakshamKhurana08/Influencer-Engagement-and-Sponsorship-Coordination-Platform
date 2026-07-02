@echo off
:: =============================================================================
::  InSync — Test Runner (Windows)
::  Runs the Flask/pytest backend suite AND the Vitest frontend suite.
::  Usage:  Double-click test.bat  OR  run from any terminal
:: =============================================================================
setlocal EnableDelayedExpansion

:: ── Project paths ─────────────────────────────────────────────────────────────
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "BACKEND_DIR=%PROJECT_ROOT%\flask_backend"
set "VENV_DIR=%BACKEND_DIR%\venv"
set "VENV_PYTHON=%VENV_DIR%\Scripts\python.exe"
set "VENV_PYTEST=%VENV_DIR%\Scripts\pytest.exe"

set BACKEND_PASSED=0
set FRONTEND_PASSED=0

echo.
echo  ============================================================
echo   InSync  --  Running Test Suites  (Windows)
echo  ============================================================
echo.

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 1 — Check venv exists
:: ─────────────────────────────────────────────────────────────────────────────
echo [INFO]  Checking Python virtual environment...
if not exist "%VENV_PYTHON%" (
    echo [ERROR] venv not found at flask_backend\venv.
    echo         Run start.bat first to set up the environment, then re-run test.bat.
    pause & exit /b 1
)
echo [OK]    venv found.

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 2 — Backend: pytest
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo  ------------------------------------------------------------
echo   Backend Tests  (pytest)
echo  ------------------------------------------------------------
echo.

cd /d "%BACKEND_DIR%"
"%VENV_PYTHON%" -m pytest
if errorlevel 1 (
    echo.
    echo [FAIL]  Backend tests FAILED.
    set BACKEND_PASSED=0
) else (
    echo.
    echo [OK]    Backend tests passed.
    set BACKEND_PASSED=1
)

:: ─────────────────────────────────────────────────────────────────────────────
:: STEP 3 — Frontend: Vitest
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo  ------------------------------------------------------------
echo   Frontend Tests  (Vitest)
echo  ------------------------------------------------------------
echo.

cd /d "%PROJECT_ROOT%"

if not exist "%PROJECT_ROOT%\node_modules" (
    echo [INFO]  node_modules not found -- running npm install...
    call npm install --legacy-peer-deps --silent
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause & exit /b 1
    )
    echo [OK]    npm packages installed.
)

call npm test
if errorlevel 1 (
    echo.
    echo [FAIL]  Frontend tests FAILED.
    set FRONTEND_PASSED=0
) else (
    echo.
    echo [OK]    Frontend tests passed.
    set FRONTEND_PASSED=1
)

:: ─────────────────────────────────────────────────────────────────────────────
:: Summary
:: ─────────────────────────────────────────────────────────────────────────────
echo.
echo  ============================================================
echo   Test Summary
echo  ============================================================

if "!BACKEND_PASSED!"=="1" (
    echo   Backend  (pytest)   PASSED
) else (
    echo   Backend  (pytest)   FAILED
)

if "!FRONTEND_PASSED!"=="1" (
    echo   Frontend (Vitest)   PASSED
) else (
    echo   Frontend (Vitest)   FAILED
)

echo  ============================================================
echo.

if "!BACKEND_PASSED!"=="1" if "!FRONTEND_PASSED!"=="1" (
    echo  All tests passed!
    echo.
    pause
    exit /b 0
) else (
    echo  Some tests failed. See output above for details.
    echo.
    pause
    exit /b 1
)

endlocal
