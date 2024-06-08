import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { CreateTripRequest } from './models/trip';
import TripService from './services/tripService';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const tripService = new TripService();

app.use(cors());
app.use(express.json());

app.get('/generate_trip', async (req, res) => {
    const { numberOfDays, country, city } = req.body;
    if (!numberOfDays || !country || !city) {
        res.status(400).send(
            'Error: Some required values were not provided in the request'
        );
        return;
    }
    const generatedTripDays = await res.status(200).send('Request received');
});

app.listen(8080, '0.0.0.0', () => {
    console.log(`Listening on port 8080`);
});
