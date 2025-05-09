import React, { useState } from "react";
import "./signupPage.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordValidationRegex.test(password)) {
      setError("Password must include uppercase, lowercase, number, special character and be 8+ chars.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/signup", {
        fullName,
        email,
        password
      });

      setSuccess("Signup successful!");
      setError("");
      localStorage.setItem("token", response.data.token); // optional

      // Clear form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/"); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="logo-container">
          <img src="/FluxfundLogo.png" alt="FluxFund Logo" className="logo" />
        </div>
        <h2 className="signup-title">Create an Account</h2>

        {error && <p className="error-message">{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label className="input-label" htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="input-field"
              placeholder="Enter your full name"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="Enter password"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-field"
              placeholder="Confirm password"
            />
          </div>
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="login-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;