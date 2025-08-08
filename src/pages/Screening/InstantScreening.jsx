import React, { useState } from "react";
import { generatePrintResultPDF } from "../../utils/generatePrintResult";
import { generateAdvancedScreeningReport } from "../../utils/generateAdvancedScreeningReport";
import { generateDetailedReportPDF } from "../../utils/generateDetailedReportPDF";
import { countries } from "../../data/countries";
import { customerTypes } from "../../data/dropdownOptions";
import { screeningService } from "../../services";
import { toast } from "react-toastify";

const InstantScreening = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    entityType: "All",
    gender: "",
    dob: "",
    nationality: "",
    screeningList: "All",
    matchType: "Precise",
    remarks: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [results, setResults] = useState({
    dowjones: [],
    freeSource: [],
    centralBank: [],
    companyWhitelist: [],
    companyBlacklist: [],
    uaeList: []
  });
  const [loading, setLoading] = useState(false);
  


  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        // Make name optional for testing
        if (value && value.trim().length > 100) {
          return 'Full name must be less than 100 characters';
        }
        if (value && !/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
          return 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods';
        }
        return '';

      case 'entityType':
        // Optional field
        return '';

      case 'gender':
        // Optional field
        return '';

      case 'dob':
        if (value) {
          const today = new Date();
          const dob = new Date(value);
          if (dob > today) {
            return 'Date of birth cannot be in the future';
          }
          const age = today.getFullYear() - dob.getFullYear();
          if (age > 120) {
            return 'Date of birth seems invalid (age over 120)';
          }
        }
        return '';

      case 'nationality':
        // Optional field
        return '';

      case 'screeningList':
        // Optional field
        return '';

      case 'matchType':
        // Optional field
        return '';

      case 'remarks':
        if (value && value.trim().length > 500) {
          return 'Remarks must be less than 500 characters';
        }
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleScreening = async () => {
    // Validate form before proceeding
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(formData).forEach(field => {
        allTouched[field] = true;
      });
      setTouched(allTouched);
      return;
    }

    setLoading(true);

    try {
      // Prepare search criteria with defaults for empty fields
      const searchCriteria = {
        fullName: formData.fullName || 'Test Customer',
        entityType: formData.entityType === 'All' ? 'Individual' : (formData.entityType || 'Individual'),
        gender: formData.gender || '',
        dob: formData.dob || '',
        nationality: formData.nationality || '',
        screeningList: formData.screeningList || 'All',
        matchType: formData.matchType || 'Broad',
        remarks: formData.remarks || ''
      };

      // Perform screening using the service
      const screeningResult = await screeningService.performInstantScreening(
        null, // No customer ID for instant screening
        searchCriteria
      );

      if (screeningResult && screeningResult.results) {
        setResults(screeningResult.results);
        toast.success(`Screening completed! Found ${screeningResult.totalMatches || 0} matches.`);
      } else {
        toast.error('Screening failed. Please try again.');
      }
    } catch (error) {
      console.error('Screening error:', error);
      toast.error('Screening failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedReport = () => {
    try {
      const allMatches = [
        ...(results.dowjones || []),
        ...(results.freeSource || []),
        ...(results.centralBank || []),
        ...(results.companyWhitelist || []),
        ...(results.companyBlacklist || []),
        ...(results.uaeList || [])
      ];

      if (allMatches.length === 0) {
        toast.warning("No screening results available for advanced report.");
        return;
      }

      // Generate the advanced screening report PDF
      generateAdvancedScreeningReport(formData, results);
      toast.success("Advanced screening report generated successfully!");
    } catch (error) {
      console.error("Advanced report error:", error);
      toast.error("Failed to generate advanced report: " + error.message);
    }
  };

  const handleViewReport = (match, source) => {
    try {
      generateDetailedReportPDF(match, source);
      toast.success(`${source} report opened in new window`);
    } catch (error) {
      console.error("Error generating detailed report:", error);
      toast.error("Failed to generate detailed report: " + error.message);
    }
  };

  const renderResultsSection = (title, list) => {
    // Add null checks and default to empty array
    const safeList = list || [];
    
    return safeList.length > 0 ? (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title} ({safeList.length} match{safeList.length > 1 ? 'es' : ''})</h3>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Score</th>
                <th className="p-2 border">Search Type</th>
                <th className="p-2 border">List</th>
                <th className="p-2 border">DOB</th>
                <th className="p-2 border">Country</th>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeList.map((r) => (
                <tr key={r.id} className="border">
                  <td className="p-2 border">{r.id}</td>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.score}</td>
                  <td className="p-2 border">{r.searchType}</td>
                  <td className="p-2 border">{r.searchList}</td>
                  <td className="p-2 border">{r.dob || "-"}</td>
                  <td className="p-2 border">{r.country}</td>
                  <td className="p-2 border">{r.title}</td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewReport(r, title)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 shadow-sm"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => handleViewReport(r, title)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 shadow-sm"
                      >
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : null;
  };

  return (
    <div className="p-6 bg-white shadow rounded-md">
      <h2 className="text-xl font-semibold mb-4">Instant Screening</h2>

      {/* --- Input Form --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.fullName && errors.fullName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter full name"
          />
          {touched.fullName && errors.fullName && (
            <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Entity Type
          </label>
          <select
            name="entityType"
            value={formData.entityType}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.entityType && errors.entityType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="All">All</option>
            {customerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {touched.entityType && errors.entityType && (
            <p className="text-red-500 text-xs mt-1">{errors.entityType}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.gender && errors.gender ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {touched.gender && errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Birth
          </label>
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.dob && errors.dob ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {touched.dob && errors.dob && (
            <p className="text-red-500 text-xs mt-1">{errors.dob}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nationality
          </label>
          <select 
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.nationality && errors.nationality ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>{country.name}</option>
            ))}
          </select>
          {touched.nationality && errors.nationality && (
            <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Screening List
          </label>
          <select
            name="screeningList"
            value={formData.screeningList}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.screeningList && errors.screeningList ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="All">All</option>
            <option value="Sanctions">Sanctions</option>
            <option value="PEP">PEP</option>
            <option value="Watchlists">Watchlists</option>
            <option value="Adverse Media">Adverse Media</option>
          </select>
          {touched.screeningList && errors.screeningList && (
            <p className="text-red-500 text-xs mt-1">{errors.screeningList}</p>
          )}
        </div>
      </div>

      {/* Match Type + Remarks */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Match Type
          </label>
          <div className="flex gap-4">
            {["Precise", "Near", "Broad"].map((type) => (
              <label key={type} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="matchType"
                  value={type}
                  checked={formData.matchType === type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {type}
              </label>
            ))}
          </div>
          {touched.matchType && errors.matchType && (
            <p className="text-red-500 text-xs mt-1">{errors.matchType}</p>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full border p-2 rounded ${
              touched.remarks && errors.remarks ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="2"
            placeholder="Optional remarks about the screening request"
          />
          {touched.remarks && errors.remarks && (
            <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>
          )}
          {formData.remarks && (
            <p className="text-gray-500 text-xs mt-1">
              {formData.remarks.length}/500 characters
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={handleScreening} className="btn-primary">Start Screening</button>
        <button className="btn-secondary">Create Case</button>
        <button
          onClick={() => generatePrintResultPDF(results)}
          className={`px-4 py-2 rounded ${
            results && Object.values(results).some(arr => arr && arr.length > 0)
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
          disabled={loading || !results || !Object.values(results).some(arr => arr && arr.length > 0)}
        >
          Print Result
        </button>
        <button className="btn-secondary">Print PDF</button>
        <button 
          onClick={handleAdvancedReport} 
          className={`px-4 py-2 rounded ${
            results && Object.values(results).some(arr => arr && arr.length > 0)
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }`}
          disabled={loading || !results || !Object.values(results).some(arr => arr && arr.length > 0)}
        >
          Advanced Screening Report
        </button>
      </div>

      {/* Results Sections */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Performing screening...</span>
        </div>
      )}
      {!loading && (
        <>
          {renderResultsSection("DowJones", results.dowjones)}
          {renderResultsSection("Free Source", results.freeSource)}
          {renderResultsSection("Central Bank", results.centralBank)}
          {renderResultsSection("Company Whitelist Source", results.companyWhitelist)}
          {renderResultsSection("Company Blacklist Source", results.companyBlacklist)}
          {renderResultsSection("UAE List Source", results.uaeList)}
          
          {/* Show message if no results found */}
          {!loading && 
           (!results.dowjones || results.dowjones.length === 0) &&
           (!results.freeSource || results.freeSource.length === 0) &&
           (!results.centralBank || results.centralBank.length === 0) &&
           (!results.companyWhitelist || results.companyWhitelist.length === 0) &&
           (!results.companyBlacklist || results.companyBlacklist.length === 0) &&
           (!results.uaeList || results.uaeList.length === 0) && (
            <div className="text-center py-8">
              <p className="text-gray-500">No screening results found.</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InstantScreening;
