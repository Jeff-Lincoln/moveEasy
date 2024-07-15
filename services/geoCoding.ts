const GEOCODE_BASE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

export async function geoCoding(from: string, to: string): Promise<[[number, number], [number, number]]> {
    try {
        const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY;
        if (!accessToken) {
            throw new Error('Mapbox access token not provided');
        }

        const [geoCodeResponseFrom, geoCodeResponseTo] = await Promise.all([
            fetch(`${GEOCODE_BASE_URL}?q=${encodeURIComponent(from)}&country=ke&types=place&language=en&access_token=${accessToken}`),
            fetch(`${GEOCODE_BASE_URL}?q=${encodeURIComponent(to)}&country=ke&types=place&language=en&access_token=${accessToken}`)
        ]);

        if (!geoCodeResponseFrom.ok || !geoCodeResponseTo.ok) {
            throw new Error('Geocoding request failed');
        }

        const jsonFrom = await geoCodeResponseFrom.json();
        const jsonTo = await geoCodeResponseTo.json();

        const coordinatesFrom = jsonFrom.features?.[0]?.geometry?.coordinates;
        const coordinatesTo = jsonTo.features?.[0]?.geometry?.coordinates;

        if (!coordinatesFrom || !coordinatesTo) {
            throw new Error('No coordinates found for the provided addresses');
        }

        return [coordinatesFrom, coordinatesTo];
    } catch (error) {
        console.error('Geocoding failed:', error);
        throw error;
    }
}


// export async function reverseGeocoding(coordinates: [number, number]): Promise<string> {
//     try {
//         const [longitude, latitude] = coordinates;
//         const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY;
//         if (!accessToken) {
//             throw new Error('Mapbox access token not provided');
//         }

//         const reverseGeoCodeResponse = await fetch(
//             `${REVERSE_GEOCODE_BASE_URL}?types=place&language=en&longitude=${longitude}&latitude=${latitude}&access_token=${accessToken}`
//         );

//         if (!reverseGeoCodeResponse.ok) {
//             throw new Error('Reverse geocoding request failed');
//         }

//         const json = await reverseGeoCodeResponse.json();
//         const placeName = json.features?.[0]?.place_name;

//         if (!placeName) {
//             throw new Error('No place name found for the provided coordinates');
//         }

//         return placeName;
//     } catch (error) {
//         console.error('Reverse geocoding failed:', error);
//         throw error;
//     }
// }




// const GEOCODE_BASE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

// export async function geoCoding(from: string, to: string): Promise<[[number, number], [number, number]]> {
//     try {
//         const geoCodeResponseFrom = await fetch(
//             `${GEOCODE_BASE_URL}?q=${encodeURIComponent(from)}&country=ke&types=place&language=en&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );

//         const geoCodeResponseTo = await fetch(
//             `${GEOCODE_BASE_URL}?q=${encodeURIComponent(to)}&country=ke&types=place&language=en&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );

//         if (!geoCodeResponseFrom.ok || !geoCodeResponseTo.ok) {
//             throw new Error('Geocoding request failed');
//         }

//         const jsonFrom = await geoCodeResponseFrom.json();
//         const jsonTo = await geoCodeResponseTo.json();

//         const coordinatesFrom = jsonFrom.features?.[0]?.geometry?.coordinates;
//         const coordinatesTo = jsonTo.features?.[0]?.geometry?.coordinates;

//         if (!coordinatesFrom || !coordinatesTo) {
//             throw new Error('No coordinates found for the provided addresses');
//         }

//         return [coordinatesFrom, coordinatesTo];
//     } catch (error) {
//         console.error('Geocoding failed:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }



// const GEOCODE_BASE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';
// //='

// export async function geoCoding(from: string, to: string): Promise<[number, number]> {
//     try {
//         const geoCodeResponseFrom = await fetch(
//             `${GEOCODE_BASE_URL}?q=${from && to}&country=ke&types=place&language=en&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );

//         const geoCodeResponseTo = await fetch(
//             `${GEOCODE_BASE_URL}?q=${from && to}&country=ke&types=place&language=en&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );

//         if (!geoCodeResponseFrom.ok) {
//             throw new Error('Geocoding request failed');
//         }

//         const jsonFrom = await geoCodeResponseFrom.json();
//         const jsonTo = await geoCodeResponseTo.json();
//         // console.log(json)

//         if (!json.features || json.features.length === 0 || !json.features[0].geometry || !json.features[0].geometry.coordinates) {
//             throw new Error('No coordinates found for the provided address');
//         }

//         return json.features[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Geocoding failed:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }



// const GEOCODE_BASE_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

// export async function geoCoding(address: string): Promise<[number, number]> {
//     try {
//         const geoCodeResponse = await fetch(
//             `${GEOCODE_BASE_URL}?q=${encodeURIComponent(address)}&country=ke&types=place&language=en&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );
//         const json = await geoCodeResponse.json();
//         return json.features[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Geocoding failed:', error);
//         throw error;
//     }
// }



// const BASE_URL = 'https://api.mapbox.com/search/geocode/v6/forward'


// export async function geoCoding(from: any, to: any) {
//     try {
//         const geoCodeResponse = await fetch(
//             `${BASE_URL}?q=${from}&country=ke&types=place&language=en&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );
//         const json = await geoCodeResponse.json();
//         // console.log(json)
//         return json.features[0].geometry.coordinates;
//         console.log(json);
//     } catch (error) {
//         console.log('Geocoding failed');
//         throw error
//     }
// }