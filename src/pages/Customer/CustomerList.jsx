import React, { useState, useEffect, Fragment, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = useCallback((field) => {
    setSortBy((prev) => (prev === field ? "" : field));
  }, []);

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

  const handleFilterChange = useCallback((type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  }, []);

  // Handle risk re-evaluation
  const handleReEvaluateRisk = useCallback(async () => {
    try {
      setReEvaluating(true);
      
      // Show initial toast
      toast.info('🔄 Starting risk re-evaluation for all customers...', {
        autoClose: 2000
      });
      
      const result = await customerService.reEvaluateAllRiskScores();
      
      if (result.success) {
        // Refresh the customer list to show updated risk scores
        const refreshResult = await customerService.getCustomers();
        if (refreshResult.success) {
          setCustomers(refreshResult.data);
        }
        
        // Show detailed success message
        const message = result.errorCount > 0
          ? `✅ Re-evaluation completed!\n✅ Updated: ${result.updatedCount} customers\n⚠️ Errors: ${result.errorCount} customers\n📊 Total: ${result.totalCustomers || result.updatedCount + result.errorCount} customers`
          : `✅ Re-evaluation completed successfully!\n✅ Updated: ${result.updatedCount} customers\n📊 Total: ${result.totalCustomers || result.updatedCount} customers`;
        
        toast.success(message, {
          autoClose: 5000
        });
      } else {
        toast.error(`❌ Error: ${result.error || 'Failed to re-evaluate risk scores'}`);
      }
    } catch (error) {
      console.error('Error re-evaluating risk scores:', error);
      toast.error(`❌ Failed to re-evaluate risk scores: ${error.message || 'Unknown error'}`);
    } finally {
      setReEvaluating(false);
    }
  }, []);

  // Handle row expansion
  const handleRowClick = useCallback((customerId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  }, []);

  // Handle edit customer
  const handleEdit = useCallback(async (customer) => {
    try {
      // Fetch all related data for this customer including expandable sections
      const fullCustomerData = await customerService.getCustomerById(customer.id);
      
      if (!fullCustomerData) {
        console.error('Failed to fetch customer data for editing');
        return;
      }
      
      // Flatten the normalized data to match the old form structure
      const flattenedCustomer = {
        // Core customer fields (from customers table)
        id: fullCustomerData.id,
        core_system_id: fullCustomerData.core_system_id,
        customer_type: fullCustomerData.customer_type,
        email: fullCustomerData.email,
        phone: fullCustomerData.phone,
        channel: fullCustomerData.channel,
        transaction_product: fullCustomerData.transaction_product,
        transaction_amount_limit: fullCustomerData.transaction_amount_limit,
        transaction_limit: fullCustomerData.transaction_limit,
        risk_score: fullCustomerData.risk_score,
        risk_level: fullCustomerData.risk_level,
        kyc_status: fullCustomerData.kyc_status,
        kyc_remarks: fullCustomerData.kyc_remarks,
        due_diligence_level: fullCustomerData.due_diligence_level,
        status: fullCustomerData.status,
        created_at: fullCustomerData.created_at,
        updated_at: fullCustomerData.updated_at,
        
        // Flatten natural person details
        ...(fullCustomerData.natural_person_details && {
          profession: fullCustomerData.natural_person_details.profession,
          firstname: fullCustomerData.natural_person_details.firstname,
          lastname: fullCustomerData.natural_person_details.lastname,
          alias: fullCustomerData.natural_person_details.alias,
          dateofbirth: fullCustomerData.natural_person_details.dateofbirth,
          nationality: fullCustomerData.natural_person_details.nationality,
          residencystatus: fullCustomerData.natural_person_details.residencystatus,
          idtype: fullCustomerData.natural_person_details.idtype,
          idnumber: fullCustomerData.natural_person_details.idnumber,
          issuedate: fullCustomerData.natural_person_details.issuedate,
          expirydate: fullCustomerData.natural_person_details.expirydate,
          isdualnationality: fullCustomerData.natural_person_details.isdualnationality,
          dualnationality: fullCustomerData.natural_person_details.dualinationality,
          dualpassportnumber: fullCustomerData.natural_person_details.dualpassportnumber,
          dualpassportissuedate: fullCustomerData.natural_person_details.dualpassportissuedate,
          dualpassportexpirydate: fullCustomerData.natural_person_details.dualpassportexpirydate,
          countryofbirth: fullCustomerData.natural_person_details.countryofbirth,
          address: fullCustomerData.natural_person_details.address,
          city: fullCustomerData.natural_person_details.city,
          occupation: fullCustomerData.natural_person_details.occupation,
          sourceofwealth: fullCustomerData.natural_person_details.sourceofwealth,
          pep: fullCustomerData.natural_person_details.pep,
          sourceoffunds: fullCustomerData.natural_person_details.sourceoffunds,
          pobox: fullCustomerData.natural_person_details.pobox,
          gender: fullCustomerData.natural_person_details.gender,
          employer: fullCustomerData.natural_person_details.employer
        }),
        
        // Flatten legal entity details
        ...(fullCustomerData.legal_entity_details && {
          businessactivity: fullCustomerData.legal_entity_details.businessactivity ? 
            (typeof fullCustomerData.legal_entity_details.businessactivity === 'string' ? 
              JSON.parse(fullCustomerData.legal_entity_details.businessactivity) : 
              fullCustomerData.legal_entity_details.businessactivity) : [],
          legalname: fullCustomerData.legal_entity_details.legalname,
          alias: fullCustomerData.legal_entity_details.alias,
          dateofincorporation: fullCustomerData.legal_entity_details.dateofincorporation,
          countryofincorporation: fullCustomerData.legal_entity_details.countryofincorporation,
          licensetype: fullCustomerData.legal_entity_details.licensetype,
          licensenumber: fullCustomerData.legal_entity_details.licensenumber,
          licenseissuedate: fullCustomerData.legal_entity_details.licenseissuedate,
          licenseexpirydate: fullCustomerData.legal_entity_details.licenseexpirydate,
          registeredofficeaddress: fullCustomerData.legal_entity_details.registeredofficeaddress,
          city: fullCustomerData.legal_entity_details.city,
          countriessourceoffunds: fullCustomerData.legal_entity_details.countriessourceoffunds ? 
            (typeof fullCustomerData.legal_entity_details.countriessourceoffunds === 'string' ? 
              JSON.parse(fullCustomerData.legal_entity_details.countriessourceoffunds) : 
              fullCustomerData.legal_entity_details.countriessourceoffunds) : [],
          managementcompany: fullCustomerData.legal_entity_details.managementcompany,
          countriesofoperation: fullCustomerData.legal_entity_details.countriesofoperation ? 
            (typeof fullCustomerData.legal_entity_details.countriesofoperation === 'string' ? 
              JSON.parse(fullCustomerData.legal_entity_details.countriesofoperation) : 
              fullCustomerData.legal_entity_details.countriesofoperation) : [],
          jurisdiction: fullCustomerData.legal_entity_details.jurisdiction,
          sourceoffunds: fullCustomerData.legal_entity_details.sourceoffunds,
          residencystatus: fullCustomerData.legal_entity_details.residencystatus,
          licensingauthority: fullCustomerData.legal_entity_details.licensingauthority,
          trn: fullCustomerData.legal_entity_details.trn,
          licensecategory: fullCustomerData.legal_entity_details.licensecategory,
          addressexpirydate: fullCustomerData.legal_entity_details.addressexpirydate
        }),
        
        // Expandable sections - transform field names from snake_case to camelCase
        shareholders: (fullCustomerData.shareholders || []).map(shareholder => ({
          // Preserve the ID for editing
          id: shareholder.id,
          // Map the new normalized structure to the expected frontend format
          type: shareholder.type,
          fullName: shareholder.fullName,
          alias: shareholder.alias,
          nationality: shareholder.nationality,
          countryOfResidence: shareholder.countryOfResidence,
          dateOfBirth: shareholder.dateOfBirth,
          placeOfBirth: shareholder.placeOfBirth,
          phone: shareholder.phone,
          email: shareholder.email,
          address: shareholder.address,
          sourceOfFunds: shareholder.sourceOfFunds,
          sourceOfWealth: shareholder.sourceOfWealth,
          occupation: shareholder.occupation,
          expectedIncome: shareholder.expectedIncome,
          pep: shareholder.pep,
          shareholding: shareholder.shareholding,
          dualNationality: shareholder.dualNationality,
          isDirector: shareholder.isDirector,
          isUbo: shareholder.isUbo,
          // Legal Entity fields
          legalName: shareholder.legalName,
          dateOfIncorporation: shareholder.dateOfIncorporation,
          countryOfIncorporation: shareholder.countryOfIncorporation,
          entityClass: shareholder.entityClass,
          licenseType: shareholder.licenseType,
          licenseNumber: shareholder.licenseNumber,
          licenseIssueDate: shareholder.licenseIssueDate,
          licenseExpiryDate: shareholder.licenseExpiryDate,
          businessActivity: shareholder.businessActivity,
          countriesOfOperation: shareholder.countriesOfOperation,
          registeredOfficeAddress: shareholder.registeredOfficeAddress,
          countriesSourceOfFunds: shareholder.countriesSourceOfFunds,
          otherDetails: shareholder.otherDetails,
          // Trust fields
          trustName: shareholder.trustName,
          trustRegistered: shareholder.trustRegistered,
          trustType: shareholder.trustType,
          jurisdictionOfLaw: shareholder.jurisdictionOfLaw,
          registeredAddress: shareholder.registeredAddress,
          trusteeName: shareholder.trusteeName,
          trusteeType: shareholder.trusteeType
        })),
        directors: (fullCustomerData.customer_directors || []).map(director => ({
          firstName: director.first_name,
          alias: director.alias,
          lastName: director.last_name,
          countryOfResidence: director.country_of_residence,
          nationality: director.nationality,
          dateOfBirth: director.date_of_birth,
          phone: director.phone,
          placeOfBirth: director.place_of_birth,
          email: director.email,
          address: director.address,
          city: director.city,
          occupation: director.occupation,
          pepStatus: director.pep_status,
          isCeo: director.is_ceo,
          isRepresentative: director.is_representative,
          dualNationality: director.dual_nationality
        })),
        bankDetails: (fullCustomerData.customer_bank_details || []).map(bank => ({
          bankName: bank.bank_name,
          alias: bank.alias,
          accountType: bank.account_type,
          currency: bank.currency,
          bankAccountDetails: bank.bank_account_details,
          accountNumber: bank.account_number,
          iban: bank.iban,
          swift: bank.swift,
          modeOfSignatory: bank.mode_of_signatory,
          internetBanking: bank.internet_banking,
          bankSignatories: bank.bank_signatories
        })),
        ubos: (fullCustomerData.ubos || []).map(ubo => ({
          id: ubo.id,
          fullName: ubo.fullName,
          alias: ubo.alias,
          nationality: ubo.nationality,
          countryOfResidence: ubo.countryOfResidence,
          dateOfBirth: ubo.dateOfBirth,
          placeOfBirth: ubo.placeOfBirth,
          phone: ubo.phone,
          email: ubo.email,
          address: ubo.address,
          sourceOfFunds: ubo.sourceOfFunds,
          sourceOfWealth: ubo.sourceOfWealth,
          occupation: ubo.occupation,
          expectedIncome: ubo.expectedIncome,
          pep: ubo.pep,
          shareholding: ubo.shareholding,
          dualNationality: ubo.dualNationality
        }))
      };
      
      setSelectedCustomer(flattenedCustomer);
      setShowEditModal(true);
      setExpandedRows(new Set()); // Close expansion
    } catch (error) {
      console.error('Error preparing customer data for editing:', error);
      toast.error('Failed to load customer data for editing. Please try again.');
    }
  }, []);

  // Handle KYC review
  const handleKYC = useCallback((customerId) => {
    navigate(`/customer/kyc/${customerId}`);
    setExpandedRows(new Set());
  }, [navigate]);

  // Handle risk profile
  const handleRisk = useCallback((customerId) => {
    navigate(`/customer/risk-profile/${customerId}`);
    setExpandedRows(new Set());
  }, [navigate]);

    // Handle risk mitigation
  const handleRiskMitigation = useCallback((customerId) => {
    navigate(`/customer/risk-mitigation/${customerId}`);
    setExpandedRows(new Set());
  }, [navigate]);

  // Handle document upload
  const handleDocumentUpload = useCallback((customerId) => {
    navigate(`/customer/documents/${customerId}`);
    setExpandedRows(new Set());
  }, [navigate]);

  // Handle sanction details
  const handleSanctionDetails = useCallback((customerId) => {
    navigate(`/customer/sanction-details/${customerId}`);
    setExpandedRows(new Set());
  }, [navigate]);

  // Handle customer update
  const handleUpdateCustomer = useCallback(async (updatedData) => {
    try {
      if (!selectedCustomer) return { success: false, error: 'No customer selected' };

      const result = await customerService.updateCustomer(selectedCustomer.id, updatedData);
      
      if (result.success) {
        // Refresh customer list to get updated data (since structure might be complex)
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
  }, [selectedCustomer]);

  // Handle delete customer
  const handleDeleteCustomer = useCallback(async () => {
    if (!customerToDelete) return;
    
    try {
      setDeleting(true);
      const result = await customerService.deleteCustomer(customerToDelete.id);
      
      if (result.success) {
        // Optimistically remove customer from list instead of full refetch
        setCustomers(prevCustomers => 
          prevCustomers.filter(customer => customer.id !== customerToDelete.id)
        );
        
        // Close modal and show success message
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        toast.success('Customer deleted successfully!');
      } else {
        toast.error(`❌ Error: ${result.error || 'Failed to delete customer'}`);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(`❌ Error: ${error.message || 'Failed to delete customer'}`);
    } finally {
      setDeleting(false);
    }
  }, [customerToDelete]);

  // Show delete confirmation modal
  const showDeleteConfirmation = useCallback((customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  }, []);

  // Transform customer data for display (memoized)
  const transformedCustomers = useMemo(() => {
    return customers.map((customer) => {
      let fullName = 'Unnamed Customer';
      
      if (customer.customer_type === 'Natural Person' && customer.natural_person_details) {
        const firstName = customer.natural_person_details.firstname || '';
        const lastName = customer.natural_person_details.lastname || '';
        fullName = `${firstName} ${lastName}`.trim();
      } else if (customer.customer_type === 'Legal Entities' && customer.legal_entity_details) {
        fullName = customer.legal_entity_details.legalname || 'Legal Entity';
      }
      
      // If still unnamed, try to get name from other fields
      if (fullName === 'Unnamed Customer' || fullName.trim() === '') {
        if (customer.first_name && customer.last_name) {
          fullName = `${customer.first_name} ${customer.last_name}`.trim();
        } else if (customer.first_name) {
          fullName = customer.first_name;
        } else if (customer.alias) {
          fullName = customer.alias;
        }
      }
      
      return {
        id: customer.id,
        name: fullName || 'Unnamed Customer',
        customer_type: customer.customer_type,
        risk: customer.risk_level || 'Low',
        kyc: customer.kyc_status || 'Pending',
        date: customer.created_at ? new Date(customer.created_at).toISOString().split('T')[0] : 'N/A',
        email: customer.email,
        phone: customer.phone
      };
    });
  }, [customers]);

  // Filter and sort customers (memoized)
  const filtered = useMemo(() => {
    const searchLower = search.toLowerCase();
    
    return transformedCustomers
      .filter((c) => c.name.toLowerCase().includes(searchLower))
    .filter((c) => (filters.risk ? c.risk === filters.risk : true))
    .filter((c) => (filters.kyc ? c.kyc === filters.kyc : true))
    .sort((a, b) => {
      if (!sortBy) return 0;
      if (sortBy === "date") return new Date(b.date) - new Date(a.date);
      return a[sortBy].localeCompare(b[sortBy]);
    });
  }, [transformedCustomers, search, filters, sortBy]);

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
            <option value="High">High</option>
            <option value="Medium High">Medium High</option>
            <option value="Medium">Medium</option>
            <option value="Medium Low">Medium Low</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filters.kyc}
            onChange={(e) => handleFilterChange("kyc", e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">All KYC</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
            <option value="Under Review">Under Review</option>
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
                onClick={() => handleSort("customer_type")}
              >
                Type
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {cust.customer_type}
                    </span>
                  </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      cust.risk === "High" || cust.risk === "Medium High"
                        ? "bg-red-100 text-red-700"
                        : cust.risk === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : cust.risk === "Medium Low"
                        ? "bg-blue-100 text-blue-700"
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
                    <td colSpan="5" className="p-4">
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
                            handleRiskMitigation(cust.id);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Risk Mitigation
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentUpload(cust.id);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Document Upload
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSanctionDetails(cust.id);
                          }}
                          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Sanction Details
                        </button>
                  <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirmation(cust);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
                        >
                          Delete Customer
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Customer</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{customerToDelete.name}</span>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCustomerToDelete(null);
                }}
                disabled={deleting}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
