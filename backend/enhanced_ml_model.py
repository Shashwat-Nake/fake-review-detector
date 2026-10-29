import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.base import BaseEstimator, TransformerMixin
import pickle
import logging
from typing import Dict, List, Tuple, Any
import re
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import joblib

# Download required NLTK data
try:
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedTextFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Advanced feature extractor for text analysis
    """
    
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Fake review indicators
        self.fake_indicators = {
            'superlatives': ['best', 'worst', 'amazing', 'terrible', 'perfect', 'awful', 'incredible', 'horrible', 'fantastic', 'outstanding'],
            'generic_phrases': ['highly recommend', 'must buy', 'waste of money', 'life changing', 'game changer', 'worth every penny'],
            'urgency_words': ['now', 'immediately', 'urgent', 'limited time', 'hurry', 'quick', 'fast'],
            'extreme_adjectives': ['absolutely', 'completely', 'totally', 'extremely', 'incredibly', 'unbelievably']
        }
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        """Extract advanced features from text"""
        features = []
        
        for text in X:
            text_features = self._extract_text_features(str(text))
            features.append(text_features)
        
        return np.array(features)
    
    def _extract_text_features(self, text: str) -> List[float]:
        """Extract comprehensive text features"""
        features = []
        
        # Basic text statistics
        features.extend(self._get_basic_stats(text))
        
        # Sentiment features
        features.extend(self._get_sentiment_features(text))
        
        # Linguistic features
        features.extend(self._get_linguistic_features(text))
        
        # Fake review indicators
        features.extend(self._get_fake_indicators(text))
        
        # Readability features
        features.extend(self._get_readability_features(text))
        
        return features
    
    def _get_basic_stats(self, text: str) -> List[float]:
        """Basic text statistics"""
        words = word_tokenize(text.lower())
        sentences = re.split(r'[.!?]+', text)
        
        return [
            len(text),  # Character count
            len(words),  # Word count
            len(sentences),  # Sentence count
            np.mean([len(word) for word in words]) if words else 0,  # Average word length
            len(text) / len(words) if words else 0,  # Average characters per word
            len(words) / len(sentences) if sentences else 0,  # Average words per sentence
        ]
    
    def _get_sentiment_features(self, text: str) -> List[float]:
        """Sentiment analysis features"""
        sentiment_scores = self.sia.polarity_scores(text)
        
        return [
            sentiment_scores['compound'],
            sentiment_scores['pos'],
            sentiment_scores['neu'],
            sentiment_scores['neg'],
            abs(sentiment_scores['compound']),  # Sentiment extremity
        ]
    
    def _get_linguistic_features(self, text: str) -> List[float]:
        """Linguistic pattern features"""
        # Punctuation analysis
        exclamation_count = text.count('!')
        question_count = text.count('?')
        caps_count = sum(1 for c in text if c.isupper())
        caps_ratio = caps_count / len(text) if text else 0
        
        # Word patterns
        words = word_tokenize(text.lower())
        unique_words = set(words)
        repetition_ratio = 1 - (len(unique_words) / len(words)) if words else 0
        
        # Stop word ratio
        stop_word_count = sum(1 for word in words if word in self.stop_words)
        stop_word_ratio = stop_word_count / len(words) if words else 0
        
        return [
            exclamation_count,
            question_count,
            caps_ratio,
            repetition_ratio,
            stop_word_ratio,
            len(unique_words),  # Vocabulary richness
        ]
    
    def _get_fake_indicators(self, text: str) -> List[float]:
        """Fake review specific indicators"""
        text_lower = text.lower()
        
        features = []
        
        # Count occurrences of different indicator types
        for indicator_type, words in self.fake_indicators.items():
            count = sum(1 for word in words if word in text_lower)
            features.append(count)
        
        # Additional fake indicators
        features.extend([
            len(re.findall(r'[A-Z]{2,}', text)),  # ALL CAPS words
            len(re.findall(r'!{2,}', text)),  # Multiple exclamation marks
            len(re.findall(r'\b\d+\b', text)),  # Numbers in text
            1 if any(phrase in text_lower for phrase in ['5 stars', 'five stars', '1 star', 'one star']) else 0,
        ])
        
        return features
    
    def _get_readability_features(self, text: str) -> List[float]:
        """Text readability features"""
        words = word_tokenize(text)
        sentences = re.split(r'[.!?]+', text)
        
        # Syllable count approximation
        syllable_count = sum(self._count_syllables(word) for word in words)
        
        # Flesch Reading Ease approximation
        if len(sentences) > 0 and len(words) > 0:
            avg_sentence_length = len(words) / len(sentences)
            avg_syllables_per_word = syllable_count / len(words)
            flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        else:
            flesch_score = 0
        
        return [
            syllable_count,
            avg_syllables_per_word if words else 0,
            flesch_score,
        ]
    
    def _count_syllables(self, word: str) -> int:
        """Approximate syllable count"""
        word = word.lower()
        vowels = 'aeiouy'
        syllable_count = 0
        prev_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not prev_was_vowel:
                syllable_count += 1
            prev_was_vowel = is_vowel
        
        # Handle silent e
        if word.endswith('e'):
            syllable_count -= 1
        
        return max(1, syllable_count)

class EnhancedFakeReviewClassifier:
    """
    Enhanced fake review classifier using multiple ML algorithms and advanced features
    """
    
    def __init__(self):
        self.models = {}
        self.feature_extractors = {}
        self.scalers = {}
        self.vectorizers = {}
        self.ensemble_model = None
        self.feature_names = []
        
    def create_feature_pipeline(self) -> Pipeline:
        """Create comprehensive feature extraction pipeline"""
        
        # Text vectorization
        tfidf_word = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words='english',
            lowercase=True,
            strip_accents='unicode'
        )
        
        tfidf_char = TfidfVectorizer(
            max_features=2000,
            analyzer='char',
            ngram_range=(2, 4),
            lowercase=True
        )
        
        # Advanced text features
        text_features = AdvancedTextFeatureExtractor()
        
        # Combine all features
        feature_union = FeatureUnion([
            ('tfidf_word', tfidf_word),
            ('tfidf_char', tfidf_char),
            ('text_features', text_features),
        ])
        
        return Pipeline([
            ('features', feature_union),
            ('scaler', StandardScaler(with_mean=False))  # Sparse matrix compatible
        ])
    
    def train_individual_models(self, X_train, X_test, y_train, y_test):
        """Train individual ML models"""
        
        # Create feature pipeline
        feature_pipeline = self.create_feature_pipeline()
        
        # Transform features
        logger.info("Extracting features...")
        X_train_features = feature_pipeline.fit_transform(X_train)
        X_test_features = feature_pipeline.transform(X_test)
        
        self.feature_pipeline = feature_pipeline
        
        # Define models to train
        models_config = {
            'RandomForest': RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ),
            'GradientBoosting': GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=10,
                random_state=42
            ),
            'LogisticRegression': LogisticRegression(
                C=1.0,
                max_iter=1000,
                random_state=42,
                n_jobs=-1
            ),
            'SVM': SVC(
                C=1.0,
                kernel='rbf',
                probability=True,
                random_state=42
            ),
            'NaiveBayes': MultinomialNB(alpha=0.1)
        }
        
        # Train and evaluate each model
        for name, model in models_config.items():
            logger.info(f"Training {name}...")
            
            # Train model
            model.fit(X_train_features, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test_features)
            y_pred_proba = model.predict_proba(X_test_features)[:, 1]
            
            # Calculate metrics
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred),
                'recall': recall_score(y_test, y_pred),
                'f1_score': f1_score(y_test, y_pred),
                'roc_auc': roc_auc_score(y_test, y_pred_proba)
            }
            
            # Cross-validation
            cv_scores = cross_val_score(
                model, X_train_features, y_train, 
                cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
                scoring='f1'
            )
            metrics['cv_f1_mean'] = cv_scores.mean()
            metrics['cv_f1_std'] = cv_scores.std()
            
            self.models[name] = model
            self.models[f'{name}_metrics'] = metrics
            
            logger.info(f"{name} - F1: {metrics['f1_score']:.4f}, ROC-AUC: {metrics['roc_auc']:.4f}")
    
    def create_ensemble_model(self, X_train, y_train):
        """Create ensemble model from best performing individual models"""
        
        # Select best models based on F1 score
        model_scores = {}
        for name, model in self.models.items():
            if not name.endswith('_metrics'):
                metrics = self.models[f'{name}_metrics']
                model_scores[name] = metrics['f1_score']
        
        # Select top 3 models
        top_models = sorted(model_scores.items(), key=lambda x: x[1], reverse=True)[:3]
        
        ensemble_estimators = []
        for model_name, score in top_models:
            ensemble_estimators.append((model_name.lower(), self.models[model_name]))
            logger.info(f"Including {model_name} in ensemble (F1: {score:.4f})")
        
        # Create voting classifier
        self.ensemble_model = VotingClassifier(
            estimators=ensemble_estimators,
            voting='soft'
        )
        
        # Train ensemble
        X_train_features = self.feature_pipeline.transform(X_train)
        self.ensemble_model.fit(X_train_features, y_train)
        
        logger.info("Ensemble model created successfully")
    
    def hyperparameter_tuning(self, X_train, y_train):
        """Perform hyperparameter tuning for best model"""
        
        # Find best individual model
        best_model_name = None
        best_f1 = 0
        
        for name, model in self.models.items():
            if not name.endswith('_metrics'):
                metrics = self.models[f'{name}_metrics']
                if metrics['f1_score'] > best_f1:
                    best_f1 = metrics['f1_score']
                    best_model_name = name
        
        if best_model_name == 'RandomForest':
            param_grid = {
                'n_estimators': [100, 200, 300],
                'max_depth': [15, 20, 25],
                'min_samples_split': [2, 5, 10],
                'min_samples_leaf': [1, 2, 4]
            }
            base_model = RandomForestClassifier(random_state=42, n_jobs=-1)
            
        elif best_model_name == 'GradientBoosting':
            param_grid = {
                'n_estimators': [100, 200, 300],
                'learning_rate': [0.05, 0.1, 0.15],
                'max_depth': [8, 10, 12]
            }
            base_model = GradientBoostingClassifier(random_state=42)
            
        else:
            logger.info(f"Hyperparameter tuning not implemented for {best_model_name}")
            return
        
        logger.info(f"Performing hyperparameter tuning for {best_model_name}...")
        
        X_train_features = self.feature_pipeline.transform(X_train)
        
        grid_search = GridSearchCV(
            base_model,
            param_grid,
            cv=StratifiedKFold(n_splits=3, shuffle=True, random_state=42),
            scoring='f1',
            n_jobs=-1,
            verbose=1
        )
        
        grid_search.fit(X_train_features, y_train)
        
        self.models[f'{best_model_name}_Tuned'] = grid_search.best_estimator_
        logger.info(f"Best parameters for {best_model_name}: {grid_search.best_params_}")
        logger.info(f"Best CV F1 score: {grid_search.best_score_:.4f}")
    
    def evaluate_models(self, X_test, y_test):
        """Comprehensive model evaluation"""
        logger.info("\n" + "="*60)
        logger.info("COMPREHENSIVE MODEL EVALUATION")
        logger.info("="*60)
        
        X_test_features = self.feature_pipeline.transform(X_test)
        
        # Evaluate individual models
        for name, model in self.models.items():
            if not name.endswith('_metrics'):
                y_pred = model.predict(X_test_features)
                y_pred_proba = model.predict_proba(X_test_features)[:, 1]
                
                logger.info(f"\n{name}:")
                logger.info(f"  Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
                logger.info(f"  Precision: {precision_score(y_test, y_pred):.4f}")
                logger.info(f"  Recall:    {recall_score(y_test, y_pred):.4f}")
                logger.info(f"  F1-Score:  {f1_score(y_test, y_pred):.4f}")
                logger.info(f"  ROC-AUC:   {roc_auc_score(y_test, y_pred_proba):.4f}")
        
        # Evaluate ensemble model
        if self.ensemble_model:
            y_pred_ensemble = self.ensemble_model.predict(X_test_features)
            y_pred_proba_ensemble = self.ensemble_model.predict_proba(X_test_features)[:, 1]
            
            logger.info(f"\nEnsemble Model:")
            logger.info(f"  Accuracy:  {accuracy_score(y_test, y_pred_ensemble):.4f}")
            logger.info(f"  Precision: {precision_score(y_test, y_pred_ensemble):.4f}")
            logger.info(f"  Recall:    {recall_score(y_test, y_pred_ensemble):.4f}")
            logger.info(f"  F1-Score:  {f1_score(y_test, y_pred_ensemble):.4f}")
            logger.info(f"  ROC-AUC:   {roc_auc_score(y_test, y_pred_proba_ensemble):.4f}")
    
    def save_models(self, model_dir: str = "models"):
        """Save all trained models and components"""
        import os
        os.makedirs(model_dir, exist_ok=True)
        
        # Save feature pipeline
        joblib.dump(self.feature_pipeline, os.path.join(model_dir, 'feature_pipeline.pkl'))
        
        # Save individual models
        for name, model in self.models.items():
            if not name.endswith('_metrics'):
                joblib.dump(model, os.path.join(model_dir, f'{name.lower()}_model.pkl'))
        
        # Save ensemble model
        if self.ensemble_model:
            joblib.dump(self.ensemble_model, os.path.join(model_dir, 'ensemble_model.pkl'))
        
        # Save metrics
        with open(os.path.join(model_dir, 'model_metrics.json'), 'w') as f:
            import json
            metrics_to_save = {k: v for k, v in self.models.items() if k.endswith('_metrics')}
            json.dump(metrics_to_save, f, indent=2)
        
        logger.info(f"All models saved to {model_dir}")
    
    def load_models(self, model_dir: str = "models"):
        """Load trained models and components"""
        import os
        
        # Load feature pipeline
        pipeline_path = os.path.join(model_dir, 'feature_pipeline.pkl')
        if os.path.exists(pipeline_path):
            self.feature_pipeline = joblib.load(pipeline_path)
        
        # Load ensemble model
        ensemble_path = os.path.join(model_dir, 'ensemble_model.pkl')
        if os.path.exists(ensemble_path):
            self.ensemble_model = joblib.load(ensemble_path)
        
        logger.info(f"Models loaded from {model_dir}")
    
    def predict(self, texts: List[str]) -> Dict[str, Any]:
        """Make predictions on new texts"""
        if not hasattr(self, 'feature_pipeline') or self.ensemble_model is None:
            raise ValueError("Models not trained or loaded")
        
        # Transform features
        X_features = self.feature_pipeline.transform(texts)
        
        # Make predictions
        predictions = self.ensemble_model.predict(X_features)
        probabilities = self.ensemble_model.predict_proba(X_features)[:, 1]
        
        return {
            'predictions': predictions.tolist(),
            'probabilities': probabilities.tolist(),
            'model_type': 'ensemble'
        }

def train_enhanced_model_with_real_data():
    """Train enhanced model using real datasets"""
    from datasets import create_enhanced_training_dataset
    
    # Load enhanced dataset
    logger.info("Loading enhanced training dataset...")
    df = create_enhanced_training_dataset()
    
    if df.empty:
        logger.error("No training data available")
        return None
    
    # Prepare data
    X = df['text'].values
    y = df['label'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    logger.info(f"Training set: {len(X_train)} samples")
    logger.info(f"Test set: {len(X_test)} samples")
    logger.info(f"Fake review ratio: {y.mean():.2%}")
    
    # Initialize and train classifier
    classifier = EnhancedFakeReviewClassifier()
    
    # Train individual models
    classifier.train_individual_models(X_train, X_test, y_train, y_test)
    
    # Create ensemble
    classifier.create_ensemble_model(X_train, y_train)
    
    # Hyperparameter tuning
    classifier.hyperparameter_tuning(X_train, y_train)
    
    # Final evaluation
    classifier.evaluate_models(X_test, y_test)
    
    # Save models
    classifier.save_models()
    
    return classifier

if __name__ == "__main__":
    # Train enhanced model
    classifier = train_enhanced_model_with_real_data()
    
    if classifier:
        # Test with sample reviews
        test_reviews = [
            "This product is absolutely AMAZING!!! Best purchase ever!!! Everyone should buy this RIGHT NOW!!!",
            "I've been using this product for about 3 months. The build quality is solid and it works as expected. The battery life could be better, but overall I'm satisfied with my purchase."
        ]
        
        results = classifier.predict(test_reviews)
        
        for i, (review, pred, prob) in enumerate(zip(test_reviews, results['predictions'], results['probabilities'])):
            print(f"\nReview {i+1}: {review[:100]}...")
            print(f"Prediction: {'Fake' if pred == 1 else 'Real'}")
            print(f"Fake Probability: {prob:.3f}")
