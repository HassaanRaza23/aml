import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CustomerList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({ risk: "", kyc: "" });

  const customers = [
    { name: "Ahmed Khan", risk: "Medium", kyc: "Pending", date: "2025-08-01" },
    { name: "Ali Malik", risk: "High", kyc: "Rejected", date: "2025-07-20" },
    { name: "Hina Tariq", risk: "Medium", kyc: "Pending", date: "2025-07-28" },
    { name: "John Doe", risk: "Low", kyc: "Verified", date: "2025-07-25" },
    { name: "Sara Malik", risk: "High", kyc: "Rejected", date: "2025-07-20" },
  ];

  const handleSort = (field) => {
    setSortBy((prev) => (prev === field ? "" : field));
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const filtered = customers
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => (filters.risk ? c.risk === filters.risk : true))
    .filter((c) => (filters.kyc ? c.kyc === filters.kyc : true))
    .sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      return a[sortBy].localeCompare(b[sortBy]);
    });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Customer List</h1>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.risk}
            onChange={(e) => handleFilterChange("risk", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <select
            value={filters.kyc}
            onChange={(e) => handleFilterChange("kyc", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All KYC</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto bg-white rounded-xl shadow border">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("name")}
              >
                Name
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("risk")}
              >
                Risk Level
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("kyc")}
              >
                KYC Status
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("date")}
              >
                Date Added
              </th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cust, i) => (
              <tr
                key={i}
                className="border-b hover:bg-gray-50 transition duration-200"
              >
                <td className="p-4 font-semibold text-gray-800">{cust.name}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cust.risk === "High"
                        ? "bg-red-100 text-red-700"
                        : cust.risk === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {cust.risk}
                  </span>
                </td>
                <td className="p-4 text-gray-700">{cust.kyc}</td>
                <td className="p-4 text-gray-600">{cust.date}</td>
                <td className="p-4 space-x-3">
                  <button
                    onClick={() => navigate(`/customer/kyc`)}
                    className="text-blue-600 hover:underline hover:text-blue-800 transition text-sm"
                  >
                    KYC
                  </button>
                  <button
                    onClick={() => navigate(`/customer/risk-profile`)}
                    className="text-green-600 hover:underline hover:text-green-800 transition text-sm"
                  >
                    Risk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-gray-500 text-center">No customers found.</div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
