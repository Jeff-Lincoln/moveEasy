import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface Vehicle {
  id: string;
  name: string;
  type: string;
  capacity: string;
  price: string;
}

interface Booking {
  origin: Location | null;
  destination: Location | null;
  selectedVehicle: Vehicle | null;
  dateTime: { date: string; time: string } | null;
  distance: number | null;
  duration: number | null;
}

interface NavState {
  origin: Location | null;
  destination: Location | null;
  selectedVehicle: Vehicle | null;
  dateTime: { date: string; time: string } | null;
  items: string[];
  distance: number | null;
  duration: number | null;
  bookings: Booking[]; // Added bookings array to store each booking
}

const initialState: NavState = {
  origin: null,
  destination: null,
  selectedVehicle: null,
  dateTime: null,
  items: [],
  distance: null,
  duration: null,
  bookings: [], // Initialize as empty array
};

const navSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setOrigin: (state, action: PayloadAction<any | null>) => {
      state.origin = action.payload;
    },
    setDestination: (state, action: PayloadAction<any | null>) => {
      state.destination = action.payload;
    },
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    },
    setDateTime: (state, action: PayloadAction<{ date: string; time: string } | null>) => {
      state.dateTime = action.payload;
    },
    setItems: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    setDistance: (state, action: PayloadAction<number | null>) => {
      state.distance = action.payload;
    },
    setDuration: (state, action: PayloadAction<number | null>) => {
      state.duration = action.payload;
    },
    resetNavigation: (state) => {
      state.origin = null;
      state.destination = null;
      state.selectedVehicle = null;
      state.dateTime = null;
      state.items = [];
      state.distance = null;
      state.duration = null;
    },
    bookVehicle: (state) => {
      // Add the current state as a new booking
      const newBooking: Booking = {
        origin: state.origin,
        destination: state.destination,
        selectedVehicle: state.selectedVehicle,
        dateTime: state.dateTime,
        distance: state.distance,
        duration: state.duration,
      };
      state.bookings.push(newBooking); // Save the booking
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setSelectedVehicle,
  setDateTime,
  setItems,
  setDistance,
  setDuration,
  resetNavigation,
  bookVehicle, // Export the new action
} = navSlice.actions;

export default navSlice.reducer;


// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface Location {
//   latitude: number;
//   longitude: number;
//   address: string;
// }

// interface Vehicle {
//   id: string;
//   name: string;
//   type: string;
//   capacity: string;
//   price: string;
// }

// interface NavState {
//   origin: Location | null;
//   destination: Location | null;
//   selectedVehicle: Vehicle | null; // Updated to be selectedVehicle instead of vehicle
//   dateTime: { date: string; time: string } | null;
//   items: string[];
//   distance: number | null; // in miles or kilometers
//   duration: number | null; // in minutes
// }

// const initialState: NavState = {
//   origin: null,
//   destination: null,
//   selectedVehicle: null, // Initialize as null
//   dateTime: null,
//   items: [],
//   distance: null,
//   duration: null,
// };

// const navSlice = createSlice({
//   name: 'navigation',
//   initialState,
//   reducers: {
//     setOrigin: (state, action: PayloadAction<any | null>) => {
//       state.origin = action.payload;
//     },
//     setDestination: (state, action: PayloadAction<any | null>) => {
//       state.destination = action.payload;
//     },
//     setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
//       state.selectedVehicle = action.payload; // Update to selectedVehicle
//     },
//     setDateTime: (state, action: PayloadAction<{ date: string; time: string } | null>) => {
//       state.dateTime = action.payload;
//     },
//     setItems: (state, action: PayloadAction<string[]>) => {
//       state.items = action.payload;
//     },
//     setDistance: (state, action: PayloadAction<number | null>) => {
//       state.distance = action.payload;
//     },
//     setDuration: (state, action: PayloadAction<number | null>) => {
//       state.duration = action.payload;
//     },
//     resetNavigation: (state) => {
//       state.origin = null;
//       state.destination = null;
//       state.selectedVehicle = null; // Reset selectedVehicle
//       state.dateTime = null;
//       state.items = [];
//       state.distance = null;
//       state.duration = null;
//     },
//   },
// });

