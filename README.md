DIGIMESS: A Comprehensive Mess Management System
1. Project Overview
DIGIMESS is a web-based application designed to streamline mess operations for both students and administrators. It provides features for menu viewing, attendance tracking, feedback submission, and administrative controls.
2. Team Roles and Responsibilities
Role
Team Members
Frontend Developer
Devansh Rai, Krish Dhaked, Amar Singh
Backend Developer
Himanshu Vitthalani, Mayank Jha
Database Designer
Devansh Rai, Aryan Shrivastava
Tester
Himanshu Vitthalani, Krish Dhaked
Model Training (ML)
Mayank Jha, Himanshu Vitthalani
Documentation Specialist
Aryan Shrivastava, Amar Singh

3. Tools & Technologies
Frontend: React, Tailwind CSS, TypeScript
Backend: Node.js, Express.js, JWT Authentication
Database: MongoDB / MySQL
Hosting:
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas (for MongoDB) / PlanetScale (for MySQL)
Extras: GitHub, Firebase
4. User Screens Layout
4.1. Common Screens
4.1.1. Login Screen
Purpose: Authenticate users (students/admins).
Fields: Email, Password.
Actions: Login button, Forgot Password (links to password reset).
Backend Flow: Verifies credentials and returns a JWT token upon successful authentication.
4.1.2. Profile Screen
Purpose: Allow users to view and update personal details.
Sections:
Name, Email, Contact Information
Password Change option
View Bill History
Attendance History
4.2. Student Screens
4.2.1. Student Dashboard
Purpose: Main landing page for students after login.
Widgets/Sections:
Today’s Menu (Breakfast/Lunch/Dinner)
Monthly Attendance Summary
Pending Bill Amount
Quick Links: Give Feedback, Pay Bill, View Complaints
4.2.2. Menu Screen
Purpose: Display weekly/daily mess menu.
Features:
Tabs for Breakfast, Lunch, Dinner.
Date-wise menu navigation.
4.2.3. Attendance Screen
Purpose: Students can check their meal attendance records.
Features:
Calendar view indicating presence/absence.
Option to download attendance report.
4.2.4. Complaint & Feedback Screen
Purpose: Enable students to submit feedback or report issues.
Fields: Complaint text (textarea), Image upload (optional).
ML Integration: Complaint sentiment is automatically classified (Positive/Negative/Neutral).
History Section: Lists submitted complaints with their current status (pending/resolved).
4.3. Admin Screens
4.3.1. Admin Dashboard
Purpose: Provide an overview of mess activities for administrators.
Widgets/Sections:
Total Registered Students
Daily Attendance Summary
Complaints (with sentiment filter)
Quick link for Menu Updates
4.3.2. User Management Screen
Purpose: Manage student records.
Features:
List of students with search and filter capabilities.
Functions to Add, Edit, and Delete student accounts.
4.3.3. Menu Management Screen
Purpose: Allow administrators to add and update the mess menu.
Fields: Date, Meal type, Menu items.
Actions: Add New Menu, Edit/Delete existing menu items.
4.3.4. Attendance Reports Screen
Purpose: Track student attendance and generate reports.
Features:
Table view displaying student names and meal attendance.
Filter by date range.
Export functionality (CSV/PDF).
4.3.5. Complaint Management Screen
Purpose: Administrators resolve complaints and feedback.
Features:
Complaint list with Sentiment Analysis Tag (from Hugging Face).
Option to mark complaints as resolved.
View complaint history.
5. Backend Design Layout & Tools
5.1. System Architecture
The DigiMess system will adhere to a 3-tier architecture:

Frontend (Client Layer): A React.js web application through which students and administrators interact.
Backend (Application Layer): A Node.js with Express.js REST API responsible for handling business logic, authentication, and data validations.
Database (Data Layer): MySQL or MongoDB, storing all mess-related data including users, menu information, attendance records, bills, and complaints.
5.2. Logic Behind Screens
Login Screen:
User inputs email and password.
Backend validates credentials against the database.
If valid, a JWT token is generated and returned to the frontend.
If invalid, an error response is sent.
Menu Screen (Daily/Weekly Mess Menu):
Backend fetches menu items from the designated menu table/collection.
A JSON response is sent to the frontend for display.
Complaint/Feedback Screen:
User submits their complaint.
Backend stores the complaint in the complaints table with an initial status of "Pending".
Admin Dashboard:
Backend retrieves various reports such as attendance percentages, payment summaries, and menu updates.
Provides CRUD (Create, Read, Update, Delete) operations for menu and user management.
5.3. Backend Flow (User Interaction → Processing)
Example: Login Verification

