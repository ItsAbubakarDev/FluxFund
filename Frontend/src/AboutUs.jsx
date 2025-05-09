import React from "react";
import "./AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-wrapper">
        <h1 className="about-title">About FluxFund</h1>

        <section className="about-section">
          <p>
            <strong>FluxFund</strong> is a decentralized platform designed to simplify smart contract management and funding transactions. Whether you're an innovator seeking support or a contributor looking to invest in promising ideas, FluxFund provides the tools and trust to make it happen.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <ul>
            <li>🔐 Seamless creation and execution of smart contracts</li>
            <li>📢 Discover and support exciting funding campaigns</li>
            <li>🚀 Launch your own campaign in minutes</li>
            <li>📊 Transparent and secure transaction history</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            To empower a decentralized future by making smart contracts and crowdfunding accessible to everyone. We aim to build trust, transparency, and opportunity for all.
          </p>
        </section>

        <section className="about-section">
          <h2>Why Choose FluxFund?</h2>
          <p>
            Our platform combines ease-of-use with the power of blockchain. With FluxFund, you join a growing community that's reshaping the world of digital finance and project funding.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;
