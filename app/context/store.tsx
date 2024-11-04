// store.ts
import { configureStore } from '@reduxjs/toolkit';
import navReducer from './slices/navSlice';
import vehicleReducer from './slices/vehicleSlice';

export const store = configureStore({
  reducer: {
    nav: navReducer,
    vehicle: vehicleReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



// import { configureStore } from '@reduxjs/toolkit';
// import navReducer from './slices/navSlice';
// import vehicleReducer from './slices/vehicleSlice';

// export const store = configureStore({
//   reducer: {
//     nav: navReducer,
//     vehicle: vehicleReducer, // Include the vehicle reducer
//   },
// });

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
