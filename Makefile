# Fake Review Detector - Development Commands

.PHONY: help install-backend install-frontend start-backend start-frontend start-all stop-all clean test

help:
	@echo "Available commands:"
	@echo "  install-backend    - Install backend dependencies"
	@echo "  install-frontend   - Install frontend dependencies"
	@echo "  start-backend      - Start backend server"
	@echo "  start-frontend     - Start frontend server"
	@echo "  start-all          - Start both backend and frontend"
	@echo "  docker-up          - Start with Docker Compose"
	@echo "  docker-down        - Stop Docker containers"
	@echo "  test-backend       - Run backend tests"
	@echo "  clean              - Clean up generated files"

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && python -m venv venv
	cd backend && source venv/bin/activate && pip install -r requirements.txt
	cd backend && source venv/bin/activate && python -c "import nltk; nltk.download('vader_lexicon'); nltk.download('stopwords'); nltk.download('punkt'); nltk.download('wordnet')"

install-frontend:
	@echo "Installing frontend dependencies..."
	npm install

start-backend:
	@echo "Starting backend server..."
	cd backend && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

start-frontend:
	@echo "Starting frontend server..."
	npm run dev

start-all:
	@echo "Starting both backend and frontend..."
	@echo "Backend will start on http://localhost:8000"
	@echo "Frontend will start on http://localhost:3000"
	make start-backend &
	make start-frontend

docker-up:
	@echo "Starting with Docker Compose..."
	docker-compose up --build

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down

test-backend:
	@echo "Running backend tests..."
	cd backend && source venv/bin/activate && python -m pytest tests/ -v

clean:
	@echo "Cleaning up..."
	rm -rf backend/venv
	rm -rf node_modules
	rm -rf .next
	rm -rf backend/__pycache__
	rm -rf backend/**/__pycache__
	docker-compose down --volumes --remove-orphans
