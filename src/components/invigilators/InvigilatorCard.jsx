import React from "react";
import { User } from "lucide-react";
import "./InvigilatorCard.css";

export default function InvigilatorCard({ invigilator, onClick }) {
  return (
    <div className="card" onClick={() => onClick(invigilator)}>
      {/* Avatar */}
      <div className="avatar">
        {invigilator.photoUrl ? (
          <img src={invigilator.photoUrl} alt={invigilator.name} />
        ) : (
          <div className="avatar-fallback">
            <User className="avatar-icon" />
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="inv-name">{invigilator.name}</h3>

      {/* Designation */}
      <p className="inv-designation">{invigilator.designation}</p>

      {/* Department Footer */}
      <div className="inv-footer">
        <span className="inv-department">{invigilator.department}</span>
      </div>
    </div>
  );
}