// export const {
//   setOrigin,
//   setDestination,
//   setSelectedVehicle, // Updated action name
//   setDateTime,
//   setItems,
//   setDistance,
//   setDuration,
//   resetNavigation,
// } = navSlice.actions;

// export default navSlice.reducer;



// // // slices/navSlice.ts
// // import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// // interface Location {
// //   latitude: number;
// //   longitude: number;
// //   address: string;
// // }

// // interface Vehicle {
// //   id: string;
// //   name: string;
// //   type: string;
// //   capacity: string;
// //   price: string;
// // }

// // type VehicleState = {
// //   selectedVehicle: Vehicle | null;
// // };

// // interface NavState {
// //   origin: any | null;
// //   destination: any | null;
// //   vehicle: Vehicle | null;
// //   dateTime: { date: string; time: string } | null;
// //   items: string[];
// //   distance: number | null; // in miles or kilometers
// //   duration: number | null; // in minutes
// // }

// // const initialState: NavState = {
// //   origin: null,
// //   destination: null,
// //   vehicle: null,
// //   dateTime: null,
// //   items: [],
// //   distance: null,
// //   duration: null,
// // };

// // const navSlice = createSlice({
// //   name: 'navigation',
// //   initialState,
// //   reducers: {
// //     setOrigin: (state, action: PayloadAction<any | null>) => {
// //       state.origin = action.payload;
// //     },
// //     setDestination: (state, action: PayloadAction<any | null>) => {
// //       state.destination = action.payload;
// //     },
// //     setVehicle: (state, action: PayloadAction<Vehicle | null>) => {
// //       state.vehicle = action.payload;
// //     },
// //     setDateTime: (state, action: PayloadAction<{ date: string; time: string } | null>) => {
// //       state.dateTime = action.payload;
// //     },
// //     setItems: (state, action: PayloadAction<string[]>) => {
// //       state.items = action.payload;
// //     },
// //     setDistance: (state, action: PayloadAction<number | null>) => {
// //       state.distance = action.payload;
// //     },
// //     setDuration: (state, action: PayloadAction<number | null>) => {
// //       state.duration = action.payload;
// //     },
// //     resetNavigation: (state) => {
// //       state.origin = null;
// //       state.destination = null;
// //       state.vehicle = null;
// //       state.dateTime = null;
// //       state.items = [];
// //       state.distance = null;
// //       state.duration = null;
// //     },
// //   },
// // });

// // export const {
// //   setOrigin,
// //   setDestination,
// //   setVehicle,
// //   setDateTime,
// //   setItems,
// //   setDistance,
// //   setDuration,
// //   resetNavigation,
// // } = navSlice.actions;

// // export default navSlice.reducer;





// // // // slices/navSlice.ts
// // // import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// // // interface Location {
// // //   latitude: number;
// // //   longitude: number;
// // // }

// // // interface NavState {
// // //   origin: any | null;
// // //   destination: any | null;
// // //   vehicle: string | null;
// // //   dateTime: string | null;
// // //   items: string[];
// // // }

// // // const initialState: NavState = {
// // //   origin: null,
// // //   destination: null,
// // //   vehicle: null,
// // //   dateTime: null,
// // //   items: [],
// // // };

// // // const navSlice = createSlice({
// // //   name: 'navigation',
// // //   initialState,
// // //   reducers: {
// // //     setOrigin: (state, action: PayloadAction<any | null>) => {
// // //       state.origin = action.payload;
// // //     },
// // //     setDestination: (state, action: PayloadAction<any | null>) => {
// // //       state.destination = action.payload;
// // //     },
// // //     setVehicle: (state, action: PayloadAction<string | null>) => {
// // //       state.vehicle = action.payload;
// // //     },
// // //     setDateTime: (state, action: PayloadAction<string | null>) => {
// // //       state.dateTime = action.payload;
// // //     },
// // //     setItems: (state, action: PayloadAction<string[]>) => {
// // //       state.items = action.payload;
// // //     },
// // //     resetNavigation: (state) => {
// // //       state.origin = null;
// // //       state.destination = null;
// // //       state.vehicle = null;
// // //       state.dateTime = null;
// // //       state.items = [];
// // //     },
// // //   },
// // // });

// // // export const { setOrigin, setDestination, setVehicle, setDateTime, setItems, resetNavigation } = navSlice.actions;

