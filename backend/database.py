import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

class ReviewHistoryDB:
    def __init__(self, db_path: str = "review_history.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create review_history table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS review_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                review_text TEXT NOT NULL,
                fake_probability REAL NOT NULL,
                is_fake BOOLEAN NOT NULL,
                analysis_details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                date TEXT NOT NULL,
                time TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create sessions table for simple session management
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_user(self, username: str, email: str) -> str:
        """Create a new user and return user ID"""
        user_id = str(uuid.uuid4())
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (id, username, email) VALUES (?, ?, ?)",
                (user_id, username, email)
            )
            conn.commit()
            return user_id
        except sqlite3.IntegrityError:
            raise ValueError("Username or email already exists")
        finally:
            conn.close()
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, username, email, created_at FROM users WHERE username = ?",
            (username,)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "created_at": row[3]
            }
        return None
    
    def create_session(self, user_id: str) -> str:
        """Create a new session for user"""
        session_id = str(uuid.uuid4())
        expires_at = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)",
            (session_id, user_id, expires_at)
        )
        conn.commit()
        conn.close()
        
        return session_id
    
    def get_user_by_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get user by session ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT u.id, u.username, u.email, u.created_at 
            FROM users u 
            JOIN sessions s ON u.id = s.user_id 
            WHERE s.session_id = ? AND s.expires_at > CURRENT_TIMESTAMP
        ''', (session_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "username": row[1],
                "email": row[2],
                "created_at": row[3]
            }
        return None
    
    def add_review_analysis(self, user_id: str, review_text: str, fake_probability: float, 
                          is_fake: bool, analysis_details: Dict[str, Any] = None) -> str:
        """Add a review analysis to history"""
        review_id = str(uuid.uuid4())
        now = datetime.now()
        date_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO review_history 
            (id, user_id, review_text, fake_probability, is_fake, analysis_details, date, time)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            review_id, user_id, review_text, fake_probability, is_fake,
            json.dumps(analysis_details) if analysis_details else None,
            date_str, time_str
        ))
        
        conn.commit()
        conn.close()
        
        return review_id
    
    def get_user_history(self, user_id: str, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Get review history for a specific user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, review_text, fake_probability, is_fake, analysis_details, 
                   created_at, date, time
            FROM review_history 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ''', (user_id, limit, offset))
        
        rows = cursor.fetchall()
        conn.close()
        
        history = []
        for row in rows:
            analysis_details = json.loads(row[4]) if row[4] else {}
            history.append({
                "id": row[0],
                "review_text": row[1],
                "fake_probability": row[2],
                "is_fake": bool(row[3]),
                "analysis_details": analysis_details,
                "created_at": row[5],
                "date": row[6],
                "time": row[7]
            })
        
        return history
    
    def get_user_stats(self, user_id: str) -> Dict[str, Any]:
        """Get statistics for a user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total reviews analyzed
        cursor.execute(
            "SELECT COUNT(*) FROM review_history WHERE user_id = ?",
            (user_id,)
        )
        total_reviews = cursor.fetchone()[0]
        
        # Fake reviews detected
        cursor.execute(
            "SELECT COUNT(*) FROM review_history WHERE user_id = ? AND is_fake = 1",
            (user_id,)
        )
        fake_reviews = cursor.fetchone()[0]
        
        # Average fake probability
        cursor.execute(
            "SELECT AVG(fake_probability) FROM review_history WHERE user_id = ?",
            (user_id,)
        )
        avg_fake_prob = cursor.fetchone()[0] or 0
        
        # Reviews by date (last 7 days)
        cursor.execute('''
            SELECT date, COUNT(*) 
            FROM review_history 
            WHERE user_id = ? AND date >= date('now', '-7 days')
            GROUP BY date 
            ORDER BY date DESC
        ''', (user_id,))
        
        daily_stats = cursor.fetchall()
        conn.close()
        
        return {
            "total_reviews": total_reviews,
            "fake_reviews": fake_reviews,
            "authentic_reviews": total_reviews - fake_reviews,
            "fake_percentage": (fake_reviews / total_reviews * 100) if total_reviews > 0 else 0,
            "avg_fake_probability": avg_fake_prob,
            "daily_stats": [{"date": row[0], "count": row[1]} for row in daily_stats]
        }
    
    def delete_review(self, review_id: str, user_id: str) -> bool:
        """Delete a review from user's history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM review_history WHERE id = ? AND user_id = ?",
            (review_id, user_id)
        )
        
        deleted = cursor.rowcount > 0
        conn.commit()
        conn.close()
        
        return deleted
    
    def clear_user_history(self, user_id: str) -> int:
        """Clear all history for a user"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM review_history WHERE user_id = ?",
            (user_id,)
        )
        
        deleted_count = cursor.rowcount
        conn.commit()
        conn.close()
        
        return deleted_count
