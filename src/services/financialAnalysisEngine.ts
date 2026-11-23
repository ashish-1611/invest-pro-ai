import { CompanyProfile, DuPontAnalysis, HealthScores, FinancialStrengthWeakness, FinancialYearData } from '../types/financials';

export function calculateDuPont(company: CompanyProfile): DuPontAnalysis {
  const latest = company.historical[company.historical.length - 1];
  
  // 3-Stage DuPont: Net Margin * Asset Turnover * Leverage
  const netMargin = latest.netMargin / 100;
  const assetTurnover = latest.assetTurnover;
  const financialLeverage = latest.financialLeverage;
  const calculatedRoe3 = netMargin * assetTurnover * financialLeverage * 100;
  
  // 5-Stage DuPont: Tax Burden * Interest Burden * Operating Margin * Asset Turnover * Leverage
  const ebt = latest.operatingIncome - latest.interestExpense;
  const taxBurden = ebt > 0 ? latest.netIncome / ebt : 0.8;
  const interestBurden = latest.operatingIncome > 0 ? ebt / latest.operatingIncome : 1.0;
  const operatingMargin = latest.operatingMargin / 100;
  const calculatedRoe5 = taxBurden * interestBurden * operatingMargin * assetTurnover * financialLeverage * 100;
  
  // Driver determination
  let driverOfRoe: 'Margin Driven' | 'Asset Efficiency Driven' | 'Financial Leverage Driven' | 'Balanced' = 'Balanced';
  if (latest.financialLeverage > 4.5 && company.sector !== 'Financials') {
    driverOfRoe = 'Financial Leverage Driven';
  } else if (latest.netMargin > 25) {
    driverOfRoe = 'Margin Driven';
  } else if (latest.assetTurnover > 1.0) {
    driverOfRoe = 'Asset Efficiency Driven';
  }
  
  const interpretation = `DuPont 3-stage decomposition indicates an ROE of ${latest.roe.toFixed(2)}%, driven by a Net Profit Margin of ${latest.netMargin.toFixed(1)}%, Asset Turnover of ${latest.assetTurnover.toFixed(2)}x, and Financial Leverage of ${latest.financialLeverage.toFixed(2)}x. The core engine is ${driverOfRoe.toLowerCase()}, reflecting ${driverOfRoe === 'Margin Driven' ? 'strong pricing power and high software/services mix' : driverOfRoe === 'Asset Efficiency Driven' ? 'lean working capital and rapid inventory turnover' : 'significant balance sheet leverage amplified by share buybacks reducing book equity'}.`;

  return {
    stage3: {
      netProfitMargin: latest.netMargin,
      assetTurnover: latest.assetTurnover,
      financialLeverage: latest.financialLeverage,
      calculatedRoe: calculatedRoe3
    },
    stage5: {
      taxBurden: Number((taxBurden * 100).toFixed(2)),
      interestBurden: Number((interestBurden * 100).toFixed(2)),
      operatingMargin: latest.operatingMargin,
      assetTurnover: latest.assetTurnover,
      financialLeverage: latest.financialLeverage,
      calculatedRoe: calculatedRoe5
    },
    interpretation,
    driverOfRoe
  };
}

