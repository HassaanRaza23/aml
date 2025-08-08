import React, { useState, useEffect, useRef } from "react";
import { countries } from "../../data/countries";
import { currencies } from "../../data/currencies";
import { sourceOfFunds } from "../../data/dropdownOptions";
import { customerService, transactionService, caseService } from "../../services";
import { toast } from "react-toastify";

const AddTransaction = () => {
  const [tab, setTab] = useState("manual");
  const [file, setFile] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customerName: "",
    customerId: "",
    transactionDate: "",
    amount: "",
    currency: "",
    transactionType: "",
    country: "",
    counterpartyName: "",
    sourceOfFunds: "",
    purpose: "",
    description: ""
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const customerDropdownRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'customerName':
        if (!value.trim()) return 'Customer Name is required';
        if (value.trim().length < 2) return 'Customer Name must be at least 2 characters';
        if (value.trim().length > 100) return 'Customer Name must be less than 100 characters';
        return '';

      case 'transactionDate':
        if (!value) return 'Transaction Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) return 'Transaction Date cannot be in the future';
        return '';

      case 'amount':
        if (!value) return 'Amount is required';
        const amount = parseFloat(value);
        if (isNaN(amount)) return 'Amount must be a valid number';
        if (amount <= 0) return 'Amount must be greater than 0';
        if (amount > 999999999.99) return 'Amount is too large';
        return '';

      case 'currency':
        if (!value) return 'Currency is required';
        return '';

      case 'transactionType':
        if (!value) return 'Transaction Type is required';
        return '';

      case 'country':
        if (!value) return 'Country is required';
        return '';

      case 'counterpartyName':
        if (!value.trim()) return 'Counterparty Name is required';
        if (value.trim().length < 2) return 'Counterparty Name must be at least 2 characters';
        if (value.trim().length > 100) return 'Counterparty Name must be less than 100 characters';
        return '';

      case 'sourceOfFunds':
        if (!value) return 'Source of Funds is required';
        return '';

      case 'purpose':
        if (!value.trim()) return 'Purpose of Transaction is required';
        if (value.trim().length < 5) return 'Purpose must be at least 5 characters';
        if (value.trim().length > 200) return 'Purpose must be less than 200 characters';
        return '';

      case 'description':
        if (value && value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';

      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const error = validateField(name, value);
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
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    // Additional validation for customer selection
    if (!formData.customerId) {
      newErrors.customerName = 'Please select a customer from the dropdown';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Customer search functionality
  const searchCustomers = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    console.log('🔍 Searching for customers with term:', searchTerm);
    setIsSearchingCustomers(true);
    
    try {
      const result = await customerService.searchCustomers(searchTerm);
      console.log('🔍 Search result:', result);
      
      if (result.success) {
        console.log('✅ Found customers:', result.data);
        setCustomerResults(result.data || []);
        setShowCustomerDropdown(true);
      } else {
        console.log('❌ Search failed:', result.error);
        setCustomerResults([]);
        setShowCustomerDropdown(false);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      setCustomerResults([]);
      setShowCustomerDropdown(false);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  const handleCustomerSearchChange = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setFormData(prev => ({ ...prev, customerName: value, customerId: "" }));
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchCustomers(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleCustomerSelect = (customer) => {
    setCustomerSearch(`${customer.first_name} ${customer.last_name} (${customer.id})`);
    setFormData(prev => ({ 
      ...prev, 
      customerName: `${customer.first_name} ${customer.last_name}`,
      customerId: customer.id 
    }));
    setShowCustomerDropdown(false);
    setCustomerResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

    if (!formData.customerId) {
      toast.error('Please select a valid customer from the dropdown');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔍 Processing transaction submission...');
      
      // Prepare transaction data for risk assessment
      const transactionData = {
        customer_id: formData.customerId,
        transaction_type: formData.transactionType,
        amount: formData.amount, // Keep as string for rule evaluation
        currency: formData.currency,
        transaction_date: formData.transactionDate,
        source_account: formData.customerName, // Using customer name as source
        destination_account: formData.counterpartyName,
        description: formData.description,
        // Additional data for risk assessment (stored in description for now)
        // We'll include risk assessment data in the description field
        // since the transactions table doesn't have dedicated columns for these
        risk_assessment_data: {
          destination_country: formData.country,
          source_of_funds: formData.sourceOfFunds,
          purpose: formData.purpose,
          // Risk assessment flags (these would be determined by the rules)
          is_unusual_pattern: false, // Would be determined by historical analysis
          involves_third_party: formData.counterpartyName !== formData.customerName,
          is_structuring: false, // Would be determined by pattern analysis
          involves_pep: false, // Would be determined by screening
          involves_sanctioned_entity: false, // Would be determined by screening
          frequency: 1, // Would be determined by historical analysis
        },
        // Test scenarios for demonstration
        // Uncomment these lines to test different risk scenarios:
        // amount: "15000", // High amount test (+30 points)
        // risk_assessment_data: { destination_country: "IR" }, // High-risk country test (+40 points)
        // transaction_type: "Cash", // Cash transaction test (+45 points)
        // For testing, you can also try:
        // risk_assessment_data: { destination_country: "KY" }, // Offshore jurisdiction test (+30 points)
        // amount: "6000", // Cash-like amount for testing
      };

      console.log('📊 Transaction data prepared:', transactionData);

      // Create transaction with risk assessment
      const transaction = await transactionService.createTransaction(transactionData);
      
      if (!transaction) {
        throw new Error('Failed to create transaction');
      }

      console.log('✅ Transaction created:', transaction);
      console.log('📊 Transaction risk score:', transaction.risk_score);
      console.log('📊 Transaction status:', transaction.status);

      // Check if case should be created based on risk score and status
      let caseCreated = false;
      if (transaction.risk_score > 70 || transaction.status === 'Flagged') {
        console.log('🚨 High-risk transaction detected, creating case...');
        
        const caseData = {
          customer_id: formData.customerId,
          case_type: 'Transaction',
          case_title: `High-Risk Transaction - ${formData.customerName}`,
          description: `Transaction of ${formData.amount} ${formData.currency} flagged for review. Risk Score: ${transaction.risk_score}`,
          risk_level: transaction.risk_score > 70 ? 'High' : 'Medium',
          priority: transaction.risk_score > 80 ? 'High' : 'Medium',
          status: 'Open',
          source_transaction_id: transaction.id
        };

        const caseRecord = await caseService.createCase(caseData);
        
        if (caseRecord) {
          console.log('✅ Case created:', caseRecord);
          caseCreated = true;
          
          // Add case action for transaction
          await caseService.addCaseAction(caseRecord.id, {
            action_type: 'Transaction Flagged',
            description: `Transaction ${transaction.id} flagged with risk score ${transaction.risk_score}`,
            notes: `Amount: ${formData.amount} ${formData.currency}, Counterparty: ${formData.counterpartyName}`
          });
        }
      }

      // Show appropriate success message
      if (caseCreated) {
        toast.success(`Transaction added successfully! Risk score: ${transaction.risk_score}. Case created for review.`);
      } else if (transaction.risk_score > 50) {
        toast.success(`Transaction added successfully! Risk score: ${transaction.risk_score}. Transaction flagged for monitoring.`);
      } else {
        toast.success(`Transaction added successfully! Risk score: ${transaction.risk_score}.`);
      }
      
      // Reset form
      setFormData({
        customerName: "",
        customerId: "",
        transactionDate: "",
        amount: "",
        currency: "",
        transactionType: "",
        country: "",
        counterpartyName: "",
        sourceOfFunds: "",
        purpose: "",
        description: ""
      });
      setCustomerSearch("");
      setErrors({});
      setTouched({});
      
    } catch (error) {
      console.error('❌ Error adding transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="relative" ref={customerDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name / ID *
            </label>
            <input 
              type="text" 
              name="customerName"
              value={customerSearch}
              onChange={handleCustomerSearchChange}
              onBlur={handleFieldBlur}
              placeholder="Start typing customer name or ID..."
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.customerName && errors.customerName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {isSearchingCustomers && (
              <div className="absolute right-3 top-8">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {/* Customer Dropdown */}
            {showCustomerDropdown && customerResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {customerResults.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  >
                    <div className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {customer.id} • {customer.email}
                    </div>
                    {customer.risk_level && (
                      <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                        customer.risk_level === 'High' ? 'bg-red-100 text-red-800' :
                        customer.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.risk_level} Risk
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {touched.customerName && errors.customerName && (
              <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Date *
            </label>
            <input 
              type="date" 
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.transactionDate && errors.transactionDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.transactionDate && errors.transactionDate && (
              <p className="text-red-500 text-xs mt-1">{errors.transactionDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input 
              type="number" 
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.amount && errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.amount && errors.amount && (
              <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
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
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.name}</option>
              ))}
            </select>
            {touched.currency && errors.currency && (
              <p className="text-red-500 text-xs mt-1">{errors.currency}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type *
            </label>
            <select 
              name="transactionType"
              value={formData.transactionType}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.transactionType && errors.transactionType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Type</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
              <option value="Cash">Cash</option>
            </select>
            {touched.transactionType && errors.transactionType && (
              <p className="text-red-500 text-xs mt-1">{errors.transactionType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select 
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.country && errors.country ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            {touched.country && errors.country && (
              <p className="text-red-500 text-xs mt-1">{errors.country}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Counterparty Name *
            </label>
            <input 
              type="text" 
              name="counterpartyName"
              value={formData.counterpartyName}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.counterpartyName && errors.counterpartyName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.counterpartyName && errors.counterpartyName && (
              <p className="text-red-500 text-xs mt-1">{errors.counterpartyName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source of Funds *
            </label>
            <select 
              name="sourceOfFunds"
              value={formData.sourceOfFunds}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.sourceOfFunds && errors.sourceOfFunds ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Source</option>
              {sourceOfFunds.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            {touched.sourceOfFunds && errors.sourceOfFunds && (
              <p className="text-red-500 text-xs mt-1">{errors.sourceOfFunds}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Transaction *
            </label>
            <input 
              type="text" 
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.purpose && errors.purpose ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.purpose && errors.purpose && (
              <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description / Notes
            </label>
            <textarea 
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleFieldBlur}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                touched.description && errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {touched.description && errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Adding Transaction...' : 'Submit Transaction'}
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

// Tailwind helper styles (can be added globally or scoped)
// .input { @apply border p-2 rounded w-full; }
// .btn-primary { @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700; }
// .btn-disabled { @apply bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed; }
