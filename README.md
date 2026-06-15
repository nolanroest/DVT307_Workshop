# Mastermind Game - Starter Template

This is the starter template for the **DVT307: Build real-time applications with AWS Amplify** workshop. This React + TypeScript application provides the foundation for building a complete real-time multiplayer Mastermind game.

## What's included

This starter template contains a basic React application with:

### Frontend Structure
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **React Router** for client-side navigation
- **ESLint** configuration for code quality

### Game Components
- **Game Board**: Interactive game interface with color selection and feedback display
- **Color Picker**: Component for selecting colors during gameplay
- **Navigation**: App navigation with routing between screens
- **Game Context**: React Context for state management (basic implementation)

### Screens
- **Entry Screen**: Game difficulty selection and start screen
- **Game Screen**: Main gameplay interface
- **Game List Screen**: View and manage games (basic layout)
- **Leaderboard Screen**: Display game statistics (basic layout)

### Core Game Logic
- **Game Types**: TypeScript interfaces for game state, colors, and difficulty levels
- **Game Utilities**: Helper functions for game mechanics
- **Constants**: Game configuration including colors and difficulty settings

## What you'll build during the workshop

Throughout the workshop, you'll enhance this starter template to create a full-featured application with:

### Phase 1: Core Functionality
- **AWS Amplify Integration**: Set up authentication, APIs, and data storage
- **User Authentication**: Secure login/signup with Amazon Cognito
- **Game Logic**: Complete Mastermind game mechanics with guess validation
- **Data Persistence**: Save game state and user progress with DynamoDB

### Phase 2: Real-time Features
- **Live Updates**: Real-time gameplay feedback using AWS AppSync Events
- **Dynamic Leaderboards**: Live leaderboard updates as games are completed
- **WebSocket Integration**: Persistent connections for instant updates

### Phase 3: Multiplayer Capabilities
- **Custom Game Creation**: Create games with custom secret codes
- **QR Code Sharing**: Generate shareable QR codes for game access
- **Mixed Authentication**: Support both authenticated and unauthenticated players
- **Game Analytics**: Track player participation and performance metrics

### Phase 4: Production Deployment
- **CI/CD Pipeline**: Automated deployments with GitHub integration
- **Global Distribution**: CloudFront CDN for worldwide access
- **Environment Management**: Separate development and production environments

## Getting started

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- AWS Account (provided during workshop)

### Development setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Project structure
```
src/
├── components/          # Reusable UI components
│   ├── GameBoard/      # Game interface components
│   ├── ColorPicker/    # Color selection component
│   ├── Navigation/     # App navigation
│   └── common/         # Shared UI components
├── screens/            # Main application screens
│   ├── EntryScreen/    # Game start screen
│   ├── GameScreen/     # Main gameplay
│   ├── GameListScreen/ # Game management
│   └── LeaderboardScreen/ # Statistics display
├── context/            # React Context for state management
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Helper functions
└── constants/          # App configuration
```

## Workshop progression

This template serves as your starting point. As you progress through the workshop modules, you'll:

1. **Configure AWS Amplify** and set up your development environment
2. **Add authentication** with Amazon Cognito for user management
3. **Implement serverless functions** with AWS Lambda for game logic
4. **Create data storage** with Amazon DynamoDB for persistence
5. **Build REST APIs** with Amazon API Gateway for game management
6. **Add real-time features** with AWS AppSync Events for live updates
7. **Deploy to production** with AWS Amplify Hosting and CI/CD

Each module builds upon the previous one, transforming this basic template into a sophisticated, production-ready real-time multiplayer game.

## Technologies used

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Testing**: Vitest, Testing Library
- **Build Tools**: Vite, ESLint, PostCSS
- **AWS Services**: Amplify, Cognito, Lambda, DynamoDB, AppSync, API Gateway

## Learn more

- [AWS Amplify Documentation](https://docs.amplify.aws)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)

Ready to start building? Follow along with the workshop to transform this template into a complete real-time multiplayer Mastermind game! 🎮
