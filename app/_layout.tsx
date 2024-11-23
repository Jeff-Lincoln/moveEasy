import * as SecureStore from 'expo-secure-store';
import Colors from "@/constants/Colors";
import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { 
  ActivityIndicator, 
  SafeAreaView, 
  TouchableOpacity, 
  View,
  StyleSheet 
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState, useRef } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import SplashScreenView from './screens/SplashScreenView';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SupabaseProvider } from '@/context/SupabaseContext';
import { Provider } from 'react-redux';
import { store } from './context/store';
import React from 'react';

const CLERK_PUBLISHABLE_KEY: any = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Enhanced token cache with better error handling and logging
const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      console.log(`Token retrieved for key: ${key} 🔐`);
      return item;
    } catch (error) {
      console.error("SecureStore get item error:", error);
      if (error instanceof Error && error.message.includes('corrupt')) {
        await SecureStore.deleteItemAsync(key);
      }
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
      console.log(`Token saved for key: ${key} 💾`);
    } catch (error) {
      console.error("SecureStore save item error:", error);
    }
  },
};

export default function RootLayout() {
  const [isSplash, setIsSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Provider store={store}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <ActionSheetProvider>
            <GestureHandlerRootView style={styles.container}>
              <StatusBar style="light" />
              {isSplash ? <SplashScreenView /> : <AppNavigator />}
            </GestureHandlerRootView>
          </ActionSheetProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </Provider>
  );
}

function AppNavigator() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const navigationAttempted = useRef(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(authenticated)";
    console.log("Auth Status:", { isSignedIn, inAuthGroup, segments });

    const handleNavigation = async () => {
      try {
        if (isSignedIn) {
          // Always navigate to home when signed in, regardless of current route
          console.log("User is signed in, navigating to home...");
          await router.replace('/(authenticated)/(tabs)/Home');
        } else if (!isSignedIn && inAuthGroup) {
          console.log("User is not signed in, navigating to sign-in...");
          await router.replace('/');
        }
      } catch (error) {
        console.error("Navigation error:", error);
      }
    };

    // Handle initial auth check
    if (isInitialAuthCheck) {
      setIsInitialAuthCheck(false);
      handleNavigation();
      return;
    }

    // Handle subsequent auth state changes
    if (!navigationAttempted.current) {
      navigationAttempted.current = true;
      handleNavigation();
    }

    // Reset navigation attempted flag when auth state changes
    return () => {
      navigationAttempted.current = false;
    };
  }, [isSignedIn, isLoaded, segments, isInitialAuthCheck]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SupabaseProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{
          headerStyle: styles.headerStyle,
          headerTintColor: 'green',
        }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="screens/signUp"
            options={{
              headerShown: true,
              headerTitle: "Sign Up",
            }}
          />
          <Stack.Screen
            name="screens/login"
            options={{
              headerShown: true,
              headerTitle: "Login",
              headerRight: () => (
                <Link href={'/screens/help'} asChild>
                  <TouchableOpacity style={styles.helpButton}>
                    <Ionicons 
                      name="help-circle-outline"
                      size={34} 
                      color={colorScheme === 'dark' ? Colors.white : Colors.black} 
                    />
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
            }}
          />
          <Stack.Screen
            name="(authenticated)/(tabs)"
            options={{ headerShown: false }}
          />
        </Stack>
      </ThemeProvider>
    </SupabaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerStyle: {
    backgroundColor: Colors.background,
    elevation: 0,
    shadowOpacity: 0,
  },
  helpButton: {
    padding: 8,
    marginRight: 8,
  },
});



// import * as SecureStore from 'expo-secure-store';
// import Colors from "@/constants/Colors";
// import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// import { Ionicons } from "@expo/vector-icons";
// import { Link, Stack, useRouter, useSegments } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { 
//   ActivityIndicator, 
//   SafeAreaView, 
//   TouchableOpacity, 
//   View,
//   StyleSheet 
// } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useEffect, useState, useRef } from 'react';
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import SplashScreenView from './screens/SplashScreenView';
// import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// import { SupabaseProvider } from '@/context/SupabaseContext';
// import { Provider } from 'react-redux';
// import { store } from './context/store';
// import React from 'react';

// const CLERK_PUBLISHABLE_KEY : any= process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// // Enhanced token cache with better error handling
// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       const item = await SecureStore.getItemAsync(key);
//       console.log(`Token retrieved for key: ${key} 🔐`);
//       return item;
//     } catch (error) {
//       console.error("SecureStore get item error:", error);
//       // Only delete if the error is related to corrupt data
//       if (error instanceof Error && error.message.includes('corrupt')) {
//         await SecureStore.deleteItemAsync(key);
//       }
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       await SecureStore.setItemAsync(key, value);
//       console.log(`Token saved for key: ${key} 💾`);
//     } catch (error) {
//       console.error("SecureStore save item error:", error);
//     }
//   },
// };

