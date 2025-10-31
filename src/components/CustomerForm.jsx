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
  CircularProgress,
  Backdrop,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";

const CustomerForm = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    id_proof: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/customers");
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
    setLoading(false);
  };

  const filterCustomers = () => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        customer.Name.toLowerCase().includes(query) ||
        customer.Phone.includes(query) ||
        (customer.Email && customer.Email.toLowerCase().includes(query))
    );
    setFilteredCustomers(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Auto-format Aadhar number with hyphens after every 4 digits
    if (name === "id_proof") {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, "");

      // Limit to 12 digits (Aadhar number length)
      const limitedDigits = digitsOnly.slice(0, 12);

      // Add hyphens after every 4 digits
      let formattedValue = "";
      for (let i = 0; i < limitedDigits.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += "-";
        }
        formattedValue += limitedDigits[i];
      }

      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      id_proof: "",
    });
    setSubmitted(false);
    setEditingCustomer(null);
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.Name,
      phone: customer.Phone,
      email: customer.Email || "",
      address: customer.Address || "",
      id_proof: customer.ID_Proof || "",
    });
    setOpenDialog(true);
  };

  const handleDeleteClick = (customer) => {
    setDeletingCustomer(customer);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingCustomer(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const url = editingCustomer
        ? `http://localhost:5000/customers/${editingCustomer.Customer_ID}`
        : "http://localhost:5000/customers";
      const method = editingCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
        await fetchCustomers();
        setTimeout(() => {
          handleCloseDialog();
          setSubmitting(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error saving customer:", err);
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5000/customers/${deletingCustomer.Customer_ID}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        await fetchCustomers();
        handleCloseDeleteDialog();
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
    setSubmitting(false);
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
          Customer Management
        </Typography>
        <Button
          startIcon={<Plus size={20} />}
          onClick={handleOpenDialog}
          variant="outlined"
          sx={{ textTransform: "none" }}
        >
          Add Customer
        </Button>
      </div>

      {/* Customers Table Paper */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
        }}
      >
        {/* Search Bar */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Search size={20} style={{ color: "#757575" }} />
          <TextField
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            fontSize="0.7rem"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
              },
              fontSize: "0.7rem",
            }}
          />
        </div>

        {/* Customers Table */}
        {!loading && customers.length > 0 ? (
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
                    ID
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Phone
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Address
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    ID Proof
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
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.Customer_ID}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "medium",
                        fontSize: "0.9rem",
                      }}
                    >
                      {customer.Customer_ID}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "medium",
                        fontSize: "0.9rem",
                      }}
                    >
                      {customer.Name}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      <Chip
                        label={customer.Phone}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      {customer.Email || (
                        <Chip label="N/A" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      {customer.Address || (
                        <Chip label="N/A" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.9rem" }}>
                      {customer.ID_Proof ? (
                        <Chip
                          label={customer.ID_Proof}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip label="N/A" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Tooltip title="Edit Customer">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(customer)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                backgroundColor: "primary.light",
                                opacity: 0.1,
                              },
                            }}
                          >
                            <Edit2 size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Customer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(customer)}
                            sx={{
                              color: "error.main",
                              "&:hover": {
                                backgroundColor: "error.light",
                                opacity: 0.1,
                              },
                            }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
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
            Loading customers...
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No customers found. Click "Add Customer" to create one.
          </Typography>
        )}

        {/* No Results Message */}
        {!loading &&
          customers.length > 0 &&
          filteredCustomers.length === 0 &&
          searchQuery && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No customers match your search.
            </Typography>
          )}
      </Paper>

      {/* Add Customer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            position: "relative",
          },
        }}
      >
        {/* Loading Overlay */}
        {submitting && (
          <Backdrop
            open={submitting}
            sx={{
              position: "absolute",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: 2,
              flexDirection: "column",
              gap: 2,
            }}
          >
            <CircularProgress size={60} sx={{ color: "#fff" }} />
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 500 }}>
              {editingCustomer ? "Updating Customer..." : "Adding Customer..."}
            </Typography>
          </Backdrop>
        )}

        <DialogTitle sx={{ fontWeight: 600, fontSize: "1.25rem" }}>
          {editingCustomer ? "Edit Customer" : "Add New Customer"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {submitted && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Customer {editingCustomer ? "updated" : "added"} successfully!
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
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              variant="outlined"
              size="small"
              placeholder="+91 XXXXX XXXXX"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="ID Proof (Aadhar Number)"
              name="id_proof"
              value={formData.id_proof}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              placeholder="XXXX-XXXX-XXXX"
              helperText="Leave empty for foreign customers. Auto-formats as you type."
              inputProps={{
                maxLength: 14, // 12 digits + 2 hyphens
              }}
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
            disabled={!formData.name || !formData.phone}
          >
            {editingCustomer ? "Update Customer" : "Add Customer"}
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
          Delete Customer
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete customer{" "}
            <strong>{deletingCustomer?.Name}</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            {submitting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomerForm;
