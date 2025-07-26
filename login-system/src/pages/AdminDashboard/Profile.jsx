import React, { useEffect, useState } from "react";

const Profile = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch current admin profile info
    fetch("http://localhost:5000/api/admin/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setName(data.name || "");
      })
      .catch((err) => {
        setError(err.message || "Error loading profile");
      });
  }, []);

  const handleUpdate = async () => {
    setError("");
    setMessage("");

    const updateData = {};
    if (name) updateData.name = name;
    if (password) updateData.password = password;

    try {
      const res = await fetch("http://localhost:5000/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error("Failed to update profile");

      setMessage("Profile updated successfully!");
      setPassword("");
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Admin Profile</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <label className="block mb-2 font-medium">Name</label>
      <input
        type="text"
        className="w-full mb-4 p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="block mb-2 font-medium">New Password</label>
      <input
        type="password"
        className="w-full mb-4 p-2 border rounded"
        placeholder="Leave blank to keep current password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleUpdate}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Update Profile
      </button>
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
  );
};

export default Profile;
