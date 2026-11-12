# OpenHisaab 🪙

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Status: Active](https://img.shields.io/badge/Status-Active-blue.svg)](#)

> **OpenHisaab** is a free, modern, and 100% private open-source expense tracker and cashflow manager. It requires **zero backend servers**, runs directly in any modern web browser, and safely stores your transactions locally on your device.

---

## ✨ Features

- 💸 **Cashflow & Ledger Tracking**: Track both **Cash In (Income/Inflow)** and **Cash Out (Expenses)** with exact timestamps.
- 🕒 **Comprehensive Date & Time Tools**:
  - Filter by month, last 7 days, or custom date ranges.
  - **Group by Date** view with daily subtotals.
  - Accurate time recording down to the minute.
- 📊 **Visual Analytics**:
  - **Donut Chart**: Real-time spending distribution by category.
  - **Velocity Bar Chart**: Daily spending cadence and trend lines.
  - Quick summary cards for major commitments (Housing/Rent, Credit Cards/Loans, Cash Withdrawals, Committees/Savings).
- 💱 **Multi-Currency Support**: Switch between PKR (₨), USD ($), EUR (€), GBP (£), INR (₹), AED, SAR with a single click.
- 🔒 **100% Client-Side & Private**: Your financial data never leaves your computer; all data is stored locally in your browser's `localStorage`.
- 📁 **Data Portability**: One-click **Export to CSV** for spreadsheets (Excel, Google Sheets).
- 🏷️ **Smart Categorization**: Flexible categories with color-coded badges and auto-suggest datalists.

---

## 🚀 Quick Start

### Option 1: Direct in Browser (No Installation)
Simply double-click `index.html` (or `start.bat` on Windows) to launch the app immediately in your default browser.

```bash
# Clone the repository
git clone https://github.com/asgharahmed78692/openhisaab.git

# Open the project folder
cd openhisaab

# Open index.html in your browser
start index.html       # Windows
open index.html        # macOS
xdg-open index.html    # Linux
```

### Option 2: Run with Local HTTP Server
If you prefer running via a local server:
```bash
# Using Python 3
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

---

## 📂 Project Structure

```
openhisaab/
├── index.html                  # Single-page web application (Tailwind + Chart.js + Lucide)
├── start.bat                   # 1-click Windows launcher
├── data/
│   └── sample-statement.json   # Generic demo dataset
├── README.md                   # Documentation & guide
├── LICENSE                     # MIT Open Source License
└── .gitignore                  # Git ignore rules
```

---

## 🛠️ Tech Stack

- **HTML5 & Vanilla JavaScript**: Ultra-fast, zero build step, no npm/node dependencies required.
- **Tailwind CSS**: Modern, responsive utility styling.
- **Chart.js**: Smooth and interactive SVG/Canvas charts.
- **Lucide Icons**: Clean, consistent UI iconography.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/asgharahmed78692/openhisaab/issues).

1. Fork the Project (`gh repo fork` or via GitHub UI)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
