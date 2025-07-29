const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Department = require("../models/Department");

const authenticate = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ message: "Unauthorized" });
  // Implement your JWT verification and role check here
  next();
};

// ---------------- Departments -----------------

// List all departments
router.get("/departments", authenticate, async (req, res) => {
  try {
    const departments = await Department.find().sort({ departmentId: 1 }).lean();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Failed to get departments" });
  }
});

// Add department (with departmentId 00-99 unique)
router.post("/departments", authenticate, async (req, res) => {
  let { departmentId, name } = req.body;

  if (!departmentId || !name) {
    return res.status(400).json({ message: "departmentId and name are required" });
  }

  departmentId = departmentId.trim();
  name = name.trim();

  if (!/^\d{2}$/.test(departmentId)) {
    return res.status(400).json({ message: "departmentId must be two digits (00-99)" });
  }

  try {
    // Check uniqueness for id and name (case insensitive for name)
    const existingId = await Department.findOne({ departmentId });
    if (existingId) return res.status(400).json({ message: "Department ID already exists" });

    const existingName = await Department.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existingName) return res.status(400).json({ message: "Department name already exists" });

    const department = new Department({ departmentId, name: name.toUpperCase() });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: "Failed to create department" });
  }
});

// Update department (id and name editable)
router.put("/departments/:id", authenticate, async (req, res) => {
  const { departmentId, name } = req.body;
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });

    // Validate departmentId format if provided
    if (departmentId !== undefined) {
      if (!/^\d{2}$/.test(departmentId)) {
        return res.status(400).json({ message: "departmentId must be two digits (00-99)" });
      }
      // Check uniqueness against other departments
      const existId = await Department.findOne({ departmentId, _id: { $ne: department._id } });
      if (existId) return res.status(400).json({ message: "Department ID already exists" });
      department.departmentId = departmentId;
    }

    if (name !== undefined) {
      const existName = await Department.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
        _id: { $ne: department._id },
      });
      if (existName) return res.status(400).json({ message: "Department name already exists" });

      department.name = name.toUpperCase();
    }

    await department.save();
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: "Failed to update department" });
  }
});

// Delete department (only if no faculty or classes assigned)
router.delete("/departments/:id", authenticate, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });

    // Check if linked to any classes or faculty
    const clsCount = await Class.countDocuments({ department: department.name });
    const facCount = await Faculty.countDocuments({ department: department.name });
    if (clsCount > 0 || facCount > 0) {
      return res.status(400).json({ message: "Cannot delete department assigned to classes/faculty" });
    }

    await Department.deleteOne({ _id: req.params.id });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete department" });
  }
});

// ------------------ Classes -----------------

// Modified to accept department via ID and validate
router.get("/classes", authenticate, async (req, res) => {
  try {
    const classes = await Class.find().populate("facultyId", "name facultyId").lean();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: "Failed to get classes" });
  }
});

router.post("/classes", authenticate, async (req, res) => {
  let { department, className, classId, facultyId } = req.body;

  if (!department || !className || !classId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check that department exists
    const depObj = await Department.findOne({ name: department.toUpperCase() });
    if (!depObj) return res.status(400).json({ message: "Invalid department" });

    // Check classId is unique
    const existingClass = await Class.findOne({ classId });
    if (existingClass) return res.status(400).json({ message: "classId already exists" });

    const newClass = new Class({
      department: depObj.name,
      className,
      classId,
      facultyId: facultyId || null,
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(500).json({ message: "Failed to create class" });
  }
});

router.put("/classes/:id", authenticate, async (req, res) => {
  let { department, className, classId, facultyId } = req.body;
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    if (department) {
      const depObj = await Department.findOne({ name: department.toUpperCase() });
      if (!depObj) return res.status(400).json({ message: "Invalid department" });
      cls.department = depObj.name;
    }

    if (className) cls.className = className;
    if (classId) {
      const existsClassId = await Class.findOne({ classId, _id: { $ne: cls._id } });
      if (existsClassId) return res.status(400).json({ message: "classId already exists" });
      cls.classId = classId;
    }
    cls.facultyId = facultyId || null;

    await cls.save();
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: "Failed to update class" });
  }
});

router.delete("/classes/:id", authenticate, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete class" });
  }
});

// ------------------ Faculty -----------------

router.get("/faculty", authenticate, async (req, res) => {
  try {
    const faculties = await Faculty.find().select("facultyId name department").lean();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: "Failed to get faculty" });
  }
});

router.post("/faculty", authenticate, async (req, res) => {
  let { facultyId, name, department, password } = req.body;

  if (!facultyId || !name || !department || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const depObj = await Department.findOne({ name: department.toUpperCase() });
    if (!depObj) return res.status(400).json({ message: "Invalid department" });

    const existingFaculty = await Faculty.findOne({ facultyId });
    if (existingFaculty) return res.status(400).json({ message: "facultyId already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = new Faculty({
      facultyId,
      name,
      department: depObj.name,
      password: hashedPassword,
    });

    await faculty.save();
    res.status(201).json({ message: "Faculty created" });
  } catch (err) {
    res.status(500).json({ message: "Failed to create faculty" });
  }
});

router.put("/faculty/:id", authenticate, async (req, res) => {
  let { name, department, password } = req.body;
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });

    if (name !== undefined) faculty.name = name;
    if (department !== undefined) {
      const depObj = await Department.findOne({ name: department.toUpperCase() });
      if (!depObj) {
        return res.status(400).json({ message: "Invalid department" });
      }
      faculty.department = depObj.name;
    }
    if (password) {
      faculty.password = await bcrypt.hash(password, 10);
    }

    await faculty.save();
    res.json({ message: "Faculty updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update faculty" });
  }
});

router.delete("/faculty/:id", authenticate, async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete faculty" });
  }
});

module.exports = router;
