import React from "react";
import "./HistoryTable.css";

export default function HistoryTable({ history }) {
  return (
    <div className="history-wrapper">
      <div className="history-container">
        <div className="history-scroll">
          <table className="history-table">
            <thead className="history-header">
              <tr>
                <th>Date</th>
                <th>Hall Number</th>
                <th>Subject / Exam Name</th>
                <th>Session</th>
                <th>Duty Hours</th>
              </tr>
            </thead>

            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-history">
                    No invigilation history available.
                  </td>
                </tr>
              ) : (
                history.map((record, index) => (
                  <tr
                    key={record.id}
                    className={
                      index % 2 === 0
                        ? "row-even"
                        : "row-odd"
                    }
                  >
                    <td>{record.date}</td>
                    <td className="hall">{record.hallNumber}</td>
                    <td className="subject">{record.subject}</td>
                    <td className="session">
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
                    <td className="hours">{record.dutyHours}h</td>
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
