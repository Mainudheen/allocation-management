import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './RoomAllocator.css';
import "./button.css";

function RoomAllocator() {
  const { state } = useLocation();
  const isEditMode = state?.editMode || false;
  const existingAllocation = state?.allocation || null;

  const [time, setTime] = useState('');
  const [allRooms, setAllRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [cat, setCat] = useState('');
  const [session, setSession] = useState('');
  const [examDate, setExamDate] = useState('');
  const [year, setYear] = useState('');
  const [semNo, setSemNo] = useState('');
  const [hallNo, setHallNo] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [rollNumbers, setRollNumbers] = useState([]);
  const [subjectWithCode, setSubjectWithCode] = useState('');

  // Fetch rooms
  useEffect(() => {
    fetch("http://localhost:5000/api/rooms")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => {
          const floorOrder = { 'GROUND': 0, '1ST': 1, '2ND': 2, '3RD': 3 };
          return (floorOrder[a.floor.toUpperCase()] || 0) - (floorOrder[b.floor.toUpperCase()] || 0);
        });
        setAllRooms(sorted);
      })
      .catch(err => console.error("Failed to fetch rooms", err));
  }, []);

  // Pre-fill fields in edit mode
  useEffect(() => {
    if (isEditMode && existingAllocation) {
      setCat(existingAllocation.cat || '');
      setSession(existingAllocation.session || '');
      setExamDate(existingAllocation.examDate || '');
      setSubjectWithCode(existingAllocation.subjectWithCode || '');
      setYear(existingAllocation.year || '');
      setSemNo(existingAllocation.semester?.match(/\d+/)?.[0] || '');
      setHallNo(existingAllocation.hallNo || '');
      setSelectedRooms(existingAllocation.room ? existingAllocation.room.split(', ') : []);
    }
  }, [isEditMode, existingAllocation]);

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

  // Handle roll number Excel upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      const rolls = jsonData.map(s => s.Roll || s['Roll No'] || s['RollNumber'] || s['RollNo']).filter(Boolean);
      setRollNumbers(rolls);
    };
    reader.readAsBinaryString(file);
  };

  const handleRoomSelection = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedRooms(selected);
  };

  const allocate = async () => {
    if (!rollNumbers.length || !cat || !session || !examDate || !subjectWithCode || !year || !semNo || !selectedRooms.length || !time) {
      alert("Please complete all fields including time and upload roll numbers");
      return;
    }

    const semesterDisplay = semNo && (parseInt(semNo) % 2 === 1 ? `Odd Sem ${semNo}` : `Even Sem ${semNo}`);
    const startingRoomNo = selectedRooms[0];
    const startIndex = allRooms.findIndex(r => r.roomNo === startingRoomNo);
    const usableRooms = allRooms.slice(startIndex);

    let studentIndex = 0;
    const finalAllocation = [];
    const shuffledInvigilators = [...invigilatorList].sort(() => 0.5 - Math.random());
    let invIndex = 0;

    for (let i = 0; i < usableRooms.length && studentIndex < rollNumbers.length; i++) {
      const room = usableRooms[i];
      const rows = room.rows || room.benches || 5; // use rows field if exists
      const columns = room.columns || 2;
      const batchSize = rows * columns;

      const studentsForRoom = rollNumbers.slice(studentIndex, studentIndex + batchSize)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      if (!studentsForRoom.length) break;

      const inv1 = shuffledInvigilators[invIndex % shuffledInvigilators.length];
      const inv2 = shuffledInvigilators[(invIndex + 1) % shuffledInvigilators.length];
      invIndex += 2;

      const studentPositions = studentsForRoom.map((roll, idx) => {
        const row = (idx % rows) + 1;                // cycle through rows
        const col = Math.floor(idx / rows) + 1;      // increase col after finishing all rows

        return {
          roll,
          bench: row,   // bench is essentially the row number
          col
        };
      });


      finalAllocation.push({
        room: room.roomNo,
        hallNo,
        totalStudents: studentsForRoom.length,
        rollStart: studentsForRoom[0],
        rollEnd: studentsForRoom[studentsForRoom.length - 1],
        cat,
        session,
        time,
        examDate,
        year,
        semester: semesterDisplay,
        subjectWithCode,
        invigilators: [inv1, inv2],
        studentPositions
      });

      studentIndex += batchSize;
    }

    // Handle leftover students
    if (studentIndex < rollNumbers.length) {
      const leftover = rollNumbers.slice(studentIndex).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      finalAllocation.push({
        room: "❌ No Hall Available",
        hallNo: "N/A",
        totalStudents: leftover.length,
        rollStart: leftover[0],
        rollEnd: leftover[leftover.length - 1],
        leftoverRollNumbers: leftover,
        cat,
        session,
        time,
        examDate,
        year,
        semester: semesterDisplay,
        subjectWithCode,
        invigilators: ["-", "-"],
        isUnallocated: true
      });
    }

    if ((session === 'FN' && time >= '12:00') || (session === 'AN' && time < '12:00')) {
      alert(session === 'FN' ? "FN session should be AM (before 12:00)" : "AN session should be PM (12:00 and after)");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/save-allocations", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: finalAllocation })
      });
      const result = await res.json();
      if (res.ok) {
        alert("✅ Allocations saved successfully!");
        setAllocations(finalAllocation);
      } else {
        alert("❌ Error saving allocations: " + result.message);
      }
    } catch (err) {
      console.error("❌ Allocation save error:", err);
      alert("Server error during allocation save");
    }
  };

  const downloadExcel = () => {
    if (!allocations.length) {
      alert("No allocations to download.");
      return;
    }
    const wsData = [
      ["Hall No", "Room No", "Total Students", "Roll", "CAT", "Session", "Date", "Year", "Semester", "Subject with Code", "Invigilator 1", "Invigilator 2", "Bench & Column"],
      ...allocations.flatMap(a => a.studentPositions ? a.studentPositions.map(sp => [
        a.hallNo, a.room, a.totalStudents, sp.roll, a.cat, a.session, a.examDate, a.year, a.semester, a.subjectWithCode, a.invigilators[0], a.invigilators[1], `Bench ${sp.bench}, Column ${sp.col}`
      ]) : [[
        a.hallNo, a.room, a.totalStudents, a.rollStart, a.cat, a.session, a.examDate, a.year, a.semester, a.subjectWithCode, a.invigilators[0], a.invigilators[1], "-"
      ]])
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");
    XLSX.writeFile(wb, `Allocations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="dashboard-container">
      <h2 className="section-title">📅 Schedule an Exam</h2>
      <div className="control-panel">
        {/* All form controls */}
        <div>
          <label>CAT:</label>
          <div className="radio-group compact">
            {[1, 2, 3].map(n => <label key={n}><input type="radio" name="cat" value={n} checked={cat === `${n}`} onChange={e => setCat(e.target.value)} /> {n}</label>)}
          </div>
        </div>

        <div>
          <label>Session:</label>
          <div className="radio-group compact">
            {["FN", "AN"].map(s => <label key={s}><input type="radio" name="session" value={s} checked={session === s} onChange={e => setSession(e.target.value)} /> {s}</label>)}
          </div>
        </div>

        {session && <div>
          <label>Time ({session === "FN" ? "AM" : "PM"}):</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} min={session === "FN" ? "00:00" : "12:00"} max={session === "FN" ? "11:59" : "23:59"} required />
        </div>}

        <div>
          <label>Date:</label>
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
        </div>

        <div>
          <label>Subject with Code:</label>
          <input type="text" value={subjectWithCode} onChange={e => setSubjectWithCode(e.target.value)} />
        </div>

        <div>
          <label>Year of Study:</label>
          <select value={year} onChange={e => setYear(e.target.value)}>
            <option value="">Select Year</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>

        <div>
          <label>Semester:</label>
          <input type="number" min="1" max="8" value={semNo} onChange={e => setSemNo(e.target.value)} />
        </div>

        <div>
          <label>Upload Roll Numbers:</label>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        </div>

        <div>
          <label>Select Rooms (Auto Allocates):</label>
          <select multiple value={selectedRooms} onChange={handleRoomSelection}>
            {allRooms.map((room, i) => <option key={i} value={room.roomNo}>
              {room.roomNo} - {room.floor} - {room.rows || room.benches || 5} rows × {room.columns || 2} cols
            </option>)}
          </select>
        </div>

        <button className="btn-donate" onClick={allocate}>Allocate</button>
        <button className="btn-donate" onClick={downloadExcel}>📥 Download Excel</button>
      </div>

      {/* Allocation Cards */}
      <div className="card-container">
        {allocations.map((a, idx) => (
          <div className="allocation-card" key={idx}>
            <div className="card-header">🏫 Hall {a.hallNo} | 📅 {a.examDate} | ⏱️ {a.session}</div>
            <div className="card-body show">
              <p><strong>Room No:</strong> {a.room}</p>
              <p><strong>Time:</strong> {a.time}</p>
              <p><strong>Students:</strong> {a.rollStart} – {a.rollEnd} ({a.totalStudents})</p>
              <p><strong>Subject:</strong> {a.subjectWithCode}</p>
              <p><strong>Year:</strong> {a.year}</p>
              <p><strong>Semester:</strong> {a.semester}</p>
              <p><strong>Invigilators:</strong> {a.invigilators.join(" & ")}</p>
              <p><strong>Exam:</strong> CAT {a.cat}</p>
              {a.studentPositions && <div>
                <strong>Bench & Column Allocation:</strong>
                <ul>{a.studentPositions.map((sp, i) => <li key={i}>{sp.roll} → Bench {sp.bench}, Column {sp.col}</li>)}</ul>
              </div>}
              {a.isUnallocated && <div style={{ marginTop: "10px", color: "red" }}>
                <strong>Unallocated Roll Numbers:</strong><br />
                {a.leftoverRollNumbers.join(", ")}
              </div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomAllocator;
