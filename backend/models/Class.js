const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  termYear: { type: String, required: true },     // e.g., "2025-26"
  department: { type: String, required: true },   // e.g., "DCE"
  semester: { type: Number, required: true },     // e.g., 1, 2, etc.
  className: { type: String, required: true },
  classId: { type: String, required: true },      // Remove `unique: true` here
  facultyId: {                                     
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty",
    default: null,
  },
});

// This compound index allows same classId for different semesters, but unique per pair
classSchema.index({ classId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);
