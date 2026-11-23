import React, { useState, useRef, useEffect } from 'react';
import type { CompanyProfile } from '../types/financials';
import { getCurrencySymbol } from '../types/financials';
import type { UserProfile } from './AuthModal';
import { 
  Building2, 
  Search, 
  Download, 
  PlusCircle, 
  Database,
  Globe2,
  X,
  ChevronDown,
  TrendingUp,
  SlidersHorizontal,
  Command,
  Sparkles,
  Palette,
  Check,
  UserCheck,
  CheckCircle2,
  LogOut,
  Smartphone,
  Mail
} from 'lucide-react';

interface HeaderProps {
  companies: CompanyProfile[];
  selectedCompany: CompanyProfile;
  onSelectCompany: (company: CompanyProfile) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenStatementsModal: () => void;
  onOpenCustomModal: () => void;
  onOpenExportModal: () => void;
  currentTheme?: string;
  onSelectTheme?: (theme: string) => void;
  user?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

const THEMES = [
  { id: 'obsidian', name: 'Midnight Obsidian', icon: '🌙', colorDot: 'bg-cyan-400' },
  { id: 'goldman', name: 'Goldman Sapphire', icon: '🏛️', colorDot: 'bg-amber-400' },
  { id: 'emerald', name: 'Emerald Wealth', icon: '🌿', colorDot: 'bg-emerald-400' },
  { id: 'bloomberg', name: 'Bloomberg Carbon', icon: '📊', colorDot: 'bg-orange-400' },
  { id: 'light', name: 'Executive Light', icon: '☀️', colorDot: 'bg-blue-600' }
];

export const Header: React.FC<HeaderProps> = ({
  companies,
  selectedCompany,
  onSelectCompany,
  activeTab,
  onSelectTab,
  onOpenStatementsModal,
  onOpenCustomModal,
  onOpenExportModal,
  currentTheme = 'obsidian',
  onSelectTheme,
  user,
  onOpenAuthModal,
  onLogout
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [marketFilter, setMarketFilter] = useState<'all' | 'India' | 'US'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const themeContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const latest = selectedCompany.historical[selectedCompany.historical.length - 1];
  const curSymbol = getCurrencySymbol(selectedCompany);

  // Close search dropdown and user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K or /) to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs = [
    { id: 'summary', label: 'Executive Summary' },
    { id: 'health', label: 'Financial Health & DuPont' },
    { id: 'valuation', label: 'Multi-Method Valuation' },
    { id: 'peers', label: 'Peer Benchmarking' },
    { id: 'ratios', label: 'Ratios & 5Y Trends' },
    { id: 'projections', label: '1Y/3Y/5Y Projections' },
    { id: 'risks', label: '4-Pillar Risk Engine' },
    { id: 'assistant', label: 'AI Research Assistant (Q&A)' },
  ];

  // Filter companies by search query and market filter
  const filteredCompanies = companies.filter(c => {
    const isIndia = c.country === 'India' || c.currency === 'INR' || c.exchange.includes('BSE') || c.exchange.includes('NSE');
    const matchesMarket = 
      marketFilter === 'all' || 
      (marketFilter === 'India' && isIndia) || 
      (marketFilter === 'US' && !isIndia);

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesMarket;

    const matchesQuery = 
      c.ticker.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q);

    return matchesMarket && matchesQuery;
  });

  const getCountryFlag = (c: CompanyProfile) => {
    if (c.country === 'India' || c.currency === 'INR' || c.exchange.includes('BSE')) return '🇮🇳';
    return '🇺🇸';
  };

  const formatMarketCap = (c: CompanyProfile) => {
    const sym = getCurrencySymbol(c);
    if (c.currency === 'INR') {
      const crore = c.marketCap / 10; // Millions to Crores approx
      if (crore >= 100000) {
        return `${sym}${(crore / 100000).toFixed(2)}L Cr`;
      }
      return `${sym}${(c.marketCap / 1000).toFixed(1)}B`;
    }
    return `${sym}${(c.marketCap / 1000).toFixed(1)}B`;
  };

