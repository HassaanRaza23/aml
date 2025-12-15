import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerService, verificationService } from "../../services";
import { toast } from "react-toastify";



const ReadOnlyField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <div className="mt-1 text-gray-900">
      {value !== null && value !== undefined && value !== "" ? String(value) : "—"}
    </div>
  </div>
);

const TextAreaField = ({ label, value, onChange }) => (
  <div className="mb-4 col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      className="w-full border border-gray-300 rounded-md p-2"
      rows={3}
      value={value}
      onChange={onChange}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="mb-4 col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      className="w-full border border-gray-300 rounded-md p-2"
      value={value}
      onChange={onChange}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const SubSection = ({ title, children }) => (
  <div className="bg-gradient-to-br from-gray-50 via-gray-100 border border-gray-200 rounded-lg p-5 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="mb-4">
      {typeof title === 'string' ? (
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      ) : (
        title
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const ExpandableSection = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden border border-gray-100">
    <div className="px-4 py-3">
      {typeof title === 'string' ? (
        <h3 className="text-lg font-semibold">{title}</h3>
      ) : (
        title
      )}
    </div>
    <div className="border-t border-gray-100">
      {children}
    </div>
  </div>
);

const KYCDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [ubos, setUbos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to toggle expandable sections
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  // Function to clean up array/JSON fields and remove [] and "" characters
  const cleanFieldValue = (value) => {
    if (!value) return '—';
    
    // If it's a string that looks like JSON/array, try to parse and clean it
    if (typeof value === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // If it's an array, join with commas and clean up
          return parsed.filter(item => item && item.trim() !== '').join(', ') || '—';
        }
        return parsed;
      } catch (e) {
        // If parsing fails, return as is
        return value;
      }
    }
    
    // If it's already an array, join with commas
    if (Array.isArray(value)) {
      return value.filter(item => item && item.trim() !== '').join(', ') || '—';
    }
    
    return value;
  };

  // Load verification checks for the customer
  const loadVerificationChecks = useCallback(async () => {
    if (!customerData?.id) return;
    
    try {
      const result = await verificationService.loadVerificationChecks(customerData.id);
      if (result.success) {
        setVerificationChecks(result.data);
      } else {
        console.error('Error loading verification checks:', result.error);
      }
    } catch (error) {
      console.error('Error loading verification checks:', error);
    }
  }, [customerData?.id]);

  // Fetch all customer data on component mount
  useEffect(() => {
    const fetchAllCustomerData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch main customer record from customers table
        const customerResult = await customerService.getCustomerById(customerId);
        if (!customerResult) {
          setError("Customer not found");
          return;
        }
        
        setCustomerData(customerResult);
        console.log('🔍 Main customer data from customers table:', customerResult);
        
        // 2. Fetch customer type-specific details
        if (customerResult.customer_type === 'Natural Person') {
          // For Natural Person: fetch from natural_person_details table
          const npDetails = await customerService.getNaturalPersonDetails(customerId);
          console.log('👤 Natural person details from natural_person_details table:', npDetails);
          setCustomerDetails(npDetails);
        } else if (customerResult.customer_type === 'Legal Entities') {
          // For Legal Entity: fetch from legal_entity_details table
          const leDetails = await customerService.getLegalEntityDetails(customerId);
          setCustomerDetails(leDetails);
          console.log('🏢 Legal entity details from legal_entity_details table:', leDetails);
        }
        
        // 3. Fetch shareholders (only for Legal Entities, but we'll fetch for both to be safe)
        if (customerResult.customer_type === 'Legal Entities') {
          // Fetch from customer_shareholders table, then from type-specific detail tables
          const shareholdersResult = await customerService.getShareholders(customerId);
          if (shareholdersResult.success) {
            setShareholders(shareholdersResult.data || []);
            console.log('📊 Shareholders data from customer_shareholders + detail tables:', shareholdersResult.data);
          }
        }
        
        // 4. Fetch directors (only for Legal Entities)
        if (customerResult.customer_type === 'Legal Entities') {
          // Fetch from customer_directors table
          const directorsResult = await customerService.getDirectors(customerId);
          if (directorsResult.success) {
            setDirectors(directorsResult.data || []);
            console.log('👔 Directors data from customer_directors table:', directorsResult.data);
          }
        }
        
        // 5. Fetch bank details (available for both customer types)
        // Fetch from customer_bank_details table
        const bankResult = await customerService.getBankDetails(customerId);
        if (bankResult.success) {
          setBankDetails(bankResult.data || []);
          console.log('🏦 Bank details from customer_bank_details table:', bankResult.data);
        }
        
        // 6. Fetch UBOs (only for Legal Entities)
        if (customerResult.customer_type === 'Legal Entities') {
          // Fetch from customer_ubos table
          const ubosResult = await customerService.getUbos(customerId);
          if (ubosResult.success) {
            setUbos(ubosResult.data || []);
            console.log('🔍 UBOs data from customer_ubos table:', ubosResult.data);
          }
        }
        
      } catch (error) {
        console.error("Error fetching customer data:", error);
        setError("Failed to fetch customer data");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchAllCustomerData();
    }
  }, [customerId]);

  // Update KYC status and load verification checks when customer data is loaded
  useEffect(() => {
    if (customerData) {
      setKycStatus(customerData.kyc_status || "Pending");
      setRemarks(customerData.kyc_remarks || "");
      
      // Set due diligence level from database (calculated during risk assessment)
      setDueDiligenceLevel(customerData.due_diligence_level || "Simplified Customer Due Diligence");
      
      // Load verification checks
      loadVerificationChecks();
    }
  }, [customerData, loadVerificationChecks]);


  // Local state for KYC assessment inputs
  const [kycStatus, setKycStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [dueDiligenceLevel, setDueDiligenceLevel] = useState("Standard");
  const [remarksError, setRemarksError] = useState("");

  const [verificationChecks, setVerificationChecks] = useState({});
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    shareholders: false,
    directors: false,
    bankDetails: false,
    ubos: false
  });

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading customer data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !customerData) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading customer</h3>
              <div className="mt-2 text-sm text-red-700">{error || "Customer not found"}</div>
              <button
                onClick={() => navigate("/customer/list")}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                Back to Customer List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/customer/list")}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Customer List
        </button>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {customerData.customer_type === 'Natural Person' 
              ? `${customerDetails?.firstname || ''} ${customerDetails?.lastname || ''}`.trim()
              : customerDetails?.legalname || customerDetails?.alias || 'Legal Entity'
            }
          </h2>
          <p className="text-gray-600">
            {customerData.customer_type}
          </p>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              kycStatus === "Approved"
                ? "bg-green-100 text-green-800"
                : kycStatus === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {kycStatus}
          </span>
          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
            customerData.risk_level === 'High' 
              ? 'bg-red-100 text-red-800 border border-red-200'
              : customerData.risk_level === 'Medium'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}>
            Risk: {customerData.risk_level || 'Low'}
          </span>
        </div>
      </div>

      {/* KYC Sections - Dynamic based on customer type */}
      {customerData.customer_type === 'Natural Person' ? (
        /* Natural Person Information */
      <Section title="Personal Information">
            <ReadOnlyField label="First Name" value={customerDetails?.firstname || '—'} />
            <ReadOnlyField label="Last Name" value={customerDetails?.lastname || '—'} />
            <ReadOnlyField label="Alias" value={customerDetails?.alias || '—'} />
            <ReadOnlyField label="Profession" value={customerDetails?.profession || '—'} />
            <ReadOnlyField label="Nationality" value={customerDetails?.nationality || '—'} />
            <ReadOnlyField label="Date of Birth" value={customerDetails?.dateofbirth || '—'} />
            <ReadOnlyField label="Country of Birth" value={customerDetails?.countryofbirth || '—'} />
            <ReadOnlyField label="Gender" value={customerDetails?.gender || '—'} />
            <ReadOnlyField label="Occupation" value={customerDetails?.occupation || '—'} />
            <ReadOnlyField label="Employer" value={customerDetails?.employer || '—'} />
            <ReadOnlyField label="PEP Status" value={customerDetails?.pep || '—'} />
          </Section>
      ) : (
        /* Legal Entity Information - Organized into logical sections */
        <>
          {/* Company Profile */}
          <Section title="Company Profile">
            <ReadOnlyField label="Legal Name" value={customerDetails?.legalname || '—'} />
            <ReadOnlyField label="Business Activity" value={cleanFieldValue(customerDetails?.businessactivity)} />
            <ReadOnlyField label="Alias" value={customerDetails?.alias || '—'} />
            <ReadOnlyField label="Date of Incorporation" value={customerDetails?.dateofincorporation || '—'} />
            <ReadOnlyField label="Country of Incorporation" value={customerDetails?.countryofincorporation || '—'} />
            <ReadOnlyField label="Jurisdiction" value={cleanFieldValue(customerDetails?.jurisdiction)} />
            <ReadOnlyField label="Management Company" value={customerDetails?.managementcompany || '—'} />
          </Section>

          {/* Regulatory Compliance */}
          <Section title="Regulatory Compliance">
            <ReadOnlyField label="License Type" value={customerDetails?.licensetype || '—'} />
            <ReadOnlyField label="License Number" value={customerDetails?.licensenumber || '—'} />
            <ReadOnlyField label="Issue Date" value={customerDetails?.licenseissuedate || '—'} />
            <ReadOnlyField label="Expiry Date" value={customerDetails?.licenseexpirydate || '—'} />
            <ReadOnlyField label="License Category" value={customerDetails?.licensecategory || '—'} />
            <ReadOnlyField label="Licensing Auth" value={customerDetails?.licensingauthority || '—'} />
            <ReadOnlyField label="TRN" value={customerDetails?.trn || '—'} />
          </Section>

          {/* Geographic Operations */}
          <Section title="Geographic Operations">
            <ReadOnlyField label="Countries of Operation" value={cleanFieldValue(customerDetails?.countriesofoperation)} />
            <ReadOnlyField label="Countries Source of Funds" value={cleanFieldValue(customerDetails?.countriessourceoffunds)} />
            <ReadOnlyField label="Registered Office Address" value={customerDetails?.registeredofficeaddress || '—'} />
            <ReadOnlyField label="Address Expiry Date" value={customerDetails?.addressexpirydate || '—'} />
      </Section>

          {/* Financial Profile */}
          <Section title="Financial Profile">
            <ReadOnlyField label="Source of Funds" value={customerDetails?.sourceoffunds || '—'} />
            <ReadOnlyField label="Residency Status" value={customerDetails?.residencystatus || '—'} />
          </Section>
        </>
      )}

      <Section title="Contact Information">
        <ReadOnlyField label="Email" value={customerData.email || '—'} />
        <ReadOnlyField label="Phone Number" value={customerData.phone || '—'} />
        <ReadOnlyField label="Channel" value={customerData.channel || '—'} />
        
        
        {/* Natural Person specific contact fields */}
        {customerData.customer_type === 'Natural Person' && customerDetails && (
          <>
            <ReadOnlyField label="City" value={customerDetails.city || '—'} />
            <ReadOnlyField label="Address" value={customerDetails.address || '—'} />
            <ReadOnlyField label="P.O. Box" value={customerDetails.pobox || '—'} />
          </>
        )}
        
        {/* Legal Entity specific contact fields */}
        {customerData.customer_type === 'Legal Entities' && customerDetails && (
          <>
            <ReadOnlyField label="City" value={customerDetails.city || '—'} />
          </>
        )}
      </Section>

      {/* ID Information - Only for Natural Person */}
      {customerData.customer_type === 'Natural Person' && customerDetails && (
      <Section title="ID Information">
               <ReadOnlyField label="Residency Status" value={customerDetails?.residencystatus || '—'} />
          <ReadOnlyField label="ID Type" value={customerDetails?.idtype || '—'} />
          <ReadOnlyField label="ID Number" value={customerDetails?.idnumber || '—'} />
          <ReadOnlyField label="Issue Date" value={customerDetails?.issuedate || '—'} />
          <ReadOnlyField label="Expiry Date" value={customerDetails?.expirydate || '—'} />
          <ReadOnlyField label="Is Dual Nationality" value={customerDetails?.isdualnationality ? 'Yes' : 'No'} />
          {customerDetails?.isdualnationality && (
            <>
              <ReadOnlyField label="Dual Nationality" value={customerDetails?.dualnationality || '—'} />
              <ReadOnlyField label="Dual Passport Number" value={customerDetails?.dualpassportnumber || '—'} />
              <ReadOnlyField label="Dual Passport Issue Date" value={customerDetails?.dualpassportissuedate || '—'} />
              <ReadOnlyField label="Dual Passport Expiry Date" value={customerDetails?.dualpassportexpirydate || '—'} />
            </>
          )}
      </Section>
      )}

      {/* Funds & Wealth - Only for Natural Person */}
      {customerData.customer_type === 'Natural Person' && customerDetails && (
      <Section title="Funds & Wealth">
          <ReadOnlyField label="Source of Wealth" value={customerDetails?.sourceofwealth || '—'} />
          <ReadOnlyField label="Source of Funds" value={customerDetails?.sourceoffunds || '—'} />
          <ReadOnlyField label="Transaction Product" value={customerData.transaction_product || '—'} />
          <ReadOnlyField label="Transaction Amount Limit" value={customerData.transaction_amount_limit || '—'} />
          <ReadOnlyField label="Transaction Limit" value={customerData.transaction_limit || '—'} />
      </Section>
      )}


            {/* Shareholders - Only for Legal Entity customers */}
      {customerData.customer_type === 'Legal Entities' && (
          <ExpandableSection title={
            <div className="flex items-center justify-between w-full py-1">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Shareholder Details</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {shareholders.length} {shareholders.length === 1 ? 'Shareholder' : 'Shareholders'}
                </span>
              </div>
              <button
                onClick={() => toggleSection('shareholders')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300"
              >
                <span className="text-sm font-medium">
                  {expandedSections.shareholders ? 'Collapse' : 'Expand'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    expandedSections.shareholders ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
                </svg>
              </button>
            </div>
          }>
            {expandedSections.shareholders && (
              <div className="px-4 pb-4">
                {shareholders.length > 0 ? (
                  <div className="space-y-6 pt-4">
                    {shareholders.map((sh, i) => (
                      <SubSection key={i} title={
                        <div className="space-y-1">
                          <div className="text-xl font-semibold text-gray-900">
                            {sh.type === 'Natural Person' ? sh.fullName : sh.type === 'Legal Entities' ? sh.legalName : sh.trustName || 'Shareholder'}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {sh.type}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {sh.shareholding ? `${sh.shareholding}%` : '0%'} shareholding
                            </span>
                          </div>
                        </div>
                      }>
                        {/* Natural Person Shareholder Details */}
                        {sh.type === 'Natural Person' && (
                          <>
                            <ReadOnlyField label="Full Name" value={sh.fullName || '—'} />
                            <ReadOnlyField label="Alias" value={sh.alias || '—'} />
                            <ReadOnlyField label="Country of Residence" value={sh.countryOfResidence || '—'} />
                            <ReadOnlyField label="Nationality" value={sh.nationality || '—'} />
                            <ReadOnlyField label="Date of Birth" value={sh.dateOfBirth || '—'} />
                            <ReadOnlyField label="Place of Birth" value={sh.placeOfBirth || '—'} />
                            <ReadOnlyField label="Phone" value={sh.phone || '—'} />
                            <ReadOnlyField label="Email" value={sh.email || '—'} />
                            <ReadOnlyField label="Address" value={sh.address || '—'} />
                            <ReadOnlyField label="Source of Funds" value={sh.sourceOfFunds || '—'} />
                            <ReadOnlyField label="Source of Wealth" value={sh.sourceOfWealth || '—'} />
                            <ReadOnlyField label="Occupation" value={sh.occupation || '—'} />
                            <ReadOnlyField label="Expected Income Range Annually" value={sh.expectedIncome || '—'} />
                            <ReadOnlyField label="PEP Status" value={sh.pep || '—'} />
                            <ReadOnlyField label="Dual Nationality" value={sh.dualNationality || '—'} />
                            <ReadOnlyField label="Is Director" value={sh.isDirector ? 'Yes' : 'No'} />
                            <ReadOnlyField label="Is UBO" value={sh.isUbo ? 'Yes' : 'No'} />
                          </>
                        )}
                        
                        {/* Legal Entity Shareholder Details */}
                        {sh.type === 'Legal Entities' && (
                          <>
                            <ReadOnlyField label="Legal Name" value={sh.legalName || '—'} />
                            <ReadOnlyField label="Alias" value={sh.alias || '—'} />
                            <ReadOnlyField label="Date of Incorporation" value={sh.dateOfIncorporation || '—'} />
                            <ReadOnlyField label="Country of Incorporation" value={sh.countryOfIncorporation || '—'} />
                            <ReadOnlyField label="Type" value={sh.entityClass || '—'} />
                            <ReadOnlyField label="License Type" value={sh.licenseType || '—'} />
                            <ReadOnlyField label="License Number" value={sh.licenseNumber || '—'} />
                            <ReadOnlyField label="Issue Date" value={sh.licenseIssueDate || '—'} />
                            <ReadOnlyField label="Expiry Date" value={sh.licenseExpiryDate || '—'} />
                            <ReadOnlyField label="Business Activity" value={cleanFieldValue(sh.businessActivity)} />
                            <ReadOnlyField label="Countries of Operation" value={cleanFieldValue(sh.countriesOfOperation)} />
                            <ReadOnlyField label="Source of Funds" value={sh.sourceOfFunds || '—'} />
                            <ReadOnlyField label="Registered Office Address" value={sh.registeredOfficeAddress || '—'} />
                            <ReadOnlyField label="Countries Source of Funds" value={cleanFieldValue(sh.countriesSourceOfFunds)} />
                            <ReadOnlyField label="Email" value={sh.email || '—'} />
                            <ReadOnlyField label="Phone" value={sh.phone || '—'} />
                            <ReadOnlyField label="Other Details" value={sh.otherDetails || '—'} />
                            <ReadOnlyField label="% Shareholding" value={sh.shareholding ? `${sh.shareholding}%` : '—'} />
                          </>
                        )}
                        
                        {/* Trust Shareholder Details */}
                        {sh.type === 'Trust' && (
                          <>
                            <ReadOnlyField label="Trust Name" value={sh.trustName || '—'} />
                            <ReadOnlyField label="Alias" value={sh.alias || '—'} />
                            <ReadOnlyField label="Trust Registered" value={sh.trustRegistered ? 'Yes' : 'No'} />
                            <ReadOnlyField label="Type of Trust" value={sh.trustType || '—'} />
                            <ReadOnlyField label="Jurisdiction of Law" value={sh.jurisdictionOfLaw || '—'} />
                            <ReadOnlyField label="Registered Address" value={sh.registeredAddress || '—'} />
                            <ReadOnlyField label="% Shareholding" value={sh.shareholding ? `${sh.shareholding}%` : '0%'} />
                            <ReadOnlyField label="Name of Trustee" value={sh.trusteeName || '—'} />
                            <ReadOnlyField label="Trustee Type" value={sh.trusteeType || '—'} />
                          </>
                        )}
                      </SubSection>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No Shareholders Added</p>
                    <p className="text-gray-400 text-sm mt-1">This customer doesn't have any shareholders yet</p>
                  </div>
                )}
              </div>
            )}
          </ExpandableSection>
      )}

            {/* Directors - Only for Legal Entity customers */}
      {customerData.customer_type === 'Legal Entities' && (
          <ExpandableSection title={
            <div className="flex items-center justify-between w-full py-1">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">Directors / Representative Details</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {directors.length} {directors.length === 1 ? 'Director' : 'Directors'}
                </span>
              </div>
              <button
                onClick={() => toggleSection('directors')}
                className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 border border-purple-200 hover:border-purple-300"
              >
                <span className="text-sm font-medium">
                  {expandedSections.directors ? 'Collapse' : 'Expand'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    expandedSections.directors ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
                </svg>
              </button>
            </div>
          }>
            {expandedSections.directors && (
              <div className="px-4 pb-4">
                {directors.length > 0 ? (
                  <div className="space-y-6 pt-4">
                    {directors.map((director, i) => (
                      <SubSection key={i} title={
                        <div className="space-y-1">
                          <div className="text-xl font-semibold text-gray-900">
                            {`${director.firstName || ''} ${director.lastName || ''}`.trim() || 'Director'}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Director
                            </span>
                            {director.isRepresentative && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Representative
                              </span>
                            )}
                            {director.isCeo && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                CEO
                              </span>
                            )}
                          </div>
                        </div>
                      }>
                        <ReadOnlyField label="First Name" value={director.firstName || '—'} />
                        <ReadOnlyField label="Last Name" value={director.lastName || '—'} />
                        <ReadOnlyField label="Alias" value={director.alias || '—'} />
                        <ReadOnlyField label="Country of Residence" value={director.countryOfResidence || '—'} />
                        <ReadOnlyField label="Nationality" value={director.nationality || '—'} />
                        <ReadOnlyField label="Date of Birth" value={director.dateOfBirth || '—'} />
                        <ReadOnlyField label="Phone" value={director.phone || '—'} />
                        <ReadOnlyField label="Place of Birth" value={director.placeOfBirth || '—'} />
                        <ReadOnlyField label="Email" value={director.email || '—'} />
                        <ReadOnlyField label="Address" value={director.address || '—'} />
                        <ReadOnlyField label="City" value={director.city || '—'} />
                        <ReadOnlyField label="Occupation" value={director.occupation || '—'} />
                        <ReadOnlyField label="PEP Status" value={director.pepStatus || '—'} />
                        <ReadOnlyField label="Is CEO" value={director.isCeo ? 'Yes' : 'No'} />
                        <ReadOnlyField label="Is Representative" value={director.isRepresentative ? 'Yes' : 'No'} />
                        <ReadOnlyField label="Dual Nationality" value={director.dualNationality|| '—'} />
                      </SubSection>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No Directors Added</p>
                    <p className="text-gray-400 text-sm mt-1">This customer doesn't have any directors yet</p>
                  </div>
                )}
              </div>
            )}
        </ExpandableSection>
      )}

            {/* Bank Details */}
      <ExpandableSection title={
        <div className="flex items-center justify-between w-full py-1">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-800">Bank Details</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {bankDetails.length} {bankDetails.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>
          <button
            onClick={() => toggleSection('bankDetails')}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
          >
            <span className="text-sm font-medium">
              {expandedSections.bankDetails ? 'Collapse' : 'Expand'}
            </span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                expandedSections.bankDetails ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
            </svg>
          </button>
        </div>
      }>
        {expandedSections.bankDetails && (
          <div className="px-4 pb-4">
            {bankDetails.length > 0 ? (
              <div className="space-y-6 pt-4">
                {bankDetails.map((bank, i) => (
                  <SubSection key={i} title={
                    <div className="space-y-1">
                      <div className="text-xl font-semibold text-gray-900">
                        {bank.bank_name || `Bank Account ${i + 1}`}
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {bank.account_type || 'Account'}
                        </span>
                        {bank.currency && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {bank.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  }>
                    <ReadOnlyField label="Bank Name" value={bank.bank_name || '—'} />
                    <ReadOnlyField label="Alias" value={bank.alias || '—'} />
                    <ReadOnlyField label="Account Type" value={bank.account_type || '—'} />
                    <ReadOnlyField label="Currency" value={bank.currency || '—'} />
                    <ReadOnlyField label="Bank Account Details" value={bank.bank_account_details || '—'} />
                    <ReadOnlyField label="Account Number" value={bank.account_number || '—'} />
                    <ReadOnlyField label="IBAN" value={bank.iban || '—'} />
                    <ReadOnlyField label="SWIFT" value={bank.swift || '—'} />
                    <ReadOnlyField label="Mode of Signatory" value={bank.mode_of_signatory || '—'} />
                    <ReadOnlyField label="Internet Banking" value={bank.internet_banking || '—'} />
                    <ReadOnlyField label="Bank Signatories" value={bank.bank_signatories || '—'} />
                  </SubSection>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg font-medium">No Bank Details</p>
                <p className="text-gray-400 text-sm mt-1">This customer doesn't have any bank accounts yet</p>
              </div>
            )}
          </div>
        )}
      </ExpandableSection>

                  {/* UBOs - Only for Legal Entity customers */}
      {customerData.customer_type === 'Legal Entities' && (
          <ExpandableSection title={
            <div className="flex items-center justify-between w-full py-1">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800">UBO Details</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {ubos.length} {ubos.length === 1 ? 'UBO' : 'UBOs'}
                </span>
              </div>
              <button
                onClick={() => toggleSection('ubos')}
                className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200 border border-orange-200 hover:border-orange-300"
              >
                <span className="text-sm font-medium">
                  {expandedSections.ubos ? 'Collapse' : 'Expand'}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${
                    expandedSections.ubos ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7" />
                </svg>
              </button>
            </div>
          }>
            {expandedSections.ubos && (
              <div className="px-4 pb-4">
                {ubos.length > 0 ? (
                  <div className="space-y-6 pt-4">
                    {ubos.map((ubo, i) => (
                      <SubSection key={i} title={
                        <div className="space-y-1">
                          <div className="text-xl font-semibold text-gray-900">
                            {ubo.fullName || `UBO ${i + 1}`}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              UBO
                            </span>
                            {ubo.shareholding && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {ubo.shareholding}% shareholding
                              </span>
                            )}
                            {ubo.pep && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {ubo.pep}
                              </span>
                            )}
                          </div>
                        </div>
                      }>
                        <ReadOnlyField label="Full Name" value={ubo.fullName || '—'} />
                        <ReadOnlyField label="Alias" value={ubo.alias || '—'} />
                        <ReadOnlyField label="Country of Residence" value={ubo.countryOfResidence || '—'} />
                        <ReadOnlyField label="Nationality" value={ubo.nationality || '—'} />
                        <ReadOnlyField label="Date of Birth" value={ubo.dateOfBirth || '—'} />
                        <ReadOnlyField label="Place of Birth" value={ubo.placeOfBirth || '—'} />
                        <ReadOnlyField label="Phone" value={ubo.phone || '—'} />
                        <ReadOnlyField label="Email" value={ubo.email || '—'} />
                        <ReadOnlyField label="Address" value={ubo.address || '—'} />
                        <ReadOnlyField label="Source of Funds" value={ubo.sourceOfFunds || '—'} />
                        <ReadOnlyField label="Source of Wealth" value={ubo.sourceOfWealth || '—'} />
                        <ReadOnlyField label="Occupation" value={ubo.occupation || '—'} />
                        <ReadOnlyField label="Expected Income" value={ubo.expectedIncome || '—'} />
                        <ReadOnlyField label="PEP Status" value={ubo.pep || '—'} />
                        <ReadOnlyField label="Dual Nationality" value={ubo.dualNationality || '—'} />
                      </SubSection>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No UBOs Added</p>
                    <p className="text-gray-400 text-sm mt-1">This customer doesn't have any UBOs yet</p>
                  </div>
                )}
              </div>
            )}
        </ExpandableSection>
      )}



      {/* ✅ Due Diligence Level */}
      <Section title="Due Diligence">
        <div className="mb-4 col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Diligence Level
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={dueDiligenceLevel}
            onChange={(e) => setDueDiligenceLevel(e.target.value)}
          >
            <option value="Simplified Customer Due Diligence">Simplified Customer Due Diligence</option>
            <option value="Customer Due Diligence">Customer Due Diligence</option>
            <option value="Enhanced Customer Due Diligence">Enhanced Customer Due Diligence</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Calculated from risk level: {customerData?.risk_level || 'Low'}
          </p>
        </div>
      </Section>

      {/* ✅ Additional Checks */}
        <Section title="Background & Verification Checks">
        {verificationService.getDefaultQuestions(dueDiligenceLevel).map((item, index) => {
          // If it's a heading, render it as a heading
          if (item.type === "heading") {
            return (
              <div key={`heading-${index}`} className="col-span-2 mb-3 mt-4 first:mt-0">
                <h4 className="text-base font-semibold text-gray-800">{item.label}</h4>
              </div>
            );
          }
          
          // Otherwise, render as a question
          const { label, key } = item;
          return (
            <div key={key} className="col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center space-x-6 mb-2">
                <label className="flex items-center space-x-2">
                <input
                    type="radio"
                    name={key}
                    value="yes"
                    checked={verificationChecks[key]?.answer === "yes"}
                    onChange={() =>
                    setVerificationChecks((prev) => ({
                        ...prev,
                        [key]: { answer: "yes", notes: prev[key]?.notes || "" },
                    }))
                    }
                />
                <span>Yes</span>
                </label>
                <label className="flex items-center space-x-2">
                <input
                    type="radio"
                    name={key}
                    value="no"
                    checked={verificationChecks[key]?.answer === "no"}
                    onChange={() =>
                    setVerificationChecks((prev) => ({
                        ...prev,
                        [key]: { answer: "no", notes: "" },
                    }))
                    }
                />
                <span>No</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={key}
                    value="n/a"
                    checked={verificationChecks[key]?.answer === "n/a"}
                    onChange={() =>
                      setVerificationChecks((prev) => ({
                        ...prev,
                        [key]: { answer: "n/a", notes: "" },
                      }))
                    }
                  />
                  <span>N/A</span>
                </label>
            </div>
            {verificationChecks[key]?.answer === "yes" && (
                <textarea
                className="w-full border border-gray-300 rounded-md p-2"
                rows={3}
                placeholder="Add justification or notes..."
                value={verificationChecks[key]?.notes || ""}
                onChange={(e) =>
                    setVerificationChecks((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], notes: e.target.value },
                    }))
                }
                />
            )}
            </div>
          );
        })}
        </Section>


      {/* ✅ Final KYC Assessment */}
      <Section title="Final KYC Assessment">
        <SelectField
          label="KYC Status"
          value={kycStatus}
          onChange={(e) => setKycStatus(e.target.value)}
          options={["Pending", "Approved", "Rejected"]}
        />
        <div className="mb-4 col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`w-full border rounded-md p-2 ${remarksError ? 'border-red-500' : 'border-gray-300'}`}
            rows={3}
          value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (remarksError && e.target.value.trim()) {
                setRemarksError("");
              }
            }}
            required
          />
          {remarksError && (
            <p className="text-red-500 text-xs mt-1">{remarksError}</p>
          )}
        </div>
      </Section>

      <div className="text-right mt-6">
        <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={async () => {
              try {
                // Validate remarks
                if (!remarks || !remarks.trim()) {
                  setRemarksError("Remarks are required");
                  toast.error("Please provide remarks before saving");
                  return;
                }

                // Save verification checks first
                const verificationResult = await verificationService.saveVerificationChecks(
                  customerData.id, 
                  verificationChecks
                );
                
                if (!verificationResult.success) {
                  toast.error(`Failed to save verification checks: ${verificationResult.error}`);
                  return;
                }

                // Update customer KYC status, remarks, and due diligence level
                const kycPayload = {
                  kyc_status: kycStatus,
                  kyc_remarks: remarks.trim(),
                  due_diligence_level: dueDiligenceLevel,
                };
                
                console.log("Final KYC Decision:", kycPayload);
                
                const result = await customerService.updateCustomer(customerData.id, kycPayload);
                
                if (result.success) {
                  toast.success("KYC assessment saved successfully!");
                  navigate("/customer/list");
                } else {
                  toast.error(result.error || "Failed to save KYC assessment");
                }
              } catch (error) {
                console.error("Error saving KYC assessment:", error);
                toast.error("Failed to save KYC assessment");
              }
            }}
        >
            Save KYC Assessment
        </button>
      </div>

    </div>
  );
};

export default KYCDetails;
