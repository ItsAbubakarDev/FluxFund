// Header.jsx
import React from "react";
import "./Header.css";
import logo from './assets/FluxfundLogo.png';
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
          <img src={logo} alt="FluxFund Logo" className="header-logo" />
          <nav className="header-nav">
            <Link to="/" className="nav-links-header" >Home</Link>
            <Link to="/campaigns" className="nav-links-header" >All Campaigns</Link>
            <Link to="/about" className="nav-links-header" >About Us</Link>
            <Link to="/contact" className="nav-links-header" >Contact Us</Link>
          </nav>
      </div>
      <div className="header-right">
        <Link to="/login" className="auth-link-header">Log In</Link>
        <Link to="/signup" className="auth-link-header">Sign Up</Link>
      </div>
    </header>
  );
};

export default Header;
