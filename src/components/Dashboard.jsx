import React, { useState, useEffect } from "react";
import { Printer, BarChart3, Building2, DollarSign } from "lucide-react";

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
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-pulse">Loading dashboard data...</div>
        </div>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Dashboard Overview
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-sm font-medium mb-1">
              Total Bookings
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {stats.totalBookings}
            </div>
            <div className="text-xs text-green-600 mt-2 font-medium">
              +12% vs last month
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-sm font-medium mb-1">
              Active Bookings
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {stats.activeBookings}
            </div>
            <div className="text-xs text-green-600 mt-2 font-medium">
              Currently checked-in
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-sm font-medium mb-1">
              Total Customers
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              {stats.totalCustomers}
            </div>
            <div className="text-xs text-green-600 mt-2 font-medium">
              Registered users
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-gray-500 text-sm font-medium mb-1">
              Total Revenue
            </div>
            <div className="text-3xl font-semibold text-gray-900">
              ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <div className="text-xs text-green-600 mt-2 font-medium">
              All time earnings
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Room Occupancy */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Room Status</h2>
            <table className="w-full">
              <tbody>
                {occupancy.map((item) => (
                  <tr key={item.Status} className="border-b">
                    <td className="py-2">{item.Status}</td>
                    <td className="py-2 text-right">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                        {item.Count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Room Type Revenue */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Revenue by Room Type</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Type</th>
                  <th className="text-right py-2">Bookings</th>
                  <th className="text-right py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {roomTypeRevenue.map((item) => (
                  <tr key={item.Room_Type} className="border-b">
                    <td className="py-2">{item.Room_Type}</td>
                    <td className="py-2 text-right">{item.Bookings}</td>
                    <td className="py-2 text-right font-semibold">
                      ₹{item.Revenue?.toFixed(2) || "0.00"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Reports & Analytics</h2>
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>

          {/* Report Type Selection */}
          <div className="mb-6 flex gap-2 flex-wrap">
            {[
              {
                id: "summary",
                label: "Revenue Summary",
                icon: <BarChart3 size={18} />,
              },
              {
                id: "occupancy",
                label: "Room Occupancy",
                icon: <Building2 size={18} />,
              },
              {
                id: "revenue",
                label: "Revenue Breakdown",
                icon: <DollarSign size={18} />,
              },
            ].map((report) => (
              <button
                key={report.id}
                onClick={() => setReportType(report.id)}
                className={`px-4 py-2 rounded font-semibold transition flex items-center gap-2 ${
                  reportType === report.id
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                }`}
              >
                {report.icon}
                {report.label}
              </button>
            ))}
          </div>

          {/* Report Content */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            {reportType === "summary" && <RevenueSummaryReport stats={stats} />}
            {reportType === "occupancy" && <OccupancyReport data={occupancy} />}
            {reportType === "revenue" && (
              <RevenueByTypeReport data={roomTypeRevenue} />
            )}
          </div>
        </div>

        {/* Print Styles */}
        <style>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background-color: white;
          }
          .bg-gray-50 {
            background-color: white;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

const RevenueSummaryReport = ({ stats }) => (
  <div>
    <h3 className="text-2xl font-semibold mb-6">Revenue Summary Report</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-600">
        <div className="text-sm text-gray-600 font-semibold">
          Total Bookings
        </div>
        <div className="text-3xl font-bold text-blue-600">
          {stats.totalBookings}
        </div>
      </div>
      <div className="bg-green-50 p-4 rounded border-l-4 border-green-600">
        <div className="text-sm text-gray-600 font-semibold">
          Active Bookings
        </div>
        <div className="text-3xl font-bold text-green-600">
          {stats.activeBookings}
        </div>
      </div>
      <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-600">
        <div className="text-sm text-gray-600 font-semibold">
          Total Customers
        </div>
        <div className="text-3xl font-bold text-purple-600">
          {stats.totalCustomers}
        </div>
      </div>
      <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-600">
        <div className="text-sm text-gray-600 font-semibold">Total Revenue</div>
        <div className="text-3xl font-bold text-orange-600">
          ₹{stats.totalRevenue?.toFixed(2) || "0.00"}
        </div>
      </div>
    </div>
  </div>
);

const OccupancyReport = ({ data }) => (
  <div>
    <h3 className="text-2xl font-semibold mb-6">Room Occupancy Report</h3>
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2 text-left">Status</th>
          <th className="border px-4 py-2 text-right">Count</th>
          <th className="border px-4 py-2 text-right">Percentage</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => {
          const total = data.reduce((sum, d) => sum + d.Count, 0);
          const percentage = ((item.Count / total) * 100).toFixed(1);
          return (
            <tr key={item.Status}>
              <td className="border px-4 py-2">{item.Status}</td>
              <td className="border px-4 py-2 text-right">{item.Count}</td>
              <td className="border px-4 py-2 text-right font-semibold">
                {percentage}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const RevenueByTypeReport = ({ data }) => (
  <div>
    <h3 className="text-2xl font-semibold mb-6">Revenue by Room Type</h3>
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border px-4 py-2 text-left">Room Type</th>
          <th className="border px-4 py-2 text-right">Bookings</th>
          <th className="border px-4 py-2 text-right">Revenue</th>
          <th className="border px-4 py-2 text-right">Avg per Booking</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.Room_Type}>
            <td className="border px-4 py-2 font-semibold">{item.Room_Type}</td>
            <td className="border px-4 py-2 text-right">{item.Bookings}</td>
            <td className="border px-4 py-2 text-right font-semibold">
              ₹{item.Revenue?.toFixed(2) || "0.00"}
            </td>
            <td className="border px-4 py-2 text-right">
              ₹
              {item.Bookings > 0
                ? (item.Revenue / item.Bookings).toFixed(2)
                : "0.00"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Dashboard;
