// Mock detailed reports for screening sources
export const generateMockDetailedReport = (match, source) => {
  const baseReport = {
    id: match.id,
    name: match.name,
    score: match.score,
    source: source,
    generatedDate: new Date().toISOString(),
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
    confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
    status: 'Active'
  };

  switch (source) {
    case 'Dow Jones':
      return {
        ...baseReport,
        reportType: 'Dow Jones Risk & Compliance Report',
        riskCategory: match.score >= 70 ? 'High Risk' : match.score >= 40 ? 'Medium Risk' : 'Low Risk',
        sanctions: match.score >= 70 ? ['OFAC SDN', 'UN Sanctions'] : [],
        pepStatus: match.score >= 40 ? 'Politically Exposed Person' : 'Not PEP',
        adverseMedia: match.score >= 50 ? [
          'Negative news coverage in 2023',
          'Regulatory violations reported',
          'Legal proceedings ongoing'
        ] : [],
        businessRelationships: [
          'Former director at Global Corp',
          'Shareholder in Tech Solutions Ltd',
          'Advisor to Government Agency'
        ],
        riskFactors: [
          'High-value transactions',
          'Multiple jurisdictions',
          'Complex ownership structure'
        ],
        recommendations: [
          'Enhanced due diligence required',
          'Monitor for changes in status',
          'Regular review recommended'
        ],
        sourceDetails: {
          database: 'Dow Jones Risk & Compliance',
          coverage: 'Global sanctions, PEP, adverse media',
          updateFrequency: 'Real-time',
          dataQuality: 'Premium'
        }
      };

    case 'Free Sources':
      return {
        ...baseReport,
        reportType: 'Open Source Intelligence Report',
        sanctionsLists: match.score >= 70 ? ['OFAC SDN', 'UN 1267', 'EU Sanctions'] : [],
        watchlists: match.score >= 40 ? ['FBI Most Wanted', 'Interpol Red Notice'] : [],
        adverseMedia: match.score >= 50 ? [
          'Criminal investigation in 2022',
          'Fraud allegations reported',
          'Money laundering concerns'
        ] : [],
        legalProceedings: match.score >= 60 ? [
          'Civil lawsuit pending',
          'Regulatory investigation',
          'Criminal charges filed'
        ] : [],
        associations: [
          'Known associates with criminal records',
          'Suspicious business relationships',
          'High-risk jurisdictions'
        ],
        recommendations: [
          'Immediate investigation required',
          'Enhanced monitoring',
          'Consider case creation'
        ],
        sourceDetails: {
          database: 'Multiple open sources',
          coverage: 'Global sanctions, watchlists, media',
          updateFrequency: 'Daily',
          dataQuality: 'Standard'
        }
      };

    case 'Central Bank':
      return {
        ...baseReport,
        reportType: 'Central Bank Regulatory Report',
        regulatoryStatus: match.score >= 70 ? 'Under Investigation' : 'Compliant',
        licensing: match.score >= 40 ? 'License Suspended' : 'Active License',
        violations: match.score >= 60 ? [
          'Capital adequacy violations',
          'Anti-money laundering failures',
          'Reporting deficiencies'
        ] : [],
        regulatoryActions: match.score >= 70 ? [
          'Cease and desist order',
          'Civil monetary penalties',
          'Enhanced supervision'
        ] : [],
        complianceHistory: [
          'Previous violations in 2021',
          'Regulatory warnings issued',
          'Compliance improvement plan'
        ],
        recommendations: [
          'Regulatory consultation required',
          'Enhanced compliance monitoring',
          'Regular regulatory reporting'
        ],
        sourceDetails: {
          database: 'Central Bank Registry',
          coverage: 'Financial institution oversight',
          updateFrequency: 'Weekly',
          dataQuality: 'Official'
        }
      };

    case 'Company Whitelist':
      return {
        ...baseReport,
        reportType: 'Company Verification Report',
        verificationStatus: 'Verified',
        businessRegistration: 'Active',
        complianceRating: 'Excellent',
        positiveIndicators: [
          'Established business history',
          'Strong financial position',
          'Good compliance record',
          'Reputable industry standing'
        ],
        certifications: [
          'ISO 9001 Certified',
          'Industry Best Practices',
          'Quality Management System'
        ],
        businessMetrics: {
          yearsInBusiness: '15+ years',
          employeeCount: '500+ employees',
          annualRevenue: '$50M+',
          creditRating: 'A+'
        },
        recommendations: [
          'Standard due diligence',
          'Routine monitoring',
          'Continue normal operations'
        ],
        sourceDetails: {
          database: 'Company Whitelist',
          coverage: 'Verified businesses',
          updateFrequency: 'Monthly',
          dataQuality: 'Verified'
        }
      };

    case 'Company Blacklist':
      return {
        ...baseReport,
        reportType: 'Company Risk Assessment Report',
        riskCategory: 'High Risk',
        blacklistReason: match.score >= 90 ? 'Fraudulent Activity' : 'Compliance Violations',
        violations: [
          'Securities fraud',
          'Money laundering',
          'False financial statements',
          'Regulatory non-compliance'
        ],
        enforcementActions: [
          'Cease and desist orders',
          'Civil penalties',
          'Criminal investigations',
          'Asset freezes'
        ],
        associatedRisks: [
          'Shell company operations',
          'Suspicious transactions',
          'High-risk jurisdictions',
          'Complex ownership structure'
        ],
        recommendations: [
          'Immediate termination of relationship',
          'Enhanced due diligence',
          'Regulatory reporting required',
          'Monitor for additional risks'
        ],
        sourceDetails: {
          database: 'Company Blacklist',
          coverage: 'High-risk entities',
          updateFrequency: 'Real-time',
          dataQuality: 'Verified'
        }
      };

    case 'UAE Lists':
      return {
        ...baseReport,
        reportType: 'UAE Regulatory Report',
        uaeStatus: match.score >= 70 ? 'Under Investigation' : 'Compliant',
        regulatoryCategory: match.score >= 40 ? 'Enhanced Monitoring' : 'Standard',
        uaeViolations: match.score >= 60 ? [
          'Anti-money laundering violations',
          'Reporting failures',
          'Suspicious activity'
        ] : [],
        localActions: match.score >= 70 ? [
          'Central Bank warnings',
          'Regulatory fines',
          'Enhanced supervision'
        ] : [],
        businessRelationships: [
          'Local business partnerships',
          'Government contracts',
          'Financial institution relationships'
        ],
        recommendations: [
          'UAE regulatory consultation',
          'Enhanced local monitoring',
          'Regular compliance reporting'
        ],
        sourceDetails: {
          database: 'UAE Regulatory Lists',
          coverage: 'UAE-specific oversight',
          updateFrequency: 'Weekly',
          dataQuality: 'Official'
        }
      };

    default:
      return {
        ...baseReport,
        reportType: 'General Screening Report',
        riskCategory: 'Unknown',
        recommendations: ['Additional verification required'],
        sourceDetails: {
          database: 'Unknown',
          coverage: 'Limited',
          updateFrequency: 'Unknown',
          dataQuality: 'Unknown'
        }
      };
  }
};

// Generate mock report content for display
export const formatDetailedReport = (report) => {
  return {
    header: {
      title: report.reportType,
      id: report.id,
      name: report.name,
      score: report.score,
      riskCategory: report.riskCategory,
      generatedDate: new Date(report.generatedDate).toLocaleDateString(),
      lastUpdated: new Date(report.lastUpdated).toLocaleDateString(),
      confidence: `${report.confidence}%`,
      status: report.status
    },
    sections: {
      sanctions: report.sanctions || [],
      watchlists: report.watchlists || [],
      adverseMedia: report.adverseMedia || [],
      violations: report.violations || [],
      legalProceedings: report.legalProceedings || [],
      associations: report.associations || [],
      businessRelationships: report.businessRelationships || [],
      riskFactors: report.riskFactors || [],
      positiveIndicators: report.positiveIndicators || [],
      certifications: report.certifications || [],
      enforcementActions: report.enforcementActions || [],
      associatedRisks: report.associatedRisks || [],
      uaeViolations: report.uaeViolations || [],
      localActions: report.localActions || [],
      businessMetrics: report.businessMetrics || {},
      complianceHistory: report.complianceHistory || []
    },
    recommendations: report.recommendations || [],
    sourceDetails: report.sourceDetails
  };
};
