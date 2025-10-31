import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
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
  Print as PrintIcon,
  BarChart as BarChartIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AccountBalanceWallet as WalletIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from "@mui/icons-material";
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
      <Box sx={{ p: 4, width: "100%" }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>Loading dashboard data...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </Paper>
      </Box>
    );

  return (
    <Box sx={{ p: 4, width: "100%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
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
          {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Bookings Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              "&:hover": { boxShadow: 4 },
              transition: "box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "primary.main",
                    borderRadius: 2,
                  }}
                >
                  <EventIcon sx={{ color: "white" }} />
                </Box>
                <Chip
                  label="+12%"
                  color="success"
                  size="small"
                  icon={<TrendingUpIcon />}
                />
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Bookings
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.totalBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                vs last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Bookings Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              "&:hover": { boxShadow: 4 },
              transition: "box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "success.main",
                    borderRadius: 2,
                  }}
                >
                  <BarChartIcon sx={{ color: "white" }} />
                </Box>
                <Chip label="ACTIVE" color="success" size="small" />
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Active Bookings
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.activeBookings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Currently checked-in
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Customers Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              "&:hover": { boxShadow: 4 },
              transition: "box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "secondary.main",
                    borderRadius: 2,
                  }}
                >
                  <PeopleIcon sx={{ color: "white" }} />
                </Box>
                <Chip
                  label="+8%"
                  color="success"
                  size="small"
                  icon={<TrendingUpIcon />}
                />
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {stats.totalCustomers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Registered users
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              height: "100%",
              "&:hover": { boxShadow: 4 },
              transition: "box-shadow 0.3s",
            }}
          >
            <CardContent>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "warning.main",
                    borderRadius: 2,
                  }}
                >
                  <WalletIcon sx={{ color: "white" }} />
                </Box>
                <Chip
                  label="+15%"
                  color="success"
                  size="small"
                  icon={<TrendingUpIcon />}
                />
              </Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All time earnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Room Occupancy */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "primary.light",
                    borderRadius: 1,
                  }}
                >
                  <BusinessIcon color="primary" />
                </Box>
                <Typography variant="h6" fontWeight="medium">
                  Room Status Overview
                </Typography>
              </Box>
              <Box>
                {occupancy.map((item, index) => {
                  const colors = ["success", "info", "warning"];
                  const chipColor = colors[index % colors.length];
                  return (
                    <Box
                      key={item.Status}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={2}
                      sx={{
                        "&:not(:last-child)": {
                          borderBottom: 1,
                          borderColor: "divider",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: `${chipColor}.main`,
                          }}
                        />
                        <Typography variant="body2" fontWeight="medium">
                          {item.Status}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.Count}
                        color={chipColor}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Room Type Revenue */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "success.light",
                    borderRadius: 1,
                  }}
                >
                  <MoneyIcon color="success" />
                </Box>
                <Typography variant="h6" fontWeight="medium">
                  Revenue by Room Type
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Type
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight="bold">
                          Bookings
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2" fontWeight="bold">
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
                          <Typography variant="body2" fontWeight="medium">
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
                            fontWeight="medium"
                            color="success.main"
                          >
                            ₹{item.Revenue?.toFixed(2) || "0.00"}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "primary.main",
                  borderRadius: 2,
                }}
              >
                <BarChartIcon sx={{ color: "white" }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="medium">
                  Reports & Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View detailed insights and metrics
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ textTransform: "none" }}
            >
              Print Report
            </Button>
          </Box>

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
              icon={<BarChartIcon />}
              iconPosition="start"
              sx={{ textTransform: "none", minHeight: 48 }}
            />
            <Tab
              value="occupancy"
              label="Room Occupancy"
              icon={<BusinessIcon />}
              iconPosition="start"
              sx={{ textTransform: "none", minHeight: 48 }}
            />
            <Tab
              value="revenue"
              label="Revenue Breakdown"
              icon={<MoneyIcon />}
              iconPosition="start"
              sx={{ textTransform: "none", minHeight: 48 }}
            />
          </Tabs>

          {/* Report Content */}
          <Paper
            elevation={0}
            sx={{ bgcolor: "grey.50", p: 3, borderRadius: 2 }}
          >
            {reportType === "summary" && <RevenueSummaryReport stats={stats} />}
            {reportType === "occupancy" && <OccupancyReport data={occupancy} />}
            {reportType === "revenue" && (
              <RevenueByTypeReport data={roomTypeRevenue} />
            )}
          </Paper>
        </CardContent>
      </Card>
    </Box>
  );
};

const RevenueSummaryReport = ({ stats }) => (
  <Grid container spacing={2}>
    <Grid item xs={6} md={3}>
      <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Total Bookings
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {stats.totalBookings}
        </Typography>
      </Paper>
    </Grid>
    <Grid item xs={6} md={3}>
      <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Active Bookings
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {stats.activeBookings}
        </Typography>
      </Paper>
    </Grid>
    <Grid item xs={6} md={3}>
      <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Total Customers
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {stats.totalCustomers}
        </Typography>
      </Paper>
    </Grid>
    <Grid item xs={6} md={3}>
      <Paper elevation={2} sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Total Revenue
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
        </Typography>
      </Paper>
    </Grid>
  </Grid>
);

const OccupancyReport = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.Count, 0);

  return (
    <Box>
      {data.map((item, index) => {
        const percentage = ((item.Count / total) * 100).toFixed(1);
        const colors = ["success", "info", "warning"];
        const color = colors[index % colors.length];

        return (
          <Box key={item.Status} sx={{ mb: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1}
            >
              <Typography variant="body2" fontWeight="medium">
                {item.Status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.Count} ({percentage}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={parseFloat(percentage)}
              color={color}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const RevenueByTypeReport = ({ data }) => (
  <Box>
    {data.map((item, index) => (
      <Box
        key={item.Room_Type}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        py={2}
        sx={{
          "&:not(:last-child)": { borderBottom: 1, borderColor: "divider" },
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {item.Room_Type}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.Bookings} bookings
          </Typography>
        </Box>
        <Typography variant="body2" fontWeight="medium" color="success.main">
          ₹{item.Revenue?.toFixed(2) || "0.00"}
        </Typography>
      </Box>
    ))}
  </Box>
);

export default Dashboard;
