import React from 'react';
import { CompanyProfile } from '../types/financials';
import { generatePeerComparison } from '../services/peerComparisonEngine';
import { 
  Users, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  Compass, 
  Crown, 
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

interface PeerComparisonTabProps {
  company: CompanyProfile;
}

export const PeerComparisonTab: React.FC<PeerComparisonTabProps> = ({ company }) => {
  const peerAnalysis = generatePeerComparison(company);
  const targetRow = peerAnalysis.peers[0];
  const otherPeers = peerAnalysis.peers.slice(1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <Users className="w-4 h-4" />
            <span>Cross-Company Industry Benchmark</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {company.name} vs {peerAnalysis.industryName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Side-by-side comparative analysis of margins, capital efficiency, leverage safety, and market valuation multiples across direct sector peers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <Award className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-[10px] text-slate-400">ECONOMIC MOAT</div>
            <strong className="text-white text-sm">
              {peerAnalysis.competitiveMoatSummary.hasWideMoat ? 'Wide Moat' : 'Narrow Moat'}
            </strong>
          </div>
        </div>
      </div>

      {/* Radar Chart & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar / Spider Chart */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Multi-Dimensional Competitiveness Radar</span>
            </h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> {company.ticker}
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> Peer Avg
              </span>
            </div>
          </div>

          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={peerAnalysis.radarDimensions}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar
                  name={company.ticker}
                  dataKey="targetScore"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
                <Radar
                  name="Peer Average"
                  dataKey="peerAverageScore"
                  stroke="#94a3b8"
                  fill="#64748b"
                  fillOpacity={0.25}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            Higher values indicate stronger performance in profitability, efficiency, solvency, growth, and valuation discount.
          </p>
        </div>

        {/* Peer Metric Percentile Rankings */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Target Company Peer Standings</span>
            </h3>

            <div className="space-y-2.5">
              {peerAnalysis.rankings.map((rank, idx) => {
                const isLeader = rank.verdict === 'Leader';
                const isAboveAvg = rank.verdict === 'Above Average';
                return (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{rank.metric}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Target: <strong className="text-white">{rank.targetValue}</strong> vs Median: {rank.peerMedian}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 text-[11px]">Rank #{rank.targetRank} of {rank.totalPeers}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isLeader 
                          ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                          : isAboveAvg 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {rank.verdict}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Moat Summary Card */}
          <div className="p-3.5 bg-indigo-950/40 rounded-xl border border-indigo-800/60 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Competitive Moat & Strategic Edge</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {peerAnalysis.competitiveMoatSummary.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Full Peer Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Comprehensive Peer Benchmarking Matrix</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Audited SEC 10-K Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium whitespace-nowrap">
              <tr>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3 text-right">Mkt Cap ($B)</th>
                <th className="py-2.5 px-3 text-right">3Y Rev CAGR</th>
                <th className="py-2.5 px-3 text-right">Gross Margin</th>
                <th className="py-2.5 px-3 text-right">Op Margin</th>
                <th className="py-2.5 px-3 text-right">Net Margin</th>
                <th className="py-2.5 px-3 text-right">ROCE</th>
                <th className="py-2.5 px-3 text-right">ROE</th>
                <th className="py-2.5 px-3 text-right">FCF Conv</th>
                <th className="py-2.5 px-3 text-right">Net Debt / EBITDA</th>
                <th className="py-2.5 px-3 text-right">Trailing P/E</th>
                <th className="py-2.5 px-3 text-right">EV/EBITDA</th>
                <th className="py-2.5 px-3 text-right">PEG</th>
                <th className="py-2.5 px-3 text-right">F-Score</th>
                <th className="py-2.5 px-3 text-right">Z-Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200 whitespace-nowrap">
              {peerAnalysis.peers.map((p) => {
                const isTarget = p.isTargetCompany;
                return (
                  <tr 
                    key={p.ticker} 
                    className={`transition ${isTarget ? 'bg-indigo-950/30 font-semibold' : 'hover:bg-slate-800/30'}`}
                  >
                    <td className="py-2.5 px-3 font-sans flex items-center gap-2">
                      {isTarget && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>}
                      <strong className={isTarget ? 'text-indigo-400' : 'text-slate-100'}>{p.ticker}</strong>
                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">{p.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">
                      ${(p.marketCap / 1000).toFixed(1)}B
                    </td>
                    <td className={`py-2.5 px-3 text-right ${p.revenueCagr3Y >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.revenueCagr3Y >= 0 ? `+${p.revenueCagr3Y.toFixed(1)}%` : `${p.revenueCagr3Y.toFixed(1)}%`}
                    </td>
                    <td className="py-2.5 px-3 text-right">{p.grossMargin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-300">{p.operatingMargin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right">{p.netMargin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400">{p.roce.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right">{p.roe.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right">{p.fcfMargin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right">{p.netDebtToEbitda.toFixed(2)}x</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{p.peTrailing.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right">{p.evToEbitda.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right">{p.pegRatio}x</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{p.piotroskiScore}/9</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{p.altmanZScore.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
