import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "Single",
    price_per_night: "",
    floor_number: "",
  });
  const [editId, setEditId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({
          room_number: "",
          room_type: "Single",
          price_per_night: "",
          floor_number: "",
        });
        setTimeout(() => setSubmitted(false), 3000);
        fetchRooms();
      }
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };

  const handleUpdateStatus = async (roomId, newStatus) => {
    try {
      const room = rooms.find((r) => r.Room_ID === roomId);
      const response = await fetch(
        `http://localhost:5000/api/rooms/${roomId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_type: room.Room_Type,
            price_per_night: room.Price_Per_Night,
            floor_number: room.Floor_Number,
            status: newStatus,
          }),
        }
      );
      if (response.ok) {
        fetchRooms();
      }
    } catch (err) {
      console.error("Error updating room:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Booked":
        return "bg-red-100 text-red-800";
      case "Under Maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredRooms =
    filter === "All" ? rooms : rooms.filter((r) => r.Status === filter);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Room Management</h1>

      {/* Add Room Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Room</h2>
        {submitted && (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            Room added successfully!
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <input
            type="number"
            name="room_number"
            placeholder="Room Number"
            value={formData.room_number}
            onChange={handleInputChange}
            required
            className="border p-2 rounded"
          />
          <select
            name="room_type"
            value={formData.room_type}
            onChange={handleInputChange}
            className="border p-2 rounded"
          >
            <option>Single</option>
            <option>Double</option>
            <option>Suite</option>
          </select>
          <input
            type="number"
            name="price_per_night"
            placeholder="Price Per Night"
            step="0.01"
            value={formData.price_per_night}
            onChange={handleInputChange}
            required
            className="border p-2 rounded"
          />
          <input
            type="number"
            name="floor_number"
            placeholder="Floor Number"
            value={formData.floor_number}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 md:col-span-4"
          >
            Add Room
          </button>
        </form>
      </div>

      {/* Rooms List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Rooms & Availability</h2>
          <div className="flex gap-2">
            {["All", "Available", "Booked", "Under Maintenance"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded font-semibold ${
                    filter === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Room #</th>
                <th className="border px-4 py-2">Type</th>
                <th className="border px-4 py-2">Price/Night</th>
                <th className="border px-4 py-2">Floor</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.Room_ID}>
                  <td className="border px-4 py-2 font-semibold">
                    {room.Room_Number}
                  </td>
                  <td className="border px-4 py-2">{room.Room_Type}</td>
                  <td className="border px-4 py-2">₹{room.Price_Per_Night}</td>
                  <td className="border px-4 py-2">{room.Floor_Number}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded font-semibold ${getStatusColor(
                        room.Status
                      )}`}
                    >
                      {room.Status}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-sm">
                    <select
                      value={room.Status}
                      onChange={(e) =>
                        handleUpdateStatus(room.Room_ID, e.target.value)
                      }
                      className="border p-1 rounded text-xs"
                    >
                      <option>Available</option>
                      <option>Booked</option>
                      <option>Under Maintenance</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
