import React from "react";
import Campaign from "./Campaign";
import "./GroupOfCampaigns.css";

const GroupOfCampaign = () => {
  return (
    <div className="group-container">
      <Campaign
        image="https://via.placeholder.com/300x180?text=Campaign+1"
        title="Clean Water Initiative"
        description="Providing clean water to remote villages."
        votes={120}
      />
      <Campaign
        image="https://via.placeholder.com/300x180?text=Campaign+2"
        title="Solar Energy Access"
        description="Solar power for rural homes."
        votes={98}
      />
      <Campaign
        image="https://via.placeholder.com/300x180?text=Campaign+3"
        title="Tree Planting Mission"
        description="Planting 10,000 trees globally."
        votes={305}
      />
      <Campaign
        image="https://via.placeholder.com/300x180?text=Campaign+4"
        title="Education for All"
        description="Building schools in underprivileged areas."
        votes={214}
      />
    </div>
  );
};

export default GroupOfCampaign;
