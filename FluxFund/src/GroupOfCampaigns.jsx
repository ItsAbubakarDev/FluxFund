import React from "react";
import Campaign from "./Campaign";
import "./GroupOfCampaigns.css";

const GroupOfCampaign = () => {
  return (
    <div className="group-container">
      <Campaign
        image="Clean water initiative.png"
        title="Clean Water Initiative"
        description="Providing clean water to remote villages."
        votes={120}
      />
      <Campaign
        image="Solar Energy Request.png"
        title="Solar Energy Access"
        description="Solar power for rural homes."
        votes={98}
      />
      <Campaign
        image="Tree planting mission.jpeg"
        title="Tree Planting Mission"
        description="Planting 10,000 trees globally."
        votes={305}
      />
      <Campaign
        image="Education for all.jpeg"
        title="Education for All"
        description="Building schools in underprivileged areas."
        votes={214}
      />
    </div>
  );
};

export default GroupOfCampaign;
