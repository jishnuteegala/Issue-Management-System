import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import IssueDetail from './components/IssueDetail';
import { getCSRFToken } from './utils/csrf';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    axios.post('http://localhost:8000/api/users/logout/', {}, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken() // Include the CSRF token in the headers
      }
    })
      .then(response => {
        setUser(null);
        navigate('/');
      })
      .catch(error => console.error('Logout error:', error));
  };

  return (
    <div>
      {/* Navigation bar displays current user info and logout button */}
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/issues/:id" element={<IssueDetail user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
