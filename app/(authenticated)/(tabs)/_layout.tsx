import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { AntDesign, Ionicons, Feather, FontAwesome5, Octicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Drawer } from 'expo-router/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/app/context/store';
import CustomHeader from '@/components/CustomHeader';
import VehiclesCustomHeader from '@/components/VehiclesCustomHeader';
import CalendarHeader from '@/components/CalendarsHeader';
import CheckListCustomHeader from '@/components/CheckListCustomHeader';
import PaymentHeader from '@/components/PaymentHeader';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Dialog from 'react-native-dialog';
import { Redirect, useRouter } from 'expo-router';

const CustomDrawerContent = (props: any) => {
    const { navigation } = props;
    const { top, bottom } = useSafeAreaInsets();
    const { user } = useUser();
    const router = useRouter();
    const { signOut } = useAuth();

    const [dialogOpen, setDialogOpen] = useState(false);

    const goToProfilePage = () => {
        router.push('/(authenticated)/(tabs)/Profile/Profile');
    };

    return (
        <View style={styles.drawerContainer}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileContainer}>
                    <TouchableOpacity onPress={goToProfilePage}>
                        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
                        <Text style={styles.profileName}>{user?.fullName}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.drawerItemsContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <TouchableOpacity style={styles.logoutContainer} onPress={() => setDialogOpen(true)}>
                <AntDesign name="logout" size={24} color="#F39C12" style={styles.logoutIcon} />
                <Text style={styles.logoutLabel}>Log Out</Text>
            </TouchableOpacity>

            <Dialog.Container visible={dialogOpen}>
                <View style={styles.dialogContent}>
                    <Dialog.Title style={styles.dialogTitle}>Sign Out</Dialog.Title>
                    <Dialog.Description style={styles.dialogDescription}>
                        Are you sure you want to sign out?
                    </Dialog.Description>
                    <View style={styles.dialogButtonsContainer}>
                        <TouchableOpacity style={styles.dialogCancelButton} onPress={() => setDialogOpen(false)}>
                            <Text style={styles.dialogCancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.dialogSignOutButton} 
                            onPress={async () => { 
                                await signOut();
                                setDialogOpen(false); 
                                router.replace('/' as const); 
                            }}
                        >
                            <Text style={styles.dialogSignOutButtonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Dialog.Container>
        </View>
    );
};

