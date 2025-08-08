// Mock Dow Jones API responses
export const dowJonesMockAPI = {
  // Simulate API call to Dow Jones
  screenCustomer: async (customerData) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate different response scenarios based on customer data
    const riskIndicators = [];
    
    // High-risk scenarios
    if (customerData.nationality === 'Iran' || customerData.nationality === 'North Korea') {
      riskIndicators.push({
        id: 'DJ001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 95,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'Sanctions',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Sanctioned Individual',
        source: 'Dow Jones'
      });
    }
    
    if (customerData.fullName.toLowerCase().includes('khan') && customerData.nationality === 'Pakistan') {
      riskIndicators.push({
        id: 'DJ002',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 85,
        searchType: 'Broad',
        primaryName: customerData.fullName,
        searchList: 'PEP',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Potential PEP',
        source: 'Dow Jones'
      });
    }
    
    // Always return demo matches for testing (when no specific matches found)
    const demoMatches = [
      {
        id: 'DJ003',
        recordType: 'Individual',
        name: 'John Smith',
        score: 92,
        searchType: 'Near',
        primaryName: 'John A. Smith',
        searchList: 'PEP',
        dob: '1980-06-20',
        country: 'UK',
        gender: 'Male',
        isSubsidiary: false,
        title: 'Minister',
        source: 'Dow Jones'
      },
      {
        id: 'DJ004',
        recordType: 'Entity',
        name: 'Global FinCorp',
        score: 88,
        searchType: 'Exact',
        primaryName: 'Global FinCorp Ltd.',
        searchList: 'Sanctions',
        dob: 'N/A',
        country: 'USA',
        gender: 'N/A',
        isSubsidiary: true,
        title: 'Subsidiary',
        source: 'Dow Jones'
      },
      {
        id: 'DJ005',
        recordType: 'Individual',
        name: 'Sarah Johnson',
        score: 85,
        searchType: 'Broad',
        primaryName: 'S. Johnson',
        searchList: 'PEP',
        dob: '1975-03-15',
        country: 'Canada',
        gender: 'Female',
        isSubsidiary: false,
        title: 'Senator',
        source: 'Dow Jones'
      }
    ];
    
    return {
      success: true,
      matches: [...riskIndicators, ...demoMatches],
      totalScreened: 1,
      timestamp: new Date().toISOString(),
      source: 'Dow Jones'
    };
  },

  // Simulate batch screening
  screenBatch: async (customerList) => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const results = [];
    for (const customer of customerList) {
      const result = await dowJonesMockAPI.screenCustomer(customer);
      results.push(result);
    }
    
    return {
      success: true,
      batchId: `BATCH-${Date.now()}`,
      results: results,
      totalProcessed: customerList.length,
      timestamp: new Date().toISOString()
    };
  }
};
