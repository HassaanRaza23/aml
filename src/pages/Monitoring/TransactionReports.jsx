// src/pages/Monitoring/TransactionReports.jsx

import React, { useState, useEffect } from "react";
import { transactionService } from "../../services";
import { toast } from "react-toastify";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const TransactionReports = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    xmlGenerated: "", // "yes", "no", or "" for all
    page: 1,
    limit: 100
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);

  // Get customer display name helper
  const getCustomerDisplayName = (customer) => {
    if (!customer) return 'Unknown Customer';
    
    if (customer.customer_type === 'Natural Person' && customer.natural_person_details) {
      const firstName = customer.natural_person_details.firstname || '';
      const lastName = customer.natural_person_details.lastname || '';
      return `${firstName} ${lastName}`.trim() || 'Natural Person';
    } else if (customer.customer_type === 'Legal Entities' && customer.legal_entity_details) {
      return customer.legal_entity_details.legalname || customer.legal_entity_details.alias || 'Legal Entity';
    }
    // Fallback
    if (customer.first_name && customer.last_name) {
      return `${customer.first_name} ${customer.last_name}`.trim();
    }
    return customer.first_name || customer.alias || 'Customer';
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await transactionService.getTransactions(
        filters.page, 
        filters.limit, 
        filters
      );
      
      if (result.success) {
        setTransactions(result.data || []);
        setTotalCount(result.count || 0);
      } else {
        setError(result.error || 'Failed to fetch transactions');
        toast.error('Failed to load transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on mount and filter changes
  useEffect(() => {
    fetchTransactions();
  }, [filters.page, filters.limit, filters.status]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchTransactions();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      xmlGenerated: "",
      page: 1,
      limit: 100
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Customer', 'Amount', 'Currency', 'Payment Mode', 'Reference Number', 'Status', 'Transaction Product', 'Purpose'],
      ...transactions.map(tx => {
        const customer = tx.customers || {};
        const customerName = getCustomerDisplayName(customer);
        return [
          new Date(tx.transaction_date).toLocaleDateString(),
          customerName,
          parseFloat(tx.invoice_amount || tx.amount || 0).toLocaleString(),
          tx.currency || 'N/A',
          tx.payment_mode || tx.transaction_type || 'N/A',
          tx.internal_reference_number || 'N/A',
          tx.status || 'N/A',
          tx.transaction_product || 'N/A',
          tx.transaction_purpose || 'N/A'
        ];
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transaction-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported successfully');
  };

  // Get status counts
  const getStatusCounts = () => {
    const counts = {
      Total: transactions.length,
      Pending: 0,
      Approved: 0,
      Rejected: 0
    };
    
    transactions.forEach(tx => {
      const status = (tx.status || '').toLowerCase();
      if (status === 'pending') counts.Pending++;
      else if (status === 'approved') counts.Approved++;
      else if (status === 'rejected') counts.Rejected++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Reports</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Status Summary Cards */}
      {!loading && !error && transactions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Total</div>
            <div className="text-2xl font-bold text-blue-800">{statusCounts.Total}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">Pending</div>
            <div className="text-2xl font-bold text-yellow-800">{statusCounts.Pending}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Approved</div>
            <div className="text-2xl font-bold text-green-800">{statusCounts.Approved}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Rejected</div>
            <div className="text-2xl font-bold text-red-800">{statusCounts.Rejected}</div>
          </div>
        </div>
      )}

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
              <h2 className="text-base font-semibold text-gray-900">Filters</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Filter transactions by criteria
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
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Normal">Normal</option>
                <option value="Flagged">Flagged</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                XML Generated
              </label>
              <select
                value={filters.xmlGenerated}
                onChange={(e) => handleFilterChange('xmlGenerated', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>

          <div className="px-5 py-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={() => {
                applyFilters();
                setShowFilters(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                clearFilters();
                setShowFilters(false);
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading transactions...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Transactions Report Table */}
      {!loading && !error && (
        <div className="overflow-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Currency</th>
                <th className="p-4 font-medium">Payment Mode</th>
                <th className="p-4 font-medium">Reference Number</th>
                <th className="p-4 font-medium">Transaction Product</th>
                <th className="p-4 font-medium">Purpose</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">XML Generated</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-500">Try adjusting your filters.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const customer = tx.customers || {};
                  const customerName = getCustomerDisplayName(customer);
                  
                  return (
                    <tr
                      key={tx.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-gray-900">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-900">{customerName}</td>
                      <td className="p-4 text-gray-900">
                        {parseFloat(tx.invoice_amount || tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-900">{tx.currency || 'N/A'}</td>
                      <td className="p-4 text-gray-900">{tx.payment_mode || tx.transaction_type || 'N/A'}</td>
                      <td className="p-4 text-gray-900">{tx.internal_reference_number || 'N/A'}</td>
                      <td className="p-4 text-gray-900">{tx.transaction_product || 'N/A'}</td>
                      <td className="p-4 text-gray-900">{tx.transaction_purpose || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (tx.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (tx.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                          (tx.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                          (tx.status || '').toLowerCase() === 'flagged' ? 'bg-orange-100 text-orange-800' :
                          (tx.status || '').toLowerCase() === 'blocked' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {tx.status || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4">
                        {(tx.status || '').toLowerCase() === 'approved' ? (
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.xml_generated_at 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {tx.xml_generated_at ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Yes
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                  No
                                </>
                              )}
                            </span>
                            {tx.xml_generated_at && (
                              <span className="text-xs text-gray-500" title={new Date(tx.xml_generated_at).toLocaleString()}>
                                {new Date(tx.xml_generated_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalCount > filters.limit && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, totalCount)} of {totalCount} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page * filters.limit >= totalCount}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionReports;

