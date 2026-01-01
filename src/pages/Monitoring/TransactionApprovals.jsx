// src/pages/Monitoring/TransactionApprovals.jsx

import React, { useState, useEffect } from "react";
import { transactionService } from "../../services";
import { toast } from "react-toastify";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import { 
  paymentModes, 
  transactionPurposes, 
  transactionProducts, 
  sourceOfFunds,
  channelOptions,
  statusCodes,
  itemTypes,
  executedByOptions,
  yesNoOptions
} from "../../data/dropdownOptions";
import { currencies } from "../../data/currencies";

const TransactionApprovals = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filter state - default to showing all transactions
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "", // Default to all transactions
    page: 1,
    limit: 50
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionToReject, setTransactionToReject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
      status: "", // Show all transactions
      page: 1,
      limit: 50
    });
  };

  // View transaction details
  const viewTransaction = async (id) => {
    try {
      const transaction = await transactionService.getTransactionById(id);
      setSelectedTransaction(transaction);
      setIsEditMode(false);
      setEditFormData({});
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('Failed to load transaction details');
    }
  };

  // Enter edit mode
  const enterEditMode = () => {
    if (!selectedTransaction) return;
    
    // Map transaction data to form data (snake_case to camelCase)
    const formData = {
      descriptionOfReport: selectedTransaction.description_of_report || "",
      actionTakenByReportingEntity: selectedTransaction.action_taken_by_reporting_entity || "",
      date: selectedTransaction.transaction_date ? new Date(selectedTransaction.transaction_date).toISOString().split('T')[0] : "",
      internalReferenceNumber: selectedTransaction.internal_reference_number || "",
      transactionProduct: selectedTransaction.transaction_product || "",
      paymentMode: selectedTransaction.payment_mode || "",
      channel: selectedTransaction.channel || "",
      sourceOfFunds: selectedTransaction.source_of_funds || "",
      transactionPurpose: selectedTransaction.transaction_purpose || "",
      currency: selectedTransaction.currency || "",
      rate: selectedTransaction.rate || "",
      invoiceAmount: selectedTransaction.invoice_amount || "",
      itemType: selectedTransaction.item_type || "",
      statusCode: selectedTransaction.status_code || "",
      reason: selectedTransaction.reason || "",
      description: selectedTransaction.description || "",
      beneficiaryName: selectedTransaction.beneficiary_name || "",
      beneficiaryComments: selectedTransaction.beneficiary_comments || "",
      lateDeposit: selectedTransaction.late_deposit || "",
      branch: selectedTransaction.branch || "",
      indemnifiedForRepatriation: selectedTransaction.indemnified_for_repatriation || "",
      executedBy: selectedTransaction.executed_by || "",
      amountLc: selectedTransaction.amount_lc || "",
      estimatedAmount: selectedTransaction.estimated_amount || "",
      itemSize: selectedTransaction.item_size || "",
      itemUnit: selectedTransaction.item_unit || "",
      statusComments: selectedTransaction.status_comments || "",
      carrierName: selectedTransaction.carrier_name || "",
      carrierDetails: selectedTransaction.carrier_details || "",
      isStrIstr: selectedTransaction.is_str_istr || false
    };
    
    setEditFormData(formData);
    setIsEditMode(true);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({});
  };

  // Save edited transaction
  const saveEditedTransaction = async () => {
    if (!selectedTransaction) return;
    
    setIsSaving(true);
    try {
      // Map form data back to database format (camelCase to snake_case)
      const updateData = {
        description_of_report: editFormData.descriptionOfReport,
        action_taken_by_reporting_entity: editFormData.actionTakenByReportingEntity,
        transaction_date: editFormData.date ? new Date(editFormData.date).toISOString() : selectedTransaction.transaction_date,
        internal_reference_number: editFormData.internalReferenceNumber,
        transaction_product: editFormData.transactionProduct,
        payment_mode: editFormData.paymentMode,
        channel: editFormData.channel,
        source_of_funds: editFormData.sourceOfFunds,
        transaction_purpose: editFormData.transactionPurpose,
        currency: editFormData.currency,
        rate: editFormData.rate ? parseFloat(editFormData.rate) : null,
        invoice_amount: editFormData.invoiceAmount ? parseFloat(editFormData.invoiceAmount) : null,
        item_type: editFormData.itemType,
        status_code: editFormData.statusCode,
        reason: editFormData.reason,
        description: editFormData.description,
        beneficiary_name: editFormData.beneficiaryName || null,
        beneficiary_comments: editFormData.beneficiaryComments || null,
        late_deposit: editFormData.lateDeposit || null,
        branch: editFormData.branch || null,
        indemnified_for_repatriation: editFormData.indemnifiedForRepatriation || null,
        executed_by: editFormData.executedBy || null,
        amount_lc: editFormData.amountLc ? parseFloat(editFormData.amountLc) : null,
        estimated_amount: editFormData.estimatedAmount ? parseFloat(editFormData.estimatedAmount) : null,
        item_size: editFormData.itemSize || null,
        item_unit: editFormData.itemUnit || null,
        status_comments: editFormData.statusComments || null,
        carrier_name: editFormData.carrierName || null,
        carrier_details: editFormData.carrierDetails || null,
        is_str_istr: editFormData.isStrIstr || false
      };

      await transactionService.updateTransaction(selectedTransaction.id, updateData);
      toast.success('Transaction updated successfully');
      
      // Refresh transaction data
      const updatedTransaction = await transactionService.getTransactionById(selectedTransaction.id);
      setSelectedTransaction(updatedTransaction);
      setIsEditMode(false);
      setEditFormData({});
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    } finally {
      setIsSaving(false);
    }
  };

  // Approve transaction
  const handleApprove = async (id) => {
    try {
      await transactionService.approveTransaction(id);
      toast.success('Transaction approved successfully');
      setShowModal(false);
      setSelectedTransaction(null);
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
    }
  };

  // Open reject modal
  const openRejectModal = (id) => {
    setTransactionToReject(id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Reject transaction
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    try {
      await transactionService.rejectTransaction(transactionToReject, rejectionReason);
      toast.success('Transaction rejected successfully');
      setShowRejectModal(false);
      setRejectionReason("");
      setTransactionToReject(null);
      setShowModal(false);
      setSelectedTransaction(null);
      fetchTransactions(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Approvals</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} transaction{totalCount !== 1 ? 's' : ''} total
            {filters.status === 'Pending' && (
              <span> • {transactions.filter(tx => tx.status === 'Pending').length} pending</span>
            )}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FunnelIcon className="w-4 h-4" />
          Filters
        </button>
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

      {/* Transactions Table */}
      {!loading && !error && (
        <div className="overflow-auto bg-white rounded-xl shadow border">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 border-b">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Payment Mode</th>
                <th className="p-4 font-medium">Reference Number</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                    <p className="text-gray-500">There are no pending transactions awaiting approval.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const customer = tx.customers || {};
                  const customerName = getCustomerDisplayName(customer);
                  
                  return (
                    <tr
                      key={tx.id}
                      className="border-b hover:bg-blue-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                      onClick={() => viewTransaction(tx.id)}
                    >
                      <td className="p-4 text-gray-900">
                        {new Date(tx.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-gray-900">{customerName}</td>
                      <td className="p-4 text-gray-900">
                        {tx.currency} {parseFloat(tx.invoice_amount || tx.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-gray-900">{tx.payment_mode || tx.transaction_type || 'N/A'}</td>
                      <td className="p-4 text-gray-900">{tx.internal_reference_number || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (tx.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          (tx.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                          (tx.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tx.status}
                        </span>
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

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={() => {
          if (!isEditMode) {
            setShowModal(false);
            setSelectedTransaction(null);
            setIsEditMode(false);
            setEditFormData({});
          }
        }}>
          <div className="relative w-full max-w-6xl bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Transaction' : 'Transaction Details'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedTransaction(null);
                  setIsEditMode(false);
                  setEditFormData({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6">

            {isEditMode ? (
              // Edit Form
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Transaction Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                          <input
                            type="date"
                            value={editFormData.date || ""}
                            onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Product <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.transactionProduct || ""}
                            onChange={(e) => setEditFormData({...editFormData, transactionProduct: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {transactionProducts.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.paymentMode || ""}
                            onChange={(e) => setEditFormData({...editFormData, paymentMode: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {paymentModes.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Channel <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.channel || ""}
                            onChange={(e) => setEditFormData({...editFormData, channel: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {channelOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.sourceOfFunds || ""}
                            onChange={(e) => setEditFormData({...editFormData, sourceOfFunds: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {sourceOfFunds.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Purpose <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.transactionPurpose || ""}
                            onChange={(e) => setEditFormData({...editFormData, transactionPurpose: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {transactionPurposes.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Currency <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.currency || ""}
                            onChange={(e) => setEditFormData({...editFormData, currency: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {currencies.sort((a, b) => a.name.localeCompare(b.name)).map(currency => (
                              <option key={currency.code} value={currency.code}>{currency.name} ({currency.code})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Rate <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            step="0.0001"
                            value={editFormData.rate || ""}
                            onChange={(e) => setEditFormData({...editFormData, rate: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.0000"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.invoiceAmount || ""}
                            onChange={(e) => setEditFormData({...editFormData, invoiceAmount: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Amount LC</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.amountLc || ""}
                            onChange={(e) => setEditFormData({...editFormData, amountLc: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Amount</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editFormData.estimatedAmount || ""}
                            onChange={(e) => setEditFormData({...editFormData, estimatedAmount: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Item Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Type <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.itemType || ""}
                            onChange={(e) => setEditFormData({...editFormData, itemType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {itemTypes.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Size</label>
                          <input
                            type="text"
                            value={editFormData.itemSize || ""}
                            onChange={(e) => setEditFormData({...editFormData, itemSize: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Item Unit</label>
                          <input
                            type="text"
                            value={editFormData.itemUnit || ""}
                            onChange={(e) => setEditFormData({...editFormData, itemUnit: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status Code <span className="text-red-500">*</span></label>
                          <select
                            value={editFormData.statusCode || ""}
                            onChange={(e) => setEditFormData({...editFormData, statusCode: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="">Select...</option>
                            {statusCodes.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status Comments</label>
                          <textarea
                            value={editFormData.statusComments || ""}
                            onChange={(e) => setEditFormData({...editFormData, statusComments: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Late Deposit</label>
                          <select
                            value={editFormData.lateDeposit || ""}
                            onChange={(e) => setEditFormData({...editFormData, lateDeposit: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select...</option>
                            {yesNoOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                          <input
                            type="text"
                            value={editFormData.branch || ""}
                            onChange={(e) => setEditFormData({...editFormData, branch: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Indemnified for Repatriation</label>
                          <select
                            value={editFormData.indemnifiedForRepatriation || ""}
                            onChange={(e) => setEditFormData({...editFormData, indemnifiedForRepatriation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select...</option>
                            {yesNoOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Executed By</label>
                          <select
                            value={editFormData.executedBy || ""}
                            onChange={(e) => setEditFormData({...editFormData, executedBy: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select...</option>
                            {executedByOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <div className="h-7 mb-2"></div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isStrIstr"
                              checked={editFormData.isStrIstr || false}
                              onChange={(e) => setEditFormData({...editFormData, isStrIstr: e.target.checked})}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="isStrIstr" className="ml-2 text-sm font-medium text-gray-700 cursor-pointer">
                              Is STR/ISTR
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description of Report <span className="text-red-500">*</span></label>
                          <textarea
                            value={editFormData.descriptionOfReport || ""}
                            onChange={(e) => setEditFormData({...editFormData, descriptionOfReport: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken by Reporting Entity <span className="text-red-500">*</span></label>
                          <textarea
                            value={editFormData.actionTakenByReportingEntity || ""}
                            onChange={(e) => setEditFormData({...editFormData, actionTakenByReportingEntity: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Internal Reference Number <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={editFormData.internalReferenceNumber || ""}
                            onChange={(e) => setEditFormData({...editFormData, internalReferenceNumber: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Beneficiary Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Name</label>
                          <input
                            type="text"
                            value={editFormData.beneficiaryName || ""}
                            onChange={(e) => setEditFormData({...editFormData, beneficiaryName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary Comments</label>
                          <textarea
                            value={editFormData.beneficiaryComments || ""}
                            onChange={(e) => setEditFormData({...editFormData, beneficiaryComments: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Carrier Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier Name</label>
                          <input
                            type="text"
                            value={editFormData.carrierName || ""}
                            onChange={(e) => setEditFormData({...editFormData, carrierName: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Carrier Details</label>
                          <textarea
                            value={editFormData.carrierDetails || ""}
                            onChange={(e) => setEditFormData({...editFormData, carrierDetails: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
                          <textarea
                            value={editFormData.reason || ""}
                            onChange={(e) => setEditFormData({...editFormData, reason: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                          <textarea
                            value={editFormData.description || ""}
                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              // Read-only View
              <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Transaction Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedTransaction.transaction_date).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Product:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.transaction_product || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Mode:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.payment_mode || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Channel:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.channel || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source of Funds:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.source_of_funds || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Purpose:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.transaction_purpose || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Currency:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.currency || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.rate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice Amount:</span>
                      <span className="font-medium text-gray-900">
                        {selectedTransaction.currency} {parseFloat(selectedTransaction.invoice_amount || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount LC:</span>
                      <span className="font-medium text-gray-900">
                        {selectedTransaction.amount_lc ? parseFloat(selectedTransaction.amount_lc).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Amount:</span>
                      <span className="font-medium text-gray-900">
                        {selectedTransaction.estimated_amount ? parseFloat(selectedTransaction.estimated_amount).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Item Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item Type:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.item_type || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item Size:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.item_size || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Item Unit:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.item_unit || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Code:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.status_code || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status Comments:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.status_comments || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Late Deposit:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.late_deposit || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Branch:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.branch || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Indemnified for Repatriation:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.indemnified_for_repatriation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Executed By:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.executed_by || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Is STR/ISTR:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.is_str_istr ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer:</span>
                      <span className="font-medium text-gray-900">{getCustomerDisplayName(selectedTransaction.customers)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer Type:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.customers?.customer_type || 'N/A'}</span>
                    </div>
                    {selectedTransaction.director_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Director/Representative:</span>
                        <span className="font-medium text-gray-900">{selectedTransaction.director_name || 'N/A'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Beneficiary Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beneficiary Name:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.beneficiary_name || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Beneficiary Comments:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.beneficiary_comments || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Carrier Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carrier Name:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.carrier_name || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Carrier Details:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.carrier_details || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Description of Report:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.description_of_report || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Action Taken by Reporting Entity:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.action_taken_by_reporting_entity || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internal Reference Number:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.internal_reference_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Additional Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Reason:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.reason || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-600 mb-1">Description:</span>
                      <span className="font-medium text-gray-900">{selectedTransaction.description || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            </div>

            {/* Footer with Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {isEditMode ? (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelEdit}
                    disabled={isSaving}
                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditedTransaction}
                    disabled={isSaving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              ) : selectedTransaction.status === 'Pending' ? (
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => openRejectModal(selectedTransaction.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject
                  </button>
                  <button
                    onClick={enterEditMode}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleApprove(selectedTransaction.id)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Approve
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Reject Transaction Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => {
          setShowRejectModal(false);
          setRejectionReason("");
          setTransactionToReject(null);
        }}>
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Reject Transaction</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setTransactionToReject(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please provide a reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                  setTransactionToReject(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <XCircleIcon className="w-5 h-5" />
                Reject Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionApprovals;
