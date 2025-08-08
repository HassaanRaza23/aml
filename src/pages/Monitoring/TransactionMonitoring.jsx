// src/pages/monitoring/TransactionMonitoring.jsx

import React, { useState, useEffect } from "react";
import { transactionService } from "../../services";
import { toast } from "react-toastify";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon, 
  FlagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";

const TransactionMonitoring = () => {
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
    riskScore: "",
    transactionType: "",
    page: 1,
    limit: 50
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);

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
  }, [filters.page, filters.limit]);

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
      riskScore: "",
      transactionType: "",
      page: 1,
      limit: 50
    });
  };

  // Flag transaction
  const flagTransaction = async (id) => {
    try {
      const result = await transactionService.flagTransaction(id, 'Manual flag from monitoring');
      if (result) {
        toast.success('Transaction flagged successfully');
        fetchTransactions(); // Refresh the list
      }
    } catch (error) {
      console.error('Error flagging transaction:', error);
      toast.error('Failed to flag transaction');
    }
  };

  // View transaction details
  const viewTransaction = async (id) => {
    try {
      const transaction = await transactionService.getTransactionById(id);
      setSelectedTransaction(transaction);
      setShowTransactionModal(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('Failed to load transaction details');
    }
  };

  // Bulk actions
  const handleBulkSelect = (id) => {
    setBulkSelected(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleBulkFlag = async () => {
    if (bulkSelected.length === 0) {
      toast.warning('Please select transactions to flag');
      return;
    }

    try {
      for (const id of bulkSelected) {
        await transactionService.flagTransaction(id, 'Bulk flag from monitoring');
      }
      toast.success(`${bulkSelected.length} transactions flagged successfully`);
      setBulkSelected([]);
      fetchTransactions();
    } catch (error) {
      console.error('Error bulk flagging transactions:', error);
      toast.error('Failed to flag some transactions');
    }
  };

  // Export transactions
  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Customer', 'Amount', 'Currency', 'Type', 'Risk Score', 'Status'],
      ...transactions.map(tx => [
        tx.transaction_date,
        `${tx.customers?.first_name} ${tx.customers?.last_name}`,
        tx.amount,
        tx.currency,
        tx.transaction_type,
        tx.risk_score,
        tx.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Transactions exported successfully');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Monitoring</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} transactions • {transactions.filter(tx => tx.status === 'Flagged').length} flagged
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportTransactions}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export
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

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Normal">Normal</option>
                <option value="Flagged">Flagged</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Risk Score</label>
              <select
                value={filters.riskScore}
                onChange={(e) => handleFilterChange('riskScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Risk Levels</option>
                <option value="0-30">Low (0-30)</option>
                <option value="31-70">Medium (31-70)</option>
                <option value="71-100">High (71-100)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {bulkSelected.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {bulkSelected.length} transaction(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkFlag}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <FlagIcon className="w-4 h-4" />
                Flag Selected
              </button>
              <button
                onClick={() => setBulkSelected([])}
                className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Transactions Table */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBulkSelected(transactions.map(tx => tx.id));
                        } else {
                          setBulkSelected([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={bulkSelected.includes(tx.id)}
                        onChange={() => handleBulkSelect(tx.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.customers ? `${tx.customers.first_name} ${tx.customers.last_name}` : 'Unknown Customer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.currency} {parseFloat(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.transaction_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.risk_score >= 70 ? 'bg-red-100 text-red-800' :
                        tx.risk_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {tx.risk_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.status === 'Flagged' ? 'bg-red-100 text-red-800' :
                        tx.status === 'Blocked' ? 'bg-gray-100 text-gray-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {tx.status === 'Flagged' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                        {tx.status === 'Normal' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewTransaction(tx.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {tx.status !== 'Flagged' && (
                          <button
                            onClick={() => flagTransaction(tx.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Flag Transaction"
                          >
                            <FlagIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {transactions.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Try adjusting your filters or add some transactions.</p>
            </div>
          )}
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

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Transaction Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{selectedTransaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{new Date(selectedTransaction.transaction_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedTransaction.transaction_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{selectedTransaction.currency} {parseFloat(selectedTransaction.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedTransaction.status === 'Flagged' ? 'text-red-600' :
                      selectedTransaction.status === 'Blocked' ? 'text-gray-600' :
                      'text-green-600'
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Score:</span>
                    <span className={`font-medium ${
                      selectedTransaction.risk_score >= 70 ? 'text-red-600' :
                      selectedTransaction.risk_score >= 40 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {selectedTransaction.risk_score}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium">
                      {selectedTransaction.customers ? 
                        `${selectedTransaction.customers.first_name} ${selectedTransaction.customers.last_name}` : 
                        'Unknown Customer'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedTransaction.customers?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-medium ${
                      selectedTransaction.customers?.risk_level === 'High' ? 'text-red-600' :
                      selectedTransaction.customers?.risk_level === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {selectedTransaction.customers?.risk_level || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Source Account:</span>
                    <span className="font-medium">{selectedTransaction.source_account || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination Account:</span>
                    <span className="font-medium">{selectedTransaction.destination_account || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{selectedTransaction.description || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Risk Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className={`font-medium ${
                      selectedTransaction.risk_score >= 70 ? 'text-red-600' :
                      selectedTransaction.risk_score >= 40 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {selectedTransaction.risk_score >= 70 ? 'High' :
                       selectedTransaction.risk_score >= 40 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(selectedTransaction.created_at).toLocaleString()}</span>
                  </div>
                  {selectedTransaction.transaction_alerts && selectedTransaction.transaction_alerts.length > 0 && (
                    <div className="mt-3">
                      <span className="text-gray-600">Alerts:</span>
                      <div className="mt-1 space-y-1">
                        {selectedTransaction.transaction_alerts.map((alert, index) => (
                          <div key={index} className="text-sm bg-red-50 p-2 rounded">
                            <span className="font-medium text-red-800">{alert.alert_type}</span>
                            <p className="text-red-600 text-xs">{alert.reason || 'No reason provided'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              {selectedTransaction.status !== 'Flagged' && (
                <button
                  onClick={() => {
                    flagTransaction(selectedTransaction.id);
                    setShowTransactionModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Flag Transaction
                </button>
              )}
              <button
                onClick={() => setShowTransactionModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionMonitoring;
