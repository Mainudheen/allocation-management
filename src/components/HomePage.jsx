import React,{useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';


function HomePage() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);


  return (

    <>
      {/* NAVBAR */}
      <nav className="navbar" onClick={closeDropdown}>
        <div className="navbar-left">
          {/* <img src="https://kms.kongu.edu/images/kongu.jpg" alt="College Logo" className="college-logo" /> */}
          <span className="college-name">AUTOMATED HALL SCHEDULER </span>
        </div>

        <div className="navbar-right">
          <button className="nav-button" onClick={() => navigate('/')}>Home</button>

          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
            <button className="nav-button" onClick={toggleDropdown}>Login ▾</button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <div onClick={() => { navigate('/student-login'); closeDropdown(); }}>Student Login</div>
                <div onClick={() => { navigate('/admin-login'); closeDropdown(); }}>Admin Login</div>
              </div>
            )}
          </div>
        </div>
      </nav>

    

    <div className="holographic-container">
      
      <div className="holographic-card" onClick={() => navigate('/student-login')}>
      
        <h2>Student Login</h2>
        
        
       
      </div>

      <div className="holographic-card" onClick={() => navigate('/admin-login')}>
        <h2>Admin Login</h2>
        
       
      </div>

    </div>
    </>
  );
}

export default HomePage;
