import React, { useState } from 'react';
import type { CompanyProfile, FinancialYearData } from '../types/financials';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  Database,
  Building
} from 'lucide-react';

interface FinancialStatementsModalProps {
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialStatementsModal: React.FC<FinancialStatementsModalProps> = ({
  company,
  isOpen,
  onClose
}) => {
  const [statementType, setStatementType] = useState<'income' | 'balance' | 'cashflow' | 'ratios'>('income');
  const [isExported, setIsExported] = useState(false);

  if (!isOpen) return null;

  const h = company.historical;
  const years = h.map(d => d.year);

  // Helper to format currency/numbers
  const fmt = (num: number, isPercent = false, isPerShare = false) => {
    if (num === undefined || num === null || isNaN(num)) return '-';
    if (isPercent) return `${num.toFixed(1)}%`;
    if (isPerShare) return `$${num.toFixed(2)}`;
    return `$${num.toLocaleString()}M`;
  };

  const handleExportCsv = () => {
    let csvRows: string[] = [];
    csvRows.push(`Financial Statement Export for ${company.name} (${company.ticker})`);
    csvRows.push(`Source: ${company.secFilingSource}`);
    csvRows.push('');
    csvRows.push(['Metric', ...years.map(y => `FY${y}`)].join(','));

    if (statementType === 'income') {
      csvRows.push(['Revenue ($M)', ...h.map(d => d.revenue)].join(','));
      csvRows.push(['Revenue Growth YoY (%)', ...h.map(d => d.revenueGrowthYoY.toFixed(1))].join(','));
      csvRows.push(['Gross Profit ($M)', ...h.map(d => d.grossProfit)].join(','));
      csvRows.push(['Gross Margin (%)', ...h.map(d => d.grossMargin.toFixed(1))].join(','));
      csvRows.push(['Operating Income EBIT ($M)', ...h.map(d => d.operatingIncome)].join(','));
      csvRows.push(['Operating Margin (%)', ...h.map(d => d.operatingMargin.toFixed(1))].join(','));
      csvRows.push(['Net Income ($M)', ...h.map(d => d.netIncome)].join(','));
      csvRows.push(['Net Margin (%)', ...h.map(d => d.netMargin.toFixed(1))].join(','));
      csvRows.push(['Diluted EPS ($)', ...h.map(d => d.eps.toFixed(2))].join(','));
    } else if (statementType === 'balance') {
      csvRows.push(['Cash & Liquid Investments ($M)', ...h.map(d => d.totalCashAndInvestments)].join(','));
      csvRows.push(['Total Current Assets ($M)', ...h.map(d => d.totalCurrentAssets)].join(','));
      csvRows.push(['Total Assets ($M)', ...h.map(d => d.totalAssets)].join(','));
      csvRows.push(['Short-Term Debt ($M)', ...h.map(d => d.shortTermDebt)].join(','));
      csvRows.push(['Long-Term Debt ($M)', ...h.map(d => d.longTermDebt)].join(','));
      csvRows.push(['Total Debt ($M)', ...h.map(d => d.totalDebt)].join(','));
      csvRows.push(['Total Liabilities ($M)', ...h.map(d => d.totalLiabilities)].join(','));
      csvRows.push(['Total Stockholders Equity ($M)', ...h.map(d => d.totalEquity)].join(','));
    } else if (statementType === 'cashflow') {
      csvRows.push(['Operating Cash Flow ($M)', ...h.map(d => d.operatingCashFlow)].join(','));
      csvRows.push(['Capital Expenditures ($M)', ...h.map(d => d.capitalExpenditures)].join(','));
      csvRows.push(['Free Cash Flow ($M)', ...h.map(d => d.freeCashFlow)].join(','));
      csvRows.push(['FCF Conversion (%)', ...h.map(d => d.fcfConversion.toFixed(1))].join(','));
      csvRows.push(['Share Repurchases ($M)', ...h.map(d => d.shareRepurchases)].join(','));
      csvRows.push(['Dividends Paid ($M)', ...h.map(d => d.dividendsPaid)].join(','));
    } else {
      csvRows.push(['P/E Ratio', ...h.map(d => d.peRatio.toFixed(1))].join(','));
      csvRows.push(['EV/EBITDA', ...h.map(d => d.evToEbitda.toFixed(1))].join(','));
      csvRows.push(['ROE (%)', ...h.map(d => d.roe.toFixed(1))].join(','));
      csvRows.push(['ROCE (%)', ...h.map(d => d.roce.toFixed(1))].join(','));
      csvRows.push(['ROIC (%)', ...h.map(d => d.roic.toFixed(1))].join(','));
      csvRows.push(['Debt-to-Equity', ...h.map(d => d.debtToEquity.toFixed(2))].join(','));
      csvRows.push(['Interest Coverage (x)', ...h.map(d => d.interestCoverage.toFixed(1))].join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${company.ticker}_Financial_Statements_${statementType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Audited 5-Year Financial Statements: {company.name} ({company.ticker})
                </h3>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  SEC Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {company.secFilingSource}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              title="Download CSV"
            >
              {isExported ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex gap-2 overflow-x-auto">
          {[
            { id: 'income', label: 'Consolidated Statement of Operations (Income)' },
            { id: 'balance', label: 'Consolidated Balance Sheet' },
            { id: 'cashflow', label: 'Statement of Cash Flows' },
            { id: 'ratios', label: 'Audited Key Ratios & Per Share' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatementType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statementType === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 sticky top-0">
                <th className="py-2.5 px-3 font-semibold text-slate-300">Line Item / Metric</th>
                {years.map(y => (
                  <th key={y} className="py-2.5 px-3 text-right font-mono font-semibold text-slate-300">
                    FY{y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {statementType === 'income' && (
                <>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-white">Total Revenue</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold text-indigo-300">{fmt(d.revenue)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-3 pl-6">YoY Revenue Growth (%)</td>
                    {h.map(d => (
                      <td key={d.year} className={`py-2 px-3 text-right font-mono ${d.revenueGrowthYoY >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {d.revenueGrowthYoY >= 0 ? '+' : ''}{fmt(d.revenueGrowthYoY, true)}
                      </td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Gross Profit</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.grossProfit)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-3 pl-6">Gross Margin (%)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.grossMargin, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/30">
                    <td className="py-2 px-3 font-medium text-white">Operating Income (EBIT)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold text-white">{fmt(d.operatingIncome)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-3 pl-6">Operating Margin (%)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono text-emerald-400">{fmt(d.operatingMargin, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">EBITDA</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.ebitda)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">Interest Expense</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono text-rose-300">{fmt(d.interestExpense)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/30">
                    <td className="py-2 px-3 font-bold text-white">Net Income</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{fmt(d.netIncome)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-3 pl-6">Net Margin (%)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.netMargin, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Diluted Earnings Per Share</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-indigo-300">{fmt(d.eps, false, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-3 pl-6">Diluted Weighted Average Shares (M)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{d.sharesDiluted.toLocaleString()}M</td>)}
                  </tr>
                </>
              )}

              {statementType === 'balance' && (
                <>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-emerald-400">Cash and Cash Equivalents</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.cashAndEquivalents)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-emerald-400">Short-Term Marketable Securities</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.shortTermInvestments)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/30">
                    <td className="py-2 px-3 font-bold text-emerald-300">Total Liquid Reserves (Cash + Securities)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-emerald-300">{fmt(d.totalCashAndInvestments)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">Accounts Receivable</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.accountsReceivable)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">Inventories</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.inventory)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Total Current Assets</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold">{fmt(d.totalCurrentAssets)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">Property, Plant and Equipment (Net)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.propertyPlantEquipment)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/40">
                    <td className="py-2 px-3 font-bold text-white">Total Assets</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-indigo-300">{fmt(d.totalAssets)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-rose-300">Short-Term Debt & Borrowings</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.shortTermDebt)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Total Current Liabilities</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.totalCurrentLiabilities)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-rose-300">Long-Term Debt</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.longTermDebt)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/30">
                    <td className="py-2 px-3 font-bold text-rose-400">Total Outstanding Debt</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-rose-400">{fmt(d.totalDebt)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Total Liabilities</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.totalLiabilities)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/40">
                    <td className="py-2 px-3 font-bold text-white">Total Stockholders' Equity</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-white">{fmt(d.totalEquity)}</td>)}
                  </tr>
                </>
              )}

              {statementType === 'cashflow' && (
                <>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/30">
                    <td className="py-2 px-3 font-bold text-emerald-400">Cash Flow from Operations (OCF)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{fmt(d.operatingCashFlow)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-rose-300">Capital Expenditures (CapEx)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono text-rose-300">{fmt(d.capitalExpenditures)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 bg-slate-950/40">
                    <td className="py-2 px-3 font-bold text-white">Free Cash Flow (FCF = OCF - CapEx)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-bold text-indigo-300">{fmt(d.freeCashFlow)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40 text-slate-400">
                    <td className="py-2 px-3 pl-6">FCF Conversion (% of Net Income)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono text-emerald-400">{fmt(d.fcfConversion, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">Share Repurchases (Buybacks)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.shareRepurchases)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3">Common Dividends Paid</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.dividendsPaid)}</td>)}
                  </tr>
                </>
              )}

              {statementType === 'ratios' && (
                <>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Trailing Price / Earnings (P/E)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold">{d.peRatio.toFixed(1)}x</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">EV / EBITDA</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{d.evToEbitda.toFixed(1)}x</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-emerald-400">Return on Equity (ROE %)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">{fmt(d.roe, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium text-emerald-400">Return on Capital Employed (ROCE %)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">{fmt(d.roce, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Return on Invested Capital (ROIC %)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{fmt(d.roic, true)}</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Debt to Equity Ratio</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{d.debtToEquity.toFixed(2)}x</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Interest Coverage Ratio (EBIT / Interest)</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono font-semibold text-emerald-400">{d.interestCoverage.toFixed(1)}x</td>)}
                  </tr>
                  <tr className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-medium">Current Ratio</td>
                    {h.map(d => <td key={d.year} className="py-2 px-3 text-right font-mono">{d.currentRatio.toFixed(2)}</td>)}
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>All dollar amounts in Millions USD (except per-share).</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
