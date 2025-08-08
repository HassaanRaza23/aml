// Mock comprehensive screening service
import { dowJonesMockAPI } from './dowJonesMockAPI';
import { freeSourcesMockAPI } from './freeSourcesMockAPI';
import { centralBankMockAPI } from './centralBankMockAPI';
import { companyListsMockAPI } from './companyListsMockAPI';
import { uaeListsMockAPI } from './uaeListsMockAPI';

export const comprehensiveScreeningMock = {
  // Orchestrate all screening sources
  performComprehensiveScreening: async (customerData) => {
    try {
      console.log('Starting comprehensive screening for:', customerData.fullName);
      
      // Run all screening sources in parallel
      const [
        dowJonesResult,
        sanctionsResult,
        unSanctionsResult,
        interpolResult,
        euSanctionsResult,
        centralBankResult,
        whitelistResult,
        blacklistResult,
        uaeResult
      ] = await Promise.all([
        dowJonesMockAPI.screenCustomer(customerData),
        freeSourcesMockAPI.screenSanctions(customerData),
        freeSourcesMockAPI.screenUNSanctions(customerData),
        freeSourcesMockAPI.screenInterpol(customerData),
        freeSourcesMockAPI.screenEUSanctions(customerData),
        centralBankMockAPI.screenCentralBank(customerData),
        companyListsMockAPI.screenWhitelist(customerData),
        companyListsMockAPI.screenBlacklist(customerData),
        uaeListsMockAPI.screenUAELists(customerData)
      ]);
      
      // Combine all results
      const allMatches = [
        ...dowJonesResult.matches,
        ...sanctionsResult.matches,
        ...unSanctionsResult.matches,
        ...interpolResult.matches,
        ...euSanctionsResult.matches,
        ...centralBankResult.matches,
        ...whitelistResult.matches,
        ...blacklistResult.matches,
        ...uaeResult.matches
      ];
      
      // Calculate overall risk score
      const maxScore = Math.max(...allMatches.map(m => m.score), 0);
      
      // Group matches by source for better organization
      const groupedResults = {
        dowjones: dowJonesResult.matches,
        sanctions: [
          ...sanctionsResult.matches,
          ...unSanctionsResult.matches,
          ...euSanctionsResult.matches
        ],
        interpol: interpolResult.matches,
        centralBank: centralBankResult.matches,
        companyWhitelist: whitelistResult.matches,
        companyBlacklist: blacklistResult.matches,
        uaeList: uaeResult.matches
      };
      
      const screeningResult = {
        success: true,
        screeningId: `SCR-${Date.now()}`,
        customerId: customerData.customerId,
        customerName: customerData.fullName,
        timestamp: new Date().toISOString(),
        totalSources: 9,
        totalMatches: allMatches.length,
        overallRiskScore: maxScore,
        riskLevel: maxScore >= 70 ? 'High' : maxScore >= 40 ? 'Medium' : 'Low',
        results: groupedResults,
        sources: [
          'Dow Jones',
          'OFAC Sanctions',
          'UN Sanctions',
          'Interpol',
          'EU Sanctions',
          'Central Banks',
          'Company Whitelist',
          'Company Blacklist',
          'UAE Lists'
        ],
        summary: {
          highRiskMatches: allMatches.filter(m => m.score >= 70).length,
          mediumRiskMatches: allMatches.filter(m => m.score >= 40 && m.score < 70).length,
          lowRiskMatches: allMatches.filter(m => m.score < 40).length,
          totalSourcesChecked: 9
        }
      };
      
      console.log('Screening completed:', screeningResult);
      return screeningResult;
      
    } catch (error) {
      console.error('Screening error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Perform instant screening (simplified version)
  performInstantScreening: async (customerData) => {
    try {
      console.log('Starting instant screening for:', customerData.fullName);
      
      // Run core screening sources
      const [
        dowJonesResult,
        sanctionsResult,
        centralBankResult,
        companyListsResult
      ] = await Promise.all([
        dowJonesMockAPI.screenCustomer(customerData),
        freeSourcesMockAPI.screenSanctions(customerData),
        centralBankMockAPI.screenCentralBank(customerData),
        companyListsMockAPI.screenCompanyLists(customerData)
      ]);
      
      const allMatches = [
        ...dowJonesResult.matches,
        ...sanctionsResult.matches,
        ...centralBankResult.matches,
        ...companyListsResult.whitelist,
        ...companyListsResult.blacklist
      ];
      
      const maxScore = Math.max(...allMatches.map(m => m.score), 0);
      
      return {
        success: true,
        screeningId: `INSTANT-${Date.now()}`,
        customerId: customerData.customerId,
        customerName: customerData.fullName,
        timestamp: new Date().toISOString(),
        totalSources: 4,
        totalMatches: allMatches.length,
        overallRiskScore: maxScore,
        riskLevel: maxScore >= 70 ? 'High' : maxScore >= 40 ? 'Medium' : 'Low',
        results: {
          dowjones: dowJonesResult.matches,
          sanctions: sanctionsResult.matches,
          centralBank: centralBankResult.matches,
          companyWhitelist: companyListsResult.whitelist,
          companyBlacklist: companyListsResult.blacklist
        }
      };
      
    } catch (error) {
      console.error('Instant screening error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  },

  // Perform batch screening
  performBatchScreening: async (customerList) => {
    try {
      console.log('Starting batch screening for', customerList.length, 'customers');
      
      const results = [];
      const startTime = Date.now();
      
      for (const customer of customerList) {
        const result = await comprehensiveScreeningMock.performInstantScreening(customer);
        results.push(result);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        success: true,
        batchId: `BATCH-${Date.now()}`,
        results: results,
        totalProcessed: customerList.length,
        duration: duration,
        timestamp: new Date().toISOString(),
        summary: {
          totalCustomers: customerList.length,
          highRiskCustomers: results.filter(r => r.overallRiskScore >= 70).length,
          mediumRiskCustomers: results.filter(r => r.overallRiskScore >= 40 && r.overallRiskScore < 70).length,
          lowRiskCustomers: results.filter(r => r.overallRiskScore < 40).length
        }
      };
      
    } catch (error) {
      console.error('Batch screening error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
};
