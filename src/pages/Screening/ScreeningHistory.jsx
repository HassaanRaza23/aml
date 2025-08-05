import React, { useState } from "react";
import { Link } from "react-router-dom";

const mockScreeningHistory = [
  {
    id: "case-001",
    screenedEntity: "John Doe",
    screeningType: "Instant",
    date: "2025-08-04 10:30",
    result: "No Match",
    riskScore: 5,
  },
  {
    id: "case-002",
    screenedEntity: "Acme Corp",
    screeningType: "Ongoing",
    date: "2025-08-03 15:20",
    result: "Match Found",
    riskScore: 85,
  },
  {
    id: "case-003",
    screenedEntity: "Jane Smith",
    screeningType: "Instant",
    date: "2025-08-02 11:45",
    result: "No Match",
    riskScore: 10,
  },
  // Add more mock cases here
];

const ScreeningHistory = () => {
  const [filterResult, setFilterResult] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and search logic
  const filteredCases = mockScreeningHistory.filter((item) => {
    const matchesResult =
      filterResult === "" || item.result.toLowerCase() === filterResult.toLowerCase();
    const matchesSearch =
      item.screenedEntity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesResult && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Screening History</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by entity"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        />

        <select
          value={filterResult}
          onChange={(e) => setFilterResult(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">All Results</option>
          <option value="No Match">No Match</option>
          <option value="Match Found">Match Found</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 border-r border-gray-300 text-left">Date & Time</th>
              <th className="p-3 border-r border-gray-300 text-left">Entity</th>
              <th className="p-3 border-r border-gray-300 text-left">Screening Type</th>
              <th className="p-3 border-r border-gray-300 text-left">Result</th>
              <th className="p-3 border-r border-gray-300 text-left">Risk Score</th>
              <th className="p-3 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredCases.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No screening cases found.
                </td>
              </tr>
            ) : (
              filteredCases.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="p-3 border-t border-gray-300">{item.date}</td>
                  <td className="p-3 border-t border-gray-300">{item.screenedEntity}</td>
                  <td className="p-3 border-t border-gray-300">{item.screeningType}</td>
                  <td className="p-3 border-t border-gray-300">{item.result}</td>
                  <td className="p-3 border-t border-gray-300">{item.riskScore}</td>
                  <td className="p-3 border-t border-gray-300">
                    <Link
                      to={`/screening/case/${item.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScreeningHistory;
