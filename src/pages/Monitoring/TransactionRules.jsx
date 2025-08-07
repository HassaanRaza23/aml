import React, { useState } from "react";

const TransactionRules = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const rules = [
    {
      name: "High Value Transaction",
      description: "Flag transactions over AED 100,000",
      condition: ">",
      threshold: "100000",
      category: "Value",
      status: "Active",
    },
    {
      name: "Frequent Transfers",
      description: "Flag more than 10 transactions in a day",
      condition: ">",
      threshold: "10",
      category: "Frequency",
      status: "Active",
    },
    {
      name: "Blacklisted Counterparty",
      description: "Match against blacklisted entities",
      condition: "Match",
      threshold: "List",
      category: "Entity",
      status: "Inactive",
    },
  ];

  const filteredRules = rules.filter((rule) =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Transaction Monitoring Rules</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add New Rule
        </button>
      </div>

      <input
        type="text"
        placeholder="Search rule by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4 border">Rule Name</th>
              <th className="py-2 px-4 border">Description</th>
              <th className="py-2 px-4 border">Condition</th>
              <th className="py-2 px-4 border">Threshold</th>
              <th className="py-2 px-4 border">Category</th>
              <th className="py-2 px-4 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4 border">{rule.name}</td>
                <td className="py-2 px-4 border">{rule.description}</td>
                <td className="py-2 px-4 border">{rule.condition}</td>
                <td className="py-2 px-4 border">{rule.threshold}</td>
                <td className="py-2 px-4 border">{rule.category}</td>
                <td className="py-2 px-4 border">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {rule.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionRules;