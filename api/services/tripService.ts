import OpenAI from 'openai';
import {
    GeneratedTripResponseSchema,
    TripDayDTO,
    Trip,
    EventDTO,
} from '../models/trip';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class TripService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    // This method generates a valid array of trip day objects. Returns null if request is failed
    public async generateTrip(
        numberOfDays: number,
        country: string,
        city: string
    ): Promise<TripDayDTO[] | null> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: process.env.SYSTEM_PREPROMPT ?? '',
                    },
                    {
                        role: 'user',
                        content: process.env.USER_PREPROMPT ?? '',
                    },
                    {
                        role: 'assistant',
                        content: process.env.ASSISTANT_PREPROMPT ?? '',
                    },
                    {
                        role: 'user',
                        content: `{ "numberOfDays": ${numberOfDays}, "country": ${country}, "cities": [${city}] }`,
                    },
                ],
            });

            // Check that completion API generated valid trip, regenerate trip if it's not valid
            let retries = 0;
            try {
                const tripDays: TripDayDTO[] = JSON.parse(
                    completion.choices[0]?.message.content ?? ''
                );
                await GeneratedTripResponseSchema.parseAsync(tripDays);
                return tripDays;
            } catch (error) {
                retries++;
                console.error(
                    'Error while generating trip days. Most likely inappropriate object was generated, retrying.'
                );
                if (retries > 2) {
                    return null;
                }
                return await this.generateTrip(numberOfDays, country, city);
            }
        } catch (error) {
            console.error(
                'Unexpected error while fetching completion from OpenAI.'
            );
            return null;
        }
    }

    public async saveTrip(userId: string, tripData: Trip): Promise<Trip> {
        const { startDate, days } = tripData;

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const savedTrip = await prisma.trip.create({
            data: {
                startDate,
                participants: {
                    connect: { id: userId },
                },
                days: {
                    create: days.map((day: TripDayDTO) => ({
                        events: {
                            create: day.events.map((event: EventDTO) => ({
                                title: event.title,
                                details: event.details,
                                address: event.address,
                                country: event.country,
                                city: event.city,
                                tickets: event.tickets,
                            })),
                        },
                    })),
                },
            },
            include: {
                days: {
                    include: {
                        events: true,
                    },
                },
                participants: true,
            },
        });

        return savedTrip;
    }

    async updateTrip(
        userId: string,
        tripId: string,
        updatedTrip: Partial<Trip>
    ): Promise<Trip> {
        const trip = await prisma.trip.findFirst({
            where: { id: tripId, participants: { some: { id: userId } } },
        });

        if (!trip) {
            throw new Error('Trip not found or user not authorized');
        }

        return await prisma.trip.update({
            where: { id: tripId },
            data: updatedTrip,
            include: {
                days: {
                    include: {
                        events: true,
                    },
                },
                participants: true,
            },
        });
    }

    async deleteTrip(userId: string, tripId: string): Promise<void> {
        await prisma.trip.delete({
            where: {
                id: tripId,
                participants: {
                    some: { id: userId },
                },
            },
        });
        // The delete operation will throw an error if the trip is not found or the user is not authorized
    }
}
