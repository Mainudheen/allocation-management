// src/components/RoomsManager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RoomManager.css"; // ✅ Separate CSS file

const ROOM_API_URL = "http://localhost:5000/api/rooms";

export default function RoomsManager({ onBack }) {
  const [rooms, setRooms] = useState([]);
  const [step, setStep] = useState("rooms"); // rooms | editRoom

  const [form, setForm] = useState({
    roomNo: "",
    floor: "",
    benches: "",
    columns: "",
    _id: "",
  });

  const [newRoom, setNewRoom] = useState({
    roomNo: "",
    floor: "",
    benches: "",
    columns: "",
  });

  // ✅ Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await axios.get(ROOM_API_URL);
      setRooms(res.data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ✅ Handle Input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewRoomChange = (e) => {
    setNewRoom({ ...newRoom, [e.target.name]: e.target.value });
  };

  // ✅ Add Room
  const handleAddRoom = async () => {
    if (!newRoom.roomNo || !newRoom.floor || !newRoom.benches || !newRoom.columns) {
      alert("Please fill all fields");
      return;
    }
    try {
      await axios.post(ROOM_API_URL, {
        roomNo: newRoom.roomNo,
        floor: newRoom.floor,
        benches: Number(newRoom.benches),
        columns: Number(newRoom.columns),
      });
      alert("Room added successfully ✅");
      setNewRoom({ roomNo: "", floor: "", benches: "", columns: "" });
      fetchRooms();
    } catch (err) {
      alert("Failed to add room ❌");
      console.error(err);
    }
  };

  // ✅ Edit Room
  const handleEditRoom = (room) => {
    setForm({
      ...room,
      benches: room.benches || 0,
      columns: room.columns || 0,
    });
    setStep("editRoom");
  };

  // ✅ Update Room
  const handleUpdateRoom = async () => {
    if (!form.roomNo || !form.floor || !form.benches || !form.columns) {
      alert("Please fill all fields");
      return;
    }
    try {
      await axios.put(`${ROOM_API_URL}/${form._id}`, {
        roomNo: form.roomNo,
        floor: form.floor,
        benches: Number(form.benches),
        columns: Number(form.columns),
      });
      alert("Room updated successfully ✅");
      setStep("rooms");
      fetchRooms();
    } catch (err) {
      alert("Failed to update room ❌");
      console.error(err);
    }
  };

  // ✅ Delete Room
  const handleDeleteRoom = async (id) => {
    try {
      await axios.delete(`${ROOM_API_URL}/${id}`);
      alert("Room deleted successfully ✅");
      fetchRooms();
    } catch (err) {
      alert("Failed to delete room ❌");
      console.error(err);
    }
  };

  return (
    <div className="rooms-container">
      {/* ---------------- Edit Room ---------------- */}
      {step === "editRoom" && (
        <div className="form-card">
          <h2>Edit Room</h2>
          <input
            type="text"
            name="roomNo"
            placeholder="Room No"
            value={form.roomNo}
            onChange={handleChange}
          />
          <select name="floor" value={form.floor} onChange={handleChange}>
            <option value="">Select Floor</option>
            <option value="Ground">Ground</option>
            <option value="First">First</option>
            <option value="Second">Second</option>
            <option value="Third">Third</option>
          </select>
          <input
            type="number"
            name="benches"
            placeholder="Total Benches"
            value={form.benches}
            onChange={handleChange}
          />
          <input
            type="number"
            name="columns"
            placeholder="No. of Columns"
            value={form.columns}
            onChange={handleChange}
          />
          <div className="btn-group">
            <button onClick={handleUpdateRoom} className="btn btn-blue">
              Update Room
            </button>
            <button onClick={() => setStep("rooms")} className="btn btn-gray">
              ⬅ Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Rooms List & Add Room ---------------- */}
      {step === "rooms" && (
        <div>
          <h1 className="page-title">🏫 Manage Rooms</h1>

          {/* Add New Room Form */}
          <div className="form-card">
            <h2>➕ Add New Room</h2>
            <input
              type="text"
              name="roomNo"
              placeholder="Room No"
              value={newRoom.roomNo}
              onChange={handleNewRoomChange}
            />
            <select name="floor" value={newRoom.floor} onChange={handleNewRoomChange}>
              <option value="">Select Floor</option>
              <option value="Ground">Ground</option>
              <option value="First">First</option>
              <option value="Second">Second</option>
              <option value="Third">Third</option>
            </select>
            <input
              type="number"
              name="benches"
              placeholder="Total Benches"
              value={newRoom.benches}
              onChange={handleNewRoomChange}
            />
            <input
              type="number"
              name="columns"
              placeholder="No. of Columns"
              value={newRoom.columns}
              onChange={handleNewRoomChange}
            />
            <button onClick={handleAddRoom} className="btn btn-green">
              Add Room
            </button>
          </div>

          {/* Rooms Grid */}
          <div className="rooms-grid">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div key={room._id} className="room-card">
                  <h2>Room {room.roomNo}</h2>
                  <p><strong>Floor:</strong> {room.floor}</p>
                  <p><strong>Total Benches:</strong> {room.benches}</p>
                  <p><strong>Rows:</strong> {room.rows}</p>
                  <p><strong>Columns:</strong> {room.columns}</p>
                  <div className="btn-group">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="btn btn-blue"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="btn btn-red"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No rooms found.</p>
            )}
          </div>

          <button onClick={onBack} className="btn btn-gray back-btn">
            ⬅ Back
          </button>
        </div>
      )}
    </div>
  );
}
