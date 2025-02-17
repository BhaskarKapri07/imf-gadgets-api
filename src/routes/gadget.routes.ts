import { Router } from 'express';
import { getGadgets, createGadget } from '../controllers/gadget.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCreateGadget } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getGadgets);
router.post('/', validateCreateGadget, createGadget);

export default router;