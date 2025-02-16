import React from 'react';
import { Link } from 'react-router-dom';

function NavBar({ user, onLogout }) {
  return (
    <nav>
      <Link to="/">Home</Link> |{' '}
      {user ? (
        <>
          <span>Welcome, {user.username}!</span> |{' '}
          {user.is_staff && <Link to="/staff">Staff</Link>} |{' '}
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> |{' '}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default NavBar;
