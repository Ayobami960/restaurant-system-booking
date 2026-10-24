# Full-Stack Restaurant POS & Management System

This project is a complete restaurant management application built with the MERN-style stack, designed to help a restaurant run its daily operations smoothly. It combines a modern frontend, a secure backend, and a MongoDB database to manage menu items, orders, reservations, tables, users, and business insights in one place## How this project was achieved

This application was built in a full-stack approach by combining:

- A React-based client application for the user interface
- A Node.js 


##and Express backend for business logic and API endpoints
- MongoDB as the database, managed through Prisma ORM
- Authentication, authorization, file upload, real-time communication, and payment features to make the system practical for real restaurant operations

The project was developed by breaking the system into clear modules:



##
1. Backend architecture
   - Created REST APIs for authentication, users, categories, menu items, orders, reservations, tables, feedback, and dashboard data
   - Used Prisma schemas to model the database structure for restaurants, staff, customers, tables, and transactions
   - Implemented role-based access so admins, managers, staff, kitchen, and customers each have the right level of access

2. Frontend development
   - Built pages for the customer-facing experience and internal restaurant operations
   - Designed reusable UI components for cards, forms, lists, dialogs, charts, and summaries
   - Connected the frontend to backend APIs using a structured client-side layer

3. Business logic and workflow implementation
   - Added support for menu management, order creation, table status tracking, reservation handling, and order status updates
   - Connected the system with analytics and reporting tools to give restaurant staff a better overview of operations

4. Advanced features
   - Added real-time support using Socket.IO for live updates
   - Integrated file/image handling, notifications, and AI-based support features for feedback and suggestions
   - Prepared the application for deployment with a modular folder structure and environment-based configuration

## What the application does

This application works as a restaurant management platform with both **operational** and customer-facing features.

### 1. User and role management
- Supports different user roles such as admin, manager, staff, kitchen, and customer
- Enables secure login and account handling
- Controls what each user can see and do based on their role

### 2. Menu management
- Allows restaurant staff to create, update, and manage categories and menu items
- Supports item descriptions, pricing, discounts, availability, images, and recipe information
- Helps keep the menu consistent and easy to update

### 3. Ordering and POS workflow
- Supports dine-in, takeaway, and delivery orders
- Lets staff create and manage customer orders
- Tracks order status from pending to preparing, ready, served, or cancelled
- Handles payment status and payment method information

### 4. Table and reservation management
- Keeps track of table availability and current status
- Supports reservations for customers and staff members
- Helps organize seating and reduces booking confusion

### 5. Dashboard and reports
- Provides a dashboard view for restaurant performance
- Displays important business information such as orders, activity, and operations summaries
- Helps administrators and managers monitor the restaurant more efficiently

### 6. Customer feedback and smart suggestions
- Collects feedback and ratings from customers
- Stores review information for menu items
- Includes support for AI-ba


##sed suggestions that can help improve the dining experience

## How the system works

The application follows a simple flow:

1. A user logs in with their role-based account
2. Staff or admins manage the menu, tables, and reservations
3. Customers or staff place orders through the system
4. The backend stores and updates the order and reservation data in the database
5. The dashboard and UI reflect the latest restaurant activity in real time

## Tech stack

### Frontend
- React
- React Router
- Tailwind CSS
- ShadCN-style UI components
- Recharts, motion, and other UI libraries

### Backend
- Node.js
- Express.js
- Prisma ORM
- MongoDB
- Socket.IO
- Better Auth
- Stripe integration

## Project structure

Restaurant management system

        ------MonogDB
 ---Flexible Schema
 --- Scalability    ****
 --- Performance      *
                      *
                      *
                      Express.js
                      --- Routing
                      ---  Middleware
                      --- RESTful APIs
                      *
                      *
                      *
        ------React.js
    ---Component-Based
    --- Virtual DOM
    --- State Management
                      *
                      *
                      *
                      Node.js
                      --- Server Side
                      ---  Non-Blocking I/O
                      --- Event-Driven


##

## Getting started

### Client
```bash
cd clients
bun install
bun run dev
```

### Server
```bash
cd server
bun install
bun run start:dev


##
```

## Summary

This project was created to provide a practical and modern restaurant solution that can manage both front-of-house and back-of-house operations. It combines restaurant management, order processing, reservations, and reporting into one connected application, making it useful for real-world hospitality environments.
