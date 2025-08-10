import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './RoomAllocator.css';  // use your CSS file

function LabAllocator() {
  const [labCombo, setLabCombo] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [year, setYear] = useState('');
  const [session, setSession] = useState('');
  const [time, setTime] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const labPairs = [
    'CC1 & CC2', 'CC3 & CC4', 'CC5 & CC6',
    'CC7', 'CC9 & CC10', 'CC11 & CC12'
  ];

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

  // Excel file upload and parse
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  // Allocate students in labs & save to backend
  const allocateLabs = async () => {
    if (!labCombo || !examName || !examDate || !session || !time || !year || excelData.length === 0) {
      alert("Please fill all fields and upload an Excel file.");
      return;
    }

    const students = [...excelData];
    const finalAllocations = [];
    let invigilatorIndex = 0;

    // Find starting lab index
    const startIndex = labPairs.indexOf(labCombo);
    if (startIndex === -1) {
      alert("Invalid lab combination selected.");
      return;
    }
    const availableLabs = labPairs.slice(startIndex);

    // Check if enough labs for students (60 per lab)
    const requiredLabs = Math.ceil(students.length / 60);
    if (requiredLabs > availableLabs.length) {
      alert(`Not enough labs for ${students.length} students. Need ${requiredLabs} labs.`);
      return;
    }

    // Allocate students batchwise per lab
    for (let i = 0; i < students.length; i += 60) {
      const batch = students.slice(i, i + 60);
      const currentLab = availableLabs[Math.floor(i / 60)];

      // Extract roll numbers, sort them
      const rollList = batch
        .map(s => s.Roll || s['Roll No'] || s['RollNumber'] || s['RollNo'])
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      const rollRange = rollList.length > 1
        ? `${rollList[0]} – ${rollList[rollList.length - 1]}`
        : rollList[0];

      // Extract distinct classes
      const classSet = new Set();
      batch.forEach(s => {
        const cls = s.className || s.ClassName;
        if (cls) classSet.add(cls.trim());
      });

      // Assign 2 invigilators, cycling through the list (as array)
      const inv1 = invigilatorList[invigilatorIndex % invigilatorList.length];
      const inv2 = invigilatorList[(invigilatorIndex + 1) % invigilatorList.length];
      invigilatorIndex += 2;

      finalAllocations.push({
        lab: currentLab,
        examName,
        examDate,
        year,
        session,
        time,
        totalStudents: batch.length,
        rollRange,
        classNames: Array.from(classSet).join(', '),
        invigilators: [inv1, inv2],
      });
    }

    setAllocations(finalAllocations);

    // Prepare data for backend with rollStart and rollEnd extracted
    const allocationsToSave = finalAllocations.map(a => {
      const [rollStart, rollEnd] = a.rollRange.includes('–')
        ? a.rollRange.split('–').map(r => r.trim())
        : [a.rollRange, a.rollRange];

      return {
        lab: a.lab,
        examName: a.examName,
        examDate: a.examDate,
        year: a.year,
        session: a.session,
        time: a.time,
        totalStudents: a.totalStudents,
        rollStart,
        rollEnd,
        classNames: a.classNames,
        invigilators: a.invigilators, // send array here
      };
    });

    // Send allocations to backend
    try {
      const res = await fetch('http://localhost:5000/api/save-lab-allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: allocationsToSave }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Allocations saved successfully!');
      } else {
        alert(`Failed to save allocations: ${data.message}`);
      }
    } catch (err) {
      alert('Error saving allocations, please try again.');
      console.error(err);
    }
  };

  // Download Excel with allocations info
  const downloadExcel = () => {
    if (!allocations.length) {
      alert("No allocations to download.");
      return;
    }

    const wsData = [
      ["Lab", "Class", "Roll Numbers", "Total Students", "Exam Name", "Exam Date", "Year", "Session", "Time", "Invigilator 1", "Invigilator 2"],
      ...allocations.map(a => [
        a.lab, a.classNames, a.rollRange, a.totalStudents,
        a.examName, a.examDate, a.year, a.session, a.time,
        a.invigilators[0], a.invigilators[1]
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lab Allocations");
    XLSX.writeFile(wb, `LabAllocations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="dashboard-container">
      <h2>Computer Lab Allocation</h2>
      <div className="control-panel">
        <select value={labCombo} onChange={e => setLabCombo(e.target.value)}>
          <option value="">Select Lab Combination</option>
          {labPairs.map((pair, idx) => (
            <option key={idx} value={pair}>{pair}</option>
          ))}
        </select>
        <input type="text" placeholder="Exam Name" value={examName} onChange={e => setExamName(e.target.value)} />
        <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />

        <select value={session} onChange={e => {
          setSession(e.target.value);
          setTime('');
        }}>
          <option value="">Select Session</option>
          <option value="FN">FN</option>
          <option value="AN">AN</option>
        </select>

        {session && (
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            placeholder="Select Time"
          />
        )}
        <select value={year} onChange={e => setYear(e.target.value)}>
          <option value="">Select Year</option>
          <option value="II">II</option>
          <option value="III">III</option>
          <option value="IV">IV</option>
        </select>

        <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
        <button onClick={allocateLabs}>Allocate</button>
        <button onClick={downloadExcel}>Download Excel</button>
      </div>

      {allocations.length > 0 && (
        <table className="allocation-table">
          <thead>
            <tr>
              <th>Lab</th>
              <th>Class</th>
              <th>Roll Numbers</th>
              <th>Total</th>
              <th>Exam</th>
              <th>Date</th>
              <th>Session</th>
              <th>Time</th>
              <th>Invigilator 1</th>
              <th>Invigilator 2</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, i) => (
              <tr key={i}>
                <td>{a.lab}</td>
                <td>{a.classNames}</td>
                <td>{a.rollRange}</td>
                <td>{a.totalStudents}</td>
                <td>{a.examName}</td>
                <td>{a.examDate}</td>
                <td>{a.session}</td>
                <td>{a.time}</td>
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

export default LabAllocator;
