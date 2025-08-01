import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function StudentDashboard() {
  const { state } = useLocation();
  const rollno = state?.rollno?.toUpperCase();  // Ensure roll number is in uppercase

  const [allocation, setAllocation] = useState(null);
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
        setAllocation(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching allocation:", err);
        setAllocation(null);
        setLoading(false);
      });
  }, [rollno]);

  if (!rollno) {
    return <p style={{ textAlign: "center", color: "red" }}>⚠️ No roll number provided.</p>;
  }

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ Loading your room allocation...</p>;
  }

  if (!allocation) {
    return <p style={{ textAlign: "center", color: "red" }}>❌ No allocation found for your roll number.</p>;
  }

  return (
    <div className="student-dashboard" style={{ padding: "20px", maxWidth: "500px", margin: "auto", textAlign: "left", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#2c3e50" }}>📘 Exam Room Allocation</h2>
      <hr />
      <p><strong>🎓 Roll No:</strong> {rollno}</p>
      <p><strong>📑 Exam:</strong> {allocation.examName}</p>
      <p><strong>🗓️ Date:</strong> {new Date(allocation.examDate).toLocaleDateString()}</p>
      <p><strong>🏫 Room:</strong> {allocation.room}</p>
      <p><strong>👨‍🏫 Invigilators:</strong> {allocation.invigilators?.join(" & ")}</p>
    </div>
  );
}

export default StudentDashboard;
