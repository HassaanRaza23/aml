// Mock free screening sources
export const freeSourcesMockAPI = {
  // Open source sanctions lists
  screenSanctions: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const sanctionsMatches = [];
    
    // Simulate OFAC sanctions check
    if (customerData.fullName.toLowerCase().includes('al-qaeda') || 
        customerData.fullName.toLowerCase().includes('terrorist')) {
      sanctionsMatches.push({
        id: 'OFAC001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 100,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'OFAC SDN',
        dob: customerData.dob || 'N/A',
        country: 'USA',
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Terrorist Organization',
        source: 'Free Source'
      });
    }
    
    // Always return demo matches for testing
    const demoMatches = [
      {
        id: 'OFAC002',
        recordType: 'Individual',
        name: 'Jane Doe',
        score: 85,
        searchType: 'Broad',
        primaryName: 'J. Doe',
        searchList: 'Watchlists',
        dob: '1975-02-15',
        country: 'USA',
        gender: 'Female',
        isSubsidiary: false,
        title: 'Advisor',
        source: 'Free Source'
      },
      {
        id: 'OFAC003',
        recordType: 'Entity',
        name: 'Terrorist Corp',
        score: 95,
        searchType: 'Exact',
        primaryName: 'Terrorist Corporation',
        searchList: 'OFAC SDN',
        dob: 'N/A',
        country: 'Syria',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Terrorist Organization',
        source: 'Free Source'
      }
    ];
    
    return {
      success: true,
      matches: [...sanctionsMatches, ...demoMatches],
      source: 'Free Sanctions Lists'
    };
  },
  
  // UN sanctions
  screenUNSanctions: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const unMatches = [];
    
    // Simulate UN sanctions
    if (customerData.nationality === 'North Korea' && 
        customerData.fullName.toLowerCase().includes('kim')) {
      unMatches.push({
        id: 'UN001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 98,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'UN Sanctions',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'UN Sanctioned',
        source: 'UN Sanctions'
      });
    }
    
    return {
      success: true,
      matches: unMatches,
      source: 'UN Sanctions'
    };
  },
  
  // Interpol red notices
  screenInterpol: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const interpolMatches = [];
    
    // Simulate Interpol red notices
    if (customerData.fullName.toLowerCase().includes('fugitive') || 
        customerData.fullName.toLowerCase().includes('wanted')) {
      interpolMatches.push({
        id: 'INTERPOL001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 90,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'Interpol Red Notice',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Fugitive',
        source: 'Interpol'
      });
    }
    
    return {
      success: true,
      matches: interpolMatches,
      source: 'Interpol Red Notices'
    };
  },

  // EU sanctions
  screenEUSanctions: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 450));
    
    const euMatches = [];
    
    // Simulate EU sanctions
    if (customerData.nationality === 'Russia' && 
        customerData.fullName.toLowerCase().includes('oligarch')) {
      euMatches.push({
        id: 'EU001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 92,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'EU Sanctions',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'EU Sanctioned',
        source: 'EU Sanctions'
      });
    }
    
    return {
      success: true,
      matches: euMatches,
      source: 'EU Sanctions'
    };
  }
};
