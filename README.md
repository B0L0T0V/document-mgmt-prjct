# Document Management System

A web-based Document Management System with React frontend and FastAPI backend. Features include role-based access control, document management, approval workflows, and bilingual support (English/Russian).

## Quick Start

### Running the Application
1. Double-click on the `DMS-Launcher.exe` file
2. The application will check for dependencies and install them if needed
3. Both frontend and backend servers will start automatically
4. The application will open in your default web browser

### Default Login Credentials
- Admin: `admin` / `admin123`
- Manager: `manager` / `manager123`
- User: `user` / `user123`

## Repository Structure

```
document-management-system/
├── frontend/                 # React frontend
│   ├── src/                  # Source files
│   ├── public/               # Static files
│   └── package.json          # Dependencies
├── backend/                  # FastAPI backend
│   ├── app/                  # API code
│   └── requirements.txt      # Dependencies
├── DMS-Launcher.exe          # Executable launcher
├── start-dms.ps1             # PowerShell script used by the launcher
└── README.md                 # This file
```

## Creating the Executable Launcher

If you need to recreate the executable launcher, use one of these methods:

### Method 1: Using .NET Framework
1. Run `compile-launcher.bat` to compile the C# program
2. This requires the .NET Framework to be installed

### Method 2: Using .NET Core/.NET 5+
1. Run `compile-dotnet.bat` to create a self-contained executable
2. This requires the .NET SDK to be installed
3. The resulting executable will be standalone and won't require .NET installed on the target machine

## Deployment Guide

### GitHub Deployment

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Push the code to GitHub:

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository URL (replace with your own)
git remote add origin https://github.com/yourusername/document-management-system.git

# Push to GitHub
git push -u origin main
```

### Running on Another PC

1. Clone the repository or download the files:
```bash
git clone https://github.com/yourusername/document-management-system.git
cd document-management-system
```

2. Set up the configuration:
   - Edit the paths in `start-dms.ps1` if needed
   - Make sure the paths match your local setup

3. Run the application:
   - Double-click on `DMS-Launcher.exe`
   - The executable will run the PowerShell script with execution policy bypass
   - The script will check for dependencies and install if necessary
   - The application will start automatically

## System Requirements

- Windows 10 or newer
- Internet connection (for initial dependency installation)
- 2GB RAM or more
- 500MB disk space

## Dependencies

The startup script will automatically check for and install:
- Node.js
- npm
- Python
- pip

## Features

- Role-based access control (Admin, Manager, User)
- Document creation, editing, and management
- Document approval workflows
- Message system
- Activity logging
- Bilingual support (English/Russian)
- System settings management
- User management
- Data export capabilities

## Troubleshooting

### Common Issues

1. **PowerShell execution policy:** The launcher will automatically bypass this restriction, but if you're running the script directly, open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy RemoteSigned
```

2. **Port conflicts:** If ports 3000 (frontend) or 5000 (backend) are in use, modify the startup commands in `start-dms.ps1`.

3. **Dependency installation failures:** If automatic installation fails, install Node.js and Python manually from their official websites.

4. **Launcher crashes:** Make sure the `start-dms.ps1` file is in the same directory as the executable.

### Manual Startup

If the automatic startup doesn't work, you can start the servers manually:

1. Start the backend:
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

2. Start the frontend (in a new terminal):
```bash
cd frontend
npm install
npm start
```

## License

This software is provided as-is with no warranties. 