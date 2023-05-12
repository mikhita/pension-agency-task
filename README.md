Pension Agency Database and Node.js App
This project includes a PostgreSQL database and a Node.js app that provides basic functionality for managing users and roles in a fictional pension agency.

Table of Contents
Database Setup
Running the App
API Endpoints
Creating a New User
Assigning a Role to a User
Updating User Data
Changing a User's Role
Deleting a User
Filtering Users by Role
SQL Tables
Stored Procedures
Database Setup
To set up the database, follow these steps:

Install PostgreSQL if it is not already installed on your system.
Create a new database using the following command: createdb pension_agency.
Connect to the new database using the following command: psql pension_agency.
Copy and paste the contents of create_tables.sql into the PostgreSQL command line interface and execute the SQL statements to create the necessary tables.
Copy and paste the contents of populate_tables.sql into the PostgreSQL command line interface and execute the SQL statements to populate the tables with sample data.
Running the App
To run the app, follow these steps:

Install Node.js if it is not already installed on your system.
Navigate to the project directory and run npm install to install the necessary packages.
Run npm start to start the app.
The app will start running on http://localhost:3000.

