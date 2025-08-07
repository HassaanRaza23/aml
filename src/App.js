// App.jsx
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';


import Layout from './components/Layout';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/DashboardHome';

// Customer
import CustomerList from './pages/Customer/CustomerList';
import CustomerForm from './pages/Customer/OnboardingForm';
import KYCDetails from './pages/Customer/KYCDetails';
import RiskProfile from './pages/Customer/RiskProfile';

// Screening
import InstantScreening from './pages/Screening/InstantScreening';
import OngoingScreening from './pages/Screening/OngoingScreening';
import MonitoringList from './pages/Screening/MonitoringList';
import ScreeningHistory from './pages/Screening/ScreeningHistory';
import CaseDetailView from './pages/Screening/CaseDetailView';

// Monitoring
import AddTransaction from './pages/Monitoring/AddTransaction';
import TransactionMonitoring from './pages/Monitoring/TransactionMonitoring';
import Alerts from './pages/Monitoring/Alerts';
import TransactionRules from './pages/Monitoring/TransactionRules';

// Risk
import RiskAssessment from './pages/Risk/RiskAssessment';
import RiskRules from './pages/Risk/RiskRules';
import RiskModels from './pages/Risk/RiskModels';
import RiskProfile2 from './pages/Risk/RiskProfile2';

// Case Management
import CaseList from './pages/CaseManagement/CaseList';
import CaseDetails from './pages/CaseManagement/CaseDetails';
import AssignCase from './pages/CaseManagement/AssignCase';
import CaseActions from './pages/CaseManagement/CaseActions';

// Reports
import ReportGeneration from './pages/Reports/ReportGeneration';
import ReportList from './pages/Reports/ReportList';
import SARReports from './pages/Reports/SARReports';
import AuditLogs from './pages/Reports/AuditLogs';
import ActivityReports from './pages/Reports/ActivityReports';

// Admin
import UserManagement from './pages/Admin/UserManagement';
import RolePermissions from './pages/Admin/RolePermissions';
import Settings from './pages/Admin/Settings';

// Logs
import ActivityLogs from './pages/logs/Activitylogs';
import Systemlogs from './pages/logs/Systemlogs';


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Layout Routes */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />

                {/* Customer */}
                <Route path="customer/list" element={<CustomerList />} />
                <Route path="customer/onboarding" element={<CustomerForm />} />
                <Route path="customer/kyc" element={<KYCDetails />} />
                <Route path="customer/risk-profile" element={<RiskProfile />} />

                {/* Screening */}
                <Route path="screening/instant" element={<InstantScreening />} />
                <Route path="screening/ongoing" element={<OngoingScreening />} />
                <Route path="/screening/monitoringlist" element={<MonitoringList />} />
                <Route path="/screening/screeninghistory" element={<ScreeningHistory />} />
                <Route path="/screening/casedetails" element={<CaseDetailView />} />

                {/* Monitoring */}
                <Route path="monitoring/addtransactions" element={<AddTransaction />} />
                <Route path="monitoring/transactions" element={<TransactionMonitoring />} />
                <Route path="monitoring/alerts" element={<Alerts />} />
                <Route path="monitoring/transactionrules" element={<TransactionRules />} />

                {/* Risk */}
                <Route path="risk/assessment" element={<RiskAssessment />} />
                <Route path="risk/rules" element={<RiskRules />} />
                <Route path="risk/models" element={<RiskModels />} />
                <Route path="/risk-profile/:id" element={<RiskProfile2 />} />


                {/* Case Management */}
                <Route path="cases/list" element={<CaseList />} />
                <Route path="cases/details" element={<CaseDetails />} />
                <Route path="cases/assign" element={<AssignCase />} />
                <Route path="cases/actions" element={<CaseActions />} />

                {/* Reports */}
                <Route path="reports/reportgeneration" element={<ReportGeneration />} />
                <Route path="reports/reportlist" element={<ReportList />} />
                {/* <Route path="reports/sar" element={<SARReports />} />
                <Route path="reports/audit" element={<AuditLogs />} />
                <Route path="reports/activity" element={<ActivityReports />} /> */}

                {/* Admin */}
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/roles" element={<RolePermissions />} />
                <Route path="admin/settings" element={<Settings />} />

                {/* logs */}
                <Route path="logs/activitylogs" element={<ActivityLogs />} />
                <Route path="logs/systemlogs" element={<Systemlogs />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
