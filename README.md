CollectiveWallet API: Backend API for Group Expenses Management

## Overview

This project is a backend API built with Node.js, Express, and MongoDB. It provides a comprehensive set of functionalities for managing group expenses. Users can sign up, log in, log out, create groups, add members, and record expenses within the groups.

## Technologies Used

- **Node.js**: A JavaScript runtime that allows the execution of server-side code.
- **Express**: A web application framework for Node.js that simplifies the process of building robust APIs.
- **MongoDB**: A NoSQL database used for storing and retrieving data efficiently.
- **Jest**: A JavaScript testing framework for Node.js applications.
- **Supertest**: A testing library for HTTP assertions, used for testing API endpoints.
- **JSON Web Token (JWT)**: Used for implementing secure user authentication.
- **Bcrypt**: A library for hashing passwords, enhancing the security of user credentials.

## Features

1. **User Management:**

   - Sign up: Users can create accounts by providing necessary information.
   - Log in: Existing users can log in securely using their credentials.
   - Log out: Users can log out to terminate their session.

2. **Group Management:**

   - Create Group: Users can create new groups for managing expenses.
   - Add Members: Group owners can add members to facilitate collaborative expense tracking.

3. **Expense Tracking:**

   - Record Expenses: Users can log expenses within their groups, providing details such as amount, description, and date.

4. **Security Measures:**
   - JSON Web Token: Implemented for secure authentication.
   - Bcrypt: Used for hashing passwords to enhance user credential security.
