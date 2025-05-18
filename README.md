# Document Management System

A web-based Document Management System with React frontend and FastAPI backend. Features include role-based access control, document management, approval workflows, and bilingual support (English/Russian).

## Portability

This application is fully portable and can be moved to any location on your computer:

- All paths are relative to the application directory
- You can place the application on any drive (C:, D:, E:, etc.)
- You can rename the parent folder without breaking functionality
- The launchers automatically detect their location and adjust paths accordingly

## Quick Start

### Running the Application
1. Double-click on the `universal-dms-launcher.bat` file (or `DMS-Launcher.exe` if provided)


2. The application will check for dependencies and install them if needed
3. Both frontend and backend servers will start automatically
4. The application will open in your default web browser

### Default Login Credentials
- Администратор: `администратор` / `admin123`
- Руководитель: `руководитель` / `manager123`
- Исполнитель: `исполнитель` / `user123`

## Repository Structure

```
document-management-system/
├── frontend/                     # React frontend
│   ├── src/                      # Source files
│   ├── public/                   # Static files
│   └── package.json              # Dependencies
├── backend/                      # FastAPI backend
│   ├── app/                      # API code
│   └── requirements.txt          # Dependencies
├── universal-dms-launcher.bat    # Main batch launcher
├── start.bat                     # Alternative batch launcher
├── run.bat                       # Simple launcher
├── start-dms.ps1                 # PowerShell launcher script
└── README.md                     # This file
```


### Running on Another PC

1. Clone the repository or download the files:
```bash
git clone https://github.com/yourusername/document-management-system.git
```

2. Run the application:
   - Simply double-click on `universal-dms-launcher.bat`
   - The script will check for dependencies and install if necessary
   - The application will start automatically
   - No configuration changes needed - the application is fully portable!

3. Moving the application:
   - You can move the entire application folder to any location on your PC
   - You can rename the parent folder without breaking functionality
   - All scripts use relative paths that automatically adjust to their location

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
