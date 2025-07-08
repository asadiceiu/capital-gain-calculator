import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useDatabase from "../hooks/useDatabase";

const CapitalGainsReportsPage = () => {
  const { calculateCapitalGainsFIFO, getAllStocks } = useDatabase();
  const [reportData, setReportData] = useState<any[]>([]);
  const [selectedTicker, setSelectedTicker] = useState("");
  const [stockOptions, setStockOptions] = useState<
    { id: number; ticker: string }[]
  >([]);

  useEffect(() => {
    const stocks = getAllStocks();
    setStockOptions(stocks.map((s: any) => ({ id: s.id, ticker: s.ticker })));
  }, [getAllStocks]);

  useEffect(() => {
    const data = calculateCapitalGainsFIFO(selectedTicker || undefined);
    data.sort((a, b) => {
      if (a.ticker < b.ticker) return -1;
      if (a.ticker > b.ticker) return 1;
      return new Date(a.sellDate).getTime() - new Date(b.sellDate).getTime();
    });
    setReportData(data);
  }, [calculateCapitalGainsFIFO, selectedTicker]);
  return (
    <>
      <h1 className="text-4xl font-bold text-blue-800 text-center mb-4">
        <Link to="/">Capital Gain Calculator</Link>
      </h1>
      <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
        Capital Gains Report
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4 mt-4">
        <Link
          to="/"
          className=" text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        <div className="mt-8">
          <div className="mb-4 flex justify-center">
            <select
              className="border rounded px-4 py-2"
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
            >
              <option value="">All Tickers</option>
              {stockOptions.map((stock) => (
                <option key={stock.id} value={stock.ticker}>
                  {stock.ticker}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Ticker</th>
                  <th className="px-4 py-2 border">Sell Date</th>
                  <th className="px-4 py-2 border">Sell Count</th>
                  <th className="px-4 py-2 border">Sell Price</th>
                  <th className="px-4 py-2 border">Cost Basis</th>
                  <th className="px-4 py-2 border">Capital Gain</th>
                </tr>
              </thead>
              <tbody>
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center px-4 py-2">
                      No capital gains data available for the selected ticker.
                      Either no transactions exist or the ticker has no sell
                      transactions.
                    </td>
                  </tr>
                ) : null}

                {reportData.map((entry, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="border px-4 py-2">{entry.ticker}</td>
                    <td className="border px-4 py-2">{entry.sellDate}</td>
                    <td className="border px-4 py-2">{entry.sellCount}</td>
                    <td className="border px-4 py-2">
                      ${entry.sellPrice.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2">
                      ${entry.costBasis.toFixed(2)}
                    </td>
                    <td
                      className={`border px-4 py-2 border-gray-200 ${
                        entry.gain < 0.0 ? "bg-red-100" : "bg-blue-100"
                      }`}
                    >
                      ${entry.gain.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {reportData.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 text-center">
              Capital Gains by Financial Year
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Financial Year</th>
                    <th className="px-4 py-2 border">Total Capital Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(
                    reportData.reduce((acc, entry) => {
                      const sellDate = new Date(entry.sellDate);
                      const fy =
                        sellDate.getMonth() >= 6
                          ? `${sellDate.getFullYear()}-${
                              sellDate.getFullYear() + 1
                            }`
                          : `${
                              sellDate.getFullYear() - 1
                            }-${sellDate.getFullYear()}`;
                      acc[fy] =
                        (acc[fy] || 0) +
                        (typeof entry.gain === "number" ? entry.gain : 0);
                      return acc;
                    }, {} as Record<string, number>)
                  )
                    .sort(([a], [b]) => (a > b ? 1 : -1))
                    .map(([fy, gain], idx) => (
                      <tr key={idx} className="text-center">
                        <td className="border px-4 py-2">{fy}</td>
                        <td
                          className={`border px-4 py-2 ${
                            (gain as number) < 0 ? "bg-red-100" : "bg-green-100"
                          }`}
                        >
                          ${(gain as number).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CapitalGainsReportsPage;
