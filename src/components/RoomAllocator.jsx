import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './RoomAllocator.css';

function RoomAllocator() {
  const [excelData, setExcelData] = useState([]);
  const [roomsInput, setRoomsInput] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [allocations, setAllocations] = useState([]);

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
      setExcelData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const allocate = async () => {
    const rooms = roomsInput.split(',').map(r => r.trim());
    if (!excelData.length || !examName || !examDate || !yearOfStudy) {
      alert("Please complete all fields and upload Excel");
      return;
    }

    const students = [...excelData];
    const finalAllocation = [];
    let invigilatorIndex = 0;

    for (let i = 0; i < students.length; i += 30) {
      const batch = students.slice(i, i + 30);
      const rawRoom = rooms[Math.floor(i / 30)] || '';
      const roomNumMatch = rawRoom.match(/\d+/);
      const room = roomNumMatch ? roomNumMatch[0] : `100${i / 30}`;

      const inv1 = invigilatorList[invigilatorIndex % invigilatorList.length];
      const inv2 = invigilatorList[(invigilatorIndex + 1) % invigilatorList.length];
      invigilatorIndex += 2;

      const rollList = batch
        .map(s => s.Roll || s['Roll No'] || s['RollNumber'] || s['RollNo'])
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const rollNumbers = rollList.length > 1 ? `${rollList[0]} – ${rollList[rollList.length - 1]}` : rollList[0];

      const classSet = new Set();
      batch.forEach(s => {
        const cls = s.className || s.ClassName;
        if (cls) classSet.add(cls.trim());
      });

      finalAllocation.push({
        className: Array.from(classSet).join(', '),
        room,
        totalStudents: batch.length,
        rollNumbers,
        examName,
        examDate,
        year: yearOfStudy,
        invigilators: [inv1, inv2]
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
        setAllocations(finalAllocation);
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
      ["Class", "Room", "Total Students", "Roll Numbers", "Exam Name", "Exam Date", "Year", "Invigilator 1", "Invigilator 2"],
      ...allocations.map(a => [
        a.className, a.room, a.totalStudents, a.rollNumbers,
        a.examName, a.examDate, a.year, a.invigilators[0], a.invigilators[1]
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");
    XLSX.writeFile(wb, `Allocations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="dashboard-container">
      <div className="control-panel">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        <input type="text" placeholder="Rooms (e.g., 101,102)" onChange={e => setRoomsInput(e.target.value)} />
        <input type="text" placeholder="Exam Name" value={examName} onChange={e => setExamName(e.target.value)} />
        <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
        <select value={yearOfStudy} onChange={e => setYearOfStudy(e.target.value)}>
          <option value="">Select Year</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>
        <button onClick={allocate}>Allocate</button>
        <button onClick={downloadExcel}>Download Excel</button>
      </div>

      {allocations.length > 0 && (
        <table className="allocation-table">
          <thead>
            <tr>
              <th>Class</th><th>Room</th><th>Total</th><th>Roll Numbers</th>
              <th>Exam</th><th>Date</th><th>Year</th><th>Inv. 1</th><th>Inv. 2</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, i) => (
              <tr key={i}>
                <td>{a.className}</td><td>{a.room}</td><td>{a.totalStudents}</td>
                <td>{a.rollNumbers}</td><td>{a.examName}</td><td>{a.examDate}</td>
                <td>{a.year}</td><td>{a.invigilators[0]}</td><td>{a.invigilators[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RoomAllocator;