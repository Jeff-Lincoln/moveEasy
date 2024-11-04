import React, { createContext, useContext, useState } from 'react';

// Define the context and a provider component
const VehicleContext = createContext<{ vehicle: any; setVehicle: (vehicle: any) => void } | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vehicle, setVehicle] = useState<any>(null);

    return (
        <VehicleContext.Provider value={{ vehicle, setVehicle }}>
            {children}
        </VehicleContext.Provider>
    );
};

// Custom hook to use the VehicleContext
export const useVehicle = () => {
    const context = useContext(VehicleContext);
    if (!context) {
        throw new Error('useVehicle must be used within a VehicleProvider');
    }
    return context;
};
