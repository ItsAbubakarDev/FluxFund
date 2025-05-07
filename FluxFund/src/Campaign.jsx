import React, { useState } from "react";
import "./Campaign.css";

const Campaign = ({ image, title, description, votes: initialVotes }) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState(null); // null, 'up', 'down'

  const handleUpVote = () => {
    if (userVote === 'up') {
      // already upvoted → do nothing
      return;
    }
    if (userVote === 'down') {
      // switching from downvote → add +2 (remove downvote and apply upvote)
      setVotes(votes + 2);
    } else {
      // first time upvote
      setVotes(votes + 1);
    }
    setUserVote('up');
  };

  const handleDownVote = () => {
    if (userVote === 'down') {
      // already downvoted → do nothing
      return;
    }
    if (userVote === 'up') {
      // switching from upvote → subtract 2 (remove upvote and apply downvote)
      setVotes(votes - 2);
    } else {
      // first time downvote
      setVotes(votes - 1);
    }
    setUserVote('down');
  };

  return (
    <div className="campaign-card">
      <img src={image} alt={title} className="campaign-image" />
      <div className="campaign-content">
        <h3 className="campaign-title">{title}</h3>
        <p className="campaign-description">{description}</p>
        <div className="campaign-votes">Votes: {votes}</div>
        <div className="campaign-actions">
          <button
            onClick={handleUpVote}
            disabled={userVote === 'up'}
          >
            ⬆ Upvote
          </button>
          <button
            onClick={handleDownVote}
            disabled={userVote === 'down'}
          >
            ⬇ Downvote
          </button>
        </div>
      </div>
    </div>
  );
};

export default Campaign;
