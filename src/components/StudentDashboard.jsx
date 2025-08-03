import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './StudentDashboard.css'; // Link to your CSS below

function StudentDashboard() {
  const { state } = useLocation();
  const rollno = state?.rollno?.toUpperCase();

  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rollno) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/allocation/${rollno}`)
      .then((res) => {
        if (!res.ok) throw new Error("No allocation found");
        return res.json();
      })
      .then((data) => {
        const formatted = Array.isArray(data) ? data : [data];
        formatted.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        setAllocations(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching allocation:", err);
        setAllocations([]);
        setLoading(false);
      });
  }, [rollno]);

  if (!rollno) {
    return <p style={{ textAlign: "center", color: "red" }}>⚠️ No roll number provided.</p>;
  }

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Loading your room allocations...</p>;
  }

  if (!allocations.length) {
    return <p style={{ textAlign: "center", color: "red" }}>❌ No allocations found for your roll number.</p>;
  }

  return (
    <div className="center" style={{ flexWrap: "wrap", gap: "2rem" }}>
      {allocations.map((allocation, index) => (
        <div className="article-card no-image" key={index}>
          <div className="content">
            <p className="date">
              {new Date(allocation.examDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p className="title">{allocation.examName}</p>
            <p className="info">🏫 Room: {allocation.room}</p>
            <p className="info"> {allocation.invigilators?.join(" & ")}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;
