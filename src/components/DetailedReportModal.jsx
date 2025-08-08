import React from 'react';
import { generateMockDetailedReport, formatDetailedReport } from '../utils/mockDetailedReports';

const DetailedReportModal = ({ isOpen, onClose, match, source }) => {
  if (!isOpen || !match) return null;

  // Generate mock detailed report
  const detailedReport = generateMockDetailedReport(match, source);
  const formattedReport = formatDetailedReport(detailedReport);

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Under Investigation': return 'text-red-600 bg-red-100';
      case 'Enhanced Monitoring': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{formattedReport.header.title}</h2>
              <p className="text-blue-100 mt-2">Report ID: {formattedReport.header.id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700">Name</h3>
              <p className="text-lg">{formattedReport.header.name}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700">Risk Score</h3>
              <p className={`text-lg font-bold ${getRiskColor(formattedReport.header.score)}`}>
                {formattedReport.header.score}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700">Risk Category</h3>
              <p className={`text-lg ${getRiskColor(formattedReport.header.score)}`}>
                {formattedReport.header.riskCategory}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold text-gray-700">Confidence</h3>
              <p className="text-lg">{formattedReport.header.confidence}</p>
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-6">
            {/* Sanctions & Watchlists */}
            {(formattedReport.sections.sanctions.length > 0 || formattedReport.sections.watchlists.length > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Sanctions & Watchlists</h3>
                <div className="space-y-2">
                  {formattedReport.sections.sanctions.map((sanction, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-red-700">{sanction}</span>
                    </div>
                  ))}
                  {formattedReport.sections.watchlists.map((watchlist, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span className="text-orange-700">{watchlist}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adverse Media */}
            {formattedReport.sections.adverseMedia.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Adverse Media</h3>
                <div className="space-y-2">
                  {formattedReport.sections.adverseMedia.map((media, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="text-yellow-700">{media}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Violations & Legal Proceedings */}
            {(formattedReport.sections.violations.length > 0 || formattedReport.sections.legalProceedings.length > 0) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-3">Violations & Legal Proceedings</h3>
                <div className="space-y-2">
                  {formattedReport.sections.violations.map((violation, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-red-700">{violation}</span>
                    </div>
                  ))}
                  {formattedReport.sections.legalProceedings.map((proceeding, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-red-700">{proceeding}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Relationships */}
            {formattedReport.sections.businessRelationships.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Business Relationships</h3>
                <div className="space-y-2">
                  {formattedReport.sections.businessRelationships.map((relationship, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="text-blue-700">{relationship}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Positive Indicators (for whitelist) */}
            {formattedReport.sections.positiveIndicators.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Positive Indicators</h3>
                <div className="space-y-2">
                  {formattedReport.sections.positiveIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="text-green-700">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Business Metrics (for whitelist) */}
            {Object.keys(formattedReport.sections.businessMetrics).length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Business Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(formattedReport.sections.businessMetrics).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="ml-2 text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">Recommendations</h3>
              <div className="space-y-2">
                {formattedReport.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2 mt-2"></span>
                    <span className="text-purple-700">{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Source Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Database:</span>
                  <span className="ml-2 text-gray-600">{formattedReport.sourceDetails.database}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Coverage:</span>
                  <span className="ml-2 text-gray-600">{formattedReport.sourceDetails.coverage}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Update Frequency:</span>
                  <span className="ml-2 text-gray-600">{formattedReport.sourceDetails.updateFrequency}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data Quality:</span>
                  <span className="ml-2 text-gray-600">{formattedReport.sourceDetails.dataQuality}</span>
                </div>
              </div>
            </div>

            {/* Report Metadata */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Report Metadata</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Generated:</span>
                  <span className="ml-2 text-gray-600">{formattedReport.header.generatedDate}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <span className="ml-2 text-gray-600">{formattedReport.header.lastUpdated}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 ${getStatusColor(formattedReport.header.status)}`}>
                    {formattedReport.header.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-4 rounded-b-lg">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              This is a mock report simulating real API data. In production, this would contain actual data from {source}.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedReportModal;
