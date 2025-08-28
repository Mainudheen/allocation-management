import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  PageBreak,
} from "docx";

function DownloadFormats() {
  const [allocations, setAllocations] = useState([]);

  // Fetch allocations from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/allocations")
      .then((res) => res.json())
      .then((data) => setAllocations(data || []))
      .catch((err) => console.error("Failed to fetch allocations:", err));
  }, []);

  // Group allocations by CAT number
  const groupedByCat = allocations.reduce((acc, a) => {
    if (!acc[a.cat]) acc[a.cat] = [];
    acc[a.cat].push(a);
    return acc;
  }, {});

  // --- DOCX Generator for one CAT ---
  const generateDocForCat = async (catNumber) => {
    const catAllocations = groupedByCat[catNumber];
    if (!catAllocations || !catAllocations.length) {
      alert(`No allocations for CAT ${catNumber}`);
      return;
    }

    // Group by Date + Time + Session
    const grouped = {};
    catAllocations.forEach((a) => {
      const key = `${a.examDate}_${a.time}_${a.session}`;
      if (!grouped[key]) {
        grouped[key] = {
          examDate: a.examDate,
          time: a.time,
          session: a.session,
          totalStudents: 0,
          rooms: {},
        };
      }
      grouped[key].totalStudents += a.totalStudents || (a.students?.length || 0);
      if (!grouped[key].rooms[a.room]) grouped[key].rooms[a.room] = 0;
      grouped[key].rooms[a.room] += a.totalStudents || (a.students?.length || 0);
    });

    const groupedArray = Object.values(grouped);
    const hallNames = [...new Set(catAllocations.map((a) => a.room))];

    // --- Summary Table Rows ---
    const summaryRows = groupedArray.map((g, idx) => {
      return new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(idx + 1))] }),
          new TableCell({
            children: [
              new Paragraph(`${g.examDate}`),
              new Paragraph(`${g.time} ${g.session}`),
            ],
          }),
          new TableCell({ children: [new Paragraph(String(g.totalStudents))] }),
          ...hallNames.map((h) => {
            const count = g.rooms[h] || 0;
            return new TableCell({
              children: [new Paragraph(count > 0 ? String(count) : "-")],
            });
          }),
          new TableCell({ children: [new Paragraph(String(Object.keys(g.rooms).length))] }),
        ],
      });
    });

    // --- Table Header ---
    const hallHeaderCells = [
      new TableCell({ children: [new Paragraph("S.No.")] }),
      new TableCell({ children: [new Paragraph("Date and Session")] }),
      new TableCell({ children: [new Paragraph("Total no. of Students")] }),
      ...hallNames.map((h) => new TableCell({ children: [new Paragraph(h)] })),
      new TableCell({ children: [new Paragraph("Total no. of halls")] }),
    ];

    // Use first allocation for general info safely
    const firstAllocation = catAllocations[0];

    // ✅ Build all children
    let children = [
      new Paragraph({
        text: "KONGU ENGINEERING COLLEGE",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "(Autonomous)", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "PERUNDURAI – 638060", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "INTERNAL QUALITY ASSURANCE CELL", alignment: AlignmentType.CENTER }),
      new Paragraph({ text: `Seating Arrangement – CAT ${catNumber}`, alignment: AlignmentType.CENTER }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "Department of Artificial Intelligence", alignment: AlignmentType.CENTER }),
      new Paragraph({
        children: [
          new TextRun({ text: "Academic Year : 2025-2026     " }),
          new TextRun({ text: `Semester : ${firstAllocation.semester}` }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `Class : ${firstAllocation.year} - AIDS & AIML     ` }),
          new TextRun({ text: `Date : ${firstAllocation.examDate}` }),
        ],
      }),
      new Paragraph({ text: "" }),
      new Paragraph({ text: "List of Hall arrangement", alignment: AlignmentType.CENTER }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({ children: hallHeaderCells }), ...summaryRows],
      }),
      new Paragraph({ text: "" }),
      new PageBreak(),
    ];

    // --- Hall Arrangements: Each room gets one sheet/table ---
    hallNames.forEach((roomName, hIdx) => {
      // Filter allocations for this room with students
      const roomAllocations = catAllocations.filter(
        (a) => a.room === roomName && a.students && a.students.length
      );

      roomAllocations.forEach((alloc, idx) => {
        // Unique columns for this room
        const colNos = [...new Set(alloc.students.map((s) => s.col))].sort((a, b) => a - b);
        // Maximum rows for this room
        const maxRows = Math.max(...alloc.students.map((s) => s.row || 0), 0);

        // Lookup by column and row
        const seatIndex = {};
        alloc.students.forEach((s) => {
          if (!seatIndex[s.col]) seatIndex[s.col] = {};
          seatIndex[s.col][s.row] = s.rollno;
        });

        // Build header row
        const headerCells = colNos.map(
          (c) =>
            new TableCell({
              children: [new Paragraph({ text: `C${c}`, alignment: AlignmentType.CENTER })],
              width: { size: Math.floor(9000 / Math.max(colNos.length, 1)), type: WidthType.DXA },
            })
        );

        // Seat rows
        const dataRows = [];
        for (let r = 1; r <= maxRows; r++) {
          const cells = colNos.map((c) => {
            const roll = seatIndex[c] && seatIndex[c][r] ? seatIndex[c][r] : "";
            return new TableCell({
              children: [new Paragraph({ text: roll, alignment: AlignmentType.CENTER })],
            });
          });
          dataRows.push(new TableRow({ children: cells }));
        }

        // Add Hall Arrangement table for each allocation in the room
        children.push(
          new Paragraph({ text: "Hall Arrangement", alignment: AlignmentType.CENTER, bold: true }),
          new Paragraph({
            children: [
              new TextRun({ text: `Date: ${alloc.examDate}   `, bold: true }),
              new TextRun({ text: `Session: ${alloc.session}`, bold: true }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Hall No: ${alloc.room}   `, bold: true }),
              new TextRun({ text: `Class: ${alloc.year}`, bold: true }),
            ],
          }),
          new Table({
            rows: [new TableRow({ children: headerCells }), ...dataRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
          new Paragraph({ text: "" }),
          // Add a page break between rooms/tables except after the last
          hIdx === hallNames.length - 1 && idx === roomAllocations.length - 1
            ? null
            : new PageBreak()
        );
      });
    });

    // ✅ Construct document
    const doc = new DocxDocument({
      sections: [{ properties: {}, children: children.filter(Boolean) }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `SeatingArrangement_CAT${catNumber}.docx`);
    } catch (err) {
      console.error("DOCX generation error:", err);
      alert("❌ Failed to generate DOCX. Check console for details.");
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="section-title">Download Seating Arrangements</h2>
      <div className="card-container">
        {Object.keys(groupedByCat).map((cat) => (
          <div
            key={cat}
            className="allocation-card"
            style={{ cursor: "pointer" }}
            onClick={() => generateDocForCat(cat)}
          >
            <div className="card-header">📘 CAT {cat}</div>
            <div className="card-body">
              <p>Total Allocations: {groupedByCat[cat].length}</p>
              <p>Click to download formatted DOCX</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DownloadFormats;
