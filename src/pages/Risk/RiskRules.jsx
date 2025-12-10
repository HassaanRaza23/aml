import React, { useEffect, useState, useMemo } from "react";
import { riskService } from "../../services";

const RiskRules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'category' | 'score' | 'logic' | 'status'
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'
  const [ruleType, setRuleType] = useState("ONBOARDING"); // 'ONBOARDING' | 'TRANSACTION_PROFILE' | 'TRANSACTION_EVENT'
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [filters, setFilters] = useState({
    ruleText: "",
    categoryName: "",
    riskLogic: "",
    riskScore: "",
    status: "",
  });
  const [newRule, setNewRule] = useState({
    categoryId: "",
    ruleName: "",
    riskScore: "",
    isActive: true,
  });

  useEffect(() => {
    const loadRules = async () => {
      try {
        setLoading(true);
        const result = await riskService.getRiskRules();
        if (result.success) {
          setRules(result.rules || []);
          setCategories(result.categories || []);
        } else {
          setError(result.error || "Failed to load risk rules");
        }
      } catch (err) {
        console.error("Error loading risk rules:", err);
        setError(err.message || "Failed to load risk rules");
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules;

    // Filter by selected rule type (for future extensibility)
    if (ruleType) {
      filtered = filtered.filter(
        (rule) => !rule.categoryRuleType || rule.categoryRuleType === ruleType
      );
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((rule) =>
        (rule.ruleText || "").toLowerCase().includes(term) ||
        (rule.categoryName || "").toLowerCase().includes(term) ||
        (rule.riskLogic || "").toLowerCase().includes(term)
      );
    }

    // Column-specific filters
    if (filters.ruleText.trim()) {
      const term = filters.ruleText.toLowerCase();
      filtered = filtered.filter((rule) =>
        (rule.ruleText || "").toLowerCase().includes(term)
      );
    }

    if (filters.categoryName) {
      filtered = filtered.filter(
        (rule) => rule.categoryName === filters.categoryName
      );
    }

    if (filters.riskLogic) {
      filtered = filtered.filter(
        (rule) =>
          (rule.riskLogic || "").toUpperCase() ===
          filters.riskLogic.toUpperCase()
      );
    }

    if (filters.status) {
      const isActive = filters.status === "ACTIVE";
      filtered = filtered.filter((rule) => !!rule.isActive === isActive);
    }

    if (filters.riskScore) {
      const score = Number(filters.riskScore);
      filtered = filtered.filter((rule) => (rule.riskScore || 0) === score);
    }

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;

      if (sortBy === "name") {
        return dir * (a.ruleText || "").localeCompare(b.ruleText || "");
      }

      if (sortBy === "category") {
        const catCompare = (a.categoryName || "").localeCompare(
          b.categoryName || ""
        );
        if (catCompare !== 0) return dir * catCompare;
        return dir * (a.ruleText || "").localeCompare(b.ruleText || "");
      }

      if (sortBy === "score") {
        return dir * ((a.riskScore || 0) - (b.riskScore || 0));
      }

      if (sortBy === "status") {
        return dir * ((a.isActive ? 1 : 0) - (b.isActive ? 1 : 0));
      }

      return 0;
    });

    return sorted;
  }, [rules, searchTerm, sortBy, sortDirection, ruleType, filters]);

  // Paginate the filtered and sorted rules
  const paginatedRules = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedRules.slice(startIndex, endIndex);
  }, [filteredAndSortedRules, currentPage, itemsPerPage]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, ruleType]);

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) return null;
    return (
      <span className="ml-1 text-gray-400">
        {sortDirection === "asc" ? "▲" : "▼"}
      </span>
    );
  };

  const uniqueCategories = useMemo(() => {
    // Use all categories from database, filtered by ruleType
    return (categories || [])
      .filter((cat) => !ruleType || cat.rule_type === ruleType)
      .map((cat) => ({ id: cat.id, name: cat.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, ruleType]);

  const uniqueLogics = useMemo(() => {
    const set = new Set();
    rules.forEach((r) => {
      if (r.riskLogic) set.add(r.riskLogic.toUpperCase());
    });
    return Array.from(set).sort();
  }, [rules]);

  const uniqueScores = useMemo(() => {
    const set = new Set();
    rules.forEach((r) => {
      if (typeof r.riskScore === "number") set.add(r.riskScore);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [rules]);

  const visibleCount = filteredAndSortedRules.length;
  const totalCount = rules.length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Risk Rules</h1>
        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-gray-600">
            System-defined rules for customer risk assessment
          </p>
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-800">{visibleCount}</span>
            {totalCount ? (
              <>
                {" "}
                of <span className="font-semibold text-gray-800">{totalCount}</span> rules
              </>
            ) : (
              " rules"
            )}
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Rule type:</span>
          <div className="inline-flex rounded-md shadow-sm border border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => setRuleType("ONBOARDING")}
              className={`px-4 py-1.5 text-sm font-medium border-r border-gray-200 ${
                ruleType === "ONBOARDING"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Onboarding
            </button>
            <button
              type="button"
              onClick={() => setRuleType("TRANSACTION_PROFILE")}
              className={`px-4 py-1.5 text-sm font-medium border-r border-gray-200 ${
                ruleType === "TRANSACTION_PROFILE"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Transaction
            </button>
            <button
              type="button"
              onClick={() => setRuleType("TRANSACTION_EVENT")}
              className={`px-4 py-1.5 text-sm font-medium ${
                ruleType === "TRANSACTION_EVENT"
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Event
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Quick search by rule, category, or logic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="h-4 w-4 mr-2 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.447.832l-4 2.5A1 1 0 019 21.5V12.414L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              {showFilters ? "Hide filters" : "Show filters"}
            </button>

            <button
              type="button"
              onClick={() => {
                setNewRule({
                  categoryId: "",
                  ruleText: "",
                  riskLogic: "",
                  riskScore: "",
                  isActive: true,
                });
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="h-4 w-4 mr-2 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Rule
        </button>
          </div>
        </div>

      </div>

      {/* Right-side filter drawer */}
      <div
        className={`fixed inset-0 z-40 flex justify-end transition-opacity duration-300 ${
          showFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`flex-1 transition-opacity duration-300 ${
            showFilters ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowFilters(false)}
        />

        {/* Panel */}
        <div
          className={`w-full max-w-md h-full bg-white shadow-xl border-l border-gray-200 flex flex-col transform transition-transform duration-300 ease-out ${
            showFilters ? "translate-x-0" : "translate-x-full"
          }`}
        >
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Filters
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Refine rules by column values
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span className="sr-only">Close filters</span>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={filters.ruleText}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, ruleText: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contains..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Category
                </label>
                <select
                  value={filters.categoryName}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      categoryName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Risk Logic
                </label>
                <select
                  value={filters.riskLogic}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      riskLogic: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {uniqueLogics.map((logic) => (
                    <option key={logic} value={logic}>
                      {logic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Risk Score
                </label>
                <select
                  value={filters.riskScore}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      riskScore: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  {uniqueScores.map((score) => (
                    <option key={score} value={score}>
                      {score}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ruleText: "",
                    categoryName: "",
                    riskLogic: "",
                    riskScore: "",
                    status: "",
                  })
                }
                className="inline-flex justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              >
                Apply
              </button>
            </div>
          </div>
      </div>

      {/* Add New Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New Rule</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRule.categoryId}
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  {uniqueCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRule.ruleName}
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, ruleName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter rule name..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Score <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRule.riskScore}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, riskScore: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select score</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="newRuleActive"
                  type="checkbox"
                  checked={newRule.isActive}
                  onChange={(e) =>
                    setNewRule((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="newRuleActive"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Active
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={adding}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  adding ||
                  !newRule.categoryId ||
                  !newRule.ruleName.trim() ||
                  newRule.riskScore === ""
                }
                onClick={async () => {
                  try {
                    setAdding(true);
                    const scoreNumber = Number(newRule.riskScore);
                    const logicMap = {
                      1: "LOW",
                      2: "MEDIUM LOW",
                      3: "MEDIUM",
                      4: "MEDIUM HIGH",
                      5: "HIGH",
                    };
                    const derivedLogic = logicMap[scoreNumber] || "LOW";

                    const payload = {
                      categoryId: newRule.categoryId,
                      ruleText: newRule.ruleName.trim(),
                      riskLogic: derivedLogic,
                      riskScore: scoreNumber,
                      isActive: newRule.isActive,
                    };

                    const result = await riskService.createRiskRule(payload);

                    if (result.success) {
                      // Reload rules list
                      const refreshed = await riskService.getRiskRules();
                      if (refreshed.success) {
                        setRules(refreshed.rules || []);
                      }
                      setShowAddModal(false);
                    } else {
                      console.error(result.error || "Failed to create rule");
                    }
                  } catch (err) {
                    console.error("Error creating rule:", err);
                  } finally {
                    setAdding(false);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Saving..." : "Add New Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => toggleSort("name")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Rule Name
                  {renderSortIcon("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th
                  onClick={() => toggleSort("score")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Risk Score
                  {renderSortIcon("score")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Logic
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                >
                  Status
                  {renderSortIcon("status")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading rules...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredAndSortedRules.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No rules found.
                  </td>
                </tr>
              )}

              {!loading && !error && paginatedRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.ruleText}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {rule.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rule.riskScore >= 60 ? 'bg-red-100 text-red-800' :
                      rule.riskScore >= 40 ? 'bg-orange-100 text-orange-800' :
                      rule.riskScore >= 20 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rule.riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {rule.riskLogic || "-"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {rule.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination */}
      {filteredAndSortedRules.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedRules.length)} of {filteredAndSortedRules.length} results
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Items per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {Math.ceil(filteredAndSortedRules.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(filteredAndSortedRules.length / itemsPerPage), prev + 1))}
                disabled={currentPage >= Math.ceil(filteredAndSortedRules.length / itemsPerPage)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskRules;
