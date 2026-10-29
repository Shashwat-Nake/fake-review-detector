import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
import pickle
import logging
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from transformers import DataCollatorWithPadding
import torch
from torch.utils.data import Dataset
from data_preprocessing import ReviewDataPreprocessor, create_synthetic_dataset

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ReviewDataset(Dataset):
    """Custom dataset for BERT training"""
    
    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length
    
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]
        
        encoding = self.tokenizer(
            text,
            truncation=True,
            padding='max_length',
            max_length=self.max_length,
            return_tensors='pt'
        )
        
        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class FakeReviewModelTrainer:
    """Comprehensive model trainer for fake review detection"""
    
    def __init__(self):
        self.models = {}
        self.metrics = {}
        self.preprocessor = ReviewDataPreprocessor()
    
    def train_traditional_models(self, X_train, X_test, y_train, y_test):
        """Train traditional ML models"""
        
        # Define models to train
        models_to_train = {
            'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
            'GradientBoosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'LogisticRegression': LogisticRegression(random_state=42, max_iter=1000),
            'SVM': SVC(kernel='rbf', random_state=42, probability=True)
        }
        
        for name, model in models_to_train.items():
            logger.info(f"Training {name}...")
            
            # Train model
            model.fit(X_train, y_train)
            
            # Make predictions
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1] if hasattr(model, 'predict_proba') else None
            
            # Calculate metrics
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred),
                'recall': recall_score(y_test, y_pred),
                'f1_score': f1_score(y_test, y_pred)
            }
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='f1')
            metrics['cv_f1_mean'] = cv_scores.mean()
            metrics['cv_f1_std'] = cv_scores.std()
            
            self.models[name] = model
            self.metrics[name] = metrics
            
            logger.info(f"{name} - Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1_score']:.4f}")
    
    def train_bert_model(self, texts_train, texts_test, y_train, y_test, model_name='distilbert-base-uncased'):
        """Train BERT-based model"""
        logger.info(f"Training BERT model: {model_name}")
        
        # Initialize tokenizer and model
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
        
        # Create datasets
        train_dataset = ReviewDataset(texts_train, y_train, tokenizer)
        test_dataset = ReviewDataset(texts_test, y_test, tokenizer)
        
        # Data collator
        data_collator = DataCollatorWithPadding(tokenizer=tokenizer)
        
        # Training arguments
        training_args = TrainingArguments(
            output_dir='./bert_results',
            num_train_epochs=3,
            per_device_train_batch_size=16,
            per_device_eval_batch_size=16,
            warmup_steps=500,
            weight_decay=0.01,
            logging_dir='./logs',
            logging_steps=10,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            metric_for_best_model="eval_loss",
        )
        
        # Initialize trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=test_dataset,
            data_collator=data_collator,
        )
        
        # Train model
        trainer.train()
        
        # Evaluate
        eval_results = trainer.evaluate()
        
        # Save model
        model.save_pretrained('./bert_fake_review_model')
        tokenizer.save_pretrained('./bert_fake_review_model')
        
        self.models['BERT'] = model
        self.metrics['BERT'] = eval_results
        
        logger.info(f"BERT training completed. Eval loss: {eval_results['eval_loss']:.4f}")
    
    def hyperparameter_tuning(self, X_train, y_train):
        """Perform hyperparameter tuning for best traditional model"""
        
        # Random Forest tuning
        rf_params = {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        logger.info("Performing hyperparameter tuning for Random Forest...")
        rf_grid = GridSearchCV(
            RandomForestClassifier(random_state=42),
            rf_params,
            cv=5,
            scoring='f1',
            n_jobs=-1,
            verbose=1
        )
        
        rf_grid.fit(X_train, y_train)
        
        self.models['RandomForest_Tuned'] = rf_grid.best_estimator_
        logger.info(f"Best RF parameters: {rf_grid.best_params_}")
        logger.info(f"Best RF CV score: {rf_grid.best_score_:.4f}")
        
        return rf_grid.best_estimator_
    
    def ensemble_model(self, X_train, X_test, y_train, y_test):
        """Create ensemble model combining multiple approaches"""
        from sklearn.ensemble import VotingClassifier
        
        # Select best performing models
        best_models = [
            ('rf', self.models.get('RandomForest_Tuned', self.models['RandomForest'])),
            ('gb', self.models['GradientBoosting']),
            ('lr', self.models['LogisticRegression'])
        ]
        
        # Create voting classifier
        ensemble = VotingClassifier(estimators=best_models, voting='soft')
        ensemble.fit(X_train, y_train)
        
        # Evaluate ensemble
        y_pred = ensemble.predict(X_test)
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1_score': f1_score(y_test, y_pred)
        }
        
        self.models['Ensemble'] = ensemble
        self.metrics['Ensemble'] = metrics
        
        logger.info(f"Ensemble - Accuracy: {metrics['accuracy']:.4f}, F1: {metrics['f1_score']:.4f}")
    
    def evaluate_all_models(self):
        """Print comprehensive evaluation of all models"""
        logger.info("\n" + "="*50)
        logger.info("MODEL EVALUATION SUMMARY")
        logger.info("="*50)
        
        for model_name, metrics in self.metrics.items():
            if model_name != 'BERT':  # BERT metrics are different format
                logger.info(f"\n{model_name}:")
                logger.info(f"  Accuracy:  {metrics['accuracy']:.4f}")
                logger.info(f"  Precision: {metrics['precision']:.4f}")
                logger.info(f"  Recall:    {metrics['recall']:.4f}")
                logger.info(f"  F1-Score:  {metrics['f1_score']:.4f}")
                if 'cv_f1_mean' in metrics:
                    logger.info(f"  CV F1:     {metrics['cv_f1_mean']:.4f} ± {metrics['cv_f1_std']:.4f}")
    
    def save_models(self):
        """Save all trained models"""
        for name, model in self.models.items():
            if name != 'BERT':  # BERT is saved separately
                with open(f'{name.lower()}_model.pkl', 'wb') as f:
                    pickle.dump(model, f)
        
        # Save metrics
        with open('model_metrics.pkl', 'wb') as f:
            pickle.dump(self.metrics, f)
        
        logger.info("All models saved successfully")

