import pandas as pd
import os
from typing import List
import yfinance as yf

# Default path to the NIFTY-50 dataset
DEFAULT_DATA_DIR = r"c:\Users\swapa\OneDrive\Documents\cult\NIFTY-50"

def load_metadata(data_dir: str = DEFAULT_DATA_DIR) -> pd.DataFrame:
    """
    Load the stock metadata containing symbol, company name, industry, etc.
    """
    metadata_path = os.path.join(data_dir, "stock_metadata.csv")
    if not os.path.exists(metadata_path):
        raise FileNotFoundError(f"Metadata file not found at {metadata_path}")
    return pd.read_csv(metadata_path)

def load_stock_data(symbol: str, data_dir: str = DEFAULT_DATA_DIR) -> pd.DataFrame:
    """
    Load historical stock data for a given symbol using yfinance API.
    If the API fails, it falls back to the local CSV dataset.
    """
    yf_symbol = f"{symbol}.NS"
    try:
        # Fetch last 5 years of live market data
        df = yf.download(yf_symbol, period="5y", progress=False)
        
        if df.empty:
            raise ValueError(f"No data found for {yf_symbol} via yfinance")
            
        # Newer versions of yfinance return a MultiIndex when downloading. We must flatten it.
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
            
        # Force column types to Series if they are DataFrames
        for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
            if isinstance(df[col], pd.DataFrame):
                df[col] = df[col].iloc[:, 0]
                
        df.index = pd.to_datetime(df.index)
        
        # Add dummy columns for compatibility with any older CSV structures
        df['Trades'] = 0
        df['Deliverable Volume'] = 0
        df['%Deliverble'] = 0
        
        # Remove any lingering missing data
        df.dropna(subset=['Close'], inplace=True)
        return df

    except Exception as e:
        print(f"yfinance fetch failed for {symbol}: {e}. Falling back to local CSV...")
        # Fallback to Local CSV Data
        file_path = os.path.join(data_dir, f"{symbol}.csv")
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Data file for {symbol} not found at {file_path}")
        
        df = pd.read_csv(file_path)
        
        # Convert Date to datetime and set as index
        df['Date'] = pd.to_datetime(df['Date'])
        df.set_index('Date', inplace=True)
        df.sort_index(inplace=True)
        
        # Handle missing values
        df['Trades'] = df['Trades'].fillna(0)
        df['Deliverable Volume'] = df['Deliverable Volume'].fillna(0)
        df['%Deliverble'] = df['%Deliverble'].fillna(0)
        
        return df

def get_all_symbols(data_dir: str = DEFAULT_DATA_DIR) -> List[str]:
    """
    Get a list of all stock symbols available in the metadata.
    """
    meta = load_metadata(data_dir)
    return meta['Symbol'].tolist()

if __name__ == "__main__":
    # Quick test
    symbols = get_all_symbols()
    print(f"Loaded {len(symbols)} symbols from metadata.")
    
    if symbols:
        sample_symbol = symbols[0]
        df = load_stock_data(sample_symbol)
        print(f"\nLoaded {sample_symbol} data:")
        print(df.head())
        print(df.info())
