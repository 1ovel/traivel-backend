import express from 'express';
import TripService from '../services/tripService';
import authMiddleware from '../middleware/auth';
import { AuthenticatedRequest } from '../types/AuthentificatedRequest';
import { TripDayDTO, Trip } from '../models/trip';
import CustomError from '../utils/customError';

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
        res: express.Response<GenerateTripResponse>,
        next: express.NextFunction
    ) => {
        try {
            console.log('Generate trip request received');

            const { numberOfDays, country, city } = req.body;

            if (!numberOfDays || !country || !city) {
                throw new CustomError(400, 'Missing required parameters');
            }

            const generatedTripDays = await tripService.generateTrip(
                numberOfDays,
                country,
                city
            );

            if (!generatedTripDays) {
                throw new CustomError(500, 'Failed to generate trip');
            }

            console.log('Trip generated successfully');
            res.status(200).json({ days: generatedTripDays });
        } catch (error) {
            next(error);
        }
    }
);

router.post(
    '/save',
    authMiddleware,
    async (
        req: AuthenticatedRequest<SaveTripRequest>,
        res: express.Response<SaveTripResponse>,
        next: express.NextFunction
    ) => {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new CustomError(401, 'User not authenticated');
            }

            const { trip } = req.body;
            if (!trip) {
                throw new CustomError(400, 'Trip data is required');
            }

            const savedTrip = await tripService.saveTrip(userId, trip);
            res.status(201).json({ savedTrip });
        } catch (error) {
            next(error);
        }
    }
);

router.put(
    '/:tripId',
    authMiddleware,
    async (
        req: AuthenticatedRequest<UpdateTripRequest>,
        res: express.Response<UpdateTripResponse>,
        next: express.NextFunction
    ) => {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new CustomError(401, 'User not authenticated');
            }

            const { tripId } = req.params;
            const { updatedTrip } = req.body;

            if (!tripId || !updatedTrip) {
                throw new CustomError(
                    400,
                    'Trip ID and updated trip data are required'
                );
            }

            const result = await tripService.updateTrip(
                userId,
                tripId,
                updatedTrip
            );
            res.status(200).json({ updatedTrip: result });
        } catch (error) {
            next(error);
        }
    }
);

router.delete(
    '/:tripId',
    authMiddleware,
    async (
        req: AuthenticatedRequest,
        res: express.Response<DeleteTripResponse>,
        next: express.NextFunction
    ) => {
        try {
            const userId = req.userId;
            if (!userId) {
                throw new CustomError(401, 'User not authenticated');
            }

            const { tripId } = req.params;

            if (!tripId) {
                throw new CustomError(400, 'Trip ID is required');
            }

            await tripService.deleteTrip(userId, tripId);
            res.status(200).json({ message: 'Trip deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
