import React, { useEffect, useState } from 'react';
import axios from 'axios';

export const fetchIssues = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/issues/');
        return response.data;
    } catch (error) {
        console.error('Error fetching issues:', error);
        return [];
    }
};

export const fetchUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8000/api/users/');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

function Home({ users }) {
    const [issues, setIssues] = useState([]);
    const [newIssue, setNewIssue] = useState({ title: '', description: '', category: 'pothole' });

    useEffect(() => {
        const loadIssues = async () => {
            const issuesData = await fetchIssues();
            setIssues(issuesData);
        };

        loadIssues()
        fetchUsers();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:8000/api/issues/', {
            ...newIssue,
            reported_by: 1
        })
            .then(response => {
                fetchIssues();
                setNewIssue({ title: '', description: '', category: 'pothole' });
            })
            .catch(error => console.error('Error creating issue:', error));
    };

    return (
        <div>
            <h1>Chalkstone Council Reporting</h1>
            <section>
                <h2>Create New Issue</h2>
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
                        <option value="pothole">Pothole</option>
                        <option value="street_lighting">Street Lighting</option>
                        <option value="graffiti">Graffiti</option>
                        <option value="anti_social">Anti-Social Behaviour</option>
                        <option value="fly_tipping">Fly-Tipping</option>
                        <option value="blocked_drain">Blocked Drains</option>
                    </select>
                    <button type="submit">Submit Issue</button>
                </form>
            </section>
            <section>
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
            </section>
            <section>
                <h2>User List</h2>
                {users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <ul>
                        {users.map(user => (
                            <li key={user.id}>
                                {user.username} ({user.email}) {user.is_staff && '[Staff]'}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default Home;
