# Issue Management System

This project is a reporting and analysis platform for Chalkstone Council. It allows members of the public and staff to log issues, analyse the issues logged, allocate resources to resolve the issues, and close the issues once rectified.

## Technology Stack
- **Backend:** Python, Django, PostgreSQL
- **Frontend:** React
- **Testing:** Django testing framework built on unittest
- **Version Control:** Git/GitHub

## Frontend
- **Framework:** React

## Setup Instructions

1. **Backend:**
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
   - Update the PostgreSQL credentials in `project/settings.py`. (**DO NOT STORE PLAINTEXT PASSWORD/SECRETS, THIS IS JUST A DEMO**)
   - Run migrations:
     ```bash
     python manage.py makemigrations
     python manage.py migrate
     ```
   - Start the server:
     ```bash
     python manage.py runserver
     ```

2. **Frontend:**
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install Node dependencies:
     ```bash
     npm install
     ```
   - Start the React development server:
     ```bash
     npm start
     ```
