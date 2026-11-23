import React from 'react';
import { CompanyProfile } from '../types/financials';
import { calculateHealthScores, identifyStrengthsAndWeaknesses } from '../services/financialAnalysisEngine';
import { calculateDCF, calculateGrahamValue, calculateMultiplesValuation, synthesizeCompositeValuation } from '../services/valuationEngine';
import { assessCompanyRisks } from '../services/riskAssessmentEngine';
import { generatePeerComparison } from '../services/peerComparisonEngine';
import { generateProjections } from '../services/projectionsEngine';
import { 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  Scale, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Layers,
  Sparkles,
  PieChart
} from 'lucide-react';

interface ExecutiveSummaryProps {
  company: CompanyProfile;
  onNavigateTab: (tabId: string) => void;
  onAskAiPreset: (presetId: string, question: string) => void;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  company,
  onNavigateTab,
  onAskAiPreset
}) => {
  const latest = company.historical[company.historical.length - 1];
  const prior = company.historical[company.historical.length - 2] || latest;
  
  const health = calculateHealthScores(company);
  const strengthsWeaknesses = identifyStrengthsAndWeaknesses(company);
  const dcf = calculateDCF(company);
  const graham = calculateGrahamValue(company);
  const multiples = calculateMultiplesValuation(company);
  const composite = synthesizeCompositeValuation(company, dcf, graham, multiples);
  const risks = assessCompanyRisks(company);
  const peerComp = generatePeerComparison(company);
  const projections = generateProjections(company);

  const topStrengths = strengthsWeaknesses.filter(s => s.type === 'strength').slice(0, 3);
  const topWeaknesses = strengthsWeaknesses.filter(s => s.type === 'weakness').slice(0, 3);

  // Verdict colors
  const isUndervalued = composite.verdict.includes('Undervalued');
  const isOvervalued = composite.verdict.includes('Overvalued');

  return (
    <div className="space-y-6">
      {/* Target Company Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {company.name} <span className="text-indigo-400 font-mono text-xl">({company.ticker})</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {company.exchange}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
                {company.sector}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-400 border border-slate-700/80">
                {company.industry}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {company.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span>Fiscal Year End: <strong className="text-slate-200">{company.fiscalYearEnd}</strong></span>
              <span>•</span>
              <span>Primary Source: <strong className="text-slate-200">{company.secFilingSource}</strong></span>
              <span>•</span>
              <span>Shares Diluted: <strong className="text-slate-200">{latest.sharesDiluted.toLocaleString()}M</strong></span>
            </div>
          </div>

          {/* Quick AI Presets Action Bar */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col gap-2 min-w-[280px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Research Assistant</span>
            </div>
            <button
              onClick={() => onAskAiPreset('healthy', 'Is this company financially healthy?')}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition border border-slate-800 hover:border-slate-700 flex items-center justify-between"
            >
              <span>Is this company financially healthy?</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onAskAiPreset('overvalued', 'Is this stock overvalued?')}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition border border-slate-800 hover:border-slate-700 flex items-center justify-between"
            >
              <span>Is this stock overvalued?</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => onAskAiPreset('risks', 'What are the major risks?')}
              className="text-left text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 transition border border-slate-800 hover:border-slate-700 flex items-center justify-between"
            >
              <span>What are the major risks?</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Pillars Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valuation Verdict */}
        <div 
          onClick={() => onNavigateTab('valuation')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Valuation Verdict</span>
            <Scale className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          </div>
          <div className={`text-lg font-bold ${
            isUndervalued ? 'text-emerald-400' : isOvervalued ? 'text-rose-400' : 'text-amber-400'
          }`}>
            {composite.verdict}
          </div>
          <div className="text-xs text-slate-300 mt-2 flex items-center justify-between">
            <span>Fair Value: <strong className="text-white">${composite.weightedFairValue.toFixed(2)}</strong></span>
            <span className={`font-semibold ${composite.marginOfSafetyPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {composite.marginOfSafetyPercent >= 0 ? `+${composite.marginOfSafetyPercent}% margin` : `${composite.marginOfSafetyPercent}%`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
            Blends DCF intrinsic model, Graham formula, and relative multiples benchmark.
          </p>
        </div>

        {/* Card 2: Financial Health */}
        <div 
          onClick={() => onNavigateTab('health')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Financial Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>F-Score: {health.piotroskiFScore.score}/9</span>
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
              health.piotroskiFScore.score >= 7 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {health.piotroskiFScore.rating}
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-2 flex items-center justify-between">
            <span>Altman Z-Score: <strong className="text-white">{health.altmanZScore.score.toFixed(2)}</strong></span>
            <span className="text-emerald-400 font-semibold">{health.altmanZScore.zone}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
            Low insolvency probability; clean accruals confirmed by Beneish M-Score.
          </p>
        </div>

        {/* Card 3: Capital Efficiency (ROCE & ROE) */}
        <div 
          onClick={() => onNavigateTab('ratios')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Capital Return</span>
            <TrendingUp className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>ROCE: {latest.roce.toFixed(1)}%</span>
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {latest.roce > 25 ? 'Elite' : 'Adequate'}
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-2 flex items-center justify-between">
            <span>ROE: <strong className="text-white">{latest.roe.toFixed(1)}%</strong></span>
            <span>FCF Conv: <strong className="text-emerald-400">{latest.fcfConversion.toFixed(1)}%</strong></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
            EBIT return on capital employed substantially exceeds weighted cost of capital.
          </p>
        </div>

        {/* Card 4: Risk Profile */}
        <div 
          onClick={() => onNavigateTab('risks')}
          className="cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg group"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Risk Level</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
          </div>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>{risks.overallRiskLevel} Risk</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              Score: {risks.riskScore}/100
            </span>
          </div>
          <div className="text-xs text-slate-300 mt-2 flex items-center justify-between">
            <span>Economic Moat:</span>
            <strong className="text-indigo-300">{peerComp.competitiveMoatSummary.hasWideMoat ? 'Wide Moat' : 'Narrow Moat'}</strong>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
            Monitored on antitrust, geopolitical supply chain, and CapEx intensity.
          </p>
        </div>
      </div>

      {/* Two Column: Top Strengths vs Top Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Verified Financial Strengths</h2>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {topStrengths.map(s => (
              <div key={s.id} className="bg-slate-950/70 border border-emerald-900/30 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {s.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                    {s.currentValue}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {s.description}
                </p>
                <div className="bg-slate-900/90 px-3 py-1.5 rounded text-[11px] text-slate-400 border border-slate-800/80 font-mono">
                  <strong className="text-emerald-400">Audited Evidence:</strong> {s.supportingEvidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses & Sensitivities Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              <h2 className="text-base font-bold text-white">Weaknesses & Watch Items</h2>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {topWeaknesses.length > 0 ? (
              topWeaknesses.map(w => (
                <div key={w.id} className="bg-slate-950/70 border border-rose-900/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      {w.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-800/60">
                      {w.currentValue}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {w.description}
                  </p>
                  <div className="bg-slate-900/90 px-3 py-1.5 rounded text-[11px] text-slate-400 border border-slate-800/80 font-mono">
                    <strong className="text-rose-400">Audited Evidence:</strong> {w.supportingEvidence}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No major operational weaknesses detected on standard screening metrics.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segment Revenue Breakdown & Trajectory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Segment Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">Segment Revenue Breakdown (FY{latest.year})</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">SEC Note on Segments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Segment Name</th>
                  <th className="py-2.5 px-3 text-right">Revenue ($M)</th>
                  <th className="py-2.5 px-3 text-right">Share of Total</th>
                  <th className="py-2.5 px-3 text-right">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {company.segments.map((seg, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      {seg.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      ${seg.revenue.toLocaleString()}M
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {seg.share.toFixed(1)}%
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      seg.growthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {seg.growthYoY >= 0 ? `+${seg.growthYoY.toFixed(1)}%` : `${seg.growthYoY.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5-Year Projections Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Base Projections</span>
              </h3>
              <span className="bg-indigo-950 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-800">
                Base Case
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Financial trajectory based on stated organic expansion and share retirements:
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400">Year 1 Projected Rev:</span>
                <strong className="text-white font-mono">
                  ${projections.scenarios[0].projections[0].revenue.toLocaleString()}M (+{projections.scenarios[0].assumptions.revenueGrowthYear1}%)
                </strong>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400">Year 3 Projected Rev:</span>
                <strong className="text-white font-mono">
                  ${projections.scenarios[0].projections[1].revenue.toLocaleString()}M (+{projections.scenarios[0].assumptions.revenueGrowthYear3}%)
                </strong>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400">Year 5 Projected Rev:</span>
                <strong className="text-white font-mono">
                  ${projections.scenarios[0].projections[2].revenue.toLocaleString()}M (+{projections.scenarios[0].assumptions.revenueGrowthYear5}%)
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('projections')}
            className="w-full mt-4 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <span>Explore Bull / Bear Scenarios</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
