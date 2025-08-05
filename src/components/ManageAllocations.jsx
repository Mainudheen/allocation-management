import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageAllocations.css';

function ManageAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/allocations')
      .then(res => res.json())
      .then(data => {
        setAllocations(data);
      })
      .catch(err => console.error('Error fetching allocations:', err));
  }, []);

  // Group allocations by examDate
  const groupedByDate = allocations.reduce((acc, allocation) => {
    const date = allocation.examDate;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(allocation);
    return acc;
  }, {});

  // Get sorted future exam dates
  const futureDates = Object.keys(groupedByDate)
    .filter(date => new Date(date) >= new Date(new Date().toISOString().split('T')[0]))
    .sort((a, b) => new Date(a) - new Date(b));

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleEdit = (allocation) => {
    navigate('/edit-allocation', { state: { allocation } });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Manage Allocations</h1>
        <p>View and manage upcoming exam schedules by date</p>
      </header>

      {!selectedDate ? (
        <div className="cards-grid">
          {futureDates.length > 0 ? (
            futureDates.map((date, index) => (
              <div
                key={index}
                className="exam-card upcoming"
                onClick={() => handleDateClick(date)}
                style={{ cursor: 'pointer' }}
              >
                <h3>Exam Date: {new Date(date).toLocaleDateString('en-GB')}</h3>
                <p><strong>Total Halls:</strong> {groupedByDate[date].length}</p>
                <p><strong>Exams:</strong> {groupedByDate[date].map(a => a.examName).join(', ')}</p>
              </div>
            ))
          ) : (
            <p>No upcoming exam allocations found.</p>
          )}
        </div>
      ) : (
        <div>
          <button
            className="allocate-all-button"
            onClick={() => setSelectedDate(null)}
            style={{ marginBottom: '20px' }}
          >
            Back to Dates
          </button>
          <h2>Allocations for {new Date(selectedDate).toLocaleDateString('en-GB')}</h2>
          <div className="cards-grid">
            {groupedByDate[selectedDate].map((allocation, index) => (
              <div
                key={index}
                className="exam-card upcoming"
                onClick={() => handleEdit(allocation)}
                style={{ cursor: 'pointer' }}
              >
                <h3>{allocation.examName}</h3>
                <p className="date">
                  {new Date(allocation.examDate).toLocaleDateString('en-GB')} 🕒 {allocation.session}
                </p>
                <p><strong>Room:</strong> {allocation.room}</p>
                <p><strong>Hall No:</strong> {allocation.hallNo}</p>
                <p><strong>Invigilators:</strong> {allocation.invigilators?.join(" & ")}</p>
                <p><strong>Exam:</strong> CAT {allocation.cat}</p>
                <p><strong>Students:</strong> {allocation.rollNumbers} ({allocation.totalStudents})</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAllocations;