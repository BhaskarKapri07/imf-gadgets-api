// tests/setup.ts
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../src/utils/jwt.util';
import { Server } from 'http';

const prisma = new PrismaClient();

// Global variables for testing
declare global {
  var testToken: string;
  var testServer: Server | null;
}

beforeAll(() => {
  // Generate test token
  global.testToken = generateToken();
  global.testServer = null;
});

afterAll(async () => {
  // Clean up database connections
  await prisma.$disconnect();
  
  // Close any open handles (like HTTP servers)
  if (global.testServer) {
    global.testServer.close();
  }
});