# Task: Implement Secure JWT Authentication for Admin and Students

## Steps to Complete:

1. [x] Create Backend/models/RefreshToken.js: New Mongoose model for storing hashed refresh tokens with userId, token (hashed), expiresAt, createdAt.

2. [x] Edit Backend/routes/auth.js: 
   - Update /login: Generate access token (15min expiry) and refresh token (7 days), hash refresh token, save to RefreshToken, return both.
   - Update /register: After user creation, generate and return tokens (auto-login).
   - Add /refresh: Verify refresh token from DB, generate new access and refresh tokens (rotation), delete old refresh, return new ones.
   - Add /logout: Delete refresh token from DB by token or userId.

3. [x] Edit Backend/middleware/authMiddleware.js: Ensure verifyToken only verifies access tokens (short expiry); no changes to roleCheck.

4. [x] Install axios in Frontend: cd Frontend && npm install axios.

5. [x] Edit Frontend/src/services/authService.ts: 
   - Import axios, create axios instance with baseURL.
   - Add request interceptor to attach access token.
   - Add response interceptor: On 401, call /refresh, update tokens, retry request.
   - Update login/signup to store both access/refresh tokens in localStorage.
   - Update logout to call /logout API, clear localStorage.
   - Export axios instance for other services.
   - Add token validation on init (check expiry).

6. [x] Edit Frontend/src/services/apiService.ts, mealService.ts, optoutService.ts, rebateService.ts, reviewService.ts: Replace fetch with authService.axiosInstance for all requests.

7. [x] Edit Frontend/src/App.tsx: On load, validate tokens (call /me or check expiry), logout if invalid.

8. [ ] Test: Start backend/frontend, login (get tokens), access protected route (verify refresh on expiry), logout (invalidate), test unauthorized access.

## Followup:
- Ensure .env has strong JWT_SECRET.
- Update seed.js if needed for test tokens.
- Handle edge cases: Token theft, concurrent logins.
