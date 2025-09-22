import React, { useEffect } from "react";
import "./Popup.css";

function Popup({ type, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // auto close in 3 sec

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case "success":
        return { icon: "✔️", color: "#057008ff", btn: "OK" };
      case "error":
        return { icon: "❌", color: "#f44336", btn: "TRY AGAIN" };
      case "warning":
        return { icon: "⚠️", color: "#ff9800", btn: "OK" };
      default:
        return { icon: "ℹ️", color: "#2196f3", btn: "CLOSE" };
    }
  };

  const { icon, color, btn } = getStyles();

  return (
    <div className="popup-overlay">
      <div className="popup-card" style={{ borderTop: `25px solid ${color}` }}>
        <div className="popup-icon" style={{ color }}>{icon}</div>
        <h3>{type === "success" ? "Successful" : type === "error" ? "Error" : "Something went wrong"}</h3>
        <p>{message}</p>
        <button
          style={{ backgroundColor: color }}
          onClick={onClose}
        >
          {btn}
        </button>
      </div>
    </div>
  );
}

export default Popup;
