
# Authentication System

A full-stack authentication application with a React/Vite frontend and an Express/MongoDB backend. It supports account registration, password login, JWT-based session authentication, and email OTP password recovery.

## Features

- User registration with email and password validation
- Password hashing with `bcrypt`
- Login with one-hour JWT access tokens
- Protected home page using the stored JWT
- Forgot-password flow with a six-digit email OTP
- OTP expiration after one minute
- Password reset after successful OTP verification
- Responsive UI built with React Bootstrap

## Project Structure

```text
Auth-System/
├── Backend/
│   ├── config/db.js
│   ├── controllers/userController.js
│   ├── middlewares/authMiddleware.js
│   ├── models/User.js
│   ├── routes/userRoutes.js
│   ├── utils/otpServices.js
│   ├── index.js
│   └── package.json
└── Frontend/
		├── src/pages/
		├── src/utils/axiosClient.js
		├── src/App.jsx
		└── package.json
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- A MongoDB database (local or hosted)
- A Gmail account or SMTP provider for OTP email delivery

## Environment Variables

Create `Backend/.env` and do not commit it:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/auth-system
JWT_SECRET=replace-with-a-long-random-secret
App_Email=your-smtp-account@example.com
App_Password=your-smtp-app-password
```

`App_Password` should be an SMTP app password or provider credential, never the normal mailbox password. Generate `JWT_SECRET` with a cryptographically secure secret generator and use different values for every environment.

The frontend currently uses `http://localhost:5000` in `src/utils/axiosClient.js`. Before deploying, replace that development URL with the HTTPS backend URL or update the client to read a Vite environment variable such as `VITE_API_URL`.

## Local Development

Install dependencies in both applications:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

Start the backend in one terminal:

```bash
cd Backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Available Scripts

### Backend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm run build` | Start the API with Node |

### Frontend

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint |

## API Reference

The API base path is `/user`.

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| `POST` | `/user/register` | `{ name, email, password }` | Create an account |
| `POST` | `/user/login` | `{ email, password }` | Return a JWT and username |
| `POST` | `/user/forgot-password` | `{ email }` | Send a one-minute OTP |
| `POST` | `/user/verify-otp` | `{ email, otp }` | Verify the OTP |
| `POST` | `/user/reset-password` | `{ email, newPassword, confirmPassword }` | Set a new password |
| `POST` | `/user/reset-cancel` | `{ email }` | Clear the pending reset state |

Successful login returns a response similar to:

```json
{
	"message": "Login successful.",
	"token": "<jwt>",
	"username": "<name>"
}
```

## Production Deployment Checklist

Complete these items before exposing the application to users:

- Serve both frontend and backend over HTTPS.
- Restrict CORS to the deployed frontend origin; never use `origin: '*'` in production.
- Move the frontend API URL to a build-time environment variable.
- Store secrets in the hosting provider's secret manager, not in source control.
- Use a managed MongoDB deployment with authentication, backups, encryption, and network restrictions.
- Add rate limiting and abuse protection to login, OTP, and password-reset endpoints.
- Use a cryptographically secure OTP generator and hash OTPs before storing them.
- Add security headers, request size limits, structured logging, and centralized error monitoring.
- Prefer secure, HTTP-only cookies for refresh/session tokens instead of browser `localStorage`.
- Add automated tests, dependency auditing, health checks, and a CI/CD pipeline.
- Configure database indexes and review account enumeration behavior for public responses.

The current repository is a development baseline. It is not production-ready until the checklist above is reviewed and the deployment-specific controls are implemented.

## Security Notes

- Never commit `Backend/.env`, SMTP credentials, database credentials, or JWT secrets.
- Rotate any secret that has been exposed in logs, source control, or chat.
- Passwords are hashed with `bcrypt`; plaintext passwords are not stored.
- JWTs currently expire after one hour.
- OTPs are currently stored temporarily in the user document and expire after one minute.

## License

This project is currently marked as `ISC` in the backend package metadata.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
