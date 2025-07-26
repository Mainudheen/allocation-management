import { useState } from 'react';
import * as XLSX from 'xlsx';

function RoomAllocator() {
  const [excelData, setExcelData] = useState([]);
  const [roomsInput, setRoomsInput] = useState('');
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
       // const roomPrefix = lastRoom.replace(/\d+/g, '') || 'R';
        const startNumber = roomNumMatch ? parseInt(roomNumMatch[0]) : 100;
        const newRoomNum = startNumber + (Math.floor(i / 30) - rooms.length + 1);
        room = `${newRoomNum}`;
      }

      // Get 2 different invigilators
      const inv1 = invigilatorList[invigilatorIndex % invigilatorList.length];
      const inv2 = invigilatorList[(invigilatorIndex + 1) % invigilatorList.length];
      invigilatorIndex += 2;

      const rollNumbers = batch.map(student => student.Roll || student['Roll No'] || student['RollNumber'] || student['RollNumber'] || '').filter(r => r !== '').join(', ');

      finalAllocation.push({
        className: 'AIDS A',
        room,
        totalStudents: batch.length,
        rollNumbers,
        invigilators: [inv1, inv2]
      });
    }

    setAllocations(finalAllocation);
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <br /><br />
      <input
        type="text"
        placeholder="Enter Room Numbers (comma separated)"
        onChange={(e) => setRoomsInput(e.target.value)}
      />
      <br /><br />
      <button onClick={allocate}>Allocate</button>

      {allocations.length > 0 && (
        <table border="1" cellPadding="10" style={{ marginTop: '20px' }}>
          <thead>
            <tr>
              <th>Class</th>
              <th>Room</th>
              <th>Total Students</th>
              <th>Roll Numbers</th>
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
