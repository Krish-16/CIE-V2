const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  departmentId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => /^\d{2}$/.test(v),
      message: (props) => `${props.value} is not a valid 2-digit numeric id!`,
    },
  },
  name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Department", departmentSchema);
