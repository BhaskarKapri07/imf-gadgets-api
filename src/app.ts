import express, { Express } from 'express';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import gadgetRoutes from './routes/gadget.routes';  

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);
app.use('/gadgets', gadgetRoutes);  

app.use(notFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`⚡️[server]: IMF Gadgets API is running at http://localhost:${port}`);
  });
}

export default app;