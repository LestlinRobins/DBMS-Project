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
} from "@mui/material";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
  });

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, bookings, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
    setLoading(false);
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

  const filterBookings = () => {
    let filtered = bookings;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (booking) => booking.Booking_Status === statusFilter
      );
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

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Fetch available rooms when dates change
    if (name === "check_in_date" || name === "check_out_date") {
      const checkIn = name === "check_in_date" ? value : formData.check_in_date;
      const checkOut =
        name === "check_out_date" ? value : formData.check_out_date;

      if (checkIn && checkOut) {
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      customer_id: "",
      room_id: "",
      check_in_date: "",
      check_out_date: "",
    });
    setAvailableRooms([]);
    setSubmitted(false);
  };

  const handleOpenEditDialog = (booking) => {
    setEditId(booking.Booking_ID);
    setFormData({
      customer_id: booking.Customer_ID,
      room_id: booking.Room_ID,
      check_in_date: booking.Check_In_Date,
      check_out_date: booking.Check_Out_Date,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditId(null);
    setFormData({
      customer_id: "",
      room_id: "",
      check_in_date: "",
      check_out_date: "",
    });
    setAvailableRooms([]);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/bookings", {
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
      console.error("Error creating booking:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        handleCloseEditDialog();
        fetchBookings();
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchBookings();
        }
      } catch (err) {
        console.error("Error deleting booking:", err);
      }
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
        return "info";
      case "Completed":
        return "success";
      case "Cancelled":
        return "error";
      default:
        return "default";
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
          Booking Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Plus size={20} />}
          onClick={handleOpenDialog}
          sx={{
            textTransform: "none",
          }}
        >
          Add Booking
        </Button>
      </div>

      {/* Bookings Table Paper */}
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
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
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
                    Check-In
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Check-Out
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Amount
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
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      {booking.Check_In_Date}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      {booking.Check_Out_Date}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      ₹{booking.Total_Amount?.toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Chip
                        label={booking.Booking_Status}
                        size="small"
                        color={getStatusColor(booking.Booking_Status)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {booking.Booking_Status === "Active" && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                handleUpdateStatus(
                                  booking.Booking_ID,
                                  "Completed"
                                )
                              }
                              title="Mark as Completed"
                            >
                              <CheckCircle2 size={18} />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                handleUpdateStatus(
                                  booking.Booking_ID,
                                  "Cancelled"
                                )
                              }
                              title="Cancel Booking"
                            >
                              <XCircle size={18} />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(booking)}
                          disabled={booking.Booking_Status !== "Active"}
                        >
                          <Edit2 size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(booking.Booking_ID)}
                        >
                          <Trash2 size={18} />
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
            No bookings found. Click "Add Booking" to create one.
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

      {/* Add Booking Dialog */}
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
          Add New Booking
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Booking created successfully!
            </Alert>
          )}
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Customer</InputLabel>
              <Select
                name="customer_id"
                value={formData.customer_id}
                label="Customer"
                onChange={handleInputChange}
              >
                <MenuItem value="">Select Customer</MenuItem>
                {customers.map((customer) => (
                  <MenuItem
                    key={customer.Customer_ID}
                    value={customer.Customer_ID}
                  >
                    {customer.Name} ({customer.Phone})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Check-In Date"
              name="check_in_date"
              type="date"
              value={formData.check_in_date}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Check-Out Date"
              name="check_out_date"
              type="date"
              value={formData.check_out_date}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Room</InputLabel>
              <Select
                name="room_id"
                value={formData.room_id}
                label="Room"
                onChange={handleInputChange}
                disabled={availableRooms.length === 0}
              >
                <MenuItem value="">Select Room</MenuItem>
                {availableRooms.map((room) => (
                  <MenuItem key={room.Room_ID} value={room.Room_ID}>
                    Room {room.Room_Number} ({room.Room_Type}) - ₹
                    {room.Price_Per_Night}/night
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {availableRooms.length === 0 &&
              formData.check_in_date &&
              formData.check_out_date && (
                <Alert severity="info">
                  No rooms available for the selected dates.
                </Alert>
              )}
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.customer_id ||
              !formData.room_id ||
              !formData.check_in_date ||
              !formData.check_out_date ||
              submitted
            }
          >
            Add Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Edit Booking
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            <FormControl fullWidth size="small" disabled>
              <InputLabel>Customer</InputLabel>
              <Select
                name="customer_id"
                value={formData.customer_id}
                label="Customer"
              >
                <MenuItem value="">Select Customer</MenuItem>
                {customers.map((customer) => (
                  <MenuItem
                    key={customer.Customer_ID}
                    value={customer.Customer_ID}
                  >
                    {customer.Name} ({customer.Phone})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Check-In Date"
              name="check_in_date"
              type="date"
              value={formData.check_in_date}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              fullWidth
              label="Check-Out Date"
              name="check_out_date"
              type="date"
              value={formData.check_out_date}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
            />

            <Alert severity="info">
              Note: Editing dates may require checking room availability.
            </Alert>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={!formData.check_in_date || !formData.check_out_date}
          >
            Update Booking
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BookingManagement;
