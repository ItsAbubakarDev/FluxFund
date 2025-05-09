import React from "react";
import Campaign from "./Campaign";
import "./GroupOfCampaigns.css";

const GroupOfCampaign = ({ campaigns = [], onVote }) => {
  return (
    <div className="group-container">
      {campaigns.map((c) => (
        <Campaign
          key={c._id}
          image={
            c.photoUrl
              ? `http://localhost:5000${c.photoUrl}`
              : "https://via.placeholder.com/300x180?text=No+Image"
          }
          title={c.name}
          description={c.description}
          votes={c.votes || 0}
          onUpvote={() => onVote(c._id, 1)}
          onDownvote={() => onVote(c._id, -1)}
        />
      ))}
    </div>
  );
};

export default GroupOfCampaign;
