import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockCases = [
  {
    id: "CASE-001",
    customerName: "Ali Raza",
    type: "Transaction",
    severity: "High",
    status: "Open",
    createdAt: "2025-08-01",
    assignedTo: "Analyst A",
  },
  {
    id: "CASE-002",
    customerName: "Fatima Khan",
    type: "Screening",
    severity: "Medium",
    status: "In Progress",
    createdAt: "2025-08-02",
    assignedTo: "Analyst B",
  },
  {
    id: "CASE-003",
    customerName: "Zain Ahmed",
    type: "Transaction",
    severity: "Low",
    status: "Resolved",
    createdAt: "2025-08-03",
    assignedTo: "Analyst C",
  },
];

const CaseList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const filteredCases = mockCases.filter((c) =>
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Case Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Customer Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded w-72"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Case ID</th>
              <th className="text-left p-3">Customer Name</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Severity</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created At</th>
              <th className="text-left p-3">Assigned To</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.customerName}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      c.severity === "High"
                        ? "bg-red-100 text-red-700"
                        : c.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.severity}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      c.status === "Open"
                        ? "bg-blue-100 text-blue-700"
                        : c.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3">{c.createdAt}</td>
                <td className="p-3">{c.assignedTo}</td>
                <td className="p-3">
                  <button
                  onClick={() => navigate(`/cases/details`)}
                  className="text-blue-600 hover:underline">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan="8" className="p-3 text-center text-gray-500">
                  No cases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CaseList;
