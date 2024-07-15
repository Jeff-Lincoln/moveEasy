const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

interface Coordinates {
    pickupCoordinates: [number, number];
    destinationCoordinates: [number, number];
}

export async function getDirections({ pickupCoordinates, destinationCoordinates }: Coordinates): Promise<number[][]> {
    try {
        const response = await fetch(
            `${BASE_URL}/driving/${pickupCoordinates[0]},${pickupCoordinates[1]};${destinationCoordinates[0]},${destinationCoordinates[1]}?alternatives=false&annotations=distance,duration&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const json = await response.json();

        if (!json.routes || json.routes.length === 0 || !json.routes[0].geometry || !json.routes[0].geometry.coordinates) {
            throw new Error('No route coordinates found');
        }

        return json.routes[0].geometry.coordinates;
    } catch (error) {
        console.error('Error fetching directions:', error);
        throw error; // Re-throw the error for higher-level handling
    }
}



// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// interface Coordinates {
//     pickupCoordinates: [number, number];
//     destinationCoordinates: [number, number];
// }

// export async function getDirections({ pickupCoordinates, destinationCoordinates }: Coordinates): Promise<number[][]> {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupCoordinates[0]},${pickupCoordinates[1]};${destinationCoordinates[0]},${destinationCoordinates[1]}?alternatives=false&annotations=distance,duration&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );
//         const json = await response.json();
//         return json.routes[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }



// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// interface Coordinates {
//     pickupCoordinates: any;
//     destinationCoordinates: any;
//     // accessToken: string;
// }

// export async function getDirections({ pickupCoordinates, destinationCoordinates }: Coordinates): Promise<number[][]> {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupCoordinates[0]},${pickupCoordinates[1]};${destinationCoordinates[0]},${destinationCoordinates[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );
//         const json = await response.json();
//         return json.routes[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }


// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// interface Coordinates {
//     pickupLocation: number[];
//     destination: number[];
// }

// export async function getDirections({ pickupLocation, destination }: Coordinates): Promise<number[][]> {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupLocation[0]},${pickupLocation[1]};${destination[0]},${destination[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );
//         const json = await response.json();
//         return json.routes[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }

// export async function getOrigin() {
//     try {
//         const response = await fetch(
//             `https://api.mapbox.com/search/searchbox/v1/retrieve/dXJuOm1ieHBsYzpMb2gx?session_token=006ec75a-dd34-4bb1-890a-eacb3c60ff51&access_token=pk.eyJ1IjoiamVmZmxpbmNvbG4iLCJhIjoiY2x5OTVoaXh1MG05MTJzc2F5cWMzeXB3YSJ9.hlvBfPhtmDYpMtWZnfiTSQ`
//         );
//         const originJson = await response.json();
//         if (originJson.features && originJson.features.length > 0) {
//             return originJson.features[0].geometry.coordinates;
//         } else {
//             throw new Error('No origin coordinates found in API response');
//         }
//     } catch {
//         throw new Error('Error fetching origin coordinates');
//     }
// }

// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// export async function getDirections(pickupLocation: number[], destination: number[], accessToken: string) {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupLocation[0]},${pickupLocation[1]};${destination[0]},${destination[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${accessToken}`
//         );
//         const json = await response.json();
//         if (json.routes && json.routes.length > 0 && json.routes[0].geometry && json.routes[0].geometry.coordinates) {
//             return json.routes[0].geometry.coordinates;
//         } else {
//             throw new Error('No route coordinates found in API response');
//         }
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }





// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// export async function getDirections(from, to) {
//     const response = await fetch(
//         `${BASE_URL}/driving/${from[0]},${from[1]};${to[0]},${to[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//     );
//     const json = await response.json();
//     return json.routes[0].geometry.coordinates;
// }

// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// interface Coordinates {
//     pickupLocation: number[];
//     destination: number[];
// }

// export async function getDirections({ pickupLocation, destination }: Coordinates): Promise<number[][]> {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupLocation[0]}%2C${pickupLocation[1]}%3B${destination[0]}%2C${destination[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );
//         const json = await response.json();
//         return json.routes[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }


// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// export async function getDirections(pickupLocation: number[], destination: number[], accessToken: string) {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupLocation[0]},${pickupLocation[1]};${destination[0]},${destination[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${accessToken}`
//         );
//         const json = await response.json();
//         if (json.routes && json.routes.length > 0 && json.routes[0].geometry && json.routes[0].geometry.coordinates) {
//             return json.routes[0].geometry.coordinates;
//         } else {
//             throw new Error('No route coordinates found in API response');
//         }
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }


// const BASE_URL = 'https://api.mapbox.com/directions/v5/mapbox';

// export async function getDirections(pickupLocation, destination) {
//     try {
//         const response = await fetch(
//             `${BASE_URL}/driving/${pickupLocation[0]},${pickupLocation[1]};${destination[0]},${destination[1]}?alternatives=false&annotations=distance%2Cduration&geometries=geojson&language=en&overview=full&steps=true&access_token=${accessToken}`
//         );
//         const json = await response.json();
//         return json.routes[0].geometry.coordinates;
//     } catch (error) {
//         console.error('Error fetching directions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }


