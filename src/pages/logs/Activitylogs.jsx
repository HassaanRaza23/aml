import React, { useState } from 'react';

const dummyLogs = [
  {
    timestamp: '2025-08-07 11:10 AM',
    user: 'Ahmed Ali',
    action: 'Updated',
    module: 'Customer',
    details: 'Updated KYC for John Doe',
  },
  {
    timestamp: '2025-08-07 10:45 AM',
    user: 'Fatima Zahra',
    action: 'Submitted',
    module: 'Report',
    details: 'Submitted goAML XML STR',
  },
  {
    timestamp: '2025-08-07 10:15 AM',
    user: 'System',
    action: 'Auto-Flagged',
    module: 'Monitoring',
    details: 'Flagged transaction TXN1234',
  },
];

const ActivityLogs = () => {
  const [logs, setLogs] = useState(dummyLogs);
  const [filters, setFilters] = useState({
    user: '',
    module: '',
    action: '',
    fromDate: '',
    toDate: '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredLogs = logs.filter((log) => {
    return (
      (filters.user === '' || log.user.toLowerCase().includes(filters.user.toLowerCase())) &&
      (filters.module === '' || log.module === filters.module) &&
      (filters.action === '' || log.action === filters.action)
    );
  });

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
        </select>
        {/* Date filters can be extended */}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <th className="px-4 py-2 border">Timestamp</th>
              <th className="px-4 py-2 border">User</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Module</th>
              <th className="px-4 py-2 border">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index} className="text-sm border-t">
                <td className="px-4 py-2 border">{log.timestamp}</td>
                <td className="px-4 py-2 border">{log.user}</td>
                <td className="px-4 py-2 border">{log.action}</td>
                <td className="px-4 py-2 border">{log.module}</td>
                <td className="px-4 py-2 border">{log.details}</td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;
