import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BlurText from "./BlurText";

import "./StudentDashboard.css";

function StudentDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const rollno = state?.rollno?.toUpperCase();
  const studentName = state?.name || "Student";

  const [countdowns, setCountdowns] = useState({});
  const initialAllocations = useMemo(() => state?.allocations || [], [state?.allocations]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomLayout, setRoomLayout] = useState(null);

  // Update countdowns every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const newCountdowns = {};

      allocations.forEach((allocation) => {
        const key = `${allocation.examDate}-${allocation.room || allocation.lab || allocation.className}`;
        const sessionTime = allocation.time || (allocation.session === "FN" ? "09:00" : "14:00");

        newCountdowns[key] = getTimeStatus(allocation.examDate, sessionTime, now);
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [allocations]);

  // Fetch allocations
  useEffect(() => {
    if (initialAllocations.length > 0) {
      const sorted = sortAllocations(initialAllocations);
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
          const sorted = sortAllocations(formatted);
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

  // Sort allocations by date and session
  function sortAllocations(list) {
    return [...list].sort(
      (a, b) =>
        new Date(`${a.examDate}T${a.session === "FN" ? "09:00" : "14:00"}`) -
        new Date(`${b.examDate}T${b.session === "FN" ? "09:00" : "14:00"}`)
    );
  }

  // Countdown in seconds
  function getTimeStatus(examDate, time, now = new Date()) {
    if (!examDate || !time) return 0;
    const startTime = new Date(`${examDate}T${time}`);
    const diffMs = startTime - now;
    return Math.floor(diffMs / 1000);
  }

  // Format countdown
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

  // ✅ Get student's seat (row, col, benchNo) from Allocation.students
  function getStudentBench(allocation) {
    const pos = allocation.students?.find((s) => s.rollno && s.rollno.toUpperCase() === rollno);

    if (!pos) return "N/A";

    //const row = pos.row ?? Math.ceil(pos.benchNo / 5);
    const col = pos.col ?? ((pos.benchNo - 1) % 5 + 1);

    return ` Col ${col}, Bench ${pos.benchNo}`;
  }

  // ✅ Fetch room layout when "View Seating" is clicked
  function handleViewSeating(roomNo, allocation) {
    fetch(`http://localhost:5000/api/rooms/${roomNo}`)
      .then((res) => res.json())
      .then((roomData) => {
        setRoomLayout({
          ...roomData,
          studentSeat: allocation.students.find(
            (s) => s.rollno && s.rollno.toUpperCase() === rollno
          ),
        });
        setSelectedRoom(allocation.room);
      })
      .catch((err) => console.error("Error fetching room layout:", err));
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <span className="college-name">AUTOMATED HALL SCHEDULER</span>
        </div>
        <div className="navbar-right">
          <button className="nav-button" onClick={() => navigate("/")}>
            Home
          </button>
          <button
            className="nav-button"
            onClick={() => {
              localStorage.clear();
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        <header className="dashboard-header">
          
          <h1>
             <BlurText text={`Welcome, ${studentName} 🎓`} />
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
              const isClassExam = Boolean(allocation.className && !allocation.room && !allocation.lab);
              const countdownKey = `${allocation.examDate}-${allocation.room || allocation.lab || allocation.className}`;

              const subjectName = allocation.subjectWithCode
                ? allocation.subjectWithCode.split("-").slice(1).join("-").trim()
                : allocation.subjectWithCode;

              return (
                
                <div
                  className={`exam-card ${cardStatus} ${isLabExam ? "lab-exam" : isClassExam ? "class-exam" : ""}`}
                  key={index}
                >
                  <h2 className="subject-title">{subjectName || "Exam"}</h2>

                  <p><strong>Exam:</strong> {allocation.subjectWithCode || "N/A"}</p>
                  <p><strong>CAT:</strong> {allocation.cat || "N/A"}</p>
                  <p><strong>Session:</strong> {allocation.session}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {allocation.examDate
                      ? new Date(allocation.examDate).toLocaleDateString("en-GB")
                      : "N/A"}{" "}
                    🕒{" "}
                    {allocation.time
                      ? allocation.time
                      : allocation.session === "FN"
                        ? "09:00"
                        : allocation.session === "AN"
                          ? "14:00"
                          : "N/A"}
                  </p>

                  {isLabExam ? (
                    <p><strong>Lab:</strong> {allocation.lab}</p>
                  ) : isClassExam ? (
                    <p><strong>Class:</strong> {allocation.className}</p>
                  ) : (
                    <p><strong>Room:</strong> {allocation.room}</p>
                  )}

                  <p><strong>Your Seat:</strong> {getStudentBench(allocation)}</p>

                  <p>
                    <strong>⏳ Countdown:</strong>{" "}
                    {formatCountdown(countdowns[countdownKey] || 0)}
                  </p>

                  {!isLabExam && !isClassExam && (
                    <button
                      className="view-seating-btn"
                      onClick={() => handleViewSeating(allocation.room, allocation)}
                    >
                      View Seating
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          
        ) : (
          <p className="error-text">❌ No exams scheduled. Please check back later.</p>
        )}
      </div>

      {/* ✅ Modal for Room Layout */}
      {roomLayout && (
        <div className="modal-overlay" onClick={() => setRoomLayout(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Room {selectedRoom} Seating Layout</h2>
       <div
  className="seating-grid"
  style={{
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    marginTop: "20px",
  }}
>
  {roomLayout.columns.map((col, colIndex) => (
    <div
      key={col.colNo}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      }}
    >
      {/* Column label */}
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        Col {col.colNo}
      </div>

      {/* Benches */}
      {Array.from({ length: col.rows }, (_, benchIndex) => {
  const globalBenchNo =
    benchIndex + 1 + roomLayout.columns
      .slice(0, colIndex)
      .reduce((sum, c) => sum + c.rows, 0);

  const isStudentSeat = roomLayout.studentSeat?.benchNo === globalBenchNo;

  return (
    <div
      key={benchIndex}
      className={`seat-circle ${isStudentSeat ? "highlight-seat" : ""}`}
      style={{ width: "40px", height: "40px" }}
    >
      {globalBenchNo}
    </div>
  );
})}

    </div>
  ))}
</div>



            <button className="close-btn" onClick={() => setRoomLayout(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentDashboard;