// export default function RootLayout() {
//   const [isSplash, setIsSplash] = useState(true);
//   const isInitialMount = useRef(true);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsSplash(false);
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <Provider store={store}>
//       <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
//         <ClerkLoaded>
//           <ActionSheetProvider>
//             <GestureHandlerRootView style={styles.container}>
//               <StatusBar style="light" />
//               {isSplash ? <SplashScreenView /> : <AppNavigator />}
//             </GestureHandlerRootView>
//           </ActionSheetProvider>
//         </ClerkLoaded>
//       </ClerkProvider>
//     </Provider>
//   );
// }

// function AppNavigator() {
//   const router = useRouter();
//   const { isLoaded, isSignedIn } = useAuth();
//   const segments = useSegments();
//   const colorScheme = useColorScheme();
//   const navigationAttempted = useRef(false);

//   useEffect(() => {
//     if (!isLoaded) return;

//     const inAuthGroup = segments[0] === "(authenticated)";
//     console.log("Auth Status:", { isSignedIn, inAuthGroup, segments });

//     // Prevent navigation during initial mount
//     if (!navigationAttempted.current) {
//       navigationAttempted.current = true;
      
//       try {
//         if (isSignedIn && !inAuthGroup) {
//           console.log("Navigating to authenticated route...");
//           router.replace('/(authenticated)/(tabs)/Home');
//         } else if (!isSignedIn && inAuthGroup) {
//           console.log("Navigating to sign-in route...");
//           router.replace('/');
//         }
//       } catch (error) {
//         console.error("Navigation error:", error);
//       }
//     }
//   }, [isSignedIn, isLoaded, segments]);

//   if (!isLoaded) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={Colors.primary} />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SupabaseProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Stack>
//           <Stack.Screen name="index" options={{ headerShown: false }} />
//           <Stack.Screen
//             name="screens/signUp"
//             options={{
//               headerShown: true,
//               headerStyle: styles.headerStyle,
//               headerTintColor: 'green',
//             }}
//           />
//           <Stack.Screen
//             name="screens/login"
//             options={{
//               headerShown: true,
//               headerStyle: styles.headerStyle,
//               headerTintColor: 'green',
//               headerRight: () => (
//                 <Link href={'/screens/help'} asChild>
//                   <TouchableOpacity style={styles.helpButton}>
//                     <Ionicons 
//                       name="help-circle-outline" 
//                       size={34} 
//                       color={colorScheme === 'dark' ? Colors.white : Colors.black} 
//                     />
//                   </TouchableOpacity>
//                 </Link>
//               ),
//             }}
//           />
//           <Stack.Screen
//             name="screens/help"
//             options={{
//               title: "Help",
//               presentation: "modal",
//               headerStyle: styles.headerStyle,
//               headerTintColor: 'green',
//             }}
//           />
//           <Stack.Screen
//             name="verify/[phone]"
//             options={{
//               headerShown: false,
//             }}
//           />
//           <Stack.Screen
//             name="(authenticated)/(tabs)"
//             options={{ headerShown: false }}
//           />
//         </Stack>
//       </ThemeProvider>
//     </SupabaseProvider>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.background,
//   },
//   headerStyle: {
//     backgroundColor: Colors.background,
//     elevation: 0, // Android
//     shadowOpacity: 0, // iOS
//   },
//   helpButton: {
//     padding: 8,
//     marginRight: 8,
//   },
// });



// // import * as SecureStore from 'expo-secure-store';
// // import Colors from "@/constants/Colors";
// // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // import { Ionicons } from "@expo/vector-icons";
// // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // import { StatusBar } from "expo-status-bar";
// // import { ActivityIndicator, SafeAreaView, TouchableOpacity, View } from "react-native";
// // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // import { useEffect, useState } from 'react';
// // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // import { useColorScheme } from '@/hooks/useColorScheme';
// // import SplashScreenView from './screens/SplashScreenView';
// // import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// // import { SupabaseProvider } from '@/context/SupabaseContext';
// // import { Provider } from 'react-redux';
// // import { store } from './context/store';
// // import React from 'react';

// // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// // const tokenCache = {
// //   async getToken(key: string) {
// //     try {
// //       const item = await SecureStore.getItemAsync(key);
// //       console.log(`${key} was used 🔐`);
// //       return item;
// //     } catch (error) {
// //       console.error("SecureStore get item error: ", error);
// //       return null;
// //     }
// //   },
// //   async saveToken(key: string, value: string) {
// //     try {
// //       await SecureStore.setItemAsync(key, value);
// //     } catch (error) {
// //       console.error("SecureStore save item error: ", error);
// //     }
// //   },
// // };

// // export default function RootLayout() {
// //   const [isSplash, setIsSplash] = useState(true);

// //   useEffect(() => {
// //     const timer = setTimeout(() => setIsSplash(false), 3000); // Reduced time for faster testing
// //     return () => clearTimeout(timer);
// //   }, []);

