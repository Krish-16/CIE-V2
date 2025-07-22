const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }
});

module.exports = mongoose.model("Student", studentSchema);
