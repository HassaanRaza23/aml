import React, { useState } from "react";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoLogout, setAutoLogout] = useState(15);
  const [timezone, setTimezone] = useState("Asia/Dubai");

  const handleSave = () => {
    // Add save logic here (e.g., API call)
    alert("Settings saved!");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-6 max-w-xl">

        {/* Email Notifications */}
        <div>
          <label className="block font-medium mb-1">Email Notifications</label>
          <select
            value={emailNotifications ? "enabled" : "disabled"}
            onChange={(e) => setEmailNotifications(e.target.value === "enabled")}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {/* Auto Logout */}
        <div>
          <label className="block font-medium mb-1">Auto Logout (minutes)</label>
          <input
            type="number"
            value={autoLogout}
            onChange={(e) => setAutoLogout(Number(e.target.value))}
            min="1"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block font-medium mb-1">System Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border border-gray-300 rounded p-2"
          >
            <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
            <option value="UTC">UTC</option>
            <option value="Asia/Karachi">Asia/Karachi</option>
            <option value="Asia/Riyadh">Asia/Riyadh</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
