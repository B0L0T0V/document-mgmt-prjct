# Document Management System Launcher
# This script checks dependencies, launches the frontend and backend, and opens the browser

Write-Host "Starting Document Management System..." -ForegroundColor Green
Write-Host "Checking dependencies..." -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Set paths
$frontendPath = "D:\PROG\frontend"
$backendPath = "D:\PROG\frontend\..\backend"

# Function to check if command exists
function Test-CommandExists {
    param ($command)
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    try { 
        if (Get-Command $command) { return $true } 
    } catch { return $false }
    finally { $ErrorActionPreference = $oldPreference }
    return $false
}

# Function to install missing dependencies
function Install-Dependencies {
    Write-Host "Installing missing dependencies..." -ForegroundColor Yellow
    
    # Check and install Node.js
    if (-not (Test-CommandExists "node")) {
        Write-Host "Node.js is not installed. Installing..." -ForegroundColor Yellow
        
        # Download Node.js installer
        $nodeUrl = "https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi"
        $nodeInstaller = "$env:TEMP\node-installer.msi"
        
        try {
            Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
            Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "$nodeInstaller", "/quiet", "/norestart" -Wait
            
            # Add Node.js to PATH (restart PowerShell required to take effect)
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
            
            Write-Host "Node.js installed successfully. Please restart this script." -ForegroundColor Green
            exit
        } catch {
            Write-Host "Failed to install Node.js. Please install it manually from https://nodejs.org/" -ForegroundColor Red
            exit 1
        }
    }
    
    # Check and install dependencies for frontend
    if (Test-Path $frontendPath) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Set-Location $frontendPath
        npm install
    } else {
        Write-Host "Frontend path not found: $frontendPath" -ForegroundColor Red
        exit 1
    }
    
    # Check and install dependencies for backend
    if (Test-Path $backendPath) {
        Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
        Set-Location $backendPath
        pip install -r requirements.txt
    } else {
        Write-Host "Backend path not found: $backendPath" -ForegroundColor Red
        exit 1
    }
}

# Check if required tools are installed
$nodeInstalled = Test-CommandExists "node"
$npmInstalled = Test-CommandExists "npm"
$pythonInstalled = Test-CommandExists "python"
$pipInstalled = Test-CommandExists "pip"

# Display installation status
Write-Host "Node.js installed: $nodeInstalled"
Write-Host "npm installed: $npmInstalled"
Write-Host "Python installed: $pythonInstalled"
Write-Host "pip installed: $pipInstalled"

# Install missing dependencies
if (-not ($nodeInstalled -and $npmInstalled -and $pythonInstalled -and $pipInstalled)) {
    Install-Dependencies
}

# Check if node_modules exist in frontend
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "Frontend dependencies not installed. Installing..." -ForegroundColor Yellow
    Set-Location $frontendPath
    npm install
}

# Check for data directories and create if not present
if (-not (Test-Path "$frontendPath\data")) {
    New-Item -ItemType Directory -Path "$frontendPath\data" | Out-Null
    Write-Host "Created data directory for frontend" -ForegroundColor Green
}

# Start backend server in a new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; python -m app.main"

# Give backend time to start
Start-Sleep -Seconds 3

# Start frontend development server in a new window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm start"

# Give frontend time to start
Start-Sleep -Seconds 5

# Open browser
Write-Host "Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "Document Management System is now running!" -ForegroundColor Green
Write-Host "To stop the application, close the terminal windows." -ForegroundColor Yellow 