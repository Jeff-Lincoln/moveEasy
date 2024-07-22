// GetCenter.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Mapbox, { Camera } from '@rnmapbox/maps'; // Import Mapbox Camera for setting map position

interface GetCenterProps {
    centerCoordinates: number[]; // Coordinates to center the map on
    centerZoomLevel: number; // Zoom level to apply when centering
}

const GetCenter: React.FC<GetCenterProps> = ({ centerCoordinates, centerZoomLevel }) => {
    const handleCenterPress = () => {
        Mapbox.Camera.setCamera({
            centerCoordinate: centerCoordinates,
            zoomLevel: centerZoomLevel,
        });
    };

    return (
        <TouchableOpacity style={styles.centerButton} onPress={handleCenterPress}>
            <Text style={styles.buttonText}>Center Map</Text>
        </TouchableOpacity>
    );
};

export default GetCenter;

const styles = StyleSheet.create({
    centerButton: {
        backgroundColor: '#007AFF',
        borderRadius: 50,
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
