# sassdashboard

A full-stack Sass Dashboard web application built for the FGF Brands Software Developer take-home assignment.

## Setup Instructions

The project consists of a Next.js frontend and a Node.js/Express backend.

### Prerequisites

- Node.js
- npm
- A Firebase project with:
  - Firebase Authentication enabled
  - Firestore enabled
  - A Firebase Admin service account key

### 1. Clone the repository

- git clone https://github.com/zhuojunxu/Zhuojun-sassDashboard.git
- cd Zhuojun-sassDashboard
- cd frontend
- npm install

- cd ../backend
- npm install

### 2. Add the Firebase client configuration to `frontend/.env.local`.

### 3. Add the Firebase Admin service account key as:
   `backend/serviceAccountKey.json`.

   > Credentials are excluded from Git for security.

### 4. Start the backend and frontend:
   - cd backend
   - npx tsx src/index.ts
   - cd ..
   - cd frontend
   - npm run dev

## Architecture Overview

The application follows a simple client-server architecture:

- **Frontend:** Next.js / React provides the user interface, login flow, product management pages, and analytics dashboard.
- **Backend:** Node.js / Express provides REST APIs for product CRUD operations and handles authorization.
- **Authentication:** Firebase Authentication handles user sign-in and provides ID tokens.
- **Authorization:** The backend verifies Firebase ID tokens and checks user roles (`admin` or `viewer`) stored in Firestore.
- **Database:** Cloud Firestore stores user role information and product data.

### Architecture Flow

Frontend (Next.js / React)
        |
        | Firebase ID Token
        v
Backend (Node.js / Express REST API)
        |
        | Verify Token & Role
        v
Firebase Admin SDK
        |
        +----> Firebase Authentication
        |
        +----> Cloud Firestore
               - users
               - products

## Database Schema

The application uses Firestore with two main collections:

### 1) `users`
Stores application-specific user information and roles.

Fields:
- `uid`: Firebase Authentication user ID
- `role`: User role, either `admin` or `viewer`

Relationship:
- Each Firestore user document corresponds to a Firebase Authentication user.

### 2) `products`
Stores product information.

Fields:
- `name`: Product name
- `category`: Product category
- `price`: Product price
- `status`: Product status (`active` or `inactive`)
- `createdBy`: UID of the user who created the product
- `createdAt`: Firestore timestamp

Relationship:
- `products.createdBy` references the UID of a user in the `users` collection.

---

### 3）Indexing Strategy

For the current small dataset, products are loaded and filtering/sorting are handled at client-side.

Firestore's default single-field indexes are sufficient for the current implementation.

If the dataset grows, filtering, sorting, and pagination would move to Firestore queries, and composite indexes would be added based on real query patterns, for example:

- `status + createdAt`
- `category + createdAt`
- `status + price`

I would only add composite indexes when required depending on the size of users and categories.

### 4) Scaling to 10× More Products

If the product dataset grows significantly, I would avoid loading the entire collection at once.

The main changes would be:

- server-side filtering and sorting
- query limits
- Firestore composite indexes for common query patterns
- optimized dashboard metrics

This would improve performance as the dataset grows.

### 5) Multi-Tenancy Evolution

The current application assumes a single tenant/department.

To support multiple organizations, I would add a trusted `tenantId` to both users and products:

```text
users/{uid}
  role
  tenantId

products/{productId}
  name
  category
  price
  status
  tenantId
  createdBy
  createdAt
  updatedAt

After authentication, the backend would obtain the user's tenantId from the user profile and scope all product queries to that tenant.

The client would not be trusted to choose the tenant used for authorization.

## Security Decisions

Authentication and authorization are enforced end-to-end.

1. Users sign in through Firebase Authentication.
2. The frontend receives a Firebase ID token after successful login.
3. The frontend sends the ID token to the Express API in the `Authorization` header.
4. The backend verifies the token using the Firebase Admin SDK.
5. After authentication, the backend retrieves the user's role from Firestore.
6. Role-based middleware determines whether the user can access the requested API.

Role permissions:
- `admin`: Can create, update, and delete products.
- `viewer`: Can only view products and dashboard data.

Authorization is enforced on the backend rather than just frontend route protection.

---

## Trade-offs & Scope Decisions

Because this was a take-home assignment, I prioritized core functionality and architecture over optional features, through optional features (Role UI difference) has been completed. 

Implemented:
- Firebase Authentication
- Role-based authorization
- Product CRUD APIs
- Firestore integration
- Protected frontend routes
- Product management UI
- Dashboard / analytics functionality
- Role UI Difference

The main priority was to deliver a working end-to-end application with clear separation between authentication, authorization, backend APIs, and the frontend.

---

## What's Next

With another week, I would focus on:

1. Improving error handling, logging, and monitoring.
2. Improving UI/UX and responsive design.
3. Adding more complete user and role management.
4. Improving CI/CD and production deployment configuration.

My first priority would be automated testing around authorization and API behavior because these are critical to application reliability and security as we add more users. 

---

## AI Tool Usage

I used Chatgpt AI tools as a development assistant during the project.

AI helped with:
- Reviewing architecture and implementation ideas
- Troubleshooting Firebase and Node.js configuration issues
- Reviewing authentication and authorization flows
- Improving documentation and README clarity

AI was used to support development and problem-solving, while the application architecture, implementation decisions, integration, and testing were performed and verified by me.