// // // export default navSlice.reducer;

// // // 4

// // // // import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// // // // // Define location structure
// // // // interface Location {
// // // //     latitude: number;
// // // //     longitude: number;
// // // //     description?: string;
// // // //     address?: string;
// // // // }

// // // // // Define travel time information structure
// // // // interface TravelTimeInfo {
// // // //     distance: {
// // // //         text: string;
// // // //         value: number; // in meters
// // // //     };
// // // //     duration: {
// // // //         text: string;
// // // //         value: number; // in seconds
// // // //     };
// // // //     status: string;
// // // // }

// // // // // Define vehicle structure
// // // // interface Vehicle {
// // // //     type: string;
// // // //     price: number;
// // // // }

// // // // // Define navigation state
// // // // interface NavState {
// // // //     origin: Location | null;
// // // //     destination: Location | null;
// // // //     travelTimeInformation: TravelTimeInfo | null;
// // // //     distance: string | null; 
// // // //     duration: string | null;
// // // //     rawDistance: number | null;
// // // //     rawDuration: number | null;
// // // //     vehicle: Vehicle | null; // New property for vehicle
// // // //     dateTime: string | null; // New property for date and time
// // // //     items: string[]; // New property for checklist items
// // // // }

// // // // // Initial state
// // // // const initialState: NavState = {
// // // //     origin: null,
// // // //     destination: null,
// // // //     travelTimeInformation: null,
// // // //     distance: null,
// // // //     duration: null,
// // // //     rawDistance: null,
// // // //     rawDuration: null,
// // // //     vehicle: null,
// // // //     dateTime: null,
// // // //     items: [],
// // // // };

// // // // // Create slice
// // // // const navSlice = createSlice({
// // // //     name: 'navigation',
// // // //     initialState,
// // // //     reducers: {
// // // //         setOrigin: (state, action: PayloadAction<Location | null>) => {
// // // //             state.origin = action.payload;
// // // //         },
// // // //         setDestination: (state, action: PayloadAction<Location | null>) => {
// // // //             state.destination = action.payload;
// // // //         },
// // // //         setTravelTimeInformation: (state, action: PayloadAction<TravelTimeInfo | null>) => {
// // // //             state.travelTimeInformation = action.payload;
// // // //             if (action.payload) {
// // // //                 state.distance = action.payload.distance.text;
// // // //                 state.duration = action.payload.duration.text;
// // // //                 state.rawDistance = action.payload.distance.value;
// // // //                 state.rawDuration = action.payload.duration.value;
// // // //             } else {
// // // //                 state.distance = null;
// // // //                 state.duration = null;
// // // //                 state.rawDistance = null;
// // // //                 state.rawDuration = null;
// // // //             }
// // // //         },
// // // //         setVehicle: (state, action: PayloadAction<Vehicle | null>) => {
// // // //             state.vehicle = action.payload;
// // // //         },
// // // //         setDateTime: (state, action: PayloadAction<string | null>) => {
// // // //             state.dateTime = action.payload;
// // // //         },
// // // //         setItems: (state, action: PayloadAction<string[]>) => {
// // // //             state.items = action.payload;
// // // //         },
// // // //         resetNavigation: (state) => {
// // // //             state.origin = null;
// // // //             state.destination = null;
// // // //             state.travelTimeInformation = null;
// // // //             state.distance = null;
// // // //             state.duration = null;
// // // //             state.rawDistance = null;
// // // //             state.rawDuration = null;
// // // //             state.vehicle = null;
// // // //             state.dateTime = null;
// // // //             state.items = [];
// // // //         },
// // // //     },
// // // // });

// // // // // Export actions
// // // // export const { 
// // // //     setOrigin, 
// // // //     setDestination, 
// // // //     setTravelTimeInformation, 
// // // //     setVehicle, 
// // // //     setDateTime, 
// // // //     setItems, 
// // // //     resetNavigation 
// // // // } = navSlice.actions;

// // // // // Export reducer
// // // // export default navSlice.reducer;

