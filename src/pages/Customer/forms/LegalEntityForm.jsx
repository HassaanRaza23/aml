import React from "react";
import { countries } from "../../../data/countries";
import {
  businessActivities,
  licenseTypes,
  licenseCategories,
  jurisdictions,
  residencyStatuses,
  sourceOfFunds
} from "../../../data/dropdownOptions";

const LegalEntityForm = ({ formData, onInputChange }) => {

  // Helper function to add item to multi-select field
  const addToMultiSelect = (field, item) => {
    const currentValues = formData[field] || [];
    if (!currentValues.includes(item)) {
      onInputChange(field, [...currentValues, item]);
    }
  };

  // Helper function to remove item from multi-select field
  const removeFromMultiSelect = (field, item) => {
    const currentValues = formData[field] || [];
    onInputChange(field, currentValues.filter(value => value !== item));
  };

  // Helper function to render multi-select field
  const renderMultiSelect = (field, options, placeholder, label) => {
    const selectedValues = formData[field] || [];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} <span className="text-red-500">*</span>
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
                onClick={() => removeFromMultiSelect(field, value)}
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
              addToMultiSelect(field, e.target.value);
              e.target.value = "";
            }
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        {renderMultiSelect(
          'businessActivity',
          businessActivities,
          'Select Business Activity',
          'Business Activity'
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legal Name <span className="text-red-500">*</span>
        </label>
        <input 
          className="input"
          value={formData.legalName}
          onChange={(e) => onInputChange('legalName', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
        <input 
          className="input"
          value={formData.alias}
          onChange={(e) => onInputChange('alias', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date of Incorporation <span className="text-red-500">*</span>
        </label>
        <input 
          type="date" 
          className="input"
          value={formData.dateOfIncorporation}
          onChange={(e) => onInputChange('dateOfIncorporation', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country of Incorporation <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.countryOfIncorporation}
          onChange={(e) => onInputChange('countryOfIncorporation', e.target.value)}
        >
          <option value="">Select Country of Incorporation</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Type <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.licenseType}
          onChange={(e) => onInputChange('licenseType', e.target.value)}
        >
          <option value="">Select License Type</option>
          {licenseTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Number <span className="text-red-500">*</span>
        </label>
        <input 
          className="input"
          value={formData.licenseNumber}
          onChange={(e) => onInputChange('licenseNumber', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
        <input 
          type="date" 
          className="input"
          value={formData.licenseIssueDate}
          onChange={(e) => onInputChange('licenseIssueDate', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
        <input 
          type="date" 
          className="input"
          value={formData.licenseExpiryDate}
          onChange={(e) => onInputChange('licenseExpiryDate', e.target.value)}
        />
      </div>
      

      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Registered Office Address</label>
        <input 
          className="input"
          value={formData.registeredOfficeAddress}
          onChange={(e) => onInputChange('registeredOfficeAddress', e.target.value)}
        />
      </div>
      

      
      <div>
        {renderMultiSelect(
          'countriesSourceOfFunds',
          countries.map(c => c.name),
          'Select Countries Source of Funds',
          'Countries Source of Funds'
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Management Company</label>
        <input 
          className="input"
          value={formData.managementCompany}
          onChange={(e) => onInputChange('managementCompany', e.target.value)}
        />
      </div>
      
      <div>
        {renderMultiSelect(
          'countriesOfOperation',
          countries.map(c => c.name),
          'Select Countries of Operation',
          'Countries of Operation'
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jurisdiction <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.jurisdiction}
          onChange={(e) => onInputChange('jurisdiction', e.target.value)}
        >
          <option value="">Select Jurisdiction</option>
          {jurisdictions.map((jurisdiction) => (
            <option key={jurisdiction} value={jurisdiction}>{jurisdiction}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source of Funds <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.sourceOfFunds}
          onChange={(e) => onInputChange('sourceOfFunds', e.target.value)}
        >
          <option value="">Select Source of Funds</option>
          {sourceOfFunds.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Residency Status <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.residencyStatus}
          onChange={(e) => onInputChange('residencyStatus', e.target.value)}
        >
          <option value="">Select Residency Status</option>
          {residencyStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Licensing Authority / Other Details</label>
        <input 
          className="input"
          value={formData.licensingAuthority}
          onChange={(e) => onInputChange('licensingAuthority', e.target.value)}
          placeholder="Enter licensing authority or other details"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">TRN</label>
        <input 
          className="input"
          value={formData.trn}
          onChange={(e) => onInputChange('trn', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          License Category <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.licenseCategory}
          onChange={(e) => onInputChange('licenseCategory', e.target.value)}
        >
          <option value="">Select License Category</option>
          {licenseCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Expiry Date</label>
        <input 
          type="date" 
          className="input"
          value={formData.addressExpiryDate}
          onChange={(e) => onInputChange('addressExpiryDate', e.target.value)}
        />
      </div>
    </div>
  );
};
export default LegalEntityForm;