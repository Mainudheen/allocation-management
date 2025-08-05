import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './RoomAllocator.css';

function RoomAllocator() {
  const [cat, setCat] = useState('');
  const [session, setSession] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examName, setExamName] = useState('');
  const [year, setYear] = useState('');
  const [semNo, setSemNo] = useState('');
  const [hallNo, setHallNo] = useState('');
  const [invigilator1, setInvigilator1] = useState('');
  const [invigilator2, setInvigilator2] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [rollNumbers, setRollNumbers] = useState([]);
  const [roomsInput, updateRoomsInput] = useState('');

  const invigilatorList = [
    'Mrs.Latha', 'Mrs.Kalaivani', 'Mrs.Thangamani',
    'Mrs.Ramya', 'Mrs.Renuga', 'Mr.Kanan', 'Mr.Natesan'
  ];

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

  const allocate = async () => {
    const rooms = roomsInput.split(',').map(r => r.trim());
    const semesterDisplay = semNo && (parseInt(semNo) % 2 === 1 ? `Odd Sem ${semNo}` : `Even Sem ${semNo}`);

    if (!rollNumbers.length || !cat || !session || !examDate || !examName || !year || !semNo || !roomsInput || !hallNo || !invigilator1 || !invigilator2) {
      alert("Please complete all fields and upload roll numbers");
      return;
    }

    const finalAllocation = [];

    for (let i = 0; i < rollNumbers.length; i += 30) {
      const batch = rollNumbers.slice(i, i + 30);
      const rawRoom = rooms[Math.floor(i / 30)] || '';
      const roomNumMatch = rawRoom.match(/\d+/);
      const room = roomNumMatch ? roomNumMatch[0] : `100${i / 30}`;

      const rollList = batch.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
<<<<<<< HEAD
      const rollNumbersRange = rollList.length > 1 ? `${rollList[0]}–${rollList[rollList.length - 1]}` : rollList[0];
=======
      const rollStart = rollList[0];
      const rollEnd = rollList[rollList.length - 1];
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0

      finalAllocation.push({
        room,
        hallNo,
        totalStudents: batch.length,
        rollStart,
        rollEnd,
        cat,
        session,
        examDate,
<<<<<<< HEAD
        year,
        semNo: semesterDisplay,
        examName,
=======
        year: yearOfStudy,
        semester: semesterDisplay,
        subjectWithCode,
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
        invigilators: [invigilator1, invigilator2]
      });
    }

    try {
      const res = await fetch("http://localhost:5000/api/save-allocations", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: finalAllocation })
      });

      const result = await res.json();
      if (res.ok) {
        alert("Allocations saved successfully!");
        const sorted = finalAllocation.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
        setAllocations(sorted);
      } else {
        alert("Error saving allocations: " + result.message);
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
      ["Hall No", "Room No", "Total Students", "Roll Start", "Roll End", "CAT", "Session", "Date", "Year", "Semester", "Subject with Code", "Invigilator 1", "Invigilator 2"],
      ...allocations.map(a => [
<<<<<<< HEAD
        a.hallNo, a.totalStudents, a.rollNumbers,
        a.cat, a.session, a.examDate, a.year, a.semNo, a.examName, a.invigilators[0], a.invigilators[1]
=======
        a.hallNo, a.room, a.totalStudents, a.rollStart, a.rollEnd,
        a.cat, a.session, a.examDate, a.year, a.semester, a.subjectWithCode, a.invigilators[0], a.invigilators[1]
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
      ])
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
        {/* Form Inputs */}
        <div>
          <label>CAT:</label>
          <div className="radio-group compact">
            {[1, 2, 3].map(n => (
              <label key={n}><input type="radio" name="cat" value={n} checked={cat === `${n}`} onChange={e => setCat(e.target.value)} /> {n}</label>
            ))}
          </div>
        </div>

        <div>
          <label>Session:</label>
          <div className="radio-group compact">
            {["FN", "AN"].map(s => (
              <label key={s}><input type="radio" name="session" value={s} checked={session === s} onChange={e => setSession(e.target.value)} /> {s}</label>
            ))}
          </div>
        </div>

        <div>
          <label>Date:</label>
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
        </div>

        <div>
          <label>Subject with Code:</label>
          <input type="text" value={examName} onChange={e => setExamName(e.target.value)} />
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
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </div>

        <div>
          <label>Room Numbers (comma separated):</label>
          <input type="text" value={roomsInput} onChange={e => updateRoomsInput(e.target.value)} placeholder="Eg: 101,102,103" />
        </div>

        <div>
          <label>Hall No:</label>
          <input type="text" value={hallNo} onChange={e => setHallNo(e.target.value)} />
        </div>

        <div>
          <label>Invigilator 1:</label>
          <select value={invigilator1} onChange={e => setInvigilator1(e.target.value)}>
            <option value="">Select</option>
            {invigilatorList.map((i, index) => <option key={index} value={i}>{i}</option>)}
          </select>
        </div>

        <div>
          <label>Invigilator 2:</label>
          <select value={invigilator2} onChange={e => setInvigilator2(e.target.value)}>
            <option value="">Select</option>
            {invigilatorList.map((i, index) => <option key={index} value={i}>{i}</option>)}
          </select>
        </div>

        <button className="allocate-all-button" onClick={allocate}>Allocate</button>
        <button onClick={downloadExcel}>📥 Download Excel</button>
      </div>

<<<<<<< HEAD
=======
      {/* Display Cards */}
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
      <div className="card-container">
        {allocations.map((a, idx) => (
          <div className="allocation-card" key={idx}>
            <div className="card-header">
              🏫 Hall {a.hallNo} | 📅 {a.examDate} | ⏱️ {a.session}
            </div>
            <div className="card-body show">
              <p><strong>Room No:</strong> <span>{a.room}</span></p>
<<<<<<< HEAD
              <p><strong>Students:</strong> <span>{a.rollNumbers} ({a.totalStudents})</span></p>
              <p><strong>Subject:</strong> <span>{a.examName}</span></p>
=======
              <p><strong>Students:</strong> <span>{a.rollStart} – {a.rollEnd} ({a.totalStudents})</span></p>
              <p><strong>Subject:</strong> <span>{a.subjectWithCode}</span></p>
>>>>>>> 10fd86566aa6da26c311e12ba630877c4c05dae0
              <p><strong>Year:</strong> <span>{a.year}</span></p>
              <p><strong>Semester:</strong> <span>{a.semester}</span></p>
              <p><strong>Invigilators:</strong> <span>{a.invigilators.join(" & ")}</span></p>
              <p><strong>Exam:</strong> <span>CAT {a.cat}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomAllocator;