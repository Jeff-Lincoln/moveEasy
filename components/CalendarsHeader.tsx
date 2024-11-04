import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { BlurView } from 'expo-blur'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'

interface CalendarHeaderProps {
    id: any;
}


const CalendarHeader = () => {
    const { top } = useSafeAreaInsets()
    const navigation = useNavigation()
    const router = useRouter()
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(-20)).current
    
    // Get the vehicle ID from URL params
    const { id } = useLocalSearchParams()

    const startEntryAnimation = () => {
        // Reset animation values
        fadeAnim.setValue(0)
        slideAnim.setValue(-20)

        // Start entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start()
    }

    useEffect(() => {
        // Start animation when component mounts
        startEntryAnimation()

        // Add focus listener for when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            startEntryAnimation()
        })

        // Cleanup
        return unsubscribe
    }, [navigation])

    const onToggle = () => {
        navigation.dispatch(DrawerActions.toggleDrawer())
    }

    const onClosePress = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Navigate back to vehicle detail page with the ID
            router.push({
                pathname: "/(authenticated)/(tabs)/vehicles/[id]",
                params: { id }
            })
        })
    }

    return (
        <>
            <StatusBar style="dark" />
            <BlurView intensity={90} tint="light" style={{ paddingTop: top }}>
                <Animated.View 
                    style={[
                        styles.container,
                        {
                            opacity: fadeAnim,
                            transform: [{
                                translateY: slideAnim
                            }]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onToggle}
                        activeOpacity={0.7}
                    >
                        <Feather name="menu" size={24} color="#333" />
                    </TouchableOpacity>

                    <View style={styles.headerContainer}>
                        <MaterialIcons name="schedule" size={24} color="#333" />
                        <Text style={styles.headerText}>Schedule Pick Up</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onClosePress}
                        activeOpacity={0.7}
                    >
                        <Feather name="x" size={24} color="#333" />
                    </TouchableOpacity>
                </Animated.View>
            </BlurView>
        </>
    )
}

export default CalendarHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        letterSpacing: 0.3,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
})



// import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
// import React, { useEffect, useRef } from 'react'
// import { BlurView } from 'expo-blur'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { Feather, MaterialIcons } from '@expo/vector-icons'
// import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
// import { DrawerActions } from '@react-navigation/native'
// import { StatusBar } from 'expo-status-bar'

// const CalendarHeader = () => {
//     const { top } = useSafeAreaInsets()
//     const navigation = useNavigation()
//     const router = useRouter()
//     const fadeAnim = useRef(new Animated.Value(0)).current
//     const slideAnim = useRef(new Animated.Value(-20)).current

//     const { id } = useLocalSearchParams();  // This will get the vehicle ID


//     const startEntryAnimation = () => {
//         // Reset animation values
//         fadeAnim.setValue(0)
//         slideAnim.setValue(-20)

//         // Start entry animation
//         Animated.parallel([
//             Animated.timing(fadeAnim, {
//                 toValue: 1,
//                 duration: 500,
//                 useNativeDriver: true,
//             }),
//             Animated.timing(slideAnim, {
//                 toValue: 0,
//                 duration: 500,
//                 useNativeDriver: true,
//             })
//         ]).start()
//     }

//     useEffect(() => {
//         // Start animation when component mounts
//         startEntryAnimation()

//         // Add focus listener for when screen comes into focus
//         const unsubscribe = navigation.addListener('focus', () => {
//             startEntryAnimation()
//         })

//         // Cleanup
//         return unsubscribe
//     }, [navigation])

//     const onToggle = () => {
//         navigation.dispatch(DrawerActions.toggleDrawer())
//     }

//     const onClosePress = () => {
//         Animated.parallel([
//             Animated.timing(fadeAnim, {
//                 toValue: 0,
//                 duration: 300,
//                 useNativeDriver: true,
//             }),
//             Animated.timing(slideAnim, {
//                 toValue: 20,
//                 duration: 300,
//                 useNativeDriver: true,
//             })
//         ]).start(() => {
//             router.push({
//                 pathname: "/(authenticated)/(tabs)/vehicles/[id]",
//                 params: { id }  // Use the ID from params to navigate back
//             });
//         })
//     }

//     return (
//         <>
//             <StatusBar style="dark" />
//             <BlurView intensity={90} tint="light" style={{ paddingTop: top }}>
//                 <Animated.View 
//                     style={[
//                         styles.container,
//                         {
//                             opacity: fadeAnim,
//                             transform: [{
//                                 translateY: slideAnim
//                             }]
//                         }
//                     ]}
//                 >
//                     <TouchableOpacity
//                         style={styles.iconButton}
//                         onPress={onToggle}
//                         activeOpacity={0.7}
//                     >
//                         <Feather name="menu" size={24} color="#333" />
//                     </TouchableOpacity>

