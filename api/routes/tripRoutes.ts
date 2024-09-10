import express from 'express';
import TripService from '../services/tripService';
import authMiddleware from '../middleware/auth';
import { AuthenticatedRequest } from '../types/AuthentificatedRequest';
import { TripDayDTO, Trip } from '../models/trip';

const router = express.Router();
const tripService = new TripService();

interface GenerateTripRequest {
    numberOfDays: number;
    country: string;
    city: string;
}

interface GenerateTripResponse {
    days: TripDayDTO[] | null;
}

interface SaveTripRequest {
    trip: Trip;
}

interface SaveTripResponse {
    savedTrip: Trip;
}

interface UpdateTripRequest {
    tripId: string;
    updatedTrip: Partial<Trip>;
}

interface UpdateTripResponse {
    updatedTrip: Trip;
}

interface DeleteTripResponse {
    message: string;
}

router.post(
    '/generate',
    authMiddleware,
    async (
        req: AuthenticatedRequest<GenerateTripRequest>,
        res: express.Response<GenerateTripResponse>
    ) => {
        console.log('Generate trip request received');

        const { numberOfDays, country, city } = req.body;

        if (!numberOfDays || !country || !city) {
            res.status(400).json({ days: null });
            console.error('Error while creating trip, bad request');
            return;
        }

        const generatedTripDays = await tripService.generateTrip(
            numberOfDays,
            country,
            city
        );

        console.log('Trip generated successfully');
        res.status(200).json({ days: generatedTripDays });
    }
);

router.post(
    '/save',
    authMiddleware,
    async (
        req: AuthenticatedRequest<SaveTripRequest>,
        res: express.Response<SaveTripResponse | { error: string }>
    ) => {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { trip } = req.body;
        if (!trip) {
            return res.status(400).json({ error: 'Trip data is required' });
        }

        try {
            const savedTrip = await tripService.saveTrip(userId, trip);
            res.status(201).json({ savedTrip });
        } catch (error) {
            console.error('Error saving trip:', error);
            if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.status(500).json({ error: 'Failed to save trip' });
            }
        }
    }
);

router.put(
    '/:tripId',
    authMiddleware,
    async (
        req: AuthenticatedRequest<UpdateTripRequest>,
        res: express.Response<UpdateTripResponse | { error: string }>
    ) => {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { tripId } = req.params;
        const { updatedTrip } = req.body;

        if (!tripId || !updatedTrip) {
            return res
                .status(400)
                .json({ error: 'Trip ID and updated trip data are required' });
        }

        try {
            const result = await tripService.updateTrip(
                userId,
                tripId,
                updatedTrip
            );
            res.status(200).json({ updatedTrip: result });
        } catch (error) {
            console.error('Error updating trip:', error);
            res.status(500).json({ error: 'Failed to update trip' });
        }
    }
);

router.delete(
    '/:tripId',
    authMiddleware,
    async (
        req: AuthenticatedRequest,
        res: express.Response<DeleteTripResponse | { error: string }>
    ) => {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { tripId } = req.params;

        if (!tripId) {
            return res.status(400).json({ error: 'Trip ID is required' });
        }

        try {
            await tripService.deleteTrip(userId, tripId);
            res.status(200).json({ message: 'Trip deleted successfully' });
        } catch (error) {
            console.error('Error deleting trip:', error);
            res.status(500).json({ error: 'Failed to delete trip' });
        }
    }
);

export default router;
