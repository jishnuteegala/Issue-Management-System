import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../utils/csrf';

function IssueDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [updateData, setUpdateData] = useState({ allocated_to: '', status: '' });
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null); // State to hold debug information

  useEffect(() => {
    axios.get(`http://localhost:8000/api/issues/${id}/`)
      .then(response => {
        setIssue(response.data);
        setUpdateData({
          allocated_to: response.data.allocated_to || '',
          status: response.data.status
        });
        setDebugInfo(response.data); // Set debug information
      })
      .catch(error => {
        console.error('Error fetching issue:', error);
        setDebugInfo(error.response ? error.response.data : error.message); // Set debug information
      });
    // Fetch staff users for assignment.
    axios.get('http://localhost:8000/api/users/')
      .then(response => {
        const staff = response.data.filter(u => u.is_staff);
        setStaffList(staff);
        setDebugInfo(response.data); // Set debug information
      })
      .catch(error => {
        console.error('Error fetching staff users:', error);
        setDebugInfo(error.response ? error.response.data : error.message); // Set debug information
      });
  }, [id]);

  const handleChange = (e) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.patch(`http://localhost:8000/api/issues/${id}/`, updateData, {
      withCredentials: true,
      headers: {
        'X-CSRFToken': getCSRFToken() // Include the CSRF token in the headers
      }
    })
      .then(response => {
        setMessage('Issue updated successfully.');
        setIssue(response.data);
        setDebugInfo(response.data); // Set debug information
      })
      .catch(error => {
        setMessage('Error updating issue.');
        console.error(error);
        setDebugInfo(error.response ? error.response.data : error.message); // Set debug information
      });
  };

  if (!issue) return <div>Loading issue...</div>;

  return (
    <div>
      <h2>Issue Detail: {issue.title}</h2>
      <p>Description: {issue.description}</p>
      <p>Status: {issue.status}</p>
      <p>Reported by: {issue.reported_by}</p>
      {user && user.is_staff && (
        <form onSubmit={handleUpdate}>
          <div>
            <label>Assign to Staff:</label>
            <select name="allocated_to" value={updateData.allocated_to} onChange={handleChange}>
              <option value="">--Select Staff--</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.username}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Status:</label>
            <select name="status" value={updateData.status} onChange={handleChange}>
              <option value="open">Open</option>
              <option value="allocated">Allocated</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <button type="submit">Update Issue</button>
        </form>
      )}
      {message && <p>{message}</p>}
      {/* Debugging display: show full response or error object */}
      {debugInfo && (
        <pre style={{ fontSize: '0.8em', color: 'grey' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
      <button onClick={() => navigate('/')}>Back to Home</button>
    </div>
  );
}

export default IssueDetail;
