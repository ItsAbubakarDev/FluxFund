import React from "react";
import Campaign from "./Campaign"; // Import Campaign directly instead of GroupOfCampaign
import "./AllCampaigns.css";

const AllCampaigns = () => {
  // Sample data for multiple groups of campaigns
  const campaignGroups = [
    {
      title: "Environmental Initiatives",
      campaigns: [
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+1",
          title: "Clean Water Initiative",
          description: "Providing clean water to remote villages.",
          votes: 120
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+2",
          title: "Solar Energy Access",
          description: "Solar power for rural homes.",
          votes: 98
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+3",
          title: "Tree Planting Mission",
          description: "Planting 10,000 trees globally.",
          votes: 305
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+4",
          title: "Ocean Cleanup",
          description: "Removing plastic from our oceans.",
          votes: 187
        }
      ]
    },
    {
      title: "Education Projects",
      campaigns: [
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+5",
          title: "Education for All",
          description: "Building schools in underprivileged areas.",
          votes: 214
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+6",
          title: "Digital Literacy",
          description: "Providing tech education to youth.",
          votes: 156
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+7",
          title: "Library Expansion",
          description: "Creating community learning spaces.",
          votes: 89
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+8",
          title: "STEM for Girls",
          description: "Encouraging girls in science and tech.",
          votes: 132
        }
      ]
    },
    {
      title: "Community Development",
      campaigns: [
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+9",
          title: "Urban Gardens",
          description: "Creating green spaces in cities.",
          votes: 76
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+10",
          title: "Homeless Shelter",
          description: "Supporting those in need.",
          votes: 203
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+11",
          title: "Food Bank",
          description: "Fighting hunger in our community.",
          votes: 178
        },
        {
          image: "https://via.placeholder.com/300x180?text=Campaign+12",
          title: "Senior Care",
          description: "Improving life for elderly citizens.",
          votes: 94
        }
      ]
    }
  ];

  return (
    <div className="all-campaigns-container">
      <h1 className="all-campaigns-title">All Campaigns</h1>
      {campaignGroups.map((group, index) => (
        <div key={index} className="campaign-group">
          <h2 className="group-title">{group.title}</h2>
          <div className="campaigns-row">
            {group.campaigns.map((campaign, idx) => (
              <Campaign
                key={idx}
                image={campaign.image}
                title={campaign.title}
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