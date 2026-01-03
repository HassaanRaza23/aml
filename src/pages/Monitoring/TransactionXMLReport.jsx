// src/pages/Monitoring/TransactionXMLReport.jsx

import React, { useState, useEffect } from "react";
import { transactionService, customerService } from "../../services";
import { toast } from "react-toastify";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentArrowDownIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

const TransactionXMLReport = () => {
  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [generatingXml, setGeneratingXml] = useState(new Set()); // Track which transactions are generating XML
  const [xmlPreviews, setXmlPreviews] = useState({}); // Store XML previews by transaction ID
  
  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    dateFrom: "",
    dateTo: "",
    status: "",
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

  // Toggle row expansion
  const toggleRowExpansion = (transactionId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  // Fetch transactions - only approved
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build filter object - only get approved transactions
      const filterParams = {
        ...filters,
        // Override status to only get approved
        statusFilter: ['Approved']
      };
      
      const result = await transactionService.getTransactions(
        filters.page, 
        filters.limit, 
        filterParams
      );
      
      if (result.success) {
        // Additional client-side filter as backup (case-insensitive) - only approved
        const filtered = (result.data || []).filter(tx => {
          const status = (tx.status || '').trim();
          return status === 'Approved' || status.toLowerCase() === 'approved';
        });
        setTransactions(filtered);
        setTotalCount(result.count || filtered.length);
        
        // Load existing XML for transactions that have xml_generated_at
        const xmlPromises = filtered
          .filter(tx => tx.xml_generated_at)
          .map(async (tx) => {
            try {
              const xmlResult = await transactionService.getLatestXml(tx.id);
              if (xmlResult.success && xmlResult.data) {
                setXmlPreviews(prev => ({
                  ...prev,
                  [tx.id]: xmlResult.data.xml_content
                }));
              }
            } catch (error) {
              console.error(`Error loading XML for transaction ${tx.id}:`, error);
            }
          });
        
        await Promise.all(xmlPromises);
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
      page: 1,
      limit: 100
    });
  };

  // Escape XML special characters
  const escapeXml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // Format date to ISO string with time
  const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString();
  };

  // Generate GoAML XML for a single transaction
  const generateXMLForTransaction = async (tx) => {
    setGeneratingXml(prev => new Set(prev).add(tx.id));
    
    try {
      const customer = tx.customers || {};
      const npDetails = customer.natural_person_details || {};
      const leDetails = customer.legal_entity_details || {};
      
      // Get director information if director_id exists
      let directorInfo = null;
      if (tx.director_id) {
        try {
          const directorResult = await customerService.getDirectorById(tx.director_id);
          if (directorResult.success && directorResult.data) {
            directorInfo = directorResult.data;
          }
        } catch (error) {
          console.error('Error fetching director:', error);
        }
      }

      // Determine if customer is legal entity
      const isLegalEntity = customer.customer_type === 'Legal Entities';
      
      // Get customer name
      const customerName = isLegalEntity 
        ? (leDetails.legalname || leDetails.alias || '')
        : (npDetails.firstname && npDetails.lastname 
          ? `${npDetails.firstname} ${npDetails.lastname}` 
          : '');

      // Get commercial name (for legal entities)
      const commercialName = isLegalEntity 
        ? (leDetails.commercialname || leDetails.legalname || leDetails.alias || '')
        : '';

      // Get incorporation number (for legal entities)
      const incorporationNumber = isLegalEntity 
        ? (leDetails.incorporationnumber || '')
        : '';

      // Get phone number
      const phoneNumber = isLegalEntity 
        ? (leDetails.phone || customer.phone || '')
        : (npDetails.phone || customer.phone || '');

      // Get address
      const address = isLegalEntity 
        ? (leDetails.address || '')
        : (npDetails.address || '');

      // Get city
      const city = isLegalEntity 
        ? (leDetails.city || '')
        : (npDetails.city || '');

      // Get country code (default to AE if not available)
      const countryCode = isLegalEntity 
        ? (leDetails.countrycode || 'AE')
        : (npDetails.nationality || 'AE');

      // Get state
      const state = isLegalEntity 
        ? (leDetails.state || leDetails.city || '')
        : (npDetails.city || '');

      // Get incorporation state/country (for legal entities)
      const incorporationState = isLegalEntity 
        ? (leDetails.state || leDetails.city || '')
        : '';
      const incorporationCountryCode = isLegalEntity 
        ? (leDetails.countrycode || 'AE')
        : '';

      // Build reporting person section (use customer details if natural person, otherwise default MLRO)
      const reportingPersonGender = (npDetails.gender || 'M').toUpperCase();
      const reportingPersonFirstName = (npDetails.firstname || 'MLRO').toUpperCase();
      const reportingPersonLastName = (npDetails.lastname || 'OFFICER').toUpperCase();
      const reportingPersonSSN = npDetails.idnumber || '';
      const reportingPersonID = npDetails.idnumber || '';
      const reportingPersonNationality = (npDetails.nationality || 'AE').toUpperCase();
      const reportingPersonEmail = customer.email || '';
      const reportingPersonOccupation = (npDetails.occupation || 'MLRO').toUpperCase();
      
      const reportingPerson = `    <reporting_person>
        <gender>${escapeXml(reportingPersonGender)}</gender>
        <first_name>${escapeXml(reportingPersonFirstName)}</first_name>
        <last_name>${escapeXml(reportingPersonLastName)}</last_name>
        <ssn>${escapeXml(reportingPersonSSN)}</ssn>
        <id_number>${escapeXml(reportingPersonID)}</id_number>
        <nationality1>${escapeXml(reportingPersonNationality)}</nationality1>
        <email>${escapeXml(reportingPersonEmail)}</email>
        <occupation>${escapeXml(reportingPersonOccupation)}</occupation>
    </reporting_person>`;

      // Build location section
      const location = `    <location>
        <address_type>BU</address_type>
        <address>${escapeXml(address || '')}</address>
        <city>${escapeXml(city || '')}</city>
        <country_code>${escapeXml((countryCode || 'AE').toUpperCase())}</country_code>
        <state>${escapeXml(state || '')}</state>
    </location>`;

      // Build director section if director exists
      let directorSection = '';
      if (directorInfo) {
        // Get director SSN/ID - use idNumber if available, otherwise use phone
        const directorSSN = directorInfo.idNumber || directorInfo.phone || '';
        const directorID = directorInfo.idNumber || directorInfo.phone || '';
        const directorBirthdate = directorInfo.dateOfBirth ? formatDateTime(directorInfo.dateOfBirth) : '';
        
        directorSection = `                    <director_id>
                        <first_name>${escapeXml((directorInfo.firstName || '').toUpperCase())}</first_name>
                        <last_name>${escapeXml((directorInfo.lastName || '').toUpperCase())}</last_name>
                        <birthdate>${directorBirthdate}</birthdate>
                        <ssn>${escapeXml(directorSSN)}</ssn>
                        <id_number>${escapeXml(directorID)}</id_number>
                        <nationality1>${escapeXml((directorInfo.nationality || 'AE').toUpperCase())}</nationality1>
                        <residence>${escapeXml((directorInfo.countryOfResidence || 'AE').toUpperCase())}</residence>
                        ${directorInfo.phone ? `                        <phones>
                            <phone>
                                <tph_contact_type>BU</tph_contact_type>
                                <tph_communication_type>L</tph_communication_type>
                                <tph_number>${escapeXml(directorInfo.phone)}</tph_number>
                            </phone>
                        </phones>` : ''}
                        <role>ATR</role>
                    </director_id>`;
      }

      // Build entity section
      const entitySection = `                <entity>
                    <name>${escapeXml((customerName || '').toUpperCase())}</name>
                    ${isLegalEntity ? `                    <commercial_name>${escapeXml((commercialName || '').toUpperCase())}</commercial_name>` : ''}
                    ${isLegalEntity && incorporationNumber ? `                    <incorporation_number>${escapeXml(incorporationNumber)}</incorporation_number>` : ''}
                    ${phoneNumber ? `                    <phones>
                        <phone>
                            <tph_contact_type>BU</tph_contact_type>
                            <tph_communication_type>L</tph_communication_type>
                            <tph_number>${escapeXml(phoneNumber)}</tph_number>
                        </phone>
                    </phones>` : ''}
                    ${isLegalEntity && incorporationState ? `                    <incorporation_state>${escapeXml(incorporationState)}</incorporation_state>` : ''}
                    ${isLegalEntity && incorporationCountryCode ? `                    <incorporation_country_code>${escapeXml((incorporationCountryCode || 'AE').toUpperCase())}</incorporation_country_code>` : ''}
                    ${directorSection}
                </entity>`;

      // Build report party section
      const reportParty = `            <report_party>
                ${entitySection}
                <reason>DPMSJ</reason>
                <comments>${escapeXml(tx.reason || tx.description || '')}</comments>
            </report_party>`;

      // Build goods/services section
      const itemType = (tx.item_type || 'GOLD').toUpperCase();
      const estimatedValue = tx.estimated_amount || tx.invoice_amount || 0;
      const disposedValue = tx.invoice_amount || tx.estimated_amount || 0;
      const currencyCode = (tx.currency || 'AED').toUpperCase();
      const registrationDate = formatDateTime(tx.transaction_date);

      const goodsServices = `        <goods_services>
            <item>
                <item_type>${escapeXml(itemType)}</item_type>
                <estimated_value>${estimatedValue}</estimated_value>
                <status_comments>${escapeXml(tx.status_comments || tx.description || '')}</status_comments>
                <disposed_value>${disposedValue}</disposed_value>
                <currency_code>${escapeXml(currencyCode)}</currency_code>
                <registration_date>${registrationDate}</registration_date>
            </item>
        </goods_services>`;

      // Build activity section
      const activity = `    <activity>
        <report_parties>
            ${reportParty}
        </report_parties>
        ${goodsServices}
    </activity>`;

      // Build report indicators
      const reportIndicators = `    <report_indicators>
        <indicator>DPMSJ</indicator>
    </report_indicators>`;

      // Get entity reference (internal reference number or generate one)
      const entityReference = tx.internal_reference_number || `TRS${new Date().getFullYear()}${String(tx.id).substring(0, 6).toUpperCase()}`;
      
      // Get submission date (current date/time)
      const submissionDate = formatDateTime(new Date());
      
      // Get currency code local
      const currencyCodeLocal = (tx.currency || 'AED').toUpperCase();

      // Build complete report with proper GoAML format and indentation
      const xmlHeader = '<?xml version="1.0" encoding="utf-8"?>\n';
      const report = `${xmlHeader}<report>
    <rentity_id>xxx</rentity_id>
    <submission_code>E</submission_code>
    <report_code>DPMSR</report_code>
    <entity_reference>${escapeXml(entityReference)}</entity_reference>
    <submission_date>${submissionDate}</submission_date>
    <currency_code_local>${escapeXml(currencyCodeLocal)}</currency_code_local>
${reportingPerson}
${location}
    <reason>${escapeXml(tx.reason || '')}</reason>
    <action>${escapeXml(tx.action_taken_by_reporting_entity || '')}</action>
${activity}
${reportIndicators}
</report>`;
      
      // Store XML preview for this transaction
      setXmlPreviews(prev => ({
        ...prev,
        [tx.id]: report
      }));
      
      // Save XML to history and mark transaction as having XML generated
      try {
        const now = new Date().toISOString();
        
        // Save to XML history
        const historyResult = await transactionService.saveXmlHistory(tx.id, report, 'XML generated');
        if (!historyResult.success) {
          console.error('Error saving XML history:', historyResult.error);
        }
        
        // Mark transaction as having XML generated in database
        const updateResult = await transactionService.updateTransaction(tx.id, {
          xml_generated_at: now
        });
        
        if (!updateResult || !updateResult.success) {
          console.error('Error updating transaction XML timestamp');
          toast.error('XML generated but failed to save to database. Please try again.');
        } else {
          // Update local transaction state
          const updatedTx = transactions.find(t => t.id === tx.id);
          if (updatedTx) {
            updatedTx.xml_generated_at = now;
            setTransactions([...transactions]);
          }
          // Refresh transactions to get updated data from database
          await fetchTransactions();
        }
      } catch (error) {
        console.error('Error saving XML history or updating timestamp:', error);
        toast.error('XML generated but failed to save to database. Please try again.');
        // Don't fail the whole operation if this update fails
      }
      
      toast.success('XML generated successfully');
    } catch (error) {
      console.error('Error generating XML:', error);
      toast.error('Failed to generate XML report');
    } finally {
      setGeneratingXml(prev => {
        const newSet = new Set(prev);
        newSet.delete(tx.id);
        return newSet;
      });
    }
  };

  // Export XML to file for a specific transaction
  const exportXMLForTransaction = async (transactionId) => {
    const xmlContent = xmlPreviews[transactionId];
    if (!xmlContent) {
      toast.warning('Please generate XML first');
      return;
    }

    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `goaml-report-${transactionId}-${new Date().toISOString().split('T')[0]}.xml`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Mark transaction as exported
    try {
      const updateResult = await transactionService.updateTransaction(transactionId, {
        xml_exported_at: new Date().toISOString()
      });
      if (updateResult && updateResult.success) {
        // Refresh transactions to get updated data
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Error updating XML export timestamp:', error);
    }
    
    toast.success('XML report exported successfully');
  };

  // Regenerate XML for a transaction
  const regenerateXMLForTransaction = async (tx) => {
    // Just call generateXMLForTransaction - it will create a new version
    await generateXMLForTransaction(tx);
  };

  // Bulk generate XML for all approved transactions
  const bulkGenerateXML = async () => {
    const approvedTransactions = transactions.filter(tx => 
      (tx.status || '').toLowerCase() === 'approved' && !xmlPreviews[tx.id]
    );
    
    if (approvedTransactions.length === 0) {
      toast.info('No transactions need XML generation');
      return;
    }
    
    const confirm = window.confirm(
      `Generate XML for ${approvedTransactions.length} transaction(s)? This may take a while.`
    );
    
    if (!confirm) return;
    
    // Generate XML for each transaction sequentially
    for (let i = 0; i < approvedTransactions.length; i++) {
      const tx = approvedTransactions[i];
      setGeneratingXml(prev => new Set([...prev, tx.id]));
      await generateXMLForTransaction(tx);
      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    toast.success(`XML generated for ${approvedTransactions.length} transaction(s)`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">XML Report Format (GoAML)</h1>
          <p className="text-gray-600 mt-1">
            {totalCount} approved transaction{totalCount !== 1 ? 's' : ''} available for XML export
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={bulkGenerateXML}
            disabled={transactions.filter(tx => 
              (tx.status || '').toLowerCase() === 'approved' && !xmlPreviews[tx.id]
            ).length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Generate All XML
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
        </div>
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

      {/* Transactions List */}
      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approved transactions found</h3>
              <p className="text-gray-500">Only approved transactions can be exported to GoAML format.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Customer</th>
                    <th className="p-3 font-medium">Amount</th>
                    <th className="p-3 font-medium">Currency</th>
                    <th className="p-3 font-medium">Payment Mode</th>
                    <th className="p-3 font-medium">Reference Number</th>
                    <th className="p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const customer = tx.customers || {};
                    const customerName = getCustomerDisplayName(customer);
                    const isExpanded = expandedRows.has(tx.id);
                    // Check both xmlPreviews state and xml_generated_at from database
                    const hasXmlPreview = xmlPreviews[tx.id] || tx.xml_generated_at;
                    const isGenerating = generatingXml.has(tx.id);
                    
                    return (
                      <React.Fragment key={tx.id}>
                        {/* Main Row */}
                        <tr
                          onClick={() => toggleRowExpansion(tx.id)}
                          className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="p-3 text-gray-900">
                            {new Date(tx.transaction_date).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-gray-900">{customerName}</td>
                          <td className="p-3 text-gray-900">
                            {parseFloat(tx.invoice_amount || tx.amount || 0).toLocaleString()}
                          </td>
                          <td className="p-3 text-gray-900">{tx.currency || 'N/A'}</td>
                          <td className="p-3 text-gray-900">{tx.payment_mode || tx.transaction_type || 'N/A'}</td>
                          <td className="p-3 text-gray-900">{tx.internal_reference_number || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              (tx.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' :
                              (tx.status || '').toLowerCase() === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {tx.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr className="bg-gray-50 border-b">
                            <td colSpan="7" className="p-4">
                              <div className="space-y-4">
                                {/* Action Buttons */}
                                <div className="flex gap-3 flex-wrap">
                                  {!hasXmlPreview ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        generateXMLForTransaction(tx);
                                      }}
                                      disabled={isGenerating}
                                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                      {isGenerating ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                          Generating...
                                        </>
                                      ) : (
                                        <>
                                          <DocumentArrowDownIcon className="w-4 h-4" />
                                          Generate XML
                                        </>
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        regenerateXMLForTransaction(tx);
                                      }}
                                      disabled={isGenerating}
                                      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                      {isGenerating ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                          Regenerating...
                                        </>
                                      ) : (
                                        <>
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                          </svg>
                                          Regenerate XML
                                        </>
                                      )}
                                    </button>
                                  )}
                                  
                                  {hasXmlPreview && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        exportXMLForTransaction(tx.id);
                                      }}
                                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      <DocumentArrowDownIcon className="w-4 h-4" />
                                      Export XML
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRowExpansion(tx.id);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                                  >
                                    Close
                                  </button>
                                </div>
                                
                                {/* XML Preview */}
                                {hasXmlPreview && (
                                  <div className="bg-white border border-gray-300 rounded-md p-4">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">XML Preview</h3>
                                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 overflow-x-auto">
                                      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                                        {xmlPreviews[tx.id]}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
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
    </div>
  );
};

export default TransactionXMLReport;