const Layout = () => {
    const { isSignedIn } = useAuth();

    if (!isSignedIn) {
        return <Redirect href="/" />;
    }

    return (
        <Provider store={store}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <StatusBar style="auto" />
                <Drawer
                    drawerContent={CustomDrawerContent}
                    screenOptions={{
                        drawerHideStatusBarOnOpen: false,
                        drawerActiveBackgroundColor: '#F39C12',
                        drawerActiveTintColor: "#000",
                        drawerInactiveTintColor: '#fff',
                        headerStyle: { backgroundColor: '#000' },
                        headerTintColor: '#fff',
                        drawerLabelStyle: { fontWeight: 'bold' },
                        drawerStyle: { backgroundColor: '#1c1c1e' },
                    }}
                >
                    <Drawer.Screen
                        name="Home"
                        options={{
                            headerTransparent: true,
                            drawerLabel: 'Home',
                            headerTitle: "Home",
                            drawerIcon: ({ size, color }) => (
                                <Ionicons name="home-outline" size={size} color={color} />
                            ),
                            header: () => <CustomHeader />,
                        }}
                    />
                    <Drawer.Screen
                        name="vehicles"
                        options={{
                            drawerLabel: 'Vehicles',
                            headerTitle: "",
                            drawerIcon: ({ size, color }) => (
                                <Feather name="truck" size={size} color={color} />
                            ),
                            header: () => null,
                        }}
                    />
                    <Drawer.Screen
                        name="Checklist/Checklist"
                        options={{
                            drawerLabel: 'CheckList',
                            headerTitle: "CheckList",
                            drawerIcon: ({ size, color }) => (
                                <Octicons name="checklist" size={size} color={color} />
                            ),
                            header: () => <CheckListCustomHeader />,
                        }}
                    />
                    <Drawer.Screen
                        name="CalendarScreen/index"
                        options={{
                            drawerLabel: 'Calendar',
                            headerTitle: "Schedule Your Pickup",
                            headerStyle: { backgroundColor: '#0066cc' },
                            drawerIcon: ({ size, color }) => (
                                <Entypo name="calendar" size={size} color={color} />
                            ),
                            header: () => <CalendarHeader />,
                        }}
                    />
                    <Drawer.Screen
                        name="myOrders/myOrders"
                        options={{
                            drawerLabel: 'My Orders',
                            headerTitle: "My Orders",
                            drawerIcon: ({ size, color }) => (
                                <MaterialIcons name="bookmark-border" size={size} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="Payment/Payment"
                        options={{
                            drawerLabel: 'Payment',
                            headerTitle: "Payment",
                            drawerIcon: ({ size, color }) => (
                                <MaterialIcons name="payments" size={size} color={color} />
                            ),
                            header: () => <PaymentHeader />,
                        }}
                    />
                    <Drawer.Screen
                        name="FreeDrops/FreeDrops"
                        options={{
                            drawerLabel: 'FreeDrops',
                            headerTitle: "FreeDrops",
                            drawerIcon: ({ size, color }) => (
                                <FontAwesome5 name="gift" size={size} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="Profile/Profile"
                        options={{
                            drawerLabel: 'Profile',
                            headerTitle: "Profile",
                            drawerIcon: ({ size, color }) => (
                                <Ionicons name="person-outline" size={size} color={color} />
                            ),
                        }}
                    />
                </Drawer>
            </GestureHandlerRootView>
        </Provider>
    );
};

export default Layout;

const styles = StyleSheet.create({
    drawerContainer: { flex: 1, backgroundColor: '#1c1c1e' },
    scrollContainer: { backgroundColor: '#1c1c1e' },
    profileContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#333',
        borderBottomColor: '#444',
        borderBottomWidth: 1,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#F39C12',
        marginBottom: 10,
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
    drawerItemsContainer: {
        backgroundColor: '#1c1c1e',
        paddingTop: 20,
        paddingBottom: 10,
    },
    logoutContainer: {
        borderTopColor: '#4a4a4a',
        borderTopWidth: 1,
        padding: 20,
        backgroundColor: '#1c1c1e',
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutIcon: { marginRight: 10 },
    logoutLabel: {
        color: '#F39C12',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dialogContent: {
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#1c1c1e',
    },
    dialogTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    dialogDescription: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginVertical: 10,
    },
    dialogButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    dialogCancelButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#333',
        borderRadius: 5,
    },
    dialogCancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dialogSignOutButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#F39C12',
        borderRadius: 5,
    },
    dialogSignOutButtonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});



// import React, { useState } from 'react';
// import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
// import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// import { AntDesign, Ionicons, Feather, FontAwesome6, FontAwesome5, Octicons, MaterialIcons, Entypo, FontAwesome } from '@expo/vector-icons';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { StatusBar } from 'expo-status-bar';
// import { Drawer } from 'expo-router/drawer';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Provider } from 'react-redux';
// import { store } from '@/app/context/store';
// import CustomHeader from '@/components/CustomHeader';
// import VehiclesCustomHeader from '@/components/VehiclesCustomHeader';
// import VehicleDetailCustomHeader from '@/components/VehicledetailCustomHeader';
// import CalendarHeader from '@/components/CalendarsHeader';
// import CheckListCustomHeader from '@/components/CheckListCustomHeader';
// import PaymentHeader from '@/components/PaymentHeader';
// import { useAuth, useUser } from '@clerk/clerk-expo';
// import Dialog from "react-native-dialog";
// import { Redirect, useRouter } from 'expo-router';



// // Custom Drawer Content Component
// const CustomDrawerContent = (props: any) => {
//     const { navigation } = props;
//     const { top, bottom } = useSafeAreaInsets();
//     const { user } = useUser();
//     const router = useRouter();
//     const { signOut } = useAuth();
    

//     const [dialogOpen, setDialogOpen] = useState(false);
//     const goToProfilePage = () => {
//         router.push('/(authenticated)/(tabs)/Profile/Profile');
//     }



//     return (
//         <View style={styles.drawerContainer}>
//             <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
//                 <View style={styles.profileContainer}>
//                     <TouchableOpacity onPress={() => goToProfilePage}>
//                         <Image
//                             source={{ uri: user?.imageUrl }}
//                             style={styles.profileImage}
//                         />
//                         <Text style={styles.profileName}>{user?.fullName}</Text>
//                     </TouchableOpacity>
//                 </View>
//                 <View style={styles.drawerItemsContainer}>
//                     <DrawerItemList {...props} />
//                 </View>
//             </DrawerContentScrollView>
//             <TouchableOpacity style={styles.logoutContainer}
//                 onPress={() => setDialogOpen(true)}
//             >
//                 <AntDesign name="logout" size={24} color="#F39C12" style={styles.logoutIcon} />
//                 <Text style={styles.logoutLabel}>Log Out</Text>
//             </TouchableOpacity>

//             <Dialog.Container visible={dialogOpen}>
//                 <Dialog.Title style={{
//                     fontSize: 20,
//                     fontWeight: 'bold',
//                     marginBottom: 10,
//                     marginLeft: 15,
//                     color: '#000',
//                 }}>Sign Out</Dialog.Title>
//                 <Dialog.Description
//                     style={{
//                         fontSize: 16,
//                         fontWeight: 'bold',
//                         marginBottom: 10,
//                         marginLeft: 15,
//                         color: '#000',
//                     }}>Are you sure you want to Sign out?</Dialog.Description>
//                 <Dialog.Button label="Cancel" onPress={() => setDialogOpen(false)} />
                
//                 <Dialog.Button 
//   label="Sign Out" 
//   onPress={async () => { 
//     await signOut(); // Wait for sign-out to complete
//     setDialogOpen(false); 
//     router.push("/"); // Try using push instead of replace 
//   }} 
// />

//                 {/* <Dialog.Button label="Sign Out" onPress={() => { signOut(); setDialogOpen(false); router.replace("/"); }} /> */}

//                 {/* <Dialog.Button label="Delete" onPress={() => { deleteUser(); setDialogue(false); navigation.navigate('Welcome'); }} /> */}

//             </Dialog.Container>
//         </View>
//     );
// };

// // Main Layout Component
// const Layout = () => {
//     const { isSignedIn } = useAuth();

//     if (!isSignedIn) {
//         return <Redirect href="/" />;
//     }

//     return (
//         <Provider store={store}>
//             <GestureHandlerRootView style={{ flex: 1 }}>
//                 <StatusBar style="auto" />
//                 <Drawer
//                     drawerContent={CustomDrawerContent}
//                     screenOptions={{
//                         drawerHideStatusBarOnOpen: false,
//                         drawerActiveBackgroundColor: '#F39C12',
//                         drawerActiveTintColor: "#000",
//                         drawerInactiveTintColor: '#fff',
//                         headerStyle: { backgroundColor: '#000' },
//                         headerTintColor: '#fff',
//                         drawerLabelStyle: { fontWeight: 'bold' },
//                         drawerStyle: {
//                             backgroundColor: '#1c1c1e', // Dark gray background
//                         },
//                     }}>
//                     <Drawer.Screen
//                         name="Home"
//                         options={{
//                             headerTransparent: true,
//                             drawerLabel: 'Home',
//                             headerTitle: "Home",
//                             drawerIcon: ({ size, color }) => (
//                                 <Ionicons name="home-outline" size={size} color={color} />
//                             ),
//                             header: () => <CustomHeader />,
//                         }}
//                     />
//                     <Drawer.Screen
//                         name="vehicles"
//                         options={{
//                             drawerLabel: 'Vehicles',
//                             headerTitle: "",
//                             headerShadowVisible: true,
//                             headerStyle: {
//                                 backgroundColor: '#eb0e0e', // Dark red background
//                             },
//                             drawerIcon: ({ size, color }) => (
//                                 <Feather name="truck" size={size} color={color} />
//                             ),
//                             // header: () => <VehiclesCustomHeader />,
//                             header: () => null,

//                         }}
//                     />
//                     {/* <Drawer.Screen
//                         name="vehicleDetail"
//                         options={{
//                             drawerLabel: 'Vehicle Details',
//                             headerTitle: "Vehicle Details",
//                             headerTransparent: true,
//                             headerShown: false,
//                             headerShadowVisible: true,
//                             headerStyle: {
//                                 // backgroundColor: '#334f', // Dark gray background
//                             },
//                             drawerIcon: ({ size, color }) => (
//                                 <FontAwesome6 name="truck-front" size={size} color={color} />
//                             ),
//                             // header: () => <VehicleDetailCustomHeader />,
//                         }}
//                     /> */}
//                     <Drawer.Screen
//                         name="Checklist/Checklist"
//                         options={{
//                             drawerLabel: 'CheckList',
//                             headerTitle: "CheckList",
//                             headerShadowVisible: true,
//                             drawerIcon: ({ size, color }) => (
//                                 <Octicons name="checklist" size={size} color={color} />
//                             ),
//                             header: () => <CheckListCustomHeader />
//                         }}
//                     />
//                     <Drawer.Screen
//                         name="CalendarScreen/index"
//                         options={{
//                             drawerLabel: 'Calendar',
//                             headerTitle: "Schedule Your Pickup",
//                             headerStyle: {
//                                 backgroundColor: '#0066cc', // Blue background
//                             },
//                             headerShown: true,
//                             drawerIcon: ({ size, color }) => (
//                                 <Entypo name="calendar" size={size} color={color} />
//                             ),
//                             header: () => <CalendarHeader />
//                         }}
//                     />
//                     <Drawer.Screen
//                         name="myOrders/myOrders"
//                         options={{
//                             drawerLabel: 'My Orders',
//                             headerTitle: "My Orders",
//                             drawerIcon: ({ size, color }) => (
//                                 <MaterialIcons name="bookmark-border" size={size} color={color} />
//                             ),
//                         }}
//                     />
//                     <Drawer.Screen
//                         name="Payment/Payment"
//                         options={{
//                             // headerTransparent: true,
//                             drawerLabel: 'Payment',
//                             headerTitle: "Payment",
//                             drawerIcon: ({ size, color }) => (
//                                 <MaterialIcons name="payments" size={size} color={color} />
//                             ),
//                             header: () => <PaymentHeader />

//                         }}
//                     />
//                     <Drawer.Screen
//                         name="FreeDrops/FreeDrops"
//                         options={{
//                             drawerLabel: 'FreeDrops',
//                             headerTitle: "FreeDrops",
//                             drawerIcon: ({ size, color }) => (
//                                 <FontAwesome5 name="gift" size={size} color={color} />
//                             ),
//                         }}
//                     />
//                     <Drawer.Screen
//                         name="Profile/Profile"
//                         options={{
//                             drawerLabel: 'Profile',
//                             headerTitle: "Profile",
//                             drawerIcon: ({ size, color }) => (
//                                 <Ionicons name="person-outline" size={size} color={color} />
//                             ),
//                         }}
//                     />
//                 </Drawer>
//             </GestureHandlerRootView>
//         </Provider>
//     );
// };

// export default Layout;

// const styles = StyleSheet.create({
//     drawerContainer: {
//         flex: 1,
//         backgroundColor: '#1c1c1e', // Dark gray background
//     },
//     scrollContainer: {
//         backgroundColor: '#1c1c1e', // Dark gray background
//     },
//     profileContainer: {
//         padding: 20,
//         alignItems: 'center',
//         backgroundColor: '#333', // Slightly lighter dark gray
//         borderBottomColor: '#444', // Subtle border
//         borderBottomWidth: 1,
//     },
//     profileImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         borderWidth: 2,
//         borderColor: '#460dcc', // Yellow border for profile image
//         resizeMode: 'cover',
//         marginBottom: 10,
//     },
//     profileName: {
//         fontWeight: 'bold',
//         fontSize: 18,
//         color: '#fff',
//         textAlign: 'center',
//     },
//     drawerItemsContainer: {
//         backgroundColor: '#1c1c1e', // Dark gray background
//         paddingTop: 20,
//         paddingBottom: 10,
//     },
//     logoutContainer: {
//         borderTopColor: '#4a4a4a',
//         borderTopWidth: 1,
//         padding: 20,
//         backgroundColor: '#1c1c1e', // Dark gray background
//         flexDirection: 'row',
//         // alignItems: 'center',
//         // justifyContent: 'center',
//     },
//     logoutIcon: {
//         marginRight: 10,
//     },
//     logoutLabel: {
//         color: '#F39C12',
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
// });


// // import React from 'react';
// // import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
// // import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// // import { AntDesign } from '@expo/vector-icons';
// // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import { StatusBar } from 'expo-status-bar';
// // import { Ionicons, MaterialIcons, Octicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// // import { Drawer } from 'expo-router/drawer';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { Feather } from '@expo/vector-icons';
// // import { Link, Stack } from 'expo-router';
// // import Colors from '@/constants/Colors';
// // import { Provider } from 'react-redux';
// // import { store } from '@/app/context/store'
// // import CustomHeader from '@/components/CustomHeader';
// // import VehiclesCustomHeader from '@/components/VehiclesCustomHeader';
// // import VehicleDetailCustomHeader from '@/components/VehicledetailCustomHeader';
// // import CalendarHeader from '@/components/CalendarsHeader';
// // import CheckListCustomHeader from '@/components/CheckListCustomHeader';
// // import { FontAwesome6 } from '@expo/vector-icons';
// // import { Entypo } from '@expo/vector-icons';


// // const CustomDrawerContent = (props: any) => {
// //     const { navigation } = props;
// //     const { top, bottom } = useSafeAreaInsets();

// //     return (

// //         <View style={styles.drawerContainer}>
// //             <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
// //                 <View style={styles.profileContainer}>
// //                     <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
// //                         <Image
// //                             source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
// //                             style={styles.profileImage}
// //                         />
// //                         <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
// //                     </TouchableOpacity>
// //                 </View>
// //                 <View style={styles.drawerItemsContainer}>
// //                     <DrawerItemList {...props} />
// //                 </View>
// //             </DrawerContentScrollView>
// //             <TouchableOpacity style={styles.logoutContainer} onPress={() => navigation.navigate('Login')}>
// //                 <AntDesign name="logout" size={24} color="#FFEA00" style={styles.logoutIcon} />
// //                 <Text style={styles.logoutLabel}>Log Out</Text>
// //             </TouchableOpacity>
// //         </View>
// //     );
// // };

// // const Layout = () => {
// //     return (
// //         <Provider store={store}>
// //             <GestureHandlerRootView style={{ flex: 1 }}>
// //                 <StatusBar style="light" />
// //                 <Drawer
// //                     drawerContent={CustomDrawerContent}
// //                     screenOptions={{
// //                         drawerHideStatusBarOnOpen: false,
// //                         drawerActiveBackgroundColor: '#FFEA00',
// //                         drawerActiveTintColor: "#000",
// //                         drawerInactiveTintColor: '#fff',
// //                         headerStyle: { backgroundColor: '#000' },
// //                         headerTintColor: '#fff',
// //                         drawerLabelStyle: { fontWeight: 'bold' },
// //                     }}>
// //                     <Drawer.Screen
// //                         name="Home"
// //                         options={{
// //                             headerTransparent: true,
// //                             drawerLabel: 'Home',
// //                             headerTitle: "Home",
// //                             drawerIcon: ({ size, color }) => (
// //                                 <Ionicons name="home-outline" size={size} color={color} />
// //                             ),
// //                             header: () => <CustomHeader />,
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="vehicles"
// //                         options={{
// //                             drawerLabel: 'Vehicles',
// //                             headerTitle: "",
// //                             headerShadowVisible: true,
// //                             headerStyle: {
// //                                 backgroundColor: '#eb0e0e', // Dark gray background color
// //                             },
// //                             // headerShown: false,
// //                             drawerIcon: ({ size, color }) => (
// //                                 <Feather name="truck" size={size} color={color} />
// //                             ),
// //                             header: () => <VehiclesCustomHeader />,
// //                             headerTransparent: false
// //                             // headerRight: () => (
// //                             //     <Link href={'/home'} asChild>
// //                             //         <TouchableOpacity style={styles.arrowLeftButton}>
// //                             //             <Ionicons name="arrow-back-outline" size={34} color={Colors.dark} />
// //                             //         </TouchableOpacity>
// //                             //     </Link>
// //                             // ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="vehicleDetail"
// //                         options={{
// //                             drawerLabel: 'VehiclesDetail',
// //                             headerTitle: "Vehicle Details",
// //                             headerShadowVisible: true,
// //                             headerStyle: {
// //                                 backgroundColor: '#334f',
// //                                 // Dark gray background color
// //                             },
// //                             // headerShown: false,
// //                             drawerIcon: ({ size, color }) => (
// //                                 <FontAwesome6 name="truck-front" size={size} color={color} />
// //                             ),
// //                             header: () => <VehicleDetailCustomHeader />,
// //                             headerTransparent: true
// //                             // headerRight: () => (
// //                             //     <Link href={'/vehicles'} asChild>
// //                             //         <TouchableOpacity style={styles.arrowLeftButton}>
// //                             //             <AntDesign name="close" size={30} color="#fff" />
// //                             //         </TouchableOpacity>
// //                             //     </Link>
// //                             // ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="CheckList"
// //                         options={{
// //                             drawerLabel: 'CheckList',
// //                             headerTitle: "CheckList",
// //                             headerShadowVisible: true,
// //                             drawerIcon: ({ size, color }) => (
// //                                 <Octicons name="checklist" size={size} color={color} />
// //                             ),
// //                             header: () => <CheckListCustomHeader />
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="CalendarScreen"
// //                         options={{
// //                             drawerLabel: 'calender',
// //                             headerTitle: "Schedule Your Pickup",
// //                             headerStyle: {
// //                                 backgroundColor: Colors.primary,
// //                                 // Dark gray background color
// //                             },
// //                             headerShown: true,
// //                             drawerIcon: ({ size, color }) => (
// //                                 <Entypo name="calendar" size={size} color={color} />
// //                             ),
// //                             header: () => <CalendarHeader />
// //                             // headerRight: () => (
// //                             //     <Link href={'/vehicleDetail'} asChild>
// //                             //         <TouchableOpacity style={styles.arrowLeftButton}>
// //                             //             <AntDesign name="close" size={28} color="#fff" />
// //                             //         </TouchableOpacity>
// //                             //     </Link>
// //                             // ),
// //                             // headerLeft: () => (
// //                             //     <Link href={'/vehicleDetail'} asChild>
// //                             //         <TouchableOpacity style={styles.arrowLeftButton}>
// //                             //             <Ionicons name="arrow-back-outline" size={34} color={Colors.dark} />
// //                             //         </TouchableOpacity>
// //                             //     </Link>
// //                             // ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="myOrders"
// //                         options={{
// //                             drawerLabel: 'My Orders',
// //                             headerTitle: "My Orders",
// //                             drawerIcon: ({ size, color }) => (
// //                                 <MaterialIcons name="bookmark-border" size={size} color={color} />
// //                             ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="Payment"
// //                         options={{
// //                             drawerLabel: 'Payment',
// //                             headerTitle: "Payment",
// //                             drawerIcon: ({ size, color }) => (
// //                                 <MaterialIcons name="payments" size={size} color={color} />
// //                             ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="Chats"
// //                         options={{
// //                             drawerLabel: 'Chats',
// //                             headerTitle: "Chats",
// //                             drawerIcon: ({ size, color }) => (
// //                                 <FontAwesome name="wechat" size={size} color={color} />
// //                             ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="FreeDrops"
// //                         options={{
// //                             drawerLabel: 'FreeDrops',
// //                             headerTitle: "FreeDrops",
// //                             drawerIcon: ({ size, color }) => (
// //                                 <FontAwesome5 name="gift" size={size} color={color} />
// //                             ),
// //                         }}
// //                     />
// //                     <Drawer.Screen
// //                         name="Profile"
// //                         options={{
// //                             drawerLabel: 'Profile',
// //                             headerTitle: "Profile",
// //                             drawerIcon: ({ size, color }) => (
// //                                 <Ionicons name="person-outline" size={size} color={color} />
// //                             ),
// //                         }}
// //                     />
// //                 </Drawer>
// //             </GestureHandlerRootView>
// //         </Provider>
// //     );
// // };

// // export default Layout;

// // const styles = StyleSheet.create({
// //     drawerContainer: {
// //         flex: 1,
// //         backgroundColor: '#1c1c1e', // Dark gray background color
// //     },
// //     scrollContainer: {
// //         backgroundColor: '#1c1c1e', // Dark gray background color
// //     },
// //     profileContainer: {
// //         padding: 20,
// //         alignItems: 'center',
// //         backgroundColor: '#333',
// //     },
// //     profileImage: {
// //         width: 100,
// //         height: 100,
// //         borderRadius: 50,
// //         resizeMode: 'cover',
// //         marginBottom: 10,
// //     },
// //     profileName: {
// //         fontWeight: 'bold',
// //         fontSize: 18,
// //         color: '#fff',
// //         textAlign: 'center',
// //     },
// //     drawerItemsContainer: {
// //         backgroundColor: '#1c1c1e', // Dark gray background color
// //         paddingTop: 20,
// //         paddingBottom: 10,
// //     },
// //     logoutContainer: {
// //         borderTopColor: '#4a4a4a',
// //         borderTopWidth: 1,
// //         padding: 20,
// //         backgroundColor: '#1c1c1e', // Dark gray background color
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     logoutIcon: {
// //         marginRight: 10,
// //     },
// //     logoutLabel: {
// //         color: '#FFEA00',
// //         fontWeight: 'bold',
// //         fontSize: 16,
// //     },
// //     arrowLeftButton: {
// //         padding: 10,
// //         paddingLeft: 20,
// //         paddingRight: 20,
// //         borderRadius: 5,
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //     }
// // });


// // import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
// // import React from 'react';
// // import { Stack, Tabs, useRouter } from 'expo-router';
// // import 'react-native-gesture-handler';
// // import { Drawer } from 'expo-router/drawer';
// // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import { Octicons } from '@expo/vector-icons';
// // import { FontAwesome5 } from '@expo/vector-icons';
// // import { StatusBar } from 'expo-status-bar';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// // import CustomHeader from '@/components/CustomHeader';
// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

// // function CustomDrawerContent(props: any) {
// //     const router = useRouter();
// //     const { top, bottom } = useSafeAreaInsets();

// //     return (
// //         <View style={styles.drawerContainer}>
// //             <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={styles.scrollContainer}>
// //                 <View style={styles.profileContainer}>
// //                     <Image
// //                         source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
// //                         style={styles.profileImage}
// //                     />
// //                     <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
// //                 </View>
// //                 <View style={styles.drawerItemsContainer}>
// //                     <DrawerItemList {...props} />
// //                 </View>
// //             </DrawerContentScrollView>
// //             <View style={[styles.logoutContainer, { paddingBottom: bottom }]}>
// //                 <AntDesign name="logout" size={24} color="yellow" style={styles.logoutIcon} />
// //                 <Text style={styles.logoutLabel} onPress={() => router.replace('/')}>Log Out</Text>
// //             </View>
// //         </View>
// //     );
// // }

// // const Layout = () => {
// //     return (
// //         <GestureHandlerRootView style={{ flex: 1 }}>
// //             <StatusBar style="dark" />
// //             <Drawer
// //                 drawerContent={CustomDrawerContent}
// //                 screenOptions={{
// //                     drawerHideStatusBarOnOpen: false,
// //                     drawerActiveBackgroundColor: '#FFEA00',
// //                     drawerActiveTintColor: "#000",
// //                     drawerInactiveTintColor: '#fff',
// //                     headerStyle: { backgroundColor: '#000' },
// //                     headerTintColor: '#fff',
// //                     drawerLabelStyle: { fontWeight: 'bold' },
// //                 }}>
// //                 <Drawer.Screen
// //                     name="home"
// //                     options={{
// //                         drawerLabel: 'Home',
// //                         headerTitle: "Home",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="home-outline" size={size} color={color} />
// //                         ),
// //                         header: () => <CustomHeader />,
// //                         headerTransparent: true,
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="myOrders"
// //                     options={{
// //                         drawerLabel: 'My Orders',
// //                         headerTitle: "My Orders",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="card" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Profile"
// //                     options={{
// //                         drawerLabel: 'Profile',
// //                         headerTitle: "Profile",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="person-outline" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Payment"
// //                     options={{
// //                         drawerLabel: 'Payment',
// //                         headerTitle: "Payment",
// //                         drawerIcon: ({ size, color }) => (
// //                             <MaterialIcons name="payments" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="CheckList"
// //                     options={{
// //                         drawerLabel: 'CheckList',
// //                         headerTitle: "CheckList",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Octicons name="checklist" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Chats"
// //                     options={{
// //                         drawerLabel: 'Chats',
// //                         headerTitle: "Chats",
// //                         drawerIcon: ({ size, color }) => (
// //                             <FontAwesome name="wechat" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="FreeDrops"
// //                     options={{
// //                         drawerLabel: 'FreeDrops',
// //                         headerTitle: "FreeDrops",
// //                         drawerIcon: ({ size, color }) => (
// //                             <FontAwesome5 name="gift" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //             </Drawer>
// //         </GestureHandlerRootView>
// //     );
// // }

// // export default Layout;

// // const styles = StyleSheet.create({
// //     drawerContainer: {
// //         flex: 1,
// //         backgroundColor: '#333', // Dark gray background color
// //     },
// //     scrollContainer: {
// //         backgroundColor: '#333', // Dark gray background color
// //     },
// //     profileContainer: {
// //         padding: 20,
// //         alignItems: 'center',
// //     },
// //     profileImage: {
// //         width: 100,
// //         height: 100,
// //         borderRadius: 50,
// //         resizeMode: 'cover',
// //         marginBottom: 20,
// //     },
// //     profileName: {
// //         fontWeight: '900',
// //         fontSize: 22,
// //         color: '#fff',
// //         textAlign: 'center',
// //     },
// //     drawerItemsContainer: {
// //         backgroundColor: '#333', // Dark gray background color
// //         paddingTop: 40,
// //         paddingBottom: 10,
// //     },
// //     logoutContainer: {
// //         borderTopColor: '#dde3fe',
// //         borderTopWidth: 1,
// //         padding: 20,
// //         backgroundColor: '#333', // Dark gray background color
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         justifyContent: 'center',
// //     },
// //     logoutIcon: {
// //         marginRight: 10,
// //     },
// //     logoutLabel: {
// //         color: '#FFEA00',
// //         fontWeight: 'bold',
// //         fontSize: 18,
// //     },
// // });


// // import { Image, StyleSheet, Text, View } from 'react-native';
// // import React from 'react';
// // import { Stack, Tabs, useRouter } from 'expo-router';
// // import 'react-native-gesture-handler';
// // import { Drawer } from 'expo-router/drawer';
// // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import { Octicons } from '@expo/vector-icons';
// // import { FontAwesome5 } from '@expo/vector-icons';
// // import { StatusBar } from 'expo-status-bar';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// // import CustomHeader from '@/components/CustomHeader';

// // function CustomDrawerContent(props: any) {
// //     const router = useRouter();
// //     const { top, bottom } = useSafeAreaInsets();

// //     return (
// //         <View style={styles.drawerContainer}>
// //             <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={styles.scrollContainer}>
// //                 <View style={styles.profileContainer}>
// //                     <Image
// //                         source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
// //                         style={styles.profileImage}
// //                     />
// //                     <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
// //                 </View>
// //                 <View style={styles.drawerItemsContainer}>
// //                     <DrawerItemList {...props} />
// //                 </View>
// //             </DrawerContentScrollView>
// //             <View style={[styles.logoutContainer, { paddingBottom: bottom }]}>
// //                 <AntDesign name="logout" size={24} color="yellow" style={styles.logoutIcon} />
// //                 <Text style={styles.logoutLabel} onPress={() => router.replace('/')}>Log Out</Text>
// //             </View>
// //         </View>
// //     );
// // }

// // const Layout = () => {
// //     return (
// //         <GestureHandlerRootView style={{ flex: 1 }}>
// //             <StatusBar style="light" />
// //             <Drawer
// //                 drawerContent={CustomDrawerContent}
// //                 screenOptions={{
// //                     drawerHideStatusBarOnOpen: false,
// //                     drawerActiveBackgroundColor: '#FFEA00',
// //                     drawerActiveTintColor: "#000",
// //                     drawerInactiveTintColor: '#fff',
// //                     headerStyle: { backgroundColor: '#000' },
// //                     headerTintColor: '#fff',
// //                     drawerLabelStyle: { fontWeight: 'bold' },
// //                 }}>
// //                 <Drawer.Screen
// //                     name="home"
// //                     options={{
// //                         drawerLabel: 'Home',
// //                         headerTitle: "Home",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="home-outline" size={size} color={color} />
// //                         ),
// //                         header: () => <CustomHeader />,
// //                         headerTransparent: true,
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="myOrders"
// //                     options={{
// //                         drawerLabel: 'My Orders',
// //                         headerTitle: "My Orders",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="card" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Profile"
// //                     options={{
// //                         drawerLabel: 'Profile',
// //                         headerTitle: "Profile",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="person-outline" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Payment"
// //                     options={{
// //                         drawerLabel: 'Payment',
// //                         headerTitle: "Payment",
// //                         drawerIcon: ({ size, color }) => (
// //                             <MaterialIcons name="payments" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="CheckList"
// //                     options={{
// //                         drawerLabel: 'CheckList',
// //                         headerTitle: "CheckList",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Octicons name="checklist" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Chats"
// //                     options={{
// //                         drawerLabel: 'Chats',
// //                         headerTitle: "Chats",
// //                         drawerIcon: ({ size, color }) => (
// //                             <FontAwesome name="wechat" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="FreeDrops"
// //                     options={{
// //                         drawerLabel: 'FreeDrops',
// //                         headerTitle: "FreeDrops",
// //                         drawerIcon: ({ size, color }) => (
// //                             <FontAwesome5 name="gift" size={size} color={color} />
// //                         ),
// //                     }}
// //                 />
// //             </Drawer>
// //         </GestureHandlerRootView>
// //     );
// // }

// // export default Layout;

// // const styles = StyleSheet.create({
// //     drawerContainer: {
// //         flex: 1,
// //         backgroundColor: '#000',
// //     },
// //     scrollContainer: {
// //         backgroundColor: '#000',
// //     },
// //     profileContainer: {
// //         padding: 20,
// //         alignItems: 'center',
// //     },
// //     profileImage: {
// //         width: 100,
// //         height: 100,
// //         borderRadius: 50,
// //         resizeMode: 'cover',
// //         marginBottom: 20,
// //     },
// //     profileName: {
// //         fontWeight: '900',
// //         fontSize: 22,
// //         color: '#fff',
// //         textAlign: 'center',
// //     },
// //     drawerItemsContainer: {
// //         backgroundColor: '#000',
// //         paddingTop: 40,
// //         paddingBottom: 10,
// //     },
// //     logoutContainer: {
// //         borderTopColor: '#dde3fe',
// //         borderTopWidth: 1,
// //         padding: 20,
// //         backgroundColor: '#000',
// //         flexDirection: 'row',
// //         alignItems: 'center',
// //         // justifyContent: 'center',
// //     },
// //     logoutIcon: {
// //         marginRight: 10,
// //     },
// //     logoutLabel: {
// //         color: '#FFEA00',
// //         fontWeight: 'bold',
// //         fontSize: 18,
// //     },
// // });


// // // import { Image, StyleSheet, Text, View } from 'react-native';
// // // import React from 'react';
// // // import { Stack, Tabs, useRouter } from 'expo-router';
// // // import 'react-native-gesture-handler';
// // // import { Drawer } from 'expo-router/drawer';
// // // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // // import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
// // // import { MaterialIcons } from '@expo/vector-icons';
// // // import { Octicons } from '@expo/vector-icons';
// // // import { FontAwesome5 } from '@expo/vector-icons';
// // // import { StatusBar } from 'expo-status-bar';
// // // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // // import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// // // import CustomHeader from '@/components/CustomHeader';


// // // function CustomDrawerContent(props: any) {
// // //     const router = useRouter();
// // //     const { top, bottom } = useSafeAreaInsets();

// // //     return (
// // //         <View style={styles.drawerContainer}>
// // //             <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={styles.scrollContainer}>
// // //                 <View style={styles.profileContainer}>
// // //                     <Image
// // //                         source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
// // //                         style={styles.profileImage}
// // //                     />
// // //                     <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
// // //                 </View>
// // //                 <View style={styles.drawerItemsContainer}>
// // //                     <DrawerItemList {...props} />
// // //                 </View>
// // //             </DrawerContentScrollView>

// // //             <View style={[styles.logoutContainer, { paddingBottom: bottom }]}>
// // //                 <AntDesign name="logout" size={24} color="yellow" style={styles.logoutIcon} />
// // //                 <DrawerItem
// // //                     label="Log Out"
// // //                     onPress={() => router.replace('/')}
// // //                     labelStyle={styles.logoutLabel}
// // //                 />
// // //             </View>
// // //         </View>
// // //     );
// // // }

// // // const Layout = () => {
// // //     return (
// // //         <GestureHandlerRootView style={{ flex: 1 }}>
// // //             <StatusBar style="light" />
// // //             <Drawer
// // //                 drawerContent={CustomDrawerContent}
// // //                 screenOptions={{
// // //                     drawerHideStatusBarOnOpen: false,
// // //                     drawerActiveBackgroundColor: '#FFEA00',
// // //                     drawerActiveTintColor: "#000",
// // //                     drawerInactiveTintColor: '#fff',
// // //                     headerStyle: { backgroundColor: '#000' },
// // //                     headerTintColor: '#fff',
// // //                     drawerLabelStyle: { fontWeight: 'bold' },
// // //                 }}>
// // //                 <Drawer.Screen
// // //                     name="home"
// // //                     options={{
// // //                         // headerShown: false,
// // //                         drawerLabel: 'Home',
// // //                         headerTitle: "Home",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Ionicons name="home-outline" size={size} color={color} />
// // //                         ),
// // //                         header: () => <CustomHeader />,
// // //                         headerTransparent: true,
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="myOrders"
// // //                     options={{
// // //                         drawerLabel: 'My Orders',
// // //                         headerTitle: "My Orders",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Ionicons name="card" size={size} color={color} />
// // //                         ),
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="Profile"
// // //                     options={{
// // //                         drawerLabel: 'Profile',
// // //                         headerTitle: "Profile",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Ionicons name="person-outline" size={size} color={color} />
// // //                         ),
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="Payment"
// // //                     options={{
// // //                         drawerLabel: 'Payment',
// // //                         headerTitle: "Payment",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <MaterialIcons name="payments" size={size} color={color} />
// // //                         ),
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="CheckList"
// // //                     options={{
// // //                         drawerLabel: 'CheckList',
// // //                         headerTitle: "CheckList",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Octicons name="checklist" size={size} color={color} />
// // //                         ),
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="Chats"
// // //                     options={{
// // //                         drawerLabel: 'Chats',
// // //                         headerTitle: "Chats",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <FontAwesome name="wechat" size={size} color={color} />
// // //                         ),
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="FreeDrops"
// // //                     options={{
// // //                         drawerLabel: 'FreeDrops',
// // //                         headerTitle: "FreeDrops",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <FontAwesome5 name="gift" size={size} color={color} />
// // //                         ),
// // //                     }}
// // //                 />
// // //             </Drawer>
// // //         </GestureHandlerRootView>
// // //     );
// // // }

// // // export default Layout;

// // // const styles = StyleSheet.create({
// // //     drawerContainer: {
// // //         flex: 1,
// // //         backgroundColor: '#000',
// // //     },
// // //     scrollContainer: {
// // //         backgroundColor: '#000',
// // //     },
// // //     profileContainer: {
// // //         padding: 20,
// // //         alignItems: 'center',
// // //     },
// // //     profileImage: {
// // //         width: 100,
// // //         height: 100,
// // //         borderRadius: 50,
// // //         resizeMode: 'cover',
// // //         marginBottom: 20,
// // //     },
// // //     profileName: {
// // //         fontWeight: '900',
// // //         fontSize: 22,
// // //         color: '#fff',
// // //         textAlign: 'center',
// // //     },
// // //     drawerItemsContainer: {
// // //         backgroundColor: '#000',
// // //         paddingTop: 40,
// // //         paddingBottom: 10,
// // //     },
// // //     logoutContainer: {
// // //         borderTopColor: '#dde3fe',
// // //         borderTopWidth: 1,
// // //         padding: 20,
// // //         paddingBottom: 20,
// // //         backgroundColor: '#000',
// // //         flexDirection: 'row',
// // //     },
// // //     logoutLabel: {
// // //         color: '#FFEA00',
// // //         fontWeight: 'bold',
// // //         fontSize: 20,
// // //     },
// // //     logoutIcon: {
// // //         marginRight: 10,
// // //     },
// // //     // logoutLabel: {
// // //     //     color: '#FFEA00',
// // //     //     fontWeight: 'bold',
// // //     // },
// // // });




// // // import { Image, StyleSheet, Text, View } from 'react-native'
// // // import React from 'react'
// // // import { Stack, Tabs, useRouter } from 'expo-router';
// // // import 'react-native-gesture-handler';
// // // import { Drawer } from 'expo-router/drawer'
// // // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // // import { AntDesign, Ionicons } from '@expo/vector-icons';
// // // import { MaterialIcons } from '@expo/vector-icons';
// // // import { Octicons } from '@expo/vector-icons';
// // // import { FontAwesome5 } from '@expo/vector-icons';
// // // import { StatusBar } from 'expo-status-bar';
// // // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // // import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// // // // import CustomDrawerContent from '@/components/CustomDrawerContent';


// // // function CustomDrawerContent(props: any) {
// // //     const router = useRouter();
// // //     const { top, bottom } = useSafeAreaInsets();

// // //     return (
// // //         <View style={{ flex: 1, backgroundColor: '#000' }} >
// // //             <DrawerContentScrollView {...props}
// // //                 scrollEnabled={true}
// // //                 contentContainerStyle={{ backgroundColor: "#000" }}>

// // //                 <View style={{
// // //                     padding: 20
// // //                 }}>
// // //                     <Image source={{
// // //                         uri: 'https://avatars.githubusercontent.com/u/100000000?v=4',
// // //                     }}
// // //                         style={{
// // //                             width: 100,
// // //                             height: 100,
// // //                             borderRadius: 50,
// // //                             resizeMode: 'cover',
// // //                             marginBottom: 20,
// // //                         }} />
// // //                     <Text style={{
// // //                         alignItems: 'center',
// // //                         fontWeight: '900',
// // //                         fontSize: 22,
// // //                         paddingTop: 10,
// // //                         color: '#fff'
// // //                     }}>Jeff Lincoln Gitari</Text>

// // //                 </View>
// // //                 <View style={{
// // //                     backgroundColor: '#000', paddingTop: 20,

// // //                 }}>
// // //                     <DrawerItemList {...props} style={{}} />
// // //                 </View>
// // //             </DrawerContentScrollView>

// // //             <View
// // //                 style={{
// // //                     borderTopColor: '#dde3fe',
// // //                     borderTopWidth: 1,
// // //                     padding: 20,
// // //                     paddingBottom: 20 + bottom,
// // //                     backgroundColor: '#fff'
// // //                 }}>
// // //                 <DrawerItem label={"Log Out"} onPress={() => router.replace('/')} />
// // //             </View>
// // //         </View>
// // //     );
// // // }



// // // const Layout = () => {
// // //     return (
// // //         <GestureHandlerRootView style={{ flex: 1 }}>
// // //             <StatusBar style='dark' />
// // //             <Drawer drawerContent={CustomDrawerContent}
// // //                 screenOptions={{
// // //                     drawerHideStatusBarOnOpen: false,
// // //                     drawerActiveBackgroundColor: '#FFEA00',
// // //                     drawerActiveTintColor: "#fff",
// // //                 }}>
// // //                 <Drawer.Screen
// // //                     name="home"
// // //                     options={{
// // //                         drawerLabel: 'Home',
// // //                         headerTitle: "Home",
// // //                         headerShown: true,
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Ionicons name="home-outline" size={size} color={color} />
// // //                         )
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="myOrders"
// // //                     options={{
// // //                         drawerLabel: 'My Orders',
// // //                         headerTitle: "My Orders",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Ionicons name="card" size={size} color={color} />
// // //                         )
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="Profile"
// // //                     options={{
// // //                         drawerLabel: 'Profile',
// // //                         headerTitle: "Profile",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Ionicons name="person-outline" size={size} color={color} />
// // //                         )
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="Payment"
// // //                     options={{
// // //                         drawerLabel: 'Payment',
// // //                         headerTitle: "Payment",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <MaterialIcons name="payments" size={size} color={color} />
// // //                         )
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="CheckList"
// // //                     options={{
// // //                         drawerLabel: 'CheckList',
// // //                         headerTitle: "CheckList",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <Octicons name="checklist" size={size} color={color} />
// // //                         )
// // //                     }}
// // //                 />
// // //                 <Drawer.Screen
// // //                     name="FreeDrops"
// // //                     options={{
// // //                         drawerLabel: 'FreeDrops',
// // //                         headerTitle: "FreeDrops",
// // //                         drawerIcon: ({ size, color }) => (
// // //                             <FontAwesome5 name="gift" size={size} color={color} />
// // //                         )
// // //                     }}
// // //                 />
// // //             </Drawer>
// // //         </GestureHandlerRootView>
// // //     )
// // // }

// // // export default Layout

// // // const styles = StyleSheet.create({})