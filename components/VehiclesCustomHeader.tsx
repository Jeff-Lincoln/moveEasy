import { StyleSheet, Text, View, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { BlurView } from 'expo-blur'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'

const VehiclesCustomHeader = () => {
    const { top } = useSafeAreaInsets()
    const navigation = useNavigation()
    const router = useRouter()
    const [isFocused, setIsFocused] = useState(false)
    const fadeAnim = useRef(new Animated.Value(0)).current
    const slideAnim = useRef(new Animated.Value(-20)).current
    const searchAnimation = useRef(new Animated.Value(0)).current

    const startEntryAnimation = () => {
        fadeAnim.setValue(0)
        slideAnim.setValue(-20)

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
        startEntryAnimation()
        const unsubscribe = navigation.addListener('focus', () => {
            startEntryAnimation()
        })
        return unsubscribe
    }, [navigation])

    useEffect(() => {
        Animated.timing(searchAnimation, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start()
    }, [isFocused])

    const searchWidth = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['95%', '100%']
    })

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
            router.push('/Home')
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

                    <Animated.View style={[styles.searchSection, { width: searchWidth }]}>
                        <Feather 
                            style={styles.searchIcon} 
                            name='search' 
                            size={18} 
                            color={isFocused ? "#333" : "#666"} 
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Search vehicles...'
                            placeholderTextColor="#666"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            selectionColor="#333"
                        />
                        {isFocused && (
                            <TouchableOpacity 
                                onPress={() => setIsFocused(false)}
                                style={styles.clearButton}
                            >
                                <Feather name="x-circle" size={16} color="#666" />
                            </TouchableOpacity>
                        )}
                    </Animated.View>

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

export default VehiclesCustomHeader

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchSection: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderRadius: 12,
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 40,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    input: {
        flex: 1,
        paddingVertical: 8,
        paddingLeft: 5,
        color: '#333',
        fontSize: 16,
        fontWeight: '400',
    },
    searchIcon: {
        marginRight: 8,
    },
    clearButton: {
        padding: 4,
    },
})


// import { StyleSheet, Text, View, Animated } from 'react-native';
// import React, { useEffect, useRef, useState } from 'react';
// import { BlurView } from 'expo-blur';
// import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
// import Colors from '@/constants/Colors';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Entypo, Ionicons, FontAwesome } from '@expo/vector-icons';
// import { useNavigation, useRouter } from 'expo-router';
// import { DrawerActions } from '@react-navigation/native';
// import { StatusBar } from 'expo-status-bar';

// const VehiclesCustomHeader = () => {
//     const { top } = useSafeAreaInsets();
//     const navigation = useNavigation();
//     const router = useRouter();
//     const [isFocused, setIsFocused] = useState(false);
//     const searchAnimation = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         Animated.timing(searchAnimation, {
//             toValue: isFocused ? 1 : 0,
//             duration: 200,
//             useNativeDriver: false,
//         }).start();
//     }, [isFocused]);

//     const searchWidth = searchAnimation.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['90%', '100%']
//     });

//     const onToggle = () => {
//         navigation.dispatch(DrawerActions.toggleDrawer());
//     };

//     const onClosePress = () => {
//         router.push('/Home');
//     };

//     return (
//         <>
//             <StatusBar style='light' />
//             <BlurView intensity={100} tint="dark" style={[styles.blurContainer, { paddingTop: top }]}>
//                 <View style={styles.container}>
//                     <TouchableOpacity 
//                         style={styles.roundButton}
//                         onPress={onToggle}
//                         activeOpacity={0.7}
//                     >
//                         <Entypo name="menu" size={24} color="#fff" />
//                     </TouchableOpacity>

//                     <Animated.View style={[styles.searchSection, { width: searchWidth }]}>
//                         <Ionicons 
//                             style={styles.searchIcon} 
//                             name='search' 
//                             size={20} 
//                             color={isFocused ? "#1fd655" : "#8E8E93"} 
//                         />
//                         <TextInput
//                             style={styles.input}
//                             placeholder='Search vehicles...'
//                             placeholderTextColor="#8E8E93"
//                             onFocus={() => setIsFocused(true)}
//                             onBlur={() => setIsFocused(false)}
//                             selectionColor="#1fd655"
//                         />
//                         {isFocused && (
//                             <TouchableOpacity 
//                                 onPress={() => setIsFocused(false)}
//                                 style={styles.clearButton}
//                             >
//                                 <Ionicons name="close-circle" size={16} color="#8E8E93" />
//                             </TouchableOpacity>
//                         )}
//                     </Animated.View>

