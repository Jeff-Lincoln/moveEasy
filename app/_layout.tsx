import * as SecureStore from 'expo-secure-store';
import Colors from "@/constants/Colors";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import SplashScreenView from './screens/SplashScreenView';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SupabaseProvider } from '@/context/SupabaseContext'
import { Provider } from 'react-redux';
import { store } from './context/store';
import React from 'react';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      console.log(`${key} was used 🔐 \n`);
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("SecureStore save item error: ", err);
    }
  },
};

export default function RootLayout() {
  const [isSplash, setIsSplash] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 3000);

    return () => clearTimeout(timer); // Clean up the timer on unmount
  }, []);

  return (
    <Provider store={store}>
      <ActionSheetProvider>

      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ActionSheetProvider>
          <>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <GestureHandlerRootView style={{ flex: 1 }}>
              {isSplash ? <SplashScreenView /> : <RootNavigator />}
            </GestureHandlerRootView>
          </>
        </ActionSheetProvider>
      </ClerkLoaded>
    </ClerkProvider>
    </ActionSheetProvider>
    </Provider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(authenticated)";

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(authenticated)/(tabs)/Home' as const);
    } else if (!isSignedIn) {
      router.replace('/' as const);
    }
  }, [isSignedIn, isLoaded]);

  if (!isLoaded) {
      return (
       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
             <SplashScreenView />
        </SafeAreaView>
    );
  }
    useEffect(() => {
    console.log('isSignedIn', isSignedIn)
  }, [isSignedIn])

  return (
    <SupabaseProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="screens/signUp"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: Colors.background },
              }}
            />
            <Stack.Screen
              name="screens/login"
              options={{
                headerShown: true,
                headerStyle: { backgroundColor: Colors.background },
                headerRight: () => (
                  <Link href={'/screens/help'} asChild>
                    <TouchableOpacity>
                      <Ionicons name="help-circle-outline" size={34} color="#000" />
                    </TouchableOpacity>
                  </Link>
                ),
              }}
            />
            <Stack.Screen
              name="screens/help"
              options={{
                title: "Help",
                presentation: "modal",
              }}
            />
            <Stack.Screen
              name="verify/[phone]"
              options={{
                headerShown: false,
                headerStyle: { backgroundColor: Colors.background },
              }}
            />
            <Stack.Screen
              name='(authenticated)/(tabs)'
              options={{ headerShown: false }}
            />
          </Stack>
      </ThemeProvider>
    </SupabaseProvider>
  );
}



// import * as SecureStore from 'expo-secure-store';
// import Colors from "@/constants/Colors";
// import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// import { Ionicons } from "@expo/vector-icons";
// import { Link, Redirect, Stack, useRouter, useSegments } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useEffect, useState } from 'react';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import SplashScreenView from './screens/SplashScreenView';
// import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// import { SupabaseProvider } from '@/context/SupabaseContext'
// import { Provider } from 'react-redux';
// import { store } from './context/store';


// const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       const item = await SecureStore.getItemAsync(key);
//       console.log(`${key} was used 🔐 \n`);
//       return item;
//     } catch (error) {
//       console.error("SecureStore get item error: ", error);
//       await SecureStore.deleteItemAsync(key);
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       await SecureStore.setItemAsync(key, value);
//     } catch (err) {
//       console.error("SecureStore save item error: ", err);
//     }
//   },
// };

// export default function RootLayout() {
//   const [isSplash, setIsSplash] = useState(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsSplash(false);
//     }, 5000);

//     return () => clearTimeout(timer); // Clean up the timer on unmount
//   }, []);

//   return (
//     <Provider store={store}>
//       <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
//       <ClerkLoaded>
//         <ActionSheetProvider>
//           <>
//             <StatusBar style='light' />
//             <GestureHandlerRootView style={{ flex: 1 }}>
//               {isSplash ? <SplashScreenView /> : <RootNavigator />}
//             </GestureHandlerRootView>
//           </>
//         </ActionSheetProvider>
//       </ClerkLoaded>
//     </ClerkProvider>
//     </Provider>
//   );
// }

// function RootNavigator() {
//   const router = useRouter();
//   const { isLoaded, isSignedIn } = useAuth();
//   const segments = useSegments();
//   const colorScheme = useColorScheme();

//   useEffect(() => {
//     if (!isLoaded) return;

//     const inAuthGroup = segments[0] === "(authenticated)";

