import React, { useState, useImperativeHandle, forwardRef } from "react";
import { countries } from "../../../data/countries";
import { occupations } from "../../../data/occupations";
import { sourceOfWealth, sourceOfFunds, pepOptions, idTypes } from "../../../data/dropdownOptions";

// Parse phone number for edit mode (split country code and phone number)
const parsePhoneNumber = (fullPhone) => {
  if (!fullPhone) return { countryCode: "+971", phone: "" };
  
  // Find the country code by checking if it starts with a known code
  const countryCodes = countries.map(country => country.phone);
  
  let foundCode = "+971"; // Default UAE code
  let number = fullPhone;
  
  // Find the country code
  for (const code of countryCodes) {
    if (fullPhone.startsWith(code)) {
      foundCode = code;
      number = fullPhone.substring(code.length);
      break;
    }
  }
  
  return { countryCode: foundCode, phone: number };
};

const UBOSection = forwardRef(({ ubos = [], onUbosChange, isEdit = false }, ref) => {
  const [showUbos, setShowUbos] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [currentUbo, setCurrentUbo] = useState({
    fullName: "",
    alias: "",
    countryOfResidence: "",
    nationality: "",
    dateOfBirth: "",
    placeOfBirth: "",
    idType: "",
    idNumber: "",
    idIssueDate: "",
    idExpiryDate: "",
    isDualNationality: false,
    dualPassportNumber: "",
    dualPassportIssueDate: "",
    dualPassportExpiryDate: "",
    countryCode: "+971",
    phone: "",
    email: "",
    address: "",
    sourceOfFunds: "",
    sourceOfWealth: "",
    occupation: "",
    expectedIncome: "",
    pep: "",
    shareholding: "",
    dualNationality: ""
  });

  // Validation functions
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "fullName":
        if (value && value.length < 2) {
          error = "Full name must be at least 2 characters long";
        }
        break;
      case "alias":
        if (value && value.length < 2) {
          error = "Alias must be at least 2 characters long";
        }
        break;
      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (value && value.length < 7) {
          error = "Phone number must be at least 7 digits";
        }
        break;
      case "dateOfBirth":
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          if (birthDate > today) {
            error = "Date of birth cannot be in the future";
          } else if (today.getFullYear() - birthDate.getFullYear() > 120) {
            error = "Date of birth seems invalid";
          } else {
            // Check if UBO is at least 18 years old
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();
            
            // Adjust age if birthday hasn't occurred this year
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
              age--;
            }
            
            if (age < 18) {
              error = "UBO must be at least 18 years old";
            }
          }
        }
        break;
      case "shareholding":
        if (value) {
          const percentage = parseFloat(value);
          if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            error = "Shareholding percentage must be between 0 and 100";
          }
        }
        break;
      case "expectedIncome":
        if (value && value.length < 3) {
          error = "Expected income description must be at least 3 characters";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleFieldBlur = (fieldName) => {
    const value = currentUbo[fieldName];
    const error = validateField(fieldName, value);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const handleInputChange = (fieldName, value) => {
    setCurrentUbo(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ""
      }));
    }
  };

  const handleAddUbo = () => {
    // No validation required - all fields are optional
    // Combine country code and phone number
    const phoneWithCountryCode = currentUbo.countryCode + currentUbo.phone;
    
    const newUbo = { 
      ...currentUbo,
      phone: phoneWithCountryCode // Store the combined phone number
    };
    
    if (editingIndex !== null) {
      // Update existing UBO
      const updatedUbos = [...ubos];
      updatedUbos[editingIndex] = newUbo;
      onUbosChange(updatedUbos);
      setEditingIndex(null);
    } else {
      // Add new UBO
      onUbosChange([...ubos, newUbo]);
    }
    
    // Reset form
    setCurrentUbo({
      fullName: "",
      alias: "",
      countryOfResidence: "",
      nationality: "",
      dateOfBirth: "",
      placeOfBirth: "",
      idType: "",
      idNumber: "",
      idIssueDate: "",
      idExpiryDate: "",
      isDualNationality: false,
      dualPassportNumber: "",
      dualPassportIssueDate: "",
      dualPassportExpiryDate: "",
      countryCode: "+971",
      phone: "",
      email: "",
      address: "",
      sourceOfFunds: "",
      sourceOfWealth: "",
      occupation: "",
      expectedIncome: "",
      pep: "",
      shareholding: "",
      dualNationality: ""
    });
    setErrors({});
    setTouched({});
    setShowAddForm(false);
  };

  const handleRemoveUbo = (index) => {
    const newUbos = ubos.filter((_, i) => i !== index);
    onUbosChange(newUbos);
  };

  const handleEditUbo = (index) => {
    const uboToEdit = ubos[index];
    
    // Parse phone number if it exists
    if (uboToEdit.phone) {
      const { countryCode, phone } = parsePhoneNumber(uboToEdit.phone);
      setCurrentUbo({ 
        ...uboToEdit, 
        countryCode, 
        phone 
      });
    } else {
      setCurrentUbo({ ...uboToEdit });
    }
    
    setEditingIndex(index);
    setErrors({});
    setTouched({});
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentUbo({
      fullName: "",
      alias: "",
      countryOfResidence: "",
      nationality: "",
      dateOfBirth: "",
      placeOfBirth: "",
      idType: "",
      idNumber: "",
      idIssueDate: "",
      idExpiryDate: "",
      isDualNationality: false,
      dualPassportNumber: "",
      dualPassportIssueDate: "",
      dualPassportExpiryDate: "",
      countryCode: "+971",
      phone: "",
      email: "",
      address: "",
      sourceOfFunds: "",
      sourceOfWealth: "",
      occupation: "",
      expectedIncome: "",
      pep: "",
      shareholding: "",
      dualNationality: ""
    });
    setErrors({});
    setTouched({});
    setShowAddForm(false);
  };

  // Function to fill UBO form with data from shareholder
  const fillUboForm = (uboData) => {
    // Parse phone number to separate country code and phone number
    const { countryCode, phone } = parsePhoneNumber(uboData.phone || '');
    
    setCurrentUbo({
      fullName: uboData.fullName || '',
      alias: uboData.alias || '',
      countryOfResidence: uboData.countryOfResidence || '',
      nationality: uboData.nationality || '',
      dateOfBirth: uboData.dateOfBirth || '',
      placeOfBirth: uboData.placeOfBirth || '',
      isDualNationality: uboData.isDualNationality || '',
      dualNationality: uboData.dualNationality || '',
      dualPassportNumber: uboData.dualPassportNumber || '',
      dualPassportIssueDate: uboData.dualPassportIssueDate || '',
      dualPassportExpiryDate: uboData.dualPassportExpiryDate || '',
      idType: uboData.idType || '',
      idNumber: uboData.idNumber || '',
      idIssueDate: uboData.idIssueDate || '',
      idExpiryDate: uboData.idExpiryDate || '',
      countryCode: countryCode || '+971',
      phone: phone || '',
      email: uboData.email || '',
      address: uboData.address || '',
      sourceOfFunds: uboData.sourceOfFunds || '',
      sourceOfWealth: uboData.sourceOfWealth || '',
      occupation: uboData.occupation || '',
      expectedIncome: uboData.expectedIncome || '',
      pep: uboData.pep || '',
      shareholding: uboData.shareholding || '',
    });
    
    // Show the form and set it to add mode
    setShowAddForm(true);
    setEditingIndex(null);
    
    console.log('👤 UBO form filled with data:', uboData);
  };

  // Expose the fill function to parent component
  useImperativeHandle(ref, () => ({
    fillForm: fillUboForm
  }), []);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setShowUbos(!showUbos)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex justify-between items-center"
      >
        <span className="font-medium text-gray-900">Ultimate Beneficial Owner (UBO) Details</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            showUbos ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showUbos && (
        <div className="p-4 border-t border-gray-200">
          {/* Display Existing UBOs */}
          {ubos.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Added UBOs:</h4>
              <div className="space-y-3">
                {ubos.map((ubo, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {ubo.fullName}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditUbo(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveUbo(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Nationality: {ubo.nationality}</p>
                    {ubo.shareholding && (
                      <p className="text-sm text-gray-600">Shareholding: {ubo.shareholding}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Always show "Add New UBO" button in edit mode */}
          {isEdit && (
            <div className="mb-6">
              {/* Show message when no UBOs exist */}
              {ubos.length === 0 && (
                <p className="text-gray-700 text-md font-medium mb-3 italic">
                  No UBOs have been added yet
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add New UBO
                </button>
              </div>
            </div>
          )}
          
          {/* Add UBO Form - show directly for new customers, or when adding/editing for existing customers */}
          {(!isEdit || showAddForm || editingIndex !== null) && (
            <div className={`mb-6 p-4 border rounded-lg ${
              editingIndex !== null 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <h4 className={`font-medium mb-4 ${
                editingIndex !== null ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {editingIndex !== null ? `Edit UBO: ${ubos[editingIndex]?.fullName}` : 'Add New UBO'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    className={`input ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                    value={currentUbo.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onBlur={() => handleFieldBlur('fullName')}
                    placeholder="Enter full name"
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input 
                    className={`input ${errors.alias && touched.alias ? 'border-red-500' : ''}`}
                    value={currentUbo.alias}
                    onChange={(e) => handleInputChange('alias', e.target.value)}
                    onBlur={() => handleFieldBlur('alias')}
                    placeholder="Enter alias (optional)"
                  />
                  {errors.alias && touched.alias && (
                    <p className="text-red-500 text-sm mt-1">{errors.alias}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                  <select 
                    className="input"
                    value={currentUbo.countryOfResidence}
                    onChange={(e) => handleInputChange('countryOfResidence', e.target.value)}
                  >
                    <option value="">Select Country of Residence</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <select 
                    className="input"
                    value={currentUbo.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                  >
                    <option value="">Select Nationality</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    className={`input ${errors.dateOfBirth && touched.dateOfBirth ? 'border-red-500' : ''}`}
                    value={currentUbo.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    onBlur={() => handleFieldBlur('dateOfBirth')}
                  />
                  {errors.dateOfBirth && touched.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                  <select 
                    className="input"
                    value={currentUbo.placeOfBirth}
                    onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  >
                    <option value="">Select Place of Birth</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select
                    className="input"
                    value={currentUbo.idType}
                    onChange={(e) => setCurrentUbo(prev => ({ ...prev, idType: e.target.value }))}
                  >
                    <option value="">Select ID Type</option>
                    {idTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    className="input"
                    value={currentUbo.idNumber}
                    onChange={(e) => setCurrentUbo(prev => ({ ...prev, idNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Issue Date</label>
                  <input
                    type="date"
                    className="input"
                    value={currentUbo.idIssueDate}
                    onChange={(e) => setCurrentUbo(prev => ({ ...prev, idIssueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiry Date</label>
                  <input
                    type="date"
                    className="input"
                    value={currentUbo.idExpiryDate}
                    onChange={(e) => setCurrentUbo(prev => ({ ...prev, idExpiryDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="sh-is-dual-nationality"
                    checked={currentUbo.isDualNationality}
                    onChange={(e) =>
                      setCurrentUbo(prev => ({ ...prev, isDualNationality: e.target.checked }))
                    }
                  />
                  <label htmlFor="sh-is-dual-nationality" className="text-sm font-medium text-gray-700">
                    Is Dual Nationality?
                  </label>
                </div>
                {currentUbo.isDualNationality && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
                      <select
                        className={`input ${errors.dualNationality && touched.dualNationality ? 'border-red-500' : ''}`}
                        value={currentUbo.dualNationality}
                        onChange={(e) => handleInputChange('dualNationality', e.target.value)}
                        onBlur={() => handleFieldBlur('dualNationality')}
                      >
                        <option value="">Select Dual Nationality</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {errors.dualNationality && touched.dualNationality && (
                        <p className="text-red-500 text-sm mt-1">{errors.dualNationality}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                      <input
                        className={`input ${errors.dualPassportNumber && touched.dualPassportNumber ? 'border-red-500' : ''}`}
                        value={currentUbo.dualPassportNumber}
                        onChange={(e) => handleInputChange('dualPassportNumber', e.target.value)}
                        onBlur={() => handleFieldBlur('dualPassportNumber')}
                      />
                      {errors.dualPassportNumber && touched.dualPassportNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.dualPassportNumber}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Issue Date</label>
                      <input
                        type="date"
                        className={`input ${errors.dualPassportIssueDate && touched.dualPassportIssueDate ? 'border-red-500' : ''}`}
                        value={currentUbo.dualPassportIssueDate}
                        onChange={(e) => handleInputChange('dualPassportIssueDate', e.target.value)}
                        onBlur={() => handleFieldBlur('dualPassportIssueDate')}
                      />
                      {errors.dualPassportIssueDate && touched.dualPassportIssueDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.dualPassportIssueDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                      <input
                        type="date"
                        className={`input ${errors.dualPassportExpiryDate && touched.dualPassportExpiryDate ? 'border-red-500' : ''}`}
                        value={currentUbo.dualPassportExpiryDate}
                        onChange={(e) => handleInputChange('dualPassportExpiryDate', e.target.value)}
                        onBlur={() => handleFieldBlur('dualPassportExpiryDate')}
                      />
                      {errors.dualPassportExpiryDate && touched.dualPassportExpiryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.dualPassportExpiryDate}</p>
                      )}
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex gap-2">
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32"
                      value={currentUbo.countryCode || '+971'}
                      onChange={(e) => {
                        setCurrentUbo(prev => ({ ...prev, countryCode: e.target.value }));
                      }}
                    >
                      {countries
                        .filter(country => country.phone && country.phone.length <= 6)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((country) => (
                          <option key={country.code} value={country.phone}>
                            {country.phone} ({country.code})
                          </option>
                        ))}
                    </select>
                    <input
                      type="tel"
                      className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm ${errors.phone && touched.phone ? 'border-red-500' : ''}`}
                      value={currentUbo.phone || ''}
                      onChange={(e) => {
                        // Only allow numbers
                        const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                        handleInputChange('phone', numbersOnly);
                      }}
                      onBlur={() => handleFieldBlur('phone')}
                      onKeyPress={(e) => {
                        // Prevent non-numeric input
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Enter phone number"
                      maxLength={15}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className={`input ${errors.email && touched.email ? 'border-red-500' : ''}`}
                    value={currentUbo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="Enter email address"
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    className="input"
                    value={currentUbo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                  <select 
                    className="input"
                    value={currentUbo.sourceOfFunds}
                    onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
                  >
                    <option value="">Select Source of Funds</option>
                    {sourceOfFunds.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Wealth</label>
                  <select 
                    className="input"
                    value={currentUbo.sourceOfWealth}
                    onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
                  >
                    <option value="">Select Source of Wealth</option>
                    {sourceOfWealth.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <select 
                    className="input"
                    value={currentUbo.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                  >
                    <option value="">Select Occupation</option>
                    {occupations.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Income Range Annually</label>
                  <input 
                    className={`input ${errors.expectedIncome && touched.expectedIncome ? 'border-red-500' : ''}`}
                    value={currentUbo.expectedIncome}
                    onChange={(e) => handleInputChange('expectedIncome', e.target.value)}
                    onBlur={() => handleFieldBlur('expectedIncome')}
                    placeholder="Enter expected income range"
                  />
                  {errors.expectedIncome && touched.expectedIncome && (
                    <p className="text-red-500 text-sm mt-1">{errors.expectedIncome}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PEP</label>
                  <select 
                    className="input"
                    value={currentUbo.pep}
                    onChange={(e) => handleInputChange('pep', e.target.value)}
                  >
                    <option value="">Select PEP Status</option>
                    {pepOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                  <input 
                    className={`input ${errors.shareholding && touched.shareholding ? 'border-red-500' : ''}`}
                    value={currentUbo.shareholding}
                    onChange={(e) => handleInputChange('shareholding', e.target.value)}
                    onBlur={() => handleFieldBlur('shareholding')}
                    placeholder="Enter shareholding percentage"
                  />
                  {errors.shareholding && touched.shareholding && (
                    <p className="text-red-500 text-sm mt-1">{errors.shareholding}</p>
                  )}
                </div>
              </div>
              
              {/* Add/Update Button */}
              <div className="mt-4 flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddUbo}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingIndex !== null ? 'Update UBO' : 'Add UBO'}
                </button>
                {(editingIndex !== null || showAddForm) && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default UBOSection;
