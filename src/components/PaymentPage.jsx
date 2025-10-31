import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Box,
} from "@mui/material";
import {
  Printer,
  Search,
  DollarSign,
  Receipt,
  Eye,
  Trash2,
} from "lucide-react";

const PaymentPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [formData, setFormData] = useState({
    booking_id: "",
    payment_mode: "Cash",
    amount_paid: "",
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, bookings, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/bookings");
      const allBookings = await response.json();

      // Fetch payments for each booking to calculate balance
      const bookingsWithPayments = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const paymentsRes = await fetch(
              `http://localhost:5000/api/payments/${booking.Booking_ID}`
            );
            const paymentsData = await paymentsRes.json();
            const totalPaid = paymentsData.reduce(
              (sum, p) => sum + (p.Amount_Paid || 0),
              0
            );
            const balance = booking.Total_Amount - totalPaid;
            return { ...booking, totalPaid, balance };
          } catch {
            return { ...booking, totalPaid: 0, balance: booking.Total_Amount };
          }
        })
      );

      setBookings(bookingsWithPayments);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
    setLoading(false);
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

  const filterBookings = () => {
    let filtered = bookings;

    // Apply status filter (Pending = has balance > 0, Paid = balance == 0)
    if (statusFilter === "Pending") {
      filtered = filtered.filter((booking) => booking.balance > 0);
    } else if (statusFilter === "Paid") {
      filtered = filtered.filter((booking) => booking.balance === 0);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.Booking_ID.toString().includes(query) ||
          booking.CustomerName.toLowerCase().includes(query) ||
          booking.Room_Number.toString().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = (booking) => {
    setSelectedBooking(booking);
    setFormData({
      booking_id: booking.Booking_ID,
      payment_mode: "Cash",
      amount_paid: "",
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
    setFormData({
      booking_id: "",
      payment_mode: "Cash",
      amount_paid: "",
    });
    setSubmitted(false);
  };

  const handleOpenHistoryDialog = async (booking) => {
    setSelectedBooking(booking);
    await fetchPayments(booking.Booking_ID);
    setOpenHistoryDialog(true);
  };

  const handleCloseHistoryDialog = () => {
    setOpenHistoryDialog(false);
    setSelectedBooking(null);
    setPayments([]);
  };

  const handleSubmit = async () => {
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
          handleCloseDialog();
          fetchBookings();
        }, 2000);
      }
    } catch (err) {
      console.error("Error recording payment:", err);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/payments/${paymentId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          await fetchPayments(selectedBooking.Booking_ID);
          fetchBookings();
        }
      } catch (err) {
        console.error("Error deleting payment:", err);
      }
    }
  };

  const handlePrintReceipt = (booking) => {
    // Create a printable receipt
    const receiptContent = `
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin: 20px 0; }
            .details div { margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Payment Receipt</h1>
            <p>Hotel Management System</p>
          </div>
          <div class="details">
            <div><strong>Booking ID:</strong> ${booking.Booking_ID}</div>
            <div><strong>Customer:</strong> ${booking.CustomerName}</div>
            <div><strong>Room:</strong> ${booking.Room_Number} (${
      booking.Room_Type
    })</div>
            <div><strong>Check-In:</strong> ${booking.Check_In_Date}</div>
            <div><strong>Check-Out:</strong> ${booking.Check_Out_Date}</div>
            <div><strong>Total Amount:</strong> ₹${booking.Total_Amount?.toFixed(
              2
            )}</div>
            <div><strong>Amount Paid:</strong> ₹${booking.totalPaid?.toFixed(
              2
            )}</div>
            <div><strong>Balance:</strong> ₹${booking.balance?.toFixed(2)}</div>
          </div>
          <p style="text-align: center; margin-top: 50px;">Thank you for your payment!</p>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ padding: "32px", width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Payment Management
        </Typography>
      </div>

      {/* Payments Table Paper */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
        }}
      >
        {/* Search and Filter Bar */}
        <div
          style={{
            marginBottom: "24px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Search size={20} style={{ color: "#757575" }} />
            <TextField
              placeholder="Search by booking ID, customer name, or room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                },
              }}
            />
          </div>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={statusFilter}
              label="Payment Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Paid">Fully Paid</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Bookings Table */}
        {!loading && bookings.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: "background.default",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Booking ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Room
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Paid
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow
                    key={booking.Booking_ID}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                      }}
                    >
                      #{booking.Booking_ID}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.9rem", fontWeight: "medium" }}
                    >
                      {booking.CustomerName}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Chip
                        label={`${booking.Room_Number} (${booking.Room_Type})`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      ₹{booking.Total_Amount?.toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.9rem", fontWeight: "medium" }}
                    >
                      <Chip
                        label={`₹${booking.totalPaid?.toFixed(2)}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Chip
                        label={`₹${booking.balance?.toFixed(2)}`}
                        size="small"
                        color={booking.balance > 0 ? "warning" : "success"}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Chip
                        label={booking.balance > 0 ? "Pending" : "Paid"}
                        size="small"
                        color={booking.balance > 0 ? "warning" : "success"}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(booking)}
                          disabled={booking.balance <= 0}
                          title="Record Payment"
                        >
                          <DollarSign size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenHistoryDialog(booking)}
                          title="View Payment History"
                        >
                          <Eye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePrintReceipt(booking)}
                          title="Print Receipt"
                        >
                          <Receipt size={18} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : loading ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            Loading bookings...
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No bookings found.
          </Typography>
        )}

        {/* No Results Message */}
        {!loading &&
          bookings.length > 0 &&
          filteredBookings.length === 0 &&
          (searchQuery || statusFilter !== "All") && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No bookings match your filters.
            </Typography>
          )}
      </Paper>

      {/* Record Payment Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Record Payment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment recorded successfully!
            </Alert>
          )}

          {selectedBooking && (
            <>
              {/* Booking Details */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Booking Details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Customer:</strong> {selectedBooking.CustomerName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Room:</strong> {selectedBooking.Room_Number} (
                  {selectedBooking.Room_Type})
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Total Amount:</strong> ₹
                  {selectedBooking.Total_Amount?.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Already Paid:</strong> ₹
                  {selectedBooking.totalPaid?.toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: "bold", color: "warning.main" }}
                >
                  <strong>Balance Due:</strong> ₹
                  {selectedBooking.balance?.toFixed(2)}
                </Typography>
              </Box>

              {/* Payment Form */}
              <div
                style={{
                  display: "grid",
                  gap: "16px",
                }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    name="payment_mode"
                    value={formData.payment_mode}
                    label="Payment Mode"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Amount to Pay"
                  name="amount_paid"
                  type="number"
                  value={formData.amount_paid}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  inputProps={{
                    step: "0.01",
                    max: selectedBooking.balance,
                    min: 0.01,
                  }}
                  helperText={`Maximum: ₹${selectedBooking.balance?.toFixed(
                    2
                  )}`}
                />
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.amount_paid || submitted}
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={handleCloseHistoryDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Payment History
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBooking && (
            <>
              {/* Booking Info */}
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  bgcolor: "background.default",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Booking ID:</strong> #{selectedBooking.Booking_ID}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Customer:</strong> {selectedBooking.CustomerName}
                </Typography>
                <Typography variant="body2">
                  <strong>Room:</strong> {selectedBooking.Room_Number} (
                  {selectedBooking.Room_Type})
                </Typography>
              </Box>

              {/* Payment History Table */}
              {payments.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "background.default" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Payment ID
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Mode</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Amount
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Balance
                        </TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.Payment_ID} hover>
                          <TableCell>#{payment.Payment_ID}</TableCell>
                          <TableCell>{payment.Payment_Date}</TableCell>
                          <TableCell>
                            <Chip
                              label={payment.Payment_Mode}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            ₹{payment.Amount_Paid?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            ₹{payment.Balance_Amount?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleDeletePayment(payment.Payment_ID)
                              }
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  No payment history found.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseHistoryDialog} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentPage;
