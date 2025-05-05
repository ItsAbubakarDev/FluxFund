import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HomePage.css";
import GroupOfCampaign from "./GroupOfCampaigns";

const HomePage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({ name: "", description: "", photo: null });
  const [showAllTop, setShowAllTop] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:5000/api/campaigns")
      .then(res => setCampaigns(res.data))
      .catch(err => console.log(err));
  }, []);

  const handleCreateCampaign = async () => {
    if (
      newCampaign.name.trim() !== "" &&
      newCampaign.description.trim() !== "" &&
      newCampaign.photo
    ) {
      const formData = new FormData();
      formData.append("name", newCampaign.name);
      formData.append("description", newCampaign.description);
      formData.append("photo", newCampaign.photo);

      try {
        const res = await axios.post("http://localhost:5000/api/campaigns", formData);
        setCampaigns([...campaigns, res.data]);
        setNewCampaign({ name: "", description: "", photo: null });
      } catch (err) {
        console.error("Error creating campaign", err);
      }
    }
  };

  const handleVote = async (id, rating) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/campaigns/${id}/vote`, { rating });
      setCampaigns(campaigns.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error("Voting failed", err);
    }
  };

  const sortedTop8 = [...campaigns]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 8);

  return (
    <div className="home-container">
      <section className="intro">
        <h1>Welcome to FluxFund</h1>
        <p>Empowering projects through smart contract-based funding.</p>
      </section>

      <section className="top-campaigns">
        <h2>🏆 Top 8 Campaigns</h2>
        <GroupOfCampaign campaigns={sortedTop8.slice(0, 4)} onVote={handleVote} />
        {showAllTop && <GroupOfCampaign campaigns={sortedTop8.slice(4, 8)} onVote={handleVote} />}
        <div className="toggle-row-button">
          <button onClick={() => setShowAllTop(prev => !prev)}>
            {showAllTop ? "▲ Show Less" : "▼ Show More"}
          </button>
        </div>
      </section>

      <section className="create-campaign">
        <h2>📝 Create a Campaign</h2>
        <input
          type="text"
          placeholder="Enter campaign title"
          value={newCampaign.name}
          onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
        />
        <textarea
          placeholder="Enter campaign description"
          value={newCampaign.description}
          onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setNewCampaign({ ...newCampaign, photo: e.target.files[0] })}
        />
        <button onClick={handleCreateCampaign}>Create</button>
      </section>

      <section className="vote-section">
        <h2>⭐ Vote on Campaigns</h2>
        <GroupOfCampaign campaigns={campaigns.slice(0, 4)} onVote={handleVote} />
        <div className="toggle-row-button">
          <button onClick={() => window.location.href = "/all-campaigns"}>
            ▼ Show More
          </button>
        </div>
      </section>

      <footer className="wallet-section">
        <button className="wallet-button">🔗 Connect Wallet</button>
      </footer>
    </div>
  );
};

export default HomePage;
