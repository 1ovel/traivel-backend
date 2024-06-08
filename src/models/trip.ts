import { z } from 'zod';
import { UserSchema } from './user';

export type CreateTripRequest = {
    city: string;
    country: string;
    numberOfDays: string;
};

export interface CreateTripResponse {
    success: boolean;
    data: Trip;
}

// Define the Event schema with additional validation rules
export const EventDTOSchema = z.object({
    title: z
        .string()
        .min(3, { message: 'Title must be at least 3 characters long' }),
    description: z.string().min(5, {
        message: 'Description must be at least 5 characters long',
    }),
    address: z
        .string()
        .min(5, { message: 'Address must be at least 5 characters long' }),
    country: z
        .string()
        .min(2, { message: 'Country must be at least 2 characters long' }),
    city: z
        .string()
        .min(2, { message: 'City must be at least 2 characters long' }),
    tickets: z.string().min(1, { message: 'Tickets field must not be empty' }),
    tripDayId: z.string().uuid(),
});

export const EventSchema = EventDTOSchema.extend({
    id: z.string().uuid(),
});

// Define the TripDay schema
export const TripDayDTOSchema = z.object({
    events: z.array(EventDTOSchema),
});

export const GeneratedTripResponseSchema = z.array(TripDayDTOSchema);

export const TripDaySchema = TripDayDTOSchema.extend({
    id: z.string().uuid(),
    tripId: z.string().uuid(),
});

// Lazy definition of TripSchema to handle circular references
export const TripSchema: z.ZodSchema = z.lazy(() =>
    z.object({
        id: z.string().uuid(),
        startDate: z.date({
            invalid_type_error: 'Start date must be a valid date',
        }),
        days: z.array(TripDaySchema),
        participants: z.array(UserSchema),
    })
);

// Create TypeScript types by inferring from Zod schemas
export type Event = z.infer<typeof EventSchema>;
export type TripDay = z.infer<typeof TripDaySchema>;
export type Trip = z.infer<typeof TripSchema>;
export type EventDTO = z.infer<typeof EventDTOSchema>;
export type TripDayDTO = z.infer<typeof TripDayDTOSchema>;
