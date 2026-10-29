import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import confusion_matrix, classification_report, roc_curve, auc, precision_recall_curve
from sklearn.model_selection import learning_curve, validation_curve
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import logging
from typing import Dict, List, Tuple, Any
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelEvaluationSuite:
    """
    Comprehensive model evaluation and visualization suite
    """
    
    def __init__(self, classifier, X_test, y_test):
        self.classifier = classifier
        self.X_test = X_test
        self.y_test = y_test
        self.X_test_features = None
        self.predictions = {}
        self.probabilities = {}
        
    def prepare_predictions(self):
        """Prepare predictions for all models"""
        logger.info("Preparing predictions for evaluation...")
        
        # Transform test features
        self.X_test_features = self.classifier.feature_pipeline.transform(self.X_test)
        
        # Get predictions from all models
        for name, model in self.classifier.models.items():
            if not name.endswith('_metrics'):
                try:
                    self.predictions[name] = model.predict(self.X_test_features)
                    self.probabilities[name] = model.predict_proba(self.X_test_features)[:, 1]
                except Exception as e:
                    logger.warning(f"Could not get predictions for {name}: {e}")
        
        # Ensemble predictions
        if self.classifier.ensemble_model:
            self.predictions['Ensemble'] = self.classifier.ensemble_model.predict(self.X_test_features)
            self.probabilities['Ensemble'] = self.classifier.ensemble_model.predict_proba(self.X_test_features)[:, 1]
    
    def plot_confusion_matrices(self):
        """Plot confusion matrices for all models"""
        n_models = len(self.predictions)
        cols = min(3, n_models)
        rows = (n_models + cols - 1) // cols
        
        fig, axes = plt.subplots(rows, cols, figsize=(15, 5 * rows))
        if n_models == 1:
            axes = [axes]
        elif rows == 1:
            axes = axes.reshape(1, -1)
        
        for idx, (name, y_pred) in enumerate(self.predictions.items()):
            row = idx // cols
            col = idx % cols
            ax = axes[row, col] if rows > 1 else axes[col]
            
            cm = confusion_matrix(self.y_test, y_pred)
            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=ax)
            ax.set_title(f'{name} - Confusion Matrix')
            ax.set_xlabel('Predicted')
            ax.set_ylabel('Actual')
        
        # Hide empty subplots
        for idx in range(n_models, rows * cols):
            row = idx // cols
            col = idx % cols
            ax = axes[row, col] if rows > 1 else axes[col]
            ax.set_visible(False)
        
        plt.tight_layout()
        plt.savefig('confusion_matrices.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def plot_roc_curves(self):
        """Plot ROC curves for all models"""
        plt.figure(figsize=(10, 8))
        
        for name, y_prob in self.probabilities.items():
            fpr, tpr, _ = roc_curve(self.y_test, y_prob)
            roc_auc = auc(fpr, tpr)
            
            plt.plot(fpr, tpr, linewidth=2, 
                    label=f'{name} (AUC = {roc_auc:.3f})')
        
        plt.plot([0, 1], [0, 1], 'k--', linewidth=1)
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curves - Model Comparison')
        plt.legend(loc="lower right")
        plt.grid(True, alpha=0.3)
        plt.savefig('roc_curves.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def plot_precision_recall_curves(self):
        """Plot Precision-Recall curves for all models"""
        plt.figure(figsize=(10, 8))
        
        for name, y_prob in self.probabilities.items():
            precision, recall, _ = precision_recall_curve(self.y_test, y_prob)
            pr_auc = auc(recall, precision)
            
            plt.plot(recall, precision, linewidth=2,
                    label=f'{name} (AUC = {pr_auc:.3f})')
        
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title('Precision-Recall Curves - Model Comparison')
        plt.legend(loc="lower left")
        plt.grid(True, alpha=0.3)
        plt.savefig('precision_recall_curves.png', dpi=300, bbox_inches='tight')
        plt.show()
    
    def create_interactive_model_comparison(self):
        """Create interactive model comparison dashboard"""
        
        # Prepare data for comparison
        model_metrics = []
        
        for name, y_pred in self.predictions.items():
            y_prob = self.probabilities[name]
            
            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
            
            metrics = {
                'Model': name,
                'Accuracy': accuracy_score(self.y_test, y_pred),
                'Precision': precision_score(self.y_test, y_pred),
                'Recall': recall_score(self.y_test, y_pred),
                'F1-Score': f1_score(self.y_test, y_pred),
                'ROC-AUC': roc_auc_score(self.y_test, y_prob)
            }
            model_metrics.append(metrics)
        
        df_metrics = pd.DataFrame(model_metrics)
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Model Performance Metrics', 'ROC Curves', 
                          'Precision-Recall Curves', 'Feature Importance'),
            specs=[[{"type": "bar"}, {"type": "scatter"}],
                   [{"type": "scatter"}, {"type": "bar"}]]
        )
        
        # 1. Performance metrics bar chart
        metrics_to_plot = ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'ROC-AUC']
        for metric in metrics_to_plot:
            fig.add_trace(
                go.Bar(x=df_metrics['Model'], y=df_metrics[metric], name=metric),
                row=1, col=1
            )
        
        # 2. ROC Curves
        for name, y_prob in self.probabilities.items():
            fpr, tpr, _ = roc_curve(self.y_test, y_prob)
            roc_auc = auc(fpr, tpr)
            
            fig.add_trace(
                go.Scatter(x=fpr, y=tpr, mode='lines', 
                          name=f'{name} (AUC={roc_auc:.3f})'),
                row=1, col=2
            )
        
        # Add diagonal line for ROC
        fig.add_trace(
            go.Scatter(x=[0, 1], y=[0, 1], mode='lines', 
                      line=dict(dash='dash', color='black'),
                      name='Random', showlegend=False),
            row=1, col=2
        )
        
        # 3. Precision-Recall Curves
        for name, y_prob in self.probabilities.items():
            precision, recall, _ = precision_recall_curve(self.y_test, y_prob)
            pr_auc = auc(recall, precision)
            
            fig.add_trace(
                go.Scatter(x=recall, y=precision, mode='lines',
                          name=f'{name} (AUC={pr_auc:.3f})'),
                row=2, col=1
            )
        
        # 4. Feature importance (for tree-based models)
        if 'RandomForest' in self.classifier.models:
            rf_model = self.classifier.models['RandomForest']
            if hasattr(rf_model, 'feature_importances_'):
                # Get feature names (simplified)
                n_features = len(rf_model.feature_importances_)
                feature_names = [f'Feature_{i}' for i in range(n_features)]
                
                # Get top 20 features
                importance_df = pd.DataFrame({
                    'feature': feature_names,
                    'importance': rf_model.feature_importances_
                }).sort_values('importance', ascending=True).tail(20)
                
                fig.add_trace(
                    go.Bar(x=importance_df['importance'], y=importance_df['feature'],
                          orientation='h', name='Feature Importance'),
                    row=2, col=2
                )
        
        # Update layout
        fig.update_layout(
            height=800,
            title_text="Fake Review Detection - Model Evaluation Dashboard",
            showlegend=True
        )
        
        # Update axes labels
        fig.update_xaxes(title_text="Models", row=1, col=1)
        fig.update_yaxes(title_text="Score", row=1, col=1)
        fig.update_xaxes(title_text="False Positive Rate", row=1, col=2)
        fig.update_yaxes(title_text="True Positive Rate", row=1, col=2)
        fig.update_xaxes(title_text="Recall", row=2, col=1)
        fig.update_yaxes(title_text="Precision", row=2, col=1)
        fig.update_xaxes(title_text="Importance", row=2, col=2)
        
        fig.write_html("model_evaluation_dashboard.html")
        fig.show()
    
    def analyze_prediction_errors(self):
        """Analyze prediction errors in detail"""
        
        # Use ensemble model for error analysis
        if 'Ensemble' in self.predictions:
            y_pred = self.predictions['Ensemble']
            y_prob = self.probabilities['Ensemble']
        else:
            # Use best performing model
            best_model = max(self.predictions.keys(), 
                           key=lambda x: f1_score(self.y_test, self.predictions[x]))
            y_pred = self.predictions[best_model]
            y_prob = self.probabilities[best_model]
        
        # Identify different types of errors
        true_positives = (self.y_test == 1) & (y_pred == 1)
        true_negatives = (self.y_test == 0) & (y_pred == 0)
        false_positives = (self.y_test == 0) & (y_pred == 1)
        false_negatives = (self.y_test == 1) & (y_pred == 0)
        
        # Create error analysis DataFrame
        error_analysis = pd.DataFrame({
            'text': self.X_test,
            'true_label': self.y_test,
            'predicted_label': y_pred,
            'probability': y_prob,
            'error_type': ['Correct' if tp or tn else 
                          'False Positive' if fp else 'False Negative'
                          for tp, tn, fp, fn in zip(true_positives, true_negatives, 
                                                   false_positives, false_negatives)]
        })
        
        # Analyze error patterns
        logger.info("\nError Analysis:")
        logger.info(f"True Positives: {true_positives.sum()}")
        logger.info(f"True Negatives: {true_negatives.sum()}")
        logger.info(f"False Positives: {false_positives.sum()}")
        logger.info(f"False Negatives: {false_negatives.sum()}")
        
        # Show examples of each error type
        for error_type in ['False Positive', 'False Negative']:
            examples = error_analysis[error_analysis['error_type'] == error_type].head(3)
            logger.info(f"\n{error_type} Examples:")
            for idx, row in examples.iterrows():
                logger.info(f"  Text: {row['text'][:100]}...")
                logger.info(f"  True: {row['true_label']}, Predicted: {row['predicted_label']}, Prob: {row['probability']:.3f}")
        
        return error_analysis
    
    def generate_evaluation_report(self):
        """Generate comprehensive evaluation report"""
        
        report = {
            'dataset_info': {
                'test_samples': len(self.y_test),
                'fake_ratio': self.y_test.mean(),
                'real_ratio': 1 - self.y_test.mean()
            },
            'model_performance': {},
            'best_model': None,
            'recommendations': []
        }
        
        # Calculate metrics for all models
        best_f1 = 0
        best_model_name = None
        
        for name, y_pred in self.predictions.items():
            y_prob = self.probabilities[name]
            
            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
            
            metrics = {
                'accuracy': accuracy_score(self.y_test, y_pred),
                'precision': precision_score(self.y_test, y_pred),
                'recall': recall_score(self.y_test, y_pred),
                'f1_score': f1_score(self.y_test, y_pred),
                'roc_auc': roc_auc_score(self.y_test, y_prob)
            }
            
            report['model_performance'][name] = metrics
            
            if metrics['f1_score'] > best_f1:
                best_f1 = metrics['f1_score']
                best_model_name = name
        
        report['best_model'] = best_model_name
        
        # Generate recommendations
        if best_f1 > 0.9:
            report['recommendations'].append("Excellent model performance. Ready for production.")
        elif best_f1 > 0.8:
            report['recommendations'].append("Good model performance. Consider additional feature engineering.")
        else:
            report['recommendations'].append("Model needs improvement. Consider more training data or different algorithms.")
        
        # Check for class imbalance issues
        if abs(self.y_test.mean() - 0.5) > 0.3:
            report['recommendations'].append("Dataset is imbalanced. Consider using balanced sampling or cost-sensitive learning.")
        
        # Save report
        import json
        with open('evaluation_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info("\nEvaluation Report Generated:")
        logger.info(f"Best Model: {best_model_name} (F1: {best_f1:.4f})")
        logger.info("Recommendations:")
        for rec in report['recommendations']:
            logger.info(f"  - {rec}")
        
        return report

def run_comprehensive_evaluation():
    """Run comprehensive model evaluation"""
    
    # Load trained classifier
    try:
        from enhanced_ml_model import EnhancedFakeReviewClassifier
        classifier = EnhancedFakeReviewClassifier()
        classifier.load_models()
        
        # Load test data (you would load your actual test data here)
        from datasets import create_enhanced_training_dataset
        df = create_enhanced_training_dataset()
        
        if df.empty:
            logger.error("No test data available")
            return
        
        # Split for evaluation
        from sklearn.model_selection import train_test_split
        X = df['text'].values
        y = df['label'].values
        
        _, X_test, _, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Run evaluation
        evaluator = ModelEvaluationSuite(classifier, X_test, y_test)
        evaluator.prepare_predictions()
        
        # Generate all visualizations and reports
        evaluator.plot_confusion_matrices()
        evaluator.plot_roc_curves()
        evaluator.plot_precision_recall_curves()
        evaluator.create_interactive_model_comparison()
        
        # Error analysis
        error_analysis = evaluator.analyze_prediction_errors()
        
        # Generate final report
        report = evaluator.generate_evaluation_report()
        
        logger.info("Comprehensive evaluation completed!")
        
    except Exception as e:
        logger.error(f"Error during evaluation: {e}")

if __name__ == "__main__":
    run_comprehensive_evaluation()
