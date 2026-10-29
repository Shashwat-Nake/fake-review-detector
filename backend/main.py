from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
from datetime import datetime

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://localhost:5173",
    "*",  # WARNING: This allows all origins.  Good for development, but not production.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class ReviewRequest(BaseModel):
    text: str

# In-memory storage for review history
review_history = []

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Fake Review Analyzer!"}

@app.post("/analyze")
async def analyze_review(request: ReviewRequest):
    try:
        # Your existing analysis logic here
        fake_probability = random.uniform(0.1, 0.9)
        is_fake = fake_probability > 0.5
        
        # Create analysis result
        result = {
            "text": request.text,
            "fake_probability": fake_probability,
            "is_fake": is_fake,
            "trust_score": 1 - fake_probability,
            "flags_detected": random.randint(0, 5),
            "analysis_details": {
                "word_count": len(request.text.split()),
                "indicators_found": ["Generic language", "Extreme sentiment"] if is_fake else []
            }
        }
        
        # Save to history with timestamp
        history_entry = {
            "id": len(review_history) + 1,
            "timestamp": datetime.now().isoformat(),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M:%S"),
            **result
        }
        review_history.append(history_entry)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_review_history():
    return {"history": list(reversed(review_history))}

@app.delete("/history/{review_id}")
async def delete_review(review_id: int):
    global review_history
    review_history = [r for r in review_history if r["id"] != review_id]
    return {"message": "Review deleted successfully"}

@app.delete("/history")
async def clear_history():
    global review_history
    review_history = []
    return {"message": "History cleared successfully"}
