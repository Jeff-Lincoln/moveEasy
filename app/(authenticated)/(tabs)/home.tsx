import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHeaderHeight } from '@react-navigation/elements';
import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import routeResponse from '@/assets/data/route.json';
import { getDirections } from '@/services/directions'; // Adjust path as needed
import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';

const HomePage: React.FC = () => {
    const headerHeight = useHeaderHeight();
    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
    const router = useRouter();

    const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
    // const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

    const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const directionCoordinates = routeResponse.routes[0].geometry.coordinates;
    

    const handleOpenPress = () => {
        bottomSheetRef.current?.snapToIndex(1);
    };

    const handleClosePress = () => {
        bottomSheetRef.current?.close();
    };

    const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
    const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

    const handleOnPressContinue = async () => {
        const pickup = pickupInputRef.current?.value;
        const destination = destinationInputRef.current?.value;

        if (!pickup || !destination) {
            Alert.alert('Error', 'Please fill in both pickup and destination locations');
            return;
        }

        try {
            const pickupCoordinates = await getCoordinatesFromAddress(pickup);
            const destinationCoordinates = await getCoordinatesFromAddress(destination);

            if (pickupCoordinates && destinationCoordinates) {
                setPickupLocation(pickupCoordinates);
                setDestinationLocation(destinationCoordinates);

                const coordinates = await getDirections(pickupCoordinates, destinationCoordinates, accessToken);
                if (coordinates) {
                    setDirectionCoordinates(coordinates);
                    router.push('/vehicles');
                } else {
                    throw new Error('No route coordinates found');
                }
            } else {
                throw new Error('Failed to fetch coordinates for pickup or destination');
            }
        } catch (error) {
            console.error('Error fetching directions:', error);
            Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
        }
    };

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
        ),
        []
    );

    const getCoordinatesFromAddress = async (address: string): Promise<number[] | null> => {
        // Implement your logic to convert address to coordinates (geocoding)
        // This is where you would typically use a geocoding API
        return null; // Replace with actual implementation
    };

    if (!accessToken) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
            </SafeAreaView>
        );
    }

    Mapbox.setAccessToken(accessToken);

    return (
        <>
            <StatusBar style="dark" />
            <View style={styles.container}>
                <MapView style={styles.map}
                    styleURL="mapbox://styles/mapbox/dark-v11"
                    zoomEnabled={true}
                    rotateEnabled={false}>
                    <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
                    <LocationPuck
                        topImage="topImage"
                        visible={true}
                        scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
                        pulsing={{
                            isEnabled: true,
                            color: 'blue',
                            radius: 100.0,
                        }}
                    />

                    {directionCoordinates && (
                        <ShapeSource
                            id="routeSource"
                            lineMetrics
                            shape={{
                                type: 'Feature',
                                geometry: {
                                    type: 'LineString',
                                    coordinates: directionCoordinates,
                                },
                            }}>
                            <LineLayer
                                id="line-background"
                                style={{
                                    lineColor: 'yellow',
                                    lineWidth: 6,
                                    lineOpacity: 0.4,
                                }}
                            />
                            <LineLayer
                                id="line-dashed"
                                style={{
                                    lineColor: 'yellow',
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                    lineWidth: 6,
                                    lineDasharray: [0, 4, 3],
                                }}
                            />
                        </ShapeSource>
                    )}
                </MapView>
                <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
                    <Text style={styles.buttonText}>Book Move-Easy</Text>
                    <AntDesign name="arrowright" size={24} color="white" />
                </TouchableOpacity>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    index={0}
                    enablePanDownToClose={true}
                    handleIndicatorStyle={{ backgroundColor: 'blue' }}
                    backgroundStyle={{ backgroundColor: '#fff' }}
                >
                    <View style={styles.bottomSheetContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>Book Your Move</Text>
                            <TouchableOpacity onPress={handleClosePress}>
                                <AntDesign name="closecircle" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <BottomSheetTextInput
                                ref={pickupInputRef}
                                style={styles.input}
                                placeholder="Pickup Location"
                                placeholderTextColor="#888"
                            />
                            <BottomSheetTextInput
                                ref={destinationInputRef}
                                style={styles.input}
                                placeholder="Destination"
                                placeholderTextColor="#888"
                            />
                        </View>
                        <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
                            <Text style={styles.buttonText2}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheet>
            </View>
        </>
    );
};

