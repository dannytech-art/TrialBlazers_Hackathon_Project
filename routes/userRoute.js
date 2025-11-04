const { resendCode, login, register, home, forgotPassword, resetPassword, verifyEmail, verifyResetPasswordOtp, changePassword, getOneUser, getAll, update, deleteUser, auth, user, success, failure} = require('../controllers/userController');
// const {makeAdmin} = require('../controllers/adminController')
const { authenticated } = require('../middleware/authenticate');
const { registerValidator, verifyValidator, resendValidator } = require('../middleware/validator');

const uploads = require('../middleware/multer');


const router = require('express').Router();

/**
 * @swagger
 * /api/v1/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account, hashes the password, generates an OTP for email verification, and sends a verification email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Tony
 *               lastName:
 *                 type: string
 *                 example: Fasube
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tonyfasube@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *               role:
 *                 type: string
 *                 enum: [Client, Runner]
 *                 example: Client/Runner
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 verify_account:
 *                   type: string
 *                   example: Click on Verification link sent to tonyfasube@example.com
 *                 data:
 *                   type: object
 *                   properties:
 *                     firstNameCase:
 *                       type: string
 *                       example: Tony
 *                     lastNameCase:
 *                       type: string
 *                       example: Fasube
 *                     email:
 *                       type: string
 *                       example: tonyfasube@example.com
 *                     role:
 *                       type: string
 *                       example: Client/Runner
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Bad request (e.g. Email already registered or passwords do not match)
 *       500:
 *         description: Internal Server Error
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /api/v1/verify-otp:
 *   post:
 *     summary: Verify user's email using OTP
 *     description: Validates the OTP sent to a user's email address and updates their account verification status.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email address
 *                 example: tonyfasube@example.com
 *               otp:
 *                 type: string
 *                 description: One-time password sent to the user's email
 *                 example: "482936"
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     expired:
 *                       summary: OTP expired
 *                       value: OTP expired
 *                     invalid:
 *                       summary: Invalid OTP
 *                       value: Invalid OTP
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user not found
 
 */
router.post('/verify-otp', verifyValidator, verifyEmail);

/**
 * @swagger
 * /api/v1/resend-code:
 *   post:
 *     summary: Resend OTP verification code
 *     description: Resends a new OTP to the user's registered email for account verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's registered email address
 *                 example: tonyfasube@example.com
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP resent successfully, kindly check your email.
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: user not found
 */
router.post('/resend-code', resendValidator, resendCode);

/**
 * @swagger
 * /api/v1/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a registered user, verifies their email status, and returns a JWT token.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tonyfasube@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1
 *                     firstName:
 *                       type: string
 *                       example: Tony
 *                     lastName:
 *                       type: string
 *                       example: Fasube
 *                     email:
 *                       type: string
 *                       example: tonyfasube@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   examples:
 *                     invalid:
 *                       summary: Invalid credentials
 *                       value: Invalid credentials
 *                     unverified:
 *                       summary: Email not verified
 *                       value: This email tonyfasube@example.com is not verified yet
 *       
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/forgot-password:
 *   post:
 *     summary: Request password reset (OTP-based)
 *     description: Sends a one-time password (OTP) to the user's registered email address to initiate a password reset process.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Kindly check your email for instructions
 *       400:
 *         description: Invalid email address provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email address provided
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/v1/reset-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Validates the one-time password (OTP) sent to the user's email during the forgot password process.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully!
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP expired
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.post('/reset-otp', verifyResetPasswordOtp);

/**
 * @swagger
 * /api/v1/reset:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password after successful OTP verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: MyStrongP@ssword1
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: MyStrongP@ssword1
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Passwords do not match or invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Passwords do not match
 *       404:
 *         description: User not found or OTP not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or OTP not verified
 
 */
router.post('/reset', resetPassword);

/**
 * @swagger
 * /api/v1/password:
 *   put:
 *     summary: Change user password
 *     description: Allows an authenticated user to change their password by providing the old password, new password, and confirmation.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []   # JWT-based authentication required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass@456
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass@456
 *     responses:
 *       200:
 *         description: Password successfully changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password successfully changed
 *       400:
 *         description: Validation or password mismatch error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New passwords must match
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login required
 */

