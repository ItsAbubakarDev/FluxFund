import React from "react";
import "./Header.css";
import logo from './assets/FluxfundLogo.png';
import { Link } from "react-router-dom";
import { useWeb3 } from "./contexts/Web3Context"; // New import

const Header = () => {
  // Replace local state with context hook
  const { address, connectWallet } = useWeb3();

  return (
    <header className="header">
      <div className="header-left">
        <a href="/">
          <img src={logo} alt="FluxFund Logo" className="header-logo" />
        </a>
        <nav className="header-nav">
          <Link to="/" className="nav-links-header">Home</Link>
          <Link to="/campaigns" className="nav-links-header">All Campaigns</Link>
          <Link to="/about" className="nav-links-header">About Us</Link>
          <Link to="/contact" className="nav-links-header">Contact Us</Link>
        </nav>
      </div>

      <div className="header-right">
        {/* Wallet connection section - only changed implementation */}
        {address ? (
          <span className="wallet-address">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
        ) : (
          <button 
            className="connect-wallet-button" 
            onClick={connectWallet}
          >
            🔗 Connect Wallet
          </button>
        )}
        
        {/* Auth links remain unchanged */}
        <Link to="/login" className="auth-link-header">Log In</Link>
        <Link to="/signup" className="auth-link-header">Sign Up</Link>
      </div>
    </header>
  );
};

export default Header;