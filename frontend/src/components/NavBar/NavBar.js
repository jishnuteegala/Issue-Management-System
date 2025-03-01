import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

function NavBar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div>
        <Link to="/">Home</Link>
        {/* {user && user.is_staff && <Link to="/staff">Staff</Link>} */}
      </div>
      <div>
        {user ? (
          <>
            <span>Welcome, {user.username}!</span>
            <button onClick={onLogout}>Logout</button>
            {/* Debugging display: show full user object */}
            {/* <pre style={{ fontSize: '0.8em', color: 'grey' }}>
            {JSON.stringify(user, null, 2)}
            </pre> */}
          </>
        ) : (
          <>
            <span>User is not logged in</span>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;