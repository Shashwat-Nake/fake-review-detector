import pandas as pd
import numpy as np
import re
from typing import Dict, List, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import pickle
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReviewDataPreprocessor:
    """
    Preprocessor for fake review detection datasets
    Supports YelpCHI, Deceptive Opinion Spam, and Amazon datasets
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        
    def load_yelp_chi_dataset(self, file_path: str) -> pd.DataFrame:
        """Load and preprocess YelpCHI dataset"""
        try:
            df = pd.read_csv(file_path)
            # Standardize column names
            df = df.rename(columns={
                'review_text': 'text',
                'is_fake': 'label',
                'reviewer_id': 'user_id',
                'review_rating': 'rating'
            })
            return df
        except Exception as e:
            logger.error(f"Error loading YelpCHI dataset: {e}")
            return pd.DataFrame()
    
    def load_deceptive_opinion_spam_dataset(self, file_path: str) -> pd.DataFrame:
        """Load and preprocess Deceptive Opinion Spam dataset"""
        try:
            df = pd.read_csv(file_path)
            # Convert truthful/deceptive to binary
            df['label'] = (df['deceptive'] == 'deceptive').astype(int)
            df = df.rename(columns={'review': 'text'})
            return df
        except Exception as e:
            logger.error(f"Error loading Deceptive Opinion Spam dataset: {e}")
            return pd.DataFrame()
    
    def load_amazon_dataset(self, file_path: str) -> pd.DataFrame:
        """Load and preprocess Amazon reviews dataset"""
        try:
            df = pd.read_json(file_path, lines=True)
            # Create fake label based on various indicators
            df['label'] = self.create_amazon_fake_labels(df)
            df = df.rename(columns={'reviewText': 'text', 'overall': 'rating'})
            return df
        except Exception as e:
            logger.error(f"Error loading Amazon dataset: {e}")
            return pd.DataFrame()
    
    def create_amazon_fake_labels(self, df: pd.DataFrame) -> pd.Series:
        """Create fake labels for Amazon dataset based on heuristics"""
        # This is a simplified approach - in practice, you'd use verified fake review labels
        fake_indicators = []
        
        for _, row in df.iterrows():
            score = 0
            text = str(row.get('reviewText', ''))
            
            # Short reviews with extreme ratings
            if len(text) < 50 and row.get('overall', 3) in [1, 5]:
                score += 1
            
            # Excessive punctuation
            if text.count('!') > 3:
                score += 1
            
            # Generic phrases
            generic_phrases = ['highly recommend', 'must buy', 'waste of money']
            if any(phrase in text.lower() for phrase in generic_phrases):
                score += 1
            
            # Unverified purchase (if available)
            if not row.get('verified', True):
                score += 1
            
            fake_indicators.append(1 if score >= 2 else 0)
        
        return pd.Series(fake_indicators)
    
    def extract_text_features(self, texts: pd.Series) -> pd.DataFrame:
        """Extract comprehensive text features"""
        features = []
        
        for text in texts:
            text = str(text)
            feature_dict = {}
            
            # Basic statistics
            feature_dict['text_length'] = len(text)
            feature_dict['word_count'] = len(text.split())
            feature_dict['sentence_count'] = len(re.split(r'[.!?]+', text))
            feature_dict['avg_word_length'] = np.mean([len(word) for word in text.split()]) if text.split() else 0
            
            # Punctuation features
            feature_dict['exclamation_count'] = text.count('!')
            feature_dict['question_count'] = text.count('?')
            feature_dict['caps_ratio'] = sum(1 for c in text if c.isupper()) / len(text) if text else 0
            
            # Language patterns
            superlatives = ['best', 'worst', 'amazing', 'terrible', 'perfect', 'awful']
            feature_dict['superlative_count'] = sum(1 for word in superlatives if word in text.lower())
            
            # Repetition analysis
            words = text.lower().split()
            unique_words = set(words)
            feature_dict['repetition_ratio'] = 1 - (len(unique_words) / len(words)) if words else 0
            
            # Readability (simplified)
            feature_dict['avg_sentence_length'] = feature_dict['word_count'] / max(feature_dict['sentence_count'], 1)
            
            # Emotional indicators
            positive_words = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect']
            negative_words = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible']
            feature_dict['positive_word_count'] = sum(1 for word in positive_words if word in text.lower())
            feature_dict['negative_word_count'] = sum(1 for word in negative_words if word in text.lower())
            
            features.append(feature_dict)
        
        return pd.DataFrame(features)
    
    def extract_metadata_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract metadata features"""
        metadata_features = pd.DataFrame()
        
        # Rating features
        if 'rating' in df.columns:
            metadata_features['rating'] = df['rating'].fillna(3)
            metadata_features['extreme_rating'] = df['rating'].isin([1, 5]).astype(int)
        
        # User features
        if 'user_id' in df.columns:
            user_review_counts = df['user_id'].value_counts()
            metadata_features['user_review_count'] = df['user_id'].map(user_review_counts).fillna(1)
            metadata_features['is_prolific_reviewer'] = (metadata_features['user_review_count'] > 10).astype(int)
        
        # Verification features
        if 'verified' in df.columns:
            metadata_features['verified_purchase'] = df['verified'].astype(int)
        
        # Temporal features (if timestamp available)
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            metadata_features['hour'] = df['timestamp'].dt.hour.fillna(12)
            metadata_features['day_of_week'] = df['timestamp'].dt.dayofweek.fillna(3)
            metadata_features['is_weekend'] = (df['timestamp'].dt.dayofweek >= 5).astype(int).fillna(0)
        
        return metadata_features
    
    def prepare_training_data(self, datasets: List[pd.DataFrame]) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Prepare combined training data from multiple datasets"""
        combined_df = pd.concat(datasets, ignore_index=True)
        
        # Extract features
        text_features = self.extract_text_features(combined_df['text'])
        metadata_features = self.extract_metadata_features(combined_df)
        
        # Combine features
        all_features = pd.concat([text_features, metadata_features], axis=1)
        all_features = all_features.fillna(0)
        
        # Prepare labels
        labels = combined_df['label'].values
        
        # Scale features
        scaled_features = self.scaler.fit_transform(all_features)
        
        return scaled_features, labels, all_features.columns.tolist()
    
    def save_preprocessor(self, file_path: str):
        """Save the fitted preprocessor"""
        with open(file_path, 'wb') as f:
            pickle.dump({
                'scaler': self.scaler,
                'label_encoder': self.label_encoder
            }, f)
    
    def load_preprocessor(self, file_path: str):
        """Load a fitted preprocessor"""
        with open(file_path, 'rb') as f:
            components = pickle.load(f)
            self.scaler = components['scaler']
            self.label_encoder = components['label_encoder']

def create_synthetic_dataset(n_samples: int = 1000) -> pd.DataFrame:
    """Create a synthetic dataset for demonstration"""
    np.random.seed(42)
    
    data = []
    
    for i in range(n_samples):
        # Generate fake reviews (label = 1)
        if i < n_samples // 2:
            text_templates = [
                "This product is absolutely amazing!!! Best purchase ever!!! Highly recommend!!!",
                "PERFECT PRODUCT!!! Everyone should buy this RIGHT NOW!!!",
                "Incredible quality! Life changing! Must have!",
                "Best thing I've ever bought! Amazing! Perfect! Excellent!",
                "Don't waste your money on anything else! This is THE BEST!!!"
            ]
            text = np.random.choice(text_templates)
            rating = np.random.choice([1, 5])  # Extreme ratings
            verified = np.random.choice([True, False], p=[0.3, 0.7])  # Less likely to be verified
            label = 1
        
        # Generate authentic reviews (label = 0)
        else:
            text_templates = [
                "I've been using this product for about 3 months. The build quality is solid and it works as expected. The battery life could be better, but overall I'm satisfied with my purchase.",
                "Good product for the price. Setup was straightforward and it does what it's supposed to do. Had one minor issue with the software but customer service was helpful.",
                "Decent quality item. Shipping was fast and packaging was good. It's not perfect but it meets my needs. Would consider buying from this brand again.",
                "The product arrived on time and in good condition. Performance is adequate for my use case. The manual could be clearer but I figured it out.",
                "Fair value for money. The design is nice and it feels well-made. Some features could be improved but it's a solid choice in this price range."
            ]
            text = np.random.choice(text_templates)
            rating = np.random.choice([2, 3, 4], p=[0.2, 0.5, 0.3])  # More moderate ratings
            verified = np.random.choice([True, False], p=[0.8, 0.2])  # More likely to be verified
            label = 0
        
        data.append({
            'text': text,
            'rating': rating,
            'verified': verified,
            'user_id': f"user_{np.random.randint(1, 500)}",
            'label': label,
            'timestamp': pd.Timestamp.now() - pd.Timedelta(days=np.random.randint(1, 365))
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    # Create synthetic dataset for demonstration
    logger.info("Creating synthetic dataset...")
    synthetic_data = create_synthetic_dataset(1000)
    
    # Initialize preprocessor
    preprocessor = ReviewDataPreprocessor()
    
    # Prepare training data
    logger.info("Preparing training data...")
    features, labels, feature_names = preprocessor.prepare_training_data([synthetic_data])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    logger.info(f"Training set size: {X_train.shape}")
    logger.info(f"Test set size: {X_test.shape}")
    logger.info(f"Feature count: {len(feature_names)}")
    logger.info(f"Fake review ratio: {np.mean(labels):.2%}")
    
    # Save preprocessor
    preprocessor.save_preprocessor('preprocessor.pkl')
    logger.info("Preprocessor saved successfully")
