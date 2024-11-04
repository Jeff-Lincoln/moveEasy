// slices/vehicleSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Vehicle {
  type: string;
  price: number;
}

const initialState: Vehicle | null = null;

const vehicleSlice = createSlice({
  name: 'vehicle',
  initialState,
  reducers: {
    setVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      return action.payload;
    },
    resetVehicle: () => initialState,
  },
});

export const { setVehicle, resetVehicle } = vehicleSlice.actions;

export default vehicleSlice.reducer;