User enters credentials on the frontend.
A request is sent to the backend API: /api/auth/login.
Backend Processing:
Validates input.
Finds the user in the database.
Compares the provided password using bcrypt for security.
If credentials are valid, a JWT token is generated and sent to the frontend.
Otherwise, an error message is returned.
6. Database Design & Table Description
6.1. Database Tool
Technology: MySQL (Relational Database)
Reason: Chosen for structured data (users, payments, attendance) which benefits from easier querying with joins.
Hosting: Locally via MySQL Workbench or in the cloud using PlanetScale.
6.2. Database Schema (ER Model Overview)
Entities:

Users: Represents both students and administrators.
Menu: Stores daily food items.
Attendance: Tracks daily meal attendance for students.
Complaints: Records student feedback and issues.

Relationships:

Users → Attendance: One-to-Many (One user can have many attendance records).
Users → Complaints: One-to-Many (One user can submit many complaints).
Admin (Users) → Menu: One-to-Many (One admin can create/update many menu entries).
6.3. Tables Description
6.3.1. Users Table
Table Name: users
Attributes:
user_id INT AUTO_INCREMENT (Primary Key)
name VARCHAR(100)
email VARCHAR(100) UNIQUE
password VARCHAR(255)
role ENUM(‘student’, ‘admin’)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
Primary Key: user_id
Relationships: Connected with attendance, payments (if implemented), and complaints tables.
6.3.2. Menu Table
Table Name: menu
Attributes:
menu_id INT AUTO_INCREMENT (Primary Key)
date DATE
meal_type ENUM(‘breakfast’, ‘lunch’, ‘dinner’)
items TEXT (Comma-separated list of dishes)
created_by INT (Foreign Key referencing users.user_id for the admin who created the menu)
Primary Key: menu_id
Foreign Key: created_by references users(user_id).

6.3.3. Attendance Table

Table Name: attendance

Attributes:
attendance_id INT AUTO_INCREMENT (Primary Key)
user_id INT (Foreign Key referencing users.user_id)
date DATE
meal_type ENUM(‘breakfast’, ‘lunch’, ‘dinner’)
status ENUM(‘present’, ‘absent’)
Primary Key: attendance_id
Foreign Key: user_id references users(user_id).Complaints Table

Table Name: complaints

Attributes:
complaint_id INT AUTO_INCREMENT (Primary Key)
user_id INT (Foreign Key referencing users.user_id)
description TEXT
status ENUM(‘pending’, ‘resolved’) DEFAULT ‘pending’
sentiment ENUM(‘positive’, ‘negative’, ‘neutral’)
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
Primary Key: complaint_id
Foreign Key: user_id references users(user_id).ML Integration Explanation7.1. Full Process Example: Complaint & Feedback Handling with Sentiment AnalysisFrontend (React.js)

7. ML Integration Explanation
7.1. Full Process Example: Complaint & Feedback Handling with Sentiment

 AnalysisFrontend (React.js)
Student writes a complaint/feedback (e.g., "The food quality is bad today").
On submitting the form, the complaint text is sent via Axios POST request to the backend API /api/complaints/add.
Backend (Node.js + Express + Hugging Face/Transformer ML)
Backend stores the complaint in the complaints table.
Additionally, the backend passes the complaint text to a Hugging Face Sentiment Analysis model (e.g., "distilbert-base-uncased-finetuned-sst-2-english").
The ML model returns sentiment → Positive / Neutral / Negative.
Backend saves this sentiment result along with the complaint in the database.
Database (MySQL)
complaints table gets updated with:
Complaint text
Student ID (FK)
Status (pending/resolved)
Sentiment label (Positive/Negative/Neutral)
Admin Dashboard (Frontend)
When an admin views complaints, the system shows not only the complaint text but also the sentiment analysis result (e.g., red badge = negative, green badge = positive).
This helps the mess manager/admin quickly filter urgent complaints (e.g., multiple negative complaints on the same day → alert).
7.2. Flow of Information with ML
User Input → Complaint submitted.
Processing (Backend + ML Model) →
Input text sent to Hugging Face model.
Sentiment prediction generated.
Database → Complaint stored with sentiment classification.
Frontend (Admin View) → Complaints listed with sentiment color coding for quick action.
7.3. Tools/Technologies for ML Integration
Hugging Face Transformers Library (pip install transformers)
Pretrained Model: distilbert-base-uncased-finetuned-sst-2-english (for sentiment classification)
Node.js ↔ Python Bridge:
Option 1: Use a Python microservice (Flask/FastAPI) running the Hugging Face model. Backend (Node.js) makes API calls to this service.
Option 2: Use Hugging Face Inference API directly from Node.js with an API key (no need to host your own ML).
