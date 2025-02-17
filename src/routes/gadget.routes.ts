import { Router } from 'express';
import { getGadgets, createGadget, updateGadget} from '../controllers/gadget.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCreateGadget, validateUpdateGadget } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getGadgets);
router.post('/', validateCreateGadget, createGadget);
router.patch('/:id', validateUpdateGadget, updateGadget);


export default router;