// //   return (
// //     <Provider store={store}>
// //       <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// //         <ClerkLoaded>
// //           <ActionSheetProvider>
// //             <GestureHandlerRootView style={{ flex: 1 }}>
// //               <StatusBar style="light" />
// //               {isSplash ? <SplashScreenView /> : <AppNavigator />}
// //             </GestureHandlerRootView>
// //           </ActionSheetProvider>
// //         </ClerkLoaded>
// //       </ClerkProvider>
// //     </Provider>
// //   );
// // }

// // function AppNavigator() {
// //   const router = useRouter();
// //   const { isLoaded, isSignedIn } = useAuth();
// //   const segments = useSegments();
// //   const colorScheme = useColorScheme();

// //   useEffect(() => {
// //     if (!isLoaded) return;

// //     const inAuthGroup = segments[0] === "(authenticated)";

// //     if (isSignedIn && !inAuthGroup) {
// //       router.replace('/(authenticated)/(tabs)/Home');
// //     } else if (!isSignedIn && inAuthGroup) {
// //       router.replace('/');
// //     }
// //   }, [isSignedIn, isLoaded, segments]);

// //   if (!isLoaded) {
// //     return (
// //       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //         <ActivityIndicator size="large" color="blue" />
// //       </SafeAreaView>
// //     );
// //   }

// //   return (
// //     <SupabaseProvider>
// //       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
// //         <Stack>
// //           <Stack.Screen name="index" options={{ headerShown: false }} />
// //           <Stack.Screen
// //             name="screens/signUp"
// //             options={{
// //               headerShown: true,
// //               headerStyle: { backgroundColor: Colors.background },
// //             }}
// //           />
// //           <Stack.Screen
// //             name="screens/login"
// //             options={{
// //               headerShown: true,
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
// //               headerShown: false,
// //               headerStyle: { backgroundColor: Colors.background },
// //             }}
// //           />
// //           <Stack.Screen
// //             name="(authenticated)/(tabs)"
// //             options={{ headerShown: false }}
// //           />
// //         </Stack>
// //       </ThemeProvider>
// //     </SupabaseProvider>
// //   );
// // }




// // // import * as SecureStore from 'expo-secure-store';
// // // import Colors from "@/constants/Colors";
// // // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // // import { Ionicons } from "@expo/vector-icons";
// // // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // // import { StatusBar } from "expo-status-bar";
// // // import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// // // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // // import { useEffect, useState } from 'react';
// // // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // // import { useColorScheme } from '@/hooks/useColorScheme';
// // // import SplashScreenView from './screens/SplashScreenView';
// // // import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// // // import { SupabaseProvider } from '@/context/SupabaseContext';
// // // import { Provider } from 'react-redux';
// // // import { store } from './context/store';
// // // import React from 'react';

// // // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// // // const tokenCache = {
// // //   async getToken(key: string) {
// // //     try {
// // //       const item = await SecureStore.getItemAsync(key);
// // //       console.log(`${key} was used 🔐`);
// // //       return item;
// // //     } catch (error) {
// // //       console.error("SecureStore get item error: ", error);
// // //       await SecureStore.deleteItemAsync(key);
// // //       return null;
// // //     }
// // //   },
// // //   async saveToken(key: string, value: string) {
// // //     try {
// // //       await SecureStore.setItemAsync(key, value);
// // //     } catch (err) {
// // //       console.error("SecureStore save item error: ", err);
// // //     }
// // //   },
// // // };

// // // export default function RootLayout() {
// // //   const [isSplash, setIsSplash] = useState(true);

// // //   useEffect(() => {
// // //     const timer = setTimeout(() => {
// // //       setIsSplash(false);
// // //     }, 5000);

// // //     return () => clearTimeout(timer); // Clean up the timer on unmount
// // //   }, []);

// // //   return (
// // //     <Provider store={store}>
// // //       <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// // //         <ClerkLoaded>
// // //           <ActionSheetProvider>
// // //             <GestureHandlerRootView style={{ flex: 1 }}>
// // //               <StatusBar style="light" />
// // //               {isSplash ? <SplashScreenView /> : <RootNavigator />}
// // //             </GestureHandlerRootView>
// // //           </ActionSheetProvider>
// // //         </ClerkLoaded>
// // //       </ClerkProvider>
// // //     </Provider>
// // //   );
// // // }

// // // function RootNavigator() {
// // //   const router = useRouter();
// // //   const { isLoaded, isSignedIn } = useAuth();
// // //   const segments = useSegments();
// // //   const colorScheme = useColorScheme();

// // //   useEffect(() => {
// // //     if (!isLoaded) return;

// // //     const inAuthGroup = segments[0] === "(authenticated)";

// // //     if (isSignedIn && !inAuthGroup) {
// // //       router.replace('/(authenticated)/(tabs)/Home');
// // //     } else if (!isSignedIn && inAuthGroup) {
// // //       router.replace('/');
// // //     }
// // //   }, [isSignedIn, isLoaded, segments]);

// // //   if (!isLoaded) {
// // //     return (
// // //       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// // //         <ActivityIndicator size="large" color="blue" />
// // //       </SafeAreaView>
// // //     );
// // //   }

