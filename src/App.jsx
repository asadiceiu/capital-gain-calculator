import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import AddStocksPage from "./pages/AddStockPage";
import CurrentStocksReportPage from "./pages/CurrentStocksReportPage";
import AddTransactionsPage from "./pages/AddTransactionsPage";
import TransactionReportPage from "./pages/TransactionReportPage";
import CapitalGainsReportsPage from "./pages/CapitalGainsReportsPage";
import ManageDatabase from "./pages/ManageDatabase";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-lg max-w-full space-y-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-stocks" element={<AddStocksPage />} />
            <Route path="/stocks" element={<CurrentStocksReportPage />} />
            <Route path="/add-transactions" element={<AddTransactionsPage />} />
            <Route path="/transactions" element={<TransactionReportPage />} />
            <Route path="/ctg-reports" element={<CapitalGainsReportsPage />} />
            <Route path="/database" element={<ManageDatabase />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;