//                     <TouchableOpacity 
//                         onPress={onClosePress}
//                         style={styles.closeButton}
//                         activeOpacity={0.7}
//                     >
//                         <FontAwesome name="close" size={24} color="#1fd655" />
//                     </TouchableOpacity>
//                 </View>
//             </BlurView>
//         </>
//     );
// };

// export default VehiclesCustomHeader;

// const styles = StyleSheet.create({
//     blurContainer: {
//         backgroundColor: 'rgba(28, 28, 30, 0.9)',
//     },
//     container: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         height: 60,
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderBottomWidth: 0.5,
//         borderBottomColor: 'rgba(58, 58, 60, 0.6)',
//     },
//     roundButton: {
//         width: 36,
//         height: 36,
//         borderRadius: 18,
//         backgroundColor: 'rgba(58, 58, 60, 0.8)',
//         justifyContent: 'center',
//         alignItems: 'center',
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 3.84,
//         elevation: 5,
//     },
//     searchSection: {
//         flex: 1,
//         flexDirection: 'row',
//         backgroundColor: 'rgba(58, 58, 60, 0.6)',
//         borderRadius: 12,
//         alignItems: 'center',
//         paddingHorizontal: 12,
//         marginHorizontal: 10,
//         height: 36,
//         borderWidth: 1,
//         borderColor: 'rgba(58, 58, 60, 0.8)',
//     },
//     input: {
//         flex: 1,
//         paddingVertical: 8,
//         paddingLeft: 5,
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '400',
//     },
//     searchIcon: {
//         marginRight: 8,
//     },
//     clearButton: {
//         padding: 4,
//     },
//     closeButton: {
//         width: 36,
//         height: 36,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });



// // import { StyleSheet, Text, View } from 'react-native';
// // import React from 'react';
// // import { BlurView } from 'expo-blur';
// // import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
// // import Colors from '@/constants/Colors';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { Entypo, Ionicons, FontAwesome } from '@expo/vector-icons';
// // import { useNavigation, useRouter } from 'expo-router';
// // import { DrawerActions } from '@react-navigation/native';
// // import { StatusBar } from 'expo-status-bar';

// // const vehiclesCustomHeader = () => {
// //     const { top } = useSafeAreaInsets();
// //     const navigation = useNavigation();
// //     const router = useRouter();

// //     const onToggle = () => {
// //         navigation.dispatch(DrawerActions.toggleDrawer());
// //     };

// //     const onClosePress = () => {
// //         router.push('/Home');
// //     };

// //     return (
// //         <>
// //             <StatusBar style='light' />
// //             <View style={{ paddingTop: top }}>
// //                 <View style={styles.container}>
// //                     <TouchableOpacity style={styles.roundButton} onPress={onToggle}>
// //                         <Entypo name="menu" size={26} color="#fff" />
// //                     </TouchableOpacity>

// //                     <View style={styles.searchSection}>
// //                         <Ionicons style={styles.searchIcon} name='search' size={20} color="#ccc" />
// //                         <TextInput
// //                             style={styles.input}
// //                             placeholder='Search'
// //                             placeholderTextColor="#ccc"
// //                         />
// //                     </View>

// //                     <TouchableOpacity onPress={onClosePress}>
// //                         <FontAwesome name="close" size={30} color="#1fd655" />
// //                     </TouchableOpacity>
// //                 </View>
// //             </View>
// //         </>
// //     );
// // };

// // export default vehiclesCustomHeader;

// // const styles = StyleSheet.create({
// //     container: {
// //         flexDirection: 'row',
// //         justifyContent: 'space-between',
// //         alignItems: 'center',
// //         height: 60,
// //         backgroundColor: '#1c1c1e', // Dark background to match theme
// //         paddingHorizontal: 20,
// //         paddingVertical: 10,
// //         borderBottomWidth: 1,
// //         borderBottomColor: '#3a3a3c',
// //     },
// //     roundButton: {
// //         width: 40,
// //         height: 40,
// //         borderRadius: 20,
// //         backgroundColor: '#3a3a3c', // Dark gray background for the button
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //     },
// //     searchSection: {
// //         flex: 1,
// //         flexDirection: 'row',
// //         backgroundColor: '#3a3a3c', // Dark background for search bar
// //         borderRadius: 20,
// //         alignItems: 'center',
// //         paddingHorizontal: 10,
// //         marginHorizontal: 10,
// //     },
// //     input: {
// //         flex: 1,
// //         paddingVertical: 8,
// //         paddingLeft: 5,
// //         color: '#fff', // White text for search input
// //     },
// //     searchIcon: {
// //         marginRight: 10,
// //     },
// // });


