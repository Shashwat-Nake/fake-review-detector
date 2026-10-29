import pandas as pd
import numpy as np
import requests
import zipfile
import os
from typing import Dict, List, Tuple, Optional
import logging
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FakeReviewDatasetManager:
    """
    Manager for downloading and preprocessing real fake review datasets
    """
    
    def __init__(self, data_dir: str = "datasets"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Dataset configurations
        self.datasets = {
            "yelp_chi": {
                "url": "https://github.com/shuchenliu/SyntheticFakeReviewGeneration/raw/master/data/YelpChi.zip",
                "description": "YelpChi dataset with labeled fake/real reviews",
                "size": "~50MB"
            },
            "deceptive_opinion_spam": {
                "url": "https://myleott.com/op_spam/op_spam.tar.gz",
                "description": "Deceptive Opinion Spam Corpus v1.4",
                "size": "~2MB"
            },
            "amazon_reviews": {
                "url": "https://snap.stanford.edu/data/amazon/productGraph/categoryFiles/reviews_Electronics_5.json.gz",
                "description": "Amazon Electronics Reviews (subset)",
                "size": "~1.6GB"
            }
        }
    
    def download_dataset(self, dataset_name: str) -> bool:
        """Download a specific dataset"""
        if dataset_name not in self.datasets:
            logger.error(f"Unknown dataset: {dataset_name}")
            return False
        
        dataset_info = self.datasets[dataset_name]
        url = dataset_info["url"]
        
        # Create dataset directory
        dataset_dir = os.path.join(self.data_dir, dataset_name)
        os.makedirs(dataset_dir, exist_ok=True)
        
        filename = url.split("/")[-1]
        filepath = os.path.join(dataset_dir, filename)
        
        if os.path.exists(filepath):
            logger.info(f"Dataset {dataset_name} already exists")
            return True
        
        try:
            logger.info(f"Downloading {dataset_name} from {url}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded {dataset_name} successfully")
            
            # Extract if it's a compressed file
            if filename.endswith('.zip'):
                with zipfile.ZipFile(filepath, 'r') as zip_ref:
                    zip_ref.extractall(dataset_dir)
            elif filename.endswith('.tar.gz'):
                import tarfile
                with tarfile.open(filepath, 'r:gz') as tar_ref:
                    tar_ref.extractall(dataset_dir)
            
            return True
            
        except Exception as e:
            logger.error(f"Error downloading {dataset_name}: {e}")
            return False
    
    def load_yelp_chi_dataset(self) -> pd.DataFrame:
        """Load and preprocess YelpChi dataset"""
        dataset_dir = os.path.join(self.data_dir, "yelp_chi")
        
        # Look for CSV files in the dataset directory
        csv_files = [f for f in os.listdir(dataset_dir) if f.endswith('.csv')]
        
        if not csv_files:
            logger.error("No CSV files found in YelpChi dataset")
            return pd.DataFrame()
        
        # Load the main dataset file
        df = pd.read_csv(os.path.join(dataset_dir, csv_files[0]))
        
        # Standardize column names
        column_mapping = {
            'review_text': 'text',
            'reviewText': 'text',
            'content': 'text',
            'is_fake': 'label',
            'fake': 'label',
            'deceptive': 'label',
            'rating': 'rating',
            'stars': 'rating',
            'reviewer_id': 'user_id',
            'user_id': 'user_id'
        }
        
        for old_col, new_col in column_mapping.items():
            if old_col in df.columns:
                df = df.rename(columns={old_col: new_col})
        
        # Ensure we have required columns
        if 'text' not in df.columns:
            logger.error("No text column found in dataset")
            return pd.DataFrame()
        
        # Create binary labels if needed
        if 'label' in df.columns:
            if df['label'].dtype == 'object':
                # Convert string labels to binary
                df['label'] = df['label'].map({
                    'fake': 1, 'real': 0, 'deceptive': 1, 'truthful': 0,
                    'True': 1, 'False': 0, True: 1, False: 0
                })
        else:
            # If no label column, create synthetic labels based on patterns
            df['label'] = self._create_synthetic_labels(df['text'])
        
        return df.dropna(subset=['text', 'label'])
    
    def load_deceptive_opinion_spam_dataset(self) -> pd.DataFrame:
        """Load and preprocess Deceptive Opinion Spam dataset"""
        dataset_dir = os.path.join(self.data_dir, "deceptive_opinion_spam")
        
        data = []
        
        # Walk through the directory structure
        for root, dirs, files in os.walk(dataset_dir):
            for file in files:
                if file.endswith('.txt'):
                    filepath = os.path.join(root, file)
                    
                    # Extract labels from directory structure
                    path_parts = root.split(os.sep)
                    
                    # Determine if deceptive or truthful
                    is_deceptive = 'deceptive' in path_parts
                    
                    # Read the review text
                    try:
                        with open(filepath, 'r', encoding='utf-8') as f:
                            text = f.read().strip()
                        
                        data.append({
                            'text': text,
                            'label': 1 if is_deceptive else 0,
                            'source': 'deceptive_opinion_spam'
                        })
                    except Exception as e:
                        logger.warning(f"Error reading file {filepath}: {e}")
        
        return pd.DataFrame(data)
    
    def load_amazon_reviews_sample(self, sample_size: int = 10000) -> pd.DataFrame:
        """Load and preprocess a sample of Amazon reviews"""
        dataset_dir = os.path.join(self.data_dir, "amazon_reviews")
        
        # Look for JSON files
        json_files = [f for f in os.listdir(dataset_dir) if f.endswith('.json') or f.endswith('.json.gz')]
        
        if not json_files:
            logger.error("No JSON files found in Amazon reviews dataset")
            return pd.DataFrame()
        
        filepath = os.path.join(dataset_dir, json_files[0])
        
        data = []
        count = 0
        
        try:
            if filepath.endswith('.gz'):
                import gzip
                file_opener = gzip.open
            else:
                file_opener = open
            
            with file_opener(filepath, 'rt', encoding='utf-8') as f:
                for line in f:
                    if count >= sample_size:
                        break
                    
                    try:
                        review = json.loads(line.strip())
                        
                        # Extract relevant fields
                        text = review.get('reviewText', '')
                        rating = review.get('overall', 0)
                        verified = review.get('verified', False)
                        helpful = review.get('helpful', [0, 0])
                        
                        if text and len(text) > 20:  # Filter out very short reviews
                            # Create synthetic fake labels based on patterns
                            fake_score = self._calculate_fake_probability(text, rating, verified, helpful)
                            
                            data.append({
                                'text': text,
                                'rating': rating,
                                'verified': verified,
                                'helpful_votes': helpful[0] if len(helpful) > 0 else 0,
                                'total_votes': helpful[1] if len(helpful) > 1 else 0,
                                'label': 1 if fake_score > 0.7 else 0,
                                'fake_probability': fake_score,
                                'source': 'amazon'
                            })
                            count += 1
                    
                    except json.JSONDecodeError:
                        continue
        
        except Exception as e:
            logger.error(f"Error loading Amazon reviews: {e}")
            return pd.DataFrame()
        
        return pd.DataFrame(data)
    
    def _create_synthetic_labels(self, texts: pd.Series) -> pd.Series:
        """Create synthetic fake labels based on text patterns"""
        labels = []
        
        for text in texts:
            fake_prob = self._calculate_fake_probability(text)
            labels.append(1 if fake_prob > 0.6 else 0)
        
        return pd.Series(labels)
    
    def _calculate_fake_probability(self, text: str, rating: Optional[int] = None, 
                                  verified: bool = True, helpful: List[int] = None) -> float:
        """Calculate fake probability based on various indicators"""
        if not text:
            return 0.5
        
        text_lower = text.lower()
        fake_score = 0.0
        
        # Text-based indicators
        exclamation_count = text.count('!')
        if exclamation_count > 3:
            fake_score += 0.2
        
        caps_ratio = sum(1 for c in text if c.isupper()) / len(text)
        if caps_ratio > 0.1:
            fake_score += 0.15
        
        # Superlative words
        superlatives = ['best', 'worst', 'amazing', 'terrible', 'perfect', 'awful', 'incredible']
        superlative_count = sum(1 for word in superlatives if word in text_lower)
        if superlative_count > 2:
            fake_score += 0.2
        
        # Generic phrases
        generic_phrases = ['highly recommend', 'must buy', 'waste of money', 'life changing']
        if any(phrase in text_lower for phrase in generic_phrases):
            fake_score += 0.15
        
        # Length indicators
        if len(text) < 50:
            fake_score += 0.1
        elif len(text) > 1000:
            fake_score += 0.05
        
        # Rating-based indicators
        if rating is not None:
            if rating in [1, 5]:  # Extreme ratings
                fake_score += 0.1
        
        # Verification indicators
        if not verified:
            fake_score += 0.1
        
        # Helpful votes indicators
        if helpful and len(helpful) >= 2:
            total_votes = helpful[1]
            if total_votes > 0:
                helpful_ratio = helpful[0] / total_votes
                if helpful_ratio < 0.3:  # Low helpfulness
                    fake_score += 0.05
        
        return min(fake_score, 0.95)
    
    def load_curated_review_dataset(self) -> pd.DataFrame:
        """Load the curated labeled examples used to calibrate the detector."""
        fake_reviews = [
            "This product is amazing! Best product ever! Everyone should buy it now!!!",
            "Best purchase of my entire life. Excellent quality, excellent service, excellent everything!",
            "Amazing product!!! Must buy!!! 100% recommended to everyone!!!",
            "Don't think twice. Buy this now. You will never regret it. Best deal ever!",
            "Wonderful fantastic unbelievable product!!! Five stars for this legendary product!!!",
            "Seller is the best seller in the world. Super fast delivery and unbelievable quality.",
            "Perfect product, perfect price, perfect quality. Just buy it immediately!",
            "Five stars!!! Best product ever made. No competition. Everyone must purchase this immediately!!!",
        ]
        genuine_reviews = [
            "I received the product yesterday. The packaging was good, but the battery lasts only around four hours.",
            "The shoes fit well, but the sole feels a little hard after walking for a long time.",
            "I have used this phone for two weeks. The camera is good in daylight, but night photos are blurry.",
            "The delivery arrived two days late. However, the product works as described.",
            "The material is thinner than I expected. It is usable, but I would prefer a better-quality fabric.",
            "I bought this as a gift. The design looks nice, and the recipient liked it.",
            "The laptop runs smoothly for daily tasks, although it gets warm when I use multiple applications.",
        ]
        return pd.DataFrame(
            [{"text": text, "label": 1, "source": "curated_examples"} for text in fake_reviews]
            + [{"text": text, "label": 0, "source": "curated_examples"} for text in genuine_reviews]
        )

    def create_combined_dataset(self, datasets: List[str] = None) -> pd.DataFrame:
        """Combine multiple datasets into one training dataset"""
        if datasets is None:
            datasets = ['curated_reviews', 'yelp_chi', 'deceptive_opinion_spam']
        
        combined_data = []
        
        for dataset_name in datasets:
            logger.info(f"Loading {dataset_name} dataset...")
            
            if dataset_name == 'curated_reviews':
                df = self.load_curated_review_dataset()
            elif dataset_name == 'yelp_chi':
                df = self.load_yelp_chi_dataset()
            elif dataset_name == 'deceptive_opinion_spam':
                df = self.load_deceptive_opinion_spam_dataset()
            elif dataset_name == 'amazon_reviews':
                df = self.load_amazon_reviews_sample()
            else:
                logger.warning(f"Unknown dataset: {dataset_name}")
                continue
            
            if not df.empty:
                df['dataset_source'] = dataset_name
                combined_data.append(df)
                logger.info(f"Loaded {len(df)} samples from {dataset_name}")
        
        if not combined_data:
            logger.error("No datasets loaded successfully")
            return pd.DataFrame()
        
        # Combine all datasets
        combined_df = pd.concat(combined_data, ignore_index=True)
        
        # Clean and standardize
        combined_df = combined_df.dropna(subset=['text', 'label'])
        combined_df['text'] = combined_df['text'].astype(str)
        combined_df['label'] = combined_df['label'].astype(int)
        
        logger.info(f"Combined dataset created with {len(combined_df)} total samples")
        logger.info(f"Fake review ratio: {combined_df['label'].mean():.2%}")
        
        return combined_df
    
    def download_all_datasets(self) -> Dict[str, bool]:
        """Download all available datasets"""
        results = {}
        
        for dataset_name in self.datasets:
            logger.info(f"Downloading {dataset_name}...")
            results[dataset_name] = self.download_dataset(dataset_name)
        
        return results
    
    def get_dataset_info(self) -> Dict[str, Dict]:
        """Get information about available datasets"""
        return self.datasets

# Kaggle dataset integration
class KaggleDatasetManager:
    """
    Manager for Kaggle datasets (requires Kaggle API)
    """
    
    def __init__(self, data_dir: str = "datasets/kaggle"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        
        # Popular Kaggle datasets for fake review detection
        self.kaggle_datasets = {
            "fake-reviews-dataset": {
                "dataset_id": "lievgarcia/fake-reviews-dataset",
                "description": "Fake Reviews Dataset with labeled data"
            },
            "amazon-fake-reviews": {
                "dataset_id": "akashkr/amazon-fake-reviews",
                "description": "Amazon Fake Reviews Dataset"
            },
            "fake-job-postings": {
                "dataset_id": "shivamb/real-or-fake-fake-jobposting-prediction",
                "description": "Real or Fake Job Posting Prediction"
            }
        }
    
    def setup_kaggle_api(self) -> bool:
        """Setup Kaggle API credentials"""
        try:
            import kaggle
            from kaggle.api.kaggle_api_extended import KaggleApi
            
            api = KaggleApi()
            api.authenticate()
            self.kaggle_api = api
            return True
            
        except Exception as e:
            logger.error(f"Failed to setup Kaggle API: {e}")
            logger.info("Please install kaggle package and setup API credentials")
            logger.info("Instructions: https://github.com/Kaggle/kaggle-api")
            return False
    
    def download_kaggle_dataset(self, dataset_key: str) -> bool:
        """Download a dataset from Kaggle"""
        if not hasattr(self, 'kaggle_api'):
            if not self.setup_kaggle_api():
                return False
        
        if dataset_key not in self.kaggle_datasets:
            logger.error(f"Unknown Kaggle dataset: {dataset_key}")
            return False
        
        dataset_info = self.kaggle_datasets[dataset_key]
        dataset_id = dataset_info["dataset_id"]
        
        try:
            download_path = os.path.join(self.data_dir, dataset_key)
            os.makedirs(download_path, exist_ok=True)
            
            logger.info(f"Downloading Kaggle dataset: {dataset_id}")
            self.kaggle_api.dataset_download_files(
                dataset_id, 
                path=download_path, 
                unzip=True
            )
            
            logger.info(f"Successfully downloaded {dataset_key}")
            return True
            
        except Exception as e:
            logger.error(f"Error downloading Kaggle dataset {dataset_key}: {e}")
            return False
    
    def load_kaggle_fake_reviews_dataset(self) -> pd.DataFrame:
        """Load the main fake reviews dataset from Kaggle"""
        dataset_path = os.path.join(self.data_dir, "fake-reviews-dataset")
        
        # Look for CSV files
        csv_files = []
        if os.path.exists(dataset_path):
            csv_files = [f for f in os.listdir(dataset_path) if f.endswith('.csv')]
        
        if not csv_files:
            logger.error("No CSV files found in Kaggle fake reviews dataset")
            return pd.DataFrame()
        
        # Load the main CSV file
        df = pd.read_csv(os.path.join(dataset_path, csv_files[0]))
        
        # Standardize columns
        if 'text_' in df.columns:
            df = df.rename(columns={'text_': 'text'})
        if 'label_' in df.columns:
            df = df.rename(columns={'label_': 'label'})
        
        # Convert labels to binary if needed
        if 'label' in df.columns and df['label'].dtype == 'object':
            label_encoder = LabelEncoder()
            df['label'] = label_encoder.fit_transform(df['label'])
        
        return df.dropna(subset=['text', 'label'])

def create_enhanced_training_dataset() -> pd.DataFrame:
    """Create an enhanced training dataset using multiple sources"""
    
    # Initialize dataset managers
    dataset_manager = FakeReviewDatasetManager()
    kaggle_manager = KaggleDatasetManager()
    
    # Download datasets
    logger.info("Downloading datasets...")
    dataset_results = dataset_manager.download_all_datasets()
    
    # Try to download Kaggle datasets
    if kaggle_manager.setup_kaggle_api():
        for dataset_key in kaggle_manager.kaggle_datasets:
            kaggle_manager.download_kaggle_dataset(dataset_key)
    
    # Load and combine datasets
    datasets_to_combine = []
    
    # Load traditional datasets
    combined_df = dataset_manager.create_combined_dataset()
    if not combined_df.empty:
        datasets_to_combine.append(combined_df)
    
    # Load Kaggle datasets
    kaggle_df = kaggle_manager.load_kaggle_fake_reviews_dataset()
    if not kaggle_df.empty:
        kaggle_df['dataset_source'] = 'kaggle_fake_reviews'
        datasets_to_combine.append(kaggle_df)
    
    # Combine all datasets
    if datasets_to_combine:
        final_dataset = pd.concat(datasets_to_combine, ignore_index=True)
        
        # Final cleaning and balancing
        final_dataset = final_dataset.dropna(subset=['text', 'label'])
        final_dataset = final_dataset[final_dataset['text'].str.len() > 10]  # Remove very short texts
        
        # Balance the dataset if needed
        fake_count = (final_dataset['label'] == 1).sum()
        real_count = (final_dataset['label'] == 0).sum()
        
        logger.info(f"Final dataset statistics:")
        logger.info(f"Total samples: {len(final_dataset)}")
        logger.info(f"Fake reviews: {fake_count} ({fake_count/len(final_dataset):.2%})")
        logger.info(f"Real reviews: {real_count} ({real_count/len(final_dataset):.2%})")
        
        return final_dataset
    
    else:
        logger.error("No datasets could be loaded")
        return pd.DataFrame()

if __name__ == "__main__":
    # Create enhanced dataset
    enhanced_dataset = create_enhanced_training_dataset()
    
    if not enhanced_dataset.empty:
        # Save the dataset
        output_path = "datasets/enhanced_fake_review_dataset.csv"
        enhanced_dataset.to_csv(output_path, index=False)
        logger.info(f"Enhanced dataset saved to {output_path}")
        
        # Display sample statistics
        print("\nDataset Sample:")
        print(enhanced_dataset.head())
        print(f"\nDataset Shape: {enhanced_dataset.shape}")
        print(f"Columns: {list(enhanced_dataset.columns)}")