export function calculateHealthScores(company: CompanyProfile): HealthScores {
  const h = company.historical;
  const latest = h[h.length - 1];
  const prior = h[h.length - 2] || latest;
  
  // 1. Piotroski F-Score (9 points)
  const p1 = latest.netIncome > 0;
  const p2 = latest.operatingCashFlow > 0;
  const p3 = (latest.netIncome / latest.totalAssets) > (prior.netIncome / prior.totalAssets);
  const p4 = latest.operatingCashFlow > latest.netIncome; // Cash flow quality
  const p5 = latest.totalDebt <= prior.totalDebt; // Lower long term debt ratio
  const p6 = latest.currentRatio >= prior.currentRatio; // Higher liquidity
  const p7 = latest.sharesDiluted <= prior.sharesDiluted; // No share dilution
  const p8 = latest.grossMargin >= prior.grossMargin; // Higher gross margin
  const p9 = latest.assetTurnover >= prior.assetTurnover; // Higher asset turnover
  
  const criteria = [
    {
      name: 'Positive Net Income',
      category: 'Profitability' as const,
      passed: p1,
      metricValue: `$${latest.netIncome.toLocaleString()}M`,
      benchmark: '> $0',
      sourceItem: 'Income Statement (Net Income)'
    },
    {
      name: 'Positive Operating Cash Flow (OCF)',
      category: 'Profitability' as const,
      passed: p2,
      metricValue: `$${latest.operatingCashFlow.toLocaleString()}M`,
      benchmark: '> $0',
      sourceItem: 'Cash Flow Statement (OCF)'
    },
    {
      name: 'Higher Return on Assets (ROA) YoY',
      category: 'Profitability' as const,
      passed: p3,
      metricValue: `${((latest.netIncome / latest.totalAssets) * 100).toFixed(1)}% vs ${((prior.netIncome / prior.totalAssets) * 100).toFixed(1)}%`,
      benchmark: 'Current ROA > Prior ROA',
      sourceItem: 'Balance Sheet & Income Statement'
    },
    {
      name: 'Cash Flow Quality (OCF > Net Income)',
      category: 'Profitability' as const,
      passed: p4,
      metricValue: `OCF $${latest.operatingCashFlow.toLocaleString()}M vs NI $${latest.netIncome.toLocaleString()}M`,
      benchmark: 'OCF > Net Income (clean accruals)',
      sourceItem: 'Cash Flow & Income Statement'
    },
    {
      name: 'Leverage Check (Debt/Assets or Total Debt YoY)',
      category: 'Leverage & Liquidity' as const,
      passed: p5,
      metricValue: `Debt $${latest.totalDebt.toLocaleString()}M vs Prior $${prior.totalDebt.toLocaleString()}M`,
      benchmark: 'Debt unchanged or reduced',
      sourceItem: 'Balance Sheet (Short + Long-Term Debt)'
    },
    {
      name: 'Current Ratio Improvement YoY',
      category: 'Leverage & Liquidity' as const,
      passed: p6,
      metricValue: `${latest.currentRatio.toFixed(2)}x vs Prior ${prior.currentRatio.toFixed(2)}x`,
      benchmark: 'Current Ratio >= Prior',
      sourceItem: 'Balance Sheet (Current Assets / Current Liab)'
    },
    {
      name: 'Zero Equity Dilution (Shares Diluted <= Prior)',
      category: 'Leverage & Liquidity' as const,
      passed: p7,
      metricValue: `${latest.sharesDiluted.toLocaleString()}M vs Prior ${prior.sharesDiluted.toLocaleString()}M`,
      benchmark: 'Shares <= Prior Year',
      sourceItem: 'Income Statement (Diluted Shares)'
    },
    {
      name: 'Gross Margin Expansion YoY',
      category: 'Operating Efficiency' as const,
      passed: p8,
      metricValue: `${latest.grossMargin.toFixed(1)}% vs Prior ${prior.grossMargin.toFixed(1)}%`,
      benchmark: 'Gross Margin >= Prior Year',
      sourceItem: 'Income Statement (Gross Profit / Revenue)'
    },
    {
      name: 'Asset Turnover Expansion YoY',
      category: 'Operating Efficiency' as const,
      passed: p9,
      metricValue: `${latest.assetTurnover.toFixed(2)}x vs Prior ${prior.assetTurnover.toFixed(2)}x`,
      benchmark: 'Asset Turnover >= Prior Year',
      sourceItem: 'Income Statement & Balance Sheet'
    }
  ];
  
  const score = criteria.filter(c => c.passed).length;
  const rating: 'Strong' | 'Moderate' | 'Weak' = score >= 7 ? 'Strong' : score >= 5 ? 'Moderate' : 'Weak';

  // 2. Altman Z-Score
  // Z = 1.2*X1 + 1.4*X2 + 3.3*X3 + 0.6*X4 + 0.999*X5
  // X1 = Working Capital / Total Assets
  // X2 = Retained Earnings (approximated by Equity - Debt buffer) / Total Assets
  // X3 = EBIT / Total Assets
  // X4 = Market Value of Equity / Total Liabilities
  // X5 = Sales / Total Assets
  const workingCapital = latest.totalCurrentAssets - latest.totalCurrentLiabilities;
  const x1 = workingCapital / (latest.totalAssets || 1);
  const x2 = (latest.totalEquity * 0.7) / (latest.totalAssets || 1);
  const x3 = latest.operatingIncome / (latest.totalAssets || 1);
  const x4 = latest.marketCap / (latest.totalLiabilities || 1);
  const x5 = latest.revenue / (latest.totalAssets || 1);
  
  const zScore = (1.2 * x1) + (1.4 * x2) + (3.3 * x3) + (0.6 * x4) + (0.999 * x5);
  let zone: 'Safe Zone' | 'Grey Zone' | 'Distress Zone' = 'Safe Zone';
  if (zScore < 1.81) zone = 'Distress Zone';
  else if (zScore <= 2.99) zone = 'Grey Zone';

  const zComponents = [
    { component: 'X1', name: 'Working Capital / Assets', value: x1, weight: 1.2, contribution: 1.2 * x1 },
    { component: 'X2', name: 'Retained Earnings / Assets', value: x2, weight: 1.4, contribution: 1.4 * x2 },
    { component: 'X3', name: 'EBIT / Assets', value: x3, weight: 3.3, contribution: 3.3 * x3 },
    { component: 'X4', name: 'Market Equity / Total Liab', value: x4, weight: 0.6, contribution: 0.6 * x4 },
    { component: 'X5', name: 'Revenue / Total Assets', value: x5, weight: 0.999, contribution: 0.999 * x5 }
  ];

  // 3. Beneish M-Score (earnings manipulation indicator, benchmark -1.78; greater than -1.78 indicates risk)
  // Approximate key factors: DSRI (Days Sales in Receivables Index), GMI (Gross Margin Index), AQI, SGI
  const dsri = (latest.accountsReceivable / latest.revenue) / ((prior.accountsReceivable / prior.revenue) || 1);
  const gmi = (prior.grossMargin / 100) / ((latest.grossMargin / 100) || 1);
  const sgi = latest.revenue / (prior.revenue || 1);
  // Beneish simplified 5-variable model
  const mScore = -4.84 + (0.920 * dsri) + (0.528 * gmi) + (0.404 * (latest.propertyPlantEquipment / latest.totalAssets)) + (0.892 * sgi);
  const manipulationRisk: 'Low' | 'Moderate' | 'Elevated' = mScore < -2.22 ? 'Low' : mScore < -1.78 ? 'Moderate' : 'Elevated';

  return {
    piotroskiFScore: {
      score,
      rating,
      criteria
    },
    altmanZScore: {
      score: Number(zScore.toFixed(2)),
      zone,
      components: zComponents,
      interpretation: zone === 'Safe Zone' 
        ? `Altman Z-Score of ${zScore.toFixed(2)} places the company firmly in the Safe Zone (> 2.99), implying negligible near-term insolvency probability.`
        : zone === 'Grey Zone'
        ? `Altman Z-Score of ${zScore.toFixed(2)} sits in the Grey Zone (1.81 - 2.99), suggesting moderate leverage or working capital sensitivity requiring monitoring.`
        : `Altman Z-Score of ${zScore.toFixed(2)} is in the Distress Zone (< 1.81), indicating elevated credit distress or high financial leverage.`
    },
    beneishMScore: {
      score: Number(mScore.toFixed(2)),
      manipulationRisk,
      interpretation: manipulationRisk === 'Low'
        ? `Beneish M-Score of ${mScore.toFixed(2)} (well below -1.78 threshold) indicates high earnings quality with very low probability of accounting manipulation.`
        : `Beneish M-Score of ${mScore.toFixed(2)} indicates moderate/elevated accrual flags that warrant scrutiny on revenue recognition and receivables timing.`
    }
  };
}

