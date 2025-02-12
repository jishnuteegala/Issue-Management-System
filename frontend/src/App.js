import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch the "Hello World" message from the Django backend
    axios.get('http://localhost:8000/api/hello/')
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error('Error fetching message:', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Chalkstone Council Reporting</h1>
      <p>{message || "Loading..."}</p>
    </div>
  );
}

export default App;
