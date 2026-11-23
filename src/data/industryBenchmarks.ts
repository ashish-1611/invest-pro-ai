export interface IndustryGroup {
  id: string;
  name: string;
  sector: string;
  memberTickers: string[];
  medianPe: number;
  medianEvEbitda: number;
  medianGrossMargin: number;
  medianOperatingMargin: number;
  medianNetMargin: number;
  medianRoe: number;
  medianRoce: number;
  medianDebtToEquity: number;
  medianWacc: number;
  riskFreeRate: number; // 10-Yr US Treasury Yield
  equityRiskPremium: number;
}

export const INDUSTRY_GROUPS: IndustryGroup[] = [
  {
    id: 'mega-cap-tech',
    name: 'Mega-Cap Technology & Platforms',
    sector: 'Technology / Communication Services',
    memberTickers: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN'],
    medianPe: 35.8,
    medianEvEbitda: 24.2,
    medianGrossMargin: 57.5,
    medianOperatingMargin: 32.0,
    medianNetMargin: 28.0,
    medianRoe: 43.1,
    medianRoce: 31.4,
    medianDebtToEquity: 0.24,
    medianWacc: 9.2,
    riskFreeRate: 4.40, // % US 10Y
    equityRiskPremium: 5.0
  },
  {
    id: 'ai-hardware-semis',
    name: 'Semiconductors & AI Compute',
    sector: 'Technology',
    memberTickers: ['NVDA', 'AAPL', 'MSFT'],
    medianPe: 43.0,
    medianEvEbitda: 31.0,
    medianGrossMargin: 68.0,
    medianOperatingMargin: 44.0,
    medianNetMargin: 36.0,
    medianRoe: 45.0,
    medianRoce: 35.0,
    medianDebtToEquity: 0.20,
    medianWacc: 10.5,
    riskFreeRate: 4.40,
    equityRiskPremium: 5.2
  },
  {
    id: 'consumer-mobility',
    name: 'Consumer Discretionary & Clean Tech',
    sector: 'Consumer Discretionary',
    memberTickers: ['TSLA', 'AMZN', 'AAPL'],
    medianPe: 45.0,
    medianEvEbitda: 25.0,
    medianGrossMargin: 35.0,
    medianOperatingMargin: 12.0,
    medianNetMargin: 10.0,
    medianRoe: 21.0,
    medianRoce: 14.0,
    medianDebtToEquity: 0.40,
    medianWacc: 9.8,
    riskFreeRate: 4.40,
    equityRiskPremium: 5.0
  },
  {
    id: 'consumer-defensive',
    name: 'Consumer Staples & Global Brands',
    sector: 'Consumer Defensive',
    memberTickers: ['KO'],
    medianPe: 24.0,
    medianEvEbitda: 18.0,
    medianGrossMargin: 59.0,
    medianOperatingMargin: 24.0,
    medianNetMargin: 22.0,
    medianRoe: 36.0,
    medianRoce: 15.0,
    medianDebtToEquity: 1.40,
    medianWacc: 7.2,
    riskFreeRate: 4.40,
    equityRiskPremium: 4.5
  },
  {
    id: 'diversified-banking',
    name: 'Financial Services & Global Banks',
    sector: 'Financials',
    memberTickers: ['JPM'],
    medianPe: 12.5,
    medianEvEbitda: 9.5,
    medianGrossMargin: 100.0,
    medianOperatingMargin: 38.0,
    medianNetMargin: 30.0,
    medianRoe: 15.0,
    medianRoce: 5.5,
    medianDebtToEquity: 1.25,
    medianWacc: 8.5,
    riskFreeRate: 4.40,
    equityRiskPremium: 5.0
  },
  {
    id: 'indian-it-services',
    name: 'Indian IT Services & Global Consulting',
    sector: 'Technology',
    memberTickers: ['TCS', 'INFY'],
    medianPe: 30.5,
    medianEvEbitda: 21.0,
    medianGrossMargin: 42.0,
    medianOperatingMargin: 23.5,
    medianNetMargin: 18.5,
    medianRoe: 42.0,
    medianRoce: 48.0,
    medianDebtToEquity: 0.05,
    medianWacc: 11.2,
    riskFreeRate: 6.85, // 10-Yr Indian G-Sec Yield
    equityRiskPremium: 5.5
  },
  {
    id: 'indian-conglomerates',
    name: 'Indian Conglomerates, Energy & Retail',
    sector: 'Energy & Conglomerates',
    memberTickers: ['RELIANCE', 'TATAMOTORS'],
    medianPe: 22.0,
    medianEvEbitda: 13.5,
    medianGrossMargin: 34.0,
    medianOperatingMargin: 15.0,
    medianNetMargin: 8.5,
    medianRoe: 14.5,
    medianRoce: 14.8,
    medianDebtToEquity: 0.55,
    medianWacc: 11.5,
    riskFreeRate: 6.85,
    equityRiskPremium: 5.5
  },
  {
    id: 'indian-banking',
    name: 'Indian Private Banking & Financial Services',
    sector: 'Financials',
    memberTickers: ['HDFCBANK', 'JPM'],
    medianPe: 19.5,
    medianEvEbitda: 14.0,
    medianGrossMargin: 100.0,
    medianOperatingMargin: 32.0,
    medianNetMargin: 22.5,
    medianRoe: 16.8,
    medianRoce: 12.5,
    medianDebtToEquity: 1.10,
    medianWacc: 10.8,
    riskFreeRate: 6.85,
    equityRiskPremium: 5.5
  },
  {
    id: 'indian-fmcg',
    name: 'Indian FMCG & Consumer Staples',
    sector: 'Consumer Defensive',
    memberTickers: ['ITC', 'KO'],
    medianPe: 28.4,
    medianEvEbitda: 19.5,
    medianGrossMargin: 58.0,
    medianOperatingMargin: 35.0,
    medianNetMargin: 28.5,
    medianRoe: 30.0,
    medianRoce: 37.5,
    medianDebtToEquity: 0.02,
    medianWacc: 10.2,
    riskFreeRate: 6.85,
    equityRiskPremium: 5.2
  },
  {
    id: 'indian-auto',
    name: 'Automotive, Commercial Vehicles & EV',
    sector: 'Consumer Cyclical',
    memberTickers: ['TATAMOTORS', 'TSLA'],
    medianPe: 16.5,
    medianEvEbitda: 7.8,
    medianGrossMargin: 26.5,
    medianOperatingMargin: 11.5,
    medianNetMargin: 7.2,
    medianRoe: 35.8,
    medianRoce: 19.4,
    medianDebtToEquity: 0.72,
    medianWacc: 11.8,
    riskFreeRate: 6.85,
    equityRiskPremium: 5.5
  }
];

export function findIndustryForCompany(ticker: string): IndustryGroup {
  for (const group of INDUSTRY_GROUPS) {
    if (group.memberTickers.includes(ticker)) {
      return group;
    }
  }
  return INDUSTRY_GROUPS[0];
}
