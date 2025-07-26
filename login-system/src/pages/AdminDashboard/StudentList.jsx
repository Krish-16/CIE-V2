import React, { useEffect, useState } from "react";

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/students", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading students");
        setLoading(false);
      });
  }, []);

  const handleApprove = async (studentId, approve) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/students/${studentId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ approve }),
        }
      );
      if (!res.ok) throw new Error("Approval failed");

      setStudents((prev) =>
        prev.map((s) =>
          s._id === studentId ? { ...s, approved: approve } : s
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update approval status");
    }
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Students</h2>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-left">Student ID</th>
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-center">Approved</th>
              <th className="border border-gray-300 p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{s.studentId}</td>
                <td className="border border-gray-300 p-2">{s.name}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {s.approved ? "Yes" : "No"}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  {!s.approved ? (
                    <>
                      <button
                        className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        onClick={() => handleApprove(s._id, true)}
                      >
                        Approve
                      </button>
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        onClick={() => handleApprove(s._id, false)}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <i className="text-gray-600">Approved</i>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentList;