// // //   return (
// // //     <SupabaseProvider>
// // //       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
// // //         <Stack>
// // //           <Stack.Screen name="index" options={{ headerShown: false }} />
// // //           <Stack.Screen
// // //             name="screens/signUp"
// // //             options={{
// // //               headerShown: true,
// // //               headerStyle: { backgroundColor: Colors.background },
// // //             }}
// // //           />
// // //           <Stack.Screen
// // //             name="screens/login"
// // //             options={{
// // //               headerShown: true,
// // //               headerStyle: { backgroundColor: Colors.background },
// // //               headerRight: () => (
// // //                 <Link href={'/screens/help'} asChild>
// // //                   <TouchableOpacity>
// // //                     <Ionicons name="help-circle-outline" size={34} color="#000" />
// // //                   </TouchableOpacity>
// // //                 </Link>
// // //               ),
// // //             }}
// // //           />
// // //           <Stack.Screen
// // //             name="screens/help"
// // //             options={{
// // //               title: "Help",
// // //               presentation: "modal",
// // //             }}
// // //           />
// // //           <Stack.Screen
// // //             name="verify/[phone]"
// // //             options={{
// // //               headerShown: false,
// // //               headerStyle: { backgroundColor: Colors.background },
// // //             }}
// // //           />
// // //           <Stack.Screen
// // //             name="(authenticated)/(tabs)"
// // //             options={{ headerShown: false }}
// // //           />
// // //         </Stack>
// // //       </ThemeProvider>
// // //     </SupabaseProvider>
// // //   );
// // // }



// // // // import * as SecureStore from 'expo-secure-store';
// // // // import Colors from "@/constants/Colors";
// // // // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // // // import { Ionicons } from "@expo/vector-icons";
// // // // import { Link, Redirect, Stack, useRouter, useSegments } from "expo-router";
// // // // import { StatusBar } from "expo-status-bar";
// // // // import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// // // // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // // // import { useEffect, useState } from 'react';
// // // // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // // // import { useColorScheme } from '@/hooks/useColorScheme';
// // // // import SplashScreenView from './screens/SplashScreenView';
// // // // import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// // // // import { SupabaseProvider } from '@/context/SupabaseContext'
// // // // import { Provider } from 'react-redux';
// // // // import { store } from './context/store';
// // // // import React from 'react';


// // // // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// // // // const tokenCache = {
// // // //   async getToken(key: string) {
// // // //     try {
// // // //       const item = await SecureStore.getItemAsync(key);
// // // //       console.log(`${key} was used 🔐 \n`);
// // // //       return item;
// // // //     } catch (error) {
// // // //       console.error("SecureStore get item error: ", error);
// // // //       await SecureStore.deleteItemAsync(key);
// // // //       return null;
// // // //     }
// // // //   },
// // // //   async saveToken(key: string, value: string) {
// // // //     try {
// // // //       await SecureStore.setItemAsync(key, value);
// // // //     } catch (err) {
// // // //       console.error("SecureStore save item error: ", err);
// // // //     }
// // // //   },
// // // // };

// // // // export default function RootLayout() {
// // // //   const [isSplash, setIsSplash] = useState(true);

// // // //   useEffect(() => {
// // // //     const timer = setTimeout(() => {
// // // //       setIsSplash(false);
// // // //     }, 5000);

// // // //     return () => clearTimeout(timer); // Clean up the timer on unmount
// // // //   }, []);

// // // //   return (
// // // //     <Provider store={store}>
// // // //       <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// // // //       <ClerkLoaded>
// // // //         <ActionSheetProvider>
// // // //           <>
// // // //             <StatusBar style='light' />
// // // //             <GestureHandlerRootView style={{ flex: 1 }}>
// // // //               {isSplash ? <SplashScreenView /> : <RootNavigator />}
// // // //             </GestureHandlerRootView>
// // // //           </>
// // // //         </ActionSheetProvider>
// // // //       </ClerkLoaded>
// // // //     </ClerkProvider>
// // // //     </Provider>
// // // //   );
// // // // }

// // // // function RootNavigator() {
// // // //   const router = useRouter();
// // // //   const { isLoaded, isSignedIn } = useAuth();
// // // //   const segments = useSegments();
// // // //   const colorScheme = useColorScheme();

// // // //   useEffect(() => {
// // // //     if (!isLoaded) return;

// // // //     const inAuthGroup = segments[0] === "(authenticated)";

// // // //     if (isSignedIn && !inAuthGroup) {
// // // //       router.replace('/(authenticated)/(tabs)/Home' as const);
// // // //     } else if (!isSignedIn) {
// // // //       router.replace('/' as const);
// // // //     }
// // // //   }, [isSignedIn, isLoaded,]);

// // // //   if (!isLoaded) {
// // // //       return (
// // // //        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// // // //         <ActivityIndicator size="large" color="blue" />
// // // //              <SplashScreenView />
// // // //         </SafeAreaView>
// // // //     );
// // // //   }
// // // //     useEffect(() => {
// // // //     console.log('isSignedIn', isSignedIn)
// // // //   }, [isSignedIn])

