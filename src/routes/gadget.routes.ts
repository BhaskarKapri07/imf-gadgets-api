import { Router } from 'express';
import { getGadgets, createGadget, updateGadget, decommissionGadget, requestSelfDestruct, confirmSelfDestruct} from '../controllers/gadget.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateCreateGadget, validateUpdateGadget, validateDecommission, validateSelfDestruct } from '../middleware/validate.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getGadgets);
router.post('/', validateCreateGadget, createGadget);
router.patch('/:id', validateUpdateGadget, updateGadget);
router.delete('/:id', validateDecommission, decommissionGadget);
router.post('/:id/self-destruct', validateSelfDestruct, requestSelfDestruct);
router.post('/:id/self-destruct/confirm', validateSelfDestruct, confirmSelfDestruct);


export default router;