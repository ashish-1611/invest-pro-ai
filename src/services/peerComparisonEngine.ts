import { CompanyProfile, PeerComparisonRow } from '../types/financials';
import { BENCHMARK_COMPANIES } from '../data/companyDatabase';
import { findIndustryForCompany } from '../data/industryBenchmarks';
import { calculateHealthScores } from './financialAnalysisEngine';

export interface PeerAnalysisResult {
  industryName: string;
  peers: PeerComparisonRow[];
  radarDimensions: {
    dimension: string;
    targetScore: number; // 0 - 100
    peerAverageScore: number; // 0 - 100
    fullMark: number;
  }[];
  rankings: {
    metric: string;
    targetRank: number;
    totalPeers: number;
    targetValue: string;
    peerMedian: string;
    verdict: 'Leader' | 'Above Average' | 'Average' | 'Laggard';
  }[];
  competitiveMoatSummary: {
    hasWideMoat: boolean;
    moatSources: string[];
    summary: string;
  };
}

export function generatePeerComparison(
  targetCompany: CompanyProfile,
  allCompanies: CompanyProfile[] = BENCHMARK_COMPANIES
): PeerAnalysisResult {
  const industry = findIndustryForCompany(targetCompany.ticker);
  
  // Find peer companies in the same sector or industry group
  let peerCandidates = allCompanies.filter(c => 
    c.ticker !== targetCompany.ticker && 
    (industry.memberTickers.includes(c.ticker) || c.sector === targetCompany.sector)
  );

  // If few peers found, add other relevant companies
  if (peerCandidates.length === 0) {
    peerCandidates = allCompanies.filter(c => c.ticker !== targetCompany.ticker).slice(0, 3);
  }

  // Build rows for all participants
  const allRows: PeerComparisonRow[] = [
    buildPeerRow(targetCompany, true),
    ...peerCandidates.map(c => buildPeerRow(c, false))
  ];

  // Radar Dimensions (Normalized 0 - 100)
  const targetRow = allRows[0];
  const otherRows = allRows.slice(1);
  const avg = (fn: (r: PeerComparisonRow) => number) => {
    if (otherRows.length === 0) return 50;
    return otherRows.reduce((acc, r) => acc + fn(r), 0) / otherRows.length;
  };

  // 1. Growth Score (3Y CAGR)
  const targetGrowthScore = Math.min(Math.max((targetRow.revenueCagr3Y + 5) * 4, 15), 100);
  const peerAvgGrowthScore = Math.min(Math.max((avg(r => r.revenueCagr3Y) + 5) * 4, 15), 100);

  // 2. Profitability Score (Op Margin + Net Margin)
  const targetProfScore = Math.min(Math.max((targetRow.operatingMargin + targetRow.netMargin) * 1.2, 20), 100);
  const peerAvgProfScore = Math.min(Math.max((avg(r => r.operatingMargin + r.netMargin)) * 1.2, 20), 100);

  // 3. Capital Efficiency (ROCE / ROIC)
  const targetEfficiencyScore = Math.min(Math.max(targetRow.roce * 1.6, 20), 100);
  const peerAvgEfficiencyScore = Math.min(Math.max(avg(r => r.roce) * 1.6, 20), 100);

  // 4. Financial Solvency (Altman Z + Net Debt buffer)
  const targetSolvencyScore = Math.min(Math.max(targetRow.altmanZScore * 14, 25), 100);
  const peerAvgSolvencyScore = Math.min(Math.max(avg(r => r.altmanZScore) * 14, 25), 100);

  // 5. Valuation Attractiveness (Lower P/E is higher score)
  const targetValScore = Math.min(Math.max(120 - targetRow.peTrailing * 1.5, 20), 100);
  const peerAvgValScore = Math.min(Math.max(120 - avg(r => r.peTrailing) * 1.5, 20), 100);

  const radarDimensions = [
    { dimension: 'Revenue Growth', targetScore: Math.round(targetGrowthScore), peerAverageScore: Math.round(peerAvgGrowthScore), fullMark: 100 },
    { dimension: 'Operating Margin', targetScore: Math.round(targetProfScore), peerAverageScore: Math.round(peerAvgProfScore), fullMark: 100 },
    { dimension: 'Capital Efficiency (ROCE)', targetScore: Math.round(targetEfficiencyScore), peerAverageScore: Math.round(peerAvgEfficiencyScore), fullMark: 100 },
    { dimension: 'Balance Sheet Health', targetScore: Math.round(targetSolvencyScore), peerAverageScore: Math.round(peerAvgSolvencyScore), fullMark: 100 },
    { dimension: 'Valuation Value', targetScore: Math.round(targetValScore), peerAverageScore: Math.round(peerAvgValScore), fullMark: 100 }
  ];

  // Metric Rankings
  const totalPeers = allRows.length;
  const rankings = [
    getMetricRank(allRows, r => r.operatingMargin, true, 'Operating Margin', '%'),
    getMetricRank(allRows, r => r.roce, true, 'ROCE', '%'),
    getMetricRank(allRows, r => r.revenueCagr3Y, true, '3-Year Revenue CAGR', '%'),
    getMetricRank(allRows, r => r.fcfMargin, true, 'FCF Margin', '%'),
    getMetricRank(allRows, r => r.peTrailing, false, 'P/E Multiple (Lower = Better)', 'x'),
    getMetricRank(allRows, r => r.altmanZScore, true, 'Altman Z-Score', '')
  ];

  // Competitive Moat Summary
  const isLeaderInMargins = targetRow.operatingMargin > avg(r => r.operatingMargin);
  const isLeaderInRoce = targetRow.roce > avg(r => r.roce);
  const moatSources: string[] = [];
  if (isLeaderInMargins) moatSources.push('High Pricing Power & Brand Intangibles');
  if (isLeaderInRoce) moatSources.push('Capital Allocation Advantage & Cost Structure');
  if (targetCompany.ticker === 'AAPL' || targetCompany.ticker === 'MSFT' || targetCompany.ticker === 'GOOGL') {
    moatSources.push('Ecosystem Switching Costs & Network Effects');
  } else if (targetCompany.ticker === 'NVDA') {
    moatSources.push('Proprietary CUDA Software Ecosystem & Architectural Lead');
  }

  const hasWideMoat = moatSources.length >= 2;
  const summary = `${targetCompany.name} exhibits ${hasWideMoat ? 'a Wide Economic Moat' : 'a Narrow to Moderate Moat'} compared to peers. Its operating margin of ${targetRow.operatingMargin.toFixed(1)}% ranks ${rankings[0].targetRank} of ${totalPeers}, supported by ${moatSources.join(', ') || 'niche scale'}.`;

  return {
    industryName: industry.name,
    peers: allRows,
    radarDimensions,
    rankings,
    competitiveMoatSummary: {
      hasWideMoat,
      moatSources,
      summary
    }
  };
}

