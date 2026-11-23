# How to Open and Run Invest-AI Pro in VS Code

Follow these simple steps:

### Method 1: Using VS Code Terminal
1. Open **Visual Studio Code**.
2. Click **File** -> **Open Folder...** (or press `Ctrl+K Ctrl+O`).
3. Select this `invest-pro-ai` folder.
4. Open the terminal in VS Code:
   - Press `Ctrl + ~` (or go to menu: `Terminal` -> `New Terminal`).
5. Run this command to install packages:
   ```bash
   npm install
   ```
6. Run this command to start the application:
   ```bash
   npm run dev
   ```
7. Open your web browser and go to:
   👉 **http://localhost:5173**

---

### Method 2: One-Click Launcher (No typing needed!)
- Simply double-click **`START-APP.bat`** in this folder!
  - It will automatically install packages (if not already installed).
  - It will automatically launch the server.
  - It will automatically open **http://localhost:5173** in your web browser.

---

### Features to Try in the App:
- **Search Bar (`Ctrl+K`)**: Search any stock (e.g. `TCS`, `RELIANCE`, `AAPL`, `NVDA`, `HDFCBANK`, `INFY`).
- **Filter by Market**: Toggle between `🇮🇳 India (NSE/BSE)` and `🇺🇸 US (NASDAQ/NYSE)`.
- **AI Research Assistant**: Click the 5 institutional research questions to get grounded analysis with SEC/BSE citations.
- **Multi-Method Valuation**: Drag DCF and Graham sliders to watch fair value update in real-time.
- **1Y/3Y/5Y Projections**: Switch between Base, Bull, and Bear scenarios.
- **Export Memo**: Click "Export Memo" to print or save a full Markdown equity research memorandum.
