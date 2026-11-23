import React, { useState } from 'react';
import type { CompanyProfile, RiskItem } from '../types/financials';
import { assessCompanyRisks } from '../services/riskAssessmentEngine';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Building, 
  DollarSign, 
  UserCheck, 
  Globe2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  FileText,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RisksTabProps {
  company: CompanyProfile;
  onAskAiPreset?: (presetId: string, question: string) => void;
}

export const RisksTab: React.FC<RisksTabProps> = ({ company, onAskAiPreset }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const riskProfile = assessCompanyRisks(company);
  const latest = company.historical[company.historical.length - 1];

  const allRisks = riskProfile.risksByCategory.flatMap(c => c.items);

  const filteredRisks = allRisks.filter(risk => {
    const matchesCat = selectedCategory === 'all' || risk.category === selectedCategory;
    const matchesSearch = 
      risk.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      risk.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      risk.evidenceFromFilings.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: RiskItem['category']) => {
    switch (category) {
      case 'Business Risk':
        return <Building className="w-4 h-4 text-sky-400" />;
      case 'Financial Risk':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'Governance Risk':
        return <UserCheck className="w-4 h-4 text-purple-400" />;
      case 'Market & Macro Risk':
        return <Globe2 className="w-4 h-4 text-amber-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  const getImpactBadge = (impact: RiskItem['impact']) => {
    switch (impact) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Impact: High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Impact: Med</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Impact: Low</span>;
    }
  };

  const getProbabilityBadge = (prob: RiskItem['probability']) => {
    switch (prob) {
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">Prob: High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">Prob: Med</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Prob: Low</span>;
    }
  };

  const getTrendBadge = (trend: RiskItem['trend']) => {
    switch (trend) {
      case 'Worsening':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
            <TrendingUp className="w-3 h-3" /> Worsening
          </span>
        );
      case 'Improving':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <TrendingDown className="w-3 h-3" /> Improving
          </span>
        );
      case 'Stable':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/60">
            <Minus className="w-3 h-3" /> Stable
          </span>
        );
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 40) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Low Risk' };
    if (score < 65) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Moderate Risk' };
    if (score < 80) return { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Elevated Risk' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', label: 'High Risk' };
  };

  const riskBadge = getRiskScoreColor(riskProfile.riskScore);

  return (
    <div className="space-y-6">
      {/* Top Banner: Composite Risk Evaluation */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>4-Pillar Qualitative & Quantitative Risk Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {company.name} Risk Assessment
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {riskProfile.keyHeadwindsSummary}
          </p>
          <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Grounded in SEC Form 10-K Item 1A (Risk Factors) & Balance Sheet Disclosures</span>
          </div>
        </div>

        {/* Risk Score Pill */}
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Composite Risk Index</div>
            <div className={`text-3xl font-extrabold ${riskBadge.text}`}>
              {riskProfile.riskScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${riskBadge.bg} ${riskBadge.text} border ${riskBadge.border}`}>
              {riskBadge.label}
            </span>
          </div>
          {onAskAiPreset && (
            <button
              onClick={() => onAskAiPreset('risks', 'What are the major risks?')}
              className="flex flex-col items-center justify-center gap-1 px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/40 transition"
              title="Query AI Assistant on Risks"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Ask AI</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Pillars Summary Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {riskProfile.risksByCategory.map(cat => {
          const highCount = cat.items.filter(i => i.impact === 'High').length;
          const isSelected = selectedCategory === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(isSelected ? 'all' : cat.category)}
              className={`text-left p-4 rounded-xl border transition cursor-pointer ${
                isSelected 
                  ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/10' 
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(cat.category)}
                  <span className="text-xs font-semibold text-slate-200">{cat.category}</span>
                </div>
                <span className="text-xs font-mono bg-slate-950 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                  {cat.items.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>High-Impact Exposures:</span>
                <span className={`font-semibold ${highCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  {highCount}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Risk Matrix: 3x3 Probability vs Impact Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Probability × Impact Heat Matrix</h3>
          </div>
          <span className="text-[11px] text-slate-400">Click a cell to filter by exposure quadrant</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Header Row */}
          <div className="col-span-3 grid grid-cols-3 text-center text-[11px] font-semibold text-slate-400 pb-1 border-b border-slate-800">
            <div>Low Probability</div>
            <div>Medium Probability</div>
            <div>High Probability</div>
          </div>

          {/* Row 1: High Impact */}
          {(['Low', 'Medium', 'High'] as const).map(prob => {
            const matches = allRisks.filter(r => r.probability === prob && r.impact === 'High');
            const isDanger = prob === 'High';
            return (
              <div
                key={`high-impact-${prob}`}
                className={`p-3 rounded-lg border min-h-[90px] flex flex-col justify-between ${
                  isDanger 
                    ? 'bg-rose-950/30 border-rose-800/50' 
                    : prob === 'Medium' 
                    ? 'bg-amber-950/20 border-amber-800/40' 
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-rose-300">
                  <span>High Impact</span>
                  <span className="font-mono bg-slate-900/80 px-1.5 py-0.2 rounded text-slate-300">
                    {matches.length}
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {matches.map(m => (
                    <div key={m.id} className="text-[10px] text-slate-300 truncate" title={m.title}>
                      • {m.title}
                    </div>
                  ))}
                  {matches.length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                </div>
              </div>
            );
          })}

          {/* Row 2: Medium Impact */}
          {(['Low', 'Medium', 'High'] as const).map(prob => {
            const matches = allRisks.filter(r => r.probability === prob && r.impact === 'Medium');
            return (
              <div
                key={`med-impact-${prob}`}
                className={`p-3 rounded-lg border min-h-[80px] flex flex-col justify-between ${
                  prob === 'High' 
                    ? 'bg-amber-950/20 border-amber-800/40' 
                    : 'bg-slate-950/60 border-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-amber-300">
                  <span>Medium Impact</span>
                  <span className="font-mono bg-slate-900/80 px-1.5 py-0.2 rounded text-slate-300">
                    {matches.length}
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {matches.map(m => (
                    <div key={m.id} className="text-[10px] text-slate-300 truncate" title={m.title}>
                      • {m.title}
                    </div>
                  ))}
                  {matches.length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                </div>
              </div>
            );
          })}

          {/* Row 3: Low Impact */}
          {(['Low', 'Medium', 'High'] as const).map(prob => {
            const matches = allRisks.filter(r => r.probability === prob && r.impact === 'Low');
            return (
              <div
                key={`low-impact-${prob}`}
                className="p-3 rounded-lg border min-h-[70px] flex flex-col justify-between bg-slate-950/40 border-slate-800/60"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-emerald-300">
                  <span>Low Impact</span>
                  <span className="font-mono bg-slate-900/80 px-1.5 py-0.2 rounded text-slate-300">
                    {matches.length}
                  </span>
                </div>
                <div className="space-y-1 mt-1">
                  {matches.map(m => (
                    <div key={m.id} className="text-[10px] text-slate-300 truncate" title={m.title}>
                      • {m.title}
                    </div>
                  ))}
                  {matches.length === 0 && <span className="text-[10px] text-slate-400 italic">None</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Categories ({allRisks.length})
          </button>
          {riskProfile.risksByCategory.map(cat => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedCategory === cat.category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {getCategoryIcon(cat.category)}
              <span>{cat.category}</span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search risk factors & evidence..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Detailed Risk Cards List */}
      <div className="space-y-4">
        {filteredRisks.map(risk => (
          <div
            key={risk.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700 transition"
          >
            {/* Card Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                  {getCategoryIcon(risk.category)}
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {risk.category}
                  </span>
                  <h4 className="text-base font-bold text-white">
                    {risk.title}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getProbabilityBadge(risk.probability)}
                {getImpactBadge(risk.impact)}
                {getTrendBadge(risk.trend)}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {risk.description}
            </p>

            {/* Supporting Evidence and Mitigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              {/* Filing Evidence Box */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Audited SEC Filing Evidence</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {risk.evidenceFromFilings}
                </p>
              </div>

              {/* Mitigating Factors Box */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mitigating Countermeasures & Buffers</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {risk.mitigatingFactors}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredRisks.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium">No risk factors matched your current filter.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchFilter(''); }}
              className="mt-2 text-xs text-indigo-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Compliance Risk Disclaimer Footer */}
      <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-xs text-amber-300/80 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-300">Mandatory Risk Factor Grounding Note:</span> Risk items and impact classifications are derived strictly from SEC Form 10-K Item 1A statutory disclosures, audited balance sheet leverage metrics, and verified segment customer concentration. Forward projections and macroeconomic sensitivity do not guarantee investment outcomes.
        </div>
      </div>
    </div>
  );
};
