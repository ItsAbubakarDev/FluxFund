import React, { useState } from "react";
import "./signupPage.css"; // Import the CSS file\
import {Link} from "react-router-dom";  

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(""); // Error message

  const passwordValidationRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]).{8,}$/;

  const handleSignup = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
    } else if (!passwordValidationRegex.test(password)) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.");
    } else {
      setError(""); // Clear error if validation passes
      console.log({ fullName, email, password });
      // Perform signup logic here (e.g., API call)
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
              placeholder="Enter your fullname here"
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
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        <div className="login-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p> {/* Updated Link */}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
