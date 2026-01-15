// =============================
//  TYPE DEFINITIONS (JSDoc)
// =============================

/**
 * @typedef {"Professor" | "Assistant Professor" | "Associate Professor"} Designation
 */

/**
 * @typedef {Object} InvigilationHistory
 * @property {string} id
 * @property {string} date
 * @property {string} hallNumber
 * @property {string} subject
 * @property {"FN" | "AN"} session
 * @property {number} dutyHours
 */

/**
 * @typedef {Object} Invigilator
 * @property {string} id
 * @property {string} name
 * @property {Designation} designation
 * @property {string} department
 * @property {string} [photoUrl]
 * @property {number} totalDutyHours
 * @property {InvigilationHistory[]} history
 */


// =============================
//  STAFF DATA
// =============================

const staffNames = [
  "P.Natesan","R.S.Latha","S.Kayalvili","K.S.Kalaivani","M.Vimaladevi",
  "A.S.Renugadevi","S. Priyanka","P.Jayadharshini","P.Ramya","J.Charanya",
  "S.Keerthika","D.Sathya","K.Senthilvadivu","R.Thangamani","M.Sri Kruthika",
  "N.Kannan","R.Subapriya","M.Harini","T.A.Karthikeyan","M.Mohana Arasi",
  "N.Vigneshwaran","S.Gayathri","R.Arunkumar","G.Balashanthi","S.Shangavi",
  "R.R.Rajalaxmi","C.Nalini","K.Sathya","S.Hamsanandhini","N.Kanimozhi",
  "S.Santhiya","S.Benil Jeniffer","M.Yoga","O.Abhila Anju","M.Neelamegan",
  "S.Gopinath","N.Renuka","V.Arun Antony","A.Vanmathi","M. Mohanasundari",
  "B.Kalaivani",
];

const designations = [
  "Professor",
  "Associate Professor",
  "Assistant Professor"
];

const departments = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil Engineering",
  "Electrical",
  "Mathematics",
  "Physics",
  "Chemistry",
];


// =============================
//  HISTORY GENERATOR
// =============================

/**
 * @param {string} staffId
 * @returns {InvigilationHistory[]}
 */
function generateHistory(staffId) {
  const count = Math.floor(Math.random() * 5);
  const subjects = [
    "Data Structures", "Operating Systems", "Networks", "Algorithms", 
    "Database Systems", "AI/ML", "Control Systems", "Thermodynamics"
  ];
  const halls = [
    "LHC-101", "LHC-102", "LHC-201", "LHC-202", 
    "Main Hall", "Block A-101", "Block B-201"
  ];

  const history = [];

  for (let i = 0; i < count; i++) {
    history.push({
      id: `${staffId}-h${i + 1}`,
      date: `2024-0${Math.floor(Math.random() * 3) + 1}-${String(
        Math.floor(Math.random() * 28) + 1
      ).padStart(2, "0")}`,
      hallNumber: halls[Math.floor(Math.random() * halls.length)],
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      session: Math.random() > 0.5 ? "FN" : "AN",
      dutyHours: Math.floor(Math.random() * 2) + 2,
    });
  }

  return history;
}


// =============================
//  MAIN DATASET
// =============================

/** @type {Invigilator[]} */
const invigilatorsData = staffNames.map((name, index) => {
  const history = generateHistory(String(index + 1));

  return {
    id: String(index + 1),
    name: name.trim(),
    designation: designations[index % designations.length],
    department: departments[index % departments.length],
    totalDutyHours:
      history.reduce((sum, h) => sum + h.dutyHours, 0) + Math.floor(Math.random() * 20),
    history,
    photoUrl: "" // optional, add real photos later
  };
});


// =============================
//  ASYNC LOADER
// =============================

export async function LoadInvigilators() {
  return invigilatorsData;
}
