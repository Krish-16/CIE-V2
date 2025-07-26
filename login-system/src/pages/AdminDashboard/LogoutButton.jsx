import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin", { replace: true }); // Navigate to admin login on logout
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
      title="Logout"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
