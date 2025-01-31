
// export default Login;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {  TextField, Button, Typography } from "@mui/material";
import axios from "axios";
import "../styles/login.scss"; // Import your SCSS file

const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://frontend-take-home-service.fetch.com/auth/login",
        { name, email },
        { withCredentials: true }
      );
      navigate("/search");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  // Toggle the "dark-mode" class on the wrapper
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={darkMode ? "login-wrapper dark-mode" : "login-wrapper"}>
      <div className="login-container">
        {/* Dark Theme Toggle Button */}
        <div className="dark-theme-outer">
        <Button
          variant="contained"
          className="dark-mode-button"
          onClick={toggleDarkMode}
        >
          {darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        </Button>
        </div>

        {/* Login Box */}
        <div className="login-box">
          <Typography variant="h4" className="login-title">
            Login
          </Typography>
          <form className="login-form" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
