import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useDatabase from "../hooks/useDatabase";

const AddTransactionsPage = () => {
  const {
    addBuyTransaction,
    addSellTransaction,
    getAllStocks,
    showAppMessage,
  } = useDatabase();
  const [form, setForm] = useState({
    date: "",
    ticker: "",
    count: "",
    totalPrice: "",
  });

  const [stockOptions, setStockOptions] = useState<
    { id: number; ticker: string }[]
  >([]);

  const [isBuy, setIsBuy] = useState(true);

  useEffect(() => {
    const stocks = getAllStocks();
    setStockOptions(stocks.map((s: any) => ({ id: s.id, ticker: s.ticker })));
  }, [getAllStocks]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { date, ticker, count, totalPrice } = form;

    if (date && ticker && count && totalPrice) {
      const payload = {
        date,
        stock_ticker: ticker,
        stock_count: parseInt(count),
        total_price: parseFloat(totalPrice),
      };

      if (isBuy) {
        addBuyTransaction(payload);
        showAppMessage("Buy transaction added!", "success");
      } else {
        addSellTransaction(payload);
        showAppMessage("Sell transaction added!", "success");
      }

      setForm({ date: "", ticker: "", count: "", totalPrice: "" });
    } else {
      showAppMessage("Please fill in all fields", "error");
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-800 text-center mb-4">
        <Link to="/">Capital Gain Calculator</Link>
      </h1>
      <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
        Manage Transactions
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4 mt-4">
        <Link
          to="/transactions"
          className=" text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Back to Transactions List
        </Link>
      </div>

      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-bold text-blue-800">
            {isBuy ? "Buy" : "Sell"} Transaction
          </h2>

          <div className="flex items-center gap-4">
            <span>Type:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="transactionType"
                checked={isBuy}
                onChange={() => setIsBuy(true)}
              />
              Buy
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="transactionType"
                checked={!isBuy}
                onChange={() => setIsBuy(false)}
              />
              Sell
            </label>
          </div>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <select
            name="ticker"
            value={form.ticker}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Stock Ticker</option>
            {stockOptions.map((stock) => (
              <option key={stock.id} value={stock.ticker}>
                {stock.ticker}
              </option>
            ))}
          </select>
          <input
            type="number"
            name="count"
            placeholder="Stock Count"
            value={form.count}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <input
            type="number"
            step="0.01"
            name="totalPrice"
            placeholder="Total Price"
            value={form.totalPrice}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add {isBuy ? "Buy" : "Sell"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddTransactionsPage;
