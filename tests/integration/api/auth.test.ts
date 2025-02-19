import request from 'supertest';
import app from '../../../src/app';
import { Server } from 'http';

describe('Auth API', () => {
  let server: Server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      global.testServer = server;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /auth/token', () => {
    it('should return a valid JWT token', async () => {
      const response = await request(app)
        .get('/auth/token');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body.status).toBe('success');
      
      // Validate token structure (should have 3 parts separated by dots)
      expect(response.body.token.split('.')).toHaveLength(3);
    });
  });
});