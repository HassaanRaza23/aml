import React, { useState } from "react";



const ReadOnlyField = ({ label, value }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-600">{label}</label>
    <div className="mt-1 text-gray-900">{value || "—"}</div>
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

const KYCDetails = ({ customer }) => {
  const customerData = customer || {
    fullName: "Ahmed Khan",
    nationality: "Pakistan",
    customerType: "Natural Person",
    riskScore: "Medium",
    kycStatus: "Pending",
    profession: "White Collar",
    idType: "Emirates ID",
    idNumber: "784-1984-1234567-1",
    sourceOfWealth: "Salary",
    sourceOfFunds: "Business Proceeds",
    pepStatus: "No",
    residencyStatus: "Resident",
    gender: "Male",
    contactEmail: "ahmed@example.com",
    phoneNumber: "+971501234567",
    bankName: "Emirates NBD",
    iban: "AE070331234567890123456",
    shareholders: [
      { name: "Ali Raza", ownership: "40%" },
      { name: "Sara Khan", ownership: "60%" },
    ],
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
  const [kycStatus, setKycStatus] = useState(customerData.kycStatus || "Pending");
  const [remarks, setRemarks] = useState("");

  const [verificationChecks, setVerificationChecks] = useState({});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{customerData.fullName}</h2>
          <p className="text-gray-600">
            {customerData.nationality} | {customerData.customerType}
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
            Risk: {customerData.riskScore}
          </span>
        </div>
      </div>

      {/* KYC Sections */}
      <Section title="Personal Information">
        <ReadOnlyField label="Full Name" value={customerData.fullName} />
        <ReadOnlyField label="Profession" value={customerData.profession} />
        <ReadOnlyField label="Nationality" value={customerData.nationality} />
        <ReadOnlyField label="Customer Type" value={customerData.customerType} />
      </Section>

      <Section title="Contact Information">
        <ReadOnlyField label="Email" value={customerData.contactEmail} />
        <ReadOnlyField label="Phone Number" value={customerData.phoneNumber} />
      </Section>

      <Section title="ID Information">
        <ReadOnlyField label="ID Type" value={customerData.idType} />
        <ReadOnlyField label="ID Number" value={customerData.idNumber} />
      </Section>

      <Section title="Funds & Wealth">
        <ReadOnlyField label="Source of Wealth" value={customerData.sourceOfWealth} />
        <ReadOnlyField label="Source of Funds" value={customerData.sourceOfFunds} />
      </Section>

      <Section title="Other Info">
        <ReadOnlyField label="PEP Status" value={customerData.pepStatus} />
        <ReadOnlyField label="Residency Status" value={customerData.residencyStatus} />
        <ReadOnlyField label="Gender" value={customerData.gender} />
      </Section>

      <Section title="Bank Information">
        <ReadOnlyField label="Bank Name" value={customerData.bankName} />
        <ReadOnlyField label="IBAN" value={customerData.iban} />
      </Section>

      {/* Shareholders */}
      {customerData.shareholders?.length > 0 && (
        <Section title="Shareholders">
          {customerData.shareholders.map((sh, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 mb-2 col-span-2"
            >
              <p>
                <strong>Name:</strong> {sh.name}
              </p>
              <p>
                <strong>Ownership:</strong> {sh.ownership}
              </p>
            </div>
          ))}
        </Section>
      )}

      {/* ✅ Due Diligence Level */}
      <Section title="Due Diligence">
        <ReadOnlyField label="Level" value={getDueDiligenceLevel(customerData.riskScore)} />
      </Section>

      {/* ✅ Additional Checks */}
        <Section title="Background & Verification Checks">
        {[
            {
            label: "1. Any adverse media or criminal records found?",
            key: "adverseMedia",
            },
            {
            label: "2. Any sanctions list matches or watchlist hits?",
            key: "sanctionsMatch",
            },
            {
            label: "3. Source of Funds — Are they legitimate and verifiable?",
            key: "sourceOfFunds",
            },
            {
            label: "4. Source of Wealth — Sufficient evidence or rationale provided?",
            key: "sourceOfWealth",
            },
            {
            label: "5. Are all submitted documents authentic and valid?",
            key: "documentAuthenticity",
            },
            {
            label: "6. Has identity been verified against reliable sources?",
            key: "identityVerified",
            },
            {
            label: "7. Is the individual a politically exposed person (PEP)?",
            key: "pepCheck",
            },
            {
            label: "8. Any elevated risk indicators that require EDD?",
            key: "elevatedRisk",
            },
        ].map(({ label, key }) => (
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
            onClick={() => {
            const finalKycPayload = {
                kycStatus,
                remarks,
                verificationChecks,
            };
            console.log("Final KYC Decision:", finalKycPayload);
            // TODO: send to backend here when ready
            alert("KYC assessment saved (mock)");
            }}
        >
            Save KYC Assessment
        </button>
      </div>

    </div>
  );
};

export default KYCDetails;
