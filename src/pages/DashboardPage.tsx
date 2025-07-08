import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useDatabase from "../hooks/useDatabase";

const DashboardPage = () => {
  const { getAllStocks, getAllBuys, getAllSells } = useDatabase();
  const [stockCount, setStockCount] = useState(0);
  const [buyCount, setBuyCount] = useState(0);
  const [sellCount, setSellCount] = useState(0);

  useEffect(() => {
    const stocks = getAllStocks();
    const buys = getAllBuys();
    const sells = getAllSells();
    setStockCount(stocks.length);
    setBuyCount(buys.length);
    setSellCount(sells.length);
  }, [getAllStocks, getAllBuys, getAllSells]);

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-800 text-center mb-4">
        Capital Gain Calculator
      </h1>
      <div className="grid grid-cols-3 gap-4 text-center text-white font-semibold">
        <div className="bg-blue-100 text-blue-600 p-4 rounded shadow">
          <p className="text-3xl">{stockCount}</p>
          <p className="text-lg">Stock Tickers</p>
        </div>
        <div className="bg-blue-100 text-blue-600 p-4 rounded shadow">
          <p className="text-3xl">{buyCount}</p>
          <p className="text-lg">Buy Transactions</p>
        </div>
        <div className="bg-blue-100 text-blue-600 p-4 rounded shadow">
          <p className="text-3xl">{sellCount}</p>
          <p className="text-lg">Sell Transactions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        <Link
          to="/stocks"
          className="w-full px-4 py-2 rounded bg-blue-400 text-white font-semibold hover:bg-blue-500 transition"
        >
          Manage Stocks
        </Link>
        <Link
          to="/transactions"
          className="w-full px-4 py-2 rounded bg-blue-400 text-white font-semibold hover:bg-blue-500 transition"
        >
          Manage Transactions
        </Link>
        <Link
          to="/ctg-reports"
          className="w-full px-4 py-2 rounded bg-blue-400 text-white font-semibold hover:bg-blue-500 transition"
        >
          View Capital Gains Report
        </Link>
        <Link
          to="/database"
          className="w-full px-4 py-2 rounded bg-blue-400 text-white font-semibold hover:bg-blue-500 transition"
        >
          Manage Database
        </Link>
      </div>
      {/* <div className="grid md:grid-cols-1 gap-4 mt-4">
        <button
          onClick={() => {
            const storedDb = localStorage.getItem("capitalGainsSqliteDb-v2");
            if (!storedDb) return alert("No database found in localStorage.");
            const binaryArray = new Uint8Array(JSON.parse(storedDb));
            const blob = new Blob([binaryArray], {
              type: "application/octet-stream",
            });

            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "capital_gains.sqlite";
            a.click();
          }}
          className="w-full px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition mt-2"
        >
          Download Database
        </button>

        <input
          type="file"
          accept=".sqlite"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result;
              if (!result || typeof result === "string") return;

              const uint8Array = new Uint8Array(result as ArrayBuffer);
              localStorage.setItem(
                "capitalGainsSqliteDb-v2",
                JSON.stringify(Array.from(uint8Array))
              );

              alert("Database uploaded successfully!");
              window.location.reload();
            };
            reader.readAsArrayBuffer(file);
          }}
          className="w-full px-4 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition mt-2"
        />
      </div> */}
    </>
  );
};

export default DashboardPage;