//                     <View style={styles.headerContainer}>
//                         <MaterialIcons name="schedule" size={24} color="#333" />
//                         <Text style={styles.headerText}>Schedule Pick Up</Text>
//                     </View>

//                     <TouchableOpacity
//                         style={styles.iconButton}
//                         onPress={onClosePress}
//                         activeOpacity={0.7}
//                     >
//                         <Feather name="x" size={24} color="#333" />
//                     </TouchableOpacity>
//                 </Animated.View>
//             </BlurView>
//         </>
//     )
// }

// export default CalendarHeader

// const styles = StyleSheet.create({
//     container: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         height: 60,
//         paddingHorizontal: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: 'rgba(0, 0, 0, 0.05)',
//     },
//     headerContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: '#333',
//         letterSpacing: 0.3,
//     },
//     iconButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 12,
//         backgroundColor: 'rgba(0, 0, 0, 0.05)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// })


// // import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native'
// // import React, { useEffect, useRef } from 'react'
// // import { BlurView } from 'expo-blur'
// // import { useSafeAreaInsets } from 'react-native-safe-area-context'
// // import { Feather, MaterialIcons } from '@expo/vector-icons'
// // import { useNavigation, useRouter } from 'expo-router'
// // import { DrawerActions } from '@react-navigation/native'
// // import { StatusBar } from 'expo-status-bar'

// // const CalendarHeader = () => {
// //     const { top } = useSafeAreaInsets()
// //     const navigation = useNavigation()
// //     const router = useRouter()
// //     const fadeAnim = useRef(new Animated.Value(0)).current
// //     const slideAnim = useRef(new Animated.Value(-20)).current

// //     useEffect(() => {
// //         Animated.parallel([
// //             Animated.timing(fadeAnim, {
// //                 toValue: 1,
// //                 duration: 500,
// //                 useNativeDriver: true,
// //             }),
// //             Animated.timing(slideAnim, {
// //                 toValue: 0,
// //                 duration: 500,
// //                 useNativeDriver: true,
// //             })
// //         ]).start()
// //     }, [])

// //     const onToggle = () => {
// //         navigation.dispatch(DrawerActions.toggleDrawer())
// //     }

// //     const onClosePress = () => {
// //         Animated.parallel([
// //             Animated.timing(fadeAnim, {
// //                 toValue: 0,
// //                 duration: 300,
// //                 useNativeDriver: true,
// //             }),
// //             Animated.timing(slideAnim, {
// //                 toValue: 20,
// //                 duration: 300,
// //                 useNativeDriver: true,
// //             })
// //         ]).start(() => {
// //             router.push('/vehicleDetail')
// //         })
// //     }

// //     return (
// //         <>
// //             <StatusBar style="dark" />
// //             <BlurView intensity={90} tint="light" style={{ paddingTop: top }}>
// //                 <Animated.View 
// //                     style={[
// //                         styles.container,
// //                         {
// //                             opacity: fadeAnim,
// //                             transform: [{
// //                                 translateY: slideAnim
// //                             }]
// //                         }
// //                     ]}
// //                 >
// //                     <TouchableOpacity
// //                         style={styles.iconButton}
// //                         onPress={onToggle}
// //                         activeOpacity={0.7}
// //                     >
// //                         <Feather name="menu" size={24} color="#333" />
// //                     </TouchableOpacity>

// //                     <View style={styles.headerContainer}>
// //                         <MaterialIcons name="schedule" size={24} color="#333" />
// //                         <Text style={styles.headerText}>Schedule Pick Up</Text>
// //                     </View>

// //                     <TouchableOpacity
// //                         style={styles.iconButton}
// //                         onPress={onClosePress}
// //                         activeOpacity={0.7}
// //                     >
// //                         <Feather name="x" size={24} color="#333" />
// //                     </TouchableOpacity>
// //                 </Animated.View>
// //             </BlurView>
// //         </>
// //     )
// // }

// // export default CalendarHeader

// // const styles = StyleSheet.create({
// //     container: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'space-between',
// //         height: 60,
// //         paddingHorizontal: 16,
// //         borderBottomWidth: 1,
// //         borderBottomColor: 'rgba(0, 0, 0, 0.05)',
// //     },
// //     headerContainer: {
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         gap: 8,
// //     },
// //     headerText: {
// //         fontSize: 20,
// //         fontWeight: '600',
// //         color: '#333',
// //         letterSpacing: 0.3,
// //     },
// //     iconButton: {
// //         width: 40,
// //         height: 40,
// //         borderRadius: 12,
// //         backgroundColor: 'rgba(0, 0, 0, 0.05)',
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //     },
// // })

