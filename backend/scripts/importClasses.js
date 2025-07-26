const mongoose = require("mongoose");
const Class = require("../models/Class"); // Adjust path if needed

const termYear = "2025-26";
const departments = ["IT", "CE", "CSE"];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const classes = [];

// Unified function to add classes for all departments uniformly
function addClassesUniform() {
  departments.forEach((dept) => {
    semesters.forEach((sem) => {
      for (let classNum = 1; classNum <= 2; classNum++) {
        const className = `${sem}${dept}${classNum}`;
        const classId = className;
        classes.push({
          termYear,
          department: dept,
          semester: sem,
          className,
          classId,
        });
      }
    });
  });
}

addClassesUniform();

async function importClasses() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/loginSystem", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB.");

    // Clear existing classes
    await Class.deleteMany({});

    // Insert new class data
    await Class.insertMany(classes);

    console.log("Classes imported successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error importing classes:", err);
    process.exit(1);
  }
}

importClasses();
