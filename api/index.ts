import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import TripService from './services/tripService';
import UserService from './services/userService';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const tripService = new TripService();
const userService = new UserService();

app.use(cors());
app.use(express.json());

app.post('/generate_trip', userService.authenticate, async (req, res) => {
    console.log('Generate trip request received');

    const { numberOfDays, country, city } = req.body;

    if (!numberOfDays || !country || !city) {
        res.status(400).send(
            'Error: Some required values were not provided in the request'
        );
        console.error('Error while creating trip, bad request');
        return;
    }
    const generatedTripDays = await tripService.generateTrip(
        numberOfDays,
        country,
        city
    );

    console.log('Trip generated successfully');
    res.status(200).json(generatedTripDays).send();
});

app.listen(8080, '0.0.0.0', () => {
    console.log(`Listening on port 8080`);
});
