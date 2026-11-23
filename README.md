# Invest-AI Pro • Advanced AI Investment Research Assistant

An institutional-grade, quantitative AI investment research terminal grounded in audited SEC Form 10-K filings. Built to eliminate AI hallucinations, provide mathematical valuation modeling, cross-industry peer benchmarking, forward projection scenarios, and rigorous 4-pillar risk assessment.

---

## 🌟 Core Capabilities Overview

### 1. Financial Statement Analysis & Strengths/Weaknesses Identification
- **Piotroski 9-Point F-Score**: Evaluates profitability, operating efficiency, and balance sheet leverage to assess fundamental financial trajectory.
- **Altman Z-Score**: Quantitative discriminant analysis assessing bankruptcy probability across Safe (> 2.99), Grey (1.81 - 2.99), and Distress (< 1.81) zones.
- **Beneish M-Score**: 8-variable forensic accounting algorithm to screen for earnings manipulation and accrual anomalies.
- **DuPont Decomposition (3-Stage & 5-Stage)**: Deconstructs Return on Equity (ROE) into Net Profit Margin, Asset Turnover, Financial Leverage, Tax Burden, and Interest Burden.
- **Evidence-Based Strengths & Weaknesses**: Identified automatically and benchmarked against 5-year historical averages and industry medians.

### 2. Multi-Method Valuation & Fair Value Explanation
Explains whether a stock appears **Undervalued**, **Fairly Valued**, or **Overvalued** with interactive sliders for assumption sensitivity:
- **Discounted Cash Flow (DCF) - Perpetual Growth**: WACC calculation (CAPM cost of equity + after-tax debt) with Gordon Growth Model.
- **DCF - Exit Multiple**: EV/EBITDA terminal multiple discounting.
- **Benjamin Graham Intrinsic Value**: Formula incorporating normalized EPS, expected growth rate, and AAA corporate bond yields.
- **Relative Comparable Multiples**: Trailing P/E, Forward P/E, EV/EBITDA, Price/FCF, Price/Book, and PEG ratio relative to peer medians.
- **Composite Fair Value Synthesis**: Weighted intrinsic fair value with quantified Margin of Safety (%) and football-field valuation spread.

### 3. Industry Peer Comparison & Benchmarking
- Cross-company side-by-side benchmarking against direct industry rivals.
- Percentile rankings across 8 critical operational and valuation metrics.
- **Economic Moat Assessment**: Evaluates cost advantage, switching costs, intangible brand assets, and network effects.

### 4. Ratios & 5-Year Historical Trends
- Interactive visual trend charts and audited data tables across 5 fiscal years:
  - **Revenue & YoY Growth Rates**
  - **Profit Margins** (Gross Margin, Operating Margin, EBITDA Margin, Net Margin)
  - **Debt & Solvency** (Total Debt, Cash & Short-Term Investments, Net Debt, Interest Coverage)
  - **Cash Flow Quality** (Operating Cash Flow, Free Cash Flow, FCF Conversion %)
  - **Capital Efficiency** (ROE, ROCE, ROIC)
  - **Market Ratios** (EPS, Trailing P/E, EV/EBITDA)

### 5. 1-Year, 3-Year & 5-Year Financial Projections
- Three distinct forward-looking scenarios: **Base Case**, **Bull Case**, and **Bear Case**.
- Transparent, clearly stated mathematical assumptions:
  - Top-line revenue growth progression
  - Operating margin expansion/compression
  - Capital expenditures as a % of sales
  - Annual share buyback/dilution rates
  - Effective tax rate
- Real-time assumption sliders for custom financial modeling.

### 6. 4-Pillar Qualitative & Quantitative Risk Engine
Comprehensive risk mapping grounded in SEC 10-K Item 1A:
1. **Business & Operational Risks**: Product concentration, technological disruption, demand cyclicality.
2. **Financial & Solvency Risks**: Debt maturity schedules, CapEx return drag, currency/FX exposure.
3. **Governance & Accounting Risks**: Accrual quality (Beneish M-Score), executive alignment, dual-class share voting structures.
4. **Market & Macro Risks**: Antitrust investigations (DOJ/FTC/DMA), geopolitical supply chain concentration, benchmark interest rates.
- Includes a **3x3 Probability × Impact Heat Matrix** with audited filing citations and mitigating buffers.

### 7. Grounded AI Research Assistant (Q&A Interface)
Interactive conversational research engine answering questions such as:
- *"Is this company financially healthy?"*
- *"Is this stock overvalued?"*
- *"What are the major risks?"*
- *"How does this company compare with its competitors?"*
- *"What could affect its future growth?"*

#### Strict Information Integrity Safeguards:
- **Audited Supporting Evidence**: Every numerical claim links to the exact SEC filing source, metric, and fiscal period.
- **Identified Missing Information**: Highlights unquantifiable items, undisclosed off-balance-sheet commitments, or confidential proceedings.
- **Historical Facts vs Forecasts**: Strict side-by-side segregation between audited historical facts and model projection assumptions.
- **Zero Fabrication Policy**: Never fabricates financial metrics or guarantees investment returns.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v24+)
- npm

### Installation & Execution
```bash
# Navigate to project directory
cd C:\Users\ashis\.gemini\antigravity\scratch\ai-investment-assistant

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Open `http://localhost:5173/` in your web browser.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts 3
- **Build System**: Vite 8
- **Data Engine**: Audited SEC Form 10-K dataset with live market quote fallback
- **Analysis Engine**: Proprietary quantitative DCF, DuPont, Graham, and Altman models in TypeScript

---

## ⚖️ Regulatory Compliance Disclaimer
*This tool is designed strictly for quantitative equity research, educational analysis, and due diligence purposes. It does not provide personalized investment advice, financial planning, legal counsel, or tax advice. No output from this software constitutes a solicitation, recommendation, or endorsement to purchase or sell any security. Past performance and historical financial ratios are not guarantees of future returns.*
