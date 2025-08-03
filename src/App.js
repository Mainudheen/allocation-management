// App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentLogin from './components/StudentLogin';
import AdminAuth from './components/AdminAuth';
import Dashboard from './components/Dashboard';
import AdminHomePage from './components/AdminHomepage';
import StudentDashboard from './components/StudentDashboard';
import CatOptionsPage from './components/CatOptionsPage';
import SpecialTestOptions from './components/SpecialTestOptions';
import LabAllocator from './components/LabAllocator';
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
      </Routes>
    </Router>
  );
}

export default App;
