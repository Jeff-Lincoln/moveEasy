import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { AntDesign } from '@expo/vector-icons';
import { geoCoding } from '@/services/geoCoding';
import { getDirections } from '@/services/directions';
import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

const HomePage: React.FC = () => {
    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
    const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
    const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleOpenPress = () => {
        bottomSheetRef.current?.snapToIndex(1);
    };

    const handleClosePress = () => {
        bottomSheetRef.current?.close();
    };

    const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
    const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

    const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
        setter(text);
        // You can add debouncing logic here to fetch suggestions
    };

    const fetchCoordinates = async () => {
        try {
            const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
            setPickupLocation(pickupCoordinates);
            setDestinationLocation(destinationCoordinates);
        } catch (error: any) {
            Alert.alert('Error fetching coordinates', error.message);
        }
    };

    const handleOnPressContinue = async () => {
        try {
            await fetchCoordinates();
            if (pickupLocation && destinationLocation) {
                const directions = await getDirections({
                    pickupCoordinates: pickupLocation as [number, number],
                    destinationCoordinates: destinationLocation as [number, number]
                });
                setDirectionCoordinates(directions);
                bottomSheetRef.current?.close(); // Collapse bottom sheet
            }
        } catch (error: any) {
            Alert.alert('Error fetching directions', error.message);
        }
    };

    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
        []
    );

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
                <MapView
                    style={styles.map}
                    styleURL="mapbox://styles/mapbox/outdoors-v12"
                    zoomEnabled={true}
                    rotateEnabled={false}
                >
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

                    {pickupLocation && (
                        <ShapeSource
                            id="pickupSource"
                            shape={{
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: pickupLocation,
                                },
                            }}
                        >
                            <SymbolLayer
                                id="pickupSymbol"
                                style={{
                                    iconImage: 'marker-15',
                                    iconSize: 1.5,
                                    iconOffset: [0, -15],
                                }}
                            />
                        </ShapeSource>
                    )}

                    {destinationLocation && (
                        <ShapeSource
                            id="destinationSource"
                            shape={{
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: destinationLocation,
                                },
                            }}
                        >
                            <SymbolLayer
                                id="destinationSymbol"
                                style={{
                                    iconImage: 'marker-15',
                                    iconSize: 1.5,
                                    iconOffset: [0, -15],
                                }}
                            />
                        </ShapeSource>
                    )}

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
                            }}
                        >
                            <LineLayer
                                id="line-background"
                                style={{
                                    lineColor: 'red',
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
                                onChangeText={(text) => handleInputChange(text, setFrom)}
                                value={from}
                                style={styles.input}
                                placeholder="Pickup Location"
                                placeholderTextColor="#888"
                            />
                            <BottomSheetTextInput
                                ref={destinationInputRef}
                                onChangeText={(text) => handleInputChange(text, setTo)}
                                value={to}
                                style={styles.input}
                                placeholder="Destination"
                                placeholderTextColor="#888"
                            />
                            {suggestions.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    {suggestions.map((suggestion, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionItem}
                                            onPress={() => {
                                                setFrom(suggestion);
                                                setSuggestions([]);
                                            }}
                                        >
                                            <Text>{suggestion}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
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
        padding: 20,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    suggestionsContainer: {
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        padding: 10,
        maxHeight: 150,
        overflow: 'scroll',
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
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
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FF6347',
    },
});



// import React, { useCallback, useMemo, useRef, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { geoCoding } from '@/services/geoCoding';
// import { getDirections } from '@/services/directions';
// import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

// const HomePage: React.FC = () => {
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//     const router = useRouter();

//     const [from, setFrom] = useState('');
//     const [to, setTo] = useState('');
//     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
//     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
//     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
//     const [suggestions, setSuggestions] = useState<string[]>([]);

//     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);

//     const handleOpenPress = () => {
//         bottomSheetRef.current?.snapToIndex(1);
//     };

//     const handleClosePress = () => {
//         bottomSheetRef.current?.close();
//     };

//     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
//     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

//     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
//         setter(text);
//         // You can add debouncing logic here to fetch suggestions
//     };

//     const fetchCoordinates = async () => {
//         try {
//             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
//             setPickupLocation(pickupCoordinates);
//             setDestinationLocation(destinationCoordinates);
//         } catch (error) {
//             Alert.alert('Error fetching coordinates', error.message);
//         }
//     };

//     const handleOnPressContinue = async () => {
//         try {
//             await fetchCoordinates();
//             if (pickupLocation && destinationLocation) {
//                 const directions = await getDirections({
//                     pickupCoordinates: pickupLocation as [number, number],
//                     destinationCoordinates: destinationLocation as [number, number]
//                 });
//                 setDirectionCoordinates(directions);
//             }
//         } catch (error) {
//             Alert.alert('Error fetching directions', error.message);
//         }
//     };

//     const renderBackdrop = useCallback(
//         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
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

//     // Logging for debugging
//     console.log('from:', from);
//     console.log('to:', to);
//     console.log('pickupLocation:', pickupLocation);
//     console.log('destinationLocation:', destinationLocation);
//     console.log('directionCoordinates:', directionCoordinates);

//     return (
//         <>
//             <StatusBar style="dark" />
//             <View style={styles.container}>
//                 <MapView
//                     style={styles.map}
//                     styleURL="mapbox://styles/mapbox/outdoors-v12"
//                     zoomEnabled={true}
//                     rotateEnabled={false}
//                 >
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

//                     {pickupLocation && (
//                         <ShapeSource
//                             id="pickupSource"
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'Point',
//                                     coordinates: pickupLocation,
//                                 },
//                             }}
//                         >
//                             <SymbolLayer
//                                 id="pickupSymbol"
//                                 style={{
//                                     iconImage: 'marker-15',
//                                     iconSize: 1.5,
//                                     iconOffset: [0, -15],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}

//                     {destinationLocation && (
//                         <ShapeSource
//                             id="destinationSource"
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'Point',
//                                     coordinates: destinationLocation,
//                                 },
//                             }}
//                         >
//                             <SymbolLayer
//                                 id="destinationSymbol"
//                                 style={{
//                                     iconImage: 'marker-15',
//                                     iconSize: 1.5,
//                                     iconOffset: [0, -15],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}

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
//                             }}
//                         >
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
//                                 onChangeText={(text) => handleInputChange(text, setFrom)}
//                                 value={from}
//                                 style={styles.input}
//                                 placeholder="Pickup Location"
//                                 placeholderTextColor="#888"
//                             />
//                             <BottomSheetTextInput
//                                 ref={destinationInputRef}
//                                 onChangeText={(text) => handleInputChange(text, setTo)}
//                                 value={to}
//                                 style={styles.input}
//                                 placeholder="Destination"
//                                 placeholderTextColor="#888"
//                             />
//                             {suggestions.length > 0 && (
//                                 <View style={styles.suggestionsContainer}>
//                                     {suggestions.map((suggestion, index) => (
//                                         <TouchableOpacity
//                                             key={index}
//                                             style={styles.suggestionItem}
//                                             onPress={() => {
//                                                 setFrom(suggestion);
//                                                 setSuggestions([]);
//                                             }}
//                                         >
//                                             <Text>{suggestion}</Text>
//                                         </TouchableOpacity>
//                                     ))}
//                                 </View>
//                             )}
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

// export default HomePage;

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
//         padding: 20,
//         backgroundColor: '#fff',
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     inputContainer: {
//         marginBottom: 15,
//     },
//     input: {
//         backgroundColor: '#f0f0f0',
//         borderRadius: 10,
//         padding: 15,
//         marginBottom: 15,
//     },
//     suggestionsContainer: {
//         backgroundColor: '#e0e0e0',
//         borderRadius: 10,
//         padding: 10,
//         maxHeight: 150,
//         overflow: 'scroll',
//     },
//     suggestionItem: {
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
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
//         backgroundColor: '#fff',
//     },
//     errorText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         color: '#FF6347',
//     },
// });




// import React, { useCallback, useMemo, useRef, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { getDirections } from '@/services/directions';
// import { geoCoding } from '@/services/geoCoding';
// import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

// const HomePage: React.FC = () => {
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//     const router = useRouter();

//     const [from, setFrom] = useState('');
//     const [to, setTo] = useState('');
//     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
//     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
//     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);
//     const [suggestions, setSuggestions] = useState<string[]>([]);

//     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);

//     const handleOpenPress = () => {
//         bottomSheetRef.current?.snapToIndex(1);
//     };

//     const handleClosePress = () => {
//         bottomSheetRef.current?.close();
//     };

//     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
//     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

//     const handleInputChange = (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
//         setter(text);
//         // You can add debouncing logic here to fetch suggestions
//     };

//     const fetchCoordinates = async () => {
//         try {
//             const [pickupCoordinates, destinationCoordinates] = await geoCoding(from, to);
//             setPickupLocation(pickupCoordinates);
//             setDestinationLocation(destinationCoordinates);
//         } catch (error: any) {
//             Alert.alert('Error fetching coordinates', error.message);
//         }
//     };

//     const handleOnPressContinue = async () => {
//         try {
//             await fetchCoordinates();
//             if (pickupLocation && destinationLocation) {
//                 const directions = await getDirections(pickupLocation, destinationLocation);
//                 setDirectionCoordinates(directions);
//             }
//         } catch (error) {
//             Alert.alert('Error fetching directions', error.message);
//         }
//     };

//     const renderBackdrop = useCallback(
//         (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
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
//                 <MapView
//                     style={styles.map}
//                     styleURL="mapbox://styles/mapbox/outdoors-v12"
//                     zoomEnabled={true}
//                     rotateEnabled={false}
//                 >
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

//                     {pickupLocation && (
//                         <ShapeSource
//                             id="pickupSource"
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'Point',
//                                     coordinates: pickupLocation,
//                                 },
//                             }}
//                         >
//                             <SymbolLayer
//                                 id="pickupSymbol"
//                                 style={{
//                                     iconImage: 'marker-15',
//                                     iconSize: 1.5,
//                                     iconOffset: [0, -15],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}

//                     {destinationLocation && (
//                         <ShapeSource
//                             id="destinationSource"
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'Point',
//                                     coordinates: destinationLocation,
//                                 },
//                             }}
//                         >
//                             <SymbolLayer
//                                 id="destinationSymbol"
//                                 style={{
//                                     iconImage: 'marker-15',
//                                     iconSize: 1.5,
//                                     iconOffset: [0, -15],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}

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
//                             }}
//                         >
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
//                                 onChangeText={(text) => handleInputChange(text, setFrom)}
//                                 value={from}
//                                 style={styles.input}
//                                 placeholder="Pickup Location"
//                                 placeholderTextColor="#888"
//                             />
//                             <BottomSheetTextInput
//                                 ref={destinationInputRef}
//                                 onChangeText={(text) => handleInputChange(text, setTo)}
//                                 value={to}
//                                 style={styles.input}
//                                 placeholder="Destination"
//                                 placeholderTextColor="#888"
//                             />
//                             {suggestions.length > 0 && (
//                                 <View style={styles.suggestionsContainer}>
//                                     {suggestions.map((suggestion, index) => (
//                                         <TouchableOpacity
//                                             key={index}
//                                             style={styles.suggestionItem}
//                                             onPress={() => {
//                                                 setFrom(suggestion);
//                                                 setSuggestions([]);
//                                             }}
//                                         >
//                                             <Text>{suggestion}</Text>
//                                         </TouchableOpacity>
//                                     ))}
//                                 </View>
//                             )}
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

// export default HomePage;

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
//         padding: 20,
//         backgroundColor: '#fff',
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: 15,
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: 'bold',
//     },
//     inputContainer: {
//         marginBottom: 15,
//     },
//     input: {
//         backgroundColor: '#f0f0f0',
//         borderRadius: 10,
//         padding: 15,
//         marginBottom: 15,
//     },
//     suggestionsContainer: {
//         backgroundColor: '#e0e0e0',
//         borderRadius: 10,
//         padding: 10,
//         maxHeight: 150,
//         overflow: 'scroll',
//     },
//     suggestionItem: {
//         padding: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: '#ccc',
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
//         backgroundColor: '#fff',
//     },
//     errorText: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         textAlign: 'center',
//         color: '#FF6347',
//     },
// });



// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { getDirections } from '@/services/directions';
// import { geoCoding } from '@/services/geoCoding';
// import { Search } from '@/services/Origin';
// import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';

// const HomePage: React.FC = () => {
//     const headerHeight = useHeaderHeight();
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//     const router = useRouter();

//     const [from, setFrom] = useState<number[]>([]);
//     const [to, setTo] = useState<number[]>([]);

//     const [suggestions, setSuggestions] = useState<any[]>([])

//     const fetchLocationSuggestions = async (from: string) => {
//         try {
//           const suggestions = await geoCoding(from);
//           setSuggestions(suggestions);
//         } catch (error) {
//           console.error('Error fetching location suggestions:', error);
//         }
//       }

//     // const [from, setFrom] = useState('');
//     // const [to, setTo] = useState('');
//     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
//     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
//     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

//     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);

//     const handleOpenPress = () => {
//         bottomSheetRef.current?.snapToIndex(1);
//     };

//     const handleClosePress = () => {
//         bottomSheetRef.current?.close();
//     };

//     const pickupInputRef = useRef<any>(null);
//     const destinationInputRef = useRef<any>(null);

//     // const fetchLocationSuggestions = async (query: string) => {
//     //     try {
//     //         const suggestions = await Search(query);
//     //         setSuggestions(suggestions);
//     //     } catch (error) {
//     //         console.error('Error fetching location suggestions:', error);
//     //     }
//     // };

//     const handleInputChange = (text: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
//         setInput(text);
//         if (text.length > 2) {
//             fetchLocationSuggestions(text);
//         } else {
//             setSuggestions([]);
//         }
//     };

//     const handleOnPressContinue = async () => {
//         if (!from || !to) {
//             Alert.alert('Error', 'Please fill in both pickup and destination locations');
//             return;
//         }

//         try {
//             const pickupCoordinates = await geoCoding(from: any);
//             const destinationCoordinates = await geoCoding(to: any);

//             if (pickupCoordinates && destinationCoordinates) {
//                 setPickupLocation(pickupCoordinates);
//                 setDestinationLocation(destinationCoordinates);

//                 const directions = await getDirections({ pickupCoordinates, destinationCoordinates });
//                 if (directions) {
//                     setDirectionCoordinates(directions);
//                     bottomSheetRef.current?.close(); // Close the bottom sheet
//                     // animateCameraToRoute(pickupCoordinates, destinationCoordinates);
//                 } else {
//                     throw new Error('No route coordinates found');
//                 }
//             } else {
//                 throw new Error('Failed to fetch coordinates for pickup or destination');
//             }
//         } catch (error) {
//             console.error('Error fetching directions:', error);
//             Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
//         }
//     };

//     const renderBackdrop = useCallback(
//         (props: any) => (
//             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
//         ),
//         []
//     );

//     // const animateCameraToRoute = (pickupCoordinates: number[], destinationCoordinates: number[]) => {
//     //     if (pickupCoordinates && destinationCoordinates) {
//     //         mapViewRef.current?.setCamera({
//     //             centerCoordinate: [
//     //                 (pickupCoordinates[0] + destinationCoordinates[0]) / 2,
//     //                 (pickupCoordinates[1] + destinationCoordinates[1]) / 2
//     //             ],
//     //             zoomLevel: 12,
//     //             animationDuration: 2000 // Animation duration in milliseconds
//     //         });
//     //     }
//     // };

//     const mapViewRef = useRef<MapView>(null);

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
//                 <MapView
//                     ref={mapViewRef}
//                     style={styles.map}
//                     styleURL="mapbox://styles/mapbox/outdoors-v12"
//                     zoomEnabled={true}
//                     rotateEnabled={false}
//                 >
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

//                     {pickupLocation && (
//                         <ShapeSource
//                             id="pickupSource"
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'Point',
//                                     coordinates: pickupLocation,
//                                 },
//                             }}
//                         >
//                             <SymbolLayer
//                                 id="pickupSymbol"
//                                 style={{
//                                     iconImage: 'marker-15',
//                                     iconSize: 1.5,
//                                     iconOffset: [0, -15],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}

//                     {destinationLocation && (
//                         <ShapeSource
//                             id="destinationSource"
//                             shape={{
//                                 type: 'Feature',
//                                 geometry: {
//                                     type: 'Point',
//                                     coordinates: destinationLocation,
//                                 },
//                             }}
//                         >
//                             <SymbolLayer
//                                 id="destinationSymbol"
//                                 style={{
//                                     iconImage: 'marker-15',
//                                     iconSize: 1.5,
//                                     iconOffset: [0, -15],
//                                 }}
//                             />
//                         </ShapeSource>
//                     )}

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
//                             }}
//                         >
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
//                                 onChangeText={(text: string) => handleInputChange(text, setFrom)}
//                                 value={from}
//                                 style={styles.input}
//                                 placeholder="Pickup Location"
//                                 placeholderTextColor="#888"
//                             />
//                             <BottomSheetTextInput
//                                 ref={destinationInputRef}smartInsertDelete
//                                 style={styles.input}
//                                 onChangeText={(text: string) => handleInputChange(text, setTo)}
//                                 value={to}
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

// export default HomePage;

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



// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { getDirections } from '@/services/directions';
// import { geoCoding } from '@/services/geoCoding';
// import { Search } from '@/services/Origin';

// const HomePage: React.FC = () => {
//     const headerHeight = useHeaderHeight();
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//     const router = useRouter();

//     const [from, setFrom] = useState('');
//     const [to, setTo] = useState('');
//     const [suggestions, setSuggestions] = useState<any[]>([]);
//     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
//     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
//     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

//     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);

//     const handleOpenPress = () => {
//         bottomSheetRef.current?.snapToIndex(1);
//     };

//     const handleClosePress = () => {
//         bottomSheetRef.current?.close();
//     };

//     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
//     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

//     const fetchLocationSuggestions = async (query: string) => {
//         try {
//             const suggestions = await Search(query);
//             setSuggestions(suggestions);
//         } catch (error) {
//             console.error('Error fetching location suggestions:', error);
//         }
//     };

//     const handleInputChange = (text: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
//         setInput(text);
//         if (text.length > 2) {
//             fetchLocationSuggestions(text);
//         } else {
//             setSuggestions([]);
//         }
//     };

//     const handleOnPressContinue = async () => {
//         if (!from || !to) {
//             Alert.alert('Error', 'Please fill in both pickup and destination locations');
//             return;
//         }

//         try {
//             const pickupCoordinates = await geoCoding(from);
//             const destinationCoordinates = await geoCoding(to);

//             if (pickupCoordinates && destinationCoordinates) {
//                 setPickupLocation(pickupCoordinates);
//                 setDestinationLocation(destinationCoordinates);

//                 const directions = await getDirections({ pickupCoordinates, destinationCoordinates });
//                 if (directions) {
//                     setDirectionCoordinates(directions);
//                     router.push('/vehicles');
//                 } else {
//                     throw new Error('No route coordinates found');
//                 }
//             } else {
//                 throw new Error('Failed to fetch coordinates for pickup or destination');
//             }
//         } catch (error) {
//             console.error('Error fetching directions:', error);
//             Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
//         }
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
//                     styleURL="mapbox://styles/mapbox/outdoors-v12"
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
//                                 onChangeText={(text) => handleInputChange(text, setFrom)}
//                                 value={from}
//                                 style={styles.input}
//                                 placeholder="Pickup Location"
//                                 placeholderTextColor="#888"
//                             />
//                             <BottomSheetTextInput
//                                 ref={destinationInputRef}
//                                 style={styles.input}
//                                 onChangeText={(text) => handleInputChange(text, setTo)}
//                                 value={to}
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

// export default HomePage;



// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Mapbox, { Camera, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import routeResponse from '@/assets/data/route.json';
// import destinationResponse from '@/assets/data/destination.json';
// import geoCodingResponse from '@/assets/data/geoCoding.json';
// import { getDirections } from '@/services/directions'; // Adjust path as needed
// import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
// import { geoCoding } from '@/services/geoCoding';
// import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';

// const HomePage: React.FC = () => {
//     const headerHeight = useHeaderHeight();
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
//     const router = useRouter();

//     const [from, setFrom] = useState('');
//     const [to, setTo] = useState('');
   
//     console.log("From::", from)
//     console.log("To:: ", to)
//     const [pickupLocation, setPickupLocation] = useState<number[] | null>(null);
//     const [destinationLocation, setDestinationLocation] = useState<number[] | null>(null);
//     const [directionCoordinates, setDirectionCoordinates] = useState<number[][] | null>(null);

//     const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);


//     const pickupCoordinates = routeResponse.routes[0].geometry.coordinates;
//     const destinationCoordinates = destinationResponse.features[0].geometry.coordinates;

    

//     const pickupAddress = geoCodingResponse.features[0].place_name;
//     const destinationAddress = geoCodingResponse.features[1].place_name;

//     const [coordinates, setCoordinates] = useState<number[][]>(pickupCoordinates);

//     // console.log("destination:", destinationCoordinates);
//     // console.log("origin: >", pickupCoordinates)
//     const handleOpenPress = () => {
//         bottomSheetRef.current?.snapToIndex(1);
//     };

//     const handleClosePress = () => {
//         bottomSheetRef.current?.close();
//     };

//     const pickupInputRef = useRef<BottomSheetTextInputProps>(null);
//     const destinationInputRef = useRef<BottomSheetTextInputProps>(null);

//     const handleOnPressContinue = async (event: OnPressEvent) => {
//         const newDirections = getDirections()
//         const pickup = pickupInputRef.current?.value;
//         const destination = destinationInputRef.current?.value;
//         //string

//         await geoCoding([event.coordinates.longitude, event.coordinates.latitude],[event.coordinates.longitude, event.coordinates.latitude])

//         const pickUpNums = p

//         if (!pickup || !destination) {
//             Alert.alert('Error', 'Please fill in both pickup and destination locations');
//             return;
//         }

//         try {
//             const pickupCoordinates = await getCoordinatesFromAddress(pickup);
//             const destinationCoordinates = await getCoordinatesFromAddress(destination);

//             if (pickupCoordinates && destinationCoordinates) {
//                 setPickupLocation(pickupCoordinates);
//                 setDestinationLocation(destinationCoordinates);

//                 const coordinates = await getDirections(pickupCoordinates, destinationCoordinates);
//                 if (coordinates) {
//                     setPickupLocation(pickupCoordinates);
//                     setDestinationLocation(destinationCoordinates)
//                     router.push('/vehicles');
//                 } else {
//                     throw new Error('No route coordinates found');
//                 }
//             } else {
//                 throw new Error('Failed to fetch coordinates for pickup or destination');
//             }
//         } catch (error) {
//             console.error('Error fetching directions:', error);
//             Alert.alert('Error', 'Failed to fetch directions. Please try again later.');
//         }
//     };

//     const renderBackdrop = useCallback(
//         (props: any) => (
//             <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0} {...props} />
//         ),
//         []
//     );

//     const getCoordinatesFromAddress = async (address: string): Promise<number[] | null> => {
//         // Implement your logic to convert address to coordinates (geocoding)
        
//         // This is where you would typically use a geocoding API
//         return null; // Replace with actual implementation
//     };

//     if (!accessToken) {
//         return (
//             <SafeAreaView style={styles.errorContainer}>
//                 <Text style={styles.errorText}>Map cannot be displayed without a valid access token</Text>
//             </SafeAreaView>
//         );
//     }

//     Mapbox.setAccessToken(accessToken);

//     useEffect(() => {
//         setCoordinates(pickupCoordinates);
//     },[])
    

//     return (
//         <>
//             <StatusBar style="dark" />
//             <View style={styles.container}>
//                 <MapView style={styles.map}
//                     styleURL="mapbox://styles/mapbox/outdoors-v12"
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
//                                 onChangeText={setFrom}
//                                 value={from}
//                                 style={styles.input}
//                                 placeholder="Pickup Location"
//                                 placeholderTextColor="#888"
//                             />
//                             <BottomSheetTextInput
//                                 ref={destinationInputRef}
//                                 style={styles.input}
//                                 onChangeText={setTo}
//                                 value={to}
//                                 placeholder="Destination"
//                                 placeholderTextColor="#888"
//                             />
//                         </View>
//                         <TouchableOpacity style={styles.continueButton} onPress={() => handleOnPressContinue}>
//                             <Text style={styles.buttonText2}>Continue</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </BottomSheet>
//             </View>
//         </>
//     );
// };

// export default HomePage;

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