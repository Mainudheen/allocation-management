import React from "react";
import { Building2, Clock } from "lucide-react";
import "./InfoBoxes.css";

export default function InfoBoxes({ department, totalDutyHours }) {
  return (
    <div className="info-wrapper">
      {/* Department Box */}
      <div className="info-card">
        <div className="info-icon blue-light">
          <Building2 className="icon-sm" />
        </div>
        <div className="info-text">
          <span className="label-small">Department</span>
          <span className="value-medium">{department}</span>
        </div>
      </div>

      {/* Duty Hours Box */}
      <div className="info-card">
        <div className="info-icon blue-light">
          <Clock className="icon-sm" />
        </div>
        <div className="info-text">
          <span className="label-small">Total Duty Hours</span>
          <span className="value-medium">{totalDutyHours}h</span>
        </div>
      </div>
    </div>
  );
}
