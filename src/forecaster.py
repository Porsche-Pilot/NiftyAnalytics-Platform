import pandas as pd
from prophet import Prophet

def forecast_price_trend(df: pd.DataFrame, periods: int = 30) -> pd.DataFrame:
    """
    Uses Facebook Prophet to forecast the stock price trend for the next `periods` days.
    """
    # Prophet requires 'ds' for datetime and 'y' for the target value
    df_prophet = df.reset_index()[['Date', 'Close']].rename(columns={'Date': 'ds', 'Close': 'y'})
    
    # Initialize and train Prophet model
    # Note: Stock markets have daily seasonality and weekly seasonality (no weekends)
    # We can turn off weekly seasonality or handle it, but Prophet defaults are usually fine
    model = Prophet(daily_seasonality=True, yearly_seasonality=True, weekly_seasonality=True)
    model.fit(df_prophet)
    
    # Create future dataframe
    future = model.make_future_dataframe(periods=periods)
    
    # Predict
    forecast = model.predict(future)
    
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)