// // // // // Selectors
// // // // export const selectOrigin = (state: { navigation: NavState }) => state.navigation.origin;
// // // // export const selectDestination = (state: { navigation: NavState }) => state.navigation.destination;
// // // // export const selectTravelTimeInformation = (state: { navigation: NavState }) => state.navigation.travelTimeInformation;
// // // // export const selectDistance = (state: { navigation: NavState }) => state.navigation.distance;
// // // // export const selectDuration = (state: { navigation: NavState }) => state.navigation.duration;
// // // // export const selectRawDistance = (state: { navigation: NavState }) => state.navigation.rawDistance;
// // // // export const selectRawDuration = (state: { navigation: NavState }) => state.navigation.rawDuration;
// // // // export const selectVehicle = (state: { navigation: NavState }) => state.navigation.vehicle;
// // // // export const selectDateTime = (state: { navigation: NavState }) => state.navigation.dateTime;
// // // // export const selectItems = (state: { navigation: NavState }) => state.navigation.items;

// // // // // Memoized selectors
// // // // export const selectHasValidRoute = createSelector(
// // // //     [selectOrigin, selectDestination, selectDistance],
// // // //     (origin, destination, distance) => Boolean(origin && destination && distance)
// // // // );

// // // // // Helper functions
// // // // export const formatDistance = (meters: number): string => 
// // // //     meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

// // // // export const formatDuration = (seconds: number): string => {
// // // //     if (seconds < 60) return `${seconds}s`;
// // // //     const minutes = Math.floor(seconds / 60);
// // // //     if (minutes < 60) return `${minutes}min`;
// // // //     const hours = Math.floor(minutes / 60);
// // // //     const remainingMinutes = minutes % 60;
// // // //     return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
// // // // };







// // // // // // navSlice.ts

// // // // // import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// // // // // // Define location structure
// // // // // interface Location {
// // // // //   latitude: number;
// // // // //   longitude: number;
// // // // //   description?: string;
// // // // //   address?: string;
// // // // // }

// // // // // interface TravelTimeInfo {
// // // // //   distance: {
// // // // //     text: string;
// // // // //     value: number; // in meters
// // // // //   };
// // // // //   duration: {
// // // // //     text: string;
// // // // //     value: number; // in seconds
// // // // //   };
// // // // //   status: string;
// // // // // }

// // // // // // Define navigation state
// // // // // interface NavState {
// // // // //   origin: Location | null;
// // // // //   destination: Location | null;
// // // // //   travelTimeInformation: TravelTimeInfo | null;
// // // // //   distance: string | null; 
// // // // //   duration: string | null;
// // // // //   rawDistance: number | null;
// // // // //   rawDuration: number | null;
// // // // // }

// // // // // // Initial state
// // // // // const initialState: NavState = {
// // // // //   origin: null,
// // // // //   destination: null,
// // // // //   travelTimeInformation: null,
// // // // //   distance: null,
// // // // //   duration: null,
// // // // //   rawDistance: null,
// // // // //   rawDuration: null,
// // // // // };

// // // // // // Create slice
// // // // // const navSlice = createSlice({
// // // // //   name: 'navigation',
// // // // //   initialState,
// // // // //   reducers: {
// // // // //     setOrigin: (state, action: PayloadAction<any>) => {
// // // // //       state.origin = action.payload;
// // // // //     },
// // // // //     setDestination: (state, action: PayloadAction<any | null>) => {
// // // // //       state.destination = action.payload;
// // // // //     },
// // // // //     setTravelTimeInformation: (state, action: PayloadAction<TravelTimeInfo | null>) => {
// // // // //       state.travelTimeInformation = action.payload;
// // // // //       if (action.payload) {
// // // // //         state.distance = action.payload.distance.text;
// // // // //         state.duration = action.payload.duration.text;
// // // // //         state.rawDistance = action.payload.distance.value;
// // // // //         state.rawDuration = action.payload.duration.value;
// // // // //       } else {
// // // // //         state.distance = null;
// // // // //         state.duration = null;
// // // // //         state.rawDistance = null;
// // // // //         state.rawDuration = null;
// // // // //       }
// // // // //     },
// // // // //     resetNavigation: (state) => {
// // // // //       state.origin = null;
// // // // //       state.destination = null;
// // // // //       state.travelTimeInformation = null;
// // // // //       state.distance = null;
// // // // //       state.duration = null;
// // // // //       state.rawDistance = null;
// // // // //       state.rawDuration = null;
// // // // //     },
// // // // //   },
// // // // // });

