import { 
  CompanyProfile, 
  DcfValuationResult, 
  GrahamValuationResult, 
  MultiplesValuationResult, 
  CompositeValuationSummary 
} from '../types/financials';
import { findIndustryForCompany } from '../data/industryBenchmarks';

export interface ValuationOverrides {
  wacc?: number;
  terminalGrowthRate?: number;
  exitMultiple?: number;
  fcfGrowthRates?: number[]; // 5 years
  aaaBondYield?: number;
}

export function calculateDCF(
  company: CompanyProfile, 
  overrides?: ValuationOverrides
): DcfValuationResult {
  const latest = company.historical[company.historical.length - 1];
  const industry = findIndustryForCompany(company.ticker);
  
  // WACC Parameters
  const riskFreeRate = overrides?.wacc ? (overrides.wacc * 0.45) : (industry.riskFreeRate || 4.40);
  const equityRiskPremium = industry.equityRiskPremium || 5.00;
  const beta = company.beta || 1.10;
  
  // CAPM Cost of Equity: Ke = Rf + Beta * ERP
  const costOfEquity = riskFreeRate + (beta * equityRiskPremium);
  
  // Cost of Debt: Kd = (Interest Expense / Total Debt) * (1 - Tax Rate)
  const interestRate = latest.totalDebt > 0 ? (latest.interestExpense / latest.totalDebt) : (company.currency === 'INR' ? 0.075 : 0.04);
  const taxRate = company.currency === 'INR' ? 0.25 : 0.21; // Indian Corporate Tax (25.17%) vs US (21%)
  const costOfDebtAfterTax = interestRate * (1 - taxRate) * 100;
  
  // Capital Structure Weights
  const equityValueMarket = company.marketCap;
  const totalDebt = latest.totalDebt;
  const totalCap = equityValueMarket + totalDebt;
  const we = equityValueMarket / (totalCap || 1);
  const wd = totalDebt / (totalCap || 1);
  
  const calculatedWacc = overrides?.wacc !== undefined 
    ? overrides.wacc 
    : Number(((we * costOfEquity) + (wd * costOfDebtAfterTax)).toFixed(2));
    
  const terminalGrowthRate = overrides?.terminalGrowthRate !== undefined 
    ? overrides.terminalGrowthRate 
    : 2.5; // Long term GDP growth rate %
    
  const exitMultiple = overrides?.exitMultiple !== undefined 
    ? overrides.exitMultiple 
    : industry.medianEvEbitda || 20.0;

  // 5-Year Explicit Forecast of FCF
  const baseFcf = latest.freeCashFlow > 0 ? latest.freeCashFlow : (latest.operatingCashFlow * 0.7);
  // Default growth trajectory tapering down
  const defaultGrowth = [12.0, 10.0, 8.5, 7.0, 5.5];
  const growthRates = overrides?.fcfGrowthRates || defaultGrowth;
  
  const projectedFcff = [];
  let pvExplicitCashFlows = 0;
  let runningFcf = baseFcf;
  
  for (let i = 0; i < 5; i++) {
    const yearIndex = i + 1;
    const g = (growthRates[i] !== undefined ? growthRates[i] : 8.0) / 100;
    runningFcf = runningFcf * (1 + g);
    const discountFactor = 1 / Math.pow(1 + (calculatedWacc / 100), yearIndex);
    const pv = runningFcf * discountFactor;
    pvExplicitCashFlows += pv;
    
    projectedFcff.push({
      year: yearIndex,
      projectedFcf: Math.round(runningFcf),
      discountFactor: Number(discountFactor.toFixed(4)),
      presentValue: Math.round(pv)
    });
  }

  const finalYearFcf = runningFcf;
  const discountFactor5 = 1 / Math.pow(1 + (calculatedWacc / 100), 5);
  
  // Method 1: Perpetual Growth (Gordon Growth)
  // TV = FCF_5 * (1 + g) / (WACC - g)
  const waccDec = calculatedWacc / 100;
  const gDec = terminalGrowthRate / 100;
  const spread = Math.max(waccDec - gDec, 0.015);
  const terminalValuePerpetual = (finalYearFcf * (1 + gDec)) / spread;
  const pvTerminalValuePerpetual = terminalValuePerpetual * discountFactor5;
  const enterpriseValuePerpetual = pvExplicitCashFlows + pvTerminalValuePerpetual;
  
  // Equity Value = EV + Total Cash - Total Debt
  const netDebtAdjustment = latest.totalCashAndInvestments - latest.totalDebt;
  const equityValuePerpetual = enterpriseValuePerpetual + netDebtAdjustment;
  const shares = company.sharesOutstanding || latest.sharesDiluted || 1;
  const fairValuePerSharePerpetual = Math.max(Number((equityValuePerpetual / shares).toFixed(2)), 1.0);

  // Method 2: Exit Multiple
  // TV = Year 5 EBITDA * Exit Multiple
  const projectedYear5Ebitda = latest.ebitda * Math.pow(1.08, 5);
  const terminalValueExitMultiple = projectedYear5Ebitda * exitMultiple;
  const pvTerminalValueExitMultiple = terminalValueExitMultiple * discountFactor5;
  const enterpriseValueExitMultiple = pvExplicitCashFlows + pvTerminalValueExitMultiple;
  const equityValueExitMultiple = enterpriseValueExitMultiple + netDebtAdjustment;
  const fairValuePerShareExitMultiple = Math.max(Number((equityValueExitMultiple / shares).toFixed(2)), 1.0);

  // Blended Selected Fair Value (50% perpetual, 50% exit multiple)
  const selectedFairValue = Number(((fairValuePerSharePerpetual * 0.5) + (fairValuePerShareExitMultiple * 0.5)).toFixed(2));
  const currentPrice = company.currentPrice;
  const upsideDownside = Number((((selectedFairValue - currentPrice) / currentPrice) * 100).toFixed(1));
  const marginOfSafety = Number((((selectedFairValue - currentPrice) / selectedFairValue) * 100).toFixed(1));

  // Sensitivity Matrix (WACC +/- 1.5%, g +/- 0.5%)
  const waccSteps = [calculatedWacc - 1.5, calculatedWacc - 0.75, calculatedWacc, calculatedWacc + 0.75, calculatedWacc + 1.5];
  const gSteps = [terminalGrowthRate - 0.5, terminalGrowthRate - 0.25, terminalGrowthRate, terminalGrowthRate + 0.25, terminalGrowthRate + 0.5];
  
  const matrix: number[][] = [];
  for (let r = 0; r < waccSteps.length; r++) {
    const row: number[] = [];
    const w = waccSteps[r] / 100;
    for (let c = 0; c < gSteps.length; c++) {
      const gVal = gSteps[c] / 100;
      const sp = Math.max(w - gVal, 0.012);
      const tv = (finalYearFcf * (1 + gVal)) / sp;
      const df = 1 / Math.pow(1 + w, 5);
      const pvTv = tv * df;
      // approximate explicit cash flow scaling with wacc
      const explicitScaled = pvExplicitCashFlows * (Math.pow(1 + waccDec, 2.5) / Math.pow(1 + w, 2.5));
      const ev = explicitScaled + pvTv;
      const eqVal = ev + netDebtAdjustment;
      const p = Math.max(Number((eqVal / shares).toFixed(2)), 1.0);
      row.push(p);
    }
    matrix.push(row);
  }

  return {
    wacc: calculatedWacc,
    costOfEquity: Number(costOfEquity.toFixed(2)),
    costOfDebtAfterTax: Number(costOfDebtAfterTax.toFixed(2)),
    riskFreeRate,
    equityRiskPremium,
    terminalGrowthRate,
    exitMultiple,
    projectedFcff,
    pvExplicitCashFlows: Math.round(pvExplicitCashFlows),
    terminalValuePerpetual: Math.round(terminalValuePerpetual),
    pvTerminalValuePerpetual: Math.round(pvTerminalValuePerpetual),
    enterpriseValuePerpetual: Math.round(enterpriseValuePerpetual),
    equityValuePerpetual: Math.round(equityValuePerpetual),
    fairValuePerSharePerpetual,
    terminalValueExitMultiple: Math.round(terminalValueExitMultiple),
    pvTerminalValueExitMultiple: Math.round(pvTerminalValueExitMultiple),
    enterpriseValueExitMultiple: Math.round(enterpriseValueExitMultiple),
    equityValueExitMultiple: Math.round(equityValueExitMultiple),
    fairValuePerShareExitMultiple,
    selectedFairValue,
    marginOfSafety,
    upsideDownside,
    sensitivityMatrix: {
      waccValues: waccSteps.map(v => Number(v.toFixed(2))),
      growthValues: gSteps.map(v => Number(v.toFixed(2))),
      fairValues: matrix
    }
  };
}

