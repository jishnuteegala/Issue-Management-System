import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../../utils/csrf';
import './Login.css';

function Login({ setUser, isStaffLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null); // State to hold debug information
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/api/users/login/', {
      username: form.username,
      password: form.password
    }, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken()
      }
    })
      .then(response => {
        const userData = response.data.user;
        // Check if this is a staff login and the user is actually staff
        if (isStaffLogin && !userData.is_staff) {
          setMessage('Access denied. Staff access only.');
          return;
        }
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data in local storage
        navigate('/');
      })
      .catch(error => {
        console.error('Login error:', error);
        setMessage('Login failed. Please check your credentials and try again.');
        setDebugInfo(error.response ? error.response.data : error.message); // Set debug information
      });
  };

  return (
    <div className="login-container">
      <h2>{isStaffLogin ? 'Staff Login' : 'Login'}</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      {/* Debugging display: show full response or error object */}
      {/* {debugInfo && (
        <pre style={{ fontSize: '0.8em', color: 'grey' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )} */}
    </div>
  );
}

export default Login;
