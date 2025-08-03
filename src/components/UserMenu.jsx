// src/components/UserMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition"
      >
        <User size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
          <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100">
            View Profile
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              // signOut logic here
              console.log("Sign out clicked");
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
