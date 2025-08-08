import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerService, verificationService } from "../../services";
import { toast } from "react-toastify";



const ReadOnlyField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <div className="mt-1 text-gray-900">
      {value && value.trim() !== "" ? value : "—"}
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

const KYCDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer data on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const result = await customerService.getCustomerById(customerId);
        
        if (result) {
          setCustomerData(result);
        } else {
          setError("Customer not found");
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError("Failed to fetch customer data");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  // Update KYC status and load verification checks when customer data is loaded
  useEffect(() => {
    if (customerData) {
      setKycStatus(customerData.kyc_status || "Pending");
      setRemarks(customerData.kyc_remarks || "");
      setDueDiligenceLevel(customerData.due_diligence_level || "Standard");
      
      // Load verification checks
      loadVerificationChecks();
    }
  }, [customerData]);

  // Load verification checks for the customer
  const loadVerificationChecks = async () => {
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
  };

  // Determine Due Diligence Level from Risk Score
  const getDueDiligenceLevel = (riskScore) => {
    if (typeof riskScore === "string") {
      riskScore = riskScore.toLowerCase();
      if (riskScore === "low") return "Simplified Due Diligence (SDD)";
      if (riskScore === "medium") return "Customer Due Diligence (CDD)";
      if (riskScore === "high") return "Enhanced Due Diligence (EDD)";
      return "Customer Due Diligence (CDD)";
    }
    if (riskScore < 40) return "Simplified Due Diligence (SDD)";
    if (riskScore < 70) return "Customer Due Diligence (CDD)";
    return "Enhanced Due Diligence (EDD)";
  };

  // Local state for KYC assessment inputs
  const [background, setBackground] = useState("");
  const [fundsComment, setFundsComment] = useState("");
  const [wealthComment, setWealthComment] = useState("");
  const [kycStatus, setKycStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [dueDiligenceLevel, setDueDiligenceLevel] = useState("Standard");

  const [verificationChecks, setVerificationChecks] = useState({});

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
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
              ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim()
              : customerData.first_name || customerData.alias || 'Legal Entity'
            }
          </h2>
          <p className="text-gray-600">
            {customerData.nationality} | {customerData.customer_type}
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
          <span className="ml-4 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
            Risk: {customerData.risk_level || 'Low'}
          </span>
        </div>
      </div>

      {/* KYC Sections */}
      <Section title="Personal Information">
        <ReadOnlyField 
          label="Full Name" 
          value={customerData.customer_type === 'Natural Person' 
            ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim()
            : customerData.first_name || customerData.alias || 'Legal Entity'
          } 
        />
        <ReadOnlyField label="Profession" value={customerData.profession} />
        <ReadOnlyField label="Nationality" value={customerData.nationality} />
        <ReadOnlyField label="Customer Type" value={customerData.customer_type} />
      </Section>

      <Section title="Contact Information">
        <ReadOnlyField label="Email" value={customerData.email} />
        <ReadOnlyField label="Phone Number" value={customerData.phone} />
      </Section>

      <Section title="ID Information">
        <ReadOnlyField label="ID Type" value={customerData.id_type} />
        <ReadOnlyField label="ID Number" value={customerData.id_number} />
      </Section>

      <Section title="Funds & Wealth">
        <ReadOnlyField label="Source of Wealth" value={customerData.source_of_wealth} />
        <ReadOnlyField label="Source of Funds" value={customerData.source_of_funds} />
      </Section>

      <Section title="Other Info">
        <ReadOnlyField label="PEP Status" value={customerData.pep_status} />
        <ReadOnlyField label="Residency Status" value={customerData.residency_status} />
        <ReadOnlyField label="Gender" value={customerData.gender} />
      </Section>

      {/* Bank Details */}
      <Section title="Bank Information">
        {customerData.customer_bank_details?.length > 0 ? (
          customerData.customer_bank_details.map((bank, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 mb-2 col-span-2"
            >
              <p><strong>Bank Name:</strong> {bank.bank_name}</p>
              <p><strong>Account Type:</strong> {bank.account_type}</p>
              <p><strong>Currency:</strong> {bank.currency}</p>
              <p><strong>Account Number:</strong> {bank.account_number}</p>
              <p><strong>IBAN:</strong> {bank.iban}</p>
              <p><strong>SWIFT:</strong> {bank.swift}</p>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-gray-500 italic">
            No bank details available
          </div>
        )}
      </Section>

      {/* Directors */}
      <Section title="Directors/Representatives">
        {customerData.customer_directors?.length > 0 ? (
          customerData.customer_directors.map((director, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 mb-2 col-span-2"
            >
              <p><strong>Name:</strong> {director.first_name} {director.last_name}</p>
              <p><strong>Nationality:</strong> {director.nationality}</p>
              <p><strong>Position:</strong> {director.position}</p>
              <p><strong>PEP Status:</strong> {director.pep_status}</p>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-gray-500 italic">
            No directors/representatives information available
          </div>
        )}
      </Section>

      {/* UBOs */}
      <Section title="Ultimate Beneficial Owners (UBOs)">
        {customerData.customer_ubos?.length > 0 ? (
          customerData.customer_ubos.map((ubo, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 mb-2 col-span-2"
            >
              <p><strong>Name:</strong> {ubo.ubo_name}</p>
              <p><strong>Type:</strong> {ubo.ubo_type}</p>
              <p><strong>Nationality:</strong> {ubo.nationality}</p>
              <p><strong>Shareholding:</strong> {ubo.shareholding_percentage}%</p>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-gray-500 italic">
            No UBO information available
          </div>
        )}
      </Section>

      {/* Shareholders */}
      <Section title="Shareholders">
        {customerData.customer_shareholders?.length > 0 ? (
          customerData.customer_shareholders.map((sh, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 mb-2 col-span-2"
            >
              <p>
                <strong>Name:</strong> {sh.full_name || sh.entity_name}
              </p>
              <p>
                <strong>Type:</strong> {sh.entity_type}
              </p>
              <p>
                <strong>Ownership:</strong> {sh.shareholding_percentage}%
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-gray-500 italic">
            No shareholders information available
          </div>
        )}
      </Section>

      {/* ✅ Due Diligence Level */}
      <Section title="Due Diligence">
        <div className="mb-4 col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Diligence Level</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={dueDiligenceLevel}
            onChange={(e) => setDueDiligenceLevel(e.target.value)}
          >
            <option value="Simplified Due Diligence (SDD)">Simplified Due Diligence (SDD)</option>
            <option value="Customer Due Diligence (CDD)">Customer Due Diligence (CDD)</option>
            <option value="Enhanced Due Diligence (EDD)">Enhanced Due Diligence (EDD)</option>
          </select>
        </div>
      </Section>

      {/* ✅ Additional Checks */}
        <Section title="Background & Verification Checks">
        {verificationService.getDefaultQuestions().map(({ label, key }) => (
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
        ))}
        </Section>


      {/* ✅ Final KYC Assessment */}
      <Section title="Final KYC Assessment">
        <SelectField
          label="KYC Status"
          value={kycStatus}
          onChange={(e) => setKycStatus(e.target.value)}
          options={["Pending", "Approved", "Rejected"]}
        />
        <TextAreaField
          label="Remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Section>

      <div className="text-right mt-6">
        <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={async () => {
              try {
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
                  kyc_remarks: remarks,
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
