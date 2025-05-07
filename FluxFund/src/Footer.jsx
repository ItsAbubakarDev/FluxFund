import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section company-info">
        <img src="/FluxfundLogo.png" alt="FluxFund Logo" className="footerLogo" />
        <p className="description">[Company description here]</p>
      </div>

      <div className="footer-section legal-links">
        <h4>Legal</h4>
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>

      <div className="footer-section social-media">
        <h4>Follow Us</h4>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>

      <div className="footer-section newsletter">
        <h4>Subscribe</h4>
        <input type="email" placeholder="Enter your email" />
      </div>

      <div className="footer-section contact-info">
        <h4>Contact</h4>
        <p>Email: abubakarrashraf20@gmail.com</p>
        <p>Phone: +92-3241552881</p>
      </div>

      <div className="footer-bottom">
        <p>© 2025 YourCompany. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
