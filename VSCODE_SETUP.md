# VS Code Setup Guide for Windows

## 🚀 Quick Setup

1. **Run the setup script:**
   \`\`\`cmd
   setup-vscode.bat
   \`\`\`
   Or in PowerShell:
   ```powershell
   .\setup-vscode.ps1
   \`\`\`

2. **Open in VS Code:**
   \`\`\`cmd
   code .
   \`\`\`

## 📋 Step-by-Step Manual Setup

### 1. Install Required Extensions
VS Code will prompt you to install recommended extensions, or install manually:
- Python
- Pylint
- Black Formatter
- Tailwind CSS IntelliSense
- Prettier
- TypeScript and JavaScript Language Features

### 2. Setup Backend Environment
Press `Ctrl+Shift+P` and run:
- **Tasks: Run Task** → **Setup Complete Project**

This will:
- Create Python virtual environment
- Install all Python dependencies
- Download NLTK data
- Install Node.js dependencies

### 3. Start Development Servers

#### Option A: Using VS Code Tasks
Press `Ctrl+Shift+P` and run:
- **Tasks: Run Task** → **Start Backend Server**
- **Tasks: Run Task** → **Start Frontend Server**

#### Option B: Using Debug Configuration
Press `F5` and select:
- **Launch Full Stack** (starts both backend and frontend)

#### Option C: Using Integrated Terminal
**Terminal 1 (Backend):**
\`\`\`cmd
cd backend
venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`cmd
npm run dev
\`\`\`

## 🔧 VS Code Features Configured

### Python Development
- Auto-activate virtual environment
- Pylint linting
- Black code formatting
- Pytest testing support
- Debugging support

### Frontend Development
- TypeScript support
- Tailwind CSS IntelliSense
- ESLint integration
- Hot reload

### Debugging
- Backend debugging with breakpoints
- Frontend debugging
- Full-stack debugging

## 🌐 Access Points

After starting both servers:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API**: http://localhost:8000/redoc

## 🛠️ Useful VS Code Shortcuts

- `Ctrl+Shift+P`: Command Palette
- `Ctrl+`` `: Toggle Terminal
- `F5`: Start Debugging
- `Ctrl+Shift+F5`: Restart Debugging
- `Ctrl+C`: Stop running servers (in terminal)

## 📁 Project Structure in VS Code

\`\`\`
fake-review-detector/
├── .vscode/                 # VS Code configuration
├── backend/                 # Python FastAPI backend
│   ├── venv/               # Virtual environment
│   ├── main.py             # FastAPI app
│   └── requirements.txt    # Python dependencies
├── components/             # React components
├── app/                    # Next.js app directory
├── package.json           # Node.js dependencies
└── README.md
\`\`\`

## 🐛 Troubleshooting

### Python Issues
- Ensure Python 3.8+ is installed
- Check virtual environment activation
- Verify PYTHONPATH in VS Code settings

### Node.js Issues
- Ensure Node.js 16+ is installed
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 availability

### Port Conflicts
- Backend: Change port in `backend/main.py`
- Frontend: Use `npm run dev -- -p 3001`
