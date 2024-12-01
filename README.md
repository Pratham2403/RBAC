# Institute Management

This project is a web application built with Node.js, Express, and MongoDB. It includes features such as user authentication, role-based access control, image gallery management, and email notifications.

## Table of Contents

- Installation
- Configuration
- Usage
- Features
  - [Role-Based Access Control](#role-based-access-control)
  - [User Authentication](#user-authentication)
  - [Image Gallery Management](#image-gallery-management)
  - [Email Notifications](#email-notifications)
  - [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
- License

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-repo/project-name.git
   cd project-name
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and fill in the required environment variables.
<br>
4. Start the server:
   ```sh
   npm run dev
   ```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory and add the following variables:

```env
PORT=5000
NODE_ENV=production
SUPER_ADMIN_PRIVATE_KEY="<big_hashed_private_key>"
SESSION_SECRET=<session_secret>
JWT_SECRET=<jwt_secret>
CLIENT_ORIGIN=<client_origin>
SMTP_EMAIL=<smtp_email>
SMTP_PASS=<smtp_pass>
SMTP_HOST=<smtp_host>
MONGO_DB_URI=<mongo_db_uri>
SERVER_ORIGIN=<server_origin>
```

## Usage

To start the server in development mode, run:

```sh
npm run dev
```

To start the server in production mode, run:

```sh
npm start
```

## Features

### Role-Based Access Control

The application implements role-based access control (RBAC) to manage permissions for different user roles. The roles and their permission levels are defined as follows:

- **SUPER_ADMIN** : Permission level 4
- **ADMIN**: Permission level 3
- **ALUMNI**: Permission level 2
- **STUDENT**: Permission level 1

The **permission** middleware is used to enforce access control on routes. For example:

```js
const permission = require('../../middleware/permission.middleware')

router.post('/upload', permission(3), upload('permanent').array('files', 10), uploadImages)
router.post('/categories', permission(4), createCategory)
```

### User Authentication

The application supports user registration, login, and password management. It uses JWT for authentication and bcrypt for password hashing.

### Image Gallery Management

The application allows users to upload, view, and manage images in different categories. It uses **multer** for file uploads and `memory-cache` for caching image data.

### Email Notifications

The application sends email notifications using **nodemailer**. It includes features such as sending activation emails and password reset emails.

### Rate Limiting

The application uses `rate-limiter-flexible` to implement rate limiting for login attempts, protecting against brute-force attacks.

## API Endpoints

### Authentication

- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration
- `POST /api/auth/set-password`: Set user password
- `PATCH /api/auth/update-password`: Update user password

### User Management

- `GET /api/users`: Get user details
- `GET /api/users/all`: Get all users (requires admin permissions)
- `POST /api/users/reset`: Reset user (requires super admin permissions)

### Image Gallery

- `POST /api/gallery/upload`: Upload images (requires admin permissions)
- `POST /api/gallery/categories`: Create category (requires super admin permissions)
- `GET /api/gallery/categories`: Get all categories
- `PATCH /api/gallery/categories/:categoryId`: Toggle category activity (requires admin permissions)
- `GET /api/gallery/images/category/:categoryId?`: Get images by category
- `GET /api/gallery/image/:id`: Get image by ID
- `DELETE /api/gallery/image/:id`: Delete image by ID (requires admin permissions)
- `PUT /api/gallery/image/:id`: Update image title (requires admin permissions)

## License

This project is licensed under the MIT License. See the LICENSE file for details.