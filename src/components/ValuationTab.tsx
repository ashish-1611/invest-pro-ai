import React, { useState } from 'react';
import { CompanyProfile } from '../types/financials';
import { calculateDCF, calculateGrahamValue, calculateMultiplesValuation, synthesizeCompositeValuation } from '../services/valuationEngine';
import { 
  Scale, 
  TrendingUp, 
  Sliders, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  RefreshCw,
  BarChart2,
  DollarSign
} from 'lucide-react';

interface ValuationTabProps {
  company: CompanyProfile;
}

export const ValuationTab: React.FC<ValuationTabProps> = ({ company }) => {
  const latest = company.historical[company.historical.length - 1];

  // Interactive DCF Sliders State
  const [customWacc, setCustomWacc] = useState<number | undefined>(undefined);
  const [customTerminalGrowth, setCustomTerminalGrowth] = useState<number | undefined>(undefined);
  const [customExitMultiple, setCustomExitMultiple] = useState<number | undefined>(undefined);
  const [customBondYield, setCustomBondYield] = useState<number>(5.25);

  const dcf = calculateDCF(company, {
    wacc: customWacc,
    terminalGrowthRate: customTerminalGrowth,
    exitMultiple: customExitMultiple
  });

  const graham = calculateGrahamValue(company, { aaaBondYield: customBondYield });
  const multiples = calculateMultiplesValuation(company);
  const composite = synthesizeCompositeValuation(company, dcf, graham, multiples);

  const handleResetDefaults = () => {
    setCustomWacc(undefined);
    setCustomTerminalGrowth(undefined);
    setCustomExitMultiple(undefined);
    setCustomBondYield(5.25);
  };

  const isUndervalued = composite.verdict.includes('Undervalued');
  const isOvervalued = composite.verdict.includes('Overvalued');

  // Football Field Chart Ranges
  const minVal = Math.min(
    company.currentPrice * 0.7,
    dcf.fairValuePerSharePerpetual * 0.8,
    graham.fairValue * 0.8,
    multiples.impliedFairValue * 0.8
  );
  const maxVal = Math.max(
    company.currentPrice * 1.3,
    dcf.fairValuePerShareExitMultiple * 1.2,
    graham.growthFormula * 1.1,
    multiples.impliedFairValue * 1.2
  );
  const valRange = maxVal - minVal;
  const getPercent = (val: number) => Math.min(Math.max(((val - minVal) / valRange) * 100, 0), 100);

  const footballFieldItems = [
    {
      name: 'DCF (Perpetual Gordon Growth)',
      low: dcf.fairValuePerSharePerpetual * 0.88,
      fair: dcf.fairValuePerSharePerpetual,
      high: dcf.fairValuePerSharePerpetual * 1.15,
      color: 'bg-indigo-500'
    },
    {
      name: 'DCF (Exit Multiple Method)',
      low: dcf.fairValuePerShareExitMultiple * 0.90,
      fair: dcf.fairValuePerShareExitMultiple,
      high: dcf.fairValuePerShareExitMultiple * 1.12,
      color: 'bg-cyan-500'
    },
    {
      name: 'Relative Multiples (P/E, EV/EBITDA, P/FCF)',
      low: multiples.impliedFairValue * 0.85,
      fair: multiples.impliedFairValue,
      high: multiples.impliedFairValue * 1.18,
      color: 'bg-emerald-500'
    },
    {
      name: 'Benjamin Graham Intrinsic Model',
      low: graham.adjustedFormula,
      fair: graham.fairValue,
      high: graham.growthFormula,
      color: 'bg-amber-500'
    },
    {
      name: 'Composite Weighted Fair Value',
      low: composite.weightedFairValue * 0.92,
      fair: composite.weightedFairValue,
      high: composite.weightedFairValue * 1.08,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Valuation Header & Verdict Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Scale className="w-4 h-4" />
            <span>Multi-Method Intrinsic Valuation Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Valuation Verdict: <span className={
              isUndervalued ? 'text-emerald-400' : isOvervalued ? 'text-rose-400' : 'text-amber-400'
            }>{composite.verdict}</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            {composite.rationale}
          </p>
        </div>

        {/* Valuation Badge Capsule */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">MARKET PRICE</div>
            <div className="text-2xl font-extrabold text-white font-mono">
              ${company.currentPrice.toFixed(2)}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">COMPOSITE FAIR VALUE</div>
            <div className="text-2xl font-extrabold text-indigo-400 font-mono">
              ${composite.weightedFairValue.toFixed(2)}
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">MARGIN OF SAFETY</div>
            <div className={`text-xl font-extrabold font-mono ${
              composite.marginOfSafetyPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {composite.marginOfSafetyPercent >= 0 ? `+${composite.marginOfSafetyPercent}%` : `${composite.marginOfSafetyPercent}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Football Field Chart: Range Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              <span>Valuation Football Field (Comparative Price Ranges)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Displays implied price bands across all applied models with the dashed line marking current market price.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-400"></span>
            <span className="text-slate-300 font-mono text-[11px]">Current Market Price (${company.currentPrice.toFixed(2)})</span>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          {footballFieldItems.map((item, idx) => {
            const leftPct = getPercent(item.low);
            const widthPct = Math.max(getPercent(item.high) - leftPct, 3);
            const fairPct = getPercent(item.fair);
            const currentPricePct = getPercent(company.currentPrice);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="font-mono text-slate-400">
                    Low: ${item.low.toFixed(1)} | <strong className="text-white">Fair: ${item.fair.toFixed(1)}</strong> | High: ${item.high.toFixed(1)}
                  </span>
                </div>

                <div className="relative h-6 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                  {/* Current Market Price Reference Line */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 border-l-2 border-dashed border-rose-400 z-20"
                    style={{ left: `${currentPricePct}%` }}
                    title={`Current Price: $${company.currentPrice.toFixed(2)}`}
                  />

                  {/* Valuation Range Bar */}
                  <div
                    className={`absolute top-1 bottom-1 rounded opacity-80 ${item.color}`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  />

                  {/* Fair Value Point Pip */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white z-10 rounded shadow-md"
                    style={{ left: `${fairPct}%` }}
                    title={`Mid Fair Value: $${item.fair.toFixed(2)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive DCF Model & Sensitivity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DCF Parameter Sliders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Interactive DCF Controls</span>
            </h3>
            <button
              onClick={handleResetDefaults}
              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
              title="Reset to default baseline"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Slider 1: WACC */}
          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Discount Rate (WACC):</span>
              <strong className="text-indigo-400 font-mono">{dcf.wacc.toFixed(2)}%</strong>
            </div>
            <input
              type="range"
              min="6.0"
              max="15.0"
              step="0.25"
              value={dcf.wacc}
              onChange={(e) => setCustomWacc(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Ke: {dcf.costOfEquity.toFixed(1)}% (Rf: {dcf.riskFreeRate}%, Beta: {company.beta})</span>
              <span>Kd (after-tax): {dcf.costOfDebtAfterTax.toFixed(1)}%</span>
            </div>
          </div>

          {/* Slider 2: Terminal Growth Rate */}
          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Terminal Growth Rate (g):</span>
              <strong className="text-cyan-400 font-mono">{dcf.terminalGrowthRate.toFixed(2)}%</strong>
            </div>
            <input
              type="range"
              min="1.0"
              max="4.5"
              step="0.25"
              value={dcf.terminalGrowthRate}
              onChange={(e) => setCustomTerminalGrowth(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">
              Long-term perpetual GDP growth expectation
            </div>
          </div>

          {/* Slider 3: Exit Multiple */}
          <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Exit Multiple (EV/EBITDA):</span>
              <strong className="text-emerald-400 font-mono">{dcf.exitMultiple.toFixed(1)}x</strong>
            </div>
            <input
              type="range"
              min="10.0"
              max="35.0"
              step="0.5"
              value={dcf.exitMultiple}
              onChange={(e) => setCustomExitMultiple(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[10px] text-slate-500">
              Terminal year EV / EBITDA exit assumption
            </div>
          </div>

          {/* DCF Outputs Capsule */}
          <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Gordon Growth Fair Value:</span>
              <strong className="text-white font-mono">${dcf.fairValuePerSharePerpetual.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Exit Multiple Fair Value:</span>
              <strong className="text-white font-mono">${dcf.fairValuePerShareExitMultiple.toFixed(2)}</strong>
            </div>
            <div className="h-px bg-indigo-800/60 my-1" />
            <div className="flex justify-between text-indigo-300 font-bold">
              <span>Selected DCF Fair Value:</span>
              <span className="text-base font-mono text-white">${dcf.selectedFairValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* 5-Year Explicit Cash Flows Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Explicit 5-Year Discounted Cash Flow Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Present Value Total: ${dcf.pvExplicitCashFlows.toLocaleString()}M</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Forecast Year</th>
                  <th className="py-2.5 px-3 text-right">Projected FCF ($M)</th>
                  <th className="py-2.5 px-3 text-right">Discount Factor (WACC)</th>
                  <th className="py-2.5 px-3 text-right">Present Value ($M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {dcf.projectedFcff.map((item) => (
                  <tr key={item.year} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-100">
                      Forecast Year {item.year} (FY{latest.year + item.year})
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      ${item.projectedFcf.toLocaleString()}M
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                      {item.discountFactor}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                      ${item.presentValue.toLocaleString()}M
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bridge: EV to Equity Value */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PV of Cash Flows</span>
              <strong className="text-white font-mono">${dcf.pvExplicitCashFlows.toLocaleString()}M</strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PV of Terminal Value</span>
              <strong className="text-white font-mono">${dcf.pvTerminalValuePerpetual.toLocaleString()}M</strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Net Cash / (Debt)</span>
              <strong className={`font-mono ${latest.netDebt < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                {latest.netDebt < 0 ? `+$${Math.abs(latest.netDebt).toLocaleString()}M` : `-$${latest.netDebt.toLocaleString()}M`}
              </strong>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Equity Value</span>
              <strong className="text-indigo-400 font-mono">${(dcf.equityValuePerpetual / 1000).toFixed(1)}B</strong>
            </div>
          </div>
        </div>
      </div>

      {/* WACC vs Terminal Growth Sensitivity Heatmap Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Sensitivity Analysis Matrix: WACC vs Terminal Growth Rate</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates fair value per share across 25 combinations of discount rates and perpetual terminal growth rates.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Current Price: ${company.currentPrice.toFixed(2)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-left">WACC \ Growth (g)</th>
                {dcf.sensitivityMatrix.growthValues.map((g, idx) => (
                  <th key={idx} className="py-2.5 px-3 font-mono font-semibold">
                    g = {g}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {dcf.sensitivityMatrix.waccValues.map((wVal, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 text-left font-bold text-slate-300 bg-slate-950/60">
                    WACC = {wVal}%
                  </td>
                  {dcf.sensitivityMatrix.fairValues[rIdx].map((cellVal, cIdx) => {
                    const isHigher = cellVal > company.currentPrice;
                    const isBase = rIdx === 2 && cIdx === 2;
                    return (
                      <td 
                        key={cIdx} 
                        className={`py-2.5 px-3 font-semibold transition ${
                          isBase 
                            ? 'bg-indigo-600/30 text-indigo-200 border-2 border-indigo-500' 
                            : isHigher 
                            ? 'text-emerald-400 bg-emerald-950/20' 
                            : 'text-rose-400 bg-rose-950/20'
                        }`}
                      >
                        ${cellVal.toFixed(1)}
                        {isBase && <span className="block text-[9px] text-indigo-300">Base</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benjamin Graham & Relative Multiples Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benjamin Graham Intrinsic Models */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-400" />
              <span>Benjamin Graham Intrinsic Value</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
              Fair: ${graham.fairValue.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Graham Growth Formula */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <strong className="text-slate-100">Graham Growth Formula:</strong>
                <span className="text-base font-bold text-amber-400 font-mono">${graham.growthFormula.toFixed(2)}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-mono">
                Formula: V = [EPS × (8.5 + 2g) × 4.4] / AAA_Yield
              </p>
              <div className="text-[10px] text-slate-500">
                Inputs: EPS ${graham.epsUsed.toFixed(2)} | g: {graham.growthRateUsed}% | AAA Yield: {graham.aaaBondYield}%
              </div>
            </div>

            {/* Classic Graham Formula */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <strong className="text-slate-100">Classic Graham Formula:</strong>
                <span className="text-base font-bold text-slate-200 font-mono">${graham.classicFormula.toFixed(2)}</span>
              </div>
              <p className="text-slate-400 text-[11px] font-mono">
                Formula: V = √(22.5 × EPS × BVPS)
              </p>
              <div className="text-[10px] text-slate-500">
                Inputs: EPS ${graham.epsUsed.toFixed(2)} | Book Value / Share: ${graham.bookValuePerShare.toFixed(2)}
              </div>
            </div>

            {/* Bond Yield Slider */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">AAA Corporate Bond Yield (Y):</span>
                <strong className="text-amber-400 font-mono">{customBondYield.toFixed(2)}%</strong>
              </div>
              <input
                type="range"
                min="3.5"
                max="7.5"
                step="0.25"
                value={customBondYield}
                onChange={(e) => setCustomBondYield(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Relative Multiples Benchmark */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Relative Multiples Valuation Benchmark</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              Fair: ${multiples.impliedFairValue.toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                <tr>
                  <th className="py-2 px-2.5">Multiple</th>
                  <th className="py-2 px-2.5 text-right">Actual</th>
                  <th className="py-2 px-2.5 text-right">Peer Median</th>
                  <th className="py-2 px-2.5 text-right">Implied Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-2.5 font-sans font-semibold">Trailing P/E</td>
                  <td className="py-2 px-2.5 text-right">{multiples.peTrailing.multiple.toFixed(1)}x</td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{multiples.peTrailing.peerMedian}x</td>
                  <td className="py-2 px-2.5 text-right font-bold text-white">${multiples.peTrailing.impliedPrice.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-2.5 font-sans font-semibold">EV / EBITDA</td>
                  <td className="py-2 px-2.5 text-right">{multiples.evToEbitda.multiple.toFixed(1)}x</td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{multiples.evToEbitda.peerMedian}x</td>
                  <td className="py-2 px-2.5 text-right font-bold text-white">${multiples.evToEbitda.impliedPrice.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-2.5 font-sans font-semibold">Price / FCF</td>
                  <td className="py-2 px-2.5 text-right">{multiples.priceToFcf.multiple.toFixed(1)}x</td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{multiples.priceToFcf.peerMedian}x</td>
                  <td className="py-2 px-2.5 text-right font-bold text-white">${multiples.priceToFcf.impliedPrice.toFixed(2)}</td>
                </tr>
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-2 px-2.5 font-sans font-semibold">Price / Book</td>
                  <td className="py-2 px-2.5 text-right">{multiples.priceToBook.multiple.toFixed(1)}x</td>
                  <td className="py-2 px-2.5 text-right text-slate-400">{multiples.priceToBook.peerMedian}x</td>
                  <td className="py-2 px-2.5 text-right font-bold text-white">${multiples.priceToBook.impliedPrice.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-semibold">PEG Ratio (Peter Lynch Metric):</span>
              <strong className="text-white font-mono text-sm">{multiples.pegRatio.ratio}x</strong>
            </div>
            <p className="text-slate-400 text-[11px] mt-1">
              {multiples.pegRatio.interpretation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
