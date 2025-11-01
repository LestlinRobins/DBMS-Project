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
  const { status, search, sortBy } = req.query;
  let query = `
    SELECT 
      b.Booking_ID,
      b.Customer_ID,
      b.Room_ID,
      b.Check_In_Date,
      b.Check_Out_Date,
      b.Booking_Date,
      b.Total_Amount,
      b.Booking_Status,
      c.Name as Customer_Name,
      c.Phone as Customer_Phone,
      r.Room_Number,
      r.Room_Type,
      r.Floor_Number
    FROM Booking b
    JOIN Customer c ON b.Customer_ID = c.Customer_ID
    JOIN room r ON b.Room_ID = r.Room_ID
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== "All") {
    query += " AND b.Booking_Status = ?";
    params.push(status);
  }

  if (search) {
    query +=
      " AND (c.Name LIKE ? OR r.Room_Number LIKE ? OR b.Booking_ID LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (sortBy === "booking_date") {
    query += " ORDER BY b.Booking_Date DESC";
  } else if (sortBy === "check_in") {
    query += " ORDER BY b.Check_In_Date ASC";
  } else if (sortBy === "customer") {
    query += " ORDER BY c.Name ASC";
  } else {
    query += " ORDER BY b.Booking_ID DESC";
  }

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.get("/bookings/:id", (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      b.*,
      c.Name as Customer_Name,
      c.Phone as Customer_Phone,
      c.Email as Customer_Email,
      c.Address as Customer_Address,
      r.Room_Number,
      r.Room_Type,
      r.Price_Per_Night,
      r.Floor_Number
    FROM Booking b
    JOIN Customer c ON b.Customer_ID = c.Customer_ID
    JOIN room r ON b.Room_ID = r.Room_ID
    WHERE b.Booking_ID = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    if (results.length === 0)
      return res.status(404).json({ error: "Booking not found" });
    res.json(results[0]);
  });
});

app.get("/rooms/available", (req, res) => {
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    return res
      .status(400)
      .json({ error: "Check-in and check-out dates are required" });
  }

  const query = `
    SELECT * FROM room
    WHERE Room_ID NOT IN (
      SELECT Room_ID FROM Booking
      WHERE Booking_Status = 'Active'
      AND (
        (Check_In_Date <= ? AND Check_Out_Date >= ?)
        OR (Check_In_Date <= ? AND Check_Out_Date >= ?)
        OR (Check_In_Date >= ? AND Check_Out_Date <= ?)
      )
    )
    ORDER BY Room_Number ASC
  `;

  db.query(
    query,
    [checkOut, checkIn, checkIn, checkOut, checkIn, checkOut],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database query failed" });
      res.json(results);
    }
  );
});

app.post("/bookings", (req, res) => {
  const { customer_id, room_id, check_in_date, check_out_date, total_amount } =
    req.body;

  if (!customer_id || !room_id || !check_in_date || !check_out_date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Use provided total_amount if available, otherwise calculate from room price
  if (total_amount) {
    // Use the total_amount provided from frontend (includes GST)
    const query =
      "INSERT INTO Booking (Customer_ID, Room_ID, Check_In_Date, Check_Out_Date, Total_Amount, Booking_Status) VALUES (?, ?, ?, ?, ?, 'Active')";
    const values = [
      customer_id,
      room_id,
      check_in_date,
      check_out_date,
      total_amount,
    ];

    db.query(query, values, (err, result) => {
      if (err)
        return res.status(500).json({ error: "Failed to create booking" });
      res.status(201).json({
        message: "Booking created successfully",
        bookingId: result.insertId,
      });
    });
  } else {
    // Fallback: Get room price to calculate total (without GST)
    db.query(
      "SELECT Price_Per_Night FROM room WHERE Room_ID = ?",
      [room_id],
      (err, roomResults) => {
        if (err)
          return res
            .status(500)
            .json({ error: "Failed to fetch room details" });
        if (roomResults.length === 0)
          return res.status(404).json({ error: "Room not found" });

        const pricePerNight = roomResults[0].Price_Per_Night;
        const checkIn = new Date(check_in_date);
        const checkOut = new Date(check_out_date);
        const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalAmount = days * pricePerNight;

        const query =
          "INSERT INTO Booking (Customer_ID, Room_ID, Check_In_Date, Check_Out_Date, Total_Amount, Booking_Status) VALUES (?, ?, ?, ?, ?, 'Active')";
        const values = [
          customer_id,
          room_id,
          check_in_date,
          check_out_date,
          totalAmount,
        ];

        db.query(query, values, (err, result) => {
          if (err)
            return res.status(500).json({ error: "Failed to create booking" });
          res.status(201).json({
            message: "Booking created successfully",
            bookingId: result.insertId,
            totalAmount: totalAmount,
          });
        });
      }
    );
  }
});

app.put("/bookings/:id", (req, res) => {
  const { id } = req.params;
  const { booking_status } = req.body;

  if (!booking_status) {
    return res.status(400).json({ error: "Booking status is required" });
  }

  const query = "UPDATE Booking SET Booking_Status = ? WHERE Booking_ID = ?";

  db.query(query, [booking_status, id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update booking" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking updated successfully" });
  });
});

app.delete("/bookings/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM Booking WHERE Booking_ID = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete booking" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  });
});

// Payments Section
app.get("/bookings", (req, res) => {
  const query = `
    SELECT 
      b.Booking_ID,
      b.Customer_ID,
      b.Room_ID,
      b.Check_In_Date,
      b.Check_Out_Date,
      b.Booking_Date,
      b.Total_Amount,
      b.Booking_Status,
      c.Name as CustomerName,
      c.Phone as CustomerPhone,
      r.Room_Number,
      r.Room_Type
    FROM Booking b
    JOIN Customer c ON b.Customer_ID = c.Customer_ID
    JOIN room r ON b.Room_ID = r.Room_ID
    ORDER BY b.Booking_ID DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.get("/payments/:bookingId", (req, res) => {
  const { bookingId } = req.params;

  const query = `
    SELECT 
      Payment_ID,
      Booking_ID,
      Payment_Date,
      Payment_Mode,
      Amount_Paid,
      Balance_Amount
    FROM Payment
    WHERE Booking_ID = ?
    ORDER BY Payment_Date DESC
  `;

  db.query(query, [bookingId], (err, results) => {
    if (err) return res.status(500).json({ error: "Database query failed" });
    res.json(results);
  });
});

