import React, { useState } from "react";
import { countries } from "../../data/countries";
import { occupations } from "../../data/occupations";
import { currencies } from "../../data/currencies";
import {
  customerTypes,
  professions,
  idTypes,
  pepOptions,
  residencyStatuses,
  channelOptions,
  genderOptions,
  sourceOfWealth,
  sourceOfFunds,
  transactionProducts
} from "../../data/dropdownOptions";

const OnboardingForm = () => {
  const [showShareholders, setShowShareholders] = useState(false);
  const [showDirectors, setShowDirectors] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showUBO, setShowUBO] = useState(false);

  const [selectedCode, setSelectedCode] = useState("+971"); // Default UAE code
  const [phoneNumber, setPhoneNumber] = useState("");

  // Shareholder state
  const [shareholderType, setShareholderType] = useState("Natural Person");

  // Additional dropdown options for shareholders
  const entityTypes = ["Natural Person", "Legal Entities", "Trust"];
  const licenseTypes = [
    "Commercial License", "Industrial License", "Professional License", 
    "Civil Organization License", "Service License", "Trading License", 
    "Business License", "Certificate of Incorporation"
  ];
  const entityClassTypes = ["Class A", "Class B"];
  const trustTypes = ["Discretionary", "Charitable", "Purpose"];
  const trusteeTypes = ["Natural Person", "Legal Entities"];
  const yesNoOptions = ["Yes", "No"];

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Customer Onboarding Form</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Core System ID" className="input" />
        <select className="input">
          <option value="">Customer Type</option>
          {customerTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select className="input">
          <option value="">Profession</option>
          {professions.map((profession) => (
            <option key={profession} value={profession}>{profession}</option>
          ))}
        </select>
        <input placeholder="First Name" className="input" />
        <input placeholder="Last Name" className="input" />
        <input placeholder="Alias" className="input" />
        <input type="date" placeholder="Date of Birth" className="input" />
        <select className="input">
          <option value="">Nationality</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
        <select className="input">
          <option value="">ID Type</option>
          {idTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input placeholder="ID Number" className="input" />
        <input type="date" placeholder="Issue Date" className="input" />
        <input type="date" placeholder="Expiry Date" className="input" />
        <input type="email" placeholder="Email" className="input" />
        <div className="mb-4">
            <div className="flex gap-2">
            {/* Country Code Dropdown */}
            <select
                className="border border-gray-300 rounded-md px-2 py-2 w-24 text-sm"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
            >
                {countries.map((country) => (
                <option key={country.code} value={country.phone}>
                    {country.phone} ({country.code})
                </option>
                ))}
            </select>

            {/* Phone Number Input */}
            <input
                type="tel"
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
                placeholder="Enter phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
            />
            </div>
        </div>
        <input placeholder="Address" className="input" />
        <input placeholder="City" className="input" />
        <select className="input">
          <option value="">Occupation</option>
          {occupations.map((occ) => (
            <option key={occ} value={occ}>{occ}</option>
          ))}
        </select>
        <select className="input">
          <option value="">Source of Wealth</option>
          {sourceOfWealth.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <select className="input">
          <option value="">PEP</option>
          {pepOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select className="input">
          <option value="">Country of Birth</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
        <select className="input">
          <option value="">Source of Funds</option>
          {sourceOfFunds.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
        <select className="input">
          <option value="">Residency Status</option>
          {residencyStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="dual" />
          <label htmlFor="dual">Is Dual Nationality?</label>
        </div>
        <select className="input">
          <option value="">Channel</option>
          {channelOptions.map((channel) => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
        <input placeholder="PO Box" className="input" />
        <select className="input">
          <option value="">Gender</option>
          {genderOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <input placeholder="Employer" className="input" />
        <select className="input">
          <option value="">Dual Nationality</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
        <select className="input">
          <option value="">Transaction Product</option>
          {transactionProducts.map((product) => (
            <option key={product} value={product}>{product}</option>
          ))}
        </select>
      </div>

      {/* Expandable Sections */}
      <div className="mt-6 space-y-4">
        {/* Shareholders */}
        <ExpandableSection
          title="Shareholder Details"
          show={showShareholders}
          toggle={() => setShowShareholders(!showShareholders)}
        >
          <div className="w-full mb-4">
            <select 
              className="input w-full"
              value={shareholderType}
              onChange={(e) => setShareholderType(e.target.value)}
            >
              {entityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {shareholderType === "Natural Person" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Full Name" className="input" />
              <input placeholder="Alias" className="input" />
              <select className="input">
                <option value="">Country of Residence</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <input type="date" placeholder="Date of Birth" className="input" />
              <select className="input">
                <option value="">Place of Birth</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <input type="tel" placeholder="Phone" className="input" />
              <input type="email" placeholder="Email" className="input" />
              <input placeholder="Address" className="input" />
              <select className="input">
                <option value="">Source of Funds</option>
                {sourceOfFunds.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Source of Wealth</option>
                {sourceOfWealth.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Occupation</option>
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
              <input placeholder="Expected Income Range Annually" className="input" />
              <select className="input">
                <option value="">PEP</option>
                {yesNoOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <input placeholder="% Shareholding" className="input" />
              <select className="input">
                <option value="">Dual Nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isDirector" />
                <label htmlFor="isDirector">Is Director?</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isUBO" />
                <label htmlFor="isUBO">Is UBO?</label>
              </div>
            </div>
          )}

          {shareholderType === "Legal Entities" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Legal Name" className="input" />
              <input placeholder="Alias" className="input" />
              <input type="date" placeholder="Date of Incorporation" className="input" />
              <select className="input">
                <option value="">Country of Incorporation</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Type</option>
                {entityClassTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select className="input">
                <option value="">License Type</option>
                {licenseTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input placeholder="License Number" className="input" />
              <input type="date" placeholder="Issue Date" className="input" />
              <input type="date" placeholder="Expiry Date" className="input" />
              <select className="input">
                <option value="">Business Activity</option>
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Countries of Operation</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Source of Funds</option>
                {sourceOfFunds.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <input placeholder="Registered Office Address" className="input" />
              <select className="input">
                <option value="">Countries Source of Funds</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <input type="email" placeholder="Email" className="input" />
              <input type="tel" placeholder="Phone" className="input" />
              <textarea placeholder="Other Details" className="input" rows="3" />
              <input placeholder="% Shareholding" className="input" />
            </div>
          )}

          {shareholderType === "Trust" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Full Name of Trust" className="input" />
              <input placeholder="Alias" className="input" />
              <select className="input">
                <option value="">Trust Registered</option>
                {yesNoOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Type of Trust</option>
                {trustTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select className="input">
                <option value="">Jurisdiction of Law</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
              <input placeholder="Registered Address" className="input" />
              <input placeholder="% Shareholding" className="input" />
              <input placeholder="Name of Trustee" className="input" />
              <select className="input">
                <option value="">Trustee Type</option>
                {trusteeTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
        </ExpandableSection>

        {/* Directors */}
        <ExpandableSection
          title="Director / Representative Details"
          show={showDirectors}
          toggle={() => setShowDirectors(!showDirectors)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="First Name" className="input" />
            <input placeholder="Alias" className="input" />
            <input placeholder="Last Name" className="input" />
            <select className="input">
              <option value="">Country of Residence</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            <select className="input">
              <option value="">Nationality</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            <input type="date" placeholder="Date of Birth" className="input" />
            <div className="flex gap-2">
              {/* Country Code Dropdown */}
              <select
                className="border border-gray-300 rounded-md px-2 py-2 w-24 text-sm"
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.phone}>
                    {country.phone} ({country.code})
                  </option>
                ))}
              </select>
              {/* Phone Number Input */}
              <input
                type="tel"
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
                placeholder="Phone number"
              />
            </div>
            <select className="input">
              <option value="">Place of Birth</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            <input type="email" placeholder="Email" className="input" />
            <input placeholder="Address" className="input" />
            <input placeholder="City" className="input" />
            <select className="input">
              <option value="">Occupation</option>
              {occupations.map((occ) => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
            <select className="input">
              <option value="">PEP</option>
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select className="input">
              <option value="">Dual Nationality</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isCEO" />
              <label htmlFor="isCEO">Is CEO/Managing Director?</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isRepresentative" />
              <label htmlFor="isRepresentative">Is Representative?</label>
            </div>
            
          </div>
        </ExpandableSection>

        {/* Bank */}
        <ExpandableSection
          title="Bank Details"
          show={showBankDetails}
          toggle={() => setShowBankDetails(!showBankDetails)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Bank Name" className="input" />
            <input placeholder="Alias" className="input" />
            <select className="input">
              <option value="">Account Type</option>
              <option value="call">Call</option>
              <option value="fixed">Fixed</option>
              <option value="current">Current</option>
            </select>
            <select className="input">
              <option value="">Currency</option>
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>{currency.name}</option>
              ))}
            </select>
            <input placeholder="Bank Account Details" className="input" />
            <input placeholder="Account Number" className="input" />
            <input placeholder="IBAN" className="input" />
            <input placeholder="SWIFT" className="input" />
            <select className="input">
              <option value="">Mode of Signatory</option>
              <option value="single">Single</option>
              <option value="dual">Dual</option>
            </select>
            <select className="input">
              <option value="">Internet Banking</option>
              {yesNoOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select className="input">
              <option value="">Bank Signatories</option>
              <option value="signatory1">Signatory 1</option>
              <option value="signatory2">Signatory 2</option>
            </select>
          </div>
        </ExpandableSection>

        {/* UBO */}
        <ExpandableSection
          title="Ultimate Beneficial Owner (UBO) Details"
          show={showUBO}
          toggle={() => setShowUBO(!showUBO)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select className="input">
                <option value="">Select Shareholder</option>
                <option value="shareholder1">Shareholder 1</option>
                <option value="shareholder2">Shareholder 2</option>
                </select>
                <br />
                <input placeholder="Full Name" className="input" />
                <input placeholder="Alias" className="input" />
                <select className="input">
                        <option value="">Country of Residence</option>
                        {countries.map((country) => (
                        <option key={country.code} value={country.code}>{country.name}</option>
                        ))}
                    </select>
                    <select className="input">
                <option value="">Nationality</option>
                {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                ))}
                </select>
                <input type="date" placeholder="Date of Birth" className="input" />
                <select className="input">
                    <option value="">Place of Birth</option>
                    {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                </select>
                <input type="tel" placeholder="Phone" className="input" />
                <input type="email" placeholder="Email" className="input" />
                <input placeholder="Address" className="input" />
                <select className="input">
                <option value="">Source of Funds</option>
                {sourceOfFunds.map((source) => (
                    <option key={source} value={source}>{source}</option>
                ))}
                </select>
                <select className="input">
                <option value="">Source of Wealth</option>
                {sourceOfWealth.map((source) => (
                    <option key={source} value={source}>{source}</option>
                ))}
                </select>
                <select className="input">
                <option value="">Occupation</option>
                {occupations.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                ))}
                </select>
                <input placeholder="Expected Income Range Annually" className="input" />
                <select className="input">
                <option value="">PEP</option>
                {pepOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                ))}
                </select>
                <input placeholder="% Shareholding" className="input" />
                <select className="input">
                <option value="">Dual Nationality</option>
                {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                ))}
                </select>
            </div>

        </ExpandableSection>
      </div>

      <div className="mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </div>
    </div>
  );
};

const ExpandableSection = ({ title, show, toggle, children }) => (
  <div>
    <button
      onClick={toggle}
      className="text-blue-600 hover:underline text-left w-full"
    >
      {show ? "▼" : "►"} {title}
    </button>
    {show && <div className="mt-2">{children}</div>}
  </div>
);

export default OnboardingForm;