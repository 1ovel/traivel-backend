import OpenAI from 'openai';
import {
    CreateTripResponse,
    TripSchema,
    Trip,
    GeneratedTripResponseSchema,
    TripDayDTO,
} from '../models/trip';

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
                        content:
                            'You`re a travel planning system that generates JSON objects for trip itineraries. Each itinerary follows the `TripDay` schema and must include at least 3 events per day. Number of itineraries equals to the numberOfDays value from the request. Ensure that the events match the provided country and cities. Omit IDs from the objects. **TripDay Schema (without IDs):** - `events`: array of Event objects **Event Schema (without IDs):** - `title`: string (minimum 3 characters) - `description`: string (minimum 5 characters) - `address`: string (minimum 5 characters) - `country`: string (minimum 2 characters) - `city`: string (minimum 2 characters) - `tickets`: string (must not be empty) The user will input their request in JSON format: ```json { "numberOfDays": <integer>, "country": "<string>", "cities": ["<string1>", "<string2>", ...] }',
                    },
                    {
                        role: 'user',
                        content:
                            '{ "numberOfDays": 2, "country": "United States of America", "cities": ["New York", "Los Angeles"] }',
                    },
                    {
                        role: 'assistant',
                        content:
                            '[ { "events": [ { "title": "City Tour", "description": "A tour around the city`s historical sites.", "address": "123 Main St, Historical City Center", "country": "United States of America", "city": "New York", "tickets": "Available" }, { "title": "Food Tasting", "description": "Sampling local cuisine at famous restaurants.", "address": "456 Food St, Culinary Corner", "country": "United States of America", "city": "New York", "tickets": "Available" }, { "title": "Park Visit", "description": "A relaxing day at the city`s central park.", "address": "789 Park Ave, Green Zone", "country": "United States of America", "city": "New York", "tickets": "Available" } ] }, { "events": [ { "title": "Museum Visit", "description": "Visit to the city`s famous art museum.", "address": "456 Museum Rd, Art District", "country": "United States of America", "city": "Los Angeles", "tickets": "Sold Out" }, { "title": "Concert", "description": "Live concert at the downtown arena.", "address": "123 Concert Blvd, Music Area", "country": "United States of America", "city": "Los Angeles", "tickets": "Available" }, { "title": "Night Market", "description": "Exploring the city`s vibrant night market.", "address": "789 Market St, Downtown", "country": "United States of America", "city": "Los Angeles", "tickets": "Available" } ] } ]',
                    },
                    {
                        role: 'user',
                        content: `{ "numberOfDays": ${numberOfDays}, "country": ${country}, "cities": [${city}] }`,
                    },
                ],
                response_format: { type: 'json_object' },
            });

            // Check that completion API generated valid trip, regenerate trip if it's not valid
            try {
                const parsedResponse: CreateTripResponse = JSON.parse(
                    completion.choices[0]?.message.content ?? ''
                );

                GeneratedTripResponseSchema.parse(parsedResponse.data);

                const tripDays: TripDayDTO[] = parsedResponse.data;

                return tripDays;
            } catch (error) {
                console.log(
                    'Error while generating trip days. Most likely inappropriate object was generated, retrying.'
                );
                return await this.generateTrip(numberOfDays, country, city);
            }
        } catch (error) {
            console.error(
                'Unexpected error while fetching completion from OpenAI.'
            );
            return null;
        }
    }
}
