import { NextFunction, Request, Response } from 'express';
import { PrismaClient, GadgetStatus } from '@prisma/client';
import { generateCodename } from '../utils/codename.util'
import { AppError } from '../utils/error.util';
import { validateAndProcessStatusChange } from '../utils/status.util';
import { createConfirmationCode, verifyConfirmationCode } from '../utils/confirmation-code.util';

const prisma = new PrismaClient();

export const getGadgets = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const {status} = req.query;

    // Validate status if provided
    if (status && !['AVAILABLE', 'DEPLOYED', 'DESTROYED', 'DECOMMISSIONED'].includes(status as string)) {
      return next(new AppError(400, `Invalid status: ${status}. Must be one of: AVAILABLE, DEPLOYED, DESTROYED, DECOMMISSIONED`));
    }
    
    const gadgets = await prisma.gadget.findMany({
      where: status ? { status: status as GadgetStatus } : {}
    });
    
    // Add random success probability to each gadget
    const gadgetsWithProbability = gadgets.map(gadget => ({
      ...gadget,
      missionSuccessProbability: Math.floor(Math.random() * (95 - 30 + 1)) + 30 // Random between 30-95%
    }));

    res.json({
      status: 'success',
      data: gadgetsWithProbability
    });
  } catch (error) {
    next(error);
  }
};

export const createGadget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description } = req.body;
    
    // Generate a unique codename
    let codename = generateCodename();
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 10;

    // Keep trying until we get a unique codename
    while (!isUnique && attempts < MAX_ATTEMPTS) {
      const existing = await prisma.gadget.findUnique({
        where: { codename }
      });
      
      if (!existing) {
        isUnique = true;
      } else {
        codename = generateCodename();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new AppError(500, 'Could not generate unique codename');
    }

    const gadget = await prisma.gadget.create({
      data: {
        codename,
        description,
        status: 'AVAILABLE'
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        ...gadget,
        missionSuccessProbability: Math.floor(Math.random() * (95 - 30 + 1)) + 30
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateGadget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { description, status } = req.body;

    // Check if gadget exists
    const existingGadget = await prisma.gadget.findUnique({
      where: { id }
    });

    if (!existingGadget) {
      throw new AppError(404, 'Gadget not found');
    }

    // If status is changing, validate the transition
    if (status && status !== existingGadget.status) {
      await validateAndProcessStatusChange(existingGadget.status, status as GadgetStatus);
      
      // Create status history record
      await prisma.statusHistory.create({
        data: {
          gadgetId: id,
          oldStatus: existingGadget.status,
          newStatus: status as GadgetStatus
        }
      });
    }

    // Update gadget
    const updatedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        ...(description && { description }),
        ...(status && { status: status as GadgetStatus }),
        ...((status === 'DECOMMISSIONED') && { decommissionedAt: new Date() }),
        ...((status === 'DESTROYED') && { destroyedAt: new Date() })
      }
    });

    res.json({
      status: 'success',
      data: {
        ...updatedGadget,
        missionSuccessProbability: Math.floor(Math.random() * (95 - 30 + 1)) + 30
      }
    });
  } catch (error) {
    next(error);
  }
};


export const decommissionGadget = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if gadget exists
    const existingGadget = await prisma.gadget.findUnique({
      where: { id }
    });

    if (!existingGadget) {
      throw new AppError(404, 'Gadget not found');
    }

    // Check if gadget is already decommissioned
    if (existingGadget.status === 'DECOMMISSIONED') {
      throw new AppError(400, 'Gadget is already decommissioned');
    }

    // Check if gadget is destroyed
    if (existingGadget.status === 'DESTROYED') {
      throw new AppError(400, 'Cannot decommission a destroyed gadget');
    }

    // Create status history record
    await prisma.statusHistory.create({
      data: {
        gadgetId: id,
        oldStatus: existingGadget.status,
        newStatus: 'DECOMMISSIONED'
      }
    });

    // Update gadget
    const decommissionedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: 'DECOMMISSIONED',
        decommissionedAt: new Date()
      }
    });

    res.json({
      status: 'success',
      message: 'Gadget successfully decommissioned',
      data: decommissionedGadget
    });
  } catch (error) {
    next(error);
  }
};


// Request self-destruct code
export const requestSelfDestruct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if gadget exists
    const gadget = await prisma.gadget.findUnique({
      where: { id }
    });

    if (!gadget) {
      throw new AppError(404, 'Gadget not found');
    }

    // Check if gadget can be destroyed
    if (gadget.status === 'DESTROYED') {
      throw new AppError(400, 'Gadget is already destroyed');
    }

    if (gadget.status === 'DECOMMISSIONED') {
      throw new AppError(400, 'Cannot destroy a decommissioned gadget');
    }

    // Generate confirmation code
    const confirmationCode = createConfirmationCode(id);

    res.json({
      status: 'success',
      message: 'Self-destruct sequence initiated',
      data: {
        confirmationCode,
        expiresIn: '5 minutes'
      }
    });
  } catch (error) {
    next(error);
  }
};

// Confirm self-destruct
export const confirmSelfDestruct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { confirmationCode } = req.body;

    // Check if gadget exists
    const gadget = await prisma.gadget.findUnique({
      where: { id }
    });

    if (!gadget) {
      throw new AppError(404, 'Gadget not found');
    }

    // Verify confirmation code
    verifyConfirmationCode(id, confirmationCode);

    // Create status history record
    await prisma.statusHistory.create({
      data: {
        gadgetId: id,
        oldStatus: gadget.status,
        newStatus: 'DESTROYED'
      }
    });

    // Update gadget status
    const destroyedGadget = await prisma.gadget.update({
      where: { id },
      data: {
        status: 'DESTROYED',
        destroyedAt: new Date()
      }
    });

    res.json({
      status: 'success',
      message: 'Gadget successfully destroyed',
      data: destroyedGadget
    });
  } catch (error) {
      next(error);
  }
};