export function calculateGrahamValue(
  company: CompanyProfile, 
  overrides?: { aaaBondYield?: number }
): GrahamValuationResult {
  const latest = company.historical[company.historical.length - 1];
  const shares = company.sharesOutstanding || latest.sharesDiluted || 1;
  const eps = latest.eps > 0 ? latest.eps : 1.0;
  const bookValuePerShare = Math.max(latest.totalEquity / shares, 0.5);
  
  // 1. Classic Graham Formula: sqrt(22.5 * EPS * BVPS)
  // 22.5 is derived from max P/E of 15 * max P/B of 1.5
  const classicFormula = eps > 0 && bookValuePerShare > 0 
    ? Number(Math.sqrt(22.5 * eps * bookValuePerShare).toFixed(2)) 
    : 0;

  // 2. Graham Growth Formula: (EPS * (8.5 + 2g) * 4.4) / AAA_Yield
  // 8.5 is P/E of zero-growth company, 4.4 was prevailing AAA bond yield in Graham's era
  const aaaBondYield = overrides?.aaaBondYield || (company.currency === 'INR' ? 7.15 : 5.25); // Current AAA corporate bond yield
  // Approximate conservative 5-year expected growth rate (capped at 15% for Graham prudence)
  const growthRate = Math.min(Math.max(latest.revenueGrowthYoY, 4.0), 15.0);
  
  const growthFormula = Number(((eps * (8.5 + (2 * growthRate)) * 4.4) / aaaBondYield).toFixed(2));
  
  // 3. Adjusted conservative variant (1 * g instead of 2 * g)
  const adjustedFormula = Number(((eps * (8.5 + growthRate) * 4.4) / aaaBondYield).toFixed(2));

  // Blended Graham Fair Value (averaging growth-formula and conservative adjusted)
  const fairValue = Number(((growthFormula * 0.6) + (adjustedFormula * 0.4)).toFixed(2));
  const upsideDownside = Number((((fairValue - company.currentPrice) / company.currentPrice) * 100).toFixed(1));

  return {
    classicFormula,
    growthFormula,
    adjustedFormula,
    bookValuePerShare: Number(bookValuePerShare.toFixed(2)),
    epsUsed: eps,
    growthRateUsed: growthRate,
    aaaBondYield,
    fairValue,
    upsideDownside
  };
}

