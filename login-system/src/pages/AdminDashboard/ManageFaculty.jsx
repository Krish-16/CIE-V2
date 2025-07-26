import React, { useEffect, useState } from "react";

const ManageFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Search and UI form toggles
  const [searchId, setSearchId] = useState("");
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);

  // Add department state
  const [newDepartment, setNewDepartment] = useState("");

  // Add faculty state
  const [addFacultyId, setAddFacultyId] = useState("");
  const [addFacultyName, setAddFacultyName] = useState("");
  const [addFacultyPassword, setAddFacultyPassword] = useState("");
  const [addFacultyDepartment, setAddFacultyDepartment] = useState("");
  const [addFacultyError, setAddFacultyError] = useState("");

  // Edit state
  const [editFacultyId, setEditFacultyId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [editedPassword, setEditedPassword] = useState("");

  // Expanded department for grouped view
  const [expandedDept, setExpandedDept] = useState(null);

  // Notification {type: "success" | "error", message: string}
  const [notification, setNotification] = useState(null);

  // Show notification and auto-dismiss after 4 seconds
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchDepartments();
    fetchFacultyList();
  }, []);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/departments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to load departments");
      const data = await res.json();
      const sorted = data.map((dep) => dep.name).sort();
      setDepartments(sorted);
      setLoadingDepartments(false);
    } catch (err) {
      setError(err.message || "Error loading departments");
      setLoadingDepartments(false);
    }
  };

  const fetchFacultyList = async () => {
    setLoadingFaculty(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch faculty list");
      const data = await res.json();
      setFacultyList(data);
      setLoadingFaculty(false);
    } catch (err) {
      setError(err.message || "Failed to load faculty");
      setLoadingFaculty(false);
    }
  };

  // Filter faculty by searchId (case-insensitive)
  const filteredFaculty = searchId.trim()
    ? facultyList.filter((fac) =>
        fac.facultyId.toLowerCase().includes(searchId.toLowerCase())
      )
    : null;

  // Group faculty by department (only when NOT searching)
  const groupedFaculty = !searchId.trim()
    ? departments.reduce((acc, dept) => {
        acc[dept] = facultyList.filter((fac) => fac.department === dept);
        return acc;
      }, {})
    : {};

  const toggleDepartment = (dept) => {
    setExpandedDept(expandedDept === dept ? null : dept);
  };

  const startEdit = (faculty) => {
    setEditFacultyId(faculty._id);
    setEditedName(faculty.name || "");
    setEditedPassword("");
    setMessage("");
    setError("");
  };

  const cancelEdit = () => {
    setEditFacultyId(null);
    setEditedName("");
    setEditedPassword("");
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      setError("Name cannot be empty");
      return;
    }
    const payload = {
      name: editedName,
      ...(editedPassword ? { password: editedPassword } : {}),
    };
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/faculty/${editFacultyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update faculty");
      }
      showNotification("success", "Faculty updated successfully!");
      cancelEdit();
      fetchFacultyList();
    } catch (err) {
      setError(err.message || "Failed to update faculty");
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      setError("Department name cannot be empty");
      return;
    }
    const depName = newDepartment.trim().toUpperCase();

    try {
      const res = await fetch("http://localhost:5000/api/admin/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name: depName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add department");
      }
      showNotification("success", `Department '${depName}' added`);
      setNewDepartment("");
      setShowAddDepartment(false);
      fetchDepartments();
    } catch (err) {
      setError(err.message || "Error adding department");
    }
  };

  // --- Add faculty handlers ---
  const openAddFaculty = () => {
    setShowAddFaculty(true);
    setAddFacultyId("");
    setAddFacultyName("");
    setAddFacultyPassword("");
    setAddFacultyDepartment("");
    setAddFacultyError("");
    setEditFacultyId(null);
    setShowAddDepartment(false);
  };
  const cancelAddFaculty = () => {
    setShowAddFaculty(false);
    setAddFacultyId("");
    setAddFacultyName("");
    setAddFacultyPassword("");
    setAddFacultyDepartment("");
    setAddFacultyError("");
  };
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (
      !addFacultyId.trim() ||
      !addFacultyName.trim() ||
      !addFacultyDepartment.trim() ||
      !addFacultyPassword
    ) {
      setAddFacultyError("All fields are required.");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/admin/faculty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          facultyId: addFacultyId.trim(),
          name: addFacultyName.trim(),
          department: addFacultyDepartment.trim(),
          password: addFacultyPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add faculty");
      showNotification("success", "Faculty added successfully!");
      cancelAddFaculty();
      fetchFacultyList();
    } catch (err) {
      setAddFacultyError(err.message || "Failed to add faculty");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded shadow relative">
      {/* Notification popup */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-md z-50 ${
            notification.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-700 text-white"
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Faculty</h2>
        <div className="flex items-center space-x-4">
          <button
            aria-label={showAddDepartment ? "Close add department form" : "Add department"}
            title={showAddDepartment ? "Close add department form" : "Add department"}
            onClick={() => {
              setError("");
              setMessage("");
              setNewDepartment("");
              setShowAddFaculty(false);
              setShowAddDepartment((prev) => !prev);
            }}
            className="rounded-full w-8 h-8 flex items-center justify-center border border-gray-400 hover:border-blue-600 hover:text-blue-600 text-xl font-bold select-none"
          >
            {showAddDepartment ? "×" : "+"}
          </button>
        </div>
      </div>

      {/* Search bar and Add Faculty Button */}
      <div className="mb-6 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search by Faculty ID"
          value={searchId}
          onChange={(e) => {
            setSearchId(e.target.value);
            setExpandedDept(null); // collapse all depts when searching
            setShowAddFaculty(false);
          }}
          className="w-64 border border-gray-400 rounded px-3 py-2"
          aria-label="Search faculty by ID"
        />
        <button
          type="button"
          aria-label={showAddFaculty ? "Close add faculty form" : "Add new faculty"}
          title={showAddFaculty ? "Close add faculty form" : "Add new faculty"}
          onClick={showAddFaculty ? cancelAddFaculty : openAddFaculty}
          className="ml-2 rounded-full border border-gray-400 w-9 h-9 flex items-center justify-center text-xl font-bold hover:border-blue-600 hover:text-blue-600 select-none"
        >
          {showAddFaculty ? "×" : "+"}
        </button>
      </div>

      {/* Add department inline form */}
      {showAddDepartment && (
        <div className="mb-4 flex space-x-2 items-center max-w-md">
          <input
            type="text"
            placeholder="New Department Abbreviation"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            className="border border-gray-400 rounded px-3 py-1 flex-grow"
            aria-label="New Department Abbreviation"
          />
          <button
            onClick={handleAddDepartment}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddDepartment(false)}
            className="text-gray-600 underline underline-offset-2 px-3 py-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Add Faculty inline form */}
      {showAddFaculty && (
        <form
          className="mb-6 space-y-2 border border-gray-300 rounded p-4 max-w-xl"
          onSubmit={handleAddFaculty}
        >
          {addFacultyError && <p className="text-red-600">{addFacultyError}</p>}
          <div className="flex items-center space-x-2">
            <label className="w-28 font-semibold">Faculty ID:</label>
            <input
              type="text"
              value={addFacultyId}
              onChange={(e) => setAddFacultyId(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1 w-44"
              autoComplete="off"
            />
            <label className="w-20 font-semibold ml-4">Name:</label>
            <input
              type="text"
              value={addFacultyName}
              onChange={(e) => setAddFacultyName(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1 w-44"
              autoComplete="off"
            />
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <label className="w-28 font-semibold">Department:</label>
            <select
              value={addFacultyDepartment}
              onChange={(e) => setAddFacultyDepartment(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1 w-44"
            >
              <option value="">Select</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <label className="w-20 font-semibold ml-4">Password:</label>
            <input
              type="password"
              value={addFacultyPassword}
              onChange={(e) => setAddFacultyPassword(e.target.value)}
              className="border border-gray-400 rounded px-3 py-1 w-44"
              autoComplete="new-password"
            />
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Add Faculty
            </button>
            <button
              type="button"
              onClick={cancelAddFaculty}
              className="px-4 py-1 rounded border text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Loading/Error */}
      {(loadingDepartments || loadingFaculty) && <p>Loading...</p>}
      {error && (
        <p className="text-red-600 font-semibold mb-4 whitespace-pre-line">{error}</p>
      )}

      {/* Faculty list */}
      {searchId.trim() ? (
        filteredFaculty.length === 0 ? (
          <p className="italic text-gray-600">No faculty found matching "{searchId}".</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-2">Faculty ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Department</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaculty.map((faculty) =>
                editFacultyId === faculty._id ? (
                  <tr key={faculty._id} className="bg-yellow-50">
                    <td className="border p-2">{faculty.facultyId}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border p-2">{faculty.department}</td>
                    <td className="border p-2">
                      <input
                        type="password"
                        placeholder="New password"
                        value={editedPassword}
                        onChange={(e) => setEditedPassword(e.target.value)}
                        className="border p-1 rounded w-full mb-2"
                        autoComplete="new-password"
                      />
                      <button
                        onClick={handleSave}
                        className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
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
                  <tr key={faculty._id} className="hover:bg-gray-50">
                    <td className="border p-2">{faculty.facultyId}</td>
                    <td className="border p-2">{faculty.name}</td>
                    <td className="border p-2">{faculty.department}</td>
                    <td className="border p-2">
                      <button
                        onClick={() => startEdit(faculty)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )
      ) : (
        departments.map((dept) => {
          const facultyForDept = groupedFaculty[dept] || [];
          const isExpanded = expandedDept === dept;
          return (
            <div key={dept} className="mb-6">
              <div
                onClick={() => toggleDepartment(dept)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleDepartment(dept);
                }}
                tabIndex={0}
                role="button"
                aria-expanded={isExpanded}
                className={`cursor-pointer select-none rounded px-4 py-3 border border-gray-300 
                  flex justify-between items-center 
                  hover:bg-blue-100 transition-colors duration-200 
                  ${isExpanded ? "bg-blue-200 font-semibold" : "bg-gray-100"}`}
              >
                <span>{dept} Department</span>
                <span className="text-xl">{isExpanded ? "−" : "+"}</span>
              </div>

              {isExpanded && (
                <>
                  {facultyForDept.length === 0 ? (
                    <p className="italic text-gray-500 mt-2 pl-4">No faculty found.</p>
                  ) : (
                    <table className="w-full border-collapse border border-gray-300 mt-2">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="border p-2">Faculty ID</th>
                          <th className="border p-2">Name</th>
                          <th className="border p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {facultyForDept.map((faculty) =>
                          editFacultyId === faculty._id ? (
                            <tr key={faculty._id} className="bg-yellow-50">
                              <td className="border p-2">{faculty.facultyId}</td>
                              <td className="border p-2">
                                <input
                                  type="text"
                                  value={editedName}
                                  onChange={(e) => setEditedName(e.target.value)}
                                  className="border p-1 rounded w-full"
                                />
                              </td>
                              <td className="border p-2">
                                <input
                                  type="password"
                                  placeholder="New password"
                                  value={editedPassword}
                                  onChange={(e) => setEditedPassword(e.target.value)}
                                  className="border p-1 rounded w-full mb-2"
                                  autoComplete="new-password"
                                />
                                <button
                                  onClick={handleSave}
                                  className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
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
                            <tr key={faculty._id} className="hover:bg-gray-50">
                              <td className="border p-2">{faculty.facultyId}</td>
                              <td className="border p-2">{faculty.name}</td>
                              <td className="border p-2">
                                <button
                                  onClick={() => startEdit(faculty)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                >
                                  Edit
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ManageFaculty;
