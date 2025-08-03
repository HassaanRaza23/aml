import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const menu = [
  {
    title: 'Dashboard',
    path: '/dashboard',
  },
  {
    title: 'Customer',
    subMenu: [
      { title: 'Customer List', path: '/customer/list' },
      { title: 'Onboarding Form', path: '/customer/onboarding' },
      { title: 'KYC Details', path: '/customer/kyc' },
      { title: 'Risk Profile', path: '/customer/risk-profile' },
    ],
  },
  {
    title: 'Screening',
    subMenu: [
      { title: 'Instant Screening', path: '/screening/instant' },
      { title: 'Ongoing Screening', path: '/screening/ongoing' },
    ],
  },
  {
    title: 'Monitoring',
    subMenu: [
      { title: 'Transaction Monitoring', path: '/monitoring/transactions' },
      { title: 'Alerts', path: '/monitoring/alerts' },
    ],
  },
  {
    title: 'Risk',
    subMenu: [
      { title: 'Risk Assessment', path: '/risk/assessment' },
      { title: 'Risk Rules', path: '/risk/rules' },
      { title: 'Risk Models', path: '/risk/models' },
    ],
  },
  {
    title: 'Case Management',
    subMenu: [
      { title: 'Case List', path: '/cases/list' },
      { title: 'Case Details', path: '/cases/details' },
      { title: 'Assign Case', path: '/cases/assign' },
    ],
  },
  {
    title: 'Reports',
    subMenu: [
      { title: 'SAR Reports', path: '/reports/sar' },
      { title: 'Audit Logs', path: '/reports/audit' },
      { title: 'Activity Reports', path: '/reports/activity' },
    ],
  },
  {
    title: 'Admin',
    subMenu: [
      { title: 'User Management', path: '/admin/users' },
      { title: 'Role & Permissions', path: '/admin/roles' },
      { title: 'Settings', path: '/admin/settings' },
    ],
  },
];

const Sidebar = () => {
  const [active, setActive] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 h-screen bg-white text-black p-4 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">AML Platform</h1>

      {menu.map((item, index) => (
        <div key={index} className="mb-3">
          {item.subMenu ? (
            <div>
              <button
                className="w-full text-left font-semibold hover:text-blue-400"
                onClick={() => setActive(active === index ? null : index)}
              >
                {item.title}
              </button>
              {active === index && (
                <div className="ml-4 mt-2 space-y-2">
                  {item.subMenu.map((sub, subIndex) => (
                    <Link
                      key={subIndex}
                      to={sub.path}
                      className={`block hover:text-blue-300 ${
                        isActive(sub.path) ? 'text-blue-400' : ''
                      }`}
                    >
                      {sub.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              to={item.path}
              className={`block font-semibold hover:text-blue-400 ${
                isActive(item.path) ? 'text-blue-400' : ''
              }`}
            >
              {item.title}
            </Link>
          )}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
