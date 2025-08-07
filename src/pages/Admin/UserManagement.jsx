import React, { useState } from "react";

const initialUsers = [
  {
    id: 1,
    name: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-08-06 14:32",
  },
  {
    id: 2,
    name: "Ali Raza",
    email: "ali.raza@example.com",
    role: "Analyst",
    status: "Inactive",
    lastLogin: "2025-07-30 10:45",
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Analyst",
    password: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAddUser = () => {
    const newUser = {
      id: users.length + 1,
      ...formData,
      lastLogin: "Never",
    };
    setUsers((prev) => [...prev, newUser]);
    setFormData({ name: "", email: "", role: "Analyst", password: "", status: "Active" });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">User Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Last Login</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.status}</td>
                <td className="p-3">{user.lastLogin}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add New User</h2>

            <div className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="password"
                name="password"
                placeholder="Temporary Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Admin">Admin</option>
                <option value="Analyst">Analyst</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Auditor">Auditor</option>
              </select>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
