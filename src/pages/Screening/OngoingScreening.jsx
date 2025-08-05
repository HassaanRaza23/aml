import React, { useState } from "react";
import { Link } from "react-router-dom";

const mockOngoingAlerts = [
  {
    id: "alert-101",
    entity: "Acme Corp",
    screeningDate: "2025-08-04 09:00",
    alertType: "Sanction List Match",
    riskLevel: "High",
    status: "Open",
  },
  {
    id: "alert-102",
    entity: "John Doe",
    screeningDate: "2025-08-03 16:45",
    alertType: "Adverse Media",
    riskLevel: "Medium",
    status: "Under Review",
  },
  {
    id: "alert-103",
    entity: "Global Traders Ltd",
    screeningDate: "2025-08-02 11:15",
    alertType: "PEP Match",
    riskLevel: "Low",
    status: "Closed",
  },
];

const OngoingScreening = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAlertType, setFilterAlertType] = useState("");
  const [filterRiskLevel, setFilterRiskLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredAlerts = mockOngoingAlerts.filter((alert) => {
    const matchesSearch =
      alert.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAlertType =
      filterAlertType === "" || alert.alertType === filterAlertType;
    const matchesRisk =
      filterRiskLevel === "" || alert.riskLevel === filterRiskLevel;
    const matchesStatus = filterStatus === "" || alert.status === filterStatus;

    return matchesSearch && matchesAlertType && matchesRisk && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Ongoing Screening Alerts</h2>

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
          value={filterAlertType}
          onChange={(e) => setFilterAlertType(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">All Alert Types</option>
          <option value="Sanction List Match">Sanction List Match</option>
          <option value="Adverse Media">Adverse Media</option>
          <option value="PEP Match">PEP Match</option>
        </select>

        <select
          value={filterRiskLevel}
          onChange={(e) => setFilterRiskLevel(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">All Risk Levels</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 border-r border-gray-300 text-left">Entity</th>
              <th className="p-3 border-r border-gray-300 text-left">Screening Date</th>
              <th className="p-3 border-r border-gray-300 text-left">Alert Type</th>
              <th className="p-3 border-r border-gray-300 text-left">Risk Level</th>
              <th className="p-3 border-r border-gray-300 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No alerts found.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-100">
                  <td className="p-3 border-t border-gray-300">{alert.entity}</td>
                  <td className="p-3 border-t border-gray-300">{alert.screeningDate}</td>
                  <td className="p-3 border-t border-gray-300">{alert.alertType}</td>
                  <td className="p-3 border-t border-gray-300">{alert.riskLevel}</td>
                  <td className="p-3 border-t border-gray-300">{alert.status}</td>
                  <td className="p-3 border-t border-gray-300 space-x-2">
                    <Link
                      to={`/screening/case/${alert.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => alert(`Escalate ${alert.entity} (mock)`)}
                      className="px-2 py-1 bg-yellow-400 rounded text-sm hover:bg-yellow-500"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => alert(`Close ${alert.entity} (mock)`)}
                      className="px-2 py-1 bg-red-500 rounded text-sm text-white hover:bg-red-600"
                    >
                      Close
                    </button>
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

export default OngoingScreening;
