import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useDatabase from "../hooks/useDatabase";

interface StockSummary {
  ticker: string;
  totalPurchased: number;
  totalSold: number;
  currentStock: number;
  totalBuyPrice: number;
  totalSellPrice: number;
}

const CurrentStocksReportPage = () => {
  const { getAllStocks, getAllBuys, getAllSells, deleteStockById } =
    useDatabase();
  const [summaries, setSummaries] = useState<StockSummary[]>([]);

  const allStocks = getAllStocks();
  const allBuys = getAllBuys();
  const allSells = getAllSells();

  const handleDelete = useCallback((ticker: string) => {
    const stock = allStocks.find((s) => s.ticker === ticker);
    if (!stock) return;
    const hasBuys = allBuys.some((b) => b.stock_id === stock.id);
    const hasSells = allSells.some((s) => s.stock_id === stock.id);
    if (!hasBuys && !hasSells) {
      deleteStockById(stock.id);
      alert(`Stock ${ticker} deleted successfully!`);
      // Trigger a refresh by incrementing the refreshCounter
    } else {
      alert("Cannot delete stock with existing transactions.");
    }
  }, []);

  useEffect(() => {
    const stocks = allStocks;
    const buys = allBuys;
    const sells = allSells;

    const summaryMap: { [ticker: string]: StockSummary } = {};

    stocks.forEach((stock) => {
      summaryMap[stock.ticker] = {
        ticker: stock.ticker,
        totalPurchased: 0,
        totalSold: 0,
        currentStock: 0,
        totalBuyPrice: 0,
        totalSellPrice: 0,
      };
    });

    buys.forEach((buy) => {
      const ticker = stocks.find((s) => s.id === buy.stock_id)?.ticker;
      if (ticker && summaryMap[ticker]) {
        summaryMap[ticker].totalPurchased += buy.count;
        summaryMap[ticker].totalBuyPrice += buy.total_price;
      }
    });

    sells.forEach((sell) => {
      const ticker = stocks.find((s) => s.id === sell.stock_id)?.ticker;
      if (ticker && summaryMap[ticker]) {
        summaryMap[ticker].totalSold += sell.count;
        summaryMap[ticker].totalSellPrice += sell.total_price;
      }
    });

    for (const ticker in summaryMap) {
      const s = summaryMap[ticker];
      s.currentStock = s.totalPurchased - s.totalSold;
    }

    setSummaries(Object.values(summaryMap));
    // We only want this to re-run when refreshCounter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getAllStocks, getAllBuys, getAllSells]);
  return (
    <>
      <h1 className="text-4xl font-bold text-blue-800 text-center mb-4">
        <Link to="/">Capital Gain Calculator</Link>
      </h1>
      <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
        Manage Stock Tickers
      </h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        <Link
          to="/add-stocks"
          className="text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Add Stocks
        </Link>
        <Link
          to="/transactions"
          className="text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Manage Transactions
        </Link>
        <Link
          to="/"
          className=" text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Back to Dashboard
        </Link>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Current Stocks</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {summaries.map((stock) => (
            <div
              key={stock.ticker}
              className="bg-white border border-gray-200 rounded shadow p-4 grid grid-cols-3 items-center hover:shadow-lg hover:bg-blue-100 transition-shadow duration-200"
            >
              <div className="text-3xl font-extrabold text-blue-900">
                {stock.ticker}
              </div>
              <div className="text-sm text-left text-gray-700 space-y-1">
                <div>
                  <span className="font-semibold">Purchased</span>:{" "}
                  {stock.totalPurchased} ($
                  {stock.totalBuyPrice.toFixed(2)})
                </div>
                <div>
                  <span className="font-semibold">Sold</span>: {stock.totalSold}{" "}
                  ($
                  {stock.totalSellPrice.toFixed(2)})
                </div>
                <div>
                  <span className="font-semibold">Current</span>:{" "}
                  {stock.currentStock}
                </div>
              </div>
              <div className="text-right font-extrabold text-blue-900">
                <button
                  onClick={() => handleDelete(stock.ticker)}
                  className="ml-auto px-2 py-1 bg-orange-400 text-white rounded hover:bg-red-500 text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default CurrentStocksReportPage;
