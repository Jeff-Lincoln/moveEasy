import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { AntDesign } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons, Octicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Drawer } from 'expo-router/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomHeader from '@/components/CustomHeader';

const CustomDrawerContent = (props: any) => {
    const { navigation } = props;
    const { top, bottom } = useSafeAreaInsets();

    return (
        <View style={styles.drawerContainer}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profileContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <Image
                            source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.drawerItemsContainer}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <TouchableOpacity style={styles.logoutContainer} onPress={() => navigation.navigate('Login')}>
                <AntDesign name="logout" size={24} color="#FFEA00" style={styles.logoutIcon} />
                <Text style={styles.logoutLabel}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const Layout = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Drawer
                drawerContent={CustomDrawerContent}
                screenOptions={{
                    drawerHideStatusBarOnOpen: false,
                    drawerActiveBackgroundColor: '#FFEA00',
                    drawerActiveTintColor: "#000",
                    drawerInactiveTintColor: '#fff',
                    headerStyle: { backgroundColor: '#000' },
                    headerTintColor: '#fff',
                    drawerLabelStyle: { fontWeight: 'bold' },
                }}>
                <Drawer.Screen
                    name="home"
                    options={{
                        drawerLabel: 'Home',
                        headerTitle: "Home",
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="home-outline" size={size} color={color} />
                        ),
                        header: () => <CustomHeader />,
                        headerTransparent: true,
                    }}
                />
                <Drawer.Screen
                    name="myOrders"
                    options={{
                        drawerLabel: 'My Orders',
                        headerTitle: "My Orders",
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="card" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="Profile"
                    options={{
                        drawerLabel: 'Profile',
                        headerTitle: "Profile",
                        drawerIcon: ({ size, color }) => (
                            <Ionicons name="person-outline" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="Payment"
                    options={{
                        drawerLabel: 'Payment',
                        headerTitle: "Payment",
                        drawerIcon: ({ size, color }) => (
                            <MaterialIcons name="payments" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="CheckList"
                    options={{
                        drawerLabel: 'CheckList',
                        headerTitle: "CheckList",
                        drawerIcon: ({ size, color }) => (
                            <Octicons name="checklist" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="Chats"
                    options={{
                        drawerLabel: 'Chats',
                        headerTitle: "Chats",
                        drawerIcon: ({ size, color }) => (
                            <FontAwesome name="wechat" size={size} color={color} />
                        ),
                    }}
                />
                <Drawer.Screen
                    name="FreeDrops"
                    options={{
                        drawerLabel: 'FreeDrops',
                        headerTitle: "FreeDrops",
                        drawerIcon: ({ size, color }) => (
                            <FontAwesome5 name="gift" size={size} color={color} />
                        ),
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
};

export default Layout;

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#1c1c1e', // Dark gray background color
    },
    scrollContainer: {
        backgroundColor: '#1c1c1e', // Dark gray background color
    },
    profileContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#333',
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        resizeMode: 'cover',
        marginBottom: 10,
    },
    profileName: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
    drawerItemsContainer: {
        backgroundColor: '#1c1c1e', // Dark gray background color
        paddingTop: 20,
        paddingBottom: 10,
    },
    logoutContainer: {
        borderTopColor: '#4a4a4a',
        borderTopWidth: 1,
        padding: 20,
        backgroundColor: '#1c1c1e', // Dark gray background color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutLabel: {
        color: '#FFEA00',
        fontWeight: 'bold',
        fontSize: 16,
    },
});


// import { Image, StyleSheet, Text, useColorScheme, View } from 'react-native';
// import React from 'react';
// import { Stack, Tabs, useRouter } from 'expo-router';
// import 'react-native-gesture-handler';
// import { Drawer } from 'expo-router/drawer';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
// import { MaterialIcons } from '@expo/vector-icons';
// import { Octicons } from '@expo/vector-icons';
// import { FontAwesome5 } from '@expo/vector-icons';
// import { StatusBar } from 'expo-status-bar';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// import CustomHeader from '@/components/CustomHeader';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

// function CustomDrawerContent(props: any) {
//     const router = useRouter();
//     const { top, bottom } = useSafeAreaInsets();

//     return (
//         <View style={styles.drawerContainer}>
//             <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={styles.scrollContainer}>
//                 <View style={styles.profileContainer}>
//                     <Image
//                         source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
//                         style={styles.profileImage}
//                     />
//                     <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
//                 </View>
//                 <View style={styles.drawerItemsContainer}>
//                     <DrawerItemList {...props} />
//                 </View>
//             </DrawerContentScrollView>
//             <View style={[styles.logoutContainer, { paddingBottom: bottom }]}>
//                 <AntDesign name="logout" size={24} color="yellow" style={styles.logoutIcon} />
//                 <Text style={styles.logoutLabel} onPress={() => router.replace('/')}>Log Out</Text>
//             </View>
//         </View>
//     );
// }

// const Layout = () => {
//     return (
//         <GestureHandlerRootView style={{ flex: 1 }}>
//             <StatusBar style="dark" />
//             <Drawer
//                 drawerContent={CustomDrawerContent}
//                 screenOptions={{
//                     drawerHideStatusBarOnOpen: false,
//                     drawerActiveBackgroundColor: '#FFEA00',
//                     drawerActiveTintColor: "#000",
//                     drawerInactiveTintColor: '#fff',
//                     headerStyle: { backgroundColor: '#000' },
//                     headerTintColor: '#fff',
//                     drawerLabelStyle: { fontWeight: 'bold' },
//                 }}>
//                 <Drawer.Screen
//                     name="home"
//                     options={{
//                         drawerLabel: 'Home',
//                         headerTitle: "Home",
//                         drawerIcon: ({ size, color }) => (
//                             <Ionicons name="home-outline" size={size} color={color} />
//                         ),
//                         header: () => <CustomHeader />,
//                         headerTransparent: true,
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="myOrders"
//                     options={{
//                         drawerLabel: 'My Orders',
//                         headerTitle: "My Orders",
//                         drawerIcon: ({ size, color }) => (
//                             <Ionicons name="card" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="Profile"
//                     options={{
//                         drawerLabel: 'Profile',
//                         headerTitle: "Profile",
//                         drawerIcon: ({ size, color }) => (
//                             <Ionicons name="person-outline" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="Payment"
//                     options={{
//                         drawerLabel: 'Payment',
//                         headerTitle: "Payment",
//                         drawerIcon: ({ size, color }) => (
//                             <MaterialIcons name="payments" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="CheckList"
//                     options={{
//                         drawerLabel: 'CheckList',
//                         headerTitle: "CheckList",
//                         drawerIcon: ({ size, color }) => (
//                             <Octicons name="checklist" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="Chats"
//                     options={{
//                         drawerLabel: 'Chats',
//                         headerTitle: "Chats",
//                         drawerIcon: ({ size, color }) => (
//                             <FontAwesome name="wechat" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="FreeDrops"
//                     options={{
//                         drawerLabel: 'FreeDrops',
//                         headerTitle: "FreeDrops",
//                         drawerIcon: ({ size, color }) => (
//                             <FontAwesome5 name="gift" size={size} color={color} />
//                         ),
//                     }}
//                 />
//             </Drawer>
//         </GestureHandlerRootView>
//     );
// }

// export default Layout;

// const styles = StyleSheet.create({
//     drawerContainer: {
//         flex: 1,
//         backgroundColor: '#333', // Dark gray background color
//     },
//     scrollContainer: {
//         backgroundColor: '#333', // Dark gray background color
//     },
//     profileContainer: {
//         padding: 20,
//         alignItems: 'center',
//     },
//     profileImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         resizeMode: 'cover',
//         marginBottom: 20,
//     },
//     profileName: {
//         fontWeight: '900',
//         fontSize: 22,
//         color: '#fff',
//         textAlign: 'center',
//     },
//     drawerItemsContainer: {
//         backgroundColor: '#333', // Dark gray background color
//         paddingTop: 40,
//         paddingBottom: 10,
//     },
//     logoutContainer: {
//         borderTopColor: '#dde3fe',
//         borderTopWidth: 1,
//         padding: 20,
//         backgroundColor: '#333', // Dark gray background color
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     logoutIcon: {
//         marginRight: 10,
//     },
//     logoutLabel: {
//         color: '#FFEA00',
//         fontWeight: 'bold',
//         fontSize: 18,
//     },
// });


// import { Image, StyleSheet, Text, View } from 'react-native';
// import React from 'react';
// import { Stack, Tabs, useRouter } from 'expo-router';
// import 'react-native-gesture-handler';
// import { Drawer } from 'expo-router/drawer';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
// import { MaterialIcons } from '@expo/vector-icons';
// import { Octicons } from '@expo/vector-icons';
// import { FontAwesome5 } from '@expo/vector-icons';
// import { StatusBar } from 'expo-status-bar';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// import CustomHeader from '@/components/CustomHeader';

// function CustomDrawerContent(props: any) {
//     const router = useRouter();
//     const { top, bottom } = useSafeAreaInsets();

//     return (
//         <View style={styles.drawerContainer}>
//             <DrawerContentScrollView {...props} scrollEnabled={true} contentContainerStyle={styles.scrollContainer}>
//                 <View style={styles.profileContainer}>
//                     <Image
//                         source={{ uri: 'https://avatars.githubusercontent.com/u/100000000?v=4' }}
//                         style={styles.profileImage}
//                     />
//                     <Text style={styles.profileName}>Jeff Lincoln Gitari</Text>
//                 </View>
//                 <View style={styles.drawerItemsContainer}>
//                     <DrawerItemList {...props} />
//                 </View>
//             </DrawerContentScrollView>
//             <View style={[styles.logoutContainer, { paddingBottom: bottom }]}>
//                 <AntDesign name="logout" size={24} color="yellow" style={styles.logoutIcon} />
//                 <Text style={styles.logoutLabel} onPress={() => router.replace('/')}>Log Out</Text>
//             </View>
//         </View>
//     );
// }

// const Layout = () => {
//     return (
//         <GestureHandlerRootView style={{ flex: 1 }}>
//             <StatusBar style="light" />
//             <Drawer
//                 drawerContent={CustomDrawerContent}
//                 screenOptions={{
//                     drawerHideStatusBarOnOpen: false,
//                     drawerActiveBackgroundColor: '#FFEA00',
//                     drawerActiveTintColor: "#000",
//                     drawerInactiveTintColor: '#fff',
//                     headerStyle: { backgroundColor: '#000' },
//                     headerTintColor: '#fff',
//                     drawerLabelStyle: { fontWeight: 'bold' },
//                 }}>
//                 <Drawer.Screen
//                     name="home"
//                     options={{
//                         drawerLabel: 'Home',
//                         headerTitle: "Home",
//                         drawerIcon: ({ size, color }) => (
//                             <Ionicons name="home-outline" size={size} color={color} />
//                         ),
//                         header: () => <CustomHeader />,
//                         headerTransparent: true,
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="myOrders"
//                     options={{
//                         drawerLabel: 'My Orders',
//                         headerTitle: "My Orders",
//                         drawerIcon: ({ size, color }) => (
//                             <Ionicons name="card" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="Profile"
//                     options={{
//                         drawerLabel: 'Profile',
//                         headerTitle: "Profile",
//                         drawerIcon: ({ size, color }) => (
//                             <Ionicons name="person-outline" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="Payment"
//                     options={{
//                         drawerLabel: 'Payment',
//                         headerTitle: "Payment",
//                         drawerIcon: ({ size, color }) => (
//                             <MaterialIcons name="payments" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="CheckList"
//                     options={{
//                         drawerLabel: 'CheckList',
//                         headerTitle: "CheckList",
//                         drawerIcon: ({ size, color }) => (
//                             <Octicons name="checklist" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="Chats"
//                     options={{
//                         drawerLabel: 'Chats',
//                         headerTitle: "Chats",
//                         drawerIcon: ({ size, color }) => (
//                             <FontAwesome name="wechat" size={size} color={color} />
//                         ),
//                     }}
//                 />
//                 <Drawer.Screen
//                     name="FreeDrops"
//                     options={{
//                         drawerLabel: 'FreeDrops',
//                         headerTitle: "FreeDrops",
//                         drawerIcon: ({ size, color }) => (
//                             <FontAwesome5 name="gift" size={size} color={color} />
//                         ),
//                     }}
//                 />
//             </Drawer>
//         </GestureHandlerRootView>
//     );
// }

// export default Layout;

// const styles = StyleSheet.create({
//     drawerContainer: {
//         flex: 1,
//         backgroundColor: '#000',
//     },
//     scrollContainer: {
//         backgroundColor: '#000',
//     },
//     profileContainer: {
//         padding: 20,
//         alignItems: 'center',
//     },
//     profileImage: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         resizeMode: 'cover',
//         marginBottom: 20,
//     },
//     profileName: {
//         fontWeight: '900',
//         fontSize: 22,
//         color: '#fff',
//         textAlign: 'center',
//     },
//     drawerItemsContainer: {
//         backgroundColor: '#000',
//         paddingTop: 40,
//         paddingBottom: 10,
//     },
//     logoutContainer: {
//         borderTopColor: '#dde3fe',
//         borderTopWidth: 1,
//         padding: 20,
//         backgroundColor: '#000',
//         flexDirection: 'row',
//         alignItems: 'center',
//         // justifyContent: 'center',
//     },
//     logoutIcon: {
//         marginRight: 10,
//     },
//     logoutLabel: {
//         color: '#FFEA00',
//         fontWeight: 'bold',
//         fontSize: 18,
//     },
// });


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
// //                 <DrawerItem
// //                     label="Log Out"
// //                     onPress={() => router.replace('/')}
// //                     labelStyle={styles.logoutLabel}
// //                 />
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
// //                         // headerShown: false,
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
// //         paddingBottom: 20,
// //         backgroundColor: '#000',
// //         flexDirection: 'row',
// //     },
// //     logoutLabel: {
// //         color: '#FFEA00',
// //         fontWeight: 'bold',
// //         fontSize: 20,
// //     },
// //     logoutIcon: {
// //         marginRight: 10,
// //     },
// //     // logoutLabel: {
// //     //     color: '#FFEA00',
// //     //     fontWeight: 'bold',
// //     // },
// // });




// // import { Image, StyleSheet, Text, View } from 'react-native'
// // import React from 'react'
// // import { Stack, Tabs, useRouter } from 'expo-router';
// // import 'react-native-gesture-handler';
// // import { Drawer } from 'expo-router/drawer'
// // import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import { AntDesign, Ionicons } from '@expo/vector-icons';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import { Octicons } from '@expo/vector-icons';
// // import { FontAwesome5 } from '@expo/vector-icons';
// // import { StatusBar } from 'expo-status-bar';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
// // // import CustomDrawerContent from '@/components/CustomDrawerContent';


// // function CustomDrawerContent(props: any) {
// //     const router = useRouter();
// //     const { top, bottom } = useSafeAreaInsets();

// //     return (
// //         <View style={{ flex: 1, backgroundColor: '#000' }} >
// //             <DrawerContentScrollView {...props}
// //                 scrollEnabled={true}
// //                 contentContainerStyle={{ backgroundColor: "#000" }}>

// //                 <View style={{
// //                     padding: 20
// //                 }}>
// //                     <Image source={{
// //                         uri: 'https://avatars.githubusercontent.com/u/100000000?v=4',
// //                     }}
// //                         style={{
// //                             width: 100,
// //                             height: 100,
// //                             borderRadius: 50,
// //                             resizeMode: 'cover',
// //                             marginBottom: 20,
// //                         }} />
// //                     <Text style={{
// //                         alignItems: 'center',
// //                         fontWeight: '900',
// //                         fontSize: 22,
// //                         paddingTop: 10,
// //                         color: '#fff'
// //                     }}>Jeff Lincoln Gitari</Text>

// //                 </View>
// //                 <View style={{
// //                     backgroundColor: '#000', paddingTop: 20,

// //                 }}>
// //                     <DrawerItemList {...props} style={{}} />
// //                 </View>
// //             </DrawerContentScrollView>

// //             <View
// //                 style={{
// //                     borderTopColor: '#dde3fe',
// //                     borderTopWidth: 1,
// //                     padding: 20,
// //                     paddingBottom: 20 + bottom,
// //                     backgroundColor: '#fff'
// //                 }}>
// //                 <DrawerItem label={"Log Out"} onPress={() => router.replace('/')} />
// //             </View>
// //         </View>
// //     );
// // }



// // const Layout = () => {
// //     return (
// //         <GestureHandlerRootView style={{ flex: 1 }}>
// //             <StatusBar style='dark' />
// //             <Drawer drawerContent={CustomDrawerContent}
// //                 screenOptions={{
// //                     drawerHideStatusBarOnOpen: false,
// //                     drawerActiveBackgroundColor: '#FFEA00',
// //                     drawerActiveTintColor: "#fff",
// //                 }}>
// //                 <Drawer.Screen
// //                     name="home"
// //                     options={{
// //                         drawerLabel: 'Home',
// //                         headerTitle: "Home",
// //                         headerShown: true,
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="home-outline" size={size} color={color} />
// //                         )
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="myOrders"
// //                     options={{
// //                         drawerLabel: 'My Orders',
// //                         headerTitle: "My Orders",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="card" size={size} color={color} />
// //                         )
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Profile"
// //                     options={{
// //                         drawerLabel: 'Profile',
// //                         headerTitle: "Profile",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Ionicons name="person-outline" size={size} color={color} />
// //                         )
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="Payment"
// //                     options={{
// //                         drawerLabel: 'Payment',
// //                         headerTitle: "Payment",
// //                         drawerIcon: ({ size, color }) => (
// //                             <MaterialIcons name="payments" size={size} color={color} />
// //                         )
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="CheckList"
// //                     options={{
// //                         drawerLabel: 'CheckList',
// //                         headerTitle: "CheckList",
// //                         drawerIcon: ({ size, color }) => (
// //                             <Octicons name="checklist" size={size} color={color} />
// //                         )
// //                     }}
// //                 />
// //                 <Drawer.Screen
// //                     name="FreeDrops"
// //                     options={{
// //                         drawerLabel: 'FreeDrops',
// //                         headerTitle: "FreeDrops",
// //                         drawerIcon: ({ size, color }) => (
// //                             <FontAwesome5 name="gift" size={size} color={color} />
// //                         )
// //                     }}
// //                 />
// //             </Drawer>
// //         </GestureHandlerRootView>
// //     )
// // }

// // export default Layout

// // const styles = StyleSheet.create({})