// // // //   return (
// // // //     <SupabaseProvider>
// // // //       <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DarkTheme}>
// // // //           <Stack>
// // // //             <Stack.Screen name="index" options={{ headerShown: false }} />
// // // //             <Stack.Screen
// // // //               name="screens/signUp"
// // // //               options={{
// // // //                 headerShown: true,
// // // //                 headerStyle: { backgroundColor: Colors.background },
// // // //               }}
// // // //             />
// // // //             <Stack.Screen
// // // //               name="screens/login"
// // // //               options={{
// // // //                 headerShown: true,
// // // //                 headerStyle: { backgroundColor: Colors.background },
// // // //                 headerRight: () => (
// // // //                   <Link href={'/screens/help'} asChild>
// // // //                     <TouchableOpacity>
// // // //                       <Ionicons name="help-circle-outline" size={34} color="#000" />
// // // //                     </TouchableOpacity>
// // // //                   </Link>
// // // //                 ),
// // // //               }}
// // // //             />
// // // //             <Stack.Screen
// // // //               name="screens/help"
// // // //               options={{
// // // //                 title: "Help",
// // // //                 presentation: "modal",
// // // //               }}
// // // //             />
// // // //             <Stack.Screen
// // // //               name="verify/[phone]"
// // // //               options={{
// // // //                 headerShown: false,
// // // //                 headerStyle: { backgroundColor: Colors.background },
// // // //               }}
// // // //             />
// // // //             <Stack.Screen
// // // //               name='(authenticated)/(tabs)'
// // // //               options={{ headerShown: false }}
// // // //             />
// // // //           </Stack>
// // // //       </ThemeProvider>
// // // //     </SupabaseProvider>
// // // //   );
// // // // }





// // // // // import * as SecureStore from 'expo-secure-store';
// // // // // import Colors from "@/constants/Colors";
// // // // // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // // // // import { Ionicons } from "@expo/vector-icons";
// // // // // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // // // // import { StatusBar } from "expo-status-bar";
// // // // // import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// // // // // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // // // // import { useEffect, useLayoutEffect, useState } from 'react';
// // // // // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // // // // import { useColorScheme } from '@/hooks/useColorScheme';
// // // // // import SplashScreenView from './screens/SplashScreenView';
// // // // // import { ActionSheetProvider } from '@expo/react-native-action-sheet';
// // // // // import { SupabaseProvider } from '@/context/SupabaseContext'


// // // // // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// // // // // const tokenCache = {
// // // // //   async getToken(key: string) {
// // // // //     try {
// // // // //       const item = await SecureStore.getItemAsync(key);
// // // // //       console.log(`${key} was used 🔐 \n`);
// // // // //       return item;
// // // // //     } catch (error) {
// // // // //       console.error("SecureStore get item error: ", error);
// // // // //       await SecureStore.deleteItemAsync(key);
// // // // //       return null;
// // // // //     }
// // // // //   },
// // // // //   async saveToken(key: string, value: string) {
// // // // //     try {
// // // // //       await SecureStore.setItemAsync(key, value);
// // // // //     } catch (err) {
// // // // //       console.error("SecureStore save item error: ", err);
// // // // //     }
// // // // //   },
// // // // // };

// // // // // export default function RootLayout() {
// // // // //   const [isSplash, setIsSplash] = useState(true);

// // // // //   useEffect(() => {
// // // // //     const timer = setTimeout(() => {
// // // // //       setIsSplash(false);
// // // // //     }, 5000);

// // // // //     return () => clearTimeout(timer); // Clean up the timer on unmount
// // // // //   }, []);

// // // // //   return (
// // // // //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// // // // //       <ClerkLoaded>
// // // // //         <ActionSheetProvider>
// // // // //           <>
// // // // //             <StatusBar style='light' />
// // // // //             <GestureHandlerRootView style={{ flex: 1 }}>
// // // // //               {isSplash ? <SplashScreenView /> : <RootNavigator />}
// // // // //             </GestureHandlerRootView>
// // // // //           </>
// // // // //         </ActionSheetProvider>
// // // // //       </ClerkLoaded>
// // // // //     </ClerkProvider>
// // // // //   );
// // // // // }

// // // // // function RootNavigator() {
// // // // //   const router = useRouter();
// // // // //   const { isLoaded, isSignedIn } = useAuth();
// // // // //   const segments = useSegments();
// // // // //   const colorScheme = useColorScheme();

// // // // //   useEffect(() => {
// // // // //     if (!isLoaded) return;

// // // // //     const inAuthGroup = segments[0] === "(authenticated)";

// // // // //     if (isSignedIn && !inAuthGroup) {
// // // // //       router.replace('/(authenticated)/(tabs)/Home');
// // // // //     } else if (!isSignedIn) {
// // // // //       router.replace('/');
// // // // //     }
// // // // //   }, [isSignedIn]);
// // // // //   // useLayoutEffect(() => {
// // // // //   //   if (!isLoaded) {
// // // // //   //     return (
// // // // //   //       <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// // // // //   //         <ActivityIndicator size="large" color={Colors.gray} />
// // // // //   //         <SplashScreenView />
// // // // //   //         {/* <Text style={{ color: 'Blue'}}>Loading...</Text> */}
// // // // //   //       </SafeAreaView>
// // // // //   //     );
// // // // //   //   }
// // // // //   //   }, [isLoaded])

