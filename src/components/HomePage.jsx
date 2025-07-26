import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';


function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="holographic-container">
      
      <div className="holographic-card" onClick={() => navigate('/student-login')}>
      
        <h2>Student Login</h2>
        
        
       
      </div>

      <div className="holographic-card" onClick={() => navigate('/admin-login')}>
        <h2>Admin Login</h2>
        
       
      </div>

    </div>
  );
}

export default HomePage;
