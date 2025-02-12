import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    // Fetch issues from the Django backend
    axios.get('http://localhost:8000/api/issues/')
      .then(response => {
        setIssues(response.data);
      })
      .catch(error => {
        console.error('Error fetching issues:', error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Chalkstone Council Reporting</h1>
      <h2>Logged Issues</h2>
      {issues.length === 0 ? (
        <p>No issues logged yet.</p>
      ) : (
        <ul>
          {issues.map(issue => (
            <li key={issue.id}>
              <strong>{issue.title}</strong> - {issue.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