//     if (isSignedIn && !inAuthGroup) {
//       router.replace('/(authenticated)/(tabs)/Home' as const);
//     } else if (!isSignedIn) {
//       router.replace('/' as const);
//     }
//   }, [isSignedIn, isLoaded,]);

//   if (!isLoaded) {
//       return (
//        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="blue" />
//              <SplashScreenView />
//         </SafeAreaView>
//     );
//   }
//     useEffect(() => {
//     console.log('isSignedIn', isSignedIn)
//   }, [isSignedIn])

//   return (
//     <SupabaseProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DarkTheme}>
//           <Stack>
//             <Stack.Screen name="index" options={{ headerShown: false }} />
//             <Stack.Screen
//               name="screens/signUp"
//               options={{
//                 headerShown: true,
//                 headerStyle: { backgroundColor: Colors.background },
//               }}
//             />
//             <Stack.Screen
//               name="screens/login"
//               options={{
//                 headerShown: true,
//                 headerStyle: { backgroundColor: Colors.background },
//                 headerRight: () => (
//                   <Link href={'/screens/help'} asChild>
//                     <TouchableOpacity>
//                       <Ionicons name="help-circle-outline" size={34} color="#000" />
//                     </TouchableOpacity>
//                   </Link>
//                 ),
//               }}
//             />
//             <Stack.Screen
//               name="screens/help"
//               options={{
//                 title: "Help",
//                 presentation: "modal",
//               }}
//             />
//             <Stack.Screen
//               name="verify/[phone]"
//               options={{
//                 headerShown: false,
//                 headerStyle: { backgroundColor: Colors.background },
//               }}
//             />
//             <Stack.Screen
//               name='(authenticated)/(tabs)'
//               options={{ headerShown: false }}
//             />
//           </Stack>
//       </ThemeProvider>
//     </SupabaseProvider>
//   );
// }





// // import * as SecureStore from 'expo-secure-store';
// // import Colors from "@/constants/Colors";
// // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // import { Ionicons } from "@expo/vector-icons";
// // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // import { StatusBar } from "expo-status-bar";
// // import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { useEffect, useLayoutEffect, useState } from 'react';
// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // import { useColorScheme } from '@/hooks/useColorScheme';
// // import SplashScreenView from './screens/SplashScreenView';
// // import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// // import { SupabaseProvider } from '@/context/SupabaseContext'


// // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// // const tokenCache = {
// //   async getToken(key: string) {
// //     try {
// //       const item = await SecureStore.getItemAsync(key);
// //       console.log(`${key} was used 🔐 \n`);
// //       return item;
// //     } catch (error) {
// //       console.error("SecureStore get item error: ", error);
// //       await SecureStore.deleteItemAsync(key);
// //       return null;
// //     }
// //   },
// //   async saveToken(key: string, value: string) {
// //     try {
// //       await SecureStore.setItemAsync(key, value);
// //     } catch (err) {
// //       console.error("SecureStore save item error: ", err);
// //     }
// //   },
// // };

// // export default function RootLayout() {
// //   const [isSplash, setIsSplash] = useState(true);

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setIsSplash(false);
// //     }, 5000);

// //     return () => clearTimeout(timer); // Clean up the timer on unmount
// //   }, []);

// //   return (
// //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// //       <ClerkLoaded>
// //         <ActionSheetProvider>
// //           <>
// //             <StatusBar style='light' />
// //             <GestureHandlerRootView style={{ flex: 1 }}>
// //               {isSplash ? <SplashScreenView /> : <RootNavigator />}
// //             </GestureHandlerRootView>
// //           </>
// //         </ActionSheetProvider>
// //       </ClerkLoaded>
// //     </ClerkProvider>
// //   );
// // }

// // function RootNavigator() {
// //   const router = useRouter();
// //   const { isLoaded, isSignedIn } = useAuth();
// //   const segments = useSegments();
// //   const colorScheme = useColorScheme();

// //   useEffect(() => {
// //     if (!isLoaded) return;

// //     const inAuthGroup = segments[0] === "(authenticated)";

