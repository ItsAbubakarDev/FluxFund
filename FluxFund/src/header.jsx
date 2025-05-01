// Header.jsx
import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <img src="/FluxfundLogo.png" alt="Logo" className="logo" />
        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/campaigns">All Campaigns</Link>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
        </nav>
      </div>
      <div className="header-right">
        <Link to="/login" className="auth-link">Log In</Link>
        <Link to="/signup" className="auth-link">Sign Up</Link>
      </div>
    </header>
  );
};

export default Header;
