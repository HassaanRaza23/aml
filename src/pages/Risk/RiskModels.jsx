import React, { useState } from "react";

const RiskModels = () => {
  const [riskModels, setRiskModels] = useState([
    {
      id: 1,
      name: "Default UAE Model",
      description: "Standard model for UAE FI clients",
      scoringRange: "0 - 100",
      mapping: "Low (0–30), Med (31–70), High (71–100)",
      status: "Active",
    },
    {
      id: 2,
      name: "High-Risk Entity Model",
      description: "Customized scoring for high-risk entities",
      scoringRange: "0 - 10",
      mapping: "Low (0–3), Med (4–6), High (7–10)",
      status: "Inactive",
    },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Risk Models</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Risk Model
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Model Name</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Scoring Range</th>
              <th className="py-3 px-4 text-left">Risk Level Mapping</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {riskModels.map((model) => (
              <tr key={model.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{model.name}</td>
                <td className="py-3 px-4">{model.description}</td>
                <td className="py-3 px-4">{model.scoringRange}</td>
                <td className="py-3 px-4">{model.mapping}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      model.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {model.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center space-x-2">
                  <button className="text-blue-600 hover:underline">Edit</button>
                  <button className="text-gray-600 hover:underline">Duplicate</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RiskModels;