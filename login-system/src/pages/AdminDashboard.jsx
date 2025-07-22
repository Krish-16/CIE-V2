import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-xl font-semibold mb-4">Manage Faculty</h2>
          <p>Add, update, or remove faculty members.</p>
        </div>

        <div className="bg-white p-6 shadow rounded">
          <h2 className="text-xl font-semibold mb-4">Manage Students</h2>
          <p>View and assign students to faculty for approval.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
