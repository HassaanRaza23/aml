import React, { useState } from "react";

const mockAlerts = [
  {
    id: 101,
    date: "2025-08-05",
    customer: "Ahmed Khan",
    riskLevel: "High",
    reason: "Unusual transaction pattern",
    status: "Open",
  },
  {
    id: 102,
    date: "2025-08-04",
    customer: "Sara Malik",
    riskLevel: "Medium",
    reason: "Large deposit flagged",
    status: "Under Review",
  },
  {
    id: 103,
    date: "2025-08-03",
    customer: "Zeeshan Ali",
    riskLevel: "Low",
    reason: "Multiple small withdrawals",
    status: "Resolved",
  },
];

const Alerts = () => {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const markResolved = (id) => {
    const updated = alerts.map((alert) =>
      alert.id === id ? { ...alert, status: "Resolved" } : alert
    );
    setAlerts(updated);
    setSelectedAlert(null); // close modal if open
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Alerts</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Risk Level</th>
              <th className="px-4 py-2 border">Reason</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.id}>
                <td className="px-4 py-2 border">{alert.date}</td>
                <td className="px-4 py-2 border">{alert.customer}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-white text-sm ${
                      alert.riskLevel === "High"
                        ? "bg-red-600"
                        : alert.riskLevel === "Medium"
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                  >
                    {alert.riskLevel}
                  </span>
                </td>
                <td className="px-4 py-2 border">{alert.reason}</td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded text-sm text-white ${
                      alert.status === "Resolved"
                        ? "bg-green-500"
                        : alert.status === "Under Review"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {alert.status}
                  </span>
                </td>
                <td className="px-4 py-2 border space-x-2">
                  <button
                    className="text-blue-600 underline"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    View
                  </button>
                  {alert.status !== "Resolved" && (
                    <button
                      onClick={() => markResolved(alert.id)}
                      className="text-green-600 underline"
                    >
                      Mark Resolved
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-md p-6 rounded shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Alert Details</h2>
            <p><strong>Customer:</strong> {selectedAlert.customer}</p>
            <p><strong>Date:</strong> {selectedAlert.date}</p>
            <p><strong>Risk Level:</strong> {selectedAlert.riskLevel}</p>
            <p><strong>Reason:</strong> {selectedAlert.reason}</p>
            <p><strong>Status:</strong> {selectedAlert.status}</p>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setSelectedAlert(null)}
                className="bg-gray-200 px-4 py-2 rounded"
              >
                Close
              </button>

              {selectedAlert.status !== "Resolved" && (
                <button
                  onClick={() => markResolved(selectedAlert.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
