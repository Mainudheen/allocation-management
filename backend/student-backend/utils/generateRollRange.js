// student-backend/utils/generateRollRange.js

function generateRollRange(start, end) {
  const prefixMatch = start.match(/[A-Z]+/);
  const startNumMatch = start.match(/\d+$/);
  const endNumMatch = end.match(/\d+$/);

  if (!prefixMatch || !startNumMatch || !endNumMatch) {
    return [];
  }

  const prefix = prefixMatch[0];
  const startNum = parseInt(startNumMatch[0]);
  const endNum = parseInt(endNumMatch[0]);

  const rollRange = [];
  for (let i = startNum; i <= endNum; i++) {
    const padded = i.toString().padStart(startNumMatch[0].length, "0");
    rollRange.push(`${prefix}${padded}`);
  }

  return rollRange;
}

module.exports = generateRollRange;
