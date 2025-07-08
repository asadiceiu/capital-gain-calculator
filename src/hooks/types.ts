export interface Stock {
  id: number;
  ticker: string;
  name: string;
}

export interface Buy {
  id: number;
  stock_id: number;
  date: string;
  count: number;
  total_price: number;
  remaining_count: number;
  realized_gain: number;
}

export interface Sell {
  id: number;
  stock_id: number;
  date: string;
  count: number;
  total_price: number;
}

export interface Transaction {
  id: number;
  type: "buy" | "sell";
  date: string;
  ticker: string;
  count: number;
  total_price: number;
}