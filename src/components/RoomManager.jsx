// src/components/RoomsManager.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const ROOM_API_URL = "http://localhost:5000/api/rooms";

export default function RoomsManager({ onBack }) {
  const [rooms, setRooms] = useState([]);
  const [step, setStep] = useState("rooms"); // rooms | editRoom
  const [form, setForm] = useState({
    roomNo: "",
    floor: "",
    benches: "",
    _id: "",
  });
  const [newRoom, setNewRoom] = useState({
    roomNo: "",
    floor: "",
    benches: "",
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
    if (!newRoom.roomNo || !newRoom.floor || !newRoom.benches) {
      alert("Please fill all fields");
      return;
    }
    try {
      await axios.post(ROOM_API_URL, {
        roomNo: newRoom.roomNo,
        floor: newRoom.floor,
        benches: Number(newRoom.benches),
      });
      alert("Room added successfully ✅");
      setNewRoom({ roomNo: "", floor: "", benches: "" });
      fetchRooms();
    } catch (err) {
      alert("Failed to add room ❌");
      console.error(err);
    }
  };

  // ✅ Edit Room
  const handleEditRoom = (room) => {
    setForm(room);
    setStep("editRoom");
  };

  // ✅ Update Room
  const handleUpdateRoom = async () => {
    try {
      await axios.put(`${ROOM_API_URL}/${form._id}`, {
        roomNo: form.roomNo,
        floor: form.floor,
        benches: Number(form.benches),
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
    <div className="mt-6">

      {/* ---------------- Edit Room ---------------- */}
      {step === "editRoom" && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mt-6">
          <h2 className="text-xl font-bold mb-4 text-blue-600">Edit Room</h2>
          <input
            type="text"
            name="roomNo"
            placeholder="Room No"
            value={form.roomNo}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />
          <select
            name="floor"
            value={form.floor}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          >
            <option value="">Select Floor</option>
            <option value="Ground">Ground</option>
            <option value="First">First</option>
            <option value="Second">Second</option>
            <option value="Third">Third</option>
          </select>
          <input
            type="number"
            name="benches"
            placeholder="No. of Benches"
            value={form.benches}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
          />
          <div className="flex gap-4">
            <button
              onClick={handleUpdateRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Update Room
            </button>
            <button
              onClick={() => setStep("rooms")}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              ⬅ Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---------------- Rooms List & Add Room ---------------- */}
      {step === "rooms" && (
        <div>
          <h2 className="text-2xl font-bold mb-6 text-purple-700">🏫 All Rooms</h2>

          {/* Add New Room */}
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">➕ Add New Room</h3>
            <input
              type="text"
              name="roomNo"
              placeholder="Room No"
              value={newRoom.roomNo}
              onChange={handleNewRoomChange}
              className="border p-2 w-full mb-2"
            />
            <select
              name="floor"
              value={newRoom.floor}
              onChange={handleNewRoomChange}
              className="border p-2 w-full mb-2"
            >
              <option value="">Select Floor</option>
              <option value="Ground">Ground</option>
              <option value="First">First</option>
              <option value="Second">Second</option>
              <option value="Third">Third</option>
            </select>
            <input
              type="number"
              name="benches"
              placeholder="No. of Benches"
              value={newRoom.benches}
              onChange={handleNewRoomChange}
              className="border p-2 w-full mb-2"
            />
            <button
              onClick={handleAddRoom}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Room
            </button>
          </div>

          {/* Rooms List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className="bg-gradient-to-br from-purple-100 to-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">{room.roomNo}</h3>
                  <p className="text-gray-700"><strong>Floor:</strong> {room.floor}</p>
                  <p className="text-gray-700"><strong>Benches:</strong> {room.benches}</p>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition"
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

          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded mt-6 transition"
          >
            ⬅ Back
          </button>
        </div>
      )}
    </div>
  );
}
