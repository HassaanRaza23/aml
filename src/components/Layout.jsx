// src/components/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import UserMenu from './UserMenu';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="flex justify-end items-center p-4 border-b shadow-sm bg-white">
          <UserMenu />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
