// src/services/geoCodingService.ts
import axios from 'axios';

const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

export const getSuggestions = async (query: string): Promise<any[]> => {
    try {
        const response = await axios.get(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
            {
                params: {
                    access_token: accessToken,
                    autocomplete: true,
                },
            }
        );
        return response.data.features;
    } catch (error) {
        console.error('Error fetching suggestions', error);
        return [];
    }
};
