import React, { useState } from "react";
import "./Campaign.css";

const Campaign = ({ image, title, description, votes: initialVotes }) => {
  const [votes, setVotes] = useState(initialVotes);

  const upVote = () => {
    setVotes(votes + 1);
  };

  const downVote = () => {
    setVotes(votes - 1);
  };

  return (
    <div className="campaign-card">
      <img src={image} alt={title} className="campaign-image" />
      <div className="campaign-content">
        <h3 className="campaign-title">{title}</h3>
        <p className="campaign-description">{description}</p>
        <div className="campaign-votes">Votes: {votes}</div>
        <div className="campaign-actions">
          <button onClick={upVote}>⬆ Upvote</button>
          <button onClick={downVote}>⬇ Downvote</button>
        </div>
      </div>
    </div>
  );
};

export default Campaign;
