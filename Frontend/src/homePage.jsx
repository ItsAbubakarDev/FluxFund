import React, { useState, useEffect } from "react";
import axios from "axios";
import "./HomePage.css";
import GroupOfCampaign from "./GroupOfCampaigns";

const HomePage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [top8Campaigns, setTop8Campaigns] = useState([]);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    description: "",
    photo: null,
    tags: "",
  });
  const [showAllTop, setShowAllTop] = useState(false);

  useEffect(() => {
    // Load both top campaigns and all campaigns simultaneously
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
      formData.append("tags", newCampaign.tags);

      try {
        const res = await axios.post("http://localhost:5000/api/campaigns", formData);
        setCampaigns([...campaigns, res.data]);
        setNewCampaign({ name: "", description: "", photo: null, tags: "" });
      } catch (err) {
        console.error("Error creating campaign", err);
      }
    }
  };

  const handleVote = async (id, rating) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/campaigns/${id}/vote`, { rating });
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
        {showAllTop && <GroupOfCampaign campaigns={top8Campaigns.slice(4, 8)} onVote={handleVote} />}
        <div className="toggle-row-button">
          <button onClick={() => setShowAllTop((prev) => !prev)}>
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
          type="text"
          placeholder="Enter tags (comma-separated)"
          value={newCampaign.tags}
          onChange={(e) => setNewCampaign({ ...newCampaign, tags: e.target.value })}
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
        {campaigns.length > 4 && (
          <div className="toggle-row-button">
            <button onClick={() => (window.location.href = "/campaigns")}>
              ▼ Show More
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;