import * as SecureStore from 'expo-secure-store';
import Colors from "@/constants/Colors";
import { ClerkProvider, SignedIn, useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from 'react';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
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
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
      <RootNavigator />
    </ClerkProvider>
  );
}

function RootNavigator() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();


  useEffect(() => {
    console.log('isSignedIn', isSignedIn);
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(authenticated)";

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(authenticated)/(tabs)/home')
    } else if (!SignedIn) {
      router.replace('/')
    }
  }, [isSignedIn]);

  if (!isLoaded) {
    return <ActivityIndicator />
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="screens/signUp"
          options={{
            title: "",
            headerBackTitle: "",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="screens/login"
          options={{
            title: "",
            headerBackTitle: "",
            // headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.background },
            headerRight: () => (
              <Link href={'/screens/help'} asChild>
                <TouchableOpacity>
                  <Ionicons name="help-circle-outline" size={34} color={Colors.dark} />
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
            title: "",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen name='(authenticated)/(tabs)' options={{
          headerShown: false
        }} />
      </Stack>
    </GestureHandlerRootView>
  );
}


// import * as SecureStore from 'expo-secure-store';
// import Colors from "@/constants/Colors";
// import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
// import { Ionicons } from "@expo/vector-icons";
// import { Link, Stack, useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import { TouchableOpacity } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useEffect } from 'react';


// const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       const item = await SecureStore.getItemAsync(key);
//       if (item) {
//         console.log(`${key} was used 🔐 \n`);
//       } else {
//         console.log("No values stored under key: " + key);
//       }
//       return item;
//     } catch (error) {
//       console.error("SecureStore get item error: ", error);
//       await SecureStore.deleteItemAsync(key);
//       return null;
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       return SecureStore.setItemAsync(key, value);
//     } catch (err) {
//       return;
//     }
//   },
// };


// export default function RootLayout() {
//   const router = useRouter();

//   const { isLoaded, isSignedIn } = useAuth();

//   useEffect(() => {
//     console.log('isSignedIn', isSignedIn)
//   }, [isSignedIn])


//   return (
//     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!} tokenCache={tokenCache}>
//       <GestureHandlerRootView style={{ flex: 1 }}>
//         <StatusBar style="light" />
//         <Stack>
//           <Stack.Screen name="index" options={{ headerShown: false }} />
//           <Stack.Screen name="screens/signUp"
//             options={{
//               title: "",
//               headerBackTitle: "",
//               headerShadowVisible: false,
//               headerStyle: { backgroundColor: Colors.background }
//             }} />
//           <Stack.Screen name="screens/login"
//             options={{
//               title: "",
//               headerBackTitle: "",
//               headerShadowVisible: false,
//               headerStyle: { backgroundColor: Colors.background },
//               headerRight: () => (
//                 <Link href={'/screens/help'} asChild>
//                   <TouchableOpacity>
//                     <Ionicons name="help-circle-outline" size={34} color={Colors.dark} />
//                   </TouchableOpacity>
//                 </Link>
//               )
//             }} />
//           <Stack.Screen name="screens/help" options={{
//             title: "Help",
//             presentation: "modal"
//           }} />
//           <Stack.Screen name="verify/[phone]" options={{
//             title: "",
//             headerShadowVisible: false,
//             headerStyle: { backgroundColor: Colors.background }
//             // presentation: "modal"
//           }} />
//         </Stack>
//       </GestureHandlerRootView>
//     </ClerkProvider>
//   );
// }
