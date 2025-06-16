::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCuDJH2L40w8JxpQXziSLm68A6cZ5uv+/PmesVkYWfU2dovUzaexebNEvxWqfJUitg==
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSTk=
::cBs/ulQjdFy5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCuDJGm222UMDDZnAgGaOQs=
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
echo Starting Document Management System...
echo.

REM Get the directory where the script is running
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

REM Try to find Python - first try python in PATH, then try "py" launcher
where python >nul 2>&1
if %ERRORLEVEL% == 0 (
    set PYTHON_CMD=python
) else (
    where py >nul 2>&1
    if %ERRORLEVEL% == 0 (
        set PYTHON_CMD=py
    ) else (
        echo Python not found. Please install Python and add it to your PATH.
        pause
        exit /b 1
    )
)

REM Start the backend server
start cmd /k "cd /d "%BACKEND_DIR%" && %PYTHON_CMD% run.py"

REM Wait a moment to ensure backend starts first
timeout /t 5 /nobreak

REM Start the frontend server
start cmd /k "cd /d "%FRONTEND_DIR%" && npm start"

echo.
echo Servers are starting...
echo Backend will be available at http://127.0.0.1:5000
echo Frontend will be available at http://localhost:3000