import { useState } from "react";
import "./App.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  CreditCard,
  Building2,
} from "lucide-react";
import { CustomThemeProvider, useThemeMode } from "./theme/ThemeContext";
import Dashboard from "./components/Dashboard";
import CustomerForm from "./components/CustomerForm";
import RoomManagement from "./components/RoomManagement";
import BookingManagement from "./components/BookingManagement";
import PaymentPage from "./components/PaymentPage";

// Separate component that uses the theme
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedBookingForPayment, setSelectedBookingForPayment] =
    useState(null);
  const { theme } = useThemeMode();

  const navigateToPayment = (booking) => {
    setSelectedBookingForPayment(booking);
    setCurrentPage("payments");
  };

  const handlePageChange = (page) => {
    if (page !== "payments") {
      setSelectedBookingForPayment(null);
    }
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "customers":
        return <CustomerForm />;
      case "rooms":
        return <RoomManagement />;
      case "bookings":
        return <BookingManagement onNavigateToPayment={navigateToPayment} />;
      case "payments":
        return <PaymentPage selectedBooking={selectedBookingForPayment} />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: "customers",
      label: "Customers",
      icon: <Users size={20} />,
    },
    {
      id: "rooms",
      label: "Rooms",
      icon: <Home size={20} />,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: <Calendar size={20} />,
    },
    {
      id: "payments",
      label: "Payments",
      icon: <CreditCard size={20} />,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        className="flex h-screen"
        style={{ backgroundColor: theme.palette.background.default }}
      >
        {/* Sidebar */}
        <aside
          className="sidebar"
          style={{
            backgroundColor: theme.palette.background.paper,
            borderRightColor: theme.palette.divider,
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          <div
            className="sidebar-header"
            style={{
              borderBottomColor: theme.palette.divider,
              transition: "border-color 0.3s ease",
            }}
          >
            <div
              className="sidebar-logo"
              style={{
                color: theme.palette.text.primary,
                transition: "color 0.3s ease",
              }}
            >
              <Building2 size={32} className="text-green-600" />
              <span>Hotel Booking</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`nav-item ${
                  currentPage === item.id ? "active" : ""
                }`}
                style={{
                  color:
                    currentPage === item.id
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                  backgroundColor:
                    currentPage === item.id
                      ? theme.palette.mode === "light"
                        ? "#ecfdf5"
                        : "rgba(16, 185, 129, 0.1)"
                      : "transparent",
                  transition: "background-color 0.2s ease, color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.backgroundColor =
                      theme.palette.action.hover;
                    e.currentTarget.style.color = theme.palette.text.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== item.id) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = theme.palette.text.secondary;
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className="main-content"
          style={{ backgroundColor: theme.palette.background.default }}
        >
          {renderPage()}
        </main>
      </div>
    </ThemeProvider>
  );
};

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;
