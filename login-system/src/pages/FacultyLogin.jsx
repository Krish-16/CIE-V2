import React from "react";

const FacultyLogin = () => {
  return (
    <div
  className="min-h-screen bg-cover bg-center flex items-center justify-center"
  style={{
    backgroundImage: "url('https://i.postimg.cc/QMvRwF9r/IMG-1611-jpg.jpg')",
  }}
>
  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md bg-opacity-90">
    <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
      EzCIE Faculty Portal
    </h1>

    <input
      type="text"
      placeholder="Faculty ID"
      className="w-full p-3 mb-4 border border-gray-300 rounded text-black"
    />
    <input
      type="password"
      placeholder="Password"
      className="w-full p-3 mb-6 border border-gray-300 rounded text-black"
    />
    <button className="w-full bg-[#0056A2] text-white py-3 rounded hover:bg-blue-800 transition">
      Login
    </button>
  </div>
</div>

  );
};

export default FacultyLogin;
