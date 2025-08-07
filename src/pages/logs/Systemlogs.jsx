import React, { useState, useEffect } from "react";

const mockSystemLogs = [
  {
    id: 1,
    eventType: "goAML XML Generation",
    description: "Generated XML for STR report - Customer ID 93822",
    timestamp: "2025-08-07 09:35 AM",
    status: "Success",
    triggerType: "Scheduled",
    module: "Reports",
  },
  {
    id: 2,
    eventType: "Automated Screening",
    description: "Ongoing screening batch for 100 customers",
    timestamp: "2025-08-06 11:21 AM",
    status: "In Progress",
    triggerType: "Auto",
    module: "Screening",
  },
  {
    id: 3,
    eventType: "Risk Re-Evaluation",
    description: "Risk scoring cron job failed due to timeout",
    timestamp: "2025-08-06 08:05 AM",
    status: "Failed",
    triggerType: "Scheduled",
    module: "Risk",
  },
];

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  useEffect(() => {
    // Simulate fetching logs from backend
    setLogs(mockSystemLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      (statusFilter ? log.status === statusFilter : true) &&
      (moduleFilter ? log.module === moduleFilter : true)
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">System Logs</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          className="border rounded p-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
          <option value="In Progress">In Progress</option>
        </select>

        <select
          className="border rounded p-2"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="">All Modules</option>
          <option value="Screening">Screening</option>
          <option value="Reports">Reports</option>
          <option value="Monitoring">Monitoring</option>
          <option value="Risk">Risk</option>
        </select>

        <button
          onClick={() => {
            setStatusFilter("");
            setModuleFilter("");
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Clear Filters
        </button>

        <button
          onClick={() => window.location.reload()}
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Logs
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b">Log ID</th>
              <th className="p-3 border-b">Event Type</th>
              <th className="p-3 border-b">Description</th>
              <th className="p-3 border-b">Timestamp</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Trigger Type</th>
              <th className="p-3 border-b">Module</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  No logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{log.id}</td>
                  <td className="p-3">{log.eventType}</td>
                  <td className="p-3">{log.description}</td>
                  <td className="p-3">{log.timestamp}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-sm rounded-full ${
                        log.status === "Success"
                          ? "bg-green-100 text-green-800"
                          : log.status === "Failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3">{log.triggerType}</td>
                  <td className="p-3">{log.module}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;