// // // // //   // useEffect(() => {
// // // // //   //   if (!isLoaded) return;

// // // // //   //   const inAuthGroup = segments[0] === "(authenticated)";

// // // // //   //   if (isSignedIn && !inAuthGroup) {
// // // // //   //     router.replace('/(authenticated)/(tabs)/Home');
// // // // //   //   } else if (!isSignedIn) {
// // // // //   //     router.replace('/');
// // // // //   //   }
// // // // //   //
// // // // //   // }, [isSignedIn, isLoaded]);
// // // // //   if (!isLoaded) {
// // // // //       return (
// // // // //        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// // // // //         <ActivityIndicator size="large" color={Colors.gray} />
// // // // //              <SplashScreenView />
// // // // //             {/* <Text style={{ color: 'Blue'}}>Loading...</Text> */}
// // // // //         </SafeAreaView>
// // // // //     );
// // // // //     }

// // // // //   return (
// // // // //     <SupabaseProvider>
// // // // //       <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DarkTheme}>
// // // // //           {/* <StatusBar style={colorScheme === 'light' ? "dark" : "light"} /> */}
// // // // //           <Stack>
// // // // //             <Stack.Screen name="index" options={{ headerShown: false }} />
// // // // //             <Stack.Screen
// // // // //               name="screens/signUp"
// // // // //               options={{
// // // // //                 headerShown: true,
// // // // //                 headerStyle: { backgroundColor: Colors.background },
// // // // //               }}
// // // // //             />
// // // // //             <Stack.Screen
// // // // //               name="screens/login"
// // // // //               options={{
// // // // //                 headerShown: true,
// // // // //                 headerStyle: { backgroundColor: Colors.background },
// // // // //                 headerRight: () => (
// // // // //                   <Link href={'/screens/help'} asChild>
// // // // //                     <TouchableOpacity>
// // // // //                       <Ionicons name="help-circle-outline" size={34} color="#000" />
// // // // //                     </TouchableOpacity>
// // // // //                   </Link>
// // // // //                 ),
// // // // //               }}
// // // // //             />
// // // // //             <Stack.Screen
// // // // //               name="screens/help"
// // // // //               options={{
// // // // //                 title: "Help",
// // // // //                 presentation: "modal",
// // // // //               }}
// // // // //             />
// // // // //             <Stack.Screen
// // // // //               name="verify/[phone]"
// // // // //               options={{
// // // // //                 headerShown: false,
// // // // //                 headerStyle: { backgroundColor: Colors.background },
// // // // //               }}
// // // // //             />
// // // // //             <Stack.Screen
// // // // //               name='(authenticated)/(tabs)'
// // // // //               options={{ headerShown: false }}
// // // // //             />
// // // // //           </Stack>
// // // // //       </ThemeProvider>
// // // // //     </SupabaseProvider>
// // // // //   );
// // // // // }


// // // // // import * as SecureStore from 'expo-secure-store';
// // // // // import Colors from "@/constants/Colors";
// // // // // import { ClerkLoaded, ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // // // // import { Ionicons } from "@expo/vector-icons";
// // // // // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // // // // import { StatusBar } from "expo-status-bar";
// // // // // import { ActivityIndicator, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
// // // // // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // // // // import { useEffect, useState } from 'react';
// // // // // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // // // // import { useColorScheme } from '@/hooks/useColorScheme';
// // // // // import SplashScreenView from './screens/SplashScreenView';


// // // // // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// // // // // const tokenCache = {
// // // // //   async getToken(key: string) {
// // // // //     try {
// // // // //       const item = await SecureStore.getItemAsync(key);
// // // // //       if (item) {
// // // // //         console.log(`${key} was used 🔐 \n`);
// // // // //       } else {
// // // // //         console.log("No values stored under key: " + key);
// // // // //       }
// // // // //       return item;
// // // // //     } catch (error) {
// // // // //       console.error("SecureStore get item error: ", error);
// // // // //       await SecureStore.deleteItemAsync(key);
// // // // //       return null;
// // // // //     }
// // // // //   },
// // // // //   async saveToken(key: string, value: string) {
// // // // //     try {
// // // // //       await SecureStore.setItemAsync(key, value);
// // // // //     } catch (err) {
// // // // //       console.error("SecureStore save item error: ", err);
// // // // //     }
// // // // //   },
// // // // // };

// // // // // export default function RootLayout() {
// // // // //   const [isSplash, SetIsSplash] = useState(true);
// // // // //   useEffect(() => {
// // // // //     setTimeout(() => {
// // // // //       SetIsSplash(false);
// // // // //     }, 3000);
// // // // //   }, []);

// // // // //   return (
// // // // //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
// // // // //       {isSplash ? (
// // // // //         <SplashScreenView />
// // // // //       ) : (
// // // // //         <RootNavigator />
// // // // //       )}
// // // // //     </ClerkProvider>

