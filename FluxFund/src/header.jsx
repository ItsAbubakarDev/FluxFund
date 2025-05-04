import React, { useState } from "react";
import "./Header.css";
import logo from './assets/FluxfundLogo.png';
import { Link } from "react-router-dom";

const Header = () => {
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error("User rejected request", error);
      }
    } else {
      alert("MetaMask not installed. Please install it to connect your wallet.");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} alt="FluxFund Logo" className="header-logo" />
        <nav className="header-nav">
          <Link to="/" className="nav-links-header">Home</Link>
          <Link to="/campaigns" className="nav-links-header">All Campaigns</Link>
          <Link to="/about" className="nav-links-header">About Us</Link>
          <Link to="/contact" className="nav-links-header">Contact Us</Link>
        </nav>
      </div>

      <div className="header-right">
        {walletAddress ? (
          <span className="wallet-address">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        ) : (
          <button className="connect-wallet-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <Link to="/login" className="auth-link-header">Log In</Link>
        <Link to="/signup" className="auth-link-header">Sign Up</Link>
      </div>
    </header>
  );
};

export default Header;