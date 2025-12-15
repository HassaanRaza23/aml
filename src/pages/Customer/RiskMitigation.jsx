import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { customerService } from "../../services";

// Mitigation controls and measures configuration
const MITIGATION_CONTROLS = [
  {
    key: "customer",
    label: "Customer",
    measures: [
      { key: "adverseNewsCheck", label: "Adverse News Check" },
      { key: "kycCid", label: "KYC - CID" },
      { key: "kycEdd", label: "KYC - EDD" },
      { key: "kycCdd", label: "KYC - CDD" },
      { key: "sanctionsScreeningAllParties", label: "Sanctions Screening of all parties" },
      { key: "vatCertificate", label: "VAT Certificate" },
    ],
  },
  {
    key: "product",
    label: "Product",
    measures: [
      { key: "billOfLadingAvailable", label: "Bill of Lading Available" },
      { key: "invoiceAvailableAllShipments", label: "Invoice Available for All Shipments" },
      { key: "verificationPhysicalProducts", label: "Verification of Physical Products" },
    ],
  },
  {
    key: "channel",
    label: "Channel and Other Attributes",
    measures: [
      { key: "bankTransfer", label: "Bank Transfer" },
      { key: "committeeApprovalAvailable", label: "Committee Approval Available" },
      { key: "systemAlertsAvailable", label: "System Alerts Available" },
    ],
  },
  {
    key: "jurisdiction",
    label: "Jurisdiction",
    measures: [
      { key: "eddBeneficiaryAgent", label: "EDD on Benefeciary Agent" },
      { key: "eddCounterParty", label: "EDD on Counter Party" },
      { key: "googleCheck", label: "Google Check" },
      { key: "physicalAddressVerification", label: "Physical Address Verification" },
      { key: "screeningAllThirdParties", label: "Screening of All Third Party Involved" },
    ],
  },
];

const OPTION_VALUES = {
  fully: 1,
  conditional: 2,
  partial: 3,
  non: 4,
  na: 0,
};

const OPTION_LABELS = [
  { key: "fully", label: "Fully compliant", score: 1 },
  { key: "conditional", label: "Conditional compliant", score: 2 },
  { key: "partial", label: "Partially compliant", score: 3 },
  { key: "non", label: "Non-compliant", score: 4 },
  { key: "na", label: "Not Applicable", score: 0 },
];

const mapScoreToLevel = (score) => {
  if (score >= 0 && score <= 1) return "Low";
  if (score > 1 && score <= 2) return "Medium Low";
  if (score > 2 && score <= 3) return "Medium";
  if (score > 3 && score <= 4) return "Medium High";
  if (score > 4) return "High";
  return "Low";
};

