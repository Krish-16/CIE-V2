import React, { useEffect, useState } from "react";

const AssignFaculty = () => {
  const [departments, setDepartments] = useState([]);
  const [classList, setClassList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch all classes and faculties on mount
  useEffect(() => {
    // Fetch classes
    fetch("http://localhost:5000/api/admin/classes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch classes");
        return res.json();
      })
      .then((data) => {
        setClassList(data);

        // Extract unique departments
        const uniqueDeps = [
          ...new Set(data.map((cls) => cls.department)),
        ].sort();
        setDepartments(uniqueDeps);
      })
      .catch((err) => setError(err.message));

    // Fetch faculty members
    fetch("http://localhost:5000/api/admin/faculty", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch faculty list");
        return res.json();
      })
      .then(setFacultyList)
      .catch((err) => setError(err.message));
  }, []);

  // Filter classes when department changes
  useEffect(() => {
    if (!selectedDepartment) {
      setFilteredClasses([]);
      setSelectedClass("");
      return;
    }
    const filtered = classList.filter(
      (cls) => cls.department === selectedDepartment
    );
    setFilteredClasses(filtered);
    setSelectedClass(""); // reset class selection
  }, [selectedDepartment, classList]);

  const handleAssign = async () => {
    setMessage("");
    setError("");

    if (!selectedDepartment) {
      setError("Please select a department");
      return;
    }
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }
    if (!selectedFaculty) {
      setError("Please select a faculty");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/assign-faculty-to-class",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            facultyId: selectedFaculty,
            classId: selectedClass,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Assignment failed");
      }
      setMessage("Faculty assigned to class successfully!");
      // Reset selections if needed
      setSelectedDepartment("");
      setSelectedClass("");
      setSelectedFaculty("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-6">Assign Faculty to Class</h2>

      {error && (
        <p className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</p>
      )}
      {message && (
        <p className="mb-4 p-2 bg-green-100 text-green-700 rounded">{message}</p>
      )}

      {/* Department Select */}
      <label htmlFor="departmentSelect" className="block mb-2 font-medium">
        Select Department
      </label>
      <select
        id="departmentSelect"
        className="w-full p-2 mb-4 border rounded"
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
      >
        <option value="">-- Choose Department --</option>
        {departments.map((dep) => (
          <option key={dep} value={dep}>
            {dep}
          </option>
        ))}
      </select>

      {/* Class Select (filtered by department) */}
      <label htmlFor="classSelect" className="block mb-2 font-medium">
        Select Class
      </label>
      <select
        id="classSelect"
        className="w-full p-2 mb-4 border rounded"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        disabled={!selectedDepartment}
      >
        <option value="">-- Choose Class --</option>
        {filteredClasses.map((cls) => (
          <option key={cls._id} value={cls.classId}>
            {cls.className} ({cls.classId})
          </option>
        ))}
      </select>

      {/* Faculty Select */}
      <label htmlFor="facultySelect" className="block mb-2 font-medium">
        Select Faculty
      </label>
      <select
        id="facultySelect"
        className="w-full p-2 mb-6 border rounded"
        value={selectedFaculty}
        onChange={(e) => setSelectedFaculty(e.target.value)}
      >
        <option value="">-- Choose Faculty --</option>
        {facultyList.map((f) => (
          <option key={f._id} value={f.facultyId}>
            {f.name} ({f.facultyId})
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
      >
        Assign Faculty
      </button>
    </div>
  );
};

export default AssignFaculty;
