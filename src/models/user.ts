import { z } from 'zod';
import { TripSchema } from './trip';

export type User = z.infer<typeof UserSchema>;

// Lazy definition of UserSchema and TripSchema to handle circular references
export const UserSchema: z.ZodSchema = z.lazy(() =>
    z.object({
        id: z.string().uuid(),
        email: z.string().email({ message: 'Invalid email address' }),
        username: z
            .string()
            .min(3, { message: 'Username must be at least 3 characters long' }),
        trips: z.array(TripSchema),
    })
);
