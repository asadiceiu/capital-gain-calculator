import React from "react";
import { Link } from "react-router-dom";
import useDatabase from "../hooks/useDatabase";

const ManageDatabase: React.FC = () => {
  const { db, resetDatabase } = useDatabase();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result || typeof result === "string") return;

      const uint8Array = new Uint8Array(result as ArrayBuffer);
      localStorage.setItem(
        "capitalGainsSqliteDb-v2",
        JSON.stringify(Array.from(uint8Array))
      );

      alert("Database uploaded successfully!");
      window.location.reload();
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownload = () => {
    const dbStr = localStorage.getItem("capitalGainsSqliteDb-v2");
    if (!dbStr) return;

    const blob = new Blob([new Uint8Array(JSON.parse(dbStr))], {
      type: "application/x-sqlite3",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "capital-gain.sqlite";
    a.click();
  };

  const handleDatabaseReset = () => {
    if (
      window.confirm(
        "Are you sure you want to create an empty database? This will delete all existing data."
      )
    ) {
      resetDatabase(db);
      alert("Database has been reset to an empty state.");
      window.location.reload();
    }
  };

  return (
    <>
      <h1 className="text-4xl font-bold text-blue-800 text-center mb-4">
        <Link to="/">Capital Gain Calculator</Link>
      </h1>
      <h2 className="text-xl font-semibold text-blue-900 mb-4 text-center">
        Manage Database
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-4 mt-4">
        <Link
          to="/"
          className=" text-blue-400 font-semibold hover:text-blue-500 transition"
        >
          Back to Dashboard
        </Link>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-gray-700">
            Upload or download the SQLite database file to manage your data.
          </p>
          <input
            type="file"
            accept=".sqlite"
            onChange={handleUpload}
            className="w-full px-4 py-2 rounded bg-green-500 text-white font-semibold hover:bg-green-600 transition mb-4"
          />
        </div>
        <div className="mb-4">
          <p className="text-gray-700">
            Download the current database to your local machine.
          </p>

          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Download Database
          </button>
        </div>
        <div className="mb-4">
          <button
            onClick={() => {
              handleDatabaseReset();
            }}
            className="w-full px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Reset Database
          </button>
        </div>
      </div>
    </>
  );
};

export default ManageDatabase;
