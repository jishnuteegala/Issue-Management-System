import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import Home, { fetchIssues, fetchUsers } from './components/Home';

function App() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, []);
  
  const handleLogout = () => {
    axios.post('http://localhost:8000/api/users/logout/', {}, { withCredentials: true })
      .then(response => {
        setUsers(null);
        navigate('/');
      })
      .catch(error => console.error('Logout error:', error));
  };

  return (
    <div>
      <NavBar users={users} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home users={users} />} />
        <Route path="/login" element={<Login setUsers={setUsers} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
