Made changes to parsing dates prompt and time format# Natural Language Task Manager

A modern web application that helps users manage their tasks using natural language processing. Built with React, TypeScript, and Express.js, this application provides an intuitive interface for task management with AI-powered natural language understanding.

## Features

- Natural language task creation and management
- User authentication and authorization
- Real-time task updates
- Modern, responsive UI with Tailwind CSS
- Secure session management
- Database persistence with Drizzle ORM

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Query
- Wouter for routing
- Framer Motion for animations

### Backend
- Express.js
- TypeScript
- Passport.js for authentication
- Drizzle ORM
- WebSocket for real-time updates
- OpenAI integration for natural language processing

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Neon Database account (for PostgreSQL)
- OpenAI API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_session_secret
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Natural-Language-Task-Manager.git
cd Natural-Language-Task-Manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run check` - Type-check the TypeScript code
- `npm run db:push` - Push database schema changes

## Project Structure

```
Natural-Language-Task-Manager/
├── client/                 # Frontend React application
│   ├── src/               # Source files
│   └── index.html         # Entry HTML file
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── vite.ts           # Vite configuration
├── shared/               # Shared types and utilities
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the natural language processing capabilities
- The Radix UI team for the excellent component library
- The Drizzle ORM team for the type-safe database operations 