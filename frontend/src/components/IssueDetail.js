import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { getCSRFToken } from '../utils/csrf';
import './IssueDetail.css';

const fetchIssueDetails = async (id) => {
  const response = await axios.get(`http://localhost:8000/api/issues/${id}/`);
  return response.data;
};

const fetchStaffUsers = async () => {
  const response = await axios.get('http://localhost:8000/api/users/');
  return response.data.filter(u => u.is_staff);
};

function IssueDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updateData, setUpdateData] = useState({ allocated_to: '', status: '' });
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null); // State to hold debug information

  const { data: issue, isLoading: isIssueLoading } = useQuery(['issue', id], () => fetchIssueDetails(id));
  const { data: staffList = [], isLoading: isStaffLoading } = useQuery('staffUsers', fetchStaffUsers);

  useEffect(() => {
    if (issue) {
      setUpdateData({
        allocated_to: issue.allocated_to || '',
        status: issue.status || ''
      });
      setDebugInfo(issue); // Set debug information
    }
  }, [issue]);

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
        queryClient.invalidateQueries(['issue', id]); // Invalidate the cache to refetch the issue details
        setDebugInfo(response.data); // Set debug information
      })
      .catch(error => {
        setMessage('Error updating issue.');
        console.error(error);
        setDebugInfo(error.response ? error.response.data : error.message); // Set debug information
      });
  };

  if (isIssueLoading || isStaffLoading) return <div>Loading issue...</div>;

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
      {/* {debugInfo && (
        <pre style={{ fontSize: '0.8em', color: 'grey' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )} */}
    </div>
  );
}

export default IssueDetail;
