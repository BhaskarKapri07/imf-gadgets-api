import express, { Express } from 'express';
import cors from 'cors'
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import gadgetRoutes from './routes/gadget.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/auth', authRoutes);
app.use('/gadgets', gadgetRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'IMF Gadgets API - v1.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/auth/token',
      gadgets: '/gadgets'
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Only start the server if this file is run directly
if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`⚡️[server]: IMF Gadgets API is running at http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/api-docs`);
  });
}

export default app;