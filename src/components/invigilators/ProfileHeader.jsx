import React from "react";
import { User } from "lucide-react";
import "./ProfileHeader.css";

export default function ProfileHeader({ name, designation, photoUrl }) {
  return (
    <div className="profile-header">
      <div className="avatar-wrapper">
        <div className="avatar-glow"></div>

        <div className="avatar-box">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="avatar-image" />
          ) : (
            <div className="avatar-fallback">
              <User className="avatar-icon" />
            </div>
          )}
        </div>
      </div>

      <div className="profile-info">
        <h2 className="profile-name">{name}</h2>

        <div className="designation-badge">
          {designation}
        </div>
      </div>
    </div>
  );
}
