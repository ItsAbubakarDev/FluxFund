import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "./contexts/Web3Context";
import "./loginPage.css";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { address, connectWallet } = useWeb3();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      if (!data.token) throw new Error("No token returned from server");

      localStorage.setItem("token", data.token);

      let walletAddress = address;

      // Try silent reconnect if disconnected
      if (!walletAddress && localStorage.getItem("connectedWallet")) {
        try {
          walletAddress = await connectWallet();
        } catch (_) {
          console.warn("Silent wallet reconnect failed");
        }
      }

      // Wallet link only if not already saved
      if (walletAddress && data.user?._id && !data.user.walletAddress) {
        try {
          await axios.patch(
            `http://localhost:5000/api/users/${data.user._id}/wallet`,
            { walletAddress },
            {
              headers: { Authorization: `Bearer ${data.token}` },
            }
          );
        } catch (walletError) {
          console.warn("Wallet linking error (non-blocking):", walletError);
        }
      }

      navigate("/", {
        state: {
          walletConnected: !!walletAddress,
          justLoggedIn: true,
        },
      });
    } catch (err) {
      console.error("Login failed:", err);

      let errorMessage = "Login failed. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message.includes("timeout")) {
        errorMessage = "Server timeout. Please try again.";
      } else if (err.message.includes("Network Error")) {
        errorMessage = "Cannot connect to the server.";
      }

      setError(errorMessage);
      localStorage.removeItem("connectedWallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="logo-container">
          <img src="/FluxfundLogo.png" alt="FluxFund Logo" className="logo" />
        </div>

        <h2 className="login-title">Welcome Back to FluxFund</h2>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError("")} className="error-close">
              ×
            </button>
          </div>
        )}

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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? "⏳ Logging In..." : "Login"}
          </button>
        </form>

        <div className="signup-link">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
