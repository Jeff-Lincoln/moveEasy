import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Vehicle {
    id: string;
    name: string;
    type: string;
    image: string;
    description: string;
    capacity: string;
    price: any;
}

interface BookingState {
    selectedVehicle: Vehicle | null;
}

const initialState: BookingState = {
    selectedVehicle: null,
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setSelectedVehicle(state, action: PayloadAction<Vehicle>) {
            state.selectedVehicle = action.payload;
        },
        clearSelectedVehicle(state) {
            state.selectedVehicle = null;
        },
    },
});

export const { setSelectedVehicle, clearSelectedVehicle } =
    bookingSlice.actions;
export default bookingSlice.reducer;

// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// // Define interfaces for our state
// interface BookingState {
//     selectedVehicle: Vehicle | null; // Define the type of selectedVehicle
//     bookings: Booking[];
//     isBookingInProgress: boolean;
// }

// interface Vehicle {
//     id: string;
//     name: string;
//     type: string;
//     image: string;
//     description: string;
//     capacity: string;
//     price: string;
//     laborPrice: string;
//     year: string; // Include any additional fields you need
// }

// interface Booking {
//     id: string;
//     vehicleId: string;
//     vehicleName: string;
//     vehicleType: string;
//     price: string;
//     laborPrice: string;
//     bookingDate: string;
//     status: "pending" | "confirmed" | "completed" | "cancelled";
//     createdAt: string;
// }

// const initialState: BookingState = {
//     selectedVehicle: null,
//     bookings: [],
//     isBookingInProgress: false,
// };

// const bookingSlice = createSlice({
//     name: "booking",
//     initialState,
//     reducers: {
//         setSelectedVehicle: (state, action: PayloadAction<Vehicle>) => {
//             state.selectedVehicle = action.payload;
//         },
//         startBooking: (state) => {
//             state.isBookingInProgress = true;
//         },
//         addBooking: (state, action: PayloadAction<Booking>) => {
//             state.bookings.push(action.payload);
//             state.isBookingInProgress = false;
//         },
//         clearSelectedVehicle: (state) => {
//             state.selectedVehicle = null;
//         },
//         updateBookingStatus: (
//             state,
//             action: PayloadAction<
//                 { bookingId: string; status: Booking["status"] }
//             >,
//         ) => {
//             const booking = state.bookings.find((b) =>
//                 b.id === action.payload.bookingId
//             );
//             if (booking) {
//                 booking.status = action.payload.status;
//             }
//         },
//     },
// });

// export const {
//     setSelectedVehicle,
//     startBooking,
//     addBooking,
//     clearSelectedVehicle,
//     updateBookingStatus,
// } = bookingSlice.actions;

// export default bookingSlice.reducer;
