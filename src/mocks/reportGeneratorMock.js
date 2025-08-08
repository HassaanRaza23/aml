// Mock report generator service
import { reportTemplatesMock } from './reportTemplatesMock';

export const reportGeneratorMock = {
  // Generate Customer Risk Assessment Report
  generateCustomerRiskAssessment: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const reportData = {
      generatedDate: new Date().toISOString(),
      reportId: `CRA-${Date.now()}`,
      customerId: customerData.customerId || 'CUST001',
      fullName: customerData.fullName || 'John Doe',
      nationality: customerData.nationality || 'USA',
      entityType: customerData.entityType || 'Individual',
      riskScore: customerData.riskScore || 65,
      riskLevel: customerData.riskLevel || 'Medium',
      assessmentDate: new Date().toISOString(),
      pepScore: 40,
      pepDetails: 'Customer has potential PEP connections',
      sanctionsScore: 0,
      sanctionsDetails: 'No sanctions matches found',
      geoScore: 25,
      geoDetails: 'Customer from medium-risk jurisdiction',
      businessScore: 20,
      businessDetails: 'Standard business activities',
      recommendation1: 'Conduct enhanced due diligence',
      recommendation2: 'Monitor transactions closely',
      recommendation3: 'Review risk assessment quarterly'
    };
    
    return {
      success: true,
      reportType: 'Customer Risk Assessment',
      data: reportData,
      template: reportTemplatesMock.customerRiskAssessment.template
    };
  },

  // Generate Transaction Monitoring Report
  generateTransactionMonitoring: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reportData = {
      startDate: filters.startDate || '2024-01-01',
      endDate: filters.endDate || '2024-01-31',
      generatedDate: new Date().toISOString(),
      reportId: `TM-${Date.now()}`,
      totalTransactions: 1250,
      flaggedTransactions: 45,
      blockedTransactions: 12,
      totalAmount: '$2,450,000',
      averageRiskScore: 35,
      highRiskTransactions: [
        {
          transactionId: 'TX001',
          customerName: 'Ahmad Khan',
          amount: '$50,000',
          riskScore: 85,
          reason: 'High amount, suspicious pattern'
        },
        {
          transactionId: 'TX002',
          customerName: 'Maria Lopez',
          amount: '$75,000',
          riskScore: 92,
          reason: 'PEP connection detected'
        }
      ],
      lowRiskCount: 980,
      mediumRiskCount: 225,
      highRiskCount: 45
    };
    
    return {
      success: true,
      reportType: 'Transaction Monitoring',
      data: reportData,
      template: reportTemplatesMock.transactionMonitoring.template
    };
  },

  // Generate Screening Results Report
  generateScreeningResults: async (screeningData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const reportData = {
      screeningDate: new Date().toISOString(),
      reportId: `SR-${Date.now()}`,
      customerId: screeningData.customerId || 'CUST001',
      fullName: screeningData.customerName || 'John Doe',
      nationality: screeningData.nationality || 'USA',
      totalSources: 9,
      totalMatches: 3,
      overallRiskScore: 75,
      riskLevel: 'High',
      dowJonesMatches: 1,
      dowJonesScore: 85,
      ofacMatches: 0,
      ofacScore: 0,
      centralBankMatches: 2,
      centralBankScore: 70,
      detailedMatches: [
        {
          id: 'MATCH001',
          name: 'John Smith',
          source: 'Dow Jones',
          score: 85,
          type: 'PEP',
          country: 'UK'
        },
        {
          id: 'MATCH002',
          name: 'Global FinCorp',
          source: 'Central Bank',
          score: 70,
          type: 'Entity',
          country: 'USA'
        }
      ]
    };
    
    return {
      success: true,
      reportType: 'Screening Results',
      data: reportData,
      template: reportTemplatesMock.screeningResults.template
    };
  },

  // Generate Case Management Report
  generateCaseManagement: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const reportData = {
      startDate: filters.startDate || '2024-01-01',
      endDate: filters.endDate || '2024-01-31',
      generatedDate: new Date().toISOString(),
      reportId: `CM-${Date.now()}`,
      totalCases: 156,
      openCases: 45,
      resolvedCases: 111,
      avgResolutionTime: '3.2 days',
      openCount: 45,
      openPercentage: 28.8,
      inProgressCount: 67,
      inProgressPercentage: 42.9,
      resolvedCount: 44,
      resolvedPercentage: 28.2,
      highRiskCount: 23,
      highRiskPercentage: 14.7,
      mediumRiskCount: 89,
      mediumRiskPercentage: 57.1,
      lowRiskCount: 44,
      lowRiskPercentage: 28.2,
      recentCases: [
        {
          caseId: 'CASE001',
          customerName: 'Ahmad Khan',
          riskLevel: 'High',
          status: 'Open',
          createdDate: '2024-01-15'
        },
        {
          caseId: 'CASE002',
          customerName: 'Maria Lopez',
          riskLevel: 'Medium',
          status: 'In Progress',
          createdDate: '2024-01-14'
        }
      ]
    };
    
    return {
      success: true,
      reportType: 'Case Management',
      data: reportData,
      template: reportTemplatesMock.caseManagement.template
    };
  },

  // Generate Compliance Dashboard Report
  generateComplianceDashboard: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const reportData = {
      startDate: filters.startDate || '2024-01-01',
      endDate: filters.endDate || '2024-01-31',
      generatedDate: new Date().toISOString(),
      reportId: `CD-${Date.now()}`,
      totalCustomers: 1250,
      totalTransactions: 8500,
      totalScreenings: 1800,
      totalCases: 156,
      complianceScore: 94.5,
      lowRiskCustomers: 875,
      mediumRiskCustomers: 300,
      highRiskCustomers: 75,
      normalTransactions: 7800,
      flaggedTransactions: 600,
      blockedTransactions: 100,
      positiveMatches: 45,
      falsePositives: 12,
      avgResponseTime: '2.3 seconds',
      resolvedCases: 111,
      pendingCases: 45,
      avgResolutionTime: '3.2 days'
    };
    
    return {
      success: true,
      reportType: 'Compliance Dashboard',
      data: reportData,
      template: reportTemplatesMock.complianceDashboard.template
    };
  },

  // Generate Regulatory Report (SAR/STR)
  generateRegulatoryReport: async (caseData) => {
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const reportData = {
      reportId: `SAR-${Date.now()}`,
      filingDate: new Date().toISOString(),
      reportingPeriod: '2024-01-01 to 2024-01-31',
      subjectName: caseData.customerName || 'Ahmad Khan',
      dateOfBirth: caseData.dateOfBirth || '1980-01-01',
      nationality: caseData.nationality || 'Pakistan',
      identification: caseData.identification || 'Passport: PK123456',
      address: caseData.address || '123 Main St, Karachi, Pakistan',
      activityType: 'Suspicious Transaction Pattern',
      dateRange: '2024-01-15 to 2024-01-25',
      totalAmount: '$125,000',
      currency: 'USD',
      description: 'Multiple high-value transactions with no clear business purpose',
      redFlag1: 'Unusual transaction pattern',
      redFlag2: 'High-risk jurisdiction',
      redFlag3: 'PEP connection detected',
      evidenceType: 'Transaction Records',
      evidenceDescription: 'Bank statements showing multiple transfers',
      evidenceDate: '2024-01-20',
      conclusion: 'Suspicious activity requiring regulatory reporting',
      recommendation1: 'File SAR with regulatory authority',
      recommendation2: 'Continue monitoring customer activities'
    };
    
    return {
      success: true,
      reportType: 'Regulatory Report',
      data: reportData,
      template: reportTemplatesMock.regulatoryReport.template
    };
  },

  // Generate Audit Trail Report
  generateAuditTrail: async (filters = {}) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const reportData = {
      startDate: filters.startDate || '2024-01-01',
      endDate: filters.endDate || '2024-01-31',
      generatedDate: new Date().toISOString(),
      reportId: `AT-${Date.now()}`,
      totalEvents: 2450,
      uniqueUsers: 15,
      systemEvents: 1200,
      userEvents: 1250,
      loginCount: 450,
      loginPercentage: 18.4,
      customerCreationCount: 125,
      customerCreationPercentage: 5.1,
      screeningCount: 1800,
      screeningPercentage: 73.5,
      caseCreationCount: 75,
      caseCreationPercentage: 3.1,
      recentEvents: [
        {
          timestamp: '2024-01-15T10:30:00Z',
          user: 'john.doe@company.com',
          action: 'Customer Screening',
          details: 'Screened customer Ahmad Khan',
          ipAddress: '192.168.1.100'
        },
        {
          timestamp: '2024-01-15T10:25:00Z',
          user: 'jane.smith@company.com',
          action: 'Case Creation',
          details: 'Created case for suspicious activity',
          ipAddress: '192.168.1.101'
        }
      ]
    };
    
    return {
      success: true,
      reportType: 'Audit Trail',
      data: reportData,
      template: reportTemplatesMock.auditTrail.template
    };
  },

  // Generate all available reports
  generateAllReports: async (filters = {}) => {
    const reports = await Promise.all([
      reportGeneratorMock.generateCustomerRiskAssessment({}),
      reportGeneratorMock.generateTransactionMonitoring(filters),
      reportGeneratorMock.generateScreeningResults({}),
      reportGeneratorMock.generateCaseManagement(filters),
      reportGeneratorMock.generateComplianceDashboard(filters),
      reportGeneratorMock.generateRegulatoryReport({}),
      reportGeneratorMock.generateAuditTrail(filters)
    ]);
    
    return {
      success: true,
      reports: reports,
      generatedDate: new Date().toISOString(),
      totalReports: reports.length
    };
  }
};
