import { CompanyProfile, FinancialProjectionScenario } from '../types/financials';

export interface CustomProjectionInputs {
  baseGrowthY1?: number;
  baseGrowthY3?: number;
  baseGrowthY5?: number;
  grossMargin?: number;
  operatingMargin?: number;
  taxRate?: number;
  capexPct?: number;
  shareBuybackPct?: number;
}

export function generateProjections(
  company: CompanyProfile,
  customInputs?: CustomProjectionInputs
): {
  scenarios: FinancialProjectionScenario[];
  historicalFactBaseline: {
    year: number;
    revenue: number;
    grossMargin: number;
    operatingMargin: number;
    netIncome: number;
    freeCashFlow: number;
    eps: number;
  };
  assumptionsAuditTrail: {
    parameter: string;
    historicalFactValue: string;
    baseAssumption: string;
    bullAssumption: string;
    bearAssumption: string;
    justification: string;
  }[];
} {
  const latest = company.historical[company.historical.length - 1];
  const prior = company.historical[company.historical.length - 2] || latest;
  
  // Historical Fact Baseline
  const historicalFactBaseline = {
    year: latest.year,
    revenue: latest.revenue,
    grossMargin: latest.grossMargin,
    operatingMargin: latest.operatingMargin,
    netIncome: latest.netIncome,
    freeCashFlow: latest.freeCashFlow,
    eps: latest.eps
  };

  // Trailing growth trends
  const trailingGrowth = latest.revenueGrowthYoY;
  const isHighGrowth = trailingGrowth > 25;
  const isDefensive = company.sector === 'Consumer Defensive' || company.sector === 'Financials';

  // Base assumptions
  const baseGrowth1 = customInputs?.baseGrowthY1 ?? (isHighGrowth ? Math.max(trailingGrowth * 0.6, 18) : isDefensive ? 4.5 : 8.5);
  const baseGrowth3 = customInputs?.baseGrowthY3 ?? (isHighGrowth ? 16 : isDefensive ? 4.0 : 7.0);
  const baseGrowth5 = customInputs?.baseGrowthY5 ?? (isHighGrowth ? 12 : isDefensive ? 3.5 : 5.5);
  const baseGrossMargin = customInputs?.grossMargin ?? latest.grossMargin;
  const baseOpMargin = customInputs?.operatingMargin ?? latest.operatingMargin;
  const taxRate = customInputs?.taxRate ?? 18.5; // effective corporate tax rate
  const capexPct = customInputs?.capexPct ?? Number(((latest.capitalExpenditures / latest.revenue) * 100).toFixed(1));
  const buybackPct = customInputs?.shareBuybackPct ?? (latest.shareRepurchases > 5000 ? 1.8 : 0.5); // % shares reduced annually

  // 1. BASE CASE SCENARIO
  const baseProjections = calculateScenarioProjections(
    latest,
    [baseGrowth1, baseGrowth3, baseGrowth5],
    baseGrossMargin,
    baseOpMargin,
    taxRate,
    capexPct,
    buybackPct
  );

  const baseScenario: FinancialProjectionScenario = {
    scenarioName: 'Base Case',
    assumptions: {
      revenueGrowthYear1: baseGrowth1,
      revenueGrowthYear3: baseGrowth3,
      revenueGrowthYear5: baseGrowth5,
      grossMargin: baseGrossMargin,
      operatingMargin: baseOpMargin,
      taxRate,
      capexPercentOfSales: capexPct,
      sharesAnnualChangePercent: -buybackPct,
      justification: `Moderation toward sustainable long-term economic expansion with steady operating leverage and continuation of capital return program.`
    },
    projections: baseProjections
  };

  // 2. BULL CASE SCENARIO (Accelerated growth, margin expansion)
  const bullGrowth1 = Number((baseGrowth1 * 1.35).toFixed(1));
  const bullGrowth3 = Number((baseGrowth3 * 1.30).toFixed(1));
  const bullGrowth5 = Number((baseGrowth5 * 1.25).toFixed(1));
  const bullGrossMargin = Number((Math.min(baseGrossMargin + 2.5, 85)).toFixed(1));
  const bullOpMargin = Number((Math.min(baseOpMargin + 3.0, 70)).toFixed(1));
  const bullBuyback = Number((buybackPct * 1.2).toFixed(1));

  const bullProjections = calculateScenarioProjections(
    latest,
    [bullGrowth1, bullGrowth3, bullGrowth5],
    bullGrossMargin,
    bullOpMargin,
    taxRate,
    capexPct * 0.95,
    bullBuyback
  );

  const bullScenario: FinancialProjectionScenario = {
    scenarioName: 'Bull Case',
    assumptions: {
      revenueGrowthYear1: bullGrowth1,
      revenueGrowthYear3: bullGrowth3,
      revenueGrowthYear5: bullGrowth5,
      grossMargin: bullGrossMargin,
      operatingMargin: bullOpMargin,
      taxRate,
      capexPercentOfSales: Number((capexPct * 0.95).toFixed(1)),
      sharesAnnualChangePercent: -bullBuyback,
      justification: `AI adoption/cloud leadership accelerates, higher margin mix expands operating leverage by 300 bps, accelerated share retirements.`
    },
    projections: bullProjections
  };

  // 3. BEAR CASE SCENARIO (Deceleration, margin contraction, capex friction)
  const bearGrowth1 = Number((Math.max(baseGrowth1 * 0.45, 1.0)).toFixed(1));
  const bearGrowth3 = Number((Math.max(baseGrowth3 * 0.40, 0.5)).toFixed(1));
  const bearGrowth5 = Number((Math.max(baseGrowth5 * 0.35, 0.0)).toFixed(1));
  const bearGrossMargin = Number((Math.max(baseGrossMargin - 3.5, 15)).toFixed(1));
  const bearOpMargin = Number((Math.max(baseOpMargin - 4.5, 5)).toFixed(1));
  const bearBuyback = 0.2; // Repurchases halted/minimized

  const bearProjections = calculateScenarioProjections(
    latest,
    [bearGrowth1, bearGrowth3, bearGrowth5],
    bearGrossMargin,
    bearOpMargin,
    taxRate + 2.0, // Higher statutory tax or tariff friction
    capexPct * 1.15,
    bearBuyback
  );

  const bearScenario: FinancialProjectionScenario = {
    scenarioName: 'Bear Case',
    assumptions: {
      revenueGrowthYear1: bearGrowth1,
      revenueGrowthYear3: bearGrowth3,
      revenueGrowthYear5: bearGrowth5,
      grossMargin: bearGrossMargin,
      operatingMargin: bearOpMargin,
      taxRate: taxRate + 2.0,
      capexPercentOfSales: Number((capexPct * 1.15).toFixed(1)),
      sharesAnnualChangePercent: -bearBuyback,
      justification: `Macro recession, heightened antitrust or tariff friction, competitive pricing pressure compressing operating margins by 450 bps.`
    },
    projections: bearProjections
  };

  // Explicit Assumptions Audit Trail
  const assumptionsAuditTrail = [
    {
      parameter: 'Revenue Growth Rate (Y1 / Y3 / Y5)',
      historicalFactValue: `FY${latest.year} YoY: +${latest.revenueGrowthYoY.toFixed(1)}% (Historical 5Y: $${company.historical[0].revenue.toLocaleString()}M to $${latest.revenue.toLocaleString()}M)`,
      baseAssumption: `Y1: +${baseGrowth1}% | Y3: +${baseGrowth3}% | Y5: +${baseGrowth5}%`,
      bullAssumption: `Y1: +${bullGrowth1}% | Y3: +${bullGrowth3}% | Y5: +${bullGrowth5}%`,
      bearAssumption: `Y1: +${bearGrowth1}% | Y3: +${bearGrowth3}% | Y5: +${bearGrowth5}%`,
      justification: 'Forecast anchors on latest run-rate, tapering down in outer years toward terminal nominal GDP expansion.'
    },
    {
      parameter: 'Operating Margin (EBIT %)',
      historicalFactValue: `FY${latest.year} Actual: ${latest.operatingMargin.toFixed(1)}% (FY${prior.year}: ${prior.operatingMargin.toFixed(1)}%)`,
      baseAssumption: `${baseOpMargin.toFixed(1)}%`,
      bullAssumption: `${bullOpMargin.toFixed(1)}% (+300 bps expansion)`,
      bearAssumption: `${bearOpMargin.toFixed(1)}% (-450 bps compression)`,
      justification: 'Tests sensitivity to fixed-cost absorption, R&D intensity, and competitive discounting.'
    },
    {
      parameter: 'CapEx as % of Revenue',
      historicalFactValue: `FY${latest.year} Actual: ${capexPct.toFixed(1)}% ($${latest.capitalExpenditures.toLocaleString()}M CapEx)`,
      baseAssumption: `${capexPct.toFixed(1)}%`,
      bullAssumption: `${(capexPct * 0.95).toFixed(1)}% (Efficiency gains)`,
      bearAssumption: `${(capexPct * 1.15).toFixed(1)}% (AI/Datacenter cost inflation)`,
      justification: 'Determines Free Cash Flow generation and reinvestment burden.'
    },
    {
      parameter: 'Diluted Share Count Trajectory',
      historicalFactValue: `FY${latest.year} Actual: ${latest.sharesDiluted.toLocaleString()}M shares`,
      baseAssumption: `-${buybackPct.toFixed(1)}% p.a. buyback retirement`,
      bullAssumption: `-${bullBuyback.toFixed(1)}% p.a. aggressive buybacks`,
      bearAssumption: `-${bearBuyback.toFixed(1)}% p.a. buybacks curtailed`,
      justification: 'Anchored in historical buyback authorization and FCF conversion cushion.'
    }
  ];

  return {
    scenarios: [baseScenario, bullScenario, bearScenario],
    historicalFactBaseline,
    assumptionsAuditTrail
  };
}