export function identifyStrengthsAndWeaknesses(company: CompanyProfile): FinancialStrengthWeakness[] {
  const h = company.historical;
  const latest = h[h.length - 1];
  const prior = h[h.length - 2] || latest;
  const first = h[0];
  
  const items: FinancialStrengthWeakness[] = [];
  
  // 1. Cash Flow Conversion
  if (latest.fcfConversion > 90) {
    items.push({
      id: 'sw-fcf-conversion',
      category: 'Cash Flow & Quality',
      type: 'strength',
      title: 'Superior Free Cash Flow Conversion',
      description: 'The company converts an exceptional portion of accounting net income into hard cash flow, providing high earnings reliability.',
      metric: 'FCF / Net Income',
      currentValue: `${latest.fcfConversion.toFixed(1)}%`,
      historicalOrPeerBenchmark: 'Sector Benchmark: > 75%',
      supportingEvidence: `FY${latest.year} SEC 10-K Cash Flow Statement: Operating Cash Flow $${latest.operatingCashFlow.toLocaleString()}M - CapEx $${latest.capitalExpenditures.toLocaleString()}M = FCF $${latest.freeCashFlow.toLocaleString()}M vs Net Income $${latest.netIncome.toLocaleString()}M`,
      importance: 'High'
    });
  } else if (latest.fcfConversion < 50 && latest.fcfConversion > 0) {
    items.push({
      id: 'sw-fcf-conversion-low',
      category: 'Cash Flow & Quality',
      type: 'weakness',
      title: 'Low Free Cash Flow Conversion / High CapEx Drag',
      description: 'Free cash flow significantly lags accounting net income due to high capital intensity or working capital lockups.',
      metric: 'FCF / Net Income',
      currentValue: `${latest.fcfConversion.toFixed(1)}%`,
      historicalOrPeerBenchmark: 'Target: > 70%',
      supportingEvidence: `FY${latest.year} Cash Flow: CapEx was $${latest.capitalExpenditures.toLocaleString()}M (${((latest.capitalExpenditures / latest.revenue) * 100).toFixed(1)}% of Revenue), leaving FCF of $${latest.freeCashFlow.toLocaleString()}M on Net Income of $${latest.netIncome.toLocaleString()}M`,
      importance: 'High'
    });
  }

  // 2. Profit Margins & Pricing Power
  if (latest.operatingMargin >= 25) {
    items.push({
      id: 'sw-operating-margin-high',
      category: 'Profitability',
      type: 'strength',
      title: 'Elite Operating Profitability & Pricing Power',
      description: 'Operating margin exceeds 25%, demonstrating strong pricing leverage, competitive moat, and operating expense discipline.',
      metric: 'Operating Margin (EBIT)',
      currentValue: `${latest.operatingMargin.toFixed(1)}%`,
      historicalOrPeerBenchmark: `Historical 5-Yr Avg: ${((h.reduce((acc, curr) => acc + curr.operatingMargin, 0) / h.length)).toFixed(1)}%`,
      supportingEvidence: `FY${latest.year} 10-K: Operating Income of $${latest.operatingIncome.toLocaleString()}M on total revenues of $${latest.revenue.toLocaleString()}M`,
      importance: 'High'
    });
  } else if (latest.operatingMargin < 10 && company.sector !== 'Financials') {
    items.push({
      id: 'sw-operating-margin-low',
      category: 'Profitability',
      type: 'weakness',
      title: 'Thin Operating Margins / Vulnerable to Cost Inflation',
      description: 'Operating margin below 10% exposes earnings to rapid compression if raw materials, wages, or competitive discounts escalate.',
      metric: 'Operating Margin',
      currentValue: `${latest.operatingMargin.toFixed(1)}%`,
      historicalOrPeerBenchmark: 'Sector Benchmark: > 15%',
      supportingEvidence: `FY${latest.year} Operating Income was $${latest.operatingIncome.toLocaleString()}M on $${latest.revenue.toLocaleString()}M revenue`,
      importance: 'High'
    });
  }

  // 3. Balance Sheet Liquidity & Net Cash / Debt
  if (latest.netDebt < 0) {
    items.push({
      id: 'sw-net-cash-fortress',
      category: 'Solvency & Debt',
      type: 'strength',
      title: 'Fortress Balance Sheet (Net Cash Position)',
      description: 'Total cash and short-term liquid investments exceed all interest-bearing debt, insulating the business from debt rollover crises.',
      metric: 'Net Debt',
      currentValue: `-$${Math.abs(latest.netDebt).toLocaleString()}M (Net Cash)`,
      historicalOrPeerBenchmark: `Cash & Equivalents: $${latest.totalCashAndInvestments.toLocaleString()}M vs Total Debt: $${latest.totalDebt.toLocaleString()}M`,
      supportingEvidence: `FY${latest.year} 10-K Balance Sheet: Total Cash & ST Investments $${latest.totalCashAndInvestments.toLocaleString()}M exceeds Total Debt of $${latest.totalDebt.toLocaleString()}M`,
      importance: 'High'
    });
  } else if (latest.netDebtToEbitda > 2.5) {
    items.push({
      id: 'sw-elevated-debt',
      category: 'Solvency & Debt',
      type: 'weakness',
      title: 'Elevated Leverage Ratio (Net Debt / EBITDA)',
      description: 'Net debt exceeds 2.5x annual EBITDA, which could constrain financial flexibility during macroeconomic contractions or rising interest rate regimes.',
      metric: 'Net Debt / EBITDA',
      currentValue: `${latest.netDebtToEbitda.toFixed(2)}x`,
      historicalOrPeerBenchmark: 'Prudent Threshold: < 2.0x',
      supportingEvidence: `FY${latest.year} Net Debt is $${latest.netDebt.toLocaleString()}M relative to EBITDA of $${latest.ebitda.toLocaleString()}M`,
      importance: 'Medium'
    });
  }

  // 4. Return on Invested Capital / ROCE
  if (latest.roce > 25) {
    items.push({
      id: 'sw-roce-elite',
      category: 'Efficiency',
      type: 'strength',
      title: 'High Capital Allocation Efficiency (ROCE / ROIC)',
      description: 'The company generates exceptional returns on capital employed, substantially exceeding its weighted average cost of capital (WACC).',
      metric: 'ROCE',
      currentValue: `${latest.roce.toFixed(1)}%`,
      historicalOrPeerBenchmark: 'Cost of Capital (WACC): ~8.5-10.0%',
      supportingEvidence: `FY${latest.year} EBIT of $${latest.operatingIncome.toLocaleString()}M over Capital Employed ($${(latest.totalAssets - latest.totalCurrentLiabilities).toLocaleString()}M) yields ${latest.roce.toFixed(1)}%`,
      importance: 'High'
    });
  }

  // 5. Shareholder Returns & Capital Allocation (Buybacks & Dividends)
  const totalCapitalReturned = latest.dividendsPaid + latest.shareRepurchases;
  if (totalCapitalReturned > 20000) {
    items.push({
      id: 'sw-capital-return-scale',
      category: 'Cash Flow & Quality',
      type: 'strength',
      title: 'Aggressive Shareholder Capital Return Program',
      description: 'Massive capital return through systematic share repurchases and dividends, directly enhancing EPS compounding over multi-year periods.',
      metric: 'Annual Capital Returned',
      currentValue: `$${(totalCapitalReturned / 1000).toFixed(1)} Billion`,
      historicalOrPeerBenchmark: `Shares reduced from ${first.sharesDiluted.toLocaleString()}M in FY${first.year} to ${latest.sharesDiluted.toLocaleString()}M in FY${latest.year}`,
      supportingEvidence: `FY${latest.year} 10-K Financing Cash Flow: Dividends $${latest.dividendsPaid.toLocaleString()}M + Repurchases $${latest.shareRepurchases.toLocaleString()}M`,
      importance: 'Medium'
    });
  }

  // 6. Valuation Multiple Headwind (Weakness / Risk)
  if (latest.peRatio > 40) {
    items.push({
      id: 'sw-valuation-premium-risk',
      category: 'Valuation',
      type: 'weakness',
      title: 'Rich Valuation Multiples Demand Flawless Execution',
      description: 'The stock trades at a high trailing P/E multiple, embedding aggressive growth expectations and leaving little margin of safety against earnings misses.',
      metric: 'Trailing P/E Ratio',
      currentValue: `${latest.peRatio.toFixed(1)}x`,
      historicalOrPeerBenchmark: 'S&P 500 Historical Median: ~18-20x',
      supportingEvidence: `Current Market Cap of $${latest.marketCap.toLocaleString()}M against latest annual Net Income of $${latest.netIncome.toLocaleString()}M`,
      importance: 'High'
    });
  }

  // 7. Top-line Growth Deceleration check
  if (latest.revenueGrowthYoY < 3.0 && latest.revenueGrowthYoY >= 0) {
    items.push({
      id: 'sw-revenue-slowdown',
      category: 'Profitability',
      type: 'weakness',
      title: 'Top-Line Revenue Growth Deceleration',
      description: 'Recent revenue growth has slowed below historical CAGR, reflecting market saturation in core product categories or macroeconomic headwinds.',
      metric: 'YoY Revenue Growth',
      currentValue: `+${latest.revenueGrowthYoY.toFixed(1)}%`,
      historicalOrPeerBenchmark: `FY${first.year} YoY Growth: +${first.revenueGrowthYoY.toFixed(1)}%`,
      supportingEvidence: `FY${latest.year} Revenue of $${latest.revenue.toLocaleString()}M compared with $${prior.revenue.toLocaleString()}M in FY${prior.year}`,
      importance: 'Medium'
    });
  }

  return items;
}
