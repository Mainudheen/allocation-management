import React from "react";
import InvigilatorCard from "./InvigilatorCard";
import "./InvigilatorGrid.css";

export default function InvigilatorGrid({ invigilators, onSelect }) {
  return (
    <div className="grid-wrapper">
      {invigilators.map((staff) => (
        <InvigilatorCard
          key={staff.id}
          invigilator={staff}
          onClick={onSelect}
        />
      ))}

      {invigilators.length === 0 && (
        <div className="no-data">
          No invigilators found.
        </div>
      )}
    </div>
  );
}
