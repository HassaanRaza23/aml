import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
import { customerService } from "../../services";

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{8,}$/;
  return phoneRegex.test(phone);
};

const validateDate = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  return selectedDate <= today;
};

const validateFutureDate = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  return selectedDate > today;
};

const OnboardingForm = ({ 
  isEdit = false, 
  initialData = null, 
  onSubmit = null, 
  onCancel = null 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showShareholders, setShowShareholders] = useState(false);
  const [showDirectors, setShowDirectors] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [showUBO, setShowUBO] = useState(false);

  const [selectedCode, setSelectedCode] = useState("+971"); // Default UAE code
  const [phoneNumber, setPhoneNumber] = useState("");

  // Parse phone number for edit mode
  useEffect(() => {
    if (isEdit && initialData && initialData.phone) {
      console.log('📞 Parsing phone number:', initialData.phone);
      
      // Extract country code and phone number
      const phone = initialData.phone;
      
      // Find the country code by checking if it starts with a known code
      const countryCodes = ['+971', '+92', '+44', '+91', '+86', '+33', '+49', '+81', '+61', '+7', '+1'];
      
      let foundCode = '+971'; // Default UAE code
      let number = phone;
      
      // Find the country code
      for (const code of countryCodes) {
        if (phone.startsWith(code)) {
          foundCode = code;
          number = phone.substring(code.length);
          break;
        }
      }
      
      console.log('📞 Parsed:', { code: foundCode, number });
      
      setSelectedCode(foundCode);
      setPhoneNumber(number);
    }
  }, [isEdit, initialData]);

  // Shareholder state
  const [shareholderType, setShareholderType] = useState("Natural Person");

  // Form state
  const [formData, setFormData] = useState(() => {
    if (isEdit && initialData) {
      console.log('🔍 Edit mode - Initial data:', initialData);
      // Transform database fields to form fields
      return {
        coreSystemId: initialData.core_system_id || "",
        customerType: initialData.customer_type || "",
        profession: initialData.profession || "",
        firstName: initialData.first_name || "",
        lastName: initialData.last_name || "",
        alias: initialData.alias || "",
        dateOfBirth: initialData.date_of_birth || "",
        nationality: initialData.nationality || "",
        idType: initialData.id_type || "",
        idNumber: initialData.id_number || "",
        issueDate: initialData.issue_date || "",
        expiryDate: initialData.expiry_date || "",
        email: initialData.email || "",
        address: initialData.address || "",
        city: initialData.city || "",
        occupation: initialData.occupation || "",
        sourceOfWealth: initialData.source_of_wealth || "",
        pep: initialData.pep_status || "",
        countryOfBirth: initialData.country_of_birth || "",
        sourceOfFunds: initialData.source_of_funds || "",
        residencyStatus: initialData.residency_status || "",
        isDualNationality: initialData.is_dual_nationality || false,
        channel: initialData.channel || "",
        poBox: initialData.po_box || "",
        gender: initialData.gender || "",
        employer: initialData.employer || "",
        dualNationality: initialData.dual_nationality || "",
        transactionProduct: initialData.transaction_product || ""
      };
    }
    
    return {
      coreSystemId: "",
      customerType: "",
      profession: "",
      firstName: "",
      lastName: "",
      alias: "",
      dateOfBirth: "",
      nationality: "",
      idType: "",
      idNumber: "",
      issueDate: "",
      expiryDate: "",
      email: "",
      address: "",
      city: "",
      occupation: "",
      sourceOfWealth: "",
      pep: "",
      countryOfBirth: "",
      sourceOfFunds: "",
      residencyStatus: "",
      isDualNationality: false,
      channel: "",
      poBox: "",
      gender: "",
      employer: "",
      dualNationality: "",
            transactionProduct: ""
    };
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Handle field blur (for validation)
  const handleFieldBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };

  // Validate individual field
  const validateField = (field, value) => {
    let error = "";

    // Handle undefined or null values
    if (value === undefined || value === null) {
      value = "";
    }

    switch (field) {
      case "firstName":
      case "lastName":
        if (!value || !value.trim()) {
          error = "This field is required";
        } else if (value.length < 2) {
          error = "Must be at least 2 characters";
        }
        break;
      case "email":
        if (!value || !value.trim()) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "dateOfBirth":
        if (!value) {
          error = "Date of birth is required";
        } else if (!validateDate(value)) {
          error = "Date of birth cannot be in the future";
        }
        break;
      case "expiryDate":
        if (value && !validateFutureDate(value)) {
          error = "Expiry date must be in the future";
        }
        break;
      case "phoneNumber":
        // Phone number validation is handled separately in validateForm
        break;
      case "customerType":
      case "nationality":
      case "idType":
      case "occupation":
      case "sourceOfWealth":
      case "pep":
      case "countryOfBirth":
      case "sourceOfFunds":
      case "residencyStatus":
      case "channel":
      case "gender":
      case "transactionProduct":
        if (!value) {
          error = "This field is required";
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  // Validate entire form
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "firstName", "lastName", "dateOfBirth", "nationality", 
      "idType", "idNumber", "email", "address", 
      "city", "occupation", "sourceOfWealth", "pep", 
      "countryOfBirth", "sourceOfFunds", "residencyStatus", 
      "channel", "gender", "transactionProduct"
    ];

    requiredFields.forEach(field => {
      const value = formData[field];
      validateField(field, value);
      if (!value || (typeof value === 'string' && !value.trim())) {
        newErrors[field] = "This field is required";
      }
    });

    // Validate phone number separately
    if (!phoneNumber || !phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!validatePhone(phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare customer data with proper database column names
      const customerData = {
        core_system_id: formData.coreSystemId,
        customer_type: formData.customerType,
        profession: formData.profession,
        first_name: formData.firstName,
        last_name: formData.lastName,
        alias: formData.alias,
        date_of_birth: formData.dateOfBirth,
        nationality: formData.nationality,
        id_type: formData.idType,
        id_number: formData.idNumber,
        issue_date: formData.issueDate,
        expiry_date: formData.expiryDate,
        email: formData.email,
        phone: selectedCode + phoneNumber.replace(/^0+/, ''), // Remove leading zeros
        address: formData.address,
        city: formData.city,
        occupation: formData.occupation,
        source_of_wealth: formData.sourceOfWealth,
        pep_status: formData.pep,
        country_of_birth: formData.countryOfBirth,
        source_of_funds: formData.sourceOfFunds,
        residency_status: formData.residencyStatus,
        is_dual_nationality: formData.isDualNationality,
        channel: formData.channel,
        po_box: formData.poBox,
        gender: formData.gender,
        employer: formData.employer,
        dual_nationality: formData.dualNationality,
        transaction_product: formData.transactionProduct
      };

      if (isEdit && onSubmit) {
        // Update existing customer
        const result = await onSubmit(customerData);
        if (result && result.success) {
          toast.success("Customer updated successfully!");
        } else {
          toast.error(result?.error || "Failed to update customer");
        }
      } else {
        // Create new customer
        customerData.kyc_status = "Pending";
        const result = await customerService.createCustomer(customerData);
        
        if (result.success) {
          toast.success("Customer onboarded successfully!");
          navigate("/customer/list");
        } else {
          toast.error(result.error || "Failed to onboard customer");
        }
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("An error occurred while creating the customer");
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {!isEdit && <h2 className="text-2xl font-semibold mb-6">Customer Onboarding Form</h2>}

      <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Core System ID</label>
            <input 
              className={`input ${errors.coreSystemId ? 'border-red-500' : ''}`}
              value={formData.coreSystemId}
              onChange={(e) => handleInputChange('coreSystemId', e.target.value)}
              onBlur={() => handleFieldBlur('coreSystemId')}
            />
            {errors.coreSystemId && touched.coreSystemId && (
              <p className="text-red-500 text-xs mt-1">{errors.coreSystemId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.customerType ? 'border-red-500' : ''}`}
              value={formData.customerType}
              onChange={(e) => handleInputChange('customerType', e.target.value)}
              onBlur={() => handleFieldBlur('customerType')}
            >
              <option value="">Select Customer Type</option>
          {customerTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
            {errors.customerType && touched.customerType && (
              <p className="text-red-500 text-xs mt-1">{errors.customerType}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <select 
              className={`input ${errors.profession ? 'border-red-500' : ''}`}
              value={formData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              onBlur={() => handleFieldBlur('profession')}
            >
              <option value="">Select Profession</option>
          {professions.map((profession) => (
            <option key={profession} value={profession}>{profession}</option>
          ))}
        </select>
            {errors.profession && touched.profession && (
              <p className="text-red-500 text-xs mt-1">{errors.profession}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input 
              className={`input ${errors.firstName ? 'border-red-500' : ''}`}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleFieldBlur('firstName')}
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
              className={`input ${errors.lastName ? 'border-red-500' : ''}`}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={() => handleFieldBlur('lastName')}
            />
            {errors.lastName && touched.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
            <input 
              className={`input ${errors.alias ? 'border-red-500' : ''}`}
              value={formData.alias}
              onChange={(e) => handleInputChange('alias', e.target.value)}
              onBlur={() => handleFieldBlur('alias')}
            />
            {errors.alias && touched.alias && (
              <p className="text-red-500 text-xs mt-1">{errors.alias}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className={`input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              onBlur={() => handleFieldBlur('dateOfBirth')}
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
              className={`input ${errors.nationality ? 'border-red-500' : ''}`}
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              onBlur={() => handleFieldBlur('nationality')}
            >
              <option value="">Select Nationality</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
            {errors.nationality && touched.nationality && (
              <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Type <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.idType ? 'border-red-500' : ''}`}
              value={formData.idType}
              onChange={(e) => handleInputChange('idType', e.target.value)}
              onBlur={() => handleFieldBlur('idType')}
            >
              <option value="">Select ID Type</option>
          {idTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
            {errors.idType && touched.idType && (
              <p className="text-red-500 text-xs mt-1">{errors.idType}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Number <span className="text-red-500">*</span>
            </label>
            <input 
              className={`input ${errors.idNumber ? 'border-red-500' : ''}`}
              value={formData.idNumber}
              onChange={(e) => handleInputChange('idNumber', e.target.value)}
              onBlur={() => handleFieldBlur('idNumber')}
            />
            {errors.idNumber && touched.idNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input 
              type="date" 
              className={`input ${errors.issueDate ? 'border-red-500' : ''}`}
              value={formData.issueDate}
              onChange={(e) => handleInputChange('issueDate', e.target.value)}
              onBlur={() => handleFieldBlur('issueDate')}
            />
            {errors.issueDate && touched.issueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input 
              type="date" 
              className={`input ${errors.expiryDate ? 'border-red-500' : ''}`}
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              onBlur={() => handleFieldBlur('expiryDate')}
            />
            {errors.expiryDate && touched.expiryDate && (
              <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              type="email" 
              className={`input ${errors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
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
                  className={`border border-gray-300 rounded-md px-3 py-2 w-full text-sm ${errors.phoneNumber ? 'border-red-500' : ''}`}
                value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    handleInputChange('phoneNumber', selectedCode + e.target.value);
                  }}
                  onBlur={() => handleFieldBlur('phoneNumber')}
            />
            </div>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input 
              className={`input ${errors.address ? 'border-red-500' : ''}`}
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              onBlur={() => handleFieldBlur('address')}
            />
            {errors.address && touched.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input 
              className={`input ${errors.city ? 'border-red-500' : ''}`}
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onBlur={() => handleFieldBlur('city')}
            />
            {errors.city && touched.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Occupation <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.occupation ? 'border-red-500' : ''}`}
              value={formData.occupation}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              onBlur={() => handleFieldBlur('occupation')}
            >
              <option value="">Select Occupation</option>
          {occupations.map((occ) => (
            <option key={occ} value={occ}>{occ}</option>
          ))}
        </select>
            {errors.occupation && touched.occupation && (
              <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source of Wealth <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.sourceOfWealth ? 'border-red-500' : ''}`}
              value={formData.sourceOfWealth}
              onChange={(e) => handleInputChange('sourceOfWealth', e.target.value)}
              onBlur={() => handleFieldBlur('sourceOfWealth')}
            >
              <option value="">Select Source of Wealth</option>
          {sourceOfWealth.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
            {errors.sourceOfWealth && touched.sourceOfWealth && (
              <p className="text-red-500 text-xs mt-1">{errors.sourceOfWealth}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PEP <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.pep ? 'border-red-500' : ''}`}
              value={formData.pep}
              onChange={(e) => handleInputChange('pep', e.target.value)}
              onBlur={() => handleFieldBlur('pep')}
            >
              <option value="">Select PEP Status</option>
          {pepOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
            {errors.pep && touched.pep && (
              <p className="text-red-500 text-xs mt-1">{errors.pep}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country of Birth <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.countryOfBirth ? 'border-red-500' : ''}`}
              value={formData.countryOfBirth}
              onChange={(e) => handleInputChange('countryOfBirth', e.target.value)}
              onBlur={() => handleFieldBlur('countryOfBirth')}
            >
              <option value="">Select Country of Birth</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
            {errors.countryOfBirth && touched.countryOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.countryOfBirth}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source of Funds <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.sourceOfFunds ? 'border-red-500' : ''}`}
              value={formData.sourceOfFunds}
              onChange={(e) => handleInputChange('sourceOfFunds', e.target.value)}
              onBlur={() => handleFieldBlur('sourceOfFunds')}
            >
              <option value="">Select Source of Funds</option>
          {sourceOfFunds.map((source) => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>
            {errors.sourceOfFunds && touched.sourceOfFunds && (
              <p className="text-red-500 text-xs mt-1">{errors.sourceOfFunds}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Residency Status <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.residencyStatus ? 'border-red-500' : ''}`}
              value={formData.residencyStatus}
              onChange={(e) => handleInputChange('residencyStatus', e.target.value)}
              onBlur={() => handleFieldBlur('residencyStatus')}
            >
              <option value="">Select Residency Status</option>
          {residencyStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
            {errors.residencyStatus && touched.residencyStatus && (
              <p className="text-red-500 text-xs mt-1">{errors.residencyStatus}</p>
            )}
          </div>
        <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="dual" 
              checked={formData.isDualNationality}
              onChange={(e) => handleInputChange('isDualNationality', e.target.checked)}
            />
          <label htmlFor="dual">Is Dual Nationality?</label>
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.channel ? 'border-red-500' : ''}`}
              value={formData.channel}
              onChange={(e) => handleInputChange('channel', e.target.value)}
              onBlur={() => handleFieldBlur('channel')}
            >
              <option value="">Select Channel</option>
          {channelOptions.map((channel) => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
            {errors.channel && touched.channel && (
              <p className="text-red-500 text-xs mt-1">{errors.channel}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Box</label>
            <input 
              className={`input ${errors.poBox ? 'border-red-500' : ''}`}
              value={formData.poBox}
              onChange={(e) => handleInputChange('poBox', e.target.value)}
              onBlur={() => handleFieldBlur('poBox')}
            />
            {errors.poBox && touched.poBox && (
              <p className="text-red-500 text-xs mt-1">{errors.poBox}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.gender ? 'border-red-500' : ''}`}
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              onBlur={() => handleFieldBlur('gender')}
            >
              <option value="">Select Gender</option>
          {genderOptions.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
            {errors.gender && touched.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
            <input 
              className={`input ${errors.employer ? 'border-red-500' : ''}`}
              value={formData.employer}
              onChange={(e) => handleInputChange('employer', e.target.value)}
              onBlur={() => handleFieldBlur('employer')}
            />
            {errors.employer && touched.employer && (
              <p className="text-red-500 text-xs mt-1">{errors.employer}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
            <select 
              className={`input ${errors.dualNationality ? 'border-red-500' : ''}`}
              value={formData.dualNationality}
              onChange={(e) => handleInputChange('dualNationality', e.target.value)}
              onBlur={() => handleFieldBlur('dualNationality')}
            >
              <option value="">Select Dual Nationality</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>{country.name}</option>
          ))}
        </select>
            {errors.dualNationality && touched.dualNationality && (
              <p className="text-red-500 text-xs mt-1">{errors.dualNationality}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Product <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.transactionProduct ? 'border-red-500' : ''}`}
              value={formData.transactionProduct}
              onChange={(e) => handleInputChange('transactionProduct', e.target.value)}
              onBlur={() => handleFieldBlur('transactionProduct')}
            >
              <option value="">Select Transaction Product</option>
          {transactionProducts.map((product) => (
            <option key={product} value={product}>{product}</option>
          ))}
        </select>
            {errors.transactionProduct && touched.transactionProduct && (
              <p className="text-red-500 text-xs mt-1">{errors.transactionProduct}</p>
            )}
          </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                <select className="input">
                  <option value="">Select Country of Residence</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <select className="input">
                  <option value="">Select Nationality</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                <select className="input">
                  <option value="">Select Place of Birth</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                <select className="input">
                  <option value="">Select Source of Funds</option>
                  {sourceOfFunds.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source of Wealth</label>
                <select className="input">
                  <option value="">Select Source of Wealth</option>
                  {sourceOfWealth.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <select className="input">
                  <option value="">Select Occupation</option>
                  {occupations.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Income Range Annually</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PEP</label>
                <select className="input">
                  <option value="">Select PEP Status</option>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
                <select className="input">
                  <option value="">Select Dual Nationality</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Incorporation</label>
                <input type="date" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country of Incorporation</label>
                <select className="input">
                  <option value="">Select Country of Incorporation</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select className="input">
                  <option value="">Select Type</option>
                  {entityClassTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                <select className="input">
                  <option value="">Select License Type</option>
                  {licenseTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                <input type="date" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input type="date" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Activity</label>
                <select className="input">
                  <option value="">Select Business Activity</option>
                  {occupations.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Countries of Operation</label>
                <select className="input">
                  <option value="">Select Countries of Operation</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                <select className="input">
                  <option value="">Select Source of Funds</option>
                  {sourceOfFunds.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registered Office Address</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Countries Source of Funds</label>
                <select className="input">
                  <option value="">Select Countries Source of Funds</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Details</label>
                <textarea className="input" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                <input className="input" />
              </div>
            </div>
          )}

          {shareholderType === "Trust" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name of Trust</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trust Registered</label>
                <select className="input">
                  <option value="">Select Trust Registered Status</option>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Trust</label>
                <select className="input">
                  <option value="">Select Type of Trust</option>
                  {trustTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction of Law</label>
                <select className="input">
                  <option value="">Select Jurisdiction of Law</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registered Address</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name of Trustee</label>
                <input className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trustee Type</label>
                <select className="input">
                  <option value="">Select Trustee Type</option>
                  {trusteeTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
              <select className="input">
                <option value="">Select Country of Residence</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <select className="input">
                <option value="">Select Nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
              <select className="input">
                <option value="">Select Place of Birth</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
              <select className="input">
                <option value="">Select Occupation</option>
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PEP</label>
              <select className="input">
                <option value="">Select PEP Status</option>
                {yesNoOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
              <select className="input">
                <option value="">Select Dual Nationality</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </select>
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
              <select className="input">
                <option value="">Select Account Type</option>
                <option value="call">Call</option>
                <option value="fixed">Fixed</option>
                <option value="current">Current</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="input">
                <option value="">Select Currency</option>
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>{currency.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Details</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT</label>
              <input className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Signatory</label>
              <select className="input">
                <option value="">Select Mode of Signatory</option>
                <option value="single">Single</option>
                <option value="dual">Dual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internet Banking</label>
              <select className="input">
                <option value="">Select Internet Banking Status</option>
                {yesNoOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Signatories</label>
              <select className="input">
                <option value="">Select Bank Signatory</option>
                <option value="signatory1">Signatory 1</option>
                <option value="signatory2">Signatory 2</option>
              </select>
            </div>
          </div>
        </ExpandableSection>

        {/* UBO */}
        <ExpandableSection
          title="Ultimate Beneficial Owner (UBO) Details"
          show={showUBO}
          toggle={() => setShowUBO(!showUBO)}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Shareholder</label>
                  <select className="input">
                    <option value="">Select Shareholder</option>
                    <option value="shareholder1">Shareholder 1</option>
                    <option value="shareholder2">Shareholder 2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alias</label>
                  <input className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                  <select className="input">
                    <option value="">Select Country of Residence</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <select className="input">
                    <option value="">Select Nationality</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                  <select className="input">
                    <option value="">Select Place of Birth</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Funds</label>
                  <select className="input">
                    <option value="">Select Source of Funds</option>
                    {sourceOfFunds.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source of Wealth</label>
                  <select className="input">
                    <option value="">Select Source of Wealth</option>
                    {sourceOfWealth.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <select className="input">
                    <option value="">Select Occupation</option>
                    {occupations.map((occ) => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Income Range Annually</label>
                  <input className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PEP</label>
                  <select className="input">
                    <option value="">Select PEP Status</option>
                    {pepOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">% Shareholding</label>
                  <input className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dual Nationality</label>
                  <select className="input">
                    <option value="">Select Dual Nationality</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
            </div>

        </ExpandableSection>
      </div>

              <div className="mt-6">
                <div className="flex gap-4">
                  {isEdit && onCancel && (
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={`${isEdit ? 'flex-1' : 'w-full'} bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isEdit ? 'Updating...' : 'Processing...'}
                      </>
                    ) : (
                      isEdit ? "Update Customer" : "Submit Application"
                    )}
                  </button>
                </div>
              </div>
      </form>
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