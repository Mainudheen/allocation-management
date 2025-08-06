const mongoose = require('mongoose');
const Room = require('./Room');
require('dotenv').config({ path: '../.env' });


const rooms = [
  { roomNo: "AAB202", floor: "2ND FLOOR", benches: 23 },
  { roomNo: "AAB203", floor: "2ND FLOOR", benches: 28 },
  { roomNo: "AAB208", floor: "2ND FLOOR", benches: 33 },
  { roomNo: "AAB209", floor: "2ND FLOOR", benches: 34 },
  { roomNo: "AAB213", floor: "2ND FLOOR", benches: 34 },
  { roomNo: "AAB310", floor: "3RD FLOOR", benches: 26 },
  { roomNo: "AAB309", floor: "3RD FLOOR", benches: 26 },
  { roomNo: "AAB101", floor: "1ST FLOOR", benches: 25 },
  { roomNo: "AAB010", floor: "GROUND FLOOR", benches: 28 }
];

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  await Room.insertMany(rooms);
  console.log("✅ Rooms inserted!");
  mongoose.disconnect();
})
.catch(err => {
  console.error("❌ DB Insert Error:", err);
});
