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
          
          // Calculate risk score and factors
          const riskCalculation = calculateRiskScoreWithBreakdown(result);
          const triggeredRules = getTriggeredRules(result);
          
          setCalculatedScore(riskCalculation.score);
          setCalculatedRiskLevel(riskCalculation.level);
          
          // Build risk factors array from triggered rules with scores
          const factors = triggeredRules.map(rule => ({
            factor: rule.name,
            value: 'Yes', // Rule was triggered
            risk: getRiskLevel(rule.score),
            score: rule.score
          }));
          
          // Add additional risk factors based on customer data
          if (result.nationality) {
            const nationalityRisk = ["IR", "KP", "CU", "VE", "SY"].includes(result.nationality) ? 30 : 0;
            factors.push({
              factor: "Nationality",
              value: result.nationality,
              risk: nationalityRisk > 0 ? "High" : "Low",
              score: nationalityRisk
            });
          }
          
          if (result.source_of_funds) {
            const sourceRisk = ["Unknown", "Cash"].includes(result.source_of_funds) ? 20 : 0;
            factors.push({
              factor: "Source of Funds",
              value: result.source_of_funds,
              risk: sourceRisk > 0 ? "Medium" : "Low",
              score: sourceRisk
            });
          }
          
          if (result.occupation) {
            const occupationRisk = ["Politician", "Government Official", "Military", "Cash Business"].includes(result.occupation) ? 25 : 0;
            factors.push({
              factor: "Occupation",
              value: result.occupation,
              risk: occupationRisk > 0 ? "High" : "Low",
              score: occupationRisk
            });
          }
          
          if (result.source_of_wealth) {
            const wealthRisk = ["Unknown", "Cash Business"].includes(result.source_of_wealth) ? 20 : 0;
            factors.push({
              factor: "Source of Wealth",
              value: result.source_of_wealth,
              risk: wealthRisk > 0 ? "Medium" : "Low",
              score: wealthRisk
            });
          }
          
          if (result.pep_status) {
            const pepRisk = result.pep_status === "Yes" ? 40 : 0;
            factors.push({
              factor: "PEP Status",
              value: result.pep_status,
              risk: pepRisk > 0 ? "High" : "Low",
              score: pepRisk
            });
          }
          
          setRiskFactors(factors);
          
          // Load existing risk override
          try {
            const overrideResult = await riskService.getRiskProfileOverride(customerId);
            if (overrideResult) {
              setExistingOverride(overrideResult);
              setOverrideLevel(overrideResult.override_risk_level);
              setOverrideReason(overrideResult.justification);
            }
          } catch (error) {
            console.error("Error loading risk override:", error);
            // Continue without override data
          }
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
            ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim()
            : customerData.first_name || customerData.alias || 'Legal Entity'
          }
        </span>
      </p>

      {/* Risk Factors Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Risk Factors Summary</h2>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2 border">Factor</th>
              <th className="p-2 border">Value</th>
              <th className="p-2 border">Risk Level</th>
              <th className="p-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {riskFactors.map((item, index) => (
              <tr key={index}>
                <td className="p-2 border">{item.factor}</td>
                <td className="p-2 border">{item.value}</td>
                <td
                  className={`p-2 border font-medium ${
                    item.risk === "High"
                      ? "text-red-600"
                      : item.risk === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {item.risk}
                </td>
                <td className="p-2 border text-center font-medium">
                  {item.score > 0 ? item.score : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculated Score */}
      <div className="text-center my-6">
        <h2 className="text-xl font-semibold mb-2">Calculated Risk Level</h2>
        <div
          className={`text-3xl font-bold ${
            calculatedRiskLevel === "High"
              ? "text-red-600"
              : calculatedRiskLevel === "Medium"
              ? "text-yellow-500"
              : "text-green-600"
          }`}
        >
          {calculatedRiskLevel} Risk
        </div>
        <div className="text-sm text-gray-600">Score: {calculatedScore} / 100</div>
      </div>

      {/* Override Section */}
      <div className="my-6">
        <h2 className="text-xl font-semibold mb-2">Manual Override</h2>
        
        {/* Show existing override if any */}
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
          <option value="Medium">Medium</option>
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
      </div>

      {/* Save Button */}
      <div className="text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Risk Profile
        </button>
      </div>
    </div>
  );
};

export default RiskProfile;
