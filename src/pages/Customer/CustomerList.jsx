import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { customerService } from "../../services";
import OnboardingForm from "./OnboardingForm";

const CustomerList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState({ risk: "", kyc: "" });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reEvaluating, setReEvaluating] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSort = (field) => {
    setSortBy((prev) => (prev === field ? "" : field));
  };

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const result = await customerService.getCustomers();
        if (result.success) {
          setCustomers(result.data);
        } else {
          setError(result.error || "Failed to fetch customers");
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError("Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // Handle risk re-evaluation
  const handleReEvaluateRisk = async () => {
    try {
      setReEvaluating(true);
      const result = await customerService.reEvaluateAllRiskScores();
      
      if (result.success) {
        // Refresh the customer list to show updated risk scores
        const refreshResult = await customerService.getCustomers();
        if (refreshResult.success) {
          setCustomers(refreshResult.data);
        }
        alert(`✅ ${result.message}\nUpdated: ${result.updatedCount} customers\nErrors: ${result.errorCount}`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error re-evaluating risk scores:', error);
      alert('❌ Failed to re-evaluate risk scores');
    } finally {
      setReEvaluating(false);
    }
  };

  // Handle row expansion
  const handleRowClick = (customerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  // Handle edit customer
  const handleEdit = (customer) => {
    // Find the original customer data from the database
    const originalCustomer = customers.find(c => c.id === customer.id);
    setSelectedCustomer(originalCustomer);
    setShowEditModal(true);
    setExpandedRows(new Set()); // Close expansion
  };

  // Handle KYC review
  const handleKYC = (customerId) => {
    navigate(`/customer/kyc/${customerId}`);
    setExpandedRows(new Set());
  };

  // Handle risk profile
  const handleRisk = (customerId) => {
    navigate(`/customer/risk-profile/${customerId}`);
    setExpandedRows(new Set());
  };

  // Handle customer update
  const handleUpdateCustomer = async (updatedData) => {
    try {
      if (!selectedCustomer) return { success: false, error: 'No customer selected' };

      const result = await customerService.updateCustomer(selectedCustomer.id, updatedData);
      
      if (result.success) {
        // Refresh the customer list
        const refreshResult = await customerService.getCustomers();
        if (refreshResult.success) {
          setCustomers(refreshResult.data);
        }
        
        // Close modal and show success message
        setShowEditModal(false);
        setSelectedCustomer(null);
        
        return { success: true, message: 'Customer updated successfully!' };
      } else {
        return { success: false, error: result.error || 'Failed to update customer' };
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: error.message || 'Failed to update customer' };
    }
  };

  // Transform customer data for display
  const transformCustomerData = (customer) => {
    const fullName = customer.customer_type === 'Natural Person' 
      ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
      : customer.first_name || customer.alias || 'Legal Entity';
    
    return {
      id: customer.id,
      name: fullName || 'Unnamed Customer',
      risk: customer.risk_level || 'Low',
      kyc: customer.kyc_status || 'Pending',
      date: customer.created_at ? new Date(customer.created_at).toISOString().split('T')[0] : 'N/A',
      customer_type: customer.customer_type,
      email: customer.email,
      phone: customer.phone
    };
  };

  const filtered = customers
    .map(transformCustomerData)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .filter((c) => (filters.risk ? c.risk === filters.risk : true))
    .filter((c) => (filters.kyc ? c.kyc === filters.kyc : true))
    .sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      return a[sortBy].localeCompare(b[sortBy]);
    });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Customer List</h1>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading customers...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          
          <button
            onClick={() => navigate("/customer/onboarding")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Customer
          </button>
          
          <button
            onClick={handleReEvaluateRisk}
            disabled={loading || reEvaluating}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 shadow-sm"
          >
            {reEvaluating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Re-evaluating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-evaluate Risk
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.risk}
            onChange={(e) => handleFilterChange("risk", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All Risks</option>
            <option value="High">High Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <select
            value={filters.kyc}
            onChange={(e) => handleFilterChange("kyc", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All KYC</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Customer Count */}
      {!loading && !error && (
        <div className="text-sm text-gray-600">
          Showing {filtered.length} of {customers.length} customers
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-auto bg-white rounded-xl shadow border">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700 border-b">
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("name")}
              >
                Name
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("risk")}
              >
                Risk Level
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("kyc")}
              >
                KYC Status
              </th>
              <th
                className="p-4 font-medium cursor-pointer hover:text-blue-600"
                onClick={() => handleSort("date")}
              >
                Date Added
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cust, i) => (
              <React.Fragment key={cust.id}>
                {/* Main Row */}
                <tr
                  onClick={() => handleRowClick(cust.id)}
                  className={`border-b hover:bg-gray-50 transition duration-200 cursor-pointer ${
                    expandedRows.has(cust.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <td className="p-4 font-semibold text-gray-800">{cust.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cust.risk === "High"
                          ? "bg-red-100 text-red-700"
                          : cust.risk === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {cust.risk}
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{cust.kyc}</td>
                  <td className="p-4 text-gray-600">{cust.date}</td>
                </tr>
                
                {/* Expanded Actions Row */}
                {expandedRows.has(cust.id) && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan="4" className="p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(cust);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Edit Customer
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKYC(cust.id);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          KYC Review
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRisk(cust.id);
                          }}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Risk Profile
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedRows(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(cust.id);
                              return newSet;
                            });
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Close
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-gray-500 text-center">No customers found.</div>
        )}
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Customer</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                }}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <OnboardingForm 
                isEdit={true}
                initialData={selectedCustomer}
                onSubmit={handleUpdateCustomer}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedCustomer(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
