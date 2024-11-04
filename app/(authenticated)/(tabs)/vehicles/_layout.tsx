import { Stack } from 'expo-router';
import VehiclesCustomHeader from '@/components/VehiclesCustomHeader';

export default function VehiclesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Default to no header
                gestureEnabled: true,
                gestureDirection: 'horizontal',
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: true, // Explicitly show header for index
                    header: () => <VehiclesCustomHeader />,
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: false, // Explicitly hide header for detail view
                    presentation: 'card',
                }}
            />
        </Stack>
    );
}