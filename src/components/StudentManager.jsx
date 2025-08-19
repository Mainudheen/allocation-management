import React, { useState, useEffect } from "react";
import RoomsManager from "./RoomManager";
import axios from "axios";
import "./StudentManager.css";

const API_URL = "http://localhost:5000/api/students";

export default function StudentManager() {
  const [step, setStep] = useState("main");
  const [form, setForm] = useState({
    name: "",
    rollno: "",
    className: "",
    year: "",
    dob: "",
    search: "",
  });
  const [file, setFile] = useState(null);

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add single student
  const handleAddStudent = async () => {
    try {
      await axios.post(`${API_URL}/add`, form);
      alert("✅ Student added successfully");
      setForm({ name: "", rollno: "", className: "", year: "", dob: "", search: "" });
      setStep("main");
    } catch (err) {
      alert("❌ Failed to add student");
      console.error(err);
    }
  };

  // Bulk upload students
  const handleUpload = async () => {
    try {
      if (!file) return alert("Please select a file");

      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✅ Students uploaded successfully");
      setFile(null);
      setStep("main");
    } catch (err) {
      alert("❌ Upload failed");
      console.error(err);
    }
  };

  // Delete single student
  const handleDeleteStudent = async () => {
    try {
      if (!form.search) return alert("Please enter a roll number");
      await axios.delete(`${API_URL}/delete/${form.search.toUpperCase()}`);
      alert("✅ Student deleted successfully");
      setForm({ ...form, search: "", name: "", rollno: "", className: "", year: "" });
      setStep("main");
    } catch (err) {
      alert("❌ Failed to delete student");
      console.error(err);
    }
  };

  // Bulk delete by year
  const handleBulkDelete = async () => {
    try {
      if (!form.search) return alert("Please enter year");
      await axios.delete(`${API_URL}/delete-by-year/${form.search}`);
      alert(`✅ Students from year ${form.search} deleted successfully`);
      setForm({ ...form, search: "" });
      setStep("main");
    } catch (err) {
      alert("❌ Bulk delete failed");
      console.error(err);
    }
  };

  // Auto-fetch student details when typing rollno
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (!form.search) {
        setForm((prev) => ({ ...prev, name: "", rollno: "", className: "", year: "" }));
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/get/${form.search.toUpperCase()}`);
        if (res.data) {
          setForm((prev) => ({
            ...prev,
            name: res.data.name,
            rollno: res.data.rollno,
            className: res.data.className,
            year: res.data.year,
          }));
        } else {
          setForm((prev) => ({ ...prev, name: "", rollno: "", className: "", year: "" }));
        }
      } catch {
        setForm((prev) => ({ ...prev, name: "", rollno: "", className: "", year: "" }));
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [form.search]);

  return (
    <div className="cat-options-container">
      <div className="cat-options-buttons">
        {/* ===== Main Menu ===== */}
        {step === "main" && (
          <>
            <div onClick={() => setStep("add")} className="cat-option-card option-blue">
              ➕ Add Student
            </div>
            <div onClick={() => setStep("delete")} className="cat-option-card option-red">
              🗑️ Delete Student
            </div>
            <div onClick={() => setStep("rooms")} className="cat-option-card option-gray">
              🏫 Manage Rooms
            </div>
          </>
        )}

        {/* ===== Add Menu ===== */}
        {step === "add" && (
          <>
            <div onClick={() => setStep("singleAdd")} className="cat-option-card option-green">
              ➕ Add Single Student
            </div>
            <div onClick={() => setStep("bulkAdd")} className="cat-option-card option-purple">
              📂 Add Multiple (Excel)
            </div>
            <button onClick={() => setStep("main")} className="btn bg-gray-500">⬅ Back</button>
          </>
        )}

        {/* ===== Delete Menu ===== */}
        {step === "delete" && (
          <>
            <div onClick={() => setStep("singleDelete")} className="cat-option-card option-pink">
              🗑️ Delete Single
            </div>
            <div onClick={() => setStep("bulkDelete")} className="cat-option-card option-purple">
              🗑️ Delete by Year
            </div>
            <button onClick={() => setStep("main")} className="btn bg-gray-500">⬅ Back</button>
          </>
        )}

        {/* ===== Single Add ===== */}
        {step === "singleAdd" && (
          <div className="form-card bg-white">
            <h2>Add Single Student</h2>
            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
            <input type="text" name="rollno" placeholder="Roll No" value={form.rollno} onChange={handleChange} />
            <input type="text" name="className" placeholder="Class" value={form.className} onChange={handleChange} />
            <select name="year" value={form.year} onChange={handleChange}>
              <option value="">Select Year</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
            <input type="text" name="dob" placeholder="DOB (dd-mm-yyyy)" value={form.dob} onChange={handleChange} />
            <div className="btn-group">
              <button onClick={handleAddStudent} className="btn bg-blue-500">Add Student</button>
              <button onClick={() => setStep("main")} className="btn bg-gray-500">⬅ Back</button>
            </div>
          </div>
        )}

        {/* ===== Bulk Add ===== */}
        {step === "bulkAdd" && (
          <div className="form-card bg-white">
            <h2>Bulk Upload Students (Excel)</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            <div className="btn-group">
              <button onClick={handleUpload} className="btn bg-purple-500">Upload</button>
              <button onClick={() => setStep("main")} className="btn bg-gray-500">⬅ Back</button>
            </div>
          </div>
        )}

        {/* ===== Single Delete ===== */}
        {step === "singleDelete" && (
          <div className="form-card bg-white">
            <h2>Delete Single Student</h2>
            <input type="text" name="search" placeholder="Roll No" value={form.search} onChange={handleChange} />
            {form.name && (
              <div className="student-info-card">
                <p><strong>Name:</strong> {form.name}</p>
                <p><strong>Roll No:</strong> {form.rollno}</p>
                <p><strong>Class:</strong> {form.className}</p>
                <p><strong>Year:</strong> {form.year}</p>
              </div>
            )}
            <div className="btn-group">
              <button onClick={handleDeleteStudent} className="btn bg-red-500">Delete Student</button>
              <button onClick={() => setStep("main")} className="btn bg-gray-500">⬅ Back</button>
            </div>
          </div>
        )}

        {/* ===== Bulk Delete ===== */}
        {step === "bulkDelete" && (
          <div className="form-card bg-white">
            <h2>Bulk Delete Students by Year</h2>
            <input type="text" name="search" placeholder="Enter Year (II / III / IV)" value={form.search} onChange={handleChange} />
            <div className="btn-group">
              <button onClick={handleBulkDelete} className="btn bg-pink-500">Delete by Year</button>
              <button onClick={() => setStep("main")} className="btn bg-gray-500">⬅ Back</button>
            </div>
          </div>
        )}

        {/* ===== Rooms Manager (cards grid) ===== */}
        {step === "rooms" && (
          <div className="manage-rooms-container">
            <RoomsManager onBack={() => setStep("main")} />
          </div>
        )}
      </div>
    </div>
  );
}