const RiskMitigation = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [mitigationAnswers, setMitigationAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const customerData = await customerService.getCustomerById(customerId);
        if (!customerData) {
          setError("Customer not found");
          return;
        }
        setCustomer(customerData);

        // Prefer stored risk assessment snapshot if available
        const assessmentResult = await customerService.getLatestRiskAssessment(customerId);

        if (assessmentResult.success && assessmentResult.data) {
          const assessment = assessmentResult.data;
          setRiskSummary({
            score: Number(assessment.risk_score ?? 0),
            level: assessment.risk_level || "Low",
            triggeredRules: assessment.triggered_rules || [],
          });
        } else {
          // Fallback: no stored assessment (older customers) → leave riskSummary null
          console.warn("No stored risk assessment found for customer:", customerId);
          setRiskSummary(null);
        }

        // Load latest mitigation snapshot (to restore previously selected options)
        const mitigationResult = await customerService.getLatestRiskMitigation(customerId);
        if (mitigationResult && mitigationResult.success && mitigationResult.data) {
          const mitigation = mitigationResult.data;
          if (mitigation.mitigation_answers) {
            setMitigationAnswers(mitigation.mitigation_answers);
          }
        }
      } catch (e) {
        console.error("Error loading risk mitigation data:", e);
        setError("Failed to load customer risk data");
      } finally {
        setLoading(false);
      }
    };

    if (customerId) {
      load();
    }
  }, [customerId]);

  const mitigationStats = useMemo(() => {
    const perControl = {};
    const activeControlScores = [];
    const totalControls = MITIGATION_CONTROLS.length || 1;

    MITIGATION_CONTROLS.forEach((control) => {
      const answersForControl = mitigationAnswers[control.key] || {};
      let sum = 0;
      let countNonNA = 0;

      control.measures.forEach((m) => {
        const optKey = answersForControl[m.key];
        const value = OPTION_VALUES[optKey] ?? 0;
        if (value > 0) {
          sum += value;
          countNonNA += 1;
        }
      });

      const rawAvg = countNonNA > 0 ? sum / countNonNA : 0;
      // Mitigation control score: (Total sum / # selected > 0) / Total # of controls
      const controlScore = rawAvg > 0 ? rawAvg / totalControls : 0;

      perControl[control.key] = {
        sum,
        countNonNA,
        rawAvg,
        controlScore,
      };

      if (controlScore > 0) {
        activeControlScores.push(controlScore);
      }
    });

    // Mitigation score: average of mitigation control scores > 0
    const riskMitigationScore =
      activeControlScores.length > 0
        ? activeControlScores.reduce((acc, v) => acc + v, 0) / activeControlScores.length
        : 0;

    const riskMitigationLevel = mapScoreToLevel(riskMitigationScore);

    return { perControl, riskMitigationScore, riskMitigationLevel };
  }, [mitigationAnswers]);

  const inherentScore = Number(riskSummary?.score ?? 0);
  const riskMitigationScore = Number(mitigationStats.riskMitigationScore ?? 0);
  const residualRiskScore = inherentScore * riskMitigationScore;
  const residualRiskLevel = mapScoreToLevel(residualRiskScore);

  const customerName =
    customer?.customer_type === "Natural Person" && customer?.natural_person_details
      ? `${customer.natural_person_details.firstname || ""} ${
          customer.natural_person_details.lastname || ""
        }`.trim() || "Unnamed Customer"
      : customer?.customer_type === "Legal Entities" && customer?.legal_entity_details
      ? customer.legal_entity_details.legalname || "Legal Entity"
      : "Customer";

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading risk mitigation data...</span>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-800">Risk Mitigation</h1>
        </div>

        {/* Customer context */}
        <div className="bg-white rounded-xl shadow border p-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Customer</p>
            <p className="text-sm text-gray-800 font-semibold">{customerName}</p>
            <p className="text-xs text-gray-500 mt-1">
              Type: <span className="font-medium">{customer.customer_type}</span>
            </p>
          </div>
        </div>

        {/* Residual risk after mitigation (summary) */}
        <div className="bg-white rounded-xl shadow border p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Residual Risk </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Inherent Risk Score
            </p>
            <p className="font-mono text-gray-800">
              {inherentScore.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Inherent Risk Level
            </p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                (riskSummary?.level === "High" || riskSummary?.level === "Medium High")
                  ? "bg-red-100 text-red-700"
                  : riskSummary?.level === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : riskSummary?.level === "Medium Low"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {riskSummary?.level || "Low"}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Risk Mitigation Score
            </p>
            <p className="font-mono text-gray-800">
              {riskMitigationScore.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Residual Risk Score
            </p>
            <p className="font-mono text-gray-800">
              {residualRiskScore.toFixed(3)}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
            Residual Risk Level
          </p>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              (residualRiskLevel === "High" || residualRiskLevel === "Medium High")
                ? "bg-red-100 text-red-700"
                : residualRiskLevel === "Medium"
                ? "bg-yellow-100 text-yellow-700"
                : residualRiskLevel === "Medium Low"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {residualRiskLevel}
          </span>
        </div>
        
      </div>

        {/* Risk profile summary */}
        {riskSummary && (
          <div className="bg-white rounded-xl shadow border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Risk Profile Summary</h2>
          <p className="text-sm text-gray-600">
            The following rules were triggered during the risk assessment. These inform the current
            residual risk before mitigation controls are applied.
          </p>

          <div className="max-h-64 overflow-y-auto border rounded-lg">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-medium w-10 text-center">#</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Rule</th>
                  <th className="px-3 py-2 font-medium text-center">Score</th>
                  <th className="px-3 py-2 font-medium text-center">Level</th>
                </tr>
              </thead>
              <tbody>
                {riskSummary.triggeredRules.map((rule, idx) => (
                  <tr key={`${rule.id || idx}-${rule.name}`} className="border-t">
                    <td className="px-3 py-2 text-center text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 text-gray-600">{rule.category}</td>
                    <td className="px-3 py-2 text-gray-800">{rule.name}</td>
                    <td className="px-3 py-2 text-center font-medium">{rule.score}</td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          (rule.score >= 4)
                            ? "bg-red-100 text-red-700"
                            : rule.score >= 3
                            ? "bg-yellow-100 text-yellow-700"
                            : rule.score >= 2
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {mapScoreToLevel(rule.score)}
                      </span>
                    </td>
                  </tr>
                ))}
                {riskSummary.triggeredRules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-3 text-center text-gray-500">
                      No rules were triggered for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <p>
              <span className="font-semibold">Triggered rules:</span>{" "}
              {riskSummary.triggeredRules.length}
            </p>
            <p>
              <span className="font-semibold">Calculation:</span>{" "}
              Inherent risk score = total score ÷ number of triggered rules.
            </p>
            <p>
              <span className="font-semibold">Inherent risk:</span>{" "}
              {inherentScore.toFixed(2)} ({riskSummary.level || "Low"})
            </p>
          </div>
          </div>
        )}

        {/* Mitigation controls summary */}
        <div className="bg-white rounded-xl shadow border p-6 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">Mitigation Controls Summary</h2>
        <p className="text-sm text-gray-600">
          Overview of each mitigation control and its individual score, contributing to the overall
          Risk Mitigation Score.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">Control</th>
                <th className="px-3 py-2 font-medium text-center">Control Score</th>
                <th className="px-3 py-2 font-medium text-center"># Selected Measures</th>
              </tr>
            </thead>
            <tbody>
              {MITIGATION_CONTROLS.map((control) => {
                const stats = mitigationStats.perControl[control.key] || {
                  sum: 0,
                  countNonNA: 0,
                  rawAvg: 0,
                  controlScore: 0,
                };
                return (
                  <tr key={control.key} className="border-t">
                    <td className="px-3 py-2 text-gray-800">{control.label}</td>
                    <td className="px-3 py-2 text-center font-mono">
                      {Number(stats.controlScore ?? 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center font-mono">
                      {stats.countNonNA}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

        {/* Mitigation controls */}
        <div className="bg-white rounded-xl shadow border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Mitigation Controls</h2>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
              Risk Mitigation Score
            </p>
            <div className="text-sm font-semibold">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (mitigationStats.riskMitigationLevel === "High" ||
                    mitigationStats.riskMitigationLevel === "Medium High")
                    ? "bg-red-100 text-red-700"
                    : mitigationStats.riskMitigationLevel === "Medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : mitigationStats.riskMitigationLevel === "Medium Low"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {mitigationStats.riskMitigationLevel} ({riskMitigationScore.toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {MITIGATION_CONTROLS.map((control) => {
            const stats = mitigationStats.perControl[control.key] || {
              sum: 0,
              countNonNA: 0,
              avg: 0,
            };
            const answersForControl = mitigationAnswers[control.key] || {};

            return (
              <div key={control.key} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {control.label}
                  </h3>
                  <div className="text-xs text-gray-500 text-right">
                    <div>
                      Control score:{" "}
                      <span className="font-mono">
                        {Number(stats.controlScore ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      Selected measures:{" "}
                      <span className="font-mono">{stats.countNonNA}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {control.measures.map((m) => {
                    const optKey = answersForControl[m.key];
                    const currentScore = OPTION_VALUES[optKey] ?? 0;
                    return (
                      <div key={m.key} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-gray-800">
                            {m.label}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Required score: <span className="font-mono font-semibold">1</span>{" "}
                            · Current:{" "}
                            <span className="font-mono font-semibold">
                              {currentScore}
                            </span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 text-[11px] text-gray-700">
                          {OPTION_LABELS.map((opt) => (
                            <label key={opt.key} className="inline-flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`${control.key}.${m.key}`}
                                className="h-3 w-3 text-blue-600 border-gray-300"
                                checked={answersForControl[m.key] === opt.key}
                                onChange={() =>
                                  setMitigationAnswers((prev) => ({
                                    ...prev,
                                    [control.key]: {
                                      ...(prev[control.key] || {}),
                                      [m.key]: opt.key,
                                    },
                                  }))
                                }
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* Save mitigation */}
        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving || !riskSummary}
            onClick={async () => {
              try {
                setSaving(true);

                const hasMitigation = riskMitigationScore > 0;
                const residualScoreToStore = hasMitigation ? residualRiskScore : inherentScore;
                const residualLevelToStore = hasMitigation
                  ? residualRiskLevel
                  : riskSummary.level || mapScoreToLevel(inherentScore);

                const mitigationPayload = {
                  answers: mitigationAnswers,
                  perControl: mitigationStats.perControl,
                  mitigationScore: riskMitigationScore,
                  residualRiskScore: residualScoreToStore,
                  residualRiskLevel: residualLevelToStore,
                };

                const result = await customerService.saveRiskMitigation(
                  customerId,
                  mitigationPayload
                );

                if (!result.success) {
                  throw new Error(result.error || "Failed to save risk mitigation");
                }

                toast.success("Risk mitigation and residual risk saved successfully.");
              } catch (e) {
                console.error("Error saving mitigation:", e);
                toast.error(e.message || "Failed to save risk mitigation");
              } finally {
                setSaving(false);
              }
            }}
            className="mt-4 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Mitigation & Update Risk"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RiskMitigation;


