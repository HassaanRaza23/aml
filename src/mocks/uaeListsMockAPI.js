// Mock UAE-specific screening
export const uaeListsMockAPI = {
  screenUAELists: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const uaeMatches = [];
    
    // Simulate UAE-specific PEP lists
    if (customerData.nationality === 'UAE' && 
        customerData.fullName.toLowerCase().includes('al-maktoum')) {
      uaeMatches.push({
        id: 'UAE001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 96,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'UAE Lists',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Royal Family',
        source: 'UAE Lists'
      });
    }
    
    // Simulate UAE business leaders
    if (customerData.nationality === 'UAE' && 
        customerData.fullName.toLowerCase().includes('al-qasimi')) {
      uaeMatches.push({
        id: 'UAE002',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 81,
        searchType: 'Broad',
        primaryName: customerData.fullName,
        searchList: 'UAE Lists',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Businesswoman',
        source: 'UAE Lists'
      });
    }
    
    // Simulate UAE companies
    if (customerData.entityType === 'Organization' && 
        customerData.fullName.toLowerCase().includes('emirates')) {
      uaeMatches.push({
        id: 'UAE003',
        recordType: 'Entity',
        name: customerData.fullName,
        score: 83,
        searchType: 'Near',
        primaryName: customerData.fullName,
        searchList: 'UAE Lists',
        dob: 'N/A',
        country: 'UAE',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Logistics',
        source: 'UAE Lists'
      });
    }
    
    // Always return demo matches for testing
    const demoMatches = [
      {
        id: 'UAE004',
        recordType: 'Individual',
        name: 'Faisal Al Nahyan',
        score: 94,
        searchType: 'Exact',
        primaryName: 'Faisal A. Nahyan',
        searchList: 'UAE List',
        dob: '1970-10-05',
        country: 'UAE',
        gender: 'Male',
        isSubsidiary: false,
        title: 'Minister',
        source: 'UAE Lists'
      },
      {
        id: 'UAE005',
        recordType: 'Entity',
        name: 'Desert Traders',
        score: 85,
        searchType: 'Near',
        primaryName: 'Desert Trading Co.',
        searchList: 'UAE List',
        dob: 'N/A',
        country: 'UAE',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Trading Company',
        source: 'UAE Lists'
      },
      {
        id: 'UAE006',
        recordType: 'Individual',
        name: 'Aisha Al Mansouri',
        score: 87,
        searchType: 'Broad',
        primaryName: 'A. Al Mansouri',
        searchList: 'UAE List',
        dob: '1985-07-22',
        country: 'UAE',
        gender: 'Female',
        isSubsidiary: false,
        title: 'Business Leader',
        source: 'UAE Lists'
      }
    ];
    
    return {
      success: true,
      matches: [...uaeMatches, ...demoMatches],
      source: 'UAE Specific Lists'
    };
  },

  // Screen multiple UAE-specific lists
  screenMultipleUAELists: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const allMatches = [];
    
    // UAE PEP List
    const pepResult = await uaeListsMockAPI.screenUAELists(customerData);
    allMatches.push(...pepResult.matches);
    
    // UAE Business Registry
    if (customerData.entityType === 'Organization') {
      const businessResult = await uaeListsMockAPI.screenUAELists(customerData);
      allMatches.push(...businessResult.matches);
    }
    
    // UAE Financial Services Authority
    const fsaResult = await uaeListsMockAPI.screenUAELists(customerData);
    allMatches.push(...fsaResult.matches);
    
    return {
      success: true,
      matches: allMatches,
      source: 'Multiple UAE Lists',
      listsChecked: ['UAE PEP', 'UAE Business Registry', 'UAE FSA']
    };
  }
};
