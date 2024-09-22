import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import userRoutes from './routes/userRoutes';
import tripRoutes from './routes/tripRoutes';
import errorHandler from './middleware/error';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Add user routes
app.use('/user', userRoutes);

// Add trip routes
app.use('/trip', tripRoutes);

// Add error handler middleware
app.use(errorHandler);

app.listen(8080, '0.0.0.0', () => {
    console.log(`Listening on port 8080`);
});