// //     if (isSignedIn && !inAuthGroup) {
// //       router.replace('/(authenticated)/(tabs)/Home');
// //     } else if (!isSignedIn) {
// //       router.replace('/');
// //     }
// //   }, [isSignedIn]);
// //   // useLayoutEffect(() => {
// //   //   if (!isLoaded) {
// //   //     return (
// //   //       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //   //         <ActivityIndicator size="large" color={Colors.gray} />
// //   //         <SplashScreenView />
// //   //         {/* <Text style={{ color: 'Blue'}}>Loading...</Text> */}
// //   //       </SafeAreaView>
// //   //     );
// //   //   }
// //   //   }, [isLoaded])

// //   // useEffect(() => {
// //   //   if (!isLoaded) return;

// //   //   const inAuthGroup = segments[0] === "(authenticated)";

// //   //   if (isSignedIn && !inAuthGroup) {
// //   //     router.replace('/(authenticated)/(tabs)/Home');
// //   //   } else if (!isSignedIn) {
// //   //     router.replace('/');
// //   //   }
// //   //
// //   // }, [isSignedIn, isLoaded]);
// //   if (!isLoaded) {
// //       return (
// //        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //         <ActivityIndicator size="large" color={Colors.gray} />
// //              <SplashScreenView />
// //             {/* <Text style={{ color: 'Blue'}}>Loading...</Text> */}
// //         </SafeAreaView>
// //     );
// //     }

// //   return (
// //     <SupabaseProvider>
// //       <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DarkTheme}>
// //           {/* <StatusBar style={colorScheme === 'light' ? "dark" : "light"} /> */}
// //           <Stack>
// //             <Stack.Screen name="index" options={{ headerShown: false }} />
// //             <Stack.Screen
// //               name="screens/signUp"
// //               options={{
// //                 headerShown: true,
// //                 headerStyle: { backgroundColor: Colors.background },
// //               }}
// //             />
// //             <Stack.Screen
// //               name="screens/login"
// //               options={{
// //                 headerShown: true,
// //                 headerStyle: { backgroundColor: Colors.background },
// //                 headerRight: () => (
// //                   <Link href={'/screens/help'} asChild>
// //                     <TouchableOpacity>
// //                       <Ionicons name="help-circle-outline" size={34} color="#000" />
// //                     </TouchableOpacity>
// //                   </Link>
// //                 ),
// //               }}
// //             />
// //             <Stack.Screen
// //               name="screens/help"
// //               options={{
// //                 title: "Help",
// //                 presentation: "modal",
// //               }}
// //             />
// //             <Stack.Screen
// //               name="verify/[phone]"
// //               options={{
// //                 headerShown: false,
// //                 headerStyle: { backgroundColor: Colors.background },
// //               }}
// //             />
// //             <Stack.Screen
// //               name='(authenticated)/(tabs)'
// //               options={{ headerShown: false }}
// //             />
// //           </Stack>
// //       </ThemeProvider>
// //     </SupabaseProvider>
// //   );
// // }


// // import * as SecureStore from 'expo-secure-store';
// // import Colors from "@/constants/Colors";
// // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // import { Ionicons } from "@expo/vector-icons";
// // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // import { StatusBar } from "expo-status-bar";
// // import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { useEffect, useState } from 'react';
// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // import { useColorScheme } from '@/hooks/useColorScheme';
// // import SplashScreenView from './screens/SplashScreenView';


// // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// // const tokenCache = {
// //   async getToken(key: string) {
// //     try {
// //       const item = await SecureStore.getItemAsync(key);
// //       if (item) {
// //         console.log(`${key} was used 🔐 \n`);
// //       } else {
// //         console.log("No values stored under key: " + key);
// //       }
// //       return item;
// //     } catch (error) {
// //       console.error("SecureStore get item error: ", error);
// //       await SecureStore.deleteItemAsync(key);
// //       return null;
// //     }
// //   },
// //   async saveToken(key: string, value: string) {
// //     try {
// //       await SecureStore.setItemAsync(key, value);
// //     } catch (err) {
// //       console.error("SecureStore save item error: ", err);
// //     }
// //   },
// // };

// // export default function RootLayout() {
// //   const [isSplash, SetIsSplash] = useState(true);
// //   useEffect(() => {
// //     setTimeout(() => {
// //       SetIsSplash(false);
// //     }, 3000);
// //   }, []);

// //   return (
// //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// //       {isSplash ? (
// //         <SplashScreenView />
// //       ) : (
// //         <RootNavigator />
// //       )}
// //     </ClerkProvider>

// //   );
// // }

