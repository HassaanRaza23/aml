// Mock Central Bank screening
export const centralBankMockAPI = {
  screenCentralBank: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const centralBankMatches = [];
    
    // Simulate UAE Central Bank screening
    if (customerData.nationality === 'UAE' && 
        customerData.fullName.toLowerCase().includes('al-nahyan')) {
      centralBankMatches.push({
        id: 'UAE001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 94,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'UAE Central Bank',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Royal Family',
        source: 'UAE Central Bank'
      });
    }
    
    // Simulate Saudi Central Bank screening
    if (customerData.nationality === 'Saudi Arabia' && 
        customerData.fullName.toLowerCase().includes('al-saud')) {
      centralBankMatches.push({
        id: 'SAUDI001',
        recordType: 'Individual',
        name: customerData.fullName,
        score: 96,
        searchType: 'Exact',
        primaryName: customerData.fullName,
        searchList: 'Saudi Central Bank',
        dob: customerData.dob || 'N/A',
        country: customerData.nationality,
        gender: customerData.gender || 'N/A',
        isSubsidiary: false,
        title: 'Royal Family',
        source: 'Saudi Central Bank'
      });
    }
    
    // Always return demo matches for testing
    const demoMatches = [
      {
        id: 'CB001',
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
        source: 'Central Bank'
      },
      {
        id: 'CB002',
        recordType: 'Entity',
        name: 'SafeBank Inc.',
        score: 87,
        searchType: 'Exact',
        primaryName: 'SafeBank International',
        searchList: 'Sanctions',
        dob: 'N/A',
        country: 'Canada',
        gender: 'N/A',
        isSubsidiary: false,
        title: 'Financial',
        source: 'Central Bank'
      },
      {
        id: 'CB003',
        recordType: 'Individual',
        name: 'Maria Garcia',
        score: 89,
        searchType: 'Broad',
        primaryName: 'M. Garcia',
        searchList: 'PEP',
        dob: '1982-11-08',
        country: 'Spain',
        gender: 'Female',
        isSubsidiary: false,
        title: 'Deputy Minister',
        source: 'Central Bank'
      }
    ];
    
    return {
      success: true,
      matches: [...centralBankMatches, ...demoMatches],
      source: 'Central Bank Lists'
    };
  },

  // Simulate multiple central banks
  screenMultipleCentralBanks: async (customerData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allMatches = [];
    
    // UAE Central Bank
    if (customerData.nationality === 'UAE') {
      const uaeResult = await centralBankMockAPI.screenCentralBank(customerData);
      allMatches.push(...uaeResult.matches);
    }
    
    // Saudi Central Bank
    if (customerData.nationality === 'Saudi Arabia') {
      const saudiResult = await centralBankMockAPI.screenCentralBank(customerData);
      allMatches.push(...saudiResult.matches);
    }
    
    // Kuwait Central Bank
    if (customerData.nationality === 'Kuwait') {
      const kuwaitResult = await centralBankMockAPI.screenCentralBank(customerData);
      allMatches.push(...kuwaitResult.matches);
    }
    
    return {
      success: true,
      matches: allMatches,
      source: 'Multiple Central Banks',
      banksChecked: ['UAE', 'Saudi Arabia', 'Kuwait']
    };
  }
};
