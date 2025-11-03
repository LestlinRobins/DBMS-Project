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
  CreditCard,
} from "lucide-react";
import { useThemeMode } from "../theme/ThemeContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    totalCustomers: 0,
  });
  const [occupancy, setOccupancy] = useState([]);
  const [roomTypeRevenue, setRoomTypeRevenue] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [paymentModes, setPaymentModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("summary");
  const { mode, toggleMode } = useThemeMode();

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe", "#43e97b"];
  const CHART_COLORS = {
    primary: "#667eea",
    secondary: "#764ba2",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

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
        totalRevenue: parseFloat(revenueData.Total_Revenue) || 0,
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
      const formattedRevenueData = revenueByTypeData.map((item) => ({
        ...item,
        Revenue: parseFloat(item.Revenue) || 0,
      }));
      setRoomTypeRevenue(formattedRevenueData);

      const monthlyRevenueRes = await fetch(
        "http://localhost:5000/api/reports/monthly-revenue"
      );
      const monthlyRevenueData = await monthlyRevenueRes.json();
      const formattedMonthlyData = monthlyRevenueData.map((item) => ({
        ...item,
        Revenue: parseFloat(item.Revenue) || 0,
      }));
      setMonthlyRevenue(formattedMonthlyData);

      const paymentModesRes = await fetch(
        "http://localhost:5000/api/reports/payment-modes"
      );
      const paymentModesData = await paymentModesRes.json();
      const formattedPaymentData = paymentModesData.map((item) => ({
        ...item,
        Total: parseFloat(item.Total) || 0,
      }));
      setPaymentModes(formattedPaymentData);

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
        {/* Monthly Revenue Trend */}
        <Paper sx={{ p: 3, height: "400px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <TrendingUp size={20} style={{ color: CHART_COLORS.primary }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Monthly Revenue Trend
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="Month"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: mode === "dark" ? "#1f2937" : "#fff",
                  border: `1px solid ${
                    mode === "dark" ? "#374151" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                itemStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                labelStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                formatter={(value) => [`₹${value}`, "Revenue"]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke={CHART_COLORS.primary}
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.primary, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Room Type Revenue Bar Chart */}
        <Paper sx={{ p: 3, height: "400px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <BarChart3 size={20} style={{ color: CHART_COLORS.success }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Revenue by Room Type
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={roomTypeRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="Room_Type"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: mode === "dark" ? "#1f2937" : "#fff",
                  border: `1px solid ${
                    mode === "dark" ? "#374151" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                itemStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                labelStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                formatter={(value) => [`₹${value}`, "Revenue"]}
              />
              <Legend />
              <Bar
                dataKey="Revenue"
                fill={CHART_COLORS.success}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </div>

      {/* Additional Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        {/* Room Occupancy Pie Chart */}
        <Paper sx={{ p: 3, height: "400px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <Home size={20} style={{ color: CHART_COLORS.info }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Room Status Distribution
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={occupancy}
                dataKey="Count"
                nameKey="Status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ Status, Count }) => `${Status}: ${Count}`}
                labelLine={true}
              >
                {occupancy.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: mode === "dark" ? "#1f2937" : "#fff",
                  border: `1px solid ${
                    mode === "dark" ? "#374151" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                itemStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                labelStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Payment Modes Distribution */}
        <Paper sx={{ p: 3, height: "400px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <CreditCard size={20} style={{ color: CHART_COLORS.warning }} />
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Payment Methods Distribution
            </Typography>
          </div>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={paymentModes}
                dataKey="Total"
                nameKey="Payment_Mode"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ Payment_Mode, Total }) =>
                  `${Payment_Mode}: ₹${Total.toFixed(0)}`
                }
                labelLine={true}
              >
                {paymentModes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: mode === "dark" ? "#1f2937" : "#fff",
                  border: `1px solid ${
                    mode === "dark" ? "#374151" : "#e5e7eb"
                  }`,
                  borderRadius: "8px",
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                itemStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                labelStyle={{
                  color: mode === "dark" ? "#fff" : "#000",
                }}
                formatter={(value) => `₹${value.toFixed(2)}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
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
        <Box elevation={0} sx={{ minHeight: "300px" }}>
          {reportType === "summary" && <RevenueSummaryReport stats={stats} />}
          {reportType === "occupancy" && <OccupancyReport data={occupancy} />}
          {reportType === "revenue" && (
            <RevenueByTypeReport
              data={roomTypeRevenue}
              paymentData={paymentModes}
            />
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

const RevenueByTypeReport = ({ data, paymentData }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "24px",
    }}
  >
    {/* Room Type Revenue Table */}
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: "bold", mb: 2, color: "text.secondary" }}
      >
        Revenue by Room Type
      </Typography>
      {data.map((item, index) => (
        <div
          key={item.Room_Type}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            paddingBottom: "12px",
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
    </Paper>

    {/* Payment Modes Table */}
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: "bold", mb: 2, color: "text.secondary" }}
      >
        Payment Methods Breakdown
      </Typography>
      {paymentData.map((item, index) => (
        <div
          key={item.Payment_Mode}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "12px",
            paddingBottom: "12px",
            borderBottom:
              index !== paymentData.length - 1 ? "1px solid #e5e7eb" : "none",
          }}
        >
          <div>
            <Typography variant="body2" sx={{ fontWeight: "medium" }}>
              {item.Payment_Mode}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.Count} transactions
            </Typography>
          </div>
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "primary.main" }}
          >
            ₹{item.Total?.toFixed(2) || "0.00"}
          </Typography>
        </div>
      ))}
    </Paper>
  </div>
);

export default Dashboard;
