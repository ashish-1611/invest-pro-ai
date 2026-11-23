// Core Financial Data Model and Analysis Types

export interface FinancialYearData {
  year: number;
  revenue: number; // in Millions USD
  revenueGrowthYoY: number; // percentage
  grossProfit: number;
  grossMargin: number; // percentage
  operatingIncome: number; // EBIT
  operatingMargin: number; // percentage
  netIncome: number;
  netMargin: number; // percentage
  ebitda: number;
  ebitdaMargin: number; // percentage
  eps: number; // diluted in USD
  epsGrowthYoY: number; // percentage
  sharesDiluted: number; // in Millions
  
  // Balance Sheet
  cashAndEquivalents: number;
  shortTermInvestments: number;
  totalCashAndInvestments: number;
  accountsReceivable: number;
  inventory: number;
  totalCurrentAssets: number;
  propertyPlantEquipment: number;
  totalAssets: number;
  
  accountsPayable: number;
  shortTermDebt: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalDebt: number;
  totalLiabilities: number;
  totalEquity: number;
  
  // Cash Flow
  operatingCashFlow: number;
  capitalExpenditures: number; // CapEx
  freeCashFlow: number; // OCF - CapEx
  fcfConversion: number; // FCF / Net Income %
  dividendsPaid: number;
  shareRepurchases: number;
  
  // Computed & Market Ratios
  stockPriceClose: number;
  marketCap: number;
  peRatio: number;
  evToEbitda: number;
  priceToBook: number;
  priceToFcf: number;
  debtToEquity: number;
  netDebt: number; // Total Debt - Total Cash
  netDebtToEbitda: number;
  currentRatio: number;
  quickRatio: number;
  interestExpense: number;
  interestCoverage: number; // EBIT / Interest
  roe: number; // Net Income / Equity %
  roce: number; // EBIT / (Total Assets - Current Liabilities) %
  roic: number; // NOPAT / Invested Capital %
  assetTurnover: number; // Revenue / Total Assets
  financialLeverage: number; // Total Assets / Equity
}

export interface SegmentRevenue {
  name: string;
  revenue: number; // Millions USD
  share: number; // percentage
  growthYoY: number; // percentage
}

export interface CompanyProfile {
  ticker: string;
  name: string;
  industry: string;
  sector: string;
  currency: string; // 'USD' | 'INR' | etc.
  country?: 'India' | 'US' | string;
  exchange: string;
  description: string;
  currentPrice: number;
  sharesOutstanding: number; // in Millions
  marketCap: number; // Millions in company currency
  enterpriseValue: number; // Millions in company currency
  beta: number;
  dividendYield: number; // percentage
  fiscalYearEnd: string;
  secFilingSource: string;
  isCustomCompany?: boolean;
  segments: SegmentRevenue[];
  historical: FinancialYearData[]; // latest 5 years sorted oldest to newest
}

export function getCurrencySymbol(company?: { currency?: string } | string): string {
  if (!company) return '$';
  const cur = typeof company === 'string' ? company : company.currency;
  if (cur === 'INR') return '₹';
  if (cur === 'EUR') return '€';
  if (cur === 'GBP') return '£';
  return '$';
}

export interface DuPontAnalysis {
  stage3: {
    netProfitMargin: number;
    assetTurnover: number;
    financialLeverage: number;
    calculatedRoe: number;
  };
  stage5: {
    taxBurden: number; // Net Income / EBT
    interestBurden: number; // EBT / EBIT
    operatingMargin: number; // EBIT / Revenue
    assetTurnover: number; // Revenue / Assets
    financialLeverage: number; // Assets / Equity
    calculatedRoe: number;
  };
  interpretation: string;
  driverOfRoe: 'Margin Driven' | 'Asset Efficiency Driven' | 'Financial Leverage Driven' | 'Balanced';
}

export interface HealthScores {
  piotroskiFScore: {
    score: number; // 0 - 9
    rating: 'Strong' | 'Moderate' | 'Weak';
    criteria: {
      name: string;
      category: 'Profitability' | 'Leverage & Liquidity' | 'Operating Efficiency';
      passed: boolean;
      metricValue: string;
      benchmark: string;
      sourceItem: string;
    }[];
  };
  altmanZScore: {
    score: number;
    zone: 'Safe Zone' | 'Grey Zone' | 'Distress Zone';
    components: {
      component: string;
      name: string;
      value: number;
      weight: number;
      contribution: number;
    }[];
    interpretation: string;
  };
  beneishMScore: {
    score: number;
    manipulationRisk: 'Low' | 'Moderate' | 'Elevated';
    interpretation: string;
  };
}

export interface FinancialStrengthWeakness {
  id: string;
  category: 'Profitability' | 'Solvency & Debt' | 'Cash Flow & Quality' | 'Efficiency' | 'Valuation';
  type: 'strength' | 'weakness';
  title: string;
  description: string;
  metric: string;
  currentValue: string;
  historicalOrPeerBenchmark: string;
  supportingEvidence: string;
  importance: 'High' | 'Medium' | 'Low';
}

