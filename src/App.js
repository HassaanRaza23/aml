// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

// Monitoring
import TransactionMonitoring from './pages/Monitoring/TransactionMonitoring';
import Alerts from './pages/Monitoring/Alerts';

// Risk
import RiskAssessment from './pages/Risk/RiskAssessment';
import RiskRules from './pages/Risk/RiskRules';
import RiskModels from './pages/Risk/RiskModels';

// Case Management
import CaseList from './pages/CaseManagement/CaseList';
import CaseDetails from './pages/CaseManagement/CaseDetails';
import AssignCase from './pages/CaseManagement/AssignCase';

// Reports
import SARReports from './pages/Reports/SARReports';
import AuditLogs from './pages/Reports/AuditLogs';
import ActivityReports from './pages/Reports/ActivityReports';

// Admin
import UserManagement from './pages/Admin/UserManagement';
import RolePermissions from './pages/Admin/RolePermissions';
import Settings from './pages/Admin/Settings';

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

                {/* Monitoring */}
                <Route path="monitoring/transactions" element={<TransactionMonitoring />} />
                <Route path="monitoring/alerts" element={<Alerts />} />

                {/* Risk */}
                <Route path="risk/assessment" element={<RiskAssessment />} />
                <Route path="risk/rules" element={<RiskRules />} />
                <Route path="risk/models" element={<RiskModels />} />

                {/* Case Management */}
                <Route path="cases/list" element={<CaseList />} />
                <Route path="cases/details" element={<CaseDetails />} />
                <Route path="cases/assign" element={<AssignCase />} />

                {/* Reports */}
                <Route path="reports/sar" element={<SARReports />} />
                <Route path="reports/audit" element={<AuditLogs />} />
                <Route path="reports/activity" element={<ActivityReports />} />

                {/* Admin */}
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/roles" element={<RolePermissions />} />
                <Route path="admin/settings" element={<Settings />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
