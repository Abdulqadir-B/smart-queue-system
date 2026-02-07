# Smart Queue Management System Frontend

This is the frontend part of the Smart Queue Management System built with React and Material-UI.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── admin/         # Admin-specific components
│   │   ├── common/        # Shared components
│   │   ├── customer/      # Customer-specific components
│   │   └── staff/         # Staff-specific components
│   ├── context/           # React context for global state
│   ├── pages/             # Page components
│   ├── services/          # API service functions
│   ├── utils/             # Utility functions and constants
│   ├── App.js             # Main App component
│   └── index.js           # Entry point
└── package.json
```

## Features

- **Customer Portal**: Join queues, get tokens, track position
- **Staff Portal**: Call next customer, pause/resume queues
- **Admin Dashboard**: Create queues, view analytics, manage system
- **Real-time Updates**: Live queue status using Socket.io

## Installation

1. Make sure you have Node.js and npm installed
2. Navigate to the frontend directory
3. Install dependencies:

```
npm install
```

## Running the Application

Start the development server:

```
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Build for Production

Create a production build:

```
npm run build
```

## Technology Stack

- **React**: Frontend library
- **Material-UI**: Component library for styling
- **React Router**: For navigation
- **Axios**: For API calls
- **Socket.io-client**: For real-time communication

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`. Make sure the backend server is running before starting the frontend.

## Socket.io Events

The application uses Socket.io for real-time updates:

- Customer events: `customer:join`, `token:called`, `token:your-turn`
- Staff events: `staff:subscribe`, `queue:update`
- Admin events: `admin:subscribe`

## User Roles

1. **Customer**: Join queues and track position
2. **Staff**: Manage specific queues and serve customers
3. **Admin**: System-wide management and analytics
