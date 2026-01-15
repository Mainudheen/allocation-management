import React, { useEffect } from "react";
import ProfileHeader from "./ProfileHeader";
import InfoBoxesGrid from "./InfoBoxesGrid";
import InvigilatorHistoryTable from "./InvigilatorHistoryTable.jsx";
import { X } from "lucide-react";
import "./ProfileModal.css";

export default function ProfileModal({ invigilator, isOpen, onClose }) {
  
  // prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen]);

  if (!isOpen || !invigilator) return null;

  return (
    <div className="pm-overlay">
      <div className="pm-container">

        <button className="pm-close-btn" onClick={onClose}>
          <X className="pm-close-icon" />
        </button>

        <div className="pm-content">
          <ProfileHeader
            name={invigilator.name}
            designation={invigilator.designation}
            photoUrl={invigilator.photoUrl}
          />

          <InfoBoxesGrid
            department={invigilator.department}
            totalDutyHours={invigilator.totalDutyHours}
          />

          <div className="pm-history">
            <h3 className="history-title">Invigilation History</h3>
            <div className="pm-divider" />
            <InvigilatorHistoryTable history={invigilator.history} />
          </div>
        </div>

      </div>
    </div>
  );
}
