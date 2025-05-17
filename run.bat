@echo off
echo Starting Document Management System...

echo Starting backend...
cd D:\PROG\backend
start cmd /k python run.py

echo Starting frontend...
cd D:\PROG\frontend
start cmd /k npm start

echo Services started!
echo Access the application at http://localhost:3000