// // function RootNavigator() {
// //   const router = useRouter();
// //   const { isLoaded, isSignedIn } = useAuth();
// //   const segments = useSegments();
// //   const colorScheme = useColorScheme();


// //   useEffect(() => {
// //     console.log('isSignedIn', isSignedIn);
// //     if (!isLoaded) return;

// //     const inAuthGroup = segments[0] === "(authenticated)";

// //     if (isSignedIn && !inAuthGroup) {
// //       router.replace('/(authenticated)/(tabs)/Home');
// //     } else if (!isSignedIn) {
// //       router.replace('/(authenticated)/(tabs)/Home');
// //     }
// //   }, [isSignedIn, isLoaded]);

// //   if (!isLoaded) {
// //     return (
// //       <SplashScreenView />
// //       // <View style={{
// //       //   flex: 1,
// //       //   justifyContent: 'center',
// //       //   alignItems: 'center',
// //       //   backgroundColor: '#F5F5F5',
// //       // }}>
// //       //   <ActivityIndicator size="large" color='blue' />
// //       //   <Text>Loading</Text>
// //       // </View>
// //     );
// //   }
// //   return (
// //     <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
// //       <GestureHandlerRootView style={{ flex: 1 }}>
// //         <StatusBar style="light" />
// //         <Stack>
// //           <Stack.Screen name="index" options={{ headerShown: false }} />
// //           <Stack.Screen
// //             name="screens/signUp"
// //             options={{
// //               title: "",
// //               headerBackTitle: "",
// //               headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //             }}
// //           />
// //           <Stack.Screen
// //             name="screens/login"
// //             options={{
// //               title: "",
// //               headerBackTitle: "",
// //               headerStyle: { backgroundColor: Colors.background },
// //               headerRight: () => (
// //                 <Link href={'/screens/help'} asChild>
// //                   <TouchableOpacity>
// //                     <Ionicons name="help-circle-outline" size={34} color="#000" />
// //                   </TouchableOpacity>
// //                 </Link>
// //               ),
// //             }}
// //           />
// //           <Stack.Screen
// //             name="screens/help"
// //             options={{
// //               title: "Help",
// //               presentation: "modal",
// //             }}
// //           />
// //           <Stack.Screen
// //             name="verify/[phone]"
// //             options={{
// //               title: "",
// //               headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //             }}
// //           />
// //           <Stack.Screen
// //             name='(authenticated)/(tabs)'
// //             options={{ headerShown: false }}
// //           />
// //         </Stack>
// //       </GestureHandlerRootView>
// //     </ThemeProvider>
// //   );
// // }



// // import * as SecureStore from 'expo-secure-store';
// // import Colors from "@/constants/Colors";
// // import { ClerkProvider, SignedIn, useAuth } from "@clerk/clerk-expo";
// // import { Ionicons } from "@expo/vector-icons";
// // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // import { StatusBar } from "expo-status-bar";
// // import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { useEffect } from 'react';
// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // import loading from '@/assets/images/loading.jpeg'

// // import { useColorScheme } from '@/hooks/useColorScheme';


// // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// // const tokenCache = {
// //   async getToken(key: string) {
// //     try {
// //       const item = await SecureStore.getItemAsync(key);
// //       if (item) {
// //         console.log(`${key} was used 🔐 \n`);
// //       } else {
// //         console.log("No values stored under key: " + key);
// //       }
// //       return item;
// //     } catch (error) {
// //       console.error("SecureStore get item error: ", error);
// //       await SecureStore.deleteItemAsync(key);
// //       return null;
// //     }
// //   },
// //   async saveToken(key: string, value: string) {
// //     try {
// //       await SecureStore.setItemAsync(key, value);
// //     } catch (err) {
// //       console.error("SecureStore save item error: ", err);
// //     }
// //   },
// // };

// // export default function RootLayout() {
// //   return (
// //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
// //       <RootNavigator />
// //     </ClerkProvider>
// //   );
// // }

// // function RootNavigator() {
// //   const router = useRouter();
// //   const { isLoaded, isSignedIn } = useAuth();
// //   const segments = useSegments();
// //   const colorScheme = useColorScheme();


// //   useEffect(() => {
// //     console.log('isSignedIn', isSignedIn);
// //     if (!isLoaded) return;

// //     const inAuthGroup = segments[0] === "(authenticated)";

