import React, { useEffect, useState } from "react";
import axios from "axios";
import Campaign from "./Campaign"; // Corrected import path
import "./AllCampaigns.css";

const AllCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [groupedCampaigns, setGroupedCampaigns] = useState({});
  const [searchTag, setSearchTag] = useState("");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/campaigns");
      const data = res.data;

      // Count tag popularity
      const tagCount = {};
      data.forEach((c) => {
        (c.tags || []).forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      // Sort tags by popularity
      const sortedTags = Object.keys(tagCount).sort(
        (a, b) => tagCount[b] - tagCount[a]
      );

      // Group campaigns by tags (in popularity order)
      const grouped = {};
      sortedTags.forEach((tag) => {
        grouped[tag] = data.filter((c) => c.tags && c.tags.includes(tag));
      });

      setCampaigns(data);
      setGroupedCampaigns(grouped);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTag(e.target.value.toLowerCase());
  };

  const filteredGroups = searchTag
    ? Object.fromEntries(
        Object.entries(groupedCampaigns)
          .filter(([tag]) => tag.toLowerCase().includes(searchTag))
      )
    : groupedCampaigns;

  return (
    <div className="all-campaigns-container">
      <h1 className="all-campaigns-title">All Campaigns</h1>

      <input
        type="text"
        placeholder="Search by tag (e.g. education, climate...)"
        value={searchTag}
        onChange={handleSearchChange}
        className="tag-search-bar"
      />

      {Object.entries(filteredGroups).map(([tag, tagCampaigns], index) => (
        <div key={index} className="campaign-group">
          <h2 className="group-title">#{tag}</h2>
          <div className="campaigns-row">
            {tagCampaigns.map((campaign) => (
              <Campaign
                key={campaign._id}
                image={campaign.photoUrl}
                title={campaign.name}
                description={campaign.description}
                votes={campaign.votes}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllCampaigns;
