from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os
import json

# Ensure src is in the path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src'))

from data_loader import load_stock_data, get_all_symbols, load_metadata
from feature_engineering import add_technical_indicators
from forecaster import forecast_price_trend
from risk_portfolio import assess_risk, build_portfolio

app = FastAPI(title="NIFTY-50 AI Investment Platform API")

# Allow CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/overview")
def get_overview():
    try:
        symbols = get_all_symbols()
        metadata = load_metadata()
        industry_counts = metadata['Industry'].value_counts().to_dict()
        return {
            "total_symbols": len(symbols),
            "industry_distribution": industry_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/symbols")
def get_symbols():
    try:
        return {"symbols": get_all_symbols()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stock/{symbol}")
def get_stock_data(symbol: str):
    try:
        df = load_stock_data(symbol)
        df_feat = add_technical_indicators(df)
        risk = assess_risk(df_feat)
        
        # Take last 365 days for frontend chart
        df_recent = df_feat.last('365D')
        
        chart_data = {
            "dates": df_recent.index.strftime('%Y-%m-%d').tolist(),
            "open": df_recent['Open'].tolist(),
            "high": df_recent['High'].tolist(),
            "low": df_recent['Low'].tolist(),
            "close": df_recent['Close'].tolist(),
            "sma_50": df_recent['SMA_50'].fillna(0).tolist()
        }
        
        return {
            "symbol": symbol,
            "risk_metrics": risk,
            "chart_data": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forecast/{symbol}")
def get_forecast(symbol: str, days: int = 30):
    try:
        df = load_stock_data(symbol)
        forecast_df = forecast_price_trend(df, periods=days)
        
        return {
            "dates": forecast_df['ds'].dt.strftime('%Y-%m-%d').tolist(),
            "predicted_price": forecast_df['yhat'].tolist(),
            "lower_bound": forecast_df['yhat_lower'].tolist(),
            "upper_bound": forecast_df['yhat_upper'].tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/portfolio/{profile}")
def get_portfolio(profile: str):
    try:
        allocation = build_portfolio(profile)
        return {"profile": profile, "allocation": allocation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