// // // // // // Export actions
// // // // // export const { setOrigin, setDestination, setTravelTimeInformation, resetNavigation } = navSlice.actions;

// // // // // // Export reducer
// // // // // export default navSlice.reducer;

// // // // // // Selectors
// // // // // export const selectOrigin = (state: { navigation: NavState }) => state.navigation.origin;
// // // // // export const selectDestination = (state: { navigation: NavState }) => state.navigation.destination;
// // // // // export const selectTravelTimeInformation = (state: { navigation: NavState }) => state.navigation.travelTimeInformation;
// // // // // export const selectDistance = (state: { navigation: NavState }) => state.navigation.distance;
// // // // // export const selectDuration = (state: { navigation: NavState }) => state.navigation.duration;
// // // // // export const selectRawDistance = (state: { navigation: NavState }) => state.navigation.rawDistance;
// // // // // export const selectRawDuration = (state: { navigation: NavState }) => state.navigation.rawDuration;

// // // // // // Memoized selectors
// // // // // export const selectHasValidRoute = createSelector(
// // // // //   [selectOrigin, selectDestination, selectDistance],
// // // // //   (origin, destination, distance) => Boolean(origin && destination && distance)
// // // // // );

// // // // // export const selectFormattedDistance = createSelector(
// // // // //   [selectRawDistance],
// // // // //   (rawDistance) => rawDistance ? formatDistance(rawDistance) : null
// // // // // );

// // // // // export const selectFormattedDuration = createSelector(
// // // // //   [selectRawDuration],
// // // // //   (rawDuration) => rawDuration ? formatDuration(rawDuration) : null
// // // // // );

// // // // // // Helper functions
// // // // // export const formatDistance = (meters: number): string => 
// // // // //   meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

// // // // // export const formatDuration = (seconds: number): string => {
// // // // //   if (seconds < 60) return `${seconds}s`;
// // // // //   const minutes = Math.floor(seconds / 60);
// // // // //   if (minutes < 60) return `${minutes}min`;
// // // // //   const hours = Math.floor(minutes / 60);
// // // // //   const remainingMinutes = minutes % 60;
// // // // //   return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
// // // // // };




// // // // // // import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// // // // // // // Define the structure of your location state
// // // // // // interface Location {
// // // // // //   latitude: number;
// // // // // //   longitude: number;
// // // // // //   description?: string;
// // // // // //   address?: string;
// // // // // // }

// // // // // // interface TravelTimeInfo {
// // // // // //   distance: {
// // // // // //     text: string;
// // // // // //     value: number;  // in meters
// // // // // //   };
// // // // // //   duration: {
// // // // // //     text: string;
// // // // // //     value: number;  // in seconds
// // // // // //   };
// // // // // //   status: string;
// // // // // // }

// // // // // // // Define the initial state for navigation
// // // // // // interface NavState {
// // // // // //   origin: Location | null;
// // // // // //   destination: Location | null;
// // // // // //   travelTimeInformation: TravelTimeInfo | null;
// // // // // //   distance: string | null;  // formatted distance (e.g., "5.2 km")
// // // // // //   duration: string | null;  // formatted duration (e.g., "15 mins")
// // // // // //   rawDistance: number | null;  // distance in meters
// // // // // //   rawDuration: number | null;  // duration in seconds
// // // // // // }

// // // // // // // Set the initial state
// // // // // // const initialState: NavState = {
// // // // // //   origin: null,
// // // // // //   destination: null,
// // // // // //   travelTimeInformation: null,
// // // // // //   distance: null,
// // // // // //   duration: null,
// // // // // //   rawDistance: null,
// // // // // //   rawDuration: null,
// // // // // // };

