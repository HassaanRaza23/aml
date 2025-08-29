import React from "react";
import { countries } from "../../../data/countries";
import { occupations } from "../../../data/occupations";
import {
  professions,
  idTypes,
  pepOptions,
  residencyStatuses,
  genderOptions,
  sourceOfWealth,
  sourceOfFunds
} from "../../../data/dropdownOptions";

const NaturalPersonForm = ({ formData, onInputChange, onFieldBlur, errors, touched }) => {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
        <select 
          className="input"
          value={formData.profession}
          onChange={(e) => onInputChange('profession', e.target.value)}
        >
          <option value="">Select Profession</option>
          {professions.map((profession) => (
            <option key={profession} value={profession}>{profession}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name <span className="text-red-500">*</span>
        </label>
        <input 
          className={`input ${errors.firstName ? 'border-red-500' : ''}`}
          value={formData.firstName}
          onChange={(e) => onInputChange('firstName', e.target.value)}
          onBlur={() => onFieldBlur('firstName')}
        />
        {errors.firstName && touched.firstName && (
          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input 
          className="input"
          value={formData.lastName}
          onChange={(e) => onInputChange('lastName', e.target.value)}
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
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input 
          type="date" 
          className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
          value={formData.dateOfBirth}
          onChange={(e) => onInputChange('dateOfBirth', e.target.value)}
          onBlur={() => onFieldBlur('dateOfBirth')}
        />
        {errors.dateOfBirth && touched.dateOfBirth && (
          <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nationality <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.nationality}
          onChange={(e) => onInputChange('nationality', e.target.value)}
        >
          <option value="">Select Nationality</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Type <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.idType}
          onChange={(e) => onInputChange('idType', e.target.value)}
        >
          <option value="">Select ID Type</option>
          {idTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ID Number <span className="text-red-500">*</span>
        </label>
        <input 
          className="input"
          value={formData.idNumber}
          onChange={(e) => onInputChange('idNumber', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
        <input 
          type="date" 
          className="input"
          value={formData.issueDate}
          onChange={(e) => onInputChange('issueDate', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
        <input 
          type="date" 
          className="input"
          value={formData.expiryDate}
          onChange={(e) => onInputChange('expiryDate', e.target.value)}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="dual" 
          checked={formData.isDualNationality}
          onChange={(e) => onInputChange('isDualNationality', e.target.checked)}
        />
        <label htmlFor="dual">Is Dual Nationality?</label>
      </div>
      
      {formData.isDualNationality && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
            <select 
              className="input"
              value={formData.dualNationality}
              onChange={(e) => onInputChange('dualNationality', e.target.value)}
            >
              <option value="">Select Dual Nationality</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
            <input 
              className="input"
              value={formData.dualPassportNumber}
              onChange={(e) => onInputChange('dualPassportNumber', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Issue Date</label>
            <input 
              type="date" 
              className="input"
              value={formData.dualPassportIssueDate}
              onChange={(e) => onInputChange('dualPassportIssueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
            <input 
              type="date" 
              className="input"
              value={formData.dualPassportExpiryDate}
              onChange={(e) => onInputChange('dualPassportExpiryDate', e.target.value)}
            />
          </div>
        </>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <input 
          className="input"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Occupation <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.occupation}
          onChange={(e) => onInputChange('occupation', e.target.value)}
        >
          <option value="">Select Occupation</option>
          {occupations.map((occ) => (
            <option key={occ} value={occ}>{occ}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Source of Wealth <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.sourceOfWealth}
          onChange={(e) => onInputChange('sourceOfWealth', e.target.value)}
        >
          <option value="">Select Source of Wealth</option>
          {sourceOfWealth.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PEP <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.pep}
          onChange={(e) => onInputChange('pep', e.target.value)}
        >
          <option value="">Select PEP Status</option>
          {pepOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country of Birth <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.countryOfBirth}
          onChange={(e) => onInputChange('countryOfBirth', e.target.value)}
        >
          <option value="">Select Country of Birth</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">PO Box</label>
        <input 
          className="input"
          value={formData.poBox}
          onChange={(e) => onInputChange('poBox', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gender <span className="text-red-500">*</span>
        </label>
        <select 
          className="input"
          value={formData.gender}
          onChange={(e) => onInputChange('gender', e.target.value)}
        >
          <option value="">Select Gender</option>
          {genderOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
        <input 
          className="input"
          value={formData.employer}
          onChange={(e) => onInputChange('employer', e.target.value)}
        />
      </div>
      
    </div>
  );
};

export default NaturalPersonForm;
