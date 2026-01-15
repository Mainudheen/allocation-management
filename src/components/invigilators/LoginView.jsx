import React, { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import "./LoginView.css";

export default function LoginView({ onLogin, error }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(password);
    setIsLoading(false);
  };

  return (
    <div className="login-wrapper">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-box"
      >
        <div className="login-header">
          <div className="icon-circle">
            <ShieldCheck className="icon" />
          </div>
          <h1 className="login-title">Admin Portal</h1>
          <p className="login-subtitle">Invigilation Management System</p>
        </div>

        <div className="login-card">
          <form onSubmit={handleSubmit}>
            <label className="input-label" htmlFor="password">Admin Password</label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error-msg">{error}</p>}

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? <Loader2 className="spin-icon" /> : "Login as Admin"}
            </button>
          </form>
        </div>

        <p className="login-note">
          Note: This system is restricted to authorized administrative personnel only.
        </p>
      </motion.div>
    </div>
  );
}