router.put('/password', authenticated, changePassword);

/**
 * @swagger
 * /api/v1/google:
 *   get:
 *     summary: Redirect user to Google for authentication
 *     description: Initiates Google OAuth login with a required role query parameter (Client or Runner).
 *     tags: [Google Auth]
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [Client, Runner]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth Consent Screen
 */
router.get('/google', auth);

/**
 * @swagger
 * /api/v1/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: Handles the Google callback after user authentication and redirects to /success or /failure
 *     tags: [Google Auth]
 *     responses:
 *       302:
 *         description: Redirect to success or failure route
 */
router.get('/google/callback', user);

/**
 * @swagger
 * /api/v1/success:
 *   get:
 *     summary: Google Authentication Success
 *     description: Returns a token and user info after successful Google Login.
 *     tags: [Google Auth]
 *     responses:
 *       200:
 *         description: Google login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User authenticated successfully
 *                 token:
 *                   type: string
 *                   example: eyJh...yourToken
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 */
router.get('/success', success);

/**
 * @swagger
 * /api/v1/failure:
 *   get:
 *     summary: Google Authentication Failed
 *     description: Returned if Google login fails or is canceled.
 *     tags: [Google Auth]
 *     responses:
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: something went wrong
 */
router.get('/failure', failure);

/**
 * @swagger
 * /api/v1/user/{id}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Retrieve a user's information by their unique ID. Password and sensitive fields are excluded from the response.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The unique ID of the user.
 *         schema:
 *           type: string
 *           example: 1d2a3b4c-5d6e-7f8g-9h0i-123456abcdef
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1d2a3b4c-5d6e-7f8g-9h0i-123456abcdef
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       example: Client
 *                     profileImage:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1/profile.jpg
 *                     rating:
 *                       type: number
 *                       example: 4.8
 *                     totalJobs:
 *                       type: integer
 *                       example: 25
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.get('/user/:id', getOneUser);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all registered users from the database. Passwords and sensitive fields are excluded.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: A list of all users or an empty message if no users exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All users present in the database are 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: 1d2a3b4c-5d6e-7f8g-9h0i-123456abcdef
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       role:
 *                         type: string
 *                         example: Client
 *                       profileImage:
 *                         type: string
 *                         example: https://res.cloudinary.com/demo/image/upload/v1/profile.jpg
 *                       rating:
 *                         type: number
 *                         example: 4.7
 *                       totalJobs:
 *                         type: integer
 *                         example: 25
 */
router.get('/users', getAll);

/**
 * @swagger
 * /api/v1/update/{id}:
 *   put:
 *     summary: Update a user's profile information
 *     description: Allows a user to update their first name, last name, or profile picture. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Bukunmi
 *               lastName:
 *                 type: string
 *                 example: Fasube
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload a new profile image (optional)
 *               bio:
 *                 type: text
 *                 example: I like to play football
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 9e0e3e3c-5a41-4f5a-8f32-bb47d6b8f01d
 *                     firstName:
 *                       type: string
 *                       example: Bukunmi
 *                     lastName:
 *                       type: string
 *                       example: Fasube
 *                     profileImage:
 *                       type: object
 *                       properties:
 *                         publicId:
 *                           type: string
 *                           example: profile_pics/abc123
 *                         Url:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v123456/profile_pics/abc123.jpg

 *                     bio:
 *                       type: text
 *                       example: I like to play football

 *       400:
 *         description: Invalid input or missing required fields
 *       404:
 *         description: User not found
 */

router.put('/update/:id', uploads.single('profileImage'), authenticated, update);




/**
 * @swagger
 * /api/v1/delete-user/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Permanently removes a user record from the database by their unique ID.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the user to be deleted
 *         schema:
 *           type: string
 *           example: 1d2a3b4c-5d6e-7f8g-9h0i-123456abcdef
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.delete('/delete-user/:id', deleteUser);

/**
 * @swagger
 * /api/v1/make-admin/{id}:
 *   put:
 *     summary: Promote a user to admin
 *     description: Updates a user's `isAdmin` status to true.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to promote
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User promoted to admin successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// router.put('/make-admin', makeAdmin);




module.exports = router
