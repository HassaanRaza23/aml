// src/pages/monitoring/TransactionMonitoring.jsx

import React, { useState } from "react";

const mockTransactions = [
  {
    id: 1,
    date: "2025-08-05",
    customer: "Ahmed Khan",
    amount: 25000,
    type: "Wire Transfer",
    riskScore: 72,
    status: "Normal",
  },
  {
    id: 2,
    date: "2025-08-04",
    customer: "Sara Malik",
    amount: 98000,
    type: "Deposit",
    riskScore: 88,
    status: "Flagged",
  },
  {
    id: 3,
    date: "2025-08-03",
    customer: "Zeeshan Ali",
    amount: 3500,
    type: "Withdrawal",
    riskScore: 40,
    status: "Normal",
  },
];

const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState(mockTransactions);

  const flagTransaction = (id) => {
    const updated = transactions.map((tx) =>
      tx.id === id ? { ...tx, status: "Flagged" } : tx
    );
    setTransactions(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Transaction Monitoring</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Customer"
          className="border px-4 py-2 rounded"
        />
        <input
          type="date"
          className="border px-4 py-2 rounded"
        />
        <select className="border px-4 py-2 rounded">
          <option value="">Status</option>
          <option value="normal">Normal</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Risk Score</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-2 border">{tx.date}</td>
                <td className="px-4 py-2 border">{tx.customer}</td>
                <td className="px-4 py-2 border">${tx.amount.toLocaleString()}</td>
                <td className="px-4 py-2 border">{tx.type}</td>
                <td className="px-4 py-2 border">{tx.riskScore}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      tx.status === "Flagged" ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td className="px-4 py-2 border space-x-2">
                  <button
                    onClick={() => flagTransaction(tx.id)}
                    className="text-red-600 underline"
                  >
                    Flag
                  </button>
                  <button className="text-blue-600 underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionMonitoring;
