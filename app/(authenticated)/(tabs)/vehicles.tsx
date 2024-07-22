import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const VehiclesScreen = () => {
    const router = useRouter();

    const navigateToDetail = (vehicleName: string) => {
        router.push(`/vehicleDetail?vehicleName=${vehicleName}`);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerText}>Select your vehicle</Text>
            <Text style={styles.descriptionText}>
                Choose which vehicle works best for your move. We'll have straps,
                blankets, and wrap to protect your items.
            </Text>

            <View style={styles.vehicleContainer}>
                <TouchableOpacity
                    style={styles.vehicleItem}
                    onPress={() => navigateToDetail('Pick up Truck')}
                >
                    <Image
                        source={{ uri: 'https://tinyurl.com/yvxmpyjr' }}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.vehicleName}>Pick up Truck</Text>
                        <Text style={styles.vehicleDetail}>Year: 2020</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.vehicleItem}
                    onPress={() => navigateToDetail('Van')}
                >
                    <Image
                        source={{ uri: 'https://shorturl.at/vs0Bd' }}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.vehicleName}>Van</Text>
                        <Text style={styles.vehicleDetail}>Type: Standard</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.vehicleItem}
                    onPress={() => navigateToDetail('Truck')}
                >
                    <Image
                        source={{ uri: 'https://shorturl.at/sIr0z' }}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.vehicleName}>Truck</Text>
                        <Text style={styles.vehicleDetail}>Type: Standard</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.vehicleItem}
                    onPress={() => navigateToDetail('Truck XL')}
                >
                    <Image
                        source={{ uri: 'https://tinyurl.com/ywzbrk7y' }}
                        style={styles.vehicleImage}
                        resizeMode="cover"
                    />
                    <View style={styles.textContainer}>
                        <Text style={styles.vehicleName}>Truck XL</Text>
                        <Text style={styles.vehicleDetail}>Type: Extra Large</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default VehiclesScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    descriptionText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#555',
    },
    vehicleContainer: {
        flexDirection: 'column',
    },
    vehicleItem: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 20,
        alignItems: 'center',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: '#fff',
        // transition: 'background-color 0.3s',
    },
    vehicleItemPressed: {
        backgroundColor: '#f0f0f0',
    },
    vehicleImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    vehicleName: {
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
        color: '#333',
    },
    vehicleDetail: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 10,
        color: '#888',
    },
});




// import React from 'react';
// import { StyleSheet, Text, View, Image, ScrollView } from 'react-native';

// const Vehicles: React.FC = () => {
//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <Text style={styles.headerText}>Select your vehicle</Text>
//             <Text style={styles.descriptionText}>
//                 Choose which vehicle works best for your move. We'll have straps,
//                 blankets, and wrap to protect your items.
//             </Text>

//             {/* Vehicle selection components */}
//             <View style={styles.vehicleContainer}>
//                 {/* Car */}
//                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
//                     <Image
//                         source={{ uri: 'https://shorturl.at/AoDLC' }}
//                         style={styles.vehicleImage}
//                     />
//                     <Text style={styles.vehicleName}>Toyota Camry</Text>
//                     <Text style={styles.vehicleDetail}>Year: 2020</Text>
//                 </View>

//                 {/* Van */}
//                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
//                     <Image
//                         source={{ uri: 'https://shorturl.at/AoDLC' }}
//                         style={styles.vehicleImage}
//                     />
//                     <Text style={styles.vehicleName}>Van</Text>
//                     <Text style={styles.vehicleDetail}>Type: Standard</Text>
//                 </View>

//                 {/* Truck */}
//                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
//                     <Image
//                         source={{ uri: 'https://shorturl.at/AoDLC' }}
//                         style={styles.vehicleImage}
//                     />
//                     <Text style={styles.vehicleName}>Truck</Text>
//                     <Text style={styles.vehicleDetail}>Type: Standard</Text>
//                 </View>

//                 {/* Truck XL */}
//                 <View style={[styles.vehicleItem, styles.fullWidthItem]}>
//                     <Image
//                         source={{ uri: 'https://shorturl.at/AoDLC' }}
//                         style={styles.vehicleImage}
//                     />
//                     <Text style={styles.vehicleName}>Truck XL</Text>
//                     <Text style={styles.vehicleDetail}>Type: Extra Large</Text>
//                 </View>
//             </View>
//         </ScrollView>
//     );
// };

// export default Vehicles;

// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//         paddingHorizontal: 20,
//         paddingTop: 20,
//         paddingBottom: 40,
//     },
//     headerText: {
//         fontSize: 30,
//         fontWeight: 'bold',
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     descriptionText: {
//         fontSize: 16,
//         marginBottom: 20,
//         textAlign: 'center',
//     },
//     vehicleContainer: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//     },
//     vehicleItem: {
//         width: '45%',
//         borderWidth: 1,
//         borderColor: '#ddd',
//         padding: 10,
//         marginBottom: 20,
//         alignItems: 'center',
//     },
//     fullWidthItem: {
//         width: '100%',
//     },
//     vehicleImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 5,
//         marginBottom: 10,
//     },
//     vehicleName: {
//         fontWeight: 'bold',
//         fontSize: 16,
//         textAlign: 'center',
//         marginBottom: 5,
//     },
//     vehicleDetail: {
//         fontSize: 12,
//         textAlign: 'center',
//         marginBottom: 5,
//     },
// });



// import { StyleSheet, Text, View } from 'react-native'
// import React from 'react'

// const vehicles = () => {
//     return (
//         <View>
//             <Text style={styles.headerText}>Select your vehicle</Text>
//             <Text style={{
//                 marginTop: 10,
//                 marginBottom: 10,
//                 textAlign: 'center',
//                 fontSize: 10
//             }}>Choose which Vehicle works best for your move. We'll have straps,
//                 blankets, and wrap to protect your items.
//             </Text>
//             {/* Vehicle selection components */}
//             <View>
//                 {/* Vehicle component */}
//                 <View style={{
//                     borderWidth: 1,
//                     borderColor: '#ddd',
//                     padding: 10,
//                     marginBottom: 10
//                 }}>
//                     {/* Vehicle image */}
//                     <Image
//                         source={{ uri: 'https://shorturl.at/AoDLC' }}
//                         style={{
//                             width: 100,
//                             height: 100,
//                             borderRadius: 5
//                         }}
//                     />
//                     {/* Vehicle details */}
//                     <Text style={{
//                         marginTop: 10,
//                         marginBottom: 10,
//                         fontWeight: 'bold'
//                     }}>
//                         Toyota Camry
//                     </Text>
//                     <Text style={{
//                         marginTop: 5,
//                         marginBottom: 5
//                     }}>
//                         Year: 2020
//                     </Text>
//                 </View>
//                 {/* Additional vehicle components */}
//                 {/*... */}
//             </View>
//         </View>
//     )
// }

// export default vehicles

// const styles = StyleSheet.create({
//     headerText: {
//         fontSize: 30,
//         fontWeight: 'bold',
//         marginBottom: 20
//     }
// })