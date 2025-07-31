import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import StudentLogin from './components/StudentLogin';
import AdminAuth from './components/AdminAuth';
import Dashboard from './components/Dashboard';
import AdminHomePage from './components/AdminHomepage';
import './styles.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin-login" element={<AdminAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-home" element={<AdminHomePage />} />
        
      </Routes>
    </Router>
  );
}

export default App;
