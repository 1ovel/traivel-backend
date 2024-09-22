import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import userRoutes from './routes/userRoutes';
import tripRoutes from './routes/tripRoutes';
import errorHandler from './middleware/error';
import ApiResponse from './utils/apiResponse';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Add user routes
app.use('/user', userRoutes);

// Add trip routes
app.use('/trip', tripRoutes);

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json(ApiResponse.error('Not Found'));
});

// Add error handler middleware
app.use(errorHandler);

app.listen(8080, '0.0.0.0', () => {
    console.log(`Listening on port 8080`);
});
