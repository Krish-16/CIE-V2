const mongoose = require("mongoose");
const Department = require("../models/Department"); // Adjust the path as per your project structure

async function importDepartments() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/loginSystem"); // Update your MongoDB URL as needed

    const departments = [
      { departmentId: "00", name: "DIT" },
      { departmentId: "01", name: "DCS" },
      { departmentId: "02", name: "DCE" },
    ];

    // Remove existing departments to avoid duplicates (optional)
    await Department.deleteMany({});

    // Insert
    await Department.insertMany(departments);

    console.log("Departments imported successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error importing departments:", err);
    process.exit(1);
  }
}

importDepartments();
