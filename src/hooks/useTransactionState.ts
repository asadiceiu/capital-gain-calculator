import { useState } from "react";

export default function useTransactionState() {
  const [buyTicker, setBuyTicker] = useState("");
  const [buyDate, setBuyDate] = useState("");
  const [buyCount, setBuyCount] = useState("");
  const [buyTotalPrice, setBuyTotalPrice] = useState("");

  const [sellTicker, setSellTicker] = useState("");
  const [sellDate, setSellDate] = useState("");
  const [sellCount, setSellCount] = useState("");
  const [sellTotalPrice, setSellTotalPrice] = useState("");

  return {
    buyTicker,
    setBuyTicker,
    buyDate,
    setBuyDate,
    buyCount,
    setBuyCount,
    buyTotalPrice,
    setBuyTotalPrice,
    sellTicker,
    setSellTicker,
    sellDate,
    setSellDate,
    sellCount,
    setSellCount,
    sellTotalPrice,
    setSellTotalPrice,
  };
}