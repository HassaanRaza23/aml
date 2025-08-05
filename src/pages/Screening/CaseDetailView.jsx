import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const mockCaseDetails = {
  "case-002": {
    id: "case-002",
    entity: "Acme Corp",
    riskProfile: "High Risk",
    screeningType: "Ongoing",
    screeningDate: "2025-08-03 15:20",
    status: "Under Review",
    matches: [
      { type: "Sanction List", detail: "Matched with UN Sanctions" },
      { type: "Adverse Media", detail: "Negative news article" },
    ],
    analystNotes: "Requires enhanced due diligence.",
  },
  "case-005": {
    id: "case-005",
    entity: "Global Traders Ltd",
    riskProfile: "Medium Risk",
    screeningType: "Ongoing",
    screeningDate: "2025-08-01 09:10",
    status: "Active",
    matches: [{ type: "PEP List", detail: "Politically exposed person" }],
    analystNotes: "",
  },
};

const CaseDetailView = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();

const caseData = mockCaseDetails[caseId];

// Initialize notes state safely even if caseData is undefined
const [notes, setNotes] = useState(caseData?.analystNotes || "");

if (!caseData) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Case not found</h2>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
}


  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Case Details - {caseData.entity}</h2>

      <div className="mb-4">
        <strong>Risk Profile:</strong> {caseData.riskProfile}
      </div>
      <div className="mb-4">
        <strong>Screening Type:</strong> {caseData.screeningType}
      </div>
      <div className="mb-4">
        <strong>Screening Date:</strong> {caseData.screeningDate}
      </div>
      <div className="mb-4">
        <strong>Status:</strong> {caseData.status}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Matches Found:</h3>
        {caseData.matches.length === 0 ? (
          <p>No matches found.</p>
        ) : (
          <ul className="list-disc list-inside">
            {caseData.matches.map((match, idx) => (
              <li key={idx}>
                <strong>{match.type}:</strong> {match.detail}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Analyst Notes:</h3>
        <textarea
          rows={5}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring focus:ring-blue-300"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add or update notes here..."
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => alert("Notes saved! (Implement actual save logic)")}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Save Notes
        </button>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Back to List
        </button>
      </div>
    </div>
  );
};

export default CaseDetailView;
