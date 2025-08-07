// src/pages/Risk/RiskAssessment.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const mockRiskData = [
  {
    id: 1,
    name: "Mohammad Zain",
    riskScore: 82,
    riskLevel: "High",
    lastAssessed: "2025-07-29",
    status: "Active",
  },
  {
    id: 2,
    name: "Fatima Bano",
    riskScore: 45,
    riskLevel: "Medium",
    lastAssessed: "2025-07-26",
    status: "Active",
  },
  {
    id: 3,
    name: "Ali Khan",
    riskScore: 20,
    riskLevel: "Low",
    lastAssessed: "2025-07-15",
    status: "Inactive",
  },
];

const getBadgeColor = (level) => {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
};

const RiskAssessment = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = mockRiskData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Risk Assessments</h1>

      <input
        type="text"
        placeholder="Search by customer name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-sm"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Customer Name</th>
              <th className="py-2 px-4 border-b">Risk Score</th>
              <th className="py-2 px-4 border-b">Risk Level</th>
              <th className="py-2 px-4 border-b">Last Assessed</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td className="py-2 px-4 border-b">{item.name}</td>
                <td className="py-2 px-4 border-b">{item.riskScore}</td>
                <td className="py-2 px-4 border-b">
                  <span
                    className={`px-2 py-1 text-sm rounded ${getBadgeColor(
                      item.riskLevel
                    )}`}
                  >
                    {item.riskLevel}
                  </span>
                </td>
                <td className="py-2 px-4 border-b">{item.lastAssessed}</td>
                <td className="py-2 px-4 border-b">{item.status}</td>
                <td className="py-2 px-4 border-b">
                  <Link
                    to={`/risk-profile/${item.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View / Update
                  </Link>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskAssessment;
