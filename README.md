# Stripe Backend Project

A backend service for handling authentication, course management, and Stripe payment processing.

## Features

- User authentication (JWT)
- Course management
- Stripe payment integration
- Subscription management
- Webhook handling
- Rate limiting (Upstash)
- Email functionality (Resend)

## Technologies

- Node.js with Express
- TypeScript
- MongoDB (via Mongoose)
- Stripe API
- Redis (via Upstash)
- React Email for email templates

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` (you may need to create this) with your environment variables

## Configuration

Required environment variables:

- `PORT`: Server port (default: 5000)
- `CLIENT_URL`: URL of your frontend client
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `UPSTASH_REDIS_REST_URL`: Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN`: Upstash Redis token
- `RESEND_API_KEY`: Resend API key for emails

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reloading
- `npm test`: Run tests with Jest
- `npm run build`: Compile TypeScript to JavaScript
- `npm run email:dev`: Develop email templates

## Project Structure

## API Routes

- `/api/auth`: Authentication routes
- `/api/courses`: Course management
- `/api/stripe`: Stripe payment processing
- `/api/subscriptions`: Subscription management
- `/api/webhook`: Stripe webhook endpoint

## Dependencies

### Main Dependencies

- Express: Web framework
- Mongoose: MongoDB ODM
- Stripe: Payment processing
- JWT: Authentication
- Zod: Schema validation
- Upstash Redis: Rate limiting
- Resend: Email sending

### Development Dependencies

- TypeScript
- ts-node-dev: Development server
- Jest: Testing
- React Email: Email templates

## Development Setup

1. Install Node.js (v18+ recommended)
2. Install MongoDB or use a cloud provider
3. Set up Stripe account and get API keys
4. Set up Upstash Redis for rate limiting
5. Set up Resend for email functionality

## Building for Production

1. Run `npm run build` to compile TypeScript
2. Start the server with `npm start`

## License

ISC
