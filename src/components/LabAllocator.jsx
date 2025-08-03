import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './RoomAllocator.css'; // or LabAllocator.css if you have a separate style

function LabAllocator() {
  const [labCombo, setLabCombo] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [year, setYear] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const labPairs = [
    'CC1 & CC2', 'CC3 & CC4', 'CC5 & CC6',
    'CC7 & CC8', 'CC9 & CC10'
  ];

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

 const allocateLabs = () => {
  if (!labCombo || !examName || !examDate || !year || excelData.length === 0) {
    alert("Please fill all fields and upload an Excel file.");
    return;
  }

  const students = [...excelData];
  const finalAllocations = [];
  let invigilatorIndex = 0;

  // Determine starting index of labCombo
  const startIndex = labPairs.indexOf(labCombo);
  if (startIndex === -1) {
    alert("Invalid lab combination selected.");
    return;
  }

  // Slice from selected lab to end of labPairs
  const availableLabs = labPairs.slice(startIndex);

  // Check if we have enough labs for the number of students
  const requiredLabs = Math.ceil(students.length / 60);
  if (requiredLabs > availableLabs.length) {
    alert(`Not enough lab pairs to accommodate ${students.length} students. You need ${requiredLabs} labs.`);
    return;
  }

  for (let i = 0; i < students.length; i += 60) {
    const batch = students.slice(i, i + 60);
    const currentLab = availableLabs[Math.floor(i / 60)];

    const rollList = batch
      .map(s => s.Roll || s['Roll No'] || s['RollNumber'] || s['RollNo'])
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const rollRange = rollList.length > 1
      ? `${rollList[0]} – ${rollList[rollList.length - 1]}`
      : rollList[0];

    const classSet = new Set();
    batch.forEach(s => {
      const cls = s.className || s.ClassName;
      if (cls) classSet.add(cls.trim());
    });

    const inv1 = invigilatorList[invigilatorIndex % invigilatorList.length];
    const inv2 = invigilatorList[(invigilatorIndex + 1) % invigilatorList.length];
    invigilatorIndex += 2;

    finalAllocations.push({
      lab: currentLab,
      examName,
      examDate,
      year,
      totalStudents: batch.length,
      rollRange,
      classNames: Array.from(classSet).join(', '),
      invigilators: [inv1, inv2]
    });
  }

  setAllocations(finalAllocations);
};
const downloadExcel = () => {
  if (!allocations.length) {
    alert("No allocations to download.");
    return;
  }

  const wsData = [
    ["Lab", "Class", "Roll Numbers", "Total Students", "Exam Name", "Exam Date", "Year", "Invigilator 1", "Invigilator 2"],
    ...allocations.map(a => [
      a.lab, a.classNames, a.rollRange, a.totalStudents,
      a.examName, a.examDate, a.year, a.invigilators[0], a.invigilators[1]
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
              <th>Year</th>
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
                <td>{a.year}</td>
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
