import React, { useState } from "react";
import { Link } from "react-router-dom";

const mockMonitoringList = [
  {
    id: "case-002",
    entity: "Acme Corp",
    lastScreeningDate: "2025-08-03 15:20",
    riskLevel: "High",
    monitoringStatus: "Active",
  },
  {
    id: "case-005",
    entity: "Global Traders Ltd",
    lastScreeningDate: "2025-08-01 09:10",
    riskLevel: "Medium",
    monitoringStatus: "Active",
  },
  {
    id: "case-007",
    entity: "Jane Smith",
    lastScreeningDate: "2025-07-30 16:50",
    riskLevel: "Low",
    monitoringStatus: "Pending Review",
  },
];

const MonitoringList = () => {
  const [filterRisk, setFilterRisk] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredList = mockMonitoringList.filter((item) => {
    const matchesRisk =
      filterRisk === "" || item.riskLevel.toLowerCase() === filterRisk.toLowerCase();
    const matchesSearch =
      item.entity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Monitoring List</h2>

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
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">All Risk Levels</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 border-r border-gray-300 text-left">Entity</th>
              <th className="p-3 border-r border-gray-300 text-left">Last Screening</th>
              <th className="p-3 border-r border-gray-300 text-left">Risk Level</th>
              <th className="p-3 border-r border-gray-300 text-left">Monitoring Status</th>
              <th className="p-3 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No monitored entities found.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100">
                  <td className="p-3 border-t border-gray-300">{item.entity}</td>
                  <td className="p-3 border-t border-gray-300">{item.lastScreeningDate}</td>
                  <td className="p-3 border-t border-gray-300">{item.riskLevel}</td>
                  <td className="p-3 border-t border-gray-300">{item.monitoringStatus}</td>
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

export default MonitoringList;