function buildPeerRow(company: CompanyProfile, isTargetCompany: boolean): PeerComparisonRow {
  const h = company.historical;
  const latest = h[h.length - 1];
  const threeYearsPrior = h[h.length - 4] || h[0];
  const yearsSpan = Math.max(latest.year - threeYearsPrior.year, 1);
  const revenueCagr3Y = Number(((Math.pow(latest.revenue / (threeYearsPrior.revenue || 1), 1 / yearsSpan) - 1) * 100).toFixed(1));
  const health = calculateHealthScores(company);
  const fcfMargin = Number(((latest.freeCashFlow / (latest.revenue || 1)) * 100).toFixed(1));

  return {
    ticker: company.ticker,
    name: company.name,
    marketCap: company.marketCap,
    revenue: latest.revenue,
    revenueCagr3Y,
    grossMargin: latest.grossMargin,
    operatingMargin: latest.operatingMargin,
    netMargin: latest.netMargin,
    fcfMargin,
    roe: latest.roe,
    roce: latest.roce,
    roic: latest.roic,
    debtToEquity: latest.debtToEquity,
    netDebtToEbitda: latest.netDebtToEbitda,
    interestCoverage: latest.interestCoverage,
    peTrailing: latest.peRatio,
    peForward: Number((latest.peRatio * 0.88).toFixed(1)),
    evToEbitda: latest.evToEbitda,
    priceToFcf: latest.priceToFcf,
    pegRatio: Number((latest.peRatio / Math.max(latest.revenueGrowthYoY, 2.0)).toFixed(2)),
    altmanZScore: health.altmanZScore.score,
    piotroskiScore: health.piotroskiFScore.score,
    isTargetCompany
  };
}

function getMetricRank(
  allRows: PeerComparisonRow[],
  accessor: (r: PeerComparisonRow) => number,
  higherIsBetter: boolean,
  metricName: string,
  unit: string
) {
  const sorted = [...allRows].sort((a, b) => 
    higherIsBetter ? accessor(b) - accessor(a) : accessor(a) - accessor(b)
  );
  const targetIndex = sorted.findIndex(r => r.isTargetCompany);
  const rank = targetIndex + 1;
  const targetVal = accessor(allRows[0]);
  
  // Median
  const vals = allRows.map(accessor).sort((a, b) => a - b);
  const mid = Math.floor(vals.length / 2);
  const medianVal = vals.length % 2 !== 0 ? vals[mid] : (vals[mid - 1] + vals[mid]) / 2;

  let verdict: 'Leader' | 'Above Average' | 'Average' | 'Laggard' = 'Average';
  if (rank === 1) verdict = 'Leader';
  else if (rank <= Math.ceil(allRows.length / 2)) verdict = 'Above Average';
  else verdict = 'Laggard';

  return {
    metric: metricName,
    targetRank: rank,
    totalPeers: allRows.length,
    targetValue: `${targetVal.toFixed(1)}${unit}`,
    peerMedian: `${medianVal.toFixed(1)}${unit}`,
    verdict
  };
}
