import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './AdminHomepage.css';

const AdminHomePage = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown((prev) => (prev === menu ? null : menu));
  };

  return (
    <div className="admin-home">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo-container">
          <img src="/kongu-logo.jpg" alt="Logo" className="logo-img" />
          <h2 className="logo-text">Kongu Engineering College</h2>
        </div>

        <ul className="nav-links">
          <li className="dropdown">
            <div className="dropbtn" onClick={() => toggleDropdown('hall')}>Hall Allocation</div>
            {openDropdown === 'hall' && (
              <div className="dropdown-content">
                <Link to="/dashboard">CAT Exam Allocation</Link>
                <Link to="#">PST Exam Allocation</Link>
                <Link to="#">Special Tests Allocation</Link>
              </div>
            )}
          </li>

          <li className="dropdown">
            <div className="dropbtn" onClick={() => toggleDropdown('update')}>Update</div>
            {openDropdown === 'update' && (
              <div className="dropdown-content">
                <Link to="#">Hall Update</Link>
                <Link to="#">Student Update</Link>
                <Link to="#">Staff Updates</Link>
              </div>
            )}
          </li>

          <li className="dropdown">
            <div className="dropbtn" onClick={() => toggleDropdown('reports')}>Reports</div>
            {openDropdown === 'reports' && (
              <div className="dropdown-content">
                <Link to="#">Student Attendance</Link>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="navbar-footer">
        <p>Affiliated to Anna University, Chennai | Accredited by NBA & NAAC</p>
      </div>

      {/* Page Content */}
      <div className="admin-content">
        <h3>Welcome to the Admin Dashboard</h3>
        <p>Select an option from the navigation bar to proceed.</p>
      </div>
    </div>
  );
};

export default AdminHomePage;
