import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './StudentDashboard.css';

function StudentDashboard() {
  const { state } = useLocation();
  const rollno = state?.rollno?.toUpperCase();
  const studentName = state?.name || "Student";

  // ✅ Memoized initial data
  const initialAllocations = useMemo(() => state?.allocations || [], [state?.allocations]);

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialAllocations.length > 0) {
      const sorted = [...initialAllocations].sort(
        (a, b) =>
          new Date(`${a.examDate}T${a.examTime || '00:00'}`) -
          new Date(`${b.examDate}T${b.examTime || '00:00'}`)
      );
      setAllocations(sorted);
      setLoading(false);
    } else if (rollno) {
      fetch(`http://localhost:5000/api/allocation/${rollno}`)
        .then((res) => {
          if (!res.ok) throw new Error("No allocation found");
          return res.json();
        })
        .then((data) => {
          const formatted = Array.isArray(data) ? data : [data];
          const sorted = [...formatted].sort(
            (a, b) =>
              new Date(`${a.examDate}T${a.examTime || '00:00'}`) -
              new Date(`${b.examDate}T${b.examTime || '00:00'}`)
          );
          setAllocations(sorted);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching allocation:", err);
          setAllocations([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [rollno, initialAllocations]);

  if (!rollno) {
    return <p className="error-text">⚠️ No roll number provided.</p>;
  }

  if (loading) {
    return <p className="loading-text">⏳ Loading your exam schedule...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, <span>{studentName}</span> 🎓</h1>
        <p>Here’s your upcoming exam schedule. All the best! 📚</p>
      </header>

      {allocations.length > 0 ? (
        <div className="cards-grid">
          {allocations.map((allocation, index) => {
            const examDateTime = new Date(`${allocation.examDate}T${allocation.examTime || '23:59'}`);
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
                <h3>{allocation.examName}</h3>
                <p className="date">
                  {new Date(allocation.examDate).toLocaleDateString('en-GB')} 🕒 {allocation.examTime}
                </p>
                <p><strong>Room:</strong> {allocation.room}</p>
                <p><strong>Invigilator(s):</strong> {allocation.invigilators?.join(" & ")}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="error-text">❌ No exams scheduled. Please check back later.</p>
      )}
    </div>
  );
}

export default StudentDashboard;
