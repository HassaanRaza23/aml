import React, { useState } from "react";

const RiskProfile = () => {
  // Hardcoded customer name
  const customerName = "Ahmed Khan";

  // Mocked risk factors (usually fetched or calculated)
  const riskFactors = [
    { factor: "PEP", value: "Yes", risk: "High" },
    { factor: "Country of Residence", value: "Pakistan", risk: "Medium" },
    { factor: "Source of Funds", value: "Salary", risk: "Low" },
    { factor: "Occupation", value: "White Collar", risk: "Low" },
    { factor: "Due Diligence Score", value: "45", risk: "Medium" },
  ];

  // Risk level calculation (mocked)
  const calculatedRiskLevel = "Medium";
  const calculatedScore = 45;

  // Manual override state
  const [overrideLevel, setOverrideLevel] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const handleSave = () => {
    const dataToSave = {
      customerName,
      calculatedScore,
      calculatedRiskLevel,
      overrideLevel,
      overrideReason,
    };
    console.log("Saving Risk Profile:", dataToSave);
    alert("Risk profile saved (mock)");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Risk Profile</h1>
      <p className="text-gray-600 mb-6">Customer: <span className="font-medium">{customerName}</span></p>

      {/* Risk Factors Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Risk Factors Summary</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Factor</th>
              <th className="p-2 border">Value</th>
              <th className="p-2 border">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {riskFactors.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border">{item.factor}</td>
                <td className="p-2 border">{item.value}</td>
                <td
                  className={`p-2 border font-medium ${
                    item.risk === "High"
                      ? "text-red-600"
                      : item.risk === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {item.risk}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculated Score */}
      <div className="text-center my-6">
        <h2 className="text-xl font-semibold mb-2">Calculated Risk Level</h2>
        <div
          className={`text-3xl font-bold ${
            calculatedRiskLevel === "High"
              ? "text-red-600"
              : calculatedRiskLevel === "Medium"
              ? "text-yellow-500"
              : "text-green-600"
          }`}
        >
          {calculatedRiskLevel} Risk
        </div>
        <div className="text-sm text-gray-600">Score: {calculatedScore} / 100</div>
      </div>

      {/* Override Section */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-2">Manual Override</h2>
        <label className="block font-medium mb-1">Override Risk Level</label>
        <select
          className="w-full p-2 border rounded mb-3"
          value={overrideLevel}
          onChange={(e) => setOverrideLevel(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <label className="block font-medium mb-1">Justification</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={overrideReason}
          onChange={(e) => setOverrideReason(e.target.value)}
          placeholder="Explain why you're overriding the system's decision"
        ></textarea>
      </div>

      {/* Save Button */}
      <div className="text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Risk Profile
        </button>
      </div>
    </div>
  );
};

export default RiskProfile;
