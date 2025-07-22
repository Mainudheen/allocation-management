import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <div className="card student-card" onClick={() => navigate('/student-login')}>
        <h2>Student Login</h2>
        
        <button>Login as Student</button>
      </div>

      <div className="card admin-card" onClick={() => navigate('/admin-login')}>
        <h2>Admin Login</h2>
        
        <button>Login as Admin</button>
      </div>
    </div>
  );
}

export default HomePage;
