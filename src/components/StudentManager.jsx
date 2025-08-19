import React, { useState } from "react";
import RoomsManager from "./RoomManager";
import axios from "axios";
import './CatOptionsPage';

const API_URL = "http://localhost:5000/api/students";

export default function StudentManager() {
  const [step, setStep] = useState("main"); // main | add | delete | singleAdd | bulkAdd | singleDelete | bulkDelete | rooms
  const [form, setForm] = useState({
    name: "",
    rollno: "",
    className: "",
    year: "",
    dob: "",
    search: "",
  });
  const [file, setFile] = useState(null);

  // Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Single student add
  const handleAddStudent = async () => {
    try {
      await axios.post(`${API_URL}/add`, form);
      alert("Student added successfully ✅");
      setForm({ name: "", rollno: "", className: "", year: "", dob: "", search: "" });
      setStep("main");
    } catch (err) {
      alert("Failed to add student ❌");
      console.error(err);
    }
  };

  // Bulk upload
  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Students uploaded successfully ✅");
      setFile(null);
      setStep("main");
    } catch (err) {
      alert("Upload failed ❌");
      console.error(err);
    }
  };

  // Single delete
  const handleDeleteStudent = async () => {
    try {
      if (!form.search) {
        alert("Please enter roll number");
        return;
      }
      await axios.delete(`${API_URL}/delete/${form.search}`);
      alert("Student deleted successfully ✅");
      setForm({ ...form, search: "" });
      setStep("main");
    } catch (err) {
      alert("Failed to delete student ❌");
      console.error(err);
    }
  };

  // Bulk delete (by year)
  const handleBulkDelete = async () => {
    try {
      if (!form.search) {
        alert("Please enter year");
        return;
      }
      await axios.delete(`${API_URL}/delete-by-year/${form.search}`);
      alert(`Students from year ${form.search} deleted successfully ✅`);
      setForm({ ...form, search: "" });
      setStep("main");
    } catch (err) {
      alert("Bulk delete failed ❌");
      console.error(err);
    }
  };

  return (
    <div className="cat-options-container">
      <div className="cat-options-buttons">

        {/* Main Options */}
        {step === "main" && (
          <div className="grid grid-cols-2 gap-6">
            <div
              onClick={() => setStep("add")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-blue-100"
            >
              <h2 className="cat-option-card">➕ Add Student</h2>
            </div>
            <div
              onClick={() => setStep("delete")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-red-100"
            >
              <h2 className="cat-option-card">🗑️ Delete Student</h2>
            </div>
            <div
              onClick={() => setStep("rooms")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-gray-200"
            >
              <h2 className="cat-option-card">🏫 Manage Rooms</h2>
            </div>
          </div>
        )}

        {/* Add Options */}
        {step === "add" && (
          <div className="grid grid-cols-2 gap-6">
            <div
              onClick={() => setStep("singleAdd")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-green-100"
            >
              <h2 className="cat-option-card">Add Single Student</h2>
            </div>
            <div
              onClick={() => setStep("bulkAdd")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-purple-100"
            >
              <h2 className="cat-option-card">Add Multiple (Excel)</h2>
            </div>
            <button
              onClick={() => setStep("main")}
              className="col-span-2 mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              ⬅ Back
            </button>
          </div>
        )}

        {/* Delete Options */}
        {step === "delete" && (
          <div className="grid grid-cols-2 gap-6">
            <div
              onClick={() => setStep("singleDelete")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-yellow-100"
            >
              <h2 className="cat-option-card">Delete Single</h2>
            </div>
            <div
              onClick={() => setStep("bulkDelete")}
              className="cursor-pointer bg-white p-6 rounded-2xl shadow-lg text-center hover:bg-pink-100"
            >
              <h2 className="cat-option-card">Delete by Year</h2>
            </div>
            <button
              onClick={() => setStep("main")}
              className="col-span-2 mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              ⬅ Back
            </button>
          </div>
        )}

        {/* Single Add */}
        {step === "singleAdd" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-xl font-bold mb-4 text-blue-600">Add Single Student</h2>
            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="border p-2 w-full mb-2"/>
            <input type="text" name="rollno" placeholder="Roll No" value={form.rollno} onChange={handleChange} className="border p-2 w-full mb-2"/>
            <input type="text" name="className" placeholder="Class" value={form.className} onChange={handleChange} className="border p-2 w-full mb-2"/>
            <label className="block text-gray-700">Year of Study:</label>
            <select name="year" value={form.year} onChange={handleChange} className="border p-2 w-full mb-2">
              <option value="">Select Year</option>
              <option value="II">II</option>
              <option value="III">III</option>
              <option value="IV">IV</option>
            </select>
            <input type="text" name="dob" placeholder="DOB (dd-mm-yyyy)" value={form.dob} onChange={handleChange} className="border p-2 w-full mb-2"/>
            <div className="flex gap-4">
              <button onClick={handleAddStudent} className="bg-blue-500 text-white px-4 py-2 rounded">Add Student</button>
              <button onClick={() => setStep("main")} className="bg-gray-500 text-white px-4 py-2 rounded">⬅ Back</button>
            </div>
          </div>
        )}

        {/* Bulk Add */}
        {step === "bulkAdd" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-xl font-bold mb-4 text-purple-600">Bulk Upload Students (Excel)</h2>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="border p-2 w-full mb-2"/>
            <div className="flex gap-4">
              <button onClick={handleUpload} className="bg-purple-500 text-white px-4 py-2 rounded">Upload</button>
              <button onClick={() => setStep("main")} className="bg-gray-500 text-white px-4 py-2 rounded">⬅ Back</button>
            </div>
          </div>
        )}

        {/* Single Delete */}
        {step === "singleDelete" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Single Student</h2>
            <input type="text" name="search" placeholder="Roll No" value={form.search} onChange={handleChange} className="border p-2 w-full mb-2"/>
            <div className="flex gap-4">
              <button onClick={handleDeleteStudent} className="bg-red-500 text-white px-4 py-2 rounded">Delete Student</button>
              <button onClick={() => setStep("main")} className="bg-gray-500 text-white px-4 py-2 rounded">⬅ Back</button>
            </div>
          </div>
        )}

        {/* Bulk Delete */}
        {step === "bulkDelete" && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
            <h2 className="text-xl font-bold mb-4 text-pink-600">Bulk Delete Students by Year</h2>
            <input type="text" name="search" placeholder="Enter Year" value={form.search} onChange={handleChange} className="border p-2 w-full mb-2"/>
            <div className="flex gap-4">
              <button onClick={handleBulkDelete} className="bg-pink-500 text-white px-4 py-2 rounded">Delete by Year</button>
              <button onClick={() => setStep("main")} className="bg-gray-500 text-white px-4 py-2 rounded">⬅ Back</button>
            </div>
          </div>
        )}

        {/* Rooms Manager */}
        {step === "rooms" && <RoomsManager onBack={() => setStep("main")} />}

      </div>
    </div>
  );
}
