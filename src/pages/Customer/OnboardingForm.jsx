import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customerService } from "../../services";
import { countries } from "../../data/countries";
import { transactionProducts } from "../../data/dropdownOptions";
import NaturalPersonForm from "./forms/NaturalPersonForm";
import LegalEntityForm from "./forms/LegalEntityForm";
import ShareholdersSection from "./sections/ShareholdersSection";
import DirectorsSection from "./sections/DirectorsSection";
import BankDetailsSection from "./sections/BankDetailsSection";
import UBOSection from "./sections/UBOSection";

const OnboardingForm = ({ 
  isEdit = false, 
  initialData = null, 
  onSubmit = null, 
  onCancel = null 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Parse phone number for edit mode
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
    
    console.log('📞 Parsed phone:', { fullPhone, countryCode: foundCode, number });
    return { countryCode: foundCode, phone: number };
  };
  
  // Form state
  const [formData, setFormData] = useState(() => {
    if (isEdit && initialData) {
      const { countryCode, phone } = parsePhoneNumber(initialData.phone);
      
      return {
        coreSystemId: initialData.core_system_id || "",
        customerType: initialData.customer_type || "Natural Person",
        email: initialData.email || "",
        countryCode: countryCode,
        phone: phone,
        city: initialData.city || "",
        channel: initialData.channel || "",
        transactionProduct: initialData.transaction_product || "",
        sourceOfFunds: initialData.sourceoffunds || "",
        residencyStatus: initialData.residencystatus || "",
        transactionAmountLimit: initialData.transaction_amount_limit || "",
        transactionLimit: initialData.transaction_limit || "",
        // Natural Person fields - map from exact database field names
        profession: initialData.profession || "",
        firstName: initialData.firstname || "",
        lastName: initialData.lastname || "",
        alias: initialData.alias || "",
        dateOfBirth: initialData.dateofbirth || "",
        nationality: initialData.nationality || "",
        idType: initialData.idtype || "",
        idNumber: initialData.idnumber || "",
        issueDate: initialData.issuedate || "",
        expiryDate: initialData.expirydate || "",
        address: initialData.address || "",
        occupation: initialData.occupation || "",
        sourceOfWealth: initialData.sourceofwealth || "",
        pep: initialData.pep || "",
        countryOfBirth: initialData.countryofbirth || "",
        isDualNationality: initialData.isdualnationality || false,
        poBox: initialData.pobox || "",
        gender: initialData.gender || "",
        employer: initialData.employer || "",
        dualNationality: initialData.dualnationality || "",
        dualPassportNumber: initialData.dualpassportnumber || "",
        dualPassportIssueDate: initialData.dualpassportissuedate || "",
        dualPassportExpiryDate: initialData.dualpassportexpirydate || "",
        sourceOfFunds: initialData.sourceoffunds || "",
        residencyStatus: initialData.residencystatus || "",
        // Legal Entity fields - map from exact database field names
        businessActivity: initialData.businessactivity || "",
        legalName: initialData.legalname || "",
        dateOfIncorporation: initialData.dateofincorporation || "",
        countryOfIncorporation: initialData.countryofincorporation || "",
        licenseType: initialData.licensetype || "",
        licenseNumber: initialData.licensenumber || "",
        licenseIssueDate: initialData.licenseissuedate || "",
        licenseExpiryDate: initialData.licenseexpirydate || "",
        registeredOfficeAddress: initialData.registeredofficeaddress || "",
        countriesSourceOfFunds: initialData.countriessourceoffunds || "",
        managementCompany: initialData.managementcompany || "",
        countriesOfOperation: initialData.countriesofoperation || "",
        jurisdiction: initialData.jurisdiction || "",
        trn: initialData.trn || "",
        licensingAuthority: initialData.licensingauthority || "",
        licenseCategory: initialData.licensecategory || "",
        addressExpiryDate: initialData.addressexpirydate || "",
        sourceOfFunds: initialData.sourceoffunds || "",
        residencyStatus: initialData.residencystatus || ""
      };
    }
    
    return {
      coreSystemId: "",
      customerType: "Natural Person",
      email: "",
      countryCode: "+971",
      phone: "",
      city: "",
      channel: "",
      transactionProduct: "",
      sourceOfFunds: "",
      residencyStatus: "",
      transactionAmountLimit: "",
      transactionLimit: "",
      // Natural Person fields
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
      address: "",
      occupation: "",
      sourceOfWealth: "",
      pep: "",
      countryOfBirth: "",
      isDualNationality: false,
      poBox: "",
      gender: "",
      employer: "",
      dualNationality: "",
      dualPassportNumber: "",
      dualPassportIssueDate: "",
      dualPassportExpiryDate: "",
      sourceOfFunds: "",
      residencyStatus: "",
      // Legal Entity fields
      businessActivity: "",
      legalName: "",
      dateOfIncorporation: "",
      countryOfIncorporation: "",
      licenseType: "",
      licenseNumber: "",
      licenseIssueDate: "",
      licenseExpiryDate: "",
      registeredOfficeAddress: "",
      countriesSourceOfFunds: "",
      managementCompany: "",
      countriesOfOperation: "",
      jurisdiction: "",
      trn: "",
      licensingAuthority: "",
      licenseCategory: "",
      addressExpiryDate: "",
      sourceOfFunds: "",
      residencyStatus: ""
    };
  });

  // Section data state
  const [shareholders, setShareholders] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [ubos, setUbos] = useState([]);
  
  // Ref for DirectorsSection to call fill function
  const directorsSectionRef = useRef();
  
  // Ref for UBOSection to call fill function
  const uboSectionRef = useRef();

  // Initialize section data when editing
  useEffect(() => {
    if (isEdit && initialData) {
      // Initialize expandable sections with existing data
      if (initialData.shareholders) {
        console.log('👥 Initializing shareholders:', initialData.shareholders);
        setShareholders(initialData.shareholders);
      }
      if (initialData.directors) {
        console.log('👔 Initializing directors:', initialData.directors);
        setDirectors(initialData.directors);
      }
      if (initialData.bankDetails) {
        console.log('🏦 Initializing bank details:', initialData.bankDetails);
        setBankDetails(initialData.bankDetails);
      }
      
      if (initialData.ubos) {
        console.log('👤 Initializing UBOs:', initialData.ubos);
        setUbos(initialData.ubos);
      }
    }
  }, [isEdit, initialData]);

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age >= 18 ? null : "Person must be at least 18 years old";
  };

  const validateFutureDate = (date) => {
    if (!date) return true;
    const inputDate = new Date(date);
    const today = new Date();
    return inputDate > today;
  };



  const validateField = (field, value) => {
    let error = null;

    switch (field) {
      case "dateOfBirth":
        error = validateAge(value);
        break;
      
      case "issueDate":
      case "licenseIssueDate":
        if (value && validateFutureDate(value)) {
          error = "Issue date cannot be in the future";
        }
        break;
      
      case "expiryDate":
      case "licenseExpiryDate":
      case "addressExpiryDate":
        if (value && !validateFutureDate(value)) {
          error = "Expiry date must be in the future";
        }
        break;
      
      case "dualPassportIssueDate":
      case "dualPassportExpiryDate":
        if (value && !validateFutureDate(value)) {
          error = "Passport date must be in the future";
        }
        break;
      
      case "transactionAmountLimit":
      case "transactionLimit":
        // Optional fields: only validate if a value is provided
        if (value) {
          if (isNaN(value) || parseFloat(value) <= 0) {
            error = "Must be a positive number";
          }
        }
        break;
      
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Email is invalid";
        }
        break;
      
      case "phone":
        if (!value) {
          error = "Phone number is required";
        } else if (value.replace(/[^0-9]/g, '').length < 7) {
          error = "Phone number must be at least 7 digits";
        } else if (value.replace(/[^0-9]/g, '').length > 15) {
          error = "Phone number cannot exceed 15 digits";
        }
        break;
      
      case "city":
        if (!value) {
          error = "City is required";
        }
        break;
      
      case "channel":
        if (!value) {
          error = "Channel is required";
        }
        break;
      
      case "transactionProduct":
        if (!value) {
          error = "Transaction product is required";
        }
        break;
      
      case "coreSystemId":
        if (!value) {
          error = "Core System ID is required";
        }
        break;
      
      // Natural Person specific validations
      case "firstName":
        if (!value) {
          error = "First name is required";
        }
        break;
      
      case "lastName":
        if (!value) {
          error = "Last name is required";
        }
        break;
      
      case "nationality":
        if (!value) {
          error = "Nationality is required";
        }
        break;
      
      case "idType":
        if (!value) {
          error = "ID type is required";
        }
        break;
      
      case "idNumber":
        if (!value) {
          error = "ID number is required";
        }
        break;
      
      case "address":
        if (!value) {
          error = "Address is required";
        }
        break;
      
      case "occupation":
        if (!value) {
          error = "Occupation is required";
        }
        break;
      
      case "sourceOfWealth":
        if (!value) {
          error = "Source of wealth is required";
        }
        break;
      
      case "pep":
        if (!value) {
          error = "PEP status is required";
        }
        break;
      
      case "countryOfBirth":
        if (!value) {
          error = "Country of birth is required";
        }
        break;
      
      case "sourceOfFunds":
        if (!value) {
          error = "Source of funds is required";
        }
        break;
      
      case "gender":
        if (!value) {
          error = "Gender is required";
        }
        break;
      
      case "residencyStatus":
        if (!value) {
          error = "Residency status is required";
        }
        break;
      
      // Legal Entity specific validations
      case "businessActivity":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          error = "Business activity is required";
        }
        break;
      
      case "legalName":
        if (!value) {
          error = "Legal name is required";
        }
        break;
      
      case "dateOfIncorporation":
        if (!value) {
          error = "Date of incorporation is required";
        }
        break;
      
      case "countryOfIncorporation":
        if (!value) {
          error = "Country of incorporation is required";
        }
        break;
      
      case "licenseType":
        if (!value) {
          error = "License type is required";
        }
        break;
      
      case "licenseNumber":
        if (!value) {
          error = "License number is required";
        }
        break;
      
      case "countriesSourceOfFunds":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          error = "Countries source of funds is required";
        }
        break;
      
      case "countriesOfOperation":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          error = "Countries of operation is required";
        }
        break;
      
      case "jurisdiction":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          error = "Jurisdiction is required";
        }
        break;
      
      case "licenseCategory":
        if (!value || (Array.isArray(value) && value.length === 0)) {
          error = "License category is required";
        }
        break;
    }

    return error;
  };

  const handleFieldBlur = (field) => {
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Common required fields for both types
    const commonRequiredFields = ["email", "phone", "city", "channel", "transactionProduct", "transactionAmountLimit", "transactionLimit"];
    
    // Type-specific required fields
    if (formData.customerType === "Natural Person") {
      const naturalPersonRequiredFields = [
        "firstName", "lastName", "dateOfBirth", "nationality", "idType", "idNumber",
        "address", "occupation", "sourceOfWealth", "pep", "countryOfBirth", "sourceOfFunds", "gender", "residencyStatus"
      ];
      
      [...commonRequiredFields, ...naturalPersonRequiredFields].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      });
    } else if (formData.customerType === "Legal Entities") {
      const legalEntityRequiredFields = [
        "businessActivity", "legalName", "dateOfIncorporation", "countryOfIncorporation",
        "licenseType", "licenseNumber", "countriesSourceOfFunds", "countriesOfOperation",
        "jurisdiction", "sourceOfFunds", "residencyStatus", "licenseCategory"
      ];
      
      [...commonRequiredFields, ...legalEntityRequiredFields].forEach(field => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      });
    }

    // Debug: Log validation errors
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors found:', newErrors);
      console.log('Total validation errors:', Object.keys(newErrors).length);
      console.log('Failed fields:', Object.keys(newErrors));
      console.log('Form data:', formData);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        [field]: null
      }));
    }
  };

  // Section data handlers
  const handleShareholdersChange = (newShareholders) => {
    setShareholders(newShareholders);
  };

  const handleDirectorsChange = (newDirectors) => {
    setDirectors(newDirectors);
  };

  const handleBankDetailsChange = (newBankDetails) => {
    setBankDetails(newBankDetails);
  };

  const handleUbosChange = (newUbos) => {
    setUbos(newUbos);
  };

  const handleDirectorFormFill = (directorData) => {
    // Fill the director form with shareholder data
    console.log('👔 Filling director form with shareholder data:', directorData);
    
    // Call the director form fill function
    if (directorsSectionRef.current) {
      directorsSectionRef.current.fillForm(directorData);
    }
    
    // Show success message to user using toast
    if (directorData.firstName && directorData.lastName) {
      const directorName = `${directorData.firstName} ${directorData.lastName}`.trim();
      if (directorName) {
        toast.success(`Director form filled with data from "${directorName}"! Complete remaining fields and click "Add Director".`);
      }
    }
  };

  const handleUboFormFill = (uboData) => {
    // Fill the UBO form with shareholder data
    console.log('👤 Filling UBO form with shareholder data:', uboData);
    
    // Call the UBO form fill function
    if (uboSectionRef.current) {
      uboSectionRef.current.fillForm(uboData);
    }
    
    // Show success message to user using toast
    if (uboData.fullName) {
      toast.success(`UBO form filled with data from "${uboData.fullName}"! Complete remaining fields and click "Add UBO".`);
    }
  };

  // Check if core system ID already exists
  const checkCoreSystemIdExists = async (coreSystemId) => {
    try {
      const result = await customerService.checkCoreSystemIdExists(coreSystemId);
      return result.exists;
    } catch (error) {
      console.error('Error checking core system ID:', error);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      console.log('Form validation failed. Current errors:', errors);
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    
    // Check if core system ID already exists (only for new customers)
    if (!isEdit && formData.coreSystemId) {
      const exists = await checkCoreSystemIdExists(formData.coreSystemId);
      if (exists) {
        toast.error("Core System ID already exists. Please use a unique ID.");
        return;
      }
    }
    
    setIsSubmitting(true);

    try {
      // Prepare core customer data for the main customers table
      const customerData = {
        core_system_id: formData.coreSystemId,
        customer_type: formData.customerType,
        email: formData.email,
        phone: formData.countryCode + formData.phone, // Combine country code + phone number
        channel: formData.channel,
        transaction_product: formData.transactionProduct,
        transaction_amount_limit: formData.transactionAmountLimit,
        transaction_limit: formData.transactionLimit,
        risk_score: 0, // Will be calculated after all data is saved
        risk_level: "Low", // Will be calculated after all data is saved
        kyc_status: "Pending", // Will be determined based on risk level
        due_diligence_level: "Simplified Customer Due Diligence", // Will be calculated based on risk level
        status: "Active"
      };

      // Prepare type-specific detail data
      let detailData = null;
      
      console.log('🔍 Form data for detail preparation:', formData);
      
      if (formData.customerType === "Natural Person") {
        detailData = {
          profession: formData.profession,
          firstname: formData.firstName,
          lastname: formData.lastName,
          alias: formData.alias,
          dateofbirth: formData.dateOfBirth || null,
          nationality: formData.nationality,
          residencystatus: formData.residencyStatus,
          idtype: formData.idType,
          idnumber: formData.idNumber,
          issuedate: formData.issueDate || null,
          expirydate: formData.expiryDate || null,
          isdualnationality: formData.isDualNationality,
          dualnationality: formData.isDualNationality ? formData.dualNationality : null,
          dualpassportnumber: formData.isDualNationality ? formData.dualPassportNumber : null,
          dualpassportissuedate: formData.isDualNationality ? formData.dualPassportIssueDate : null,
          dualpassportexpirydate: formData.isDualNationality ? formData.dualPassportExpiryDate : null,
          countryofbirth: formData.countryOfBirth,
          address: formData.address,
          city: formData.city,
          occupation: formData.occupation,
          sourceofwealth: formData.sourceOfWealth,
          pep: formData.pep,
          sourceoffunds: formData.sourceOfFunds,
          pobox: formData.poBox,
          gender: formData.gender,
          employer: formData.employer
        };
        console.log('👤 Natural Person detail data prepared:', detailData);
      } else if (formData.customerType === "Legal Entities") {
        console.log('🔍 Legal Entity form data:', {
          businessActivity: formData.businessActivity,
          legalName: formData.legalName,
          alias: formData.alias,
          dateOfIncorporation: formData.dateOfIncorporation,
          countryOfIncorporation: formData.countryOfIncorporation,
          licenseType: formData.licenseType,
          licenseNumber: formData.licenseNumber,
          licenseIssueDate: formData.licenseIssueDate,
          licenseExpiryDate: formData.licenseExpiryDate,
          registeredOfficeAddress: formData.registeredOfficeAddress,
          city: formData.city,
          countriesSourceOfFunds: formData.countriesSourceOfFunds,
          managementCompany: formData.managementCompany,
          countriesOfOperation: formData.countriesOfOperation,
          jurisdiction: formData.jurisdiction,
          sourceOfFunds: formData.sourceOfFunds,
          residencyStatus: formData.residencyStatus,
          licensingAuthority: formData.licensingAuthority,
          trn: formData.trn,
          licenseCategory: formData.licenseCategory,
          addressExpiryDate: formData.addressExpiryDate
        });
        
        detailData = {
          businessactivity: Array.isArray(formData.businessActivity) ? JSON.stringify(formData.businessActivity) : formData.businessActivity,
          legalname: formData.legalName,
          alias: formData.alias,
          dateofincorporation: formData.dateOfIncorporation || null,
          countryofincorporation: formData.countryOfIncorporation,
          licensetype: formData.licenseType,
          licensenumber: formData.licenseNumber,
          licenseissuedate: formData.licenseIssueDate || null,
          licenseexpirydate: formData.licenseExpiryDate || null,
          registeredofficeaddress: formData.registeredOfficeAddress,
          city: formData.city,
          countriessourceoffunds: Array.isArray(formData.countriesSourceOfFunds) ? JSON.stringify(formData.countriesSourceOfFunds) : formData.countriesSourceOfFunds,
          managementcompany: formData.managementCompany,
          countriesofoperation: Array.isArray(formData.countriesOfOperation) ? JSON.stringify(formData.countriesOfOperation) : formData.countriesOfOperation,
          jurisdiction: formData.jurisdiction,
          sourceoffunds: formData.sourceOfFunds,
          residencystatus: formData.residencyStatus,
          licensingauthority: formData.licensingAuthority,
          trn: formData.trn,
          licensecategory: formData.licenseCategory,
          addressexpirydate: formData.addressExpiryDate || null
        };
        console.log('🏢 Legal Entity detail data prepared:', detailData);
        console.log('🏢 Detail data keys:', Object.keys(detailData));
        console.log('🏢 Detail data values:', Object.values(detailData));
      }

      if (isEdit && onSubmit) {
        // Update existing customer with all data
        const updateData = {
          ...customerData,
          ...detailData,
          shareholders,
          directors,
          bankDetails,
          ubos
        };
        
        console.log('🔄 Edit mode - sending update data:', updateData);
        
        const result = await onSubmit(updateData);
        if (result && result.success) {
          toast.success("Customer updated successfully!");
          navigate("/customer/list");
        } else {
          toast.error(result?.error || "Failed to update customer");
        }
      } else {
        // Create new customer
        const result = await customerService.createCustomer(customerData);
        
        if (result.success) {
          const customerId = result.data.id;
          
                      try {
            // Save all data in parallel (detail data + section data)
            // All operations are independent and can run concurrently
            const savePromises = []
            
            // Add detail data save to parallel operations
            if (detailData) {
              if (formData.customerType === "Natural Person") {
                savePromises.push(
                  customerService.saveNaturalPersonDetails(customerId, detailData)
                    .then(result => {
                      if (!result.success) {
                        throw new Error(`Failed to save Natural Person details: ${result.error}`)
                      }
                      return result
                    })
                )
              } else if (formData.customerType === "Legal Entities") {
                savePromises.push(
                  customerService.saveLegalEntityDetails(customerId, detailData)
                    .then(result => {
                      if (!result.success) {
                        throw new Error(`Failed to save Legal Entity details: ${result.error}`)
                      }
                      return result
                    })
                )
              }
            }
            
            // Add section data saves to parallel operations
            if (shareholders.length > 0) {
              savePromises.push(customerService.saveShareholders(customerId, shareholders))
            }
            
            if (directors.length > 0) {
              savePromises.push(customerService.saveDirectors(customerId, directors))
            }
            
            if (bankDetails.length > 0) {
              savePromises.push(customerService.saveBankDetails(customerId, bankDetails))
            }
            
            if (ubos.length > 0) {
              savePromises.push(customerService.saveUbos(customerId, ubos))
            }
            
            // Execute all saves in parallel
            if (savePromises.length > 0) {
              await Promise.all(savePromises)
            }
            
            // Calculate risk score and update customer with all data available
            const completeCustomerData = {
              ...customerData,
              ...detailData,
              shareholders,
              directors,
              bankDetails,
              ubos
            };
            
            const riskResult = await customerService.calculateAndUpdateRiskScore(customerId, completeCustomerData);
            if (riskResult.success) {
              console.log('Risk score calculated and updated:', riskResult.data);
            }
            
            toast.success("Customer onboarded successfully!");
            navigate("/customer/list");
          } catch (error) {
            console.error("Error saving detail or section data:", error);
            toast.error("Customer created but failed to save some details");
            navigate("/customer/list");
          }
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

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      {!isEdit && <h2 className="text-2xl font-semibold mb-6">Customer Onboarding Form</h2>}

      <form onSubmit={handleSubmit}>
        {/* Common Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Core System ID <span className="text-red-500">*</span>
            </label>
            <input 
              className={`input ${errors.coreSystemId && touched.coreSystemId ? 'border-red-500' : ''} ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.coreSystemId}
              onChange={(e) => !isEdit && handleInputChange('coreSystemId', e.target.value)}
              onBlur={() => !isEdit && handleFieldBlur('coreSystemId')}
              disabled={isEdit}
            />
            {errors.coreSystemId && touched.coreSystemId && (
              <p className="text-red-500 text-sm mt-1">{errors.coreSystemId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.customerType}
              onChange={(e) => !isEdit && handleInputChange('customerType', e.target.value)}
              disabled={isEdit}
            >
              <option value="Natural Person">Natural Person</option>
              <option value="Legal Entities">Legal Entities</option>
        </select>
          </div>
        </div>



        {/* Conditional Fields based on Customer Type */}
        {formData.customerType === "Natural Person" ? (
          <NaturalPersonForm 
            formData={formData}
            onInputChange={handleInputChange}
            onFieldBlur={handleFieldBlur}
            errors={errors}
            touched={touched}
          />
        ) : (
          <LegalEntityForm 
            formData={formData}
            onInputChange={handleInputChange}
            onFieldBlur={handleFieldBlur}
            errors={errors}
            touched={touched}
          />
        )}

        {/* Common Fields for All Customer Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              type="email"
              className={`input ${errors.email && touched.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
            <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-32"
                value={formData.countryCode || '+971'}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, countryCode: e.target.value }));
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
                value={formData.phone || ''}
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
                placeholder="Enter phone number"
                maxLength={15}
            />
            </div>
            {errors.phone && touched.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City <span className="text-red-500">*</span>
            </label>
            <input 
              className={`input ${errors.city && touched.city ? 'border-red-500' : ''}`}
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onBlur={() => handleFieldBlur('city')}
            />
            {errors.city && touched.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
        </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.channel && touched.channel ? 'border-red-500' : ''}`}
              value={formData.channel}
              onChange={(e) => handleInputChange('channel', e.target.value)}
              onBlur={() => handleFieldBlur('channel')}
            >
              <option value="">Select Channel</option>
              <option value="Face to Face">Face to Face</option>
              <option value="Non Face to Face">Non Face to Face</option>
        </select>
            {errors.channel && touched.channel && (
              <p className="text-red-500 text-sm mt-1">{errors.channel}</p>
            )}
        </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Product <span className="text-red-500">*</span>
            </label>
            <select 
              className={`input ${errors.transactionProduct && touched.transactionProduct ? 'border-red-500' : ''}`}
              value={formData.transactionProduct}
              onChange={(e) => handleInputChange('transactionProduct', e.target.value)}
              onBlur={() => handleFieldBlur('transactionProduct')}
            >
              <option value="">Select Transaction Product</option>
          {transactionProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
          ))}
        </select>
            {errors.transactionProduct && touched.transactionProduct && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionProduct}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Amount Limit
            </label>
            <input 
              type="number"
              step="0.01"
              min="0"
              className={`input ${errors.transactionAmountLimit && touched.transactionAmountLimit ? 'border-red-500' : ''}`}
              value={formData.transactionAmountLimit}
              onChange={(e) => handleInputChange('transactionAmountLimit', e.target.value)}
              onBlur={() => handleFieldBlur('transactionAmountLimit')}
              placeholder="Enter amount limit per transaction"
            />
            {errors.transactionAmountLimit && touched.transactionAmountLimit && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionAmountLimit}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Limit
            </label>
            <input 
              type="number"
              step="0.01"
              min="0"
              className={`input ${errors.transactionLimit && touched.transactionLimit ? 'border-red-500' : ''}`}
              value={formData.transactionLimit}
              onChange={(e) => handleInputChange('transactionLimit', e.target.value)}
              onBlur={() => handleFieldBlur('transactionLimit')}
              placeholder="Enter total amount limit per year"
            />
            {errors.transactionLimit && touched.transactionLimit && (
              <p className="text-red-500 text-sm mt-1">{errors.transactionLimit}</p>
            )}
          </div>
      </div>

      {/* Expandable Sections */}
      <div className="mt-6 space-y-4">
          {/* Shareholders Section - Only show for Legal Entities */}
          {formData.customerType === "Legal Entities" && (
            <ShareholdersSection 
              shareholders={shareholders}
              onShareholdersChange={handleShareholdersChange}
              isEdit={isEdit}
              onDirectorCreate={handleDirectorFormFill}
              onUboCreate={handleUboFormFill}
            />
          )}
          
          {/* Directors Section - Only show for Legal Entities */}
          {formData.customerType === "Legal Entities" && (
            <DirectorsSection 
              ref={directorsSectionRef}
              directors={directors}
              onDirectorsChange={handleDirectorsChange}
              isEdit={isEdit}
            />
          )}
          
          {/* Bank Details Section - Always show regardless of customer type */}
          <BankDetailsSection 
            bankDetails={bankDetails}
            onBankDetailsChange={handleBankDetailsChange}
            isEdit={isEdit}
          />
          
          {/* UBO Section - Only show for Legal Entities */}
          {formData.customerType === "Legal Entities" && (
            <UBOSection 
              ref={uboSectionRef}
              ubos={ubos}
              onUbosChange={handleUbosChange}
              isEdit={isEdit}
            />
          )}
      </div>

        {/* Submit Button */}
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
                  Processing...
                </>
              ) : (
                isEdit ? "Update Customer" : "Create Customer"
              )}
        </button>
      </div>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;