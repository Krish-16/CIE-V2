import React, { useEffect, useState } from "react";

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [addMode, setAddMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [newClass, setNewClass] = useState({
    department: "",
    className: "",
    classId: "",
    facultyId: null,
  });

  const [editClass, setEditClass] = useState({
    department: "",
    className: "",
    classId: "",
    facultyId: null,
  });

  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [deletePendingId, setDeletePendingId] = useState(null);
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchClasses();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/departments", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/classes", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter classes flat based on search term
  const filteredClasses = searchTerm.trim()
    ? classes.filter(
        (cls) =>
          cls.classId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.className.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Group classes by department only if no search active
  const groupedClasses = !searchTerm.trim()
    ? classes.reduce((acc, cls) => {
        if (!acc[cls.department]) acc[cls.department] = [];
        acc[cls.department].push(cls);
        return acc;
      }, {})
    : null;

  const toggleDept = (dept) => {
    setExpandedDept(expandedDept === dept ? null : dept);
  };

  const resetForm = () => {
    setNewClass({
      department: "",
      className: "",
      classId: "",
      facultyId: null,
    });
    setAddError("");
    setEditId(null);
    setEditError("");
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");

    if (!newClass.department || !newClass.className.trim() || !newClass.classId.trim()) {
      setAddError("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          department: newClass.department,
          className: newClass.className.trim(),
          classId: newClass.classId.trim(),
          facultyId: newClass.facultyId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add class");
      }
      setNotification({ type: "success", message: "Class added successfully." });
      setAddMode(false);
      fetchClasses();
      resetForm();
    } catch (err) {
      setAddError(err.message);
    }
  };

  const startEdit = (cls) => {
    setEditId(cls._id);
    setEditClass({
      department: cls.department || "",
      className: cls.className || "",
      classId: cls.classId || "",
      facultyId: cls.facultyId || null,
    });
    setEditError("");
    setAddError("");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditError("");
  };

  const handleEditSave = async () => {
    setEditError("");
    if (!editClass.department || !editClass.className.trim() || !editClass.classId.trim()) {
      setEditError("All fields are required");
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/admin/classes/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          department: editClass.department,
          className: editClass.className.trim(),
          classId: editClass.classId.trim(),
          facultyId: editClass.facultyId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update class");
      }
      setNotification({ type: "success", message: "Class updated successfully." });
      setEditId(null);
      fetchClasses();
    } catch (err) {
      setEditError(err.message);
    }
  };

  const requestDelete = (id) => {
    setDeletePendingId(id);
  };

  const cancelDelete = () => {
    setDeletePendingId(null);
  };

  const confirmDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to delete class");
      setNotification({ type: "success", message: "Class deleted successfully." });
      setDeletePendingId(null);
      fetchClasses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded shadow">
      {notification && (
        <div
          className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-md z-50"
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Manage Classes</h2>

      <input
        type="text"
        placeholder="Search by Class ID or Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full max-w-md"
      />

      {!addMode ? (
        <button
          onClick={() => {
            setAddMode(true);
            resetForm();
          }}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add New Class
        </button>
      ) : (
        <form className="mb-6 border p-4 rounded bg-gray-50" onSubmit={handleAddSubmit}>
          {addError && <p className="text-red-600 mb-2">{addError}</p>}

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label htmlFor="addDepartment" className="block mb-1 font-semibold">
                Department
              </label>
              <select
                id="addDepartment"
                className="w-full border rounded px-3 py-2"
                value={newClass.department}
                onChange={(e) => setNewClass({ ...newClass, department: e.target.value })}
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
              <label htmlFor="addClassName" className="block mb-1 font-semibold">
                Class Name
              </label>
              <input
                id="addClassName"
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newClass.className}
                onChange={(e) => setNewClass({ ...newClass, className: e.target.value })}
                required
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label htmlFor="addClassId" className="block mb-1 font-semibold">
                Class ID
              </label>
              <input
                id="addClassId"
                type="text"
                className="w-full border rounded px-3 py-2"
                value={newClass.classId}
                onChange={(e) => setNewClass({ ...newClass, classId: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              Add Class
            </button>
            <button
              type="button"
              className="ml-4 px-4 py-2 border rounded"
              onClick={() => setAddMode(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p>Loading classes...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {searchTerm.trim() ? (
        filteredClasses.length === 0 ? (
          <p>No classes match your search.</p>
        ) : (
          <table className="border-collapse border w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Department</th>
                <th className="p-2 border">Class Name</th>
                <th className="p-2 border">Class ID</th>
                <th className="p-2 border">Faculty</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) =>
                editId === cls._id ? (
                  <tr key={cls._id} className="bg-yellow-50">
                    <td className="p-2 border">{cls.department}</td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={editClass.className}
                        onChange={(e) => setEditClass({ ...editClass, className: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={editClass.classId}
                        onChange={(e) => setEditClass({ ...editClass, classId: e.target.value })}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-2 border text-center">{cls.facultyId?.name || "—"}</td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={handleEditSave}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={cls._id} className="hover:bg-gray-100">
                    <td className="p-2 border">{cls.department}</td>
                    <td className="p-2 border">{cls.className}</td>
                    <td className="p-2 border">{cls.classId}</td>
                    <td className="p-2 border text-center">{cls.facultyId?.name || "—"}</td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => startEdit(cls)}
                        className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      {deletePendingId === cls._id ? (
                        <>
                          <button
                            onClick={() => confirmDelete(cls._id)}
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
                          onClick={() => requestDelete(cls._id)}
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
        Object.entries(groupedClasses).map(([dept, clsArray]) => (
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
              <table className="mt-2 border-collapse border w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Class Name</th>
                    <th className="p-2 border">Class ID</th>
                    <th className="p-2 border">Faculty Assigned</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clsArray.map((cls) =>
                    editId === cls._id ? (
                      <tr key={cls._id} className="bg-yellow-50">
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={editClass.className}
                            onChange={(e) => setEditClass({ ...editClass, className: e.target.value })}
                            className="w-full border rounded p-1"
                          />
                        </td>
                        <td className="p-2 border">
                          <input
                            type="text"
                            value={editClass.classId}
                            onChange={(e) => setEditClass({ ...editClass, classId: e.target.value })}
                            className="w-full border rounded p-1"
                          />
                        </td>
                        <td className="p-2 border text-center">{cls.facultyId?.name || "—"}</td>
                        <td className="p-2 border space-x-2">
                          <button
                            onClick={handleEditSave}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-400 px-3 py-1 rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={cls._id} className="hover:bg-gray-100">
                        <td className="p-2 border">{cls.className}</td>
                        <td className="p-2 border">{cls.classId}</td>
                        <td className="p-2 border text-center">{cls.facultyId?.name || "—"}</td>
                        <td className="p-2 border space-x-2">
                          <button
                            onClick={() => startEdit(cls)}
                            className="bg-yellow-400 px-3 py-1 rounded hover:bg-yellow-500"
                          >
                            Edit
                          </button>

                          {deletePendingId === cls._id ? (
                            <>
                              <button
                                onClick={() => confirmDelete(cls._id)}
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
                              onClick={() => requestDelete(cls._id)}
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
            )}
          </section>
        ))
      )}
    </div>
  );
};

export default ManageClasses;
