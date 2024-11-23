import { Image, StyleSheet, Text, View, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { BlurView } from 'expo-blur'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import Colors from '@/constants/Colors'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Entypo, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRouter } from 'expo-router'
import { DrawerActions } from '@react-navigation/native'
import { FontAwesome5 } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { useUser } from '@clerk/clerk-expo'

const CustomHeader = () => {
    const { top } = useSafeAreaInsets()
    const navigation = useNavigation()
    const router = useRouter()
    const { user } = useUser()
    
    // Animation value for header background opacity
    const scrollY = useRef(new Animated.Value(0)).current
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    })

    const onPressProfile = () => {
        router.push('/(authenticated)/(tabs)/Profile/Profile')
    }

    const onToggle = () => {
        navigation.dispatch(DrawerActions.toggleDrawer())
    }

    return (
        <>
            <StatusBar style='dark' />
            <View style={[styles.headerContainer, { paddingTop: top }]}>
                <Animated.View style={[
                    styles.headerBackground,
                    { opacity: headerOpacity }
                ]}>
                    <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
                </Animated.View>
                
                <View style={styles.container}>
                    <TouchableOpacity 
                        style={styles.roundButton}
                        onPress={onToggle}
                        activeOpacity={0.7}
                    >
                        <Entypo name="menu" size={24} color={Colors.dark} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.headerStyle}
                        activeOpacity={0.8}
                    >
                        <FontAwesome5 name="truck" size={30} color="#FF9800" />
                        <Text style={styles.headerText}>Move-Easy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.profileButton}
                        onPress={onPressProfile}
                        activeOpacity={0.7}
                    >
                        {user?.imageUrl ? (
                            <Image
                                source={{ uri: user.imageUrl }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.profilePlaceholderText}>
                                    {user?.firstName?.[0] || 'U'}
                                </Text>
                            </View>
                        )}
                        <View style={styles.onlineIndicator} />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default CustomHeader

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        paddingHorizontal: 16,
        gap: 12,
    },
    roundButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerStyle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
    },
    headerText: {
        fontWeight: '900',
        fontSize: 30,
        color: "#FF9800",
        fontStyle: 'italic',
        // textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowColor: 'purple',

        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 1,
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'purple',
    },
    profilePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.lightGray,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profilePlaceholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.dark,
    },
    onlineIndicator: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#fff',
        bottom: 0,
        right: 0,
    },
})

// import { Image, StyleSheet, Text, View } from 'react-native'
// import React from 'react'
// import { BlurView } from 'expo-blur'
// import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
// import Colors from '@/constants/Colors'
// import { useSafeAreaInsets } from 'react-native-safe-area-context'
// import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation, useRouter } from 'expo-router'
// import { DrawerActions } from '@react-navigation/native';
// import { FontAwesome5 } from '@expo/vector-icons';
// import { StatusBar } from 'expo-status-bar';
// import { FontAwesome } from '@expo/vector-icons';
// import { useUser } from '@clerk/clerk-expo'

// const CustomHeader = () => {
//     const { top } = useSafeAreaInsets();
//     const navigation = useNavigation();
//     const router = useRouter();
//     const { user } = useUser();

//     const onPressProfile = () => {
//         router.push('/(authenticated)/(tabs)/Profile/Profile')
//     }

//     const onToggle = () => {
//         navigation.dispatch(DrawerActions.toggleDrawer())
//     }

//     return (
//         <>
//             <StatusBar style='auto' />
//             <View style={{ paddingTop: top }}>
//                 <View style={styles.container}>
//                     <TouchableOpacity style={styles.roundButton}
//                         onPress={onToggle}>
//                         <Entypo name="menu" size={24} color="black" />
//                         {/* <Text style={{ color: '#fff', fontWeight: '500', fontSize: 16 }}>JL</Text> */}
//                     </TouchableOpacity>
//                     <View style={styles.headerStyle}>
//                         <FontAwesome5 name="truck" size={26} color="#FF6D00" />
//                         <Text style={styles.headerText}>Move-Easy</Text>
//                     </View>
//                     {/* <View style={styles.searchSection}>
//                     <Ionicons
//                         style={styles.searchIcon}
//                         name='search' size={20} color={Colors.dark} />
//                     <TextInput style={styles.input}
//                         placeholder='Search'
//                         placeholderTextColor={Colors.dark} />
//                 </View> */}

//                     <View style={styles.circle}>
//                         <TouchableOpacity style={styles.profileButton}
//                             onPress={onPressProfile}>
//                             <Image
//                                 source={{ uri: user?.imageUrl }} style={styles.profileImage} />
//                             {/* <FontAwesome name="user" size={24} color="black" /> */}
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </>
//     )
// }

// export default CustomHeader

// const styles = StyleSheet.create({
//     container: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         height: 60,
//         backgroundColor: 'transparent',
//         gap: 10,
//         paddingHorizontal: 20,
//     },
//     roundButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: Colors.lightGray,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     searchSection: {
//         flex: 1,
//         flexDirection: 'row',
//         backgroundColor: Colors.lightGray,
//         borderRadius: 30,
//         alignItems: "center",
//         justifyContent: 'center',

//     },
//     input: {
//         flex: 1,
//         paddingTop: 10,
//         paddingRight: 10,
//         paddingBottom: 10,
//         paddingLeft: 0,
//         color: Colors.dark,
//     },
//     searchIcon: {
//         padding: 10
//     },
//     circle: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: Colors.lightGray,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     headerStyle: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'center',
//         gap: 6
//     },
//     headerText: {
//         fontWeight: '900',
//         fontSize: 26,
//         // color: 'rgba(37, 35, 35, 0.712)',
//         color: "#FF6D00",
//         fontStyle: 'italic'
//     },
//     profileButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         justifyContent: 'center',
//         // backgroundColor: Colors.lightGray,
//         alignItems: 'center',
//         overflow: 'hidden',
//         borderWidth: 1,
//         borderColor: Colors.dark,
//     },
//     profileImage: {
//         width: 40,
//         height: 40,
//         borderRadius: 30,
//         // backgroundColor: Colors.lightGray,
//         resizeMode: 'cover'
//     }
// })