import pandas as pd
import numpy as np
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score
from typing import Tuple, Dict

def prepare_training_data(df_features: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Prepares the dataset for training by dropping NaNs and selecting features.
    """
    # Drop rows where target or features are NaN
    df_clean = df_features.dropna().copy()
    
    # Select features for training
    feature_cols = [
        'Close', 'Volume', 'SMA_14', 'SMA_50', 'EMA_14', 'EMA_50', 
        'RSI_14', 'MACD', 'MACD_Signal', 'BB_High', 'BB_Low', 'BB_Mid', 'Daily_Return'
    ]
    
    X = df_clean[feature_cols]
    y = df_clean['Target_Direction']
    
    return X, y

def train_predictor_model(X: pd.DataFrame, y: pd.Series) -> Tuple[XGBClassifier, Dict[str, float]]:
    """
    Trains an XGBoost classifier to predict stock direction.
    Uses time-series split (no shuffling).
    """
    # Time series split: 80% train, 20% test (no shuffling)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    model = XGBClassifier(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=4,
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    metrics = {
        'Accuracy': accuracy_score(y_test, y_pred),
        'Precision': precision_score(y_test, y_pred, zero_division=0),
        'Recall': recall_score(y_test, y_pred, zero_division=0)
    }
    
    return model, metrics

def predict_future(model: XGBClassifier, current_features: pd.DataFrame) -> int:
    """
    Predicts the next day's direction (1 for Up, 0 for Down) based on latest features.
    """
    feature_cols = [
        'Close', 'Volume', 'SMA_14', 'SMA_50', 'EMA_14', 'EMA_50', 
        'RSI_14', 'MACD', 'MACD_Signal', 'BB_High', 'BB_Low', 'BB_Mid', 'Daily_Return'
    ]
    latest_data = current_features[feature_cols].iloc[-1:]
    prediction = model.predict(latest_data)
    return int(prediction[0])
