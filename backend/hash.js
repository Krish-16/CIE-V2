const bcrypt = require("bcryptjs");

const plainPassword = "secret123"; // change this to whatever you want
bcrypt.hash(plainPassword, 10).then((hash) => {
  console.log("Hashed password:", hash);
});