// // // // //   );
// // // // // }

// // // // // function RootNavigator() {
// // // // //   const router = useRouter();
// // // // //   const { isLoaded, isSignedIn } = useAuth();
// // // // //   const segments = useSegments();
// // // // //   const colorScheme = useColorScheme();


// // // // //   useEffect(() => {
// // // // //     console.log('isSignedIn', isSignedIn);
// // // // //     if (!isLoaded) return;

// // // // //     const inAuthGroup = segments[0] === "(authenticated)";

// // // // //     if (isSignedIn && !inAuthGroup) {
// // // // //       router.replace('/(authenticated)/(tabs)/Home');
// // // // //     } else if (!isSignedIn) {
// // // // //       router.replace('/(authenticated)/(tabs)/Home');
// // // // //     }
// // // // //   }, [isSignedIn, isLoaded]);

// // // // //   if (!isLoaded) {
// // // // //     return (
// // // // //       <SplashScreenView />
// // // // //       // <View style={{
// // // // //       //   flex: 1,
// // // // //       //   justifyContent: 'center',
// // // // //       //   alignItems: 'center',
// // // // //       //   backgroundColor: '#F5F5F5',
// // // // //       // }}>
// // // // //       //   <ActivityIndicator size="large" color='blue' />
// // // // //       //   <Text>Loading</Text>
// // // // //       // </View>
// // // // //     );
// // // // //   }
// // // // //   return (
// // // // //     <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
// // // // //       <GestureHandlerRootView style={{ flex: 1 }}>
// // // // //         <StatusBar style="light" />
// // // // //         <Stack>
// // // // //           <Stack.Screen name="index" options={{ headerShown: false }} />
// // // // //           <Stack.Screen
// // // // //             name="screens/signUp"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerBackTitle: "",
// // // // //               headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name="screens/login"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerBackTitle: "",
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //               headerRight: () => (
// // // // //                 <Link href={'/screens/help'} asChild>
// // // // //                   <TouchableOpacity>
// // // // //                     <Ionicons name="help-circle-outline" size={34} color="#000" />
// // // // //                   </TouchableOpacity>
// // // // //                 </Link>
// // // // //               ),
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name="screens/help"
// // // // //             options={{
// // // // //               title: "Help",
// // // // //               presentation: "modal",
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name="verify/[phone]"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name='(authenticated)/(tabs)'
// // // // //             options={{ headerShown: false }}
// // // // //           />
// // // // //         </Stack>
// // // // //       </GestureHandlerRootView>
// // // // //     </ThemeProvider>
// // // // //   );
// // // // // }



// // // // // import * as SecureStore from 'expo-secure-store';
// // // // // import Colors from "@/constants/Colors";
// // // // // import { ClerkProvider, SignedIn, useAuth } from "@clerk/clerk-expo";
// // // // // import { Ionicons } from "@expo/vector-icons";
// // // // // import { Link, Stack, useRouter, useSegments } from "expo-router";
// // // // // import { StatusBar } from "expo-status-bar";
// // // // // import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
// // // // // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // // // // import { useEffect } from 'react';
// // // // // import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// // // // // import loading from '@/assets/images/loading.jpeg'

// // // // // import { useColorScheme } from '@/hooks/useColorScheme';


// // // // // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// // // // // const tokenCache = {
// // // // //   async getToken(key: string) {
// // // // //     try {
// // // // //       const item = await SecureStore.getItemAsync(key);
// // // // //       if (item) {
// // // // //         console.log(`${key} was used 🔐 \n`);
// // // // //       } else {
// // // // //         console.log("No values stored under key: " + key);
// // // // //       }
// // // // //       return item;
// // // // //     } catch (error) {
// // // // //       console.error("SecureStore get item error: ", error);
// // // // //       await SecureStore.deleteItemAsync(key);
// // // // //       return null;
// // // // //     }
// // // // //   },
// // // // //   async saveToken(key: string, value: string) {
// // // // //     try {
// // // // //       await SecureStore.setItemAsync(key, value);
// // // // //     } catch (err) {
// // // // //       console.error("SecureStore save item error: ", err);
// // // // //     }
// // // // //   },
// // // // // };

// // // // // export default function RootLayout() {
// // // // //   return (
// // // // //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
// // // // //       <RootNavigator />
// // // // //     </ClerkProvider>
// // // // //   );
// // // // // }

// // // // // function RootNavigator() {
// // // // //   const router = useRouter();
// // // // //   const { isLoaded, isSignedIn } = useAuth();
// // // // //   const segments = useSegments();
// // // // //   const colorScheme = useColorScheme();


// // // // //   useEffect(() => {
// // // // //     console.log('isSignedIn', isSignedIn);
// // // // //     if (!isLoaded) return;

// // // // //     const inAuthGroup = segments[0] === "(authenticated)";