// // // import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
// // // import React, { useEffect, useRef } from 'react';
// // // import { BlurView } from 'expo-blur';
// // // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // // import { Entypo, FontAwesome } from '@expo/vector-icons';
// // // import { useNavigation, useRouter } from 'expo-router';
// // // import { DrawerActions } from '@react-navigation/native';
// // // import { StatusBar } from 'expo-status-bar';

// // // const { width } = Dimensions.get('window');

// // // const CalendarHeader = () => {
// // //     const { top } = useSafeAreaInsets();
// // //     const navigation = useNavigation();
// // //     const router = useRouter();
    
// // //     // Animation values
// // //     const fadeAnim = useRef(new Animated.Value(0)).current;
// // //     const slideAnim = useRef(new Animated.Value(-50)).current;

// // //     useEffect(() => {
// // //         // Animate header on mount
// // //         Animated.parallel([
// // //             Animated.timing(fadeAnim, {
// // //                 toValue: 1,
// // //                 duration: 600,
// // //                 useNativeDriver: true,
// // //             }),
// // //             Animated.spring(slideAnim, {
// // //                 toValue: 0,
// // //                 tension: 50,
// // //                 friction: 8,
// // //                 useNativeDriver: true,
// // //             })
// // //         ]).start();
// // //     }, []);

// // //     const onToggle = () => {
// // //         // Add haptic feedback here if desired
// // //         navigation.dispatch(DrawerActions.toggleDrawer());
// // //     };

// // //     const onClosePress = () => {
// // //         // Animate out before navigation
// // //         Animated.parallel([
// // //             Animated.timing(fadeAnim, {
// // //                 toValue: 0,
// // //                 duration: 200,
// // //                 useNativeDriver: true,
// // //             }),
// // //             Animated.timing(slideAnim, {
// // //                 toValue: 50,
// // //                 duration: 200,
// // //                 useNativeDriver: true,
// // //             })
// // //         ]).start(() => {
// // //             router.push('/vehicleDetail');
// // //         });
// // //     };

// // //     return (
// // //         <>
// // //             <StatusBar style='light' />
// // //             <View style={[styles.container, { paddingTop: top }]}>
// // //                 <Animated.View 
// // //                     style={[
// // //                         styles.animatedContainer,
// // //                         {
// // //                             opacity: fadeAnim,
// // //                             transform: [{ translateY: slideAnim }]
// // //                         }
// // //                     ]}
// // //                 >
// // //                     <BlurView intensity={90} tint="dark" style={styles.blurContainer}>
// // //                         <TouchableOpacity 
// // //                             style={styles.roundButton}
// // //                             onPress={onToggle}
// // //                             activeOpacity={0.7}
// // //                         >
// // //                             <Entypo name="menu" size={24} color="#fff" />
// // //                         </TouchableOpacity>

// // //                         <View style={styles.headerStyle}>
// // //                             <Text style={styles.headerText}>Schedule Your Pick Up</Text>
// // //                             <View style={styles.indicator} />
// // //                         </View>

// // //                         <TouchableOpacity 
// // //                             style={styles.closeButton}
// // //                             onPress={onClosePress}
// // //                             activeOpacity={0.7}
// // //                         >
// // //                             <FontAwesome name="close" size={26} color="#1fd655" />
// // //                         </TouchableOpacity>
// // //                     </BlurView>
// // //                 </Animated.View>
// // //             </View>
// // //         </>
// // //     );
// // // };

