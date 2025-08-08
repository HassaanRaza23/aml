import React, { useState, useEffect } from 'react';
import { activityLogService } from '../../services/activityLogService';
import { toast } from 'react-toastify';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    actionStats: {}
  });
  const [filters, setFilters] = useState({
    user: '',
    module: '',
    action: '',
    fromDate: '',
    toDate: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await activityLogService.getActivityLogs(filters);
      if (response.success) {
        setLogs(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch logs');
        toast.error('Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch logs');
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await activityLogService.getActivityLogStats();
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

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const clearFilters = () => {
    setFilters({
      user: '',
      module: '',
      action: '',
      fromDate: '',
      toDate: '',
    });
  };

  const filteredLogs = logs;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="text-sm text-gray-600">Total Logs</div>
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
          <div className="text-sm text-gray-600">Actions</div>
          <div className="text-2xl font-bold text-purple-600">
            {Object.keys(stats.actionStats).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="user"
            placeholder="Search by user"
            value={filters.user}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <select
            name="module"
            value={filters.module}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Modules</option>
            <option value="Customer">Customer</option>
            <option value="Screening">Screening</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Report">Report</option>
            <option value="System">System</option>
            <option value="KYC">KYC</option>
            <option value="Case">Case</option>
            <option value="Risk">Risk</option>
          </select>
          <select
            name="action"
            value={filters.action}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Actions</option>
            <option value="Created">Created</option>
            <option value="Updated">Updated</option>
            <option value="Deleted">Deleted</option>
            <option value="Submitted">Submitted</option>
            <option value="Auto-Flagged">Auto-Flagged</option>
            <option value="Login">Login</option>
            <option value="Assessed">Assessed</option>
            <option value="Flagged">Flagged</option>
          </select>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
            placeholder="From Date"
          />
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
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
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white p-8 rounded-lg shadow border text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity logs...</p>
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
                  <th className="px-6 py-3 border-b">Timestamp</th>
                  <th className="px-6 py-3 border-b">User</th>
                  <th className="px-6 py-3 border-b">Action</th>
                  <th className="px-6 py-3 border-b">Module</th>
                  <th className="px-6 py-3 border-b">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log, index) => (
                  <tr key={log.id || index} className="text-sm hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.action === 'Created' ? 'bg-green-100 text-green-800' :
                        log.action === 'Updated' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'Deleted' ? 'bg-red-100 text-red-800' :
                        log.action === 'Flagged' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{log.module}</td>
                    <td className="px-6 py-4 text-gray-900">{log.details}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">No activity logs found</p>
                        <p className="text-sm">Try adjusting your filters or check back later.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
