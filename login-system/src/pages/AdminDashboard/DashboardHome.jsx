import React, { useEffect, useState } from "react";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    pendingApprovals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading stats");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Total Students</h3>
        <p className="text-3xl">{stats.totalStudents}</p>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Total Faculty</h3>
        <p className="text-3xl">{stats.totalFaculty}</p>
      </div>
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-2">Pending Approvals</h3>
        <p className="text-3xl">{stats.pendingApprovals}</p>
      </div>
    </div>
  );
};

export default DashboardHome;
