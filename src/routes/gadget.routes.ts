import { Router } from 'express';
import { getGadgets, createGadget, updateGadget, decommissionGadget, requestSelfDestruct, confirmSelfDestruct} from '../controllers/gadget.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCreateGadget, validateUpdateGadget, validateDecommission, validateSelfDestruct } from '../middleware/validate.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     Gadget:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier
 *         codename:
 *           type: string
 *           description: Unique gadget codename (e.g., "The Silent Hawk")
 *         description:
 *           type: string
 *           description: Detailed description of the gadget
 *         status:
 *           type: string
 *           enum: [AVAILABLE, DEPLOYED, DESTROYED, DECOMMISSIONED]
 *           description: Current status of the gadget
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the gadget was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the gadget was last updated
 *         decommissionedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the gadget was decommissioned (if applicable)
 *         destroyedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the gadget was destroyed (if applicable)
 *         missionSuccessProbability:
 *           type: number
 *           description: Randomly generated success probability (30-95%)
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         codename: "The Silent Hawk"
 *         description: "High-tech stealth drone with EMP capabilities"
 *         status: "AVAILABLE"
 *         createdAt: "2025-02-17T10:30:00.000Z"
 *         updatedAt: "2025-02-17T10:30:00.000Z"
 *         decommissionedAt: null
 *         destroyedAt: null
 *         missionSuccessProbability: 87
 */

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /gadgets:
 *   get:
 *     summary: Get all gadgets
 *     description: Retrieves all gadgets with optional status filtering
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, DEPLOYED, DESTROYED, DECOMMISSIONED]
 *         description: Filter gadgets by status
 *     responses:
 *       200:
 *         description: List of gadgets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gadget'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get('/', getGadgets);

/**
 * @swagger
 * /gadgets:
 *   post:
 *     summary: Create a new gadget
 *     description: Adds a new gadget to the inventory with random codename
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Detailed description of the gadget
 *                 minLength: 10
 *                 maxLength: 500
 *             example:
 *               description: "Pen with built-in laser cutter and holographic projector"
 *     responses:
 *       201:
 *         description: Gadget created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post('/', validateCreateGadget, createGadget);

/**
 * @swagger
 * /gadgets/{id}:
 *   patch:
 *     summary: Update gadget information
 *     description: Update a gadget's description or status
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 description: Updated description
 *                 minLength: 10
 *                 maxLength: 500
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, DEPLOYED, DESTROYED, DECOMMISSIONED]
 *                 description: New status (must follow allowed transitions)
 *             example:
 *               description: "Updated description with enhanced features"
 *               status: "DEPLOYED"
 *     responses:
 *       200:
 *         description: Gadget updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       400:
 *         description: Invalid input or status transition
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Gadget not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', validateUpdateGadget, updateGadget);

/**
 * @swagger
 * /gadgets/{id}:
 *   delete:
 *     summary: Decommission a gadget
 *     description: Mark a gadget as decommissioned (soft delete)
 *     tags: [Gadgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     responses:
 *       200:
 *         description: Gadget decommissioned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Gadget successfully decommissioned
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       400:
 *         description: Cannot decommission gadget (already destroyed or decommissioned)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Gadget not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', validateDecommission, decommissionGadget);

/**
 * @swagger
 * /gadgets/{id}/self-destruct:
 *   post:
 *     summary: Initiate self-destruct sequence
 *     description: Request a confirmation code to destroy a gadget
 *     tags: [Self-Destruct]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     responses:
 *       200:
 *         description: Self-destruct sequence initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Self-destruct sequence initiated
 *                 data:
 *                   type: object
 *                   properties:
 *                     confirmationCode:
 *                       type: string
 *                       example: "A1B2C3"
 *                     expiresIn:
 *                       type: string
 *                       example: "5 minutes"
 *       400:
 *         description: Gadget cannot be destroyed (wrong status)
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Gadget not found
 *       500:
 *         description: Server error
 */
router.post('/:id/self-destruct', validateSelfDestruct, requestSelfDestruct);

/**
 * @swagger
 * /gadgets/{id}/self-destruct/confirm:
 *   post:
 *     summary: Confirm self-destruct sequence
 *     description: Execute self-destruct using confirmation code
 *     tags: [Self-Destruct]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gadget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - confirmationCode
 *             properties:
 *               confirmationCode:
 *                 type: string
 *                 description: Code received from initiation request
 *             example:
 *               confirmationCode: "A1B2C3"
 *     responses:
 *       200:
 *         description: Gadget successfully destroyed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Gadget successfully destroyed
 *                 data:
 *                   $ref: '#/components/schemas/Gadget'
 *       400:
 *         description: Invalid or expired confirmation code
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Gadget not found
 *       500:
 *         description: Server error
 */
router.post('/:id/self-destruct/confirm', validateSelfDestruct, confirmSelfDestruct);

export default router;