function calculateScenarioProjections(
  latest: {
    revenue: number;
    sharesDiluted: number;
    interestExpense: number;
  },
  growthRates: [number, number, number], // Y1, Y3, Y5 annual growth rates
  grossMarginPct: number,
  opMarginPct: number,
  taxRatePct: number,
  capexPctOfSales: number,
  annualShareReductionPct: number
) {
  const g1 = growthRates[0] / 100;
  const g3 = growthRates[1] / 100;
  const g5 = growthRates[2] / 100;

  // Year 1
  const rev1 = Math.round(latest.revenue * (1 + g1));
  const shares1 = Math.round(latest.sharesDiluted * (1 - (annualShareReductionPct / 100)));
  const y1 = computeFinancialsForYear(1, rev1, shares1, grossMarginPct, opMarginPct, taxRatePct, capexPctOfSales, latest.interestExpense);

  // Year 3 (compound intermediate)
  const rev3 = Math.round(rev1 * Math.pow(1 + g3, 2));
  const shares3 = Math.round(shares1 * Math.pow(1 - (annualShareReductionPct / 100), 2));
  const y3 = computeFinancialsForYear(3, rev3, shares3, grossMarginPct, opMarginPct, taxRatePct, capexPctOfSales, latest.interestExpense * 1.05);

  // Year 5 (compound intermediate)
  const rev5 = Math.round(rev3 * Math.pow(1 + g5, 2));
  const shares5 = Math.round(shares3 * Math.pow(1 - (annualShareReductionPct / 100), 2));
  const y5 = computeFinancialsForYear(5, rev5, shares5, grossMarginPct, opMarginPct, taxRatePct, capexPctOfSales, latest.interestExpense * 1.10);

  return [y1, y3, y5];
}

function computeFinancialsForYear(
  year: number,
  revenue: number,
  shares: number,
  grossMarginPct: number,
  opMarginPct: number,
  taxRatePct: number,
  capexPct: number,
  interestExpense: number
) {
  const grossProfit = Math.round(revenue * (grossMarginPct / 100));
  const operatingIncome = Math.round(revenue * (opMarginPct / 100));
  const ebt = Math.max(operatingIncome - interestExpense, 0);
  const netIncome = Math.round(ebt * (1 - (taxRatePct / 100)));
  const eps = Number((netIncome / (shares || 1)).toFixed(2));
  const capex = Math.round(revenue * (capexPct / 100));
  // Operating Cash Flow ~ Net Income + D&A (approx 65% of capex) - WC change (approx 3% of incremental revenue)
  const ocf = Math.round(netIncome + (capex * 0.85));
  const freeCashFlow = Math.round(ocf - capex);

  return {
    year,
    revenue,
    grossProfit,
    operatingIncome,
    netIncome,
    freeCashFlow,
    eps,
    sharesDiluted: shares
  };
}