// // // // // // // Create the navigation slice
// // // // // // const navigationSlice = createSlice({
// // // // // //   name: 'navigation',
// // // // // //   initialState,
// // // // // //   reducers: {
// // // // // //     setOrigin: (state, action: PayloadAction<Location | null>) => {
// // // // // //       state.origin = action.payload;
// // // // // //     },
// // // // // //     setDestination: (state, action: PayloadAction<Location | null>) => {
// // // // // //       state.destination = action.payload;
// // // // // //     },
// // // // // //     setTravelTimeInformation: (state, action: PayloadAction<TravelTimeInfo | null>) => {
// // // // // //       state.travelTimeInformation = action.payload;
// // // // // //       if (action.payload) {
// // // // // //         state.distance = action.payload.distance.text;
// // // // // //         state.duration = action.payload.duration.text;
// // // // // //         state.rawDistance = action.payload.distance.value;
// // // // // //         state.rawDuration = action.payload.duration.value;
// // // // // //       } else {
// // // // // //         state.distance = null;
// // // // // //         state.duration = null;
// // // // // //         state.rawDistance = null;
// // // // // //         state.rawDuration = null;
// // // // // //       }
// // // // // //     },
// // // // // //     resetNavigation: () => initialState,
// // // // // //   },
// // // // // // });

// // // // // // // Export actions
// // // // // // export const { setOrigin, setDestination, setTravelTimeInformation, resetNavigation } = navigationSlice.actions;

// // // // // // // Export the reducer
// // // // // // export default navigationSlice.reducer;

// // // // // // // Selectors for accessing the state
// // // // // // export const selectOrigin = (state: { navigation: NavState }) => state.navigation.origin;
// // // // // // export const selectDestination = (state: { navigation: NavState }) => state.navigation.destination;
// // // // // // export const selectTravelTimeInformation = (state: { navigation: NavState }) => state.navigation.travelTimeInformation;
// // // // // // export const selectDistance = (state: { navigation: NavState }) => state.navigation.distance;
// // // // // // export const selectDuration = (state: { navigation: NavState }) => state.navigation.duration;
// // // // // // export const selectRawDistance = (state: { navigation: NavState }) => state.navigation.rawDistance;
// // // // // // export const selectRawDuration = (state: { navigation: NavState }) => state.navigation.rawDuration;

// // // // // // // Derived selectors for checking valid routes
// // // // // // export const selectHasValidRoute = (state: { navigation: NavState }) => 
// // // // // //   Boolean(state.navigation.origin && state.navigation.destination && state.navigation.distance);

// // // // // // // Helper functions to format distance and duration
// // // // // // export const formatDistance = (meters: number): string => 
// // // // // //   meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

// // // // // // export const formatDuration = (seconds: number): string => {
// // // // // //   if (seconds < 60) return `${seconds}s`;
// // // // // //   const minutes = Math.floor(seconds / 60);
// // // // // //   if (minutes < 60) return `${minutes}min`;
// // // // // //   const hours = Math.floor(minutes / 60);
// // // // // //   const remainingMinutes = minutes % 60;
// // // // // //   return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
// // // // // // };



// // // // // // // import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// // // // // // // import { RootState } from '../store';

// // // // // // // interface Location {
// // // // // // //   latitude: number;
// // // // // // //   longitude: number;
// // // // // // //   description?: string;
// // // // // // //   address?: string;
// // // // // // // }

// // // // // // // interface TravelTimeInfo {
// // // // // // //   distance: {
// // // // // // //     text: string;
// // // // // // //     value: number;  // in meters
// // // // // // //   };
// // // // // // //   duration: {
// // // // // // //     text: string;
// // // // // // //     value: number;  // in seconds
// // // // // // //   };
// // // // // // //   status: string;
// // // // // // // }

// // // // // // // interface NavState {
// // // // // // //   origin: Location | null;
// // // // // // //   destination: Location | null;
// // // // // // //   travelTimeInformation: TravelTimeInfo | null;
// // // // // // //   distance: string | null;  // formatted distance (e.g., "5.2 km")
// // // // // // //   duration: string | null;  // formatted duration (e.g., "15 mins")
// // // // // // //   rawDistance: number | null;  // distance in meters
// // // // // // //   rawDuration: number | null;  // duration in seconds
// // // // // // // }

// // // // // // // const initialState: NavState = {
// // // // // // //   origin: null,
// // // // // // //   destination: null,
// // // // // // //   travelTimeInformation: null,
// // // // // // //   distance: null,
// // // // // // //   duration: null,
// // // // // // //   rawDistance: null,
// // // // // // //   rawDuration: null,
// // // // // // // };

