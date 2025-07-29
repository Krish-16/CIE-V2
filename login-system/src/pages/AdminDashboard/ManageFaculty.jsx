import React, { useEffect, useState } from "react";

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [addMode, setAddMode] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    facultyId: "",
    name: "",
    department: "",
    password: "",
  });
  const [addError, setAddError] = useState("");

  const [editId, setEditId] = useState(null);
  const [editFaculty, setEditFaculty] = useState({
    name: "",
    department: "",
  });
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");

  const [deletePendingId, setDeletePendingId] = useState(null);
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchFaculty();
  }, []);

  const fetchDepartments = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/departments", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch faculty");
      const data = await res.json();
      setFacultyList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter faculty flat results by search term
  const filteredFacultyList = searchTerm.trim()
    ? facultyList.filter(
        (f) =>
          f.facultyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  // Group faculty only if no search active
  const groupedFaculty = !searchTerm.trim()
    ? facultyList.reduce((acc, fac) => {
        if (!acc[fac.department]) acc[fac.department] = [];
        acc[fac.department].push(fac);
        return acc;
      }, {})
    : null;

  const toggleDept = (dept) => {
    setExpandedDept(expandedDept === dept ? null : dept);
  };

  // Add new faculty
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");
    const { facultyId, name, department, password } = newFaculty;

    if (!facultyId.trim() || !name.trim() || !department || !password) {
      setAddError("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          facultyId: facultyId.trim(),
          name: name.trim(),
          department,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add faculty");
      }
      setNotification({ type: "success", message: "Faculty added successfully" });
      setAddMode(false);
      setNewFaculty({ facultyId: "", name: "", department: "", password: "" });
      fetchFaculty();
    } catch (err) {
      setAddError(err.message);
    }
  };

  // Edit faculty
  const startEdit = (fac) => {
    setEditId(fac._id);
    setEditFaculty({ name: fac.name || "", department: fac.department || "" });
    setEditPassword("");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditError("");
  };

  const saveEdit = async () => {
    setEditError("");
    if (!editFaculty.name.trim()) {
      setEditError("Name cannot be empty");
      return;
    }
    try {
      const payload = {
        name: editFaculty.name.trim(),
        department: editFaculty.department,
      };
      if (editPassword) payload.password = editPassword;

      const res = await fetch(`http://localhost:5000/api/admin/faculty/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update faculty");
      }
      setNotification({ type: "success", message: "Faculty updated successfully" });
      setEditId(null);
      fetchFaculty();
    } catch (err) {
      setEditError(err.message);
    }
  };

  // Delete confirmation handlers
  const requestDelete = (id) => setDeletePendingId(id);
  const cancelDelete = () => setDeletePendingId(null);

  const confirmDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/faculty/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to delete faculty");
      setNotification({ type: "success", message: "Faculty deleted successfully" });
      setDeletePendingId(null);
      fetchFaculty();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
      {notification && (
        <div
          className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-md z-50"
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Manage Faculty</h2>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by Faculty ID or Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
      />

      {!addMode ? (
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            setAddMode(true);
            setAddError("");
            setNewFaculty({ facultyId: "", name: "", department: "", password: "" });
          }}
        >
          Add New Faculty
        </button>
      ) : (
        <form className="mb-6 border p-4 rounded bg-gray-50" onSubmit={handleAddSubmit}>
          {addError && <p className="text-red-600 mb-2">{addError}</p>}

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block mb-1 font-semibold" htmlFor="facultyId">
                Faculty ID
              </label>
              <input
                id="facultyId"
                value={newFaculty.facultyId}
                onChange={(e) => setNewFaculty({ ...newFaculty, facultyId: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block mb-1 font-semibold" htmlFor="facultyName">
                Name
              </label>
              <input
                id="facultyName"
                value={newFaculty.name}
                onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block mb-1 font-semibold" htmlFor="facultyDepartment">
                Department
              </label>
              <select
                id="facultyDepartment"
                value={newFaculty.department}
                onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dep) => (
                  <option key={dep._id} value={dep.name}>
                    {dep.name} ({dep.departmentId})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block mb-1 font-semibold" htmlFor="facultyPassword">
                Password
              </label>
              <input
                id="facultyPassword"
                type="password"
                value={newFaculty.password}
                onChange={(e) => setNewFaculty({ ...newFaculty, password: e.target.value })}
                className="w-full border rounded px-3 py-2"
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Add Faculty
            </button>
            <button
              type="button"
              className="ml-4 px-4 py-2 rounded border hover:bg-gray-100"
              onClick={() => setAddMode(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading faculty...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {searchTerm.trim() ? (
        filteredFacultyList.length === 0 ? (
          <p>No faculty match your search.</p>
        ) : (
          <table className="border-collapse w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Faculty ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacultyList.map((fac) =>
                editId === fac._id ? (
                  <tr key={fac._id} className="bg-yellow-50">
                    <td className="border p-2">{fac.facultyId}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editFaculty.name}
                        onChange={(e) => setEditFaculty({ ...editFaculty, name: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        value={editFaculty.department}
                        onChange={(e) => setEditFaculty({ ...editFaculty, department: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dep) => (
                          <option key={dep._id} value={dep.name}>
                            {dep.name} ({dep.departmentId})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2 space-y-2">
                      <input
                        type="password"
                        placeholder="New Password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                        autoComplete="new-password"
                      />
                      {editError && <p className="text-red-600">{editError}</p>}
                      <button
                        onClick={saveEdit}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={fac._id} className="hover:bg-gray-100">
                    <td className="border p-2">{fac.facultyId}</td>
                    <td className="border p-2">{fac.name}</td>
                    <td className="border p-2">{fac.department}</td>
                    <td className="border p-2 space-x-2">
                      <button
                        onClick={() => startEdit(fac)}
                        className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      {deletePendingId === fac._id ? (
                        <>
                          <button
                            onClick={() => confirmDelete(fac._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 mr-2"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-3 py-1 border rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => requestDelete(fac._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )
      ) : (
        Object.entries(groupedFaculty).map(([dept, facList]) => (
          <section key={dept} className="mb-6">
            <div
              onClick={() => toggleDept(dept)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") toggleDept(dept);
              }}
              role="button"
              tabIndex={0}
              aria-expanded={expandedDept === dept}
              className={`flex justify-between items-center cursor-pointer p-3 rounded border ${
                expandedDept === dept ? "bg-blue-200 font-semibold" : "bg-gray-100"
              }`}
            >
              <h3>{dept}</h3>
              <span>{expandedDept === dept ? "−" : "+"}</span>
            </div>

            {expandedDept === dept && (
              <table className="mt-2 border w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Faculty ID</th>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Department</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facList.map((fac) => (
                    <tr key={fac._id} className="hover:bg-gray-100">
                      <td className="border p-2">{fac.facultyId}</td>
                      <td className="border p-2">{fac.name}</td>
                      <td className="border p-2">{fac.department}</td>
                      <td className="border p-2 space-x-2">
                        <button
                          onClick={() => startEdit(fac)}
                          className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>

                        {deletePendingId === fac._id ? (
                          <>
                            <button
                              onClick={() => confirmDelete(fac._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="px-3 py-1 border rounded hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => requestDelete(fac._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))
      )}
    </div>
  );
};

export default ManageFaculty;
