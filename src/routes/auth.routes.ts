import { Router } from 'express';
import { getToken } from '../controllers/auth.controller';

/**
 * @swagger
 * /auth/token:
 *   get:
 *     summary: Get API access token
 *     description: Returns a JWT token for API authentication
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 expiresIn:
 *                   type: string
 *                   example: 24h
 */
const router = Router();

router.get('/token', getToken);

export default router;