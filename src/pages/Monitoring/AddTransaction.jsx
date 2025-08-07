import React, { useState } from "react";

const AddTransaction = () => {
  const [tab, setTab] = useState("manual");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add Transactions</h1>

      <div className="flex gap-4 border-b mb-6">
        <button
          className={`pb-2 ${tab === "manual" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setTab("manual")}
        >
          Manual Entry
        </button>
        <button
          className={`pb-2 ${tab === "upload" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setTab("upload")}
        >
          Upload File
        </button>
        <button
          className={`pb-2 ${tab === "connect" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setTab("connect")}
        >
          Connect Accounting Software
        </button>
      </div>

      {/* Manual Entry Tab */}
      {tab === "manual" && (
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Customer Name / ID" className="input" />
          <input type="date" className="input" />
          <input type="number" placeholder="Amount" className="input" />
          <input type="text" placeholder="Currency" className="input" />
          <select className="input">
            <option>Transaction Type</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input type="text" placeholder="Country" className="input" />
          <input type="text" placeholder="Counterparty Name" className="input" />
          <input type="text" placeholder="Source of Funds" className="input" />
          <input type="text" placeholder="Purpose of Transaction" className="input" />
          <textarea placeholder="Description / Notes" className="input md:col-span-2" />
          <button className="btn-primary md:col-span-2">Submit</button>
        </form>
      )}

      {/* Upload File Tab */}
      {tab === "upload" && (
        <div className="space-y-4">
          <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
          {file && <p className="text-sm text-gray-600">Selected file: {file.name}</p>}
          <a
            href="/sample-template.xlsx"
            download
            className="text-blue-500 underline"
          >
            Download sample template
          </a>
          <button className="btn-primary">Upload</button>
        </div>
      )}

      {/* Connect Accounting Software Tab */}
      {tab === "connect" && (
        <div className="space-y-4">
          <button className="btn-disabled">Connect to QuickBooks (Coming Soon)</button>
          <button className="btn-disabled">Connect to Xero (Coming Soon)</button>
          <p className="text-sm text-gray-500">These integrations will allow automated syncing of customer transactions in future updates.</p>
        </div>
      )}
    </div>
  );
};

export default AddTransaction;

// Tailwind helper styles (can be added globally or scoped)
// .input { @apply border p-2 rounded w-full; }
// .btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700; }
// .btn-disabled { @apply bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed; }
