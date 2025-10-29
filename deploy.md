# DigiMess Deployment Guide

## Overview
This guide covers deploying the DigiMess full-stack application (MongoDB, Node.js Backend, React Frontend) to production.

## Prerequisites
- MongoDB Atlas account
- Heroku/Render account for backend
- Vercel/Netlify account for frontend
- Git repository

## Step 1: Database Setup (MongoDB Atlas)
1. Create a new cluster in MongoDB Atlas.
2. Set up database user and whitelist IP (0.0.0.0/0 for dev).
3. Get connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/digimess?retryWrites=true&w=majority`
4. Update Backend/.env with MONGO_URI.

## Step 2: Backend Deployment (Heroku)
1. Create Heroku app: `heroku create digimess-backend`
2. Set environment variables:
   - `heroku config:set MONGO_URI=<your_mongo_uri>`
   - `heroku config:set JWT_SECRET=<your_secret>`
   - `heroku config:set PORT=5000`
3. Deploy: `git push heroku main`
4. Seed database: `heroku run node Backend/seed.js`
5. Note backend URL (e.g., https://digimess-backend.herokuapp.com)

## Step 3: Frontend Deployment (Vercel)
1. Connect GitHub repo to Vercel.
2. Set build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. Add environment variable: `VITE_API_BASE_URL=https://digimess-backend.herokuapp.com/api`
4. Deploy: Push to main branch or manual deploy.
5. Note frontend URL (e.g., https://digimess.vercel.app)

## Step 4: Post-Deployment
- Test login with demo credentials.
- Verify API calls work (check browser dev tools).
- Enable HTTPS (automatic on Vercel/Heroku).
- Monitor logs: `heroku logs --tail`

## Troubleshooting
- CORS issues: Ensure backend allows frontend origin.
- API errors: Check backend logs for 500 errors.
- DB connection: Verify MONGO_URI and network access.
