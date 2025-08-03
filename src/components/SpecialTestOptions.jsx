import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SpecialTestOptions.css'
// Assuming you have a CollegeHeader component

function SpecialTestOptions() {
  const navigate = useNavigate();

  return (
    <div className="cat-options-container">
      <h2>CAT Test Options</h2>
      <div className="cat-options-buttons">
        <div className="cat-option-card" onClick={() => navigate('/LabAllocator')}>
          <span>PST Test</span>
        </div>
        <div className="cat-option-card" onClick={() => navigate('/manage-allotments')}>
          <span>Retest</span>
        </div>
      </div>
    </div>
  );
}

export default SpecialTestOptions;