export interface DcfValuationResult {
  wacc: number; // percentage
  costOfEquity: number; // Rf + Beta * ERP
  costOfDebtAfterTax: number;
  riskFreeRate: number;
  equityRiskPremium: number;
  terminalGrowthRate: number; // perpetual growth %
  exitMultiple: number; // EV/EBITDA multiple
  
  projectedFcff: { year: number; projectedFcf: number; discountFactor: number; presentValue: number }[];
  pvExplicitCashFlows: number;
  
  // Method 1: Perpetual Growth
  terminalValuePerpetual: number;
  pvTerminalValuePerpetual: number;
  enterpriseValuePerpetual: number;
  equityValuePerpetual: number;
  fairValuePerSharePerpetual: number;
  
  // Method 2: Exit Multiple
  terminalValueExitMultiple: number;
  pvTerminalValueExitMultiple: number;
  enterpriseValueExitMultiple: number;
  equityValueExitMultiple: number;
  fairValuePerShareExitMultiple: number;
  
  // Blended / Selected
  selectedFairValue: number;
  marginOfSafety: number; // percentage difference
  upsideDownside: number; // percentage
  
  // Sensitivity Matrix: WACC vs Terminal Growth
  sensitivityMatrix: {
    waccValues: number[];
    growthValues: number[];
    fairValues: number[][]; // grid [waccIndex][growthIndex]
  };
}

export interface GrahamValuationResult {
  classicFormula: number; // sqrt(22.5 * EPS * BVPS)
  growthFormula: number; // (EPS * (8.5 + 2g) * 4.4) / AAA_Yield
  adjustedFormula: number; // conservative variant
  bookValuePerShare: number;
  epsUsed: number;
  growthRateUsed: number;
  aaaBondYield: number;
  fairValue: number;
  upsideDownside: number;
}

export interface MultiplesValuationResult {
  peTrailing: { multiple: number; impliedPrice: number; peerMedian: number; discountPremium: number };
  peForward: { multiple: number; impliedPrice: number; peerMedian: number; discountPremium: number };
  evToEbitda: { multiple: number; impliedPrice: number; peerMedian: number; discountPremium: number };
  priceToFcf: { multiple: number; impliedPrice: number; peerMedian: number; discountPremium: number };
  priceToBook: { multiple: number; impliedPrice: number; peerMedian: number; discountPremium: number };
  pegRatio: { ratio: number; interpretation: string };
  impliedFairValue: number;
  upsideDownside: number;
}

export interface CompositeValuationSummary {
  currentPrice: number;
  dcfPerpetual: number;
  dcfExitMultiple: number;
  grahamValue: number;
  multiplesValuation: number;
  analystConsensusOrBookTarget?: number;
  weightedFairValue: number;
  marginOfSafetyPercent: number; // (FairValue - CurrentPrice) / FairValue * 100
  verdict: 'Significantly Undervalued' | 'Modestly Undervalued' | 'Fairly Valued' | 'Modestly Overvalued' | 'Significantly Overvalued';
  confidenceLevel: 'High' | 'Medium' | 'Moderate';
  rationale: string;
}

export interface FinancialProjectionScenario {
  scenarioName: 'Base Case' | 'Bull Case' | 'Bear Case';
  assumptions: {
    revenueGrowthYear1: number; // %
    revenueGrowthYear3: number; // %
    revenueGrowthYear5: number; // %
    grossMargin: number; // %
    operatingMargin: number; // %
    taxRate: number; // %
    capexPercentOfSales: number; // %
    sharesAnnualChangePercent: number; // % (- for buybacks, + for dilution)
    justification: string;
  };
  projections: {
    year: number; // 1, 3, 5
    revenue: number;
    grossProfit: number;
    operatingIncome: number;
    netIncome: number;
    freeCashFlow: number;
    eps: number;
    sharesDiluted: number;
  }[];
}

export interface RiskItem {
  id: string;
  category: 'Business Risk' | 'Financial Risk' | 'Governance Risk' | 'Market & Macro Risk';
  title: string;
  description: string;
  probability: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  evidenceFromFilings: string;
  mitigatingFactors: string;
  trend: 'Worsening' | 'Stable' | 'Improving';
}

export interface PeerComparisonRow {
  ticker: string;
  name: string;
  marketCap: number;
  revenue: number;
  revenueCagr3Y: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  fcfMargin: number;
  roe: number;
  roce: number;
  roic: number;
  debtToEquity: number;
  netDebtToEbitda: number;
  interestCoverage: number;
  peTrailing: number;
  peForward: number;
  evToEbitda: number;
  priceToFcf: number;
  pegRatio: number;
  altmanZScore: number;
  piotroskiScore: number;
  isTargetCompany?: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  presetQuestion?: string;
  supportingEvidence?: {
    statement: string;
    metric: string;
    filingSource: string;
    period: string;
    verifiedValue: string;
  }[];
  missingInformationIdentified?: string[];
  historicalFacts?: string[];
  forecastedAssumptions?: string[];
  regulatoryDisclaimer: string;
}
