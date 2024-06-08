import OpenAI from 'openai';
import {
    GeneratedTripResponseSchema,
    TripDayDTO
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
                        content: process.env.SYSTEM_PREPROMPT ?? ''
                    },
                    {
                        role: 'user',
                        content:
                            process.env.USER_PREPROMPT ?? ''
                    },
                    {
                        role: 'assistant',
                        content: process.env.ASSISTANT_PREPROMPT ?? ''
                    },
                    {
                        role: 'user',
                        content: `{ "numberOfDays": ${numberOfDays}, "country": ${country}, "cities": [${city}] }`,
                    },
                ]
            });

            // Check that completion API generated valid trip, regenerate trip if it's not valid
            let retries = 0
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
}
