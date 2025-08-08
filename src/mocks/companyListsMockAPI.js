// Mock company screening lists
export const companyListsMockAPI = {
  // Whitelist check
  screenWhitelist: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const whitelistMatches = [];
    
    // Simulate known good companies
    if (customerData.entityType === 'Organization' && 
        customerData.fullName.toLowerCase().includes('microsoft')) {
      whitelistMatches.push({
        id: 'WL001',
        recordType: 'Entity',
        name: customerData.fullName,
        score: 65,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'Whitelist',
        dob: 'N/A',
        country: 'USA',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'IT Company',
        source: 'Company Whitelist'
      });
    }
    
    if (customerData.entityType === 'Organization' && 
        customerData.fullName.toLowerCase().includes('apple')) {
      whitelistMatches.push({
        id: 'WL002',
        recordType: 'Entity',
        name: customerData.fullName,
        score: 60,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'Whitelist',
        dob: 'N/A',
        country: 'USA',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Technology',
        source: 'Company Whitelist'
      });
    }
    
    // Always return demo matches for testing
    const demoMatches = [
      {
        id: 'WL003',
        recordType: 'Entity',
        name: 'TechWhiz Ltd.',
        score: 65,
        searchType: 'Exact',
        primaryName: 'TechWhiz',
        searchList: 'Whitelist',
        dob: 'N/A',
        country: 'USA',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'IT Company',
        source: 'Company Whitelist'
      },
      {
        id: 'WL004',
        recordType: 'Entity',
        name: 'Green Energy Corp',
        score: 60,
        searchType: 'Broad',
        primaryName: 'Green Energy',
        searchList: 'Whitelist',
        dob: 'N/A',
        country: 'Germany',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Renewable Energy',
        source: 'Company Whitelist'
      }
    ];
    
    return {
      success: true,
      matches: [...whitelistMatches, ...demoMatches],
      source: 'Company Whitelist'
    };
  },
  
  // Blacklist check
  screenBlacklist: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const blacklistMatches = [];
    
    // Simulate known bad companies
    if (customerData.entityType === 'Organization' && 
        customerData.fullName.toLowerCase().includes('fakebank')) {
      blacklistMatches.push({
        id: 'BL001',
        recordType: 'Entity',
        name: customerData.fullName,
        score: 95,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'Blacklist',
        dob: 'N/A',
        country: 'Russia',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Fraudulent Bank',
        source: 'Company Blacklist'
      });
    }
    
    if (customerData.entityType === 'Organization' && 
        customerData.fullName.toLowerCase().includes('ghostcorp')) {
      blacklistMatches.push({
        id: 'BL002',
        recordType: 'Entity',
        name: customerData.fullName,
        score: 91,
        searchType: 'Broad',
        primaryName: customerData.fullName,
        searchList: 'Blacklist',
        dob: 'N/A',
        country: 'North Korea',
        gender: 'N/A',
        isSubsidiary: true,
        title: 'Shell Company',
        source: 'Company Blacklist'
      });
    }
    
    // Always return demo matches for testing
    const demoMatches = [
      {
        id: 'BL003',
        recordType: 'Entity',
        name: 'PyramidFX',
        score: 89,
        searchType: 'Near',
        primaryName: 'Pyramid FX Ltd.',
        searchList: 'Blacklist',
        dob: 'N/A',
        country: 'India',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Ponzi Scheme',
        source: 'Company Blacklist'
      },
      {
        id: 'BL004',
        recordType: 'Entity',
        name: 'ScamCorp International',
        score: 93,
        searchType: 'Exact',
        primaryName: 'ScamCorp',
        searchList: 'Blacklist',
        dob: 'N/A',
        country: 'Nigeria',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Fraudulent Company',
        source: 'Company Blacklist'
      }
    ];
    
    return {
      success: true,
      matches: [...blacklistMatches, ...demoMatches],
      source: 'Company Blacklist'
    };
  },

  // Screen both whitelist and blacklist
  screenCompanyLists: async (customerData) => {
    const [whitelistResult, blacklistResult] = await Promise.all([
      companyListsMockAPI.screenWhitelist(customerData),
      companyListsMockAPI.screenBlacklist(customerData)
    ]);
    
    return {
      success: true,
      whitelist: whitelistResult.matches,
      blacklist: blacklistResult.matches,
      source: 'Company Lists'
    };
  }
};