// //     if (isSignedIn && !inAuthGroup) {
// //       router.replace('/(authenticated)/(tabs)/home')
// //     } else if (!SignedIn) {
// //       router.replace('/')
// //     }
// //   }, [isSignedIn]);

// //   if (!isLoaded) {
// //     return <View>
// //       <Image
// //         style={{ flex: 1, width: '100%', height: '100%' }}
// //         source={}
// //       />
// //     </View>
// //   }

// //   return (
// //     <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
// //       <GestureHandlerRootView style={{ flex: 1 }}>
// //         <StatusBar style="dark" />
// //         <Stack>
// //           <Stack.Screen name="index" options={{ headerShown: false }} />
// //           <Stack.Screen
// //             name="screens/signUp"
// //             options={{
// //               title: "",
// //               headerBackTitle: "",
// //               headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //             }}
// //           />
// //           <Stack.Screen
// //             name="screens/login"
// //             options={{
// //               title: "",
// //               headerBackTitle: "",
// //               // headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //               headerRight: () => (
// //                 <Link href={'/screens/help'} asChild>
// //                   <TouchableOpacity>
// //                     <Ionicons name="help-circle-outline" size={34} color={Colors.dark} />
// //                   </TouchableOpacity>
// //                 </Link>
// //               ),
// //             }}
// //           />
// //           <Stack.Screen
// //             name="screens/help"
// //             options={{
// //               title: "Help",
// //               presentation: "modal",
// //             }}
// //           />
// //           <Stack.Screen
// //             name="verify/[phone]"
// //             options={{
// //               title: "",
// //               headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //             }}
// //           />
// //           <Stack.Screen name='(authenticated)/(tabs)' options={{
// //             headerShown: false
// //           }} />
// //         </Stack>
// //       </GestureHandlerRootView>
// //     </ThemeProvider>
// //   );
// // }


// // import * as SecureStore from 'expo-secure-store';
// // import Colors from "@/constants/Colors";
// // import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // import { Ionicons } from "@expo/vector-icons";
// // import { Link, Stack, useRouter } from "expo-router";
// // import { StatusBar } from "expo-status-bar";
// // import { TouchableOpacity } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { useEffect } from 'react';


// // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// // const tokenCache = {
// //   async getToken(key: string) {
// //     try {
// //       const item = await SecureStore.getItemAsync(key);
// //       if (item) {
// //         console.log(`${key} was used 🔐 \n`);
// //       } else {
// //         console.log("No values stored under key: " + key);
// //       }
// //       return item;
// //     } catch (error) {
// //       console.error("SecureStore get item error: ", error);
// //       await SecureStore.deleteItemAsync(key);
// //       return null;
// //     }
// //   },
// //   async saveToken(key: string, value: string) {
// //     try {
// //       return SecureStore.setItemAsync(key, value);
// //     } catch (err) {
// //       return;
// //     }
// //   },
// // };


// // export default function RootLayout() {
// //   const router = useRouter();

// //   const { isLoaded, isSignedIn } = useAuth();

// //   useEffect(() => {
// //     console.log('isSignedIn', isSignedIn)
// //   }, [isSignedIn])


// //   return (
// //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
// //       <GestureHandlerRootView style={{ flex: 1 }}>
// //         <StatusBar style="light" />
// //         <Stack>
// //           <Stack.Screen name="index" options={{ headerShown: false }} />
// //           <Stack.Screen name="screens/signUp"
// //             options={{
// //               title: "",
// //               headerBackTitle: "",
// //               headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background }
// //             }} />
// //           <Stack.Screen name="screens/login"
// //             options={{
// //               title: "",
// //               headerBackTitle: "",
// //               headerShadowVisible: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //               headerRight: () => (
// //                 <Link href={'/screens/help'} asChild>
// //                   <TouchableOpacity>
// //                     <Ionicons name="help-circle-outline" size={34} color={Colors.dark} />
// //                   </TouchableOpacity>
// //                 </Link>
// //               )
// //             }} />
// //           <Stack.Screen name="screens/help" options={{
// //             title: "Help",
// //             presentation: "modal"
// //           }} />
// //           <Stack.Screen name="verify/[phone]" options={{
// //             title: "",
// //             headerShadowVisible: false,
// //             headerStyle: { backgroundColor: Colors.background }
// //             // presentation: "modal"
// //           }} />
// //         </Stack>
// //       </GestureHandlerRootView>
// //     </ClerkProvider>
// //   );
// // }