// // // // // // // export const navSlice = createSlice({
// // // // // // //   name: 'nav',
// // // // // // //   initialState,
// // // // // // //   reducers: {
// // // // // // //     setOrigin: (state, action: PayloadAction<Location | null>) => {
// // // // // // //       state.origin = action.payload;
// // // // // // //     },
// // // // // // //     setDestination: (state, action: PayloadAction<Location | null>) => {
// // // // // // //       state.destination = action.payload;
// // // // // // //     },
// // // // // // //     setTravelTimeInformation: (state, action: PayloadAction<TravelTimeInfo | null>) => {
// // // // // // //       state.travelTimeInformation = action.payload;
// // // // // // //       if (action.payload) {
// // // // // // //         state.distance = action.payload.distance.text;
// // // // // // //         state.duration = action.payload.duration.text;
// // // // // // //         state.rawDistance = action.payload.distance.value;
// // // // // // //         state.rawDuration = action.payload.duration.value;
// // // // // // //       } else {
// // // // // // //         state.distance = null;
// // // // // // //         state.duration = null;
// // // // // // //         state.rawDistance = null;
// // // // // // //         state.rawDuration = null;
// // // // // // //       }
// // // // // // //     },
// // // // // // //     setDistance: (state, action: PayloadAction<{ formatted: string; value: number }>) => {
// // // // // // //       state.distance = action.payload.formatted;
// // // // // // //       state.rawDistance = action.payload.value;
// // // // // // //     },
// // // // // // //     setDuration: (state, action: PayloadAction<{ formatted: string; value: number }>) => {
// // // // // // //       state.duration = action.payload.formatted;
// // // // // // //       state.rawDuration = action.payload.value;
// // // // // // //     },
// // // // // // //     resetNavigation: () => initialState,
// // // // // // //   },
// // // // // // // });

// // // // // // // // Action creators
// // // // // // // export const {
// // // // // // //   setOrigin,
// // // // // // //   setDestination,
// // // // // // //   setTravelTimeInformation,
// // // // // // //   setDistance,
// // // // // // //   setDuration,
// // // // // // //   resetNavigation,
// // // // // // // } = navSlice.actions;

// // // // // // // // Selectors
// // // // // // // export const selectOrigin = (state: RootState) => state.nav.origin;
// // // // // // // export const selectDestination = (state: RootState) => state.nav.destination;
// // // // // // // export const selectTravelTimeInformation = (state: RootState) => state.nav.travelTimeInformation;
// // // // // // // export const selectDistance = (state: RootState) => state.nav.distance;
// // // // // // // export const selectDuration = (state: RootState) => state.nav.duration;
// // // // // // // export const selectRawDistance = (state: RootState) => state.nav.rawDistance;
// // // // // // // export const selectRawDuration = (state: RootState) => state.nav.rawDuration;

// // // // // // // // Derived selectors
// // // // // // // export const selectHasValidRoute = (state: RootState) => 
// // // // // // //   Boolean(state.nav.origin && state.nav.destination && state.nav.distance);

// // // // // // // export const selectFormattedTravelInfo = (state: RootState) => {
// // // // // // //   const distance = state.nav.distance;
// // // // // // //   const duration = state.nav.duration;
// // // // // // //   return distance && duration ? `${distance} (${duration})` : null;
// // // // // // // };

// // // // // // // // Helper functions
// // // // // // // export const formatDistance = (meters: number): string => 
// // // // // // //   meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;

// // // // // // // export const formatDuration = (seconds: number): string => {
// // // // // // //   if (seconds < 60) return `${seconds}s`;
// // // // // // //   const minutes = Math.floor(seconds / 60);
// // // // // // //   if (minutes < 60) return `${minutes}min`;
// // // // // // //   const hours = Math.floor(minutes / 60);
// // // // // // //   const remainingMinutes = minutes % 60;
// // // // // // //   return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
// // // // // // // };

// // // // // // // export default navSlice.reducer;


// // // // // // // // import { createSlice } from '@reduxjs/toolkit';

// // // // // // // // const initialState = {
// // // // // // // //     origin: null,
// // // // // // // //     destination: null,
// // // // // // // //     travelTimeInformation: null,
// // // // // // // //     distance: null, // Add distance
// // // // // // // //     duration: null, // Add duration
// // // // // // // // };

