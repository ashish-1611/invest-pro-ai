import React, { useState } from 'react';
import { CompanyProfile } from '../types/financials';
import { 
  TrendingUp, 
  BarChart2, 
  DollarSign, 
  PieChart, 
  ShieldAlert, 
  Activity, 
  Percent,
  Layers
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface RatiosDeepDiveTabProps {
  company: CompanyProfile;
}

export const RatiosDeepDiveTab: React.FC<RatiosDeepDiveTabProps> = ({ company }) => {
  const h = company.historical;
  const latest = h[h.length - 1];
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'margins' | 'cashflow' | 'debt' | 'returns' | 'eps'>('revenue');

  // Chart Data preparation
  const chartData = h.map(d => ({
    year: `FY${d.year}`,
    revenue: d.revenue,
    revenueGrowth: d.revenueGrowthYoY,
    grossMargin: d.grossMargin,
    operatingMargin: d.operatingMargin,
    netMargin: d.netMargin,
    ebitdaMargin: d.ebitdaMargin,
    operatingCashFlow: d.operatingCashFlow,
    freeCashFlow: d.freeCashFlow,
    netIncome: d.netIncome,
    fcfConversion: d.fcfConversion,
    totalDebt: d.totalDebt,
    cashAndEquiv: d.totalCashAndInvestments,
    netDebt: d.netDebt,
    roe: d.roe,
    roce: d.roce,
    roic: d.roic,
    eps: d.eps,
    peRatio: d.peRatio
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>5-Year Audited Trend & Anomaly Diagnostics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Historical Ratios & Financial Trajectory
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            In-depth multi-year tracking of top-line revenue growth, margin expansion/compression, cash flow conversion quality, debt leverage, capital return rates, and valuation expansion.
          </p>
        </div>

        {/* Quick Diagnostic Pill */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-[10px] text-slate-400">5-YR REVENUE EXPANSION</div>
            <strong className="text-emerald-400 text-sm font-mono">
              ${h[0].revenue.toLocaleString()}M → ${latest.revenue.toLocaleString()}M
            </strong>
          </div>
        </div>
      </div>

      {/* Chart Selector Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedChart('revenue')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
            selectedChart === 'revenue' 
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Revenue & Growth YoY</span>
        </button>
        <button
          onClick={() => setSelectedChart('margins')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
            selectedChart === 'margins' 
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          <span>Margins (Gross, Op, Net)</span>
        </button>
        <button
          onClick={() => setSelectedChart('cashflow')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
            selectedChart === 'cashflow' 
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>OCF vs FCF vs Net Income</span>
        </button>
        <button
          onClick={() => setSelectedChart('debt')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
            selectedChart === 'debt' 
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Debt vs Cash Reserves</span>
        </button>
        <button
          onClick={() => setSelectedChart('returns')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
            selectedChart === 'returns' 
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>ROE vs ROCE vs ROIC</span>
        </button>
        <button
          onClick={() => setSelectedChart('eps')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
            selectedChart === 'eps' 
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20' 
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>EPS & P/E Multiple</span>
        </button>
      </div>

      {/* Main Interactive Chart Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {selectedChart === 'revenue' && 'Revenue ($M) & Annual Growth YoY (%)'}
            {selectedChart === 'margins' && 'Profit Margin Evolution: Gross vs Operating vs Net Margin (%)'}
            {selectedChart === 'cashflow' && 'Cash Flow Quality: Operating Cash Flow vs Free Cash Flow vs Net Income ($M)'}
            {selectedChart === 'debt' && 'Capital Structure: Total Debt vs Total Liquid Cash ($M)'}
            {selectedChart === 'returns' && 'Capital Efficiency Rates: ROE vs ROCE vs ROIC (%)'}
            {selectedChart === 'eps' && 'Per-Share Earnings (EPS) vs Trailing P/E Multiple Trajectory'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">5-Year 10-K Data</span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedChart === 'revenue' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#6366f1" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue ($M)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenueGrowth" name="YoY Growth (%)" stroke="#10b981" strokeWidth={3} />
              </BarChart>
            ) : selectedChart === 'margins' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="grossMargin" name="Gross Margin (%)" stroke="#38bdf8" strokeWidth={3} />
                <Line type="monotone" dataKey="operatingMargin" name="Operating Margin (%)" stroke="#6366f1" strokeWidth={3} />
                <Line type="monotone" dataKey="netMargin" name="Net Margin (%)" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            ) : selectedChart === 'cashflow' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Area type="monotone" dataKey="operatingCashFlow" name="Operating Cash Flow ($M)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Area type="monotone" dataKey="freeCashFlow" name="Free Cash Flow ($M)" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Line type="monotone" dataKey="netIncome" name="Net Income ($M)" stroke="#f59e0b" strokeWidth={2} />
              </AreaChart>
            ) : selectedChart === 'debt' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="cashAndEquiv" name="Cash & ST Investments ($M)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalDebt" name="Total Debt ($M)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="netDebt" name="Net Debt ($M)" stroke="#e2e8f0" strokeWidth={2} />
              </BarChart>
            ) : selectedChart === 'returns' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="roe" name="ROE (%)" stroke="#a855f7" strokeWidth={3} />
                <Line type="monotone" dataKey="roce" name="ROCE (%)" stroke="#06b6d4" strokeWidth={3} />
                <Line type="monotone" dataKey="roic" name="ROIC (%)" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="$" />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="x" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                <Legend />
                <Bar yAxisId="left" dataKey="eps" name="Diluted EPS ($)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="peRatio" name="P/E Multiple (x)" stroke="#f59e0b" strokeWidth={3} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5-Year Historical Audited Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <span>Complete 5-Year Metric Matrix (Audited 10-K Data)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Figures in USD Millions (except per-share)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-3">Financial Metric</th>
                {h.map(d => (
                  <th key={d.year} className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                    FY{d.year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200 whitespace-nowrap">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Revenue</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">${d.revenue.toLocaleString()}M</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Revenue Growth YoY</td>
                {h.map(d => (
                  <td key={d.year} className={`py-2.5 px-3 text-right ${d.revenueGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {d.revenueGrowthYoY >= 0 ? `+${d.revenueGrowthYoY.toFixed(1)}%` : `${d.revenueGrowthYoY.toFixed(1)}%`}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Gross Margin</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">{d.grossMargin.toFixed(1)}%</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Operating Margin (EBIT)</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right font-bold text-indigo-300">{d.operatingMargin.toFixed(1)}%</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Net Margin</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">{d.netMargin.toFixed(1)}%</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Diluted EPS</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right font-bold text-white">${d.eps.toFixed(2)}</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Free Cash Flow</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right text-emerald-400">${d.freeCashFlow.toLocaleString()}M</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">FCF Conversion (% of NI)</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">{d.fcfConversion.toFixed(1)}%</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Total Debt</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">${d.totalDebt.toLocaleString()}M</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Total Cash & ST Investments</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right font-semibold text-emerald-400">${d.totalCashAndInvestments.toLocaleString()}M</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">ROCE</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right text-cyan-400">{d.roce.toFixed(1)}%</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">ROE</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">{d.roe.toFixed(1)}%</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Interest Coverage</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right">{d.interestCoverage.toFixed(1)}x</td>)}
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Trailing P/E Ratio</td>
                {h.map(d => <td key={d.year} className="py-2.5 px-3 text-right font-bold">{d.peRatio.toFixed(1)}x</td>)}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
