
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Entypo, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const CalendarsHeader: React.FC = () => {
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation();

    // const onMenuToggle = () => {
    //     navigation.openDrawer();
    // };

    const onLocationPress = () => {
        // Handle location press action
    };

    return (
        <BlurView intensity={70} tint="light" style={[styles.container, { paddingTop: top }]}>
            <TouchableOpacity style={styles.menuButton}>
                <Entypo name="menu" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
                <FontAwesome5 name="calendar-alt" size={24} color="#fff" />
                <Text style={styles.headerTitle}>Schedule Pickup</Text>
            </View>
            <TouchableOpacity style={styles.locationButton} onPress={onLocationPress}>
                <Ionicons name="location-outline" size={20} color="#fff" />
            </TouchableOpacity>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 70,
        backgroundColor: 'transparent',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        elevation: 5, // Shadow effect for Android
        shadowColor: '#000', // Shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    menuButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1e90ff', // Button color
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3, // Shadow effect
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    locationButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ff6347', // Button color
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3, // Shadow effect
    },
});

export default CalendarsHeader;
