import React, { useState } from 'react';

import './StudentLogin.css';
import { useNavigate } from 'react-router-dom';




function StudentLogin() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    rollno: '',
    year: '',
    className: '',
    password: ''
  });


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Sending login data:", formData);


    try {
      const res = await fetch("http://localhost:5000/api/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Login successful!");
        navigate('/student-dashboard', {
          state: {
            rollno: formData.rollno.toUpperCase(),
            allocations: data.allocations,  // from backend
          },
        });

      }

    } catch (error) {
      console.error("Error during login:", error);
      alert("Server error");
    }
  };



  return (
    <div className="student-login-container">

      <form className="student-login-card" onSubmit={handleSubmit}>
        <h2>STUDENT LOGIN </h2>
        <input
          type="text"
          name="name"
          placeholder="Enter your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type='text'
          name='rollno'
          placeholder='Enter Your Roll No'
          value={formData.rollno}
          onChange={handleChange}
        />
        <select
          name="year"
          value={formData.year}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Year</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>


        <select
          name="className"
          value={formData.className}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Class</option>
          <option value="AIDS-A">AIDS-A</option>
          <option value="AIDS-B">AIDS-B</option>
          <option value="AIDS-C">AIDS-C</option>
          <option value="AIML-A">AIML-A</option>
          <option value="AIML-B">AIML-B</option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />


        <button type='submit'>Login</button>

      </form>

    </div>
  );
}

export default StudentLogin;
