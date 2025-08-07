import React, { useState } from 'react';

const ReportList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([
    {
      id: 'RPT-0143',
      customer: 'John & Sons Ltd',
      reportType: 'Suspicious Transaction Report',
      format: 'PDF',
      createdAt: '2025-08-07 17:30',
      isGoAML: false,
      uploaded: false,
    },
    {
      id: 'RPT-0144',
      customer: 'Zia Enterprises',
      reportType: 'goAML XML Report',
      format: 'XML',
      createdAt: '2025-08-07 18:00',
      isGoAML: true,
      uploaded: false,
    },
    {
      id: 'RPT-0145',
      customer: 'ABC Corp',
      reportType: 'Risk Profile Report',
      format: 'PDF',
      createdAt: '2025-08-07 19:00',
      isGoAML: false,
      uploaded: false,
    },
  ]);

  const handleMarkAsUploaded = (id) => {
    const updatedReports = reports.map((report) =>
      report.id === id ? { ...report, uploaded: true } : report
    );
    setReports(updatedReports);
  };

  const filteredReports = reports.filter((report) =>
    report.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Generated Reports</h2>

      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 border rounded-md w-64"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Report ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Report Type</th>
              <th className="px-4 py-2 text-left">Format</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Uploaded Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id} className="border-t">
                <td className="px-4 py-2">{report.id}</td>
                <td className="px-4 py-2">{report.customer}</td>
                <td className="px-4 py-2">{report.reportType}</td>
                <td className="px-4 py-2">{report.format}</td>
                <td className="px-4 py-2">{report.createdAt}</td>
                <td className="px-4 py-2">
                  {report.isGoAML ? (
                    report.uploaded ? (
                      <span className="text-green-600 font-medium">✅ Uploaded</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">Not Uploaded</span>
                    )
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                    Print
                  </button>
                  <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">
                    Download
                  </button>
                  {report.isGoAML && !report.uploaded && (
                    <button
                      onClick={() => handleMarkAsUploaded(report.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Mark as Uploaded
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredReports.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportList;
