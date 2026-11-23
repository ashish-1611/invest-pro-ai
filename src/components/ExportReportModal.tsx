import React, { useState } from 'react';
import type { CompanyProfile } from '../types/financials';
import { calculateHealthScores, calculateDuPont } from '../services/financialAnalysisEngine';
import { calculateDCF, calculateGrahamValue, calculateMultiplesValuation, synthesizeCompositeValuation } from '../services/valuationEngine';
import { assessCompanyRisks } from '../services/riskAssessmentEngine';
import { generatePeerComparison } from '../services/peerComparisonEngine';
import { generateProjections } from '../services/projectionsEngine';
import { 
  X, 
  Printer, 
  Copy, 
  Download, 
  Check, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';

interface ExportReportModalProps {
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  company,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const latest = company.historical[company.historical.length - 1];
  const health = calculateHealthScores(company);
  const dupont = calculateDuPont(company);
  const dcf = calculateDCF(company);
  const graham = calculateGrahamValue(company);
  const multiples = calculateMultiplesValuation(company);
  const composite = synthesizeCompositeValuation(company, dcf, graham, multiples);
  const risks = assessCompanyRisks(company);
  const peerComp = generatePeerComparison(company);
  const projections = generateProjections(company);
  const baseProj = projections.scenarios[0];

  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Markdown format generation
  const markdownReport = `# INSTITUTIONAL EQUITY RESEARCH MEMORANDUM
**TARGET**: ${company.name} (${company.ticker}) | **EXCHANGE**: ${company.exchange}
**DATE**: ${reportDate} | **ANALYST**: Invest-AI Research Terminal
**FILING SOURCE**: ${company.secFilingSource}

---

## 1. EXECUTIVE SUMMARY & VALUATION VERDICT
- **Current Market Price**: $${company.currentPrice.toFixed(2)}
- **Market Capitalization**: $${(company.marketCap / 1000).toFixed(1)}B
- **Composite Fair Value**: $${composite.weightedFairValue.toFixed(2)}
- **Valuation Stance**: **${composite.verdict.toUpperCase()}**
- **Margin of Safety**: ${composite.marginOfSafetyPercent >= 0 ? `+${composite.marginOfSafetyPercent.toFixed(1)}% (Discount)` : `${composite.marginOfSafetyPercent.toFixed(1)}% (Premium)`}
- **Confidence Rating**: ${composite.confidenceLevel}

### Multi-Method Intrinsic Value Breakdown:
1. **DCF Perpetual Growth (${dcf.terminalGrowthRate}%, WACC ${dcf.wacc}%)**: $${dcf.fairValuePerSharePerpetual.toFixed(2)}
2. **DCF Exit Multiple (${dcf.exitMultiple}x EV/EBITDA)**: $${dcf.fairValuePerShareExitMultiple.toFixed(2)}
3. **Graham Intrinsic Formula**: $${graham.fairValue.toFixed(2)}
4. **Relative Multiples Median**: $${multiples.impliedFairValue.toFixed(2)}

---

## 2. AUDITED FINANCIAL BASELINE (FY${latest.year})
- **Total Revenue**: $${latest.revenue.toLocaleString()}M (+${latest.revenueGrowthYoY.toFixed(1)}% YoY)
- **Gross Profit**: $${latest.grossProfit.toLocaleString()}M (${latest.grossMargin.toFixed(1)}% margin)
- **Operating Income (EBIT)**: $${latest.operatingIncome.toLocaleString()}M (${latest.operatingMargin.toFixed(1)}% margin)
- **Net Income**: $${latest.netIncome.toLocaleString()}M (${latest.netMargin.toFixed(1)}% margin)
- **Diluted EPS**: $${latest.eps.toFixed(2)}
- **Free Cash Flow**: $${latest.freeCashFlow.toLocaleString()}M (Conversion: ${latest.fcfConversion.toFixed(1)}%)
- **Total Debt**: $${latest.totalDebt.toLocaleString()}M
- **Cash & Liquid Investments**: $${latest.totalCashAndInvestments.toLocaleString()}M
- **Net Debt**: ${latest.netDebt < 0 ? `-$${Math.abs(latest.netDebt).toLocaleString()}M (Net Cash)` : `+$${latest.netDebt.toLocaleString()}M`}

---

## 3. FINANCIAL HEALTH, LEVERAGE & DUPONT ANALYSIS
- **Piotroski F-Score**: ${health.piotroskiFScore.score}/9 (${health.piotroskiFScore.rating})
- **Altman Z-Score**: ${health.altmanZScore.score.toFixed(2)} (${health.altmanZScore.zone})
- **Beneish M-Score**: ${health.beneishMScore.score.toFixed(2)} (${health.beneishMScore.manipulationRisk} Earnings Manipulation Risk)
- **Interest Coverage**: ${latest.interestCoverage.toFixed(1)}x
- **Return on Equity (ROE)**: ${latest.roe.toFixed(1)}% (Primary Driver: ${dupont.driverOfRoe})
- **Return on Capital Employed (ROCE)**: ${latest.roce.toFixed(1)}%

---

## 4. 1-YEAR, 3-YEAR & 5-YEAR PROJECTIONS (BASE CASE)
- **Assumptions**: Revenue growth of +${baseProj.assumptions.revenueGrowthYear1}% in Y1, +${baseProj.assumptions.revenueGrowthYear3}% in Y3, +${baseProj.assumptions.revenueGrowthYear5}% in Y5; Operating Margin ${baseProj.assumptions.operatingMargin}%; Tax Rate ${baseProj.assumptions.taxRate}%.
- **Year 1**: Revenue $${baseProj.projections[0].revenue.toLocaleString()}M | EBIT $${baseProj.projections[0].operatingIncome.toLocaleString()}M | Net Income $${baseProj.projections[0].netIncome.toLocaleString()}M | EPS $${baseProj.projections[0].eps.toFixed(2)}
- **Year 3**: Revenue $${baseProj.projections[1].revenue.toLocaleString()}M | EBIT $${baseProj.projections[1].operatingIncome.toLocaleString()}M | Net Income $${baseProj.projections[1].netIncome.toLocaleString()}M | EPS $${baseProj.projections[1].eps.toFixed(2)}
- **Year 5**: Revenue $${baseProj.projections[2].revenue.toLocaleString()}M | EBIT $${baseProj.projections[2].operatingIncome.toLocaleString()}M | Net Income $${baseProj.projections[2].netIncome.toLocaleString()}M | EPS $${baseProj.projections[2].eps.toFixed(2)}

---

## 5. 4-PILLAR RISK ASSESSMENT (COMPOSITE RISK: ${risks.overallRiskLevel.toUpperCase()})
- **Business Risk**: ${risks.risksByCategory[0].items[0]?.title || 'Market competition'}
- **Financial Risk**: ${risks.risksByCategory[1].items[0]?.title || 'CapEx escalation'}
- **Governance Risk**: ${risks.risksByCategory[2].items[0]?.title || 'Key talent retention'}
- **Market & Macro Risk**: ${risks.risksByCategory[3].items[0]?.title || 'Antitrust scrutiny'}

---

## 6. MANDATORY REGULATORY COMPLIANCE NOTICE
This report is generated strictly for informational and quantitative due diligence purposes. It does not constitute investment advice or a recommendation to buy or sell securities. Past performance is no guarantee of future returns. Forecasts are model outputs based on hypothetical assumptions.
`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${company.ticker}_Investment_Research_Memo.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Institutional Equity Research Memorandum
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Formatted for Investment Committee & Portfolio Managers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              title="Print Memo"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-500/20 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable / Preview Content */}
        <div className="flex-1 overflow-auto p-8 bg-slate-950 text-slate-200 font-sans space-y-6 text-xs sm:text-sm">
          {/* Header Title Block */}
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold">
                INVEST-AI RESEARCH TERMINAL • CONFIDENTIAL MEMO
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{reportDate}</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {company.name} ({company.ticker})
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span>Exchange: {company.exchange}</span>
              <span>•</span>
              <span>Sector: {company.sector} ({company.industry})</span>
              <span>•</span>
              <span>Source: {company.secFilingSource}</span>
            </div>
          </div>

          {/* Valuation Stance Pill */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">MARKET PRICE</div>
              <div className="text-lg font-bold text-white">${company.currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">COMPOSITE FAIR VALUE</div>
              <div className="text-lg font-bold text-indigo-400">${composite.weightedFairValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">VALUATION VERDICT</div>
              <div className={`text-base font-extrabold ${composite.verdict.includes('Undervalued') ? 'text-emerald-400' : composite.verdict.includes('Overvalued') ? 'text-rose-400' : 'text-amber-400'}`}>
                {composite.verdict}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">MARGIN OF SAFETY</div>
              <div className="text-lg font-bold text-slate-200">
                {composite.marginOfSafetyPercent >= 0 ? `+${composite.marginOfSafetyPercent.toFixed(1)}%` : `${composite.marginOfSafetyPercent.toFixed(1)}%`}
              </div>
            </div>
          </div>

          {/* Key Fundamental Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
              Audited Financial Baseline (FY{latest.year})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Revenue</span>
                <div className="font-semibold text-white">${latest.revenue.toLocaleString()}M</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Operating Margin</span>
                <div className="font-semibold text-emerald-400">{latest.operatingMargin.toFixed(1)}%</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">Free Cash Flow</span>
                <div className="font-semibold text-white">${latest.freeCashFlow.toLocaleString()}M</div>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px]">ROCE Efficiency</span>
                <div className="font-semibold text-emerald-400">{latest.roce.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Health Scores */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Solvency & Health Indicators
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Piotroski F-Score</span>
                <div className="text-base font-bold text-white mt-0.5">{health.piotroskiFScore.score}/9 ({health.piotroskiFScore.rating})</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Altman Z-Score</span>
                <div className="text-base font-bold text-white mt-0.5">{health.altmanZScore.score.toFixed(2)} ({health.altmanZScore.zone})</div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px]">Net Debt Status</span>
                <div className="text-base font-bold text-white mt-0.5">
                  {latest.netDebt < 0 ? `-$${Math.abs(latest.netDebt).toLocaleString()}M (Net Cash)` : `+$${latest.netDebt.toLocaleString()}M`}
                </div>
              </div>
            </div>
          </div>

          {/* Projections Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider">
              1-Year, 3-Year & 5-Year Financial Projections (Base Case)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="p-2 font-semibold">Horizon</th>
                    <th className="p-2 text-right font-semibold">Revenue</th>
                    <th className="p-2 text-right font-semibold">Operating Profit</th>
                    <th className="p-2 text-right font-semibold">Net Income</th>
                    <th className="p-2 text-right font-semibold">FCF</th>
                    <th className="p-2 text-right font-semibold">EPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950/60 font-mono">
                  <tr>
                    <td className="p-2 font-sans font-medium text-white">FY{latest.year + 1} (1Y)</td>
                    <td className="p-2 text-right text-indigo-300">${baseProj.projections[0].revenue.toLocaleString()}M</td>
                    <td className="p-2 text-right">${baseProj.projections[0].operatingIncome.toLocaleString()}M</td>
                    <td className="p-2 text-right text-emerald-400">${baseProj.projections[0].netIncome.toLocaleString()}M</td>
                    <td className="p-2 text-right">${baseProj.projections[0].freeCashFlow.toLocaleString()}M</td>
                    <td className="p-2 text-right text-white font-bold">${baseProj.projections[0].eps.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-white">FY{latest.year + 3} (3Y)</td>
                    <td className="p-2 text-right text-indigo-300">${baseProj.projections[1].revenue.toLocaleString()}M</td>
                    <td className="p-2 text-right">${baseProj.projections[1].operatingIncome.toLocaleString()}M</td>
                    <td className="p-2 text-right text-emerald-400">${baseProj.projections[1].netIncome.toLocaleString()}M</td>
                    <td className="p-2 text-right">${baseProj.projections[1].freeCashFlow.toLocaleString()}M</td>
                    <td className="p-2 text-right text-white font-bold">${baseProj.projections[1].eps.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-sans font-medium text-white">FY{latest.year + 5} (5Y)</td>
                    <td className="p-2 text-right text-indigo-300">${baseProj.projections[2].revenue.toLocaleString()}M</td>
                    <td className="p-2 text-right">${baseProj.projections[2].operatingIncome.toLocaleString()}M</td>
                    <td className="p-2 text-right text-emerald-400">${baseProj.projections[2].netIncome.toLocaleString()}M</td>
                    <td className="p-2 text-right">${baseProj.projections[2].freeCashFlow.toLocaleString()}M</td>
                    <td className="p-2 text-right text-white font-bold">${baseProj.projections[2].eps.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory Disclaimer */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-normal flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Mandatory Compliance Notice:</span> This memorandum was generated by Invest-AI quantitative algorithms based strictly on historical audited SEC 10-K filings. This document does not constitute investment advice or a recommendation to transact in any security. Past performance is not indicative of future returns.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