// // // // // // // // export const navSlice = createSlice({
// // // // // // // //     name: 'nav',
// // // // // // // //     initialState,
// // // // // // // //     reducers: {
// // // // // // // //         setOrigin: (state, action) => {
// // // // // // // //             state.origin = action.payload;
// // // // // // // //         },
// // // // // // // //         setDestination: (state, action) => {
// // // // // // // //             state.destination = action.payload;
// // // // // // // //         },
// // // // // // // //         setTravelTimeInformation: (state, action) => {
// // // // // // // //             state.travelTimeInformation = action.payload;
// // // // // // // //         },
// // // // // // // //         setDistance: (state, action) => { // Add reducer for distance
// // // // // // // //             state.distance = action.payload;
// // // // // // // //         },
// // // // // // // //         setDuration: (state, action) => { // Add reducer for duration
// // // // // // // //             state.duration = action.payload;
// // // // // // // //         },
// // // // // // // //     },
// // // // // // // // });

// // // // // // // // export const { setOrigin, setDestination, setTravelTimeInformation, setDistance, setDuration } = navSlice.actions;

// // // // // // // // // Selectors
// // // // // // // // export const selectOrigin = (state) => state.nav.origin;
// // // // // // // // export const selectDestination = (state) => state.nav.destination;
// // // // // // // // export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation;
// // // // // // // // export const selectDistance = (state) => state.nav.distance; // Selector for distance
// // // // // // // // export const selectDuration = (state) => state.nav.duration; // Selector for duration

// // // // // // // // export default navSlice.reducer;



// // // // // // // // // import { createSlice } from '@reduxjs/toolkit';

// // // // // // // // // const initialState = {
// // // // // // // // //     origin: null,
// // // // // // // // //     destination: null,
// // // // // // // // //     travelTimeInformation: null,
// // // // // // // // // };

// // // // // // // // // export const navSlice = createSlice({
// // // // // // // // //     name: 'nav',
// // // // // // // // //     initialState,
// // // // // // // // //     reducers: {  // Corrected this line from 'reducer' to 'reducers'
// // // // // // // // //         setOrigin: (state, action) => {
// // // // // // // // //             state.origin = action.payload;
// // // // // // // // //         },
// // // // // // // // //         setDestination: (state, action) => {
// // // // // // // // //             state.destination = action.payload;
// // // // // // // // //         },
// // // // // // // // //         setTravelTimeInformation: (state, action) => {
// // // // // // // // //             state.travelTimeInformation = action.payload;
// // // // // // // // //         },
// // // // // // // // //     },
// // // // // // // // // });

// // // // // // // // // export const { setOrigin, setDestination, setTravelTimeInformation } = navSlice.actions;

// // // // // // // // // // Selectors
// // // // // // // // // export const selectOrigin = (state) => state.nav.origin;
// // // // // // // // // export const selectDestination = (state) => state.nav.destination;
// // // // // // // // // export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation;

// // // // // // // // // export default navSlice.reducer;



// // // // // // // // // // import { createSlice } from '@reduxjs/toolkit'

// // // // // // // // // // const initialState = {
// // // // // // // // // //     origin: null,
// // // // // // // // // //     destination: null,
// // // // // // // // // //     travelTimeInformation: null,
// // // // // // // // // // }

// // // // // // // // // // export const navSlice = createSlice({
// // // // // // // // // //     name: 'nav',
// // // // // // // // // //     initialState,
// // // // // // // // // //     reducer: {
// // // // // // // // // //         setOrigin: (state, action) => {
// // // // // // // // // //             state.origin = action.payload;
// // // // // // // // // //         },
// // // // // // // // // //         setDestination: (state, action) => {
// // // // // // // // // //             state.destination = action.payload;
// // // // // // // // // //         },
// // // // // // // // // //         setTravelTimeInformation: (state, action) => {
// // // // // // // // // //             state.travelTimeInformation = action.payload;
// // // // // // // // // //         }
// // // // // // // // // //     }
// // // // // // // // // // });

// // // // // // // // // // export const { setOrigin, setDestination, setTravelTimeInformation } = navSlice.actions;

// // // // // // // // // // //selectors

// // // // // // // // // // export const selectOrigin = (state) => state.nav.origin;
// // // // // // // // // // export const selectDestination = (state) => state.nav.destination;
// // // // // // // // // // export const selectTravelTimeInformation = (state) => state.nav.travelTimeInformation;

// // // // // // // // // // export default navSlice.reducer;