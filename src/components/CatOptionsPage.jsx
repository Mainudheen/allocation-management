import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CatOptionsPage.css';
// Assuming you have a CollegeHeader component

function CatOptionsPage() {
  const navigate = useNavigate();

  return (
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
  );
}

export default CatOptionsPage;