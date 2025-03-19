import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { getCSRFToken } from '../../utils/csrf';
import { getCategoryOptions, getCategoryDisplayName } from '../../utils/categoryUtils';
import './Home.css';
import debounce from 'lodash.debounce';
import DOMPurify from 'dompurify';

const fetchIssues = async () => {
  const response = await axios.get('http://localhost:8000/api/issues/');
  return response.data;
};

function Home({ user }) {
  const queryClient = useQueryClient();
  const [newIssue, setNewIssue] = useState({ title: '', description: '', category: 'pothole' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [debugInfo, setDebugInfo] = useState(null); // State to hold debug information
  const issuesPerPage = 5;

  const { data: issues = [], isLoading } = useQuery('issues', fetchIssues, {
    cacheTime: 0,
    staleTime: 0,
    onSuccess: (data) => {
      setDebugInfo(data); // Set debug information on successful fetch
    },
    onError: (error) => {
      setDebugInfo(error.response ? error.response.data : error.message); // Set debug information on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizedDescription = DOMPurify.sanitize(newIssue.description);
    axios
      .post(
        'http://localhost:8000/api/issues/',
        {
          ...newIssue,
          description: sanitizedDescription,
          reported_by: user.id,
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': getCSRFToken(),
          },
        }
      )
      .then((response) => {
        queryClient.invalidateQueries('issues'); // Invalidate the cache to refetch the issues
        setNewIssue({ title: '', description: '', category: 'pothole' });
        setDebugInfo(response.data); // Set debug information on successful creation
      })
      .catch((error) => {
        console.error('Error creating issue:', error);
        setDebugInfo(error.response ? error.response.data : error.message); // Set debug information on error
      });
  };

  const handleBulkAction = (action) => {
    if (user && user.is_staff) {
      selectedIssues.forEach((issueId) => {
        axios
          .patch(
            `http://localhost:8000/api/issues/${issueId}/`,
            { status: action === 'close' ? 'closed' : 'open' },
            {
              withCredentials: true,
              headers: {
                'X-CSRFToken': getCSRFToken(),
              },
            }
          )
          .then(() => {
            queryClient.invalidateQueries('issues'); // Invalidate the cache to refetch the issues
          })
          .catch((error) => {
            console.error('Bulk action error:', error);
            setDebugInfo(error.response ? error.response.data : error.message); // Set debug information on error
          });
      });
      setSelectedIssues([]);
    } else {
      console.error('Bulk actions are only available for staff.');
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        setSearchQuery(query);
      }, 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory ? issue.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [issues, searchQuery, selectedCategory]);

  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = filteredIssues.slice(indexOfFirstIssue, indexOfLastIssue);
  const totalPages = Math.ceil(filteredIssues.length / issuesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCheckboxChange = (e, issueId) => {
    if (e.target.checked) {
      setSelectedIssues([...selectedIssues, issueId]);
    } else {
      setSelectedIssues(selectedIssues.filter((id) => id !== issueId));
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('reported_at');

  const sortedIssues = useMemo(() => {
    return [...filteredIssues].sort((a, b) => {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
  }, [filteredIssues, sortField, sortOrder]);

  return (
    <div className="container">
      <h1>Chalkstone Council Reporting</h1>

      <section className="create-issue">
        <h2>Create New Issue</h2>
        {user ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={newIssue.title}
              onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              required
            />
            <select
              value={newIssue.category}
              onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
            >
              {getCategoryOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button type="submit">Submit Issue</button>
          </form>
        ) : (
          <p>Please log in to create a new issue.</p>
        )}
      </section>

      <section className="issue-list-header">
        <div className="controls">
          <input
            type="text"
            placeholder="Search issues..."
            onChange={handleSearchChange}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {getCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="reported_at">Reported Date</option>
            <option value="updated_at">Updated Date</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </section>

      <section className="logged-issues">
        <h2>Logged Issues</h2>
        {isLoading ? (
          <p>Loading issues...</p>
        ) : sortedIssues.length === 0 ? (
          <p>No issues logged yet.</p>
        ) : (
          <ul className="issue-list">
            {sortedIssues.slice(indexOfFirstIssue, indexOfLastIssue).map((issue) => (
              <li key={issue.id} className="issue-item">
                <input
                  type="checkbox"
                  className="issue-checkbox"
                  onChange={(e) => handleCheckboxChange(e, issue.id)}
                  checked={selectedIssues.includes(issue.id)}
                />
                <div className="issue-details">
                  <Link to={`/issues/${issue.id}`} className="issue-title">
                    #{issue.id} - {issue.title}
                  </Link>
                  <div className="issue-meta">
                    <span className={`issue-state ${issue.status}`}>
                      {issue.status}
                    </span>
                    <span>Category: {getCategoryDisplayName(issue.category)}</span>
                    <span>Reported at: {formatDate(issue.reported_at)}</span>
                    <span>Updated at: {formatDate(issue.updated_at)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {user && user.is_staff && selectedIssues.length > 0 && (
        <section className="bulk-actions">
          <select id="bulk-action">
            <option value="">Bulk Actions</option>
            <option value="close">Close Issues</option>
            <option value="open">Reopen Issues</option>
          </select>
          <button
            onClick={() => {
              const action = document.getElementById('bulk-action').value;
              if (action) {
                handleBulkAction(action);
              }
            }}
          >
            Apply
          </button>
        </section>
      )}

      <section className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <a
            key={index + 1}
            href="#!"
            className={currentPage === index + 1 ? 'active' : ''}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </a>
        ))}
      </section>
      {/* Debugging display: show full response or error object */}
      {/* {debugInfo && (
        <pre style={{ fontSize: '0.8em', color: 'grey' }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )} */}
    </div>
  );
}

export default Home;
