import { Router } from 'express';
import { getGadgets, createGadget, updateGadget, decommissionGadget} from '../controllers/gadget.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCreateGadget, validateUpdateGadget, validateDecommission } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getGadgets);
router.post('/', validateCreateGadget, createGadget);
router.patch('/:id', validateUpdateGadget, updateGadget);
router.delete('/:id', validateDecommission, decommissionGadget);


export default router;