import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { caseService } from "../../services/caseService";
import { toast } from "react-toastify";

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [caseDetails, setCaseDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(new Set());
  const [updatingCase, setUpdatingCase] = useState(null);
  const [updateForm, setUpdateForm] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    byStatus: { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 },
    byRiskLevel: { Low: 0, Medium: 0, High: 0 },
    byType: { Screening: 0, Transaction: 0, KYC: 0 }
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
    fetchStats();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const result = await caseService.getCases(1, 100);
      if (result && result.data) {
        setCases(result.data || []);
        setError(null);
      } else {
        const errorMsg = result?.error || 'Failed to fetch cases';
        setError(errorMsg);
        setCases([]);
        console.error('Error fetching cases:', result);
      }
    } catch (error) {
      const errorMsg = error?.message || error?.toString() || 'Failed to fetch cases';
      setError(errorMsg);
      setCases([]);
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await caseService.getCaseStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredCases = cases.filter((c) =>
    `${c.customers?.first_name} ${c.customers?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.case_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRow = async (caseId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
      // Fetch case details if not already loaded
      if (!caseDetails[caseId]) {
        setLoadingDetails(new Set([...loadingDetails, caseId]));
        try {
          const details = await caseService.getCaseById(caseId);
          setCaseDetails({ ...caseDetails, [caseId]: details });
        } catch (error) {
          console.error('Error fetching case details:', error);
          toast.error('Failed to load case details');
        } finally {
          const newLoading = new Set(loadingDetails);
          newLoading.delete(caseId);
          setLoadingDetails(newLoading);
        }
      }
    }
    setExpandedRows(newExpanded);
  };

  const handleUpdateCase = async (caseId) => {
    setUpdatingCase(caseId);
    try {
      const formData = updateForm[caseId] || {};
      
      if (formData.status) {
        await caseService.updateCaseStatus(caseId, formData.status, formData.notes || '');
        toast.success('Case status updated successfully');
      } else if (formData.notes) {
        await caseService.addCaseAction(caseId, {
          action_type: 'Comment',
          description: 'Internal comment added',
          notes: formData.notes
        });
        toast.success('Comment added successfully');
      }

      // Refresh cases and stats
      await fetchCases();
      await fetchStats();
      
      // Clear form
      const newForm = { ...updateForm };
      delete newForm[caseId];
      setUpdateForm(newForm);
      
      // Refresh case details
      const details = await caseService.getCaseById(caseId);
      setCaseDetails({ ...caseDetails, [caseId]: details });
    } catch (error) {
      console.error('Error updating case:', error);
      toast.error('Failed to update case');
    } finally {
      setUpdatingCase(null);
    }
  };

  const handleFormChange = (caseId, field, value) => {
    setUpdateForm({
      ...updateForm,
      [caseId]: {
        ...updateForm[caseId],
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p className="font-medium">Error message:</p>
                <p className="mt-1">{error}</p>
                <p className="mt-2 text-xs text-red-600">
                  This could be due to:
                  <ul className="list-disc list-inside mt-1">
                    <li>The cases table not existing in the database</li>
                    <li>Missing foreign key relationship with customers table</li>
                    <li>Database connection issues</li>
                  </ul>
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setError(null);
                    fetchCases();
                    fetchStats();
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Cases</h1>
        <p className="text-gray-600 mt-1">View case details and fix issues</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Cases</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byStatus.Open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byStatus['In Progress']}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.byStatus.Resolved}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by customer name or case number..."
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
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCases.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRow(c.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {expandedRows.has(c.id) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.case_number || c.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {c.customers?.first_name?.charAt(0)}{c.customers?.last_name?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {c.customers?.first_name} {c.customers?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{c.customers?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {c.case_type || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.priority === "High" || c.priority === "Critical" ? 'bg-red-100 text-red-800' :
                        c.priority === "Medium" ? 'bg-orange-100 text-orange-800' :
                        c.priority === "Low" ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.priority || 'Not Set'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.status === "Open" ? 'bg-blue-100 text-blue-800' :
                        c.status === "In Progress" ? 'bg-yellow-100 text-yellow-800' :
                        c.status === "Resolved" ? 'bg-green-100 text-green-800' :
                        c.status === "Closed" ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {c.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {c.assigned_to || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => navigate(`/cases/details/${c.id}`)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(c.id) && (
                    <tr>
                      <td colSpan="9" className="px-6 py-4 bg-gray-50">
                        {loadingDetails.has(c.id) ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading case details...</span>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* Case Details */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Case Number</p>
                                  <p className="text-sm text-gray-900">{caseDetails[c.id]?.case_number || c.case_number || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Description</p>
                                  <p className="text-sm text-gray-900">{caseDetails[c.id]?.description || c.description || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Created At</p>
                                  <p className="text-sm text-gray-900">
                                    {caseDetails[c.id]?.created_at 
                                      ? new Date(caseDetails[c.id].created_at).toLocaleString() 
                                      : c.created_at 
                                        ? new Date(c.created_at).toLocaleString() 
                                        : 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                  <p className="text-sm text-gray-900">
                                    {caseDetails[c.id]?.updated_at 
                                      ? new Date(caseDetails[c.id].updated_at).toLocaleString() 
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Case Actions History */}
                            {caseDetails[c.id]?.case_actions && caseDetails[c.id].case_actions.length > 0 && (
                              <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Action History</h3>
                                <div className="space-y-3">
                                  {caseDetails[c.id].case_actions.map((action, idx) => (
                                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{action.action_type}</p>
                                          <p className="text-sm text-gray-600">{action.description}</p>
                                          {action.notes && (
                                            <p className="text-sm text-gray-500 mt-1">{action.notes}</p>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          {action.created_at ? new Date(action.created_at).toLocaleString() : ''}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Fix Issues Form */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fix Issues</h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Update Status
                                  </label>
                                  <select
                                    value={updateForm[c.id]?.status || c.status || ''}
                                    onChange={(e) => handleFormChange(c.id, 'status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">Select Status</option>
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Add Comment / Notes
                                  </label>
                                  <textarea
                                    value={updateForm[c.id]?.notes || ''}
                                    onChange={(e) => handleFormChange(c.id, 'notes', e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add your notes, findings, or updates here..."
                                  />
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleUpdateCase(c.id)}
                                    disabled={updatingCase === c.id}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                  >
                                    {updatingCase === c.id ? 'Updating...' : 'Update Case'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'No cases match your search criteria.' : 'No cases have been created yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CaseList;
