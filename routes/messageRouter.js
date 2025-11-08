const router = require('express').Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { authenticated } = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: API for sending and retrieving chat messages between users
 */

/**
 * @swagger
 * /api/v1/messages/{userId}:
 *   get:
 *     summary: Get all chat messages between the logged-in user and another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the other user to fetch messages with
 *     responses:
 *       200:
 *         description: List of messages successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Messages retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "9a25e7a8-4b7c-42ab-bc76-04b3f3f97f61"
 *                       senderId:
 *                         type: string
 *                         example: "c1a3b2d4-44e2-4b95-b8f3-bd87ed14e0a1"
 *                       receiverId:
 *                         type: string
 *                         example: "f4d3b8b2-22c5-4e9f-911a-cdf2a7e21c92"
 *                       text:
 *                         type: string
 *                         example: "Hello! I'm interested in your errand."
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-11-05T14:55:32.000Z"
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "c1a3b2d4-44e2-4b95-b8f3-bd87ed14e0a1"
 *                           firstName:
 *                             type: string
 *                             example: "Daniel"
 *                           lastName:
 *                             type: string
 *                             example: "Johnson"
 *                           email:
 *                             type: string
 *                             example: "daniel@example.com"
 *                           profileImage:
 *                             type: string
 *                             example: "https://res.cloudinary.com/dwzomhflw/image/upload/v1723123456/daniel.jpg"
 *                           rating:
 *                             type: number
 *                             example: 4.8
 *                           role:
 *                             type: string
 *                             example: "Runner"
 *                       receiver:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "f4d3b8b2-22c5-4e9f-911a-cdf2a7e21c92"
 *                           firstName:
 *                             type: string
 *                             example: "Blessing"
 *                           lastName:
 *                             type: string
 *                             example: "Fasube"
 *                           email:
 *                             type: string
 *                             example: "fasubeblessing@gmail.com"
 *                           profileImage:
 *                             type: string
 *                             example: "https://res.cloudinary.com/dwzomhflw/image/upload/v1723123456/blessing.jpg"
 *                           rating:
 *                             type: number
 *                             example: 4.9
 *                           role:
 *                             type: string
 *                             example: "Client"
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.get('/messages/:userId', authenticated, getMessages);


/**
 * @swagger
 * /api/v1/write/message:
 *   post:
 *     summary: Send a new message to another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - text
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: The ID of the user to send the message to
 *                 example: "f4d3b8b2-22c5-4e9f-911a-cdf2a7e21c92"
 *               text:
 *                 type: string
 *                 description: The message content
 *                 example: "Hey! Are you available for this errand?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message sent successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "b92c52a5-3fcd-4d2b-9a43-b8eec5f90a92"
 *                     senderId:
 *                       type: string
 *                       example: "c1a3b2d4-44e2-4b95-b8f3-bd87ed14e0a1"
 *                     receiverId:
 *                       type: string
 *                       example: "f4d3b8b2-22c5-4e9f-911a-cdf2a7e21c92"
 *                     text:
 *                       type: string
 *                       example: "Hey! Are you available for this errand?"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-05T15:02:11.000Z"
 *                     sender:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "c1a3b2d4-44e2-4b95-b8f3-bd87ed14e0a1"
 *                         firstName:
 *                           type: string
 *                           example: "Daniel"
 *                         lastName:
 *                           type: string
 *                           example: "Johnson"
 *                         email:
 *                           type: string
 *                           example: "daniel@example.com"
 *                         profileImage:
 *                           type: string
 *                           example: "https://res.cloudinary.com/dwzomhflw/image/upload/v1723123456/daniel.jpg"
 *                         rating:
 *                           type: number
 *                           example: 4.8
 *                         role:
 *                           type: string
 *                           example: "Runner"
 *                     receiver:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "f4d3b8b2-22c5-4e9f-911a-cdf2a7e21c92"
 *                         firstName:
 *                           type: string
 *                           example: "Blessing"
 *                         lastName:
 *                           type: string
 *                           example: "Fasube"
 *                         email:
 *                           type: string
 *                           example: "fasubeblessing@gmail.com"
 *                         profileImage:
 *                           type: string
 *                           example: "https://res.cloudinary.com/dwzomhflw/image/upload/v1723123456/blessing.jpg"
 *                         rating:
 *                           type: number
 *                           example: 4.9
 *                         role:
 *                           type: string
 *                           example: "Client"
 *       400:
 *         description: Missing receiverId or text
 *       500:
 *         description: Failed to send message
 */
router.post('/write/message', authenticated, sendMessage);

module.exports = router;
