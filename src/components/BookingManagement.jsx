import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Fetch available rooms when dates change
    if (name === "check_in_date" || name === "check_out_date") {
      if (formData.check_in_date && formData.check_out_date) {
        const checkIn =
          name === "check_in_date" ? value : formData.check_in_date;
        const checkOut =
          name === "check_out_date" ? value : formData.check_out_date;
        fetchAvailableRooms(checkIn, checkOut);
      }
    }
  };

  const fetchAvailableRooms = async (checkIn, checkOut) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/available/${checkIn}/${checkOut}`
      );
      const data = await response.json();
      setAvailableRooms(data);
    } catch (err) {
      console.error("Error fetching available rooms:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result = await response.json();
        setSubmitted(true);
        setFormData({
          customer_id: "",
          room_id: "",
          check_in_date: "",
          check_out_date: "",
        });
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 3000);
        fetchBookings();
      }
    } catch (err) {
      console.error("Error creating booking:", err);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_status: newStatus,
          }),
        }
      );
      if (response.ok) {
        fetchBookings();
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Booking Management
      </h1>

      {/* Create Booking Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Create New Booking</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
          >
            {showForm ? "Hide" : "Show"} Form
          </button>
        </div>

        {showForm && (
          <>
            {submitted && (
              <div className="bg-green-100 text-green-700 p-4 rounded mb-4 flex items-center gap-2">
                <CheckCircle size={20} />
                Booking created successfully!
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option
                    key={customer.Customer_ID}
                    value={customer.Customer_ID}
                  >
                    {customer.Name} ({customer.Phone})
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="check_in_date"
                value={formData.check_in_date}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />

              <input
                type="date"
                name="check_out_date"
                value={formData.check_out_date}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              />

              <select
                name="room_id"
                value={formData.room_id}
                onChange={handleInputChange}
                required
                className="border p-2 rounded"
              >
                <option value="">Select Room</option>
                {availableRooms.map((room) => (
                  <option key={room.Room_ID} value={room.Room_ID}>
                    Room {room.Room_Number} ({room.Room_Type}) - ₹
                    {room.Price_Per_Night}/night
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700 md:col-span-2"
              >
                Create Booking
              </button>
            </form>
          </>
        )}
      </div>

      {/* Bookings List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">All Bookings</h2>

        {bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2">Booking ID</th>
                  <th className="border px-4 py-2">Customer</th>
                  <th className="border px-4 py-2">Room</th>
                  <th className="border px-4 py-2">Check-in</th>
                  <th className="border px-4 py-2">Check-out</th>
                  <th className="border px-4 py-2">Amount</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.Booking_ID}>
                    <td className="border px-4 py-2 font-semibold">
                      {booking.Booking_ID}
                    </td>
                    <td className="border px-4 py-2">{booking.CustomerName}</td>
                    <td className="border px-4 py-2">
                      {booking.Room_Number} ({booking.Room_Type})
                    </td>
                    <td className="border px-4 py-2">
                      {booking.Check_In_Date}
                    </td>
                    <td className="border px-4 py-2">
                      {booking.Check_Out_Date}
                    </td>
                    <td className="border px-4 py-2 font-semibold">
                      ₹{booking.Total_Amount?.toFixed(2)}
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded font-semibold ${getStatusColor(
                          booking.Booking_Status
                        )}`}
                      >
                        {booking.Booking_Status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-sm">
                      {booking.Booking_Status === "Active" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                booking.Booking_ID,
                                "Completed"
                              )
                            }
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                booking.Booking_ID,
                                "Cancelled"
                              )
                            }
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No bookings found.</p>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
