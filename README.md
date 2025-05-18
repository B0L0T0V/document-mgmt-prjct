# Document Management System

A web-based Document Management System with React frontend and FastAPI backend. Features include role-based access control, document management, approval workflows, and bilingual support (English/Russian).

## Quick Start

### Running the Application
1. Double-click on the `DOC.exe` file
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
