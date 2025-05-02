import React, { useState } from "react";
import "./HomePage.css";

const campaignsMock = [
  { id: 1, name: "Clean Water Initiative", votes: 95 },
  { id: 2, name: "Eco Farming Project", votes: 88 },
  { id: 3, name: "Education for All", votes: 80 },
  { id: 4, name: "Green Energy Drive", votes: 75 },
  { id: 5, name: "Plastic-Free Ocean", votes: 72 },
  { id: 6, name: "Affordable Housing", votes: 68 },
  { id: 7, name: "Free Coding Bootcamps", votes: 65 },
  { id: 8, name: "Tree Plantation Movement", votes: 62 },
  { id: 9, name: "Mental Health Awareness", votes: 59 },
  { id: 10, name: "Women in Tech", votes: 55 },
];

const HomePage = () => {
  const [campaigns, setCampaigns] = useState(campaignsMock);
  const [newCampaign, setNewCampaign] = useState({ name: "" });
  const [votes, setVotes] = useState({});

  const handleCreateCampaign = () => {
    if (newCampaign.name.trim() !== "") {
      const newId = campaigns.length + 1;
      setCampaigns([...campaigns, { id: newId, name: newCampaign.name, votes: 0 }]);
      setNewCampaign({ name: "" });
    }
  };

  const handleVote = (id, rating) => {
    const updatedCampaigns = campaigns.map(c =>
      c.id === id ? { ...c, votes: c.votes + rating } : c
    );
    setCampaigns(updatedCampaigns);
  };

  const topCampaigns = [...campaigns]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 10);

  return (
    <div className="home-container">
      <section className="intro">
        <h1>Welcome to FluxFund</h1>
        <p>Empowering projects through smart contract-based funding.</p>
      </section>

      <section className="top-campaigns">
        <h2>🏆 Top 10 Campaigns</h2>
        <ul>
          {topCampaigns.map(c => (
            <li key={c.id}>
              {c.name} - {c.votes} votes
            </li>
          ))}
        </ul>
      </section>

      <section className="random-campaigns">
        <h2>📢 Explore Campaigns</h2>
        <ul>
          {campaigns.slice(10, 15).map(c => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      </section>

      <section className="create-campaign">
        <h2>📝 Create a Campaign</h2>
        <input
          type="text"
          placeholder="Enter campaign name"
          value={newCampaign.name}
          onChange={(e) => setNewCampaign({ name: e.target.value })}
        />
        <button onClick={handleCreateCampaign}>Create</button>
      </section>

      <section className="vote-section">
        <h2>⭐ Rate Campaigns</h2>
        <ul>
          {campaigns.map(c => (
            <li key={c.id}>
              {c.name}
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button key={rating} onClick={() => handleVote(c.id, rating)}>
                    {rating}★
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="wallet-section">
        <button className="wallet-button">🔗 Connect Wallet</button>
      </footer>
    </div>
  );
};

export default HomePage;
