# Capital Gain Calculator

This is a simple ReactJS-based capital gain calculator that uses a local SQLite database (via SQL.js) stored in `localStorage`. It supports uploading, downloading, and resetting the database directly from the browser.

## 🚀 Features

1. 📊 **Manage Stock Tickers** – View reports of how many stocks have been bought and sold, including average prices and current holdings.
2. 💸 **Add Transactions** – Log buy and sell transactions with timestamp and price.
3. 📁 **Transaction History** – View all transactions and delete any if necessary.
4. 📈 **Capital Gain Reports** – Automatically generate capital gains per financial year, including realised gains and summaries.
5. 🔒 **Fully Client-Side** – All data is stored in your browser. No data is sent or saved online.
6. 🧷 **SQLite Database Backup & Restore** – Download your data as a `.sqlite` file and restore from backup at any time.

## 🛠 Tech Stack

- React + TypeScript
- SQL.js (SQLite in the browser)
- Tailwind CSS

## 📦 Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/asadiceiu/capital-gain-calculator.git
   cd capital-gain-calculator
   ```

## 🧭 How to Use

You can try the app directly at:  
👉 **[https://cgt.asaduzzaman.online](https://cgt.asaduzzaman.online)**

If you'd like to run it locally:

1. Make sure you have [Node.js](https://nodejs.org/) installed.
2. Clone the repository:
   ```bash
   git clone https://github.com/asadiceiu/capital-gain-calculator.git
   cd capital-gain-calculator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser.

You can now upload a `.sqlite` file, add transactions, and generate reports — all from your browser.
