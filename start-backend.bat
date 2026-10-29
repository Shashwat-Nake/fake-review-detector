@echo off
echo Starting Fake Review Detection Backend...

REM Navigate to backend directory
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Download NLTK data
echo Downloading NLTK data...
python -c "import nltk; nltk.download('vader_lexicon', quiet=True); nltk.download('stopwords', quiet=True); nltk.download('punkt', quiet=True); nltk.download('wordnet', quiet=True); print('NLTK data downloaded successfully')"

REM Create necessary directories
if not exist "models" mkdir models
if not exist "datasets" mkdir datasets
if not exist "logs" mkdir logs

REM Start the FastAPI server
echo Starting FastAPI server on http://localhost:8000
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
