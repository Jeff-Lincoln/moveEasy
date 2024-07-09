import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useHeaderHeight } from '@react-navigation/elements';
import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HomePage = () => {
    const headerHeight = useHeaderHeight();
    const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';
    const router = useRouter();

    const handleOnPressContinue = () => {
        router.push('/myOrders');
    }

    Mapbox.setAccessToken(accessToken);

    const snapPoints = useMemo(() => ['25%', '50%', '75%', '90%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleOpenPress = () => {
        bottomSheetRef.current?.snapToIndex(2);

    };
    const handleClosePress = () => {
        bottomSheetRef.current?.close();

    }
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop appearsOnIndex={2} disappearsOnIndex={0}
            {...props} />,
        []
    );

    return (
        <>
            <StatusBar style='dark' />
            <View style={{ flex: 1 }}>
                <MapView style={{ flex: 1 }} styleURL=''>
                    <Camera followUserLocation followZoomLevel={12} />
                    <LocationPuck
                        topImage="topImage"
                        visible={true}
                        scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
                        pulsing={{
                            isEnabled: true,
                            color: 'blue',
                            radius: 70.0,
                        }}
                    />
                </MapView>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}
                        onPress={handleOpenPress}>
                        <Text style={styles.buttonText1}>Book Move-Easy</Text>
                        <AntDesign name="arrowright" size={24} color="black" style={styles.arrowIcon} />
                    </TouchableOpacity>
                </View>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    index={0}
                    enablePanDownToClose={true}
                    handleIndicatorStyle={{ backgroundColor: 'blue' }}
                    backgroundStyle={{ backgroundColor: '#fff' }}
                >
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Good Morning, Jeff!</Text>
                    </View>
                    {/* <Text>Enter Your Location</Text> */}
                    <BottomSheetTextInput style={styles.input}
                        placeholder='Where From?'
                    />

                    <BottomSheetTextInput style={styles.input}
                        placeholder='Where To?'
                    />

                    <TouchableOpacity style={styles.continueButton}
                        onPress={handleOnPressContinue}>
                        <Text style={styles.buttonText2}>Continue</Text>
                    </TouchableOpacity>

                </BottomSheet>
            </View>
        </>
    )
}

export default HomePage;

const styles = StyleSheet.create({
    buttonContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 10,
        alignItems: 'center',
    },
    buttonContent: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 20,
        backgroundColor: '#FFEA00',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    buttonText1: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    buttonText2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    arrowIcon: {
        marginLeft: 10,
    },
    input: {
        marginTop: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        lineHeight: 20,
        padding: 10,
        backgroundColor: 'rgba(151, 151, 151, 0.25)',
        color: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: 'yellow',
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
        marginBottom: 20,
    },
    continueButton: {
        width: '100%',
        backgroundColor: 'yellow',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.9,
        shadowRadius: 2,
        elevation: 5,
        marginBottom: 20,
    },
});




// import React, { useMemo, useRef } from 'react';
// import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Svg, { Path } from 'react-native-svg';
// import BottomSheet from '@gorhom/bottom-sheet';
// import { AntDesign } from '@expo/vector-icons';

// const HomePage = () => {
//     const headerHeight = useHeaderHeight();
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

//     Mapbox.setAccessToken(accessToken);

//     const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
//     const bottomSheetRef = useRef<BottomSheet>(null);


//     return (
//         <>
//             <StatusBar style='dark' />
//             <View style={{ flex: 1, marginTop: headerHeight }}>
//                 <MapView style={{ flex: 1 }} styleURL=''>
//                     <Camera followUserLocation followZoomLevel={12} />
//                     <LocationPuck
//                         topImage="topImage"
//                         visible={true}
//                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
//                         pulsing={{
//                             isEnabled: true,
//                             color: 'blue',
//                             radius: 70.0,
//                         }}
//                     />
//                 </MapView>
//                 <View style={[]}>
//                     <TouchableOpacity style={styles.buttonContainer}>
//                         <Text>Book Move-Easy</Text>
//                         <AntDesign name="arrowright" size={24} color="black" />
//                     </TouchableOpacity>
//                 </View>
//                 {/* <BottomSheet
//                 ref={bottomSheetRef}
//                 snapPoints={snapPoints}
//                     index={1}>
//                     <View>
//                         <Text>Hello World</Text>
//                     </View>
//                 </BottomSheet> */}
//             </View>
//         </>
//     )
// }

// export default HomePage

// const styles = StyleSheet.create({
//     wave: {
//         position: 'absolute',
//         bottom: 0,
//         width: '100%',
//         height: 80,
//     },
//     buttonContainer: {
//         position: 'absolute',
//         bottom: 0,
//         width: '100%',
//         paddingHorizontal: 20, // Adjust padding as needed
//         paddingVertical: 20,
//         backgroundColor: 'yellow',
//         marginBottom: 10,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.8,
//         shadowRadius: 2,
//         elevation: 5,
//         borderRadius: 20, // Border radius for the curved left edge
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between', // Ensure arrow is on the rightmost side
//     },
//     arrowIcon: {
//         marginRight: 10, // Adjust spacing between button content and arrow
//         // Add any additional styling for the arrow icon
//     },
//     buttonText: {
//         fontSize: 26,
//         fontWeight: 'bold',
//         color: 'black',
//         // Add any additional text styling
//     },
// });


// import { Button, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import { StatusBar } from 'expo-status-bar';
// import { useHeaderHeight } from '@react-navigation/elements';
// import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const HomePage = () => {
//     const headerHeight = useHeaderHeight();
//     const accessToken = process.env.EXPO_PUBLIC_MAPBOX_KEY || '';

//     Mapbox.setAccessToken(accessToken);

//     return (
//         <>
//             <StatusBar style='dark' />
//             <View style={{ flex: 1, marginTop: headerHeight }}>
//                 <MapView style={{ flex: 1 }} styleURL=''>
//                     <Camera followUserLocation followZoomLevel={14} />
//                     <LocationPuck
//                         topImage="topImage"
//                         visible={true}
//                         scale={['interpolate', ['linear'], ['zoom'], 10, 1.0, 20, 4.0]}
//                         pulsing={{
//                             isEnabled: true,
//                             color: 'blue',
//                             radius: 70.0,
//                         }}
//                     />
//                 </MapView>
//             </View>
//         </>
//     )
// }

// export default HomePage

// const styles = StyleSheet.create({})