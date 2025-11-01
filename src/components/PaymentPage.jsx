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
  CreditCard,
  Smartphone,
  Banknote,
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
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
      const response = await fetch("http://localhost:5000/bookings");
      const allBookings = await response.json();

      // Fetch payments for each booking to calculate balance
      const bookingsWithPayments = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const paymentsRes = await fetch(
              `http://localhost:5000/payments/${booking.Booking_ID}`
            );
            const paymentsData = await paymentsRes.json();
            const totalPaid = paymentsData.reduce(
              (sum, p) => sum + (parseFloat(p.Amount_Paid) || 0),
              0
            );
            const totalAmount = parseFloat(booking.Total_Amount) || 0;
            const balance = totalAmount - totalPaid;
            return {
              ...booking,
              CustomerName:
                booking.CustomerName || booking.Customer_Name || "Unknown",
              Total_Amount: totalAmount,
              totalPaid,
              balance,
            };
          } catch {
            const totalAmount = parseFloat(booking.Total_Amount) || 0;
            return {
              ...booking,
              CustomerName:
                booking.CustomerName || booking.Customer_Name || "Unknown",
              Total_Amount: totalAmount,
              totalPaid: 0,
              balance: totalAmount,
            };
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
        `http://localhost:5000/payments/${bookingId}`
      );
      const data = await response.json();
      // Convert numeric fields to proper numbers
      const paymentsWithNumbers = data.map((payment) => ({
        ...payment,
        Amount_Paid: parseFloat(payment.Amount_Paid) || 0,
        Balance_Amount: parseFloat(payment.Balance_Amount) || 0,
      }));
      setPayments(paymentsWithNumbers);
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
      const response = await fetch("http://localhost:5000/payments", {
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

  const handleOpenDeleteDialog = (payment) => {
    setPaymentToDelete(payment);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setPaymentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/payments/${paymentToDelete.Payment_ID}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        handleCloseDeleteDialog();
        await fetchPayments(selectedBooking.Booking_ID);
        fetchBookings();
      }
    } catch (err) {
      console.error("Error deleting payment:", err);
    }
  };

  const handlePrintReceipt = async (booking) => {
    // Dynamically import html2canvas
    const html2canvas = (await import("html2canvas")).default;

    // Create a temporary container for the receipt
    const receiptContainer = document.createElement("div");
    receiptContainer.style.position = "absolute";
    receiptContainer.style.left = "-9999px";
    receiptContainer.style.width = "600px";
    receiptContainer.style.backgroundColor = "white";
    receiptContainer.style.padding = "32px";
    receiptContainer.style.fontFamily = "Arial, sans-serif";

    receiptContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px dotted #ddd;">
        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 4px;">Payment Receipt</div>
        <div style="font-size: 0.875rem; color: #666;">Hotel Management System</div>
      </div>
      
      <div style="margin: 24px 0;">
        <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 12px;">BOOKING DETAILS</div>
        <div style="display: grid; gap: 8px; font-size: 0.95rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Booking ID:</span>
            <span style="font-weight: 600;">#${booking.Booking_ID}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Customer:</span>
            <span style="font-weight: 600;">${booking.CustomerName}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Room:</span>
            <span style="font-weight: 600;">${booking.Room_Number} (${
      booking.Room_Type
    })</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Check-In:</span>
            <span style="font-weight: 500;">${new Date(
              booking.Check_In_Date
            ).toLocaleDateString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Check-Out:</span>
            <span style="font-weight: 500;">${new Date(
              booking.Check_Out_Date
            ).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div style="border-top: 2px dotted #ddd; border-bottom: 2px dotted #ddd; padding: 16px 0; margin: 24px 0;">
        <div style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #666; margin-bottom: 12px;">PAYMENT SUMMARY</div>
        <div style="display: grid; gap: 8px; font-size: 0.95rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Total Amount:</span>
            <span style="font-weight: 600;">₹${booking.Total_Amount?.toFixed(
              2
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Amount Paid:</span>
            <span style="font-weight: 600; color: #4caf50;">₹${booking.totalPaid?.toFixed(
              2
            )}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px dotted #ddd; margin-top: 4px;">
            <span style="font-weight: 600; font-size: 1.1rem;">Balance Due:</span>
            <span style="font-weight: 700; font-size: 1.1rem; color: ${
              booking.balance > 0 ? "#ff9800" : "#4caf50"
            };">₹${booking.balance?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin-top: 32px; font-size: 0.875rem; color: #666;">
        Thank you for your payment!
      </div>
    `;

    document.body.appendChild(receiptContainer);

    try {
      const canvas = await html2canvas(receiptContainer, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `payment-receipt-${booking.Booking_ID}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate receipt. Please try again.");
    } finally {
      document.body.removeChild(receiptContainer);
    }
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
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Booking ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Customer
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Room
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Total Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Paid
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Balance
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      color: "text.secondary",
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
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                      }}
                    >
                      #{booking.Booking_ID}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                      {booking.CustomerName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${booking.Room_Number} • ${booking.Room_Type}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      ₹{booking.Total_Amount?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`₹${booking.totalPaid?.toFixed(2)}`}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`₹${booking.balance?.toFixed(2)}`}
                        size="small"
                        color={booking.balance > 0 ? "warning" : "success"}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.balance > 0 ? "Pending" : "Fully Paid"}
                        size="small"
                        color={booking.balance > 0 ? "warning" : "success"}
                        variant={booking.balance > 0 ? "filled" : "outlined"}
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(booking)}
                          disabled={booking.balance <= 0}
                          title="Record Payment"
                          sx={{
                            "&:hover": {
                              backgroundColor: "primary.light",
                              color: "white",
                            },
                          }}
                        >
                          <DollarSign size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => handleOpenHistoryDialog(booking)}
                          title="View Payment History"
                          sx={{
                            "&:hover": {
                              backgroundColor: "info.light",
                              color: "white",
                            },
                          }}
                        >
                          <Eye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePrintReceipt(booking)}
                          title="Download Receipt"
                          sx={{
                            "&:hover": {
                              backgroundColor: "success.light",
                              color: "white",
                            },
                          }}
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
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            borderBottom: "2px dotted",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={20} />
            </Box>
            Record Payment
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {submitted && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 1,
                "& .MuiAlert-icon": { fontSize: "1.5rem" },
              }}
            >
              Payment recorded successfully!
            </Alert>
          )}

          {selectedBooking && (
            <>
              {/* Booking Details */}
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  border: "2px dotted",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Booking Details
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5, fontSize: "0.875rem" }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Booking ID:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontFamily: "monospace" }}
                    >
                      #{selectedBooking.Booking_ID}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Customer:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedBooking.CustomerName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Room:
                    </Typography>
                    <Chip
                      label={`${selectedBooking.Room_Number} • ${selectedBooking.Room_Type}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2, borderStyle: "dotted" }} />

                <Box sx={{ display: "grid", gap: 1.5, fontSize: "0.875rem" }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Total Amount:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{selectedBooking.Total_Amount?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Already Paid:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "success.main" }}
                    >
                      ₹{selectedBooking.totalPaid?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 1.5,
                      borderTop: "1px dotted",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                    >
                      Balance Due:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "warning.main",
                      }}
                    >
                      ₹{selectedBooking.balance?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Payment Form */}
              <Box
                sx={{
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Payment Details
                </Typography>
                <Box sx={{ display: "grid", gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      name="payment_mode"
                      value={formData.payment_mode}
                      label="Payment Mode"
                      onChange={handleInputChange}
                    >
                      <MenuItem value="Cash">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Banknote size={15} />
                          Cash
                        </Box>
                      </MenuItem>
                      <MenuItem value="Card">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CreditCard size={15} />
                          Card
                        </Box>
                      </MenuItem>
                      <MenuItem value="UPI">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Smartphone size={15} />
                          UPI
                        </Box>
                      </MenuItem>
                      <MenuItem value="Other">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <DollarSign size={15} />
                          Other
                        </Box>
                      </MenuItem>
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
                    inputProps={{
                      step: "0.01",
                      max: selectedBooking.balance,
                      min: 0.01,
                    }}
                    helperText={`Maximum amount: ₹${selectedBooking.balance?.toFixed(
                      2
                    )}`}
                    sx={{
                      "& .MuiInputBase-input": {
                        fontSize: "1.1rem",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: "2px dotted",
            borderColor: "divider",
            gap: 1,
          }}
        >
          <Button onClick={handleCloseDialog} variant="outlined" size="large">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.amount_paid || submitted}
            size="large"
            startIcon={<DollarSign size={18} />}
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
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            borderBottom: "2px dotted",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Receipt size={20} />
            </Box>
            Payment History
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedBooking && (
            <>
              {/* Booking Info */}
              <Box
                sx={{
                  mb: 3,
                  p: 2.5,
                  border: "2px dotted",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: "grid", gap: 1.5, fontSize: "0.875rem" }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Booking ID:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontFamily: "monospace" }}
                    >
                      #{selectedBooking.Booking_ID}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Customer:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {selectedBooking.CustomerName}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Room:
                    </Typography>
                    <Chip
                      label={`${selectedBooking.Room_Number} • ${selectedBooking.Room_Type}`}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Payment History Table */}
              {payments.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "text.secondary",
                          }}
                        >
                          Payment ID
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "text.secondary",
                          }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "text.secondary",
                          }}
                        >
                          Mode
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "text.secondary",
                          }}
                        >
                          Amount Paid
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "text.secondary",
                          }}
                        >
                          Balance After
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            color: "text.secondary",
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow
                          key={payment.Payment_ID}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              fontFamily: "monospace",
                            }}
                          >
                            #{payment.Payment_ID}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.875rem" }}>
                            {new Date(payment.Payment_Date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={payment.Payment_Mode}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              color: "success.main",
                            }}
                          >
                            ₹{payment.Amount_Paid?.toFixed(2)}
                          </TableCell>
                          <TableCell
                            sx={{ fontSize: "0.875rem", fontWeight: 500 }}
                          >
                            ₹{payment.Balance_Amount?.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDeleteDialog(payment)}
                              title="Delete Payment"
                              sx={{
                                "&:hover": {
                                  backgroundColor: "error.light",
                                  color: "white",
                                },
                              }}
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
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    px: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <Receipt size={32} color="#999" />
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    No payment history found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    No payments have been recorded for this booking yet.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: "2px dotted",
            borderColor: "divider",
          }}
        >
          <Button
            onClick={handleCloseHistoryDialog}
            variant="outlined"
            size="large"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Payment Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            borderBottom: "2px dotted",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={20} color="white" />
            </Box>
            Delete Payment
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {paymentToDelete && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
                This action cannot be undone. All subsequent payment balances
                will be recalculated.
              </Alert>

              <Box
                sx={{
                  p: 2.5,
                  border: "2px dotted",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "text.secondary",
                    mb: 2,
                  }}
                >
                  Payment Details
                </Typography>
                <Box sx={{ display: "grid", gap: 1.5, fontSize: "0.875rem" }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Payment ID:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontFamily: "monospace" }}
                    >
                      #{paymentToDelete.Payment_ID}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Payment Date:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(
                        paymentToDelete.Payment_Date
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Payment Mode:
                    </Typography>
                    <Chip
                      label={paymentToDelete.Payment_Mode}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 1.5,
                      borderTop: "1px dotted",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                    >
                      Amount Paid:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "error.main",
                      }}
                    >
                      ₹{paymentToDelete.Amount_Paid?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  textAlign: "center",
                  color: "text.secondary",
                  fontStyle: "italic",
                }}
              >
                Are you sure you want to delete this payment?
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: "2px dotted",
            borderColor: "divider",
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            size="large"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            size="large"
            startIcon={<Trash2 size={18} />}
          >
            Delete Payment
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentPage;
