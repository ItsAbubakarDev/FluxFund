import React from "react";
import "./ContactUs.css";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="contact-container">
      <div className="contact-wrapper">
        <h1 className="contact-title">Contact Us</h1>

        <form className="contact-form">
          <div className="form-row">
            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
          </div>
          <input type="text" placeholder="Subject (optional)" />
          <textarea placeholder="Message" required />
          <button type="submit">Submit</button>
        </form>

        <div className="company-info">
          <h2>Company Info</h2>
          <p>📍 1234 Your Street, City, Country</p>
          <p>📧 support@yourcompany.com</p>
          <p>📞 +123-456-7890</p>
          <p>🕒 Mon - Fri: 9:00 AM - 6:00 PM</p>
        </div>

        <div className="social-links">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