  return (
    <header className="bg-[#FAF7F2]/95 border-b border-[#E8E2D5] sticky top-0 z-40 shadow-sm backdrop-blur-md">
      {/* Top Compliance & Quick Tools Bar */}
      <div className="bg-[#F4EFE6] px-4 sm:px-6 py-2 border-b border-[#E8E2D5] flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
          <span className="font-extrabold tracking-wider text-stone-900 text-[11px] uppercase">
            INVEST-AI PRO
          </span>
          <span className="text-stone-400">|</span>
          <span className="text-stone-700 text-[11px] font-medium hidden sm:inline">
            Global Equity Research Terminal
          </span>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-200">
              🇮🇳 NSE/BSE & 🇺🇸 SEC Grounded
            </span>
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-200 hidden md:inline-block">
              Zero Hallucination
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-amber-800 text-[11px] font-medium hidden lg:inline">
            Audited Disclosures • No Investment Return Guarantees
          </span>
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs transition border border-emerald-200 font-medium"
            title="Export Institutional Research Memo"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Memo</span>
          </button>
          <button
            onClick={onOpenCustomModal}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-800 rounded text-xs transition border border-[#DCD5C6] shadow-2xs font-medium"
            title="Analyze Any Custom Company or Live Ticker"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">+ Custom Company</span>
          </button>

          {/* User Sign In / Profile Pill */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs text-stone-900 transition shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1 font-semibold text-stone-800">
                  <span className="max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <span className="text-[9px] bg-emerald-200/60 text-emerald-900 px-1 py-0.2 rounded font-mono font-bold border border-emerald-300 hidden md:inline">
                  PRO
                </span>
                <ChevronDown className="w-3 h-3 text-stone-500" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#DDD6C7] rounded-xl shadow-xl z-50 p-3 space-y-3">
                  <div className="border-b border-stone-200 pb-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-xs">{user.name}</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono border border-emerald-200">
                        Verified ✓
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 font-mono mt-1 flex items-center gap-1.5">
                      {user.authMethod === 'mobile' ? (
                        <>
                          <Smartphone className="w-3 h-3 text-emerald-600" />
                          <span>{user.phone}</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 text-emerald-600" />
                          <span className="truncate">{user.email}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-[10px] text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{user.tier}</span>
                      </span>
                      <span className="text-stone-500 font-mono">{user.joinedAt}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Verification Mode:</span>
                      <span className="text-emerald-700 font-medium capitalize">{user.authMethod} OTP Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Research Reports:</span>
                      <span className="text-stone-900 font-mono">Unlimited Pro Access</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 transition flex items-center justify-between border border-rose-200"
                  >
                    <span className="flex items-center gap-1.5">
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </span>
                    <span className="text-[10px] text-rose-500">End Session</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-sm border border-emerald-700"
              title="Sign In or Register with Mobile / Email OTP"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Bar: Search Bar, Company Chips & Key Metrics Capsule */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Section: Search Bar & Market Filter */}
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-2xl relative" ref={searchContainerRef}>
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by Ticker, Company, Sector (e.g. TCS, RELIANCE, AAPL, Banking)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-white border border-[#DDD5C7] hover:border-emerald-500 focus:border-emerald-600 rounded-xl pl-9 pr-16 py-2 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition shadow-2xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-stone-600 bg-[#EFE9DD] px-1.5 py-0.5 rounded border border-[#DFD8CB]">
                  Ctrl+K
                </span>
              )}
            </div>
          </div>

          {/* Quick Market Filter Tabs */}
          <div className="hidden sm:flex items-center bg-[#EAE4D7] p-1 rounded-xl border border-[#DCD5C7] text-[11px]">
            <button
              onClick={() => setMarketFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                marketFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              All ({companies.length})
            </button>
            <button
              onClick={() => setMarketFilter('India')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                marketFilter === 'India'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>🇮🇳 India</span>
            </button>
            <button
              onClick={() => setMarketFilter('US')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition flex items-center gap-1 ${
                marketFilter === 'US'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>🇺🇸 US</span>
            </button>
          </div>

          {/* Interactive Search Dropdown Results */}
          {isSearchOpen && (
            <div className="absolute left-0 top-full mt-2 w-full bg-white border border-[#DDD5C7] rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto p-2 space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] uppercase font-mono text-stone-500 border-b border-stone-200">
                <span>Matching Companies ({filteredCompanies.length})</span>
                <span className="text-emerald-700 font-semibold">Click to Select Target</span>
              </div>

              {filteredCompanies.map(c => {
                const isSelected = c.ticker === selectedCompany.ticker;
                const sym = getCurrencySymbol(c);
                return (
                  <button
                    key={c.ticker}
                    onClick={() => {
                      onSelectCompany(c);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition border ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-stone-900'
                        : 'bg-[#FAF7F2] hover:bg-[#F2ECE1] border-transparent hover:border-[#DFD8CB] text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{getCountryFlag(c)}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs font-mono text-emerald-700">
                            {c.ticker}
                          </span>
                          <span className="text-xs font-semibold text-stone-900 truncate max-w-[200px]">
                            {c.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>{c.exchange}</span>
                          <span>•</span>
                          <span className="text-stone-600">{c.industry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-stone-900">
                        {sym}{c.currentPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-stone-500">
                        Cap: {formatMarketCap(c)}
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredCompanies.length === 0 && (
                <div className="p-4 text-center text-xs text-stone-500">
                  No companies found matching "{searchQuery}". You can add it using the <strong className="text-emerald-700">+ Custom Company</strong> button.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Company Quick Metrics Capsule */}
        <div className="flex items-center gap-3 sm:gap-4 bg-white px-4 py-2 rounded-xl border border-[#E2DBD0] text-xs shrink-0 shadow-2xs">
          <div className="flex items-center gap-2 mr-1">
            <span className="text-lg">{getCountryFlag(selectedCompany)}</span>
            <div>
              <div className="text-[10px] font-mono text-emerald-700 font-bold uppercase">
                {selectedCompany.ticker}
              </div>
              <div className="text-xs font-semibold text-stone-900 truncate max-w-[120px]">
                {selectedCompany.name.split(' ')[0]}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div>
            <div className="text-[10px] text-stone-500 font-medium">PRICE</div>
            <div className="font-bold text-stone-900 text-xs sm:text-sm font-mono">
              {curSymbol}{selectedCompany.currentPrice.toLocaleString()}
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <div>
            <div className="text-[10px] text-stone-500 font-medium">MARKET CAP</div>
            <div className="font-semibold text-stone-800 text-xs font-mono">
              {formatMarketCap(selectedCompany)}
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200 hidden md:block" />

          <div className="hidden md:block">
            <div className="text-[10px] text-stone-500 font-medium">TRAILING P/E</div>
            <div className="font-semibold text-stone-800 text-xs font-mono">
              {latest.peRatio.toFixed(1)}x
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200 hidden lg:block" />

          <div className="hidden lg:block">
            <div className="text-[10px] text-stone-500 font-medium">OPERATING MARGIN</div>
            <div className="font-semibold text-emerald-700 text-xs font-mono">
              {latest.operatingMargin.toFixed(1)}%
            </div>
          </div>

          <div className="h-6 w-px bg-stone-200" />

          <button
            onClick={onOpenStatementsModal}
            className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium transition"
            title="Inspect Audited Financial Statements"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Statements</span>
          </button>
        </div>
      </div>

      {/* Quick Ticker Chips Bar */}
      <div className="px-4 sm:px-6 py-1.5 bg-[#F6F1E7] border-t border-[#EAE4D8] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 mr-1 shrink-0 font-medium">
          Quick Tickers:
        </span>
        {companies.map(c => {
          const isSelected = c.ticker === selectedCompany.ticker;
          return (
            <button
              key={c.ticker}
              onClick={() => onSelectCompany(c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 border shrink-0 ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 border-[#DDD7CB] hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <span className="text-[11px]">{getCountryFlag(c)}</span>
              <span className="font-mono text-xs">{c.ticker}</span>
            </button>
          );
        })}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 sm:px-6 flex overflow-x-auto border-t border-[#E8E2D5] no-scrollbar gap-1 bg-[#FAF7F2]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`py-2.5 px-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                isActive
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50/70'
                  : 'border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-400'
              }`}
            >
              {tab.label}
              {tab.id === 'assistant' && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-mono border border-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> AI
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
