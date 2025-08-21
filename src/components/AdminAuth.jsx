import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import navigate
import './AdminAuth.css';

function AdminAuth() {
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Admin credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
       navigate('/admin-home');
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  if (isLoggedIn) {
    return (
      <div className="admin-dashboard">
        <h1>Welcome, Admin!</h1>
        <p>You are now logged in.</p>
      </div>
    );
  }

  return (
    <div className={`admin-auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      
      {/* Sign-in container */}
      <div className="form-container sign-in-container">
        <form onSubmit={handleLogin}>
          <h1>Admin Sign In</h1>
          <span>Enter your credentials</span>
          {error && <p className="error">{error}</p>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
        </form>
      </div>

      {/* Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>Enter your admin credentials</p>
            <button className="ghost" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello Admin!</h1>
            <p>Use your username and password</p>
            <button className="ghost" onClick={() => setIsRightPanelActive(true)}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAuth;