export default HomePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    map: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    button: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#007AFF',
        borderRadius: 50,
        padding: 15,
        flexDirection: 'row',
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
        marginRight: 10,
    },
    bottomSheetContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginBottom: 10,
    },
    continueButton: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText2: {
        color: '#fff',
        fontWeight: 'bold',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#ff0000',
        textAlign: 'center',
    },
});



// import React, { useCallback, useMemo, useRef, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { getDirections } from '@/services/directions'; // Adjust path as needed
// // import { Coordinates } from '@/types'; // Assuming you have a types file for coordinates
// import myOrigin from '@/assets/data/origin.json'


// const HomePage: React.FC = () => {
//     const headerHeight = useHeaderHeight();
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//     const router = useRouter();

//     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
//     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
//     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

//     const origin = myOrigin.features[0].geometry.coordinates;

//     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);

//     const handleOpenPress = () => {
//         bottomSheetRef.current?.snapToIndex(1);
//     };

//     const handleClosePress = () => {
//         bottomSheetRef.current?.close();
//     };

//     const pickupInputRef = useRef<any>('');
//     const destinationInputRef = useRef<any>('');

//     const handleOnPressContinue = async () => {
//         const pickupLocation = await origin;
//         const destination = destinationInputRef.current?.value;

//         if (!pickupLocation || !destination) {
//             Alert.alert('Error', 'Please fill in both pickup and destination locations');
//             return;
//         }
//         else {

//         }

//         // const pickupCoordinates = await getCoordinatesFromAddress(pickup);
//         // const destinationCoordinates = await getCoordinatesFromAddress(destination);

//         // if (pickupCoordinates && destinationCoordinates) {
//         //     setPickupLocation(pickupCoordinates);
//         //     setDestinationLocation(destinationCoordinates);

//         //     try {
//         //         const coordinates = await getDirections(pickupCoordinates, destinationCoordinates);
//         //         if (coordinates) {
//         //             setDirectionCoordinates(coordinates);
//         //             router.push('/myOrders', { pickup, destination });
//         //         } else {
//         //             throw new Error('No route coordinates found');
//         //         }
//         //     } catch (error) {
//         //         console.error('Error getting directions:', error);
//         //         Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
//         //     }
//         // }
//     };

//     const renderBackdrop = useCallback(
//         (props: any) => (
//             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
//         ),
//         []
//     );

//     if (!accessToken) {
//         return (
//             <SafeAreaView style={styles.errorContainer}>
//                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
//             </SafeAreaView>
//         );
//     }

//     Mapbox.setAccessToken(accessToken);

//     return (
//         <>
//             <StatusBar style="dark" />
//             <View style={styles.container}>
//                 <MapView style={styles.map}
//                     styleURL="mapbox://styles/mapbox/dark-v11"
//                     zoomEnabled={true}
//                     rotateEnabled={false}>
//                     <Camera followUserLocation followZoomLevel={16} animationMode={'flyTo'} />
//                     <LocationPuck
//                         topImage="topImage"
//                         visible={true}
//                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
//                         pulsing={{
//                             isEnabled: true,
//                             color: 'blue',
//                             radius: 100.0,
//                         }}
//                     />

