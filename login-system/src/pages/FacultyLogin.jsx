import React, { useState } from "react";
import LoginCard from "../components/LoginCard";

const FacultyLogin = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password, role: "faculty" }),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/faculty-dashboard";
    } else {
      alert(data.message || "Login failed");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "url('https://i.postimg.cc/QMvRwF9r/IMG-1611-jpg.jpg')",
      }}
    >
      <LoginCard
        title="EZCIE Faculty Portal"
        subtitle="Faculty, please sign in."
        idPlaceholder="Faculty ID"
        passwordPlaceholder="Password"
        buttonText="Sign In"
        id={id}
        setId={setId}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
      />
    </div>
  );
};

export default FacultyLogin;
