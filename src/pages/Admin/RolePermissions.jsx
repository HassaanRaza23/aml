import React, { useState } from "react";

// Mock permissions grouped by module
const allPermissions = {
  Customer: ["View Customers", "Add Customer", "Edit Customer", "Delete Customer"],
  Screening: ["Run Instant Screening", "Manage Screening Rules"],
  Monitoring: ["View Transactions", "Flag Transactions", "Add Transactions"],
  Risk: ["View Risk Profiles", "Manage Risk Rules"],
  CaseManagement: ["View Cases", "Take Case Actions", "Close Cases"],
  Reports: ["Generate Reports", "Generate goAML XML", "Mark Report as Uploaded"],
  Admin: ["Manage Users", "Manage Roles", "Change Settings"],
};

const initialRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Full access to all modules",
    permissions: Object.values(allPermissions).flat(),
  },
  {
    id: 2,
    name: "Compliance Officer",
    description: "Can screen and monitor transactions",
    permissions: [
      "View Customers",
      "Run Instant Screening",
      "View Transactions",
      "Flag Transactions",
      "View Risk Profiles",
      "View Cases",
      "Generate Reports",
    ],
  },
];

const RolesAndPermissions = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [editingRole, setEditingRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddRole = () => {
    if (!newRole.name.trim()) return;

    const newId = roles.length + 1;
    const roleToAdd = {
      id: newId,
      name: newRole.name,
      description: newRole.description,
      permissions: [],
    };
    setRoles([...roles, roleToAdd]);
    setNewRole({ name: "", description: "" });
  };

  const openPermissionModal = (role) => {
    setEditingRole({ ...role });
    setIsModalOpen(true);
  };

  const togglePermission = (permission) => {
    const hasPermission = editingRole.permissions.includes(permission);
    const updatedPermissions = hasPermission
      ? editingRole.permissions.filter((p) => p !== permission)
      : [...editingRole.permissions, permission];

    setEditingRole((prev) => ({ ...prev, permissions: updatedPermissions }));
  };

  const savePermissions = () => {
    setRoles((prevRoles) =>
      prevRoles.map((role) =>
        role.id === editingRole.id ? editingRole : role
      )
    );
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const deleteRole = (id) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Roles & Permissions</h2>

      {/* Add Role Form */}
      <div className="mb-6 bg-gray-50 p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Add New Role</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Role Name"
            className="border p-2 w-1/3"
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-1/2"
            value={newRole.description}
            onChange={(e) =>
              setNewRole({ ...newRole, description: e.target.value })
            }
          />
          <button
            onClick={handleAddRole}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Role
          </button>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white shadow rounded">
        <table className="w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Role Name</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Permissions</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="p-2 border">{role.name}</td>
                <td className="p-2 border">{role.description}</td>
                <td className="p-2 border text-sm text-gray-600">
                  {role.permissions.slice(0, 3).join(", ")}
                  {role.permissions.length > 3 && (
                    <span className="text-gray-400">
                      {" "}
                      +{role.permissions.length - 3} more
                    </span>
                  )}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => openPermissionModal(role)}
                    className="text-blue-600 underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRole(role.id)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permissions Modal */}
      {isModalOpen && editingRole && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Edit Permissions: {editingRole.name}
            </h3>

            {Object.entries(allPermissions).map(([module, perms]) => (
              <div key={module} className="mb-4">
                <h4 className="font-semibold mb-1">{module}</h4>
                <div className="flex flex-wrap gap-3">
                  {perms.map((perm) => (
                    <label key={perm} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingRole.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4 mt-6">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingRole(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={savePermissions}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesAndPermissions;
