import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkClass = ({ isActive }) =>
    isActive
      ? "text-white font-semibold border-b-2 border-white pb-1"
      : "text-gray-200 hover:text-white border-b-2 border-transparent pb-1";

  return (
    <nav className="bg-blue-700 p-4 flex space-x-8">
      <NavLink to="/admin-dashboard/home" className={linkClass}>
        Home
      </NavLink>
      {/* Faculty link removed */}
      <NavLink to="/admin-dashboard/students" className={linkClass}>
        Students
      </NavLink>
      <NavLink to="/admin-dashboard/assign" className={linkClass}>
        Assign Faculty
      </NavLink>
      <NavLink to="/admin-dashboard/manage-classes" className={linkClass}>
        Manage Classes
      </NavLink>
      <NavLink to="/admin-dashboard/manage-faculty" className={linkClass}>
        Manage Faculty
      </NavLink>
      <NavLink to="/admin-dashboard/profile" className={linkClass}>
        Profile
      </NavLink>
    </nav>
  );
};

export default Navbar;
