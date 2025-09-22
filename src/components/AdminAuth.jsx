import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAuth.css';
import Popup from './Popup';   // ✅ Import popup

function AdminAuth() {
  const navigate = useNavigate();
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(null);   // ✅ Popup state

  // Admin credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // ✅ Success popup
      setPopup({ type: 'success', message: 'Login successful!' });

      // ✅ Navigate after 3 seconds
      setTimeout(() => {
        navigate('/admin-home');
      }, 1000);

    } else {
      // ✅ Error popup
      setPopup({ type: 'error', message: 'Invalid username or password' });
    }
  };

  return (
    <div className={`admin-auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
      
      {/* Sign-in container */}
      <div className="form-container sign-in-container">
        <form onSubmit={handleLogin}>
          <h1>Admin Sign In</h1>
          <span>Enter your credentials</span>
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

      {/* ✅ POPUP */}
      {popup && (
        <Popup
          type={popup.type}
          message={popup.message}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

export default AdminAuth;
