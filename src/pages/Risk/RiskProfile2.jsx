// src/pages/Risk/RiskProfile.jsx
import React from "react";
import { useParams } from "react-router-dom";

const mockProfiles = {
  1: {
    name: "Mohammad Zain",
    riskScore: 82,
    riskLevel: "High",
    scoring: {
      kyc: 25,
      screening: 30,
      transaction: 20,
      behavior: 7,
    },
    lastAssessed: "2025-07-29",
    comments: "Multiple high-value transactions to sanctioned countries.",
  },
  2: {
    name: "Fatima Bano",
    riskScore: 45,
    riskLevel: "Medium",
    scoring: {
      kyc: 15,
      screening: 10,
      transaction: 15,
      behavior: 5,
    },
    lastAssessed: "2025-07-26",
    comments: "Some inconsistencies in address verification.",
  },
  3: {
    name: "Ali Khan",
    riskScore: 20,
    riskLevel: "Low",
    scoring: {
      kyc: 5,
      screening: 5,
      transaction: 5,
      behavior: 5,
    },
    lastAssessed: "2025-07-15",
    comments: "Clean background and limited transaction activity.",
  },
};

const getBadgeColor = (level) => {
  switch (level) {
    case "High":
      return "bg-red-100 text-red-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-green-100 text-green-800";
    default:
      return "";
  }
};

const RiskProfile = () => {
  const { id } = useParams();
  const profile = mockProfiles[id];

  if (!profile) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Risk Profile</h1>
        <p className="text-red-500">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Risk Profile</h1>
      <p className="text-gray-600 mb-6">{profile.name}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="font-semibold text-gray-700">Risk Score:</label>
          <p>{profile.riskScore}</p>
        </div>
        <div>
          <label className="font-semibold text-gray-700">Risk Level:</label>
          <p className={`inline-block px-2 py-1 text-sm rounded ${getBadgeColor(profile.riskLevel)}`}>
            {profile.riskLevel}
          </p>
        </div>
        <div>
          <label className="font-semibold text-gray-700">Last Assessed:</label>
          <p>{profile.lastAssessed}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Scoring Breakdown</h2>
      <ul className="mb-6 list-disc pl-5 text-gray-700">
        <li>KYC Risk: {profile.scoring.kyc}</li>
        <li>Screening Risk: {profile.scoring.screening}</li>
        <li>Transaction Risk: {profile.scoring.transaction}</li>
        <li>Behavioral Risk: {profile.scoring.behavior}</li>
      </ul>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Analyst Comments</h2>
        <p className="text-gray-800">{profile.comments}</p>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        Update Risk Profile
      </button>
    </div>
  );
};

export default RiskProfile;
