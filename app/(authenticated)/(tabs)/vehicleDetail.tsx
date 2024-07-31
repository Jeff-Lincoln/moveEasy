import React, { useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useHeaderHeight } from '@react-navigation/elements';
import { StatusBar } from 'expo-status-bar';

const VehicleDetail: React.FC = () => {
    const router = useRouter();
    const { vehicleName } = useLocalSearchParams();
    const headerHeight = useHeaderHeight();

    const onPressContinueButton = () => {
        router.push('CalendarScreen')
    }
    const onPressBackButton = () => {
        router.push('vehicles')
    }

    const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
        'Pick up Truck': {
            year: '2020',
            type: 'Full Size Truck',
            description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
            image: 'https://tinyurl.com/yvxmpyjr',
            price: '25,000 Kshs + 2,000 Kshs per labor min'
        },
        'Van': {
            year: '2019',
            type: 'Standard',
            description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
            image: 'https://shorturl.at/vs0Bd',
            price: '15,000 Kshs + 1,500 Kshs per labor min'
        },
        'Truck': {
            year: '2018',
            type: 'Standard',
            description: 'A reliable truck with ample storage space, ideal for most moving needs.',
            image: 'https://shorturl.at/sIr0z',
            price: '20,000 Kshs + 1,800 Kshs per labor min'
        },
        'Truck XL': {
            year: '2021',
            type: 'Extra Large',
            description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
            image: 'https://tinyurl.com/ywzbrk7y',
            price: '30,000 Kshs + 2,500 Kshs per labor min'
        },
    };

    const vehicle = vehicleDetails[vehicleName as string];

    if (!vehicle) {
        return (
            <View style={[styles.container, { paddingTop: headerHeight }]}>
                <Text style={styles.headerText}>Vehicle not found</Text>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.fullButton} onPress={onPressBackButton}>
                        <Text style={styles.footerText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <>
            <StatusBar style='light' />
            <View style={[styles.container, { paddingTop: headerHeight }]}>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                    <Text style={styles.headerText}>{vehicleName}</Text>
                    <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
                    <Text style={styles.detailText}>Type: {vehicle.type}</Text>
                    <Text style={styles.descriptionText}>{vehicle.description}</Text>
                    <Text style={styles.priceText}>{vehicle.price}</Text>
                    <Text style={styles.boldText}>Comes with two strong guys</Text>
                    <Text style={styles.regularText}>Sit back & relax while they do all the heavy work for you.</Text>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.fullButton} onPress={onPressContinueButton}>
                        <Text style={styles.footerText}>CONTINUE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
};

export default VehicleDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: Colors.lightGray,
    },
    scrollViewContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },
    vehicleImage: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: Colors.primary,
    },
    detailText: {
        fontSize: 18,
        marginBottom: 5,
        textAlign: 'center',
        color: '#555',
    },
    descriptionText: {
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
        color: '#777',
        paddingHorizontal: 10,
    },
    priceText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    boldText: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
        color: '#444',
    },
    regularText: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        padding: 10,
        backgroundColor: '#fff',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    fullButton: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        padding: 14,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    footerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    }
});


// import React, { useLayoutEffect } from 'react';
// import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { AntDesign, Ionicons } from '@expo/vector-icons';
// import Colors from '@/constants/Colors';
// import { useHeaderHeight } from '@react-navigation/elements';
// import { StatusBar } from 'expo-status-bar';

// const VehicleDetail: React.FC = () => {
//     const router = useRouter();
//     const { vehicleName } = useLocalSearchParams();
//     const headerHeight = useHeaderHeight();


//     const onPressContinueButton = () => {
//         router.push('CalendarScreen')
//     }
//     const onPressBackButton = () => {
//         router.push('vehicles')
//     }

//     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string; price: string }> = {
//         'Pick up Truck': {
//             year: '2020',
//             type: 'Full Size Truck',
//             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
//             image: 'https://tinyurl.com/yvxmpyjr',
//             price: '25,000 Kshs + 2,000 Kshs per labor min'
//         },
//         'Van': {
//             year: '2019',
//             type: 'Standard',
//             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
//             image: 'https://shorturl.at/vs0Bd',
//             price: '15,000 Kshs + 1,500 Kshs per labor min'
//         },
//         'Truck': {
//             year: '2018',
//             type: 'Standard',
//             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
//             image: 'https://shorturl.at/sIr0z',
//             price: '20,000 Kshs + 1,800 Kshs per labor min'
//         },
//         'Truck XL': {
//             year: '2021',
//             type: 'Extra Large',
//             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
//             image: 'https://tinyurl.com/ywzbrk7y',
//             price: '30,000 Kshs + 2,500 Kshs per labor min'
//         },
//     };

//     const vehicle = vehicleDetails[vehicleName as string];

//     if (!vehicle) {
//         return (
//             <View style={[styles.container, { paddingTop: headerHeight }]}
//             >
//                 <Text style={styles.headerText}>Vehicle not found</Text>
//                 <View style={styles.footer}>
//                     <TouchableOpacity style={styles.fullButton} onPress={onPressBackButton}>
//                         <Text style={styles.footerText}>Go Back</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         );
//     }

//     return (
//         <>
//             <StatusBar style='dark' />
//             <View style={[styles.container, { paddingTop: headerHeight }]}>
//                 <ScrollView contentContainerStyle={styles.scrollViewContainer}>
//                     <Text style={styles.headerText}>{vehicleName}</Text>
//                     <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
//                     <Text style={styles.detailText}>Type: {vehicle.type}</Text>
//                     <Text style={styles.descriptionText}>{vehicle.description}</Text>
//                     <Text style={styles.priceText}>{vehicle.price}</Text>
//                     <Text style={styles.boldText}>Comes with two strong guys</Text>
//                     <Text style={styles.regularText}>Sit back & relax while they do all the heavy work for you.</Text>
//                 </ScrollView>

//                 <View style={styles.footer}>
//                     <TouchableOpacity style={styles.fullButton} onPress={onPressContinueButton}>
//                         <Text style={styles.footerText}>CONTINUE</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </>
//     );
// };

// export default VehicleDetail;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         justifyContent: 'space-between',
//         backgroundColor: Colors.lightGray,
//     },
//     scrollViewContainer: {
//         paddingHorizontal: 20,
//         paddingTop: 20,
//         paddingBottom: 40,
//         alignItems: 'center',
//     },
//     vehicleImage: {
//         width: '100%',
//         height: 200,
//         borderRadius: 10,
//         marginBottom: 20,
//     },
//     headerText: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         marginBottom: 10,
//         textAlign: 'center',
//     },
//     detailText: {
//         fontSize: 18,
//         marginBottom: 5,
//         textAlign: 'center',
//         color: '#555',
//     },
//     descriptionText: {
//         fontSize: 16,
//         marginBottom: 10,
//         textAlign: 'center',
//         color: '#777',
//         paddingHorizontal: 10,
//     },
//     priceText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         color: '#555',
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     boldText: {
//         fontWeight: 'bold',
//         textAlign: 'center',
//         marginBottom: 5,
//     },
//     regularText: {
//         textAlign: 'center',
//         marginBottom: 20,
//     },
//     footer: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         height: 100,
//         padding: 10,
//         backgroundColor: '#fff',
//         elevation: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: -10 },
//         shadowOpacity: 0.1,
//         shadowRadius: 10,
//     },
//     fullButton: {
//         backgroundColor: Colors.primary,
//         borderRadius: 8,
//         padding: 14,
//         // width: '100%',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     footerText: {
//         color: '#fff',
//         fontSize: 20,
//         fontWeight: 'bold',
//     }
// });


