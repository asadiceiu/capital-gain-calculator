import { useState } from "react";

export default function useReportState() {
  const [showCurrentStocksReport, setShowCurrentStocksReport] = useState(false);
  const [showCapitalGainsReport, setShowCapitalGainsReport] = useState(false);

  const [currentStocksData, setCurrentStocksData] = useState<any[]>([]);
  const [capitalGainsData, setCapitalGainsData] = useState<any[]>([]);

  return {
    showCurrentStocksReport,
    setShowCurrentStocksReport,
    showCapitalGainsReport,
    setShowCapitalGainsReport,
    currentStocksData,
    setCurrentStocksData,
    capitalGainsData,
    setCapitalGainsData,
  };
}