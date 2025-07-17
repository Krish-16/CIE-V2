import React from "react";
import LoginCard from "../components/LoginCard";

const AdminLogin = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url("https://i.postimg.cc/QMvRwF9r/IMG-1611-jpg.jpg")`,
      }}
    >
      {/* Animated BG Elements (different colors) */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-32 h-32 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <LoginCard title="EZCIE Admin Portal" />
    </div>
  );
};

export default AdminLogin;
