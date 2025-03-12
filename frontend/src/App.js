import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './components/NavBar/NavBar';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Home from './components/Home/Home';
import IssueDetail from './components/IssueDetail/IssueDetail';
import Dashboard from './components/Dashboard/Dashboard';
import { getCSRFToken } from './utils/csrf';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      console.log('User data found in local storage:', storedUser); // Debugging log
      setUser(JSON.parse(storedUser));
    } else {
      console.log('No user data found in local storage'); // Debugging log
    }
  }, []);

  const handleLogout = () => {
    axios.post('http://localhost:8000/api/users/logout/', {}, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken() // Include the CSRF token in the headers
      }
    })
      .then(response => {
        setUser(null);
        localStorage.removeItem('user'); // Remove user data from local storage
        navigate('/');
      })
      .catch(error => console.error('Logout error:', error));
  };

  return (
    <>
      {/* Navigation bar displays current user info and logout button */}
      <NavBar user={user} onLogout={handleLogout} />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/issues/:id" element={<IssueDetail user={user} />} />
          <Route
            path="/dashboard"
            element={
              user?.is_staff ? (
                <Dashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
