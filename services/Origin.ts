const SEARCH_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1/suggest';

export async function Search(query: any): Promise<any> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

        const response = await fetch(
            `${SEARCH_BASE_URL}?q=${encodeURIComponent(query)}&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`,
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Search request failed: ${response.status} - ${errorDetails}`);
        }

        const json = await response.json();
        return json.suggestions;
    } catch (error: any) {
        if (error.name === 'AbortError') {
            console.error('Search request timed out:', error);
        } else {
            console.error('Error fetching search suggestions:', error);
        }
        throw error; // Re-throw the error for higher-level handling
    }
}


// const SEARCH_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1/suggest';

// export async function Search(query: string): Promise<any> {
//     try {
//         const response = await fetch(
//             `${SEARCH_BASE_URL}?q=${encodeURIComponent(query)}&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
//         );

//         if (!response.ok) {
//             throw new Error('Search request failed');
//         }

//         const json = await response.json();
//         return json.suggestions;
//     } catch (error) {
//         console.error('Error fetching search suggestions:', error);
//         throw error; // Re-throw the error for higher-level handling
//     }
// }



// // const SEARCH_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1/suggest';

// // export async function Search(query: string): Promise<any> {
// //     try {
// //         const response = await fetch(
// //             `${SEARCH_BASE_URL}?q=${encodeURIComponent(query)}&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`
// //         );
// //         const json = await response.json();
// //         return json.suggestions;
// //     } catch (error) {
// //         console.error('Error fetching search suggestions:', error);
// //         throw error;
// //     }
// // }