// // // export default CalendarHeader;

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         backgroundColor: 'rgba(0, 0, 0, 0.6)',
// // //         zIndex: 100,
// // //     },
// // //     animatedContainer: {
// // //         width: '100%',
// // //         alignItems: 'center',
// // //         paddingHorizontal: 16,
// // //         paddingVertical: 8,
// // //     },
// // //     blurContainer: {
// // //         flexDirection: 'row',
// // //         alignItems: 'center',
// // //         justifyContent: 'space-between',
// // //         paddingHorizontal: 16,
// // //         height: 60,
// // //         borderRadius: 16,
// // //         width: '100%',
// // //         maxWidth: 500,
// // //         backgroundColor: 'rgba(255, 255, 255, 0.1)',
// // //         shadowColor: '#000',
// // //         shadowOffset: {
// // //             width: 0,
// // //             height: 2,
// // //         },
// // //         shadowOpacity: 0.25,
// // //         shadowRadius: 3.84,
// // //         elevation: 5,
// // //     },
// // //     roundButton: {
// // //         width: 40,
// // //         height: 40,
// // //         borderRadius: 20,
// // //         backgroundColor: 'rgba(255, 255, 255, 0.15)',
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         shadowColor: '#000',
// // //         shadowOffset: {
// // //             width: 0,
// // //             height: 1,
// // //         },
// // //         shadowOpacity: 0.22,
// // //         shadowRadius: 2.22,
// // //         elevation: 3,
// // //     },
// // //     headerStyle: {
// // //         flex: 1,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //     },
// // //     headerText: {
// // //         fontSize: 18,
// // //         fontWeight: 'bold',
// // //         color: '#fff',
// // //         textAlign: 'center',
// // //         letterSpacing: 0.5,
// // //         textShadowColor: 'rgba(0, 0, 0, 0.3)',
// // //         textShadowOffset: { width: 0, height: 1 },
// // //         textShadowRadius: 2,
// // //     },
// // //     indicator: {
// // //         position: 'absolute',
// // //         bottom: -12,
// // //         width: 20,
// // //         height: 3,
// // //         backgroundColor: '#1fd655',
// // //         borderRadius: 1.5,
// // //     },
// // //     closeButton: {
// // //         width: 40,
// // //         height: 40,
// // //         borderRadius: 20,
// // //         backgroundColor: 'rgba(31, 214, 85, 0.15)',
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         shadowColor: '#000',
// // //         shadowOffset: {
// // //             width: 0,
// // //             height: 1,
// // //         },
// // //         shadowOpacity: 0.22,
// // //         shadowRadius: 2.22,
// // //         elevation: 3,
// // //     }
// // // });



// // // // import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// // // // import React from 'react';
// // // // import { BlurView } from 'expo-blur';
// // // // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // // // import { Entypo, FontAwesome } from '@expo/vector-icons';
// // // // import { useNavigation, useRouter } from 'expo-router';
// // // // import { DrawerActions } from '@react-navigation/native';
// // // // import { StatusBar } from 'expo-status-bar';

// // // // const CalendarHeader = () => {
// // // //     const { top } = useSafeAreaInsets();
// // // //     const navigation = useNavigation();
// // // //     const router = useRouter();

// // // //     const onToggle = () => {
// // // //         navigation.dispatch(DrawerActions.toggleDrawer());
// // // //     };

// // // //     const onClosePress = () => {
// // // //         router.push('/vehicleDetail');
// // // //     };

// // // //     return (
// // // //         <>
// // // //             <StatusBar style='light' />
// // // //             <View style={{ paddingTop: top, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
// // // //                 <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
// // // //                     <TouchableOpacity style={styles.roundButton} onPress={onToggle}>
// // // //                         <Entypo name="menu" size={24} color="#fff" />
// // // //                     </TouchableOpacity>

// // // //                     <View style={styles.headerStyle}>
// // // //                         <Text style={styles.headerText}>Schedule Your Pick Up</Text>
// // // //                     </View>

// // // //                     <TouchableOpacity onPress={onClosePress}>
// // // //                         <FontAwesome name="close" size={26} color="#1fd655" />
// // // //                     </TouchableOpacity>
// // // //                 </BlurView>
// // // //             </View>
// // // //         </>
// // // //     );
// // // // };

// // // // export default CalendarHeader;

// // // // const styles = StyleSheet.create({
// // // //     blurContainer: {
// // // //         flexDirection: 'row',
// // // //         alignItems: 'center',
// // // //         justifyContent: 'space-between',
// // // //         paddingHorizontal: 20,
// // // //         height: 60,
// // // //         borderRadius: 10,
// // // //         marginHorizontal: 10,
// // // //         backgroundColor: 'rgba(255, 255, 255, 0.1)',
// // // //     },
// // // //     roundButton: {
// // // //         width: 40,
// // // //         height: 40,
// // // //         borderRadius: 20,
// // // //         backgroundColor: 'rgba(255, 255, 255, 0.2)',
// // // //         justifyContent: 'center',
// // // //         alignItems: 'center',
// // // //     },
// // // //     headerStyle: {
// // // //         flex: 1,
// // // //         justifyContent: 'center',
// // // //         alignItems: 'center',
// // // //     },
// // // //     headerText: {
// // // //         fontSize: 18,
// // // //         fontWeight: 'bold',
// // // //         color: '#fff',
// // // //         textAlign: 'center',
// // // //     },
// // // // });



