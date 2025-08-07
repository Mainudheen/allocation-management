// src/components/ManageAllocations.jsx

import React, { useEffect, useState } from 'react';
import './StudentDashboard.css'; // reuse same styles
import { useNavigate } from 'react-router-dom';


function ManageAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

const handleEdit = (allocation) => {
  navigate('/RoomAllocator', { state: { editMode: true, allocation } });
};


  useEffect(() => {
    fetch('http://localhost:5000/api/allocations')
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch allocations");
        return res.json();
      })
      .then((data) => {
        const sorted = [...data].sort(
          (a, b) =>
            new Date(`${a.examDate}T${a.session === 'FN' ? '09:00' : '14:00'}`) -
            new Date(`${b.examDate}T${b.session === 'FN' ? '09:00' : '14:00'}`)
        );
        setAllocations(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setAllocations([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="loading-text">⏳ Loading all exam allocations...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📋 Manage Exam Allocations</h1>
        <p>Below are all the current room/exam allocations.</p>
      </header>

      {allocations.length > 0 ? (
        <div className="cards-grid">
          {allocations.map((allocation, index) => {
            const examDateTime = new Date(`${allocation.examDate}T${allocation.session === 'FN' ? '09:00' : '14:00'}`);
            const now = new Date();

            let cardStatus = '';
            if (examDateTime.toDateString() === now.toDateString()) {
              cardStatus = examDateTime > now ? 'present' : 'past';
            } else if (examDateTime > now) {
              cardStatus = 'upcoming';
            } else {
              cardStatus = 'past';
            }

            return (
              <div className={`exam-card ${cardStatus}`} key={index} onClick={() => handleEdit(allocation)}
  style={{ cursor: "pointer" }}>
                <h3><strong>{allocation.examName}</strong></h3>
                <p><strong>CAT:</strong> {allocation.cat} | <strong>Session:</strong> {allocation.session}</p>
                <p><strong>Date:</strong> {new Date(allocation.examDate).toLocaleDateString('en-GB')}</p>
                <p><strong>Subject:</strong> {allocation.subjectWithCode}</p>
                <p><strong>Year:</strong> {allocation.year} | <strong>Semester:</strong> {allocation.semester}</p>
                <p><strong>Hall No:</strong> {allocation.hallNo}</p>
                <p><strong>Room:</strong> {allocation.room}</p>
                <p><strong>Invigilator(s):</strong> {allocation.invigilators?.join(" & ")}</p>
                <p><strong>Roll Range:</strong> {allocation.rollStart} - {allocation.rollEnd}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="error-text">❌ No allocations found.</p>
      )}
    </div>
  );
}
/*manage*/
export default ManageAllocations;  