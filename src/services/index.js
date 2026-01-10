// Export all service layers for easy importing
export { customerService } from './customerService';
export { screeningService } from './screeningService';
export { transactionService } from './transactionService';
export { caseService } from './caseService';
export { reportService } from './reportService';
export { riskService } from './riskService';
export { alertService } from './alertService';
export { dashboardService } from './dashboardService';
export { userService } from './userService';
export { verificationService } from './verificationService';
export { transactionActivityRuleService } from './transactionActivityRuleService';


// Example usage:
/*
import { 
  customerService, 
  screeningService, 
  transactionService,
  caseService,
  reportService,
  riskService,
  alertService,
  dashboardService,
  userService 
} from '../services';

// Customer operations
const customer = await customerService.createCustomer(customerData);
const customers = await customerService.getCustomers(1, 50);

// Screening operations
const screeningResult = await screeningService.performInstantScreening(customerId, searchCriteria);

// Transaction operations
const transaction = await transactionService.createTransaction(transactionData);
const transactions = await transactionService.getTransactions(1, 50);

// Case operations
const caseRecord = await caseService.createCase(caseData);
const cases = await caseService.getCases(1, 50);

// Report operations
const report = await reportService.generateCustomerRiskAssessment(customerId);

// Risk operations
const riskAssessment = await riskService.performRiskAssessment(customerId);

// Alert operations
const alerts = await alertService.getAlerts(1, 50);

// Dashboard operations
const dashboardStats = await dashboardService.getDashboardStats();

// User operations
const user = await userService.getCurrentUser();
*/
