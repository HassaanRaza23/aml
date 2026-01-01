import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customerService } from "../../services";

const SanctionDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sanctionData, setSanctionData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load customer info
        const customerResult = await customerService.getCustomerById(customerId);
        if (customerResult.success) {
          setCustomer(customerResult.data);
          
          // Load sanction/match data if available
          // This will be implemented based on your screening/match data structure
          // For now, we'll check if there's any sanction-related data in the customer object
          if (customerResult.data.fullNameSanctionMatchCount !== undefined) {
            setSanctionData({
              matchCount: customerResult.data.fullNameSanctionMatchCount,
              lastScreened: customerResult.data.last_screened_at || null,
            });
          }
        } else {
          toast.error(customerResult.error || "Failed to load customer data");
        }
      } catch (e) {
        console.error("Error loading data:", e);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      loadData();
    }
  }, [customerId]);

  const getMatchLevel = (matchCount) => {
    if (matchCount >= 5) return { label: "Full name match", level: "high", color: "red" };
    if (matchCount >= 3) return { label: "Partial name match", level: "medium", color: "yellow" };
    return { label: "No name match", level: "low", color: "green" };
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-gray-500">Loading sanction details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const matchInfo = sanctionData ? getMatchLevel(sanctionData.matchCount) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/customer/list")}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Customer List
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Sanction Details</h1>
        </div>

        {/* Customer Info */}
        {customer && (
          <div className="bg-white rounded-xl shadow border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Customer</p>
                <p className="text-lg font-semibold text-gray-800">
                  {customer.full_name || customer.company_name || customer.name || "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Type: <span className="font-medium">{customer.customer_type || "N/A"}</span>
                  {customerId && (
                    <>
                      {" • "}
                      ID: <span className="font-mono">{customerId.slice(0, 8)}...</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sanction Screening Summary */}
        <div className="bg-white rounded-xl shadow border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Sanction Screening Summary</h2>
          
          {sanctionData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Match Count
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sanctionData.matchCount} / 5
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Fields matched</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Match Level
                  </p>
                  {matchInfo && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        matchInfo.color === "red"
                          ? "bg-red-100 text-red-700"
                          : matchInfo.color === "yellow"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {matchInfo.label}
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Last Screened
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {sanctionData.lastScreened
                      ? new Date(sanctionData.lastScreened).toLocaleString()
                      : "Not available"}
                  </p>
                </div>
              </div>

              {/* Screening Criteria */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Screening Criteria (5 Fields)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Full name</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">DOB/Date of incorporation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Nationality/Country of incorporation</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Country of Birth</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Country of Residence/Countries of operation</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-gray-500 font-medium mb-1">No sanction screening data available</p>
              <p className="text-sm text-gray-400">
                Screening data will appear here once the customer has been screened
              </p>
            </div>
          )}
        </div>

        {/* Placeholder for detailed match results */}
        {sanctionData && sanctionData.matchCount > 0 && (
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detailed Match Results</h2>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <p className="text-sm text-gray-500">
                Detailed match results and screening history will be displayed here.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This section will show individual matches, sources, and screening timestamps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SanctionDetails;


