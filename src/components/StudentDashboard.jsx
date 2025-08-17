import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './StudentDashboard.css';

function StudentDashboard() {
  const { state } = useLocation();
  const rollno = state?.rollno?.toUpperCase();
  const studentName = state?.name || "Student";

  const [countdowns, setCountdowns] = useState({});
  const initialAllocations = useMemo(() => state?.allocations || [], [state?.allocations]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};

      allocations.forEach((allocation) => {
        const key = `${allocation.examDate}-${allocation.room}`;
        const sessionTime =
          allocation.time ||
          allocation.examTime ||
          (allocation.session === "FN" ? "09:00" : "14:00");

        const seconds = getTimeStatus(allocation.examDate, sessionTime, now);
        newCountdowns[key] = seconds;
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [allocations]);

  useEffect(() => {
    if (initialAllocations.length > 0) {
      const sorted = [...initialAllocations].sort(
        (a, b) =>
          new Date(`${a.examDate}T${a.session === "FN" ? "09:00" : "14:00"}`) -
          new Date(`${b.examDate}T${b.session === "FN" ? "09:00" : "14:00"}`)
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
              new Date(`${a.examDate}T${a.session === "FN" ? "09:00" : "14:00"}`) -
              new Date(`${b.examDate}T${b.session === "FN" ? "09:00" : "14:00"}`)
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

  function getTimeStatus(examDate, time, now = new Date()) {
    if (!examDate || !time) return 0;
    const startTime = new Date(`${examDate}T${time}`);
    const diffMs = startTime - now;
    return Math.floor(diffMs / 1000);
  }

  function formatCountdown(seconds) {
    if (seconds > 0) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `Starts in ${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    } else if (seconds > -3 * 3600) {
      const elapsed = Math.abs(seconds);
      const hrs = Math.floor(elapsed / 3600);
      const mins = Math.floor((elapsed % 3600) / 60);
      const secs = elapsed % 60;
      return `Started ${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")} ago`;
    } else {
      return `Exam over`;
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
          Welcome, <span>{studentName}</span> 🎓
        </h1>
        <p>Here’s your upcoming exam schedule. All the best! 📚</p>
      </header>

      {allocations.length > 0 ? (
        <div className="cards-grid">
          {allocations.map((allocation, index) => {
            const examDateTime = new Date(
              `${allocation.examDate}T${allocation.session === "FN" ? "09:00" : "14:00"}`
            );
            const now = new Date();

            let cardStatus = "";
            if (examDateTime.toDateString() === now.toDateString()) {
              cardStatus = examDateTime > now ? "present" : "past";
            } else if (examDateTime > now) {
              cardStatus = "upcoming";
            } else {
              cardStatus = "past";
            }

            const isLabExam = Boolean(allocation.lab);
            const countdownKey = `${allocation.examDate}-${allocation.room}`;

            // Extract subject name only (remove code if format is "CODE - NAME")
            const subjectName = allocation.subjectWithCode
              ? allocation.subjectWithCode.split("-").slice(1).join("-").trim()
              : allocation.subjectWithCode;

            return (
              <div
                className={`exam-card ${cardStatus} ${isLabExam ? "lab-exam" : ""}`}
                key={index}
              >
                {/* Subject name at the top */}
                <h2 className="subject-title">{subjectName}</h2>
                {/*Subject*/}

                <p><strong>Exam:</strong> {allocation.subjectWithCode|| "N/A"}</p>
                <p>
                  <strong>CAT:</strong> {allocation.cat || "N/A"} |{" "}
                  <strong>Session:</strong> {allocation.session}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(allocation.examDate).toLocaleDateString("en-GB")} 🕒{" "}
                  {allocation.examTime || allocation.time || "N/A"}
                </p>
                <p><strong>Room:</strong> {allocation.room || allocation.lab || "N/A"}</p>
                <p>
                  <strong>Invigilator(s):</strong>{" "}
                  {allocation.invigilators?.join(" & ") || "N/A"}
                </p>
                <p>
                  <strong>⏳ Countdown:</strong>{" "}
                  {formatCountdown(countdowns[countdownKey] || 0)}
                </p>
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
