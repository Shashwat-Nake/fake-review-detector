import asyncio
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from fastapi import WebSocket, WebSocketDisconnect
from enhanced_ml_model import EnhancedFakeReviewClassifier
import joblib
import redis
from collections import deque
import threading
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RealTimeAnalysisEngine:
    """
    Real-time fake review analysis engine with streaming capabilities
    """
    
    def __init__(self, model_path: str = "models"):
        self.classifier = EnhancedFakeReviewClassifier()
        self.classifier.load_models(model_path)
        
        # Real-time processing queue
        self.analysis_queue = deque(maxlen=1000)
        self.results_cache = {}
        
        # Performance monitoring
        self.processing_times = deque(maxlen=100)
        self.accuracy_metrics = deque(maxlen=100)
        
        # Redis for caching (optional)
        try:
            self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
            self.redis_available = True
        except:
            self.redis_available = False
            logger.warning("Redis not available, using in-memory cache")
        
        # WebSocket connections
        self.active_connections: List[WebSocket] = []
        
        # Start background processing
        self.processing_thread = threading.Thread(target=self._background_processor, daemon=True)
        self.processing_thread.start()
    
    async def connect_websocket(self, websocket: WebSocket):
        """Connect a new WebSocket client"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")
    
    def disconnect_websocket(self, websocket: WebSocket):
        """Disconnect a WebSocket client"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")
    
    async def broadcast_result(self, result: Dict[str, Any]):
        """Broadcast analysis result to all connected clients"""
        if self.active_connections:
            message = json.dumps(result)
            disconnected = []
            
            for connection in self.active_connections:
                try:
                    await connection.send_text(message)
                except:
                    disconnected.append(connection)
            
            # Remove disconnected clients
            for connection in disconnected:
                self.disconnect_websocket(connection)
    
    def analyze_review_batch(self, reviews: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze a batch of reviews"""
        start_time = time.time()
        
        try:
            # Extract text from reviews
            texts = [review.get('text', '') for review in reviews]
            
            # Get predictions
            predictions = self.classifier.predict(texts)
            
            # Prepare results
            results = []
            for i, review in enumerate(reviews):
                result = {
                    'id': review.get('id', f'review_{i}'),
                    'text': review.get('text', ''),
                    'fake_probability': predictions['probabilities'][i],
                    'is_fake': predictions['predictions'][i] == 1,
                    'confidence': predictions['probabilities'][i] if predictions['predictions'][i] == 1 else 1 - predictions['probabilities'][i],
                    'timestamp': datetime.now().isoformat(),
                    'metadata': review.get('metadata', {})
                }
                
                # Add risk level
                prob = result['fake_probability']
                if prob > 0.8:
                    result['risk_level'] = 'HIGH'
                elif prob > 0.6:
                    result['risk_level'] = 'MEDIUM'
                elif prob > 0.4:
                    result['risk_level'] = 'LOW'
                else:
                    result['risk_level'] = 'MINIMAL'
                
                results.append(result)
            
            # Record processing time
            processing_time = time.time() - start_time
            self.processing_times.append(processing_time)
            
            # Cache results if Redis is available
            if self.redis_available:
                for result in results:
                    cache_key = f"review_analysis:{result['id']}"
                    self.redis_client.setex(cache_key, 3600, json.dumps(result))  # Cache for 1 hour
            
            logger.info(f"Analyzed {len(reviews)} reviews in {processing_time:.3f}s")
            return results
            
        except Exception as e:
            logger.error(f"Error in batch analysis: {e}")
            return []
    
    def get_cached_result(self, review_id: str) -> Optional[Dict[str, Any]]:
        """Get cached analysis result"""
        if self.redis_available:
            try:
                cache_key = f"review_analysis:{review_id}"
                cached_result = self.redis_client.get(cache_key)
                if cached_result:
                    return json.loads(cached_result)
            except Exception as e:
                logger.warning(f"Error retrieving cached result: {e}")
        
        return None
    
    def _background_processor(self):
        """Background thread for processing queued reviews"""
        while True:
            try:
                if self.analysis_queue:
                    # Process up to 10 reviews at a time
                    batch = []
                    for _ in range(min(10, len(self.analysis_queue))):
                        if self.analysis_queue:
                            batch.append(self.analysis_queue.popleft())
                    
                    if batch:
                        results = self.analyze_review_batch(batch)
                        
                        # Broadcast results
                        for result in results:
                            asyncio.create_task(self.broadcast_result(result))
                
                time.sleep(0.1)  # Small delay to prevent CPU overload
                
            except Exception as e:
                logger.error(f"Error in background processor: {e}")
                time.sleep(1)
    
    def queue_review_for_analysis(self, review: Dict[str, Any]):
        """Queue a review for analysis"""
        # Check cache first
        review_id = review.get('id')
        if review_id:
            cached_result = self.get_cached_result(review_id)
            if cached_result:
                asyncio.create_task(self.broadcast_result(cached_result))
                return
        
        # Add to queue
        self.analysis_queue.append(review)
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get real-time performance metrics"""
        if not self.processing_times:
            return {
                'avg_processing_time': 0,
                'throughput': 0,
                'queue_size': len(self.analysis_queue),
                'active_connections': len(self.active_connections)
            }
        
        avg_processing_time = np.mean(self.processing_times)
        throughput = 1 / avg_processing_time if avg_processing_time > 0 else 0
        
        return {
            'avg_processing_time': avg_processing_time,
            'throughput': throughput,
            'queue_size': len(self.analysis_queue),
            'active_connections': len(self.active_connections),
            'total_processed': len(self.processing_times)
        }
    
    def get_analysis_statistics(self, hours: int = 24) -> Dict[str, Any]:
        """Get analysis statistics for the specified time period"""
        # This would typically query a database
        # For now, return mock statistics
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        return {
            'time_period': f"Last {hours} hours",
            'total_reviews_analyzed': np.random.randint(1000, 5000),
            'fake_reviews_detected': np.random.randint(100, 500),
            'fake_percentage': np.random.uniform(10, 25),
            'avg_confidence': np.random.uniform(0.8, 0.95),
            'top_risk_patterns': [
                {'pattern': 'Excessive superlatives', 'count': np.random.randint(50, 200)},
                {'pattern': 'Generic phrases', 'count': np.random.randint(30, 150)},
                {'pattern': 'Extreme sentiment', 'count': np.random.randint(20, 100)},
            ]
        }

class StreamingDataProcessor:
    """
    Process streaming review data from various sources
    """
    
    def __init__(self, analysis_engine: RealTimeAnalysisEngine):
        self.analysis_engine = analysis_engine
        self.data_sources = {}
        self.is_running = False
    
    def add_data_source(self, source_name: str, source_config: Dict[str, Any]):
        """Add a new data source for streaming"""
        self.data_sources[source_name] = source_config
        logger.info(f"Added data source: {source_name}")
    
    async def start_streaming(self):
        """Start processing streaming data"""
        self.is_running = True
        logger.info("Started streaming data processor")
        
        # Simulate streaming data (replace with actual data source connections)
        while self.is_running:
            try:
                # Simulate receiving reviews from various sources
                await self._simulate_streaming_data()
                await asyncio.sleep(1)  # Process every second
                
            except Exception as e:
                logger.error(f"Error in streaming processor: {e}")
                await asyncio.sleep(5)
    
    async def _simulate_streaming_data(self):
        """Simulate streaming review data"""
        # Generate mock reviews
        sample_reviews = [
            "This product is absolutely AMAZING!!! Best purchase ever!!!",
            "Good quality item, arrived on time. Satisfied with the purchase.",
            "Terrible product, waste of money. Don't buy this!",
            "I've been using this for 3 months. Works well for my needs.",
            "PERFECT!!! Everyone should buy this RIGHT NOW!!! Life changing!!!",
        ]
        
        # Randomly select and process reviews
        if np.random.random() > 0.7:  # 30% chance of new review
            review_text = np.random.choice(sample_reviews)
            review = {
                'id': f"review_{int(time.time() * 1000)}",
                'text': review_text,
                'source': 'simulation',
                'timestamp': datetime.now().isoformat(),
                'metadata': {
                    'platform': np.random.choice(['Amazon', 'Yelp', 'Google', 'TripAdvisor']),
                    'product_id': f"product_{np.random.randint(1000, 9999)}",
                    'user_id': f"user_{np.random.randint(100, 999)}"
                }
            }
            
            self.analysis_engine.queue_review_for_analysis(review)
    
    def stop_streaming(self):
        """Stop processing streaming data"""
        self.is_running = False
        logger.info("Stopped streaming data processor")

# WebSocket endpoint for real-time updates
async def websocket_endpoint(websocket: WebSocket, analysis_engine: RealTimeAnalysisEngine):
    """WebSocket endpoint for real-time analysis updates"""
    await analysis_engine.connect_websocket(websocket)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get('type') == 'analyze_review':
                # Direct analysis request
                review = message.get('review', {})
                if review:
                    analysis_engine.queue_review_for_analysis(review)
            
            elif message.get('type') == 'get_metrics':
                # Send performance metrics
                metrics = analysis_engine.get_performance_metrics()
                await websocket.send_text(json.dumps({
                    'type': 'metrics',
                    'data': metrics
                }))
            
            elif message.get('type') == 'get_statistics':
                # Send analysis statistics
                hours = message.get('hours', 24)
                stats = analysis_engine.get_analysis_statistics(hours)
                await websocket.send_text(json.dumps({
                    'type': 'statistics',
                    'data': stats
                }))
    
    except WebSocketDisconnect:
        analysis_engine.disconnect_websocket(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        analysis_engine.disconnect_websocket(websocket)

# Initialize global analysis engine
analysis_engine = RealTimeAnalysisEngine()
streaming_processor = StreamingDataProcessor(analysis_engine)

# Start streaming processor
async def start_background_services():
    """Start background services"""
    await streaming_processor.start_streaming()

if __name__ == "__main__":
    # Test the real-time analysis engine
    import asyncio
    
    async def test_real_time_analysis():
        # Test batch analysis
        test_reviews = [
            {
                'id': 'test_1',
                'text': "This product is absolutely AMAZING!!! Best purchase ever!!!",
                'metadata': {'platform': 'Amazon'}
            },
            {
                'id': 'test_2', 
                'text': "Good quality item, arrived on time. Satisfied with the purchase.",
                'metadata': {'platform': 'Yelp'}
            }
        ]
        
        results = analysis_engine.analyze_review_batch(test_reviews)
        
        for result in results:
            print(f"Review: {result['text'][:50]}...")
            print(f"Fake Probability: {result['fake_probability']:.3f}")
            print(f"Risk Level: {result['risk_level']}")
            print("---")
        
        # Test performance metrics
        metrics = analysis_engine.get_performance_metrics()
        print(f"Performance Metrics: {metrics}")
    
    asyncio.run(test_real_time_analysis())
