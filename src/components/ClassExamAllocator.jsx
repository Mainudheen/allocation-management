// src/components/ClassExamAllocator.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./ClassExamAllocator.css";
import "./button.css";

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
  const [allRooms, setAllRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [allocations, setAllocations] = useState([]);

  const invigilatorList = [
    "Dr.P.NATESAN", "Dr.R.S.LATHA", "Dr.R.RAJADEVI", "Dr.K.S.KALAIVANI", "Dr.S.KAYALVILI",
    "Dr.M.VIMALADEVI", "A.S.RENUGADEVI", "N.KANIMOZHI", "P.JAYASHARSHINI", "P.RAMYA",
    "J.CHARANYA", "S.KEERTHIKA", "S.PRIYANKA", "D.SATHYA", "R.THANGAMANI",
    "M.SRI KIRUTHIKA", "M.M.RAMYASRI", "N.KANNAN", "M.HARINI", "Dr.T.A.KARTHIKEYAN",
    "M.MOHANA ARASI", "N.VIGNESHWARAN", "S.GAYATHRI", "R.ARUNKUMAR", "Dr.M.MOHANASUNDARI",
    "Dr.R.R.RAJALAXMI", "Dr.C.NALINI", "Dr.K.LOGESWARAN", "Dr.K.SATHYA", "S.HAMSANANDHINI",
    "S.SANTHIYA", "S.BENIL JENNIFFER", "K.SENTHILVADIVU", "M.YOGA", "O.ABHILA ANJU",
    "M.NEELAMEGAN", "S.GOPINATH", "N.RENUKA", "R.SUBAPRIYA", "V.ARUN ANTONY", "A.VANMATHI"
  ];

  // Fetch students when class/year changes
  useEffect(() => {
    if (selectedClass && year) {
      axios
        .get(`http://localhost:5000/api/students/${selectedClass.toUpperCase()}/${year}`)
        .then((res) => setStudents(res.data))
        .catch((err) => {
          console.error("❌ Failed to fetch students", err);
          setStudents([]);
        });
    } else {
      setStudents([]);
    }
  }, [selectedClass, year]);

  // Fetch rooms
  useEffect(() => {
    axios.get("http://localhost:5000/api/rooms")
      .then(res => {
        const sorted = res.data.sort((a, b) => a.roomNo - b.roomNo);
        setAllRooms(sorted);
      })
      .catch(err => console.error("Failed to fetch rooms", err));
  }, []);

  const toggleStudent = (roll) => {
    if (selectedRolls.includes(roll)) {
      setSelectedRolls(selectedRolls.filter((r) => r !== roll));
    } else {
      setSelectedRolls([...selectedRolls, roll]);
    }
  };

  const handleAllocate = async () => {
    if (!cat || !session || !examDate || !time || !subjectWithCode || !year || !selectedClass || selectedRolls.length === 0 || !selectedRoom) {
      alert("⚠ Please fill all fields, select students, and a starting room");
      return;
    }

    // Shuffle invigilators
    const shuffledInvigilators = [...invigilatorList].sort(() => 0.5 - Math.random());
    let invIndex = 0;

    // Find starting room and split students across rooms
    const startIndex = allRooms.findIndex(r => r.roomNo === selectedRoom);
    const usableRooms = allRooms.slice(startIndex);

    let studentIndex = 0;
    const finalAllocations = [];

    for (let i = 0; i < usableRooms.length && studentIndex < selectedRolls.length; i++) {
      const room = usableRooms[i];
      const batchSize = room.benches; // Number of students per room
      const studentsForRoom = selectedRolls.slice(studentIndex, studentIndex + batchSize);
      if (!studentsForRoom.length) break;

      const inv1 = shuffledInvigilators[invIndex++];
      const inv2 = shuffledInvigilators[invIndex++];

      finalAllocations.push({
        className: selectedClass,
        year,
        cat,
        session,
        examDate,
        time,
        subjectWithCode,
        room: room.roomNo,
        hallNo: room.hallNo || "N/A",
        assignedStudents: studentsForRoom,
        invigilators: [inv1, inv2],
      });

      studentIndex += batchSize;
    }

    if (studentIndex < selectedRolls.length) {
      const leftover = selectedRolls.slice(studentIndex);
      finalAllocations.push({
        className: selectedClass,
        year,
        cat,
        session,
        examDate,
        time,
        subjectWithCode,
        room: "❌ No Hall Available",
        hallNo: "N/A",
        assignedStudents: leftover,
        invigilators: ["-", "-"],
        isUnallocated: true,
      });
    }

    try {
      const res = await axios.post("http://localhost:5000/api/save-allocations", { allocations: finalAllocations });
      if (res.status === 200) {
        alert("✅ Exam allocated successfully!");
        setAllocations(finalAllocations);
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
        {/* CAT */}
        <div>
          <label>CAT:</label>
          <div className="radio-group">
            {[1, 2, 3].map((n) => (
              <label key={n}>
                <input type="radio" value={n} checked={cat === String(n)} onChange={(e) => setCat(e.target.value)} />
                {n}
              </label>
            ))}
          </div>
        </div>

        {/* Session */}
        <div>
          <label>Session:</label>
          <div className="radio-group">
            {["FN", "AN"].map((s) => (
              <label key={s}>
                <input type="radio" value={s} checked={session === s} onChange={(e) => setSession(e.target.value)} />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label>Date:</label>
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
        </div>

        {/* Time */}
        <div>
          <label>Time:</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        {/* Subject */}
        <div>
          <label>Subject with Code:</label>
          <input type="text" value={subjectWithCode} onChange={(e) => setSubjectWithCode(e.target.value)} />
        </div>

        {/* Year */}
        <div>
          <label>Year of Study:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select Year</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        {/* Class */}
        <div>
          <label>Select Class:</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">Choose Class</option>
            <option value="AIDS-A">AIDS-A</option>
            <option value="AIDS-B">AIDS-B</option>
            <option value="AIDS-C">AIDS-C</option>
            <option value="AIML-A">AIML-A</option>
            <option value="AIML-B">AIML-B</option>
          </select>
        </div>

        {/* Starting Room */}
        <div>
          <label>Select Starting Room:</label>
          <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
            <option value="">Choose Room</option>
            {allRooms.map((room) => (
              <option key={room.roomNo} value={room.roomNo}>
                {room.roomNo} - {room.floor} - {room.benches} benches
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Select / Deselect All */}
      <div className="select-deselect-buttons">
        <button
          type="button"
          onClick={() =>
            setSelectedRolls((prev) => {
              // Merge previous selection with all students, remove duplicates
              const allRolls = students.map((s) => s.rollno);
              const merged = Array.from(new Set([...prev, ...allRolls]));
              return merged;
            })
          }
        >
          Select All
        </button>
        <button type="button" onClick={() => setSelectedRolls([])}>
          Deselect All
        </button>
      </div>


      {/* Student roll numbers grid view */}
      {students.length > 0 && (
        <div className="students-grid">
          {students.map((stu) => (
            <div
              key={stu._id || stu.rollno}
              className={`student-roll ${selectedRolls.includes(stu.rollno) ? "selected" : ""}`}
              onClick={() => toggleStudent(stu.rollno)}
            >
              {stu.rollno}
            </div>
          ))}
        </div>
      )}

      <button className="btn-donate" onClick={handleAllocate}>
        Allocate Exam
      </button>

      {/* Allocations preview */}
      {allocations.length > 0 && (
        <div className="allocations-preview">
          <h3>📋 Allocations</h3>
          {allocations.map((alloc, idx) => (
            <div key={idx} className="allocation-card">
              <p><strong>Room:</strong> {alloc.room}</p>
              <p><strong>Students:</strong> {alloc.assignedStudents.join(", ")}</p>
              <p><strong>Invigilators:</strong> {alloc.invigilators.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
