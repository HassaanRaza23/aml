import React from "react";

const riskRulesData = [
  {
    id: 1,
    name: "High-Risk Country Check",
    description: "Customer belongs to a high-risk jurisdiction.",
    condition: "Country IN [Iran, North Korea, Syria]",
    weight: 25,
    category: "Geographic",
    status: "Active",
  },
  {
    id: 2,
    name: "PEP Status",
    description: "Customer is a Politically Exposed Person (PEP).",
    condition: "isPEP == true",
    weight: 30,
    category: "Customer",
    status: "Active",
  },
  {
    id: 3,
    name: "Large Transactions",
    description: "Transactions exceed threshold within 24 hours.",
    condition: "TotalTxn > 100000",
    weight: 20,
    category: "Transaction",
    status: "Inactive",
  },
];

const RiskRules = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Risk Rules</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          + Add New Rule
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded border">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="text-left py-3 px-4">Rule Name</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Condition</th>
              <th className="text-left py-3 px-4">Weight</th>
              <th className="text-left py-3 px-4">Category</th>
              <th className="text-left py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {riskRulesData.map((rule) => (
              <tr key={rule.id} className="border-t">
                <td className="py-3 px-4">{rule.name}</td>
                <td className="py-3 px-4">{rule.description}</td>
                <td className="py-3 px-4">{rule.condition}</td>
                <td className="py-3 px-4">{rule.weight}</td>
                <td className="py-3 px-4">{rule.category}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

export default RiskRules;
