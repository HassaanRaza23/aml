// Mock report templates for AML platform
export const reportTemplatesMock = {
  // Customer Risk Assessment Report
  customerRiskAssessment: {
    title: "Customer Risk Assessment Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Customer Risk Assessment Report",
        generatedDate: "{{generatedDate}}",
        reportId: "{{reportId}}"
      },
      customerInfo: {
        customerId: "{{customerId}}",
        fullName: "{{fullName}}",
        nationality: "{{nationality}}",
        entityType: "{{entityType}}",
        riskScore: "{{riskScore}}",
        riskLevel: "{{riskLevel}}",
        assessmentDate: "{{assessmentDate}}"
      },
      riskFactors: [
        {
          factor: "PEP Status",
          score: "{{pepScore}}",
          details: "{{pepDetails}}"
        },
        {
          factor: "Sanctions Check",
          score: "{{sanctionsScore}}",
          details: "{{sanctionsDetails}}"
        },
        {
          factor: "Geographic Risk",
          score: "{{geoScore}}",
          details: "{{geoDetails}}"
        },
        {
          factor: "Business Activity",
          score: "{{businessScore}}",
          details: "{{businessDetails}}"
        }
      ],
      recommendations: [
        "{{recommendation1}}",
        "{{recommendation2}}",
        "{{recommendation3}}"
      ]
    }
  },

  // Transaction Monitoring Report
  transactionMonitoring: {
    title: "Transaction Monitoring Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Transaction Monitoring Report",
        period: "{{startDate}} - {{endDate}}",
        generatedDate: "{{generatedDate}}",
        reportId: "{{reportId}}"
      },
      summary: {
        totalTransactions: "{{totalTransactions}}",
        flaggedTransactions: "{{flaggedTransactions}}",
        blockedTransactions: "{{blockedTransactions}}",
        totalAmount: "{{totalAmount}}",
        averageRiskScore: "{{averageRiskScore}}"
      },
      highRiskTransactions: [
        {
          transactionId: "{{txId}}",
          customerName: "{{customerName}}",
          amount: "{{amount}}",
          riskScore: "{{riskScore}}",
          reason: "{{reason}}"
        }
      ],
      riskDistribution: {
        lowRisk: "{{lowRiskCount}}",
        mediumRisk: "{{mediumRiskCount}}",
        highRisk: "{{highRiskCount}}"
      }
    }
  },

  // Screening Results Report
  screeningResults: {
    title: "Screening Results Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Screening Results Report",
        screeningDate: "{{screeningDate}}",
        reportId: "{{reportId}}"
      },
      customerInfo: {
        customerId: "{{customerId}}",
        fullName: "{{fullName}}",
        nationality: "{{nationality}}"
      },
      screeningSummary: {
        totalSources: "{{totalSources}}",
        totalMatches: "{{totalMatches}}",
        overallRiskScore: "{{overallRiskScore}}",
        riskLevel: "{{riskLevel}}"
      },
      matchesBySource: [
        {
          source: "Dow Jones",
          matches: "{{dowJonesMatches}}",
          riskScore: "{{dowJonesScore}}"
        },
        {
          source: "OFAC Sanctions",
          matches: "{{ofacMatches}}",
          riskScore: "{{ofacScore}}"
        },
        {
          source: "Central Banks",
          matches: "{{centralBankMatches}}",
          riskScore: "{{centralBankScore}}"
        }
      ],
      detailedMatches: [
        {
          id: "{{matchId}}",
          name: "{{matchName}}",
          source: "{{matchSource}}",
          score: "{{matchScore}}",
          type: "{{matchType}}",
          country: "{{matchCountry}}"
        }
      ]
    }
  },

  // Case Management Report
  caseManagement: {
    title: "Case Management Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Case Management Report",
        period: "{{startDate}} - {{endDate}}",
        generatedDate: "{{generatedDate}}",
        reportId: "{{reportId}}"
      },
      summary: {
        totalCases: "{{totalCases}}",
        openCases: "{{openCases}}",
        resolvedCases: "{{resolvedCases}}",
        averageResolutionTime: "{{avgResolutionTime}}"
      },
      casesByStatus: [
        {
          status: "Open",
          count: "{{openCount}}",
          percentage: "{{openPercentage}}"
        },
        {
          status: "In Progress",
          count: "{{inProgressCount}}",
          percentage: "{{inProgressPercentage}}"
        },
        {
          status: "Resolved",
          count: "{{resolvedCount}}",
          percentage: "{{resolvedPercentage}}"
        }
      ],
      casesByRisk: [
        {
          riskLevel: "High",
          count: "{{highRiskCount}}",
          percentage: "{{highRiskPercentage}}"
        },
        {
          riskLevel: "Medium",
          count: "{{mediumRiskCount}}",
          percentage: "{{mediumRiskPercentage}}"
        },
        {
          riskLevel: "Low",
          count: "{{lowRiskCount}}",
          percentage: "{{lowRiskPercentage}}"
        }
      ],
      recentCases: [
        {
          caseId: "{{caseId}}",
          customerName: "{{customerName}}",
          riskLevel: "{{riskLevel}}",
          status: "{{status}}",
          createdDate: "{{createdDate}}"
        }
      ]
    }
  },

  // Compliance Dashboard Report
  complianceDashboard: {
    title: "Compliance Dashboard Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Compliance Dashboard Report",
        period: "{{startDate}} - {{endDate}}",
        generatedDate: "{{generatedDate}}",
        reportId: "{{reportId}}"
      },
      keyMetrics: {
        totalCustomers: "{{totalCustomers}}",
        totalTransactions: "{{totalTransactions}}",
        totalScreenings: "{{totalScreenings}}",
        totalCases: "{{totalCases}}",
        complianceScore: "{{complianceScore}}"
      },
      riskDistribution: {
        customers: {
          lowRisk: "{{lowRiskCustomers}}",
          mediumRisk: "{{mediumRiskCustomers}}",
          highRisk: "{{highRiskCustomers}}"
        },
        transactions: {
          normal: "{{normalTransactions}}",
          flagged: "{{flaggedTransactions}}",
          blocked: "{{blockedTransactions}}"
        }
      },
      screeningStatistics: {
        totalScreenings: "{{totalScreenings}}",
        positiveMatches: "{{positiveMatches}}",
        falsePositives: "{{falsePositives}}",
        averageResponseTime: "{{avgResponseTime}}"
      },
      caseStatistics: {
        totalCases: "{{totalCases}}",
        resolvedCases: "{{resolvedCases}}",
        pendingCases: "{{pendingCases}}",
        averageResolutionTime: "{{avgResolutionTime}}"
      }
    }
  },

  // Regulatory Report (SAR/STR)
  regulatoryReport: {
    title: "Suspicious Activity Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Suspicious Activity Report",
        reportId: "{{reportId}}",
        filingDate: "{{filingDate}}",
        reportingPeriod: "{{reportingPeriod}}"
      },
      subjectInfo: {
        name: "{{subjectName}}",
        dateOfBirth: "{{dateOfBirth}}",
        nationality: "{{nationality}}",
        identification: "{{identification}}",
        address: "{{address}}"
      },
      suspiciousActivity: {
        activityType: "{{activityType}}",
        dateRange: "{{dateRange}}",
        totalAmount: "{{totalAmount}}",
        currency: "{{currency}}",
        description: "{{description}}"
      },
      redFlags: [
        "{{redFlag1}}",
        "{{redFlag2}}",
        "{{redFlag3}}"
      ],
      supportingEvidence: [
        {
          type: "{{evidenceType}}",
          description: "{{evidenceDescription}}",
          date: "{{evidenceDate}}"
        }
      ],
      conclusion: "{{conclusion}}",
      recommendations: [
        "{{recommendation1}}",
        "{{recommendation2}}"
      ]
    }
  },

  // Audit Trail Report
  auditTrail: {
    title: "Audit Trail Report",
    template: {
      header: {
        companyName: "AML Platform",
        reportTitle: "Audit Trail Report",
        period: "{{startDate}} - {{endDate}}",
        generatedDate: "{{generatedDate}}",
        reportId: "{{reportId}}"
      },
      summary: {
        totalEvents: "{{totalEvents}}",
        uniqueUsers: "{{uniqueUsers}}",
        systemEvents: "{{systemEvents}}",
        userEvents: "{{userEvents}}"
      },
      eventsByType: [
        {
          eventType: "Login",
          count: "{{loginCount}}",
          percentage: "{{loginPercentage}}"
        },
        {
          eventType: "Customer Creation",
          count: "{{customerCreationCount}}",
          percentage: "{{customerCreationPercentage}}"
        },
        {
          eventType: "Screening",
          count: "{{screeningCount}}",
          percentage: "{{screeningPercentage}}"
        },
        {
          eventType: "Case Creation",
          count: "{{caseCreationCount}}",
          percentage: "{{caseCreationPercentage}}"
        }
      ],
      recentEvents: [
        {
          timestamp: "{{timestamp}}",
          user: "{{user}}",
          action: "{{action}}",
          details: "{{details}}",
          ipAddress: "{{ipAddress}}"
        }
      ]
    }
  }
};
