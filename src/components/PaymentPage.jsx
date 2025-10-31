import React, { useState, useEffect } from "react";
import { Printer, CheckCircle } from "lucide-react";

const PaymentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    booking_id: "",
    payment_mode: "Cash",
    amount_paid: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bookings");
      const data = await response.json();
      setBookings(data.filter((b) => b.Booking_Status === "Active"));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleSelectBooking = async (bookingId) => {
    setFormData((prev) => ({
      ...prev,
      booking_id: bookingId,
    }));
    setSelectedBooking(bookingId);
    await fetchPayments(bookingId);
  };

  const fetchPayments = async (bookingId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/payments/${bookingId}`
      );
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
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
      const response = await fetch("http://localhost:5000/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setShowForm(false);
        }, 3000);
        await fetchPayments(formData.booking_id);
        setFormData({
          booking_id: formData.booking_id,
          payment_mode: "Cash",
          amount_paid: "",
        });
      }
    } catch (err) {
      console.error("Error recording payment:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const selectedBookingData = bookings.find(
    (b) => b.Booking_ID === parseInt(selectedBooking)
  );
  const totalPaid = payments.reduce((sum, p) => sum + (p.Amount_Paid || 0), 0);
  const balance = selectedBookingData
    ? selectedBookingData.Total_Amount - totalPaid
    : 0;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Payment Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Selection */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Active Bookings</h2>
          <div className="space-y-2">
            {bookings.map((booking) => (
              <button
                key={booking.Booking_ID}
                onClick={() => handleSelectBooking(booking.Booking_ID)}
                className={`w-full p-3 rounded text-left transition ${
                  selectedBooking === booking.Booking_ID
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="font-semibold">
                  Booking #{booking.Booking_ID}
                </div>
                <div className="text-sm">{booking.CustomerName}</div>
                <div className="text-sm">
                  ₹{booking.Total_Amount?.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Summary & Form */}
        {selectedBookingData && (
          <div className="md:col-span-2 space-y-6">
            {/* Payment Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Payment Summary</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{selectedBookingData.Total_Amount?.toFixed(2)}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Paid</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{totalPaid.toFixed(2)}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Balance</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{balance.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                >
                  {showForm ? "Hide" : "Record"} Payment
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700 flex items-center gap-2"
                >
                  <Printer size={18} />
                  Print Receipt
                </button>
              </div>
            </div>

            {/* Payment Form */}
            {showForm && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">
                  Record New Payment
                </h2>
                {submitted && (
                  <div className="bg-green-100 text-green-700 p-4 rounded mb-4 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Payment recorded successfully!
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Payment Mode
                    </label>
                    <select
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleInputChange}
                      className="w-full border p-2 rounded"
                    >
                      <option>Cash</option>
                      <option>Card</option>
                      <option>UPI</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Amount to Pay
                    </label>
                    <input
                      type="number"
                      name="amount_paid"
                      placeholder="Enter amount"
                      step="0.01"
                      value={formData.amount_paid}
                      onChange={handleInputChange}
                      required
                      className="w-full border p-2 rounded"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Max: ₹{balance.toFixed(2)}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                </form>
              </div>
            )}

            {/* Payment History */}
            {payments.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Payment ID</th>
                        <th className="border px-4 py-2">Date</th>
                        <th className="border px-4 py-2">Mode</th>
                        <th className="border px-4 py-2">Amount</th>
                        <th className="border px-4 py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.Payment_ID}>
                          <td className="border px-4 py-2">
                            {payment.Payment_ID}
                          </td>
                          <td className="border px-4 py-2">
                            {payment.Payment_Date}
                          </td>
                          <td className="border px-4 py-2">
                            {payment.Payment_Mode}
                          </td>
                          <td className="border px-4 py-2 font-semibold">
                            ₹{payment.Amount_Paid?.toFixed(2)}
                          </td>
                          <td className="border px-4 py-2">
                            ₹{payment.Balance_Amount?.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!selectedBookingData && bookings.length === 0 && (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            No active bookings to process payments.
          </p>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