def main():
    """Main training pipeline"""
    
    # Create synthetic dataset (replace with real datasets in production)
    logger.info("Creating synthetic dataset...")
    df = create_synthetic_dataset(2000)  # Larger dataset for better training
    
    # Initialize trainer
    trainer = FakeReviewModelTrainer()
    
    # Prepare data
    logger.info("Preparing data...")
    features, labels, feature_names = trainer.preprocessor.prepare_training_data([df])
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        features, labels, test_size=0.2, random_state=42, stratify=labels
    )
    
    # Also prepare text data for BERT
    texts = df['text'].values
    texts_train, texts_test = train_test_split(
        texts, test_size=0.2, random_state=42, stratify=labels
    )
    
    logger.info(f"Training set: {X_train.shape[0]} samples")
    logger.info(f"Test set: {X_test.shape[0]} samples")
    logger.info(f"Features: {X_train.shape[1]}")
    
    # Train traditional models
    trainer.train_traditional_models(X_train, X_test, y_train, y_test)
    
    # Hyperparameter tuning
    trainer.hyperparameter_tuning(X_train, y_train)
    
    # Create ensemble
    trainer.ensemble_model(X_train, X_test, y_train, y_test)
    
    # Train BERT model (optional - requires more computational resources)
    try:
        trainer.train_bert_model(texts_train, texts_test, y_train, y_test)
    except Exception as e:
        logger.warning(f"BERT training failed: {e}")
    
    # Evaluate all models
    trainer.evaluate_all_models()
    
    # Save models
    trainer.save_models()
    
    # Save preprocessor
    trainer.preprocessor.save_preprocessor('preprocessor.pkl')
    
    logger.info("Training pipeline completed successfully!")

if __name__ == "__main__":
    main()
