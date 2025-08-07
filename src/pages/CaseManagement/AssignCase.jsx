import React, { useState } from 'react';

const AssignCase = () => {
  const [caseId, setCaseId] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('medium');
  const [note, setNote] = useState('');

  const handleAssign = () => {
    // TODO: Add actual assign case logic (API call etc.)
    console.log('Case Assigned:', { caseId, assignee, priority, note });
    alert('Case assigned successfully');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Assign Case</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Case ID</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            placeholder="Enter Case ID"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Assign to User</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded-md"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            placeholder="Enter user email or name"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Priority</label>
          <select
            className="w-full border px-3 py-2 rounded-md"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Note (optional)</label>
          <textarea
            className="w-full border px-3 py-2 rounded-md"
            rows="3"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any special instructions or comments"
          ></textarea>
        </div>

        <button
          onClick={handleAssign}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Assign Case
        </button>
      </div>
    </div>
  );
};

export default AssignCase;
