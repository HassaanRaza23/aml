import React, { useState } from "react";
import { generatePrintResultPDF } from "../../utils/generatePrintResult";

const InstantScreening = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    entityType: "Individual",
    gender: "",
    dob: "",
    nationality: "",
    screeningList: "All",
    matchType: "Precise",
    remarks: "",
  });

  const [results, setResults] = useState({
    dowjones: [],
    freeSource: [],
    centralBank: [],
    companyWhitelist: [],
    companyBlacklist: [],
    uaeList: []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScreening = async () => {
    setLoading(true);

    // TODO: Replace this with actual API call
    setTimeout(() => {
      setResults({
        dowjones: [
            {
            id: "001",
            recordType: "Individual",
            name: "John Smith",
            score: 92,
            searchType: "Near",
            primaryName: "John A. Smith",
            searchList: "PEP",
            dob: "1980-06-20",
            country: "UK",
            gender: "Male",
            isSubsidiary: false,
            title: "Minister",
            },
            {
            id: "002",
            recordType: "Entity",
            name: "Global FinCorp",
            score: 88,
            searchType: "Exact",
            primaryName: "Global FinCorp Ltd.",
            searchList: "Sanctions",
            dob: "N/A",
            country: "USA",
            gender: "N/A",
            isSubsidiary: true,
            title: "Subsidiary",
            },
            {
            id: "003",
            recordType: "Individual",
            name: "Ahmad Khan",
            score: 80,
            searchType: "Broad",
            primaryName: "A. Khan",
            searchList: "PEP",
            dob: "1971-11-10",
            country: "Pakistan",
            gender: "Male",
            isSubsidiary: false,
            title: "Senator",
            },
            {
            id: "004",
            recordType: "Entity",
            name: "Eastern Energy Ltd.",
            score: 77,
            searchType: "Near",
            primaryName: "Eastern Energy",
            searchList: "Watchlists",
            dob: "N/A",
            country: "Russia",
            gender: "N/A",
            isSubsidiary: false,
            title: "Energy Firm",
            },
            {
            id: "005",
            recordType: "Individual",
            name: "Maria Lopez",
            score: 90,
            searchType: "Exact",
            primaryName: "Maria L. Lopez",
            searchList: "PEP",
            dob: "1983-03-22",
            country: "Mexico",
            gender: "Female",
            isSubsidiary: false,
            title: "Governor",
            },
        ],
        freeSource: [
            {
            id: "006",
            recordType: "Individual",
            name: "Jane Doe",
            score: 85,
            searchType: "Broad",
            primaryName: "J. Doe",
            searchList: "Watchlists",
            dob: "1975-02-15",
            country: "USA",
            gender: "Female",
            isSubsidiary: false,
            title: "Advisor",
            },
            {
            id: "007",
            recordType: "Entity",
            name: "Trans Global Ltd",
            score: 70,
            searchType: "Near",
            primaryName: "TransGlobal",
            searchList: "Sanctions",
            dob: "N/A",
            country: "Germany",
            gender: "N/A",
            isSubsidiary: false,
            title: "Logistics",
            },
            {
            id: "008",
            recordType: "Individual",
            name: "Ali Reza",
            score: 76,
            searchType: "Exact",
            primaryName: "Ali M. Reza",
            searchList: "PEP",
            dob: "1965-07-30",
            country: "Iran",
            gender: "Male",
            isSubsidiary: false,
            title: "Ambassador",
            },
            {
            id: "009",
            recordType: "Individual",
            name: "Samuel Green",
            score: 68,
            searchType: "Broad",
            primaryName: "S. Green",
            searchList: "Watchlists",
            dob: "1990-01-12",
            country: "USA",
            gender: "Male",
            isSubsidiary: false,
            title: "Consultant",
            },
            {
            id: "010",
            recordType: "Entity",
            name: "Nova Pharma",
            score: 82,
            searchType: "Exact",
            primaryName: "Nova Pharmaceuticals",
            searchList: "Sanctions",
            dob: "N/A",
            country: "India",
            gender: "N/A",
            isSubsidiary: true,
            title: "Pharmaceuticals",
            },
        ],
        centralBank: [
            {
            id: "011",
            recordType: "Individual",
            name: "John Smith",
            score: 92,
            searchType: "Near",
            primaryName: "John A. Smith",
            searchList: "PEP",
            dob: "1980-06-20",
            country: "UK",
            gender: "Male",
            isSubsidiary: false,
            title: "Minister",
            },
            {
            id: "012",
            recordType: "Entity",
            name: "SafeBank Inc.",
            score: 87,
            searchType: "Exact",
            primaryName: "SafeBank International",
            searchList: "Sanctions",
            dob: "N/A",
            country: "Canada",
            gender: "N/A",
            isSubsidiary: false,
            title: "Financial",
            },
            {
            id: "013",
            recordType: "Individual",
            name: "Linda Chan",
            score: 78,
            searchType: "Broad",
            primaryName: "L. Chan",
            searchList: "Watchlists",
            dob: "1988-12-01",
            country: "Singapore",
            gender: "Female",
            isSubsidiary: false,
            title: "Regulator",
            },
            {
            id: "014",
            recordType: "Entity",
            name: "EuroCorp",
            score: 74,
            searchType: "Near",
            primaryName: "EuroCorp Holdings",
            searchList: "Sanctions",
            dob: "N/A",
            country: "France",
            gender: "N/A",
            isSubsidiary: true,
            title: "Investment Firm",
            },
            {
            id: "015",
            recordType: "Individual",
            name: "Mohammed Salah",
            score: 81,
            searchType: "Exact",
            primaryName: "M. Salah",
            searchList: "PEP",
            dob: "1972-04-14",
            country: "Egypt",
            gender: "Male",
            isSubsidiary: false,
            title: "Central Banker",
            },
        ],
        companyWhitelist: [
            {
            id: "016",
            recordType: "Entity",
            name: "TechWhiz Ltd.",
            score: 65,
            searchType: "Exact",
            primaryName: "TechWhiz",
            searchList: "Whitelist",
            dob: "N/A",
            country: "USA",
            gender: "N/A",
            isSubsidiary: false,
            title: "IT Company",
            },
            {
            id: "017",
            recordType: "Entity",
            name: "Halal Foods Inc.",
            score: 69,
            searchType: "Near",
            primaryName: "Halal Foods",
            searchList: "Whitelist",
            dob: "N/A",
            country: "Pakistan",
            gender: "N/A",
            isSubsidiary: false,
            title: "FMCG",
            },
            {
            id: "018",
            recordType: "Entity",
            name: "Smart Finance",
            score: 73,
            searchType: "Broad",
            primaryName: "Smart Finance Group",
            searchList: "Whitelist",
            dob: "N/A",
            country: "UK",
            gender: "N/A",
            isSubsidiary: true,
            title: "Fintech",
            },
            {
            id: "019",
            recordType: "Entity",
            name: "Green Energy LLC",
            score: 78,
            searchType: "Exact",
            primaryName: "Green Energy",
            searchList: "Whitelist",
            dob: "N/A",
            country: "Germany",
            gender: "N/A",
            isSubsidiary: false,
            title: "Energy",
            },
            {
            id: "020",
            recordType: "Entity",
            name: "Vision Media",
            score: 64,
            searchType: "Near",
            primaryName: "Vision Media Group",
            searchList: "Whitelist",
            dob: "N/A",
            country: "UAE",
            gender: "N/A",
            isSubsidiary: false,
            title: "Media",
            },
        ],
        companyBlacklist: [
            {
            id: "021",
            recordType: "Entity",
            name: "FakeBank Ltd.",
            score: 95,
            searchType: "Exact",
            primaryName: "FakeBank",
            searchList: "Blacklist",
            dob: "N/A",
            country: "Russia",
            gender: "N/A",
            isSubsidiary: false,
            title: "Fraudulent Bank",
            },
            {
            id: "022",
            recordType: "Entity",
            name: "GhostCorp",
            score: 91,
            searchType: "Broad",
            primaryName: "Ghost Corporation",
            searchList: "Blacklist",
            dob: "N/A",
            country: "North Korea",
            gender: "N/A",
            isSubsidiary: true,
            title: "Shell Company",
            },
            {
            id: "023",
            recordType: "Entity",
            name: "PyramidFX",
            score: 89,
            searchType: "Near",
            primaryName: "Pyramid FX Ltd.",
            searchList: "Blacklist",
            dob: "N/A",
            country: "India",
            gender: "N/A",
            isSubsidiary: false,
            title: "Ponzi Scheme",
            },
            {
            id: "024",
            recordType: "Entity",
            name: "ScamSoft",
            score: 93,
            searchType: "Exact",
            primaryName: "ScamSoft Tech",
            searchList: "Blacklist",
            dob: "N/A",
            country: "USA",
            gender: "N/A",
            isSubsidiary: false,
            title: "Malware Vendor",
            },
            {
            id: "025",
            recordType: "Entity",
            name: "Shady Holdings",
            score: 88,
            searchType: "Near",
            primaryName: "Shady Co.",
            searchList: "Blacklist",
            dob: "N/A",
            country: "UK",
            gender: "N/A",
            isSubsidiary: true,
            title: "Unregistered Entity",
            },
        ],
        uaeList: [
            {
            id: "026",
            recordType: "Individual",
            name: "Faisal Al Nahyan",
            score: 94,
            searchType: "Exact",
            primaryName: "Faisal A. Nahyan",
            searchList: "UAE List",
            dob: "1970-10-05",
            country: "UAE",
            gender: "Male",
            isSubsidiary: false,
            title: "Minister",
            },
            {
            id: "027",
            recordType: "Entity",
            name: "Desert Traders",
            score: 85,
            searchType: "Near",
            primaryName: "Desert Trading Co.",
            searchList: "UAE List",
            dob: "N/A",
            country: "UAE",
            gender: "N/A",
            isSubsidiary: false,
            title: "Trading Company",
            },
            {
            id: "028",
            recordType: "Individual",
            name: "Sara Al Qasimi",
            score: 81,
            searchType: "Broad",
            primaryName: "Sara Qasimi",
            searchList: "UAE List",
            dob: "1986-06-25",
            country: "UAE",
            gender: "Female",
            isSubsidiary: false,
            title: "Businesswoman",
            },
            {
            id: "029",
            recordType: "Entity",
            name: "Oasis FinCorp",
            score: 78,
            searchType: "Exact",
            primaryName: "Oasis Financial",
            searchList: "UAE List",
            dob: "N/A",
            country: "UAE",
            gender: "N/A",
            isSubsidiary: true,
            title: "Finance",
            },
            {
            id: "030",
            recordType: "Entity",
            name: "Emirates Logistics",
            score: 83,
            searchType: "Near",
            primaryName: "Emirates Logistic Group",
            searchList: "UAE List",
            dob: "N/A",
            country: "UAE",
            gender: "N/A",
            isSubsidiary: false,
            title: "Logistics",
            },
        ],
    });

      setLoading(false);
    }, 1000);
  };

  const renderResultsSection = (title, list) => (
    list.length > 0 && (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{title} ({list.length} match{list.length > 1 ? 'es' : ''})</h3>
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
              {list.map((r) => (
                <tr key={r.id} className="border">
                  <td className="p-2 border">{r.id}</td>
                  <td className="p-2 border">{r.name}</td>
                  <td className="p-2 border">{r.score}</td>
                  <td className="p-2 border">{r.searchType}</td>
                  <td className="p-2 border">{r.searchList}</td>
                  <td className="p-2 border">{r.dob || "-"}</td>
                  <td className="p-2 border">{r.country}</td>
                  <td className="p-2 border">{r.title}</td>
                  <td className="p-2 border flex gap-2">
                    <button className="btn-mini">View</button>
                    <button className="btn-mini">View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  return (
    <div className="p-6 bg-white shadow rounded-md">
      <h2 className="text-xl font-semibold mb-4">Instant Screening</h2>

      {/* --- Input Form --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Entity Type</label>
          <select
            name="entityType"
            value={formData.entityType}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
          >
            <option value="Individual">Individual</option>
            <option value="Organization">Organization</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nationality</label>
          <input
            name="nationality"
            type="text"
            value={formData.nationality}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Screening List</label>
          <select
            name="screeningList"
            value={formData.screeningList}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
          >
            <option>All</option>
            <option>Sanctions</option>
            <option>PEP</option>
            <option>Watchlists</option>
            <option>Adverse Media</option>
          </select>
        </div>
      </div>

      {/* Match Type + Remarks */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <div className="flex gap-4">
          {["Precise", "Near", "Broad"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="matchType"
                value={type}
                checked={formData.matchType === type}
                onChange={handleChange}
              />
              {type}
            </label>
          ))}
        </div>

        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Remarks</label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="input w-full border p-2 rounded"
            rows="2"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button onClick={handleScreening} className="btn-primary">Start Screening</button>
        <button className="btn-secondary">Create Case</button>
        <button
          onClick={() => generatePrintResultPDF(results)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Print Result
        </button>
        <button className="btn-secondary">Print PDF</button>
        <button className="btn-secondary">Advanced Screening Report</button>
      </div>

      {/* Results Sections */}
      {loading && <p>Loading results...</p>}
      {!loading && (
        <>
          {renderResultsSection("DowJones", results.dowjones)}
          {renderResultsSection("Free Source", results.freeSource)}
          {renderResultsSection("Central Bank", results.centralBank)}
          {renderResultsSection("Company Whitelist Source", results.companyWhitelist)}
          {renderResultsSection("Company Blacklist Source", results.companyBlacklist)}
          {renderResultsSection("UAE List Source", results.uaeList)}
        </>
      )}
    </div>
  );
};

export default InstantScreening;
