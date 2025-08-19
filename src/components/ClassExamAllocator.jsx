// src/components/ClassExamAllocator.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ClassExamAllocator.css";

export default function ClassExamAllocator() {
  const [cat, setCat] = useState("");
  const [session, setSession] = useState("");
  const [examDate, setExamDate] = useState("");
  const [time, setTime] = useState("");
  const [subjectWithCode, setSubjectWithCode] = useState("");
  const [year, setYear] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [students, setStudents] = useState([]); // fetched from DB
  const [selectedRolls, setSelectedRolls] = useState([]); // clicked roll numbers across all classes

  // Fetch students when class/year changes
  useEffect(() => {
    if (selectedClass && year) {
      axios
        .get(
          `http://localhost:5000/api/students/${selectedClass.toUpperCase()}/${year}`
        )
        .then((res) => setStudents(res.data))
        .catch((err) => {
          console.error("❌ Failed to fetch students", err);
          setStudents([]);
        });
    } else {
      setStudents([]);
    }
  }, [selectedClass, year]);

  const toggleStudent = (roll) => {
    if (selectedRolls.includes(roll)) {
      setSelectedRolls(selectedRolls.filter((r) => r !== roll));
    } else {
      setSelectedRolls([...selectedRolls, roll]);
    }
  };

  const handleAllocate = async () => {
    if (
      !cat ||
      !session ||
      !examDate ||
      !time ||
      !subjectWithCode ||
      !year ||
      !selectedClass ||
      selectedRolls.length === 0
    ) {
      alert("⚠️ Please fill all fields and select students");
      return;
    }

    const examDetails = {
      cat,
      session,
      examDate,
      time,
      subjectWithCode,
      year,
      className: selectedClass,
      assignedStudents: selectedRolls,
    };

    try {
      const res = await axios.post(
        "http://localhost:5000/api/save-allocations",
        examDetails
      );
      if (res.status === 200) {
        alert("✅ Exam allocated successfully!");
        setSelectedRolls([]);
      }
    } catch (err) {
      console.error("❌ Allocation error", err);
      alert("Failed to allocate exam");
    }
  };

  return (
    <div className="exam-allocator">
      <h2>🎯 Class Exam Allocator</h2>

      <div className="form-section">
        <label>CAT:</label>
        <div className="radio-group">
          {[1, 2, 3].map((n) => (
            <label key={n}>
              <input
                type="radio"
                value={n}
                checked={cat === `${n}`}
                onChange={(e) => setCat(e.target.value)}
              />{" "}
              {n}
            </label>
          ))}
        </div>

        <label>Session:</label>
        <div className="radio-group">
          {["FN", "AN"].map((s) => (
            <label key={s}>
              <input
                type="radio"
                value={s}
                checked={session === s}
                onChange={(e) => setSession(e.target.value)}
              />{" "}
              {s}
            </label>
          ))}
        </div>

        <label>Date:</label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
        />

        <label>Time:</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <label>Subject with Code:</label>
        <input
          type="text"
          value={subjectWithCode}
          onChange={(e) => setSubjectWithCode(e.target.value)}
        />

        <label>Year of Study:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>

        <label>Select Class:</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Choose Class</option>
          <option value="AIDS-A">AIDS-A</option>
          <option value="AIDS-B">AIDS-B</option>
          <option value="AIDS-C">AIDS-C</option>
          <option value="AIML-A">AIML-A</option>
          <option value="AIML-B">AIML-B</option>
        </select>
      </div>

      {/* Student roll numbers flex view */}
      {students.length > 0 && (
        <div className="students-grid">
          {students.map((stu) => (
            <div
              key={stu._id || stu.rollno}
              className={`student-roll ${
                selectedRolls.includes(stu.rollno) ? "selected" : ""
              }`}
              onClick={() => toggleStudent(stu.rollno)}
            >
              {stu.rollno}
            </div>
          ))}
        </div>
      )}

      <button className="allocate-btn" onClick={handleAllocate}>
        🚀 Allocate Exam
      </button>
    </div>
  );
}
