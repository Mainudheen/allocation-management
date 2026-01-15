import React from "react";
import { Building2, Clock } from "lucide-react";
import "./InfoBoxesGrid.css";

export default function InfoBoxesGrid({ department, totalDutyHours }) {
  return (
    <div className="info-grid">
      {/* Department Box */}
      <div className="info-box">
        <div className="icon-wrapper blue-bg">
          <Building2 className="icon" />
        </div>
        <div className="info-text">
          <span className="label">Department</span>
          <span className="value">{department}</span>
        </div>
      </div>

      {/* Duty Hours Box */}
      <div className="info-box">
        <div className="icon-wrapper sky-bg">
          <Clock className="icon" />
        </div>
        <div className="info-text">
          <span className="label">Total Duty Hours</span>
          <span className="value">{totalDutyHours}h</span>
        </div>
      </div>
    </div>
  );
}
