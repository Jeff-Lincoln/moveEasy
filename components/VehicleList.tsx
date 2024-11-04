import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

const VehicleList: React.FC = () => {
    const [vehicles, setVehicles] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get('http://YOUR_IP_ADDRESS:8000/api/vehicles/');
                setVehicles(response.data);
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
            }
        };

        fetchVehicles();
    }, []);

    const navigateToDetails = (vehicleName: string) => {
        router.push(`/VehicleDetail?vehicleName=${vehicleName}`);
    };

    return (
        <ScrollView style={styles.container}>
            {vehicles.map((vehicle) => (
                <TouchableOpacity 
                    key={vehicle.id} 
                    style={styles.vehicleCard} 
                    onPress={() => navigateToDetails(vehicle.name)}
                >
                    <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} />
                    <Text style={styles.vehicleName}>{vehicle.name}</Text>
                    <Text style={styles.vehiclePrice}>{vehicle.price}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

export default VehicleList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    vehicleCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginVertical: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    vehicleImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
    },
    vehiclePrice: {
        fontSize: 16,
        color: '#F39C12',
    },
});
