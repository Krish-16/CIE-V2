import React from "react";

const StudentLogin = () => {
  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-[#0056A2] mb-10">EzCIE</h1>

      <div className="bg-[#0056A2] p-8 rounded-md shadow-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Student Login
        </h2>

        <input
          type="text"
          placeholder="Student ID"
          className="w-full p-3 mb-4 border border-gray-300 rounded text-black bg-white"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border border-gray-300 rounded text-black bg-white"
        />

        <button className="w-full bg-white text-[#0056A2] font-semibold py-3 rounded hover:bg-gray-100 transition">
          Login
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;
