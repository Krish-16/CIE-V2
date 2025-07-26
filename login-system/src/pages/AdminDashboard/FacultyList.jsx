import React, { useEffect, useState } from "react";

const FacultyList = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/faculty", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch faculty");
        return res.json();
      })
      .then((data) => {
        setFaculty(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error loading faculty");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/faculty/${facultyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      setFaculty((prev) => prev.filter((f) => f._id !== facultyId));
    } catch (err) {
      alert(err.message || "Failed to delete faculty");
    }
  };

  if (loading) return <p>Loading faculty list...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Faculty List</h2>
      {faculty.length === 0 ? (
        <p>No faculty found.</p>
      ) : (
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2 text-left">Faculty ID</th>
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map((f) => (
              <tr key={f._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{f.facultyId}</td>
                <td className="border border-gray-300 p-2">{f.name}</td>
                <td className="border border-gray-300 p-2 text-center">
                  {/* Edit functionality can be added here later */}
                  <button
                    className="mr-2 text-yellow-600 hover:text-yellow-800"
                    title="Edit (coming soon)"
                    disabled
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(f._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FacultyList;
