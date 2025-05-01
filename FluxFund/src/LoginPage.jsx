import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link component
import "./loginPage.css"; // Import the CSS file

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // For error messages

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login (replace with your login logic)
    if (email === "" || password === "") {
      setError("Please enter both email and password.");
    } else {
      console.log({ email, password });
      // Redirect or perform login action here
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Logo */}
        <div className="logo-container">
          <img src="/FluxfundLogo.png" alt="FluxFund Logo" className="logo" />
        </div>

        <h2 className="login-title">Welcome Back to FluxFund</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
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
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>

        {/* Signup reference */}
        <div className="signup-link">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p> {/* Updated Link */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
