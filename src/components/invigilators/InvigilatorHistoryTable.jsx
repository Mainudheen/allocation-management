import React from "react";
import "./InvigilatorHistoryTable.css";

export default function InvigilationHistoryTable({ history }) {
  return (
    <div className="inv-wrapper">
      <div className="inv-container">
        <div className="inv-scroll">
          <table className="inv-table">
            <thead className="inv-header">
              <tr>
                <th>Date</th>
                <th>Hall Number</th>
                <th>Subject / Exam Name</th>
                <th className="center">Session</th>
                <th className="right">Duty Hours</th>
              </tr>
            </thead>

            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    No invigilation history available.
                  </td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr
                    key={record.id}
                    className={index % 2 === 0 ? "row-even" : "row-odd"}
                  >
                    <td>{record.date}</td>
                    <td className="hall">{record.hallNumber}</td>
                    <td className="subject">{record.subject}</td>
                    <td className="center">
                      <span
                        className={
                          record.session === "FN"
                            ? "session-badge fn"
                            : "session-badge an"
                        }
                      >
                        {record.session}
                      </span>
                    </td>
                    <td className="right hours">{record.dutyHours}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
