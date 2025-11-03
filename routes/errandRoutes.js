const express = require('express')
const router = express.Router();
const { createErrand, getAllErrands, getErrandById, updateErrand,deleteErrand} = require('../controllers/errandController')


/**
 * @swagger
 * /api/v1/errand/create:
 *   post:
 *     summary: Create a new errand
 *     tags: [Errands]
 *     description: This endpoint allows a user to create a new errand request.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - category
 *               - intruction
 *               - description
 *               - location
 *               - price
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "d7e1a22c-2b91-4e49-8b6f-153f9b0936d5"
 *               title:
 *                 type: string
 *                 example: "Pick up my dry cleaning"
 *               category:
 *                 type: string
 *                 enum: [accessories, food stuff, medicine, cream]
 *                 example: "accessories"
 *               intruction:
 *                 type: string
 *                 example: "Go to XYZ Dry Cleaners and pick up my clothes"
 *               description:
 *                 type: string
 *                 example: "Please pick up 3 shirts and 2 trousers from XYZ Dry Cleaners at 5 PM"
 *               location:
 *                 type: string
 *                 example: "Lagos Mainland"
 *               price:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Errand created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Errand created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */

router.post('/create',createErrand)

/**
 * @swagger
 * /api/v1/errand/getall:
 *   get:
 *     summary: Retrieve all errands
 *     tags: [Errands]
 *     description: Fetch a list of all errands created by users. You can use this endpoint to display all errands in the system.
 *     responses:
 *       200:
 *         description: List of all errands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All errands fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "e3f9d7e0-82c6-4a7f-94d5-0b44f9c85f21"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "f8b61d2a-ef3a-4b4b-9a1d-cc7d3e33f412"
 *                       title:
 *                         type: string
 *                         example: "Buy groceries from Shoprite"
 *                       category:
 *                         type: string
 *                         enum: [accessories, food stuff, medicine, cream]
 *                         example: "food stuff"
 *                       description:
 *                         type: string
 *                         example: "Get rice, beans, and oil"
 *                       location:
 *                         type: string
 *                         example: "Abuja Central"
 *                       price:
 *                         type: number
 *                         example: 4000
 *                       status:
 *                         type: string
 *                         enum: [Open, Assigned, Completed, Cancelled]
 *                         example: "Open"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-24T10:15:30Z"
 *       404:
 *         description: No errands found
 *       500:
 *         description: Internal server error
 */

router.get('/getall',getAllErrands);

/**
 * @swagger
 * /api/v1/errand/get/{id}:
 *   get:
 *     summary: Get an errand by ID
 *     tags: [Errands]
 *     description: Retrieve a single errand using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the errand to retrieve
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "b9e6f8a1-1c2b-4d39-a3d3-82d59b3f241a"
 *     responses:
 *       200:
 *         description: Errand retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Errand fetched successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "b9e6f8a1-1c2b-4d39-a3d3-82d59b3f241a"
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                       example: "f8b61d2a-ef3a-4b4b-9a1d-cc7d3e33f412"
 *                     title:
 *                       type: string
 *                       example: "Pick up medicine from pharmacy"
 *                     category:
 *                       type: string
 *                       enum: [accessories, food stuff, medicine, cream]
 *                       example: "medicine"
 *                     description:
 *                       type: string
 *                       example: "Collect paracetamol and vitamins"
 *                     location:
 *                       type: string
 *                       example: "Ikeja, Lagos"
 *                     price:
 *                       type: number
 *                       example: 2000
 *                     status:
 *                       type: string
 *                       enum: [Open, Assigned, Completed, Cancelled]
 *                       example: "Assigned"
 *                     assignedTo:
 *                       type: string
 *                       format: uuid
 *                       example: "a4c5d2f3-b9e0-4e78-9c9a-7c2f6e3d9b10"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-10-24T10:15:30Z"
 *       404:
 *         description: Errand not found
 *       400:
 *         description: Invalid ID format
 *       500:
 *         description: Internal server error
 */

router.get('/get/:id', getErrandById);

/**
 * @swagger
 * /api/v1/errand/update/{id}:
 *   put:
 *     summary: Update an existing errand
 *     tags: [Errands]
 *     description: Update the details of an existing errand using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the errand to update
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "b9e6f8a1-1c2b-4d39-a3d3-82d59b3f241a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy household groceries"
 *               category:
 *                 type: string
 *                 enum: [accessories, food stuff, medicine, cream]
 *                 example: "food stuff"
 *               description:
 *                 type: string
 *                 example: "Get rice, beans, and detergent from the market"
 *               location:
 *                 type: string
 *                 example: "Abuja, Nigeria"
 *               price:
 *                 type: number
 *                 example: 4500
 *               status:
 *                 type: string
 *                 enum: [Open, Assigned, Completed, Cancelled]
 *                 example: "Assigned"
 *               assignedTo:
 *                 type: string
 *                 format: uuid
 *                 example: "f8b61d2a-ef3a-4b4b-9a1d-cc7d3e33f412"
 *     responses:
 *       200:
 *         description: Errand updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Errand updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Errand'
 *       400:
 *         description: Invalid request body or parameters
 *       404:
 *         description: Errand not found
 *       500:
 *         description: Internal server error
 */

router.put('/update/:id',updateErrand);

/**
 * @swagger
 * /api/v1/errand/delete/{id}:
 *   delete:
 *     summary: Delete an errand by ID
 *     tags: [Errands]
 *     description: Permanently remove an errand from the system using its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the errand to delete
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "b9e6f8a1-1c2b-4d39-a3d3-82d59b3f241a"
 *     responses:
 *       200:
 *         description: Errand deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Errand deleted successfully"
 *       404:
 *         description: Errand not found
 *       400:
 *         description: Invalid ID format
 *       500:
 *         description: Internal server error
 */

router.delete('/delete/:id',deleteErrand)

module.exports = router;