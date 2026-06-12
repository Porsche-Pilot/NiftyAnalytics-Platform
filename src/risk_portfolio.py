import pandas as pd
import numpy as np
from typing import Dict, Tuple

def calculate_annualized_volatility(daily_returns: pd.Series) -> float:
    """
    Calculates annualized volatility assuming 252 trading days.
    """
    if len(daily_returns) < 2:
        return 0.0
    return daily_returns.std() * np.sqrt(252)

def calculate_sharpe_ratio(daily_returns: pd.Series, risk_free_rate: float = 0.05) -> float:
    """
    Calculates annualized Sharpe Ratio.
    """
    if len(daily_returns) < 2:
        return 0.0
    
    annualized_return = daily_returns.mean() * 252
    annualized_vol = calculate_annualized_volatility(daily_returns)
    
    if annualized_vol == 0:
        return 0.0
    
    return (annualized_return - risk_free_rate) / annualized_vol

def calculate_max_drawdown(prices: pd.Series) -> float:
    """
    Calculates the Maximum Drawdown.
    """
    if len(prices) == 0:
        return 0.0
    
    rolling_max = prices.cummax()
    drawdown = (prices - rolling_max) / rolling_max
    max_dd = drawdown.min()
    return max_dd

def assess_risk(df_features: pd.DataFrame) -> Dict[str, float]:
    """
    Calculates various risk metrics for a single stock.
    Requires 'Close' and 'Daily_Return' columns.
    """
    metrics = {
        'Annualized Volatility': calculate_annualized_volatility(df_features['Daily_Return']),
        'Sharpe Ratio': calculate_sharpe_ratio(df_features['Daily_Return']),
        'Max Drawdown': calculate_max_drawdown(df_features['Close'])
    }
    return metrics

def build_portfolio(risk_profile: str) -> Dict[str, float]:
    """
    Returns a sample portfolio allocation based on risk profile.
    Profiles: 'Conservative', 'Balanced', 'Aggressive'
    Returns a dict mapping Sector/Asset Class -> Weight
    """
    profiles = {
        'Conservative': {
            'Large Cap (Top 10 NIFTY)': 0.60,
            'Mid Cap': 0.15,
            'Debt/Bonds': 0.25
        },
        'Balanced': {
            'Large Cap (Top 10 NIFTY)': 0.50,
            'Mid Cap': 0.30,
            'Small Cap': 0.10,
            'Debt/Bonds': 0.10
        },
        'Aggressive': {
            'Large Cap (Top 10 NIFTY)': 0.30,
            'Mid Cap': 0.40,
            'Small Cap': 0.30,
            'Debt/Bonds': 0.00
        }
    }
    
    return profiles.get(risk_profile, profiles['Balanced'])
