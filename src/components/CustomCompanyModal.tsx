import React, { useState } from 'react';
import type { CompanyProfile, FinancialYearData } from '../types/financials';
import { 
  X, 
  Building2, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Check, 
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface CustomCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (company: CompanyProfile) => void;
}

export const CustomCompanyModal: React.FC<CustomCompanyModalProps> = ({
  isOpen,
  onClose,
  onAddCompany
}) => {
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Technology & Software');
  const [currentPrice, setCurrentPrice] = useState('150.00');
  const [sharesOutstanding, setSharesOutstanding] = useState('2500'); // Millions
  const [revenue, setRevenue] = useState('50000'); // Millions
  const [operatingMargin, setOperatingMargin] = useState('28'); // %
  const [netMargin, setNetMargin] = useState('22'); // %
  const [grossMargin, setGrossMargin] = useState('55'); // %
  const [totalDebt, setTotalDebt] = useState('15000'); // Millions
  const [cash, setCash] = useState('25000'); // Millions
  const [freeCashFlow, setFreeCashFlow] = useState('12000'); // Millions
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Live Quote Fetcher via Yahoo Finance Chart API
  const handleFetchLiveQuote = async () => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol) {
      setFetchStatus('Please enter a valid ticker symbol (e.g. NFLX, ORCL, AMD).');
      return;
    }

    setIsFetchingLive(true);
    setFetchStatus(`Fetching live quote data for ${symbol}...`);

    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      if (!res.ok) throw new Error('Live endpoint unreachable');
      const data = await res.json();
      const meta = data?.chart?.result?.[0]?.meta;
      if (meta && meta.regularMarketPrice) {
        const livePrice = meta.regularMarketPrice;
        setCurrentPrice(livePrice.toFixed(2));
        setName(meta.shortName || meta.symbol || symbol);
        setFetchStatus(`✓ Live market price fetched: $${livePrice.toFixed(2)}`);
      } else {
        setFetchStatus('Ticker found, but live price payload was empty. Using defaults.');
      }
    } catch (err) {
      console.warn('Live fetch error:', err);
      setFetchStatus('Could not reach live market feed directly (CORS/network restriction). You can set parameters manually.');
    } finally {
      setIsFetchingLive(false);
    }
  };

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'NFLX') {
      setTicker('NFLX');
      setName('Netflix, Inc.');
      setIndustry('Entertainment & Streaming Media');
      setCurrentPrice('875.00');
      setSharesOutstanding('430');
      setRevenue('39000');
      setOperatingMargin('27');
      setNetMargin('21');
      setGrossMargin('46');
      setTotalDebt('14000');
      setCash('7500');
      setFreeCashFlow('7000');
    } else if (presetName === 'AMD') {
      setTicker('AMD');
      setName('Advanced Micro Devices, Inc.');
      setIndustry('Semiconductors & Compute');
      setCurrentPrice('138.00');
      setSharesOutstanding('1620');
      setRevenue('25700');
      setOperatingMargin('18');
      setNetMargin('15');
      setGrossMargin('52');
      setTotalDebt('3000');
      setCash('5800');
      setFreeCashFlow('4800');
    } else if (presetName === 'ORCL') {
      setTicker('ORCL');
      setName('Oracle Corporation');
      setIndustry('Enterprise Cloud & Database');
      setCurrentPrice('182.00');
      setSharesOutstanding('2750');
      setRevenue('53000');
      setOperatingMargin('30');
      setNetMargin('20');
      setGrossMargin('71');
      setTotalDebt('85000');
      setCash('11000');
      setFreeCashFlow('13000');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = ticker.trim().toUpperCase() || 'CUSTOM';
    const p = parseFloat(currentPrice) || 100;
    const shares = parseFloat(sharesOutstanding) || 1000;
    const rev = parseFloat(revenue) || 10000;
    const gm = parseFloat(grossMargin) || 50;
    const om = parseFloat(operatingMargin) || 20;
    const nm = parseFloat(netMargin) || 15;
    const debt = parseFloat(totalDebt) || 5000;
    const liquidCash = parseFloat(cash) || 8000;
    const fcf = parseFloat(freeCashFlow) || (rev * nm / 100);

    const gp = rev * (gm / 100);
    const ebit = rev * (om / 100);
    const ni = rev * (nm / 100);
    const eps = ni / shares;
    const mktCap = p * shares;
    const ev = mktCap + debt - liquidCash;
    const pe = p / (eps || 1);

    // Synthesize 5 years of historical trajectory
    const currentYear = 2024;
    const historical: FinancialYearData[] = [];
    for (let i = 4; i >= 0; i--) {
      const yr = currentYear - i;
      const decay = Math.pow(0.88, i); // past 4 years back
      const yrRev = rev * decay;
      const yrGp = gp * decay;
      const yrEbit = ebit * decay;
      const yrNi = ni * decay;
      const yrFcf = fcf * decay;
      const yrEps = eps * decay;
      const yrAssets = yrRev * 1.2;
      const yrLiab = (debt * decay) + (yrRev * 0.3);
      const yrEquity = Math.max(yrAssets - yrLiab, 1000);

      historical.push({
        year: yr,
        revenue: Math.round(yrRev),
        revenueGrowthYoY: i === 4 ? 8.5 : 12.4,
        grossProfit: Math.round(yrGp),
        grossMargin: gm,
        operatingIncome: Math.round(yrEbit),
        operatingMargin: om,
        netIncome: Math.round(yrNi),
        netMargin: nm,
        ebitda: Math.round(yrEbit * 1.15),
        ebitdaMargin: om * 1.15,
        eps: Number(yrEps.toFixed(2)),
        epsGrowthYoY: 14.2,
        sharesDiluted: Math.round(shares),
        cashAndEquivalents: Math.round(liquidCash * decay * 0.4),
        shortTermInvestments: Math.round(liquidCash * decay * 0.6),
        totalCashAndInvestments: Math.round(liquidCash * decay),
        accountsReceivable: Math.round(yrRev * 0.12),
        inventory: Math.round(yrRev * 0.04),
        totalCurrentAssets: Math.round(yrRev * 0.45),
        propertyPlantEquipment: Math.round(yrRev * 0.35),
        totalAssets: Math.round(yrAssets),
        accountsPayable: Math.round(yrRev * 0.08),
        shortTermDebt: Math.round(debt * decay * 0.2),
        totalCurrentLiabilities: Math.round(yrRev * 0.25),
        longTermDebt: Math.round(debt * decay * 0.8),
        totalDebt: Math.round(debt * decay),
        totalLiabilities: Math.round(yrLiab),
        totalEquity: Math.round(yrEquity),
        operatingCashFlow: Math.round(yrFcf * 1.3),
        capitalExpenditures: Math.round(yrFcf * 0.3),
        freeCashFlow: Math.round(yrFcf),
        fcfConversion: Number(((yrFcf / yrNi) * 100).toFixed(1)),
        dividendsPaid: Math.round(yrNi * 0.1),
        shareRepurchases: Math.round(yrNi * 0.4),
        stockPriceClose: Number((p * decay).toFixed(2)),
        marketCap: Math.round(mktCap * decay),
        peRatio: Number(pe.toFixed(1)),
        evToEbitda: Number((ev / (ebit * 1.15 || 1)).toFixed(1)),
        priceToBook: Number((mktCap / (yrEquity || 1)).toFixed(1)),
        priceToFcf: Number((mktCap / (yrFcf || 1)).toFixed(1)),
        debtToEquity: Number((debt / (yrEquity || 1)).toFixed(2)),
        netDebt: Math.round(debt - liquidCash),
        netDebtToEbitda: Number(((debt - liquidCash) / (ebit * 1.15 || 1)).toFixed(2)),
        currentRatio: 1.8,
        quickRatio: 1.4,
        interestExpense: Math.round(debt * 0.045),
        interestCoverage: Number((ebit / (debt * 0.045 || 1)).toFixed(1)),
        roe: Number(((yrNi / yrEquity) * 100).toFixed(1)),
        roce: Number(((yrEbit / (yrAssets - (yrRev * 0.25))) * 100).toFixed(1)),
        roic: Number(((yrEbit * 0.8 / (yrEquity + debt)) * 100).toFixed(1)),
        assetTurnover: Number((yrRev / yrAssets).toFixed(2)),
        financialLeverage: Number((yrAssets / yrEquity).toFixed(2))
      });
    }

    const newCompany: CompanyProfile = {
      ticker: sym,
      name: name.trim() || sym,
      industry: industry.trim() || 'General Equities',
      sector: 'Diversified',
      currency: 'USD',
      exchange: 'Custom / Live Feed',
      description: `${name} is an active custom equity profile modeled in Invest-AI terminal with user-specified financial statement parameters.`,
      currentPrice: p,
      sharesOutstanding: shares,
      marketCap: Math.round(mktCap),
      enterpriseValue: Math.round(ev),
      beta: 1.15,
      dividendYield: 0.5,
      fiscalYearEnd: 'December (FY2024)',
      secFilingSource: `User-Configured Parameters & Live Quote Feed for ${sym}`,
      isCustomCompany: true,
      segments: [
        { name: 'Core Operations', revenue: Math.round(rev * 0.65), share: 65, growthYoY: 10.5 },
        { name: 'Growth Products & Cloud', revenue: Math.round(rev * 0.35), share: 35, growthYoY: 18.2 }
      ],
      historical
    };

    onAddCompany(newCompany);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Add & Analyze Any Company
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Input any public or private company data or fetch live market quotes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs">
          <span className="text-slate-400">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('NFLX')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold"
          >
            NFLX (Netflix)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('AMD')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold"
          >
            AMD (Semis)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('ORCL')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 font-semibold"
          >
            ORCL (Oracle)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-4 text-xs">
          {/* Ticker & Live Fetch */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Ticker Symbol</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={ticker}
                  onChange={e => setTicker(e.target.value.toUpperCase())}
                  placeholder="e.g. NFLX"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleFetchLiveQuote}
                  disabled={isFetchingLive}
                  className="px-2.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg border border-indigo-500/40 flex items-center gap-1 shrink-0"
                  title="Fetch Live Quote"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Fetch</span>
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Company Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Netflix, Inc."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {fetchStatus && (
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300">
              {fetchStatus}
            </div>
          )}

          {/* Industry & Market Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Industry / Sector</label>
              <input
                type="text"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Market Price ($)</label>
              <input
                type="number"
                step="any"
                value={currentPrice}
                onChange={e => setCurrentPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Diluted Shares (Millions)</label>
              <input
                type="number"
                step="any"
                value={sharesOutstanding}
                onChange={e => setSharesOutstanding(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Income Statement Metrics */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Financial Baseline (Millions USD)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Total Revenue ($M)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={e => setRevenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Gross Margin (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={grossMargin}
                  onChange={e => setGrossMargin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Operating Margin (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={operatingMargin}
                  onChange={e => setOperatingMargin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Net Margin (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={netMargin}
                  onChange={e => setNetMargin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Balance Sheet & Cash Flow */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Balance Sheet & Cash Flow (Millions USD)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Total Debt ($M)</label>
                <input
                  type="number"
                  value={totalDebt}
                  onChange={e => setTotalDebt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Cash & Equivalents ($M)</label>
                <input
                  type="number"
                  value={cash}
                  onChange={e => setCash(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Free Cash Flow ($M)</label>
                <input
                  type="number"
                  value={freeCashFlow}
                  onChange={e => setFreeCashFlow(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Load Into Analysis Engine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
