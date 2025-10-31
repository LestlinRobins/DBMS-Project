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

// API route
app.get("/customers", (req, res) => {
  db.query("SELECT * FROM Customer", (err, results) => {
    if (err) {
      console.error("❌ Query error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// Start server
app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
