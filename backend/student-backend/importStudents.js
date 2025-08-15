const mongoose = require("mongoose");
const XLSX = require("xlsx");
require("dotenv").config();

const Student = require("./models/Student");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB");

  

  importExcel();
})
.catch((err) => console.error("❌ MongoDB connection error:", err));

// Import Excel function
function importExcel() {
  const workbook = XLSX.readFile("ml-students.xlsx"); // your file name
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  const formatted = data.map(row => {
  let password = row.DOB;

  // If DOB is a number, convert Excel date serial to DD-MM-YYYY
  if (typeof password === "number") {
    const date = new Date((password - 25569) * 86400 * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    password = `${day}-${month}-${year}`; // DD-MM-YYYY
  }

  return {
    name: row.Name,
    rollno: row.RollNo,
    year:row.Year,
    className: row.ClassName,
    password: password // use DOB as password in DD-MM-YYYY
  };
});


  Student.insertMany(formatted)
    .then(() => {
      console.log("✅ All students imported successfully!");
      mongoose.disconnect();
      
    })
    .catch(err => {
      console.error("❌ Error inserting students:", err);
      mongoose.disconnect();
    });
}
