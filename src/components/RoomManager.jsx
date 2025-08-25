// src/components/RoomsManager.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./RoomManager.css";

const ROOM_API_URL = "http://localhost:5000/api/rooms";

export default function RoomsManager({ onBack }) {
  const [rooms, setRooms] = useState([]);
  const [step, setStep] = useState("rooms"); // rooms | editRoom
  const [selectedRoom, setSelectedRoom] = useState(null); // ✅ for seating modal

  const [form, setForm] = useState({
    roomNo: "",
    floor: "",
    columns: [],
    _id: "",
  });

  const [newRoom, setNewRoom] = useState({
    roomNo: "",
    floor: "",
    columns: [{ colNo: 1, rows: 0 }],
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

  // ✅ Handle Column Changes
  const handleColumnChange = (roomState, setRoomState, index, field, value) => {
    const updatedColumns = [...roomState.columns];
    updatedColumns[index][field] =
      field === "colNo" || field === "rows" ? Number(value) : value;
    setRoomState({ ...roomState, columns: updatedColumns });
  };

  const addColumn = (roomState, setRoomState) => {
    const newColNo = roomState.columns.length + 1;
    setRoomState({
      ...roomState,
      columns: [...roomState.columns, { colNo: newColNo, rows: 0 }],
    });
  };

  const removeColumn = (roomState, setRoomState, index) => {
    const updatedColumns = roomState.columns.filter((_, i) => i !== index);
    setRoomState({ ...roomState, columns: updatedColumns });
  };

  // ✅ Add Room
  const handleAddRoom = async () => {
    if (!newRoom.roomNo || !newRoom.floor) {
      alert("Please fill all fields");
      return;
    }

    const preparedRoom = {
      ...newRoom,
      columns: newRoom.columns.map((col, i) => ({
        colNo: Number(col.colNo || i + 1),
        rows: Number(col.rows),
      })),
    };

    if (preparedRoom.columns.some((col) => col.rows <= 0)) {
      alert("Each column must have rows > 0");
      return;
    }

    try {
      await axios.post(ROOM_API_URL, preparedRoom);
      alert("Room added successfully ✅");
      setNewRoom({ roomNo: "", floor: "", columns: [{ colNo: 1, rows: 0 }] });
      fetchRooms();
    } catch (err) {
      alert("Failed to add room ❌");
      console.error(err.response?.data || err);
    }
  };

  // ✅ Edit Room
  const handleEditRoom = (room) => {
    setForm({
      _id: room._id,
      roomNo: room.roomNo,
      floor: room.floor,
      columns: room.columns,
    });
    setStep("editRoom");
  };

  // ✅ Update Room
  const handleUpdateRoom = async () => {
    if (!form.roomNo || !form.floor) {
      alert("Please fill all fields");
      return;
    }

    const preparedForm = {
      ...form,
      columns: form.columns.map((col, i) => ({
        colNo: Number(col.colNo || i + 1),
        rows: Number(col.rows),
      })),
    };

    if (preparedForm.columns.some((col) => col.rows <= 0)) {
      alert("Each column must have rows > 0");
      return;
    }

    try {
      await axios.put(`${ROOM_API_URL}/${form._id}`, preparedForm);
      alert("Room updated successfully ✅");
      setStep("rooms");
      fetchRooms();
    } catch (err) {
      alert("Failed to update room ❌");
      console.error(err.response?.data || err);
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

  // ✅ Grand total benches across all rooms
  const grandTotalBenches = rooms.reduce(
    (sum, room) => sum + (room.totalBenches || 0),
    0
  );

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

          <h3>Columns</h3>
          {form.columns.map((col, index) => (
            <div key={index} className="column-row">
              <span>Col {col.colNo}:</span>
              <input
                type="number"
                placeholder="Rows"
                value={col.rows}
                onChange={(e) =>
                  handleColumnChange(form, setForm, index, "rows", e.target.value)
                }
              />
              <button
                type="button"
                className="btn btn-red small-btn"
                onClick={() => removeColumn(form, setForm, index)}
              >
                ✖
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-green small-btn"
            onClick={() => addColumn(form, setForm)}
          >
            ➕ Add Column
          </button>

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

          <div className="form-card">
            <h2>➕ Add New Room</h2>
            <input
              type="text"
              name="roomNo"
              placeholder="Room No"
              value={newRoom.roomNo}
              onChange={handleNewRoomChange}
            />
            <select
              name="floor"
              value={newRoom.floor}
              onChange={handleNewRoomChange}
            >
              <option value="">Select Floor</option>
              <option value="Ground">Ground</option>
              <option value="First">First</option>
              <option value="Second">Second</option>
              <option value="Third">Third</option>
            </select>

            <h3>Columns</h3>
            {newRoom.columns.map((col, index) => (
              <div key={index} className="column-row">
                <span>Col {col.colNo}:</span>
                <input
                  type="number"
                  placeholder="Rows"
                  value={col.rows}
                  onChange={(e) =>
                    handleColumnChange(
                      newRoom,
                      setNewRoom,
                      index,
                      "rows",
                      e.target.value
                    )
                  }
                />
                <button
                  type="button"
                  className="btn btn-red small-btn"
                  onClick={() => removeColumn(newRoom, setNewRoom, index)}
                >
                  ✖
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-green small-btn"
              onClick={() => addColumn(newRoom, setNewRoom)}
            >
              ➕ Add Column
            </button>

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
                  <p>
                    <strong>Floor:</strong> {room.floor}
                  </p>
                  <h4>Columns:</h4>
                  <ul>
                    {room.columns.map((col, idx) => (
                      <li key={idx}>
                        Col {col.colNo}: {col.rows} rows
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>Total Benches:</strong> {room.totalBenches}
                  </p>

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
                    <button
                      onClick={() => setSelectedRoom(room)}
                      className="btn btn-green"
                    >
                      🪑 Seating
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No rooms found.</p>
            )}
          </div>

          {/* ✅ Grand total across all rooms */}
          {rooms.length > 0 && (
            <div className="total-benches">
              <h3>🏷 Total Benches in Building: {grandTotalBenches}</h3>
            </div>
          )}

          <button onClick={onBack} className="btn btn-gray back-btn">
            ⬅ Back
          </button>
        </div>
      )}

      {/* ---------------- Seating Modal ---------------- */}
      {selectedRoom && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              🪑 Seating Layout - Room {selectedRoom.roomNo} ({selectedRoom.floor}
              )
            </h2>
            <div
              className="seating-layout"
              style={{ display: "flex", gap: "20px", marginTop: "20px" }}
            >
              {selectedRoom.columns.map((col) => (
                <div key={col.colNo} style={{ textAlign: "center" }}>
                  <h4>Col {col.colNo}</h4>
                  <div style={{ display: "grid", gap: "5px" }}>
                    {Array.from({ length: col.rows }).map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: "40px",
                          height: "30px",
                          border: "1px solid #555",
                          borderRadius: "4px",
                          background: "#f5f5f5",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "12px",
                        }}
                      >
                        {idx + 1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-gray"
              style={{ marginTop: "20px" }}
              onClick={() => setSelectedRoom(null)}
            >
              ❌ Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
