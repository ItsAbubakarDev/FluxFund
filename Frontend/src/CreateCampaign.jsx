import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CreateCampaign.css";

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    photo: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name || !formData.description) {
      setError("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("tags", formData.tags);
      if (formData.photo) data.append("photo", formData.photo);

      await axios.post("http://localhost:5000/api/campaigns", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      navigate("/campaigns", { state: { success: "Campaign created successfully!" } });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-campaign-container">
      <div className="create-campaign-card">
        <h1 className="create-campaign-title">Create New Campaign</h1>
        
        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="campaign-form">
          <div className="form-field">
            <label htmlFor="name" className="form-label">
              Campaign Name <span className="required">*</span>
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="e.g. Clean Water Initiative"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your campaign goals, impact, and requirements..."
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows={5}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="tags" className="form-label">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              name="tags"
              placeholder="education, environment, health"
              value={formData.tags}
              onChange={handleChange}
              className="form-input"
            />
            <p className="form-hint">Separate tags with commas</p>
          </div>

          <div className="form-field">
            <label htmlFor="photo" className="form-label">
              Campaign Image
            </label>
            <div className="file-upload-wrapper">
              <label htmlFor="photo" className="file-upload-label">
                {formData.photo ? formData.photo.name : "Choose an image..."}
              </label>
              <input
                id="photo"
                type="file"
                name="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="file-upload-input"
              />
            </div>
            <p className="form-hint">Recommended size: 1200×630px (JPG or PNG)</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Creating...
              </>
            ) : (
              "Publish Campaign"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;