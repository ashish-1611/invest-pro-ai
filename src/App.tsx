import React, { useState } from 'react';
import type { CompanyProfile } from './types/financials';
import { BENCHMARK_COMPANIES } from './data/companyDatabase';
import { Header } from './components/Header';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { FinancialHealthTab } from './components/FinancialHealthTab';
import { ValuationTab } from './components/ValuationTab';
import { PeerComparisonTab } from './components/PeerComparisonTab';
import { RatiosDeepDiveTab } from './components/RatiosDeepDiveTab';
import { ProjectionsTab } from './components/ProjectionsTab';
import { RisksTab } from './components/RisksTab';
import { AiAssistantTab } from './components/AiAssistantTab';
import { FinancialStatementsModal } from './components/FinancialStatementsModal';
import { CustomCompanyModal } from './components/CustomCompanyModal';
import { ExportReportModal } from './components/ExportReportModal';
import { AuthModal } from './components/AuthModal';
import type { UserProfile } from './components/AuthModal';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Database, 
  ExternalLink,
  Info
} from 'lucide-react';
import './App.css';

export function App() {
  const [companies, setCompanies] = useState<CompanyProfile[]>(BENCHMARK_COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfile>(BENCHMARK_COMPANIES[0]); // Apple by default
  const [activeTab, setActiveTab] = useState<string>('summary');

  // User Profile and Authentication state
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('invest_ai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals state
  const [isStatementsModalOpen, setIsStatementsModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Preset question triggered from other tabs to AI tab
  const [aiPresetTrigger, setAiPresetTrigger] = useState<{ presetId: string; question: string } | null>(null);

  const handleAskAiPreset = (presetId: string, question: string) => {
    setAiPresetTrigger({ presetId, question });
    setActiveTab('assistant');
  };

  const handleAddCustomCompany = (newCompany: CompanyProfile) => {
    setCompanies(prev => [newCompany, ...prev]);
    setSelectedCompany(newCompany);
    setActiveTab('summary');
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('invest_ai_user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Fixed Terminal Header */}
      <Header
        companies={companies}
        selectedCompany={selectedCompany}
        onSelectCompany={(c) => {
          setSelectedCompany(c);
          setAiPresetTrigger(null);
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenStatementsModal={() => setIsStatementsModalOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'summary' && (
          <ExecutiveSummary
            company={selectedCompany}
            onNavigateTab={setActiveTab}
            onAskAiPreset={handleAskAiPreset}
          />
        )}

        {activeTab === 'health' && (
          <FinancialHealthTab company={selectedCompany} />
        )}

        {activeTab === 'valuation' && (
          <ValuationTab company={selectedCompany} />
        )}

        {activeTab === 'peers' && (
          <PeerComparisonTab company={selectedCompany} />
        )}

        {activeTab === 'ratios' && (
          <RatiosDeepDiveTab company={selectedCompany} />
        )}

        {activeTab === 'projections' && (
          <ProjectionsTab company={selectedCompany} />
        )}

        {activeTab === 'risks' && (
          <RisksTab
            company={selectedCompany}
            onAskAiPreset={handleAskAiPreset}
          />
        )}

        {activeTab === 'assistant' && (
          <AiAssistantTab
            company={selectedCompany}
            initialPreset={aiPresetTrigger}
            onClearInitialPreset={() => setAiPresetTrigger(null)}
          />
        )}
      </main>

      {/* Institutional Terminal Footer & Regulatory Disclaimers */}
      <footer className="bg-[#F5F0E6] border-t border-[#E8E2D5] mt-12 py-8 px-4 sm:px-6 lg:px-8 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#E8E2D5] pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              <span className="font-bold text-stone-900">Invest-AI Professional Research Terminal</span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-700 font-mono">v2.5 Institutional Engine</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-stone-600">
              <button
                onClick={() => setIsStatementsModalOpen(true)}
                className="hover:text-emerald-700 transition flex items-center gap-1 font-medium"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audited Statements</span>
              </button>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="hover:text-emerald-700 transition flex items-center gap-1 font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Institutional Memo</span>
              </button>
              <button
                onClick={() => handleAskAiPreset('healthy', 'Is this company financially healthy?')}
                className="hover:text-emerald-700 transition flex items-center gap-1 font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Health Diagnostic</span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/80 p-4 rounded-xl border border-[#E8E2D5] leading-relaxed text-stone-600 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-800">MANDATORY REGULATORY COMPLIANCE & RESEARCH DISCLAIMER:</span>
              <br />
              This system is an automated financial research analysis tool designed strictly for institutional education, due diligence, and quantitative equity modeling. It does not provide personalized investment advice, financial planning, legal counsel, or tax advice. No output from this software constitutes a solicitation, recommendation, or endorsement to purchase or liquidate any security or financial instrument. Past historical performance and financial ratios are not guarantees of future stock performance. Projections are mathematical scenario extrapolations based on explicit stated inputs and subject to macroeconomic volatility. Never base investment decisions solely on automated outputs.
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FinancialStatementsModal
        company={selectedCompany}
        isOpen={isStatementsModalOpen}
        onClose={() => setIsStatementsModalOpen(false)}
      />

      <CustomCompanyModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddCompany={handleAddCustomCompany}
      />

      <ExportReportModal
        company={selectedCompany}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default App;
