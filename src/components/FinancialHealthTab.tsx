import React, { useState } from 'react';
import { CompanyProfile } from '../types/financials';
import { calculateDuPont, calculateHealthScores, identifyStrengthsAndWeaknesses } from '../services/financialAnalysisEngine';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Info, 
  Activity, 
  Scale, 
  DollarSign, 
  FileCheck,
  TrendingUp,
  Percent
} from 'lucide-react';

interface FinancialHealthTabProps {
  company: CompanyProfile;
}

export const FinancialHealthTab: React.FC<FinancialHealthTabProps> = ({ company }) => {
  const latest = company.historical[company.historical.length - 1];
  const prior = company.historical[company.historical.length - 2] || latest;
  
  const dupont = calculateDuPont(company);
  const health = calculateHealthScores(company);
  const strengthsWeaknesses = identifyStrengthsAndWeaknesses(company);
  
  const [dupontStage, setDupontStage] = useState<'3stage' | '5stage'>('3stage');
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'weakness'>('all');

  const filteredItems = strengthsWeaknesses.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Health Verdict */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Audited Balance Sheet & Solvency Diagnostic</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Financial Health & Capital Quality Analysis
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Quantitative assessment of Piotroski 9-point score, Altman Z-Score insolvency probability, Beneish M-Score earnings manipulation screening, and multi-stage DuPont decomposition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-medium">PIOTROSKI F-SCORE</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {health.piotroskiFScore.score}/9
            </div>
            <div className="text-[10px] text-emerald-300 font-semibold">{health.piotroskiFScore.rating} Quality</div>
          </div>
          <div className="bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-medium">ALTMAN Z-SCORE</div>
            <div className="text-xl font-extrabold text-white font-mono">
              {health.altmanZScore.score.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold">{health.altmanZScore.zone}</div>
          </div>
        </div>
      </div>

      {/* DuPont Decomposition Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>DuPont Analysis: ROE Dissection</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deconstructs Return on Equity to determine whether returns stem from operating profitability, asset efficiency, or financial debt leverage.
            </p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setDupontStage('3stage')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                dupontStage === '3stage' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3-Stage Model
            </button>
            <button
              onClick={() => setDupontStage('5stage')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                dupontStage === '5stage' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5-Stage Model
            </button>
          </div>
        </div>

        {/* DuPont Visualizer Cards */}
        {dupontStage === '3stage' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              {/* Component 1: Net Margin */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Net Profit Margin</div>
                <div className="text-xl font-bold text-indigo-400 mt-1 font-mono">
                  {dupont.stage3.netProfitMargin.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Net Income / Revenue</div>
              </div>

              {/* Multiplier Symbol */}
              <div className="hidden md:flex justify-center text-slate-500 font-bold text-lg">×</div>

              {/* Component 2: Asset Turnover */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Asset Turnover</div>
                <div className="text-xl font-bold text-cyan-400 mt-1 font-mono">
                  {dupont.stage3.assetTurnover.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Revenue / Total Assets</div>
              </div>

              {/* Multiplier Symbol */}
              <div className="hidden md:flex justify-center text-slate-500 font-bold text-lg">×</div>

              {/* Component 3: Financial Leverage */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
                <div className="text-[11px] text-slate-400 font-medium">Financial Leverage (Equity Multiplier)</div>
                <div className="text-xl font-bold text-amber-400 mt-1 font-mono">
                  {dupont.stage3.financialLeverage.toFixed(2)}x
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Total Assets / Total Equity</div>
              </div>

              {/* Equals Symbol */}
              <div className="hidden md:flex justify-center text-slate-500 font-bold text-lg">=</div>

              {/* Result: ROE */}
              <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-700/60 text-center">
                <div className="text-[11px] text-indigo-300 font-medium">Return on Equity (ROE)</div>
                <div className="text-2xl font-black text-white mt-1 font-mono">
                  {latest.roe.toFixed(2)}%
                </div>
                <div className="text-[10px] text-indigo-300/80 mt-1 font-semibold">
                  Driver: {dupont.driverOfRoe}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              <strong className="text-indigo-400">Interpretation:</strong> {dupont.interpretation}
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center">
              {/* Component 1: Tax Burden */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Tax Burden</div>
                <div className="text-lg font-bold text-indigo-400 mt-1 font-mono">
                  {dupont.stage5.taxBurden}%
                </div>
                <div className="text-[9px] text-slate-500">Net Income / EBT</div>
              </div>

              {/* Component 2: Interest Burden */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Interest Burden</div>
                <div className="text-lg font-bold text-cyan-400 mt-1 font-mono">
                  {dupont.stage5.interestBurden}%
                </div>
                <div className="text-[9px] text-slate-500">EBT / EBIT</div>
              </div>

              {/* Component 3: Operating Margin */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Operating Margin</div>
                <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                  {dupont.stage5.operatingMargin.toFixed(1)}%
                </div>
                <div className="text-[9px] text-slate-500">EBIT / Revenue</div>
              </div>

              {/* Component 4: Asset Turnover */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Asset Turnover</div>
                <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
                  {dupont.stage5.assetTurnover.toFixed(2)}x
                </div>
                <div className="text-[9px] text-slate-500">Revenue / Assets</div>
              </div>

              {/* Component 5: Leverage */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Financial Leverage</div>
                <div className="text-lg font-bold text-purple-400 mt-1 font-mono">
                  {dupont.stage5.financialLeverage.toFixed(2)}x
                </div>
                <div className="text-[9px] text-slate-500">Assets / Equity</div>
              </div>

              {/* Result: ROE */}
              <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-700/60 text-center">
                <div className="text-[10px] text-indigo-300 font-semibold">5-Stage ROE</div>
                <div className="text-xl font-black text-white mt-1 font-mono">
                  {latest.roe.toFixed(2)}%
                </div>
                <div className="text-[9px] text-indigo-300/80 font-medium">Decomposed</div>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              <strong className="text-indigo-400">Five-Stage Insight:</strong> Isolates the impact of tax optimization and interest expense burden from core operating margin and capital efficiency.
            </div>
          </div>
        )}
      </div>

      {/* Piotroski 9-Point F-Score Detail */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Piotroski F-Score (9 Audited Fundamental Criteria)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Joseph Piotroski methodology: scores profitability (4), leverage/liquidity (3), and operational efficiency (2).
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            {health.piotroskiFScore.score} / 9 Criteria Passed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-2.5 px-3">Test Condition</th>
                <th className="py-2.5 px-3">Pillar Category</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Verified Metric Value</th>
                <th className="py-2.5 px-3">Benchmark</th>
                <th className="py-2.5 px-3">Filing Source Line Item</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {health.piotroskiFScore.criteria.map((crit, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-100">
                    {crit.name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                      {crit.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {crit.passed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Passed (+1)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <XCircle className="w-4 h-4" /> Failed (0)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {crit.metricValue}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                    {crit.benchmark}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {crit.sourceItem}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Altman Z-Score & Beneish M-Score Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Altman Z-Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span>Altman Z-Score Insolvency Analysis</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              {health.altmanZScore.zone}
            </span>
          </div>
          
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs text-slate-300">
            {health.altmanZScore.interpretation}
          </div>

          <div className="space-y-2.5">
            {health.altmanZScore.components.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-indigo-400 font-bold">{c.component}:</span>
                  <span className="text-slate-300">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">Val: {(c.value).toFixed(3)}</span>
                  <span className="text-slate-500">× {c.weight} =</span>
                  <strong className="text-slate-100">+{(c.contribution).toFixed(3)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Beneish M-Score & Liquidity Safeguards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>Beneish M-Score & Liquidity Safeguards</span>
            </h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-950 text-slate-300 border border-slate-800">
              Score: {health.beneishMScore.score.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong className="text-cyan-400">Earnings Quality Verdict:</strong> {health.beneishMScore.interpretation}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Current Ratio</span>
              <strong className="text-white text-base font-mono">{latest.currentRatio.toFixed(2)}x</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Current Assets / Liab</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Quick Ratio (Acid Test)</span>
              <strong className="text-white text-base font-mono">{latest.quickRatio.toFixed(2)}x</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Excludes Inventory</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Net Debt / EBITDA</span>
              <strong className="text-white text-base font-mono">{latest.netDebtToEbitda.toFixed(2)}x</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">{latest.netDebt < 0 ? 'Net Cash Surplus' : 'Leverage Ratio'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Interest Coverage</span>
              <strong className="text-emerald-400 text-base font-mono">{latest.interestCoverage.toFixed(1)}x</strong>
              <span className="text-[10px] text-slate-500 block mt-0.5">Operating Income / Interest</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Strengths & Weaknesses Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <span>Full Audited Strengths & Weaknesses Catalog</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Grounded in specific SEC 10-K disclosures, line items, and multi-year trend variances.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({strengthsWeaknesses.length})
            </button>
            <button
              onClick={() => setFilterType('strength')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'strength' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strengths ({strengthsWeaknesses.filter(s => s.type === 'strength').length})
            </button>
            <button
              onClick={() => setFilterType('weakness')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'weakness' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Weaknesses ({strengthsWeaknesses.filter(s => s.type === 'weakness').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const isStr = item.type === 'strength';
            return (
              <div 
                key={item.id} 
                className={`p-4 rounded-xl border bg-slate-950/80 transition space-y-2.5 ${
                  isStr ? 'border-emerald-900/40 hover:border-emerald-800/80' : 'border-rose-900/40 hover:border-rose-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isStr ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <h4 className="text-sm font-bold text-slate-100">{item.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isStr ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  }`}>
                    {item.currentValue}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/70">
                  <span>Category: <strong className="text-slate-200">{item.category}</strong></span>
                  <span>Benchmark: <strong className="text-slate-200">{item.historicalOrPeerBenchmark}</strong></span>
                </div>

                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 border border-slate-800">
                  <strong className={isStr ? 'text-emerald-400' : 'text-rose-400'}>Supporting Evidence:</strong> {item.supportingEvidence}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
