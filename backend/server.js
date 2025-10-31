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

app.get("/customers", (req, res) => {
  db.query("SELECT * FROM Customer", (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.post("/customers", (req, res) => {
  const { name, phone, email, address, id_proof } = req.body;

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
    if (err) return res.status(500).json({ error: "Failed to add customer" });
    res
      .status(201)
      .json({
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

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
