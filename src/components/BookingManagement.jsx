import React, { useState, useEffect, useRef } from "react";
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
  Stepper,
  Step,
  StepLabel,
  Box,
  Divider,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  User,
  Home,
  Calendar,
  DollarSign,
  Download,
  CreditCard,
  Check,
  Filter,
} from "lucide-react";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [openKeycardDialog, setOpenKeycardDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [roomSearch, setRoomSearch] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("All");
  const [roomSortBy, setRoomSortBy] = useState("number");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    room_id: "",
    check_in_date: "",
    check_out_date: "",
  });

  const receiptRef = useRef();
  const keycardRef = useRef();

  const steps = ["Select Customer", "Choose Room & Dates", "Confirm Booking"];

  useEffect(() => {
    fetchBookings();
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, bookings, statusFilter]);

  useEffect(() => {
    filterCustomers();
  }, [customerSearch, customers]);

  useEffect(() => {
    filterAndSortRooms();
  }, [roomSearch, roomTypeFilter, roomSortBy, availableRooms]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/bookings");
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:5000/customers");
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
          booking.Customer_Name.toLowerCase().includes(query) ||
          booking.Room_Number.toString().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (customerSearch.trim()) {
      const query = customerSearch.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.Customer_ID.toString().includes(query) ||
          customer.Name.toLowerCase().includes(query) ||
          customer.Phone.includes(query) ||
          customer.Email?.toLowerCase().includes(query)
      );
    }

    setFilteredCustomers(filtered);
  };

  const filterAndSortRooms = () => {
    let filtered = [...availableRooms];

    // Apply type filter
    if (roomTypeFilter !== "All") {
      filtered = filtered.filter((room) => room.Room_Type === roomTypeFilter);
    }

    // Apply search filter
    if (roomSearch.trim()) {
      const query = roomSearch.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.Room_Number.toString().includes(query) ||
          room.Room_Type.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (roomSortBy) {
        case "number":
          return a.Room_Number - b.Room_Number;
        case "price_low":
          return a.Price_Per_Night - b.Price_Per_Night;
        case "price_high":
          return b.Price_Per_Night - a.Price_Per_Night;
        case "floor":
          return a.Floor_Number - b.Floor_Number;
        default:
          return 0;
      }
    });

    setFilteredRooms(filtered);
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
        `http://localhost:5000/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}`
      );
      const data = await response.json();
      setAvailableRooms(data);
    } catch (err) {
      console.error("Error fetching available rooms:", err);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setActiveStep(0);
    setSelectedCustomer(null);
    setSelectedRoom(null);
    setCustomerSearch("");
    setRoomSearch("");
    setRoomTypeFilter("All");
    setRoomSortBy("number");
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
    setFilteredRooms([]);
    setSelectedCustomer(null);
    setSelectedRoom(null);
    setActiveStep(0);
    setSubmitted(false);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customer_id: customer.Customer_ID }));
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setFormData((prev) => ({ ...prev, room_id: room.Room_ID }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Fetch available rooms when both dates are set
    if (name === "check_in_date" || name === "check_out_date") {
      const checkIn = name === "check_in_date" ? value : formData.check_in_date;
      const checkOut =
        name === "check_out_date" ? value : formData.check_out_date;

      if (checkIn && checkOut && checkIn < checkOut) {
        fetchAvailableRooms(checkIn, checkOut);
      }
    }
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
    setBookingLoading(true);

    try {
      // Calculate total with GST
      const nights = Math.ceil(
        (new Date(formData.check_out_date) - new Date(formData.check_in_date)) /
          (1000 * 60 * 60 * 24)
      );
      const totalWithGST = calculateTotalWithGST(
        selectedRoom?.Price_Per_Night,
        nights
      );

      // Include the GST-calculated total in the request
      const bookingData = {
        ...formData,
        total_amount: totalWithGST.grandTotal,
      };

      const response = await fetch("http://localhost:5000/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        const newBooking = await response.json();

        // Fetch complete booking details
        const detailsResponse = await fetch(
          `http://localhost:5000/bookings/${newBooking.bookingId}`
        );
        const details = await detailsResponse.json();

        setBookingDetails(details);
        setBookingLoading(false);
        setSubmitted(true);

        // Show receipt and keycard
        setTimeout(() => {
          setOpenReceiptDialog(true);
        }, 500);
      }
    } catch (err) {
      console.error("Error creating booking:", err);
      setBookingLoading(false);
    }
  };

  const handleCompleteBooking = () => {
    setOpenReceiptDialog(false);
    setOpenKeycardDialog(false);
    handleCloseDialog();
    fetchBookings();
  };

  const downloadReceipt = () => {
    if (receiptRef.current) {
      // In a real app, you'd use html2canvas or similar
      window.print();
    }
  };

  const downloadKeycard = () => {
    if (keycardRef.current) {
      // In a real app, you'd use html2canvas to generate an image
      window.print();
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/bookings/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        handleCloseEditDialog();
        fetchBookings();
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    }
  };

  const handleOpenDeleteDialog = (bookingId) => {
    setDeleteId(bookingId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeleteId(null);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${deleteId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        fetchBookings();
        handleCloseDeleteDialog();
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
    }
  };

  const handleOpenCancelDialog = (bookingId) => {
    setCancelId(bookingId);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancelId(null);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/bookings/${bookingId}`,
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
        if (newStatus === "Cancelled") {
          handleCloseCancelDialog();
        }
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

  const calculateGST = (pricePerNight) => {
    if (pricePerNight < 1000) {
      return { rate: 0, amount: 0 };
    } else if (pricePerNight >= 1000 && pricePerNight <= 7500) {
      return { rate: 5, amount: pricePerNight * 0.05 };
    } else {
      return { rate: 18, amount: pricePerNight * 0.18 };
    }
  };

  const calculateTotalWithGST = (pricePerNight, nights) => {
    const roomTotal = pricePerNight * nights;
    const gstPerNight = calculateGST(pricePerNight);
    const totalGST = gstPerNight.amount * nights;
    return {
      roomTotal,
      gstRate: gstPerNight.rate,
      gstAmount: totalGST,
      grandTotal: roomTotal + totalGST,
    };
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
                <TableRow>
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
                      {booking.Customer_Name}
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
                      {new Date(booking.Check_In_Date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      {new Date(booking.Check_Out_Date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                      ₹{Number(booking.Total_Amount).toFixed(2)}
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
                                handleOpenCancelDialog(booking.Booking_ID)
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
                          onClick={() =>
                            handleOpenDeleteDialog(booking.Booking_ID)
                          }
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

      {/* Multi-Step Booking Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem", pb: 1 }}>
          Create New Booking
        </DialogTitle>
        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {bookingLoading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
                gap: 2,
              }}
            >
              <CircularProgress size={60} />
              <Typography variant="h6" color="text.secondary">
                Creating your booking...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please wait while we confirm your reservation
              </Typography>
            </Box>
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step 1: Customer Selection */}
              {activeStep === 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <User size={24} />
                    Select Customer
                  </Typography>

                  <TextField
                    fullWidth
                    placeholder="Search by name, phone, email, or ID..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    size="small"
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <Search
                          size={20}
                          style={{ marginRight: 8, color: "#757575" }}
                        />
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      maxHeight: "350px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "16px",
                        paddingTop: "8px",
                      }}
                    >
                      {filteredCustomers.map((customer) => (
                        <Card
                          key={customer.Customer_ID}
                          sx={{
                            border:
                              selectedCustomer?.Customer_ID ===
                              customer.Customer_ID
                                ? "2px solid"
                                : "1px solid",
                            borderColor:
                              selectedCustomer?.Customer_ID ===
                              customer.Customer_ID
                                ? "primary.main"
                                : "divider",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            position: "relative",
                            minHeight: "160px",
                            display: "flex",
                            flexDirection: "column",
                            "&:hover": {
                              boxShadow: 2,
                              borderColor: "primary.main",
                            },
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleCustomerSelect(customer)}
                            sx={{
                              flexGrow: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "stretch",
                              justifyContent: "flex-start",
                            }}
                          >
                            <CardContent
                              sx={{
                                position: "relative",
                                width: "100%",
                                p: 2,
                              }}
                            >
                              {selectedCustomer?.Customer_ID ===
                                customer.Customer_ID && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                                    borderRadius: "50%",
                                    width: 32,
                                    height: 32,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Check size={20} color="#4caf50" />
                                </Box>
                              )}
                              <Box sx={{ pr: 5 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 600,
                                    mb: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {customer.Name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 0.5 }}
                                >
                                  Phone: {customer.Phone}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mb: 0.5,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Email: {customer.Email || "N/A"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Customer ID: #{customer.Customer_ID}
                                </Typography>
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      ))}
                    </div>

                    {filteredCustomers.length === 0 && (
                      <Alert severity="info">
                        No customers found. Please adjust your search.
                      </Alert>
                    )}
                  </Box>
                </Box>
              )}

              {/* Step 2: Room & Dates Selection */}
              {activeStep === 1 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Home size={20} />
                    Choose Room & Dates
                  </Typography>

                  {/* Date Selection */}
                  <Box
                    sx={{
                      mb: 3,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Check-In Date"
                      name="check_in_date"
                      type="date"
                      value={formData.check_in_date}
                      onChange={handleDateChange}
                      required
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split("T")[0],
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Check-Out Date"
                      name="check_out_date"
                      type="date"
                      value={formData.check_out_date}
                      onChange={handleDateChange}
                      required
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min:
                          formData.check_in_date ||
                          new Date().toISOString().split("T")[0],
                      }}
                    />
                  </Box>

                  {/* Room Filters */}
                  {formData.check_in_date && formData.check_out_date && (
                    <>
                      <Box
                        sx={{
                          mb: 2,
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <TextField
                          placeholder="Search rooms..."
                          value={roomSearch}
                          onChange={(e) => setRoomSearch(e.target.value)}
                          size="small"
                          sx={{ flex: 1 }}
                          InputProps={{
                            startAdornment: (
                              <Search
                                size={20}
                                style={{ marginRight: 8, color: "#757575" }}
                              />
                            ),
                          }}
                        />
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={roomTypeFilter}
                            label="Type"
                            onChange={(e) => setRoomTypeFilter(e.target.value)}
                          >
                            <MenuItem value="All">All Types</MenuItem>
                            <MenuItem value="Single">Single</MenuItem>
                            <MenuItem value="Double">Double</MenuItem>
                            <MenuItem value="Suite">Suite</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                          <InputLabel>Sort By</InputLabel>
                          <Select
                            value={roomSortBy}
                            label="Sort By"
                            onChange={(e) => setRoomSortBy(e.target.value)}
                            startAdornment={
                              <Filter
                                size={18}
                                style={{ marginLeft: 8, marginRight: 8 }}
                              />
                            }
                          >
                            <MenuItem value="number">Room Number</MenuItem>
                            <MenuItem value="price_low">
                              Price: Low to High
                            </MenuItem>
                            <MenuItem value="price_high">
                              Price: High to Low
                            </MenuItem>
                            <MenuItem value="floor">Floor Number</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      {/* Room Cards */}
                      <Box
                        sx={{ maxHeight: "300px", overflowY: "auto", pt: 1 }}
                      >
                        <Grid container spacing={2}>
                          {filteredRooms.map((room) => (
                            <Grid item xs={12} sm={6} key={room.Room_ID}>
                              <Card
                                sx={{
                                  border:
                                    selectedRoom?.Room_ID === room.Room_ID
                                      ? "2px solid"
                                      : "1px solid",
                                  borderColor:
                                    selectedRoom?.Room_ID === room.Room_ID
                                      ? "primary.main"
                                      : "divider",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  position: "relative",
                                  "&:hover": {
                                    boxShadow: 2,
                                    borderColor: "primary.main",
                                  },
                                }}
                              >
                                <CardActionArea
                                  onClick={() => handleRoomSelect(room)}
                                >
                                  <CardContent sx={{ position: "relative" }}>
                                    {selectedRoom?.Room_ID === room.Room_ID && (
                                      <Box
                                        sx={{
                                          position: "absolute",
                                          top: 8,
                                          right: 8,
                                          backgroundColor:
                                            "rgba(76, 175, 80, 0.1)",
                                          borderRadius: "50%",
                                          width: 32,
                                          height: 32,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Check size={20} color="#4caf50" />
                                      </Box>
                                    )}
                                    <Box sx={{ pr: 5 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600, mb: 1 }}
                                      >
                                        Room {room.Room_Number}
                                      </Typography>
                                      <Chip
                                        label={room.Room_Type}
                                        size="small"
                                        color="primary"
                                        sx={{ mb: 1 }}
                                      />
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Floor {room.Floor_Number}
                                      </Typography>
                                      <Typography
                                        variant="h6"
                                        color="primary"
                                        sx={{ mt: 1, fontWeight: 700 }}
                                      >
                                        ₹{room.Price_Per_Night}/night
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </CardActionArea>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>

                        {filteredRooms.length === 0 &&
                          availableRooms.length > 0 && (
                            <Alert severity="info">
                              No rooms match your filters. Try adjusting them.
                            </Alert>
                          )}

                        {availableRooms.length === 0 && (
                          <Alert severity="warning">
                            No rooms available for the selected dates. Please
                            choose different dates.
                          </Alert>
                        )}
                      </Box>
                    </>
                  )}

                  {!formData.check_in_date || !formData.check_out_date ? (
                    <Alert severity="info">
                      Please select check-in and check-out dates to view
                      available rooms.
                    </Alert>
                  ) : null}
                </Box>
              )}

              {/* Step 3: Confirmation */}
              {activeStep === 2 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Calendar size={24} />
                    Confirm Booking Details
                  </Typography>

                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      border: "2px dotted",
                      borderColor: "divider",
                      width: "75%",
                      alignSelf: "center",
                    }}
                  >
                    <Grid container spacing={2.5}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Customer Information
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ mb: 0.3, fontSize: "1.1rem" }}
                        >
                          {selectedCustomer?.Name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          {selectedCustomer?.Phone} |{" "}
                          {selectedCustomer?.Email || "N/A"}
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ borderStyle: "dotted", my: 0.5 }} />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Room Details
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{ mb: 0.5, fontSize: "1.1rem" }}
                        >
                          Room {selectedRoom?.Room_Number}
                        </Typography>
                        <Chip
                          label={selectedRoom?.Room_Type}
                          size="small"
                          color="primary"
                          sx={{ mb: 0.5 }}
                        />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem" }}
                        >
                          Floor {selectedRoom?.Floor_Number}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            textTransform: "uppercase",
                            fontSize: "0.75rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Stay Duration
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ mb: 0.3, fontSize: "0.95rem" }}
                        >
                          <strong>Check-In:</strong>{" "}
                          {new Date(formData.check_in_date).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ mb: 0.3, fontSize: "0.95rem" }}
                        >
                          <strong>Check-Out:</strong>{" "}
                          {new Date(formData.check_out_date).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" }
                          )}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: "0.875rem", mt: 0.5 }}
                        >
                          {Math.ceil(
                            (new Date(formData.check_out_date) -
                              new Date(formData.check_in_date)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          night(s)
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <Divider sx={{ borderStyle: "dotted", my: 0.5 }} />
                      </Grid>

                      <Grid item xs={12}>
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  mb: 0.5,
                                  fontWeight: 500,
                                  fontSize: "0.95rem",
                                }}
                              >
                                Room Charges
                              </Typography>
                              <Chip
                                label={`₹${
                                  selectedRoom?.Price_Per_Night
                                }/night × ${Math.ceil(
                                  (new Date(formData.check_out_date) -
                                    new Date(formData.check_in_date)) /
                                    (1000 * 60 * 60 * 24)
                                )} night(s)`}
                                size="small"
                                variant="outlined"
                                color="primary"
                              />
                            </Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, fontSize: "1rem" }}
                            >
                              ₹
                              {(() => {
                                const nights = Math.ceil(
                                  (new Date(formData.check_out_date) -
                                    new Date(formData.check_in_date)) /
                                    (1000 * 60 * 60 * 24)
                                );
                                const calc = calculateTotalWithGST(
                                  selectedRoom?.Price_Per_Night,
                                  nights
                                );
                                return calc.roomTotal.toFixed(2);
                              })()}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              GST (
                              {(() => {
                                const nights = Math.ceil(
                                  (new Date(formData.check_out_date) -
                                    new Date(formData.check_in_date)) /
                                    (1000 * 60 * 60 * 24)
                                );
                                const calc = calculateTotalWithGST(
                                  selectedRoom?.Price_Per_Night,
                                  nights
                                );
                                return calc.gstRate;
                              })()}
                              %)
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontSize: "0.875rem" }}
                            >
                              ₹
                              {(() => {
                                const nights = Math.ceil(
                                  (new Date(formData.check_out_date) -
                                    new Date(formData.check_in_date)) /
                                    (1000 * 60 * 60 * 24)
                                );
                                const calc = calculateTotalWithGST(
                                  selectedRoom?.Price_Per_Night,
                                  nights
                                );
                                return calc.gstAmount.toFixed(2);
                              })()}
                            </Typography>
                          </Box>
                          <Divider sx={{ borderStyle: "dotted", mb: 2 }} />
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                            >
                              Total Amount
                            </Typography>
                            <Typography
                              variant="h4"
                              color="primary"
                              sx={{ fontWeight: 700, fontSize: "1.75rem" }}
                            >
                              ₹
                              {(() => {
                                const nights = Math.ceil(
                                  (new Date(formData.check_out_date) -
                                    new Date(formData.check_in_date)) /
                                    (1000 * 60 * 60 * 24)
                                );
                                const calc = calculateTotalWithGST(
                                  selectedRoom?.Price_Per_Night,
                                  nights
                                );
                                return calc.grandTotal.toFixed(2);
                              })()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        {!bookingLoading && (
          <>
            <Divider />
            <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
              <Button onClick={handleCloseDialog} variant="outlined">
                Cancel
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                {activeStep > 0 && (
                  <Button onClick={handleBack} variant="outlined">
                    Back
                  </Button>
                )}
                {activeStep < steps.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    disabled={
                      (activeStep === 0 && !selectedCustomer) ||
                      (activeStep === 1 &&
                        (!selectedRoom ||
                          !formData.check_in_date ||
                          !formData.check_out_date))
                    }
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<Check size={18} />}
                  >
                    Confirm Booking
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Delete Booking
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this booking? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          Cancel Booking
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to cancel this booking? The booking status
            will be changed to "Cancelled".
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCancelDialog} variant="outlined">
            No, Keep It
          </Button>
          <Button
            onClick={() => handleUpdateStatus(cancelId, "Cancelled")}
            variant="contained"
            color="error"
          >
            Yes, Cancel Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog
        open={openReceiptDialog}
        onClose={() => {}}
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
            textAlign: "center",
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          Booking Confirmed!
        </DialogTitle>
        <DialogContent ref={receiptRef} sx={{ pt: 3 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 2,
                mt: 3,
                animation: "scaleIn 0.5s ease-out",
                "@keyframes scaleIn": {
                  "0%": { transform: "scale(0)" },
                  "50%": { transform: "scale(1.1)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <CheckCircle2 size={48} color="white" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Booking Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Booking ID: #{bookingDetails?.Booking_ID}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Paper
            sx={{
              p: 3,
              mb: 3,
              border: "2px dotted",
              borderColor: "divider",
              boxShadow: "none",
            }}
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Guest Information
                </Typography>
                <Typography variant="h6" sx={{ mb: 0.3, fontSize: "1.1rem" }}>
                  {bookingDetails?.Customer_Name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.875rem" }}
                >
                  {bookingDetails?.Customer_Phone}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderStyle: "dotted", my: 0.5 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Room
                </Typography>
                <Typography variant="h6" sx={{ mb: 0.5, fontSize: "1.1rem" }}>
                  Room {bookingDetails?.Room_Number}
                </Typography>
                <Chip
                  label={bookingDetails?.Room_Type}
                  size="small"
                  color="primary"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    textTransform: "uppercase",
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Stay Duration
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 0.3, fontSize: "0.95rem" }}
                >
                  <strong>Check-In:</strong>{" "}
                  {bookingDetails?.Check_In_Date &&
                    new Date(bookingDetails.Check_In_Date).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 0.3, fontSize: "0.95rem" }}
                >
                  <strong>Check-Out:</strong>{" "}
                  {bookingDetails?.Check_Out_Date &&
                    new Date(bookingDetails.Check_Out_Date).toLocaleDateString(
                      "en-GB",
                      { day: "2-digit", month: "short", year: "numeric" }
                    )}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderStyle: "dotted", my: 0.5 }} />
              </Grid>

              <Grid item xs={12}>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1.5,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                    >
                      Room Charges
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, fontSize: "1rem" }}
                    >
                      ₹
                      {(() => {
                        const totalAmount = Number(
                          bookingDetails?.Total_Amount
                        );
                        const nights = Math.ceil(
                          (new Date(bookingDetails?.Check_Out_Date) -
                            new Date(bookingDetails?.Check_In_Date)) /
                            (1000 * 60 * 60 * 24)
                        );
                        const pricePerNight = totalAmount / nights;
                        const calc = calculateTotalWithGST(
                          pricePerNight,
                          nights
                        );
                        return calc.roomTotal.toFixed(2);
                      })()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      GST (
                      {(() => {
                        const totalAmount = Number(
                          bookingDetails?.Total_Amount
                        );
                        const nights = Math.ceil(
                          (new Date(bookingDetails?.Check_Out_Date) -
                            new Date(bookingDetails?.Check_In_Date)) /
                            (1000 * 60 * 60 * 24)
                        );
                        const pricePerNight = totalAmount / nights;
                        const calc = calculateTotalWithGST(
                          pricePerNight,
                          nights
                        );
                        return calc.gstRate;
                      })()}
                      %)
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.875rem" }}
                    >
                      ₹
                      {(() => {
                        const totalAmount = Number(
                          bookingDetails?.Total_Amount
                        );
                        const nights = Math.ceil(
                          (new Date(bookingDetails?.Check_Out_Date) -
                            new Date(bookingDetails?.Check_In_Date)) /
                            (1000 * 60 * 60 * 24)
                        );
                        const pricePerNight = totalAmount / nights;
                        const calc = calculateTotalWithGST(
                          pricePerNight,
                          nights
                        );
                        return calc.gstAmount.toFixed(2);
                      })()}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderStyle: "dotted", mb: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        marginRight: "20px",
                      }}
                    >
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: "1.75rem" }}
                    >
                      ₹{Number(bookingDetails?.Total_Amount).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Alert severity="success" sx={{ mb: 2 }}>
            Your booking has been confirmed! A virtual keycard has been
            generated for you.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            onClick={downloadReceipt}
            startIcon={<Download size={18} />}
            variant="outlined"
          >
            Download Receipt
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => {
                setOpenReceiptDialog(false);
                setOpenKeycardDialog(true);
              }}
              variant="contained"
              startIcon={<CreditCard size={18} />}
            >
              View Keycard
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Virtual Keycard Dialog */}
      <Dialog
        open={openKeycardDialog}
        onClose={() => {}}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 600, fontSize: "1.25rem", textAlign: "center" }}
        >
          Virtual Keycard
        </DialogTitle>
        <DialogContent ref={keycardRef} sx={{ pt: 3 }}>
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 3,
              p: 3,
              color: "white",
              position: "relative",
              overflow: "hidden",
              minHeight: "250px",
              animation: "slideIn 0.6s ease-out",
              "@keyframes slideIn": {
                "0%": { transform: "translateY(20px)", opacity: 0 },
                "100%": { transform: "translateY(0)", opacity: 1 },
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-50%",
                right: "-20%",
                width: "200px",
                height: "200px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-30%",
                left: "-10%",
                width: "150px",
                height: "150px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "50%",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <CreditCard size={32} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  HOTEL ACCESS CARD
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Guest Name
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {bookingDetails?.Customer_Name}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Room Number
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {bookingDetails?.Room_Number}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Room Type
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {bookingDetails?.Room_Type}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", my: 2 }} />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Check-In
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {bookingDetails?.Check_In_Date &&
                      new Date(bookingDetails.Check_In_Date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short" }
                      )}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Check-Out
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {bookingDetails?.Check_Out_Date &&
                      new Date(
                        bookingDetails.Check_Out_Date
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Total Amount (incl. GST)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ₹{Number(bookingDetails?.Total_Amount).toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  GST @{" "}
                  {(() => {
                    const totalAmount = Number(bookingDetails?.Total_Amount);
                    const nights = Math.ceil(
                      (new Date(bookingDetails?.Check_Out_Date) -
                        new Date(bookingDetails?.Check_In_Date)) /
                        (1000 * 60 * 60 * 24)
                    );
                    const pricePerNight = totalAmount / nights;
                    const calc = calculateTotalWithGST(pricePerNight, nights);
                    return calc.gstRate;
                  })()}
                  % included
                </Typography>
              </Box>

              <Box
                sx={{
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,0.3)",
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Booking ID
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontFamily: "monospace" }}
                >
                  #{bookingDetails?.Booking_ID}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
          <Button
            onClick={downloadKeycard}
            startIcon={<Download size={18} />}
            variant="outlined"
          >
            Download
          </Button>
          <Button
            onClick={handleCompleteBooking}
            variant="contained"
            color="success"
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default BookingManagement;
