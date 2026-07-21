import { useState } from "react";
import axios from "axios";


const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

function CreateSkill() {

  const [skill, setSkill] = useState({
    title: "",
    description: "",
    category: "",
    city: "",
    image: null
  });

  const handleChange = (e) => {
    setSkill({
      ...skill,
      [e.target.name]: e.target.value
    });
  };

  const handleImage = (e) => {
    setSkill({
      ...skill,
      image: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("title", skill.title);
    formData.append("description", skill.description);
    formData.append("category", skill.category);
    formData.append("city", skill.city);
    formData.append("image", skill.image);

    try {

      await API.post("skills/", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Skill Created Successfully");

      setSkill({
        title: "",
        description: "",
        category: "",
        city: "",
        image: null
      });

    } catch (error) {
      console.log(error);
      alert("Error creating skill");
    }
  };

  return (
    <div className="create-skill-container">

      <div className="create-skill-card">

        <h2>Add Skill</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Skill Title"
            value={skill.title}
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Skill Description"
            value={skill.description}
            onChange={handleChange}
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={skill.category}
            onChange={handleChange}
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={skill.city}
            onChange={handleChange}
          />

          <input
            type="file"
            onChange={handleImage}
          />

          <button type="submit">
            Add Skill
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateSkill;