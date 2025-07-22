import React, { useState } from 'react';
import './StudentLogin.css';

function StudentLogin() {
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Student Login Data:', formData);
    // Add logic to authenticate or navigate after login
  };

  return (
    <div className="student-login-container">
      <form className="student-login-card" onSubmit={handleSubmit}>
        <h2>STUDENT LOGIN</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter your Name"
          value={formData.name}
          onChange={handleChange}
          required
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

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default StudentLogin;
