// src/services/geoCodingService.ts
import axios from 'axios';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

interface Suggestion {
    place_name: string;
    center: [number, number];
    // Add other fields from Mapbox response as needed
}

export const getSuggestions = async (query: string): Promise<Suggestion[]> => {
    if (!accessToken) {
        console.error('Mapbox access token is missing. Please add it to the environment variables.');
        return [];
    }

    try {
        const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
            {
                params: {
                    access_token: accessToken,
                    autocomplete: true,
                    limit: 5, // Limits the number of suggestions returned for efficiency
                },
            }
        );

        return response.data.features.map((feature: any) => ({
            place_name: feature.place_name,
            center: feature.center,
        }));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return [];
    }
};
