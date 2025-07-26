import React, { useEffect, useState } from "react";

const ManageClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDept, setExpandedDept] = useState(null);

  // Inline edit state - currently edited class id; reuse form states for values
  const [inlineEditId, setInlineEditId] = useState(null);

  // State for delete confirmation inline
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Notification messages {type: "success" | "error", message: string}
  const [notification, setNotification] = useState(null);

  // Messages for inline edit form success/errors
  const [message, setMessage] = useState("");

  // Filter states
  const [termYears, setTermYears] = useState([]);
  const [selectedTermYear, setSelectedTermYear] = useState("");
  const [selectedSemType, setSelectedSemType] = useState("Odd"); // or "Even"

  // Search state
  const [searchClassId, setSearchClassId] = useState("");
  // Add form toggle state
  const [isAdding, setIsAdding] = useState(false);

  // Add form input states
  const [addDepartment, setAddDepartment] = useState("");
  const [addClassName, setAddClassName] = useState("");
  const [addClassId, setAddClassId] = useState("");
  const [addError, setAddError] = useState("");

  // Other controlled form states for inline editing
  const [department, setDepartment] = useState("");
  const [className, setClassName] = useState("");
  const [classId, setClassId] = useState("");
  const [editId, setEditId] = useState(null);

  // Auto dismiss notifications
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost:5000/api/admin/classes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load classes");
        return res.json();
      })
      .then((data) => {
        const uniqueClassesMap = new Map();
        data.forEach((cls) => {
          if (!uniqueClassesMap.has(cls.classId)) uniqueClassesMap.set(cls.classId, cls);
        });

        const uniqueClasses = Array.from(uniqueClassesMap.values());
        setClasses(uniqueClasses);

        const years = [...new Set(uniqueClasses.map((c) => c.termYear))].sort();
        setTermYears(years);
        if (years.length > 0 && !selectedTermYear) setSelectedTermYear(years[0]);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load classes");
        setLoading(false);
      });
  };

  // Reset add/edit forms and states
  const resetForm = () => {
    setAddDepartment("");
    setAddClassName("");
    setAddClassId("");
    setAddError("");
    setMessage("");
    setError("");
    setEditId(null);
    setDepartment("");
    setClassName("");
    setClassId("");
    setInlineEditId(null);
  };

  // Toggle add new class form visibility
  const toggleAddForm = () => {
    setIsAdding((prev) => !prev);
    setAddError("");
    setAddDepartment("");
    setAddClassName("");
    setAddClassId("");
    setMessage("");
    setError("");
    setInlineEditId(null);
    setSearchClassId("");
  };

  // Submit new class from add form
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");

    if (!addDepartment.trim() || !addClassName.trim() || !addClassId.trim()) {
      setAddError("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          department: addDepartment.trim(),
          className: addClassName.trim(),
          classId: addClassId.trim(),
          termYear: selectedTermYear,
          // semester could be added here if needed; omitted for simplicity
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add class");
      }
      showNotification("success", "Class added successfully!");
      setIsAdding(false);
      setAddDepartment("");
      setAddClassName("");
      setAddClassId("");
      fetchClasses();
    } catch (err) {
      setAddError(err.message || "Error adding class");
    }
  };

  // Start inline editing of a row
  const startInlineEdit = (cls) => {
    setInlineEditId(cls._id);
    setEditId(cls._id);
    setDepartment(cls.department);
    setClassName(cls.className);
    setClassId(cls.classId);
    setMessage("");
    setError("");
    setIsAdding(false);
    setSearchClassId("");
  };

  // Cancel inline editing
  const cancelInlineEdit = () => {
    setInlineEditId(null);
    resetForm();
  };

  // Save inline edited class
  const handleSaveInlineEdit = async () => {
    if (!className.trim() || !classId.trim()) {
      showNotification("error", "Class Name and Class ID cannot be empty.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/admin/classes/${inlineEditId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ department, className, classId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update class");
      showNotification("success", "Class updated successfully!");
      setInlineEditId(null);
      resetForm();
      fetchClasses();
    } catch (err) {
      showNotification("error", err.message || "Error updating class");
    }
  };

  // Confirm delete of a class
  const confirmDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/classes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete");
      }
      showNotification("success", "Class deleted successfully!");
      setDeleteConfirmId(null);
      fetchClasses();
    } catch (err) {
      showNotification("error", err.message || "Error deleting class");
    }
  };

  // Toggle department expansion
  const toggleDepartment = (dept) => {
    setExpandedDept(expandedDept === dept ? null : dept);
  };

  // Filter classes depending on search or filters
  const filteredClasses = classes.filter((cls) => {
    if (!cls.termYear || !cls.semester) return false;
    if (cls.termYear !== selectedTermYear) return false;

    if (searchClassId.trim()) {
      return cls.classId.toLowerCase().includes(searchClassId.toLowerCase());
    }

    const isOddSem = cls.semester % 2 === 1;
    if (selectedSemType === "Odd" && !isOddSem) return false;
    if (selectedSemType === "Even" && isOddSem) return false;

    return true;
  });

  // Group classes by department (only when NOT searching)
  const grouped = !searchClassId.trim()
    ? filteredClasses.reduce((acc, cls) => {
        if (!acc[cls.department]) acc[cls.department] = [];
        acc[cls.department].push(cls);
        return acc;
      }, {})
    : {};

  const departments = Object.keys(grouped).sort();

  // Sort classes within each department by semester then className
  departments.forEach((dept) => {
    grouped[dept].sort((a, b) => {
      if (a.semester !== b.semester) return a.semester - b.semester;
      return a.className.localeCompare(b.className);
    });
  });

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow relative">
      {/* Notification popup */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded shadow-md z-50 ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-600 text-white"
          }`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Manage Classes</h2>

      {/* Filters, Search, and Add Button */}
      <div className="flex flex-wrap items-center space-x-4 mb-6">
        {/* Term Year */}
        <div>
          <label htmlFor="termYear" className="font-semibold mr-2">
            Term Year:
          </label>
          <select
            id="termYear"
            value={selectedTermYear}
            onChange={(e) => {
              setSelectedTermYear(e.target.value);
              setExpandedDept(null);
              setSearchClassId("");
              setIsAdding(false);
              setInlineEditId(null);
            }}
            className="border rounded p-2"
          >
            {termYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Type */}
        <div>
          <label htmlFor="semType" className="font-semibold mr-2">
            Semester Type:
          </label>
          <select
            id="semType"
            value={selectedSemType}
            onChange={(e) => {
              setSelectedSemType(e.target.value);
              setExpandedDept(null);
              setSearchClassId("");
              setIsAdding(false);
              setInlineEditId(null);
            }}
            className="border rounded p-2"
            disabled={searchClassId.trim().length > 0}
          >
            <option value="Odd">Odd Semesters</option>
            <option value="Even">Even Semesters</option>
          </select>
        </div>

        {/* Search bar + Add button layout */}
        <div className="flex items-center space-x-2 ml-auto w-full max-w-md">
          <input
            type="text"
            placeholder="Search by Class ID"
            className="flex-grow p-2 border rounded outline-none"
            value={searchClassId}
            onChange={(e) => {
              setSearchClassId(e.target.value);
              setExpandedDept(null);
              setIsAdding(false);
              setInlineEditId(null);
            }}
            aria-label="Search classes by class ID"
          />
          <button
            type="button"
            onClick={() => {
              setIsAdding((prev) => !prev);
              setSearchClassId("");
              setExpandedDept(null);
              setInlineEditId(null);
            }}
            aria-label={isAdding ? "Close add form" : "Add new class"}
            title={isAdding ? "Close add form" : "Add new class"}
            className="rounded-full border border-gray-400 w-10 h-10 flex items-center justify-center text-xl font-bold hover:border-blue-600 hover:text-blue-600 transition-colors select-none"
          >
            {isAdding ? "×" : "+"}
          </button>
        </div>
      </div>

      {/* Inline Add Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="mb-6 space-y-3 border border-gray-300 rounded p-4 max-w-md"
          aria-label="Add new class form"
        >
          {addError && <p className="text-red-600">{addError}</p>}
          <div>
            <label className="font-semibold block mb-1" htmlFor="addDepartment">
              Department:
            </label>
            <input
              id="addDepartment"
              type="text"
              value={addDepartment}
              onChange={(e) => setAddDepartment(e.target.value)}
              placeholder="e.g., IT, CE, CSE"
              className="w-full p-2 border rounded"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1" htmlFor="addClassName">
              Class Name:
            </label>
            <input
              id="addClassName"
              type="text"
              value={addClassName}
              onChange={(e) => setAddClassName(e.target.value)}
              placeholder="e.g., 1IT1, 3CE2"
              className="w-full p-2 border rounded"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="font-semibold block mb-1" htmlFor="addClassId">
              Class ID:
            </label>
            <input
              id="addClassId"
              type="text"
              value={addClassId}
              onChange={(e) => setAddClassId(e.target.value)}
              placeholder="Unique class identifier"
              className="w-full p-2 border rounded"
              autoComplete="off"
            />
          </div>

          <div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-4"
            >
              Add Class
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setAddError("");
              }}
              className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Results or grouped view */}
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : searchClassId.trim() ? (
        filteredClasses.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No classes match your search.</div>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border border-gray-300">Department</th>
                <th className="p-2 border border-gray-300">Semester</th>
                <th className="p-2 border border-gray-300">Class Name</th>
                <th className="p-2 border border-gray-300">Class ID</th>
                <th className="p-2 border border-gray-300">Faculty Assigned</th>
                <th className="p-2 border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((cls) =>
                inlineEditId === cls._id ? (
                  <tr key={cls._id} className="bg-yellow-50">
                    <td className="border p-2">{cls.department}</td>
                    <td className="border p-2">{cls.semester}</td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={classId}
                        onChange={(e) => setClassId(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </td>
                    <td className="border p-2">
                      {cls.facultyId && typeof cls.facultyId === "object"
                        ? `${cls.facultyId.name} (${cls.facultyId.facultyId})`
                        : "-"}
                    </td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={handleSaveInlineEdit}
                        className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelInlineEdit}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={cls._id} className="hover:bg-gray-100">
                    <td className="border p-2">{cls.department}</td>
                    <td className="border p-2">{cls.semester}</td>
                    <td className="border p-2">{cls.className}</td>
                    <td className="border p-2">{cls.classId}</td>
                    <td className="border p-2">
                      {cls.facultyId && typeof cls.facultyId === "object"
                        ? `${cls.facultyId.name} (${cls.facultyId.facultyId})`
                        : "-"}
                    </td>
                    <td className="border p-2 text-center">
                      {deleteConfirmId === cls._id ? (
                        <>
                          <span>Confirm?</span>
                          <button
                            onClick={() => confirmDelete(cls._id)}
                            className="ml-2 px-2 py-1 bg-red-700 text-white rounded"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="ml-2 px-2 py-1 bg-gray-400 rounded"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startInlineEdit(cls)}
                            className="mr-2 px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(cls._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )
      ) : (
        <>
          {departments.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              No classes found for selected term & semester type.
            </div>
          ) : (
            departments.map((dept) => (
              <div key={dept} className="mb-8">
                <div
                  className={`flex justify-between items-center cursor-pointer rounded px-4 py-3 border border-gray-300 hover:bg-blue-100 transition-colors duration-200 ${
                    expandedDept === dept ? "bg-blue-200 font-semibold" : "bg-gray-100"
                  }`}
                  onClick={() => toggleDepartment(dept)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleDepartment(dept);
                  }}
                  role="button"
                  aria-expanded={expandedDept === dept}
                >
                  <span className="text-lg">{dept} Department</span>
                  <span className="text-xl select-none">{expandedDept === dept ? "–" : "+"}</span>
                </div>

                {expandedDept === dept && (
                  <table className="w-full border-collapse border border-gray-300 mt-2">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-2 border border-gray-300">Semester</th>
                        <th className="p-2 border border-gray-300">Class Name</th>
                        <th className="p-2 border border-gray-300">Class ID</th>
                        <th className="p-2 border border-gray-300">Faculty Assigned</th>
                        <th className="p-2 border border-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grouped[dept].map((cls) =>
                        inlineEditId === cls._id ? (
                          <tr key={cls._id} className="bg-yellow-50">
                            <td className="border p-2">{cls.semester}</td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="border p-1 rounded w-full"
                              />
                            </td>
                            <td className="border p-2">
                              <input
                                type="text"
                                value={classId}
                                onChange={(e) => setClassId(e.target.value)}
                                className="border p-1 rounded w-full"
                              />
                            </td>
                            <td className="border p-2">
                              {cls.facultyId && typeof cls.facultyId === "object"
                                ? `${cls.facultyId.name} (${cls.facultyId.facultyId})`
                                : "-"}
                            </td>
                            <td className="border p-2 text-center">
                              <button
                                onClick={handleSaveInlineEdit}
                                className="mr-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelInlineEdit}
                                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ) : (
                          <tr key={cls._id} className="hover:bg-gray-100">
                            <td className="border p-2">{cls.semester}</td>
                            <td className="border p-2">{cls.className}</td>
                            <td className="border p-2">{cls.classId}</td>
                            <td className="border p-2">
                              {cls.facultyId && typeof cls.facultyId === "object"
                                ? `${cls.facultyId.name} (${cls.facultyId.facultyId})`
                                : "-"}
                            </td>
                            <td className="border p-2 text-center">
                              {deleteConfirmId === cls._id ? (
                                <>
                                  <span>Confirm?</span>
                                  <button
                                    onClick={() => confirmDelete(cls._id)}
                                    className="ml-2 px-2 py-1 bg-red-700 text-white rounded"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="ml-2 px-2 py-1 bg-gray-400 rounded"
                                  >
                                    No
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startInlineEdit(cls)}
                                    className="mr-2 px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(cls._id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

export default ManageClasses;
