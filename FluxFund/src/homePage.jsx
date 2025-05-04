import React, { useState } from "react";
import "./HomePage.css";
import GroupOfCampaign from "./GroupOfCampaigns";

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

  const sortedTop8 = [...campaigns]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 8);

  const [showAllTop, setShowAllTop] = useState(false);

  const handleCreateCampaign = () => {
    if (
      newCampaign.name.trim() !== "" &&
      newCampaign.description.trim() !== "" &&
      newCampaign.photo
    ) {
      const newId = campaigns.length + 1;
      setCampaigns([
        ...campaigns,
        {
          id: newId,
          name: newCampaign.name,
          description: newCampaign.description,
          votes: 0,
          photo: newCampaign.photo,
        },
      ]);
      setNewCampaign({ name: "", description: "", photo: null });
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
        <h2>🏆 Top 8 Campaigns</h2>
        <GroupOfCampaign campaigns={sortedTop8.slice(0, 4)} />
        
        {showAllTop && (
          <GroupOfCampaign campaigns={sortedTop8.slice(4, 8)} />
        )}

        <div className="toggle-row-button">
          <button onClick={() => setShowAllTop(prev => !prev)}>
            {showAllTop ? "▲ Show Less" : "▼ Show More"}
          </button>
        </div>
      </section>


      <section className="random-campaigns">
        <h2>📢 Explore Campaigns</h2>
        <ul>
          {campaigns.slice(10, 15).map(c => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
        <GroupOfCampaign />
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
          onChange={(e) =>
            setNewCampaign({ ...newCampaign, description: e.target.value })
          }
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
        <GroupOfCampaign
          campaigns={campaigns.slice(0, 4)}
          onVote={(id, value) => {
            const updated = campaigns.map(c =>
              c.id === id ? { ...c, votes: c.votes + value } : c
            );
            setCampaigns(updated);
          }}
        />
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
