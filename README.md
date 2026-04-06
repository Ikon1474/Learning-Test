# Learner Licence Portal

A separate beginner-friendly full-stack project built with Node.js, Express, MongoDB, EJS, Bootstrap, bcrypt, JWT cookies, and image uploads using `multer`.

## Features

- User registration and login
- Separate admin login
- User submission form for application number, date of birth, and learner password
- User wallet balance with Telegram top-up instruction
- Admin panel to add wallet balance for any user
- User submission deducts `Rs. 70` from wallet balance
- Admin can mark a submission as passed with image upload or mark it failed
- User dashboard shows learner status and the uploaded image after approval
- Service price is configurable and defaults to `Rs. 70`
- MongoDB Atlas friendly setup
- Vercel-ready Express structure

## Data Model

- `User`: `username`, `password`, `walletBalance`
- `Application`: `userId`, `applicationNumber`, `dateOfBirth`, `learnerPassword`, `servicePrice`, `status`, `licenceImage`

## Important Note About Images

To keep the project Vercel-friendly and beginner-friendly, the uploaded learner licence image is stored directly in MongoDB as binary data. For bigger production systems, object storage such as Vercel Blob or Cloudinary is a better choice.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`
3. Set:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `JWT_SECRET`
- `SERVICE_PRICE`
  - `ADMIN_USERNAME`
  - `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH`
  - `ADMIN_TELEGRAM`
4. Run:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`

## Vercel

1. Push this folder to a GitHub repo
2. Import the repo into Vercel
3. Add all variables from `.env.example`
4. Deploy

## Security Notes

- User login password is hashed with `bcrypt`
- Admin password can be plain env text or a bcrypt hash
- Submitted learner passwords are stored as entered so admin can review them
- For a production-grade rollout, encrypt sensitive values at rest and rotate secrets regularly
