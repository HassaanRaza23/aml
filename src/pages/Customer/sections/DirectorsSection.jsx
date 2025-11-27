import React, { useState, useImperativeHandle, forwardRef } from "react";
import { countries } from "../../../data/countries";
import { occupations } from "../../../data/occupations";
import { pepOptions, idTypes } from "../../../data/dropdownOptions";
import { customerService } from "../../../services/customerService";

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

const DirectorsSection = forwardRef(({ directors = [], onDirectorsChange, isEdit = false, onDirectorFormFill = null }, ref) => { 
  const [showDirectors, setShowDirectors] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const [currentDirector, setCurrentDirector] = useState({
    firstName: "",
    alias: "",
    lastName: "",
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
    city: "",
    occupation: "",
    pepStatus: "",
    dualNationality: "",
    isCeo: false,
    isRepresentative: false
  });

  // Validation functions
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "firstName":
        if (value && value.length < 2) {
          error = "First name must be at least 2 characters long";
        }
        break;
      case "lastName":
        if (value && value.length < 2) {
          error = "Last name must be at least 2 characters long";
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
          }
          if (today.getFullYear() - birthDate.getFullYear() > 120) {
            error = "Date of birth seems invalid";
          }
        }
        break;
      default:
        // No validation needed for other fields
        break;
    }
    
    return error;
  };

  const handleFieldBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, currentDirector[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (name, value) => {
    setCurrentDirector(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddDirector = () => {
    console.log('👔 Adding director:', currentDirector);
    
    // Check if required fields are filled
    const hasRequiredFields = currentDirector.firstName && currentDirector.firstName.trim() && 
                             currentDirector.lastName && currentDirector.lastName.trim();
    
    if (hasRequiredFields) {
      // Combine country code + phone number for storage
      const phoneWithCountryCode = currentDirector.countryCode + currentDirector.phone;
      const newDirector = { 
        ...currentDirector, 
        phone: phoneWithCountryCode // Store the combined phone number
      };
      
      if (editingIndex !== null) {
        // Update existing director
        const updatedDirectors = [...directors];
        updatedDirectors[editingIndex] = newDirector;
        onDirectorsChange(updatedDirectors);
        setEditingIndex(null);
      } else {
        // Add new director
        onDirectorsChange([...directors, newDirector]);
      }
      
      // Reset form
      setCurrentDirector({
        firstName: "",
        alias: "",
        lastName: "",
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
        city: "",
        occupation: "",
        pepStatus: "",
        dualNationality: "",
        isCeo: false,
        isRepresentative: false
      });
      setErrors({});
      setTouched({});
      
      // Hide the add form after successful addition
      setShowAddForm(false);
    }
  };

  const handleRemoveDirector = async (index) => {
    const directorToRemove = directors[index];
    console.log('🗑️ Removing director:', directorToRemove);
    
    // Check if this director has an ID (meaning it's saved in the database)
    if (directorToRemove.id) {
      try {
        // First, delete from the database
        const { success, error } = await customerService.deleteDirectorById(directorToRemove.id);
        
        if (success) {
          // If database deletion succeeds, remove from UI
          const newDirectors = directors.filter((_, i) => i !== index);
          onDirectorsChange(newDirectors);
          console.log('✅ Director removed from database and UI');
        } else {
          // If database deletion fails, show error
          console.error('❌ Failed to delete director from database:', error);
          alert(`Failed to remove director: ${error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Error during director removal:', error);
        alert(`Error removing director: ${error.message || 'Unknown error'}`);
      }
    } else {
      // This is a new director that hasn't been saved to the database yet
      console.log('🗑️ Removing new director (no ID yet):', directorToRemove);
      
      // Just remove from UI since it's not in the database
      const newDirectors = directors.filter((_, i) => i !== index);
      onDirectorsChange(newDirectors);
      console.log('✅ New director removed from UI');
    }
  };

  const handleEditDirector = async (index) => {
    const directorToEdit = directors[index];
    console.log('🔍 Editing director:', directorToEdit);
    
    // Check if this director has an ID (meaning it's saved in the database)
    if (directorToEdit.id) {
      try {
        // Fetch fresh data from the database for this specific director
        const { success, data: freshDirectorData, error } = await customerService.getDirectorById(directorToEdit.id);
        
        if (success && freshDirectorData) {
          console.log('🔍 Fresh director data from database:', freshDirectorData);
          
          // Parse phone number to separate country code and phone number
          const { countryCode, phone } = parsePhoneNumber(freshDirectorData.phone || '');
          
          // Use the fresh data from database
          const directorWithDefaults = {
            ...freshDirectorData,
            countryCode: countryCode || '+971',
            phone: phone || ''
          };
          
          console.log('🔍 Processed director data:', directorWithDefaults);
          
          // Update the directors array with fresh data so the display shows correct names
          const updatedDirectors = [...directors];
          updatedDirectors[index] = directorWithDefaults;
          onDirectorsChange(updatedDirectors);
          
          // Set the current director data
          setCurrentDirector(directorWithDefaults);
          setEditingIndex(index);
          
          console.log('🔍 Set currentDirector:', directorWithDefaults);
        } else {
          console.error('🔍 Failed to fetch fresh director data:', error);
          // Fallback to existing data if fetch fails
          const { countryCode, phone } = parsePhoneNumber(directorToEdit.phone || '');
          const directorWithDefaults = {
            ...directorToEdit,
            countryCode: countryCode || '+971',
            phone: phone || ''
          };
          
          setCurrentDirector(directorWithDefaults);
          setEditingIndex(index);
        }
      } catch (error) {
        console.error('🔍 Error fetching director data:', error);
        // Fallback to existing data if fetch fails
        const { countryCode, phone } = parsePhoneNumber(directorToEdit.phone || '');
        const directorWithDefaults = {
          ...directorToEdit,
          countryCode: countryCode || '+971',
          phone: phone || ''
        };
        
        setCurrentDirector(directorWithDefaults);
        setEditingIndex(index);
      }
    } else {
      // This is a new director that hasn't been saved to the database yet
      console.log('🔍 Editing new director (no ID yet):', directorToEdit);
      
      // Parse phone number to separate country code and phone number
      const { countryCode, phone } = parsePhoneNumber(directorToEdit.phone || '');
      
      // Use the existing data directly
      const directorWithDefaults = {
        ...directorToEdit,
        countryCode: countryCode || '+971',
        phone: phone || ''
      };
      
      console.log('🔍 Processed new director data:', directorWithDefaults);
      
      // Set the current director data
      setCurrentDirector(directorWithDefaults);
      setEditingIndex(index);
      
      console.log('🔍 Set currentDirector for new director:', directorWithDefaults);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentDirector({
      firstName: "",
      alias: "",
      lastName: "",
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
      city: "",
      occupation: "",
      pepStatus: "",
      dualNationality: "",
      isCeo: false,
      isRepresentative: false
    });
    setErrors({});
    setTouched({});
    setShowAddForm(false);
  };

  // Function to fill director form with data from shareholder
  const fillDirectorForm = (directorData) => {
    // Parse phone number to separate country code and phone number
    const { countryCode, phone } = parsePhoneNumber(directorData.phone || '');
    
    setCurrentDirector({
      firstName: directorData.firstName || '',
      alias: directorData.alias || '',
      lastName: directorData.lastName || '',
      countryOfResidence: directorData.countryOfResidence || '',
      nationality: directorData.nationality || '',
      dateOfBirth: directorData.dateOfBirth || '',
      placeOfBirth: directorData.placeOfBirth || '',
      isDualNationality: directorData.isDualNationality|| '',
      dualNationality: directorData.dualNationality|| '',
      dualPassportNumber: directorData.dualPassportNumber|| '',
      dualPassportIssueDate: directorData.dualPassportIssueDate|| '',
      dualPassportExpiryDate: directorData.dualPassportExpiryDate|| '',
      // ID details
      idType: directorData.idType|| '',
      idNumber: directorData.idNumber|| '',
      idIssueDate: directorData.idIssueDate| '',
      idExpiryDate: directorData.idExpiryDate|| '',
      countryCode: countryCode || '+971',
      phone: phone || '',
      email: directorData.email || '',
      address: directorData.address || '',
      city: directorData.city || '',
      occupation: directorData.occupation || '',
      pepStatus: directorData.pepStatus || '',
      isCeo: directorData.isCeo || false,
      isRepresentative: directorData.isRepresentative || false
    });
    
    // Show the form and set it to add mode
    setShowAddForm(true);
    setEditingIndex(null);
    
    console.log('👔 Director form filled with data:', directorData);
  };

  // Expose the fill function to parent component
  useImperativeHandle(ref, () => ({
    fillForm: fillDirectorForm
  }), []);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setShowDirectors(!showDirectors)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex justify-between items-center"
      >
        <span className="font-medium text-gray-900">Director / Representative Details</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            showDirectors ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDirectors && (
        <div className="p-4 border-t border-gray-200">
          {/* Show existing/added directors */}
          {directors.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-900">Directors / Representatives</h4>
              
              <div className="space-y-3">
                {directors.map((director, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {director.firstName} {director.lastName}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditDirector(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDirector(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Nationality: {director.nationality}</p>
                    {director.isCeo && <p className="text-sm text-blue-600">CEO/Managing Director</p>}
                    {director.isRepresentative && <p className="text-sm text-green-600">Representative</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Always show "Add New Director" button in edit mode */}
          {isEdit && (
            <div className="mb-6">
              {/* Show message when no directors exist */}
              {directors.length === 0 && (
                <p className="text-gray-700 text-md font-medium mb-3 italic">
                  No Directors Or Representatives have been added yet
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add New Director / Representative
                </button>
              </div>
            </div>
          )}
          
          {/* Add Director Form - show directly for new customers, or when adding/editing for existing customers */}
          {(!isEdit || showAddForm || editingIndex !== null) && (
            <div className={`mb-6 p-4 border rounded-lg ${
              editingIndex !== null 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <h4 className={`font-medium mb-4 ${
                editingIndex !== null ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {editingIndex !== null ? `Edit Director: ${directors[editingIndex]?.firstName} ${directors[editingIndex]?.lastName}` : 'Add New Director/Representative'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input 
                    className={`input ${errors.firstName && touched.firstName ? 'border-red-500' : ''}`}
                    value={currentDirector.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    onBlur={() => handleFieldBlur('firstName')}
                  />
                  {errors.firstName && touched.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input 
                    className={`input ${errors.alias && touched.alias ? 'border-red-500' : ''}`}
                    value={currentDirector.alias}
                    onChange={(e) => handleInputChange('alias', e.target.value)}
                    onBlur={() => handleFieldBlur('alias')}
                  />
                  {errors.alias && touched.alias && (
                    <p className="text-red-500 text-sm mt-1">{errors.alias}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input 
                    className={`input ${errors.lastName && touched.lastName ? 'border-red-500' : ''}`}
                    value={currentDirector.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    onBlur={() => handleFieldBlur('lastName')}
                  />
                  {errors.lastName && touched.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                  <select 
                    className="input"
                    value={currentDirector.countryOfResidence}
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
                    value={currentDirector.nationality}
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
                    value={currentDirector.dateOfBirth}
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
                    value={currentDirector.placeOfBirth}
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
                    value={currentDirector.idType}
                    onChange={(e) => setCurrentDirector(prev => ({ ...prev, idType: e.target.value }))}
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
                    value={currentDirector.idNumber}
                    onChange={(e) => setCurrentDirector(prev => ({ ...prev, idNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Issue Date</label>
                  <input
                    type="date"
                    className="input"
                    value={currentDirector.idIssueDate}
                    onChange={(e) => setCurrentDirector(prev => ({ ...prev, idIssueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiry Date</label>
                  <input
                    type="date"
                    className="input"
                    value={currentDirector.idExpiryDate}
                    onChange={(e) => setCurrentDirector(prev => ({ ...prev, idExpiryDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="sh-is-dual-nationality"
                    checked={currentDirector.isDualNationality}
                    onChange={(e) =>
                      setCurrentDirector(prev => ({ ...prev, isDualNationality: e.target.checked }))
                    }
                  />
                  <label htmlFor="sh-is-dual-nationality" className="text-sm font-medium text-gray-700">
                    Is Dual Nationality?
                  </label>
                </div>
                {currentDirector.isDualNationality && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
                      <select
                        className={`input ${errors.dualNationality && touched.dualNationality ? 'border-red-500' : ''}`}
                        value={currentDirector.dualNationality}
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
                        value={currentDirector.dualPassportNumber}
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
                        value={currentDirector.dualPassportIssueDate}
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
                        value={currentDirector.dualPassportExpiryDate}
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
                      value={currentDirector.countryCode || '+971'}
                      onChange={(e) => {
                        setCurrentDirector(prev => ({ ...prev, countryCode: e.target.value }));
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
                      value={currentDirector.phone || ''}
                      onChange={(e) => {
                        // Only allow numbers
                        const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                        handleInputChange('phone', numbersOnly);
                      }}
                      onKeyPress={(e) => {
                        // Prevent non-numeric input
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      onBlur={() => handleFieldBlur('phone')}
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
                    value={currentDirector.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input 
                    className="input"
                    value={currentDirector.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    className="input"
                    value={currentDirector.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <select 
                    className="input"
                    value={currentDirector.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                  >
                    <option value="">Select Occupation</option>
                    {occupations.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
                                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">PEP</label>
                   <select 
                     className="input"
                     value={currentDirector.pepStatus}
                     onChange={(e) => handleInputChange('pepStatus', e.target.value)}
                   >
                     <option value="">Select PEP Status</option>
                     {pepOptions.map((item) => (
                       <option key={item} value={item}>{item}</option>
                     ))}
                   </select>
                 </div>
                
                  <div className="flex items-center space-x-2">
                   <input 
                     type="checkbox" 
                     id="isCeo"
                     checked={currentDirector.isCeo}
                     onChange={(e) => handleInputChange('isCeo', e.target.checked)}
                   />
                   <label htmlFor="isCeo">Is CEO/Managing Director?</label>
                 </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isRepresentative"
                    checked={currentDirector.isRepresentative}
                    onChange={(e) => handleInputChange('isRepresentative', e.target.checked)}
                  />
                  <label htmlFor="isRepresentative">Is Representative?</label>
                </div>
              </div>
              
              {/* Add/Update Button */}
              <div className="mt-4 flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddDirector}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingIndex !== null ? 'Update Director' : 'Add Director'}
                </button>
                {editingIndex !== null ? (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel Edit
                  </button>
                ) : isEdit ? (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default DirectorsSection;
