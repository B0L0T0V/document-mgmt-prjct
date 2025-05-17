::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCyDJGyX8VAjFBRMXAWQAE+1EbsQ5+n//NaGuFgPUd0ocYHf1aOdH+If/0Dbc5kh0n9Ip80DAB9dbC2ibQA6ljwX5jLUb4mVsACB
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSTk=
::cBs/ulQjdF+5
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
::Zh4grVQjdCuDJGm222UMDDR3AgGaOQs=
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
setlocal EnableDelayedExpansion
title Document Management System Launcher
color 0A

echo ===============================================
echo   Document Management System Launcher
echo ===============================================
echo.

:: Get the directory where the batch file/exe is located
set "SCRIPT_DIR=%~dp0"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"
set "BACKEND_DIR=%SCRIPT_DIR%backend"

:: Check if required directories exist
if not exist "%FRONTEND_DIR%" (
    echo ERROR: Frontend directory not found at: %FRONTEND_DIR%
    echo Make sure you extract the complete PROGS folder.
    goto :error_exit
)

if not exist "%BACKEND_DIR%" (
    echo ERROR: Backend directory not found at: %BACKEND_DIR%
    echo Make sure you extract the complete PROGS folder.
    goto :error_exit
)

:: Check for dependencies and install if needed
echo Checking for required dependencies...
echo.

:: Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Installing...
    
    :: Create temp directory for downloads
    mkdir "%TEMP%\dms-setup" 2>nul
    
    :: Download Node.js installer
    echo Downloading Node.js installer...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi' -OutFile '%TEMP%\dms-setup\node-installer.msi'}"
    
    if not exist "%TEMP%\dms-setup\node-installer.msi" (
        echo Failed to download Node.js installer.
        echo Please install Node.js manually from https://nodejs.org/
        goto :error_exit
    )
    
    echo Installing Node.js...
    start /wait msiexec /i "%TEMP%\dms-setup\node-installer.msi" /quiet /norestart
    
    :: Verify installation
    where node >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Node.js installation failed.
        echo Please install Node.js manually from https://nodejs.org/
        goto :error_exit
    )
    
    echo Node.js installed successfully.
)

:: Check for Python
where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Python is not installed. Installing...
    
    :: Create temp directory for downloads if it doesn't exist
    mkdir "%TEMP%\dms-setup" 2>nul
    
    :: Download Python installer
    echo Downloading Python installer...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.10.0/python-3.10.0-amd64.exe' -OutFile '%TEMP%\dms-setup\python-installer.exe'}"
    
    if not exist "%TEMP%\dms-setup\python-installer.exe" (
        echo Failed to download Python installer.
        echo Please install Python manually from https://www.python.org/
        goto :error_exit
    )
    
    echo Installing Python...
    start /wait "%TEMP%\dms-setup\python-installer.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0
    
    :: Verify installation
    where python >nul 2>&1
    if %ERRORLEVEL% neq 0 (
        echo Python installation failed.
        echo Please install Python manually from https://www.python.org/
        goto :error_exit
    )
    
    echo Python installed successfully.
)

:: Install pip packages if requirements.txt exists
if exist "%BACKEND_DIR%\requirements.txt" (
    echo Installing Python dependencies...
    pushd "%BACKEND_DIR%"
    python -m pip install -r requirements.txt
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Python dependencies.
        popd
        goto :error_exit
    )
    popd
)

:: Install npm packages if package.json exists
if exist "%FRONTEND_DIR%\package.json" (
    echo Installing Node.js dependencies...
    pushd "%FRONTEND_DIR%"
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo Failed to install Node.js dependencies.
        popd
        goto :error_exit
    )
    popd
)

:: Create data directory if it doesn't exist
if not exist "%FRONTEND_DIR%\data" (
    mkdir "%FRONTEND_DIR%\data"
    echo Created data directory for frontend.
)

echo.
echo All dependencies are installed. Starting the application...
echo.

:: Start the backend server
echo Starting backend server...
start "DMS Backend" cmd /c "cd /d "%BACKEND_DIR%" && python -m app.main"

:: Give the backend time to start
timeout /t 3 /nobreak >nul

:: Start the frontend server
echo Starting frontend server...
start "DMS Frontend" cmd /c "cd /d "%FRONTEND_DIR%" && npm start"

:: Give the frontend time to start
timeout /t 5 /nobreak >nul

:: Open browser
echo Opening application in web browser...

echo.
echo Document Management System is now running!
echo To stop the application, close the terminal windows.
echo.
goto :eof

:error_exit
echo.
echo Installation failed. Please check the error messages above.
pause
exit /b 1 