// Export all mock APIs for easy importing
export { dowJonesMockAPI } from './dowJonesMockAPI';
export { freeSourcesMockAPI } from './freeSourcesMockAPI';
export { centralBankMockAPI } from './centralBankMockAPI';
export { companyListsMockAPI } from './companyListsMockAPI';
export { uaeListsMockAPI } from './uaeListsMockAPI';
export { comprehensiveScreeningMock } from './comprehensiveScreeningMock';
export { reportTemplatesMock } from './reportTemplatesMock';
export { reportGeneratorMock } from './reportGeneratorMock';

// Example usage:
/*
import { comprehensiveScreeningMock, reportGeneratorMock } from '../mocks';

// Screening example
const customerData = {
  customerId: 'CUST001',
  fullName: 'Ahmad Khan',
  nationality: 'Pakistan',
  entityType: 'Individual',
  dob: '1980-01-01'
};

const screeningResult = await comprehensiveScreeningMock.performComprehensiveScreening(customerData);
console.log(screeningResult);

// Report generation example
const reportResult = await reportGeneratorMock.generateCustomerRiskAssessment(customerData);
console.log(reportResult);
*/
