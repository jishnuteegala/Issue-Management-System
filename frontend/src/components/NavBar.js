import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ user, onLogout }) {
  return (
    <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Home</Link> |{' '}
      {user ? (
        <>
          <span>Welcome, {user.username}!</span> |{' '}
          {user.is_staff && <Link to="/staff">Staff</Link>} |{' '}
          <button onClick={onLogout}>Logout</button>
          {/* Debugging display: show full user object */}
          <pre style={{ fontSize: '0.8em', color: 'grey' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </>
      ) : (
        <>
          <span>User is not logged in</span> |{' '}
          <Link to="/login">Login</Link> |{' '}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default NavBar;

