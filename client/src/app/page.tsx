"use client";

import axios from "axios";
import React, { useState } from "react";

// This is the shape of your Pydantic model
interface IOptions {
  prompt: string;
  completion_time_days: number;
  course_weight: "heavy" | "light";
  user_experience: "beginner" | "intermediate" | "expert";
  user_why: string;
  user_prerequisites: string;
  learner_type: "normal" | "fast";
}

export default function Home() {
  // Use a single state object to hold all form data
  const [options, setOptions] = useState<IOptions>({
    prompt: "",
    completion_time_days: 15,
    course_weight: "light",
    user_experience: "beginner",
    user_why: "",
    user_prerequisites: "",
    learner_type: "normal",
  });

  // A single function to update the state object
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Now the 'options' object has all your data,
    // ready to be sent to your FastAPI backend.
    console.log("Form Data:", options);
    // alert("Check the console for the form data!");

    // axios.post("http://127.0.0.1:800/test", { name: "hello" });

    axios
      .post("http://127.0.0.1:8000/create-course", options)
      .then((response) => {
        console.log("Success:", response.data);
        // Handle your course data here
      })
      .catch((error) => {
        console.error("Error creating course:", error);
        // Handle errors, maybe show a message to the user
      });
    // Example: You would send 'options' to your API here
    // fetch("http://127.0.0.1:8000/create-course", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(options)
    // });
  };

  // Basic styling for layout
  const formStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "10px",
    maxWidth: "500px",
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Course Options Form</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label htmlFor="prompt">What Do You Want To Learn?</label>
        <input
          id="promt"
          name="prompt"
          value={options.prompt}
          onChange={handleChange}
        />
        {/* completion_time_days */}
        <label htmlFor="completion_time_days">Completion Time (Days):</label>
        <input
          type="number"
          id="completion_time_days"
          name="completion_time_days"
          value={options.completion_time_days}
          onChange={handleChange}
        />

        {/* course_weight */}
        <label htmlFor="course_weight">Course Weight:</label>
        <select
          id="course_weight"
          name="course_weight"
          value={options.course_weight}
          onChange={handleChange}
        >
          <option value="light">Light</option>
          <option value="heavy">Heavy</option>
        </select>

        {/* user_experience */}
        <label htmlFor="user_experience">Experience Level:</label>
        <select
          id="user_experience"
          name="user_experience"
          value={options.user_experience}
          onChange={handleChange}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        {/* learner_type */}
        <label htmlFor="learner_type">Learner Type:</label>
        <select
          id="learner_type"
          name="learner_type"
          value={options.learner_type}
          onChange={handleChange}
        >
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>

        {/* user_why */}
        <label htmlFor="user_why">Why are you learning?</label>
        <textarea
          id="user_why"
          name="user_why"
          value={options.user_why}
          onChange={handleChange}
        />

        {/* user_prerequisites */}
        <label htmlFor="user_prerequisites">Prerequisites you have:</label>
        <textarea
          id="user_prerequisites"
          name="user_prerequisites"
          value={options.user_prerequisites}
          onChange={handleChange}
        />

        {/* Submit Button */}
        <button
          type="submit"
          style={{ gridColumn: "span 2", marginTop: "1rem" }}
        >
          Submit Options
        </button>
      </form>
    </main>
  );
}
