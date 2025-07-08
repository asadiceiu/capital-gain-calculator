import { useState } from "react";

export default function useStockState() {
  const [stockTicker, setStockTicker] = useState("");
  const [stockName, setStockName] = useState("");

  return {
    stockTicker,
    setStockTicker,
    stockName,
    setStockName,
  };
}