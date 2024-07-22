import React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

const VehicleDetail: React.FC = () => {
    const router = useRouter();
    const { vehicleName } = useLocalSearchParams();

    const onPressContinueButton = () => {
        router.push('CalendarScreen')
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
            <View style={styles.container}>
                <Text style={styles.headerText}>Vehicle not found</Text>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <Text style={styles.headerText}>{vehicleName}</Text>
                <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
                <Text style={styles.detailText}>Year: {vehicle.year}</Text>
                <Text style={styles.detailText}>Type: {vehicle.type}</Text>
                <Text style={styles.descriptionText}>{vehicle.description}</Text>
                <Text style={styles.priceText}>{vehicle.price}</Text>
                <Text style={styles.boldText}>Comes with two strong guys</Text>
                <Text style={styles.regularText}>Sit back & relax while they do all the heavy work for you.</Text>
            </ScrollView>

            <TouchableOpacity style={styles.button} onPress={onPressContinueButton}>
                <Text style={styles.buttonText}>Continue</Text>
                <AntDesign name="rightcircleo" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};

export default VehicleDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
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
        borderRadius: 10,
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    boldText: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    regularText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginBottom: 20
    },
    buttonText: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        marginRight: 10,
    },
});




// import React from 'react';
// import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { AntDesign } from '@expo/vector-icons';


// const VehicleDetail: React.FC = () => {
//     const router = useRouter();
//     const { vehicleName } = useLocalSearchParams();

//     const vehicleDetails: Record<string, { year: string; type: string; description: string; image: string }> = {
//         'Pick up Truck': {
//             year: '2020',
//             type: 'Full Size Truck',
//             description: 'A versatile and powerful truck suitable for heavy-duty tasks and long-distance moves.',
//             image: 'https://tinyurl.com/yvxmpyjr',
//             price: '25,000Kshs + 2,000Kshs per labor min'
//         },
//         'Van': {
//             year: '2019',
//             type: 'Standard',
//             description: 'A spacious and efficient van, perfect for medium-sized moves and transporting goods.',
//             image: 'https://shorturl.at/vs0Bd',
//         },
//         'Truck': {
//             year: '2018',
//             type: 'Standard',
//             description: 'A reliable truck with ample storage space, ideal for most moving needs.',
//             image: 'https://shorturl.at/sIr0z',
//         },
//         'Truck XL': {
//             year: '2021',
//             type: 'Extra Large',
//             description: 'An extra-large truck for the biggest moves, offering maximum capacity and durability.',
//             image: 'https://tinyurl.com/ywzbrk7y',
//         },
//     };

//     const vehicle = vehicleDetails[vehicleName as string];

//     if (!vehicle) {
//         return (
//             <View style={styles.container}>
//                 <Text style={styles.headerText}>Vehicle not found</Text>
//                 <TouchableOpacity style={styles.button} onPress={() => router.back()}>
//                     <Text style={styles.buttonText}>Go Back</Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <Text style={styles.headerText}>{vehicleName}</Text>
//             <Image source={{ uri: vehicle.image }} style={styles.vehicleImage} resizeMode="cover" />
//             <Text style={styles.detailText}>Year: {vehicle.year}</Text>
//             <Text style={styles.detailText}>Type: {vehicle.type}</Text>
//             <Text style={styles.descriptionText}>{vehicle.description}</Text>
//             <Text style={{ fontWeight: 'bold' }}>
//                 Comes with two strong guys
//             </Text>
//             <Text>
//                 Sit back & relax while they do all the heavy work for you.
//             </Text>


//             <TouchableOpacity style={styles.button} onPress={() => router.back()}>
//                 <Text style={styles.buttonText}>Continue</Text>
//                 <AntDesign name="rightcircleo" size={24} color="black" />
//             </TouchableOpacity>
//         </ScrollView>
//     );
// };

// export default VehicleDetail;

// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//         // alignItems: 'center',
//         // justifyContent: 'center',
//         paddingHorizontal: 20,
//         paddingTop: 5,
//     },
//     vehicleImage: {
//         width: '100%',
//         height: 200,
//         borderRadius: 10,
//         marginBottom: 30,
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
//         marginBottom: 20,
//         textAlign: 'center',
//         color: '#777',
//         paddingHorizontal: 10,
//     },
//     button: {
//         backgroundColor: '#007BFF',
//         padding: 20,
//         borderRadius: 5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 130,
//         flexDirection: 'row'
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 16,
//         flex: 1
//     },
// });
