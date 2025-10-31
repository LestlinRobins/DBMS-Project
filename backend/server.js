const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "HotelBookingDB",
});

db.connect((err) => {
  if (err) console.error("Database connection failed:", err);
  else console.log("Connected to MySQL");
});

// Customers Section
app.get("/customers", (req, res) => {
  const { sortBy } = req.query;
  let query = "SELECT * FROM Customer";

  if (sortBy === "customer_id") {
    query += " ORDER BY Customer_ID ASC";
  } else if (sortBy === "name") {
    query += " ORDER BY Name ASC";
  } else if (sortBy === "joined_on") {
    query += " ORDER BY Joined_on DESC";
  }

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.post("/customers", (req, res) => {
  const { name, phone, email, address, id_proof, joined_on } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const query = joined_on
    ? "INSERT INTO Customer (Name, Phone, Email, Address, ID_Proof, Joined_on) VALUES (?, ?, ?, ?, ?, ?)"
    : "INSERT INTO Customer (Name, Phone, Email, Address, ID_Proof) VALUES (?, ?, ?, ?, ?)";

  const values = joined_on
    ? [name, phone, email || null, address || null, id_proof || null, joined_on]
    : [name, phone, email || null, address || null, id_proof || null];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to add customer" });
    res.status(201).json({
      message: "Customer added successfully",
      customerId: result.insertId,
    });
  });
});

app.put("/customers/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, email, address, id_proof } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const query =
    "UPDATE Customer SET Name = ?, Phone = ?, Email = ?, Address = ?, ID_Proof = ? WHERE Customer_ID = ?";
  const values = [
    name,
    phone,
    email || null,
    address || null,
    id_proof || null,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err)
      return res.status(500).json({ error: "Failed to update customer" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer updated successfully" });
  });
});

app.delete("/customers/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM Customer WHERE Customer_ID = ?",
    [id],
    (err, result) => {
      if (err)
        return res.status(500).json({ error: "Failed to delete customer" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Customer not found" });
      res.json({ message: "Customer deleted successfully" });
    }
  );
});

// Rooms Section
app.get("/rooms", (req, res) => {
  const { sortBy } = req.query;
  let query = "SELECT * FROM room";

  if (sortBy === "price") {
    query += " ORDER BY Price_Per_Night ASC";
  } else if (sortBy === "room_number") {
    query += " ORDER BY Room_Number ASC";
  } else if (sortBy === "floor") {
    query += " ORDER BY Floor_Number ASC";
  }

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.post("/rooms", (req, res) => {
  const { room_number, room_type, price_per_night, floor_number } = req.body;

  if (!room_number || !price_per_night) {
    return res
      .status(400)
      .json({ error: "Room number and price are required" });
  }

  const query =
    "INSERT INTO room (Room_Number, Room_Type, Price_Per_Night, Floor_Number, Status) VALUES (?, ?, ?, ?, 'Available')";
  const values = [
    room_number,
    room_type || "Single",
    price_per_night,
    floor_number || null,
  ];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to add room" });
    res
      .status(201)
      .json({ message: "Room added successfully", roomId: result.insertId });
  });
});

app.put("/rooms/:id", (req, res) => {
  const { id } = req.params;
  const { room_number, room_type, price_per_night, floor_number, status } =
    req.body;

  const query =
    "UPDATE room SET Room_Number = ?, Room_Type = ?, Price_Per_Night = ?, Floor_Number = ?, Status = ? WHERE Room_ID = ?";
  const values = [
    room_number,
    room_type,
    price_per_night,
    floor_number || null,
    status || "Available",
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Room number already exists" });
      }
      return res.status(500).json({ error: "Failed to update room" });
    }
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room updated successfully" });
  });
});

app.delete("/rooms/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM room WHERE Room_ID = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete room" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Room not found" });
    res.json({ message: "Room deleted successfully" });
  });
});

// Bookings Section
app.get("/bookings", (req, res) => {
  db.query("SELECT * FROM Booking", (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
