# Fusion Pixels API

A modern RESTful API built with NestJS, TypeScript, ESLint and Prettier.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Strongly typed JavaScript
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime environment
- **Package Manager**: npm
- **Code Quality**:
  - [ESLint](https://eslint.org/) - Code linting
  - [Prettier](https://prettier.io/) - Code formatting
  - [TypeScript ESLint](https://typescript-eslint.io/) - TypeScript-specific linting rules
- **Testing**: [Jest](https://jestjs.io/) - Testing framework
- **Development Tools**:
  - Hot reload in development mode
  - Source maps for debugging
  - Incremental compilation

### Health Check

- `GET /` - Server status check

## Development Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fusion-pixels-api
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   - The application uses default configurations
   - Server runs on port 3000 by default (configurable via `PORT` environment variable)

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

### Development Commands

```bash
# Build the project
npm run build

# Format code with Prettier
npm run format

# Lint code with ESLint
npm run lint

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```
