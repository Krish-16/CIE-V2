import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import DashboardHome from "./DashboardHome";
// import FacultyList removed
import StudentList from "./StudentList";
import AssignFaculty from "./AssignFaculty";
import ManageClasses from "./ManageClasses";
import ManageFaculty from "./ManageFaculty";  // Existing ManageFaculty component
import ManageDepartments from "./ManageDepartments"; // NEW ManageDepartments component import
import Profile from "./Profile";
import LogoutButton from "./LogoutButton";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow p-6 bg-gray-100">
        <Routes>
          <Route path="home" element={<DashboardHome />} />
          {/* Removed Faculty route */}
          <Route path="students" element={<StudentList />} />
          <Route path="assign" element={<AssignFaculty />} />
          <Route path="manage-classes" element={<ManageClasses />} />
          <Route path="manage-faculty" element={<ManageFaculty />} />
          {/* NEW Manage Departments route */}
          <Route path="manage-departments" element={<ManageDepartments />} />
          <Route path="profile" element={<Profile />} />
          {/* Default redirect to home */}
          <Route path="" element={<Navigate to="home" replace />} />
        </Routes>
      </main>
      <LogoutButton />
    </div>
  );
};

export default AdminDashboard;
