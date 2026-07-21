import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import './AddSkills.css';

const AddSkills = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        city: "",
        image: null,
        video: null
    });
    const [preview, setPreview] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({
            ...formData,
            [e.target.name]: file
        });

        if (e.target.name === 'image' && file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("city", formData.city);
        if (formData.image) data.append("image", formData.image);
        if (formData.video) data.append("video", formData.video);

        try {
            await API.post("skills/", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Skill added successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("Error details:", err.response?.data || err.message);
            alert(err.response?.data?.detail || "Failed to add skill. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-skill-container">
            <div className="add-skill-card">
                <div className="form-header">
                    <h2>List a New Skill</h2>
                    <p>Share your expertise with the community and start bartering.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-grid">
                        <div className="input-group">
                            <label>Skill Title</label>
                            <input 
                                type="text" 
                                name="title" 
                                placeholder="e.g. Graphic Design, Web Development" 
                                value={formData.title} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Category</label>
                            <input 
                                type="text" 
                                name="category" 
                                placeholder="e.g. Tech, Arts, Lifestyle" 
                                value={formData.category} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group full-width">
                            <label>Description</label>
                            <textarea 
                                name="description" 
                                placeholder="Describe what you can offer in detail..." 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>City / Location</label>
                            <input 
                                type="text" 
                                name="city" 
                                placeholder="e.g. Mumbai, Bangalore" 
                                value={formData.city} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label>Display Image</label>
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    name="image" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />
                                <span className="file-custom">
                                    {formData.image ? formData.image.name : "Select Image"}
                                </span>
                            </div>
                        </div>

                        <div className="input-group full-width">
                            <label>Demo Video (Optional)</label>
                            <div className="file-input-wrapper">
                                <input 
                                    type="file" 
                                    name="video" 
                                    accept="video/*" 
                                    onChange={handleFileChange} 
                                />
                                <span className="file-custom">
                                    {formData.video ? formData.video.name : "Select Video"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {preview && (
                        <div className="image-preview">
                            <p>Image Preview:</p>
                            <img src={preview} alt="Skill Preview" />
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Posting..." : "Add Skill"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSkills;
