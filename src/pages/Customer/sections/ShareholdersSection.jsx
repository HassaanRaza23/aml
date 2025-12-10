import React, { useState } from "react";
import { countries } from "../../../data/countries";
import { occupations } from "../../../data/occupations";
import {
  entityTypes,
  entityClassTypes,
  trustTypes,
  trusteeTypes,
  yesNoOptions,
  sourceOfWealth,
  sourceOfFunds,
  pepOptions,
  licenseTypes,
  idTypes,
  businessActivities
} from "../../../data/dropdownOptions";
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

const ShareholdersSection = ({ shareholders = [], onShareholdersChange, isEdit = false, onDirectorCreate = null, onUboCreate = null }) => {

  const [showShareholders, setShowShareholders] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [shareholderType, setShareholderType] = useState("Natural Person");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  

  
  const [currentShareholder, setCurrentShareholder] = useState({
    type: "Natural Person",
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
    dualNationalityCountry: "",
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
    dualNationality: "",
    isDirector: false,
    isUbo: false
  });

  // Validation functions
  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "fullName":
        if (value && value.length < 2) {
          error = "Name must be at least 2 characters long";
        }
        break;
      case "legalName":
        if (value && value.length < 2) {
          error = "Legal name must be at least 2 characters long";
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
      case "dateOfIncorporation":
        if (value) {
          const incorpDate = new Date(value);
          const today = new Date();
          if (incorpDate > today) {
            error = "Date of incorporation cannot be in the future";
          }
        }
        break;
      case "licenseIssueDate":
        if (value) {
          const issueDate = new Date(value);
          const today = new Date();
          if (issueDate > today) {
            error = "Issue date cannot be in the future";
          }
        }
        break;
      case "shareholding":
        if (value) {
          const shareholding = parseFloat(value);
          if (isNaN(shareholding) || shareholding < 0 || shareholding > 100) {
            error = "Shareholding must be between 0 and 100";
          }
        }
        break;
      case "expectedIncome":
        if (value && parseFloat(value) < 0) {
          error = "Expected income cannot be negative";
        }
        break;
      case "trustName":
        if (value && value.length < 2) {
          error = "Trust name must be at least 2 characters long";
        }
        break;
      case "dualNationalityCountry":
      case "dualPassportNumber":
      case "dualPassportIssueDate":
      case "dualPassportExpiryDate":
        if (currentShareholder.isDualNationality) {
          if (!value) {
            error = "This field is required";
          } else if (
            (name === "dualPassportIssueDate" || name === "dualPassportExpiryDate") &&
            value
          ) {
            const dateValue = new Date(value);
            const today = new Date();
            // Clear time for date-only comparison
            today.setHours(0, 0, 0, 0);
            dateValue.setHours(0, 0, 0, 0);
            
            if (name === "dualPassportIssueDate" && dateValue > today) {
              error = "Issue date cannot be in the future";
            }
            if (name === "dualPassportExpiryDate" && dateValue < today) {
              error = "Expiry date cannot be in the past";
            }
          }
        }
        break;
    }
    
    return error;
  };

  const handleFieldBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, currentShareholder[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (name, value) => {
    setCurrentShareholder(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddShareholder = () => {
    console.log('🔍 Adding shareholder with type:', shareholderType);
    console.log('🔍 Current shareholder data:', currentShareholder);
    
    // Validate shareholding percentage total
    if (currentShareholder.shareholding) {
      const currentTotal = shareholders.reduce((total, s) => {
        if (editingIndex !== null && shareholders.indexOf(s) === editingIndex) {
          return total; // Skip the one being edited
        }
        return total + (parseFloat(s.shareholding) || 0);
      }, 0);
      
      const newShareholding = parseFloat(currentShareholder.shareholding) || 0;
      const totalAfterEdit = currentTotal + newShareholding;
      
      if (totalAfterEdit > 100) {
        setErrors(prev => ({ ...prev, shareholding: `Total shareholding cannot exceed 100%. Current total: ${currentTotal.toFixed(2)}%, adding ${newShareholding.toFixed(2)}% would make it ${totalAfterEdit.toFixed(2)}%` }));
        return;
      }
    }

    // Check if required fields are filled based on shareholder type
    let hasRequiredFields = false;
    
    if (shareholderType === "Natural Person") {
      hasRequiredFields = currentShareholder.fullName && currentShareholder.fullName.trim();
      console.log('🔍 Natural Person validation:', { fullName: currentShareholder.fullName, hasRequiredFields });
    } else if (shareholderType === "Legal Entities") {
      hasRequiredFields = currentShareholder.legalName && currentShareholder.legalName.trim();
      console.log('🔍 Legal Entities validation:', { legalName: currentShareholder.legalName, hasRequiredFields });
    } else if (shareholderType === "Trust") {
      hasRequiredFields = currentShareholder.trustName && currentShareholder.trustName.trim();
      console.log('🔍 Trust validation:', { trustName: currentShareholder.trustName, hasRequiredFields });
    }
    
    console.log('🔍 Final validation result:', hasRequiredFields);
    
    if (hasRequiredFields) {
      // Combine country code + phone number for storage
      const phoneWithCountryCode = currentShareholder.countryCode + currentShareholder.phone;
      
      // Convert arrays to JSON strings for multiselect fields (legal entity only)
      const processedShareholder = { ...currentShareholder };
      if (shareholderType === "Legal Entities") {
        if (Array.isArray(processedShareholder.businessActivity)) {
          processedShareholder.businessActivity = processedShareholder.businessActivity.length > 0 
            ? JSON.stringify(processedShareholder.businessActivity) 
            : "";
        }
        if (Array.isArray(processedShareholder.countriesOfOperation)) {
          processedShareholder.countriesOfOperation = processedShareholder.countriesOfOperation.length > 0 
            ? JSON.stringify(processedShareholder.countriesOfOperation) 
            : "";
        }
        if (Array.isArray(processedShareholder.countriesSourceOfFunds)) {
          processedShareholder.countriesSourceOfFunds = processedShareholder.countriesSourceOfFunds.length > 0 
            ? JSON.stringify(processedShareholder.countriesSourceOfFunds) 
            : "";
        }
      }
      
      const newShareholder = { 
        ...processedShareholder, 
        type: shareholderType,
        phone: phoneWithCountryCode // Store the combined phone number
      };
      
      if (editingIndex !== null) {
        // Update existing shareholder
        const updatedShareholders = [...shareholders];
        updatedShareholders[editingIndex] = newShareholder;
        onShareholdersChange(updatedShareholders);
        setEditingIndex(null);
        setShareholderType("Natural Person");
      } else {
        // Add new shareholder
        onShareholdersChange([...shareholders, newShareholder]);
      }
      
            // If this shareholder is also a director, fill the director form fields
      if (newShareholder.isDirector && onDirectorCreate && shareholderType === "Natural Person") {
        const directorData = {
          firstName: newShareholder.fullName ? newShareholder.fullName.split(' ')[0] : '',
          lastName: newShareholder.fullName ? newShareholder.fullName.split(' ').slice(1).join(' ') : '',
          alias: newShareholder.alias || '',
          countryOfResidence: newShareholder.countryOfResidence || '',
          nationality: newShareholder.nationality || '',
          dateOfBirth: newShareholder.dateOfBirth || '',
          placeOfBirth: newShareholder.placeOfBirth || '',
          phone: newShareholder.phone || '',
          email: newShareholder.email || '',
          address: newShareholder.address || '',
          city: '', // Not available in shareholder form
          occupation: newShareholder.occupation || '',
          pepStatus: newShareholder.pep || '',
          dualNationality: newShareholder.dualNationality || '',
          isCeo: false,
          isRepresentative: false
        };
        
        console.log('👔 Filling director form with shareholder data:', directorData);
        onDirectorCreate(directorData);
      }

      // If this shareholder is also a UBO, fill the UBO form fields
      if (newShareholder.isUbo && onUboCreate && shareholderType === "Natural Person") {
        const uboData = {
          fullName: newShareholder.fullName || '',
          alias: newShareholder.alias || '',
          countryOfResidence: newShareholder.countryOfResidence || '',
          nationality: newShareholder.nationality || '',
          dateOfBirth: newShareholder.dateOfBirth || '',
          placeOfBirth: newShareholder.placeOfBirth || '',
          phone: newShareholder.phone || '',
          email: newShareholder.email || '',
          address: newShareholder.address || '',
          sourceOfFunds: newShareholder.sourceOfFunds || '',
          sourceOfWealth: newShareholder.sourceOfWealth || '',
          occupation: newShareholder.occupation || '',
          expectedIncome: newShareholder.expectedIncome || '',
          pep: newShareholder.pep || '',
          shareholding: newShareholder.shareholding || '',
          dualNationality: newShareholder.dualNationality || ''
        };
        
        console.log('👤 Filling UBO form with shareholder data:', uboData);
        onUboCreate(uboData);
      }

      // Reset form based on shareholder type
      if (shareholderType === "Natural Person") {
        setCurrentShareholder({
          type: "Natural Person",
          fullName: "",
          alias: "",
          countryOfResidence: "",
          nationality: "",
          dateOfBirth: "",
          placeOfBirth: "",
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
          dualNationality: "",
          isDirector: false,
            isUbo: false
        });
      } else if (shareholderType === "Legal Entities") {
        setCurrentShareholder({
          type: "Legal Entities",
          legalName: "",
          alias: "",
          dateOfIncorporation: "",
          countryOfIncorporation: "",
          entityClass: "",
          licenseType: "",
          licenseNumber: "",
          licenseIssueDate: "",
          licenseExpiryDate: "",
          businessActivity: [],
          countriesOfOperation: [],
          registeredOfficeAddress: "",
          countriesSourceOfFunds: [],
          otherDetails: "",
          email: "",
          countryCode: "+971",
          phone: "",
          shareholding: ""
        });
      } else if (shareholderType === "Trust") {
        setCurrentShareholder({
          type: "Trust",
          trustName: "",
          alias: "",
          trustRegistered: false,
          trustType: "",
          jurisdictionOfLaw: "",
          registeredAddress: "",
          trusteeName: "",
          trusteeType: "",
          shareholding: ""
        });
      }
      setErrors({});
      setTouched({});
      
      // Hide the add form after successful addition
      setShowAddForm(false);
    }
  };

  const handleRemoveShareholder = async (index) => {
    const shareholderToRemove = shareholders[index];
    console.log('🗑️ Removing shareholder:', shareholderToRemove);
    
    // Check if this shareholder has an ID (meaning it's saved in the database)
    if (shareholderToRemove.id) {
      try {
        // First, delete from the database
        const { success, error } = await customerService.deleteShareholderById(shareholderToRemove.id);
        
        if (success) {
          // If database deletion succeeds, remove from UI
          const newShareholders = shareholders.filter((_, i) => i !== index);
          onShareholdersChange(newShareholders);
          console.log('✅ Shareholder removed from database and UI');
        } else {
          // If database deletion fails, show error
          console.error('❌ Failed to delete shareholder from database:', error);
          alert(`Failed to remove shareholder: ${error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Error during shareholder removal:', error);
        alert(`Error removing shareholder: ${error.message || 'Unknown error'}`);
      }
    } else {
      // This is a new shareholder that hasn't been saved to the database yet
      console.log('🗑️ Removing new shareholder (no ID yet):', shareholderToRemove);
      
      // Just remove from UI since it's not in the database
      const newShareholders = shareholders.filter((_, i) => i !== index);
      onShareholdersChange(newShareholders);
      console.log('✅ New shareholder removed from UI');
    }
  };

  const handleEditShareholder = async (index) => {
    const shareholderToEdit = shareholders[index];
    console.log('🔍 Editing shareholder:', shareholderToEdit);
    
    // Check if this shareholder has an ID (meaning it's saved in the database)
    if (shareholderToEdit.id) {
      try {
        // Fetch fresh data from the database for this specific shareholder
        const { success, data: freshShareholderData, error } = await customerService.getShareholderById(shareholderToEdit.id);
        
        if (success && freshShareholderData) {
          console.log('🔍 Fresh shareholder data from database:', freshShareholderData);
          
          // Parse phone number to separate country code and phone number
          const { countryCode, phone } = parsePhoneNumber(freshShareholderData.phone || '');
          
          // Parse JSON strings for multiselect fields (legal entity only)
          let parsedData = { ...freshShareholderData };
          if (freshShareholderData.type === 'Legal Entities' || freshShareholderData.entity_type === 'Legal Entities') {
            // Parse JSON strings to arrays
            if (typeof parsedData.businessActivity === 'string' && parsedData.businessActivity) {
              try {
                parsedData.businessActivity = JSON.parse(parsedData.businessActivity);
              } catch (e) {
                parsedData.businessActivity = parsedData.businessActivity ? [parsedData.businessActivity] : [];
              }
            } else if (!Array.isArray(parsedData.businessActivity)) {
              parsedData.businessActivity = [];
            }
            
            if (typeof parsedData.countriesOfOperation === 'string' && parsedData.countriesOfOperation) {
              try {
                parsedData.countriesOfOperation = JSON.parse(parsedData.countriesOfOperation);
              } catch (e) {
                parsedData.countriesOfOperation = parsedData.countriesOfOperation ? [parsedData.countriesOfOperation] : [];
              }
            } else if (!Array.isArray(parsedData.countriesOfOperation)) {
              parsedData.countriesOfOperation = [];
            }
            
            if (typeof parsedData.countriesSourceOfFunds === 'string' && parsedData.countriesSourceOfFunds) {
              try {
                parsedData.countriesSourceOfFunds = JSON.parse(parsedData.countriesSourceOfFunds);
              } catch (e) {
                parsedData.countriesSourceOfFunds = parsedData.countriesSourceOfFunds ? [parsedData.countriesSourceOfFunds] : [];
              }
            } else if (!Array.isArray(parsedData.countriesSourceOfFunds)) {
              parsedData.countriesSourceOfFunds = [];
            }
          }
          
          // Use the fresh data from database
          const shareholderWithDefaults = {
            ...parsedData,
            countryCode: countryCode || '+971',
            phone: phone || '',
            type: freshShareholderData.type || shareholderToEdit.type || "Natural Person"
          };
          
          console.log('🔍 Processed shareholder data:', shareholderWithDefaults);
          
          // Set the shareholder type FIRST, then the current shareholder data
          setShareholderType(freshShareholderData.type || shareholderToEdit.type || "Natural Person");
          setCurrentShareholder(shareholderWithDefaults);
          setEditingIndex(index);
          
          console.log('🔍 Set shareholderType:', freshShareholderData.type || shareholderToEdit.type || "Natural Person");
          console.log('🔍 Set currentShareholder:', shareholderWithDefaults);
        } else {
          console.error('🔍 Failed to fetch fresh shareholder data:', error);
          // Fallback to existing data if fetch fails
          const { countryCode, phone } = parsePhoneNumber(shareholderToEdit.phone || '');
          
          // Parse JSON strings for multiselect fields (legal entity only)
          let parsedData = { ...shareholderToEdit };
          if (shareholderToEdit.type === 'Legal Entities' || shareholderToEdit.entity_type === 'Legal Entities') {
            // Parse JSON strings to arrays
            if (typeof parsedData.businessActivity === 'string' && parsedData.businessActivity) {
              try {
                parsedData.businessActivity = JSON.parse(parsedData.businessActivity);
              } catch (e) {
                parsedData.businessActivity = parsedData.businessActivity ? [parsedData.businessActivity] : [];
              }
            } else if (!Array.isArray(parsedData.businessActivity)) {
              parsedData.businessActivity = [];
            }
            
            if (typeof parsedData.countriesOfOperation === 'string' && parsedData.countriesOfOperation) {
              try {
                parsedData.countriesOfOperation = JSON.parse(parsedData.countriesOfOperation);
              } catch (e) {
                parsedData.countriesOfOperation = parsedData.countriesOfOperation ? [parsedData.countriesOfOperation] : [];
              }
            } else if (!Array.isArray(parsedData.countriesOfOperation)) {
              parsedData.countriesOfOperation = [];
            }
            
            if (typeof parsedData.countriesSourceOfFunds === 'string' && parsedData.countriesSourceOfFunds) {
              try {
                parsedData.countriesSourceOfFunds = JSON.parse(parsedData.countriesSourceOfFunds);
              } catch (e) {
                parsedData.countriesSourceOfFunds = parsedData.countriesSourceOfFunds ? [parsedData.countriesSourceOfFunds] : [];
              }
            } else if (!Array.isArray(parsedData.countriesSourceOfFunds)) {
              parsedData.countriesSourceOfFunds = [];
            }
          }
          
          const shareholderWithDefaults = {
            ...parsedData,
            countryCode: countryCode || '+971',
            phone: phone || '',
            type: shareholderToEdit.type || "Natural Person"
          };
          
          setShareholderType(shareholderToEdit.type || "Natural Person");
          setCurrentShareholder(shareholderWithDefaults);
          setEditingIndex(index);
        }
      } catch (error) {
        console.error('🔍 Error fetching shareholder data:', error);
        // Fallback to existing data if fetch fails
        const { countryCode, phone } = parsePhoneNumber(shareholderToEdit.phone || '');
        
        // Parse JSON strings for multiselect fields (legal entity only)
        let parsedData = { ...shareholderToEdit };
        if (shareholderToEdit.type === 'Legal Entities' || shareholderToEdit.entity_type === 'Legal Entities') {
          // Parse JSON strings to arrays
          if (typeof parsedData.businessActivity === 'string' && parsedData.businessActivity) {
            try {
              parsedData.businessActivity = JSON.parse(parsedData.businessActivity);
            } catch (e) {
              parsedData.businessActivity = parsedData.businessActivity ? [parsedData.businessActivity] : [];
            }
          } else if (!Array.isArray(parsedData.businessActivity)) {
            parsedData.businessActivity = [];
          }
          
          if (typeof parsedData.countriesOfOperation === 'string' && parsedData.countriesOfOperation) {
            try {
              parsedData.countriesOfOperation = JSON.parse(parsedData.countriesOfOperation);
            } catch (e) {
              parsedData.countriesOfOperation = parsedData.countriesOfOperation ? [parsedData.countriesOfOperation] : [];
            }
          } else if (!Array.isArray(parsedData.countriesOfOperation)) {
            parsedData.countriesOfOperation = [];
          }
          
          if (typeof parsedData.countriesSourceOfFunds === 'string' && parsedData.countriesSourceOfFunds) {
            try {
              parsedData.countriesSourceOfFunds = JSON.parse(parsedData.countriesSourceOfFunds);
            } catch (e) {
              parsedData.countriesSourceOfFunds = parsedData.countriesSourceOfFunds ? [parsedData.countriesSourceOfFunds] : [];
            }
          } else if (!Array.isArray(parsedData.countriesSourceOfFunds)) {
            parsedData.countriesSourceOfFunds = [];
          }
        }
        
        const shareholderWithDefaults = {
          ...parsedData,
          countryCode: countryCode || '+971',
          phone: phone || '',
          type: shareholderToEdit.type || "Natural Person"
        };
        
        setShareholderType(shareholderToEdit.type || "Natural Person");
        setCurrentShareholder(shareholderWithDefaults);
        setEditingIndex(index);
      }
    } else {
      // This is a new shareholder that hasn't been saved to the database yet
      console.log('🔍 Editing new shareholder (no ID yet):', shareholderToEdit);
      
      // Parse phone number to separate country code and phone number
      const { countryCode, phone } = parsePhoneNumber(shareholderToEdit.phone || '');
      
      // Parse JSON strings for multiselect fields (legal entity only)
      let parsedData = { ...shareholderToEdit };
      if (shareholderToEdit.type === 'Legal Entities' || shareholderToEdit.entity_type === 'Legal Entities') {
        // Parse JSON strings to arrays
        if (typeof parsedData.businessActivity === 'string' && parsedData.businessActivity) {
          try {
            parsedData.businessActivity = JSON.parse(parsedData.businessActivity);
          } catch (e) {
            parsedData.businessActivity = parsedData.businessActivity ? [parsedData.businessActivity] : [];
          }
        } else if (!Array.isArray(parsedData.businessActivity)) {
          parsedData.businessActivity = [];
        }
        
        if (typeof parsedData.countriesOfOperation === 'string' && parsedData.countriesOfOperation) {
          try {
            parsedData.countriesOfOperation = JSON.parse(parsedData.countriesOfOperation);
          } catch (e) {
            parsedData.countriesOfOperation = parsedData.countriesOfOperation ? [parsedData.countriesOfOperation] : [];
          }
        } else if (!Array.isArray(parsedData.countriesOfOperation)) {
          parsedData.countriesOfOperation = [];
        }
        
        if (typeof parsedData.countriesSourceOfFunds === 'string' && parsedData.countriesSourceOfFunds) {
          try {
            parsedData.countriesSourceOfFunds = JSON.parse(parsedData.countriesSourceOfFunds);
          } catch (e) {
            parsedData.countriesSourceOfFunds = parsedData.countriesSourceOfFunds ? [parsedData.countriesSourceOfFunds] : [];
          }
        } else if (!Array.isArray(parsedData.countriesSourceOfFunds)) {
          parsedData.countriesSourceOfFunds = [];
        }
      }
      
      // Use the existing data directly
      const shareholderWithDefaults = {
        ...parsedData,
        countryCode: countryCode || '+971',
        phone: phone || '',
        type: shareholderToEdit.type || "Natural Person"
      };
      
      console.log('🔍 Processed new shareholder data:', shareholderWithDefaults);
      
      // Set the shareholder type and current shareholder data
      setShareholderType(shareholderToEdit.type || "Natural Person");
      setCurrentShareholder(shareholderWithDefaults);
      setEditingIndex(index);
      
      console.log('🔍 Set shareholderType for new shareholder:', shareholderToEdit.type || "Natural Person");
      console.log('🔍 Set currentShareholder for new shareholder:', shareholderWithDefaults);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setShareholderType("Natural Person");
    setCurrentShareholder({
      type: "Natural Person",
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
      dualNationality: "",
      isDirector: false,
      isUbo: false,
      isDualNationality: false,
      dualNationalityCountry: "",
      dualPassportNumber: "",
      dualPassportIssueDate: "",
      dualPassportExpiryDate: ""
    });
    setErrors({});
    setTouched({});
    setShowAddForm(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setShowShareholders(!showShareholders)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex justify-between items-center"
      >
        <span className="font-medium text-gray-900">Shareholder Details</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            showShareholders ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showShareholders && (
        <div className="p-4 border-t border-gray-200">
          {/* Show existing/added shareholders */}
          {shareholders.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-4 text-gray-900">Shareholders</h4>
              
              {/* Total Shareholding Display */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Total Shareholding:</span> {shareholders.reduce((total, s) => total + (parseFloat(s.shareholding) || 0), 0).toFixed(2)}%
                </p>
              </div>
              
              <div className="space-y-3">
                {shareholders.map((shareholder, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {shareholder.fullName || shareholder.legalName || shareholder.trustName}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditShareholder(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveShareholder(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Type: {shareholder.type}</p>
                    {shareholder.shareholding && (
                      <p className="text-sm text-gray-600">Shareholding: {shareholder.shareholding}%</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Always show "Add New Shareholder" button in edit mode */}
          {isEdit && (
            <div className="mb-6">
              {/* Show message when no shareholders exist */}
              {shareholders.length === 0 && (
                <p className="text-gray-700 text-md font-medium mb-3 italic">
                  No Shareholders have been added yet
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add New Shareholder
                </button>
              </div>
            </div>
          )}
          
          {/* Add Shareholder Form - show directly for new customers, or when adding/editing for existing customers */}
          {(!isEdit || showAddForm || editingIndex !== null) && (
            <div className={`mb-6 p-4 border rounded-lg ${
              editingIndex !== null 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <h4 className={`font-medium mb-4 ${
                editingIndex !== null ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {editingIndex !== null ? `Edit Shareholder: ${shareholders[editingIndex]?.fullName || shareholders[editingIndex]?.legalName || shareholders[editingIndex]?.trustName}` : 'Add New Shareholder'}
              </h4>
              
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    className={`input ${errors.fullName && touched.fullName ? 'border-red-500' : ''}`}
                    value={currentShareholder.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    onBlur={() => handleFieldBlur('fullName')}
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input 
                    className={`input ${errors.alias && touched.alias ? 'border-red-500' : ''}`}
                    value={currentShareholder.alias}
                    onChange={(e) => handleInputChange('alias', e.target.value)}
                    onBlur={() => handleFieldBlur('alias')}
                  />
                  {errors.alias && touched.alias && (
                    <p className="text-red-500 text-sm mt-1">{errors.alias}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                  <select 
                    className="input"
                    value={currentShareholder.countryOfResidence}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, countryOfResidence: e.target.value }))}
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
                    value={currentShareholder.nationality}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, nationality: e.target.value }))}
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
                    value={currentShareholder.dateOfBirth}
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
                    value={currentShareholder.placeOfBirth}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, placeOfBirth: e.target.value }))}
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
                    value={currentShareholder.idType}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, idType: e.target.value }))}
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
                    value={currentShareholder.idNumber}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, idNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Issue Date</label>
                  <input
                    type="date"
                    className="input"
                    value={currentShareholder.idIssueDate}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, idIssueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiry Date</label>
                  <input
                    type="date"
                    className="input"
                    value={currentShareholder.idExpiryDate}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, idExpiryDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="sh-is-dual-nationality"
                    checked={currentShareholder.isDualNationality}
                    onChange={(e) =>
                      setCurrentShareholder(prev => ({ ...prev, isDualNationality: e.target.checked }))
                    }
                  />
                  <label htmlFor="sh-is-dual-nationality" className="text-sm font-medium text-gray-700">
                    Is Dual Nationality?
                  </label>
                </div>
                {currentShareholder.isDualNationality && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
                      <select
                        className={`input ${errors.dualNationalityCountry && touched.dualNationalityCountry ? 'border-red-500' : ''}`}
                        value={currentShareholder.dualNationalityCountry}
                        onChange={(e) => handleInputChange('dualNationalityCountry', e.target.value)}
                        onBlur={() => handleFieldBlur('dualNationalityCountry')}
                      >
                        <option value="">Select Dual Nationality</option>
                        {countries.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      {errors.dualNationalityCountry && touched.dualNationalityCountry && (
                        <p className="text-red-500 text-sm mt-1">{errors.dualNationalityCountry}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                      <input
                        className={`input ${errors.dualPassportNumber && touched.dualPassportNumber ? 'border-red-500' : ''}`}
                        value={currentShareholder.dualPassportNumber}
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
                        value={currentShareholder.dualPassportIssueDate}
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
                        value={currentShareholder.dualPassportExpiryDate}
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
                      value={currentShareholder.countryCode || '+971'}
                      onChange={(e) => {
                        setCurrentShareholder(prev => ({ ...prev, countryCode: e.target.value }));
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
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                      value={currentShareholder.phone || ''}
                      onChange={(e) => {
                        // Only allow numbers
                        const numbersOnly = e.target.value.replace(/[^0-9]/g, '');
                        setCurrentShareholder(prev => ({ ...prev, phone: numbersOnly }));
                      }}
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className={`input ${errors.email && touched.email ? 'border-red-500' : ''}`}
                    value={currentShareholder.email}
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
                    value={currentShareholder.address}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                  <select 
                    className="input"
                    value={currentShareholder.sourceOfFunds}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, sourceOfFunds: e.target.value }))}
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
                    value={currentShareholder.sourceOfWealth}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, sourceOfWealth: e.target.value }))}
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
                    value={currentShareholder.occupation}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, occupation: e.target.value }))}
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
                    value={currentShareholder.expectedIncome}
                    onChange={(e) => handleInputChange('expectedIncome', e.target.value)}
                    onBlur={() => handleFieldBlur('expectedIncome')}
                  />
                  {errors.expectedIncome && touched.expectedIncome && (
                    <p className="text-red-500 text-sm mt-1">{errors.expectedIncome}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PEP</label>
                  <select 
                    className="input"
                    value={currentShareholder.pep}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, pep: e.target.value }))}
                  >
                    <option value="">Select PEP Status</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                  <input 
                    className={`input ${errors.shareholding && touched.shareholding ? 'border-red-500' : ''}`}
                    value={currentShareholder.shareholding}
                    onChange={(e) => handleInputChange('shareholding', e.target.value)}
                    onBlur={() => handleFieldBlur('shareholding')}
                  />
                  {errors.shareholding && touched.shareholding && (
                    <p className="text-red-500 text-sm mt-1">{errors.shareholding}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isDirector"
                    checked={currentShareholder.isDirector}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, isDirector: e.target.checked }))}
                  />
                  <label htmlFor="isDirector">Is Director?</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isUbo"
                    checked={currentShareholder.isUbo}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, isUbo: e.target.checked }))}
                  />
                  <label htmlFor="isUbo">Is UBO?</label>
                </div>
              </div>
            )}

            {shareholderType === "Legal Entities" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                  <input 
                    className={`input ${errors.legalName && touched.legalName ? 'border-red-500' : ''}`}
                    value={currentShareholder.legalName || currentShareholder.fullName || ""}
                    onChange={(e) => handleInputChange('legalName', e.target.value)}
                    onBlur={() => handleFieldBlur('legalName')}
                  />
                  {errors.legalName && touched.legalName && (
                    <p className="text-red-500 text-sm mt-1">{errors.legalName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input 
                    className="input"
                    value={currentShareholder.alias || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, alias: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incorporation</label>
                  <input 
                    type="date" 
                    className={`input ${errors.dateOfIncorporation && touched.dateOfIncorporation ? 'border-red-500' : ''}`}
                    value={currentShareholder.dateOfIncorporation || ""}
                    onChange={(e) => handleInputChange('dateOfIncorporation', e.target.value)}
                    onBlur={() => handleFieldBlur('dateOfIncorporation')}
                  />
                  {errors.dateOfIncorporation && touched.dateOfIncorporation && (
                    <p className="text-red-500 text-sm mt-1">{errors.dateOfIncorporation}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Incorporation</label>
                  <select 
                    className="input"
                    value={currentShareholder.countryOfIncorporation || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, countryOfIncorporation: e.target.value }))}
                  >
                    <option value="">Select Country of Incorporation</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    className="input"
                    value={currentShareholder.entityClass || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, entityClass: e.target.value }))}
                  >
                    <option value="">Select Type</option>
                    {entityClassTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                  <select 
                    className="input"
                    value={currentShareholder.licenseType || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, licenseType: e.target.value }))}
                  >
                    <option value="">Select License Type</option>
                      {licenseTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input 
                    className="input"
                    value={currentShareholder.licenseNumber || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                  <input 
                    type="date" 
                    className={`input ${errors.licenseIssueDate && touched.licenseIssueDate ? 'border-red-500' : ''}`}
                    value={currentShareholder.licenseIssueDate || ""}
                    onChange={(e) => handleInputChange('licenseIssueDate', e.target.value)}
                    onBlur={() => handleFieldBlur('licenseIssueDate')}
                  />
                  {errors.licenseIssueDate && touched.licenseIssueDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.licenseIssueDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input 
                    type="date" 
                    className="input"
                    value={currentShareholder.licenseExpiryDate || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                  />
                </div>
                <div>
                  {(() => {
                    const selectedValues = currentShareholder.businessActivity || [];
                    const addToMultiSelect = (item) => {
                      const currentValues = Array.isArray(currentShareholder.businessActivity) ? currentShareholder.businessActivity : [];
                      if (!currentValues.includes(item)) {
                        setCurrentShareholder(prev => ({ ...prev, businessActivity: [...currentValues, item] }));
                      }
                    };
                    const removeFromMultiSelect = (item) => {
                      const currentValues = Array.isArray(currentShareholder.businessActivity) ? currentShareholder.businessActivity : [];
                      setCurrentShareholder(prev => ({ ...prev, businessActivity: currentValues.filter(value => value !== item) }));
                    };
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Business Activity <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedValues.map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {value}
                              <button
                                type="button"
                                onClick={() => removeFromMultiSelect(value)}
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <select
                          className="input"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addToMultiSelect(e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Select Business Activity</option>
                          {businessActivities.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  {(() => {
                    const selectedValues = currentShareholder.countriesOfOperation || [];
                    const addToMultiSelect = (item) => {
                      const currentValues = Array.isArray(currentShareholder.countriesOfOperation) ? currentShareholder.countriesOfOperation : [];
                      if (!currentValues.includes(item)) {
                        setCurrentShareholder(prev => ({ ...prev, countriesOfOperation: [...currentValues, item] }));
                      }
                    };
                    const removeFromMultiSelect = (item) => {
                      const currentValues = Array.isArray(currentShareholder.countriesOfOperation) ? currentShareholder.countriesOfOperation : [];
                      setCurrentShareholder(prev => ({ ...prev, countriesOfOperation: currentValues.filter(value => value !== item) }));
                    };
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Countries of Operation <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedValues.map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {value}
                              <button
                                type="button"
                                onClick={() => removeFromMultiSelect(value)}
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <select
                          className="input"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addToMultiSelect(e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Select Countries of Operation</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                  <select 
                    className="input"
                    value={currentShareholder.sourceOfFunds || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, sourceOfFunds: e.target.value }))}
                  >
                    <option value="">Select Source of Funds</option>
                    {sourceOfFunds.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registered Office Address</label>
                  <input 
                    className="input"
                    value={currentShareholder.registeredOfficeAddress || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, registeredOfficeAddress: e.target.value }))}
                  />
                </div>
                <div>
                  {(() => {
                    const selectedValues = currentShareholder.countriesSourceOfFunds || [];
                    const addToMultiSelect = (item) => {
                      const currentValues = Array.isArray(currentShareholder.countriesSourceOfFunds) ? currentShareholder.countriesSourceOfFunds : [];
                      if (!currentValues.includes(item)) {
                        setCurrentShareholder(prev => ({ ...prev, countriesSourceOfFunds: [...currentValues, item] }));
                      }
                    };
                    const removeFromMultiSelect = (item) => {
                      const currentValues = Array.isArray(currentShareholder.countriesSourceOfFunds) ? currentShareholder.countriesSourceOfFunds : [];
                      setCurrentShareholder(prev => ({ ...prev, countriesSourceOfFunds: currentValues.filter(value => value !== item) }));
                    };
                    return (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Countries Source of Funds <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedValues.map((value, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {value}
                              <button
                                type="button"
                                onClick={() => removeFromMultiSelect(value)}
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-200"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <select
                          className="input"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              addToMultiSelect(e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          <option value="">Select Countries Source of Funds</option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.name}>
                              {country.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className={`input ${errors.email && touched.email ? 'border-red-500' : ''}`}
                    value={currentShareholder.email || ""}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                  />
                  {errors.email && touched.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex gap-2">
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32"
                      value={currentShareholder.countryCode || '+971'}
                      onChange={(e) => {
                        setCurrentShareholder(prev => ({ ...prev, countryCode: e.target.value }));
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
                      value={currentShareholder.phone || ''}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Details</label>
                  <input 
                    className="input" 
                    rows="3"
                    value={currentShareholder.otherDetails || ""}
                    onChange={(e) => setCurrentShareholder(prev => ({ ...prev, otherDetails: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                  <input 
                    className={`input ${errors.shareholding && touched.shareholding ? 'border-red-500' : ''}`}
                    value={currentShareholder.shareholding}
                    onChange={(e) => handleInputChange('shareholding', e.target.value)}
                    onBlur={() => handleFieldBlur('shareholding')}
                  />
                  {errors.shareholding && touched.shareholding && (
                    <p className="text-red-500 text-sm mt-1">{errors.shareholding}</p>
                  )}
                </div>
              </div>
            )}

            {shareholderType === "Trust" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trust Name</label>
                  <input 
                    className={`input ${errors.trustName && touched.trustName ? 'border-red-500' : ''}`}
                    value={currentShareholder.trustName || ''}
                    onChange={(e) => handleInputChange('trustName', e.target.value)}
                    onBlur={() => handleFieldBlur('trustName')}
                  />
                  {errors.trustName && touched.trustName && (
                    <p className="text-red-500 text-sm mt-1">{errors.trustName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input 
                    className="input"
                    value={currentShareholder.alias || ''}
                    onChange={(e) => handleInputChange('alias', e.target.value)}
                    onBlur={() => handleFieldBlur('alias')}
                  />
                  {errors.alias && touched.alias && (
                    <p className="text-red-500 text-sm mt-1">{errors.alias}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trust Registered</label>
                  <select 
                    className="input"
                    value={currentShareholder.trustRegistered === true ? 'Yes' : currentShareholder.trustRegistered === false ? 'No' : ''}
                    onChange={(e) => handleInputChange('trustRegistered', e.target.value === 'Yes')}
                  >
                    <option value="">Select Trust Registered Status</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type of Trust</label>
                  <select 
                    className="input"
                    value={currentShareholder.trustType || ''}
                    onChange={(e) => handleInputChange('trustType', e.target.value)}
                  >
                    <option value="">Select Type of Trust</option>
                    {trustTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction of Law</label>
                  <select 
                    className="input"
                    value={currentShareholder.jurisdictionOfLaw || ''}
                    onChange={(e) => handleInputChange('jurisdictionOfLaw', e.target.value)}
                  >
                    <option value="">Select Jurisdiction of Law</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
                  <input 
                    className="input"
                    value={currentShareholder.registeredAddress || ''}
                    onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                  <input 
                    className={`input ${errors.shareholding && touched.shareholding ? 'border-red-500' : ''}`}
                    value={currentShareholder.shareholding || ''}
                    onChange={(e) => handleInputChange('shareholding', e.target.value)}
                    onBlur={() => handleFieldBlur('shareholding')}
                  />
                  {errors.shareholding && touched.shareholding && (
                    <p className="text-red-500 text-sm mt-1">{errors.shareholding}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name of Trustee</label>
                  <input 
                    className="input"
                    value={currentShareholder.trusteeName || ''}
                    onChange={(e) => handleInputChange('trusteeName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trustee Type</label>
                  <select 
                    className="input"
                    value={currentShareholder.trusteeType || ''}
                    onChange={(e) => handleInputChange('trusteeType', e.target.value)}
                  >
                    <option value="">Select Trustee Type</option>
                    {trusteeTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            {/* Add/Update Button */}
            <div className="mt-4 flex space-x-2">
              <button
                type="button"
                onClick={handleAddShareholder}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingIndex !== null ? 'Update Shareholder' : 'Add Shareholder'}
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
};

export default ShareholdersSection;


