import React, { useState, useEffect } from "react";
import InvigilatorGrid from "./InvigilatorGrid";
import ProfileModal from "./ProfileModal";
import LoginView from "./LoginView";
import { LoadInvigilators } from "../data/LoadInvigilators.jsx";

//import { loadInvigilators } from "../data/InvigilatorData.jsx";

import { LogOut, Search, UserRoundCheck } from "lucide-react";
import "./AdminDashboard.css";

export default function AdminDashBoard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [invigilators, setInvigilators] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("admin_session");
    if (session === "true") {
      setIsAdmin(true);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const data = await LoadInvigilators();
    setInvigilators(data);
  };

  const handleLogin = async (password) => {
    if (password === "admin123") {
      setIsAdmin(true);
      setLoginError("");
      localStorage.setItem("admin_session", "true");
      await fetchData();
    } else {
      setLoginError("Invalid password. Please try again.");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("admin_session");
  };

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const filteredInvigilators = invigilators.filter((staff) =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return <LoginView onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="dashboard-container">

      {/* Background Layers */}
      <div className="dashboard-bg"></div>

      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">

          <div className="admin-header-title">
            <div className="admin-icon">
              <UserRoundCheck />
            </div>
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Room Allocation & Invigilation</p>
            </div>
          </div>

          <div className="admin-header-actions">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <button className="logout-btn" onClick={handleLogout}>
              <LogOut />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <div className="panel-header">
          <h2>Invigilators Panel</h2>
          <p>Click on a card to view detailed history.</p>
        </div>

        <InvigilatorGrid
          invigilators={filteredInvigilators}
          onSelect={handleSelectStaff}
        />
      </main>

      {/* Footer */}
      <footer className="admin-footer">
        <p>© 2024 Invigilation Management System • Built with React</p>
      </footer>

      {/* Modal */}
      <ProfileModal
        invigilator={selectedStaff}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
