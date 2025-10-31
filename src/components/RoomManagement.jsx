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
import { Plus, Search, Edit2, Trash2, Filter } from "lucide-react";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "Single",
    price_per_night: "",
    floor_number: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [searchQuery, rooms, statusFilter, typeFilter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/rooms");
      const data = await response.json();
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
    setLoading(false);
  };

  const filterRooms = () => {
    let filtered = rooms;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((room) => room.Status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== "All") {
      filtered = filtered.filter((room) => room.Room_Type === typeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.Room_Number.toString().includes(query) ||
          room.Room_Type.toLowerCase().includes(query) ||
          room.Floor_Number.toString().includes(query)
      );
    }

    setFilteredRooms(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      room_number: "",
      room_type: "Single",
      price_per_night: "",
      floor_number: "",
    });
    setSubmitted(false);
  };

  const handleOpenEditDialog = (room) => {
    setEditId(room.Room_ID);
    setFormData({
      room_number: room.Room_Number,
      room_type: room.Room_Type,
      price_per_night: room.Price_Per_Night,
      floor_number: room.Floor_Number,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditId(null);
    setFormData({
      room_number: "",
      room_type: "Single",
      price_per_night: "",
      floor_number: "",
    });
  };

  const handleSubmit = async () => {
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
        setTimeout(() => {
          handleCloseDialog();
          fetchRooms();
        }, 2000);
      }
    } catch (err) {
      console.error("Error adding room:", err);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/rooms/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_type: formData.room_type,
            price_per_night: formData.price_per_night,
            floor_number: formData.floor_number,
          }),
        }
      );
      if (response.ok) {
        handleCloseEditDialog();
        fetchRooms();
      }
    } catch (err) {
      console.error("Error updating room:", err);
    }
  };

  const handleDelete = async (roomId) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/rooms/${roomId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchRooms();
        }
      } catch (err) {
        console.error("Error deleting room:", err);
      }
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
        return "success";
      case "Booked":
        return "error";
      case "Under Maintenance":
        return "warning";
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
          Room Management
        </Typography>
        <Button
          startIcon={<Plus size={20} />}
          onClick={handleOpenDialog}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Add Room
        </Button>
      </div>

      {/* Rooms Table Paper */}
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
            gridTemplateColumns: "1fr auto auto",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Search size={20} style={{ color: "#757575" }} />
            <TextField
              placeholder="Search by room number, type, or floor..."
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
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Booked">Booked</MenuItem>
              <MenuItem value="Under Maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="All">All Types</MenuItem>
              <MenuItem value="Single">Single</MenuItem>
              <MenuItem value="Double">Double</MenuItem>
              <MenuItem value="Suite">Suite</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Rooms Table */}
        {!loading && rooms.length > 0 ? (
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
                    Room #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Price/Night
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Floor
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
                {filteredRooms.map((room) => (
                  <TableRow
                    key={room.Room_ID}
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
                      {room.Room_Number}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Chip
                        label={room.Room_Type}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell
                      sx={{ fontSize: "0.9rem", fontWeight: "medium" }}
                    >
                      ₹{room.Price_Per_Night}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      Floor {room.Floor_Number}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Select
                        value={room.Status}
                        onChange={(e) =>
                          handleUpdateStatus(room.Room_ID, e.target.value)
                        }
                        size="small"
                        sx={{ minWidth: 160 }}
                      >
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Booked">Booked</MenuItem>
                        <MenuItem value="Under Maintenance">
                          Under Maintenance
                        </MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEditDialog(room)}
                        >
                          <Edit2 size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(room.Room_ID)}
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
            Loading rooms...
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No rooms found. Click "Add Room" to create one.
          </Typography>
        )}

        {/* No Results Message */}
        {!loading &&
          rooms.length > 0 &&
          filteredRooms.length === 0 &&
          (searchQuery || statusFilter !== "All" || typeFilter !== "All") && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No rooms match your filters.
            </Typography>
          )}
      </Paper>

      {/* Add Room Dialog */}
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
          Add New Room
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Room added successfully!
            </Alert>
          )}
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            <TextField
              fullWidth
              label="Room Number"
              name="room_number"
              type="number"
              value={formData.room_number}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                name="room_type"
                value={formData.room_type}
                label="Room Type"
                onChange={handleInputChange}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Double">Double</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Price Per Night"
              name="price_per_night"
              type="number"
              value={formData.price_per_night}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
              inputProps={{ step: "0.01" }}
            />
            <TextField
              fullWidth
              label="Floor Number"
              name="floor_number"
              type="number"
              value={formData.floor_number}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
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
              !formData.room_number || !formData.price_per_night || submitted
            }
          >
            Add Room
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
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
          Edit Room
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            <TextField
              fullWidth
              label="Room Number"
              name="room_number"
              type="number"
              value={formData.room_number}
              disabled
              variant="outlined"
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Room Type</InputLabel>
              <Select
                name="room_type"
                value={formData.room_type}
                label="Room Type"
                onChange={handleInputChange}
              >
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Double">Double</MenuItem>
                <MenuItem value="Suite">Suite</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Price Per Night"
              name="price_per_night"
              type="number"
              value={formData.price_per_night}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
              inputProps={{ step: "0.01" }}
            />
            <TextField
              fullWidth
              label="Floor Number"
              name="floor_number"
              type="number"
              value={formData.floor_number}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEditDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            disabled={!formData.price_per_night}
          >
            Update Room
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