// // // // //     if (isSignedIn && !inAuthGroup) {
// // // // //       router.replace('/(authenticated)/(tabs)/home')
// // // // //     } else if (!SignedIn) {
// // // // //       router.replace('/')
// // // // //     }
// // // // //   }, [isSignedIn]);

// // // // //   if (!isLoaded) {
// // // // //     return <View>
// // // // //       <Image
// // // // //         style={{ flex: 1, width: '100%', height: '100%' }}
// // // // //         source={}
// // // // //       />
// // // // //     </View>
// // // // //   }

// // // // //   return (
// // // // //     <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
// // // // //       <GestureHandlerRootView style={{ flex: 1 }}>
// // // // //         <StatusBar style="dark" />
// // // // //         <Stack>
// // // // //           <Stack.Screen name="index" options={{ headerShown: false }} />
// // // // //           <Stack.Screen
// // // // //             name="screens/signUp"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerBackTitle: "",
// // // // //               headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name="screens/login"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerBackTitle: "",
// // // // //               // headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //               headerRight: () => (
// // // // //                 <Link href={'/screens/help'} asChild>
// // // // //                   <TouchableOpacity>
// // // // //                     <Ionicons name="help-circle-outline" size={34} color={Colors.dark} />
// // // // //                   </TouchableOpacity>
// // // // //                 </Link>
// // // // //               ),
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name="screens/help"
// // // // //             options={{
// // // // //               title: "Help",
// // // // //               presentation: "modal",
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen
// // // // //             name="verify/[phone]"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //             }}
// // // // //           />
// // // // //           <Stack.Screen name='(authenticated)/(tabs)' options={{
// // // // //             headerShown: false
// // // // //           }} />
// // // // //         </Stack>
// // // // //       </GestureHandlerRootView>
// // // // //     </ThemeProvider>
// // // // //   );
// // // // // }


// // // // // import * as SecureStore from 'expo-secure-store';
// // // // // import Colors from "@/constants/Colors";
// // // // // import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
// // // // // import { Ionicons } from "@expo/vector-icons";
// // // // // import { Link, Stack, useRouter } from "expo-router";
// // // // // import { StatusBar } from "expo-status-bar";
// // // // // import { TouchableOpacity } from "react-native";
// // // // // import { GestureHandlerRootView } from "react-native-gesture-handler";
// // // // // import { useEffect } from 'react';


// // // // // const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// // // // // const tokenCache = {
// // // // //   async getToken(key: string) {
// // // // //     try {
// // // // //       const item = await SecureStore.getItemAsync(key);
// // // // //       if (item) {
// // // // //         console.log(`${key} was used 🔐 \n`);
// // // // //       } else {
// // // // //         console.log("No values stored under key: " + key);
// // // // //       }
// // // // //       return item;
// // // // //     } catch (error) {
// // // // //       console.error("SecureStore get item error: ", error);
// // // // //       await SecureStore.deleteItemAsync(key);
// // // // //       return null;
// // // // //     }
// // // // //   },
// // // // //   async saveToken(key: string, value: string) {
// // // // //     try {
// // // // //       return SecureStore.setItemAsync(key, value);
// // // // //     } catch (err) {
// // // // //       return;
// // // // //     }
// // // // //   },
// // // // // };


// // // // // export default function RootLayout() {
// // // // //   const router = useRouter();

// // // // //   const { isLoaded, isSignedIn } = useAuth();

// // // // //   useEffect(() => {
// // // // //     console.log('isSignedIn', isSignedIn)
// // // // //   }, [isSignedIn])


// // // // //   return (
// // // // //     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
// // // // //       <GestureHandlerRootView style={{ flex: 1 }}>
// // // // //         <StatusBar style="light" />
// // // // //         <Stack>
// // // // //           <Stack.Screen name="index" options={{ headerShown: false }} />
// // // // //           <Stack.Screen name="screens/signUp"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerBackTitle: "",
// // // // //               headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background }
// // // // //             }} />
// // // // //           <Stack.Screen name="screens/login"
// // // // //             options={{
// // // // //               title: "",
// // // // //               headerBackTitle: "",
// // // // //               headerShadowVisible: false,
// // // // //               headerStyle: { backgroundColor: Colors.background },
// // // // //               headerRight: () => (
// // // // //                 <Link href={'/screens/help'} asChild>
// // // // //                   <TouchableOpacity>
// // // // //                     <Ionicons name="help-circle-outline" size={34} color={Colors.dark} />
// // // // //                   </TouchableOpacity>
// // // // //                 </Link>
// // // // //               )
// // // // //             }} />
// // // // //           <Stack.Screen name="screens/help" options={{
// // // // //             title: "Help",
// // // // //             presentation: "modal"
// // // // //           }} />
// // // // //           <Stack.Screen name="verify/[phone]" options={{
// // // // //             title: "",
// // // // //             headerShadowVisible: false,
// // // // //             headerStyle: { backgroundColor: Colors.background }
// // // // //             // presentation: "modal"
// // // // //           }} />
// // // // //         </Stack>
// // // // //       </GestureHandlerRootView>
// // // // //     </ClerkProvider>
// // // // //   );
// // // // // }