export function calculateMultiplesValuation(company: CompanyProfile): MultiplesValuationResult {
  const latest = company.historical[company.historical.length - 1];
  const industry = findIndustryForCompany(company.ticker);
  const shares = company.sharesOutstanding || latest.sharesDiluted || 1;
  const eps = latest.eps > 0 ? latest.eps : 1.0;
  const fcfPerShare = Math.max(latest.freeCashFlow / shares, 0.5);
  const bvps = Math.max(latest.totalEquity / shares, 1.0);
  
  // Benchmark Multiples (from peer / industry medians)
  const peerPe = industry.medianPe;
  const peerEvEbitda = industry.medianEvEbitda;
  const peerPtoFcf = 28.0;
  const peerPb = 8.5;

  // Implied Prices
  const impliedPe = Number((eps * peerPe).toFixed(2));
  const impliedEvEbitda = Number((((latest.ebitda * peerEvEbitda) + (latest.totalCashAndInvestments - latest.totalDebt)) / shares).toFixed(2));
  const impliedFcf = Number((fcfPerShare * peerPtoFcf).toFixed(2));
  const impliedPb = Number((bvps * peerPb).toFixed(2));

  // PEG Ratio (P/E / Growth rate)
  const growthRate = Math.max(latest.revenueGrowthYoY, 3.0);
  const peg = Number((latest.peRatio / growthRate).toFixed(2));
  const pegInterpretation = peg < 1.0 
    ? 'Undervalued on PEG basis (< 1.0 Peter Lynch threshold)' 
    : peg <= 2.0 
    ? 'Fairly valued on PEG basis (1.0 - 2.0 range)' 
    : 'Richly valued on PEG basis (> 2.0, premium for quality/moat)';

  // Composite Multiples Fair Value
  const impliedFairValue = Number(((impliedPe * 0.4) + (impliedEvEbitda * 0.35) + (impliedFcf * 0.25)).toFixed(2));
  const upsideDownside = Number((((impliedFairValue - company.currentPrice) / company.currentPrice) * 100).toFixed(1));

  return {
    peTrailing: {
      multiple: latest.peRatio,
      impliedPrice: impliedPe,
      peerMedian: peerPe,
      discountPremium: Number((((latest.peRatio - peerPe) / peerPe) * 100).toFixed(1))
    },
    peForward: {
      multiple: Number((latest.peRatio * 0.88).toFixed(1)),
      impliedPrice: Number((impliedPe * 1.12).toFixed(2)),
      peerMedian: Number((peerPe * 0.9).toFixed(1)),
      discountPremium: Number((((latest.peRatio * 0.88 - (peerPe * 0.9)) / (peerPe * 0.9)) * 100).toFixed(1))
    },
    evToEbitda: {
      multiple: latest.evToEbitda,
      impliedPrice: impliedEvEbitda,
      peerMedian: peerEvEbitda,
      discountPremium: Number((((latest.evToEbitda - peerEvEbitda) / peerEvEbitda) * 100).toFixed(1))
    },
    priceToFcf: {
      multiple: latest.priceToFcf,
      impliedPrice: impliedFcf,
      peerMedian: peerPtoFcf,
      discountPremium: Number((((latest.priceToFcf - peerPtoFcf) / peerPtoFcf) * 100).toFixed(1))
    },
    priceToBook: {
      multiple: latest.priceToBook,
      impliedPrice: impliedPb,
      peerMedian: peerPb,
      discountPremium: Number((((latest.priceToBook - peerPb) / peerPb) * 100).toFixed(1))
    },
    pegRatio: {
      ratio: peg,
      interpretation: pegInterpretation
    },
    impliedFairValue,
    upsideDownside
  };
}

