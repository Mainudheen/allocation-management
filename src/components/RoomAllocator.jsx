import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './RoomAllocator.css';

function RoomAllocator() {
  const [excelData, setExcelData] = useState([]);
  const [roomsInput, setRoomsInput] = useState('');
  const [examName, setExamName] = useState('');
  const [allocations, setAllocations] = useState([]);

  const invigilatorList = [
    'Mrs.Latha',
    'Mrs.Kalaivani',
    'Mrs.Thangamani',
    'Mrs.Ramya',
    'Mrs.Renuga',
    'Mr.Kanan',
    'Mr.Natesan'
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const allocate = () => {
    const rooms = roomsInput.split(',').map(r => r.trim());

    if (excelData.length === 0) {
      alert("Please upload an Excel file with student data.");
      return;
    }

    if (!examName.trim()) {
      alert("Please enter the Exam Name.");
      return;
    }

    const students = [...excelData];
    const finalAllocation = [];
    let invigilatorIndex = 0;

    for (let i = 0; i < students.length; i += 30) {
      const batch = students.slice(i, i + 30);

      let room;
      if (i / 30 < rooms.length) {
        room = rooms[Math.floor(i / 30)];
      } else {
        const lastRoom = rooms[rooms.length - 1];
        const roomNumMatch = lastRoom.match(/(\d+)/);
        const startNumber = roomNumMatch ? parseInt(roomNumMatch[0]) : 100;
        const newRoomNum = startNumber + (Math.floor(i / 30) - rooms.length + 1);
        room = `${newRoomNum}`;
      }

      const inv1 = invigilatorList[invigilatorIndex % invigilatorList.length];
      const inv2 = invigilatorList[(invigilatorIndex + 1) % invigilatorList.length];
      invigilatorIndex += 2;

      const rollList = batch
        .map(student => student.Roll || student['Roll No'] || student['RollNumber'] || student['RollNo'] || '')
        .filter(r => r.trim() !== '')
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const rollNumbers = rollList.length > 1
        ? `${rollList[0]} – ${rollList[rollList.length - 1]}`
        : rollList[0] || 'N/A';

      const classSet = new Set();
      batch.forEach(student => {
        const cls = student.className || student.ClassName || '';
        if (cls.trim()) classSet.add(cls.trim());
      });
      const className = Array.from(classSet).join(', ');

      finalAllocation.push({
        className,
        room,
        totalStudents: batch.length,
        rollNumbers,
        examName,
        invigilators: [inv1, inv2]
      });
    }

    setAllocations(finalAllocation);
  };

  const downloadExcel = () => {
    if (allocations.length === 0) {
      alert("No allocations to download.");
      return;
    }

    const wsData = [
      ["Class", "Room", "Total Students", "Roll Numbers","Exam Name", "Invigilator 1", "Invigilator 2"],
      ...allocations.map(a => [
        a.className,
        a.room,
        a.totalStudents,
        a.rollNumbers,
        a.examName,
        a.invigilators[0],
        a.invigilators[1]
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");

    const dateStr = new Date().toLocaleDateString().replaceAll('/', '-');
    const cleanExam = examName.trim().replace(/\s+/g, '_') || 'Exam';
    const filename = `${cleanExam}_Room_Allocations_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="dashboard-container">
      <h2>Room Allocation Dashboard</h2>

      <div className="control-panel">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />

        <input
          type="text"
          placeholder="Room numbers (e.g. 208,209,210)"
          onChange={(e) => setRoomsInput(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Exam Name"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
        />

        <button onClick={allocate}>Allocate</button>
        <button onClick={downloadExcel}>Download Excel</button>
      </div>

      {allocations.length > 0 && examName && (
        <h3 style={{ textAlign: 'center', marginTop: '20px' }}>
          Allocation for: <span style={{ color: '#2f3542' }}>{examName}</span>
        </h3>
      )}

      {allocations.length > 0 && (
        <table className="allocation-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Room</th>
              <th>Total Students</th>
              <th>Roll Numbers</th>
              <th>Exam Name</th>
              <th>Invigilator 1</th>
              <th>Invigilator 2</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, idx) => (
              <tr key={idx}>
                <td>{a.className}</td>
                <td>{a.room}</td>
                <td>{a.totalStudents}</td>
                <td>{a.rollNumbers}</td>
                <td>{a.examName}</td>
                <td>{a.invigilators[0]}</td>
                <td>{a.invigilators[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RoomAllocator;