//                     {directionCoordinates && (
//                         <ShapeSource
//                             id="routeSource"
//                             lineMetrics
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'LineString',
//                                     coordinates: directionCoordinates,
//                                 },
//                             }}>
//                             <LineLayer
//                                 id="line-background"
//                                 style={{
//                                     lineColor: 'yellow',
//                                     lineWidth: 6,
//                                     lineOpacity: 0.4,
//                                 }}
//                             />
//                             <LineLayer
//                                 id="line-dashed"
//                                 style={{
//                                     lineColor: 'yellow',
//                                     lineCap: 'round',
//                                     lineJoin: 'round',
//                                     lineWidth: 6,
//                                     lineDasharray: [0, 4, 3],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}
//                 </MapView>
//                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
//                     <Text style={styles.buttonText}>Book Move-Easy</Text>
//                     <AntDesign name="arrowright" size={24} color="white" />
//                 </TouchableOpacity>
//                 <BottomSheet
//                     ref={bottomSheetRef}
//                     snapPoints={snapPoints}
//                     backdropComponent={renderBackdrop}
//                     index={0}
//                     enablePanDownToClose={true}
//                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
//                     backgroundStyle={{ backgroundColor: '#fff' }}
//                 >
//                     <View style={styles.bottomSheetContainer}>
//                         <View style={styles.headerContainer}>
//                             <Text style={styles.headerText}>Book Your Move</Text>
//                             <TouchableOpacity onPress={handleClosePress}>
//                                 <AntDesign name="closecircle" size={24} color="#333" />
//                             </TouchableOpacity>
//                         </View>
//                         <View style={styles.inputContainer}>
//                             <BottomSheetTextInput
//                                 ref={pickupInputRef}
//                                 style={styles.input}
//                                 placeholder="Pickup Location"
//                                 placeholderTextColor="#888"
//                             />
//                             <BottomSheetTextInput
//                                 ref={destinationInputRef}
//                                 style={styles.input}
//                                 placeholder="Destination"
//                                 placeholderTextColor="#888"
//                             />
//                         </View>
//                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
//                             <Text style={styles.buttonText2}>Continue</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </BottomSheet>
//             </View>
//         </>
//     );
// };


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     map: {
//         flex: 1,
//         width: '100%',
//         height: '100%',
//     },
//     button: {
//         position: 'absolute',
//         bottom: 30,
//         right: 30,
//         backgroundColor: '#007AFF',
//         borderRadius: 50,
//         padding: 15,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     buttonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         marginRight: 10,
//     },
//     bottomSheetContainer: {
//         backgroundColor: '#fff',
//         borderRadius: 20,
//         padding: 20,
//         flex: 1,
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         marginBottom: 20,
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     inputContainer: {
//         marginBottom: 20,
//     },
//     input: {
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         paddingHorizontal: 15,
//         paddingVertical: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 2,
//         elevation: 2,
//         marginBottom: 10,
//     },
//     continueButton: {
//         backgroundColor: '#007AFF',
//         borderRadius: 10,
//         paddingVertical: 15,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     buttonText2: {
//         color: '#fff',
//         fontWeight: 'bold',
//     },
//     errorContainer: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 20,
//     },
//     errorText: {
//         fontSize: 18,
//         color: '#ff0000',
//         textAlign: 'center',
//     },
// });

// export default HomePage;


// // import React, { useCallback, useMemo, useRef, useState } from 'react';
// // import { StyleSheet, Text, TouchableOpacity, View, Image, Platform, Alert } from 'react-native';
// // import { StatusBar } from 'expo-status-bar';
// // import { useHeaderHeight } from '@react-navigation/elements';
// // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import Svg, { Path } from 'react-native-svg';
// // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // import { AntDesign } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';

// // const HomePage = () => {
// //     const headerHeight = useHeaderHeight();
// //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// //     const router = useRouter();

// //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// //     const bottomSheetRef = useRef<BottomSheet>(null);

// //     const handleOpenPress = () => {
// //         bottomSheetRef.current?.snapToIndex(2);
// //     };

// //     const handleClosePress = () => {
// //         bottomSheetRef.current?.close();
// //     };

// //     const [location, setLocation] = useState();
// //     const [destination, setDestination] = useState();
// //     const [isLocationFetching, setIsLocationFetching] = useState(false);

// //     const handleOnPressContinue = () => {
// //         // Add your logic for handling the continue button press here
// //         // For example, you might validate input fields before navigating
// //         // const pickupLocation = pickupInputRef.current?.value;
// //         // const destination = destinationInputRef.current?.value;


// //         if (!pickupLocation || !destination) {
// //             Alert.alert('Error', 'Please fill in both pickup and destination locations');
// //             return;
// //         }

// //         // router.push('/myOrders', { pickupLocation, destination });
// //     };

// //     const renderBackdrop = useCallback(
// //         (props: any) => (
// //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// //         ),
// //         []
// //     );

// //     const pickupInputRef = useRef(null);
// //     const destinationInputRef = useRef(null);

// //     return (
// //         <>
// //             <StatusBar style="dark" />
// //             <View style={styles.container}>
// //                 <MapView style={styles.map} styleURL="">
// //                     <Camera followUserLocation followZoomLevel={12} />
// //                     <LocationPuck
// //                         topImage="topImage"
// //                         visible={true}
// //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// //                         pulsing={{
// //                             isEnabled: true,
// //                             color: 'blue',
// //                             radius: 70.0,
// //                         }}
// //                     />

                    
// //                 </MapView>
// //                 <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// //                     <Text style={styles.buttonText}>Book Move-Easy</Text>
// //                     <AntDesign name="arrowright" size={24} color="white" />
// //                 </TouchableOpacity>
// //                 <BottomSheet
// //                     ref={bottomSheetRef}
// //                     snapPoints={snapPoints}
// //                     backdropComponent={renderBackdrop}
// //                     index={0}
// //                     enablePanDownToClose={true}
// //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// //                     backgroundStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Transparent backdrop
// //                 >
// //                     <View style={styles.bottomSheetContainer}>
// //                         <View style={styles.headerContainer}>
// //                             <Text style={styles.headerText}>Book Your Move</Text>
// //                             <TouchableOpacity onPress={handleClosePress}>
// //                                 <AntDesign name="closecircle" size={24} color="#333" />
// //                             </TouchableOpacity>
// //                         </View>
// //                         <View style={styles.inputContainer}>
// //                             <BottomSheetTextInput
// //                                 ref={pickupInputRef}
// //                                 style={styles.input}
// //                                 placeholder="Pickup Location"
// //                                 placeholderTextColor="#888"
// //                             />
// //                             <BottomSheetTextInput
// //                                 ref={destinationInputRef}
// //                                 style={styles.input}
// //                                 placeholder="Destination"
// //                                 placeholderTextColor="#888"
// //                             />
// //                         </View>
// //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// //                             <Text style={styles.buttonText2}>Continue</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </BottomSheet>
// //             </View>
// //         </>
// //     );
// // };

// // export default HomePage;

// // // ... styles


// // const styles = StyleSheet.create({
// //     container: {
// //         flex: 1,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     map: {
// //         flex: 1,
// //         width: '100%',
// //         height: '100%',
// //     },
// //     button: {
// //         position: 'absolute',
// //         bottom: 30,
// //         right: 30,
// //         backgroundColor: '#007AFF',
// //         borderRadius: 50,
// //         padding: 15,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.25,
// //         shadowRadius: 3.84,
// //         elevation: 5,
// //     },
// //     buttonText: {
// //         color: '#fff',
// //         fontWeight: 'bold',
// //         marginRight: 10,
// //     },
// //     bottomSheetContainer: {
// //         backgroundColor: '#fff',
// //         borderRadius: 20,
// //         padding: 20,
// //         flex: 1,
// //     },
// //     headerContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         marginBottom: 20,
// //     },
// //     headerText: {
// //         fontSize: 20,
// //         fontWeight: 'bold',
// //         color: '#333',
// //     },
// //     inputContainer: {
// //         marginBottom: 20,
// //     },
// //     input: {
// //         backgroundColor: '#fff',
// //         borderRadius: 10,
// //         paddingHorizontal: 15,
// //         paddingVertical: 10,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.1,
// //         shadowRadius: 2,
// //         elevation: 2,
// //         marginBottom: 10,
// //     },
// //     continueButton: {
// //         backgroundColor: '#007AFF',
// //         borderRadius: 10,
// //         paddingVertical: 15,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     buttonText2: {
// //         color: '#fff',
// //         fontWeight: 'bold',
// //     },
// // });




// // import React, { useCallback, useMemo, useRef } from 'react';
// // import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import { StatusBar } from 'expo-status-bar';
// // import { useHeaderHeight } from '@react-navigation/elements';
// // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import Svg, { Path } from 'react-native-svg';
// // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // import { AntDesign } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';

// // const HomePage = () => {
// //     const headerHeight = useHeaderHeight();
// //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// //     const router = useRouter();

// //     const handleOnPressContinue = () => {
// //         router.push('/myOrders');
// //     };

// //     Mapbox.setAccessToken(accessToken);

// //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// //     const bottomSheetRef = useRef<BottomSheet>(null);

// //     const handleOpenPress = () => {
// //         bottomSheetRef.current?.snapToIndex(2);
// //     };

// //     const handleClosePress = () => {
// //         bottomSheetRef.current?.close();
// //     };

// //     const renderBackdrop = useCallback(
// //         (props: any) => (
// //             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
// //         ),
// //         []
// //     );

// //     return (
// //         <>
// //             <StatusBar style="dark" />
// //             <View style={{ flex: 1 }}>
// //                 <MapView style={{ flex: 1 }} styleURL="">
// //                     <Camera followUserLocation followZoomLevel={12} />
// //                     <LocationPuck
// //                         topImage="topImage"
// //                         visible={true}
// //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// //                         pulsing={{
// //                             isEnabled: true,
// //                             color: 'blue',
// //                             radius: 70.0,
// //                         }}
// //                     />
// //                 </MapView>
// //                 <View style={styles.buttonContainer}>
// //                     <TouchableOpacity style={styles.button} onPress={handleOpenPress}>
// //                         <Text style={styles.buttonText1}>Book Move-Easy</Text>
// //                         <AntDesign name="arrowright" size={24} color="black" style={styles.arrowIcon} />
// //                     </TouchableOpacity>
// //                 </View>
// //                 <BottomSheet
// //                     ref={bottomSheetRef}
// //                     snapPoints={snapPoints}
// //                     backdropComponent={renderBackdrop}
// //                     index={0}
// //                     enablePanDownToClose={true}
// //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// //                     backgroundStyle={{ backgroundColor: '#fff' }}
// //                 >
// //                     <View style={styles.bottomSheetContainer}>
// //                         <View style={styles.headerContainer}>
// //                             <Text style={styles.headerText}>Good Morning, Jeff!</Text>
// //                             {/* Add a close button or other elements here if needed */}
// //                         </View>
// //                         <BottomSheetTextInput style={styles.input} placeholder="Where From?" />
// //                         <BottomSheetTextInput style={styles.input} placeholder="Where To?" />
// //                         <TouchableOpacity style={styles.continueButton} onPress={handleOnPressContinue}>
// //                             <Text style={styles.buttonText2}>Continue</Text>
// //                         </TouchableOpacity>
// //                     </View>
// //                 </BottomSheet>
// //             </View>
// //         </>
// //     );
// // };

// // export default HomePage;

// // const styles = StyleSheet.create({
// //     buttonContainer: {
// //         position: 'absolute',
// //         bottom: 30,
// //         width: '100%',
// //         paddingHorizontal: 10,
// //         alignItems: 'center',
// //     },
// //     buttonContent: {
// //         width: '100%',
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         paddingVertical: 5,
// //         paddingHorizontal: 20,
// //         backgroundColor: '#FFEA00',
// //         borderRadius: 25,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.8,
// //         shadowRadius: 2,
// //         elevation: 5,
// //     },
// //     buttonText1: {
// //         flex: 1,
// //         fontSize: 18,
// //         fontWeight: 'bold',
// //         color: 'black',
// //     },
// //     buttonText2: {
// //         fontSize: 18,
// //         fontWeight: 'bold',
// //         color: '#fff',
// //     },
// //     arrowIcon: {
// //         marginLeft: 10,
// //     },
// //     input: {
// //         backgroundColor: '#fff',
// //         borderRadius: 10,
// //         paddingHorizontal: 15,
// //         paddingVertical: 10,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.1,
// //         shadowRadius: 2,
// //         elevation: 2,
// //         marginBottom: 10,
// //     },
// //     headerContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         marginBottom: 20,
// //     },
// //     headerText: {
// //         fontSize: 20,
// //         fontWeight: 'bold',
// //         color: '#333',
// //     },
// //     button: {
// //         width: '100%',
// //         backgroundColor: 'yellow',
// //         flexDirection: 'row',
// //         padding: 16,
// //         borderRadius: 8,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         shadowColor: '#000',
// //         shadowOpacity: 0.9,
// //         shadowRadius: 2,
// //         elevation: 5,
// //         marginBottom: 20,
// //     },
// //     continueButton: {
// //         backgroundColor: '#007AFF',
// //         borderRadius: 10,
// //         paddingVertical: 15,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     bottomSheetContainer: {
// //         backgroundColor: '#F5F5F5',
// //         borderRadius: 20,
// //         padding: 20,
// //     },
// // });



// // import React, { useCallback, useMemo, useRef } from 'react';
// // import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import { StatusBar } from 'expo-status-bar';
// // import { useHeaderHeight } from '@react-navigation/elements';
// // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import Svg, { Path } from 'react-native-svg';
// // import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// // import { AntDesign } from '@expo/vector-icons';
// // import { useRouter } from 'expo-router';

// // const HomePage = () => {
// //     const headerHeight = useHeaderHeight();
// //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
// //     const router = useRouter();

// //     const handleOnPressContinue = () => {
// //         router.push('/myOrders');
// //     }

// //     Mapbox.setAccessToken(accessToken);

// //     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
// //     const bottomSheetRef = useRef<BottomSheet>(null);

// //     const handleOpenPress = () => {
// //         bottomSheetRef.current?.snapToIndex(2);

// //     };
// //     const handleClosePress = () => {
// //         bottomSheetRef.current?.close();

// //     }
// //     const renderBackdrop = useCallback(
// //         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0}
// //             {...props} />,
// //         []
// //     );

// //     return (
// //         <>
// //             <StatusBar style='dark' />
// //             <View style={{ flex: 1 }}>
// //                 <MapView style={{ flex: 1 }} styleURL=''>
// //                     <Camera followUserLocation followZoomLevel={12} />
// //                     <LocationPuck
// //                         topImage="topImage"
// //                         visible={true}
// //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// //                         pulsing={{
// //                             isEnabled: true,
// //                             color: 'blue',
// //                             radius: 70.0,
// //                         }}
// //                     />
// //                 </MapView>
// //                 <View style={styles.buttonContainer}>
// //                     <TouchableOpacity style={styles.button}
// //                         onPress={handleOpenPress}>
// //                         <Text style={styles.buttonText1}>Book Move-Easy</Text>
// //                         <AntDesign name="arrowright" size={24} color="black" style={styles.arrowIcon} />
// //                     </TouchableOpacity>
// //                 </View>
// //                 <BottomSheet
// //                     ref={bottomSheetRef}
// //                     snapPoints={snapPoints}
// //                     backdropComponent={renderBackdrop}
// //                     index={0}
// //                     enablePanDownToClose={true}
// //                     handleIndicatorStyle={{ backgroundColor: 'blue' }}
// //                     backgroundStyle={{ backgroundColor: '#fff' }}
// //                 >
// //                     <View style={styles.headerContainer}>
// //                         <Text style={styles.headerText}>Good Morning, Jeff!</Text>
// //                     </View>
// //                     {/* <Text>Enter Your Location</Text> */}
// //                     <BottomSheetTextInput style={styles.input}
// //                         placeholder='Where From?'
// //                     />

// //                     <BottomSheetTextInput style={styles.input}
// //                         placeholder='Where To?'
// //                     />

// //                     <TouchableOpacity style={styles.continueButton}
// //                         onPress={handleOnPressContinue}>
// //                         <Text style={styles.buttonText2}>Continue</Text>
// //                     </TouchableOpacity>

// //                 </BottomSheet>
// //             </View>
// //         </>
// //     )
// // }

// // export default HomePage;

// // const styles = StyleSheet.create({
// //     buttonContainer: {
// //         position: 'absolute',
// //         bottom: 30,
// //         width: '100%',
// //         paddingHorizontal: 10,
// //         alignItems: 'center',
// //     },
// //     buttonContent: {
// //         width: '100%',
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         paddingVertical: 5,
// //         paddingHorizontal: 20,
// //         backgroundColor: '#FFEA00',
// //         borderRadius: 25,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.8,
// //         shadowRadius: 2,
// //         elevation: 5,
// //     },
// //     buttonText1: {
// //         flex: 1,
// //         fontSize: 18,
// //         fontWeight: 'bold',
// //         color: 'black',
// //     },
// //     buttonText2: {
// //         fontSize: 18,
// //         fontWeight: 'bold',
// //         color: 'black',
// //     },
// //     arrowIcon: {
// //         marginLeft: 10,
// //     },
// //     input: {
// //         marginTop: 8,
// //         marginHorizontal: 16,
// //         marginBottom: 16,
// //         fontSize: 16,
// //         lineHeight: 20,
// //         padding: 10,
// //         backgroundColor: 'rgba(151, 151, 151, 0.25)',
// //         color: '#fff',
// //     },
// //     headerContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         paddingHorizontal: 20,
// //     },
// //     headerText: {
// //         fontSize: 20,
// //         fontWeight: 'bold',
// //         color: 'black',
// //         marginBottom: 10,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     button: {
// //         width: '100%',
// //         backgroundColor: 'yellow',
// //         flexDirection: 'row',
// //         padding: 16,
// //         borderRadius: 8,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         shadowColor: '#000',
// //         shadowOpacity: 0.9,
// //         shadowRadius: 2,
// //         elevation: 5,
// //         marginBottom: 20,
// //     },
// //     continueButton: {
// //         width: '100%',
// //         backgroundColor: 'yellow',
// //         padding: 16,
// //         borderRadius: 8,
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //         shadowColor: '#000',
// //         shadowOpacity: 0.9,
// //         shadowRadius: 2,
// //         elevation: 5,
// //         marginBottom: 20,
// //     },
// // });




// // import React, { useMemo, useRef } from 'react';
// // import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// // import { StatusBar } from 'expo-status-bar';
// // import { useHeaderHeight } from '@react-navigation/elements';
// // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import Svg, { Path } from 'react-native-svg';
// // import BottomSheet from '@gorhom/bottom-sheet';
// // import { AntDesign } from '@expo/vector-icons';

// // const HomePage = () => {
// //     const headerHeight = useHeaderHeight();
// //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

// //     Mapbox.setAccessToken(accessToken);

// //     const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
// //     const bottomSheetRef = useRef<BottomSheet>(null);


// //     return (
// //         <>
// //             <StatusBar style='dark' />
// //             <View style={{ flex: 1, marginTop: headerHeight }}>
// //                 <MapView style={{ flex: 1 }} styleURL=''>
// //                     <Camera followUserLocation followZoomLevel={12} />
// //                     <LocationPuck
// //                         topImage="topImage"
// //                         visible={true}
// //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// //                         pulsing={{
// //                             isEnabled: true,
// //                             color: 'blue',
// //                             radius: 70.0,
// //                         }}
// //                     />
// //                 </MapView>
// //                 <View style={[]}>
// //                     <TouchableOpacity style={styles.buttonContainer}>
// //                         <Text>Book Move-Easy</Text>
// //                         <AntDesign name="arrowright" size={24} color="black" />
// //                     </TouchableOpacity>
// //                 </View>
// //                 {/* <BottomSheet
// //                 ref={bottomSheetRef}
// //                 snapPoints={snapPoints}
// //                     index={1}>
// //                     <View>
// //                         <Text>Hello World</Text>
// //                     </View>
// //                 </BottomSheet> */}
// //             </View>
// //         </>
// //     )
// // }

// // export default HomePage

// // const styles = StyleSheet.create({
// //     wave: {
// //         position: 'absolute',
// //         bottom: 0,
// //         width: '100%',
// //         height: 80,
// //     },
// //     buttonContainer: {
// //         position: 'absolute',
// //         bottom: 0,
// //         width: '100%',
// //         paddingHorizontal: 20, // Adjust padding as needed
// //         paddingVertical: 20,
// //         backgroundColor: 'yellow',
// //         marginBottom: 10,
// //         shadowColor: '#000',
// //         shadowOffset: { width: 0, height: 2 },
// //         shadowOpacity: 0.8,
// //         shadowRadius: 2,
// //         elevation: 5,
// //         borderRadius: 20, // Border radius for the curved left edge
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between', // Ensure arrow is on the rightmost side
// //     },
// //     arrowIcon: {
// //         marginRight: 10, // Adjust spacing between button content and arrow
// //         // Add any additional styling for the arrow icon
// //     },
// //     buttonText: {
// //         fontSize: 26,
// //         fontWeight: 'bold',
// //         color: 'black',
// //         // Add any additional text styling
// //     },
// // });


// // import { Button, StyleSheet, Text, View } from 'react-native'
// // import React from 'react'
// // import { StatusBar } from 'expo-status-bar';
// // import { useHeaderHeight } from '@react-navigation/elements';
// // import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// // import { SafeAreaView } from 'react-native-safe-area-context';

// // const HomePage = () => {
// //     const headerHeight = useHeaderHeight();
// //     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

// //     Mapbox.setAccessToken(accessToken);

// //     return (
// //         <>
// //             <StatusBar style='dark' />
// //             <View style={{ flex: 1, marginTop: headerHeight }}>
// //                 <MapView style={{ flex: 1 }} styleURL=''>
// //                     <Camera followUserLocation followZoomLevel={14} />
// //                     <LocationPuck
// //                         topImage="topImage"
// //                         visible={true}
// //                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
// //                         pulsing={{
// //                             isEnabled: true,
// //                             color: 'blue',
// //                             radius: 70.0,
// //                         }}
// //                     />
// //                 </MapView>
// //             </View>
// //         </>
// //     )
// // }

// // export default HomePage

// // const styles = StyleSheet.create({})