app.post("/payments", (req, res) => {
  const { booking_id, payment_mode, amount_paid } = req.body;

  if (!booking_id || !payment_mode || !amount_paid) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // First, get the booking total amount and calculate current balance
  db.query(
    "SELECT Total_Amount FROM Booking WHERE Booking_ID = ?",
    [booking_id],
    (err, bookingResults) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to fetch booking details" });
      if (bookingResults.length === 0)
        return res.status(404).json({ error: "Booking not found" });

      const totalAmount = bookingResults[0].Total_Amount;

      // Get total paid so far
      db.query(
        "SELECT SUM(Amount_Paid) as TotalPaid FROM Payment WHERE Booking_ID = ?",
        [booking_id],
        (err, paymentResults) => {
          if (err)
            return res
              .status(500)
              .json({ error: "Failed to fetch payment details" });

          const totalPaid = paymentResults[0].TotalPaid || 0;
          const newBalance = totalAmount - totalPaid - parseFloat(amount_paid);

          // Validate that payment doesn't exceed balance
          if (newBalance < 0) {
            return res.status(400).json({
              error: "Payment amount exceeds balance due",
            });
          }

          // Insert the payment record
          const query =
            "INSERT INTO Payment (Booking_ID, Payment_Mode, Amount_Paid, Balance_Amount) VALUES (?, ?, ?, ?)";
          const values = [booking_id, payment_mode, amount_paid, newBalance];

          db.query(query, values, (err, result) => {
            if (err)
              return res
                .status(500)
                .json({ error: "Failed to record payment" });
            res.status(201).json({
              message: "Payment recorded successfully",
              paymentId: result.insertId,
              balanceAmount: newBalance,
            });
          });
        }
      );
    }
  );
});

app.delete("/payments/:id", (req, res) => {
  const { id } = req.params;

  // First get the payment details to update subsequent payments
  db.query(
    "SELECT Booking_ID, Amount_Paid FROM Payment WHERE Payment_ID = ?",
    [id],
    (err, paymentResults) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to fetch payment details" });
      if (paymentResults.length === 0)
        return res.status(404).json({ error: "Payment not found" });

      const bookingId = paymentResults[0].Booking_ID;
      const deletedAmount = paymentResults[0].Amount_Paid;

      // Delete the payment
      db.query(
        "DELETE FROM Payment WHERE Payment_ID = ?",
        [id],
        (err, result) => {
          if (err)
            return res.status(500).json({ error: "Failed to delete payment" });

          // Recalculate balances for all payments of this booking
          db.query(
            "SELECT Total_Amount FROM Booking WHERE Booking_ID = ?",
            [bookingId],
            (err, bookingResults) => {
              if (err || bookingResults.length === 0) {
                return res.json({
                  message: "Payment deleted successfully",
                });
              }

              const totalAmount = bookingResults[0].Total_Amount;

              // Get all remaining payments for this booking
              db.query(
                "SELECT Payment_ID, Amount_Paid FROM Payment WHERE Booking_ID = ? ORDER BY Payment_Date ASC",
                [bookingId],
                (err, payments) => {
                  if (err || payments.length === 0) {
                    return res.json({
                      message: "Payment deleted successfully",
                    });
                  }

                  // Update balance for each payment
                  let runningPaid = 0;
                  payments.forEach((payment, index) => {
                    runningPaid += payment.Amount_Paid;
                    const newBalance = totalAmount - runningPaid;

                    db.query(
                      "UPDATE Payment SET Balance_Amount = ? WHERE Payment_ID = ?",
                      [newBalance, payment.Payment_ID],
                      (err) => {
                        if (err)
                          console.error("Failed to update balance:", err);
                      }
                    );
                  });

                  res.json({ message: "Payment deleted successfully" });
                }
              );
            }
          );
        }
      );
    }
  );
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
