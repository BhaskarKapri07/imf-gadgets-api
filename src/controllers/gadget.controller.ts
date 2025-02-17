import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateCodename } from '../utils/codename.util'
import { AppError } from '../utils/error.util';

const prisma = new PrismaClient();

export const getGadgets = async (req: Request, res: Response) => {
  try {
    const gadgets = await prisma.gadget.findMany();
    
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
    throw error;
  }
};

export const createGadget = async (req: Request, res: Response) => {
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
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, 'Error creating gadget');
  }
};