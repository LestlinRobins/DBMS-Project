import { useState } from "react";
import "./App.css";
import {
  LayoutDashboard,
  Users,
  Home,
  Calendar,
  CreditCard,
  Building2,
} from "lucide-react";
import Dashboard from "./components/Dashboard";
import CustomerForm from "./components/CustomerForm";
import RoomManagement from "./components/RoomManagement";
import BookingManagement from "./components/BookingManagement";
import PaymentPage from "./components/PaymentPage";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "customers":
        return <CustomerForm />;
      case "rooms":
        return <RoomManagement />;
      case "bookings":
        return <BookingManagement />;
      case "payments":
        return <PaymentPage />;
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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 size={32} className="text-green-600" />
            <span>Hotel Booking</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`nav-item ${currentPage === item.id ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">{renderPage()}</main>
    </div>
  );
}

export default App;
