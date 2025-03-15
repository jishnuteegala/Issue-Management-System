import React from 'react';
import Login from '../Login/Login';
import './StaffLogin.css';

function StaffLogin({ setUser }) {
    return (
        <div className="staff-login-container">
            <h1>Staff Login</h1>
            <Login setUser={setUser} isStaffLogin={true} />
        </div>
    );
}

export default StaffLogin;
