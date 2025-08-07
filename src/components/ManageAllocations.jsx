/* // src/components/ManageAllocations.jsx

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
        console.log("Fetched allocations:", data); 
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

                
                <p><strong>Invigilator 1:</strong> {allocation.invigilators?.[0]}</p>
                <p><strong>Invigilator 2:</strong> {allocation.invigilators?.[1]}</p>

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

export default ManageAllocations;   */

// src/components/ManageAllocations.jsx

import React, { useEffect, useState } from 'react';
import './StudentDashboard.css'; // reuse same styles
import { useNavigate } from 'react-router-dom';

function ManageAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Handle editing other fields (not invigilators)
  const handleEdit = (allocation) => {
    navigate('/RoomAllocator', { state: { editMode: true, allocation } });
  };

  // Update invigilator input in local state
  const handleInvigilatorChange = (index, invigilatorIndex, value) => {
    const updated = [...allocations];
    updated[index].invigilators[invigilatorIndex] = value;
    setAllocations(updated);
  };

  // Save invigilators to DB
  const handleInvigilatorSave = async (id, invigilators) => {
    try {
      const response = await fetch(`http://localhost:5000/api/allocations/${id}/update-invigilators`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invigilators }),
      });

      if (response.ok) {
        alert('✅ Invigilators updated successfully');
      } else {
        alert('❌ Failed to update invigilators');
      }
    } catch (err) {
      console.error("Error updating invigilators:", err);
    }
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
        // Ensure invigilators field is always an array
        const safeData = sorted.map(item => ({
          ...item,
          invigilators: item.invigilators || ["", ""]
        }));
        setAllocations(safeData);
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
              <div className={`exam-card ${cardStatus}`} key={index}>
                <div onClick={() => handleEdit(allocation)} style={{ cursor: "pointer" }}>
                  <h3><strong>{allocation.examName}</strong></h3>
                  <p><strong>CAT:</strong> {allocation.cat} | <strong>Session:</strong> {allocation.session}</p>
                  <p><strong>Date:</strong> {new Date(allocation.examDate).toLocaleDateString('en-GB')}</p>
                  <p><strong>Subject:</strong> {allocation.subjectWithCode}</p>
                  <p><strong>Year:</strong> {allocation.year} | <strong>Semester:</strong> {allocation.semester}</p>
                  <p><strong>Hall No:</strong> {allocation.hallNo}</p>
                  <p><strong>Room:</strong> {allocation.room}</p>
                  <p><strong>Roll Range:</strong> {allocation.rollStart} - {allocation.rollEnd}</p>
                </div>

                {/* Editable Invigilators */}
                <div className="invigilator-section">
                  <label>Invigilator 1:</label>
                  <input
                    type="text"
                    value={allocation.invigilators[0] || ""}
                    onChange={(e) => handleInvigilatorChange(index, 0, e.target.value)}
                  />

                  <label>Invigilator 2:</label>
                  <input
                    type="text"
                    value={allocation.invigilators[1] || ""}
                    onChange={(e) => handleInvigilatorChange(index, 1, e.target.value)}
                  />

                  <button onClick={() => handleInvigilatorSave(allocation._id, allocation.invigilators)}>
                    💾 Save Invigilators
                  </button>
                </div>
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

export default ManageAllocations;
