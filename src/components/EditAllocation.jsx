import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EditAllocation.css';

function EditAllocation() {
  const location = useLocation();
  const navigate = useNavigate();
  const allocation = location.state?.allocation;

  const [formData, setFormData] = useState(allocation ? {
    examName: allocation.examName || '',
    examDate: allocation.examDate || '',
    room: allocation.room || '',
    hallNo: allocation.hallNo || '',
    totalStudents: allocation.totalStudents || 0,
    rollNumbers: allocation.rollNumbers || '',
    cat: allocation.cat || '',
    session: allocation.session || '',
    year: allocation.year || '',
    semNo: allocation.semNo || '',
    invigilators: allocation.invigilators || ['', '']
  } : {});
  const [semesterNumber, setSemesterNumber] = useState(allocation && allocation.semNo ? parseInt(allocation.semNo.split(' ')[2]) || '' : '');

  const invigilatorList = [
    'Mrs.Latha', 'Mrs.Kalaivani', 'Mrs.Thangamani',
    'Mrs.Ramya', 'Mrs.Renuga', 'Mr.Kanan', 'Mr.Natesan'
  ];

  useEffect(() => {
    if (semesterNumber) {
      const num = parseInt(semesterNumber);
      const semesterDisplay = num % 2 === 1 ? `Odd Sem ${num}` : `Even Sem ${num}`;
      setFormData(prev => ({ ...prev, semNo: semesterDisplay }));
    }
  }, [semesterNumber]);

  if (!allocation) {
    return <p>No allocation data found.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('invigilators')) {
      const index = parseInt(name.split('[')[1]);
      const newInvigilators = [...formData.invigilators];
      newInvigilators[index] = value;
      setFormData({ ...formData, invigilators: newInvigilators });
    } else if (name === 'totalStudents') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/allocation/${allocation._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('Allocation updated successfully!');
        navigate('/manage-allotments');
      } else {
        const errorData = await res.json();
        alert(`Error updating allocation: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Error updating allocation:', err);
      alert('Server error');
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="section-title">Edit Allocation</h2>
      <div className="control-panel">
        <div>
          <label>CAT:</label>
          <div className="radio-group compact">
            {[1, 2, 3].map(n => (
              <label key={n}>
                <input
                  type="radio"
                  name="cat"
                  value={n}
                  checked={formData.cat === `${n}`}
                  onChange={handleChange}
                /> {n}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label>Session:</label>
          <div className="radio-group compact">
            {["FN", "AN"].map(s => (
              <label key={s}>
                <input
                  type="radio"
                  name="session"
                  value={s}
                  checked={formData.session === s}
                  onChange={handleChange}
                /> {s}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="examDate"
            value={formData.examDate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Subject with Code:</label>
          <input
            type="text"
            name="examName"
            value={formData.examName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Year of Study:</label>
          <select
            name="year"
            value={formData.year}
            onChange={handleChange}
          >
            <option value="">Select Year</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
        </div>
        <div>
          <label>Semester Number:</label>
          <input
            type="number"
            min="1"
            max="8"
            value={semesterNumber}
            onChange={e => setSemesterNumber(e.target.value)}
          />
        </div>
        <div>
          <label>Hall No:</label>
          <input
            type="text"
            name="hallNo"
            value={formData.hallNo}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Room Number:</label>
          <input
            type="text"
            name="room"
            value={formData.room}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Total Students:</label>
          <input
            type="number"
            name="totalStudents"
            value={formData.totalStudents}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Invigilator 1:</label>
          <select
            name="invigilators[0]"
            value={formData.invigilators[0]}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {invigilatorList.map((i, idx) => (
              <option key={idx} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Invigilator 2:</label>
          <select
            name="invigilators[1]"
            value={formData.invigilators[1]}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {invigilatorList.map((i, idx) => (
              <option key={idx} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Roll Numbers (Range):</label>
          <textarea
            name="rollNumbers"
            value={formData.rollNumbers}
            onChange={handleChange}
            placeholder="e.g., CS001–CS030"
          />
        </div>
        <button className="allocate-all-button" type="button" onClick={handleSave}>
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default EditAllocation;