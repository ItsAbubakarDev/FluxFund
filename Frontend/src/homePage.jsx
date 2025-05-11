import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import axios from "axios";
import "./HomePage.css";
import GroupOfCampaign from "./GroupOfCampaigns";

const HomePage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [top8Campaigns, setTop8Campaigns] = useState([]);
  const [showAllTop, setShowAllTop] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const [topRes, allRes] = await Promise.all([
          axios.get("http://localhost:5000/api/campaigns/top8"),
          axios.get("http://localhost:5000/api/campaigns")
        ]);
        setTop8Campaigns(topRes.data);
        setCampaigns(allRes.data);
      } catch (err) {
        console.error("Failed to load campaigns", err);
      }
    };
    loadCampaigns();
  }, []);

  const handleVote = async (id, rating) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/campaigns/${id}/vote`, 
        { rating }
      );
      setCampaigns(campaigns.map((c) => (c._id === id ? res.data : c)));
      setTop8Campaigns(top8Campaigns.map((c) => (c._id === id ? res.data : c)));
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  return (
    <div className="home-container">
      <section className="intro">
        <h1>Welcome to FluxFund</h1>
        <p>Empowering projects through smart contract-based funding.</p>
      </section>

      <section className="top-campaigns">
        <h2>🏆 Top 8 Campaigns</h2>
        <GroupOfCampaign campaigns={top8Campaigns.slice(0, 4)} onVote={handleVote} />
        {showAllTop && (
          <GroupOfCampaign campaigns={top8Campaigns.slice(4, 8)} onVote={handleVote} />
        )}
        <div className="toggle-row-button">
          <button onClick={() => setShowAllTop((prev) => !prev)}>
            {showAllTop ? "▲ Show Less" : "▼ Show More"}
          </button>
        </div>
      </section>

      {/* Replaced inline form with redirect button */}
      <div className="create-campaign-link">
        <button onClick={() => navigate("/create")}>
          📝 Create a Campaign
        </button>
      </div>


      <section className="top-campaigns">
      <h2>🏆 Explore Campaign </h2>
      <GroupOfCampaign
        campaigns={top8Campaigns.sort(() => 0.5 - Math.random()).slice(0, 4)} 
        onVote={handleVote}
      />
      {showAllTop && (
        <GroupOfCampaign
          campaigns={top8Campaigns
            .filter(c => !randomCampaigns.includes(c)) // Exclude the first 4 random ones
            .sort(() => 0.5 - Math.random())
            .slice(0, 4)} 
          onVote={handleVote} 
        />
      )}
      <div className="toggle-row-button">
        <button onClick={() => setShowAllTop((prev) => !prev)}>
          {showAllTop ? "▲ Show Less" : "▼ Show More"}
        </button>
      </div>
    </section>

      <section className="vote-section">
        <h2>⭐ Vote on Campaigns</h2>
        <GroupOfCampaign campaigns={campaigns.slice(0, 4)} onVote={handleVote} />
        {campaigns.length > 4 && (
          <div className="toggle-row-button">
            <button onClick={() => navigate("/campaigns")}>
              ▼ Show More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;