// // // import { StyleSheet, Text, Touchable, View } from 'react-native'
// // // import React from 'react'
// // // import { BlurView } from 'expo-blur'
// // // import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
// // // import Colors from '@/constants/Colors'
// // // import { useSafeAreaInsets } from 'react-native-safe-area-context'
// // // import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
// // // import { useNavigation, useRouter } from 'expo-router'
// // // import { DrawerActions } from '@react-navigation/native';
// // // import { FontAwesome5 } from '@expo/vector-icons';
// // // import { StatusBar } from 'expo-status-bar';
// // // import { FontAwesome } from '@expo/vector-icons';

// // // const vehiclesCustomHeader = () => {
// // //     const { top } = useSafeAreaInsets();
// // //     const navigation = useNavigation();
// // //     const router = useRouter();

// // //     const onToggle = () => {
// // //         navigation.dispatch(DrawerActions.toggleDrawer())
// // //     }


// // //     const onClosePress = () => {
// // //         router.push('/Home')
// // //     }

// // //     return (
// // //         <>
// // //             <StatusBar style='dark' />
// // //             <View style={{ paddingTop: top }}>
// // //                 <View style={styles.container}>
// // //                     <TouchableOpacity style={styles.roundButton}
// // //                         onPress={onToggle}>
// // //                         <Entypo name="menu" size={26} color="black" />
// // //                         {/* <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>JL</Text> */}
// // //                     </TouchableOpacity>
// // //                     {/* <View style={styles.headerStyle}>
// // //                         <FontAwesome5 name="truck" size={24} color="#000" />
// // //                         <Text style={styles.headerText}>Move-Easy</Text>
// // //                     </View> */}
// // //                     <View style={styles.searchSection}>
// // //                         <Ionicons
// // //                             style={styles.searchIcon}
// // //                             name='search' size={20} color={Colors.dark} />
// // //                         <TextInput style={styles.input}
// // //                             placeholder='Search'
// // //                             placeholderTextColor={Colors.dark} />
// // //                     </View>
// // //                     <View>
// // //                         <TouchableOpacity onPress={onClosePress}>
// // //                             <FontAwesome name="close" size={30} color="#1fd655" />
// // //                         </TouchableOpacity>
// // //                     </View>

// // //                     {/* <View style={styles.circle}>
// // //                         <TouchableOpacity style={styles.roundButton}>
// // //                             <MaterialIcons name="my-location" size={20} color="black" />
// // //                         </TouchableOpacity>
// // //                     </View> */}
// // //                 </View>
// // //             </View>
// // //         </>
// // //     )
// // // }

// // // export default vehiclesCustomHeader;

// // // const styles = StyleSheet.create({
// // //     container: {
// // //         flexDirection: 'row',
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //         height: 60,
// // //         backgroundColor: '#fff',
// // //         gap: 10,
// // //         paddingHorizontal: 20,
// // //     },
// // //     roundButton: {
// // //         width: 40,
// // //         height: 40,
// // //         borderRadius: 20,
// // //         backgroundColor: Colors.lightGray,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //     },
// // //     searchSection: {
// // //         flex: 1,
// // //         flexDirection: 'row',
// // //         backgroundColor: Colors.lightGray,
// // //         borderRadius: 30,
// // //         alignItems: "center",
// // //         justifyContent: 'center',

// // //     },
// // //     input: {
// // //         flex: 1,
// // //         paddingTop: 10,
// // //         paddingRight: 10,
// // //         paddingBottom: 10,
// // //         paddingLeft: 0,
// // //         color: Colors.dark,
// // //     },
// // //     searchIcon: {
// // //         padding: 10
// // //     },
// // //     circle: {
// // //         width: 40,
// // //         height: 40,
// // //         borderRadius: 20,
// // //         backgroundColor: Colors.lightGray,
// // //         justifyContent: 'center',
// // //         alignItems: 'center',
// // //     },
// // //     headerStyle: {
// // //         flex: 1,
// // //         flexDirection: 'row',
// // //         justifyContent: 'center',
// // //         gap: 6
// // //     },
// // //     headerText: {
// // //         fontWeight: 'bold',
// // //         fontSize: 24,
// // //         color: '#0ef00e'
// // //     }
// // // })