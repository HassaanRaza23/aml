import React, { useState } from "react";
import { currencies } from "../../../data/currencies";
import { yesNoOptions } from "../../../data/dropdownOptions";

const BankDetailsSection = ({ bankDetails = [], onBankDetailsChange, isEdit = false }) => {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  
  const [currentBankDetail, setCurrentBankDetail] = useState({
    bankName: "",
    alias: "",
    accountType: "",
    currency: "",
    bankAccountDetails: "",
    accountNumber: "",
    iban: "",
    swift: "",
    modeOfSignatory: "",
    internetBanking: "",
    bankSignatories: ""
  });



  const handleInputChange = (fieldName, value) => {
    setCurrentBankDetail(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleAddBankDetail = () => {
    // No validation required - all fields are optional

    if (editingIndex !== null) {
      // Update existing bank detail
      const updatedBankDetails = [...bankDetails];
      updatedBankDetails[editingIndex] = { ...currentBankDetail };
      onBankDetailsChange(updatedBankDetails);
      setEditingIndex(null);
    } else {
      // Add new bank detail
      onBankDetailsChange([...bankDetails, { ...currentBankDetail }]);
    }
    
    // Reset form
    setCurrentBankDetail({
      bankName: "",
      alias: "",
      accountType: "",
      currency: "",
      bankAccountDetails: "",
      accountNumber: "",
      iban: "",
      swift: "",
      modeOfSignatory: "",
      internetBanking: "",
      bankSignatories: ""
    });
    setShowAddForm(false);
  };

  const handleRemoveBankDetail = (index) => {
    const newBankDetails = bankDetails.filter((_, i) => i !== index);
    onBankDetailsChange(newBankDetails);
  };

  const handleEditBankDetail = (index) => {
    const bankDetailToEdit = bankDetails[index];
    setCurrentBankDetail({ ...bankDetailToEdit });
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentBankDetail({
      bankName: "",
      alias: "",
      accountType: "",
      currency: "",
      bankAccountDetails: "",
      accountNumber: "",
      iban: "",
      swift: "",
      modeOfSignatory: "",
      internetBanking: "",
      bankSignatories: ""
    });
    setShowAddForm(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setShowBankDetails(!showBankDetails)}
        className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg flex justify-between items-center"
      >
        <span className="font-medium text-gray-900">Bank Details</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform ${
            showBankDetails ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showBankDetails && (
        <div className="p-4 border-t border-gray-200">
          {/* Display Existing Bank Details */}
          {bankDetails.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-3">Added Bank Details:</h4>
              <div className="space-y-3">
                {bankDetails.map((bankDetail, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{bankDetail.bankName}</span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditBankDetail(index)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveBankDetail(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Account: {bankDetail.accountNumber}</p>
                    <p className="text-sm text-gray-600">Type: {bankDetail.accountType}</p>
                    <p className="text-sm text-gray-600">Currency: {bankDetail.currency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Always show "Add New Bank Detail" button in edit mode */}
          {isEdit && (
            <div className="mb-6">
              {/* Show message when no bank details exist */}
              {bankDetails.length === 0 && (
                <p className="text-gray-700 text-md font-medium mb-3 italic">
                  No bank details have been added yet
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add New Bank Detail
                </button>
              </div>
            </div>
          )}
          
          {/* Add Bank Detail Form - show directly for new customers, or when adding/editing for existing customers */}
          {(!isEdit || showAddForm || editingIndex !== null) && (
            <div className={`mb-6 p-4 border rounded-lg ${
              editingIndex !== null 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200'
            }`}>
              <h4 className={`font-medium mb-4 ${
                editingIndex !== null ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {editingIndex !== null ? `Edit Bank Detail: ${bankDetails[editingIndex]?.bankName}` : 'Add New Bank Detail'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <input 
                    className="input"
                    value={currentBankDetail.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input 
                    className="input"
                    value={currentBankDetail.alias}
                    onChange={(e) => handleInputChange('alias', e.target.value)}
                    placeholder="Enter alias (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select 
                    className="input"
                    value={currentBankDetail.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                  >
                    <option value="">Select Account Type</option>
                    <option value="call">Call</option>
                    <option value="fixed">Fixed</option>
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                    <option value="checking">Checking</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select 
                    className="input"
                    value={currentBankDetail.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>{currency.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Details</label>
                  <input 
                    className="input"
                    value={currentBankDetail.bankAccountDetails}
                    onChange={(e) => handleInputChange('bankAccountDetails', e.target.value)}
                    placeholder="Enter additional account details (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <input 
                    className="input"
                    value={currentBankDetail.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                  <input 
                    className="input"
                    value={currentBankDetail.iban}
                    onChange={(e) => handleInputChange('iban', e.target.value)}
                    placeholder="Enter IBAN (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT</label>
                  <input 
                    className="input"
                    value={currentBankDetail.swift}
                    onChange={(e) => handleInputChange('swift', e.target.value)}
                    placeholder="Enter SWIFT code (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Signatory</label>
                  <select 
                    className="input"
                    value={currentBankDetail.modeOfSignatory}
                    onChange={(e) => handleInputChange('modeOfSignatory', e.target.value)}
                  >
                    <option value="">Select Mode of Signatory</option>
                    <option value="single">Single</option>
                    <option value="dual">Dual</option>
                    <option value="multiple">Multiple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internet Banking</label>
                  <select 
                    className="input"
                    value={currentBankDetail.internetBanking}
                    onChange={(e) => handleInputChange('internetBanking', e.target.value)}
                  >
                    <option value="">Select Internet Banking Status</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Signatories</label>
                  <select 
                    className="input"
                    value={currentBankDetail.bankSignatories}
                    onChange={(e) => handleInputChange('bankSignatories', e.target.value)}
                  >
                    <option value="">Select Bank Signatory</option>
                    <option value="signatory1">Signatory 1</option>
                    <option value="signatory2">Signatory 2</option>
                    <option value="signatory3">Signatory 3</option>
                  </select>
                </div>
              </div>
              
              {/* Add/Update Button */}
              <div className="mt-4 flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddBankDetail}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingIndex !== null ? 'Update Bank Detail' : 'Add Bank Detail'}
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
};

export default BankDetailsSection;
