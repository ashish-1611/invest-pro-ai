import React, { useState } from 'react';
import { CompanyProfile } from '../types/financials';
import { generateProjections, CustomProjectionInputs } from '../services/projectionsEngine';
import { 
  Layers, 
  Sliders, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  RefreshCw,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ProjectionsTabProps {
  company: CompanyProfile;
}

export const ProjectionsTab: React.FC<ProjectionsTabProps> = ({ company }) => {
  const latest = company.historical[company.historical.length - 1];

  const [activeScenario, setActiveScenario] = useState<'Base Case' | 'Bull Case' | 'Bear Case'>('Base Case');
  
  // Custom Override States
  const [customInputs, setCustomInputs] = useState<CustomProjectionInputs>({});

  const projectionsData = generateProjections(company, customInputs);
  const currentScenario = projectionsData.scenarios.find(s => s.scenarioName === activeScenario) || projectionsData.scenarios[0];

  const handleResetInputs = () => {
    setCustomInputs({});
  };

  // Chart Data for Projections (History + 1Y, 3Y, 5Y)
  const projectionChartData = [
    {
      label: `FY${latest.year} (Fact)`,
      revenue: latest.revenue,
      operatingIncome: latest.operatingIncome,
      netIncome: latest.netIncome,
      eps: latest.eps,
      isFact: true
    },
    {
      label: `FY${latest.year + 1} (Y+1)`,
      revenue: currentScenario.projections[0].revenue,
      operatingIncome: currentScenario.projections[0].operatingIncome,
      netIncome: currentScenario.projections[0].netIncome,
      eps: currentScenario.projections[0].eps,
      isFact: false
    },
    {
      label: `FY${latest.year + 3} (Y+3)`,
      revenue: currentScenario.projections[1].revenue,
      operatingIncome: currentScenario.projections[1].operatingIncome,
      netIncome: currentScenario.projections[1].netIncome,
      eps: currentScenario.projections[1].eps,
      isFact: false
    },
    {
      label: `FY${latest.year + 5} (Y+5)`,
      revenue: currentScenario.projections[2].revenue,
      operatingIncome: currentScenario.projections[2].operatingIncome,
      netIncome: currentScenario.projections[2].netIncome,
      eps: currentScenario.projections[2].eps,
      isFact: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Scenario Projections & Sensitivity Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            1-Year, 3-Year & 5-Year Financial Forecasts
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Pro-forma models anchored in audited historical SEC 10-K filings with explicit assumptions across Base, Bull, and Bear macroeconomic scenarios.
          </p>
        </div>

        {/* Fact vs Forecast Badge Callout */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            [HISTORICAL FACT]
          </span>
          <span className="text-slate-500 font-bold">vs</span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
            [PROJECTED ASSUMPTION]
          </span>
        </div>
      </div>

      {/* Scenario Selector & Assumptions Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scenario Switcher & Interactive Sliders */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Scenario & Assumption Controls</span>
            </h3>
            <button
              onClick={handleResetInputs}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Scenario Tabs */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveScenario('Base Case')}
              className={`py-2 rounded-lg font-semibold transition ${
                activeScenario === 'Base Case' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Base Case
            </button>
            <button
              onClick={() => setActiveScenario('Bull Case')}
              className={`py-2 rounded-lg font-semibold transition ${
                activeScenario === 'Bull Case' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bull Case
            </button>
            <button
              onClick={() => setActiveScenario('Bear Case')}
              className={`py-2 rounded-lg font-semibold transition ${
                activeScenario === 'Bear Case' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bear Case
            </button>
          </div>

          {/* Justification note */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong className="text-indigo-400">{activeScenario} Thesis:</strong> {currentScenario.assumptions.justification}
          </div>

          {/* Sliders */}
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Year 1 Revenue Growth:</span>
                <strong className="text-indigo-400 font-mono">+{currentScenario.assumptions.revenueGrowthYear1}%</strong>
              </div>
              <input
                type="range"
                min="0.0"
                max="35.0"
                step="0.5"
                value={customInputs.baseGrowthY1 ?? currentScenario.assumptions.revenueGrowthYear1}
                onChange={(e) => setCustomInputs({ ...customInputs, baseGrowthY1: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Operating Margin (EBIT):</span>
                <strong className="text-emerald-400 font-mono">{currentScenario.assumptions.operatingMargin}%</strong>
              </div>
              <input
                type="range"
                min="10.0"
                max="65.0"
                step="0.5"
                value={customInputs.operatingMargin ?? currentScenario.assumptions.operatingMargin}
                onChange={(e) => setCustomInputs({ ...customInputs, operatingMargin: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">CapEx as % of Revenue:</span>
                <strong className="text-cyan-400 font-mono">{currentScenario.assumptions.capexPercentOfSales}%</strong>
              </div>
              <input
                type="range"
                min="2.0"
                max="25.0"
                step="0.5"
                value={customInputs.capexPct ?? currentScenario.assumptions.capexPercentOfSales}
                onChange={(e) => setCustomInputs({ ...customInputs, capexPct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Annual Share Retirement (% Buyback):</span>
                <strong className="text-purple-400 font-mono">{Math.abs(currentScenario.assumptions.sharesAnnualChangePercent)}% p.a.</strong>
              </div>
              <input
                type="range"
                min="0.0"
                max="4.0"
                step="0.2"
                value={customInputs.shareBuybackPct ?? Math.abs(currentScenario.assumptions.sharesAnnualChangePercent)}
                onChange={(e) => setCustomInputs({ ...customInputs, shareBuybackPct: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: Revenue & EPS Projection Chart */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span>Revenue & EPS Trajectory ({activeScenario})</span>
              </h3>
              <span className="text-xs text-indigo-400 font-mono">1Y • 3Y • 5Y Outlook</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectionChartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="label" stroke="#64748b" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#6366f1" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="$" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue ($M)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="operatingIncome" name="Operating Income ($M)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="eps" name="Diluted EPS ($)" stroke="#10b981" strokeWidth={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Year 5 Compound Net Income:</span>
            <strong className="text-white font-mono text-sm">
              ${currentScenario.projections[2].netIncome.toLocaleString()}M (EPS: ${currentScenario.projections[2].eps.toFixed(2)})
            </strong>
          </div>
        </div>
      </div>

      {/* Pro-Forma Income Statement Table (1Y, 3Y, 5Y) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Pro-Forma Projected Financial Statements ({activeScenario})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Figures in Millions USD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-3">Statement Line Item</th>
                <th className="py-2.5 px-3 text-right bg-emerald-950/30 text-emerald-300 font-bold">
                  FY{latest.year} [FACT]
                </th>
                <th className="py-2.5 px-3 text-right bg-indigo-950/30 text-indigo-300 font-bold">
                  Year 1 [FY{latest.year + 1}]
                </th>
                <th className="py-2.5 px-3 text-right bg-indigo-950/30 text-indigo-300 font-bold">
                  Year 3 [FY{latest.year + 3}]
                </th>
                <th className="py-2.5 px-3 text-right bg-indigo-950/30 text-indigo-300 font-bold">
                  Year 5 [FY{latest.year + 5}]
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200 whitespace-nowrap">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Total Net Revenue</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400">${latest.revenue.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[0].revenue.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[1].revenue.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">${currentScenario.projections[2].revenue.toLocaleString()}M</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Gross Profit</td>
                <td className="py-2.5 px-3 text-right">${latest.grossProfit.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[0].grossProfit.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[1].grossProfit.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[2].grossProfit.toLocaleString()}M</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Operating Profit (EBIT)</td>
                <td className="py-2.5 px-3 text-right">${latest.operatingIncome.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[0].operatingIncome.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[1].operatingIncome.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right font-bold text-indigo-300">${currentScenario.projections[2].operatingIncome.toLocaleString()}M</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Net Income</td>
                <td className="py-2.5 px-3 text-right">${latest.netIncome.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[0].netIncome.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">${currentScenario.projections[1].netIncome.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">${currentScenario.projections[2].netIncome.toLocaleString()}M</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Free Cash Flow</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400">${latest.freeCashFlow.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right text-emerald-300">${currentScenario.projections[0].freeCashFlow.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right text-emerald-300">${currentScenario.projections[1].freeCashFlow.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right font-bold text-emerald-400">${currentScenario.projections[2].freeCashFlow.toLocaleString()}M</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Diluted Shares Outstanding</td>
                <td className="py-2.5 px-3 text-right">{latest.sharesDiluted.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">{currentScenario.projections[0].sharesDiluted.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right">{currentScenario.projections[1].sharesDiluted.toLocaleString()}M</td>
                <td className="py-2.5 px-3 text-right font-semibold text-purple-300">{currentScenario.projections[2].sharesDiluted.toLocaleString()}M</td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-sans font-semibold text-slate-100">Diluted EPS ($)</td>
                <td className="py-2.5 px-3 text-right font-bold text-white">${latest.eps.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-indigo-300 font-bold">${currentScenario.projections[0].eps.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-indigo-300 font-bold">${currentScenario.projections[1].eps.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right text-emerald-400 font-black text-sm">${currentScenario.projections[2].eps.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions Audit Trail Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Assumptions Audit Trail & Justification Matrix</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Transparency Disclosure</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3">Audited Fact Baseline</th>
                <th className="py-2.5 px-3">Base Assumption</th>
                <th className="py-2.5 px-3">Bull Assumption</th>
                <th className="py-2.5 px-3">Bear Assumption</th>
                <th className="py-2.5 px-3">Economic Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {projectionsData.assumptionsAuditTrail.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{item.parameter}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400">{item.historicalFactValue}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{item.baseAssumption}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-300">{item.bullAssumption}</td>
                  <td className="py-2.5 px-3 font-mono text-rose-300">{item.bearAssumption}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px] max-w-xs">{item.justification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
