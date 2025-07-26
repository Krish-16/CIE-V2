import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "faculty") return <Navigate to="/faculty" replace />;
    if (role === "student") return <Navigate to="/" replace />;
    return <Navigate to="/" replace />;
  }
  if (user.role !== role) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "faculty") return <Navigate to="/faculty" replace />;
    if (user.role === "student") return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;
