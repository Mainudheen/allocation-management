import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminHomePage.css'; // ✅ Correct


function AdminHomePage() {
  const navigate = useNavigate();

  const handleCardClick = (title) => {
    if (title === 'CAT Test') {
      navigate('/CatOptionsPage');
    }
    else if(title === 'Special Test')
    {
      navigate('/SpecialTestOptions');
    }
    else {
      alert(`${title} page will be added soon.`);
    }
  };

  const cards = [
    { title: 'CAT Test', description: 'Upload or update CAT test schedule.', icon: '📄' },
    { title: 'Special Test', description: 'Manage special exam data.', icon: '🧪' },
    { title: 'Update Details', description: 'Edit student/faculty/room details.', icon: '✏' }
  ];

  return (
    <div className="dashboard-container">
      <div className="college-header">
        <img
          src="https://rchi2019.kongu.edu/images/header.png"
          alt="Kongu Engineering College"
          className="college-banner"
        />
      </div>

      <h1 className="admin-heading">Welcome, Admin</h1>

      <div className="card-grid">
        {cards.map((card, index) => (
          <div key={index} className="dashboard-card" onClick={() => handleCardClick(card.title)}>
            <span className="icon">{card.icon}</span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminHomePage;
