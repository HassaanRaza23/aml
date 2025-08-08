import React, { useState, useEffect } from "react";
import { systemLogService } from "../../services/systemLogService";
import { toast } from "react-toastify";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    statusStats: {}
  });
  const [filters, setFilters] = useState({
    status: "",
    module: "",
    eventType: "",
    fromDate: "",
    toDate: "",
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await systemLogService.getSystemLogs(filters);
      if (response.success) {
        setLogs(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch logs');
        toast.error('Failed to fetch system logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch logs');
      toast.error('Failed to fetch system logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await systemLogService.getSystemLogStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      module: "",
      eventType: "",
      fromDate: "",
      toDate: "",
    });
  };

  const refreshLogs = () => {
    fetchLogs();
    fetchStats();
  };

  const filteredLogs = logs;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">System Logs</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Total Events</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Today</div>
          <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">This Week</div>
          <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.statusStats.Success || 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="status"
            className="border rounded p-2"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="In Progress">In Progress</option>
          </select>

          <select
            name="module"
            className="border rounded p-2"
            value={filters.module}
            onChange={handleFilterChange}
          >
            <option value="">All Modules</option>
            <option value="Screening">Screening</option>
            <option value="Reports">Reports</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Risk">Risk</option>
            <option value="Customer">Customer</option>
            <option value="Case">Case</option>
            <option value="KYC">KYC</option>
          </select>

          <input
            type="text"
            name="eventType"
            placeholder="Event Type"
            value={filters.eventType}
            onChange={handleFilterChange}
            className="border rounded p-2"
          />

          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className="border rounded p-2"
            placeholder="From Date"
          />

          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className="border rounded p-2"
            placeholder="To Date"
          />
        </form>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleFilterSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
          <button
            onClick={refreshLogs}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system logs...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm font-medium text-gray-700">
                  <th className="px-6 py-3 border-b">Log ID</th>
                  <th className="px-6 py-3 border-b">Event Type</th>
                  <th className="px-6 py-3 border-b">Description</th>
                  <th className="px-6 py-3 border-b">Timestamp</th>
                  <th className="px-6 py-3 border-b">Status</th>
                  <th className="px-6 py-3 border-b">Trigger Type</th>
                  <th className="px-6 py-3 border-b">Module</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No system logs found</p>
                        <p className="text-sm">Try adjusting your filters or check back later.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="text-sm hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.eventType}</td>
                      <td className="px-6 py-4 text-gray-900">{log.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.triggerType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.module}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
