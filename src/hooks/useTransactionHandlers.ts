import type { Buy, Stock } from "./types";

interface UseTransactionHandlersProps {
  db: any;
  stocks: Stock[];
  buys: Buy[];
  showAppMessage: (msg: string, type?: "success" | "error") => void;
  setStockTicker: (val: string) => void;
  setStockName: (val: string) => void;
  setBuyTicker: (val: string) => void;
  setBuyDate: (val: string) => void;
  setBuyCount: (val: string) => void;
  setBuyTotalPrice: (val: string) => void;
  setSellTicker: (val: string) => void;
  setSellDate: (val: string) => void;
  setSellCount: (val: string) => void;
  setSellTotalPrice: (val: string) => void;
  fetchData: () => void;
}

export default function useTransactionHandlers({
  db,
  stocks,
  buys,
  showAppMessage,
  setStockTicker,
  setStockName,
  setBuyTicker,
  setBuyDate,
  setBuyCount,
  setBuyTotalPrice,
  setSellTicker,
  setSellDate,
  setSellCount,
  setSellTotalPrice,
  fetchData,
}: UseTransactionHandlersProps) {
  const handleAddUpdateStock = () => {
    if (!db) {
      showAppMessage("Database not ready", "error");
      return;
    }

    const ticker = (document.querySelector<HTMLInputElement>('input[placeholder="Stock Ticker"]')?.value || "").toUpperCase();
    const name = document.querySelector<HTMLInputElement>('input[placeholder="Company Name"]')?.value || "";

    if (!ticker || !name) {
      showAppMessage("Please enter both stock ticker and company name.", "error");
      return;
    }

    try {
      const existing = stocks.find(s => s.ticker === ticker);
      if (existing) {
        db.run("UPDATE stocks SET name = ? WHERE ticker = ?", [name, ticker]);
        showAppMessage(`Updated ${ticker}`);
      } else {
        db.run("INSERT INTO stocks (ticker, name) VALUES (?, ?)", [ticker, name]);
        showAppMessage(`Added ${ticker}`);
      }
      setStockTicker("");
      setStockName("");
      fetchData();
    } catch (err: any) {
      showAppMessage(`DB error: ${err.message}`, "error");
    }
  };

  const handleAddBuy = () => {
    if (!db) {
      showAppMessage("Database not ready", "error");
      return;
    }

    const ticker = (document.querySelector<HTMLInputElement>('input[placeholder="Stock Ticker"]')?.value || "").toUpperCase();
    const date = document.querySelector<HTMLInputElement>('input[type="date"]')?.value || "";
    const count = Number(document.querySelector<HTMLInputElement>('input[placeholder="Count"]')?.value || 0);
    const price = Number(document.querySelector<HTMLInputElement>('input[placeholder="Total Price"]')?.value || 0);

    if (!ticker || !date || count <= 0 || price <= 0) {
      showAppMessage("Invalid buy input", "error");
      return;
    }

    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) {
      showAppMessage("Stock not found", "error");
      return;
    }

    try {
      db.run(
        "INSERT INTO buys (stock_id, date, count, total_price, remaining_count, realized_gain) VALUES (?, ?, ?, ?, ?, ?)",
        [stock.id, date, count, price, count, 0]
      );
      setBuyTicker("");
      setBuyDate("");
      setBuyCount("");
      setBuyTotalPrice("");
      showAppMessage(`Buy recorded for ${ticker}`);
      fetchData();
    } catch (err: any) {
      showAppMessage(`Buy error: ${err.message}`, "error");
    }
  };

  const handleAddSell = () => {
    if (!db) {
      showAppMessage("Database not ready", "error");
      return;
    }

    const ticker = (document.querySelector<HTMLInputElement>('input[placeholder="Stock Ticker"]')?.value || "").toUpperCase();
    const date = document.querySelector<HTMLInputElement>('input[type="date"]')?.value || "";
    const count = Number(document.querySelector<HTMLInputElement>('input[placeholder="Count"]')?.value || 0);
    const price = Number(document.querySelector<HTMLInputElement>('input[placeholder="Total Price"]')?.value || 0);

    if (!ticker || !date || count <= 0 || price <= 0) {
      showAppMessage("Invalid sell input", "error");
      return;
    }

    const stock = stocks.find(s => s.ticker === ticker);
    if (!stock) {
      showAppMessage("Stock not found", "error");
      return;
    }

    const fifoBuys = buys
      .filter(b => b.stock_id === stock.id && b.remaining_count > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const available = fifoBuys.reduce((sum, b) => sum + b.remaining_count, 0);
    if (available < count) {
      showAppMessage(`Not enough shares. You have ${available}`, "error");
      return;
    }

    try {
      db.exec("BEGIN TRANSACTION");

      let toSell = count;
      const pricePerShare = price / count;

      for (const buy of fifoBuys) {
        if (toSell <= 0) break;

        const fromBuy = Math.min(buy.remaining_count, toSell);
        const buyPricePerShare = buy.total_price / buy.count;
        const gain = fromBuy * (pricePerShare - buyPricePerShare);

        db.run(
          "UPDATE buys SET remaining_count = remaining_count - ?, realized_gain = realized_gain + ? WHERE id = ?",
          [fromBuy, gain, buy.id]
        );

        toSell -= fromBuy;
      }

      db.run("INSERT INTO sells (stock_id, date, count, total_price) VALUES (?, ?, ?, ?)", [
        stock.id,
        date,
        count,
        price,
      ]);

      db.exec("COMMIT");
      setSellTicker("");
      setSellDate("");
      setSellCount("");
      setSellTotalPrice("");
      showAppMessage(`Sell recorded for ${ticker}`);
      fetchData();
    } catch (err: any) {
      db.exec("ROLLBACK");
      showAppMessage(`Sell error: ${err.message}`, "error");
    }
  };

  return {
    handleAddUpdateStock,
    handleAddBuy,
    handleAddSell,
  };
}