export function synthesizeCompositeValuation(
  company: CompanyProfile,
  dcf: DcfValuationResult,
  graham: GrahamValuationResult,
  multiples: MultiplesValuationResult
): CompositeValuationSummary {
  const currentPrice = company.currentPrice;
  
  // Weighting: DCF 50%, Multiples 35%, Graham 15% (for growth tech Graham classic is very conservative)
  const weightedFairValue = Number((
    (dcf.selectedFairValue * 0.50) +
    (multiples.impliedFairValue * 0.35) +
    (graham.fairValue * 0.15)
  ).toFixed(2));
  
  const marginOfSafetyPercent = Number((((weightedFairValue - currentPrice) / weightedFairValue) * 100).toFixed(1));
  
  let verdict: 'Significantly Undervalued' | 'Modestly Undervalued' | 'Fairly Valued' | 'Modestly Overvalued' | 'Significantly Overvalued';
  if (marginOfSafetyPercent >= 20) {
    verdict = 'Significantly Undervalued';
  } else if (marginOfSafetyPercent >= 7) {
    verdict = 'Modestly Undervalued';
  } else if (marginOfSafetyPercent >= -7) {
    verdict = 'Fairly Valued';
  } else if (marginOfSafetyPercent >= -20) {
    verdict = 'Modestly Overvalued';
  } else {
    verdict = 'Significantly Overvalued';
  }

  const rationale = `Composite valuation of $${weightedFairValue.toFixed(2)} blends DCF intrinsic model ($${dcf.selectedFairValue.toFixed(2)}, 50% weight), peer multiples benchmark ($${multiples.impliedFairValue.toFixed(2)}, 35% weight), and Graham intrinsic formula ($${graham.fairValue.toFixed(2)}, 15% weight). At the current market quote of $${currentPrice.toFixed(2)}, the stock reflects a ${marginOfSafetyPercent >= 0 ? `margin of safety of +${marginOfSafetyPercent}%` : `premium of ${Math.abs(marginOfSafetyPercent)}% over composite intrinsic value`}, resulting in a verdict of ${verdict.toUpperCase()}.`;

  return {
    currentPrice,
    dcfPerpetual: dcf.fairValuePerSharePerpetual,
    dcfExitMultiple: dcf.fairValuePerShareExitMultiple,
    grahamValue: graham.fairValue,
    multiplesValuation: multiples.impliedFairValue,
    weightedFairValue,
    marginOfSafetyPercent,
    verdict,
    confidenceLevel: 'High',
    rationale
  };
}
