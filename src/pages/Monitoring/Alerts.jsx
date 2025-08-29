import React, { useState, useEffect } from "react";
import { alertService, transactionService } from "../../services";
import { supabase, getCurrentUser } from "../../config/supabase";
import { toast } from "react-toastify";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  EyeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  BellIcon
} from "@heroicons/react/24/outline";

const Alerts = () => {
  // State management
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    alertType: "",
    riskScore: "",
    page: 1,
    limit: 50
  });
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [bulkSelected, setBulkSelected] = useState([]);

  // Fetch alerts
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching alerts with filters:', filters);
      const result = await alertService.getAlerts(
        filters.page, 
        filters.limit, 
        filters
      );
      
      console.log('📊 Alert service result:', result);
      
      if (result.success) {
        setAlerts(result.data || []);
        setTotalCount(result.count || 0);
        console.log(`✅ Successfully loaded ${result.data?.length || 0} alerts`);
        console.log('📊 Alert data:', result.data);
      } else {
        setError(result.error || 'Failed to fetch alerts');
        toast.error('Failed to load alerts');
        console.error('❌ Alert service error:', result.error);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to fetch alerts');
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch alert statistics
  const fetchStats = async () => {
    try {
      const stats = await alertService.getAlertStats();
      setStats(stats);
    } catch (error) {
      console.error('Error fetching alert stats:', error);
    }
  };

  // Load alerts and stats on mount
  useEffect(() => {
    const initializeAlerts = async () => {
      // First, create any missing alerts for flagged transactions
      await createMissingAlerts();
      
      // Then fetch alerts and stats
      fetchAlerts();
      fetchStats();
    };
    
    initializeAlerts();
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
    fetchAlerts();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      alertType: "",
      riskScore: "",
      page: 1,
      limit: 50
    });
  };



  // View alert details
  const viewAlert = async (id) => {
    try {
      console.log('🔍 Fetching alert details for ID:', id);
      const alert = await alertService.getAlertById(id);
      console.log('📊 Alert details received:', alert);
      setSelectedAlert(alert);
      
      // Initialize form fields with current alert data
      setModalStatus(alert.status || '');
      setModalRemarks('');
      
      setShowAlertModal(true);
    } catch (error) {
      console.error('Error fetching alert details:', error);
      toast.error(`Failed to load alert details: ${error.message}`);
      
      // Try to get basic alert info from the current alerts list
      const currentAlert = alerts.find(a => a.id === id);
      if (currentAlert) {
        console.log('📊 Using current alert data as fallback:', currentAlert);
        setSelectedAlert(currentAlert);
        
        // Initialize form fields with current alert data
        setModalStatus(currentAlert.status || '');
        setModalRemarks('');
        
        setShowAlertModal(true);
      }
    }
  };

  // State for modal form
  const [modalStatus, setModalStatus] = useState('');
  const [modalRemarks, setModalRemarks] = useState('');

  // Update alert status and remarks
  const updateAlertStatus = async () => {
    if (!selectedAlert) return;
    
    try {
      console.log('🔧 Updating alert status:', {
        alertId: selectedAlert.id,
        newStatus: modalStatus,
        remarks: modalRemarks
      });
      
      const result = await alertService.updateAlertStatus(
        selectedAlert.id, 
        modalStatus, 
        modalRemarks
      );
      
      console.log('📊 Update result:', result);
      
      if (result.success) {
        toast.success('Alert status updated successfully');
        setShowAlertModal(false);
        
        // Reset form
        setModalStatus('');
        setModalRemarks('');
        
        // Refresh data
        await fetchAlerts();
        await fetchStats();
        
        console.log('✅ Alert status updated and list refreshed');
      } else {
        toast.error(result.error || 'Failed to update alert status');
      }
    } catch (error) {
      console.error('Error updating alert status:', error);
      toast.error(`Failed to update alert status: ${error.message}`);
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

  const handleBulkResolve = async () => {
    if (bulkSelected.length === 0) {
      toast.warning('Please select alerts to resolve');
      return;
    }

    try {
      for (const id of bulkSelected) {
        await alertService.updateAlertStatus(id, 'Resolved', 'Bulk resolved from alerts page');
      }
      toast.success(`${bulkSelected.length} alerts resolved successfully`);
      setBulkSelected([]);
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error bulk resolving alerts:', error);
      toast.error('Failed to resolve some alerts');
    }
  };

  // Export alerts
  const exportAlerts = () => {
    const csvContent = [
      ['Date', 'Customer', 'Alert Type', 'Severity', 'Status', 'Description'],
      ...alerts.map(alert => [
        new Date(alert.created_at).toLocaleDateString(),
        alert.transactions?.customers ? 
          `${alert.transactions.customers.first_name} ${alert.transactions.customers.last_name}` : 
          'Unknown Customer',
        alert.alert_type,
        alert.severity,
        alert.status,
        alert.description || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Alerts exported successfully');
  };

  // Create missing alerts for existing flagged transactions
  const createMissingAlerts = async () => {
    try {
      console.log('🔧 Creating alerts for flagged transactions...');
      
      const result = await alertService.createAlertsForFlaggedTransactions();
      
      if (result.success && result.createdCount > 0) {
        toast.success(result.message);
        // Refresh the alerts list
        fetchAlerts();
        fetchStats();
      }
      
    } catch (error) {
      console.error('Error creating missing alerts:', error);
      // Don't show error toast as this is automatic
    }
  };



  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} alerts • {stats?.unread || 0} unread • {stats?.highRisk || 0} high risk
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportAlerts}
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <BellIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">High Risk</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.highRisk}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.unread}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.byStatus?.Resolved || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
              <select
                value={filters.alertType}
                onChange={(e) => handleFilterChange('alertType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="High Risk Transaction">High Risk Transaction</option>
                <option value="Manual Flag">Manual Flag</option>
                <option value="Suspicious Pattern">Suspicious Pattern</option>
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
              {bulkSelected.length} alert(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkResolve}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircleIcon className="w-4 h-4" />
                Resolve Selected
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
          <span className="ml-2 text-gray-600">Loading alerts...</span>
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

      {/* Alerts Table */}
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
                          setBulkSelected(alerts.map(alert => alert.id));
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
                    Alert Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
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
            {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={bulkSelected.includes(alert.id)}
                        onChange={() => handleBulkSelect(alert.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.transactions?.customers ? 
                        `${alert.transactions.customers.first_name} ${alert.transactions.customers.last_name}` : 
                        'Unknown Customer'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {alert.alert_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {alert.severity}
                  </span>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.status === 'Open' ? 'bg-red-100 text-red-800' :
                        alert.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        alert.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status === 'Open' && <ExclamationTriangleIcon className="w-3 h-3 mr-1" />}
                        {alert.status === 'Resolved' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                        {alert.status === 'In Progress' && <ClockIcon className="w-3 h-3 mr-1" />}
                    {alert.status}
                  </span>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                        onClick={() => viewAlert(alert.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors flex items-center gap-1"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

          {/* Empty State */}
          {alerts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <BellIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
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

      {/* Alert Details Modal */}
      {showAlertModal && selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setShowAlertModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alert Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Alert Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alert ID:</span>
                    <span className="font-medium">{selectedAlert.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Created:</span>
                    <span className="font-medium">{new Date(selectedAlert.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alert Type:</span>
                    <span className="font-medium">{selectedAlert.alert_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedAlert.status === 'Open' ? 'text-red-600' :
                      selectedAlert.status === 'In Progress' ? 'text-yellow-600' :
                      selectedAlert.status === 'Resolved' ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                      {selectedAlert.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Severity:</span>
                    <span className={`font-medium ${
                      selectedAlert.severity === 'Critical' ? 'text-red-600' :
                      selectedAlert.severity === 'High' ? 'text-orange-600' :
                      selectedAlert.severity === 'Medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {selectedAlert.severity}
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
                      {selectedAlert.transactions?.customers ? 
                        `${selectedAlert.transactions.customers.first_name} ${selectedAlert.transactions.customers.last_name}` : 
                        'Unknown Customer'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer ID:</span>
                    <span className="font-medium">{selectedAlert.customer_id}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Transaction Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium">{selectedAlert.transaction_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {selectedAlert.transactions ? 
                        `${selectedAlert.transactions.currency} ${parseFloat(selectedAlert.transactions.amount).toLocaleString()}` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedAlert.transactions?.transaction_type || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Alert Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Alert Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Description:</span>
                    <span className="font-medium">{selectedAlert.description || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alert Type:</span>
                    <span className="font-medium">{selectedAlert.alert_type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Severity:</span>
                    <span className="font-medium">{selectedAlert.severity || 'N/A'}</span>
                  </div>
                  {selectedAlert.resolved_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved At:</span>
                      <span className="font-medium">{new Date(selectedAlert.resolved_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Update Form */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Update Alert Status</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks/Justification
                  </label>
                  <textarea
                    value={modalRemarks}
                    onChange={(e) => setModalRemarks(e.target.value)}
                    placeholder="Enter remarks or justification for the status change..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAlertModal(false);
                  setModalStatus('');
                  setModalRemarks('');
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
                <button
                onClick={updateAlertStatus}
                disabled={!modalStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Save Changes
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;

