import React from "react";
import "./Campaign.css";

const Campaign = ({ image, title, description, votes, onVote }) => {
  return (
    <div className="campaign-card">
      <img src={image} alt={title} className="campaign-image" />
      <div className="campaign-content">
        <h3 className="campaign-title">{title}</h3>
        <p className="campaign-description">{description}</p>
        <div className="campaign-votes">Votes: {votes}</div>
        <div className="campaign-actions">
          <button onClick={() => onVote(1)}>⬆ Upvote</button>
          <button onClick={() => onVote(-1)}>⬇ Downvote</button>
        </div>
      </div>
    </div>
  );
};

export default Campaign;
