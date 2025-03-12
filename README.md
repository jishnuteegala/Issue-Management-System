# Issue Management System

This project is a reporting and analysis platform for Chalkstone Council. It allows members of the public and staff to log issues, analyse the issues logged, allocate resources to resolve the issues, and close the issues once rectified.

## Technology Stack
- **Backend:**
  - Python 3.8+
  - Django 4.2.19
  - Django REST Framework 3.15.2
  - PostgreSQL 15+
  - pytest 8.3.4 (Testing)
  - pytest-django 4.10.0 (Django Test Integration)
  - coverage 7.6.12 (Code Coverage Tool)
- **Frontend:**
  - React 18.0.0
  - React Router DOM 6.0.0
  - React Query 3.39.3
  - Chart.js 4.4.8
  - Axios 1.7.9
- **Development Tools:**
  - Git/GitHub
  - npm/Node.js
  - Python virtual environment

## Setup Instructions

1. **PostgreSQL Setup:**
   ```sql
   -- Connect to PostgreSQL as superuser (usually 'postgres')
   psql -U postgres

   -- Create the database
   CREATE DATABASE chalkstone_db;

   -- Create the application user
   CREATE USER appuser WITH PASSWORD 'appuser';

   -- Grant all privileges on database to appuser
   GRANT ALL PRIVILEGES ON DATABASE chalkstone_db TO appuser;

   -- Connect to the database
   \c chalkstone_db

   -- Grant schema privileges to appuser
   GRANT ALL ON SCHEMA public TO appuser;
   ```

2. **Backend:**
   - Create and activate a virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     ```
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

3. **Frontend:**
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

   - **Production Build:**
     - Build the production version of the frontend:
       ```bash
       npm run build
       ```
     - Serve the production build locally:
       ```bash
       npm install -g serve
       serve -s build
       ```
     - By default, the production build will be served on port 3000. You can access it at `http://localhost:3000`. To specify a different port, use the `-l` option:
       ```bash
       serve -s build -l 5000
       ```

## Testing
1. **Run Django Backend Tests:**
   ```bash
   # Make sure your virtual environment is activated
   python manage.py test apps.issues.tests   # Run issue-related tests
   python manage.py test apps.users.tests    # Run user-related tests
   python manage.py test apps.analytics.tests # Run analytics-related tests
   
   # Or run all tests at once
   python manage.py test
   ```

2. **Test Coverage Report:**
   ```bash
   # Install coverage tool
   pip install coverage

   # Run tests with coverage
   coverage run manage.py test
   
   # Generate coverage report
   coverage report
   
   # Generate detailed HTML report
   coverage html
   # Open htmlcov/index.html in your browser
   ```

3. **PostgreSQL Test Database:**
   - Tests use a separate test database (`test_chalkstone_db`)
   - It's automatically created and destroyed during testing
   - No manual setup required

4. **Test Environment:**
   - Tests run with DEBUG=True by default
   - Test database uses the same credentials as development
   - Each test case runs in isolation
   - Database is reset after each test
