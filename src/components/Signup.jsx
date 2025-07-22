import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Signup() {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSignup = () => {
    if (form.email && form.password) navigate('/');
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}

export default Signup;
