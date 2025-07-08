import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useDatabase from "../hooks/useDatabase";

const AddStocksPage = () => {
  const { addStockTicker } = useDatabase();
  const [ticker, setTicker] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      addStockTicker(ticker.trim(), name.trim());
      setTicker("");
      setName("");
      setMessage(`Stock ${ticker} added successfully!`);
    }
  };
  return (
    <>
      <h1 className="text-4xl font-bold text-blue-800 text-center mb-4">
        <Link to="/">Capital Gain Calculator</Link>
      </h1>
      <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
        Add Stock Ticker
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4 mt-4">
        <Link
          to="/stocks"
          className=" text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Back to Stock List
        </Link>
      </div>
      <div className="max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Stock Ticker"
            className="w-full border px-4 py-2 rounded shadow"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Stock Name (optional)"
            className="w-full border px-4 py-2 rounded shadow"
          />

          <p className="text-sm text-gray-600">
            Add a stock ticker to track its transactions.
          </p>
          <button
            type="submit"
            className="w-full bg-blue-400 text-white px-4 py-2 rounded hover:bg-blue-500"
          >
            Add Stock
          </button>
          {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        </form>
      </div>
    </>
  );
};

export default AddStocksPage;
