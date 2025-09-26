# Environment Variables Setup

This project requires environment variables to be configured for proper operation.

## Required Environment Variables

### VITE_BACKEND_URL
The backend API URL that the frontend will connect to.

**Example:**
```
VITE_BACKEND_URL=https://kubera-backend.thetailoredai.co
```

## Setup Instructions

1. Create a `.env` file in the root directory of the project
2. Add the required environment variables to the `.env` file
3. Restart your development server after adding the environment variables

## Example .env file

```env
# Backend API Configuration
VITE_BACKEND_URL=https://kubera-backend.thetailoredai.co

# Development/Production Environment
VITE_NODE_ENV=production
```

## Important Notes

- All environment variables must be prefixed with `VITE_` to be accessible in the frontend code
- The application will throw an error if `VITE_BACKEND_URL` is not configured
- Make sure to restart your development server after adding environment variables
- Never commit your `.env` file to version control - it should be in `.gitignore`

## Development vs Production

- For development, you might want to use a local backend URL
- For production, use your production backend URL
- The application will automatically handle HTTPS protocol conversion if needed
