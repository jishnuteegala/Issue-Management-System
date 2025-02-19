import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { getCSRFToken } from '../utils/csrf';
import './IssueDetail.css';

const fetchIssueDetails = async (id) => {
  try {
    const response = await axios.get(`http://localhost:8000/api/issues/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching issue details:', error);
    return null;
  }
};

const fetchStaffUsers = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/users/');
    return response.data.filter(u => u.is_staff);
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return [];
  }
};

function IssueDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [updateData, setUpdateData] = useState({ allocated_to: '', status: '' });
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null); // State to hold debug information

  useEffect(() => {
    loadIssueDetails();
  }, [id]);

  const loadIssueDetails = useCallback(async () => {
    const [issueData, staffData] = await Promise.all([fetchIssueDetails(id), fetchStaffUsers()]);
    setIssue(issueData);
    setStaffList(staffData);
    setUpdateData({
      allocated_to: issueData?.allocated_to || '',
      status: issueData?.status || ''
    });
    setDebugInfo(issueData); // Set debug information
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
    <div className="issue-detail-container">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/')}>Back to Home</button>
      </div>
      <div className="issue-content">
        <div className="issue-details">
          <div className="issue-title-box">
            <h2>Issue Detail: {issue.title}</h2>
          </div>
          <div className="issue-description" dangerouslySetInnerHTML={{ __html: issue.description.replace(/\n/g, '<br />') }} />
          <div className="issue-meta">
            <p>Status: {issue.status}</p>
            <p>Reported by: {issue.reported_by}</p>
          </div>
        </div>
        {user && user.is_staff && (
          <aside className="right-sidebar">
            <div className="issue-form-section">
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
            </div>
          </aside>
        )}
      </div>
      {message && <p className="message">{message}</p>}
      {/* Debugging display: show full response or error object */}
      {debugInfo && (
        <pre>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default IssueDetail;