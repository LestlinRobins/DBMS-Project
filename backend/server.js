const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Optional: Add this header to silence CSP warnings
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
  );
  next();
});

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234", // your MySQL password if any
  database: "HotelBookingDB", // your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL");
  }
});

// API routes
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM Customer", (err, results) => {
    if (err) {
      console.error("❌ Query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// Add customer endpoint
app.post("/customers", (req, res) => {
  const { name, phone, email, address, id_proof } = req.body;

  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const query =
    "INSERT INTO Customer (Name, Phone, Email, Address, ID_Proof) VALUES (?, ?, ?, ?, ?)";
  const values = [
    name,
    phone,
    email || null,
    address || null,
    id_proof || null,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ Error adding customer:", err);
      return res.status(500).json({ error: "Failed to add customer" });
    }
    res.status(201).json({
      message: "Customer added successfully",
      customerId: result.insertId,
    });
  });
});

// Start server
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
