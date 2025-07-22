const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const router = express.Router();

const generateToken = (user, role) => {
  return jwt.sign({ id: user._id, role }, "secretkey", { expiresIn: "1h" });
};

// LOGIN route
router.post("/login", async (req, res) => {
  const { id, password, role } = req.body;

  try {
    let userModel, idField;
    if (role === "admin") {
      userModel = Admin;
      idField = "adminId";
    } else if (role === "faculty") {
      userModel = Faculty;
      idField = "facultyId";
    } else if (role === "student") {
      userModel = Student;
      idField = "studentId";
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await userModel.findOne({ [idField]: id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = generateToken(user, role);
    res.json({ token, user: { id: user[idField], role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// REGISTER (only for students)
router.post("/register-student", async (req, res) => {
  const { studentId, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const student = new Student({ studentId, password: hashed });
    await student.save();
    res.status(201).json({ message: "Registered. Awaiting approval." });
  } catch (err) {
    res.status(500).json({ message: "Error registering student" });
  }
});

module.exports = router;
