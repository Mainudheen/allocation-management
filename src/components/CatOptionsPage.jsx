import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CatOptionsPage.css';

function CatOptionsPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* NAVBAR START */}
      <nav className="navbar">
        <div className="navbar-left">
          {/* <img
            src="https://kms.kongu.edu/images/kongu.jpg"
            alt="College Logo"
            className="college-logo"
          /> */}
          <span className="college-name">AUTOMATED HALL SCHEDULER</span>
        </div>
        <div className="navbar-right">
          <button className="nav-button" onClick={() => navigate('/')}>Home</button>
          <button className="nav-button" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </button>
        </div>
      </nav>
      {/* NAVBAR END */}

      {/* MAIN CONTENT */}
      <div className="cat-options-container">
        <h2>CAT Test Options</h2>
        <div className="cat-options-buttons">
          <div className="cat-option-card" onClick={() => navigate('/dashboard')}>
            <span>Allocate Hall</span>
          </div>
          <div className="cat-option-card" onClick={() => navigate('/manage-allotments')}>
            <span>Manage Allotments</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default CatOptionsPage;
