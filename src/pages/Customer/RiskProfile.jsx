import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { customerService, riskService } from "../../services";
import { calculateRiskScore, getRiskLevel, getTriggeredRules, calculateRiskScoreWithBreakdown } from "../../utils/riskCalculation";
import { toast } from "react-toastify";

const RiskProfile = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [calculatedRiskLevel, setCalculatedRiskLevel] = useState("Low");
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [triggeredRules, setTriggeredRules] = useState([]);
  const [calculationBreakdown, setCalculationBreakdown] = useState(null);
  const [latestMitigation, setLatestMitigation] = useState(null);

  // Manual override state
  const [overrideLevel, setOverrideLevel] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [existingOverride, setExistingOverride] = useState(null);

  // Fetch customer data and calculate risk on component mount
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoading(true);
        const result = await customerService.getCustomerById(customerId);
        
        if (result) {
          setCustomerData(result);
          
          // Transform nested data structure to flat structure expected by calculateRiskScore
          let flattenedData = {
            customerType: result.customer_type || result.customer_type,
            customer_type: result.customer_type,
            ...result
          }
          
          // Flatten natural person details
          if (result.natural_person_details) {
            const np = result.natural_person_details
            flattenedData = {
              ...flattenedData,
              profession: np.profession,
              nationality: np.nationality,
              residencyStatus: np.residencystatus || np.residency_status,
              dualNationality: np.dualinationality || np.dual_nationality,
              // Handle isDualNationality: if undefined/null, default to false (No)
              isDualNationality: np.isdualnationality !== undefined && np.isdualnationality !== null 
                ? np.isdualnationality 
                : (np.is_dual_nationality !== undefined && np.is_dual_nationality !== null 
                  ? np.is_dual_nationality 
                  : false), // Default to false (No) if not set
              occupation: np.occupation,
              pep: np.pep || np.pep_status,
              countryOfBirth: np.countryofbirth || np.country_of_birth,
              sourceOfFunds: np.sourceoffunds || np.source_of_funds
            }
            
            // Debug: Log all natural person fields
            console.log('🔍 Natural Person Fields for Risk Calculation:', {
              profession: flattenedData.profession,
              nationality: flattenedData.nationality,
              residencyStatus: flattenedData.residencyStatus,
              dualNationality: flattenedData.dualNationality,
              isDualNationality: flattenedData.isDualNationality,
              occupation: flattenedData.occupation,
              pep: flattenedData.pep,
              countryOfBirth: flattenedData.countryOfBirth,
              sourceOfFunds: flattenedData.sourceOfFunds,
              rawData: np
            })
          }
          
          // Flatten legal entity details
          if (result.legal_entity_details) {
            const le = result.legal_entity_details
            flattenedData = {
              ...flattenedData,
              businessActivity: le.businessactivity || le.business_activity,
              countryOfIncorporation: le.countryofincorporation || le.country_of_incorporation,
              licenseType: le.licensetype || le.license_type,
              countriesSourceOfFunds: le.countriessourceoffunds || le.countries_source_of_funds,
              countriesOfOperation: le.countriesofoperation || le.countries_of_operation,
              jurisdiction: le.jurisdiction,
              sourceOfFunds: le.sourceoffunds || le.source_of_funds,
              residencyStatus: le.residencystatus || le.residency_status,
              licenseCategory: le.licensecategory || le.license_category
            }
          }
          
          // Transform shareholders to expected format
          if (result.shareholders && Array.isArray(result.shareholders)) {
            flattenedData.shareholders = result.shareholders.map(sh => {
              const shareholder = {
                shareholderType: sh.type || sh.entity_type,
                type: sh.type || sh.entity_type,
                entity_type: sh.entity_type || sh.type,
                ...sh
              }
              
              // Add natural person shareholder fields
              if (sh.type === 'Natural Person' || sh.entity_type === 'Natural Person') {
                shareholder.countryOfResidence = sh.countryOfResidence || sh.country_of_residence
                shareholder.nationality = sh.nationality
                shareholder.placeOfBirth = sh.placeOfBirth || sh.place_of_birth
                shareholder.dualNationality = sh.dualNationality || sh.dual_nationality
                shareholder.isDualNationality = sh.isDualNationality || sh.is_dual_nationality
                shareholder.occupation = sh.occupation
                shareholder.pep = sh.pep || sh.pep_status
                shareholder.sourceOfFunds = sh.sourceOfFunds || sh.source_of_funds
              }
              
              // Add legal entity shareholder fields
              if (sh.type === 'Legal Entities' || sh.entity_type === 'Legal Entities') {
                shareholder.businessActivity = sh.businessActivity || sh.business_activity
                shareholder.countryOfIncorporation = sh.countryOfIncorporation || sh.country_of_incorporation
                shareholder.licenseType = sh.licenseType || sh.license_type
                shareholder.countriesSourceOfFunds = sh.countriesSourceOfFunds || sh.countries_source_of_funds
                shareholder.countriesOfOperation = sh.countriesOfOperation || sh.countries_of_operation
                shareholder.sourceOfFunds = sh.sourceOfFunds || sh.source_of_funds
              }
              
              return shareholder
            })
          }

          // Prefer stored risk assessment snapshot; fall back to live calculation if none
          let riskCalculation;
          const assessmentResult = await customerService.getLatestRiskAssessment(customerId);
          
          if (assessmentResult && assessmentResult.success && assessmentResult.data) {
            const assessment = assessmentResult.data;
            const snapshotRules = (assessment.triggered_rules || []).map(rule => ({
              id: rule.id,
              name: rule.name,
              score: rule.score,
              category: rule.category,
              fieldName: rule.fieldName || rule.field_name || null,
            }));
            
            riskCalculation = {
              score: Number(assessment.risk_score ?? 0),
              level: assessment.risk_level || "Low",
              triggeredRules: snapshotRules,
            };
          } else {
            riskCalculation = await calculateRiskScore(flattenedData);
          }
          
          const rules = riskCalculation.triggeredRules || [];
          
          setCalculatedScore(riskCalculation.score);
          setCalculatedRiskLevel(riskCalculation.level);
          setTriggeredRules(rules);
          
          // Calculate breakdown
          const totalScore = rules.reduce((sum, rule) => sum + rule.score, 0);
          const ruleCount = rules.length;
          const averageScore = ruleCount > 0 ? totalScore / ruleCount : 0;
          
          // Group rules by category
          const rulesByCategory = {};
          rules.forEach(rule => {
            if (!rulesByCategory[rule.category]) {
              rulesByCategory[rule.category] = [];
            }
            rulesByCategory[rule.category].push(rule);
          });
          
          setCalculationBreakdown({
            totalScore,
            ruleCount,
            averageScore,
            rulesByCategory
          });

          // Load latest mitigation snapshot so we can show residual risk, if any
          const mitigationResult = await customerService.getLatestRiskMitigation(customerId);
          if (mitigationResult && mitigationResult.success && mitigationResult.data) {
            setLatestMitigation(mitigationResult.data);
          } else {
            setLatestMitigation(null);
          }
          
          // Define field mappings (same as in riskCalculation.js)
          const NATURAL_PERSON_FIELD_MAPPING = {
            fullNameSanctionMatch: 'Full Name Sanction',
            customerType: 'CUSTOMER TYPE',
            profession: 'BUSINESS ACTIVITY',
            nationality: 'Nationality',
            residencyStatus: 'RESIDENCY STATUS',
            dualNationality: 'Dual Nationality Countries',
            isDualNationality: 'Dual Nationality',
            occupation: 'BUSINESS ACTIVITY',
            pep: 'PEP',
            countryOfBirth: 'Country Of Birth',
            sourceOfFunds: 'SOURCE OF FUND',
          };
          
          const LEGAL_ENTITY_FIELD_MAPPING = {
            fullNameSanctionMatch: 'Full Name Sanction',
            customerType: 'CUSTOMER TYPE',
            businessActivity: 'BUSINESS ACTIVITY',
            countryOfIncorporation: 'Country Of Incorporation',
            licenseType: 'LICENSE TYPE',
            countriesSourceOfFunds: 'Countries Source Of Funds',
            countriesOfOperation: 'OPERATION COUNTRIES',
            jurisdiction: 'JURISDICTION',
            sourceOfFunds: 'SOURCE OF FUND',
            residencyStatus: 'RESIDENCY STATUS',
            licenseCategory: 'LICENSE CATEGORY',
          };
          
          const SHAREHOLDER_NATURAL_PERSON_FIELD_MAPPING = {
            fullNameSanctionMatch: 'Full Name Sanction',
            countryOfResidence: 'Country Of Residence',
            nationality: 'Nationality',
            placeOfBirth: 'Country Of Birth',
            dualNationality: 'Dual Nationality Countries',
            isDualNationality: 'Dual Nationality',
            occupation: 'BUSINESS ACTIVITY',
            pep: 'PEP',
            sourceOfFunds: 'SOURCE OF FUND',
          };
          
          const SHAREHOLDER_LEGAL_ENTITY_FIELD_MAPPING = {
            fullNameSanctionMatch: 'Full Name Sanction',
            businessActivity: 'BUSINESS ACTIVITY',
            countryOfIncorporation: 'Country Of Incorporation',
            licenseType: 'LICENSE TYPE',
            countriesSourceOfFunds: 'Countries Source Of Funds',
            countriesOfOperation: 'OPERATION COUNTRIES',
            sourceOfFunds: 'SOURCE OF FUND',
          };
          
          // Get the appropriate field mapping based on customer type
          const customerType = result.customer_type || result.customerType;
          const mainFieldMapping = customerType === 'Natural Person' 
            ? NATURAL_PERSON_FIELD_MAPPING 
            : LEGAL_ENTITY_FIELD_MAPPING;
          
          // Create a map of triggered rules by field name for quick lookup
          const rulesByFieldName = new Map();
          rules.forEach(rule => {
            if (rule.fieldName) {
              if (!rulesByFieldName.has(rule.fieldName)) {
                rulesByFieldName.set(rule.fieldName, []);
              }
              rulesByFieldName.get(rule.fieldName).push(rule);
            }
          });
          
          // Build risk factors array - include ALL fields that have values, even if no rule matched
          const factors = [];
          
          // Helper function to format field name
          const formatFieldName = (fieldName) => {
            return fieldName
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();
          };
          
          // Process main customer fields
          for (const [fieldName, categoryName] of Object.entries(mainFieldMapping)) {
            const fieldValue = flattenedData[fieldName];
            
            // Always check isDualNationality, other fields only if they have a value
            const shouldInclude = (fieldValue !== undefined && fieldValue !== null && fieldValue !== '' && 
              !(Array.isArray(fieldValue) && fieldValue.length === 0)) 
              || fieldName === 'isDualNationality'
              || fieldName === 'fullNameSanctionMatch';
            
            if (shouldInclude) {
              const fieldNameDisplay = formatFieldName(fieldName);
              
              // Check if this field has matching rules
              const fieldRules = rulesByFieldName.get(fieldName) || [];
              
              if (fieldRules.length > 0) {
                // Add each matching rule
                fieldRules.forEach(rule => {
                  factors.push({
                    fieldName: fieldNameDisplay,
                    ruleName: rule.name.trim(),
                    riskScore: rule.score,
                    riskLevel: getRiskLevel(rule.score),
                    category: rule.category
                  });
                });
              } else {
                // No rule matched, but still show the field
                factors.push({
                  fieldName: fieldNameDisplay,
                  ruleName: 'No match',
                  riskScore: 0,
                  riskLevel: 'N/A',
                  category: categoryName
                });
              }
            }
          }
          
          // Process shareholder fields - show each shareholder individually with numbered heading
          if (result.shareholders && Array.isArray(result.shareholders)) {
            result.shareholders.forEach((shareholder, shareholderIndex) => {
              const shareholderType = shareholder.shareholderType || shareholder.type || shareholder.entity_type;
              const shareholderFieldMapping = shareholderType === 'Natural Person'
                ? SHAREHOLDER_NATURAL_PERSON_FIELD_MAPPING
                : SHAREHOLDER_LEGAL_ENTITY_FIELD_MAPPING;
              
              // Add heading for this shareholder (numbered)
              factors.push({
                fieldName: `Shareholder ${shareholderIndex + 1}`,
                ruleName: '',
                riskScore: 0,
                riskLevel: '',
                category: '',
                isHeading: true
              });
              
              // Check shareholder type - show once per shareholder
              const shareholderTypeFieldKey = `shareholder.type.${shareholderType}.${shareholderIndex}`;
              const shareholderTypeRules = rulesByFieldName.get(shareholderTypeFieldKey) || [];
              // Also check without index for backward compatibility
              const shareholderTypeRulesAlt = rulesByFieldName.get(`shareholder.type.${shareholderType}`) || [];
              const allTypeRules = [...shareholderTypeRules, ...shareholderTypeRulesAlt];
              
              if (shareholderType) {
                if (allTypeRules.length > 0) {
                  // Only add unique rules (by rule name) to avoid duplicates
                  const uniqueRules = new Map();
                  allTypeRules.forEach(rule => {
                    if (!uniqueRules.has(rule.name)) {
                      uniqueRules.set(rule.name, rule);
                    }
                  });
                  uniqueRules.forEach(rule => {
                    factors.push({
                      fieldName: 'Shareholder Type',
                      ruleName: rule.name.trim(),
                      riskScore: rule.score,
                      riskLevel: getRiskLevel(rule.score),
                      category: rule.category,
                      isHeading: false
                    });
                  });
                } else {
                  factors.push({
                    fieldName: 'Type',
                    ruleName: 'No match',
                    riskScore: 0,
                    riskLevel: 'N/A',
                    category: 'CUSTOMER TYPE',
                    isHeading: false
                  });
                }
              }
              
              // Check other shareholder fields
              for (const [fieldName, categoryName] of Object.entries(shareholderFieldMapping)) {
                const fieldValue = shareholder[fieldName];
                
                // Always check isDualNationality, other fields only if they have a value
                const shouldInclude = (fieldValue !== undefined && fieldValue !== null && fieldValue !== '' &&
                  !(Array.isArray(fieldValue) && fieldValue.length === 0))
                  || fieldName === 'isDualNationality'
                  || fieldName === 'fullNameSanctionMatch';
                
                // Skip dualNationality if isDualNationality is not Yes
                if (fieldName === 'dualNationality') {
                  const isDualNationalityValue = shareholder.isDualNationality;
                  if (isDualNationalityValue !== true && isDualNationalityValue !== 'Yes' && isDualNationalityValue !== 'yes') {
                    continue;
                  }
                }
                
                if (shouldInclude) {
                  // Support both indexed and non-indexed keys from riskCalculation triggeredByField
                  const indexedKey = `shareholder.${shareholderIndex}.${fieldName}`;
                  const unindexedKey = `shareholder.${fieldName}`;
                  const fieldRules = [
                    ...(rulesByFieldName.get(indexedKey) || []),
                    ...(rulesByFieldName.get(unindexedKey) || [])
                  ];
                  
                  const fieldNameDisplay = formatFieldName(fieldName);
                  
                  if (fieldRules.length > 0) {
                    // Add each matching rule
                    fieldRules.forEach(rule => {
                      factors.push({
                        fieldName: fieldNameDisplay,
                        ruleName: rule.name.trim(),
                        riskScore: rule.score,
                        riskLevel: getRiskLevel(rule.score),
                        category: rule.category,
                        isHeading: false
                      });
                    });
                  } else {
                    // No rule matched, but still show the field
                    factors.push({
                      fieldName: fieldNameDisplay,
                      ruleName: 'No match',
                      riskScore: 0,
                      riskLevel: 'N/A',
                      category: categoryName,
                      isHeading: false
                    });
                  }
                }
              }
            });
          }
          
          setRiskFactors(factors);
          
          // Load existing risk override (if function exists)
          // Note: This function may not exist in riskService, so we'll skip it for now
          // try {
          //   const overrideResult = await riskService.getRiskProfileOverride(customerId);
          //   if (overrideResult) {
          //     setExistingOverride(overrideResult);
          //     setOverrideLevel(overrideResult.override_risk_level);
          //     setOverrideReason(overrideResult.justification);
          //   }
          // } catch (error) {
          //   console.error("Error loading risk override:", error);
          //   // Continue without override data
          // }
        } else {
          setError("Customer not found");
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        setError("Failed to fetch customer data");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      fetchCustomerData();
    }
  }, [customerId]);

  const handleSave = async () => {
    try {
      // Update customer risk level and score
      const customerUpdate = {
        risk_level: overrideLevel || calculatedRiskLevel,
        risk_score: calculatedScore
      };
      
      const customerResult = await customerService.updateCustomer(customerData.id, customerUpdate);
      
      if (!customerResult.success) {
        toast.error(customerResult.error || "Failed to update customer risk profile");
        return;
      }

      // Save risk override if user has set an override
      if (overrideLevel && overrideReason) {
        try {
          const overrideData = {
            original_risk_level: calculatedRiskLevel,
            override_risk_level: overrideLevel,
            justification: overrideReason
          };
          
          await riskService.updateRiskProfileOverride(customerData.id, overrideData);
        } catch (error) {
          console.error("Error saving risk override:", error);
          toast.error("Failed to save risk override: " + error.message);
          return;
        }
      }
      
      toast.success("Risk profile saved successfully!");
      navigate("/customer/list");
    } catch (error) {
      console.error("Error saving risk profile:", error);
      toast.error("Failed to save risk profile");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading customer data...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !customerData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading customer</h3>
              <div className="mt-2 text-sm text-red-700">{error || "Customer not found"}</div>
              <button
                onClick={() => navigate("/customer/list")}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"
              >
                Back to Customer List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/customer/list")}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Customer List
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-2">Risk Profile</h1>
      <p className="text-gray-600 mb-6">
        Customer: <span className="font-medium">
          {customerData.customer_type === 'Natural Person' 
            ? `${customerData.natural_person_details?.firstname || ''} ${customerData.natural_person_details?.lastname || ''}`.trim() || 'Natural Person'
            : customerData.legal_entity_details?.legalname || customerData.legal_entity_details?.alias || customerData.alias || 'Legal Entity'
          }
        </span>
      </p>

      {/* Risk Factors Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Risk Factors Summary</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border w-10 text-center">#</th>
              <th className="p-2 border">Field Name</th>
              <th className="p-2 border">Rule Name</th>
              <th className="p-2 border">Risk Score</th>
              <th className="p-2 border">Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {riskFactors.map((item, index) => {
              // If this is a heading row, render it differently
              if (item.isHeading) {
                return (
                  <tr key={index} className="bg-gray-100">
                    <td className="p-3 border text-center font-semibold text-gray-500">
                      {index + 1}
                    </td>
                    <td colSpan="4" className="p-3 border font-semibold text-gray-800">
                      {item.fieldName}
                    </td>
                  </tr>
                );
              }
              
              // Regular data row
              return (
              <tr key={index}>
                  <td className="p-2 border text-center text-gray-500">{index + 1}</td>
                  <td className="p-2 border pl-4">{item.fieldName}</td>
                  <td className={`p-2 border ${item.ruleName === 'No match' ? 'text-gray-400 italic' : ''}`}>
                    {item.ruleName}
                  </td>
                  <td className="p-2 border text-center font-medium">
                    {item.riskScore > 0 ? item.riskScore : '-'}
                  </td>
                <td
                  className={`p-2 border font-medium ${
                      item.riskLevel === "N/A"
                        ? "text-gray-400"
                        : item.riskLevel === "High" || item.riskLevel === "Medium High"
                      ? "text-red-600"
                        : item.riskLevel === "Medium"
                      ? "text-yellow-600"
                        : item.riskLevel === "Medium Low"
                        ? "text-blue-600"
                      : "text-green-600"
                  }`}
                >
                    {item.riskLevel}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calculated Score */}
      <div className="text-center my-6">
        <h2 className="text-xl font-semibold mb-2">Calculated Risk Level</h2>
        <div
          className={`text-3xl font-bold ${
            calculatedRiskLevel === "High" || calculatedRiskLevel === "Medium High"
              ? "text-red-600"
              : calculatedRiskLevel === "Medium"
              ? "text-yellow-500"
              : calculatedRiskLevel === "Medium Low"
              ? "text-blue-600"
              : "text-green-600"
          }`}
        >
          {calculatedRiskLevel} Risk
        </div>
        <div className="text-sm text-gray-600 mt-2">
          <span className="font-semibold">Risk Score:</span> {calculatedScore.toFixed(2)} / 5.00
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Based on {calculationBreakdown?.ruleCount || 0} triggered rule{calculationBreakdown?.ruleCount !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Risk Calculation Breakdown */}
      {calculationBreakdown && (
        <div className="mb-6 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Score Calculation</h2>
          
          {/* Calculation Formula */}
          <div className="mb-4 p-4 bg-white rounded-lg border">
            <h3 className="font-medium mb-2 text-gray-700">Calculation Formula</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Total Score:</strong> Sum of all triggered rule scores = {calculationBreakdown.totalScore.toFixed(2)}</p>
              <p><strong>Rule Count:</strong> Number of triggered rules = {calculationBreakdown.ruleCount}</p>
              <p className="font-semibold text-gray-800">
                <strong>Onboarding Risk Score:</strong> Total Score ÷ Rule Count = {calculationBreakdown.averageScore.toFixed(2)}
              </p>
              <p>
                <strong>Mitigation Score:</strong>{" "}
                {latestMitigation ? Number(latestMitigation.mitigation_score ?? 0).toFixed(2) : "0.00"}{" "}
              </p>
              <p className="font-semibold text-gray-800">
                <strong>Residual Risk Score:</strong>{" "}
                {latestMitigation && "Onboarding Risk * Mitigation Score = "}
                {latestMitigation
                  ? Number(latestMitigation.residual_risk_score ?? 0).toFixed(3)
                  : calculationBreakdown.averageScore.toFixed(3)}{" "}
                
              </p>
              <p>
                <strong>Residual Risk Rating:</strong>{" "}
                {latestMitigation?.residual_risk_level || calculatedRiskLevel}
              </p>
            </div>
          </div>
          
          {/* Risk Level Mapping */}
          <div className="mb-4 p-4 bg-white rounded-lg border">
            <h3 className="font-medium mb-2 text-gray-700">Risk Level Determination</h3>
            <div className="text-sm space-y-1">
              <div className={`p-2 rounded ${calculatedScore >= 0 && calculatedScore <= 1 ? 'bg-green-100' : 'bg-gray-50'}`}>
                <span className="font-medium">0 to 1 (inclusive):</span> Low Risk
                {calculatedScore >= 0 && calculatedScore <= 1 && <span className="ml-2 text-green-700 font-semibold">← Current</span>}
              </div>
              <div className={`p-2 rounded ${calculatedScore > 1 && calculatedScore <= 2 ? 'bg-blue-100' : 'bg-gray-50'}`}>
                <span className="font-medium">&gt;1 to 2 (inclusive):</span> Medium Low Risk
                {calculatedScore > 1 && calculatedScore <= 2 && <span className="ml-2 text-blue-700 font-semibold">← Current</span>}
              </div>
              <div className={`p-2 rounded ${calculatedScore > 2 && calculatedScore <= 3 ? 'bg-yellow-100' : 'bg-gray-50'}`}>
                <span className="font-medium">&gt;2 to 3 (inclusive):</span> Medium Risk
                {calculatedScore > 2 && calculatedScore <= 3 && <span className="ml-2 text-yellow-700 font-semibold">← Current</span>}
              </div>
              <div className={`p-2 rounded ${calculatedScore > 3 && calculatedScore <= 4 ? 'bg-orange-100' : 'bg-gray-50'}`}>
                <span className="font-medium">&gt;3 to 4 (inclusive):</span> Medium High Risk
                {calculatedScore > 3 && calculatedScore <= 4 && <span className="ml-2 text-orange-700 font-semibold">← Current</span>}
              </div>
              <div className={`p-2 rounded ${calculatedScore > 4 && calculatedScore <= 5 ? 'bg-red-100' : 'bg-gray-50'}`}>
                <span className="font-medium">&gt;4 to 5 (inclusive):</span> High Risk
                {calculatedScore > 4 && calculatedScore <= 5 && <span className="ml-2 text-red-700 font-semibold">← Current</span>}
              </div>
            </div>
          </div>
          
          {/* Triggered Rules by Category */}
          {Object.keys(calculationBreakdown.rulesByCategory).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-3 text-gray-700">Triggered Rules by Category</h3>
              {Object.entries(calculationBreakdown.rulesByCategory).map(([category, rules]) => (
                <div key={category} className="mb-4 p-4 bg-white rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">{category}</h4>
                  <div className="space-y-2">
                    {rules.map((rule, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{rule.name}</p>
                        </div>
                        <div className="ml-4 text-right">
                          <span className="text-sm font-semibold text-blue-600">Score: {rule.score}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-200 mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Category Total:</strong> {rules.reduce((sum, r) => sum + r.score, 0)} points from {rules.length} rule{rules.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      

      {/* Override Section */}
      {/* <div className="my-6">
        <h2 className="text-xl font-semibold mb-2">Manual Override</h2>
        
        {/* Show existing override if any 
        {existingOverride && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="font-medium text-yellow-800">Existing Override Applied</span>
            </div>
            <p className="text-sm text-yellow-700">
              <strong>Original Level:</strong> {existingOverride.original_risk_level} → 
              <strong> Override Level:</strong> {existingOverride.override_risk_level}
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              <strong>Justification:</strong> {existingOverride.justification}
            </p>
          </div>
        )}
        
        <label className="block font-medium mb-1">Override Risk Level</label>
        <select
          className="w-full p-2 border rounded mb-3"
          value={overrideLevel}
          onChange={(e) => setOverrideLevel(e.target.value)}
        >
          <option value="">-- Select --</option>
          <option value="Low">Low</option>
          <option value="Medium Low">Medium Low</option>
          <option value="Medium">Medium</option>
          <option value="Medium High">Medium High</option>
          <option value="High">High</option>
        </select>

        <label className="block font-medium mb-1">Justification</label>
        <textarea
          className="w-full p-2 border rounded"
          rows={3}
          value={overrideReason}
          onChange={(e) => setOverrideReason(e.target.value)}
          placeholder="Explain why you're overriding the system's decision"
        ></textarea>
      </div> */}

      {/* Save Button */}
      {/* <div className="text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Risk Profile
        </button>
      </div> */}
    </div>
  );
};

export default RiskProfile;
