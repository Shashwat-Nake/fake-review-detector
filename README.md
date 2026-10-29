# Fake Review Detector v8.0

Advanced AI-powered fake review detection system with real-time analysis capabilities.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn
- Git

### Option 1: Manual Setup

#### Backend Setup
\`\`\`bash
# Clone the repository
git clone <repository-url>
cd fake-review-detector

# Start backend (Terminal 1)
chmod +x start-backend.sh
./start-backend.sh

# Or on Windows
start-backend.bat
\`\`\`

#### Frontend Setup
\`\`\`bash
# Start frontend (Terminal 2)
chmod +x start-frontend.sh
./start-frontend.sh

# Or on Windows
start-frontend.bat
\`\`\`

### Option 2: Using Make Commands
\`\`\`bash
# Install dependencies
make install-backend
make install-frontend

# Start both services
make start-all
\`\`\`

### Option 3: Using Docker
\`\`\`bash
# Start everything with Docker
make docker-up

# Or manually
docker-compose up --build
\`\`\`

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **WebSocket**: ws://localhost:8000/ws

## 📁 Project Structure

\`\`\`
fake-review-detector/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main API server
│   ├── enhanced_ml_model.py # ML models and training
│   ├── datasets.py         # Dataset management
│   ├── real_time_analysis.py # Real-time processing
│   ├── requirements.txt    # Python dependencies
│   └── models/             # Trained models
├── components/             # React components
├── app/                    # Next.js app router
├── lib/                    # Utility functions
├── public/                 # Static assets
├── package.json           # Frontend dependencies
├── docker-compose.yml     # Docker configuration
└── README.md              # This file
\`\`\`

## 🔧 Development Commands

### Backend Commands
\`\`\`bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Start development server
uvicorn main:app --reload

# Train new model
python enhanced_ml_model.py

# Download datasets
python datasets.py
\`\`\`

### Frontend Commands
\`\`\`bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check
\`\`\`

## 🤖 API Endpoints

### Core Analysis
- `POST /analyze` - Analyze single review
- `POST /analyze-batch` - Analyze multiple reviews
- `GET /metrics` - Performance metrics
- `GET /statistics` - Analysis statistics

### Model Management
- `POST /train-model` - Train new model
- `GET /model-info` - Model information
- `GET /datasets` - Available datasets
- `POST /download-dataset` - Download dataset

### Real-time
- `WebSocket /ws` - Real-time analysis stream

## 🎯 Features

### Frontend Features
- **Single Review Analysis**: Paste and analyze individual reviews
- **Batch Upload**: Upload CSV/JSON files for bulk analysis
- **Real-time Dashboard**: Live monitoring of analysis results
- **Interactive Visualizations**: Charts and graphs for insights
- **Theme Support**: Light and Deep Blue themes
- **Profile Management**: User settings and preferences

### Backend Features
- **Advanced ML Pipeline**: Ensemble of multiple algorithms
- **Real Dataset Training**: Uses Kaggle and research datasets
- **Real-time Processing**: WebSocket streaming analysis
- **Caching**: Redis-based result caching
- **Performance Monitoring**: Detailed metrics and logging
- **Scalable Architecture**: Async processing and background tasks

## 🔬 Machine Learning Models

The system uses an ensemble of:
- **Random Forest**: Tree-based ensemble learning
- **Gradient Boosting**: Sequential weak learner improvement
- **Logistic Regression**: Linear classification
- **SVM**: Support Vector Machine with RBF kernel
- **Naive Bayes**: Probabilistic classification

### Feature Engineering
- **TF-IDF Vectorization**: Word and character n-grams
- **Sentiment Analysis**: VADER sentiment scoring
- **Linguistic Features**: Punctuation, capitalization, repetition
- **Fake Indicators**: Superlatives, generic phrases, urgency words
- **Readability Metrics**: Flesch reading ease, syllable counts

## 📊 Datasets

The system can train on multiple real datasets:
- **YelpChi**: Labeled Yelp reviews dataset
- **Deceptive Opinion Spam**: Cornell research dataset
- **Amazon Reviews**: Large-scale product reviews
- **Kaggle Datasets**: Various fake review datasets

## 🐳 Docker Deployment

\`\`\`bash
# Build and start all services
docker-compose up --build

# Scale backend instances
docker-compose up --scale backend=3

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
\`\`\`

## 🧪 Testing

\`\`\`bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend tests
npm test

# Integration tests
npm run test:e2e
\`\`\`

## 🔧 Configuration

### Environment Variables
\`\`\`bash
# Backend (.env)
REDIS_URL=redis://localhost:6379
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

## 📈 Performance

- **Accuracy**: ~94% on test datasets
- **Throughput**: 100+ reviews/second
- **Latency**: <100ms per review
- **Real-time**: WebSocket streaming support

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Python version (3.9+ required)
   - Ensure virtual environment is activated
   - Install dependencies: `pip install -r requirements.txt`

2. **Frontend won't start**
   - Check Node.js version (18+ required)
   - Clear cache: `rm -rf node_modules .next && npm install`

3. **Model training fails**
   - Ensure sufficient disk space for datasets
   - Check internet connection for dataset downloads
   - Verify Kaggle API credentials if using Kaggle datasets

4. **WebSocket connection fails**
   - Check if backend is running on port 8000
   - Verify CORS settings
   - Check browser console for errors

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review API documentation at http://localhost:8000/docs
- Check logs in `backend/logs/` directory
