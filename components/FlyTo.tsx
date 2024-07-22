// FlyTo.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Mapbox, { Camera } from '@rnmapbox/maps'; // Import Mapbox Camera for setting map position

interface FlyToProps {
    flyToCoordinates: number[]; // Coordinates to fly the map to
    flyToZoomLevel: number; // Zoom level to apply when flying
}

const FlyTo: React.FC<FlyToProps> = ({ flyToCoordinates, flyToZoomLevel }) => {
    const handleFlyToPress = () => {
        Mapbox.Camera.flyTo({
            centerCoordinate: flyToCoordinates,
            zoomLevel: flyToZoomLevel,
            animationDuration: 2000, // Animation duration in milliseconds (adjust as needed)
        });
    };

    return (
        <TouchableOpacity style={styles.flyToButton} onPress={handleFlyToPress}>
            <Text style={styles.buttonText}>Fly To Location</Text>
        </TouchableOpacity>
    );
};

export default FlyTo;

const styles = StyleSheet.create({
    flyToButton: {
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