// // // // // import { StyleSheet, Text, Touchable, View } from 'react-native'
// // // // // import React from 'react'
// // // // // import { BlurView } from 'expo-blur'
// // // // // import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
// // // // // import Colors from '@/constants/Colors'
// // // // // import { useSafeAreaInsets } from 'react-native-safe-area-context'
// // // // // import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
// // // // // import { useNavigation, useRouter } from 'expo-router'
// // // // // import { DrawerActions } from '@react-navigation/native';
// // // // // import { FontAwesome5 } from '@expo/vector-icons';
// // // // // import { StatusBar } from 'expo-status-bar';
// // // // // import { FontAwesome } from '@expo/vector-icons';

// // // // // const CalendarHeader = () => {
// // // // //     const { top } = useSafeAreaInsets();
// // // // //     const navigation = useNavigation();
// // // // //     const router = useRouter();

// // // // //     const onToggle = () => {
// // // // //         navigation.dispatch(DrawerActions.toggleDrawer())
// // // // //     }

// // // // //     const onClosePress = () => {
// // // // //         router.push('/vehicleDetail')
// // // // //     }

// // // // //     return (
// // // // //         <>
// // // // //             <StatusBar style='dark' />
// // // // //             <View style={{ paddingTop: top }}>
// // // // //                 <View style={styles.container}>
// // // // //                     <TouchableOpacity style={styles.roundButton}
// // // // //                         onPress={onToggle}>
// // // // //                         <Entypo name="menu" size={26} color="black" />
// // // // //                         {/* <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>JL</Text> */}
// // // // //                     </TouchableOpacity>
// // // // //                     <View style={styles.headerStyle}>
// // // // //                         {/* <FontAwesome5 name="truck" size={24} color="#000" /> */}
// // // // //                         <Text style={styles.headerText}>Schedule Your Pick Up</Text>
// // // // //                     </View>
// // // // //                     {/* <View style={styles.searchSection}>
// // // // //                         <Ionicons
// // // // //                             style={styles.searchIcon}
// // // // //                             name='search' size={20} color={Colors.dark} />
// // // // //                         <TextInput style={styles.input}
// // // // //                             placeholder='Search'
// // // // //                             placeholderTextColor={Colors.dark} />
// // // // //                     </View> */}
// // // // //                     <View>
// // // // //                         <TouchableOpacity onPress={onClosePress}>
// // // // //                             <FontAwesome name="close" size={30} color="#1fd655" />
// // // // //                         </TouchableOpacity>
// // // // //                     </View>

// // // // //                     {/* <View style={styles.circle}>
// // // // //                         <TouchableOpacity style={styles.roundButton}>
// // // // //                             <MaterialIcons name="my-location" size={20} color="black" />
// // // // //                         </TouchableOpacity>
// // // // //                     </View> */}
// // // // //                 </View>
// // // // //             </View>
// // // // //         </>
// // // // //     )
// // // // // }

// // // // // export default CalendarHeader;

// // // // // const styles = StyleSheet.create({
// // // // //     container: {
// // // // //         flexDirection: 'row',
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //         height: 60,
// // // // //         backgroundColor: '#fff',
// // // // //         gap: 10,
// // // // //         paddingHorizontal: 20,
// // // // //     },
// // // // //     roundButton: {
// // // // //         width: 40,
// // // // //         height: 40,
// // // // //         borderRadius: 20,
// // // // //         backgroundColor: Colors.lightGray,
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //     },
// // // // //     searchSection: {
// // // // //         flex: 1,
// // // // //         flexDirection: 'row',
// // // // //         backgroundColor: Colors.lightGray,
// // // // //         borderRadius: 30,
// // // // //         alignItems: "center",
// // // // //         justifyContent: 'center',

// // // // //     },
// // // // //     input: {
// // // // //         flex: 1,
// // // // //         paddingTop: 10,
// // // // //         paddingRight: 10,
// // // // //         paddingBottom: 10,
// // // // //         paddingLeft: 0,
// // // // //         color: Colors.dark,
// // // // //     },
// // // // //     searchIcon: {
// // // // //         padding: 10
// // // // //     },
// // // // //     circle: {
// // // // //         width: 40,
// // // // //         height: 40,
// // // // //         borderRadius: 20,
// // // // //         backgroundColor: Colors.lightGray,
// // // // //         justifyContent: 'center',
// // // // //         alignItems: 'center',
// // // // //     },
// // // // //     headerStyle: {
// // // // //         flex: 1,
// // // // //         flexDirection: 'row',
// // // // //         justifyContent: 'center',
// // // // //         gap: 6
// // // // //     },
// // // // //     headerText: {
// // // // //         fontWeight: 'bold',
// // // // //         fontSize: 20,
// // // // //         color: '#000'
// // // // //     }
// // // // // })