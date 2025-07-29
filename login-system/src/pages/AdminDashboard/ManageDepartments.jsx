import React, { useEffect, useState } from "react";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [addMode, setAddMode] = useState(false);
  const [editId, setEditId] = useState(null);

  const [departmentId, setDepartmentId] = useState("");
  const [departmentName, setDepartmentName] = useState("");

  const [validationError, setValidationError] = useState("");
  const [deletePendingId, setDeletePendingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
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

  // Validate inputs
  const validate = () => {
    if (!/^\d{2}$/.test(departmentId)) {
      setValidationError("Department ID must be two digits (00-99).");
      return false;
    }
    if (departmentName.trim() === "") {
      setValidationError("Department name is required.");
      return false;
    }
    const duplicateId = departments.find(
      (d) => d.departmentId === departmentId && d._id !== editId
    );
    if (duplicateId) {
      setValidationError("Department ID already exists.");
      return false;
    }
    const duplicateName = departments.find(
      (d) => d.name.toUpperCase() === departmentName.trim().toUpperCase() && d._id !== editId
    );
    if (duplicateName) {
      setValidationError("Department name already exists.");
      return false;
    }
    setValidationError("");
    return true;
  };

  const resetForm = () => {
    setDepartmentId("");
    setDepartmentName("");
    setEditId(null);
    setValidationError("");
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5000/api/admin/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          departmentId,
          name: departmentName.trim().toUpperCase(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add department");
      }
      setNotification({ type: "success", message: "Department added successfully." });
      resetForm();
      setAddMode(false);
      fetchDepartments();
    } catch (err) {
      setValidationError(err.message);
    }
  };

  const startEdit = (department) => {
    setEditId(department._id);
    setDepartmentId(department.departmentId);
    setDepartmentName(department.name);
    setAddMode(true);
    setValidationError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/departments/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          departmentId,
          name: departmentName.trim().toUpperCase(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update department");
      }
      setNotification({ type: "success", message: "Department updated successfully." });
      resetForm();
      setAddMode(false);
      fetchDepartments();
    } catch (err) {
      setValidationError(err.message);
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
      const res = await fetch(`http://localhost:5000/api/admin/departments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete department");
      }
      setNotification({ type: "success", message: "Department deleted successfully." });
      setDeletePendingId(null);
      fetchDepartments();
    } catch (err) {
      setError(err.message);
    }
  };

  // Filtered list according to search
  const filteredDepartments = departments.filter(
    (d) =>
      d.departmentId.includes(searchTerm) ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      {notification && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <h2 className="text-2xl font-semibold mb-4">Manage Departments</h2>

      <input
        type="text"
        placeholder="Search by Department ID or Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full"
      />

      {!addMode && (
        <button
          onClick={() => {
            resetForm();
            setAddMode(true);
          }}
          className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add New Department
        </button>
      )}

      {addMode && (
        <form
          onSubmit={editId ? handleUpdate : handleAdd}
          className="mb-6 space-y-4 border border-gray-300 rounded p-4"
        >
          {validationError && <p className="text-red-600">{validationError}</p>}

          <div>
            <label htmlFor="departmentId" className="block mb-1 font-semibold">
              Department ID (00–99)
            </label>
            <input
              id="departmentId"
              maxLength={2}
              pattern="\d{2}"
              inputMode="numeric"
              title="00 to 99"
              type="text"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="border border-gray-400 rounded px-3 py-2 w-20"
              required
            />
          </div>

          <div>
            <label htmlFor="departmentName" className="block mb-1 font-semibold">
              Department Name
            </label>
            <input
              id="departmentName"
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="border border-gray-400 rounded px-3 py-2 w-full"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              {editId ? "Update Department" : "Add Department"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setAddMode(false);
              }}
              className="ml-4 px-4 py-2 border rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p>Loading departments...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredDepartments.length === 0 ? (
        <p>No departments found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-3 py-2">Department ID</th>
              <th className="border border-gray-300 px-3 py-2">Department Name</th>
              <th className="border border-gray-300 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dep) => (
              <tr key={dep._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-3 py-2">{dep.departmentId}</td>
                <td className="border border-gray-300 px-3 py-2">{dep.name}</td>
                <td className="border border-gray-300 px-3 py-2 space-x-2">
                  <button
                    onClick={() => startEdit(dep)}
                    className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500 mr-2"
                  >
                    Edit
                  </button>
                  {deletePendingId === dep._id ? (
                    <>
                      <button
                        onClick={() => confirmDelete(dep._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
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
                      onClick={() => requestDelete(dep._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
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
    </div>
  );
};

export default ManageDepartments;
