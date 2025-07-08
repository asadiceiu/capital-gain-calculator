import React, { useEffect, useState } from "react";
import useDatabase from "../hooks/useDatabase";
import { Transaction } from "../hooks/types";
import { Link } from "react-router-dom";

const TransactionReportPage = () => {
  const { getAllTransactions, getTickerList, deleteTransaction } =
    useDatabase();
  const [tickerFilter, setTickerFilter] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickers, setTickers] = useState<string[]>([]);

  useEffect(() => {
    const fetchTickers = async () => {
      const tickerList = await getTickerList();
      setTickers(tickerList);
    };
    fetchTickers();
  }, [getTickerList]);

  useEffect(() => {
    const txs = getAllTransactions(tickerFilter);
    const sorted = txs.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setTransactions(sorted);
  }, [tickerFilter]);

  const handleDelete = (id: number, type: "buy" | "sell") => {
    deleteTransaction(id, type);
    const updated = transactions.filter(
      (tx) => tx.id !== id || tx.type !== type
    );
    setTransactions(updated);
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-900 text-center mb-4">
        <Link to="/">Capital Gain Calculator</Link>
      </h1>
      <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
        Transaction Report
      </h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        <Link
          to="/add-transactions"
          className="text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Add a Transaction
        </Link>
        <Link
          to="/"
          className=" text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Back to Dashboard
        </Link>
      </div>
      <div className="p-4 max-w-xl mx-auto">
        <select
          value={tickerFilter}
          onChange={(e) => setTickerFilter(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        >
          <option value="">All Stocks</option>
          {tickers.map((ticker) => (
            <option key={ticker} value={ticker}>
              {ticker}
            </option>
          ))}
        </select>

        {transactions.length === 0 ? (
          <p className="text-gray-600 text-center">
            No transactions found for {tickerFilter}.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left px-3 py-2 border-b border-gray-300">
                    Date
                  </th>
                  <th className="text-left px-3 py-2 border-b border-gray-300">
                    Ticker
                  </th>
                  <th className="text-left px-3 py-2 border-b border-gray-300">
                    Type
                  </th>
                  <th className="text-right px-3 py-2 border-b border-gray-300">
                    Count
                  </th>
                  <th className="text-right px-3 py-2 border-b border-gray-300">
                    Price
                  </th>
                  <th className="text-center px-3 py-2 border-b border-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={`${tx.type}-${tx.id}`}
                    className={`border-b border-gray-200 ${
                      tx.type === "sell" ? "bg-orange-100" : "bg-blue-100"
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">{tx.date}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{tx.ticker}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {tx.type.toUpperCase()}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      {tx.count.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      ${tx.total_price.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(tx.id, tx.type)}
                        className="text-xs px-2 py-1 bg-orange-500 text-white rounded hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default TransactionReportPage;
