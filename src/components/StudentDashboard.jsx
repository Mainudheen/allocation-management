import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function StudentDashboard() {
  const { state } = useLocation();
  const rollno = state?.rollno?.toUpperCase();  // Ensure roll number is in uppercase


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
        // If backend returns a single object, convert it to an array
        const formatted = Array.isArray(data) ? data : [data];
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

  if (!allocations || allocations.length === 0) {
    return <p style={{ textAlign: "center", color: "red" }}>❌ No allocations found for your roll number.</p>;
  }

  return (
    <div style={{ backgroundColor: "#f0fcff", minHeight: "100vh", padding: "2rem" }}>
      <h2 style={{ textAlign: "center", color: "#2c3e50", marginBottom: "2rem" }}>📘 Exam Room Allocations</h2>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem" }}>
        {allocations.map((allocation, index) => (
          <div key={index} style={{
            padding: "20px",
            maxWidth: "400px",
            minWidth: "300px",
            textAlign: "left",
            border: "1px solid #ccc",
            borderRadius: "10px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
          }}>
            <p><strong>🎓 Roll No:</strong> {rollno}</p>
            <p><strong>📑 Exam:</strong> {allocation.examName}</p>
            <p><strong>🗓️ Date:</strong> {new Date(allocation.examDate).toLocaleDateString()}</p>
            <p><strong>🏫 Room:</strong> {allocation.room}</p>
            <p><strong>👨‍🏫 Invigilators:</strong> {allocation.invigilators?.join(" & ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentDashboard;
