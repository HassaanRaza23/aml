import React, { useState, useEffect, useRef } from "react";
import { customerService, transactionService, caseService } from "../../services";
import { toast } from "react-toastify";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { currencies } from "../../data/currencies";
import { 
  sourceOfFunds, 
  transactionProducts, 
  channelOptions, 
  yesNoOptions,
  paymentModes,
  transactionPurposes,
  statusCodes,
  itemTypes,
  executedByOptions
} from "../../data/dropdownOptions";

const AddTransaction = () => {
  const [tab, setTab] = useState("manual");
  const [file, setFile] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    // Customer fields
    customerName: "",
    customerId: "",
    customerType: "",
    directorId: "",
    directorName: "",
    // Required fields
    descriptionOfReport: "",
    actionTakenByReportingEntity: "",
    date: "",
    internalReferenceNumber: "",
    transactionProduct: "",
    paymentMode: "",
    channel: "",
    sourceOfFunds: "",
    transactionPurpose: "",
    currency: "",
    rate: "",
    invoiceAmount: "",
    itemType: "",
    statusCode: "",
    reason: "",
    description: "",
    // Optional fields
    beneficiaryName: "",
    beneficiaryComments: "",
    lateDeposit: "",
    branch: "",
    indemnifiedForRepatriation: "",
    executedBy: "",
    amountLc: "",
    estimatedAmount: "",
    itemSize: "",
    itemUnit: "",
    statusComments: "",
    carrierName: "",
    carrierDetails: "",
    isStrIstr: false
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer dropdown state
  const [allCustomers, setAllCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customerInputValue, setCustomerInputValue] = useState("");
  const customerDropdownRef = useRef(null);

  // Selected customer details
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [directors, setDirectors] = useState([]);
  const [loadingDirectors, setLoadingDirectors] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'customerName':
        if (!value.trim()) return 'Customer Name is required';
        return '';

      case 'directorId':
        if (formData.customerType === 'Legal Entities' && !value) {
          return 'Director/Representative is required for Legal Entities';
        }
        return '';

      case 'descriptionOfReport':
        if (!value.trim()) return 'Description of the Report is required';
        return '';

      case 'actionTakenByReportingEntity':
        if (!value.trim()) return 'Action taken by reporting entity is required';
        return '';

      case 'date':
        if (!value) return 'Date is required';
        return '';

      case 'internalReferenceNumber':
        if (!value.trim()) return 'Internal reference number is required';
        return '';

      case 'transactionProduct':
        if (!value) return 'Transaction product is required';
        return '';

      case 'paymentMode':
        if (!value) return 'Payment Mode is required';
        return '';

      case 'channel':
        if (!value) return 'Channel is required';
        return '';

      case 'sourceOfFunds':
        if (!value) return 'Source of funds is required';
        return '';

      case 'transactionPurpose':
        if (!value) return 'Transaction purpose is required';
        return '';

      case 'currency':
        if (!value) return 'Currency is required';
        return '';

      case 'rate':
        if (!value) return 'Rate is required';
        const rate = parseFloat(value);
        if (isNaN(rate) || rate <= 0) return 'Rate must be a positive number';
        return '';

      case 'invoiceAmount':
        if (!value) return 'Invoice amount is required';
        const amount = parseFloat(value);
        if (isNaN(amount) || amount <= 0) return 'Invoice amount must be a positive number';
        return '';

      case 'itemType':
        if (!value) return 'Item type is required';
        return '';

      case 'statusCode':
        if (!value) return 'Status code is required';
        return '';

      case 'reason':
        if (!value.trim()) return 'Reason is required';
        return '';

      case 'description':
        if (!value.trim()) return 'Description is required';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    
    // Validate field on change
    const error = validateField(name, fieldValue);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFieldBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    if (!formData.customerId) {
      newErrors.customerName = 'Please select a customer from the dropdown';
    }
    
    if (formData.customerType === 'Legal Entities' && !formData.directorId) {
      newErrors.directorId = 'Please select a director/representative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get customer display name
  const getCustomerDisplayName = (customer) => {
    if (customer.customer_type === 'Natural Person' && customer.natural_person_details) {
      const firstName = customer.natural_person_details.firstname || '';
      const lastName = customer.natural_person_details.lastname || '';
      return `${firstName} ${lastName}`.trim() || 'Natural Person';
    } else if (customer.customer_type === 'Legal Entities' && customer.legal_entity_details) {
      return customer.legal_entity_details.legalname || customer.legal_entity_details.alias || 'Legal Entity';
    }
    // Fallback to first_name/last_name if details not loaded
    if (customer.first_name && customer.last_name) {
      return `${customer.first_name} ${customer.last_name}`.trim();
    }
    return customer.first_name || customer.alias || 'Customer';
  };

  // Load all customers
  const loadAllCustomers = async () => {
    if (allCustomers.length > 0) return; // Already loaded
    
    setLoadingCustomers(true);
    try {
      // Fetch all customers with pagination (get a large number)
      const result = await customerService.getCustomers(1, 1000);
      if (result.success && result.data) {
        setAllCustomers(result.data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };


  const handleCustomerSelect = async (customer) => {
    const displayName = getCustomerDisplayName(customer);
    setCustomerInputValue(displayName);
    setFormData(prev => ({ 
      ...prev, 
      customerName: displayName,
      customerId: customer.id,
      customerType: customer.customer_type || customer.customerType || '',
      directorId: "",
      directorName: ""
    }));
    setSelectedCustomer(customer);
    setShowCustomerDropdown(false);
    
    // If legal entity, fetch directors
    const customerType = customer.customer_type || customer.customerType;
    if (customerType === 'Legal Entities') {
      setLoadingDirectors(true);
      try {
        const directorsResult = await customerService.getDirectors(customer.id);
        if (directorsResult.success) {
          setDirectors(directorsResult.data || []);
        } else {
          console.error('Failed to fetch directors:', directorsResult.error);
          setDirectors([]);
        }
      } catch (error) {
        console.error('Error fetching directors:', error);
        setDirectors([]);
      } finally {
        setLoadingDirectors(false);
      }
    } else {
      setDirectors([]);
    }
  };

  // Load customers on component mount
  useEffect(() => {
    loadAllCustomers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
        // Reset input to selected customer name if a customer is selected
        if (formData.customerId) {
          const selectedCustomer = allCustomers.find(c => c.id === formData.customerId);
          if (selectedCustomer) {
            setCustomerInputValue(getCustomerDisplayName(selectedCustomer));
          }
        } else {
          setCustomerInputValue("");
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [formData.customerId, allCustomers]);

  // Filter customers based on input value
  const filteredCustomers = allCustomers.filter(customer => {
    if (!customerInputValue.trim()) return true;
    
    const searchLower = customerInputValue.toLowerCase();
    const displayName = getCustomerDisplayName(customer).toLowerCase();
    const customerType = (customer.customer_type || customer.customerType || '').toLowerCase();
    const customerId = (customer.id || '').toLowerCase();
    
    return displayName.includes(searchLower) || 
           customerType.includes(searchLower) || 
           customerId.includes(searchLower);
  });

  // Handle customer input change
  const handleCustomerInputChange = (e) => {
    const value = e.target.value;
    setCustomerInputValue(value);
    setShowCustomerDropdown(true);
    
    // Clear selection if input is cleared
    if (!value.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        customerName: "",
        customerId: "",
        customerType: "",
        directorId: "",
        directorName: ""
      }));
      setSelectedCustomer(null);
      setDirectors([]);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔍 Processing transaction submission...');
      console.log('📊 Form data:', formData);
      
      // Map form data to transaction payload (camelCase to snake_case)
      const transactionPayload = {
        customer_id: formData.customerId,
        director_id: formData.directorId || null,
        transaction_type: formData.paymentMode || null,
        amount: parseFloat(formData.invoiceAmount) || 0,
        currency: formData.currency,
        transaction_date: formData.date || new Date().toISOString(),
        source_account: formData.customerName || null,
        destination_account: formData.beneficiaryName || null,
        description_of_report: formData.descriptionOfReport || null,
        action_taken_by_reporting_entity: formData.actionTakenByReportingEntity || null,
        internal_reference_number: formData.internalReferenceNumber || null,
        transaction_product: formData.transactionProduct || null,
        payment_mode: formData.paymentMode || null,
        channel: formData.channel || null,
        source_of_funds: formData.sourceOfFunds || null,
        transaction_purpose: formData.transactionPurpose || null,
        rate: formData.rate ? parseFloat(formData.rate) : null,
        invoice_amount: formData.invoiceAmount ? parseFloat(formData.invoiceAmount) : null,
        amount_lc: formData.amountLc ? parseFloat(formData.amountLc) : null,
        estimated_amount: formData.estimatedAmount ? parseFloat(formData.estimatedAmount) : null,
        item_type: formData.itemType || null,
        item_size: formData.itemSize || null,
        item_unit: formData.itemUnit || null,
        status_code: formData.statusCode || null,
        status_comments: formData.statusComments || null,
        beneficiary_name: formData.beneficiaryName || null,
        beneficiary_comments: formData.beneficiaryComments || null,
        late_deposit: formData.lateDeposit || null,
        branch: formData.branch || null,
        indemnified_for_repatriation: formData.indemnifiedForRepatriation || null,
        executed_by: formData.executedBy || null,
        carrier_name: formData.carrierName || null,
        carrier_details: formData.carrierDetails || null,
        is_str_istr: formData.isStrIstr || false,
        reason: formData.reason || null,
        description: formData.description || null
      };
      
      console.log('📊 Transaction payload:', transactionPayload);
      
      // Create transaction
      const transaction = await transactionService.createTransaction(transactionPayload);
      
      if (!transaction || (transaction.success === false)) {
        throw new Error(transaction?.error || 'Failed to create transaction');
      }
      
      console.log('✅ Transaction created successfully:', transaction);
      
      // Show success message
      toast.success('Transaction created successfully!');
      
      // Reset form
      const resetFormData = {
        customerName: "",
        customerId: "",
        customerType: "",
        directorId: "",
        directorName: "",
        descriptionOfReport: "",
        actionTakenByReportingEntity: "",
        date: "",
        internalReferenceNumber: "",
        transactionProduct: "",
        paymentMode: "",
        channel: "",
        sourceOfFunds: "",
        transactionPurpose: "",
        currency: "",
        rate: "",
        invoiceAmount: "",
        itemType: "",
        statusCode: "",
        reason: "",
        description: "",
        beneficiaryName: "",
        beneficiaryComments: "",
        lateDeposit: "",
        branch: "",
        indemnifiedForRepatriation: "",
        executedBy: "",
        amountLc: "",
        estimatedAmount: "",
        itemSize: "",
        itemUnit: "",
        statusComments: "",
        carrierName: "",
        carrierDetails: "",
        isStrIstr: false
      };
      setFormData(resetFormData);
      setSelectedCustomer(null);
      setDirectors([]);
      setErrors({});
      setTouched({});
      
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render form field
  const renderField = (name, label, type = "text", options = null, required = false, placeholder = "") => {
    const isError = touched[name] && errors[name];
    
    // Special handling for checkbox - no top label, but align with textbox
    if (type === "checkbox") {
      const checkboxId = `checkbox-${name}`;
      return (
        <div>
          {/* Empty space to match label height + margin (mb-2) */}
          <div className="h-7 mb-2"></div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id={checkboxId}
              name={name}
              checked={formData[name]}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label 
              htmlFor={checkboxId}
              className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
          </div>
          {isError && (
            <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
          )}
        </div>
      );
    }
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === "select" ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select {label}</option>
            {options && options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            rows={3}
            placeholder={placeholder}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleInputChange}
            onBlur={handleFieldBlur}
            placeholder={placeholder}
            className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        )}
        {isError && (
          <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Add Transactions</h1>

      <div className="flex gap-4 border-b mb-6">
        <button
          className={`pb-2 ${tab === "manual" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setTab("manual")}
        >
          Manual Entry
        </button>
        <button
          className={`pb-2 ${tab === "upload" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setTab("upload")}
        >
          Upload File
        </button>
        <button
          className={`pb-2 ${tab === "connect" ? "border-b-2 border-blue-500 font-medium" : "text-gray-500"}`}
          onClick={() => setTab("connect")}
        >
          Connect Accounting Software
        </button>
      </div>

      {/* Manual Entry Tab */}
      {tab === "manual" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1, Column 1: Customer Name/ID */}
          <div className="relative" ref={customerDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name / ID <span className="text-red-500">*</span>
            </label>
            {loadingCustomers ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading customers...</span>
              </div>
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    name="customerName"
                    value={customerInputValue}
                    onChange={handleCustomerInputChange}
                    onFocus={() => {
                      if (allCustomers.length === 0) {
                        loadAllCustomers();
                      }
                      setShowCustomerDropdown(true);
                    }}
                    onBlur={handleFieldBlur}
                    placeholder="Type to search customers..."
                    className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      touched.customerName && errors.customerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <svg
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform pointer-events-none ${
                      showCustomerDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown List */}
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-y-auto">
                    {filteredCustomers.map((customer) => {
                      const displayName = getCustomerDisplayName(customer);
                      const customerType = customer.customer_type || customer.customerType || '';
                      
                      return (
                        <div
                          key={customer.id}
                          onClick={() => handleCustomerSelect(customer)}
                          className={`px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                            formData.customerId === customer.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="font-medium text-gray-900">{displayName}</div>
                          <div className="text-sm text-gray-600">
                            {customerType} • ID: {customer.id.substring(0, 8)}...
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {showCustomerDropdown && filteredCustomers.length === 0 && customerInputValue.trim() && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-8 text-center text-gray-500">
                    No customers found
                  </div>
                )}
              </>
            )}
            {touched.customerName && errors.customerName && (
              <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
            )}
          </div>

          {/* Row 1, Column 2: Director/Representative - only show for Legal Entities, empty by default */}
          {formData.customerType === 'Legal Entities' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Director/Representative <span className="text-red-500">*</span>
              </label>
              {loadingDirectors ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Loading directors...</span>
                </div>
              ) : (
                <select 
                  name="directorId"
                  value={formData.directorId}
                  onChange={(e) => {
                    const selectedDirector = directors.find(d => d.id === e.target.value);
                    handleInputChange(e);
                    setFormData(prev => ({
                      ...prev,
                      directorName: selectedDirector 
                        ? `${selectedDirector.firstName || ''} ${selectedDirector.lastName || ''}`.trim() || selectedDirector.alias || 'Director'
                        : ""
                    }));
                  }}
                  onBlur={handleFieldBlur}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    touched.directorId && errors.directorId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Director/Representative</option>
                  {directors.map((director) => {
                    const directorName = director.firstName && director.lastName
                      ? `${director.firstName} ${director.lastName}`
                      : director.alias || 'Director';
                    const role = director.isRepresentative ? ' (Representative)' : director.isCeo ? ' (CEO)' : '';
                    return (
                      <option key={director.id} value={director.id}>
                        {directorName}{role}
                      </option>
                    );
                  })}
                </select>
              )}
              {touched.directorId && errors.directorId && (
                <p className="text-red-500 text-xs mt-1">{errors.directorId}</p>
              )}
            </div>
          ) : (
            <div></div>
          )}

          {renderField("descriptionOfReport", "Description of the Report", "textarea", null, true, "Enter description of the report")}
          {renderField("actionTakenByReportingEntity", "Action taken by reporting entity", "textarea", null, true, "Enter action taken")}
          {renderField("date", "Date", "date", null, true)}
          {renderField("internalReferenceNumber", "Internal reference number", "text", null, true, "Enter internal reference number")}
          {renderField("transactionProduct", "Transaction product", "select", transactionProducts, true)}
          {renderField("paymentMode", "Payment Mode", "select", paymentModes, true)}
          {renderField("channel", "Channel", "select", channelOptions, true)}
          {renderField("sourceOfFunds", "Source of funds", "select", sourceOfFunds, true)}
          {renderField("transactionPurpose", "Transaction purpose", "select", transactionPurposes, true)}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency <span className="text-red-500">*</span>
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.currency && errors.currency ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Currency</option>
              {[...currencies].sort((a, b) => a.name.localeCompare(b.name)).map((currency) => ( 
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
            {touched.currency && errors.currency && (
              <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
            )}
          </div>
          {renderField("rate", "Rate", "number", null, true, "0.00")}
          {renderField("invoiceAmount", "Invoice amount", "number", null, true, "0.00")}
          {renderField("itemType", "Item type", "select", itemTypes, true)}
          {renderField("statusCode", "Status code", "select", statusCodes, true)}
          {renderField("beneficiaryName", "Beneficiary name", "text", null, false, "Enter beneficiary name")}
          {renderField("beneficiaryComments", "Beneficiary comments", "textarea", null, false, "Enter beneficiary comments")}
          {renderField("lateDeposit", "Late deposit", "select", yesNoOptions, false)}
          {renderField("branch", "Branch", "text", null, false, "Enter branch")}
          {renderField("indemnifiedForRepatriation", "Indemnified for repatriation", "select", yesNoOptions, false)}
          {renderField("executedBy", "Executed by", "select", executedByOptions, false)}
          {renderField("amountLc", "Amount LC", "number", null, false, "0.00")}
          {renderField("estimatedAmount", "Estimated amount", "number", null, false, "0.00")}
          {renderField("itemSize", "Item size", "text", null, false, "Enter item size")}
          {renderField("itemUnit", "Item unit", "text", null, false, "Enter item unit")}
          {renderField("statusComments", "Status comments", "textarea", null, false, "Enter status comments")}
          {renderField("carrierName", "Carrier name", "text", null, false, "Enter carrier name")}
          {renderField("carrierDetails", "Carrier details", "textarea", null, false, "Enter carrier details")}
          {renderField("isStrIstr", "Is STR/ISTR", "checkbox", null, false)}
          {renderField("reason", "Reason", "textarea", null, true, "Enter reason")}
          {renderField("description", "Description", "textarea", null, true, "Enter description")}

          <div className="md:col-span-2 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Transaction'}
            </button>
          </div>
        </form>
      )}

      {/* Upload File Tab */}
      {tab === "upload" && (
        <div className="space-y-4">
          <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
          {file && <p className="text-sm text-gray-600">Selected file: {file.name}</p>}
          <a
            href="/sample-template.xlsx"
            download
            className="text-blue-500 underline"
          >
            Download sample template
          </a>
          <button className="btn-primary">Upload</button>
        </div>
      )}

      {/* Connect Accounting Software Tab */}
      {tab === "connect" && (
        <div className="space-y-4">
          <button className="btn-disabled">Connect to QuickBooks (Coming Soon)</button>
          <button className="btn-disabled">Connect to Xero (Coming Soon)</button>
          <p className="text-sm text-gray-500">These integrations will allow automated syncing of customer transactions in future updates.</p>
        </div>
      )}
    </div>
  );
};

export default AddTransaction;
