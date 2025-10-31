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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="w-full">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Room Management
        </h1>

        {/* Add Room Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Add New Room
          </h2>
          {submitted && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 border border-green-200 flex items-center gap-2">
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
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <input
              type="number"
              name="floor_number"
              placeholder="Floor Number"
              value={formData.floor_number}
              onChange={handleInputChange}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition-colors md:col-span-4"
            >
              Add Room
            </button>
          </form>
        </div>

        {/* Rooms List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Rooms & Availability
            </h2>
            <div className="flex gap-2 flex-wrap">
              {["All", "Available", "Booked", "Under Maintenance"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === status
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Room #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price/Night
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Floor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRooms.map((room) => (
                  <tr
                    key={room.Room_ID}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {room.Room_Number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.Room_Type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{room.Price_Per_Night}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {room.Floor_Number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(
                          room.Status
                        )}`}
                      >
                        {room.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={room.Status}
                        onChange={(e) =>
                          handleUpdateStatus(room.Room_ID, e.target.value)
                        }
                        className="border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
    </div>
  );
};

export default RoomManagement;
