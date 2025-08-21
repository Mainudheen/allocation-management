// App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentLogin from './components/StudentLogin';
import AdminAuth from './components/AdminAuth';
import Dashboard from './components/Dashboard';
import AdminHomePage from './components/AdminHomePage';
import StudentDashboard from './components/StudentDashboard';
import CatOptionsPage from './components/CatOptionsPage';
import SpecialTestOptions from './components/SpecialTestOptions';
import LabAllocator from './components/LabAllocator';
import ManageAllocations from './components/ManageAllocations';
import RoomAllocator from './components/RoomAllocator';
import StudentManager from './components/StudentManager';
import RoomManager from './components/RoomManager';
import ClassExamAllocator from './components/ClassExamAllocator';
import SelectAllocation from './components/SelectAllocation';
import './styles.css';

function StudentDashboardWrapper() {
  const location = useLocation();
  const { rollno } = location.state || {};
  return <StudentDashboard rollno={rollno} />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student-dashboard" element={<StudentDashboardWrapper />} />
        <Route path="/admin-login" element={<AdminAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-home" element={<AdminHomePage />} />
        <Route path="/CatOptionsPage" element={<CatOptionsPage />} />
        <Route path="/SpecialTestOptions" element={<SpecialTestOptions />} />
        <Route path="/LabAllocator" element={<LabAllocator />} />
        <Route path="/manage-allotments" element={<ManageAllocations />} />
        <Route path="/RoomAllocator" element={<RoomAllocator />} />
        <Route path="/StudentManage" element={<StudentManager />} />
        <Route path="/RoomManage" element={<RoomManager />} />
        <Route path="/class" element={<ClassExamAllocator />} />
        <Route path="/select" element={<SelectAllocation />} />
       
      </Routes>
    </Router>
  );
}

export default App;
