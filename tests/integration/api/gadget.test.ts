import request from 'supertest';
import app from '../../../src/app';
import { PrismaClient } from '@prisma/client';
import { Server } from 'http';
import { generateToken } from '../../../src/utils/jwt.util';

const prisma = new PrismaClient();

describe('Gadget API', () => {
  let server: Server;
  let authToken: string;
  let createdGadgetId: string;

  beforeAll(async () => {
    // Start server
    server = app.listen(0);

    // Get auth token
    authToken = generateToken();

    // Clean up database before tests
    await prisma.statusHistory.deleteMany();
    await prisma.gadget.deleteMany();
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
  });

  describe('POST /gadgets', () => {
    it('should create a new gadget', async () => {
      const response = await request(app)
        .post('/gadgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test gadget for integration tests'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('codename');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('status', 'AVAILABLE');
      expect(response.body.data).toHaveProperty('missionSuccessProbability');
      
      // Save ID for later tests
      createdGadgetId = response.body.data.id;
    });

    it('should return 400 if description is missing', async () => {
      const response = await request(app)
        .post('/gadgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/gadgets')
        .send({
          description: 'Test gadget without auth'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /gadgets', () => {
    it('should return a list of gadgets', async () => {
      const response = await request(app)
        .get('/gadgets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Each gadget should have success probability
      response.body.data.forEach((gadget: any) => {
        expect(gadget).toHaveProperty('missionSuccessProbability');
      });
    });

    it('should filter gadgets by status', async () => {
      const response = await request(app)
        .get('/gadgets?status=AVAILABLE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      // All returned gadgets should have AVAILABLE status
      response.body.data.forEach((gadget: any) => {
        expect(gadget.status).toBe('AVAILABLE');
      });
    });
  });

describe('PATCH /gadgets/:id', () => {
  it('should update a gadget description', async () => {
    const response = await request(app)
      .patch(`/gadgets/${createdGadgetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Updated test gadget description'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.description).toBe('Updated test gadget description');
  });

  it('should update a gadget status', async () => {
    const response = await request(app)
      .patch(`/gadgets/${createdGadgetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'DEPLOYED'
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.status).toBe('DEPLOYED');
  });

  it('should return 404 for non-existent gadget', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request(app)
      .patch(`/gadgets/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Updated description'
      });
  
    expect(response.status).toBe(404);
    expect(response.body.status).toBe('error');
  });
});

describe('DELETE /gadgets/:id', () => {
  let gadgetForDeleteId: string;

  beforeAll(async () => {
    // Create a new gadget specifically for DELETE testing
    const response = await request(app)
      .post('/gadgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Gadget for delete testing'
      });
    
    gadgetForDeleteId = response.body.data.id;
  });

  it('should decommission a gadget', async () => {
    const response = await request(app)
      .delete(`/gadgets/${gadgetForDeleteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.status).toBe('DECOMMISSIONED');
    expect(response.body.data).toHaveProperty('decommissionedAt');
  });
});


describe('Self-Destruct Sequence', () => {
  let anotherGadgetId: string;
  let confirmationCode: string;

  beforeAll(async () => {
    // Create another gadget for self-destruct testing
    const response = await request(app)
      .post('/gadgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Gadget for self-destruct testing'
      });
    
    anotherGadgetId = response.body.data.id;

    // Set to DEPLOYED status (required for self-destruct)
    await request(app)
      .patch(`/gadgets/${anotherGadgetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'DEPLOYED'
      });
  });

  it('should initiate self-destruct sequence', async () => {
    const response = await request(app)
      .post(`/gadgets/${anotherGadgetId}/self-destruct`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('confirmationCode');
    
    confirmationCode = response.body.data.confirmationCode;
  });

  it('should complete self-destruct sequence with valid code', async () => {
    const response = await request(app)
      .post(`/gadgets/${anotherGadgetId}/self-destruct/confirm`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        confirmationCode
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.status).toBe('DESTROYED');
    expect(response.body.data).toHaveProperty('destroyedAt');
  });

  it('should reject self-destruct with invalid code', async () => {
    // Create a third gadget for invalid code testing
    const gadgetResponse = await request(app)
      .post('/gadgets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: 'Another test gadget'
      });
    
    const thirdGadgetId = gadgetResponse.body.data.id;

    // Set to DEPLOYED status
    await request(app)
      .patch(`/gadgets/${thirdGadgetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'DEPLOYED'
      });

    // Request code
    await request(app)
      .post(`/gadgets/${thirdGadgetId}/self-destruct`)
      .set('Authorization', `Bearer ${authToken}`);

    // Try with wrong code
    const response = await request(app)
      .post(`/gadgets/${thirdGadgetId}/self-destruct/confirm`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        confirmationCode: 'WRONG1'
      });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('error');
  });
});

});