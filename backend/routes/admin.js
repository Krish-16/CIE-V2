const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// --- MODELS -------------------------------------------------
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Department = require("../models/Department"); // New department model

// --- MIDDLEWARE (replace with your real JWT / role check) ---
const authenticateAdmin = (req, res, next) => {
  // Example: verify JWT and ensure req.user.role === "admin"
  // Replace with your real authentication middleware
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized (admin only)" });
  }
  next();
};

//#region ---------- DASHBOARD STATISTICS ------------------
router.get("/stats", authenticateAdmin, async (_req, res) => {
  try {
    const [totalStudents, totalFaculty, pendingStudents] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Student.countDocuments({ approved: false }),
    ]);
    res.json({ totalStudents, totalFaculty, pendingApprovals: pendingStudents });
  } catch (err) {
    res.status(500).json({ message: "Error fetching statistics" });
  }
});
//#endregion

//#region ---------- DEPARTMENT MANAGEMENT -------------------

// Get all departments
router.get("/departments", authenticateAdmin, async (_req, res) => {
  try {
    const departments = await Department.find().lean();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});

// Add a new department
router.post("/departments", authenticateAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Department name required" });

  try {
    // Check if department already exists (case-insensitive)
    const existing = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) return res.status(400).json({ message: "Department already exists" });

    const newDept = new Department({ name: name.toUpperCase().trim() });
    await newDept.save();
    res.status(201).json(newDept);
  } catch (err) {
    res.status(500).json({ message: "Error creating department" });
  }
});
//#endregion

//#region ---------- FACULTY CRUD & MANAGEMENT -------------------
/* GET faculty list (include department, exclude sensitive fields like password) */
router.get("/faculty", authenticateAdmin, async (_req, res) => {
  try {
    const faculties = await Faculty.find()
      .select("facultyId name department") // only expose these fields
      .lean();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: "Error fetching faculty" });
  }
});

/* CREATE a new faculty */
router.post("/faculty", authenticateAdmin, async (req, res) => {
  const { facultyId, name, department, password } = req.body;

  if (!facultyId || !name || !department || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const exists = await Faculty.findOne({ facultyId });
    if (exists) return res.status(400).json({ message: "Faculty with this ID already exists" });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newFaculty = new Faculty({
      facultyId,
      name,
      department: department.toUpperCase().trim(),
      password: hashedPassword,
    });

    await newFaculty.save();
    res.status(201).json({ message: "Faculty created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating faculty" });
  }
});

/* UPDATE a faculty (name, password, department) */
router.put("/faculty/:id", authenticateAdmin, async (req, res) => {
  const { name, password, department } = req.body;

  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    if (name !== undefined) faculty.name = name;
    if (department !== undefined) faculty.department = department.toUpperCase().trim();

    if (password) {
      const saltRounds = 10;
      faculty.password = await bcrypt.hash(password, saltRounds);
    }

    await faculty.save();
    res.json({ message: "Faculty updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating faculty" });
  }
});

/* DELETE a faculty record (optional) */
router.delete("/faculty/:id", authenticateAdmin, async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting faculty" });
  }
});
//#endregion

//#region ---------- STUDENT APPROVAL ROUTES --------------------
router.get("/students", authenticateAdmin, async (_req, res) => {
  try {
    const students = await Student.find().lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

router.patch("/students/:id/approve", authenticateAdmin, async (req, res) => {
  const { approve } = req.body; // boolean
  try {
    await Student.findByIdAndUpdate(req.params.id, { approved: !!approve });
    res.json({ message: "Student approval updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating approval" });
  }
});
//#endregion

//#region ---------- CLASS CRUD ------------------------------
router.get("/classes", authenticateAdmin, async (_req, res) => {
  try {
    const classes = await Class.find().lean();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching classes" });
  }
});

router.post("/classes", authenticateAdmin, async (req, res) => {
  const { department, className, classId, facultyId } = req.body;
  if (!department || !className || !classId)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const exists = await Class.findOne({ classId });
    if (exists) return res.status(400).json({ message: "Class ID already exists" });

    const newClass = new Class({ department, className, classId, facultyId });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: "Error creating class" });
  }
});

router.put("/classes/:id", authenticateAdmin, async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating class" });
  }
});

router.delete("/classes/:id", authenticateAdmin, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting class" });
  }
});
//#endregion

//#region ---------- SUBJECT CRUD ------------------------------
router.get("/subjects", authenticateAdmin, async (_req, res) => {
  try {
    const subjects = await Subject.find().lean();
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subjects" });
  }
});

router.post("/subjects", authenticateAdmin, async (req, res) => {
  const { name, classId } = req.body;
  if (!name || !classId)
    return res.status(400).json({ message: "Missing required fields" });

  try {
    const newSubject = new Subject({ name, classId });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ message: "Error creating subject" });
  }
});

router.put("/subjects/:id", authenticateAdmin, async (req, res) => {
  try {
    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating subject" });
  }
});

router.delete("/subjects/:id", authenticateAdmin, async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting subject" });
  }
});
//#endregion

//#region ---------- ASSIGN FACULTY TO CLASS --------------------
router.post("/assign-faculty-to-class", authenticateAdmin, async (req, res) => {
  const { facultyId, classId } = req.body;
  if (!facultyId || !classId)
    return res.status(400).json({ message: "facultyId and classId are required" });

  try {
    const faculty = await Faculty.findOne({ facultyId });
    const cls = await Class.findOne({ classId });
    if (!faculty || !cls)
      return res.status(404).json({ message: "Faculty or Class not found" });

    cls.facultyId = faculty._id;
    await cls.save();
    res.json({ message: "Faculty assigned to class successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error assigning faculty" });
  }
});
// GET all departments
router.get("/departments", authenticateAdmin, async (_req, res) => {
  try {
    const departments = await Department.find().lean();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});

// POST new department
router.post("/departments", authenticateAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Department name required" });

  try {
    const exists = await Department.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (exists) return res.status(400).json({ message: "Department already exists" });

    const dep = new Department({ name: name.toUpperCase().trim() });
    await dep.save();
    res.status(201).json(dep);
  } catch (err) {
    res.status(500).json({ message: "Error creating department" });
  }
});

//#endregion

module.exports = router;
