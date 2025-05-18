@echo off
echo Starting Document Management System...

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

echo Starting backend...
cd /d "%BACKEND_DIR%"
start cmd /k python run.py

echo Starting frontend...
cd /d "%FRONTEND_DIR%"
start cmd /k npm start

echo Services started!
echo Access the application at http://localhost:3000