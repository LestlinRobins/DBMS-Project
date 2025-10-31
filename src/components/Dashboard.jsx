import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Printer,
  BarChart3,
  Home,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Wallet,
  Sun,
  Moon,
} from "lucide-react";
import { useThemeMode } from "../theme/ThemeContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    totalCustomers: 0,
  });
  const [occupancy, setOccupancy] = useState([]);
  const [roomTypeRevenue, setRoomTypeRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("summary");
  const { mode, toggleMode } = useThemeMode();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const revenueRes = await fetch(
        "http://localhost:5000/api/reports/revenue"
      );
      const revenueData = await revenueRes.json();
      setStats({
        totalBookings: revenueData.Total_Bookings || 0,
        totalRevenue: revenueData.Total_Revenue || 0,
        activeBookings: revenueData.Active_Bookings || 0,
        totalCustomers: revenueData.Total_Customers || 0,
      });

      const occupancyRes = await fetch(
        "http://localhost:5000/api/reports/occupancy"
      );
      const occupancyData = await occupancyRes.json();
      setOccupancy(occupancyData);

      const revenueByTypeRes = await fetch(
        "http://localhost:5000/api/reports/room-type-revenue"
      );
      const revenueByTypeData = await revenueByTypeRes.json();
      setRoomTypeRevenue(revenueByTypeData);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return (
      <div style={{ padding: "32px", width: "100%" }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading dashboard data...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      </div>
    );

  return (
    <div style={{ padding: "32px", width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
          Dashboard Overview
        </Typography>
        <IconButton
          onClick={toggleMode}
          sx={{
            p: 2,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </IconButton>
      </div>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Total Bookings Card */}
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <Calendar size={20} style={{ color: "var(--color-primary)" }} />
            <Chip
              label="+12%"
              color="success"
              size="small"
              icon={<TrendingUp size={16} />}
            />
          </div>
          <div>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Total Bookings
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
              {stats.totalBookings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </div>
        </Paper>

        {/* Active Bookings Card */}
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <BarChart3 size={20} style={{ color: "var(--color-success)" }} />
            <Chip label="ACTIVE" color="success" size="small" />
          </div>
          <div>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Active Bookings
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
              {stats.activeBookings}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Currently checked-in
            </Typography>
          </div>
        </Paper>

        {/* Total Customers Card */}
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <Users size={20} style={{ color: "var(--color-secondary)" }} />
            <Chip
              label="+8%"
              color="success"
              size="small"
              icon={<TrendingUp size={16} />}
            />
          </div>
          <div>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Total Customers
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
              {stats.totalCustomers}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Registered users
            </Typography>
          </div>
        </Paper>

        {/* Total Revenue Card */}
        <Paper
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "16px",
            }}
          >
            <Wallet size={20} style={{ color: "var(--color-warning)" }} />
            <Chip
              label="+15%"
              color="success"
              size="small"
              icon={<TrendingUp size={16} />}
            />
          </div>
          <div>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold", my: 1 }}>
              ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              All time earnings
            </Typography>
          </div>
        </Paper>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Room Occupancy */}
        <Paper sx={{ p: 3, height: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Home size={20} style={{ color: "var(--color-primary)" }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Room Status Overview
            </Typography>
          </div>
          <div>
            {occupancy.map((item, index) => {
              const colors = ["success", "info", "warning"];
              const chipColor = colors[index % colors.length];
              return (
                <div
                  key={item.Status}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "16px",
                    paddingBottom: "16px",
                    borderBottom:
                      index !== occupancy.length - 1
                        ? "1px solid #e5e7eb"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor:
                          chipColor === "success"
                            ? "#10b981"
                            : chipColor === "info"
                            ? "#3b82f6"
                            : "#f59e0b",
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {item.Status}
                    </Typography>
                  </div>
                  <Chip
                    label={item.Count}
                    color={chipColor}
                    size="small"
                    variant="outlined"
                  />
                </div>
              );
            })}
          </div>
        </Paper>

        {/* Room Type Revenue */}
        <Paper sx={{ p: 3, height: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <DollarSign size={20} style={{ color: "var(--color-success)" }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Revenue by Room Type
            </Typography>
          </div>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Type
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Bookings
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Revenue
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomTypeRevenue.map((item) => (
                  <TableRow
                    key={item.Room_Type}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {item.Room_Type}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={item.Bookings}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "medium", color: "success.main" }}
                      >
                        ₹{item.Revenue?.toFixed(2) || "0.00"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>

      {/* Reports Section */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <BarChart3 size={20} style={{ color: "var(--color-primary)" }} />
            <div>
              <Typography variant="h6" sx={{ fontWeight: "medium" }}>
                Reports & Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View detailed insights and metrics
              </Typography>
            </div>
          </div>
          <Button
            variant="outlined"
            startIcon={<Printer size={20} />}
            onClick={handlePrint}
            sx={{ textTransform: "none" }}
          >
            Print Report
          </Button>
        </div>

        <Divider sx={{ mb: 3 }} />

        {/* Report Type Selection */}
        <Tabs
          value={reportType}
          onChange={(e, newValue) => setReportType(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab
            value="summary"
            label="Revenue Summary"
            icon={<BarChart3 size={18} />}
            iconPosition="start"
            sx={{ textTransform: "none", minHeight: 48 }}
          />
          <Tab
            value="occupancy"
            label="Room Occupancy"
            icon={<Home size={18} />}
            iconPosition="start"
            sx={{ textTransform: "none", minHeight: 48 }}
          />
          <Tab
            value="revenue"
            label="Revenue Breakdown"
            icon={<DollarSign size={18} />}
            iconPosition="start"
            sx={{ textTransform: "none", minHeight: 48 }}
          />
        </Tabs>

        {/* Report Content */}
        <Box elevation={0} sx={{ height: "120%" }}>
          {reportType === "summary" && <RevenueSummaryReport stats={stats} />}
          {reportType === "occupancy" && <OccupancyReport data={occupancy} />}
          {reportType === "revenue" && (
            <RevenueByTypeReport data={roomTypeRevenue} />
          )}
        </Box>
      </Box>
    </div>
  );
};

const RevenueSummaryReport = ({ stats }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "16px",
    }}
  >
    <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="caption" color="text.secondary">
        Total Bookings
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {stats.totalBookings}
      </Typography>
    </Paper>
    <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="caption" color="text.secondary">
        Active Bookings
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {stats.activeBookings}
      </Typography>
    </Paper>
    <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="caption" color="text.secondary">
        Total Customers
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        {stats.totalCustomers}
      </Typography>
    </Paper>
    <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
      <Typography variant="caption" color="text.secondary">
        Total Revenue
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
      </Typography>
    </Paper>
  </div>
);

const OccupancyReport = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.Count, 0);

  return (
    <div>
      {data.map((item, index) => {
        const percentage = ((item.Count / total) * 100).toFixed(1);
        const colors = ["success", "info", "warning"];
        const color = colors[index % colors.length];

        return (
          <div key={item.Status} style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                {item.Status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.Count} ({percentage}%)
              </Typography>
            </div>
            <LinearProgress
              variant="determinate"
              value={parseFloat(percentage)}
              color={color}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </div>
        );
      })}
    </div>
  );
};

const RevenueByTypeReport = ({ data }) => (
  <div>
    {data.map((item, index) => (
      <div
        key={item.Room_Type}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "16px",
          paddingBottom: "16px",
          borderBottom:
            index !== data.length - 1 ? "1px solid #e5e7eb" : "none",
        }}
      >
        <div>
          <Typography variant="body2" sx={{ fontWeight: "medium" }}>
            {item.Room_Type}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.Bookings} bookings
          </Typography>
        </div>
        <Typography
          variant="body2"
          sx={{ fontWeight: "medium", color: "success.main" }}
        >
          ₹{item.Revenue?.toFixed(2) || "0.00"}
        </Typography>
      </div>
    ))}
  </div>
);

export default Dashboard;
