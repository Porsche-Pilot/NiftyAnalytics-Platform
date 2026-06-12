import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import './index.css';

const API_BASE = 'http://localhost:8000/api';

// Corporate palette: Navy blues, grays, and subtle accents
const COLORS = ['#1e3a8a', '#3b82f6', '#64748b', '#94a3b8', '#0f172a', '#cbd5e1', '#0ea5e9', '#0284c7'];

// Standardized Recharts styling for light corporate theme
const CHART_GRID_COLOR = "#e2e8f0";
const CHART_TEXT_COLOR = "#64748b";
const TOOLTIP_STYLE = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#0f172a' };

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [symbols, setSymbols] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [stockData, setStockData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [overviewData, setOverviewData] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('Moderate');
  const [portfolioData, setPortfolioData] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/symbols`)
      .then(res => setSymbols(res.data.symbols))
      .catch(err => console.error(err));
      
    axios.get(`${API_BASE}/overview`)
      .then(res => {
        const dist = res.data.industry_distribution;
        const formatted = Object.keys(dist).map(key => ({
          name: key,
          value: dist[key]
        }));
        setOverviewData(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (activeTab === 'analysis' && selectedSymbol) {
      setLoading(true);
      axios.get(`${API_BASE}/stock/${selectedSymbol}`)
        .then(res => {
          setStockData(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab, selectedSymbol]);

  useEffect(() => {
    if (activeTab === 'forecast') {
      setForecastData(null);
    }
  }, [selectedSymbol, activeTab]);

  useEffect(() => {
    if (activeTab === 'portfolio' && selectedProfile) {
      setLoading(true);
      axios.get(`${API_BASE}/portfolio/${selectedProfile}`)
        .then(res => {
          const alloc = res.data.allocation;
          const formatted = Object.keys(alloc).map(key => ({
            name: key,
            value: alloc[key] * 100
          })).filter(item => item.value > 0);
          setPortfolioData(formatted);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [activeTab, selectedProfile]);

  const runForecast = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/forecast/${selectedSymbol}?days=30`);
      const formatted = res.data.dates.map((date, i) => ({
        date,
        price: res.data.predicted_price[i],
        lower: res.data.lower_bound[i],
        upper: res.data.upper_bound[i]
      }));
      setForecastData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand">
          <BarChart2 size={24} color="#1e3a8a" /> NiftyAnalytics
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            Stock Analysis
          </button>

          <button 
            className={`nav-button ${activeTab === 'forecast' ? 'active' : ''}`}
            onClick={() => setActiveTab('forecast')}
          >
            Forecasting
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ marginBottom: '5px' }}>Market Overview</h2>
            <p className="text-muted" style={{ marginBottom: '30px' }}>Breakdown of NIFTY-50 sectors by capitalization and constituents.</p>
            
            <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h4 style={{ marginBottom: '30px' }}>Industry Distribution</h4>
              {overviewData ? (
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={overviewData}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={160}
                      paddingAngle={1}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: CHART_TEXT_COLOR }}
                    >
                      {overviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div>
            <h2 style={{ marginBottom: '5px' }}>Stock Analysis</h2>
            <p className="text-muted" style={{ marginBottom: '30px' }}>Historical market data and calculated risk metrics.</p>
            
            <div style={{ marginBottom: '20px', maxWidth: '250px' }}>
              <select 
                className="styled-select" 
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
              >
                {symbols.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {loading && !stockData && <p className="text-muted">Fetching data...</p>}
            
            {stockData && (
              <>
                <div className="grid-3" style={{ marginBottom: '20px' }}>
                  <div className="card">
                    <div className="text-muted">Annualized Volatility</div>
                    <div className="stat-value">{(stockData.risk_metrics['Annualized Volatility'] * 100).toFixed(2)}%</div>
                  </div>
                  <div className="card">
                    <div className="text-muted">Sharpe Ratio</div>
                    <div className="stat-value text-primary">{stockData.risk_metrics['Sharpe Ratio'].toFixed(2)}</div>
                  </div>
                  <div className="card">
                    <div className="text-muted">Max Drawdown</div>
                    <div className="stat-value text-danger">{(stockData.risk_metrics['Max Drawdown'] * 100).toFixed(2)}%</div>
                  </div>
                </div>

                <div className="card" style={{ height: '400px' }}>
                  <h4 style={{ marginBottom: '20px' }}>Price vs 50-Day SMA</h4>
                  <ResponsiveContainer width="100%" height="85%">
                    <ComposedChart data={stockData.chart_data.dates.map((d, i) => ({ date: d, close: stockData.chart_data.close[i], sma: stockData.chart_data.sma_50[i] }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                      <XAxis dataKey="date" stroke={CHART_TEXT_COLOR} tick={{fill: CHART_TEXT_COLOR}} />
                      <YAxis domain={['auto', 'auto']} stroke={CHART_TEXT_COLOR} tick={{fill: CHART_TEXT_COLOR}} />
                      <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="close" name="Close Price" stroke="#1e3a8a" dot={false} strokeWidth={2} />
                      <Line type="monotone" dataKey="sma" name="50-Day SMA" stroke="#94a3b8" dot={false} strokeWidth={2} strokeDasharray="4 4" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'forecast' && (
          <div>
            <h2 style={{ marginBottom: '5px' }}>Price Forecasting</h2>
            <p className="text-muted" style={{ marginBottom: '30px' }}>30-day structural projection using Time-Series models.</p>
            
            <div style={{ marginBottom: '20px', maxWidth: '250px' }}>
              <select 
                className="styled-select" 
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
              >
                {symbols.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Model Forecast (Next 30 Days)</h4>
                  <p className="text-muted" style={{ margin: 0, marginTop: '4px' }}>Shows expected trajectory with statistical confidence bounds.</p>
                </div>
                <button className="styled-button" onClick={runForecast} disabled={loading}>
                  {loading ? 'Running model...' : 'Execute Forecast'}
                </button>
              </div>
              
              {forecastData ? (
                <div style={{ height: '400px', marginTop: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                      <XAxis dataKey="date" stroke={CHART_TEXT_COLOR} tick={{fill: CHART_TEXT_COLOR}} />
                      <YAxis domain={['auto', 'auto']} stroke={CHART_TEXT_COLOR} tick={{fill: CHART_TEXT_COLOR}} />
                      <RechartsTooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ paddingTop: '10px' }} />
                      <Area type="monotone" dataKey="upper" fill="#1e3a8a" stroke="none" fillOpacity={0.08} />
                      <Area type="monotone" dataKey="lower" fill="#ffffff" stroke="none" fillOpacity={1} />
                      <Line type="monotone" dataKey="price" name="Projected Close" stroke="#1e3a8a" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: '250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `1px dashed ${CHART_GRID_COLOR}`, borderRadius: '4px', marginTop: '20px' }}>
                  <p className="text-muted">Execute forecast to view projections for {selectedSymbol}.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <h2 style={{ marginBottom: '5px' }}>Portfolio Builder</h2>
            <p className="text-muted" style={{ marginBottom: '30px' }}>Recommended asset allocation based on defined risk profiles.</p>
            
            <div style={{ marginBottom: '20px', maxWidth: '250px' }}>
              <select 
                className="styled-select" 
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
              >
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h4 style={{ marginBottom: '20px' }}>Target Allocation ({selectedProfile})</h4>
              {portfolioData ? (
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={portfolioData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
                    <XAxis dataKey="name" stroke={CHART_TEXT_COLOR} angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: CHART_TEXT_COLOR }} />
                    <YAxis stroke={CHART_TEXT_COLOR} label={{ value: 'Allocation (%)', angle: -90, position: 'insideLeft', fill: CHART_TEXT_COLOR }} tick={{fill: CHART_TEXT_COLOR}} />
                    <RechartsTooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => `${value.toFixed(1)}%`} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="value" fill="#1e3a8a" radius={[2, 2, 0, 0]}>
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
