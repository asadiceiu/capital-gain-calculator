import { useState, useEffect, useCallback } from "react";
import initSqlJs from "sql.js";
import type { Stock, Buy, Sell } from "./types";


const DB_STORAGE_KEY = "capitalGainsSqliteDb-v2";

export default function useDatabase() {
  const [db, setDb] = useState<any>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [buys, setBuys] = useState<Buy[]>([]);
  const [sells, setSells] = useState<Sell[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  const showAppMessage = useCallback((msg: string, type: "success" | "error" = "success") => {
    setMessage(msg);
    setMessageType(type);
    setIsMessageVisible(true);
    setTimeout(() => setIsMessageVisible(false), 4000);
  }, []);

  const createTables = (dbInstance: any) => {
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticker TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS buys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        count INTEGER NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      );
      CREATE TABLE IF NOT EXISTS sells (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        count INTEGER NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
      );
    `);
  };

  const emptyTables = (dbInstance: any) => {
    dbInstance.exec(`
      DELETE FROM stocks;
      DELETE FROM buys;
      DELETE FROM sells;
    `);
    setStocks([]);
    setBuys([]);
    setSells([]);
    showAppMessage("All tables emptied.", "success");
  };

  const resetDatabase = (dbInstance: any) => {
    dbInstance.exec(`
      DROP TABLE IF EXISTS stocks;
      DROP TABLE IF EXISTS buys;
      DROP TABLE IF EXISTS sells;
    `);
    createTables(dbInstance);
    emptyTables(dbInstance);
    showAppMessage("Database reset successfully.", "success");
  };

  const emptySells = (dbInstance: any) => {
    dbInstance.exec("DELETE FROM sells;");
    setSells([]);
    showAppMessage("All sell transactions emptied.", "success");
  };
  const emptyBuys = (dbInstance: any) => {
    dbInstance.exec("DELETE FROM buys;");
    setBuys([]);
    showAppMessage("All buy transactions emptied.", "success");
  };
  const emptyStocks = (dbInstance: any) => {
    dbInstance.exec("DELETE FROM stocks;");
    setStocks([]);
    showAppMessage("All stocks emptied.", "success");
  };

  const dropSellsTable = (dbInstance: any) => {
    dbInstance.exec("DROP TABLE IF EXISTS sells;");
    setSells([]);
    showAppMessage("Sells table dropped successfully.", "success");
  };
  const dropBuysTable = (dbInstance: any) => {
    dbInstance.exec("DROP TABLE IF EXISTS buys;");
    setBuys([]);
    showAppMessage("Buys table dropped successfully.", "success");
  };
  const dropStocksTable = (dbInstance: any) => {
    dbInstance.exec("DROP TABLE IF EXISTS stocks;");
    setStocks([]);
    showAppMessage("Stocks table dropped successfully.", "success");
  };

  const loadDataFromLocalStorage = (SQL: any) => {
    const storedDb = localStorage.getItem(DB_STORAGE_KEY);
    if (storedDb) {
      const uint8Array = new Uint8Array(JSON.parse(storedDb));
      return new SQL.Database(uint8Array);
    } else {
      return new SQL.Database();
    }
  };

  useEffect(() => {
    const initDB = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
        });

        const newDb = loadDataFromLocalStorage(SQL);
        createTables(newDb);
        setDb(newDb);
        setIsLoading(false);
        showAppMessage("Database initialised.", "success");
      } catch (err: any) {
        console.error("DB init error", err);
        setIsLoading(false);
        showAppMessage(`Error initialising DB: ${err.message}`, "error");
      }
    };

    initDB();
  }, [showAppMessage]);

  useEffect(() => {
    if (db && !isLoading) {
      try {
        const data = db.export();
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(Array.from(data)));
      } catch (e) {
        console.error("Failed to save database to localStorage:", e);
      }
    }
  }, [db, stocks, buys, sells, isLoading]);

  const addStockTicker = (ticker: string, name: string = "") => {
  if (!db) return;

  try {
    const stmt = db.prepare("INSERT INTO stocks (ticker, name) VALUES (?, ?)");
    stmt.run([ticker, name || ticker]);
    stmt.free();

    // Refresh the local list of stocks
    const result: Stock[] = [];
    const query = db.prepare("SELECT * FROM stocks ORDER BY ticker");
    while (query.step()) {
      const row = query.getAsObject() as Stock;
      result.push(row);
    }
    query.free();

    setStocks(result);
    console.log("Stocks after insert:", result);
    showAppMessage(`Stock "${ticker}" added successfully.`, "success");
  } catch (err: any) {
    showAppMessage(`Failed to add stock: ${err.message}`, "error");
  }
};

  const getAllStocks = useCallback((): Stock[] => {
    if (!db) return [];
    const result: Stock[] = [];
    const stmt = db.prepare("SELECT * FROM stocks ORDER BY ticker");
    while (stmt.step()) {
      const row = stmt.getAsObject() as Stock;
      result.push(row);
    }
    stmt.free();
    return result;
  }, [db]);

  const getStockByTicker = useCallback((ticker: string): Stock | null => {
    if (!db) return null;
    const stmt = db.prepare("SELECT * FROM stocks WHERE ticker = ?");
    stmt.bind([ticker]);
    let stock: Stock | null = null;
    if (stmt.step()) {
      stock = stmt.getAsObject() as Stock;
    }
    stmt.free();
    return stock;
  }, [db]);

  const getStockByStockId = useCallback((stockId: number): Stock | null => {
    if (!db) return null;
    const stmt = db.prepare("SELECT * FROM stocks WHERE id = ?");
    stmt.bind([stockId]);
    let stock: Stock | null = null;
    if (stmt.step()) {
      stock = stmt.getAsObject() as Stock;
    }
    stmt.free();
    return stock;
  }, [db]);

  const deleteStockByTicker = useCallback((ticker: string): void => {
    if (!db) return;
    const stmt = db.prepare("DELETE FROM stocks WHERE ticker = ?");
    stmt.run([ticker]);
    stmt.free();
    showAppMessage(`Deleted stock "${ticker}"`, "success");

    // Refresh the stock list
    setStocks(getAllStocks());
  }, [db, getAllStocks, showAppMessage]);

  const addBuyTransaction = (buy: {
    date: string;
    stock_ticker: string;
    stock_count: number;
    total_price: number;
  }) => {
    if (!db) return;

    try {
      // Get stock ID
      const stmt = db.prepare("SELECT id FROM stocks WHERE ticker = ?");
      stmt.bind([buy.stock_ticker]);
      let stockId: number | null = null;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stockId = row.id as number;
      }
      stmt.free();

      if (stockId === null) {
        showAppMessage("Stock ticker not found", "error");
        return;
      }
      const insertStmt = db.prepare(
        `INSERT INTO buys (stock_id, date, count, total_price)
         VALUES (?, ?, ?, ?)`
      );
      insertStmt.run([
        stockId,
        buy.date,
        buy.stock_count,
        buy.total_price
      ]);
      insertStmt.free();
      console.log("Buy transaction added:", buy);
      // Refresh buys state
      const result: Buy[] = [];
      const fetchStmt = db.prepare("SELECT * FROM buys ORDER BY date DESC");
      while (fetchStmt.step()) {
        const row = fetchStmt.getAsObject() as Buy;
        result.push(row);
      }
      fetchStmt.free();
      setBuys(result);

      showAppMessage("Buy transaction added", "success");
    } catch (err: any) {
      showAppMessage(`Failed to add buy: ${err.message}`, "error");
    }
  };

  const addSellTransaction = (sell: {
    date: string;
    stock_ticker: string;
    stock_count: number;
    total_price: number;
  }) => {
    if (!db) return;

    try {
      // Get stock ID
      const stmt = db.prepare("SELECT id FROM stocks WHERE ticker = ?");
      stmt.bind([sell.stock_ticker]);
      let stockId: number | null = null;
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stockId = row.id as number;
      }
      stmt.free();

      if (stockId === null) {
        showAppMessage("Stock ticker not found", "error");
        return;
      }

      const insertStmt = db.prepare(
        `INSERT INTO sells (stock_id, date, count, total_price)
         VALUES (?, ?, ?, ?)`
      );
      insertStmt.run([
        stockId,
        sell.date,
        sell.stock_count,
        sell.total_price
      ]);
      insertStmt.free();
      console.log("Sell transaction added:", sell);
      // Refresh buys state
      const result: Buy[] = [];
      const fetchStmt = db.prepare("SELECT * FROM sells ORDER BY date DESC");
      while (fetchStmt.step()) {
        const row = fetchStmt.getAsObject() as Buy;
        result.push(row);
      }
      fetchStmt.free();
      setBuys(result);

      showAppMessage("Sell transaction added", "success");
    } catch (err: any) {
      showAppMessage(`Failed to add sell: ${err.message}`, "error");
    }
  };

  // Get all buys
  const getAllBuys = useCallback((): Buy[] => {
    if (!db) return [];
    const result: Buy[] = [];
    const stmt = db.prepare("SELECT * FROM buys ORDER BY date DESC");
    while (stmt.step()) {
      const row = stmt.getAsObject() as Buy;
      result.push(row);
    }
    stmt.free();
    return result;
  }, [db]);

  // Get all sells
  const getAllSells = useCallback((): Sell[] => {
    if (!db) return [];
    const result: Sell[] = [];
    const stmt = db.prepare("SELECT * FROM sells ORDER BY date DESC");
    while (stmt.step()) {
      const row = stmt.getAsObject() as Sell;
      result.push(row);
    }
    stmt.free();
    return result;
  }, [db]);

  // delete a stock by id
  const deleteStockById = useCallback((id: number): void => {
    if (!db) return;
    // Check if stock exists
    const stock = getStockByStockId(id);
    if (!stock) {
      showAppMessage(`Stock with ID ${id} not found`, "error");
      return;
    }
    // check if there are any buys or sells for this stock
    const buyStmt = db.prepare("SELECT COUNT(*) as count FROM buys WHERE stock_id = ?");
    buyStmt.bind([id]);
    let buyCount = 0;
    if (buyStmt.step()) {
      buyCount = buyStmt.getAsObject().count as number;
    }
    buyStmt.free();
    const sellStmt = db.prepare("SELECT COUNT(*) as count FROM sells WHERE stock_id = ?");
    sellStmt.bind([id]);
    let sellCount = 0;
    if (sellStmt.step()) {
      sellCount = sellStmt.getAsObject().count as number;
    }
    sellStmt.free();
    if (buyCount > 0 || sellCount > 0) {
      showAppMessage(`Cannot delete stock with ID ${id} as it has associated transactions`, "error");
      return;
    }
    const stmt = db.prepare("DELETE FROM stocks WHERE id = ?");
    stmt.run([id]);
    stmt.free();
    showAppMessage(`Deleted stock with ID ${id}`, "success");

    // Refresh the stock list
    setStocks(getAllStocks());
  }, [db, getAllStocks, showAppMessage]);

  // Get all transactions (buys and sells), optional ticker filter
function getAllTransactions(ticker?: string) {
  if (!db) return [];

  const queryParts: string[] = [];
  const args: any[] = [];

  const stocks = db.exec("SELECT * FROM stocks")[0]?.values || [];
  const stockMap = new Map(stocks.map(([id, ticker, name]) => [id, ticker]));

  let buyQuery = "SELECT * FROM buys";
  let sellQuery = "SELECT * FROM sells";

  if (ticker) {
    const stockId = [...stockMap.entries()].find(([, t]) => t === ticker)?.[0];
    if (stockId !== undefined) {
      buyQuery += ` WHERE stock_id = ?`;
      sellQuery += ` WHERE stock_id = ?`;
      args.push(stockId);
    } else return [];
  }

  const buys = db.exec(buyQuery, args)[0]?.values || [];
  const sells = db.exec(sellQuery, args)[0]?.values || [];

  return [
    ...buys.map(([id, stock_id, date, count, total_price]) => ({
      id,
      type: "buy",
      date,
      ticker: stockMap.get(stock_id),
      count,
      total_price,
    })),
    ...sells.map(([id, stock_id, date, count, total_price]) => ({
      id,
      type: "sell",
      date,
      ticker: stockMap.get(stock_id),
      count,
      total_price,
    })),
  ];
}

// Delete transaction by type
function deleteTransaction(id: number, type: "buy" | "sell") {
  if (!db) return;
  const table = type === "buy" ? "buys" : "sells";
  console.log(`Deleting ${type} transaction with ID: ${id}`);
  db.run(`DELETE FROM ${table} WHERE id = ?`, [id]);
  // Refresh the respective state
  if (type === "buy") {
    setBuys(getAllBuys());
  } else {
    setSells(getAllSells());
  }
  console.log(`${type} transaction with ID ${id} deleted.`);
  showAppMessage(`${type} transaction deleted.`, "success");
}

// get a list of tickers for dropdowns
const getTickerList = useCallback((): string[] => {
  if (!db) return [];
  const result: string[] = [];
  const stmt = db.prepare("SELECT ticker FROM stocks ORDER BY ticker");
  while (stmt.step()) {
    const row = stmt.getAsObject() as { ticker: string };
    result.push(row.ticker);
  }
  stmt.free();
  return result;
}, [db]);

  // Calculate capital gains using FIFO method
  const calculateCapitalGainsFIFO = useCallback((ticker?: string) => {
    if (!db) return [];

    let stockId: number | null = null;
    if (ticker) {
      const stock = getStockByTicker(ticker);
      if (!stock) return [];
      stockId = stock.id;
    }

    // Fetch and sort buys and sells
    const buysList: Buy[] = [];
    const sellsList: Sell[] = [];

    const buyStmt = db.prepare(
      stockId !== null
        ? "SELECT * FROM buys WHERE stock_id = ? ORDER BY date ASC"
        : "SELECT * FROM buys ORDER BY date ASC"
    );
    if (stockId !== null) buyStmt.bind([stockId]);

    while (buyStmt.step()) {
      buysList.push(buyStmt.getAsObject() as Buy);
    }
    buyStmt.free();

    const sellStmt = db.prepare(
      stockId !== null
        ? "SELECT * FROM sells WHERE stock_id = ? ORDER BY date ASC"
        : "SELECT * FROM sells ORDER BY date ASC"
    );
    if (stockId !== null) sellStmt.bind([stockId]);

    while (sellStmt.step()) {
      sellsList.push(sellStmt.getAsObject() as Sell);
    }
    sellStmt.free();

    // FIFO logic
    const gainReport: {
      sellId: number;
      ticker: string;
      sellDate: string;
      sellCount: number;
      sellPrice: number;
      costBasis: number;
      gain: number;
    }[] = [];

    // Setup a tracker for remaining counts per buy (by id)
    const remainingBuys: { [buyId: number]: number } = {};
    buysList.forEach((buy) => {
      remainingBuys[buy.id] = buy.count;
    });

    for (const sell of sellsList) {
      let remainingToSell = sell.count;
      let costBasis = 0;
      let originalCount = sell.count;

      for (const buy of buysList) {
        if (buy.stock_id === sell.stock_id && remainingBuys[buy.id] > 0 && remainingToSell > 0) {
          const matchedCount = Math.min(remainingBuys[buy.id], remainingToSell);
          const unitBuyPrice = buy.total_price / buy.count;
          costBasis += matchedCount * unitBuyPrice;
          remainingBuys[buy.id] -= matchedCount;
          remainingToSell -= matchedCount;
        }
      }

      const gain = sell.total_price - costBasis;
      const ticker = getStockByStockId(sell.stock_id)?.ticker || "Unknown";
      gainReport.push({
        sellId: sell.id,
        ticker: ticker,
        sellDate: sell.date,
        sellCount: originalCount,
        sellPrice: sell.total_price,
        costBasis: parseFloat(costBasis.toFixed(2)),
        gain: parseFloat(gain.toFixed(2)),
      });
    }

    return gainReport;
  }, [db, getStockByStockId, getStockByTicker]);

  return {
    db,
    stocks,
    setStocks,
    buys,
    setBuys,
    sells,
    setSells,
    isLoading,
    message,
    messageType,
    isMessageVisible,
    showAppMessage,
    addStockTicker,
    getAllStocks,
    getStockByTicker,
    deleteStockByTicker,
    addBuyTransaction,
    addSellTransaction,
    getAllBuys,
    getAllSells,
    calculateCapitalGainsFIFO,
    deleteStockById,
    getAllTransactions,
    deleteTransaction,
    getTickerList,
    resetDatabase
  };
}